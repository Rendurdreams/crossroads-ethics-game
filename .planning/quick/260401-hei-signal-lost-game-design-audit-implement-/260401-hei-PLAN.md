# PLAN — 260401-hei: Signal Lost Game Design Audit (22 Improvements)

**Status:** Ready for execution

---

## Execution Groups (ordered by dependency)

### Group 1: Scenario Data Layer (signal-lost.js)
**Proposals:** #1, #2, #3, #5, #6, #15

| # | Change | Detail |
|---|--------|--------|
| 1 | R7 weight: 'medium' → 'low' | Single field change |
| 2 | Add timerPressure to R6 | Add `timerSeconds: 60` or equivalent field. Check how R5 timer is configured and match pattern |
| 3 | Add `previousRoundCallback` field to R2-R8 | 1-sentence narrative bridge per round (7 strings) |
| 5 | Randomize choice ordering | Add `choiceDisplayOrder` field per round (e.g. [2,0,1]) or handle in ScenarioCard rendering. Need to audit which rounds have "Choice III = compromise" and reorder |
| 6 | Fold R7 Choice IV into Choice II | Merge "No intervention" into "Retraining only" as a harder version, or keep 4 choices but add 4th to R2 and R4 for consistency |
| 15 | Add `dynamicStakes` to profiles | Add conditional stake variants to senatorProfiles.js keyed by prior choices |

### Group 2: Detection & Scoring (detection.js, scribeRecord.js, worldState.js, frameworks.js)
**Proposals:** #4, #9, #10, #16, #22

| # | Change | Detail |
|---|--------|--------|
| 4 | Remove 2-flag cap in scribeRecord | Change `activeFlags.slice(0, 2)` to show all |
| 9 | Check top-2 values in findMoralConflicts | Extend to check moralValues[1] with softer messaging |
| 10 | Weight consistency by round weight | Use WEIGHT_MAP to compute weighted consistency tiers |
| 16 | Include break flags in computeNarrative | Add flag-aware sentences to worldState.js narrative |
| 22 | Add 'justice' to moral values | Add to VALUE_FRAMEWORK_MAP in detection.js, update Baseline.jsx |

### Group 3: Senator Profiles (senatorProfiles.js)
**Proposals:** #13, #14, #15 (data)

| # | Change | Detail |
|---|--------|--------|
| 13 | Give Profile A one conflict | Add a financial thread (labor coalition funding from automation company) |
| 14 | Add replay prompt text | Just a string constant, rendered in FrameworkProfile |
| 15 | Dynamic stakes data | Add `dynamicStakes` object to each profile with conditional variants |

### Group 4: Player UI (Play.jsx, ScenarioCard.jsx, ConsequenceReveal.jsx, WalkMechanic.jsx, Baseline.jsx)
**Proposals:** #2 (UI), #3 (UI), #5 (UI), #7, #8, #17, #21

| # | Change | Detail |
|---|--------|--------|
| 2 | Timer display for R6 | Play.jsx already handles timer — ensure R6 gets one |
| 3 | Render previousRoundCallback before scenario text | Add to ScenarioCard or Play.jsx round view |
| 5 | Render choices in display order | ScenarioCard maps choices — use choiceDisplayOrder if present |
| 7 | Track passes in choice_history | When player passes, insert a pass record |
| 8 | Add "why" text field after choice lock | Optional textarea in Play.jsx submitted state |
| 17 | Document 65 starting state intent | Add comment or host-visible note |
| 21 | Pack-specific baseline framing | Conditional question text in Baseline.jsx based on pack |

### Group 5: Host UI (Host.jsx)
**Proposals:** #18, #19, #20

| # | Change | Detail |
|---|--------|--------|
| 18 | Surface discussion prompts on host screen | Render discussionPrompts in post-round overlay |
| 19 | Render conflictSpotlight | Show profile conflict callout with actual player choices if available |
| 20 | Add hostNotes per scenario | Add data to signal-lost.js + render in Host.jsx |

### Group 6: End Screen (FrameworkProfile.jsx)
**Proposals:** #11, #12, #14

| # | Change | Detail |
|---|--------|--------|
| 11 | Connect least-used framework to specific missed rounds | Look up which rounds had that framework as an option |
| 12 | Add group comparison section | Use group_debrief_context data already computed by Host |
| 14 | Replay prompt at bottom | Simple text render |

---

## Detailed Implementation Notes

### #3 — Narrative Bridges (previousRoundCallback)
```
R2: "The network has been restored. But the attacks that caused the triage have not stopped."
R3: "The infrastructure crisis exposed how much depends on systems that can think. Now one of those systems is asking a question."
R4: "The committee that weighed ARIA-7's petition has another case — this time, the system in question has already decided fourteen thousand human lives."
R5: "The policy debates continue. But this vote is different — the consequences are measured in generations, not quarters."
R6: "Seven months of committee votes. Policy language. Impact projections. This is not a committee vote. This is a corridor with a terminal at the end."
R7: "The enforcement actions and policy decisions of the past year created stability for some. For eleven million others, they created a queue."
R8: "Seven years. Every vote, every sealed report, every deferred enforcement. A journalist has the complete record."
```

