import { CONFLICT_PAIRS } from './frameworks.js'

/**
 * Maps a player's stated personal value to the ethical framework(s) it aligns with.
 * Used by findMoralConflicts to detect value-framework tension.
 */
export const VALUE_FRAMEWORK_MAP = {
  loyalty:    ['virtue', 'care'],
  honesty:    ['deontology'],
  fairness:   [],
  courage:    ['virtue'],
  compassion: ['care']
}

/**
 * Condition-specific value conflict triggers for values whose conflicts
 * cannot be expressed as a framework mapping (e.g. fairness, which maps to
 * a framework tag that never appears in scenario choices).
 *
 * Each entry fires a value-type conflict when:
 *   - The player's top value matches `value`
 *   - The choice matches `matchCondition`
 *
 * No-double-fire rule still applies: these run BEFORE stance triggers
 * but AFTER VALUE_FRAMEWORK_MAP checks.
 */
const VALUE_CONDITION_TRIGGERS = [
  {
    value: 'fairness',
    matchCondition: (choice) => choice.scenarioId === 'round-1' && choice.choiceIndex === 1,
    message: "Fairness asks who deserves to eat. You let the math decide."
  },
  {
    value: 'fairness',
    matchCondition: (choice) => choice.scenarioId === 'round-3' && choice.choiceIndex === 1,
    message: "The Hollow Folk asked for equal standing. You held the line."
  }
]

/**
 * Condition-specific stance conflict triggers.
 * Each trigger fires when the player's stated stance answer AND a specific
 * round+choice (or framework) match the condition.
 *
 * Fields:
 *   stanceKey     - key in moralStances object
 *   stanceAnswer  - value that triggers the conflict ('yes'|'no'|'it_depends')
 *   matchCondition - (optional) function(choice) => boolean — checks specific round+choiceIndex
 *   matchFramework - (optional) string — fires for any round where choice includes this framework
 *   message       - exact conflict string shown to player
 */
const STANCE_TRIGGERS = [
  {
    stanceKey: 'lie_to_protect',
    stanceAnswer: 'no',
    matchCondition: (choice) => choice.scenarioId === 'round-4' && choice.choiceIndex === 2,
    message: "Your instinct was honesty. What changed?"
  },
  {
    stanceKey: 'lie_to_protect',
    stanceAnswer: 'no',
    matchCondition: (choice) => choice.scenarioId === 'round-bombshell' && choice.choiceIndex === 1,
    message: "Your instinct was honesty. What changed?"
  },
  {
    stanceKey: 'lie_to_protect',
    stanceAnswer: 'yes',
    matchCondition: (choice) => choice.scenarioId === 'round-4' && choice.choiceIndex === 0,
    message: "You said protecting people matters. Here honesty was the protection."
  },
  {
    stanceKey: 'lie_to_protect',
    stanceAnswer: 'yes',
    matchCondition: (choice) => choice.scenarioId === 'round-bombshell' && choice.choiceIndex === 0,
    message: "You said protecting people matters. Here honesty was the protection."
  },
  {
    stanceKey: 'ends_justify',
    stanceAnswer: 'yes',
    matchCondition: (choice) => choice.scenarioId === 'round-6' && choice.choiceIndex === 0,
    message: "You said the math matters. Here the math said keep Irel bound."
  },
  {
    stanceKey: 'ends_justify',
    stanceAnswer: 'no',
    matchCondition: (choice) => choice.scenarioId === 'round-1' && choice.choiceIndex === 1,
    message: "You said the math doesn't justify harm. But you just ran the same calculation."
  },
  {
    stanceKey: 'break_promise',
    stanceAnswer: 'no',
    matchCondition: (choice) => choice.scenarioId === 'round-5' && choice.choiceIndex === 0,
    message: "Your ancestors made a commitment. You just broke it cleanly."
  },
  {
    stanceKey: 'break_promise',
    stanceAnswer: 'yes',
    matchCondition: (choice) => choice.scenarioId === 'round-5' && choice.choiceIndex === 1,
    message: "You said partial is better than broken. But you kept the whole promise while villages burned."
  },
  {
    stanceKey: 'loyalty_vs_fairness',
    stanceAnswer: 'yes',
    matchCondition: (choice) => choice.scenarioId === 'round-7' && choice.choiceIndex === 1,
    message: "You said you'd call out your group. Here you let them walk free."
  },
  {
    stanceKey: 'loyalty_vs_fairness',
    stanceAnswer: 'no',
    matchCondition: (choice) => choice.scenarioId === 'round-7' && choice.choiceIndex === 0,
    message: "You said loyalty comes first. But you just stripped the Compact's children of their home."
  },
  {
    stanceKey: 'punish_innocent',
    stanceAnswer: 'no',
    matchCondition: (choice) => choice.scenarioId === 'round-7' && choice.choiceIndex === 0,
    message: "Soldiers who followed orders. Children who had no voice. You said this wasn't okay."
  },
  {
    stanceKey: 'punish_innocent',
    stanceAnswer: 'yes',
    matchCondition: (choice) => choice.scenarioId === 'round-6' && choice.choiceIndex === 0,
    message: "You said one can suffer for the group. Irel has suffered for centuries. Why stop now?"
  }
]

