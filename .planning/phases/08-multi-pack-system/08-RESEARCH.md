# Phase 8: Multi-Pack System — Research

**Researched:** 2026-03-28
**Domain:** Scenario content authoring, pack registry architecture, Supabase schema migration, HostSetup UI
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Pack Selection UI**
- D-01: 3 horizontal cards side-by-side on HostSetup, equal visual weight. Selected card gets amber border/glow highlight.
- D-02: Each card shows: pack name, scenario count, setting/genre tag, and 1-line description.
- D-03: Kingdom-arc starts pre-selected. "Open the Gates" button is always enabled — no forced choice.
- D-04: Host can switch selection at any time before opening; last selection before clicking "Open the Gates" wins.

**New Scenario Content**
- D-05: Real-world modern pack tone: same weight as original (Destiny/Marcus/Camille level) — adult college tone, content notes on heavy rounds, real interpersonal/community stakes.
- D-06: Sci-fi/future pack framing: near-future grounded person (player is themselves in ~2040). Personal scenarios involving AI in daily life, genetic decisions for a family member, surveillance trade-offs, resource scarcity. Not space opera, not institutional authority — grounded and personal.
- D-07: Both new packs: 6 playable dilemmas + 1 free-text reflection round = 7 rounds total. `total_rounds` will differ from kingdom-arc's 8.
- D-08: Scenario structure is identical to kingdom-arc: `{ id, title, round, weight, contentNote, moralTension, teaches, text, choices[] }`. Each choice has `{ choiceIndex, text, frameworks[], consequence, worldImpact }`.

**Pack Persistence**
- D-09: Add `pack_id text DEFAULT 'kingdom-arc'` column to sessions table via SQL migration.
- D-10: HostSetup writes `pack_id` and `total_rounds` to Supabase on "Open the Gates" click.
- D-11: Host.jsx and Play.jsx resolve pack via `getPackById(session.pack_id)` after fetching session on mount. Remove module-level `getDefaultPack()` call from both files. Pack resolves to `packs[0]` (kingdom-arc) as fallback if `pack_id` is null/unrecognized.

**AI-Ready Pack Schema**
- D-12: Add `ai_generated: false` and `generator_prompt: null` to the top level of every pack object. All hand-written packs use these defaults.
- D-13: Update `kingdom-arc.js` to include the new fields. Document full pack schema shape in `scenarios.js` as a JSDoc comment.

### Claude's Discretion
- Specific scenario titles and text for the two new packs
- World impact values for new scenarios (calibrate to kingdom-arc range: -14 to +16 per dimension)
- Content note text for heavy rounds in new packs
- CSS styling for selected vs unselected pack cards (amber glow on selected, muted on unselected)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PACK-01 | Real-world modern dilemmas pack — 5–7 scenarios, contemporary contexts, same framework-tag + world-impact structure | Scenario authoring pattern confirmed from kingdom-arc.js; structure maps directly |
| PACK-02 | Sci-fi / future dilemmas pack — 5–7 scenarios, near-future contexts, same structure | Same authoring pattern; grounded personal framing per D-06 |
| PACK-03 | Host can select which pack on HostSetup — 3 pack cards with title, description, scenario count | HostSetup.jsx pack card CSS already exists; extend to multi-select with selected state |
| PACK-04 | Session `total_rounds` set from selected pack's scenario count | `openLobby()` in HostSetup already calls Supabase UPDATE; extend to write both `pack_id` and `total_rounds` |
| PACK-05 | Pack system structured for future AI-generated pack injection without code changes | `packs[]` registry + `getPackById()` already architected for this; add JSDoc schema doc + AI fields |
| AI-03 | Pack schema includes optional `ai_generated: true` flag and `generator_prompt` field | Add to pack object top level; document shape in JSDoc |
</phase_requirements>

---

## Summary

Phase 8 is a well-bounded content + wiring phase. The infrastructure is already in place: `scenarios.js` exports a `packs[]` registry, `getPackById()` exists and falls back to `packs[0]`, and `HostSetup.jsx` already renders a single `.packCard` with the exact CSS classes needed for the multi-select extension. The work divides cleanly into four areas: (1) author two new scenario packs as JS files matching the kingdom-arc shape, (2) extend the HostSetup UI from single display to three-card selection with selected state, (3) wire `pack_id` into the sessions table via migration and write/read it at session open, and (4) add `ai_generated`/`generator_prompt` fields to all three pack objects plus a JSDoc schema comment.

