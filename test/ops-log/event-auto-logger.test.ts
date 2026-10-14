import { vi } from 'vitest';
import type { TransmitterModem } from '../../src/equipment/transmitter/transmitter';
import { EventBus } from '../../src/events/event-bus';
import { Events } from '../../src/events/events';
import { EventAutoLogger } from '../../src/ops-log/event-auto-logger';
import { formatAntennaEvent, formatRxConfigEvent, formatTxActiveModemEvent, formatTxConfigEvent } from '../../src/ops-log/event-formatters';
import { OpsLogManager } from '../../src/ops-log/ops-log-manager';
import { SimClock } from '../../src/simulation/sim-clock';

// Advanced: the log runs at every difficulty (nats-r5-s16-F2)
vi.mock('../../src/scenario-manager', () => ({
  ScenarioManager: {
    getInstance: () => ({ data: { difficulty: 'advanced' } }),
  },
}));

const modem = (overrides: Partial<TransmitterModem> = {}): TransmitterModem =>
  ({
    id: 0,
    modem_number: 1,
    antenna_id: 1,
    isPowered: true,
    isLoopback: false,
    isFaulted: false,
    isFaultSwitchUp: false,
    isTransmitting: true,
    isTransmittingSwitchUp: true,
    ifSignal: { frequency: 1057e6, modulation: 'QPSK', fec: '3/4' },
    ...overrides,
  }) as unknown as TransmitterModem;

describe('event formatters (nats-r3-s11-F1, s11-F2)', () => {
  it('names the switched modem and its applied carrier on transmit', () => {
    const msg = formatTxConfigEvent({ uuid: 'tx', modem: 1, config: modem(), action: 'transmit-on' });

    expect(msg).toBe('M1: Transmission STARTED, 1057.00 MHz, QPSK 3/4');
  });

  it('logs a config apply, a stop and a boot as distinct lines', () => {
    expect(formatTxConfigEvent({ uuid: 'tx', modem: 1, config: modem(), action: 'config' })).toBe('M1: Config 1057.00 MHz, QPSK 3/4');
    expect(formatTxConfigEvent({ uuid: 'tx', modem: 1, config: modem(), action: 'transmit-off' })).toBe('M1: Transmission STOPPED');
    expect(formatTxConfigEvent({ uuid: 'tx', modem: 1, config: modem(), action: 'power-on' })).toBe('M1: Power ON, booting');
  });

  it('logs nothing for a state refresh with no action', () => {
    expect(formatTxConfigEvent({ uuid: 'tx', modem: 1, config: modem() })).toBeNull();
  });

  it('numbers the selected modem by its modem number, not number + 1', () => {
    expect(formatTxActiveModemEvent({ uuid: 'tx', activeModem: 2 })).toBe('Switched to Modem 2');
  });

  it('logs a staged MAINT as staged, without the momentarily cleared lock flags', () => {
    const msg = formatAntennaEvent({
      trackingMode: 'maintenance',
      hasStagedChanges: true,
      stagedTargetElevation: 5 as never,
      isPowered: true,
      isLocked: false,
      isBeaconLocked: false,
    });

    expect(msg).toBe('Tracking mode: MAINTENANCE staged (El 5.0 pending APPLY)');
  });

  it('logs the applied MAINT with the lock state at that moment', () => {
    const msg = formatAntennaEvent({
      trackingMode: 'maintenance',
      hasStagedChanges: false,
      stagedTargetElevation: null,
      isPowered: true,
      isLocked: false,
      isBeaconLocked: true,
    });

    expect(msg).toBe('Tracking mode: MAINTENANCE, Power ON, Antenna LOCKED');
  });

  it('writes one lock, so the satellite and beacon flags trading places log no contradiction (nats-r4-s10-F1)', () => {
    const base = { trackingMode: 'program-track' as const, isPowered: true, beaconFrequencyHz: 4165e6 };
    const first = formatAntennaEvent({ ...base, isLocked: false, isBeaconLocked: true });
    const second = formatAntennaEvent({ ...base, isLocked: true, isBeaconLocked: false });

    expect(first).toBe('Tracking mode: PROGRAM-TRACK, Power ON, Antenna LOCKED, Beacon freq: 4165.00 MHz');
    expect(second).toBe(first);
    expect(formatAntennaEvent({ ...base, isLocked: false, isBeaconLocked: false })).toContain('Antenna UNLOCKED');
    expect(formatAntennaEvent({ ...base, isLocked: true, isBeaconLocked: true, isAcuAutomationFaulted: true })).toContain('Antenna lock UNKNOWN');
  });

  it('names step-track on the tracking line, so engaging it logs (nats-r4-s10-F1)', () => {
    const msg = formatAntennaEvent({ trackingMode: 'program-track', isStepTrackEnabled: true, isPowered: true, isLocked: true, isBeaconLocked: true });

    expect(msg).toBe('Tracking mode: PROGRAM-TRACK + STEP-TRACK, Power ON, Antenna LOCKED');
  });

  it('marks an automatic modem stop with its reason (nats-r4-s11-F3)', () => {
    expect(formatTxConfigEvent({ uuid: 'tx', modem: 1, config: modem(), action: 'transmit-off', reason: 'handover' })).toBe('M1: Transmission STOPPED (handover)');
    expect(formatTxConfigEvent({ uuid: 'tx', modem: 1, config: modem(), reason: 'handover' })).toBeNull();
  });
});

