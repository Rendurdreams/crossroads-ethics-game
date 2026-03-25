---
phase: 03-game-loop
plan: 03
subsystem: host-dashboard
tags: [host, game-loop, real-time, supabase, react, timer, world-state]
dependency_graph:
  requires:
    - 03-01  # MeterBar, TimerDisplay, CityPlaceholder leaf components
    - 03-02  # ScenarioCard (player-side, not host-side but same phase)
  provides:
    - Full host game loop (lobby → active → round_complete → finished)
    - Live vote tally via Supabase choices subscription
    - World state computation on round close
    - Timer with broadcast to players
    - Two-panel host layout (CityPlaceholder + WorldStatePanel)
  affects:
    - src/pages/Host.jsx
    - src/components/VoteTally.jsx
    - src/components/WorldStatePanel.jsx
tech_stack:
  added: []
  patterns:
    - useReducer for coordinated round state machine (ROUND_START / CHOICE_RECEIVED / TICK / ROUND_CLOSE / RESET)
    - useRef for persistent Supabase broadcast channel (avoids channel churn on every tick)
    - fetch-then-subscribe with dedup for choices (same pattern as players in Plan 02)
    - Supabase broadcast channel for timer sync to player phones
    - Idempotent closeRound guard (roundState.roundClosed check)
key_files:
  created:
    - src/components/VoteTally.jsx
    - src/components/VoteTally.module.css
    - src/components/WorldStatePanel.jsx
    - src/components/WorldStatePanel.module.css
  modified:
    - src/pages/Host.jsx
    - src/pages/Host.module.css
decisions:
  - useRef for timer broadcast channel rather than recreating channel on each tick — avoids Supabase channel limit issues and subscription churn
  - closeRound idempotent: roundState.roundClosed guard prevents double-close from timer auto-close race with manual close button
  - Auto-close via useEffect watching timerSeconds === 0 && timerRunning — clean separation from tick interval
  - Session subscription added to Host.jsx (was missing in Plan 02) — needed to keep world_state and current_round fresh after Supabase writes
metrics:
  duration_seconds: 107
  completed_date: "2026-03-25"
  tasks_completed: 2
  files_created: 4
  files_modified: 2
---

# Phase 03 Plan 03: Host Game Loop Summary

**One-liner:** Host dashboard rewritten with useReducer round state machine, live vote tally via Supabase choices subscription, countdown timer with broadcast, and world state computation on round close.

## What Was Built

### Task 1 — VoteTally and WorldStatePanel components

**VoteTally.jsx** renders live anonymous vote percentage bars per choice option:
- 3 rows: choice label (truncated to 40 chars), percentage bar track (8px, `#2e303a`), fill (`var(--accent)`, `transition: width 0.4s ease`), count + pct label
- Empty state: "No submissions yet" centered in `var(--text-muted)` when no votes received
- Submitted counter below rows: "X of Y submitted" with X in `var(--accent)` weight 600

**WorldStatePanel.jsx** composes the full host right panel:
- Section 1: Scenario title (16px weight 600) + weight badge
- Section 2: VoteTally
- Section 3: 4 MeterBars (Trust, Courage, Solidarity, Awareness) with 16px gap
- Section 4: TimerDisplay
- Section 5: Close Round / Next Round / End Game button (conditional on `roundClosed` + `isLastRound`)
- CSS: `border-left: 1px solid #2e303a`, `background: var(--bg-surface)`, `padding: 24px`, `gap: 24px`

### Task 2 — Host.jsx rewrite

**Round state machine (useReducer):**
- `ROUND_START`: resets choices, sets timerSeconds from duration, starts timer
- `CHOICE_RECEIVED`: deduped append by `id`
- `TICK`: decrements timerSeconds by 1 (floor at 0)
- `ROUND_CLOSE`: stops timer, marks roundClosed
- `RESET`: returns to initialRoundState

**Timer behavior:**
- Tick interval: `setInterval` fires `TICK` every 1000ms while `timerRunning && timerSeconds > 0`
- Auto-close: `useEffect` on `timerSeconds === 0 && timerRunning` calls `closeRound()`
- Broadcast: persistent `timerChannelRef` (created once per `sessionId`) sends `{ remaining, total }` via Supabase broadcast on each tick

**Choices subscription:**
- Keyed on `[sessionId, session.current_round, session.status]`
- Active only when `status === 'active'`
- Fetch existing choices for round → dispatch CHOICE_RECEIVED for each
- Subscribe to INSERT on choices table, filtered by `session_id`, dispatch on matching `round_number`

**Round control functions:**
- `startGame()`: dispatches ROUND_START, updates Supabase `status: 'active', current_round: 1`
- `closeRound()`: idempotent guard → dispatches ROUND_CLOSE → `applyChoicesToWorld()` → updates Supabase `status: 'round_complete', world_state: newWorldState`
- `nextRound()`: dispatches ROUND_START → updates Supabase `status: 'active', current_round: current + 1`
- `endGame()`: updates Supabase `status: 'finished'`

**Render paths:**
1. Loading state
2. `status === 'finished'`: end view placeholder (Game Over text + CityPlaceholder)
3. `status === 'active' || 'round_complete'`: two-panel layout (CityPlaceholder flex 3 + WorldStatePanel flex 2)
4. Default (lobby): original lobby view preserved — room code, PlayerRoster, round selector, start button

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

**CityPlaceholder (left panel, 60% host screen):** Static SVG skyline silhouette — Three.js city deferred to v2 per PROJECT.md. Intentional; future plan (Phase 6 per CLAUDE.md build order) will wire Three.js scene.

**End view (status === 'finished'):** "Game Over" text + CityPlaceholder placeholder — real end view with framework breakdown and reflection feed deferred to Phase 4 (FrameworkProfile.jsx + host end view spec).

Both stubs are intentional and documented in PROJECT.md Out of Scope (v1).

## Self-Check: PASSED

All created files present on disk. Both task commits verified in git log.
