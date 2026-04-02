# Roadmap: The Crossroads

## Milestones

- ✅ **v1.0 The Crossroads MVP** — Phases 1–6 (shipped 2026-03-27) → [archive](.planning/milestones/v1.0-ROADMAP.md)
- ✅ **v1.1 Immersion + Moral Identity** — Phases 7–11 (shipped 2026-03-30)
- ✅ **v1.2 Ethical Framework Depth** — Phases 12–15.1 (shipped 2026-03-31)
- ⬜ **v2.0 Signal Lost** — Phases 16–19 (in progress)

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

<details>
<summary>✅ v1.2 Ethical Framework Depth (Phases 12–15.1) — SHIPPED 2026-03-31</summary>

- [x] Phase 12: Ethical Framework Depth (3/3 plans) — completed 2026-03-30
- [x] Phase 13: Text & Mobile Polish (3/3 plans) — completed 2026-03-30
- [x] Phase 13.1: Dilemma 1 Flow Redesign + Bug Fixes (3/3 plans) — completed 2026-03-30
- [x] Phase 14: Animated Kingdom Map (1/1 plans) — completed 2026-03-30
- [x] Phase 15: Divided Kingdom Phase 2 (5/5 plans) — completed 2026-03-30
- [x] Phase 15.1: Moral Conflict Detection Audit (2/2 plans) — completed 2026-03-31

</details>

### v2.0 Signal Lost

- [ ] **Phase 16: Data Foundation** — Signal Lost pack file, axis constants, senator profile data, break flag definitions, Supabase schema migrations, Signal Lost as default pack
- [ ] **Phase 17: Player-Facing Integration** — Senator profile assignment and display, per-round stake panel, break flag writes and map rendering, walk mechanic R6 rewrite, scribe record, Signal Lost detection triggers
- [ ] **Phase 18: Discussion Mode** — Host mode selector, discussion pause screen with profile breakdown and conflict spotlight, facilitator-only Continue, atomic round advance, player waiting state
- [ ] **Phase 19: Grading Rubric** — Instructor-facing grading route with 4-dimension rubric, score bands, bonus section

---

## Phase Details

### Phase 16: Data Foundation
**Goal**: All Signal Lost data is defined, validated, and persisted — pack scenarios, axis constants, senator profiles, break flag definitions, and schema migrations are in place so no downstream component builds against undefined shapes
**Depends on**: Phase 15.1
**Requirements**: PACK-01, PACK-02, PACK-03, PACK-04, AXIS-01, AXIS-02, AXIS-03, PROF-01, FLAG-01, FLAG-02
**Success Criteria** (what must be TRUE):
  1. A new Signal Lost session writes `{ CT: 65, HD: 65, SOL: 65, ACC: 65 }` to `sessions.world_state` and Signal Lost is selected by default when creating a session
  2. Meter bars on host and player views display "Civil Trust", "Human Dignity", "Solidarity", and "Accountability" labels when Signal Lost is the active pack
  3. All 8 scenario round objects in signal-lost.js are fully populated: 3 choices (R7 has 4), framework tags, axis deltas keyed to `CT/HD/SOL/ACC` constants, conscience layers, discussion prompts, and per-round conflict spotlight pair
  4. All 6 senator profile objects exist in senatorProfiles.js with name, subtitle, per-round stakes for R1–R8, and the 4 variable fields
  5. The 7 break flag definitions exist in breakFlags.js with round trigger, choice index, and map marker type; `sessions.break_flags` jsonb column and `players.senator_profile_id` column exist in Supabase
**Plans**: TBD
**UI hint**: yes

### Phase 17: Player-Facing Integration
**Goal**: Players experience Signal Lost as a fully differentiated senator simulation — each player is assigned a persistent profile with personal stakes visible every round, break flags are written and surfaced, the walk mechanic works for R6, the scribe record reflects actual choices, and conflict detection fires only on Signal Lost scenario IDs
**Depends on**: Phase 16
**Requirements**: PROF-02, PROF-03, PROF-04, PROF-05, FLAG-03, FLAG-04, DETECT-01, DETECT-02, DETECT-03, WALK-01, WALK-02, WALK-03, SCRIBE-01, SCRIBE-02
**Success Criteria** (what must be TRUE):
  1. Player is assigned a senator profile at join time; profile_id is persisted to Supabase so that reloading the phone mid-session shows the same profile and correct per-round stakes
  2. Before each choice, the player sees their "YOUR STAKE" panel with the round-specific text for their profile; the host roster shows each player's assigned profile letter
  3. Round 6 renders a corridor walk interaction (not choice buttons); crossing the midpoint toward the terminal submits Choice I, turning back submits Choice II, stopping near the terminal for 3 seconds submits Choice III — choice index is written to Supabase identically to all other rounds
  4. When a choice triggers a break flag (R1-III, R2-I, R3-II, R4-II, R5-I, R6-II, R7-IV), the flag is written to `sessions.break_flags` and a persistent marker appears on the host AnimatedMap for all remaining rounds
  5. The Round 8 scribe record references the specific break flags the session triggered and the player's dominant framework pattern across R1–R7; Signal Lost STANCE_TRIGGERS in detection.js use `signal-r*` scenario ID prefixes and do not fire during kingdom-arc play