The only non-obvious integration risk is a hardcoded `total_rounds === 6` check in `Play.jsx` line 342 that guards the end-screen reflection display. Kingdom-arc has 8 rounds total; the new packs will have 7. This guard will incorrectly suppress the end-screen reflection for both new packs. The fix is to replace the hardcoded check with a pack-aware check (`getReflectionScenario(pack) !== null`), which requires the pack to be resolved from `session.pack_id` before this render path runs.

The other migration risk is that `Host.jsx` and `Play.jsx` both assign `pack` at module level (`const pack = getDefaultPack()`). This means the pack is frozen at module load time and cannot react to `session.pack_id`. Both files must move pack resolution into state, initialized from `session.pack_id` after the mount fetch.

**Primary recommendation:** Implement in three waves — (1) schema migration + pack files + registry registration, (2) HostSetup multi-card UI + openLobby wiring, (3) Host.jsx + Play.jsx pack resolution refactor.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| CSS Modules | Native (Vite) | HostSetup card selected state styling | Established project pattern; all pages use `.module.css` |
| Supabase JS | 2.x (2.45+) | Write `pack_id` on session open; read on mount | Already in use; same UPDATE call extended |

### No New Dependencies

This phase requires zero new npm packages. All work is:
- New JS content files (pack authors)
- CSS additions to existing `.module.css`
- SQL migration (one `ADD COLUMN IF NOT EXISTS`)
- JSX edits to HostSetup, Host, Play

---

## Architecture Patterns

### Pack File Structure (canonical — from kingdom-arc.js)

Every pack file exports a single named constant. The object shape is:

```javascript
// src/lib/scenarios/packs/real-world-modern.js
export const realWorldModernPack = {
  id: 'real-world-modern',           // unique string, URL-safe
  name: 'Common Ground',             // display name
  description: '...',                // 1-2 sentences for card
  setting: 'real-world',             // genre tag for card label
  ai_generated: false,               // AI-03: schema field
  generator_prompt: null,            // AI-03: schema field
  scenarios: [
    {
      id: 'rw-round-1',
      title: '...',
      round: 1,
      weight: 'low' | 'medium' | 'heavy' | 'reflective',
      contentNote: null | 'string',  // shown as dismissible note
      moralTension: '...',
      teaches: '...',
      text: '...',
      choices: [
        {
          choiceIndex: 0,
          text: '...',
          frameworks: ['care'] | ['deontology', 'virtue'] | etc.,
          consequence: '...',        // private reveal after round closes
          worldImpact: { trust: N, courage: N, solidarity: N, awareness: N }
        }
        // ... choiceIndex 1, 2
      ]
    }
    // ... 5 more playable rounds + 1 reflection round (choices: [])
  ]
}
```

### Pack Registry (scenarios.js)

Adding a new pack is two lines:

```javascript
// src/lib/scenarios.js — add import + push
import { realWorldModernPack } from './scenarios/packs/real-world-modern.js'
import { futuresPack } from './scenarios/packs/futures.js'

export const packs = [kingdomArcPack, realWorldModernPack, futuresPack]
// getPackById() and getDefaultPack() require no changes
```

### HostSetup Multi-Select Pattern

Current HostSetup has `const pack = getDefaultPack()` at module level and renders one `.packCard`. Phase 8 replaces this with:

1. Remove module-level `pack` const
2. Add `const [selectedPackId, setSelectedPackId] = useState('kingdom-arc')`
3. Render `packs.map(p => ...)` — three cards
4. Selected card: add `.packCardSelected` CSS class (amber border + glow)
5. `openLobby()` writes `pack_id: selectedPackId` and `total_rounds: getPlayableScenarios(getPackById(selectedPackId)).length + 1` (playable + reflection)

The `openLobby()` function currently only calls `navigate()` without a Supabase UPDATE. The `total_rounds` write is deferred to `startGame()` in Host.jsx (line 250). Per D-10, the pack_id write belongs in `openLobby()`. The plan should extend `openLobby()` to do the Supabase UPDATE before navigating.

### Host.jsx / Play.jsx Pack Resolution Refactor

Both files currently bind `const pack = getDefaultPack()` at module scope (lines 6 and 7 respectively). This must become reactive state:

