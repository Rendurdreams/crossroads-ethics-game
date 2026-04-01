import { useNavigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import styles from './Grading.module.css'

const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, transition: { duration: 0.3 } }
}

const RUBRIC = [
  {
    dimension: 'Moral Reasoning Quality',
    points: 30,
    bands: [
      { range: '25-30', description: 'Student articulates the ethical framework behind their choices without prompting. Can name the tension (e.g. "I knew I was prioritizing the living over the future").' },
      { range: '18-24', description: 'Student identifies that a trade-off was made. Can describe what was gained and lost.' },
      { range: '10-17', description: 'Student describes what happened but not why they chose it. Outcome-focused without framework awareness.' },
      { range: '0-9', description: 'Student cannot articulate reasoning. Choices appear arbitrary or unreflected.' }
    ]
  },
  {
    dimension: 'Personal Stake Awareness',
    points: 20,
    bands: [
      { range: '17-20', description: 'Student explicitly addresses how their Senator profile affected their reasoning. Identifies at least two rounds where the profile created genuine tension.' },
      { range: '12-16', description: 'Student acknowledges the profile affected some choices. At least one specific example.' },
      { range: '6-11', description: 'Student is aware of the profile but treats it as background rather than a genuine constraint.' },
      { range: '0-5', description: 'Student does not engage with the profile. Voted as if they had no personal stake.' }
    ]
  },
  {
    dimension: 'Consequence Tracking',
    points: 25,
    bands: [
      { range: '21-25', description: 'Student can trace the causal chain from their choices to specific world outcomes. Acknowledges Break Flags if triggered. Understands that early choices recontextualized later ones.' },
      { range: '15-20', description: 'Student identifies consequences for most rounds. May miss how choices compound.' },
      { range: '8-14', description: 'Student identifies immediate consequences but not downstream or cumulative effects.' },
      { range: '0-7', description: 'Student cannot connect their choices to outcomes.' }
    ]
  },
  {
    dimension: 'Closing Reflection',
    points: 25,
    bands: [
      { range: '21-25', description: 'Response to "Would you make these choices again?" is specific, honest, and engages with at least one concrete choice. Student either defends a difficult choice or acknowledges they got something wrong.' },
      { range: '15-20', description: 'Response is genuine but general. Acknowledges complexity without naming specific moments.' },
      { range: '8-14', description: 'Response is superficial ("I would do better") without specifics.' },
      { range: '0-7', description: 'No response, or response does not engage with the actual choices made.' }
    ]
  }
]

export default function Grading() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const shouldReduce = useReducedMotion()
  const variants = shouldReduce ? { initial: {}, animate: {}, exit: {} } : pageVariants

  return (
    <motion.div
      className={styles.page}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(`/host/${sessionId}`)}>
          Back to Host
        </button>
        <h1 className={styles.title}>Grading Rubric</h1>
        <p className={styles.subtitle}>Instructor reference only. Not shown to students.</p>
        <p className={styles.totalPoints}>Total: 100 points + 10 bonus</p>
      </div>

      <div className={styles.rubricGrid}>
        {RUBRIC.map((dim) => (
          <div key={dim.dimension} className={styles.dimensionCard}>
            <div className={styles.dimensionHeader}>
              <h2 className={styles.dimensionName}>{dim.dimension}</h2>
              <span className={styles.dimensionPoints}>{dim.points} pts</span>
            </div>
            <div className={styles.bands}>
              {dim.bands.map((band) => (
                <div key={band.range} className={styles.band}>
                  <span className={styles.bandRange}>{band.range}</span>
                  <p className={styles.bandDesc}>{band.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className={`${styles.dimensionCard} ${styles.bonusCard}`}>
          <div className={styles.dimensionHeader}>
            <h2 className={styles.dimensionName}>Bonus: Baseline Alignment</h2>
            <span className={styles.dimensionPoints}>up to 10 pts</span>
          </div>
          <p className={styles.bonusText}>
            Student identifies how their choices aligned or conflicted with their stated values
            from the baseline survey. Bonus applies only if the baseline survey was completed
            before gameplay.
          </p>
          <p className={styles.bonusNote}>
            Look for: specific references to baseline answers, acknowledgment of value-behavior gaps,
            and honest engagement with moments where stated values and actual choices diverged.
          </p>
        </div>
      </div>

      <div className={styles.footer}>
        <p className={styles.footerNote}>
          The game has no score. This rubric assesses student reflection, not which choices were made.
          What matters is how the student reasons about their decisions — not whether those decisions
          were "right."
        </p>
      </div>
    </motion.div>
  )
}
