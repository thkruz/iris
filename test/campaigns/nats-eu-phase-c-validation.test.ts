/**
 * nats-eu Phase C validation gate (scenarios 9-12, the qualified tier's first
 * half).
 *
 * Same rule as the Phase B harness: RF numbers are authored against this file,
 * not the scenario file. Every threshold baked into S9-S12 is asserted here
 * against the real chain (SGP4 -> program-track pedestal -> RF front end ->
 * receiver C/N) so an uncompletable scenario fails CI rather than a playtest.
 *
 * What is different from Phase B: every scenario has its own epoch and its own
 * scenario-local satellites (satellites.ts factories), so the harness derives
 * the clock from `settings.scenarioStartDate` / `scenarioStartWallTime` and
 * flies each pass with that scenario's own satellite list and station config.
 *
 * Failure classes covered:
 *
 * 1. WIRING - ids, urls, prerequisite chain, mission brief, NICE codes.
 * 2. REACHABILITY - every condition names a mechanic the scenario enables and
 *    every referenced id (contact, station, command, space event, signal)
 *    exists in that scenario's settings or satellites.
 * 3. PLAN / WINDOW GEOMETRY - the S9 day plan is solvable; S10/S12 command
 *    windows sit inside the first pass of the target bird; the S11 element
 *    sets both propagate and put the pass where the brief says.
 * 4. LINK BUDGET - the worksheet built from the published numbers equals
 *    `expectedCNRDb`, and the live chain delivers the required margin.
 * 5. PASS FLIGHTS - every `receiver-snr-threshold` and `signal-detected` in
 *    the tier is met under real program-track with authoring margin.
 */

import { type Degrees, Tle, type TleLine1, type TleLine2 } from 'ootk';
import { afterEach, describe, expect, it, vi } from 'vitest';

const MINUTE_MS = 60_000;
const TICK_HZ = 60;
/**
 * Authoring margin over a receiver-snr-threshold (dB): the settled peak must
 * clear the threshold by this much. An objective that also grades
 * `link-margin-met` is held to its own `minMarginDb` instead, because that
 * number is the scenario's stated design margin (S10 is a 1 dB pass by intent).
 */
const SNR_MARGIN_DB = 2;
/** A usable decode window: seconds with lock at threshold + half the margin. */
const HOLD_S = 60;

let simNowMs = Date.UTC(2027, 2, 17, 6, 10, 0);

vi.mock('@app/simulation/sim-time', () => ({
  getSimulatedNowMs: () => simNowMs,
  getSimulatedNow: () => new Date(simNowMs),
}));

let simSatellites: import('@app/equipment/satellite/orbital-satellite').OrbitalSatellite[] = [];

vi.mock('@app/simulation/simulation-manager', () => ({
  SimulationManager: {
    getInstance: () => ({
      satellites: simSatellites,
      getSatsByAzEl: (az: number, el: number) => simSatellites.filter((sat) => Math.abs(sat.az - az) <= 1 && Math.abs(sat.el - el) <= 1),
      getSatByNoradId: (noradId: number) => simSatellites.find((s) => s.noradId === noradId) ?? null,
      isDeveloperMode: false,
      update: () => undefined,
      draw: () => undefined,
      sync: () => undefined,
    }),
    destroy: () => undefined,
  },
}));

import type { GroundStationConfig } from '@app/assets/ground-station/ground-station-state';
import { createMeridianSar3, type MeridianTle } from '@app/campaigns/nats-eu/satellites';
import { natsEuScenario9Data } from '@app/campaigns/nats-eu/scenario9';
import { natsEuScenario10Data } from '@app/campaigns/nats-eu/scenario10';
import { natsEuScenario11Data } from '@app/campaigns/nats-eu/scenario11';
import { natsEuScenario12Data } from '@app/campaigns/nats-eu/scenario12';
import { ANTENNA_CONFIG_KEYS } from '@app/equipment/antenna/antenna-config-keys';
import { AntennaUIHeadless } from '@app/equipment/antenna/antenna-ui-headless';
import { Receiver } from '@app/equipment/receiver/receiver';
import { TapPoint } from '@app/equipment/rf-front-end/coupler-module/tap-points';
import { createRFFrontEnd } from '@app/equipment/rf-front-end/rf-front-end-factory';
import type { OrbitalSatellite } from '@app/equipment/satellite/orbital-satellite';
import { EventBus } from '@app/events/event-bus';
import { LinkBudgetManager } from '@app/link-budget/link-budget-manager';
import type { ScenarioData } from '@app/ScenarioData';
import { PassPlannerService } from '@app/services/pass-planner-service';
import type { MHz } from '@app/types';

