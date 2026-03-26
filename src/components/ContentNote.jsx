import styles from './ContentNote.module.css'

export default function ContentNote({ note, onContinue, onPass }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <p className={styles.header}>A note before this round</p>
        <p className={styles.note}>{note}</p>
        <button className={styles.continueBtn} onClick={onContinue}>
          Continue to round
        </button>
        <button className={styles.passLink} onClick={onPass}>
          Pass this round
        </button>
      </div>
    </div>
  )
}
