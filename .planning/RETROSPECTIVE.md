# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — The Crossroads MVP

**Shipped:** 2026-03-27
**Phases:** 7 | **Plans:** 18 | **Tasks:** 24

### What Was Built

- Supabase schema (4 tables), RLS policies, real-time subscriptions — full backend before any UI
- Pure-function game brain: 6-round scenario library, 4-framework ethical detection, world state engine — 24 passing tests
- Host dashboard: session creation, live roster, vote tally, round control, world state panel
- Player view: join flow, scenario + 3 choices, optimistic choice lock, consequence reveal, framework label
- End state: framework profiles, conflict maps, reflection round, group breakdown on host
- Deploy: Netlify build, mobile CSS audit, 25-concurrent subscription load test
- Visual overhaul: glass-morphism surfaces, Framer Motion cinematic transitions, amber gradients, Playfair Display
- Kingdom UI: SVG KingdomMap with 4 reactive landmarks, Roman numeral decree tiles, war council atmospheric copy

### What Worked

- **Phase ordering was right** — data layer first (Phase 1), then session flow (2), then game loop (3). Never built UI on top of unverified data.
- **Parallel wave execution** — Plans 06-01 and 06-02 ran simultaneously (no file overlap). Saved meaningful time on Wave 1.
- **CSS Modules throughout** — Zero style conflicts across parallel plan execution. Isolation was tight.
- **CONTEXT.md + UI-SPEC.md before planning** — Phase 6 had zero ambiguity at execution time. Decisions locked in context meant planner wrote concrete plans.
- **GSD plan checker** caught structural issues before execution. All verifications passed first-pass.

### What Was Inefficient

- **Some SUMMARY.md one-liners captured checkpoint notes** (e.g., "Rule 3 - Blocking") rather than clean deliverable descriptions. Milestone archive accomplishment list was noisy.
- **PROJECT.md fell behind** — Requirements section wasn't updated at each phase transition; needed full reconciliation at milestone completion. `evolve_project_full_review` was the fix but it's retroactive.
- **Phase 05.1 inserted mid-stream** — The visual overhaul was an unplanned phase. Not inefficient per se (the feature was right), but the planning order shifted. Pre-milestone scope audit would have caught this earlier.

### Patterns Established

- **Pack-driven session length** — `getPlayableScenarios(getDefaultPack()).length` at session creation. No pre-game configuration UI needed.
- **CSS tier class pattern** — `flourishing` / `neutral` / `declining` toggled by `getTier(value)`. Extends naturally to any landmark or meter.
- **Broadcast channel for timer sync** — Avoids Supabase schema churn; timer state is ephemeral, not persisted.
- **War council register** — All player-facing waiting copy uses: council, decree, realm, counsel. Atmospheric copy should match game framing register.

### Key Lessons

1. **Lock design decisions in CONTEXT.md before planning** — Phase 6 had a detailed CONTEXT.md (D-01 through D-16) and UI-SPEC.md. The planner wrote concrete, unambiguous plans. Earlier phases with thinner context had more executor-level interpretation.
2. **Parallel worktree isolation works** — CSS Modules + worktree isolation means Wave 1 parallel execution never had file conflicts.
3. **The GSD plan checker adds real value** — It caught wave dependency issues and shallow acceptance criteria before execution began. One pass of revision is cheaper than one failed executor run.
4. **Presentation framing is a first-class design constraint** — The kingdom aesthetic wasn't cosmetic. It changed the emotional register of every waiting state, button label, and heading. Treat tone/framing as a spec input, not a polish step.

### Cost Observations

- Model mix: planner=opus, executor/checker/verifier=sonnet
- Sessions: 3 sessions to complete full v1.0
- Notable: Parallel wave execution (Wave 1 of Phase 6) reduced wall-clock time meaningfully for the UI phase — the two largest files (KingdomMap + Play view) built simultaneously with zero conflict.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 7 | 18 | First milestone — baseline established |

### Cumulative Quality

| Milestone | Tests | Coverage | Key Libraries Added |
|-----------|-------|----------|---------------------|
| v1.0 | 24 | Core data layer | framer-motion, qrcode.react |

### Top Lessons (Verified Across Milestones)

1. Lock design decisions before planning — context doc quality directly predicts plan quality
2. Parallel execution requires zero file overlap — CSS Modules + worktrees enforce this automatically
