import { GroundStation } from '@app/assets/ground-station/ground-station';
import { AlarmStatus } from '@app/equipment/base-equipment';
import { describeEsN0, describeEsN0ForAcquisition } from '@app/equipment/receiver/rx-signal-quality';
import { EventBus } from '@app/events/event-bus';
import { AggregatedAlarm, AlarmStateChangedData, Events } from '@app/events/events';
import { SimClock } from '@app/simulation/sim-clock';
import { getSimulatedNowMs } from '@app/simulation/sim-time';
import { SimulationManager } from '@app/simulation/simulation-manager';
import { Milliseconds } from 'ootk';

/**
 * An alarm with a fixed label and a live value beside it: `message` names
 * the alarm for its whole life, `detail` carries the number that moves
 * (Dashboard detail text, ticker tooltip)
 */
export interface AlarmWithDetail extends AggregatedAlarm {
  detail?: string;
}

/**
 * AlarmService - Centralized alarm aggregation service
 *
 * Polls all equipment for alarms every second and emits ALARM_STATE_CHANGED
 * with EVERY active alarm, most severe first, when the set changes. The ticker
 * used to get only the highest tier, so a warning hid behind an error and an
 * info entry vanished whenever a warning was up (nats-r4-s16-F1, s17-F3).
 *
 * Each alarm carries the station-clock time it was raised (first seen by the
 * service), kept for its whole life, so the Dashboard stamps the raise time
 * rather than the moment the list was first rendered (nats-r4-s01-F2).
 */
export class AlarmService {
  private static instance_: AlarmService | null = null;
  private previousAlarmsHash_ = '';
  private lastPollTime_ = -Infinity;
  private readonly pollInterval_ = 1000; // 1 second
  /**
   * Run time the service started counting from: no poll until
   * STARTUP_SETTLE_MS after it (Phase 31 D2, nats-r6-s01-F1), so the store
   * and checkpoint sync and the RF chain's first settled frames come before
   * the first alarm set, and no raise/clear pair is written at scenario start
   */
  private settleFromRunMs_: number;
  /** Run time the service waits before its first poll, ms */
  static readonly STARTUP_SETTLE_MS = 1000;
  private readonly boundOnUpdate_: (dt: Milliseconds) => void;
  /** Station-clock ms each live alarm was first seen, by raiseKey_ */
  private static readonly raisedAtMs_ = new Map<string, number>();

  private constructor() {
    this.settleFromRunMs_ = SimClock.runMs();
    this.boundOnUpdate_ = this.onUpdate_.bind(this);
    EventBus.getInstance().on(Events.UPDATE, this.boundOnUpdate_);
  }

  static getInstance(): AlarmService {
    if (!AlarmService.instance_) {
      AlarmService.instance_ = new AlarmService();
    }
    return AlarmService.instance_;
  }

  private onUpdate_(_dt: Milliseconds): void {
    const now = SimClock.runMs();
    // Run time restarts at 0 each scenario, so a later stamp is from an
    // earlier run: settle again from the new start
    if (now < this.settleFromRunMs_ || now < this.lastPollTime_) {
      this.settleFromRunMs_ = now;
      this.lastPollTime_ = -Infinity;
    }
    if (now - this.settleFromRunMs_ < AlarmService.STARTUP_SETTLE_MS) return;
    if (now - this.lastPollTime_ < this.pollInterval_) return;
    this.lastPollTime_ = now;
    this.pollAndAggregate_();
  }

  private pollAndAggregate_(): void {
    const alarms: AlarmWithDetail[] = [];
    const sim = SimulationManager.getInstance();

    for (const gs of sim.groundStations) {
      alarms.push(...AlarmService.collectGroundStationAlarms_(gs));
    }

    // Future: for (const sat of sim.satellites) { ... }

    // The poll sees every station, so an alarm missing here has cleared:
    // forget its raise time, so a re-raise stamps afresh
    AlarmService.stampRaisedAt_(alarms, true);
    this.emitIfChanged_(AlarmService.sortBySeverity_(alarms));
  }

  /**
   * Identity of one alarm for its raise time: station, equipment and the text
   * with its live numbers masked, so "BUC over-temperature (72.3 °C)" is the
   * same alarm at 72.0 °C
   */
  private static raiseKey_(alarm: AggregatedAlarm): string {
    return `${alarm.assetId}|${alarm.equipmentType}|${alarm.equipmentIndex}|${alarm.message.replace(/-?\d+(?:\.\d+)?/gu, '#')}`;
  }

  /**
   * Set `raisedAtMs` on each alarm: the station-clock time it was first seen.
   * @param prune true when `alarms` is every station's full set (the poll)
   */
  private static stampRaisedAt_(alarms: AggregatedAlarm[], prune: boolean): void {
    const nowMs = getSimulatedNowMs();
    const seen = new Set<string>();
    for (const alarm of alarms) {
      const key = AlarmService.raiseKey_(alarm);
      seen.add(key);
      const raisedAtMs = AlarmService.raisedAtMs_.get(key) ?? nowMs;
      AlarmService.raisedAtMs_.set(key, raisedAtMs);
      alarm.raisedAtMs = raisedAtMs;
    }
    if (!prune) return;
    for (const key of [...AlarmService.raisedAtMs_.keys()]) {
      if (!seen.has(key)) AlarmService.raisedAtMs_.delete(key);
    }
  }

