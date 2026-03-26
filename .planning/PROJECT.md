# The Crossroads

## What This Is

A real-time multiplayer ethics game for a college critical thinking presentation. The presenter runs a host dashboard on a projected screen while classmates join on their phones via room code. Each round presents a moral dilemma with no clean answer — players choose privately, results aggregate live, and the end screen reveals which ethical frameworks drove each player's decisions and where friction existed between frameworks.

**Presentation context:** College critical thinking class, ~10–25 classmates, 15 min live.
**Session length:** Modular — 3, 4, 5, or 6 rounds selected before starting.

## Core Value

Players finish the game understanding that ethics and morals are not the same thing — and that their own reasoning, now visible to them, belongs to a named philosophical tradition.

## Requirements

### Validated

- [x] Vite + React project scaffold with Supabase client and routing dependencies — Validated in Phase 01: Foundation
- [x] Complete Supabase schema: sessions, players, choices, reflections tables with RLS + real-time — Validated in Phase 01: Foundation
- [x] Scenario library: all 6 rounds with framework tags and world impacts — Validated in Phase 01: Foundation
- [x] Framework detection: computeProfile(), findConflicts(), all 4 frameworks + conflict pairs — Validated in Phase 01: Foundation
- [x] World state engine: applyChoicesToWorld() with weighted aggregate and threshold checking — Validated in Phase 01: Foundation

### Active

- [ ] Host can create a session with a room code and control round progression
- [ ] Players join on their phones with name + room code, no login required
- [ ] Each round shows a scenario with 3 choices; players submit privately
- [ ] Host sees live vote tally and can close the round
- [ ] Players receive a private consequence after each round closes
- [ ] Framework label revealed to player after they choose (not before)
- [ ] World state (4 meters) updates after each round based on aggregate choices
- [x] End screen shows each player their dominant framework, conflict map, and choice log — Validated in Phase 04: end-state
- [x] Host end view shows group framework breakdown and anonymous reflection feed — Validated in Phase 04: end-state
- [x] Round 6 is a free-text reflection (no choice buttons) — Validated in Phase 04: end-state

### Out of Scope (v1)

- 3D Three.js city — deferred; host dashboard uses plain CSS meters for now
- Animated SVG meter bars on player phones — deferred; static meters for v1
- AI-generated debrief commentary — parked; may add after classroom test
- AI-generated scenarios — parked; fixed scenario library is sufficient
- OAuth / accounts — no login, name + room code only
- Mobile app — web-first, phone-optimized responsive layout

## Context

- Tech stack is decided: React (Vite), Supabase (Postgres + real-time), no TypeScript required
- Full scenario library is designed (6 rounds, 3 choices each, framework-tagged with world impacts)
- Framework detection logic is designed (consequentialism, deontology, care ethics, virtue ethics)
- Supabase schema is designed (sessions, players, choices tables)
- Component structure is designed (see CLAUDE.md for full spec)
- Hosting: Netlify or Vercel drag-and-drop after `vite build`
- No login — player ID and session ID stored in localStorage
- **Style direction:** Stark editorial aesthetic — dark backgrounds, warm amber/gold accents, strong serif for scenario text, clean sans-serif for UI. "Crossroads" visual language: paths, choices, weight. Typography-forward, not gimmicky.
- Timeline is urgent — days to build for classroom test

## Constraints

- **Timeline**: Days — scope to functional v1; polish is v2
- **Tech stack**: React + Vite + Supabase — decided, not up for debate
- **No TypeScript**: Plain JavaScript only
- **Phone rendering**: No Three.js on player phones — too slow/crash-prone
- **Session**: No auth — localStorage only; sessions are ephemeral
- **Presentation**: Must work reliably with 10–25 simultaneous Supabase subscriptions

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Defer 3D city to v2 | Days timeline; real-time game loop is the core value, not visuals | — Pending |
| Defer animated meters to v2 | Same reason — CSS placeholders for v1 | — Pending |
| Park AI layer | Not sure what it should do yet; don't design around uncertainty | — Pending |
| No TypeScript | Speed; presenter is building fast for a class deadline | — Pending |
| Supabase real-time | Simplest way to sync host/player state without a custom server | — Pending |

---

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-25 after Phase 01 (Foundation) complete*
