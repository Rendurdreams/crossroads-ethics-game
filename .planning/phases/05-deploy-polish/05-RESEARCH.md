# Phase 5: Deploy + Polish — Research

**Researched:** 2026-03-25
**Domain:** Netlify deployment, qrcode.react integration, mobile CSS audit, Supabase load testing
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Deployment**
- D-01: Target is Netlify. Deploy by dragging `dist/` to the Netlify dashboard (or using Netlify CLI). No Vercel, no other provider.
- D-02: SPA routing is already handled — `public/_redirects` contains `/* /index.html 200`. No additional config needed.
- D-03: Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are set manually in Netlify dashboard → Site settings → Environment variables. They are NOT committed to the repo. The `.env.example` in the repo already documents them.
- D-04: After setting env vars in Netlify dashboard, trigger a redeploy (or redrag dist/ built with those vars) to pick them up. The `.env.local` contains the production Supabase URL — `vite build` will embed it at build time.

**QR Code**
- D-05: Add `qrcode.react` to the host lobby (HostSetup.jsx). The QR code appears below the room code display.
- D-06: The QR code encodes the join URL with code pre-filled: `https://{deployed-domain}/?code={roomCode}`.
- D-07: Landing.jsx must be updated to read the `?code=` query parameter on mount and pre-fill the room code input field. Use `new URLSearchParams(window.location.search).get('code')` (no router dependency needed — plain Web API).
- D-08: QR code sizing: 180×180px. Dark background, light foreground (`bgColor="#12121e"`, `fgColor="#f5f0e8"`). Use the `value` prop of `<QRCodeSVG />` from `qrcode.react`.
- D-09: QR code is only shown on the HostSetup page (room code + roster lobby), not on the active round view or end view.

**Mobile Audit**
- D-10: Audit scope is player-facing pages only: `Landing.jsx`, `Play.jsx`, `FrameworkProfile.jsx`. `Host.jsx` is desktop-only by design.
- D-11: Pass criteria: no horizontal scroll, all buttons reachable with thumbs, scenario text readable without zooming. Test against 390px viewport (iPhone 14 baseline).
- D-12: Fix violations found during audit. Do not pursue aesthetic polish beyond the POLISH-01 bar.
- D-13: Fix the page title: `index.html` title should be `"The Crossroads"`. Add `<meta name="description" content="A multiplayer ethics game for the classroom.">`. No Open Graph tags needed for v1.

**Load Test**
- D-14: Load test method is a manual Node.js script using the Supabase JS client that opens 25 simultaneous real-time subscriptions to the same session and monitors for dropped events.
- D-15: Pass criteria: all 25 subscription channels receive every INSERT event within 2 seconds of it being written. A single dropped event is a failure.
- D-16: The load test script lives at `scripts/load-test.js` in the repo root. Not part of the Vite build — standalone Node script requiring `@supabase/supabase-js`.

### Claude's Discretion
- Exact QR code colors — match the dark editorial aesthetic (dark bg, light foreground), within that constraint Claude chooses the exact hex values
- Mobile audit: specific CSS fixes applied — Claude audits and fixes what it finds within POLISH-01 scope, no need to enumerate every possible fix in advance

### Deferred Ideas (OUT OF SCOPE)
- Aesthetic polish beyond POLISH-01 bar (font refinements, spacing rhythm, etc.) — v2
- Open Graph tags — not needed for v1
- Netlify CLI automation — manual drag-and-drop is the specified approach

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-05 | App deploys to Netlify from `vite build` output | Netlify SPA deployment pattern; `_redirects` already correct; env var injection at build time via `.env.local`; `vite build` produces `dist/` ready to drag |
| POLISH-01 | Player view fully usable on a phone — no horizontal scroll, all buttons reachable with thumbs, scenario text readable without zooming | CSS audit findings documented below; critical gaps identified in `index.css` (missing `color-scheme`, `overscroll-behavior`, global reduced-motion) |
| POLISH-02 | Load test passes — 20+ simultaneous Supabase real-time subscriptions without dropped events or lag | Supabase channel concurrency patterns documented; Node.js test script architecture defined |

</phase_requirements>

---

## Summary

