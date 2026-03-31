# Domain Pitfalls

**Domain:** React + Supabase real-time multiplayer game — Signal Lost v2.0 additions
**Project:** The Crossroads / Signal Lost
**Researched:** 2026-03-30
**Confidence:** HIGH for integration patterns derived from reading existing codebase; MEDIUM for new mechanic-specific patterns derived from spec analysis; LOW where speculative

**Scope of this document:** Pitfalls specific to adding Signal Lost v2.0 features to the existing system. General pitfalls (subscription cleanup, RLS, double-submission, environment variables) are documented in the previous PITFALLS.md and remain valid. This document focuses on what changes or breaks when you layer in: senator profiles, discussion mode, break flags, walk mechanic evolution, new world axes, and the grading rubric.

---

## Critical Pitfalls

Mistakes that cause a rewrite, corrupt session data, or break the core pedagogical mechanic.

---

### Pitfall 1: World Axis Key Collision — Old Axes vs New Axes

**What goes wrong:** The existing world state uses `{ trust, courage, solidarity, awareness }` starting at 50. Signal Lost uses `{ CT, HD, SOL, ACC }` starting at 65. Both live in `sessions.world_state` as a JSONB column. If the new pack's choices use `worldImpact` keys that don't match what `applyChoicesToWorld()` checks for, the deltas are silently ignored. The bars never move.

The danger is more subtle: `solidarity` (existing) and `SOL` (new) are different keys. If a developer reuses the kingdom-arc key names in signal-lost scenario choices (`solidarity` instead of `SOL`), the existing `worldState.js` function will apply those deltas to the old axis — and since `SOL` doesn't exist in the state object, the `hasOwnProperty` guard in `applyChoicesToWorld` swallows it silently.

```javascript
// applyChoicesToWorld — existing guard:
Object.entries(choice.worldImpact).forEach(([meter, delta]) => {
  if (newState.hasOwnProperty(meter)) {   // <-- 'SOL' not in state = silent drop
    newState[meter] = Math.max(0, Math.min(100, newState[meter] + (delta * weight)))
  }
})
```

**Why it happens:** The scenario pack file and the world state initializer are written by different phases of development, or the spec's axis codes (CT, HD, SOL, ACC) are not consistently enforced through all layers.

**Consequences:**
- All world state bars stay at 65 for the entire 8-round session
- No visual feedback. The game looks broken but logs no errors.
- The pedagogical core — "the world is the consequence" — is invisible.

**Prevention:**
1. Define the axis keys as a named constant and import it everywhere:
   ```javascript
   // lib/worldAxes.js
   export const SIGNAL_LOST_AXES = { CT: 65, HD: 65, SOL: 65, ACC: 65 }
   export const SIGNAL_LOST_AXIS_KEYS = ['CT', 'HD', 'SOL', 'ACC']
   ```
2. Validate each scenario choice's `worldImpact` keys against `SIGNAL_LOST_AXIS_KEYS` in a unit test or startup assertion. Fail loudly if keys don't match.
3. When the session is created with the signal-lost pack, write `world_state` to Supabase using `SIGNAL_LOST_AXES` — not the existing `{ trust: 50, ... }` default.

**Detection:** After implementing the first scenario, submit a choice and `console.log(worldState)` before and after. If values are unchanged, axis key mismatch is the first thing to check.

**Phase:** Signal Lost scenario pack authoring + `worldState.js` extension. Must be verified before any world state UI is built.

---

### Pitfall 2: Senator Profile Assignment Not Persisted — Lost on Reload

**What goes wrong:** The spec assigns each player a senator profile on join (`profileId: 'A'–'F'`). If this assignment lives only in React component state or localStorage without a corresponding Supabase column, a phone reload between rounds produces a different (random) profile assignment. The player's Round 3 stake text no longer matches their Round 1 stake text. The Discussion Mode profile breakdown becomes incoherent because the same physical player is listed under multiple profile IDs.

**Why it happens:** The existing `players` table has no `profile_id` column. Adding profile assignment as a client-side-only concern (localStorage or state) is the path of least resistance — but it breaks the multiplayer invariant that Supabase is the source of truth for player state.

