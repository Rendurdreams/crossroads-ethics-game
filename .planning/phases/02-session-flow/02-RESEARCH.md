# Phase 2: Session Flow - Research

**Researched:** 2026-03-25
**Domain:** React routing, Supabase real-time inserts, localStorage identity persistence, phone-first UI
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CLAUDE.md + Phase 1 decisions)

### Locked Decisions
- React + Vite + Supabase — tech stack decided, not up for debate
- No TypeScript — plain JavaScript only
- No Three.js on player phones — CSS only for meters
- No auth — localStorage only; sessions are ephemeral
- Must work reliably with 10–25 simultaneous Supabase subscriptions
- Open RLS policies for classroom deployment (anon key covers all operations)
- react-router-dom v7.13.2 is installed (npm resolved it — v6 was spec'd but v7 is what's on disk)
- Supabase client singleton is `import { supabase } from '../lib/supabase.js'`
- `generateRoomCode()` utility exists in `src/lib/roomCode.js`

### Claude's Discretion
- Routing API choice within React Router v7 (declarative BrowserRouter vs createBrowserRouter data mode)
- Emoji avatar assignment strategy (static pool, random selection at join time)
- CSS aesthetic decisions — CLAUDE.md specifies "stark editorial, dark backgrounds, warm amber/gold, serif scenario text, sans-serif UI chrome"
- Whether to use React Context or prop-drilling for session/player state within the 3-page app

### Deferred Ideas (OUT OF SCOPE)
- Three.js 3D city (Phase 6 / v2)
- Animated SVG meters (v2)
- QR code for room code (Phase 8 / v2)
- Timer (v2 convenience feature)
- Round gameplay (Phase 3)
- Framework profiles / end screen (Phase 4)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HOST-01 | Host can create a new session and receive a 4-digit room code | `generateRoomCode()` exists; insert into sessions table via Supabase |
| HOST-02 | Host can select round count (3, 4, 5, or 6) before starting | Local state in Host.jsx; written to sessions.total_rounds on start |
| HOST-03 | Host can start the game when 2+ players have joined | Count players subscribed via real-time; button enabled at threshold |
| HOST-04 | Host sees live roster of joined players (name + emoji) in lobby | Subscribe to players table INSERT for session_id; display PlayerRoster |
| HOST-10 | Room code displayed large enough to read from back of classroom | Pure CSS — 96–120px font, centered, high-contrast amber on dark bg |
| PLAY-01 | Player joins by entering name + 4-digit room code (no login) | Query sessions by room_code; insert player row; store ids in localStorage |
| PLAY-02 | Player is assigned an emoji avatar on join | Pick random emoji from AVATARS pool at join time; stored in players.avatar |
| PLAY-03 | Player identity (player_id, session_id) persists across page refresh | Read localStorage on mount; skip join form if both values present and session still active |
</phase_requirements>

---

## Summary

Phase 2 builds the lobby: two pages (Landing and Host) plus the real-time connection that makes the host roster update live as players join. The data layer (Supabase schema, real-time config, RLS) is fully working from Phase 1 — this phase is entirely UI and real-time subscription wiring.

The most important architectural decision this phase introduces is routing. React Router v7.13.2 is installed; the correct approach for this 3-page SPA is the **declarative mode** (`BrowserRouter` + `Routes` + `Route`) — same API as v6 for this use case. No loaders, no actions, no framework mode needed. This avoids all the SSR/Remix conceptual overhead that CLAUDE.md warned about.

The second important pattern is the **fetch-then-subscribe** rule from SKILL-supabase.md: when a component mounts, always fetch current state immediately before setting up the real-time subscription, because subscriptions only deliver changes that happen after they connect. The Host lobby must fetch the current player list on mount, then subscribe to new JOIN inserts. Without the initial fetch, players who joined before the host page loaded would be invisible.

**Primary recommendation:** Use `BrowserRouter` + `Routes` declarative mode for routing. Wire the Host roster with an initial fetch + players INSERT subscription. Store `player_id` and `session_id` in localStorage on join; read them back on Play.jsx mount to restore sessions silently.

---

## Standard Stack

