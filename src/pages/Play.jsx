import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { scenarios } from '../lib/scenarios.js'
import { FRAMEWORKS } from '../lib/frameworks.js'
import ScenarioCard from '../components/ScenarioCard.jsx'
import ContentNote from '../components/ContentNote.jsx'
import ConsequenceReveal from '../components/ConsequenceReveal.jsx'
import TimerDisplay from '../components/TimerDisplay.jsx'
import MeterBar from '../components/MeterBar.jsx'
import styles from './Play.module.css'

export default function Play() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  // Existing state
  const [player, setPlayer] = useState(null)
  const [session, setSession] = useState(null)
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
                  if (sessionData.status !== 'lobby') {
                    setGameStarted(true)
                  }
                  if (sessionData.status === 'finished') {
                    setGameFinished(true)
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

  // Choice submission handler
  async function handleChoice(choiceIndex) {
    if (lockedChoiceIndex !== null || submitting) return
    setLockedChoiceIndex(choiceIndex)
    setSubmitting(true)
    setSubmitError(false)

    const currentScenario = scenarios[session.current_round - 1]
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
  }

  // --- Render ---

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.waiting}>Loading...</p>
      </div>
    )
  }

  // Lobby waiting view
  if (!gameStarted) {
    return (
      <div className={styles.page}>
        <div className={styles.avatar}>{player?.avatar}</div>
        <div className={styles.name}>{player?.name}</div>
        <p className={styles.waiting}>Waiting for host to start...</p>
        <p className={styles.count}>{playerCount} player(s) in room</p>
        {session?.room_code && (
          <p className={styles.roomReminder}>Room: {session.room_code}</p>
        )}
      </div>
    )
  }

  // Game finished view
  if (gameFinished || session?.status === 'finished') {
    return (
      <div className={styles.page}>
        <p className={styles.finishedText}>Game complete.</p>
        <p className={styles.waiting}>Check your framework profile above.</p>
      </div>
    )
  }

  const currentScenario = session?.current_round ? scenarios[session.current_round - 1] : null

  // Round complete — show consequence reveal
  if (session?.status === 'round_complete' && currentScenario) {
    if (passedRound) {
      // Passer still sees world state update, no framework label
      return (
        <div className={styles.gameContent}>
          <div className={styles.passConsequence}>
            <p className={styles.passConsequenceText}>You sat this one out. Here&apos;s what happened:</p>
            <div className={styles.metersSection}>
              <p className={styles.metersLabel}>WORLD STATE</p>
              <div className={styles.meters}>
                <MeterBar label="Trust" value={session.world_state?.trust ?? 50} />
                <MeterBar label="Courage" value={session.world_state?.courage ?? 50} />
                <MeterBar label="Solidarity" value={session.world_state?.solidarity ?? 50} />
                <MeterBar label="Awareness" value={session.world_state?.awareness ?? 50} />
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (lockedChoiceIndex !== null) {
      const chosenOption = currentScenario.choices[lockedChoiceIndex]
      const frameworkKey = chosenOption.frameworks[0]
      const frameworkExplanation = FRAMEWORKS[frameworkKey]?.question ?? ''

      return (
        <div className={styles.gameContent}>
          <ConsequenceReveal
            consequence={chosenOption.consequence}
            framework={frameworkKey}
            explanation={frameworkExplanation}
            worldState={session.world_state ?? { trust: 50, courage: 50, solidarity: 50, awareness: 50 }}
          />
        </div>
      )
    }

    // Player didn't submit before round closed
    return (
      <div className={styles.gameContent}>
        <div className={styles.passConsequence}>
          <p className={styles.passConsequenceText}>The round ended before you submitted.</p>
          <div className={styles.metersSection}>
            <p className={styles.metersLabel}>WORLD STATE</p>
            <div className={styles.meters}>
              <MeterBar label="Trust" value={session.world_state?.trust ?? 50} />
              <MeterBar label="Courage" value={session.world_state?.courage ?? 50} />
              <MeterBar label="Solidarity" value={session.world_state?.solidarity ?? 50} />
              <MeterBar label="Awareness" value={session.world_state?.awareness ?? 50} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Active round view
  if (session?.status === 'active' && currentScenario) {
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
        <div className={styles.page}>
          <div className={styles.gameContent}>
            <div className={styles.passView}>
              <p className={styles.passText}>You sat this one out.</p>
              <p className={styles.passSubtext}>You&apos;ll see the outcome when the round closes.</p>
            </div>
            <p className={styles.submittedCounter}>
              <span className={styles.submittedNumber}>{submittedCount}</span>
              {' '}of {totalPlayerCount} submitted
            </p>
            {timerRemaining !== null && (
              <TimerDisplay remaining={timerRemaining} total={timerTotal} />
            )}
          </div>
        </div>
      )
    }

    // Scenario + choice view
    return (
      <div className={styles.page}>
        <div className={styles.gameContent}>
          <div className={styles.roundHeader}>
            {player?.avatar && <span className={styles.headerAvatar}>{player.avatar}</span>}
            <span className={styles.roundLabel}>Round {session.current_round}</span>
          </div>

          <ScenarioCard
            scenario={currentScenario}
            lockedIndex={lockedChoiceIndex}
            onChoice={handleChoice}
            submitting={submitting}
            submitError={submitError}
          />

          {lockedChoiceIndex !== null && (
            <div className={styles.waitingSection}>
              <p className={styles.waitingText}>Waiting for others...</p>
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
        </div>
      </div>
    )
  }

  // Fallback / transitional state
  return (
    <div className={styles.page}>
      <p className={styles.waiting}>Waiting...</p>
    </div>
  )
}
