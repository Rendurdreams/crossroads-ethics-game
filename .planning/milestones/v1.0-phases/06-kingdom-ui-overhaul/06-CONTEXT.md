# Phase 6: Kingdom UI Overhaul - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the Three.js city (CityScene) with a CSS/SVG kingdom map on the host screen; remove the round count selector from HostSetup (pack drives total_rounds); push the fantasy kingdom aesthetic fully through all 4 screens (Landing, HostSetup, Host, Play). No new game mechanics, no new data flows. The game logic is complete — this phase makes the visual world match the kingdom content.

</domain>

<decisions>
## Implementation Decisions

### Kingdom Map — Style & Structure
- **D-01:** Map visual style is **dark glass + amber glows** — consistent with Phase 05.1's cinematic dark aesthetic. Deep midnight background, SVG silhouette terrain (mountain range, river, village cluster, lighthouse/coast), amber glow on landmark icons. Does NOT use parchment/sepia — the existing glass-morphism system carries through.
- **D-02:** Map has **named geographic regions with silhouette shapes** — distinct terrain zones rendered as SVG polygons/paths. Each of the 4 world state landmarks is embedded in its geographic region. Looks like a real fantasy map, not an icon grid.
- **D-03:** The 4 landmark names are locked as specified in requirements: **Bridge of Accord** (trust), **Citadel Beacon** (courage), **Village Quarter** (solidarity), **Fog of the Vale** (awareness). No renaming.
- **D-04:** Map replaces `CityScene` (Three.js) and the existing `CityPlaceholder` component on the host screen. The new component is `KingdomMap` (or similar). `CityScene.jsx` can be deprecated/removed.

### Kingdom Map — Landmark Reactivity
- **D-05:** Landmarks use **3-tier CSS class states** based on world state meter values:
  - `flourishing` — meter ≥ 70: full amber glow, bright SVG fill
  - `neutral` — meter 40–69: moderate glow, medium fill
  - `declining` — meter < 40: dim glow or cool hue, reduced opacity
- **D-06:** State updates use **CSS transitions on class toggle** — consistent with how MeterBar already works. After each round closes and worldState prop updates, classes toggle and CSS `transition` properties animate the visual change. No Framer Motion needed for the map landmark states.

### Meter Bar Labels
- **D-07:** MeterBar labels update to **landmark names everywhere** — both host and player screens. Labels become: "Bridge of Accord" (was "Trust"), "Citadel Beacon" (was "Courage"), "Village Quarter" (was "Solidarity"), "Fog of the Vale" (was "Awareness"). All call sites in Host.jsx and Play.jsx updated.

### HostSetup — Round Selector Removal
- **D-08:** Round count selector (`[3, 4, 5, 6]` buttons) is **removed entirely**. No replacement selector.
- **D-09:** In its place, a **pack identity card** is shown: pack name ("Kingdom of Ash"), short thematic description from `kingdomArcPack.description`, and dilemma count read dynamically from `getPlayableScenarios(pack).length` (= 7). Reads from `scenarios.js` pack helpers — no hardcoding.
- **D-10:** `total_rounds` is set on **session creation in `Landing.jsx`**, in the `createSession()` function: `getPlayableScenarios(getDefaultPack()).length` is computed and passed as the `total_rounds` value in the Supabase insert. HostSetup no longer reads or writes `total_rounds`.

### Landing Page
- **D-11:** Visual centrepiece is a **kingdom title + SVG crest/sigil** — "The Crossroads" in Playfair Display as the hero headline, with a stylized sigil/crest SVG above it. Feels like a game title screen. No map preview on Landing — map lives on the host screen.
- **D-12:** Host/Join copy framing is **minimal neutral fantasy**: Host section → "Begin" (button: "Convene" or "Begin"). Join section → "Enter" (input + button: "Enter"). Short, lets the visual design carry the kingdom tone.

### Host Game View Layout
- **D-13:** Host dashboard uses **~60% map / ~40% panel split** — kingdom map occupies the dominant left portion of the screen (the visual centrepiece for projection), round controls/vote tally/meters on the right panel. Mirrors the Three.js city layout originally planned in CLAUDE.md.

### Play View — Player Phone
- **D-14:** Scenario text is framed in a **scroll/parchment card with decorative amber border** — the existing glass-morphism surface card gets a thin amber/gold border flourish at top and bottom edges (CSS `border-image` or decorative `::before`/`::after` pseudo-elements). Suggests a royal decree or ancient scroll.
- **D-15:** Choice buttons are styled as **decree tiles with Roman numeral prefix**: "I. Share equally", "II. Protect the core", "III. Triage." Roman numerals are prepended to choice text. Button shape can remain similar; glow-on-select from Phase 05.1 carries through. Locked state and framework label reveal timing unchanged.

### Play View — Waiting & Lobby Screens
- **D-16:** Waiting and lobby copy uses **war council atmosphere tone**:
  - Player lobby (waiting for game to start): "The council assembles."
  - After vote submitted, waiting for others: "Awaiting the council's judgment."
  - Between rounds: "The realm weighs your counsel." (or similar)
  - Apply consistently in Play.jsx waiting states. Copy should be short, atmospheric, serious — not gamified.

