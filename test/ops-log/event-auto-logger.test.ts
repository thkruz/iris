import { vi } from 'vitest';
import type { TransmitterModem } from '../../src/equipment/transmitter/transmitter';
import { EventBus } from '../../src/events/event-bus';
import { Events } from '../../src/events/events';
import { EventAutoLogger } from '../../src/ops-log/event-auto-logger';
import { formatAntennaEvent, formatTxActiveModemEvent, formatTxConfigEvent } from '../../src/ops-log/event-formatters';
import { OpsLogManager } from '../../src/ops-log/ops-log-manager';

vi.mock('../../src/scenario-manager', () => ({
  ScenarioManager: {
    getInstance: () => ({ data: { difficulty: 'beginner' } }),
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

    expect(msg).toBe('Tracking mode: MAINTENANCE, Power ON, Satellite UNLOCKED, Beacon LOCKED');
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
