import { FRAMEWORKS } from '../lib/frameworks.js'
import { getScenarioByRound } from '../lib/scenarios.js'
import styles from './FrameworkProfile.module.css'

/**
 * FrameworkProfile — Player end screen
 * Shows dominant framework, conflict map, least-used prompt, and choice log.
 *
 * @param {{ player: {
 *   dominant_framework: string|null,
 *   conflicts: Array,
 *   framework_counts: object,
 *   choice_history: Array
 * }}} props
 */
export default function FrameworkProfile({ player }) {
  if (!player) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.emptyTitle} style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '32px' }}>
          Loading your profile...
        </p>
      </div>
    )
  }

  const {
    dominant_framework: dominant,
    conflicts = [],
    framework_counts: frameworkCounts = {},
    choice_history: choiceHistory = []
  } = player

  // Compute least-used framework from framework_counts
  const leastUsedKey = frameworkCounts && Object.keys(frameworkCounts).length > 0
    ? Object.entries(frameworkCounts).sort((a, b) => a[1] - b[1])[0][0]
    : null

  const hasChoices = choiceHistory && choiceHistory.length > 0

  return (
    <div className={styles.wrapper}>

      {/* Empty state — player passed all rounds */}
      {dominant === null && (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>You passed this round.</p>
          <p className={styles.emptySub}>Passing is a choice too. Here&rsquo;s what the group decided.</p>
        </div>
      )}

      {/* Section 1 — Dominant Framework Card */}
      {dominant !== null && FRAMEWORKS[dominant] && (
        <div className={styles.sectionCard}>
          <p className={styles.eyebrow}>Your Framework</p>
          <h2 className={styles.frameworkName}>{FRAMEWORKS[dominant].name}</h2>
          <p className={styles.explanation}>{FRAMEWORKS[dominant].description}</p>
        </div>
      )}

      {/* Section 2 — Conflict Map (conditional) */}
      {dominant !== null && conflicts.length > 0 && (
        <div className={styles.conflictSection}>
          <p className={styles.eyebrow}>Where the Conflict Lived</p>
          {conflicts.map((conflict, idx) => {
            const f0 = conflict.frameworks[0]
            const f1 = conflict.frameworks[1]
            const f0Name = FRAMEWORKS[f0] ? FRAMEWORKS[f0].name : f0
            const f1Name = FRAMEWORKS[f1] ? FRAMEWORKS[f1].name : f1
            const roundA = conflict.rounds[0]
            const roundB = conflict.rounds[conflict.rounds.length - 1]
            return (
              <div key={idx} className={styles.conflictBlock}>
                <p className={styles.conflictRounds}>
                  In Round {roundA} and Round {roundB}
                </p>
                <svg
                  className={styles.conflictSvg}
                  width="240"
                  height="80"
                  viewBox="0 0 240 80"
                  aria-hidden="true"
                >
                  {/* Connecting line */}
                  <line x1="40" y1="40" x2="200" y2="40" stroke="#2e303a" strokeWidth="1" />
                  {/* Tension label */}
                  <text
                    x="120"
                    y="28"
                    textAnchor="middle"
                    fill="#f59e0b"
                    fontSize="12"
                    fontFamily="system-ui, sans-serif"
                  >
                    {conflict.tension}
                  </text>
                  {/* Left circle */}
                  <circle cx="40" cy="40" r="20" fill="#12121e" stroke="#f59e0b" strokeWidth="1.5" />
                  {/* Right circle */}
                  <circle cx="200" cy="40" r="20" fill="#12121e" stroke="#f59e0b" strokeWidth="1.5" />
                  {/* Left label */}
                  <text
                    x="40"
                    y="72"
                    textAnchor="middle"
                    fill="#6b7280"
                    fontSize="11"
                    fontFamily="system-ui, sans-serif"
                  >
                    {f0Name}
                  </text>
                  {/* Right label */}
                  <text
                    x="200"
                    y="72"
                    textAnchor="middle"
                    fill="#6b7280"
                    fontSize="11"
                    fontFamily="system-ui, sans-serif"
                  >
                    {f1Name}
                  </text>
                </svg>
                <p className={styles.conflictDescription}>{conflict.description}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Section 3 — Framework You Used Least */}
      {dominant !== null && leastUsedKey && FRAMEWORKS[leastUsedKey] && (
        <div className={styles.leastUsedSection}>
          <p className={styles.eyebrow}>The Framework You Used Least</p>
          <h3 className={styles.leastFrameworkName}>{FRAMEWORKS[leastUsedKey].name}</h3>
          <p className={styles.leastPrompt}>{FRAMEWORKS[leastUsedKey].question}</p>
          <p className={styles.leastPrompt} style={{ marginTop: '8px' }}>
            {FRAMEWORKS[leastUsedKey].description}
          </p>
        </div>
      )}

      {/* Section 4 — Choice Log */}
      <div className={styles.choiceLog}>
        <p className={styles.eyebrow}>Your Choices</p>
        {!hasChoices && (
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No choices recorded.</p>
        )}
        {hasChoices && choiceHistory.map((entry, idx) => {
          const scenario = getScenarioByRound(entry.round)
          const choice = scenario && scenario.choices[entry.choiceIndex]
          const roundTitle = scenario ? scenario.title : `Round ${entry.round}`
          const choiceText = choice ? choice.text.slice(0, 80) : '—'
          const frameworkTag = entry.frameworks && entry.frameworks[0]
          const frameworkTagName = frameworkTag && FRAMEWORKS[frameworkTag]
            ? FRAMEWORKS[frameworkTag].name
            : frameworkTag

          const isLast = idx === choiceHistory.length - 1

          return (
            <div key={idx} className={isLast ? styles.choiceRowLast : styles.choiceRow}>
              <p className={styles.roundName}>{roundTitle}</p>
              <p className={styles.choiceText}>{choiceText}</p>
              {frameworkTag && (
                <span className={styles.frameworkTag}>{frameworkTagName}</span>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}
