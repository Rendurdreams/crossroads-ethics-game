---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Ethical Framework Depth
status: executing
stopped_at: Completed 12-02-PLAN.md
last_updated: "2026-03-30T14:59:41Z"
progress:
  total_phases: 1
  completed_phases: 0
  total_plans: 3
  completed_plans: 1
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-27)

**Core value:** Players finish understanding their own ethical reasoning — named, visible, connected to a philosophical tradition. In v1.1: they also see where their choices diverged from their own stated values.
**Current focus:** Phase 12 — ethical-framework-depth

## Current Position

Phase: 12 (ethical-framework-depth) — EXECUTING
Plan: 2 of 3 complete
Status: Executing Phase 12

```
v1.0 [██████████████████████] 100% (7/7 phases)
v1.1 [                      ]   0% (0/5 phases)
```

## Performance Metrics

**Velocity:**

- Total plans completed: 18 (v1.0)
- Average duration: ~140s/plan
- Total execution time: ~42 minutes

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: Phase 06 P01 185s, P02 3min, P03 261s
- Trend: Stable

*Updated after each plan completion*
| Phase 01-foundation P01 | 8 | 3 tasks | 10 files |
| Phase 01-foundation P02 | 3 | 3 tasks | 6 files |
| Phase 02-session-flow P01 | 8 | 2 tasks | 7 files |
| Phase 02-session-flow P02 | 3 | 2 tasks | 6 files |
| Phase 03-game-loop P01 | 132s | 2 tasks | 12 files |
| Phase 03-game-loop P03 | 107 | 2 tasks | 6 files |
| Phase 03-game-loop P02 | 145s | 2 tasks | 8 files |
| Phase 04-end-state P01 | 133s | 2 tasks | 3 files |
| Phase 04-end-state P02 | 228s | 2 tasks | 4 files |
| Phase 05-deploy-polish P01 | 103s | 1 tasks | 6 files |
| Phase 05-deploy-polish P02 | 71s | 2 tasks | 4 files |
| Phase 05-deploy-polish P03 | 4m | 1 tasks | 1 files |
| Phase 05.1-visual-experience-overhaul P01 | 70s | 2 tasks | 4 files |
| Phase 05.1-visual-experience-overhaul P03 | 360s | 2 tasks | 10 files |
| Phase 06-kingdom-ui-overhaul P02 | 3min | 2 tasks | 4 files |
| Phase 06-kingdom-ui-overhaul P01 | 185s | 3 tasks | 7 files |
| Phase 06-kingdom-ui-overhaul P03 | 261 | 2 tasks | 5 files |
| Phase 07-moral-profile-data-layer P01 | 142s | 3 tasks | 6 files |
| Phase 08-multi-pack-system P01 | 268 | 2 tasks | 5 files |
| Phase 08-multi-pack-system P02 | 63 | 1 tasks | 2 files |
| Phase 08-multi-pack-system P03 | 75s | 2 tasks | 2 files |
| Phase 09-three-js-host-scene P01 | 275 | 2 tasks | 9 files |
| Phase 10-host-ux-unification-reveal-beat P01 | 165 | 2 tasks | 2 files |
| Phase 09-three-js-host-scene P02 | 245 | 1 tasks | 1 files |
| Phase 11-moral-conflict-detection-end-screen-ai-hooks P01 | 240s | 2 tasks | 5 files |
| Phase 11-moral-conflict-detection-end-screen-ai-hooks P03 | 91 | 1 tasks | 3 files |
| Phase 12-ethical-framework-depth P02 | 246s | 2 tasks | 4 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Three.js 3D city deferred to v2 — CSS meters only for v1
- Animated SVG meters deferred to v2 — static CSS for v1
- No TypeScript — plain JavaScript throughout
- [Phase 01-foundation]: react-router-dom v7 installed by npm (not v6 as CLAUDE.md specifies) — will align in Plan 03 when routing is configured
- [Phase 01-foundation]: Open RLS policies selected for classroom deployment — anon key covers all operations
- [Phase 01-foundation]: UNIQUE(player_id, round_number) on choices table prevents double submission at database level
- [Phase 01-foundation]: Round 6 choices:[] — applyChoicesToWorld returns state unchanged for empty array (abstain/reflection round)
- [Phase 01-foundation]: Abstaining players excluded from choices array before worldState computation — function never receives abstain markers
- [Phase 02-session-flow]: BrowserRouter declarative mode selected (not createBrowserRouter data mode) — same v6 API, zero overhead for 3-page SPA
- [Phase 02-session-flow]: maybeSingle() used for room code lookup — returns null on miss instead of throwing, enables user-friendly error messages
- [Phase 02-session-flow]: fetch-then-subscribe pattern in Host.jsx with dedup by player id to handle race condition
- [Phase 02-session-flow]: Three separate useEffects in Play.jsx for mount restore, players subscription, session subscription
- [Phase 03-game-loop]: MeterBar uses conditional CSS class for danger color — keeps smooth transitions without JS state toggling
- [Phase 03-game-loop]: FrameworkLabel animates on mount via CSS keyframe with no state toggle — parent controls delay if needed
- [Phase 03-game-loop]: HostSetup page added between Landing and Host lobby — host preparation moment before projecting (D-08)
- [Phase 03-game-loop]: useRef for persistent timer broadcast channel — avoids Supabase channel churn on each tick
- [Phase 03-game-loop]: closeRound idempotent guard prevents double-close race between timer auto-close and manual close button
- [Phase 03-game-loop]: Broadcast channel (not postgres_changes) used for player-side timer sync — avoids adding timer columns to sessions schema
- [Phase 03-game-loop]: Pass flow: passer receives world state meters on round_complete but no framework label
- [Phase 04-end-state]: leastUsed computed locally in FrameworkProfile from framework_counts — avoids re-importing detection.js
- [Phase 04-end-state]: computeNarrative checks interesting combinations before individual meters — prevents contradictory sentence assembly
- [Phase 04-end-state]: endSession uses Promise.all batch writes before setting finished — prevents race where players see finished before profile data is available
- [Phase 04-end-state]: Player re-fetch on finished in both subscription and mount restore paths — handles live and page-refresh cases
- [Phase 05-deploy-polish]: qrcode.react@4.2.0 used instead of planned v3 — React 19 peer dep requires v4.2.0 minimum; API surface unchanged
- [Phase 05-deploy-polish]: QR code color contract: bgColor=#12121e (app dark bg), fgColor=#f5f0e8 (app warm text) — matches app palette exactly
- [Phase 05-deploy-polish]: EVENT_COUNT=6 in load test matches max game rounds, avoids UNIQUE(player_id, round_number) constraint issues with single test player
- [Phase 05-deploy-polish]: Global reduced-motion guard at index.css level covers all components — component-level rules still apply but global catches future additions
- [Phase 05.1-visual-experience-overhaul]: framer-motion ^11.13.5 selected for React 19 peer dep compatibility
- [Phase 05.1-visual-experience-overhaul]: App split into App + AppRoutes — useLocation must be inside BrowserRouter
- [Phase 05.1-visual-experience-overhaul]: AnimatePresence mode=wait for cinematic fade-through per D-11
- [Phase 05.1-visual-experience-overhaul]: roundKey includes both current_round and status to fire transition at round close, not only round advance
- [Phase 05.1-visual-experience-overhaul]: computeWarmth helper inline in Host.jsx and Play.jsx — worldState not available at App.jsx level
- [Phase 05.1-visual-experience-overhaul]: glass .card CSS added in Plan 03 to unblock parallel execution with Plan 02
- [Phase 06-kingdom-ui-overhaul]: ROMAN[choice.choiceIndex] used for Roman numeral span — stays correct even if choices array order shifts
- [Phase 06-kingdom-ui-overhaul]: All Play.jsx atmospheric copy uses war council register: council, decree, realm, counsel throughout waiting/pass/round states
- [Phase 06-kingdom-ui-overhaul]: KingdomMap fog landmark uses inverted CSS classes — fogDeclining at high opacity when awareness is low
- [Phase 06-kingdom-ui-overhaul]: Pack identity card replaces round selector entirely — total_rounds set at session creation from pack, not HostSetup
- [Phase 06-kingdom-ui-overhaul]: KingdomMap imported directly (not lazy) — SVG component in same bundle; no code-splitting benefit
- [Phase 06-kingdom-ui-overhaul]: Removed totalRounds local state from Host.jsx; session.total_rounds from DB is source of truth
- [v1.1 roadmap]: Three.js moves from "deferred to v2" to active v1.1 scope — PACK-05 and AI-03 share phase 8; AI-03 placed in Phase 8 (pack schema shape) not Phase 11 (AI stubs) because the pack shape is pack system work
- [v1.1 roadmap]: MORAL-03/04 held for Phase 11 (not Phase 7) — detection logic requires choice framework tags to exist; Phase 7 only stores the baseline; detection runs at choice-lock time after game loop is complete
- [Phase 07-moral-profile-data-layer]: Stance Q2 additionally gated until Q1 has an answer — prevents out-of-order responses without hiding content
- [Phase 07-moral-profile-data-layer]: Stance answers allow re-selection unlike in-round decree tiles that lock permanently — baseline is pre-game introspection
- [Phase 08-multi-pack-system]: realWorldModernPack named Common Ground — contemporary interpersonal and community dilemmas at college-maturity tone
- [Phase 08-multi-pack-system]: futuresPack named The Weight of Tomorrow — near-future personal dilemmas in 2040 context, no space opera framing
- [Phase 08-multi-pack-system]: JSDoc @typedef schema added above packs export in scenarios.js — makes pack shape machine-readable for AI generation tools (D-13)
- [Phase 08-multi-pack-system]: Pack selection persisted to Supabase before navigating to lobby — session row has pack_id and total_rounds before any player joins
- [Phase 08-multi-pack-system]: total_rounds = getPlayableScenarios(pack).length + 1 to include reflection round in session total
- [Phase 08-multi-pack-system]: Pack resolved in mount fetch via getPackById(session.pack_id) — not module-level constant; reflection guard uses getReflectionScenario(pack) for pack-agnostic detection
- [Phase 09-three-js-host-scene]: Procedural GLB files generated via custom Node.js binary writer — GLTFExporter requires browser APIs; manual GLB 2.0 format used to create valid anchor meshes that useGLTF can load
- [Phase 10-host-ux-unification-reveal-beat]: lerpSpeedRef as useRef not useState in Host.jsx — avoids re-render chain when timer state changes (Pitfall 2)
- [Phase 10-host-ux-unification-reveal-beat]: FogController converted to useFrame lerp — eliminates jarring instant fog jump during reveal beat (Pitfall 4)
- [Phase 10-host-ux-unification-reveal-beat]: lerpSpeedRef.current = 8 set before await supabase in closeRound — prevents race with Supabase subscription delivering new world_state before fast lerp is active
- [Phase 10-host-ux-unification-reveal-beat]: Host round view uses individually fixed-position glass pills (HUD) instead of flex panel layout — canvas fills 100% screen at all times per D-07
- [Phase 09-three-js-host-scene]: Always-mounted Three.js lights (not conditional render) — refs must persist across frames for useFrame lerp to work
- [Phase 09-three-js-host-scene]: Three separate window materials in VillageQuarter for independent staggered blackout wave via setTimeout
- [Phase 09-three-js-host-scene]: Dawn DirectionalLight managed imperatively (scene.add/remove) in FogController — avoids R3F conditional component mount
- [Phase 11-moral-conflict-detection-end-screen-ai-hooks]: VALUE_FRAMEWORK_MAP honesty maps to [deontology, virtue]; no-double-fire guard ensures value conflict takes priority over stance conflict per round
- [Phase 11-moral-conflict-detection-end-screen-ai-hooks]: moralConflictIndicator uses 2200ms animation-delay — positions it as the final beat after tension section (1900ms + 350ms duration)
- [Phase 11-moral-conflict-detection-end-screen-ai-hooks]: ai.js returns null for all three stubs — documents LLM payload contract without live AI calls; group_debrief_context groups notable moral conflicts by player top value for pedagogically useful patterns
- [Phase 12-ethical-framework-depth]: hasMoralConflict prop passed from Play.jsx to ConsequenceReveal — parent controls amber border visual while component retains internal moral conflict text indicator
- [Phase 12-ethical-framework-depth]: awareness_log stored as JSONB on player row — no schema migration needed for tracking prompt shown/dismissed per round

### Roadmap Evolution

- Phase 05.1 inserted after Phase 05: Visual Experience Overhaul (URGENT) — Premium modern emotional design across the entire app. Replace flat UI with atmospheric, immersive game experience. Emotional tone: weight, reflection, moral gravity. Uses Stitch, nanabana, ui-ux-pro-max design tools.
- v1.1 phases 7–11 defined 2026-03-27: Moral Profile Data Layer, Multi-Pack System, Three.js Host Scene, Host UX Unification + Reveal Beat, Moral Conflict Detection + End Screen + AI Hooks

### Pending Todos

None yet.

### Blockers/Concerns

- **Phase 9 (Three.js)**: r128 was previously noted as the CDN target; v1.1 uses npm with r160+ — verify CatmullRomCurve3 and other APIs are still compatible before implementation
- **Phase 7 (moral baseline UI)**: Join flow currently goes Landing → lobby wait; inserting a baseline step adds latency before a player sees the lobby — design must not feel like a survey gatekeeping the game

## Session Continuity

Last session: 2026-03-30T14:59:41Z
Stopped at: Completed 12-02-PLAN.md
Resume file: .planning/phases/12-ethical-framework-depth/12-02-SUMMARY.md
Next action: Continue Phase 12 execution