const PHASE_C: ScenarioData[] = [natsEuScenario9Data, natsEuScenario10Data, natsEuScenario11Data, natsEuScenario12Data];

/** The settings fields this harness reads, typed loosely on purpose. */
interface PhaseCSettings {
  groundStations: GroundStationConfig[];
  satellites: OrbitalSatellite[];
  scenarioStartDate: string;
  scenarioStartWallTime: string;
  missionBriefUrl?: string;
  contactSchedule?: {
    stationIds: string[];
    requiredPriorityAtOrAbove?: number;
    contacts: Array<{ id: string; priority: number; windowStartS: number; windowEndS: number }>;
  };
  linkBudget?: { expectedCNRDb: number; toleranceDb?: number; thresholdCNRDb: number; requiredMarginDb?: number };
  commanding?: { targetNoradId: number; windowStartS: number; windowEndS: number; commands?: Array<{ id: string }> };
  spaceEvents?: Array<{ id: string; satelliteNoradId: number; initialTle?: MeridianTle; newTle: MeridianTle }>;
  workingDocument?: { title: string };
}

const settingsOf = (scenario: ScenarioData): PhaseCSettings => scenario.settings as unknown as PhaseCSettings;

/** Scenario clock start in Unix ms, derived from the scenario's own epoch fields. */
function startMsOf(scenario: ScenarioData): number {
  const { scenarioStartDate, scenarioStartWallTime } = settingsOf(scenario);
  const ms = Date.parse(`${scenarioStartDate}T${scenarioStartWallTime}Z`);

  expect(Number.isFinite(ms), `${scenario.id}: unparseable epoch`).toBe(true);

  return ms;
}

function satOf(scenario: ScenarioData, noradId: number): OrbitalSatellite {
  const sat = settingsOf(scenario).satellites.find((s) => s.noradId === noradId);

  expect(sat, `${scenario.id}: no satellite ${noradId}`).toBeDefined();

  return sat!;
}

/** First pass of `sat` after the scenario clock starts, 0 deg horizon (author-passes convention). */
function firstPass(scenario: ScenarioData, sat: OrbitalSatellite) {
  simNowMs = startMsOf(scenario);
  const pass = new PassPlannerService().getPasses(sat, simNowMs, { horizonHours: 2, minElevation: 0 as Degrees })[0];

  expect(pass, `${scenario.id}: ${sat.name} has no pass within 2 h`).toBeDefined();

  return pass;
}

describe('nats-eu Phase C: scenario wiring', () => {
  it('registers scenarios 9-12 with unique ids, urls, numbers and a prerequisite chain', () => {
    const ids = PHASE_C.map((s) => s.id);

    expect(ids).toEqual(['nats-eu-scenario9', 'nats-eu-scenario10', 'nats-eu-scenario11', 'nats-eu-scenario12']);
    expect(new Set(ids).size).toBe(ids.length);

    const expectedPrereq = ['nats-eu-scenario8', ...ids.slice(0, -1)];

    PHASE_C.forEach((scenario, i) => {
      expect(scenario.prerequisiteScenarioIds, scenario.id).toEqual([expectedPrereq[i]]);
      expect(scenario.url).toBe(`nats-eu/scenarios/${scenario.id}`);
      expect(scenario.number).toBe(9 + i);
      expect(scenario.difficulty).toBe('intermediate');
      expect(scenario.isDisabled).toBe(false);
    });
  });

  it.each(PHASE_C.map((s) => [s.id, s] as const))('%s sets missionBriefUrl (checklist is hidden without it)', (_id, scenario) => {
    const url = settingsOf(scenario).missionBriefUrl;

    expect(url).toBeTruthy();
    expect(url).toContain(`campaign-2/scenario-${scenario.number}`);
  });

  it.each(PHASE_C.map((s) => [s.id, s] as const))('%s objectives carry NICE codes, conditions and in-scenario prerequisites', (_id, scenario) => {
    const ids = new Set(scenario.objectives.map((o) => o.id));

    expect(scenario.objectives.length).toBeGreaterThan(0);
    for (const objective of scenario.objectives) {
      expect(objective.nice?.length, objective.id).toBeGreaterThan(0);
      expect(objective.conditions.length, objective.id).toBeGreaterThan(0);
      for (const prereq of objective.prerequisiteObjectiveIds ?? []) {
        expect(ids.has(prereq), `${objective.id} -> ${prereq}`).toBe(true);
      }
    }
  });
});

