---
phase: 20-ui-overhaul
plan: "20-02"
subsystem: ui
tags: [react, css-modules, host-view, host-remote, facilitator-ux]

# Dependency graph
requires:
  - phase: 20-01
    provides: CompactMeterStrip component replacing WorldHealthBar
provides:
  - Host.jsx projector lesson overlay without discussion prompts or host notes
  - HostRemote.jsx unified ETHICS CUE CARD with computed frameworks, moral tension, SAY THIS, ASK THE CLASS
  - HostRemote.module.css cue card glass panel styles
affects: [20-ui-overhaul, host-ux, facilitator-experience]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Runtime-computed FRAMEWORKS IN PLAY from scenario choices using flatMap + Set dedup"
    - "Null-safe cue card sections — each section gated on optional scenario fields"

key-files:
  created: []
  modified:
    - src/pages/Host.jsx
    - src/pages/HostRemote.jsx
    - src/pages/HostRemote.module.css

key-decisions:
  - "Projector lesson overlay keeps: vote tally, moral tension, teaches, frameworkCallout, spotlightCallout, HowOthersChose — removes: discussionPrompts and hostNotes"
  - "HostRemote cue card computes FRAMEWORKS IN PLAY at runtime from choices array — no new scenario data field required"
  - "Cue card is always rendered when currentScenario is truthy — individual sections conditional on field presence"

patterns-established:
  - "Facilitator-only content lives in HostRemote, never Host.jsx projector"
  - "ETHICS CUE CARD pattern: header + computed section + optional content sections"

requirements-completed: []

# Metrics
duration: 8min
completed: 2026-04-01
---

# Phase 20 Plan 02: Host Projector Declutter and Phone Cue Card Restructure Summary

**Projector lesson overlay stripped of host-only content; HostRemote unified ETHICS CUE CARD shows computed frameworks, moral tension, ethics cheat sheet, and discussion prompts**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-01T00:00:00Z
- **Completed:** 2026-04-01T00:08:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Removed discussion prompts block and host notes collapsible from Host.jsx projector overlay — projector now shows only vote tally, lesson content, framework callout, spotlight, and HowOthersChose
- Replaced old two-block HostRemote notes layout with unified ETHICS CUE CARD: FRAMEWORKS IN PLAY (runtime-computed from choices), MORAL TENSION, SAY THIS (hostNotes), ASK THE CLASS (discussionPrompts)
- Added 52 lines of glass-panel CSS to HostRemote.module.css for the cue card layout

## Task Commits

Each task was committed atomically:

1. **T1: Remove discussionPrompts and hostNotes from Host.jsx lesson overlay** - `7d88234` (feat)
2. **T2: Restructure HostRemote.jsx notes section as facilitator cue card** - `572ba71` (feat)
3. **T3: Add cue card CSS styles to HostRemote.module.css** - `62ba720` (feat)

## Files Created/Modified
- `src/pages/Host.jsx` - Removed 20 lines: discussion prompts block and host notes collapsible from lesson overlay
- `src/pages/HostRemote.jsx` - Added FRAMEWORKS import; replaced notes blocks with unified ETHICS CUE CARD component
- `src/pages/HostRemote.module.css` - Added .cueCard, .cueHeader, .cueSection, .cueLabel, .cueText, .cueBullet

## Decisions Made
- FRAMEWORKS IN PLAY computed at runtime via `[...new Set(choices.flatMap(c => c.frameworks))].map(f => FRAMEWORKS[f]?.name || f)` — no new scenario data field needed
- Cue card always renders when `currentScenario` is truthy; individual sections are null-safe for kingdom-arc (which lacks hostNotes/discussionPrompts)
- Build verified clean: `npx vite build` passes in 785ms, 478 modules transformed

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. The worktree needed to merge from main to pick up phase 20 plan files and the 20-01 CompactMeterStrip work (which was committed to main after the worktree was created). Merge was clean fast-forward.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plan 20-02 complete: projector decluttered, HostRemote has unified facilitator cue card
- Plan 20-03 (kingdom-arc hostNotes content rewrite) is ready to execute
- No blockers

---
*Phase: 20-ui-overhaul*
*Completed: 2026-04-01*
