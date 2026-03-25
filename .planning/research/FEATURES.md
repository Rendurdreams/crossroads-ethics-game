# Feature Landscape

**Domain:** Real-time host-controlled classroom/party game with phone players
**Project:** The Crossroads — Multiplayer Ethics Game
**Researched:** 2026-03-25
**Confidence note:** WebSearch and WebFetch were unavailable. This analysis draws from training knowledge of Kahoot, Mentimeter, Jackbox, and Polleverywhere (all well-documented platforms stable before knowledge cutoff). MEDIUM confidence overall on genre conventions; HIGH confidence on this project's specific requirements, which are fully specified in CLAUDE.md.

---

## Table Stakes

Features users expect from the genre. Missing = game doesn't feel like a real product.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Room code join (no login) | Kahoot/Jackbox established this as the genre norm. Any friction before joining kills classroom momentum. | Low | 4-digit numeric code. Players type it, enter name, done. Store player_id in localStorage. |
| Live player roster in lobby | Host and players need to see who's in the room. Creates social anticipation before the game starts. | Low | Supabase real-time INSERT on players table. Emoji avatar assigned on join adds personality with zero complexity. |
| Host-controlled round progression | Host drives the pace. Players cannot advance themselves. Critical for classroom context where presenter needs control. | Low | Session status field: lobby → active → round_complete → active... Host triggers each transition. |
| Scenario/question visible on phone | Player's phone is their primary input device. Content must render fully and readably on mobile. | Low | Large serif text, full-screen padding, no horizontal scroll. |
| Choice lock on tap | After selecting, player cannot change. Prevents gaming the system and creates commitment UX. | Low | Optimistic UI: button grays immediately on tap, choice written to Supabase async. |
| Live submission counter | "X of Y have submitted" on both host and player screens. Tells the host when to close and prevents players from sitting idle. | Low | Count of choices with round_number = current_round for this session. |
| Aggregate results reveal | After round closes, host sees breakdown of how players voted. This is the primary host feedback loop. | Low | VoteTally.jsx: percentage bars per choice. Animates as it appears. |
| No-login persistence across page refresh | Players who refresh their phone should not lose their session. Common failure point in classroom settings. | Low | localStorage player_id + session_id. Re-fetch current session state on mount. |
| Content visible from projection distance | Room code and key UI elements must be legible from 15–20 feet. | Low | Room code: minimum 72px font. Consider white on dark background for contrast. |
| Mobile-first layout | 100% of players will be on phones. Broken mobile layout = broken game. | Low | Single-column, thumb-reachable buttons, no tiny tap targets. |
| Clear "waiting" state after submitting | Players submit their choice and then wait. Dead air on their phone = confusion/disengagement. | Low | "Waiting for [X] more players..." or animated holding screen. |
| Host can start when ready (not auto-start) | Host needs to brief the room before kicking off. Auto-start on join count would be disastrous live. | Low | Start button enabled when 2+ players joined. Host clicks manually. |

---

## Differentiators

