import { SimClock } from '@app/simulation/sim-clock';
/**
 * @file EventAutoLogger - Auto-logs equipment events to OpsLogManager
 * @description Singleton service that subscribes to equipment events and creates
 * human-readable log entries. Active at every difficulty: the log is the
 * station record the scenario dialog says the supervisor reads (nats-r5-s16-F2).
 */

import type { AntennaState } from '@app/equipment/antenna';
import type { AGCState } from '@app/equipment/rf-front-end/agc-module';
import type { BUCState } from '@app/equipment/rf-front-end/buc-module';
import type { CouplerState } from '@app/equipment/rf-front-end/coupler-module/coupler-module';
import type { IfFilterBankState } from '@app/equipment/rf-front-end/filter-module';
import type { GPSDOState } from '@app/equipment/rf-front-end/gpsdo-module/gpsdo-state';
import type { HPAState } from '@app/equipment/rf-front-end/hpa-module';
import type { LNBState } from '@app/equipment/rf-front-end/lnb-module';
import type { NotchFilterState } from '@app/equipment/rf-front-end/notch-filter-module';
import type { OMTState } from '@app/equipment/rf-front-end/omt-module/omt-module';
import type { RFFrontEndState } from '@app/equipment/rf-front-end/rf-front-end-core';
import { EventBus } from '@app/events/event-bus';
import {
  AggregatedAlarm,
  AlarmStateChangedData,
  AntennaSlewCompleteData,
  EquipmentActionData,
  Events,
  RxConfigChangedData,
  TxConfigChangedData,
  TxTransmitChangedData,
} from '@app/events/events';
import {
  formatAgcEvent,
  formatAntennaArrival,
  formatAntennaEvent,
  formatBucEvent,
  formatCouplerEvent,
  formatFilterEvent,
  formatGpsdoEvent,
  formatHpaEvent,
  formatLnbEvent,
  formatNotchFilterEvent,
  formatOmtEvent,
  formatRfFePowerEvent,
  formatRxConfigEvent,
  formatTxConfigEvent,
  formatTxTransmitEvent,
} from './event-formatters';
import { OpsLogManager } from './ops-log-manager';
import type { OpsLogEntry } from './ops-log-types';
import { stationSource, stationTagForAntennaState, stationTagForModemUuid, stationTagForRfModule, stationTagForRfState } from './station-tag';

/** The beacon-frequency tail of an antenna line ("..., Beacon freq: 4175.50 MHz") */
const BEACON_SUFFIX_RE = /, Beacon freq: [\d.]+ MHz$/u;

/** An antenna mode/state line, as formatAntennaEvent writes it */
const ANTENNA_STATE_LINE_PREFIX = 'Tracking mode:';

/** The lock word of an antenna line (", Antenna LOCKED"); UNKNOWN (an ACU fault) is kept */
const LOCK_WORD_RE = /, Antenna (?:LOCKED|UNLOCKED)(?=,|$)/u;

/**
 * Split an antenna line into its identity (the text without the beacon tail
 * and without the lock word) and the beacon tail. A lock flip alone is not a
 * new line: weather ticks and syncs re-emit the state as the lock settles
 * (nats-r6-s03-F1, r6-s11-F1)
 */
function splitBeaconSuffix_(message: string): { base: string; beacon: string | null } {
  const match = BEACON_SUFFIX_RE.exec(message);
  const base = match ? message.slice(0, match.index) : message;
  return { base: base.replace(LOCK_WORD_RE, ''), beacon: match ? match[0] : null };
}

/** Severity rank for escalation: only a rise writes a line */
const SEVERITY_RANK: Readonly<Record<string, number>> = { info: 0, warning: 1, error: 2 };
const WARNING_RANK = 1;

/** An alarm as the log writes it: "<label> (<detail>)", or the label alone */
function alarmText_(label: string, detail: string | undefined): string {
  return `${label}${detail ? ` (${detail})` : ''}`;
}