describe('nats-eu Phase C: every condition is reachable', () => {
  const REQUIRES_BLOCK: Record<string, keyof PhaseCSettings> = {
    'link-budget-computed': 'linkBudget',
    'link-margin-met': 'linkBudget',
    'uplink-doppler-comp-enabled': 'commanding',
    'command-acknowledged': 'commanding',
    'contact-assigned': 'contactSchedule',
    'contact-plan-valid': 'contactSchedule',
    'ephemeris-updated': 'spaceEvents',
  };

  it.each(PHASE_C.map((s) => [s.id, s] as const))('%s enables every mechanic it grades', (_id, scenario) => {
    const settings = settingsOf(scenario);

    for (const objective of scenario.objectives) {
      for (const condition of objective.conditions) {
        const where = `${objective.id}: ${condition.type}`;
        const required = REQUIRES_BLOCK[condition.type];

        if (required) {
          expect(settings[required], `${where} needs settings.${required}`).toBeDefined();
        }
        if (condition.type === 'mission-brief-opened') {
          expect(settings.missionBriefUrl, where).toBeTruthy();
        }
        // A status-check that writes a Working Document line needs the document.
        if (condition.type === 'status-check' && (condition.params as { documentLine?: string })?.documentLine) {
          expect(settings.workingDocument, `${where} writes a documentLine without settings.workingDocument`).toBeDefined();
        }
      }
    }
  });

  it.each(PHASE_C.map((s) => [s.id, s] as const))('%s references only ids that exist', (_id, scenario) => {
    const settings = settingsOf(scenario);
    const stationIds = new Set(settings.groundStations.map((gs) => gs.id));
    const signalIds = new Set(settings.satellites.flatMap((sat) => sat.transponders.map((tp) => tp.beacon?.signalId).filter(Boolean)));

    for (const objective of scenario.objectives) {
      const where = `${objective.id}`;

      // The objective's own station must be one the scenario loads.
      expect(stationIds.has(objective.groundStation), `${where}: unknown groundStation ${objective.groundStation}`).toBe(true);

      for (const condition of objective.conditions) {
        const params = (condition.params ?? {}) as Record<string, string | number>;

        if (params.contactId !== undefined) {
          expect(
            settings.contactSchedule?.contacts.map((c) => c.id),
            where
          ).toContain(params.contactId);
        }
        if (params.groundStationId !== undefined) {
          expect(stationIds.has(String(params.groundStationId)), `${where}: unknown station ${params.groundStationId}`).toBe(true);
          if (condition.type === 'contact-assigned') {
            expect(settings.contactSchedule?.stationIds, where).toContain(params.groundStationId);
          }
        }
        if (params.commandId !== undefined) {
          expect(
            settings.commanding?.commands?.map((c) => c.id),
            where
          ).toContain(params.commandId);
        }
        if (params.eventId !== undefined && condition.type === 'ephemeris-updated') {
          expect(
            settings.spaceEvents?.map((e) => e.id),
            where
          ).toContain(params.eventId);
        }
        if (params.signalId !== undefined) {
          expect(signalIds.has(String(params.signalId)), `${where}: no satellite transmits ${params.signalId}`).toBe(true);
        }
        if (params.boxId !== undefined) {
          expect(params.boxId, where).toBe('mission-brief');
        }
      }
    }

    // A commanding target must be a bird in the scenario's sky.
    if (settings.commanding) {
      expect(settings.satellites.map((s) => s.noradId)).toContain(settings.commanding.targetNoradId);
    }
    for (const event of settings.spaceEvents ?? []) {
      expect(
        settings.satellites.map((s) => s.noradId),
        event.id
      ).toContain(event.satelliteNoradId);
    }
  });
});

