import { FRAMEWORKS, CONFLICT_PAIRS } from '../lib/frameworks.js'
import { findMoralConflicts } from '../lib/detection.js'
import MeterBar from '../components/MeterBar.jsx'
import styles from './ConsequenceReveal.module.css'

function findTension(frameworkKey) {
  const pair = CONFLICT_PAIRS.find(p => p.frameworks.includes(frameworkKey))
  if (!pair) return null
  const opposing = pair.frameworks.find(f => f !== frameworkKey)
  return {
    opposingName: FRAMEWORKS[opposing]?.name,
    tension: pair.tension,
    description: pair.description
  }
}

export default function ConsequenceReveal({ consequence, conscienceLayer, frameworks, scenarioId, choiceIndex, round, worldState, moralValues, moralStances, hasMoralConflict }) {
  const primaryFramework = frameworks?.[0] ?? null
  const fw = primaryFramework ? FRAMEWORKS[primaryFramework] : null
  const tension = primaryFramework ? findTension(primaryFramework) : null

  // Detect moral conflict for THIS round's choice only
  // Pass full context so matchCondition triggers (VALUE_CONDITION_TRIGGERS + STANCE_TRIGGERS) can fire
  const singleRoundHistory = frameworks?.length > 0 ? [{
    round: round ?? 1,
    scenarioId: scenarioId ?? null,
    choiceIndex: choiceIndex ?? null,
    frameworks
  }] : []
  const moralConflicts = findMoralConflicts(singleRoundHistory, moralValues ?? null, moralStances ?? null)
  const moralConflict = moralConflicts.length > 0 ? moralConflicts[0] : null

  return (
    <div className={styles.container}>
      <div className={`${styles.card}${hasMoralConflict ? ` ${styles.cardConflict}` : ''}`}>
        {/* 1. The narrative consequence */}
        <p className={styles.consequence}>{consequence}</p>

        {/* 1.5 Conscience layer */}
        {conscienceLayer && (
          <p className={styles.conscienceLayer}>{conscienceLayer}</p>
        )}

        {/* 2. Framework: what ethical tradition this choice represents */}
        {fw && (
          <div className={styles.frameworkSection}>
            <p className={styles.sectionLabel}>YOUR REASONING</p>
            <p className={styles.frameworkName}>{fw.name}</p>
            <p className={styles.frameworkDesc}>{fw.description}</p>
            <p className={styles.frameworkQuestion}>
              The question this framework asks: <em>{fw.question}</em>
            </p>
          </div>
        )}

        {/* 3. The tension — opposing view */}
        {tension && (
          <div className={styles.tensionSection}>
            <p className={styles.sectionLabel}>THE TENSION</p>
            <p className={styles.tensionText}>
              <span className={styles.tensionHighlight}>{tension.tension}</span>
            </p>
            <p className={styles.tensionDesc}>{tension.description}</p>
          </div>
        )}

        {/* 3.5. Moral conflict indicator */}
        {moralConflict && (
          <p className={styles.moralConflictIndicator}>
            {moralConflict.message}
          </p>
        )}

        {/* 4. World impact */}
        <div className={styles.impactSection}>
          <p className={styles.sectionLabel}>THE REALM</p>
          <div className={styles.impactGrid}>
            <MeterBar label="Trust" value={worldState.trust} />
            <MeterBar label="Courage" value={worldState.courage} />
            <MeterBar label="Solidarity" value={worldState.solidarity} />
            <MeterBar label="Awareness" value={worldState.awareness} />
          </div>
        </div>
      </div>
    </div>
  )
}
