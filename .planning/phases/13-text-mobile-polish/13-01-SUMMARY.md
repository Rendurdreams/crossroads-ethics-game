---
phase: 13-text-mobile-polish
plan: "01"
subsystem: UI Labels
tags: [meter-labels, player-facing, host-facing, rename]
dependency_graph:
  requires: []
  provides: [METER-01, METER-02]
  affects: [WorldStatePanel, Play, Host, ConsequenceReveal]
tech_stack:
  added: []
  patterns: []
key_files:
  created: []
  modified:
    - src/components/WorldStatePanel.jsx
    - src/pages/Play.jsx
    - src/pages/Host.jsx
    - src/components/ConsequenceReveal.jsx
decisions:
  - "Meter label mapping: trust=Honesty, courage=Courage, solidarity=Loyalty, awareness=Empathy — connects meter names to moral reasoning concepts players should internalize"
metrics:
  duration: ~90s
  completed: "2026-03-30"
  tasks: 2
  files: 4
---

# Phase 13 Plan 01: Meter Label Rename Summary

Renamed all kingdom-themed meter labels to moral concept names (Honesty, Courage, Loyalty, Empathy) across every player-facing and host-facing location in 4 files.

## What Was Built

Replaced 4 call sites with 16 total MeterBar/ImpactMeter label props updated from kingdom geography names to the moral reasoning concepts the game teaches.

| Old Label | New Label | Meter Key |
|-----------|-----------|-----------|
| Bridge of Accord | Honesty | trust |
| Citadel Beacon | Courage | courage |
| Village Quarter | Loyalty | solidarity |
| Fog of the Vale | Empathy | awareness |

Files updated:
- `src/components/WorldStatePanel.jsx` — 4 MeterBar labels (host round view)
- `src/pages/Play.jsx` — 8 MeterBar labels across 2 call sites (pass state + missed-round state)
- `src/pages/Host.jsx` — 4 MeterBar labels (host end screen)
- `src/components/ConsequenceReveal.jsx` — 4 ImpactMeter labels (player consequence view)

Atmospheric copy ("THE REALM", "The council awaits your decree") left unchanged per D-06.

## Commits

| Task | Commit | Files |
|------|--------|-------|
| Task 1 — MeterBar labels in WorldStatePanel, Play, Host | b706be0 | WorldStatePanel.jsx, Play.jsx, Host.jsx |
| Task 2 — ImpactMeter labels in ConsequenceReveal | 5f0d315 | ConsequenceReveal.jsx |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

Files verified:
- `src/components/WorldStatePanel.jsx` — FOUND: label="Honesty"
- `src/pages/Play.jsx` — FOUND: label="Loyalty" (2 matches at lines 482, 563)
- `src/pages/Host.jsx` — FOUND: label="Empathy"
- `src/components/ConsequenceReveal.jsx` — FOUND: label="Loyalty", label="Empathy"

Old labels verified absent: grep for "Bridge of Accord|Citadel Beacon|Village Quarter|Fog of the Vale" returns 0 matches across all 4 files.

Build: passes cleanly at 700ms, 456 modules, exit 0.

Commits verified:
- b706be0 — FOUND in git log
- 5f0d315 — FOUND in git log
