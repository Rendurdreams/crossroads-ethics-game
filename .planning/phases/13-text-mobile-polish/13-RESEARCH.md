# Phase 13: Text & Mobile Polish - Research

**Researched:** 2026-03-30
**Domain:** CSS responsive design, UI copy, React prop updates
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Meter Label Rework**
- D-01: Replace all kingdom-themed meter labels: Bridge of Accord -> Honesty, Citadel Beacon -> Courage (unchanged), Village Quarter -> Loyalty, Fog of the Vale -> Empathy
- D-02: Same names on both host (WorldStatePanel) and player (Play.jsx MeterBar instances) — no split
- D-03: Update all meter label references: WorldStatePanel.jsx, Play.jsx (two locations), and any host end screen meter displays

**Text Readability Pass**
- D-04: Rewrite all 12 ARC_NARRATIVES in FrameworkProfile.jsx using "introduce then define" pattern
- D-05: Rewrite all 4 FRAMEWORKS descriptions in frameworks.js — shorter, punchier, relatable for high schoolers
- D-06: Keep all kingdom atmospheric copy as-is ("The council awaits your decree", etc.) — fantasy framing stays
- D-07: End screen section headers, conflict descriptions, moral arc narratives — "introduce then define" pattern where academic terms appear

**375px Mobile Layout**
- D-08: Audit ALL pages: Play.jsx, Baseline.jsx, FrameworkProfile.jsx, Landing.jsx, Host.jsx, HostSetup.jsx
- D-09: CSS approach: fluid/responsive (clamp(), min(), relative units) PLUS @media (max-width: 390px) for hard overrides
- D-10: SVG conflict diagram in FrameworkProfile — use viewBox with percentage width, reposition circles/text by container width
- D-11: Current max-width:480px + 24-32px padding = ~311-327px content. Padding reduces at 390px breakpoint

### Claude's Discretion
- Specific font-size reductions at 390px breakpoint
- Whether to use clamp() for font-size, padding, or both
- Order of component audit — most impactful files first
- Whether HostSetup pack selection cards need layout changes at small widths

### Deferred Ideas (OUT OF SCOPE)
None.
</user_constraints>

---

## Summary

Phase 13 has three parallel workstreams: (1) meter label renames across 4 files, (2) text rewrites across 2 files, and (3) CSS breakpoint additions across 8 CSS module files. All are mechanical changes with no new dependencies, no schema changes, and no Supabase involvement.

The meter label rename affects exactly 6 MeterBar call sites (WorldStatePanel.jsx lines 46-49, Play.jsx lines 480-483 and 561-564, Host.jsx lines 548-551) plus an independent ImpactMeter system inside ConsequenceReveal.jsx that already uses the raw conceptual names (Trust, Courage, Solidarity, Awareness) — those match the new scheme and need no changes except Solidarity->Loyalty and Awareness->Empathy.

The mobile issue is concrete: `max-width: 480px` + `padding: 32px 24px` leaves only 327px of content width on a 375px screen. Reducing padding to `16px` at the 390px breakpoint restores that to 343px — a meaningful gain. No @media breakpoints exist anywhere in the codebase currently, so this phase writes all of them from scratch.

**Primary recommendation:** Sequence as three separate waves — meter labels first (smallest scope, zero risk), text rewrites second (highest craft value), mobile CSS last (most files touched, benefits from clean baseline).

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| CSS Modules | Built-in (Vite) | All component styles | Established pattern across every component in this project |
| Framer Motion | 11.x (installed) | Animation on FrameworkProfile.jsx | Already in use — text rewrites must not break motion variants |

### No New Dependencies
This phase adds zero new packages. All work is:
- JSX prop changes (meter labels)
- JavaScript object literal rewrites (ARC_NARRATIVES, FRAMEWORKS)
- CSS additions to existing `.module.css` files

**Installation:** None required.

---

## Architecture Patterns

### Meter Label Rename — Call Site Inventory

All 6 MeterBar call sites in the codebase, confirmed by grep:

```
src/components/WorldStatePanel.jsx   lines 46-49   (host round panel)
src/pages/Play.jsx                   lines 480-483  (passer consequence view)
src/pages/Play.jsx                   lines 561-564  (late-arrival waiting state)
src/pages/Host.jsx                   lines 548-551  (host end screen meters)
```

Current labels and replacements per D-01:
| Current Label     | New Label | Meter Key   |
|-------------------|-----------|-------------|
| Bridge of Accord  | Honesty   | trust       |
| Citadel Beacon    | Courage   | courage     |
| Village Quarter   | Loyalty   | solidarity  |
| Fog of the Vale   | Empathy   | awareness   |

