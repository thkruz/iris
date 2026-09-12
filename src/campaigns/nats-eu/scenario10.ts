import { Character, Emotion } from '@app/modal/character-enum';
import type { ScenarioData } from '@app/ScenarioData';
import type { dBm } from '@app/types';
import type { Degrees, TleLine1, TleLine2 } from 'ootk';
import { galwayGroundStation } from './ground-stations';
import { createMeridianSar1, createMeridianSar2 } from './satellites';

/**
 * nats-eu Scenario 10 - "Priority Tasking" / Urgent Collect, Low Pass
 *
 * No new mechanics. The lesson is geometry: everything the operator has done
 * on 28 to 40 deg passes now has to be done on a pass that peaks at 18 deg,
 * where the link budget closes with about two decibels to spare and the uplink
 * needs 6 dB more EIRP to reach the bird at long range. Erik's vessel of
 * interest is off the Faroes and this is the only MERIDIAN-SAR-1 window that
 * covers it today: the collect is tasked by command on the pass and the
 * imagery is pulled down on the same pass.
 *
 * Scenario-local element sets, epoch 2027-03-18 15:30:00 UTC (authored with
 * scripts/author-passes.mjs; observer Galway):
 * - MERIDIAN-SAR-1 (61701): AOS T+4.98 min (15:34:59Z, az 27), max el 17.8 deg
 *   at T+9.52 (slant range 1040 km), LOS T+14.05 min (az 159), 9.1 min,
 *   southbound. First pass after scenario start.
 * - MERIDIAN-SAR-2 (61702): AOS T+54.98, max el 25.0 deg at T+59.71,
 *   LOS T+64.43. Present in the sky, not worked.
 *
 * Link-budget worksheet (published in objective 2):
 * - slant range at max elevation 1040 km -> FSPL 174.1 dB at 11686 MHz
 *   (S2 worked 761 km / 171.4 dB: 3.7 dB more path loss here)
 * - EIRP 28 dBm, GW-01 4m Ku gain 51.8 dBi, Tsys 88 K, BW 36 MHz, misc 1.2 dB
 *   (the extra 0.2 dB over S2/S8 is the longer atmospheric path at 18 deg)
 * - correct worksheet -> C/N 8.09 dB (expectedCNRDb 8.1, tolerance 1.0)
 * - threshold 6 dB (QPSK 3/4 demod) + 1 dB required margin
 *
 * Uplink: HPA back-off 10 -> 4 dB is +6 dB EIRP. Below 3 dB the amplifier is
 * overdriven (`isOverdriven`, IMD alarm) and objective 3 loses its maintain.
 * BUC gain stays 23 dB (output -10 dBm, saturation 15 dBm), so the BUC is
 * never the limit; the HPA back-off is the operator's only EIRP knob.
 *
 * Commanding window is the SAR-1 pass with 20 s guard bands:
 * AOS 299 s + 20 -> windowStartS 319; LOS 843 s - 20 -> windowEndS 823.
 * Commands ACK on window + Doppler comp + key only, so the EIRP requirement
 * is enforced by the equipment conditions in objective 3, not by the ACK.
 *
 * SAFETY NOTE (as S3): enabling the HPA with no drive from the BUC trips the
 * HPA_NOISE_AMPLIFICATION invariant and fails the mission. Objective 5 keys
 * the modem before the HPA and the description says so.
 *
 * NICE Framework Alignment:
 * Primary Codes:
 *   - T0080: Test and evaluate system performance against requirements
 *   - T1567: Conduct satellite command and control operations
 *   - K0740: Knowledge of system performance indicators
 *
 * Supporting Codes:
 *   - S0675: Skill in configuring RF transmit equipment within safe limits
 *   - K0064: Knowledge of performance tuning tools and techniques
 *   - T0153: Monitor network capacity and performance
 *   - S0478: Skill in communicating technical results to customers
 *   - T1580: Report mission outcome to the requesting organization
 */

/** SAR-1 element set for this epoch: the 18 deg southbound pass at T+5. */
const meridianSar1LowPass = createMeridianSar1({
  tle1: '1 61701U 27015A   27077.64583333  .00001000  00000-0  10000-3 0  9993' as TleLine1,
  tle2: '2 61701  97.2000 226.2500 0010000  90.0000   0.2500 15.60000000123456' as TleLine2,
});

/** SAR-2 element set for this epoch: a 25 deg pass at T+55, not worked. */
const meridianSar2Parked = createMeridianSar2({
  tle1: '1 61702U 27015A   27077.64583333  .00001000  00000-0  10000-3 0  9994' as TleLine1,
  tle2: '2 61702  98.4000 233.7500 0010000  90.0000 164.5000 15.60000000123452' as TleLine2,
});