/** The live value AlarmService splits out of an alarm's label, if any */
function alarmDetail_(alarm: AggregatedAlarm): string | undefined {
  const detail = (alarm as AggregatedAlarm & { detail?: unknown }).detail;
  return typeof detail === 'string' && detail.length > 0 ? detail : undefined;
}

/** One alarm as the logger last saw it */
interface SeenAlarm {
  label: string;
  source: string;
  severity: number;
  detail: string | undefined;
}

/**
 * Auto-logs equipment events to the operations log, at every difficulty.
 */
export class EventAutoLogger {
  private static instance_: EventAutoLogger | null = null;

  private readonly eventBus_: EventBus;
  private isEnabled_: boolean = false;

  // Throttling and deduplication
  private static readonly THROTTLE_MS = 500;
  /** Keyed by event and station, so two stations' identical lines both log */
  private readonly lastLogTime_: Map<string, number> = new Map();
  private readonly lastLoggedMessage_: Map<string, string> = new Map();
  /** Last antenna mode/staging seen per station, to spot a mode command */
  private readonly lastAntennaModeKey_: Map<string, string> = new Map();
  /** Nesting depth of runWithoutLogging(): above 0 nothing is logged */
  private suppressDepth_ = 0;

  /** Per-alarm quiet time after a raise is logged, so a flapping alarm logs once */
  private static readonly ALARM_RELOG_MS = 30_000;
  /** Alarms whose raise is in the log and whose clear is not yet, by alarmKey_ */
  private readonly loggedAlarms_: Set<string> = new Set();
  /** Every active alarm (info included) as last seen, by alarmKey_: severity and live detail */
  private readonly seenAlarms_: Map<string, SeenAlarm> = new Map();
  /** Run time each alarm's raise was last logged, by alarmKey_ */
  private readonly alarmRaiseLoggedMs_: Map<string, number> = new Map();

  // Bound handlers for cleanup
  private readonly boundAntennaHandler_: (data: Partial<AntennaState>) => void;
  private readonly boundSlewCompleteHandler_: (data: AntennaSlewCompleteData) => void;
  private readonly boundTxConfigHandler_: (data: TxConfigChangedData) => void;
  private readonly boundTxTransmitHandler_: (data: TxTransmitChangedData) => void;
  private readonly boundRxConfigHandler_: (data: RxConfigChangedData) => void;
  private readonly boundRfPowerHandler_: (data: Partial<RFFrontEndState>) => void;
  private readonly boundBucHandler_: (data: Partial<BUCState>) => void;
  private readonly boundHpaHandler_: (data: Partial<HPAState>) => void;
  private readonly boundAgcHandler_: (data: Partial<AGCState>) => void;
  private readonly boundLnbHandler_: (data: Partial<LNBState>) => void;
  private readonly boundOmtHandler_: (data: Partial<OMTState>) => void;
  private readonly boundCouplerHandler_: (data: Partial<CouplerState>) => void;
  private readonly boundFilterHandler_: (data: Partial<IfFilterBankState>) => void;
  private readonly boundNotchFilterHandler_: (data: Partial<NotchFilterState>) => void;
  private readonly boundGpsdoHandler_: (data: Partial<GPSDOState>) => void;
  private readonly boundEquipmentActionHandler_: (data: EquipmentActionData) => void;
  private readonly boundAlarmStateHandler_: (data: AlarmStateChangedData) => void;

