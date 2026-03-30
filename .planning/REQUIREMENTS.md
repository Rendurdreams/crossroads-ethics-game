# Requirements: The Crossroads v1.2

**Defined:** 2026-03-30
**Milestone:** v1.2 — Ethical Framework Depth
**Core Value:** Players finish the game not just seeing which frameworks they used, but understanding how their moral reasoning evolved, where it was consistent, and what philosophical traditions they unknowingly relied on — measured against a comprehensive ethical framework audit.

---

## v1.2 Requirements

### Deeper Moral Baseline

- [x] **BASELINE-01**: Moral baseline expanded from 2 stance questions to 5 — new questions test deontology vs. consequentialism ("Is it right to break a promise to prevent harm?"), virtue vs. care ("Should a person always tell the truth even if it destroys a relationship?"), and rights vs. utilitarian ("Is it okay to punish the innocent if it protects the group?") — each maps to a CONFLICT_PAIRS entry
- [x] **BASELINE-02**: Each new stance question wired into `findMoralConflicts()` as a secondary signal — same pattern as existing `ends_justify` and `lie_to_protect` checks but covering the new conflict dimensions
- [x] **BASELINE-03**: Baseline page still completes in under 60 seconds despite the additional questions — progressive disclosure (values first, then stances revealed one at a time as answered) keeps pace manageable

### Moral Trajectory Tracking (Kohlberg + Virtue Arc)

- [x] **TRAJECTORY-01**: `choice_history` entries enriched with a `moral_weight` field derived from the scenario's `weight` property (low=1, medium=2, heavy=3) — captures that a care-ethics choice in a heavy round is qualitatively different from care-ethics in a low round
- [x] **TRAJECTORY-02**: `computeProfile()` returns a new `trajectory` object showing framework usage across early rounds (1-2) vs. late rounds (5+) — detects whether reasoning shifted toward more principled frameworks as scenarios escalated
- [ ] **TRAJECTORY-03**: End screen shows a "Your Moral Arc" section: "In the early rounds you reasoned from [X]. By the final rounds, you shifted to [Y]" — only displayed when a meaningful shift is detected (dominant framework changed between halves), not when reasoning was consistent throughout
- [x] **TRAJECTORY-04**: A `consistency_score` (0-1) computed from how stable framework usage was across rounds — high consistency gets named ("Your reasoning was remarkably consistent — you held [X] through escalating stakes"), low consistency gets the trajectory narrative instead

### Conscience Cost & Moral Friction

- [x] **CONSCIENCE-01**: When a player's choice produces a moral conflict (value or stance), the consequence text on the ConsequenceReveal screen gets a subtle visual distinction — a soft amber border or italic prefix — indicating the game registered internal friction, not just external consequence
- [ ] **CONSCIENCE-02**: End screen shows cumulative "moral friction" count: "Your choices conflicted with your stated values in X of Y rounds" — framed neutrally ("That tension is the point") not punitively

### Deontological Constraints (Soft Blocks)

- [x] **DEONTO-01**: Players who ranked honesty #1 AND answered "no" to "Is it ever right to lie to protect someone?" see a pre-choice awareness prompt on care-tagged choices: "This choice prioritizes loyalty over truth. You declared truth matters most." — appears BEFORE the choice is locked, as a moment of self-awareness, not a hard block
- [x] **DEONTO-02**: The prompt is dismissible (tap to continue) and does not prevent any choice — the game reveals tension, never restricts agency — but the fact that the prompt appeared is logged in choice_history for end-screen analysis

### Virtue Reputation Arc

- [x] **VIRTUE-01**: A `virtue_streak` counter tracks consecutive rounds where the player chose a virtue-tagged option — resets on non-virtue choice — visible only on end screen as "You held to character for X consecutive rounds"
- [ ] **VIRTUE-02**: End screen "Character" subsection in the profile: shows longest virtue streak, total virtue choices, and whether virtue was the player's most consistent framework across the heaviest-weight rounds

### Rights & Protections Awareness

