import { expect, Page, test } from '@playwright/test';
import { MissionControlPage } from '../pages/mission-control.page';
import { advanceMissionClockToUtc, waitForObjectiveComplete } from '../utils/ham-sdr-helpers';
import { answerSystemQuiz, closeWorkingDocumentIfOpen, loadEphemeris, programTrack } from '../utils/nats-eu-helpers';
import { dismissDialogIfPresent, waitForSimulationReady } from '../utils/simulation-helpers';

/**
 * nats-eu Scenario 11 "LEOP: Launch Day" - full completion.
 *
 * MERIDIAN-SAR-3's first pass over a commercial station. The bird boots on
 * the launch provider's injection estimate; the refined set from the first
 * ranging arc reaches the ephemeris panel 45 s (mission clock) after the
 * brief closes and must be loaded before AOS. Then program-track, beacon,
 * ACU beacon lock, state of health, handover. Clock starts 2027-03-22 09:00:00Z:
 *   MERIDIAN-SAR-3 (refined)  AOS 09:08:58Z  max el 31.6 deg at T+13.74 (09:13:44Z)  LOS 09:18:33Z
 *   SAR-3 beacon 11785 MHz -> IF 1315 MHz (LNB LO 13100)
 *
 * The TRR's beacon-frequency condition is met by selecting SAR-3 as the
 * program-track target, which copies the target's beacon frequency into the
 * ACU field (the ACU beacon input itself is hidden unless step-track is on).
 *
 * Objective flow:
 * 1. review-mission-brief    - LEOP card + acquisition-risk quiz
 * 2. test-readiness          - ACU beacon 11785 MHz + TRR quiz (document line)
 * 3. load-refined-elements   - STALE row on Pass Schedule, Load Updated Ephemeris
 * 4. first-acquisition       - program-track, beacon on RX Analysis, ACU beacon lock
 * 5. state-of-health         - SOH quiz (document line)
 * 6. leop-handover           - handover quiz; asserted via the Mission Complete modal
 */
test.describe('nats-eu Scenario 11 Full Completion', () => {
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

    // Direct navigation bypasses the nats-eu-scenario10 prerequisite card lock
    await missionControl.gotoScenario('nats-eu', 'nats-eu-scenario11');
    await waitForSimulationReady(page);
    await missionControl.dismissDialogIfPresent();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.beforeEach(async () => {
    test.setTimeout(120000);
  });

  test('[review-mission-brief] reads the LEOP card and the acquisition risk', async () => {
    await missionControl.openMissionBrief();
    await missionControl.closeMissionBrief();

    await answerSystemQuiz(page, 'At AOS the bird can be a few degrees from prediction');
    await dismissDialogIfPresent(page);
    await waitForObjectiveComplete(missionControl, 'Read the LEOP Card');
  });

  test('[test-readiness] configures the ACU for SAR-3 and closes the TRR', async () => {
    await missionControl.selectGroundStation('GW-01');

    // Picking SAR-3 as the program-track target copies its 11785 MHz beacon
    // into the ACU beacon field
    await programTrack(page, missionControl, '61703');
    await page.waitForTimeout(1000);

    await answerSystemQuiz(page, 'video IF 1340 MHz on the receiver');
    await dismissDialogIfPresent(page);
    await closeWorkingDocumentIfOpen(page);
    await waitForObjectiveComplete(missionControl, 'Test Readiness Review');
  });

  test('[load-refined-elements] loads the ranging solution once the panel flags SAR-3', async () => {
    // The refined set fires at mission T+45 s; the brief closed only a few
    // seconds ago, so move the clocks a minute forward to reach it
    await advanceMissionClockToUtc(page, '2027-03-22T09:01:00Z');

    await loadEphemeris(page, missionControl, 'SAR3-INJ');

    await dismissDialogIfPresent(page);
    await waitForObjectiveComplete(missionControl, 'Load the Refined Elements');
  });

  test('[first-acquisition] program-tracks SAR-3, finds the beacon and locks the ACU on it', async () => {
    // Just before the 09:08:58Z AOS: re-point on the refined set
    await advanceMissionClockToUtc(page, '2027-03-22T09:08:30Z');
    await programTrack(page, missionControl, '61703');
    await page.waitForTimeout(3000);

    // High-elevation segment (max el 31.6 deg at 09:13:44Z): the beacon
    // latches on RX Analysis, then the ACU shows beacon lock
    await advanceMissionClockToUtc(page, '2027-03-22T09:12:30Z');
    await missionControl.selectTab('rx-analysis');
    await page.waitForTimeout(3000);

    await missionControl.selectTab('acu-control');
    await expect(page.locator('[id$="beacon-lock-status"]')).toHaveText('LOCKED', { timeout: 30000 });

    await dismissDialogIfPresent(page);
    await waitForObjectiveComplete(missionControl, 'First Acquisition', 60000);
  });

  test('[state-of-health] records the SOH call for Rotterdam', async () => {
    await answerSystemQuiz(page, 'no anomaly; recommend proceeding to command checkout');
    await dismissDialogIfPresent(page);
    await closeWorkingDocumentIfOpen(page);
    await waitForObjectiveComplete(missionControl, 'Initial State of Health');
  });

  test('[leop-handover] explains why nothing goes up this pass and completes', async () => {
    await answerSystemQuiz(page, 'The flight rules sequence LEOP');
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
