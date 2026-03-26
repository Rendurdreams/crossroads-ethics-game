---
phase: 05-deploy-polish
plan: 01
subsystem: infra
tags: [qrcode, vite, netlify, deploy, react]

# Dependency graph
requires:
  - phase: 04-end-state
    provides: Complete game loop including end screen, FrameworkProfile, reflection round
provides:
  - QR code on HostSetup page encoding join URL with ?code= param
  - Landing.jsx query param pre-fill from ?code= URL parameter
  - Correct page title and meta description in index.html
  - Clean vite build producing dist/ folder ready for Netlify
affects: [netlify-deploy, qr-join-flow]

# Tech tracking
tech-stack:
  added: [qrcode.react@4.2.0]
  patterns: [QRCodeSVG from qrcode.react with dark bg/fg matching app palette]

key-files:
  created: []
  modified:
    - src/pages/HostSetup.jsx
    - src/pages/HostSetup.module.css
    - src/pages/Landing.jsx
    - index.html
    - package.json

key-decisions:
  - "qrcode.react@4.2.0 used instead of planned v3 — React 19 peer dep requires v4.2.0 minimum"
  - "QR code placed between room code display and instructions paragraph on HostSetup"
  - "Landing query param pre-fill uses lazy useState initializer (runs once on mount only)"

patterns-established:
  - "QR code color contract: bgColor=#12121e (app dark bg), fgColor=#f5f0e8 (app warm text)"

requirements-completed: [INFRA-05]

# Metrics
duration: 2min
completed: 2026-03-25
---

# Phase 5 Plan 01: Deploy Prep Summary

**qrcode.react@4.2.0 QR code on HostSetup encoding join URL, Landing ?code= pre-fill, correct page title, clean vite build for Netlify deploy**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-25T01:30:39Z
- **Completed:** 2026-03-25T01:32:00Z
- **Tasks:** 1 of 2 complete (paused at checkpoint:human-verify for Netlify deploy)
- **Files modified:** 6

## Accomplishments
- qrcode.react@4.2.0 installed (React 19 compatible)
- QR code renders on HostSetup below room code, using app dark palette (#12121e bg, #f5f0e8 fg), size 180
- QR code encodes `${window.location.origin}/?code=${session.room_code}` — scanning lands on Landing with code pre-filled
- Landing.jsx reads ?code= from URL on mount via lazy useState initializer with URLSearchParams
- Join button copy updated from "Join" to "Join Game"
- index.html title corrected from "crossroads-tmp" to "The Crossroads"
- Meta description added: "A multiplayer ethics game for the classroom."
- `vite build` exits 0 — dist/ ready for drag-and-drop Netlify deploy

## Task Commits

1. **Task 1: Install qrcode.react, add QR code to HostSetup, wire Landing query param, fix index.html** - `723cad2` (feat)

**Plan metadata:** pending final commit after checkpoint

## Files Created/Modified
- `src/pages/HostSetup.jsx` - Added QRCodeSVG import and component after room code display
- `src/pages/HostSetup.module.css` - Added .qrCode (flex center, margin-top 8px) and .qrInstruction (14px muted)
- `src/pages/Landing.jsx` - Lazy useState reads ?code= from URL; Join button says "Join Game"
- `index.html` - Title "The Crossroads", meta description added
- `package.json` - qrcode.react@^4.2.0 in dependencies
- `package-lock.json` - Updated with qrcode.react dependency tree

## Decisions Made
- Used qrcode.react@4.2.0 instead of planned v3 — v3 declares peer dep `react@^16.8.0 || ^17.0.0 || ^18.0.0`, which npm refuses to satisfy against React 19. v4.2.0 explicitly adds `|| ^19.0.0` to the peer dep range.
- Lazy useState initializer pattern for pre-fill: `useState(() => { const params = new URLSearchParams(...); return params.get('code') ?? '' })` — runs once on mount, does not re-run on re-renders.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Used qrcode.react@4.2.0 instead of planned @3**
- **Found during:** Task 1 (npm install)
- **Issue:** `npm install qrcode.react@3` failed with ERESOLVE — peer dep declares `react@"^16.8.0 || ^17.0.0 || ^18.0.0"`, project uses React 19
- **Fix:** Checked npm registry; qrcode.react@4.2.0 is the first version supporting React 19 (`|| ^19.0.0`). API is identical — `QRCodeSVG` export exists in v3 and v4.
- **Files modified:** package.json, package-lock.json
- **Verification:** `npm install` succeeded with 0 vulnerabilities; `vite build` exits 0
- **Committed in:** 723cad2 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking — peer dep version mismatch)
**Impact on plan:** Required version bump from v3 to v4.2.0. API surface unchanged. No scope creep.

## Issues Encountered
None beyond the version deviation documented above.

## User Setup Required
**Task 2 (checkpoint:human-verify) — Netlify deploy requires user action:**

1. Go to app.netlify.com — create a new site by dragging the `dist/` folder
2. (Optional) Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as environment variables for documentation (values already baked into JS bundle from .env.local at build time)
3. Visit the deployed URL — confirm "The Crossroads" title
4. Navigate to host setup — confirm QR code appears below room code
5. Scan the QR code — confirm it opens the join page with room code pre-filled
6. Refresh on /play/xxx — confirm SPA routing works (public/_redirects handles this)

## Next Phase Readiness
- dist/ folder is clean and ready for drag-and-drop Netlify deploy
- After Task 2 checkpoint is approved, Plan 02 (mobile polish) and Plan 03 (timer polish) can begin
- _redirects file for Netlify SPA routing is already in public/ from a prior phase

## Known Stubs
None — QR code uses real session.room_code from Supabase, join URL is constructed from window.location.origin.

---
*Phase: 05-deploy-polish*
*Completed: 2026-03-25*
