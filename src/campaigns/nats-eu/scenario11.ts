import { Character, Emotion } from '@app/modal/character-enum';
import type { ScenarioData } from '@app/ScenarioData';
import type { dBm } from '@app/types';
import type { Degrees, TleLine1, TleLine2 } from 'ootk';
import { galwayGroundStation } from './ground-stations';
import { createMeridianSar1, createMeridianSar2, createMeridianSar3, MERIDIAN_SAR3_BEACON_RF_HZ, type MeridianTle } from './satellites';

/**
 * nats-eu Scenario 11 - "LEOP: Launch Day" / SAR-3 First Acquisition (arc 1/2)
 *
 * M4 in its LEOP form. MERIDIAN-SAR-3 separated 94 minutes before the shift
 * starts and GW-01 is the first commercial station on its ground track. The
 * bird boots on the launch provider's coarse injection estimate
 * (`spaceEvents[].initialTle`, re-applied on every load so replays keep the
 * puzzle); the refined set from the first ranging arc arrives as `newTle` 45 s
 * after the brief closes (`maneuverAtS` runs on the mission clock, which
 * `freezesScenarioTimer` pauses during the brief). Test readiness, load the
 * refined elements, acquire the beacon, record state of health, hand over.
 * No commanding on this pass: the flight rules say beacon then SOH, nothing
 * else, and there is no `commanding` block to tempt anyone.
 *
 * Clock starts 2027-03-22 09:00:00 UTC. All three birds are scenario-local
 * (satellites.ts factories); SAR-3 is the first use of `createMeridianSar3`.
 *
 * Pass timeline (author-passes, station galway, epoch 2027-03-22T09:00:00Z):
 *
 *   MERIDIAN-SAR-3 refined (newTle):
 *     AOS T+8.98 (09:08:58Z, az 143), max el 31.6 deg at T+13.74 (696 km slant
 *     range), LOS T+18.55 (az 353), 9.6 min, northbound. Second pass T+100.8.
 *   MERIDIAN-SAR-3 coarse injection set (initialTle):
 *     AOS T+8.50 (09:08:30Z, az 142), max el 30.3 deg at T+13.27 (719 km),
 *     LOS T+18.04 (az 354). The injection estimate predicts the bird 28 s
 *     EARLY; the refined set moves AOS ~30 s later and the ground track
 *     ~0.3 deg of RAAN east. Verified with a verify-only author-passes entry.
 *   MERIDIAN-SAR-1: AOS T+47.98, max el 25.1, LOS T+57.45 (present, not worked)
 *   MERIDIAN-SAR-2: AOS T+66.01, max el 25.1, LOS T+75.37 (present, not worked)
 *
 * Ephemeris design: `initialTle` is `newTle` with RAAN +0.3 deg and mean
 * anomaly +2.0 deg; line 2 checksum recomputed (...123457). The sim carries one
 * TLE per bird, so the pass is flown on whichever set is loaded and the beacon
 * comes up either way. The checklist, not the physics, enforces the load
 * before AOS (objective order), which the brief presents as flight-rule
 * discipline: you do not acquire a new spacecraft on a set you know is stale.
 *
 * Beacon frequency: GW-01 boots with the ACU beacon field on SAR-1's 11711 MHz.
 * The TRR asks for SAR-3's 11785 MHz. Typing it on the ACU tab or picking
 * SAR-3 as the program-track target (which copies the target's beacon
 * frequency into the field) both satisfy it; either is the operator
 * configuring the station for a bird it has never seen.
 *
 * SAR-3 RF plan (distinct from SAR-1/2 so the operator has to read the LEOP
 * card): video 11760 MHz (IF 1340, QPSK 3/4, 36 MHz, 28 dBm), telemetry beacon
 * 11785 MHz CW (IF 1315), TT&C uplink 14065 MHz (IF 1465), transponded
 * downlink 11810 MHz. Same 360 km / mm 15.6 orbit, so the S1 RF envelope holds.
 *
 * NICE Framework Alignment:
 * Primary Codes:
 *   - T0513: Supervise or manage protective or corrective measures when an incident is identified
 *   - K1032: Knowledge of satellite-based communication systems
 *   - T1138: Perform system reconfiguration
 *
 * Supporting Codes:
 *   - K0645: Knowledge of mission-relevant capabilities
 *   - S0630: Skill in performing test readiness reviews
 *   - S0421: Skill in operating network equipment
 *   - T1611: Report system status
 *   - S0842: Skill in recording operational events
 */

/** MERIDIAN-SAR-3 (61703) refined element set: the first ranging arc (newTle). */
const SAR3_S11_REFINED_TLE: MeridianTle = {
  tle1: '1 61703U 27031A   27081.37500000  .00001000  00000-0  10000-3 0  9998' as TleLine1,
  tle2: '2 61703  97.6000 328.0000 0010000  90.0000 272.0000 15.60000000123452' as TleLine2,
};

