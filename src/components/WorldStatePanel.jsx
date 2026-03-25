import VoteTally from './VoteTally.jsx'
import MeterBar from './MeterBar.jsx'
import TimerDisplay from './TimerDisplay.jsx'
import styles from './WorldStatePanel.module.css'

export default function WorldStatePanel({
  scenario,
  tally,
  submitted,
  totalPlayers,
  worldState,
  timerRemaining,
  timerTotal,
  roundClosed,
  onCloseRound,
  onNextRound,
  onEndGame,
  isLastRound
}) {
  return (
    <div className={styles.panel}>

      {/* Section 1 — Scenario header */}
      <div className={styles.section}>
        <p className={styles.scenarioTitle}>
          {scenario?.title ?? '—'}
        </p>
        <p className={styles.weightBadge}>
          [Weight: {scenario?.weight ? scenario.weight.charAt(0).toUpperCase() + scenario.weight.slice(1) : '—'}]
        </p>
      </div>

      {/* Section 2 — Vote Tally */}
      <div className={styles.section}>
        <VoteTally
          tally={tally}
          submitted={submitted}
          total={totalPlayers}
        />
      </div>

      {/* Section 3 — World State */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>World State</p>
        <div className={styles.meters}>
          <MeterBar label="Trust" value={worldState?.trust ?? 50} />
          <MeterBar label="Courage" value={worldState?.courage ?? 50} />
          <MeterBar label="Solidarity" value={worldState?.solidarity ?? 50} />
          <MeterBar label="Awareness" value={worldState?.awareness ?? 50} />
        </div>
      </div>

      {/* Section 4 — Timer */}
      <div className={styles.section}>
        <TimerDisplay remaining={timerRemaining} total={timerTotal} />
      </div>

      {/* Section 5 — Action buttons */}
      <div className={styles.section}>
        {!roundClosed && (
          <button className={styles.actionBtn} onClick={onCloseRound}>
            Close Round
          </button>
        )}
        {roundClosed && !isLastRound && (
          <button className={styles.actionBtn} onClick={onNextRound}>
            Next Round
          </button>
        )}
        {roundClosed && isLastRound && (
          <button className={styles.actionBtn} onClick={onEndGame}>
            End Game
          </button>
        )}
      </div>

    </div>
  )
}
