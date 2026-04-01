// Break Flags — Signal Lost v2.0
// Permanent world state markers triggered by specific choices.
// Once a flag fires, it persists for the rest of the session
// and is cited in the Round 8 scribe record.

const BREAK_FLAGS = [
  {
    round: 1,
    triggerChoiceIndex: 2,
    id: 'R1-ghost',
    label: 'Ghost Population',
    mapEffect: 'Ghost population marker'
  },
  {
    round: 2,
    triggerChoiceIndex: 0,
    id: 'R2-surveillance',
    label: 'Surveillance State',
    mapEffect: 'Surveillance layer overlay'
  },
  {
    round: 3,
    triggerChoiceIndex: 1,
    id: 'R3-denial',
    label: 'Sentience Denied',
    mapEffect: 'Cracked industrial node icon'
  },
  {
    round: 4,
    triggerChoiceIndex: 1,
    id: 'R4-sealed',
    label: 'Sealed Audit',
    mapEffect: 'Sealed audit icon'
  },
  {
    round: 5,
    triggerChoiceIndex: 0,
    id: 'R5-extraction',
    label: 'Ecosystem Damage',
    mapEffect: 'Mariana Shelf damage indicator'
  },
  {
    round: 6,
    triggerChoiceIndex: 1,
    id: 'R6-walkaway',
    label: 'Abandoned Kael',
    mapEffect: 'Dark labor marker on VANTAGE node'
  },
  {
    round: 7,
    triggerChoiceIndex: 1,
    id: 'R7-abandon',
    label: 'Mass Abandonment',
    mapEffect: 'Abandonment marker'
  }
]

export default BREAK_FLAGS

export function getBreakFlagForChoice(round, choiceIndex) {
  return BREAK_FLAGS.find(f => f.round === round && f.triggerChoiceIndex === choiceIndex) ?? null
}

export function getActiveFlags(breakFlagsState) {
  return BREAK_FLAGS.filter(f => breakFlagsState[f.id] === true)
}
