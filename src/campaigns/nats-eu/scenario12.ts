import type { GroundStationConfig } from '@app/assets/ground-station/ground-station-state';
import { Character, Emotion } from '@app/modal/character-enum';
import type { ScenarioData } from '@app/ScenarioData';
import type { dBm, Hertz, IfFrequency } from '@app/types';
import type { Degrees, TleLine1, TleLine2 } from 'ootk';
import { galwayGroundStation } from './ground-stations';
import {
  MERIDIAN_SAR3_BEACON_RF_HZ,
  createMeridianSar1,
  createMeridianSar2,
  createMeridianSar3,
  type MeridianTle,
} from './satellites';

/**
 * nats-eu Scenario 12 - "LEOP: Commissioning" / SAR-3 Acceptance Tests (arc 2/2)
 *
 * Second half of the SAR-3 LEOP arc. Two days after first acquisition (S11)
 * the bus is healthy and Rotterdam has released the payload acceptance test
 * plan: power the payload, command a test pattern, decode the first imagery,
 * record the results on a test card. No new mechanics; M1 (link budget), M2/M5
 * (commanding with Doppler comp and a valid key) and the Working Document
 * (three status-check lines) all in one pass, in the order the card says.
 *
 * Scenario clock starts 2027-03-24 10:00:00 UTC; the birds are built here with
 * the satellites.ts factories on element sets authored for this epoch.
 *
 * Pass timeline (author-passes, station galway, epoch 2027-03-24T10:00:00Z):
 *
 *   MERIDIAN-SAR-3 #1: AOS T+6.02 (10:06:00Z, az 140), max el 27.9 deg at T+10.75
 *                      (764 km slant range), LOS T+15.48 (az 355), 9.5 min, northbound.
 *                      The worked pass; commanding window T+6:22 .. T+15:08.
 *   MERIDIAN-SAR-1 #1: AOS T+50.02, max el 25.2 deg, LOS T+59.50 (present, not worked)
 *   MERIDIAN-SAR-2 #1: AOS T+70.02, max el 24.7 deg, LOS T+79.46 (present, not worked)
 *
 * SAR-3 frequency plan (satellites.ts): beacon 11785 MHz -> IF 1315, video
 * 11760 MHz -> IF 1340 (LNB LO 13100 high-side), TT&C uplink 14065 MHz -> IF
 * 1465 (BUC LO 12600 low-side). GW-01 starts this shift with the beacon
 * receiver and the TT&C modem already on SAR-3 (set during S11 and left there)
 * but the RX modem still on SAR-1's 1414 MHz video IF from the morning's
 * tasking, so the first imagery decode is a deliberate retune.
 *
 * Link-budget numbers (worksheet per S2, at SAR-3's frequency and this pass's
 * geometry):
 * - slant range at max elevation 764 km -> FSPL 171.5 dB at 11760 MHz
 * - EIRP 28 dBm, GW-01 4m Ku gain 51.8 dBi, Tsys 88 K, BW 36 MHz, misc 1 dB
 * - correct worksheet -> C/N 10.89 dB (expectedCNRDb 10.9, tolerance 1.0)
 * - threshold 6 dB (QPSK 3/4 demod) + 2 dB required margin -> commit near
 *   max elevation, roughly T+9 .. T+12.5
 * The live peak under program-track is to be confirmed by the Phase B harness
 * (test/campaigns/nats-eu-phase-b-validation.test.ts); see the MEASURE note
 * on the linkBudget block.
 *
 * NICE Framework Alignment:
 * Primary Codes:
 *   - T1092: Execute test and evaluation events against an approved test plan
 *   - T1611: Record and document test results
 *   - S0842: Skill in conducting system acceptance testing
 *
 * Supporting Codes:
 *   - T0080: Test and evaluate system performance against requirements
 *   - S0015: Skill in conducting test events
 *   - T1567: Configure system hardware, software, peripheral equipment
 *   - K0773: Knowledge of telecommunications principles and practices
 *   - T0153: Monitor system performance
 *   - T1506: Prepare and deliver technical reports to stakeholders
 *   - S0478: Skill in providing customer support
 *   - S0421: Skill in operating communications equipment
 *   - K1032: Knowledge of satellite-based communication systems
 *   - K0645: Knowledge of standard operating procedures
 */

