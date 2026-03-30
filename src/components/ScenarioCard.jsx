import styles from './ScenarioCard.module.css'

const ROMAN = ['I', 'II', 'III']

export default function ScenarioCard({ scenario, lockedIndex, onChoice, submitting, submitError }) {
  if (!scenario) return null

  const isLocked = lockedIndex !== null

  function handleClick(choiceIndex) {
    if (submitting) return
    onChoice(choiceIndex)
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{scenario.title}</h2>
      <p className={styles.body}>{scenario.text}</p>

      <div className={`${styles.choices} ${isLocked ? styles.choicesLocked : ''}`}>
        {scenario.choices.map((choice) => {
          const isLockedChoice = lockedIndex === choice.choiceIndex
          const isDimmed = isLocked && !isLockedChoice

          return (
            <button
              key={choice.choiceIndex}
              className={[
                styles.choiceBtn,
                isLockedChoice ? styles.choiceLocked : '',
                isDimmed ? styles.choiceDimmed : '',
                isLocked && isLockedChoice && submitError ? styles.choiceError : ''
              ].filter(Boolean).join(' ')}
              onClick={() => handleClick(choice.choiceIndex)}
              disabled={submitting}
              style={isLocked && isLockedChoice && submitError ? { pointerEvents: 'auto' } : undefined}
            >
              <span className={styles.choiceNumeral}>{ROMAN[choice.choiceIndex]}.</span>
              {choice.text}
            </button>
          )
        })}
      </div>

      {submitError && (
        <p className={styles.errorMsg}>Couldn&apos;t submit — tap to try again</p>
      )}
    </div>
  )
}
