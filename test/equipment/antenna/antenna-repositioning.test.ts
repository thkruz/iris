/**
 * Phase 31 D5 (nats-r6-s03-F1, r6-s11-F1): a dish that is repositioning reads
 * UNLOCKED and does not re-acquire the beacon mid-slew; a commanded move
 * reports its arrival once, and the Ops Log writes the STOW sequence as
 * staged line, mode line, arrival line.
 */
import { vi } from 'vitest';
import { ANTENNA_CONFIG_KEYS } from '../../../src/equipment/antenna/antenna-config-keys';
import { AntennaCore, AntennaState } from '../../../src/equipment/antenna/antenna-core';
import { antennaLockLabel } from '../../../src/equipment/antenna/tracking-mode-label';
import { EventBus } from '../../../src/events/event-bus';
import { type AntennaSlewCompleteData, Events } from '../../../src/events/events';
import { EventAutoLogger } from '../../../src/ops-log/event-auto-logger';
import { OpsLogManager } from '../../../src/ops-log/ops-log-manager';

vi.mock('../../../src/simulation/simulation-manager', () => ({
  SimulationManager: {
    getInstance: vi.fn(() => ({
      update: vi.fn(),
      draw: vi.fn(),
      sync: vi.fn(),
      getSatByNoradId: vi.fn(() => ({ name: 'TIDEMARK-1' })),
      getSatsByAzEl: () => [],
      satellites: [],
      groundStations: [],
      isDeveloperMode: false,
    })),
    destroy: vi.fn(),
  },
}));

vi.mock('../../../src/scenario-manager', () => ({
  ScenarioManager: {
    getInstance: () => ({ data: { difficulty: 'advanced' } }),
  },
}));

class HeadlessAntenna extends AntennaCore {
  constructor(initialState: Partial<AntennaState> = {}) {
    super(ANTENNA_CONFIG_KEYS.C_BAND_9M_VORTEK, initialState, 1, 1);
  }

  protected override addListeners_(): void {
    // headless
  }

  syncDomWithState(): void {
    // headless
  }

  draw(): void {
    // headless
  }
}

/** Run updates (100 ms frames) until the pedestal stops, at most `maxFrames` */
function runUntilStopped(antenna: AntennaCore, maxFrames = 2_000): void {
  antenna.update(100);
  for (let i = 0; i < maxFrames && antenna.state.isSlewing; i++) {
    antenna.update(100);
  }
}

describe('Antenna repositioning (phase 31 D5)', () => {
  let arrivals: AntennaSlewCompleteData[];
  const onArrival = (data: AntennaSlewCompleteData) => arrivals.push(data);

  beforeEach(() => {
    EventBus.destroy();
    OpsLogManager.destroy();
    EventAutoLogger.destroy();
    arrivals = [];
    EventBus.getInstance().on(Events.ANTENNA_SLEW_COMPLETE, onArrival);
  });

  afterEach(() => {
    EventAutoLogger.destroy();
    OpsLogManager.destroy();
    EventBus.destroy();
  });

  it('holds the beacon unlocked while repositioning and re-acquires once there', () => {
    const antenna = new HeadlessAntenna({ trackingMode: 'maintenance', isBeaconLocked: true, isSlewing: true });
    (antenna as unknown as { rfFrontEnd_: unknown }).rfFrontEnd_ = {};
    vi.spyOn(antenna, 'measureBeaconMetrics').mockReturnValue({ power: -80, cn: 30 } as never);

    antenna.updateBeaconMetrics_();
    expect(antenna.state.isBeaconLocked).toBe(false);
    expect(antennaLockLabel(antenna.state)).toBe('UNLOCKED');

    antenna.state.isSlewing = false;
    antenna.updateBeaconMetrics_();
    expect(antenna.state.isBeaconLocked).toBe(true);
    expect(antennaLockLabel(antenna.state)).toBe('LOCKED');
  });

  it('reads UNLOCKED mid-slew even with a stale beacon flag, but not for a locked program track', () => {
    expect(antennaLockLabel({ trackingMode: 'manual', isSlewing: true, isLocked: false, isBeaconLocked: true })).toBe('UNLOCKED');
    expect(antennaLockLabel({ trackingMode: 'program-track', isSlewing: true, isLocked: true, isBeaconLocked: false })).toBe('LOCKED');
    expect(antennaLockLabel({ trackingMode: 'manual', isSlewing: false, isLocked: false, isBeaconLocked: true })).toBe('LOCKED');
  });

  it('reports one arrival for a manual move', () => {
    const antenna = new HeadlessAntenna({ trackingMode: 'manual', azimuth: 150 as never, elevation: 35 as never, targetAzimuth: 150 as never, targetElevation: 35 as never });
    antenna.update(100);

    antenna.state.targetAzimuth = 153.1 as never;
    antenna.state.targetElevation = 35.1 as never;
    runUntilStopped(antenna);
    antenna.update(100);

    expect(arrivals).toHaveLength(1);
    expect(arrivals[0]).toMatchObject({ mode: 'manual', targetSatelliteId: null, targetSatelliteName: null });
    expect(arrivals[0].azimuth).toBeCloseTo(153.1, 3);
    expect(arrivals[0].elevation).toBeCloseTo(35.1, 3);
  });

  it('reports no arrival for a tracker following its target (no command)', () => {
    const antenna = new HeadlessAntenna({
      trackingMode: 'program-track',
      azimuth: 150 as never,
      elevation: 35 as never,
      targetAzimuth: 150 as never,
      targetElevation: 35 as never,
    });
    antenna.update(100);
    for (let i = 0; i < 50; i++) {
      antenna.state.targetAzimuth = ((antenna.state.targetAzimuth as number) + 0.05) as never;
      antenna.update(100);
    }
    runUntilStopped(antenna);

    expect(arrivals).toEqual([]);
  });

  it('writes the STOW sequence: staged line, mode line, one arrival line (nats-r6-s11-F1)', () => {
    OpsLogManager.initialize();
    EventAutoLogger.getInstance().initialize();
    const antenna = new HeadlessAntenna({ trackingMode: 'program-track', elevation: 34 as never, targetElevation: 34 as never, isLocked: true });
    antenna.update(100);

    antenna.stageTrackingModeChange('stow');
    antenna.applyChanges();
    for (let i = 0; i < 2_000 && (antenna.state.isSlewing || i === 0); i++) {
      antenna.update(100);
      // A weather tick or sync re-emits the state mid-slew
      if (i % 50 === 0) EventBus.getInstance().emit(Events.ANTENNA_STATE_CHANGED, { ...antenna.state, isBeaconLocked: true });
    }
    antenna.update(100);
    EventBus.getInstance().emit(Events.ANTENNA_STATE_CHANGED, { ...antenna.state });

    expect(arrivals).toHaveLength(1);
    expect(
      OpsLogManager.getInstance()
        .getEntries()
        .map((e) => e.message)
    ).toEqual(['Tracking mode: STOW staged (El 90.0 pending APPLY)', 'Tracking mode: STOW, Power ON, Antenna UNLOCKED', 'STOW: parked (El 90.0)']);
  });
});
