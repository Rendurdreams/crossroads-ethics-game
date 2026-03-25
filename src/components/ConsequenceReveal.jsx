import MeterBar from '../components/MeterBar.jsx'
import FrameworkLabel from '../components/FrameworkLabel.jsx'
import styles from './ConsequenceReveal.module.css'

export default function ConsequenceReveal({ consequence, framework, explanation, worldState }) {
  return (
    <div className={styles.container}>
      <p className={styles.consequence}>{consequence}</p>

      <div className={styles.frameworkWrapper}>
        <FrameworkLabel framework={framework} explanation={explanation} />
      </div>

      <div className={styles.metersWrapper}>
        <p className={styles.metersLabel}>WORLD STATE</p>
        <div className={styles.meters}>
          <MeterBar label="Trust" value={worldState.trust} />
          <MeterBar label="Courage" value={worldState.courage} />
          <MeterBar label="Solidarity" value={worldState.solidarity} />
          <MeterBar label="Awareness" value={worldState.awareness} />
        </div>
      </div>
    </div>
  )
}
