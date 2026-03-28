# Phase 8: Multi-Pack System — Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 8 delivers:
1. Two new scenario packs written and exported (`real-world-modern`, `futures`)
2. Pack selection UI on HostSetup — 3 horizontal cards, kingdom-arc pre-selected
3. Pack persistence: `pack_id` column on sessions table, written on "Open the Gates", read by Host and Play via `session.pack_id`
4. AI-ready pack schema: `ai_generated` and `generator_prompt` fields added to pack object shape

New capabilities (live AI calls, scenario editing, player-facing pack info) are out of scope for this phase.

</domain>

<decisions>
## Implementation Decisions

### Pack Selection UI

- **D-01:** 3 horizontal cards side-by-side on HostSetup, equal visual weight. Selected card gets amber border/glow highlight.
- **D-02:** Each card shows: pack name, scenario count, setting/genre tag, and 1-line description.
- **D-03:** Kingdom-arc starts pre-selected. "Open the Gates" button is always enabled — no forced choice.
- **D-04:** Host can switch selection at any time before opening; last selection before clicking "Open the Gates" wins.

### New Scenario Content

- **D-05:** Real-world modern pack tone: same weight as original (Destiny/Marcus/Camille level) — adult college tone, content notes on heavy rounds, real interpersonal/community stakes.
- **D-06:** Sci-fi/future pack framing: near-future grounded person (player is themselves in ~2040). Personal scenarios involving AI in daily life, genetic decisions for a family member, surveillance trade-offs, resource scarcity. Not space opera, not institutional authority — grounded and personal.
- **D-07:** Both new packs: 6 playable dilemmas + 1 free-text reflection round = 7 rounds total. `total_rounds` will differ from kingdom-arc's 8.
- **D-08:** Scenario structure is identical to kingdom-arc: `{ id, title, round, weight, contentNote, moralTension, teaches, text, choices[] }`. Each choice has `{ choiceIndex, text, frameworks[], consequence, worldImpact }`.

### Pack Persistence

- **D-09:** Add `pack_id text DEFAULT 'kingdom-arc'` column to sessions table via SQL migration.
- **D-10:** HostSetup writes `pack_id` and `total_rounds` to Supabase on "Open the Gates" click (same UPDATE call that currently writes `total_rounds` — extend it).
- **D-11:** Host.jsx and Play.jsx resolve pack via `getPackById(session.pack_id)` after fetching session on mount. Remove module-level `getDefaultPack()` call from both files. Pack resolves to `packs[0]` (kingdom-arc) as fallback if `pack_id` is null/unrecognized.

### AI-Ready Pack Schema

- **D-12:** Add `ai_generated: false` and `generator_prompt: null` to the top level of every pack object. All hand-written packs use these defaults. Future AI-generated pack sets `ai_generated: true` and stores the prompt used.
- **D-13:** Update `kingdom-arc.js` to include the new fields. Document the full pack schema shape in `scenarios.js` as a JSDoc comment so AI generation tools can read it.

### Claude's Discretion

- Specific scenario titles and scenario text for the two new packs — Claude writes the full content following the kingdom-arc structure (moral tension, teaches, 3 choices with framework tags and world impacts).
- World impact values for new scenarios — calibrate to kingdom-arc range (-14 to +16 per dimension).
- Content note text for heavy rounds in new packs.
- CSS styling for selected vs unselected pack cards — should match existing glass-morphism palette (amber glow on selected, muted on unselected).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Pack Structure
- `src/lib/scenarios.js` — Pack registry (`packs[]`), `getPackById()`, `getDefaultPack()`, `getScenarioByRound()` — the API surface that Host and Play consume
- `src/lib/scenarios/packs/kingdom-arc.js` — Canonical pack shape reference — every new pack must match this structure exactly

### Integration Points
- `src/pages/HostSetup.jsx` — Pack selection UI lives here; currently hardcoded to `getDefaultPack()`
- `src/pages/Host.jsx` — Resolves pack via `getDefaultPack()` at module level (line 6); needs to move to `getPackById(session.pack_id)` post-session fetch
- `src/pages/Play.jsx` — Same issue (line 7); same fix pattern

### Schema
- `supabase/migration-07-moral-baseline.sql` — Migration pattern to follow for adding `pack_id` column to sessions table

### Requirements
- `.planning/REQUIREMENTS.md` §Scenario Packs — PACK-01 through PACK-05
- `.planning/REQUIREMENTS.md` §AI Layer Hooks — AI-03 (pack schema `ai_generated` + `generator_prompt` fields)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packs[]` array in `scenarios.js` — already a registry; just push new packs into it
- `getPackById(id)` — already exists, falls back to `packs[0]`; Host/Play can use this once `session.pack_id` is available
- HostSetup pack card (`.packCard`, `.packName`, `.packCount`, `.packDescription`) — existing styles to extend for multi-select; selected state needs new CSS class
- `supabase/migration-07-moral-baseline.sql` — migration pattern is idempotent `ADD COLUMN IF NOT EXISTS`; use same pattern for `pack_id`

### Established Patterns
- State management: Host/Play both fetch session on mount then subscribe to changes — pack resolves from the fetched session, no extra Supabase call needed
- CSS Modules + glass-morphism palette — amber glow (`#c89b3c` / `--amber`) for selected state; muted glass for unselected
- `openLobby()` in HostSetup — already calls Supabase UPDATE before navigating; extend this call to include `pack_id`

### Integration Points
- HostSetup → sessions UPDATE on "Open the Gates" — add `pack_id` and `total_rounds` here
- Host.jsx module-level `const pack = getDefaultPack()` → replace with state initialized from `session.pack_id` after mount fetch
- Play.jsx same pattern
- `src/lib/scenarios.js` `packs[]` array — add imports and push for both new packs

</code_context>

<specifics>
## Specific Ideas

- Pack card selected state: amber border + subtle amber glow (consistent with existing amber palette) — unselected cards slightly dimmed opacity
- Pack setting/genre tag on card: small label below scenario count (e.g., "fantasy" / "real-world" / "near-future") — matches kingdom-arc's `setting` field already on the pack object
- Real-world pack: scenarios involving social media accountability, workplace whistleblowing, community resource allocation, AI in schools/workplaces — college-maturity tone, same bystander POV as original
- Sci-fi pack: personal-scale near-future dilemmas — your AI assistant's ethics, a family member's genetic enhancement decision, your employer's surveillance AI, community rationing after climate disruption

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 08-multi-pack-system*
*Context gathered: 2026-03-28*
