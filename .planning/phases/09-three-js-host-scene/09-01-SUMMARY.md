---
phase: 09-three-js-host-scene
plan: 01
subsystem: host-scene
tags: [three-js, r3f, gltf, kingdom-scene, bundle-isolation]
dependency_graph:
  requires: []
  provides: [KingdomScene.jsx, public/models/*.glb]
  affects: [src/pages/Host.jsx]
tech_stack:
  added: []
  patterns: [useGLTF, useGLTF.preload, React.lazy, Suspense, useFrame-lerp, FogExp2]
key_files:
  created:
    - src/components/KingdomScene.jsx
    - public/models/bridge.glb
    - public/models/beacon-tower.glb
    - public/models/village-cluster.glb
    - public/models/terrain.glb
    - scripts/generate-models.cjs
  modified:
    - src/pages/Host.jsx
  deleted:
    - src/components/KingdomMap.jsx
    - src/components/KingdomMap.module.css
decisions:
  - Procedural GLB files via custom Node.js generator (GLTFExporter requires browser APIs; used manual binary GLB format instead)
  - Bridge/BeaconTower/VillageQuarter use GLTF node as base mesh, enhanced with procedural Three.js geometry siblings
  - FogController uses FogExp2 with inverted density formula (high awareness = clear)
  - useRef/useFrame lerp pattern — no setState in frame loop (preserves 60fps)
metrics:
  duration: 275s
  completed: 2026-03-28
  tasks_completed: 2
  files_changed: 9
---

# Phase 09 Plan 01: KingdomScene Foundation Summary

R3F Canvas with 4 GLTF landmark components (Bridge of Accord, Citadel Beacon, Village Quarter, terrain), FogController, CameraRig with autoRotate, ambient particles and Stars — lazy-loaded in Host.jsx via React.lazy + Suspense with CityPlaceholder fallback, replacing CSS KingdomMap entirely.

## What Was Built

### Task 1: Source GLTF models and create KingdomScene.jsx

Created `public/models/` with 4 minimal valid GLB 2.0 files (bridge, beacon-tower, village-cluster, terrain). Each GLB contains the base mesh geometry used as an anchor — the visual detail comes from additional procedural Three.js geometry added as siblings in `<group>` elements.

`src/components/KingdomScene.jsx` contains:
- `Bridge({ trust })` — GLTF bridge_deck mesh + stone arch supports, gate towers, amber lantern spheres, handrail posts, point lights driven by trust
- `BeaconTower({ courage })` — GLTF tower_shaft + cylindrical shaft, battlements, beacon housing with emissive amber, conical roof, rotating SpotLight driven by courage
- `VillageQuarter({ solidarity })` — GLTF hut_wall_0 + 4 hut buildings with pitched roofs, amber window quads, village well, point light driven by solidarity
- `Ground()` — GLTF terrain_ground_plane + flat ground plane, rolling hills, water plane
- `FogController({ awareness })` — FogExp2 density formula inverted: `0.015 + (1 - awareness/100) * 0.04`
- `CameraRig()` — OrbitControls with autoRotate=true, autoRotateSpeed=0.3, polar angle clamping
- `Particles()` — 200 amber firefly points with slow drift animation
- `useGLTF.preload()` called at module level for all 4 paths

Performance pattern: `useRef` holds lerp targets; `useFrame` lerps material properties without triggering React re-renders.

### Task 2: Replace KingdomMap with lazy-loaded KingdomScene in Host.jsx

- Removed `import KingdomMap from '../components/KingdomMap.jsx'` (line 10)
- Added `lazy, Suspense` to react import
- Added `import CityPlaceholder from '../components/CityPlaceholder.jsx'`
- Added `const KingdomScene = lazy(() => import('../components/KingdomScene.jsx'))`
- Replaced all 3 `<KingdomMap worldState={worldState} />` instances with `<Suspense fallback={<CityPlaceholder />}><KingdomScene worldState={worldState} /></Suspense>`
- Deleted `src/components/KingdomMap.jsx` and `src/components/KingdomMap.module.css` entirely

**Build result:** 2 JS chunks — `index-*.js` (645KB, main bundle) and `KingdomScene-*.js` (970KB, Three.js lazy chunk). Play.jsx bundle contains zero Three.js code.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Kenney Fantasy Town Kit not downloadable from CI environment**

- **Found during:** Task 1 — asset sourcing step
- **Issue:** External GLTF models from kenney.nl, poly.pizza, or Quaternius are not downloadable in the execution environment. The plan specified sourcing CC0 models from these external URLs.
- **Fix:** Created a Node.js script (`scripts/generate-models.cjs`) that writes minimal valid GLB 2.0 binary files using manual buffer construction. Each GLB contains a named mesh with a named material (the exact names used in `useGLTF` calls). The visual detail is delivered by procedural Three.js geometry added as siblings — which actually matches the CityScene.jsx pattern exactly and provides complete design control over the kingdom aesthetic.
- **Files modified:** `scripts/generate-models.cjs` (new), `public/models/*.glb` (4 new files)
- **Commit:** a62a74c

**2. [Rule 1 - Bug] `replace_all` missed third KingdomMap occurrence due to indentation difference**

- **Found during:** Task 2 — after initial replace_all for `<KingdomMap worldState={worldState} />`
- **Issue:** The third occurrence at the end view render location used 8-space indentation vs 10-space for the first two, causing the replacement to miss it.
- **Fix:** Targeted `replace_all=false` edit to fix the remaining occurrence with correct 8-space indentation.
- **Files modified:** `src/pages/Host.jsx`
- **Commit:** b8c6e3c

## Known Stubs

None — KingdomScene renders a complete 3D scene. Meter-driven reactivity (smooth lerp transitions and threshold events) is wired at a basic level (emissive intensity driven by trust/solidarity, beacon rotation driven by courage, fog density driven by awareness). Plan 02 will add full continuous lerp interpolation and dramatic threshold events.

## Self-Check

### Created files exist:
- `/Users/jay/MoralApp/src/components/KingdomScene.jsx` — FOUND
- `/Users/jay/MoralApp/public/models/bridge.glb` — FOUND
- `/Users/jay/MoralApp/public/models/beacon-tower.glb` — FOUND
- `/Users/jay/MoralApp/public/models/village-cluster.glb` — FOUND
- `/Users/jay/MoralApp/public/models/terrain.glb` — FOUND
- `/Users/jay/MoralApp/scripts/generate-models.cjs` — FOUND

### Deleted files gone:
- `/Users/jay/MoralApp/src/components/KingdomMap.jsx` — ABSENT (PASS)
- `/Users/jay/MoralApp/src/components/KingdomMap.module.css` — ABSENT (PASS)

### Commits exist:
- `a62a74c` — feat(09-01): create KingdomScene.jsx with 4 GLTF landmark components
- `b8c6e3c` — feat(09-01): replace KingdomMap with lazy-loaded KingdomScene in Host.jsx

### Build: PASS — `vite build` produces 2 JS chunks, zero errors.

## Self-Check: PASSED
