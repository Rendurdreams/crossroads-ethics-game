# Technology Stack — Signal Lost v2.0 New Features

**Project:** The Crossroads — Signal Lost v2.0 milestone
**Researched:** 2026-03-30
**Scope:** Stack additions and changes ONLY for new features. Existing validated stack (React 19, Vite 8, Supabase v2, Framer Motion 11, GSAP 3, CSS Modules) is not re-litigated here.

---

## Existing Stack (Do Not Change)

| Technology | Version | Status |
|------------|---------|--------|
| React | 19.2.4 | Locked |
| Vite | 8.0.1 | Locked |
| @supabase/supabase-js | 2.100.0 | Locked |
| framer-motion | 11.18.2 | Locked |
| gsap | 3.14.2 | Locked |
| react-router-dom | 7.13.2 | Locked |
| CSS Modules | native | Locked |

---

## New Feature Analysis

### 1. Senator Profile Assignment System

**What it needs:** Random profile assignment on join, stored per player, per-round stakes text displayed in Play.jsx, profile breakdown in Discussion Mode.

**Stack decision:** No new library. Profiles are static data (6 JSON objects with per-round stakes). Store `profile_id` as a text column on the `players` table. Assignment logic is a 3-line `Math.random()` call.

**Schema change:**
```sql
ALTER TABLE players ADD COLUMN profile_id text;  -- 'A' through 'F'
```

**Integration:** Assign at join time in Play.jsx (or Landing.jsx), write to Supabase with the player insert. Retrieve on mount from `player.profile_id`. No new dependency.

**Classroom distribution (no duplicates):** The spec pseudocode `assignClassroomProfiles()` requires knowing the current player count in the session before assigning. Pattern: fetch existing player profile_ids for session, pick the least-used profile. Pure JS, no library.

---

### 2. Discussion Mode — Facilitator Controls

**What it needs:** A mode flag on sessions, pause screen after each round (host-controlled), profile breakdown grid, discussion prompt display, conflict spotlight, custom prompt input, facilitator timer.

**Stack decision:** No new library. Discussion mode adds a new `Host` view state and a new `DiscussionPause.jsx` component. The mode flag lives in the session row.

**Schema change:**
```sql
ALTER TABLE sessions ADD COLUMN mode text DEFAULT 'solo';  -- 'solo' | 'discussion'
ALTER TABLE sessions ADD COLUMN discussion_paused boolean DEFAULT false;
```

**How it works:**
- `mode` is set at session creation (HostSetup or Create page)
- After host closes a round, if `mode = 'discussion'`, set `discussion_paused = true` on the session row
- Play.jsx already subscribes to session updates — the pause flag causes a "waiting" state on player phones
- Host sees DiscussionPause screen; clicking "Continue" sets `discussion_paused = false`, players unblock
- Profile breakdown grid reads `choices` table grouped by `profile_id` — standard Supabase query, no new pattern
- Custom prompt: local state in Host.jsx, never persisted (facilitator use only, ephemeral)
- Facilitator discussion timer: reuse the existing broadcast channel timer pattern already validated in v1.2

**Integration point:** The existing `roundReducer` in Host.jsx gains a `DISCUSSION_PAUSE` / `DISCUSSION_RESUME` action. The existing Supabase session subscription in Play.jsx reads the new `discussion_paused` column.

---

### 3. Walk Mechanic — Signal Lost Corridor Version (R6)

**What it needs:** Avatar positioned in a corridor, movement toward or away from a terminal 30m down the hall, midpoint (0.5) triggers "forward" decision, stopping at 0.85–0.99 for 3s triggers "conditional notice" (Choice III).

**What already exists:** `WalkMechanic.jsx` is a button-based zone selector (left/right/middle buttons). It correctly implements the concept for the Kingdom Arc (Free Irel / Walk away / Commission scholars) but uses click targets, not positional movement.

**Stack decision:** Upgrade `WalkMechanic.jsx` to support a positional corridor mode for Signal Lost. Use **Framer Motion's `drag` prop** — already in the bundle, zero additional install cost. Framer Motion `drag="x"` with `dragConstraints` gives pointer/touch drag with position callbacks.

**Why Framer Motion drag over raw pointer events:** The app already imports Framer Motion for every page transition. `motion.div drag="x"` handles both mouse and touch with a single API and includes momentum/spring damping that makes the corridor feel physical. Raw pointer event math is 40+ lines; Framer Motion's `onDrag` + `useMotionValue` is 15 lines.

