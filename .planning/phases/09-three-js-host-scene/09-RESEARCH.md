# Phase 9: Three.js Host Scene - Research

**Researched:** 2026-03-28
**Domain:** React Three Fiber (R3F v9) + drei v10 + GLTF asset loading + bundle isolation
**Confidence:** HIGH

## Summary

Phase 9 replaces the CSS KingdomMap SVG with a live Three.js 3D kingdom scene on the host screen. The core technical domain is React Three Fiber (already installed as `@react-three/fiber ^9.5.0` + `@react-three/drei ^10.7.7` + `three ^0.183.2`), so there is no new dependency installation needed. The existing `CityScene.jsx` already demonstrates every required pattern — R3F Canvas, `useFrame`, component-per-landmark architecture, `FogController` via `useThree`, and `OrbitControls` auto-rotation. The task is a focused rewrite of that component: swap procedural geometry for GLTF models loaded via `useGLTF`, rename it to `KingdomScene.jsx`, and wire it into the three `<KingdomMap>` render locations in `Host.jsx` using `React.lazy()` + `Suspense`.

The two highest-risk areas are (1) GLTF asset sourcing — the planner must schedule a concrete "find, download, test in-browser" wave before implementation can depend on model paths — and (2) the R3F v9 color management change: automatic sRGB texture conversion was removed in v9, so any GLTF texture that uses color data (albedo/emissive maps) must explicitly annotate `texture.colorSpace = THREE.SRGBColorSpace`. Everything else is a mechanical rewrite of patterns already proven in the codebase.

**Primary recommendation:** Keep the existing `CityScene.jsx` component architecture as the structural template. Replace geometry with GLTF `<primitive>` renders, replace the cityscape color palette with kingdom amber, and rename the file. No new architecture needed — only a rewrite of what's already working.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Kingdom/fantasy theme — nighttime, matches "Bridge of Accord, Citadel Beacon, Village Quarter, Fog of the Vale" landmark names
- **D-02:** GLTF models (.glb files) for all landmark objects — not procedural geometry
- **D-03:** Models committed to `public/models/` and loaded via `useGLTF()` from `@react-three/drei`
- **D-04:** Four landmark models: stone bridge (trust), beacon tower (courage), village hut cluster with lit windows (solidarity), terrain with fog layer (awareness)
- **D-05:** Nighttime atmosphere — dark sky, amber/warm lighting, stars
- **D-06:** Material + lighting shifts only — model geometry stays static. No rigging or animated model parts needed
- **D-07:** Trust → bridge emissive glow intensity (amber when high, dark when low) + point lights on bridge
- **D-08:** Courage → beacon spotlight on/off, rotation speed, and light intensity proportional to value
- **D-09:** Solidarity → village window emissive opacity scales with value
- **D-10:** Awareness → fog density via FogExp2. High awareness = clear, low = heavy fog. Inverted
- **D-11:** Continuous smooth interpolation (0–100) for all effects. Lerp between states
- **D-12:** Dramatic threshold events at extremes: below ~20 and above ~85 trigger distinct visual events
- **D-13:** Replace KingdomMap in all 3 Host.jsx views: lobby (line 522), active round (line 437), end view (line 372)
- **D-14:** Remove KingdomMap.jsx and KingdomMap.module.css entirely — no fallback, no dead code
- **D-15:** CityPlaceholder.jsx remains as the Suspense fallback while 3D assets load
- **D-16:** React.lazy() + Suspense in Host.jsx to lazy-load the scene component
- **D-17:** CityPlaceholder.jsx as the Suspense fallback
- **D-18:** Player phones (Play.jsx) never import the scene component

### Claude's Discretion
- Specific GLTF models to source (find the best CC0/CC-BY kingdom assets)
- Scene composition and camera placement (fixed angle, elevation, drift speed)
- Exact threshold values for dramatic events
- Ambient particle effects (fireflies, embers, dust) if performance budget allows
- Whether to rename CityScene.jsx → KingdomScene.jsx

