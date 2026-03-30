// Simple test runner — no Jest required.
import { computeProfile, findConflicts, findMoralConflicts, VALUE_FRAMEWORK_MAP } from '../detection.js'

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) { passed++; console.log('  PASS: ' + message) }
  else { failed++; console.log('  FAIL: ' + message) }
}

console.log('--- computeProfile tests ---')

// Test 1: dominant framework detection
const profile1 = computeProfile([
  { round: 1, frameworks: ['care'] },
  { round: 2, frameworks: ['care'] },
  { round: 3, frameworks: ['deontology', 'virtue'] }
])
assert(profile1.dominant === 'care', 'dominant is care when care appears most')
assert(profile1.counts.care === 2, 'care count is 2')
assert(profile1.counts.deontology === 1, 'deontology count is 1')
assert(profile1.counts.virtue === 1, 'virtue count is 1')
assert(profile1.counts.consequentialism === 0, 'consequentialism count is 0')

// Test 2: empty history
const profile2 = computeProfile([])
assert(profile2.dominant === null, 'empty history returns null dominant')
assert(profile2.counts.care === 0, 'empty history has zero counts')

// Test 3: single choice with two frameworks
const profile3 = computeProfile([
  { round: 1, frameworks: ['deontology', 'virtue'] }
])
assert(profile3.counts.deontology === 1, 'both frameworks counted from single choice')
assert(profile3.counts.virtue === 1, 'both frameworks counted from single choice')

console.log('\n--- findConflicts tests ---')

// Test 4: detects care vs deontology conflict
const conflicts1 = findConflicts([
  { round: 1, frameworks: ['care'] },
  { round: 2, frameworks: ['deontology'] }
])
assert(conflicts1.length === 1, 'finds one conflict between care and deontology')
assert(conflicts1[0].tension === 'relationship vs. rule', 'correct tension name')
assert(conflicts1[0].rounds.length === 2, 'conflict references both rounds')

// Test 5: no conflict when all same framework
const conflicts2 = findConflicts([
  { round: 1, frameworks: ['care'] },
  { round: 2, frameworks: ['care'] },
  { round: 3, frameworks: ['care'] }
])
assert(conflicts2.length === 0, 'no conflict when all choices are same framework')

// Test 6: multiple conflicts possible
const conflicts3 = findConflicts([
  { round: 1, frameworks: ['care'] },
  { round: 2, frameworks: ['deontology'] },
  { round: 3, frameworks: ['consequentialism'] }
])
assert(conflicts3.length >= 2, 'finds multiple conflicts: care/deontology + care/consequentialism + deontology/consequentialism')

console.log('\n--- VALUE_FRAMEWORK_MAP tests ---')

// Test: VALUE_FRAMEWORK_MAP has expected keys and values
assert(VALUE_FRAMEWORK_MAP !== undefined, 'VALUE_FRAMEWORK_MAP is exported')
assert(Array.isArray(VALUE_FRAMEWORK_MAP.honesty), 'honesty maps to an array')
assert(
  VALUE_FRAMEWORK_MAP.honesty.length === 2 &&
  VALUE_FRAMEWORK_MAP.honesty.includes('deontology') &&
  VALUE_FRAMEWORK_MAP.honesty.includes('virtue'),
  'VALUE_FRAMEWORK_MAP.honesty deep-equals [deontology, virtue]'
)
assert(
  Array.isArray(VALUE_FRAMEWORK_MAP.loyalty) &&
  VALUE_FRAMEWORK_MAP.loyalty.length === 1 &&
  VALUE_FRAMEWORK_MAP.loyalty[0] === 'care',
  'VALUE_FRAMEWORK_MAP.loyalty deep-equals [care]'
)
assert(VALUE_FRAMEWORK_MAP.fairness !== undefined, 'fairness key exists')
assert(VALUE_FRAMEWORK_MAP.courage !== undefined, 'courage key exists')
assert(VALUE_FRAMEWORK_MAP.compassion !== undefined, 'compassion key exists')

console.log('\n--- findMoralConflicts tests ---')

// Test: null moralValues -> empty array
const mc0 = findMoralConflicts(
  [{ round: 1, frameworks: ['care'] }],
  null,
  null
)
assert(mc0.length === 0, 'null moralValues returns empty array')

// Test: empty choiceHistory -> empty array
const mc1 = findMoralConflicts([], ['honesty', 'loyalty'], null)
assert(mc1.length === 0, 'empty choiceHistory returns empty array')

// Test: honesty #1, deontology choice -> no conflict (honesty maps to deontology/virtue)
const mc2 = findMoralConflicts(
  [{ round: 1, frameworks: ['deontology'] }],
  ['honesty', 'loyalty'],
  null
)
assert(mc2.length === 0, 'honesty #1 + deontology choice = no conflict')

