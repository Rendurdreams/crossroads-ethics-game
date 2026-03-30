# Phase 11: Moral Conflict Detection + End Screen + AI Hooks - Research

**Researched:** 2026-03-29
**Domain:** JavaScript detection logic, React component composition, Supabase schema migration, AI data shaping
**Confidence:** HIGH — all findings drawn from reading the live codebase directly

## Summary

Phase 11 is almost entirely an internal logic and UI composition phase. There are no new libraries to install and no external services to configure. Every decision is well-defined in CONTEXT.md, and the existing codebase provides clear patterns to follow for all four areas of work: detection logic extension, in-round UI, end screen section, and AI data shaping.

The main technical surface is threefold. First, a new pure function `findMoralConflicts(choiceHistory, moralValues, moralStances)` must be written in `detection.js` following the same stateless pattern as `computeProfile()` and `findConflicts()`. Second, the conflict indicator must be threaded into `ConsequenceReveal.jsx` — which is where the framework label already lives — by passing the player's moral baseline down from Play.jsx. Third, `endSession()` in Host.jsx must be expanded to build `debrief_context` and `group_debrief_context` payloads, written to Supabase, which requires two new `jsonb` columns via a migration.

The value-to-framework mapping (D-01) and stance-based secondary detection (D-03) are the only genuinely novel logic areas. Everything else is wiring and composition using already-established patterns.

**Primary recommendation:** Implement in three sequential plans — (1) detection logic + test extension, (2) ConsequenceReveal conflict indicator + FrameworkProfile new section, (3) AI data shaping + migration.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Value-to-framework mapping: honesty → deontology/virtue, loyalty → care, fairness → consequentialism/deontology, courage → virtue, compassion → care. A conflict fires when the choice's framework tags don't align with the player's #1 ranked value's mapped frameworks.
- **D-02:** Detection threshold is top 1 value only — only the player's #1 ranked value triggers conflict indicators. Fewer, more meaningful hits.
- **D-03:** Stance answers (lie_to_protect, ends_justify) feed into detection as a secondary signal. E.g., player said "No" to "ends justify means" but picks a consequentialist choice → flagged as additional moral conflict.
- **D-04:** This is a NEW detection layer — separate from the existing `findConflicts()`. New detection is moral-vs-ethical: personal values vs. framework choice.
- **D-05:** Tone is neutral observation: "This conflicts with your value of honesty." Factual, no judgment.
- **D-06:** Placement: below the existing framework label, fading in ~0.5s after the framework label appears. Two distinct lines, stacked.
- **D-07:** Only shown after choice is locked — never before. Matches existing framework label reveal timing.
- **D-08:** New end screen section order: (1) Your Framework, (2) Your Morals vs Your Ethics (NEW), (3) Where the Conflict Lived, (4) Least Used, (5) Choice Log.
- **D-09:** Copy explicitly names morals vs ethics distinction in the section intro.
- **D-10:** MORAL-06 — section title/framing must distinguish moral profile (personal, stated) from ethical framework (reasoned system). Lesson is explicit in the copy.
- **D-11:** `debrief_context` is a full narrative-ready JSON payload on the player row: choice history with scenario titles, framework tags per choice, moral baseline, detected moral conflicts with round context, dominant framework, framework conflict pairs.
- **D-12:** `group_debrief_context` on session row: aggregate framework breakdown, world state final values, notable moral conflicts across the group, pack info.
- **D-13:** `src/lib/ai.js` stub with `generateDebrief(playerContext)`, `generateDiscussionPrompts(sessionContext)`, `generatePack(prompt)` — all return null. Shapes documented with JSDoc.

### Claude's Discretion

