import { Mock, vi } from 'vitest';
import { Events } from '../../src/events/events';
import { AlarmService } from '../../src/services/alarm-service';

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

    (Date.now as Mock).mockReturnValueOnce(1000).mockReturnValueOnce(2500);

    updateHandler?.(16);
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

    updateHandler?.(16);

    const [, data] = mockEventBus.emit.mock.calls.find(([event]) => event === Events.ALARM_STATE_CHANGED) ?? [];
    expect(data.highestSeverity).toBe('warning');
    expect(data.alarms.map((a: { message: string }) => a.message)).toEqual(['SUN TRANSIT: ELEVATED SKY NOISE (2.4 dB)', 'Signal(s) Detected']);
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
      updateHandler?.(16);
      const [, polled] = mockEventBus.emit.mock.calls.find(([event]) => event === Events.ALARM_STATE_CHANGED) ?? [];
      expect(polled.alarms[0].raisedAtMs).toBe(1_000);

      // The Dashboard opens later and reads the poll's raise time, not its own
      (Date.now as Mock).mockReturnValue(400_000);
      expect(AlarmService.getAlarms('VT-01')[0].raisedAtMs).toBe(1_000);

      // Cleared on a poll, raised again later: a new raise time
      antenna.getStatusAlarms.mockReturnValue([]);
      (AlarmService as any).instance_.lastPollTime_ = -Infinity;
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
