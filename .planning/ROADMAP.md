# Roadmap: The Crossroads

## Milestones

- ✅ **v1.0 The Crossroads MVP** — Phases 1–6 (shipped 2026-03-27) → [archive](.planning/milestones/v1.0-ROADMAP.md)
- ⬜ **v1.1 Immersion + Moral Identity** — Phases 7–11 (in progress)

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

### v1.1 Immersion + Moral Identity

- [ ] **Phase 7: Moral Profile Data Layer** — Join-flow value ranking + stance questions; moral baseline stored in Supabase
- [ ] **Phase 8: Multi-Pack System** — Two new scenario packs (real-world, sci-fi) + pack selection UI + AI-ready pack schema
- [ ] **Phase 9: Three.js Host Scene** — Static 3D scene installed via npm, 4 landmark objects wired to world state, 60fps validated
- [ ] **Phase 10: Host UX Unification + Reveal Beat** — HUD overlay layout, dramatic round-close animation, unified 3D + panel visual language
- [ ] **Phase 11: Moral Conflict Detection + End Screen + AI Hooks** — In-round moral conflict indicator, end-screen moral vs ethics map, AI data shape stubs

---

## Phase Details

### Phase 7: Moral Profile Data Layer
**Goal**: Players arrive in the game with a visible moral identity — their stated personal values are on record before any dilemma is presented
**Depends on**: Phase 6 (v1.0 complete)
**Requirements**: MORAL-01, MORAL-02
**Success Criteria** (what must be TRUE):
  1. A player joining on their phone sees a value priority ranking UI (loyalty, honesty, fairness, courage, compassion) and 2 stance questions before reaching the lobby — completes in under 60 seconds
  2. The moral baseline (ranked values array + stance key/value pairs) is stored on the player row in Supabase and retrievable for detection logic in later phases
  3. A player who refreshes mid-join does not lose their baseline progress — localStorage preserves state until Supabase write confirms
**Plans**: TBD

### Phase 8: Multi-Pack System
**Goal**: The host can choose between three distinct scenario packs before starting a session, and the pack system is architected to accept a future AI-generated pack without code changes
**Depends on**: Phase 7
**Requirements**: PACK-01, PACK-02, PACK-03, PACK-04, PACK-05
**Success Criteria** (what must be TRUE):
  1. The HostSetup page shows three pack cards (kingdom-arc, real-world, sci-fi) with title, description, and scenario count — host taps one to select
  2. Selecting a pack sets `total_rounds` on the session from that pack's scenario count — no manual round selector appears
  3. Playing through the real-world pack presents contemporary scenarios (social media, workplace, community) with correct framework tags and world impacts
  4. Playing through the sci-fi pack presents near-future scenarios (AI rights, surveillance, resource scarcity) with the same structure
  5. The pack schema has an `ai_generated` flag and `generator_prompt` field — a new pack object conforming to the shape can be injected at session creation without touching game loop code
**Plans**: TBD
**UI hint**: yes

### Phase 9: Three.js Host Scene
**Goal**: The host screen displays a living 3D scene that replaces the CSS KingdomMap — landmarks shift visually after each round based on world state
**Depends on**: Phase 8
**Requirements**: THREE-01, THREE-02, THREE-03, THREE-06, THREE-07
**Success Criteria** (what must be TRUE):
  1. The host screen renders a Three.js 3D scene (nighttime kingdom or cityscape) at session start — CSS KingdomMap is no longer visible
  2. Four distinct 3D landmark objects are present and identifiable: bridge (trust), beacon/lighthouse (courage), building cluster (solidarity), fog layer (awareness)
  3. After a round closes and world state updates, each landmark visually changes state (lighting, geometry, or particle shift) matching the flourishing / neutral / declining tier of its meter
  4. Three.js is installed as an npm dependency (r160+), tree-shaken, and does not inflate the player-phone bundle
  5. The 3D scene runs at stable 60fps on a standard laptop while Supabase subscription events fire during a live round
**Plans**: TBD
**UI hint**: yes

### Phase 10: Host UX Unification + Reveal Beat
**Goal**: The host screen feels like a single cinematic HUD — vote tally, meters, and round controls are overlaid on the 3D scene, and closing a round triggers a distinct visual moment before results land
**Depends on**: Phase 9
**Requirements**: THREE-04, THREE-05, HOSTUX-01, HOSTUX-02
**Success Criteria** (what must be TRUE):
  1. The host panel (vote tally, world state meters, round controls) is styled as a glass HUD overlay on the 3D scene — no separate column or sidebar; the scene fills the screen behind it
  2. When the host clicks "Close Round," the 3D scene plays a 2–4 second reveal animation before the world state meters update — a visible beat of anticipation separates the close action from the result
  3. The reveal animation is visually distinct from normal world state transitions — a player watching the projected screen can perceive the moment as meaningful without explanation
  4. The unified palette (dark glass, amber glow) is consistent across the 3D scene and all overlaid HUD elements
**Plans**: TBD
**UI hint**: yes

### Phase 11: Moral Conflict Detection + End Screen + AI Hooks
**Goal**: Players see their choices measured against their own stated values — both during play (subtle hint) and on the end screen (named philosophical tension) — and all player/session data is shaped for a future AI debrief
**Depends on**: Phase 10
**Requirements**: MORAL-03, MORAL-04, MORAL-05, MORAL-06, AI-01, AI-02, AI-03, AI-04
**Success Criteria** (what must be TRUE):
  1. After a player locks a choice that conflicts with their stated top values, a subtle inline label appears below the framework tag — e.g. "This conflicts with your value of honesty" — it never appears before the choice is locked
  2. Conflict detection correctly compares choice framework tags against the player's stored value priorities — a consequentialist choice by a player who ranked honesty #1 registers as a conflict; a deontological choice by the same player does not
  3. The end screen shows a Moral vs Ethics conflict map section listing each round where the player's choice diverged from their stated values, with the philosophical tension named explicitly
  4. The end screen copy explicitly distinguishes moral profile (personal, stated) from ethical framework (reasoned system) — the lesson is in the text, not left implicit
  5. `src/lib/ai.js` exists with stub functions `generateDebrief(playerContext)`, `generateDiscussionPrompts(sessionContext)`, and `generatePack(prompt)` returning null; player end-screen data includes `debrief_context`; session end data includes `group_debrief_context`; pack schema includes `ai_generated` and `generator_prompt` fields
**Plans**: TBD

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
| 7. Moral Profile Data Layer | v1.1 | 0/? | Not started | - |
| 8. Multi-Pack System | v1.1 | 0/? | Not started | - |
| 9. Three.js Host Scene | v1.1 | 0/? | Not started | - |
| 10. Host UX Unification + Reveal Beat | v1.1 | 0/? | Not started | - |
| 11. Moral Conflict Detection + End Screen + AI Hooks | v1.1 | 0/? | Not started | - |
