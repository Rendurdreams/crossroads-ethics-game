---
phase: 10-host-ux-unification-reveal-beat
plan: 01
subsystem: ui
tags: [three.js, react, r3f, animation, lerp, particles, fog]

requires:
  - phase: 09-three-js-host-scene
    provides: KingdomScene.jsx with Bridge/BeaconTower/VillageQuarter/FogController/Particles components

provides:
  - lerpSpeedRef prop threading throughout KingdomScene — all 4 landmarks accept and use it
  - FogController converted from instant useEffect to smooth useFrame lerp
  - Particles reduced to 12 ambient motes with lower opacity and slower drift
  - Bridge collapsed state color (#7f1d1d deep blood red for trust < 20)
  - Host.jsx creates lerpSpeedRef = useRef(2) and passes it to all 3 KingdomScene instances

affects:
  - 10-02 (Plan 02 uses lerpSpeedRef.current = 8 for reveal beat)

tech-stack:
  added: []
  patterns:
    - lerpSpeedRef as React ref object passed to R3F components — read in useFrame, never triggers re-renders
    - FogController useFrame lerp pattern (target in ref, lerp toward it each frame)
    - Collapsed state color lerp in Bridge useFrame (trust < 20 = deep blood red)

key-files:
  created: []
  modified:
    - src/components/KingdomScene.jsx
    - src/pages/Host.jsx

key-decisions:
  - "lerpSpeedRef as useRef not useState — avoids re-render chain when Host.jsx state changes (Pitfall 2)"
  - "FogController converted to useFrame lerp — eliminates jarring instant fog jump during reveal beat (Pitfall 4)"
  - "Particles reduced from 200 to 12 — subtle ambient motes per D-01"
  - "Bridge collapsed color #7f1d1d (deep blood red) replaces default amber when trust < 20 per D-02"

patterns-established:
  - "lerpSpeedRef prop: Host creates useRef(2), passes to KingdomScene, KingdomScene threads to all landmarks"
  - "All landmark lerp calls: delta * (lerpSpeedRef?.current ?? 2) — safe null fallback"

requirements-completed: [THREE-04, THREE-05]

duration: 3min
completed: 2026-03-28
---

# Phase 10 Plan 01: KingdomScene lerpSpeedRef Threading + Visual Quality Pass Summary

**lerpSpeedRef prop threaded to all 4 R3F landmarks (Bridge, Beacon, Village, Fog), particles reduced to 12 ambient motes, fog lerp converted to useFrame for smooth reveal-beat control from Host.jsx**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-28T20:42:50Z
- **Completed:** 2026-03-28T20:45:35Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added `lerpSpeedRef` prop to KingdomScene and threaded it to all 4 landmark components (Bridge, BeaconTower, VillageQuarter, FogController)
- Converted FogController from instant `useEffect` assignment to `useFrame` lerp — eliminates jarring fog jump during reveal beat
- Reduced particle count from 200 to 12 with smaller spread (20 vs 40), slower drift (0.0006 vs 0.002), lower opacity (0.3)
- Added Bridge collapsed state color lerp (#7f1d1d deep blood red when trust < 20)
- Host.jsx creates `lerpSpeedRef = useRef(2)` and passes it to all 3 KingdomScene instances

## Task Commits

1. **Task 1: Add lerpSpeedRef to KingdomScene + visual quality pass** - `c706067` (feat)
2. **Task 2: Wire lerpSpeedRef from Host.jsx to KingdomScene** - `2f4577c` (feat)

## Files Created/Modified

- `src/components/KingdomScene.jsx` - lerpSpeedRef threading to all 4 landmarks, FogController useFrame lerp, particle reduction, Bridge collapsed color
- `src/pages/Host.jsx` - lerpSpeedRef useRef(2) created, passed to all 3 KingdomScene instances

## Decisions Made

- Used `useRef` for lerpSpeedRef (not `useState`) — refs are read inside `useFrame` without triggering re-renders when Host.jsx state changes (Pitfall 2 from research)
- FogController now has both `useEffect` (initialize fog + set target density) and `useFrame` (lerp toward target) — matches the pattern used by other landmarks
- Bridge collapsed threshold is trust < 20 matching the CLAUDE.md spec for threshold events

## Deviations from Plan

### Notes on Plan Assumptions

The plan's `<interfaces>` section showed `KingdomCanvas` as the current Host.jsx import and `delta * 2` as the Bridge lerp factor. However, Phase 09 already executed and:
- Host.jsx was already updated to use `KingdomScene` with lazy loading
- Bridge lerp was `delta * 1.5` (not `delta * 2`)
- Particles count was 200 (not 40)

These were pre-existing state differences, not deviations. All plan objectives were met with the actual current code state.

None of the plan's execution goals required any auto-fix rules. Plan executed as specified against the actual codebase state.

## Issues Encountered

- The worktree branch was behind main by ~15 commits (Phase 07-09 work). Merged main into worktree before executing — fast-forward merge, no conflicts.

## Next Phase Readiness

- `lerpSpeedRef` is wired and ready — Plan 02 can set `lerpSpeedRef.current = 8` in `closeRound()` to trigger the reveal beat accelerated lerp
- FogController now lerps smoothly — reveal beat will have consistent fog transition alongside other landmarks
- Build produces 2 chunks (main + KingdomScene lazy) as required

---
*Phase: 10-host-ux-unification-reveal-beat*
*Completed: 2026-03-28*