Phase 5 is an infrastructure and hardening phase. All game features are complete. The work breaks into four independent workstreams: (1) deploy to Netlify, (2) add QR code to HostSetup, (3) mobile audit of player pages, (4) load test script. None of these depend on each other at the code level and can be executed in any order.

The codebase is in a clean state. `public/_redirects` already contains the correct SPA redirect rule. `.env.local` contains the production Supabase URL. `vite build` will embed those values at build time. The main Netlify work is creating the site in the dashboard, setting the two env vars, and uploading `dist/`.

The QR code is a one-import, one-component addition. The `qrcode.react` package is currently at v4.2.0 on npm (CLAUDE.md specifies "3.x"). The `QRCodeSVG` named-import API is stable across v3 and v4 — the same `value`, `size`, `bgColor`, `fgColor` props work in both. Installing `qrcode.react` without a version pin will get v4; install `qrcode.react@3` to match CLAUDE.md spec. Either works. The plan should specify `@3` to stay aligned with the documented stack.

The mobile audit reveals several genuine gaps in the current CSS: `color-scheme: dark` is missing from `:root` (causes browser chrome artifacts on iOS), `overscroll-behavior: contain` is missing from scrollable Play.jsx containers, and the global `@media (prefers-reduced-motion)` rule is absent from `index.css` (individual components have it but the global guard is missing). The `Landing.jsx` Join button copy says "Join" — the UI-SPEC contract specifies "Join Game". This is a copywriting correction, not aesthetic polish, and falls within POLISH-01 scope.

The load test script requires only `@supabase/supabase-js` (already in dependencies) and runs as a plain Node.js ESM script. No additional packages needed.

**Primary recommendation:** Execute the four workstreams in order — deploy first to get the public URL needed for the QR code `value` prop, then add QR code, then mobile audit, then load test.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| qrcode.react | 3.x (pin `@3`) | QRCodeSVG component for HostSetup | Zero dependencies, pure SVG output, React component. v3 specified in CLAUDE.md. v4.2.0 is latest but v3 API is identical for this use case. |
| @supabase/supabase-js | 2.100.0 (already installed) | Supabase client for load test script | Already in `package.json` — no additional install needed |
| Node.js | 20.19.4 (already present) | Runtime for load test script | Already available on machine |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Netlify CLI | optional | Alternative to drag-and-drop deploy | Only if drag-and-drop proves inconvenient for repeated deploys. D-01 specifies drag-and-drop as the primary method. Not required for v1. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| qrcode.react@3 | qrcode.react@4 | v4 is current; only breaking change affecting this project is removal of deprecated default export (not used here — named `QRCodeSVG` import is correct). Either works. Stay on @3 to match CLAUDE.md. |
| Manual drag-and-drop deploy | Netlify CLI `netlify deploy --prod --dir=dist` | CLI is more repeatable but adds a dev dependency. Not specified. Drag-and-drop is fine for a single presentation. |

### Installation

```bash
npm install qrcode.react@3
```

### Version Verification

```
qrcode.react latest v3: 3.2.0 (verified via npm registry 2026-03-25)
qrcode.react latest v4: 4.2.0 (latest overall)
```

---

## Architecture Patterns

### Pattern 1: Netlify SPA Deployment

**What:** Build with Vite, upload `dist/` to Netlify dashboard. `_redirects` file in `public/` gets copied into `dist/` by Vite and tells Netlify to serve `index.html` for all routes.

**Current state:** `public/_redirects` already contains `/* /index.html 200`. No changes needed to this file.

**Build sequence:**
```bash
# 1. Ensure .env.local has production values (already confirmed present)
# 2. Run build — embeds env vars at compile time
npm run build
# 3. Drag dist/ folder to Netlify dashboard
# 4. In Netlify: Site Settings → Environment Variables → add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
# 5. Redeploy to pick up env vars (trigger via Netlify dashboard "Trigger deploy")
```

**CRITICAL NOTE on env var embedding:** Vite embeds `VITE_*` variables at build time from the local `.env.local`. If you set env vars in the Netlify dashboard AFTER the first build, the already-built `dist/` does not pick them up — you must rebuild and re-upload. The correct sequence is: set env vars in Netlify dashboard first, then `npm run build` locally with `.env.local` pointing to production, then upload `dist/`.

