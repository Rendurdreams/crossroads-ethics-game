import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { supabase } from '../lib/supabase.js'
import styles from './Baseline.module.css'

const DEFAULT_VALUES = ['care', 'fairness', 'loyalty', 'authority', 'sanctity']
const SIGNAL_LOST_VALUES = ['care', 'fairness', 'loyalty', 'authority', 'sanctity']

const VALUE_LABELS = {
  care:      { name: 'Care', subtitle: 'Protecting people from harm' },
  fairness:  { name: 'Fairness', subtitle: 'Everyone gets what they deserve' },
  loyalty:   { name: 'Loyalty', subtitle: 'Standing with your people' },
  authority: { name: 'Authority', subtitle: 'Respecting order and duty' },
  sanctity:  { name: 'Sanctity', subtitle: 'Preserving what is sacred' }
}

const DEFAULT_STANCE_QUESTIONS = [
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

const SIGNAL_LOST_STANCE_QUESTIONS = [
  {
    key: 'lie_to_protect',
    text: 'As a senator, is it ever right to conceal information to protect the people you represent?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'It depends', value: 'it_depends' }
    ]
  },
  {
    key: 'ends_justify',
    text: 'If a policy saves a thousand lives but requires violating the rights of ten, is the policy acceptable?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'It depends', value: 'it_depends' }
    ]
  },
  {
    key: 'break_promise',
    text: 'If a commitment you made to voters can no longer be kept without harming someone else, is it better to break it cleanly or honor it partially?',
    options: [
      { label: 'Break cleanly', value: 'yes' },
      { label: 'Honor partially', value: 'no' },
      { label: 'It depends', value: 'it_depends' }
    ]
  },
  {
    key: 'loyalty_vs_fairness',
    text: 'If your party or coalition made a decision that harmed people outside your base, would you speak against your own group publicly?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'It depends', value: 'it_depends' }
    ]
  },
  {
    key: 'punish_innocent',
    text: 'As a senator, is it acceptable for one person to suffer if it protects the stability of the system you govern?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'It depends', value: 'it_depends' }
    ]
  }
]

// Step flow: intro → 5 value picks (one per screen) → 5 stance questions (one per screen) → submit
// Total steps: 1 intro + 5 values + 5 stances + 1 confirm = 12

