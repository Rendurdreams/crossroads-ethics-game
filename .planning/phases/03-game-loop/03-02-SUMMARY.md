---
phase: 03-game-loop
plan: 02
subsystem: player-game-loop
tags: [player, game-loop, scenario, choice, consequence, frameworks, supabase, realtime]
dependency_graph:
  requires: ["03-01"]
  provides: ["player-scenario-view", "player-choice-submission", "player-consequence-reveal", "content-note-gate", "submitted-counter"]
  affects: ["03-03"]
tech_stack:
  added: []
  patterns:
    - "Optimistic lock pattern: setLockedChoiceIndex immediately on tap, Supabase insert fires async, 23505 UNIQUE error keeps lock"
    - "State reset useEffect keyed on session.current_round — clears all round-local state between rounds"
    - "Broadcast channel for timer sync (timer:{sessionId}) — avoids schema migration, host broadcasts every second"
    - "CSS animation-delay chain: consequence at 1000ms, framework label at 1400ms, meters at 1800ms"
key_files:
  created:
    - src/components/ScenarioCard.jsx
    - src/components/ScenarioCard.module.css
    - src/components/ContentNote.jsx
    - src/components/ContentNote.module.css
    - src/components/ConsequenceReveal.jsx
    - src/components/ConsequenceReveal.module.css
  modified:
    - src/pages/Play.jsx
    - src/pages/Play.module.css
decisions:
  - "Broadcast channel (not postgres_changes) used for player-side timer sync — avoids adding timer columns to sessions schema"
  - "Pass flow: passer receives world state meters on round_complete but no framework label (no choice was made)"
  - "Player who didn't submit before round closes sees generic 'round ended' state with meters (not an error)"
  - "ConsequenceReveal animation chain: 1000ms consequence, +400ms framework label, +400ms meters (1800ms total)"
metrics:
  duration: "145s"
  completed_date: "2026-03-25"
  tasks_completed: 2
  files_changed: 8
---

# Phase 03 Plan 02: Player Game Loop Summary

Player game loop fully implemented — scenario display, optimistic choice lock, content note gate for heavy rounds, consequence reveal with framework label and world state meters.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Build ScenarioCard, ContentNote, ConsequenceReveal | 4a97e88 | ScenarioCard.jsx, ContentNote.jsx, ConsequenceReveal.jsx |
| 2 | Rewrite Play.jsx with full game loop | 63b77a5 | Play.jsx, Play.module.css |

## What Was Built

**ScenarioCard.jsx** — Renders scenario title, body text (18px serif), and 3 choice buttons. On tap: locked button gets amber border + accent-bg fill, siblings dim to 0.4 opacity, all buttons get pointer-events:none. Submit error re-enables locked button for retry with "Couldn't submit — tap to try again" message. No framework labels (revealed only in ConsequenceReveal per D-15).

**ContentNote.jsx** — Full-screen overlay for Rounds 3 and 4. "A note before this round" header in uppercase tracked muted text. "Continue to round" primary amber button. "Pass this round" is a plain text link with var(--text-muted) — intentionally understated to avoid drawing attention.

**ConsequenceReveal.jsx** — Stacked animation chain: consequence text fades in at 1000ms delay, framework label badge at 1400ms, world state meters section at 1800ms. Imports MeterBar and FrameworkLabel from Plan 01.

**Play.jsx rewrite** — Full round state machine:
- Lobby: name + avatar + waiting (preserved)
- Active round: content note gate → scenario card OR pass view
- Submitted state: "Waiting for others..." + X of Y submitted counter
- Round complete: ConsequenceReveal for submitters, meters-only for passers
- Finished: game complete message
- Timer: broadcast channel subscription (`timer:{sessionId}`) — renders TimerDisplay when host data arrives
- Choices subscription: real-time submitted count per round with initial fetch on round start
- State reset: useEffect on session.current_round clears all round-local state

## Decisions Made

**Timer via broadcast channel** — The sessions schema has no timer column. Rather than add one (architectural change, Rule 4), player timer is synced via Supabase broadcast. Host will broadcast `{ type: 'timer', remaining: N, total: T }` every second. Player TimerDisplay renders only when timer data arrives — gracefully absent if host doesn't broadcast.

**Pass flow** — Passers reach a neutral waiting screen. On round_complete, they see "You sat this one out. Here's what happened:" followed by the updated world state meters. No framework label (no choice was made). This matches the must_have truth: "Passed players see 'You sat this one out' and still receive consequence + meters on round close."

**Unsub player** — If a player's round closes without submitting (timed out), they see "The round ended before you submitted." with world state meters. Not treated as an error.

## Deviations from Plan

None — plan executed exactly as written. The timer resolution in the plan (broadcast channel approach) was the specified approach, not a deviation.

## Known Stubs

None — all must_haves are implemented with real data sources. The timer section in Play.jsx renders conditionally only when broadcast data arrives (not a stub — gracefully absent when host hasn't set a timer).

## Self-Check: PASSED

Files exist:
- src/components/ScenarioCard.jsx — FOUND
- src/components/ContentNote.jsx — FOUND
- src/components/ConsequenceReveal.jsx — FOUND
- src/pages/Play.jsx — FOUND (rewritten)

Commits exist:
- 4a97e88 — feat(03-02): build ScenarioCard, ContentNote, and ConsequenceReveal components
- 63b77a5 — feat(03-02): rewrite Play.jsx with full game loop

Build: vite build passes with 0 errors.
