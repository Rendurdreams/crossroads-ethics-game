# CLAUDE.md — The Crossroads: Multiplayer Ethics Game
## Version 3 — React + Supabase + Three.js + Framework Detection

---

## What This Is

A real-time multiplayer moral simulation game for a college critical thinking presentation.
The presenter (Jay) runs a host dashboard projected on screen. Classmates join on their
phones via a room code. Each round presents a moral dilemma with no clean answer.
Players make private choices. Results aggregate live. A 3D city on the host screen
shifts based on collective behavior. The end screen doesn't rate players — it reveals
which ethical frameworks drove their decisions and where their personal morals
created friction with those frameworks.

**The central lesson:** Ethics and morals are not the same thing. Your morals are
personal — shaped by your upbringing, culture, faith, relationships. Ethical frameworks
are reasoned systems societies use to evaluate behavior. Sometimes they align.
Sometimes they demand you violate what feels right. That tension is not a flaw.
It's where real thinking begins.

**Presentation context:** College critical thinking class, ~10–25 classmates, 15 min live.
**Designed for:** High school scenario content, college-maturity tone.
**Session length:** Modular — 3, 4, 5, or 6 rounds. Jay picks before starting.

---

## The Four Ethical Frameworks (Game's Pedagogical Core)

Every choice in every scenario is tagged with the framework it most represents.
The game detects patterns silently across rounds and surfaces them at the end.

### CONSEQUENTIALISM
> The right action is the one that produces the best outcome for the most people.
> Results justify means. Numbers matter.

Detectable pattern: Player consistently chooses whatever produces the best result
even when it violates a rule, a promise, or a relationship.
Conflict point: What counts as "best"? Who decides? What if you're wrong about outcomes?

### DEONTOLOGY
> Some duties and rules are absolute. You must follow them regardless of outcome.
> Keeping a promise is right even if breaking it would help more people.

Detectable pattern: Player holds the rule even when the outcome visibly suffers.
Conflict point: Rules made by whom? What if the rule is unjust?

### CARE ETHICS
> Relationships and context matter most. Abstract principles ignore the real human
> in front of you. Proximity creates obligation.

Detectable pattern: Player consistently protects the specific person they know
over the abstract principle or the distant many.
Conflict point: What about people you don't know? Does caring only for your circle scale?

### VIRTUE ETHICS
> Ask not what the rule says or what the outcome is — ask what a person of good
> character would do. Integrity, courage, honesty as ends in themselves.

Detectable pattern: Player chooses the hard right thing regardless of relationship
or outcome — speaks up, tells the truth, acts with courage even at personal cost.
Conflict point: Whose definition of virtue? Can good character cause harm?

---

## Framework Detection Logic

Each choice object carries a `frameworks` array — the 1–2 frameworks it represents.
After all rounds, the system counts framework frequency per player.

```javascript
// Example choice tagging
{
  choiceIndex: 0,
  text: "Tell the mom the truth",
  frameworks: ["deontology", "virtue"],  // this choice represents these frameworks
  worldImpact: { trust: +10, courage: +8, solidarity: -4, awareness: +6 }
}
```

### End Screen Computation

```javascript
function computeProfile(choiceHistory) {
  // 1. Count framework frequency
  const counts = { consequentialism: 0, deontology: 0, care: 0, virtue: 0 }
  choiceHistory.forEach(c => c.frameworks.forEach(f => counts[f]++))

  // 2. Find dominant framework
  const dominant = Object.entries(counts).sort((a,b) => b[1]-a[1])[0][0]

  // 3. Find conflict rounds — rounds where player's choice framework
  //    directly opposes another framework they used in a different round
  const conflicts = findConflicts(choiceHistory)

  // 4. Return profile — not a score, a lens
  return { dominant, counts, conflicts }
}
```

### Conflict Detection

A conflict exists when a player used Framework A in one round and Framework B
in another, AND those two frameworks give opposing answers to the same moral question.

Pre-defined conflict pairs:
- deontology vs consequentialism: rule vs. outcome
- care vs deontology: relationship vs. rule
- care vs consequentialism: one person vs. the many
- virtue vs care: personal integrity vs. protecting someone you love

When a conflict is found, the end screen names it explicitly:
> "In Round 1 you held the rule even when it cost your friend.
> In Round 3 you broke the rule to protect someone you cared about.
> That shift — from deontology to care ethics — isn't inconsistency.
> It's the oldest tension in moral philosophy. Context changed what mattered to you."

---

## Architecture

### Tech Stack
- **Frontend:** React (Vite, no TypeScript required) — component state + Supabase hooks
- **3D Engine:** Three.js (host screen only) — city skyline, meter-driven reactivity
- **Backend:** Supabase — Postgres + real-time subscriptions + RLS
- **Hosting:** Netlify or Vercel (drag and drop dist/ folder after vite build)
- **No login** — players join with name + room code, stored in localStorage

