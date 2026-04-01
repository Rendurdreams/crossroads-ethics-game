# Quick Task 260401-hei: Signal Lost Game Design Audit — 22 Improvements

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Task Boundary

Implement all 22 gameplay improvements from the game design audit. Covers: pacing, choice design, player agency, framework detection, end screen, senator profiles, world state, host UX, and baseline survey.

</domain>

<decisions>
## Implementation Decisions

### Execution Strategy
- **Decision: Full send — Claude organizes.** Group by dependency and file proximity for efficiency.

### Dynamic Stakes (#15)
- **Decision: Full dynamic stakes.** Check choice_history when rendering stakes. 2-3 conditional variants per profile for R4-R8. Most immersive, full implementation.

### All 22 Proposals Approved
No proposals cut. Everything ships.

</decisions>

<canonical_refs>
## Canonical References

- signal_lost_v6.docx — source of truth for scenario design intent
- src/lib/scenarios/packs/signal-lost.js — scenario data
- src/lib/detection.js — moral conflict + framework detection
- src/lib/scribeRecord.js — scribe record generation
- src/lib/worldState.js — world state narrative
- src/lib/senatorProfiles.js — profiles + stakes
- src/lib/breakFlags.js — permanent world markers
- src/lib/frameworks.js — framework definitions
- src/lib/howOthersChose.js — research baselines
- src/pages/Host.jsx — host dashboard
- src/pages/Play.jsx — player experience
- src/pages/Baseline.jsx — baseline survey
- src/components/ConsequenceReveal.jsx — consequence screen
- src/components/FrameworkProfile.jsx — end screen
- src/components/ScenarioCard.jsx — choice presentation
- src/components/WalkMechanic.jsx — R6 walk mechanic
- src/components/HowOthersChose.jsx — comparison display

</canonical_refs>
