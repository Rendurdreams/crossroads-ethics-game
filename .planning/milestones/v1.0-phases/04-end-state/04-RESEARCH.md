# Phase 4: End State - Research

**Researched:** 2026-03-25
**Domain:** React component composition, Supabase batch updates, inline SVG, real-time subscription patterns
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Profile Computation & Storage**
- D-01: Host triggers profile computation. When host clicks "End Session", Host.jsx calls `computeProfile()` and `findConflicts()` for each player using their `choice_history` JSONB field fetched from Supabase.
- D-02: Host writes computed profiles back to Supabase — `dominant_framework` (text), `conflicts` (JSONB), `framework_counts` (JSONB) updated on each player row.
- D-03: Play.jsx receives the updated profile via its existing player row subscription (or a re-fetch triggered by session status changing to 'finished'). Uses the written player row data to render FrameworkProfile.
- D-04: Data is ephemeral — no special persistence required beyond the in-session Supabase rows.

**Session End Trigger**
- D-05: "End Session" is a deliberate host action. Sets `sessions.status = 'finished'`, triggers profile computation + write, transitions host to end view.
- D-06: Session does NOT auto-end after the last round closes. Host has a moment to narrate before triggering the final reveal.

**Round 6 Flow**
- D-07: Round 6 runs like any round — host advances to it normally. `session.current_round` index hits 5 (0-indexed).
- D-08: Play.jsx detects `current_round === 5` (Round 6 = `scenarios[5]`) and renders a reflection textarea instead of ScenarioCard + choice buttons.
- D-09: Host sees "reflection in progress" state — no vote tally, just player count and close button.
- D-10: When Round 6 closes, `status → 'round_complete'` as normal. Finalize reflection submission if text entered.
- D-11: Framework profile appears on player phones when `status === 'finished'`.
- D-12: Reflection input appears BELOW the framework profile as an optional add-on. No blocking gate.
- D-13: Reflection submissions stored in the `reflections` table.

**FrameworkProfile Visual Structure**
- D-14: Single scrolling page — no tabs, no pagination. Sections stacked vertically.
- D-15: Full text from CLAUDE.md spec for dominant framework, conflict description, and least-used prompt. Do not shorten.
- D-16: Conflict map renders as a small SVG diagram: two framework nodes connected by a line labeled with tension name. Editorial/minimal.
- D-17: Choice log shows each round: round name, choice made (text excerpt or short label), framework tag.

**Host End View**
- D-18: Same 60/40 layout as round view — city placeholder on left, stats panel on right.
- D-19: Right panel shows: group framework breakdown, world state narrative, anonymous reflection feed, final world state meters.
- D-20: World narrative is computed conditional text based on which meters are high/low.

### Claude's Discretion
- Exact SVG structure and styling for the conflict diagram
- Specific threshold values and exact text for world state narrative combinations
- Animation/transition when profile appears on player phones
- How to handle players who passed all heavy rounds (no conflicts, possibly no dominant framework)
- Whether group framework breakdown uses pie chart or text list (text list preferred for simplicity)
- Exact CSS layout for FrameworkProfile sections on mobile

### Deferred Ideas (OUT OF SCOPE)
- Three.js city on host end view — CityPlaceholder stays for v1
- Animated SVG meter bars (FrameworkProfile) — static CSS bars for v1
- AI-generated debrief commentary — v2 requirement (AI-01)
- Pie chart for group framework breakdown — text list for v1
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| END-01 | Each player sees their dominant framework with a full explanation paragraph | `computeProfile()` returns `{ dominant, counts, leastUsed }`. `FRAMEWORKS[dominant].description` has the full explanation paragraph. FrameworkProfile.jsx renders this in section 1. |
| END-02 | Each player sees a conflict map if cross-round tension detected, named with philosophical concept | `findConflicts()` returns `[{ tension, description, rounds, frameworks }]`. Rendered as inline SVG + paragraph in section 2 (conditional). |
| END-03 | Each player sees a "framework you used least" prompt | `computeProfile()` returns `leastUsed`. `FRAMEWORKS[leastUsed].question` has the prompt text. Section 3 of FrameworkProfile. |
| END-04 | Each player sees their full choice log (round, choice, framework) | `player.choice_history` JSONB array stored in Supabase already. Section 4 of FrameworkProfile maps it to round labels from `scenarios`. |
| END-05 | Round 6 shows a free-text reflection input; responses stored anonymously | `scenarios[5].text` is the reflection question. `reflections` table exists. Play.jsx detects `current_round === 6` and renders textarea. |
| END-06 | Host end view shows group framework breakdown (% per framework overall) | All players' `dominant_framework` values fetched at end, grouped by value, % computed. Text list rendered in host right panel. |
| END-07 | Host end view shows anonymous reflection responses as they're submitted | `reflections` table insert subscription. NOTE: reflections table is NOT currently in the real-time publication — needs to be added. |
</phase_requirements>