/**
 * MERIDIAN-SAR-3 (61703) coarse injection estimate (initialTle): the refined
 * set with RAAN +0.3 deg and mean anomaly +2.0 deg, checksum recomputed.
 */
const SAR3_S11_INJECTION_TLE: MeridianTle = {
  tle1: '1 61703U 27031A   27081.37500000  .00001000  00000-0  10000-3 0  9998' as TleLine1,
  tle2: '2 61703  97.6000 328.3000 0010000  90.0000 274.0000 15.60000000123457' as TleLine2,
};

/** MERIDIAN-SAR-1 (61701) element set at the S11 epoch (next pass T+48). */
const SAR1_S11_TLE: MeridianTle = {
  tle1: '1 61701U 27015A   27081.37500000  .00001000  00000-0  10000-3 0  9998' as TleLine1,
  tle2: '2 61701  97.2000 139.7500 0010000  90.0000 191.7500 15.60000000123450' as TleLine2,
};

/** MERIDIAN-SAR-2 (61702) element set at the S11 epoch (next pass T+66). */
const SAR2_S11_TLE: MeridianTle = {
  tle1: '1 61702U 27015A   27081.37500000  .00001000  00000-0  10000-3 0  9999' as TleLine1,
  tle2: '2 61702  98.4000 120.7500 0010000  90.0000 118.0000 15.60000000123451' as TleLine2,
};

const meridianSar1S11 = createMeridianSar1(SAR1_S11_TLE);
const meridianSar2S11 = createMeridianSar2(SAR2_S11_TLE);
const meridianSar3S11 = createMeridianSar3(SAR3_S11_REFINED_TLE);

