import { motion, useReducedMotion } from 'framer-motion'
import { FRAMEWORKS } from '../lib/frameworks.js'
import { getScenarioByRound } from '../lib/scenarios.js'
import styles from './FrameworkProfile.module.css'

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.25 } }
}

const sectionVariants = {
  hidden:  { opacity: 0, y: 12 },
  show:    { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
}

const ARC_NARRATIVES = {
  'consequentialism->deontology': 'You moved from optimizing for outcomes to holding principles regardless of cost. Philosophers call this the shift from teleological to deontological reasoning.',
  'consequentialism->care': 'You shifted from calculating the greatest good to prioritizing the person in front of you. This is the move from abstract utility to relational ethics.',
  'consequentialism->virtue': 'You moved from weighing outcomes to asking what a person of character would do. This reflects a shift from results-based to character-based moral reasoning.',
  'deontology->consequentialism': 'You shifted from holding rules absolutely to weighing outcomes. Philosophers call this moving from principled to pragmatic reasoning.',
  'deontology->care': 'You moved from duty-based rules to relational concern. This is the shift Gilligan described -- from justice to care as the organizing moral principle.',
  'deontology->virtue': 'You shifted from following rules to embodying character. Both are principled -- but virtue asks who you are, not just what you must do.',
  'care->consequentialism': 'You moved from protecting the people closest to you to optimizing for the group. This is the tension between relational and utilitarian ethics.',
  'care->deontology': 'You shifted from relational loyalty to principled duty. Philosophers call this moving from particularist to universalist moral reasoning.',
  'care->virtue': 'You moved from protecting relationships to acting from personal integrity. Both center the individual -- but virtue prizes character over connection.',
  'virtue->consequentialism': 'You shifted from doing what character demands to weighing what produces the best result. This is the move from agent-centered to outcome-centered ethics.',
  'virtue->deontology': 'You moved from character-driven courage to rule-driven duty. Both are principled -- but deontology answers to rules, virtue answers to the self.',
  'virtue->care': 'You shifted from personal integrity to relational concern. This is the tension between standing alone for what is right and standing with someone who needs you.'
}

/**
 * FrameworkProfile -- Player end screen
 * Shows dominant framework, moral arc, conflict map, least-used prompt, and choice log.
 *
 * @param {{ player: {
 *   dominant_framework: string|null,
 *   conflicts: Array,
 *   framework_counts: object,
 *   choice_history: Array,
 *   moral_conflicts?: Array,
 *   trajectory?: object,
 *   consistency_score?: string,
 *   virtue_streak?: number,
 *   virtue_heavy_count?: number,
 *   moral_values?: string[],
 *   moral_stances?: object
 * }, pack: object|null }} props
 */
export default function FrameworkProfile({ player, pack }) {
  const shouldReduce = useReducedMotion()
  const containerV = shouldReduce ? {} : containerVariants
  const sectionV = shouldReduce ? { hidden: {}, show: {} } : sectionVariants

  if (!player) {
    return (
      <motion.div
        className={styles.wrapper}
        variants={containerV}
        initial="hidden"
        animate="show"
      >
        <p className={styles.emptyTitle} style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '32px' }}>
          Loading your profile...
        </p>
      </motion.div>
    )
  }

  const {
    dominant_framework: dominant,
    conflicts = [],
    framework_counts: frameworkCounts = {},
    choice_history: choiceHistory = [],
    moral_conflicts: moralConflicts = [],
    trajectory = null,
    consistency_score: consistencyScore = null,
    virtue_streak: virtueStreak = 0,
    virtue_heavy_count: virtueHeavyCount = 0
  } = player

  // Compute least-used framework from framework_counts
  const leastUsedKey = frameworkCounts && Object.keys(frameworkCounts).length > 0
    ? Object.entries(frameworkCounts).sort((a, b) => a[1] - b[1])[0][0]
    : null

  const hasChoices = choiceHistory && choiceHistory.length > 0

  // Virtue and rights computations
  const totalVirtueChoices = frameworkCounts?.virtue ?? 0
  const totalHeavyRounds = choiceHistory.filter(c => c.moral_weight === 3).length

  const playedRightsRounds = choiceHistory.filter(entry => {
    const scenario = pack ? getScenarioByRound(pack, entry.round) : null
    return scenario?.rights_dimension === true
  })
  const rightsProtectiveCount = playedRightsRounds.filter(entry => {
    const scenario = pack ? getScenarioByRound(pack, entry.round) : null
    const choice = scenario?.choices?.[entry.choiceIndex]
    return choice?.rights_protective === true
  }).length

  return (
    <motion.div
      className={styles.wrapper}
      variants={containerV}
      initial="hidden"
      animate="show"
    >

      {/* Empty state -- player passed all rounds */}
      {dominant === null && (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>You passed this round.</p>
          <p className={styles.emptySub}>Passing is a choice too. Here&rsquo;s what the group decided.</p>
        </div>
      )}

      {/* D-27 Slot 1: Your Framework (existing dominant framework card) */}
      {dominant !== null && FRAMEWORKS[dominant] && (
        <motion.div className={styles.sectionCard} variants={sectionV}>
          <p className={styles.eyebrow}>Your Framework</p>
          <h2 className={styles.frameworkName}>{FRAMEWORKS[dominant].name}</h2>
          <p className={styles.explanation}>{FRAMEWORKS[dominant].description}</p>
        </motion.div>
      )}

      {/* D-27 Slot 2: Your Morals vs Your Ethics (from Phase 11) */}
      {dominant !== null && moralConflicts.length > 0 && (
        <motion.div className={styles.moralsSection} variants={sectionV}>
          <p className={styles.eyebrow}>Your Morals vs Your Ethics</p>
          <p className={styles.moralsIntro}>
            Your <strong>morals</strong> are personal &mdash; shaped by your upbringing,
            relationships, and what you hold sacred. <strong>Ethical frameworks</strong> are
            reasoned systems societies use to evaluate behavior. Here is where they diverged:
          </p>
          {moralConflicts.map((conflict, idx) => {
            const scenario = pack ? getScenarioByRound(pack, conflict.round) : null
            const roundTitle = scenario ? scenario.title : `Dilemma ${conflict.round}`
            return (
              <div key={idx} className={styles.moralConflictRow}>
                <p className={styles.moralConflictRound}>{roundTitle}</p>
                <p className={styles.moralConflictMessage}>{conflict.message}</p>
              </div>
            )
          })}
          <p className={styles.moralsFooter}>
            That tension is not a flaw. It is where real thinking begins.
          </p>
        </motion.div>
      )}

      {/* D-27 Slot 3: YOUR MORAL ARC (when trajectory shifted) */}
      {trajectory && trajectory.shifted && (
        <motion.div className={styles.conflictSection} variants={sectionV}>
          <p className={styles.eyebrow}>YOUR MORAL ARC</p>
          <p className={styles.conflictDescription}>
            In the early rounds you reasoned from {FRAMEWORKS[trajectory.early]?.name ?? trajectory.early}.
            By the final rounds, you shifted to {FRAMEWORKS[trajectory.late]?.name ?? trajectory.late}.
          </p>
          <p className={styles.conflictDescription} style={{ marginTop: '8px' }}>
            {ARC_NARRATIVES[`${trajectory.early}->${trajectory.late}`] ?? ''}
          </p>
        </motion.div>
      )}

      {/* Consistency label (when no shift but trajectory data exists) */}
      {trajectory && !trajectory.shifted && consistencyScore === 'high' && dominant && (
        <motion.div className={styles.leastUsedSection} variants={sectionV}>
          <p className={styles.conflictDescription}>
            Your reasoning was remarkably consistent -- you held {FRAMEWORKS[dominant]?.name ?? dominant} through escalating stakes.
          </p>
        </motion.div>
      )}

      {/* D-27 Slot 4: CHARACTER (when >= 2 virtue choices) */}
      {totalVirtueChoices >= 2 && (
        <motion.div className={styles.conflictSection} variants={sectionV}>
          <p className={styles.eyebrow}>CHARACTER</p>
          {virtueStreak > 0 && (
            <p className={styles.conflictDescription}>
              You held to character for {virtueStreak} consecutive rounds.
            </p>
          )}
          {totalHeavyRounds > 0 && (
            <p className={styles.conflictDescription} style={{ marginTop: '8px' }}>
              Virtue was your choice in {virtueHeavyCount} of {totalHeavyRounds} high-stakes rounds.
            </p>
          )}
        </motion.div>
      )}

      {/* D-27 Slot 5: Moral Friction count (when >= 1 moral conflict) */}
      {moralConflicts.length > 0 && (
        <motion.div className={styles.leastUsedSection} variants={sectionV}>
          <p className={styles.conflictDescription}>
            Your choices conflicted with your stated values in {moralConflicts.length} of {choiceHistory.length} rounds.
          </p>
          <p className={styles.conflictDescription} style={{ marginTop: '8px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
            That tension is the point.
          </p>
        </motion.div>
      )}

      {/* D-27 Slot 6: Where the Conflict Lived (existing framework conflicts) */}
      {dominant !== null && conflicts.length > 0 && (
        <motion.div className={styles.conflictSection} variants={sectionV}>
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
        </motion.div>
      )}

      {/* D-27 Slot 7: RIGHTS AWARENESS (when >= 2 rights-dimension scenarios played) */}
      {playedRightsRounds.length >= 2 && (
        <motion.div className={styles.leastUsedSection} variants={sectionV}>
          <p className={styles.eyebrow}>RIGHTS AWARENESS</p>
          <p className={styles.conflictDescription}>
            In {rightsProtectiveCount} of {playedRightsRounds.length} rights-critical scenarios, you chose to protect individual rights over group benefit.
          </p>
        </motion.div>
      )}

      {/* D-27 Slot 8: Framework You Used Least (existing) */}
      {dominant !== null && leastUsedKey && FRAMEWORKS[leastUsedKey] && (
        <motion.div className={styles.leastUsedSection} variants={sectionV}>
          <p className={styles.eyebrow}>The Framework You Used Least</p>
          <h3 className={styles.leastFrameworkName}>{FRAMEWORKS[leastUsedKey].name}</h3>
          <p className={styles.leastPrompt}>{FRAMEWORKS[leastUsedKey].question}</p>
          <p className={styles.leastPrompt} style={{ marginTop: '8px' }}>
            {FRAMEWORKS[leastUsedKey].description}
          </p>
        </motion.div>
      )}

      {/* D-27 Slot 9: Cultural Context footer (always shown when pack available) */}
      {pack && (
        <motion.div className={styles.leastUsedSection} variants={sectionV} style={{ opacity: 0.8 }}>
          <p className={styles.eyebrow}>{pack.name}</p>
          <p className={styles.conflictDescription}>
            Your choices were measured in the context of {pack.ethicalLens ?? 'ethical reasoning'}.
          </p>
          <p className={styles.conflictDescription} style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
            A different context might have drawn different reasoning.
          </p>
        </motion.div>
      )}

      {/* D-27 Slot 10: Choice Log (existing) */}
      <motion.div className={styles.choiceLog} variants={sectionV}>
        <p className={styles.eyebrow}>Your Choices</p>
        {!hasChoices && (
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No choices recorded.</p>
        )}
        {hasChoices && choiceHistory.map((entry, idx) => {
          const scenario = pack ? getScenarioByRound(pack, entry.round) : null
          const choice = scenario && scenario.choices[entry.choiceIndex]
          const roundTitle = scenario ? scenario.title : `Round ${entry.round}`
          const choiceText = choice ? choice.text.slice(0, 80) : '--'
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
      </motion.div>

    </motion.div>
  )
}
