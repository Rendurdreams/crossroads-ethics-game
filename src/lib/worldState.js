/**
 * Compute a narrative description of the final world state.
 * Returns 1-3 sentences summarizing what happened to the city.
 *
 * @param {{ trust: number, courage: number, solidarity: number, awareness: number }|null} state
 * @returns {string}
 */
export function computeNarrative(state) {
  if (!state) {
    return 'Your group held the middle ground — no catastrophic failures, no clear victories. That tension is its own kind of result.'
  }

  const { trust, courage, solidarity, awareness } = state

  // Check interesting combinations first — return immediately if matched
  if (courage > 70 && solidarity < 30) {
    return 'A lighthouse over a dark city — individuals brave, the collective dark.'
  }
  if (trust > 70 && awareness < 30) {
    return 'Trust held, but the city stayed foggy. They believed each other. They just weren\'t looking hard enough.'
  }
  if (solidarity > 70 && courage < 30) {
    return 'Every window lit. Lighthouse dark. Everyone stayed together — and no one went first.'
  }

  // Build sentences from individual meters
  const sentences = []

  if (trust < 30) sentences.push('Your group fractured trust early and never rebuilt it.')
  if (trust > 70) sentences.push('Your group kept faith with each other across difficult choices.')
  if (courage > 70) sentences.push('Courage held — even when it cost something.')
  if (courage < 30) sentences.push('Courage was the hardest thing to hold onto.')
  if (solidarity < 30) sentences.push('The collective frayed. Individual protection won.')
  if (solidarity > 70) sentences.push('The group stayed together. That\'s harder than it sounds.')
  if (awareness > 70) sentences.push('Your group chose to look, even when looking was harder.')
  if (awareness < 30) sentences.push('Most of what mattered stayed hidden.')

  // Neutral fallback if all meters between 30-70
  if (sentences.length === 0) {
    return 'Your group held the middle ground — no catastrophic failures, no clear victories. That tension is its own kind of result.'
  }

  return sentences.slice(0, 3).join(' ')
}

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
