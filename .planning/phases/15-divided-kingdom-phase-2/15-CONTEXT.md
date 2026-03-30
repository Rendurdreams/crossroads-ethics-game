# Phase 15: Divided Kingdom Phase 2 - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning
**Source:** PRD Express Path (.planning/phases/15-divided-kingdom-phase-2/15-PRD.md)

<domain>
## Phase Boundary

Bring the Kingdom of Ash game to presentation-ready depth with 7 new features: dynamic scribe record for R8, 90-second timer pressure for R5, physical walk mechanic for R6, "How Others Chose" post-round percentages, detection.js rework (key rename + 10 conflict trigger strings + revised question text), Round 7 fourth choice (Cultural Tribunal), conscience layer text per choice, and a closing reflection screen. Also: homepage split for separate host vs player entry.

</domain>

<decisions>
## Implementation Decisions

### D-01: R8 Dynamic Scribe Record
- Scribe record in Round 8 must be dynamically generated from the player's actual R1-R7 choices
- Pattern-detection logic reads choice_history and generates a personalized summary string
- Example: "You shared grain but sealed the archive. You freed Irel but exiled the Compact. Your people call you merciful. The record calls you inconsistent. Which is true?"
- This reflects Kohlberg Stage 6 [1] — self-judgment by own standards
- Displayed as scenario text BEFORE the player makes their R8 choice

