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
 * @param {object|null} moralStances - { lie_to_protect?: string, ends_justify?: string }
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
  }

  return conflicts
}

/**
 * Compute a player's framework profile from their choice history.
 * @param {Array<{round: number, frameworks: string[]}>} choiceHistory
 * @returns {{ dominant: string|null, counts: object, leastUsed: string|null }}
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

  return { dominant, counts, leastUsed }
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