---

## Summary

Phase 4 is a pure front-end composition phase. All the heavy logic (`computeProfile`, `findConflicts`, `FRAMEWORKS`, `CONFLICT_PAIRS`) is already implemented and tested in `src/lib/`. The Supabase schema already has `dominant_framework`, `conflicts`, `framework_counts` columns on `players` and a `reflections` table. The existing component and CSS patterns are established and well-understood.

The phase has three distinct work streams: (1) the **FrameworkProfile component** for player phones — a single scrolling page wiring lib functions to visual sections with staggered `fadeUp` animations; (2) the **HostEndView** replacing the stub `endView` in Host.jsx — reusing the existing two-panel layout class with group stats and a reflection feed; (3) **Round 6 detection** in Play.jsx to show a textarea instead of ScenarioCard.

There is one critical infrastructure finding: the `reflections` table is NOT included in the Supabase real-time publication (the migration SQL explicitly omits it with a comment). The host reflection feed requires real-time inserts. This must be addressed — either by adding the table to the publication via SQL, or by polling.

**Primary recommendation:** Add `reflections` to `supabase_realtime` publication as a Wave 0 task. Then implement the three work streams: Round 6 detection, FrameworkProfile.jsx, HostEndView. The data layer is already complete — this phase is UI wiring with no new schema work except the publication fix.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x (installed) | Component composition, state, effects | Project-decided. Already in use. |
| @supabase/supabase-js | 2.x (installed) | Batch player updates, reflection insert, real-time subscription | Already in use. Channel pattern established. |
| CSS Modules | Native (Vite) | Scoped component styles | Project-decided. Every component uses this pattern. |

### No New Libraries
This phase requires zero new npm installs. All capabilities needed are either already installed or are native browser/React APIs (inline SVG, CSS keyframes, textarea).

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline SVG for conflict diagram | External SVG file | Inline is simpler for a static diagram; no additional file fetch |
| CSS animation delays for stagger | JS setTimeout / requestAnimationFrame | CSS-only approach matches existing ConsequenceReveal.module.css pattern exactly |
| Supabase real-time for reflection feed | Polling every N seconds | Real-time is cleaner but requires adding `reflections` to the publication first |

---

## Architecture Patterns

### Recommended Project Structure
No new directories. New files:
```
src/
  components/
    FrameworkProfile.jsx          -- player end screen component
    FrameworkProfile.module.css
  pages/
    Host.jsx                      -- extend existing (endGame sequence, HostEndView inline)
    Host.module.css               -- extend existing (no new classes needed — roundView reused)
    Play.jsx                      -- extend existing (Round 6 detection, gameFinished render)
```

### Pattern 1: Host "End Session" Sequence
**What:** Sequential async operations on button click — fetch all players, compute profiles, batch update, set session finished.
**When to use:** Host clicks "End Session — Reveal Profiles" button after last round closes.

```javascript
// In Host.jsx — endSession() replaces current endGame()
async function endSession() {
  setEndingSession(true) // show "Computing profiles..." state

  // 1. Fetch all players' choice_history for this session
  const { data: allPlayers } = await supabase
    .from('players')
    .select('id, choice_history, framework_counts')
    .eq('session_id', sessionId)

  // 2. Compute profile for each player
  const updates = allPlayers.map(p => {
    const history = p.choice_history ?? []
    const { dominant, counts, leastUsed } = computeProfile(history)
    const conflicts = findConflicts(history)
    return {
      id: p.id,
      dominant_framework: dominant,
      conflicts: conflicts,
      framework_counts: counts
    }
  })

  // 3. Batch update players — one update call per player
  // NOTE: Supabase JS v2 does not support multi-row UPDATE in a single call.
  // Use Promise.all to fire all updates concurrently.
  await Promise.all(
    updates.map(u =>
      supabase.from('players')
        .update({
          dominant_framework: u.dominant_framework,
          conflicts: u.conflicts,
          framework_counts: u.framework_counts
        })
        .eq('id', u.id)
    )
  )

  // 4. Set session to finished — triggers Play.jsx subscription
  await supabase.from('sessions')
    .update({ status: 'finished' })
    .eq('id', sessionId)
}
```

