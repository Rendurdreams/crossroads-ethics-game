# Phase 1: Foundation - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Stand up the Vite project, configure the Supabase schema + RLS, and implement all `/lib` pure-logic modules. No UI, no React components — this phase produces the data layer and backend foundation that every subsequent phase builds on.

</domain>

<decisions>
## Implementation Decisions

### Project Scaffolding
- **D-01:** Phase 1 includes running `npm create vite` and standing up the full project structure. Dependencies installed: `react-router-dom`, `@supabase/supabase-js`, `qrcode.react` (Phase 8, install now to avoid friction later is optional — defer if desired). `/src/lib/` directory created as part of this phase.
- **D-02:** Environment setup included: `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Service role key is NOT prefixed with `VITE_` — noted in a `.env.example` file with a clear warning.

### Claude's Discretion
- **Reflections table:** Not discussed. Claude decides structure — either a `reflections` table (round_number, player_id, session_id, text, submitted_at) or storing reflection text in the `players` table as a jsonb field. Either is acceptable for v1.
- **Pass/abstain counter:** Not discussed. DATA-05 says passes = no-row in choices. For the "X of Y submitted" counter, Claude decides: options include a `round_submissions` tracking table, a jsonb field on players, or accepting that passers simply don't appear in the submitted count (host sees fewer than total — acceptable for a classroom context). Keep it simple.
- **Lib verification:** Not discussed. A simple Node test script (`node src/lib/detection.test.js`) or browser console test is sufficient for the "days" timeline. Jest setup is not required.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specification
- `CLAUDE.md` — Full game spec: schema design (sessions/players/choices tables with exact columns), framework detection logic, world state update logic, all 6 scenario rounds with framework tags and world impacts. This is the primary source of truth for all /lib implementation.

### Supabase Patterns
- `SKILL-supabase.md` — RLS policies for anonymous real-time multiplayer, JSONB update patterns, room code generation, channel subscription patterns. Contains the exact SQL for open RLS policies appropriate for a classroom app.

### Requirements
- `.planning/REQUIREMENTS.md` §Infrastructure (INFRA-01–04) — Exact acceptance criteria for schema, RLS, real-time, and env discipline.
- `.planning/REQUIREMENTS.md` §Scenarios & Framework Logic (DATA-01–05) — Acceptance criteria for all /lib modules including pass/abstain behavior.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — project is greenfield. `npm create vite` produces the base scaffold.

### Established Patterns
- None yet — this phase establishes the patterns all subsequent phases follow.

### Integration Points
- `/src/lib/supabase.js` — Supabase client singleton. All subsequent phases import from here.
- `/src/lib/scenarios.js` — Scenario library. Phase 3 (game loop) reads this to render rounds.
- `/src/lib/detection.js` — computeProfile(), findConflicts(). Phase 4 (end state) calls these.
- `/src/lib/worldState.js` — applyChoicesToWorld(). Phase 3 calls this when host closes a round.

</code_context>

<specifics>
## Specific Ideas

- The CLAUDE.md schema spec is the definitive source — implement it exactly as written. The `framework_counts` and `choice_history` jsonb fields on the `players` table are pre-aggregation structures; `computeProfile()` reads from `choice_history`.
- SKILL-supabase.md has room code generation utility ready to copy.
- Service role key note: INFRA-04 says it should never be exposed via `VITE_` prefix. For v1, the host dashboard runs as a client — session update operations (close round, advance round) use the anon key with open RLS policies. This is acceptable for a classroom app. Document clearly in `.env.example`.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-25*