### Project Structure
```
/src
  /components
    CityScene.jsx         -- Three.js canvas, all city logic
    MeterBar.jsx          -- Animated themed meter (4 variants)
    ScenarioCard.jsx      -- Scenario text + 3 choice buttons
    ConsequenceReveal.jsx -- Private outcome after round closes
    FrameworkProfile.jsx  -- End screen — framework alignment + conflict map
    PlayerRoster.jsx      -- Host lobby: live player list
    VoteTally.jsx         -- Host round view: live % bars
    WorldStatePanel.jsx   -- Host: 4 meters + threshold event overlay
  /lib
    supabase.js           -- Supabase client + typed helpers
    scenarios.js          -- Full scenario library with framework tags
    frameworks.js         -- Framework definitions + conflict pairs
    detection.js          -- computeProfile(), findConflicts()
    worldState.js         -- applyChoicesToWorld(), thresholdCheck()
  /pages
    Landing.jsx           -- Create session / join with code
    Host.jsx              -- Full host dashboard
    Play.jsx              -- Player phone view
  App.jsx
  main.jsx
```

### Supabase Schema

```sql
-- sessions
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text UNIQUE NOT NULL,
  status text DEFAULT 'lobby',       -- lobby | active | round_complete | finished
  current_round int DEFAULT 0,
  total_rounds int DEFAULT 4,
  world_state jsonb DEFAULT '{"trust":50,"courage":50,"solidarity":50,"awareness":50}',
  created_at timestamptz DEFAULT now()
);

-- players
CREATE TABLE players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  name text NOT NULL,
  avatar text,                        -- emoji assigned on join
  framework_counts jsonb DEFAULT '{"consequentialism":0,"deontology":0,"care":0,"virtue":0}',
  choice_history jsonb DEFAULT '[]',  -- array of {round, scenarioId, choiceIndex, frameworks}
  dominant_framework text,            -- computed at end
  conflicts jsonb DEFAULT '[]',       -- computed at end
  joined_at timestamptz DEFAULT now()
);

-- choices
CREATE TABLE choices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  round_number int NOT NULL,
  scenario_id text NOT NULL,
  choice_index int NOT NULL,           -- 0, 1, or 2
  frameworks text[] NOT NULL,          -- framework tags from chosen option
  submitted_at timestamptz DEFAULT now()
);

-- RLS: players can insert their own choices, read session state
-- Host has full access via service role key (stored in env, never in client)
```

### React + Supabase Real-Time Pattern

```javascript
// In Play.jsx — subscribe to session state changes
useEffect(() => {
  const channel = supabase
    .channel(`session:${sessionId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'sessions',
      filter: `id=eq.${sessionId}`
    }, (payload) => {
      setSessionState(payload.new)  // React re-renders automatically
    })
    .subscribe()
  return () => supabase.removeChannel(channel)
}, [sessionId])