**Consequences:**
- Player reloads phone mid-game, gets Profile D when they started with Profile B
- Discussion Mode conflict spotlighting fires on the wrong pair (e.g., "Profile B and Profile C disagreed" — but the real Profile B changed)
- The R8 record references stakes from the wrong profile, breaking the "creeping complicity" arc
- Host cannot cross-reference which physical student is which senator

**Prevention:**
- Add `profile_id text` column to the `players` table.
- Assign profile on join (player insert), not at game start.
- Store in Supabase immediately: `{ name, profile_id, session_id }`.
- The assignment function must be idempotent: if a `profile_id` already exists for this `player_id`, do not re-assign.
- For classroom distribution (no duplicate profiles per session), the host assigns profiles or the join flow reads already-used profiles from the session and avoids them:
  ```javascript
  const usedProfiles = players.map(p => p.profile_id)
  const available = PROFILES.filter(p => !usedProfiles.includes(p))
  const assigned = available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : PROFILES[Math.floor(Math.random() * PROFILES.length)] // fallback if > 6 players
  ```

**Detection:** Join a session, note the profile assigned, reload the phone browser, rejoin. If the profile changes, the bug is active.

**Phase:** Schema migration (add `profile_id` to players) + Landing/join flow. Must be in the first wave of Signal Lost work.

---

### Pitfall 3: Discussion Mode Facilitator Controls Race — Double Advance

