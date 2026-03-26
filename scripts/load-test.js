// Load Test: 25 Concurrent Supabase Real-Time Subscriptions
//
// Verifies that 25 simultaneous channels all receive INSERT events
// on the choices table within 2 seconds of being written.
//
// Usage:
//   SUPABASE_URL=https://xxx.supabase.co SUPABASE_ANON_KEY=xxx node scripts/load-test.js
//
// Pass criteria: all 25 channels receive all events within 2000ms.
// A single dropped event is a failure.

import { createClient } from '@supabase/supabase-js'

// --- Constants ---
const CHANNEL_COUNT = 25
const EVENT_COUNT = 6
const TIMEOUT_MS = 2000

// --- Environment validation ---
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[ERROR] Missing required environment variables.')
  console.error('')
  console.error('Usage:')
  console.error('  SUPABASE_URL=https://xxx.supabase.co SUPABASE_ANON_KEY=xxx node scripts/load-test.js')
  console.error('')
  console.error('Find these values in your Supabase dashboard → Project Settings → API.')
  process.exit(1)
}

// --- Create Supabase client ---
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// --- Create a test session ---
const roomCode = Math.random().toString(36).slice(2, 6).toUpperCase()
const { data: sessionData, error: sessionError } = await supabase
  .from('sessions')
  .insert({
    room_code: roomCode,
    status: 'lobby',
    current_round: 0,
    total_rounds: 6,
    world_state: { trust: 50, courage: 50, solidarity: 50, awareness: 50 }
  })
  .select('id')
  .single()

if (sessionError) {
  console.error('[ERROR] Failed to create test session:', sessionError.message)
  process.exit(1)
}

const sessionId = sessionData.id
console.log(`[LOAD TEST] Created test session: ${sessionId} (room code: ${roomCode})`)

// --- Create a test player ---
const { data: playerData, error: playerError } = await supabase
  .from('players')
  .insert({
    session_id: sessionId,
    name: 'LoadTestPlayer',
    avatar: '🤖',
    framework_counts: { consequentialism: 0, deontology: 0, care: 0, virtue: 0 },
    choice_history: []
  })
  .select('id')
  .single()

if (playerError) {
  console.error('[ERROR] Failed to create test player:', playerError.message)
  await supabase.from('sessions').delete().eq('id', sessionId)
  process.exit(1)
}

const playerId = playerData.id

// --- Open 25 channels ---
const received = Array.from({ length: CHANNEL_COUNT }, () => [])
const channels = []

console.log(`[LOAD TEST] Opening ${CHANNEL_COUNT} subscriptions to session ${sessionId}...`)

await Promise.all(
  Array.from({ length: CHANNEL_COUNT }, (_, i) =>
    new Promise((resolve) => {
      const ch = supabase
        .channel(`load-test-${i}-${sessionId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'choices',
            filter: `session_id=eq.${sessionId}`
          },
          (payload) => {
            received[i].push(payload.new.id)
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') resolve()
        })
      channels.push(ch)
    })
  )
)

console.log(`[OK] All ${CHANNEL_COUNT} channels active.`)

// --- Insert test events ---
console.log(`[TEST] Writing ${EVENT_COUNT} choice inserts...`)

for (let r = 0; r < EVENT_COUNT; r++) {
  const { error: choiceError } = await supabase.from('choices').insert({
    session_id: sessionId,
    player_id: playerId,
    round_number: r + 1,
    scenario_id: `load-test-scenario-${r}`,
    choice_index: r % 3,
    frameworks: ['consequentialism']
  })

  if (choiceError) {
    console.warn(`[WARN] Insert failed for round ${r + 1}: ${choiceError.message}`)
  }
}

// --- Wait for delivery ---
await new Promise((resolve) => setTimeout(resolve, TIMEOUT_MS))

// --- Evaluate results ---
let passCount = 0
for (let i = 0; i < CHANNEL_COUNT; i++) {
  if (received[i].length >= EVENT_COUNT) {
    passCount++
  }
}

if (passCount === CHANNEL_COUNT) {
  console.log(
    `[RESULT] ${passCount}/${CHANNEL_COUNT} channels received all ${EVENT_COUNT} events within ${TIMEOUT_MS}ms — PASS`
  )
} else {
  console.log(
    `[RESULT] ${passCount}/${CHANNEL_COUNT} channels received all events — FAIL (${CHANNEL_COUNT - passCount} channels dropped events)`
  )
  for (let i = 0; i < CHANNEL_COUNT; i++) {
    if (received[i].length < EVENT_COUNT) {
      console.log(`  Channel ${i}: received ${received[i].length}/${EVENT_COUNT}`)
    }
  }
}

// --- Cleanup ---
for (const ch of channels) {
  await supabase.removeChannel(ch)
}

await supabase.from('sessions').delete().eq('id', sessionId)
console.log('[CLEANUP] Test session removed.')

process.exit(passCount === CHANNEL_COUNT ? 0 : 1)
