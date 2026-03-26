# Phase 5: Deploy + Polish - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship the game to a public Netlify URL and confirm it holds under 25 simultaneous players. Scope: deployment config, QR code for player join, mobile audit of player-facing pages, and a load test. No new game features — those are v2.

</domain>

<decisions>
## Implementation Decisions

### Deployment
- **D-01:** Target is **Netlify**. Deploy by dragging `dist/` to the Netlify dashboard (or using Netlify CLI). No Vercel, no other provider.
- **D-02:** SPA routing is already handled — `public/_redirects` contains `/* /index.html 200`. No additional config needed.
- **D-03:** Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are set manually in Netlify dashboard → Site settings → Environment variables. They are NOT committed to the repo. The `.env.example` in the repo already documents them.
- **D-04:** After setting env vars in Netlify dashboard, trigger a redeploy (or redrag dist/ built with those vars) to pick them up. The `.env.local` contains the production Supabase URL — `vite build` will embed it at build time.

### QR Code
- **D-05:** Add `qrcode.react` to the host lobby (HostSetup.jsx). The QR code appears **below** the room code display.
- **D-06:** The QR code encodes the **join URL with code pre-filled**: `https://{deployed-domain}/?code={roomCode}`. This lets players scan and land directly on the join page with the code already in the input.
- **D-07:** Landing.jsx must be updated to read the `?code=` query parameter on mount and pre-fill the room code input field. Use `new URLSearchParams(window.location.search).get('code')` (no router dependency needed — plain Web API).
- **D-08:** QR code sizing: 180×180px. Dark background, light foreground to match the dark aesthetic (`bgColor="#12121e"`, `fgColor="#f5f0e8"` or similar light cream). Use the `value` prop of `<QRCode />` from `qrcode.react`.
- **D-09:** QR code is only shown on the HostSetup page (room code + roster lobby), not on the active round view or end view.

### Mobile Audit
- **D-10:** Audit scope is **player-facing pages only**: `Landing.jsx` (join flow), `Play.jsx` (game), `FrameworkProfile.jsx` (end screen). `Host.jsx` is desktop-only by design — no mobile work needed there.
- **D-11:** Pass criteria matches POLISH-01 exactly: no horizontal scroll, all buttons reachable with thumbs, scenario text readable without zooming. Test against 390px viewport (iPhone 14 baseline).
- **D-12:** Fix violations found during audit. Do not pursue aesthetic polish beyond the POLISH-01 bar — font refinements, spacing rhythm, etc. are v2.
- **D-13:** Fix the page title: `index.html` title should be `"The Crossroads"`. Add a `<meta name="description" content="A multiplayer ethics game for the classroom.">` tag. No Open Graph tags needed for v1.

### Load Test
- **D-14:** Load test method is a **manual browser script** — a Node.js script using the Supabase JS client that opens 25 simultaneous real-time subscriptions to the same session and monitors for dropped events. Script prints a pass/fail summary. Jay runs it himself from terminal before the presentation.
- **D-15:** Pass criteria: all 25 subscription channels receive every INSERT event within 2 seconds of it being written. A single dropped event is a failure. The test script simulates what happens during a live round (choice inserts firing simultaneously).
- **D-16:** The load test script lives at `scripts/load-test.js` in the repo root. It is not part of the Vite build — just a standalone Node script requiring `@supabase/supabase-js`.

### Claude's Discretion
- Exact QR code colors — match the dark editorial aesthetic (dark bg, light foreground), within that constraint Claude chooses the exact hex values
- Mobile audit: specific CSS fixes applied — Claude audits and fixes what it finds within POLISH-01 scope, no need to enumerate every possible fix in advance

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project spec
- `CLAUDE.md` — Phase 8 (Polish) section specifies `qrcode.react` 3.x; tech stack section confirms Netlify/Vercel hosting approach
- `.planning/REQUIREMENTS.md` — INFRA-05, POLISH-01, POLISH-02 requirement definitions

### Existing code (integration points)
- `src/pages/HostSetup.jsx` — where QR code component is added (room code display + roster)
- `src/pages/Landing.jsx` — needs `?code=` query param pre-fill added
- `src/pages/Play.jsx` — primary target of mobile audit
- `src/components/FrameworkProfile.jsx` — secondary mobile audit target
- `index.html` — title + meta tag fix
- `public/_redirects` — already correct, do not modify

### Prior phase context
- `.planning/phases/04-end-state/04-CONTEXT.md` — D-08 establishes HostSetup page structure (room code, QR optional, round count selector, "Open Lobby" button)

</canonical_refs>
