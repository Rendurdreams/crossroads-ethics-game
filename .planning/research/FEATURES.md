# Feature Landscape

**Domain:** Educational ethics simulation — dynamic player profiles, facilitated discussion, persistent world consequences, and instructor assessment
**Project:** The Crossroads v2.0 — Signal Lost (Sci-Fi Senator Ethics Game)
**Researched:** 2026-03-30
**Scope note:** This file supersedes the v1.0 features analysis. It covers ONLY the new Signal Lost milestone features. The v1.0 platform (room code join, host round control, vote tally, framework detection, etc.) is fully built and not re-analyzed here.

---

## Context: What Already Exists

The platform already has:
- Multi-pack scenario system (3 packs, pack-driven total_rounds)
- Moral baseline survey (5 questions, stored in `moral_values` + `moral_stances`)
- Framework/conflict detection (`computeProfile()`, `findConflicts()`)
- Host dashboard with round control, vote tally, lesson overlay, HowOthersChose
- Player view with choice submission, consequence reveal, framework profile end screen
- AnimatedMap with 4 reactive zones, world state meters
- Timer pressure (R5), walk mechanic (R6), scribe record (R8)
- ConsequenceReveal with conscience layer display
- 4-choice ScenarioCard support

The new features are additive layers on this foundation, not replacements.

---

## Table Stakes

Features that users of educational ethics simulations expect. Missing = the game feels incomplete or unconvincing as a classroom tool.

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| Role/profile assignment at join | Role-based simulations (Reacting to the Past, PbD Simulation, political science sims) universally assign player roles. Without a personal stake, it's just a survey. Players need to know WHO they are before they decide what they do. | Low | Assigned at session join. Stored on player row. Displayed throughout play. |
| Profile name and subtitle visible during play | Players need to remember their persona mid-round. Shown in header or side panel during scenario. Forgetting who you are breaks immersion. | Low | Requires `profileId` on player record, profile lookup in session state. |
| Per-round personal stake shown before each choice | The stakes panel is the core differentiator of role-based ethics games. Without it, profiles are cosmetic. The stake tells the player what THIS vote costs THEM personally. | Low | Stake text keyed to `profileId` + round number, rendered above scenario text. |
| Scenario text still readable with profile context added | Adding a "Your Stake" panel must not crowd out the scenario. Phone layouts are tight. | Low | CSS layout discipline. Profile stake in a callout, scenario text in primary area. |
| Discussion prompts accessible to facilitator | Every ethics simulation (EthicsGame, Reacting to the Past, PbD Simulation) ships with discussion guides. The game is the starting gun; the discussion is the lesson. Facilitators need prepared prompts. | Low-Medium | Pre-written, per-round prompts. Two to three per round. Static data, no AI. |
| Facilitator can pause between rounds | Nearpod, teacher-paced classroom tools, and every serious game designed for facilitated use gives the instructor pacing control. Auto-advance removes the ability to debrief. | Medium | Discussion Mode flag on session. After round closes, game waits on facilitator "Continue" rather than auto-loading next round. |
| Player profile visible throughout the game | Not just at join — players should be able to see their full profile (health, money, family, politics variables) at any point. Needed for informed decision-making. | Low | Profile card accessible via tap/expand at any time during play. |
| Session mode set at launch, not mid-game | Classroom games that allow mid-game mode switching create confusion. Mode (discussion vs. solo) is a session-level config set before players join. | Low | `mode` field on sessions table. Set at HostSetup before room code generated. |
| Axis values visible during play | The four world-state axes (CT, HD, SOL, ACC) must be visible to players throughout. Players can't reason about consequences they can't see. | Low | Already exists as AnimatedMap + WorldStatePanel. Axis labels and values update live. |
| End-of-game reflection that is NOT a score | Educational simulations that reveal a score at the end train players to game for points. The end screen is a mirror, not a grade. Players should see their pattern, their record, their world — not a number. | Low | Already architecturally correct (FrameworkProfile, scribe record). Signal Lost extends this, doesn't replace it. |
| Grading rubric available to instructor (not shown to players) | Every serious educational tool with assessment claims ships instructor-facing rubrics. Without one, the game is a classroom toy rather than an assessed activity. The rubric separates "game" from "assignment." | Low | Static document/PDF, OR an in-app rubric display behind a facilitator view. Not shown to players. |

---

## Differentiators

