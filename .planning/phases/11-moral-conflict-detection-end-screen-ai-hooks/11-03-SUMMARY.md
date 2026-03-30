---
phase: 11-moral-conflict-detection-end-screen-ai-hooks
plan: "03"
subsystem: ai-hooks + end-session data shaping
tags: [ai-stubs, debrief-context, end-session, data-shaping, migration]
dependency_graph:
  requires: [11-01, detection.js, scenarios.js]
  provides: [ai.js-stubs, debrief_context-per-player, group_debrief_context-per-session]
  affects: [src/lib/ai.js, src/pages/Host.jsx, supabase/migrations/20260330000000_ai-debrief-columns.sql]
tech_stack:
  added: []
  patterns: [LLM-prompt-ready payload shaping, aggregate framework breakdown, moral conflict grouping by top value]
key_files:
  created:
    - src/lib/ai.js
    - supabase/migrations/20260330000000_ai-debrief-columns.sql
  modified:
    - src/pages/Host.jsx
decisions:
  - ai.js returns null for all three stubs — documents the contract without live AI calls
  - endSession fetches moral_values/moral_stances to enable findMoralConflicts at session end
  - group_debrief_context groups notable moral conflicts by player top value — surfaces pedagogically useful patterns
  - getScenarioByRound fallback is 'Dilemma N' — debrief_context is readable even for packs with missing titles
metrics:
  duration: 91s
  completed_date: "2026-03-30T04:21:39Z"
  tasks_completed: 1
  files_changed: 3
---

# Phase 11 Plan 03: AI Stubs + Debrief Context Data Shaping Summary

**One-liner:** Three null-returning AI stub functions with documented LLM payload shapes, plus endSession expanded to compute and store per-player debrief_context and per-session group_debrief_context in Supabase.

## What Was Built

### Task 1 — ai.js + SQL migration + endSession expansion

**src/lib/ai.js (AI-04)**

New file with three async stub functions, all returning null:

- `generateDebrief(playerContext)` — documented payload: playerId, dominantFramework, frameworkCounts, frameworkConflicts, moralConflicts, moralBaseline (topValue, allValues, stances), choiceHistory (with scenarioTitle)
- `generateDiscussionPrompts(sessionContext)` — documented payload: packId, packName, totalPlayers, frameworkBreakdown, finalWorldState, notableMoralConflicts
- `generatePack(prompt)` — returns ScenarioPack|null, references typedef in scenarios.js

File-level comment: "AI integration stubs for The Crossroads. These functions return null in v1.1. Implementation in v1.2."

**supabase/migrations/20260330000000_ai-debrief-columns.sql (AI-01, AI-02)**

Two ALTER TABLE statements using IF NOT EXISTS:
- `players.debrief_context jsonb DEFAULT NULL`
- `sessions.group_debrief_context jsonb DEFAULT NULL`

**src/pages/Host.jsx endSession expansion (AI-01, AI-02)**

- Added `findMoralConflicts` to detection.js import (alongside existing computeProfile, findConflicts)
- Players fetch upgraded: `select('id, moral_values, moral_stances')` — required for findMoralConflicts
- Choices fetch upgraded: `select('player_id, round_number, choice_index, scenario_id, frameworks')` — adds choice_index and scenario_id for debrief history
- History building loop extended to carry choiceIndex and scenarioId per entry
- Per-player debrief_context computed: moral conflicts (findMoralConflicts), choice history with scenario titles (getScenarioByRound fallback to 'Dilemma N'), moral baseline summary
- debrief_context written alongside existing fields in player update call
- group_debrief_context computed after player writes: aggregate framework breakdown, notable moral conflicts grouped by top value, final world state
- Session update extended: `{ status: 'finished', group_debrief_context: groupDebriefContext }`

## Commits

| Hash | Message |
|------|---------|
| 6cf8dc8 | feat(11-03): AI stubs + endSession debrief_context + group_debrief_context |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

`src/lib/ai.js` — all three functions return null intentionally. This is documented in the file and is the intended v1.1 state. v1.2 will implement live LLM calls using these same payload shapes.

## Self-Check: PASSED
