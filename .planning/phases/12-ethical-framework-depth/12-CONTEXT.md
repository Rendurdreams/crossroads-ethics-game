# Phase 12: Ethical Framework Depth - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Deepen the game's ethical analysis layer across 7 requirement groups: expand the moral baseline from 2 to 5 stance questions, add moral trajectory tracking (early vs late framework shifts), introduce conscience cost indicators (amber border on conflicted rounds), add a deontological awareness prompt for honesty-first players on care-tagged choices, surface virtue reputation arcs, tag rights-dimension scenarios across all 3 packs, and frame each pack's cultural/ethical lens on the selection card and end screen.

</domain>

<decisions>
## Implementation Decisions

### Expanded Baseline (BASELINE-01, BASELINE-02, BASELINE-03)
- **D-01:** All 5 stance questions shown at once on a single scrollable page after value ranking. No progressive reveal per question — players scan and answer quickly. Keeps under 60s target.
- **D-02:** 3 new stance questions use REQUIREMENTS.md wording verbatim:
  - Q3 key `break_promise`: "Is it right to break a promise to prevent harm?" (deontology vs consequentialism)
  - Q4 key `truth_over_relationship`: "Should a person always tell the truth even if it destroys a relationship?" (virtue vs care)
  - Q5 key `punish_innocent`: "Is it okay to punish the innocent if it protects the group?" (rights vs utilitarian)
- **D-03:** Same yes/no/it_depends answer pattern as existing questions. Same decree-tile button style.
- **D-04:** Detection mapping follows existing pattern — `'no'` answer triggers conflict:
  - `break_promise='no'` → flags consequentialist choices
  - `truth_over_relationship='no'` → flags virtue choices
  - `punish_innocent='yes'` → flags rights-dimension choices (note: 'yes' is the trigger here, not 'no')

