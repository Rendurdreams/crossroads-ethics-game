import { useState } from 'react'
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

function WorldHealthBar({ worldState, axisLabels, isSignalLost }) {
  const [expanded, setExpanded] = useState(false)
  const keys = Object.keys(axisLabels)
  const values = keys.map(k => worldState?.[k] ?? 50)
  const health = Math.round(values.reduce((a, b) => a + b, 0) / values.length)
  const color = health >= 50 ? 'var(--accent-cyan, #06b6d4)' : 'var(--accent-red, #ef4444)'
  const bgColor = health >= 50 ? 'rgba(6, 182, 212, 0.15)' : 'rgba(239, 68, 68, 0.15)'

  return (
    <div className={styles.impactSection}>
      <button
        className={styles.healthBar}
        onClick={() => setExpanded(v => !v)}
        style={{ borderColor: color }}
      >
        <div className={styles.healthFill} style={{ width: `${health}%`, background: color, boxShadow: `0 0 12px ${bgColor}` }} />
        <span className={styles.healthLabel} style={{ color }}>
          {isSignalLost ? 'WORLD' : 'REALM'} {health}%
        </span>
        <span className={styles.healthToggle}>{expanded ? '\u25B4' : '\u25BE'}</span>
      </button>
      {expanded && (
        <div className={styles.impactGrid}>
          {Object.entries(axisLabels).map(([key, label]) => (
            <MeterBar key={key} label={label} value={worldState?.[key] ?? 50} />
          ))}
        </div>
      )}
    </div>
  )
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

        {/* World impact — health bar with tap-to-expand */}
        <WorldHealthBar worldState={worldState} axisLabels={axisLabels} isSignalLost={isSignalLost} />
      </div>
    </div>
  )
}
