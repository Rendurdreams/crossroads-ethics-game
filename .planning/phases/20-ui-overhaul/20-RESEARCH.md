# Phase 20: UI Polish — Research

## RESEARCH COMPLETE

---

### 1. Player Meter Bar (Current State)

**Component:** `src/components/MeterBar.jsx` (47 lines)

`MeterBar` is a simple labeled bar: it accepts `label` (string) and `value` (0–100). It tracks delta between renders using a ref, flashes green or red for 1.5s when the value changes, and shows the delta as `+N` / `-N` beside the numeric value. There is a 4px gradient fill bar below the label row.

**Current CSS** (`src/components/MeterBar.module.css`, 92 lines):
- `.meter` — vertical flex column, minimal padding
- `.label` — 10px monospace, uppercase, `var(--text-muted)` color (gray)
- `.value` — 12px mono, `var(--accent-blue)` color with blue glow
- `.deltaUp` / `.deltaDown` — green (#22c55e) and red for delta numbers
- `.track` / `.fill` — 4px height gradient bar, `transition: width 0.8s ease`
- Flash animations: `flashFade` — fades to transparent over 1.5s

**Problem identified:** All meters are the same `var(--accent-blue)` color. No per-meter color differentiation exists yet.

**Where MeterBar is used:**

1. **`src/pages/Play.jsx` — inside `WorldHealthBar` component (lines 41–66)**
   - `WorldHealthBar` is a locally-defined component inside Play.jsx (not a separate file)
   - It renders a tap-to-expand summary bar at the top showing "REALM/WORLD N%" overall health
   - On expand (`.healthDetail`), it renders one `MeterBar` per axis from `getAxisLabels(pack)`
   - `WorldHealthBar` appears at **5 locations** in Play.jsx: lines 560, 651, 850, 917, 982
   - These cover: passedRound consequence view, consequence reveal post-submit, stake view, dilemma/dashboard view, and submitted waiting state

2. **`src/pages/Host.jsx` — lines 657 (end screen final state)**
   - Used in the end screen panel alongside framework breakdown
   - Iterates over `METER_LABELS = getAxisLabels(pack)` at line 583

3. **`src/components/WorldStatePanel.jsx` — lines 46–49 (host side panel)**
   - Renders 4 MeterBars with hardcoded kingdom-arc label names: Honesty, Courage, Loyalty, Empathy
   - Note: WorldStatePanel uses hardcoded axis keys (`trust`, `courage`, `solidarity`, `awareness`) not the dynamic pack-driven approach — this is a latent bug but out of scope for Phase 20

**Player compact strip — what needs to change:**
- The `WorldHealthBar` component in Play.jsx needs a new render mode OR replacement
- D-01 specifies: compact monospace single-line `HON 72▲  CRG 48▼  LOY 65▲  EMP 30▼`
- D-02: strip lives at TOP of phone, always visible during active rounds and consequence reveal
- D-03: arrows are green/red, only show after round closes
- D-05: remove current tall MeterBar rendering from active round and consequence views

**Key implementation decision for planner:** The existing `WorldHealthBar` is inlined in Play.jsx (not a separate file). The simplest approach is to create a new `CompactMeterStrip.jsx` component and swap the `WorldHealthBar` usages at the 5 render locations in Play.jsx. The `WorldHealthBar` (expand-to-see-all-meters) feature is being superseded by the always-visible strip.

---

### 2. Host Projector — Lesson Overlay (Current State)

**File:** `src/pages/Host.jsx` (933 lines)

The lesson overlay renders when `showLesson === true` (set via `setTimeout` at 3s after round closes — line ~391). It is an `AnimatePresence` animated overlay using `.lessonBackdrop` and `.lessonOverlay` CSS classes.

**Current lesson overlay content (lines 836–902):**
1. `lessonLabel` — "THE VERDICT" or "THE LESSON" (line 852)
2. `lessonTitle` — `currentScenario?.moralTension` (line 853)
3. `lessonBody` — `currentScenario?.teaches` (line 854)
4. `frameworkCallout` — "Most chose: [Framework Name] — [framework question]" (lines 856–861)
5. `spotlightCallout` — `currentScenario?.conflictSpotlight.description` (lines 863–869)
6. `discussionPrompts` — `currentScenario?.discussionPrompts` array rendered as a block (lines 872–879)
7. `hostNotes` — `currentScenario?.hostNotes` array rendered in a collapsible `<details>` (lines 882–889)
8. `lessonResearch` — `<HowOthersChose>` component (lines 891–897)

**What D-13 requires removing from projector:**
- Items 6 and 7 above: `discussionPrompts` block and `hostNotes` collapsible — remove from Host.jsx

**What stays on projector (D-13):**
- Vote tally with percentages (handled by `<VoteTally>` in `WorldStatePanel.jsx`, not the lesson overlay — the lesson overlay already includes HowOthersChose which is the "class vs research" element)
- The lesson content: moralTension, teaches, frameworkCallout, conflictSpotlight
- HowOthersChose (class votes vs research comparison)

**CSS classes to clean up in `Host.module.css`:**
- `.discussionPrompts`, `.discussionLabel`, `.discussionItem` (lines 830–854) — can be removed or left unused
- `.hostNotes`, `.hostNotesLabel`, `.hostNoteItem` (lines 858–880) — can be removed or left unused

---

### 3. Host Phone — HostRemote.jsx (Current State)

**File:** `src/pages/HostRemote.jsx` (514 lines)

**Current host notes rendering (lines 449–466):**

```jsx
{/* Discussion prompts + host notes */}
{currentScenario?.hostNotes?.length > 0 && (
  <div className={styles.notesBlock}>
    <p className={styles.notesLabel}>HOST NOTES</p>
    {currentScenario.hostNotes.map((note, i) => (
      <p key={i} className={styles.noteItem}>{note}</p>
    ))}
  </div>
)}

{currentScenario?.discussionPrompts?.length > 0 && (
  <details className={styles.notesBlock}>
    <summary className={styles.notesLabel} style={{ cursor: 'pointer' }}>DISCUSSION PROMPTS</summary>
    {currentScenario.discussionPrompts.map((prompt, i) => (
      <p key={i} className={styles.noteItem}>{prompt}</p>
    ))}
  </details>
)}
```

**CSS in HostRemote.module.css (lines 280–310):**
- `.notesBlock` — blue-tinted glass panel, `rgba(59, 130, 246, 0.06)` bg, blue border
- `.notesLabel` — 9px mono, uppercase, blue, left-border with `notesLabel::-webkit-details-marker` hidden
- `.noteItem` — 12px, `var(--text-dim)`, left border `2px solid rgba(59,130,246,0.2)`

**What D-11 requires on HostRemote:**
The current two-block structure (HOST NOTES + DISCUSSION PROMPTS) is replaced by a combined **facilitator cue card** containing:

1. **Ethics cheat sheet** (top section):
   - Which frameworks are in play this round
   - Key moral tension (e.g., "duty vs outcome")
   - A 1-liner the host can say aloud
   - What to watch for in the vote split

2. **Discussion prompts** (bottom section):
   - 2–3 open questions to ask the class after results

The content needs rewriting (D-12) to focus on morals, ethics, and moral reasoning connecting to critical thinking objectives. The current `hostNotes` in kingdom-arc are ABSENT (kingdom-arc has no `hostNotes` or `discussionPrompts` fields — see Section 4). New content must be authored.

---

### 4. Scenario Data — hostNotes Content

**kingdom-arc.js** (`src/lib/scenarios/packs/kingdom-arc.js`): **NO `hostNotes` or `discussionPrompts` fields exist.** The pack has `moralTension` and `teaches` at the scenario level, and `frameworks` tags per choice, but no presenter notes.

**signal-lost.js** has full `hostNotes` arrays (3 bullets per round) and `discussionPrompts` arrays (3 prompts per round) — these are the reference format.

**8 kingdom-arc scenarios that need cue cards authored:**

| Round | Title | Frameworks in choices |
|-------|-------|----------------------|
| 1 | The Divided Harvest | care, consequentialism, deontology, virtue |
| 2 | The Ember Watch | consequentialism, virtue, care, deontology |
| 3 | The Hollow Folk | deontology, virtue, consequentialism, care |
| 4 | The Sealed Archive | deontology, virtue, consequentialism, care |
| 5 | The Last Wellspring | care, consequentialism, deontology, virtue |
| 6 | The Shackled Heart | deontology, virtue, consequentialism, care |
| 7 | The Broken Banners | deontology, virtue, care, consequentialism, cultural_relativism |
| 8 | The Throne or the Truth | virtue, deontology, consequentialism, care |

**What to add per scenario in kingdom-arc.js:**
- `hostNotes: [...]` — 3 items: ethics cheat sheet content (frameworks in play, 1-liner, what to watch)
- `discussionPrompts: [...]` — 2–3 discussion questions connecting round to the class lesson

**Framework definitions available** in `src/lib/frameworks.js`:
- Consequentialism: "Do whatever produces the best result for the most people"
- Deontology: "Some rules don't bend, period"
- Care Ethics: "The person in front of you matters more than any abstract principle"
- Virtue Ethics: "What would a genuinely good person do here?"

---

### 5. Integration Risks

**Risk 1: WorldHealthBar is inlined in Play.jsx**
The `WorldHealthBar` function is defined at the top of `Play.jsx` (line 41), not in a separate file. It's used in 5 places throughout the component. Creating a `CompactMeterStrip` as a separate file and swapping imports is clean, but the 5 JSX usages need prop changes (new component needs `worldState`, `pack`, `roundClosed` flag for showing arrows vs. hiding them).

**Risk 2: Arrow display timing (D-03)**
Arrows only show after a round closes (when deltas are known). The `CompactMeterStrip` needs to receive either:
- A `showArrows` boolean driven by `session.status === 'round_complete'`
- OR prev/current worldState to compute deltas itself

The existing `MeterBar` already does delta tracking via `useRef`. The new strip component needs the same pattern or a simpler one.

**Risk 3: kingdom-arc has no hostNotes — null-safe guards already exist in Host.jsx and HostRemote.jsx**
Both Host.jsx (line 882: `currentScenario?.hostNotes?.length > 0`) and HostRemote.jsx (line 450: `currentScenario?.hostNotes?.length > 0`) already guard with optional chaining. Adding `hostNotes` to kingdom-arc will just make those blocks render. Removing from Host.jsx projector is safe.

**Risk 4: WorldStatePanel uses hardcoded kingdom-arc axis keys**
`WorldStatePanel.jsx` (line 46–49) hardcodes `Honesty/Courage/Loyalty/Empathy` labels and the `trust/courage/solidarity/awareness` keys. This is not a Phase 20 concern but is a latent issue for signal-lost pack. Do not fix in Phase 20.

**Risk 5: MeterBar still used on Host.jsx end screen (line 657)**
The end screen in Host.jsx uses `MeterBar` directly for the final world state display. Per D-05, the player-side compact strip replaces MeterBar on phones. MeterBar should remain unchanged for Host.jsx usage. The `CompactMeterStrip` is a new component that only affects Play.jsx.

**Risk 6: Color-coding (D-06/D-07)**
The 4 meter colors (blue/amber/green/purple) need to be injected per-meter. The new `CompactMeterStrip` needs to map axis keys to colors. For kingdom-arc: `trust→blue, courage→amber, solidarity→green, awareness→purple`. For signal-lost: `CT→blue, HD→purple, SOL→green, ACC→amber`. The mapping should be driven by position in the `axisSet` or a hardcoded lookup — hardcoded lookup per pack is simpler and safer.

**Risk 7: CSS for compact strip — no existing styles to reuse**
The compact strip (`HON 72▲  CRG 48▼  LOY 65▲  EMP 30▼`) is a new design. It needs a new CSS module. The existing `.healthBar` and `.healthDetail` styles in `Play.module.css` (lines 182–232) can be kept initially to avoid breaking anything, then cleaned up in a follow-up if desired.

---

### 6. Implementation Approach

**Recommended order (smallest blast radius first):**

**Step 1 — Author kingdom-arc hostNotes and discussionPrompts (data only)**
Add `hostNotes` and `discussionPrompts` fields to all 8 kingdom-arc scenarios. Content should focus on: which frameworks are in play, the moral tension name, a 1-liner Jay can say, and 2–3 discussion questions. This is a pure data change in `src/lib/scenarios/packs/kingdom-arc.js` — no component changes.

**Step 2 — Remove hostNotes and discussionPrompts from Host.jsx projector**
Delete lines 872–889 from Host.jsx (the `discussionPrompts` block and `hostNotes` collapsible). The `.lessonResearch` HowOthersChose block stays. This is a targeted 18-line deletion in one file. CSS classes in Host.module.css can be left in place (harmless unused styles) or cleaned — planner's call.

**Step 3 — Restructure HostRemote.jsx facilitator cue card**
Replace the two-block notes render (lines 449–466) with a single unified cue card panel that shows:
- "ETHICS CUE CARD" header
- Frameworks in play (derived from `currentScenario.choices` → frameworks arrays)
- `hostNotes` items as bullet points (cheat sheet)
- `discussionPrompts` items as discussion questions
Add CSS for the new layout in `HostRemote.module.css`. Existing `.notesBlock` / `.notesLabel` / `.noteItem` styles can be reused or extended.

**Step 4 — Create CompactMeterStrip.jsx**
New component. Props: `worldState`, `pack`, `showArrows` (boolean), `prevWorldState` (optional, for delta computation). Renders a single-line `HON 72▲  CRG 48▼  LOY 65▲  EMP 30▼` strip. Internal color map keyed by axis position or axis key. Create `CompactMeterStrip.module.css` for the strip styles. Use monospace font, position: sticky top, small height (~32px).

**Step 5 — Swap WorldHealthBar usages in Play.jsx**
Replace the 5 `<WorldHealthBar>` usages (lines 560, 651, 850, 917, 982) with `<CompactMeterStrip>`. Pass `showArrows={session.status === 'round_complete'}`. The old `WorldHealthBar` function (lines 41–66) and its expand/collapse behavior can be removed entirely.

**Key decisions the planner must lock:**

1. **Abbreviations vs. full words** — D context says "pick what fits on one line across phone widths." Recommend abbreviations (HON/CRG/LOY/EMP for kingdom-arc; CT/HD/SOL/ACC for signal-lost — these are already the axis keys). Signal-lost axes are already abbreviated.

2. **Arrow animation** — D-03 says arrows show only after round closes. Simple `opacity: 0 → 1` fade-in is sufficient. Static display is acceptable.

3. **Frameworks in HostRemote cue card** — the cue card should derive "frameworks in play this round" from `currentScenario.choices.flatMap(c => c.frameworks)` deduplicated. This is runtime-computed, no extra data needed.

4. **prevWorldState for delta** — Play.jsx has `session.world_state` from Supabase subscription. The previous world state before round close is not stored separately in the DB. The CompactMeterStrip should track prev via `useRef` internally (same pattern as MeterBar).

5. **Strip position** — "TOP of the phone screen, always visible." This likely means `position: sticky; top: 0` inside the Play.jsx layout, above the round content panels. Check Play.jsx layout structure to confirm there's a natural container to sticky-position within.
