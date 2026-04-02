---
phase: 20-ui-overhaul
plan: "20-03"
subsystem: content
tags: [kingdom-arc, scenarios, ethics, host-notes, discussion-prompts]

# Dependency graph
requires:
  - phase: 20-02
    provides: HostRemote ETHICS CUE CARD — the UI container that renders hostNotes and discussionPrompts
provides:
  - hostNotes arrays (3 items each) on all 8 kingdom-arc scenarios
  - discussionPrompts arrays (3 items each) on all 8 kingdom-arc scenarios
  - Ethics-framework-focused presenter content for Jay's critical thinking class
affects: [HostRemote.jsx cue card rendering, Host.jsx lesson overlay (now clean of these fields)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Scenario objects carry hostNotes and discussionPrompts as string arrays — presenter content co-located with game content"

key-files:
  created: []
  modified:
    - src/lib/scenarios/packs/kingdom-arc.js

key-decisions:
  - "hostNotes content structure: framework names → key tension → watch-for split → morals-vs-ethics connection (3-item pattern)"
  - "discussionPrompts structure: one challenge question, one edge-case question, one real-world connection (3-item pattern)"
  - "Round 7 introduces cultural relativism as a fifth framework explicitly named in hostNotes — consistent with the scenario's 4th choice option"
  - "Round 8 capstone framing: turns the lens on the presenter/player — hostNotes emphasize selective framework application as the lesson"

requirements-completed: []

# Metrics
duration: 12min
completed: 2026-04-02
---

# Phase 20 Plan 03: Author Kingdom-Arc hostNotes and discussionPrompts Summary

**All 8 kingdom-arc scenarios now carry 3-item hostNotes and 3-item discussionPrompts arrays — ethics-framework-focused facilitator content Jay can say aloud and use for class discussion**

## Performance

- **Duration:** 12 min
- **Started:** 2026-04-02T02:09:46Z
- **Completed:** 2026-04-02T02:21:00Z
- **Tasks:** 8
- **Files modified:** 1

## Accomplishments
- Added hostNotes (3 strings) and discussionPrompts (3 strings) to all 8 kingdom-arc scenarios
- Each hostNotes entry names specific frameworks in play, gives Jay a concrete 1-liner to say aloud, and connects the dilemma back to the morals-vs-ethics distinction
- Each discussionPrompts entry poses open-ended questions connecting the dilemma to real-world moral reasoning
- Build passes: `npx vite build` — 0 errors, 478 modules transformed

## Task Commits

Each task was committed atomically:

1. **T1: Round 1 — The Divided Harvest** - `345ef7d` (feat)
2. **T2: Round 2 — The Ember Watch** - `d43bd44` (feat)
3. **T3: Round 3 — The Hollow Folk** - `3427d93` (feat)
4. **T4: Round 4 — The Sealed Archive** - `93041d5` (feat)
5. **T5: Round 5 — The Last Wellspring** - `4a27f48` (feat)
6. **T6: Round 6 — The Shackled Heart** - `00b7fef` (feat)
7. **T7: Round 7 — The Broken Banners** - `2bb15e6` (feat)
8. **T8: Round 8 — The Throne or the Truth** - `58a2791` (feat)

## Files Created/Modified
- `src/lib/scenarios/packs/kingdom-arc.js` — All 8 scenario objects extended with hostNotes and discussionPrompts arrays

## Decisions Made
- hostNotes follow a consistent 3-item structure: (1) frameworks in play + Jay's say-aloud line, (2) watch-for vote split, (3) morals-vs-ethics connection
- discussionPrompts follow a consistent 3-item structure: (1) framework-challenge question, (2) edge-case or failure-mode question, (3) real-world parallel
- Round 7 explicitly names cultural relativism as a fifth framework to match the 4th choice option already in the scenario
- Round 8 is framed as the capstone "lens on you" — emphasizing that selective framework application is the central lesson

## Deviations from Plan

None - plan executed exactly as written.

Note: The plan header mentions "8 scenarios" and the important_context note says "7 dilemmas" — the file actually has 8 scenario objects (round-1 through round-7 plus round-bombshell which is labeled round 8). All 8 received content as the plan specified.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 20 complete — all 3 plans executed
- kingdom-arc.js is the source of truth; HostRemote.jsx (from Plan 20-02) already renders hostNotes/discussionPrompts via the ETHICS CUE CARD section
- Ready for presentation: Jay has ethics framework names, say-aloud lines, watch-for vote-split notes, and discussion questions for all 8 rounds

---
*Phase: 20-ui-overhaul*
*Completed: 2026-04-02*
