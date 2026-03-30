# Phase 14: Animated Kingdom Map - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 14-animated-kingdom-map
**Areas discussed:** Component swap, Mouse effects, Dependencies, Dead code cleanup

---

## Component Swap

| Option | Description | Selected |
|--------|-------------|----------|
| Map inside AnimatedMap | Key mapping (trust→Honesty etc) inside the component | ✓ |
| Wrapper in Host.jsx | Add adapter/mapping in Host.jsx before passing props | |

**User's choice:** Mapping inside AnimatedMap — Host.jsx passes worldState unchanged
**Notes:** User confirmed during pre-discuss conversation

## Mouse/Cursor Effects

| Option | Description | Selected |
|--------|-------------|----------|
| Keep all effects | Parallax, cursor glow, proximity labels, click ripple | |
| Remove all mouse effects | Strip parallax/cursor/proximity/ripple for projected screen | ✓ |
| Configurable toggle | Props to enable/disable mouse features | |

**User's choice:** Remove all mouse effects — "remove the mouse stuff for now"
**Notes:** Host screen is projected via HDMI, no mouse interaction during presentation

## Dead Code

| Option | Description | Selected |
|--------|-------------|----------|
| Keep old components | Leave KingdomScene/CityScene for reference | |
| Delete dead code | Remove unused KingdomScene.jsx, CityScene.jsx, KingdomCanvas.jsx | ✓ |

**User's choice:** [auto] Clean delete — verified KingdomScene.jsx and CityScene.jsx are never imported

---

## Claude's Discretion

- Parallax layer depth values for fixed (non-mouse) mode
- Zone position fine-tuning after seeing map at host resolution
- Whether zone labels should fade in on mount or be immediately visible

## Deferred Ideas

- Mouse parallax as optional demo mode
- Per-pack map images
- Threshold event animations (bridge collapse, blackout wave)
