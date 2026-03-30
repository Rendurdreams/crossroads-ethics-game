---
phase: 15-divided-kingdom-phase-2
plan: "03"
subsystem: player-view
tags: [how-others-chose, walk-mechanic, timer-pressure, conscience-layer, play-jsx]
dependency_graph:
  requires: ["15-01", "15-02"]
  provides: ["HowOthersChose", "WalkMechanic", "howOthersChose.js", "timerPressure", "conscienceLayer wiring"]
  affects: ["src/pages/Play.jsx", "src/components/ConsequenceReveal.jsx"]
tech_stack:
  added: []
  patterns:
    - "Post-round comparison screen with research baseline vs live class bars"
    - "Physical walk interaction replacing standard choice buttons for R6"
    - "Timer pressure CSS animation for R5 urgency"
    - "Conscience layer amber italic text in ConsequenceReveal"
key_files:
  created:
    - src/lib/howOthersChose.js
    - src/components/HowOthersChose.jsx
    - src/components/HowOthersChose.module.css
    - src/components/WalkMechanic.jsx
    - src/components/WalkMechanic.module.css
  modified:
    - src/pages/Play.jsx
    - src/pages/Play.module.css
    - src/components/ConsequenceReveal.jsx
    - src/components/ConsequenceReveal.module.css
decisions:
  - "howOthersChose.js created in Plan 03 (not Plan 02) due to parallel worktree execution — no semantic conflict"
  - "conscienceLayer added to ConsequenceReveal here since Plan 02 runs in parallel and this plan requires it"
  - "isLocked check added to WalkMechanic zone buttons so disabled state prevents double-trigger"
  - "WalkMechanic avatarPosition uses capitalized string for CSS module class lookup (avatarLeft/avatarRight/avatarCenter)"
  - "Build errors for getDefaultPack/getReflectionScenario are pre-existing from Plan 01 parallel dependency — out of scope"
metrics:
  duration: 242s
  completed_date: "2026-03-30"
  tasks: 2
  files: 9
---

# Phase 15 Plan 03: Player View Phase 2 Wiring Summary

Wire Play.jsx with three Phase 2 features: How Others Chose post-round comparison screen, Round 5 timer pressure urgency styling, and Round 6 physical walk mechanic replacing ScenarioCard choice buttons.

## What Was Built

### Task 1: HowOthersChose + WalkMechanic Components

**howOthersChose.js** — Reference data module with all 8 rounds of PRD percentages from Awad et al. [3] MIT Moral Machine pattern. Exports `HOW_OTHERS_CHOSE` lookup constant and `getHowOthersChose(scenarioId)` function.

**HowOthersChose.jsx** — Post-round comparison screen showing research baseline vs live class selection percentages. Gray bars for research, amber bars for class. Mobile-first glass card design. Takes `{ scenarioId, liveChoices, totalPlayers }` props.

**WalkMechanic.jsx** — Physical walk interaction for Round 6 (The Shackled Heart). Player taps left/right zone to "walk" their avatar toward a choice. Left zone (Free Irel) glows amber, right zone (Walk away) is darker. Middle option (Commission scholars) appears after 1.5s delay via `useEffect`. Avatar slides with CSS transition on lock.

**ConsequenceReveal updates** — Added `conscienceLayer` prop (amber italic second-person inner voice text), `moralValues`, `moralStances`, `hasMoralConflict` props. Amber border variant for conflict state.

### Task 2: Play.jsx Wiring

Four changes applied to Play.jsx:

1. **conscienceLayer prop** — `chosenOption.conscienceLayer ?? null` passed to ConsequenceReveal on round_complete
2. **How Others Chose screen** — "See how others chose" button appears below ConsequenceReveal. On tap, HowOthersChose component renders with live round choices fetched from Supabase on round_complete event
3. **Round 5 timer pressure** — `isTimerPressureRound` flag adds `timerPulse` CSS animation to timer section; red urgency text "The council waits for no one." appears when ≤30s remain
4. **Round 6 walk mechanic** — `isWalkRound` flag replaces ScenarioCard with WalkMechanic component + scenario text card

State additions: `showHowOthersChose`, `roundChoicesForComparison` — both reset on round change.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] howOthersChose.js missing (Plan 02 parallel dependency)**
- **Found during:** Task 1 setup
- **Issue:** Plan 02 creates `src/lib/howOthersChose.js` but runs in a parallel worktree; file absent in this worktree
- **Fix:** Created `howOthersChose.js` from Plan 02 spec verbatim — same data, same exports, no semantic conflict
- **Files modified:** `src/lib/howOthersChose.js`
- **Commit:** 1457620

**2. [Rule 3 - Blocking] conscienceLayer missing from ConsequenceReveal (Plan 02 parallel dependency)**
- **Found during:** Task 2 — Play.jsx passes conscienceLayer but component didn't accept it
- **Fix:** Added `conscienceLayer` prop + amber italic CSS; added `hasMoralConflict` amber border variant; added `moralValues`/`moralStances` to signature per Plan 02 spec
- **Files modified:** `src/components/ConsequenceReveal.jsx`, `src/components/ConsequenceReveal.module.css`
- **Commit:** 1457620

**3. [Rule 1 - Bug] WalkMechanic disabled logic corrected**
- **Found during:** Task 1 code review
- **Issue:** Plan spec only checked `submitting` for zone button disable, but a locked choice should also prevent re-tapping
- **Fix:** Added `!isLocked` check to onClick handlers and `isLocked` to `disabled` prop on all zone buttons
- **Files modified:** `src/components/WalkMechanic.jsx`
- **Commit:** 1457620

**4. Pre-existing build errors (out of scope)**
- `getDefaultPack`, `getReflectionScenario` not exported from `scenarios.js` — these come from Plan 01 which runs in a parallel worktree; deferred to orchestrator merge

## Known Stubs

None. All components are wired with real data flows:
- HowOthersChose: reference data from howOthersChose.js, live data from Supabase choices query
- WalkMechanic: direct `onChoice` callback — same handler as ScenarioCard
- Timer pressure: reads `session.current_round` and `timerRemaining` from existing state

## Self-Check: PASSED

All created files verified:
- FOUND: src/lib/howOthersChose.js
- FOUND: src/components/HowOthersChose.jsx
- FOUND: src/components/HowOthersChose.module.css
- FOUND: src/components/WalkMechanic.jsx
- FOUND: src/components/WalkMechanic.module.css

All commits verified:
- FOUND: 1457620 (Task 1)
- FOUND: b5e5c0d (Task 2)