### Claude's Discretion
- Exact SVG path coordinates and terrain shapes for kingdom map (mountain silhouette, river curve, village cluster, lighthouse shape)
- Specific amber glow `box-shadow` and `filter: drop-shadow()` values for map landmarks per tier
- Sigil/crest SVG design for Landing page hero (simple heraldic shape consistent with existing castle motif in CityPlaceholder)
- Exact Roman numeral rendering (CSS `counter` or text prefix)
- Border flourish implementation detail (CSS `border-image`, pseudo-element lines, or SVG underline)
- Pack identity card layout within HostSetup (typography hierarchy, spacing relative to QR code)
- Whether `CityScene.jsx` is deleted or just unused (planner decides based on import cleanup)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project spec & requirements
- `CLAUDE.md` — Full game spec including world state dimensions, host dashboard layout (65/35 split reference), "Three.js only on host screen" rationale, landmark names (Bridge, Lighthouse, Village Quarter, Fog)
- `.planning/REQUIREMENTS.md` — UI-01 through UI-08 (Phase 6 requirements), VIS-01 through VIS-05 (v2 scope boundary — do not implement)

### Existing code being modified
- `src/pages/Landing.jsx` + `Landing.module.css` — Create/join session flow; `createSession()` must be updated to set `total_rounds` from pack
- `src/pages/HostSetup.jsx` + `HostSetup.module.css` — Round selector removal + pack identity card
- `src/pages/Host.jsx` + `Host.module.css` — Replace `CityScene` with `KingdomMap`; update meter label call sites
- `src/pages/Play.jsx` + `Play.module.css` — Decree tile buttons, scenario card border, waiting copy
- `src/components/CityPlaceholder.jsx` + `CityPlaceholder.module.css` — Starting point / to be replaced by `KingdomMap`
- `src/components/MeterBar.jsx` + `MeterBar.module.css` — Label prop updates at all call sites
- `src/components/WorldStatePanel.jsx` + `WorldStatePanel.module.css` — Uses MeterBar; may need landmark label updates
- `src/lib/scenarios.js` — `getDefaultPack()`, `getPlayableScenarios(pack)` helpers used in Landing.jsx
- `src/lib/scenarios/packs/kingdom-arc.js` — Pack metadata: `name`, `description`, `scenarios[]` — source of truth for pack identity card content

### Prior phase context
- `.planning/phases/05.1-visual-experience-overhaul/05.1-CONTEXT.md` — Glass-morphism system, ambient gradients, Framer Motion setup, CSS custom properties — all carry through and must be respected
- `.planning/phases/03-game-loop/03-CONTEXT.md` — MeterBar, WorldStatePanel, component architecture decisions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **CSS custom properties** (`src/index.css`): `--glass-bg`, `--glass-border`, `--blur-glass`, `--accent`, `--serif`, `--sans` — all continue; new landmark tier vars (e.g. `--landmark-flourishing`, `--landmark-declining`) extend this system
- **Glass-morphism surface pattern**: `background: var(--glass-bg); backdrop-filter: blur(var(--blur-glass)); border: 1px solid var(--glass-border)` — use for KingdomMap panel and pack identity card
- **CSS Modules pattern**: Every component has `.module.css` — all visual changes go through modules
- **`getPlayableScenarios(pack)` + `getDefaultPack()`** in `scenarios.js` — already implemented, use directly in Landing.jsx createSession

### Established Patterns
- State-driven CSS class toggling (MeterBar danger class) — extend this for landmark tier classes
- `worldState` prop passed from Host.jsx to display components — KingdomMap receives same prop
- Framer Motion `pageVariants` pattern in every page — extend, don't replace

### Integration Points
- `Host.jsx` renders `<CityScene worldState={worldState} />` in 3 places — all 3 become `<KingdomMap worldState={worldState} />`
- `Landing.jsx` `createSession()` inserts session row — add `total_rounds: getPlayableScenarios(getDefaultPack()).length` to the insert payload
- MeterBar call sites in Host.jsx and WorldStatePanel.jsx pass `label="Trust"` etc — update to landmark names

</code_context>

<specifics>
## Specific Ideas

- Kingdom map: SVG terrain with mountain silhouettes, a river curve, coastal area for lighthouse — not a geographic diagram, a felt/painted fantasy map aesthetic in dark glass style
- Pack identity card in HostSetup: "Kingdom of Ash / 7 dilemmas" displayed in Playfair Display with the pack description below — feels like a campaign briefing card
- Decree tiles: Roman numeral "I." prefix visually distinct from choice text (smaller, amber color), consistent with editorial aesthetic
- Waiting copy must maintain moral gravity — "awaiting" not "loading", "council" not "players"

</specifics>

<deferred>
## Deferred Ideas

- Animated SVG terrain (rivers flowing, fog drifting on the map) — too complex for this phase; static SVG with CSS glow transitions is sufficient
- Per-landmark threshold events (crack animation, storm clouds) — v2 (VIS-02)
- Parchment/sepia texture overlay — user chose dark glass aesthetic; parchment belongs in a different visual direction
- Map labels in a styled fantasy font (Uncial Antiqua etc.) — Claude's discretion; Playfair Display is sufficient

None that were explicitly in scope

</deferred>

---

*Phase: 06-kingdom-ui-overhaul*
*Context gathered: 2026-03-26*
