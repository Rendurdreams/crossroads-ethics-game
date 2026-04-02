# Phase 20: UI Polish — Health Bar Fix, Host Notes, Declutter Host View - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Targeted UI polish on the player meter bars and host presentation experience. Four changes: (1) restyle player-side health bars from tall gradient bars to compact monospace number readouts at the top of the phone, (2) move host teaching notes off the projector and onto the host phone (HostRemote) with rewritten ethics/moral reasoning content, (3) declutter the host projector post-round overlay to show only vote tally + lesson + class-vs-research comparison, (4) color-code each meter with a distinct color.

No new features. No new screens. No Signal Lost UI overhaul — this is polish on the existing kingdom-arc game.

</domain>

<decisions>
## Implementation Decisions

### Player meter bar restyle
- **D-01:** Replace the tall MeterBar gradient bars on the player phone with minimal monospace number readouts: `HON 72▲  CRG 48▼  LOY 65▲  EMP 30▼`
- **D-02:** Meter strip lives at the TOP of the player phone screen — a compact single-line status bar, always visible during active rounds and consequence reveal
- **D-03:** Arrows are color-coded: green (▲) when value went up, red (▼) when value went down. Arrows only show after a round closes (when deltas are known)
- **D-04:** Each meter has its own distinct color for the label+value text (see Color-coded meters section below)
- **D-05:** Remove the current tall MeterBar rendering from the active round and consequence views in Play.jsx — replaced entirely by the compact top strip

### Color-coded meters
- **D-06:** Each of the 4 meters gets a unique color to distinguish them at a glance:
  - Honesty → blue
  - Courage → amber/gold
  - Loyalty → green
  - Empathy → purple
- **D-07:** Colors apply to both the label abbreviation and the numeric value in the compact meter strip
- **D-08:** Delta arrows remain green (up) / red (down) regardless of meter color

### Host teaching notes — phone only
- **D-09:** Host teaching notes are displayed ONLY on the host phone view (HostRemote.jsx), NOT on the projector screen (Host.jsx)
- **D-10:** Remove host notes (`hostNotes`) and discussion prompts (`discussionPrompts`) from the Host.jsx lesson overlay entirely
- **D-11:** On HostRemote.jsx, rewrite/restructure the notes section to be a combined facilitator cue card per round containing:
  - **Ethics cheat sheet** (top): which frameworks are in play this round, the key moral tension (e.g., "duty vs outcome"), a 1-liner the host can say aloud (e.g., "This is deontology vs consequentialism — rules vs results"), what to watch for in the vote split
  - **Discussion prompts** (below): 2-3 open questions to ask the class after results (e.g., "Why did most of you choose X?", "What would change if Y was your friend?", "Which framework justifies Z?")
- **D-12:** The content of these notes needs to be rewritten to focus on morals, ethics, and moral reasoning — tying the round's lesson back to the course's critical thinking objectives. Current content is too generic.

### Host projector declutter
- **D-13:** After a round closes, the projector screen (Host.jsx) shows ONLY these elements in the post-round overlay:
  1. Vote tally with percentages (what the class chose)
  2. The lesson content (moral tension, framework concepts)
  3. Class votes vs research comparison (HowOthersChose data)
- **D-14:** Keep the current reveal beat flow (animation sequence) — just remove the host notes and discussion prompts from what appears on the projector
- **D-15:** All host-facing prompts, discussion questions, and facilitator notes are phone-only (HostRemote)

### Claude's Discretion
- Exact hex values for meter colors (blue/amber/green/purple) — pick values that work on the dark glass background
- Font size for the compact meter strip (should be readable but not dominant)
- Spacing and layout of the facilitator cue card on HostRemote
- Whether to use abbreviations (HON/CRG/LOY/EMP) or full words in the meter strip — pick what fits on one line across phone widths
- Animation for delta arrows (flash, fade-in, or static)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Player meter display
- `src/components/MeterBar.jsx` — Current meter bar component being replaced
- `src/components/MeterBar.module.css` — Current meter styles (92 lines)
- `src/pages/Play.jsx` — Player phone view where meters are rendered (lines ~480-483, ~561-564)
- `src/components/WorldStatePanel.jsx` — Host-side meter panel (may need adjustment)

### Host views
- `src/pages/Host.jsx` — Main projector host dashboard (933 lines, 8+ overlay states)
- `src/pages/HostRemote.jsx` — Host phone remote control (lines ~449-463 for current notes)
- `src/pages/Host.module.css` — Host styles (900+ lines, notes styling at lines ~828-880)

### Scenario data (host notes content)
- `src/lib/scenarios.js` — Scenario objects with `discussionPrompts` and `hostNotes` fields
- `src/lib/kingdom-arc.js` — Kingdom arc pack (source of truth for current round content)

### Prior decisions
- `.planning/phases/10-host-ux-unification-reveal-beat/10-CONTEXT.md` — D-07 through D-11: host screen = canvas + floating glass HUD, meters togglable, vote tally toggle-on
- `.planning/phases/13-text-mobile-polish/13-CONTEXT.md` — D-01 through D-03: meter labels (Honesty, Courage, Loyalty, Empathy), same labels on host and player

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `MeterBar.jsx` — Current component with flash animation and delta display; being replaced on player side but may still be used on host WorldStatePanel
- `WorldStatePanel.jsx` — Host-side panel wrapping meters + scenario + tally + timer; may need the host notes content removed
- `HostRemote.jsx` — Already has host notes rendering (collapsible `<details>` tag); needs restructuring for the new facilitator cue card format

### Established Patterns
- Glass-morphism UI: `backdrop-filter: blur`, blue borders, glow effects on dark backgrounds
- CSS Modules for component-scoped styles
- Framer Motion `AnimatePresence` for overlay transitions
- Scenario data provides `discussionPrompts` (array of strings) and `hostNotes` (string or array)

### Integration Points
- Play.jsx renders MeterBar instances — needs to swap to compact strip component
- Host.jsx lesson overlay renders hostNotes and discussionPrompts — needs removal
- HostRemote.jsx renders hostNotes in collapsible section — needs restructuring
- Scenario data objects may need `hostNotes` content rewritten for ethics focus

</code_context>

<specifics>
## Specific Ideas

- Player meter strip should feel like a terminal status bar — monospace, compact, informational
- "HON 72▲  CRG 48▼  LOY 65▲  EMP 30▼" is the target aesthetic — minimal numbers with directional arrows
- Host phone cue card should give Jay (the presenter) what he needs to connect each round's dilemma back to ethics vs morals — the core lesson of the presentation
- Projector screen after round close should be clean enough for the class to read: vote tally, lesson, research comparison — nothing else

</specifics>

<deferred>
## Deferred Ideas

- Full Signal Lost terminal UI overhaul (existing 20-PLAN.md describes a complete sci-fi redesign — that's a separate scope, potentially a future phase)
- AnimatedMap visual changes (darkening, scan lines, mono labels)
- End screen restyling
- Grading page visual polish

</deferred>

---

*Phase: 20-ui-overhaul*
*Context gathered: 2026-04-01*