### Core (all already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-router-dom | 7.13.2 | Client-side routing: Landing → Host, Landing → Play | Already installed; declarative mode is stable and API-identical to v6 for this use case |
| @supabase/supabase-js | 2.100.0 | DB queries, real-time subscriptions | Already installed; v2 channel API is the correct pattern per SKILL-supabase.md |
| react | 19.2.4 | Component state, hooks, rendering | Already installed |

### No New Dependencies Needed

This phase requires zero new npm installs. All required libraries are in `package.json` already.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `BrowserRouter` declarative | `createBrowserRouter` data mode | Data mode adds route-level loaders — adds complexity for no gain; this app fetches in `useEffect`, not loaders |
| `BrowserRouter` declarative | React Router framework mode | Framework mode is the full Remix model (SSR, file-based routes, build plugin) — overkill and explicitly warned against in CLAUDE.md |
| Random emoji from JS pool | Emoji picker UI | Picker adds interaction friction; random assignment is faster, fun, and already implied by CLAUDE.md spec |

---

## Architecture Patterns

### Routing Setup (React Router v7 Declarative Mode)

React Router v7 supports the same declarative API as v6 when using `BrowserRouter`. No configuration file needed, no build plugin, no SSR considerations. Import from `"react-router-dom"`.

```javascript
// src/App.jsx — SOURCE: React Router v7 docs, modes page
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Host from './pages/Host.jsx'
import Play from './pages/Play.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/host/:sessionId" element={<Host />} />
        <Route path="/play/:sessionId" element={<Play />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

Session and player IDs go in the URL path so browser refresh doesn't lose context (in addition to localStorage). `useParams()` extracts them.

### Netlify SPA Redirect

Without this file, direct URL access (e.g. typing `/host/abc` or refreshing) returns a 404 from Netlify's CDN because there is no actual `/host/abc/index.html`.

```
// public/_redirects  (verbatim, no code block needed — it's one line)
/* /index.html 200
```

This must be in `public/` so Vite copies it to `dist/` on build.

### Page Structure

```
src/
├── pages/
│   ├── Landing.jsx      -- Create session OR join by code
│   ├── Host.jsx         -- Lobby view: room code display + roster + round selector + start
│   └── Play.jsx         -- Player lobby: waiting screen + live player count
├── components/
│   └── PlayerRoster.jsx -- Reusable: list of {name, avatar} pairs
├── lib/                 -- Already built in Phase 1
│   ├── supabase.js
│   ├── roomCode.js
│   └── (scenarios, frameworks, detection, worldState)
```

### Pattern 1: Create Session (Host flow)

```javascript
// Landing.jsx — host side
// SOURCE: SKILL-supabase.md "Insert a Row" + "Room Code Generation"
import { supabase } from '../lib/supabase.js'
import { generateRoomCode } from '../lib/roomCode.js'
import { useNavigate } from 'react-router-dom'

async function createSession(navigate) {
  const code = generateRoomCode()
  const { data, error } = await supabase
    .from('sessions')
    .insert({ room_code: code, total_rounds: 4 })
    .select()
    .single()

  if (error) {
    // room_code has UNIQUE constraint — collision possible (1/9000 odds)
    // retry once before surfacing error to user
    return createSession(navigate)
  }

  navigate(`/host/${data.id}`)
}
```

**Collision handling:** The `room_code` column has a UNIQUE constraint. On collision (1-in-9000 odds per active session), the insert will fail with a unique-violation error. Retry once automatically; if it fails twice, surface an error. For a classroom with ≤25 simultaneous sessions this is essentially impossible to hit in practice.

### Pattern 2: Join Session (Player flow)

```javascript
// Landing.jsx — player side
// SOURCE: SKILL-supabase.md "Read a Row" + "Insert a Row" + "LocalStorage Pattern"
import { supabase } from '../lib/supabase.js'
import { useNavigate } from 'react-router-dom'

const AVATARS = ['🦊', '🐻', '🐼', '🦁', '🐯', '🦄', '🐸', '🐙',
                 '🦋', '🦀', '🐬', '🦉', '🐺', '🦝', '🦔', '🐧']

async function joinSession(code, name, navigate) {
  // 1. Find session by room code
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('id, status')
    .eq('room_code', code.trim())
    .maybeSingle()  // not .single() — returns null if not found, not an error

  if (!session) {
    return { error: 'Room not found. Check the code and try again.' }
  }
  if (session.status !== 'lobby') {
    return { error: 'This game has already started.' }
  }

  // 2. Insert player
  const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)]
  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({ session_id: session.id, name: name.trim(), avatar })
    .select()
    .single()

  if (playerError) throw playerError

  // 3. Persist identity
  localStorage.setItem('player_id', player.id)
  localStorage.setItem('session_id', session.id)

  navigate(`/play/${session.id}`)
}
```

### Pattern 3: Session Restore (PLAY-03)

```javascript
// Play.jsx — on mount
// SOURCE: SKILL-supabase.md "LocalStorage Pattern"
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function Play() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [player, setPlayer] = useState(null)

  useEffect(() => {
    const storedPlayerId = localStorage.getItem('player_id')
    const storedSessionId = localStorage.getItem('session_id')

    if (storedPlayerId && storedSessionId === sessionId) {
      // Restore from localStorage — fetch player row to confirm still valid
      supabase
        .from('players')
        .select('*')
        .eq('id', storedPlayerId)
        .single()
        .then(({ data }) => {
          if (data) setPlayer(data)
          else navigate('/')  // stale localStorage — back to landing
        })
    } else {
      // No stored identity for this session — redirect to landing
      navigate('/')
    }
  }, [sessionId])
  // ...
}
```

### Pattern 4: Host Roster (fetch-then-subscribe)

```javascript
// Host.jsx — CRITICAL: always fetch first, then subscribe
// SOURCE: SKILL-supabase.md "Real-Time Subscription Pattern"
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

function Host() {
  const { sessionId } = useParams()
  const [players, setPlayers] = useState([])

  useEffect(() => {
    // Step 1: Fetch players who already joined (before subscription starts)
    supabase
      .from('players')
      .select('*')
      .eq('session_id', sessionId)
      .then(({ data }) => setPlayers(data ?? []))

    // Step 2: Subscribe to new joins
    const channel = supabase
      .channel(`players:${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'players',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        setPlayers(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [sessionId])

  // players.length >= 2 enables the Start button
}
```

### Pattern 5: Start Game (status transition)

```javascript
// Host.jsx — advance session from lobby to active
async function startGame(sessionId, totalRounds) {
  await supabase
    .from('sessions')
    .update({ status: 'active', total_rounds: totalRounds, current_round: 1 })
    .eq('id', sessionId)
}
```

Play.jsx must subscribe to session UPDATE events to detect when status changes from 'lobby' to 'active' and transition the player view. This subscription is needed in Phase 2 for the "game started" signal even though the round view itself is Phase 3.

### Pattern 6: Round Count Selector

Local state only — no Supabase write until Start is pressed:

```javascript
const [totalRounds, setTotalRounds] = useState(4)
// Buttons for 3, 4, 5, 6 — update local state
// Written to DB in startGame() call
```

### Anti-Patterns to Avoid

- **Subscribe without initial fetch:** The real-time subscription only fires for events after it connects. Players who joined before the host page loaded will be invisible if you skip the initial fetch.
- **`.single()` when row might not exist:** Use `.maybeSingle()` when querying by room_code from user input. `.single()` throws on zero results.
- **Storing session_id only in URL:** URL alone is fine for navigation, but localStorage is required for PLAY-03 (refresh persistence) — store both `player_id` and `session_id`.
- **Redirecting immediately on localStorage miss:** Check that the stored `session_id` matches the URL param before redirecting. A player might have stale localStorage from a previous session.
- **Mutating players array directly in subscription handler:** Always use functional state update (`setPlayers(prev => [...prev, payload.new])`) — closures in subscription callbacks capture stale state.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Client-side routing | Custom history/URL management | React Router v7 declarative | Hash routing, history management, navigation guards are subtle; Router handles all of it |
| Real-time player list | Polling with setInterval | Supabase postgres_changes subscription | Polling adds DB load, introduces latency jitter, is less reliable; subscriptions are instant |
| Room code uniqueness | Custom collision detection loop | Supabase UNIQUE constraint + error handling | DB enforces uniqueness atomically; client retry-on-error is 5 lines |
| Emoji pool | Custom avatar generation logic | Hardcoded AVATARS array, random index | No need for an algorithm — 16 emoji pool with `Math.random()` is sufficient |

---

## Common Pitfalls

### Pitfall 1: Subscription Fires Before Initial Fetch Completes
**What goes wrong:** Race condition — initial fetch is async; a player joins before it resolves, triggering a subscription event. The subscription handler appends the player; then the fetch resolves and overwrites `players` state, losing the subscription-delivered player.
**Why it happens:** Both operations are async and can complete in any order.
**How to avoid:** Set state from fetch result FIRST, then deduplicate in the subscription handler using player ID: `setPlayers(prev => prev.some(p => p.id === payload.new.id) ? prev : [...prev, payload.new])`.
**Warning signs:** Occasional duplicate or missing players in roster during rapid joins.

### Pitfall 2: Stale Closure in Subscription Callback
**What goes wrong:** The subscription callback captures `players` from its creation scope. Subsequent state updates are invisible to it. Each callback appends to the stale empty array.
**Why it happens:** JavaScript closures capture the binding at the time the function was created.
**How to avoid:** Always use the functional form: `setPlayers(prev => [...prev, payload.new])`. Never reference `players` directly inside a subscription callback.

### Pitfall 3: `.single()` on User-Provided Room Code
**What goes wrong:** User enters a nonexistent room code; `.single()` throws because zero rows matched; the error surfaces as an unhandled rejection rather than a user-facing "room not found" message.
**Why it happens:** `.single()` is strict — it expects exactly one row.
**How to avoid:** Use `.maybeSingle()` and check `if (!data)` to show user-friendly error.

### Pitfall 4: Supabase Free Tier Pause
**What goes wrong:** Supabase free tier projects pause after 1 week of inactivity. The day of the presentation, the first request hangs for 5–10 seconds while the project wakes.
**Why it happens:** Supabase resource management on free tier.
**How to avoid:** Do a test query the day before the presentation to wake the project. Document this in user setup notes.

### Pitfall 5: BrowserRouter Refresh 404
**What goes wrong:** Player navigates to `/play/abc123` then refreshes. The CDN (Netlify/Vercel) tries to serve a file at that path, fails with 404.
**Why it happens:** SPAs have one HTML file — `index.html`. Path-based URLs need a catch-all redirect.
**How to avoid:** Add `public/_redirects` containing `/* /index.html 200`. This is required before any production testing with direct URLs.

### Pitfall 6: react-router-dom Import Path
**What goes wrong:** Importing from `"react-router"` instead of `"react-router-dom"` may resolve differently.
**Why it happens:** React Router v7 ships both `react-router` (core) and `react-router-dom` (DOM bindings). `BrowserRouter` lives in `react-router-dom`.
**How to avoid:** Always import browser components (`BrowserRouter`, `Link`, `useNavigate`, `useParams`) from `"react-router-dom"`.

---

## Code Examples

### Supabase Query: Find Session by Room Code
```javascript
// SOURCE: SKILL-supabase.md "Read a Row" + maybeSingle gotcha
const { data: session } = await supabase
  .from('sessions')
  .select('id, status, total_rounds')
  .eq('room_code', code.trim().toUpperCase())
  .maybeSingle()
```

### Insert Player and Get Back ID
```javascript
// SOURCE: SKILL-supabase.md "Insert a Row"
const { data: player, error } = await supabase
  .from('players')
  .insert({ session_id, name, avatar })
  .select()
  .single()  // .single() is correct here — we just inserted one row
// player.id is the UUID to store in localStorage
```

### Update Session Status
```javascript
// SOURCE: SKILL-supabase.md "Update a Row"
await supabase
  .from('sessions')
  .update({ status: 'active', total_rounds: totalRounds, current_round: 1 })
  .eq('id', sessionId)
```

### Subscribe to Session Status Change (Play.jsx)
```javascript
// SOURCE: SKILL-supabase.md "Real-Time Subscription Pattern"
// Players need to detect when host starts the game
const channel = supabase
  .channel(`session:${sessionId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'sessions',
    filter: `id=eq.${sessionId}`
  }, (payload) => {
    if (payload.new.status === 'active') {
      // Phase 3 will handle navigation to round view
      setSessionStatus('active')
    }
  })
  .subscribe()
return () => supabase.removeChannel(channel)
```

### Room Code Display CSS (HOST-10)
```css
/* Large enough to read from back of classroom */
.room-code {
  font-size: clamp(72px, 12vw, 120px);
  font-weight: 700;
  letter-spacing: 0.15em;
  color: #f59e0b;        /* warm amber — matches game aesthetic */
  font-family: 'Inter', system-ui, sans-serif;
  text-align: center;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `<Switch>` + `<Route>` (RR v5) | `<Routes>` + `<Route>` (RR v6/v7 declarative) | 2021 (v6 release) | `Routes` replaces `Switch`; routes are exclusive by default |
| `useHistory()` | `useNavigate()` | 2021 (v6 release) | `navigate('/path')` replaces `history.push()` |
| Supabase v1 `subscribe()` | Supabase v2 channel API `.channel().on().subscribe()` | 2022 (v2 release) | Channel-based; each subscription has an explicit name |

**Deprecated/outdated:**
- `<Switch>`: Replaced by `<Routes>` in v6+. Do not use.
- `useHistory()`: Replaced by `useNavigate()`. Do not use.
- Supabase v1 `.from().on('INSERT', cb).subscribe()`: Replaced by channel API. SKILL-supabase.md uses the correct v2 pattern.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite dev server | ✓ | v20.19.4 | — |
| react-router-dom | Routing | ✓ | 7.13.2 | — |
| @supabase/supabase-js | Real-time, DB queries | ✓ | 2.100.0 | — |
| Supabase project (remote) | Live DB + subscriptions | Unknown | — | Cannot substitute — must be set up by user per Phase 1 instructions |
| .env.local with real values | Supabase client init | Unknown | — | App throws descriptive error if missing; user must populate before testing |

**Missing dependencies with no fallback:**
- Supabase project with schema applied and real values in `.env.local` — required before any DB operations work. Phase 1 documented the setup steps.

**Missing dependencies with fallback:**
- None identified beyond Supabase project setup.

---

## Open Questions

1. **Does the Play page need to subscribe to session status in Phase 2?**
   - What we know: Phase 2 success criteria only require the lobby state (join, roster, start button active). The session status subscription belongs to the round-start transition.
   - What's unclear: Whether Phase 2 should wire the "game started" signal so the player waiting screen can react when host presses Start.
   - Recommendation: Yes — wire the session UPDATE subscription in Phase 2. It's 10 lines and the Play.jsx mount logic needs it to know the session exists and is in lobby state. Phase 3 will add the round-view rendering; Phase 2 just needs to transition from "waiting" to a placeholder "game starting" message.

2. **Room code case sensitivity**
   - What we know: `generateRoomCode()` returns a numeric string (e.g. `"4721"`). The schema has `UNIQUE NOT NULL` on `room_code`.
   - What's unclear: Should the join form normalize input? Players might type spaces or use copy-paste.
   - Recommendation: Call `.trim()` on user input before querying. Codes are digits-only so case is not an issue.

---

## Sources

### Primary (HIGH confidence)
- `SKILL-supabase.md` — RLS, insert/read/update patterns, LocalStorage pattern, real-time subscription pattern, maybeSingle gotcha. Project-specific skill file, authored for this app.
- `supabase/migrations/20260325000000_initial_schema.sql` — Exact schema: column names, constraints, RLS policies.
- `src/lib/supabase.js`, `src/lib/roomCode.js` — Phase 1 deliverables; confirmed working.
- React Router v7 official docs (reactrouter.com/start/modes) — confirmed declarative mode uses same `BrowserRouter` + `Routes` API as v6.

### Secondary (MEDIUM confidence)
- Phase 1 SUMMARY files (01-01-SUMMARY.md, 01-02-SUMMARY.md) — confirmed what was built, what patterns were established, and the v7 routing deviation note.
- STATE.md accumulated context — confirmed open RLS decision, no-TypeScript constraint.

### Tertiary (LOW confidence)
- None identified for this phase — all critical patterns are covered by official docs and project skill files.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed; versions confirmed from package.json
- Architecture: HIGH — routing pattern confirmed from official docs; Supabase patterns confirmed from SKILL-supabase.md
- Pitfalls: HIGH — fetch-before-subscribe and stale-closure pitfalls are documented in SKILL-supabase.md and are well-established real-time patterns

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable stack; Supabase v2 channel API has been stable since 2022)
