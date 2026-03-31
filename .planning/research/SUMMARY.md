# Project Research Summary

**Project:** The Crossroads — Signal Lost v2.0
**Domain:** Multiplayer educational ethics simulation — role-based senator scenario, discussion facilitation, persistent world consequences, and instructor assessment
**Researched:** 2026-03-30
**Confidence:** HIGH

## Executive Summary

Signal Lost v2.0 is an additive milestone on a proven React + Supabase real-time platform. The existing foundation — multi-pack scenario system, moral baseline survey, framework detection, host round control, animated map, walk mechanic, scribe record — is fully functional. This research covers what changes, not what already works. The core architectural recommendation is to add Signal Lost as a pack-driven extension that specializes behavior through data, not new code paths. The engine stays generic; the pack carries the new behavior.

The single most important structural addition is the senator profile system. Without per-player asymmetric stakes, Signal Lost is cosmetically a senator game but functionally identical to the kingdom arc — just a scenario with different text. Profiles are the differentiator. They must be persisted to Supabase at join time, not held in local state, and they must drive stake text on every round card. Everything else (discussion mode, break flags, axis renaming, grading rubric) layers on top of a working profile system.

The critical risks cluster around two themes: silent data corruption and pacing control. World axis key collisions (`SOL` vs `solidarity`) fail silently with no error logs. Break flags stored client-side vanish on page reload. Senator profiles assigned in local state drift mid-session. And in Discussion Mode, if the Continue button ever renders on a player's phone rather than the host's screen, a student can disrupt the entire classroom session. These are all preventable if caught at schema design time — they become rewrites if caught during a live presentation.

---

## Key Findings

### Recommended Stack

The existing stack requires only two new packages. Everything else is already installed and appropriate.

