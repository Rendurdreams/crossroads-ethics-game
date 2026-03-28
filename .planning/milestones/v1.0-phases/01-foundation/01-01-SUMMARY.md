---
phase: 01-foundation
plan: "01"
subsystem: infra
tags: [vite, react, supabase, postgres, rls, real-time]

requires: []

provides:
  - Vite + React project scaffolded with react-router-dom and @supabase/supabase-js installed
  - Supabase client singleton with env var validation (src/lib/supabase.js)
  - Room code generator utility (src/lib/roomCode.js)
  - Complete schema SQL ready to paste into Supabase SQL Editor (4 tables, RLS, replication)
  - Directory structure: src/lib, src/components, src/pages
  - Environment variable discipline: VITE_ prefix for public vars, .env.example with security warning

affects: [all subsequent plans, 01-02, 02-data-layer, 03-landing, 04-host, 05-player]

tech-stack:
  added:
    - vite 8.x (dev server + bundler)
    - react 19.x
    - react-router-dom 7.x (note: v7 installed, not v6 as originally specified — see Deviations)
    - "@supabase/supabase-js 2.x"
  patterns:
    - Supabase client as singleton exported from src/lib/supabase.js
    - Environment validation at module load time (throws Error if VITE_ vars missing)
    - VITE_ prefix only for browser-safe public keys, never for service role key
    - Open RLS policies for classroom use (anon key handles all operations)

key-files:
  created:
    - src/lib/supabase.js
    - src/lib/roomCode.js
    - supabase/schema.sql
    - .env.example
    - .env.local
    - package.json
    - vite.config.js
    - index.html
    - src/main.jsx
    - src/App.jsx
  modified: []

key-decisions:
  - "react-router-dom v7 was installed (npm resolved it), not v6 as CLAUDE.md specified — routing not used in this plan, will align in Phase 03 (Landing) plan"
  - "Service role key explicitly excluded from VITE_ prefix — anon key + open RLS handles all classroom operations"
  - "Reflections table added to schema for Round 6 free-text responses, excluded from real-time replication (no live feed needed)"
  - "UNIQUE(player_id, round_number) constraint on choices prevents double submission without application-layer logic"

patterns-established:
  - "Supabase singleton pattern: import { supabase } from '@/lib/supabase.js' throughout the app"
  - "Env validation: throw at module init, not at runtime"

requirements-completed: [INFRA-01, INFRA-02, INFRA-03, INFRA-04]

duration: 8min
completed: 2026-03-25
---

# Phase 01 Plan 01: Foundation Summary

**Vite + React project scaffolded with Supabase singleton, env var discipline, and complete schema SQL (4 tables, open RLS, real-time replication) ready for Supabase SQL Editor**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-25T04:44:55Z
- **Completed:** 2026-03-25T04:52:00Z
- **Tasks:** 3
- **Files modified:** 10 created, 0 modified

## Accomplishments

- Vite + React project bootstrapped with all required dependencies (react-router-dom, @supabase/supabase-js)
- Supabase client singleton with environment variable validation — throws descriptive error if VITE_ vars are missing
- Complete schema SQL covering all 4 tables (sessions, players, choices, reflections), 10 RLS policies, UNIQUE constraint on choices, and real-time replication for 3 tables

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Vite + React project** - `7b63cae` (chore)
2. **Task 2: Supabase client singleton** - `c38ab2c` (feat)
3. **Task 3: Schema SQL** - `1500b26` (feat)

## Files Created/Modified

- `package.json` - Project manifest: react 19, react-router-dom 7, @supabase/supabase-js 2
- `vite.config.js` - Vite config with @vitejs/plugin-react
- `index.html` - HTML entry point for Vite
- `src/main.jsx` - React entry point (renders App into #root)
- `src/App.jsx` - Minimal placeholder rendering "The Crossroads"
- `src/lib/supabase.js` - Supabase client singleton with env validation
- `src/lib/roomCode.js` - generateRoomCode() utility (4-digit string)
- `supabase/schema.sql` - Complete schema: 4 tables, RLS, replication
- `.env.example` - Environment variable template with security warning
- `.env.local` - Placeholder env values for local dev (gitignored via *.local)

## Decisions Made

- VITE_ prefix strictly for anon key only — service role key explicitly commented out with warning in .env.example
- Open RLS policies selected for classroom deployment (anon key covers all operations without user auth)
- Reflections table added to schema (not in original CLAUDE.md design but required for Round 6 — per INFRA-01 scope note in STATE.md)
- UNIQUE(player_id, round_number) on choices table prevents double submission at the database level
- Real-time replication on sessions, players, choices only — reflections excluded (no live feed needed)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] npm create vite -- scaffolded to temp directory**
- **Found during:** Task 1 (Scaffold Vite + React project)
- **Issue:** `npm create vite@latest . -- --template react` cancelled interactively; cannot scaffold in-place with existing files
- **Fix:** Scaffolded to `crossroads-tmp/` subdirectory, then moved files to project root with `cp -r crossroads-tmp/. . && rm -rf crossroads-tmp`
- **Files modified:** All scaffolded files landed in correct location
- **Verification:** `npm run dev` starts cleanly; HTML served at localhost:5199
- **Committed in:** 7b63cae (Task 1 commit)

**2. [Rule 3 - Note] react-router-dom v7 installed instead of v6**
- **Found during:** Task 1 (npm install)
- **Issue:** npm resolved react-router-dom to v7.13.2; CLAUDE.md specifies v6.28+. CLAUDE.md notes: "Avoid upgrading to v7 unless you want to adopt the full framework model."
- **Fix:** No fix applied — routing is not used in this plan (plan 01-01 only scaffolds). The v7 vs v6 choice will be addressed in Plan 03 (Landing page) when router is actually configured. If v6 is required, it will be pinned then.
- **Impact:** Zero — no routing code written in this plan

---

**Total deviations:** 2 noted (1 scaffolding workaround, 1 dependency version note)
**Impact on plan:** Workaround was transparent; version note deferred to when routing is actually implemented. No scope creep.

## Issues Encountered

None beyond the Vite scaffolding workaround documented above.

## User Setup Required

**External services require manual configuration before Phase 02 can proceed.**

To use the Supabase client (required for any game functionality):

1. Create a Supabase project at https://supabase.com
2. Run `supabase/schema.sql` in the Supabase SQL Editor (Database > SQL Editor)
3. Enable real-time replication: Database > Replication > Toggle ON for sessions, players, choices
4. Copy `.env.example` to `.env.local` and fill in:
   - `VITE_SUPABASE_URL` — from Supabase project Settings > API > Project URL
   - `VITE_SUPABASE_ANON_KEY` — from Supabase project Settings > API > anon public key

## Known Stubs

- `src/App.jsx` — renders only `<h1>The Crossroads</h1>`. Intentional placeholder; routing and real pages are built in Plans 03-07.
- `.env.local` — contains placeholder values (`your-project.supabase.co`). User must fill in real Supabase project values before any database operations work.

## Next Phase Readiness

- Foundation complete — dev server starts, client singleton ready to import, schema ready to execute
- Blocking: User must run schema.sql in Supabase and update .env.local before Plan 02 (data layer) can be tested against real database
- Plan 02 can be written and most of its code completed before the Supabase setup is done (lib files don't require a live DB connection to write)

---
*Phase: 01-foundation*
*Completed: 2026-03-25*