  private constructor() {
    this.eventBus_ = EventBus.getInstance();

    // Bind all handlers
    this.boundAntennaHandler_ = this.handleAntennaEvent_.bind(this);
    this.boundSlewCompleteHandler_ = this.handleSlewComplete_.bind(this);
    this.boundTxConfigHandler_ = this.handleTxConfigEvent_.bind(this);
    this.boundTxTransmitHandler_ = this.handleTxTransmitEvent_.bind(this);
    this.boundRxConfigHandler_ = this.handleRxConfigEvent_.bind(this);
    this.boundRfPowerHandler_ = this.handleRfPowerEvent_.bind(this);
    this.boundBucHandler_ = this.handleBucEvent_.bind(this);
    this.boundHpaHandler_ = this.handleHpaEvent_.bind(this);
    this.boundAgcHandler_ = this.handleAgcEvent_.bind(this);
    this.boundLnbHandler_ = this.handleLnbEvent_.bind(this);
    this.boundOmtHandler_ = this.handleOmtEvent_.bind(this);
    this.boundCouplerHandler_ = this.handleCouplerEvent_.bind(this);
    this.boundFilterHandler_ = this.handleFilterEvent_.bind(this);
    this.boundNotchFilterHandler_ = this.handleNotchFilterEvent_.bind(this);
    this.boundGpsdoHandler_ = this.handleGpsdoEvent_.bind(this);
    this.boundEquipmentActionHandler_ = this.handleEquipmentAction_.bind(this);
    this.boundAlarmStateHandler_ = this.handleAlarmState_.bind(this);
  }

  static getInstance(): EventAutoLogger {
    EventAutoLogger.instance_ ??= new EventAutoLogger();
    return EventAutoLogger.instance_;
  }

  /**
   * Initialize the auto-logger and subscribe to equipment events. Every
   * difficulty logs: an advanced scenario used to get an empty log although
   * its dialog says the supervisor reads it (nats-r5-s16-F2).
   * Call this after OpsLogManager.initialize() in base-page.ts.
   */
  initialize(): void {
    // A second initialize without dispose would subscribe every handler twice
    if (this.isEnabled_) return;
    this.isEnabled_ = true;
    this.subscribeToEvents_();
  }

  /**
   * Run `action` with logging off: what it emits is not an operator action.
   * Opening the ACU tab re-applies the configured target to the antenna, which
   * re-emits its state; a tab open never logs (nats-r5-s07-F2).
   * @param action the code whose events are not logged
   */
  runWithoutLogging(action: () => void): void {
    this.suppressDepth_++;
    try {
      action();
    } finally {
      this.suppressDepth_--;
    }
  }

  private subscribeToEvents_(): void {
    this.eventBus_.on(Events.ANTENNA_STATE_CHANGED, this.boundAntennaHandler_);
    this.eventBus_.on(Events.ANTENNA_SLEW_COMPLETE, this.boundSlewCompleteHandler_);
    this.eventBus_.on(Events.TX_CONFIG_CHANGED, this.boundTxConfigHandler_);
    this.eventBus_.on(Events.TX_TRANSMIT_CHANGED, this.boundTxTransmitHandler_);
    this.eventBus_.on(Events.RX_CONFIG_CHANGED, this.boundRxConfigHandler_);
    this.eventBus_.on(Events.RF_FE_POWER_CHANGED, this.boundRfPowerHandler_);
    this.eventBus_.on(Events.RF_FE_BUC_CHANGED, this.boundBucHandler_);
    this.eventBus_.on(Events.RF_FE_HPA_CHANGED, this.boundHpaHandler_);
    this.eventBus_.on(Events.RF_FE_AGC_CHANGED, this.boundAgcHandler_);
    this.eventBus_.on(Events.RF_FE_LNB_CHANGED, this.boundLnbHandler_);
    this.eventBus_.on(Events.RF_FE_OMT_CHANGED, this.boundOmtHandler_);
    this.eventBus_.on(Events.RF_FE_COUPLER_CHANGED, this.boundCouplerHandler_);
    this.eventBus_.on(Events.RF_FE_FILTER_CHANGED, this.boundFilterHandler_);
    this.eventBus_.on(Events.RF_FE_NOTCH_FILTER_CHANGED, this.boundNotchFilterHandler_);
    this.eventBus_.on(Events.RF_FE_GPSDO_CHANGED, this.boundGpsdoHandler_);
    this.eventBus_.on(Events.EQUIPMENT_ACTION, this.boundEquipmentActionHandler_);
    this.eventBus_.on(Events.ALARM_STATE_CHANGED, this.boundAlarmStateHandler_);
  }