### Deferred Ideas (OUT OF SCOPE)
- HUD overlay unification (3D scene + panels as one visual language) — Phase 10 (HOSTUX-01)
- Dramatic round-close reveal animation — Phase 10 (THREE-05, HOSTUX-02)
- Animated model parts (bridge splitting, beacon rotating mechanically) — v2
- Particle effects per landmark — Claude's discretion within performance budget, or defer to Phase 10
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| THREE-01 | Host screen renders a Three.js 3D scene replacing CSS KingdomMap — nighttime kingdom, fixed camera, slow ambient drift | CityScene.jsx already has this pattern; swap geometry/palette; lazy-load in Host.jsx |
| THREE-02 | 3D scene has 4 landmark objects: bridge (trust), beacon (courage), building cluster (solidarity), fog layer (awareness) | GLTF models from Kenney CC0 Fantasy Town Kit; useGLTF() already in drei v10; component-per-landmark pattern from CityScene.jsx |
| THREE-03 | Landmark states update after each round close based on world state — lighting, geometry, particles driven by flourishing/neutral/declining tiers | Lerp pattern in useFrame() for smooth material transitions; D-11 continuous interpolation |
| THREE-06 | Three.js loads from npm (not CDN) with tree-shaking — r160+ for current API | Already at three@0.183.2 via npm — no action needed; Vite auto-splits via React.lazy() |
| THREE-07 | 3D scene runs at stable 60fps on a standard laptop during Supabase subscription events | Isolate worldState prop updates from useFrame loop — use useRef for target values, lerp in useFrame; avoid setState in frame loop |
</phase_requirements>

---

## Standard Stack

### Core (all already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| three | 0.183.2 (npm) | Three.js core — scene, renderer, materials, lights, fog | Already installed; r183 > r160+ requirement; tree-shaken via Vite |
| @react-three/fiber | 9.5.0 | React renderer for Three.js — Canvas, useFrame, useThree | Already installed; R3F v9 targets React 19 compatibility explicitly |
| @react-three/drei | 10.7.7 | Three.js helper components — useGLTF, Stars, OrbitControls | Already installed; useGLTF handles GLB loading + caching + Draco |

### No New Dependencies Required
All stack components are already in `package.json`. THREE-06 is already satisfied: `three` is installed via npm at 0.183.2 (well above r160). The CLAUDE.md note about CDN r128 is the old plan — the current codebase already uses npm + R3F.

**Version verification (confirmed from npm ls):**
- `three@0.183.2` — installed, satisfies r160+ requirement
- `@react-three/fiber@9.5.0` — installed
- `@react-three/drei@10.7.7` — installed

**No install command needed.**

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── KingdomScene.jsx       # New file — replaces CityScene.jsx (or rename in-place)
│   ├── KingdomScene/          # Optional: sub-components if file grows large
│   │   ├── Bridge.jsx
│   │   ├── BeaconTower.jsx
│   │   ├── VillageQuarter.jsx
│   │   └── FogController.jsx
│   ├── CityPlaceholder.jsx    # Keep as-is — Suspense fallback
│   ├── KingdomMap.jsx         # DELETE after replacement verified
│   └── KingdomMap.module.css  # DELETE
public/
└── models/                    # New directory — GLTF assets committed here
    ├── bridge.glb
    ├── beacon-tower.glb
    ├── village-cluster.glb
    └── terrain.glb            # Optional: base terrain if separate from fog
```

### Pattern 1: Lazy-loaded Canvas in Host.jsx

```jsx
// Host.jsx — top of file
import { lazy, Suspense } from 'react'
import CityPlaceholder from '../components/CityPlaceholder.jsx'

const KingdomScene = lazy(() => import('../components/KingdomScene.jsx'))

// In render — replaces all 3 <KingdomMap> usages:
<div className={styles.canvas}>
  <Suspense fallback={<CityPlaceholder />}>
    <KingdomScene worldState={worldState} />
  </Suspense>
