# Phase 7: Moral Profile Data Layer - Research

**Researched:** 2026-03-27
**Domain:** React routing, Supabase schema migration, localStorage state preservation, tap-to-rank interaction pattern
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** A new route `/baseline/:sessionId` is the step's home — not inline in Landing or Play.jsx.
- **D-02:** Join flow: Landing creates player row + writes localStorage → navigates to `/baseline/:sessionId` → baseline UI runs → writes moral_baseline to Supabase → navigates to `/play/:sessionId` → lobby wait.
- **D-03:** On refresh at `/baseline/:sessionId`, restore in-progress answers from localStorage (value ranking + stance selections saved as player taps). Write to Supabase only when the full baseline is submitted. This fulfills MORAL-02: localStorage preserves state until Supabase write confirms.
- **D-04:** Tap-to-rank sequential selection: all 5 values shown as cards simultaneously. Player taps to assign ranks 1–5 in order (first tap = #1 value, second = #2, etc.). Each tapped card shows its assigned rank number. An undo/clear button per card allows changing a rank.
- **D-05:** No drag-and-drop — no library dependency needed. Touch-friendly card tap is sufficient.
- **D-06:** Immersive game-world framing — written in the war council / kingdom register, consistent with existing Play.jsx atmospheric copy. Example: "Before you take your seat at the council, declare what you hold most dear. Your counsel will remember."
- **D-07:** The step should feel like the game has already begun, not like a survey gatekeeping entry. The page should share the glass-morphism dark aesthetic and Playfair Display copy style.
- **D-08:** Stance questions use decree-tile button style (same visual component as scenario choices) — amber bordered buttons with Roman numeral prefix (I / II / III).
- **D-09:** Stance question 1: "Is it ever right to lie to protect someone you love?" — answers: I. Yes / II. No / III. It depends. Maps to care vs. deontology.
- **D-10:** Stance question 2: "Do the ends justify the means if enough people benefit?" — answers: I. Yes / II. No / III. It depends. Maps to consequentialism vs. deontology.
- **D-11:** Two new JSONB columns on the `players` table: `moral_values jsonb DEFAULT NULL` and `moral_stances jsonb DEFAULT NULL`.
- **D-12:** Stance answer keys: `lie_to_protect` and `ends_justify`. Possible values: `"yes"`, `"no"`, `"it_depends"`.
- **D-13:** Schema change: `ALTER TABLE players ADD COLUMN moral_values jsonb DEFAULT NULL; ALTER TABLE players ADD COLUMN moral_stances jsonb DEFAULT NULL;`

### Claude's Discretion

- Exact CSS layout of the value cards (grid vs. stacked column)
- Whether value rank badges are numbers or ordinal labels (1st, 2nd…)
- Exact copy for UI micro-labels and helper text within the war council register
- Progress indicator style between value ranking and stance questions (step dots, separator, etc.)

### Deferred Ideas (OUT OF SCOPE)

- Moral conflict detection at choice-lock time (MORAL-03, MORAL-04) — held for Phase 11
- End-screen moral vs. ethics conflict map (MORAL-05, MORAL-06) — Phase 11
- Animated SVG or richer value card interactions — CSS class-based is sufficient for v1
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MORAL-01 | Player completes a hybrid moral baseline at join time — value priority ranking (loyalty, honesty, fairness, courage, compassion) + 2 stance questions — completes in under 60 seconds on phone | Tap-to-rank pattern (D-04/D-05), stance button reuse of existing decree-tile component (D-08), single-screen flow without forced round-trips |
| MORAL-02 | Moral baseline data stored on the player row in Supabase (values ranking as ordered array, stance answers as key/value pairs) | Supabase UPDATE pattern for existing player row, localStorage fallback until write confirms (D-03), 2 new JSONB columns (D-11/D-13) |
</phase_requirements>

---

## Summary

Phase 7 inserts a single interstitial page — `/baseline/:sessionId` — between Landing's join flow and the Play lobby. The page collects a 5-value priority ranking and 2 stance questions, then writes the result to the `players` row in Supabase before navigating forward. Because the flow is a new route with its own component (`Baseline.jsx`), it follows exactly the same structural patterns already established in `Landing.jsx` and `Play.jsx`: Framer Motion page transitions with `pageVariants`, a mount-restore `useEffect` reading from `localStorage`, and a single Supabase write (UPDATE, not INSERT) when the full baseline is confirmed.

The tap-to-rank interaction is implemented with pure React state — no library. A `rankedValues` array tracks the ranking order as the player taps. Tapping a card appends its value name to the array (rank position = array index + 1). The undo button for a card splices its entry out of the array. Stance selections are plain single-select state with three options. All state is mirrored to `localStorage` on every change so a page refresh can restore progress.

The schema change is a non-destructive SQL migration (`ALTER TABLE ADD COLUMN DEFAULT NULL`) — safe to run against a live Supabase project. Existing rows keep their NULL values and are unaffected. Phase 11's detection logic will read these columns; Phase 7 only writes them.

**Primary recommendation:** Build `Baseline.jsx` as a self-contained page component. Reuse `ScenarioCard.module.css`'s `.choiceBtn`/`.choiceLocked` styles for stance buttons. Implement the value ranking with local state and localStorage sync. Write to Supabase on final submit only.

---

## Standard Stack

### Core (already installed — no new dependencies)
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| React | 18.x | Component state for ranking logic and stance selection | Already in project |
| Framer Motion | ^11.13.5 | Page transition (AnimatePresence mode=wait, pageVariants) | Already in project; Baseline.jsx must match pattern |
| @supabase/supabase-js | 2.x | UPDATE player row with moral_values + moral_stances | Already in project |
| React Router | v7 (installed) | `/baseline/:sessionId` route + useParams + useNavigate | Already in project |
| CSS Modules | — | Component-scoped styles for Baseline.jsx | Already in project |

**No new npm dependencies required for Phase 7.**

---

## Architecture Patterns

### New Route: `/baseline/:sessionId`

```
App.jsx                  — add Route for /baseline/:sessionId
src/pages/
  Baseline.jsx           — new page component (mirrors Play.jsx structure)
  Baseline.module.css    — new CSS module (mirrors Play.module.css structure)
```

### Routing Addition (App.jsx)

The existing `AppRoutes` function uses `BrowserRouter` + `AnimatePresence mode="wait"`. The new route slots in between the join redirect (Landing) and the play route:

```jsx
// App.jsx — add alongside existing routes
import Baseline from './pages/Baseline.jsx'

// Inside <Routes>:
<Route path="/baseline/:sessionId" element={<Baseline />} />
```

### Landing.jsx Change — One Line

The only change to `Landing.jsx` is in `joinSession()`, line 110: change `navigate('/play/${session.id}')` to `navigate('/baseline/${session.id}')`.

### Baseline.jsx Structure

**Mount restore useEffect** (same pattern as Play.jsx):
1. Read `player_id` and `session_id` from `localStorage`
2. If match: fetch player row from Supabase
3. If player already has `moral_values !== null` — baseline already submitted, navigate to `/play/:sessionId`
4. Otherwise: restore in-progress state from localStorage keys (`baseline_ranked` and `baseline_stances`) if present
5. If no `player_id` in localStorage: redirect to `/`

**State shape:**
```javascript
const [rankedValues, setRankedValues] = useState([])
// e.g. ['honesty', 'loyalty', 'courage', 'fairness', 'compassion']
// Index 0 = rank 1 (most important), index 4 = rank 5

const [stances, setStances] = useState({})
// e.g. { lie_to_protect: 'yes', ends_justify: 'it_depends' }
```

**localStorage sync pattern** (mirror state on every change):
```javascript
useEffect(() => {
  localStorage.setItem('baseline_ranked', JSON.stringify(rankedValues))
}, [rankedValues])

useEffect(() => {
  localStorage.setItem('baseline_stances', JSON.stringify(stances))
}, [stances])
```

**Submit handler:**
```javascript
async function handleSubmit() {
  if (rankedValues.length < 5 || Object.keys(stances).length < 2) return
  setSubmitting(true)

  const { error } = await supabase
    .from('players')
    .update({
      moral_values: rankedValues,          // ['honesty', 'loyalty', ...]
      moral_stances: stances               // { lie_to_protect: 'yes', ends_justify: 'it_depends' }
    })
    .eq('id', playerId)

  if (!error) {
    // Clean up baseline localStorage keys (keep player_id and session_id)
    localStorage.removeItem('baseline_ranked')
    localStorage.removeItem('baseline_stances')
    navigate(`/play/${sessionId}`)
  } else {
    setSubmitError(true)
    setSubmitting(false)
  }
}
```

### Tap-to-Rank Interaction Pattern

All 5 value cards shown simultaneously. Player taps to rank in order:

```javascript
const VALUES = ['loyalty', 'honesty', 'fairness', 'courage', 'compassion']

function handleValueTap(value) {
  if (rankedValues.includes(value)) return  // already ranked
  if (rankedValues.length >= 5) return       // all ranked
  setRankedValues(prev => [...prev, value])
}

function handleValueUndo(value) {
  // Remove this value and all values ranked after it
  const idx = rankedValues.indexOf(value)
  if (idx === -1) return
  setRankedValues(prev => prev.slice(0, idx))
}
```

This undo semantics (clear from this rank onward) is simpler than splicing midpoint and avoids invalid gap states. The CONTEXT.md says "undo/clear button per card allows changing a rank" — clearing from-that-rank-onward satisfies this while keeping state always valid.

### Stance Question Pattern

Reuse existing decree-tile button styles from ScenarioCard. Each stance question is a set of 3 buttons; selecting one sets its key in the `stances` object:

```javascript
const STANCE_QUESTIONS = [
  {
    key: 'lie_to_protect',
    text: 'Is it ever right to lie to protect someone you love?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'It depends', value: 'it_depends' }
    ]
  },
  {
    key: 'ends_justify',
    text: 'Do the ends justify the means if enough people benefit?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'It depends', value: 'it_depends' }
    ]
  }
]

function handleStance(key, value) {
  setStances(prev => ({ ...prev, [key]: value }))
}
```

### Supabase UPDATE Pattern

Phase 7 writes to an existing player row (created in Landing.jsx's `joinSession`). This is an UPDATE, not an INSERT:

```javascript
const { error } = await supabase
  .from('players')
  .update({ moral_values: rankedValues, moral_stances: stances })
  .eq('id', playerId)
```

The existing `supabase.js` exports only the raw client — no typed helpers exist yet. The planner can choose to either call the client directly in `Baseline.jsx` (consistent with Landing.jsx and Play.jsx which both call `supabase` directly) or add an `updatePlayerBaseline(playerId, moralValues, moralStances)` helper in `supabase.js`. Both are valid; calling directly is simpler and consistent.

### SQL Migration

Run in Supabase SQL editor before any code ships:

```sql
ALTER TABLE players
  ADD COLUMN moral_values jsonb DEFAULT NULL,
  ADD COLUMN moral_stances jsonb DEFAULT NULL;
```

This is non-destructive. Existing player rows get NULL for both columns. No RLS changes needed — existing policy (anon key covers all operations, per STATE.md open RLS decision from Phase 01) covers the UPDATE.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop ranking | Custom DnD implementation | Tap-to-rank with array state | D-05 explicitly prohibits DnD; tap pattern is 30 lines of React state |
| Stance button UI | New button component | ScenarioCard.module.css `.choiceBtn`/`.choiceLocked` classes | Already styled, amber border, Roman numeral prefix — exact match to D-08 |
| Page transition | Custom animation | Framer Motion `pageVariants` from Landing.jsx | Already defined, copy the pattern |
| Optimistic lock guard | Custom submit guard | Same `submitting` state flag pattern from Play.jsx | Already proven, prevents double-submit |

**Key insight:** Every UI primitive needed already exists in the codebase. This phase is mostly new state management logic wrapped in existing visual components.

---

## Common Pitfalls

### Pitfall 1: Navigating to `/play` before Supabase write confirms

**What goes wrong:** If `navigate('/play/${sessionId}')` is called before the Supabase UPDATE resolves, Play.jsx mounts and reads the player row — which still has NULL moral values. Phase 11's detection reads these columns, and NULL values cause silent failures or undefined behavior later.

**Why it happens:** Optimistic UI patterns are correct for choices (Play.jsx does this correctly) but wrong here because downstream code depends on the data existing.

**How to avoid:** `await` the Supabase UPDATE before navigating. Keep the submit button in a loading state (`submitting: true`) until write confirms. Only then navigate and clean localStorage.

**Warning signs:** `console.log(player.moral_values)` in Play.jsx mount returns null despite user completing baseline.

---

### Pitfall 2: localStorage key collision with existing player state

**What goes wrong:** Landing.jsx uses `player_id` and `session_id` localStorage keys. If Baseline.jsx writes carelessly keyed data, a future clear in Play.jsx could wipe in-progress baseline data.

**Why it happens:** No namespacing convention established in the codebase — keys are flat strings.

**How to avoid:** Use distinct keys: `baseline_ranked` and `baseline_stances`. Clean these keys only after Supabase write confirms (in the submit handler, after success). Never clear them in Play.jsx's session restore logic — Play.jsx only reads/writes `player_id` and `session_id`.

**Warning signs:** Player refreshes during baseline, progress gone despite being within the same session.

---

### Pitfall 3: Skipping the "already submitted" guard on mount

**What goes wrong:** A player who completes the baseline and navigates to Play, then hits the browser back button, lands on `/baseline/:sessionId` again. Without a guard, they can submit a second UPDATE (overwriting their first answers).

**Why it happens:** The back button bypasses the forward-only navigation pattern.

**How to avoid:** On Baseline mount, after fetching the player row, check `if (player.moral_values !== null) navigate('/play/${sessionId}', { replace: true })`. This exits cleanly if baseline already done.

**Warning signs:** moral_values in Supabase show later timestamps than expected, or values differ from what user reported.

---

### Pitfall 4: Stance questions shown before all 5 values are ranked

**What goes wrong:** If stance questions render before value ranking is complete, a player might skip the ranking. Completing the form in wrong order produces an inconsistent incomplete state.

**Why it happens:** Both sections rendered unconditionally in the same view.

**How to avoid:** Gate stance question visibility on `rankedValues.length === 5`. Either render them only after all 5 are ranked (scroll down / reveal), or keep them disabled until the ranking is complete. The decision (sequential reveal vs. single-screen disabled) is Claude's discretion — either works.

**Warning signs:** Submit fires with `rankedValues.length < 5`.

---

### Pitfall 5: Undo clears only one card's rank, leaving a gap in the sequence

**What goes wrong:** If undo removes rank 2 from a 5-card ranked sequence, the array becomes `[rank1, rank3, rank4, rank5]` with rank2 missing. The displayed rank numbers are now wrong.

**Why it happens:** Splice-at-index semantics without re-numbering.

**How to avoid:** Use "clear from this rank onward" undo semantics — `rankedValues.slice(0, indexOf(value))`. This always leaves a valid prefix. Cards ranked after the undone card become unranked and available again. Document this behavior clearly in the component.

---

## Code Examples

### Baseline.jsx mount restore skeleton
```javascript
// Source: established pattern from Play.jsx (Play.jsx lines 61–126)
useEffect(() => {
  const storedPlayerId = localStorage.getItem('player_id')
  const storedSessionId = localStorage.getItem('session_id')

  if (!storedPlayerId || storedSessionId !== sessionId) {
    navigate('/')
    return
  }

  supabase
    .from('players')
    .select('*')
    .eq('id', storedPlayerId)
    .single()
    .then(({ data: player }) => {
      if (!player) {
        localStorage.removeItem('player_id')
        localStorage.removeItem('session_id')
        navigate('/')
        return
      }
      // Already completed baseline — skip to play
      if (player.moral_values !== null) {
        navigate(`/play/${sessionId}`, { replace: true })
        return
      }
      setPlayerId(storedPlayerId)
      setPlayer(player)
      // Restore in-progress ranking from localStorage
      const savedRanked = localStorage.getItem('baseline_ranked')
      const savedStances = localStorage.getItem('baseline_stances')
      if (savedRanked) setRankedValues(JSON.parse(savedRanked))
      if (savedStances) setStances(JSON.parse(savedStances))
      setLoading(false)
    })
}, [sessionId, navigate])
```

### Value card render pattern
```jsx
// Source: designed for this phase, consistent with ScenarioCard.module.css patterns
{VALUES.map(value => {
  const rank = rankedValues.indexOf(value)
  const isRanked = rank !== -1
  const rankNumber = isRanked ? rank + 1 : null

  return (
    <button
      key={value}
      className={[
        styles.valueCard,
        isRanked ? styles.valueRanked : ''
      ].filter(Boolean).join(' ')}
      onClick={() => isRanked ? handleValueUndo(value) : handleValueTap(value)}
    >
      {rankNumber && <span className={styles.rankBadge}>{rankNumber}</span>}
      <span className={styles.valueName}>{value}</span>
      {isRanked && <span className={styles.undoHint}>tap to undo</span>}
    </button>
  )
})}
```

### Framer Motion page transition (copy exactly from Landing.jsx)
```javascript
// Source: Landing.jsx lines 9–13
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } }
}
// Apply with useReducedMotion guard — same pattern as Landing.jsx lines 24–25
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Supabase v1 `.from().on()` subscriptions | v2 channel-based `.channel().on('postgres_changes')` | v2 (2022) | All existing code already uses v2; Baseline.jsx has no subscriptions — N/A |
| React Router v6 `createBrowserRouter` | Project uses BrowserRouter declarative mode | Phase 02 | Baseline route added the same way as all existing routes |

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — Supabase and all npm packages already installed; SQL migration runs in Supabase dashboard).

---

## Open Questions

1. **Single-page vs. two-step layout for the baseline UI**
   - What we know: Both value ranking (5 cards) and 2 stance questions must fit on a phone screen within 60 seconds
   - What's unclear: Whether to show both sections on one scrollable page or reveal stance questions only after ranking completes
   - Recommendation: Single scrollable page with stance questions visually disabled until `rankedValues.length === 5` — avoids pagination complexity, keeps flow linear. Claude's discretion per CONTEXT.md.

2. **Value card layout: grid vs. column**
   - What we know: 5 value cards, phone width ~360–430px, must be tappable (min 44px height)
   - What's unclear: 2-column grid (2+2+1) vs. single column stacked
   - Recommendation: Single column stacked — simpler, scan order is unambiguous (top to bottom), less risk of visual confusion between ranked state badge and column positioning. Claude's discretion per CONTEXT.md.

3. **Rank badge style: number (1) vs. ordinal (1st)**
   - What we know: Must show assigned rank on each tapped card (D-04)
   - What's unclear: Numbers are compact; ordinals add textual clarity
   - Recommendation: Plain number in a small amber circle badge — compact, fits the design system, reads instantly. Claude's discretion per CONTEXT.md.

---

## Sources

### Primary (HIGH confidence)
- `src/pages/Landing.jsx` — Current join flow, insertion point, localStorage pattern
- `src/pages/Play.jsx` — Mount restore pattern, three-useEffect separation, `player.id` session restore
- `src/App.jsx` — Current routing structure, AnimatePresence + BrowserRouter
- `src/components/ScenarioCard.jsx` + `ScenarioCard.module.css` — Decree-tile button styles for stance questions
- `src/index.css` — Design tokens (--glass-bg, --accent, --serif, --sans, etc.)
- `.planning/phases/07-moral-profile-data-layer/07-CONTEXT.md` — All locked decisions

### Secondary (MEDIUM confidence)
- `src/pages/Play.module.css` — CSS class naming conventions to follow
- `src/components/ContentNote.jsx` — Component structure reference for overlay/card patterns
- STATE.md — Open RLS policy decision (no additional RLS needed for UPDATE)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies; all libraries already installed and in use
- Architecture: HIGH — patterns are direct copies of Landing.jsx and Play.jsx; only new logic is the tap-to-rank state machine
- Pitfalls: HIGH — all identified from code inspection of existing patterns and the specific state transitions this phase introduces
- SQL migration: HIGH — standard non-destructive ALTER TABLE ADD COLUMN

**Research date:** 2026-03-27
**Valid until:** Stable — no fast-moving dependencies. Valid until Supabase client or React Router major version bump.
