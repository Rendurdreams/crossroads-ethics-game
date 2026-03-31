import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { supabase } from '../lib/supabase.js'
import styles from './Baseline.module.css'
import scenarioStyles from '../components/ScenarioCard.module.css'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } }
}

const VALUES = ['loyalty', 'honesty', 'fairness', 'courage', 'compassion']
const ROMAN = ['I', 'II', 'III']
const STANCE_QUESTIONS = [
  {
    key: 'lie_to_protect',
    text: 'Is it ever right to lie to protect someone you love?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'It depends', value: 'it_depends' }
    ]
  },
  {
    key: 'ends_justify',
    text: 'If lying to one person would genuinely make life better for ten people, is the lie acceptable?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'It depends', value: 'it_depends' }
    ]
  },
  {
    key: 'break_promise',
    text: 'If you made a commitment you can no longer keep without hurting someone, is it better to break it cleanly or try to honor it partially?',
    options: [
      { label: 'Break cleanly', value: 'yes' },
      { label: 'Honor partially', value: 'no' },
      { label: 'It depends', value: 'it_depends' }
    ]
  },
  {
    key: 'loyalty_vs_fairness',
    text: 'If your group made a decision that harmed outsiders, would you speak up against your own group?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'It depends', value: 'it_depends' }
    ]
  },
  {
    key: 'punish_innocent',
    text: 'Is it okay to punish the innocent if it protects the group?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'It depends', value: 'it_depends' }
    ]
  }
]