Features that make this game distinct from Kahoot/Mentimeter. Not expected by genre — but create the pedagogical and experiential value that justifies building this instead of using an existing tool.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Framework label revealed AFTER choice | The surprise is the lesson. Players choose from gut, then learn what philosophical tradition they just enacted. No existing classroom tool does this. | Low | Store choice, then append label + 1-sentence explanation in `round_complete` state. Timing is everything: label appears when consequence does, not before. |
| Private consequence per player | Each player gets a private narrative outcome after the round closes. Kahoot shows a leaderboard. This shows a story. Creates emotional weight the genre lacks. | Medium | ConsequenceReveal.jsx: consequence text keyed to choice_index, rendered when session status = round_complete. |
| Collective world state (4 meters) | Aggregate choices physically change a shared environment. Players see the city they built together. Introduces systemic thinking — individual choices compound. | Medium | applyChoicesToWorld() runs after each round. Four meters update on host screen and player phones. Drives the narrative. |
| Framework profile at end (not a score) | Kahoot ends with a leaderboard. This ends with a personalized philosophical profile. The end screen IS the lesson. | High | computeProfile() + findConflicts() must work correctly. Profile has 4 sections: dominant framework, conflict map, least-used prompt, choice log. |
| Named conflict detection | When a player's framework shifts between rounds, the game names the tension explicitly and gives it a philosophical label. No other tool surfaces internal contradiction as content. | High | Pre-defined conflict pairs. Requires at least 2 rounds with opposing frameworks. Conflict copy is pre-written per pair. |
| Pass option on heavy rounds | Content note + ability to skip a round without submitting. Acknowledges that some scenarios touch real life. No other classroom tool in this genre does this. | Low | Pass submits a null/abstain choice_index. Excluded from framework detection. World state calculation skips abstentions. |
| Free-text reflection round | Round 6 is not a choice — it's a question answered in prose. Responses feed the debrief anonymously. Bridges game and discussion. | Medium | Text input + submit. Stored separately. Host end view shows scrolling anonymous feed. |
| Anonymous group framework breakdown | Host end view shows what percentage of the group leaned toward each framework overall. Not "who chose what" — just the aggregate pattern. Invites class discussion without exposing individuals. | Medium | Sum framework_counts across all players. Pie or bar display on host end screen. |
| World state narrative on host end screen | The final city state gets a 1–2 sentence narrative generated from meter values. "Your group built a city where trust collapsed but solidarity held." | Medium | Pre-written narrative templates keyed to meter combinations. Not AI-generated — deterministic from meter thresholds. |
| Modular round count (3/4/5/6) | Host configures the session length before starting. Kahoot has fixed length. This adapts to available time. | Low | total_rounds field on session. Round selector in lobby view. |
| Threshold events | When a meter crosses a critical threshold (e.g. trust < 20), a dramatic visual event triggers on the host screen. Creates memorable presentation moments. | High | Three.js only (deferred to v2). CSS placeholder for v1: full-screen overlay with threshold text. |
| QR code for room join | Players scan projected screen instead of typing a code. Reduces friction in large rooms. | Low | qrcode.js or similar. Deferred to Phase 8. Not blocking. |

---

## Anti-Features

Features Kahoot/Mentimeter have that this game deliberately should not build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Leaderboard / points / winner | Scoring ethics choices sends the wrong message. "You got +500 points for deontology" trivializes the content and creates a game about winning instead of reflection. | Framework profile: a lens, not a score. The end screen shows patterns, not rankings. |
| Speed bonus (faster = more points) | Kahoot rewards rapid answers. For moral dilemmas requiring 30–45 seconds of reading, speed incentives are actively harmful. | Timer that indicates a round will close, but no point bonus for early submission. |
| Player names on tally board | Showing "Alex chose B" while voting is live would compromise privacy and make players game each other rather than reason independently. | Anonymous aggregate percentages only. Choices are private until framework profile at end — and even then, never attributed publicly. |
| Social comparison of scores | "You finished 3rd out of 22" is the Kahoot model. This game has no equivalent. | The only comparison is group vs. individual: "you leaned care ethics; the group leaned virtue ethics." Not competitive. |
| Question bank / quiz creation UI | Mentimeter and Kahoot let users build their own questions. This game has a fixed, curated scenario library that requires careful framework tagging. Custom scenarios would require the full framework-tagging system to be exposed. | Fixed library. If customization is needed later, it's a v3 feature with significant authoring tooling required. |
| Persistent user accounts | No login means no "your history across sessions." This is a feature, not a limitation — the ephemeral session is appropriate for a classroom game. | localStorage only. No accounts. No history. |
| Mid-round chat / reactions | Kahoot and Jackbox have emoji reactions and live chat during rounds. For this content (abuse, suicide, pregnancy), mid-round reactions would be disruptive and potentially harmful. | Post-round debrief discussion is the host's job. The game creates material for that discussion, not a channel for it. |
| "Correct answer" reveal | Kahoot reveals the right answer. This game has no right answers — and revealing which framework "wins" would undermine the entire pedagogy. | Private consequence per player shows what happened as a result of their choice. No "right" is ever declared. |
| Auto-advance (timer auto-closes round) | Auto-advance removes host control. In a live classroom, the presenter needs to be able to pause, ask questions, and decide when to move on. | Timer display with optional pause/extend. Host always manually closes the round. |
| Background music / sound effects | Kahoot uses music to signal energy. The tone of this game is contemplative, not competitive. Sound would undermine the emotional weight of the scenarios. | Silence or ambient sound (deferred). Visual design carries the tone. |
| Advertising / upgrade prompts | Any monetization-layer friction during a live presentation is catastrophic. | Self-hosted, no accounts, no plan gates. |

