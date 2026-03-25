// Simple test runner — no Jest required.
import { computeProfile, findConflicts } from '../detection.js'

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

console.log('\n--- Results ---')
console.log(passed + ' passed, ' + failed + ' failed')
if (failed > 0) process.exit(1)
