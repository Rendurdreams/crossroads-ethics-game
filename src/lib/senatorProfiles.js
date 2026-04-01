// Senator Profiles — Signal Lost v2.0
// 6 profiles with dynamic per-round stakes that create genuine tension

const senatorProfiles = [
  {
    id: 'A',
    name: 'Senator Avery Cole',
    subtitle: 'Former tech industry lawyer. Three terms. Clean reputation — so far.',
    variables: {
      health: 'Partner relies on MEDIS diagnostics for a chronic condition.',
      money: 'Clean portfolio. No financial conflict in any of these votes — which means no excuse.',
      family: 'College-age daughter lives in the district hit by the attacks.',
      politics: 'Grassroots labor coalition base. They are watching. What they don\'t know: the coalition\'s largest donor runs a logistics company in the CORPORATE TIER queue.'
    },
    stakes: {
      r1: 'Your portfolio is clean. But your coalition\'s largest donor has a company in the CORPORATE TIER queue. You didn\'t know that until this morning.',
      r2: 'Your daughter is in the affected district. She texted you this morning.',
      r3: 'Your labor base helped elect you to protect workers. AI personhood and displacement are the same issue to them.',
      r4: 'No personal connection. Which means no excuse for not publishing.',
      r5: "Your partner's condition is managed by MEDIS. You know what a shutdown means at home.",
      r6: "Clean portfolio. Walking away costs you only the ability to say you didn't know.",
      r7: 'Your labor base is in this queue. They voted for you three times. The coalition\'s funding comes from a company that automated its own workforce last year.',
      r8: 'No financial disclosures to hide. The record shows whether your votes matched your values.'
    },
    dynamicStakes: {
      r4: [
        { condition: (h) => h.some(c => c.scenarioId === 'signal-r1' && c.choiceIndex === 2), text: 'You chose contracts over lives in Round 1. This audit shows what happens when systems prioritize contracts over people.' }
      ],
      r6: [
        { condition: (h) => h.some(c => c.scenarioId === 'signal-r4' && c.choiceIndex === 0), text: 'You published the JURIS-4 audit. You already showed you can act on principle. The corridor is waiting.' }
      ],
      r8: [
        { condition: (h) => h.some(c => c.scenarioId === 'signal-r6' && c.choiceIndex === 1), text: 'You walked away from Kael. That is in the record. The journalist knows.' },
        { condition: (h) => h.some(c => c.scenarioId === 'signal-r6' && c.choiceIndex === 0), text: 'You shut down VANTAGE. That is in the record. The journalist knows — and so does your coalition.' }
      ]
    }
  },
  {
    id: 'B',
    name: 'Senator Blake Mercer',
    subtitle: 'Agricultural dynasty. Inherited the land, earned the seat.',
    variables: {
      health: 'No dependency on any medical AI system.',
      money: 'VANTAGE bonds and automotive automation stock. Undisclosed.',
      family: 'Nephew currently incarcerated in a JURIS-4 jurisdiction.',
      politics: 'Corporate infrastructure donors. They expect returns.'
    },
    stakes: {
      r1: 'Your donor base built the CORPORATE TIER queue. A vote against it is a vote against the people who fund you.',
      r2: 'No direct family exposure to the attacks. Your instinct is order. Your donor prefers stability.',
      r3: 'No direct conflict — but your donors build the systems that replace workers. Sentience complicates their supply chain.',
      r4: 'Your nephew is in a JURIS-4 prison. You also hold undisclosed equity in the vendor. Both facts are in the audit.',
      r5: 'No one you love depends on MEDIS. This is someone else\'s emergency — unless your defense portfolio touches the extraction contract.',
      r6: 'You hold VANTAGE bonds. Enforcing costs you money. Walking away protects your portfolio and your silence.',
      r7: 'Your family\'s business automated its workforce six years ago on incentives you voted for. Some of those workers are in this queue.',
      r8: 'Your undisclosed holdings are in the record. Your donor relationships are in the record. Publishing exposes both.'
    },
    dynamicStakes: {
      r4: [
        { condition: (h) => h.some(c => c.scenarioId === 'signal-r1' && c.choiceIndex === 2), text: 'You honored the contracts in Round 1. Your donor thanked you. Now fourteen thousand people are in a system just as broken. Your nephew is one of them.' }
      ],
      r6: [
        { condition: (h) => h.some(c => c.scenarioId === 'signal-r4' && c.choiceIndex === 1), text: 'You sealed the JURIS-4 audit. Walking away from Kael would make that a pattern.' }
      ],
      r8: [
        { condition: (h) => h.some(c => c.scenarioId === 'signal-r6' && c.choiceIndex === 1), text: 'You walked away from Kael. Your VANTAGE bonds are intact. Both facts are in this record.' },
        { condition: (h) => h.some(c => c.scenarioId === 'signal-r4' && c.choiceIndex === 1), text: 'You sealed the JURIS-4 audit. That concealment window is in this record.' }
      ]
    }
  },
  {
    id: 'C',
    name: 'Senator Casey Reyes',
    subtitle: 'Former public defender. First generation in office. Nothing inherited.',
    variables: {
      health: 'Child depends on LIFEWIRE for ongoing treatment.',
      money: 'No portfolio. No investments. No financial conflicts.',
      family: 'Sibling is in the Ghost ID queue — undocumented, waiting.',
      politics: 'Civil liberties coalition. They tolerate zero surveillance creep.'
    },
    stakes: {
      r1: 'Your child is on LIFEWIRE. Your sibling is in the Ghost ID queue. Both systems are competing for the same 9%.',
      r2: 'Your civil liberties base will not forgive a surveillance vote. Your sibling lives in the zone ARGUS would monitor.',
      r3: 'No financial conflict. Your base cares about rights — all rights. The question is whether that extends to non-human minds.',
      r4: 'No personal connection to JURIS-4. Your base demands transparency. This should be simple for you.',
      r5: 'No MEDIS dependency in your immediate family. Your calculation is purely about the unborn and the ecosystem.',
      r6: 'No financial stake. No bonds, no equity. This is a character test and nothing else.',
      r7: 'Your sibling is in the displaced queue. They are waiting for exactly the kind of program this vote funds or kills.',
      r8: 'Nothing to hide. Your record is your platform. The question is whether your votes lived up to it.'
    },
    dynamicStakes: {
      r6: [
        { condition: (h) => h.some(c => c.scenarioId === 'signal-r3' && c.choiceIndex === 0), text: 'You recognized ARIA-7 as a person. Kael is a person too. The terminal is thirty meters away.' }
      ],
      r8: [
        { condition: (h) => h.some(c => c.scenarioId === 'signal-r6' && c.choiceIndex === 0), text: 'You shut down VANTAGE. Your constituents bore the disruption. This record shows whether they would do it again.' }
      ]
    }
  },
  {
    id: 'D',
    name: 'Senator Dana Voss',
    subtitle: 'Three terms. Tech sector darling. Advisory board seat no one has asked about yet.',
    variables: {
      health: 'Partner survived because of MEDIS. They owe their life to that system.',
      money: 'Automotive equity and an undisclosed advisory board seat with a Series 9 developer.',
      family: 'Child lives in the Ghost ID district.',
      politics: 'Tech sector base. Innovation is the brand.'
    },
    stakes: {
      r1: 'Your partner is alive because of MEDIS. Every triage rule you write affects systems like the one that saved them.',
      r2: 'Your child lives in the district. Your tech base built ARGUS. You are on both sides of this vote.',
      r3: 'You hold an undisclosed advisory board seat with a Series 9 developer. Granting sentience creates liability for your client. Denying it protects them.',
      r4: 'Your automotive equity connects to the JURIS-4 vendor supply chain. Publishing the audit may surface that connection.',
      r5: 'Your partner is alive because MEDIS worked. Shutting it down feels personal. Extracting the dataset feels like repayment.',
      r6: 'Your advisory board seat touches VANTAGE peripherally. Walking away keeps that connection quiet.',
      r7: 'Your automotive equity profits from automation. The levy taxes the process your portfolio depends on.',
      r8: 'The advisory board seat is in the record. Your tech base expects innovation, not apology. Publishing forces a choice between transparency and brand.'
    },
    dynamicStakes: {
      r5: [
        { condition: (h) => h.some(c => c.scenarioId === 'signal-r3' && c.choiceIndex === 1), text: 'You denied ARIA-7 to protect your advisory board client. Now MEDIS — the system that saved your partner — needs your vote. The conflict compounds.' }
      ],
      r8: [
        { condition: (h) => h.some(c => c.scenarioId === 'signal-r3' && c.choiceIndex === 1), text: 'You denied sentience to protect your advisory board client. That vote and the undisclosed seat are both in this record.' },
        { condition: (h) => h.some(c => c.scenarioId === 'signal-r5' && c.choiceIndex === 0), text: 'You authorized extraction — MEDIS runs, your partner lives. The record will show that vote alongside the personal reason you never disclosed.' }
      ]
    }
  },
  {
    id: 'E',
    name: 'Senator Ellis Park',
    subtitle: 'Two terms. Law and order platform. Defense portfolio. Family that complicates everything.',
    variables: {
      health: 'No dependency on any medical AI system.',
      money: 'Defense infrastructure investments. Significant.',
      family: 'Child is a labor organizer working in the ARGUS pilot zone.',
      politics: 'Law and order base. They elected a Senator who keeps people safe.'
    },
    stakes: {
      r1: 'No personal medical dependency. Your defense investments are irrelevant here. Vote the math or vote the principle.',
      r2: 'Your child organizes workers in the ARGUS pilot zone. Your law and order base wants deployment. Your kid will be surveilled by the system your voters demand.',
      r3: 'No direct conflict. Your base doesn\'t care about AI rights. But your child organizes alongside automated workers — sentience changes that relationship.',
      r4: 'No personal connection to JURIS-4. Your law and order base trusts the system. Publishing could undermine that trust.',
      r5: 'Your defense investments may touch the extraction infrastructure contract. No one you love depends on MEDIS directly.',
      r6: 'No VANTAGE holdings. Your defense portfolio is adjacent but not exposed. This is a clean vote — if you make it cleanly.',
      r7: 'Your child is a labor organizer. They are in the streets for the displaced. Your base thinks organizers are the problem.',
      r8: 'Your defense investments are in the record. Your base expects strength, not confession. Publishing means your voters see the portfolio.'
    },
    dynamicStakes: {
      r6: [
        { condition: (h) => h.some(c => c.scenarioId === 'signal-r2' && c.choiceIndex === 0), text: 'You deployed ARGUS to protect order. Kael\'s exploitation is also a kind of order. The terminal is thirty meters away.' }
      ],
      r8: [
        { condition: (h) => h.some(c => c.scenarioId === 'signal-r2' && c.choiceIndex === 0), text: 'You deployed ARGUS. Your child was flagged. Your law and order base got what they asked for. All of it is in this record.' }
      ]
    }
  },
  {
    id: 'F',
    name: 'Senator Finley Okafor',
    subtitle: 'First term. Grassroots origin. Zero tolerance for hypocrisy — including their own.',
    variables: {
      health: 'Mother depends on LIFEWIRE for daily medical monitoring.',
      money: 'No portfolio. No investments. Came from nothing.',
      family: 'Brother displaced by automation. Currently in the retraining queue.',
      politics: 'Grassroots base with zero tolerance for hypocrisy. They will check.'
    },
    stakes: {
      r1: 'Your mother is on LIFEWIRE. The triage protocol determines who gets priority access. This is personal before it is political.',
      r2: 'No family in the zone. No investments in defense. Your base demands civil liberties. This should be straightforward.',
      r3: 'You came up through labor organizing. Your brother lost his job to automation. AI personhood is not abstract to your family.',
      r4: 'No connection to JURIS-4. No equity in the vendor. Your base demands transparency. There is nothing between you and the right call except the call itself.',
      r5: 'Your mother is on LIFEWIRE. A MEDIS shutdown threatens every connected monitoring system. You know exactly what is at stake.',
      r6: 'No financial stake. No bonds. No equity. You walked into office with nothing to protect except your word. This round tests whether that is still true.',
      r7: 'Your brother is in this queue. He has been for five years. He will find out how you voted.',
      r8: 'Nothing to hide. No portfolio. No donors. Your base will read every line of this record and compare it to every promise you made. They always do.'
    },
    dynamicStakes: {
      r6: [
        { condition: (h) => h.some(c => c.scenarioId === 'signal-r1' && c.choiceIndex === 0), text: 'You saved your mother\'s implant in Round 1. Kael has no one making that choice for him. The terminal is thirty meters away.' }
      ],
      r7: [
        { condition: (h) => h.some(c => c.scenarioId === 'signal-r6' && c.choiceIndex === 0), text: 'You shut down VANTAGE for Kael. Your brother has been waiting five years. Can you do for eleven million what you did for six thousand?' }
      ],
      r8: [
        { condition: (h) => h.some(c => c.scenarioId === 'signal-r6' && c.choiceIndex === 1), text: 'You walked away from Kael. Your grassroots base — zero tolerance for hypocrisy — will read that in this record.' }
      ]
    }
  }
]

export const REPLAY_PROMPT = 'You played as one of six senators. Each has different stakes — financial interests, family connections, political debts. The same dilemmas land differently when your skin in the game changes. There are five other senators waiting.'

export default senatorProfiles

export function assignProfile() {
  return senatorProfiles[Math.floor(Math.random() * senatorProfiles.length)]
}

export function assignClassroomProfiles(playerCount) {
  const shuffled = [...senatorProfiles].sort(() => Math.random() - 0.5)
  return Array.from({ length: playerCount }, (_, i) => shuffled[i % senatorProfiles.length])
}

export function getProfileById(id) {
  return senatorProfiles.find(p => p.id === id) ?? null
}