Since `.env.local` already contains the production Supabase URL, the initial `npm run build` will produce a production-ready bundle. Setting env vars in Netlify dashboard provides a paper trail but does NOT affect the already-built static bundle — the bundle has the values baked in from build time.

### Pattern 2: QRCodeSVG Integration

**What:** Named import from `qrcode.react`, rendered inside `HostSetup.jsx` after the room code display element.

**Current HostSetup structure:** The component already has `session.room_code` available in state. The QR code needs the deployed domain, which is hardcoded at deploy time (not runtime-configurable without an env var).

**Options for the domain in the QR code URL:**
- Hardcode the Netlify URL after first deploy — simple, works for v1
- Use `window.location.origin` at runtime — automatically correct regardless of domain, no hardcoding needed

Use `window.location.origin` — it requires no changes when the domain changes and works correctly in both dev (localhost) and production (netlify domain).

```jsx
// Source: qrcode.react official README + Context7 pattern
import { QRCodeSVG } from 'qrcode.react'

// Inside HostSetup render, after the room code display:
const joinUrl = `${window.location.origin}/?code=${session.room_code}`

<QRCodeSVG
  value={joinUrl}
  size={180}
  bgColor="#12121e"
  fgColor="#f5f0e8"
/>
<p className={styles.qrInstruction}>Scan to join on your phone</p>
```

### Pattern 3: URL Query Param Pre-fill (Landing.jsx)

**What:** On mount, read `?code=` from `window.location.search` and pre-fill the room code input.

**Current Landing.jsx state:** `const [code, setCode] = useState('')` — the initial value is a plain empty string. No useEffect runs on mount to check URL params.

**Implementation:** Add a single `useState` initializer using the Web API (no router dependency):

```javascript
// Source: MDN Web API — window.location.search
const [code, setCode] = useState(() => {
  const params = new URLSearchParams(window.location.search)
  return params.get('code') ?? ''
})
```

This lazy initializer runs once on mount. If `?code=7423` is in the URL, the input starts pre-filled. The existing `onChange` handler and validation (`code.length === 4`) work unchanged.

**Note:** The Join button copy in Landing.jsx currently reads `'Join'`. UI-SPEC D-11 specifies `"Join Game"`. This is a copywriting correction within POLISH-01 scope.

### Pattern 4: Load Test Script Architecture

**What:** A standalone Node.js ESM script that creates a Supabase session, opens 25 real-time channels, inserts test choice rows, and asserts all channels received all events.

**Key architectural decision:** The script must run as ESM (the project uses `"type": "module"` in `package.json`). Node.js 20 supports top-level await in ESM modules natively. The script can import `@supabase/supabase-js` directly from `node_modules`.

**Event tracking approach:** Each channel resolves a Promise when it receives the INSERT event. `Promise.all()` with a 2-second timeout races against all 25 resolution promises. Channels that haven't resolved by 2000ms are counted as failures.

```javascript
// scripts/load-test.js — architecture skeleton
// Source: Supabase JS v2 channel API, Node.js 20 ESM top-level await

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const CHANNEL_COUNT = 25
const EVENT_COUNT = 10
const TIMEOUT_MS = 2000

// Create session, open channels, insert events, assert receipt
// Full implementation in plan
```

**Environment variable strategy for load test:** The script should NOT read from `.env.local` directly (that requires a dotenv loader). Instead, run the script with inline env vars:

```bash
SUPABASE_URL=https://... SUPABASE_ANON_KEY=... node scripts/load-test.js
```

Or document in the script header that the user should set these before running.

### Anti-Patterns to Avoid

- **Committing `.env.local`:** The file exists and is presumably gitignored. Never commit it. The Netlify env var dashboard entry is the documented production credential store.
- **Using the default export from qrcode.react:** The default export is deprecated in v3 and removed in v4. Always import `{ QRCodeSVG }` as a named export.
- **Runtime env var reads for QR URL:** Attempting `import.meta.env.VITE_SOME_DOMAIN` for the QR code URL requires a separate env var. Use `window.location.origin` instead — it's free and always correct.
- **Fetching URLSearchParams in a useEffect:** The URL params on the join page do not change after mount. Reading them in a `useState` lazy initializer is cleaner than a `useEffect` + `setState`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| QR code generation | Manual SVG QR code renderer | `qrcode.react` `<QRCodeSVG>` | QR encoding is a complex spec with error correction levels, data encoding modes, and finder patterns. One import, one JSX element. |
| Load test timing | Manual `setTimeout` + counters | `Promise.race()` with a deadline + array of per-channel Promises | Pattern is cleaner and more accurate than setTimeout-based polling |

