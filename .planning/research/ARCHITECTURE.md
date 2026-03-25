# Architecture Patterns

**Domain:** Real-time multiplayer ethics game (React + Supabase)
**Project:** The Crossroads
**Researched:** 2026-03-25
**Confidence:** HIGH — architecture derived from official Supabase real-time docs, established React patterns, and the detailed spec in CLAUDE.md

---

## Recommended Architecture

The system has two distinct client roles — Host and Player — sharing a single Supabase backend. Neither client has privileged database access beyond their role. State lives in Supabase; both clients subscribe to changes they care about and render reactively.

```
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE BACKEND                        │
│                                                              │
│  sessions table    players table    choices table            │
│  (game clock)      (identities)     (vote log)               │
│                                                              │
│  real-time subscriptions broadcast row changes to clients    │
└──────────────────┬──────────────────┬───────────────────────┘
                   │                  │
         ┌─────────▼──────┐  ┌────────▼────────┐
         │  HOST CLIENT   │  │  PLAYER CLIENT  │
         │  (laptop/proj) │  │  (phone)        │
         │                │  │                 │
         │ Writes:         │  │ Writes:          │
         │  session.status│  │  players row     │
         │  session.round │  │  choices row     │
         │  world_state   │  │                 │
         │                │  │ Reads:           │
         │ Reads:          │  │  session state  │
         │  all choices   │  │  own consequence │
         │  all players   │  │  world_state     │
         └────────────────┘  └─────────────────┘
```

The Host is the game clock. Only the Host writes to `sessions`. Players are pure responders — they submit choices and react to session state changes. This one-directional write authority eliminates race conditions in round progression.

---

## Session State Machine

The `sessions.status` column is the single source of truth for where in the game everyone is. Every UI transition on both Host and Player is driven by this field.

```
                    ┌─────────┐
                    │  lobby  │ ← Host creates session, players join
                    └────┬────┘
                         │ Host clicks "Start"
                         │ writes: status='active', current_round=1
                         ▼
                    ┌─────────┐
                    │ active  │ ← Players see scenario, make choices
                    └────┬────┘
                         │ Host clicks "Close Round"
                         │ writes: status='round_complete',
                         │         world_state=<updated>
                         ▼
               ┌──────────────────┐
               │  round_complete  │ ← Players see consequence + meters
               └────────┬─────────┘
                        │
              ┌─────────┴──────────┐
              │                    │
              │ More rounds left   │ No more rounds
              │ Host clicks Next   │ Host clicks End
              ▼                    ▼
         ┌─────────┐          ┌──────────┐
         │ active  │          │ finished │ ← Profile computed, shown
         │ (n+1)   │          └──────────┘
         └─────────┘
```

### State Transition Ownership

| Transition | Who Writes | What Changes |
|------------|-----------|--------------|
| lobby → active | Host | `status='active'`, `current_round=1` |
| active → round_complete | Host | `status='round_complete'`, `world_state=<new>` |
| round_complete → active | Host | `status='active'`, `current_round=n+1` |
| round_complete → finished | Host | `status='finished'` |

The Host never needs to poll. The Host triggers transitions manually via button clicks. Players never trigger session state changes — they only INSERT into `choices`.

---

## Component Boundaries

### What Talks to What

```
App.jsx
├── Landing.jsx          -- creates or joins session, no subscriptions
├── Host.jsx             -- owns all host subscriptions, passes props down
│   ├── PlayerRoster.jsx -- pure display: receives players[] prop
│   ├── VoteTally.jsx    -- pure display: receives choices[] + scenario prop
│   ├── WorldStatePanel.jsx -- pure display: receives worldState prop
│   └── CityScene.jsx    -- (v2) pure display: receives worldState prop
└── Play.jsx             -- owns player subscription, passes props down
    ├── ScenarioCard.jsx -- pure display + user action: receives scenario, onChoice
    ├── ConsequenceReveal.jsx -- pure display: receives choice + consequence text
    ├── MeterBar.jsx     -- pure display: receives type + value
    └── FrameworkProfile.jsx  -- pure display: receives profile object
```

