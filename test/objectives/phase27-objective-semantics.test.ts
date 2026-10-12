/**
 * Phase 27 (2.B, Q1, Q4) objective semantics: requiresChange (B1), timed holds
 * that accrue only while watching (B3), the hidden-tab hint (B5), quizzes
 * after the doing (B7), must-hold-at-completion (B8), countdowns that time the
 * doing only (Q1), the objective time skip and weather-event-ended (Q4).
 */
import { vi } from 'vitest';
import { EventBus } from '../../src/events/event-bus';
import { Events } from '../../src/events/events';
import { resolveRequiresChange } from '../../src/objectives/condition-semantics';
import type { Condition, Objective } from '../../src/objectives/objective-types';
import { TAB_HINT_DELAY_SECONDS } from '../../src/objectives/objective-types';
import { ObjectivesManager } from '../../src/objectives/objectives-manager';
import { TabbedCanvas } from '../../src/pages/mission-control/tabbed-canvas';
import { resetMissionClock } from '../../src/simulation/mission-clock';
import { advanceSimTime } from '../helpers/sim-time';

const station = vi.hoisted(() => ({
  heaterEnabled: false,
  trackingMode: 'program-track' as string,
  snr: 12 as number | null,
  hpaEnabled: false,
}));

const quizzes = vi.hoisted(() => ({
  registered: new Set<string>(),
  complete: new Set<string>(),
}));

const weather = vi.hoisted(() => ({ ended: new Set<string>() }));

vi.mock('../../src/simulation/simulation-manager', () => ({
  SimulationManager: {
    getInstance: () => ({
      groundStations: [
        {
          state: { id: 'gs-1' },
          antennas: [
            {
              state: {
                get isHeaterEnabled() {
                  return station.heaterEnabled;
                },
                get trackingMode() {
                  return station.trackingMode;
                },
                isStepTrackEnabled: false,
              },
            },
          ],
          rfFrontEnds: [
            {
              hpaModule: {
                state: {
                  isPowered: true,
                  get isHpaEnabled() {
                    return station.hpaEnabled;
                  },
                },
              },
            },
          ],
          spectrumAnalyzers: [],
          receivers: [
            {
              state: { activeModem: 1, modems: [{ modemNumber: 1, isPowered: true }] },
              getSnrForModem: () => station.snr,
              getSignalsInBandwidth: () => ({ hasLock: true }),
            },
          ],
          transmitters: [],
        },
      ],
      satellites: [],
      getSatByNoradId: () => null,
    }),
  },
}));

vi.mock('../../src/modal/quiz-manager', () => ({
  QuizManager: {
    getInstance: () => ({
      hasQuiz: (id: string, i: number) => quizzes.registered.has(`${id}:${i}`),
      isQuizComplete: (id: string, i: number) => quizzes.complete.has(`${id}:${i}`),
      registerQuiz: (id: string, i: number) => {
        quizzes.registered.add(`${id}:${i}`);
      },
    }),
  },
}));

vi.mock('../../src/weather/weather-manager', () => ({
  WeatherManager: {
    hasInstance: () => true,
    getInstance: () => ({ hasEventEnded: (id: string) => weather.ended.has(id) }),
  },
}));

const quiz = (description = 'Quiz', extra: Record<string, unknown> = {}): Condition => ({
  type: 'status-check',
  description,
  mustMaintain: false,
  params: { question: 'Q?', options: ['a', 'b'], correctIndex: 0, ...extra },
});

const objective = (id: string, conditions: Condition[], extra: Partial<Objective> = {}): Objective => ({
  id,
  title: id,
  description: id,
  groundStation: 'gs-1',
  conditions,
  ...extra,
});

const tick = (): void => {
  EventBus.getInstance().emit(Events.UPDATE, 16);
};

const stateOf = (id: string) => ObjectivesManager.getInstance().getObjectiveState(id)!;