/**
 * Detect rounds where a player's choice conflicted with their stated moral baseline.
 * Primary signal: top-1 value check (D-02).
 * Secondary signal: stance answer check (D-03).
 * Only one conflict per round — value conflict takes priority over stance conflict (D-04).
 *
 * @param {Array<{round: number, frameworks: string[], choiceIndex?: number, scenarioId?: string}>} choiceHistory
 * @param {string[]|null} moralValues - Ordered array, index 0 = player's top value
 * @param {object|null} moralStances - { lie_to_protect?: string, ends_justify?: string, break_promise?: string, loyalty_vs_fairness?: string, punish_innocent?: string }
 * @returns {Array<{round: number, type: 'value'|'stance', valueName?: string, stanceKey?: string, choiceFrameworks: string[], message: string}>}
 */
export function findMoralConflicts(choiceHistory, moralValues, moralStances) {
  if (!moralValues || moralValues.length === 0) return []
  if (!choiceHistory || choiceHistory.length === 0) return []

  const topValue = moralValues[0]
  const alignedFrameworks = VALUE_FRAMEWORK_MAP[topValue] ?? []
  const conflicts = []

  // Primary (framework-based): value conflict detection
  // Skip for values that use condition triggers instead (e.g. fairness)
  const usesConditionTriggers = VALUE_CONDITION_TRIGGERS.some(t => t.value === topValue)

  if (!usesConditionTriggers) {
    choiceHistory.forEach(choice => {
      const choiceFrameworks = choice.frameworks ?? []
      if (choiceFrameworks.length === 0) return
      const isAligned = choiceFrameworks.some(f => alignedFrameworks.includes(f))
      if (!isAligned) {
        conflicts.push({
          round: choice.round,
          type: 'value',
          valueName: topValue,
          choiceFrameworks,
          message: `This choice conflicts with your stated value of ${topValue}.`
        })
      }
    })
  }

  // Primary (condition-based): value triggers for values with no framework mapping
  // Runs before stance triggers so condition-based value conflicts block stance conflicts (no-double-fire)
  if (usesConditionTriggers) {
    VALUE_CONDITION_TRIGGERS.filter(t => t.value === topValue).forEach(trigger => {
      choiceHistory.forEach(choice => {
        // Skip if this round already has a conflict
        if (conflicts.some(c => c.round === choice.round)) return
        if (trigger.matchCondition(choice)) {
          conflicts.push({
            round: choice.round,
            type: 'value',
            valueName: topValue,
            choiceFrameworks: choice.frameworks ?? [],
            message: trigger.message
          })
        }
      })
    })
  }

  // Secondary: stance-based conflict detection (only fires if round not already conflicted)
  if (moralStances) {
    STANCE_TRIGGERS.forEach(trigger => {
      if (moralStances[trigger.stanceKey] !== trigger.stanceAnswer) return

      choiceHistory.forEach(choice => {
        // Check if already conflicted this round — value conflict takes priority
        if (conflicts.some(c => c.round === choice.round)) return

        let matches = false

        if (trigger.matchCondition) {
          matches = trigger.matchCondition(choice)
        } else if (trigger.matchFramework) {
          matches = (choice.frameworks ?? []).includes(trigger.matchFramework)
        }

        if (matches) {
          conflicts.push({
            round: choice.round,
            type: 'stance',
            stanceKey: trigger.stanceKey,
            choiceFrameworks: choice.frameworks,
            message: trigger.message
          })
        }
      })
    })
  }

  return conflicts
}

/**
 * Weight map: scenario weight string → numeric multiplier for trajectory computation.
 */
const WEIGHT_MAP = { low: 1, medium: 2, heavy: 3, reflective: 0 }

/**
 * Compute a player's framework profile from their choice history.
 * @param {Array<{round: number, frameworks: string[], moral_weight?: number}>} choiceHistory
 * @returns {{ dominant: string|null, counts: object, leastUsed: string|null, trajectory: {early: string|null, late: string|null, shifted: boolean}, consistency_score: string|null, virtue_streak: number, virtue_heavy_count: number }}
 */