**Plans**: TBD
**UI hint**: yes

### Phase 18: Discussion Mode
**Goal**: The host can run Signal Lost as a facilitated classroom session — after each round closes, the game pauses for a Discussion Pause Screen that shows vote distribution, anonymous profile breakdown, and pre-written prompts; only the host can advance; players see a waiting state; the round advance is atomic
**Depends on**: Phase 17
**Requirements**: DISC-01, DISC-02, DISC-03, DISC-04, DISC-05, DISC-06
**Success Criteria** (what must be TRUE):
  1. Host setup includes a mode selector (Discussion / Standard); the choice is written to `sessions.mode` before any player joins and cannot be changed mid-session
  2. In Discussion Mode, after the host closes a round, all player phones show a "Waiting for facilitator" state and the host sees the Discussion Pause Screen — the next round does not load until the host presses Continue
  3. The Discussion Pause Screen shows the live vote distribution for that session, an anonymous profile breakdown grid (Profile A → Choice II, etc.), and 2–3 pre-written discussion prompts for that round
  4. When the key conflict pair for a round chose differently, a Conflict Spotlight section appears naming both profiles' stakes and asking them to explain to each other
  5. The Continue button is rendered only in Host.jsx; no path through Play.jsx can advance the session past the discussion pause; the round advance writes world state and increments round atomically via a single Supabase RPC
**Plans**: TBD
**UI hint**: yes

### Phase 19: Grading Rubric
**Goal**: Instructors can access a grading rubric page from the host end screen that documents how to assess student reflection across 4 dimensions — the page requires no real-time data and is read-only
**Depends on**: Phase 18
**Requirements**: GRADE-01, GRADE-02, GRADE-03
**Success Criteria** (what must be TRUE):
  1. A "Grading Rubric" link or button appears on the host end screen and navigates to `/grading/:sessionId`
  2. The rubric page shows all 4 dimensions (Moral Reasoning 30pts, Personal Stake Awareness 20pts, Consequence Tracking 25pts, Closing Reflection 25pts) with score bands and per-band descriptions
  3. The bonus section (up to 10pts, baseline value-behavior alignment) is documented on the page with a note that it applies only when the baseline survey was completed
**Plans**: TBD

### Phase 20: UI polish: health bar fix, host notes for ethics teaching, declutter host view

**Goal:** Replace tall gradient meter bars on player phone with compact monospace strip; move host teaching notes to phone-only; declutter host projector post-round overlay
**Requirements**: D-01 through D-15 (20-CONTEXT.md)
**Depends on:** Phase 19
**Plans:** 3 plans

Plans:
- [x] 20-01: Compact meter strip with color-coded axes (CompactMeterStrip.jsx)
- [ ] 20-02: Host teaching notes — phone-only facilitator cue card (HostRemote.jsx)
- [ ] 20-03: Host projector declutter — remove notes from post-round overlay (Host.jsx)

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
| 12. Ethical Framework Depth | v1.2 | 3/3 | Complete | 2026-03-30 |
| 13. Text & Mobile Polish | v1.2 | 3/3 | Complete | 2026-03-30 |
| 13.1. Dilemma 1 Flow Redesign + Bug Fixes | v1.2 | 3/3 | Complete | 2026-03-30 |
| 14. Animated Kingdom Map | v1.2 | 1/1 | Complete | 2026-03-30 |
| 15. Divided Kingdom Phase 2 | v1.2 | 5/5 | Complete | 2026-03-30 |
| 15.1. Moral Conflict Detection Audit | v1.2 | 2/2 | Complete | 2026-03-31 |
| 16. Data Foundation | v2.0 | 0/TBD | Not started | - |
| 17. Player-Facing Integration | v2.0 | 0/TBD | Not started | - |
| 18. Discussion Mode | v2.0 | 0/TBD | Not started | - |
| 19. Grading Rubric | v2.0 | 0/TBD | Not started | - |
