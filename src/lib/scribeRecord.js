/**
 * Generate a personalized scribe record for Round 8, reflecting the player's
 * actual R1-R7 choices. Per Kohlberg Stage 6 [1] — self-judgment by own standards.
 *
 * @param {Array<{round: number, choiceIndex: number, scenarioId: string, frameworks: string[]}>} choiceHistory
 * @returns {string} The scribe record text to display before R8 choice
 */
export function generateScribeRecord(choiceHistory) {
  if (!choiceHistory || choiceHistory.length === 0) {
    return "The scribe's pages are blank. You have not yet ruled."
  }

  // Map round choices to narrative fragments
  const CHOICE_ACTIONS = {
    'round-1': {
      0: 'shared grain with the hungry',
      1: 'kept the grain behind capital walls',
      2: 'rationed grain to the most desperate'
    },
    'round-2': {
      0: 'locked down the kingdom with iron protocols',
      1: 'armed your people and trusted their courage',
      2: 'sealed the borders but left the towns free'
    },
    'round-3': {
      0: 'granted the Hollow Folk full citizenship',
      1: 'denied the Hollow Folk and sent them back to the mines',
      2: 'offered the Hollow Folk a half-promise'
    },
    'round-4': {
      0: 'revealed the truth about the dying land',
      1: 'sealed the archive and kept the secret',
      2: 'told seven people and hoped that was enough'
    },
    'round-5': {
      0: 'opened the Wellspring and spent the future',
      1: 'kept the Wellspring sealed while people died',
      2: 'drew just enough and prayed it would hold'
    },
    'round-6': {
      0: 'freed Irel from the shackles',
      1: 'left Irel bound beneath the palace',
      2: 'left Irel screaming for one more year'
    },
    'round-7': {
      0: 'stripped the Compact and exiled their people',
      1: 'forgave the Compact and rebuilt together',
      2: 'made the Compact confess before the kingdom',
      3: 'let the Compact judge their own'
    }
  }

  // Reputation labels based on choice patterns
  const REPUTATION_LABELS = {
    merciful: (history) => history.some(c => c.scenarioId === 'round-7' && c.choiceIndex === 1) ||
                           history.some(c => c.scenarioId === 'round-3' && c.choiceIndex === 0),
    ruthless: (history) => history.some(c => c.scenarioId === 'round-7' && c.choiceIndex === 0) ||
                           history.some(c => c.scenarioId === 'round-1' && c.choiceIndex === 1),
    cautious: (history) => history.filter(c => c.choiceIndex === 2).length >= 3,
    decisive: (history) => history.filter(c => c.choiceIndex <= 1).length >= 5,
    principled: (history) => {
      const virtueCount = history.filter(c => (c.frameworks ?? []).includes('virtue') || (c.frameworks ?? []).includes('deontology')).length
      return virtueCount >= 4
    },
    pragmatic: (history) => {
      const consCount = history.filter(c => (c.frameworks ?? []).includes('consequentialism')).length
      return consCount >= 4
    }
  }

  // Contradiction detection: find two choices that narratively oppose each other
  const CONTRADICTION_PAIRS = [
    { a: { scenario: 'round-1', choice: 0 }, b: { scenario: 'round-4', choice: 1 },
      text: 'You shared grain with the hungry but sealed the truth from everyone.' },
    { a: { scenario: 'round-6', choice: 0 }, b: { scenario: 'round-7', choice: 0 },
      text: 'You freed Irel but exiled the Compact.' },
    { a: { scenario: 'round-3', choice: 0 }, b: { scenario: 'round-1', choice: 1 },
      text: 'You gave the Hollow Folk everything but gave the outer villages nothing.' },
    { a: { scenario: 'round-4', choice: 0 }, b: { scenario: 'round-5', choice: 0 },
      text: 'You revealed one truth and spent another.' },
    { a: { scenario: 'round-2', choice: 0 }, b: { scenario: 'round-3', choice: 0 },
      text: 'You locked down freedom for safety, then granted freedom to the Hollow Folk.' },
    { a: { scenario: 'round-5', choice: 1 }, b: { scenario: 'round-6', choice: 0 },
      text: 'You held the Wellspring for the future but freed Irel without hesitation.' },
    { a: { scenario: 'round-1', choice: 0 }, b: { scenario: 'round-7', choice: 0 },
      text: 'You shared equally in winter but stripped everything in judgment.' }
  ]

  // Build the record
  const actions = choiceHistory
    .filter(c => CHOICE_ACTIONS[c.scenarioId])
    .map(c => CHOICE_ACTIONS[c.scenarioId]?.[c.choiceIndex])
    .filter(Boolean)

  // Find a contradiction
  const contradiction = CONTRADICTION_PAIRS.find(pair =>
    choiceHistory.some(c => c.scenarioId === pair.a.scenario && c.choiceIndex === pair.a.choice) &&
    choiceHistory.some(c => c.scenarioId === pair.b.scenario && c.choiceIndex === pair.b.choice)
  )

  // Find reputation
  let peopleSay = 'complex'
  let recordSays = 'inconsistent'
  for (const [label, test] of Object.entries(REPUTATION_LABELS)) {
    if (test(choiceHistory)) {
      if (['merciful', 'principled', 'decisive'].includes(label)) peopleSay = label
      if (['ruthless', 'cautious', 'pragmatic'].includes(label)) recordSays = label
    }
  }

  // Assemble
  let record = ''
  if (contradiction) {
    record = contradiction.text
  } else if (actions.length >= 2) {
    record = `You ${actions[0]} and ${actions[actions.length - 1]}.`
  } else if (actions.length === 1) {
    record = `You ${actions[0]}.`
  }

  record += ` Your people call you ${peopleSay}. The record calls you ${recordSays}. Which is true?`

  return record
}
