# Phase 11: Moral Conflict Detection + End Screen + AI Hooks - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-29
**Phase:** 11-moral-conflict-detection-end-screen-ai-hooks
**Areas discussed:** Moral conflict detection logic, In-round conflict indicator UX, End screen moral vs ethics map, AI data shape

---

## Moral Conflict Detection Logic

| Option | Description | Selected |
|--------|-------------|----------|
| Top 1 value only | Only flag conflicts when choice contradicts player's #1 ranked value | ✓ |
| Top 2 values | Flag when choice contradicts either of top 2 values | |
| All ranked values weighted | Weight conflict severity by rank position | |

**User's choice:** Top 1 value only
**Notes:** Fewer, more meaningful hits. Avoids noise.

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, as secondary signal | Stance answers trigger additional conflicts alongside values | ✓ |
| No, values only | Stances are reflective context only, don't trigger indicators | |
| You decide | Claude picks best fit | |

**User's choice:** Yes, as secondary signal
**Notes:** Stances like "ends don't justify means" + consequentialist choice = powerful secondary conflict.

---

## In-Round Conflict Indicator UX

| Option | Description | Selected |
|--------|-------------|----------|
| Neutral observation | "This conflicts with your value of honesty." Factual, no judgment. | ✓ |
| Gentle provocation | "Your heart says honesty — your choice says otherwise." | |
| Question format | "Does this align with what you value most?" | |

**User's choice:** Neutral observation
**Notes:** Fits pedagogical stance of revealing, not rating.

| Option | Description | Selected |
|--------|-------------|----------|
| Below framework label | Framework label first, conflict text fades in 0.5s later below it | ✓ |
| Inline with framework label | Single line combining both | |
| Separate card/toast | Small glass card slides up from bottom | |

**User's choice:** Below framework label
**Notes:** Two distinct lines, stacked. Natural reading flow on phone.

---

## End Screen Moral vs Ethics Map

| Option | Description | Selected |
|--------|-------------|----------|
| After dominant, before conflicts | Section 2 (NEW) between framework and conflict map | ✓ |
| After framework conflicts | Section 3 (NEW) after conflict map | |
| Top of screen | Lead with personal moral tension | |

**User's choice:** After dominant, before conflicts
**Notes:** Places the personal revelation right after they learn their framework.

| Option | Description | Selected |
|--------|-------------|----------|
| Named and explained | Explicitly teaches morals vs ethics distinction in copy | ✓ |
| Shown, not told | Lists conflicts, lets player draw conclusion | |
| Both with toggle | Default list + expandable explanation | |

**User's choice:** Named and explained
**Notes:** Directly teaches the lesson — the game's central thesis.

---

## AI Data Shape

| Option | Description | Selected |
|--------|-------------|----------|
| Full narrative-ready | Complete payload with scenario titles, conflicts, baseline, framework data | ✓ |
| Structured data only | Raw arrays and counts, AI figures out narrative | |
| You decide | Claude picks best structure | |

**User's choice:** Full narrative-ready
**Notes:** Enough for an LLM to generate personalized debrief without querying anything else.

---

## Claude's Discretion

- CSS animation timing for conflict indicator
- Value-to-framework mapping internal structure
- Whether moral conflicts computed client-side or stored in Supabase
- Exact end screen copy wording

## Deferred Ideas

None — discussion stayed within phase scope.
