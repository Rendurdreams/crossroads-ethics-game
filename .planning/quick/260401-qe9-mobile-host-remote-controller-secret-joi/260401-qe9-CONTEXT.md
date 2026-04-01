# Quick Task 260401-qe9: Mobile Host Remote Controller

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Task Boundary

Build a mobile host remote controller that lets Jay manage the game from his phone while the big screen (computer) shows a clean presentation view. Same join screen — typing "rendur" as your name enters host-remote mode.

</domain>

<decisions>
## Implementation Decisions

### Secret Keyword
- **Decision: "rendur"** — typed as the player name on the normal join screen. Triggers host-remote mode instead of player mode.

### Live Settings (phone remote)
- **Decision: Timer + rounds.** Change timer duration for next round (30s/45s/60s/90s/120s), skip a round, extend current timer by +30s. Covers "make rounds longer" use case.

### Big Screen (computer Host.jsx)
- **Decision: Presentation-only.** Remove all control buttons from the projected screen. Keep: animated map, vote tallies, lesson overlay, how-others-chose, discussion prompts (read-only). The host controls everything from their phone.

### Architecture
- Same Supabase channels. The phone remote subscribes to the same channels as Host.jsx and performs the same database mutations (startGame, closeRound, nextRound, endSession).
- No new database tables needed. Use a broadcast channel for remote→host communication (timer changes, settings).
- The remote doesn't render the map or heavy visuals — it's a lightweight control panel.

</decisions>

<canonical_refs>
## Canonical References

- src/pages/Landing.jsx — join flow (detect "rendur" here)
- src/pages/Host.jsx — all control functions to replicate
- src/pages/Play.jsx — player flow (remote should NOT enter this)
- src/lib/supabase.js — client

</canonical_refs>
