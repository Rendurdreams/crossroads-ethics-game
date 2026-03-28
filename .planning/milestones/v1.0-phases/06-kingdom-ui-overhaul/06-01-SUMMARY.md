---
phase: 06-kingdom-ui-overhaul
plan: 01
subsystem: ui
tags: [react, svg, css-modules, kingdom-arc]

requires:
  - phase: 05.1-visual-experience-overhaul
    provides: framer-motion page transitions, glass card CSS, ambient layer

provides:
  - KingdomMap SVG component with 4 reactive landmarks and tier CSS classes
  - Landing page kingdom redesign with crest and pack-driven total_rounds
  - HostSetup pack identity card with no round selector

affects: [Host.jsx, Play.jsx, WorldStatePanel, any component consuming worldState]

tech-stack:
  added: []
  patterns:
    - "getTier() maps worldState values (>=70 flourishing, >=40 neutral, <40 declining) to CSS module classes"
    - "Fog landmark uses inverted tier classes (fogFlourishing/fogNeutral/fogDeclining) — less awareness = more fog"
    - "Pack-driven total_rounds: session creation reads getPlayableScenarios(getDefaultPack()).length"

key-files:
  created:
    - src/components/KingdomMap.jsx
    - src/components/KingdomMap.module.css
  modified:
    - src/index.css
    - src/pages/Landing.jsx
    - src/pages/Landing.module.css
    - src/pages/HostSetup.jsx
    - src/pages/HostSetup.module.css

key-decisions:
  - "KingdomMap fog landmark uses inverted CSS classes — fogDeclining at high opacity when awareness is low"
  - "Pack identity card replaces round selector entirely — total_rounds is set at session creation from pack, not HostSetup"
  - "Kingdom crest is inline SVG (heraldic shield + crossroads X) with aria-hidden, no external dependency"

requirements-completed: [UI-01, UI-02, UI-03, UI-04, UI-07, UI-08]

duration: 3min
completed: 2026-03-27
---

# Phase 6 Plan 1: Kingdom UI Foundation Summary

**SVG KingdomMap with 4 reactive landmarks + Landing crest + HostSetup pack card replaces round selector with pack-driven total_rounds**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-27T21:07:50Z
- **Completed:** 2026-03-27T21:10:55Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Created KingdomMap.jsx: 800x500 SVG with terrain (mountains, river, forest, village mound) and 4 named landmarks reacting to worldState via CSS tier classes
- Redesigned Landing page with kingdom crest SVG, updated copywriting contract ("Enter the Crossroads", "Begin"/"Convene", "Enter"/"Enter"), pack-driven total_rounds at session creation
- Replaced HostSetup round selector with pack identity card showing Kingdom of Ash name, dilemma count, and description

## Task Commits

1. **Task 1: CSS landmark tokens + KingdomMap component** - `a37b7ab` (feat)
2. **Task 2: Landing page kingdom redesign + pack-driven total_rounds** - `65be650` (feat)
3. **Task 3: HostSetup pack identity card, remove round selector** - `7c99d67` (feat)

## Files Created/Modified
- `src/components/KingdomMap.jsx` - SVG kingdom map with Bridge of Accord, Citadel Beacon, Village Quarter, Fog of the Vale
- `src/components/KingdomMap.module.css` - Tier CSS classes (flourishing/neutral/declining + inverted fog variants)
- `src/index.css` - 6 landmark tier CSS custom properties added to :root
- `src/pages/Landing.jsx` - Kingdom crest inline SVG, updated copy, getPlayableScenarios for total_rounds
- `src/pages/Landing.module.css` - No changes needed (subtitle styles already correct)
- `src/pages/HostSetup.jsx` - Removed totalRounds state + roundSelector, added packCard JSX
- `src/pages/HostSetup.module.css` - Removed round button classes, added packCard/packName/packCount/packDivider/packDescription

## Decisions Made
- Fog landmark inverts tier logic: `fogFlourishing` (opacity 0.15) when awareness is high, `fogDeclining` (opacity 0.6) when awareness is low — fog increases as awareness declines
- total_rounds is now set at session creation in Landing.jsx (not updatable in HostSetup) — openLobby() simplified to just navigate
- Kingdom crest uses simple heraldic shield path + X crossroads motif, aria-hidden, no external lib

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- KingdomMap is ready to be wired into Host.jsx and WorldStatePanel as worldState-reactive map
- Landing and HostSetup kingdom aesthetic established — consistent with UI-SPEC copywriting contract
- Plan 02 can now add KingdomMap to Host.jsx lobby and round views

---
*Phase: 06-kingdom-ui-overhaul*
*Completed: 2026-03-27*
