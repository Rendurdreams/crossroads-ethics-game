import { useState, useEffect } from 'react'
import styles from './WalkMechanic.module.css'

export default function WalkMechanic({ onChoice, submitting, lockedIndex, scenario }) {
  const [showMiddle, setShowMiddle] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowMiddle(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  const isLocked = lockedIndex !== null

  // Derive labels from scenario choices, or use defaults
  const choices = scenario?.choices ?? []
  const leftLabel = choices[0]?.text ?? 'Free Irel'
  const rightLabel = choices[1]?.text ?? 'Walk away'
  const middleLabel = choices[2]?.text ?? 'Commission scholars — one year'

  // Signal Lost uses terminal/corridor theming
  const isSignalLost = scenario?.id?.startsWith('signal-')
  const leftIcon = isSignalLost ? '⚡' : '⛓'
  const rightIcon = isSignalLost ? '🚪' : '🚪'

  const avatarPosition = lockedIndex === 0 ? 'Left' : lockedIndex === 1 ? 'Right' : lockedIndex === 2 ? 'Center' : 'Middle'

  return (
    <div className={styles.walkContainer}>
      <p className={styles.instruction}>
        {isSignalLost ? 'The terminal is at the end of the corridor' : 'Walk toward your choice'}
      </p>

      <div className={styles.track}>
        <button
          className={[
            styles.zone,
            styles.zoneLeft,
            lockedIndex === 0 ? styles.zoneLocked : '',
            isLocked && lockedIndex !== 0 ? styles.zoneDimmed : ''
          ].filter(Boolean).join(' ')}
          onClick={() => !submitting && !isLocked && onChoice(0)}
          disabled={submitting || isLocked}
        >
          <span className={styles.zoneIcon}>{leftIcon}</span>
          <span className={styles.zoneLabel}>{leftLabel}</span>
        </button>

        <div className={`${styles.avatar} ${isLocked ? styles[`avatar${avatarPosition}`] : ''}`}>
          🚶
        </div>

        <button
          className={[
            styles.zone,
            styles.zoneRight,
            lockedIndex === 1 ? styles.zoneLocked : '',
            isLocked && lockedIndex !== 1 ? styles.zoneDimmed : ''
          ].filter(Boolean).join(' ')}
          onClick={() => !submitting && !isLocked && onChoice(1)}
          disabled={submitting || isLocked}
        >
          <span className={styles.zoneIcon}>{rightIcon}</span>
          <span className={styles.zoneLabel}>{rightLabel}</span>
        </button>
      </div>

      {showMiddle && (
        <button
          className={[
            styles.middleBtn,
            lockedIndex === 2 ? styles.zoneLocked : '',
            isLocked && lockedIndex !== 2 ? styles.zoneDimmed : ''
          ].filter(Boolean).join(' ')}
          onClick={() => !submitting && !isLocked && onChoice(2)}
          disabled={submitting || isLocked}
        >
          {middleLabel}
        </button>
      )}
    </div>
  )
}
