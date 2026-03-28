# Phase 10: Host UX Unification + Reveal Beat — Research

**Researched:** 2026-03-28
**Domain:** React/CSS HUD overlay layout + Three.js R3F animation sequencing + Framer Motion orchestration
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** Particles — replace current 40-particle system with subtle ambient only. Max 10-15 on screen. Barely-visible drifting motes when thriving, faint ember glow near fires when fallen.

**D-02:** Canvas color rework — richer, more distinct color stops across the fallen/neutral/thriving lerp. Fallen = deeper reds/purples/blood tones. Thriving = warmer golds/greens. Shifts between states should be dramatic, not muddy. (Note: this refers to the Three.js KingdomScene lighting/fog palette, not a 2D canvas.)

**D-03:** Building detail upgrade — more interesting rooflines, window patterns, chimney smoke silhouettes. Should read as stylized illustrated kingdom, not programmer-art rectangles.

**D-04:** State transitions need more drama — when world state changes, audience should notice. The scene change between rounds is a visual event.

**D-05:** Two-phase reveal flow after host clicks "Close Round":
- Phase 1 (~3s): Full-screen 3D scene dramatic shift only, no text overlay. Scene rapidly lerps from current state to new state. Meters show +/- deltas. Jay narrates.
- Phase 2 (manual): Glowing [Lesson] button appears in HUD. Jay clicks it → lesson overlay fades in (scene dims to ~30%, large centered text). Jay clicks [Next Dilemma] to dismiss and advance.

**D-06:** Reveal beat total duration = 2-3 seconds for the scene shift. Quick enough to keep energy up.

**D-07:** Canvas (scene) fills 100% of the host screen at all times. All UI elements float over it as translucent glass pills/overlays. Not panels, not sidebars, not dashboards.

**D-08:** Always visible elements (minimal): top corner = room code + round number (small glass pill); bottom corner = timer countdown + "X/Y submitted" count. That's it. Everything else hidden or toggled.

**D-09:** Kingdom meters (trust/courage/solidarity/awareness) are NOT always visible. They appear as part of the reveal beat (delta numbers), then can be toggled if needed.

**D-10:** Vote tally is toggle-on — hidden by default, presenter pops it up with a button. Keeps choices private until presenter decides to reveal.

**D-11:** Lesson overlay is fully manual — presenter clicks [Lesson] button after reveal beat to show it, clicks [Next Dilemma] to dismiss.

**D-12:** No presenter notes. The lesson text on screen is enough to talk from.

### Claude's Discretion

- Exact glass opacity/blur values for HUD elements (should feel like game UI, not a modal)
- Button/hotkey design for toggling vote tally and lesson overlay
- Animation easing curves for the reveal beat scene lerp
- How meter deltas appear during the reveal (floating numbers? brief flash on the HUD?)
- Whether the lobby view and end view also get the full-screen canvas + minimal HUD treatment
- CSS transition approach for lesson overlay fade-in/out
- Whether to add keyboard shortcuts for presenter flow (spacebar = advance, L = lesson, V = votes)

### Deferred Ideas (OUT OF SCOPE)

- Keyboard shortcuts for presenter flow (spacebar, L, V keys) — could add this phase or defer
- Sound effects for reveal beat
- Audience reaction indicators (emoji rain, applause animation)
- Mobile-optimized host view

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| THREE-04 | Host screen layout unifies 3D scene and right panel into one visual language — same dark glass palette, amber glow, panel feels like a HUD overlay on the scene, not a separate column | CSS positioning patterns (fixed + z-index stacking), backdrop-filter glass pill system — existing `.glassPanel` is the starting point |
| THREE-05 | Dramatic round-close sequence: when host clicks "Close Round," the 3D scene plays a brief reveal animation (2–4 seconds) before world state meters update — landmark lights shift, a visual beat registers the collective choice | React state machine for reveal phases; R3F `useFrame` lerp speed override during reveal; Framer Motion for HUD element orchestration |
| HOSTUX-01 | Host panel and 3D scene share visual language — panel elements styled as HUD overlays on the 3D scene background, not a separate sidebar | Layout refactor: remove `bottomPanels` flex column, replace with absolutely-positioned minimal glass pills |
| HOSTUX-02 | Round-close reveal beat is visually distinct from normal state — a moment of anticipation before world state animates | Two-phase state machine in Host.jsx; `revealPhase` enum drives both HUD visibility and KingdomScene lerp speed |

