import { useState, useEffect, useReducer, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { supabase } from '../lib/supabase.js'
import { getPackById, getScenarioByRound } from '../lib/scenarios.js'
import { getAxisLabels } from '../lib/axisConstants.js'
import { getProfileById } from '../lib/senatorProfiles.js'
import { applyChoicesToWorld, computeNarrative } from '../lib/worldState.js'
import { getBreakFlagForChoice } from '../lib/breakFlags.js'
import { computeProfile, findConflicts, findMoralConflicts } from '../lib/detection.js'
import { FRAMEWORKS } from '../lib/frameworks.js'
import PlayerRoster from '../components/PlayerRoster.jsx'
import MeterBar from '../components/MeterBar.jsx'
import AnimatedMap from '../components/AnimatedMap.jsx'
import HowOthersChose from '../components/HowOthersChose.jsx'
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
    case 'EXTEND':
      return { ...state, timerSeconds: state.timerSeconds + (action.seconds ?? 30) }
    case 'SYNC':
      return { ...state, timerSeconds: action.seconds }
    case 'ROUND_CLOSE':
      return { ...state, timerRunning: false, roundClosed: true }
    case 'RESET':
      return initialRoundState
    default:
      return state
  }
}

// ─── Host component ────────────────────────────────────────────────────────

const hostVariants = {
  initial: { opacity: 0, scale: 1.02 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, transition: { duration: 0.4, ease: [0.4, 0, 1, 1] } }
}