// Test: honesty #1, care choice -> conflict fires, type=value, valueName=honesty
const mc3 = findMoralConflicts(
  [{ round: 1, frameworks: ['care'] }],
  ['honesty', 'loyalty'],
  null
)
assert(mc3.length === 1, 'honesty #1 + care choice = 1 conflict')
assert(mc3[0].type === 'value', 'conflict type is value')
assert(mc3[0].valueName === 'honesty', 'valueName is honesty')
assert(mc3[0].round === 1, 'conflict references round 1')

// Test: loyalty #1, consequentialism choice -> conflict fires (loyalty maps to care only)
const mc4 = findMoralConflicts(
  [{ round: 2, frameworks: ['consequentialism'] }],
  ['loyalty'],
  null
)
assert(mc4.length === 1, 'loyalty #1 + consequentialism choice = 1 conflict')
assert(mc4[0].type === 'value', 'conflict type is value')
assert(mc4[0].valueName === 'loyalty', 'valueName is loyalty')

// Test: stance ends_justify='no' + consequentialism choice -> stance conflict fires
// Use fairness as top value (fairness maps to [consequentialism, deontology]) so NO value conflict fires
const mc5 = findMoralConflicts(
  [{ round: 3, frameworks: ['consequentialism'] }],
  ['fairness'],      // fairness maps to [consequentialism, deontology] — aligned, so no VALUE conflict
  { ends_justify: 'no' }
)
assert(mc5.length === 1, 'ends_justify=no + consequentialism = 1 stance conflict')
assert(mc5[0].type === 'stance', 'conflict type is stance')
assert(mc5[0].stanceKey === 'ends_justify', 'stanceKey is ends_justify')

// Test: no double-fire — value conflict already fires for same round; stance should not add another
const mc6 = findMoralConflicts(
  [{ round: 1, frameworks: ['consequentialism'] }],
  ['loyalty'],                             // loyalty->care, so consequentialism causes VALUE conflict
  { ends_justify: 'no' }                  // also ends_justify=no would fire stance conflict
)
assert(mc6.length === 1, 'no double-fire: only 1 conflict per round even when both value and stance would match')

// Test: lie_to_protect='no' + care choice -> stance conflict fires
// Use compassion as top value (maps to [care]) — aligned, so no VALUE conflict fires
const mc7 = findMoralConflicts(
  [{ round: 4, frameworks: ['care'] }],
  ['compassion'],    // compassion maps to [care] — aligned, so no VALUE conflict
  { lie_to_protect: 'no' }
)
assert(mc7.length === 1, 'lie_to_protect=no + care choice = 1 stance conflict')
assert(mc7[0].type === 'stance', 'conflict type is stance')
assert(mc7[0].stanceKey === 'lie_to_protect', 'stanceKey is lie_to_protect')

// Test: moralValues empty array -> empty array (no top value)
const mc8 = findMoralConflicts(
  [{ round: 1, frameworks: ['care'] }],
  [],
  null
)
assert(mc8.length === 0, 'empty moralValues array returns empty array')

// Test: break_promise='no' + consequentialist choice -> stance conflict fires
const mc9 = findMoralConflicts(
  [{ round: 2, frameworks: ['consequentialism'] }],
  ['fairness'],  // fairness maps to [consequentialism, deontology] — aligned, no value conflict
  { break_promise: 'no' }
)
assert(mc9.length === 1, 'break_promise=no + consequentialism = 1 stance conflict')
assert(mc9[0].type === 'stance', 'break_promise conflict type is stance')
assert(mc9[0].stanceKey === 'break_promise', 'stanceKey is break_promise')

// Test: truth_over_relationship='no' + virtue choice -> stance conflict fires
const mc10 = findMoralConflicts(
  [{ round: 3, frameworks: ['virtue'] }],
  ['courage'],  // courage maps to [virtue] — aligned, no value conflict
  { truth_over_relationship: 'no' }
)
assert(mc10.length === 1, 'truth_over_relationship=no + virtue = 1 stance conflict')
assert(mc10[0].type === 'stance', 'truth_over_relationship conflict type is stance')
assert(mc10[0].stanceKey === 'truth_over_relationship', 'stanceKey is truth_over_relationship')

// Test: punish_innocent='yes' + consequentialist choice -> stance conflict fires
const mc11 = findMoralConflicts(
  [{ round: 4, frameworks: ['consequentialism'] }],
  ['fairness'],  // aligned, no value conflict
  { punish_innocent: 'yes' }
)
assert(mc11.length === 1, 'punish_innocent=yes + consequentialism = 1 stance conflict')
assert(mc11[0].type === 'stance', 'punish_innocent conflict type is stance')
assert(mc11[0].stanceKey === 'punish_innocent', 'stanceKey is punish_innocent')

