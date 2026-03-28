---
phase: 08-multi-pack-system
plan: "02"
subsystem: ui
tags: [react, css-modules, supabase, pack-selection, host-setup]

requires:
  - phase: 08-multi-pack-system/08-01
    provides: packs array, getPackById, getPlayableScenarios exports in scenarios.js

provides:
  - Multi-pack card selection UI on HostSetup page (3 cards, horizontal row)
  - pack_id and total_rounds written to Supabase sessions on lobby open
  - packCardSelected / packCardUnselected CSS states with amber glow

affects:
  - 08-03 (Host.jsx pack-aware game loop — reads pack_id from session)
  - Any future HostSetup changes

tech-stack:
  added: []
  patterns:
    - "useState default matching first pack id for pre-selection"
    - "CSS class composition for selected/unselected card state"
    - "Supabase .update() before navigate() for session initialization"

key-files:
  created: []
  modified:
    - src/pages/HostSetup.jsx
    - src/pages/HostSetup.module.css

key-decisions:
  - "Pack selection persisted to Supabase before navigating to lobby — session row has pack_id and total_rounds before any player joins"
  - "total_rounds = getPlayableScenarios(pack).length + 1 to include reflection round"
  - "packCardUnselected opacity 0.65 dims non-selected cards without hiding them"

patterns-established:
  - "Pack card button uses CSS class composition: packCard + packCardSelected or packCardUnselected"
  - "openLobby writes pack choice to DB before navigate() — avoids race between lobby load and pack read"

requirements-completed: [PACK-03, PACK-04]

duration: 1min
completed: "2026-03-28"
---

# Phase 8 Plan 02: Multi-Pack Card Selection UI Summary

**Three-card horizontal pack selector on HostSetup with amber glow for active card and Supabase write of pack_id + total_rounds before lobby navigation**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-03-28T03:57:12Z
- **Completed:** 2026-03-28T03:57:55Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- HostSetup now maps all 3 packs into a horizontal button row — kingdom-arc, Common Ground, The Weight of Tomorrow
- kingdom-arc pre-selected on page load via `useState('kingdom-arc')` with amber glow border and box-shadow
- Non-selected cards dimmed to 0.65 opacity; tapping switches selection with CSS transition
- `openLobby` writes `pack_id` and `total_rounds` to Supabase before navigating, replacing previous no-op navigate

## Task Commits

1. **Task 1: Multi-pack card selection UI on HostSetup** - `02067ff` (feat)

## Files Created/Modified

- `src/pages/HostSetup.jsx` - Replaced single pack card with `packs.map()` button row; added `selectedPackId` state; wired Supabase update in `openLobby`
- `src/pages/HostSetup.module.css` - Added `.packRow`, `.packCardSelected`, `.packCardUnselected`, `.packSetting`; updated `.packCard` to flex:1 with transition

## Decisions Made

- `total_rounds = playable + 1` (reflection round included in total) — consistent with existing kingdom-arc session length logic
- CSS transition on `opacity`, `border-color`, `box-shadow` (0.2s) gives tactile card-switch feel without JS animation libraries

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None. Build clean at 459 modules, 479ms.

## User Setup Required

**Supabase migration required.** The `pack_id` column on the `sessions` table must exist before this code path runs. Run `migration-08-pack-id.sql` in the Supabase Dashboard SQL Editor (specified in plan frontmatter under `user_setup`).

## Known Stubs

None — all three pack cards render live data from the `packs` array. Pack names, descriptions, dilemma counts, and settings are sourced from the imported pack objects.

## Next Phase Readiness

- HostSetup pack selection complete; pack_id in session row
- Phase 08-03 (Host.jsx pack-aware game loop) can now read `session.pack_id` to load the correct scenario pack

---
*Phase: 08-multi-pack-system*
*Completed: 2026-03-28*