### D-02: Round 5 Timer — 90-Second Countdown
- R5 (The Last Wellspring) gets a 90-second forced timer
- Greene [2] — time pressure forces instinctive over deliberative processing, surfacing true moral intuitions
- UI must show visible pressure (shrinking bar, color shift near 0)
- Auto-submits if timer expires (player's current selection, or random if none)
- Host can still extend/pause as with normal rounds

### D-03: Round 6 Physical Walk Mechanic
- R6 (The Shackled Heart) replaces standard choice buttons with a physical interaction
- Greene [2] — player must physically walk their avatar to the shackles or walk away
- The movement IS the decision — not a menu choice
- Implementation: simple left/right traversal on phone screen (swipe or directional tap)
- Walk toward shackles = Free Irel (Choice I), Walk away = Maintain binding (Choice II)
- Third option (Commission scholars) available as a button that appears midway
- Must be mobile-optimized — this is a phone interaction

### D-04: "How Others Chose" Post-Round Screen
- After EVERY round (not just specific ones), show anonymized class percentages
- Awad et al. [3] — MIT Moral Machine pattern
- Display between consequence reveal and next round
- Format: "41% Share Equally | 28% Protect the Core | 31% Triage"
- Hardcoded reference percentages from PRD (not live class data — this is the research baseline)
- Shows alongside live class percentages if available
- Host dismisses to advance

### D-05: detection.js Rework
- Key rename: `truth_over_relationship` → `loyalty_vs_fairness` (find and replace all instances)
- Revised question text for Q2 (`ends_justify`): "If lying to one person would genuinely make life better for ten people, is the lie acceptable?"
- Revised question text for Q3 (`break_promise`): "If you made a commitment you can no longer keep without hurting someone, is it better to break it cleanly or try to honor it partially?"
- Revised question text for Q4 (`loyalty_vs_fairness`): "If your group made a decision that harmed outsiders, would you speak up against your own group?"
- 10 new conflict trigger strings (full table in PRD) replacing current generic messages
- Each trigger is condition-specific: ties a stance answer to a specific round+choice combination
- Value-framework mapping table updated per PRD (Loyalty→Virtue/Care, Honesty→Deontology, Fairness→Distributive Justice, Courage→Virtue, Compassion→Care)

### D-06: Round 7 Fourth Choice — Cultural Tribunal
- Add Choice IV to Round 7 (The Broken Banners): "Cultural Tribunal. Convene the Compact's own elders to judge their leaders by their own standards."
- Framework tag: Cultural Relativism
- Consequence: "The Compact's elders judge their own. Some victims feel unheard. The kingdom watches a different culture define justice."
- worldImpact values to be determined (moderate, reflecting compromise)
- Gilligan [4] — care ethics applied to cultural context
- ScenarioCard must handle 4 choices (currently assumes max 3 with ROMAN numerals I/II/III — add IV)

### D-07: Conscience Layer Text
- Each choice consequence gets a shorter, punchier "conscience layer" line (from PRD)
- These replace or supplement the existing `consequence` field text
- Displayed after choice in the consequence reveal screen
- Tone: personal, second-person, no judgment — just the weight

### D-08: Closing Reflection Screen
- Final screen after R8 shows kingdom in its accumulated state
- One gain/loss line per round summarizing what was gained and what was lost
- Single closing question: "Would you make these choices again?"
- Player can type a response (free text, like current reflection)
- This is the POST-GAME screen, separate from FrameworkProfile

### D-09: Homepage Split
- Separate entry pages for host and player to reduce clutter
- Host gets a "Create Session" flow
- Player gets a "Join Session" flow
- Current Landing.jsx handles both — split into cleaner paths

### Claude's Discretion
- worldImpact values for the new Round 7 Choice IV (Cultural Tribunal)
- Exact UI treatment for the walk mechanic (swipe vs tap vs drag)
- Whether "How Others Chose" reference percentages show alongside or instead of live class data
- Visual design of the 90-second timer (can reuse existing timer with enhanced urgency styling)
- How the closing reflection screen relates to existing FrameworkProfile — could be a tab, a scroll section, or a separate page

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### PRD
- `.planning/phases/15-divided-kingdom-phase-2/15-PRD.md` — Full brief with round specs, conflict triggers, baseline survey, implementation notes

### Source Code (modify)
- `src/lib/detection.js` — Moral conflict detection logic, key rename target
- `src/lib/scenarios/packs/kingdom-arc.js` — Scenario definitions, R7 4th choice, conscience layer
- `src/pages/Baseline.jsx` — Stance questions (Q2-Q4 text changes, Q4 key rename)
- `src/pages/Play.jsx` — Timer display, walk mechanic, How Others Chose screen
- `src/pages/Host.jsx` — How Others Chose on host, closing reflection
- `src/pages/Landing.jsx` — Homepage split source
- `src/components/ScenarioCard.jsx` — Must handle 4 choices (add Roman numeral IV)
- `src/components/ConsequenceReveal.jsx` — Conscience layer text display

### Theoretical References (for copy/framing)
- Kohlberg [1] — R8 scribe pattern, escalation arc
- Greene [2] — R5 timer, R6 walk mechanic
- Awad/MIT Moral Machine [3] — How Others Chose percentages
- Gilligan [4] — Care ethics tagging, R7 Cultural Tribunal

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Timer system already exists (broadcast channel + TimerDisplay component) — R5 can add urgency styling
- ScenarioCard handles 3 choices with ROMAN numerals — needs IV added for R7
- ConsequenceReveal shows framework label + consequence text — conscience layer extends this
- FrameworkProfile shows end-of-game analysis — closing reflection could extend or sit alongside

### Established Patterns
- `choice_history` JSONB on player row tracks per-round choices — scribe record reads this
- `findMoralConflicts()` in detection.js is the conflict detection entry point — new triggers wire here
- Baseline.jsx stores `moral_stances` as JSONB with stance keys — rename propagates here
- worldState meters (trust/courage/solidarity/awareness) 0-100 drive AnimatedMap zones

### Integration Points
- R8 scribe: reads `choice_history` from player row + `scenarios` from kingdom-arc.js
- How Others Chose: new screen state between consequence reveal and next round advance
- Walk mechanic: replaces ScenarioCard for R6 only — conditional render in Play.jsx
- Homepage split: Landing.jsx → two new pages or conditional render based on role selection

</code_context>

<specifics>
## Specific Ideas

- The PRD provides exact "How Others Chose" percentages per round from research — use these as hardcoded reference data
- All 10 conflict trigger strings are specified verbatim in the PRD — use exact text
- The scribe record example in the PRD shows the pattern: "[action] but [contradicting action]. Your people call you [X]. The record calls you [Y]. Which is true?"
- Round 6 walk mechanic per Greene [2]: "The movement IS the decision" — physical engagement changes moral processing vs abstract button taps

</specifics>

<deferred>
## Deferred Ideas

- Live AI-generated scribe records (current approach is template-based pattern matching)
- Animated map visual accumulation per round (map zones already react to worldState — deeper per-round visual layers would be a v2 feature)
- Multi-pack support for How Others Chose (currently kingdom-arc only)
- R6 walk mechanic with actual avatar animation (start with simple directional choice)

</deferred>

---

*Phase: 15-divided-kingdom-phase-2*
*Context gathered: 2026-03-30 via PRD Express Path*
