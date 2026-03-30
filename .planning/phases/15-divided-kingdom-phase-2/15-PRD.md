# PRD: Dilemma 1 Flow Redesign + Bug Fixes

## Phase Goal
Ship the revised Dilemma 1 end-to-end flow: replace the reflection round with a bombshell final choice, fix three bugs (host score labels, player answer toggle, question on host screen), and ensure copy is punchy throughout.

## Requirements

### R1: Bombshell Round (replaces reflection)
- Replace Round 8 "The Reckoning" (choices: []) in kingdom-arc.js with a new bombshell scenario that has 3 real choices with massive worldImpact values (2-3x normal)
- The bombshell must feel like a climax — a single high-stakes reveal that can change the outcome of the game
- The bombshell answer should have power to swing world state dramatically (potentially reversing meter trends from prior 7 rounds)
- Same round mechanics as Rounds 1-7: 3 choices, timer, submit, host closes round
- After host closes bombshell round → reveal → "The Verdict" overlay (not "THE LESSON") → "End Game" button → endSession()
- Fix totalRounds math: getPlayableScenarios() will now return 8 since bombshell has choices — audit HostSetup.jsx to ensure total_rounds is correct (should be 8, not 9)
- The reflection textarea path on the player end screen (FrameworkProfile.jsx) should remain — it becomes a post-game reflection, not an in-game round

### R2: Bug Fix — Host Score Display Mismatch
- Host.jsx line ~577: METER_LABELS uses old names {trust: 'Trust', courage: 'Courage', solidarity: 'Solidarity', awareness: 'Awareness'}
- Must be updated to {trust: 'Honesty', courage: 'Courage', solidarity: 'Loyalty', awareness: 'Empathy'} to match the Phase 13 meter rename
- These labels appear in the delta pills shown after the reveal animation

### R3: Bug Fix — Player Answer Toggle
- Current behavior: handleChoice() in Play.jsx returns immediately if lockedChoiceIndex !== null (line ~270), permanently locking the first selection
- Required behavior: Player can change their selection at any time before the round ends (timer expires or host closes round)
- Implementation: Remove the early-return guard on lockedChoiceIndex. Use upsert (or delete + re-insert) instead of insert to handle the unique constraint on (session_id, player_id, round_number)
- Visual: Currently-selected choice stays highlighted, but tapping a different choice should update the selection
- The choice count on host vote tally must stay accurate (not double-count)

### R4: Bug Fix — Question Visible on Host Screen
- During active round, the host screen shows vote tally toggle, timer, submitted count — but NOT the scenario text
- Add the current scenario title and body text to the host active round view so the presenter can read the question aloud or the class can see it on the projected screen
- Should be visible without toggling — always present during the active round state

### R5: Language/Copy Polish
- Bombshell scenario copy must be punchy and distinct — this is the climax
- Host status text during bombshell round: something different from "The Council Deliberates" — e.g. "The Final Reckoning" or similar
- Bombshell reveal: different from "The Realm Shifts..." — e.g. "The Throne Speaks..."
- Bombshell overlay: "THE VERDICT" not "THE LESSON"
- Review all player-facing copy touched by this phase for tone — should feel dramatic, not academic
- Keep kingdom atmospheric framing (D-06 from Phase 13)

## Constraints
- Kingdom-arc pack only — do not touch real-world-modern or futures packs
- No new dependencies
- No structural changes to Supabase schema (upsert or delete+insert for answer toggle)
- The reflection textarea on the player end screen (FrameworkProfile.jsx) remains functional for post-game use
- Must ship today — no scope creep beyond these requirements

## Acceptance Criteria
- [ ] Round 8 is a playable bombshell with 3 choices and 2-3x worldImpact values
- [ ] Reflection round (choices: []) removed from kingdom-arc.js
- [ ] total_rounds computes correctly (8 playable, no +1 for reflection)
- [ ] Host delta pills show Honesty/Courage/Loyalty/Empathy (not Trust/Courage/Solidarity/Awareness)
- [ ] Player can tap a different choice before round closes and DB updates correctly
- [ ] Host vote tally count stays accurate after choice changes
- [ ] Host screen shows scenario title + text during active round
- [ ] Bombshell round has distinct host status text and overlay label
- [ ] Build passes (vite build exits 0)