Features that make Signal Lost distinct from any existing ethics simulation. Not expected by the genre — but deliver the pedagogical and experiential value that justifies building this.

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| Asymmetric personal stakes per senator profile | The same dilemma has different personal costs for each player. Profile B faces Round 6 with VANTAGE bonds; Profile F faces it with no financial stake and a brother in the displaced queue. This is NOT cosmetic. It creates genuine moral tension unique to each player. No other classroom ethics tool does per-player asymmetric stakes this precisely. | Medium | 6 profiles x 8 rounds = 48 stake strings. Stored in profile data. Rendered dynamically per `profileId` + `roundNumber`. |
| Profile breakdown in Discussion Mode | After each round, the facilitator can see (and optionally reveal) which senator profile voted which way — anonymously by profile letter, not by player name. This surfaces the structural effect of personal interest on decision-making. "Profile B (VANTAGE bonds) chose Walk Away. Profile F (no stake) enforced. Ask why." | Medium | Requires profile-to-choice mapping in session aggregate data. Conditionally shown in discussion pause screen. |
| Conflict spotlight (conditional, per round) | The game detects when the pre-defined conflict pair for a round chose differently and surfaces it explicitly: "Profile B and Profile C chose opposite options. This round's conflict is [X]. Ask them to explain." Fires ONLY when the pair actually split — not a generic prompt. | Medium | Conflict pair table (6 pairs). Post-round: check if conflict pair chose different options. If yes, generate spotlight text with actual choices filled in. |
| Break flags: permanent world-state markers | When a player makes a choice that triggers a break flag (7 possible), a permanent visual marker appears on the map and STAYS visible for all remaining rounds. Early choices recontextualize later ones. In R8, the scribe record explicitly names every break flag triggered. This is "creeping complicity" as a mechanic — not just a narrative claim. | High | Break flag state in session record (7 boolean slots). AnimatedMap must render active flags alongside normal landmarks. R8 scribe record reads active flags to customize its text. |
| Profile-aware conflict alerts between rounds | After each round, if a player's choice conflicts with their senator profile's stated interests or their own baseline survey, a brief non-judgmental alert fires: "Before Round 4: Your donor base opposes disclosure. You just published the audit. What changed?" Different from general framework conflict detection — this is profile-specific. | Medium | Cross-references `profileId` + `choiceIndex` against a conflict alert table. Extends existing moral conflict detection (Phase 15.1) with profile-context layer. |
| Axis trajectory timeline in end screen | Solo mode shows an axis chart that plots each of the 4 axes across all 8 rounds as a timeline — not just the final value, but the arc. Players can see exactly when their world changed, and which choices drove which drops. No existing ethics simulation does longitudinal consequence visualization at this granularity. | Medium-High | `axisHistory` array (one entry per round). Timeline graph component (SVG or CSS). Significant visual work but not complex data logic. |
| Round 5 forced choice on timer expiry | When the 90-second timer expires, the game automatically selects a choice (highlighted/default) on the player's behalf. This is not punitive — it IS the lesson (Greene et al. dual-process theory: time pressure activates System 1). The forced choice is flagged in the record and mentioned in the debrief. | Medium | Already implemented in v1.2. Signal Lost reuses this mechanic with its own round 5. Timer expiry flag stored in session record. |
| Round 6 physical walk mechanic with 3 outcome states | The player moves an avatar in a corridor. The choice is encoded in body movement, not menu selection. Three outcomes: walked to terminal (I), turned away (II), stopped short at door (III). Midpoint crossing triggers the decision. This bypasses deliberative rationalization in a way that clicking a button does not. | High | Already implemented in v1.2 as WalkMechanic.jsx. Signal Lost reuses and configures it for the Kael corridor scenario. |
| Dynamic scribe record reading break flags | The R8 scribe record is not just framework-based — it references specific break flags. A player who triggered R1-ghost AND R4-sealed sees different text than one who triggered neither. The record reads like an investigation of their own choices, not a generic archetype description. | High | generateScribeRecord() must accept both `frameworkPattern` and active `breakFlags`. 7 optional text insertions in the scribe templates. |
| Grading rubric tied to game mechanics | The instructor rubric directly references game artifacts: "Student identifies how R4-II (sealed audit) interacted with their senator profile's conflict of interest." Rubric dimensions map onto specific game mechanics (consequence tracking → break flags; personal stake awareness → profile tensions). This is not a generic essay rubric retitled. | Low | Static instructor-facing document. No game logic required. |
| Assessment export in solo mode | After R8, solo mode generates a downloadable summary: senator profile, all 8 choices with timestamps, axis trajectory, written reflection response, scribe pattern, break flags triggered. JSON + optional PDF. Designed for submission to instructor. | High | PDF generation (jsPDF or similar). JSON export is trivial. PDF layout is non-trivial. New dependency. |