- Exact CSS animation timing for the conflict indicator fade-in
- Internal structure of the value-to-framework mapping (object vs function)
- Whether moral conflicts are computed client-side or stored in Supabase (likely client-side like existing computeProfile)
- Exact copy wording for the end screen moral vs ethics intro paragraph

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MORAL-03 | After choice is locked, subtle inline indicator appears when choice conflicts with stated top values — shown below framework label, never before locked | ConsequenceReveal.jsx is the location; player moral_values must be passed from Play.jsx; CSS fade-in pattern matches existing keyframe animations |
| MORAL-04 | Detection logic compares choice framework tags against player's value priorities | New `findMoralConflicts()` pure function in detection.js; value-to-framework map drives comparison; D-01 mapping is fully specified |
| MORAL-05 | End screen shows Moral vs Ethics conflict map — lists rounds where choice diverged from stated values, names philosophical tension | New section in FrameworkProfile.jsx between dominant framework section and existing conflict map; stagger animation via existing sectionVariants |
| MORAL-06 | End screen section explicitly distinguishes moral profile from ethical framework in copy | D-09/D-10 specify the text pattern; lesson must be in the JSX copy, not left implicit |
| AI-01 | Player end-screen data shape includes `debrief_context` field | New `jsonb` column on players table; populated in endSession() in Host.jsx; shape documented in D-11 |
| AI-02 | Session end data includes `group_debrief_context` field | New `jsonb` column on sessions table; populated in endSession() in Host.jsx; shape documented in D-12 |
| AI-03 | Pack schema includes `ai_generated` and `generator_prompt` fields | Already implemented in Phase 8 — `ai_generated` and `generator_prompt` are in the @typedef in scenarios.js and in all three pack objects. Confirmed complete. |
| AI-04 | `src/lib/ai.js` stub exists with three placeholder functions returning null | New file; JSDoc shapes from D-11/D-12/D-13; no library needed |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^19.2.4 (installed) | Component state, props threading | Decided; already in use |
| framer-motion | ^11.18.2 (installed) | Section entrance animation for new end screen section | Already used in FrameworkProfile.jsx; sectionVariants pattern directly reusable |
| @supabase/supabase-js | ^2.100.0 (installed) | DB writes for new columns | Already in use; standard update pattern |

### Supporting
None needed beyond what is already installed.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Client-side moral conflict computation | Compute in DB trigger | DB-side logic is harder to test and harder to evolve; existing detection.js is client-side pure functions — keep consistent |
| CSS keyframe fade for conflict indicator | framer-motion animate | framer-motion is already imported in Play.jsx; but a CSS keyframe (matching the existing `fadeUp` in FrameworkProfile.module.css) is simpler and keeps the indicator lightweight |

**Installation:** No new packages needed. All dependencies are already installed.

---

## Architecture Patterns

### Where the Conflict Indicator Lives

The framework label is revealed inside `ConsequenceReveal.jsx` — not in the active round waiting state. The round_complete view in Play.jsx at line 459 passes the chosen option's framework to `ConsequenceReveal`. The moral conflict indicator (D-06) must be added to `ConsequenceReveal.jsx`, below the framework section.

To detect the conflict, `ConsequenceReveal` needs the player's `moral_values` (and `moral_stances` for secondary detection). These are on the player row already available in Play.jsx state. They must be passed as props: `ConsequenceReveal` receives `moralValues` and `moralStances` as new optional props.

```javascript
// In Play.jsx — round_complete branch (line 481)
<ConsequenceReveal
  consequence={chosenOption.consequence}
  framework={frameworkKey}
  worldState={session.world_state ?? { trust: 50, courage: 50, solidarity: 50, awareness: 50 }}
  moralValues={player?.moral_values ?? null}   // ADD
  moralStances={player?.moral_stances ?? null}  // ADD
/>
```

### Value-to-Framework Mapping

Decision D-01 specifies the complete mapping. Implement as a plain object constant — no function wrapper needed:

```javascript
// src/lib/detection.js — add near top
export const VALUE_FRAMEWORK_MAP = {
  honesty:    ['deontology', 'virtue'],
  loyalty:    ['care'],
  fairness:   ['consequentialism', 'deontology'],
  courage:    ['virtue'],
  compassion: ['care']
}
```

### Moral Conflict Detection Function

New function in `detection.js`. Pure, no side effects. Same signature style as `computeProfile` and `findConflicts`.

