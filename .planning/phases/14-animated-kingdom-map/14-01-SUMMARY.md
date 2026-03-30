---
phase: 14-animated-kingdom-map
plan: 01
subsystem: ui
tags: [gsap, animated-map, kingdom-map, parallax, particles]

# Dependency graph
requires:
  - phase: 06-kingdom-ui-overhaul
    provides: KingdomMap component and Host.jsx render sites
provides:
  - GSAP-driven AnimatedMap component with four reactive zones
  - Zone-to-meter key mapping (trust->Honesty, courage->Courage, solidarity->Loyalty, awareness->Empathy)
  - Compass spin via global CSS keyframe
  - Map1.png kingdom map asset
affects: [host-dashboard, kingdom-visuals]

# Tech tracking
tech-stack:
  added: [gsap]
  patterns: [GSAP zone reactivity with meter-driven visuals, fixed parallax layers without mouse interaction]

key-files:
  created:
    - src/components/AnimatedMap.jsx
    - src/components/AnimatedMap.module.css
    - src/assets/Map1.png
  modified:
    - src/pages/Host.jsx
    - src/index.css

key-decisions:
  - "METER_KEY_MAP inside AnimatedMap translates game keys to display names; Host.jsx passes worldState unchanged"
  - "Mouse parallax, cursor light, click ripple, proximity glow all removed — projected screen has no mouse"
  - "Zone labels always visible at 0.5 opacity instead of proximity-triggered"
  - "KingdomMap.jsx deleted (was the actual dead component, not KingdomCanvas/KingdomScene/CityScene which did not exist)"

patterns-established:
  - "GSAP zone reactivity: applyMeterVisuals callback drives opacity/scale/animation-duration on zone refs"
  - "Fixed parallax layers: gsap.set(el, { x: 0, y: 0 }) instead of mouse-driven positioning"

requirements-completed: [MAP-01, MAP-02, MAP-03, MAP-04]

# Metrics
duration: 6min
completed: 2026-03-30
---

# Phase 14 Plan 01: Animated Kingdom Map Summary

**GSAP-driven AnimatedMap with four reactive zones (fire/water/purple/compass) replaces static KingdomMap across all Host.jsx views**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-30T20:47:22Z
- **Completed:** 2026-03-30T20:53:26Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- AnimatedMap component adapted from integration prototype with GSAP particles, zone reactivity, and meter key mapping
- All three Host.jsx render sites (lobby, round view, end screen) now render AnimatedMap
- Dead KingdomMap component files removed
- Mouse/cursor interaction code fully stripped for projected-screen use

## Task Commits

Each task was committed atomically:

1. **Task 1: Install gsap, copy and adapt AnimatedMap component** - `c2ea138` (feat)
2. **Task 2: Swap KingdomMap for AnimatedMap in Host.jsx** - `a0ad3c0` (feat)
3. **Task 3: Delete dead code files** - `3589a97` (chore)

## Files Created/Modified
- `src/components/AnimatedMap.jsx` - GSAP-driven animated map with four reactive zones
- `src/components/AnimatedMap.module.css` - Scoped styles for parallax layers, zones, particles, labels
- `src/assets/Map1.png` - Kingdom map image asset
- `src/pages/Host.jsx` - Replaced KingdomMap import with AnimatedMap at all 3 render sites
- `src/index.css` - Added global compassSpin keyframe
- `src/components/KingdomMap.jsx` - DELETED (replaced by AnimatedMap)
- `src/components/KingdomMap.module.css` - DELETED (replaced by AnimatedMap)

## Decisions Made
- METER_KEY_MAP inside AnimatedMap translates game keys to display names; Host.jsx passes worldState unchanged
- Mouse parallax, cursor light, click ripple, proximity glow all removed for projected screen
- Zone labels always visible at 0.5 opacity instead of proximity-triggered
- KingdomMap.jsx/KingdomMap.module.css were the actual dead files (plan referenced KingdomCanvas/KingdomScene/CityScene which did not exist in this codebase state)
- Added lerpSpeedRef = useRef(2) to Host.jsx for AnimatedMap compat prop

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Adapted file names to actual codebase state**
- **Found during:** Task 2 and Task 3
- **Issue:** Plan referenced KingdomCanvas.jsx, KingdomScene.jsx, and CityScene.jsx as files to replace/delete. The actual component was KingdomMap.jsx (with KingdomMap.module.css). KingdomScene and CityScene files did not exist.
- **Fix:** Replaced KingdomMap references instead of KingdomCanvas. Deleted KingdomMap.jsx and KingdomMap.module.css instead of the three files listed in the plan.
- **Files modified:** src/pages/Host.jsx
- **Verification:** grep confirms zero KingdomMap references remain in src/

**2. [Rule 3 - Blocking] Added missing lerpSpeedRef to Host.jsx**
- **Found during:** Task 2
- **Issue:** AnimatedMap expects lerpSpeedRef prop but Host.jsx did not have one (the previous KingdomMap did not use it)
- **Fix:** Added `const lerpSpeedRef = useRef(2)` to Host component and passed it to all 3 AnimatedMap instances
- **Files modified:** src/pages/Host.jsx
- **Verification:** All 3 render sites pass lerpSpeedRef prop

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both auto-fixes necessary to match actual codebase state. No scope creep.

## Issues Encountered
- Pre-existing build failures in scenarios.js (getDefaultPack not exported) prevent `npm run build` from succeeding. These errors exist on main before any changes and are unrelated to this plan. Logged to deferred items.

## Known Stubs
None - all components are fully wired with real data sources.

## Next Phase Readiness
- AnimatedMap is rendering in all Host views with GSAP zone reactivity
- The scenarios.js export issue should be resolved before deployment

---
*Phase: 14-animated-kingdom-map*
*Completed: 2026-03-30*
