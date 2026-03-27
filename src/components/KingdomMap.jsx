import styles from './KingdomMap.module.css'

function getTier(value) {
  if (value >= 70) return 'flourishing'
  if (value >= 40) return 'neutral'
  return 'declining'
}

export default function KingdomMap({ worldState }) {
  const trustTier = getTier(worldState?.trust ?? 50)
  const courageTier = getTier(worldState?.courage ?? 50)
  const solidarityTier = getTier(worldState?.solidarity ?? 50)
  const awarenessValue = worldState?.awareness ?? 50
  // Fog: awareness tier maps to fog class (inverted — less awareness = more fog)
  const fogTier = awarenessValue >= 70 ? 'fogFlourishing' : awarenessValue >= 40 ? 'fogNeutral' : 'fogDeclining'

  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="auto"
      aria-label="Kingdom Map"
      role="img"
      className={styles.mapContainer}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width="800" height="500" fill="#0a0a14" />

      {/* Ground plane */}
      <rect x="0" y="440" width="800" height="60" fill="#14142a" />

      {/* Coastal shelf (lower-right) */}
      <polygon points="600,500 800,380 800,500" fill="rgba(59,130,246,0.08)" />

      {/* Mountains (upper-right quadrant) */}
      <polygon points="480,320 530,200 580,320" fill="#1a1a2e" />
      <polygon points="540,320 610,160 680,320" fill="#16162a" />
      <polygon points="630,320 700,210 760,320" fill="#1a1a2e" />
      <polygon points="700,340 750,250 800,340" fill="#14142a" />

      {/* Forest (left side) — triangle trees */}
      <polygon points="40,440 58,390 76,440" fill="#141428" />
      <polygon points="65,440 85,385 105,440" fill="#141428" />
      <polygon points="95,440 115,395 135,440" fill="#141428" />
      <polygon points="55,440 72,400 89,440" fill="#141428" />
      <polygon points="120,440 140,400 160,440" fill="#141428" />
      <polygon points="30,440 48,405 66,440" fill="#141428" />
      <polygon points="145,440 162,408 179,440" fill="#141428" />

      {/* Village mound (center-left raised area) */}
      <polygon points="200,440 260,390 320,440" fill="#16162a" />

      {/* River: S-curve diagonal from upper-center to lower-right */}
      <path
        d="M 360 120 C 380 180, 420 200, 440 260 C 460 320, 500 340, 540 400"
        stroke="rgba(59,130,246,0.18)"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />

      {/* ── BRIDGE OF ACCORD (trust) — river crossing area ── */}
      <g className={styles[trustTier]}>
        {/* Bridge span */}
        <rect x="405" y="228" width="80" height="8" rx="2" />
        {/* Left pier */}
        <rect x="410" y="228" width="10" height="18" rx="1" />
        {/* Right pier */}
        <rect x="465" y="228" width="10" height="18" rx="1" />
        {/* Arch suggestion */}
        <path d="M 415 228 Q 450 214 475 228" stroke="currentColor" strokeWidth="2" fill="none" />
      </g>
      <text
        x="450"
        y="262"
        textAnchor="middle"
        fontFamily="var(--serif)"
        fontSize="13"
        fill="rgba(245,158,11,0.6)"
        letterSpacing="0.1em"
      >
        Bridge of Accord
      </text>

      {/* ── CITADEL BEACON (courage) — mountain peak ── */}
      <g className={styles[courageTier]}>
        {/* Tower body */}
        <rect x="604" y="190" width="12" height="35" rx="1" />
        {/* Tower cap */}
        <polygon points="604,190 610,172 616,190" />
        {/* Beacon ray */}
        <line x1="610" y1="172" x2="610" y2="148" stroke="currentColor" strokeWidth="2" />
      </g>
      <text
        x="610"
        y="240"
        textAnchor="middle"
        fontFamily="var(--serif)"
        fontSize="13"
        fill="rgba(245,158,11,0.6)"
        letterSpacing="0.1em"
      >
        Citadel Beacon
      </text>

      {/* ── VILLAGE QUARTER (solidarity) — center-left mound ── */}
      <g className={styles[solidarityTier]}>
        {/* House 1 */}
        <rect x="220" y="410" width="14" height="10" rx="1" />
        <polygon points="220,410 227,400 234,410" />
        {/* Chimney 1 */}
        <rect x="223" y="404" width="3" height="5" />
        {/* House 2 */}
        <rect x="245" y="412" width="14" height="10" rx="1" />
        <polygon points="245,412 252,402 259,412" />
        {/* Chimney 2 */}
        <rect x="248" y="406" width="3" height="5" />
        {/* House 3 */}
        <rect x="270" y="411" width="14" height="10" rx="1" />
        <polygon points="270,411 277,401 284,411" />
        {/* Chimney 3 */}
        <rect x="273" y="405" width="3" height="5" />
      </g>
      <text
        x="252"
        y="440"
        textAnchor="middle"
        fontFamily="var(--serif)"
        fontSize="13"
        fill="rgba(245,158,11,0.6)"
        letterSpacing="0.1em"
      >
        Village Quarter
      </text>

      {/* ── FOG OF THE VALE (awareness) — lower-left ── */}
      {/* Fog inverts: high awareness = less fog, low awareness = more fog */}
      <g className={styles[fogTier]}>
        <ellipse cx="120" cy="430" rx="140" ry="30" />
        <ellipse cx="80" cy="445" rx="90" ry="20" />
        <ellipse cx="170" cy="450" rx="70" ry="16" />
      </g>
      <text
        x="120"
        y="488"
        textAnchor="middle"
        fontFamily="var(--serif)"
        fontSize="13"
        fill="rgba(245,158,11,0.6)"
        letterSpacing="0.1em"
      >
        Fog of the Vale
      </text>
    </svg>
  )
}
