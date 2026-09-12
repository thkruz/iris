import { expect, Page, test } from '@playwright/test';
import { MissionControlPage } from '../pages/mission-control.page';
import { advanceMissionClockToUtc, waitForObjectiveComplete } from '../utils/ham-sdr-helpers';
import { answerSystemQuiz, assignContact, programTrack, setRxModemFrequency } from '../utils/nats-eu-helpers';
import { dismissDialogIfPresent, waitForSimulationReady } from '../utils/simulation-helpers';

/**
 * nats-eu Scenario 9 "Morning Constellation" - full completion.
 *
 * Two health checks (GW-01, then SH-02 from the same console), a six-contact
 * day plan with two conflict pairs, then two receive-only passes worked back
 * to back. Clock starts 2027-03-17 06:10:00Z:
 *   MERIDIAN-SAR-1  AOS 06:18:00Z  max el 30.5 deg at T+12.8  LOS 06:27:36Z
 *   MERIDIAN-SAR-2  AOS 06:32:00Z  max el 25.2 deg at T+26.7  LOS 06:41:24Z
 *
 * The specs jump with advanceMissionClockToUtc (sim + mission clock together)
 * to just before each AOS, program-track the bird, then jump again to the
 * high-elevation segment and observe on RX Analysis, where the lock and C/N
 * conditions latch.
 *
 * Objective flow:
 * 1. review-mission-brief   - brief + plan-rule quiz
 * 2. galway-health          - GPSDO / LNB / HPA observed on three GW-01 tabs
 * 3. shetland-health        - same on SH-02 via the asset tree
 * 4. build-the-day-plan     - contact plan: overlaps split across the sites
 * 5. work-the-first-window  - SAR-1 at IF 1414, program-track, C/N > 8 dB
 * 6. second-window          - SAR-2 at IF 1370
 * 7. customer-status        - Erik quiz; asserted via the Mission Complete modal
 */
test.describe('nats-eu Scenario 9 Full Completion', () => {
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

    // Direct navigation bypasses the nats-eu-scenario8 prerequisite card lock
    await missionControl.gotoScenario('nats-eu', 'nats-eu-scenario9');
    await waitForSimulationReady(page);
    await missionControl.dismissDialogIfPresent();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.beforeEach(async () => {
    test.setTimeout(120000);
  });

  test('[review-mission-brief] takes the shift and confirms the plan rule', async () => {
    await missionControl.openMissionBrief();
    await missionControl.closeMissionBrief();

    await answerSystemQuiz(page, 'No site is double-booked');
    await dismissDialogIfPresent(page);
    await waitForObjectiveComplete(missionControl, 'Take the Shift');
  });

  test('[galway-health] observes the GW-01 reference and RF chain', async () => {
    await missionControl.selectGroundStation('GW-01');

    // Each condition latches only while its tab is on screen
    for (const tab of ['gps-timing', 'rx-analysis', 'tx-chain']) {
      await missionControl.selectTab(tab);
      await page.waitForTimeout(2500);
    }

    await dismissDialogIfPresent(page);
    await waitForObjectiveComplete(missionControl, 'Galway Health Check');
  });

  test('[shetland-health] runs the same checks on SH-02 from the Galway console', async () => {
    await missionControl.selectGroundStation('SH-02');

    for (const tab of ['gps-timing', 'tx-chain', 'rx-analysis']) {
      await missionControl.selectTab(tab);
      await page.waitForTimeout(2500);
    }

    await dismissDialogIfPresent(page);
    await waitForObjectiveComplete(missionControl, 'Shetland Health Check');
  });

  test('[build-the-day-plan] splits the conflict pairs across the two sites', async () => {
    await missionControl.selectGroundStation('GW-01');
    await missionControl.selectTab('contact-schedule');

    await expect(page.locator('#cs-plan-badge')).toHaveText('UNALLOCATED');

    // The two P1/P2 conflict pairs go one to each site; the P3 second-orbit
    // contacts stay unallocated (requiredPriorityAtOrAbove 2)
    await assignContact(page, 'M-SAR1-GW', 'GW-01');
    await assignContact(page, 'M-SAR1-SH', 'SH-02');
    await assignContact(page, 'M-SAR2-GW', 'GW-01');
    await assignContact(page, 'M-SAR2-SH', 'SH-02');

    await expect(page.locator('#cs-conflict-count')).toHaveText('0');
    await expect(page.locator('#cs-unassigned-count')).toHaveText('0');
    await expect(page.locator('#cs-plan-badge')).toHaveText('DECONFLICTED');

    await dismissDialogIfPresent(page);
    await waitForObjectiveComplete(missionControl, 'Build the Day Plan');
  });

  test('[work-the-first-window] program-tracks SAR-1 and decodes the 1414 MHz downlink', async () => {
    // Just before the 06:18:00Z AOS: target the bird so the pedestal is on it
    await advanceMissionClockToUtc(page, '2027-03-17T06:17:30Z');
    await programTrack(page, missionControl, '61701');
    await page.waitForTimeout(3000);

    // High-elevation segment (max el 30.5 deg at 06:22:48Z); modem 1 is
    // pre-tuned to 1414 MHz. Observe on RX Analysis so lock and C/N latch.
    await advanceMissionClockToUtc(page, '2027-03-17T06:21:45Z');
    await missionControl.selectTab('rx-analysis');
    await dismissDialogIfPresent(page);

    await waitForObjectiveComplete(missionControl, 'Work the SAR-1 Window', 60000);
  });

  test('[second-window] retunes to 1370 MHz and decodes SAR-2', async () => {
    await setRxModemFrequency(page, missionControl, 1370);

    // Just before the 06:32:00Z AOS: swap the program-track target to SAR-2
    await advanceMissionClockToUtc(page, '2027-03-17T06:31:30Z');
    await programTrack(page, missionControl, '61702');
    await page.waitForTimeout(3000);

    // High-elevation segment (max el 25.2 deg at 06:36:42Z)
    await advanceMissionClockToUtc(page, '2027-03-17T06:35:45Z');
    await missionControl.selectTab('rx-analysis');
    await dismissDialogIfPresent(page);

    await waitForObjectiveComplete(missionControl, 'Work the SAR-2 Window', 60000);
  });

  test('[customer-status] reports the morning to Erik and completes', async () => {
    await answerSystemQuiz(page, 'The collect decoded with margin');
    await dismissDialogIfPresent(page);

    // The FINAL objective is asserted through the Mission Complete modal, not
    // the checklist: the checklist stops repainting when the completion flow
    // takes over, so its last row never shows the completed class.
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