---

## Mobile Audit Findings

Pre-audit of existing CSS files reveals the following gaps against the POLISH-01 and UI-SPEC pass criteria:

### Confirmed Gaps (found in code review)

| Gap | File | Current State | Fix Required |
|-----|------|--------------|--------------|
| `color-scheme: dark` missing from `:root` | `src/index.css` | Not set | Add `color-scheme: dark` to `:root` block |
| Global `@media (prefers-reduced-motion)` guard absent | `src/index.css` | Not present at global level (individual component CSS has per-component rules) | Add global rule to `index.css` |
| `overscroll-behavior: contain` not on Play.jsx scrollable containers | `Play.module.css` | Not set anywhere | Add to `.gameContent` or the page-level scroll container |
| Join button copy mismatch | `Landing.jsx` | Button says `'Join'` | UI-SPEC specifies `"Join Game"` — update copy |
| Page title | `index.html` | `"crossroads-tmp"` | Change to `"The Crossroads"` |
| Meta description | `index.html` | Not present | Add `<meta name="description" content="A multiplayer ethics game for the classroom.">` |
| `cursor: pointer` on choice buttons | `ScenarioCard.module.css` | `.choiceBtn` has `cursor: pointer` — PASS | No fix needed |
| Input `font-size` zoom guard | `Landing.module.css` | `.input` uses `font-size: 1rem` (= 16px) — PASS | No fix needed |
| Reflection textarea `font-size` | `Play.module.css` | `.reflectionTextarea` uses `font-size: 16px` — PASS | No fix needed |
| Choice button `min-height: 44px` | `ScenarioCard.module.css` | `.choiceBtn` has `min-height: 44px` — PASS | No fix needed |
| Reflection submit `min-height: 44px` | `Play.module.css` | `.reflectionSubmitBtn` has `min-height: 44px` — PASS | No fix needed |
| Buttons `width: 100%` | `Landing.module.css`, `ScenarioCard.module.css` | Both set — PASS | No fix needed |
| Focus rings | `Landing.module.css` | `.input:focus` uses `outline: 2px solid var(--accent)` — PASS | Verify buttons also have `:focus-visible` ring |
| Error state text + color | `Landing.module.css`, `Play.module.css` | Both use text message + `var(--danger)` — PASS | No fix needed |
| `box-sizing: border-box` | `src/index.css` | Global `*, *::before, *::after { box-sizing: border-box }` — PASS | No fix needed |

### Items Requiring Runtime Verification (cannot assess from CSS alone)

| Item | What to Check | How |
|------|--------------|-----|
| No horizontal scroll at 390px | No element overflows viewport width | Browser DevTools → responsive mode → 390px wide |
| Thumbs can reach all buttons | No interactive element in top 20px dead zone | Manual check at 390px |
| `.gameContent` bottom padding | Safe area buffer for home indicator (iPhone) | Check padding-bottom ≥ 48px on deep scroll states |
| `:focus-visible` on button elements | buttons (`.btn`, `.choiceBtn`, `.reflectionSubmitBtn`) have visible focus ring | Tab through with keyboard in browser |

---

## Common Pitfalls

### Pitfall 1: Vite Env Var Build-Time Embedding Confusion

**What goes wrong:** Developer sets `VITE_SUPABASE_URL` in Netlify dashboard, deploys the same `dist/` bundle, and wonders why the app still uses the wrong URL or shows connection errors.

**Why it happens:** Vite replaces `import.meta.env.VITE_*` at **build time** with literal string values read from `.env.local`. The Netlify dashboard env vars are for CI/CD builds (e.g., when Netlify rebuilds from a connected Git repo). For a manual drag-and-drop deploy, the bundle already has the values baked in from the local build. Netlify dashboard env vars have zero effect on a pre-built bundle.

**How to avoid:** Build locally with the production `.env.local` already present (it is). Upload the resulting `dist/`. The Netlify env var dashboard entries are documentation/backup for if/when the project moves to Git-triggered CI builds.