describe('nats-eu Phase C: plan, window and ephemeris geometry', () => {
  /**
   * Backtracking allocation of the required contacts across the stations with
   * no same-station overlap, honouring the fixed assignments the objective's
   * `contact-assigned` conditions demand. Returns null when no plan exists.
   */
  function solvePlan(contacts: Array<{ id: string; windowStartS: number; windowEndS: number }>, stationIds: string[], fixed: Map<string, string>): Map<string, string> | null {
    const plan = new Map<string, string>();
    const overlaps = (a: (typeof contacts)[number], b: (typeof contacts)[number]) => a.windowStartS < b.windowEndS && b.windowStartS < a.windowEndS;
    const place = (i: number): boolean => {
      if (i === contacts.length) return true;
      const contact = contacts[i];
      const candidates = fixed.has(contact.id) ? [fixed.get(contact.id)!] : stationIds;

      for (const station of candidates) {
        const clash = contacts.some((other) => plan.get(other.id) === station && overlaps(contact, other));

        if (!clash) {
          plan.set(contact.id, station);
          if (place(i + 1)) return true;
          plan.delete(contact.id);
        }
      }

      return false;
    };

    return place(0) ? plan : null;
  }

  it('S9 day plan is solvable with the demanded assignments; the P3 contacts are droppable', () => {
    const schedule = settingsOf(natsEuScenario9Data).contactSchedule!;
    const requiredAtOrAbove = schedule.requiredPriorityAtOrAbove ?? Number.POSITIVE_INFINITY;
    const required = schedule.contacts.filter((c) => c.priority <= requiredAtOrAbove);
    const optional = schedule.contacts.filter((c) => c.priority > requiredAtOrAbove);
    const fixed = new Map<string, string>();

    for (const objective of natsEuScenario9Data.objectives) {
      for (const condition of objective.conditions) {
        if (condition.type === 'contact-assigned') {
          const p = condition.params as { contactId: string; groundStationId: string };

          fixed.set(p.contactId, p.groundStationId);
        }
      }
    }

    // Two conflict pairs across two sites: four P1/P2 contacts, two P3 spares.
    expect(required.map((c) => c.id).sort()).toEqual(['M-SAR1-GW', 'M-SAR1-SH', 'M-SAR2-GW', 'M-SAR2-SH']);
    expect(optional.map((c) => c.id).sort()).toEqual(['M-SAR1-GW-2', 'M-SAR2-SH-2']);

    const plan = solvePlan(required, schedule.stationIds, fixed);

    expect(plan, 'no conflict-free allocation of the P1/P2 contacts exists').not.toBeNull();
    // The plan validates even if both P3 contacts are left unassigned...
    expect(optional.every((c) => !plan!.has(c.id))).toBe(true);
    // ...and can also absorb them, so keeping them is a real choice.
    expect(solvePlan(schedule.contacts, schedule.stationIds, fixed)).not.toBeNull();
  });

  it.each([
    ['nats-eu-scenario10', natsEuScenario10Data],
    ['nats-eu-scenario12', natsEuScenario12Data],
  ] as const)('%s command window sits inside the first pass of the target bird', (_id, scenario) => {
    const { commanding } = settingsOf(scenario);
    const start = startMsOf(scenario);
    const pass = firstPass(scenario, satOf(scenario, commanding!.targetNoradId));
    const aosS = (pass.aosMs - start) / 1000;
    const losS = (pass.losMs - start) / 1000;

    expect(commanding!.windowStartS, `window opens before AOS (${aosS.toFixed(0)} s)`).toBeGreaterThanOrEqual(aosS);
    expect(commanding!.windowEndS, `window closes after LOS (${losS.toFixed(0)} s)`).toBeLessThanOrEqual(losS);
    expect(commanding!.windowEndS - commanding!.windowStartS).toBeGreaterThan(120);
  });

  it('S11 injection and refined element sets both propagate and put the pass at T+9', () => {
    const scenario = natsEuScenario11Data;
    const event = settingsOf(scenario).spaceEvents![0];
    const start = startMsOf(scenario);
    const checksumOk = (line: string) => Tle.checksum(line as TleLine1 | TleLine2) === Number(line.at(-1));

    for (const [name, tle] of [
      ['initialTle', event.initialTle!],
      ['newTle', event.newTle],
    ] as const) {
      expect(checksumOk(tle.tle1), `${name} line 1 checksum`).toBe(true);
      expect(checksumOk(tle.tle2), `${name} line 2 checksum`).toBe(true);
    }

    // The scenario's own SAR-3 boots on the refined set; the coarse set is
    // what initialTle re-applies at load. Both must be flyable.
    simNowMs = start;
    const refined = firstPass(scenario, createMeridianSar3(event.newTle));
    const coarse = firstPass(scenario, createMeridianSar3(event.initialTle!));
    const refinedAosMin = (refined.aosMs - start) / MINUTE_MS;

    expect(Math.abs(refinedAosMin - 9.0), `refined AOS at T+${refinedAosMin.toFixed(2)}`).toBeLessThan(0.25);
    expect(Math.abs(refined.maxEl - 31.6), `refined max el ${refined.maxEl.toFixed(1)}`).toBeLessThan(1.0);
    expect(Math.abs(coarse.aosMs - refined.aosMs), 'coarse vs refined AOS').toBeLessThan(60_000);
    expect(Math.abs(coarse.aosMs - refined.aosMs), 'the two sets must differ, or the load is a no-op').toBeGreaterThan(5_000);
    // The scenario satellite itself is on the refined set.
    expect(satOf(scenario, event.satelliteNoradId).ootkSatellite.tle2).toBe(event.newTle.tle2);
  });
});