---

## Feature Dependencies

```
Room code join
  → Player roster live update (requires player INSERT subscription)
  → Lobby "start" button (requires player count > 1)

Host starts round
  → Session status → "active" (triggers scenario render on phones)
  → Choice lock UI (requires active status)
  → Live submission counter (requires choices INSERT subscription)

Host closes round (status → "round_complete")
  → Choice lock (closes choice window)
  → Private consequence reveal (keyed to player's choice_index)
  → Framework label reveal (keyed to player's choice_index)
  → World state update (applyChoicesToWorld runs)
  → VoteTally animation (aggregate shown on host screen)
  → Framework tally per round (shown on host screen)

World state update
  → Meter bars update on player phones
  → 3D city update on host screen (v2)
  → Threshold event check → threshold overlay if triggered (v1: CSS; v2: Three.js)

All rounds complete (host triggers end)
  → computeProfile() runs per player
  → findConflicts() runs per player
  → dominant_framework + conflicts written to Supabase
  → FrameworkProfile.jsx renders on player phones
  → Host end view: city final + framework breakdown + reflection feed

Free-text round (Round 6)
  → Text input instead of choice buttons (requires round type flag in scenario data)
  → Responses stored separately, not in choices table
  → Fed to host end view anonymous scroll
  → Does NOT trigger framework detection or world state update
```

---

## MVP Recommendation

Given the days-to-build timeline, prioritize features in this order:

**Must ship for the game to work (v1 blocking):**
1. Room code join + player roster (game cannot start without this)
2. Host round progression control (game cannot run without this)
3. Scenario render on phones with choice lock (the core input)
4. Submission counter — "X/Y submitted" on host and player (host needs this to know when to close)
5. Aggregate vote tally on host (host needs this for debrief)
6. Private consequence reveal (the key emotional differentiator from Kahoot)
7. Framework label reveal post-choice (the key pedagogical differentiator)
8. World state update + CSS meter bars (the shared environment mechanic)
9. computeProfile() + FrameworkProfile.jsx end screen (the culminating feature)

**Must ship for v1 but simpler implementation acceptable:**
- Content note + pass option (simple conditional render, important for safety)
- Anonymous group framework breakdown on host end screen (sum of counts, simple display)
- World state narrative on host end screen (pre-written templates, deterministic)
- Free-text reflection round (text input + anonymous feed on host)

**Defer to v2:**
- Animated SVG meter bars on phones (CSS placeholder acceptable for v1)
- 3D Three.js city (CSS placeholder acceptable for v1) — explicitly deferred in PROJECT.md
- Timer with pause/extend (display-only timer acceptable for v1)
- Threshold event animations (CSS overlay text acceptable for v1)
- QR code generator (typing the code is fine for v1)

**Park indefinitely:**
- Custom scenario authoring
- Session history / persistent accounts
- AI-generated debrief commentary

---

## Sources

**Confidence levels:**
- Kahoot feature set: MEDIUM (training knowledge, stable pre-cutoff; WebFetch unavailable to verify current state)
- Mentimeter feature set: MEDIUM (same)
- Jackbox UX patterns: MEDIUM (same)
- This project's specific features: HIGH (fully specified in CLAUDE.md and PROJECT.md, read directly)

Key genre knowledge sources consulted in training data:
- Kahoot: kahoot.com, education technology research literature
- Mentimeter: mentimeter.com feature pages, UX case studies
- Jackbox: jackboxgames.com, extensive community documentation of room code pattern
- Polleverywhere: classroom response system literature
- Academic literature on classroom response systems (CRS) and "clicker" research

**Anti-features rationale sources:**
- Pedagogical anti-gaming research: Deterding et al. on gamification in education
- Privacy concerns in classroom tech: FERPA guidance, education technology ethics literature
- Game design: Jesse Schell, "The Art of Game Design" — on score systems and player psychology
