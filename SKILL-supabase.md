# SKILL.md — Supabase (React + Real-Time)

Use this skill whenever building a React app that uses Supabase for
auth-free real-time multiplayer, Postgres storage, and RLS.

---

## Client Setup

```javascript
// lib/supabase.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

.env file (never commit):
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## Insert a Row

```javascript
const { data, error } = await supabase
  .from('players')
  .insert({ session_id, name, avatar })
  .select()
  .single()

if (error) console.error(error)
const playerId = data.id
```

Always `.select().single()` after insert to get the new row back.
Store returned id in localStorage for session persistence.

---

## Read a Row

```javascript
const { data } = await supabase
  .from('sessions')
  .select('*')
  .eq('room_code', code)
  .single()
```

---

## Update a Row

```javascript
await supabase
  .from('sessions')
  .update({ world_state: newState })
  .eq('id', sessionId)
```

---

## Real-Time Subscription Pattern (React)

```javascript
useEffect(() => {
  // 1. Fetch initial state immediately
  fetchSession()

  // 2. Subscribe to changes
  const channel = supabase
    .channel(`session:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${sessionId}`
      },
      (payload) => {
        setSessionState(payload.new)
      }
    )
    .subscribe()

  // 3. Always clean up
  return () => supabase.removeChannel(channel)
}, [sessionId])
```

Key rules:
- Always fetch initial state BEFORE subscribing — subscriptions only fire on changes
- Always return cleanup function — memory leak without it
- One channel per logical stream — don't stack multiple .on() calls unless related
- filter: uses PostgREST syntax — `id=eq.${value}` not `id = ${value}`

---

## Subscribing to Inserts (Live Tally Pattern)

```javascript
const channel = supabase
  .channel(`choices:${sessionId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'choices',
      filter: `session_id=eq.${sessionId}`
    },
    (payload) => {
      setChoices(prev => [...prev, payload.new])
    }
  )
  .subscribe()
```

---

## RLS Policies (run in Supabase SQL editor)

```sql
-- Enable RLS on all tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE choices ENABLE ROW LEVEL SECURITY;

-- Anyone can read sessions (needed to join by room code)
CREATE POLICY "sessions_read" ON sessions
  FOR SELECT USING (true);

-- Anyone can insert a player (no auth)
CREATE POLICY "players_insert" ON players
  FOR INSERT WITH CHECK (true);

-- Players can read all players in their session
CREATE POLICY "players_read" ON players
  FOR SELECT USING (true);

-- Anyone can insert a choice
CREATE POLICY "choices_insert" ON choices
  FOR INSERT WITH CHECK (true);

-- Anyone can read choices (host needs to tally)
CREATE POLICY "choices_read" ON choices
  FOR SELECT USING (true);

-- Host updates session state — use service role key server-side
-- OR allow anon updates for simplicity in a classroom context:
CREATE POLICY "sessions_update" ON sessions
  FOR UPDATE USING (true);
```

Note: For a classroom app with no sensitive data, open RLS is fine.
For production, scope policies to authenticated users.

---

## JSONB Updates (world_state, traits)

```javascript
// Merge into existing jsonb — don't overwrite the whole object
const { data: session } = await supabase
  .from('sessions')
  .select('world_state')
  .eq('id', sessionId)
  .single()

const updatedState = {
  ...session.world_state,
  trust: Math.max(0, Math.min(100, session.world_state.trust + delta))
}

await supabase
  .from('sessions')
  .update({ world_state: updatedState })
  .eq('id', sessionId)
```

Always clamp meter values: Math.max(0, Math.min(100, value))

---

## Room Code Generation

```javascript
function generateRoomCode() {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// On create session:
const code = generateRoomCode()
const { data } = await supabase
  .from('sessions')
  .insert({ room_code: code, total_rounds: 4 })
  .select()
  .single()
```

---

## LocalStorage Pattern (no auth)

```javascript
// On join — save identity
localStorage.setItem('player_id', data.id)
localStorage.setItem('session_id', sessionId)

// On page load — restore
const playerId = localStorage.getItem('player_id')
const sessionId = localStorage.getItem('session_id')

// On leave/reset
localStorage.removeItem('player_id')
localStorage.removeItem('session_id')
```

---

## Common Gotchas

- `.single()` throws if 0 or 2+ rows match — use `.maybeSingle()` if uncertain
- Real-time requires the table to have replication enabled in Supabase dashboard
  (Database → Replication → toggle the table on)
- `filter:` in subscriptions is server-side — still validate in your handler
- Anon key is safe to expose in frontend — it only allows what RLS permits
- Service role key is NEVER in frontend code — server only
- Supabase free tier pauses after 1 week of inactivity — wake it up before presenting
