import { FRAMEWORKS, CONFLICT_PAIRS } from '../lib/frameworks.js'
import { findMoralConflicts } from '../lib/detection.js'
import { getAxisLabels } from '../lib/axisConstants.js'
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

export default function ConsequenceReveal({ consequence, conscienceLayer, frameworks, scenarioId, choiceIndex, round, worldState, moralValues, moralStances, hasMoralConflict, pack }) {
  const primaryFramework = frameworks?.[0] ?? null
  const fw = primaryFramework ? FRAMEWORKS[primaryFramework] : null
  const tension = primaryFramework ? findTension(primaryFramework) : null

  const singleRoundHistory = frameworks?.length > 0 ? [{
    round: round ?? 1,
    scenarioId: scenarioId ?? null,
    choiceIndex: choiceIndex ?? null,
    frameworks
  }] : []
  const moralConflicts = findMoralConflicts(singleRoundHistory, moralValues ?? null, moralStances ?? null)
  const moralConflict = moralConflicts.length > 0 ? moralConflicts[0] : null

  // Use pack-aware axis labels
  const axisLabels = getAxisLabels(pack)
  const isSignalLost = pack?.id === 'signal-lost'

  // Skip conscienceLayer if it's identical to consequence
  const showConscienceLayer = conscienceLayer && conscienceLayer !== consequence

  return (
    <div className={styles.container}>
      <div className={`${styles.card}${hasMoralConflict ? ` ${styles.cardConflict}` : ''}`}>
        {/* Consequence narrative */}
        <p className={styles.consequence}>{consequence}</p>

        {/* Conscience layer — only if different from consequence */}
        {showConscienceLayer && (
          <p className={styles.conscienceLayer}>{conscienceLayer}</p>
        )}

        {/* Framework label — compact */}
        {fw && (
          <div className={styles.frameworkSection}>
            <span className={styles.frameworkName}>{fw.name}</span>
            <span className={styles.frameworkQuestion}>{fw.question}</span>
          </div>
        )}

        {/* Moral conflict — only if triggered */}
        {moralConflict && (
          <p className={styles.moralConflictIndicator}>
            {moralConflict.message}
          </p>
        )}

        {/* World impact — pack-aware axis labels */}
        <div className={styles.impactSection}>
          <p className={styles.sectionLabel}>{isSignalLost ? 'WORLD STATE' : 'THE REALM'}</p>
          <div className={styles.impactGrid}>
            {Object.entries(axisLabels).map(([key, label]) => (
              <MeterBar key={key} label={label} value={worldState?.[key] ?? 50} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
