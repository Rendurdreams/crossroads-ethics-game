import styles from './TimerDisplay.module.css'

function formatTime(seconds) {
  if (seconds <= 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function TimerDisplay({ remaining, total }) {
  const isDanger = remaining < 10
  const isTimesUp = remaining === 0
  const pct = total > 0 ? (remaining / total) * 100 : 0

  return (
    <div className={styles.timer}>
      <p className={styles.timerLabel}>Time remaining</p>
      <div className={`${styles.countdown} ${isDanger ? styles.countdownDanger : ''}`}>
        {isTimesUp ? "Time's up" : formatTime(remaining)}
      </div>
      <div className={styles.track}>
        <div
          className={`${styles.bar} ${isDanger ? styles.barDanger : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
