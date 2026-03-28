# Phase 9: Three.js Host Scene - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 09-three-js-host-scene
**Areas discussed:** Scene theme, Swap strategy, Visual tiers, Bundle split

---

## Scene Theme

### Q1: What aesthetic should the 3D scene use?

| Option | Description | Selected |
|--------|-------------|----------|
| Kingdom/fantasy | Retheme to match kingdom register — medieval castle, stone bridge, beacon tower, village huts, rolling fog. Heavy geometry rewrite. | ✓ |
| Nighttime city (as-is) | Keep existing cityscape. Minimal rewrite needed. | |
| Hybrid | Dark nighttime atmosphere with ambiguous/fantasy geometry — stone towers instead of skyscrapers. | |

**User's choice:** Kingdom/fantasy
**Notes:** Full commitment to matching the game's kingdom register.

### Q2: How detailed should the kingdom geometry be?

| Option | Description | Selected |
|--------|-------------|----------|
| Low-poly stylized | Simple geometric shapes — cone roofs, box towers. Monument Valley aesthetic. | |
| Moderate detail | Crenellated walls, multi-part bridge, layered terrain. | |
| GLTF models | Pre-made 3D models (.glb files) for landmarks. Best visual quality. | ✓ |

**User's choice:** GLTF models
**Notes:** Going for best visual quality despite added complexity of asset sourcing.

### Q3: Where should GLTF models come from?

| Option | Description | Selected |
|--------|-------------|----------|
| Free assets | Kenney.nl CC0, Poly Pizza, Sketchfab CC-BY. Free, legal, kingdom-themed. | ✓ |
| AI-generated | Meshy, Tripo — custom but variable quality. | |
| Hand-model | Build in Blender — highest control, most time. | |

**User's choice:** Free assets (CC0/CC-BY)
**Notes:** None.

### Q4: How should meter-driven visual changes work with GLTF models?

| Option | Description | Selected |
|--------|-------------|----------|
| Material + lighting shifts | Keep geometry static. Change emissive colors, opacity, light intensity. Simple, performant. | ✓ |
| Material + particle effects | Same as above plus particle systems per landmark. More atmospheric, more GPU. | |
| Animated model parts | Bridge planks separate, beacon rotates mechanically. Requires rigged models. | |

**User's choice:** Material + lighting shifts
**Notes:** No rigging needed. Performant approach.

---

## Swap Strategy

### Q1: Where should the 3D scene render?

| Option | Description | Selected |
|--------|-------------|----------|
| All 3 views | Replace KingdomMap in lobby, active round, and end view. Always visible. | ✓ |
| Active + End only | Keep KingdomMap SVG in lobby for faster load. | |
| Active round only | 3D during gameplay only. | |

**User's choice:** All 3 views
**Notes:** The 3D scene IS the host background, always.

### Q2: What happens to KingdomMap.jsx?

| Option | Description | Selected |
|--------|-------------|----------|
| Remove entirely | Delete KingdomMap.jsx + CSS module. No dead code. | ✓ |
| Keep as fallback | Don't import but keep available for quick swap. | |
| Keep for phones | Move to player phone view as lightweight map. | |

**User's choice:** Remove entirely
**Notes:** Clean break, no fallback.

---

## Visual Tiers

### Q1: How should meter values drive visual changes?

| Option | Description | Selected |
|--------|-------------|----------|
| Continuous (0–100) | Smooth interpolation. Every round produces visible shift. More cinematic. | ✓ |
| 3-tier snap | Flourishing/neutral/declining discrete states. Bigger jumps at boundaries. | |
| Hybrid | Continuous within tiers + dramatic moment at tier crossings. | |

**User's choice:** Continuous
**Notes:** Cinematic feel — every round's choices produce visible world state shift.

### Q2: Threshold events at extremes?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, dramatic thresholds | Below ~20 or above ~85 triggers distinct visual events. Matches CLAUDE.md spec. | ✓ |
| No, continuous only | Pure smooth scaling to 0/100. Simpler. | |
| Defer to Phase 10 | Add threshold events as part of reveal beat work. | |

**User's choice:** Yes, dramatic thresholds
**Notes:** Continuous for normal range, dramatic events at extremes.

---

## Bundle Split

### Q1: How to isolate Three.js from player phone bundle?

| Option | Description | Selected |
|--------|-------------|----------|
| React.lazy in Host | Lazy-load via React.lazy() + Suspense. Vite auto-splits. CityPlaceholder as fallback. | ✓ |
| Vite manual chunks | Configure manualChunks in vite.config.js. | |
| Dynamic import guard | Runtime window.location check. | |

**User's choice:** React.lazy in Host
**Notes:** Zero config, CityPlaceholder.jsx as Suspense fallback.

---

## Claude's Discretion

- Specific GLTF model selection from free asset libraries
- Scene composition, camera placement, drift speed
- Exact threshold values for dramatic events
- Ambient particle effects within performance budget
- Component naming (CityScene → KingdomScene or similar)

## Deferred Ideas

- HUD overlay unification — Phase 10
- Dramatic round-close reveal animation — Phase 10
- Animated model parts — v2
