import { useState, useEffect, useReducer, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { getDefaultPack, getScenarioByRound } from '../lib/scenarios.js'

const pack = getDefaultPack()
import { applyChoicesToWorld, computeNarrative } from '../lib/worldState.js'
import { computeProfile, findConflicts } from '../lib/detection.js'
import { FRAMEWORKS } from '../lib/frameworks.js'
import PlayerRoster from '../components/PlayerRoster.jsx'
import MeterBar from '../components/MeterBar.jsx'
import KingdomMap from '../components/KingdomMap.jsx'
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
  const [loading, setLoading] = useState(true)
  const [started, setStarted] = useState(false)
  const [timerDuration, setTimerDuration] = useState(60)

  const [roundState, dispatch] = useReducer(roundReducer, initialRoundState)

  const [endingSession, setEndingSession] = useState(false)
  const [endSessionError, setEndSessionError] = useState(false)
  const [reflections, setReflections] = useState([])

  const timerChannelRef = useRef(null)

  // ── Initial data load + subscriptions ───────────────────────────────────

  useEffect(() => {
    if (!sessionId) return

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
        setLoading(false)
      })

    supabase
      .from('players')
      .select('*')
      .eq('session_id', sessionId)
      .then(({ data }) => {
        setPlayers(data ?? [])
      })

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
          setPlayers(prev =>
            prev.some(p => p.id === payload.new.id)
              ? prev
              : [...prev, payload.new]
          )
        }
      )
      .subscribe()

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

    supabase.from('choices').select('*')
      .eq('session_id', sessionId)
      .eq('round_number', session.current_round)
      .then(({ data }) => {
        ;(data ?? []).forEach(c => dispatch({ type: 'CHOICE_RECEIVED', choice: c }))
      })

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

  // ── Reflection feed subscription ───────────────────────────────────────

  useEffect(() => {
    if (session?.status !== 'finished') return

    supabase.from('reflections').select('text, submitted_at')
      .eq('session_id', sessionId)
      .order('submitted_at', { ascending: true })
      .then(({ data }) => setReflections(data ?? []))

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

  // ── Vote tally computation ─────────────────────────────────────────────

  function computeTally() {
    const currentScenario = getScenarioByRound(pack, session?.current_round ?? 1)
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

  // ── Round control functions ────────────────────────────────────────────

  async function startGame() {
    dispatch({ type: 'ROUND_START', duration: timerDuration })
    await supabase
      .from('sessions')
      .update({ status: 'active', total_rounds: session.total_rounds, current_round: 1 })
      .eq('id', sessionId)
    setStarted(true)
  }

  async function closeRound() {
    if (roundState.roundClosed) return
    dispatch({ type: 'ROUND_CLOSE' })

    const roundIndex = session.current_round - 1
    const newWorldState = applyChoicesToWorld(
      roundState.choices, pack.scenarios, roundIndex, session.world_state
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
      const [{ data: allPlayers, error: fetchErr }, { data: allChoices, error: choicesErr }] = await Promise.all([
        supabase.from('players').select('id').eq('session_id', sessionId),
        supabase.from('choices').select('player_id, round_number, frameworks').eq('session_id', sessionId)
      ])

      if (fetchErr) throw fetchErr
      if (choicesErr) throw choicesErr

      // Build choice_history per player from the choices table
      // (players.choice_history is never written — source of truth is the choices table)
      const historyByPlayer = {}
      ;(allChoices ?? []).forEach(c => {
        if (!historyByPlayer[c.player_id]) historyByPlayer[c.player_id] = []
        historyByPlayer[c.player_id].push({ round: c.round_number, frameworks: c.frameworks })
      })

      const updates = allPlayers.map(p => {
        const history = historyByPlayer[p.id] ?? []
        const { dominant, counts } = computeProfile(history)
        const conflicts = findConflicts(history)
        return {
          id: p.id,
          dominant_framework: dominant,
          conflicts: conflicts,
          framework_counts: counts,
          choice_history: history
        }
      })

      await Promise.all(
        updates.map(u =>
          supabase.from('players')
            .update({
              dominant_framework: u.dominant_framework,
              conflicts: u.conflicts,
              framework_counts: u.framework_counts,
              choice_history: u.choice_history
            })
            .eq('id', u.id)
        )
      )

      await supabase.from('sessions')
        .update({ status: 'finished' })
        .eq('id', sessionId)

    } catch (err) {
      console.error('End session failed:', err)
      setEndSessionError(true)
      setEndingSession(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={styles.loadingOverlay}>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    )
  }

  const worldState = session?.world_state ?? { trust: 50, courage: 50, solidarity: 50, awareness: 50 }

  // ── End state ──────────────────────────────────────────────────────────

  if (session?.status === 'finished') {
    const frameworkCounts = { consequentialism: 0, deontology: 0, care: 0, virtue: 0 }
    players.forEach(p => {
      if (p.dominant_framework && frameworkCounts.hasOwnProperty(p.dominant_framework)) {
        frameworkCounts[p.dominant_framework]++
      }
    })
    const totalWithFramework = Object.values(frameworkCounts).reduce((a, b) => a + b, 0)
    const sortedFrameworks = Object.entries(frameworkCounts).sort((a, b) => b[1] - a[1])
    const leadingFramework = sortedFrameworks[0]?.[0]
    const narrative = computeNarrative(worldState)

    return (
      <>
        <div className={styles.canvas}>
          <KingdomMap worldState={worldState} />
        </div>

        <div className={styles.topBar}>
          <span className={styles.topRoomCode}>{session.room_code}</span>
          <span className={styles.topStatus}>Session Complete</span>
        </div>

        <div className={styles.hud}>
          <div className={styles.endBottomPanels}>
            <div className={`${styles.glassPanel} ${styles.endPanelWide}`}>
              <p className={styles.endSectionLabel}>WHAT HAPPENED</p>
              <p className={styles.narrativeText}>{narrative}</p>

              <p className={styles.endSectionLabel} style={{ marginTop: 20 }}>FROM THE COUNCIL</p>
              {reflections.length === 0 ? (
                <p className={styles.reflectionEmpty}>Reflections will appear as players submit them.</p>
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

            <div className={`${styles.glassPanel} ${styles.endPanelNarrow}`}>
              <p className={styles.endSectionLabel}>YOUR GROUP</p>
              {sortedFrameworks.map(([key, count]) => (
                <div key={key} className={styles.frameworkRow}>
                  <span className={key === leadingFramework ? styles.frameworkNameLead : styles.frameworkNameNormal}>
                    {FRAMEWORKS[key]?.name ?? key}
                  </span>
                  <span className={styles.frameworkStat}>
                    {count} ({totalWithFramework > 0 ? Math.round((count / totalWithFramework) * 100) : 0}%)
                  </span>
                </div>
              ))}

              <p className={styles.endSectionLabel} style={{ marginTop: 20 }}>FINAL STATE</p>
              <div className={styles.endMeters}>
                <MeterBar label="Bridge of Accord" value={worldState.trust} />
                <MeterBar label="Citadel Beacon" value={worldState.courage} />
                <MeterBar label="Village Quarter" value={worldState.solidarity} />
                <MeterBar label="Fog of the Vale" value={worldState.awareness} />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ── Round view (active or round_complete) ──────────────────────────────

  if (session?.status === 'active' || session?.status === 'round_complete') {
    const currentScenario = getScenarioByRound(pack, session.current_round ?? 1)
    const tally = computeTally()
    const isLastRound = session.current_round >= session.total_rounds

    return (
      <>
        <div className={styles.canvas}>
          <KingdomMap worldState={worldState} />
        </div>

        <div className={styles.topBar}>
          <span className={styles.topRoomCode}>{session.room_code}</span>
          <span className={styles.topRound}>Dilemma {session.current_round} of {session.total_rounds}</span>
          <span className={styles.topStatus}>
            {roundState.roundClosed ? 'The Realm Has Spoken' : 'The Council Deliberates'}
          </span>
        </div>

        <div className={styles.hud}>
          <div className={styles.bottomPanels}>
            {/* Scenario + votes */}
            <div className={`${styles.glassPanel} ${styles.scenarioPanel}`}>
              <p className={styles.scenarioTitle}>
                {currentScenario?.title ?? `Dilemma ${session.current_round}`}
                {currentScenario?.weight && ` — ${currentScenario.weight}`}
              </p>

              {tally.length > 0 && (
                <div className={styles.tallySection}>
                  {tally.map((t, i) => (
                    <div key={i} className={styles.tallyRow}>
                      <span className={styles.tallyLabel}>{t.text}</span>
                      <div className={styles.tallyBarTrack}>
                        <div className={styles.tallyBarFill} style={{ width: `${t.pct}%` }} />
                      </div>
                      <span className={styles.tallyPct}>{t.pct}%</span>
                    </div>
                  ))}
                </div>
              )}

              <p className={styles.submittedCount}>
                {roundState.choices.length} / {players.length} submitted
              </p>
            </div>

            {/* World state meters */}
            <div className={`${styles.glassPanel} ${styles.metersPanel}`}>
              <p className={styles.metersTitle}>The Kingdom</p>
              <div className={styles.metersGrid}>
                <MeterBar label="Bridge of Accord" value={worldState.trust} />
                <MeterBar label="Citadel Beacon" value={worldState.courage} />
                <MeterBar label="Village Quarter" value={worldState.solidarity} />
                <MeterBar label="Fog of the Vale" value={worldState.awareness} />
              </div>
            </div>

            {/* Timer + controls */}
            <div className={`${styles.glassPanel} ${styles.controlPanel}`}>
              <p className={`${styles.timer} ${roundState.timerSeconds <= 10 ? styles.timerDanger : ''}`}>
                {roundState.timerSeconds}
              </p>

              {!roundState.roundClosed ? (
                <button className={styles.actionBtn} onClick={closeRound}>
                  Close Round
                </button>
              ) : isLastRound ? (
                <button
                  className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                  onClick={endSession}
                  disabled={endingSession}
                >
                  {endingSession ? 'Ending...' : 'End Game'}
                </button>
              ) : (
                <button className={styles.actionBtn} onClick={nextRound}>
                  Next Round
                </button>
              )}
            </div>
          </div>
        </div>
      </>
    )
  }

  // ── Lobby view ─────────────────────────────────────────────────────────

  return (
    <>
      <div className={styles.canvas}>
        <KingdomMap worldState={worldState} />
      </div>

      <div className={styles.lobbyOverlay}>
        <p className={styles.lobbyRoomLabel}>CHAMBER CODE</p>
        <div className={styles.lobbyRoomCode}>{session?.room_code}</div>

        <div className={styles.lobbyCard}>
          <PlayerRoster players={players} />
          <p className={styles.lobbyPlayerCount}>
            {players.length} player{players.length !== 1 ? 's' : ''} joined
          </p>

          {started ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Game started</p>
          ) : (
            <button
              className={styles.actionBtn}
              disabled={players.length < 1}
              onClick={startGame}
            >
              Start Game ({players.length} player{players.length !== 1 ? 's' : ''})
            </button>
          )}
        </div>
      </div>
    </>
  )
}