### Moral Trajectory (TRAJECTORY-01 through TRAJECTORY-04)
- **D-05:** `moral_weight` mapped directly from scenario weight: low=1, medium=2, heavy=3, reflective=0.
- **D-06:** Fixed round split per requirements: early = rounds 1-2, late = rounds 5+. Middle rounds (3-4) excluded from trajectory comparison.
- **D-07:** Trajectory uses weight-adjusted framework counts. A virtue choice in a heavy round (weight 3) counts 3x toward trajectory. High-stakes choices reveal more about reasoning.
- **D-08:** Meaningful shift threshold: dominant framework must change between early and late rounds. If same, show consistency label instead.
- **D-09:** "Your Moral Arc" section sits after "Morals vs Ethics" (#3 position) in end screen order.
- **D-10:** `consistency_score` is qualitative label only — never show a number or percentage. High: "Your reasoning was remarkably consistent — you held [X] through escalating stakes." Low: trajectory narrative shown instead.
- **D-11:** Arc narrative names the shift AND explains the philosophical meaning. Example: "In the early rounds you reasoned from care ethics. By the final rounds, you shifted to deontology — from protecting people you know to holding rules regardless of cost. Philosophers call this moving from relational to principled reasoning."

### Conscience Cost (CONSCIENCE-01, CONSCIENCE-02)
- **D-12:** ConsequenceReveal gets a visual-only amber border when a moral conflict was registered for that round. No additional text — the existing in-round moral conflict indicator already communicates the tension.
- **D-13:** End screen "moral friction" count framed neutrally: "Your choices conflicted with your stated values in X of Y rounds." Followed by: "That tension is the point."

### Deontological Awareness Prompt (DEONTO-01, DEONTO-02)
- **D-14:** Inline glass-card banner appears above the 3 decree tiles when scenario loads. Does NOT block choice buttons — they remain visible below.
- **D-15:** Prompt appears on scenario load (not after tapping a choice). Check at render time whether any of the scenario's choices have care-tagged frameworks.
- **D-16:** Scope is honesty + lie_to_protect only (per DEONTO-01). Player must have ranked honesty #1 AND answered "no" to lie_to_protect. Only this specific combo triggers the prompt. v1 implementation — can extend to other combos later.
- **D-17:** Prompt text: "This choice prioritizes loyalty over truth. You declared truth matters most." Dismissible by tapping anywhere on the banner.
- **D-18:** Dismissal logged as flags on the choice_history entry: `awareness_prompt_shown: true` and `awareness_prompt_dismissed: true`. End screen can reference this.

### Virtue Reputation (VIRTUE-01, VIRTUE-02)
- **D-19:** `virtue_streak` tracks consecutive virtue-tagged choices. Resets on non-virtue. Longest streak reported on end screen.
- **D-20:** "Character" subsection: counts virtue choices in heavy-weight rounds specifically. "Virtue was your choice in X of Y high-stakes rounds." Simple count, not a comparison ratio.
- **D-21:** Character section hidden entirely if fewer than 2 virtue choices made.

### Rights Awareness (RIGHTS-01, RIGHTS-02)
- **D-22:** Claude tags ALL qualifying scenarios across all 3 packs with `rights_dimension: true`. Any scenario where an individual/minority is at risk from group benefit qualifies.
- **D-23:** Rights awareness line on end screen: "In X of Y rights-critical scenarios, you chose to protect individual rights over group benefit." Only shown when ≥2 rights-dimension scenarios were played.

### Cultural Context (CULTURE-01, CULTURE-02)
- **D-24:** `ethicalLens` field added to each pack object in scenarios.js. Uses REQUIREMENTS.md wording verbatim:
  - Kingdom: "What does a ruler owe?"
  - Real-World: "What do you owe the people around you?"
  - Futures: "What do you owe the people who come after you?"
- **D-25:** HostSetup pack card renders ethicalLens as a subtitle below the pack description.
- **D-26:** End screen footer shows pack name + ethical lens + "Your choices were measured in the context of [lens]. A different context might have drawn different reasoning."

### End Screen Section Order
- **D-27:** Full end screen order after all additions:
  1. Your Framework (dominant)
  2. Your Morals vs Your Ethics (value/stance conflicts)
  3. Your Moral Arc (trajectory — only if shift detected)
  4. Character (virtue streak — only if ≥2 virtue choices)
  5. Moral Friction count
  6. Where the Conflict Lived (framework conflicts)
  7. Rights Awareness (only if ≥2 rights scenarios played)
  8. The Framework You Used Least
  9. Cultural Context footer
  10. Your Choice Log

### Empty State Handling
- **D-28:** Sections that don't meet their data threshold are hidden entirely — no "not enough data" messages. Players only see sections where the game has something meaningful to say.

### Claude's Discretion
- Exact CSS styling for the awareness prompt banner (glass-card variant, animation)
- Internal structure of trajectory computation (function signature, intermediate data structures)
- Which specific scenarios across the 3 packs qualify for `rights_dimension: true`
- Exact copy for arc narratives for each possible framework shift combination
- Whether `virtue_streak` is computed in detection.js or inline in FrameworkProfile.jsx

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — All 17 requirements: BASELINE-01–03, TRAJECTORY-01–04, CONSCIENCE-01–02, DEONTO-01–02, VIRTUE-01–02, RIGHTS-01–02, CULTURE-01–02
- `.planning/ROADMAP.md` §Phase 12 — Success criteria (10 items), phase goal, dependencies

### Detection Logic
- `src/lib/detection.js` — `computeProfile()`, `findConflicts()`, `findMoralConflicts()`, `VALUE_FRAMEWORK_MAP` — all functions to extend
- `src/lib/frameworks.js` — FRAMEWORKS definitions and CONFLICT_PAIRS array
- `src/lib/__tests__/detection.test.js` — Existing test patterns for detection logic

### Baseline
- `src/pages/Baseline.jsx` — Current 2 stance questions + 5 value ranking; adding 3 new stance questions here
- `src/pages/Baseline.module.css` — Existing baseline styles

### End Screen
- `src/components/FrameworkProfile.jsx` — End screen component; adding Moral Arc, Character, Moral Friction, Rights Awareness, Cultural Context sections
- `src/components/FrameworkProfile.module.css` — Existing end screen styles
- `src/components/ConsequenceReveal.jsx` — Adding amber border for moral conflict rounds (CONSCIENCE-01)
- `src/components/ConsequenceReveal.module.css` — Existing consequence reveal styles

### Game Loop
- `src/pages/Play.jsx` — In-round view; adding deontological awareness prompt banner
- `src/pages/Host.jsx` — `endSession()` computes profiles; needs trajectory + virtue streak computation

### Scenario Packs
- `src/lib/scenarios.js` — Pack registry; adding `ethicalLens` field to pack objects
- `src/lib/scenarios/packs/kingdom-arc.js` — Kingdom pack; needs `rights_dimension` tags on qualifying scenarios
- `src/lib/scenarios/packs/real-world-modern.js` — Real-world pack; needs `rights_dimension` tags
- `src/lib/scenarios/packs/futures.js` — Futures pack; needs `rights_dimension` tags

### Prior Phase Context
- `.planning/phases/07-moral-profile-data-layer/07-CONTEXT.md` — Baseline data model decisions (D-04 through D-13)
- `.planning/phases/11-moral-conflict-detection-end-screen-ai-hooks/11-CONTEXT.md` — Moral conflict detection decisions (D-01 through D-13)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `detection.js`: `findMoralConflicts()` already handles stance-based conflict detection with per-round dedup — extend with 3 new stance checks following same pattern
- `detection.js`: `computeProfile()` returns `{ dominant, counts, leastUsed }` — extend with `trajectory` and `consistency_score` return values
- `FrameworkProfile.jsx`: Framer Motion stagger pattern (containerVariants, sectionVariants) — reuse for all new sections
- `FrameworkProfile.module.css`: Glass card sections with eyebrow labels — add new section styles following same pattern
- `Baseline.jsx`: STANCE_QUESTIONS array with key/text/options — add 3 new entries to this array
- `ScenarioCard.module.css`: Decree-tile button styles — already reused in Baseline for stance answers

### Established Patterns
- Detection functions are pure (no Supabase calls) — take choiceHistory + player data, return computed results
- End screen sections use conditional rendering: `{conflicts.length > 0 && <section>...</section>}` — same pattern for new conditional sections
- `endSession()` in Host.jsx computes profiles with Promise.all batch writes — add trajectory + virtue computation there
- Pack schema uses JSDoc @typedef in scenarios.js — add `ethicalLens` and `rights_dimension` to typedef
- In-round moral conflict indicator uses 2200ms animation-delay — awareness prompt should appear earlier (on load)

### Integration Points
- `Baseline.jsx` STANCE_QUESTIONS array: add 3 new entries
- `detection.js` `findMoralConflicts()`: add 3 new stance checks
- `detection.js` `computeProfile()`: extend return type with trajectory, consistency_score, virtue_streak
- `FrameworkProfile.jsx`: add 5 new conditional sections
- `ConsequenceReveal.jsx`: add amber border class when moral conflict detected
- `Play.jsx`: add awareness prompt banner component
- `Host.jsx` `endSession()`: compute new profile fields
- All 3 pack files: add `rights_dimension: true` to qualifying scenarios
- `scenarios.js` pack objects: add `ethicalLens` string field
- `HostSetup.jsx`: render ethicalLens subtitle on pack cards

</code_context>

<specifics>
## Specific Ideas

- Arc narrative should explain the philosophical meaning of framework shifts — not just name them. Example: "Philosophers call this moving from relational to principled reasoning."
- Awareness prompt copy is specified: "This choice prioritizes loyalty over truth. You declared truth matters most."
- Cultural context wording is locked from REQUIREMENTS.md — use verbatim.
- Moral friction framing: "That tension is the point." — ties back to the game's central thesis.
- End screen should feel like layers of insight being revealed, each building on the last — not a report card.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 12-ethical-framework-depth*
*Context gathered: 2026-03-30*