**Confidence:** HIGH — established from existing patterns in Host.jsx (Promise-based Supabase calls) and confirmed Supabase v2 API shape.

### Pattern 2: Play.jsx Profile Reveal on 'finished'
**What:** When session status becomes 'finished', re-fetch the player row (now containing computed dominant_framework, conflicts, framework_counts written by host) and render FrameworkProfile.
**When to use:** `gameFinished` state becomes true via existing session subscription.

```javascript
// In Play.jsx — add to the 'finished' branch of session subscription handler
if (payload.new.status === 'finished') {
  setGameFinished(true)
  // Re-fetch player row to pick up host-written profile data
  supabase
    .from('players')
    .select('*')
    .eq('id', player.id)
    .single()
    .then(({ data }) => {
      if (data) setPlayer(data)  // triggers re-render with profile data
    })
}
```

**Confidence:** HIGH — D-03 decision, uses established fetch-then-subscribe pattern from Play.jsx comments.

### Pattern 3: Round 6 Detection in Play.jsx
**What:** When `session.current_round === 6` and `session.status === 'active'`, render the reflection textarea instead of ScenarioCard.
**When to use:** Host advances to Round 6 (only if `total_rounds === 6`).

```javascript
// In Play.jsx active round section — add before ScenarioCard render
const isRound6 = session.current_round === 6 && currentScenario?.choices?.length === 0

if (isRound6) {
  return <ReflectionInput
    question={currentScenario.text}
    sessionId={sessionId}
    playerId={player.id}
    roundNumber={6}
  />
}
```

**Confidence:** HIGH — `scenarios[5].choices` is `[]` (confirmed in scenarios.js line 181). The empty choices array is the reliable detection signal.

### Pattern 4: Reflection Real-Time Feed (Host)
**What:** Subscribe to `reflections` table INSERTs filtered by `session_id` to show anonymous responses as they arrive.
**When to use:** Host end view, after session status is 'finished'.

```javascript
// In Host.jsx end view — fetch initial + subscribe to inserts
useEffect(() => {
  if (session?.status !== 'finished') return

  // Fetch existing
  supabase.from('reflections').select('text')
    .eq('session_id', sessionId)
    .then(({ data }) => setReflections(data ?? []))

  // Subscribe to new inserts
  const channel = supabase.channel(`reflections:${sessionId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'reflections',
      filter: `session_id=eq.${sessionId}`
    }, (payload) => {
      setReflections(prev => [...prev, payload.new])
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [sessionId, session?.status])
```

**CRITICAL NOTE:** This subscription will fail silently unless `reflections` is added to the Supabase real-time publication. The migration SQL at line 83–84 explicitly excluded reflections with the comment "The reflections table does not need real-time replication." This was an oversight given the END-07 requirement. Wave 0 must run:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE reflections;
```
**Confidence:** HIGH for the code pattern. The publication gap is a verified finding from reading the migration SQL directly.

### Pattern 5: World State Narrative — Conditional Text Assembly
**What:** Compute a 2–3 sentence narrative from final meter values. Lead with most extreme meter, combine interesting pairs.
**When to use:** Host end view, "What Happened" section.

