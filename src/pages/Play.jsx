import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { supabase } from '../lib/supabase.js'
import { getPackById, getDefaultPack, getScenarioByRound, getReflectionScenario } from '../lib/scenarios.js'
import { generateScribeRecord } from '../lib/scribeRecord.js'
import { getProfileById } from '../lib/senatorProfiles.js'
import { getBreakFlagForChoice } from '../lib/breakFlags.js'
import { FRAMEWORKS } from '../lib/frameworks.js'
import { findMoralConflicts } from '../lib/detection.js'
import ScenarioCard from '../components/ScenarioCard.jsx'
import ContentNote from '../components/ContentNote.jsx'
import ConsequenceReveal from '../components/ConsequenceReveal.jsx'
import TimerDisplay from '../components/TimerDisplay.jsx'
import FrameworkProfile from '../components/FrameworkProfile.jsx'
import HowOthersChose from '../components/HowOthersChose.jsx'
import WalkMechanic from '../components/WalkMechanic.jsx'
import styles from './Play.module.css'

const pageVariants = {
  initial: { opacity: 0, y: 30, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } }
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
  const [pack, setPack] = useState(getDefaultPack)
  const [player, setPlayer] = useState(null)
  const [session, setSession] = useState(null)
  const [playerCount, setPlayerCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)

  // Round game loop state
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(null)
  const [lockedChoiceIndex, setLockedChoiceIndex] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [passedRound, setPassedRound] = useState(false)
  const [contentNoteAcknowledged, setContentNoteAcknowledged] = useState(false)
  const [roundPhase, setRoundPhase] = useState('stake') // 'stake' | 'dilemma' | 'dashboard'
  const [profileReady, setProfileReady] = useState(false)
  const [submittedCount, setSubmittedCount] = useState(0)
  const [totalPlayerCount, setTotalPlayerCount] = useState(0)
  const [timerRemaining, setTimerRemaining] = useState(null)
  const [timerTotal, setTimerTotal] = useState(60)
  const [gameFinished, setGameFinished] = useState(false)

  const [reflectionText, setReflectionText] = useState('')
  const [reflectionSubmitted, setReflectionSubmitted] = useState(false)
  const [reflectionSubmitting, setReflectionSubmitting] = useState(false)
  const [reflectionError, setReflectionError] = useState(false)

  // How Others Chose state
  const [showHowOthersChose, setShowHowOthersChose] = useState(false)
  const [roundChoicesForComparison, setRoundChoicesForComparison] = useState([])

  // Scribe record — accumulates across rounds, never reset
  const [myChoiceHistory, setMyChoiceHistory] = useState([])

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
                  if (sessionData.pack_id) setPack(getPackById(sessionData.pack_id))
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

                // Restore choice history from Supabase (survives page refresh)
                supabase
                  .from('choices')
                  .select('round_number, choice_index, scenario_id, frameworks')
                  .eq('session_id', sessionId)
                  .eq('player_id', storedPlayerId)
                  .order('round_number')
                  .then(({ data: choicesData }) => {
                    if (choicesData && choicesData.length > 0) {
                      setMyChoiceHistory(choicesData.map(c => ({
                        round: c.round_number,
                        choiceIndex: c.choice_index,
                        scenarioId: c.scenario_id,
                        frameworks: c.frameworks ?? []
                      })))
                    }
                  })

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
          if (payload.new.pack_id) setPack(getPackById(payload.new.pack_id))
          if (payload.new.status === 'active') {
            setGameStarted(true)
          }
          if (payload.new.status === 'round_complete') {
            // Fetch choices for this round to power How Others Chose
            supabase
              .from('choices')
              .select('choice_index')
              .eq('session_id', sessionId)
              .eq('round_number', payload.new.current_round)
              .then(({ data }) => setRoundChoicesForComparison(data ?? []))
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
    setSelectedChoiceIndex(null)
    setLockedChoiceIndex(null)
    setSubmitting(false)
    setSubmitError(false)
    setPassedRound(false)
    setContentNoteAcknowledged(false)
    setRoundPhase('stake')
    setSubmittedCount(0)
    setShowHowOthersChose(false)
    setRoundChoicesForComparison([])
  }, [session?.current_round])

  // Choice submission handler
  function handleChoice(choiceIndex) {
    if (lockedChoiceIndex !== null || submitting) return
    setSelectedChoiceIndex(choiceIndex)
  }

  async function handleSubmitChoice() {
    if (selectedChoiceIndex === null || lockedChoiceIndex !== null || submitting) return
    setLockedChoiceIndex(selectedChoiceIndex)
    setSubmitting(true)
    setSubmitError(false)

    const currentScenario = getScenarioByRound(pack, session.current_round)
    const { error } = await supabase.from('choices').insert({
      session_id: sessionId,
      player_id: player.id,
      round_number: session.current_round,
      scenario_id: currentScenario.id,
      choice_index: selectedChoiceIndex,
      frameworks: currentScenario.choices[selectedChoiceIndex].frameworks
    })

    setSubmitting(false)
    if (error) {
      if (error.code !== '23505') {
        setLockedChoiceIndex(null)
        setSubmitError(true)
      }
    } else {
      setMyChoiceHistory(prev => [
        ...prev.filter(c => c.round !== session.current_round),
        {
          round: session.current_round,
          choiceIndex: selectedChoiceIndex,
          scenarioId: currentScenario.id,
          frameworks: currentScenario.choices[selectedChoiceIndex].frameworks
        }
      ])
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
    const values = Object.values(worldState).filter(v => typeof v === 'number')
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / (values.length * 100) : 0.5
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

  // Lobby waiting view — with senator profile dossier
  if (!gameStarted) {
    const lobbyProfile = pack?.id === 'signal-lost' && player?.senator_profile_id
      ? getProfileById(player.senator_profile_id)
      : null

    return (
      <motion.div
        className={styles.page}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ '--atmosphere-warmth': 0.5 }}
      >
        <div className={styles.lobbyContent}>
          {lobbyProfile ? (
            <div className={styles.dossier}>
              <p className={styles.dossierEyebrow}>YOUR SENATOR</p>
              <h2 className={styles.dossierName}>{lobbyProfile.name}</h2>
              <p className={styles.dossierSubtitle}>{lobbyProfile.subtitle}</p>
              <div className={styles.dossierVars}>
                {lobbyProfile.variables.health && (
                  <div className={styles.dossierVar}>
                    <span className={styles.dossierVarLabel}>HEALTH</span>
                    <span className={styles.dossierVarText}>{lobbyProfile.variables.health}</span>
                  </div>
                )}
                {lobbyProfile.variables.money && (
                  <div className={styles.dossierVar}>
                    <span className={styles.dossierVarLabel}>FINANCIAL</span>
                    <span className={styles.dossierVarText}>{lobbyProfile.variables.money}</span>
                  </div>
                )}
                {lobbyProfile.variables.family && (
                  <div className={styles.dossierVar}>
                    <span className={styles.dossierVarLabel}>FAMILY</span>
                    <span className={styles.dossierVarText}>{lobbyProfile.variables.family}</span>
                  </div>
                )}
                {lobbyProfile.variables.politics && (
                  <div className={styles.dossierVar}>
                    <span className={styles.dossierVarLabel}>POLITICS</span>
                    <span className={styles.dossierVarText}>{lobbyProfile.variables.politics}</span>
                  </div>
                )}
              </div>
              <p className={styles.dossierFooter}>Memorize your position. Every dilemma will cost you differently.</p>
              {!profileReady && (
                <button className={styles.readyBtn} onClick={() => {
                  setProfileReady(true)
                  supabase.channel(`remote:${sessionId}`).send({ type: 'broadcast', event: 'player_ready', payload: {} })
                }}>
                  I&apos;ve read my profile
                </button>
              )}
              {profileReady && <p className={styles.readyConfirm}>Ready.</p>}
            </div>
          ) : (
            <>
              <div className={styles.avatar}>{player?.avatar}</div>
              <div className={styles.name}>{player?.name}</div>
            </>
          )}
          <p className={styles.waiting}>{lobbyProfile ? (profileReady ? 'Waiting for the session to begin.' : 'Read your profile above.') : 'The council assembles.'}</p>
          <p className={styles.count}>{playerCount} councillor{playerCount !== 1 ? 's' : ''} present</p>
          {session?.room_code && (
            <p className={styles.roomReminder}>Chamber: {session.room_code}</p>
          )}
        </div>
      </motion.div>
    )
  }

  // Game finished view — FrameworkProfile + optional reflection input
  if (gameFinished || session?.status === 'finished') {
    const showReflection = session?.total_rounds === 6
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
          <FrameworkProfile player={player} pack={pack} groupDebrief={session?.group_debrief_context ?? null} />

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
                  {/* Health bar removed from player phone — displayed on host projector only */}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )
    }

    if (lockedChoiceIndex !== null) {
      const chosenOption = currentScenario.choices[lockedChoiceIndex]
      const profileConsequence = (chosenOption.profileConsequences && player?.senator_profile_id)
        ? chosenOption.profileConsequences[player.senator_profile_id] ?? null
        : null
      const choiceFrameworks = chosenOption.frameworks ?? []
      const roundMoralConflict = (() => {
        if (choiceFrameworks.length === 0) return false
        const singleHistory = [{
          round: session.current_round,
          scenarioId: currentScenario.id,
          choiceIndex: lockedChoiceIndex,
          frameworks: choiceFrameworks
        }]
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
                  consequence={profileConsequence ?? chosenOption.consequence}
                  conscienceLayer={chosenOption.conscienceLayer ?? null}
                  frameworks={choiceFrameworks}
                  scenarioId={currentScenario.id}
                  choiceIndex={lockedChoiceIndex}
                  round={session.current_round}
                  worldState={session.world_state ?? (pack?.defaultWorldState ?? { trust: 50, courage: 50, solidarity: 50, awareness: 50 })}
                  moralValues={player?.moral_values ?? null}
                  moralStances={player?.moral_stances ?? null}
                  hasMoralConflict={roundMoralConflict}
                  pack={pack}
                />

                <HowOthersChose
                  scenarioId={currentScenario.id}
                  liveChoices={roundChoicesForComparison}
                  totalPlayers={totalPlayerCount}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )
    }

    // Player didn't submit before round closed — show dashboard
    const missedProfile = pack?.id === 'signal-lost' && player?.senator_profile_id
      ? getProfileById(player.senator_profile_id) : null

    return (
      <motion.div
        className={styles.page}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ '--atmosphere-warmth': warmth }}
      >
        <div className={styles.dashboardView}>
          <div className={styles.dashStatus}>
            <p className={styles.dashStatusText}>
              {pack?.id === 'signal-lost' ? 'ROUND CLOSED — YOU DID NOT VOTE' : 'The decree was sealed before your counsel arrived.'}
            </p>
          </div>

          {/* Health bar removed from player phone — displayed on host projector only */}

          {missedProfile && (
            <details className={styles.dashPanel}>
              <summary className={styles.dashPanelHeader}>SENATOR PROFILE</summary>
              <div className={styles.dashPanelBody}>
                <p className={styles.dashSenatorName}>{missedProfile.name}</p>
                <p className={styles.dashSenatorSub}>{missedProfile.subtitle}</p>
              </div>
            </details>
          )}

          <details className={styles.dashPanel}>
            <summary className={styles.dashPanelHeader}>THE DILEMMA</summary>
            <div className={styles.dashPanelBody}>
              <p className={styles.dashScenarioText}>{currentScenario.text}</p>
            </div>
          </details>
        </div>
      </motion.div>
    )
  }

  // Active round view
  if (session?.status === 'active' && currentScenario) {
    const isTimerPressureRound = session?.current_round === 5
    const isWalkRound = session?.current_round === 6
    const isBombshellRound = currentScenario?.id === 'round-bombshell' || currentScenario?.id === 'signal-r8'

    // Round reflection detection — show reflection textarea instead of ScenarioCard
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
          onPass={() => {
            setPassedRound(true)
            setMyChoiceHistory(prev => [...prev, {
              round: session.current_round,
              scenarioId: currentScenario.id,
              choiceIndex: null,
              frameworks: [],
              passed: true,
              moral_weight: currentScenario.weight === 'heavy' ? 3 : currentScenario.weight === 'medium' ? 2 : 1
            }])
          }}
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

    // ── PHASE 1: STAKE (full screen, tap to continue) ──────────────────
    if (roundPhase === 'stake') {
      const profile = pack?.id === 'signal-lost' && player?.senator_profile_id
        ? getProfileById(player.senator_profile_id)
        : null
      let stake = profile?.stakes?.[`r${session.current_round}`]
      const dynamicEntries = profile?.dynamicStakes?.[`r${session.current_round}`]
      if (dynamicEntries && myChoiceHistory.length > 0) {
        const matched = dynamicEntries.find(d => d.condition(myChoiceHistory))
        if (matched) stake = stake ? `${stake} ${matched.text}` : matched.text
      }

      return (
        <motion.div
          className={styles.page}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ '--atmosphere-warmth': warmth }}
        >
          <div className={styles.phaseStake}>
            <p className={styles.stepEyebrow}>
              {pack?.id === 'signal-lost'
                ? `ROUND ${session.current_round} OF ${session.total_rounds}`
                : `DILEMMA ${session.current_round}`}
            </p>
            <h2 className={styles.stakeTitle}>{currentScenario.title}</h2>

            {currentScenario.previousRoundCallback && session.current_round > 1 && (
              <p className={styles.narrativeBridge}>{currentScenario.previousRoundCallback}</p>
            )}

            {profile && stake && (
              <div className={styles.stakePanel}>
                <p className={styles.stakeName}>{profile.name}</p>
                <p className={styles.stakeText}>YOUR STAKE: {stake}</p>
              </div>
            )}

            {!profile && (
              <div className={styles.stakePanel}>
                <p className={styles.stakeText} style={{ fontStyle: 'italic' }}>{currentScenario.moralTension}</p>
              </div>
            )}

            {isBombshellRound && (
              <div className={styles.scribeRecord}>
                <p className={styles.scribeLabel}>THE SCRIBE&apos;S RECORD</p>
                <p className={styles.scribeText}>{generateScribeRecord(myChoiceHistory, session?.break_flags ?? {})}</p>
              </div>
            )}

            {timerRemaining !== null && (
              <div className={styles.stakeTimer}>
                <TimerDisplay remaining={timerRemaining} total={timerTotal} />
              </div>
            )}

            {/* Health bar removed from player phone — displayed on host projector only */}

            <button className={styles.phaseAdvanceBtn} onClick={() => setRoundPhase('dilemma')}>
              Read the Dilemma
            </button>
          </div>
        </motion.div>
      )
    }

    // ── PHASE 2: DILEMMA (scenario + choices, clean) ─────────────────
    if (roundPhase === 'dilemma') {
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
                {isWalkRound ? (
                  <>
                    <div className={styles.card}>
                      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', marginBottom: 12, color: 'var(--text-h)' }}>{currentScenario.title}</h2>
                      <p style={{ lineHeight: 1.6, marginBottom: 0, color: 'var(--text)', fontSize: '1rem' }}>{currentScenario.text}</p>
                    </div>
                    <WalkMechanic
                      onChoice={handleChoice}
                      submitting={submitting}
                      lockedIndex={lockedChoiceIndex}
                      scenario={currentScenario}
                    />
                  </>
                ) : (
                  <ScenarioCard
                    scenario={currentScenario}
                    selectedIndex={selectedChoiceIndex}
                    lockedIndex={lockedChoiceIndex}
                    onChoice={handleChoice}
                    submitting={submitting}
                    submitError={submitError}
                  />
                )}

                {selectedChoiceIndex !== null && lockedChoiceIndex === null && (
                  <button
                    className={styles.submitChoiceBtn}
                    onClick={() => {
                      handleSubmitChoice()
                      setTimeout(() => setRoundPhase('dashboard'), 500)
                    }}
                    disabled={submitting}
                  >
                    {submitting ? 'SUBMITTING...' : (pack?.id === 'signal-lost' ? 'CAST YOUR VOTE' : 'Seal Your Decree')}
                  </button>
                )}

                {/* Health bar removed from player phone — displayed on host projector only */}

                {timerRemaining !== null && (
                  <div className={`${styles.timerSection} ${isTimerPressureRound ? styles.timerPressure : ''}`}>
                    <TimerDisplay remaining={timerRemaining} total={timerTotal} />
                    {isTimerPressureRound && timerRemaining !== null && timerRemaining <= 30 && (
                      <p className={styles.timerUrgency}>The council waits for no one.</p>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )
    }

    // ── PHASE 3: DASHBOARD (after vote, tabbed browsing) ─────────────
    if (roundPhase === 'dashboard' && lockedChoiceIndex !== null) {
      const profile = pack?.id === 'signal-lost' && player?.senator_profile_id
        ? getProfileById(player.senator_profile_id)
        : null

      return (
        <motion.div
          className={styles.page}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ '--atmosphere-warmth': warmth }}
        >
          <div className={styles.dashboardView}>
            {/* Fixed status bar at top */}
            <div className={styles.dashStatus}>
              <p className={styles.dashStatusText}>
                {pack?.id === 'signal-lost' ? 'VOTE RECORDED' : 'DECREE SEALED'}
              </p>
              <div className={styles.dashStatusRow}>
                <span className={styles.submittedCounter}>
                  <span className={styles.submittedNumber}>{submittedCount}</span>/{totalPlayerCount}
                </span>
                {timerRemaining !== null && (
                  <TimerDisplay remaining={timerRemaining} total={timerTotal} />
                )}
              </div>
            </div>

            {/* Collapsible panels */}
            <div className={styles.dashPanels}>
              {/* Your Answer — default open */}
              <details className={styles.dashPanel} open>
                <summary className={styles.dashPanelHeader}>YOUR ANSWER</summary>
                <div className={styles.dashPanelBody}>
                  <p className={styles.dashChoiceText}>{currentScenario.choices[lockedChoiceIndex]?.text}</p>
                  <textarea
                    className={styles.whyField}
                    placeholder="In your own words, why? (optional)"
                    maxLength={280}
                    rows={2}
                  />
                </div>
              </details>

              {/* World State — health bar with tap-to-expand */}
              {/* Health bar removed from player phone — displayed on host projector only */}

              {/* Senator Profile */}
              {profile && (
                <details className={styles.dashPanel}>
                  <summary className={styles.dashPanelHeader}>SENATOR PROFILE</summary>
                  <div className={styles.dashPanelBody}>
                    <p className={styles.dashSenatorName}>{profile.name}</p>
                    <p className={styles.dashSenatorSub}>{profile.subtitle}</p>
                    {Object.entries(profile.variables).map(([key, val]) => (
                      <div key={key} className={styles.dashSenatorVar}>
                        <span className={styles.dashSenatorVarLabel}>{key.toUpperCase()}</span>
                        <span className={styles.dashSenatorVarText}>{val}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* The Dilemma */}
              <details className={styles.dashPanel}>
                <summary className={styles.dashPanelHeader}>THE DILEMMA</summary>
                <div className={styles.dashPanelBody}>
                  <p className={styles.dashScenarioText}>{currentScenario.text}</p>
                </div>
              </details>
            </div>
          </div>
        </motion.div>
      )
    }

    // Dashboard without locked choice (edge case — auto-advance)
    if (roundPhase === 'dashboard' && lockedChoiceIndex === null) {
      setRoundPhase('dilemma')
    }

    return null
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