/**
 * One worked pass per row. `objectiveIds` name the objectives whose
 * receiver-snr-threshold / signal-detected conditions this flight has to
 * satisfy, with the receiver tuned to `ifMHz`.
 */
interface Flight {
  scenario: ScenarioData;
  noradId: number;
  ifMHz: number;
  objectiveIds: string[];
}

const FLIGHTS: Flight[] = [
  { scenario: natsEuScenario9Data, noradId: 61701, ifMHz: 1414, objectiveIds: ['work-the-first-window'] },
  { scenario: natsEuScenario9Data, noradId: 61702, ifMHz: 1370, objectiveIds: ['second-window'] },
  { scenario: natsEuScenario10Data, noradId: 61701, ifMHz: 1414, objectiveIds: ['acquire-low', 'pull-the-imagery'] },
  { scenario: natsEuScenario11Data, noradId: 61703, ifMHz: 1340, objectiveIds: ['first-acquisition'] },
  { scenario: natsEuScenario12Data, noradId: 61703, ifMHz: 1340, objectiveIds: ['acquire-sar3', 'first-video'] },
];

interface Sample {
  tMin: number;
  cn: number;
  hasLock: boolean;
  /** Effective beacon power at RX_IF (what signal-detected compares), or null. */
  detect: Record<string, number>;
}

const flightCache = new Map<string, Sample[]>();
const flightKey = (f: Flight) => `${f.scenario.id}/${f.noradId}`;

/**
 * Fly the flight's pass under real program-track with the scenario's own
 * station, satellites and clock. Builds the GW-01 chain the way
 * GroundStation.createEquipment_ does (minus the canvas spectrum analyzer),
 * samples settled C/N once per sim second, and memoises the result so the
 * threshold and link-budget tests share one flight.
 */
