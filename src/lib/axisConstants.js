// ── Axis constants per pack ──────────────────────────────────────────────────
// Maps axis keys to display labels. Used by MeterBar, Host, Play, and worldState.

export const KINGDOM_ARC_AXES = Object.freeze({
  trust: 'Trust',
  courage: 'Courage',
  solidarity: 'Solidarity',
  awareness: 'Awareness'
})

export const SIGNAL_LOST_AXES = Object.freeze({
  CT: 'Civil Trust',
  HD: 'Human Dignity',
  SOL: 'Solidarity',
  ACC: 'Accountability'
})

/**
 * Get axis label map for a pack. Falls back to kingdom-arc axes.
 * @param {import('./scenarios.js').ScenarioPack} pack
 * @returns {Record<string, string>}
 */
export function getAxisLabels(pack) {
  return pack?.axisSet ?? KINGDOM_ARC_AXES
}

/**
 * Get axis keys for a pack (e.g. ['CT', 'HD', 'SOL', 'ACC']).
 * @param {import('./scenarios.js').ScenarioPack} pack
 * @returns {string[]}
 */
export function getAxisKeys(pack) {
  return Object.keys(getAxisLabels(pack))
}
