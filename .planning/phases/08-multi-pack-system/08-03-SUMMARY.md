---
phase: 08-multi-pack-system
plan: "03"
subsystem: game-loop
tags: [pack-system, host, play, session-state, reflection-guard]
dependency_graph:
  requires: [08-01]
  provides: [pack-aware-host, pack-aware-play]
  affects: [src/pages/Host.jsx, src/pages/Play.jsx]
tech_stack:
  added: []
  patterns: [session-aware-pack-resolution, null-guard-before-render]
key_files:
  created: []
  modified:
    - src/pages/Host.jsx
    - src/pages/Play.jsx
decisions:
  - "Pack resolved via useState(null) + setPack(getPackById(data.pack_id)) in mount fetch — not module-level constant"
  - "Reflection guard changed from total_rounds === 6 to getReflectionScenario(pack) !== null — pack-agnostic for all three packs"
  - "Null guard added for pack state in both files — prevents render path from accessing pack.scenarios before fetch completes"
metrics:
  duration: 75s
  completed: "2026-03-28"
  tasks: 2
  files: 2
---

# Phase 8 Plan 3: Pack-Aware Game Loop — Host and Play Summary

Dynamic pack resolution wired into Host.jsx and Play.jsx via `getPackById(session.pack_id)` called in mount fetch; reflection guard made pack-agnostic using `getReflectionScenario(pack)`.

## What Was Built

Both Host.jsx and Play.jsx previously bound `pack` at module level via `getDefaultPack()` — a constant that always returned `kingdom-arc` regardless of which pack the host selected. This plan wires both files to resolve the correct pack from the live session data.

**Host.jsx changes:**
- Import swapped from `getDefaultPack` to `getPackById`
- Module-level `const pack = getDefaultPack()` removed
- `const [pack, setPack] = useState(null)` added to component state
- `setPack(getPackById(data.pack_id))` called in the mount fetch `.then()` after `setSession(data)`
- Null guard added before main render: `if (!pack) return <div>Loading...</div>`

**Play.jsx changes:**
- Import swapped from `getDefaultPack` to `getPackById`
- Module-level `const pack = getDefaultPack()` removed
- `const [pack, setPack] = useState(null)` added to component state
- `setPack(getPackById(sessionData.pack_id))` called in the localStorage restore session fetch
- Reflection guard fixed: `pack !== null && getReflectionScenario(pack) !== null` replaces `session?.total_rounds === 6`
- Null guard added before main render using `motion.div` wrapper consistent with existing loading states

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Pack resolved in mount fetch, not subscription handler | The mount fetch runs once on load; subscription updates fire only when session changes after mount. Setting pack from the initial fetch ensures it's available before any render path that uses it. |
| `getPackById` fallback behavior | `getPackById` already falls back to `packs[0]` (kingdom-arc) when `pack_id` is null — pre-migration sessions without `pack_id` automatically get kingdom-arc. No special handling needed. |
| Reflection guard uses `getReflectionScenario(pack)` | Kingdom-arc has 7 playable + 1 reflection = 8 total_rounds. Real-world-modern and futures have 6 playable + 1 reflection = 7 total_rounds. Hardcoded `=== 6` check was always wrong for kingdom-arc. Pack-agnostic check works for all three packs and any future pack that omits reflection (returns false). |
| Both null guards use same loading UI | Consistent with existing loading state pattern in each file — avoids introducing new UI variants for an edge case that lasts < 100ms in practice. |

## Deviations from Plan

None — plan executed exactly as written. The worktree required a fast-forward merge from `main` to acquire the 08-01 work (scenarios.js pack registry + `getPackById` export) before any changes could be made. This was expected given the parallel agent execution model.

## Verification

- `grep -q "getPackById" src/pages/Host.jsx` — PASS
- `! grep -q "getDefaultPack" src/pages/Host.jsx` — PASS
- `grep -q "setPack(getPackById" src/pages/Host.jsx` — PASS
- `grep -q "useState(null)" src/pages/Host.jsx` — PASS
- `grep -q "getPackById" src/pages/Play.jsx` — PASS
- `! grep -q "getDefaultPack" src/pages/Play.jsx` — PASS
- `grep -q "setPack(getPackById" src/pages/Play.jsx` — PASS
- `! grep -q "total_rounds === 6" src/pages/Play.jsx` — PASS
- `grep -q "getReflectionScenario(pack)" src/pages/Play.jsx` — PASS
- `npm run build` — PASS (459 modules, 470ms, no errors)

## Known Stubs

None. Pack resolution is fully wired to live session data. The `getPackById` fallback to `packs[0]` is intentional behavior for null pack_id, not a stub.

## Self-Check: PASSED