</phase_requirements>

---

## Summary

Phase 10 converts the host screen from a "dashboard with a background" to a "cinematic HUD over a 3D scene." The work has two distinct tracks that must coordinate: (1) a layout/CSS overhaul of Host.jsx and Host.module.css, and (2) a state-machine-driven animation sequence in KingdomScene.jsx that creates the reveal beat.

The current implementation already has most of what's needed structurally: `position: fixed` canvas + z-index stacking is in place, glass panel system exists, `prevWorldRef` tracks deltas, Framer Motion is installed (v11.18.2), and KingdomScene already uses `THREE.MathUtils.lerp` inside `useFrame` for smooth transitions. The work is refinement and orchestration — not a rebuild.

The key architectural insight: the reveal beat is a temporary change to the lerp speed multiplier inside each KingdomScene landmark component. During normal operation landmarks lerp at `delta * 2`. During the reveal, the speed is briefly set to `delta * 8` (or a multiplier prop), creating the accelerated visual shift. After 2-3 seconds the speed drops back. This needs no new Three.js APIs — it's a prop change plus a setTimeout-driven state reset.

**Primary recommendation:** Implement a `revealPhase` state in Host.jsx (`'idle' | 'revealing' | 'revealed'`), pass a `lerpSpeed` prop to KingdomScene, and use CSS absolute positioning with Framer Motion AnimatePresence to orchestrate HUD element visibility across phases.

---

## Current Implementation Audit

### What exists in Host.jsx

The current structure already uses `position: fixed` canvas + z-index HUD overlays — the architectural skeleton is correct. The specific issues to fix:

1. **Three-panel layout** (`scenarioPanel`, `metersPanel`, `controlPanel` in a flex row at bottom) must become individual glass pills at specific screen positions.
2. Vote tally is always-visible inside `scenarioPanel`. Needs to become a toggled overlay.
3. Lesson content (currently in `scenarioPanel` after round close) needs to become a full-screen-dimming overlay.
4. The meters panel (`metersPanel`) is always visible. Needs to be hidden by default and shown only after round close (with deltas).
5. Timer + submitted count and room code are currently in two separate elements (`topBar` and `controlPanel`). Both should become minimal glass pills.

### What exists in KingdomScene.jsx

All four landmarks (Bridge, Beacon, Village, FogController) already lerp their visual properties in `useFrame`. The lerp factor is currently hardcoded at `delta * 2` (for Bridge and Beacon) and `delta * 1.5` (for Village). During the reveal beat, these multipliers need to temporarily increase to create the accelerated visual shift.

There is NO existing prop for lerp speed — this must be added. Pattern:

```javascript
// Current (Bridge.jsx)
matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
  matRef.current.emissiveIntensity, targetEmissive.current, delta * 2
)

// After Phase 10 — lerpSpeed prop threaded down from KingdomScene
matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
  matRef.current.emissiveIntensity, targetEmissive.current, delta * lerpSpeed
)
```

KingdomScene already accepts a `worldState` prop. It needs one additional prop: `lerpSpeed` (default `2`). Host passes `8` during the 2-3 second reveal window, then resets to `2`.

### Phase 9 Plan 02 Status

Phase 9 Plan 02 (lerp interpolation + threshold events) has NOT been executed. However, KingdomScene already has lerp logic baked in from Plan 01. Plan 02 would add more refined threshold-event animations. Phase 10 research accounts for working with the current Plan 01 state — the `lerpSpeed` prop addition is compatible with whatever Plan 02 adds.

---

## Architecture Patterns

### Recommended Host.jsx State Shape

```javascript
// Three reveal phases
const REVEAL_PHASES = {
  IDLE: 'idle',         // Round active, normal display
  REVEALING: 'revealing', // 2-3s animated scene shift
  REVEALED: 'revealed'  // Lesson button available, meters shown
}

// New state additions to Host.jsx
const [revealPhase, setRevealPhase] = useState('idle')
const [showTally, setShowTally] = useState(false)
const [showLesson, setShowLesson] = useState(false)
const [lerpSpeed, setLerpSpeed] = useState(2)
```

### Reveal Beat Sequence