**What goes wrong:** Discussion Mode introduces a "Continue" button that advances all players simultaneously to the next round. If the host taps "Continue" while a slow network write is still in flight (e.g., the round-close world state update hasn't settled), some players receive the `current_round` increment before the world state update lands. Their phones show Round 3 with Round 2's world state still displayed. When the world state update finally fires, it updates an already-stale subscribed state.

The existing system has a related pitfall (Pitfall 9 from the prior doc — world state stale read on update). Discussion Mode amplifies it because the facilitator is explicitly controlling timing and may advance quickly.

**Why it happens:** The host `closeRound` and `advanceRound` are two separate Supabase updates: (1) apply world state + set `status = 'round_complete'`, (2) increment `current_round` + set `status = 'active'`. If these fire as two sequential client-side calls, there's a window where players see `current_round = 3` but `world_state` still reflects Round 2.

**Consequences:**
- Player phones show the new scenario but the previous world state bars
- Discussion Pause Screen shows wrong "How Others Chose" percentages if the session data hasn't flushed
- Facilitator timer countdown (Discussion Mode custom timer) may advance into the next round while display is inconsistent

**Prevention:**
- Combine the round advance + world state update into a single atomic Supabase RPC function:
  ```sql
  CREATE OR REPLACE FUNCTION advance_round(
    p_session_id uuid,
    p_new_world_state jsonb,
    p_new_round int
  ) RETURNS void AS $$
  BEGIN
    UPDATE sessions
    SET world_state = p_new_world_state,
        current_round = p_new_round,
        status = 'active'
    WHERE id = p_session_id;
  END;
  $$ LANGUAGE plpgsql;
  ```
- The "Continue" button in Discussion Mode should be disabled (grayed out) until the world state update is confirmed — show a brief spinner, not just optimistic UI.
- In Discussion Mode specifically, add a `discussion_paused` boolean to the session row. The facilitator sets it `true` when the round closes, `false` when they press Continue. This prevents the advance from racing with still-arriving player subscriptions.

**Detection:** In dev, add artificial latency to the Supabase world state update (a `setTimeout` before the write). Tap "Continue" immediately. If the next round renders with stale meters, the race is real.

**Phase:** Discussion Mode facilitator controls implementation. Flag for extra testing before any classroom session.

---

### Pitfall 4: Break Flags Stored Client-Side Only — Lost on Reload, Absent in R8 Record

**What goes wrong:** The break flag system (7 permanent world-state markers triggered by specific choices) is described as "persists across rounds" and "cited in R8 record." If break flags live only in React component state (`useState`) or are only computed at the end from `choice_history`, reloading loses the visual markers mid-game. More critically, if they are not stored in Supabase, the R8 dynamic scribe record cannot reference them from the server, and the Discussion Mode host dashboard cannot show them.

The spec's `GameState` interface (TypeScript pseudocode in the brief) shows:
```typescript
breakFlags: Record<string, boolean>  // e.g. { 'R1-ghost': true }
```

If this is local state only, it is ephemeral.

**Why it happens:** Break flags feel like a display concern (visual overlays on the map), so developers put them in component state. But they are a data concern — they must survive reloads, be readable by the host, and feed into R8.

**Consequences:**
- Player reloads phone: all break flag overlays disappear (map looks clean even after catastrophic choices)
- R8 scribe record misses "eleven million" annotation because the flag was never persisted
- Host dashboard cannot show break flag history across the session
- Discussion Mode conflict spotlighting (R2 ARGUS + R3 denial = compound consequence) cannot fire because the flag pairing data is not accessible

**Prevention:**
- Add `break_flags jsonb DEFAULT '{}'` column to the `players` table, OR store it at the session level in `sessions.world_state` (since break flags are global, not per-player, in multiplayer Discussion Mode).
- Update break flags immediately on choice submission — not deferred to round-close:
  ```javascript
  // In choice submit handler, after inserting the choice:
  const triggeredFlag = checkBreakFlag(scenarioId, choiceIndex)
  if (triggeredFlag) {
    await supabase.from('players')
      .update({ break_flags: { ...existingFlags, [triggeredFlag]: true } })
      .eq('id', playerId)
  }
  ```
- Solo Mode: break flags stored on player row. Discussion Mode: consider session-level flags since all players see the same world.

**Detection:** Trigger R1 Choice III (Ghost population marker). Reload the phone. If the Ghost marker is gone from the map, break flags are not persisted.

**Phase:** Schema migration (add `break_flags` to players or sessions) + choice submission handler. Before R8 scribe logic is built.

---

### Pitfall 5: Walk Mechanic (R6) Emits Wrong Choice Index for Signal Lost

**What goes wrong:** The existing `WalkMechanic.jsx` is hardcoded to the kingdom-arc's Round 6 ("Free Irel" / "Walk away" / "Commission scholars"). The labels, icons, and `onChoice` indices (0 = left, 1 = right, 2 = center/stop) are built around that scenario. Signal Lost Round 6 ("The Pain Engine") has three choices:
- Choice I = walked to terminal (enforce)
- Choice II = turned away or did not cross midpoint (walk away)
- Choice III = stopped at terminal door (conditional notice)

The index mapping may match (0, 1, 2), but the "corridor toward terminal" metaphor requires a different spatial layout than the current "two sides of a room" layout. More importantly, the stop-at-door interaction (Choice III requires the player to stop between 0.85–0.99 and wait 3 seconds) is not implemented in the current `WalkMechanic.jsx` — which uses a `setTimeout(1500ms)` to reveal the third option as a center button, not a position-hold interaction.

**Why it happens:** The Walk Mechanic component exists and "works" — it's tempting to reuse it with renamed labels. But the interaction design is different enough that reskinning will mislead players about what they are doing.

**Consequences:**
- Choice III is presented as an explicit third button (visible from the start), not as a "stop before crossing" interaction. This destroys the Greene et al. embodied decision-making basis for the mechanic.
- The "midpoint triggers the decision" behavior is absent — any implementation that requires deliberate choice III selection is just a three-button menu with walk imagery.
- If the wrong choice index is emitted (e.g., the component swaps left/right semantic mapping), R6 choices in the scribe record are inverted.

**Prevention:**
- Build a Signal Lost-specific walk mechanic variant, or make `WalkMechanic.jsx` truly configurable with:
  - `scenario` prop that drives label text
  - `thirdChoiceTrigger: 'button' | 'position-hold'` prop
  - Position-hold implementation: track whether player stopped in the 0.85–0.99 zone for 3+ seconds, then auto-emit Choice III
- The midpoint trigger (crossing 0.5 → Choice I fires) requires either: a drag/slider interaction, a click-to-move-forward/backward pattern, or a simplified "walk left / walk right" with a midpoint marker. For phone UX, click-to-move is the most reliable.
- Test R6 choice index emission against the spec: forward = Choice I (index 0), away = Choice II (index 1), stopped = Choice III (index 2).

**Detection:** Play Round 6, choose to walk to the terminal. Check what `choice_index` was submitted to Supabase. Verify it matches the delta table (Choice I = `CT: +14, HD: +28, SOL: +18, ACC: +24`).

**Phase:** Walk mechanic extension must be scoped before the scenario pack data is wired to the UI. Do not inherit the existing component as-is.

---

### Pitfall 6: Baseline Survey Question Keys Conflict Between Packs

**What goes wrong:** The existing baseline survey in `Baseline.jsx` uses these keys: `lie_to_protect`, `ends_justify`, `break_promise`, `loyalty_vs_fairness`, `punish_innocent`. These are stored in `players.moral_stances`. The Signal Lost baseline uses the same 5 keys but with different framing and different conflict trigger conditions (the new triggers reference `round-signal-r4`, `round-signal-r6`, etc. by scenario ID).

If the same player row's `moral_stances` column is reused across both packs, the conflict detection logic in `detection.js` will fire kingdom-arc triggers against Signal Lost choices (because the STANCE_TRIGGERS array still matches `scenarioId === 'round-4'`). A player who set `lie_to_protect: 'no'` on the kingdom baseline will get a conflict alert in Signal Lost Round 4 that references kingdom-arc text ("Your instinct was honesty. What changed?") — correct sentiment, wrong game.

**Why it happens:** The `moral_stances` column is a flat JSONB object with no pack scope. The detection logic hardcodes scenario IDs. When a new pack reuses the same question keys, the triggers collide.

**Consequences:**
- Conflict alerts show kingdom-arc-specific language during Signal Lost play ("You let Irel stay bound" when the player is in a sci-fi senator scenario)
- Alert messages are confusing and break immersion at the precise moment they are supposed to land most strongly
- If the player played the kingdom arc in a previous session and the same localStorage player ID is reused (unlikely but possible), stale stances fire against a new pack

**Prevention:**
- Scope the conflict trigger `matchCondition` by pack prefix, not just scenario ID:
  ```javascript
  // INSTEAD OF:
  matchCondition: (choice) => choice.scenarioId === 'round-4' && choice.choiceIndex === 2

  // DO:
  matchCondition: (choice) => choice.scenarioId === 'signal-r4' && choice.choiceIndex === 2
  ```
- Signal Lost scenario IDs must use a distinct prefix: `signal-r1`, `signal-r2`, etc. (not the same `round-1`, `round-2` pattern as kingdom-arc).
- The baseline survey should write to `moral_stances` with a `pack_id` prefix if multi-pack data needs to coexist, OR the baseline is taken fresh per session and overwrites the previous values (simpler, and appropriate since sessions are ephemeral).

**Detection:** Run the Signal Lost pack with `lie_to_protect: 'no'` set from a previous baseline. After R4, check if any conflict alert fires. Read the alert message. If it mentions kingdom-arc content, the trigger collision is active.

**Phase:** Signal Lost scenario pack data authoring + `detection.js` trigger update. Must be done before the baseline survey is wired to Signal Lost sessions.

---

## Moderate Pitfalls

Mistakes that cause notable UX failures or data quality problems without requiring a full rewrite.

---

### Pitfall 7: Discussion Mode Profile Breakdown Reveals Identity

**What goes wrong:** The Discussion Pause Screen is supposed to show "anonymous grid showing which profiles chose which option" — but in a classroom of 10–25 students, profile identity may not be anonymous. If only one student is Profile B and the class can see "Profile B → Choice I," and the student is sitting visibly at the front of the room, the "anonymity" is nominal.

More concretely: if the facilitator shows the profile breakdown before students have chosen their next round action, students who made a specific choice may be identifiable by elimination (if only 2 of 6 profiles made that choice, and everyone can see who those players are sitting near each other).

**Why it happens:** The spec says "visible to facilitator only until they choose to reveal." The reveal control is the mitigation. But the default UI might show it immediately or the facilitator might not understand they control the reveal.

**Consequences:**
- Students feel exposed when they expected anonymity
- Pedagogically backward: the revelation of "which profile voted how" becomes personal judgment rather than structural analysis
- Students self-censor in future rounds

**Prevention:**
- Default state: profile breakdown is hidden. Show only aggregate percentages by default.
- Facilitator must explicitly tap "Show Profile Breakdown" to reveal per-profile votes.
- In the UI, label it clearly: "Profile Breakdown (facilitator only)" with a lock icon.
- The conflict spotlight ("Profile B and C chose differently — ask them to explain") should use profile letter, not player name, and should only fire after the facilitator chooses to reveal.
- Consider a 30-second delay before the conflict spotlight appears, giving the facilitator time to set context before names are effectively surfaced.

**Phase:** Discussion Mode pause screen UI. The default-hidden pattern must be specified at component design time, not retrofitted.

---

### Pitfall 8: R5 Timer Auto-Select Corrupts Framework Profile If Not Flagged

**What goes wrong:** When the R5 timer expires, the spec says "the choice that was highlighted (or the first option) is selected automatically." If this auto-select is not flagged differently from a deliberate choice, it is counted in `computeProfile()` and `findConflicts()` at full weight, skewing the framework profile. A player who was about to choose Choice II (deontological) but was auto-forced to Choice I (care-based) because of timer expiry now has a "care" tag for R5 — inaccurate and potentially confusing in the end-screen reflection.

**Why it happens:** The timer auto-select calls the same `handleChoice(index)` function as deliberate taps. There's no differentiation in the choice row inserted to Supabase.

**Consequences:**
- End-screen framework profile is skewed by a forced choice
- R8 scribe pattern may be wrong (if timer-forced choices dominate the count)
- The pedagogical point of R5 ("time pressure activates System 1 processing") is lost if the auto-select isn't marked and explained to the player afterward

**Prevention:**
- Add `timer_expired: boolean` field to the choice row (already noted in the spec's `GameState` interface).
- In `computeProfile()` and `findConflicts()`, apply a weight of 0.5 to timer-expired choices, or exclude them from dominant framework calculation (they show separately in the timeline).
- In the ConsequenceReveal for R5, show a special note if timer_expired: "Time ran out. You defaulted to [choice]. The Greene et al. research suggests this is your System 1 response — notice what it chose."
- The R8 scribe record should reference timer_expired flag: "In Round 5, the clock ran before you decided. What your instinct chose there is a data point."

**Detection:** Let the R5 timer expire without choosing. Check the submitted choice row in Supabase. Verify `timer_expired = true` is recorded, not a null-flag deliberate choice.

**Phase:** Round 5 timer implementation + choice submission + profile computation. The flag must be added to the schema before the timer is built.

---

### Pitfall 9: Conflict Spotlight Fires Against Players Not in the Session

**What goes wrong:** Discussion Mode's conflict spotlight logic (Section 4 of the Discussion Pause Screen) checks "if the key conflict pair for that round chose differently, surface that specifically." The key conflict pairs are defined in the spec (e.g., R1: Profile B vs Profile C). But in a classroom session where not all 6 profiles are present — only 4 students joined, or Profile B was never assigned because 3 players joined and profiles were assigned A, C, E — the spotlight fires referencing a profile that doesn't exist in this session.

**Why it happens:** The conflict pair list is static (hardcoded in the spec). The session's active profile set is dynamic.

**Consequences:**
- "Profile B chose X because their donor was in CORPORATE TIER" — but there is no Profile B in this session. Facilitator is confused. Students notice the disconnect.
- Even worse: Profile B was assigned but the player hasn't submitted yet when the spotlight fires, so their choice is listed as unknown — making the facilitator prompt appear to reference a decision that hasn't happened.

**Prevention:**
- Before showing conflict spotlight, check that both profiles in the pair are present in `session.players` AND have submitted choices for the current round.
- Guard condition:
  ```javascript
  const pairActive = conflictPair.every(profileId =>
    activePlayers.some(p => p.profile_id === profileId && p.hasSubmitted)
  )
  if (!pairActive) return null  // skip spotlight, fall back to generic prompt
  ```
- Fallback: if the canonical conflict pair isn't active, surface the most interesting actual divergence from whoever IS present (two players who chose differently, most divergent stakes).

**Phase:** Discussion Mode pause screen implementation. The guard must be present before the first classroom use.

---

### Pitfall 10: Break Flags Not Propagated to Host Map Display

**What goes wrong:** Break flags are supposed to appear on the world map (host screen) as permanent visual markers after they are triggered. In Discussion Mode, the host screen is the classroom focus point. If break flags are stored in individual `players.break_flags` rows (per-player) rather than a session-level structure, the host's AnimatedMap has no single source of truth for which flags are currently active — it would need to query all players and union their flags on every render.

The alternative (session-level flags in `sessions.world_state`) creates a different problem: applying world state changes to `world_state` during the `applyChoicesToWorld` round-close logic introduces flag state into the same function that computes axis deltas, coupling two different concerns.

**Why it happens:** The architectural question of "where do break flags live" is not answered in the existing system (the system doesn't have break flags). The most convenient place (player row or session row) each has a tradeoff.

**Prevention:**
- Store break flags at the session level in a dedicated JSONB column: `sessions.break_flags jsonb DEFAULT '{}'`.
- Keep break_flags separate from world_state (two distinct columns) — axis delta computation stays clean in `worldState.js`, flag logic is a separate concern.
- When any player submits a break-flag-triggering choice, write to `sessions.break_flags` (not player row). The host's AnimatedMap subscribes to session updates and reads `break_flags` from the payload.
- In Solo Mode (no shared session), break flags still live on the session row for consistency.
- Schema:
  ```sql
  ALTER TABLE sessions ADD COLUMN break_flags jsonb DEFAULT '{}';
  -- Example: { "R1-ghost": true, "R4-sealed": true }
  ```

**Detection:** Trigger R4 Choice II (sealed audit). Open the Supabase dashboard and inspect the `sessions` row. If the seal flag is not in `sessions.break_flags`, it's missing from the host's view.

**Phase:** Schema migration + session update logic. Before AnimatedMap integration.

---

### Pitfall 11: Grading Rubric Instructor View Is Not Player-Accessible by Default — But Might Be

**What goes wrong:** The grading rubric is described as "instructor-facing, not player-visible." In the existing system, there is no instructor/player role distinction — the host is identified by navigating to `/host/:sessionId`, and any player on their phone in `/play/:sessionId` sees the same play view. If the grading rubric is added to any route or component that is accessible from a phone, a curious student can navigate to it.

**Why it happens:** The existing system separates host and player by URL path + localStorage, not by authentication. Nothing cryptographically prevents a player from appending `/rubric` to their URL if they know or guess the path. In a classroom, someone always tries.

**Consequences:**
- Students see the grading rubric during or after gameplay, altering their behavior in the reflection phase
- The "game never judges the player" principle is compromised if students can see "0–9: Student cannot articulate reasoning" while playing

**Prevention:**
- The grading rubric must only be accessible from the Host view (`/host/:sessionId`), not any player-facing page.
- Use query parameter or route structure that makes it non-guessable from the player side: `/host/:sessionId/rubric` (nested under the host route).
- In the Host component, render the rubric link only when `session.status === 'finished'`.
- Consider: the rubric doesn't need to be in the app at all for v2.0. It can ship as a PDF or a static page that instructors access separately. This eliminates the access risk entirely. The "instructor-facing" requirement is best served by keeping it entirely out of the game's runtime.

**Phase:** Grading rubric implementation. Route design must account for this before any rubric component is built.

---

### Pitfall 12: Mode Switching Not Enforced — Session Drifts Between Discussion and Solo

**What goes wrong:** The spec is explicit: "Set at game launch, not mid-game. Mode is stored in session config, not changeable by the player." If `mode` is stored in `sessions.status` or another mutable column without a guard, or if the Discussion Mode pause screen's "Continue" button is accessible by players (not just the facilitator), a player could advance the round without facilitator intent, disrupting the classroom pacing.

**Why it happens:** In the existing system, only the host controls `current_round` advancement. Discussion Mode adds a new control surface (the pause screen, which players see on their phones). If the "Continue" button is rendered in Play.jsx instead of Host.jsx, any player can tap it.

**Consequences:**
- A student taps "Continue" on their phone while the facilitator is mid-discussion, advancing all players to the next round
- Facilitator loses control of classroom pacing — the central promise of Discussion Mode fails
- In the worst case, the round advances while some players have not yet submitted choices, producing a round with partial data

**Prevention:**
- "Continue" is only rendered in Host.jsx (or a Facilitator view), never in Play.jsx.
- Players in Discussion Mode see a "Waiting for facilitator" screen after submitting — identical to the existing submitted state, no Continue affordance.
- Add `mode: 'discussion' | 'solo'` to the `sessions` table, written at session creation, never updated.
- In Play.jsx, check `session.mode` to determine whether to show the Discussion Pause content or proceed automatically to the next round after submission.
- Write a test: log in as a player, find the Continue button. It should not exist in the DOM.

**Phase:** Session creation (mode is written) + Play.jsx round advance logic + Discussion Mode pause screen. The host-only control must be established architecturally, not as a UI afterthought.

---

## Minor Pitfalls

---

### Pitfall 13: Profile Stake Text Rendered From Wrong Round Key

**What goes wrong:** The senator profile stake text is indexed by round number (`r1`, `r2`, ..., `r8`). If the game uses 0-indexed round numbers internally (as the existing system does with `currentRound` → 0-based) but the profile data uses 1-indexed keys, the stake text is always off by one. Players see Round 2's stake during Round 1, and Round 8's stake never renders (key `r9` doesn't exist → undefined).

**Prevention:**
- Standardize: profile stake keys are `r1`–`r8` (1-indexed, matching the round spec). The display layer always converts: `profile.stakes[\`r${session.current_round}\`]`.
- `current_round` in Supabase is 1-indexed for Signal Lost (round 1 = first scenario, as opposed to the existing system's 0-indexed current_round where 0 = lobby).
- Write a test: assert that `profile.stakes['r1']` through `profile.stakes['r8']` all have non-empty string values. This catches missing keys during data authoring.

**Phase:** Senator profile data authoring + Play.jsx profile rendering.

---

### Pitfall 14: How Others Chose Reference Data Conflicts Between Packs

**What goes wrong:** The existing `howOthersChose.js` contains reference percentages (Awad et al. data) keyed by scenario ID. Signal Lost's How Others Chose screen also uses Awad et al. global data (or its own reference values per the Discussion Mode spec). If the Signal Lost percentages are added to the same `howOthersChose.js` without namespacing, scenario ID collisions silently replace kingdom-arc data with Signal Lost data or vice versa.

**Prevention:**
- Add Signal Lost reference data under its own export or namespace in `howOthersChose.js`.
- Alternatively, store reference percentages inline in each scenario choice object rather than in a separate lookup file — avoids a lookup step and keeps the data co-located with the choice.

**Phase:** Signal Lost scenario pack data authoring.

---

### Pitfall 15: R8 Dynamic Scribe Generates Incorrect Pattern If Timer-Expired Choices Dominate

**What goes wrong:** `generateScribePattern()` (from the brief's Technical Architecture Notes section) counts framework tags across all 8 rounds to determine dominant pattern. If R5's timer-expired choice lands in a non-representative framework (forced auto-select), and if that framework happens to be the tiebreaker between two nearly-equal patterns, the scribe text is wrong. The player reads a "mostly deontological" pattern when their actual deliberate choices were mixed.

**Prevention:**
- Same mitigation as Pitfall 8: apply weight 0.5 to timer-expired choices in the scribe computation.
- Or: mark timer-expired choices with a separate tag in `frameworkMap` and handle them explicitly in `generateScribePattern`.

**Phase:** R8 scribe logic implementation.

---

### Pitfall 16: Assessment Export (Solo Mode PDF) May Fail on Mobile Safari

**What goes wrong:** The spec calls for a "downloadable summary" in JSON + "optional PDF export" for Solo Mode. PDF generation client-side (e.g., via `jsPDF` or `window.print()`) is inconsistent on mobile browsers, particularly iOS Safari, which has restrictive download handling. In a solo assessment context where a student submits the export as coursework, a PDF that fails to download on 30% of phones is a grading problem.

**Prevention:**
- Do not use client-side PDF generation for v2.0. Use JSON export as the primary format (reliable download on all browsers via data URI or Blob URL).
- If PDF is required: generate it on a server function (Supabase Edge Function or Netlify Function) and return a download URL. This is out of scope for v2.0 classroom use — defer to v2.1.
- For v2.0: JSON download + "Print to PDF" instructions for students who need a document format.

**Phase:** Solo Mode reflection screen implementation. Decide the export format before building the export feature.

---

## Phase-Specific Warnings

| Phase | Topic | Likely Pitfall | Mitigation |
|-------|-------|---------------|------------|
| Schema migration | New axis keys | Axis key collision (CT/HD/SOL/ACC vs trust/etc.) | Add `break_flags` + `profile_id` columns; validate axis keys against named constant |
| Profile assignment | Senator profiles | Profile not persisted → lost on reload | Write `profile_id` to players table on join; idempotent assignment |
| Scenario pack data | Signal Lost choices | Wrong `worldImpact` keys silently ignored | Unit test every choice's worldImpact keys against SIGNAL_LOST_AXIS_KEYS |
| Scenario pack data | Scenario IDs | Pack collision with kingdom-arc IDs | Use `signal-r1` through `signal-r8` prefix; never `round-1` pattern |
| Detection.js extension | Baseline conflict triggers | Kingdom-arc triggers fire in Signal Lost | Scope matchCondition by scenario ID prefix |
| Session creation | Mode | mode not enforced → discussion/solo confusion | Write `mode` to sessions table; never update; host-only Continue button |
| Discussion Mode | Pause screen | Profile breakdown reveals identity | Default hidden; facilitator-explicit reveal; guard conflict spotlight |
| Discussion Mode | Round advance | Double advance race condition | Atomic RPC for world state + round increment; disable Continue until confirmed |
| Break flags | Persistence | Client-side only → lost on reload | session.break_flags column; write on choice submit, not round-close |
| Break flags | Host map display | Per-player flags not queryable for host | Session-level break_flags, separate from world_state |
| Walk mechanic | R6 Signal Lost | Existing WalkMechanic wrong interaction model | Build position-hold variant; verify choice index emission |
| R5 Timer | Auto-select | Timer-forced choice skews framework profile | `timer_expired` field in choice row; weight 0.5 in profile computation |
| Grading rubric | Access control | Players can navigate to rubric URL | Host-only route; render only after session finished; consider static PDF instead |
| R8 Scribe | Pattern computation | Timer-expired choices dominate scribe pattern | Same timer_expired weight mitigation |
| Solo Mode export | Assessment | PDF generation fails on mobile Safari | JSON only for v2.0; defer PDF to server function |
| Conflict spotlight | Active profiles | Spotlight references profile not in session | Guard: both profiles must be present and submitted |

---

## Sources

All findings derived from:
- Direct codebase reading: `Play.jsx`, `Host.jsx`, `detection.js`, `worldState.js`, `WalkMechanic.jsx`, `Baseline.jsx`, `supabase.js`, `scenarios.js` — HIGH confidence (source code is authoritative)
- Signal Lost phase brief (v6) — HIGH confidence (spec is authoritative for intended behavior)
- Existing PITFALLS.md (2026-03-25) — HIGH confidence for general Supabase/React patterns, still valid
- Prior project history in PROJECT.md — HIGH confidence for constraints and decisions
- Integration pitfalls derived by comparing existing system shape against Signal Lost additions — MEDIUM confidence (integration failures are speculative until built)

**Confidence by area:**
| Area | Confidence | Notes |
|------|------------|-------|
| Axis key collision | HIGH | Code inspection confirms `hasOwnProperty` guard; named key mismatch is silent |
| Profile persistence | HIGH | Players table has no `profile_id` column (confirmed by reading codebase) |
| Discussion Mode race | MEDIUM | Pattern extrapolated from existing world state race (Pitfall 9); specific to Discussion Mode advance control |
| Break flag persistence | HIGH | No break_flags column exists; client-state-only is the default path of least resistance |
| Walk mechanic | HIGH | Code inspection of `WalkMechanic.jsx` confirms hardcoded kingdom-arc content |
| Baseline conflict triggers | HIGH | Code inspection of `detection.js` STANCE_TRIGGERS confirms kingdom-arc scenario IDs hardcoded |
| Timer auto-select flag | MEDIUM | Standard pattern for flagging non-deliberate choices; confirmed needed by spec |
| Profile identity reveal | MEDIUM | Classroom social dynamic inference; reasonable concern but not code-verifiable |
| Mobile PDF export | MEDIUM | Known iOS Safari limitation; LOW risk if deferred per recommendation |
