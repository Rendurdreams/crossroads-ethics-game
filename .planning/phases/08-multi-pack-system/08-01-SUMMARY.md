---
phase: 08-multi-pack-system
plan: 01
subsystem: data
tags: [scenarios, packs, content, supabase, migration, jsdoc]

# Dependency graph
requires:
  - phase: 06-kingdom-ui-overhaul
    provides: kingdom-arc pack shape as canonical structure reference

provides:
  - realWorldModernPack: 6 contemporary dilemmas + reflection round (social media, reference ethics, bystander, whistleblowing, housing solidarity, algorithmic bias)
  - futuresPack: 6 near-future dilemmas + reflection round (AI companion, cognitive enhancement, germline editing, predictive surveillance, water rationing, behavioral scoring bias)
  - Updated packs[] registry in scenarios.js exporting all 3 packs
  - JSDoc schema documenting full ScenarioPack / PackScenario / PackChoice shape
  - SQL migration adding pack_id column to sessions table
  - ai_generated + generator_prompt fields on all 3 packs (AI-03 fulfilled)

affects: [08-02-pack-selection-ui, 08-03-pack-persistence, host-setup, host, play]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Pack-prefixed scenario IDs (rw-round-N, ft-round-N) prevent collision across packs
    - All pack files export a single named constant matching the kingdom-arc object shape exactly
    - JSDoc @typedef blocks in scenarios.js enable AI generation tools to read the pack schema

key-files:
  created:
    - src/lib/scenarios/packs/real-world-modern.js
    - src/lib/scenarios/packs/futures.js
    - supabase/migration-08-pack-id.sql
  modified:
    - src/lib/scenarios/packs/kingdom-arc.js
    - src/lib/scenarios.js

key-decisions:
  - "realWorldModernPack named 'Common Ground' — contemporary interpersonal and community dilemmas at college-maturity tone"
  - "futuresPack named 'The Weight of Tomorrow' — near-future personal dilemmas in ~2040 context, no space opera framing"
  - "Both new packs: 7 rounds (6 playable + 1 reflection) per D-07"
  - "Framework distribution balanced across 18 choice slots per pack: care/consequentialism/deontology/virtue all present"
  - "JSDoc comment placed above packs export — makes schema machine-readable for AI generation tools (D-13)"

patterns-established:
  - "New pack = new file in src/lib/scenarios/packs/, single named export, added to packs[] in scenarios.js"
  - "Pack-prefixed IDs: {prefix}-round-N where prefix is 2-3 chars unique to the pack"

requirements-completed: [PACK-01, PACK-02, PACK-05, AI-03]

# Metrics
duration: 4m28s
completed: 2026-03-28
---

# Phase 8 Plan 01: Multi-Pack System Content Foundation Summary

**Two new scenario packs (14 original dilemmas) authored and registered in the pack system alongside an AI-ready JSDoc schema and SQL migration for pack_id persistence**

## Performance

- **Duration:** 4m 28s
- **Started:** 2026-03-28T03:49:55Z
- **Completed:** 2026-03-28T03:54:23Z
- **Tasks:** 2
- **Files modified:** 5 (2 created new pack files, 1 SQL migration, 1 pack updated, 1 registry updated)

## Accomplishments

- Authored `real-world-modern` pack ("Common Ground"): 6 contemporary dilemmas covering social media accountability, professional reference ethics, online harassment as a bystander, academic whistleblowing, housing solidarity, and algorithmic bias disclosure — all with framework tags, world impacts, and pack-prefixed IDs
- Authored `futures` pack ("The Weight of Tomorrow"): 6 near-future dilemmas set in ~2040 covering AI companion ethics, cognitive enhancement equity, germline editing consent, predictive wellness surveillance, water rationing committee decisions, and employer behavioral scoring bias
- Updated `scenarios.js` registry to export all 3 packs with JSDoc schema and `getPackById` supporting all new IDs with fallback to kingdom-arc
- Added `ai_generated: false` and `generator_prompt: null` to all 3 packs (AI-03 requirement)
- Created `migration-08-pack-id.sql` with idempotent `ADD COLUMN IF NOT EXISTS pack_id text DEFAULT 'kingdom-arc'`

## Task Commits

1. **Task 1: Author real-world-modern and futures scenario packs** - `8b7ff3c` (feat)
2. **Task 2: Update kingdom-arc, scenarios.js registry, JSDoc schema, and SQL migration** - `48642db` (feat)

## Files Created/Modified

- `src/lib/scenarios/packs/real-world-modern.js` — "Common Ground" pack, 7 scenarios, exports `realWorldModernPack`
- `src/lib/scenarios/packs/futures.js` — "The Weight of Tomorrow" pack, 7 scenarios, exports `futuresPack`
- `src/lib/scenarios/packs/kingdom-arc.js` — Added `ai_generated: false` + `generator_prompt: null`
- `src/lib/scenarios.js` — Added imports for 2 new packs, `packs = [kingdomArcPack, realWorldModernPack, futuresPack]`, JSDoc @typedef schema for PackChoice / PackScenario / ScenarioPack
- `supabase/migration-08-pack-id.sql` — Adds `pack_id text DEFAULT 'kingdom-arc'` column to sessions table

## Decisions Made

- Named the real-world-modern pack "Common Ground" — captures the interpersonal and civic theme without being prescriptive
- Named the futures pack "The Weight of Tomorrow" — grounds the near-future framing in consequence rather than wonder
- Framework distribution in new packs: care appears across multiple rounds including self-directed care (housing, cognitive enhancement) — this reflects how care ethics applies to proximity including proximity to oneself
- World impact calibration matches kingdom-arc range: -18 to +18 per dimension. Positive peaks reserved for genuinely courageous choices (courage: +18 in "The Log" for filing formal equity complaint)
- Content notes applied to rounds with systemic stakes (housing insecurity, behavioral monitoring) per CLAUDE.md design rules

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- Verification script in PLAN.md used `require()` syntax but pack files are ES modules. Adapted verification to use `node --input-type=module` with `import` syntax — same validation, same results.

## User Setup Required

**Run SQL migration before deploying Phase 8 code:**

```sql
-- In Supabase SQL Editor:
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS pack_id text DEFAULT 'kingdom-arc';
```

See `supabase/migration-08-pack-id.sql` for the full migration with verification query.

## Next Phase Readiness

- Pack content foundation complete — Plans 02 and 03 can proceed to HostSetup UI and pack persistence wiring
- `getPackById('real-world-modern')` and `getPackById('futures')` resolve correctly
- `getPackById(null)` and `getPackById('unknown')` fall back to kingdom-arc safely
- Backward compat `export const scenarios = kingdomArcPack.scenarios` preserved — worldState.test.js (10 tests) still passes
- SQL migration ready to run in Supabase dashboard before Phase 8 deployment

---
*Phase: 08-multi-pack-system*
*Completed: 2026-03-28*
