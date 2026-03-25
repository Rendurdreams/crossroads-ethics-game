// The four ethical frameworks
export const FRAMEWORKS = {
  consequentialism: {
    name: 'Consequentialism',
    description: 'The right action is the one that produces the best outcome for the most people. Results justify means. Numbers matter.',
    question: 'What produces the best overall result?'
  },
  deontology: {
    name: 'Deontology',
    description: 'Some duties and rules are absolute. You must follow them regardless of outcome. Keeping a promise is right even if breaking it would help more people.',
    question: 'What does my duty require?'
  },
  care: {
    name: 'Care Ethics',
    description: 'Relationships and context matter most. Abstract principles ignore the real human in front of you. Proximity creates obligation.',
    question: 'What does this specific person need from me?'
  },
  virtue: {
    name: 'Virtue Ethics',
    description: 'Ask not what the rule says or what the outcome is — ask what a person of good character would do. Integrity, courage, honesty as ends in themselves.',
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
