# Phase 16: Data Foundation - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning
**Source:** ROADMAP.md + REQUIREMENTS.md + signal_lost_phase_brief.md

<domain>
## Phase Boundary

Build the complete data foundation for Signal Lost v2.0: the scenario pack file (8 rounds, 3-4 choices each, framework tags, CT/HD/SOL/ACC axis deltas, conscience layers, discussion prompts, conflict spotlight pairs), axis constants as named exports, senator profile data (6 profiles with per-round stakes), break flag definitions, Supabase schema migrations (break_flags jsonb on sessions, senator_profile_id on players), pack-aware worldState dispatch, meter label display for active pack axes, Signal Lost as default pack, and Play.jsx pack loading fix.

No UI components are created or rewritten in this phase. This is pure data + plumbing.

</domain>

<decisions>
## Implementation Decisions

### D-01: Axis Constants as Named Exports
- Signal Lost uses CT/HD/SOL/ACC (Civil Trust, Human Dignity, Solidarity, Accountability)
- Kingdom Arc uses trust/courage/solidarity/awareness
- Create a constants file or per-pack `axisSet` that maps axis keys to display labels
- applyChoicesToWorld must dispatch based on pack's axisSet, not hardcoded keys
- Axis keys must be locked as named constants before any world state UI builds against them

### D-02: Pack Shape Extension
- Signal Lost pack follows same `ScenarioPack` shape as kingdom-arc
- New fields on pack: `axisSet` (maps axis keys to labels), `defaultWorldState` (starting values)
- Signal Lost worldImpact uses `{ CT, HD, SOL, ACC }` keys instead of `{ trust, courage, solidarity, awareness }`
- Starting world state for Signal Lost: `{ CT: 65, HD: 65, SOL: 65, ACC: 65 }`

### D-03: Senator Profiles as Separate File
- 6 profiles stored in src/lib/senatorProfiles.js
- Each profile: id, name, subtitle, variables (health/money/family/politics), stakes (r1-r8)
- Profiles are pure data — no UI logic in this phase
- Profile assignment logic (round-robin, random) also defined here

### D-04: Break Flag Definitions as Separate File
- 7 break flags stored in src/lib/breakFlags.js
- Each flag: id (e.g. 'R1-ghost'), round, triggerChoiceIndex, label, mapEffect description
- Pure definitions — rendering and R8 integration are Phase 17

### D-05: Discussion Prompts Embedded in Pack
- Each scenario in signal-lost.js includes a `discussionPrompts` array (2-3 strings)
- Each scenario includes a `conflictSpotlight` object: `{ profileA, profileB, description }`
- These are data-only in Phase 16 — Discussion Mode UI is Phase 18

### D-06: Supabase Schema Migrations
- Add `break_flags jsonb DEFAULT '{}'` to sessions table
- Add `senator_profile_id text` to players table
- Both are nullable — kingdom-arc sessions don't use them

### D-07: Play.jsx Pack Loading Fix
- Play.jsx currently hardcodes `getDefaultPack()` — must read `pack_id` from session
- This is a critical multi-pack bug that blocks Signal Lost from working on player phones

### D-08: Meter Label Display
- MeterBar.jsx receives `label` prop — currently hardcoded in Host.jsx as "Trust", "Courage", etc.
- Host.jsx and Play.jsx must derive meter labels from the active pack's axisSet
- AXIS-03 requirement — naming constants work, not UI redesign

</decisions>

<dependencies>
## Key File Dependencies

- `src/lib/scenarios.js` — Pack registry, must import signal-lost pack
- `src/lib/scenarios/packs/kingdom-arc.js` — Reference for pack data shape
- `src/lib/worldState.js` — applyChoicesToWorld needs pack-aware axis dispatch
- `src/lib/detection.js` — STANCE_TRIGGERS must not collide (but Signal Lost triggers are Phase 17)
- `src/components/MeterBar.jsx` — Receives label prop, no changes needed to component itself
- `src/pages/Host.jsx` — Meter label derivation from pack
- `src/pages/Play.jsx` — Pack loading fix + meter label derivation
- `src/pages/HostSetup.jsx` — Default pack selection
- `supabase/migrations/` — New migration file for schema changes

</dependencies>
