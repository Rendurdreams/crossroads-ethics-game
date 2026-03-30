import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { supabase } from '../lib/supabase.js'
import { getPackById, getScenarioByRound, getReflectionScenario } from '../lib/scenarios.js'
import { FRAMEWORKS } from '../lib/frameworks.js'
import { findMoralConflicts } from '../lib/detection.js'
import ScenarioCard from '../components/ScenarioCard.jsx'
import ContentNote from '../components/ContentNote.jsx'
import ConsequenceReveal from '../components/ConsequenceReveal.jsx'
import TimerDisplay from '../components/TimerDisplay.jsx'
import MeterBar from '../components/MeterBar.jsx'
import FrameworkProfile from '../components/FrameworkProfile.jsx'
import styles from './Play.module.css'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } }
}

const roundTransition = {
  exit:    { opacity: 0, transition: { duration: 0.3 } },
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, delay: 0.35 } }
}

export default function Play() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const shouldReduce = useReducedMotion()
  const variants = shouldReduce ? { initial: {}, animate: {}, exit: {} } : pageVariants
  const roundVariants = shouldReduce ? { initial: {}, animate: {}, exit: {} } : roundTransition

  // Existing state
  const [player, setPlayer] = useState(null)
  const [session, setSession] = useState(null)
  const [pack, setPack] = useState(null)
  const [playerCount, setPlayerCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)

  // Round game loop state
  const [lockedChoiceIndex, setLockedChoiceIndex] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [passedRound, setPassedRound] = useState(false)
  const [contentNoteAcknowledged, setContentNoteAcknowledged] = useState(false)
  const [submittedCount, setSubmittedCount] = useState(0)
  const [totalPlayerCount, setTotalPlayerCount] = useState(0)
  const [timerRemaining, setTimerRemaining] = useState(null)
  const [timerTotal, setTimerTotal] = useState(60)
  const [gameFinished, setGameFinished] = useState(false)

  const [reflectionText, setReflectionText] = useState('')
  const [reflectionSubmitted, setReflectionSubmitted] = useState(false)
  const [reflectionSubmitting, setReflectionSubmitting] = useState(false)
  const [reflectionError, setReflectionError] = useState(false)

  // Awareness prompt tracking
  const [promptDismissedRounds, setPromptDismissedRounds] = useState(new Set())
  const [promptShownRounds, setPromptShownRounds] = useState(new Set())

  // Session restore on mount
  useEffect(() => {
    if (!sessionId) return

    const storedPlayerId = localStorage.getItem('player_id')
    const storedSessionId = localStorage.getItem('session_id')

    if (storedPlayerId && storedSessionId === sessionId) {
      // Restore from localStorage — verify the player row still exists
      supabase
        .from('players')
        .select('*')
        .eq('id', storedPlayerId)
        .single()
        .then(({ data }) => {
          if (data) {
            setPlayer(data)

            // Fetch current session state
            supabase
              .from('sessions')
              .select('*')
              .eq('id', sessionId)
              .single()
              .then(({ data: sessionData }) => {
                if (sessionData) {
                  setSession(sessionData)
                  setPack(getPackById(sessionData.pack_id))
                  if (sessionData.status !== 'lobby') {
                    setGameStarted(true)
                  }
                  if (sessionData.status === 'finished') {
                    setGameFinished(true)
                    // Re-fetch player row for host-computed profile data (refresh case)
                    supabase
                      .from('players')
                      .select('*')
                      .eq('id', storedPlayerId)
                      .single()
                      .then(({ data: freshPlayer }) => {
                        if (freshPlayer) setPlayer(freshPlayer)
                      })
                  }
                }

                // Fetch player count
                supabase
                  .from('players')
                  .select('id', { count: 'exact' })
                  .eq('session_id', sessionId)
                  .then(({ count }) => {
                    setPlayerCount(count ?? 0)
                    setTotalPlayerCount(count ?? 0)
                    setLoading(false)
                  })
              })
          } else {
            // Stale localStorage — clear and redirect
            localStorage.removeItem('player_id')
            localStorage.removeItem('session_id')
            navigate('/')
          }
        })
    } else {
      // No stored identity for this session — redirect to landing to join
      navigate('/')
    }
  }, [sessionId, navigate])

  // Subscribe to new player joins (live player count)
  useEffect(() => {
    if (!sessionId) return

    const channel = supabase.channel(`play-players:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'players',
          filter: `session_id=eq.${sessionId}`
        },
        () => {
          setPlayerCount(prev => prev + 1)
          setTotalPlayerCount(prev => prev + 1)
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [sessionId])

  // Subscribe to session status changes
  useEffect(() => {
    if (!sessionId) return

    const channel = supabase.channel(`play-session:${sessionId}`)
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
          if (payload.new.status === 'active') {
            setGameStarted(true)
          }
          if (payload.new.status === 'finished') {
            setGameFinished(true)
            // Re-fetch player row with host-computed profile data
            supabase
              .from('players')
              .select('*')
              .eq('id', player?.id)
              .single()
              .then(({ data }) => {
                if (data) setPlayer(data)
              })
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [sessionId])

  // Subscribe to choices for submitted count
  useEffect(() => {
    if (!sessionId || !session?.current_round) return

    const currentRound = session.current_round

    // Fetch initial submitted count for this round
    supabase
      .from('choices')
      .select('id', { count: 'exact' })
      .eq('session_id', sessionId)
      .eq('round_number', currentRound)
      .then(({ count }) => {
        setSubmittedCount(count ?? 0)
      })

    const channel = supabase.channel(`play-choices:${sessionId}:r${currentRound}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'choices',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          if (payload.new.round_number === currentRound) {
            setSubmittedCount(prev => prev + 1)
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [sessionId, session?.current_round])

  // Subscribe to broadcast timer from host
  useEffect(() => {
    if (!sessionId || !gameStarted) return

    const channel = supabase.channel(`timer:${sessionId}`)
      .on('broadcast', { event: 'timer' }, (payload) => {
        setTimerRemaining(payload.payload.remaining)
        setTimerTotal(payload.payload.total)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [sessionId, gameStarted])

  // Reset round state when round changes
  useEffect(() => {
    setLockedChoiceIndex(null)
    setSubmitting(false)
    setSubmitError(false)
    setPassedRound(false)
    setContentNoteAcknowledged(false)
    setSubmittedCount(0)
  }, [session?.current_round])

  // Track awareness prompt shown state for logging
  useEffect(() => {
    if (!session?.current_round || !player?.moral_values) return
    const topVal = player.moral_values[0]
    const ltp = player.moral_stances?.lie_to_protect
    if (topVal !== 'honesty' || ltp !== 'no') return
    const currentPack = pack
    if (!currentPack) return
    const scenario = getScenarioByRound(currentPack, session.current_round)
    const hasCare = scenario?.choices?.some(c => (c.frameworks ?? []).includes('care'))
    if (hasCare && !promptShownRounds.has(session.current_round)) {
      setPromptShownRounds(prev => new Set(prev).add(session.current_round))
    }
  }, [session?.current_round, player?.moral_values, pack])

  // Choice submission handler
  async function handleChoice(choiceIndex) {
    if (lockedChoiceIndex !== null || submitting) return
    setLockedChoiceIndex(choiceIndex)
    setSubmitting(true)
    setSubmitError(false)

    const currentScenario = getScenarioByRound(pack, session.current_round)
    const { error } = await supabase.from('choices').insert({
      session_id: sessionId,
      player_id: player.id,
      round_number: session.current_round,
      scenario_id: currentScenario.id,
      choice_index: choiceIndex,
      frameworks: currentScenario.choices[choiceIndex].frameworks
    })

    setSubmitting(false)
    if (error) {
      if (error.code !== '23505') {
        // 23505 = UNIQUE violation = already submitted, keep locked
        setLockedChoiceIndex(null)
        setSubmitError(true)
      }
    }

    // Log awareness prompt flags if applicable (non-blocking)
    if (!error && promptShownRounds.has(session.current_round)) {
      const wasPromptDismissed = promptDismissedRounds.has(session.current_round)
      supabase.from('players').update({
        awareness_log: [
          ...(player?.awareness_log ?? []),
          {
            round: session.current_round,
            awareness_prompt_shown: true,
            awareness_prompt_dismissed: wasPromptDismissed
          }
        ]
      }).eq('id', player.id).then(() => {})
    }
  }

  // Reflection submit handler
  async function handleReflectionSubmit() {
    if (reflectionSubmitting || reflectionText.trim().length === 0) return
    setReflectionSubmitting(true)
    setReflectionError(false)

    const { error } = await supabase.from('reflections').insert({
      session_id: sessionId,
      player_id: player.id,
      round_number: 6,
      text: reflectionText.trim()
    })

    setReflectionSubmitting(false)
    if (error) {
      setReflectionError(true)
    } else {
      setReflectionSubmitted(true)
    }
  }

  // Atmosphere warmth computation
  function computeWarmth(worldState) {
    if (!worldState) return 0.5
    return (worldState.trust + worldState.courage + worldState.solidarity + worldState.awareness) / 400
  }

  // --- Render ---

  if (loading) {
    return (
      <motion.div
        className={styles.page}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <p className={styles.waiting}>Loading...</p>
      </motion.div>
    )
  }

  if (!pack) {
    return (
      <motion.div
        className={styles.page}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <p className={styles.waiting}>Loading...</p>
      </motion.div>
    )
  }

  // Lobby waiting view
  if (!gameStarted) {
    return (
      <motion.div
        className={styles.page}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ '--atmosphere-warmth': 0.5 }}
      >
        <div className={styles.avatar}>{player?.avatar}</div>
        <div className={styles.name}>{player?.name}</div>
        <p className={styles.waiting}>The council assembles.</p>
        <p className={styles.count}>{playerCount} councillor{playerCount !== 1 ? 's' : ''} present</p>
        {session?.room_code && (
          <p className={styles.roomReminder}>Chamber: {session.room_code}</p>
        )}
      </motion.div>
    )
  }

  // Game finished view — FrameworkProfile + optional reflection input
  if (gameFinished || session?.status === 'finished') {
    const showReflection = pack !== null && getReflectionScenario(pack) !== null
    const reflectionQuestion = getReflectionScenario(pack)?.text ?? ''
    const warmth = computeWarmth(session?.world_state)

    return (
      <motion.div
        className={styles.page}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ '--atmosphere-warmth': warmth }}
      >
        <div className={styles.profileWrapper}>
          <FrameworkProfile player={player} pack={pack} />

          {showReflection && (
            <motion.div
              className={styles.reflectionSection}
              initial={shouldReduce ? {} : { opacity: 0, y: 12 }}
              animate={shouldReduce ? {} : { opacity: 1, y: 0 }}
              transition={shouldReduce ? { duration: 0 } : { duration: 0.5, delay: 0.8 }}
            >
              <p className={styles.reflectionLabel}>ONE LAST QUESTION</p>
              <p className={styles.reflectionQuestion}>{reflectionQuestion}</p>

              {reflectionSubmitted ? (
                <p className={styles.reflectionDone}>Submitted. Thank you.</p>
              ) : (
                <>
                  <textarea
                    className={styles.reflectionTextarea}
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder="Take your time..."
                    rows={5}
                  />
                  {reflectionError && (
                    <p className={styles.reflectionError}>
                      Couldn&apos;t save your reflection. Tap to try again.
                    </p>
                  )}
                  <button
                    className={styles.reflectionSubmitBtn}
                    disabled={reflectionSubmitting || reflectionText.trim().length === 0}
                    onClick={handleReflectionSubmit}
                  >
                    {reflectionSubmitting ? 'Submitting...' : 'Submit Reflection'}
                  </button>
                </>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    )
  }

  const currentScenario = session?.current_round ? getScenarioByRound(pack, session.current_round) : null
  const warmth = computeWarmth(session?.world_state)
  const roundKey = `round-${session?.current_round}-${session?.status}`

  // Round complete — show consequence reveal
  if (session?.status === 'round_complete' && currentScenario) {
    if (passedRound) {
      // Passer still sees world state update, no framework label
      return (
        <motion.div
          className={styles.page}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ '--atmosphere-warmth': warmth }}
        >
          <div className={styles.gameContent}>
            <AnimatePresence mode="wait">
              <motion.div
                key={roundKey}
                variants={roundVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className={styles.passConsequence}>
                  <p className={styles.passConsequenceText}>You have abstained from this decree.</p>
                  <div className={styles.metersSection}>
                    <p className={styles.metersLabel}>THE REALM</p>
                    <div className={styles.meters}>
                      <MeterBar label="Honesty" value={session.world_state?.trust ?? 50} />
                      <MeterBar label="Courage" value={session.world_state?.courage ?? 50} />
                      <MeterBar label="Loyalty" value={session.world_state?.solidarity ?? 50} />
                      <MeterBar label="Empathy" value={session.world_state?.awareness ?? 50} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )
    }

    if (lockedChoiceIndex !== null) {
      const chosenOption = currentScenario.choices[lockedChoiceIndex]
      const frameworkKey = chosenOption.frameworks[0]
      const roundMoralConflict = (() => {
        if (!frameworkKey) return false
        const singleHistory = [{ round: 1, frameworks: [frameworkKey] }]
        const mc = findMoralConflicts(singleHistory, player?.moral_values ?? null, player?.moral_stances ?? null)
        return mc.length > 0
      })()

      return (
        <motion.div
          className={styles.page}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ '--atmosphere-warmth': warmth }}
        >
          <div className={styles.gameContent}>
            <AnimatePresence mode="wait">
              <motion.div
                key={roundKey}
                variants={roundVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <ConsequenceReveal
                  consequence={chosenOption.consequence}
                  framework={frameworkKey}
                  worldState={session.world_state ?? { trust: 50, courage: 50, solidarity: 50, awareness: 50 }}
                  moralValues={player?.moral_values ?? null}
                  moralStances={player?.moral_stances ?? null}
                  hasMoralConflict={roundMoralConflict}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )
    }

    // Player didn't submit before round closed
    return (
      <motion.div
        className={styles.page}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ '--atmosphere-warmth': warmth }}
      >
        <div className={styles.gameContent}>
          <AnimatePresence mode="wait">
            <motion.div
              key={roundKey}
              variants={roundVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className={styles.passConsequence}>
                <p className={styles.passConsequenceText}>The decree was sealed before your counsel arrived.</p>
                <div className={styles.metersSection}>
                  <p className={styles.metersLabel}>THE REALM</p>
                  <div className={styles.meters}>
                    <MeterBar label="Honesty" value={session.world_state?.trust ?? 50} />
                    <MeterBar label="Courage" value={session.world_state?.courage ?? 50} />
                    <MeterBar label="Loyalty" value={session.world_state?.solidarity ?? 50} />
                    <MeterBar label="Empathy" value={session.world_state?.awareness ?? 50} />
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    )
  }

  // Active round view
  if (session?.status === 'active' && currentScenario) {
    // Round 6 detection — show reflection textarea instead of ScenarioCard
    const isReflectionRound = currentScenario?.choices?.length === 0

    if (isReflectionRound) {
      return (
        <motion.div
          className={styles.page}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ '--atmosphere-warmth': warmth }}
        >
          <div className={styles.gameContent}>
            <AnimatePresence mode="wait">
              <motion.div
                key={roundKey}
                variants={roundVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className={styles.roundHeader}>
                  {player?.avatar && <span className={styles.headerAvatar}>{player.avatar}</span>}
                  <span className={styles.roundLabel}>{`The ${session.current_round}. Decree`}</span>
                </div>

                <p className={styles.reflectionRoundQuestion}>{currentScenario.text}</p>

                {reflectionSubmitted ? (
                  <p className={styles.reflectionDone}>Submitted. Thank you.</p>
                ) : (
                  <>
                    <textarea
                      className={styles.reflectionTextarea}
                      value={reflectionText}
                      onChange={(e) => setReflectionText(e.target.value)}
                      placeholder="Take your time..."
                      rows={5}
                    />
                    <button
                      className={styles.reflectionSubmitBtn}
                      disabled={reflectionSubmitting || reflectionText.trim().length === 0}
                      onClick={handleReflectionSubmit}
                    >
                      {reflectionSubmitting ? 'Submitting...' : 'Submit Reflection'}
                    </button>
                  </>
                )}

                {timerRemaining !== null && (
                  <div className={styles.timerSection}>
                    <TimerDisplay remaining={timerRemaining} total={timerTotal} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )
    }

    // Content note gate for heavy rounds
    if (currentScenario.contentNote && !contentNoteAcknowledged && !passedRound) {
      return (
        <ContentNote
          note={currentScenario.contentNote}
          onContinue={() => setContentNoteAcknowledged(true)}
          onPass={() => setPassedRound(true)}
        />
      )
    }

    // Pass view
    if (passedRound) {
      return (
        <motion.div
          className={styles.page}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ '--atmosphere-warmth': warmth }}
        >
          <div className={styles.gameContent}>
            <div className={styles.passView}>
              <p className={styles.passText}>You have abstained from this decree.</p>
              <p className={styles.passSubtext}>The realm weighs your counsel.</p>
            </div>
            <p className={styles.submittedCounter}>
              <span className={styles.submittedNumber}>{submittedCount}</span>
              {' '}of {totalPlayerCount} submitted
            </p>
            {timerRemaining !== null && (
              <TimerDisplay remaining={timerRemaining} total={timerTotal} />
            )}
          </div>
        </motion.div>
      )
    }

    // Awareness prompt: honesty-first + lie_to_protect=no + care-tagged scenario
    const topValue = player?.moral_values?.[0]
    const lieToProtect = player?.moral_stances?.lie_to_protect
    const scenarioHasCareChoice = currentScenario?.choices?.some(c =>
      (c.frameworks ?? []).includes('care')
    )
    const showAwarenessPrompt = topValue === 'honesty'
      && lieToProtect === 'no'
      && scenarioHasCareChoice
      && !promptDismissedRounds.has(session.current_round)

    // Scenario + choice view
    return (
      <motion.div
        className={styles.page}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ '--atmosphere-warmth': warmth }}
      >
        <div className={styles.gameContent}>
          <AnimatePresence mode="wait">
            <motion.div
              key={roundKey}
              variants={roundVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className={styles.roundHeader}>
                {player?.avatar && <span className={styles.headerAvatar}>{player.avatar}</span>}
                <span className={styles.roundLabel}>The Council Deliberates — Dilemma {session.current_round}</span>
              </div>

              {showAwarenessPrompt && (
                <div
                  className={styles.awarenessPrompt}
                  role="alert"
                  onClick={() => setPromptDismissedRounds(prev => new Set(prev).add(session.current_round))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setPromptDismissedRounds(prev => new Set(prev).add(session.current_round))
                    }
                  }}
                  tabIndex={0}
                >
                  This choice prioritizes loyalty over truth. You declared truth matters most.
                </div>
              )}

              <ScenarioCard
                scenario={currentScenario}
                lockedIndex={lockedChoiceIndex}
                onChoice={handleChoice}
                submitting={submitting}
                submitError={submitError}
              />

              {lockedChoiceIndex !== null && (
                <div className={styles.waitingSection}>
                  <p className={styles.waitingText}>Awaiting the council&apos;s judgment.</p>
                  <p className={styles.submittedCounter}>
                    <span className={styles.submittedNumber}>{submittedCount}</span>
                    {' '}of {totalPlayerCount} submitted
                  </p>
                </div>
              )}

              {timerRemaining !== null && (
                <div className={styles.timerSection}>
                  <TimerDisplay remaining={timerRemaining} total={timerTotal} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    )
  }

  // Fallback / transitional state
  return (
    <motion.div
      className={styles.page}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <p className={styles.waiting}>Waiting...</p>
    </motion.div>
  )
}
