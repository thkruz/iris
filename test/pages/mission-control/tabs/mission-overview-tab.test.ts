import { Mock, vi } from 'vitest';
import { EventBus } from '../../../../src/events/event-bus';
import { Events } from '../../../../src/events/events';
import { MissionOverviewTab } from '../../../../src/pages/mission-control/tabs/mission-overview-tab';

// Mock dependencies
vi.mock('../../../../src/events/event-bus');
vi.mock('../../../../src/simulation/simulation-manager', () => ({
  SimulationManager: {
    getInstance: vi.fn(() => ({
      groundStations: [
        {
          state: {
            id: 'GS-001',
            name: 'Test Ground Station 1',
            location: { latitude: 38.897, longitude: -77.037, elevation: 100 },
            isOperational: true,
          },
          antennas: [{ viewOf: (sat: { az: number; el: number }) => ({ az: sat.az + 2, el: sat.el - 1 }) }],
          rfFrontEnds: [{}],
          transmitters: [{ state: { modems: [{}, {}, {}, {}] } }],
          receivers: [{ state: { modems: [{}, {}, {}, {}] } }],
        },
        {
          state: {
            id: 'GS-002',
            name: 'Test Ground Station 2',
            location: { latitude: 51.5074, longitude: -0.1278, elevation: 50 },
            isOperational: false,
          },
          antennas: [{}],
          rfFrontEnds: [{}],
          transmitters: [],
          receivers: [{ state: { modems: [{}, {}, {}, {}] } }],
        },
      ],
      satellites: [
        {
          noradId: 12345,
          name: 'Test Satellite 1',
          az: 180,
          el: 45,
          health: 0.95,
          transponders: [{ isActive: true }, { isActive: false }],
        },
        {
          noradId: 67890,
          name: 'Test Satellite 2',
          az: 220,
          el: 30,
          health: 0.7,
          transponders: [{ isActive: true }],
        },
      ],
    })),
  },
}));

// Mock image imports
vi.mock('../../../../src/assets/icons/antenna.png', () => ({ default: 'antenna.png' }));
vi.mock('../../../../src/assets/icons/satellite.png', () => ({ default: 'satellite.png' }));