export default function Baseline() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const shouldReduce = useReducedMotion()
  const variants = shouldReduce ? { initial: {}, animate: {}, exit: {} } : pageVariants

  const [rankedValues, setRankedValues] = useState([])
  const [stances, setStances] = useState({})
  const [loading, setLoading] = useState(true)
  const [playerId, setPlayerId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)

  // Mount restore
  useEffect(() => {
    if (!sessionId) return

    const storedPlayerId = localStorage.getItem('player_id')
    const storedSessionId = localStorage.getItem('session_id')

    if (!storedPlayerId || storedSessionId !== sessionId) {
      navigate('/')
      return
    }

    supabase
      .from('players')
      .select('*')
      .eq('id', storedPlayerId)
      .single()
      .then(({ data: player }) => {
        if (!player) {
          localStorage.removeItem('player_id')
          localStorage.removeItem('session_id')
          navigate('/')
          return
        }

        if (player.moral_values !== null) {
          navigate(`/play/${sessionId}`, { replace: true })
          return
        }

        setPlayerId(player.id)

        // Restore in-progress state from localStorage
        try {
          const savedRanked = localStorage.getItem('baseline_ranked')
          if (savedRanked) setRankedValues(JSON.parse(savedRanked))
        } catch {
          setRankedValues([])
        }

        try {
          const savedStances = localStorage.getItem('baseline_stances')
          if (savedStances) setStances(JSON.parse(savedStances))
        } catch {
          setStances({})
        }

        setLoading(false)
      })
  }, [sessionId, navigate])

  // Sync rankedValues to localStorage
  useEffect(() => {
    if (!loading) localStorage.setItem('baseline_ranked', JSON.stringify(rankedValues))
  }, [rankedValues, loading])

  // Sync stances to localStorage
  useEffect(() => {
    if (!loading) localStorage.setItem('baseline_stances', JSON.stringify(stances))
  }, [stances, loading])

  function handleValueTap(value) {
    if (rankedValues.includes(value)) return
    if (rankedValues.length >= 5) return
    setRankedValues(prev => [...prev, value])
  }

  function handleValueUndo(value) {
    const idx = rankedValues.indexOf(value)
    if (idx === -1) return
    setRankedValues(prev => prev.slice(0, idx))
  }

  function handleStance(key, value) {
    setStances(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
    if (rankedValues.length < 5 || Object.keys(stances).length < 5) return
    setSubmitting(true)
    setSubmitError(false)
    const { error } = await supabase
      .from('players')
      .update({ moral_values: rankedValues, moral_stances: stances })
      .eq('id', playerId)
    if (!error) {
      localStorage.removeItem('baseline_ranked')
      localStorage.removeItem('baseline_stances')
      navigate(`/play/${sessionId}`)
    } else {
      setSubmitError(true)
      setSubmitting(false)
    }
  }

  const allRanked = rankedValues.length === 5
  const allStancesAnswered = Object.keys(stances).length === 5
  const canSubmit = allRanked && allStancesAnswered && !submitting

  if (loading) {
    return (
      <motion.div
        className={styles.page}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
      />
    )
  }

  return (
    <motion.div
      className={styles.page}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className={styles.content}>
        <div className={styles.card}>
          <h1 className={styles.heading}>
            Before you take your seat at the council, declare what you hold most dear.
          </h1>
          <p className={styles.subheading}>Your counsel will remember.</p>

          {/* Value Ranking Section */}
          <p className={styles.sectionLabel}>What you hold sacred</p>
          <p className={`${styles.instruction}${allRanked ? ` ${styles.instructionFaded}` : ''}`}>
            Tap to rank from most to least important. Tap again to undo.
          </p>

          <ul className={styles.valueList} role="list">
            {VALUES.map((value) => {
              const rankIndex = rankedValues.indexOf(value)
              const isRanked = rankIndex !== -1
              const rankNumber = rankIndex + 1
              const ariaLabel = isRanked
                ? `${value.charAt(0).toUpperCase() + value.slice(1)}, ranked ${rankNumber}. Tap to undo from this rank.`
                : `${value.charAt(0).toUpperCase() + value.slice(1)}, not yet ranked`

              return (
                <li key={value} role="listitem">
                  <button
                    className={`${styles.valueCard}${isRanked ? ` ${styles.valueRanked}` : ''}`}
                    onClick={() => isRanked ? handleValueUndo(value) : handleValueTap(value)}
                    aria-pressed={isRanked}
                    aria-label={ariaLabel}
                  >
                    {isRanked && (
                      <span className={styles.rankBadge} aria-hidden="true">
                        {rankNumber}
                      </span>
                    )}
                    <span className={styles.valueName}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </span>
                    {isRanked && (
                      <span className={styles.undoHint} aria-hidden="true">
                        tap to undo
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Progress Separator */}
          <div className={styles.separator}>
            <div className={styles.separatorRule} />
            <p className={styles.separatorLabel}>YOUR STANCE</p>
          </div>

          {!allRanked && (
            <p className={styles.disabledHint}>
              Finish ranking your values to continue.
            </p>
          )}

          {/* Stance Questions */}
          <div
            className={`${styles.stanceSection}${!allRanked ? ` ${styles.stanceDisabled}` : ''}`}
            aria-disabled={!allRanked}
          >
            {STANCE_QUESTIONS.map((question, qIdx) => {
              const selectedAnswer = stances[question.key]
              const hasSelection = selectedAnswer !== undefined

              return (
                <div
                  key={question.key}
                  className={styles.stanceQuestion}
                  role="group"
                  aria-labelledby={`stance-q-${qIdx}`}
                >
                  <p
                    id={`stance-q-${qIdx}`}
                    className={styles.stanceText}
                  >
                    {question.text}
                  </p>
                  <div className={styles.stanceOptions}>
                    {question.options.map((option, oIdx) => {
                      const isSelected = selectedAnswer === option.value
                      const isDimmed = hasSelection && !isSelected

                      return (
                        <button
                          key={option.value}
                          className={`${scenarioStyles.choiceBtn}${isSelected ? ` ${scenarioStyles.choiceLocked}` : ''}${isDimmed ? ` ${scenarioStyles.choiceDimmed}` : ''}`}
                          onClick={() => handleStance(question.key, option.value)}
                          aria-pressed={isSelected}
                          disabled={!allRanked}
                        >
                          <span className={scenarioStyles.choiceNumeral}>{ROMAN[oIdx]}.</span>
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Submit */}
          <button
            className={`${styles.submitBtn}${!canSubmit ? ` ${styles.submitDisabled}` : ''}`}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {submitting ? 'Sealing your counsel\u2026' : 'Enter the Council'}
          </button>

          {submitError && (
            <p className={styles.errorMsg} role="alert">
              Something went wrong. Your answers are saved &mdash; tap to try again.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