### Component Responsibilities

| Component | Responsibility | Supabase Access | Emits |
|-----------|---------------|-----------------|-------|
| Landing.jsx | Create/join session | INSERT sessions, INSERT players | Redirects to /host or /play |
| Host.jsx | Game clock, subscriptions | SUBSCRIBE choices, SUBSCRIBE players, UPDATE sessions | Calls lib/ functions |
| Play.jsx | Player experience, subscription | SUBSCRIBE sessions, INSERT choices | None (self-contained) |
| ScenarioCard.jsx | Show scenario, lock choice | None | onChoice(choiceIndex) |
| ConsequenceReveal.jsx | Show private outcome | None | None |
| VoteTally.jsx | Live % bars | None | None |
| WorldStatePanel.jsx | 4 meters + scenario info | None | None |
| PlayerRoster.jsx | Live player list | None | None |
| FrameworkProfile.jsx | End screen profile | None | None |
| MeterBar.jsx | Animated meter variant | None | None |
| CityScene.jsx (v2) | Three.js city | None | None |

**Design rule:** Only Host.jsx and Play.jsx have Supabase subscriptions. All child components are pure — they receive props and render. This makes each component independently testable and avoids subscription sprawl.

---

## Data Flow

### Inbound Flow (Supabase → UI)

```
Supabase INSERT/UPDATE
        │
        ▼
  Host.jsx or Play.jsx
  (subscription handler)
        │
   setState(...)
        │
        ▼
  React re-render
        │
   Props passed down
        │
        ▼
  Child components render
```

### Outbound Flow (User Action → Supabase)

```
Player taps choice
        │
  ScenarioCard.jsx calls onChoice(index)
        │
  Play.jsx calls supabase INSERT into choices
        │
  Play.jsx updates local UI optimistically
  (lock the choice button immediately, don't wait)
        │
  Supabase broadcasts INSERT to Host.jsx subscription
        │
  Host.jsx vote tally updates live
```

### World State Update Flow

```
Host clicks "Close Round"
        │
  Host.jsx calls applyChoicesToWorld(choices, scenario, worldState)
        │                          (from worldState.js — pure function)
  Returns newWorldState
        │
  Host.jsx calls computeAndStoreProfiles() if last round
        │
  Host.jsx calls supabase UPDATE sessions SET
    status='round_complete',
    world_state=newWorldState
        │
  Play.jsx subscription fires on UPDATE
        │
  Play.jsx shows consequence + updates meter bars
```

The world state computation happens client-side in Host.jsx before writing to Supabase. This is correct: the Host is authoritative, the computation is deterministic, and there is no need for a server function.

---

## Supabase Channel Strategy

Use the minimum number of channels required. More channels = more WebSocket connections = more failure points.

### Recommended: 2 channels per client

**Host.jsx — 2 channels:**

```javascript
// Channel 1: Watch incoming choices for this session
supabase.channel(`choices:${sessionId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'choices',
    filter: `session_id=eq.${sessionId}`
  }, handler)
  .subscribe()

// Channel 2: Watch players joining (roster + submitted count)
supabase.channel(`players:${sessionId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'players',
    filter: `session_id=eq.${sessionId}`
  }, handler)
  .subscribe()
```

Host does NOT need to subscribe to `sessions` — it is the writer, not the reader.

**Play.jsx — 1 channel:**

```javascript
// Single channel: watch session state changes
supabase.channel(`session:${sessionId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'sessions',
    filter: `id=eq.${sessionId}`
  }, (payload) => {
    setSessionState(payload.new)
  })
  .subscribe()
