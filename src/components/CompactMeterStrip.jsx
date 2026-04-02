import { useRef } from 'react'
import { getAxisLabels } from '../lib/axisConstants.js'
import styles from './CompactMeterStrip.module.css'

const METER_COLORS = {
  // Kingdom arc axes
  trust:      '#3b82f6',
  courage:    '#f59e0b',
  solidarity: '#22c55e',
  awareness:  '#a855f7',
  // Signal Lost axes
  CT:  '#3b82f6',
  HD:  '#a855f7',
  SOL: '#22c55e',
  ACC: '#f59e0b',
}

const ABBREVIATIONS = {
  trust:      'HON',
  courage:    'CRG',
  solidarity: 'LOY',
  awareness:  'EMP',
  CT:         'CT',
  HD:         'HD',
  SOL:        'SOL',
  ACC:        'ACC',
}

export default function CompactMeterStrip({ worldState, pack, roundClosed }) {
  const axisLabels = getAxisLabels(pack)
  const axisKeys = Object.keys(axisLabels)

  // Track previous world state to compute deltas
  const prevStateRef = useRef(null)
  const deltasRef = useRef({})
  const wasClosedRef = useRef(false)

  // Clear deltas when a new round starts (roundClosed transitions false after being true)
  if (wasClosedRef.current && !roundClosed) {
    deltasRef.current = {}
    prevStateRef.current = null
  }
  wasClosedRef.current = roundClosed

  // Compute and store deltas when values change
  if (worldState) {
    const prev = prevStateRef.current
    if (prev) {
      const newDeltas = {}
      axisKeys.forEach(key => {
        const diff = (worldState[key] ?? 50) - (prev[key] ?? 50)
        if (diff !== 0) {
          newDeltas[key] = diff
        }
      })
      if (Object.keys(newDeltas).length > 0) {
        deltasRef.current = { ...deltasRef.current, ...newDeltas }
      }
    }
    prevStateRef.current = worldState
  }

  return (
    <div className={styles.strip}>
      {axisKeys.map(key => {
        const color = METER_COLORS[key] ?? '#3b82f6'
        const abbr = ABBREVIATIONS[key] ?? key
        const value = Math.round(worldState?.[key] ?? 50)
        const delta = deltasRef.current[key]
        const showArrow = roundClosed && delta != null && delta !== 0

        return (
          <div key={key} className={styles.axis}>
            <span style={{ color }}>{abbr}</span>
            <span style={{ color }}>{value}</span>
            {showArrow && (
              <span
                className={styles.arrow}
                style={{ color: delta > 0 ? '#22c55e' : '#ef4444' }}
              >
                {delta > 0 ? '▲' : '▼'}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
