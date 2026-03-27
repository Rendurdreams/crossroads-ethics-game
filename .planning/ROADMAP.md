# Roadmap: The Crossroads

## Overview

Five phases deliver a working real-time multiplayer ethics game for a classroom presentation. Phase 1 builds the backend foundation and pure-function data layer that everything else depends on. Phase 2 brings players into a room. Phase 3 runs the full game loop — scenario, choice, consequence, world state. Phase 4 surfaces the pedagogical payoff: framework profiles and conflict maps. Phase 5 ships it and confirms it holds under 25 simultaneous players.

## Phases

- [ ] **Phase 1: Foundation** - Supabase schema, RLS, real-time validation, and all /lib logic
- [x] **Phase 2: Session Flow** - Host creates session, players join with room code, lobby live roster (completed 2026-03-25)
- [x] **Phase 3: Game Loop** - Rounds run end-to-end: scenario, choice, consequence, world state update (completed 2026-03-25)
- [x] **Phase 4: End State** - Framework profiles, conflict maps, reflections, host end view (completed 2026-03-26)
- [ ] **Phase 5: Deploy + Polish** - Ship to Netlify/Vercel, mobile audit, load test
- [ ] **Phase 6: Kingdom UI Overhaul** - Replace Three.js city with CSS kingdom map, remove round selector (pack drives count), full visual redesign of all 4 screens to fantasy kingdom aesthetic

## Phase Details

### Phase 1: Foundation
**Goal**: The backend and data layer are verified working before any UI is built
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, DATA-01, DATA-02, DATA-03, DATA-04, DATA-05
**Success Criteria** (what must be TRUE):
  1. Supabase schema exists with sessions, players, choices, and reflections tables; a test insert into each table succeeds
  2. RLS policies allow an anon client to read session state, insert a player row, and insert a choice — and these same policies do not silently block real-time event delivery (verified via Supabase dashboard subscription test)
  3. All 6 rounds of scenario data are loaded and queryable from scenarios.js with correct framework tags and world impact values
  4. computeProfile() returns the correct dominant framework given a known choice history; findConflicts() correctly names cross-round tensions
  5. applyChoicesToWorld() produces the correct weighted world state delta given a known tally of choices
**Plans:** 2 plans
Plans:
- [x] 01-01-PLAN.md — Scaffold Vite + React project, Supabase client, schema SQL with RLS
- [x] 01-02-PLAN.md — Scenario library, framework definitions, detection logic, world state computation

### Phase 2: Session Flow
**Goal**: Host can create a session and players can join on their phones — lobby is live before a round starts
**Depends on**: Phase 1
**Requirements**: HOST-01, HOST-02, HOST-03, HOST-04, HOST-10, PLAY-01, PLAY-02, PLAY-03
**Success Criteria** (what must be TRUE):
  1. Host lands on a page, creates a session, and sees a 4-digit room code large enough to read from the back of the room
  2. A player on a phone enters the room code and a name, taps join, and immediately appears in the host's live roster with a name and emoji
  3. Host can select round count (3, 4, 5, or 6) before starting the game
  4. If a player closes their phone browser and reopens it, they return to the correct session without re-entering their name
  5. Start button becomes active when 2 or more players have joined
**Plans:** 2/2 plans complete
Plans:
- [x] 02-01-PLAN.md — Routing, Landing page (create/join session), CSS foundation
- [x] 02-02-PLAN.md — Host lobby (room code, roster, round selector, start) + Player lobby (restore, waiting)
**UI hint**: yes

### Phase 3: Game Loop
**Goal**: A complete round runs from scenario display through choice lock, consequence reveal, and world state update — host controls the pace
**Depends on**: Phase 2
**Requirements**: HOST-05, HOST-06, HOST-07, HOST-08, HOST-09, PLAY-04, PLAY-05, PLAY-06, PLAY-07, PLAY-08, PLAY-09, PLAY-10
**Success Criteria** (what must be TRUE):
  1. Player sees the scenario text and 3 choice buttons; tapping a choice locks it immediately with optimistic UI and no second submission is possible
  2. Framework label for the chosen option appears after locking — not before
  3. Host sees a live anonymous vote tally (% per choice) and an "X of Y submitted" counter updating in real time as players choose
  4. When host closes the round, all players simultaneously see their private consequence text
  5. World state (4 CSS meters) updates on both host and player screens after each round closes, reflecting the aggregate weighted choice impacts
  6. Heavy rounds (3 and 4) show a content note with a visible pass option before displaying the scenario
**Plans:** 3/3 plans complete
Plans:
- [x] 03-01-PLAN.md — Shared leaf components (MeterBar, TimerDisplay, FrameworkLabel, CityPlaceholder) + HostSetup page + routing
- [x] 03-02-PLAN.md — Player game loop (ScenarioCard, ContentNote, ConsequenceReveal + Play.jsx rewrite)
- [x] 03-03-PLAN.md — Host game loop (VoteTally, WorldStatePanel + Host.jsx round state machine, timer, world state)
**UI hint**: yes

