import { SimClock } from '@app/simulation/sim-clock';
/**
 * @file EventAutoLogger - Auto-logs equipment events to OpsLogManager
 * @description Singleton service that subscribes to equipment events and creates
 * human-readable log entries. Only active for beginner/intermediate difficulty.
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
  EquipmentActionData,
  Events,
  RxActiveModemChangedData,
  RxConfigChangedData,
  TxActiveModemChangedData,
  TxConfigChangedData,
  TxTransmitChangedData,
} from '@app/events/events';
import { ScenarioManager } from '@app/scenario-manager';
import {
  formatAgcEvent,
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
  formatRxActiveModemEvent,
  formatRxConfigEvent,
  formatTxActiveModemEvent,
  formatTxConfigEvent,
  formatTxTransmitEvent,
} from './event-formatters';
import { OpsLogManager } from './ops-log-manager';
import { stationSource, stationTagForAntennaState, stationTagForModemUuid, stationTagForRfModule, stationTagForRfState } from './station-tag';

/**
 * Auto-logs equipment events to the operations log.
 * Only active for beginner and intermediate difficulty levels.
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

  // Bound handlers for cleanup
  private readonly boundAntennaHandler_: (data: Partial<AntennaState>) => void;
  private readonly boundTxConfigHandler_: (data: TxConfigChangedData) => void;
  private readonly boundTxModemHandler_: (data: TxActiveModemChangedData) => void;
  private readonly boundTxTransmitHandler_: (data: TxTransmitChangedData) => void;
  private readonly boundRxConfigHandler_: (data: RxConfigChangedData) => void;
  private readonly boundRxModemHandler_: (data: RxActiveModemChangedData) => void;
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

  private constructor() {
    this.eventBus_ = EventBus.getInstance();

    // Bind all handlers
    this.boundAntennaHandler_ = this.handleAntennaEvent_.bind(this);
    this.boundTxConfigHandler_ = this.handleTxConfigEvent_.bind(this);
    this.boundTxModemHandler_ = this.handleTxModemEvent_.bind(this);
    this.boundTxTransmitHandler_ = this.handleTxTransmitEvent_.bind(this);
    this.boundRxConfigHandler_ = this.handleRxConfigEvent_.bind(this);
    this.boundRxModemHandler_ = this.handleRxModemEvent_.bind(this);
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
  }

  static getInstance(): EventAutoLogger {
    EventAutoLogger.instance_ ??= new EventAutoLogger();
    return EventAutoLogger.instance_;
  }

  /**
   * Initialize the auto-logger. Checks difficulty and subscribes if appropriate.
   * Call this after OpsLogManager.initialize() in base-page.ts.
   */
  initialize(): void {
    try {
      const difficulty = ScenarioManager.getInstance().data?.difficulty;

      // Only enable for beginner and intermediate
      if (difficulty === 'advanced') {
        this.isEnabled_ = false;
        return;
      }

      this.isEnabled_ = true;
      this.subscribeToEvents_();
    } catch {
      // ScenarioManager not initialized - skip auto-logging
      this.isEnabled_ = false;
    }
  }

  private subscribeToEvents_(): void {
    this.eventBus_.on(Events.ANTENNA_STATE_CHANGED, this.boundAntennaHandler_);
    this.eventBus_.on(Events.TX_CONFIG_CHANGED, this.boundTxConfigHandler_);
    this.eventBus_.on(Events.TX_ACTIVE_MODEM_CHANGED, this.boundTxModemHandler_);
    this.eventBus_.on(Events.TX_TRANSMIT_CHANGED, this.boundTxTransmitHandler_);
    this.eventBus_.on(Events.RX_CONFIG_CHANGED, this.boundRxConfigHandler_);
    this.eventBus_.on(Events.RX_ACTIVE_MODEM_CHANGED, this.boundRxModemHandler_);
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
  private log_(message: string, source?: string): void {
    if (!this.isEnabled_ || !OpsLogManager.isInitialized()) return;
    OpsLogManager.getInstance().log(message, 'action', source);
  }

  /**
   * Log an equipment action that no EventBus event reports: a panel toggle
   * (HPA enable, BUC mute) or an automatic action (handover safing). Logged
   * like the event-driven lines: same difficulty gate, station-tagged source.
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
    const message = formatAntennaEvent(data);
    const station = stationTagForAntennaState(data);
    // A mode command (staged or applied) is an operator action: never throttle
    // it away, so an APPLY right after MAINT still logs (nats-r3-s11-F2), nor
    // the step-track switch (nats-r4-s10-F1)
    const modeKey = `${data.trackingMode}|${data.hasStagedChanges === true && data.stagedTargetElevation != null}|${data.isStepTrackEnabled === true}`;
    const modeChanged = this.lastAntennaModeKey_.get(station ?? '') !== modeKey;
    this.lastAntennaModeKey_.set(station ?? '', modeKey);
    if (this.shouldSkip_(Events.ANTENNA_STATE_CHANGED, message, modeChanged, station)) return;
    this.log_(message, stationSource('ANT', station));
  }

  private handleTxConfigEvent_(data: TxConfigChangedData): void {
    const message = formatTxConfigEvent(data);
    const station = stationTagForModemUuid(data.uuid, data.config);
    // Every logged TX line is a discrete action (config, transmit, power):
    // skip the throttle so two modems stopped in one tick both log; still dedupe
    if (this.shouldSkip_(Events.TX_CONFIG_CHANGED, message, true, station)) return;
    this.log_(message, stationSource('TX', station));
  }

  private handleTxModemEvent_(data: TxActiveModemChangedData): void {
    const message = formatTxActiveModemEvent(data);
    const station = stationTagForModemUuid(data.uuid);
    // Skip throttle for intentional user action, but still dedupe
    if (this.shouldSkip_(Events.TX_ACTIVE_MODEM_CHANGED, message, true, station)) return;
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

  private handleRxModemEvent_(data: RxActiveModemChangedData): void {
    const message = formatRxActiveModemEvent(data);
    const station = stationTagForModemUuid(data.uuid);
    // Skip throttle for intentional user action, but still dedupe
    if (this.shouldSkip_(Events.RX_ACTIVE_MODEM_CHANGED, message, true, station)) return;
    this.log_(message, stationSource('RX', station));
  }

  private handleRfPowerEvent_(data: Partial<RFFrontEndState>): void {
    const message = formatRfFePowerEvent(data);
    const station = stationTagForRfState(data.lnb);
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

  // ════════════════════════════════════════════════════════════════════════════
  // Cleanup
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Unsubscribe from all events and reset state
   */
  dispose(): void {
    if (!this.isEnabled_) return;

    this.eventBus_.off(Events.ANTENNA_STATE_CHANGED, this.boundAntennaHandler_);
    this.eventBus_.off(Events.TX_CONFIG_CHANGED, this.boundTxConfigHandler_);
    this.eventBus_.off(Events.TX_ACTIVE_MODEM_CHANGED, this.boundTxModemHandler_);
    this.eventBus_.off(Events.TX_TRANSMIT_CHANGED, this.boundTxTransmitHandler_);
    this.eventBus_.off(Events.RX_CONFIG_CHANGED, this.boundRxConfigHandler_);
    this.eventBus_.off(Events.RX_ACTIVE_MODEM_CHANGED, this.boundRxModemHandler_);
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

    this.isEnabled_ = false;
    this.lastLogTime_.clear();
    this.lastLoggedMessage_.clear();
    this.lastAntennaModeKey_.clear();
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
