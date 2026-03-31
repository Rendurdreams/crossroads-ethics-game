# Requirements: The Crossroads v2.0

**Defined:** 2026-03-31
**Milestone:** v2.0 — Signal Lost
**Core Value:** Players experience a sci-fi senator ethics simulation where dynamic personal stakes, facilitator-controlled discussion, and permanent world consequences make moral reasoning visible, named, and irreversible.

---

## Scenario Pack

- [ ] **PACK-01**: Signal Lost scenario pack with 8 rounds, framework tags, axis deltas, conscience layers, and discussion prompts defined in src/lib/scenarios/packs/signal-lost.js
- [ ] **PACK-02**: Each of 8 scenarios has 3 choices (R7 has 4) with world impact deltas for CT/HD/SOL/ACC axes, starting at 65
- [ ] **PACK-03**: Pack includes per-round discussion prompts (2-3 per round) and conflict spotlight pairs
- [ ] **PACK-04**: Signal Lost is the default pack when creating a new session

## World Axes

- [ ] **AXIS-01**: World state uses 4 axes (Civil Trust, Human Dignity, Solidarity, Accountability) starting at 65/100 for Signal Lost pack
- [ ] **AXIS-02**: Axis keys (CT, HD, SOL, ACC) are named constants; applyChoicesToWorld dispatches based on pack axisSet
- [ ] **AXIS-03**: Meter bars on host and player views display the correct axis names for the active pack

## Senator Profiles

- [ ] **PROF-01**: 6 senator profiles (A-F) with name, subtitle, per-round stakes, and variable descriptions stored in lib file
- [ ] **PROF-02**: Player is randomly assigned a profile at join time; profile_id persisted to Supabase players row
- [ ] **PROF-03**: In classroom sessions, profile distribution is balanced (round-robin across 6 profiles)
- [ ] **PROF-04**: Player sees their profile card (name, subtitle) and per-round "YOUR STAKE" panel before each choice
- [ ] **PROF-05**: Profile assignment is visible to host in the player roster

## Break Flags

- [ ] **FLAG-01**: Break flags are permanent boolean markers on sessions.break_flags (jsonb), set when specific choices are made
- [ ] **FLAG-02**: 7 break flag triggers defined (R1-III, R2-I, R3-II, R4-II, R5-I, R6-II, R7-IV) per spec
- [ ] **FLAG-03**: Active break flags display as persistent visual markers on the host AnimatedMap
- [ ] **FLAG-04**: Break flags are cited in the Round 8 scribe record text

## Discussion Mode

- [ ] **DISC-01**: Host selects discussion or standard mode at session creation; mode stored on sessions row
- [ ] **DISC-02**: After each round close in discussion mode, a Discussion Pause Screen appears on the host
- [ ] **DISC-03**: Discussion Pause shows: live vote distribution, profile breakdown (which profiles chose what), and 2-3 pre-written discussion prompts
- [ ] **DISC-04**: Conflict spotlight fires when key conflict pair profiles chose differently, surfacing both profiles' stakes
- [ ] **DISC-05**: Only the host can advance past the Discussion Pause (Continue button); players see a waiting state
- [ ] **DISC-06**: In standard mode (non-discussion), round flow works as it does today — no pause screens

## Grading Rubric

- [ ] **GRADE-01**: Grading rubric page accessible from host end screen showing 4 dimensions (Moral Reasoning 30pts, Personal Stake Awareness 20pts, Consequence Tracking 25pts, Closing Reflection 25pts)
- [ ] **GRADE-02**: Rubric displays score bands with descriptions per dimension for instructor reference
- [ ] **GRADE-03**: Bonus section (up to 10pts) for baseline value-behavior alignment is documented on the rubric

## Detection & Alerts

- [ ] **DETECT-01**: Signal Lost scenario IDs have their own STANCE_TRIGGERS in detection.js that do not collide with kingdom-arc triggers
- [ ] **DETECT-02**: Profile-aware conflict alerts appear between rounds when a choice contradicts a baseline stance answer
- [ ] **DETECT-03**: Conflict alerts are non-blocking — displayed briefly, do not prevent advancing

## Walk Mechanic (R6)

- [ ] **WALK-01**: Round 6 uses a position-based walk mechanic — player drags/moves avatar toward or away from terminal
- [ ] **WALK-02**: Crossing midpoint triggers Choice I; turning back triggers Choice II; stopping near terminal triggers Choice III
- [ ] **WALK-03**: Walk choice is submitted to Supabase like any other choice with the correct choice_index

## Round 8 Scribe Record

- [ ] **SCRIBE-01**: Round 8 generates a dynamic scribe record based on all prior choices, framework pattern, and break flags triggered
- [ ] **SCRIBE-02**: Scribe record includes the closing question "Would you make these choices again?"

---

## Traceability

| REQ ID | Phase | Status |
|--------|-------|--------|
| (populated by roadmapper) | | |

---

## Future Requirements (v2.1+)

- Solo mode (continuous play, no discussion pauses)
- Assessment export (JSON + PDF)
- Axis trajectory timeline chart (per-round line graph)
- Written reflection capture for assessment use

## Out of Scope

- UI redesign — reuse existing components and styles
- New animated map — reuse existing AnimatedMap with zone mapping for Signal Lost axes
- Solo mode and assessment export — deferred to v2.1
- Cross-session persistence — sessions remain ephemeral
