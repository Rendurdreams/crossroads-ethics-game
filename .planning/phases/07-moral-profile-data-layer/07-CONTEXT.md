# Phase 7: Moral Profile Data Layer - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Insert a moral baseline step into the player join flow: after a player enters their name and room code on Landing.jsx, and before they reach the lobby wait. The step collects a 5-value priority ranking (loyalty, honesty, fairness, courage, compassion) and 2 stance questions. This data is stored on the player row in Supabase and serves as the player's moral identity for Phase 11's conflict detection. No detection logic runs in this phase — Phase 7 is data collection only.

</domain>

<decisions>
## Implementation Decisions

### Where the step lives
- **D-01:** A new route `/baseline/:sessionId` is the step's home — not inline in Landing or Play.jsx.
- **D-02:** Join flow: Landing creates player row + writes localStorage → navigates to `/baseline/:sessionId` → baseline UI runs → writes moral_baseline to Supabase → navigates to `/play/:sessionId` → lobby wait.
- **D-03:** On refresh at `/baseline/:sessionId`, restore in-progress answers from localStorage (value ranking + stance selections saved as player taps). Write to Supabase only when the full baseline is submitted. This fulfills MORAL-02: localStorage preserves state until Supabase write confirms.

### Ranking interaction
- **D-04:** Tap-to-rank sequential selection: all 5 values shown as cards simultaneously. Player taps to assign ranks 1–5 in order (first tap = #1 value, second = #2, etc.). Each tapped card shows its assigned rank number. An undo/clear button per card allows changing a rank.
- **D-05:** No drag-and-drop — no library dependency needed. Touch-friendly card tap is sufficient.

### Framing and tone
- **D-06:** Immersive game-world framing — written in the war council / kingdom register, consistent with existing Play.jsx atmospheric copy. Example: "Before you take your seat at the council, declare what you hold most dear. Your counsel will remember."
- **D-07:** The step should feel like the game has already begun, not like a survey gatekeeping entry. The page should share the glass-morphism dark aesthetic and Playfair Display copy style.
- **D-08:** Stance questions use decree-tile button style (same visual component as scenario choices) — amber bordered buttons with Roman numeral prefix (I / II / III).
- **D-09:** Stance question 1: "Is it ever right to lie to protect someone you love?" — answers: I. Yes / II. No / III. It depends. Maps to care vs. deontology.
- **D-10:** Stance question 2: "Do the ends justify the means if enough people benefit?" — answers: I. Yes / II. No / III. It depends. Maps to consequentialism vs. deontology.

### Schema: how baseline is stored
- **D-11:** Two new JSONB columns on the `players` table:
  - `moral_values jsonb DEFAULT NULL` — ordered array of value strings e.g. `['honesty', 'courage', 'loyalty', 'fairness', 'compassion']`
  - `moral_stances jsonb DEFAULT NULL` — key/value object e.g. `{ "lie_to_protect": "yes", "ends_justify": "it_depends" }`
- **D-12:** Stance answer keys: `lie_to_protect` and `ends_justify`. Possible values: `"yes"`, `"no"`, `"it_depends"`.
- **D-13:** Schema change requires a Supabase SQL migration: `ALTER TABLE players ADD COLUMN moral_values jsonb DEFAULT NULL; ALTER TABLE players ADD COLUMN moral_stances jsonb DEFAULT NULL;`

### Claude's Discretion
- Exact CSS layout of the value cards (grid vs. stacked column)
- Whether value rank badges are numbers or ordinal labels (1st, 2nd…)
- Exact copy for UI micro-labels and helper text within the war council register
- Progress indicator style between value ranking and stance questions (step dots, separator, etc.)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — MORAL-01, MORAL-02 define the acceptance criteria for this phase
- `.planning/ROADMAP.md` §Phase 7 — Success criteria (3 items) for this phase

### Existing join flow and player model
- `src/pages/Landing.jsx` — Current join flow: player row creation, localStorage writes, navigation to /play/:id — this is the insertion point
- `src/pages/Play.jsx` — Session restore logic on mount (useEffect with localStorage + Supabase re-fetch) — the new /baseline route must follow the same restore pattern
- `CLAUDE.md` §Supabase Schema — `players` table definition (existing columns, types, defaults) — new columns must be added without disturbing existing shape

### Design and atmosphere
- `CLAUDE.md` §Key Design Decisions — Glass-morphism, amber, Playfair Display, decree-tile buttons — baseline page must match this language
- `src/pages/Play.jsx` — War council atmospheric copy register ("council", "decree", "realm") — baseline copy should echo this

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ScenarioCard.jsx` + decree-tile button style in `Play.jsx` — stance question answers should reuse the same button component/style as scenario choices (amber border, Roman numeral prefix, tap-to-lock pattern)
- `ContentNote.jsx` — dismissible note component; could be repurposed for the "your counsel will remember" intro before the ranking UI
- `FrameworkLabel.jsx` — post-choice label reveal pattern — similar delayed-reveal approach could be used to show a brief frame label after each stance answer is selected

### Established Patterns
- Framer Motion `AnimatePresence mode=wait` used for all page transitions — `/baseline` page should use same `pageVariants` pattern from Landing.jsx / Play.jsx
- Three `useEffect` separation pattern in Play.jsx (mount restore, players subscription, session subscription) — baseline page only needs mount restore + single Supabase write, simpler
- `maybeSingle()` for room code lookup (Landing.jsx) — same null-safe query pattern for reading player row on baseline page mount

### Integration Points
- Landing.jsx `joinSession()` function: currently navigates to `/play/:sessionId` after inserting player row — will change to navigate to `/baseline/:sessionId` instead
- `App.jsx` router: needs new `<Route path="/baseline/:sessionId" element={<Baseline />} />` added
- `supabase.js` typed helpers: may need `updatePlayerBaseline(playerId, moralValues, moralStances)` helper added
- Players table: 2 new columns (`moral_values`, `moral_stances`) added via SQL migration

</code_context>

<specifics>
## Specific Ideas

- The step must complete in under 60 seconds — the ranking + 2 questions should be achievable in 30–45 seconds for most players
- The game aesthetic preview from discussion: `"Before you take your seat at the council, declare what you hold most dear. Your counsel will remember."` — use this or close to it as the heading copy
- Value cards should feel like they're being "committed" when tapped — a satisfying micro-interaction (subtle scale/glow similar to decree-tile lock feedback in ScenarioCard)
- The concern from STATE.md: "design must not feel like a survey gatekeeping the game" — framing as kingdom entry ritual resolves this

</specifics>

<deferred>
## Deferred Ideas

- Moral conflict detection at choice-lock time (MORAL-03, MORAL-04) — held for Phase 11. Phase 7 only stores the baseline; detection requires game loop to be complete.
- End-screen moral vs. ethics conflict map (MORAL-05, MORAL-06) — Phase 11.
- Animated SVG or richer value card interactions — CSS class-based is sufficient for v1.

</deferred>

---

*Phase: 07-moral-profile-data-layer*
*Context gathered: 2026-03-27*
