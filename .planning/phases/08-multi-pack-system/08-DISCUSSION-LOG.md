# Phase 8: Multi-Pack System — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 08-multi-pack-system
**Areas discussed:** Pack selection UI, New scenario content tone, Pack persistence in session, AI-03 schema shape

---

## Pack Selection UI

| Option | Description | Selected |
|--------|-------------|----------|
| 3 horizontal cards | Side-by-side cards, equal weight. Amber border on selected. Pack name, count, description. | ✓ |
| Vertical list with preview | List left, expanded description right. More reading room, more vertical space. | |
| Dropdown / selector | Compact styled select. Minimal footprint. | |

**User's choice:** 3 horizontal cards
**Notes:** Kingdom-arc pre-selected by default; "Open the Gates" always enabled (no forced choice).

---

## New Scenario Content Tone

### Real-world pack weight

| Option | Description | Selected |
|--------|-------------|----------|
| Same weight, real stakes | Adult college tone. Can include heavy content with notes. | ✓ |
| Lighter — contemporary but less personal | Civic/professional level. Systemic dilemmas. | |
| I'll write the scenarios myself | Pack schema only; author manually after. | |

**User's choice:** Same weight, real stakes — match original (Destiny/Marcus/Camille level)

### Scenario count

| Option | Description | Selected |
|--------|-------------|----------|
| Match kingdom-arc: 7 + reflection | Same 8-round structure | |
| 6 + reflection | 7 rounds total. Best 6 rather than forced 7th. | ✓ |
| 5 + reflection | Shorter sessions. | |

**User's choice:** 6 + reflection (7 rounds total per new pack)

### Sci-fi persona/framing

| Option | Description | Selected |
|--------|-------------|----------|
| Near-future person, grounded | Player is themselves in ~2040. Personal scale. AI, genetics, surveillance. | ✓ |
| Mission commander / system architect | Institutional power. Abstract authority. | |
| Same structure, Claude decides voice | Bystander/participant POV. Planner finds framing per scenario. | |

**User's choice:** Near-future person, grounded — same personal bystander POV

---

## Pack Persistence in Session

### When to write pack_id

| Option | Description | Selected |
|--------|-------------|----------|
| On "Open the Gates" | UPDATE sessions with pack_id + total_rounds before navigating to /host. | ✓ |
| At session creation on Landing | INSERT includes pack_id. Requires Landing to know about packs. | |
| Broadcast only — skip schema change | No sessions column. localStorage + broadcast. Avoids migration. | |

**User's choice:** On "Open the Gates" — extend the existing UPDATE call in HostSetup's `openLobby()`

### How Host/Play resolve pack

| Option | Description | Selected |
|--------|-------------|----------|
| Read from session.pack_id on load | getPackById(session.pack_id) after session fetch. No extra calls. | ✓ |
| localStorage mirror | HostSetup writes to localStorage; Host/Play read from there. Risk of desync. | |

**User's choice:** Read from session.pack_id — move from module-level getDefaultPack() to post-fetch resolution

---

## AI-03 Schema Shape

| Option | Description | Selected |
|--------|-------------|----------|
| Top-level on pack object | ai_generated: false, generator_prompt: null as direct pack fields | ✓ |
| Separate metadata object | { meta: { ai_generated, generator_prompt, version } } | |
| Document shape only, no fields yet | JSDoc comment. No actual property additions. | |

**User's choice:** Top-level fields on all pack objects. Hand-written packs default to false/null.

---

## Claude's Discretion

- Specific scenario titles and text for the two new packs
- World impact value calibration for new scenarios
- CSS styling for selected vs unselected pack card states
- Content note text for heavy rounds

## Deferred Ideas

None raised during discussion.