```javascript
// In Host.jsx or worldState.js — computeNarrative(worldState)
function computeNarrative(state) {
  const { trust, courage, solidarity, awareness } = state
  const sentences = []

  // Explicit interesting combinations first
  if (courage > 70 && solidarity < 30) {
    return "A lighthouse over a dark city — individuals brave, the collective dark."
  }
  if (trust > 70 && awareness < 30) {
    return "Trust held, but the city stayed foggy. They believed each other. They just weren't looking hard enough."
  }
  if (solidarity > 70 && courage < 30) {
    return "Every window lit. Lighthouse dark. Everyone stayed together — and no one went first."
  }

  // Single-meter narratives
  if (trust < 30) sentences.push("Your group fractured trust early and never rebuilt it.")
  else if (trust > 70) sentences.push("Your group kept faith with each other across difficult choices.")

  if (courage > 70) sentences.push("Courage held — even when it cost something.")
  else if (courage < 30) sentences.push("Courage was the hardest thing to hold onto.")

  if (solidarity < 30) sentences.push("The collective frayed. Individual protection won.")
  else if (solidarity > 70) sentences.push("The group stayed together. That's harder than it sounds.")

  if (awareness > 70) sentences.push("Your group chose to look, even when looking was harder.")
  else if (awareness < 30) sentences.push("Most of what mattered stayed hidden.")

  if (sentences.length === 0) {
    return "Your group held the middle ground — no catastrophic failures, no clear victories. That tension is its own kind of result."
  }

  return sentences.slice(0, 3).join(" ")
}
```

**Confidence:** HIGH — pattern specified in UI-SPEC.md. Thresholds are within Claude's discretion (D-20).

### Pattern 6: FrameworkProfile Conflict SVG — Inline JSX
**What:** Inline SVG diagram with two framework node circles connected by a line, tension label centered above.
**When to use:** Conflict map section, one per conflict in `conflicts` array.

```jsx
// In FrameworkProfile.jsx — one per conflict
function ConflictDiagram({ conflict }) {
  const [f1Name, f2Name] = conflict.frameworks.map(f => FRAMEWORKS[f]?.name ?? f)
  return (
    <div className={styles.conflictBlock}>
      <p className={styles.conflictRounds}>
        In Round {conflict.rounds[0]} and Round {conflict.rounds[conflict.rounds.length - 1]}
      </p>
      <svg width="240" height="80" viewBox="0 0 240 80" className={styles.conflictSvg}>
        {/* Connecting line */}
        <line x1="40" y1="40" x2="200" y2="40" stroke="#2e303a" strokeWidth="1" />
        {/* Tension label above center */}
        <text x="120" y="28" textAnchor="middle" fill="#f59e0b"
              fontSize="12" fontFamily="system-ui, sans-serif">
          {conflict.tension}
        </text>
        {/* Left node */}
        <circle cx="40" cy="40" r="20" fill="#12121e" stroke="#f59e0b" strokeWidth="1.5" />
        {/* Right node */}
        <circle cx="200" cy="40" r="20" fill="#12121e" stroke="#f59e0b" strokeWidth="1.5" />
        {/* Node labels below */}
        <text x="40" y="72" textAnchor="middle" fill="#6b7280"
              fontSize="11" fontFamily="system-ui, sans-serif">
          {f1Name}
        </text>
        <text x="200" y="72" textAnchor="middle" fill="#6b7280"
              fontSize="11" fontFamily="system-ui, sans-serif">
          {f2Name}
        </text>
      </svg>
      <p className={styles.conflictDescription}>{conflict.description}</p>
    </div>
  )
}
```

**Confidence:** HIGH — SVG dimensions and color values from UI-SPEC.md. Inline SVG in JSX is standard React; no library needed.

### Anti-Patterns to Avoid
- **Computing profiles in Play.jsx:** Only the host has all players' data. Play.jsx reads, never computes.
- **Blocking profile display on reflection submission:** D-12 is explicit — reflection is below the profile, not a gate.
- **Using `session.status === 'round_complete'` as end trigger:** The profile trigger is `status === 'finished'`. 'round_complete' after the last round is the pre-end waiting state.
- **Auto-ending the session:** D-06 is explicit — host clicks deliberately. No auto-trigger after last round.
- **Subscribing to reflections without adding to publication:** Real-time subscription to a table not in the publication will connect successfully but never fire. Silent failure.
- **Assuming `leastUsed` is always defined:** If a player passed all rounds, `computeProfile([])` returns `{ dominant: null, leastUsed: null }`. FrameworkProfile must handle the null case with the "You passed this round" empty state from UI-SPEC.md.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Framework profile logic | Custom framework counting | `computeProfile()` from `src/lib/detection.js` | Already implemented, tested, handles edge cases (empty history, ties) |
| Conflict detection | Custom conflict pair matching | `findConflicts()` from `src/lib/detection.js` | Already implemented, uses `CONFLICT_PAIRS` correctly |
| Framework copy text | Inline strings in component | `FRAMEWORKS[id].description`, `FRAMEWORKS[id].question` | Single source of truth; D-15 requires exact text from spec |
| Conflict tension names | Inline strings | `CONFLICT_PAIRS[n].tension`, `CONFLICT_PAIRS[n].description` | Same reason |
| Round 6 question text | Inline string | `scenarios[5].text` | Single source of truth |

