/**
 * Apply aggregate player choices to the world state for a given round.
 * Each choice's worldImpact is weighted by the proportion of players who chose it.
 *
 * @param {Array<{choice_index: number}>} choices - Submitted choices (abstainers excluded)
 * @param {Array} scenarios - The scenarios array from scenarios.js
 * @param {number} roundIndex - 0-based index into the scenarios array
 * @param {object} currentState - Current world state {trust, courage, solidarity, awareness}
 * @returns {object} New world state with values clamped 0-100
 */
export function applyChoicesToWorld(choices, scenarios, roundIndex, currentState) {
  if (!choices || choices.length === 0) return { ...currentState }

  const scenario = scenarios[roundIndex]
  if (!scenario || !scenario.choices || scenario.choices.length === 0) return { ...currentState }

  const tallies = new Array(scenario.choices.length).fill(0)
  choices.forEach(c => {
    if (c.choice_index >= 0 && c.choice_index < tallies.length) {
      tallies[c.choice_index]++
    }
  })

  const total = choices.length
  const newState = { ...currentState }

  scenario.choices.forEach((choice, i) => {
    const weight = tallies[i] / total
    Object.entries(choice.worldImpact).forEach(([meter, delta]) => {
      if (newState.hasOwnProperty(meter)) {
        newState[meter] = Math.max(0, Math.min(100,
          newState[meter] + (delta * weight)
        ))
      }
    })
  })

  return newState
}
