# Domain Pitfalls

**Domain:** React + Supabase real-time multiplayer game (classroom presentation context)
**Project:** The Crossroads
**Researched:** 2026-03-25
**Confidence:** HIGH for React/Supabase patterns (training knowledge, well-documented behaviors); MEDIUM for specific Supabase free-tier limits (verify against current Supabase dashboard)

---

## Critical Pitfalls

Mistakes that cause demo failure, data loss, or require a rewrite mid-presentation.

---

### Pitfall 1: Subscription Leak — Channel Not Removed on Unmount

**What goes wrong:** Every `useEffect` that calls `supabase.channel(...).subscribe()` must return a cleanup function that calls `supabase.removeChannel(channel)`. In React Strict Mode (Vite dev default), effects run twice on mount. Without cleanup, you silently accumulate duplicate subscriptions. Each duplicate fires its callback independently — players see choices submitted once but processed twice, vote tallies double-count, world state updates apply twice per round close.

**Why it happens:** Developers test in production build (no Strict Mode double-invoke) and miss the leak. Or they add a `channel` call inside an event handler rather than a `useEffect`, so the cleanup path never exists at all.

**Consequences:**
- World state meters jump to extreme values on the first round close
- Vote tallies show more votes than players
- Host sees duplicate rows in the choices real-time feed
- On navigation (host ends session), orphaned channels keep firing into unmounted components → React "Can't perform a state update on an unmounted component" warnings, potential crashes

**Prevention:**
```javascript
// CORRECT
useEffect(() => {
  const channel = supabase
    .channel(`choices:${sessionId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public',
        table: 'choices', filter: `session_id=eq.${sessionId}` },
      (payload) => setChoices(prev => [...prev, payload.new]))
    .subscribe()

  return () => supabase.removeChannel(channel)  // <-- critical
}, [sessionId])

// WRONG — no cleanup
useEffect(() => {
  supabase.channel(`choices:${sessionId}`).on(...).subscribe()
  // leak: channel never removed
}, [sessionId])
```

Also: use a stable channel name that includes the session ID and component role (e.g., `host-choices-${sessionId}`) so duplicate channels are detectable in the Supabase dashboard during testing.

**Detection:** Open the Supabase Realtime inspector during development. If you see more than N channels where N = expected subscriptions per component, you have a leak. Also watch for vote counts exceeding player count — that's the symptom in production.

**Phase:** Phase 4 (Host Dashboard) and Phase 5 (Player View) — enforce cleanup discipline before first end-to-end test.

---

### Pitfall 2: Race Condition — Double Choice Submission

**What goes wrong:** A player taps a choice button twice quickly (phone tap latency, double-tap, slow network making the button appear un-tapped). Two `INSERT` requests fire for the same `(player_id, round_number)`. The choices table now has two rows for one player-round. Vote tallies over-count. Framework detection runs on duplicate data. If the player "voted" for Choice A and Choice B, their framework profile is corrupted.

**Why it happens:** Optimistic UI disables the button visually — but the first `supabase.from('choices').insert()` call is async. The visual disable happens on click, but if the component re-renders (e.g. a Supabase subscription fires) between the click and the async lock, the button can re-enable. Or the player is on a slow connection and taps again thinking it didn't register.

**Consequences:**
- Player has 2 rows in `choices` for one round
- `computeProfile()` counts their frameworks twice for that round
- Vote tally inflated
- World state update uses wrong weights

**Prevention — two layers required:**

Layer 1: Database constraint (non-negotiable):
```sql
ALTER TABLE choices
  ADD CONSTRAINT choices_player_round_unique
  UNIQUE (player_id, round_number);
```
This makes double submission a DB error, not a silent data corruption. Handle the error gracefully on the client (ignore the duplicate insert error, it's expected).

Layer 2: Local state lock:
```javascript
const [submitted, setSubmitted] = useState(false)