```javascript
/**
 * Detect rounds where the player's choice conflicted with their stated moral baseline.
 * Checks top-1 value (primary) and stance answers (secondary).
 *
 * @param {Array<{round: number, scenarioId: string, frameworks: string[], choiceIndex: number}>} choiceHistory
 * @param {string[]|null} moralValues - Ordered array, index 0 is top-ranked value
 * @param {object|null} moralStances - { lie_to_protect: 'yes'|'no'|'it_depends', ends_justify: 'yes'|'no'|'it_depends' }
 * @returns {Array<{round: number, type: 'value'|'stance', valueName?: string, stanceKey?: string, choiceFrameworks: string[], message: string}>}
 */
export function findMoralConflicts(choiceHistory, moralValues, moralStances) {
  if (!moralValues || moralValues.length === 0) return []

  const topValue = moralValues[0]
  const alignedFrameworks = VALUE_FRAMEWORK_MAP[topValue] ?? []
  const conflicts = []

  choiceHistory.forEach(choice => {
    const choiceFrameworks = choice.frameworks ?? []
    const isAligned = choiceFrameworks.some(f => alignedFrameworks.includes(f))

    if (!isAligned && choiceFrameworks.length > 0) {
      conflicts.push({
        round: choice.round,
        type: 'value',
        valueName: topValue,
        choiceFrameworks,
        message: `This conflicts with your value of ${topValue}.`
      })
    }
  })

  // Secondary: stance-based detection
  if (moralStances) {
    // "No" to ends_justify but consequentialist choice
    if (moralStances.ends_justify === 'no') {
      choiceHistory.forEach(choice => {
        if ((choice.frameworks ?? []).includes('consequentialism')) {
          // Only add if not already flagged for value conflict this round
          const alreadyFlagged = conflicts.some(c => c.round === choice.round)
          if (!alreadyFlagged) {
            conflicts.push({
              round: choice.round,
              type: 'stance',
              stanceKey: 'ends_justify',
              choiceFrameworks: choice.frameworks,
              message: 'You said the ends don\'t justify the means — but this choice optimized for outcome.'
            })
          }
        }
      })
    }
    // "No" to lie_to_protect but care ethics choice (loyalty-as-protection)
    if (moralStances.lie_to_protect === 'no') {
      choiceHistory.forEach(choice => {
        if ((choice.frameworks ?? []).includes('care')) {
          const alreadyFlagged = conflicts.some(c => c.round === choice.round)
          if (!alreadyFlagged) {
            conflicts.push({
              round: choice.round,
              type: 'stance',
              stanceKey: 'lie_to_protect',
              choiceFrameworks: choice.frameworks,
              message: 'You said loyalty shouldn\'t override truth — but this choice prioritized the relationship.'
            })
          }
        }
      })
    }
  }

  return conflicts
}
```

**Note on design discretion:** The stance secondary signal should NOT stack on top of a value conflict for the same round — that would feel noisy. The `alreadyFlagged` guard implements this. This is a Claude's Discretion call per CONTEXT.md.

### End Screen Section Ordering

Current FrameworkProfile.jsx sections:
1. Dominant Framework Card (`.sectionCard`)
2. Conflict Map — `conflicts.length > 0` (`.conflictSection`)
3. Least Used Framework (`.leastUsedSection`)
4. Choice Log (`.choiceLog`)

New section 2 (inserted between Dominant Framework and the existing Conflict Map):
- Title: "Your Morals vs Your Ethics" (eyebrow label)
- Intro paragraph: distinguishes moral profile from ethical framework
- Per-round conflict entries: round name, choice frameworks, value that was in tension
- If no moral conflicts detected, the section is hidden (same conditional pattern as conflict map)

The section renders using the same `sectionVariants` framer-motion stagger already in the file.

```javascript
// FrameworkProfile.jsx — new section after dominant framework card
{dominant !== null && moralConflicts.length > 0 && (
  <motion.div className={styles.moralsSection} variants={sectionV}>
    <p className={styles.eyebrow}>Your Morals vs Your Ethics</p>
    <p className={styles.moralsIntro}>
      Your <strong>morals</strong> are personal — shaped by your upbringing, relationships,
      and what you hold sacred. <strong>Ethical frameworks</strong> are reasoned systems
      societies use to evaluate behavior. Here is where they diverged:
    </p>
    {moralConflicts.map((conflict, idx) => (
      <div key={idx} className={styles.moralConflictRow}>
        <p className={styles.conflictRounds}>Dilemma {conflict.round}</p>
        <p className={styles.moralConflictMessage}>{conflict.message}</p>
      </div>
    ))}
    <p className={styles.moralsFooter}>
      That tension is not a flaw. It is where real thinking begins.
    </p>
  </motion.div>
)}
```

`moralConflicts` is computed inside FrameworkProfile from `player.moral_values`, `player.moral_stances`, and `player.choice_history` by calling `findMoralConflicts` — the same client-side pure function used in ConsequenceReveal. FrameworkProfile already imports from `../lib/frameworks.js` and `../lib/scenarios.js`; it will need to import `findMoralConflicts` and `VALUE_FRAMEWORK_MAP` from `../lib/detection.js`.

### AI Data Shaping in endSession()

