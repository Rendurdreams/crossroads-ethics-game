# Phase 12: Ethical Framework Depth - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 12-ethical-framework-depth
**Areas discussed:** Expanded baseline UX, Moral trajectory & arc display, Deontological awareness prompts, End screen additions

---

## Expanded Baseline UX

### Question: How should the 3 new stance questions be revealed?

| Option | Description | Selected |
|--------|-------------|----------|
| All 5 at once | Show all 5 stance questions on one scrollable page after value ranking. Faster completion. | ✓ |
| One at a time, sequential | Each question appears only after the previous is answered. More dramatic pacing. | |
| Two stages: existing 2, then new 3 | Show original 2 first, then reveal new 3. Progressive but creates a visible seam. | |

**User's choice:** All 5 at once
**Notes:** Keeps under 60s target easily.

### Question: What wording and mapping for the 3 new stance questions?

| Option | Description | Selected |
|--------|-------------|----------|
| Use REQUIREMENTS.md wording | Exact strings from requirements spec | ✓ |
| Rewrite in kingdom register | Same conflict dimensions framed as council dilemmas | |
| You decide the wording | Claude picks wording that fits existing tone | |

**User's choice:** Use REQUIREMENTS.md wording

### Question: How should new stance answers feed into findMoralConflicts()?

| Option | Description | Selected |
|--------|-------------|----------|
| Same pattern: 'no' triggers conflict | Extends existing if-stance-then-flag pattern | ✓ |
| Weighted scoring | 'it_depends' gets partial weight | |
| You decide the mapping | Claude determines mapping | |

**User's choice:** Same pattern: 'no' triggers conflict

---

## Moral Trajectory & Arc Display

### Question: How should early vs late rounds be split?

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed split per requirements | Early = rounds 1-2, late = rounds 5+ | ✓ |
| Dynamic halves | First half vs second half of pack | |
| You decide | Claude picks based on pack length | |

**User's choice:** Fixed split per requirements

### Question: Where should 'Your Moral Arc' sit in end screen?

