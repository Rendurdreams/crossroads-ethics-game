/**
 * AI integration stubs for The Crossroads.
 * These functions return null in v1.1. Implementation in v1.2.
 *
 * All three entry points are documented with their expected payload shapes
 * so future implementers know the contract (D-13, AI-04).
 */

/**
 * Generate a personalized debrief for a single player.
 *
 * @param {Object} playerContext
 * @param {string} playerContext.playerId
 * @param {string|null} playerContext.dominantFramework - e.g. 'care', 'deontology'
 * @param {{ consequentialism: number, deontology: number, care: number, virtue: number }} playerContext.frameworkCounts
 * @param {Array<{ tension: string, description: string, rounds: number[], frameworks: string[] }>} playerContext.frameworkConflicts
 * @param {Array<{ round: number, type: 'value'|'stance', valueName?: string, stanceKey?: string, choiceFrameworks: string[], message: string }>} playerContext.moralConflicts
 * @param {{ topValue: string|null, allValues: string[], stances: object }} playerContext.moralBaseline
 * @param {Array<{ round: number, scenarioId: string, scenarioTitle: string, choiceIndex: number, frameworks: string[] }>} playerContext.choiceHistory
 * @returns {Promise<string|null>}
 */
export async function generateDebrief(playerContext) {
  return null
}

/**
 * Generate discussion prompts for the host debrief based on group session data.
 *
 * @param {Object} sessionContext
 * @param {string} sessionContext.packId
 * @param {string} sessionContext.packName
 * @param {number} sessionContext.totalPlayers
 * @param {{ consequentialism: number, deontology: number, care: number, virtue: number }} sessionContext.frameworkBreakdown
 * @param {{ trust: number, courage: number, solidarity: number, awareness: number }} sessionContext.finalWorldState
 * @param {Array<{ description: string, playerCount: number, totalWithValue: number }>} sessionContext.notableMoralConflicts
 * @returns {Promise<string[]|null>}
 */
export async function generateDiscussionPrompts(sessionContext) {
  return null
}

/**
 * Generate a new scenario pack from a natural language prompt.
 * Returns a pack conforming to the ScenarioPack typedef in scenarios.js.
 *
 * @param {string} prompt - Natural language description of the pack's theme and tone
 * @returns {Promise<import('./scenarios.js').ScenarioPack|null>}
 */
export async function generatePack(prompt) {
  return null
}