  /**
   * Check if this message should be skipped due to throttling or being a duplicate.
   * Returns true if the message should NOT be logged.
   */
  private shouldSkip_(event: Events, message: string | null, skipThrottle: boolean = false, station: string = ''): boolean {
    const key = `${event}|${station}`;

    // No message to log
    if (!message) return true;

    // Skip if same message as last logged for this event type
    if (this.lastLoggedMessage_.get(key) === message) {
      return true;
    }

    // Check time-based throttling
    if (!skipThrottle) {
      const now = SimClock.runMs();
      const lastTime = this.lastLogTime_.get(key) ?? -Infinity;
      if (now >= lastTime && now - lastTime < EventAutoLogger.THROTTLE_MS) {
        return true;
      }
      this.lastLogTime_.set(key, now);
    }

    // Record this message as the last logged
    this.lastLoggedMessage_.set(key, message);
    return false;
  }

  /**
   * Log a message to OpsLogManager if enabled and initialized
   */
  private log_(message: string, source?: string, category: OpsLogEntry['category'] = 'action'): void {
    if (!this.isEnabled_ || this.suppressDepth_ > 0 || !OpsLogManager.isInitialized()) return;
    OpsLogManager.getInstance().log(message, category, source);
  }

  /**
   * Log an equipment action that no EventBus event reports: a panel toggle
   * (HPA enable, BUC mute) or an automatic action (handover safing). Logged
   * like the event-driven lines: station-tagged source.
   * @param message the log line
   * @param system the equipment tag, e.g. "RF FE", "TX", "HANDOVER"
   * @param stationId the station's id in a multi-station scenario, else undefined
   */
  logAction(message: string, system: string, stationId?: string): void {
    this.log_(message, stationSource(system, stationId));
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Event Handlers
  // ════════════════════════════════════════════════════════════════════════════

  private handleAntennaEvent_(data: Partial<AntennaState>): void {
    if (this.suppressDepth_ > 0) return;
    const message = formatAntennaEvent(data);
    if (!message) return;
    const station = stationTagForAntennaState(data);
    const source = stationSource('ANT', station);
    // A mode command (staged or applied) is an operator action: never throttle
    // it away, so an APPLY right after MAINT still logs (nats-r3-s11-F2), nor
    // the step-track switch (nats-r4-s10-F1)
    const modeKey = `${data.trackingMode}|${data.hasStagedChanges === true && data.stagedTargetElevation != null}|${data.isStepTrackEnabled === true}`;
    const modeChanged = this.lastAntennaModeKey_.get(station ?? '') !== modeKey;
    this.lastAntennaModeKey_.set(station ?? '', modeKey);

    // Compare against the station's last antenna line in the log itself, not
    // only this logger's memory, so a rebuilt logger does not write the
    // start-of-shift state again (nats-r5-s10-F1). Only mode, power and beacon
    // make the identity: a lock flip writes nothing (nats-r6-s03-F1, s11-F1),
    // and a mode command emits once without the beacon tail and once with the
    // target's, and the second completes the first line (nats-r5-s02-F1)
    const previous = this.lastAntennaLine_(source);
    if (previous) {
      const prev = splitBeaconSuffix_(previous.message);
      const next = splitBeaconSuffix_(message);
      if (prev.base === next.base) {
        if (next.beacon === null || next.beacon === prev.beacon) return;
        if (prev.beacon === null) {
          // Keep the line's lock word as written; add only the beacon
          const amended = `${previous.message}${next.beacon}`;
          if (this.isEnabled_) OpsLogManager.getInstance().amend(previous, amended);
          this.lastLoggedMessage_.set(`${Events.ANTENNA_STATE_CHANGED}|${station}`, amended);
          return;
        }
        // A new beacon frequency on the same mode (MANUAL entry, new target) is a change: log it
      }
    }

    if (this.shouldSkip_(Events.ANTENNA_STATE_CHANGED, message, modeChanged, station)) return;
    this.log_(message, source);
  }

  /**
   * One arrival line per commanded move, e.g. "STOW: parked (El 90.0)"
   * (nats-r6-s11-F1): the command-time line says where the dish is going,
   * this one that it got there
   */
  private handleSlewComplete_(data: AntennaSlewCompleteData): void {
    if (this.suppressDepth_ > 0) return;
    const station = stationTagForAntennaState(data.state);
    this.log_(formatAntennaArrival(data), stationSource('ANT', station));
  }

  /** The newest antenna state line of this source in the log (not the previous shift's) */
  private lastAntennaLine_(source: string): OpsLogEntry | null {
    if (!OpsLogManager.isInitialized()) return null;
    const entries = OpsLogManager.getInstance().getEntries();
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      if (entry.category === 'previous-shift' || entry.source !== source) continue;
      if (entry.message.startsWith(ANTENNA_STATE_LINE_PREFIX)) return entry;
    }
    return null;
  }