**ConsequenceReveal.jsx is a special case.** It does NOT use MeterBar — it uses an inline `ImpactMeter` function component. Current labels at lines 65-68: `"Trust"`, `"Courage"`, `"Solidarity"`, `"Awareness"`. Under D-01, these become: `"Honesty"`, `"Courage"`, `"Loyalty"`, `"Empathy"`. These are 4 additional label string changes not covered by the MeterBar grep.

**KingdomScene.jsx is exempt.** It contains references to "Bridge of Accord", "Citadel Beacon", "Village Quarter" as comment strings inside Three.js scene construction code — not UI labels. D-06 keeps kingdom atmospheric copy intact.

### Text Rewrite Locations

**File 1: `src/lib/frameworks.js` — FRAMEWORKS object**

4 `description` fields need rewriting. Current text is textbook-formal ("The right action is the one that produces the best outcome for the most people. Results justify means."). D-05 requires conversational language that still communicates the framework accurately. The `name` and `question` fields are NOT being changed.

Change is self-contained: FrameworkProfile.jsx and ConsequenceReveal.jsx import FRAMEWORKS and display `description` — rewrites propagate automatically to both.

**File 2: `src/components/FrameworkProfile.jsx` — ARC_NARRATIVES object**

12 entries at lines 17-29. Each maps a `"early->late"` transition key to a narrative string. Current text uses academic language ("teleological reasoning", "Gilligan described", "particularist to universalist"). D-04 requires "introduce then define": keep the term, immediately define it in plain language.

Pattern example:
- Current: `"Philosophers call this the shift from teleological to deontological reasoning."`
- Target: `"Philosophers call this shift teleological reasoning — judging actions by their results — moving toward something more rule-bound."`

The 12 keys are:
```
consequentialism->deontology, consequentialism->care, consequentialism->virtue,
deontology->consequentialism, deontology->care, deontology->virtue,
care->consequentialism, care->deontology, care->virtue,
virtue->consequentialism, virtue->deontology, virtue->care
```

### Mobile CSS Breakpoint Pattern

No `@media` breakpoints exist anywhere in the codebase. This phase writes the first ones. The established pattern is CSS Modules with `@media (max-width: 390px)` blocks added at the bottom of each `.module.css` file.

**The padding math:**
- Current: `max-width: 480px` + `padding: 24px` on each side = 432px used, but viewport is only 375px so the max-width clamps to 375px, leaving `375 - 48 = 327px` content width
- At 390px breakpoint: reduce padding to `16px` → `375 - 32 = 343px` content width (+16px gain)
- `padding: 32px 24px` variant: reduce to `24px 16px` at breakpoint

**`clamp()` candidates (per D-09):**
- Font sizes currently set as fixed `rem`/`px` values — serif scenario text at `21px`, reflection questions at `21px`, and consequence text at `19px` may feel large on 375px
- Candidate: `font-size: clamp(17px, 5.5vw, 21px)` for serif body text
- Candidate: `font-size: clamp(16px, 5vw, 19px)` for consequence narrative
- The `clamp(2.5rem, 8vw, 3.5rem)` pattern already used in Landing.module.css for the title — this is the project's established clamp idiom

### SVG Conflict Diagram Responsive Fix

Current in FrameworkProfile.jsx (lines 221-265):
```jsx
<svg
  className={styles.conflictSvg}
  width="240"
  height="80"
  viewBox="0 0 240 80"
  aria-hidden="true"
>
```

On 375px - 32px padding = 343px available width. The SVG at `width="240"` fits, but the circles at `cx="40"` and `cx="200"` leave only 40px margin on each side — workable but tight. The real risk is at very small screens (< 320px) where overflow can occur.

Fix per D-10: remove the `width="240"` attribute, keep `viewBox="0 0 240 80"`, add `width="100%"`. The SVG will scale to container width while maintaining aspect ratio. The `height="80"` attribute also becomes redundant once width is fluid — remove it too and let aspect ratio govern.

```jsx
<svg
  className={styles.conflictSvg}
  viewBox="0 0 240 80"
  width="100%"
  aria-hidden="true"
>
```

The circle positions at `cx="40"` and `cx="200"` remain correct within the viewBox coordinate space — they scale proportionally with the SVG.

### Per-File Breakpoint Audit

