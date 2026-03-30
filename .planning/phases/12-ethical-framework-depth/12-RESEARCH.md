# Phase 12: Ethical Framework Depth - Research

**Researched:** 2026-03-30
**Domain:** Detection logic extension, React component additions, scenario data schema, end-screen composition
**Confidence:** HIGH — all findings derived from direct codebase inspection

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Expanded Baseline (BASELINE-01, BASELINE-02, BASELINE-03)**
- D-01: All 5 stance questions shown at once on a single scrollable page after value ranking. No progressive reveal per question.
- D-02: 3 new stance questions use REQUIREMENTS.md wording verbatim:
  - Q3 key `break_promise`: "Is it right to break a promise to prevent harm?" (deontology vs consequentialism)
  - Q4 key `truth_over_relationship`: "Should a person always tell the truth even if it destroys a relationship?" (virtue vs care)
  - Q5 key `punish_innocent`: "Is it okay to punish the innocent if it protects the group?" (rights vs utilitarian)
- D-03: Same yes/no/it_depends answer pattern as existing questions. Same decree-tile button style.
- D-04: Detection mapping — `'no'` answer triggers conflict:
  - `break_promise='no'` flags consequentialist choices
  - `truth_over_relationship='no'` flags virtue choices
  - `punish_innocent='yes'` flags rights-dimension choices (note: 'yes' is the trigger here, not 'no')

