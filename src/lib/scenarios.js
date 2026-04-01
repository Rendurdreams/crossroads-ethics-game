import { kingdomArcPack } from './scenarios/packs/kingdom-arc.js'
import { realWorldModernPack } from './scenarios/packs/real-world-modern.js'
import { futuresPack } from './scenarios/packs/futures.js'
import { signalLostPack } from './scenarios/packs/signal-lost.js'

// ── Pack registry ────────────────────────────────────────────────────────────
// Add new packs here. The first entry is the default.

/**
 * @typedef {Object} PackChoice
 * @property {number} choiceIndex - 0, 1, or 2
 * @property {string} text - Button label
 * @property {string[]} frameworks - 1-2 of: 'care'|'deontology'|'consequentialism'|'virtue'
 * @property {string} consequence - Private outcome text shown after round closes
 * @property {Record<string, number>} worldImpact - Axis deltas keyed to pack's axis set
 * @property {string} [conscienceLayer] - Internal monologue text after choosing
 * @property {boolean} [rights_protective] - True when this choice protects individual rights over group benefit
 *
 * @typedef {Object} PackScenario
 * @property {string} id - Unique scenario ID, pack-prefixed
 * @property {string} title
 * @property {number} round - 1-indexed
 * @property {'low'|'medium'|'heavy'|'reflective'} weight
 * @property {string|null} contentNote - Shown as dismissible note if non-null
 * @property {string} moralTension
 * @property {string} teaches
 * @property {string} text - Full scenario prompt
 * @property {PackChoice[]} choices - Empty array for reflection rounds
 * @property {boolean} [rights_dimension] - True when scenario involves individual/minority rights at risk from group benefit
 *
 * @typedef {Object} ScenarioPack
 * @property {string} id - URL-safe unique identifier
 * @property {string} name - Display name
 * @property {string} description - 1-2 sentence description for pack card
 * @property {'fantasy'|'real-world'|'near-future'} setting - Genre tag
 * @property {boolean} ai_generated - True only for AI-generated packs
 * @property {string|null} generator_prompt - LLM prompt used to generate pack, if ai_generated
 * @property {string} ethicalLens - One-line ethical framing question for this pack's context
 * @property {Record<string, string>} [axisSet] - Maps axis keys to display labels
 * @property {Record<string, number>} [defaultWorldState] - Starting world state values
 * @property {PackScenario[]} scenarios
 */

export const packs = [signalLostPack, kingdomArcPack, realWorldModernPack, futuresPack]

export function getPackById(id) {
  return packs.find(p => p.id === id) ?? packs[0]
}

export function getDefaultPack() {
  return packs[0]
}

// ── Per-pack helpers ─────────────────────────────────────────────────────────

export function getScenarioByRound(pack, roundNumber) {
  return pack.scenarios.find(s => s.round === roundNumber) ?? null
}

export function getPlayableScenarios(pack) {
  return pack.scenarios.filter(s => s.choices.length > 0)
}

export function getReflectionScenario(pack) {
  return pack.scenarios.find(s => s.choices.length === 0) ?? null
}

// ── Backward compat ──────────────────────────────────────────────────────────
// worldState.test.js imports { scenarios } directly as a flat array.

export const scenarios = kingdomArcPack.scenarios