**Play.module.css** (highest priority — player primary screen)
- `.gameContent`: `max-width: 480px; padding: 32px 24px 48px` → at 390px: `padding: 24px 16px 48px`
- `.passConsequence`: `padding: 32px 24px` → at 390px: `padding: 24px 16px`
- `.reflectionQuestion`, `.reflectionRoundQuestion`: `font-size: 21px` → clamp at 390px
- `.page`: `padding: 24px` → at 390px: `padding: 16px`

**FrameworkProfile.module.css** (end screen — heavy content on phone)
- `.wrapper`: `padding: 32px 24px 48px` → at 390px: `padding: 24px 16px 48px`
- `.sectionCard`, `.conflictSection`, `.moralsSection`: `padding: 24px` → at 390px: `padding: 16px`
- `.frameworkName`: `font-size: 28px` — review if it wraps on 375px (4+ chars like "Consequentialism")
- `.explanation`: `font-size: 21px` → clamp candidate

**Baseline.module.css** (pre-game survey — first thing players see)
- `.content`: `max-width: 480px; padding: 32px 24px 48px` → at 390px: `padding: 24px 16px 48px`
- `.stanceText`: `font-size: 21px; line-height: 1.75` → clamp candidate
- `.card`: `padding: 28px 24px` → at 390px: `padding: 20px 16px`

**Landing.module.css** (join screen)
- Already uses `clamp(2.5rem, 8vw, 3.5rem)` for title — no change needed
- `.section`: `max-width: 400px; padding: 24px` — fits on 375px (400px > 375px so clamps to viewport, 24px*2=48px leaves 327px). Same reduction applies: at 390px `padding: 16px`

**HostSetup.module.css** (pack selection — host only, usually on laptop)
- `.packRow`: `display: flex; gap: 16px; max-width: 900px` — horizontal flex with 3 cards. On mobile this stacks awkwardly. However, HostSetup is a host-only screen, typically viewed on a laptop/projector. Jay's discretion whether cards need wrapping on small widths.
- If fix needed: at 390px add `flex-wrap: wrap` to `.packRow`

**Host.module.css** (host dashboard — laptop screen, not phone)
- Fixed-position HUD pills designed for full-screen desktop. No mobile breakpoints needed — host always presents from a laptop.

**ScenarioCard.module.css** (rendered inside Play.jsx gameContent wrapper)
- `.card`: `padding: 28px 24px` — at 390px: `padding: 20px 16px`
- `.body`: `font-size: 21px; line-height: 1.75` → clamp candidate (scenario body is the most-read text)

**ConsequenceReveal.module.css** (rendered full-height after round)
- `.card`: `max-width: 480px; padding: 24px 20px` — at 390px: `padding: 20px 14px`
- `.consequence`: `font-size: 19px` → clamp candidate

### Anti-Patterns to Avoid

- **Changing kingdom atmospheric strings (D-06):** Do not change "The council awaits your decree", "Your counsel has been sealed", "THE REALM" section headers, or any play-state copy. Only meter label props and the framework description/ARC_NARRATIVE objects change.
- **Changing `question` fields in frameworks.js:** D-05 scopes only the `description` field. The `question` field is used separately in ConsequenceReveal.jsx and should remain unchanged.
- **Using `width` media queries on Host.jsx:** Host page is a full-screen canvas with fixed-position HUD pills designed for desktop. Responsive CSS there would conflict with the fixed-position layout.
- **Removing hardcoded pixel coordinates inside the SVG viewBox:** The circle positions (`cx="40"`, `cx="200"`) and text positions are in viewBox coordinate space — they do not need changing when the SVG scales via `width="100%"`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fluid font scaling | Custom JS-based resize listeners | CSS `clamp()` | Native, performant, no JS needed |
| SVG responsive scaling | JS canvas redraws or resize events | `viewBox` + `width="100%"` | SVG intrinsic scaling handles this |
| Breakpoint logic | JS `window.matchMedia` hooks | `@media` in CSS Modules | CSS handles it; no React state needed |

---

## Common Pitfalls

### Pitfall 1: ConsequenceReveal ImpactMeter uses raw strings, not a prop rename
**What goes wrong:** Developer updates all 6 MeterBar call sites but misses the 4 `ImpactMeter` string literals inside ConsequenceReveal.jsx (lines 65-68). These are not MeterBar components — they are an inline function component that take a `label` prop directly.
**Why it happens:** The grep pattern for "Bridge of Accord" etc. catches MeterBar call sites but ConsequenceReveal already used the plain names (Trust, Courage, Solidarity, Awareness), so it doesn't appear in that grep. However Solidarity→Loyalty and Awareness→Empathy must still be updated there.
**How to avoid:** After updating MeterBar call sites, explicitly check ConsequenceReveal.jsx lines 65-68 for Solidarity and Awareness.