describe('EventAutoLogger antenna lines (nats-r4-s10-F1)', () => {
  beforeEach(() => {
    EventBus.destroy();
    OpsLogManager.destroy();
    EventAutoLogger.destroy();
    OpsLogManager.initialize();
    EventAutoLogger.getInstance().initialize();
  });

  afterEach(() => {
    EventAutoLogger.destroy();
    OpsLogManager.destroy();
    EventBus.destroy();
  });

  it('logs the start-of-shift lock once, and the step-track switch at once', () => {
    const state = { trackingMode: 'program-track' as const, isPowered: true, isLocked: false, isBeaconLocked: true, isStepTrackEnabled: false };
    EventBus.getInstance().emit(Events.ANTENNA_STATE_CHANGED, { ...state } as never);
    EventBus.getInstance().emit(Events.ANTENNA_STATE_CHANGED, { ...state, isLocked: true, isBeaconLocked: false } as never);
    EventBus.getInstance().emit(Events.ANTENNA_STATE_CHANGED, { ...state, isLocked: true, isStepTrackEnabled: true } as never);

    expect(
      OpsLogManager.getInstance()
        .getEntries()
        .map((e) => e.message)
    ).toEqual(['Tracking mode: PROGRAM-TRACK, Power ON, Antenna LOCKED', 'Tracking mode: PROGRAM-TRACK + STEP-TRACK, Power ON, Antenna LOCKED']);
  });
});