| Option | Description | Selected |
|--------|-------------|----------|
| After Morals vs Ethics (#3) | Natural flow after personal values section | ✓ |
| After Conflict Map (#4) | Groups conflict analysis together | |
| First section, before Framework | Arc as opening beat | |

**User's choice:** After Morals vs Ethics (#3)

### Question: How should consistency_score be presented?

| Option | Description | Selected |
|--------|-------------|----------|
| Label only, no number | Qualitative text, never show percentages | ✓ |
| Score + label | Numeric score alongside qualitative label | |
| Visual bar | Small meter showing consistency level | |

**User's choice:** Label only, no number

### Question: What threshold for meaningful shift?

| Option | Description | Selected |
|--------|-------------|----------|
| Dominant framework must change | Simple: most-used framework differs between early and late | ✓ |
| Any non-trivial shift | Any framework count changed by ≥2 | |
| You decide | Claude determines threshold | |

**User's choice:** Dominant framework must change

### Question: How should moral_weight map from scenario weight?

| Option | Description | Selected |
|--------|-------------|----------|
| Direct mapping per requirements | low=1, medium=2, heavy=3, reflective=0 | ✓ |
| Binary: heavy vs non-heavy | heavy=2, everything else=1 | |
| You decide | Claude picks mapping | |

**User's choice:** Direct mapping per requirements

### Question: Should trajectory use weight-adjusted counts?

| Option | Description | Selected |
|--------|-------------|----------|
| Weight-adjusted counts | Heavy round virtue choice counts 3x | ✓ |
| Raw counts only | Simple frequency, weight stored but not used for trajectory | |
| You decide | Claude determines approach | |

**User's choice:** Weight-adjusted counts

### Question: Should arc narrative explain philosophical meaning?

| Option | Description | Selected |
|--------|-------------|----------|
| Name the shift + explain | Includes philosophical context like "relational to principled reasoning" | ✓ |
| Name the shift only | Short factual statement | |
| You decide | Claude writes at appropriate depth | |

**User's choice:** Name the shift + explain

---

## Deontological Awareness Prompts

### Question: How should the awareness prompt appear?

| Option | Description | Selected |
|--------|-------------|----------|
| Inline banner above choices | Glass-card banner above decree tiles, doesn't block choices | ✓ |
| Modal overlay | Centered overlay with "I understand" button | |
| Subtle toast at bottom | Small toast notification | |

**User's choice:** Inline banner above choices

### Question: When should the prompt appear?

| Option | Description | Selected |
|--------|-------------|----------|
| On scenario load | Appears immediately when scenario renders | ✓ |
| After tapping a care choice | Appears only after tapping a care-tagged option | |
| You decide | Claude picks best timing | |

**User's choice:** On scenario load

### Question: Should prompt trigger only for honesty+lie_to_protect or all stances?

| Option | Description | Selected |
|--------|-------------|----------|
| Honesty + lie_to_protect only | Specific combo from DEONTO-01 only | ✓ |
| All stance conflicts | Any stance 'no' triggers prompt for opposing framework | |
| You decide | Claude determines scope | |

**User's choice:** Honesty + lie_to_protect only

### Question: How should dismissal be logged?

| Option | Description | Selected |
|--------|-------------|----------|
| Flag on choice_history entry | awareness_prompt_shown + awareness_prompt_dismissed on choice entry | ✓ |
| Separate array on player row | New awareness_prompts JSONB array | |
| You decide | Claude picks storage approach | |

**User's choice:** Flag on choice_history entry

---

## End Screen Additions

### Question: Section order for new end screen content?

| Option | Description | Selected |
|--------|-------------|----------|
| Group after arc, before conflict map | Personal analysis grouped together, then conflicts, then context | ✓ |
| Intersperse by relevance | Each section near most related existing section | |
| You decide | Claude arranges for best phone reading flow | |

**User's choice:** Group after arc, before conflict map

### Question: CONSCIENCE-01 amber border — visual only or with text?

| Option | Description | Selected |
|--------|-------------|----------|
| Visual only — amber border | Just border color change, no additional text | ✓ |
| Border + small label | Amber border plus italic "Internal friction registered" text | |
| You decide | Claude picks subtlety level | |

**User's choice:** Visual only — amber border

### Question: Which scenarios get rights_dimension tag?

| Option | Description | Selected |
|--------|-------------|----------|
| Claude tags all packs | Review all 3 packs, tag all qualifying scenarios | ✓ |
| Only explicitly named scenarios | Only The Hollow Folk and The Edge | |
| Tag + review list for approval | Claude proposes, user reviews before implementation | |

**User's choice:** Claude tags all packs

### Question: Cultural context wording?

| Option | Description | Selected |
|--------|-------------|----------|
| Use requirements wording as-is | Exact strings from REQUIREMENTS.md | ✓ |
| Rewrite for tone | Same concept, rewritten for pack description tone | |
| You decide | Claude picks or adapts wording | |

**User's choice:** Use requirements wording as-is

### Question: Virtue in heavy rounds — count or compare?

| Option | Description | Selected |
|--------|-------------|----------|
| Count virtue in heavy rounds | "Virtue was your choice in X of Y high-stakes rounds" | ✓ |
| Compare heavy vs all | Calculate virtue % in heavy vs overall | |
| You decide | Claude picks most meaningful approach | |

**User's choice:** Count virtue in heavy rounds

### Question: Empty state handling for conditional sections?

| Option | Description | Selected |
|--------|-------------|----------|
| Hide entirely | Sections below threshold don't render | ✓ |
| Show with explanation | Show header with "not enough data" note | |
| You decide | Claude determines per section | |

**User's choice:** Hide entirely

---

## Claude's Discretion

- Exact CSS styling for awareness prompt banner
- Internal trajectory computation structure
- Which scenarios qualify for rights_dimension across packs
- Arc narrative copy for each framework shift combination
- Whether virtue_streak computed in detection.js or inline

## Deferred Ideas

None — discussion stayed within phase scope.
