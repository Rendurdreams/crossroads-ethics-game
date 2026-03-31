# Roadmap: The Crossroads

## Milestones

- ✅ **v1.0 The Crossroads MVP** — Phases 1–6 (shipped 2026-03-27) → [archive](.planning/milestones/v1.0-ROADMAP.md)
- ✅ **v1.1 Immersion + Moral Identity** — Phases 7–11 (shipped 2026-03-30)
- ⬜ **v1.2 Ethical Framework Depth** — Phase 12 (in progress)

## Phases

<details>
<summary>✅ v1.0 The Crossroads MVP (Phases 1–6) — SHIPPED 2026-03-27</summary>

- [x] Phase 1: Foundation (2/2 plans) — completed 2026-03-25
- [x] Phase 2: Session Flow (2/2 plans) — completed 2026-03-25
- [x] Phase 3: Game Loop (3/3 plans) — completed 2026-03-25
- [x] Phase 4: End State (2/2 plans) — completed 2026-03-26
- [x] Phase 5: Deploy + Polish (3/3 plans) — completed 2026-03-26
- [x] Phase 5.1: Visual Experience Overhaul (3/3 plans) — completed 2026-03-27
- [x] Phase 6: Kingdom UI Overhaul (3/3 plans) — completed 2026-03-27

</details>

<details>
<summary>✅ v1.1 Immersion + Moral Identity (Phases 7–11) — SHIPPED 2026-03-30</summary>

- [x] Phase 7: Moral Profile Data Layer (1/1 plans) — completed 2026-03-28
- [x] Phase 8: Multi-Pack System (3/3 plans) — completed 2026-03-28
- [x] Phase 9: Three.js Host Scene (2/2 plans) — completed 2026-03-29
- [x] Phase 10: Host UX Unification + Reveal Beat (2/2 plans) — completed 2026-03-28
- [x] Phase 11: Moral Conflict Detection + End Screen + AI Hooks (3/3 plans) — completed 2026-03-30

</details>

### v1.2 Ethical Framework Depth

- [ ] **Phase 12: Ethical Framework Depth** — Deeper moral baseline, moral trajectory tracking, conscience cost indicators, deontological awareness prompts, virtue reputation arc, rights awareness, cultural context framing
- [x] **Phase 13: Text & Mobile Polish** — Meter label rework, high-school-friendly text, 375px mobile optimization (completed 2026-03-30)
- [x] **Phase 14: Animated Kingdom Map** — Replace Three.js/R3F 3D scene with GSAP-driven 2D animated map. Four reactive zones (Fire/Courage, Water/Honesty, Purple/Empathy, Compass/Loyalty). Strip mouse effects for projected host screen. Remove Three.js deps after confirmed. (completed 2026-03-30)
- [x] **Phase 15: Divided Kingdom Phase 2** — Dynamic scribe record (R8), 90s timer pressure (R5), walk mechanic (R6), "How Others Chose" post-round screen, detection.js rework (key rename + new conflict triggers), conscience layer text, Round 7 fourth choice, visual accumulation, closing reflection screen, homepage split (host vs player) (completed 2026-03-30)

---

## Phase Details

### Phase 12: Ethical Framework Depth
**Goal**: The game covers the full spectrum of ethical and moral decision-making frameworks — every player's experience is measured against Kohlberg's stages, Gilligan's relational model, utilitarian calculus, deontological constraints, virtue reputation, rights awareness, and cultural context — not just the 4 framework tags, but the deeper philosophical dimensions underneath them
**Depends on**: Phase 11
**Requirements**: BASELINE-01, BASELINE-02, BASELINE-03, TRAJECTORY-01, TRAJECTORY-02, TRAJECTORY-03, TRAJECTORY-04, CONSCIENCE-01, CONSCIENCE-02, DEONTO-01, DEONTO-02, VIRTUE-01, VIRTUE-02, RIGHTS-01, RIGHTS-02, CULTURE-01, CULTURE-02
**Success Criteria** (what must be TRUE):
  1. Baseline page shows 5 stance questions (up from 2) — each maps to a framework conflict pair — page still completes in under 60 seconds with progressive disclosure
  2. All 5 stance answers feed into `findMoralConflicts()` as secondary signals — a player who said "no" to breaking promises but chose consequentialistically gets flagged
  3. End screen shows "Your Moral Arc" section when a player's dominant framework shifted between early and late rounds — names the shift and what it means philosophically
  4. End screen shows a `consistency_score` label — high consistency is named ("You held [X] through escalating stakes"), low consistency shows the trajectory narrative instead
  5. Players who ranked honesty #1 AND answered "no" to lying see a pre-choice awareness prompt on care-tagged choices — dismissible, never blocks, fact of dismissal logged
  6. End screen "Character" subsection shows longest virtue streak and whether virtue was most consistent across heavy-weight rounds
  7. Scenarios with rights-based tensions tagged with `rights_dimension: true` — end screen shows rights awareness line when ≥2 rights scenarios were played
  8. Pack selection cards show a one-line "ethical lens" subtitle — end screen footer shows the pack's ethical lens with a "context matters" note
  9. `choice_history` entries include `moral_weight` derived from scenario weight — used by trajectory detection
  10. ConsequenceReveal shows subtle visual distinction (amber border) when a moral conflict was registered for that round
