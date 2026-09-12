import { Character, Emotion } from '@app/modal/character-enum';
import type { ScenarioData } from '@app/ScenarioData';
import type { Degrees, TleLine1, TleLine2 } from 'ootk';
import { galwayGroundStation, shetlandGroundStation } from './ground-stations';
import { createMeridianSar1, createMeridianSar2, type MeridianTle } from './satellites';

/**
 * nats-eu Scenario 9 - "Morning Constellation" / Network Health & Daily Pass Plan
 *
 * First qualified shift (Phase 2 opener). No new mechanics: two health checks
 * (one per site, the Shetland one run from the Galway console), a six-contact
 * day plan with two conflict pairs and two droppable P3 second-orbit contacts,
 * then two receive-only passes worked back to back.
 *
 * This is the first scenario with its own epoch and its own element sets. The
 * clock starts 2027-03-17 06:10:00 UTC and the birds are built here with the
 * satellites.ts factories, so nothing this scenario does to a TLE can leak into
 * another scenario's sky.
 *
 * Pass timeline (author-passes, station galway, epoch 2027-03-17T06:10:00Z):
 *
 *   MERIDIAN-SAR-1 #1: AOS T+8.0 (06:18:00Z, az 143), max el 30.5 deg at T+12.8
 *                      (716 km slant range), LOS T+17.6 (az 355), 9.5 min, northbound
 *   MERIDIAN-SAR-2 #1: AOS T+22.0 (06:32:00Z, az 6), max el 25.2 deg at T+26.7
 *                      (823 km slant range), LOS T+31.4 (az 224), 9.4 min, southbound
 *   MERIDIAN-SAR-1 #2: AOS T+99.9 (07:49:51Z), max el 18.3 deg at T+104.4, LOS T+109.0
 *   MERIDIAN-SAR-2 #2: AOS T+114.9, max el 2.1 deg (graze), LOS T+119.2
 *
 * Contact windows: Galway = printed AOS/LOS rounded to 10 s; Shetland =
 * Galway AOS + 90 s .. LOS + 150 s (authored offsets, never propagated; see the
 * SH-02 note in ground-stations.ts).
 *
 * RF is the S1 envelope, unchanged: video 28 dBm EIRP, IF 1414 / 1370 MHz,
 * C/N peaks ~11 dB at 25-30 deg max elevation under real program-track. No faults.
 *
 * NICE Framework Alignment:
 * Primary Codes:
 *   - T0431: Check system hardware availability, functionality, integrity, and efficiency
 *   - K0689: Knowledge of network systems management principles and tools
 *   - T0153: Monitor network capacity and performance
 *
 * Supporting Codes:
 *   - K0741: Knowledge of system administration concepts
 *   - T0129: Coordinate and manage system operations schedules
 *   - S0421: Skill in operating network equipment
 *   - K0740: Knowledge of system performance indicators
 *   - S0478: Skill in communicating with customers
 *   - T1580: Report service status to stakeholders
 */

/** MERIDIAN-SAR-1 (61701) element set at the S9 epoch. */
const SAR1_S9_TLE: MeridianTle = {
  tle1: '1 61701U 27015A   27076.25694444  .00001000  00000-0  10000-3 0  9995' as TleLine1,
  tle2: '2 61701  97.2000 280.0000 0010000  90.0000 275.7500 15.60000000123458' as TleLine2,
};

/** MERIDIAN-SAR-2 (61702) element set at the S9 epoch. */
const SAR2_S9_TLE: MeridianTle = {
  tle1: '1 61702U 27015A   27076.25694444  .00001000  00000-0  10000-3 0  9996' as TleLine1,
  tle2: '2 61702  98.4000  62.2500 0010000  90.0000 289.5000 15.60000000123455' as TleLine2,
};

const meridianSar1S9 = createMeridianSar1(SAR1_S9_TLE);
const meridianSar2S9 = createMeridianSar2(SAR2_S9_TLE);

