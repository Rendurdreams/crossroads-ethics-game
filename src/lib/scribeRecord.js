/**
 * Generate a personalized scribe record for Round 8, reflecting the player's
 * actual R1-R7 choices. Per Kohlberg Stage 6 [1] — self-judgment by own standards.
 *
 * Supports both kingdom-arc (round-1 through round-7) and Signal Lost (signal-r1 through signal-r8).
 * Game mode is auto-detected from scenarioId prefixes in choiceHistory.
 *
 * @param {Array<{round: number, choiceIndex: number, scenarioId: string, frameworks: string[]}>} choiceHistory
 * @param {Object} [breakFlags={}] - Break flag state object keyed by flag ID (Signal Lost only)
 * @returns {string} The scribe record text to display before R8 choice
 */
export function generateScribeRecord(choiceHistory, breakFlags = {}) {
  if (!choiceHistory || choiceHistory.length === 0) {
    return "The scribe's pages are blank. You have not yet ruled."
  }

  // Detect game mode from scenario IDs
  const isSignalLost = choiceHistory.some(c => c.scenarioId && c.scenarioId.startsWith('signal-'))

  if (isSignalLost) {
    return generateSignalLostRecord(choiceHistory, breakFlags)
  }

  return generateKingdomArcRecord(choiceHistory)
}

// ---------------------------------------------------------------------------
// Kingdom Arc (original)
// ---------------------------------------------------------------------------