### #5 — Choice Reordering
Rounds where Choice III is currently the "safe middle":
- R2: Pilot program → move to Choice I position
- R3: Tribunal → move to Choice I position  
- R4: Brief judiciary → move to Choice I position
- R6: Conditional notice → move to Choice I position

Implementation: Add `displayOrder: [2, 0, 1]` to these rounds. ScenarioCard renders in displayOrder but submits the original choiceIndex.

### #6 — R7 Choice IV Resolution
Fold "No intervention" sentiment into Choice II (Retraining). New Choice II text: "Retraining mandates only. No income floor. The market has always absorbed disruption — give people skills, not dependency." This captures both the dignity-through-work AND the market-will-correct positions. Remove Choice IV. Update howOthersChose percentages: redistribute 8% across remaining 3 choices.

### #9 — Top-2 Value Detection
```javascript
// After checking topValue (index 0), check secondValue (index 1)
if (moralValues.length >= 2) {
  const secondValue = moralValues[1]
  const secondAligned = VALUE_FRAMEWORK_MAP[secondValue] ?? []
  // Only fire if round not already conflicted by topValue
  choiceHistory.forEach(choice => {
    if (conflicts.some(c => c.round === choice.round)) return
    const isAligned = choice.frameworks.some(f => secondAligned.includes(f))
    if (!isAligned) {
      conflicts.push({
        round: choice.round, type: 'value', valueName: secondValue,
        message: `This also sits uneasily with ${secondValue}, your second-ranked value.`
      })
    }
  })
}
```

### #10 — Weighted Consistency Tiers
```javascript
// After computing counts, check heavy-round alignment
const heavyChoices = choiceHistory.filter(c => c.moral_weight === 3)
const heavyAligned = heavyChoices.filter(c => c.frameworks.includes(dominant))
const heldUnderPressure = heavyChoices.length > 0 && heavyAligned.length === heavyChoices.length

if (maxCount / total >= 0.5 && heldUnderPressure) consistency_score = 'remarkably_consistent'
else if (maxCount / total >= 0.5) consistency_score = 'consistent' 
else consistency_score = 'context_dependent'
```

### #13 — Profile A Conflict
Add to Profile A variables: `politics: 'Grassroots labor coalition base. They elected you to protect workers. They are watching. What they don't know: the coalition's largest donor runs a logistics company in the CORPORATE TIER queue.'`
Add stakes.r1: update to reference the hidden donor connection.
Add stakes.r7: "Your labor base is in this queue. Some of them voted for you three times. The coalition's funding comes from a company that automated its own workforce last year."

### #15 — Dynamic Stakes Structure
Add to senatorProfiles.js:
```javascript
dynamicStakes: {
  r4: [
    { condition: (history) => history.some(c => c.scenarioId === 'signal-r1' && c.choiceIndex === 2),
      text: 'You chose contracts over lives in Round 1. The audit shows what happens when systems prioritize contracts.' }
  ],
  r6: [
    { condition: (history) => history.some(c => c.scenarioId === 'signal-r4' && c.choiceIndex === 0),
      text: 'You published the audit. You already showed you can act against self-interest. The corridor is waiting.' }
  ],
  r8: [
    { condition: (history) => history.some(c => c.scenarioId === 'signal-r6' && c.choiceIndex === 1),
      text: 'You walked away from Kael. That is in the record. The journalist knows.' }
  ]
}
```
Play.jsx: when rendering stakes, check dynamicStakes[r${round}] conditions against myChoiceHistory. If a condition matches, append or replace the static stake text.

### #18/#19/#20 — Host Post-Round Enhancements
After round closes, Host.jsx lesson overlay adds:
- discussionPrompts (3 per round) as selectable cards
- conflictSpotlight callout with profile names + actual player choices if those profiles are in session
- hostNotes (new field) as collapsible panel

### #22 — Justice Value
Add to VALUE_FRAMEWORK_MAP: `justice: ['deontology', 'virtue']`
Add to Baseline.jsx value list: replace 'compassion' with 'justice'
Update VALUE_CONDITION_TRIGGERS for justice-specific rounds

---

## Task Breakdown (10 tasks)

1. **Scenario data changes** — R7 weight, R6 timer, narrative bridges, hostNotes, displayOrder (#1, #2, #3, #5, #20 data)
2. **R7 Choice IV fold** — Merge choice, update howOthersChose, update breakFlags, update scribeRecord (#6)
3. **Detection improvements** — Top-2 values, weighted consistency, justice value (#9, #10, #22)
4. **Scribe record + world narrative** — Remove flag cap, add flags to narrative (#4, #16)
5. **Profile A conflict + replay prompt** (#13, #14)
6. **Dynamic stakes** — Data structure + Play.jsx rendering (#15)
7. **Player UI** — Pass tracking, "why" field, narrative bridge rendering, choice reorder rendering (#7, #8, #3 UI, #5 UI)
8. **Baseline updates** — Pack-specific framing, justice value in survey (#21, #22 UI)
9. **Host UI** — Discussion prompts, conflict spotlight, host notes rendering (#18, #19, #20 UI)
10. **End screen** — Least-used framework specifics, group comparison, replay prompt (#11, #12, #14 UI)

## Verification
- `npx vite build` — clean build
- Manual walkthrough: lobby → R1 → R8 → end screen
- Verify detection changes with test choice histories
- Verify host screen shows discussion prompts and conflict spotlight