### Phase 4: End State
**Goal**: Players see their framework profile and the intellectual framing that makes the game meaningful; host sees group patterns
**Depends on**: Phase 3
**Requirements**: END-01, END-02, END-03, END-04, END-05, END-06, END-07
**Success Criteria** (what must be TRUE):
  1. Each player sees their dominant framework identified by name with a full explanation paragraph (not a score, a lens)
  2. If cross-round framework tension is detected, the player sees a named conflict description identifying which rounds conflicted and the philosophical concept it represents
  3. Each player sees a "framework you used least" prompt and their full round-by-round choice log
  4. Round 6 shows a free-text reflection input; submitted responses are stored and appear anonymously on the host end view
  5. Host end view shows group framework breakdown (% per framework) across all players
**Plans:** 2/2 plans complete
Plans:
- [x] 04-01-PLAN.md — FrameworkProfile component (player end screen) + computeNarrative utility
- [x] 04-02-PLAN.md — Wire Host.jsx (endSession, end view, reflection feed) + Play.jsx (Round 6, profile reveal, reflection input)
**UI hint**: yes

### Phase 5: Deploy + Polish
**Goal**: The game is deployed to a public URL and confirmed reliable for a live 25-person classroom presentation
**Depends on**: Phase 4
**Requirements**: INFRA-05, POLISH-01, POLISH-02
**Success Criteria** (what must be TRUE):
  1. A `vite build` produces a dist/ folder that deploys successfully to Netlify or Vercel and loads at a public URL
  2. The player view is fully usable on a phone — no horizontal scroll, all buttons reachable with thumbs, scenario text readable without zooming
  3. A simulated load test with 20+ simultaneous Supabase real-time subscriptions completes without dropped events or visible lag in vote tallies or world state updates
**Plans:** 3/3 plans executed
Plans:
- [x] 05-01-PLAN.md — QR code, query param pre-fill, page metadata, build + Netlify deploy checkpoint
- [x] 05-02-PLAN.md — Mobile CSS audit and fixes (color-scheme, reduced-motion, focus rings, touch targets)
- [x] 05-03-PLAN.md — Load test script (25 concurrent Supabase subscriptions)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/2 | Planning complete | - |
| 2. Session Flow | 2/2 | Complete   | 2026-03-25 |
| 3. Game Loop | 3/3 | Complete   | 2026-03-25 |
| 4. End State | 2/2 | Complete   | 2026-03-26 |
| 5. Deploy + Polish | 3/3 | In Progress|  |
| 6. Kingdom UI Overhaul | 2/3 | In Progress|  |

### Phase 6: Kingdom UI Overhaul
**Goal**: All 4 screens express the fantasy kingdom aesthetic — CSS kingdom map replaces placeholder city, pack drives round count (no selector), Landing/HostSetup/Host/Play redesigned with parchment/stone palette, landmark-driven world state indicators, and war council framing
**Depends on**: Phase 5 (or 05.1)
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07, UI-08
**Success Criteria** (what must be TRUE):
  1. HostSetup page has no round count selector; total_rounds in new session equals the pack's scenario count (kingdom-arc = 7)
  2. Host screen shows a CSS kingdom map with 4 named landmarks (Bridge of Accord, Citadel Beacon, Village Quarter, Fog of the Vale) instead of Three.js city / CityPlaceholder
  3. Landmark visual states update after each round based on world state values (flourishing / neutral / declining CSS classes)
  4. Landing page has kingdom-appropriate heading, palette, and copy ("Enter the Crossroads" or equivalent)
  5. Player (Play) view scenario text is framed as a scroll/parchment card; choice buttons are styled as decree tiles
  6. `vite build` completes without errors after all changes
**Plans:** 2/3 plans executed
Plans:
- [x] 06-01-PLAN.md — KingdomMap component + CSS tokens + Landing redesign + HostSetup pack card
- [x] 06-02-PLAN.md — Play view decree tiles, amber flourish, atmospheric copy, decree headers
- [x] 06-03-PLAN.md — Host.jsx KingdomMap integration + MeterBar landmark labels everywhere

### Phase 05.1: Visual Experience Overhaul (INSERTED)

**Goal:** Transform the functional-but-flat UI into a premium cinematic glass-morphism experience with ambient gradients, Framer Motion transitions, and atmosphere tint driven by world state
**Requirements**: D-01, D-02, D-03, D-04, D-05, D-06, D-07, D-08, D-09, D-10, D-11, D-12
**Depends on:** Phase 5
**Plans:** 3/3 plans complete

Plans:
- [x] 05.1-01-PLAN.md — Install framer-motion, Google Fonts, CSS atmospheric tokens, ambient layer, App.jsx AnimatePresence
- [x] 05.1-02-PLAN.md — Glass-morphism + typography + meter gradients + button glow across all component and page CSS modules
- [ ] 05.1-03-PLAN.md — Framer Motion page transitions, round fade-through, FrameworkProfile stagger, atmosphere tint, glass card wrappers
