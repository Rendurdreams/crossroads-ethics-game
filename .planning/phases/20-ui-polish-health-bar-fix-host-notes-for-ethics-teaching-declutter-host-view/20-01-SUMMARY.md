---
phase: 20-ui-polish-health-bar-fix-host-notes-for-ethics-teaching-declutter-host-view
plan: 01
subsystem: ui
tags: [react, css-modules, meter-bar, player-phone]

# Dependency graph
requires: []
provides:
  - CompactMeterStrip component — sticky single-line monospace meter strip for player phone
  - Color-coded axis display (blue/amber/green/purple per meter)
  - Delta arrows (green up, red down) shown only after round close
  - Play.jsx no longer imports or renders WorldHealthBar or MeterBar

affects: [Play.jsx, player-phone-view, phase-20-subsequent-plans]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Sticky top bar pattern: position sticky, top 0, z-index 50, backdrop-filter blur
    - Delta tracking via useRef (prevStateRef + deltasRef) — cleared on round start
    - Meter color map keyed by axis name, unique across kingdom-arc and signal-lost packs

key-files:
  created:
    - src/components/CompactMeterStrip.jsx
    - src/components/CompactMeterStrip.module.css
  modified:
    - src/pages/Play.jsx

key-decisions:
  - "Used abbreviations HON/CRG/LOY/EMP for kingdom-arc axes to fit single line on narrow phones"
  - "Delta cleared on round start (roundClosed false after true) not on round close — arrows persist while consequence is visible"
  - "Removed computeWorldHealth and WorldHealthBar functions from Play.jsx — no longer needed"
  - "MeterBar still exists and is still imported by Host.jsx WorldStatePanel — not deleted"

patterns-established:
  - "CompactMeterStrip: single-file component, pure display, no Supabase calls — driven by worldState prop from parent"
  - "Delta tracking: useRef-based, not useState — avoids extra renders"

requirements-completed: []

# Metrics
duration: 8min
completed: 2026-04-01
---

# Plan 20-01: Compact Meter Strip with Color-Coded Axes Summary

**Sticky single-line terminal status bar replacing tall gradient MeterBars on player phone — HON/CRG/LOY/EMP in blue/amber/green/purple with post-round delta arrows**

## Performance

- **Duration:** ~8 min
- **Tasks:** 3
- **Files modified:** 3 (2 created, 1 modified)

## Accomplishments
- Created `CompactMeterStrip.jsx` with color-coded axis display and delta arrow logic via `useRef`
- Created `CompactMeterStrip.module.css` with sticky bar layout and `arrowFade` animation
- Replaced all 5 `WorldHealthBar` instances in `Play.jsx` with `CompactMeterStrip`; removed `WorldHealthBar` function, `computeWorldHealth` function, and `MeterBar` import from Play.jsx

## Task Commits

Each task was committed atomically:

1. **T1: Create CompactMeterStrip component** - `6aa4019` (feat)
2. **T2: Create CompactMeterStrip CSS module** - `6529c16` (feat)
3. **T3: Replace WorldHealthBar with CompactMeterStrip in Play.jsx** - `67ea5d0` (feat)

## Files Created/Modified
- `src/components/CompactMeterStrip.jsx` — New compact meter strip component
- `src/components/CompactMeterStrip.module.css` — Sticky terminal bar styles
- `src/pages/Play.jsx` — Swapped WorldHealthBar → CompactMeterStrip on all 5 player views

## Decisions Made
- Removed `computeWorldHealth` (no longer needed after WorldHealthBar removal) — clean dead code
- Delta arrows use `useRef` (not `useState`) to track previous state without causing additional renders
- `MeterBar` component left intact — still used by Host.jsx `WorldStatePanel`

## Deviations from Plan
None — plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Player phone compact meter strip is live
- Build passes cleanly
- Plans 20-02 and 20-03 can proceed (host notes phone-only, projector declutter)

---
*Phase: 20-ui-polish*
*Completed: 2026-04-01*