**Key insight:** The entire data/logic layer exists. This phase is connecting existing outputs to new views.

---

## Common Pitfalls

### Pitfall 1: Reflections Real-Time Silently Broken
**What goes wrong:** Host reflection feed subscribes to `reflections` INSERTs but never receives events. Players submit reflections, they save successfully, but host sees nothing.
**Why it happens:** `reflections` table is not in the `supabase_realtime` publication. The subscription connects but never fires. The migration SQL (line 83–84) explicitly excluded it.
**How to avoid:** Add `ALTER PUBLICATION supabase_realtime ADD TABLE reflections;` as a Wave 0 task before implementing the subscription.
**Warning signs:** Subscription setup returns no error, but `reflections` inserts made by players do not trigger the host's `postgres_changes` handler.

### Pitfall 2: Race Between Host Write and Play.jsx Re-fetch
**What goes wrong:** Host clicks "End Session". Supabase updates session `status → 'finished'`. Play.jsx's session subscription fires immediately. Play.jsx re-fetches player row. But the player row update (dominant_framework, conflicts) may not be committed yet because `Promise.all` of player updates is still running.
**Why it happens:** The host sequence (D-01/D-02) writes players before setting sessions status (D-05), but Supabase propagates the session update via real-time to players almost instantly. The player row update might not have committed before Play.jsx reads it.
**How to avoid:** Strict ordering — all `Promise.all(playerUpdates)` must resolve before `sessions.update({ status: 'finished' })` is called. The sequence in `endSession()` must be sequential, not concurrent.
**Warning signs:** Profile renders with null dominant_framework for some players even though the session ended successfully.

### Pitfall 3: `choice_history` JSONB Out of Sync with Choices Table
**What goes wrong:** `computeProfile()` is called with `player.choice_history`, but `choice_history` was populated in Phase 1/2/3 logic. If a player passed a round, that round has no entry in `choice_history`. `computeProfile` handles this correctly (empty array → null dominant), but the choice log in section 4 maps `choice_history` to scenario titles. If the mapping assumes a fixed-length array aligned to round numbers, passes cause mismatched display.
**Why it happens:** `choice_history` only contains rounds where the player actively chose. Passed rounds have no entry.
**How to avoid:** Map `choice_history` entries by their `round` field, not by array index. For the choice log, iterate `scenarios` and look up the matching entry in `choice_history` by round number.
**Warning signs:** Choice log shows misaligned rounds (Round 3 entry appears on Round 2 row) for players who passed rounds.

### Pitfall 4: `endGame` vs `endSession` Collision
**What goes wrong:** Host.jsx currently has an `endGame()` function that just sets `status = 'finished'`. WorldStatePanel calls `onEndGame` after the last round closes. Phase 4 replaces this with `endSession()` which does profile computation first. If WorldStatePanel still calls the old `endGame` directly on button click, profiles never get computed.
**Why it happens:** The existing `onEndGame` prop wired in `WorldStatePanel` points to the pre-Phase-4 `endGame()`.
**How to avoid:** Replace `endGame()` with `endSession()` and pass `endSession` as `onEndGame` to WorldStatePanel. Or — per D-05/D-06 — decouple the "End Game" button from the "End Session — Reveal Profiles" button entirely. The round view's "End Game" button can remain a navigation aid, but the actual profile-computing trigger is a separate button that appears in the host end view after the last round closes.
**Warning signs:** Session ends immediately after last round, profiles are never computed, all players see null framework.

### Pitfall 5: Empty State for Full-Pass Players
**What goes wrong:** Player passed all heavy rounds in a 3-round session. `computeProfile([])` returns `{ dominant: null, leastUsed: null }`. FrameworkProfile tries to render `FRAMEWORKS[null].description` → TypeError.
**Why it happens:** No null guard on the `dominant` value.
**How to avoid:** Guard every section with a null check. If `dominant === null`, skip sections 1, 2, 3 and show the empty state copy from UI-SPEC.md: "You passed this round." / "Passing is a choice too. Here's what the group decided."
**Warning signs:** TypeErrors in FrameworkProfile when player.dominant_framework is null in Supabase.