```javascript
// In closeRound() — after Supabase update resolves
async function closeRound() {
  if (roundState.roundClosed) return
  dispatch({ type: 'ROUND_CLOSE' })

  prevWorldRef.current = session.world_state
  const newWorldState = applyChoicesToWorld(...)

  // 1. Update world state in DB (triggers KingdomScene update via session subscription)
  await supabase.from('sessions').update({ status: 'round_complete', world_state: newWorldState })

  // 2. Kick off reveal
  setRevealPhase('revealing')
  setLerpSpeed(8)  // Fast lerp — scene shifts quickly

  // 3. After 2.5s, downshift to revealed state
  setTimeout(() => {
    setRevealPhase('revealed')
    setLerpSpeed(2)
  }, 2500)
}
```

### HUD Layout Architecture

The current three-panel flex row becomes individual absolutely-positioned glass pills. Reference positions for a projected laptop screen (approx 1920x1080):

```
┌─────────────────────────────────────────────────────┐
│  [ROOM CODE + ROUND]    (top-left glass pill)       │
│                                                      │
│                                                      │
│           ← 3D SCENE FILLS EVERYTHING →             │
│                                                      │
│                                                      │
│  [VOTE]           [TIMER • X/Y]     [CLOSE ROUND]  │
│  (toggleable      (bottom-center    (bottom-right)  │
│   left pill)       pill)                            │
└─────────────────────────────────────────────────────┘

After reveal:
┌─────────────────────────────────────────────────────┐
│  [ROOM CODE + ROUND]    (top-left glass pill)       │
│                                                      │
│  [TRUST +8]  [COURAGE -4]  [SOLIDARITY +12]        │
│  (delta pills, centered, fade in on reveal)         │
│                                                      │
│           ← 3D SCENE (still visible) →             │
│                                                      │
│  [VOTE]       [LESSON ✦]        [NEXT DILEMMA]    │
│                (glowing amber)                      │
└─────────────────────────────────────────────────────┘
```

### Framer Motion Usage (Already Installed)

Framer Motion v11.18.2 is installed but unused in Host.jsx. Use it for:

1. **Meter delta pills:** `AnimatePresence` + `motion.div` with `initial={{ opacity: 0, y: 20 }}`, `animate={{ opacity: 1, y: 0 }}` triggered when `revealPhase === 'revealed'`
2. **Lesson overlay:** `motion.div` with `initial={{ opacity: 0 }}`, `animate={{ opacity: 1 }}` + backdrop `motion.div` at ~0.7 opacity when `showLesson === true`
3. **Vote tally panel:** `AnimatePresence` + slide-up motion on toggle

```javascript
// Source: Framer Motion v11 — AnimatePresence + motion.div
import { motion, AnimatePresence } from 'framer-motion'

// Delta pills (appear on reveal)
<AnimatePresence>
  {revealPhase === 'revealed' && deltas && (
    <motion.div
      className={styles.deltaPillsRow}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* trust, courage, solidarity, awareness delta pills */}
    </motion.div>
  )}
</AnimatePresence>

// Lesson overlay
<AnimatePresence>
  {showLesson && (
    <>
      <motion.div
        className={styles.lessonBackdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.72 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      />
      <motion.div
        className={styles.lessonOverlay}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {/* lesson content */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### KingdomScene lerpSpeed Prop

```javascript
// KingdomScene.jsx signature change
export default function KingdomScene({ worldState, lerpSpeed = 2 }) {
  // Pass lerpSpeed down to each landmark
  return (
    <Canvas ...>
      <Bridge trust={trust} lerpSpeed={lerpSpeed} />
      <Beacon courage={courage} lerpSpeed={lerpSpeed} />
      <Village solidarity={solidarity} lerpSpeed={lerpSpeed} />
      {/* FogController is instant (scene.fog re-assigned), no lerp to tune */}
    </Canvas>
  )
}

// Inside Bridge component
function Bridge({ trust = 50, lerpSpeed = 2 }) {
  useFrame((_, delta) => {
    if (matRef.current) {
      matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        matRef.current.emissiveIntensity, targetEmissive.current, delta * lerpSpeed
      )
    }
  })
}
```

### CSS Glass Pill System

The existing `.glassPanel` has the right base properties. New pill variants need only position and sizing changes. Key values to use:

```css
/* Based on audit of existing Host.module.css variables */
--glass-bg: rgba(5, 5, 16, 0.75)     /* existing */
--glass-border: rgba(255,255,255,0.08) /* existing */
--blur-glass: 16px                     /* existing */
--accent: #f59e0b                      /* amber — existing */