**Warning signs:** App connects to wrong Supabase project, or `import.meta.env.VITE_SUPABASE_URL` is `undefined` in production.

### Pitfall 2: Supabase Real-Time Subscription Silent Failure

**What goes wrong:** Load test opens 25 channels but some channels never receive events — not because of Supabase limits, but because the client was garbage-collected or the channel was closed before events arrived.

**Why it happens:** If the channel subscription setup is async and the test script exits before all channels are subscribed, some channels may not be fully active when events are written.

**How to avoid:** Wait for all channels to reach `SUBSCRIBED` status before writing test events. The Supabase JS v2 client exposes a callback on `.subscribe()`:

```javascript
channel.subscribe((status) => {
  if (status === 'SUBSCRIBED') {
    // channel is ready
  }
})
```

Collect all 25 SUBSCRIBED callbacks before inserting test rows.

**Warning signs:** Test shows fewer than 25 channels receiving events, or receives events only on channels opened first.

### Pitfall 3: qrcode.react Default Export

**What goes wrong:** `import QRCode from 'qrcode.react'` works in v3 (deprecated) and throws in v4.

**Why it happens:** v3 preserved the default export with a deprecation warning. v4 removed it.

**How to avoid:** Always use `import { QRCodeSVG } from 'qrcode.react'`. This is the correct import for both v3 and v4.

**Warning signs:** Build error in v4: `'qrcode.react' does not provide an export named 'default'`.

### Pitfall 4: QR Code URL Uses localhost in Production

**What goes wrong:** QR code scanned by phone classmates resolves to `http://localhost:5173/?code=7423` — which is Jay's dev machine, not accessible to phones on the classroom network.

**Why it happens:** If the `joinUrl` is constructed from a hardcoded `localhost` string or from `window.location.origin` during a dev build, phones can't reach it.

**How to avoid:** Use `window.location.origin` in the component — it reads the actual hostname at runtime. When HostSetup is served from the Netlify URL, `window.location.origin` will be `https://the-crossroads.netlify.app` (or whatever the domain is). In dev, it will be `http://localhost:5173` — which is expected behavior for local testing.

**Warning signs:** Phones scan QR code and get a connection refused or localhost error.

### Pitfall 5: iOS Safari Tap Target in Top Dead Zone

**What goes wrong:** On iPhone, the top ~20px of the viewport is a dead zone where touches are intercepted by the browser chrome and don't register as taps.

**Why it happens:** iOS Safari reserves the top area for its own gesture handling.

**How to avoid:** Verify no interactive element has `position: fixed` or absolute positioning that places it near the top of the screen. The current Play.jsx layout uses `flexbox centering` — verify that on short-content states (lobby waiting view), the flex container's first interactive element is not pushed to the very top.

---

## Code Examples

### QRCodeSVG — Minimal Correct Usage

```jsx
// Source: qrcode.react official README (github.com/zpao/qrcode.react)
import { QRCodeSVG } from 'qrcode.react'

function QRDisplay({ roomCode }) {
  const joinUrl = `${window.location.origin}/?code=${roomCode}`
  return (
    <QRCodeSVG
      value={joinUrl}
      size={180}
      bgColor="#12121e"
      fgColor="#f5f0e8"
    />
  )
}
```

### URL Query Param Pre-fill — Lazy Initializer

```javascript
// Source: MDN URLSearchParams Web API
// In Landing.jsx — replaces: const [code, setCode] = useState('')
const [code, setCode] = useState(() => {
  const params = new URLSearchParams(window.location.search)
  return params.get('code') ?? ''
})
```

### Global Reduced Motion Guard

```css
/* Source: WCAG 2.1 technique + UI-SPEC Animation Contract */
/* Add to src/index.css — after existing :root and body blocks */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### color-scheme Declaration

```css
/* Source: MDN color-scheme property — prevents iOS browser chrome flash */
/* Add to existing :root block in src/index.css */
:root {
  /* ... existing vars ... */
  color-scheme: dark;
}
```

### Load Test Script — Event Tracking Pattern

```javascript
// Source: Supabase JS v2 real-time API + Node.js 20 ESM top-level await
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const CHANNEL_COUNT = 25
const TIMEOUT_MS = 2000

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Each channel tracks how many events it received
const received = new Array(CHANNEL_COUNT).fill(0)
const channels = []