/** MERIDIAN-SAR-3 (61703) element set at the S12 epoch: the worked pass. */
const SAR3_S12_TLE: MeridianTle = {
  tle1: '1 61703U 27031A   27083.41666667  .00001000  00000-0  10000-3 0  9997' as TleLine1,
  tle2: '2 61703  97.6000 345.5000 0010000  90.0000 284.0000 15.60000000123459' as TleLine2,
};

/** MERIDIAN-SAR-1 (61701) element set at the S12 epoch. Present, not worked. */
const SAR1_S12_TLE: MeridianTle = {
  tle1: '1 61701U 27015A   27083.41666667  .00001000  00000-0  10000-3 0  9997' as TleLine1,
  tle2: '2 61701  97.2000 157.2500 0010000  90.0000 183.7500 15.60000000123456' as TleLine2,
};

/** MERIDIAN-SAR-2 (61702) element set at the S12 epoch. Present, not worked. */
const SAR2_S12_TLE: MeridianTle = {
  tle1: '1 61702U 27015A   27083.41666667  .00001000  00000-0  10000-3 0  9998' as TleLine1,
  tle2: '2 61702  98.4000 341.7500 0010000  90.0000  31.5000 15.60000000123455' as TleLine2,
};

const meridianSar1S12 = createMeridianSar1(SAR1_S12_TLE);
const meridianSar2S12 = createMeridianSar2(SAR2_S12_TLE);
const meridianSar3S12 = createMeridianSar3(SAR3_S12_TLE);

/**
 * GW-01 as the commissioning shift finds it. Deep clone, never a spread: the
 * nested antennasState / rfFrontEnds / transmitters / receivers objects are
 * handed to the equipment constructors and mutated at runtime.
 *
 * Carried over from S11 (already on SAR-3): beacon receiver on 11785 MHz,
 * antenna parked at the SAR-3 AOS azimuth, spectrum analyzer framing the SAR-3
 * IF plan, TT&C modem on the 1465 MHz uplink IF. Deliberately NOT carried over:
 * the RX modem, which is still on SAR-1's 1414 MHz video IF from the morning
 * tasking passes. Retuning it to 1340 MHz is the first step of the decode.
 */
function createGalwayS12(): GroundStationConfig {
  const station = structuredClone(galwayGroundStation);

  const antenna = station.antennasState?.[0];
  if (antenna) {
    antenna.azimuth = 140 as Degrees;
    antenna.targetAzimuth = 140 as Degrees;
    antenna.beaconFrequencyHz = MERIDIAN_SAR3_BEACON_RF_HZ as number as Hertz; // SAR-3 telemetry beacon
  }

  const specA = station.spectrumAnalyzers?.[0];
  if (specA) {
    // 1300-1360 MHz: the 1315 MHz beacon and the full 1322-1358 MHz video band
    specA.centerFrequency = 1330e6 as Hertz;
  }

  const txModem = station.transmitters?.[0]?.modems?.[0];
  if (txModem?.ifSignal) {
    txModem.ifSignal.frequency = 1465e6 as IfFrequency; // -> 14065 MHz SAR-3 TT&C uplink
    txModem.ifSignal.noradId = 61703;
  }

  return station;
}

const galwayS12 = createGalwayS12();