  private handleTxConfigEvent_(data: TxConfigChangedData): void {
    const message = formatTxConfigEvent(data);
    const station = stationTagForModemUuid(data.uuid, data.config);
    // Every logged TX line is a discrete action (config, transmit, power):
    // skip the throttle so two modems stopped in one tick both log; still dedupe
    if (this.shouldSkip_(Events.TX_CONFIG_CHANGED, message, true, station)) return;
    this.log_(message, stationSource('TX', station));
  }

  private handleTxTransmitEvent_(data: TxTransmitChangedData): void {
    const message = formatTxTransmitEvent(data);
    const station = stationTagForModemUuid(data.uuid);
    // Skip throttle for critical state change, but still dedupe
    if (this.shouldSkip_(Events.TX_TRANSMIT_CHANGED, message, true, station)) return;
    this.log_(message, stationSource('TX', station));
  }

  private handleRxConfigEvent_(data: RxConfigChangedData): void {
    const message = formatRxConfigEvent(data);
    const station = stationTagForModemUuid(data.uuid);
    if (this.shouldSkip_(Events.RX_CONFIG_CHANGED, message, false, station)) return;
    this.log_(message, stationSource('RX', station));
  }

  private handleRfPowerEvent_(data: Partial<RFFrontEndState>): void {
    const message = formatRfFePowerEvent(data);
    // The whole front-end state carries its uuid; the LNB state is the older match
    const station = stationTagForRfState(data.uuid ? data : data.lnb);
    // Skip throttle for important state change, but still dedupe
    if (this.shouldSkip_(Events.RF_FE_POWER_CHANGED, message, true, station)) return;
    this.log_(message, stationSource('RF FE', station));
  }

  private handleBucEvent_(data: Partial<BUCState>): void {
    const message = formatBucEvent(data);
    const station = stationTagForRfState(data);
    if (this.shouldSkip_(Events.RF_FE_BUC_CHANGED, message, false, station)) return;
    this.log_(message, stationSource('RF FE', station));
  }

  private handleHpaEvent_(data: Partial<HPAState>): void {
    const message = formatHpaEvent(data);
    const station = stationTagForRfState(data);
    // Skip throttle for HPA enable/disable, but still dedupe
    if (this.shouldSkip_(Events.RF_FE_HPA_CHANGED, message, true, station)) return;
    this.log_(message, stationSource('RF FE', station));
  }

  private handleAgcEvent_(data: Partial<AGCState>): void {
    const message = formatAgcEvent(data);
    const station = stationTagForRfState(data);
    if (this.shouldSkip_(Events.RF_FE_AGC_CHANGED, message, false, station)) return;
    this.log_(message, stationSource('RF FE', station));
  }

  private handleLnbEvent_(data: Partial<LNBState>): void {
    const message = formatLnbEvent(data);
    const station = stationTagForRfState(data);
    if (this.shouldSkip_(Events.RF_FE_LNB_CHANGED, message, false, station)) return;
    this.log_(message, stationSource('RF FE', station));
  }

