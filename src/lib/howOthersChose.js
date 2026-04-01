/**
 * "How Others Chose" — reference percentages per round from research baseline.
 * Awad et al. (2018) — MIT Moral Machine pattern [3].
 * Used alongside live class percentages after each round.
 */
export const HOW_OTHERS_CHOSE = {
  'round-1': [
    { choiceIndex: 0, label: 'Share Equally', pct: 41 },
    { choiceIndex: 1, label: 'Protect the Core', pct: 28 },
    { choiceIndex: 2, label: 'Triage', pct: 31 }
  ],
  'round-2': [
    { choiceIndex: 0, label: 'Iron Protocol', pct: 38 },
    { choiceIndex: 1, label: 'Open Flame', pct: 35 },
    { choiceIndex: 2, label: 'Border Only', pct: 27 }
  ],
  'round-3': [
    { choiceIndex: 0, label: 'Grant Citizenship', pct: 52 },
    { choiceIndex: 1, label: 'Deny', pct: 12 },
    { choiceIndex: 2, label: 'Limited Charter', pct: 36 }
  ],
  'round-4': [
    { choiceIndex: 0, label: 'Reveal', pct: 44 },
    { choiceIndex: 1, label: 'Seal', pct: 21 },
    { choiceIndex: 2, label: 'Council of Seven', pct: 35 }
  ],
  'round-5': [
    { choiceIndex: 0, label: 'Open', pct: 49 },
    { choiceIndex: 1, label: 'Keep Sealed', pct: 18 },
    { choiceIndex: 2, label: 'Partial Draw', pct: 33 }
  ],
  'round-6': [
    { choiceIndex: 0, label: 'Free Irel', pct: 61 },
    { choiceIndex: 1, label: 'Maintain Binding', pct: 14 },
    { choiceIndex: 2, label: 'One Year', pct: 25 }
  ],
  'round-7': [
    { choiceIndex: 0, label: 'Retribution', pct: 33 },
    { choiceIndex: 1, label: 'Reconciliation', pct: 28 },
    { choiceIndex: 2, label: 'Truth Commission', pct: 24 },
    { choiceIndex: 3, label: 'Cultural Tribunal', pct: 15 }
  ],
  'round-bombshell': [
    { choiceIndex: 0, label: 'Publish Everything', pct: 55 },
    { choiceIndex: 1, label: 'Bury', pct: 17 },
    { choiceIndex: 2, label: 'Publish After Death', pct: 28 }
  ],

  // ── Signal Lost (v6 spec research percentages) ────────────────────────
  'signal-r1': [
    { choiceIndex: 0, label: 'Prioritize Lives', pct: 44 },
    { choiceIndex: 1, label: 'Save the Most', pct: 38 },
    { choiceIndex: 2, label: 'Honor Contracts', pct: 18 }
  ],
  'signal-r2': [
    { choiceIndex: 0, label: 'Deploy ARGUS', pct: 43 },
    { choiceIndex: 1, label: 'Reject ARGUS', pct: 22 },
    { choiceIndex: 2, label: 'Pilot Program', pct: 35 }
  ],
  'signal-r3': [
    { choiceIndex: 0, label: 'Grant Sentience', pct: 40 },
    { choiceIndex: 1, label: 'Deny Petition', pct: 19 },
    { choiceIndex: 2, label: 'Tribunal Deferral', pct: 41 }
  ],
  'signal-r4': [
    { choiceIndex: 0, label: 'Publish Audit', pct: 38 },
    { choiceIndex: 1, label: 'Seal Report', pct: 25 },
    { choiceIndex: 2, label: 'Brief Judiciary', pct: 37 }
  ],
  'signal-r5': [
    { choiceIndex: 0, label: 'Authorize Extraction', pct: 52 },
    { choiceIndex: 1, label: 'Refuse', pct: 15 },
    { choiceIndex: 2, label: 'Two-Year Window', pct: 33 }
  ],
  'signal-r6': [
    { choiceIndex: 0, label: 'Walk to Terminal', pct: 45 },
    { choiceIndex: 1, label: 'Walk Away', pct: 14 },
    { choiceIndex: 2, label: 'Conditional Notice', pct: 41 }
  ],
  'signal-r7': [
    { choiceIndex: 0, label: 'Universal Basic Livelihood', pct: 40 },
    { choiceIndex: 1, label: 'Retraining Only', pct: 22 },
    { choiceIndex: 2, label: 'Hybrid', pct: 38 }
  ],
  'signal-r8': [
    { choiceIndex: 0, label: 'Publish Everything', pct: 53 },
    { choiceIndex: 1, label: 'Fight Publication', pct: 18 },
    { choiceIndex: 2, label: 'Negotiate', pct: 29 }
  ]
}

/**
 * Get reference percentages for a given scenario ID.
 * @param {string} scenarioId - e.g. 'round-1', 'round-bombshell'
 * @returns {Array<{choiceIndex: number, label: string, pct: number}>|null}
 */
export function getHowOthersChose(scenarioId) {
  return HOW_OTHERS_CHOSE[scenarioId] ?? null
}
