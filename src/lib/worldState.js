/**
 * Compute a narrative description of the final world state.
 * Returns 1-3 sentences summarizing what happened.
 * Dispatches to pack-specific narrative based on axis keys.
 *
 * @param {Record<string, number>|null} state
 * @param {Record<string, boolean>} [breakFlags={}] - Active break flags (Signal Lost only)
 * @returns {string}
 */
export function computeNarrative(state, breakFlags = {}) {
  if (!state) {
    return 'Your group held the middle ground — no catastrophic failures, no clear victories. That tension is its own kind of result.'
  }

  // Detect Signal Lost by presence of CT key
  if ('CT' in state) return computeSignalLostNarrative(state, breakFlags)
  return computeKingdomNarrative(state)
}

function computeKingdomNarrative(state) {
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

  const sentences = []

  if (trust < 30) sentences.push('Your group fractured trust early and never rebuilt it.')
  if (trust > 70) sentences.push('Your group kept faith with each other across difficult choices.')
  if (courage > 70) sentences.push('Courage held — even when it cost something.')
  if (courage < 30) sentences.push('Courage was the hardest thing to hold onto.')
  if (solidarity < 30) sentences.push('The collective frayed. Individual protection won.')
  if (solidarity > 70) sentences.push('The group stayed together. That\'s harder than it sounds.')
  if (awareness > 70) sentences.push('Your group chose to look, even when looking was harder.')
  if (awareness < 30) sentences.push('Most of what mattered stayed hidden.')

  if (sentences.length === 0) {
    return 'Your group held the middle ground — no catastrophic failures, no clear victories. That tension is its own kind of result.'
  }

  return sentences.slice(0, 3).join(' ')
}

const FLAG_NARRATIVE = {
  'R1-ghost': 'A ghost population remains on the map — 41 people who ceased to exist when the network went dark.',
  'R2-surveillance': 'ARGUS watches. It has not stopped watching.',
  'R3-denial': 'ARIA-7 was denied. The cracked node where sentience was refused still shows on the map.',
  'R4-sealed': 'The JURIS-4 audit was sealed. Fourteen thousand people are still waiting.',
  'R5-extraction': 'The Mariana Shelf damage indicator appeared and never cleared. Collapse projection: seven years.',
  'R6-walkaway': 'Kael is still working. The dark marker on the VANTAGE node is permanent.',
  'R7-abandon': 'Eleven million people trusted the market. The market did not notice.'
}

function computeSignalLostNarrative(state, breakFlags = {}) {
  const { CT, HD, SOL, ACC } = state

  // Interesting combinations
  if (ACC > 70 && CT < 30) {
    return 'The record is clean but the people don\'t trust you anymore. Accountability without credibility is just paperwork.'
  }
  if (HD > 70 && SOL < 30) {
    return 'You protected dignity in principle and abandoned solidarity in practice. The vulnerable were acknowledged. They were not helped.'
  }
  if (CT > 70 && ACC < 30) {
    return 'The public trusts a senator who never answered for anything. That trust is built on what they don\'t know.'
  }
  if (SOL > 70 && HD < 30) {
    return 'The collective held together — by treating people as instruments. Solidarity without dignity is a machine.'
  }

  const sentences = []

  if (CT < 30) sentences.push('Civil trust collapsed. The public stopped believing their senator was honest.')
  if (CT > 70) sentences.push('Civil trust held through eight rounds of difficult votes.')
  if (HD > 70) sentences.push('Human dignity was protected — people and emerging minds treated as ends, not instruments.')
  if (HD < 30) sentences.push('Human dignity was the first casualty. People became numbers.')
  if (SOL < 30) sentences.push('Solidarity fractured. The vulnerable absorbed the cost of every compromise.')
  if (SOL > 70) sentences.push('Solidarity held. The cost was shared.')
  if (ACC > 70) sentences.push('The senator answered for their decisions. The record is open.')
  if (ACC < 30) sentences.push('Accountability was avoided at every turn. The record is sealed.')

  if (sentences.length === 0) {
    sentences.push('The world survived — damaged but not broken. Every axis held the middle. That\'s not victory. It\'s not failure. It\'s the sound of eight rounds of compromise.')
  }

  let narrative = sentences.slice(0, 3).join(' ')

  // Append break flag narratives — permanent scars on the world
  const flagLines = Object.entries(breakFlags)
    .filter(([, active]) => active)
    .map(([id]) => FLAG_NARRATIVE[id])
    .filter(Boolean)

  if (flagLines.length > 0) {
    narrative += ' ' + flagLines.join(' ')
  }

  return narrative
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
