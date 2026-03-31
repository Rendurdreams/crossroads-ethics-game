# Architecture Patterns — Signal Lost v2.0 Integration

**Domain:** Multiplayer ethics game — adding senator profiles, discussion mode, break flags, grading rubric to existing React+Supabase SPA
**Researched:** 2026-03-30
**Confidence:** HIGH — based on full codebase read, not external research

---

## Existing Architecture Baseline

### Current Routes (App.jsx)
```
/                       Landing.jsx         — host/player split
/create                 Create.jsx          — new session creation
/host-setup/:sessionId  HostSetup.jsx       — pack selection, QR code
/host/:sessionId        Host.jsx            — round control, vote tally, world state
/baseline/:sessionId    Baseline.jsx        — pre-game moral survey (5 questions)
/play/:sessionId        Play.jsx            — player phone view
```

### Current Supabase Tables
- `sessions` — room_code, status, current_round, total_rounds, world_state (jsonb), pack_id
- `players` — session_id, name, avatar, framework_counts, choice_history, dominant_framework, conflicts, moral_values, moral_stances
- `choices` — session_id, player_id, round_number, scenario_id, choice_index, frameworks
- `reflections` — session_id, player_id, text (Round 8 free text)

### Current Lib Layer
- `scenarios.js` — pack registry, `getPackById`, `getScenarioByRound`, `getDefaultPack`
- `detection.js` — `computeProfile`, `findConflicts`, `findMoralConflicts`, `VALUE_CONDITION_TRIGGERS`, `STANCE_TRIGGERS`
- `worldState.js` — `applyChoicesToWorld`, `computeNarrative`
- `scribeRecord.js` — `generateScribeRecord` (dynamic narrative from R1-R7 choices)
- `frameworks.js` — framework definitions, CONFLICT_PAIRS
- `howOthersChose.js` — Awad et al. reference percentages
- `ai.js` — null-returning stubs for future AI debrief

### Current Component Set
```
AnimatedMap.jsx       — GSAP-driven 2D zone map (host screen)
ScenarioCard.jsx      — scenario text + choice buttons (4-choice support exists)
ConsequenceReveal.jsx — private consequence + conscience layer post-round
MeterBar.jsx          — 4-axis animated CSS meter bars (player phones)
FrameworkProfile.jsx  — end screen: dominant framework, conflict map, choice log
HowOthersChose.jsx    — post-round Awad comparison screen
WalkMechanic.jsx      — R6 corridor walk interaction (already implemented)
TimerDisplay.jsx      — countdown timer (already implemented)
VoteTally.jsx         — live host vote tally bars
WorldStatePanel.jsx   — host: 4 meters + threshold event overlay
PlayerRoster.jsx      — host lobby: live player list
ContentNote.jsx       — dismissible content warning banner
```

---

## What Signal Lost Adds

Signal Lost introduces four architectural concerns not present in the kingdom arc:

1. **Senator profiles** — per-player role assignment that drives dynamic "YOUR STAKE" text per round
2. **Discussion Mode** — host-controlled pause screens between rounds with profile breakdown, conflict spotlight, prompts
3. **Break flags** — permanent world-state markers set by specific choices, persisting across all remaining rounds and feeding into R8
4. **Grading rubric** — instructor-facing view of player data; not game logic, but a data export/display concern

---

## Recommended Architecture

### Component Boundaries

| Component | Responsibility | New vs Modified |
|-----------|---------------|-----------------|
| `SenatorProfile.jsx` | Display player's assigned senator card (name, subtitle, per-round stake) | NEW |
| `DiscussionPauseScreen.jsx` | Host-controlled pause between rounds: vote distribution, profile breakdown, conflict spotlight, prompts | NEW |
| `BreakFlagOverlay.jsx` | Visual persistent markers on AnimatedMap when a break flag fires | NEW |
| `AxisTimeline.jsx` | Solo mode: CT/HD/SOL/ACC trajectory as a per-round line graph | NEW |
| `SoloReflection.jsx` | Solo mode end screen: 8-round log, axis timeline, scribe pattern, break flags, closing question | NEW |
| `GradingExport.jsx` | Instructor view: renders rubric dimensions with player response data, exportable | NEW |
| `ScenarioCard.jsx` | Add `senatorStake` prop — renders "YOUR STAKE" panel above choices | MODIFY |
| `ConsequenceReveal.jsx` | Add break flag announcement when a break-flag choice is made | MODIFY |
| `AnimatedMap.jsx` | Add break flag overlay markers (permanent visual state) | MODIFY |
| `WorldStatePanel.jsx` | Show active break flags list in host panel | MODIFY |
| `MeterBar.jsx` | Accept axis `label` prop from pack config instead of hardcoded names | MODIFY |
| `FrameworkProfile.jsx` | Add senator profile card and break flag log to end screen | MODIFY |
| `Host.jsx` | Add Discussion Mode pause gate, profile breakdown panel, facilitator controls | MODIFY |
| `Play.jsx` | Add senator profile display, conflict alert between rounds, solo mode flow | MODIFY |
| `Baseline.jsx` | New question set (Q1-Q5 from signal-lost spec); existing structure is fully reusable | MODIFY |

