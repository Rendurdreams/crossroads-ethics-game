# Phase 13: Text & Mobile Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 13-text-mobile-polish
**Areas discussed:** Meter label rework, Text readability pass, 375px mobile layout

---

## Meter Label Rework

| Option | Description | Selected |
|--------|-------------|----------|
| Replace with moral concept names | Honesty, Courage, Loyalty, Empathy — directly names the moral quality. Clearest for teaching but loses kingdom atmosphere. | ✓ |
| Dual labels: concept + kingdom | Show both: 'Honesty (Bridge of Accord)' — teaches concept while preserving atmosphere. | |
| Keep kingdom names, add tooltips | Bridge of Accord stays as label, brief explanation on first appearance. | |

**User's choice:** Replace with moral concept names
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Honesty, Courage, Loyalty, Empathy | Per roadmap suggestion. All single-word moral qualities. | ✓ |
| Trust, Courage, Unity, Awareness | Keep Trust/Awareness, swap Solidarity→Unity. | |
| Custom names | User provides specific names. | |

**User's choice:** Honesty, Courage, Loyalty, Empathy
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Same names everywhere | Honesty/Courage/Loyalty/Empathy on both host and player. Consistent. | ✓ |
| Kingdom names on host only | Host keeps Bridge of Accord etc., players see concept names. | |

**User's choice:** Same names everywhere
**Notes:** None

---

## Text Readability Pass

| Option | Description | Selected |
|--------|-------------|----------|
| Plain English only | Rewrite all narratives to avoid academic terms entirely. | |
| Introduce then define | Keep philosophy terms but always define inline. | ✓ |
| Keep current level | College-maturity tone as-is. | |

**User's choice:** Introduce then define
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Keep kingdom atmosphere | Fantasy framing IS the game personality. High schoolers get it. | ✓ |
| Soften to plain game language | Replace decree/realm/council with choice/game/round. | |
| Keep for kingdom pack, plain for others | Context-appropriate per pack. | |

**User's choice:** Keep kingdom atmosphere
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Rewrite all 4 framework descriptions | Shorter, punchier, relatable for high schoolers. | ✓ |
| Keep descriptions, add examples | Fine conceptually, add relatable examples. | |
| Leave as-is | Already one sentence each. | |

**User's choice:** Rewrite all 4 framework descriptions
**Notes:** None

---

## 375px Mobile Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Player screens only | Only Play, Baseline, FrameworkProfile. | |
| Everything | All pages including Landing, Host, HostSetup. | ✓ |
| Player + Landing | Player screens plus join page. | |

**User's choice:** Everything
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Make it responsive | viewBox with percentage width, circles/text reposition. | ✓ |
| Shrink the fixed size | Drop from 240px to ~200px fixed. | |
| Replace with text-only | Drop SVG, use styled text blocks. | |

**User's choice:** Make it responsive
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Add @media (max-width: 390px) | Explicit breakpoint for small phones. | |
| Fluid/responsive throughout | clamp(), min(), relative units. No breakpoints. | |
| Both | Generally fluid + 390px breakpoint for hard overrides. | ✓ |

**User's choice:** Both (fluid + breakpoint)
**Notes:** None

---

## Claude's Discretion

- Specific font-size reductions at 390px breakpoint
- Whether to use clamp() for font-size, padding, or both
- Order of component audit
- Whether HostSetup pack selection cards need layout changes at small widths

## Deferred Ideas

None — discussion stayed within phase scope.
