# Phase 10: Host UX Unification + Reveal Beat - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Polish the host screen into a cinematic presentation tool. The 2D kingdom canvas fills the entire screen. All UI is a thin game-style glass HUD floating over the canvas. The round-close moment creates a dramatic visual beat. The lesson content is a manual popup the presenter controls. The canvas visuals get a quality pass (colors, buildings, particles, transitions).

The host screen IS the presentation — not a dashboard with a background.

</domain>

<decisions>
## Implementation Decisions

### Canvas Visual Quality
- **D-01:** Particles → subtle ambient only. Max 10-15 on screen. Barely-visible drifting motes when thriving, faint ember glow near fires when fallen. Kill the current ugly particle system entirely and replace with this minimal approach.
- **D-02:** Canvas color rework — richer, more distinct color stops across the 3-stop fallen/neutral/thriving lerp. Fallen = deeper reds/purples/blood tones. Thriving = warmer golds/greens. The shifts between states should be dramatic, not muddy.
- **D-03:** Building detail upgrade — more interesting rooflines, window patterns, chimney smoke silhouettes on cottages and castle. The buildings should read as a stylized illustrated kingdom, not programmer-art rectangles.
- **D-04:** State transitions need more drama — when world state changes after a round, the audience should notice the shift. Colors sweep, buildings scale, fog rolls. The canvas change between rounds is a visual event, not a subtle drift.

### Round-Close Reveal Beat
- **D-05:** Two-phase reveal flow after host clicks "Close Round":
  - Phase 1 (~3s): Full-screen canvas dramatic shift only, no text overlay. Canvas rapidly lerps from current state to new state — sky color sweeps, buildings grow/shrink, fog rolls in/out. Meters show +/- deltas. The audience watches the kingdom react. Jay narrates over this.
  - Phase 2 (manual): Nothing happens automatically after the shift. A glowing [Lesson] button appears in the HUD. Jay clicks it when ready → lesson overlay fades in (canvas dims to ~30%, large centered text). Jay clicks [Next Dilemma] to dismiss and advance.
- **D-06:** Reveal beat total duration = 2-3 seconds for the canvas shift. Quick enough to keep energy up in a 15-min presentation.

### Game-Style Glass HUD
- **D-07:** Canvas fills 100% of the host screen at all times. All UI elements float over it as translucent glass pills/overlays — like a modern game HUD that blends into the scene. Not panels, not sidebars, not dashboards.
- **D-08:** Always visible elements (minimal):
  - Top corner: room code + round number (small glass pill)
  - Bottom corner: timer countdown + "X/Y submitted" count
  - That's it. Everything else is hidden or toggled.
- **D-09:** Kingdom meters (trust/courage/solidarity/awareness) are NOT always visible. They appear as part of the reveal beat (delta numbers), then can be toggled if needed. Keeps the canvas clean.
- **D-10:** Vote tally is toggle-on — hidden by default, presenter pops it up with a button. Keeps choices private until the presenter decides to reveal. Can show/hide during voting or after close.
- **D-11:** Lesson overlay is fully manual — presenter clicks [Lesson] button after the reveal beat to show it, clicks [Next Dilemma] to dismiss. Full control over pacing and narration.
- **D-12:** No presenter notes. The lesson text on screen is enough to talk from.

### Claude's Discretion
- Exact glass opacity/blur values for HUD elements (should feel like game UI, not a modal)
- Button/hotkey design for toggling vote tally and lesson overlay
- Animation easing curves for the reveal beat canvas lerp
- How meter deltas appear during the reveal (floating numbers? brief flash on the HUD?)
- Whether the lobby view and end view also get the full-screen canvas + minimal HUD treatment
- CSS transition approach for lesson overlay fade-in/out
- Whether to add keyboard shortcuts for presenter flow (spacebar = advance, L = lesson, V = votes)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Current Implementation
- `src/components/KingdomCanvas.jsx` — 2D HTML5 canvas panorama with all drawing functions, particle system, color helpers, themeColor() 3-stop lerp
- `src/pages/Host.jsx` — Current host screen with lesson content, tally, meters, round flow, all three views (lobby/active/end)
- `src/pages/Host.module.css` — Current glass panel styles, HUD layout, lesson styles, meter delta styles

### Game Data
- `src/lib/scenarios.js` — Pack/scenario accessors; each scenario has `teaches` and `moralTension` fields used for lesson content
- `src/lib/frameworks.js` — FRAMEWORKS object with name/description/question per framework; used in lesson callouts

### Requirements
- `.planning/REQUIREMENTS.md` — THREE-04, THREE-05, HOSTUX-01, HOSTUX-02 (this phase)
- `.planning/ROADMAP.md` §Phase 10 — Success criteria (4 items, written for 3D but intent applies to 2D canvas)

### Design Language
- `CLAUDE.md` §Key Design Decisions — "Why Three.js only on host screen" rationale (canvas replaces Three.js but same principle: phones are input, projected screen is output)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `KingdomCanvas.jsx` — Complete 2D drawing pipeline. themeColor() helper, all layer functions (sky, stars, celestial, mountains, ground, trees, village, castle, temple, fog, rain, particles). The StatusBar component below the canvas may need to be absorbed into the HUD.
- `Host.jsx` — Already has lesson content wiring: `currentScenario.teaches`, `currentScenario.moralTension`, `frameworksUsedThisRound()`, `dominantFrameworkThisRound()`, `impactNarrative()`, `MeterWithDelta` component, `computeTally()` with framework labels.
- `Host.module.css` — Glass panel system (`.glassPanel`, backdrop-filter blur, amber glow box-shadows). These styles are the starting point for the game HUD pills.

### Established Patterns
- CSS custom properties: `--glass-bg`, `--glass-border`, `--blur-glass`, `--accent` (#f59e0b amber), `--serif` (Playfair Display), `--sans` (Inter)
- Framer Motion is installed (^11.13.5) but not used in Host.jsx currently — available for reveal beat animations
- `prevWorldRef` already tracks previous world state for delta computation

### Integration Points
- KingdomCanvas accepts `worldState` prop OR `health` prop — the rapid lerp for the reveal beat can be triggered by changing `targetHealth` speed
- KingdomCanvas exposes `setKingdomHealth(value)` via ref imperative handle — can drive reveal beat externally
- Host.jsx `roundState.roundClosed` boolean tracks when round is closed — drives the reveal beat trigger

</code_context>

<specifics>
## Specific Ideas

- The HUD should feel like a modern game UI — think Elden Ring or Breath of the Wild compass/health bars, not a web app dashboard
- Glass elements should be very thin, high blur, low opacity — they exist but don't compete with the canvas
- The [Lesson] button should glow amber when available, drawing the presenter's eye without shouting
- The reveal beat should make the audience look up at the projected screen — the visual shift is a presentation moment
- Jay is presenting to a college class of 10-25 people from a projector. The host screen is the ONLY thing projected. Everything on it needs to read from the back of the room.

</specifics>

<deferred>
## Deferred Ideas

- Keyboard shortcuts for presenter flow (spacebar, L, V keys) — could add in this phase or defer to final polish
- Sound effects for reveal beat — would be great but adds complexity and might not work reliably on presentation hardware
- Audience reaction indicators (emoji rain, applause animation) — scope creep, own phase
- Mobile-optimized host view — not needed, host is always on a laptop/projector

</deferred>

---

*Phase: 10-host-ux-unification-reveal-beat*
*Context gathered: 2026-03-28*
