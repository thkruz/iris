import { Mock, Mocked, vi } from 'vitest';
import { GroundStation } from '../../../../src/assets/ground-station/ground-station';
import { EventBus } from '../../../../src/events/event-bus';
import { Events } from '../../../../src/events/events';
import { OpsLogManager } from '../../../../src/ops-log/ops-log-manager';
import { DashboardTab } from '../../../../src/pages/mission-control/tabs/dashboard-tab';
import { AlarmService } from '../../../../src/services/alarm-service';
import { SimClock } from '../../../../src/simulation/sim-clock';

// Mock dependencies
vi.mock('../../../../src/events/event-bus');
vi.mock('../../../../src/assets/ground-station/ground-station');

// Mock image imports
vi.mock('../../../../src/assets/icons/antenna.png', () => ({ default: 'antenna.png' }));
vi.mock('../../../../src/assets/icons/radio.png', () => ({ default: 'radio.png' }));
vi.mock('../../../../src/assets/icons/arrow-big-down-lines.png', () => ({ default: 'rx.png' }));
vi.mock('../../../../src/assets/icons/arrow-big-up-lines.png', () => ({ default: 'tx.png' }));

describe('DashboardTab', () => {
  let mockGroundStation: Mocked<GroundStation>;
  let containerEl: HTMLElement;
  let tab: DashboardTab;
  let mockEventBus: { on: Mock; off: Mock; emit: Mock };

  const mockLocation = {
    latitude: 38.897,
    longitude: -77.037,
    elevation: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock EventBus
    mockEventBus = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    };
    (EventBus.getInstance as Mock).mockReturnValue(mockEventBus);

    // Setup mock GroundStation
    mockGroundStation = {
      state: {
        id: 'GS-001',
        name: 'Test Ground Station',
        location: mockLocation,
        isOperational: true,
      },
      antennas: [
        {
          state: {
            azimuth: 180,
            elevation: 45,
            trackingMode: 'manual',
            isLocked: false,
            isBeaconLocked: false,
            beaconCN: null,
            hasFault: false,
            isPowered: true,
            isStepTrackEnabled: false,
          },
          getStatusAlarms: vi.fn().mockReturnValue([]),
        },
      ],
      rfFrontEnds: [
        {
          gpsdoModule: {
            state: {
              isLocked: true,
              satelliteCount: 8,
              isInHoldover: false,
              warmupTimeRemaining: 0,
              isPowered: true,
            },
            formatWarmupTime_: vi.fn().mockReturnValue('READY'),
          },
          lnbModule: {
            state: {
              isExtRefLocked: true,
              noiseTemperature: 60,
              isPowered: true,
            },
          },
          filterModule: {
            state: {
              bandwidth: 36,
            },
          },
          bucModule: {
            state: {
              isExtRefLocked: true,
              outputPower: 35,
              isPowered: true,
              isMuted: false,
            },
            outputSignals: [{ power: 35 }],
            hasRfOutput: vi.fn().mockReturnValue(true),
          },
          hpaModule: {
            state: {
              outputPower: 44,
              isOverdriven: false,
              isPowered: true,
              isHpaEnabled: true,
            },
            outputSignals: [{ power: 44 }],
          },
          getStatusAlarms: vi.fn().mockReturnValue([]),
        },
      ],
      transmitters: [
        {
          state: {
            modems: [
              { isPowered: true, isTransmitting: false, isFaulted: false },
              { isPowered: false, isTransmitting: false, isFaulted: false },
            ],
          },
          getPowerPercentage: vi.fn().mockReturnValue(50),
          getStatusAlarms: vi.fn().mockReturnValue([]),
        },
      ],
      receivers: [
        {
          state: {
            modems: [{ isPowered: true }, { isPowered: true }],
            availableSignals: [],
          },
          getSnrForModem: vi.fn().mockReturnValue(15),
          getSignalsInBandwidth: vi.fn().mockReturnValue({ hasCarrier: true, hasLock: true }),
          getStatusAlarms: vi.fn().mockReturnValue([]),
        },
      ],
      initializeEquipment: vi.fn(),
    } as unknown as Mocked<GroundStation>;

    // Setup container
    containerEl = document.createElement('div');
    containerEl.id = 'dashboard-container';
    document.body.appendChild(containerEl);

    tab = new DashboardTab(mockGroundStation, 'dashboard-container');
  });

  afterEach(() => {
    tab.dispose();
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    it('should create instance', () => {
      expect(tab).toBeInstanceOf(DashboardTab);
    });

    it('should initialize equipment if not already done', () => {
      const emptyGs = {
        ...mockGroundStation,
        antennas: [],
        rfFrontEnds: [],
        transmitters: [],
        receivers: [],
      } as unknown as Mocked<GroundStation>;

      const containerEl2 = document.createElement('div');
      containerEl2.id = 'dashboard-container-2';
      document.body.appendChild(containerEl2);

      new DashboardTab(emptyGs, 'dashboard-container-2');
      expect(emptyGs.initializeEquipment).toHaveBeenCalled();
    });

    it('should register for UPDATE events', () => {
      expect(mockEventBus.on).toHaveBeenCalledWith(Events.UPDATE, expect.any(Function));
    });
  });

  describe('HTML rendering', () => {
    it('should display station name', () => {
      const stationName = document.body.querySelector('h4');
      expect(stationName?.textContent).toContain('Test Ground Station');
    });

    it('should display station location', () => {
      const dashboardEl = document.querySelector('.dashboard-tab');
      expect(dashboardEl?.innerHTML).toContain('38.8970');
      expect(dashboardEl?.innerHTML).toContain('-77.0370');
    });

    it('should display equipment counts', () => {
      const antennaCount = document.querySelector('#antenna-count');
      expect(antennaCount?.textContent).toBe('1');
    });
  });

  describe('clickable cards', () => {
    it('should emit SWITCH_TAB event when card is clicked', () => {
      const card = document.querySelector('[data-target-tab="acu-control"]') as HTMLElement;
      card?.click();

      expect(mockEventBus.emit).toHaveBeenCalledWith(Events.SWITCH_TAB, { tabId: 'acu-control' });
    });
  });

  describe('activate/deactivate', () => {
    it('should show tab on activate', () => {
      tab.activate();
      const dashboardEl = document.querySelector('.dashboard-tab') as HTMLElement;
      expect(dashboardEl?.style.display).toBe('block');
    });

    it('should hide tab on deactivate', () => {
      tab.deactivate();
      const dashboardEl = document.querySelector('.dashboard-tab') as HTMLElement;
      expect(dashboardEl?.style.display).toBe('none');
    });
  });

  describe('dispose', () => {
    it('should unregister from UPDATE events', () => {
      tab.dispose();

      expect(mockEventBus.off).toHaveBeenCalledWith(Events.UPDATE, expect.any(Function));
    });

    it('should remove DOM element', () => {
      tab.dispose();
      const dashboardEl = document.querySelector('.dashboard-tab');
      expect(dashboardEl).toBeNull();
    });
  });

  describe('state synchronization', () => {
    it('should update station status display', () => {
      const statusEl = document.querySelector('#station-status');
      expect(statusEl?.textContent).toBe('OPERATIONAL');
      expect(statusEl?.classList.contains('status-badge-green')).toBe(true);
    });

    it('should update active receivers count', () => {
      const rxEl = document.querySelector('#active-receivers');
      expect(rxEl?.textContent).toBe('2');
    });

    it("Best SNR is the modem card's Effective C/N, not the raw C/N (Phase 30 D8, nats-r5-s07-F1)", () => {
      tab.dispose();
      document.body.innerHTML = '';
      const rx = mockGroundStation.receivers[0] as unknown as { getSignalsInBandwidth: ReturnType<typeof vi.fn> };
      rx.getSignalsInBandwidth.mockReturnValue({ hasCarrier: true, hasLock: true, cnRatio_dB: 50.7, effectiveCnRatio_dB: 39.5 });
      containerEl = document.createElement('div');
      containerEl.id = 'dashboard-container';
      document.body.appendChild(containerEl);
      tab = new DashboardTab(mockGroundStation, 'dashboard-container');
      expect(document.querySelector('#rx-snr')?.textContent).toBe('39.5 dB');
    });

    it('should update active transmitters count', () => {
      const txEl = document.querySelector('#active-transmitters');
      expect(txEl?.textContent).toBe('1');
    });

    it('Equipment Summary counts installed modems, the same scope as Quick Stats (phase 27, r2-s09-F1)', () => {
      expect(document.querySelector('#tx-count')?.textContent).toBe('2');
      expect(document.querySelector('#rx-count')?.textContent).toBe('2');
      const labels = [...document.querySelectorAll('.equipment-item-label')].map((el) => el.textContent);
      expect(labels).toContain('TX Modems');
      expect(labels).toContain('RX Modems');
    });

    it('labels Quick Stats as powered modems, which is what it counts (s01-F19)', () => {
      const labels = [...document.querySelectorAll('.quick-stat-label')].map((el) => el.textContent);
      expect(labels).toContain('RX Modems On');
      expect(labels).toContain('TX Modems On');
    });

    it('lights the antenna fault LED green when healthy, red on fault (s01-F14)', () => {
      expect(document.querySelector('#antenna-fault-led')?.className).toContain('success');
      (mockGroundStation.antennas[0].state as { hasFault: boolean }).hasFault = true;
      vi.spyOn(Date, 'now').mockReturnValue(10_000_000);
      const updateHandler = mockEventBus.on.mock.calls.find((call: unknown[]) => call[0] === Events.UPDATE)?.[1];
      updateHandler();
      expect(document.querySelector('#antenna-fault-led')?.className).toContain('error');
    });

    it('shows step-track on the antenna mode badge (s01-F3)', () => {
      const state = mockGroundStation.antennas[0].state as { trackingMode: string; isStepTrackEnabled: boolean };
      state.trackingMode = 'program-track';
      state.isStepTrackEnabled = true;
      vi.spyOn(Date, 'now').mockReturnValue(20_000_000);
      const updateHandler = mockEventBus.on.mock.calls.find((call: unknown[]) => call[0] === Events.UPDATE)?.[1];
      updateHandler();
      expect(document.querySelector('#antenna-mode')?.textContent).toBe('PROGRAM TRACK + STEP');
    });

    it('turns the mode badge and the antenna LED red under an ACU automation fault (nats-r3-s23-F1)', () => {
      const state = mockGroundStation.antennas[0].state as { trackingMode: string; isStepTrackEnabled: boolean; isAcuAutomationFaulted: boolean };
      state.trackingMode = 'program-track';
      state.isStepTrackEnabled = false;
      state.isAcuAutomationFaulted = true;
      vi.spyOn(Date, 'now').mockReturnValue(30_000_000);
      const updateHandler = mockEventBus.on.mock.calls.find((call: unknown[]) => call[0] === Events.UPDATE)?.[1];
      updateHandler();
      const mode = document.querySelector('#antenna-mode');
      expect(mode?.textContent).toBe('PROGRAM TRACK (OFFLINE)');
      expect(mode?.className).toContain('status-badge-red');
      expect(mode?.className).not.toContain('status-badge-green');
      expect(document.querySelector('#antenna-fault-led')?.className).toContain('error');
    });
  });

  describe('readouts agree with the equipment tabs (phase 29 D4)', () => {
    const resync = (now: number) => {
      vi.spyOn(Date, 'now').mockReturnValue(now);
      const updateHandler = mockEventBus.on.mock.calls.find((call: unknown[]) => call[0] === Events.UPDATE)?.[1];
      updateHandler();
    };

    it('RF Chain RX reads LNB OFF and Noise Temp -- while the LNB is powered off (nats-r5-s12-F1)', () => {
      const lnb = (mockGroundStation.rfFrontEnds[0] as any).lnbModule;
      lnb.state.isPowered = false;
      lnb.state.isExtRefLocked = false;
      lnb.state.noiseTemperature = 290;
      resync(45_000_000);
      expect(document.querySelector('#lnb-lock .small')?.textContent).toBe('OFF');
      expect(document.querySelector('#lnb-lock .card-alarm-led')?.className).toContain('off');
      expect(document.querySelector('#lnb-noise')?.textContent).toBe('--');
    });

    it('GPSDO warm-up reads what the GPS Timing tab reads (nats-r4-s01-F3)', () => {
      expect(document.querySelector('#gpsdo-warmup')?.textContent).toBe('READY');
    });

    it('RF Chain TX reads the TX Chain levels, and no level when there is no RF (nats-r4-s08-F4)', () => {
      expect(document.querySelector('#buc-output')?.textContent).toBe('35.0 dBm');
      expect(document.querySelector('#hpa-power')?.textContent).toBe('44.0 dBm');

      // A modem dropout: nothing in the BUC passband, the HPA undriven. The
      // modules hold their no-output floors (-120 / -90 dBm), never shown
      const rfFe = mockGroundStation.rfFrontEnds[0] as unknown as {
        bucModule: { state: { outputPower: number }; outputSignals: unknown[]; hasRfOutput: Mock };
        hpaModule: { state: { outputPower: number }; outputSignals: unknown[] };
      };
      rfFe.bucModule.state.outputPower = -120;
      rfFe.bucModule.outputSignals = [];
      rfFe.bucModule.hasRfOutput.mockReturnValue(false);
      rfFe.hpaModule.state.outputPower = -90;
      rfFe.hpaModule.outputSignals = [];
      resync(40_000_000);
      expect(document.querySelector('#buc-output')?.textContent).toBe('-- dBm');
      expect(document.querySelector('#hpa-power')?.textContent).toBe('-- dBm');
    });
  });

  describe('alarms (same source as the ticker)', () => {
    const sync = (now: number) => {
      vi.spyOn(Date, 'now').mockReturnValue(now);
      const updateHandler = mockEventBus.on.mock.calls.find((call: unknown[]) => call[0] === Events.UPDATE)?.[1];
      updateHandler();
    };

    it('lists every module alarm for the station, most severe first, and counts every listed row', () => {
      (mockGroundStation.receivers[0].getStatusAlarms as Mock).mockReturnValue([{ severity: 'warning', message: 'RX lost lock' }]);
      (mockGroundStation.antennas[0].getStatusAlarms as Mock).mockReturnValue([
        { severity: 'info', message: 'LOOPBACK ENABLED' },
        { severity: 'success', message: 'LOCKED ON SATELLITE' },
      ]);
      (mockGroundStation.transmitters[0].getStatusAlarms as Mock).mockReturnValue([{ severity: 'error', message: 'Modem 1 Faulted' }]);
      (mockGroundStation.rfFrontEnds[0].getStatusAlarms as Mock).mockImplementation((rfCase: number) => (rfCase === 2 ? [{ severity: 'warning', message: 'LNB not locked' }] : []));

      sync(30_000_000);

      const messages = [...document.querySelectorAll('#alarm-list .alarm-message')].map((el) => el.textContent);
      expect(messages).toEqual(['Modem 1 Faulted', 'LNB not locked', 'RX lost lock', 'LOOPBACK ENABLED']);
      expect(document.querySelector('#alarm-count')?.textContent).toBe('4');
      expect(document.querySelector('#alarm-list .no-alarms')).toBeNull();
    });

    it('lists an advisory without the "No active alarms" placeholder and counts it, as the ticker badge does (nats-r5-s01-F1)', () => {
      (mockGroundStation.antennas[0].getStatusAlarms as Mock).mockReturnValue([{ severity: 'info', message: 'LOOPBACK ENABLED' }]);

      sync(40_000_000);

      expect(document.querySelector('#alarm-list .no-alarms')).toBeNull();
      expect(document.querySelector('#alarm-list .alarm-message')?.textContent).toBe('LOOPBACK ENABLED');
      expect(document.querySelector('#alarm-count')?.textContent).toBe('1');
    });

    it('says "No active alarms" only when the card lists no rows', () => {
      sync(41_000_000);

      expect(document.querySelector('#alarm-list .no-alarms')?.textContent).toContain('No active alarms');
      expect(document.querySelector('#alarm-list .alarm-item')).toBeNull();
      expect(document.querySelector('#alarm-count')?.textContent).toBe('0');
    });

    it('shows a fixed-label alarm with its live value in the detail (nats-r5-s14-F2)', () => {
      (mockGroundStation.antennas[0].getStatusAlarms as Mock).mockReturnValue([{ severity: 'info', message: 'RAIN FADE (0.6 dB)' }]);

      sync(42_000_000);

      expect(document.querySelector('#alarm-list .alarm-message')?.textContent).toBe('RAIN FADE');
      expect(document.querySelector('#alarm-list .alarm-detail')?.textContent).toBe('fade 0.6 dB');
    });

    it('stamps each alarm on the station clock when first raised, not the wall clock (nats-r3-s08-F2)', () => {
      OpsLogManager.initialize('02:15:00', '2026-02-14');
      // AlarmService holds the raise times; forget the earlier tests' alarms
      AlarmService.destroy();
      try {
        (mockGroundStation.receivers[0].getStatusAlarms as Mock).mockReturnValue([{ severity: 'warning', message: 'RX lost lock' }]);
        sync(50_000_000);
        expect(document.querySelector('#alarm-list .alarm-time')?.textContent).toBe('02:15:00');

        // A minute later the standing alarm keeps its raise time; a new one gets the new time
        SimClock.skip(60_000);
        (mockGroundStation.transmitters[0].getStatusAlarms as Mock).mockReturnValue([{ severity: 'error', message: 'Modem 1 Faulted' }]);
        sync(60_000_000);
        const times = [...document.querySelectorAll('#alarm-list .alarm-item')].map((el) => [
          el.querySelector('.alarm-message')?.textContent,
          el.querySelector('.alarm-time')?.textContent,
        ]);
        expect(times).toEqual([
          ['Modem 1 Faulted', '02:16:00'],
          ['RX lost lock', '02:15:00'],
        ]);
      } finally {
        OpsLogManager.destroy();
        SimClock.reset();
      }
    });
  });
});
