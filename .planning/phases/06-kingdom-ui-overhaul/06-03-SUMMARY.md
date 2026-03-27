---
phase: 06-kingdom-ui-overhaul
plan: "03"
subsystem: host-ui
tags: [kingdom-map, meter-labels, host-dashboard, cityscape-removal]
dependency_graph:
  requires: ["06-01"]
  provides: ["KingdomMap wired to Host.jsx all 3 views", "landmark names on all meters app-wide"]
  affects: ["src/pages/Host.jsx", "src/components/WorldStatePanel.jsx", "src/components/ConsequenceReveal.jsx", "src/pages/Play.jsx"]
tech_stack:
  added: []
  patterns: ["direct component import replacing lazy/Suspense for same-bundle component", "session.total_rounds from DB rather than local state"]
key_files:
  created: []
  modified:
    - src/pages/Host.jsx
    - src/pages/Host.module.css
    - src/components/WorldStatePanel.jsx
    - src/components/ConsequenceReveal.jsx
    - src/pages/Play.jsx
decisions:
  - "KingdomMap imported directly (not lazy) since it is an SVG component in the same bundle — no code-splitting benefit"
  - "Removed totalRounds local state entirely; Host now reads session.total_rounds from DB (set by Landing.jsx during session creation)"
  - "Removed lobby round selector from Host.jsx — round count is set in HostSetup before the session starts"
metrics:
  duration: "4m 21s"
  completed: "2026-03-27T21:26:43Z"
  tasks_completed: 2
  files_modified: 5
---

# Phase 06 Plan 03: KingdomMap Wiring + Landmark Labels Summary

KingdomMap SVG replaces CityScene in all 3 Host views; all MeterBar labels across the app updated to landmark names (Bridge of Accord, Citadel Beacon, Village Quarter, Fog of the Vale).

## What Was Built

**Task 1 — Host.jsx + Host.module.css**

- Removed `lazy` and `Suspense` from React import; removed `const CityScene = lazy(...)` import
- Added `import KingdomMap from '../components/KingdomMap.jsx'`
- Replaced `<Suspense fallback={null}><CityScene worldState={worldState} /></Suspense>` with `<KingdomMap worldState={worldState} />` in all 3 render sites: end view, round view, lobby view
- Updated round eyebrow: `'DELIBERATION CLOSED'` → `'The Realm Has Spoken'` / `'COUNCIL IN SESSION'` → `'The Council Deliberates'`
- Updated all 4 MeterBar label props in end view and round view to landmark names
- Removed lobby round selector (`.roundSelector` div with 3/4/5/6 buttons and state)
- Removed `totalRounds` and `setTotalRounds` state; `startGame()` now uses `session.total_rounds` from DB
- Removed round selector CSS classes from Host.module.css

**Task 2 — WorldStatePanel, ConsequenceReveal, Play.jsx**

- `WorldStatePanel.jsx`: All 4 MeterBar labels updated; section label `"World State"` → `"The Realm"`
- `ConsequenceReveal.jsx`: All 4 MeterBar labels updated; `"WORLD STATE"` → `"THE REALM"`
- `Play.jsx`: Both meter sections updated (pass-consequence view and missed-submit view)

## Verification Results

- `npx vite build` — succeeded, 455 modules transformed
- `grep -r 'label="Trust"' src/` — zero results confirmed
- `grep -c "CityScene" src/pages/Host.jsx` — 0
- KingdomMap renders in 3 sites in Host.jsx confirmed
- All 4 landmark names appear in 7 locations each across the app

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. KingdomMap is fully wired with worldState prop at all call sites. Landmark tier rendering (flourishing/neutral/declining) is live and reactive to worldState values.

## Commits

- `c66ef0a` — feat(06-03): replace CityScene with KingdomMap, update eyebrow copy and meter labels in Host.jsx
- `b276d31` — feat(06-03): update all MeterBar labels to landmark names across the app

## Self-Check: PASSED

- `src/pages/Host.jsx` — FOUND
- `src/components/WorldStatePanel.jsx` — FOUND
- `src/components/ConsequenceReveal.jsx` — FOUND
- `src/pages/Play.jsx` — FOUND
- commit c66ef0a — FOUND
- commit b276d31 — FOUND
