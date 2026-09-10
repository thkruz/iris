import { expect, Page, test } from '@playwright/test';
import { MissionControlPage } from '../pages/mission-control.page';
import { advanceMissionClockToUtc, waitForObjectiveComplete } from '../utils/ham-sdr-helpers';
import {
  answerPendingQuizFrom,
  answerSystemQuiz,
  closeWorkingDocumentIfOpen,
  commitLinkWithMargin,
  computeLinkBudget,
  disableHpa,
  enableDopplerComp,
  enableHpa,
  programTrack,
  sendCommandAndExpectAck,
  setRxModemFrequency,
  setTxModemOnAir,
} from '../utils/nats-eu-helpers';
import { dismissDialogIfPresent, waitForSimulationReady } from '../utils/simulation-helpers';

/**
 * nats-eu Scenario 12 "LEOP: Commissioning" - full completion.
 *
 * SAR-3 payload acceptance on one pass, in the order the test card says:
 * predict the C/N, acquire with Doppler comp, modem then HPA, PLD-ON then
 * PLD-TEST-PATTERN, retune the RX modem from SAR-1's 1414 MHz to SAR-3's
 * 1340 MHz, lock and commit with 2 dB of margin, then three document lines
 * on the test card and the delivery call. Clock starts 2027-03-24 10:00:00Z:
 *   MERIDIAN-SAR-3  AOS 10:06:00Z  max el 27.9 deg at T+10.75 (10:10:45Z)  LOS 10:15:29Z
 *   command window  mission T+382 s .. T+908 s
 *   worksheet truth 10.9 dB; threshold 6 dB + 2 dB required margin
 *
 * Objective flow:
 * 1. review-mission-brief  - test plan + test-order quiz
 * 2. predict-acceptance    - worksheet from the survey numbers, IN FAMILY
 * 3. acquire-sar3          - program-track + Doppler comp, beacon on RX Analysis
 * 4. payload-checkout      - modem on air, HPA, PLD-ON then PLD-TEST-PATTERN ACKed
 * 5. first-video           - RX modem 1340 MHz, lock, C/N >= 8 dB, commit >= 2 dB
 * 6. record-results        - three document-line quizzes on the test card
 * 7. deliver-to-customer   - delivery quiz; asserted via the Mission Complete modal
 */