---

## Anti-Features

Features that would seem useful but actively undermine Signal Lost's pedagogical design.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Profile breakdown visible to players during voting | If players know which profile voted which way during the round, they will vote based on social dynamics rather than their own reasoning. The breakdown is for post-round discussion, not live influence. | Show profile breakdown ONLY after round closes, and ONLY at facilitator discretion in Discussion Mode. Players never see it. |
| Per-player framework score visible to other players | Knowing "Profile B is a consequentialist" before the game ends shapes voting behavior. The framework reveal is a private end-screen experience, not a leaderboard. | Framework profile shown privately to each player on their own phone at game end. Aggregate group breakdown (no names, no profiles) shown on host screen. |
| Facilitator "correct answer" indicator in Discussion Mode | Showing the facilitator which choice was "best" would sabotage the game's core principle that there are no right answers. Even in discussion, the facilitator's job is to surface tension, not resolve it. | Discussion prompts point at the tension: "Profile B chose [X] because [stake]. Did the stake make this the right call, or just the convenient one?" |
| Mid-round profile switching | Players should not be able to change their senator profile mid-game. Asymmetric stakes only work if the player is committed to living with them. | Profile assigned at join, immutable for the session. |
| Break flag redemption or "healing" | Once a break flag triggers, the world state marker is permanent. Giving players a way to remove it by making a later "good" choice would eliminate the creeping complicity mechanic. | Break flags are one-way. The R8 record reflects every flag triggered, with no ability to retroactively edit the record. |
| Automatic Discussion Mode advancement | If the game auto-advances after 5 minutes of discussion, it puts the technology in control of the classroom. The entire point of Discussion Mode is facilitator pacing. | The game WAITS. No timer on the pause screen. Facilitator presses "Continue" when ready. Period. |
| Grading rubric shown to students before reflection | If students know the rubric dimensions before writing their reflection, they will write to the rubric rather than engaging authentically. The rubric is an instructor instrument. | Rubric lives in a separate instructor view (HostSetup or a dedicated `/rubric` route, password-optional). Not exposed to players at any point. |
| Solo mode discussion prompts | Discussion prompts are designed for social facilitation. In solo mode, they are confusing noise — "ask this person to explain" makes no sense when playing alone. | Solo mode shows a different end screen: full decision log, axis timeline, scribe record, break flag map, closing question. No discussion prompts. |
| Assessment export in Discussion/Classroom mode | Exporting individual player data from a group session risks exposing private choices to the instructor in a context where players expected anonymity. Discussion Mode aggregate data is appropriate; individual exports are not. | Assessment export is SOLO MODE ONLY. Discussion Mode provides aggregate facilitator reports, not per-player submissions. |

---

## Feature Dependencies

### Senator Profile System

```
Profile assigned at join
  → Profile data (name, subtitle, health/money/family/politics) fetched from profileData.js
  → `profileId` stored on player row in Supabase
  → Per-round stake rendered from profile.stakes[`r${roundNumber}`]
  → Profile card accessible during play (tap to expand)
  → Profile-aware conflict alerts keyed to profileId + choiceIndex (between rounds)
  → Profile breakdown in Discussion Mode post-round (profileId → choiceIndex mapping)
  → Conflict spotlight fires if conflict pair (from conflict table) split (profileId A vs B)
  → End screen: profile reflected in scribe record context
```

### Discussion Mode

```
mode: 'discussion' set at HostSetup
  → Session stored with mode field
  → After each round closes (host closes round)
      → Discussion Pause Screen renders on host dashboard
      → Players see "Waiting for facilitator..." hold screen (NOT next round)
      → Pause screen sections:
          1. This Session distribution (live vote %)
          2. Profile Breakdown (profileId → choiceRoman, revealed at facilitator discretion)
          3. Discussion Prompts (2-3 per round, static data)
          4. Conflict Spotlight (conditional — only fires if conflict pair split)
      → Facilitator controls: skip, show/hide profile breakdown, add custom prompt, timer (3/5/10 min)
      → Facilitator presses "Continue" → next round loads for all players
```

### Break Flags