Current `endSession()` in Host.jsx fetches all players and choices, then writes `dominant_framework`, `conflicts`, `framework_counts`, `choice_history` per player. The expansion adds:

1. Fetch additional data needed for debrief_context — need `choice_index` and `scenario_id` from choices table (currently only `player_id, round_number, frameworks` are selected). Update the choices fetch to include `choice_index, scenario_id`.

2. Fetch player rows with `moral_values`, `moral_stances` (currently only `id` is fetched from players). Update the players fetch to `select('id, moral_values, moral_stances')`.

3. Compute `findMoralConflicts(history, player.moral_values, player.moral_stances)` per player.

4. Build `debrief_context` per player (D-11 shape):
```javascript
const debriefContext = {
  playerId: p.id,
  dominantFramework: dominant,
  frameworkCounts: counts,
  frameworkConflicts: conflicts,        // from findConflicts()
  moralConflicts: moralConflicts,       // from findMoralConflicts()
  moralBaseline: {
    topValue: p.moral_values?.[0] ?? null,
    allValues: p.moral_values ?? [],
    stances: p.moral_stances ?? {}
  },
  choiceHistory: history.map(c => ({
    round: c.round,
    scenarioId: c.scenarioId,
    scenarioTitle: getScenarioByRound(pack, c.round)?.title ?? `Round ${c.round}`,
    choiceIndex: c.choiceIndex,
    frameworks: c.frameworks
  }))
}
```

5. Build `group_debrief_context` once after all player updates (D-12 shape):
```javascript
const groupDebriefContext = {
  packId: pack.id,
  packName: pack.name,
  totalPlayers: allPlayers.length,
  frameworkBreakdown: groupFrameworkCounts,
  finalWorldState: session.world_state,
  notableMoralConflicts: buildNotableMoralConflicts(updates)
  // e.g. "60% of players who ranked honesty #1 still chose care ethics in Round 2"
}
```

6. Two new Supabase migrations needed:
```sql
-- players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS debrief_context jsonb DEFAULT NULL;

-- sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS group_debrief_context jsonb DEFAULT NULL;
```

### AI Stub File

New file `src/lib/ai.js`. Zero dependencies. Three stubs.

