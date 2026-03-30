import { getHowOthersChose } from '../lib/howOthersChose.js'
import styles from './HowOthersChose.module.css'

export default function HowOthersChose({ scenarioId, liveChoices, totalPlayers }) {
  const reference = getHowOthersChose(scenarioId)

  if (!reference) return null

  return (
    <div className={styles.container}>
      <p className={styles.heading}>How Others Chose</p>
      <p className={styles.subheading}>Research baseline vs. your class</p>

      <div className={styles.legend}>
        <span className={styles.legendRef}>Research baseline</span>
        <span className={styles.legendLive}>Your class</span>
      </div>

      {reference.map((ref) => {
        const liveCount = liveChoices.filter(c => c.choice_index === ref.choiceIndex).length
        const livePct = totalPlayers > 0 ? Math.round((liveCount / totalPlayers) * 100) : 0

        return (
          <div key={ref.choiceIndex} className={styles.row}>
            <span className={styles.label}>{ref.label}</span>
            <div className={styles.bars}>
              <div className={styles.barGroup}>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barRef}
                    style={{ width: `${ref.pct}%` }}
                  />
                </div>
                <span className={styles.pctLabel}>{ref.pct}%</span>
              </div>
              <div className={styles.barGroup}>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barLive}
                    style={{ width: `${livePct}%` }}
                  />
                </div>
                <span className={styles.pctLabel}>{livePct}%</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
