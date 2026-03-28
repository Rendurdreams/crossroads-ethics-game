---
phase: 10-host-ux-unification-reveal-beat
plan: 02
subsystem: ui
tags: [react, framer-motion, hud, reveal-beat, three.js, animation, css]

requires:
  - phase: 10-01
    provides: lerpSpeedRef prop threading throughout KingdomScene — all 4 landmarks accept and use it

provides:
  - Reveal beat state machine in Host.jsx (revealPhase 'idle' | 'revealing' | 'revealed')
  - Cinematic HUD pill layout replacing three-panel flex dashboard
  - Toggle-on vote tally (showTally state)
  - Manual lesson overlay with dimming backdrop (showLesson state)
  - Delta pills appearing after reveal via AnimatePresence
  - lerpSpeedRef.current = 8 during reveal, reset to 2 after 2500ms

affects:
  - Host presenter flow for all rounds going forward

tech-stack:
  added: []
  patterns:
    - revealPhase state machine for two-phase reveal beat (revealing → revealed)
    - lerpSpeedRef.current mutation before await supabase — prevents race with subscription (Pitfall 3)
    - AnimatePresence for delta pills, tally overlay, lesson overlay
    - HUD pills as individually fixed-positioned elements — not flex panels

key-files:
  created: []
  modified:
    - src/pages/Host.jsx
    - src/pages/Host.module.css

key-decisions:
  - "prevWorldRef tracks prior world_state snapshot — enables accurate delta computation after DB update"
  - "lerpSpeedRef.current = 8 set synchronously before await — ensures fast lerp is active before Supabase subscription fires"
  - "frameworksUsedThisRound() and dominantFrameworkThisRound() added inline — helper functions not found in existing Host.jsx"
  - "computeTally() updated to include frameworks array per choice row — needed for tally overlay framework labels"
  - "Next Dilemma button lives inside lesson overlay (not behind it) — Pitfall 1 avoided"

requirements-completed: [THREE-04, THREE-05, HOSTUX-01, HOSTUX-02]

status: CHECKPOINT — awaiting human verification of Task 2

duration: ~5min
completed: 2026-03-28
---

# Phase 10 Plan 02: Host.jsx Reveal Beat + Cinematic HUD Summary

**Host screen converted from three-panel dashboard to cinematic HUD with glass pills over full-screen 3D canvas; reveal beat state machine drives 2.5s accelerated lerp on round close then exposes delta pills, lesson button, and manual lesson overlay**

## Performance

- **Started:** 2026-03-28
- **Tasks:** 1/2 complete (paused at human-verify checkpoint)
- **Files modified:** 2

## Accomplishments

### Task 1: Reveal Beat State Machine + HUD Layout Refactor (complete)

- Added `revealPhase` state (`'idle' | 'revealing' | 'revealed'`) and `showTally`, `showLesson` state variables
- Added `prevWorldRef` to track prior world state for delta computation
- Added `frameworksUsedThisRound()` and `dominantFrameworkThisRound()` helper functions (were not in existing Host.jsx)
- Updated `computeTally()` to return `frameworks` array per choice row (needed for tally overlay)
- Rewrote `closeRound()` with reveal beat: sets `lerpSpeedRef.current = 8` + `revealPhase = 'revealing'` BEFORE `await supabase` write, then `setTimeout` resets to `lerpSpeedRef.current = 2` + `revealPhase = 'revealed'` after 2500ms
- Rewrote `nextRound()` to reset `revealPhase`, `showTally`, `showLesson` to clean state
- Replaced three-panel flex layout (`bottomPanels`, `scenarioPanel`, `metersPanel`, `controlPanel`) with 5 individually fixed-positioned glass pills:
  - `hudPillTopLeft` — room code + round divider
  - `hudPillTopRight` — status text (Council Deliberates / Realm Shifts / Realm Has Spoken)
  - `hudPillBottomCenter` — timer + X/Y submitted count
  - `hudPillBottomLeft` — Votes toggle button
  - `hudPillBottomRight` — Close Round / revealing text / Lesson button
- Delta pills row (`deltaPillsRow`) appears via `AnimatePresence` when `revealPhase === 'revealed'` — centered on screen, filtered to only non-zero changes
- Vote tally overlay (`tallyOverlay`) is toggle-on via `showTally`, shows framework labels after round closed
- Lesson overlay uses Framer Motion `AnimatePresence` with `lessonBackdrop` (z-index 5) dimming to 72% opacity and `lessonOverlay` (z-index 6) showing centered lesson content; Next Dilemma button is inside the overlay (Pitfall 1 avoided)
- `lessonBtn` has `@keyframes lessonGlow` animation for amber pulsing glow
- Build passes: `vite build` exits 0

## Task Commits

1. **Task 1: Host.jsx reveal beat state machine + cinematic HUD layout refactor** - `84ad488` (feat)

## Files Created/Modified

- `src/pages/Host.jsx` — revealPhase state machine, HUD pill layout, Framer Motion orchestration, helper functions
- `src/pages/Host.module.css` — HUD pill positioning, delta pill styles, tally overlay, lesson overlay

## Decisions Made

- `prevWorldRef` added — not present in existing Host.jsx before this plan
- `frameworksUsedThisRound()` and `dominantFrameworkThisRound()` added inline — these helpers were listed in the plan's context section as existing but were not found in the actual file
- `computeTally()` updated to include `frameworks` field — required by new tally overlay JSX
- lerpSpeedRef mutation placed before `await supabase` per Pitfall 3 from research — synchronous assignment fires before async subscription delivers new world state

## Deviations from Plan

### Auto-added Missing Functions

**1. [Rule 2 - Missing Critical Functionality] frameworksUsedThisRound() and dominantFrameworkThisRound() helper functions**
- **Found during:** Task 1 implementation
- **Issue:** Plan's `<interfaces>` section listed these as existing functions in Host.jsx, but they were not present in the actual current file
- **Fix:** Added both functions inline in Host.jsx before the round control functions
- **Files modified:** src/pages/Host.jsx
- **Commit:** 84ad488

**2. [Rule 2 - Missing Critical Functionality] computeTally() frameworks field**
- **Found during:** Task 1 implementation
- **Issue:** Plan's tally overlay JSX uses `t.frameworks` but existing `computeTally()` only returned `{text, count, pct}`
- **Fix:** Updated `computeTally()` to also return `frameworks: choice.frameworks ?? []`
- **Files modified:** src/pages/Host.jsx
- **Commit:** 84ad488

**3. [Rule 2 - Missing Critical Functionality] prevWorldRef**
- **Found during:** Task 1 implementation
- **Issue:** Plan's context says `prevWorldRef` already exists in Host.jsx but it was not present
- **Fix:** Added `const prevWorldRef = useRef(null)` after existing refs
- **Files modified:** src/pages/Host.jsx
- **Commit:** 84ad488

## Status

**CHECKPOINT REACHED** — Task 2 requires human verification of the cinematic HUD and reveal beat in a running dev server. Awaiting human review.

## Self-Check: PASSED

- src/pages/Host.jsx — FOUND
- src/pages/Host.module.css — FOUND
- .planning/phases/10-host-ux-unification-reveal-beat/10-02-SUMMARY.md — FOUND
- Commit 84ad488 — FOUND

---

*Phase: 10-host-ux-unification-reveal-beat*
*Partial summary — checkpoint at Task 2*
