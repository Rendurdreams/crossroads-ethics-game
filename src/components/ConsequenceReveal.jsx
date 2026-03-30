import MeterBar from '../components/MeterBar.jsx'
import FrameworkLabel from '../components/FrameworkLabel.jsx'
import styles from './ConsequenceReveal.module.css'

export default function ConsequenceReveal({ consequence, conscienceLayer, framework, explanation, worldState, moralValues, moralStances, hasMoralConflict }) {
  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${hasMoralConflict ? styles.cardConflict : ''}`}>
        <p className={styles.consequence}>{consequence}</p>

        {conscienceLayer && (
          <p className={styles.conscienceLayer}>{conscienceLayer}</p>
        )}

        <div className={styles.frameworkWrapper}>
          <FrameworkLabel framework={framework} explanation={explanation} />
        </div>

        <div className={styles.metersWrapper}>
          <p className={styles.metersLabel}>THE REALM</p>
          <div className={styles.meters}>
            <MeterBar label="Bridge of Accord" value={worldState.trust} />
            <MeterBar label="Citadel Beacon" value={worldState.courage} />
            <MeterBar label="Village Quarter" value={worldState.solidarity} />
            <MeterBar label="Fog of the Vale" value={worldState.awareness} />
          </div>
        </div>
      </div>
    </div>
  )
}
