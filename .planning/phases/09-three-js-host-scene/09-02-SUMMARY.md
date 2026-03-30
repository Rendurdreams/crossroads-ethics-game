---
phase: 09-three-js-host-scene
plan: 02
subsystem: host-scene
tags: [three-js, r3f, lerp, threshold-events, animation]
dependency_graph:
  requires: [09-01]
  provides: [KingdomScene lerp-reactivity, KingdomScene threshold-events]
  affects: [src/components/KingdomScene.jsx]
tech_stack:
  added: []
  patterns: [THREE.MathUtils.lerp, useRef-target-lerp, threshold-ref-tracking, setTimeout-stagger]
key_files:
  created: []
  modified:
    - src/components/KingdomScene.jsx
decisions:
  - Always-mounted lights (point lights, spotlights) instead of conditional render — refs must persist for useFrame lerp to work
  - Three separate window materials (winMat0/1/2) for staggered solidarity blackout wave
  - BeaconTower rotation speed lerped via currentRotSpeedRef — avoids snap on courage change
  - Dawn DirectionalLight managed imperatively (scene.add/remove) in FogController useEffect — avoids mounting/unmounting R3F component inside conditional
  - targetIntensityRef in BeaconTower tracks lerp target for spotlight — rotSpeedRef is separate from intensityRef
metrics:
  duration: 245s
  completed: 2026-03-29
  tasks_completed: 1
  files_changed: 1
---

# Phase 09 Plan 02: Landmark Lerp Reactivity + Threshold Events Summary

Full lerp-driven world state reactivity for all 4 landmarks (Bridge, BeaconTower, VillageQuarter, FogController) with dramatic threshold events at <20 and >85 — no setState in useFrame, all animation driven by ref mutation.

## What Was Built

### Task 1: Lerp interpolation and threshold events (COMPLETE — committed 455b3a6)

Modified `src/components/KingdomScene.jsx` to add per-frame lerp interpolation and threshold event logic to all 4 landmark components.

**Bridge of Accord (trust):**
- Moved point lights from conditional render `{t > 0.2 && ...}` to always-mounted with refs (`lightLeftRef`, `lightMidRef`, `lightRightRef`)
- `targetEmissiveRef` set in `useEffect` on trust change
- `useFrame` lerps `emissiveRef.current.emissiveIntensity` and `emissiveRef.current.emissive` (color) toward target
- Threshold < 20: `bridgeCollapsedRef.current = true` → emissive target 0.05, emissive color `#ef4444`, point lights target 0
- Threshold > 85: `bridgeGlowingRef.current = true` → emissive target 3.0, point lights target × 2

**Citadel Beacon (courage):**
- Moved rotating beam group from conditional render to always-mounted so `spotRef` and `pointRef` persist
- `targetIntensityRef` and `targetRotSpeedRef` updated in `useEffect`; `currentRotSpeedRef` lerped in `useFrame`
- `useFrame` lerps spotlight intensity, rotates beam group at lerped rotation speed, lerps beacon point light intensity
- Threshold < 20: `beaconDarkRef.current = true` → intensity target 0, rotation target 0 (goes completely dark and still)
- Threshold > 85: `beaconFullRef.current = true` → intensity target 80, rotation speed target 1.5

**Village Quarter (solidarity):**
- Split single `windowMat` into `winMat0`, `winMat1`, `winMat2` — each material has its own ref and lerp target
- `targetWin0Ref`, `targetWin1Ref`, `targetWin2Ref` updated in `useEffect`
- Threshold < 20: staggered rolling blackout — `targetWin0Ref` set to 0 immediately, `targetWin1Ref` set at 500ms via setTimeout, `targetWin2Ref` set at 1000ms
- Threshold > 85: all window targets → 2.5 (extra warm)
- `villageLightRef` (always-mounted point light) lerps toward 0 in blackout, 8 in flourish

**FogController (awareness):**
- Already had `useFrame` lerp from Phase 10 Plan 01 — preserved
- Threshold > 85: imperatively adds `THREE.DirectionalLight('#f5c542', 0.15)` to scene via `scene.add()`, tracked in `dawnLightRef`
- Threshold < 20: fog density target maxes at 0.06 (heavy obscuring fog)
- Dawn light cleaned up in useEffect cleanup function

