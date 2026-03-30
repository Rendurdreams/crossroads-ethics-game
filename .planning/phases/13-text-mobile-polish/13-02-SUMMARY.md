---
phase: 13-text-mobile-polish
plan: 02
subsystem: text-copy
tags: [accessibility, frameworks, arc-narratives, high-school-text]
dependency_graph:
  requires: []
  provides: [accessible-framework-descriptions, accessible-arc-narratives]
  affects: [FrameworkProfile, ConsequenceReveal]
tech_stack:
  added: []
  patterns: [introduce-then-define, inline-em-dash-definition]
key_files:
  created: []
  modified:
    - src/lib/frameworks.js
    - src/components/FrameworkProfile.jsx
decisions:
  - "Rewrite FRAMEWORKS descriptions from textbook-formal to conversational voice targeting high schoolers"
  - "ARC_NARRATIVES follow introduce-then-define pattern: every academic term immediately followed by plain-language em-dash definition"
  - "Kingdom atmospheric copy unchanged -- only player-facing philosophical copy rewritten"
metrics:
  duration: 100s
  completed: "2026-03-30T18:37:02Z"
  tasks_completed: 2
  files_modified: 2
requirements_satisfied: [TEXT-01, TEXT-02, TEXT-03]
---

# Phase 13 Plan 02: High-School Text Accessibility Summary

**One-liner:** Rewrote all player-facing philosophical text to use conversational voice and inline-defined academic terms so high schoolers engage instead of checking out.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Rewrite FRAMEWORKS descriptions | a8f0fc0 | src/lib/frameworks.js |
| 2 | Rewrite ARC_NARRATIVES + end-screen text | c3806ba | src/components/FrameworkProfile.jsx |

## What Was Built

### Task 1 — FRAMEWORKS descriptions (frameworks.js)

Replaced textbook-formal descriptions with punchy, conversational voice for each of the 4 frameworks:

- **Consequentialism:** "Do whatever produces the best result for the most people. If lying saves five lives, you lie..." (outcome-first framing with concrete example)
- **Deontology:** "Some rules don't bend, period. A promise is a promise..." (direct, rules-don't-negotiate voice)
- **Care Ethics:** "The person in front of you matters more than any abstract principle..." (relationship-creates-obligation framing)
- **Virtue Ethics:** "Forget the rules and the results -- what would a genuinely good person do here?..." (character-as-the-point framing)

Names, questions, and CONFLICT_PAIRS were not changed.

### Task 2 — ARC_NARRATIVES (FrameworkProfile.jsx)

All 12 ARC_NARRATIVES rewritten using introduce-then-define pattern. Academic terms now always appear with an inline em-dash definition:

- `teleological reasoning -- judging by results`
- `deontology -- following duty because it's right, full stop`
- `utilitarian thinking, where numbers decide`
- `care ethics, where relationships decide`
- `pragmatism -- doing what actually works`
- `Carol Gilligan studied exactly this tension -- the pull between justice...and care`
- `particularism -- where context drives the decision`
- `universalism -- where the same rule applies to everyone`
- `agent-centered ethics -- who are you?`
- `outcome-centered ethics -- what happens?`

Old underdefined patterns removed: "teleological to deontological", "Gilligan described", "particularist to universalist", "agent-centered to outcome-centered".

Animation objects (containerVariants, sectionVariants) unchanged.

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

- `grep "The right action|Some duties and rules|Relationships and context|Ask not what" src/lib/frameworks.js` → 0 matches
- `grep "teleological to deontological|Gilligan described|particularist to universalist" src/components/FrameworkProfile.jsx` → 0 matches
- All 12 ARC_NARRATIVE keys present
- `npm run build` → exits 0 (573ms / 380ms)

## Known Stubs

None — all copy is live text rendering for players.

## Self-Check: PASSED

Files created/modified:
- [x] FOUND: src/lib/frameworks.js
- [x] FOUND: src/components/FrameworkProfile.jsx

Commits:
- [x] FOUND: a8f0fc0 feat(13-02): rewrite FRAMEWORKS descriptions
- [x] FOUND: c3806ba feat(13-02): rewrite ARC_NARRATIVES with introduce-then-define pattern