```javascript
// src/lib/ai.js

/**
 * Generate a personalized debrief paragraph for a player.
 * @param {{ dominantFramework: string, moralConflicts: Array, frameworkConflicts: Array,
 *           moralBaseline: object, choiceHistory: Array }} playerContext
 * @returns {Promise<string|null>}
 */
export async function generateDebrief(playerContext) {
  return null
}

/**
 * Generate discussion prompt suggestions for the host to use post-game.
 * @param {{ frameworkBreakdown: object, finalWorldState: object,
 *           notableMoralConflicts: Array, packId: string }} sessionContext
 * @returns {Promise<string[]|null>}
 */
export async function generateDiscussionPrompts(sessionContext) {
  return null
}

/**
 * Generate a new scenario pack from a theme prompt.
 * @param {string} prompt - Description of the pack theme and tone
 * @returns {Promise<import('./scenarios.js').ScenarioPack|null>}
 */
export async function generatePack(prompt) {
  return null
}
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Value-to-framework conflict logic | Custom NLP or ML | Plain `VALUE_FRAMEWORK_MAP` object lookup | The mapping is fully specified in D-01; static lookup is correct, fast, and testable |
| Animation for conflict indicator | Custom JS animation | CSS `@keyframes fadeUp` (already in FrameworkProfile.module.css) | Matches existing animation; no additional dependency |
| AI stub type documentation | Runtime schema validation | JSDoc `@param` and `@typedef` references | This is architecture-only; types exist only for documentation at this milestone |

---

## Common Pitfalls

### Pitfall 1: Passing moral_values to ConsequenceReveal without null-guarding

**What goes wrong:** Player joined before Phase 7 was deployed, or skipped the baseline (bug). `player.moral_values` is `null`. Calling `findMoralConflicts(history, null, null)` works because the function returns `[]` on null input — but passing null props without null-guarding in the JSX causes runtime errors if the component tries to call `.length` on null.

**How to avoid:** Always guard: `moralValues={player?.moral_values ?? null}`. The detection function handles null gracefully; the component just needs to receive it cleanly.

### Pitfall 2: endSession() already selects only `id` from players

**What goes wrong:** The current `endSession()` call is `supabase.from('players').select('id').eq('session_id', sessionId)`. If you compute `findMoralConflicts` inside endSession, you need `moral_values` and `moral_stances` on each player object — but the existing select only fetches `id`. Silently returns `undefined` for both fields, producing empty moral conflict arrays.

**How to avoid:** Change the fetch to `select('id, moral_values, moral_stances')`.

### Pitfall 3: endSession() already selects only `player_id, round_number, frameworks` from choices

**What goes wrong:** `debrief_context` requires `scenario_id` and `choice_index` per choice for the choice history narrative. Current select omits both. They exist on the choices table.

**How to avoid:** Change the choices fetch to `select('player_id, round_number, choice_index, scenario_id, frameworks')`.

### Pitfall 4: FrameworkProfile currently imports pack via getDefaultPack() at module level

**What goes wrong:** Line 4 of FrameworkProfile.jsx is `const pack = getDefaultPack()` at module level (outside the component). If the player played with a non-default pack, `getScenarioByRound(pack, entry.round)` in the choice log returns the wrong scenario title. This is an existing bug that Phase 11 should not worsen. The new moral conflicts section also maps round numbers to scenario titles — do not use the module-level `pack` constant; use `getPackById(player.session.pack_id)` or accept the pack as a prop.

**Warning signs:** Scenario titles in the choice log showing wrong titles for non-kingdom-arc packs.

**Mitigation for Phase 11:** Accept pack as a prop or keep the same (already-broken) approach for parity. Do not make the moral conflicts section more broken than the existing choice log. The safest approach: use the existing `pack` variable as-is for now, because the fix requires FrameworkProfile to receive pack as a prop from Play.jsx which already has access to the pack.

### Pitfall 5: Moral conflict indicator placement — ConsequenceReveal vs active round waiting state

**What goes wrong:** CONTEXT.md D-06 says "below the existing framework label" and D-07 says "after choice is locked." The framework label lives in `ConsequenceReveal.jsx` (the `round_complete` state), NOT in the active round waiting view. Adding the conflict indicator to the active round waiting state (after the ScenarioCard) would show it before the round closes — violating D-07.

**How to avoid:** Add the conflict indicator inside `ConsequenceReveal.jsx`, below the framework section. Pass `moralValues` and `moralStances` as props to ConsequenceReveal from the Play.jsx `round_complete` branch.

### Pitfall 6: New FrameworkProfile section accessing moral_values before Phase 7 ran

**What goes wrong:** Players who played a game before Phase 7 moral baseline was deployed have `null` for `moral_values` and `moral_stances`. `findMoralConflicts` handles null correctly (returns `[]`). The new section in FrameworkProfile conditionally renders only when `moralConflicts.length > 0`, so null baseline players see the section hidden cleanly.

**How to avoid:** Trust the guard: `{dominant !== null && moralConflicts.length > 0 && ...}`.

---

## Code Examples

### Detection test extension pattern (matching existing detection.test.js style)

```javascript
// Run with: node src/lib/__tests__/detection.test.js
// (no Jest — plain Node assert pattern)

console.log('\n--- findMoralConflicts tests ---')

// Test: honesty #1, deontology/virtue are aligned — no conflict for deontology choice
const noConflict = findMoralConflicts(
  [{ round: 1, frameworks: ['deontology'], choiceIndex: 1 }],
  ['honesty', 'fairness', 'loyalty', 'courage', 'compassion'],
  { lie_to_protect: 'no', ends_justify: 'no' }
)
assert(noConflict.length === 0, 'no conflict when top value maps to choice framework')

// Test: honesty #1, care choice — conflict fires
const valueConflict = findMoralConflicts(
  [{ round: 2, frameworks: ['care'], choiceIndex: 0 }],
  ['honesty', 'fairness', 'loyalty', 'courage', 'compassion'],
  { lie_to_protect: 'yes', ends_justify: 'yes' }
)
assert(valueConflict.length === 1, 'conflict fires when top value not aligned with choice framework')
assert(valueConflict[0].type === 'value', 'conflict type is value')
assert(valueConflict[0].valueName === 'honesty', 'conflict names the value')

