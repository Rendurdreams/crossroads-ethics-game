---
phase: 13-text-mobile-polish
plan: "03"
subsystem: css-mobile
tags: [mobile, responsive, css, accessibility]
dependency_graph:
  requires: [13-02]
  provides: [MOBILE-01, MOBILE-02, MOBILE-03]
  affects: [Play.module.css, Landing.module.css, Baseline.module.css, HostSetup.module.css, FrameworkProfile.module.css, ScenarioCard.module.css, ConsequenceReveal.module.css, FrameworkProfile.jsx]
tech_stack:
  added: []
  patterns: [CSS media queries, CSS clamp() fluid typography, SVG responsive width]
key_files:
  created: []
  modified:
    - src/pages/Play.module.css
    - src/pages/Landing.module.css
    - src/pages/Baseline.module.css
    - src/pages/HostSetup.module.css
    - src/components/FrameworkProfile.module.css
    - src/components/ScenarioCard.module.css
    - src/components/ConsequenceReveal.module.css
    - src/components/FrameworkProfile.jsx
decisions:
  - "390px breakpoint chosen (not 375px) to cover both iPhone SE (375px) and standard iPhone (390px)"
  - "SVG conflict diagram uses width=100% with preserved viewBox — no JS needed, scales via CSS"
metrics:
  duration: 121s
  completed: "2026-03-30"
  tasks_completed: 2
  files_modified: 8
---

# Phase 13 Plan 03: 375px Mobile Optimization Summary

375px phone padding reduction via @media (max-width: 390px) + fluid clamp() font sizing across all 7 player-facing CSS modules; SVG conflict diagram made responsive with width="100%".

## What Was Built

Added `@media (max-width: 390px)` blocks to all 7 player-facing CSS module files. Reduced padding from 24-32px to 16px at narrow widths, producing 343px+ usable content width on a 375px phone (up from 311-327px). Applied `clamp()` fluid font sizing to all large serif text blocks (scenario body, consequence text, stance questions, framework explanation). Made the SVG conflict diagram in FrameworkProfile.jsx responsive by replacing fixed `width="240" height="80"` with `width="100%"` while preserving the `viewBox` for proportional coordinate scaling.

Host.module.css was not touched — host dashboard is desktop-only.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Add 390px breakpoints to 7 player-facing CSS modules | c23437c |
| 2 | Make SVG conflict diagram responsive in FrameworkProfile.jsx | b2a8410 |

## Deviations from Plan

None — plan executed exactly as written. All class names in the files matched the plan spec (camelCase throughout).

## Verification Results

- All 7 CSS files contain `@media (max-width: 390px)` blocks
- `ScenarioCard.module.css` and `ConsequenceReveal.module.css` contain `clamp()`
- `FrameworkProfile.jsx` has `width="100%"` and no `width="240"` or `height="80"`
- `Host.module.css` has zero media queries (unchanged)
- `npm run build` exits 0 in 423ms, 456 modules

## Known Stubs

None — all changes are complete CSS/JSX updates with no placeholders.

## Self-Check: PASSED
