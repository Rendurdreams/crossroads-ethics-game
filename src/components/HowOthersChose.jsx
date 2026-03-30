import { getHowOthersChose } from '../lib/howOthersChose.js'
import styles from './HowOthersChose.module.css'

/**
 * HowOthersChose — research-baseline percentages alongside live class choices
 * Shown on host after round close (per D-04 / Awad et al. 2018 [3])
 *
 * @param {string} scenarioId
 * @param {Array} liveChoices — array of choice objects from round state
 * @param {number} totalPlayers
 */
export default function HowOthersChose({ scenarioId, liveChoices, totalPlayers }) {
  const research = getHowOthersChose(scenarioId)

  if (!research) return null

  // Compute live tallies
  const liveCounts = {}
  ;(liveChoices ?? []).forEach(c => {
    liveCounts[c.choice_index] = (liveCounts[c.choice_index] ?? 0) + 1
  })
  const liveTotal = (liveChoices ?? []).length

  return (
    <div className={styles.root}>
      <p className={styles.heading}>HOW OTHERS CHOSE</p>
      <p className={styles.source}>Research baseline · Awad et al. (2018)</p>

      <div className={styles.rows}>
        {research.map(item => {
          const liveCount = liveCounts[item.choiceIndex] ?? 0
          const livePct = liveTotal > 0 ? Math.round((liveCount / liveTotal) * 100) : null

          return (
            <div key={item.choiceIndex} className={styles.row}>
              <span className={styles.label}>{item.label}</span>
              <div className={styles.bars}>
                <div className={styles.barGroup}>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFillResearch}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                  <span className={styles.pct}>{item.pct}%</span>
                  <span className={styles.barTag}>research</span>
                </div>
                {livePct !== null && (
                  <div className={styles.barGroup}>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFillLive}
                        style={{ width: `${livePct}%` }}
                      />
                    </div>
                    <span className={styles.pct}>{livePct}%</span>
                    <span className={styles.barTag}>your class</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {totalPlayers > 0 && (
        <p className={styles.footer}>{liveTotal} of {totalPlayers} responded</p>
      )}
    </div>
  )
}
