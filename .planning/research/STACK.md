# Technology Stack

**Project:** The Crossroads — Multiplayer Ethics Game
**Researched:** 2026-03-25
**Confidence:** MEDIUM (web tools unavailable; conclusions from training data through August 2025, all libraries in stable/mature state with high confidence in recommendations)

---

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

**Route structure:**
```javascript
// App.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/host/:sessionId', element: <Host /> },
  { path: '/play/:sessionId', element: <Play /> },
])
```

**Note:** No server-side rendering needed. `createBrowserRouter` + Netlify/Vercel redirect rule (`/* -> /index.html`) is all that's required.

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React `useState` + `useReducer` + Context | Built-in | Session state, player state, round state | This app has three distinct state domains (session, player, world state) — none of them globally shared across unrelated components. Local component state + Context passed down is sufficient. Adding Zustand or Jotai introduces a dependency for a problem that doesn't exist here. |

**When to use what:**
- `useState`: Choice lock state, timer, local UI
- `useReducer`: Session status machine (lobby → active → round_complete → finished)
- Context: `SessionContext` shared across Host; `PlayerContext` for Play page tree

**What NOT to use:**
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

**For v1, start CSS-only.** The editorial aesthetic (dark, stark, typographic) actually benefits from minimal animation — too much motion undermines the weight of the content.

### UI Components

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| No component library | — | All UI hand-built | The design spec is specific enough ("stark editorial, dark backgrounds, warm amber/gold, serif scenario text, sans-serif UI") that a component library (shadcn, MUI, Chakra) will fight you constantly. Write the 8-10 components you need. Total HTML/CSS for this project is small. |

**CSS approach:** Plain CSS modules (`Component.module.css`) per component. No Tailwind — the class-per-property model harms readability for design-heavy, bespoke work. No styled-components — the CSS-in-JS overhead is unjustified.

**Typography:**
- Scenario text: `Georgia, serif` (system font, no external load needed) or `'Playfair Display'` from Google Fonts (one import, significant upgrade)
- UI chrome: `'Inter'` from Google Fonts or `system-ui` (fast, clean, reliable)

### QR Code (Phase 8)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| qrcode.react | 3.x | Generate QR code from room code | Zero-dependency React component that renders an SVG QR code. One line of JSX. No server needed. |

```jsx
import { QRCodeSVG } from 'qrcode.react'
<QRCodeSVG value={`${window.location.origin}/play/${roomCode}`} size={200} />
```

### Three.js (Phase 6)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Three.js | r128 (CDN) | 3D city scene on host screen | Per CLAUDE.md spec: r128 via CDN. Do NOT use the npm package in this case — CDN keeps Three.js out of the React bundle, which matters because the city only renders on one screen. Load conditionally in CityScene.jsx via a script tag or dynamic import. |

**Caution:** r128 is not current (current is r167+). Use r128 only if the CLAUDE.md CatmullRomCurve3 / instanced geometry patterns were tested against it. If starting fresh, use r160+ via npm and import only what you need — tree-shaking reduces bundle size substantially. This is worth validating before Phase 6.

### Hosting

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Netlify | — | Static hosting | `vite build` → drag dist/ to Netlify dashboard. Add `_redirects` file for SPA routing. Free tier handles 10–25 concurrent users trivially. Vercel works identically — pick one and stay with it. |

**Netlify `_redirects` file (required for React Router):**
```
/* /index.html 200
```
Place in `public/` directory so Vite copies it to `dist/` on build.

---

## Supabase Real-Time Patterns

This is the most critical implementation area — getting channel management wrong causes ghost subscriptions, duplicate events, and memory leaks under presentation conditions.

### Client Initialization

