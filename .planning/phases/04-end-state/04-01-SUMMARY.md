---
phase: 04-end-state
plan: "01"
subsystem: end-state
tags: [framework-profile, world-narrative, player-end-screen, components]
dependency_graph:
  requires:
    - src/lib/frameworks.js
    - src/lib/scenarios.js
    - src/lib/detection.js
    - src/lib/worldState.js
    - src/components/ConsequenceReveal.module.css
  provides:
    - src/components/FrameworkProfile.jsx
    - src/components/FrameworkProfile.module.css
    - src/lib/worldState.js (computeNarrative)
  affects:
    - src/pages/Play.jsx (Plan 02 wires FrameworkProfile in)
    - src/pages/Host.jsx (Plan 02 wires computeNarrative in)
tech_stack:
  added: []
  patterns:
    - "CSS Modules with staggered fadeUp animations (0/200/400/600ms delays)"
    - "Inline SVG conflict diagram — no external dependencies"
    - "Conditional text assembly from threshold comparisons (computeNarrative)"
key_files:
  created:
    - src/components/FrameworkProfile.jsx
    - src/components/FrameworkProfile.module.css
  modified:
    - src/lib/worldState.js
decisions:
  - "leastUsed computed locally in FrameworkProfile from framework_counts — player row has counts but not leastUsed field; avoids re-importing detection.js"
  - "computeNarrative checks interesting combinations before individual meters — prevents contradictory sentence assembly"
  - "Reflection input section excluded from FrameworkProfile per plan spec — wired separately in Play.jsx in Plan 02"
metrics:
  duration: "133s"
  completed: "2026-03-26T00:16:54Z"
  tasks_completed: 2
  files_created_or_modified: 3
---

# Phase 4 Plan 01: FrameworkProfile and computeNarrative Summary

**One-liner:** Player end screen with dominant framework card, SVG conflict diagram, least-used prompt, and choice log — plus conditional world narrative for host end view.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create FrameworkProfile component and CSS | a04f89b | src/components/FrameworkProfile.jsx, src/components/FrameworkProfile.module.css |
| 2 | Add computeNarrative to worldState.js | a76f8ac | src/lib/worldState.js |

## What Was Built

### FrameworkProfile.jsx

Self-contained player end screen component. Accepts a `player` prop with shape `{ dominant_framework, conflicts, framework_counts, choice_history }`.

Four sections rendered in stacked order:
1. **Dominant Framework Card** — eyebrow, framework name (amber), description paragraph (serif). Animates at 0ms.
2. **Conflict Map** — conditional (only when `conflicts.length > 0`). Inline SVG with two circle nodes connected by a line; tension label in amber above; philosophical description below. Animates at 200ms.
3. **Framework You Used Least** — computed locally from `framework_counts`. Shows name, question, and description. Animates at 400ms.
4. **Choice Log** — iterates `choice_history`, resolves scenario title and choice text via `getScenarioByRound`, renders framework badge per entry. Animates at 600ms.

Empty state for `dominant_framework === null` (player passed all rounds) skips sections 1-3 and shows centered copy.

All animated sections use `@keyframes fadeUp` from ConsequenceReveal pattern. `prefers-reduced-motion` media query disables all animations.

### computeNarrative(state)

New export in `worldState.js`. Returns a 1-3 sentence string from final world state meter values.

Logic order:
1. Null check — returns neutral fallback if state missing
2. Three interesting combinations checked first (lighthouse/dark city, foggy trust, lit-windows/no-courage)
3. Individual meter sentences assembled for values outside 30-70 range
4. Neutral fallback if all meters in middle range
5. Returns `sentences.slice(0, 3).join(' ')`

`applyChoicesToWorld` unchanged.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. FrameworkProfile renders real data from player prop. computeNarrative produces real conditional text. No hardcoded placeholders.

## Verification

- `grep -c "export" src/components/FrameworkProfile.jsx` → 1
- `grep -c "export function" src/lib/worldState.js` → 2 (applyChoicesToWorld + computeNarrative)
- `npx vite build --mode development` → completed without errors (97 modules, 366ms)

## Self-Check: PASSED