export function computeProfile(choiceHistory) {
  const counts = { consequentialism: 0, deontology: 0, care: 0, virtue: 0 }

  choiceHistory.forEach(choice => {
    choice.frameworks.forEach(f => {
      if (counts.hasOwnProperty(f)) counts[f]++
    })
  })

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const dominant = sorted[0][1] > 0 ? sorted[0][0] : null

  // Least used: framework with lowest count (non-zero dominant implies at least one choice)
  const leastUsed = dominant ? sorted[sorted.length - 1][0] : null

  // Trajectory: early (rounds <= 2) vs late (rounds >= 5), weight-adjusted
  const early = choiceHistory.filter(c => c.round <= 2)
  const late = choiceHistory.filter(c => c.round >= 5)

  function weightedDominant(entries) {
    if (entries.length === 0) return null
    const wCounts = { consequentialism: 0, deontology: 0, care: 0, virtue: 0 }
    let totalWeighted = 0
    entries.forEach(entry => {
      const w = entry.moral_weight ?? 1
      ;(entry.frameworks ?? []).forEach(f => {
        if (wCounts.hasOwnProperty(f)) {
          wCounts[f] += w
          totalWeighted += w
        }
      })
    })
    if (totalWeighted === 0) return null
    const wSorted = Object.entries(wCounts).sort((a, b) => b[1] - a[1])
    return wSorted[0][1] > 0 ? wSorted[0][0] : null
  }

  const earlyDominant = early.length >= 1 ? weightedDominant(early) : null
  const lateDominant = late.length >= 1 ? weightedDominant(late) : null
  const trajectory = {
    early: earlyDominant,
    late: lateDominant,
    shifted: earlyDominant !== null && lateDominant !== null && earlyDominant !== lateDominant
  }

  // Consistency score
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const maxCount = Math.max(...Object.values(counts))
  let consistency_score = null
  if (total > 0) {
    consistency_score = (maxCount / total) >= 0.5 ? 'high' : 'low'
  }

  // Virtue streak: longest consecutive rounds with a virtue-tagged choice
  const sortedByRound = [...choiceHistory].sort((a, b) => a.round - b.round)
  let virtue_streak = 0
  let currentStreak = 0
  sortedByRound.forEach(entry => {
    if ((entry.frameworks ?? []).includes('virtue')) {
      currentStreak++
      if (currentStreak > virtue_streak) virtue_streak = currentStreak
    } else {
      currentStreak = 0
    }
  })

  // Virtue heavy count: virtue choices in heavy-weight rounds (moral_weight === 3)
  const virtue_heavy_count = choiceHistory.filter(
    entry => entry.moral_weight === 3 && (entry.frameworks ?? []).includes('virtue')
  ).length

  return { dominant, counts, leastUsed, trajectory, consistency_score, virtue_streak, virtue_heavy_count }
}

/**
 * Find cross-round framework conflicts in a player's choice history.
 * A conflict exists when a player used Framework A in one round and
 * Framework B in another, and those two are a defined conflict pair.
 * @param {Array<{round: number, frameworks: string[]}>} choiceHistory
 * @returns {Array<{tension: string, description: string, rounds: number[], frameworks: string[]}>}
 */
export function findConflicts(choiceHistory) {
  // Build a map: framework -> which rounds used it
  const frameworkRounds = {}
  choiceHistory.forEach(choice => {
    choice.frameworks.forEach(f => {
      if (!frameworkRounds[f]) frameworkRounds[f] = []
      frameworkRounds[f].push(choice.round)
    })
  })

  const usedFrameworks = Object.keys(frameworkRounds)
  const conflicts = []

  CONFLICT_PAIRS.forEach(pair => {
    const [f1, f2] = pair.frameworks
    if (usedFrameworks.includes(f1) && usedFrameworks.includes(f2)) {
      // Only count as a conflict if the two frameworks appear in DIFFERENT rounds.
      // A single choice tagged with both frameworks (e.g. ['care', 'consequentialism'])
      // is not a cross-round tension — it's one decision, not a shift in reasoning.
      const f1Set = new Set(frameworkRounds[f1])
      const f2Set = new Set(frameworkRounds[f2])
      const f1Only = [...f1Set].filter(r => !f2Set.has(r))
      const f2Only = [...f2Set].filter(r => !f1Set.has(r))

      // Need at least one round where f1 was used without f2, AND vice versa
      if (f1Only.length === 0 || f2Only.length === 0) return

      const rounds = [
        ...frameworkRounds[f1],
        ...frameworkRounds[f2]
      ].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b)

      conflicts.push({
        tension: pair.tension,
        description: pair.description,
        rounds,
        frameworks: [f1, f2]
      })
    }
  })

  return conflicts
}