  private handleOmtEvent_(data: Partial<OMTState>): void {
    const message = formatOmtEvent(data);
    const station = stationTagForRfState(data);
    // Skip throttle for intentional user action, but still dedupe
    if (this.shouldSkip_(Events.RF_FE_OMT_CHANGED, message, true, station)) return;
    this.log_(message, stationSource('RF FE', station));
  }

  private handleCouplerEvent_(data: Partial<CouplerState>): void {
    const message = formatCouplerEvent(data);
    const station = stationTagForRfState(data);
    // Skip throttle for intentional user action, but still dedupe
    if (this.shouldSkip_(Events.RF_FE_COUPLER_CHANGED, message, true, station)) return;
    this.log_(message, stationSource('RF FE', station));
  }

  private handleFilterEvent_(data: Partial<IfFilterBankState>): void {
    const message = formatFilterEvent(data);
    const station = stationTagForRfState(data);
    if (this.shouldSkip_(Events.RF_FE_FILTER_CHANGED, message, false, station)) return;
    this.log_(message, stationSource('RF FE', station));
  }

  private handleNotchFilterEvent_(data: Partial<NotchFilterState>): void {
    const message = formatNotchFilterEvent(data);
    const station = stationTagForRfState(data);
    if (this.shouldSkip_(Events.RF_FE_NOTCH_FILTER_CHANGED, message, false, station)) return;
    this.log_(message, stationSource('RF FE', station));
  }

  private handleGpsdoEvent_(data: Partial<GPSDOState>): void {
    const message = formatGpsdoEvent(data);
    const station = stationTagForRfState(data);
    // Skip throttle for important state change, but still dedupe
    if (this.shouldSkip_(Events.RF_FE_GPSDO_CHANGED, message, true, station)) return;
    this.log_(message, stationSource('RF FE', station));
  }

  /**
   * An operator action an equipment core reports itself (BUC gain, HPA
   * back-off, LNB / HPA power: nats-r4-s07-F1, s12-F2). Each is a discrete
   * action: never throttled or deduped, so setting the same gain twice logs twice.
   */
  private handleEquipmentAction_(data: EquipmentActionData): void {
    this.log_(data.message, stationSource(data.system, stationTagForRfModule(data.module)));
  }

  /**
   * One SYSTEM line when an alarm is raised and one when it clears, so a
   * transient the operator rode out (S17's sun transit) is in the record
   * (nats-r5-s17-F1). Warnings and errors only: the info "Signal(s) Detected"
   * follows the modem's carrier and would log every lock loss and relock.
   * An alarm that clears and comes back within ALARM_RELOG_MS of its last
   * logged raise writes nothing until it has been quiet that long.
   *
   * The text is the live label and detail ("BUC high current draw (4.52 A)"):
   * the raise carries the value at the raise, the clear the last value seen
   * before it cleared, and a severity rise (info to warning, warning to
   * error) writes an "escalated" line; a fall writes nothing (nats-r6-s16-F1).
   */
  private handleAlarmState_(data: AlarmStateChangedData): void {
    const now = SimClock.runMs();
    const current = new Map<string, SeenAlarm>();
    for (const alarm of data.alarms) {
      const severity = SEVERITY_RANK[alarm.severity];
      if (severity === undefined) continue;
      const key = EventAutoLogger.alarmKey_(alarm);
      const seen = current.get(key);
      // The same alarm twice in one poll: keep the more severe
      if (seen && seen.severity >= severity) continue;
      current.set(key, {
        label: alarm.message,
        source: `${alarm.assetId}(${alarm.equipmentType}${alarm.equipmentIndex + 1})`,
        severity,
        detail: alarmDetail_(alarm),
      });
    }

    for (const [key, alarm] of current) {
      const previous = this.seenAlarms_.get(key);
      this.seenAlarms_.set(key, alarm);
      if (alarm.severity < WARNING_RANK) continue;
      const text = alarmText_(alarm.label, alarm.detail);

      // A rise writes even inside the flap window: an error is news
      if (previous && alarm.severity > previous.severity) {
        this.loggedAlarms_.add(key);
        this.alarmRaiseLoggedMs_.set(key, now);
        this.log_(`ALARM escalated: ${text}`, alarm.source, 'system');
        continue;
      }

      if (this.loggedAlarms_.has(key)) continue;
      const lastRaise = this.alarmRaiseLoggedMs_.get(key);
      // Run time restarts each scenario, so a later stamp is from an earlier run
      if (lastRaise !== undefined && now >= lastRaise && now - lastRaise < EventAutoLogger.ALARM_RELOG_MS) continue;
      this.alarmRaiseLoggedMs_.set(key, now);
      this.loggedAlarms_.add(key);
      this.log_(`ALARM raised: ${text}`, alarm.source, 'system');
    }

    for (const [key, last] of [...this.seenAlarms_]) {
      if (current.has(key)) continue;
      this.seenAlarms_.delete(key);
      if (!this.loggedAlarms_.delete(key)) continue;
      this.log_(`ALARM cleared: ${alarmText_(last.label, last.detail)}`, last.source, 'system');
    }
  }