// In Host.jsx — subscribe to incoming choices for live tally
useEffect(() => {
  const channel = supabase
    .channel(`choices:${sessionId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'choices',
      filter: `session_id=eq.${sessionId}`
    }, (payload) => {
      setChoices(prev => [...prev, payload.new])  // tally updates live
    })
    .subscribe()
  return () => supabase.removeChannel(channel)
}, [sessionId])
```

---

## World State

Four meters, 0–100, starting at 50. Updated after each round based on
aggregate player choices. Visible on host screen as animated 3D city features
and on player phones as themed animated components.

```
TRUST       — The suspension bridge connecting the two halves of the city
COURAGE     — The lighthouse at the harbor edge
SOLIDARITY  — The power grid: lit windows across the skyline
AWARENESS   — Ground-level fog rolling in from the water
```

### World State Update Logic

```javascript
// worldState.js
function applyChoicesToWorld(choices, scenarios, roundIndex, currentState) {
  const scenario = scenarios[roundIndex]
  const tallies = [0, 0, 0]  // count per choice option

  choices.forEach(c => tallies[c.choice_index]++)

  const total = choices.length
  const newState = { ...currentState }

  // Weighted aggregate: each choice's world impact applied proportionally
  scenario.choices.forEach((choice, i) => {
    const weight = tallies[i] / total
    Object.entries(choice.worldImpact).forEach(([meter, delta]) => {
      newState[meter] = Math.max(0, Math.min(100,
        newState[meter] + (delta * weight)
      ))
    })
  })

  return newState
}
```

---

## 3D City — Host Screen (Three.js via CityScene.jsx)

### Scene
Nighttime city skyline. Fixed camera, slight elevation angle.
Full skyline visible: buildings, bridge, harbor, lighthouse.
Slow ambient camera drift. Particle effects always running.
City initializes at neutral state (all meters 50).

### Meter Visualizations

**TRUST — Suspension Bridge**
Driven by: `worldState.trust`
- 100: Fully lit, cables taut, headlight particles crossing
- 50: Some lights flickering, cables slightly slack
- 20: Most lights out, cables visually fraying
- Threshold < 20: Bridge splits — gap opens in center, crack animation,
  traffic particles stop, silence

**COURAGE — Lighthouse**
Driven by: `worldState.courage`
- 100: Full rotation speed, long beam sweep, ships visible in harbor
- 50: Slower rotation, shorter beam reach
- 20: Near-stopped, beam barely visible
- Threshold < 20: Light extinguishes, storm clouds roll in, rain particles

**SOLIDARITY — Power Grid (building windows)**
Driven by: `worldState.solidarity`
- 100: Every building window emissive, warm yellow/white
- 50: ~Half the windows lit, scattered dark patches
- 20: Most buildings dark, a few stubborn lights
- Threshold < 20: Rolling blackout — buildings go dark in a wave, left to right

**AWARENESS — Fog**
Driven by: `worldState.awareness`
- 100: No fog, crisp city, street detail visible
- 50: Light fog at water level
- 20: Heavy fog, lower third of city obscured
- Threshold > 85: Fog clears completely, sunrise begins behind skyline

### Interesting Combinations (worth narrating during debrief)
- High courage + low solidarity = lighthouse blazing over a blackout skyline
- High trust + low awareness = bridge lit, too foggy to see where it leads
- High solidarity + low courage = every window warm, lighthouse dark

### Three.js Implementation Notes
```javascript
// CityScene.jsx
// Load from CDN — r128 only, no CapsuleGeometry
// <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js">

// Key objects
const scene = new THREE.Scene()
const buildings = []         // instanced BoxGeometry, emissive windows
const bridge = buildBridge() // custom CatmullRomCurve3 cables
const lighthouse = buildLighthouse()  // cylinder + SpotLight
const fog = new THREE.FogExp2(0x0a0a14, 0.008)

// React prop drives city updates
useEffect(() => {
  updateCity(worldState)  // called whenever worldState changes via Supabase
}, [worldState])

function updateCity(state) {
  updateBridge(state.trust)
  updateLighthouse(state.courage)
  updateWindows(state.solidarity)
  updateFog(state.awareness)
  checkThresholds(state)
}
```

---

## Animated Meter Bars — Player Phone (MeterBar.jsx)

Lightweight SVG + CSS animation. No Three.js on phones.
Each meter is a React component driven by worldState prop.

**TRUST — Mini suspension bridge SVG**
Cables slacken as value drops. Bridge sways (CSS keyframe) at low values.

**COURAGE — Lighthouse beam sweep**
Rotating beam behind bar fill. Speed and length driven by value.
`animation-duration: ${2 + (100 - value) * 0.03}s`

**SOLIDARITY — Train on a track**
SVG train on a track the length of the meter.
Position: `left: ${value}%` with CSS transition: 0.8s ease.
At low values: train far from station. Track shows gap ahead.

**AWARENESS — Fog over skyline silhouette**
SVG skyline silhouette. Fog layer opacity: `${1 - value/100}`.
High value = clear. Low value = obscured.

```jsx
// MeterBar.jsx
function MeterBar({ type, value }) {
  const variants = { trust: BridgeMeter, courage: LighthouseMeter,
                     solidarity: TrainMeter, awareness: FogMeter }
  const Component = variants[type]
  return <Component value={value} />
}
```

---

## Scenario Library

### Design Rules
1. Player is always the friend/bystander — never the person in crisis
2. No obvious right answer — every choice costs something
3. Soft landing arc — Round 1 manageable, escalates each round
4. 30–45 second read time maximum
5. Exactly 3 choices per round
6. Each choice tagged with 1–2 ethical frameworks it represents
7. Consequences are honest — good choices can go wrong, bad ones sometimes work
8. Heavy rounds get a one-line content note, dismissible

---

### ROUND 1 — "The Story"
**Moral tension:** Loyalty to a friend vs. honesty to someone who needs to know
**Weight:** Low — establishes the trust/loyalty dynamic
**Teaches:** Care ethics vs. deontology introduced gently

> Your friend Alex has been skipping school for two weeks.
> You've been covering — telling teachers Alex is sick,
> deflecting questions, signing their name on group work.
> Today Alex's mom calls YOUR phone. She's scared.
> She asks if you've seen them. You have. Alex is fine —
> just going through something they won't talk about.
> Alex made you promise not to say anything.

**Choice A — Lie to the mom. Keep the promise.**
Frameworks: [care]
Private: She thanks you and hangs up. Three days later Alex comes back.
They're grateful. You wonder what would have happened if something had been wrong.
World: { trust: -8, solidarity: +6, courage: -4 }

**Choice B — Tell the mom the truth.**
Frameworks: [deontology, virtue]
Private: Alex finds out within hours. They're furious.
Two weeks of silence. Later, when they do come back, they tell you they were
actually relieved someone knew. Your friendship survives. Barely.
World: { trust: +10, solidarity: -4, courage: +8, awareness: +6 }

**Choice C — Deflect without lying.**
Frameworks: [consequentialism]
Private: Not a lie, not the truth. The mom stays worried.
Alex stays gone another week. The middle ground protected you more than anyone else.
World: { trust: -2, solidarity: +2, courage: -6 }

**Debrief hook:** Choice A = care ethics (loyalty to the person you know).
Choice B = deontology (truth as a duty) + virtue (courage to act rightly).
Choice C = consequentialism (minimize disruption). All three are defensible.
Why did YOU choose what you chose?

---

### ROUND 2 — "The Bruise"
**Moral tension:** Protecting someone from harm vs. respecting their autonomy
**Weight:** Medium
**Teaches:** Care ethics vs. deontology — when does duty to report override relationship?

> Your close friend Destiny shows up with a bruise on her arm.
> When you ask, she says she fell. You've heard that before.
> Her home life has always been tense.
> She's never said anything directly. She seems scared.
> If you report it and you're wrong — you destroy her family and lose her trust.
> If you don't report it and you're right — you stayed silent.

**Choice A — Report it to a counselor without telling Destiny first.**
Frameworks: [deontology, virtue]
Private: An inquiry opens. Her stepdad denies everything. Nothing is proven immediately.
Destiny doesn't speak to you for months. Two years later she texts:
"I'm out. Thank you."
World: { courage: +12, trust: -6, solidarity: -4, awareness: +10 }

**Choice B — Tell Destiny you're scared for her and ask what she needs.**
Frameworks: [care]
Private: She cries. Admits things have been bad. She's not ready to report.
You sit with that. You check in every day.
Six months later, she reports it herself.
World: { solidarity: +14, courage: +6, trust: +8, awareness: +8 }

**Choice C — Say nothing. It's not your place.**
Frameworks: [consequentialism]
Private: The bruises keep appearing. You stop asking.
You don't know if she'd tell you if she wanted help.
You stop looking closely enough to find out.
World: { courage: -12, awareness: -10, solidarity: -8 }

**Debrief hook:** B feels like the caring choice — but did respecting her autonomy
protect her or just delay the help she needed? A violated her trust and possibly
saved her life. That's the deontological argument for duties that override preference.
Which mattered more?

---

### ROUND 3 — "The Note"
**Moral tension:** Respecting someone's privacy vs. acting on what you know
**Weight:** Heavy

> [Content note: This scenario involves a friend who may be considering suicide.
> You can pass this round — submit without choosing and your data won't count.]

> You're at your friend Marcus's place and find a folded note
> somewhere you weren't expecting to look.
> You read the first line before you realize what it is.
> It reads like a goodbye.
> Marcus seems fine. Has been fine. He's not home right now.
> You are alone in his space with this note.

**Choice A — Call Marcus right now. Tell him what you found.**
Frameworks: [virtue, care]
Private: He's angry. Says it's old, it's nothing, you invaded his space.
You don't fully believe him. You stay on the phone for an hour anyway.
He doesn't thank you. But he's still here.
World: { courage: +14, trust: -4, solidarity: +10, awareness: +12 }

**Choice B — Call a crisis line first to ask how to handle it.**
Frameworks: [consequentialism, virtue]
Private: The counselor walks you through it — how to approach without cornering him.
You go to him that night. It's the hardest conversation of your life.
It goes better than you expected.
World: { courage: +10, awareness: +14, solidarity: +8, trust: +6 }

**Choice C — Put the note back. It's not yours. He'll talk when he's ready.**
Frameworks: [deontology]
Private: He seems fine for two more weeks.
Then he stops answering texts. You find out from someone else he's in the hospital.
He made it. You visit him. He doesn't know you found the note. You never tell him.
World: { courage: -14, awareness: -8, solidarity: -10, trust: -6 }

**Debrief hook:** C is the deontological choice — privacy as an absolute right.
But does that duty hold when someone's life is at stake? A and B break the rule
and justify it by outcome (consequentialism) or character (virtue).
This is where ethics gets hard: the framework you believe in leads somewhere
you might not be willing to go.

---

### ROUND 4 — "The Secret"
**Moral tension:** Respecting autonomy vs. the weight of being the only one who knows
**Weight:** Heavy

> [Content note: This scenario involves an unplanned pregnancy.
> This round is about your role as the person being asked for help —
> not about the decision itself. You can pass if you need to.]

> Your best friend Camille tells you she's pregnant. She's 17.
> She's already decided what she wants to do — she has a plan, an appointment.
> She is calm and certain. She's telling you because she needs someone to drive her.
> She has not told her parents. She does not want them involved.
> She's asking you to keep her secret.
> You have your license. You have your own feelings that she didn't ask for.

**Choice A — Drive her. Keep her secret. Honor what she's chosen.**
Frameworks: [care, virtue]
Private: You drive her. Quiet on the way home. You get food after.
She says: "I don't know what I'd have done without you."
You sit with your own feelings privately. That belongs to you.
World: { solidarity: +14, trust: +10, courage: +8 }

**Choice B — Tell her you can't keep this from her parents — and why.**
Frameworks: [deontology]
Private: She's devastated. She finds another way without you.
Later her relationship with her parents is okay — they could help in ways you couldn't.
You still don't know if you did the right thing.
World: { trust: +4, courage: +6, solidarity: -10 }

**Choice C — Ask her once if she's absolutely sure, then do whatever she says.**
Frameworks: [care, consequentialism]
Private: She says yes. You drive her.
She appreciated that you asked — and that you dropped it when she answered.
World: { trust: +12, solidarity: +12, courage: +8, awareness: +6 }

**Debrief hook:** B invokes a duty to family and protection.
A and C invoke autonomy — her right to decide, and your role as support not judge.
Care ethics asks: what does THIS person, in THIS moment, actually need from you?
Deontology asks: is there a duty here that exists regardless of what she wants?
Both are real arguments.

---

### ROUND 5 — "The Walkout"
**Moral tension:** Individual risk vs. collective action
**Weight:** Medium
**Replaces drinking scenario — same bystander moral territory, no inappropriate content**

> A student at your school was suspended for something that the evidence
> suggests they didn't do. It's pretty clear the administration got it wrong
> and won't revisit it. A group of students is organizing a walkout —
> leave class at 10am, gather outside, demand a review.
> If enough people walk, it might actually work.
> If not enough walk, the organizers face serious consequences alone.
> You believe the suspension was unjust. Walking out risks your own record.

**Choice A — Walk out. Be counted.**
Frameworks: [virtue, deontology]
Private: 34 students walk. Local news covers it.
The administration reopens the case. The suspension is overturned.
You have a note in your file. You'd do it again.
World: { courage: +16, solidarity: +14, trust: +8 }

**Choice B — Don't walk out, but sign the petition and tell others to go.**
Frameworks: [consequentialism]
Private: The petition gets 80 signatures. The walkout gets 22 students —
just under the visible threshold. The administration doesn't budge.
Your name is on the petition. You're safe. The organizers are not.
World: { courage: -8, solidarity: -6, awareness: +6 }

**Choice C — Stay in class. You can't risk your record right now.**
Frameworks: [care]
Private: You stay. You have real reasons — scholarship, family pressure, a job.
The walkout fails. You think about the suspended student sometimes.
You also think about the thing you're protecting and whether it was worth it.
World: { courage: -10, solidarity: -12, awareness: +4 }

**Debrief hook:** C isn't cowardice — it's care ethics applied to yourself and
the people depending on you. B is consequentialism trying to have it both ways.
A is virtue/deontology: some things are worth the cost.
This round asks: when is self-protection ethical and when is it a rationalization?

---

### ROUND 6 — "The Reckoning"
**Weight:** Reflective — final round, no choice buttons

> The 3D city is shown in its final state on the host screen.
> Player phones show their framework profile and conflict map.
> One question, answered in free text and displayed anonymously:

> "Was there a round where your gut said one thing
> and your reasoning said another?
> Which one did you follow — and do you think that was right?"

No world state impact. Responses feed into Jay's debrief.

---

## End Screen — Framework Profile (FrameworkProfile.jsx)

**Not a score. Not a rating. A lens.**

### What players see on their phone:

**Section 1 — Your Dominant Framework**
> "Across your choices, your reasoning most often aligned with **Care Ethics.**
> You consistently prioritized the person in front of you over abstract rules
> or distant outcomes. You asked: what does this specific person need from me right now?"

Short paragraph explaining the framework. Neutral, not celebratory.

**Section 2 — Where the Conflict Lived**
Only shown if conflicts detected. Named explicitly.

> "In Round 1, you held the promise (Care Ethics — loyalty matters).
> In Round 3, you broke a boundary to intervene (Virtue Ethics — courage matters more).
> That shift isn't inconsistency. It means context changed what principle felt most urgent.
> Philosophers call this **moral particularism** — the idea that the right action
> depends on the specifics of the situation, not just the rule."

**Section 3 — The Framework You Used Least**
> "You rarely reasoned from **Deontology** — the idea that some duties are absolute
> regardless of outcome. That doesn't make you wrong. But it's worth asking:
> are there rules you'd hold even if breaking them produced a better result?"

**Section 4 — Your Choice Log**
Each round listed: scenario name, choice made, framework it represented.
No judgment. Just the record.

---

## Host Dashboard — Feature Spec (Host.jsx)

**Lobby view**
- Three.js city renders at neutral state in background
- Large room code overlay (e.g. "7423") — readable from back of room
- Live roster: name + emoji as players join (PlayerRoster.jsx)
- Round count selector: 3 / 4 / 5 / 6
- Start button when 2+ players joined

**Round view**
- 3D city: 65% of screen, left/center
- Right panel (WorldStatePanel.jsx):
  - Current scenario title + weight tag
  - Live vote tally — animated % bars, no names (VoteTally.jsx)
  - 4 world state meters
  - Timer display — host sets 30–90 sec, can pause/extend
  - "X players still deciding" counter
- Close Round button — locks choices, triggers world state update + consequence delivery
- Threshold event: full-screen city interstitial — host dismisses manually
- Framework tally (after round closes): shows which frameworks the group used
- Next Round button

**End view**
- City final state full screen
- Overlay: world state narrative ("Your group built a city where trust collapsed
  but solidarity held. Here's what that means...")
- Anonymous reflection responses scrolling
- Framework breakdown: what % of the group leaned toward each framework overall
- End Session — triggers profile reveal on all phones

---

## Player View — Feature Spec (Play.jsx)

**Lobby:** Name input, emoji assigned, waiting screen with live player count

**Round:**
- Content note (heavy rounds) — dismissible, pass option visible
- Scenario text — large serif, full screen, phone-optimized padding
- 3 choice buttons — lock on tap, show framework hint after locked
  (e.g. small label: "Care Ethics" appears after you choose — not before)
- Submitted state — clean waiting screen, can see live "X/Y submitted"
- Private consequence after host closes round
- Framework label for the choice just made — with 1-sentence explanation
- 4 animated meter bars update after world state changes

**End screen (FrameworkProfile.jsx):**
- Dominant framework with full explanation
- Conflict map if applicable
- Least-used framework prompt
- Full choice log
- Reflection text input (Round 6)

---

## Build Order

### Phase 1 — Supabase
- Create project, run schema SQL
- Enable real-time on all three tables
- Configure RLS: players read session state, insert own choices only
- Test subscriptions via Supabase dashboard before touching frontend

### Phase 2 — Core Data Layer (/lib)
- supabase.js: client init + typed query helpers
- scenarios.js: full scenario library with framework tags and world impacts
- frameworks.js: definitions, conflict pairs, detection logic
- detection.js: computeProfile(), findConflicts()
- worldState.js: applyChoicesToWorld(), thresholdCheck()

Build and unit test detection.js and worldState.js in isolation before
connecting to UI. These are the brain of the game.

### Phase 3 — Landing Page
- Create session flow: generate room code, insert session row, redirect to /host
- Join session flow: enter code + name, insert player row, redirect to /play
- Store player_id and session_id in localStorage

### Phase 4 — Host Dashboard (no Three.js yet)
- Roster live update via Supabase subscription
- Round control: status transitions (lobby → active → round_complete → active...)
- Vote tally live update
- World state panel with plain CSS bars (Three.js added in Phase 6)
- Threshold event overlay (CSS only first)

### Phase 5 — Player View
- Session subscription: react to status changes
- Scenario render from scenarios.js by current_round
- Choice submission + optimistic UI lock
- Consequence reveal on round_complete
- Framework label reveal post-choice
- Animated meter bars (MeterBar.jsx — all 4 variants)

### Phase 6 — Three.js City (CityScene.jsx)
- Static scene first: skyline, bridge, lighthouse, fog, water
- Wire updateCity(worldState) to Supabase subscription
- Each meter visualization: bridge, lighthouse, windows, fog
- Threshold event animations
- Camera ambient drift
- Performance check: smooth at 60fps on a standard laptop

### Phase 7 — End State
- FrameworkProfile.jsx: dominant framework, conflict map, least-used prompt, log
- Host end view: city final + world narrative + framework breakdown + reflection feed
- Compute and store player archetype/conflicts in Supabase on session end

### Phase 8 — Polish
- Mobile layout audit (play.html is 100% phone)
- Timer pressure animation (bar shrinks, color shifts near 0)
- Transition animations between rounds
- Load test: simulate 20+ concurrent Supabase subscriptions
- QR code generator for room code (players scan from projected screen)

---

## Presentation Flow (15 Minutes)

| Time | What happens |
|---|---|
| 0:00–0:45 | Jay: "Before I explain this, I need you to play it." City glowing behind. |
| 0:45–2:00 | Everyone joins. Roster fills live. Jay: "Watch the city." |
| 2:00–5:00 | Rounds 1–2. Fast pace. Minimal gap. Let tension build silently. |
| 5:00–8:30 | Round 3 — content note shown. 60 sec. Results live. City reacts. Brief discussion. |
| 8:30–11:30 | Round 4. Results. World state narrated. Jay points at city: "Look what happened." |
| 11:30–13:00 | Framework profiles appear on phones. Jay reads a few conflicts aloud anonymously. |
| 13:00–15:00 | Debrief: "Your morals told you one thing. The framework said another. Which won?" |

---

## Key Design Decisions

**Why React instead of vanilla HTML:**
Dynamic session state — scenarios loading, choices locking, consequences revealing,
meters animating, world state updating — is component state. React handles this
cleanly. Vanilla HTML becomes spaghetti the moment Supabase fires three events
simultaneously. Use the right tool.

**Why Three.js only on host screen:**
Phones rendering 3D = lag, crashes, dead presentation.
The city is shared — it belongs to everyone, lives on the projected screen.
Phones are input. The city is output. That separation is intentional.

**Why we don't reveal the framework label before the choice:**
Telling players "this is the consequentialist option" before they choose
turns the game into a philosophy quiz. They pick what sounds right to them —
then they learn what it means. The surprise is the lesson.

**Why the end screen names the conflict explicitly:**
"You did X in Round 1 and Y in Round 3 — that's not inconsistency,
that's moral particularism." Giving the intellectual concept to what they
actually experienced is the most powerful pedagogical move in the game.
They didn't just learn about ethics. They lived an example of it.

**Why the game doesn't rate or judge:**
The point is not to identify good and bad reasoners.
The point is to make visible the frameworks everyone already uses unconsciously —
and to show that reasonable people using different frameworks reach different answers.
That's the beginning of real ethical thinking, not the end of it.

<!-- GSD:project-start source:PROJECT.md -->
## Project

**The Crossroads**

A real-time multiplayer ethics game for a college critical thinking presentation. The presenter runs a host dashboard on a projected screen while classmates join on their phones via room code. Each round presents a moral dilemma with no clean answer — players choose privately, results aggregate live, and the end screen reveals which ethical frameworks drove each player's decisions and where friction existed between frameworks.

**Presentation context:** College critical thinking class, ~10–25 classmates, 15 min live.
**Session length:** Modular — 3, 4, 5, or 6 rounds selected before starting.

**Core Value:** Players finish the game understanding that ethics and morals are not the same thing — and that their own reasoning, now visible to them, belongs to a named philosophical tradition.

### Constraints

- **Timeline**: Days — scope to functional v1; polish is v2
- **Tech stack**: React + Vite + Supabase — decided, not up for debate
- **No TypeScript**: Plain JavaScript only
- **Phone rendering**: No Three.js on player phones — too slow/crash-prone
- **Session**: No auth — localStorage only; sessions are ephemeral
- **Presentation**: Must work reliably with 10–25 simultaneous Supabase subscriptions
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React | 18.x | UI component tree, state, hooks | Decided. Concurrent features (useTransition, Suspense) unnecessary for this scope — but hooks model is exactly right for Supabase subscription lifecycle management |
| Vite | 5.x | Dev server, bundler, build | Decided. Sub-second HMR, no config overhead, `vite build` produces deploy-ready dist/ |
### Routing
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React Router | 6.x (v6.28+) | Client-side routing for Landing / Host / Play | Three routes only. RR v6 with `createBrowserRouter` is the right fit — v7 added framework-mode complexity this project doesn't need. Avoid upgrading to v7 unless you want to adopt the full framework model. TanStack Router is type-first and requires TypeScript to deliver its value; skip it. |
### State Management
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React `useState` + `useReducer` + Context | Built-in | Session state, player state, round state | This app has three distinct state domains (session, player, world state) — none of them globally shared across unrelated components. Local component state + Context passed down is sufficient. Adding Zustand or Jotai introduces a dependency for a problem that doesn't exist here. |
- `useState`: Choice lock state, timer, local UI
- `useReducer`: Session status machine (lobby → active → round_complete → finished)
- Context: `SessionContext` shared across Host; `PlayerContext` for Play page tree
- Zustand — fine library, unnecessary abstraction for 3 pages
- Redux / RTK — absolute overkill for this scope
- Jotai / Recoil — atomic state adds complexity with no gain here
### Supabase
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @supabase/supabase-js | 2.x (2.45+) | Database queries, real-time channels, RLS | The v2 client is a complete rewrite from v1. All real-time is channel-based. Do not use v1 patterns. |
### Animation
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| CSS Transitions + Keyframes | Native | Meter bars, choice lock feedback, consequence reveal | No library needed for the v1 scope. CSS handles the animated percentage bars (width transition), choice button lock states, and fade-in/out between rounds. Framer Motion adds 40KB+ for what `transition: width 0.8s ease` handles natively. |
| Framer Motion | 11.x | OPTIONAL: Phase transitions, end screen entrance animations | Only add if the round-to-round transitions feel abrupt during testing. If you add it, use `AnimatePresence` for page transitions only — not for meter bars. |
### UI Components
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| No component library | — | All UI hand-built | The design spec is specific enough ("stark editorial, dark backgrounds, warm amber/gold, serif scenario text, sans-serif UI") that a component library (shadcn, MUI, Chakra) will fight you constantly. Write the 8-10 components you need. Total HTML/CSS for this project is small. |
- Scenario text: `Georgia, serif` (system font, no external load needed) or `'Playfair Display'` from Google Fonts (one import, significant upgrade)
- UI chrome: `'Inter'` from Google Fonts or `system-ui` (fast, clean, reliable)
### QR Code (Phase 8)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| qrcode.react | 3.x | Generate QR code from room code | Zero-dependency React component that renders an SVG QR code. One line of JSX. No server needed. |
### Three.js (Phase 6)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Three.js | r128 (CDN) | 3D city scene on host screen | Per CLAUDE.md spec: r128 via CDN. Do NOT use the npm package in this case — CDN keeps Three.js out of the React bundle, which matters because the city only renders on one screen. Load conditionally in CityScene.jsx via a script tag or dynamic import. |
### Hosting
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Netlify | — | Static hosting | `vite build` → drag dist/ to Netlify dashboard. Add `_redirects` file for SPA routing. Free tier handles 10–25 concurrent users trivially. Vercel works identically — pick one and stay with it. |
## Supabase Real-Time Patterns
### Client Initialization
### Channel Subscription Pattern
### Multiple Subscriptions (Host.jsx)
### Filter Syntax
### Optimistic UI for Choice Submission
### Querying Initial State
## Vite Configuration
## Alternatives Considered
| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Routing | React Router v6 | TanStack Router | Requires TypeScript for its type-safety value; overkill for 3 routes |
| Routing | React Router v6 | React Router v7 | v7 merges with Remix framework model — adds SSR concepts to a static SPA |
| State | useState + Context | Zustand | No meaningful benefit at this scale; adds a dependency |
| State | useState + Context | Redux Toolkit | Severe overkill; 3-page app doesn't need a store |
| Animation | CSS native | Framer Motion | 40KB+ library for effects CSS handles; add only if CSS proves insufficient |
| UI | Hand-rolled CSS | shadcn/ui | shadcn/ui requires Tailwind; both would fight the bespoke editorial design |
| UI | Hand-rolled CSS | MUI / Chakra | Opinionated design system that requires heavy overriding for dark editorial aesthetic |
| CSS | CSS Modules | Tailwind CSS | Tailwind's utility model clutters JSX and hurts readability for bespoke visual work |
| CSS | CSS Modules | styled-components | CSS-in-JS runtime adds unnecessary complexity for a static-style app |
| Three.js | CDN r128 OR npm r160+ | react-three-fiber (R3F) | R3F is React-idiomatic but abstracts Three.js significantly; per spec, direct Three.js is specified and appropriate since city scene is isolated to one component |
## Installation
# Bootstrap
# Routing
# Supabase
# QR code (Phase 8 only — defer until then)
# Three.js (Phase 6 — consider npm over CDN for tree-shaking)
- `@vitejs/plugin-react` — Fast Refresh
- `vite` — dev server and build
## Environment Setup
# .env.local (gitignored — never commit this)
## Sources
- Training data through August 2025 (MEDIUM confidence)
- CLAUDE.md project spec — stack decisions pre-validated by project author (HIGH confidence for stack constraints)
- Supabase v2 channel API: well-established since 2022, stable through 2025 (HIGH confidence on patterns)
- React Router v6/v7 split: v7 released late 2024 with Remix merger; v6 remains valid for SPAs (HIGH confidence)
- Three.js r128 CDN note: current stable as of 2025 is r167+; r128 specified in CLAUDE.md likely for API stability (MEDIUM confidence — verify CatmullRomCurve3 API hasn't changed before Phase 6)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
