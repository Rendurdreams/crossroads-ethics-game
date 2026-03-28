# Phase 9: Three.js Host Scene - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the CSS KingdomMap SVG with a live Three.js 3D kingdom scene on the host screen. Four GLTF landmark models (bridge, beacon, village, fog terrain) are loaded from free CC0/CC-BY assets, wired to world state via material + lighting shifts, and rendered at 60fps. The scene displays in all 3 host views (lobby, active round, end). KingdomMap.jsx is removed entirely. Three.js is lazy-loaded so player phones never download it.

</domain>

<decisions>
## Implementation Decisions

### Scene Aesthetic
- **D-01:** Kingdom/fantasy theme — the 3D scene matches the game's kingdom register (Bridge of Accord, Citadel Beacon, Village Quarter, Fog of the Vale). Not a modern cityscape.
- **D-02:** GLTF models (.glb files) for all landmark objects — not procedural geometry. Models sourced from free asset libraries (Kenney.nl CC0 medieval pack, Poly Pizza, Sketchfab CC-BY).
- **D-03:** Models committed to `public/models/` and loaded via `useGLTF()` from `@react-three/drei`.
- **D-04:** Four landmark models needed: stone bridge (trust), beacon tower on cliff/mountain (courage), village hut cluster with lit windows (solidarity), terrain with fog layer (awareness).
- **D-05:** Nighttime atmosphere — dark sky, amber/warm lighting, stars. Matches the existing glass-morphism dark palette.

### Meter-Driven Visual Changes
- **D-06:** Material + lighting shifts only — model geometry stays static. No rigging or animated model parts needed.
- **D-07:** Trust → bridge emissive glow intensity (amber when high, dark when low) + point lights on bridge.
- **D-08:** Courage → beacon spotlight on/off, rotation speed, and light intensity proportional to value.
- **D-09:** Solidarity → village window emissive opacity scales with value. High = warm lit windows, low = dark village.
- **D-10:** Awareness → fog density (existing FogExp2 pattern). High awareness = clear, low = heavy fog. Inverted, consistent with KingdomMap convention.

### Visual Tier System
- **D-11:** Continuous smooth interpolation (0–100) for all meter-driven effects. Every round produces a visible shift in the 3D scene. Lerp between states for cinematic feel.
- **D-12:** Dramatic threshold events at extremes: below ~20 triggers distinct visual events (beacon goes dark, bridge effect, blackout wave) and above ~85 triggers positive events (fog clears, sunrise glow). Matches CLAUDE.md spec for threshold events.

### Swap Strategy
- **D-13:** Replace KingdomMap in all 3 Host.jsx views: lobby (neutral state), active round (reactive), end view (final state). The 3D scene is always visible on the host screen.
- **D-14:** Remove KingdomMap.jsx and KingdomMap.module.css entirely — no fallback, no dead code.
- **D-15:** CityPlaceholder.jsx remains as the Suspense fallback shown while 3D assets load.

### Bundle Isolation
- **D-16:** React.lazy() + Suspense in Host.jsx to lazy-load the scene component. Vite auto-splits Three.js + R3F + drei into a separate chunk.
- **D-17:** CityPlaceholder.jsx used as the Suspense fallback — shows the kingdom SVG silhouette while Three.js loads.
- **D-18:** Player phones (Play.jsx) never import the scene component — Three.js stays out of the player bundle entirely.

### Claude's Discretion
- Specific GLTF models to source (researcher finds the best CC0/CC-BY kingdom assets)
- Scene composition and camera placement (fixed angle, elevation, drift speed)
- Exact threshold values for dramatic events (researcher can calibrate)
- Ambient particle effects (fireflies, embers, dust) if performance budget allows
- Whether to rename CityScene.jsx → KingdomScene.jsx or similar

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scene Architecture
- `src/components/CityScene.jsx` — Existing R3F scene (to be rewritten). Shows the current pattern: Canvas, useFrame, useThree, component-per-landmark, worldState prop interface
- `src/components/CityPlaceholder.jsx` — Suspense fallback SVG — keep as loading state
- `src/components/KingdomMap.jsx` — CSS SVG being replaced. Shows the 4 landmark names and tier logic (getTier function, fog inversion) — visual language reference
- `src/components/KingdomMap.module.css` — Tier CSS classes (flourishing/neutral/declining) — color palette reference