export default function Host() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()
  const motionProps = shouldReduceMotion ? {} : { variants: hostVariants, initial: 'initial', animate: 'animate', exit: 'exit' }

  const [session, setSession] = useState(null)
  const [pack, setPack] = useState(null)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [started, setStarted] = useState(false)
  const [timerDuration, setTimerDuration] = useState(60)

  const [roundState, dispatch] = useReducer(roundReducer, initialRoundState)

  const [endingSession, setEndingSession] = useState(false)
  const [endSessionError, setEndSessionError] = useState(false)
  const [reflections, setReflections] = useState([])

  // Reveal beat state machine
  const [revealPhase, setRevealPhase] = useState('idle') // 'idle' | 'revealing' | 'revealed'
  const [showTally, setShowTally] = useState(false)
  const [showLesson, setShowLesson] = useState(false)
  const [showHowOthers, setShowHowOthers] = useState(false)
  const timerChannelRef = useRef(null)
  const lerpSpeedRef = useRef(2)
  const prevWorldRef = useRef(null)

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
        setPack(getPackById(data.pack_id))
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
      .on('broadcast', { event: 'timer' }, (payload) => {
        // Sync with remote's timer broadcast to stay aligned
        const remote = payload.payload?.remaining
        if (remote !== undefined && Math.abs(remote - roundState.timerSeconds) > 2) {
          // Only correct if drift > 2 seconds to avoid jitter
          dispatch({ type: 'SYNC', seconds: remote })
        }
      })
    timerChannelRef.current.subscribe()
    return () => {
      if (timerChannelRef.current) {
        supabase.removeChannel(timerChannelRef.current)
      }
    }
  }, [sessionId])

  // ── React to remote-driven status changes ──────────────────────────────
  useEffect(() => {
    if (!session) return
    if (session.status === 'active') {
      // Remote advanced to next round — clear overlays
      setShowLesson(false)
      setShowTally(false)
      setShowHowOthers(false)
      setRevealPhase('idle')
    }
    if (session.status === 'round_complete' && !roundState.roundClosed) {
      // Remote closed the round
      dispatch({ type: 'ROUND_CLOSE' })
      setRevealPhase('revealing')
      lerpSpeedRef.current = 8
      setTimeout(() => { setRevealPhase('revealed'); lerpSpeedRef.current = 2 }, 2500)
      setTimeout(() => { setShowLesson(true); setShowHowOthers(true) }, 3000)
    }
  }, [session?.status, session?.current_round])

  // ── Remote command listener ─────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return
    const remoteCh = supabase.channel(`remote:${sessionId}`)
      .on('broadcast', { event: 'extend_timer' }, (payload) => {
        const seconds = payload.payload?.seconds ?? 30
        dispatch({ type: 'EXTEND', seconds })
      })
      .on('broadcast', { event: 'set_timer' }, (payload) => {
        const duration = payload.payload?.duration ?? 60
        setTimerDuration(duration)
      })
      .subscribe()
    return () => supabase.removeChannel(remoteCh)
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
    const choiceCount = currentScenario.choices.length
    const counts = new Array(choiceCount).fill(0)
    roundState.choices.forEach(c => {
      if (c.choice_index >= 0 && c.choice_index < choiceCount) counts[c.choice_index]++
    })
    const total = roundState.choices.length
    return currentScenario.choices.map((choice, i) => ({
      text: choice.text,
      count: counts[i],
      pct: total > 0 ? Math.round((counts[i] / total) * 100) : 0,
      frameworks: choice.frameworks ?? []
    }))
  }

  // ── Framework helpers ──────────────────────────────────────────────────

  function frameworksUsedThisRound(choices, scenario) {
    if (!scenario || !choices.length) return {}
    const counts = {}
    choices.forEach(c => {
      const choice = scenario.choices?.[c.choice_index]
      if (choice?.frameworks) {
        choice.frameworks.forEach(f => {
          counts[f] = (counts[f] ?? 0) + 1
        })
      }
    })
    return counts
  }

  function dominantFrameworkThisRound(fwCounts) {
    const entries = Object.entries(fwCounts)
    if (!entries.length) return null
    return entries.sort((a, b) => b[1] - a[1])[0][0]
  }

  // ── Round control functions ────────────────────────────────────────────

  function getScenarioTimer(roundNum) {
    const scenario = getScenarioByRound(pack, roundNum)
    return scenario?.timerSeconds ?? timerDuration
  }

  async function startGame() {
    dispatch({ type: 'ROUND_START', duration: getScenarioTimer(1) })
    await supabase
      .from('sessions')
      .update({ status: 'active', total_rounds: session.total_rounds, current_round: 1 })
      .eq('id', sessionId)
    setStarted(true)
  }

  async function closeRound() {
    if (roundState.roundClosed) return
    dispatch({ type: 'ROUND_CLOSE' })

    prevWorldRef.current = session.world_state

    const roundIndex = session.current_round - 1
    const newWorldState = applyChoicesToWorld(
      roundState.choices, pack.scenarios, roundIndex, session.world_state
    )

    // Check for break flags triggered this round (Signal Lost)
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

    // Start reveal BEFORE DB write — lerpSpeed=8 must be set before
    // Supabase subscription fires with new world_state (per pitfall 3)
    setRevealPhase('revealing')
    lerpSpeedRef.current = 8

    await supabase.from('sessions')
      .update({ status: 'round_complete', world_state: newWorldState, break_flags: updatedBreakFlags })
      .eq('id', sessionId)

    // After 2.5s: transition to revealed state, slow down lerp
    setTimeout(() => {
      setRevealPhase('revealed')
      lerpSpeedRef.current = 2
    }, 2500)

    // After 3s: auto-show lesson overlay with votes + research comparison
    setTimeout(() => {
      setShowLesson(true)
      setShowHowOthers(true)
    }, 3000)
  }

  async function nextRound() {
    setRevealPhase('idle')
    setShowTally(false)
    setShowLesson(false)
    setShowHowOthers(false)
    dispatch({ type: 'ROUND_START', duration: getScenarioTimer(session.current_round + 1) })
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
        supabase.from('players').select('id, moral_values, moral_stances').eq('session_id', sessionId),
        supabase.from('choices').select('player_id, round_number, choice_index, scenario_id, frameworks').eq('session_id', sessionId)
      ])

      if (fetchErr) throw fetchErr
      if (choicesErr) throw choicesErr

      // Build choice_history per player from the choices table
      // (players.choice_history is never written — source of truth is the choices table)
      const historyByPlayer = {}
      ;(allChoices ?? []).forEach(c => {
        if (!historyByPlayer[c.player_id]) historyByPlayer[c.player_id] = []
        historyByPlayer[c.player_id].push({
          round: c.round_number,
          frameworks: c.frameworks,
          choiceIndex: c.choice_index,
          scenarioId: c.scenario_id
        })
      })

      const WEIGHT_MAP = { low: 1, medium: 2, heavy: 3, reflective: 0 }

      const updates = allPlayers.map(p => {
        const rawHistory = historyByPlayer[p.id] ?? []
        const history = rawHistory.map(entry => ({
          ...entry,
          moral_weight: WEIGHT_MAP[getScenarioByRound(pack, entry.round)?.weight] ?? 1
        }))
        const { dominant, counts, leastUsed, trajectory, consistency_score, virtue_streak, virtue_heavy_count } = computeProfile(history)
        const conflicts = findConflicts(history)
        const moralConflicts = findMoralConflicts(history, p.moral_values ?? null, p.moral_stances ?? null)

        const debriefContext = {
          playerId: p.id,
          dominantFramework: dominant,
          frameworkCounts: counts,
          frameworkConflicts: conflicts,
          moralConflicts: moralConflicts,
          trajectory: trajectory,
          consistencyScore: consistency_score,
          virtueStreak: virtue_streak,
          virtueHeavyCount: virtue_heavy_count,
          moralBaseline: {
            topValue: p.moral_values?.[0] ?? null,
            allValues: p.moral_values ?? [],
            stances: p.moral_stances ?? {}
          },
          choiceHistory: history.map(c => ({
            round: c.round,
            scenarioId: c.scenarioId,
            scenarioTitle: getScenarioByRound(pack, c.round)?.title ?? ('Dilemma ' + c.round),
            choiceIndex: c.choiceIndex,
            frameworks: c.frameworks
          }))
        }

        return {
          id: p.id,
          dominant_framework: dominant,
          conflicts: conflicts,
          framework_counts: counts,
          choice_history: history,
          debrief_context: debriefContext,
          trajectory: trajectory,
          consistency_score: consistency_score,
          virtue_streak: virtue_streak,
          virtue_heavy_count: virtue_heavy_count,
          moral_conflicts: moralConflicts
        }
      })

      await Promise.all(
        updates.map(u =>
          supabase.from('players')
            .update({
              dominant_framework: u.dominant_framework,
              conflicts: u.conflicts,
              framework_counts: u.framework_counts,
              choice_history: u.choice_history,
              debrief_context: u.debrief_context,
              trajectory: u.trajectory,
              consistency_score: u.consistency_score,
              virtue_streak: u.virtue_streak,
              virtue_heavy_count: u.virtue_heavy_count,
              moral_conflicts: u.moral_conflicts
            })
            .eq('id', u.id)
        )
      )

      // Aggregate framework breakdown across all players for group debrief
      const groupFrameworkCounts = { consequentialism: 0, deontology: 0, care: 0, virtue: 0 }
      updates.forEach(u => {
        Object.entries(u.framework_counts).forEach(([f, count]) => {
          groupFrameworkCounts[f] = (groupFrameworkCounts[f] || 0) + count
        })
      })

      // Notable moral conflicts: group patterns by top value
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
        if (g.conflicted > 0) {
          notableMoralConflicts.push({
            description: `${g.conflicted} of ${g.total} players who ranked ${value} #1 made choices that conflicted with that value`,
            playerCount: g.conflicted,
            totalWithValue: g.total
          })
        }
      })

      const groupDebriefContext = {
        packId: pack.id,
        packName: pack.name,
        totalPlayers: allPlayers.length,
        frameworkBreakdown: groupFrameworkCounts,
        finalWorldState: session?.world_state ?? (pack?.defaultWorldState ?? { trust: 50, courage: 50, solidarity: 50, awareness: 50 }),
        notableMoralConflicts
      }

      await supabase.from('sessions')
        .update({ status: 'finished', group_debrief_context: groupDebriefContext })
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
      <motion.div className={styles.loadingOverlay} {...motionProps}>
        <p className={styles.loadingText}>Loading...</p>
      </motion.div>
    )
  }

  if (!pack) {
    return (
      <motion.div className={styles.loadingOverlay} {...motionProps}>
        <p className={styles.loadingText}>Loading...</p>
      </motion.div>
    )
  }

  const defaultWorld = pack?.defaultWorldState ?? { trust: 50, courage: 50, solidarity: 50, awareness: 50 }
  const worldState = session?.world_state ?? defaultWorld

  // ── Meter display labels — derived from active pack's axis set ──────
  const METER_LABELS = getAxisLabels(pack)

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
      <motion.div {...motionProps} style={{ position: 'fixed', inset: 0 }}>
        <div className={styles.canvas}>
          <AnimatedMap worldState={worldState} lerpSpeedRef={lerpSpeedRef} breakFlags={session?.break_flags} />
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

              <p className={styles.endSectionLabel} style={{ marginTop: 20 }}>THE RECORD</p>
              <div className={styles.recordLines}>
                {(pack.scenarios ?? []).filter(s => s.choices && s.choices.length > 0).map((scenario, idx) => (
                  <div key={scenario.id} className={styles.recordLine}>
                    <span className={styles.recordRound}>Dilemma {idx + 1}</span>
                    <span className={styles.recordTitle}>{scenario.title}</span>
                  </div>
                ))}
              </div>
              <p className={styles.closingQuestion}>Would you make these choices again?</p>

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
                {Object.entries(METER_LABELS).map(([key, label]) => (
                  <MeterBar key={key} label={label} value={worldState[key] ?? 50} />
                ))}
              </div>

              <button
                className={styles.rubricBtn}
                onClick={() => navigate(`/grading/${sessionId}`)}
                style={{ marginTop: 24 }}
              >
                Grading Rubric
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // ── Round view (active or round_complete) ──────────────────────────────

  if (session?.status === 'active' || session?.status === 'round_complete') {
    const currentScenario = getScenarioByRound(pack, session.current_round ?? 1)
    const isBombshell = currentScenario?.id === 'round-bombshell'
    const tally = computeTally()
    const isLastRound = session.current_round >= session.total_rounds
    const fwCounts = frameworksUsedThisRound(roundState.choices, currentScenario)
    const dominantFw = dominantFrameworkThisRound(fwCounts)
    const prevWorld = prevWorldRef.current

    const axisKeys = Object.keys(METER_LABELS)
    const deltas = prevWorld ? Object.fromEntries(
      axisKeys.map(key => [key, Math.round((worldState[key] ?? 0) - (prevWorld[key] ?? 0))])
    ) : null

    return (
      <motion.div {...motionProps} style={{ position: 'fixed', inset: 0 }}>
        <div className={styles.canvas}>
          <AnimatedMap worldState={worldState} lerpSpeedRef={lerpSpeedRef} breakFlags={session?.break_flags} />
        </div>

        {/* ── Scenario text for presenter ── */}
        {!showLesson && (
          <div className={styles.scenarioOverlay}>
            <p className={styles.scenarioTitle}>{currentScenario?.title ?? `Dilemma ${session.current_round}`}</p>
            <p className={styles.scenarioBody}>{currentScenario?.text}</p>
          </div>
        )}

        {/* ── Top-left pill: room code + round ── */}
        <div className={styles.hudPillTopLeft}>
          <span className={styles.topRoomCode}>{session.room_code}</span>
          <span className={styles.pillDivider}>·</span>
          <span className={styles.topRound}>
            {session.current_round} / {session.total_rounds}
          </span>
        </div>

        {/* ── Top-right pill: status text ── */}
        <div className={styles.hudPillTopRight}>
          <span className={styles.topStatus}>
            {revealPhase === 'revealing'
              ? (isBombshell ? 'The Throne Speaks...' : 'The Realm Shifts...')
              : revealPhase === 'revealed'
                ? (isBombshell ? 'The Throne Has Spoken' : 'The Realm Has Spoken')
                : (isBombshell ? 'The Final Reckoning' : 'The Council Deliberates')}
          </span>
        </div>

        {/* ── Bottom-center pill: timer + submitted ── */}
        <div className={styles.hudPillBottomCenter}>
          <span className={`${styles.timerInline} ${roundState.timerSeconds <= 10 && !roundState.roundClosed ? styles.timerDanger : ''}`}>
            {roundState.roundClosed ? '—' : roundState.timerSeconds}
          </span>
          <span className={styles.pillDivider}>·</span>
          <span className={styles.submittedInline}>
            {roundState.choices.length}/{players.length}
          </span>
        </div>

        {/* ── Bottom-left pill: vote tally toggle + research toggle ── */}
        <div className={styles.hudPillBottomLeft}>
          <button
            className={styles.hudBtn}
            onClick={() => setShowTally(v => !v)}
          >
            {showTally ? 'Hide Votes' : 'Votes'}
          </button>
          {roundState.roundClosed && (
            <button
              className={styles.hudBtn}
              style={{ marginLeft: 8 }}
              onClick={() => setShowHowOthers(v => !v)}
            >
              {showHowOthers ? 'Hide Research' : 'Research'}
            </button>
          )}
        </div>

        {/* ── Bottom-right pill: status only (controls moved to remote) ── */}
        <div className={styles.hudPillBottomRight}>
          {revealPhase === 'revealing' && (
            <span className={styles.revealingText}>...</span>
          )}
        </div>

        {/* ── Delta pills row (appear after reveal) ── */}
        <AnimatePresence>
          {revealPhase === 'revealed' && deltas && (
            <motion.div
              className={styles.deltaPillsRow}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {Object.entries(deltas).filter(([, v]) => v !== 0).map(([key, val]) => (
                <div key={key} className={`${styles.deltaPill} ${val > 0 ? styles.deltaUp : styles.deltaDown}`}>
                  <span className={styles.deltaLabel}>{METER_LABELS[key]}</span>
                  <span className={styles.deltaValue}>{val > 0 ? '+' : ''}{val}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Vote tally overlay (toggle-on) ── */}
        <AnimatePresence>
          {showTally && tally.length > 0 && (
            <motion.div
              className={styles.tallyOverlay}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
            >
              <p className={styles.tallyTitle}>
                {currentScenario?.title ?? `Dilemma ${session.current_round}`}
              </p>
              {tally.map((t, i) => (
                <div key={i} className={styles.tallyRow}>
                  <span className={styles.tallyLabel}>
                    {t.text}
                    {roundState.roundClosed && (
                      <span className={styles.tallyFramework}>
                        {' '}{t.frameworks.map(f => FRAMEWORKS[f]?.name).join(' + ')}
                      </span>
                    )}
                  </span>
                  <div className={styles.tallyBarTrack}>
                    <div className={styles.tallyBarFill} style={{ width: `${t.pct}%` }} />
                  </div>
                  <span className={styles.tallyPct}>{t.pct}%</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── How Others Chose overlay (only when lesson is NOT showing) ── */}
        <AnimatePresence>
          {showHowOthers && !showLesson && (
            <motion.div
              className={styles.howOthersOverlay}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
            >
              <HowOthersChose
                scenarioId={currentScenario?.id}
                liveChoices={roundState.choices}
                totalPlayers={players.length}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Lesson overlay — moral tension + research comparison ── */}
        <AnimatePresence>
          {showLesson && (
            <>
              <motion.div
                className={styles.lessonBackdrop}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
              <motion.div
                className={styles.lessonOverlay}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <p className={styles.lessonLabel}>{isBombshell ? 'THE VERDICT' : 'THE LESSON'}</p>
                <p className={styles.lessonTitle}>{currentScenario?.moralTension}</p>
                <p className={styles.lessonBody}>{currentScenario?.teaches}</p>

                {dominantFw && (
                  <p className={styles.frameworkCallout}>
                    Most chose: <strong>{FRAMEWORKS[dominantFw]?.name}</strong>
                    {' — '}{FRAMEWORKS[dominantFw]?.question}
                  </p>
                )}

                {/* Conflict spotlight — cross-profile tension */}
                {currentScenario?.conflictSpotlight && (
                  <div className={styles.spotlightCallout}>
                    <p className={styles.spotlightLabel}>SPOTLIGHT</p>
                    <p className={styles.spotlightText}>{currentScenario.conflictSpotlight.description}</p>
                  </div>
                )}

                {/* Discussion prompts — host talking points */}
                {currentScenario?.discussionPrompts?.length > 0 && (
                  <div className={styles.discussionPrompts}>
                    <p className={styles.discussionLabel}>DISCUSSION</p>
                    {currentScenario.discussionPrompts.map((prompt, i) => (
                      <p key={i} className={styles.discussionItem}>{prompt}</p>
                    ))}
                  </div>
                )}

                {/* Host notes — presenter cheat sheet */}
                {currentScenario?.hostNotes?.length > 0 && (
                  <details className={styles.hostNotes}>
                    <summary className={styles.hostNotesLabel}>HOST NOTES</summary>
                    {currentScenario.hostNotes.map((note, i) => (
                      <p key={i} className={styles.hostNoteItem}>{note}</p>
                    ))}
                  </details>
                )}

                <div className={styles.lessonResearch}>
                  <HowOthersChose
                    scenarioId={currentScenario?.id}
                    liveChoices={roundState.choices}
                    totalPlayers={players.length}
                  />
                </div>

                {/* Controls moved to phone remote — lesson stays visible until remote advances */}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // ── Lobby view ─────────────────────────────────────────────────────────

  return (
    <motion.div {...motionProps} style={{ position: 'fixed', inset: 0 }}>
      <div className={styles.canvas}>
        <AnimatedMap worldState={worldState} lerpSpeedRef={lerpSpeedRef} breakFlags={session?.break_flags} />
      </div>

      <div className={styles.lobbyOverlay}>
        <p className={styles.lobbyRoomLabel}>CHAMBER CODE</p>
        <div className={styles.lobbyRoomCode}>{session?.room_code}</div>

        <div className={styles.lobbyCard}>
          <PlayerRoster players={players} />
          <p className={styles.lobbyPlayerCount}>
            {players.length} player{players.length !== 1 ? 's' : ''} joined
          </p>

          <p style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--mono)' }}>
            {started ? 'Game in progress' : 'Waiting for host to start'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
