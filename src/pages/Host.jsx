import { useState, useEffect, useReducer, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { supabase } from '../lib/supabase.js'
import { scenarios } from '../lib/scenarios.js'
import { applyChoicesToWorld, computeNarrative } from '../lib/worldState.js'
import { computeProfile, findConflicts } from '../lib/detection.js'
import { FRAMEWORKS } from '../lib/frameworks.js'
import PlayerRoster from '../components/PlayerRoster.jsx'
import CityPlaceholder from '../components/CityPlaceholder.jsx'
import WorldStatePanel from '../components/WorldStatePanel.jsx'
import MeterBar from '../components/MeterBar.jsx'
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

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } }
}

// ─── Host component ────────────────────────────────────────────────────────

export default function Host() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const shouldReduce = useReducedMotion()
  const variants = shouldReduce ? { initial: {}, animate: {}, exit: {} } : pageVariants

  const [session, setSession] = useState(null)
  const [players, setPlayers] = useState([])
  const [totalRounds, setTotalRounds] = useState(4)
  const [loading, setLoading] = useState(true)
  const [started, setStarted] = useState(false)
  const [timerDuration, setTimerDuration] = useState(60)

  const [roundState, dispatch] = useReducer(roundReducer, initialRoundState)

  const [endingSession, setEndingSession] = useState(false)
  const [endSessionError, setEndSessionError] = useState(false)
  const [reflections, setReflections] = useState([])

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

  // ── Reflection feed subscription (active on session finished) ───────────

  useEffect(() => {
    if (session?.status !== 'finished') return

    // Fetch existing reflections
    supabase.from('reflections').select('text, submitted_at')
      .eq('session_id', sessionId)
      .order('submitted_at', { ascending: true })
      .then(({ data }) => setReflections(data ?? []))

    // Subscribe to new reflection inserts
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

  async function endSession() {
    if (endingSession) return
    setEndingSession(true)
    setEndSessionError(false)

    try {
      // 1. Fetch all players' choice_history
      const { data: allPlayers, error: fetchErr } = await supabase
        .from('players')
        .select('id, choice_history, framework_counts')
        .eq('session_id', sessionId)

      if (fetchErr) throw fetchErr

      // 2. Compute profiles for each player
      const updates = allPlayers.map(p => {
        const history = p.choice_history ?? []
        const { dominant, counts } = computeProfile(history)
        const conflicts = findConflicts(history)
        return {
          id: p.id,
          dominant_framework: dominant,
          conflicts: conflicts,
          framework_counts: counts
        }
      })

      // 3. Batch update player rows — all must complete before status change
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

      // 4. Set session to finished AFTER all player writes complete (avoids race)
      await supabase.from('sessions')
        .update({ status: 'finished' })
        .eq('id', sessionId)

    } catch (err) {
      console.error('End session failed:', err)
      setEndSessionError(true)
      setEndingSession(false)
    }
  }

  // ── Atmosphere warmth computation ─────────────────────────────────────────

  function computeWarmth(worldState) {
    if (!worldState) return 0.5
    return (worldState.trust + worldState.courage + worldState.solidarity + worldState.awareness) / 400
  }

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <motion.div
        className={styles.page}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <p className={styles.loading}>Loading...</p>
      </motion.div>
    )
  }

  // End state
  if (session?.status === 'finished') {
    // Compute group framework breakdown from players array
    const frameworkCounts = { consequentialism: 0, deontology: 0, care: 0, virtue: 0 }
    players.forEach(p => {
      if (p.dominant_framework && frameworkCounts.hasOwnProperty(p.dominant_framework)) {
        frameworkCounts[p.dominant_framework]++
      }
    })
    const totalWithFramework = Object.values(frameworkCounts).reduce((a, b) => a + b, 0)
    const sortedFrameworks = Object.entries(frameworkCounts)
      .sort((a, b) => b[1] - a[1])
    const leadingFramework = sortedFrameworks[0]?.[0]

    // Compute world narrative
    const narrative = computeNarrative(session.world_state)
    const warmth = computeWarmth(session.world_state)

    return (
      <motion.div
        className={styles.roundView}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ '--atmosphere-warmth': warmth }}
      >
        <div className={styles.cityPanel}>
          <CityPlaceholder />
        </div>
        <div className={`${styles.statePanel} ${styles.endPanel}`}>

          {/* Group Framework Breakdown */}
          <div className={styles.endSection}>
            <p className={styles.endSectionLabel}>YOUR GROUP</p>
            <div className={styles.frameworkList}>
              {sortedFrameworks.map(([key, count]) => (
                <div key={key} className={styles.frameworkRow}>
                  <span className={key === leadingFramework ? styles.frameworkNameLead : styles.frameworkNameNormal}>
                    {FRAMEWORKS[key]?.name ?? key}
                  </span>
                  <span className={styles.frameworkStat}>
                    {count} player{count !== 1 ? 's' : ''} ({totalWithFramework > 0 ? Math.round((count / totalWithFramework) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* World State Narrative */}
          <div className={styles.endSection}>
            <p className={styles.endSectionLabel}>WHAT HAPPENED</p>
            <p className={styles.narrativeText}>{narrative}</p>
          </div>

          {/* Final World State Meters */}
          <div className={styles.endSection}>
            <p className={styles.endSectionLabel}>FINAL STATE</p>
            <div className={styles.endMeters}>
              <MeterBar label="Trust" value={session.world_state?.trust ?? 50} />
              <MeterBar label="Courage" value={session.world_state?.courage ?? 50} />
              <MeterBar label="Solidarity" value={session.world_state?.solidarity ?? 50} />
              <MeterBar label="Awareness" value={session.world_state?.awareness ?? 50} />
            </div>
          </div>

          {/* Anonymous Reflection Feed */}
          <div className={styles.endSection}>
            <p className={styles.endSectionLabel}>FROM YOUR GROUP</p>
            {reflections.length === 0 ? (
              <p className={styles.reflectionEmpty}>Reflections will appear here as players submit them.</p>
            ) : (
              <div className={styles.reflectionFeed}>
                {reflections.map((r, i) => (
                  <div key={i} className={styles.reflectionCard}>
                    <p className={styles.reflectionText}>{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Session complete label */}
          <p className={styles.sessionComplete}>Session complete.</p>
        </div>
      </motion.div>
    )
  }

  // Round view (active or round_complete)
  if (session?.status === 'active' || session?.status === 'round_complete') {
    const currentScenario = scenarios[(session.current_round ?? 1) - 1]
    const warmth = computeWarmth(session.world_state)

    return (
      <motion.div
        className={styles.roundView}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ '--atmosphere-warmth': warmth }}
      >
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
            onEndGame={endSession}
            isLastRound={session.current_round >= session.total_rounds}
          />
        </div>
      </motion.div>
    )
  }

  // Lobby view
  return (
    <motion.div
      className={styles.page}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
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
    </motion.div>
  )
}
