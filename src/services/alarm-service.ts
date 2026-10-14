import { GroundStation } from '@app/assets/ground-station/ground-station';
import { AlarmStatus } from '@app/equipment/base-equipment';
import { EventBus } from '@app/events/event-bus';
import { AggregatedAlarm, AlarmStateChangedData, Events } from '@app/events/events';
import { SimClock } from '@app/simulation/sim-clock';
import { getSimulatedNowMs } from '@app/simulation/sim-time';
import { SimulationManager } from '@app/simulation/simulation-manager';
import { Milliseconds } from 'ootk';

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
  private readonly boundOnUpdate_: (dt: Milliseconds) => void;
  /** Station-clock ms each live alarm was first seen, by raiseKey_ */
  private static readonly raisedAtMs_ = new Map<string, number>();

  private constructor() {
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
    // Run time restarts at 0 each scenario, so a later stamp is from an earlier run
    if (now >= this.lastPollTime_ && now - this.lastPollTime_ < this.pollInterval_) return;
    this.lastPollTime_ = now;
    this.pollAndAggregate_();
  }

  private pollAndAggregate_(): void {
    const alarms: AggregatedAlarm[] = [];
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
  static getAlarms(station: GroundStation | string): AggregatedAlarm[] {
    const gs = typeof station === 'string' ? SimulationManager.getInstance().groundStations.find((g) => g.state.id === station) : station;
    if (!gs) return [];
    const alarms = AlarmService.collectGroundStationAlarms_(gs);
    AlarmService.stampRaisedAt_(alarms, false);
    return AlarmService.sortBySeverity_(alarms);
  }

  /** Stable sort: error, warning, info (success last; never collected). */
  private static sortBySeverity_(alarms: AggregatedAlarm[]): AggregatedAlarm[] {
    const rank: Record<AggregatedAlarm['severity'], number> = { error: 0, warning: 1, info: 2, success: 3 };
    return alarms
      .map((alarm, index) => ({ alarm, index }))
      .sort((a, b) => rank[a.alarm.severity] - rank[b.alarm.severity] || a.index - b.index)
      .map(({ alarm }) => alarm);
  }

  private static collectGroundStationAlarms_(gs: GroundStation): AggregatedAlarm[] {
    // Skip non-operational locations
    if (!gs.state.isOperational) return [];

    const alarms: AggregatedAlarm[] = [];
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
    });

    return alarms;
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