---

## Code Examples

Verified patterns from existing codebase:

### Existing fadeUp Animation (from ConsequenceReveal.module.css)
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Apply with delay — no JS needed */
.sectionCard {
  opacity: 0;
  animation: fadeUp 400ms ease forwards;
  animation-delay: 200ms; /* stagger by section */
}
```

### Existing MeterBar Props Interface (from MeterBar.jsx)
```jsx
<MeterBar label="Trust" value={worldState.trust ?? 50} />
<MeterBar label="Courage" value={worldState.courage ?? 50} />
<MeterBar label="Solidarity" value={worldState.solidarity ?? 50} />
<MeterBar label="Awareness" value={worldState.awareness ?? 50} />
```
Props: `label` (string), `value` (number 0–100). Danger styling triggers automatically at `value < 20`.

### Existing Two-Panel Layout (from Host.module.css)
```css
/* Already defined — reuse for end view */
.roundView { display: flex; height: 100vh; width: 100%; }
.cityPanel { flex: 3; height: 100%; overflow: hidden; }
.statePanel { flex: 2; height: 100%; }
```
The end view uses `.roundView` + `.cityPanel` + `.statePanel` directly. No new layout classes needed.

### computeProfile Return Shape (from detection.js)
```javascript
// Returns:
{
  dominant: 'care',            // string key or null if no choices made
  counts: {
    consequentialism: 0,
    deontology: 1,
    care: 3,
    virtue: 1
  },
  leastUsed: 'consequentialism'  // string key or null
}
```

### findConflicts Return Shape (from detection.js)
```javascript
// Returns array of:
{
  tension: 'rule vs. outcome',
  description: 'You held a rule in one round...',
  rounds: [1, 3],              // sorted round numbers where conflict occurred
  frameworks: ['deontology', 'consequentialism']
}
```

### FRAMEWORKS Object Shape (from frameworks.js)
```javascript
FRAMEWORKS['care'] // →
{
  name: 'Care Ethics',
  description: 'Relationships and context matter most...',
  question: 'What does this specific person need from me?'
}
```
Section 1 uses `.description`. Section 3 uses `.question`.

### choice_history JSONB Structure
Each entry written during Phase 3 (from Phase 3 patterns):
```javascript
// player.choice_history array entries
{
  round: 2,               // 1-indexed round number
  scenarioId: 'round-2',
  choiceIndex: 0,
  frameworks: ['deontology', 'virtue']
}
```
Map to scenario name via `getScenarioByRound(entry.round)?.title`.

---

## Runtime State Inventory

Step 2.5: SKIPPED — this is not a rename, refactor, or migration phase. No runtime state inventory required.

---

## Environment Availability

Step 2.6: SKIPPED — this phase is purely front-end code changes. No external tools, services, CLIs, databases, or runtimes beyond what is already established from Phases 1–3. All dependencies (Node, npm, Supabase, Vite) verified operational in prior phases.

**One external action required:** Adding `reflections` to the Supabase real-time publication. This is a SQL statement executed in the Supabase Dashboard SQL editor, not a new external dependency. It is a one-time corrective step to fix the Phase 1 omission.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `endGame()` sets status directly | `endSession()` computes profiles first, then sets status | Phase 4 introduces this | Do not call old endGame for the reveal path |
| Stub `endView` in Host.jsx (lines 271–279) | Full HostEndView with group stats + reflection feed | Phase 4 replaces stub | Existing stub is the replacement target |
| Stub `gameFinished` render in Play.jsx (lines 259–266) | FrameworkProfile component | Phase 4 replaces stub | Existing stub is the replacement target |

**Confirmed stubs that Phase 4 replaces:**

Host.jsx lines 271–279:
```jsx
if (session?.status === 'finished') {
  return (
    <div className={styles.endView}>
      <p className={styles.endText}>Game Over</p>
      <CityPlaceholder />
      <p className={styles.loading}>Session ended.</p>
    </div>
  )
}
```

Play.jsx lines 259–266:
```jsx
if (gameFinished || session?.status === 'finished') {
  return (
    <div className={styles.page}>
      <p className={styles.finishedText}>Game complete.</p>
      <p className={styles.waiting}>Check your framework profile above.</p>
    </div>
  )
}
```

Both stubs are the exact insertion points for Phase 4 work.

---

## Open Questions

1. **Reflection submission during Round 6 close timing**
   - What we know: D-10 says when Round 6 closes, Play.jsx should submit if text is entered. The round moves to `round_complete`, then later `finished`.
   - What's unclear: If a player types text but Round 6 closes before they tap Submit, should Play.jsx auto-submit on `round_complete`? Or should the textarea remain available after the round closes, with submission happening anytime before `status === 'finished'`?
   - Recommendation: Keep it simple — textarea submittable until `status === 'finished'`. `round_complete` is an intermediate state. The blocking event is the profile reveal (finished), not the round close. This avoids a race condition where auto-submit fires after the DOM transitions.

2. **Batch player updates at scale (25 players)**
   - What we know: The host iterates all players and fires one Supabase update per player. With 25 players, that's 25 concurrent requests.
   - What's unclear: Does `Promise.all` of 25 Supabase updates complete within the classroom's network conditions before the session status update fires?
   - Recommendation: Sequential ordering is guaranteed by `await Promise.all(...)` before `await sessions.update(...)`. With 25 players and a 200ms average RTT, this should complete in under 3 seconds. Acceptable for a presentation. If it proves slow, a Supabase Edge Function could batch-update in a single call — but that's v2 complexity.

---

## Integration Point Summary

| File | Current State | Phase 4 Change |
|------|--------------|----------------|
| `src/pages/Host.jsx` | Has stub `endView`, `endGame()` sets status directly | Replace `endGame()` with `endSession()` sequence; replace stub `endView` with `HostEndView` inline or extracted component |
| `src/pages/Play.jsx` | Has stub `gameFinished` render; no Round 6 detection | Replace stub with `<FrameworkProfile player={player} />` on finished; add Round 6 textarea branch in active round section |
| `src/components/FrameworkProfile.jsx` | Does not exist | Create new |
| `src/components/FrameworkProfile.module.css` | Does not exist | Create new |
| Supabase publication | `reflections` table excluded | Add reflections to publication (SQL, one-time) |
| `src/lib/worldState.js` | May or may not have `computeNarrative` | Add if missing |

---

## Sources

### Primary (HIGH confidence)
- `src/lib/detection.js` — exact `computeProfile()` and `findConflicts()` signatures and return shapes. Read directly.
- `src/lib/frameworks.js` — `FRAMEWORKS` object shape and `CONFLICT_PAIRS` array. Read directly.
- `src/lib/scenarios.js` — Round 6 object at index 5: `choices: []`, `text` field. Read directly.
- `src/pages/Host.jsx` — existing state, subscriptions, `endGame()` stub. Read directly.
- `src/pages/Play.jsx` — existing `gameFinished` stub, session subscription pattern. Read directly.
- `src/index.css` — confirmed CSS custom properties.
- `src/components/MeterBar.jsx` — confirmed prop interface (`label`, `value`).
- `supabase/migrations/20260325000000_initial_schema.sql` — confirmed `reflections` table structure AND confirmed `reflections` is NOT in `supabase_realtime` publication.
- `.planning/phases/04-end-state/04-CONTEXT.md` — all locked decisions.
- `.planning/phases/04-end-state/04-UI-SPEC.md` — complete visual and interaction contract.

### Secondary (MEDIUM confidence)
- CLAUDE.md §End Screen — Framework Profile — Full copy text for section explanations. Aligns with what is in `frameworks.js`.
- CLAUDE.md §Host Dashboard — Feature Spec — End view section confirms D-18/D-19/D-20.

---

## Metadata

**Confidence breakdown:**
- Integration points: HIGH — read actual source files, not assumptions
- Standard stack: HIGH — no new dependencies required
- Architecture patterns: HIGH — all patterns derived from existing code in the codebase
- Pitfalls: HIGH (reflections publication gap), HIGH (race condition), MEDIUM (choice_history mapping)
- Stubs identified: HIGH — exact line numbers confirmed

**Research date:** 2026-03-25
**Valid until:** This research is based on the actual codebase state as of 2026-03-25. Valid until any of the canonical source files change.

**Critical finding requiring immediate action:**
`reflections` table is excluded from Supabase real-time publication. END-07 (host reflection feed) requires real-time inserts. This must be fixed in Wave 0 before the reflection subscription is implemented.