```javascript
// Pattern to apply in both Host.jsx and Play.jsx
const [pack, setPack] = useState(null)

// Inside mount useEffect, after session fetch:
.then(({ data, error }) => {
  if (error || !data) { navigate('/'); return }
  setSession(data)
  setPack(getPackById(data.pack_id))   // resolves with fallback to packs[0]
  setLoading(false)
})
```

All existing `pack.scenarios`, `pack.name`, etc. references continue to work — only the initialization site changes.

### Reflection Guard Fix (Play.jsx)

Current code at line 342:
```javascript
const showReflection = session?.total_rounds === 6
```

This was written for the original CLAUDE.md scenario set (Round 6 = reflection). It will fire incorrectly for kingdom-arc (8 rounds) AND will suppress reflection for the new packs (7 rounds). The correct check:

```javascript
// After pack is resolved from session.pack_id:
const showReflection = pack !== null && getReflectionScenario(pack) !== null
```

This is pack-agnostic and will survive any future pack where the reflection round exists.

### SQL Migration Pattern

Follow the established idempotent pattern from `migration-07-moral-baseline.sql`:

```sql
-- supabase/migrations/20260328000000_pack-id.sql
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS pack_id text DEFAULT 'kingdom-arc';

-- Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'sessions'
  AND column_name = 'pack_id';
```

Also update `supabase/migration-07-moral-baseline.sql`'s sibling — the standalone migration file pattern. There are two migration locations: `supabase/migrations/` (timestamped, for CLI deploy) and `supabase/migration-07-moral-baseline.sql` (manual, for SQL editor). Phase 7 used both. Phase 8 should follow the same dual-file pattern.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pack fallback on unknown id | Custom switch/if chain | `packs.find(p => p.id === id) ?? packs[0]` | Already implemented in `getPackById()` |
| Scenario count for `total_rounds` | Manual count per pack | `getPlayableScenarios(pack).length` | Already exported from scenarios.js; counts only non-reflection rounds |
| Reflection round detection | Hardcoded round number check | `getReflectionScenario(pack) !== null` | Pack-agnostic; already exported from scenarios.js |
| Multi-select card state | Complex state machine | Single `selectedPackId` string in useState | Three choices, one default — no reducer needed |

---

## Common Pitfalls

### Pitfall 1: Module-Level Pack Binding
**What goes wrong:** `Host.jsx` and `Play.jsx` assign `const pack = getDefaultPack()` at module scope. If left unchanged, both files will always use kingdom-arc regardless of which pack was selected.
**Why it happens:** The original design had a single pack; module-level was sufficient.
**How to avoid:** Move pack to state, initialize from `session.pack_id` in the mount fetch useEffect. Both files already fetch session on mount — it's one line to add `setPack(getPackById(data.pack_id))` there.
**Warning signs:** Host shows kingdom-arc scenarios while player sees real-world scenarios.

### Pitfall 2: Hardcoded `total_rounds === 6` Reflection Guard
**What goes wrong:** `Play.jsx` line 342 checks `session?.total_rounds === 6` to decide whether to show the end-screen reflection input. Kingdom-arc has 8 rounds; new packs have 7. Neither will match `6`.
**Why it happens:** Written for the original CLAUDE.md scenario set before the kingdom-arc pack was introduced.
**How to avoid:** Replace with `getReflectionScenario(pack) !== null`. This requires pack to be resolved (see Pitfall 1 fix) before this render path runs. Guard with `if (!pack) return <LoadingView />` before the finished-state block.
**Warning signs:** End screen never shows reflection text input for any pack.

### Pitfall 3: `total_rounds` Written Too Late
**What goes wrong:** Currently `total_rounds` is written to Supabase in `startGame()` (Host.jsx line 250) rather than in `openLobby()`. If a host opens the lobby, a player joins, and the host hasn't started yet, the session's `total_rounds` is whatever the DB default is — not the pack's value.
**Why it happens:** The original flow had `total_rounds` as a UI selection that was committed at game start.
**How to avoid:** Per D-10, write both `pack_id` and `total_rounds` in `openLobby()` (HostSetup) before navigating. Remove the redundant `total_rounds` write from `startGame()` or keep it as a no-op safety.
**Warning signs:** Player lobby shows incorrect dilemma count; `session.total_rounds` doesn't match pack.