**Plans**: 3 plans

Plans:
- [x] 12-01-PLAN.md — Data layer: detection.js extensions (trajectory, virtue, stance checks) + Baseline 5 questions + scenario schema (ethicalLens, rights_dimension)
- [x] 12-02-PLAN.md — In-game UI: ConsequenceReveal amber border + deontological awareness prompt banner
- [x] 12-03-PLAN.md — End screen + host wiring: endSession enrichment + FrameworkProfile 5 new sections + HostSetup ethicalLens

**UI hint**: yes

### Phase 13: Text & Mobile Polish

**Goal**: Every player-facing label, narrative, and UI element reads naturally for a high school audience and renders cleanly on a 375px phone screen — meter names connect to the moral reasoning the game teaches, academic jargon is eliminated, and mobile typography/spacing passes a visual audit
**Depends on**: Phase 12
**Requirements**: METER-01, METER-02, TEXT-01, TEXT-02, TEXT-03, MOBILE-01, MOBILE-02, MOBILE-03
**Plans**: 3 plans

Plans:
- [x] 13-01-PLAN.md — Meter label rework: rename kingdom geography labels to moral concept names across all 4 files
- [x] 13-02-PLAN.md — Text readability: rewrite FRAMEWORKS descriptions and ARC_NARRATIVES with introduce-then-define pattern
- [x] 13-03-PLAN.md — Mobile CSS: 390px breakpoints across 7 CSS module files + responsive SVG conflict diagram

### Phase 13.1: Dilemma 1 Flow Redesign + Bug Fixes (INSERTED)

**Goal:** Ship revised Dilemma 1 end-to-end: bombshell final round replacing reflection, fix host score labels, player answer toggle, question on host screen, and copy polish
**Depends on:** Phase 13
**Requirements**: BOMB-01, BOMB-02, BOMB-03, BOMB-04, HOST-01, HOST-02, TOGGLE-01, TOGGLE-02
**Plans:** 3/3 plans complete

Plans:
- [x] 13.1-01-PLAN.md — Bombshell scenario replacing reflection round + totalRounds fix
- [ ] 13.1-02-PLAN.md — Player answer toggle (delete+re-insert, ScenarioCard re-selection)
- [ ] 13.1-03-PLAN.md — Host screen fixes: METER_LABELS, scenario text overlay, bombshell copy

### Phase 14: Animated Kingdom Map

**Goal:** Replace the Three.js/R3F 3D kingdom scene with a GSAP-driven 2D animated map that reacts to world state meters — Fire zone (Courage), Water zone (Honesty), Purple zone (Empathy), Compass (Loyalty). Integration prototype in /integration. Remove mouse parallax/cursor effects for projected host screen. Strip Three.js dependencies after swap confirmed.
**Requirements**: MAP-01, MAP-02, MAP-03, MAP-04
**Depends on:** Phase 13.1
**Canonical refs:** integration/AnimatedMap.jsx, integration/AnimatedMap.module.css, integration/INTEGRATION_PROMPT.md, integration/Map1.png
**Plans:** 1/1 plans complete

Plans:
- [ ] 14-01-PLAN.md — Install gsap, adapt AnimatedMap from prototype, swap into Host.jsx (3 sites), delete dead code