// Wait for all channels to reach SUBSCRIBED before writing events
const subReady = await Promise.all(
  Array.from({ length: CHANNEL_COUNT }, (_, i) =>
    new Promise((resolve) => {
      const ch = supabase
        .channel(`load-test-${i}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'choices', filter: `session_id=eq.${sessionId}` },
          () => { received[i]++ }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') resolve()
        })
      channels.push(ch)
    })
  )
)

// Insert N test events and wait TIMEOUT_MS for delivery
// ... (see plan for full implementation)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| qrcode.react default export | Named exports `{ QRCodeSVG, QRCodeCanvas }` | v3 (deprecated) → v4 (removed) | Must use named import. v3 default still works but shows deprecation warning. |
| Netlify `netlify.toml` for SPA routing | `public/_redirects` file | Netlify now prefers `_redirects` for static sites | `_redirects` is already correct in this project |
| Manually reading `window.location.search` string | `URLSearchParams` Web API | Now universally supported (all modern browsers) | Clean, no manual string parsing |

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | load-test.js script | Yes | 20.19.4 | — |
| npm | qrcode.react install | Yes | 10.8.2 | — |
| @supabase/supabase-js | load-test.js script | Yes (in node_modules) | 2.100.0 | — |
| Netlify account | INFRA-05 deploy | Unknown — not verifiable from machine | — | Vercel (decision says Netlify only) |
| qrcode.react | QR code component | Not installed (not in package.json) | — | Install `qrcode.react@3` |
| Netlify CLI | Optional automation | Not installed | — | Manual drag-and-drop (specified) |

**Missing dependencies with no fallback:**
- Netlify account: Jay must have an account at netlify.com. Script cannot verify this. First-time use: create free account, drag `dist/`, done.

**Missing dependencies with fallback:**
- `qrcode.react`: Not yet installed. Plan Wave 0 installs it.

---

## Open Questions

1. **Deployed Netlify domain not yet known**
   - What we know: The QR code needs `window.location.origin` which is runtime-resolved, so no hardcoding is needed. The deploy task can proceed without knowing the domain in advance.
   - What's unclear: Whether Jay already has a Netlify account or site created.
   - Recommendation: Plan should include a step "create Netlify site and record the assigned URL" as Wave 1 Task 1. The QR code will work correctly regardless via `window.location.origin`.

2. **Supabase concurrent subscription ceiling**
   - What we know: Supabase free tier supports "up to 200 concurrent realtime connections" per project (per Supabase docs). 25 connections is well within this.
   - What's unclear: Whether the classroom's network might throttle WebSocket connections (hotel/school wifi sometimes blocks WS). This is a network concern, not a code concern.
   - Recommendation: Document as a known operational risk in the plan. Jay should test on the actual classroom network before the presentation.

---

## Sources

### Primary (HIGH confidence)
- qrcode.react GitHub README (github.com/zpao/qrcode.react/blob/trunk/README.md) — QRCodeSVG props: `value`, `size`, `bgColor`, `fgColor`
- npm registry (registry.npmjs.org/qrcode.react) — verified v3.2.0 as latest v3, v4.2.0 as latest overall
- MDN Web API — `URLSearchParams`, `window.location.search`, `window.location.origin`
- Netlify docs — `_redirects` SPA redirect rule format
- Code review of project source — identified all CSS gaps and confirmed passing items

### Secondary (MEDIUM confidence)
- Supabase JS v2 channel API — `.subscribe(status => {})` callback for SUBSCRIBED status — pattern is well-established in supabase-js v2 documentation
- WebSearch: qrcode.react v3 → v4 breaking changes — verified default export removal, named export stability

### Tertiary (LOW confidence)
- Supabase free tier "200 concurrent realtime connections" limit — sourced from WebSearch; exact current limit should be verified at supabase.com/docs/guides/realtime before load test design is finalized

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — qrcode.react API verified against official README and npm registry; all other libraries already installed
- Architecture: HIGH — all patterns derived from direct code review of existing files + official API docs
- Mobile audit findings: HIGH for confirmed CSS gaps (direct code review); MEDIUM for items requiring runtime verification
- Load test design: HIGH for Node.js/Supabase patterns; MEDIUM for Supabase concurrency limits (LOW source)

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable libraries; Netlify deployment process is very stable)
