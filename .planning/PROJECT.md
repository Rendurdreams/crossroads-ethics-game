# The Crossroads

## What This Is

A real-time multiplayer ethics game for a college critical thinking presentation. The presenter runs a host dashboard on a projected screen while classmates join on their phones via room code. Each round presents a moral dilemma — players choose privately, results aggregate live, and the end screen reveals which ethical frameworks drove each player's decisions *and* where their choices diverged from their own stated personal values.

The central lesson: ethics (reasoned systems) and morals (personal values) are not the same thing. The game makes that tension visible and named.

The host screen runs a Three.js 3D scene tied to world state. Three scenario packs are available: kingdom fantasy arc, real-world modern dilemmas, and sci-fi/future thought experiments.

**Presentation context:** College critical thinking class, ~10–25 classmates, 15 min live.
**Session length:** Fixed by pack content (kingdom-arc = 7 rounds).

## Current Milestone: v1.1 Immersion + Moral Identity

**Goal:** Make the game feel cinematic and personally revelatory — Three.js host scene, 3 scenario packs, and a moral profile layer that shows players when their choices conflict with their own stated values.

**Target features:**
- Moral profile layer: join-time value baseline → in-round conflict hints → end-screen moral vs ethics conflict map
- 2 new scenario packs (real-world modern, sci-fi/future) + pack selection on HostSetup
- Three.js 3D host scene replacing CSS KingdomMap
- Dramatic round-close reveal beat on host screen
- AI layer hooks: data shape and integration points for personalized debrief, dynamic scenarios, discussion prompts (no live AI calls)

## Core Value

Players finish the game understanding that ethics and morals are not the same thing — and that their own reasoning, now visible to them, belongs to a named philosophical tradition.

## Requirements

### Validated (v1.0)

- ✓ Vite + React project scaffold with Supabase client and routing dependencies — v1.0
- ✓ Complete Supabase schema: sessions, players, choices, reflections tables with RLS + real-time — v1.0
- ✓ Scenario library: kingdom-arc pack with 7 dilemmas, framework tags, world impacts — v1.0
- ✓ Framework detection: computeProfile(), findConflicts(), 4 frameworks + conflict pairs (24 tests passing) — v1.0
- ✓ World state engine: applyChoicesToWorld() with weighted aggregate — v1.0
- ✓ Host can create a session with a room code and control round progression — v1.0
- ✓ Players join on their phones with name + room code, no login required — v1.0
- ✓ Each round shows a scenario with 3 decree-tile choices; players submit privately — v1.0
- ✓ Host sees live vote tally and can close the round — v1.0
- ✓ Players receive a private consequence after each round closes — v1.0
- ✓ Framework label revealed to player after they choose (not before) — v1.0
- ✓ World state (4 CSS landmark meters) updates after each round based on aggregate choices — v1.0
- ✓ End screen shows each player their dominant framework, conflict map, and choice log — v1.0
- ✓ Host end view shows group framework breakdown and anonymous reflection feed — v1.0
- ✓ Round 6 is a free-text reflection (no choice buttons) — v1.0
- ✓ App deployed to Netlify/Vercel, load-tested at 25 concurrent subscriptions — v1.0
- ✓ Full glass-morphism cinematic UI: Framer Motion transitions, amber gradients, Playfair Display — v1.0
- ✓ CSS KingdomMap replaces Three.js city; decree tile choice buttons; war council atmospheric copy — v1.0

### Active (v1.1 in progress)

- ✓ Moral baseline at join time: value ranking (5 values) + 2 stance questions, stored in Supabase as `moral_values` + `moral_stances` on player row — validated in Phase 7
- ✓ Multi-pack system: host selects from kingdom-arc, real-world-modern, or futures scenario packs; `pack_id` + `total_rounds` written to Supabase on lobby open; game loop resolves pack dynamically — validated in Phase 8

### Out of Scope (v2+)

- 3D Three.js city — replaced by CSS KingdomMap; 3D deferred indefinitely
- Animated SVG meter bars on player phones — static CSS for v1; v2 candidate
- Timer + pause/extend — not implemented in v1; v2 candidate
- QR code visible in lobby — HostSetup has QR code; v1 done
- AI-generated debrief commentary — parked; may add after classroom test
- AI-generated scenarios — parked; fixed scenario library is sufficient
- OAuth / accounts — no login; localStorage only
- Mobile app — web-first, phone-optimized responsive layout

## Context

- **Tech stack:** React 18 (Vite 8), Supabase v2, Framer Motion 11, CSS Modules — no TypeScript
- **Codebase:** ~5,200 LOC (src/ JSX + CSS)
- **Scenario packs:** 3 packs — kingdom-arc (8 rounds), real-world-modern "Common Ground" (7 rounds), futures "The Weight of Tomorrow" (7 rounds); AI-injectable pack schema with `ai_generated` + `generator_prompt` fields
- **Deployment:** Netlify / Vercel via `vite build`; dist/ is deployment artifact
- **Session model:** No auth — player_id + session_id in localStorage; ephemeral sessions
- **Build:** Clean at 491ms, 459 modules

## Constraints

- **Tech stack**: React + Vite + Supabase — decided, not up for debate
- **No TypeScript**: Plain JavaScript only
- **Phone rendering**: No Three.js on player phones — too slow/crash-prone
- **Session**: No auth — localStorage only; sessions are ephemeral
- **Presentation**: Must work reliably with 10–25 simultaneous Supabase subscriptions

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Defer 3D city to v2 | Days timeline; CSS KingdomMap delivers kingdom aesthetic with zero Three.js overhead | ✓ Good — KingdomMap ships, looks polished |
| Defer animated meters to v2 | Same reason — CSS class-based tier states sufficient | ✓ Good — flourishing/neutral/declining works cleanly |
| Park AI layer | Not sure what it should do yet; don't design around uncertainty | — Pending |
| No TypeScript | Speed; presenter is building fast for a class deadline | ✓ Good — zero type friction during development |
| Supabase real-time | Simplest way to sync host/player state without a custom server | ✓ Good — broadcast + postgres_changes pattern worked reliably |
| Open RLS policies | Classroom deployment; anon key covers all operations; no user data at risk | ✓ Good for v1 classroom use |
| UNIQUE(player_id, round_number) | Database-level double-submission prevention | ✓ Good — idempotency guaranteed |
| Broadcast channel for timer | Avoids adding timer columns to sessions schema | ✓ Good — no schema churn |
| framer-motion ^11.13.5 | React 19 peer dep compatibility | ✓ Good — AnimatePresence mode=wait works well |
| Pack-driven total_rounds | Removes manual round selector — pack content determines session length | ✓ Good — simpler UX, no pre-game configuration needed |
| KingdomMap fog inversion | High awareness = less fog; getTier() inverted for fog landmark | ✓ Good — semantically correct |
| Roman numeral ROMAN[choiceIndex] | Stays correct even if choices array order shifts | ✓ Good — resilient to data changes |

---

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-27 after Phase 8 (Multi-Pack System) — v1.1 milestone in progress*
