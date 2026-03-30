---
phase: 15-divided-kingdom-phase-2
plan: 01
subsystem: detection, scenarios, ui
tags: [detection, moral-conflict, baseline, kingdom-arc, conscience-layer, stance-triggers]

# Dependency graph
requires:
  - phase: 11-moral-conflict-detection-end-screen-ai-hooks
    provides: detection.js foundation with VALUE_FRAMEWORK_MAP and findMoralConflicts
  - phase: 12-ethical-framework-depth
    provides: Baseline.jsx with stance questions, kingdom-arc.js scenario library

provides:
  - detection.js with loyalty_vs_fairness key, updated VALUE_FRAMEWORK_MAP (PRD D-05 mapping), and 10 condition-specific STANCE_TRIGGERS
  - Baseline.jsx with revised Q2/Q3/Q4 question text and loyalty_vs_fairness key
  - kingdom-arc.js with R7 4th choice (Cultural Tribunal) and conscienceLayer on all 25 choices
affects: [FrameworkProfile, ConsequenceReveal, Play, Host, end-screen, moral-conflict-detection]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - STANCE_TRIGGERS array pattern: condition-specific triggers with matchCondition or matchFramework instead of generic framework-based checks
    - conscienceLayer field on every choice object: inner-voice reflection shown post-choice

key-files:
  created: []
  modified:
    - src/lib/detection.js
    - src/lib/__tests__/detection.test.js
    - src/pages/Baseline.jsx
    - src/lib/scenarios/packs/kingdom-arc.js

key-decisions:
  - "STANCE_TRIGGERS replaces generic stance blocks — each trigger fires only for a specific round+choiceIndex combination (or framework match), not for any round with that framework"
  - "VALUE_FRAMEWORK_MAP: loyalty→[virtue,care], honesty→[deontology], fairness→[distributive_justice] — fairness uses new distributive_justice tag for baseline-only conflict detection"
  - "Cultural Tribunal (choiceIndex 3) uses cultural_relativism framework tag — new tag not in CONFLICT_PAIRS, used for future relativism conflict detection"

patterns-established:
  - "STANCE_TRIGGERS pattern: each trigger has stanceKey + stanceAnswer + (matchCondition | matchFramework) + message"
  - "conscienceLayer: inner-voice string on each choice, shown in ConsequenceReveal as final beat"

requirements-completed: [DK2-01, DK2-02, DK2-03, DK2-04]

# Metrics
duration: 9min
completed: 2026-03-30
---

# Phase 15 Plan 01: Detection Rework + Conscience Layer Summary

**10 PRD-specified condition-specific conflict triggers in detection.js, loyalty_vs_fairness key rename across 3 files, and 25 conscienceLayer strings + Cultural Tribunal choice added to kingdom-arc.js**

## Performance

- **Duration:** ~9 min
- **Started:** 2026-03-30T00:01:39Z
- **Completed:** 2026-03-30T00:10:31Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Reworked detection.js: renamed `truth_over_relationship` → `loyalty_vs_fairness`, updated VALUE_FRAMEWORK_MAP to PRD D-05 spec, replaced 5 generic stance blocks with 10 condition-specific STANCE_TRIGGERS — each fires only for the exact round+choice the PRD specifies
- Revised Baseline.jsx Q2/Q3/Q4 question text and Q4 key per PRD D-05
- Added conscienceLayer field to all 25 choices across 8 scenarios in kingdom-arc.js, plus Cultural Tribunal (choiceIndex 3) to Round 7 with `cultural_relativism` framework tag
- All 71 detection tests passing (added 3 new condition-specific trigger tests)

## Task Commits

1. **Task 1: detection.js rework** - `73b1077` (feat)
2. **Task 2: Baseline.jsx key rename + text** - `02b5796` (feat)
3. **Task 3: kingdom-arc.js R7 choice + conscience layers** - `501bc4a` (feat)

## Files Created/Modified
- `src/lib/detection.js` - Key rename, updated VALUE_FRAMEWORK_MAP, 10 condition-specific STANCE_TRIGGERS
- `src/lib/__tests__/detection.test.js` - Updated for new VALUE_FRAMEWORK_MAP, renamed key, 3 new trigger tests
- `src/pages/Baseline.jsx` - Q2/Q3/Q4 revised text, Q4 key loyalty_vs_fairness
- `src/lib/scenarios/packs/kingdom-arc.js` - conscienceLayer on all 25 choices, Cultural Tribunal as R7 Choice IV

## Decisions Made
- STANCE_TRIGGERS array replaces the 5 generic stance blocks — old approach fired conflicts for any round with a matching framework; new approach fires only for the specific round+choice the PRD specifies (D-05)
- VALUE_FRAMEWORK_MAP `fairness` now maps to `['distributive_justice']` — new framework tag not in CONFLICT_PAIRS, used only for baseline-vs-choice value conflict detection
- VALUE_FRAMEWORK_MAP `honesty` now maps to `['deontology']` only (was `['deontology', 'virtue']`) — aligns with PRD's Honesty → Deontology mapping
- VALUE_FRAMEWORK_MAP `loyalty` now maps to `['virtue', 'care']` (was `['care']`) — aligns with PRD's Loyalty → Virtue/Care mapping

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Test mc5b initially failed because test used `fairness` as top value (maps to `distributive_justice`) but choice had `deontology`/`virtue` — VALUE conflict fired before stance trigger. Fixed by using `courage` (maps to `['virtue']`) so virtue is aligned and no VALUE conflict fires, allowing stance trigger to fire.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- detection.js is ready for Plans 02-05 which will wire conflict triggers to UI components
- conscienceLayer field is present on all choices for ConsequenceReveal to consume (Plan 02)
- Cultural Tribunal (R7 choiceIndex 3) ready for routing through existing game loop
- No blockers

---
*Phase: 15-divided-kingdom-phase-2*
*Completed: 2026-03-30*
