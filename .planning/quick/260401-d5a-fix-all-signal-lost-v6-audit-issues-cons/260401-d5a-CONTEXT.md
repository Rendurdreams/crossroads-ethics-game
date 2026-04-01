# Quick Task 260401-d5a: Fix all Signal Lost v6 audit issues - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Task Boundary

Fix all Signal Lost v6 audit issues across signal-lost.js, scribeRecord.js, senatorProfiles.js, and detection.js. Covers: framework tag corrections, dynamic per-profile consequence text, scribe record text errors, senator profile sync to docx, and contentNote cleanup.

</domain>

<decisions>
## Implementation Decisions

### World Impact Balance
- **Decision: Keep as-is.** The polarization IS the design — walking away from Kael SHOULD crater everything. The game says it doesn't judge, but the world does. No changes to worldImpact values.

### Consequence Text — Dynamic Per-Profile
- **Decision: Per-profile consequence map.** Each choice gets a `profileConsequences` object keyed by profile ID (A-F). Players see a consequence that directly relates to the stake they saw before voting. Universal base consequence stays in `consequence` field. Profile-specific consequence goes in `profileConsequences[profileId]`. This is up to 144 strings but many profiles share similar situations and can reuse text.

### Framework Tag Philosophy
- **Decision: Correct the philosophy.** Fix tags to match actual ethical reasoning, not just the docx. Key corrections identified:
  - R1-III (honor contracts while people die): consequentialism → deontology (rule-following)
  - R1-I (prioritize lives): care+deontology → care+consequentialism (saving the most)
  - R2-III (pilot): care+consequentialism → consequentialism only (pragmatic compromise)
  - R3-III (tribunal): care+consequentialism → consequentialism only (institutional delay)
  - R5-I (authorize extraction): care+consequentialism → consequentialism only (numbers argument)
  - R8-III (negotiate/hide financials): consequentialism+virtue → consequentialism only (virtue doesn't fit hiding)
  - "Care" should only tag choices involving relational/proximity reasoning, not generic compromise

### Claude's Discretion
- Scribe record fixes: straightforward text corrections (no ambiguity)
- Senator profile sync: docx is source of truth for subtitles and stakes
- ContentNote R6: update wording to match existing WalkMechanic component

</decisions>

<specifics>
## Specific Ideas

- The `profileConsequences` field is NEW — needs to be added to signal-lost.js choice objects
- Play.jsx (or wherever consequence is displayed) will need to read player's profile ID and select the right consequence
- conscienceLayer field currently duplicates consequence — after this change, conscienceLayer should stay as the universal version while profileConsequences holds the personal one

</specifics>

<canonical_refs>
## Canonical References

- `signal_lost_v6.docx` — source of truth for senator profiles, stakes, scenario text
- `src/lib/senatorProfiles.js` — profile definitions with per-round stakes
- `src/lib/scenarios/packs/signal-lost.js` — scenario pack with choices, frameworks, consequences
- `src/lib/scribeRecord.js` — scribe record action strings and contradiction pairs
- `src/lib/detection.js` — stance triggers that reference framework tags (must update if tags change)

</canonical_refs>