export const natsEuScenario12Data: ScenarioData = {
  id: 'nats-eu-scenario12',
  url: 'nats-eu/scenarios/nats-eu-scenario12',
  imageUrl: 'nats/12/card.png',
  number: 12,
  isDisabled: false,
  difficulty: 'intermediate',
  prerequisiteScenarioIds: ['nats-eu-scenario11'],
  title: 'LEOP: Commissioning',
  subtitle: 'SAR-3 Acceptance Tests (arc 2/2)',
  duration: '30 min',
  missionType: 'Commissioning',
  description: `10:00 local. Two days after first acquisition, MERIDIAN-SAR-3's bus is healthy and Anneke Visser has released the payload acceptance test plan: power the payload, command a test pattern, decode the first imagery, record the results on the card.<br><br>Erik Halvorsen at Nordic Maritime Watch is copied on the card, because Nordic Maritime Watch takes delivery of SAR-3 capacity the moment it is signed.<br><br>One pass, AOS T+6, nine and a half minutes. Predict the number before the bird rises, then do the card in order: power, pattern, decode, record.`,
  equipment: [
    'GW-01 Galway: 4m Ku-Band LEO Tracker',
    'Ku-Band RF Front End (13100 MHz LNB LO, 12600 MHz BUC LO) + HPA',
    'TT&C Commanding Console / Link Analysis Console',
    'QPSK 3/4 RX Modem with Video Decoder',
    'SAR-3 Payload Acceptance Test Card (Working Document)',
  ],
  settings: {
    isSync: true,
    groundStations: [galwayS12],
    satellites: [meridianSar1S12, meridianSar2S12, meridianSar3S12],
    isExtraSatellitesVisible: true,
    scenarioStartDate: '2027-03-24',
    scenarioStartWallTime: '10:00:00',

    missionBriefUrl: 'https://docs.signalrange.space/campaign-2/scenario-12?content-only=true&dark=true',

    contactTimeline: {
      horizonHours: 2,
      minElevation: 5 as Degrees,
      showLighting: true,
    },

    // The SAR-3 pass is T+6, under the 300 s floor, so the skip is not offered
    // before it: the worksheet is done in real time. It is offered afterwards
    // (SAR-1 at T+50, SAR-2 at T+70), though neither pass is part of the card.
    timeSkip: {
      leadTimeS: 120,
      minSkipS: 300,
      horizonHours: 4,
    },

    // M1 - the acceptance prediction. expectedCNRDb is what a CORRECT worksheet
    // yields from the numbers published in objective 2; requiredMarginDb is
    // measured against the live receiver at Commit Link.
    // MEASURE: harness must confirm the live peak under program-track (plan S12 RF note)
    linkBudget: {
      label: 'SAR-3 acceptance: video downlink at max elevation',
      expectedCNRDb: 10.9,
      toleranceDb: 1.0,
      thresholdCNRDb: 6,
      requiredMarginDb: 2,
    },

    // M2/M5 - payload command checkout. Window is the SAR-3 pass, AOS T+6.02
    // (361 s) + 20 s .. LOS T+15.48 (929 s) - 20 s. Doppler comp and a valid
    // key are both required for an ACK. PLD-ON and PLD-TEST-PATTERN are the
    // card; REC-PLAYBACK and PLD-SAFE are on the console because a real TT&C
    // console does not hide the commands the card does not call for.
    commanding: {
      groundStationId: 'GW-01',
      targetNoradId: 61703,
      windowStartS: 382,
      windowEndS: 908,
      requireDopplerComp: true,
      requireValidKey: true,
      commands: [
        { id: 'PLD-ON', label: 'Payload power on' },
        { id: 'PLD-TEST-PATTERN', label: 'Transmit payload test pattern' },
        { id: 'REC-PLAYBACK', label: 'Start recorder playback' },
        { id: 'PLD-SAFE', label: 'Payload to safe mode' },
      ],
    },

    // The test card. Each status-check in objective 6 appends one line.
    workingDocument: {
      title: 'SAR-3 Payload Acceptance Test Card',
      description: 'MERIDIAN-SAR-3 (61703) payload acceptance, GW-01, 2027-03-24. Sections: Command, Payload, Verdict.',
    },
  },
  objectives: [
    {
      id: 'review-mission-brief',
      nice: ['K0645', 'T0080'],
      title: 'Read the Test Plan',
      description: 'Open the shift brief and read the acceptance test plan: power, pattern, decode, record. The order is the test.',
      groundStation: 'GW-01',
      freezesScenarioTimer: true,
      prerequisiteObjectiveIds: [],
      conditions: [
        {
          type: 'mission-brief-opened',
          description: 'Test Plan Reviewed',
          params: { boxId: 'mission-brief' },
          mustMaintain: false,
        },
        {
          type: 'status-check',
          description: 'Test Order Understood',
          params: {
            character: Character.SYSTEM,
            question: 'The test plan runs power, pattern, decode, record, in that order. Why does the order matter when the console will accept the commands in any order?',
            options: [
              'Each step is the evidence for the next: the pattern proves the payload took power, the decode proves the pattern is on the air, the record captures what was measured. Out of order, an ACK or a line on the card proves nothing.',
              'It is the order the commands are listed on the TT&C console.',
              'It does not matter, as long as every step is finished before LOS.',
            ],
            correctIndex: 0,
            explanation: 'Right. A command ACK proves the spacecraft received the command, not that the command did anything. The decode is what proves PLD-ON worked, and the card is only as good as the order it was filled in.',
            pointPenalty: 5,
          },
          mustMaintain: false,
        },
      ],
      conditionLogic: 'AND',
      points: 5,
    },
    {
      id: 'predict-acceptance',
      nice: ['T0080', 'S0015'],
      title: 'Predict the Acceptance C/N',
      description: 'Fill the Link Analysis worksheet for MERIDIAN-SAR-3 at maximum elevation and press Compute. Survey numbers: satellite EIRP 28 dBm; slant range at max elevation 764 km (free-space path loss 171.5 dB at 11760 MHz); GW-01 receive gain 51.8 dBi; system noise temperature 88 K; occupied bandwidth 36 MHz; miscellaneous losses 1 dB. The card will quote this number back at you.',
      groundStation: 'GW-01',
      prerequisiteObjectiveIds: ['review-mission-brief'],
      conditions: [
        {
          type: 'link-budget-computed',
          description: 'Predicted C/N Matches Acceptance Truth',
          params: {},
          mustMaintain: false,
        },
      ],
      conditionLogic: 'AND',
      points: 15,
    },
    {
      id: 'acquire-sar3',
      nice: ['S0421', 'K1032'],
      title: 'Acquire SAR-3',
      description: 'AOS T+6 min at azimuth 140. Program-track MERIDIAN-SAR-3, confirm the 11785 MHz beacon (IF 1315 MHz) on the analyzer, and engage uplink Doppler compensation before the command window opens at T+6:22.',
      groundStation: 'GW-01',
      prerequisiteObjectiveIds: ['predict-acceptance'],
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
      id: 'payload-checkout',
      nice: ['T1092', 'T1567', 'K0773'],
      title: 'Payload Command Checkout',
      description: 'Bring the uplink up in order: modem on air FIRST, then the HPA. Then send PLD-ON and, once it is acknowledged, PLD-TEST-PATTERN. Both must ACK inside the window (T+6:22 to T+15:08). The console does not enforce the command order; the card does.',
      groundStation: 'GW-01',
      prerequisiteObjectiveIds: ['acquire-sar3'],
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
          description: 'PLD-ON Acknowledged',
          params: { commandId: 'PLD-ON' },
          mustMaintain: false,
        },
        {
          type: 'command-acknowledged',
          description: 'PLD-TEST-PATTERN Acknowledged',
          params: { commandId: 'PLD-TEST-PATTERN' },
          mustMaintain: false,
        },
      ],
      conditionLogic: 'AND',
      points: 25,
    },
    {
      id: 'first-video',
      nice: ['T1092', 'T0153', 'S0842'],
      title: 'First Imagery Decode',
      description: 'The RX modem is still on 1414 MHz from the morning SAR-1 passes. Retune modem 1 to 1340 MHz (11760 MHz RF), lock the test pattern, and hold C/N above 8 dB. Then return to Link Analysis and press Commit Link near maximum elevation (T+10.8) with at least 2 dB of margin over the 6 dB threshold.',
      groundStation: 'GW-01',
      prerequisiteObjectiveIds: ['payload-checkout'],
      conditions: [
        {
          type: 'receiver-signal-locked',
          description: 'RX Modem Locked on 1340 MHz Test Pattern',
          params: { modemNumber: 1, requiresObservation: true, observationTab: 'rx-analysis' },
          mustMaintain: true,
        },
        {
          type: 'receiver-snr-threshold',
          description: 'C/N >= 8 dB',
          params: { modemNumber: 1, minCNRatio: 8, requiresObservation: true, observationTab: 'rx-analysis' },
          mustMaintain: true,
        },
        {
          type: 'link-margin-met',
          description: 'Measured Margin >= 2 dB Over Threshold',
          params: { minMarginDb: 2 },
          mustMaintain: false,
        },
      ],
      conditionLogic: 'AND',
      points: 25,
    },
    {
      id: 'record-results',
      nice: ['T1611', 'T1506', 'S0842'],
      title: 'Record the Test Results',
      description: 'Three entries on the card: the command checkout result, the measured C/N against the prediction, and the acceptance verdict with its residual risk. Each answer is written to the test card.',
      groundStation: 'GW-01',
      prerequisiteObjectiveIds: ['first-video'],
      conditions: [
        {
          type: 'status-check',
          description: 'Command Checkout Recorded',
          params: {
            character: Character.SYSTEM,
            question: 'Command checkout entry. PLD-ON and PLD-TEST-PATTERN were both acknowledged inside the window. What does the card record as the checkout result, and what does the ACK pair actually prove?',
            options: [
              'PLD-ON then PLD-TEST-PATTERN, both ACKed with Doppler comp and a valid key. The ACKs prove the spacecraft received both commands in order; the decode that follows is what proves they worked.',
              'Two ACKs, so the payload is verified. The decode is a customer courtesy, not part of the checkout.',
              'Command checkout passed on the pattern ACK alone; PLD-ON is implied by the pattern.',
            ],
            correctIndex: 0,
            explanation: 'Correct. An acknowledgement is receipt, not effect. A pattern commanded to an unpowered payload ACKs just the same, which is why the checkout result is only complete once the decode is on the card.',
            pointPenalty: 5,
            documentLine: 'Command checkout: PLD-ON then PLD-TEST-PATTERN, both ACKed inside the T+6:22 .. T+15:08 window with uplink Doppler comp and a valid key. ACK = receipt, not effect; effect proven by the decode.',
            documentSection: 'Command',
          },
          mustMaintain: false,
        },
        {
          type: 'status-check',
          description: 'Measured C/N Recorded',
          params: {
            character: Character.SYSTEM,
            question: 'Payload entry. You predicted 10.9 dB at maximum elevation, the modem locked the pattern on 1340 MHz, and the link committed with at least 2 dB of margin. What goes on the card?',
            options: [
              'The measured C/N alongside the 10.9 dB prediction and the difference. Agreement within a decibel is the acceptance evidence; the margin alone says the link worked today, not that the payload performs as designed.',
              'PASS. The margin cleared the threshold, so the number itself does not matter.',
              'The peak C/N only. The prediction was a planning aid and has no place on a test record.',
            ],
            correctIndex: 0,
            explanation: 'Right. A measurement that matches the model is what lets Rotterdam and the customer predict every pass after this one. A measurement with no prediction beside it is a good day, not an acceptance.',
            pointPenalty: 5,
            documentLine: 'Payload: test pattern locked on IF 1340 MHz (11760 MHz RF). Predicted C/N 10.9 dB at max el (764 km, FSPL 171.5 dB at 11760 MHz); measured within 1 dB of prediction; committed with >= 2 dB margin over the 6 dB QPSK 3/4 threshold.',
            documentSection: 'Payload',
          },
          mustMaintain: false,
        },
        {
          type: 'status-check',
          description: 'Verdict Recorded',
          params: {
            character: Character.SYSTEM,
            question: 'Verdict entry. Command checkout complete, first imagery decoded at the predicted performance. What is the verdict, and what residual risk does the card carry?',
            options: [
              'ACCEPTED at the tested performance. Residual risk stated: one pass, 28 deg maximum elevation, one site. Low-elevation passes and Shetland are unproven, and PLD-SAFE has not been exercised.',
              'ACCEPTED with no residual risk. The payload works; the rest is routine operations.',
              'PROVISIONAL until Shetland repeats the same test on its own pass.',
            ],
            correctIndex: 0,
            explanation: 'Correct. Acceptance is a statement about what was tested, no more. Writing down what was not tested is what makes the card usable when the first low pass comes in under budget.',
            pointPenalty: 5,
            documentLine: 'Verdict: SAR-3 payload ACCEPTED at tested performance (one pass, 27.9 deg max el, GW-01 only). Residual risk: low-elevation and SH-02 performance not measured; PLD-SAFE not exercised.',
            documentSection: 'Verdict',
          },
          mustMaintain: false,
        },
      ],
      conditionLogic: 'AND',
      points: 30,
    },
    {
      id: 'deliver-to-customer',
      nice: ['S0478', 'T1506'],
      title: 'Deliver to the Customer',
      description: 'Erik is copied on the signed card and wants to task the bird. Confirm what acceptance transfers to Nordic Maritime Watch.',
      groundStation: 'GW-01',
      prerequisiteObjectiveIds: ['record-results'],
      conditions: [
        {
          type: 'status-check',
          description: 'Delivery Confirmed',
          params: {
            character: Character.SYSTEM,
            question: 'The card is signed and Erik is asking when he can task SAR-3. What does acceptance transfer to the customer?',
            options: [
              'SAR-3 enters the tasking pool at the tested performance. From now on, anything below that number is a service ticket, not an opinion.',
              'Nothing yet. Acceptance is an internal record; the customer gets the bird after a further shakedown period.',
              'Unlimited tasking. Acceptance means the payload is proven under every condition.',
            ],
            correctIndex: 0,
            explanation: 'Exactly. The tested performance is now the contract number. Erik can task from the next pass, and the first time a pass comes in under it, the card is what turns a complaint into a ticket with a number on it.',
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
        <em>[Text message from Anneke Visser at 09:52]</em>
      </p>
      <p>
        "Test plan attached. Bus has been clean for two days, so today is the payload: power it, command the test pattern, decode it, record it. One pass, AOS 10:06, do it in the order on the card. Erik is copied and he will ask the moment it is signed."
      </p>
      `,
      character: Character.ANNEKE_VISSER,
      emotion: Emotion.NEUTRAL,
      audioUrl: '',
    },
    objectives: {
      'payload-checkout': {
        text: `
        <p>
          Both acknowledgements on my screen. Payload on, pattern transmitting. Over to you for the decode.
        </p>
        `,
        character: Character.ANNEKE_VISSER,
        emotion: Emotion.CONFIDENT,
        audioUrl: '',
      },
      'first-video': {
        text: `
        <p>
          First frames from SAR-3. Log it - every number on that card is the one the customer contract quotes back at us.
        </p>
        `,
        character: Character.ANNEKE_VISSER,
        emotion: Emotion.HAPPY,
        audioUrl: '',
      },
      'record-results': {
        text: `
        <p>
          Copied on the card. Three lines and one of them says accepted. When can I task it?
        </p>
        `,
        character: Character.ERIK_HALVORSEN,
        emotion: Emotion.NEUTRAL,
        audioUrl: '',
      },
      'deliver-to-customer': {
        text: `
        <p>
          Card signed, Erik has his answer, SAR-3 is in the pool. LEOP closed after two passes from Galway. Thank you - Rotterdam out.
        </p>
        `,
        character: Character.ANNEKE_VISSER,
        emotion: Emotion.CONFIDENT,
        audioUrl: '',
      },
    },
  },
};
