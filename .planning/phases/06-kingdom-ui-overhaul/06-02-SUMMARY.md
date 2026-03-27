---
phase: 06-kingdom-ui-overhaul
plan: 02
subsystem: ui
tags: [react, css-modules, play-view, scenario-card, kingdom-theme, atmospheric-copy]

# Dependency graph
requires:
  - phase: 06-kingdom-ui-overhaul
    provides: UI-SPEC design contract for kingdom aesthetic

provides:
  - ScenarioCard decree tiles with Roman numeral (I./II./III.) amber prefix on choice buttons
  - Amber gradient flourish pseudo-elements (::before/::after) on .card top and bottom edges
  - Play.jsx atmospheric war council copy throughout all waiting/pass/round states
  - Round headers using "The N. Decree" format

affects:
  - 06-kingdom-ui-overhaul plan 03 (full UI polish)
  - Player phone experience

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ROMAN numeral array at module level for sequential label generation"
    - "display:flex on choiceBtn with flex-shrink:0 on decorative prefix span"
    - "CSS pseudo-elements (::before/::after) for card amber gradient flourishes"

key-files:
  created: []
  modified:
    - src/components/ScenarioCard.jsx
    - src/components/ScenarioCard.module.css
    - src/pages/Play.jsx
    - src/pages/Play.module.css

key-decisions:
  - "Roman numeral span uses ROMAN[choice.choiceIndex] so it stays aligned with choice data model (0-indexed)"
  - "::before/::after require position:relative on .card — added without other visual changes"
  - "roundLabel font-size 14px -> 13px per UI-SPEC contract"

patterns-established:
  - "Atmospheric copy pattern: all waiting/pass states use war council register ('council', 'decree', 'realm', 'counsel')"

requirements-completed: [UI-06]

# Metrics
duration: 3min
completed: 2026-03-27
---

# Phase 06 Plan 02: Kingdom UI — Player View Summary

**Decree tile choice buttons with Roman numeral amber prefix, amber card flourishes, and full atmospheric war council copy across all Play.jsx states**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-27T21:07:00Z
- **Completed:** 2026-03-27T21:09:30Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- ScenarioCard choice buttons now show "I.", "II.", "III." in amber before choice text, using flex layout for clean alignment
- ScenarioCard .card gains amber gradient lines at top and bottom via ::before/::after pseudo-elements
- All Play.jsx user-facing strings updated to kingdom/war council register (lobby, post-submit, pass, round headers, meters label)
- Round headers display "The N. Decree" format replacing "The Council Deliberates — Dilemma N"

## Task Commits

1. **Task 1: ScenarioCard decree tiles + amber flourish** - `70378cf` (feat)
2. **Task 2: Play.jsx atmospheric copy + decree round headers** - `4918e11` (feat)

## Files Created/Modified
- `src/components/ScenarioCard.jsx` - Added ROMAN constant and choiceNumeral span inside each choice button
- `src/components/ScenarioCard.module.css` - Added position:relative to .card, display:flex to .choiceBtn, .choiceNumeral class, .card::before/.card::after amber flourishes
- `src/pages/Play.jsx` - All atmospheric copy replacements: lobby, post-submit, pass state, pass subtext, round headers (2x), pass consequence, missed submit, meters labels
- `src/pages/Play.module.css` - roundLabel font-size 13px per UI-SPEC

## Decisions Made
- `ROMAN[choice.choiceIndex]` rather than array index — stays correct even if choices array order shifts
- `position: relative` added to `.card` without other changes — safe for pseudo-element positioning
- Both instances of round header (reflection round + scenario round) updated atomically with `replace_all: true`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Player view now fully themed to kingdom aesthetic
- ScenarioCard and Play.jsx are clean and build-verified
- Ready for Plan 03 (remaining UI components or host view kingdom theming)

---
*Phase: 06-kingdom-ui-overhaul*
*Completed: 2026-03-27*