---

### Data Flow Changes

#### Senator Profile Assignment

```
Join flow (Play.jsx on mount):
  1. Player joins session
  2. Fetch existing senator_profile_id values for this session
  3. assignProfile(existingAssignments) → picks first unused slot from shuffled deck
  4. Write senator_profile_id to players row on insert
  5. SenatorProfile.jsx reads player.senator_profile_id + current round → renders stake text

Profile data lives in:
  /src/lib/senatorProfiles.js    — static data file, 6 profiles × 8 stakes
```

Profile assignment runs client-side in Play.jsx at join time: fetch current players for session, compute taken IDs, assign first available. There is a low-probability race condition for simultaneous joins. For classroom use (sequential joins common), this is acceptable. If collision occurs, two players share a profile — minor UX issue, not a game failure.

#### Break Flags

Break flags are triggered by specific (round, choice_index) pairs. They are permanent once set.

```
Storage: sessions.break_flags (new jsonb column)
  Default: {}
  Shape: { 'R1-ghost': true, 'R2-argus': true, ... }

Trigger point: Host.jsx closeRound()
  After applyChoicesToWorld():
    newFlags = checkBreakFlags(roundChoices, roundNumber, pack)
    mergedFlags = { ...session.break_flags, ...newFlags }
    UPDATE sessions SET break_flags = mergedFlags

Consumption:
  AnimatedMap.jsx         — overlay visual markers when flag is set
  WorldStatePanel.jsx     — active flags list in host panel
  ConsequenceReveal.jsx   — announces new flag on the round it fires
  SoloReflection.jsx      — lists all flags with round context at end screen
  generateScribeRecord()  — reads flags to produce R8 narrative references
```

The break flag map belongs in the pack data file. Each flagging choice carries a `breakFlag` key:

```javascript
// In signal-lost pack data
{
  choiceIndex: 2,
  text: 'Honor Contracts',
  frameworks: ['consequentialism'],
  breakFlag: 'R1-ghost',              // new field, optional
  breakFlagLabel: 'Ghost population marker',
  worldImpact: { CT: -20, HD: -20, SOL: -18, ACC: -10 }
}
```

#### World Axes: Naming Migration

The kingdom arc uses `{ trust, courage, solidarity, awareness }`. Signal Lost uses `{ CT, HD, SOL, ACC }`.

`applyChoicesToWorld()` is already key-agnostic — it iterates `choice.worldImpact` entries and maps them to `newState[meter]`. Signal Lost choices using `{ CT, HD, SOL, ACC }` keys work without any changes to the function, provided `sessions.world_state` is initialized with those keys at session creation.

Add `axes` and `axisStart` to the pack schema:
```javascript
{
  id: 'signal-lost',
  axes: {
    CT:  { label: 'Civil Trust',    code: 'CT'  },
    HD:  { label: 'Human Dignity',  code: 'HD'  },
    SOL: { label: 'Solidarity',     code: 'SOL' },
    ACC: { label: 'Accountability', code: 'ACC' }
  },
  axisStart: 65,   // signal-lost starts at 65, not 50
  ...
}
```

HostSetup writes `world_state` on session creation using `axisStart` and the pack's axis keys. MeterBar.jsx receives axis labels from the pack config, not hardcoded values.

#### Discussion Mode

Discussion Mode is set at session creation in HostSetup and stored in `sessions.mode` (new column: `'discussion' | 'solo'`).

In Discussion Mode, the round lifecycle gains a new status:

```
lobby → active → round_complete → discussion_pause → active (next round)
```

`sessions.status` already handles `lobby | active | round_complete | finished`. Adding `discussion_pause` as a valid status value is the minimal change. It flows through the existing subscription model — players subscribed to session updates react to this new status by showing a "Discussion in progress" waiting screen.

