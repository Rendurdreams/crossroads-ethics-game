# Phase 4: End State - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Surface the pedagogical payoff: each player's framework profile on their phone, the host's group pattern view, and the Round 6 reflection input. The game engine (computeProfile, findConflicts, choice_history) is already implemented. This phase wires the end state UI to those functions and coordinates the session-end transition across all screens.

</domain>

<decisions>
## Implementation Decisions

### Profile Computation & Storage
- **D-01:** Host triggers profile computation. When host clicks "End Session", Host.jsx calls `computeProfile()` and `findConflicts()` for each player using their `choice_history` JSONB field fetched from Supabase.
- **D-02:** Host writes computed profiles back to Supabase — `dominant_framework` (text), `conflicts` (JSONB), `framework_counts` (JSONB) updated on each player row.
- **D-03:** Play.jsx receives the updated profile via its existing player row subscription (or a re-fetch triggered by session status changing to 'finished'). Uses the written player row data to render FrameworkProfile.
- **D-04:** Data is ephemeral — no special persistence required beyond the in-session Supabase rows. Session data doesn't survive after the session ends, and that's by design.

### Session End Trigger
- **D-05:** "End Session" is a deliberate host action. After the last configured round closes, a button appears: "End Session." Clicking it sets `sessions.status = 'finished'`, triggers profile computation + write (D-01/D-02), and transitions the host screen to the end view.
- **D-06:** Session does NOT auto-end after the last round closes. Host has a moment to narrate before triggering the final reveal. This is intentional pacing.

### Round 6 Flow
- **D-07:** Round 6 runs like any round in the host's flow — host advances to it normally. `session.current_round` index hits 5 (0-indexed from scenarios array).
- **D-08:** Play.jsx detects `current_round === 5` (Round 6) and renders a reflection textarea instead of ScenarioCard + choice buttons. The reflection question text comes from `scenarios[5]` (CLAUDE.md Round 6 copy).
- **D-09:** Host sees a "reflection in progress" state on their round view — no vote tally (there are no choices), just player count and a close button.
- **D-10:** When Round 6 closes (host clicks close or timer hits 0), `status → 'round_complete'` as normal. Play.jsx uses this to finalize the reflection submission (if any text entered, submit it; if empty, skip).
- **D-11:** Framework profile appears on player phones when `status === 'finished'` (triggered by host clicking "End Session"). The profile is the primary view.
- **D-12:** Reflection input appears **below** the framework profile as an optional add-on. Player can write and submit at any time after the profile appears. No blocking gate before profile.
- **D-13:** Reflection submissions stored in the `reflections` table (already in schema from Phase 1: `player_id`, `session_id`, `round_number: 6`, `text`, `submitted_at`).

### FrameworkProfile Visual Structure (Play.jsx / FrameworkProfile.jsx)
- **D-14:** Single scrolling page — all sections stacked vertically. No tabs, no pagination. Player scrolls through:
  1. Dominant framework card (name + full explanation paragraph from CLAUDE.md)
  2. Conflict map (only if conflicts detected)
  3. Least-used framework prompt (paragraph from CLAUDE.md)
  4. Full choice log (round by round)
  5. Reflection input (optional, below the log)
- **D-15:** Full text from CLAUDE.md spec for dominant framework, conflict description, and least-used prompt. Do not shorten — this is the pedagogical payload.
- **D-16:** Conflict map renders as a small SVG diagram: two framework nodes connected by a line labeled with the tension name (e.g., "rule vs. outcome"). The philosophical description paragraph appears below the diagram.
- **D-17:** Choice log shows each round: round name, choice made (text excerpt or short label), framework tag. No judgment — just the record.

### Host End View
- **D-18:** Same 60/40 layout as round view — city placeholder panel on left, stats panel on right. Consistent with how the host screen has looked throughout.
- **D-19:** Right panel shows:
  - **Group framework breakdown**: "X players — Care Ethics (40%) | Deontology (30%) | Virtue (20%) | Consequentialism (10%)" — computed from all players' `dominant_framework` values.
  - **World state narrative**: Computed conditional text based on final meter values (see D-20).
  - **Anonymous reflection feed**: Responses scroll in as players submit them via real-time subscription to `reflections` table inserts.
  - **Final world state meters**: 4 CSS bars showing final values.
- **D-20:** World narrative is computed conditional text. Simple switch/conditional logic based on which meters are high/low:
  - trust < 30: "Your group fractured trust..."
  - courage > 70: "...but held their courage."
  - solidarity < 30: "...and the collective frayed."
  - etc. Combinations produce a 2–3 sentence paragraph. Claude has full discretion on exact thresholds and text — capture the spirit, not a specific word count.

