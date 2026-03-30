---
phase: 15-divided-kingdom-phase-2
plan: 02
subsystem: ui-components
tags: [scenario-card, consequence-reveal, how-others-chose, ui, data-module]
dependency_graph:
  requires: []
  provides:
    - ScenarioCard 4-choice support with Roman numeral IV
    - ConsequenceReveal conscienceLayer prop and amber italic display
    - howOthersChose.js reference data module for all 8 rounds
  affects:
    - src/pages/Play.jsx (consumes conscienceLayer prop, imports howOthersChose)
tech_stack:
  added: []
  patterns:
    - Roman numeral array expansion for variable-choice support
    - Optional prop with conditional render pattern (conscienceLayer)
    - Research-baseline data module with lookup function
key_files:
  created:
    - src/lib/howOthersChose.js
  modified:
    - src/components/ScenarioCard.jsx
    - src/components/ConsequenceReveal.jsx
    - src/components/ConsequenceReveal.module.css
decisions:
  - ConsequenceReveal conscienceLayer placed between consequence and framework sections — inner voice beat before framework label
  - conscienceLayer CSS includes fadeUp animation at 1200ms delay — positions it between consequence (1000ms) and framework (1400ms) reveal sequence
  - HOW_OTHERS_CHOSE keyed by scenario ID string ('round-1', 'round-bombshell') — matches scenario.id pattern used throughout the codebase
metrics:
  duration: ~90s
  completed: "2026-03-30"
  tasks: 2
  files: 4
---

# Phase 15 Plan 02: UI Components for Phase 2 Features Summary

ScenarioCard adds Roman numeral IV for 4-choice support, ConsequenceReveal shows amber italic conscience layer text, and new howOthersChose.js module provides all 8 rounds of PRD research-baseline percentages.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | ScenarioCard 4-choice support + ConsequenceReveal conscience layer | 8aaeb7c | ScenarioCard.jsx, ConsequenceReveal.jsx, ConsequenceReveal.module.css |
| 2 | Create How Others Chose reference data module | 8bff195 | src/lib/howOthersChose.js |

## What Was Built

### Task 1 — ScenarioCard + ConsequenceReveal

**ScenarioCard:** Added `'IV'` to the `ROMAN` array. The component already maps over `scenario.choices` dynamically using `ROMAN[choice.choiceIndex]`, so the 4th button now renders correctly for Round 7's 4-choice scenario. No JSX or CSS grid changes were needed — the existing `flex-direction: column` layout accommodates any number of stacked buttons.

**ConsequenceReveal:** Added `conscienceLayer` prop to the component signature. When present, the conscience layer text renders between the main consequence paragraph and the framework section — functioning as a punchier, second-person inner voice beat. The new `.conscienceLayer` CSS style uses amber italic treatment with a top border divider and a 1200ms fadeUp animation delay, fitting naturally between the 1000ms consequence reveal and the 1400ms framework reveal.

### Task 2 — How Others Chose Module

New `src/lib/howOthersChose.js` module exports:
- `HOW_OTHERS_CHOSE`: object keyed by scenario ID with per-round reference percentages from Awad et al. (2018) MIT Moral Machine pattern
- `getHowOthersChose(scenarioId)`: lookup function returning the array or null

All 8 rounds covered: round-1 through round-7 plus round-bombshell. Round 7 has 4 entries (Retribution 33%, Reconciliation 28%, Truth Commission 24%, Cultural Tribunal 15%). All percentages per round sum to 100.

## Deviations from Plan

None — plan executed exactly as written. The only addition was including the fadeUp animation timing on the `.conscienceLayer` CSS rule (consistent with existing ConsequenceReveal animation pattern) which improves the reveal sequence without changing behavior.

## Known Stubs

None — howOthersChose.js contains the complete PRD-specified data; no placeholder values. The module is ready to wire into Play.jsx post-round display.

## Self-Check: PASSED

All files verified present. Both commits verified in git log.
