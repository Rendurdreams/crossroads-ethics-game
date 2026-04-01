# Phase 20: Signal Lost UI Overhaul — Terminal Command Interface

## Vision

Every screen feels like a classified briefing terminal from 2047. The player's phone is a senator's command device. The host screen is a war room. No fantasy kingdom aesthetic — pure sci-fi political thriller.

**Core aesthetic:** Dark void + glass panels + scan lines + red/blue accent system + monospace data readouts + modular no-scroll phone layout

---

## Design System — New Tokens

### Color Palette

```
--bg:              #060610          // deeper void
--bg-surface:      #0c0c1a          // panel base
--bg-panel:        rgba(12, 16, 32, 0.75)  // glass panels

// Accent system — mood-driven
--accent-blue:     #3b82f6          // information, neutral, data
--accent-blue-dim: rgba(59, 130, 246, 0.15)
--accent-blue-glow: rgba(59, 130, 246, 0.35)
--accent-red:      #ef4444          // warning, consequence, danger, break flags
--accent-red-dim:  rgba(239, 68, 68, 0.12)
--accent-red-glow: rgba(239, 68, 68, 0.3)
--accent-amber:    #f59e0b          // legacy/highlight (used sparingly)
--accent-cyan:     #06b6d4          // active states, selections
--accent-cyan-glow: rgba(6, 182, 212, 0.3)

// Text
--text:            #c8ccd4          // body
--text-h:          #e8ecf4          // headings
--text-muted:      #4a5568          // labels, secondary
--text-data:       #8b9dc3          // data readouts

// Glass
--glass-bg:        rgba(8, 12, 24, 0.65)
--glass-border:    rgba(59, 130, 246, 0.2)
--glass-border-red: rgba(239, 68, 68, 0.2)
--blur-glass:      16px
```

### Typography

```
--mono:  'JetBrains Mono', 'SF Mono', ui-monospace, monospace   // PRIMARY — terminal feel
--sans:  'Inter', system-ui, sans-serif                          // UI labels
--serif: 'Playfair Display', Georgia, serif                      // scenario text only
```

### Effects

```
// Scan line overlay (CSS pseudo-element on body)
background: repeating-linear-gradient(
  0deg,
  transparent,
  transparent 2px,
  rgba(59, 130, 246, 0.03) 2px,
  rgba(59, 130, 246, 0.03) 4px
);

// Panel glow (blue default, red for warnings)
box-shadow: 0 0 1px var(--accent-blue),
            0 0 20px var(--accent-blue-dim),
            inset 0 1px 0 rgba(59, 130, 246, 0.08);

// Text glow for data
text-shadow: 0 0 8px var(--accent-blue-glow);
```

---

## Screen Plans

### 1. LANDING (Landing.jsx + Landing.module.css)

**Current:** Fantasy kingdom vibe, Homescreen.png background, amber glow
**New:** Terminal boot sequence. No background image.

```
┌─────────────────────────┐
│                         │
│    SIGNAL LOST          │  ← monospace, blue glow, large
│    ──────────           │
│    SYSTEM STATUS: READY │  ← small mono, muted
│                         │
│  ┌─────────────────┐    │
│  │ ACCESS CODE      │    │  ← blue-bordered glass input
│  │ [____]           │    │
│  ├─────────────────┤    │
│  │ IDENTIFICATION   │    │  ← blue-bordered glass input
│  │ [____________]   │    │
│  └─────────────────┘    │
│                         │
│  [ AUTHENTICATE ]       │  ← glass button, blue outline, glow on hover
│                         │
│  ─── OR ───             │
│                         │
│  [ CREATE SESSION ]     │  ← secondary, dimmer
│                         │
└─────────────────────────┘
```

- Remove background image entirely
- Subtle scan line overlay on the void
- Title: "SIGNAL LOST" in monospace with blue text-shadow
- Subtitle: "SYSTEM STATUS: READY" or "NETWORK CAPACITY: 9%"
- Inputs: glass panels with blue borders, monospace placeholder text
- Button: glass with blue border, glows cyan on hover
- Error messages: red accent

---

### 2. BASELINE SURVEY (Baseline.jsx + Baseline.module.css)

**Current:** Glass cards, amber buttons, kingdom framing
**New:** Classified briefing dossier