</div>
```

Vite sees `import('../components/KingdomScene.jsx')` and automatically code-splits `three`, `@react-three/fiber`, and `@react-three/drei` into a separate chunk. Play.jsx never imports this component, so the player bundle never includes Three.js.

### Pattern 2: useGLTF for Loading GLTF Models

```jsx
// Source: https://drei.docs.pmnd.rs/loaders/gltf-use-gltf
import { useGLTF } from '@react-three/drei'

function Bridge({ trust = 50 }) {
  const { nodes, materials } = useGLTF('/models/bridge.glb')

  // Override material properties — do NOT clone unless you need unique instances
  // If multiple instances share the same material, clone it
  const bridgeMat = useMemo(() => {
    const mat = materials['bridge_stone'].clone()
    mat.emissive = new THREE.Color('#f59e0b')
    return mat
  }, [materials])

  return (
    <primitive
      object={nodes['bridge_mesh']}
      material={bridgeMat}
    />
  )
}

// Preload at module level — starts fetch before component mounts
useGLTF.preload('/models/bridge.glb')
```

Key `useGLTF` API facts (confirmed from drei docs):
- Returns `{ scene, nodes, materials, animations, ...gltfProps }`
- `nodes` — named `THREE.Object3D` instances by name in the GLTF file
- `materials` — named `THREE.Material` instances
- Draco compression enabled by default (CDN decoder) — disable with `useGLTF(path, false)` for uncompressed assets
- Preload: `useGLTF.preload('/path/to/model.glb')` called at module level starts loading before the component mounts

### Pattern 3: Per-Frame Smooth Lerp (Continuous Interpolation — D-11)

This is the critical performance pattern. Do NOT set React state inside `useFrame`. Use refs to hold target values and lerp toward them each frame.

```jsx
// Source: https://r3f.docs.pmnd.rs/advanced/pitfalls
function BeaconTower({ courage = 50 }) {
  const lightRef = useRef()
  const targetIntensityRef = useRef(courage / 100 * 50)

  // Update target when prop changes (React re-render cycle — fine, rare)
  useEffect(() => {
    targetIntensityRef.current = courage / 100 * 50
  }, [courage])

  // Lerp toward target each frame — no setState, no React involvement
  useFrame((state, delta) => {
    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.lerp(
        lightRef.current.intensity,
        targetIntensityRef.current,
        delta * 2  // speed factor — adjust for cinematic feel
      )
      // Beacon rotation
      lightRef.current.parent.rotation.y += delta * (0.3 + (courage / 100) * 0.7)
    }
  })

  return (
    <group>
      <primitive object={nodes['beacon_mesh']} />
      <spotLight
        ref={lightRef}
        color="#f5c542"
        intensity={50}
        angle={0.15}
        penumbra={0.5}
        distance={25}
      />
    </group>
  )
}
```

### Pattern 4: FogExp2 via useThree (Awareness — D-10)

Identical to existing `FogController` in CityScene.jsx — proven pattern.

```jsx
// Already in CityScene.jsx — keep this pattern
function FogController({ awareness = 50 }) {
  const { scene } = useThree()
  useEffect(() => {
    const density = 0.015 + (1 - awareness / 100) * 0.04  // inverted: high awareness = low density
    scene.fog = new THREE.FogExp2('#0a0a14', density)
    return () => { scene.fog = null }
  }, [awareness, scene])
  return null
}
```

### Pattern 5: Threshold Events (D-12)

Use a ref to track whether a threshold event has already fired, preventing repeated triggers.

```jsx
function Bridge({ trust = 50 }) {
  const bridgeCollapsedRef = useRef(false)

  useEffect(() => {
    if (trust < 20 && !bridgeCollapsedRef.current) {
      bridgeCollapsedRef.current = true
      // Trigger dramatic state — e.g. animate emissive to red, kill point lights
    }
    if (trust >= 20) {
      bridgeCollapsedRef.current = false  // reset if trust recovers
    }
  }, [trust])
  // ...
}
```

### Pattern 6: R3F v9 Color Space (Breaking Change)

R3F v9 removed automatic sRGB texture conversion. Any GLTF albedo or emissive texture must be manually annotated:

```jsx
// After useGLTF load, fix color textures
useEffect(() => {
  if (materials['village_wall']?.map) {
    materials['village_wall'].map.colorSpace = THREE.SRGBColorSpace
  }
}, [materials])
```

This is only needed if Kenney assets include embedded textures. Kenney low-poly models typically use vertex colors or single flat materials — texture correction may not be needed. Verify after loading.

### Anti-Patterns to Avoid
- **setState inside useFrame:** Routes animation through React scheduler, adds re-render overhead every frame. Use refs + mutation instead.
- **Cloning materials unnecessarily:** `useGLTF` caches loaded models. If you clone a material on every render, memory leaks. Clone once in `useMemo`.
- **Draco compression for small models:** Kenney CC0 models are already small (low-poly). Draco adds a CDN round-trip for the decoder. Disable Draco (`useGLTF(path, false)`) unless models are > 1MB.
- **Heavy geometry in background:** Stars component from drei and the existing Particles component are already optimized — keep them. Avoid adding new high-vertex meshes.
- **Forgetting `useGLTF.preload()`:** Without preload, models start loading only when the component mounts, causing a visible pop-in after Suspense resolves. Call preload at module level.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GLTF loading | Custom fetch + parse | `useGLTF()` from `@react-three/drei` | Handles caching, Draco decompression, Suspense integration, ObjectMap parsing |
| Camera orbit/drift | Custom orbit math | `OrbitControls` from drei with `autoRotate` | Already used in CityScene.jsx; handles polar angle clamping |
| Starfield | Custom particle star system | `<Stars>` from drei | Already in CityScene.jsx — zero-cost addition |
| GLTF → JSX conversion | Manual node traversal | `npx gltfjsx model.glb` CLI | Generates typed JSX component from a .glb with named nodes — optional but useful for complex models |
| Lerp math | Custom interpolation | `THREE.MathUtils.lerp(a, b, t)` | Already in Three.js core |

**Key insight:** The biggest risk in this phase is not the Three.js code — it's the GLTF asset pipeline. Finding suitable CC0 models, downloading them, verifying GLB format, confirming mesh/material names, and testing that `useGLTF` parses them correctly is the unknown that must be resolved first.

---

## GLTF Asset Sources

### Recommended: Kenney Fantasy Town Kit (CC0)

**URL:** https://kenney.nl/assets/fantasy-town-kit
**License:** CC0 (public domain — no attribution required)
**Format:** Includes GLB files (confirmed — Kenney distributes GLB for all 3D packs)
**Assets confirmed present:** 160+ models including bridges, towers, houses, walls, terrain tiles
**Model count:** 160 assets — bridge, beacon tower, village buildings, terrain all present
**Poly count:** Low-poly stylized — suitable for real-time rendering at 60fps

**Matching landmark models (to verify on download):**
| Landmark | Expected Kenney Model | Notes |
|----------|----------------------|-------|
| Bridge of Accord (trust) | `bridge.glb` or `bridge-wood.glb` | Stone bridge preferred |
| Citadel Beacon (courage) | `tower-tall.glb` or `lighthouse.glb` | Tall tower with beacon top |
| Village Quarter (solidarity) | Multiple house GLBs composed as group | 3–4 hut models placed in cluster |
| Fog of the Vale (awareness) | Terrain tile + FogExp2 overlay | No dedicated fog model needed — use Three.js FogExp2 |

### Backup Source: Quaternius Medieval Village (CC0)

**URL:** https://poly.pizza/bundle/Medieval-Village-Pack-NsHhjhlrfY
**License:** CC0 (confirmed from search results)
**Format:** GLTF/FBX — verify GLB is available before committing

### Backup Source: Poly Pizza General Search

**URL:** https://poly.pizza
**Note:** Aggregates CC0 3D models in GLB format — good fallback if Kenney models need supplementing

---

## Common Pitfalls

### Pitfall 1: GLTF Mesh Names Are Asset-Specific
**What goes wrong:** `nodes['bridge_mesh']` throws undefined because the actual mesh name in the GLB file is something like `Mesh_0` or `Kenney_Bridge_Stone`.
**Why it happens:** Mesh names in GLTF files are set by the 3D artist, not standardized across libraries.
**How to avoid:** After downloading a model, inspect it with `npx gltfjsx model.glb --output` or open in https://gltf.report to see actual node names. Then reference those names in `useGLTF`.
**Warning signs:** `nodes[name]` is undefined; scene renders but no geometry appears.

### Pitfall 2: Material Mutation Corrupts Shared Instances
**What goes wrong:** Two landmark components that share the same loaded GLTF material both change emissive intensity — they fight each other, or changing one corrupts the other.
**Why it happens:** `useGLTF` caches the GLB and returns the same material object reference on every call with the same path.
**How to avoid:** Clone materials in `useMemo` for any material you plan to modify: `const mat = useMemo(() => materials['stone'].clone(), [materials])`. Do this once per component, not per frame.
**Warning signs:** Materials flickering between values; emissive intensity oscillating unexpectedly.

### Pitfall 3: React State in useFrame Degrades 60fps
**What goes wrong:** Frame rate drops from 60 to 30–40fps under Supabase subscription events.
**Why it happens:** If `worldState` prop changes trigger `setState` calls inside `useFrame`, React schedules reconciliation on every frame, doubling the work.
**How to avoid:** Keep `worldState` changes in `useEffect` → update a `useRef` target. The `useFrame` loop only reads the ref. No React state involved in the render loop.
**Warning signs:** `React DevTools Profiler` shows re-renders on every frame; CPU usage spikes during subscription events.

### Pitfall 4: Suspense Waterfall in React 19
**What goes wrong:** Multiple `useGLTF` calls inside a single Suspense boundary resolve one-at-a-time (waterfall) in React 19, increasing load time.
**Why it happens:** React 19 changed Suspense behavior — queries that suspend run sequentially rather than in parallel.
**How to avoid:** Call `useGLTF.preload()` at module level for all 4 model paths before the component ever mounts. Preloading kicks off all fetches in parallel before React's Suspense waterfall can sequence them.
**Warning signs:** Models load one-by-one with visible pop-in events even after Suspense resolves.

### Pitfall 5: Player Bundle Inflation
**What goes wrong:** Three.js ends up in the player phone bundle despite lazy loading.
**Why it happens:** If any import in Play.jsx (or its dependency tree) directly or indirectly imports `three` or a KingdomScene component, Vite includes it in the main chunk.
**How to avoid:** Verify Play.jsx imports: it must not import KingdomScene or any module that imports three. After `vite build`, check `dist/` for chunk sizes — the main chunk should not include Three.js (it's ~600KB unminified).
**Warning signs:** `vite build` output shows a single large chunk containing three.js; player phones load slowly.

### Pitfall 6: R3F v9 Color Space Breaking Change
**What goes wrong:** GLTF textures appear washed out or over-bright.
**Why it happens:** R3F v9 removed automatic sRGB conversion for color textures. GLTF loaders expect the renderer to handle colorspace; R3F v9 leaves it to the developer.
**How to avoid:** After loading, check if materials have color maps; if so, set `texture.colorSpace = THREE.SRGBColorSpace`. Kenney low-poly models likely use flat vertex colors and won't need this.
**Warning signs:** Materials look desaturated or blown-out compared to how they appear in a GLTF viewer.

---

## Code Examples

### Full KingdomScene Structure

```jsx
// src/components/KingdomScene.jsx
import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// ── Preload all models at module level (prevents Suspense waterfall in React 19)
useGLTF.preload('/models/bridge.glb')
useGLTF.preload('/models/beacon-tower.glb')
useGLTF.preload('/models/village-cluster.glb')

