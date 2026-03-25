# Phase 3: Game Loop - Research

**Researched:** 2026-03-25
**Domain:** React real-time state machines, Supabase subscriptions, optimistic UI, CSS animation
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Timer auto-closes the round when it hits 0 — choices lock, consequences reveal automatically.
- **D-02:** Host can close the round early by clicking "Close Round" before timer hits 0.
- **D-03:** Default timer range: 30–90 seconds (host sets before starting). Target sweet spot: 45–60 sec/round.
- **D-04:** Timer displayed on host screen. Shows remaining seconds. Color shifts to red/amber when under 10 seconds.
- **D-05:** Timer shown on player phone (read-only). Host controls start/stop.
- **D-06:** 3D city deferred to v2. Phase 3 renders a dark placeholder panel — city silhouette SVG or "City View" label in muted text. Must not look broken.
- **D-07:** Host round view: left panel (city placeholder, ~60%), right panel (scenario title, live vote tally, world state meters, timer, player count, Close Round button).
- **D-08:** New `/host-setup/:sessionId` page between "Create Game" and the lobby. Shows: room code (large), QR code (optional), round count selector, presenter checklist, "Open Lobby" button.
- **D-09:** Rounds 3 and 4 show a content note with a "Pass this round" option before displaying the scenario.
- **D-10:** If player passes: neutral waiting screen ("You sat this one out"). They do NOT see scenario text or choice buttons.
- **D-11:** Passed players still receive the consequence reveal and world state meter updates when the round closes.
- **D-12:** Passed choices are excluded from tally and worldState computation.
- **D-13:** When round closes, ~1-second pause before consequence text fades in on player phones.
- **D-14:** Consequence text is the private outcome from the chosen choice in scenarios.js — shown only to individual player.
- **D-15:** After consequence shows, framework label for chosen option appears below it with 1-sentence explanation. Framework label NOT shown before or during the choice.
- **D-16:** CSS-only meters for v1. Simple CSS bar with `transition: width 0.8s ease`.
- **D-17:** 4 meters shown on both host and player screens after each round closes: Trust, Courage, Solidarity, Awareness.
- **D-18:** On host: meters in the right panel (WorldStatePanel) alongside vote tally.
- **D-19:** On player phones: meters displayed below consequence text when round closes.
- **D-20:** Meter bar color: amber (`var(--accent)`) for normal range, shifts to red (`var(--danger)`) if below 20.
- **D-21:** Live anonymous vote tally updates on host screen as players choose. Shows percentage per choice option.
- **D-22:** Choice labels anonymous — no player names, just percentages and raw counts.
- **D-23:** "X of Y submitted" counter updates in real time.
- **D-24:** Round flow target: content note (if any) → scenario read time → timer counts down → round closes → consequence + meter update → Next Round button.
- **D-25:** Scenarios play in order as-written — no reordering for v1.

### Claude's Discretion

- Exact CSS animation approach for timer countdown bar
- Whether to use a single shared `useReducer` or separate `useState` calls in Host.jsx for round state
- Exact transition/animation between rounds
- How to handle the edge case of 0 players submitting (host closes anyway)

### Deferred Ideas (OUT OF SCOPE)

- **3D city (Three.js):** Full city visualization deferred to v2.
- **Animated SVG meters:** Themed meter animations (bridge, lighthouse, train, fog) deferred to v2.
- **Timer sound effects / haptics:** Not in v1.
- **Psychological pacing research:** Jay researches separately; not a code change.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HOST-05 | Host can close the current round to lock all choices | Supabase UPDATE sessions.status → 'round_complete'; confirmed via existing patterns |
| HOST-06 | Host can advance to the next round after closing | UPDATE sessions: status → 'active', current_round + 1; established status machine |
| HOST-07 | Host sees live anonymous vote tally (% per choice) updating in real time | Supabase INSERT subscription on choices table; existing fetch-then-subscribe pattern |
| HOST-08 | Host sees "X of Y submitted" counter during each round | Derived from choices subscription count vs. players array length |
| HOST-09 | Host sees current world state (4 meters) after each round closes | applyChoicesToWorld() already built; call on round close, write to sessions.world_state |
| PLAY-04 | Player sees scenario text and 3 choice buttons each round | getScenarioByRound(session.current_round) from existing scenarios.js |
| PLAY-05 | Player's choice locks on tap with optimistic UI (no second submission) | Optimistic state lock + CSS pointer-events:none + Supabase INSERT with UNIQUE constraint as safety net |
| PLAY-06 | Player sees framework label for their choice after locking (not before) | Stored in local state after tap, revealed only on consequence view |
| PLAY-07 | Player sees private consequence text after host closes the round | Triggered by session.status → 'round_complete' in existing subscription |
| PLAY-08 | Player sees "X of Y submitted" counter while waiting for others | Supabase INSERT subscription on choices for same session_id + round_number |
| PLAY-09 | Player sees content note with pass option on heavy rounds (3 and 4) | scenarios.js contentNote field identifies heavy rounds; pass = no INSERT to choices |
| PLAY-10 | Player sees current world state (4 CSS meters) after each round closes | Delivered via sessions.world_state in session UPDATE subscription |

