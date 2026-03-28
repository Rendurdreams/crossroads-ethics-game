# Phase 5: Deploy + Polish - Discussion Log

**Date:** 2026-03-26
**Areas discussed:** Deploy target, QR code, Mobile audit scope

---

## Deploy target

**Q: Netlify or Vercel?**
Options: Netlify (Recommended), Vercel
→ Selected: **Netlify**

**Q: How will you set the Supabase env vars on Netlify?**
Options: Netlify dashboard manually, netlify.toml in repo
→ Selected: **Netlify dashboard manually**

---

## QR code

**Q: Add a QR code to the host lobby?**
Options: Yes — add it (Recommended), No — manual code entry only
→ Selected: **Yes — add it**

**Q: Where should the QR code appear?**
Options: Below the room code (Recommended), Side by side with the code
→ Selected: **Below the room code**

**Q: What URL should the QR code encode?**
Options: Join URL with code pre-filled (Recommended), Base URL only
→ Selected: **Join URL with code pre-filled**

---

## Mobile audit

**Q: Which views need mobile attention?**
Options: Player view only (Recommended), Player + host setup, All pages
→ Selected: **Player view only**

**Q: What counts as passing?**
Options: No horizontal scroll + readable without zoom (Recommended), Full visual polish
→ Selected: **No horizontal scroll + readable without zoom**

**Q: Fix the 'crossroads-tmp' title?**
Options: Yes — fix title and meta, Not needed
→ Selected: **Yes — fix title and meta**

---

## Skipped

**Load test method** — not discussed. Default: Node.js test script at `scripts/load-test.js`, 25 simultaneous subscriptions, manual run by Jay before presentation.