/* New: glass pill (minimal HUD element) */
.hudPill {
  position: fixed;
  background: rgba(5, 5, 16, 0.60);   /* slightly lighter than panel */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  padding: 10px 20px;
  z-index: 2;
  /* box-shadow with amber glow kept very subtle */
  box-shadow: 0 4px 24px rgba(0,0,0,0.45), 0 0 40px rgba(245,158,11,0.04);
}

/* Lesson overlay backdrop */
.lessonBackdrop {
  position: fixed;
  inset: 0;
  background: #050510;
  z-index: 3;
}

.lessonOverlay {
  position: fixed;
  inset: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lessonContent {
  max-width: 700px;
  padding: 60px;
  /* no glass panel — lesson text reads directly against dimmed scene */
}
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Enter/exit transitions for HUD elements | Custom CSS keyframe + JS class toggle | Framer Motion `AnimatePresence` | Already installed; handles unmount animations which CSS class toggles cannot |
| Timed reveal sequence | `setInterval` polling | `setTimeout` chain + React state | Simple 2-state transition doesn't need an interval; setTimeout is correct for a one-shot timer |
| Smooth 3D property lerp | Custom rAF lerp loop outside R3F | `THREE.MathUtils.lerp` inside `useFrame` | R3F render loop is already running; external rAF causes double-update artifacts |
| HUD layout | Flexbox panels | `position: fixed` absolute pills | Fixed positioning lets pills "float" independently; flex panels fight the scene-as-background model |

---

## Common Pitfalls

### Pitfall 1: Lesson Overlay Blocks the "Next Dilemma" Click
**What goes wrong:** The lesson overlay covers the entire screen including the "Next Dilemma" button. If the overlay is not dismissed before the button is visible, nothing is clickable.
**Why it happens:** `position: fixed; inset: 0` catches all pointer events.
**How to avoid:** "Next Dilemma" button lives INSIDE the lesson overlay (not behind it). User clicks [Next Dilemma] inside the overlay which (a) dismisses the overlay and (b) calls `nextRound()`. The overlay's dismiss action and round advance are the same click.
**Warning signs:** Lesson overlay appears but "Next Dilemma" button doesn't respond.

### Pitfall 2: `lerpSpeed` Prop Causes React Re-renders Inside R3F Tree
**What goes wrong:** Every Host.jsx state change that triggers a re-render (e.g., timer tick) re-renders KingdomScene, which re-creates Three.js materials if not memoized.
**Why it happens:** `useMemo` with an empty dep array in Bridge/Beacon/Village creates materials once — this is already correct in the current code. The `lerpSpeed` prop does NOT need to be in the deps array since it's read inside `useFrame` via a `useRef`.
**How to avoid:** Thread `lerpSpeed` into landmarks via a `useRef`, not as a prop that triggers re-renders. Store it in a ref and update the ref inside `useEffect`.

```javascript
// Better pattern — avoids any re-render chain
function Bridge({ trust, lerpSpeedRef }) {
  useFrame((_, delta) => {
    matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      matRef.current.emissiveIntensity, targetEmissive.current,
      delta * (lerpSpeedRef?.current ?? 2)
    )
  })
}
```

### Pitfall 3: World State Arrives via Supabase After `closeRound()` Resolves
**What goes wrong:** Host calls `closeRound()`, updates DB, then starts the reveal. But the session subscription fires `setSession(payload.new)` with the new world state — this updates `worldState` which drives `<KingdomScene worldState={worldState} />`, which immediately starts lerping. The reveal beat visual relies on the 3D scene reacting to the new world state — but if the session subscription fires before the reveal timer completes, the lerp happens at normal speed (not fast-reveal speed).
**Why it happens:** Race condition: `setRevealPhase('revealing') + setLerpSpeed(8)` needs to happen BEFORE the Supabase subscription updates `worldState`. If they're sequential React state updates, they batch correctly in React 18. Verify both state updates fire in the same call.
**How to avoid:** Set reveal phase and lerpSpeed in the same synchronous block as `closeRound()` before the `await`. The Supabase write is async; by the time the subscription fires, `lerpSpeed` will already be 8.

### Pitfall 4: `FogController` Is Not Lerped — Creates Jarring Jump
**What goes wrong:** FogController directly assigns `scene.fog = new THREE.FogExp2(...)` in `useEffect`. When awareness changes rapidly during the reveal beat, fog density jumps instantly while other landmarks lerp smoothly.
**Why it happens:** No lerp in FogController — it uses `useEffect` not `useFrame`.
**How to avoid:** During Phase 10, add a `useFrame` lerp for fog density in FogController (store target density in a ref, lerp current density toward it each frame). This is also Phase 9 Plan 02 work — coordinate or include it here.

### Pitfall 5: Bottom HUD Pills Must Not Clip 3D Viewport
**What goes wrong:** `position: fixed` bottom pills with large padding can obscure the lower portion of the 3D scene. On a 16:9 projector, the bottom 10% of the scene may be permanently blocked.
**Why it happens:** HUD pills have no scroll or viewport awareness.
**How to avoid:** Keep bottom pills compact (max ~50px tall). Use `pointer-events: none` on the `.hud` wrapper with `pointer-events: auto` on individual interactive elements — the existing pattern in Host.module.css is already correct. Keep the scene's Camera FOV from pointing at obscured areas (current camera at y=10, elevated angle — bottom 10% is ground plane near the edge, lowest visual priority).

---

## Code Examples

### Minimal HUD Pill — Top Left (Room Code + Round)

```jsx
// Source: Host.module.css pattern + design decisions D-07, D-08
<div className={styles.hudPillTopLeft}>
  <span className={styles.roomCodeText}>{session.room_code}</span>
  <span className={styles.roundText}>
    {session.current_round} / {session.total_rounds}
  </span>
</div>
```

```css
.hudPillTopLeft {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(5, 5, 16, 0.60);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  padding: 10px 20px;
  pointer-events: none; /* read-only display */
}
```

### Bottom Status Pill (Timer + Submitted Count)

```jsx
// Source: design decisions D-08
<div className={styles.hudPillBottom}>
  <span className={`${styles.timerText} ${timerDanger ? styles.timerDanger : ''}`}>
    {roundState.roundClosed ? '—' : roundState.timerSeconds}
  </span>
  <span className={styles.divider}>·</span>
  <span className={styles.submittedText}>
    {roundState.choices.length} / {players.length}
  </span>
</div>
```

### Vote Tally Toggle

```jsx
// Source: design decision D-10
const [showTally, setShowTally] = useState(false)

// Toggle button in HUD (always visible, bottom area)
<button className={styles.hudPillBtn} onClick={() => setShowTally(v => !v)}>
  {showTally ? 'Hide Votes' : 'Show Votes'}
</button>

// Tally appears as an additional floating panel
<AnimatePresence>
  {showTally && (
    <motion.div
      className={styles.tallyOverlay}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
    >
      {tally.map((t, i) => (/* tally rows */))}
    </motion.div>
  )}
</AnimatePresence>
```

### Reveal Beat — Full Sequence

```jsx
// Source: design decisions D-05, D-06
async function closeRound() {
  if (roundState.roundClosed) return
  dispatch({ type: 'ROUND_CLOSE' })

  prevWorldRef.current = session.world_state
  const newWorldState = applyChoicesToWorld(
    roundState.choices, pack.scenarios, session.current_round - 1, session.world_state
  )

  // Start reveal before DB write — ensures lerpSpeed=8 is set before
  // the Supabase subscription fires with new world_state
  setRevealPhase('revealing')
  lerpSpeedRef.current = 8

  await supabase.from('sessions')
    .update({ status: 'round_complete', world_state: newWorldState })
    .eq('id', sessionId)

  // 2.5s later: transition to revealed state
  setTimeout(() => {
    setRevealPhase('revealed')
    lerpSpeedRef.current = 2
  }, 2500)
}
```

### Delta Pills — Appear After Reveal

```jsx
// Source: design decision D-09, D-05 Phase 1
const METER_LABELS = { trust: 'Trust', courage: 'Courage', solidarity: 'Solidarity', awareness: 'Awareness' }

<AnimatePresence>
  {revealPhase === 'revealed' && deltas && (
    <motion.div
      className={styles.deltaPillsRow}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {Object.entries(deltas).filter(([, v]) => v !== 0).map(([key, val]) => (
        <div key={key} className={`${styles.deltaPill} ${val > 0 ? styles.deltaUp : styles.deltaDown}`}>
          <span className={styles.deltaLabel}>{METER_LABELS[key]}</span>
          <span className={styles.deltaValue}>{val > 0 ? '+' : ''}{val}</span>
        </div>
      ))}
    </motion.div>
  )}
</AnimatePresence>
```

### Lesson Overlay — Full Screen Dimmed

```jsx
// Source: design decisions D-05 Phase 2, D-11
<AnimatePresence>
  {showLesson && (
    <>
      {/* Dim backdrop */}
      <motion.div
        className={styles.lessonBackdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.72 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        onClick={() => setShowLesson(false)}
      />
      {/* Lesson content */}
      <motion.div
        className={styles.lessonContent}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <p className={styles.lessonLabel}>THE LESSON</p>
        <p className={styles.lessonTitle}>{currentScenario?.moralTension}</p>
        <p className={styles.lessonBody}>{currentScenario?.teaches}</p>
        {dominantFw && (
          <p className={styles.frameworkCallout}>
            Most chose: <strong>{FRAMEWORKS[dominantFw]?.name}</strong>
            {' — '}{FRAMEWORKS[dominantFw]?.question}
          </p>
        )}
        <button className={styles.actionBtn} onClick={() => {
          setShowLesson(false)
          isLastRound ? endSession() : nextRound()
        }}>
          {isLastRound ? 'End Game' : 'Next Dilemma'}
        </button>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

---

## What Phase 9 Plan 02 Provides (When Executed)

Phase 9 Plan 02 (not yet executed) is supposed to add lerp interpolation and threshold events to KingdomScene. If Plan 02 runs before Phase 10, it may already introduce a `lerpSpeed` or `lerpMultiplier` prop. If Phase 10 runs before Plan 02, Phase 10 should add the `lerpSpeed` prop as described here.

Either way, the `lerpSpeedRef` pattern is compatible: Phase 10's plan should be written to check for existing prop, add it if missing.

---

## Host Layout Refactor — Before vs. After

### Before (current)

```
position: fixed, z-index 0    — canvas (KingdomCanvas 2D — will be KingdomScene)
position: fixed, z-index 2    — .topBar (centered glass panel, room code + status)
position: fixed, z-index 1    — .hud (flex column, justify-content: flex-end)
  └── .bottomPanels (flex row)
        ├── .scenarioPanel (flex: 3) — scenario, tally, lesson all here
        ├── .metersPanel (flex: 2)   — always-visible meters
        └── .controlPanel           — timer, close/next/end buttons
```

### After (Phase 10)

```
position: fixed, z-index 0    — canvas (KingdomScene Three.js)
position: fixed, z-index 2    — .hudPillTopLeft (room code + round)
position: fixed, z-index 2    — .hudPillBottomCenter (timer + X/Y submitted)
position: fixed, z-index 2    — .hudPillBottomRight (Close Round / Lesson / Next Dilemma)
position: fixed, z-index 2    — .hudPillBottomLeft (Show/Hide Votes toggle button)
position: fixed, z-index 3    — .deltaPillsRow (appears only in 'revealed' phase)
position: fixed, z-index 3    — .tallyOverlay (toggle-on vote tally)
position: fixed, z-index 3    — .lessonBackdrop (dimming layer, shown when showLesson)
position: fixed, z-index 4    — .lessonContent (lesson text + next button)
```

KingdomCanvas (the old 2D canvas component) is still imported in Host.jsx. Phase 10 should switch the import from `KingdomCanvas` to `KingdomScene`. Both are currently present in the codebase — this is the integration point that makes Three.js the live host scene.

---

## KingdomScene Visual Quality Pass (D-01 through D-04)

Per the locked decisions, the reveal beat quality is also about the scene being visually compelling when it reacts. Specific findings from reading KingdomScene.jsx:

**D-01 Particles — current:** 40 particles spawning continuously. Fix: reduce `count` to 12, lower spawn probability from `0.15` to `0.04`, adjust `opacity` from `0.5` to `0.3`. No structural change needed.

**D-02 Color rework — current:** Fog color is hardcoded `'#080812'` in FogController. Landmark emissive colors are fixed amber `'#f59e0b'`. For a richer fallen/thriving distinction, the beacon should shift emissive toward cooler blue when courage is low, and the bridge should shift toward red when trust is low (the `collapsed.current` check already does this — it just needs a deeper red: current is `'#ef4444'`, better fallen tone is `'#7f1d1d'`).

**D-03 Building detail — current:** Village cottages are `cylinderGeometry args=[0.5, 0.55, 0.9, 6]` (hexagonal walls). This is already stylized. Chimney smoke as particle emitter on each cottage would require extending the Particles component or a small inline particle system per cottage. Scope risk — may be deferred to a sub-task.

**D-04 Dramatic transitions — addressed by** the `lerpSpeed` mechanism. Raising lerpSpeed to 8 during reveal makes all emissive intensity, spotlight intensity, and rotation speed changes happen in ~0.5s instead of ~2s. The audience will see the bridge flare, beacon sweep faster, village windows pulse.

---

## Environment Availability

Step 2.6: SKIPPED (no new external dependencies — Three.js r183, @react-three/fiber 9.5.0, @react-three/drei 10.7.7, framer-motion 11.18.2 all confirmed installed via npm list. KingdomScene renders in a loaded phase.)

---

## Open Questions

1. **Phase 9 Plan 02 execution order**
   - What we know: Plan 02 (lerp interpolation + threshold events) is not yet executed; Plan 01 is complete.
   - What's unclear: Will Phase 10 planning assume Plan 02 runs first, or will Phase 10 include the lerp speed prop addition?
   - Recommendation: Phase 10 Plan 01 should include the `lerpSpeed` / `lerpSpeedRef` prop addition to KingdomScene as its first task, making it self-contained. If Plan 02 later adds the same prop, it will be a no-op merge.

2. **FogController instant-jump during reveal**
   - What we know: FogController uses `useEffect` (instant assignment), while other landmarks use `useFrame` (lerped).
   - What's unclear: Whether this looks jarring in practice — fog density changes may be gradual enough that instant snapping is fine for the ~0.1 density range in normal gameplay.
   - Recommendation: Add `useFrame`-based fog density lerp in the same plan as `lerpSpeed` prop addition. Low risk, high visual consistency payoff.

3. **Lobby and end view treatment (Claude's Discretion)**
   - Recommendation: Yes, apply minimal HUD treatment to both. Lobby: room code pill (large, centered — already designed well), player count pill, Start button pill. End view: city final state fills screen, framework breakdown as a semi-transparent centered panel. The current end view already uses `position: fixed` canvas + `styles.hud` overlay — it needs the same pill refactor but is lower priority.

4. **KingdomCanvas import in Host.jsx**
   - Host.jsx currently imports `KingdomCanvas` (2D). Phase 10 must switch this to `KingdomScene` (3D).
   - This is the moment Phase 9's Three.js scene becomes the live host view.

---

## Sources

### Primary (HIGH confidence)
- Direct code audit: `src/components/KingdomScene.jsx` — confirmed lerp patterns, landmark component structure, current particle count, fog implementation
- Direct code audit: `src/pages/Host.jsx` — confirmed state shape, prevWorldRef pattern, roundReducer, existing glass panel layout
- Direct code audit: `src/pages/Host.module.css` — confirmed CSS custom properties, glass panel system, existing z-index stacking
- `npm list` output — confirmed framer-motion@11.18.2, three@0.183.2, @react-three/fiber@9.5.0 installed

### Secondary (MEDIUM confidence)
- Framer Motion v11 `AnimatePresence` API — stable API since v10; patterns verified against installed version
- `THREE.MathUtils.lerp` inside R3F `useFrame` — established pattern, confirmed in KingdomScene.jsx at lines 98, 105, 110, 210, 217, 222, 318, 324

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed installed, no new dependencies needed
- Architecture: HIGH — based on direct code audit of existing Host.jsx and KingdomScene.jsx; patterns are extensions of what's already there
- Pitfalls: HIGH — pitfalls are grounded in specific line-number observations from the audit (e.g., FogController useEffect vs useFrame, existing lerpSpeed hardcoding)

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable stack, no fast-moving dependencies)
