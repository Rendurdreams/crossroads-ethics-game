import styles from './VoteTally.module.css'

export default function VoteTally({ tally, submitted, total }) {
  const hasVotes = tally && tally.some(t => t.count > 0)

  return (
    <div className={styles.container}>
      {(!tally || tally.length === 0 || !hasVotes) ? (
        <p className={styles.empty}>No submissions yet</p>
      ) : (
        tally.map((option, i) => (
          <div key={i} className={styles.row}>
            <div className={styles.labelRow}>
              <span className={styles.label}>
                {option.text.length > 40
                  ? option.text.slice(0, 40) + '…'
                  : option.text}
              </span>
              <span className={styles.countPct}>
                {option.count} ({option.pct}%)
              </span>
            </div>
            <div className={styles.track}>
              <div
                className={styles.fill}
                style={{ width: `${option.pct}%` }}
              />
            </div>
          </div>
        ))
      )}

      <p className={styles.submittedLine}>
        <span className={styles.submittedCount}>{submitted}</span>
        {' '}of {total} submitted
      </p>
    </div>
  )
}