Host.jsx flow after `closeRound()` in Discussion Mode:
1. World state computed, `round_complete` published
2. Host sees `DiscussionPauseScreen` with vote breakdown + prompts + conflict spotlight
3. Facilitator presses "Continue" → status set to `discussion_pause` briefly, then to `active` with `current_round + 1`

`DiscussionPauseScreen` props:
```javascript
{
  round: number,
  scenario: PackScenario,
  players: Player[],     // with senator_profile_id
  choices: Choice[],     // this round's submitted choices
  pack: Pack             // for discussion prompts + conflict spotlight data
}
```

Discussion prompts and conflict spotlight data live in the pack file, keeping the component generic and reusable if other packs add discussion prompts later.

#### Conflict Alerts (between rounds)

Signal Lost requires a brief non-judgmental flag between rounds when a choice contradicts a baseline survey answer. This uses the existing `findMoralConflicts()` mechanism — the change is timing, not logic.

In the kingdom arc, conflicts surface only at the end screen. In Signal Lost, they surface as an interstitial after consequence reveal but before the next round loads.

Play.jsx already tracks `myChoiceHistory`. After each consequence reveal, call `findMoralConflicts()` and check if the just-submitted round produced a new conflict entry. If yes, show the conflict alert before advancing.

Signal Lost's STANCE_TRIGGERS need to be added to `detection.js` — new `matchCondition` entries referencing signal-lost scenario IDs (e.g., `scenarioId === 'signal-lost-r4'`).

#### Grading Rubric

The rubric is instructor-facing only. It reads existing player data (choice_history, senator profile, break flags, baseline survey answers, closing reflection) and presents it against the 4 rubric dimensions.

Delivery: `/grading/:sessionId` route — separate from the host flow, accessible via a link in Host.jsx's end view. Print-friendly single-page layout per player.

No new Supabase tables needed. Reads from `players`, `choices`, `reflections`. Does not need real-time subscriptions — fetch once on mount.

---

### New Supabase Schema Changes

Additive only. No existing columns removed or renamed.

```sql
-- sessions
ALTER TABLE sessions ADD COLUMN mode text DEFAULT 'discussion';
-- Values: 'discussion' | 'solo'

ALTER TABLE sessions ADD COLUMN break_flags jsonb DEFAULT '{}';
-- Shape: { 'R1-ghost': true, 'R4-sealed': true, ... }

-- players
ALTER TABLE players ADD COLUMN senator_profile_id text;
-- Values: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | null (kingdom arc / packs without profiles)

ALTER TABLE players ADD COLUMN axis_history jsonb DEFAULT '[]';
-- Array of { round: number, CT: number, HD: number, SOL: number, ACC: number }
-- Solo mode timeline graph; empty for kingdom-arc players

ALTER TABLE players ADD COLUMN closing_reflection text;
-- Solo mode: answer to "Would you make these choices again?"
-- Feeds grading rubric dimension 4
```

No changes to `choices` or `reflections` tables.

---

### New Library Files

```
/src/lib/senatorProfiles.js     — 6 profile objects with per-round stakes data
/src/lib/breakFlags.js          — BREAK_FLAG_MAP, checkBreakFlags(choices, roundNumber, pack)
/src/lib/axisNarrative.js       — computeAxisNarrative(axisValues, breakFlags) for signal-lost end state
```

`breakFlags.js` isolates trigger logic from Host.jsx, keeping `closeRound()` readable:

```javascript
// breakFlags.js
export function checkBreakFlags(roundChoices, roundNumber, pack) {
  const newFlags = {}
  const scenario = pack.scenarios.find(s => s.round === roundNumber)
  if (!scenario) return newFlags

  scenario.choices.forEach(choice => {
    if (!choice.breakFlag) return
    const triggered = roundChoices.some(c => c.choice_index === choice.choiceIndex)
    if (triggered) newFlags[choice.breakFlag] = true
  })

  return newFlags
}
```

---

### New Routes

```
/grading/:sessionId     GradingExport.jsx    — instructor rubric view, print-friendly
```

App.jsx addition:
```jsx
<Route path="/grading/:sessionId" element={<GradingExport />} />
```

No new player-facing routes. Solo mode end screen is a state within Play.jsx (same as the existing `gameFinished` state showing `FrameworkProfile`), not a separate route.

---

### Modified Scenario Pack Schema

