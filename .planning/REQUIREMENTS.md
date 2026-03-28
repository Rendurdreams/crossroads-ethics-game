# Requirements: The Crossroads v1.1

**Defined:** 2026-03-27
**Milestone:** v1.1 — Immersion + Moral Identity
**Core Value:** Players finish the game understanding that ethics and morals are not the same thing — and that the tension between their stated values and their actual choices is where real thinking begins.

---

## v1.1 Requirements

### Moral Profile Layer

- [x] **MORAL-01**: Player completes a hybrid moral baseline at join time — value priority ranking (loyalty, honesty, fairness, courage, compassion) + 2 stance questions (e.g. "Is it ever okay to lie to protect someone?" Yes / No / It depends) — completes in under 60 seconds on phone
- [x] **MORAL-02**: Moral baseline data stored on the player row in Supabase (values ranking as ordered array, stance answers as key/value pairs)
- [ ] **MORAL-03**: After a player locks a choice, a subtle inline indicator appears when that choice conflicts with their stated top values — e.g. "This conflicts with your value of honesty" — shown below the framework label, never before the choice is locked
- [ ] **MORAL-04**: Conflict detection logic compares choice framework tags against player's stated value priorities to determine moral tension (e.g. consequentialist choice conflicts with a player who ranked honesty #1)
- [ ] **MORAL-05**: End screen shows a Moral vs Ethics conflict map — lists rounds where player's choice diverged from stated values, names the philosophical tension (e.g. "You value loyalty above honesty, but in Round 2 you chose truth over protection — that's deontology overriding care ethics, and your own stated value")
- [ ] **MORAL-06**: End screen section title/framing distinguishes moral profile (personal) from ethical framework (reasoned system) — the lesson is explicit in the copy

### Scenario Packs

- [x] **PACK-01**: Real-world modern dilemmas pack — 5–7 scenarios set in contemporary contexts (social media, workplace, community, AI in daily life), same framework-tag + world-impact structure as kingdom-arc
- [x] **PACK-02**: Sci-fi / future dilemmas pack — 5–7 scenarios set in near-future contexts (AI rights, genetic decisions, surveillance, resource scarcity), same structure as kingdom-arc
- [x] **PACK-03**: Host can select which pack to play on the HostSetup page after session creation — kingdom-arc, real-world, or sci-fi shown with title, description, and scenario count
- [x] **PACK-04**: Session `total_rounds` is set from the selected pack's scenario count (same as v1.0 pattern, now applied to 3 packs)
- [x] **PACK-05**: Pack system is structured so a future AI-generated pack can be injected with the same interface — pack shape documented, no hardcoded pack assumptions in game loop

### Three.js Host Scene

- [x] **THREE-01**: Host screen renders a Three.js 3D scene replacing the CSS KingdomMap — nighttime cityscape or kingdom landscape, fixed camera angle, slow ambient drift
- [x] **THREE-02**: 3D scene has 4 landmark objects corresponding to world state dimensions: bridge (trust), lighthouse/beacon (courage), building cluster/windows (solidarity), fog layer (awareness)
- [ ] **THREE-03**: Landmark states update after each round close based on world state values — visual change (lighting, geometry, particles) driven by flourishing / neutral / declining tiers
- [ ] **THREE-04**: Host screen layout unifies 3D scene and right panel into one visual language — same dark glass palette, amber glow, panel feels like a HUD overlay on the scene, not a separate column
- [ ] **THREE-05**: Dramatic round-close sequence: when host clicks "Close Round," the 3D scene plays a brief reveal animation (2–4 seconds) before world state meters update — landmark lights shift, a visual beat registers the collective choice
- [x] **THREE-06**: Three.js loads from npm (not CDN) with tree-shaking — only imported modules bundled; r160+ for current API compatibility
- [ ] **THREE-07**: 3D scene runs at stable 60fps on a standard laptop during presentation (no frame drops during Supabase subscription events)

### Host UX

- [ ] **HOSTUX-01**: Host panel and 3D scene share visual language — panel elements (vote tally, meter bars, round controls) styled as HUD overlays on the 3D scene background, not a separate sidebar
- [ ] **HOSTUX-02**: Round-close reveal beat is visually distinct from normal state — a moment of anticipation before world state animates

### AI Layer Hooks (Architecture Only — No Live AI Calls)

- [ ] **AI-01**: Player end-screen data shape includes a `debrief_context` field — structured summary of choices, frameworks used, moral conflicts detected, suitable as an LLM prompt payload
- [ ] **AI-02**: Session end data includes a `group_debrief_context` field — aggregate framework breakdown, world state final values, notable moral conflicts across the group, suitable as a discussion-prompt generation payload
- [x] **AI-03**: Pack schema includes optional `ai_generated: true` flag and `generator_prompt` field — future AI pack generation can use this shape to inject packs at session creation
- [ ] **AI-04**: A `src/lib/ai.js` stub exists with placeholder functions: `generateDebrief(playerContext)`, `generateDiscussionPrompts(sessionContext)`, `generatePack(prompt)` — returns null, ready for implementation

---

## Future Requirements (v1.2+)

### AI Layer (Live)
- Live AI-generated personalized debrief narration at end screen
- AI-generated discussion prompt suggestions for host post-game
- AI-generated scenario pack from a theme prompt

### Timer
- Host round timer (30–90 sec) with pause/extend — deferred from v1.0, still pending

### Social / Persistence
- Session history — replaying your profile across multiple games
- Anonymous aggregate data across sessions (what frameworks dominate by scenario?)

---

## Out of Scope (v1.1)

| Feature | Reason |
|---------|--------|
| Live AI calls | Architecture hooks this milestone; live calls are v1.2 |
| Timer | Deferred again — pack work + Three.js is enough scope |
| Player accounts / login | Still ephemeral; localStorage sufficient |
| Leaderboard / score | Contradicts pedagogical intent |
| Animated SVG phone meters | Still deferred; CSS class-based is fine |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MORAL-01 | Phase 7 | Not started |
| MORAL-02 | Phase 7 | Not started |
| MORAL-03 | Phase 11 | Not started |
| MORAL-04 | Phase 11 | Not started |
| MORAL-05 | Phase 11 | Not started |
| MORAL-06 | Phase 11 | Not started |
| PACK-01 | Phase 8 | Not started |
| PACK-02 | Phase 8 | Not started |
| PACK-03 | Phase 8 | Not started |
| PACK-04 | Phase 8 | Not started |
| PACK-05 | Phase 8 | Not started |
| THREE-01 | Phase 9 | Not started |
| THREE-02 | Phase 9 | Not started |
| THREE-03 | Phase 9 | Not started |
| THREE-04 | Phase 10 | Not started |
| THREE-05 | Phase 10 | Not started |
| THREE-06 | Phase 9 | Not started |
| THREE-07 | Phase 9 | Not started |
| HOSTUX-01 | Phase 10 | Not started |
| HOSTUX-02 | Phase 10 | Not started |
| AI-01 | Phase 11 | Not started |
| AI-02 | Phase 11 | Not started |
| AI-03 | Phase 8 | Not started |
| AI-04 | Phase 11 | Not started |

**Coverage:**
- v1.1 requirements: 24 total
- Mapped to phases: 24/24
- Unmapped: 0

---
*Requirements defined: 2026-03-27*
*Traceability updated: 2026-03-27 (roadmapper)*