**New dependencies:**
- `recharts@^2.15.0` — axis timeline line chart for Solo Mode end screen. React 19-compatible (GitHub Issue #4558 resolved). 105KB gzipped, acceptable. Do NOT use v3.x — it has breaking API changes in active development as of 2026.
- `@react-pdf/renderer@^4.3.0` — assessment PDF export for grading rubric. React 19 supported since v4.1.0. Must be lazy-imported via `React.lazy()` — 340KB gzipped is acceptable only when deferred to end-screen load.

**Walk mechanic upgrade (no new dependency):** Framer Motion's `drag` prop (`motion.div drag="x"` + `useMotionValue`) handles the Signal Lost corridor walk. Framer Motion is already in the bundle. Do not add `react-draggable`.

**Core technologies (unchanged, locked):**

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.4 | Component state, Supabase subscription hooks |
| Vite | 8.0.1 | Dev server, bundler |
| @supabase/supabase-js | 2.100.0 | Database, real-time channels, RLS |
| framer-motion | 11.18.2 | Page transitions + walk mechanic drag |
| gsap | 3.14.2 | AnimatedMap animations, fracture effects |
| react-router-dom | 7.13.2 | Client-side routing |
| CSS Modules | native | Scoped styling |

**New schema columns (all additive, no destructive changes):**

```sql
ALTER TABLE players ADD COLUMN senator_profile_id text;
ALTER TABLE players ADD COLUMN axis_history jsonb DEFAULT '[]';
ALTER TABLE players ADD COLUMN closing_reflection text;
ALTER TABLE sessions ADD COLUMN mode text DEFAULT 'discussion';
ALTER TABLE sessions ADD COLUMN break_flags jsonb DEFAULT '{}';
```

The `world_state` column is already `jsonb` and key-agnostic — Signal Lost sessions write `{ CT: 65, HD: 65, SOL: 65, ACC: 65 }` at creation. No column type change needed.

---

### Expected Features

**Must have (table stakes — game cannot function without these):**

- **Senator profile assignment + display** — Role-based simulations require per-player identity with personal stakes. Without this, Signal Lost is just a renamed scenario pack.
- **Per-round personal stake panel** — The "YOUR STAKE" callout above each scenario card. This is the structural differentiator. 48 stake strings (6 profiles x 8 rounds), pure data, low implementation complexity.
- **Facilitator-controlled pacing (Discussion Mode)** — Without host-controlled pause between rounds, the game cannot be used in a classroom. Auto-advance removes the pedagogical discussion window.
- **Discussion prompts accessible to facilitator** — Pre-written per-round prompts (2-3 per round). Static data. Required for facilitated classroom use.
- **Break flags: permanent world-state markers** — The "creeping complicity" mechanic. Without persistence across rounds, R8's scribe record loses its specificity. This is the data pipeline for the game's central lesson.
- **Signal Lost scenario pack (8 rounds, full data)** — All choices tagged with framework, axis deltas, conscience layer, break flag triggers, per-profile stakes, discussion prompts. Largest single authoring task.
- **Profile-aware conflict alerts (between rounds)** — Extends existing `findMoralConflicts()`. Fires when a choice contradicts the player's senator profile's implied stance.

**Should have (differentiators — deliver the value that justifies building this):**

- **Profile breakdown in Discussion Mode** — Post-round host view showing which profile voted which way. Hidden by default; facilitator-revealed. Surfaces the structural effect of personal interest on decision-making.
- **Conflict spotlight (conditional)** — Only fires when the pre-defined conflict pair for a round actually split. High pedagogical value when it fires; zero noise when it doesn't.
- **Axis trajectory timeline (Solo Mode end screen)** — Recharts multi-line chart showing all 4 axes across 8 rounds. No comparable ethics simulation does longitudinal consequence visualization at this granularity.
- **Dynamic scribe record reading break flags** — R8 record references specific flags triggered. A player who triggered R1-ghost + R4-sealed reads different text than one who triggered neither.
- **Grading rubric (instructor-facing)** — 4-dimension rubric directly tied to game mechanics. Separates "game" from "assessed assignment."

**Defer to post-milestone:**

- **Assessment export PDF** — New dependency, non-trivial layout, iOS Safari download failures. JSON export is sufficient for v2.0. PDF via server function is v2.1.
- **Custom discussion prompt input** — Facilitator can add their own prompt. Medium complexity, not blocking for classroom use.
- **Timer controls for Discussion Mode** — 3/5/10 min countdown on pause screen. Defer until core pause screen is stable.
- **Break flag visual animations on AnimatedMap** — Static markers acceptable for v2.0.

**Anti-features to avoid (these undermine the design):**

- Profile breakdown visible to players during voting (kills authentic reasoning)
- Framework scores visible to other players (turns it into a leaderboard)
- "Correct answer" indicator in Discussion Mode (sabotages the no-right-answer principle)
- Mid-round profile switching (breaks asymmetric stakes mechanic)
- Break flag redemption or healing (eliminates creeping complicity)
- Auto-advance in Discussion Mode (removes facilitator pacing control)

---

### Architecture Approach

Signal Lost specializes behavior through pack data, not new code paths. The engine reads `pack.profiles`, `pack.axisStart`, and `pack.axes` at session creation — kingdom arc continues to work unchanged. The core pattern is `if (pack.profiles) { ... }` appearing once per file, never scattered across components. The session status machine gains one new value (`discussion_pause`); no new routing is needed for player-facing pages. Break flags live at the session level in a dedicated `sessions.break_flags` column, separate from `world_state` — this separation keeps `applyChoicesToWorld()` clean and makes flags accessible to all subscribers via the existing session real-time channel.

**Build order (waves):**

- **Wave 1 — Data foundation:** `senatorProfiles.js`, Signal Lost pack file (8 rounds), `breakFlags.js`, `axisNarrative.js`, Supabase schema migrations, pack registry update
- **Wave 2 — Player-facing components:** `SenatorProfile.jsx`, `ScenarioCard.jsx` stake prop, `ConsequenceReveal.jsx` break flag announcement, `Baseline.jsx` signal-lost questions, `detection.js` STANCE_TRIGGERS, `Play.jsx` profile assignment + conflict alerts + solo routing, `AxisTimeline.jsx`, `SoloReflection.jsx`
- **Wave 3 — Host-facing components:** `DiscussionPauseScreen.jsx`, `AnimatedMap.jsx` + `WorldStatePanel.jsx` break flag rendering, `Host.jsx` Discussion Mode gate, `HostSetup.jsx` mode selector
- **Wave 4 — Grading route:** `GradingExport.jsx`, `/grading/:sessionId` route

**Major new components:**

| Component | Responsibility |
|-----------|---------------|
| `SenatorProfile.jsx` | Player profile card + current-round stake panel |
| `DiscussionPauseScreen.jsx` | Host pause between rounds: vote breakdown, profile grid, conflict spotlight, prompts |
| `AxisTimeline.jsx` | Recharts LineChart: 4 axes over 8 rounds |
| `SoloReflection.jsx` | Solo mode end screen: 8-round log, axis timeline, scribe, break flags, closing question |
| `GradingExport.jsx` | Instructor-only rubric view; read-only, no real-time subscriptions |

**New library files:**

| File | Responsibility |
|------|---------------|
| `senatorProfiles.js` | 6 profile objects with per-round stakes |
| `breakFlags.js` | `checkBreakFlags()`, flag definitions |
| `axisNarrative.js` | `computeAxisNarrative()` for signal-lost end copy |
| Signal Lost pack file | All 8 rounds, full scenario data |

---

### Critical Pitfalls

1. **World axis key collision (CT/HD/SOL/ACC vs trust/courage/solidarity/awareness)** — `applyChoicesToWorld()` has a `hasOwnProperty` guard that silently drops keys not in the world state. If any Signal Lost choice uses old key names, bars never move, no error is logged. Prevention: define `SIGNAL_LOST_AXES` as a named constant; validate every `worldImpact` key against it in a startup assertion or unit test. Write `{ CT: 65, HD: 65, SOL: 65, ACC: 65 }` to `sessions.world_state` at session creation.

2. **Senator profile not persisted to Supabase** — Profile assigned in local state only is lost on phone reload. The player's R3 stake no longer matches R1. Discussion Mode profile breakdown becomes incoherent. Prevention: `senator_profile_id` column on `players` table; write at join time; assignment function must be idempotent on re-join.

3. **Break flags stored client-side only** — If break flags live in React state rather than `sessions.break_flags`, they vanish on reload and the R8 scribe record cannot reference them. Prevention: session-level `break_flags jsonb` column; write on choice submission or at round close; host reads via existing session subscription.

4. **Discussion Mode Continue button accessible to players** — If Continue renders in Play.jsx rather than Host.jsx exclusively, any student can advance the round mid-discussion. This destroys facilitator pacing control. Prevention: Continue is Host.jsx-only, never in Play.jsx. Players in Discussion Mode see a static "Waiting for facilitator" screen. Establish this constraint at component design time.

5. **Baseline conflict triggers fire across packs** — Signal Lost STANCE_TRIGGERS must use `signal-r1` through `signal-r8` scenario ID prefixes. Kingdom-arc triggers use `round-1` through `round-7`. If both share the same pattern, kingdom-arc conflict alerts fire during Signal Lost play with wrong narrative text. Prevention: distinct scenario ID prefixes per pack; scope `matchCondition` by ID prefix.

6. **Discussion Mode double-advance race condition** — Two sequential Supabase writes (world state update + round increment) create a window where players see the new round number but the previous world state. Prevention: combine into a single atomic Supabase RPC function (`advance_round`); disable Continue button until the first write confirms.

---

## Implications for Roadmap

Signal Lost v2.0 has a clear wave-driven build order governed by data dependencies (you cannot render what you haven't defined) and integration risk (the most dangerous pitfalls are all in Wave 1 — catch them before any UI is built).

### Phase 1: Data Foundation + Schema
**Rationale:** Every subsequent component depends on the pack data shape and Supabase schema being settled. Building UI before the data model is locked produces rewrites. The axis key collision pitfall is silent — it must be validated before any world state UI is built.
**Delivers:** `senatorProfiles.js`, Signal Lost pack file (8 rounds, full data), `breakFlags.js`, `axisNarrative.js`, 5 Supabase schema migrations, pack registry update, axis key constant + validation assertion.
**Addresses:** Senator profile data model, break flag data model, axis naming migration, baseline question set definition
**Avoids:** Axis key collision (Pitfall 1), break flag persistence (Pitfall 4), scenario ID pack collision (Pitfall 6)

### Phase 2: Senator Profile System (Player-Facing)
**Rationale:** Profiles are the structural differentiator. Discussion Mode, conflict alerts, and the scribe record all depend on `senator_profile_id` existing on the player row. Build and validate profile assignment before anything that reads it.
**Delivers:** `SenatorProfile.jsx`, `ScenarioCard.jsx` stake prop, profile assignment on join (idempotent, persisted to Supabase), profile card accessible during play
**Addresses:** Per-round personal stake display (table stakes), profile visible throughout game
**Avoids:** Profile not persisted on reload (Pitfall 2), profile stake rendered from wrong round key (off-by-one indexing)

### Phase 3: Break Flags (Data + AnimatedMap Rendering)
**Rationale:** Break flags must be in the session before `ConsequenceReveal` can announce them and before R8 scribe can reference them. Building the rendering layer here means Phase 5's scribe work can rely on it.
**Delivers:** `sessions.break_flags` writes from `Host.jsx closeRound()`, `BreakFlagOverlay` / AnimatedMap marker layer, `WorldStatePanel.jsx` active flags list, `ConsequenceReveal.jsx` break flag announcement
**Addresses:** Permanent world-state markers (table stakes for R8 specificity)
**Avoids:** Break flags client-side only (Pitfall 4), break flags not propagated to host map (Pitfall 10)

### Phase 4: Discussion Mode
**Rationale:** Discussion Mode is table stakes for classroom use but depends on profiles (Phase 2) being assigned and sessions having a `mode` column. The host-only Continue button constraint must be architectural, not retrofitted.
**Delivers:** `sessions.mode` column, `DiscussionPauseScreen.jsx` (vote distribution, profile breakdown, conflict spotlight, discussion prompts), host-only facilitator controls, player "waiting for facilitator" screen, atomic `advance_round` RPC
**Addresses:** Facilitator-controlled pacing (table stakes), profile breakdown post-round, conflict spotlight (conditional), discussion prompts
**Avoids:** Continue button player-accessible (Pitfall 12), discussion mode double-advance race (Pitfall 3), profile breakdown identity reveal (Pitfall 7), conflict spotlight fires against absent profiles (Pitfall 9)

### Phase 5: Solo Mode End Screen + Grading
**Rationale:** Solo mode's end screen depends on `axis_history` being populated per-round and `closing_reflection` being captured. Grading export is a read-only view of data that already exists by this phase.
**Delivers:** `AxisTimeline.jsx` (Recharts), `SoloReflection.jsx`, `players.axis_history` writes per round, `players.closing_reflection` capture, `GradingExport.jsx`, `/grading/:sessionId` route, JSON assessment export
**Addresses:** Axis trajectory timeline (differentiator), grading rubric (table stakes for assessed use), assessment export JSON
**Avoids:** Timer auto-select skewing scribe pattern (Pitfall 8 / Pitfall 15), mobile PDF export failure (Pitfall 16 — PDF deferred; JSON only)

### Phase 6: Profile-Aware Conflict Alerts + Baseline Survey Update
**Rationale:** Conflict alert system extends existing `findMoralConflicts()` — lower risk, can be layered after the core game is playable. Baseline survey update is needed before any Signal Lost classroom session uses the full detection pipeline.
**Delivers:** Signal Lost STANCE_TRIGGERS in `detection.js`, `ConflictAlert.jsx` between-round interstitial, `Baseline.jsx` signal-lost question set, `howOthersChose.js` namespaced signal-lost reference data
**Addresses:** Profile-aware conflict alerts (table stakes), baseline survey alignment for detection
**Avoids:** Baseline conflict key collision (Pitfall 6), How Others Chose reference data collision (Pitfall 14)

### Phase Ordering Rationale

- **Data before UI:** The axis key collision pitfall is silent. Defining constants and validating pack data before any bar or meter is rendered means the failure is caught in tests, not in a classroom.
- **Profiles before Discussion Mode:** The Discussion Mode conflict spotlight, profile breakdown grid, and player waiting screen all read `senator_profile_id`. Building Discussion Mode without the profile column means building it twice.
- **Break flags before scribe:** The R8 scribe record's value proposition depends on referencing specific flags. If break flags aren't persisted by the time scribe is built, the template logic is built against a stub.
- **Solo Mode and Grading last:** These are clean consumers of already-persisted data. No new real-time complexity. Read-only views that fetch once on mount.

### Research Flags

Phases needing attention during planning:

- **Phase 1 (Signal Lost pack data authoring):** 8 rounds x (4 choices x full tagging) + 48 profile stakes + 24 discussion prompts + conflict pairs = substantial authoring work. Data quality determines pedagogical quality. Budget authoring time as implementation time, not documentation time.
- **Phase 4 (Discussion Mode — atomic RPC):** The `advance_round` RPC requires a Supabase database function. Straightforward but needs testing under artificial latency to validate race condition prevention before any classroom session.
- **Phase 5 (Walk Mechanic R6):** The existing `WalkMechanic.jsx` uses kingdom-arc labels and a button-reveal pattern for Choice III. Signal Lost R6 requires a position-hold interaction (stop at 0.85-0.99 for 3s triggers Choice III). This is a partial rewrite, not a reskin. Validate choice index emission against the delta table before wiring to the scenario.

Phases with standard patterns (skip research):

- **Phase 2 (Senator profiles):** Pure data + render. Profile card is a static display component. Assignment logic is 10 lines of JS. Well-understood pattern.
- **Phase 5 (JSON export):** `JSON.stringify` + Blob URL download. 5 lines of code.
- **Phase 6 (Conflict alerts):** Extends an existing detection function. New STANCE_TRIGGERS entries + a conditional interstitial component. No novel patterns.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Two new packages with confirmed React 19 compatibility via resolved GitHub issues. All other stack decisions pre-validated in prior milestones. |
| Features | HIGH | Table stakes derived from established role-based simulation literature. Differentiators validated as novel via negative search. Anti-features clearly identified. |
| Architecture | HIGH | Based on direct codebase read, not external research. Integration boundaries derived from reading actual source files. |
| Pitfalls (critical) | HIGH | Axis key collision, profile persistence, break flag persistence, Continue button — all confirmed via code inspection. |
| Pitfalls (race conditions) | MEDIUM | Discussion Mode double-advance extrapolated from existing known patterns. Valid reasoning but not yet code-verified. |

**Overall confidence:** HIGH

### Gaps to Address

- **`discussion_paused` boolean vs `discussion_pause` status value:** ARCHITECTURE.md and PITFALLS.md each describe a slightly different mechanism for the pause state. Resolve before schema migration: a new `sessions.status` value (`discussion_pause`) is cleaner for the existing subscription model; a separate `sessions.discussion_paused boolean` is simpler to query. Pick one approach and document it before Phase 4.

- **Break flag trigger timing — choice submission vs round close:** PITFALLS.md recommends writing break flags on individual choice submission; ARCHITECTURE.md places the write at host `closeRound()`. In Discussion Mode (multiple players with potentially different choices), round-close with aggregate logic is correct. In Solo Mode, choice-submission is fine. Clarify per-mode behavior in the Phase 1 pack data spec before building the submission handler.

- **Walk Mechanic R6 choice index mapping:** The existing `WalkMechanic.jsx` emits indices in kingdom-arc semantic order. Signal Lost R6 mapping (I = forward, II = away, III = stop) must be explicitly verified against the axis delta table before the mechanic is wired. Do not assume index 0 = forward without confirming.

- **`axis_history` storage — session vs player row:** Both ARCHITECTURE.md and STACK.md place it on the player row, which is correct for Solo Mode individual trajectories. Confirm whether Discussion Mode's GradingExport rubric needs per-player or aggregate axis history before Phase 5.

---

## Sources

### Primary (HIGH confidence)
- Codebase direct read: `Play.jsx`, `Host.jsx`, `detection.js`, `worldState.js`, `WalkMechanic.jsx`, `Baseline.jsx`, `supabase.js`, `scenarios.js`, `AnimatedMap.jsx` — architecture and pitfall findings
- Signal Lost phase brief: authoritative for intended behavior
- PROJECT.md: milestone definition and constraints
- CLAUDE.md: stack constraints, architectural decisions, locked versions

### Secondary (MEDIUM confidence)
- Recharts React 19 compatibility: GitHub Issue #4558 (recharts/recharts)
- @react-pdf/renderer React 19 support: GitHub Issue #2935 (diegomura/react-pdf)
- Framer Motion drag API: motion.dev/docs/react-drag
- Supabase JSONB partial update limitation: Discussion #14174 (supabase/supabase)
- Role-based simulation table stakes: Reacting to the Past (Barnard College), PbD Simulation (PMC/Springer), MIT teacher-centered design thesis (2025)
- Grading rubric standard: AAC&U VALUE Rubric for Ethical Reasoning
- Facilitator pacing design: Nearpod teacher-paced literature, CMPG design guidelines (ScienceDirect)

### Tertiary (LOW confidence)
- Break flags as "creeping complicity" mechanic: no established educational game literature term; treated as a design original. Implementation approach (session-level jsonb) is standard Supabase shared-state pattern.
- Assessment export format standards: xAPI/SCORM patterns referenced; specific JSON schema is project-defined.

---
*Research completed: 2026-03-30*
*Ready for roadmap: yes*