Signal Lost pack adds fields not present in kingdom-arc. All new fields are optional at the pack-schema level so existing packs continue to work unchanged.

```javascript
{
  id: 'signal-lost',
  // ... existing required fields ...
  axes: { CT: {...}, HD: {...}, SOL: {...}, ACC: {...} },  // new
  axisStart: 65,           // new — default is 50 if absent
  profiles: true,          // new — tells engine to assign senator profiles on join
  discussionPrompts: {     // new — keyed by round number
    1: ["...", "...", "..."],
    2: ["...", "..."],
    // ...
  },
  conflictPairs: {         // new — per-round spotlight pairs for Discussion Mode
    1: { profiles: ['B', 'C'], why: '...' },
    // ...
  },
  scenarios: [
    {
      // ... existing required fields ...
      choices: [
        {
          choiceIndex: 0,
          text: '...',
          frameworks: ['care'],
          breakFlag: 'R1-ghost',           // new — optional, only on flagging choices
          breakFlagLabel: 'Ghost population marker',  // new — display string
          worldImpact: { CT: +8, HD: +15, SOL: +12, ACC: -8 }
        }
      ]
    }
  ]
}
```

---

### Component Data Flow

```
sessions.mode
  └─ Host.jsx: show DiscussionPauseScreen after round_complete if mode === 'discussion'
  └─ Play.jsx: solo end screen path vs wait-for-host path

sessions.break_flags
  └─ AnimatedMap.jsx: overlay markers per active flag
  └─ WorldStatePanel.jsx: active flag list in host panel
  └─ ConsequenceReveal.jsx: announces new flag when it fires this round
  └─ generateScribeRecord() + axisNarrative: reads flags for R8 record

players.senator_profile_id
  └─ Play.jsx: renders SenatorProfile.jsx with per-round stake text
  └─ DiscussionPauseScreen: profile → choice breakdown grid
  └─ GradingExport.jsx: reports which profile each student had

players.axis_history
  └─ AxisTimeline.jsx (solo mode end screen only)
  └─ GradingExport.jsx: trajectory data for consequence tracking rubric dimension

players.closing_reflection
  └─ SoloReflection.jsx: captures text response at end
  └─ GradingExport.jsx: rubric dimension 4

pack.discussionPrompts + pack.conflictPairs
  └─ DiscussionPauseScreen.jsx: reads per-round prompts + conflict spotlight pairs
```

---

### Build Order

Dependencies must be built before consumers.

**Wave 1 — Data foundation (no UI, no routes)**
1. `senatorProfiles.js` — static data, no external deps
2. Signal Lost pack file with all 8 rounds, axis deltas, break flags, discussion prompts, conflict pairs — this is the largest single deliverable
3. `breakFlags.js` — depends on pack schema being settled
4. `axisNarrative.js` — computeAxisNarrative for signal-lost world state end copy
5. Supabase schema migrations: add 5 new columns across sessions + players
6. Update `scenarios.js` pack registry — add signal-lost, set as default

**Wave 2 — Player-facing components**
7. `SenatorProfile.jsx` — static render, reads senatorProfiles.js
8. Modify `ScenarioCard.jsx` — add `senatorStake` prop
9. Modify `ConsequenceReveal.jsx` — add break flag announcement
10. Modify `Baseline.jsx` — update to signal-lost Q1-Q5 question set
11. Modify `detection.js` — add signal-lost STANCE_TRIGGERS
12. Modify `Play.jsx` — senator profile assignment on join, conflict alerts between rounds, solo mode end screen routing
13. `AxisTimeline.jsx` — CT/HD/SOL/ACC per-round line graph
14. `SoloReflection.jsx` — solo end screen (builds on FrameworkProfile structure)

**Wave 3 — Host-facing components**
15. `DiscussionPauseScreen.jsx` — full pause UI (requires pack prompts from Wave 1)
16. Modify `WorldStatePanel.jsx` — add active break flags panel
17. Modify `AnimatedMap.jsx` — add break flag overlay markers
18. Modify `MeterBar.jsx` — accept axis label prop from pack config
19. Modify `Host.jsx` — Discussion Mode status gate, DiscussionPauseScreen, facilitator controls
20. Modify `HostSetup.jsx` — add mode selector (Discussion / Solo) before session creation

**Wave 4 — Grading route**
21. `GradingExport.jsx` — read-only rubric view
22. Add `/grading/:sessionId` route to App.jsx
23. Add "Export Rubric" link to Host.jsx end view

---

### Patterns to Follow

