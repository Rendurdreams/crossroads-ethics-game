# Phase 14: Animated Kingdom Map - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace KingdomCanvas (2D HTML5 Canvas silhouette) with AnimatedMap (GSAP-driven parallax map with reactive zones). The integration prototype lives in `/integration/`. This phase copies, adapts, wires, and cleans up — it does NOT redesign the map visuals or add new features to it.

</domain>

<decisions>
## Implementation Decisions

### Component Swap
- **D-01:** AnimatedMap.jsx replaces KingdomCanvas.jsx in all 3 render locations in Host.jsx (lobby background, active round, end screen)
- **D-02:** The map image (Map1.png) goes to `src/assets/Map1.png`; component + CSS module go to `src/components/`
- **D-03:** AnimatedMap receives `worldState` as-is (`{ trust, courage, solidarity, awareness }`). Add a key mapping INSIDE AnimatedMap.jsx at the top: `trust→Honesty, courage→Courage, solidarity→Loyalty, awareness→Empathy` — Host.jsx passes props unchanged

### Mouse/Cursor Effects Removal
- **D-04:** Remove all mouse parallax, cursor light, click ripple, and proximity glow logic from AnimatedMap.jsx. The host screen is PROJECTED — no one mouses over it during the presentation. This means: remove `onMouseMove` handler, `cursorLight` element, `updateProximity` function, `clickRipple` logic, and proximity refs. The parallax layers remain but at fixed positions (no mouse-driven movement).
- **D-05:** Zone labels (Dragon's Keep, Crystalvein River, etc.) should be always-visible at reduced opacity (~0.5) instead of proximity-triggered, since there's no mouse hover to reveal them

### Dependencies
- **D-06:** Install `gsap` as a new dependency. Framer Motion stays — they coexist fine
- **D-07:** Add `@keyframes compassSpin` to `src/index.css` (global — required because it's set via inline style in the component)

### Dead Code Cleanup
- **D-08:** Delete `src/components/KingdomScene.jsx` — uses R3F imports but is NEVER imported anywhere (dead code from Phase 9 that was superseded by KingdomCanvas)
- **D-09:** Delete `src/components/CityScene.jsx` — original Three.js city scene, also dead code
- **D-10:** Delete `src/components/KingdomCanvas.jsx` after AnimatedMap is confirmed working
- **D-11:** Three.js (`three`, `@react-three/fiber`, `@react-three/drei`) are NOT in package.json — no npm uninstall needed. The R3F imports in KingdomScene.jsx were never resolved (dead file).

### Performance
- **D-12:** Particle spawn intervals (embers 300ms, sparks 500ms, dust 1200ms) kept as-is from prototype — these are DOM elements, not canvas, and the count is bounded by GSAP cleanup. Target: 60fps on standard laptop via HDMI projection.

### Claude's Discretion
- The exact number of parallax layers and their depth values can be adjusted during implementation if the fixed (non-mouse-driven) version looks better with different spacing
- Zone position percentages (fireZone top/right, waterZone top/left, etc.) may need minor tuning after seeing the map at full host-screen resolution

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Integration Prototype
- `integration/AnimatedMap.jsx` — Complete working React component with GSAP zones, particles, parallax
- `integration/AnimatedMap.module.css` — All scoped styles for the map component
- `integration/INTEGRATION_PROMPT.md` — Original integration guide with zone↔meter mapping table
- `integration/Map1.png` — The map image asset

### Existing Code (to replace)
- `src/components/KingdomCanvas.jsx` — Current 2D canvas component being replaced (read for prop interface)
- `src/pages/Host.jsx` — Contains 3 `<KingdomCanvas>` render sites to swap (lines ~508, ~586, ~765)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/KingdomCanvas.jsx`: Props interface `{ worldState, health, lerpSpeedRef }` — AnimatedMap matches `worldState` and `lerpSpeedRef` (health not needed)
- `src/index.css`: Global styles and CSS custom properties (--accent, --glass-bg, etc.) — compassSpin keyframe goes here

### Established Patterns
- CSS Modules used throughout (`.module.css` per component)
- `worldState` shape: `{ trust: 0-100, courage: 0-100, solidarity: 0-100, awareness: 0-100 }`
- `lerpSpeedRef` is a React ref with a `.current` number (2 = normal, 8 = fast reveal beat) — AnimatedMap accepts it for compat but uses GSAP's own lerp internally

### Integration Points
- Host.jsx line ~11: `import KingdomCanvas from '../components/KingdomCanvas.jsx'` → change to AnimatedMap
- Host.jsx 3 render sites: lobby canvas div, active round canvas div, end screen canvas div
- The `.canvas` CSS class in Host.module.css wraps the map component — should work as-is with AnimatedMap's `.scene` taking `width: 100%; height: 100%`

</code_context>

<specifics>
## Specific Ideas

- The user described this as "a base of the new look" — the integration prototype is the visual reference, not a starting point for redesign
- Mouse/parallax/cursor effects explicitly removed per user request — host screen is projected, no mouse interaction during presentation
- The user has a Claude artifact with better kingdom visuals (from memory) — this map is the upgrade path toward that quality bar

</specifics>

<deferred>
## Deferred Ideas

- Re-enable mouse parallax/cursor effects as an optional mode for non-projected viewing (demo mode)
- Map zone positions may need tuning per-pack if different packs get different map images
- Threshold event animations (bridge collapse, blackout wave, etc.) from the original CLAUDE.md spec — would be dramatic additions but are new features, not part of this swap

</deferred>

---

*Phase: 14-animated-kingdom-map*
*Context gathered: 2026-03-30*
