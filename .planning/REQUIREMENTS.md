# Requirements: The Crossroads

**Defined:** 2026-03-25
**Core Value:** Players finish the game understanding their own ethical reasoning — named, visible, and connected to a philosophical tradition.

## v1 Requirements

### Host Session

- [x] **HOST-01**: Host can create a new session and receive a 4-digit room code
- [x] **HOST-02**: Host can select round count (3, 4, 5, or 6) before starting
- [x] **HOST-03**: Host can start the game when 2 or more players have joined
- [x] **HOST-04**: Host sees a live roster of joined players (name + emoji) in the lobby
- [x] **HOST-05**: Host can close the current round to lock all choices
- [x] **HOST-06**: Host can advance to the next round after closing
- [x] **HOST-07**: Host sees live anonymous vote tally (% per choice) updating in real time during each round
- [x] **HOST-08**: Host sees "X of Y submitted" counter during each round
- [x] **HOST-09**: Host sees current world state (4 meters) after each round closes
- [x] **HOST-10**: Room code is displayed large enough to read from the back of a classroom

### Player Session

- [x] **PLAY-01**: Player joins by entering name + 4-digit room code (no login required)
- [x] **PLAY-02**: Player is assigned an emoji avatar on join
- [x] **PLAY-03**: Player identity (player_id, session_id) persists across phone page refresh via localStorage
- [x] **PLAY-04**: Player sees scenario text and 3 choice buttons each round
- [x] **PLAY-05**: Player's choice locks on tap with optimistic UI (no second submission possible)
- [x] **PLAY-06**: Player sees framework label for their choice after locking (not before)
- [x] **PLAY-07**: Player sees private consequence text after host closes the round
- [x] **PLAY-08**: Player sees "X of Y submitted" counter while waiting for others
- [x] **PLAY-09**: Player sees a content note with pass option on heavy rounds (Rounds 3 and 4)
- [x] **PLAY-10**: Player sees current world state (4 CSS meters) after each round closes

### Scenarios & Framework Logic

- [x] **DATA-01**: Full scenario library loaded from scenarios.js (all 6 rounds, 3 choices each, framework tags, world impacts, consequence text)
- [x] **DATA-02**: Framework detection computes dominant framework per player after all rounds
- [x] **DATA-03**: Conflict detection identifies cross-round framework tensions with named description
- [x] **DATA-04**: World state update function applies aggregate weighted choice impacts after each round
- [x] **DATA-05**: Pass / abstain behavior defined: abstaining player contributes no weight to world state and no framework count; stored as no-row (not submitted)

### End State

- [x] **END-01**: Each player sees their dominant framework with a full explanation paragraph
- [x] **END-02**: Each player sees a conflict map if cross-round framework tension detected, named with the philosophical concept
- [x] **END-03**: Each player sees a "framework you used least" prompt
- [x] **END-04**: Each player sees their full choice log (round, choice, framework)
- [x] **END-05**: Round 6 shows a free-text reflection input; responses stored anonymously
- [x] **END-06**: Host end view shows group framework breakdown (% per framework overall)
- [x] **END-07**: Host end view shows anonymous reflection responses as they're submitted

### Infrastructure

- [x] **INFRA-01**: Supabase schema created (sessions, players, choices, reflections tables) with `UNIQUE(player_id, round_number)` constraint on choices
- [x] **INFRA-02**: RLS policies configured — anon role can read sessions, insert own player row, insert own choices; verified that real-time subscriptions are not silently blocked
- [x] **INFRA-03**: Real-time enabled on sessions, players, and choices tables
- [x] **INFRA-04**: Supabase client initialized as singleton with environment variable discipline (service role key never exposed via VITE_ prefix)
- [ ] **INFRA-05**: App deploys to Netlify or Vercel from `vite build` output

### Polish (Required Before Presentation)

- [ ] **POLISH-01**: Player view is fully usable on a phone (no horizontal scroll, buttons reachable with thumbs)
- [x] **POLISH-02**: Load test passes — 20+ simultaneous Supabase real-time subscriptions without dropped events or lag

## v2 Requirements

### Visual Enhancements

- **VIS-01**: Three.js 3D city on host screen — bridge, lighthouse, windows, fog reacting to world state meters
- **VIS-02**: Threshold events — bridge split, lighthouse out, blackout wave, sunrise when meters cross critical values
- **VIS-03**: Animated SVG meter bars on player phones (BridgeMeter, LighthouseMeter, TrainMeter, FogMeter)
- **VIS-04**: Timer pressure animation — shrinking bar with color shift near zero
- **VIS-05**: Transition animations between rounds

### AI Layer (Parked)

- **AI-01**: AI-generated personalized debrief commentary — explains player's framework pattern in natural language
- **AI-02**: AI-generated scenario variations (alternative to fixed library)

### Convenience

- **CONV-01**: QR code generator for room code — players scan from projected screen instead of typing
- **CONV-02**: Round timer — host sets 30–90 sec, can pause/extend

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts / login | Ephemeral sessions are the design; localStorage is sufficient |
| Leaderboard / score | Deliberately anti-genre; ranking contradicts the game's purpose |
| Speed bonus | Same — this is not Kahoot |
| "Correct answer" reveal | There is no correct answer; showing one would destroy the lesson |
| Mid-round chat | Distraction during choices; debrief is Jay's job |
| Mobile app (iOS/Android) | Web-first; phone-optimized responsive layout is sufficient |
| Real-time chat | Not needed; host controls the debrief verbally |
| Video posts / media uploads | Out of scope entirely |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Complete |
| INFRA-02 | Phase 1 | Complete |
| INFRA-03 | Phase 1 | Complete |
| INFRA-04 | Phase 1 | Complete |
| DATA-01 | Phase 1 | Complete |
| DATA-02 | Phase 1 | Complete |
| DATA-03 | Phase 1 | Complete |
| DATA-04 | Phase 1 | Complete |
| DATA-05 | Phase 1 | Complete |
| HOST-01 | Phase 2 | Complete |
| HOST-02 | Phase 2 | Complete |
| HOST-03 | Phase 2 | Complete |
| HOST-04 | Phase 2 | Complete |
| HOST-10 | Phase 2 | Complete |
| PLAY-01 | Phase 2 | Complete |
| PLAY-02 | Phase 2 | Complete |
| PLAY-03 | Phase 2 | Complete |
| HOST-05 | Phase 3 | Complete |
| HOST-06 | Phase 3 | Complete |
| HOST-07 | Phase 3 | Complete |
| HOST-08 | Phase 3 | Complete |
| HOST-09 | Phase 3 | Complete |
| PLAY-04 | Phase 3 | Complete |
| PLAY-05 | Phase 3 | Complete |
| PLAY-06 | Phase 3 | Complete |
| PLAY-07 | Phase 3 | Complete |
| PLAY-08 | Phase 3 | Complete |
| PLAY-09 | Phase 3 | Complete |
| PLAY-10 | Phase 3 | Complete |
| END-01 | Phase 4 | Complete |
| END-02 | Phase 4 | Complete |
| END-03 | Phase 4 | Complete |
| END-04 | Phase 4 | Complete |
| END-05 | Phase 4 | Complete |
| END-06 | Phase 4 | Complete |
| END-07 | Phase 4 | Complete |
| INFRA-05 | Phase 5 | Pending |
| POLISH-01 | Phase 5 | Pending |
| POLISH-02 | Phase 5 | Complete |

**Coverage:**
- v1 requirements: 32 total
- Mapped to phases: 32
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-25 after initial definition*
