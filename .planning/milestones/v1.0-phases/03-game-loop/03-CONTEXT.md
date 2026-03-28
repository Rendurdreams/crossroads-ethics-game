# Phase 3: Game Loop - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

A complete round runs end-to-end: host advances through scenarios, players read and choose, host (or timer) closes the round, consequences reveal privately on player phones, world state updates on all screens. Host controls pace via timer and manual close. This phase does NOT include framework profiles or end state (Phase 4), and does NOT include the 3D city (deferred to v2).

</domain>

<decisions>
## Implementation Decisions

### Timer
- **D-01:** Timer auto-closes the round when it hits 0 — choices lock, consequences reveal automatically. No host action required.
- **D-02:** Host can still close the round early by clicking "Close Round" before the timer hits 0.
- **D-03:** Default timer range: 30–90 seconds (host sets before starting). For a 15-min presentation with 4 rounds plus debrief, ~45–60 sec per round is the target sweet spot.
- **D-04:** Timer displayed visually on host screen during the round. Shows remaining seconds. Color shifts to red/amber when under 10 seconds.
- **D-05:** Timer also shown on player phone (so players feel the pressure). Player timer is read-only — host controls start/stop.

### Host Layout (city placeholder)
- **D-06:** 3D city is deferred to v2. For Phase 3, render a dark panel in the city space with a simple placeholder — city silhouette SVG or "City View" label in muted text. Must not look broken or unfinished, just reserved.
- **D-07:** Host round view has two panels: left panel (city placeholder, ~60% width), right panel (scenario title, live vote tally, world state meters, timer, player count, Close Round button).
- **D-08:** Host entry gets a separate `/host-setup/:sessionId` page after "Create Game." This page shows: room code (large, QR code optional), round count selector, presenter instructions/checklist, and a "Open Lobby" button that transitions to the lobby view. This gives Jay a moment to prepare before projecting the lobby.

### Pass/Abstain (heavy rounds)
- **D-09:** Rounds 3 and 4 show a content note with a "Pass this round" option before displaying the scenario.
- **D-10:** If player passes: they see a neutral waiting screen ("You sat this one out"). They do NOT see the scenario text or choice buttons.
- **D-11:** Passed players still receive the consequence reveal and world state meter updates when the round closes — they see the outcome even though they didn't choose.
- **D-12:** Passed choices are excluded from the tally and from worldState computation (abstain markers never reach applyChoicesToWorld). This is already the established decision from Phase 1 state.

### Consequence timing
- **D-13:** When round closes (timer hits 0 or host clicks Close Round), there is a ~1-second pause/transition before the consequence text fades in on player phones. This gives a beat — the moment the host says "let's see what happened."
- **D-14:** Consequence text is the private outcome from the chosen choice in scenarios.js. It's shown only to the individual player, not broadcast.
- **D-15:** After consequence shows, the framework label for the chosen option appears below it with a 1-sentence explanation (e.g., "Care Ethics — You prioritized the person in front of you over the abstract rule."). Framework label is NOT shown before or during the choice.

### World State Meters
- **D-16:** CSS-only meters for v1 (animated SVG deferred to v2, per Phase 1 decisions). Simple CSS bar with `transition: width 0.8s ease` — clean, readable, not themed.
- **D-17:** 4 meters shown on both host and player screens after each round closes: Trust, Courage, Solidarity, Awareness.
- **D-18:** On host: meters displayed in the right panel (WorldStatePanel) alongside the vote tally.
- **D-19:** On player phones: meters displayed below the consequence text when the round closes.
- **D-20:** Meter bar color: amber (`var(--accent)`) for normal range, shifts to red (`var(--danger)`) if below 20.

### Vote Tally (host only)
- **D-21:** Live anonymous vote tally updates on host screen as players choose. Shows percentage per choice option (e.g., "Choice A: 62% | Choice B: 23% | Choice C: 15%").
- **D-22:** Choice labels are anonymous — no player names shown, just percentages and raw counts.
- **D-23:** "X of Y submitted" counter updates in real time.

### Presentation pacing
- **D-24:** Round flow target: content note (if any) → scenario read time (~30–45 sec) → timer counts down → round closes → consequence + meter update → Next Round button. Total per round ~90 sec including debrief beats.
- **D-25:** Jay will run separate research on psychological pacing for when to ask what. For now, the game engine supports the scenarios as-written — no reordering or dynamic selection needed for v1.

