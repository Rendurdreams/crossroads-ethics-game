import { CONFLICT_PAIRS } from './frameworks.js'

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