function Bridge({ trust = 50 }) {
  const { nodes, materials } = useGLTF('/models/bridge.glb')
  const matRef = useRef()
  const targetEmissiveRef = useRef(trust / 100)

  useEffect(() => { targetEmissiveRef.current = trust / 100 }, [trust])

  useFrame((_, delta) => {
    if (matRef.current) {
      matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        matRef.current.emissiveIntensity,
        targetEmissiveRef.current * 2,
        delta * 1.5
      )
    }
  })

  const mat = useMemo(() => {
    const m = materials['bridge_stone']?.clone() ?? new THREE.MeshStandardMaterial()
    m.emissive = new THREE.Color('#f59e0b')
    m.emissiveIntensity = trust / 100 * 2
    return m
  }, [materials])  // do NOT include trust — lerped in useFrame

  return <primitive object={nodes['bridge_mesh']} material={mat} ref={matRef} />
}

export default function KingdomScene({ worldState }) {
  const trust = worldState?.trust ?? 50
  const courage = worldState?.courage ?? 50
  const solidarity = worldState?.solidarity ?? 50
  const awareness = worldState?.awareness ?? 50

  return (
    <Canvas
      camera={{ position: [12, 8, 15], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#050510' }}
      shadows
    >
      <FogController awareness={awareness} />
      <ambientLight intensity={0.08} color="#4a4a6a" />
      <directionalLight position={[10, 15, 5]} intensity={0.3} color="#6a6a8a" castShadow />
      <pointLight position={[0, -1, 0]} color="#f59e0b" intensity={0.5} distance={20} />
      <Stars radius={50} depth={50} count={2000} factor={3} saturation={0} fade speed={0.5} />
      <Bridge trust={trust} />
      <BeaconTower courage={courage} />
      <VillageQuarter solidarity={solidarity} />
      <Ground />
      <CameraRig />
    </Canvas>
  )
}
```

### Lazy Load in Host.jsx

```jsx
// Host.jsx — replaces static import of KingdomMap
import { lazy, Suspense } from 'react'
import CityPlaceholder from '../components/CityPlaceholder.jsx'
// Remove: import KingdomMap from '../components/KingdomMap.jsx'

const KingdomScene = lazy(() => import('../components/KingdomScene.jsx'))

// All 3 render locations (lines 372, 437, 522) become:
<div className={styles.canvas}>
  <Suspense fallback={<CityPlaceholder />}>
    <KingdomScene worldState={worldState} />
  </Suspense>
</div>
```

### Verifying Bundle Isolation

```bash
# After vite build — check chunk sizes
ls -la dist/assets/*.js | sort -k5 -n
# The Three.js chunk should be a separate file (~600KB+ minified)
# The main chunk should not contain "three" code
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Three.js via CDN r128 | npm three@0.183.2 + tree-shaking | CLAUDE.md v3 → current implementation | Smaller bundle; r128 API compatibility issues avoided |
| Procedural geometry (CityScene.jsx) | GLTF models via useGLTF | Phase 9 | Kingdom aesthetic; no custom geometry math needed |
| `import KingdomMap` (static) | `React.lazy(() => import(...))` | Phase 9 | Three.js excluded from player bundle |
| R3F v8 (prior art) | R3F v9 — React 19, no auto sRGB conversion | R3F v9 release (2024-2025) | Explicit colorSpace annotation required for color textures |

**Deprecated/outdated:**
- CDN Three.js pattern from CLAUDE.md initial spec: superseded — npm package is already installed
- `new THREE.CapsuleGeometry()`: never existed in r128; r183 has it but not needed here

---

## Open Questions

1. **GLTF mesh node names for Kenney models**
   - What we know: Kenney Fantasy Town Kit is CC0 and includes GLBs. Node names in the actual files are unknown until downloaded.
   - What's unclear: Whether a single GLB contains the full scene or individual models. Whether models need compositing.
   - Recommendation: Wave 0 task — download Kenney Fantasy Town Kit, run `npx gltfjsx` on each model to get node/material names, commit to `public/models/`, document names in implementation notes.

2. **Solidarity: single village GLB vs. composite of multiple house models**
   - What we know: KingdomMap has three separate house SVGs. Kenney likely has individual house models.
   - What's unclear: Whether a pre-composed village cluster GLB exists or whether the planner should compose 3–5 separate house models positioned in code.
   - Recommendation: Prefer a single village cluster GLB if available. If not, position 3–5 individual house GLBs in a `<group>` — this is straightforward in R3F.

3. **Particle effects (ambient fireflies/embers) within performance budget**
   - What we know: The existing Particles component (200 animated points) runs at 60fps in CityScene.jsx.
   - What's unclear: Whether GLTF model loading will add enough overhead to push the 200-particle system over budget on a standard laptop.
   - Recommendation: Keep the existing Particles component as-is. Monitor fps during testing; if frame rate dips, reduce particle count to 100 first.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| three (npm) | THREE-06, scene rendering | Yes | 0.183.2 | — |
| @react-three/fiber | Canvas renderer | Yes | 9.5.0 | — |
| @react-three/drei | useGLTF, Stars, OrbitControls | Yes | 10.7.7 | — |
| public/models/ directory | GLTF asset serving | No — must create | — | Create in Wave 0 |
| Kenney Fantasy Town Kit GLBs | Landmark geometry | Not yet downloaded | — | Quaternius Medieval Village Pack (CC0) |
| npx gltfjsx (optional) | Node name discovery | Available via npx | — | Manual inspection via gltf.report |

**Missing dependencies with no fallback:**
- `public/models/` directory with actual GLB files — this blocks all GLTF implementation tasks. Wave 0 must create this directory and verify at least one model loads before implementing landmark components.

**Missing dependencies with fallback:**
- If Kenney Fantasy Town Kit doesn't have suitable bridge/tower models: Poly Pizza CC0 search or Quaternius Medieval Village Pack.

---

## Sources

### Primary (HIGH confidence)
- Installed packages verified via `npm ls` — three@0.183.2, @react-three/fiber@9.5.0, @react-three/drei@10.7.7
- `src/components/CityScene.jsx` — existing codebase patterns (useGLTF not yet used, but useFrame/useThree/OrbitControls proven)
- `src/pages/Host.jsx` — three KingdomMap render locations confirmed at lines 372, 437, 522
- R3F v9 Migration Guide (https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide) — color management change, CanvasProps rename, React 19 compatibility
- drei useGLTF docs (https://drei.docs.pmnd.rs/loaders/gltf-use-gltf) — return value shape, preload API, Draco default behavior
- R3F Performance Pitfalls (https://r3f.docs.pmnd.rs/advanced/pitfalls) — setState in useFrame anti-pattern, useRef mutation pattern

### Secondary (MEDIUM confidence)
- Kenney Fantasy Town Kit (https://kenney.nl/assets/fantasy-town-kit) — CC0 confirmed, 160+ models, GLB format confirmed from Kenney knowledge base
- Quaternius Medieval Village Pack (https://poly.pizza/bundle/Medieval-Village-Pack-NsHhjhlrfY) — CC0 backup source
- React.lazy + Vite code splitting behavior — multiple sources confirm automatic chunk splitting via dynamic import

### Tertiary (LOW confidence)
- Specific mesh/material names in Kenney GLB files — unknown until downloaded; requires Wave 0 verification

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages installed and version-verified
- Architecture: HIGH — patterns proven in existing CityScene.jsx; useGLTF API confirmed from official docs
- GLTF asset sourcing: MEDIUM — Kenney CC0 confirmed, GLB format confirmed, specific mesh names LOW until downloaded
- Performance patterns: HIGH — R3F official pitfalls doc confirms useRef/mutation approach
- Pitfalls: HIGH — all derived from official R3F docs or direct codebase inspection

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (R3F/drei APIs are stable; Kenney asset availability indefinite)
