// The four ethical frameworks
export const FRAMEWORKS = {
  consequentialism: {
    name: 'Consequentialism',
    description: 'Do whatever produces the best result for the most people. If lying saves five lives, you lie. The ends can justify the means -- what matters is the outcome, not how you got there.',
    question: 'What produces the best overall result?'
  },
  deontology: {
    name: 'Deontology',
    description: 'Some rules don\'t bend, period. A promise is a promise even when breaking it would help more people. It\'s not about what works -- it\'s about what\'s right.',
    question: 'What does my duty require?'
  },
  care: {
    name: 'Care Ethics',
    description: 'The person in front of you matters more than any abstract principle. Relationships create responsibility -- you owe something different to the people you know than to strangers.',
    question: 'What does this specific person need from me?'
  },
  virtue: {
    name: 'Virtue Ethics',
    description: 'Forget the rules and the results -- what would a genuinely good person do here? Integrity, courage, honesty aren\'t tools to get what you want. They\'re the point.',
    question: 'What would a person of good character do?'
  }
}

// Pre-defined conflict pairs — when a player uses both frameworks
// across different rounds, this tension is named explicitly
export const CONFLICT_PAIRS = [
  {
    frameworks: ['deontology', 'consequentialism'],
    tension: 'rule vs. outcome',
    description: 'You held a rule in one round and broke it for a better outcome in another. That tension — between duty and results — is the oldest debate in ethics.'
  },
  {
    frameworks: ['care', 'deontology'],
    tension: 'relationship vs. rule',
    description: 'You protected a relationship in one round and followed a duty in another. When does loyalty to a person override loyalty to a principle?'
  },
  {
    frameworks: ['care', 'consequentialism'],
    tension: 'one person vs. the many',
    description: 'You prioritized someone close to you in one round and the greater good in another. Care ethics asks: does distance reduce obligation?'
  },
  {
    frameworks: ['virtue', 'care'],
    tension: 'personal integrity vs. protecting someone you love',
    description: 'You acted from character in one round and from loyalty in another. When courage and compassion point in different directions, which defines who you are?'
  }
]