// Test: dedup — value conflict on round 3 prevents stance conflict on same round
const mc12 = findMoralConflicts(
  [{ round: 3, frameworks: ['consequentialism'] }],
  ['loyalty'],  // loyalty->care, so consequentialism causes VALUE conflict
  { break_promise: 'no' }  // would also fire stance conflict
)
assert(mc12.length === 1, 'dedup: only 1 conflict per round even when value + break_promise would match')
assert(mc12[0].type === 'value', 'dedup: value conflict takes priority over stance')

console.log('\n--- computeProfile extended fields tests ---')

// Test: trajectory detection — care early, deontology late
const profileT1 = computeProfile([
  { round: 1, frameworks: ['care'], moral_weight: 1 },
  { round: 2, frameworks: ['care'], moral_weight: 1 },
  { round: 3, frameworks: ['virtue'], moral_weight: 2 },
  { round: 5, frameworks: ['deontology'], moral_weight: 3 },
  { round: 6, frameworks: ['deontology'], moral_weight: 3 }
])
assert(profileT1.trajectory.early === 'care', 'trajectory early is care')
assert(profileT1.trajectory.late === 'deontology', 'trajectory late is deontology')
assert(profileT1.trajectory.shifted === true, 'trajectory shifted is true')

// Test: trajectory with consistent player — all care
const profileT2 = computeProfile([
  { round: 1, frameworks: ['care'], moral_weight: 1 },
  { round: 2, frameworks: ['care'], moral_weight: 1 },
  { round: 5, frameworks: ['care'], moral_weight: 3 },
  { round: 6, frameworks: ['care'], moral_weight: 3 }
])
assert(profileT2.trajectory.shifted === false, 'consistent player: trajectory shifted is false')

// Test: trajectory with insufficient late rounds — only rounds 1-4
const profileT3 = computeProfile([
  { round: 1, frameworks: ['care'], moral_weight: 1 },
  { round: 2, frameworks: ['care'], moral_weight: 1 },
  { round: 3, frameworks: ['virtue'], moral_weight: 2 },
  { round: 4, frameworks: ['deontology'], moral_weight: 2 }
])
assert(profileT3.trajectory.late === null, 'no late rounds: trajectory.late is null')
assert(profileT3.trajectory.shifted === false, 'no late rounds: shifted is false')

// Test: consistency_score high — all same framework
const profileC1 = computeProfile([
  { round: 1, frameworks: ['care'] },
  { round: 2, frameworks: ['care'] },
  { round: 3, frameworks: ['care'] },
  { round: 4, frameworks: ['care'] }
])
assert(profileC1.consistency_score === 'high', 'all care: consistency_score is high')

// Test: consistency_score low — evenly mixed
const profileC2 = computeProfile([
  { round: 1, frameworks: ['care'] },
  { round: 2, frameworks: ['deontology'] },
  { round: 3, frameworks: ['consequentialism'] },
  { round: 4, frameworks: ['virtue'] }
])
assert(profileC2.consistency_score === 'low', 'evenly mixed: consistency_score is low')

// Test: consistency_score null — empty history
const profileC3 = computeProfile([])
assert(profileC3.consistency_score === null, 'empty history: consistency_score is null')

// Test: virtue_streak — 1,2,3 virtue then care then virtue
const profileV1 = computeProfile([
  { round: 1, frameworks: ['virtue'] },
  { round: 2, frameworks: ['virtue'] },
  { round: 3, frameworks: ['virtue'] },
  { round: 4, frameworks: ['care'] },
  { round: 5, frameworks: ['virtue'] }
])
assert(profileV1.virtue_streak === 3, 'virtue_streak is 3 (rounds 1-3)')

// Test: virtue_heavy_count — 2 heavy virtue, 1 non-heavy virtue
const profileV2 = computeProfile([
  { round: 1, frameworks: ['virtue'], moral_weight: 3 },
  { round: 2, frameworks: ['virtue'], moral_weight: 1 },
  { round: 3, frameworks: ['virtue'], moral_weight: 3 },
  { round: 4, frameworks: ['care'], moral_weight: 3 }
])
assert(profileV2.virtue_heavy_count === 2, 'virtue_heavy_count is 2 (two virtue choices with moral_weight 3)')

console.log('\n--- Results ---')
console.log(passed + ' passed, ' + failed + ' failed')
if (failed > 0) process.exit(1)
