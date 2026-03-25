import styles from './CityPlaceholder.module.css'

export default function CityPlaceholder() {
  return (
    <div className={styles.panel}>
      <svg
        width="300"
        height="120"
        viewBox="0 0 300 120"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Skyline buildings from left to right */}
        <rect x="0" y="70" width="30" height="50" fill="#1a1a2a" />
        <rect x="34" y="50" width="24" height="70" fill="#1a1a2a" />
        <rect x="62" y="30" width="36" height="90" fill="#1a1a2a" />
        <rect x="102" y="55" width="28" height="65" fill="#1a1a2a" />
        <rect x="134" y="20" width="32" height="100" fill="#1a1a2a" />
        <rect x="170" y="40" width="26" height="80" fill="#1a1a2a" />
        <rect x="200" y="60" width="38" height="60" fill="#1a1a2a" />
        <rect x="242" y="35" width="28" height="85" fill="#1a1a2a" />
        <rect x="274" y="65" width="26" height="55" fill="#1a1a2a" />
        {/* Ground line */}
        <rect x="0" y="118" width="300" height="2" fill="#1a1a2a" />
      </svg>
      <p className={styles.label}>CITY VIEW</p>
    </div>
  )
}