### Phase 15: Divided Kingdom Phase 2

**Goal:** Bring the game to presentation-ready depth — R8 dynamic scribe record reflecting player's actual choices, R5 90-second timer for System 1 pressure, R6 physical walk mechanic, "How Others Chose" percentages after every round, detection.js rework (key rename + 10 new conflict trigger strings), conscience layer text per choice, Round 7 fourth choice (Cultural Tribunal), closing reflection screen, homepage split for host vs player entry.
**Requirements**: DK2-01, DK2-02, DK2-03, DK2-04, DK2-05, DK2-06, DK2-07, DK2-08, DK2-09, DK2-10, DK2-11, DK2-12, DK2-13, DK2-14, DK2-15
**Depends on:** Phase 14
**Canonical refs:** .planning/phases/15-divided-kingdom-phase-2/15-PRD.md
**Plans:** 5/5 plans complete

Plans:
- [x] 15-01-PLAN.md — Data layer: detection.js rework (key rename + 10 triggers + VALUE_FRAMEWORK_MAP), Baseline Q text, kingdom-arc.js R7 4th choice + conscience layer
- [x] 15-02-PLAN.md — UI components: ScenarioCard 4-choice support, ConsequenceReveal conscience layer, How Others Chose data module
- [x] 15-03-PLAN.md — Play.jsx wiring: How Others Chose screen, R5 timer pressure, R6 walk mechanic, conscienceLayer prop
- [x] 15-04-PLAN.md — R8 scribe record generator, Host How Others Chose overlay, closing reflection screen
- [x] 15-05-PLAN.md — R8 scribe wiring in Play.jsx, homepage split (host vs player entry)

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 2/2 | Complete | 2026-03-25 |
| 2. Session Flow | v1.0 | 2/2 | Complete | 2026-03-25 |
| 3. Game Loop | v1.0 | 3/3 | Complete | 2026-03-25 |
| 4. End State | v1.0 | 2/2 | Complete | 2026-03-26 |
| 5. Deploy + Polish | v1.0 | 3/3 | Complete | 2026-03-26 |
| 5.1. Visual Experience Overhaul | v1.0 | 3/3 | Complete | 2026-03-27 |
| 6. Kingdom UI Overhaul | v1.0 | 3/3 | Complete | 2026-03-27 |
| 7. Moral Profile Data Layer | v1.1 | 1/1 | Complete | 2026-03-28 |
| 8. Multi-Pack System | v1.1 | 3/3 | Complete | 2026-03-28 |
| 9. Three.js Host Scene | v1.1 | 2/2 | Complete | 2026-03-29 |
| 10. Host UX Unification + Reveal Beat | v1.1 | 2/2 | Complete | 2026-03-28 |
| 11. Moral Conflict Detection + End Screen + AI Hooks | v1.1 | 3/3 | Complete | 2026-03-30 |
| 12. Ethical Framework Depth | v1.2 | 3/3 | Complete |  |
| 13. Text & Mobile Polish | v1.2 | 3/3 | Complete    | 2026-03-30 |
| 13.1. Dilemma 1 Flow Redesign + Bug Fixes | v1.2 | 1/3 | Complete    | 2026-03-30 |

### Phase 15.1: Moral Conflict Detection Audit (INSERTED)

**Goal:** Audit and fix the VALUE_FRAMEWORK_MAP, stance-based conflict triggers, and per-round moral conflict detection logic so that conflicts fire accurately against the kingdom-arc scenario choices. The current detection produces false positives (e.g. flagging 'Protect the Core' as conflicting with loyalty) because the mapping between values, frameworks, and specific scenario choices is miscalibrated.
**Requirements**: MCA-01
**Depends on:** Phase 15
**Plans:** 2/2 plans complete

Plans:
- [x] 15.1-01-PLAN.md — Fix detection.js: dead fairness tag (VALUE_CONDITION_TRIGGERS) + replace 2 matchFramework triggers with 4 matchCondition entries + update tests
- [x] 15.1-02-PLAN.md — Fix call sites: Play.jsx + ConsequenceReveal.jsx pass full frameworks array + scenarioId/choiceIndex for condition triggers to fire at round-close
