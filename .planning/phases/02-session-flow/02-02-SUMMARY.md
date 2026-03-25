---
phase: 02-session-flow
plan: 02
subsystem: lobby-ui
tags: [host, player, supabase, real-time, lobby, local-storage, roster]
dependency_graph:
  requires: [02-01]
  provides: [host-lobby, player-lobby, player-roster-component]
  affects: [02-03]
tech_stack:
  added: []
  patterns: [fetch-then-subscribe roster pattern, functional state update in subscription callbacks, localStorage session restore, dual-subscription Play.jsx (players INSERT + sessions UPDATE)]
key_files:
  created:
    - src/pages/Host.module.css
    - src/components/PlayerRoster.jsx
    - src/components/PlayerRoster.module.css
    - src/pages/Play.module.css
  modified:
    - src/pages/Host.jsx
    - src/pages/Play.jsx
decisions:
  - "fetch-then-subscribe pattern in Host.jsx: fetch existing players first, then subscribe to INSERT events, dedup by player id to handle race"
  - "Three separate useEffects in Play.jsx: mount restore, players subscription, session subscription — separates concerns clearly"
metrics:
  duration: ~3 min
  completed: 2026-03-25T18:31:53Z
  tasks_completed: 2
  files_changed: 6
---

# Phase 02 Plan 02: Host Lobby and Player Lobby Summary

## One-liner

Host lobby projects 4-digit room code at 72–120px with live Supabase-subscribed roster and round selector; Player lobby restores identity from localStorage on refresh and detects game-start via session UPDATE subscription.

## What Was Built

### Task 1: Host lobby page (HOST-02, HOST-03, HOST-04, HOST-10)

- **src/pages/Host.jsx**: Full lobby implementation replacing the stub:
  - Fetches session row on mount; navigates to `/` if session not found (invalid URL)
  - Initial player fetch + INSERT subscription with dedup check (`prev.some(p => p.id === payload.new.id)`) to handle the race condition where a player joins during the initial fetch
  - Round count selector renders `[3, 4, 5, 6]` buttons; selected button gets amber background
  - Start button disabled (`players.length < 2`) and shows current player count in button text
  - `startGame()` updates session: `{ status: 'active', total_rounds: totalRounds, current_round: 1 }`
  - Cleanup returns `supabase.removeChannel(channel)` in useEffect
- **src/pages/Host.module.css**: `.roomCode` at `clamp(72px, 12vw, 120px)` — readable from back of classroom (HOST-10). Amber accent, full-width start button with disabled styling.
- **src/components/PlayerRoster.jsx**: Reusable component accepting `players` prop; renders emoji + name cards; "Waiting for players..." empty state.
- **src/components/PlayerRoster.module.css**: Dark surface card style matching design system.

### Task 2: Player lobby page (PLAY-03)

- **src/pages/Play.jsx**: Full lobby implementation replacing the stub:
  - Session restore: reads `localStorage.getItem('player_id')` and `localStorage.getItem('session_id')`, verifies `storedSessionId === sessionId` (URL param match), fetches player row to confirm still valid
  - Stale identity cleanup: `localStorage.removeItem('player_id')` + `localStorage.removeItem('session_id')` then redirect to `/` if player row not found
  - No-identity redirect: `navigate('/')` when localStorage is empty or session mismatch
  - Two subscriptions: `play-players:${sessionId}` (INSERT) increments live player count; `play-session:${sessionId}` (UPDATE) detects `status === 'active'` and sets `gameStarted` state
  - Both subscriptions have cleanup: `return () => supabase.removeChannel(channel)`
  - Lobby waiting state shows: avatar (3rem emoji), name, "Waiting for host to start...", live player count, room code reminder
  - Game-started state: "Game is starting..." in amber — placeholder for Phase 3 round view
- **src/pages/Play.module.css**: Mobile-centered layout (min-height 100vh, flex column, justify center). `.avatar`, `.name`, `.waiting`, `.count`, `.roomReminder`, `.starting` classes.

## Verification

- `vite build` completes without errors — 75 modules transformed, 422KB JS bundle
- All acceptance criteria verified via grep — all pass
- fetch-then-subscribe pattern correctly implemented with dedup
- Functional state updates (`prev =>`) used in all subscription callbacks

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

- **src/pages/Host.jsx** — after `startGame()`, renders static "Game started — players are in!" text. Intentional: Phase 3 (02-03) replaces this with the active round view.
- **src/pages/Play.jsx** — when `gameStarted === true`, renders static "Game is starting..." text. Intentional: Phase 3 (02-03) replaces this with the round scenario view.

Both stubs do NOT prevent this plan's goal (lobby flow) from being achieved. They are explicit placeholders required for Phase 3.

## Self-Check: PASSED
