import { useState, useEffect, useRef, useReducer } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { getPackById, getDefaultPack, getScenarioByRound, getPlayableScenarios } from '../lib/scenarios.js'
import { applyChoicesToWorld } from '../lib/worldState.js'
import { computeProfile, findConflicts, findMoralConflicts } from '../lib/detection.js'
import { getBreakFlagForChoice } from '../lib/breakFlags.js'
import styles from './HostRemote.module.css'

const TIMER_PRESETS = [30, 45, 60, 90, 120]

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
    case 'CHOICE_RECEIVED': {
      if (state.choices.some(c => c.id === action.choice.id)) return state
      return { ...state, choices: [...state.choices, action.choice] }
    }
    case 'TICK':
      return { ...state, timerSeconds: Math.max(0, state.timerSeconds - 1) }
    case 'EXTEND':
      return { ...state, timerSeconds: state.timerSeconds + action.seconds }
    case 'ROUND_CLOSE':
      return { ...state, timerRunning: false, roundClosed: true }
    case 'RESET':
      return initialRoundState
    default:
      return state
  }
}

export default function HostRemote() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [pack, setPack] = useState(null)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [started, setStarted] = useState(false)
  const [nextTimerDuration, setNextTimerDuration] = useState(60)
  const [endingSession, setEndingSession] = useState(false)

  const [roundState, dispatch] = useReducer(roundReducer, initialRoundState)
  const timerChannelRef = useRef(null)
  const remoteChannelRef = useRef(null)

  // ── Auth check ──────────────────────────────────────────────────────
  useEffect(() => {
    const isRemote = localStorage.getItem('host_remote')
    if (!isRemote) { navigate('/'); return }
  }, [navigate])

  // ── Load session + pack + players ───────────────────────────────────
  useEffect(() => {
    if (!sessionId) return

    Promise.all([
      supabase.from('sessions').select('*').eq('id', sessionId).single(),
      supabase.from('players').select('*').eq('session_id', sessionId)
    ]).then(([{ data: sess }, { data: playerList }]) => {
      if (!sess) { navigate('/'); return }
      setSession(sess)
      const p = sess.pack_id ? getPackById(sess.pack_id) : getDefaultPack()
      setPack(p)
      setPlayers(playerList ?? [])
      if (sess.status !== 'lobby') setStarted(true)
      setLoading(false)
    })
  }, [sessionId, navigate])

  // ── Subscriptions ───────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return

    // Session updates
    const sessCh = supabase.channel(`remote-session:${sessionId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` },
        (payload) => setSession(payload.new))
      .subscribe()

    // Player joins
    const playerCh = supabase.channel(`remote-players:${sessionId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'players', filter: `session_id=eq.${sessionId}` },
        (payload) => setPlayers(prev => [...prev, payload.new]))
      .subscribe()

    return () => {
      supabase.removeChannel(sessCh)
      supabase.removeChannel(playerCh)
    }
  }, [sessionId])

  // ── Choices subscription (per round) ────────────────────────────────
  useEffect(() => {
    if (!sessionId || !started || !session?.current_round) return

    const ch = supabase.channel(`remote-choices:${sessionId}:r${session.current_round}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'choices', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          if (payload.new.round_number === session.current_round) {
            dispatch({ type: 'CHOICE_RECEIVED', choice: payload.new })
          }
        })
      .subscribe()

    return () => supabase.removeChannel(ch)
  }, [sessionId, started, session?.current_round])

  // ── Timer channel (broadcast to players + host screen) ──────────────
  useEffect(() => {
    if (!sessionId) return
    timerChannelRef.current = supabase.channel(`timer:${sessionId}`)
    timerChannelRef.current.subscribe()
    return () => { if (timerChannelRef.current) supabase.removeChannel(timerChannelRef.current) }
  }, [sessionId])

  // ── Remote command channel ──────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return
    remoteChannelRef.current = supabase.channel(`remote:${sessionId}`)
    remoteChannelRef.current.subscribe()
    return () => { if (remoteChannelRef.current) supabase.removeChannel(remoteChannelRef.current) }
  }, [sessionId])

  // ── Timer tick ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!roundState.timerRunning || roundState.timerSeconds <= 0) return
    const interval = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => clearInterval(interval)
  }, [roundState.timerRunning, roundState.timerSeconds])

  // ── Auto-close at 0 ────────────────────────────────────────────────
  useEffect(() => {
    if (roundState.timerSeconds === 0 && roundState.timerRunning) closeRound()
  }, [roundState.timerSeconds, roundState.timerRunning])

  // ── Broadcast timer ─────────────────────────────────────────────────
  useEffect(() => {
    if (timerChannelRef.current && roundState.timerRunning) {
      timerChannelRef.current.send({
        type: 'broadcast', event: 'timer',
        payload: { remaining: roundState.timerSeconds, total: nextTimerDuration }
      })
    }
  }, [roundState.timerSeconds, roundState.timerRunning, nextTimerDuration])

  // ── Sync with session status changes ────────────────────────────────
  useEffect(() => {
    if (!session) return
    if (session.status === 'active' && roundState.roundClosed) {
      // Host screen or another source advanced the round
      const scenario = pack ? getScenarioByRound(pack, session.current_round) : null
      const duration = scenario?.timerSeconds ?? nextTimerDuration
      dispatch({ type: 'ROUND_START', duration })
    }
    if (session.status === 'round_complete' && !roundState.roundClosed) {
      dispatch({ type: 'ROUND_CLOSE' })
    }
  }, [session?.status, session?.current_round])

  // ── Helper: get timer for a round ───────────────────────────────────
  function getScenarioTimer(roundNum) {
    const scenario = pack ? getScenarioByRound(pack, roundNum) : null
    return scenario?.timerSeconds ?? nextTimerDuration
  }

  // ── Controls ────────────────────────────────────────────────────────

  async function startGame() {
    const duration = getScenarioTimer(1)
    dispatch({ type: 'ROUND_START', duration })
    await supabase.from('sessions')
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

    let updatedBreakFlags = session.break_flags ?? {}
    if (pack?.id === 'signal-lost') {
      const round = session.current_round
      roundState.choices.forEach(c => {
        const flag = getBreakFlagForChoice(round, c.choice_index)
        if (flag && !updatedBreakFlags[flag.id]) {
          updatedBreakFlags = { ...updatedBreakFlags, [flag.id]: true }
        }
      })
    }

    await supabase.from('sessions')
      .update({ status: 'round_complete', world_state: newWorldState, break_flags: updatedBreakFlags })
      .eq('id', sessionId)

    // Notify host screen
    if (remoteChannelRef.current) {
      remoteChannelRef.current.send({ type: 'broadcast', event: 'round_closed', payload: {} })
    }
  }

  async function nextRound() {
    const nextRoundNum = session.current_round + 1
    const duration = getScenarioTimer(nextRoundNum)
    dispatch({ type: 'ROUND_START', duration })
    await supabase.from('sessions')
      .update({ status: 'active', current_round: nextRoundNum })
      .eq('id', sessionId)
  }

  async function skipRound() {
    const skipTo = session.current_round + 2
    const totalPlayable = pack ? getPlayableScenarios(pack).length : session.total_rounds
    if (skipTo > totalPlayable) return
    dispatch({ type: 'ROUND_START', duration: getScenarioTimer(skipTo) })
    await supabase.from('sessions')
      .update({ status: 'active', current_round: skipTo })
      .eq('id', sessionId)
  }

  function extendTimer(seconds) {
    dispatch({ type: 'EXTEND', seconds })
    if (remoteChannelRef.current) {
      remoteChannelRef.current.send({ type: 'broadcast', event: 'extend_timer', payload: { seconds } })
    }
  }

  async function endSession() {
    if (endingSession) return
    setEndingSession(true)

    try {
      const [{ data: allPlayers }, { data: allChoices }] = await Promise.all([
        supabase.from('players').select('id, moral_values, moral_stances').eq('session_id', sessionId),
        supabase.from('choices').select('player_id, round_number, choice_index, scenario_id, frameworks').eq('session_id', sessionId)
      ])

      const historyByPlayer = {}
      ;(allChoices ?? []).forEach(c => {
        if (!historyByPlayer[c.player_id]) historyByPlayer[c.player_id] = []
        historyByPlayer[c.player_id].push({
          round: c.round_number, frameworks: c.frameworks,
          choiceIndex: c.choice_index, scenarioId: c.scenario_id
        })
      })

      const updates = (allPlayers ?? []).map(p => {
        const history = historyByPlayer[p.id] ?? []
        const { dominant, counts, trajectory, consistency_score, virtue_streak, virtue_heavy_count } = computeProfile(history)
        const conflicts = findConflicts(history)
        const moralConflicts = findMoralConflicts(history, p.moral_values ?? null, p.moral_stances ?? null)

        return {
          id: p.id, dominant_framework: dominant, conflicts, framework_counts: counts,
          choice_history: history, trajectory, consistency_score, virtue_streak, virtue_heavy_count, moral_conflicts: moralConflicts,
          debrief_context: {
            playerId: p.id, dominantFramework: dominant, frameworkCounts: counts,
            frameworkConflicts: conflicts, moralConflicts, trajectory,
            consistencyScore: consistency_score, virtueStreak: virtue_streak, virtueHeavyCount: virtue_heavy_count,
            moralBaseline: { topValue: p.moral_values?.[0] ?? null, allValues: p.moral_values ?? [], stances: p.moral_stances ?? {} },
            choiceHistory: history.map(c => ({
              round: c.round, scenarioId: c.scenarioId,
              scenarioTitle: pack ? getScenarioByRound(pack, c.round)?.title : null,
              choiceIndex: c.choiceIndex, frameworks: c.frameworks
            }))
          }
        }
      })

      await Promise.all(updates.map(u =>
        supabase.from('players').update({
          dominant_framework: u.dominant_framework, conflicts: u.conflicts,
          framework_counts: u.framework_counts, choice_history: u.choice_history,
          debrief_context: u.debrief_context, trajectory: u.trajectory,
          consistency_score: u.consistency_score, virtue_streak: u.virtue_streak,
          virtue_heavy_count: u.virtue_heavy_count, moral_conflicts: u.moral_conflicts
        }).eq('id', u.id)
      ))

      const groupFrameworkCounts = { consequentialism: 0, deontology: 0, care: 0, virtue: 0 }
      updates.forEach(u => {
        Object.entries(u.framework_counts).forEach(([f, count]) => {
          groupFrameworkCounts[f] = (groupFrameworkCounts[f] || 0) + count
        })
      })

      const notableMoralConflicts = []
      const valueGroups = {}
      updates.forEach(u => {
        const topValue = u.debrief_context.moralBaseline.topValue
        if (!topValue) return
        if (!valueGroups[topValue]) valueGroups[topValue] = { total: 0, conflicted: 0 }
        valueGroups[topValue].total++
        if (u.debrief_context.moralConflicts.length > 0) valueGroups[topValue].conflicted++
      })
      Object.entries(valueGroups).forEach(([value, g]) => {
        if (g.conflicted > 0) notableMoralConflicts.push({
          description: `${g.conflicted} of ${g.total} who ranked ${value} #1 made conflicting choices`,
          playerCount: g.conflicted, totalWithValue: g.total
        })
      })

      await supabase.from('sessions').update({
        status: 'finished',
        group_debrief_context: {
          packId: pack?.id, packName: pack?.name, totalPlayers: (allPlayers ?? []).length,
          frameworkBreakdown: groupFrameworkCounts,
          finalWorldState: session?.world_state, notableMoralConflicts
        }
      }).eq('id', sessionId)

    } catch (err) {
      console.error('End session failed:', err)
      setEndingSession(false)
    }
  }

  // ── Derived state ───────────────────────────────────────────────────
  const currentScenario = session?.current_round && pack
    ? getScenarioByRound(pack, session.current_round)
    : null
  const totalPlayable = pack ? getPlayableScenarios(pack).length : (session?.total_rounds ?? 8)
  const isLastRound = session?.current_round >= totalPlayable
  const votesIn = roundState.choices.length
  const totalPlayers = players.length

  if (loading) return <div className={styles.page}><p className={styles.loading}>Connecting...</p></div>

  // ── LOBBY ───────────────────────────────────────────────────────────
  if (!started || session?.status === 'lobby') {
    return (
      <div className={styles.page}>
        <div className={styles.panel}>
          <p className={styles.eyebrow}>HOST REMOTE</p>
          <p className={styles.roomCode}>{session?.room_code}</p>
          <p className={styles.stat}>{totalPlayers} player{totalPlayers !== 1 ? 's' : ''} joined</p>
          <button
            className={styles.primaryBtn}
            onClick={startGame}
            disabled={totalPlayers < 1}
          >
            START GAME
          </button>
        </div>
      </div>
    )
  }

  // ── FINISHED ────────────────────────────────────────────────────────
  if (session?.status === 'finished') {
    return (
      <div className={styles.page}>
        <div className={styles.panel}>
          <p className={styles.eyebrow}>SESSION COMPLETE</p>
          <p className={styles.stat}>{totalPlayers} senators played {session.current_round} rounds</p>
          <p className={styles.finishedText}>Profiles delivered. The record is public.</p>
        </div>
      </div>
    )
  }

  // ── ACTIVE ROUND ────────────────────────────────────────────────────
  if (session?.status === 'active') {
    return (
      <div className={styles.page}>
        <div className={styles.panel}>
          <p className={styles.eyebrow}>ROUND {session.current_round} OF {totalPlayable}</p>
          <p className={styles.scenarioTitle}>{currentScenario?.title ?? 'Loading...'}</p>

          <div className={styles.timerBlock}>
            <span className={`${styles.timerNum} ${roundState.timerSeconds <= 10 ? styles.timerDanger : ''}`}>
              {roundState.timerSeconds}s
            </span>
            <button className={styles.smallBtn} onClick={() => extendTimer(30)}>+30s</button>
          </div>

          <p className={styles.stat}>{votesIn} / {totalPlayers} voted</p>

          <button className={styles.primaryBtn} onClick={closeRound} disabled={roundState.roundClosed}>
            CLOSE ROUND
          </button>

          <div className={styles.presetRow}>
            <p className={styles.presetLabel}>NEXT ROUND TIMER</p>
            <div className={styles.presets}>
              {TIMER_PRESETS.map(t => (
                <button
                  key={t}
                  className={`${styles.presetBtn} ${nextTimerDuration === t ? styles.presetActive : ''}`}
                  onClick={() => setNextTimerDuration(t)}
                >
                  {t}s
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── ROUND COMPLETE ──────────────────────────────────────────────────
  if (session?.status === 'round_complete') {
    const choiceCounts = {}
    roundState.choices.forEach(c => {
      choiceCounts[c.choice_index] = (choiceCounts[c.choice_index] ?? 0) + 1
    })

    return (
      <div className={styles.page}>
        <div className={styles.panel}>
          <p className={styles.eyebrow}>ROUND {session.current_round} COMPLETE</p>

          {currentScenario?.choices?.map((choice, i) => {
            const count = choiceCounts[choice.choiceIndex] ?? 0
            const pct = votesIn > 0 ? Math.round((count / votesIn) * 100) : 0
            return (
              <div key={i} className={styles.voteRow}>
                <div className={styles.voteBar} style={{ width: `${pct}%` }} />
                <span className={styles.votePct}>{pct}%</span>
                <span className={styles.voteLabel}>{choice.text.length > 40 ? choice.text.substring(0, 40) + '...' : choice.text}</span>
              </div>
            )
          })}

          <div className={styles.controlRow}>
            {!isLastRound && (
              <button className={styles.primaryBtn} onClick={nextRound}>NEXT ROUND</button>
            )}
            <button className={`${styles.primaryBtn} ${styles.dangerBtn}`} onClick={endSession} disabled={endingSession}>
              {endingSession ? 'ENDING...' : 'END GAME'}
            </button>
          </div>

          {!isLastRound && (
            <button className={styles.smallBtn} onClick={skipRound} style={{ marginTop: 8 }}>
              SKIP NEXT ROUND
            </button>
          )}

          <div className={styles.presetRow}>
            <p className={styles.presetLabel}>NEXT ROUND TIMER</p>
            <div className={styles.presets}>
              {TIMER_PRESETS.map(t => (
                <button
                  key={t}
                  className={`${styles.presetBtn} ${nextTimerDuration === t ? styles.presetActive : ''}`}
                  onClick={() => setNextTimerDuration(t)}
                >
                  {t}s
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <div className={styles.page}><p className={styles.loading}>Syncing...</p></div>
}
