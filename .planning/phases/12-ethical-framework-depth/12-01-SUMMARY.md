---
phase: 12-ethical-framework-depth
plan: 01
subsystem: detection, baseline, scenarios
tags: [detection, trajectory, virtue-streak, consistency, stance-questions, rights-dimension, ethicalLens]

requires:
  - phase: 11-moral-conflict-detection-end-screen-ai-hooks
    provides: findMoralConflicts with 2 stance checks, computeProfile with dominant/counts/leastUsed
  - phase: 07-moral-profile-data-layer
    provides: Baseline.jsx with 2 stance questions, moral_values/moral_stances columns
  - phase: 08-multi-pack-system
    provides: 3 scenario packs with pack registry in scenarios.js

provides:
  - computeProfile returns trajectory, consistency_score, virtue_streak, virtue_heavy_count
  - findMoralConflicts handles all 5 stance keys (break_promise, truth_over_relationship, punish_innocent + existing 2)
  - Baseline.jsx with 5 stance questions shown at once after value ranking
  - All 3 packs have ethicalLens field
  - 9 scenarios tagged with rights_dimension, qualifying choices tagged rights_protective
  - Updated ScenarioPack/PackScenario/PackChoice typedefs

affects: [12-02, 12-03, FrameworkProfile, Host endSession, HostSetup pack cards]

tech-stack:
  added: []
  patterns:
    - "Weight-adjusted trajectory computation using moral_weight field"
    - "rights_dimension/rights_protective tagging on scenarios and choices"

key-files:
  created: []
  modified:
    - src/lib/detection.js
    - src/lib/__tests__/detection.test.js
    - src/pages/Baseline.jsx
    - src/lib/scenarios.js
    - src/lib/scenarios/packs/kingdom-arc.js
    - src/lib/scenarios/packs/real-world-modern.js
    - src/lib/scenarios/packs/futures.js

key-decisions:
  - "Weight-adjusted trajectory: moral_weight multiplier from scenario weight (low=1, medium=2, heavy=3) applied to framework counts for trajectory computation"
  - "9 rights_dimension scenarios tagged across 3 packs (3 per pack): kingdom-arc (Divided Harvest, Hollow Folk, Shackled Heart), real-world-modern (Group Chat, Eviction, Algorithm), futures (Feed, Queue, Log)"
  - "All 5 Baseline stance questions shown simultaneously after value ranking - no per-question gating"

patterns-established:
  - "rights_dimension boolean on scenario objects, rights_protective boolean on choice objects"
  - "Trajectory uses early (rounds <=2) and late (rounds >=5) split with weight-adjusted dominant framework"

requirements-completed: [BASELINE-01, BASELINE-02, BASELINE-03, TRAJECTORY-01, TRAJECTORY-02, TRAJECTORY-04, VIRTUE-01, RIGHTS-01, CULTURE-01]

duration: 6min
completed: 2026-03-30
---

# Phase 12 Plan 01: Data Layer Extensions Summary

**Extended detection.js with trajectory/virtue/consistency computation, expanded Baseline to 5 stance questions, tagged all 3 packs with ethicalLens and rights_dimension**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-30T14:56:23Z
- **Completed:** 2026-03-30T15:02:46Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- computeProfile now returns trajectory (early/late framework shift detection), consistency_score, virtue_streak, and virtue_heavy_count alongside existing dominant/counts/leastUsed
- findMoralConflicts handles all 5 stance keys with per-round dedup: break_promise, truth_over_relationship, punish_innocent added to existing ends_justify and lie_to_protect
- Baseline.jsx expanded from 2 to 5 stance questions, all shown at once after value ranking (no per-question gating)
- All 3 scenario packs tagged with ethicalLens field and rights_dimension on qualifying scenarios (3 per pack, 9 total)

## Task Commits

1. **Task 1: Extend detection.js** - `e1a557e` (feat)
2. **Task 2: Expand Baseline + ethicalLens + rights_dimension** - `14dbffa` (feat)

## Files Created/Modified
- `src/lib/detection.js` - Extended computeProfile with 4 new return fields, findMoralConflicts with 3 new stance checks
- `src/lib/__tests__/detection.test.js` - 22 new tests added (61 total, all passing)
- `src/pages/Baseline.jsx` - 3 new stance questions, guard updated from 2 to 5, removed per-question gating
- `src/lib/scenarios.js` - Updated typedefs with ethicalLens, rights_dimension, rights_protective
- `src/lib/scenarios/packs/kingdom-arc.js` - ethicalLens added, 3 scenarios tagged rights_dimension
- `src/lib/scenarios/packs/real-world-modern.js` - ethicalLens added, 3 scenarios tagged rights_dimension
- `src/lib/scenarios/packs/futures.js` - ethicalLens added, 3 scenarios tagged rights_dimension

## Decisions Made
- Weight-adjusted trajectory: moral_weight field (default 1 if missing) multiplies framework tag counts for trajectory computation. Heavy-round choices (weight 3) count 3x toward trajectory.
- Rights_dimension tagging criteria: any scenario where an individual or minority is at risk from group benefit. Tagged 3 per pack for consistent coverage.
- Removed per-question gating on Baseline (isQ2Disabled variable eliminated) per D-01: all 5 questions visible at once for faster completion.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing build failure: `npm run build` fails due to missing `KingdomCanvas.jsx` import in Host.jsx (file exists in main repo as untracked). Not caused by this plan's changes. Detection tests (61/61) pass independently.

## Known Stubs

None - all data structures are fully wired and functional.

## Next Phase Readiness
- Plan 02 (end screen sections) can consume trajectory, virtue_streak, consistency_score, virtue_heavy_count from computeProfile
- Plan 02 can read rights_dimension and rights_protective from pack scenarios for end screen Rights Awareness section
- Plan 03 (UI components) can read ethicalLens for HostSetup pack cards and end screen footer

---
*Phase: 12-ethical-framework-depth*
*Completed: 2026-03-30*

## Self-Check: PASSED
- All 7 modified files exist on disk
- Both task commits (e1a557e, 14dbffa) found in git log