### Pitfall 2: `max-width: 480px` does not cause overflow — it just wastes space
**What goes wrong:** Confusion about why 375px phones need fixing. The `max-width: 480px` container doesn't overflow — it simply clamps to 375px viewport width. The problem is the 24px or 32px padding consuming 48-64px of that already-constrained 375px. Content area shrinks to 311-327px.
**Why it happens:** The issue is invisible on desktop (where viewport >> max-width) but apparent on phone.
**How to avoid:** Reduce padding at the 390px breakpoint, not max-width. Changing max-width is not needed.

### Pitfall 3: SVG text labels may clip at very small widths
**What goes wrong:** After making the SVG `width="100%"`, the framework name labels at y="72" (below the circles) could become hard to read on screens narrower than 320px because the text scales down proportionally with the SVG.
**Why it happens:** SVG text is rendered in viewBox coordinate space, so it scales with the SVG transform.
**How to avoid:** The target screen is 375px minimum — at that width the SVG renders at full 100% = 375px wide (minus padding = ~343px), which comfortably fits the 240px viewBox content. Only becomes an issue below 280px viewport, which is not a target device.

### Pitfall 4: ARC_NARRATIVE rewrites that accidentally introduce NEW jargon
**What goes wrong:** Rewriting "teleological reasoning" introduces "consequentialist teleology" or another term that's equally opaque.
**Why it happens:** Philosophy vocabulary is interconnected.
**How to avoid:** The "introduce then define" pattern is the explicit guard: write the term, then immediately follow it with a plain-language em-dash definition. "Philosophers call this teleological thinking — judging actions by their results." The student learns both the term and its meaning in one sentence.

### Pitfall 5: Framer Motion stagger animation breaks when text reflows
**What goes wrong:** ARC_NARRATIVE text rewrites cause longer strings that change section heights. Framer Motion's staggered entrance animation (`staggerChildren: 0.25`, section `duration: 0.5`) is driven by opacity/transform, not height — so there is no breakage. However, if text is dramatically longer, visual clumping at the bottom of the end screen worsens.
**Why it happens:** FrameworkProfile.module.css wrapper uses `flex-direction: column` with no max-height constraint.
**How to avoid:** Keep rewrites comparable in length to originals (2-3 sentences max). The animation logic in FrameworkProfile.jsx does not need changes.

---

## Code Examples

### Meter Label Change (any of the 6 MeterBar call sites)
```jsx
// Before (WorldStatePanel.jsx lines 46-49)
<MeterBar label="Bridge of Accord" value={worldState?.trust ?? 50} />
<MeterBar label="Citadel Beacon" value={worldState?.courage ?? 50} />
<MeterBar label="Village Quarter" value={worldState?.solidarity ?? 50} />
<MeterBar label="Fog of the Vale" value={worldState?.awareness ?? 50} />

// After
<MeterBar label="Honesty" value={worldState?.trust ?? 50} />
<MeterBar label="Courage" value={worldState?.courage ?? 50} />
<MeterBar label="Loyalty" value={worldState?.solidarity ?? 50} />
<MeterBar label="Empathy" value={worldState?.awareness ?? 50} />
```

### ConsequenceReveal ImpactMeter labels
```jsx
// Before (ConsequenceReveal.jsx lines 65-68)
<ImpactMeter label="Trust" value={worldState.trust} />
<ImpactMeter label="Courage" value={worldState.courage} />
<ImpactMeter label="Solidarity" value={worldState.solidarity} />
<ImpactMeter label="Awareness" value={worldState.awareness} />

// After
<ImpactMeter label="Honesty" value={worldState.trust} />
<ImpactMeter label="Courage" value={worldState.courage} />
<ImpactMeter label="Loyalty" value={worldState.solidarity} />
<ImpactMeter label="Empathy" value={worldState.awareness} />
```

### CSS Breakpoint Addition Pattern (for any .module.css file)
```css
/* Add at bottom of Play.module.css, FrameworkProfile.module.css, etc. */
@media (max-width: 390px) {
  .gameContent {
    padding: 24px 16px 48px;
  }
  .page {
    padding: 16px;
  }
}
```

