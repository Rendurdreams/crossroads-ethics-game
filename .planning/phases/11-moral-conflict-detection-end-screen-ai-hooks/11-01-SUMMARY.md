---
phase: 11-moral-conflict-detection-end-screen-ai-hooks
plan: "01"
subsystem: detection + consequence-reveal
tags: [moral-conflict, detection, value-framework-map, consequence-reveal, tdd]
dependency_graph:
  requires: [07-moral-profile-data-layer]
  provides: [VALUE_FRAMEWORK_MAP, findMoralConflicts, moralConflictIndicator]
  affects: [src/lib/detection.js, src/components/ConsequenceReveal.jsx, src/pages/Play.jsx]
tech_stack:
  added: []
  patterns: [value-framework alignment mapping, stance-based secondary detection, single-round conflict check, no-double-fire guard per round]
key_files:
  created: []
  modified:
    - src/lib/detection.js
    - src/lib/__tests__/detection.test.js
    - src/components/ConsequenceReveal.jsx
    - src/components/ConsequenceReveal.module.css
    - src/pages/Play.jsx
decisions:
  - VALUE_FRAMEWORK_MAP honesty maps to [deontology, virtue] — both are rule/character frameworks that honesty naturally aligns with
  - No-double-fire guard: value conflict takes priority over stance conflict for the same round — prevents redundant messages
  - 2200ms animation-delay on moralConflictIndicator — positions it after tension section (1900ms + 350ms) so it reads as final beat
  - Single-round history passed to findMoralConflicts in ConsequenceReveal — function designed for full history but works correctly with one entry
  - Stance test cases use aligned top values (fairness for ends_justify, compassion for lie_to_protect) — avoids value conflict shadowing stance-only tests
metrics:
  duration: 240s
  completed_date: "2026-03-30T04:17:10Z"
  tasks_completed: 2
  files_changed: 5
---

# Phase 11 Plan 01: Moral Conflict Detection + In-Round Indicator Summary

**One-liner:** Value-to-framework alignment map plus single-round conflict detection wired into ConsequenceReveal with a 2.2s delayed fade-in.

## What Was Built

Two tasks delivered the first visible moment of the game's central lesson (morals ≠ ethics):

### Task 1 — VALUE_FRAMEWORK_MAP + findMoralConflicts (TDD)

`src/lib/detection.js` gained two new exports:

- `VALUE_FRAMEWORK_MAP` — maps 5 personal values to their aligned framework(s):
  - `honesty → [deontology, virtue]`
  - `loyalty → [care]`
  - `fairness → [consequentialism, deontology]`
  - `courage → [virtue]`
  - `compassion → [care]`

- `findMoralConflicts(choiceHistory, moralValues, moralStances)` — detects rounds where a player's choice did not align with their top stated value. Secondary signal: stance-based detection (`ends_justify`, `lie_to_protect`). No double-fire guard prevents two conflicts per round. Null/empty moralValues returns `[]` — pre-Phase-7 players are unaffected.

Test suite extended from 14 to 39 assertions (all passing).

### Task 2 — ConsequenceReveal + Play.jsx wiring

`ConsequenceReveal.jsx` now accepts `moralValues` and `moralStances` props, computes a single-round conflict from the current choice's framework, and renders a neutral-tone conflict message below the tension section with a 2200ms delayed `fadeUp` animation.

`Play.jsx` threads `player?.moral_values ?? null` and `player?.moral_stances ?? null` into the component. Players without a moral baseline see nothing (graceful null path).

## Commits

| Hash | Message |
|------|---------|
| abfdd87 | feat(11-01): add VALUE_FRAMEWORK_MAP and findMoralConflicts to detection.js |
| 77aefa7 | feat(11-01): wire moral conflict indicator into ConsequenceReveal + Play.jsx |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Stance test cases had incorrect top values**
- **Found during:** Task 1 GREEN phase
- **Issue:** Two test cases for stance-based conflicts (`mc5` and `mc7`) used `courage` as top value. `courage` maps to `['virtue']`, which does not overlap with `consequentialism` or `care` — so the value conflict detection fired first, the round was already flagged, and the stance conflict was blocked by the no-double-fire guard. The tests failed because they expected stance type but got value type.
- **Fix:** Changed `mc5` top value to `fairness` (aligns with `[consequentialism, deontology]` — no conflict with a consequentialism choice) and `mc7` to `compassion` (aligns with `[care]` — no conflict with a care choice). Tests now correctly exercise the stance-only conflict path.
- **Files modified:** `src/lib/__tests__/detection.test.js`
- **Commit:** abfdd87

## Known Stubs

None — all data paths are wired. Players without `moral_values` (pre-Phase-7 join) receive null and see nothing. The feature is fully functional.

## Self-Check: PASSED
