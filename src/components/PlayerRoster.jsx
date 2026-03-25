import styles from './PlayerRoster.module.css'

export default function PlayerRoster({ players }) {
  if (!players || players.length === 0) {
    return (
      <p className={styles.empty}>Waiting for players to join...</p>
    )
  }

  return (
    <ul className={styles.roster}>
      {players.map(player => (
        <li key={player.id} className={styles.playerCard}>
          <span className={styles.avatar}>{player.avatar}</span>
          <span className={styles.name}>{player.name}</span>
        </li>
      ))}
    </ul>
  )
}