function fly(flight: Flight): Sample[] {
  const cached = flightCache.get(flightKey(flight));

  if (cached) return cached;

  const { scenario } = flight;
  const settings = settingsOf(scenario);
  const station = settings.groundStations[0];
  const sat = satOf(scenario, flight.noradId);
  const start = startMsOf(scenario);
  const pass = firstPass(scenario, sat);

  simSatellites = settings.satellites;
  simNowMs = start;
  vi.spyOn(Math, 'random').mockReturnValue(0.5);
  document.body.innerHTML = '<div id="pc-fe"></div><div id="pc-rx"></div>';

  const antenna = new AntennaUIHeadless('pc-ant', ANTENNA_CONFIG_KEYS.KU_BAND_4M_LEO_TRACKER, station.antennasState![0], 1);
  const frontEnd = createRFFrontEnd('pc-fe', station.rfFrontEnds[0], 'standard');

  frontEnd.connectAntenna(antenna);
  antenna.attachRfFrontEnd(frontEnd);
  const receiver = new Receiver('pc-rx', [antenna], station.receivers![0], 1);

  receiver.connectRfFrontEnd(frontEnd);

  const modem = receiver.state.modems[0];

  modem.frequency = flight.ifMHz as MHz;
  antenna.handleTrackingModeChange('program-track');
  antenna.handleTargetSatelliteChange(sat.noradId);

  const beaconIds = sat.transponders.map((tp) => tp.beacon?.signalId).filter((id): id is string => Boolean(id));
  const samples: Sample[] = [];
  const tickMs = 1000 / TICK_HZ;
  const fromMs = pass.aosMs - 30_000;
  const toMs = pass.losMs + 30_000;
  let tick = 0;

  for (simNowMs = fromMs; simNowMs <= toMs; simNowMs += tickMs, tick++) {
    for (const s of simSatellites) s.update();
    antenna.update();
    if (tick % TICK_HZ === 0) {
      for (let s = 0; s < TICK_HZ && antenna.state.isSlewing; s++) antenna.update();
      frontEnd.update();
      const info = receiver.getSignalsInBandwidth(modem);
      const pathGain = frontEnd.couplerModule.signalPathManager.getTotalGainTo(TapPoint.RX_IF);
      const detect: Record<string, number> = {};

      for (const id of beaconIds) {
        const sig = antenna.state.rxSignalsIn.find((s) => s.signalId === id);

        if (sig) detect[id] = sig.power + pathGain;
      }
      samples.push({
        tMin: (simNowMs - start) / MINUTE_MS,
        cn: Number.isFinite(info.cnRatio_dB) ? info.cnRatio_dB : -Infinity,
        hasLock: info.hasLock,
        detect,
      });
    }
  }

  EventBus.destroy();
  vi.restoreAllMocks();
  document.body.innerHTML = '';

  const peak = samples.reduce((a, b) => (b.cn > a.cn ? b : a));
  const above = (db: number) => samples.filter((s) => s.cn >= db).length;

  // Surfaces in the vitest output when a flight's assertions fail.
  console.log(
    `MEASURE ${scenario.id} ${sat.name} IF ${flight.ifMHz} MHz: AOS T+${((pass.aosMs - start) / MINUTE_MS).toFixed(2)} ` +
      `max el ${pass.maxEl.toFixed(1)} LOS T+${((pass.losMs - start) / MINUTE_MS).toFixed(2)}; ` +
      `peak C/N ${peak.cn.toFixed(2)} dB at T+${peak.tMin.toFixed(2)}; ` +
      `s>=7: ${above(7)}, s>=8: ${above(8)}, s>=9: ${above(9)}, s>=10: ${above(10)}, s>=11: ${above(11)}, s>=12: ${above(12)}`
  );

  flightCache.set(flightKey(flight), samples);

  return samples;
}