test.describe('nats-eu Scenario 12 Full Completion', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: import('@playwright/test').BrowserContext;
  let missionControl: MissionControlPage;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();

    await page.addInitScript(() => {
      (window as unknown as { AUTO_CLOSE_DIALOGS: boolean }).AUTO_CLOSE_DIALOGS = true;
      localStorage.clear();
      sessionStorage.clear();
    });

    missionControl = new MissionControlPage(page);

    // Direct navigation bypasses the nats-eu-scenario11 prerequisite card lock
    await missionControl.gotoScenario('nats-eu', 'nats-eu-scenario12');
    await waitForSimulationReady(page);
    await missionControl.dismissDialogIfPresent();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.beforeEach(async () => {
    test.setTimeout(120000);
  });

  test('[review-mission-brief] reads the test plan and why the order matters', async () => {
    await missionControl.openMissionBrief();
    await missionControl.closeMissionBrief();

    await answerSystemQuiz(page, 'Each step is the evidence for the next');
    await dismissDialogIfPresent(page);
    await waitForObjectiveComplete(missionControl, 'Read the Test Plan');
  });

  test('[predict-acceptance] computes the acceptance C/N from the survey numbers', async () => {
    await missionControl.selectGroundStation('GW-01');

    await computeLinkBudget(page, missionControl, {
      eirpDbm: 28,
      fsplDb: 171.5,
      rxGainDbi: 51.8,
      noiseTempK: 88,
      bandwidthMHz: 36,
      miscLossDb: 1,
    });

    await dismissDialogIfPresent(page);
    await waitForObjectiveComplete(missionControl, 'Predict the Acceptance C/N');
  });

  test('[acquire-sar3] program-tracks SAR-3 with Doppler comp and sees the 1315 MHz beacon', async () => {
    // Just before the 10:06:00Z AOS
    await advanceMissionClockToUtc(page, '2027-03-24T10:05:30Z');
    await programTrack(page, missionControl, '61703');
    await enableDopplerComp(page, missionControl);
    await page.waitForTimeout(2000);

    // Early in the pass, with the command window already open
    await advanceMissionClockToUtc(page, '2027-03-24T10:07:30Z');
    await missionControl.selectTab('rx-analysis');
    await dismissDialogIfPresent(page);

    await waitForObjectiveComplete(missionControl, 'Acquire SAR-3', 60000);
  });

  test('[payload-checkout] brings the uplink up in order and ACKs PLD-ON then PLD-TEST-PATTERN', async () => {
    // Modem FIRST, then the HPA (no-drive HPA trips the noise invariant)
    await setTxModemOnAir(page, missionControl);
    await enableHpa(page, missionControl);

    await sendCommandAndExpectAck(page, missionControl, 'PLD-ON');
    await sendCommandAndExpectAck(page, missionControl, 'PLD-TEST-PATTERN');

    await dismissDialogIfPresent(page);
    await waitForObjectiveComplete(missionControl, 'Payload Command Checkout');
  });

  test('[first-video] retunes to 1340 MHz, locks the pattern and commits with 2 dB margin', async () => {
    // Secure the uplink first (objective condition hpa-disabled, observed on
    // TX Chain). With the HPA up, SAR-3's TT&C transponder returns the
    // station's own 14065 MHz carrier at 11810 MHz (IF 1290) at about -38 dBm,
    // 57 dB above the 28 dBm video: the RX AGC drops to -56 dB, total RX gain
    // falls to 6.7 dB, the receiver's internal noise floor (-97.9 dBm in
    // 36 MHz) takes over, and the 1340 MHz pattern reads about 3 dB C/N
    // instead of the 10.9 dB the worksheet predicts. The HPA stays off
    // through the commit.
    await disableHpa(page, missionControl);
    await expect(page.locator('#hpa-enable')).not.toBeChecked();
    await page.waitForTimeout(3000); // TX Chain stays on screen so the condition latches

    // The RX modem is still on SAR-1's 1414 MHz from the morning
    await setRxModemFrequency(page, missionControl, 1340);

    // Observe on RX Analysis BEFORE the jump so lock and C/N >= 8 dB latch as
    // soon as the bird is near max elevation (10:10:45Z)
    await missionControl.selectTab('rx-analysis');
    await advanceMissionClockToUtc(page, '2027-03-24T10:10:15Z');
    await dismissDialogIfPresent(page);
    await page.waitForTimeout(4000);

    // Commit with the live C/N at least 8 dB (6 dB threshold + 2 dB margin)
    await commitLinkWithMargin(page, missionControl, 8);

    await dismissDialogIfPresent(page);
    await waitForObjectiveComplete(missionControl, 'First Imagery Decode', 60000);
  });

  test('[record-results] fills the three entries on the test card', async () => {
    // The quiz manager presents the three entries in its own order (Verdict
    // first in practice), so answer whichever is pending, three times over
    const entries = [
      { questionHint: 'Command checkout entry', answerText: 'PLD-ON then PLD-TEST-PATTERN, both ACKed' },
      { questionHint: 'Payload entry', answerText: 'The measured C/N alongside the 10.9 dB prediction' },
      { questionHint: 'Verdict entry', answerText: 'ACCEPTED at the tested performance' },
    ];
    const answered = new Set<string>();
    for (let i = 0; i < entries.length; i++) {
      const hint = await answerPendingQuizFrom(page, entries.filter((e) => !answered.has(e.questionHint)));
      answered.add(hint);
      await dismissDialogIfPresent(page);
      await closeWorkingDocumentIfOpen(page);
    }
    expect(answered.size).toBe(3);

    await waitForObjectiveComplete(missionControl, 'Record the Test Results');
  });

  test('[deliver-to-customer] confirms what acceptance transfers and completes', async () => {
    await answerSystemQuiz(page, 'SAR-3 enters the tasking pool');
    await dismissDialogIfPresent(page);

    // FINAL objective: assert through the Mission Complete modal, since the
    // checklist stops repainting once the completion flow takes over
    await expect(page.locator('#level-complete-modal')).toBeVisible({ timeout: 45000 });
  });

  test('verifies mission complete', async () => {
    const levelCompleteModal = page.locator('#level-complete-modal');
    await expect(levelCompleteModal).toBeVisible({ timeout: 30000 });

    const modalTitle = levelCompleteModal.locator('.complete-modal__title');
    await expect(modalTitle).toContainText('Mission Complete');

    const totalScore = levelCompleteModal.locator('.total-value');
    await expect(totalScore).toBeVisible();
    const score = parseInt((await totalScore.textContent()) || '0', 10);
    expect(score).toBeGreaterThan(0);
  });
});