async function handleChoice(choiceIndex) {
  if (submitted) return          // guard first
  setSubmitted(true)             // lock immediately, before await
  try {
    await supabase.from('choices').insert({ ... })
  } catch (err) {
    if (!err.message.includes('unique')) {
      setSubmitted(false)        // only unlock on non-duplicate errors
    }
  }
}
```

**Detection:** Query `SELECT player_id, round_number, COUNT(*) FROM choices GROUP BY player_id, round_number HAVING COUNT(*) > 1` after a test session.

**Phase:** Phase 5 (Player View) — add DB constraint in Phase 1 (Supabase schema), add client lock in Phase 5.

---

### Pitfall 3: RLS Blocks Real-Time Subscriptions Silently

**What goes wrong:** Supabase Row Level Security affects real-time subscriptions, not just REST queries. If you enable RLS on `sessions` or `choices` without a policy that allows `SELECT` for the anon role, real-time subscriptions return no data and no error — they silently receive nothing. The host dashboard subscribes to choice inserts and the tally never updates. Debugging this is extremely confusing because the channel shows as "connected."

**Why it happens:** Developers configure RLS to block client reads for security, forgetting that real-time subscriptions use the same RLS path as REST SELECT. Or they add policies for REST but forget real-time has its own policy check (`supabase_realtime` system role behavior). Or they test with the service role key (bypasses RLS) and only discover the problem when switching to the anon key.

**Consequences:**
- Real-time subscriptions connect successfully but deliver zero events
- Host vote tally never updates — looks broken, no error in console
- Players never see session status changes — stuck on waiting screen

**Prevention:**
```sql
-- Allow anon users to read sessions (they need status updates)
CREATE POLICY "Players can read their session"
  ON sessions FOR SELECT
  TO anon
  USING (true);  -- or scope to specific session via room_code check

-- Allow anon users to read choices in their session
CREATE POLICY "Players can read session choices"
  ON choices FOR SELECT
  TO anon
  USING (true);  -- real-time subscriptions need this

-- Allow anon users to insert their own choices only
CREATE POLICY "Players insert own choices"
  ON choices FOR INSERT
  TO anon
  WITH CHECK (player_id = current_setting('app.player_id')::uuid);
  -- Note: this requires setting a custom claim, or use a simpler check
```

Simpler approach for a low-stakes classroom game: use permissive SELECT policies on all tables (anyone can read session state) with INSERT restrictions. This is appropriate given there's no PII and sessions are ephemeral.

**Critical test:** After setting up RLS, test ALL subscription paths using only the anon key (not service role). The Supabase dashboard uses service role — always test in the actual browser client.

**Detection:** In browser devtools, check the WebSocket messages on the Supabase connection. If the subscription sends `phx_join` and receives a `phx_reply` with status "ok" but subsequent inserts produce no `postgres_changes` messages, RLS is blocking.

**Phase:** Phase 1 (Supabase setup) — configure RLS correctly from the start. Phase 2 and beyond: test every subscription with anon key before wiring to UI.

---

### Pitfall 4: Supabase Free Tier — Concurrent Connection Limits During Demo

**What goes wrong:** Supabase free tier (as of 2025) limits concurrent real-time connections. With 25 players each holding 1–2 active channels, plus the host holding 2–3 channels, a session uses 28–53 concurrent WebSocket connections. If this exceeds the free tier limit, latecomers fail to subscribe silently or get dropped.

**Why it happens:** Each browser tab maintains its own WebSocket connection to Supabase Realtime. Multiple `channel()` subscriptions in the same browser session share one underlying WebSocket (the Supabase JS client multiplexes), but each unique browser client (each player's phone) is a separate connection.

**Consequences:** In a classroom demo, players who joined late see frozen screens. No error message. The demo appears broken at the worst possible moment.

**Prevention:**
- Check current Supabase free tier realtime connection limits before the presentation (verify at supabase.com/pricing — MEDIUM confidence this changes periodically)
- For a 25-player session: 25 phones + 1 host laptop = 26 browser connections. Each browser multiplexes its own channels over 1 WebSocket. So you need 26 concurrent connections minimum.
- Free tier as of 2025 supports 200 concurrent connections — this is well within range for 25 players. However, verify this before the live demo.
- Minimize channels per client: players should hold exactly 1 subscription (session status). Host holds 2 (player joins + choice inserts). Do not create per-round channels — reuse the same channel.
- Use `supabase.getChannels()` to audit active channels in dev.

**Detection:** Run a load test before the presentation: open 10–15 browser tabs simulating players, submit choices simultaneously, verify the host tally updates for all submissions.

**Phase:** Phase 8 (Polish) — explicit load test before presentation day.

---

### Pitfall 5: Vite Environment Variable Exposure — Supabase Keys in Client Bundle

**What goes wrong:** Vite exposes any variable prefixed `VITE_` to the client bundle. The Supabase anon key is safe to expose (it's designed for client use, RLS enforces access). The **service role key** is not — it bypasses all RLS. If you reference `VITE_SUPABASE_SERVICE_ROLE_KEY` anywhere in your frontend code, it ends up in the compiled bundle and is trivially extractable from the production URL.

**Why it happens:** Developers use the service role key during development to avoid RLS friction, then forget to switch to anon key for client code. Or they put the service role key in a `.env` file, prefix it with `VITE_` for convenience, and ship it.

**Consequences:**
- Anyone who opens devtools on the deployed app can extract the service role key
- Service role key grants full read/write/delete access to the entire Supabase project
- For a classroom game this is low-stakes for PII, but could allow a classmate to corrupt or delete session data mid-demo

**Prevention:**
```
# .env — correct
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...          # safe for client