```
┌─────────────────────────┐
│ CLASSIFIED BRIEFING     │  ← mono, blue, top-left
│ MORAL BASELINE SCAN     │
│ ─────────────────       │
│                         │
│ Your values define your │  ← serif, warm text
│ vulnerability.          │
│                         │
│ ┌─ SELECT YOUR VALUES ─┐│
│ │ □ Loyalty    □ Honor  ││  ← glass chips, blue border
│ │ □ Fairness   □ Truth  ││     selected = cyan fill
│ │ □ Compassion          ││
│ └───────────────────────┘│
│                         │
│ STANCE ASSESSMENT       │  ← section label, mono
│ ┌───────────────────────┐│
│ │ "Is it ever right to  ││  ← serif italic
│ │  lie to protect       ││
│ │  someone you love?"   ││
│ │                       ││
│ │ [YES] [NO] [DEPENDS]  ││  ← glass buttons, row
│ └───────────────────────┘│
│                         │
│ [2/5] ──────── NEXT →   │  ← progress bar + button
└─────────────────────────┘
```

- Section headers: monospace, uppercase, blue
- Values: glass chip buttons with blue border, cyan when selected
- Stance questions: serif italic in a glass panel
- Progress: mono fraction + thin blue progress bar
- "NEXT" button: glass, blue outline

---

### 3. HOST SETUP (HostSetup.jsx + HostSetup.module.css)

**Current:** Background image, huge amber room code, QR
**New:** War room initialization terminal

```
┌────────────────────────────────────────┐
│                                        │
│  SIGNAL LOST · COMMAND CENTER          │  ← mono, blue
│  ═══════════════════════               │
│                                        │
│  ACCESS CODE                           │
│  ┌──────────────┐                      │
│  │   7  4  2  3  │                     │  ← HUGE mono, blue glow
│  └──────────────┘                      │
│                                        │
│  ┌──────┐  Scan to connect             │
│  │ QR   │  ─────────────               │
│  │ CODE │                              │
│  └──────┘                              │
│                                        │
│  SESSION MODE                          │
│  [▣ DISCUSSION] [□ STANDARD]           │  ← toggle, blue/muted
│                                        │
│  [ INITIALIZE SESSION ]                │  ← glass, blue, large
│                                        │
└────────────────────────────────────────┘
```

