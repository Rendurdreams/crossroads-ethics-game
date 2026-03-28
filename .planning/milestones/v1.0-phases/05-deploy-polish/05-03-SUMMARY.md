---
phase: "05-deploy-polish"
plan: "03"
subsystem: "load-testing"
tags: ["load-test", "supabase", "real-time", "node", "scripts"]
dependency_graph:
  requires: ["@supabase/supabase-js"]
  provides: ["scripts/load-test.js"]
  affects: []
tech_stack:
  added: []
  patterns: ["Node.js ESM top-level await", "Promise.all SUBSCRIBED gate", "Supabase real-time channel filter"]
key_files:
  created:
    - scripts/load-test.js
  modified: []
decisions:
  - "EVENT_COUNT set to 6 (not 10) — matches max game rounds and avoids round_number constraint issues with a single test player"
  - "CHANNEL_COUNT = 25 with 2000ms timeout — represents worst-case classroom size"
  - "Room code generated with Math.random().toString(36).slice(2,6).toUpperCase() — unique per run, no collision risk"
  - "Session cleanup via DELETE + CASCADE — removes player and choice rows without per-row deletes"
metrics:
  duration: "~4 minutes"
  completed: "2026-03-26"
  tasks_completed: 1
  files_created: 1
---

# Phase 05 Plan 03: Load Test Script Summary

**One-liner:** Standalone Node.js ESM script opens 25 concurrent Supabase real-time channels, inserts 6 choice rows, and asserts all channels received all events within 2000ms — PASS/FAIL with cleanup.

## What Was Built

`scripts/load-test.js` — a standalone Node.js ESM load test script that:

1. Reads `SUPABASE_URL` and `SUPABASE_ANON_KEY` from `process.env` (not `import.meta.env` — no Vite)
2. Creates a temporary test session and player in the database
3. Opens `CHANNEL_COUNT = 25` real-time Supabase channels subscribed to `choices` table INSERT events filtered by `session_id`
4. Waits for all 25 channels to reach `SUBSCRIBED` status before writing any events (prevents race condition)
5. Inserts `EVENT_COUNT = 6` choice rows (one per round, one test player, unique round numbers)
6. Waits `TIMEOUT_MS = 2000ms` for events to propagate to all channels
7. Evaluates receipt: reports per-channel drop detail on FAIL
8. Removes all 25 channels and deletes the test session (CASCADE removes player + choices)
9. Exits `0` on PASS, `1` on FAIL

**Output format matches UI-SPEC Load Test Script Contract:**
```
[LOAD TEST] Created test session: {uuid} (room code: {code})
[LOAD TEST] Opening 25 subscriptions to session {uuid}...
[OK] All 25 channels active.
[TEST] Writing 6 choice inserts...
[RESULT] 25/25 channels received all 6 events within 2000ms — PASS
[CLEANUP] Test session removed.
```

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create load test script with 25 concurrent Supabase subscriptions | `7fab74c` | scripts/load-test.js |

## Deviations from Plan

None — plan executed exactly as written.

The plan itself noted a self-correction (EVENT_COUNT from 10 to 6) which was applied as specified.

## Known Stubs

None. This plan creates an infrastructure script, not UI components. No data flows, no rendering.

## How to Run

```bash
cd /path/to/MoralApp
SUPABASE_URL=https://yourproject.supabase.co SUPABASE_ANON_KEY=your_anon_key node scripts/load-test.js
```

The script requires no additional dependencies — `@supabase/supabase-js` is already in `package.json`.

## Self-Check: PASSED

- [x] `scripts/load-test.js` exists: FOUND
- [x] Commit `7fab74c` exists in git log: FOUND
- [x] `node -c scripts/load-test.js` exits 0: PASS
- [x] All 9 acceptance criteria verified in CI-style check: ALL PASS