# NEVER in .env for client use:
# SUPABASE_SERVICE_ROLE_KEY=eyJ...     # no VITE_ prefix = server-only
```

- Use only the anon key in `supabase.js` for all client-side operations
- The service role key is only needed if you add a server function (not in this project's scope)
- Add `.env` to `.gitignore` (Vite scaffold does this by default, but verify)
- Before deploy: `grep -r "service_role" dist/` — should return nothing

**Detection:** After `vite build`, open `dist/assets/*.js` and search for `service_role`. If found, it's exposed.

**Phase:** Phase 2 (Core Data Layer) — establish correct `.env` pattern from the first line of `supabase.js`.

---

## Moderate Pitfalls

Mistakes that cause bugs or broken UX, fixable without a rewrite.

---

### Pitfall 6: localStorage Player ID Survives Between Test Sessions

**What goes wrong:** A player joins a test session, their `player_id` and `session_id` get stored in localStorage. They reload and try to join a new session. The app reads the stale localStorage values and attempts to reuse the old `player_id` (which now belongs to a deleted session). Supabase returns a foreign key constraint error. The player sees a broken join flow with no explanation.

**Why it happens:** The join flow reads localStorage first and skips the insert if an ID is found — logical for reconnection, but breaks session-to-session flow.

**Prevention:**
```javascript
// On join: always check if the stored session_id matches the current room code
const storedSession = localStorage.getItem('crossroads_session_id')
const storedPlayer = localStorage.getItem('crossroads_player_id')

// Only reuse if joining the SAME session
if (storedSession !== resolvedSessionId) {
  localStorage.removeItem('crossroads_session_id')
  localStorage.removeItem('crossroads_player_id')
}
```

Also: clear localStorage on the Landing page when "Join a different session" or "Create session" is selected.

**Detection:** Join a session, complete it, then try to join a new one in the same browser. If you see a DB error or get redirected to the wrong session, this pitfall is active.

**Phase:** Phase 3 (Landing Page).

---

### Pitfall 7: React StrictMode Double Effect Invocation in Dev

**What goes wrong:** Vite's default React template enables StrictMode, which intentionally runs effects twice in development (mount → unmount → mount). Any subscription setup that runs in `useEffect` will subscribe, unsubscribe, then subscribe again. Without proper cleanup (see Pitfall 1), this creates duplicate subscriptions. Even WITH cleanup, the subscription fires the `subscribe()` callback twice — which can cause visual glitches in the UI (a brief flash of "connected" state, then resubscribe).

**Why it happens:** StrictMode behavior is intentional — it helps surface missing cleanups. But developers unfamiliar with it see "subscriptions work fine in dev" (they do, after the double-invoke settles) and don't realize cleanup is needed.

**Prevention:** Keep StrictMode enabled — it's catching real issues. Just ensure every subscription useEffect has a cleanup. The double-invoke will then harmlessly subscribe, clean up, and re-subscribe once.

**Detection:** If you see a subscription event handler fire twice for a single DB event in dev but once in production build, you have a cleanup problem surfaced by StrictMode.

**Phase:** Throughout (Phase 4, 5) — this is a discipline issue, not a one-time fix.

---

### Pitfall 8: Optimistic UI Out of Sync with Server State on Network Failure

**What goes wrong:** A player taps a choice button. The UI immediately shows "Submitted" (optimistic update). The Supabase insert fails silently (network hiccup, RLS error, constraint violation). The player's phone shows "waiting for results" — but no choice is recorded. When the host closes the round, this player has no data. Their framework profile is computed from fewer rounds than expected.

**Why it happens:** The `setSubmitted(true)` call happens before the `await` resolves. Errors are not surfaced to the player because the UI already moved to the "submitted" state.

**Prevention:**
```javascript
const [submitted, setSubmitted] = useState(false)
const [submitError, setSubmitError] = useState(null)

async function handleChoice(choiceIndex) {
  if (submitted) return
  setSubmitted(true)        // optimistic lock
  setSubmitError(null)

  const { error } = await supabase.from('choices').insert({ ... })

  if (error && !error.message.includes('unique')) {
    // Real error — roll back the optimistic state
    setSubmitted(false)
    setSubmitError('Something went wrong. Tap to try again.')
  }
  // Duplicate constraint error = already submitted = keep submitted=true
}
```

Show an error message with a "tap to retry" affordance. In a classroom, a single player whose choice wasn't recorded is manageable — what's unacceptable is silent data loss.

**Phase:** Phase 5 (Player View).

---

### Pitfall 9: World State Update Race — Multiple Hosts or Stale Reads

**What goes wrong:** The host closes a round. The world state update function reads `currentState` from React state, computes the new state, then calls `supabase.from('sessions').update({ world_state: newState })`. If there's any lag between the read and the write, or if (in testing) two browser tabs are acting as host, the update uses a stale base state — producing wrong meter values.

**Why it happens:** The update logic is client-side: read current → compute delta → write new. This is not atomic. A concurrent update (or even a React state batching delay) can cause the read to return a value that's already been superseded.

**Prevention:** Use Supabase's Postgres function to do the update atomically server-side:
```sql
CREATE OR REPLACE FUNCTION update_world_state(
  p_session_id uuid,
  p_delta jsonb
) RETURNS void AS $$
BEGIN
  UPDATE sessions
  SET world_state = jsonb_build_object(
    'trust',       LEAST(100, GREATEST(0, (world_state->>'trust')::int + (p_delta->>'trust')::int)),
    'courage',     LEAST(100, GREATEST(0, (world_state->>'courage')::int + (p_delta->>'courage')::int)),
    'solidarity',  LEAST(100, GREATEST(0, (world_state->>'solidarity')::int + (p_delta->>'solidarity')::int)),
    'awareness',   LEAST(100, GREATEST(0, (world_state->>'awareness')::int + (p_delta->>'awareness')::int))
  )
  WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql;
```

For a single-host game (one browser is always the host), the race is unlikely but not impossible. The Postgres function approach eliminates it entirely and is worth the setup time.

**Detection:** After a test session, query `SELECT world_state FROM sessions WHERE id = ?` and manually verify the math from the recorded choices. If the values don't add up, a race or stale-read occurred.

**Phase:** Phase 4 (Host Dashboard) when implementing round-close logic.

---

### Pitfall 10: Missing or Wrong Filter on Real-Time Subscription

**What goes wrong:** A subscription like `.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'choices' }, handler)` with no `filter` fires for ALL choice inserts across ALL active sessions in the database. In a multi-session scenario (or during development with leftover test data), the host receives choice events from other sessions and the tally becomes corrupted.

**Why it happens:** Filters are an optional parameter — it's easy to forget them or assume Supabase scopes subscriptions per-client.

**Prevention:** Always filter by session ID:
```javascript
.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'choices',
  filter: `session_id=eq.${sessionId}`   // <-- mandatory
}, handler)
```

Same for sessions table subscription: filter by `id=eq.${sessionId}`.

**Detection:** Create two test sessions simultaneously, submit choices in both, and verify each host only receives their own session's events.

**Phase:** Phase 4 and Phase 5 — enforce filter on every subscription.

---

### Pitfall 11: Three.js r128 CDN Inconsistency and CapsuleGeometry Error

*Note: Three.js city is deferred to v2 per PROJECT.md. This pitfall applies when Phase 6 is built.*

**What goes wrong:** The CLAUDE.md spec explicitly requires Three.js r128 from CDN with the note "r128 only, no CapsuleGeometry." Loading a newer version via CDN (r150+) breaks `CatmullRomCurve3` behavior differences and introduces `CapsuleGeometry` availability inconsistency. Loading the wrong CDN URL serves a different version silently.

**Why it happens:** CDN URLs for specific Three.js versions are sometimes cached stale or the CDN serves a redirect. Also, if Three.js is later installed via npm alongside the CDN script tag, there are two copies of the library in scope and geometry constructors behave unexpectedly.

**Prevention:**
- Use the exact CDN URL: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`
- Do NOT also `npm install three` if using CDN — pick one delivery method
- Verify the loaded version: `console.log(THREE.REVISION)` should log `"128"`

**Phase:** Phase 6 (Three.js City) — lock version explicitly on first line of work.

---

## Minor Pitfalls

---

### Pitfall 12: Emoji Avatar Assignment Collisions

**What goes wrong:** On join, each player is assigned a random emoji avatar. With 25 players and a small emoji pool, multiple players get the same emoji. The host's PlayerRoster becomes confusing — three players are all showing the same face.

**Prevention:** Use an assignment strategy that guarantees uniqueness within a session: shuffle the emoji pool once and assign by join order, or track assigned emojis in the `sessions` row's `world_state` jsonb and exclude already-used ones.

**Phase:** Phase 3 (Landing Page) / Phase 4 (PlayerRoster).

---

### Pitfall 13: Room Code Collision

**What goes wrong:** Room codes are short (4 digits per CLAUDE.md spec, e.g. "7423"). If a previous session with the same code exists in the database with `status != 'finished'`, a new session insert fails or a joining player lands in the wrong session.

**Prevention:**
```javascript
// Generate room code with uniqueness check
async function generateRoomCode() {
  let code, exists
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString()
    const { data } = await supabase
      .from('sessions')
      .select('id')
      .eq('room_code', code)
      .eq('status', 'finished')  // only collide with active sessions
      .is('status', null)
    exists = data?.length > 0
  } while (exists)
  return code
}
```

Or add the unique constraint on `room_code` and let the DB reject collisions, retrying on the client.

**Phase:** Phase 3 (Landing Page).

---

### Pitfall 14: Supabase Client Initialized Multiple Times

**What goes wrong:** `createClient()` is called in multiple files or inside a component body instead of a module-level singleton. Multiple Supabase client instances create separate WebSocket connections, multiplying bandwidth usage and causing subscription inconsistencies (some subscriptions use client A, others use client B).

**Prevention:**
```javascript
// lib/supabase.js — one file, one call, export the singleton
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
// All other files: import { supabase } from '../lib/supabase'
// NEVER: const sb = createClient(...) inside a component
```

**Phase:** Phase 2 (Core Data Layer) — establish this pattern before any component uses Supabase.

---

### Pitfall 15: Content Note "Pass" Option Requires Careful Data Handling

**What goes wrong:** Rounds 3 and 4 have dismissible content notes with a "pass" option. If a player passes, the spec says "submit without choosing and your data won't count." If this is implemented as simply not inserting a row, then `computeProfile()` must gracefully handle rounds with no data (variable round counts per player). If implemented as inserting a sentinel value (`choice_index: -1`), the framework detection logic must explicitly skip it. Neither case is handled automatically.

**Prevention:** Define the pass behavior explicitly before building:
- Option A: No row inserted; `computeProfile()` handles variable-length `choice_history` (simpler, fewer edge cases)
- Option B: Insert a row with `choice_index: null` and `frameworks: []`; detection skips null-framework entries

Option A is recommended — less data, cleaner logic. The "X/Y submitted" counter should count passes as submitted (so the host knows the round can close).

**Phase:** Phase 5 (Player View) — decide before implementing choice submission.

---

## Phase-Specific Warnings

| Phase | Topic | Likely Pitfall | Mitigation |
|-------|-------|---------------|------------|
| Phase 1 | Supabase schema | RLS blocks real-time silently | Add SELECT policies for anon role on all 3 tables; test with anon key only |
| Phase 1 | Schema | No unique constraint on choices | Add `UNIQUE(player_id, round_number)` before any frontend work |
| Phase 2 | supabase.js | Multiple client instances | Singleton pattern, single export |
| Phase 2 | .env | Service role key exposed | Never prefix service role with `VITE_` |
| Phase 3 | Landing | Stale localStorage on rejoin | Clear stale IDs when room_code doesn't match |
| Phase 3 | Landing | Room code collision | Uniqueness check or DB unique constraint |
| Phase 4 | Host | World state stale read on update | Consider server-side update function |
| Phase 4 | Host | Missing subscription filter | Always include `filter: session_id=eq.${id}` |
| Phase 5 | Player | Double submission | Client lock + DB unique constraint (both) |
| Phase 5 | Player | Optimistic UI silent failure | Error state + retry affordance |
| Phase 5 | Player | Pass option undefined behavior | Decide: no-row vs. null-row before building |
| Phase 6 | Three.js | Wrong CDN version | Lock to r128, verify `THREE.REVISION === "128"` |
| Phase 8 | Load test | Channel count surprise | Load test 20+ simultaneous connections before presentation day |

---

## Sources

**Note:** WebSearch and external documentation tools were unavailable during this research session. All findings are sourced from training data (knowledge cutoff August 2025) covering:

- Supabase JS client v2 real-time API documentation and known behaviors
- React 18 StrictMode double-invoke behavior (official React docs)
- Vite environment variable exposure rules (`VITE_` prefix convention)
- Common Supabase RLS + real-time interaction patterns documented in community forums and Supabase GitHub issues
- React optimistic UI patterns and async state management best practices

**Confidence by area:**
| Area | Confidence | Notes |
|------|------------|-------|
| Subscription cleanup / StrictMode | HIGH | Well-documented React 18 + Supabase behavior |
| RLS + real-time interaction | HIGH | Documented Supabase behavior, common support issue |
| Double submission / DB constraints | HIGH | Standard SQL + async UI pattern |
| Vite env var exposure | HIGH | Vite documentation behavior |
| Supabase connection limits | MEDIUM | Limits change; verify current free tier at supabase.com/pricing before presentation |
| Three.js r128 CDN | MEDIUM | Version pinning behavior; verify CDN URL resolves correctly |

**Items to verify before presentation:**
- Current Supabase free tier concurrent connection limit (ensure 26+ connections supported)
- Supabase real-time filter syntax for `postgres_changes` (confirm `filter:` key name in current JS client v2)
