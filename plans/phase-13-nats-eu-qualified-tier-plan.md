# Phase 13 - nats-eu Qualified Tier (S9-S16) Plan

**Status: DESIGN COMPLETE, NOT STARTED** · Working tracker for Campaign 2 Phase 2,
"Qualified Operations: Running the Network". Update the checkboxes and the Status log
at the bottom as work proceeds. Sub-phases execute in order (A -> D); Phase B (S9-S12)
is the next sprint step.

## Goal

Author `nats-eu` scenarios 9-16 on top of the shipped Phase 1 mechanics (M1-M8, all
built and sandbox-verified; ephemeris panel; contact timeline; time skip; two stations;
Working Document panel). No new engine mechanics and **zero new condition types**:
every condition below is a type that exists in
[objective-types.ts](../src/objectives/objective-types.ts) today. Where the design plan's
§3 table names something the engine cannot stage from scenario data, this document says
so and substitutes the smallest alternative built from existing conditions (see
"Engine gaps").

Tier contract (from the design plan §3 Phase 2 and the NATS S9-S16 precedent):

1. **Solo shifts, no coaching.** Charlie hands off after S8. Erik Halvorsen (customer)
   and Anneke Visser (constellation ops) carry the pressure; Fiona MacLeod is the
   cross-station peer. Text-message intros are canonical from S9.
2. **Judgment, not procedure.** Objectives state the outcome; the brief carries the
   numbers; the operator picks the tab. Use `hidden: true` on tab-gating conditions so
   the checklist does not say where to look.
3. **3-7 dialog clips per scenario** (nats-campaign-builder cap), text clips with
   `audioUrl: ''` until the VO pipeline is decided (open question 1).
4. **Every threshold is measured** through the real chain before it is authored
   (Phase A/B rule), via a Phase 2 extension of
   [nats-eu-phase-b-validation.test.ts](../test/campaigns/nats-eu-phase-b-validation.test.ts).
5. **Data Analysis (IO-WRL-001) unlock.** S12/S13 carry the T&E/trending codes that
   are new to the product (T0349, S0646, S0892, T1506, T1611).

## Prior art this plan builds on

