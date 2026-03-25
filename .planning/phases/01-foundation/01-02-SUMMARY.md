---
phase: 01-foundation
plan: 02
subsystem: data
tags: [scenarios, frameworks, detection, worldstate, pure-functions, tdd]

# Dependency graph
requires:
  - phase: 01-foundation-01
    provides: Supabase client, project scaffold, schema SQL

provides:
  - Complete 6-round scenario library with framework tags and world impacts
  - Four ethical framework definitions (consequentialism, deontology, care, virtue)
  - Four conflict pair definitions with named tensions
  - computeProfile() — dominant/least-used framework from choice history
  - findConflicts() — cross-round tension detection using CONFLICT_PAIRS
  - applyChoicesToWorld() — weighted aggregate world state update, clamped 0-100
  - Helper functions: getScenarioByRound(), getPlayableScenarios()

affects:
  - 02-landing
  - 03-host-dashboard
  - 04-player-view
  - 05-end-screen

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pure function library: all data layer functions take explicit parameters, no side effects, fully testable without Supabase or React"
    - "TDD with plain node ESM test scripts: no Jest required, import/assert pattern runnable with node --experimental-vm-modules"
    - "Framework tag pattern: choices carry frameworks[] array matching FRAMEWORKS keys for silent detection"
    - "Weighted world state: proportional aggregate of player votes applied to meters, clamped 0-100"

key-files:
  created:
    - src/lib/frameworks.js
    - src/lib/scenarios.js
    - src/lib/detection.js
    - src/lib/worldState.js
    - src/lib/__tests__/detection.test.js
    - src/lib/__tests__/worldState.test.js
  modified: []

key-decisions:
  - "Round 6 choices:[] — free-text reflection only, applyChoicesToWorld returns state unchanged for empty array"
  - "Abstaining players are excluded from choices array before calling applyChoicesToWorld — function never receives abstain marker"
  - "leastUsed in computeProfile returns last entry of sorted counts — deterministic, no randomness"
  - "findConflicts reports conflict when both conflict-pair frameworks appear anywhere in history, even if same round"

patterns-established:
  - "choice.frameworks[]: 1-2 string keys matching FRAMEWORKS object — used for framework counting and conflict detection"
  - "choice.worldImpact: {trust, courage, solidarity, awareness} numeric values, positive=increase, negative=decrease"
  - "roundIndex is 0-based for scenarios array; round field on scenario object is 1-based"
  - "Test files in src/lib/__tests__/ run with: node --experimental-vm-modules src/lib/__tests__/[file].test.js"

requirements-completed: [DATA-01, DATA-02, DATA-03, DATA-04, DATA-05]

# Metrics
duration: 3min
completed: 2026-03-25
---

# Phase 1 Plan 2: Data Layer Summary

**Pure-function game brain: 6-round scenario library, 4-framework ethical detection, and weighted world state computation — all TDD-verified with 24 passing tests**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-25T04:51:12Z
- **Completed:** 2026-03-25T04:54:24Z
- **Tasks:** 3
- **Files modified:** 6 created, 0 modified

## Accomplishments

- Complete scenario library: all 6 rounds transcribed verbatim from CLAUDE.md with framework tags, consequence text, and world impact values
- Framework detection: computeProfile() and findConflicts() correctly identify dominant framework and cross-round tensions
- World state engine: applyChoicesToWorld() applies proportional weighted deltas from aggregate player votes, clamps 0-100
- 24 tests across 2 test suites, all passing, runnable with plain node

## Task Commits

1. **Task 1: frameworks.js + scenarios.js — complete data library** - `4f2e700` (feat)
2. **Task 2: detection.js — computeProfile and findConflicts (TDD)** - `97ea4c2` (feat)
3. **Task 3: worldState.js — applyChoicesToWorld (TDD)** - `2c92e87` (feat)

## Files Created/Modified

- `src/lib/frameworks.js` — Four ethical framework definitions (FRAMEWORKS) and four conflict pairs (CONFLICT_PAIRS)
- `src/lib/scenarios.js` — Complete 6-round scenario library with helper functions
- `src/lib/detection.js` — computeProfile() and findConflicts() importing CONFLICT_PAIRS
- `src/lib/worldState.js` — applyChoicesToWorld() with weighted delta application and clamping
- `src/lib/__tests__/detection.test.js` — 14 tests for computeProfile and findConflicts
- `src/lib/__tests__/worldState.test.js` — 10 tests for applyChoicesToWorld

## Decisions Made

- Round 6 uses `choices: []` — empty array signals reflective round; applyChoicesToWorld gracefully returns state unchanged when called with empty choices
- Abstaining players contribute no weight — callers exclude abstainers before calling applyChoicesToWorld; function only sees submitted choices
- leastUsed framework in computeProfile is the last entry of the descending-sorted counts array — deterministic without randomness

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All 4 data layer files are ready for import by Landing, Host, and Player pages
- scenarios.js drives scenario rendering in Phase 3/4
- detection.js drives end-screen profile in Phase 5
- worldState.js drives round-close world state update in Phase 4
- Import pattern: `import { scenarios, getScenarioByRound } from './lib/scenarios.js'`
- Tests can be re-run at any time: `node --experimental-vm-modules src/lib/__tests__/detection.test.js`

---
*Phase: 01-foundation*
*Completed: 2026-03-25*