describe('nats-eu Phase C: pass flights meet every receiver threshold', () => {
  afterEach(() => {
    EventBus.destroy();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('every snr / detection condition in S9-S12 belongs to a flown pass', () => {
    for (const scenario of PHASE_C) {
      const flown = new Set(FLIGHTS.filter((f) => f.scenario === scenario).flatMap((f) => f.objectiveIds));

      for (const objective of scenario.objectives) {
        const graded = objective.conditions.some((c) => c.type === 'receiver-snr-threshold' || c.type === 'signal-detected');

        if (graded) {
          expect(flown.has(objective.id), `${scenario.id}/${objective.id} is graded on RF but never flown`).toBe(true);
        }
      }
    }
  });

  it.each(FLIGHTS.map((f) => [flightKey(f), f] as const))('%s: thresholds met with authoring margin', (_key, flight) => {
    const samples = fly(flight);
    const objectives = flight.scenario.objectives.filter((o) => flight.objectiveIds.includes(o.id));
    let checks = 0;

    for (const objective of objectives) {
      const designMargin = (objective.conditions.find((c) => c.type === 'link-margin-met')?.params as { minMarginDb?: number } | undefined)?.minMarginDb;
      const marginDb = designMargin ?? SNR_MARGIN_DB;

      for (const condition of objective.conditions) {
        const params = condition.params as { minCNRatio?: number; signalId?: string; minPower?: number };

        if (condition.type === 'receiver-snr-threshold' && params.minCNRatio !== undefined) {
          const peak = samples.reduce((a, b) => (b.cn > a.cn ? b : a));
          const holdAt = params.minCNRatio + marginDb / 2;
          const held = samples.filter((s) => s.cn >= holdAt && s.hasLock).length;

          expect(peak.cn, `${objective.id}: peak ${peak.cn.toFixed(2)} dB < threshold ${params.minCNRatio} + ${marginDb} dB`).toBeGreaterThanOrEqual(params.minCNRatio + marginDb);
          expect(peak.hasLock, `${objective.id}: no modem lock at peak`).toBe(true);
          expect(held, `${objective.id}: only ${held} s locked at C/N >= ${holdAt} dB`).toBeGreaterThanOrEqual(HOLD_S);
          checks++;
        }
        if (condition.type === 'signal-detected' && params.signalId && params.minPower !== undefined) {
          const best = Math.max(...samples.map((s) => s.detect[params.signalId!] ?? -Infinity));

          expect(best, `${objective.id}: ${params.signalId} peaks at ${best.toFixed(1)} dBm`).toBeGreaterThan(params.minPower);
          checks++;
        }
      }
    }
    expect(checks, 'flight row names objectives with nothing to check').toBeGreaterThan(0);
  });
});

describe('nats-eu Phase C: link budgets are correct and achievable', () => {
  afterEach(() => {
    EventBus.destroy();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  /**
   * The worksheet objective for each link-budget scenario. The inputs are
   * parsed from the objective description the operator reads, so the test
   * always grades the numbers currently published, not a copy of them.
   */
  const WORKSHEETS = [
    { flight: FLIGHTS[2], objectiveId: 'budget-the-low-pass' },
    { flight: FLIGHTS[4], objectiveId: 'predict-acceptance' },
  ];

  const PUBLISHED: Array<[keyof ReturnType<typeof publishedInputs>, RegExp]> = [
    ['eirpDbm', /EIRP (\d+(?:\.\d+)?) dBm/],
    ['fsplDb', /free-space path loss (\d+(?:\.\d+)?) dB/],
    ['rxGainDbi', /receive gain (\d+(?:\.\d+)?) dBi/],
    ['systemNoiseTempK', /system noise temperature (\d+(?:\.\d+)?) K/],
    ['bandwidthHz', /occupied bandwidth (\d+(?:\.\d+)?) MHz/],
    ['miscLossDb', /miscellaneous losses (\d+(?:\.\d+)?) dB/],
  ];

  /** Pull the six worksheet inputs out of the objective description. */
  function publishedInputs(scenario: ScenarioData, objectiveId: string) {
    const description = scenario.objectives.find((o) => o.id === objectiveId)!.description;
    const read = (label: string, re: RegExp): number => {
      const match = description.match(re);

      expect(match, `${scenario.id}/${objectiveId} does not publish ${label}`).not.toBeNull();

      return Number(match![1]);
    };
    const raw = Object.fromEntries(PUBLISHED.map(([key, re]) => [key, read(key, re)]));

    return {
      eirpDbm: raw.eirpDbm,
      fsplDb: raw.fsplDb,
      rxGainDbi: raw.rxGainDbi,
      systemNoiseTempK: raw.systemNoiseTempK,
      bandwidthHz: raw.bandwidthHz * 1e6,
      miscLossDb: raw.miscLossDb,
    };
  }

  it.each(WORKSHEETS.map((w) => [w.flight.scenario.id, w] as const))('%s: the published worksheet numbers produce expectedCNRDb', (_id, { flight, objectiveId }) => {
    const config = settingsOf(flight.scenario).linkBudget!;
    const inputs = publishedInputs(flight.scenario, objectiveId);
    const computed = LinkBudgetManager.computeCNRDb(inputs);

    // A player entering the briefed numbers must be graded correct.
    expect(
      Math.abs(computed - config.expectedCNRDb),
      `worksheet ${JSON.stringify(inputs)} gives ${computed.toFixed(2)} dB, scenario expects ${config.expectedCNRDb}`
    ).toBeLessThanOrEqual(config.toleranceDb ?? 1.0);
  });

  it.each(WORKSHEETS.map((w) => [w.flight.scenario.id, w] as const))('%s: the live chain delivers the required margin and matches the prediction', (_id, { flight }) => {
    const config = settingsOf(flight.scenario).linkBudget!;
    const needed = config.thresholdCNRDb + (config.requiredMarginDb ?? 3);
    const samples = fly(flight);
    const peak = samples.reduce((a, b) => (b.cn > a.cn ? b : a));
    const window = samples.filter((s) => s.cn >= needed);

    expect(peak.cn, `peak ${peak.cn.toFixed(2)} dB < required ${needed} dB`).toBeGreaterThan(needed);
    // Long enough to press Commit Link.
    expect(window.length, `only ${window.length} s above ${needed} dB`).toBeGreaterThanOrEqual(30);
    // And the operator's correct prediction must agree with the measurement.
    expect(Math.abs(peak.cn - config.expectedCNRDb), `prediction ${config.expectedCNRDb} vs measured ${peak.cn.toFixed(2)}`).toBeLessThan(1.5);
  });
});
