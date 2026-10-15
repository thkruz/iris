import { Mock, vi } from 'vitest';
import { Events } from '../../src/events/events';
import { AlarmService } from '../../src/services/alarm-service';
import { SimClock } from '../../src/simulation/sim-clock';

type AlarmLike = { severity: string; message: string };

type GroundStationLike = {
  state: { id: string; isOperational: boolean };
  antennas: Array<{ getStatusAlarms: () => AlarmLike[] }>;
  rfFrontEnds: Array<{ getStatusAlarms: (rfCase: number) => AlarmLike[] }>;
  transmitters: Array<{ getStatusAlarms: () => AlarmLike[] }>;
  receivers: Array<{ getStatusAlarms: () => AlarmLike[] }>;
};

let updateHandler: ((dt: any) => void) | null = null;

const mockEventBus = {
  on: vi.fn((event: string, cb: (dt: any) => void) => {
    if (event === Events.UPDATE) updateHandler = cb;
  }),
  off: vi.fn(),
  emit: vi.fn(),
  once: vi.fn(),
  clear: vi.fn(),
};

const mockSimulationManager = {
  groundStations: [] as GroundStationLike[],
};

const mockSimulationGetInstance = vi.fn(() => mockSimulationManager);

vi.mock('@app/events/event-bus', () => ({
  EventBus: {
    getInstance: () => mockEventBus,
  },
}));

vi.mock('@app/simulation/simulation-manager', () => ({
  SimulationManager: {
    getInstance: () => mockSimulationGetInstance(),
  },
}));

function gs(overrides: Partial<GroundStationLike> = {}): GroundStationLike {
  return {
    state: { id: 'gs-1', isOperational: true },
    antennas: [],
    rfFrontEnds: [],
    transmitters: [],
    receivers: [],
    ...overrides,
  };
}

function alarm(severity: string, message: string): AlarmLike {
  return { severity, message };
}

/** Past the service's start-up settle (Phase 31 D2), so the next UPDATE polls */
function settleService(): void {
  SimClock.advanceRun(AlarmService.STARTUP_SETTLE_MS);
}

