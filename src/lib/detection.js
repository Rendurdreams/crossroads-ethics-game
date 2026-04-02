import { CONFLICT_PAIRS } from './frameworks.js'

/**
 * Maps a player's stated personal value to the ethical framework(s) it aligns with.
 * Used by findMoralConflicts to detect value-framework tension.
 */
/**
 * Moral Foundations Theory (Haidt, 2012) mapped to ethical frameworks.
 * Each foundation aligns with 1-2 frameworks; a conflict fires when
 * the player's top value doesn't appear in the choice's framework tags.
 */
/**
 * Moral Foundations Theory (Haidt, 2012) mapped to ethical frameworks.
 * Values with empty arrays use condition triggers instead (more precise).
 * loyalty = loyal to your people/base/donors — fires on specific betrayal choices, not generic frameworks.
 * fairness = proportional justice — fires on specific condition triggers.
 */
export const VALUE_FRAMEWORK_MAP = {
  care:       ['care', 'virtue'],
  fairness:   [],                   // uses condition triggers
  loyalty:    [],                   // uses condition triggers — loyalty is about your people, not abstract frameworks
  authority:  ['deontology'],
  sanctity:   ['virtue', 'deontology']
}

/**
 * Condition-specific value conflict triggers for values whose conflicts
 * cannot be expressed as a framework mapping (e.g. fairness, which maps to
 * a framework tag that never appears in scenario choices).
 *
 * Each entry fires a value-type conflict when:
 *   - The player's top value matches `value`
 *   - The choice matches `matchCondition`
 *
 * No-double-fire rule still applies: these run BEFORE stance triggers
 * but AFTER VALUE_FRAMEWORK_MAP checks.
 */
const VALUE_CONDITION_TRIGGERS = [
  // ── Kingdom Arc — fairness triggers ─────────────────────────────────
  {
    value: 'fairness',
    matchCondition: (choice) => choice.scenarioId === 'round-1' && choice.choiceIndex === 1,
    message: "Fairness asks who deserves to eat. You let the math decide."
  },
  {
    value: 'fairness',
    matchCondition: (choice) => choice.scenarioId === 'round-3' && choice.choiceIndex === 1,
    message: "The Hollow Folk asked for equal standing. You held the line."
  },

  // ── Signal Lost — fairness triggers ─────────────────────────────────
  {
    value: 'fairness',
    matchCondition: (choice) => choice.scenarioId === 'signal-r1' && choice.choiceIndex === 2,
    message: "Fairness asks who deserves to live when the contracts say otherwise."
  },
  {
    value: 'fairness',
    matchCondition: (choice) => choice.scenarioId === 'signal-r3' && choice.choiceIndex === 1,
    message: "Fairness asks whether biological origin determines who counts as a person."
  },
  {
    value: 'fairness',
    matchCondition: (choice) => choice.scenarioId === 'signal-r4' && choice.choiceIndex === 1,
    message: "Fairness asks what you owe fourteen thousand people harmed by a biased system."
  },
  {
    value: 'fairness',
    matchCondition: (choice) => choice.scenarioId === 'signal-r6' && choice.choiceIndex === 1,
    message: "Fairness asks what Kael is owed. You walked away."
  },
  {
    value: 'fairness',
    matchCondition: (choice) => choice.scenarioId === 'signal-r7' && choice.choiceIndex === 1,
    message: "Fairness asks who pays when eleven million people are displaced by decisions that had authors."
  },

  // ── Loyalty condition triggers (Signal Lost) ────────────────────────
  // Loyalty = standing with your people. These fire when the choice clearly prioritizes
  // principle or system over the people who depend on you.
  {
    value: 'loyalty',
    matchCondition: (choice) => choice.scenarioId === 'signal-r1' && choice.choiceIndex === 2,
    message: "Your people needed the network. You honored contracts instead."
  },
  {
    value: 'loyalty',
    matchCondition: (choice) => choice.scenarioId === 'signal-r2' && choice.choiceIndex === 0,
    message: "Deploying ARGUS means surveilling the people who elected you. Loyalty asks: to whom?"
  },
  {
    value: 'loyalty',
    matchCondition: (choice) => choice.scenarioId === 'signal-r4' && choice.choiceIndex === 1,
    message: "Sealing the audit protects the institution. The fourteen thousand incarcerated are also your people."
  },
  {
    value: 'loyalty',
    matchCondition: (choice) => choice.scenarioId === 'signal-r6' && choice.choiceIndex === 1,
    message: "Walking away kept the system running. Kael and six thousand others are someone's people too."
  },
  {
    value: 'loyalty',
    matchCondition: (choice) => choice.scenarioId === 'signal-r7' && choice.choiceIndex === 1,
    message: "Retraining without a floor trusts the market with eleven million lives. Your base is in that number."
  },

  // ── Loyalty condition triggers (Kingdom Arc) ────────────────────────
  {
    value: 'loyalty',
    matchCondition: (choice) => choice.scenarioId === 'round-1' && choice.choiceIndex === 1,
    message: "Your outer villages are your people. You kept the grain behind capital walls."
  },
  {
    value: 'loyalty',
    matchCondition: (choice) => choice.scenarioId === 'round-7' && choice.choiceIndex === 0,
    message: "Retribution felt just. But among the Compact were soldiers who followed orders and children who had no voice."
  }
]

