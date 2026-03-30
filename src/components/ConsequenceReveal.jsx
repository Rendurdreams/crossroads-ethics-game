import { FRAMEWORKS, CONFLICT_PAIRS } from '../lib/frameworks.js'
import { findMoralConflicts } from '../lib/detection.js'
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

export default function ConsequenceReveal({ consequence, framework, worldState, moralValues, moralStances }) {
  const fw = FRAMEWORKS[framework]
  const tension = findTension(framework)

  // Detect moral conflict for THIS round's choice only
  const singleRoundHistory = framework ? [{ round: 1, frameworks: [framework] }] : []
  const moralConflicts = findMoralConflicts(singleRoundHistory, moralValues ?? null, moralStances ?? null)
  const moralConflict = moralConflicts.length > 0 ? moralConflicts[0] : null

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* 1. The narrative consequence — what happened */}
        <p className={styles.consequence}>{consequence}</p>

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

        {/* 3. The tension — what opposing view your choice went against */}
        {tension && (
          <div className={styles.tensionSection}>
            <p className={styles.sectionLabel}>THE TENSION</p>
            <p className={styles.tensionText}>
              <span className={styles.tensionHighlight}>{tension.tension}</span>
            </p>
            <p className={styles.tensionDesc}>{tension.description}</p>
          </div>
        )}

        {/* 3.5. Moral conflict indicator — per D-05/D-06/D-07 */}
        {moralConflict && (
          <p className={styles.moralConflictIndicator}>
            {moralConflict.message}
          </p>
        )}

        {/* 4. World impact — how collective choices shaped outcomes */}
        <div className={styles.impactSection}>
          <p className={styles.sectionLabel}>THE REALM</p>
          <div className={styles.impactGrid}>
            <ImpactMeter label="Trust" value={worldState.trust} />
            <ImpactMeter label="Courage" value={worldState.courage} />
            <ImpactMeter label="Solidarity" value={worldState.solidarity} />
            <ImpactMeter label="Awareness" value={worldState.awareness} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ImpactMeter({ label, value }) {
  const pct = Math.max(0, Math.min(100, value))
  const color = pct >= 60 ? '#22c55e' : pct >= 35 ? '#f59e0b' : '#ef4444'
  return (
    <div className={styles.impactMeter}>
      <div className={styles.impactHeader}>
        <span className={styles.impactLabel}>{label}</span>
        <span className={styles.impactValue}>{Math.round(pct)}</span>
      </div>
      <div className={styles.impactTrack}>
        <div
          className={styles.impactFill}
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}