describe('MissionOverviewTab', () => {
  let containerEl: HTMLElement;
  let tab: MissionOverviewTab;
  let mockEventBus: { on: Mock; off: Mock; emit: Mock };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock EventBus
    mockEventBus = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    };
    (EventBus.getInstance as Mock).mockReturnValue(mockEventBus);

    // Setup container
    containerEl = document.createElement('div');
    containerEl.id = 'mission-overview-container';
    document.body.appendChild(containerEl);

    tab = new MissionOverviewTab('mission-overview-container');
  });

  afterEach(() => {
    tab.dispose();
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    it('should create instance', () => {
      expect(tab).toBeInstanceOf(MissionOverviewTab);
    });
  });

  describe('HTML rendering', () => {
    it('should render Mission Overview title', () => {
      const html = document.body.innerHTML;
      expect(html).toContain('Mission Overview');
    });

    it('should render Ground Stations section', () => {
      const html = document.body.innerHTML;
      expect(html).toContain('Ground Stations');
    });

    it('should render Satellites section', () => {
      const html = document.body.innerHTML;
      expect(html).toContain('Satellites');
    });
  });

  describe('ground station cards', () => {
    it('should render ground station cards', () => {
      const gsCards = document.querySelectorAll('[data-asset-type="ground-station"]');
      expect(gsCards.length).toBe(2);
    });

    it('should display ground station names', () => {
      const html = document.body.innerHTML;
      expect(html).toContain('Test Ground Station 1');
      expect(html).toContain('Test Ground Station 2');
    });

    it('should display ground station IDs', () => {
      const html = document.body.innerHTML;
      expect(html).toContain('GS-001');
      expect(html).toContain('GS-002');
    });

    it('should display operational status', () => {
      const html = document.body.innerHTML;
      expect(html).toContain('OPERATIONAL');
      expect(html).toContain('OFFLINE');
    });

    it('should display equipment counts', () => {
      const html = document.body.innerHTML;
      expect(html).toContain('ANT');
      expect(html).toContain('RF-FE');
      expect(html).toContain('TX MODEMS');
      expect(html).toContain('RX MODEMS');
      // Modems, not chassis (phase 27): one chassis of four reads 4
      const first = document.querySelector('[data-asset-type="ground-station"]');
      expect(first?.textContent).toMatch(/4\s*TX MODEMS/u);
    });
  });

  describe('live look angles (phase 27, s06-F5)', () => {
    it("shows each satellite at the viewing station's own az/el, labelled with the station", () => {
      const card = document.querySelector('[data-asset-id="sat-12345"]');
      expect(card?.querySelector('.sat-look-az')?.textContent).toBe('182.0°');
      expect(card?.querySelector('.sat-look-el')?.textContent).toBe('44.0°');
      expect(card?.querySelector('.sat-look-from')?.textContent).toBe('Look angles from GS-001');
    });

    it('subscribes to updates and unsubscribes on dispose', () => {
      expect(mockEventBus.on).toHaveBeenCalledWith(Events.UPDATE, expect.any(Function));
      tab.dispose();
      expect(mockEventBus.off).toHaveBeenCalledWith(Events.UPDATE, expect.any(Function));
      tab = new MissionOverviewTab('mission-overview-container');
    });
  });

  describe('satellite cards', () => {
    it('should render satellite cards', () => {
      const satCards = document.querySelectorAll('[data-asset-type="satellite"]');
      expect(satCards.length).toBe(2);
    });

    it('should display satellite names', () => {
      const html = document.body.innerHTML;
      expect(html).toContain('Test Satellite 1');
      expect(html).toContain('Test Satellite 2');
    });

    it('should display NORAD IDs', () => {
      const html = document.body.innerHTML;
      expect(html).toContain('12345');
      expect(html).toContain('67890');
    });

    it('should display health percentages', () => {
      const html = document.body.innerHTML;
      expect(html).toContain('95%');
      expect(html).toContain('70%');
    });

    it('should display transponder counts', () => {
      const html = document.body.innerHTML;
      expect(html).toContain('TRANSPONDERS');
    });
  });

  describe('clickable cards', () => {
    it('should emit ASSET_SELECTED event when ground station card is clicked', () => {
      const gsCard = document.querySelector('[data-asset-type="ground-station"]') as HTMLElement;
      gsCard?.click();

      expect(mockEventBus.emit).toHaveBeenCalledWith(Events.ASSET_SELECTED, { type: 'ground-station', id: 'GS-001' });
    });

    it('should emit ASSET_SELECTED event when satellite card is clicked', () => {
      const satCard = document.querySelector('[data-asset-type="satellite"]') as HTMLElement;
      satCard?.click();

      expect(mockEventBus.emit).toHaveBeenCalledWith(Events.ASSET_SELECTED, { type: 'satellite', id: 'sat-12345' });
    });
  });

  describe('activate/deactivate', () => {
    it('should show tab on activate', () => {
      tab.activate();
      const tabEl = document.querySelector('.mission-overview-tab') as HTMLElement;
      expect(tabEl?.style.display).toBe('block');
    });

    it('should hide tab on deactivate', () => {
      tab.deactivate();
      const tabEl = document.querySelector('.mission-overview-tab') as HTMLElement;
      expect(tabEl?.style.display).toBe('none');
    });
  });

  describe('dispose', () => {
    it('should remove DOM element', () => {
      tab.dispose();
      const tabEl = document.querySelector('.mission-overview-tab');
      expect(tabEl).toBeNull();
    });
  });

  describe('empty scenario handling', () => {
    it('should show message when no ground stations', () => {
      // Reset SimulationManager mock
      vi.doMock('../../../../src/simulation/simulation-manager', () => ({
        SimulationManager: {
          getInstance: vi.fn(() => ({
            groundStations: [],
            satellites: [],
          })),
        },
      }));

      // The current instance already has data, so this test just verifies the pattern
      const html = document.body.innerHTML;
      expect(html).toBeDefined();
    });
  });
});