describe('EventAutoLogger station tags (nats-r3-s11-F1)', () => {
  const vtModem = modem();
  const meModem = modem();

  const setStations = (stations: unknown[] | undefined) => {
    (globalThis as unknown as { signalRange?: unknown }).signalRange = stations ? { simulationManager: { groundStations: stations } } : undefined;
  };

  const station = (id: string, txModem: TransmitterModem) => ({
    state: { id },
    antennas: [],
    rfFrontEnds: [],
    receivers: [],
    transmitters: [{ state: { uuid: `${id}-tx`, modems: [txModem] } }],
  });

  beforeEach(() => {
    EventBus.destroy();
    OpsLogManager.destroy();
    EventAutoLogger.destroy();
    OpsLogManager.initialize();
    EventAutoLogger.getInstance().initialize();
  });

  afterEach(() => {
    EventAutoLogger.destroy();
    OpsLogManager.destroy();
    EventBus.destroy();
    setStations(undefined);
  });

  const lastEntry = () => {
    const entries = OpsLogManager.getInstance().getEntries();

    return entries[entries.length - 1];
  };

  it('tags each entry with its station in a two-station scenario', () => {
    setStations([station('VT-01', vtModem), station('ME-02', meModem)]);

    EventBus.getInstance().emit(Events.TX_CONFIG_CHANGED, { uuid: 'ME-02-tx', modem: 1, config: meModem, action: 'transmit-on' });

    expect(lastEntry().message).toBe('M1: Transmission STARTED, 1057.00 MHz, QPSK 3/4');
    expect(lastEntry().source).toBe('ME-02 TX');
  });

  it('logs the same line once per station instead of deduping across stations', () => {
    setStations([station('VT-01', vtModem), station('ME-02', meModem)]);

    EventBus.getInstance().emit(Events.TX_CONFIG_CHANGED, { uuid: 'VT-01-tx', modem: 1, config: vtModem, action: 'transmit-off' });
    EventBus.getInstance().emit(Events.TX_CONFIG_CHANGED, { uuid: 'ME-02-tx', modem: 1, config: meModem, action: 'transmit-off' });

    const sources = OpsLogManager.getInstance()
      .getEntries()
      .filter((e) => e.message === 'M1: Transmission STOPPED')
      .map((e) => e.source);
    expect(sources).toEqual(['VT-01 TX', 'ME-02 TX']);
  });

  it('leaves a single-station scenario untagged', () => {
    setStations([station('VT-01', vtModem)]);

    EventBus.getInstance().emit(Events.TX_CONFIG_CHANGED, { uuid: 'VT-01-tx', modem: 1, config: vtModem, action: 'config' });

    expect(lastEntry().source).toBe('TX');
  });

  it('logAction writes an automatic action like a manual one, station-tagged', () => {
    EventAutoLogger.getInstance().logAction('HPA disabled (handover)', 'RF FE', 'VT-01');

    expect(lastEntry().message).toBe('HPA disabled (handover)');
    expect(lastEntry().source).toBe('VT-01 RF FE');
  });
});

