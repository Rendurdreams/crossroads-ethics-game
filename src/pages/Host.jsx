import { useState, useEffect, useReducer, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase.js'
import { getPackById, getScenarioByRound } from '../lib/scenarios.js'
import { applyChoicesToWorld, computeNarrative } from '../lib/worldState.js'
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

    prevWorldRef.current = session.world_state

    const roundIndex = session.current_round - 1
    const newWorldState = applyChoicesToWorld(
      roundState.choices, pack.scenarios, roundIndex, session.world_state
    )

    // Start reveal BEFORE DB write — lerpSpeed=8 must be set before
    // Supabase subscription fires with new world_state (per pitfall 3)
    setRevealPhase('revealing')
    lerpSpeedRef.current = 8

    await supabase.from('sessions')
      .update({ status: 'round_complete', world_state: newWorldState })
      .eq('id', sessionId)

    // After 2.5s: transition to revealed state, slow down lerp
    setTimeout(() => {
      setRevealPhase('revealed')
      lerpSpeedRef.current = 2
    }, 2500)
  }

  async function nextRound() {
    setRevealPhase('idle')
    setShowTally(false)
    setShowLesson(false)
    setShowHowOthers(false)
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
        finalWorldState: session?.world_state ?? { trust: 50, courage: 50, solidarity: 50, awareness: 50 },
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
      <div className={styles.loadingOverlay}>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    )
  }

  if (!pack) {
    return (
      <div className={styles.loadingOverlay}>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    )
  }

  const worldState = session?.world_state ?? { trust: 50, courage: 50, solidarity: 50, awareness: 50 }

  // ── Meter display labels (value names, not landmark names) ──────────
  const METER_LABELS = { trust: 'Honesty', courage: 'Courage', solidarity: 'Loyalty', awareness: 'Empathy' }

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
          <AnimatedMap worldState={worldState} lerpSpeedRef={lerpSpeedRef} />
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
                <MeterBar label="Honesty" value={worldState.trust} />
                <MeterBar label="Courage" value={worldState.courage} />
                <MeterBar label="Loyalty" value={worldState.solidarity} />
                <MeterBar label="Empathy" value={worldState.awareness} />
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
    const isBombshell = currentScenario?.id === 'round-bombshell'
    const tally = computeTally()
    const isLastRound = session.current_round >= session.total_rounds
    const fwCounts = frameworksUsedThisRound(roundState.choices, currentScenario)
    const dominantFw = dominantFrameworkThisRound(fwCounts)
    const prevWorld = prevWorldRef.current

    const deltas = prevWorld ? {
      trust: Math.round(worldState.trust - prevWorld.trust),
      courage: Math.round(worldState.courage - prevWorld.courage),
      solidarity: Math.round(worldState.solidarity - prevWorld.solidarity),
      awareness: Math.round(worldState.awareness - prevWorld.awareness),
    } : null

    const METER_LABELS = { trust: 'Honesty', courage: 'Courage', solidarity: 'Loyalty', awareness: 'Empathy' }

    return (
      <>
        <div className={styles.canvas}>
          <AnimatedMap worldState={worldState} lerpSpeedRef={lerpSpeedRef} />
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

        {/* ── Bottom-right pill: action button ── */}
        <div className={styles.hudPillBottomRight}>
          {revealPhase === 'idle' && !roundState.roundClosed && (
            <button className={styles.actionBtn} onClick={closeRound}>
              Close Round
            </button>
          )}
          {revealPhase === 'revealing' && (
            <span className={styles.revealingText}>...</span>
          )}
          {revealPhase === 'revealed' && !showLesson && (
            <button
              className={`${styles.actionBtn} ${styles.lessonBtn}`}
              onClick={() => setShowLesson(true)}
            >
              Lesson
            </button>
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

        {/* ── How Others Chose overlay (toggle-on after round close) ── */}
        <AnimatePresence>
          {showHowOthers && (
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

        {/* ── Lesson overlay (manual — D-05 Phase 2, D-11) ── */}
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

                {tally.length > 0 && (
                  <div className={styles.lessonTally}>
                    {tally.map((t, i) => (
                      <div key={i} className={styles.tallyRow}>
                        <span className={styles.tallyLabel}>
                          {t.text}
                          <span className={styles.tallyFramework}>
                            {' '}{t.frameworks.map(f => FRAMEWORKS[f]?.name).join(' + ')}
                          </span>
                        </span>
                        <div className={styles.tallyBarTrack}>
                          <div className={styles.tallyBarFill} style={{ width: `${t.pct}%` }} />
                        </div>
                        <span className={styles.tallyPct}>{t.pct}%</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  className={styles.actionBtn}
                  style={{ marginTop: 32 }}
                  onClick={() => {
                    setShowLesson(false)
                    if (isLastRound) {
                      endSession()
                    } else {
                      nextRound()
                    }
                  }}
                >
                  {isLastRound ? 'End Game' : 'Next Dilemma'}
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    )
  }

  // ── Lobby view ─────────────────────────────────────────────────────────

  return (
    <>
      <div className={styles.canvas}>
        <AnimatedMap worldState={worldState} lerpSpeedRef={lerpSpeedRef} />
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