describe('Phase 27 objective semantics', () => {
  let activeTab: string | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    EventBus.destroy();
    ObjectivesManager.destroy();
    resetMissionClock();
    station.heaterEnabled = false;
    station.trackingMode = 'program-track';
    station.snr = 12;
    station.hpaEnabled = false;
    quizzes.registered.clear();
    quizzes.complete.clear();
    weather.ended.clear();
    activeTab = null;
    vi.spyOn(TabbedCanvas, 'getActiveTab').mockImplementation(() => activeTab);
  });

  afterEach(() => {
    ObjectivesManager.destroy();
    EventBus.destroy();
    resetMissionClock();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('B1 requiresChange', () => {
    const heaterRow: Condition = { type: 'feed-heater-enabled', description: 'Heater On', mustMaintain: false };

    it('does not tick a set-type row the start state already satisfies', () => {
      station.heaterEnabled = true;
      ObjectivesManager.initialize([objective('heater', [heaterRow])]);

      tick();
      tick();
      expect(stateOf('heater').isCompleted).toBe(false);

      // The player toggles it off and on again: now it counts
      station.heaterEnabled = false;
      tick();
      station.heaterEnabled = true;
      tick();
      expect(stateOf('heater').isCompleted).toBe(true);
    });

    it('counts a value change that stays on target (watched value moved)', () => {
      station.trackingMode = 'program-track';
      const row: Condition = { type: 'antenna-tracking-mode-set', description: 'Program track', mustMaintain: false, params: { trackingMode: 'program-track' } };
      ObjectivesManager.initialize([objective('mode', [row])]);
      tick();
      expect(stateOf('mode').isCompleted).toBe(false);

      // Switching away arms it; switching back completes
      station.trackingMode = 'manual';
      tick();
      station.trackingMode = 'program-track';
      tick();
      expect(stateOf('mode').isCompleted).toBe(true);
    });

    it('ticks a set-type row false at activation as soon as the player sets it', () => {
      ObjectivesManager.initialize([objective('heater', [heaterRow])]);
      tick();
      station.heaterEnabled = true;
      tick();
      expect(stateOf('heater').isCompleted).toBe(true);
    });

    it('honours requiresChange: false', () => {
      station.heaterEnabled = true;
      ObjectivesManager.initialize([objective('heater', [{ ...heaterRow, requiresChange: false }])]);
      tick();
      expect(stateOf('heater').isCompleted).toBe(true);
    });

    it('leaves verify-type rows alone', () => {
      ObjectivesManager.initialize([objective('cn', [{ type: 'receiver-snr-threshold', description: 'C/N', mustMaintain: false, params: { minCNRatio: 10 } }])]);
      tick();
      expect(stateOf('cn').isCompleted).toBe(true);
    });

    it('defaults off for a setting an earlier objective in the chain already asked for', () => {
      const objectives = [
        objective('enable-heater', [heaterRow]),
        objective('still-running', [{ type: 'feed-heater-enabled', description: 'Heater Still Running', mustMaintain: true }], { prerequisiteObjectiveIds: ['enable-heater'] }),
      ];
      const resolved = resolveRequiresChange(objectives);
      expect(resolved.get(objectives[0].conditions[0])).toBe(true);
      expect(resolved.get(objectives[1].conditions[0])).toBe(false);

      ObjectivesManager.initialize(objectives);
      tick();
      station.heaterEnabled = true;
      tick();
      tick();
      expect(stateOf('enable-heater').isCompleted).toBe(true);
      tick();
      expect(stateOf('still-running').isCompleted).toBe(true);
    });

    it('defaults off for an observation-gated row (a reading, not an action)', () => {
      const objectives = [
        objective('read-lo', [
          { type: 'lnb-lo-set', description: 'Read the LNB LO', mustMaintain: false, params: { loFrequency: 13100, requiresObservation: true, observationTab: 'rx-analysis' } },
        ]),
        objective('set-lo', [{ type: 'lnb-lo-set', description: 'Set the LNB LO', mustMaintain: false, params: { loFrequency: 13100 } }]),
      ];
      const resolved = resolveRequiresChange(objectives as never);
      expect(resolved.get(objectives[0].conditions[0])).toBe(false);
      expect(resolved.get(objectives[1].conditions[0])).toBe(true);
    });

    it('arms restored conditions so a reload does not demand the work again', () => {
      station.heaterEnabled = true;
      const objectives = [objective('heater', [heaterRow])];
      ObjectivesManager.initialize(objectives);
      const saved = structuredClone(
        ObjectivesManager.getInstance()
          .getObjectiveStates()
          .map((s) => ({ ...s, conditionStates: s.conditionStates.map((cs) => ({ ...cs, changeArmed: undefined })) }))
      );
      ObjectivesManager.destroy();

      ObjectivesManager.initialize(objectives);
      ObjectivesManager.getInstance().restoreState(saved as never);
      tick();
      expect(stateOf('heater').isCompleted).toBe(true);
    });
  });

  describe('B8 mustMaintain with no duration holds at completion', () => {
    it('a transient true does not complete the row once it drops before the rest are done', () => {
      const objectives = [
        objective('recover', [
          { type: 'receiver-snr-threshold', description: 'C/N >= 9', mustMaintain: true, params: { minCNRatio: 9 } },
          { type: 'feed-heater-enabled', description: 'Heater', mustMaintain: false },
        ]),
      ];
      station.snr = 9.5; // a spike
      ObjectivesManager.initialize(objectives);
      tick();
      tick();
      station.snr = 7.5;
      tick();
      station.heaterEnabled = true;
      tick();
      expect(stateOf('recover').isCompleted).toBe(false);
      expect(stateOf('recover').conditionStates[0].isMaintenanceComplete).toBe(false);

      station.snr = 9.5;
      tick();
      expect(stateOf('recover').isCompleted).toBe(true);
    });
  });

  describe('B3 timed holds accrue only while watching', () => {
    it('does not accrue while the tab-active sibling is off', () => {
      ObjectivesManager.initialize([
        objective('watch', [
          { type: 'tab-active', hidden: true, description: 'RX Analysis Open', mustMaintain: true, params: { tab: 'rx-analysis' } },
          { type: 'receiver-snr-threshold', description: 'C/N held', mustMaintain: true, maintainDuration: 5, params: { minCNRatio: 7 } },
        ]),
      ]);

      activeTab = 'dashboard-0';
      advanceSimTime(10_000, { emitUpdate: true });
      expect(stateOf('watch').conditionStates[1].maintainedDuration).toBe(0);
      expect(stateOf('watch').isCompleted).toBe(false);

      activeTab = 'rx-analysis-0';
      advanceSimTime(6000, { emitUpdate: true });
      expect(stateOf('watch').isCompleted).toBe(true);
    });
  });

  describe('B5 hidden tab hint', () => {
    it('names the tab once the hidden row has blocked for the delay', () => {
      ObjectivesManager.initialize([
        objective('look', [{ type: 'tab-active', hidden: true, description: 'Dashboard Open', mustMaintain: true, params: { tab: 'dashboard' } }, quiz()]),
      ]);
      const manager = ObjectivesManager.getInstance();

      advanceSimTime(2000, { emitUpdate: true });
      expect(manager.generateHtmlChecklist()).not.toContain('open the Dashboard tab');

      advanceSimTime((TAB_HINT_DELAY_SECONDS + 1) * 1000, { emitUpdate: true });
      expect(manager.generateHtmlChecklist()).toContain('open the Dashboard tab');

      activeTab = 'dashboard-0';
      tick();
      expect(manager.generateHtmlChecklist()).not.toContain('open the Dashboard tab');
    });
  });

  describe('B7 quizzes after the doing', () => {
    it('registers a quiz only after the rows authored before it have latched', () => {
      ObjectivesManager.initialize([objective('do-then-ask', [{ type: 'feed-heater-enabled', description: 'Heater', mustMaintain: false }, quiz()])]);
      tick();
      expect(quizzes.registered.has('do-then-ask:1')).toBe(false);

      station.heaterEnabled = true;
      tick();
      tick();
      expect(quizzes.registered.has('do-then-ask:1')).toBe(true);
    });

    it('asks a quiz authored first at once', () => {
      ObjectivesManager.initialize([objective('ask-then-do', [quiz(), { type: 'feed-heater-enabled', description: 'Heater', mustMaintain: false }])]);
      tick();
      expect(quizzes.registered.has('ask-then-do:0')).toBe(true);
    });

    it('honours quizAfterConditions true and false', () => {
      ObjectivesManager.initialize([
        objective('all', [quiz('first', { quizAfterConditions: true }), { type: 'feed-heater-enabled', description: 'Heater', mustMaintain: false }]),
        objective('none', [{ type: 'hpa-enabled', description: 'HPA', mustMaintain: false }, quiz('now', { quizAfterConditions: false })]),
      ]);
      tick();
      expect(quizzes.registered.has('all:0')).toBe(false);
      expect(quizzes.registered.has('none:1')).toBe(true);
    });
  });

  describe('Q1 countdowns time the doing', () => {
    it('stops an objective countdown once its non-quiz rows are met', () => {
      ObjectivesManager.initialize([objective('timed', [{ type: 'feed-heater-enabled', description: 'Heater', mustMaintain: false }, quiz()], { timeLimitSeconds: 60 })]);
      advanceSimTime(5000, { emitUpdate: true });
      expect(stateOf('timed').timeRemainingSeconds).toBe(55);

      station.heaterEnabled = true;
      advanceSimTime(20_000, { emitUpdate: true });
      expect(stateOf('timed').timeRemainingSeconds).toBe(55);
      expect(ObjectivesManager.getInstance().isObjectiveCountdownHeld('timed')).toBe(true);
      expect(ObjectivesManager.getInstance().hasRunningObjectiveTimer()).toBe(false);
    });

    it('never runs the countdown of a quiz-only objective', () => {
      ObjectivesManager.initialize([objective('read', [quiz()], { timeLimitSeconds: 30 })]);
      advanceSimTime(60_000, { emitUpdate: true });
      expect(stateOf('read').timeRemainingSeconds).toBe(30);
      expect(stateOf('read').timedOut).toBeFalsy();
    });
  });

  describe('Q4 objective time skip', () => {
    it('offers the skip while active, honours availableAfterConditions, and is one-shot', () => {
      ObjectivesManager.initialize([
        objective(
          'ride-out-rain',
          [
            { type: 'feed-heater-enabled', description: 'Heater', mustMaintain: false },
            { type: 'weather-event-ended', description: 'Rain cell passed', mustMaintain: false, params: { weatherEventId: 'cell' } },
          ],
          { timeSkip: { minutes: 20, label: 'rain cell', availableAfterConditions: true } }
        ),
      ]);
      const manager = ObjectivesManager.getInstance();
      tick();
      expect(manager.getAvailableTimeSkip()).toBeNull();

      station.heaterEnabled = true;
      tick();
      expect(manager.getAvailableTimeSkip()).toEqual({ objectiveId: 'ride-out-rain', minutes: 20, label: 'rain cell' });

      manager.markTimeSkipUsed('ride-out-rain');
      expect(manager.getAvailableTimeSkip()).toBeNull();

      weather.ended.add('cell');
      tick();
      expect(stateOf('ride-out-rain').isCompleted).toBe(true);
    });

    it('does not burn the skipped objective countdown, and credits its timed holds', () => {
      ObjectivesManager.initialize([
        objective('hold', [{ type: 'receiver-snr-threshold', description: 'C/N held', mustMaintain: true, maintainDuration: 600, params: { minCNRatio: 7 } }], {
          timeLimitSeconds: 120,
          timeSkip: { minutes: 15 },
        }),
      ]);
      const manager = ObjectivesManager.getInstance();
      tick();
      tick();
      manager.applyTimeSkip(15 * 60_000, 'hold');
      expect(stateOf('hold').timeRemainingSeconds).toBe(120);
      tick();
      expect(stateOf('hold').isCompleted).toBe(true);
    });
  });
});