**Key implementation rules followed:**
- Zero `setState` calls inside any `useFrame` callback — verified with automated grep
- All material clones in `useMemo` with `[materials]` dependency — never per-frame
- Threshold refs reset when meter value recovers above threshold

### Task 2: Visual + performance verification (AWAITING HUMAN)

Task 2 is a `checkpoint:human-verify` — visual and performance verification must be done by the developer on the actual host screen. Code is complete and build passes; human verification is pending.

**How to verify:**
1. Run `npx vite --open`
2. Create a session (host flow) → host screen should show the 3D kingdom scene
3. Verify 4 landmarks are visible with nighttime atmosphere, amber lighting, stars
4. Open DevTools Performance tab → record 5 seconds → verify ~60fps (no sustained drops below 45fps)
5. Test threshold events: manually set trust=15 in Supabase → bridge should go dark with red shift; set awareness=90 → fog nearly clears
6. Verify player phone (Play.jsx) does NOT load Three.js chunks

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Always-mounted lights instead of conditional render**

- **Found during:** Task 1 — implementing point light lerp for Bridge
- **Issue:** The original Bridge component conditionally rendered point lights `{t > 0.2 && <pointLight ...>}`. When a component unmounts, its refs become null/stale — the `useFrame` lerp cannot work on a ref that may be null between frames. The same issue existed for BeaconTower's spotlight group.
- **Fix:** Made all lights always-mounted JSX elements with persistent refs. Controlled visibility/intensity via lerped intensity values (0 = dark) rather than conditional rendering.
- **Files modified:** `src/components/KingdomScene.jsx`
- **Commit:** 455b3a6

**2. [Rule 2 - Missing functionality] Three separate window materials for staggered blackout**

- **Found during:** Task 1 — implementing solidarity blackout wave
- **Issue:** The original code used a single `windowMat` shared across all 3 window meshes. To implement the "rolling blackout, left to right" effect from CLAUDE.md, each window needs to respond independently — a staggered setTimeout pattern can only work if each window has its own material ref.
- **Fix:** Created `winMat0`, `winMat1`, `winMat2` — three independent materials, each with its own `targetWinNRef` and lerp in useFrame.
- **Files modified:** `src/components/KingdomScene.jsx`
- **Commit:** 455b3a6 (same commit)

**3. [Observation] KingdomCanvas.jsx supersedes KingdomScene.jsx in Host.jsx**

- **Found during:** Build verification check
- **Note:** Phase 10 introduced `KingdomCanvas.jsx` (a 2D HTML5 Canvas panorama, no Three.js) and Phase 10 Plan 02 updated `Host.jsx` to import `KingdomCanvas` instead of `KingdomScene`. This plan's work on `KingdomScene.jsx` is therefore not currently wired into the host screen. `KingdomScene.jsx` remains a complete, buildable, fully-reactive 3D component — but its integration was superseded by Phase 10's 2D canvas approach.
- **Action:** No code change made. This is a discovery, not a bug. The plan spec says to modify `KingdomScene.jsx` — that was done. Whether to re-wire it to Host.jsx is a separate decision outside this plan's scope.

## Known Stubs

None — all 4 landmarks have full lerp interpolation and threshold events implemented. The component is complete and reactive.

## Self-Check

### Files modified exist:
- `/Users/jay/MoralApp/src/components/KingdomScene.jsx` — FOUND (modified)

### Commits exist:
- `455b3a6` — feat(09-02): add lerp interpolation + threshold events to all 4 landmarks

### Build: PASS — `vite build` completes with zero errors

### Acceptance criteria spot-check:
- `grep -c "MathUtils.lerp"` → 12 (requirement: 4+) PASS
- `grep -c "useFrame"` → 8 (requirement: 4+) PASS
- `targetEmissiveRef` present in Bridge PASS
- `targetIntensityRef` present in BeaconTower PASS
- `targetWin0Ref/1Ref/2Ref` present in VillageQuarter PASS
- No setState in useFrame PASS
- Bridge `trust < 20` + `#ef4444` PASS
- BeaconTower `courage < 20` PASS
- VillageQuarter `solidarity < 20` + setTimeout stagger PASS
- FogController `awareness > 85` + dawn light PASS

## Self-Check: PASSED