#### Pack-Driven Configuration
Signal Lost specializes behavior through pack data, not new code paths. The game engine reads `pack.profiles`, `pack.axisStart`, `pack.axes` at session creation. Kingdom arc continues to work unchanged. The pattern: `if (pack.profiles) { ... }` appears once per file, not scattered through every render.

#### Status Machine Extension
The existing `sessions.status` machine handles the full round lifecycle. Add `discussion_pause` as a valid status rather than a separate column. Host.jsx's existing subscription handles the new status value with one new conditional.

#### Break Flags as Session-Level State
Break flags live on the session, not per player. They represent world events visible to everyone. The host writes them at `closeRound()`; all subscribers read them via the existing session real-time subscription. This avoids any cross-player aggregation query.

#### Senator Profile as Static Data + Single Column
Profile data (2KB) lives in `senatorProfiles.js`. Supabase stores only the profile ID. This avoids bloating the players row and keeps Supabase queries simple.

---

### Anti-Patterns to Avoid

#### Don't Add a Route for Discussion Pause
The pause screen is a status state within `/host/:sessionId`, not a route. A separate route would require tearing down and re-establishing real-time channels across navigation.

#### Don't Store Break Flags Per Choice Row
Break flags belong on the session. Per-choice storage would require aggregating across all players to determine if a flag is active, adding query complexity. Session-level jsonb is the right shape.

#### Don't Rename Existing Axis Keys in worldState.js
`applyChoicesToWorld()` is already key-agnostic. Renaming its internal handling to CT/HD/SOL/ACC would break kingdom arc. Let pack `worldImpact` keys determine axis names.

#### Don't Compute Profiles Mid-Game
`computeProfile()` and `generateScribeRecord()` run at end-of-session. The only mid-game signal is the per-round conflict alert: one `findMoralConflicts()` call against the latest choice. Nothing more.

#### Don't Add Grading Logic to the Game Engine
The grading rubric reads existing data. It does not need new detection logic or Supabase writes. GradingExport.jsx is a read-only view.

---

## Integration Points Summary

| Feature | What Changes | New Files | Modified Files |
|---------|-------------|-----------|----------------|
| Senator profiles | Profile ID assigned on join; per-round stake text in ScenarioCard | `senatorProfiles.js`, `SenatorProfile.jsx` | `Play.jsx`, `ScenarioCard.jsx`; Supabase: `players.senator_profile_id` |
| Discussion Mode | New `discussion_pause` status; host sees pause screen after each round | `DiscussionPauseScreen.jsx` | `Host.jsx`, `HostSetup.jsx`, `Play.jsx`; Supabase: `sessions.mode` |
| Break flags | Checked at round close; stored on session; rendered as map overlays | `breakFlags.js`, `BreakFlagOverlay.jsx` | `Host.jsx`, `AnimatedMap.jsx`, `ConsequenceReveal.jsx`, `WorldStatePanel.jsx`; Supabase: `sessions.break_flags` |
| Grading rubric | New read-only route reads existing data | `GradingExport.jsx` | `App.jsx` (add route), `Host.jsx` (add link); Supabase: `players.closing_reflection` |
| Axis names | Pack declares axes + start value; worldState.js unchanged | signal-lost pack file, `axisNarrative.js` | `MeterBar.jsx` (label prop), `HostSetup.jsx` (init world_state from pack) |
| Solo mode end screen | Play.jsx `gameFinished` state extended | `SoloReflection.jsx`, `AxisTimeline.jsx` | `Play.jsx`; Supabase: `players.axis_history` |
| Conflict alerts (mid-game) | findMoralConflicts called after each round in Play.jsx | none | `Play.jsx`, `detection.js` (signal-lost STANCE_TRIGGERS) |

---

## Sources

- Codebase direct read: `/src/App.jsx`, `/src/pages/Host.jsx`, `/src/pages/Play.jsx`, `/src/pages/Baseline.jsx`, `/src/lib/detection.js`, `/src/lib/worldState.js`, `/src/lib/scenarios.js`, `/src/lib/scribeRecord.js`, `/src/lib/supabase.js`, `/src/components/ScenarioCard.jsx`, `/src/components/AnimatedMap.jsx` (HIGH confidence — first-party source)
- Game spec: `/Users/jay/MoralApp/signal_lost_phase_brief.md` (HIGH confidence — authoritative spec)
- Project context: `.planning/PROJECT.md` (HIGH confidence — current milestone definition)