### Claude's Discretion
- Exact SVG structure and styling for the conflict diagram
- Specific threshold values and exact text for world state narrative combinations
- Animation/transition when profile appears on player phones
- How to handle players who passed all heavy rounds (no conflicts, possibly no dominant framework — graceful empty state)
- Whether group framework breakdown uses pie chart or text list (text list preferred for simplicity unless time allows)
- Exact CSS layout for FrameworkProfile sections on mobile

</decisions>

<specifics>
## Specific Ideas

- "Not a score. Not a rating. A lens." — This is the core framing for the profile. The copy and visual design should reinforce that nothing here judges the player.
- The conflict map SVG diagram should feel editorial/minimal, not like a data visualization. Think small node diagram, not a network graph.
- The profile is the moment the game reveals what it was tracking all along. The transition to it should feel like a reveal, not a navigation.
- World narrative should feel like Jay is narrating — warm, specific to what happened, not generic. Pre-written conditional text lets it feel personalised without AI.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Framework detection & profiles (already implemented)
- `src/lib/detection.js` — `computeProfile()`, `findConflicts()`: exact function signatures and return shapes. Read before any profile computation code.
- `src/lib/frameworks.js` — `FRAMEWORKS` object (framework names, descriptions, questions), `CONFLICT_PAIRS` (tension names, descriptions, framework pairs). This is the source of all profile copy.
- `src/lib/scenarios.js` — Round 6 scenario object: reflection question text, no choices array. Needed for Round 6 rendering logic.

### Full profile copy and end state spec
- `CLAUDE.md` §End Screen — Framework Profile — Complete copy for dominant framework section, conflict section, least-used section. Implement text exactly as written.
- `CLAUDE.md` §Host Dashboard — Feature Spec — End view spec: city final state, world state narrative description, reflection feed, framework breakdown, "End Session" trigger.
- `CLAUDE.md` §Player View — Feature Spec — End screen section: what players see and in what order.

### Existing pages & patterns
- `src/pages/Host.jsx` — Current host page, round state machine, timer broadcast channel, closeRound() pattern. Phase 4 extends this with End Session + profile computation.
- `src/pages/Play.jsx` — Current player page, `gameFinished` state, session subscription pattern. Phase 4 wires `gameFinished` to FrameworkProfile render.
- `src/index.css` — CSS custom properties: `--bg`, `--accent`, `--danger`, `--serif`, `--sans`. Use these for profile styling.

### Schema (already in Supabase)
- `supabase/migrations/20260325000000_initial_schema.sql` — players table has `dominant_framework`, `conflicts`, `framework_counts` columns. reflections table exists with `player_id`, `session_id`, `round_number`, `text`, `submitted_at`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `computeProfile(choiceHistory)` in `src/lib/detection.js` — already implemented and tested. Returns `{ dominant, counts, leastUsed }`.
- `findConflicts(choiceHistory)` in `src/lib/detection.js` — returns array of `{ tension, description, rounds, frameworks }`.
- `FRAMEWORKS` in `src/lib/frameworks.js` — keyed by framework ID, has `name`, `description`, `question`. Use for profile copy.
- `CONFLICT_PAIRS` in `src/lib/frameworks.js` — has `tension` and `description` for each conflict pair. Use for conflict map text.
- `MeterBar` component — existing CSS meter bar. Can be reused for final world state display.
- `PlayerRoster` component — could be adapted or referenced for player list patterns.

### Established Patterns
- **Fetch-then-subscribe**: Fetch initial player data, then subscribe to UPDATEs. Use this when Play.jsx needs to pick up the written profile.
- **Functional state updates**: `setState(prev => ...)` in subscription callbacks.
- **CSS Modules**: `import styles from './Component.module.css'` for all new components.
- **Supabase UPDATE**: `supabase.from('players').update({...}).eq('id', playerId)` — established pattern.

### Integration Points
- `Play.jsx`: `gameFinished` state already exists. When `session.status === 'finished'`, render `<FrameworkProfile player={player} />` instead of game loop UI.
- `Host.jsx`: After last round closes, show "End Session" button. On click: (1) compute all profiles, (2) write to Supabase, (3) update session status to 'finished', (4) transition host screen to end view.
- `reflections` table: subscribe to INSERTs in Host end view to show anonymous responses in real time.
- `players` table: Host fetches all players' `choice_history` to compute group profiles. After writing, Play.jsx reads `dominant_framework` + `conflicts` via subscription.

</code_context>

<deferred>
## Deferred Ideas

- **Three.js city on host end view**: City placeholder stays for v1. Full 3D city scene deferred to v2 (per Phase 1 decision).
- **Animated SVG meter bars (FrameworkProfile)**: Static CSS bars for v1. Themed animated versions (bridge, lighthouse, train, fog) deferred to v2.
- **AI-generated debrief commentary**: AI-01 in v2 requirements. Not in scope.
- **Pie chart for group framework breakdown**: Text list for v1 is sufficient and faster to implement. Pie chart could be a v2 visual enhancement.

</deferred>

---

*Phase: 04-end-state*
*Context gathered: 2026-03-25*