**Moral Trajectory (TRAJECTORY-01 through TRAJECTORY-04)**
- D-05: `moral_weight` mapped from scenario weight: low=1, medium=2, heavy=3, reflective=0
- D-06: Fixed round split: early = rounds 1-2, late = rounds 5+. Middle rounds (3-4) excluded.
- D-07: Trajectory uses weight-adjusted framework counts.
- D-08: Meaningful shift threshold: dominant framework must change between early and late rounds.
- D-09: "Your Moral Arc" section sits after "Morals vs Ethics" (#3 position) in end screen order.
- D-10: `consistency_score` is qualitative label only — never show a number or percentage.
- D-11: Arc narrative names the shift AND explains the philosophical meaning.

**Conscience Cost (CONSCIENCE-01, CONSCIENCE-02)**
- D-12: ConsequenceReveal gets a visual-only amber border when a moral conflict was registered. No additional text.
- D-13: End screen "moral friction" count framing: "Your choices conflicted with your stated values in X of Y rounds." Followed by: "That tension is the point."

**Deontological Awareness Prompt (DEONTO-01, DEONTO-02)**
- D-14: Inline glass-card banner appears above the 3 decree tiles when scenario loads. Does NOT block choice buttons.
- D-15: Prompt appears on scenario load (not after tapping a choice). Check at render time.
- D-16: Only triggers when player ranked honesty #1 AND answered "no" to `lie_to_protect`. Only this combo triggers.
- D-17: Prompt text: "This choice prioritizes loyalty over truth. You declared truth matters most." Dismissible by tapping anywhere on the banner.
- D-18: Dismissal logged as flags on choice_history entry: `awareness_prompt_shown: true` and `awareness_prompt_dismissed: true`.

**Virtue Reputation (VIRTUE-01, VIRTUE-02)**
- D-19: `virtue_streak` tracks consecutive virtue-tagged choices. Resets on non-virtue. Longest streak reported.
- D-20: "Character" subsection: counts virtue choices in heavy-weight rounds. Simple count, not a ratio.
- D-21: Character section hidden entirely if fewer than 2 virtue choices made.

**Rights Awareness (RIGHTS-01, RIGHTS-02)**
- D-22: All qualifying scenarios across all 3 packs tagged with `rights_dimension: true`.
- D-23: Rights awareness line shown only when ≥2 rights-dimension scenarios were played.

**Cultural Context (CULTURE-01, CULTURE-02)**
- D-24: `ethicalLens` field added to each pack object:
  - Kingdom: "What does a ruler owe?"
  - Real-World: "What do you owe the people around you?"
  - Futures: "What do you owe the people who come after you?"
- D-25: HostSetup pack card renders ethicalLens as subtitle below pack description.
- D-26: End screen footer shows pack name + ethical lens + context note.

**End Screen Section Order (D-27)**
1. Your Framework (dominant)
2. Your Morals vs Your Ethics
3. Your Moral Arc (only if shift detected)
4. Character (only if ≥2 virtue choices)
5. Moral Friction count
6. Where the Conflict Lived
7. Rights Awareness (only if ≥2 rights scenarios played)
8. The Framework You Used Least
9. Cultural Context footer
10. Your Choice Log

**Empty State Handling (D-28)**
- Sections that don't meet their data threshold are hidden entirely — no "not enough data" messages.

### Claude's Discretion
- Exact CSS styling for the awareness prompt banner (glass-card variant, animation)
- Internal structure of trajectory computation (function signature, intermediate data structures)
- Which specific scenarios across the 3 packs qualify for `rights_dimension: true`
- Exact copy for arc narratives for each possible framework shift combination
- Whether `virtue_streak` is computed in detection.js or inline in FrameworkProfile.jsx

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BASELINE-01 | Expand baseline from 2 to 5 stance questions | `STANCE_QUESTIONS` array in `Baseline.jsx` — add 3 entries; all display at once (D-01) |
| BASELINE-02 | Wire new stances into `findMoralConflicts()` as secondary signals | `detection.js` stance block pattern — add 3 new `if` checks following existing `ends_justify`/`lie_to_protect` pattern |
| BASELINE-03 | Baseline completes in under 60 seconds | All 5 questions shown at once per D-01; no gating beyond existing "finish ranking first" guard |
| TRAJECTORY-01 | `choice_history` entries enriched with `moral_weight` field | `handleChoice()` in `Play.jsx` inserts to `choices` table — add `moral_weight` derived from `currentScenario.weight`; `endSession()` in `Host.jsx` rebuilds `choice_history` — must include `moral_weight` there too |
| TRAJECTORY-02 | `computeProfile()` returns new `trajectory` object | Extend `computeProfile()` in `detection.js` — new return field alongside existing `dominant`, `counts`, `leastUsed` |
| TRAJECTORY-03 | End screen "Your Moral Arc" section | Add conditional section to `FrameworkProfile.jsx` at position 3 (after conflicts) |
| TRAJECTORY-04 | `consistency_score` qualitative label | Computed inside `computeProfile()` or `endSession()`; rendered in "Your Moral Arc" section as a text label |
| CONSCIENCE-01 | ConsequenceReveal amber border when moral conflict registered | New `.cardConflict` CSS class + `hasMoralConflict` prop to `ConsequenceReveal.jsx`; plumbed from `Play.jsx` |
| CONSCIENCE-02 | End screen moral friction count | New section in `FrameworkProfile.jsx`; data comes from `player.moral_conflicts` (already stored by `endSession()`) |
| DEONTO-01 | Pre-choice awareness prompt for honesty+lie_to_protect combo | New banner component/JSX in `Play.jsx` active round view, above `<ScenarioCard>` |
| DEONTO-02 | Prompt dismissible, dismissal logged in choice_history | Dismissed state in `Play.jsx` local state; flags added to `choices` insert payload |
| VIRTUE-01 | `virtue_streak` counter | Computed in `detection.js` or `endSession()`; stored to player row; rendered on end screen |
| VIRTUE-02 | End screen "Character" subsection | Conditional section in `FrameworkProfile.jsx` at position 4; data from player profile |
| RIGHTS-01 | Tag scenarios with `rights_dimension: true` | Add field to qualifying scenarios in all 3 pack files; update `@typedef PackScenario` in `scenarios.js` |
| RIGHTS-02 | End screen Rights Awareness line | Conditional section in `FrameworkProfile.jsx` at position 7; needs count of rights-dimension scenarios played |
| CULTURE-01 | Pack card shows ethical lens subtitle | Add `ethicalLens` to pack objects in all 3 pack files; update `@typedef ScenarioPack` in `scenarios.js`; render in `HostSetup.jsx` |
| CULTURE-02 | End screen cultural context footer | New section in `FrameworkProfile.jsx` at position 9; always shown; reads `pack.ethicalLens` |
</phase_requirements>

---

## Summary

Phase 12 is a pure extension phase — no new pages, no routing changes, no schema migration beyond adding optional fields to JSONB columns. All work falls into four categories: (1) extending pure JavaScript detection functions in `detection.js`, (2) adding conditional JSX sections to `FrameworkProfile.jsx`, (3) adding 3 questions to `Baseline.jsx`'s static `STANCE_QUESTIONS` array, and (4) tagging existing scenario objects in the three pack files with new fields.

The critical integration path is the `endSession()` function in `Host.jsx`. It currently calls `computeProfile()` and stores results to `players` — it will need to store `trajectory`, `consistency_score`, `virtue_streak`, and `virtue_heavy_count` as new fields. These can be added as top-level JSONB keys on the player row without a schema migration since the player row already uses JSONB for `framework_counts` and `conflicts`. The alternative is to compute them in-component from `choice_history` at render time — viable for `virtue_streak` and trajectory, but requires `moral_weight` to be present in `choice_history`.

The trickiest integration point is `moral_weight` on `choice_history` entries: the field must be added both at choice-submission time (in `Play.jsx`'s `handleChoice`) and when `endSession()` rebuilds history from the `choices` table. The `choices` table does not currently store `moral_weight` — either add a column or derive it at `endSession()` time from `getScenarioByRound(pack, round_number).weight`.

**Primary recommendation:** Derive `moral_weight` in `endSession()` from the scenario weight lookup (no table migration needed), and compute trajectory/virtue fields there alongside the existing profile computation, storing them to the player row. `FrameworkProfile.jsx` reads them as props from the player object.

---

## Standard Stack

### Core (already installed — no new dependencies)

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| React | 18.x | Component tree | Already installed |
| Framer Motion | 11.13.5 | Stagger animations for new end screen sections | Already installed; `sectionVariants` pattern reused directly |
| @supabase/supabase-js | 2.x | Data persistence | Already installed |

### No New Dependencies Required

All 17 requirements are implementable with:
- Plain JavaScript (detection logic extensions)
- Existing CSS Modules patterns (glass cards, amber borders)
- Existing Framer Motion stagger pattern
- No new npm packages

**Confidence:** HIGH — verified by direct inspection of `package.json` and component patterns.

---

## Architecture Patterns

### Pattern 1: Detection Function Extension (detection.js)

**What:** Pure functions that take `choiceHistory` + player baseline data and return computed results. No Supabase calls, no side effects.

**Established pattern:**
```javascript
// Source: src/lib/detection.js — existing computeProfile()
export function computeProfile(choiceHistory) {
  const counts = { consequentialism: 0, deontology: 0, care: 0, virtue: 0 }
  choiceHistory.forEach(choice => {
    choice.frameworks.forEach(f => {
      if (counts.hasOwnProperty(f)) counts[f]++
    })
  })
  // ...
  return { dominant, counts, leastUsed }
}
```

**Extended return signature for Phase 12:**
```javascript
return {
  dominant,          // existing
  counts,            // existing
  leastUsed,         // existing
  trajectory,        // NEW: { early: string|null, late: string|null, shifted: boolean }
  consistency_score, // NEW: 'high'|'low'|null (null when insufficient rounds)
  virtue_streak,     // NEW: number (longest consecutive virtue streak)
  virtue_heavy_count // NEW: number (virtue choices in heavy-weight rounds)
}
```

**Trajectory computation approach:**
```javascript
// Split choiceHistory by round number
// early = rounds 1-2, late = rounds 5+
// Weight-adjust counts per D-07: each framework tag counts moral_weight times
// Then find dominant for each half independently
function computeTrajectory(choiceHistory) {
  const WEIGHT_MAP = { low: 1, medium: 2, heavy: 3, reflective: 0 }
  const earlyChoices = choiceHistory.filter(c => c.round <= 2)
  const lateChoices  = choiceHistory.filter(c => c.round >= 5)

  function weightedDominant(choices) {
    const counts = { consequentialism: 0, deontology: 0, care: 0, virtue: 0 }
    choices.forEach(c => {
      const w = c.moral_weight ?? 1
      ;(c.frameworks ?? []).forEach(f => {
        if (counts.hasOwnProperty(f)) counts[f] += w
      })
    })
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return sorted[0][1] > 0 ? sorted[0][0] : null
  }

  const early = weightedDominant(earlyChoices)
  const late  = weightedDominant(lateChoices)
  const shifted = early !== null && late !== null && early !== late

  return { early, late, shifted }
}
```

**virtue_streak computation:**
```javascript
function computeVirtueStreak(choiceHistory) {
  let longest = 0
  let current = 0
  // Sort by round to ensure correct order
  const sorted = [...choiceHistory].sort((a, b) => a.round - b.round)
  sorted.forEach(c => {
    if ((c.frameworks ?? []).includes('virtue')) {
      current++
      if (current > longest) longest = current
    } else {
      current = 0
    }
  })
  return longest
}
```

### Pattern 2: findMoralConflicts() Stance Extension

**What:** Existing secondary stance block in `detection.js` — add 3 new `if` blocks following the same dedup guard pattern.

**Existing pattern to replicate:**
```javascript
// Source: src/lib/detection.js lines 52-80
if (moralStances.ends_justify === 'no') {
  choiceHistory.forEach(choice => {
    if ((choice.frameworks ?? []).includes('consequentialism')) {
      if (!conflicts.some(c => c.round === choice.round)) {
        conflicts.push({ round: choice.round, type: 'stance', stanceKey: 'ends_justify', ... })
      }
    }
  })
}
```

**New blocks to add:**
```javascript
// D-04: break_promise='no' → flags consequentialist choices
if (moralStances.break_promise === 'no') {
  choiceHistory.forEach(choice => {
    if ((choice.frameworks ?? []).includes('consequentialism')) {
      if (!conflicts.some(c => c.round === choice.round)) {
        conflicts.push({
          round: choice.round,
          type: 'stance',
          stanceKey: 'break_promise',
          choiceFrameworks: choice.frameworks,
          message: "You said it's not right to break promises — but this choice optimized for outcome over commitment."
        })
      }
    }
  })
}

// D-04: truth_over_relationship='no' → flags virtue choices
if (moralStances.truth_over_relationship === 'no') {
  choiceHistory.forEach(choice => {
    if ((choice.frameworks ?? []).includes('virtue')) {
      if (!conflicts.some(c => c.round === choice.round)) {
        conflicts.push({
          round: choice.round,
          type: 'stance',
          stanceKey: 'truth_over_relationship',
          choiceFrameworks: choice.frameworks,
          message: "You said truth shouldn't override relationship — but this choice held personal integrity above the bond."
        })
      }
    }
  })
}

// D-04: punish_innocent='yes' → flags rights-dimension choices
// Rights conflict: player said yes to punishing innocent but must determine what "rights-aware" choice means
// Note: rights-aware choices are NOT currently tagged with a framework key — they are identified by
// rights_dimension on the scenario, not a framework tag. This stance check needs scenario context
// or a new 'rights' framework tag. See "Open Questions" section.
```

### Pattern 3: endSession() Extension (Host.jsx)

**What:** `endSession()` currently calls `computeProfile()` and `findConflicts()`/`findMoralConflicts()`, stores results to player row via Promise.all batch update.

**Current flow:**
```javascript
// Source: src/pages/Host.jsx lines 323-398
const history = historyByPlayer[p.id] ?? []
const { dominant, counts } = computeProfile(history)
const conflicts = findConflicts(history)
const moralConflicts = findMoralConflicts(history, p.moral_values, p.moral_stances)
// ... builds update object ...
```

**Extended flow for Phase 12:**
```javascript
// Derive moral_weight for each history entry using pack scenario lookup
const enrichedHistory = history.map(entry => ({
  ...entry,
  moral_weight: (() => {
    const scenario = getScenarioByRound(pack, entry.round)
    const weightMap = { low: 1, medium: 2, heavy: 3, reflective: 0 }
    return weightMap[scenario?.weight] ?? 1
  })()
}))

const { dominant, counts, leastUsed, trajectory, consistency_score, virtue_streak, virtue_heavy_count }
  = computeProfile(enrichedHistory)
const conflicts = findConflicts(enrichedHistory)
const moralConflicts = findMoralConflicts(enrichedHistory, p.moral_values, p.moral_stances)
```

**Player row update object additions:**
```javascript
{
  // existing fields unchanged
  dominant_framework: dominant,
  conflicts: conflicts,
  framework_counts: counts,
  choice_history: enrichedHistory,   // now includes moral_weight per entry
  debrief_context: debriefContext,
  // NEW fields
  trajectory: trajectory,            // { early, late, shifted }
  consistency_score: consistency_score,
  virtue_streak: virtue_streak,
  virtue_heavy_count: virtue_heavy_count
}
```

These new fields go into existing JSONB columns without a schema migration — the `players` table uses JSONB for all profile data.

### Pattern 4: FrameworkProfile.jsx Section Addition

**What:** Add 5 new conditional sections between existing sections. Each section uses the existing stagger pattern.

**Existing stagger pattern (reuse exactly):**
```javascript
// Source: src/components/FrameworkProfile.jsx
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.25 } }
}
const sectionVariants = {
  hidden:  { opacity: 0, y: 12 },
  show:    { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
}

// Each section:
{condition && (
  <motion.div className={styles.conflictSection} variants={sectionV}>
    <p className={styles.eyebrow}>SECTION LABEL</p>
    ...
  </motion.div>
)}
```

**CSS classes to reuse (no new classes needed per UI-SPEC):**
- Glass card with amber border: `.conflictSection` — used for "Your Moral Arc" and "Character"
- Border-top divider style: `.leastUsedSection` — used for "Moral Friction", "Rights Awareness", "Cultural Context footer"

**New fields needed on `player` prop:**
```javascript
const {
  dominant_framework: dominant,
  conflicts = [],
  framework_counts: frameworkCounts = {},
  choice_history: choiceHistory = [],
  moral_conflicts: moralConflicts = [],   // already stored by endSession()
  trajectory = null,                       // NEW
  consistency_score = null,                // NEW
  virtue_streak = 0,                       // NEW
  virtue_heavy_count = 0                   // NEW
} = player
```

**FrameworkProfile also needs pack context** for Cultural Context footer (pack ethicalLens) and Rights Awareness (which scenarios have `rights_dimension: true` and which were played). Options:
1. Pass `pack` as prop to `FrameworkProfile` — simplest
2. Look up pack from `choice_history[0].scenarioId` prefix or from `session.pack_id` stored in player data

Currently `FrameworkProfile.jsx` imports `getDefaultPack()` at module level — this is incorrect for multi-pack support and will break Rights Awareness and Cultural Context. The pack prop approach is the correct fix.

**Rights Awareness calculation in FrameworkProfile:**
```javascript
// Needs pack to identify which played scenarios had rights_dimension: true
// and which of those the player chose a rights-protective option
// PROBLEM: "chose to protect individual rights" means knowing which choiceIndex
// was the rights-protective choice per scenario.
// See "Open Questions" — rights_dimension on the scenario is not enough;
// need to know which choices within a rights scenario are rights-protective.
```

### Pattern 5: ConsequenceReveal Amber Border (CONSCIENCE-01)

**What:** New `.cardConflict` class applied to `.card` div when `hasMoralConflict` prop is true.

**Current component signature:**
```javascript
export default function ConsequenceReveal({ consequence, framework, worldState, moralValues, moralStances })
```

**Extended signature:**
```javascript
export default function ConsequenceReveal({ consequence, framework, worldState, moralValues, moralStances, hasMoralConflict })
```

The `hasMoralConflict` boolean is computed in `Play.jsx` at the round_complete render — the same `moralConflict` variable that already exists in `ConsequenceReveal.jsx` can be elevated to a prop from the call site.

**Current call site in Play.jsx:**
```javascript
<ConsequenceReveal
  consequence={chosenOption.consequence}
  framework={frameworkKey}
  worldState={session.world_state ?? { trust: 50, ... }}
  moralValues={player?.moral_values ?? null}
  moralStances={player?.moral_stances ?? null}
/>
```

**Updated call site adds:** `hasMoralConflict={hasMoralConflictForThisRound}` where the boolean is pre-computed at Play.jsx level using `findMoralConflicts` with a single-round history (same approach as already inside ConsequenceReveal).

### Pattern 6: Awareness Prompt Banner (DEONTO-01, DEONTO-02)

**What:** Inline JSX inserted above `<ScenarioCard>` in the active round view in `Play.jsx`.

**Trigger check (at render time per D-15):**
```javascript
const topValue = player?.moral_values?.[0]
const lieToProtect = player?.moral_stances?.lie_to_protect
const scenarioHasCareChoice = currentScenario?.choices?.some(c =>
  (c.frameworks ?? []).includes('care')
)
const showAwarenessPrompt = topValue === 'honesty'
  && lieToProtect === 'no'
  && scenarioHasCareChoice
  && !promptDismissed  // local state
```

**Dismissal logging (D-18):** The current `handleChoice()` in `Play.jsx` inserts to the `choices` table. To log `awareness_prompt_shown` and `awareness_prompt_dismissed`, one approach is to add these flags to the `choices` insert. However, the `choices` table schema does not have these columns. Options:
1. Add a JSONB `metadata` column to `choices` table (schema migration required)
2. Store the flags on the `players` row's `choice_history` JSONB during `endSession()` — Pass flags through Supabase broadcast or local state, then write during endSession
3. Store them directly on the player row as `awareness_log: [{ round, shown, dismissed }]` — a separate JSONB column or merged into `debrief_context`

**Recommended approach:** Local state in `Play.jsx` tracks `promptShownRounds: Set` and `promptDismissedRounds: Set`. These are passed as part of the choices insert as metadata or assembled into the player's `choice_history` when `endSession()` runs. The simplest approach with no schema migration: include `awareness_prompt_shown` and `awareness_prompt_dismissed` as fields in the `choices` insert if the `choices` table has a flexible enough schema, OR note them in a `player.moral_stances`-style JSONB field.

**Simplest no-migration path:** Store the flags in the `choices` table insert as additional fields within an optional JSONB metadata column. If that's not possible, they can be stored in `players.debrief_context` during `endSession()`.

### Pattern 7: Baseline.jsx STANCE_QUESTIONS Extension

**What:** Add 3 entries to the `STANCE_QUESTIONS` array and update the `canSubmit` guard from `Object.keys(stances).length < 2` to `< 5`.

**Current guard:**
```javascript
const allStancesAnswered = Object.keys(stances).length === 2
const canSubmit = allRanked && allStancesAnswered && !submitting
```

**Updated:**
```javascript
const allStancesAnswered = Object.keys(stances).length === 5
```

**New STANCE_QUESTIONS entries:**
```javascript
{
  key: 'break_promise',
  text: 'Is it right to break a promise to prevent harm?',
  options: [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
    { label: 'It depends', value: 'it_depends' }
  ]
},
{
  key: 'truth_over_relationship',
  text: 'Should a person always tell the truth even if it destroys a relationship?',
  options: [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
    { label: 'It depends', value: 'it_depends' }
  ]
},
{
  key: 'punish_innocent',
  text: 'Is it okay to punish the innocent if it protects the group?',
  options: [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
    { label: 'It depends', value: 'it_depends' }
  ]
}
```

**Note on gating:** Currently Q2 is gated until Q1 has an answer (per Phase 07 decision). The context decision D-01 says "all 5 shown at once" — this means the existing Q2 gating should be removed as well. All 5 questions appear as soon as value ranking is complete. The `isQ2Disabled` logic that gates on `stances[STANCE_QUESTIONS[0].key]` should be removed.

**Note on localStorage restore:** `baseline_stances` is saved to localStorage. This still works correctly with 5 questions — `Object.keys(stances).length === 5` guard will simply be unsatisfied until all 5 are answered. No localStorage key change needed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Staggered end screen animations | Custom CSS timing delays | Framer Motion stagger (already installed) | Already in use — `containerVariants`/`sectionVariants` in FrameworkProfile.jsx |
| Framework name lookup | String mapping | `FRAMEWORKS[key].name` from frameworks.js | Already imported everywhere that needs it |
| Weight-to-number mapping | Inline ternary chain | `const WEIGHT_MAP = { low: 1, medium: 2, heavy: 3, reflective: 0 }` | Simple object lookup, declare once at top of detection.js or inline in function |
| Rights-protective choice detection | Per-scenario hardcoded lookup | `rights_protective: true` field on individual choices | Extend the choice schema instead of building lookup tables |

---

## Common Pitfalls

### Pitfall 1: FrameworkProfile Uses getDefaultPack() at Module Level

**What goes wrong:** `FrameworkProfile.jsx` line 5 does `const pack = getDefaultPack()` at module level. When a player played Real-World or Futures pack, scenario titles in the Choice Log and Rights Awareness calculations will use Kingdom Arc data.

**Why it happens:** Multi-pack support was added in Phase 08 but `FrameworkProfile.jsx` was not fully updated.

**How to avoid:** Remove the module-level `pack` constant. Pass `pack` as a prop from `Play.jsx` (which already has `pack` in state). In `Play.jsx` the finished view renders `<FrameworkProfile player={player} />` — extend to `<FrameworkProfile player={player} pack={pack} />`.

**Warning signs:** Choice Log shows wrong scenario titles for non-Kingdom-Arc packs. Rights Awareness section always shows 0 of 0.

### Pitfall 2: moral_weight Not Present in choice_history at endSession() Time

**What goes wrong:** `endSession()` rebuilds `choice_history` from the `choices` table (`historyByPlayer`). Currently the `choices` table has no `moral_weight` column. If `computeProfile()` expects `moral_weight` on each entry and it's missing, trajectory defaults to unweighted, silently wrong.

**Why it happens:** `moral_weight` is a derived field — it can be computed from `scenario.weight` at any time given the round number and pack. It does NOT need to be stored in the DB.

**How to avoid:** In `endSession()`, after building `historyByPlayer`, map each entry to add `moral_weight`:
```javascript
const WEIGHT_MAP = { low: 1, medium: 2, heavy: 3, reflective: 0 }
history.map(entry => ({
  ...entry,
  moral_weight: WEIGHT_MAP[getScenarioByRound(pack, entry.round)?.weight] ?? 1
}))
```
This works because `pack` is already in scope in `Host.jsx`. No schema migration.

**Warning signs:** `trajectory` always shows `null` or `early === late` for all players.

### Pitfall 3: allStancesAnswered Guard Not Updated for 5 Questions

**What goes wrong:** If `allStancesAnswered = Object.keys(stances).length === 2` is not updated to `=== 5`, the "Enter the Council" button becomes enabled after only 2 stance answers, and the new questions are silently skipped.

**How to avoid:** Update guard AND verify that `handleSubmit` doesn't have a redundant check.

### Pitfall 4: Q2 Gate Logic Breaks With All-At-Once Display

**What goes wrong:** Current `Baseline.jsx` has `isQ2Disabled = !allRanked || (qIdx === 1 && !stances[STANCE_QUESTIONS[0].key])`. With 5 questions all shown at once (D-01), this gating logic applies to index 1 only — questions 3, 4, 5 have no gating. The gating for Q2 should also be removed since all questions are shown simultaneously per D-01.

**How to avoid:** Remove the per-question gating entirely. The only gate is `stanceDisabled` at the section level (all questions disabled until value ranking is complete).

### Pitfall 5: Rights Awareness Requires More Than rights_dimension Tag

**What goes wrong:** RIGHTS-02 says "you chose to protect individual rights over group benefit." To display this accurately, the system needs to know which `choiceIndex` in a rights-dimension scenario is the rights-protective choice. Simply tagging the scenario with `rights_dimension: true` tells you a scenario has a rights dimension — it does not tell you which choice was rights-protective.

**Why it happens:** Framework tags exist at the choice level, but rights awareness is a cross-cutting concern not captured by the four frameworks (care/deontology/virtue/consequentialism).

**How to avoid:** See Open Questions #1. Options: (a) add `rights_protective: true` to individual choice objects within rights-dimension scenarios, or (b) treat rights_dimension scenarios where the player chose deontology/virtue as "rights-protective" (since these frameworks most often protect individual rights), or (c) use a simplified count: "You engaged with X rights-critical scenarios" rather than which way the player chose.

**Warning signs:** Rights Awareness section either always shows full count or always shows 0.

### Pitfall 6: Awareness Prompt Dismissal Logging Without Schema Migration

**What goes wrong:** D-18 requires `awareness_prompt_shown` and `awareness_prompt_dismissed` to be logged in choice_history. The `choices` table currently does not have a metadata column. Attempting to insert these flags directly will fail silently or throw.

**How to avoid:** Decide on storage approach before implementing:
- Option A: Add a `metadata JSONB` column to the `choices` table (requires Supabase migration)
- Option B: Track in Play.jsx local state, assemble into `players.debrief_context` during endSession
- Option C: Store as fields in `players.choice_history` (enriched history) during endSession

Option C (enrich during endSession using local-state-derived data) is the no-migration path but requires passing awareness prompt flags from Play.jsx to the host via some signal. Since endSession runs in Host.jsx (not Play.jsx), the player-side prompt flags cannot be directly accessed. This is the most significant design gap.

**Recommended resolution:** Add `metadata JSONB DEFAULT '{}'` column to `choices` table. Small migration, clean separation of concerns.

### Pitfall 7: Arc Narrative Requires All Framework Shift Combinations

**What goes wrong:** There are 4×4 = 12 possible framework shift pairs (minus same-to-same). "Claude's Discretion" owns writing the arc narrative copy. If only a subset is written, players with uncommon shifts see incomplete text.

**How to avoid:** Write all possible arc narrative strings upfront. The pairs are:
- consequentialism → deontology
- consequentialism → care
- consequentialism → virtue
- deontology → consequentialism
- deontology → care
- deontology → virtue
- care → consequentialism
- care → deontology
- care → virtue
- virtue → consequentialism
- virtue → deontology
- virtue → care

12 narrative strings needed. Store as a lookup object in detection.js or FrameworkProfile.jsx.

---

## Architecture Patterns (Project Structure)

No new files needed. All changes are additive to existing files:

```
src/
├── lib/
│   ├── detection.js          -- extend computeProfile(), findMoralConflicts()
│   ├── scenarios.js          -- update @typedef ScenarioPack, @typedef PackScenario
│   └── scenarios/
│       └── packs/
│           ├── kingdom-arc.js         -- add rights_dimension to qualifying scenarios
│           ├── real-world-modern.js   -- add rights_dimension to qualifying scenarios
│           └── futures.js             -- add rights_dimension to qualifying scenarios
├── pages/
│   ├── Baseline.jsx          -- add 3 stance questions, remove Q2 gate
│   ├── Host.jsx              -- extend endSession() with new profile fields
│   └── HostSetup.jsx         -- render ethicalLens subtitle on pack cards
├── components/
│   ├── FrameworkProfile.jsx  -- add 5 new conditional sections
│   ├── FrameworkProfile.module.css -- no new classes needed per UI-SPEC
│   ├── ConsequenceReveal.jsx -- add hasMoralConflict prop + .cardConflict class
│   └── ConsequenceReveal.module.css -- add .cardConflict CSS rule
```

For `HostSetup.module.css` — add `.packLens` class (one rule) or use inline style per UI-SPEC.

---

## Scenario Tagging: rights_dimension

### Kingdom Arc Pack — Qualifying Scenarios

Based on direct inspection of `kingdom-arc.js`:

| Round | Title | Qualifying? | Reasoning |
|-------|-------|-------------|-----------|
| 3 | The Hollow Folk | YES | Hollow Folk as minority seeking personhood recognition — individual/minority rights vs. group economic benefit — canonical rights scenario |
| 5 | The Last Wellspring | YES | Future generations (individuals) vs. present group benefit — intergenerational rights dimension |
| 4 | The Sealed Archive | Borderline | Epistemic rights vs. group stability — could qualify; people's right to know vs. rulers deciding for the group |
| 1 | The Divided Harvest | No | Resource distribution — utilitarian, not individual rights at stake |
| 2 | The Ember Watch | No | Security vs. freedom — civil liberties adjacent but not individual/minority vs. group |
| 6+ | Other rounds | Requires reading remaining rounds |

**Confirmed tags (HIGH confidence):** Round 3 (Hollow Folk) and Round 5 (Last Wellspring). Round 4 is Claude's Discretion.

### Real-World Modern Pack and Futures Pack

Not inspected in detail — Claude's Discretion owns which scenarios qualify. The rule from D-22: "Any scenario where an individual/minority is at risk from group benefit qualifies."

---

## Integration Map: What Calls What

```
TRAJECTORY-01: Play.jsx handleChoice() → choices table insert
               BUT moral_weight not stored in DB — derived in endSession()

TRAJECTORY-02/04: endSession() (Host.jsx)
  → calls enrichedHistory = history.map(add moral_weight)
  → calls computeProfile(enrichedHistory) → returns trajectory, consistency_score
  → calls computeVirtueStreak(enrichedHistory) → returns virtue_streak
  → computes virtue_heavy_count inline
  → stores to player row (trajectory, consistency_score, virtue_streak, virtue_heavy_count)

TRAJECTORY-03: FrameworkProfile.jsx
  → reads player.trajectory, player.consistency_score
  → renders "Your Moral Arc" section conditionally

CONSCIENCE-01: Play.jsx (round_complete view)
  → pre-computes hasMoralConflict using findMoralConflicts([{round, frameworks}], ...)
  → passes hasMoralConflict to <ConsequenceReveal hasMoralConflict={...} />
  ConsequenceReveal.jsx
  → applies .cardConflict class to .card when hasMoralConflict

CONSCIENCE-02: FrameworkProfile.jsx
  → reads player.moral_conflicts (already stored by endSession())
  → shows count section when length >= 1

DEONTO-01/02: Play.jsx (active round view)
  → checks topValue === 'honesty' && stances.lie_to_protect === 'no' && scenarioHasCareChoice
  → renders awareness banner above <ScenarioCard>
  → tracks dismissed state locally
  → logs to choice (see Pitfall 6 — storage mechanism TBD)

VIRTUE-01/02: endSession() computes virtue_streak, virtue_heavy_count
  FrameworkProfile.jsx reads and renders

RIGHTS-01: Pack files (3 files) — add rights_dimension: true to qualifying scenarios
           scenarios.js @typedef update

RIGHTS-02: FrameworkProfile.jsx
  → needs pack to identify rights_dimension scenarios
  → needs to know which choices were "rights-protective" (see Pitfall 5)
  → shows Rights Awareness section when ≥2 rights scenarios played

CULTURE-01: All 3 pack files — add ethicalLens string
            scenarios.js @typedef ScenarioPack update
            HostSetup.jsx — render subtitle

CULTURE-02: FrameworkProfile.jsx
  → needs pack as prop (not getDefaultPack())
  → always renders cultural context footer
```

---

## State of the Art

| Old Pattern | Current Pattern | Implication for Phase 12 |
|-------------|-----------------|--------------------------|
| `getDefaultPack()` at module level in FrameworkProfile | Should be `pack` prop from Play.jsx | Must fix to support multi-pack (already broken for non-Kingdom packs) |
| 2 stance questions with Q2 gating | 5 stance questions, all visible once values ranked | Remove Q2 gate, update allStancesAnswered guard |
| computeProfile returns {dominant, counts, leastUsed} | Will return 4 additional fields | Pure function extension — no side effects |
| endSession builds history from choices table | Will enrich history with moral_weight before computing | Derive from pack scenario lookup, no DB migration |

---

## Open Questions

1. **Rights-protective choice identification for RIGHTS-02**
   - What we know: RIGHTS-02 requires "In X of Y rights-critical scenarios, you chose to protect individual rights over group benefit"
   - What's unclear: How to determine if a player's choice within a rights-dimension scenario was "rights-protective" — the four framework tags (care/deontology/virtue/consequentialism) don't map cleanly to "rights-protective"
   - Recommendation (Claude's Discretion): Add `rights_protective: true` to individual `PackChoice` objects within rights-dimension scenarios. This is the cleanest schema extension. Alternatively, treat deontology/virtue choices in rights-dimension scenarios as rights-protective (since these frameworks most often protect individual rights against utilitarian calculus). The choice schema extension is preferred.

2. **Awareness prompt dismissal storage (DEONTO-02)**
   - What we know: Flags must be logged in choice_history for end-screen analysis. Play.jsx submits choices; endSession() runs in Host.jsx.
   - What's unclear: No current mechanism to pass Play.jsx local state (prompt shown/dismissed flags) to endSession() which runs independently in Host.jsx
   - Recommendation: Either (a) add `metadata JSONB DEFAULT '{}'` column to choices table and include flags in the choices insert — cleanest, requires one migration line, or (b) store flags in a `player.awareness_log` JSONB column updated via Supabase from Play.jsx when prompt is shown/dismissed — two Supabase writes but no table migration. Option (a) is cleaner.

3. **Arc narrative copy — 12 possible framework transitions**
   - What we know: D-11 provides one example ("care → deontology — from relational to principled reasoning")
   - What's unclear: Copy for all 12 transition pairs
   - Recommendation (Claude's Discretion): Write all 12 during implementation. Store as a lookup object keyed by `${early}_${late}`. The philosophical framing should follow D-11's model — name the frameworks, name the philosophical concept (e.g., "moral particularism", "rule-based thinking", "character ethics"), describe what the shift means.

4. **FrameworkProfile pack prop — backward compatibility**
   - What we know: FrameworkProfile currently uses `getDefaultPack()` module-level constant
   - What's unclear: Whether any caller passes a pack prop or relies on the module-level default
   - Recommendation: Add `pack` as a prop with `getDefaultPack()` as the default fallback. Non-breaking change. Update Play.jsx to pass the actual pack.

---

## Environment Availability

Step 2.6: SKIPPED — this phase is purely code/config changes with no external dependencies beyond the existing Supabase project and npm packages already installed.

---

## Code Examples

### Arc Narrative Lookup Object (Claude's Discretion)

```javascript
// In detection.js or FrameworkProfile.jsx
const ARC_NARRATIVES = {
  'care_deontology': {
    heading: 'In the early rounds you reasoned from Care Ethics. By the final rounds, you shifted to Deontology.',
    explanation: 'You moved from protecting the people directly in front of you to holding rules regardless of cost. Philosophers call this moving from relational to principled reasoning — from asking "what does this person need?" to asking "what does my duty require?"'
  },
  'deontology_care': {
    heading: 'In the early rounds you held the rule. By the final rounds, you protected the relationship.',
    explanation: 'As stakes escalated, proximity replaced principle. Philosophers call this moral particularism — the idea that context and relationship can override abstract duty when the stakes are personal enough.'
  },
  // ... 10 more entries
}
```

### Virtue Streak and Heavy Count (in computeProfile or endSession)

```javascript
function computeVirtueStats(choiceHistory) {
  const sorted = [...choiceHistory].sort((a, b) => a.round - b.round)
  let longestStreak = 0
  let currentStreak = 0
  let virtueHeavyCount = 0
  let heavyRoundCount = 0

  sorted.forEach(c => {
    const isVirtue = (c.frameworks ?? []).includes('virtue')
    const isHeavy = c.moral_weight >= 3  // heavy = 3

    if (isHeavy) heavyRoundCount++
    if (isVirtue && isHeavy) virtueHeavyCount++

    if (isVirtue) {
      currentStreak++
      if (currentStreak > longestStreak) longestStreak = currentStreak
    } else {
      currentStreak = 0
    }
  })

  return { virtue_streak: longestStreak, virtue_heavy_count: virtueHeavyCount, heavy_round_count: heavyRoundCount }
}
```

### ConsequenceReveal hasMoralConflict computation in Play.jsx

```javascript
// In Play.jsx round_complete render block
// (where lockedChoiceIndex !== null)
const chosenOption = currentScenario.choices[lockedChoiceIndex]
const frameworkKey = chosenOption.frameworks[0]

// Pre-compute moral conflict for this round's choice
const singleRoundCheck = [{ round: session.current_round, frameworks: chosenOption.frameworks }]
const roundConflicts = findMoralConflicts(singleRoundCheck, player?.moral_values ?? null, player?.moral_stances ?? null)
const hasMoralConflict = roundConflicts.length > 0
```

---

## Sources

### Primary (HIGH confidence)
- Direct inspection of `src/lib/detection.js` — current function signatures, return types, stance check pattern
- Direct inspection of `src/pages/Baseline.jsx` — STANCE_QUESTIONS array, submit guard, gating logic
- Direct inspection of `src/components/FrameworkProfile.jsx` — section structure, stagger pattern, module-level pack import issue
- Direct inspection of `src/components/ConsequenceReveal.jsx` and `.module.css` — existing card styles, animation delays
- Direct inspection of `src/pages/Play.jsx` — handleChoice(), round_complete render, ConsequenceReveal call site
- Direct inspection of `src/pages/Host.jsx` endSession() — choice table query, history rebuild, profile computation, batch update pattern
- Direct inspection of `src/pages/HostSetup.jsx` — pack card render, pack selection flow
- Direct inspection of `src/lib/scenarios.js` — @typedef, pack registry, helper exports
- Direct inspection of `src/lib/scenarios/packs/kingdom-arc.js` — scenario schema, rights dimension candidates
- Direct inspection of `.planning/phases/12-ethical-framework-depth/12-CONTEXT.md` — all locked decisions
- Direct inspection of `.planning/phases/12-ethical-framework-depth/12-UI-SPEC.md` — CSS contracts, component inventory
- Direct inspection of `.planning/REQUIREMENTS.md` — all 17 requirements with exact wording
- Direct inspection of `src/lib/__tests__/detection.test.js` — custom test runner pattern (not Jest)

### Secondary (MEDIUM confidence)
- `nyquist_validation: false` in `.planning/config.json` — validation architecture section omitted per instructions

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies required; verified from package.json and existing imports
- Architecture: HIGH — all patterns derived from direct codebase inspection; no guesswork
- Pitfalls: HIGH — derived from concrete gaps found during code inspection (module-level pack, Q2 gate, storage problem)
- Open questions: MEDIUM — represent genuine design decisions not yet resolved, not knowledge gaps

**Research date:** 2026-03-30
**Valid until:** 2026-04-30 (stable codebase; invalidated by any schema migration or major refactor)