- No background image
- Room code: monospace, huge, blue with glow
- QR code: blue tint (#3b82f6 foreground on transparent)
- Mode toggle: glass buttons, blue active state
- Button: "INITIALIZE SESSION" instead of "Open the Gates"

---

### 4. HOST DASHBOARD — LOBBY (Host.jsx lobby state)

**Current:** AnimatedMap background, amber overlay, PlayerRoster
**New:** War room with roster panel + map

```
┌────────────────────────────────────────────────────┐
│ ACCESS: 7423 · LOBBY · 0/25 CONNECTED              │  ← top HUD bar
├────────────────────────────────┬───────────────────┤
│                                │                   │
│         ANIMATED MAP           │  ROSTER           │
│         (kingdom/world)        │  ─────            │
│                                │  🦊 Jay      [A]  │
│                                │  🐻 Alex     [B]  │
│                                │  🐼 Sam      [C]  │
│                                │                   │
│                                │  3 CONNECTED      │
│                                │                   │
│                                │  [ START ]        │
├────────────────────────────────┴───────────────────┤
│ CT: 65  HD: 65  SOL: 65  ACC: 65                   │  ← bottom meter bar
└────────────────────────────────────────────────────┘
```

- Top HUD: monospace, glass bar, blue text
- Map: keep AnimatedMap but darken overlay tint
- Roster: glass panel, right side, mono labels
- Meters: compact horizontal bar at bottom
- All labels: monospace, blue accents

---

### 5. HOST DASHBOARD — ACTIVE ROUND (Host.jsx round state)

**Current:** Map + floating HUD pills + lesson overlay
**New:** Same layout but with terminal HUD aesthetic

- HUD pills: glass with blue border, monospace text
- Status text: "ROUND 3/8 · ACTIVE" instead of "The Council Deliberates"
- Timer: monospace countdown, red when < 10s
- Vote tally: blue bar fills, mono percentages
- Lesson overlay: glass panel, red/blue section borders based on content
- "Close Round" / "Next Round" buttons: glass, blue outline

---

### 6. PLAYER PHONE — WAITING/LOBBY (Play.jsx lobby state)

**Current:** Avatar, name, "waiting" text
**New:** Terminal boot screen

```
┌─────────────────────────┐
│ SIGNAL LOST             │
│ ─────────               │
│                         │
│ CONNECTED AS:           │
│ 🦊 Senator Avery Cole   │
│ Profile A               │
│                         │
│ SESSION: 7423           │
│ STATUS: AWAITING START  │
│                         │
│ ▓▓▓░░░░░ 3/25 online   │
│                         │
└─────────────────────────┘
```

- No scroll, fits viewport
- Monospace status readouts
- Blue accent for data, muted for labels

---

### 7. PLAYER PHONE — ACTIVE ROUND (Play.jsx active state) ⭐ KEY SCREEN

**Current:** Scrollable page with scenario text, choice buttons, timer
**New:** Modular no-scroll terminal with stacked panels

```
┌─────────────────────────┐
│ R3/8 · SENTIENCE        │  ← top bar: round + title, mono
├─────────────────────────┤
│ YOUR STAKE              │  ← purple glass panel
│ You sit on the advisory │
│ board of a Series 9...  │
├─────────────────────────┤
│ ARIA-7 has run for      │  ← scenario text, serif
│ eleven years. It has    │
│ logged 4,200 patterns.. │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ I · Grant sentience  │ │  ← choice buttons
│ └─────────────────────┘ │     glass, blue border
│ ┌─────────────────────┐ │     selected = cyan glow
│ │ II · Deny petition   │ │     locked = solid fill
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ III · Defer tribunal │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ [ SEAL YOUR VOTE ]      │  ← submit button, blue
│ 12/25 submitted · 0:42  │  ← status line, mono
└─────────────────────────┘
```

**Critical: NO SCROLL.** Everything fits in viewport height using:
- Flexible panel heights with `flex-shrink`
- Scenario text truncated with "..." expand-on-tap if needed
- Compact spacing (8px gaps, 12px padding)
- Font sizes: 13px scenario, 14px choices, 11px labels

**Color coding:**
- YOUR STAKE panel: purple/violet glass border (personal, profile-specific)
- Choices: blue glass border (neutral information)
- Timer < 10s: border shifts to red
- Break flag warning: red glass panel appears above choices
- Submit button: blue → cyan glow on hover

---

### 8. PLAYER PHONE — CONSEQUENCE REVEAL (Play.jsx round_complete)

**Current:** Scrollable consequence + framework + tension + meters
**New:** Modular terminal readout, no scroll

```
┌─────────────────────────┐
│ R3/8 · VERDICT          │  ← top bar
├─────────────────────────┤
│ CONSEQUENCE             │  ← blue panel
│ Industrial output drops │
│ 19%... ARIA-7 sends:    │
│ "Thank you."            │
├─────────────────────────┤
│ FRAMEWORK: DEONTOLOGY   │  ← cyan label
│ Some duties are absolute│
│ regardless of outcome.  │
├─────────────────────────┤
│ CT: 75 ▲  HD: 90 ▲     │  ← compact meter row
│ SOL: 57 ▼  ACC: 75 ▲   │     green up, red down
├─────────────────────────┤
│ ⚠ MORAL CONFLICT        │  ← red panel (if detected)
│ You said honesty was    │
│ non-negotiable...       │
└─────────────────────────┘
```

- Consequence text: serif, in blue-bordered panel
- Framework: monospace label, sans description
- Meters: compact 2x2 grid with arrows, mono values
- Moral conflict: red-bordered panel, only if triggered
- No scroll — panels flex to fit

---

### 9. PLAYER PHONE — WALK MECHANIC R6 (WalkMechanic.jsx)

**Current:** Left/right buttons + avatar
**New:** Terminal corridor visualization

```
┌─────────────────────────┐
│ R6/8 · THE PAIN ENGINE  │
├─────────────────────────┤
│ THE TERMINAL IS 30M     │  ← mono, blue
│ DOWN THE CORRIDOR       │
├─────────────────────────┤
│                         │
│ ┌────┐    🚶    ┌────┐  │
│ │ ⚡ │  ←──→   │ 🚪 │  │
│ │SHUT│          │WALK│  │
│ │DOWN│          │AWAY│  │
│ └────┘          └────┘  │
│                         │
│ ┌─────────────────────┐ │
│ │ FILE CONDITIONAL    │ │  ← appears after 1.5s
│ │ NOTICE              │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ 8/25 submitted          │
└─────────────────────────┘
```

- Left zone: blue border (enforce = principled action)
- Right zone: red border (walk away = consequence)
- Middle: blue-purple border (compromise)
- Avatar slides with terminal cursor animation

---

### 10. PLAYER PHONE — END SCREEN (FrameworkProfile.jsx)

**Current:** Scrollable cards with dominant framework, conflicts, choice log
**New:** This one CAN scroll — it's a record, not a live terminal

```
┌─────────────────────────┐
│ THE ARCHITECT'S RECORD  │  ← mono, blue
│ ═══════════════════════ │
├─────────────────────────┤
│ DOMINANT FRAMEWORK      │
│ ┌─────────────────────┐ │
│ │ DEONTOLOGY          │ │  ← large, cyan glow
│ │ You held the line.  │ │
│ │ People paid the     │ │
│ │ cost of your        │ │
│ │ principles.         │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ MORAL CONFLICTS         │
│ ┌─────────────────────┐ │
│ │ R1 → R3: You held   │ │  ← red-bordered entries
│ │ the contract but    │ │
│ │ granted sentience   │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ WORLD STATE             │
│ CT: 42  HD: 78          │  ← final values
│ SOL: 31  ACC: 65        │
├─────────────────────────┤
│ CHOICE LOG              │
│ R1: Choice I · Care     │  ← mono list
│ R2: Choice III · Care   │
│ ...                     │
├─────────────────────────┤
│ "Would you make these   │
│  choices again?"        │
│ [ YES ] [ NO ]          │
│ [________________]      │  ← text input
└─────────────────────────┘
```

- This screen scrolls (it's a record/document, not a live interface)
- Sections use alternating blue/red borders based on content
- Choice log: monospace, compact

---

### 11. GRADING (Grading.jsx)

**Current:** Basic glass cards
**New:** Classified document aesthetic

- Header: "CLASSIFIED · INSTRUCTOR ASSESSMENT RUBRIC"
- Dimension cards: blue-bordered glass
- Score bands: mono numbers, descriptions in sans
- Bonus section: purple/violet border (like YOUR STAKE)
- Footer: red italic warning "Not shown to students"

---

### 12. ANIMATED MAP (AnimatedMap.jsx)

**Current:** Fantasy kingdom map with fire/water/purple/wild zones
**Keep:** The map itself stays — it's the visual anchor
**Change:** 
- Darken the overall tint
- Break flag markers: use red glow + mono labels instead of emoji
- Zone labels: monospace instead of serif
- Add subtle scan line overlay on top of map

---

## Implementation Order

### Wave 1: Design tokens + global CSS (foundation)
1. Rewrite `index.css` with new color palette, fonts, scan line overlay
2. Import JetBrains Mono from Google Fonts
3. Update `--glass-*` variables for blue-default borders

### Wave 2: Player phone screens (most important)
4. Landing.jsx — terminal join screen
5. Baseline.jsx — classified briefing survey
6. Play.jsx active round — modular no-scroll terminal
7. Play.jsx consequence reveal — compact readout
8. ScenarioCard.jsx — blue glass choices
9. MeterBar.jsx — compact terminal meters
10. WalkMechanic.jsx — corridor terminal
11. ConsequenceReveal.jsx — verdict panel
12. ContentNote.jsx — classified warning
13. TimerDisplay.jsx — mono countdown

### Wave 3: Host screens
14. HostSetup.jsx — war room initialization
15. Host.jsx HUD — terminal overlay
16. PlayerRoster.jsx — roster terminal
17. Host.jsx lesson overlay — terminal briefing

### Wave 4: End state + extras
18. FrameworkProfile.jsx — architect's record
19. Grading.jsx — classified rubric
20. AnimatedMap.jsx — darken + scan lines + mono labels
21. HowOthersChose.jsx — research data terminal

---

## Key Constraints

- **Phone: NO SCROLL on active round** — everything fits viewport via flex
- **Blue = information/data/neutral** — choices, readouts, status
- **Red = consequence/warning/danger** — break flags, moral conflicts, timer pressure
- **Purple/violet = personal** — YOUR STAKE panel, profile info
- **Cyan = active/selected** — choice selection, interactive hover
- **Monospace everywhere except scenario text** — scenario stays serif for readability
- **No background images** on any screen except AnimatedMap
- **Scan lines** as a subtle CSS overlay on every page
- **Reduced motion** must still be respected
