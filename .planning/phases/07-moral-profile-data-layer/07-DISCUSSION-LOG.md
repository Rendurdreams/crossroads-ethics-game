# Phase 7: Moral Profile Data Layer - Discussion Log

**Date:** 2026-03-27
**Phase:** 07 — Moral Profile Data Layer
**Areas discussed:** Where the step lives, Ranking interaction, Framing and tone, Schema

---

## Area 1: Where the step lives

**Q: Where should the moral baseline step happen?**
Options presented:
1. New route: `/baseline/:sessionId` (Recommended) — Landing creates player row + localStorage, navigates to /baseline, runs baseline, writes to Supabase, navigates to /play
2. Inline in Play.jsx before lobby — no new page, but Play.jsx already complex
3. Multi-step within Landing — Landing becomes a 3-step flow

**Selected:** New route: `/baseline/:sessionId`

---

**Q: On refresh in /baseline/:sessionId — what should happen?**
Options presented:
1. Resume from localStorage progress (Recommended) — save answers as player taps, restore on refresh, write to Supabase only on full submit
2. Start over on refresh — simpler, acceptable given the step is short

**Selected:** Resume from localStorage progress

---

## Area 2: Ranking interaction

**Q: How should players rank the 5 values?**
Options presented:
1. Tap-to-rank: sequential selection (Recommended) — tap assigns rank in order, card shows number, undo per card
2. Ordered pick-from-list: eliminate as you go — one focused decision per round
3. Drag-to-reorder — finicky on mobile without a library

**Selected:** Tap-to-rank: sequential selection

---

## Area 3: Framing and tone

**Q: How should the moral baseline step be framed for the player?**
Options presented:
1. Immersive game-world framing (Recommended) — war council register: "Before you take your seat at the council..."
2. Minimal / neutral framing — "What do you value most?"
3. Explicit ethical framing — "These are the values your choices will be measured against"

**Selected:** Immersive game-world framing

---

**Q: The 2 stance questions — what format should they use?**
Options presented:
1. Decree-tile button style (Recommended) — same amber bordered buttons with Roman numeral prefix as scenario choices
2. Simple binary (Yes / No) — faster but loses "It depends" nuance
3. Slider / scale (1-5) — harder to map to categorical conflict detection

**Selected:** Decree-tile button style

---

**Q: What should the 2 stance questions be?**
Options presented:
1. Loyalty vs. honesty + rules vs. outcomes (Recommended):
   - Q1: "Is it ever right to lie to protect someone you love?" (Yes / No / It depends) → care vs. deontology
   - Q2: "Do the ends justify the means if enough people benefit?" (Yes / No / It depends) → consequentialism vs. deontology
2. Let me define them

**Selected:** Loyalty vs. honesty + rules vs. outcomes

---

## Area 4: Schema

**Q: How should the moral baseline be stored on the player row?**
Options presented:
1. Two JSONB columns: `moral_values` (ordered array) + `moral_stances` (key/value object) (Recommended)
2. One JSONB column: `moral_profile` with both inside

**Selected:** Two JSONB columns: `moral_values` + `moral_stances`

---

*Discussion log generated: 2026-03-27*