/**
 * Condition-specific stance conflict triggers.
 * Each trigger fires when the player's stated stance answer AND a specific
 * round+choice (or framework) match the condition.
 *
 * Fields:
 *   stanceKey     - key in moralStances object
 *   stanceAnswer  - value that triggers the conflict ('yes'|'no'|'it_depends')
 *   matchCondition - (optional) function(choice) => boolean — checks specific round+choiceIndex
 *   matchFramework - (optional) string — fires for any round where choice includes this framework
 *   message       - exact conflict string shown to player
 */
const STANCE_TRIGGERS = [
  {
    stanceKey: 'lie_to_protect',
    stanceAnswer: 'no',
    matchCondition: (choice) => choice.scenarioId === 'round-4' && choice.choiceIndex === 2,
    message: "You value honesty — but here you chose to conceal. Psychologists call this situational ethics: context shifted what felt right."
  },
  {
    stanceKey: 'lie_to_protect',
    stanceAnswer: 'no',
    matchCondition: (choice) => choice.scenarioId === 'round-bombshell' && choice.choiceIndex === 1,
    message: "You value honesty — but here you chose to conceal. Psychologists call this situational ethics: context shifted what felt right."
  },
  {
    stanceKey: 'lie_to_protect',
    stanceAnswer: 'yes',
    matchCondition: (choice) => choice.scenarioId === 'round-4' && choice.choiceIndex === 0,
    message: "You said protecting people matters most. Here, transparency was the protection — and you chose it. Your values and your behavior aligned in an unexpected way."
  },
  {
    stanceKey: 'lie_to_protect',
    stanceAnswer: 'yes',
    matchCondition: (choice) => choice.scenarioId === 'round-bombshell' && choice.choiceIndex === 0,
    message: "You said protecting people matters most. Here, transparency was the protection — and you chose it. Your values and your behavior aligned in an unexpected way."
  },
  {
    stanceKey: 'ends_justify',
    stanceAnswer: 'yes',
    matchCondition: (choice) => choice.scenarioId === 'round-6' && choice.choiceIndex === 0,
    message: "You believe outcomes justify means. Here the outcome calculation pointed to keeping Irel bound — and you chose differently. That's the value-behavior gap in action."
  },
  {
    stanceKey: 'ends_justify',
    stanceAnswer: 'no',
    matchCondition: (choice) => choice.scenarioId === 'round-1' && choice.choiceIndex === 1,
    message: "You said the math doesn't justify harm. Here you used the same kind of calculation. Moral reasoning researchers call this motivated reasoning — the framework shifts to fit the decision you've already made."
  },
  {
    stanceKey: 'break_promise',
    stanceAnswer: 'no',
    matchCondition: (choice) => choice.scenarioId === 'round-5' && choice.choiceIndex === 0,
    message: "Your ancestors made a commitment. You just broke it cleanly."
  },
  {
    stanceKey: 'break_promise',
    stanceAnswer: 'yes',
    matchCondition: (choice) => choice.scenarioId === 'round-5' && choice.choiceIndex === 1,
    message: "You said partial is better than broken. Here you honored the commitment fully — at a cost others absorbed. Commitment bias can make holding a promise feel moral even when the context has changed."
  },
  {
    stanceKey: 'loyalty_vs_fairness',
    stanceAnswer: 'yes',
    matchCondition: (choice) => choice.scenarioId === 'round-7' && choice.choiceIndex === 1,
    message: "You said you'd call out your own group. Here you chose not to. In-group bias is one of the strongest forces in moral psychology — the people closest to us get the benefit of the doubt."
  },
  {
    stanceKey: 'loyalty_vs_fairness',
    stanceAnswer: 'no',
    matchCondition: (choice) => choice.scenarioId === 'round-7' && choice.choiceIndex === 0,
    message: "You said loyalty comes first. Here you chose justice over mercy for people who included children. When loyalty and accountability collide, the choice reveals which one you hold as non-negotiable."
  },
  {
    stanceKey: 'punish_innocent',
    stanceAnswer: 'no',
    matchCondition: (choice) => choice.scenarioId === 'round-7' && choice.choiceIndex === 0,
    message: "You said no one should suffer for the group. This choice extended collective punishment to people who had no agency. The gap between principle and practice is where moral psychology lives."
  },
  {
    stanceKey: 'punish_innocent',
    stanceAnswer: 'yes',
    matchCondition: (choice) => choice.scenarioId === 'round-6' && choice.choiceIndex === 0,
    message: "You said one person suffering for the group is acceptable. Here you freed Irel anyway. Something overrode your stated position — researchers call this moral elevation, when empathy overrides utilitarian logic."
  },

  // ── Signal Lost STANCE_TRIGGERS ──────────────────────────────────────

  // lie_to_protect = 'yes' (Care) → fires on Deontology choices in R4 / R8
  {
    stanceKey: 'lie_to_protect',
    stanceAnswer: 'yes',
    matchCondition: (choice) => choice.scenarioId === 'signal-r4' && choice.choiceIndex === 0,
    message: "You said you'd conceal to protect. Here you chose radical transparency. When the stakes shifted from personal to institutional, your moral framework shifted with them."
  },
  {
    stanceKey: 'lie_to_protect',
    stanceAnswer: 'yes',
    matchCondition: (choice) => choice.scenarioId === 'signal-r8' && choice.choiceIndex === 0,
    message: "You said you'd conceal to protect. Here you chose radical transparency. When the stakes shifted from personal to institutional, your moral framework shifted with them."
  },

  // lie_to_protect = 'no' (Deontology) → fires on Care choices in R1 / R4
  {
    stanceKey: 'lie_to_protect',
    stanceAnswer: 'no',
    matchCondition: (choice) => choice.scenarioId === 'signal-r1' && choice.choiceIndex === 0,
    message: "You said honesty was non-negotiable. Here you made an exception. Moral psychologists find this pattern consistently — the threshold for bending a principle depends on who's affected."
  },
  {
    stanceKey: 'lie_to_protect',
    stanceAnswer: 'no',
    matchCondition: (choice) => choice.scenarioId === 'signal-r4' && choice.choiceIndex === 2,
    message: "You said honesty was non-negotiable. Here you made an exception. Moral psychologists find this pattern consistently — the threshold for bending a principle depends on who's affected."
  },

  // ends_justify = 'yes' (Consequentialism) → fires when player enforces in R6
  {
    stanceKey: 'ends_justify',
    stanceAnswer: 'yes',
    matchCondition: (choice) => choice.scenarioId === 'signal-r6' && choice.choiceIndex === 0,
    message: "You said outcomes justify means. Here you enforced on principle rather than calculation. When the person suffering has a name, abstract reasoning often gives way to moral intuition."
  },

  // ends_justify = 'no' (Deontology) → fires when player seals in R4
  {
    stanceKey: 'ends_justify',
    stanceAnswer: 'no',
    matchCondition: (choice) => choice.scenarioId === 'signal-r4' && choice.choiceIndex === 1,
    message: "You said the ends don't justify the means. Here you sealed the audit to manage the outcome. Self-serving bias can reframe concealment as protection without conscious awareness."
  },

  // break_promise = 'break' → fires when player keeps extraction sealed in R5
  {
    stanceKey: 'break_promise',
    stanceAnswer: 'break',
    matchCondition: (choice) => choice.scenarioId === 'signal-r5' && choice.choiceIndex === 1,
    message: "You said you'd break commitments cleanly. Here you honored one at enormous cost. Sunk cost reasoning and status quo bias both pull toward continuation — even when the math says stop."
  },

  // break_promise = 'honor' → fires when player authorizes full extraction in R5
  {
    stanceKey: 'break_promise',
    stanceAnswer: 'honor',
    matchCondition: (choice) => choice.scenarioId === 'signal-r5' && choice.choiceIndex === 0,
    message: "You said you'd honor commitments partially. Here you broke one entirely. When the stakes are measured in millions, the middle ground disappears — and so does the principle you started with."
  },

  // loyalty_vs_fairness = 'yes' (would speak up) → fires on R7 Retraining Only (market absorbs)
  {
    stanceKey: 'loyalty_vs_fairness',
    stanceAnswer: 'yes',
    matchCondition: (choice) => choice.scenarioId === 'signal-r7' && choice.choiceIndex === 1,
    message: "You said you'd call out harm from your own group. Eleven million displaced people needed exactly that. Diffusion of responsibility — the larger the affected group, the easier it is to look away."
  },

  // loyalty_vs_fairness = 'no' → fires when player publishes audit in R4
  {
    stanceKey: 'loyalty_vs_fairness',
    stanceAnswer: 'no',
    matchCondition: (choice) => choice.scenarioId === 'signal-r4' && choice.choiceIndex === 0,
    message: "You said loyalty comes first. Here you published the audit on your own institution. Whistleblower psychology shows this tension: loyalty to the group vs. loyalty to what the group should stand for."
  },

  // punish_innocent = 'yes' → fires when player enforces shutdown in R6
  {
    stanceKey: 'punish_innocent',
    stanceAnswer: 'yes',
    matchCondition: (choice) => choice.scenarioId === 'signal-r6' && choice.choiceIndex === 0,
    message: "You said one person suffering for the group is acceptable. Here you shut down the system causing it. The identifiable victim effect — when suffering has a face, utilitarian logic loses its hold."
  },

  // punish_innocent = 'no' → fires when player honors contracts in R1
  {
    stanceKey: 'punish_innocent',
    stanceAnswer: 'no',
    matchCondition: (choice) => choice.scenarioId === 'signal-r1' && choice.choiceIndex === 2,
    message: "You said no one should suffer for the group. Eleven implant users died so the contracts could hold. Moral disengagement allows people to maintain a self-image as ethical while accepting harm they wouldn't endorse directly."
  }
]