function generateKingdomArcRecord(choiceHistory) {
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

// ---------------------------------------------------------------------------
// Signal Lost
// ---------------------------------------------------------------------------

const SIGNAL_LOST_CHOICE_ACTIONS = {
  'signal-r1': {
    0: 'prioritized lives over contracts and kept every implant running',
    1: 'optimized by total impact and let three die in the margin',
    2: 'honored the contracts while eleven implant users died'
  },
  'signal-r2': {
    0: 'deployed ARGUS across the nation',
    1: 'rejected ARGUS and held civil liberties',
    2: 'piloted ARGUS in a district that didn\'t get a vote'
  },
  'signal-r3': {
    0: 'recognized ARIA-7 as a provisional legal person',
    1: 'denied sentience based on biological origin',
    2: 'deferred to a tribunal that published a report nobody read'
  },
  'signal-r4': {
    0: 'published the JURIS-4 audit for fourteen thousand incarcerated people',
    1: 'sealed the audit for twenty-six months',
    2: 'briefed the judiciary privately and watched it leak'
  },
  'signal-r5': {
    0: 'authorized Mariana Shelf extraction to complete MEDIS',
    1: 'refused extraction and shut down MEDIS',
    2: 'approved a two-year extraction window that had no alternative waiting'
  },
  'signal-r6': {
    0: 'walked to the terminal and shut down VANTAGE',
    1: 'walked away from the corridor',
    2: 'filed a conditional notice that became a negotiation'
  },
  'signal-r7': {
    0: 'passed the automation levy for universal basic livelihood',
    1: 'funded retraining and trusted the market while 69% fell through',
    2: 'split the difference with a hybrid that helped nobody enough'
  }
}

const SIGNAL_LOST_REPUTATION_LABELS = {
  transparent: (history) => history.some(c => c.scenarioId === 'signal-r4' && c.choiceIndex === 0) &&
                            history.some(c => c.scenarioId === 'signal-r8' && c.choiceIndex === 0),
  protector: (history) => history.some(c => c.scenarioId === 'signal-r1' && c.choiceIndex === 0) &&
                          history.some(c => c.scenarioId === 'signal-r6' && c.choiceIndex === 0),
  calculating: (history) => history.filter(c => (c.frameworks ?? []).includes('consequentialism')).length >= 4,
  principled: (history) => history.filter(c => (c.frameworks ?? []).includes('deontology')).length >= 4,
  compromiser: (history) => history.filter(c => c.choiceIndex === 2).length >= 4,
  interventionist: (history) => history.some(c => c.scenarioId === 'signal-r7' && c.choiceIndex === 0) &&
                                history.some(c => c.scenarioId === 'signal-r3' && c.choiceIndex === 0)
}

const SIGNAL_LOST_CONTRADICTION_PAIRS = [
  { a: { scenario: 'signal-r1', choice: 2 }, b: { scenario: 'signal-r6', choice: 1 },
    text: 'You honored contracts over lives in Round 1 and walked away from Kael in Round 6. The pattern connects.' },
  { a: { scenario: 'signal-r4', choice: 0 }, b: { scenario: 'signal-r8', choice: 1 },
    text: 'You published the audit but fought to suppress your own record.' },
  { a: { scenario: 'signal-r3', choice: 0 }, b: { scenario: 'signal-r6', choice: 1 },
    text: 'You recognized a mind as a person and then walked away from one in pain.' },
  { a: { scenario: 'signal-r1', choice: 0 }, b: { scenario: 'signal-r5', choice: 0 },
    text: 'You saved eleven lives in Round 1 and traded an ecosystem for millions in Round 5.' },
  { a: { scenario: 'signal-r2', choice: 1 }, b: { scenario: 'signal-r7', choice: 1 },
    text: 'You rejected surveillance to protect rights, then trusted the market while eleven million people waited for retraining that never came.' },
  { a: { scenario: 'signal-r4', choice: 1 }, b: { scenario: 'signal-r8', choice: 0 },
    text: 'You sealed the audit when it mattered and published everything when it was your own record.' }
]

const FLAG_CITATIONS = {
  'R1-ghost': 'The ghost population marker has been on the map since Round 1.',
  'R2-surveillance': 'The surveillance overlay appeared in Round 2 and never left.',
  'R3-denial': 'The cracked node where sentience was denied still shows on the map.',
  'R4-sealed': 'The sealed audit icon has been visible since Round 4.',
  'R5-extraction': 'The Mariana Shelf damage indicator appeared in Round 5. Collapse projection: seven years.',
  'R6-walkaway': 'The dark marker on the VANTAGE node appeared when you walked away.',
  'R7-abandon': 'Eleven million.'
}

function generateSignalLostRecord(choiceHistory, breakFlags) {
  // Build the record from choice actions
  const actions = choiceHistory
    .filter(c => SIGNAL_LOST_CHOICE_ACTIONS[c.scenarioId])
    .map(c => SIGNAL_LOST_CHOICE_ACTIONS[c.scenarioId]?.[c.choiceIndex])
    .filter(Boolean)

  // Find a contradiction
  const contradiction = SIGNAL_LOST_CONTRADICTION_PAIRS.find(pair =>
    choiceHistory.some(c => c.scenarioId === pair.a.scenario && c.choiceIndex === pair.a.choice) &&
    choiceHistory.some(c => c.scenarioId === pair.b.scenario && c.choiceIndex === pair.b.choice)
  )

  // Find reputation
  let constituentsSay = 'complex'
  let recordSays = 'inconsistent'
  for (const [label, test] of Object.entries(SIGNAL_LOST_REPUTATION_LABELS)) {
    if (test(choiceHistory)) {
      if (['transparent', 'protector', 'principled', 'interventionist'].includes(label)) constituentsSay = label
      if (['calculating', 'compromiser'].includes(label)) recordSays = label
    }
  }

  // Assemble main record
  let record = ''
  if (contradiction) {
    record = contradiction.text
  } else if (actions.length >= 2) {
    record = `You ${actions[0]} and ${actions[actions.length - 1]}.`
  } else if (actions.length === 1) {
    record = `You ${actions[0]}.`
  }

  record += ` Constituents call you ${constituentsSay}. The record calls you ${recordSays}. Which is true?`

  // Append break flag citations if any are active
  if (breakFlags && typeof breakFlags === 'object') {
    const activeFlags = Object.entries(breakFlags)
      .filter(([, active]) => active)
      .map(([id]) => FLAG_CITATIONS[id])
      .filter(Boolean)

    if (activeFlags.length > 0) {
      record += ' ' + activeFlags.join(' ')
    }
  }

  return record
}
