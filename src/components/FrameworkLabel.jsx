import { FRAMEWORKS } from '../lib/frameworks.js'
import styles from './FrameworkLabel.module.css'

export default function FrameworkLabel({ framework, explanation }) {
  const frameworkData = FRAMEWORKS[framework]
  if (!frameworkData) return null

  return (
    <div className={styles.badge}>
      <span className={styles.name}>{FRAMEWORKS[framework].name}</span>
      {explanation && (
        <p className={styles.explanation}>{explanation}</p>
      )}
    </div>
  )
}
