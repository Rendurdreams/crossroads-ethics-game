# Research Summary: The Crossroads

**Domain:** Real-time multiplayer web game (React + Supabase SPA)
**Researched:** 2026-03-25
**Overall confidence:** MEDIUM (web research tools unavailable; findings from training data through August 2025. All libraries in stable/mature state — low risk of staleness for this stack.)

---

## Executive Summary

The Crossroads is a well-scoped project with a stack that is largely decided and well-chosen. React + Vite + Supabase is a proven combination for small-to-medium real-time web apps in 2025. The architectural risk is not in library selection — it's in Supabase real-time subscription lifecycle management, which has well-known footguns (missing cleanup causing ghost subscriptions, missing initial fetch causing stale state on join). These are documented, understood, and preventable with explicit patterns.

The aesthetic goals (stark editorial, dark, typographic) are best served by hand-rolled CSS rather than any component library. No component library was designed for this visual territory — all of them would require heavy overriding and produce slower initial builds than just writing 8–10 custom components.

State management is the clearest non-decision: React's built-in hooks and Context cover all three state domains in this app (session, player, world state). Zustand and Redux would add dependency overhead for zero architectural benefit at this scale.

The only genuine technical uncertainty is in the Three.js phase (Phase 6). The CLAUDE.md spec references r128 via CDN — r128 is from 2021, and current Three.js is r167+. The API for CatmullRomCurve3 and instanced geometry is stable, but this should be verified before building the city scene. Using the npm package with tree-shaking is likely superior to CDN for a Vite project.

---

## Key Findings

**Stack:** React Router v6 + useState/Context + CSS Modules + @supabase/supabase-js v2 — no additional state library or component library needed.

**Architecture:** Single-page app with three routes (Landing, Host, Play), each managing its own Supabase subscription lifecycle. Host subscribes to 3 channels; each player subscribes to 1.

**Critical pitfall:** Missing `supabase.removeChannel(channel)` cleanup in useEffect return — causes duplicate events and memory leaks under the presentation's rapid round transitions.

---

## Implications for Roadmap

Based on research, the CLAUDE.md build order is sound. Suggested phase structure:

1. **Supabase Setup** — Schema, RLS, real-time enablement, manual subscription tests
   - Addresses: Database foundation all other phases depend on
   - Avoids: Discovering RLS blocks real-time events in Phase 4 (a common gotcha)

2. **Core Data Layer (/lib)** — supabase.js, scenarios.js, frameworks.js, detection.js, worldState.js
   - Addresses: Pure-function brain of the game; unit testable in isolation
   - Avoids: Debugging framework detection logic through UI noise

3. **Landing Page** — Session creation, player join, localStorage
   - Addresses: The entry point that generates session IDs all other pages need
   - Avoids: Hard-coding session IDs in development

4. **Host Dashboard (no Three.js)** — Real-time tally, round control, CSS meters
   - Addresses: Core game loop orchestration
   - Avoids: Blocking on Three.js before the game loop is validated

5. **Player View** — Session subscription, choice submission, consequence reveal, meter bars
   - Addresses: Player experience — the majority user flow
   - Avoids: Testing with fake data instead of real subscriptions

6. **Three.js City** — CityScene.jsx, meter visualizations, threshold events
   - Addresses: Visual payoff for host screen
   - Avoids: Skipping static scene validation before wiring to live data

7. **End State** — FrameworkProfile.jsx, host end view, session finalization
   - Addresses: Pedagogical payoff — the whole point of the game
   - Avoids: Rushing profile computation logic without testing conflict detection

8. **Polish** — Mobile audit, timers, transitions, load test, QR code
   - Addresses: Presentation reliability
   - Avoids: Discovering layout issues day-of

**Phase ordering rationale:**
- Supabase first because every other phase depends on confirmed real-time connectivity
- /lib second because detection.js and worldState.js are pure functions that should be validated before being called from UI components
- Host before Three.js because the game loop must work before visual polish is layered on
- End state last because it depends on all prior rounds completing correctly

**Research flags for phases:**
- Phase 6 (Three.js): Needs version verification — r128 vs current r167+; API compatibility check before building
- Phase 1 (RLS): RLS policies need explicit testing that real-time subscriptions are not blocked by row-level policies — this is a common Supabase gotcha worth validating early
- Phase 8 (Load test): 20+ concurrent Supabase subscriptions should be smoke-tested before the live presentation

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | React/Vite/Supabase all stable; specific library versions from training data but all are 2024–2025 stable releases |
| Features | HIGH | Feature set is fully specified in CLAUDE.md; no discovery needed |
| Architecture | HIGH | Three-route SPA with subscription-per-component is standard Supabase pattern |
| Supabase real-time patterns | HIGH | v2 channel API stable since 2022, well-documented, patterns are consistent across sources |
| Three.js version | MEDIUM | r128 specified in CLAUDE.md but is 2021-era; current is r167+; API likely compatible but unverified |
| Pitfalls | HIGH | Supabase real-time pitfalls are widely documented community knowledge |

---

## Gaps to Address

- **Three.js r128 vs current:** Before Phase 6, verify that `CatmullRomCurve3`, `FogExp2`, instanced `BoxGeometry`, and `SpotLight` API are unchanged between r128 and r160+. If switching to npm/tree-shaking, the import paths change from global `THREE.*` to named imports.
- **RLS + real-time interaction:** Supabase RLS policies that restrict SELECT can silently block real-time change delivery. This needs explicit testing in Phase 1 before any frontend work.
- **Anonymous reflection storage:** Round 6 free-text responses are not in the current schema design. A `reflections` table or jsonb column on sessions needs to be added.