- [phase-1-nats-eu-campaign-design-plan.md](phase-1-nats-eu-campaign-design-plan.md) §2 (roster, sites, birds), §3 Phase 2 table (authoritative slot titles/mechanics), §6 conventions, §7 NICE strategy.
- Shipped S1-S8: [scenario1.ts](../src/campaigns/nats-eu/scenario1.ts) ... [scenario8.ts](../src/campaigns/nats-eu/scenario8.ts), [ground-stations.ts](../src/campaigns/nats-eu/ground-stations.ts), [satellites.ts](../src/campaigns/nats-eu/satellites.ts), [sandbox.ts](../src/campaigns/nats-eu/sandbox.ts) (every mechanic block's real shape).
- Retros: [phase-4 (Phase A)](../retrospectives/phase-4-nats-eu-foundation-retrofit-retro.md) (keyhole, RF gate), [phase-6 (Phase B)](../retrospectives/phase-6-nats-eu-build-phase-b-retro.md) (missionBriefUrl gate, grep-for-UI-callers, measured-not-assumed numbers).
- Format: [phase-12-campaign3-scenario-arc-plan.md](phase-12-campaign3-scenario-arc-plan.md).
- Tooling: [author-passes.mjs](../scripts/author-passes.mjs) (batch pass authoring, per-scenario epoch, `verify-only` mode for checked-in TLEs), [nice-coverage.mjs](../scripts/nice-coverage.mjs) + [nice-catalog.json](../scripts/nice-catalog.json) (542 codes).
- Keyhole geometry and RF numbers: [nats-eu-rf-validation.test.ts](../test/campaigns/nats-eu-rf-validation.test.ts) (bird 61799, max el ~88 deg, C/N craters at culmination under real program-track).

## Engine facts that shape this tier (verified by reading the code, 2026-09-10)

| Fact | Where | Consequence for S9-S16 |
| --- | --- | --- |
| Equipment conditions (`gpsdo-*`, `buc-*`, `lnb-*`, `hpa-*`, `feed-heater-enabled`) evaluate against the objective's `groundStation` id, not the selected station | objectives-manager.ts `getGroundStation_` | An objective with `groundStation: 'SH-02'` checks Shetland's own (deep-cloned) equipment. Pair it with a hidden `ground-station-selected` so the operator is looking at the right station. |
| `weatherEvents` of type `rain`/`storm`/`fog`/`wind`/`dust` do nothing to the RF chain; only `snow`/`ice`/`hail` accumulate a feed loss (severe: 10 dB max, tau 720 s) that the feed heater melts at 1 dB/min; `sun-transit` sets sky noise; `linkMarginDegradation` is read only by sun-transit | weather-manager.ts, antenna-core.ts `iceAccumulation_dB` | S14's "rain fade" is staged as sleet/hail (an Atlantic low in April), with the rain-fade arithmetic carried by a quiz. See Engine gaps G1. |
| `FaultInjector` has no scenario-settings hook and no production caller; `CryptoModule.inject*` methods have no production caller; `CryptoModule` initial state is not scenario-configurable | faults/fault-injector.ts, crypto-module-core.ts | `fault-active`/`fault-cleared`, `rx/tx-key-status: 'Mismatch'` cannot be staged from data. S15's "mid-rotation key mismatch" is recast (G2). S8 shipped without `fault-cleared` for the same reason. |
| `CommandingManager` key lifecycle is operator-driven: `beginKeyRotation()` (Valid -> Pending Rotation) and `completeKeyRotation()` are buttons on the TT&C tab; no scheduled rotation event fires from data; one `commanding` block = one window, one target | commanding-manager.ts, commanding-tab.ts | S15 stages the rotation as an order in the brief plus an audit-log entry; the tempo comes from the pass geometry. Commands ACK on window + Doppler comp + key only, never on pointing or EIRP, so EIRP objectives (S10) are enforced by equipment conditions. |
| `spaceEvents[].maneuverAtS` runs on the **mission clock** (`missionNowMs`), which `freezesScenarioTimer` pauses during the brief; `initialTle` re-tampers the bird on every load (replay-safe) | space-event-manager.ts | S11 boots SAR-3 on a coarse injection set via `initialTle` and delivers the refined set via `newTle`. The S7 file comment saying wall-clock is stale; the code reads the mission clock. |
| One TLE per bird: truth and prediction cannot diverge in-sim (C3 S6 finding) | orbital-satellite.ts `reloadTle` | "Coarse elements" cannot cause a missed acquisition. S11 sells the coarse set through the ephemeris panel, timing shift, and the brief; the refined load is required before AOS by objective order. |
| `OrbitalSatellite` carries a single observer (Galway); SH-02 windows are authored, not propagated | ground-stations.ts header | Nothing in S9-S16 asks the operator to track from SH-02. SH-02 is allocation + its own equipment state only. |
| BUC thermal model: powered, temperature relaxes toward `25 + 0.8 * (outputPower + 10)` degC with tau ~333 s at 60 Hz; unpowered it cools with tau ~28 min; `buc-temperature-normal` requires `isPowered` | buc-module-core.ts `updateThermalState_` | An over-temp staged by initial state self-relaxes in ~2 min once muted (target 25 degC). Powering the BUC OFF is the wrong move twice over (slower cooling, condition needs power). S16 enforces the procedure with `buc-muted` then `buc-temperature-normal`. |
| GPSDO: `updateLockStatus_` locks when powered, GNSS switch up, warm, and `gnssSignalPresent`; a power cycle (`resetToWarmupState_`) clears holdover but costs a ~10 min OCXO warm-up | gpsdo-module-core.ts | S16 stages holdover with the GNSS switch DOWN and signal present; the fix is the switch, not the power button. Verify `achieveLock_` clears `isInHoldover` in the harness before authoring (Phase B item). |
| LNB noise temperature is derived from `lnaNoiseFigure`/`mixerNoiseFigure`/`gain` (Friis) and feeds the front-end noise calc | lnb-module-core.ts, rf-front-end-core.ts:386 | S13's degraded feed is a scenario-local GW-01 with `lnaNoiseFigure: 2.2` (T_lnb ~190 K vs 60 K nominal; Tsys 88 -> ~218 K; C/N drops ~3.9 dB). `lnb-noise-performance` (max 100 K) fails on GW-01 and passes on SH-02. |
| `receiver-snr-threshold` accepts `maxCNRatio` (passes while C/N at or BELOW) | objective-types.ts | S13 can assert the keyhole crater as an observed condition. |
| `contact-plan-valid` = no same-station overlap AND every contact with priority <= `requiredPriorityAtOrAbove` assigned; contacts are never pre-assigned from data | contact-schedule-manager.ts | "Slipped pass" (S16) = a P1 pair whose windows now overlap on one site; the operator finds and splits it. |
| `hardwareFaultEvents` (timed TX-modem fault) is the only timed equipment fault available from data | scenario-manager.ts | Not used in this tier (would need a second TX modem per station); noted as an S16 difficulty knob for a later pass. |
| `isOptional` now exempts an objective from Mission Complete (sprint 1A, commit 244476d) but the checklist shows no visual cue | objectives-manager.ts | At most one optional objective per scenario, always the last one, description says "optional". |
| `missionBriefUrl` must be set or the checklist does not render | phase-6 retro | Set on every scenario from the first line; MDX pages authored in Phase D. |
| Tab ids in use: `rx-analysis`, `tx-chain`, `acu-control`, `dashboard`, `gps-timing`, `pass-schedule`, `commanding`, `security-console`, `link-budget`, `contact-schedule` | grep of campaigns | Use these exact ids for `tab`/`observationTab`. The RF front-end panel is reached via `rx-analysis`/`tx-chain`; confirm which tab hosts the LNB readout before authoring S13 (Phase B live check). |

## Roster and dialog budget

| Character | Appears in | Role in this tier |
| --- | --- | --- |
| Erik Halvorsen (customer) | S9, S10, S12, S14, S16 | Tasking, SLA, impact. Talks vessels and coverage. Never RF. |
| Anneke Visser (constellation ops) | S10, S11, S12, S13, S15, S16 | Commanding coordination, LEOP lead, element sets, rotation orders. |
| Fiona MacLeod (SH-02) | S9, S13, S14, S15, S16 | Cross-station peer; weather; takes reallocated contacts. |
| SYSTEM | all | Every `status-check`. |
| Charlie Brooks | none | Handed off at S8. One optional sign-off text in S16 is allowed (cap permitting). |
| Priya Sharma | none | Debuts S17. Not used. |

Clip mechanics: `dialogClips.intro` (text message) plus `dialogClips.objectives[objectiveId]`
keyed by objective id, exactly as [nats/scenario9.ts](../src/campaigns/nats/scenario9.ts).
Text clips, `audioUrl: ''` (C3 precedent) until open question 1 is settled.

## Authoring conventions for this tier

- **Ids:** `nats-eu-scenarioN`, url `nats-eu/scenarios/nats-eu-scenarioN`, `number: N`, `imageUrl: 'nats/N/card.png'` placeholder (S1-S8 pattern), `difficulty: 'intermediate'` (S9-S12) and `'advanced'` (S13-S16), `prerequisiteScenarioIds: ['nats-eu-scenario(N-1)']`. Dual registration: campaign `scenarios` array and flat `SCENARIOS`; the registration test asserts unlock order.
- **First objective** is always `review-mission-brief` (`nice: ['K0645', ...]`, `freezesScenarioTimer: true`, `mission-brief-opened` + one SYSTEM readiness quiz, 5 pts).
- **Per-scenario epoch, scenario-local satellites.** Phase 1 shared one clock and module-level satellite instances; Phase 2 advances the calendar (17 Mar -> 9 Apr 2027) and each scenario gets its own TLE set authored against its own `scenarioStartDate`/`scenarioStartWallTime`. Add factory helpers to `satellites.ts` (`createMeridianSar1(tle)`, `createMeridianSar2(tle)`, `createMeridianSar3(tle)`) that return a fresh `OrbitalSatellite` with the shared transponder config, so `reloadTle` on one scenario's bird never leaks into another (the C3 shared-instance lesson). Content tooling, not engine work.
- **SH-02 windows** are authored offsets from the Galway pass (S5/S8 pattern: AOS +1.5 to +2 min, LOS +2 to +2.5 min), never propagated.
- **Timing:** LEO passes are the timer. No `timeLimitSeconds` on pass objectives. `timeSkip` on every scenario whose first pass is more than ~5 min out (leadTimeS 120, minSkipS 300).
- **Quizzes** carry the "why"; briefs carry the numbers. Every Working Document line comes from a `status-check` with `documentLine`/`documentSection`.
- **Validation before authoring:** extend the Phase B harness with a `describe('Phase 2')` block that (a) flies every authored pass under real program-track and asserts the objective thresholds with 2 dB margin, (b) asserts each `linkBudget.expectedCNRDb` matches the published worksheet numbers within tolerance, (c) reachability (every referenced contact/account/event/command/space-event id exists), (d) the S13 keyhole crater and the S14 ice-vs-heater curve.

## The eight scenarios

| # | id | Title / Subtitle | Duration | Difficulty | Pts | Mechanics exercised | Epoch (UTC) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S9 | `nats-eu-scenario9` | Morning Constellation / Network Health & Daily Pass Plan | 25 min | intermediate | 95 | health checks on both sites, M3 plan (6 contacts, 2 conflict pairs), one pass | 2027-03-17 06:10 |
| S10 | `nats-eu-scenario10` | Priority Tasking / Urgent Collect, Low Pass | 25 min | intermediate | 110 | M1 budget at 15 deg, HPA back-off for EIRP, M2 command, thin-margin decode | 2027-03-18 15:30 |
| S11 | `nats-eu-scenario11` | LEOP: Launch Day / SAR-3 First Acquisition (arc 1/2) | 25 min | intermediate | 105 | M4 `initialTle` injection set -> refined set, beacon acquisition, first SOH | 2027-03-22 09:00 |
| S12 | `nats-eu-scenario12` | LEOP: Commissioning / SAR-3 Acceptance Tests (arc 2/2) | 30 min | intermediate | 125 | M2/M5 command checkout, first video decode, Working Document test record | 2027-03-24 10:00 |
| S13 | `nats-eu-scenario13` | The Numbers Don't Lie / Pass-Performance Trending | 35 min | advanced | 130 | Act 1 zenith keyhole (folded in, see below); Act 2 degraded GW-01 LNB found by budget-vs-measurement; Working Document trend report; reallocation | 2027-03-29 13:00 |
| S14 | `nats-eu-scenario14` | Atlantic Low / Weather Reallocation Judgment | 25 min | advanced | 110 | sleet at GW-01 (ice accumulation), feed heater, reallocate P1 to SH-02, ride out P2 at GW-01 | 2027-04-02 11:00 |
| S15 | `nats-eu-scenario15` | Rotation Day / Fleet COMSEC Under Tempo | 30 min | advanced | 120 | M3 day plan, receive pass, M5 rotation between passes, M6 rotation order acknowledged, M2 post-rotation command before LOS | 2027-04-06 07:00 |
| S16 | `nats-eu-scenario16` | Cascade / Network Multi-Failure (Phase 2 capstone) | 35 min | advanced | 150 | GW-01 GPSDO holdover, SH-02 BUC over-temp, slipped-pass conflict, triage order, command + decode, SLA impact report | 2027-04-09 12:00 |

Running total 945 pts (Phase 1 S1-S8: 5 to 145 per scenario).

### The zenith keyhole: decision

**Folded into S13 as Act 1.** Reasons: (a) it is a trending puzzle by construction
("why did the link die at max elevation on the best pass of the week?"), which is S13's
title; (b) the geometry and RF assertions are already on file (bird 61799, max el ~88 deg,
`offAxisDeg > 0.2`, C/N < 8 dB within 15 deg of culmination) so the authoring cost is one
`author-passes` request; (c) a ninth slot breaks the 3x8 mirror and every later id;
(d) it gives S13 a live pass to fly before the LNB act, so the scenario is not a quiz
chain. Act 1 is the explained anomaly (physics, not a fault: reacquire on the descending
leg); Act 2 is the real fault (LNB). The contrast is the lesson: a number that
disagrees with expectation has a cause, and the two causes look nothing alike in the data.
S13 grows to 35 min and 7 objectives; the clip cap holds at 6.

---

## Per-scenario specs

Notation: `type{params}`; `M` = `mustMaintain: true`; `H` = `hidden: true`;
`obs(tab)` = `requiresObservation: true, observationTab: tab`; `AND` unless stated;
`prereq` lists `prerequisiteObjectiveIds`. Points in the last column. Every `status-check`
uses `character: Character.SYSTEM`, `pointPenalty: 5` unless `0` is stated.

### S9 - Morning Constellation / Network Health & Daily Pass Plan

**Situation.** First qualified shift, 06:10 local. Two sites, two birds, six contacts on
the board and nobody to hand you the plan. Erik has a standing collect at the 06:18
SAR-1 window and wants to know it is covered. Fiona is on the SH-02 console but has her
own morning.

**Characters:** Erik (intro text, SLA close), Fiona (one check-in). 4 clips.

**Settings.** `groundStations: [gw01, sh02]` (shared configs); `satellites:
[sar1, sar2]` (scenario-local instances at the S9 epoch); `contactTimeline {horizonHours 3}`;
`timeSkip` (for the second-orbit P3 contacts if the operator wants them);
`contactSchedule { stationIds ['GW-01','SH-02'], requiredPriorityAtOrAbove: 2, contacts: }`

| id | bird | prio | windowStartS-EndS | note |
| --- | --- | --- | --- | --- |
| M-SAR1-GW | 61701 | 1 | 480-930 | Galway pass, AOS T+8 |
| M-SAR1-SH | 61701 | 2 | 580-1050 | Shetland horizon, overlaps above |
| M-SAR2-GW | 61702 | 1 | 1320-1740 | Galway, AOS T+22 |
| M-SAR2-SH | 61702 | 1 | 1400-1830 | overlaps above |
| M-SAR1-GW-2 | 61701 | 3 | 6100-6520 | second orbit; may be left unassigned |
| M-SAR2-SH-2 | 61702 | 3 | 7000-7400 | second orbit; may be left unassigned |

Two conflict pairs (split across sites) plus two P3 contacts the operator may drop: a valid
plan needs the four P1/P2 contacts assigned with no same-site overlap.

**Objectives.**

| # | id | title / description | conditions | prereq | nice | pts |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | review-mission-brief | Take the Shift. Open the brief; confirm the six contacts and the health-check list. | `mission-brief-opened{boxId 'mission-brief'}`; `status-check` (Q: what must be true before you publish a plan to Fiona? A: no site double-booked and every P1/P2 covered) | - | K0645, K0737 | 5 |
| 2 | galway-health | Galway Health Check. Confirm GW-01's reference and RF chain are nominal before the first window. | `gpsdo-locked{obs(gps-timing)}`; `gpsdo-not-in-holdover`; `lnb-thermally-stable{obs(rx-analysis)}`; `hpa-not-overdriven` | 1 | T0431, K0741 | 10 |
| 3 | shetland-health | Shetland Health Check. Same checks on SH-02 from the Galway console. `groundStation: 'SH-02'` | `ground-station-selected{groundStationId 'SH-02'}` H; `gpsdo-locked{obs(gps-timing)}`; `buc-temperature-normal{maxTemperature 70}`; `lnb-thermally-stable{obs(rx-analysis)}` | 2 | T0431, K0741, S0421 | 10 |
| 4 | build-the-day-plan | Build the Day Plan. Allocate the morning's contacts; leave the P3 second-orbit contacts to your judgment. `groundStation: 'GW-01'` | `contact-assigned{contactId 'M-SAR1-GW', groundStationId 'GW-01'}` M; `contact-assigned{contactId 'M-SAR2-SH', groundStationId 'SH-02'}` M; `contact-plan-valid{}` M | 1 | K0689, T0129 | 20 |
| 5 | work-the-first-window | Work the SAR-1 Window. AOS T+8. Program-track, decode the imagery downlink (IF 1414 MHz), hold C/N above 8 dB. | `antenna-tracking-mode-set{trackingMode 'program-track'}` M; `receiver-signal-locked{modemNumber 1, obs(rx-analysis)}` M; `receiver-snr-threshold{modemNumber 1, minCNRatio 8, obs(rx-analysis)}` M | 2, 4 | T0153, S0421, K0740 | 25 |
| 6 | second-window | Work the SAR-2 Window. AOS T+22. Retune to 1370 MHz and decode. | `receiver-signal-locked{modemNumber 1, obs(rx-analysis)}` M; `receiver-snr-threshold{modemNumber 1, minCNRatio 8, obs(rx-analysis)}` M | 5 | T0153, S0421 | 15 |
| 7 | customer-status | Customer Status. Close the morning with Erik. | `status-check` (Q: Erik asks whether his 06:18 collect was captured and what the day looks like. What do you report? A: the collect decoded with margin; both P1 windows are covered across the two sites; the second-orbit contacts are best-effort) | 6 | S0478, T1580 | 10 |

**Dialog beats.** intro (Erik, text 06:02: standing collect at 06:18, "just tell me it's
covered"); obj 3 (Fiona: "Shetland's clean, plan's yours"); obj 5 (Erik: "Got the
frames. Same time tomorrow?"); obj 7 (Erik sign-off).

**RF.** S1 envelope, unchanged: video 28 dBm EIRP, IF 1414/1370, C/N peak ~11 dB at
28-30 deg. No faults.

**Pass windows** (`author-passes`, station galway, epoch 2027-03-17T06:10:00Z):
SAR-1 61701 AOS T+8.0, max el 30, dur ~7.5, mm 15.6, incl 97.2; SAR-2 61702 AOS T+22.0,
max el 25, dur ~7, mm 15.6, incl 98.4. Why: two moderate passes 14 min apart give the
operator time for two health checks and the plan before the first window, and the SAR-2
window makes the second conflict pair real.

**Failure modes.** Publishing a plan with a P1 unassigned (plan INVALID); assigning both
halves of a pair to GW-01 (conflict); doing the health checks after AOS and missing the
decode window; skipping ahead with `timeSkip` past the SAR-1 pass (the skip stops 2 min
before the NEXT pass; if objective 5 is not done, the operator has lost it).

### S10 - Priority Tasking / Urgent Collect, Low Pass

**Situation.** Erik's vessel of interest is off the Faroes and the only MERIDIAN-SAR-1
window that covers it today peaks at 15 degrees over Galway. The collect has to be
tasked by command on that pass and the imagery pulled down on the same pass. Anneke
confirms the bird is available; the link budget says the margin is thin.

**Characters:** Erik (intro, close), Anneke (command coordination). 5 clips.

**Settings.** `groundStations: [gw01]`; `satellites: [sar1, sar2]`; `linkBudget {label
'Low-elevation collect: SAR-1 downlink at 15 deg', expectedCNRDb <measured, ~7.8>,
toleranceDb 1.0, thresholdCNRDb 6, requiredMarginDb 1}`; `commanding {groundStationId
'GW-01', targetNoradId 61701, windowStartS <AOS+20>, windowEndS <LOS-20>, requireDopplerComp
true, requireValidKey true, commands [{id 'SAR-TASK-URGENT', label 'Task urgent SAR
collect'}, {id 'REC-PLAYBACK'}, {id 'PLD-SAFE'}]}`; `contactTimeline`.

**Objectives.**

| # | id | title / description | conditions | prereq | nice | pts |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | review-mission-brief | Read the Tasking. | `mission-brief-opened`; `status-check` (Q: a 15 deg pass vs the 28 deg passes you have worked: what changes in the budget? A: slant range ~1080 km vs 761 km, ~3 dB more path loss plus more atmosphere, so the margin over threshold shrinks to about a decibel) | - | K0645, K0740 | 5 |
| 2 | budget-the-low-pass | Budget the Low Pass. Worksheet numbers: EIRP 28 dBm; slant range at max elevation 1080 km (FSPL 174.5 dB at 11686 MHz); Rx gain 51.8 dBi; Tsys 88 K; BW 36 MHz; misc 1.5 dB. | `tab-active{tab 'link-budget'}` H; `link-budget-computed{}` | 1 | T0080, S0015, K0740 | 15 |
| 3 | raise-the-eirp | Raise Uplink EIRP Without Overdriving. The command has to reach the bird at long range: take HPA back-off from 10 dB to 4 dB. Below 3 dB the amplifier is overdriven and the IMD alarm trips. | `hpa-back-off-set{backOff 4, backOffTolerance 0.5}` M; `hpa-not-overdriven{}` M; `buc-not-saturated{}` M | 1 | S0675, K0064, K0740 | 20 |
| 4 | acquire-low | Acquire at the Horizon. AOS T+5. Program-track, Doppler compensation on. | `antenna-tracking-mode-set{trackingMode 'program-track'}` M; `signal-detected{signalId 'MERIDIAN-SAR-1-Beacon', minPower -130, obs(rx-analysis)}`; `uplink-doppler-comp-enabled{}` M | 2, 3 | S0421, K1032 | 10 |
| 5 | task-the-collect | Task the Collect. Modem on air, HPA enabled, send SAR-TASK-URGENT early in the pass (the imaging block needs lead time). | `tx-modem-transmitting{modemNumber 1}` M; `hpa-enabled{}` M; `command-acknowledged{commandId 'SAR-TASK-URGENT'}` | 4 | T1567, K0773 | 25 |
| 6 | pull-the-imagery | Pull the Imagery With the Margin You Have. Lock the downlink and commit the link at max elevation with at least 1 dB over threshold. | `receiver-signal-locked{modemNumber 1, obs(rx-analysis)}`; `receiver-snr-threshold{modemNumber 1, minCNRatio 6, obs(rx-analysis)}` M `maintainDuration 30`; `link-margin-met{minMarginDb 1}` | 5 | T0153, K0740, T0080 | 25 |
| 7 | report-to-customer | Report to Erik. | `status-check` (Q: the collect decoded at ~7 dB C/N, a decibel over threshold. What do you tell the customer? A: captured, usable, and that this geometry is the floor: anything lower needs the Shetland site or the next orbit) | 6 | S0478, T1580 | 10 |

**Dialog beats.** intro (Erik text: vessel, box, "one pass, can you do it"); obj 2
(Anneke: bird available, "your EIRP, your call, keep the HPA linear"); obj 5 (Anneke:
"Task received on board, imaging block armed"); obj 6 (Erik: "Frames in, thank you");
obj 7 close.

**RF.** Downlink: predicted ~7.8 dB ideal at 15 deg (S2's 10.96 dB minus 3.0 dB FSPL
minus ~0.2 dB extra atmosphere); **measure in the harness before fixing
`expectedCNRDb`**; if the settled peak under program-track is under 7.5 dB raise the
authored max el to 18 deg. Uplink: HPA back-off 10 -> 4 dB (+6 dB EIRP), overdrive at
< 3 dB (`isOverdriven`, IMD -30 - 2*backOff dBc). BUC gain stays 23 dB (saturation 15 dBm).

**Pass windows** (epoch 2027-03-18T15:30:00Z, galway): SAR-1 61701 AOS T+5.0, max el 15,
dur ~5.5, mm 15.6, incl 97.2, direction southbound. SAR-2 not worked (its TLE may be any
pass > 40 min out). Why: a 15 deg pass on the 360 km orbit is the lowest geometry that
still closes QPSK 3/4 with ~1 dB margin; it must be the FIRST pass after scenario start
so the phase-B window/pass assertion holds.

**Failure modes.** Back-off to 2 dB (overdrive alarm; objective 3 loses its maintain);
sending the command before Doppler comp (rejected `no-doppler-comp`, window is short);
committing the link before max elevation (margin < 1); enabling the HPA before the modem
(HPA-noise invariant fails the mission, as in S3).

### S11 - LEOP: Launch Day / SAR-3 First Acquisition (arc 1/2)

**Situation.** MERIDIAN-SAR-3 separated from the upper stage 94 minutes ago. Rotterdam's
first element set is the launch provider's injection estimate; a refined set from the
first ranging arc is due any minute. GW-01 is the first commercial station on its ground
track. Anneke is LEOP lead and wants beacon, then state of health, nothing else.

**Characters:** Anneke (intro, two beats, close). 4 clips.

**Settings.** `groundStations: [gw01]`; `satellites: [sar1, sar2, sar3]` (sar3 =
`createMeridianSar3(refinedTle)`, 61703; RF plan below); `workingDocument {title 'SAR-3
LEOP Log', description 'First-acquisition record for Rotterdam'}`; `spaceEvents:
[{id 'SAR3-INJ', satelliteNoradId 61703, maneuverAtS 45, label 'SAR-3 refined elements
(first ranging arc)', initialTle <coarse injection set>, newTle <refined set>}]`;
`timeSkip` off (AOS at T+9 is the wait).

**SAR-3 RF plan** (distinct from SAR-1/2 so the operator has to read the brief): video
downlink 11760 MHz (IF 1340 MHz, QPSK 3/4, 36 MHz, 28 dBm EIRP, feed `blue-3.mp4`),
telemetry beacon 11785 MHz CW (IF 1315 MHz, 0 dBm, outside the video occupied band
11742-11778 per the Phase A adjacency finding), TT&C uplink 14065 MHz (IF 1465 MHz),
transponded downlink 11810 MHz. Same 360 km / mm 15.6 orbit so the S1 RF envelope holds.

**Objectives.**

| # | id | title / description | conditions | prereq | nice | pts |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | review-mission-brief | Read the LEOP Card. | `mission-brief-opened`; `status-check` (Q: the injection set has a stated 1-sigma along-track error of 20 s. Your beam is 0.45 deg wide. What does that mean for acquisition? A: at AOS the bird can be a few degrees from prediction; refined elements before the pass, or a beacon search wider than the beam, are required) | - | K0645, K1032 | 5 |
| 2 | test-readiness | Test Readiness Review. Confirm the station is configured for a bird it has never seen: beacon frequency set to SAR-3's telemetry beacon. | `antenna-beacon-frequency-set{beaconFrequency 11785e6}` M; `status-check` (TRR checklist; documentLine 'TRR complete: beacon 11785 MHz, video IF 1340 MHz, injection set loaded', documentSection 'Readiness') | 1 | S0630, T0513 | 15 |
| 3 | load-refined-elements | Load the Refined Elements. Rotterdam's ranging solution replaces the injection estimate; load it before AOS. | `tab-active{tab 'pass-schedule'}` H; `ephemeris-updated{eventId 'SAR3-INJ'}` M | 2 | T1138, K1032 | 20 |
| 4 | first-acquisition | First Acquisition. AOS T+9. Program-track on the refined set and lock the beacon. | `antenna-tracking-mode-set{trackingMode 'program-track'}` M; `signal-detected{signalId 'MERIDIAN-SAR-3-Beacon', minPower -130, obs(rx-analysis)}`; `antenna-beacon-locked{obs(acu-control)}` | 3 | T0513, S0421, K1032 | 30 |
| 5 | state-of-health | Initial State of Health. Record beacon power and Doppler behaviour for Rotterdam. | `status-check` (Q: beacon present, tracking, Doppler profile matches the refined set. What is the SOH call? A: spacecraft transmitting on the expected frequency and orbit; no anomaly; recommend proceeding to command checkout next pass; documentLine 'SOH: beacon acquired, orbit matches refined set, proceed to commissioning', documentSection 'State of Health') | 4 | T1611, S0842 | 20 |
| 6 | leop-handover | LEOP Handover. Tell Anneke what she has. | `status-check` (Q: why not command the bird on this pass while you have it? A: the flight rules sequence LEOP: no command until SOH is confirmed and the ground station has demonstrated tracking; a rejected command on a new bird is unexplainable) | 5 | T0513, K0645 | 15 |

**Dialog beats.** intro (Anneke text: separation confirmed, "beacon then SOH, nothing
else"); obj 3 (Anneke: refined set sent, "load it, the injection numbers were 30 s
late"); obj 4 (Anneke: "That's her. First contact from a commercial site"); obj 6 close.

**Ephemeris design.** `newTle` is the authored truth from `author-passes`. `initialTle`
is `newTle` with RAAN +0.3 deg and mean anomaly +2.0 deg (AOS ~30 s later, cross-track
offset visible on the ground-track map). Because the sim has one TLE per bird, the pass
still happens on the coarse set; the ephemeris panel shows STALE at T+45 s and the
objective order requires the load before AOS. If the operator skips objective 3 the
beacon still comes up; the checklist, not the physics, enforces the load. State this in
the brief as flight-rule discipline.

**Pass windows** (epoch 2027-03-22T09:00:00Z, galway): SAR-3 61703 AOS T+9.0, max el 32,
dur ~7.5, mm 15.6, incl 97.6 (new plane). SAR-1/SAR-2 present but > 40 min out. Why:
enough dead time for TRR + the ephemeris load, moderate elevation so beacon lock is clean.

**Failure modes.** Beacon frequency left at 11711 MHz (SAR-1) so beacon lock never
happens; loading the elements after AOS (the panel still clears, but the SOH quiz
explanation calls it out); commanding the bird (no `commanding` block: no console, no
condition; the quiz covers the rule).

### S12 - LEOP: Commissioning / SAR-3 Acceptance Tests (arc 2/2)

**Situation.** Two days on, SAR-3 is healthy and Anneke has the payload acceptance test
plan: power the payload, command a test pattern, decode the first imagery, record the
results. Erik is copied because Nordic Maritime Watch takes delivery of SAR-3 capacity
the moment the card is signed.

**Characters:** Anneke (intro, command beats), Erik (delivery). 5 clips.

**Settings.** `groundStations: [gw01]`; `satellites: [sar1, sar2, sar3]`; `commanding
{groundStationId 'GW-01', targetNoradId 61703, windowStartS <AOS+20>, windowEndS <LOS-20>,
requireDopplerComp true, requireValidKey true, commands [{id 'PLD-ON', label 'Payload
power on'}, {id 'PLD-TEST-PATTERN', label 'Transmit payload test pattern'}, {id
'REC-PLAYBACK'}, {id 'PLD-SAFE'}]}`; `linkBudget {label 'SAR-3 acceptance: video
downlink at max elevation', expectedCNRDb <measured, ~11.0>, toleranceDb 1.0,
thresholdCNRDb 6, requiredMarginDb 2}`; `workingDocument {title 'SAR-3 Payload Acceptance
Test Card'}`; `timeSkip`.

**Objectives.**

| # | id | title / description | conditions | prereq | nice | pts |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | review-mission-brief | Read the Test Plan. | `mission-brief-opened`; `status-check` (test order and why: power, pattern, decode, record) | - | K0645, T0080 | 5 |
| 2 | predict-acceptance | Predict the Acceptance C/N. Worksheet numbers as S2 (761 km, 171.4 dB at 11760 MHz rounds the same), but published for SAR-3's frequency. | `link-budget-computed{}` | 1 | T0080, S0015 | 15 |
| 3 | acquire-sar3 | Acquire SAR-3. AOS T+6. Program-track, beacon, Doppler compensation. | `antenna-tracking-mode-set{'program-track'}` M; `signal-detected{signalId 'MERIDIAN-SAR-3-Beacon', minPower -130, obs(rx-analysis)}`; `uplink-doppler-comp-enabled{}` M | 2 | S0421, K1032 | 10 |
| 4 | payload-checkout | Payload Command Checkout. Modem, HPA, PLD-ON then PLD-TEST-PATTERN, both acknowledged. | `tx-modem-transmitting{modemNumber 1}` M; `hpa-enabled{}` M; `command-acknowledged{commandId 'PLD-ON'}`; `command-acknowledged{commandId 'PLD-TEST-PATTERN'}` | 3 | T1092, T1567, K0773 | 25 |
| 5 | first-video | First Imagery Decode. Retune to IF 1340 MHz, lock, hold C/N above 8 dB, commit the link with 2 dB margin. | `receiver-signal-locked{modemNumber 1, obs(rx-analysis)}` M; `receiver-snr-threshold{modemNumber 1, minCNRatio 8, obs(rx-analysis)}` M; `link-margin-met{minMarginDb 2}` | 4 | T1092, T0153, S0842 | 25 |
| 6 | record-results | Record the Test Results. Three entries on the card. | three `status-check`s with documentLine: (a) command checkout result (documentSection 'Command'), (b) measured C/N vs predicted (documentSection 'Payload'), (c) acceptance verdict and residual risk (documentSection 'Verdict') | 5 | T1611, T1506, S0842 | 30 |
| 7 | deliver-to-customer | Deliver to the Customer. Confirm what Erik now owns. | `status-check` (Q: what does acceptance transfer? A: SAR-3 enters the tasking pool at the tested performance; anything below it is a service ticket, not an opinion) | 6 | S0478, T1506 | 15 |

**Dialog beats.** intro (Anneke text: "test plan attached, one pass, do it in order");
obj 4 (Anneke: "Payload on, pattern transmitting, over to you"); obj 5 (Anneke: "First
frames from SAR-3. Log it"); obj 6 (Erik: "Copied on the card. When can I task it?");
obj 7 close.

**RF.** Same envelope as S2 (28 dBm, 761 km, ~11 dB peak); SAR-3 IF 1340 MHz. Measure.

**Pass windows** (epoch 2027-03-24T10:00:00Z, galway): SAR-3 61703 AOS T+6.0, max el 28,
dur ~7.5, mm 15.6, incl 97.6. Why: the S2 geometry, so the acceptance numbers are the
ones already validated; T+6 leaves room for the worksheet.

**Failure modes.** Sending PLD-TEST-PATTERN before PLD-ON (both ACK: the engine does not
sequence; the results quiz asks the order and deducts); committing the link on the
shoulder of the pass (margin < 2); recording results before the decode (objective order
prevents it).

### S13 - The Numbers Don't Lie / Pass-Performance Trending

**Situation.** The week's pass log has two things wrong with it. Tuesday's 86 degree
SAR-2 pass, the best geometry all month, shows the link collapsing at the top and coming
back on the way down. And every SAR-1 pass at Galway since Thursday has decoded two to
four decibels under budget while Shetland's have not moved. Anneke wants an explanation
for the first; Fiona wants to know whether to plan around Galway for the second.

**Characters:** Anneke (intro, keyhole beat), Fiona (LNB beat, reallocation), Erik
(none). 5 clips.

**Settings.** `groundStations: [gw01Degraded, sh02]` where `gw01Degraded =
structuredClone(galwayGroundStation)` with `rfFrontEnds[0].lnb.lnaNoiseFigure: 2.2`
(and `noiseTemperature: 190` so the display starts settled); `satellites: [sar1,
sar2zenith]`; `linkBudget {label 'GW-01 SAR-1 downlink at max elevation (survey
values)', expectedCNRDb 11.0, toleranceDb 1.0, thresholdCNRDb 6, requiredMarginDb 3}`
(the survey budget is right; the station is wrong); `contactSchedule {stationIds
['GW-01','SH-02'], requiredPriorityAtOrAbove 1, contacts [{id 'T-SAR1-NEXT',
satelliteNoradId 61701, priority 1, windowStartS <second SAR-1 orbit>, windowEndS ...,
label 'Tomorrow's priority collect'}]}` (one contact, either site allowed by the
manager; the objective forces SH-02); `workingDocument {title 'Weekly Pass-Performance
Report'}`; `timeSkip`.

**Objectives.**

| # | id | title / description | conditions | prereq | nice | pts |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | review-mission-brief | Read the Week's Log. | `mission-brief-opened`; `status-check` (Q: two anomalies, which is a fault? A: you do not know yet; trend data separates a one-off from a drift, and each needs its own test) | - | K0645, T0349 | 5 |
| 2 | fly-the-zenith-pass | Fly the Zenith Pass. SAR-2, AOS T+3.5, max el 86 deg. Program-track, lock the downlink on the ascending leg, and watch what happens at culmination. | `antenna-tracking-mode-set{'program-track'}` M; `receiver-signal-locked{modemNumber 1, obs(rx-analysis)}`; `receiver-snr-threshold{modemNumber 1, maxCNRatio 6, obs(rx-analysis)}` (latches when C/N is at or below 6 dB while observed, i.e. the crater) | 1 | T0153, K0740 | 15 |
| 3 | explain-the-keyhole | Explain the Keyhole. Reacquire on the descending leg, then record the cause. | `receiver-snr-threshold{modemNumber 1, minCNRatio 8, obs(rx-analysis)}` (post-culmination recovery); `status-check` (Q: what killed the link at 86 deg? A: azimuth rate goes to infinity through the zenith; a 20 deg/s el-over-az pedestal cannot slew through the keyhole, so the 0.45 deg beam falls off the bird until the descending leg; not a fault; mitigations: accept the outage, or an X/Y pedestal; documentLine 'Tue SAR-2 86 deg: zenith keyhole, pedestal rate limit, not a fault. Recovered descending leg.', documentSection 'Anomaly 1') | 2 | S0892, K1032, K0739 | 20 |
| 4 | budget-vs-measured | Budget vs Measurement on SAR-1. Compute the survey budget (S2 numbers), then measure the T+22 pass at max elevation and commit. | `link-budget-computed{}`; `antenna-tracking-mode-set{'program-track'}` M; `receiver-signal-locked{modemNumber 1, obs(rx-analysis)}`; `status-check` (Q: predicted 11 dB, measured about 7. Which of these is the Link Analysis console going to accept? A: neither number is wrong; the commit will fail the 3 dB margin because the station is not the station the survey measured) | 3 | T0349, S0646, K0740 | 20 |
| 5 | isolate-the-cause | Isolate the Cause. Three candidates: element-set aging, pointing, receive chain. Rule out the first two, then read the LNB. | `tab-active{tab 'pass-schedule'}` H (ephemeris panel: no stale events); `signal-detected{signalId 'MERIDIAN-SAR-1-Beacon', minPower -130, obs(rx-analysis)}` (pointing fine); `status-check` (Q: LNB noise temperature reads ~190 K against a 60 K survey value. Effect? A: Tsys 88 -> ~218 K, 10log(218/88) = 3.9 dB, which is the shortfall; the feed/LNA has degraded; documentLine 'GW-01 SAR-1 shortfall 3.9 dB = LNB noise temp 190 K vs 60 K survey. Feed/LNA degradation. Ephemeris and pointing ruled out.', documentSection 'Anomaly 2') | 4 | S0892, T0531, K0064 | 25 |
| 6 | prove-shetland | Prove Shetland Is Clean. Fiona's chain must be in spec before you move the priority collect. `groundStation: 'SH-02'` | `ground-station-selected{groundStationId 'SH-02'}` H; `lnb-noise-performance{maxNoiseTemperature 100, obs(rx-analysis)}`; `contact-assigned{contactId 'T-SAR1-NEXT', groundStationId 'SH-02'}` M; `contact-plan-valid{}` M | 5 | T0431, K0689, S0675 | 20 |
| 7 | file-the-report | File the Trend Report. Recommendation and maintenance action. | `status-check` (Q: what goes to Rotterdam and what goes to maintenance? A: keyhole is an operations note (plan high passes with the outage); the LNB is a maintenance ticket with GW-01 derated by 4 dB until replaced; documentLine 'Recommendation: derate GW-01 4 dB, priority collects to SH-02, LNB replacement ticket raised.', documentSection 'Recommendation') | 6 | S0892, T1606, S0646 | 25 |

**Dialog beats.** intro (Anneke text: "Tuesday's pass log makes no sense, look at it");
obj 3 (Anneke: "So the best pass is the worst pass. Noted for the planners"); obj 5
(Fiona: "Mine's at 62 K. Yours is cooking"); obj 6 (Fiona: "I'll take the collect");
obj 7 close.

**RF.** Act 1: 61799-class geometry (mm 14.9, ~500 km, max el ~86 deg); the regression
test asserts `offAxisDeg > 0.2` and C/N < 8 dB within 15 deg of culmination, with
recovery on the descending leg. `maxCNRatio 6` must be re-measured against the settled
C/N at culmination (the test shows it goes well under 8). Act 2: S2 geometry (761 km,
171.4 dB); nominal peak 10.9 dB; with `lnaNoiseFigure 2.2` expect ~7.0 dB (measure; if
the drop is not 3 to 4 dB, tune the NF so the shortfall is unmistakable but the lock
still holds).

**Pass windows** (epoch 2027-03-29T13:00:00Z, galway): SAR-2 61702 (scenario-local
zenith bird) AOS T+3.5, max el 86, dur ~12.5, mm 14.9, incl 97.6; SAR-1 61701 AOS T+22,
max el 28, dur ~7.5, mm 15.6, incl 97.2. Why: the keyhole needs > 80 deg; the LNB act
needs the exact S2 geometry so the survey worksheet is the one the operator already knows.

**Failure modes.** Blaming the ephemeris (panel shows nominal; quiz deducts); trying to
"fix" the LNB by power-cycling (noise temp starts at 2x nominal and settles back to
190 K: worse, then the same); moving the collect without checking SH-02; leaving the
keyhole in the report as a fault.

### S14 - Atlantic Low / Weather Reallocation Judgment

**Situation.** A deep low is crossing Ireland: sleet at Galway from shift start, clearing
by early afternoon. Erik's priority-1 collect on SAR-2 falls in the worst of it at
T+4; a priority-2 SAR-1 window at T+12 may be workable if the feed is kept clear. Fiona
has sky at Shetland for the next two hours.

**Characters:** Fiona (intro, weather beats), Erik (decision, close). 5 clips.

**Settings.** `groundStations: [gw01, sh02]`; `satellites: [sar1, sar2]`;
`weatherEvents: [{id 'gw-atlantic-low', groundStationId 'GW-01', type 'hail', severity
'severe', startTime 0, duration 3600, linkMarginDegradation 10}]` (ice accumulation:
10 dB max, tau 720 s; heater melts 1 dB/min; the `linkMarginDegradation` field is
informational here); `contactSchedule {stationIds ['GW-01','SH-02'],
requiredPriorityAtOrAbove 2, contacts [{id 'W-SAR2-GW', 61702, prio 1, 240-660},
{id 'W-SAR2-SH', 61702, prio 1, 330-780}, {id 'W-SAR1-GW', 61701, prio 2, 720-1170},
{id 'W-SAR1-SH', 61701, prio 2, 820-1290}]}`; `commanding` absent; `timeSkip`.

**Objectives.**

| # | id | title / description | conditions | prereq | nice | pts |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | review-mission-brief | Read the Weather Brief. | `mission-brief-opened`; `status-check` (Q: Ku rain fade at 12 GHz for a 25 mm/h cell at 30 deg: order of magnitude? A: several dB, and sleet on the feed adds to it; the budget has 3 dB of margin, so the collect at T+4 will not close from Galway) | - | K0645, K0721 | 5 |
| 2 | protect-the-feed | Protect the Feed. Heater on now; every minute it is off costs you a decibel later. | `feed-heater-enabled{}` M (GW-01) | 1 | S0421, T0431 | 10 |
| 3 | reallocate-the-collect | Reallocate the Collect. The P1 SAR-2 window cannot be worked from Galway in this cell. Give it to Shetland and keep the plan valid. | `tab-active{tab 'contact-schedule'}` H; `contact-assigned{contactId 'W-SAR2-SH', groundStationId 'SH-02'}` M; `contact-plan-valid{}` M | 1 | K0721, K0689, T0129 | 25 |
| 4 | decide-the-ride-out | Decide the Ride-Out. The P2 SAR-1 window at T+12: keep it at Galway or hand it over too? | `status-check` (Q: with the heater on since T+2 and the cell easing, what is the T+12 call? A: keep it at Galway: accumulated loss is under 2 dB and melting, budget margin covers it; handing every window to Shetland loses capacity you have; if the heater had stayed off it would be 6 dB and the answer flips) | 2, 3 | K0721, S0807 | 15 |
| 5 | ride-it-out | Ride It Out. Work the SAR-1 window from Galway. AOS T+12. | `antenna-tracking-mode-set{'program-track'}` M; `receiver-signal-locked{modemNumber 1, obs(rx-analysis)}` M; `receiver-snr-threshold{modemNumber 1, minCNRatio 8, obs(rx-analysis)}` M | 4 | T0153, S0421, K0740 | 30 |
| 6 | shetland-confirms | Shetland Confirms the Collect. `groundStation: 'SH-02'` | `ground-station-selected{groundStationId 'SH-02'}` H; `status-check` (Q: Fiona reports the P1 collect decoded at 10 dB. What closes the loop with Erik? A: the collect, the site it came from, and that the weather decision cost nothing he cares about) | 3 | S0478, K0689 | 10 |
| 7 | weather-log | Close the Weather Log. | `status-check` (Q: what is the standing rule you write down? A: heater on at the first precipitation warning, not at the first fade; reallocate P1 windows that fall inside a cell; ride out P2 windows on measured margin) | 5, 6 | K0721, S0575, K0645 | 15 |

**Dialog beats.** intro (Fiona text 10:52: "You've got the ugly end of it. I've got sky
till two"); obj 2 (Fiona: "Heater? Good. Mine's been on since dawn"); obj 3 (Erik: "I
don't care which dish, I care about the 11:04 collect"); obj 5 (Fiona: "Told you it'd
clear"); obj 7 close (Erik).

**RF.** Ice accumulation with heater off: 1.5 dB at T+2, 2.8 dB at T+4, 4.9 dB at T+8,
6.3 dB at T+12. Heater on at T+2: ~1.5 dB melts by T+3.5, no further accumulation, the
T+12 pass sees the nominal ~11 dB. Heater never enabled: T+12 peak ~4.7 dB, no lock.
Assert both curves in the harness.

**Pass windows** (epoch 2027-04-02T11:00:00Z, galway): SAR-2 61702 AOS T+4.0, max el 26,
dur ~7 (the collect nobody works from Galway); SAR-1 61701 AOS T+12.0, max el 30, dur
~7.5. Why: the P1 window must sit inside the first 8 min of accumulation so the
reallocation is the only sane call, and the P2 window must sit where the heater decision
changes the outcome.

**Failure modes.** Heater on late (objective 5 marginal or lost); assigning W-SAR2-GW
to GW-01 and W-SAR2-SH unassigned (plan valid but the collect is lost; objective 3
requires SH-02); handing both windows to Shetland (objective 5 still requires the Galway
decode); time-skipping to T+12 with the heater off.

### S15 - Rotation Day / Fleet COMSEC Under Tempo

**Situation.** Fleet-wide command-key rotation is ordered for today by Rotterdam and has
to happen between passes: no command may be sent on the retiring key after the SAR-1
window, and the first post-rotation command has to reach SAR-2 inside its window to
prove the new key on orbit. Anneke's order is in the audit log; the day plan still has
to be built and Fiona still needs her contacts.

**Characters:** Anneke (intro, rotation beats), Fiona (plan beat). 5 clips.

**Settings.** `groundStations: [gw01, sh02]`; `satellites: [sar1, sar2]`;
`contactSchedule {stationIds ['GW-01','SH-02'], requiredPriorityAtOrAbove 2, contacts
[{id 'R-SAR1-GW', 61701, prio 1, 210-660}, {id 'R-SAR1-SH', 61701, prio 2, 300-760},
{id 'R-SAR2-GW', 61702, prio 1, 1140-1560}, {id 'R-SAR2-SH', 61702, prio 2, 1230-1680}]}`;
`commanding {groundStationId 'GW-01', targetNoradId 61702, windowStartS 1160, windowEndS
1540 (the SAR-2 pass only), requireDopplerComp true, requireValidKey true, commands [{id
'KEY-VERIFY', label 'Verify command-link key'}, {id 'REC-PLAYBACK'}, {id 'PLD-SAFE'}]}`;
`security {accounts [op-charlie, op-fiona, op-anneke (Constellation Ops, remote),
svc-monitor], events [routine logins/config ..., {id 'evt-rotation-order', timestampLabel
'05:40 UTC', actor 'op-anneke', action 'Fleet key rotation ordered: retire KEY-2027-Q1
after SAR-1 window, activate KEY-2027-Q2 before SAR-2 window', category 'command',
severity 'warning', isAnomaly false}, {id 'evt-key-load', timestampLabel '06:15 UTC',
actor 'op-anneke', action 'KEY-2027-Q2 material loaded to GW-01 COMSEC (inactive)',
category 'command', severity 'info'}]}`; `timeSkip`.

**Objectives.**

| # | id | title / description | conditions | prereq | nice | pts |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | review-mission-brief | Read the Rotation Order. | `mission-brief-opened`; `status-check` (Q: what is forbidden between "retire" and "activate"? A: any command: a key in rotation is not a valid key and the bird rejects it) | - | K0645, K0876 | 5 |
| 2 | acknowledge-the-order | Acknowledge the Order in the Log. | `tab-active{tab 'security-console'}` H; `audit-log-reviewed{}`; `security-event-acknowledged{eventId 'evt-rotation-order'}` M | 1 | K0876, S0844 | 10 |
| 3 | build-the-plan | Build the Day Plan. Four contacts, two sites, no double-booking. | `contact-plan-valid{}` M; `contact-assigned{contactId 'R-SAR2-GW', groundStationId 'GW-01'}` M (the command contact must be Galway's) | 1 | K0689, T0129 | 15 |
| 4 | receive-pass-on-old-key | Work the SAR-1 Window (receive only). AOS T+3.5. Decode; do not command. | `antenna-tracking-mode-set{'program-track'}` M; `receiver-signal-locked{modemNumber 1, obs(rx-analysis)}` M; `receiver-snr-threshold{modemNumber 1, minCNRatio 8, obs(rx-analysis)}` M | 2, 3 | T0153, S0421 | 15 |
| 5 | rotate-the-key | Rotate the Key Between Passes. Begin, then complete the rotation on the TT&C console before the SAR-2 window opens at T+19.3. | `tab-active{tab 'commanding'}` H; `key-rotation-completed{}` M | 4 | K0876, K0874, S0077 | 25 |
| 6 | prove-the-new-key | Prove the New Key on Orbit. SAR-2, AOS T+19. Doppler comp, modem, HPA, KEY-VERIFY acknowledged before LOS. | `antenna-tracking-mode-set{'program-track'}` M; `uplink-doppler-comp-enabled{}` M; `tx-modem-transmitting{modemNumber 1}` M; `hpa-enabled{}` M; `command-acknowledged{commandId 'KEY-VERIFY'}` | 5 | K0876, T1567, S0593 | 35 |
| 7 | close-comsec | Close the COMSEC Record. | `status-check` (Q: Anneke asks for the rotation evidence. What is it? A: the order acknowledged in the log, the rotation completed on the console, and a command acknowledged on the new key inside the window; any one alone is not proof) | 6 | K0876, K0645, S0593 | 15 |

**Dialog beats.** intro (Anneke text 05:41: order, "old key dies after SAR-1, new key
proven on SAR-2, no gaps"); obj 3 (Fiona: "Give me the Shetland halves, I'll stay off
the uplink"); obj 5 (Anneke: "Rotation complete on my side. Your window opens in four
minutes"); obj 6 (Anneke: "KEY-VERIFY acked. Fleet is on Q2"); obj 7 close.

**Tempo.** The rotation must happen in the ~9 min gap between SAR-1 LOS (T+11) and the
SAR-2 window (T+19.3); `timeSkip` may not offer a skip (gap < 300 s after leadTime). A
command sent during Pending Rotation is rejected `key-invalid` and shows in the console
history; it is not asserted (no condition can read a rejection without `custom`), the
close-out quiz names it as the failure to avoid.

**Pass windows** (epoch 2027-04-06T07:00:00Z, galway): SAR-1 61701 AOS T+3.5, max el 27,
dur ~7.5; SAR-2 61702 AOS T+19.0, max el 25, dur ~7. Why: a real gap for the rotation and
a second bird for the proof; the phase-B assertion that the command window sits inside
the pass nearest scenario start must be relaxed to "inside SOME authored pass" for this
scenario (Phase B task).

**Failure modes.** Completing the rotation before working SAR-1 (allowed; the point is
the discipline, not the order, but objective 4 still has to be decoded); sending
KEY-VERIFY during Pending Rotation (rejected, retry costs time); starting the rotation
after T+19 and missing the window; assigning R-SAR2-GW to Shetland (command originates
from `commanding.groundStationId`, but the plan condition forces the Galway half).

### S16 - Cascade / Network Multi-Failure (Phase 2 capstone)

**Situation.** Midday, densest window of the week: SAR-1 command contact at T+9, SAR-2
slipped 90 s late overnight and now overlaps it, Erik has both. At shift start GW-01's
GPSDO is in holdover (an overnight GNSS antenna fault; the tech left the GNSS input
switched down) and SH-02's BUC is at 88 degrees after a cooling-fan alarm. Three
problems, one operator, twelve minutes.

**Characters:** Fiona (intro, SH-02 beats), Anneke (command), Erik (SLA close),
optional Charlie sign-off text. 6 clips (7 with Charlie).

**Settings.** `groundStations: [gw01Holdover, sh02HotBuc]` where `gw01Holdover =
structuredClone(galwayGroundStation)` with `rfFrontEnds[0].gpsdo: {isInHoldover true,
isLocked false, isGnssSwitchUp false, gnssSignalPresent true, satelliteCount 0,
holdoverDuration 5400, holdoverError 6}` and `sh02HotBuc = structuredClone(shetland...)`
with `rfFrontEnds[0].buc.temperature: 88`; `satellites: [sar1, sar2]`; `contactSchedule
{stationIds ['GW-01','SH-02'], requiredPriorityAtOrAbove 1, contacts [{id 'C-SAR1-GW',
61701, prio 1, 540-990}, {id 'C-SAR1-SH', 61701, prio 2, 640-1100}, {id 'C-SAR2-GW',
61702, prio 1, 840-1260}, {id 'C-SAR2-SH', 61702, prio 1, 930-1350}]}` (C-SAR1-GW and
C-SAR2-GW overlap: the slipped pass); `commanding {groundStationId 'GW-01', targetNoradId
61701, windowStartS 560, windowEndS 970, requireDopplerComp true, requireValidKey true,
commands [{id 'REC-PLAYBACK'}, {id 'PLD-SAFE'}, {id 'OBC-WDT-RESET'}]}`; `workingDocument
{title 'Shift Incident and Impact Report'}`; `timeSkip` off (nothing to skip).

**Objectives.**

| # | id | title / description | conditions | prereq | nice | pts |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | review-mission-brief | Take the Shift. Three alarms and a slipped pass are in the handover. | `mission-brief-opened`; `status-check` (Q: order of work? A: reference first (nothing is trustworthy on holdover), then the plan (it decides which site needs which hardware), then Shetland's BUC (receive-only contacts do not need it), then the passes; pointPenalty 0) | - | K0645, S0807 | 5 |
| 2 | restore-galway-reference | Restore the Galway Reference. GPSDO is in holdover with the GNSS input switched down. Do not power-cycle it: a warm-up is ten minutes you do not have. | `tab-active{tab 'gps-timing'}` H; `gpsdo-gnss-locked{obs(gps-timing)}`; `gpsdo-not-in-holdover{}` M; `gpsdo-locked{}` M | 1 | S0677, T0531, K0741 | 20 |
| 3 | resolve-the-slip | Resolve the Slipped Pass. SAR-2 now overlaps SAR-1 on Galway. Split them; the command contact stays on GW-01. | `tab-active{tab 'contact-schedule'}` H; `contact-assigned{contactId 'C-SAR1-GW', groundStationId 'GW-01'}` M; `contact-assigned{contactId 'C-SAR2-SH', groundStationId 'SH-02'}` M; `contact-plan-valid{}` M | 1 | S0807, K0689, T0129 | 20 |
| 4 | cool-the-shetland-buc | Cool the Shetland BUC. Mute it (remove drive), keep it powered, let it come down under 70 degrees. Shetland's contact today is receive-only. `groundStation: 'SH-02'` | `ground-station-selected{groundStationId 'SH-02'}` H; `buc-muted{}` M; `buc-temperature-normal{maxTemperature 70, obs(tx-chain)}` | 1 | S0677, T0531, K0740 | 20 |
| 5 | command-contact | Work the Command Contact. SAR-1 AOS T+9. Doppler comp, modem, HPA, REC-PLAYBACK acknowledged. | `antenna-tracking-mode-set{'program-track'}` M; `uplink-doppler-comp-enabled{}` M; `tx-modem-transmitting{modemNumber 1}` M; `hpa-enabled{}` M; `command-acknowledged{commandId 'REC-PLAYBACK'}` | 2, 3 | T1567, S0421, K0773 | 30 |
| 6 | decode-under-load | Decode Under Load. Lock the SAR-1 downlink and hold 8 dB through the overlap. | `receiver-signal-locked{modemNumber 1, obs(rx-analysis)}` M; `receiver-snr-threshold{modemNumber 1, minCNRatio 8, obs(rx-analysis)}` M | 5 | T0153, K0740 | 20 |
| 7 | shetland-takes-sar2 | Shetland Takes SAR-2. Confirm Fiona's receive-only contact went ahead on a muted BUC. `groundStation: 'SH-02'` | `ground-station-selected{groundStationId 'SH-02'}` H; `buc-temperature-normal{maxTemperature 70}`; `status-check` (Q: why was Shetland able to take SAR-2 with a BUC alarm? A: the contact is receive-only; the BUC is the transmit chain; mute, cool, and keep the receive path working) | 3, 4 | T0531, S0807 | 15 |
| 8 | impact-report | Write the Impact Report. Two lines for Erik, one for maintenance. | `status-check` x2 with documentLine: (a) customer impact (documentSection 'Impact': both P1 contacts captured, zero missed tasking, command acknowledged on time), (b) actions and open items (documentSection 'Actions': GW-01 GNSS antenna fault ticket, SH-02 BUC fan ticket, slip root cause to Rotterdam) | 6, 7 | T1606, T1277, S0575 | 20 |

**Dialog beats.** intro (Fiona text 11:58: "Your GPSDO's been in holdover since four,
my BUC's cooking, and SAR-2 moved. Enjoy"); obj 2 (Anneke: "Reference is back?
Good, the command contact is yours"); obj 4 (Fiona: "Muted. She's coming down"); obj 5
(Anneke: "Playback acked"); obj 7 (Fiona: "SAR-2 in the can on a hot BUC and a cold
tea"); obj 8 close (Erik: "Both collects. I never noticed"); optional Charlie text:
"Heard it was a busy lunch. Qualified means nobody notices."

**RF / faults.** GPSDO: switch DOWN + signal present -> operator flips the switch ->
`updateLockStatus_` locks (verify `achieveLock_` clears `isInHoldover`; if not, the
fallback is `gpsdo-gnss-locked` + `gpsdo-locked` only, dropping `gpsdo-not-in-holdover`
from objective 2 and noting the model gap). BUC: 88 degC start, muted target 25 degC,
tau ~5.5 min -> under 70 degC in ~110 s. Downlink: S1 envelope.

**Pass windows** (epoch 2027-04-09T12:00:00Z, galway): SAR-1 61701 AOS T+9.0, max el 30,
dur ~7.5; SAR-2 61702 AOS T+14.0, max el 22, dur ~7 (overlapping the SAR-1 pass by ~2.5
min: the slip). Why: the overlap is the third failure; T+9 leaves exactly enough time to
do the GPSDO, the plan and the BUC if the operator does not dither.

**Failure modes.** Power-cycling the GPSDO (10 min warm-up, command window lost);
powering the BUC off (cools 5x slower, and `buc-temperature-normal` needs power);
assigning C-SAR2-GW to Galway (conflict, plan INVALID); trying to work SAR-2 from
Galway after SAR-1 (nothing stops it, but Shetland's contact goes unworked and objective
7 explains why that was the wrong trade); commanding on holdover (objective 5 is gated on
objective 2).

---

## Engine gaps (no engine work is proposed; each has the alternative used above)

| # | Design plan asked for | What exists | Alternative used |
| --- | --- | --- | --- |
| G1 | S14 "Ku rain fade" with `rain` weather + feed heater | `rain` events are inert in the RF chain; only `snow`/`ice`/`hail` accumulate feed loss (heater melts it) | Stage the Atlantic low as `hail` (sleet) at GW-01, severe; rain-fade arithmetic lives in quiz 1. A later engine pass could apply `linkMarginDegradation` for `rain` as sky-noise the way sun-transit does; not needed for S14. |
| G2 | S15 "mid-rotation key mismatch on SAR-2" + `fault-cleared` | `FaultInjector`/`CryptoModule.inject*` have no scenario hook; `CommandingManager` key states are Valid / Pending Rotation / Zeroized, one target per scenario | The tempo IS the failure: rotation must fit the inter-pass gap and the proof command must ACK in the SAR-2 window; a rejected `key-invalid` command is visible in the console history and named in the close-out quiz. `fault-cleared` is not used anywhere in S9-S16 (nor in shipped S8). |
| G3 | S13 `pass-history-reviewed` (proposed new type) | No pass-history UI or condition | Trend evidence is the brief's pass log + a live measurement (`link-budget-computed`, `receiver-snr-threshold`) + Working Document lines via `status-check{documentLine}`. Zero new types. |
| G4 | S11 "widened beacon search" | `beaconSearchBwHz` exists on the antenna but has no condition type | `antenna-beacon-frequency-set` + `antenna-beacon-locked` cover the acquisition; the search width is a brief note. Not worth a type. |
| G5 | S16 "schedule conflict from a slipped pass" as an event | Contacts are static; nothing re-times a window at T+x | Author the post-slip windows; the brief carries the pre-slip plan so the operator notices the overlap. |
| G6 | Timed equipment faults (BUC over-temp mid-window, GPSDO holdover mid-window) | Only `hardwareFaultEvents` (TX modem) is timed; everything else is initial state | Stage both S16 faults at T+0 through scenario-local station configs. The thermal/holdover models make them recoverable by the correct action and punish the wrong one (power cycling). |
| G7 | Command ACK gated on EIRP (S10) | ACK depends on window, Doppler comp, key only | `hpa-back-off-set` + `hpa-not-overdriven` + `buc-not-saturated` enforce the EIRP work directly. |

## Cross-tier tables

### Mechanic coverage

| Mechanic | S9 | S10 | S11 | S12 | S13 | S14 | S15 | S16 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| M1 link budget | | x | | x | x | | | |
| M2 uplink ops / commanding | | x | | x | | | x | x |
| M3 contact scheduling | x | | | | x | x | x | x |
| M4 space events / ephemeris | | | x | | (panel check) | | | |
| M5 key ops | | | | | | | x | |
| M6 security console | | | | | | | x | |
| M7 TRANSEC / M8 GNSS threat | not in this tier (Phase 3 debuts) | | | | | | | |
| Weather / feed heater | | | | | | x | | |
| Working Document | | | x | x | x | | | x |
| Two stations | x | | | | x | x | x | x |
| SAR-3 | | | x | x | | | | |
| Keyhole geometry | | | | | x | | | |

### Condition-type usage (all existing types)

| Type | Scenarios |
| --- | --- |
| mission-brief-opened, status-check | all |
| tab-active (hidden) | S10, S11, S13, S14, S15, S16 |
| antenna-tracking-mode-set | S9, S10, S11, S12, S13, S14, S15, S16 |
| signal-detected | S10, S11, S12, S13 |
| antenna-beacon-frequency-set, antenna-beacon-locked | S11 |
| receiver-signal-locked, receiver-snr-threshold (minCNRatio) | S9, S10, S12, S13, S14, S15, S16 |
| receiver-snr-threshold (maxCNRatio) | S13 |
| link-budget-computed | S10, S12, S13 |
| link-margin-met | S10, S12 |
| uplink-doppler-comp-enabled, tx-modem-transmitting, hpa-enabled, command-acknowledged | S10, S12, S15, S16 |
| hpa-back-off-set, hpa-not-overdriven, buc-not-saturated | S10 (hpa-not-overdriven also S9) |
| key-rotation-completed | S15 |
| audit-log-reviewed, security-event-acknowledged | S15 |
| contact-assigned, contact-plan-valid | S9, S13, S14, S15, S16 |
| ground-station-selected (hidden) | S9, S13, S14, S16 |
| ephemeris-updated | S11 |
| gpsdo-locked, gpsdo-not-in-holdover | S9, S16 |
| gpsdo-gnss-locked | S16 |
| lnb-thermally-stable | S9 |
| lnb-noise-performance | S13 |
| buc-temperature-normal | S9, S16 |
| buc-muted | S16 |
| feed-heater-enabled | S14 |
| NEW types | none |
| custom | none (deliberately) |

Not used from the design plan's S9-S16 column: `fault-cleared` (G2), `rx-key-status`/
`tx-key-status` (crypto module not scenario-stageable; `key-rotation-completed` +
`command-acknowledged` carry the proof), `pass-history-reviewed` (G3).

### NICE coverage

All codes below are present in `scripts/nice-catalog.json` (checked 2026-09-10 with a
one-off script against the 542-code catalog: every design-plan S9-S16 code resolves;
**none missing**). Primary code first per objective; 2-3 per objective.

| Scenario | Primary (design plan) | Also claimed | New to product (not in C1/C2 S1-S8) |
| --- | --- | --- | --- |
| S9 | T0153, T0431, S0421 | K0741, K0737, K0689, T0129, K0740, S0478, T1580 | S0478, T1580 |
| S10 | S0478, T1580, K0740 | T0080, S0015, S0675, K0064, T1567, K0773, T0153, K1032 | S0675, K0064 |
| S11 | T0513, S0630, K1032 | T1138, S0421, T1611, S0842, K0645 | T0513, S0630, T1611 |
| S12 | T1092, T1611, S0842, T1506 | T0080, S0015, T1567, K0773, T0153, S0478 | T1092, T1506 |
| S13 | T0349, S0646, S0892, K0064 | K0740, K1032, K0739, T0531, T0431, K0689, S0675, T1606 | T0349, S0646, S0892, K0739, T0531, T1606 |
| S14 | K0721, S0675, K0689 | S0421, T0431, T0129, S0807, T0153, K0740, S0478, S0575, K0645 | K0721, S0807, S0575 |
| S15 | K0876, S0844, S0593 | K0874, S0077, K0689, T0129, T0153, T1567, K0645 | K0876, S0593 |
| S16 | T0531, S0677, S0807 | K0741, K0689, T0129, T1567, K0773, T0153, K0740, T1606, T1277, S0575 | S0677, T1277 |

Estimated new distinct codes this tier: ~22 (design plan §7.2 target for P2: ~18).
Catalog descriptions to keep in mind when writing objective JSDoc (they differ from
the design plan's glosses): T0129 = "Integrate new systems into existing network
architecture"; K0689 = "Knowledge of network infrastructure principles and practices";
K0737 = "Knowledge of bandwidth management tools and techniques"; T1567 = "Configure
system hardware, software, and peripheral equipment"; T0081 = "Diagnose network
connectivity problems". S1-S8 already claim these; S9-S16 uses them where the catalog
text fits, and `npm run nice-coverage` is the gate.

## Pass-window authoring (mechanical step)

One `author-passes.mjs` config per scenario, station `galway {lat 53.27, lon -9.05, alt
0.02}`, cosparId `27015A` (SAR-3: `27031A`). Requests:

| Scenario | epoch | requests (name / noradId / aosOffsetMin / maxElDeg / durationMin / incl / mm) |
| --- | --- | --- |
| S9 | 2027-03-17T06:10:00Z | SAR-1 61701 8.0 30 7.5 [97.2] [15.6]; SAR-2 61702 22.0 25 7.0 [98.4] [15.6] |
| S10 | 2027-03-18T15:30:00Z | SAR-1 61701 5.0 15 5.5 [97.2] [15.6] southbound; SAR-2 61702 55.0 25 7.0 (parked, not worked) |
| S11 | 2027-03-22T09:00:00Z | SAR-3 61703 9.0 32 7.5 [97.6] [15.6]; SAR-1/SAR-2 > 40 min out |
| S12 | 2027-03-24T10:00:00Z | SAR-3 61703 6.0 28 7.5 [97.6] [15.6] |
| S13 | 2027-03-29T13:00:00Z | SAR-2 (zenith) 61702 3.5 86 12.5 [97.6] [14.9]; SAR-1 61701 22.0 28 7.5 [97.2] [15.6] |
| S14 | 2027-04-02T11:00:00Z | SAR-2 61702 4.0 26 7.0 [98.4] [15.6]; SAR-1 61701 12.0 30 7.5 [97.2] [15.6] |
| S15 | 2027-04-06T07:00:00Z | SAR-1 61701 3.5 27 7.5 [97.2] [15.6]; SAR-2 61702 19.0 25 7.0 [98.4] [15.6] |
| S16 | 2027-04-09T12:00:00Z | SAR-1 61701 9.0 30 7.5 [97.2] [15.6]; SAR-2 61702 14.0 22 7.0 [98.4] [15.6] |

Paste each emitted TLE into the scenario's `createMeridianSarN(...)` call; copy the
printed AOS/max-el/LOS into the scenario JSDoc, the contact windows (Galway = printed
AOS/LOS rounded to 10 s; Shetland = +90/+150 s), the commanding window (AOS+20 ..
LOS-20), and the Phase 2 pass-timing unit test. S11's `initialTle` is derived by hand
from the emitted `newTle` (RAAN +0.3, MA +2.0) and verified with a `verify-only` entry.

## Sub-phases (execute in order; check off as completed)

### Phase A - Harness and tooling (before any scenario file)

- [ ] `satellites.ts`: `createMeridianSar1/2/3(tle)` factories (shared transponder configs, fresh `OrbitalSatellite` per call); SAR-3 RF plan constants (video 11760 / beacon 11785 / TT&C 14065 MHz).
- [ ] `test/campaigns/nats-eu-phase-c-validation.test.ts` (Phase 2 harness): per-scenario pass flight under real program-track, `linkBudget` worksheet-vs-truth, reachability, the S13 keyhole crater, the S14 ice-vs-heater curves, the S16 GPSDO switch-up recovery and BUC cool-down. Relax the phase-B "window inside the first pass" assertion to "inside some authored pass" for S15.
- [ ] Live checks (grep-for-UI-callers rule): `antenna-beacon-locked` path on the Ku tracker (S11), which tab hosts the LNB noise readout (S13 `observationTab`), GNSS switch control on the GPS timing tab (S16), BUC mute on SH-02 from the Galway console (S16).
- [ ] Measure S10's 15 deg peak; fix `expectedCNRDb` (or raise to 18 deg).
- [ ] Exit: harness green on the authored TLEs; every "measure" placeholder above replaced by a number.

### Phase B - S9-S12 (next sprint step)

- [ ] Author passes for S9-S12 (table above); pass-timing unit tests.
- [ ] S9 Morning Constellation (7 objectives / 95 pts).
- [ ] S10 Priority Tasking (7 / 110).
- [ ] S11 LEOP: Launch Day (6 / 105) + SAR-3 bird.
- [ ] S12 LEOP: Commissioning (7 / 125).
- [ ] Register all four (campaign array + flat `SCENARIOS` + registration test); `missionBriefUrl` set from the first line (`campaign-2/scenario-N`).
- [ ] `npm run type-check`, `npx vitest run`, `npm run nice-coverage` green.
- [ ] Playwright full-completion specs S9-S12 (use `advanceMissionClockToUtc`; final objective asserts the modal, not the checklist row).
- [ ] Exit: S9-S12 completable live, one at a time (E2E timing note from phase 12).

### Phase C - S13-S16

- [ ] Author passes for S13-S16; S13 zenith bird verified against the keyhole regression.
- [ ] S13 The Numbers Don't Lie (7 / 130), degraded GW-01 config.
- [ ] S14 Atlantic Low (7 / 110).
- [ ] S15 Rotation Day (7 / 120).
- [ ] S16 Cascade (8 / 150), fault-staged station configs.
- [ ] Register, tests, coverage, E2E as Phase B.
- [ ] Exit: full S9 -> S16 sequential playthrough green.

### Phase D - Briefs, audio decision, metadata

- [ ] Mission-brief MDX `campaign-2/scenario-9..16` in signal-range-docs (`src/content/docs/campaign-2/`, not `docs/`), sidebar entries, `astro check` 0 errors, commit + deploy the docs repo.
- [ ] Dialog clips: text now; VO per open question 1.
- [ ] `natsEuCampaignData.totalDuration` recomputed (S1-S16 ~ 400-500 min); description mentions the qualified tier.
- [ ] Retro -> `retrospectives/phase-13-nats-eu-qualified-tier-retro.md`; PROJECT_STATE + memory.

## House gotchas that apply to this phase

- **`missionBriefUrl` from line one** or there is no checklist (phase-6 retro, regression-tested).
- **Grep for UI callers before authoring against a mechanic** (the M4 lesson); Phase A lists the four checks.
- **Mission clock vs sim clock in E2E:** `spaceEvents`, `weatherEvents`, `commanding` windows and `contactSchedule` all run on the mission clock; specs must use `advanceMissionClock`/`advanceMissionClockToUtc`, never `advanceSimClock` alone.
- **`freezesScenarioTimer` pauses the mission clock**, so S11's `maneuverAtS 45` fires 45 s after the brief closes, and S14's ice starts accumulating only then.
- **`maintainDuration` ticks on real update deltas**: the S10 30 s hold cannot be skipped; keep such holds short.
- **`requiresObservation` on every passive check** (gpsdo, lnb, buc temperature, snr) or the row is pre-ticked before the operator looks.
- **Equipment conditions read the objective's `groundStation`**; SH-02 objectives need `groundStation: 'SH-02'` and a hidden `ground-station-selected` so the operator is looking at the station being checked.
- **Do not power-cycle in the fiction either**: BUC off cools slower and fails `buc-temperature-normal`; GPSDO off costs a 10 min warm-up. S16's brief says so.
- **The draggable checklist can intercept clicks** in Playwright; use `domClick()`.
- **The final objective's checklist row never repaints**; specs assert the Mission Complete modal.
- **`isOptional` works now but is invisible in the checklist**; this tier uses none.
- **Scenario-local station clones** must be `structuredClone`, never spread (nested state is mutated at runtime).

## Out of scope

Per-station propagation for SH-02 (tracking from Shetland), rain-fade physics for
`rain` events, scenario-stageable crypto faults, a pass-history/trend console, SAR-4,
timed BUC/GPSDO faults, TRANSEC and GNSS spoofing (Phase 3), Priya Sharma, VO recording,
new condition types.

## Open questions for Ted

1. **Audio.** Text-only clips (`audioUrl: ''`) for S9-S16 as in C3, or hold scenario
   merges until a VO pipeline exists for Erik/Anneke/Fiona? This plan assumes text now.
2. **Keyhole placement.** Folded into S13 as Act 1 (35 min scenario). If you would rather
   keep S13 to the LNB story, the fallback is a standalone optional scenario after S13
   with id `nats-eu-scenario13b`; the ids S14-S16 then stay as designed. Recommend the fold.
3. **S14 fiction.** Sleet/hail rather than rain so the feed heater and the ice model do
   real work. Acceptable, or is a small engine change (apply `rain` degradation as sky
   noise) preferred before S14 is authored?
4. **S15 without a staged mismatch.** The recast makes the rotation tempo the exercise.
   If a real per-bird key mismatch matters, it needs a `commanding` extension (per-target
   key state + a scheduled `keyEventAtS`); that is Phase 3 work if at all.
5. **Difficulty labels.** S13-S16 as `advanced` (first use in C2) or keep the whole
   campaign `intermediate` as S1-S8 are?
6. **Docs repo path.** Briefs go to `signal-range-docs/src/content/docs/campaign-2/`
   (the sprint doc's `docs/campaign-2/` is wrong); confirm the C2 S2-S8 briefs from sprint
   2B are committed before S9-S16 briefs are added.
7. **SAR-3 COSPAR id.** `27031A` assumed for a March 2027 launch; any preference?

## Status log

- [2026-09-10] Plan authored from the design plan §3 Phase 2 table, the shipped S1-S8
  files, the condition catalog, the mechanic managers, and the Phase A/B retros. Zero new
  condition types; the zenith keyhole is folded into S13 as Act 1; three design-plan
  items recast because the engine cannot stage them from data (rain fade -> sleet/ice
  with the heater; key mismatch + `fault-cleared` -> rotation tempo and command proof;
  `pass-history-reviewed` -> Working Document + live measurement). All S9-S16 NICE codes
  resolve against the 542-code catalog. Not started. Next action: Phase A harness, then
  Phase B (S9-S12) per sprint step 2C.