</phase_requirements>

---

## Summary

Phase 3 builds the complete game loop on top of a solid Phase 1–2 foundation. The existing code gives us: a working Supabase client singleton, established fetch-then-subscribe patterns with dedup logic, session status transitions already driven from Host.jsx, and Play.jsx already subscribing to session UPDATEs. Phase 3 extends these patterns rather than replacing them.

The core technical challenge is state machine coordination across two screens (host and all player phones) via Supabase real-time. The `sessions.status` field is the single source of truth: `lobby → active → round_complete → active → round_complete → ... → finished`. All UI transitions follow this signal. Host drives status changes; players react to them.

The second challenge is the optimistic UI lock for player choices. The UNIQUE(player_id, round_number) constraint on the choices table is already in place — it's the database-level double-submit guard. The UI-level guard is a simple boolean in React state that flips immediately on tap and sets `pointer-events: none` on all buttons. The Supabase INSERT fires in the background; if it fails, the error state surfaces a retry message.

**Primary recommendation:** Extend Host.jsx with a `useReducer` for round state management, add a choices subscription for live tally, and build the host round view (CityPlaceholder + WorldStatePanel). Extend Play.jsx with scenario rendering, choice submission, and consequence reveal triggered by `status === 'round_complete'`. Build 8 new components per the UI-SPEC.

---

## Standard Stack

### Core (already installed — no new packages needed)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| React | 18.x | Component state, hooks, lifecycle | Already installed |
| @supabase/supabase-js | 2.x | Real-time subscriptions, DB queries | Already installed and configured |
| react-router-dom | 7.x (installed as v7, BrowserRouter declarative mode) | Routing for new /host-setup route | Already installed; add one Route |
| CSS Modules | native (Vite) | Component-scoped styles | Established pattern in all existing pages/components |

### No new npm packages required for Phase 3

All Phase 3 functionality (timer, meters, vote tally, animations) is achievable with React hooks + CSS. The UI-SPEC explicitly confirms: "No additional npm packages needed for Phase 3 functionality." Framer Motion is NOT used; CSS handles all animations as specified.

---

## Architecture Patterns

### Established Patterns to Reuse

**Fetch-then-subscribe (canonical — use for choices tally):**
```javascript
// Fetch initial choices first (prevents missing choices submitted before subscription activates)
supabase.from('choices').select('*')
  .eq('session_id', sessionId)
  .eq('round_number', session.current_round)
  .then(({ data }) => setChoices(data ?? []))

// Then subscribe to new inserts
const channel = supabase.channel(`choices:${sessionId}:r${currentRound}`)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'choices',
      filter: `session_id=eq.${sessionId}` },
    (payload) => {
      setChoices(prev =>
        prev.some(c => c.id === payload.new.id) ? prev : [...prev, payload.new]
      )
    })
  .subscribe()
return () => supabase.removeChannel(channel)
```

**Functional state updates (prevents stale closures):**
```javascript
// Always use functional form inside subscription callbacks
setChoices(prev => [...prev, payload.new])
setPlayers(prev => prev.some(p => p.id === payload.new.id) ? prev : [...prev, payload.new])
```

**Session status machine in Host.jsx:**
```javascript
// Current: startGame() writes status → 'active', current_round: 1
// Phase 3 adds:
async function closeRound() {
  await supabase.from('sessions')
    .update({ status: 'round_complete' })
    .eq('id', sessionId)
}

async function nextRound() {
  await supabase.from('sessions')
    .update({ status: 'active', current_round: session.current_round + 1 })
    .eq('id', sessionId)
}

async function endGame() {
  await supabase.from('sessions')
    .update({ status: 'finished' })
    .eq('id', sessionId)
}
```