// Test: stance detection — "no" to ends_justify, consequentialist choice
const stanceConflict = findMoralConflicts(
  [{ round: 3, frameworks: ['consequentialism'], choiceIndex: 2 }],
  ['loyalty', 'honesty', 'fairness', 'courage', 'compassion'],
  { lie_to_protect: 'yes', ends_justify: 'no' }
)
// loyalty → care, consequentialism not in care → value conflict fires first
// stance conflict should not double-fire
assert(stanceConflict.length === 1, 'only one conflict per round (no double-fire)')
```

### Conflict indicator CSS (ConsequenceReveal.module.css addition)

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.moralConflictIndicator {
  font-family: var(--sans);
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
  margin-top: 12px;
  animation: fadeIn 0.5s ease-out 0.5s both;
}
```

The `0.5s` delay matches D-06: "fading in ~0.5s after the framework label appears."

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Framework-vs-framework conflict only | + Moral-vs-ethical conflict layer | Phase 11 | Surfaces the game's core lesson in data |
| endSession writes profile only | endSession also shapes AI-ready context | Phase 11 | Players and session are LLM-prompt-ready |

---

## Open Questions

1. **FrameworkProfile pack-at-module-level bug**
   - What we know: `const pack = getDefaultPack()` at module level means non-default pack scenario titles are wrong in the choice log
   - What's unclear: Is this bug acceptable to carry forward or should Phase 11 fix it as part of the work?
   - Recommendation: Fix it by accepting `pack` as a prop to FrameworkProfile from Play.jsx. Play.jsx has `pack` in state. One prop addition removes the module-level constant. This is a small fix with high value. Include in Plan 02 with FrameworkProfile changes.

2. **Stance conflict specificity for `lie_to_protect`**
   - What we know: CONTEXT.md D-03 says 'player said "No" to "ends justify means" but picks a consequentialist choice' is an explicit example. The `lie_to_protect` / care mapping is less certain.
   - What's unclear: Is a "No" to `lie_to_protect` + care ethics choice a meaningful moral conflict, given that care ethics is broader than just lying to protect?
   - Recommendation: The detection function can be conservative here — only fire the stance conflict for `lie_to_protect=no` + care if the care framework choice's `message` field naturally connects to protection/loyalty. Alternatively, skip the `lie_to_protect` secondary detection entirely and only implement the cleaner `ends_justify` case. Both are within Claude's Discretion.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 11 is purely code/migration changes. No external CLI tools, new services, or runtimes beyond the already-running Node.js dev environment are required.

---

## Sources

### Primary (HIGH confidence)
- Live codebase read: `src/lib/detection.js` — existing function signatures and patterns
- Live codebase read: `src/lib/frameworks.js` — FRAMEWORKS object, CONFLICT_PAIRS array
- Live codebase read: `src/components/FrameworkProfile.jsx` — section structure, animation variants, rendering pattern
- Live codebase read: `src/components/FrameworkProfile.module.css` — CSS variable names, section styles
- Live codebase read: `src/components/ConsequenceReveal.jsx` — framework label location confirmed
- Live codebase read: `src/pages/Play.jsx` — where ConsequenceReveal is called, player prop structure
- Live codebase read: `src/pages/Host.jsx` — endSession() function, current select fields
- Live codebase read: `src/pages/Baseline.jsx` — moral_values and moral_stances data shapes confirmed
- Live codebase read: `supabase/migrations/20260325000000_initial_schema.sql` — players and sessions columns confirmed
- Live codebase read: `supabase/migrations/20260327000000_moral-baseline.sql` — moral_values, moral_stances columns confirmed added
- Live codebase read: `src/lib/scenarios.js` — ScenarioPack @typedef, ai_generated and generator_prompt already in schema (AI-03 is complete)
- Live codebase read: `src/lib/__tests__/detection.test.js` — test runner style confirmed (plain Node, no Jest)

### Secondary (MEDIUM confidence)
- `package.json` version inspection: framer-motion ^11.18.2, react ^19.2.4, @supabase/supabase-js ^2.100.0 — all current, no version conflicts anticipated

---

## Metadata

**Confidence breakdown:**
- Detection logic: HIGH — value-to-framework mapping is fully specified in D-01; pure function pattern is established in detection.js
- UI placement: HIGH — ConsequenceReveal.jsx confirmed as the framework label location; prop threading path is clear
- End screen section: HIGH — FrameworkProfile.jsx section structure and animation pattern are directly reusable
- AI data shaping: HIGH — endSession() structure is clear; only additive changes; migration is standard ALTER TABLE
- AI-03 status: HIGH — confirmed already complete in scenarios.js @typedef and pack objects

**Research date:** 2026-03-29
**Valid until:** This research is based on live codebase reads and will remain valid until the codebase changes. No external library research required.