```
Each choice in scenario data tagged with breakFlag: boolean + flagKey: string (optional)
  → On choice submission: if breakFlag, set session.breakFlags[flagKey] = true
  → AnimatedMap: reads breakFlags, renders permanent markers on correct map zones
  → All subsequent rounds: markers remain visible (never cleared)
  → R8 scribe generation: reads breakFlags, inserts flag-specific text into scribe narrative
  → Solo mode end screen: Break Flags section shows visual map of triggered flags
  → Assessment export: includes breakFlags object
```

### Grading Rubric

```
Rubric is instructor-only content
  → Option A: PDF/static document linked from HostSetup
  → Option B: dedicated /rubric route in the app (behind a simple passphrase)
  → 4 dimensions: Moral Reasoning Quality (30pts), Personal Stake Awareness (20pts),
    Consequence Tracking (25pts), Closing Reflection (25pts)
  → Bonus dimension: Baseline alignment (10pts, only if baseline completed)
  → NOT shown to players at any point
  → In solo mode: assessment export JSON is the student submission artifact
```

### Assessment Export (Solo Mode only)

```
Solo mode: R8 → Reflection Screen
  → Player completes closing question ("Would you make these choices again?")
  → "Export My Record" button appears
  → generateExport() compiles:
      - profileId + profile name
      - choices[1..8] with timestamps and axis deltas
      - axisHistory (per-round values for all 4 axes)
      - writtenReflection (text response)
      - scribePattern (dominant framework text)
      - breakFlags (which triggered, which round)
  → Export formats:
      - JSON: trivial, always available
      - PDF: requires jsPDF or similar; significant layout work; Phase 2 candidate
```

---

## MVP Recommendation

Signal Lost v2.0 has two natural tiers. The first ships the core game; the second ships the assessment infrastructure.

### Tier 1 — Core Game (Must Ship)

All of these are blocking for the game to function as designed:

1. **Senator profile assignment + display** — Without per-round personal stakes, the game is just the existing scenario system with a cosmetic label. Profiles are the structural differentiator.
2. **Discussion Mode pause screen** — Without facilitator-controlled pacing, the game cannot be used in a classroom. This is not optional for the classroom context.
3. **Profile breakdown (post-round, facilitator-revealed)** — One of the two highest-value moments in Discussion Mode. The conflict spotlight is the other.
4. **Conflict spotlight (conditional)** — Only fires when the pre-defined pair actually split. High value, low frequency.
5. **Break flags (permanent markers on AnimatedMap)** — The "creeping complicity" mechanic. Without this, Round 8 cannot reference prior choices. The scribe record loses its specificity.
6. **Signal Lost scenario pack (8 rounds)** — The scenario data itself, including framework tags, axis deltas, conscience layer, break flag triggers, discussion prompts, and per-profile stakes.
7. **Profile-aware conflict alerts** — Lighter weight than full discussion mode features; fires between rounds based on profile + choice. Extends existing Phase 15.1 detection system.

### Tier 2 — Assessment Infrastructure (Defer if Needed)

These are valuable but not blocking for the core game to run:

8. **Grading rubric (instructor-facing document or route)** — Can be a PDF linked from HostSetup. No app logic required for Tier 1 MVP.
9. **Axis trajectory timeline on end screen** — Significant visual work. Solo mode end screen can ship without it in Tier 1.
10. **Assessment export (JSON)** — Solo mode JSON export is low complexity. Add after Tier 1 game is stable.
11. **Assessment export (PDF)** — New dependency (jsPDF). High complexity for layout. Tier 2 or later.

### Defer to Post-Milestone

- PDF export with full layout
- Custom discussion prompt input field (facilitator can add their own prompt)
- Timer controls for discussion sessions (3/5/10 min countdown in Discussion Mode)
- Break flag visual animations on the AnimatedMap (static markers acceptable for v2.0)

---

## Complexity Notes