### Host Integration
- `src/pages/Host.jsx` — Lines 10, 372, 437, 522: KingdomMap import and 3 render locations to replace with lazy-loaded 3D scene
- `src/components/WorldStatePanel.jsx` — Meter bars that display alongside the scene — must coexist visually

### Dependencies (already installed)
- `three ^0.183.2` — Three.js core
- `@react-three/fiber ^9.5.0` — React renderer for Three.js
- `@react-three/drei ^10.7.7` — Helpers including useGLTF, OrbitControls, Stars

### Requirements
- `.planning/REQUIREMENTS.md` — THREE-01, THREE-02, THREE-03, THREE-06, THREE-07 (this phase)
- `.planning/ROADMAP.md` §Phase 9 — Success criteria (5 items)

### Design Language
- `CLAUDE.md` §3D City — Threshold event specs, meter visualization descriptions, interesting combinations
- `CLAUDE.md` §Key Design Decisions — Why Three.js only on host screen

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CityScene.jsx` — R3F Canvas + component architecture is reusable even though geometry will be replaced. FogController, CameraRig, Particles, Water patterns can be adapted.
- `CityPlaceholder.jsx` — SVG fallback for Suspense loading state — use as-is.
- `@react-three/drei` useGLTF hook — already available, handles .glb loading and caching.

### Established Patterns
- R3F component-per-landmark pattern (Bridge, Lighthouse, CityBuildings, FogController) — keep this architecture, swap geometry from procedural to GLTF.
- `useFrame()` for per-frame updates (lighthouse rotation, water animation, particle drift).
- `useEffect()` for fog density updates on worldState change.
- Framer Motion AnimatePresence in Host.jsx — 3D Canvas must coexist with page transitions.

### Integration Points
- `Host.jsx` line 10: `import KingdomMap` → becomes `const KingdomScene = lazy(() => import(...))`
- `Host.jsx` lines 372, 437, 522: `<KingdomMap worldState={worldState} />` → `<Suspense><KingdomScene worldState={worldState} /></Suspense>`
- `public/models/` directory: new — GLTF assets committed here for Vite to serve statically
- `worldState` prop shape: `{ trust, courage, solidarity, awareness }` each 0–100 — unchanged

</code_context>

<specifics>
## Specific Ideas

- The scene should feel like looking down at a kingdom at night from a slight elevation — consistent with "the council observes the realm" framing
- Amber glow is the signature color — all lit landmarks should pulse warm amber/gold, matching the existing app palette (`#f59e0b`, `#c89b3c`)
- Stars already implemented via drei `<Stars>` component — keep this for atmosphere
- Slow ambient camera drift (already in CameraRig) gives the scene life without distracting from the HUD overlay
- The CLAUDE.md "interesting combinations" section describes visual storytelling moments: "lighthouse blazing over a blackout skyline" — these should be achievable with the material/lighting approach

</specifics>

<deferred>
## Deferred Ideas

- HUD overlay unification (3D scene + panels as one visual language) — Phase 10 (HOSTUX-01)
- Dramatic round-close reveal animation — Phase 10 (THREE-05, HOSTUX-02)
- Animated model parts (bridge splitting, beacon rotating mechanically) — v2 if GLTF models support it
- Particle effects per landmark (fireflies, embers) — Claude's discretion within performance budget, or defer to Phase 10

</deferred>

---

*Phase: 09-three-js-host-scene*
*Context gathered: 2026-03-28*
