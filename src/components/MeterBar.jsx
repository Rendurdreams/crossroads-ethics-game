import { useState, useEffect, useRef } from 'react'
import styles from './MeterBar.module.css'

export default function MeterBar({ label, value }) {
  const clampedValue = Math.max(0, Math.min(100, value))
  const prevValue = useRef(clampedValue)
  const [flash, setFlash] = useState(null) // 'up' | 'down' | null
  const [delta, setDelta] = useState(null)

  useEffect(() => {
    const prev = prevValue.current
    if (prev !== clampedValue) {
      const diff = clampedValue - prev
      setFlash(diff > 0 ? 'up' : 'down')
      setDelta(diff > 0 ? `+${Math.round(diff)}` : `${Math.round(diff)}`)
      prevValue.current = clampedValue

      const timer = setTimeout(() => {
        setFlash(null)
        setDelta(null)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [clampedValue])

  return (
    <div className={`${styles.meter} ${flash === 'up' ? styles.flashUp : ''} ${flash === 'down' ? styles.flashDown : ''}`}>
      <div className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
        <span className={styles.valueRow}>
          {delta && (
            <span className={flash === 'up' ? styles.deltaUp : styles.deltaDown}>
              {delta}
            </span>
          )}
          <span className={styles.value}>{Math.round(clampedValue)}</span>
        </span>
      </div>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}