### Pitfall 4: `pack_id` NULL for Existing Sessions
**What goes wrong:** Sessions created before the migration runs will have `pack_id = NULL`. `getPackById(null)` returns `packs[0]` (kingdom-arc) via the `?? packs[0]` fallback — so this is safe, but it must be verified the fallback path is hit.
**Why it happens:** `ADD COLUMN IF NOT EXISTS` with `DEFAULT 'kingdom-arc'` applies the default to new rows only; existing rows get NULL.
**How to avoid:** The `getPackById` fallback already handles this. No backfill needed. Document this as expected behavior.
**Warning signs:** None — fallback is silent and correct.

### Pitfall 5: Reflection Round ID Collision Across Packs
**What goes wrong:** If both packs use `id: 'round-reckoning'` for their reflection scenario, and if any code ever queries scenarios by ID (not round number), results could be ambiguous.
**Why it happens:** The kingdom-arc reflection scenario uses `id: 'round-reckoning'`. New packs should use unique IDs.
**How to avoid:** Use pack-prefixed IDs for all scenarios in new packs: `rw-round-reckoning`, `ft-round-reckoning`, etc.
**Warning signs:** No current code queries by scenario ID — this is a future-proofing concern, not an immediate bug.

---

## Code Examples

### Verified: Current openLobby (HostSetup.jsx)

```javascript
// src/pages/HostSetup.jsx line 49 — current implementation
async function openLobby() {
  setOpening(true)
  navigate(`/host/${sessionId}`)
}
// NOTE: No Supabase call here currently. pack_id + total_rounds write must be added.
```

### Verified: startGame currently writes total_rounds (Host.jsx)

```javascript
// src/pages/Host.jsx line 246–253 — current startGame
async function startGame() {
  dispatch({ type: 'ROUND_START', duration: timerDuration })
  await supabase
    .from('sessions')
    .update({ status: 'active', total_rounds: session.total_rounds, current_round: 1 })
    .eq('id', sessionId)
  setStarted(true)
}
// total_rounds is redundant here once openLobby writes it; keep as safety or remove.
```

### Verified: Pack card CSS variables available

```css
/* src/index.css — palette for selected card state */
--accent: #f59e0b;
--glow-amber: rgba(245, 158, 11, 0.35);
--glow-amber-strong: rgba(245, 158, 11, 0.5);
--glass-bg: rgba(30, 28, 50, 0.55);
--glass-border: rgba(245, 158, 11, 0.28);
```

### Pattern: Selected card CSS class

```css
/* HostSetup.module.css — new class to add */
.packCardSelected {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent), 0 0 20px var(--glow-amber);
}

.packCardUnselected {
  opacity: 0.65;
}
```

---

## Scenario Content Architecture

### Framework Distribution Target (per pack)

Each 6-round pack should expose all four frameworks across its choices. Target distribution across 18 total choice slots (6 rounds × 3 choices):

| Framework | Target appearances | Notes |
|-----------|-------------------|-------|
| care | 4–6 | Must anchor at least 2 rounds |
| consequentialism | 5–7 | Most flexible — often combined |
| deontology | 4–6 | Should appear cleanly in at least 2 rounds |
| virtue | 4–6 | Often paired with deontology |

Kingdom-arc achieves this balance across 7 playable rounds. New packs with 6 playable rounds should be slightly denser — average ~3 framework tags per round.

### World Impact Calibration

Kingdom-arc range: `-14` to `+18` per dimension per choice. Midpoint choices trend -2 to +8. Dramatic choices reach +14/+16/+18 or -8/-12/-14. New packs should hit the same range to keep world state dynamics consistent across packs.

Confirmed from kingdom-arc.js:
- Most impactful positive: `courage: +18` (round-6, free Irel)
- Most impactful negative: `courage: -14` (round-6, maintain binding)
- Neutral choice pattern: values of ±2 to ±6 across all four dimensions

### Round Weight Arc

Both new packs should follow the soft-landing arc mandated by CLAUDE.md design rules:

| Round | Weight |
|-------|--------|
| 1 | low |
| 2 | low |
| 3 | medium |
| 4 | medium |
| 5 | heavy |
| 6 | heavy |
| 7 (reflection) | reflective |

Content notes required on any heavy round that involves crisis topics (self-harm adjacent, family trauma, etc.). Per D-05/D-06, new packs at college-maturity tone with the same real-consequence design philosophy.

### JSDoc Schema Comment (scenarios.js)

Per D-13, add a JSDoc block above the `packs` export:

```javascript
/**
 * @typedef {Object} PackChoice
 * @property {number} choiceIndex - 0, 1, or 2
 * @property {string} text - Button label
 * @property {string[]} frameworks - 1-2 of: 'care'|'deontology'|'consequentialism'|'virtue'
 * @property {string} consequence - Private outcome text shown after round closes
 * @property {{trust: number, courage: number, solidarity: number, awareness: number}} worldImpact
 *
 * @typedef {Object} PackScenario
 * @property {string} id - Unique scenario ID, pack-prefixed
 * @property {string} title
 * @property {number} round - 1-indexed
 * @property {'low'|'medium'|'heavy'|'reflective'} weight
 * @property {string|null} contentNote - Shown as dismissible note if non-null
 * @property {string} moralTension
 * @property {string} teaches
 * @property {string} text - Full scenario prompt
 * @property {PackChoice[]} choices - Empty array for reflection rounds
 *
 * @typedef {Object} ScenarioPack
 * @property {string} id - URL-safe unique identifier
 * @property {string} name - Display name
 * @property {string} description - 1-2 sentence description for pack card
 * @property {'fantasy'|'real-world'|'near-future'} setting - Genre tag
 * @property {boolean} ai_generated - True only for AI-generated packs
 * @property {string|null} generator_prompt - LLM prompt used to generate pack, if ai_generated
 * @property {PackScenario[]} scenarios
 */
```

---

## Environment Availability

Step 2.6: SKIPPED — Phase 8 is pure code/content changes with no external tool dependencies beyond the existing Supabase project and npm stack already confirmed operational.

---

## Open Questions

1. **`openLobby()` currently has no Supabase call — what was the original intent?**
   - What we know: `total_rounds` is written in `startGame()`, not `openLobby()`. The session row exists before HostSetup loads (created on Landing). `openLobby()` just navigates.
   - What's unclear: Is there a reason the DB write was deferred to `startGame()`?
   - Recommendation: D-10 is explicit — write `pack_id` and `total_rounds` in `openLobby()`. Add the Supabase UPDATE there. No architectural conflict.

2. **`showReflection` end-screen guard for kingdom-arc**
   - What we know: Kingdom-arc has 8 `total_rounds`. The current guard `total_rounds === 6` means kingdom-arc ALSO never shows the end-screen reflection input today. This appears to be a pre-existing bug.
   - What's unclear: Whether the end-screen reflection was intentionally disabled for kingdom-arc (kingdom-arc's reflection is round 8, not a separate end-screen prompt).
   - Recommendation: Replace with `getReflectionScenario(pack) !== null`. This correctly shows it for all packs that have a reflection round. Verify with a kingdom-arc playthrough after the change.

3. **`scenarios` backward-compat export in scenarios.js**
   - What we know: `export const scenarios = kingdomArcPack.scenarios` exists for backward compat with `worldState.test.js`.
   - What's unclear: Should this export remain pointing to kingdom-arc only, or should tests be updated?
   - Recommendation: Leave the backward-compat export unchanged. It's only consumed by the test file. Tests for new packs should import the new pack objects directly.

---

## Sources

### Primary (HIGH confidence)
- `/Users/jay/MoralApp/src/lib/scenarios/packs/kingdom-arc.js` — canonical pack shape, verified by reading full file
- `/Users/jay/MoralApp/src/lib/scenarios.js` — pack registry API surface, verified
- `/Users/jay/MoralApp/src/pages/HostSetup.jsx` — current single-pack UI, verified line by line
- `/Users/jay/MoralApp/src/pages/Host.jsx` — module-level pack bind, `startGame()` total_rounds write, verified
- `/Users/jay/MoralApp/src/pages/Play.jsx` — module-level pack bind, `total_rounds === 6` guard, verified
- `/Users/jay/MoralApp/src/pages/HostSetup.module.css` — existing pack card CSS classes, verified
- `/Users/jay/MoralApp/src/index.css` — CSS variable palette, verified
- `/Users/jay/MoralApp/supabase/migration-07-moral-baseline.sql` — migration pattern, verified

### Secondary (MEDIUM confidence)
- `.planning/phases/08-multi-pack-system/08-CONTEXT.md` — all decisions locked by discussion session

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries; all existing patterns verified against source
- Architecture patterns: HIGH — verified against actual codebase, not assumptions
- Pitfalls: HIGH — bugs confirmed by reading source (total_rounds === 6 guard, module-level pack bind)
- Scenario content: MEDIUM — Claude's discretion per D-05/D-06; framework balance targets derived from kingdom-arc analysis

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable domain; only risk is Supabase client API changes, unlikely in 30 days)
