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
  'consequentialism->deontology': 'You started by weighing outcomes -- whichever choice helped the most people won. But as the stakes rose, you shifted to holding rules that don\'t bend. Philosophers call this moving from teleological reasoning -- judging by results -- toward deontology -- following duty because it\'s right, full stop.',
  'consequentialism->care': 'Early on you calculated what would help the most people. Later, you chose to protect the person right in front of you. That shift -- from utilitarian thinking, where numbers decide, to care ethics, where relationships decide -- is one of the deepest divides in moral philosophy.',
  'consequentialism->virtue': 'You started by optimizing for the best outcome. By the end, you were asking what a good person would do regardless of results. Philosophers call this the move from consequentialism -- outcomes first -- to virtue ethics -- character first.',
  'deontology->consequentialism': 'You held firm to principles early on, following rules even when they cost you. Later, the stakes made you start weighing results instead. Philosophers call this shifting from deontology -- duty-bound reasoning -- toward pragmatism -- doing what actually works.',
  'deontology->care': 'You started from duty -- some rules are absolute. But as the dilemmas got personal, you shifted to protecting the people closest to you. The psychologist Carol Gilligan studied exactly this tension -- the pull between justice, which applies rules equally, and care, which asks what this person needs right now.',
  'deontology->virtue': 'You followed rules early on and shifted to acting from character. Both are principled -- but deontology asks what the rule demands, while virtue ethics asks who you want to be.',
  'care->consequentialism': 'You started by protecting the people closest to you. Later, you stepped back and weighed what would help the most people overall. That\'s the tension between relational ethics -- where loyalty comes first -- and utilitarian thinking -- where the math decides.',
  'care->deontology': 'You prioritized relationships at first -- the person in front of you mattered most. Later, you shifted to following rules regardless of who got hurt. Philosophers call this moving from particularism -- where context drives the decision -- to universalism -- where the same rule applies to everyone.',
  'care->virtue': 'You started by protecting the people you cared about. By the end, you were acting from personal integrity even when it meant standing alone. Both center the individual -- but care prizes the relationship, while virtue prizes your character.',
  'virtue->consequentialism': 'Early on you did what character demanded -- the honest thing, the courageous thing. Later, you started weighing which choice would actually produce the best result. Philosophers call this the shift from agent-centered ethics -- who are you? -- to outcome-centered ethics -- what happens?',
  'virtue->deontology': 'You started from character -- doing what a good person would do. Later, you shifted to following specific rules and duties. Both are principled, but virtue answers to your own integrity while deontology answers to an external code.',
  'virtue->care': 'You acted from personal integrity early on -- courage, honesty, doing what\'s hard because it\'s right. Later, you chose to protect someone you cared about, even at the cost of standing alone. That\'s the tension between standing up for what\'s right and standing with someone who needs you.'
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
export default function FrameworkProfile({ player, pack, groupDebrief }) {
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
      {trajectory && !trajectory.shifted && (consistencyScore === 'remarkably_consistent' || consistencyScore === 'consistent') && dominant && (
        <motion.div className={styles.leastUsedSection} variants={sectionV}>
          <p className={styles.conflictDescription}>
            {consistencyScore === 'remarkably_consistent'
              ? `Your reasoning was remarkably consistent — you held ${FRAMEWORKS[dominant]?.name ?? dominant} through the highest-stakes rounds without breaking.`
              : `Your reasoning was consistent — ${FRAMEWORKS[dominant]?.name ?? dominant} guided most of your decisions.`}
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
                  viewBox="0 0 240 80"
                  width="100%"
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

      {/* D-27 Slot 8: Framework You Used Least — with specific round references */}
      {dominant !== null && leastUsedKey && FRAMEWORKS[leastUsedKey] && (
        <motion.div className={styles.leastUsedSection} variants={sectionV}>
          <p className={styles.eyebrow}>The Framework You Used Least</p>
          <h3 className={styles.leastFrameworkName}>{FRAMEWORKS[leastUsedKey].name}</h3>
          <p className={styles.leastPrompt}>{FRAMEWORKS[leastUsedKey].question}</p>
          {(() => {
            const missedRounds = (choiceHistory ?? [])
              .filter(c => !(c.frameworks ?? []).includes(leastUsedKey))
              .map(c => {
                const scenario = pack ? getScenarioByRound(pack, c.round) : null
                if (!scenario) return null
                const leastChoice = scenario.choices?.find(ch => (ch.frameworks ?? []).includes(leastUsedKey))
                if (!leastChoice) return null
                return { round: c.round, title: scenario.title, choiceText: leastChoice.text }
              })
              .filter(Boolean)
              .slice(0, 2)

            return missedRounds.length > 0 ? (
              <div style={{ marginTop: '10px' }}>
                {missedRounds.map((m, i) => (
                  <p key={i} className={styles.leastPrompt} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    In Round {m.round} ({m.title}), the {FRAMEWORKS[leastUsedKey].name.toLowerCase()} choice was: &ldquo;{m.choiceText}&rdquo; &mdash; you chose something else.
                  </p>
                ))}
              </div>
            ) : null
          })()}
        </motion.div>
      )}

      {/* D-27 Slot 8b: Group Comparison */}
      {groupDebrief && groupDebrief.frameworkBreakdown && (
        <motion.div className={styles.leastUsedSection} variants={sectionV}>
          <p className={styles.eyebrow}>Your Class</p>
          {(() => {
            const breakdown = groupDebrief.frameworkBreakdown
            const totalVotes = Object.values(breakdown).reduce((a, b) => a + b, 0)
            if (totalVotes === 0) return null
            const groupDominant = Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0]
            const groupDominantPct = Math.round((groupDominant[1] / totalVotes) * 100)
            const playerMatchesGroup = dominant === groupDominant[0]

            return (
              <>
                <p className={styles.conflictDescription}>
                  {groupDebrief.totalPlayers} senators voted across {pack?.scenarios?.length ?? 8} rounds.
                  The most common framework was <strong>{FRAMEWORKS[groupDominant[0]]?.name ?? groupDominant[0]}</strong> ({groupDominantPct}% of all choices).
                  {playerMatchesGroup
                    ? ' You were part of the majority.'
                    : ` You were not — your reasoning diverged from most of your class.`}
                </p>
                {groupDebrief.notableMoralConflicts?.length > 0 && (
                  <p className={styles.conflictDescription} style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {groupDebrief.notableMoralConflicts.length} senator{groupDebrief.notableMoralConflicts.length === 1 ? '' : 's'} experienced moral conflicts between their stated values and their votes.
                  </p>
                )}
              </>
            )
          })()}
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

      {/* Replay prompt */}
      {pack?.id === 'signal-lost' && player?.senator_profile_id && (
        <motion.div className={styles.leastUsedSection} variants={sectionV} style={{ opacity: 0.7, textAlign: 'center' }}>
          <p className={styles.conflictDescription} style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
            You played as one of six senators. Each has different stakes — financial interests, family connections, political debts. The same dilemmas land differently when your skin in the game changes. There are five other senators waiting.
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