- [x] **RIGHTS-01**: Scenarios that involve rights-based tensions (The Hollow Folk, The Edge, any scenario where a minority/individual is at risk from group benefit) tagged with an additional `rights_dimension: true` field in the pack schema
- [ ] **RIGHTS-02**: End screen shows "Rights Awareness" line: "In X of Y rights-critical scenarios, you chose to protect individual rights over group benefit" — only shown when ≥2 rights-dimension scenarios were played

### Cultural Context Indicator

- [x] **CULTURE-01**: Pack selection card on HostSetup shows a one-line "ethical lens" subtitle: Kingdom = "What does a ruler owe?", Real-World = "What do you owe the people around you?", Futures = "What do you owe the people who come after you?" — frames the cultural context before play
- [ ] **CULTURE-02**: End screen footer shows which pack was played and its ethical lens, so the player understands their results are context-dependent: "Your choices were measured in the context of [pack ethical lens]. A different context might have drawn different reasoning."

### Meter Label Rework (Phase 13)

- [x] **METER-01**: All player-facing and host-facing meter labels renamed from kingdom geography to moral concepts: Bridge of Accord -> Honesty, Citadel Beacon -> Courage (unchanged), Village Quarter -> Loyalty, Fog of the Vale -> Empathy — same names on both host and player screens
- [x] **METER-02**: ConsequenceReveal ImpactMeter inline labels updated to match: Trust -> Honesty, Solidarity -> Loyalty, Awareness -> Empathy

### Text Readability (Phase 13)

- [x] **TEXT-01**: All 4 FRAMEWORKS descriptions in frameworks.js rewritten — shorter, conversational, relatable for high schoolers while preserving philosophical accuracy
- [x] **TEXT-02**: All 12 ARC_NARRATIVES in FrameworkProfile.jsx rewritten using "introduce then define" pattern — every academic philosophy term immediately followed by a plain-language em-dash definition
- [x] **TEXT-03**: All end-screen philosophical text (section headers, conflict descriptions, moral arc narratives) uses introduce-then-define pattern where academic terms appear

### 375px Mobile Layout (Phase 13)

- [ ] **MOBILE-01**: All player-facing pages (Play, Baseline, FrameworkProfile, Landing) have @media (max-width: 390px) breakpoints reducing padding to maximize content width on 375px phones (343px+ content area, up from 311-327px)
- [ ] **MOBILE-02**: Scenario body text and consequence text use CSS clamp() for fluid font scaling at narrow widths
- [ ] **MOBILE-03**: SVG conflict diagram in FrameworkProfile uses viewBox + width="100%" for responsive scaling — no fixed pixel dimensions

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BASELINE-01 | Phase 12 | Complete |
| BASELINE-02 | Phase 12 | Complete |
| BASELINE-03 | Phase 12 | Complete |
| TRAJECTORY-01 | Phase 12 | Complete |
| TRAJECTORY-02 | Phase 12 | Complete |
| TRAJECTORY-03 | Phase 12 | Not started |
| TRAJECTORY-04 | Phase 12 | Complete |
| CONSCIENCE-01 | Phase 12 | Complete |
| CONSCIENCE-02 | Phase 12 | Not started |
| DEONTO-01 | Phase 12 | Complete |
| DEONTO-02 | Phase 12 | Complete |
| VIRTUE-01 | Phase 12 | Complete |
| VIRTUE-02 | Phase 12 | Not started |
| RIGHTS-01 | Phase 12 | Complete |
| RIGHTS-02 | Phase 12 | Not started |
| CULTURE-01 | Phase 12 | Complete |
| CULTURE-02 | Phase 12 | Not started |
| METER-01 | Phase 13 | Not started |
| METER-02 | Phase 13 | Not started |
| TEXT-01 | Phase 13 | Not started |
| TEXT-02 | Phase 13 | Not started |
| TEXT-03 | Phase 13 | Not started |
| MOBILE-01 | Phase 13 | Not started |
| MOBILE-02 | Phase 13 | Not started |
| MOBILE-03 | Phase 13 | Not started |

**Coverage:**
- v1.2 requirements: 25 total (17 Phase 12 + 8 Phase 13)
- Mapped to phases: 25/25
- Unmapped: 0

---
*Requirements defined: 2026-03-30*
*Phase 13 requirements added: 2026-03-30*