**Why NOT react-draggable:** Additional dependency (5.3KB gzipped) for a capability already covered by Framer Motion.

**Implementation pattern:**
```javascript
import { motion, useMotionValue, useTransform } from 'framer-motion'

// avatarX is 0 (start) to corridorWidth (terminal)
const x = useMotionValue(0)

// Map pixel position to 0-1 progress
const progress = useTransform(x, [0, corridorWidth], [0, 1])

// Midpoint crossing: subscribe to progress changes
progress.on('change', v => {
  if (v >= 0.5 && choice === null) lockChoice('I')  // crossed midpoint
})

// Choice III: stop-and-wait at 0.85-0.99 for 3s
// Handled by onDragEnd + setTimeout
```

**No new library needed.** Framer Motion 11 is already installed and React 19-compatible.

---

### 4. Break Flags — Persistent World State Markers

**What it needs:** Per-round permanent markers (boolean flags) that survive round transitions, appear on the map visualization, feed into R8 scribe record, and display in the Solo Mode reflection screen.

**Stack decision:** No new library. Break flags are a `jsonb` column on the `sessions` table.

**Schema change:**
```sql
ALTER TABLE sessions ADD COLUMN break_flags jsonb DEFAULT '{}';
-- Example value: { "R1-ghost": true, "R4-sealed": true }
```

**Update pattern:** When host closes a round and the winning/selected choice triggers a break flag, the host performs a partial update:

```javascript
// Fetch current flags, merge, update
const { data: session } = await supabase
  .from('sessions')
  .select('break_flags')
  .eq('id', sessionId)
  .single()

const updatedFlags = { ...session.break_flags, [flagKey]: true }
await supabase.from('sessions').update({ break_flags: updatedFlags }).eq('id', sessionId)
```

Note: Supabase REST API does not support partial JSONB field updates natively — fetch-merge-write is the correct pattern. For a game with 8 rounds and 7 possible flags, this is not a race condition risk (host is the only writer of `break_flags`).

**Visual rendering:** Break flag icons render in the map component (existing `AnimatedMap.jsx` or a new `SignalLostMap.jsx`). Flag state flows through the existing `worldState` prop channel. No new animation library needed — CSS class toggling on flag icons is sufficient. The "permanent crack" fracture animation on axis-at-zero uses GSAP (already installed).

---

### 5. Axis System Change — CT / HD / SOL / ACC (starting at 65)

**What it needs:** Replace the current 4 axes (trust/courage/solidarity/awareness, starting at 50) with Signal Lost axes (Civil Trust / Human Dignity / Solidarity / Accountability, starting at 65). The axis history needs to be stored per-round for the Solo Mode timeline graph.

**Stack decision:** No new library for state management. The existing `applyChoicesToWorld()` in `worldState.js` is refactored (new key names, new starting values). The axis history array (`axisHistory`) is added as a new column.

**Schema changes:**
```sql
-- Add axis history for Solo Mode timeline graph
ALTER TABLE sessions ADD COLUMN axis_history jsonb DEFAULT '[]';
-- Each element: { round: 1, CT: 65, HD: 72, SOL: 58, ACC: 71 }
```

**Important — backward compatibility:** The existing packs (kingdom-arc, real-world-modern, futures) use `{ trust, courage, solidarity, awareness }`. Signal Lost uses `{ CT, HD, SOL, ACC }`.

**Recommendation: Pack-level axis set flag.** Add `axisSet: 'signal-lost'` to the Signal Lost pack definition. `worldState.js` reads `pack.axisSet` and dispatches to the correct computation. Existing packs default to `axisSet: 'kingdom'` and continue working unchanged. This avoids migrating all existing packs mid-development.

