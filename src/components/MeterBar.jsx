import styles from './MeterBar.module.css'

export default function MeterBar({ label, value }) {
  const isDanger = value < 20
  const clampedValue = Math.max(0, Math.min(100, value))

  return (
    <div className={styles.meter}>
      <div className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{Math.round(clampedValue)}</span>
      </div>
      <div className={styles.track}>
        <div
          className={`${styles.fill} ${isDanger ? styles.fillDanger : ''}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}
