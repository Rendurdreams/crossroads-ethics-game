---
phase: 07-moral-profile-data-layer
plan: 01
subsystem: ui
tags: [react, supabase, framer-motion, css-modules, moral-profile]

# Dependency graph
requires:
  - phase: 06-kingdom-ui-overhaul
    provides: ScenarioCard.module.css (choiceBtn/choiceLocked/choiceDimmed reused for stance buttons), App.jsx route structure, Landing.jsx join flow
provides:
  - Baseline.jsx — /baseline/:sessionId page component with tap-to-rank values + stance questions
  - Baseline.module.css — glass card layout with value cards, rank badges, progress separator, stance gate, submit CTA
  - supabase/migration-07-moral-baseline.sql — idempotent ALTER TABLE adding moral_values + moral_stances jsonb columns
  - Join flow routes through /baseline before /play — moral identity collected pre-game
affects: [08-scenario-packs, 11-conflict-detection, Play.jsx player row shape]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Stance gate pattern: entire section rendered at 0.4 opacity + pointer-events:none until prerequisite complete, unlocks via CSS class swap"
    - "Mount restore with already-completed guard: fetch player row on mount, navigate('/play') if moral_values !== null"
    - "localStorage !loading guard: prevents overwriting restored state with initial empty values on first render"
    - "Tap-to-rank undo semantics: slice(0, idx) clears from-rank-onward, always valid prefix"

key-files:
  created:
    - src/pages/Baseline.jsx
    - src/pages/Baseline.module.css
    - supabase/migration-07-moral-baseline.sql
    - supabase/migrations/20260327000000_moral-baseline.sql
  modified:
    - src/App.jsx
    - src/pages/Landing.jsx

key-decisions:
  - "Stance Q2 additionally gated until Q1 has an answer — prevents out-of-order responses without hiding content"
  - "Stance answers are mutable (re-tap to change) unlike ScenarioCard choices which lock permanently — baseline is pre-game introspection, not an in-round decision"
  - "supabase/migration-07-moral-baseline.sql placed at project root for easy SQL Editor copy-paste; also committed to supabase/migrations/ for version history"

patterns-established:
  - "Baseline gate pattern: opacity + pointer-events CSS class swap for section gating"

requirements-completed:
  - MORAL-01
  - MORAL-02

# Metrics
duration: 2min
completed: 2026-03-27
---

# Phase 07 Plan 01: Moral Profile Data Layer Summary

**Baseline page with 5-value tap-to-rank + 2 stance questions, Supabase moral_values/moral_stances columns, and join flow routing through /baseline before /play**

## Performance

- **Duration:** 2 min 22s
- **Started:** 2026-03-27T22:18:08Z
- **Completed:** 2026-03-27T22:20:30Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Complete Baseline.jsx page component: 5 value cards with tap-to-rank (loyalty/honesty/fairness/courage/compassion), 2 stance questions (lie_to_protect, ends_justify) using decree-tile button style, localStorage sync + mount restore, Supabase write + await-before-navigate
- Baseline.module.css implementing the full UI-SPEC glass-morphism visual contract (glass card, amber rank badges, progress separator, stance gate at 0.4 opacity, amber gradient submit CTA)
- SQL migration adding moral_values + moral_stances jsonb columns to players table using IF NOT EXISTS for idempotency
- Routing wired: App.jsx adds /baseline/:sessionId route, Landing.jsx joinSession() redirects to /baseline before /play

## Task Commits

1. **Task 1: Create Baseline.jsx** - `a90a8bb` (feat)
2. **Task 2: Add Baseline.module.css and SQL migration** - `27590c6` (feat)
3. **Task 3: Wire /baseline route in App.jsx and redirect join flow** - `382cab0` (feat)

## Files Created/Modified
- `src/pages/Baseline.jsx` — Full moral baseline page component with value ranking + stance + submit
- `src/pages/Baseline.module.css` — Glass card, value card states, rank badge, progress separator, stance gate, submit CTA
- `supabase/migration-07-moral-baseline.sql` — ALTER TABLE players ADD COLUMN moral_values/moral_stances
- `supabase/migrations/20260327000000_moral-baseline.sql` — Same migration in versioned migrations/ directory
- `src/App.jsx` — Added Baseline import + /baseline/:sessionId route
- `src/pages/Landing.jsx` — joinSession() redirect changed from /play to /baseline

## Decisions Made
- Stance Q2 additionally gated until Q1 has an answer (qIdx > 0 && !stances[STANCE_QUESTIONS[0].key]) — prevents out-of-order responses; both questions visible, Q2 just disabled until Q1 answered
- Stance answers allow re-selection (re-tap changes selection) unlike in-round decree tiles that lock permanently — baseline is reflective introspection before any dilemma
- Both supabase/migration-07-moral-baseline.sql (root, easy SQL Editor copy) and supabase/migrations/20260327000000_moral-baseline.sql (version history) committed

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**Supabase migration required before deploying.** Run `supabase/migration-07-moral-baseline.sql` in the Supabase SQL Editor to add the moral_values and moral_stances columns to the players table. The migration is idempotent (IF NOT EXISTS) — safe to re-run.

## Next Phase Readiness
- Baseline page is self-contained and ships complete; players will see it between join and lobby
- moral_values and moral_stances columns need to be added to Supabase before deploy (SQL migration file provided)
- Phase 11 conflict detection will use moral_values to compare player stated values against their in-game framework choices
- No blockers for Phase 07 Plan 02 or other in-flight work

---
*Phase: 07-moral-profile-data-layer*
*Completed: 2026-03-27*