| Feature | Complexity Rating | Reasoning |
|---------|------------------|-----------|
| Senator profile data + per-round stakes | Low | 6 profiles, 48 stake strings. Pure data + render. No logic complexity. |
| Profile card accessible during play | Low | Expandable panel showing static profile data. |
| Discussion Mode mode flag + wait state | Low-Medium | `mode` field on sessions. After round close: players see hold screen, host sees pause screen. Routing logic straightforward. |
| Discussion Pause Screen (all 4 sections) | Medium | Profile breakdown requires post-round choice aggregation by profileId. Conflict spotlight conditional logic. Otherwise static. |
| Facilitator controls in Discussion Mode | Medium | Skip/continue is Low. Show/hide profile breakdown is Low. Custom prompt input is Medium (new UI + session update). Timer is Medium (broadcast channel). |
| Break flags — data model | Low | Boolean flags on session record. 7 flags max. Schema change: add `break_flags jsonb` to sessions table. |
| Break flags — AnimatedMap rendering | Medium | AnimatedMap must read active flags and render persistent markers. 7 distinct map markers needed. CSS/SVG work. |
| Break flags — R8 scribe integration | Medium-High | `generateScribeRecord()` must conditionally insert text based on active flags. Up to 7 optional insertions. Template logic complexity. |
| Profile-aware conflict alerts | Medium | Cross-reference table: profileId + choiceIndex → alert text. Extends detection.js. 6 profiles x ~3-4 triggering combinations = ~20 entries. |
| Axis trajectory timeline | Medium-High | SVG or Canvas chart showing 4 axes over 8 rounds. No external charting library in stack — must be hand-built or add recharts/d3. New visual component. |
| Grading rubric document/route | Low | Static content. Either a linked PDF or a simple read-only React page at `/rubric`. No data logic. |
| Assessment export JSON | Low | `JSON.stringify(exportObject)` + `<a>` download trigger. Trivial. |
| Assessment export PDF | High | jsPDF or react-pdf introduces new dependencies. Layout non-trivial. Significant testing surface. |
| Signal Lost scenario pack (data only) | Medium | 8 rounds × (4 choices × (framework tags + axis deltas + conscience layer + break flag flag)) + per-profile stakes (6×8) + discussion prompts (3×8) = substantial but mechanical data authoring. |

---

## Sources

**Research basis and confidence levels:**

- Role-based game design with asymmetric profiles: Based on research from Reacting to the Past (Barnard College pedagogy), the PbD Simulation (PMC/Springer), and role-play simulation literature (Cambridge Core, ScienceDirect). HIGH confidence that per-player asymmetric stakes are table stakes for role-based ethics simulations.

- Facilitator-controlled pacing as table stakes: Confirmed by MIT 2025 thesis on teacher-centered game design, Nearpod teacher-paced mode literature, and CMPG design guidelines (ScienceDirect). HIGH confidence.

- Discussion mode design patterns: Multiple sources confirm facilitator-controlled pacing + post-round discussion prompts as the standard pattern for classroom ethics games (EthicsGame resource center, PbD Simulation, educational game facilitation research). MEDIUM confidence on specific UI conventions (pause screen layout, conflict spotlight).

- Break flags / permanent state markers: No established academic term for this mechanic — it exists in narrative games (Telltale, Inkle Studios) and some policy simulations but is not a named pattern in educational game literature. Treated as a design original that implements "creeping complicity" (the project's own stated design principle). MEDIUM confidence in implementation approach; LOW confidence in "industry standard" framing (because there isn't one).

- Grading rubric as table stakes for assessed games: Confirmed by AAC&U VALUE Rubric for Ethical Reasoning (well-established standard in college ethics education), EthicsGame resource center, and clinical simulation assessment literature (Healio). HIGH confidence.

- Assessment export in solo mode: Standard in LMS-integrated games (xAPI, SCORM) and solo-play serious games. Filament Games' "big data" assessment pattern (external assessment via full decision log). MEDIUM confidence on specific export format.

- Axis trajectory timeline as differentiator: No evidence of this feature in comparable ethics simulations. Confirmed as novel through negative research — searched ethics game end screens, decision log patterns, and found nothing matching this specificity of longitudinal axis visualization. HIGH confidence this is differentiating.

**Key sources consulted:**
- Reacting to the Past: https://reacting.barnard.edu/
- PbD Simulation: https://pmc.ncbi.nlm.nih.gov/articles/PMC7755628/
- Frontiers Information Ethics Simulation: https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.933298/full
- Filament Games assessment strategies: https://www.filamentgames.com/blog/5-assessment-strategies-learning-games/
- MIT teacher-centered design thesis: https://dspace.mit.edu/bitstream/handle/1721.1/162986/luong-jkluong-meng-eecs-2025-thesis.pdf
- AAC&U VALUE Rubric for Ethical Reasoning: https://www.aacu.org/value/rubrics/value-rubrics-ethical-reasoning
- CMPG design guidelines: https://www.sciencedirect.com/science/article/abs/pii/S0360131511000960
- signal_lost_phase_brief.md (project specification): HIGH confidence, directly authored