export default function Baseline() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const shouldReduce = useReducedMotion()

  const [rankedValues, setRankedValues] = useState([])
  const [stances, setStances] = useState({})
  const [loading, setLoading] = useState(true)
  const [playerId, setPlayerId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [packId, setPackId] = useState(null)
  const [step, setStep] = useState(0) // 0 = intro, 1-5 = value picks, 6-10 = stances, 11 = confirm

  const isSignalLost = packId === 'signal-lost'
  const VALUES = isSignalLost ? SIGNAL_LOST_VALUES : DEFAULT_VALUES
  const STANCE_QUESTIONS = isSignalLost ? SIGNAL_LOST_STANCE_QUESTIONS : DEFAULT_STANCE_QUESTIONS

  // Mount restore
  useEffect(() => {
    if (!sessionId) return
    const storedPlayerId = localStorage.getItem('player_id')
    const storedSessionId = localStorage.getItem('session_id')
    if (!storedPlayerId || storedSessionId !== sessionId) { navigate('/'); return }

    supabase.from('players').select('*').eq('id', storedPlayerId).single()
      .then(({ data: player }) => {
        if (!player) { localStorage.removeItem('player_id'); localStorage.removeItem('session_id'); navigate('/'); return }
        if (player.moral_values !== null) { navigate(`/play/${sessionId}`, { replace: true }); return }
        setPlayerId(player.id)
        if (sessionId) {
          supabase.from('sessions').select('pack_id').eq('id', sessionId).single()
            .then(({ data: sess }) => { if (sess?.pack_id) setPackId(sess.pack_id) })
        }
        // Restore progress
        try {
          const savedRanked = localStorage.getItem('baseline_ranked')
          const savedStances = localStorage.getItem('baseline_stances')
          const savedStep = localStorage.getItem('baseline_step')
          if (savedRanked) setRankedValues(JSON.parse(savedRanked))
          if (savedStances) setStances(JSON.parse(savedStances))
          if (savedStep) setStep(parseInt(savedStep, 10))
        } catch { /* ignore */ }
        setLoading(false)
      })
  }, [sessionId, navigate])

  // Persist progress
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('baseline_ranked', JSON.stringify(rankedValues))
      localStorage.setItem('baseline_stances', JSON.stringify(stances))
      localStorage.setItem('baseline_step', String(step))
    }
  }, [rankedValues, stances, step, loading])

  // Remaining values (not yet ranked)
  const remainingValues = VALUES.filter(v => !rankedValues.includes(v))

  function pickValue(value) {
    const newRanked = [...rankedValues, value]
    setRankedValues(newRanked)
    // Auto-advance: if this was the last value, go to stances
    setTimeout(() => setStep(prev => prev + 1), 350)
  }

  function pickStance(key, value) {
    setStances(prev => ({ ...prev, [key]: value }))
    setTimeout(() => setStep(prev => prev + 1), 350)
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
      localStorage.removeItem('baseline_step')
      navigate(`/play/${sessionId}`)
    } else {
      setSubmitError(true)
      setSubmitting(false)
    }
  }

  const stepVariants = shouldReduce
    ? { initial: {}, animate: {}, exit: {} }
    : {
        initial: { opacity: 0, y: 40 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
        exit: { opacity: 0, y: -30, transition: { duration: 0.25 } }
      }

  if (loading) return <div className={styles.page} />

  // Progress indicator: dots
  const totalSteps = 11
  const progressPct = Math.round((step / totalSteps) * 100)

  return (
    <div className={styles.page}>
      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
      </div>

      <div className={styles.stepContainer}>
        <AnimatePresence mode="wait">

          {/* Step 0: Intro */}
          {step === 0 && (
            <motion.div key="intro" className={styles.stepCard} variants={stepVariants} initial="initial" animate="animate" exit="exit">
              <p className={styles.stepEyebrow}>CLASSIFIED BRIEFING</p>
              <h1 className={styles.stepHeading}>Before you take your seat, declare what you hold most dear.</h1>
              <p className={styles.stepSub}>Five values. Five questions. The council will remember.</p>
              <button className={styles.stepBtn} onClick={() => setStep(1)}>Begin</button>
            </motion.div>
          )}

          {/* Steps 1-5: Value picks — one at a time */}
          {step >= 1 && step <= 5 && (
            <motion.div key={`value-${step}`} className={styles.stepCard} variants={stepVariants} initial="initial" animate="animate" exit="exit">
              <p className={styles.stepEyebrow}>VALUE {step} OF 5</p>
              <h2 className={styles.stepQuestion}>
                {step === 1 && 'What matters most to you?'}
                {step === 2 && 'And after that?'}
                {step === 3 && 'What comes next?'}
                {step === 4 && 'Almost there. Which of these?'}
                {step === 5 && 'Last one.'}
              </h2>

              {/* Show already-ranked values as small chips */}
              {rankedValues.length > 0 && (
                <div className={styles.rankedChips}>
                  {rankedValues.map((v, i) => (
                    <span key={v} className={styles.rankedChip}>
                      <span className={styles.chipNum}>{i + 1}</span>
                      {VALUE_LABELS[v]?.name ?? v}
                    </span>
                  ))}
                </div>
              )}

              <div className={styles.valueOptions}>
                {remainingValues.map((value) => {
                  const label = VALUE_LABELS[value] ?? { name: value, subtitle: '' }
                  return (
                    <button key={value} className={styles.valueOption} onClick={() => pickValue(value)}>
                      <span className={styles.valueOptionName}>{label.name}</span>
                      <span className={styles.valueOptionSub}>{label.subtitle}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Steps 6-10: Stance questions — one at a time */}
          {step >= 6 && step <= 10 && (() => {
            const qIdx = step - 6
            const question = STANCE_QUESTIONS[qIdx]
            if (!question) return null
            return (
              <motion.div key={`stance-${step}`} className={styles.stepCard} variants={stepVariants} initial="initial" animate="animate" exit="exit">
                <p className={styles.stepEyebrow}>QUESTION {qIdx + 1} OF 5</p>
                <h2 className={styles.stanceText}>{question.text}</h2>
                <div className={styles.stanceOptions}>
                  {question.options.map((option) => (
                    <button
                      key={option.value}
                      className={styles.stanceBtn}
                      onClick={() => pickStance(question.key, option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )
          })()}

          {/* Step 11: Confirm */}
          {step === 11 && (
            <motion.div key="confirm" className={styles.stepCard} variants={stepVariants} initial="initial" animate="animate" exit="exit">
              <p className={styles.stepEyebrow}>BRIEFING COMPLETE</p>
              <h2 className={styles.stepHeading}>Your record is sealed.</h2>

              <div className={styles.summarySection}>
                <p className={styles.summaryLabel}>YOUR VALUES</p>
                <div className={styles.rankedChips} style={{ justifyContent: 'center' }}>
                  {rankedValues.map((v, i) => (
                    <span key={v} className={styles.rankedChip}>
                      <span className={styles.chipNum}>{i + 1}</span>
                      {VALUE_LABELS[v]?.name ?? v}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.summarySection}>
                <p className={styles.summaryLabel}>YOUR STANCES</p>
                {STANCE_QUESTIONS.map(q => {
                  const answer = stances[q.key]
                  const opt = q.options.find(o => o.value === answer)
                  return (
                    <p key={q.key} className={styles.summaryAnswer}>
                      <span className={styles.summaryQ}>{q.text.length > 50 ? q.text.substring(0, 50) + '...' : q.text}</span>
                      <span className={styles.summaryA}>{opt?.label ?? '—'}</span>
                    </p>
                  )
                })}
              </div>

              <button className={styles.stepBtn} onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Entering...' : 'Enter the Council'}
              </button>

              <button className={styles.redoBtn} onClick={() => {
                setRankedValues([])
                setStances({})
                setStep(0)
              }}>
                Start over
              </button>

              {submitError && (
                <p className={styles.errorMsg}>Something went wrong. Tap to try again.</p>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