export const natsEuScenario11Data: ScenarioData = {
  id: 'nats-eu-scenario11',
  url: 'nats-eu/scenarios/nats-eu-scenario11',
  imageUrl: 'nats/11/card.png',
  number: 11,
  isDisabled: false,
  difficulty: 'intermediate',
  prerequisiteScenarioIds: ['nats-eu-scenario10'],
  title: 'LEOP: Launch Day',
  subtitle: 'SAR-3 First Acquisition',
  duration: '25 min',
  missionType: 'Launch and Early Orbit',
  description: `09:00 local. MERIDIAN-SAR-3 separated from the upper stage 94 minutes ago and nobody on the ground has heard from her yet.<br><br>Rotterdam's only element set is the launch provider's injection estimate, quoted with a 20 s along-track uncertainty. A refined set from the first ranging arc is due on your console any minute. GW-01 is the first commercial station on her ground track, AOS in about nine minutes.<br><br>Anneke is LEOP lead. She wants a test readiness review, the refined elements loaded before AOS, the beacon, and a state-of-health call. Nothing else goes up on this pass.`,
  equipment: [
    'GW-01 Galway: 4m Ku-Band LEO Tracker',
    'Pass Schedule Console (ephemeris status)',
    'Ku-Band RF Front End (LNB LO 13100 MHz)',
    'Spectrum Analyzer (1315 MHz beacon IF)',
  ],
  settings: {
    isSync: true,
    groundStations: [galwayGroundStation],
    satellites: [meridianSar1S11, meridianSar2S11, meridianSar3S11],
    isExtraSatellitesVisible: true,
    scenarioStartDate: '2027-03-22',
    scenarioStartWallTime: '09:00:00',

    missionBriefUrl: 'https://docs.signalrange.space/campaign-2/scenario-11?content-only=true&dark=true',

    contactTimeline: {
      horizonHours: 2,
      minElevation: 5 as Degrees,
      showLighting: true,
    },

    // No timeSkip: AOS at T+9 is the wait, and the TRR plus the ephemeris
    // load fill it.

    workingDocument: {
      title: 'SAR-3 LEOP Log',
      description: 'First-acquisition record for Rotterdam',
    },

    // M4 - the injection estimate and the refined set. maneuverAtS is mission
    // clock seconds, so the refined set reaches the console 45 s after the
    // brief closes; the ephemeris panel shows STALE and the operator loads it.
    spaceEvents: [
      {
        id: 'SAR3-INJ',
        satelliteNoradId: 61703,
        maneuverAtS: 45,
        label: 'SAR-3 refined elements (first ranging arc)',
        initialTle: SAR3_S11_INJECTION_TLE,
        newTle: SAR3_S11_REFINED_TLE,
      },
    ],
  },
  objectives: [
    {
      id: 'review-mission-brief',
      nice: ['K0645', 'K1032'],
      title: 'Read the LEOP Card',
      description: "Open the LEOP card. It has the SAR-3 frequency plan, the injection set's stated uncertainty, and the flight rules for this pass.",
      groundStation: 'GW-01',
      freezesScenarioTimer: true,
      prerequisiteObjectiveIds: [],
      conditions: [
        {
          type: 'mission-brief-opened',
          description: 'LEOP Card Reviewed',
          params: { boxId: 'mission-brief' },
          mustMaintain: false,
        },
        {
          type: 'status-check',
          description: 'Acquisition Risk Understood',
          params: {
            character: Character.SYSTEM,
            question: 'The injection set has a stated 1-sigma along-track error of 20 s. Your beam is 0.45 deg wide. What does that mean for acquisition?',
            options: [
              'At AOS the bird can be a few degrees from prediction. Refined elements before the pass, or a beacon search wider than the beam, are required.',
              'Nothing. 20 s is inside the pass duration, so program-track will find her somewhere in the window.',
              'The beacon frequency is uncertain by the same amount, so widen the receiver bandwidth.',
            ],
            correctIndex: 0,
            explanation:
              'Correct. A LEO bird moves about 7.5 km every second; 20 s along-track at 700 km range is several beamwidths of pointing error. Either the elements get better before AOS, or the search does. LEOP clock started.',
            pointPenalty: 5,
          },
          mustMaintain: false,
        },
      ],
      conditionLogic: 'AND',
      points: 5,
    },
    {
      id: 'test-readiness',
      nice: ['S0630', 'T0513'],
      title: 'Test Readiness Review',
      description:
        "Confirm the station is configured for a bird it has never seen: set the ACU beacon frequency to SAR-3's telemetry beacon (11785 MHz), then close the TRR checklist.",
      groundStation: 'GW-01',
      prerequisiteObjectiveIds: ['review-mission-brief'],
      conditions: [
        {
          type: 'antenna-beacon-frequency-set',
          description: 'ACU Beacon Frequency 11785 MHz',
          params: { beaconFrequency: MERIDIAN_SAR3_BEACON_RF_HZ },
          mustMaintain: true,
        },
        {
          type: 'status-check',
          description: 'TRR Checklist Closed',
          params: {
            character: Character.SYSTEM,
            question: 'TRR for a first acquisition. Which line set below is the one that goes in the LEOP log?',
            options: [
              'Beacon 11785 MHz on the ACU, video IF 1340 MHz on the receiver, injection set loaded and flagged as provisional.',
              'Beacon 11711 MHz on the ACU, video IF 1414 MHz on the receiver, injection set loaded.',
              'Beacon 11785 MHz on the ACU, TT&C uplink 14065 MHz keyed and ready to command.',
            ],
            correctIndex: 0,
            explanation: 'Correct. SAR-3 has her own frequency plan; 11711 and 1414 are SAR-1. The uplink stays cold: no command goes up before SOH is confirmed.',
            pointPenalty: 5,
            documentSection: 'Readiness',
            documentLine: 'TRR complete: beacon 11785 MHz, video IF 1340 MHz, injection set loaded',
          },
          mustMaintain: false,
        },
      ],
      conditionLogic: 'AND',
      points: 15,
    },
    {
      id: 'load-refined-elements',
      nice: ['T1138', 'K1032'],
      title: 'Load the Refined Elements',
      description: "Rotterdam's ranging solution replaces the injection estimate. When the ephemeris panel flags SAR-3, load the refined set before AOS.",
      groundStation: 'GW-01',
      prerequisiteObjectiveIds: ['test-readiness'],
      conditions: [
        {
          type: 'tab-active',
          hidden: true,
          description: 'Pass Schedule Tab Open',
          params: { tab: 'pass-schedule' },
          mustMaintain: false,
        },
        {
          type: 'ephemeris-updated',
          description: 'Refined Elements Loaded',
          params: { eventId: 'SAR3-INJ' },
          mustMaintain: true,
        },
      ],
      conditionLogic: 'AND',
      points: 20,
    },
    {
      id: 'first-acquisition',
      nice: ['T0513', 'S0421', 'K1032'],
      title: 'First Acquisition',
      description: 'AOS T+9. Program-track MERIDIAN-SAR-3 on the refined set, find the beacon at 1315 MHz IF, and confirm the ACU has beacon lock.',
      groundStation: 'GW-01',
      prerequisiteObjectiveIds: ['load-refined-elements'],
      conditions: [
        {
          type: 'antenna-tracking-mode-set',
          description: 'Program-Track Enabled',
          params: { trackingMode: 'program-track' },
          mustMaintain: true,
        },
        {
          type: 'signal-detected',
          description: 'MERIDIAN-SAR-3 Beacon Detected',
          params: {
            signalId: 'MERIDIAN-SAR-3-Beacon',
            minPower: -130 as dBm,
            requiresObservation: true,
            observationTab: 'rx-analysis',
          },
          mustMaintain: false,
        },
        {
          type: 'antenna-beacon-locked',
          description: 'ACU Beacon Lock',
          params: { requiresObservation: true, observationTab: 'acu-control' },
          mustMaintain: false,
        },
      ],
      conditionLogic: 'AND',
      points: 30,
    },
    {
      id: 'state-of-health',
      nice: ['T1611', 'S0842'],
      title: 'Initial State of Health',
      description: 'Record beacon power and Doppler behaviour for Rotterdam.',
      groundStation: 'GW-01',
      prerequisiteObjectiveIds: ['first-acquisition'],
      conditions: [
        {
          type: 'status-check',
          description: 'SOH Recorded',
          params: {
            character: Character.SYSTEM,
            question: 'Beacon present, antenna tracking, Doppler profile matches the refined set. What is the SOH call?',
            options: [
              'Spacecraft transmitting on the expected frequency and orbit; no anomaly; recommend proceeding to command checkout next pass.',
              'Spacecraft healthy; recommend commanding the payload on now while the link is up.',
              'Inconclusive until video is decoded; recommend holding commissioning.',
            ],
            correctIndex: 0,
            explanation:
              'Correct. A CW beacon on frequency with the right Doppler curve tells you the transmitter, the reference, and the orbit are all as expected. If the elements had been loaded after AOS the call would carry a qualifier, because the first minute of track was on a set you knew was stale.',
            pointPenalty: 5,
            documentSection: 'State of Health',
            documentLine: 'SOH: beacon acquired, orbit matches refined set, proceed to commissioning',
          },
          mustMaintain: false,
        },
      ],
      conditionLogic: 'AND',
      points: 20,
    },
    {
      id: 'leop-handover',
      nice: ['T0513', 'K0645'],
      title: 'LEOP Handover',
      description: 'Tell Anneke what she has.',
      groundStation: 'GW-01',
      prerequisiteObjectiveIds: ['state-of-health'],
      conditions: [
        {
          type: 'status-check',
          description: 'Handover Given',
          params: {
            character: Character.SYSTEM,
            question: 'You have the bird, the link is clean and the uplink chain is ready. Why not command her on this pass while you have it?',
            options: [
              'The flight rules sequence LEOP: no command until SOH is confirmed and the ground station has demonstrated tracking. A rejected command on a new bird is unexplainable.',
              'Because the TT&C key has not been loaded yet; otherwise it would be fine.',
              'Because the pass is too short. On a longer pass it would be fine.',
            ],
            correctIndex: 0,
            explanation:
              'Correct. On a new spacecraft every first is evidence. If a command fails before tracking and SOH are on record, nobody can say whether the bird, the link, or the station was the cause. Commissioning is next pass.',
            pointPenalty: 5,
          },
          mustMaintain: false,
        },
      ],
      conditionLogic: 'AND',
      points: 15,
    },
  ],
  dialogClips: {
    intro: {
      text: `
      <p>
        <em>[Text message from Anneke Visser at 08:57]</em>
      </p>
      <p>
        "Separation confirmed at 07:26. SAR-3 is on her own and Galway is the first commercial site on her track, AOS about 09:09. All I have is the launch provider's injection set; the first ranging arc is being solved now and I will push the refined elements to your console as soon as it closes. Beacon, then state of health. Nothing else."
      </p>
      `,
      character: Character.ANNEKE_VISSER,
      emotion: Emotion.NEUTRAL,
      audioUrl: '',
    },
    objectives: {
      'test-readiness': {
        text: `
        <p>
          TRR noted, thank you. The refined set from the first ranging arc is on its way to your console now; load it the moment the panel flags it. The injection numbers had her thirty seconds out, which on a 0.45 degree beam is not a small thing.
        </p>
        `,
        character: Character.ANNEKE_VISSER,
        emotion: Emotion.NEUTRAL,
        audioUrl: '',
      },
      'first-acquisition': {
        text: `
        <p>
          That's her. First contact from a commercial site, on frequency, on the refined orbit. Give me the state-of-health call when you are ready; I have the whole room waiting on it.
        </p>
        `,
        character: Character.ANNEKE_VISSER,
        emotion: Emotion.HAPPY,
        audioUrl: '',
      },
      'leop-handover': {
        text: `
        <p>
          Logged. Beacon acquired, orbit confirmed, no anomaly, and nobody sent anything they could not explain afterwards. That is exactly what launch day is supposed to look like. Commissioning is Wednesday; I will send the acceptance test plan tonight. Well done, Galway.
        </p>
        `,
        character: Character.ANNEKE_VISSER,
        emotion: Emotion.CONFIDENT,
        audioUrl: '',
      },
    },
  },
};
