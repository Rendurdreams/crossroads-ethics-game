import { useState, useEffect, useReducer, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { scenarios } from '../lib/scenarios.js'
import { applyChoicesToWorld } from '../lib/worldState.js'
import PlayerRoster from '../components/PlayerRoster.jsx'
import CityPlaceholder from '../components/CityPlaceholder.jsx'
import WorldStatePanel from '../components/WorldStatePanel.jsx'
import styles from './Host.module.css'

// ─── Round state machine ───────────────────────────────────────────────────

const initialRoundState = {
  choices: [],
  timerSeconds: 60,
  timerRunning: false,
  roundClosed: false
}

function roundReducer(state, action) {
  switch (action.type) {
    case 'ROUND_START':
      return { ...initialRoundState, timerSeconds: action.duration, timerRunning: true }
    case 'CHOICE_RECEIVED':
      return {
        ...state,
        choices: state.choices.some(c => c.id === action.choice.id)
          ? state.choices
          : [...state.choices, action.choice]
      }
    case 'TICK':
      return { ...state, timerSeconds: Math.max(0, state.timerSeconds - 1) }
    case 'ROUND_CLOSE':
      return { ...state, timerRunning: false, roundClosed: true }
    case 'RESET':
      return initialRoundState
    default:
      return state
  }
}

// ─── Host component ────────────────────────────────────────────────────────

export default function Host() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [players, setPlayers] = useState([])
  const [totalRounds, setTotalRounds] = useState(4)
  const [loading, setLoading] = useState(true)
  const [started, setStarted] = useState(false)
  const [timerDuration, setTimerDuration] = useState(60)

  const [roundState, dispatch] = useReducer(roundReducer, initialRoundState)

  // Persistent broadcast channel ref for timer
  const timerChannelRef = useRef(null)

  // ── Initial data load + subscriptions ───────────────────────────────────

  useEffect(() => {
    if (!sessionId) return

    // 1. Fetch session row
    supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          navigate('/')
          return
        }
        setSession(data)
        setTotalRounds(data.total_rounds || 4)
        setLoading(false)
      })

    // 2. Fetch existing players (BEFORE subscription to avoid race)
    supabase
      .from('players')
      .select('*')
      .eq('session_id', sessionId)
      .then(({ data }) => {
        setPlayers(data ?? [])
      })

    // 3. Subscribe to new player joins
    const playersChannel = supabase.channel(`players:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'players',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          // Dedup: prevent race condition where fetch + subscription both deliver the same player
          setPlayers(prev =>
            prev.some(p => p.id === payload.new.id)
              ? prev
              : [...prev, payload.new]
          )
        }
      )
      .subscribe()

    // 4. Subscribe to session updates (world_state, status, current_round changes)
    const sessionChannel = supabase.channel(`host-session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          setSession(payload.new)
          if (payload.new.status === 'round_complete') {
            dispatch({ type: 'ROUND_CLOSE' })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(playersChannel)
      supabase.removeChannel(sessionChannel)
    }
  }, [sessionId, navigate])

  // ── Persistent timer broadcast channel ──────────────────────────────────

  useEffect(() => {
    if (!sessionId) return
    timerChannelRef.current = supabase.channel(`timer:${sessionId}`)
    timerChannelRef.current.subscribe()
    return () => {
      if (timerChannelRef.current) {
        supabase.removeChannel(timerChannelRef.current)
      }
    }
  }, [sessionId])

  // ── Timer tick ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!roundState.timerRunning || roundState.timerSeconds <= 0) return
    const interval = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => clearInterval(interval)
  }, [roundState.timerRunning, roundState.timerSeconds])

  // ── Auto-close when timer hits 0 ────────────────────────────────────────

  useEffect(() => {
    if (roundState.timerSeconds === 0 && roundState.timerRunning) {
      closeRound()
    }
  }, [roundState.timerSeconds, roundState.timerRunning])

  // ── Broadcast timer to players on each tick ─────────────────────────────

  useEffect(() => {
    if (timerChannelRef.current && roundState.timerRunning) {
      timerChannelRef.current.send({
        type: 'broadcast',
        event: 'timer',
        payload: { remaining: roundState.timerSeconds, total: timerDuration }
      })
    }
  }, [roundState.timerSeconds, roundState.timerRunning, timerDuration])

  // ── Choices subscription (fetch-then-subscribe) ──────────────────────────

  useEffect(() => {
    if (!sessionId || !session?.current_round || session?.status !== 'active') return

    // Fetch existing choices for this round
    supabase.from('choices').select('*')
      .eq('session_id', sessionId)
      .eq('round_number', session.current_round)
      .then(({ data }) => {
        ;(data ?? []).forEach(c => dispatch({ type: 'CHOICE_RECEIVED', choice: c }))
      })

    // Subscribe to new choices
    const channel = supabase.channel(`host-choices:${sessionId}:r${session.current_round}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'choices',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        if (payload.new.round_number === session.current_round) {
          dispatch({ type: 'CHOICE_RECEIVED', choice: payload.new })
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [sessionId, session?.current_round, session?.status])

  // ── Vote tally computation ───────────────────────────────────────────────

  function computeTally() {
    const currentScenario = scenarios[(session?.current_round ?? 1) - 1]
    if (!currentScenario) return []
    const counts = [0, 0, 0]
    roundState.choices.forEach(c => {
      if (c.choice_index >= 0 && c.choice_index < 3) counts[c.choice_index]++
    })
    const total = roundState.choices.length
    return currentScenario.choices.map((choice, i) => ({
      text: choice.text,
      count: counts[i],
      pct: total > 0 ? Math.round((counts[i] / total) * 100) : 0
    }))
  }

  // ── Round control functions ──────────────────────────────────────────────

  async function startGame() {
    dispatch({ type: 'ROUND_START', duration: timerDuration })
    await supabase
      .from('sessions')
      .update({ status: 'active', total_rounds: totalRounds, current_round: 1 })
      .eq('id', sessionId)
    setStarted(true)
  }

  async function closeRound() {
    if (roundState.roundClosed) return // idempotent guard
    dispatch({ type: 'ROUND_CLOSE' })

    const roundIndex = session.current_round - 1
    const newWorldState = applyChoicesToWorld(
      roundState.choices, scenarios, roundIndex, session.world_state
    )

    await supabase.from('sessions')
      .update({ status: 'round_complete', world_state: newWorldState })
      .eq('id', sessionId)
  }

  async function nextRound() {
    dispatch({ type: 'ROUND_START', duration: timerDuration })
    await supabase.from('sessions')
      .update({ status: 'active', current_round: session.current_round + 1 })
      .eq('id', sessionId)
  }

  async function endGame() {
    await supabase.from('sessions')
      .update({ status: 'finished' })
      .eq('id', sessionId)
  }

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.loading}>Loading...</p>
      </div>
    )
  }

  // End state
  if (session?.status === 'finished') {
    return (
      <div className={styles.endView}>
        <p className={styles.endText}>Game Over</p>
        <CityPlaceholder />
        <p className={styles.loading}>Session ended.</p>
      </div>
    )
  }

  // Round view (active or round_complete)
  if (session?.status === 'active' || session?.status === 'round_complete') {
    const currentScenario = scenarios[(session.current_round ?? 1) - 1]

    return (
      <div className={styles.roundView}>
        <div className={styles.cityPanel}>
          <CityPlaceholder />
        </div>
        <div className={styles.statePanel}>
          <WorldStatePanel
            scenario={currentScenario}
            tally={computeTally()}
            submitted={roundState.choices.length}
            totalPlayers={players.length}
            worldState={session.world_state}
            timerRemaining={roundState.timerSeconds}
            timerTotal={timerDuration}
            roundClosed={roundState.roundClosed}
            onCloseRound={closeRound}
            onNextRound={nextRound}
            onEndGame={endGame}
            isLastRound={session.current_round >= session.total_rounds}
          />
        </div>
      </div>
    )
  }

  // Lobby view
  return (
    <div className={styles.page}>
      <p className={styles.roomLabel}>ROOM CODE</p>
      <div className={styles.roomCode}>{session?.room_code}</div>

      <div className={styles.content}>
        <PlayerRoster players={players} />
        <p className={styles.playerCount}>{players.length} player(s) joined</p>

        <div className={styles.roundSelector}>
          <span className={styles.roundLabel}>Rounds</span>
          {[3, 4, 5, 6].map(n => (
            <button
              key={n}
              className={
                n === totalRounds
                  ? `${styles.roundBtn} ${styles.roundBtnActive}`
                  : `${styles.roundBtn} ${styles.roundBtnInactive}`
              }
              onClick={() => setTotalRounds(n)}
            >
              {n}
            </button>
          ))}
        </div>

        {started ? (
          <p className={styles.started}>Game started — players are in!</p>
        ) : (
          <button
            className={styles.startBtn}
            disabled={players.length < 2}
            onClick={startGame}
          >
            Start Game ({players.length} player{players.length !== 1 ? 's' : ''})
          </button>
        )}
      </div>
    </div>
  )
}
