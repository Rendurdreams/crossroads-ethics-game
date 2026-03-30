---
phase: 12-ethical-framework-depth
plan: 02
subsystem: ui
tags: [react, css-modules, moral-conflict, awareness-prompt, consequence-reveal]

requires:
  - phase: 11-moral-conflict-detection-end-screen-ai-hooks
    provides: findMoralConflicts detection logic + VALUE_FRAMEWORK_MAP + moral conflict indicator in ConsequenceReveal
  - phase: 07-moral-profile-data-layer
    provides: moral_values and moral_stances on player row
provides:
  - Amber border visual on ConsequenceReveal when moral conflict detected (hasMoralConflict prop)
  - Deontological awareness prompt banner for honesty-first players on care-tagged scenarios
  - Awareness prompt dismissal tracking with Supabase logging
affects: [12-03, end-screen, player-experience]

tech-stack:
  added: []
  patterns:
    - "hasMoralConflict prop pattern for conditional card styling"
    - "Awareness prompt with per-round dismissal tracking via Set state"

key-files:
  created: []
  modified:
    - src/components/ConsequenceReveal.jsx
    - src/components/ConsequenceReveal.module.css
    - src/pages/Play.jsx
    - src/pages/Play.module.css

key-decisions:
  - "hasMoralConflict prop passed from Play.jsx rather than relying solely on internal computation - allows parent control over visual treatment"
  - "Awareness log stored as JSONB on player row (awareness_log) - no schema migration needed"
  - "promptShownRounds useEffect fires on round change, not on render - avoids unnecessary state updates"

patterns-established:
  - "Conditional card styling via composed CSS class: styles.card + styles.cardConflict"
  - "Per-round dismissal tracking with useState(new Set()) pattern"

requirements-completed: [CONSCIENCE-01, DEONTO-01, DEONTO-02]

duration: 4min
completed: 2026-03-30
---

# Phase 12 Plan 02: In-Game UI Indicators Summary

**Amber conflict border on ConsequenceReveal card + deontological awareness prompt banner for honesty-first players on care-tagged scenarios**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-30T14:55:35Z
- **Completed:** 2026-03-30T14:59:41Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- ConsequenceReveal card shows amber border + glow when a moral conflict is detected for that round's choice
- Awareness prompt banner renders above decree tiles for honesty-first players (honesty #1 + lie_to_protect=no) on care-tagged scenarios
- Prompt dismisses instantly on tap/Enter/Space with state tracked per round
- Dismissal and shown flags logged to player's awareness_log JSONB field after choice submission

## Task Commits

Each task was committed atomically:

1. **Task 1: ConsequenceReveal amber border on moral conflict** - `cbcc53d` (feat)
2. **Task 2: Deontological awareness prompt banner in Play.jsx** - `abb7773` (feat)

## Files Created/Modified
- `src/components/ConsequenceReveal.module.css` - Added .cardConflict class with amber border + glow box-shadow
- `src/components/ConsequenceReveal.jsx` - Added hasMoralConflict prop, conditional cardConflict class application
- `src/pages/Play.jsx` - Added findMoralConflicts import, roundMoralConflict computation, awareness prompt state/logic/rendering, awareness_log Supabase update
- `src/pages/Play.module.css` - Added .awarenessPrompt class with amber left-border styling

## Decisions Made
- hasMoralConflict computed in Play.jsx using findMoralConflicts with single-round synthetic history, passed as prop to ConsequenceReveal -- keeps parent in control of visual treatment while ConsequenceReveal also has its own internal conflict computation for the text indicator
- awareness_log stored as top-level JSONB key on player row rather than in choices table -- avoids schema migration, data is player-scoped not choice-scoped
- Awareness prompt useEffect tracks shown state on round change rather than in render -- prevents re-renders

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Worktree not up-to-date with main**
- **Found during:** Pre-execution setup
- **Issue:** Worktree HEAD was at v1.0 archive commit (7c89a64), missing all Phase 7-12 code including findMoralConflicts, moral_values, pack system
- **Fix:** Ran git merge main to fast-forward to f098d0e
- **Verification:** All Phase 11 detection code (findMoralConflicts, VALUE_FRAMEWORK_MAP) present after merge

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Git sync required before execution. No scope creep.

## Issues Encountered
- Pre-existing build error: Host.jsx imports KingdomCanvas.jsx which does not exist in the repository. This is unrelated to this plan's changes -- verified by stashing changes and confirming build fails identically without them. Logged as out-of-scope.

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all data paths are wired to live player data (moral_values, moral_stances from Supabase).

## Next Phase Readiness
- ConsequenceReveal now supports visual conflict indicator (amber border) alongside existing text indicator
- Awareness prompt infrastructure in Play.jsx ready for Plan 03 end-screen enhancements
- awareness_log data available on player row for future debrief analysis

---
*Phase: 12-ethical-framework-depth*
*Completed: 2026-03-30*