describe('Phase 30 Ops Log (nats-r5 D1, D2, D3)', () => {
  beforeEach(() => {
    EventBus.destroy();
    OpsLogManager.destroy();
    EventAutoLogger.destroy();
    OpsLogManager.initialize();
    EventAutoLogger.getInstance().initialize();
  });

  afterEach(() => {
    EventAutoLogger.destroy();
    OpsLogManager.destroy();
    EventBus.destroy();
  });

  const messages = () =>
    OpsLogManager.getInstance()
      .getEntries()
      .map((e) => e.message);

  const programTrack = { trackingMode: 'program-track' as const, isPowered: true, isLocked: false, isBeaconLocked: false, isStepTrackEnabled: false, beaconFrequencyHz: 4175.5e6 };

  it('logs at advanced difficulty (nats-r5-s16-F2)', () => {
    EventAutoLogger.getInstance().logAction('HPA disabled', 'RF FE');

    expect(messages()).toEqual(['HPA disabled']);
  });

  it('writes one line per mode command, completed by the target beacon (nats-r5-s02-F1)', () => {
    const bus = EventBus.getInstance();
    // PROGRAM: no target yet, so no beacon frequency
    bus.emit(Events.ANTENNA_STATE_CHANGED, { ...programTrack, targetSatelliteId: null } as never);
    // Move to Target: the target, then the slew, each emit the state
    bus.emit(Events.ANTENNA_STATE_CHANGED, { ...programTrack, targetSatelliteId: 7 } as never);
    EventAutoLogger.getInstance().logAction('PROGRAM: slewing to TIDEMARK-1', 'ANT');
    bus.emit(Events.ANTENNA_STATE_CHANGED, { ...programTrack, targetSatelliteId: 7 } as never);

    expect(messages()).toEqual(['Tracking mode: PROGRAM-TRACK, Power ON, Antenna UNLOCKED, Beacon freq: 4175.50 MHz', 'PROGRAM: slewing to TIDEMARK-1']);
  });

  it('does not write the start-of-shift state again when the logger is rebuilt (nats-r5-s10-F1)', () => {
    const locked = { ...programTrack, isLocked: true, targetSatelliteId: 7 };
    EventBus.getInstance().emit(Events.ANTENNA_STATE_CHANGED, locked as never);
    EventAutoLogger.destroy();
    EventAutoLogger.getInstance().initialize();
    EventBus.getInstance().emit(Events.ANTENNA_STATE_CHANGED, locked as never);

    expect(messages()).toEqual(['Tracking mode: PROGRAM-TRACK, Power ON, Antenna LOCKED, Beacon freq: 4175.50 MHz']);
  });

  it('logs a new beacon frequency on the same mode', () => {
    const manual = { ...programTrack, trackingMode: 'manual' as const, targetSatelliteId: null };
    EventBus.getInstance().emit(Events.ANTENNA_STATE_CHANGED, manual as never);
    EventBus.getInstance().emit(Events.ANTENNA_STATE_CHANGED, { ...manual, beaconFrequencyHz: 4165e6 } as never);

    expect(messages()).toEqual([
      'Tracking mode: MANUAL, Power ON, Antenna UNLOCKED, Beacon freq: 4175.50 MHz',
      'Tracking mode: MANUAL, Power ON, Antenna UNLOCKED, Beacon freq: 4165.00 MHz',
    ]);
  });

  it('logs nothing emitted inside runWithoutLogging (a tab open, nats-r5-s07-F2)', () => {
    EventAutoLogger.getInstance().runWithoutLogging(() => {
      EventBus.getInstance().emit(Events.ANTENNA_STATE_CHANGED, { ...programTrack, isLocked: true, targetSatelliteId: 7 } as never);
    });
    expect(messages()).toEqual([]);

    // A real mode change afterwards still logs
    EventBus.getInstance().emit(Events.ANTENNA_STATE_CHANGED, { ...programTrack, isStepTrackEnabled: true, isLocked: true, targetSatelliteId: 7 } as never);
    expect(messages()).toEqual(['Tracking mode: PROGRAM-TRACK + STEP-TRACK, Power ON, Antenna LOCKED, Beacon freq: 4175.50 MHz']);
  });

  it('writes the RX modulation and FEC like the TX line (nats-r5-s06-F3)', () => {
    const config = { antenna_id: 1, modemNumber: 1, frequency: 1422, bandwidth: 24, modulation: 'QPSK', fec: '3/4', isPowered: true };

    expect(formatRxConfigEvent({ uuid: 'rx', modem: 1, config } as never)).toBe('M1: Tuned to 1422.00 MHz, BW 24.0 MHz, QPSK 3/4');
  });

  describe('alarm lines (nats-r5-s17-F1)', () => {
    const sun = { severity: 'warning' as const, message: 'SUN TRANSIT: ELEVATED SKY NOISE (3.1 dB)', assetId: 'VT-01', equipmentType: 'ANT', equipmentIndex: 0 };
    const signal = { severity: 'info' as const, message: 'Signal(s) Detected', assetId: 'VT-01', equipmentType: 'RX', equipmentIndex: 0 };
    const emitAlarms = (alarms: unknown[]) => EventBus.getInstance().emit(Events.ALARM_STATE_CHANGED, { alarms, highestSeverity: 'warning' } as never);

    it('logs a raise and a clear once each, stamped as SYSTEM lines with the ticker source, and skips info', () => {
      emitAlarms([sun, signal]);
      emitAlarms([{ ...sun, message: 'SUN TRANSIT: ELEVATED SKY NOISE (4.0 dB)' }, signal]);
      emitAlarms([]);

      const entries = OpsLogManager.getInstance().getEntries();
      expect(entries.map((e) => e.message)).toEqual(['ALARM raised: SUN TRANSIT: ELEVATED SKY NOISE (3.1 dB)', 'ALARM cleared: SUN TRANSIT: ELEVATED SKY NOISE (3.1 dB)']);
      expect(entries.map((e) => e.source)).toEqual(['VT-01(ANT1)', 'VT-01(ANT1)']);
      expect(entries.map((e) => e.category)).toEqual(['system', 'system']);
    });

    it('logs a flapping alarm once per 30 s', () => {
      emitAlarms([sun]);
      emitAlarms([]);
      SimClock.advanceRun(5_000);
      emitAlarms([sun]);
      emitAlarms([]);
      expect(messages()).toHaveLength(2);

      SimClock.advanceRun(30_000);
      emitAlarms([sun]);
      expect(messages()).toHaveLength(3);
    });
  });
});
