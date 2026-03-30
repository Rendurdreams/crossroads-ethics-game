# Phase 13: Text & Mobile Polish - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Every player-facing label, narrative, and UI element reads naturally for a high school audience and renders cleanly on a 375px phone screen. Meter names connect to the moral reasoning the game teaches. Academic jargon is eliminated or defined inline. Mobile typography/spacing passes a visual audit on all pages.

</domain>

<decisions>
## Implementation Decisions

### Meter Label Rework
- **D-01:** Replace all kingdom-themed meter labels with moral concept names: Trust/Bridge of Accord -> **Honesty**, Courage/Citadel Beacon -> **Courage** (unchanged), Solidarity/Village Quarter -> **Loyalty**, Awareness/Fog of the Vale -> **Empathy**
- **D-02:** Same names on both host (WorldStatePanel) and player (Play.jsx MeterBar instances) screens — no split between host/player labeling
- **D-03:** Update all meter label references: WorldStatePanel.jsx (host), Play.jsx (player round view, consequence view, waiting states), and any host end screen meter displays

### Text Readability Pass
- **D-04:** Rewrite all 12 ARC_NARRATIVES in FrameworkProfile.jsx using "introduce then define" pattern — keep philosophy terms but always define them inline (e.g., "Philosophers call this teleological reasoning — judging actions by their results")
- **D-05:** Rewrite all 4 FRAMEWORKS descriptions in frameworks.js to be shorter, punchier, and relatable for high schoolers. Current textbook-style definitions replaced with conversational language
- **D-06:** Keep all kingdom atmospheric copy as-is ("The council awaits your decree", "Your counsel has been sealed", etc.) — the fantasy framing IS the game personality and stays for all packs
- **D-07:** End screen section headers, conflict descriptions, moral arc narratives, and any other player-facing philosophical text should use the "introduce then define" pattern where academic terms appear

### 375px Mobile Layout
- **D-08:** Audit ALL pages for mobile: Play.jsx, Baseline.jsx, FrameworkProfile.jsx, Landing.jsx, Host.jsx, HostSetup.jsx — not just player screens
- **D-09:** CSS approach: generally fluid/responsive (clamp(), min(), relative units) PLUS a @media (max-width: 390px) breakpoint for hard overrides where needed
- **D-10:** SVG conflict diagram in FrameworkProfile made responsive — use viewBox with percentage width, reposition circles/text based on container width
- **D-11:** Current max-width:480px with 24-32px padding gives ~311-327px content on 375px. Padding should reduce at the 390px breakpoint to maximize content area

### Claude's Discretion
- Specific font-size reductions at 390px breakpoint — Claude determines the right values based on visual testing
- Whether to use clamp() for font-size, padding, or both — implementation detail
- Order of component audit — Claude picks the most impactful files first
- Whether HostSetup pack selection cards need layout changes at small widths

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Meter Labels (source of truth for current labels)
- `src/components/WorldStatePanel.jsx` — Host-side meter labels (lines 46-49)
- `src/components/MeterBar.jsx` — MeterBar component accepts `label` prop
- `src/pages/Play.jsx` — Player-side meter labels (lines 480-483, 561-564)

### Text Content (source of truth for narratives and frameworks)
- `src/components/FrameworkProfile.jsx` — ARC_NARRATIVES object (lines 16-29), all end screen text
- `src/lib/frameworks.js` — FRAMEWORKS definitions (description, name, question fields)

### Mobile Layout (current CSS)
- `src/pages/Play.module.css` — Player page styles (max-width:480px, padding values)
- `src/pages/Landing.module.css` — Landing/join page styles
- `src/pages/Host.module.css` — Host dashboard styles
- `src/pages/HostSetup.module.css` — Host setup page styles
- `src/pages/Baseline.module.css` — Moral baseline page styles
- `src/components/FrameworkProfile.module.css` — End screen profile styles
- `src/components/ScenarioCard.module.css` — Scenario display styles
- `src/components/ConsequenceReveal.module.css` — Consequence screen styles

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- MeterBar.jsx: Simple component accepting `label` and `value` props — label rename is a prop change at call sites, not component internals
- CSS Modules pattern: Every component uses `.module.css` — breakpoint additions go into the corresponding module file
- Framer Motion: FrameworkProfile uses motion variants for staggered section animation — text rewrites don't affect animation logic

### Established Patterns
- No @media breakpoints exist anywhere in the codebase currently — this phase introduces the first ones
- `max-width: 480px` used as the content container width on player screens
- `padding: 24px` and `padding: 32px 24px` are the standard player-screen spacing values
- Font sizes range from 0.75rem to 3rem across Play.module.css
- SVG elements in FrameworkProfile use hardcoded pixel dimensions (240x80)

### Integration Points
- Meter labels appear in 3 locations: WorldStatePanel.jsx (host), Play.jsx round view, Play.jsx consequence/waiting states
- FRAMEWORKS object in frameworks.js is imported by FrameworkProfile.jsx and Play.jsx — description rewrites propagate automatically
- ARC_NARRATIVES is local to FrameworkProfile.jsx — self-contained rewrite

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches within the decisions above.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 13-text-mobile-polish*
*Context gathered: 2026-03-30*