  /** One alarm across polls: station, equipment and its text with live numbers masked */
  private static alarmKey_(alarm: AggregatedAlarm): string {
    return `${alarm.assetId}|${alarm.equipmentType}|${alarm.equipmentIndex}|${alarm.message.replace(/-?\d+(?:\.\d+)?/gu, '#')}`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Cleanup
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Unsubscribe from all events and reset state
   */
  dispose(): void {
    if (!this.isEnabled_) return;

    this.eventBus_.off(Events.ANTENNA_STATE_CHANGED, this.boundAntennaHandler_);
    this.eventBus_.off(Events.ANTENNA_SLEW_COMPLETE, this.boundSlewCompleteHandler_);
    this.eventBus_.off(Events.TX_CONFIG_CHANGED, this.boundTxConfigHandler_);
    this.eventBus_.off(Events.TX_TRANSMIT_CHANGED, this.boundTxTransmitHandler_);
    this.eventBus_.off(Events.RX_CONFIG_CHANGED, this.boundRxConfigHandler_);
    this.eventBus_.off(Events.RF_FE_POWER_CHANGED, this.boundRfPowerHandler_);
    this.eventBus_.off(Events.RF_FE_BUC_CHANGED, this.boundBucHandler_);
    this.eventBus_.off(Events.RF_FE_HPA_CHANGED, this.boundHpaHandler_);
    this.eventBus_.off(Events.RF_FE_AGC_CHANGED, this.boundAgcHandler_);
    this.eventBus_.off(Events.RF_FE_LNB_CHANGED, this.boundLnbHandler_);
    this.eventBus_.off(Events.RF_FE_OMT_CHANGED, this.boundOmtHandler_);
    this.eventBus_.off(Events.RF_FE_COUPLER_CHANGED, this.boundCouplerHandler_);
    this.eventBus_.off(Events.RF_FE_FILTER_CHANGED, this.boundFilterHandler_);
    this.eventBus_.off(Events.RF_FE_NOTCH_FILTER_CHANGED, this.boundNotchFilterHandler_);
    this.eventBus_.off(Events.RF_FE_GPSDO_CHANGED, this.boundGpsdoHandler_);
    this.eventBus_.off(Events.EQUIPMENT_ACTION, this.boundEquipmentActionHandler_);
    this.eventBus_.off(Events.ALARM_STATE_CHANGED, this.boundAlarmStateHandler_);

    this.isEnabled_ = false;
    this.lastLogTime_.clear();
    this.lastLoggedMessage_.clear();
    this.lastAntennaModeKey_.clear();
    this.loggedAlarms_.clear();
    this.seenAlarms_.clear();
    this.alarmRaiseLoggedMs_.clear();
  }

  /**
   * Destroy the singleton instance
   */
  static destroy(): void {
    if (EventAutoLogger.instance_) {
      EventAutoLogger.instance_.dispose();
      EventAutoLogger.instance_ = null;
    }
  }
}