  /**
   * Every displayable alarm (error, warning, info) for one station, most
   * severe first, unfiltered by the ticker's highest-tier rule. Built from the
   * same module getStatusAlarms() the ticker polls, so the Dashboard alarm
   * list and its Quick Stats count agree with the ticker for that station
   * (s08-F2, s16-F2, s17-F2, s23-F2). A non-operational station has none,
   * as on the ticker.
   * @param station the ground station, or its state.id
   */
  static getAlarms(station: GroundStation | string): AlarmWithDetail[] {
    const gs = typeof station === 'string' ? SimulationManager.getInstance().groundStations.find((g) => g.state.id === station) : station;
    if (!gs) return [];
    const alarms = AlarmService.collectGroundStationAlarms_(gs);
    AlarmService.stampRaisedAt_(alarms, false);
    return AlarmService.sortBySeverity_(alarms);
  }

  /** Stable sort: error, warning, info (success last; never collected). */
  private static sortBySeverity_<T extends AggregatedAlarm>(alarms: T[]): T[] {
    const rank: Record<AggregatedAlarm['severity'], number> = { error: 0, warning: 1, info: 2, success: 3 };
    return alarms
      .map((alarm, index) => ({ alarm, index }))
      .sort((a, b) => rank[a.alarm.severity] - rank[b.alarm.severity] || a.index - b.index)
      .map(({ alarm }) => alarm);
  }

  private static collectGroundStationAlarms_(gs: GroundStation): AlarmWithDetail[] {
    // Skip non-operational locations
    if (!gs.state.isOperational) return [];

    const alarms: AlarmWithDetail[] = [];
    const assetId = gs.state.id;

    // Antennas
    gs.antennas.forEach((antenna, idx) => {
      for (const alarm of antenna.getStatusAlarms()) {
        if (AlarmService.isDisplayableAlarm_(alarm)) {
          alarms.push({
            severity: alarm.severity as AggregatedAlarm['severity'],
            message: alarm.message,
            assetId,
            equipmentType: 'ANT',
            equipmentIndex: idx,
          });
        }
      }
    });

    // RF Front Ends
    gs.rfFrontEnds.forEach((rfFe, idx) => {
      for (const rfCase of [1, 2]) {
        for (const alarm of rfFe.getStatusAlarms(rfCase)) {
          if (AlarmService.isDisplayableAlarm_(alarm)) {
            alarms.push({
              severity: alarm.severity as AggregatedAlarm['severity'],
              message: alarm.message,
              assetId,
              equipmentType: 'RF',
              equipmentIndex: idx,
            });
          }
        }
      }
    });

    // Transmitters
    gs.transmitters.forEach((tx, idx) => {
      for (const alarm of tx.getStatusAlarms()) {
        if (AlarmService.isDisplayableAlarm_(alarm)) {
          alarms.push({
            severity: alarm.severity as AggregatedAlarm['severity'],
            message: alarm.message,
            assetId,
            equipmentType: 'TX',
            equipmentIndex: idx,
          });
        }
      }
    });

    // Receivers
    gs.receivers.forEach((rx, idx) => {
      for (const alarm of rx.getStatusAlarms()) {
        if (AlarmService.isDisplayableAlarm_(alarm)) {
          alarms.push({
            severity: alarm.severity as AggregatedAlarm['severity'],
            message: alarm.message,
            assetId,
            equipmentType: 'RX',
            equipmentIndex: idx,
          });
        }
      }
      for (const rxAlarm of AlarmService.modemLockAlarms_(rx)) {
        alarms.push({ ...rxAlarm, assetId, equipmentType: 'RX', equipmentIndex: idx });
      }
    });

    return alarms.map(AlarmService.fixLabel_);
  }

