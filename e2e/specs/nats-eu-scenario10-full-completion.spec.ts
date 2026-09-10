import { expect, Page, test } from '@playwright/test';
import { MissionControlPage } from '../pages/mission-control.page';
import { advanceMissionClockToUtc, waitForObjectiveComplete } from '../utils/ham-sdr-helpers';
import {
  answerSystemQuiz,
  commitLinkWithMargin,
  computeLinkBudget,
  enableDopplerComp,
  enableHpa,
  programTrack,
  sendCommandAndExpectAck,
  setHpaBackOff,
  setTxModemOnAir,
} from '../utils/nats-eu-helpers';
import { dismissDialogIfPresent, waitForSimulationReady } from '../utils/simulation-helpers';

/**
 * nats-eu Scenario 10 "Priority Tasking" - full completion.
 *
 * One 18 deg MERIDIAN-SAR-1 pass, worked end to end: the link-budget
 * worksheet, 6 dB more uplink EIRP from the HPA back-off, program-track with
 * Doppler comp at AOS, the tasking command inside the window, then the
 * imagery pulled down with about 2 dB of margin. Clock starts
 * 2027-03-18 15:30:00Z:
 *   MERIDIAN-SAR-1  AOS 15:34:59Z  max el 17.8 deg at T+9.52 (15:39:31Z)  LOS 15:44:03Z
 *   command window  mission T+319 s .. T+823 s
 *   measured (phase-c harness): peak C/N 8.11 dB at T+9.53, 151 s at or
 *   above 7 dB, 43 s at or above 8 dB
 *
 * The mission clock runs from page load while the scenario clock waits for
 * the brief, so mission elapsed leads scenario elapsed by the few seconds
 * the brief and quiz take. The window is 8.4 min wide and the command goes
 * up around scenario T+7, well inside it either way.
 *
 * Objective flow:
 * 1. review-mission-brief  - brief + low-pass geometry quiz
 * 2. budget-the-low-pass   - worksheet from the published numbers, IN FAMILY
 * 3. raise-the-eirp        - HPA back-off 10 -> 4 dB, still linear
 * 4. acquire-low           - program-track + Doppler comp, beacon on RX Analysis
 * 5. task-the-collect      - modem on air, HPA enabled, SAR-TASK-URGENT ACKed
 * 6. pull-the-imagery      - lock, C/N >= 6 dB held 30 s, commit with >= 1 dB
 * 7. report-to-customer    - Erik quiz; asserted via the Mission Complete modal
 */
test.describe('nats-eu Scenario 10 Full Completion', () => {
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

    // Direct navigation bypasses the nats-eu-scenario9 prerequisite card lock
    await missionControl.gotoScenario('nats-eu', 'nats-eu-scenario10');
    await waitForSimulationReady(page);
    await missionControl.dismissDialogIfPresent();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.beforeEach(async () => {
    test.setTimeout(120000);
  });

  test('[review-mission-brief] reads the tasking and the low-pass geometry', async () => {
    await missionControl.openMissionBrief();
    await missionControl.closeMissionBrief();

    await answerSystemQuiz(page, 'Slant range at max elevation is about 1040 km');
    await dismissDialogIfPresent(page);
    await waitForObjectiveComplete(missionControl, 'Read the Tasking');
  });

  test('[budget-the-low-pass] computes the worksheet from the published numbers', async () => {
    await missionControl.selectGroundStation('GW-01');

    await computeLinkBudget(page, missionControl, {
      eirpDbm: 28,
      fsplDb: 174.1,
      rxGainDbi: 51.8,
      noiseTempK: 88,
      bandwidthMHz: 36,
      miscLossDb: 1.2,
    });

    await dismissDialogIfPresent(page);
    await waitForObjectiveComplete(missionControl, 'Budget the Low Pass');
  });

  test('[raise-the-eirp] takes the HPA back-off to 4 dB and stays linear', async () => {
    await setHpaBackOff(page, missionControl, 4);
    await expect(page.locator('#hpa-overdrive-status')).toHaveText('Normal');

    await dismissDialogIfPresent(page);
    await waitForObjectiveComplete(missionControl, 'Raise Uplink EIRP Without Overdriving');
  });

  test('[acquire-low] program-tracks SAR-1 with Doppler comp and sees the beacon', async () => {
    // Just before the 15:34:59Z AOS: target the bird and arm the command link
    await advanceMissionClockToUtc(page, '2027-03-18T15:34:30Z');
    await programTrack(page, missionControl, '61701');
    await enableDopplerComp(page, missionControl);
    await page.waitForTimeout(2000);

    // Early in the pass the beacon clears -130 dBm at RX IF; observe it on
    // RX Analysis so signal-detected latches
    await advanceMissionClockToUtc(page, '2027-03-18T15:36:30Z');
    await missionControl.selectTab('rx-analysis');
    await dismissDialogIfPresent(page);

    await waitForObjectiveComplete(missionControl, 'Acquire at the Horizon', 60000);
  });

  test('[task-the-collect] keys the uplink in order and gets the tasking ACK', async () => {
    // Modem FIRST, then the HPA: enabling the HPA with no drive trips the
    // noise-amplification invariant and fails the mission
    await setTxModemOnAir(page, missionControl);
    await enableHpa(page, missionControl);

    await sendCommandAndExpectAck(page, missionControl, 'SAR-TASK-URGENT');

    await dismissDialogIfPresent(page);
    await waitForObjectiveComplete(missionControl, 'Task the Collect');
  });

  test('[pull-the-imagery] holds the downlink 30 s and commits with margin at max elevation', async () => {
    test.setTimeout(180000);

    // Observe on RX Analysis BEFORE the jump so lock and the 6 dB floor latch
    // on the first tick above threshold (C/N >= 7 dB from about T+8.3)
    await missionControl.selectTab('rx-analysis');
    await advanceMissionClockToUtc(page, '2027-03-18T15:38:45Z');
    await dismissDialogIfPresent(page);

    // The 30 s maintain window ticks on real time
    await page.waitForTimeout(32000);

    // Max elevation is 15:39:31Z; the clock is now about T+9.3. Commit with
    // the live C/N at least 7 dB (6 dB threshold + 1 dB required margin).
    await commitLinkWithMargin(page, missionControl, 7);

    await dismissDialogIfPresent(page);
    await waitForObjectiveComplete(missionControl, 'Pull the Imagery With the Margin You Have', 60000);
  });

  test('[report-to-customer] tells Erik what he got and completes', async () => {
    await answerSystemQuiz(page, 'Captured and usable');
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