describe('AlarmService', () => {
  beforeEach(() => {
    (AlarmService as any).instance_ = null;
    updateHandler = null;
    mockSimulationManager.groundStations = [];

    mockEventBus.on.mockClear();
    mockEventBus.off.mockClear();
    mockEventBus.emit.mockClear();

    mockSimulationGetInstance.mockClear();

    vi.spyOn(Date, 'now').mockReturnValue(1000);
  });

  afterEach(() => {
    (Date.now as Mock).mockRestore?.();
    (AlarmService as any).instance_ = null;
    updateHandler = null;
    vi.clearAllMocks();
  });

  it('registers an UPDATE handler and emits every displayable alarm, most severe first (nats-r4-s16-F1)', () => {
    const service = AlarmService.getInstance();
    expect(service).toBeDefined();

    expect(mockEventBus.on).toHaveBeenCalledWith(Events.UPDATE, expect.any(Function));
    expect(typeof updateHandler).toBe('function');

    const operational = gs({
      state: { id: 'alpha', isOperational: true },
      antennas: [
        {
          getStatusAlarms: vi.fn().mockReturnValue([alarm('error', 'ANT FAIL'), alarm('success', 'OK')]),
        },
      ],
      rfFrontEnds: [
        {
          getStatusAlarms: vi.fn().mockImplementation((rfCase: number) => (rfCase === 1 ? [alarm('warning', 'RF WARN')] : [alarm('info', 'RF INFO')])),
        },
      ],
      transmitters: [{ getStatusAlarms: vi.fn().mockReturnValue([alarm('info', 'TX INFO')]) }],
      receivers: [{ getStatusAlarms: vi.fn().mockReturnValue([alarm('warning', 'RX WARN')]) }],
    });

    const nonOperational = gs({
      state: { id: 'beta', isOperational: false },
      antennas: [{ getStatusAlarms: vi.fn().mockReturnValue([alarm('error', 'NOPE')]) }],
    });

    mockSimulationManager.groundStations = [operational, nonOperational];

    settleService();
    updateHandler?.(16);

    expect(mockSimulationGetInstance).toHaveBeenCalled();
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      Events.ALARM_STATE_CHANGED,
      expect.objectContaining({
        highestSeverity: 'error',
        alarms: [
          expect.objectContaining({
            severity: 'error',
            message: 'ANT FAIL',
            assetId: 'alpha',
            equipmentType: 'ANT',
            equipmentIndex: 0,
          }),
          expect.objectContaining({ severity: 'warning', message: 'RF WARN' }),
          expect.objectContaining({ severity: 'warning', message: 'RX WARN' }),
          expect.objectContaining({ severity: 'info', message: 'RF INFO' }),
          expect.objectContaining({ severity: 'info', message: 'TX INFO' }),
        ],
      })
    );

    // RF front ends should be polled for both cases (1 and 2)
    expect(operational.rfFrontEnds[0].getStatusAlarms).toHaveBeenCalledWith(1);
    expect(operational.rfFrontEnds[0].getStatusAlarms).toHaveBeenCalledWith(2);
  });

  it('does not emit ALARM_STATE_CHANGED when the alarm set is unchanged', () => {
    AlarmService.getInstance();

    const operational = gs({
      state: { id: 'alpha', isOperational: true },
      antennas: [{ getStatusAlarms: vi.fn().mockReturnValue([alarm('warning', 'W')]) }],
    });

    mockSimulationManager.groundStations = [operational];

    settleService();
    updateHandler?.(16);
    SimClock.advanceRun(1500);
    updateHandler?.(16);

    // First tick should emit, second should be suppressed as unchanged
    const emits = mockEventBus.emit.mock.calls.filter(([event]) => event === Events.ALARM_STATE_CHANGED);
    expect(emits.length).toBe(1);
  });

  it('emits success when no displayable alarms exist', () => {
    AlarmService.getInstance();

    const operational = gs({
      state: { id: 'alpha', isOperational: true },
      antennas: [{ getStatusAlarms: vi.fn().mockReturnValue([alarm('success', 'OK')]) }],
      transmitters: [{ getStatusAlarms: vi.fn().mockReturnValue([]) }],
      receivers: [{ getStatusAlarms: vi.fn().mockReturnValue([]) }],
    });

    mockSimulationManager.groundStations = [operational];

    settleService();
    updateHandler?.(16);

    expect(mockEventBus.emit).toHaveBeenCalledWith(
      Events.ALARM_STATE_CHANGED,
      expect.objectContaining({
        highestSeverity: 'success',
        alarms: [],
      })
    );
  });

  it('keeps an info alarm on the ticker while a warning is up (nats-r4-s17-F3)', () => {
    AlarmService.getInstance();
    mockSimulationManager.groundStations = [
      gs({
        antennas: [{ getStatusAlarms: vi.fn().mockReturnValue([alarm('warning', 'SUN TRANSIT: ELEVATED SKY NOISE (2.4 dB)')]) }],
        receivers: [{ getStatusAlarms: vi.fn().mockReturnValue([alarm('info', 'Signal(s) Detected')]) }],
      }),
    ];

    settleService();
    updateHandler?.(16);

    const [, data] = mockEventBus.emit.mock.calls.find(([event]) => event === Events.ALARM_STATE_CHANGED) ?? [];
    expect(data.highestSeverity).toBe('warning');
    expect(data.alarms.map((a: { message: string }) => a.message)).toEqual(['SUN TRANSIT: ELEVATED SKY NOISE', 'Signal(s) Detected']);
    expect(data.alarms[0].detail).toBe('2.4 dB');
  });

  describe('start-up settle (Phase 31 D2, nats-r6-s01-F1)', () => {
    it('does not poll until 1 s of run time after the service was built', () => {
      SimClock.advanceRun(5_000);
      AlarmService.getInstance();
      mockSimulationManager.groundStations = [gs({ antennas: [{ getStatusAlarms: vi.fn().mockReturnValue([alarm('warning', 'W')]) }] })];
      const emits = () => mockEventBus.emit.mock.calls.filter(([event]) => event === Events.ALARM_STATE_CHANGED).length;

      updateHandler?.(16);
      SimClock.advanceRun(900);
      updateHandler?.(16);
      expect(emits()).toBe(0);
      expect(mockSimulationGetInstance).not.toHaveBeenCalled();

      SimClock.advanceRun(100);
      updateHandler?.(16);
      expect(emits()).toBe(1);
    });

    it('settles again when run time restarts for a new scenario', () => {
      AlarmService.getInstance();
      mockSimulationManager.groundStations = [gs({ antennas: [{ getStatusAlarms: vi.fn().mockReturnValue([alarm('warning', 'W')]) }] })];
      settleService();
      SimClock.advanceRun(5_000);
      updateHandler?.(16);
      expect(mockSimulationGetInstance).toHaveBeenCalledTimes(1);

      SimClock.reset();
      SimClock.advanceRun(500);
      updateHandler?.(16);
      expect(mockSimulationGetInstance).toHaveBeenCalledTimes(1);
      SimClock.advanceRun(1_000);
      updateHandler?.(16);
      expect(mockSimulationGetInstance).toHaveBeenCalledTimes(2);
    });
  });

  describe('raise time (nats-r4-s01-F2)', () => {
    afterEach(() => {
      AlarmService.destroy();
    });

    it('stamps the time an alarm was first seen and keeps it while its live number moves', () => {
      AlarmService.destroy();
      const rf = { getStatusAlarms: vi.fn((rfCase: number) => (rfCase === 1 ? [alarm('error', 'BUC over-temperature (72.3 °C)')] : [])) };
      const station = gs({ state: { id: 'VT-01', isOperational: true }, rfFrontEnds: [rf] });

      (Date.now as Mock).mockReturnValue(5_000);
      expect(AlarmService.getAlarms(station as any)[0].raisedAtMs).toBe(5_000);

      // Rendered a minute later, the temperature has moved: same alarm, same raise time
      (Date.now as Mock).mockReturnValue(65_000);
      rf.getStatusAlarms.mockImplementation((rfCase: number) => (rfCase === 1 ? [alarm('error', 'BUC over-temperature (72.0 °C)')] : []));
      expect(AlarmService.getAlarms(station as any)[0].raisedAtMs).toBe(5_000);
    });

    it('records the raise on the poll, before any Dashboard render, and stamps a re-raise afresh', () => {
      AlarmService.destroy();
      AlarmService.getInstance();
      const antenna = { getStatusAlarms: vi.fn().mockReturnValue([alarm('warning', 'ACQUIRING LOCK...')]) };
      const station = gs({ state: { id: 'VT-01', isOperational: true }, antennas: [antenna] });
      mockSimulationManager.groundStations = [station];

      (Date.now as Mock).mockReturnValue(1_000);
      settleService();
      updateHandler?.(16);
      const [, polled] = mockEventBus.emit.mock.calls.find(([event]) => event === Events.ALARM_STATE_CHANGED) ?? [];
      expect(polled.alarms[0].raisedAtMs).toBe(1_000);

      // The Dashboard opens later and reads the poll's raise time, not its own
      (Date.now as Mock).mockReturnValue(400_000);
      expect(AlarmService.getAlarms('VT-01')[0].raisedAtMs).toBe(1_000);

      // Cleared on a poll, raised again later: a new raise time
      antenna.getStatusAlarms.mockReturnValue([]);
      SimClock.advanceRun(1_000);
      updateHandler?.(16);
      antenna.getStatusAlarms.mockReturnValue([alarm('warning', 'ACQUIRING LOCK...')]);
      expect(AlarmService.getAlarms('VT-01')[0].raisedAtMs).toBe(400_000);
    });
  });

  it('unsubscribes from UPDATE when destroyed', () => {
    AlarmService.getInstance();
    const handler = updateHandler;

    AlarmService.destroy();

    expect(handler).toBeTruthy();
    expect(mockEventBus.off).toHaveBeenCalledWith(Events.UPDATE, handler);

    // Should allow a new instance later
    const next = AlarmService.getInstance();
    expect(next).toBeDefined();
  });

  describe('fixed labels (nats-r5-s05-F1, nats-r5-s14-F2)', () => {
    type ModemInfo = { hasCarrier: boolean; hasLock: boolean; isLowMargin: boolean; effectiveEsN0_dB: number; requiredEsN0_dB: number };
    const receiver = (infos: Record<number, ModemInfo>, powered = true) => ({
      getStatusAlarms: vi.fn().mockReturnValue([alarm('info', 'Signal(s) Detected')]),
      state: { modems: Object.keys(infos).map((n) => ({ modemNumber: Number(n), isPowered: powered })) },
      getSignalsInBandwidth: vi.fn((modem: { modemNumber: number }) => infos[modem.modemNumber]),
    });
    const locked = (esN0: number, isLowMargin: boolean): ModemInfo => ({ hasCarrier: true, hasLock: true, isLowMargin, effectiveEsN0_dB: esN0, requiredEsN0_dB: 5 });

    it('raises "Degraded margin" for a locked modem inside 1 dB of Required, with the Es/N0 in the detail', () => {
      const station = gs({ state: { id: 'VT-01', isOperational: true }, receivers: [receiver({ 1: locked(5.6, true) }) as any] });
      const degraded = AlarmService.getAlarms(station as any).find((a) => a.message === 'Degraded margin');
      expect(degraded).toEqual(expect.objectContaining({ severity: 'warning', equipmentType: 'RX', equipmentIndex: 0 }));
      expect(degraded?.detail).toBe('Modem 1: Es/N0 5.6 dB, need 5.0 dB');
    });

    it('raises nothing for a healthy margin, an unlocked modem or a powered-off modem', () => {
      const healthy = gs({ receivers: [receiver({ 1: locked(12, false) }) as any] });
      const unlocked = gs({ receivers: [receiver({ 1: { ...locked(4, false), hasLock: false } }) as any] });
      const off = gs({ receivers: [receiver({ 1: locked(5.6, true) }, false) as any] });
      for (const station of [healthy, unlocked, off]) {
        expect(AlarmService.getAlarms(station as any).map((a) => a.message)).toEqual(['Signal(s) Detected']);
      }
    });

    it('keeps one label while the live value moves, so the raise time holds', () => {
      AlarmService.destroy();
      const infos = { 1: locked(5.6, true) };
      const station = gs({ state: { id: 'VT-01', isOperational: true }, receivers: [receiver(infos) as any] });
      (Date.now as Mock).mockReturnValue(5_000);
      expect(AlarmService.getAlarms(station as any)[0].raisedAtMs).toBe(5_000);
      infos[1] = locked(5.3, true);
      (Date.now as Mock).mockReturnValue(9_000);
      const [first] = AlarmService.getAlarms(station as any);
      expect(first.message).toBe('Degraded margin');
      expect(first.detail).toBe('Modem 1: Es/N0 5.3 dB, need 5.0 dB');
      expect(first.raisedAtMs).toBe(5_000);
      AlarmService.destroy();
    });

    it('labels the rain-fade alarm "RAIN FADE" for its life and moves the depth into the detail', () => {
      const antenna = { getStatusAlarms: vi.fn().mockReturnValue([alarm('info', 'RAIN FADE (0.5 dB)')]) };
      const station = gs({ antennas: [antenna] });
      expect(AlarmService.getAlarms(station as any)[0]).toEqual(expect.objectContaining({ message: 'RAIN FADE', detail: 'fade 0.5 dB' }));
      antenna.getStatusAlarms.mockReturnValue([alarm('info', 'RAIN FADE (0.7 dB)')]);
      expect(AlarmService.getAlarms(station as any)[0]).toEqual(expect.objectContaining({ message: 'RAIN FADE', detail: 'fade 0.7 dB' }));
    });

    it.each([
      ['BUC high current draw (4.52 A)', 'BUC high current draw', '4.52 A'],
      ['BUC over-temperature (72.0 °C)', 'BUC over-temperature', '72.0 °C'],
      ['BUC approaching saturation (41.3 dBm)', 'BUC approaching saturation', '41.3 dBm'],
      ['HPA over-temperature (71°C)', 'HPA over-temperature', '71°C'],
      ['SUN TRANSIT: ELEVATED SKY NOISE (8.6 dB)', 'SUN TRANSIT: ELEVATED SKY NOISE', '8.6 dB'],
      ['ICE ON FEED (2.6 dB)', 'ICE ON FEED', '2.6 dB'],
      ['HIGH POLARIZATION (12.5°)', 'HIGH POLARIZATION', '12.5°'],
      ['AGC at max gain (29.8 dB) - weak signal', 'AGC at max gain - weak signal', '29.8 dB'],
      ['AGC at min gain (-29.8 dB) - possible interference', 'AGC at min gain - possible interference', '-29.8 dB'],
      ['LNB noise figure degraded (1.20 dB)', 'LNB noise figure degraded', '1.20 dB'],
      ['GPSDO in holdover (1.5 μs error)', 'GPSDO in holdover', '1.5 μs error'],
    ])('moves the live value of "%s" into the detail (Phase 31 D3)', (raw, label, detail) => {
      const station = gs({ antennas: [{ getStatusAlarms: vi.fn().mockReturnValue([alarm('warning', raw)]) }] });
      expect(AlarmService.getAlarms(station as any)[0]).toEqual(expect.objectContaining({ message: label, detail }));
    });

    it('leaves a label with no parenthesised value alone', () => {
      const station = gs({
        antennas: [{ getStatusAlarms: vi.fn().mockReturnValue([alarm('warning', 'ACQUIRING LOCK...'), alarm('warning', 'LNB input overload - 1.2 dB gain compression')]) }],
      });
      const alarms = AlarmService.getAlarms(station as any);
      expect(alarms.map((a) => a.message)).toEqual(['ACQUIRING LOCK...', 'LNB input overload - 1.2 dB gain compression']);
      expect(alarms.map((a) => a.detail)).toEqual([undefined, undefined]);
    });

    it('publishes the moving value on the next poll under the same label and raise time', () => {
      AlarmService.destroy();
      AlarmService.getInstance();
      const rf = { getStatusAlarms: vi.fn((rfCase: number) => (rfCase === 1 ? [alarm('error', 'BUC over-temperature (72.0 °C)')] : [])) };
      mockSimulationManager.groundStations = [gs({ state: { id: 'VT-01', isOperational: true }, rfFrontEnds: [rf] })];
      (Date.now as Mock).mockReturnValue(5_000);
      settleService();
      updateHandler?.(16);
      rf.getStatusAlarms.mockImplementation((rfCase: number) => (rfCase === 1 ? [alarm('error', 'BUC over-temperature (73.4 °C)')] : []));
      (Date.now as Mock).mockReturnValue(6_000);
      SimClock.advanceRun(1_000);
      updateHandler?.(16);
      const published = mockEventBus.emit.mock.calls.filter(([event]) => event === Events.ALARM_STATE_CHANGED).map(([, data]) => data.alarms[0]);
      expect(published).toHaveLength(2);
      expect(published.map((a) => [a.message, a.detail, a.raisedAtMs])).toEqual([
        ['BUC over-temperature', '72.0 °C', 5_000],
        ['BUC over-temperature', '73.4 °C', 5_000],
      ]);
      AlarmService.destroy();
    });
  });

  describe('getAlarms (per-station, unfiltered)', () => {
    const station = () =>
      gs({
        state: { id: 'alpha', isOperational: true },
        antennas: [{ getStatusAlarms: vi.fn().mockReturnValue([alarm('info', 'ANT INFO'), alarm('success', 'LOCKED')]) }],
        rfFrontEnds: [{ getStatusAlarms: vi.fn().mockImplementation((rfCase: number) => (rfCase === 1 ? [alarm('warning', 'RF WARN')] : [])) }],
        transmitters: [{ getStatusAlarms: vi.fn().mockReturnValue([alarm('warning', 'TX WARN')]) }],
        receivers: [{ getStatusAlarms: vi.fn().mockReturnValue([alarm('error', 'RX FAIL')]) }],
      });

    it('returns every displayable alarm from every module, most severe first', () => {
      const alarms = AlarmService.getAlarms(station() as any);
      expect(alarms.map((a) => a.message)).toEqual(['RX FAIL', 'RF WARN', 'TX WARN', 'ANT INFO']);
      expect(alarms.map((a) => a.equipmentType)).toEqual(['RX', 'RF', 'TX', 'ANT']);
    });

    it('looks a station up by id and ignores other stations', () => {
      const other = gs({ state: { id: 'beta', isOperational: true }, antennas: [{ getStatusAlarms: vi.fn().mockReturnValue([alarm('error', 'BETA FAIL')]) }] });
      mockSimulationManager.groundStations = [station(), other];
      expect(AlarmService.getAlarms('alpha').map((a) => a.message)).not.toContain('BETA FAIL');
      expect(AlarmService.getAlarms('beta').map((a) => a.message)).toEqual(['BETA FAIL']);
      expect(AlarmService.getAlarms('missing')).toEqual([]);
    });

    it('returns nothing for a non-operational station, as the ticker does', () => {
      const offline = station();
      offline.state.isOperational = false;
      expect(AlarmService.getAlarms(offline as any)).toEqual([]);
    });

    it('needs no service instance', () => {
      AlarmService.getAlarms(station() as any);
      expect(mockEventBus.on).not.toHaveBeenCalled();
    });
  });
});
