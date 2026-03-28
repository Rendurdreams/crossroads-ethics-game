---
phase: 04-end-state
plan: "02"
subsystem: end-state
tags: [host-end-view, player-profile, round-6, reflection, framework-detection]
dependency_graph:
  requires:
    - src/components/FrameworkProfile.jsx
    - src/lib/detection.js
    - src/lib/worldState.js (computeNarrative)
    - src/lib/frameworks.js
    - src/components/MeterBar.jsx
  provides:
    - src/pages/Host.jsx (endSession, host end view)
    - src/pages/Play.jsx (profile reveal, Round 6, reflection input)
  affects:
    - Supabase players table (dominant_framework, conflicts, framework_counts written on end)
    - Supabase reflections table (insert from Play.jsx)
tech_stack:
  added: []
  patterns:
    - "endSession writes all player profiles before setting status=finished (strict ordering)"
    - "Play.jsx re-fetches player row on finished status to pick up host-written data"
    - "Round 6 detection via choices.length === 0 — shows textarea instead of ScenarioCard"
    - "Reflection feed uses postgres_changes INSERT subscription on host end view"
key_files:
  created: []
  modified:
    - src/pages/Host.jsx
    - src/pages/Host.module.css
    - src/pages/Play.jsx
    - src/pages/Play.module.css
decisions:
  - "endSession uses Promise.all for batch player profile writes then sets finished — prevents race where players see 'finished' before their profile data is available"
  - "Round 6 reflection input appears in both the active round view (Round 6 scenario) and below the FrameworkProfile in the end view — covers both 6-round and refresh cases"
  - "Player re-fetch on finished status occurs in both the live subscription path and the mount restore path — handles page refresh after game ends"
metrics:
  duration: "228s"
  completed: "2026-03-26T00:22:41Z"
  tasks_completed: 2
  files_created_or_modified: 4
---

# Phase 4 Plan 02: End State Wiring Summary

**One-liner:** Host endSession computes all player profiles, writes to Supabase, then sets finished — players see FrameworkProfile with conflict map; Round 6 shows reflection textarea; host end view shows group stats and live reflection feed.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Wire Host.jsx endSession + host end view + reflection feed | f93485d | src/pages/Host.jsx, src/pages/Host.module.css |
| 2 | Wire Play.jsx Round 6 detection, profile reveal, reflection input | c6f2534 | src/pages/Play.jsx, src/pages/Play.module.css |

## What Was Built

### Host.jsx — endSession flow

Replaced the `endGame()` stub with `endSession()`:
1. Fetches all players' `choice_history` from Supabase
2. Runs `computeProfile()` and `findConflicts()` on each player's history
3. `Promise.all()` batch-writes `dominant_framework`, `conflicts`, `framework_counts` to each player row
4. Only after all writes complete, sets `session.status = 'finished'`

This strict ordering prevents the race condition where players receive the `finished` signal before their profile data is written.

### Host.jsx — host end view

Replaces the "Game Over" stub with a full two-panel layout using the same `roundView` structure:
- Left: `CityPlaceholder` (city still visible in final state)
- Right: scrollable `endPanel` containing:
  - **YOUR GROUP**: sorted framework breakdown with leading framework in amber, percentages for all four frameworks
  - **WHAT HAPPENED**: `computeNarrative(session.world_state)` output
  - **FINAL STATE**: `MeterBar` for all four world state meters
  - **FROM YOUR GROUP**: real-time reflection feed — initial fetch + `postgres_changes` INSERT subscription

### Play.jsx — profile reveal

Replaced the "Game complete" stub. On `session.status === 'finished'`:
- Re-fetches the player row to pick up host-written `dominant_framework`, `conflicts`, `framework_counts`
- Renders `<FrameworkProfile player={player} />` as the primary view
- For 6-round sessions: shows reflection input section below the profile with "ONE LAST QUESTION" label

The re-fetch occurs in both the live subscription callback and the mount restore path (for players who refresh the page after the game ends).

### Play.jsx — Round 6 detection

In the active round view, before the content note gate, detects `choices.length === 0` as the reflection round signal. Renders a `<textarea>` and submit button instead of `<ScenarioCard>`. Timer display still shown if host has a timer running.

### Play.jsx — reflection submit handler

`handleReflectionSubmit()` inserts `{ session_id, player_id, round_number: 6, text }` into the `reflections` table. Error state shows "Couldn't save your reflection. Tap to try again." Post-submit shows "Submitted. Thank you." and locks the button.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All end state views now render real data:
- `FrameworkProfile` renders from actual player `dominant_framework`, `conflicts`, `choice_history`
- `computeNarrative` generates conditional text from actual world state meter values
- Group framework breakdown computes from actual `players` array
- Reflection feed shows actual submitted reflections

## Verification

1. `grep -c "import.*FrameworkProfile" src/pages/Play.jsx` → 1
2. `grep -c "endGame" src/pages/Host.jsx` → 0 (replaced by endSession)
3. `grep -c "reflections" src/pages/Host.jsx` → 7 (fetch + subscription + multiple references)
4. `grep -c "reflections" src/pages/Play.jsx` → 1 (insert only — Play inserts, Host subscribes)
5. `npx vite build --mode development` → completed without errors (100 modules, 294ms)

## Self-Check: PASSED