The `world_state` column is already `jsonb` — it holds whatever keys the pack uses. No column type change needed. Only the `DEFAULT` value changes for new Signal Lost sessions (written at session creation time with the pack's starting values, not via `ALTER TABLE`).

---

### 6. Solo Mode — Axis Timeline Graph

**What it needs:** A multi-line chart showing all 4 axis values across 8 rounds. Displayed on the post-game reflection screen (Solo Mode) and optionally in the grading export.

**Library decision: Recharts 2.15.x**

**Why Recharts:**
- Lightest React-native SVG chart library (builds on D3 submodules only, not full D3)
- React 19 compatible in 2.15.x — no peer dep override needed (confirmed: GitHub issue #4558 resolved in 2.15.x)
- `LineChart` with 4 `Line` components maps directly to the 4 axes
- Composable: `XAxis`, `YAxis`, `Tooltip`, `Legend` are all optional React children
- Bundle cost: ~105KB gzipped — acceptable for a one-screen use
- The alternative (hand-rolled SVG) would be 80+ lines of coordinate math for a non-critical UI element

**Why not Victory, Nivo, or Chart.js:**
- Victory: 400KB+ gzipped, significant overkill
- Nivo: 800KB+, SSR-focused, not appropriate here
- react-chartjs-2: Canvas-based (not SVG), harder to style for dark editorial aesthetic, separate Chart.js dependency

**Version to install:** `recharts@^2.15.0` — not v3.x. Recharts v3 is in active development with API changes as of early 2026; v2.15 is stable production-ready.

**React 19 note:** If a peer dependency warning appears at install, add to `package.json`:
```json
"overrides": {
  "react-is": "^19.0.0"
}
```

**Installation:**
```bash
npm install recharts@^2.15.0
```

---

### 7. Grading Rubric Display + Assessment Export

**What it needs:** Instructor-facing rubric display (static, 4 dimensions / 100pts), and a downloadable assessment summary for Solo Mode (JSON + optional PDF containing player record, choices, reflection text, and scribe pattern).

**Stack decision for JSON export:** No library. `JSON.stringify` + a `<a download>` blob URL. 5 lines of code.

**Stack decision for PDF export: @react-pdf/renderer 4.3.x**

**Why @react-pdf/renderer:**
- React 19 supported since v4.1.0 (current is 4.3.2 — confirmed from npm)
- Generates vector PDF with proper text — not a canvas screenshot
- This is critical for an academic grading document; pixel-capture output prints poorly
- Define PDF as React components using `<Document>`, `<Page>`, `<Text>`, `<View>` — familiar mental model
- `PDFDownloadLink` triggers browser download with no server required
- Produces clean, printable output appropriate for instructor submission

**Why not html2canvas + jsPDF or react-to-pdf:**
- Both use pixel capture — text becomes a rasterized bitmap
- Result is visually acceptable on screen but prints with low quality
- For instructor grading documentation, vector text is the correct standard

**Bundle cost:** @react-pdf/renderer is ~340KB gzipped. This is significant but acceptable because:
1. It only loads when user reaches the export action (lazy import via `React.lazy`)
2. Solo Mode assessment export is not a live classroom flow — no latency pressure
3. Discussion Mode (the classroom presentation path) never touches this code path

**Lazy loading pattern:**
```javascript
// In SoloReflection.jsx — only import when user reaches end screen
const AssessmentPDF = React.lazy(() => import('../components/AssessmentPDF.jsx'))
```

**Installation:**
```bash
npm install @react-pdf/renderer@^4.3.0
```

**Rubric display component:** `GradingRubric.jsx` — pure CSS, no library. Static 4-section table with score ranges. Accessible via a host-only or instructor-only route (e.g., `/rubric`). No auth required for classroom context.

---

### 8. Profile-Aware Conflict Alerts

**What it needs:** A between-round flag that fires when a player's choice contradicts their baseline survey answer (already implemented) OR contradicts their Senator profile's implied stance (new). The existing `findMoralConflicts()` in `detection.js` extends to include profile-aware triggers.

**Stack decision:** No new library. This is pure logic extending `detection.js` or a new `src/lib/senatorConflicts.js`. The alert display is a variant of the existing consequence reveal UI. CSS Modules only.

---

## Summary — What to Install

Two packages. Everything else uses the existing stack.

| Package | Version | Purpose | Install |
|---------|---------|---------|---------|
| `recharts` | `^2.15.0` | Axis timeline chart in Solo Mode reflection screen | `npm install recharts@^2.15.0` |
| `@react-pdf/renderer` | `^4.3.0` | Assessment export PDF for grading rubric | `npm install @react-pdf/renderer@^4.3.0` |

---

## Schema Changes Summary

All additive (ALTER TABLE ADD COLUMN). No existing columns are modified or dropped.

```sql
-- Senator profile assignment
ALTER TABLE players ADD COLUMN profile_id text;

-- Discussion mode controls
ALTER TABLE sessions ADD COLUMN mode text DEFAULT 'solo';
ALTER TABLE sessions ADD COLUMN discussion_paused boolean DEFAULT false;

-- Break flags (permanent world state markers)
ALTER TABLE sessions ADD COLUMN break_flags jsonb DEFAULT '{}';

-- Axis history for Solo Mode timeline
ALTER TABLE sessions ADD COLUMN axis_history jsonb DEFAULT '[]';
```

Note on `world_state`: The column is already `jsonb`. Signal Lost sessions are written with `{ CT: 65, HD: 65, SOL: 65, ACC: 65 }` at session creation. No ALTER TABLE needed — the default value is set programmatically, not at the column level.

---

## New Source Files

No library additions required for these.

```
src/lib/scenarios/packs/signal-lost.js      -- 8 rounds with CT/HD/SOL/ACC deltas, break flag triggers, per-round stakes refs
src/lib/profiles.js                          -- 6 senator profiles, variables, per-round stakes text
src/lib/senatorConflicts.js                  -- profile-aware conflict detection
src/lib/breakFlags.js                        -- flag definitions, trigger conditions, R8 citation text
src/components/SenatorProfile.jsx            -- player profile card + current-round stake panel
src/components/DiscussionPause.jsx           -- facilitator pause screen (profile breakdown, prompts, conflict spotlight)
src/components/BreakFlagMarker.jsx           -- persistent flag icon for map layer
src/components/AxisTimeline.jsx              -- Recharts LineChart wrapper (4 axes, 8 rounds)
src/components/AssessmentPDF.jsx             -- @react-pdf/renderer document for download
src/components/GradingRubric.jsx             -- static rubric display, instructor-facing
src/components/ConflictAlert.jsx             -- between-round alert for baseline/profile contradictions
```

---

## What NOT to Add

| Rejected Addition | Why |
|------------------|-----|
| Zustand / Redux | Profile is a single field on player row; Supabase + localStorage is sufficient |
| react-draggable | Framer Motion `drag` prop covers the walk mechanic; redundant dependency |
| D3 directly | Recharts wraps the D3 submodules needed; full D3 adds ~500KB for no gain |
| Socket.io / Pusher | Supabase Realtime handles 25 concurrent connections reliably (v1.2 validated) |
| TypeScript | Explicitly excluded in CLAUDE.md constraints |
| Tailwind CSS | Incompatible with existing CSS Modules editorial pattern |
| shadcn/ui | Requires Tailwind; would fight the bespoke dark aesthetic |
| Three.js city scene | Deferred indefinitely per PROJECT.md key decisions |
| Victory / Nivo / Chart.js | 4-8x larger than Recharts for equivalent line chart output |
| html2canvas + jsPDF | Pixel-capture output — wrong tool for an academic grading document |

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| Framer Motion drag for walk mechanic | HIGH | Already in bundle; `drag` prop + `useMotionValue` documented and React 19-compatible |
| Recharts 2.15.x React 19 compat | HIGH | GitHub issue #4558 confirmed resolved in 2.15.x |
| @react-pdf/renderer React 19 compat | HIGH | GitHub issue #2935 confirmed supported since v4.1.0; current 4.3.2 |
| Supabase JSONB fetch-merge-write | HIGH | Documented Supabase limitation; single writer removes race condition risk |
| Schema additive-only approach | HIGH | All ALTER TABLE ADD COLUMN — no destructive migrations |
| Lazy import for PDF library | HIGH | React.lazy + Suspense is standard React 18/19 pattern; Vite handles dynamic imports |
| Pack-level axis set flag | MEDIUM | Design decision not yet in code; requires `axisSet` field in pack schema and conditional dispatch in worldState.js |

---

## Sources

- Recharts React 19 compatibility: [GitHub Issue #4558](https://github.com/recharts/recharts/issues/4558)
- @react-pdf/renderer React 19 support: [GitHub Issue #2935](https://github.com/diegomura/react-pdf/issues/2935)
- Framer Motion drag API: [motion.dev/docs/react-drag](https://motion.dev/docs/react-drag)
- Supabase JSONB partial update limitation: [Discussion #14174](https://github.com/orgs/supabase/discussions/14174)
- Supabase Realtime Broadcast docs: [supabase.com/docs/guides/realtime/broadcast](https://supabase.com/docs/guides/realtime/broadcast)
- CLAUDE.md project spec — stack constraints (HIGH confidence)
- PROJECT.md milestone context — existing validated capabilities (HIGH confidence)