```

Players do NOT subscribe to choices or other players. They only need to know when session state changes (status, current_round, world_state).

### Why Not More Channels

With 25 players each holding 1 channel, that is 25 WebSocket connections to Supabase. Well within the free tier limit (200 concurrent). Adding per-player channels for choices or players would multiply this without benefit. Filter on `session_id` is sufficient to scope each subscription.

### Channel Cleanup

Always clean up on component unmount. Memory leak and orphaned subscriptions are the most common Supabase real-time mistake.

```javascript
useEffect(() => {
  const channel = supabase.channel(...)
  // ... setup ...
  return () => supabase.removeChannel(channel)
}, [sessionId])
```

---

## localStorage Strategy

Player identity must persist across page refreshes (phone sleep, accidental navigation) without login.

### What to Store

```javascript
// On successful player creation in Landing.jsx
localStorage.setItem('crossroads_player_id', player.id)
localStorage.setItem('crossroads_session_id', session.id)
localStorage.setItem('crossroads_room_code', roomCode)
localStorage.setItem('crossroads_player_name', name)
```

### Recovery Pattern in Play.jsx

```javascript
// On mount, check localStorage before asking to join
const savedPlayerId = localStorage.getItem('crossroads_player_id')
const savedSessionId = localStorage.getItem('crossroads_session_id')

if (savedPlayerId && savedSessionId) {
  // Verify the session is still active (not 'finished')
  // If valid: restore state, re-attach subscription
  // If session 'finished': clear localStorage, show "Session ended"
  // If player not found (host cleared data): clear localStorage, redirect to /
}
```

### What NOT to Store

Do not store choice history, world state, or framework counts in localStorage. These live in Supabase. localStorage is identity only — a key to look up server state.

### Host Identity

The Host has no localStorage entry. The Host is identified by URL parameter or session data. If the Host refreshes, Host.jsx re-fetches session state and re-attaches subscriptions. Host state loss is recoverable because Supabase holds truth.

---

## lib/ Layer Architecture

The lib/ functions are pure — no side effects, no Supabase calls. They transform data. This makes them independently testable before any UI is wired.

```
lib/
  supabase.js      -- client init + typed query helpers (ONLY file with Supabase import)
  scenarios.js     -- static data: scenario objects with framework tags + world impacts
  frameworks.js    -- static data: framework definitions + conflict pair map
  detection.js     -- pure functions: computeProfile(), findConflicts()
  worldState.js    -- pure functions: applyChoicesToWorld(), thresholdCheck()
```

### Dependency Rule

```
components → lib/ functions (OK)
lib/ functions → each other (OK: detection.js imports from frameworks.js)
lib/ functions → Supabase (ONLY supabase.js)
components → supabase.js directly (AVOID — prefer helpers in supabase.js)
```

This means if Supabase changes its API or you want to mock it in tests, you change one file.

---

## Patterns to Follow

### Pattern 1: Optimistic UI Lock on Choice Submission

**What:** Lock the choice button immediately on tap, before the Supabase INSERT resolves.
**When:** Any time user action triggers a database write.

```javascript
// In Play.jsx
const [submittedChoice, setSubmittedChoice] = useState(null)