### ScenarioCard body — clamp example
```css
/* ScenarioCard.module.css */
.body {
  font-family: var(--serif);
  font-size: 21px;    /* current */
  line-height: 1.75;
  color: var(--text-h);
  margin: 0 0 24px 0;
}

@media (max-width: 390px) {
  .body {
    font-size: clamp(17px, 5.5vw, 21px);
  }
}
/* Note: 5.5vw at 375px = 20.6px. clamp floor of 17px activates below ~309px. */
```

### SVG Conflict Diagram — responsive fix
```jsx
// Before (FrameworkProfile.jsx line 222-225)
<svg
  className={styles.conflictSvg}
  width="240"
  height="80"
  viewBox="0 0 240 80"
  aria-hidden="true"
>

// After
<svg
  className={styles.conflictSvg}
  viewBox="0 0 240 80"
  width="100%"
  aria-hidden="true"
>
```

### FRAMEWORKS description rewrite pattern (frameworks.js)
```javascript
// Before (consequentialism) — textbook formal
description: 'The right action is the one that produces the best outcome for the most people. Results justify means. Numbers matter.'

// After — introduce then define, conversational, same meaning
description: 'Do whatever produces the best result for the most people. If lying saves five lives, you lie. Outcomes are what count — the ends can justify the means.'
```

### ARC_NARRATIVE "introduce then define" pattern
```javascript
// Before
'consequentialism->deontology': 'You moved from optimizing for outcomes to holding principles regardless of cost. Philosophers call this the shift from teleological to deontological reasoning.'

// After — term introduced, immediately defined inline
'consequentialism->deontology': 'You moved from weighing outcomes to holding rules that don\'t bend. Philosophers call this shift moving from teleological reasoning — judging actions by their results — toward deontology: following a duty because it\'s right, full stop.'
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Fixed pixel font sizes | `clamp()` for fluid scaling | CSS spec, 2020+ | No JS resize listeners needed |
| `width` on SVG | `viewBox` + `width="100%"` | SVG 1.1 standard | Scales to container without JS |
| Per-component breakpoints | CSS Modules `@media` blocks | Established pattern | Scoped to component, no specificity issues |

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — all changes are CSS/JSX/JS string edits in existing files).

---

## Open Questions

1. **HostSetup pack cards at narrow widths**
   - What we know: `.packRow` is `display: flex; gap: 16px; max-width: 900px` with 3 side-by-side cards. On 375px this squeezes cards to ~109px each — likely too narrow to read.
   - What's unclear: Is HostSetup ever used on a phone? Per the game spec, the host always presents from a laptop/projected screen. D-08 includes it in the audit but HostSetup is host-only.
   - Recommendation: Add `flex-wrap: wrap` at 390px breakpoint as a safety measure. Wrapping won't hurt the desktop experience. Low priority — implement last.

2. **"THE REALM" section labels in ConsequenceReveal.jsx and Play.jsx**
   - What we know: The section headers `"THE REALM"` label appears above the meter bars in both ConsequenceReveal.jsx (line 63) and Play.jsx (line 479, 558). These are kingdom-framing labels, not meter labels — covered by D-06 (keep kingdom copy intact).
   - What's unclear: Whether a player encountering "THE REALM / Honesty / Loyalty" feels jarring — realm framing with non-kingdom meter names.
   - Recommendation: Leave "THE REALM" label unchanged per D-06. The meter names are the conceptual bridge; the section header is atmospheric. Jay can evaluate during testing if the tension feels off.

---

## Sources

### Primary (HIGH confidence)
- Direct source code inspection — WorldStatePanel.jsx, Play.jsx, Host.jsx, ConsequenceReveal.jsx, FrameworkProfile.jsx, frameworks.js, and all 8 CSS Module files
- 13-CONTEXT.md — all decisions confirmed against actual code state

### Secondary (MEDIUM confidence)
- CSS `clamp()` spec — widely supported, used already in Landing.module.css in this codebase
- SVG `viewBox` + `width="100%"` pattern — standard approach, no library needed

---

## Metadata

**Confidence breakdown:**
- Meter label locations: HIGH — confirmed by grep across entire src/ tree
- Mobile padding math: HIGH — computed from actual CSS values in file
- SVG fix approach: HIGH — standard SVG scaling pattern, viewBox already present
- Text rewrite patterns: HIGH — source text read directly, "introduce then define" pattern specified in decisions
- HostSetup mobile behavior: MEDIUM — deferred to Claude's discretion per context

**Research date:** 2026-03-30
**Valid until:** 2026-04-30 (stable domain — CSS/JSX, no external API dependencies)
