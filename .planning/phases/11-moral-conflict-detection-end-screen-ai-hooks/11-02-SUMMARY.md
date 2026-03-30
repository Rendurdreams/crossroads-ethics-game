---
phase: 11-moral-conflict-detection-end-screen-ai-hooks
plan: "02"
subsystem: end-screen
tags: [moral-conflict, end-screen, framework-profile, pack-prop-fix]
dependency_graph:
  requires: [11-01, 07-moral-profile-data-layer, 08-multi-pack-system]
  provides: [morals-vs-ethics-section, pack-aware-scenario-titles]
  affects: [src/components/FrameworkProfile.jsx, src/components/FrameworkProfile.module.css, src/pages/Play.jsx]
tech_stack:
  added: []
  patterns: [prop-driven pack resolution, conditional section guard on moralConflicts.length]
key_files:
  created: []
  modified:
    - src/components/FrameworkProfile.jsx
    - src/components/FrameworkProfile.module.css
    - src/pages/Play.jsx
decisions:
  - moralConflicts computed inline in FrameworkProfile — no memoization needed; called once on mount with stable player data
  - Section guard is dominant !== null && moralConflicts.length > 0 — consistent with existing conflict map guard pattern
  - getScenarioByRound in choice log now uses pack prop — fixes broken scenario titles for non-default packs
metrics:
  duration: 112s
  completed_date: "2026-03-30T05:00:12Z"
  tasks_completed: 1
  files_changed: 3
---

# Phase 11 Plan 02: Morals vs Ethics End Screen Section Summary

**One-liner:** New "Your Morals vs Your Ethics" section added to FrameworkProfile between dominant framework card and conflict map, plus pack prop threading to fix scenario titles.

## What Was Built

### Task 1 — Morals vs Ethics section + pack prop fix

`FrameworkProfile.jsx` now surfaces the game's central pedagogical lesson at the end screen. Three changes delivered together:

**1. New section (D-08, D-09, D-10)**

Between the dominant framework card (Section 1) and the framework conflict map (Section 3), a new Section 2 appears when `moralConflicts.length > 0`:

- Eyebrow: "Your Morals vs Your Ethics"
- Intro copy explicitly distinguishes morals (personal) from ethical frameworks (reasoned systems) — per D-09
- Per-round conflict rows listing scenario title and conflict message
- Footer: "That tension is not a flaw. It is where real thinking begins." — per D-10
- Hidden entirely when no moral conflicts exist (null baseline or no value mismatches)

**2. `findMoralConflicts` import + computation**

`findMoralConflicts` (from Phase 11 Plan 01) is called with `player.moral_values` and `player.moral_stances`. Players without a moral baseline (null moral_values) return `[]` and see nothing — graceful null path.

**3. Pack prop fix**

Component signature updated from `{ player }` to `{ player, pack }`. Both the new morals section and the existing choice log now resolve scenario titles via `getScenarioByRound(pack, round)` rather than a module-level default pack. `Play.jsx` threads `pack={pack}` (already in state from `getPackById`) into the call.

Section order is now:
1. Your Framework (dominant framework card)
2. Your Morals vs Your Ethics (NEW — moral vs ethics conflict map)
3. Where the Conflict Lived (framework conflict map)
4. The Framework You Used Least
5. Your Choices (choice log)

## Commits

| Hash | Message |
|------|---------|
| bbac4c6 | feat(11-02): add Morals vs Ethics section to FrameworkProfile + pack prop fix |

## Deviations from Plan

None — plan executed exactly as written. The worktree required a `git merge main` at the start to incorporate Plan 01 changes before implementing Plan 02.

## Known Stubs

None — all data paths are wired. Players with `moral_values` see the section with per-round conflict messages. Players without see nothing.

## Self-Check: PASSED
