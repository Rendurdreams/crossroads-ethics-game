---
phase: 12-ethical-framework-depth
plan: 03
subsystem: ui, detection, end-screen
tags: [trajectory, moral-arc, virtue-streak, rights-awareness, cultural-context, ethicalLens, framework-profile]

requires:
  - phase: 12-ethical-framework-depth
    plan: 01
    provides: computeProfile with trajectory/consistency/virtue fields, ethicalLens on packs, rights_dimension on scenarios
  - phase: 11-moral-conflict-detection-end-screen-ai-hooks
    provides: findMoralConflicts, Morals vs Ethics section, pack prop on FrameworkProfile

provides:
  - Host.jsx endSession computes and stores trajectory, consistency_score, virtue_streak, virtue_heavy_count, moral_conflicts
  - Host.jsx enriches choice_history with moral_weight from scenario weight
  - FrameworkProfile renders 5 new conditional sections in D-27 order
  - HostSetup shows ethicalLens subtitle on pack cards
  - Full data path: detection.js -> Host.jsx endSession -> player row -> FrameworkProfile.jsx

affects: [end-screen, player-profile, host-setup, debrief]

tech-stack:
  added: []
  patterns:
    - "ARC_NARRATIVES lookup object for 12 trajectory shift combinations"
    - "moral_weight enrichment at endSession time using WEIGHT_MAP"
    - "moral_conflicts stored directly on player row (not just in debrief_context)"

key-files:
  created: []
  modified:
    - src/pages/Host.jsx
    - src/components/FrameworkProfile.jsx
    - src/pages/Play.jsx
    - src/pages/HostSetup.jsx
    - src/pages/HostSetup.module.css

key-decisions:
  - "Use player.moral_conflicts from Host endSession storage instead of recomputing in FrameworkProfile -- avoids duplicate findMoralConflicts call"
  - "ARC_NARRATIVES uses -> arrow syntax in keys to avoid Unicode issues"
  - "Pre-existing KingdomCanvas.jsx missing from worktree copied from main repo to unblock build verification"

patterns-established:
  - "D-27 section order: Framework, Morals vs Ethics, Moral Arc, Character, Friction, Conflict Lived, Rights, Least Used, Cultural Context, Choice Log"

requirements-completed: [TRAJECTORY-03, CONSCIENCE-02, VIRTUE-02, RIGHTS-02, CULTURE-02]

duration: 6min
completed: 2026-03-30
---

# Phase 12 Plan 03: End Screen Sections + Host endSession Wiring Summary

**Wired extended detection data into Host.jsx endSession and built 5 new FrameworkProfile end screen sections (Moral Arc, Character, Friction, Rights Awareness, Cultural Context) plus HostSetup ethicalLens display**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-30T15:11:03Z
- **Completed:** 2026-03-30T15:17:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Host.jsx endSession now enriches choice_history entries with moral_weight (via WEIGHT_MAP from scenario weight), destructures trajectory/consistency_score/virtue_streak/virtue_heavy_count from computeProfile, and stores all 5 new fields plus moral_conflicts to each player row
- FrameworkProfile.jsx renders all D-27 sections: YOUR MORAL ARC (trajectory shift with philosophical narrative), consistency label, CHARACTER (virtue streak + heavy-round count), Moral Friction count, RIGHTS AWARENESS, and Cultural Context footer with pack ethicalLens
- HostSetup.jsx shows ethicalLens italic subtitle on each pack card
- Play.jsx passes pack prop to FrameworkProfile
- Removed local findMoralConflicts call from FrameworkProfile -- now uses host-computed moral_conflicts from player row

## Task Commits

1. **Task 1: Extend Host.jsx endSession** - `5de69d1` (feat)
2. **Task 2: FrameworkProfile 5 new sections + HostSetup ethicalLens** - `e95206c` (feat)

## Files Created/Modified

- `src/pages/Host.jsx` - WEIGHT_MAP enrichment, extended computeProfile destructuring, 5 new fields in Supabase update, trajectory data in debriefContext
- `src/components/FrameworkProfile.jsx` - ARC_NARRATIVES object, 5 new D-27 sections, use player.moral_conflicts instead of local computation
- `src/pages/Play.jsx` - Pass pack={pack} prop to FrameworkProfile
- `src/pages/HostSetup.jsx` - ethicalLens subtitle on pack cards
- `src/pages/HostSetup.module.css` - .packLens class with italic styling

## Decisions Made

- Use player.moral_conflicts from Host endSession storage instead of recomputing findMoralConflicts in FrameworkProfile -- avoids duplicate computation and ensures consistency
- ARC_NARRATIVES uses -> arrow syntax in JS string keys to avoid Unicode encoding issues
- D-27 section order enforced: 10 slots from Your Framework through Choice Log

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Pre-existing dependency files from Plan 01 and 02 not in worktree**
- **Found during:** Task 1 setup
- **Issue:** Worktree branched from 7c89a64 (before Plan 01/02 commits). detection.js, Host.jsx, Play.jsx, HostSetup.jsx, and scenario pack files lacked Plan 01/02 changes.
- **Fix:** Checked out files from merge commit d9d6efe (Wave 1 merge) and Phase 11 commit bbac4c6 to get FrameworkProfile with Morals vs Ethics section and pack prop
- **Files affected:** All modified files started from correct base

**2. [Rule 3 - Blocking] KingdomCanvas.jsx missing from worktree**
- **Found during:** Build verification
- **Issue:** KingdomCanvas.jsx exists as untracked file in main repo but not in worktree; Host.jsx imports it
- **Fix:** Copied from main repo to unblock build verification
- **Files affected:** src/components/KingdomCanvas.jsx (not committed as part of this plan)

## Known Stubs

None - all sections render with real data from the detection/Host pipeline.

---
*Phase: 12-ethical-framework-depth*
*Completed: 2026-03-30*

## Self-Check: PASSED
- All 5 modified files exist on disk
- Both task commits (5de69d1, e95206c) found in git log