### Claude's Discretion
- Exact CSS animation approach for timer countdown bar
- Whether to use a single shared useReducer or separate useState calls in Host.jsx for round state
- Exact transition/animation between rounds
- How to handle the edge case of 0 players submitting (host closes anyway)

</decisions>

<specifics>
## Specific Ideas

- Presentation is 10–15 min with 4 rounds + debrief. Timer auto-close is essential to keep it on track.
- Jay wants the experience to feel "cohesive" — the pacing of psychology, dilemma, and reflection needs to land together. The game should not feel rushed or padded.
- Host setup page is for Jay to prepare before projecting — a presenter backstage, not a public-facing screen.
- "More robust host landing" = the host entry experience should feel deliberate and professional, not just a landing page. /host-setup is that moment.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Game logic (already implemented in Phase 1)
- `src/lib/scenarios.js` — Full scenario library: 6 rounds, 3 choices each, framework tags, world impacts, private consequences, content notes
- `src/lib/worldState.js` — `applyChoicesToWorld()`: weighted aggregate world state update from choice tally
- `src/lib/detection.js` — `computeProfile()`, `findConflicts()`: framework detection (used in Phase 4, but executor should not break these)
- `src/lib/frameworks.js` — Framework definitions, conflict pairs

### Phase spec (scenario design rules, round structure, host/player feature spec)
- `CLAUDE.md` — Full game spec: scenario library design rules (§Scenario Library), host dashboard feature spec (§Host Dashboard — Feature Spec), player view feature spec (§Player View — Feature Spec), world state meter descriptions (§World State), presentation flow (§Presentation Flow)

### Existing UI foundation (from Phases 1–2)
- `src/pages/Host.jsx` — Current host page: fetch session, subscribe to player inserts, startGame(), PlayerRoster — Phase 3 extends this
- `src/pages/Play.jsx` — Current player page: localStorage restore, subscribe to session updates, game-start detection — Phase 3 extends this
- `src/index.css` — CSS custom properties: `--bg`, `--accent`, `--danger`, `--serif`, `--sans`
- `supabase/migrations/20260325000000_initial_schema.sql` — Schema: sessions, players, choices, reflections tables + RLS policies

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `supabase` singleton (`src/lib/supabase.js`) — established import pattern, used by all pages
- `PlayerRoster` component (`src/components/PlayerRoster.jsx`) — player list with emoji + name, can be reused in host round view
- CSS custom properties on `:root` — `--bg`, `--bg-surface`, `--accent`, `--accent-hover`, `--danger`, `--serif`, `--sans` all available

### Established Patterns
- **Fetch-then-subscribe**: Host.jsx fetches initial state first, then subscribes — prevents race conditions. Use this pattern for choices tally.
- **Functional state updates**: `setPlayers(prev => ...)` pattern established to prevent stale closures in subscriptions.
- **Dedup check**: `.some(p => p.id === payload.new.id)` pattern for preventing duplicate subscription events.
- **Cleanup**: Every `supabase.channel()` has a corresponding `supabase.removeChannel()` in useEffect cleanup.
- **CSS Modules**: All pages use `import styles from './Page.module.css'` pattern.

### Integration Points
- `Host.jsx`: `startGame()` currently updates session status to 'active'. Phase 3 adds: round management (current_round increments), close round (status → 'round_complete'), next round (status → 'active' + increment round).
- `Play.jsx`: Already subscribes to session UPDATE and detects `status === 'active'`. Phase 3 adds: detect `status === 'round_complete'`, render scenario by `current_round`, submit choices to Supabase.
- `sessions.current_round`: Drives which scenario displays on player phones (index into scenarios array).
- `choices` table: Player submissions write here. Host reads for live tally via subscription.

</code_context>

<deferred>
## Deferred Ideas

- **3D city (Three.js)**: Full city visualization deferred to v2. Phase 3 uses a dark placeholder panel.
- **Animated SVG meters**: Themed meter animations (bridge, lighthouse, train, fog) deferred to v2. Phase 3 uses simple CSS bars.
- **Timer sound effects / haptics**: Not in scope for v1 presentation.
- **Psychological pacing research**: Jay will research optimal scenario ordering and debrief timing separately. Not a code change — the game engine supports the scenarios as-written.

</deferred>

---

*Phase: 03-game-loop*
*Context gathered: 2026-03-25*