```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Environment variables:** Vite requires `VITE_` prefix. Store in `.env.local` (gitignored). Never use the service role key in the client bundle — it bypasses RLS entirely.

### Channel Subscription Pattern

```javascript
// The correct v2 pattern — channel name must be unique per subscription
useEffect(() => {
  const channelName = `session-${sessionId}` // unique string, not a path

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${sessionId}`,
      },
      (payload) => {
        setSessionState(payload.new)
      }
    )
    .subscribe((status) => {
      // status: 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED'
      if (status === 'CHANNEL_ERROR') {
        console.error('Realtime channel error — consider reconnect logic')
      }
    })

  // Cleanup on unmount or sessionId change
  return () => {
    supabase.removeChannel(channel)
  }
}, [sessionId])
```

**Critical rules:**
1. Always return `() => supabase.removeChannel(channel)` — missing cleanup causes duplicate events on re-render
2. Channel name must be unique per logical subscription — use descriptive names like `session-${id}`, `choices-${id}`, `players-${id}`
3. Do not reuse channel references across components — each component manages its own channel lifecycle
4. The `.subscribe()` callback receives connection status — handle `CHANNEL_ERROR` for presentation resilience

### Multiple Subscriptions (Host.jsx)

Host subscribes to three streams simultaneously: session updates, incoming choices, player joins.

```javascript
// Pattern: three channels, three cleanup functions
useEffect(() => {
  const sessionChannel = supabase
    .channel(`host-session-${sessionId}`)
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` },
      (payload) => setSession(payload.new))
    .subscribe()

  const choicesChannel = supabase
    .channel(`host-choices-${sessionId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'choices', filter: `session_id=eq.${sessionId}` },
      (payload) => setChoices(prev => [...prev, payload.new]))
    .subscribe()

  const playersChannel = supabase
    .channel(`host-players-${sessionId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'players', filter: `session_id=eq.${sessionId}` },
      (payload) => setPlayers(prev => [...prev, payload.new]))
    .subscribe()

  return () => {
    supabase.removeChannel(sessionChannel)
    supabase.removeChannel(choicesChannel)
    supabase.removeChannel(playersChannel)
  }
}, [sessionId])
```

**Note on 20+ concurrent subscriptions:** Supabase free tier supports 200 concurrent realtime connections. With 25 players each subscribing to 1–2 channels + host with 3 channels, peak is ~55 connections — well within limits. No special configuration needed.

### Filter Syntax

Supabase `postgres_changes` filters use PostgREST filter syntax:

```
filter: `id=eq.${uuid}`          // equality
filter: `session_id=eq.${uuid}`  // foreign key equality
filter: `status=in.(lobby,active)` // IN clause
```

Only columns with indexes perform well as filters under load. The schema's `session_id` and `id` columns (primary keys / foreign keys) are indexed by default.

### Optimistic UI for Choice Submission

Players should see immediate lock feedback before the server confirms:

```javascript
async function submitChoice(choiceIndex) {
  // 1. Optimistic: lock UI immediately
  setChoiceLocked(choiceIndex)

  // 2. Persist to Supabase
  const { error } = await supabase
    .from('choices')
    .insert({
      session_id: sessionId,
      player_id: playerId,
      round_number: roundNumber,
      scenario_id: scenarioId,
      choice_index: choiceIndex,
      frameworks: choice.frameworks,
    })

  // 3. Handle failure — unlock and surface error
  if (error) {
    setChoiceLocked(null)
    setError('Failed to submit. Tap to try again.')
  }
}
```

### Querying Initial State

On component mount, fetch current state before subscribing — real-time only delivers changes, not the current snapshot:

```javascript
useEffect(() => {
  async function loadSession() {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (data) setSession(data)
  }

  loadSession()
  // then set up subscription...
}, [sessionId])
```

**Always fetch-then-subscribe.** If the player joins mid-round because they're on a slow network, the subscription alone won't deliver the current session state — it only fires on future changes.

---

## Vite Configuration

```javascript
// vite.config.js — minimal, no surprises
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

No path aliases needed given the project's flat structure. Add `resolve.alias` only if imports become unwieldy. The `@vitejs/plugin-react` plugin uses Babel for Fast Refresh — fine for this project size.

---

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

---

## Installation

```bash
# Bootstrap
npm create vite@latest crossroads -- --template react
cd crossroads
npm install

# Routing
npm install react-router-dom

# Supabase
npm install @supabase/supabase-js

# QR code (Phase 8 only — defer until then)
npm install qrcode.react

# Three.js (Phase 6 — consider npm over CDN for tree-shaking)
npm install three
```

**Dev dependencies (already included by Vite template):**
- `@vitejs/plugin-react` — Fast Refresh
- `vite` — dev server and build

No test framework is listed in the build order. If you want to unit test `detection.js` and `worldState.js` (CLAUDE.md recommends this), add:

```bash
npm install -D vitest
```

Vitest runs inside Vite's module graph — zero configuration, same import aliases, fast. Use it for the two pure-function modules before wiring them to the UI.

---

## Environment Setup

```bash
# .env.local (gitignored — never commit this)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

The anon key is safe to ship in the client bundle because RLS policies enforce access control. The service role key is never used in the client.

---

## Sources

- Training data through August 2025 (MEDIUM confidence)
- CLAUDE.md project spec — stack decisions pre-validated by project author (HIGH confidence for stack constraints)
- Supabase v2 channel API: well-established since 2022, stable through 2025 (HIGH confidence on patterns)
- React Router v6/v7 split: v7 released late 2024 with Remix merger; v6 remains valid for SPAs (HIGH confidence)
- Three.js r128 CDN note: current stable as of 2025 is r167+; r128 specified in CLAUDE.md likely for API stability (MEDIUM confidence — verify CatmullRomCurve3 API hasn't changed before Phase 6)