  /**
   * The receiver's modem alarms, each one alarm per receiver with every
   * affected modem in the detail:
   * - "Degraded margin" (warning) for a powered modem locked with less than
   *   1 dB of Es/N0 over Required (nats-r5-s05-F1). Uses the lock tracker's
   *   own low-margin flag, so it raises below 1.0 dB of margin and clears at
   *   1.5 dB, the same hysteresis as the modem's status bar.
   * - "Carrier lock lost" (error) for a powered modem that had lock on its
   *   current tuning and has dropped it (Phase 31 D1, nats-r6-s17-F1): up from
   *   the loss until it relocks, is retuned or is powered off, so the board
   *   reads Degraded -> Lock lost -> (Degraded) -> clean as a fade comes and
   *   goes. A modem that never had lock raises nothing.
   * Labels are fixed for their life; the live Es/N0 rides in the detail.
   */
  private static modemLockAlarms_(rx: GroundStation['receivers'][number]): Pick<AlarmWithDetail, 'severity' | 'message' | 'detail'>[] {
    const modems = rx.state?.modems ?? [];
    if (typeof rx.getSignalsInBandwidth !== 'function') return [];
    const degraded: string[] = [];
    const lost: string[] = [];
    for (const modem of modems) {
      if (!modem.isPowered) continue;
      // Advances the lazy lock tracker to now, as the Dashboard does
      const info = rx.getSignalsInBandwidth(modem);
      if (info.hasCarrier && info.hasLock && info.isLowMargin) {
        degraded.push(`Modem ${modem.modemNumber}: ${describeEsN0(info)}`);
      }
      const transition = typeof rx.getLockTransition === 'function' ? rx.getLockTransition(modem) : null;
      if (!info.hasLock && transition?.hadLock && transition.lockLostAtMs !== null) {
        lost.push(`Modem ${modem.modemNumber}: ${info.hasCarrier ? describeEsN0ForAcquisition(info) : 'no carrier'}`);
      }
    }
    const alarms: Pick<AlarmWithDetail, 'severity' | 'message' | 'detail'>[] = [];
    if (lost.length > 0) alarms.push({ severity: 'error', message: AlarmService.LOCK_LOST_LABEL, detail: lost.join('; ') });
    if (degraded.length > 0) alarms.push({ severity: 'warning', message: AlarmService.DEGRADED_MARGIN_LABEL, detail: degraded.join('; ') });
    return alarms;
  }

  /**
   * Alarms whose label must not move while they are up (nats-r5-s14-F2,
   * Phase 31 D3): an equipment message carrying a live value in parentheses,
   * "BUC over-temperature (72.0 °C)" or "AGC at max gain (12.0 dB) - weak
   * signal", becomes the label without the parenthesis ("BUC
   * over-temperature", "AGC at max gain - weak signal") with the inner text
   * ("72.0 °C") in the detail, so the ticker, the Dashboard and the Ops Log
   * keep one name for it while the value refreshes. RAIN FADE keeps its
   * "fade 0.6 dB" detail wording.
   */
  private static fixLabel_(alarm: AlarmWithDetail): AlarmWithDetail {
    const rain = /^RAIN FADE \((.+)\)$/u.exec(alarm.message);
    if (rain) return { ...alarm, message: AlarmService.RAIN_FADE_LABEL, detail: `fade ${rain[1]}` };
    const valued = AlarmService.VALUE_IN_PARENS_.exec(alarm.message);
    if (valued) {
      const label = `${valued[1]}${valued[3]}`.trim();
      if (label.length > 0) return { ...alarm, message: label, detail: valued[2] };
    }
    return alarm;
  }

  /**
   * "<label> (<number><unit>)<suffix>": the first parenthesis holding a
   * number followed by a unit (dB, A, °C, °, μs error); the suffix is kept
   * in the label ("AGC at max gain (12.0 dB) - weak signal")
   */
  private static readonly VALUE_IN_PARENS_ = /^(.*?)\s*\((-?\d+(?:\.\d+)?\s*[^\s\d()][^()]*)\)(.*)$/u;

  /** Fixed label of the receiver low-margin warning */
  static readonly DEGRADED_MARGIN_LABEL = 'Degraded margin';
  /** Fixed label of the receiver lock-loss error (Phase 31 D1) */
  static readonly LOCK_LOST_LABEL = 'Carrier lock lost';
  /** Fixed label of the antenna rain-fade alarm */
  static readonly RAIN_FADE_LABEL = 'RAIN FADE';

  /** The live value behind an alarm's fixed label ("Modem 1: Es/N0 5.6 dB, need 5.0 dB"), if it has one */
  static detailOf(alarm: AggregatedAlarm): string | undefined {
    return 'detail' in alarm && typeof alarm.detail === 'string' ? alarm.detail : undefined;
  }

  private static isDisplayableAlarm_(alarm: AlarmStatus): boolean {
    return alarm.severity === 'error' || alarm.severity === 'warning' || alarm.severity === 'info';
  }

  /** @param alarms every active alarm, most severe first */
  private emitIfChanged_(alarms: AggregatedAlarm[]): void {
    const hash = JSON.stringify(alarms);
    if (hash === this.previousAlarmsHash_) return;
    this.previousAlarmsHash_ = hash;

    const data: AlarmStateChangedData = {
      alarms,
      highestSeverity: alarms[0]?.severity ?? 'success',
    };

    EventBus.getInstance().emit(Events.ALARM_STATE_CHANGED, data);
  }

  static destroy(): void {
    if (AlarmService.instance_) {
      EventBus.getInstance().off(Events.UPDATE, AlarmService.instance_.boundOnUpdate_);
      AlarmService.instance_ = null;
    }
    AlarmService.raisedAtMs_.clear();
  }
}