async function handleChoice(choiceIndex) {
  setSubmittedChoice(choiceIndex)  // immediate lock — user sees response
  await supabase.from('choices').insert({
    session_id: sessionId,
    player_id: playerId,
    round_number: sessionState.current_round,
    scenario_id: currentScenario.id,
    choice_index: choiceIndex,
    frameworks: currentScenario.choices[choiceIndex].frameworks
  })
  // If insert fails, you could revert — but for this app, treat as fire-and-forget
}
```

### Pattern 2: Derive Don't Duplicate

**What:** Compute derived state from Supabase data in-component, don't store duplicates.
**When:** Any time you are tempted to mirror Supabase state into a second useState.

```javascript
// In Host.jsx — don't store "submittedCount" separately
// Derive it from the choices array you already have
const submittedCount = choices.filter(
  c => c.round_number === sessionState.current_round
).length
const playersStillDeciding = players.length - submittedCount
```

### Pattern 3: Status-Driven Render Switch

**What:** Use sessionState.status as the primary branch in Play.jsx and Host.jsx.
**When:** Always — it is the state machine.

```javascript
// In Play.jsx
function renderContent() {
  switch (sessionState.status) {
    case 'lobby':     return <WaitingLobby players={players} />
    case 'active':    return <RoundView ... />
    case 'round_complete': return <ConsequenceReveal ... />
    case 'finished':  return <FrameworkProfile profile={profile} />
    default:          return <LoadingScreen />
  }
}
```

### Pattern 4: Compute Profiles on Finished Transition

**What:** When Host writes `status='finished'`, also write `dominant_framework` and `conflicts` to each player row.
**When:** End of last round only — not incrementally.

```javascript
// In Host.jsx, handleEndSession()
const updates = players.map(player => ({
  id: player.id,
  ...computeProfile(player.choice_history)
}))
await Promise.all(updates.map(u =>
  supabase.from('players').update({
    dominant_framework: u.dominant,
    conflicts: u.conflicts,
    framework_counts: u.counts
  }).eq('id', u.id)
))
await supabase.from('sessions').update({ status: 'finished' }).eq('id', sessionId)
```

Write player profiles before flipping status to 'finished'. Players subscribing to session status will then fetch their own profile row on 'finished' event.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Subscribing to Everything in Every Component

**What:** Putting Supabase subscriptions inside PlayerRoster, VoteTally, MeterBar, etc.
**Why bad:** 10 components × 25 players = 250+ subscriptions. Supabase free tier limit is 200 concurrent connections. Presentation fails in the middle of class.
**Instead:** Subscriptions only in Host.jsx and Play.jsx. Pass data down as props.

### Anti-Pattern 2: Polling Instead of Subscribing

**What:** Using setInterval + supabase.from('choices').select() to check for new votes.
**Why bad:** Polling introduces latency and hammers the database. With 25 players each polling every second, that is 25 req/sec on a free-tier project.
**Instead:** Supabase real-time subscriptions push changes instantly without polling.

### Anti-Pattern 3: Storing Game State in React State Alone

**What:** Keeping world_state or choice_history only in React useState, not writing to Supabase.
**Why bad:** Host refreshes mid-presentation = all state lost. Presentation fails.
**Instead:** Every meaningful state change writes to Supabase immediately. React state is a cache of Supabase truth, not the source.

### Anti-Pattern 4: Revealing Framework Before Choice

**What:** Including framework labels in the rendered ScenarioCard choice buttons.
**Why bad:** Turns the game into a philosophy quiz. Players optimize for appearing smart rather than responding authentically. Destroys the pedagogical value.
**Instead:** Framework label rendered only in post-choice state (after submittedChoice is set).

### Anti-Pattern 5: Computing Profiles Incrementally Each Round

**What:** Running computeProfile() and writing results after every round.
**Why bad:** Profile meaning comes from the complete pattern across all rounds. Partial profiles written mid-game and then overwritten creates confusion and extra writes.
**Instead:** Compute and write profiles exactly once, when status transitions to 'finished'.

### Anti-Pattern 6: Using Supabase Broadcast Instead of Postgres Changes

**What:** Using Supabase Broadcast (ephemeral pub/sub) rather than Postgres Changes for game state.
**Why bad:** Broadcast is ephemeral — if a player's phone sleeps and reconnects, they miss events. Postgres Changes are durable: reconnecting clients can refetch current state.
**Instead:** Use `postgres_changes` for all game state. On reconnect, Play.jsx fetches current session row and player row to restore state, then re-attaches subscription.

---

## Scalability Considerations

This is a 10–25 player game for a single 15-minute session. Scalability concerns are primarily about reliability under that load, not internet scale.

| Concern | At 10 players | At 25 players | Notes |
|---------|--------------|--------------|-------|
| Supabase connections | 10 (comfortable) | 25 (comfortable) | Free tier: 200 concurrent |
| Real-time latency | <100ms | <200ms | Supabase real-time SLA |
| Postgres writes/sec | ~3 (choices) | ~8 (choices) | Free tier: no documented limit for this load |
| Page load time | Fast | Fast | Vite bundle, no large assets in v1 |

The main reliability risk is not load — it is network variability on student phones. The optimistic lock pattern handles this: the player sees immediate feedback even if the Supabase write takes 500ms on a slow connection.

---

## Build Order

What must exist before what. Each phase has a hard dependency on the phase before it.

### Phase 1 — Supabase Foundation (dependency for everything)
- Create project, run schema SQL
- Enable real-time on `sessions`, `players`, `choices`
- Configure RLS: anon can INSERT players + choices scoped to their session; anon can SELECT sessions by id; no DELETE
- Verify subscriptions fire in Supabase dashboard before touching React
- Note: RLS misconfiguration is the #1 cause of silent failures in Supabase real-time apps

### Phase 2 — lib/ Data Layer (dependency for all UI)
- `supabase.js`: client init + helper functions (createSession, joinSession, submitChoice, updateSessionStatus)
- `scenarios.js`: full scenario library — this is static, write it once
- `frameworks.js`: framework definitions + conflict pair map
- `detection.js`: computeProfile(), findConflicts() — unit test these in isolation
- `worldState.js`: applyChoicesToWorld(), thresholdCheck() — unit test these in isolation

**Gate:** detection.js and worldState.js must produce correct output before Phase 3. They are the brain; everything downstream depends on them.

### Phase 3 — Landing Page (dependency for testing Phases 4+)
- Create session flow: generate room code, insert session row, redirect to /host
- Join session flow: enter code + name, insert player row, redirect to /play
- localStorage writes on both flows
- localStorage recovery check on Play.jsx mount

**Gate:** You need real session IDs and player IDs to test Phase 4 and 5.

### Phase 4 — Host Dashboard (no Three.js)
- Lobby: PlayerRoster with live Supabase subscription, round count selector, Start button
- Round: VoteTally with live choices subscription, WorldStatePanel with CSS bars, timer display, Close Round button, Next Round button
- Round close logic: call applyChoicesToWorld(), write new world_state + status to Supabase
- End: group framework breakdown, anonymous reflection feed, End Session button

### Phase 5 — Player View
- Session subscription: react to status changes via switch pattern
- Scenario render from scenarios.js by current_round index
- Choice submission with optimistic lock
- Post-choice framework label reveal
- Consequence reveal on round_complete
- CSS meter bars (static values, no animation in v1)
- FrameworkProfile on finished

### Phase 6 — Three.js City (v2, after classroom test)
- Only add if v1 is confirmed working
- Static scene first; wire worldState props second
- Each visualization independently testable

### Phase 7 — Polish (v2)
- Animated SVG meter bars on phones
- Timer pressure animation
- Mobile layout audit
- QR code generator for room code
- Load test: 25 concurrent subscriptions

---

## Critical Dependency Graph

```
Supabase schema
      │
      ▼
lib/supabase.js
      │
      ├──────────────────────┐
      ▼                      ▼
lib/scenarios.js        lib/frameworks.js
lib/worldState.js            │
      │                      ▼
      │               lib/detection.js
      │
      ▼
Landing.jsx (creates real session + player IDs)
      │
      ├─────────────────────┐
      ▼                     ▼
Host.jsx               Play.jsx
(Phases 4)            (Phase 5)
```

Nothing in Phase 4 or 5 can be tested with real data until Phase 3 exists. Detection and world state logic can be tested before Phase 3 using mock data.

---

## Sources

- CLAUDE.md: Full architecture spec, Supabase schema, component structure, build order (HIGH confidence — authoritative project spec)
- Supabase Realtime documentation: `postgres_changes` event model, channel lifecycle, RLS behavior with subscriptions (HIGH confidence — official docs)
- React patterns: useState + useEffect subscription lifecycle, prop drilling vs. context tradeoffs for this scale (HIGH confidence — well-established)
- Supabase free tier limits: 200 concurrent realtime connections (MEDIUM confidence — verify current limits at supabase.com/pricing before launch)
