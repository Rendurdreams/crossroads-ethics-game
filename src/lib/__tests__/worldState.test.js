import { applyChoicesToWorld } from '../worldState.js'
import { scenarios } from '../scenarios.js'

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) { passed++; console.log('  PASS: ' + message) }
  else { failed++; console.log('  FAIL: ' + message) }
}

function approxEqual(a, b, tolerance) {
  return Math.abs(a - b) <= (tolerance || 0.01)
}

const startState = { trust: 50, courage: 50, solidarity: 50, awareness: 50 }

console.log('--- applyChoicesToWorld tests ---')

// Test 1: all players choose option 0 in round 1
// Round 1, Choice A: trust: -8, courage: -4, solidarity: +6, awareness: 0
const result1 = applyChoicesToWorld(
  [{ choice_index: 0 }, { choice_index: 0 }, { choice_index: 0 }],
  scenarios,
  0,  // roundIndex (0-based)
  { ...startState }
)
assert(result1.trust === 42, 'all choose A: trust = 50 + (-8) = 42, got ' + result1.trust)
assert(result1.courage === 46, 'all choose A: courage = 50 + (-4) = 46, got ' + result1.courage)
assert(result1.solidarity === 56, 'all choose A: solidarity = 50 + 6 = 56, got ' + result1.solidarity)
assert(result1.awareness === 50, 'all choose A: awareness unchanged = 50, got ' + result1.awareness)

// Test 2: split vote — 2 choose A, 1 chooses B in round 1
// A weight: 2/3, B weight: 1/3
// trust: (-8 * 2/3) + (10 * 1/3) = -5.33 + 3.33 = -2.0
// courage: (-4 * 2/3) + (8 * 1/3) = -2.67 + 2.67 = 0
// solidarity: (6 * 2/3) + (-4 * 1/3) = 4.0 - 1.33 = 2.67
// awareness: (0 * 2/3) + (6 * 1/3) = 2.0
const result2 = applyChoicesToWorld(
  [{ choice_index: 0 }, { choice_index: 0 }, { choice_index: 1 }],
  scenarios,
  0,
  { ...startState }
)
assert(approxEqual(result2.trust, 48, 0.1), 'split vote: trust ~ 48, got ' + result2.trust)
assert(approxEqual(result2.courage, 50, 0.1), 'split vote: courage ~ 50, got ' + result2.courage)

// Test 3: clamping — trust can't go below 0
const lowState = { trust: 3, courage: 50, solidarity: 50, awareness: 50 }
const result3 = applyChoicesToWorld(
  [{ choice_index: 0 }, { choice_index: 0 }, { choice_index: 0 }],
  scenarios,
  0,
  { ...lowState }
)
assert(result3.trust >= 0, 'trust clamped at 0 minimum, got ' + result3.trust)

// Test 4: clamping — values can't exceed 100
const highState = { trust: 50, courage: 50, solidarity: 97, awareness: 50 }
const result4 = applyChoicesToWorld(
  [{ choice_index: 0 }, { choice_index: 0 }, { choice_index: 0 }],
  scenarios,
  0,
  { ...highState }
)
assert(result4.solidarity <= 100, 'solidarity clamped at 100 maximum, got ' + result4.solidarity)

// Test 5: empty choices returns current state unchanged
const result5 = applyChoicesToWorld([], scenarios, 0, { ...startState })
assert(result5.trust === 50, 'empty choices: state unchanged, got trust ' + result5.trust)
assert(result5.courage === 50, 'empty choices: state unchanged, got courage ' + result5.courage)

console.log('\n--- Results ---')
console.log(passed + ' passed, ' + failed + ' failed')
if (failed > 0) process.exit(1)