/**
 * Detect rounds where a player's choice conflicted with their stated moral baseline.
 * Primary signal: top-1 value check (D-02).
 * Secondary signal: stance answer check (D-03).
 * Only one conflict per round — value conflict takes priority over stance conflict (D-04).
 *
 * @param {Array<{round: number, frameworks: string[], choiceIndex?: number, scenarioId?: string}>} choiceHistory
 * @param {string[]|null} moralValues - Ordered array, index 0 = player's top value
 * @param {object|null} moralStances - { lie_to_protect?: string, ends_justify?: string, break_promise?: string, loyalty_vs_fairness?: string, punish_innocent?: string }
 * @returns {Array<{round: number, type: 'value'|'stance', valueName?: string, stanceKey?: string, choiceFrameworks: string[], message: string}>}
 */
export function findMoralConflicts(choiceHistory, moralValues, moralStances) {
  if (!moralValues || moralValues.length === 0) return []
  if (!choiceHistory || choiceHistory.length === 0) return []

  const topValue = moralValues[0]
  const alignedFrameworks = VALUE_FRAMEWORK_MAP[topValue] ?? []
  const conflicts = []

  // Primary (framework-based): value conflict detection
  // Skip for values that use condition triggers instead (e.g. fairness)
  const usesConditionTriggers = VALUE_CONDITION_TRIGGERS.some(t => t.value === topValue)

  if (!usesConditionTriggers) {
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
          message: `You ranked ${topValue} as what matters most. This choice pulled in a different direction. That gap between values and behavior is where moral reasoning gets real.`
        })
      }
    })
  }

  // Primary (condition-based): value triggers for values with no framework mapping
  // Runs before stance triggers so condition-based value conflicts block stance conflicts (no-double-fire)
  if (usesConditionTriggers) {
    VALUE_CONDITION_TRIGGERS.filter(t => t.value === topValue).forEach(trigger => {
      choiceHistory.forEach(choice => {
        // Skip if this round already has a conflict
        if (conflicts.some(c => c.round === choice.round)) return
        if (trigger.matchCondition(choice)) {
          conflicts.push({
            round: choice.round,
            type: 'value',
            valueName: topValue,
            choiceFrameworks: choice.frameworks ?? [],
            message: trigger.message
          })
        }
      })
    })
  }

  // Secondary (value #2): check second-ranked value for uncovered rounds
  if (moralValues.length >= 2) {
    const secondValue = moralValues[1]
    const secondAligned = VALUE_FRAMEWORK_MAP[secondValue] ?? []
    const secondUsesConditions = VALUE_CONDITION_TRIGGERS.some(t => t.value === secondValue)

    if (!secondUsesConditions && secondAligned.length > 0) {
      choiceHistory.forEach(choice => {
        if (conflicts.some(c => c.round === choice.round)) return
        const choiceFrameworks = choice.frameworks ?? []
        if (choiceFrameworks.length === 0) return
        const isAligned = choiceFrameworks.some(f => secondAligned.includes(f))
        if (!isAligned) {
          conflicts.push({
            round: choice.round,
            type: 'value',
            valueName: secondValue,
            choiceFrameworks,
            message: `This also creates tension with ${secondValue} — a value you ranked highly. When two values pull in opposite directions, the one you follow tells you something.`
          })
        }
      })
    }

    if (secondUsesConditions) {
      VALUE_CONDITION_TRIGGERS.filter(t => t.value === secondValue).forEach(trigger => {
        choiceHistory.forEach(choice => {
          if (conflicts.some(c => c.round === choice.round)) return
          if (trigger.matchCondition(choice)) {
            conflicts.push({
              round: choice.round,
              type: 'value',
              valueName: secondValue,
              choiceFrameworks: choice.frameworks ?? [],
              message: trigger.message
            })
          }
        })
      })
    }
  }

  // Tertiary: stance-based conflict detection (only fires if round not already conflicted)
  if (moralStances) {
    STANCE_TRIGGERS.forEach(trigger => {
      if (moralStances[trigger.stanceKey] !== trigger.stanceAnswer) return

      choiceHistory.forEach(choice => {
        // Check if already conflicted this round — value conflict takes priority
        if (conflicts.some(c => c.round === choice.round)) return

        let matches = false

        if (trigger.matchCondition) {
          matches = trigger.matchCondition(choice)
        } else if (trigger.matchFramework) {
          matches = (choice.frameworks ?? []).includes(trigger.matchFramework)
        }

        if (matches) {
          conflicts.push({
            round: choice.round,
            type: 'stance',
            stanceKey: trigger.stanceKey,
            choiceFrameworks: choice.frameworks,
            message: trigger.message
          })
        }
      })
    })
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
  const counts = { consequentialism: 0, deontology: 0, care: 0, virtue: 0, utilitarianism: 0 }

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
    const wCounts = { consequentialism: 0, deontology: 0, care: 0, virtue: 0, utilitarianism: 0 }
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

  // Consistency score — weighted by round pressure
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const maxCount = Math.max(...Object.values(counts))
  let consistency_score = null
  if (total > 0 && dominant) {
    const heavyChoices = choiceHistory.filter(c => (c.moral_weight ?? 1) === 3)
    const heavyAligned = heavyChoices.filter(c => (c.frameworks ?? []).includes(dominant))
    const heldUnderPressure = heavyChoices.length > 0 && heavyAligned.length === heavyChoices.length

    if ((maxCount / total) >= 0.5 && heldUnderPressure) {
      consistency_score = 'remarkably_consistent'
    } else if ((maxCount / total) >= 0.5) {
      consistency_score = 'consistent'
    } else {
      consistency_score = 'context_dependent'
    }
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
      // Only count as a conflict if the two frameworks appear in DIFFERENT rounds.
      // A single choice tagged with both frameworks (e.g. ['care', 'consequentialism'])
      // is not a cross-round tension — it's one decision, not a shift in reasoning.
      const f1Set = new Set(frameworkRounds[f1])
      const f2Set = new Set(frameworkRounds[f2])
      const f1Only = [...f1Set].filter(r => !f2Set.has(r))
      const f2Only = [...f2Set].filter(r => !f1Set.has(r))

      // Need at least one round where f1 was used without f2, AND vice versa
      if (f1Only.length === 0 || f2Only.length === 0) return

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