export const natsEuScenario9Data: ScenarioData = {
  id: 'nats-eu-scenario9',
  url: 'nats-eu/scenarios/nats-eu-scenario9',
  imageUrl: 'nats/9/card.png',
  number: 9,
  isDisabled: false,
  difficulty: 'intermediate',
  prerequisiteScenarioIds: ['nats-eu-scenario8'],
  title: 'Morning Constellation',
  subtitle: 'Network Health & Daily Pass Plan',
  duration: '25 min',
  missionType: 'Network Operations',
  description: `06:10 local. First qualified shift. Two sites, two birds, six contacts on the board and nobody to hand you the plan.<br><br>Erik Halvorsen at Nordic Maritime Watch has a standing collect on the 06:18 MERIDIAN-SAR-1 window and wants to know it is covered. Fiona is on the SH-02 console but she has her own morning.<br><br>Check both sites before the first window, build the day plan, then work the two morning passes. The second-orbit contacts are yours to keep or drop.`,
  equipment: [
    'GW-01 Galway: 4m Ku-Band LEO Tracker',
    'SH-02 Shetland: 4m Ku-Band LEO Tracker',
    'Contact Plan Console',
    'Ku-Band RF Front End (GPSDO / LNB / BUC / HPA)',
    'RX Modem with Video Decoder',
  ],
  settings: {
    isSync: true,
    groundStations: [galwayGroundStation, shetlandGroundStation],
    satellites: [meridianSar1S9, meridianSar2S9],
    isExtraSatellitesVisible: true,
    scenarioStartDate: '2027-03-17',
    scenarioStartWallTime: '06:10:00',

    missionBriefUrl: 'https://docs.signalrange.space/campaign-2/scenario-9?content-only=true&dark=true',

    contactTimeline: {
      horizonHours: 3,
      minElevation: 5 as Degrees,
      showLighting: true,
    },

    // The two P3 second-orbit contacts sit at T+100 and T+115 min. If the
    // operator keeps them in the plan, the skip gets there without sitting
    // through an hour of empty sky. The skip stops 2 min before the NEXT pass,
    // so skipping before the SAR-1 window is worked forfeits it.
    timeSkip: {
      leadTimeS: 120,
      minSkipS: 300,
      horizonHours: 4,
    },

    // M3 - the day plan. Two conflict pairs (SAR-1 at T+8, SAR-2 at T+22),
    // each of which has to be split across the sites, plus two P3 second-orbit
    // contacts that may be left unassigned: requiredPriorityAtOrAbove 2 means
    // only the four P1/P2 contacts have to be covered for the plan to validate.
    contactSchedule: {
      stationIds: ['GW-01', 'SH-02'],
      requiredPriorityAtOrAbove: 2,
      contacts: [
        { id: 'M-SAR1-GW', satelliteNoradId: 61701, label: 'MERIDIAN-SAR-1 (Galway, 30 deg pass)', priority: 1, windowStartS: 480, windowEndS: 1050 },
        { id: 'M-SAR1-SH', satelliteNoradId: 61701, label: 'MERIDIAN-SAR-1 (Shetland horizon)', priority: 2, windowStartS: 570, windowEndS: 1200 },
        { id: 'M-SAR2-GW', satelliteNoradId: 61702, label: 'MERIDIAN-SAR-2 (Galway, 25 deg pass)', priority: 1, windowStartS: 1320, windowEndS: 1880 },
        { id: 'M-SAR2-SH', satelliteNoradId: 61702, label: 'MERIDIAN-SAR-2 (Shetland horizon)', priority: 1, windowStartS: 1410, windowEndS: 2030 },
        { id: 'M-SAR1-GW-2', satelliteNoradId: 61701, label: 'MERIDIAN-SAR-1 (Galway, second orbit, 18 deg)', priority: 3, windowStartS: 5990, windowEndS: 6540 },
        { id: 'M-SAR2-SH-2', satelliteNoradId: 61702, label: 'MERIDIAN-SAR-2 (Shetland, second orbit)', priority: 3, windowStartS: 6980, windowEndS: 7300 },
      ],
    },
  },
  objectives: [
    {
      id: 'review-mission-brief',
      nice: ['K0645', 'K0737'],
      title: 'Take the Shift',
      description: 'Open the brief; confirm the six contacts and the health-check list.',
      groundStation: 'GW-01',
      freezesScenarioTimer: true,
      prerequisiteObjectiveIds: [],
      conditions: [
        {
          type: 'mission-brief-opened',
          description: 'Shift Brief Reviewed',
          params: { boxId: 'mission-brief' },
          mustMaintain: false,
        },
        {
          type: 'status-check',
          description: 'Plan Rule Confirmed',
          params: {
            character: Character.SYSTEM,
            question: 'Six contacts, two sites. What must be true before you publish a plan to Fiona?',
            options: [
              'No site is double-booked and every P1 and P2 contact is assigned to a station.',
              'Every contact on the board, including the P3 second-orbit passes, is assigned to Galway.',
              'Both sites are assigned to the same contact so there is a backup.',
            ],
            correctIndex: 0,
            explanation: 'Correct. Overlaps go to different sites, the P1/P2 contacts are all covered, and the P3 passes are yours to keep or drop. Shift clock started.',
            pointPenalty: 5,
          },
          mustMaintain: false,
        },
      ],
      conditionLogic: 'AND',
      points: 5,
    },
    {
      id: 'galway-health',
      nice: ['T0431', 'K0741'],
      title: 'Galway Health Check',
      description: "Confirm GW-01's reference and RF chain are nominal before the first window: GPSDO locked and out of holdover, LNB thermally stable, HPA not overdriven.",
      groundStation: 'GW-01',
      prerequisiteObjectiveIds: ['review-mission-brief'],
      conditions: [
        {
          type: 'gpsdo-locked',
          description: 'GW-01 GPSDO Locked',
          params: { requiresObservation: true, observationTab: 'gps-timing' },
          mustMaintain: false,
        },
        {
          type: 'gpsdo-not-in-holdover',
          description: 'GW-01 GPSDO Not in Holdover',
          params: { requiresObservation: true, observationTab: 'gps-timing' },
          mustMaintain: false,
        },
        {
          type: 'lnb-thermally-stable',
          description: 'GW-01 LNB Thermally Stable',
          params: { requiresObservation: true, observationTab: 'rx-analysis' },
          mustMaintain: false,
        },
        {
          type: 'hpa-not-overdriven',
          description: 'GW-01 HPA Not Overdriven',
          params: { requiresObservation: true, observationTab: 'tx-chain' },
          mustMaintain: false,
        },
      ],
      conditionLogic: 'AND',
      points: 10,
    },
    {
      id: 'shetland-health',
      nice: ['T0431', 'K0741', 'S0421'],
      title: 'Shetland Health Check',
      description: 'Same checks on SH-02 from the Galway console: GPSDO locked, BUC temperature normal, LNB thermally stable.',
      groundStation: 'SH-02',
      prerequisiteObjectiveIds: ['galway-health'],
      conditions: [
        {
          type: 'ground-station-selected',
          hidden: true,
          description: 'SH-02 Selected',
          params: { groundStationId: 'SH-02' },
          mustMaintain: true,
        },
        {
          type: 'gpsdo-locked',
          description: 'SH-02 GPSDO Locked',
          params: { requiresObservation: true, observationTab: 'gps-timing' },
          mustMaintain: false,
        },
        {
          type: 'buc-temperature-normal',
          description: 'SH-02 BUC Temperature Normal',
          params: { maxTemperature: 70, requiresObservation: true, observationTab: 'tx-chain' },
          mustMaintain: false,
        },
        {
          type: 'lnb-thermally-stable',
          description: 'SH-02 LNB Thermally Stable',
          params: { requiresObservation: true, observationTab: 'rx-analysis' },
          mustMaintain: false,
        },
      ],
      conditionLogic: 'AND',
      points: 10,
    },
    {
      id: 'build-the-day-plan',
      nice: ['K0689', 'T0129'],
      title: 'Build the Day Plan',
      description:
        "Allocate the morning's contacts across GW-01 and SH-02 with no site double-booked; leave the P3 second-orbit contacts to your judgment. The plan must read VALID.",
      groundStation: 'GW-01',
      prerequisiteObjectiveIds: ['review-mission-brief'],
      conditions: [
        {
          type: 'contact-assigned',
          description: 'SAR-1 06:18 Window on GW-01',
          params: { contactId: 'M-SAR1-GW', groundStationId: 'GW-01' },
          mustMaintain: true,
        },
        {
          type: 'contact-assigned',
          description: 'SAR-2 Shetland Window on SH-02',
          params: { contactId: 'M-SAR2-SH', groundStationId: 'SH-02' },
          mustMaintain: true,
        },
        {
          type: 'contact-plan-valid',
          description: 'Contact Plan Valid',
          params: {},
          mustMaintain: true,
        },
      ],
      conditionLogic: 'AND',
      points: 20,
    },
    {
      id: 'work-the-first-window',
      nice: ['T0153', 'S0421', 'K0740'],
      title: 'Work the SAR-1 Window',
      description: 'AOS T+8. Program-track MERIDIAN-SAR-1, decode the imagery downlink (IF 1414 MHz), and hold C/N above 8 dB.',
      groundStation: 'GW-01',
      prerequisiteObjectiveIds: ['galway-health', 'build-the-day-plan'],
      conditions: [
        {
          type: 'antenna-tracking-mode-set',
          description: 'Program-Track Enabled',
          params: { trackingMode: 'program-track' },
          mustMaintain: true,
        },
        {
          type: 'receiver-signal-locked',
          description: 'RX Modem Locked on SAR-1 Downlink',
          params: { modemNumber: 1, requiresObservation: true, observationTab: 'rx-analysis' },
          mustMaintain: true,
        },
        {
          type: 'receiver-snr-threshold',
          description: 'C/N Above 8 dB',
          params: { modemNumber: 1, minCNRatio: 8, requiresObservation: true, observationTab: 'rx-analysis' },
          mustMaintain: true,
        },
      ],
      conditionLogic: 'AND',
      points: 25,
    },
    {
      id: 'second-window',
      nice: ['T0153', 'S0421'],
      title: 'Work the SAR-2 Window',
      description: 'AOS T+22. Retune the receiver to 1370 MHz and decode the MERIDIAN-SAR-2 downlink.',
      groundStation: 'GW-01',
      prerequisiteObjectiveIds: ['work-the-first-window'],
      conditions: [
        {
          type: 'receiver-signal-locked',
          description: 'RX Modem Locked on SAR-2 Downlink',
          params: { modemNumber: 1, requiresObservation: true, observationTab: 'rx-analysis' },
          mustMaintain: true,
        },
        {
          type: 'receiver-snr-threshold',
          description: 'C/N Above 8 dB',
          params: { modemNumber: 1, minCNRatio: 8, requiresObservation: true, observationTab: 'rx-analysis' },
          mustMaintain: true,
        },
      ],
      conditionLogic: 'AND',
      points: 15,
    },
    {
      id: 'customer-status',
      nice: ['S0478', 'T1580'],
      title: 'Customer Status',
      description: 'Close the morning with Erik.',
      groundStation: 'GW-01',
      prerequisiteObjectiveIds: ['second-window'],
      conditions: [
        {
          type: 'status-check',
          description: 'Status Reported to Erik',
          params: {
            character: Character.SYSTEM,
            question: 'Erik asks whether his 06:18 collect was captured and what the day looks like. What do you report?',
            options: [
              'The collect decoded with margin; both P1 windows are covered across the two sites; the second-orbit contacts are best-effort.',
              'The collect decoded; every contact on the board is guaranteed from Galway alone.',
              'The collect was captured, but the SAR-2 windows were dropped because both sites were busy.',
            ],
            correctIndex: 0,
            explanation:
              'Correct. Report what was captured, what is committed, and what is best-effort. Erik does not need the C/N numbers; he needs to know what he can count on.',
            pointPenalty: 5,
          },
          mustMaintain: false,
        },
      ],
      conditionLogic: 'AND',
      points: 10,
    },
  ],
  dialogClips: {
    intro: {
      text: `
      <p>
        <em>[Text message from Erik Halvorsen at 06:02]</em>
      </p>
      <p>
        "Morning. Standing collect on the 06:18 SAR-1 window, same as every day this week. I have a vessel track that depends on it. I do not need the details - just tell me it's covered."
      </p>
      `,
      character: Character.ERIK_HALVORSEN,
      emotion: Emotion.NEUTRAL,
      audioUrl: '',
    },
    objectives: {
      'shetland-health': {
        text: `
        <p>
          Shetland's clean. Reference locked, BUC cold, wind's only forty knots so that counts as a nice morning up here. Plan's yours - send it when it validates and I'll take whatever you give me.
        </p>
        `,
        character: Character.FIONA_MACLEOD,
        emotion: Emotion.NEUTRAL,
        audioUrl: '',
      },
      'work-the-first-window': {
        text: `
        <p>
          Got the frames. Vessel is where I thought it was. Same time tomorrow?
        </p>
        `,
        character: Character.ERIK_HALVORSEN,
        emotion: Emotion.HAPPY,
        audioUrl: '',
      },
      'customer-status': {
        text: `
        <p>
          That's what I needed. Two sites covering the morning and a straight answer on the rest. I'll take best-effort on the second orbit as long as nobody calls it guaranteed. Thanks - talk tomorrow.
        </p>
        `,
        character: Character.ERIK_HALVORSEN,
        emotion: Emotion.CONFIDENT,
        audioUrl: '',
      },
    },
  },
};
