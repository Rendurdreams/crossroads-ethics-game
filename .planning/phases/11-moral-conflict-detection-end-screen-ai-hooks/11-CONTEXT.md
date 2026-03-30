# Phase 11: Moral Conflict Detection + End Screen + AI Hooks - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire players' stated moral baseline (from Phase 7) into the game loop and end screen. Detect when in-game choices conflict with personal values, surface that tension visually during play and at game end, and shape all player/session data for future AI consumption. No live AI calls — stubs only.

</domain>

<decisions>
## Implementation Decisions

### Moral Conflict Detection Logic
- **D-01:** Value-to-framework mapping: honesty → deontology/virtue, loyalty → care, fairness → consequentialism/deontology, courage → virtue, compassion → care. A conflict fires when the choice's framework tags don't align with the player's #1 ranked value's mapped frameworks.
- **D-02:** Detection threshold is top 1 value only — only the player's #1 ranked value triggers conflict indicators. Fewer, more meaningful hits.
- **D-03:** Stance answers (lie_to_protect, ends_justify) feed into detection as a secondary signal. E.g., player said "No" to "ends justify means" but picks a consequentialist choice → that's flagged as an additional moral conflict alongside value-based detection.
- **D-04:** This is a NEW detection layer — separate from the existing `findConflicts()` which detects framework-vs-framework conflicts across rounds. The new detection is moral-vs-ethical: personal values vs. framework choice.

### In-Round Conflict Indicator UX
- **D-05:** Tone is neutral observation: "This conflicts with your value of honesty." Factual, no judgment. Fits the game's pedagogical stance of revealing, not rating.
- **D-06:** Placement: below the existing framework label, fading in ~0.5s after the framework label appears. Two distinct lines, stacked. Natural reading flow on phone.
- **D-07:** Only shown after choice is locked — never before. Matches the existing framework label reveal timing pattern.

### End Screen Moral vs Ethics Map
- **D-08:** New section sits after the dominant framework section and before the existing framework conflict map. Order: (1) Your Framework, (2) Your Morals vs Your Ethics (NEW), (3) Where the Conflict Lived, (4) Least Used, (5) Choice Log.
- **D-09:** Copy explicitly names and explains the morals vs ethics distinction: "Your MORALS are personal — shaped by your life. Ethical FRAMEWORKS are reasoned systems societies use. Here's where they diverged:" Then lists each conflict round with context.
- **D-10:** MORAL-06 requirement — the section title/framing must distinguish moral profile (personal, stated) from ethical framework (reasoned system). The lesson is in the text, not left implicit.

### AI Data Shape
- **D-11:** `debrief_context` on the player row is a full narrative-ready JSON payload: choice history with scenario titles, framework tags per choice, moral baseline (values + stances), detected moral conflicts with round context, dominant framework, framework conflict pairs. Enough for an LLM to generate a personalized debrief paragraph without querying anything else.
- **D-12:** `group_debrief_context` on the session row: aggregate framework breakdown across all players, world state final values, notable moral conflicts across the group (e.g., "60% of players who ranked honesty #1 still chose care ethics in Round 2"), pack info.
- **D-13:** `src/lib/ai.js` stub with `generateDebrief(playerContext)`, `generateDiscussionPrompts(sessionContext)`, `generatePack(prompt)` — all return null. Shapes documented with JSDoc.

### Claude's Discretion
- Exact CSS animation timing for the conflict indicator fade-in
- Internal structure of the value-to-framework mapping (object vs function)
- Whether moral conflicts are computed client-side or stored in Supabase (likely client-side like existing computeProfile)
- Exact copy wording for the end screen moral vs ethics intro paragraph

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Detection Logic
- `src/lib/detection.js` — Existing `computeProfile()` and `findConflicts()` to extend
- `src/lib/frameworks.js` — FRAMEWORKS definitions and CONFLICT_PAIRS array
- `src/lib/__tests__/detection.test.js` — Existing test patterns for detection logic

### UI Components
- `src/components/FrameworkProfile.jsx` — End screen component to add moral vs ethics section
- `src/components/FrameworkProfile.module.css` — Existing styles to extend
- `src/pages/Play.jsx` — In-round view where conflict indicator appears after choice lock
- `src/pages/Baseline.jsx` — Moral baseline data shape (moral_values array, moral_stances object)

### Host / Session Logic
- `src/pages/Host.jsx` — `endSession()` function computes profiles; needs to add debrief_context shaping
- `src/lib/scenarios.js` — Pack system, `getPackById()`, `getScenarioByRound()`

### Project Spec
- `CLAUDE.md` §Framework Detection Logic — conflict detection spec and end screen design
- `CLAUDE.md` §End Screen — FrameworkProfile feature spec
- `.planning/REQUIREMENTS.md` — MORAL-03 through MORAL-06, AI-01 through AI-04

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `detection.js`: `computeProfile()` returns `{ dominant, counts, leastUsed }` — extend with moral conflict detection
- `detection.js`: `findConflicts()` returns framework-vs-framework conflicts — new function needed for moral-vs-ethical conflicts
- `FrameworkProfile.jsx`: Framer Motion stagger pattern (containerVariants, sectionVariants) — reuse for new section
- `FrameworkProfile.module.css`: Glass card sections with eyebrow labels — add new section styles following same pattern
- `Play.jsx`: Framework label appears at line ~461 after choice lock — conflict indicator goes below it

### Established Patterns
- Detection functions are pure (no Supabase calls) — take choiceHistory, return computed results
- FrameworkProfile receives the full player object as prop — moral_values and moral_stances already available
- endSession() in Host.jsx computes profiles with Promise.all batch writes — add debrief_context computation there
- Kingdom war-council register in Play.jsx copy ("decree", "counsel", "realm")

### Integration Points
- `endSession()` in Host.jsx — compute debrief_context per player, group_debrief_context per session
- Player Supabase row — needs debrief_context jsonb column (or computed client-side and stored)
- Session Supabase row — needs group_debrief_context jsonb column
- FrameworkProfile.jsx — receives player prop, needs moral_values and moral_stances data
- Play.jsx — needs player's moral_values to detect conflict at choice-lock time

</code_context>

<specifics>
## Specific Ideas

- End screen moral vs ethics copy should explicitly teach the lesson: "Your morals are personal. Ethical frameworks are reasoned systems. That tension is not a flaw — it's where real thinking begins." This is the game's central thesis from CLAUDE.md.
- Stance conflicts should read naturally: "You said the ends don't justify the means — but in Round 3, you chose the outcome that helped the most people. That's consequentialism overriding your stated conviction."
- The in-round conflict indicator should be subtle enough not to disrupt play flow but noticeable enough to plant a seed for the end screen reveal.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 11-moral-conflict-detection-end-screen-ai-hooks*
*Context gathered: 2026-03-29*