export const natsEuScenario10Data: ScenarioData = {
  id: 'nats-eu-scenario10',
  url: 'nats-eu/scenarios/nats-eu-scenario10',
  imageUrl: 'nats/10/card.png',
  number: 10,
  isDisabled: false,
  difficulty: 'intermediate',
  prerequisiteScenarioIds: ['nats-eu-scenario9'],
  title: 'Priority Tasking',
  subtitle: 'Urgent Collect, Low Pass',
  duration: '20-25 min',
  missionType: 'Tasking',
  description: `15:30 local. Erik Halvorsen at Nordic Maritime Watch has a vessel of interest off the Faroes and needs SAR imagery of it today. The only MERIDIAN-SAR-1 window that covers the box peaks at 18 degrees over Galway, in five minutes.<br><br>The collect has to be tasked by command early in that pass, and the imagery has to come down on the same pass. Anneke at constellation ops has confirmed the bird is available.<br><br>The link budget says the margin at 18 degrees is about two decibels. The uplink needs more EIRP than you have ever run from GW-01, and the amplifier has a limit. One pass. Everything else is arithmetic.`,
  equipment: ['4m Ku-Band LEO Tracking Antenna', 'Ku-Band BUC (12600 MHz LO) + HPA', 'Link Analysis / TT&C Commanding consoles', 'QPSK 3/4 Transmit and Receive Modems'],
  settings: {
    isSync: true,
    groundStations: [galwayGroundStation],
    satellites: [meridianSar1LowPass, meridianSar2Parked],
    isExtraSatellitesVisible: true,
    scenarioStartDate: '2027-03-18',
    scenarioStartWallTime: '15:30:00',

    missionBriefUrl: 'https://docs.signalrange.space/campaign-2/scenario-10?content-only=true&dark=true',

    contactTimeline: {
      horizonHours: 2,
      minElevation: 5 as Degrees,
      showLighting: true,
    },

    // M1 - the low-pass budget. expectedCNRDb is what a CORRECT worksheet
    // produces from the numbers published in objective 2.
    // Measured under real program-track (nats-eu-phase-c-validation): peak
    // 8.11 dB at T+9.53, 151 s at or above 7 dB, 43 s at or above 8 dB.
    linkBudget: {
      label: 'Low-elevation collect: SAR-1 downlink at 18 deg',
      expectedCNRDb: 8.1,
      toleranceDb: 1.0,
      thresholdCNRDb: 6,
      requiredMarginDb: 1,
    },

    // M2 - the tasking command. Window is the SAR-1 pass with 20 s guard
    // bands: AOS T+4.98 (299 s) .. LOS T+14.05 (843 s).
    commanding: {
      groundStationId: 'GW-01',
      targetNoradId: 61701,
      windowStartS: 319,
      windowEndS: 823,
      requireDopplerComp: true,
      requireValidKey: true,
      commands: [
        { id: 'SAR-TASK-URGENT', label: 'Task urgent SAR collect' },
        { id: 'REC-PLAYBACK', label: 'Start recorder playback' },
        { id: 'PLD-SAFE', label: 'Payload to safe mode' },
      ],
    },
  },
  objectives: [
    {
      id: 'review-mission-brief',
      nice: ['K0645', 'K0740'],
      title: 'Read the Tasking',
      description: 'Open the tasking brief and confirm the target box, the pass, and what an 18 degree pass does to the numbers you are used to.',
      groundStation: 'GW-01',
      freezesScenarioTimer: true,
      prerequisiteObjectiveIds: [],
      conditions: [
        {
          type: 'mission-brief-opened',
          description: 'Tasking Brief Reviewed',
          params: { boxId: 'mission-brief' },
          mustMaintain: false,
        },
        {
          type: 'status-check',
          description: 'Low-Pass Geometry Understood',
          params: {
            character: Character.SYSTEM,
            question: 'This pass peaks at 18 degrees. Against the 28 degree passes you have worked, what changes in the link budget?',
            options: [
              'Slant range at max elevation is about 1040 km instead of 761 km: nearly 3 dB more path loss plus more atmosphere, so the margin over threshold shrinks to about two decibels.',
              'Nothing in the budget changes; a lower pass is just shorter.',
              'The satellite EIRP drops at low elevation, so the bird has to be commanded to full power first.',
            ],
            correctIndex: 0,
            explanation:
              'Correct. Path loss goes as the square of the range, and at 18 degrees the signal crosses several times more atmosphere than it does near the zenith. The receiver will still lock, but only just, and only near max elevation.',
            pointPenalty: 5,
          },
          mustMaintain: false,
        },
      ],
      conditionLogic: 'AND',
      points: 5,
    },
    {
      id: 'budget-the-low-pass',
      nice: ['T0080', 'S0015', 'K0740'],
      title: 'Budget the Low Pass',
      description:
        'Fill the Link Analysis worksheet for MERIDIAN-SAR-1 at maximum elevation and press Compute. Worksheet numbers: satellite EIRP 28 dBm; slant range at max elevation 1040 km (free-space path loss 174.1 dB at 11686 MHz); GW-01 receive gain 51.8 dBi; system noise temperature 88 K; occupied bandwidth 36 MHz; miscellaneous losses 1.2 dB.',
      groundStation: 'GW-01',
      prerequisiteObjectiveIds: ['review-mission-brief'],
      conditions: [
        {
          type: 'tab-active',
          hidden: true,
          description: 'Link Analysis Tab Open',
          params: { tab: 'link-budget' },
          mustMaintain: false,
        },
        {
          type: 'link-budget-computed',
          description: 'Predicted C/N Matches Truth',
          params: {},
          mustMaintain: false,
        },
      ],
      conditionLogic: 'AND',
      points: 15,
    },
    {
      id: 'raise-the-eirp',
      nice: ['S0675', 'K0064', 'K0740'],
      title: 'Raise Uplink EIRP Without Overdriving',
      description:
        'The command has to reach the bird at long range: take the HPA back-off from 10 dB to 4 dB for 6 dB more EIRP. Below 3 dB the amplifier is overdriven and the IMD alarm trips. Leave the BUC gain where it is.',
      groundStation: 'GW-01',
      prerequisiteObjectiveIds: ['review-mission-brief'],
      conditions: [
        {
          type: 'hpa-back-off-set',
          description: 'HPA Back-Off at 4 dB',
          params: { backOff: 4, backOffTolerance: 0.5 },
          mustMaintain: true,
        },
        {
          type: 'hpa-not-overdriven',
          description: 'HPA Linear (No IMD Alarm)',
          params: {},
          mustMaintain: true,
        },
        {
          type: 'buc-not-saturated',
          description: 'BUC Out of Compression',
          params: {},
          mustMaintain: true,
        },
      ],
      conditionLogic: 'AND',
      points: 20,
    },
    {
      id: 'acquire-low',
      nice: ['S0421', 'K1032'],
      title: 'Acquire at the Horizon',
      description: 'AOS T+5 min, north-northeast. Program-track MERIDIAN-SAR-1, engage uplink Doppler compensation, and acquire the beacon as it clears the horizon.',
      groundStation: 'GW-01',
      prerequisiteObjectiveIds: ['budget-the-low-pass', 'raise-the-eirp'],
      conditions: [
        {
          type: 'antenna-tracking-mode-set',
          description: 'Program-Track Enabled',
          params: { trackingMode: 'program-track' },
          mustMaintain: true,
        },
        {
          type: 'signal-detected',
          description: 'MERIDIAN-SAR-1 Beacon Detected',
          params: {
            signalId: 'MERIDIAN-SAR-1-Beacon',
            minPower: -130 as dBm,
            requiresObservation: true,
            observationTab: 'rx-analysis',
          },
          mustMaintain: false,
        },
        {
          type: 'uplink-doppler-comp-enabled',
          description: 'Uplink Doppler Compensation Engaged',
          params: {},
          mustMaintain: true,
        },
      ],
      conditionLogic: 'AND',
      points: 10,
    },
    {
      id: 'task-the-collect',
      nice: ['T1567', 'K0773'],
      title: 'Task the Collect',
      description:
        'Modem on air FIRST, then the HPA, then send SAR-TASK-URGENT early in the pass. The imaging block needs lead time to arm before the bird is over the box, and the window closes at T+13.3.',
      groundStation: 'GW-01',
      prerequisiteObjectiveIds: ['acquire-low'],
      conditions: [
        {
          type: 'tx-modem-transmitting',
          description: 'Transmit Modem On Air',
          params: { modemNumber: 1 },
          mustMaintain: true,
        },
        {
          type: 'hpa-enabled',
          description: 'HPA Enabled',
          params: {},
          mustMaintain: true,
        },
        {
          type: 'command-acknowledged',
          description: 'SAR-TASK-URGENT Acknowledged',
          params: { commandId: 'SAR-TASK-URGENT' },
          mustMaintain: false,
        },
      ],
      conditionLogic: 'AND',
      points: 25,
    },
    {
      id: 'pull-the-imagery',
      nice: ['T0153', 'K0740', 'T0080'],
      title: 'Pull the Imagery With the Margin You Have',
      description:
        'Lock the 1414 MHz imagery downlink and hold C/N above the 6 dB threshold for 30 seconds, then commit the link in Link Analysis at max elevation (T+9.5) with at least 1 dB over threshold. Commit early and the margin is not there.',
      groundStation: 'GW-01',
      prerequisiteObjectiveIds: ['task-the-collect'],
      conditions: [
        {
          type: 'receiver-signal-locked',
          description: 'RX Modem Locked on Downlink',
          params: { modemNumber: 1, requiresObservation: true, observationTab: 'rx-analysis' },
          mustMaintain: false,
        },
        {
          type: 'receiver-snr-threshold',
          description: 'C/N Held Above 6 dB for 30 s',
          params: { modemNumber: 1, minCNRatio: 6, requiresObservation: true, observationTab: 'rx-analysis' },
          mustMaintain: true,
          maintainDuration: 30,
        },
        {
          type: 'link-margin-met',
          description: 'Measured Margin >= 1 dB',
          params: { minMarginDb: 1 },
          mustMaintain: false,
        },
      ],
      conditionLogic: 'AND',
      points: 25,
    },
    {
      id: 'report-to-customer',
      nice: ['S0478', 'T1580'],
      title: 'Report to Erik',
      description: 'The frames are in. Tell the customer what he got and what this geometry means for the next request.',
      groundStation: 'GW-01',
      prerequisiteObjectiveIds: ['pull-the-imagery'],
      conditions: [
        {
          type: 'status-check',
          description: 'Customer Report Sent',
          params: {
            character: Character.SYSTEM,
            question: 'The collect decoded at about 8 dB C/N, two decibels over threshold. What do you tell the customer?',
            options: [
              'Captured and usable, and that this geometry is the floor: anything lower needs the Shetland site or the next orbit.',
              'Captured, and GW-01 can repeat it on any pass he likes.',
              'Captured, but the imagery is degraded because the link was marginal.',
            ],
            correctIndex: 0,
            explanation:
              'Correct. Two decibels over threshold is a clean decode, not a degraded one; the frames are as good as any. What the customer needs to know is that 18 degrees is about the lowest pass this station will close, so the next box further north is a Shetland job or a wait for a better orbit.',
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
        <em>[Text message from Erik Halvorsen, Nordic Maritime Watch, 15:29]</em>
      </p>
      <p>
        "Vessel of interest went dark off the Faroes overnight. I have a box, 62.5 N 7.5 W, forty kilometres square. Your SAR-1 pass in five minutes is the only one that covers it before it moves. One pass, tasking and download. Can you do it?"
      </p>
      `,
      character: Character.ERIK_HALVORSEN,
      emotion: Emotion.CONCERNED,
      audioUrl: '',
    },
    objectives: {
      'budget-the-low-pass': {
        text: `
        <p>
          Anneke here. SAR-1 is yours for the pass, imaging block is free and the command link is keyed. It is a low one though, you will need more uplink power than usual to reach her at that range. Your EIRP, your call. Just keep the HPA linear; I would rather lose the collect than have you splatter the band.
        </p>
        `,
        character: Character.ANNEKE_VISSER,
        emotion: Emotion.NEUTRAL,
        audioUrl: '',
      },
      'task-the-collect': {
        text: `
        <p>
          Task received on board, imaging block armed. She will shoot the box at closest approach and start the dump straight after. The downlink is all yours now, hold it through max elevation.
        </p>
        `,
        character: Character.ANNEKE_VISSER,
        emotion: Emotion.CONFIDENT,
        audioUrl: '',
      },
      'pull-the-imagery': {
        text: `
        <p>
          Frames in. The box is covered and the target is in it. Thank you.
        </p>
        `,
        character: Character.ERIK_HALVORSEN,
        emotion: Emotion.HAPPY,
        audioUrl: '',
      },
      'report-to-customer': {
        text: `
        <p>
          Understood on the geometry. If the next box is further north I will ask for Shetland or wait for the better orbit. Good work today, Galway.
        </p>
        `,
        character: Character.ERIK_HALVORSEN,
        emotion: Emotion.NEUTRAL,
        audioUrl: '',
      },
    },
  },
};
