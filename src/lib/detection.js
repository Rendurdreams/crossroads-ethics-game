import { CONFLICT_PAIRS } from './frameworks.js'

/**
 * Maps a player's stated personal value to the ethical framework(s) it aligns with.
 * Used by findMoralConflicts to detect value-framework tension.
 */
export const VALUE_FRAMEWORK_MAP = {
  honesty:    ['deontology', 'virtue'],
  loyalty:    ['care'],
  fairness:   ['consequentialism', 'deontology'],
  courage:    ['virtue'],
  compassion: ['care']
}

/**
 * Detect rounds where a player's choice conflicted with their stated moral baseline.
 * Primary signal: top-1 value check (D-02).
 * Secondary signal: stance answer check (D-03).
 * Only one conflict per round — value conflict takes priority over stance conflict (D-04).
 *
 * @param {Array<{round: number, frameworks: string[], choiceIndex?: number}>} choiceHistory
 * @param {string[]|null} moralValues - Ordered array, index 0 = player's top value
 * @param {object|null} moralStances - { lie_to_protect?: string, ends_justify?: string, break_promise?: string, truth_over_relationship?: string, punish_innocent?: string }
 * @returns {Array<{round: number, type: 'value'|'stance', valueName?: string, stanceKey?: string, choiceFrameworks: string[], message: string}>}
 */
export function findMoralConflicts(choiceHistory, moralValues, moralStances) {
  if (!moralValues || moralValues.length === 0) return []
  if (!choiceHistory || choiceHistory.length === 0) return []

  const topValue = moralValues[0]
  const alignedFrameworks = VALUE_FRAMEWORK_MAP[topValue] ?? []
  const conflicts = []

  // Primary: value-based conflict detection
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

  // Secondary: stance-based conflict detection (only fires if round not already conflicted)
  if (moralStances) {
    if (moralStances.ends_justify === 'no') {
      choiceHistory.forEach(choice => {
        if ((choice.frameworks ?? []).includes('consequentialism')) {
          if (!conflicts.some(c => c.round === choice.round)) {
            conflicts.push({
              round: choice.round,
              type: 'stance',
              stanceKey: 'ends_justify',
              choiceFrameworks: choice.frameworks,
              message: "You said the ends don't justify the means — but this choice optimized for outcome."
            })
          }
        }
      })
    }
    if (moralStances.lie_to_protect === 'no') {
      choiceHistory.forEach(choice => {
        if ((choice.frameworks ?? []).includes('care')) {
          if (!conflicts.some(c => c.round === choice.round)) {
            conflicts.push({
              round: choice.round,
              type: 'stance',
              stanceKey: 'lie_to_protect',
              choiceFrameworks: choice.frameworks,
              message: "You said loyalty shouldn't override truth — but this choice prioritized the relationship."
            })
          }
        }
      })
    }
    // break_promise='no' → flags consequentialist choices
    if (moralStances.break_promise === 'no') {
      choiceHistory.forEach(choice => {
        if ((choice.frameworks ?? []).includes('consequentialism')) {
          if (!conflicts.some(c => c.round === choice.round)) {
            conflicts.push({
              round: choice.round,
              type: 'stance',
              stanceKey: 'break_promise',
              choiceFrameworks: choice.frameworks,
              message: "You said it's not right to break promises — but this choice optimized for outcome over commitment."
            })
          }
        }
      })
    }
    // truth_over_relationship='no' → flags virtue choices
    if (moralStances.truth_over_relationship === 'no') {
      choiceHistory.forEach(choice => {
        if ((choice.frameworks ?? []).includes('virtue')) {
          if (!conflicts.some(c => c.round === choice.round)) {
            conflicts.push({
              round: choice.round,
              type: 'stance',
              stanceKey: 'truth_over_relationship',
              choiceFrameworks: choice.frameworks,
              message: "You said truth shouldn't override relationship — but this choice held personal integrity above the bond."
            })
          }
        }
      })
    }
    // punish_innocent='yes' → flags consequentialist choices
    if (moralStances.punish_innocent === 'yes') {
      choiceHistory.forEach(choice => {
        if ((choice.frameworks ?? []).includes('consequentialism')) {
          if (!conflicts.some(c => c.round === choice.round)) {
            conflicts.push({
              round: choice.round,
              type: 'stance',
              stanceKey: 'punish_innocent',
              choiceFrameworks: choice.frameworks,
              message: "You said punishing the innocent is justified — but this choice carried that cost."
            })
          }
        }
      })
    }
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
      // Conflict exists: player used both frameworks across different rounds
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