**Play.jsx already detects status changes — extend with new cases:**
```javascript
// Existing subscription in Play.jsx fires on ALL session UPDATEs
// payload.new gives the full new row including world_state
(payload) => {
  setSession(payload.new)
  if (payload.new.status === 'active') setGameStarted(true)
  // Phase 3 adds:
  if (payload.new.status === 'round_complete') setRoundClosed(true)
  if (payload.new.status === 'finished') setGameFinished(true)
}
```

### Recommended State Structure

**Host.jsx — use useReducer for round state (Claude's Discretion resolved here):**

`useReducer` is the right choice because Host.jsx round state has multiple coordinated fields that change together: choices array, timer state, round status. Separate `useState` calls create synchronization bugs (e.g., rendering intermediate states where choices exist but timer hasn't reset). A reducer guarantees atomic transitions.

```javascript
const initialRoundState = {
  choices: [],       // submitted choices for current round
  timerSeconds: 60,  // countdown remaining
  timerRunning: false,
  roundClosed: false
}

function roundReducer(state, action) {
  switch (action.type) {
    case 'ROUND_START':
      return { ...initialRoundState, timerSeconds: action.duration, timerRunning: true }
    case 'CHOICE_RECEIVED':
      return { ...state,
        choices: state.choices.some(c => c.id === action.choice.id)
          ? state.choices
          : [...state.choices, action.choice]
      }
    case 'TICK':
      return { ...state, timerSeconds: Math.max(0, state.timerSeconds - 1) }
    case 'ROUND_CLOSE':
      return { ...state, timerRunning: false, roundClosed: true }
    default:
      return state
  }
}
```

**Timer implementation — setInterval in useEffect:**
```javascript
useEffect(() => {
  if (!roundState.timerRunning || roundState.timerSeconds <= 0) return

  const interval = setInterval(() => {
    dispatch({ type: 'TICK' })
  }, 1000)

  return () => clearInterval(interval)
}, [roundState.timerRunning, roundState.timerSeconds])

// Auto-close when timer hits 0
useEffect(() => {
  if (roundState.timerSeconds === 0 && roundState.timerRunning) {
    closeRound()  // writes to Supabase, triggers all subscribers
  }
}, [roundState.timerSeconds, roundState.timerRunning])
```

**Important:** `closeRound()` must be idempotent — if host clicks Close Round AND timer hits 0 near-simultaneously, the Supabase update is a no-op if status is already 'round_complete'. Guard in the host: `if (roundState.roundClosed) return`.

### World State Update Flow

The host is the sole writer of world state. When the host closes a round:

1. Host reads current choices from local state (already in `roundState.choices` from subscription)
2. Calls `applyChoicesToWorld(choices, scenarios, roundIndex, currentWorldState)` — already implemented in `src/lib/worldState.js`
3. Writes new world state to `sessions.world_state` in the same UPDATE that sets status to 'round_complete'
4. Player phones receive the full session UPDATE via their existing subscription — `payload.new.world_state` has the new values
5. Player phones render `MeterBar` components using `session.world_state`

```javascript
async function closeRound() {
  // 1. Filter abstaining players
  const submittedChoices = roundState.choices  // already excludes passers (no row inserted)

  // 2. Compute new world state
  const roundIndex = session.current_round - 1  // scenarios array is 0-indexed
  const newWorldState = applyChoicesToWorld(
    submittedChoices,
    scenarios,
    roundIndex,
    session.world_state
  )

  // 3. Single atomic update — status + world_state change together
  await supabase.from('sessions')
    .update({ status: 'round_complete', world_state: newWorldState })
    .eq('id', sessionId)
}
```

**Key insight:** Writing world_state in the same UPDATE as status means players always see a consistent state. They never get `round_complete` with stale world_state.

### Optimistic UI for Choice Lock (PLAY-05)

```javascript
// In Play.jsx, local state for the current round
const [lockedChoiceIndex, setLockedChoiceIndex] = useState(null)
const [submitting, setSubmitting] = useState(false)

async function handleChoice(choiceIndex) {
  if (lockedChoiceIndex !== null || submitting) return  // already locked

  // 1. Optimistic lock — immediate UI response, no waiting
  setLockedChoiceIndex(choiceIndex)
  setSubmitting(true)

  // 2. Write to Supabase in background
  const { error } = await supabase.from('choices').insert({
    session_id: sessionId,
    player_id: player.id,
    round_number: session.current_round,
    scenario_id: currentScenario.id,
    choice_index: choiceIndex,
    frameworks: currentScenario.choices[choiceIndex].frameworks
  })

  setSubmitting(false)

  if (error) {
    // UNIQUE constraint violation means duplicate — already submitted, keep lock
    if (error.code !== '23505') {
      // Real error — show retry
      setLockedChoiceIndex(null)
      setSubmitError(true)
    }
  }
}
```

**UNIQUE(player_id, round_number) constraint:** PostgreSQL error code `23505` is a unique violation. If the insert returns 23505, the choice was already recorded (e.g., page refresh race condition). Keep the UI locked; don't show an error.

### Content Note Gate (PLAY-09)

The `contentNote` field in scenarios.js is `null` for light rounds and a string for heavy rounds (3 and 4). Detection is simple:

```javascript
// In Play.jsx round rendering
const currentScenario = getScenarioByRound(session.current_round)
const isHeavyRound = currentScenario?.contentNote !== null
const [passedRound, setPassedRound] = useState(false)
const [contentNoteAcknowledged, setContentNoteAcknowledged] = useState(false)

// Render logic:
if (isHeavyRound && !contentNoteAcknowledged && !passedRound) {
  return <ContentNote
    note={currentScenario.contentNote}
    onContinue={() => setContentNoteAcknowledged(true)}
    onPass={() => setPassedRound(true)}
  />
}

if (passedRound) {
  return <PassedRoundView />  // "You sat this one out."
}

// else: show ScenarioCard
```

**Passer behavior:** Passing means no row inserted into `choices`. `applyChoicesToWorld` receives only submitted rows — passers never reach it. This is already baked into DATA-05 and the worldState function signature.

**State reset between rounds:** When session.current_round increments (i.e., `status` goes back to `active` with a new round number), Play.jsx must reset: `lockedChoiceIndex`, `passedRound`, `contentNoteAcknowledged`, `submitError`. Use a `useEffect` keyed on `session.current_round`.

### Vote Tally Computation (HOST-07, HOST-08)

Derived from `roundState.choices` array — no extra subscription needed:

```javascript
// In Host.jsx or VoteTally component
function computeTally(choices, scenario) {
  const counts = [0, 0, 0]
  choices.forEach(c => counts[c.choice_index]++)
  const total = choices.length
  return scenario.choices.map((choice, i) => ({
    text: choice.text,
    count: counts[i],
    pct: total > 0 ? Math.round((counts[i] / total) * 100) : 0
  }))
}

// "X of Y submitted"
const submitted = roundState.choices.length
const total = players.length  // players array already live in Host.jsx
```

**Edge case — 0 submissions:** Show "No submissions yet" in vote tally. `applyChoicesToWorld` already handles empty array — returns `{ ...currentState }` unchanged. Host can close with 0 submissions; world state stays unchanged.

### /host-setup Route (D-08)

New route: `/host-setup/:sessionId`. Sits between Landing's "Create Game" flow and the lobby. Landing.jsx currently redirects directly to `/host/:sessionId` — change redirect target to `/host-setup/:sessionId`.

Host.jsx currently is the combined lobby + (future) round view page. Phase 3 splits this:
- `/host-setup/:sessionId` — new HostSetup.jsx: room code display, round count selector, presenter checklist, "Open Lobby" button
- `/host/:sessionId` — Host.jsx: lobby (existing) + round view (Phase 3 new)

**Route addition in App.jsx:**
```jsx
<Route path="/host-setup/:sessionId" element={<HostSetup />} />
```

HostSetup.jsx "Open Lobby" button navigates to `/host/:sessionId` — Host.jsx handles the lobby as it does today.

### New Components Required

Per the UI-SPEC, 8 new component files:

| Component | File | Used In | Key Props |
|-----------|------|---------|-----------|
| ScenarioCard | src/components/ScenarioCard.jsx | Play.jsx | `scenario`, `lockedIndex`, `onChoice` |
| ContentNote | src/components/ContentNote.jsx | Play.jsx | `note`, `onContinue`, `onPass` |
| FrameworkLabel | src/components/FrameworkLabel.jsx | ConsequenceReveal | `framework` (string key), `explanation` |
| VoteTally | src/components/VoteTally.jsx | WorldStatePanel | `tally` (array), `submitted`, `total` |
| MeterBar | src/components/MeterBar.jsx | WorldStatePanel, ConsequenceReveal | `label`, `value` (0–100) |
| WorldStatePanel | src/components/WorldStatePanel.jsx | Host.jsx | `scenario`, `tally`, `worldState`, `timer`, `players`, `onClose` |
| TimerDisplay | src/components/TimerDisplay.jsx | WorldStatePanel, Play.jsx | `remaining`, `total` |
| ConsequenceReveal | src/components/ConsequenceReveal.jsx | Play.jsx | `consequence`, `frameworks`, `worldState` |
| CityPlaceholder | src/components/CityPlaceholder.jsx | Host.jsx | none |
| HostSetup | src/pages/HostSetup.jsx | App.jsx routing | new page |

Each component gets a paired `.module.css` file.

### Recommended Project Structure After Phase 3

```
src/
  components/
    PlayerRoster.jsx          (existing)
    ScenarioCard.jsx          (new)
    ContentNote.jsx           (new)
    FrameworkLabel.jsx        (new)
    VoteTally.jsx             (new)
    MeterBar.jsx              (new)
    WorldStatePanel.jsx       (new)
    TimerDisplay.jsx          (new)
    ConsequenceReveal.jsx     (new)
    CityPlaceholder.jsx       (new)
  pages/
    Landing.jsx               (existing — update redirect to /host-setup)
    HostSetup.jsx             (new)
    Host.jsx                  (extend with round view)
    Play.jsx                  (extend with scenario, choice, consequence)
  lib/
    supabase.js               (existing — no changes)
    scenarios.js              (existing — no changes)
    frameworks.js             (existing — no changes)
    detection.js              (existing — no changes)
    worldState.js             (existing — no changes)
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Double-submit prevention | Custom session token / server-side lock | UNIQUE(player_id, round_number) constraint + optimistic boolean | Constraint is already in schema; handles even page-refresh race conditions |
| World state computation | Custom weighted average | `applyChoicesToWorld()` in worldState.js | Already built and unit-tested |
| Framework detection | Custom counter | `computeProfile()` in detection.js | Already built and unit-tested |
| Animation library | Framer Motion / GSAP | CSS `transition` + `animation-delay` | Spec explicitly rejects Framer Motion for this scope; CSS handles all required effects |
| Timer | External library | `setInterval` in useEffect with cleanup | Standard React pattern; no library needed for a 1-second countdown |

**Key insight:** The data layer (worldState.js, detection.js, scenarios.js, frameworks.js) is complete and unit-tested. Phase 3 is almost entirely UI and subscription wiring — don't reimplement what's already there.

---

## Common Pitfalls

### Pitfall 1: Stale Closure in Subscription Callbacks

**What goes wrong:** Timer `setInterval` or Supabase subscription callbacks capture the initial value of `roundState` (0 choices, 60 seconds) and never see updates.

**Why it happens:** JavaScript closures. The callback function closes over the value at the time it was created. If `roundState` is a plain `useState`, the callback always sees the initial snapshot.

**How to avoid:**
- Use `useReducer` — dispatch actions, don't read state in callbacks
- Use functional updater form: `setChoices(prev => [...prev, newChoice])` — `prev` is always current
- For timer: put `timerSeconds` in the dependency array of the `setInterval` useEffect, or use a ref

**Warning signs:** Vote tally shows 0 even after players submit; timer freezes at initial value.

### Pitfall 2: Subscription Channel Name Collision

**What goes wrong:** Multiple `useEffect` subscriptions use the same channel name string. Supabase silently deduplicates channels with the same name — the second subscription never fires.

**Why it happens:** Phase 3 adds a new choices subscription to Host.jsx alongside the existing players subscription.

**How to avoid:** Use distinct, descriptive channel names:
- `players:${sessionId}` — existing
- `choices:${sessionId}` — new (choices tally for host)
- `play-players:${sessionId}` — existing in Play.jsx
- `play-session:${sessionId}` — existing in Play.jsx

**Warning signs:** One subscription works, another silently never fires.

### Pitfall 3: World State Racing

**What goes wrong:** Host writes `status: 'round_complete'` first, then writes `world_state`. Players receive the status change and render consequence view with stale (pre-round) world state. Meters show old values.

**Why it happens:** Two separate Supabase UPDATE calls create a window where status and world_state are inconsistent.

**How to avoid:** Write both in a SINGLE UPDATE call:
```javascript
await supabase.from('sessions').update({
  status: 'round_complete',
  world_state: newWorldState
}).eq('id', sessionId)
```
Players receive one event with both fields updated atomically.

**Warning signs:** Meters show 50/50/50/50 (initial values) in consequence view, then jump.

### Pitfall 4: Round State Reset on Re-render

**What goes wrong:** When `session.current_round` increments (Next Round), Play.jsx still shows the previous round's locked choice, passed state, or consequence view.

**Why it happens:** Local state (`lockedChoiceIndex`, `passedRound`, `contentNoteAcknowledged`) doesn't reset automatically when the session prop changes.

**How to avoid:** useEffect keyed on `session.current_round`:
```javascript
useEffect(() => {
  setLockedChoiceIndex(null)
  setPassedRound(false)
  setContentNoteAcknowledged(false)
  setSubmitError(false)
}, [session?.current_round])
```

**Warning signs:** Player sees their Round 1 choice still locked when Round 2 begins.

### Pitfall 5: Timer Auto-Close Double-Fire

**What goes wrong:** Timer hits 0, `closeRound()` fires. Host also clicks Close Round at the same moment. Two updates race to Supabase. Both succeed. The second update writes `round_complete` over `round_complete` — harmless but can cause unexpected re-renders.

**Why it happens:** No guard on the auto-close effect.

**How to avoid:**
```javascript
// Guard in closeRound function
async function closeRound() {
  if (roundState.roundClosed) return  // already closed
  dispatch({ type: 'ROUND_CLOSE' })   // set local flag immediately
  // ... rest of close logic
}
```
Dispatch `ROUND_CLOSE` immediately (before await) to flip the flag synchronously. Subsequent calls bail out before the Supabase write.

### Pitfall 6: Content Note State Persists Across Rounds

**What goes wrong:** Player sees Round 3's content note, clicks "Continue," plays Round 3. Round 4 starts — contentNoteAcknowledged is still `true`, so content note is skipped for Round 4.

**Why it happens:** `contentNoteAcknowledged` was set to `true` in Round 3 and never reset.

**How to avoid:** Include `contentNoteAcknowledged` in the round reset `useEffect` keyed on `session?.current_round` (see Pitfall 4).

### Pitfall 7: choices Subscription Leaks Between Rounds

**What goes wrong:** The choices subscription for Round 1 keeps firing in Round 2. Choice inserts for Round 2 are added to the Round 1 tally.

**Why it happens:** The subscription filter is `session_id=eq.${sessionId}` — it catches ALL choices for the session, not just the current round. If a player submits late in Round 1 (possible if connection was slow), the Round 2 subscription picks it up.

**How to avoid:** Two options:
1. Filter at subscription level: Supabase filter syntax doesn't support compound filters on postgres_changes reliably for non-primary-key columns — don't rely on `round_number` filter here.
2. Filter in the callback: `if (payload.new.round_number !== session.current_round) return` — check the round number before adding to state.

```javascript
(payload) => {
  if (payload.new.round_number !== session.current_round) return
  setChoices(prev =>
    prev.some(c => c.id === payload.new.id) ? prev : [...prev, payload.new]
  )
}
```
Also reset `choices` to `[]` when dispatching `ROUND_START`.

---

## Code Examples

### MeterBar Component (CSS-only, per D-16)

```jsx
// src/components/MeterBar.jsx
import styles from './MeterBar.module.css'

export default function MeterBar({ label, value }) {
  const isDanger = value < 20
  return (
    <div className={styles.meter}>
      <div className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{Math.round(value)}</span>
      </div>
      <div className={styles.track}>
        <div
          className={`${styles.fill} ${isDanger ? styles.danger : ''}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
```

```css
/* src/components/MeterBar.module.css */
.meter { display: flex; flex-direction: column; gap: 4px; }
.labelRow { display: flex; justify-content: space-between; }
.label { font-size: 14px; font-weight: 600; color: var(--text-muted); }
.value { font-size: 14px; font-weight: 600; color: var(--text-h); }
.track { width: 100%; height: 8px; background: #2e303a; border-radius: 4px; overflow: hidden; }
.fill {
  height: 100%;
  background: var(--accent);
  border-radius: 4px;
  transition: width 0.8s ease, background-color 0.6s ease;
}
.fill.danger { background: var(--danger); }
```

### TimerDisplay Component

```jsx
// src/components/TimerDisplay.jsx
import styles from './TimerDisplay.module.css'

export default function TimerDisplay({ remaining, total }) {
  const isUrgent = remaining < 10
  const pct = total > 0 ? (remaining / total) * 100 : 0

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Time remaining</span>
      <span className={`${styles.number} ${isUrgent ? styles.urgent : ''}`}>
        {remaining === 0 ? "Time's up" : remaining}
      </span>
      <div className={styles.track}>
        <div
          className={`${styles.bar} ${isUrgent ? styles.urgentBar : ''}`}
          style={{ width: `${pct}%`, transition: 'width 1s linear' }}
        />
      </div>
    </div>
  )
}
```

### FrameworkLabel (revealed after lock, after consequence)

```jsx
// src/components/FrameworkLabel.jsx
import { FRAMEWORKS } from '../lib/frameworks.js'
import styles from './FrameworkLabel.module.css'

// frameworkKey explanations for 1-sentence label
const EXPLANATIONS = {
  care: 'You prioritized the person in front of you over the abstract rule.',
  deontology: 'You held the rule even when the outcome was uncertain.',
  virtue: 'You acted from character — doing the hard right thing.',
  consequentialism: 'You chose the path most likely to produce the best outcome.'
}

export default function FrameworkLabel({ frameworkKey }) {
  const framework = FRAMEWORKS[frameworkKey]
  if (!framework) return null
  return (
    <div className={styles.badge}>
      <span className={styles.name}>{framework.name}</span>
      <span className={styles.explanation}>{EXPLANATIONS[frameworkKey]}</span>
    </div>
  )
}
```

Note: choices with 2 framework tags (e.g., `['deontology', 'virtue']`) should display both labels. Render `FrameworkLabel` once per framework in the array.

### VoteTally with 0-submission edge case

```jsx
// src/components/VoteTally.jsx
import styles from './VoteTally.module.css'

export default function VoteTally({ tally, submitted, total }) {
  if (submitted === 0) {
    return <p className={styles.empty}>No submissions yet</p>
  }

  return (
    <div className={styles.tally}>
      {tally.map((row, i) => (
        <div key={i} className={styles.row}>
          <span className={styles.choiceLabel}>
            {row.text.length > 40 ? row.text.slice(0, 40) + '…' : row.text}
          </span>
          <div className={styles.barTrack}>
            <div className={styles.barFill} style={{ width: `${row.pct}%` }} />
          </div>
          <span className={styles.pct}>{row.pct}%</span>
          <span className={styles.count}>({row.count})</span>
        </div>
      ))}
      <p className={styles.counter}>
        <span className={styles.submitted}>{submitted}</span>
        <span className={styles.total}> of {total} submitted</span>
      </p>
    </div>
  )
}
```

### ConsequenceReveal with 1s delay animation

```css
/* ConsequenceReveal.module.css */
.wrapper {
  padding: 32px 24px;
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.consequence {
  font-family: var(--serif);
  font-size: 18px;
  line-height: 1.65;
  color: var(--text-h);
  text-align: center;
  max-width: 480px;
  opacity: 0;
  transform: translateY(8px);
  animation: fadeUp 400ms ease forwards;
  animation-delay: 1000ms;
}

@keyframes fadeUp {
  to { opacity: 1; transform: translateY(0); }
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact on Phase 3 |
|--------------|------------------|-------------------|
| Supabase v1 `.from().on()` subscription API | Supabase v2 `.channel().on('postgres_changes')` | Use v2 pattern — already established in codebase |
| React Router v6 `createBrowserRouter` | BrowserRouter declarative mode (selected in Phase 2) | Add new Route for /host-setup to existing BrowserRouter |
| TypeScript React | Plain JavaScript (CLAUDE.md mandate) | No type annotations anywhere — stay consistent |

**Confirmed working in codebase:** The `sessions.status` → React state transition is already proven in Play.jsx (detects `'active'`). Phase 3 extends this with `'round_complete'` and `'finished'` — same mechanism, new cases.

---

## Open Questions

1. **Timer duration selector location**
   - What we know: D-03 says host sets 30–90 sec before starting. D-08 introduces a HostSetup page.
   - What's unclear: Should the timer duration be set on HostSetup page (alongside round count) or on the host round view before each round?
   - Recommendation: Timer duration set once on HostSetup page, stored in `sessions.timer_duration` — or more simply, stored in `totalRounds`-adjacent local state. Since the schema has no `timer_duration` column, store it in the React state of HostSetup and pass it forward via navigation state or an additional sessions column. Simplest v1 approach: add `timer_duration int DEFAULT 60` to sessions and update on HostSetup save. **Planner should decide** whether to add a schema column or keep it client-side only.

2. **Host lobby → round view transition**
   - What we know: Host.jsx currently shows the lobby. When host clicks "Start Game" it sets status → 'active'. The lobby view is still rendered.
   - What's unclear: Does Phase 3 replace the lobby view with the round view in-place (conditional render inside Host.jsx), or navigate to a new route?
   - Recommendation: Conditional render inside Host.jsx. The `session.status` field drives which view renders: `lobby` → lobby view, `active` / `round_complete` → round view. Avoids URL complexity and keeps all host state in one component. `started` state in current Host.jsx already tracks this — extend it to `session.status` directly.

3. **Schema column for timer_duration**
   - What we know: No `timer_duration` column exists in the current schema.
   - Recommendation: Either (a) add via a new Supabase migration `ALTER TABLE sessions ADD COLUMN timer_duration int DEFAULT 60`, or (b) hardcode 60 seconds in v1 with a constant. Given presentation flexibility matters (D-03), option (a) is worth the 1-line migration.

---

## Environment Availability

All Phase 3 dependencies are JavaScript/CSS. No external tools, CLIs, or services beyond what's already running.

| Dependency | Required By | Available | Notes |
|------------|------------|-----------|-------|
| Node.js 20.x | Vite dev server | v20.19.4 | Confirmed |
| npm 10.x | Package management | 10.8.2 | Confirmed |
| @supabase/supabase-js | Real-time subscriptions | Installed (Phase 1) | No version check needed |
| react-router-dom | New /host-setup route | Installed v7 (Phase 2) | Add one Route |
| CSS Modules (Vite) | All new component styles | Built into Vite | No install needed |

No missing dependencies. No blockers.

---

## Sources

### Primary (HIGH confidence)

- Existing codebase — `src/pages/Host.jsx`, `src/pages/Play.jsx`, `src/lib/*.js`, `src/index.css` — directly read and analyzed
- `supabase/migrations/20260325000000_initial_schema.sql` — schema including UNIQUE constraint on choices
- `src/lib/worldState.js` — `applyChoicesToWorld()` function signature and behavior confirmed
- `src/lib/detection.js` — `computeProfile()`, `findConflicts()` confirmed ready
- `src/lib/scenarios.js` — `contentNote` field confirmed on rounds 3 and 4, `choices: []` on round 6
- CLAUDE.md project spec — stack constraints, scenario library, component specs
- CONTEXT.md — all decisions D-01 through D-25 locked by Jay

### Secondary (MEDIUM confidence)

- Supabase v2 postgres_changes filter syntax — established pattern, well-documented, matches existing codebase usage
- React useReducer for coordinated state — standard React pattern, directly applicable to timer+choices+roundClosed atomicity
- CSS animation-delay for consequence reveal — standard CSS spec, confirmed working in all browsers

### Tertiary (LOW confidence)

- Supabase compound filter reliability for postgres_changes (round_number filter) — documented but behavior at edge cases (late submissions) is not verified. Recommendation uses client-side filtering as the safe approach.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all dependencies confirmed installed
- Architecture patterns: HIGH — established in codebase, extended not replaced
- Component specifications: HIGH — derived from UI-SPEC and CONTEXT.md decisions
- Pitfalls: HIGH — derived from direct code analysis of existing patterns
- Open questions: identified 3 genuinely ambiguous points; recommendations provided

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable React + Supabase v2 APIs)
