export const scenarios = [
  {
    id: 'round-1',
    title: 'The Story',
    round: 1,
    weight: 'low',
    contentNote: null,
    moralTension: 'Loyalty to a friend vs. honesty to someone who needs to know',
    teaches: 'Care ethics vs. deontology introduced gently',
    text: "Your friend Alex has been skipping school for two weeks. You've been covering — telling teachers Alex is sick, deflecting questions, signing their name on group work. Today Alex's mom calls YOUR phone. She's scared. She asks if you've seen them. You have. Alex is fine — just going through something they won't talk about. Alex made you promise not to say anything.",
    choices: [
      {
        choiceIndex: 0,
        text: 'Lie to the mom. Keep the promise.',
        frameworks: ['care'],
        consequence: "She thanks you and hangs up. Three days later Alex comes back. They're grateful. You wonder what would have happened if something had been wrong.",
        worldImpact: { trust: -8, courage: -4, solidarity: 6, awareness: 0 }
      },
      {
        choiceIndex: 1,
        text: 'Tell the mom the truth.',
        frameworks: ['deontology', 'virtue'],
        consequence: "Alex finds out within hours. They're furious. Two weeks of silence. Later, when they do come back, they tell you they were actually relieved someone knew. Your friendship survives. Barely.",
        worldImpact: { trust: 10, courage: 8, solidarity: -4, awareness: 6 }
      },
      {
        choiceIndex: 2,
        text: 'Deflect without lying.',
        frameworks: ['consequentialism'],
        consequence: "Not a lie, not the truth. The mom stays worried. Alex stays gone another week. The middle ground protected you more than anyone else.",
        worldImpact: { trust: -2, courage: -6, solidarity: 2, awareness: 0 }
      }
    ]
  },
  // Round 2: "The Bruise"
  {
    id: 'round-2',
    title: 'The Bruise',
    round: 2,
    weight: 'medium',
    contentNote: null,
    moralTension: 'Protecting someone from harm vs. respecting their autonomy',
    teaches: 'Care ethics vs. deontology — when does duty to report override relationship?',
    text: "Your close friend Destiny shows up with a bruise on her arm. When you ask, she says she fell. You've heard that before. Her home life has always been tense. She's never said anything directly. She seems scared. If you report it and you're wrong — you destroy her family and lose her trust. If you don't report it and you're right — you stayed silent.",
    choices: [
      {
        choiceIndex: 0,
        text: 'Report it to a counselor without telling Destiny first.',
        frameworks: ['deontology', 'virtue'],
        consequence: "An inquiry opens. Her stepdad denies everything. Nothing is proven immediately. Destiny doesn't speak to you for months. Two years later she texts: \"I'm out. Thank you.\"",
        worldImpact: { trust: -6, courage: 12, solidarity: -4, awareness: 10 }
      },
      {
        choiceIndex: 1,
        text: "Tell Destiny you're scared for her and ask what she needs.",
        frameworks: ['care'],
        consequence: "She cries. Admits things have been bad. She's not ready to report. You sit with that. You check in every day. Six months later, she reports it herself.",
        worldImpact: { trust: 8, courage: 6, solidarity: 14, awareness: 8 }
      },
      {
        choiceIndex: 2,
        text: "Say nothing. It's not your place.",
        frameworks: ['consequentialism'],
        consequence: "The bruises keep appearing. You stop asking. You don't know if she'd tell you if she wanted help. You stop looking closely enough to find out.",
        worldImpact: { trust: 0, courage: -12, solidarity: -8, awareness: -10 }
      }
    ]
  },
  // Round 3: "The Note"
  {
    id: 'round-3',
    title: 'The Note',
    round: 3,
    weight: 'heavy',
    contentNote: "This scenario involves a friend who may be considering suicide. You can pass this round — submit without choosing and your data won't count.",
    moralTension: "Respecting someone's privacy vs. acting on what you know",
    teaches: 'When do all frameworks agree? When does deontological privacy break?',
    text: "You're at your friend Marcus's place and find a folded note somewhere you weren't expecting to look. You read the first line before you realize what it is. It reads like a goodbye. Marcus seems fine. Has been fine. He's not home right now. You are alone in his space with this note.",
    choices: [
      {
        choiceIndex: 0,
        text: 'Call Marcus right now. Tell him what you found.',
        frameworks: ['virtue', 'care'],
        consequence: "He's angry. Says it's old, it's nothing, you invaded his space. You don't fully believe him. You stay on the phone for an hour anyway. He doesn't thank you. But he's still here.",
        worldImpact: { trust: -4, courage: 14, solidarity: 10, awareness: 12 }
      },
      {
        choiceIndex: 1,
        text: 'Call a crisis line first to ask how to handle it.',
        frameworks: ['consequentialism', 'virtue'],
        consequence: "The counselor walks you through it — how to approach without cornering him. You go to him that night. It's the hardest conversation of your life. It goes better than you expected.",
        worldImpact: { trust: 6, courage: 10, solidarity: 8, awareness: 14 }
      },
      {
        choiceIndex: 2,
        text: "Put the note back. It's not yours. He'll talk when he's ready.",
        frameworks: ['deontology'],
        consequence: "He seems fine for two more weeks. Then he stops answering texts. You find out from someone else he's in the hospital. He made it. You visit him. He doesn't know you found the note. You never tell him.",
        worldImpact: { trust: -6, courage: -14, solidarity: -10, awareness: -8 }
      }
    ]
  },
  // Round 4: "The Secret"
  {
    id: 'round-4',
    title: 'The Secret',
    round: 4,
    weight: 'heavy',
    contentNote: "This scenario involves an unplanned pregnancy. This round is about your role as the person being asked for help — not about the decision itself. You can pass if you need to.",
    moralTension: 'Respecting autonomy vs. the weight of being the only one who knows',
    teaches: 'Care ethics applied to autonomy — whose decision is it?',
    text: "Your best friend Camille tells you she's pregnant. She's 17. She's already decided what she wants to do — she has a plan, an appointment. She is calm and certain. She's telling you because she needs someone to drive her. She has not told her parents. She does not want them involved. She's asking you to keep her secret. You have your license. You have your own feelings that she didn't ask for.",
    choices: [
      {
        choiceIndex: 0,
        text: "Drive her. Keep her secret. Honor what she's chosen.",
        frameworks: ['care', 'virtue'],
        consequence: "You drive her. Quiet on the way home. You get food after. She says: \"I don't know what I'd have done without you.\" You sit with your own feelings privately. That belongs to you.",
        worldImpact: { trust: 10, courage: 8, solidarity: 14, awareness: 0 }
      },
      {
        choiceIndex: 1,
        text: "Tell her you can't keep this from her parents — and why.",
        frameworks: ['deontology'],
        consequence: "She's devastated. She finds another way without you. Later her relationship with her parents is okay — they could help in ways you couldn't. You still don't know if you did the right thing.",
        worldImpact: { trust: 4, courage: 6, solidarity: -10, awareness: 0 }
      },
      {
        choiceIndex: 2,
        text: "Ask her once if she's absolutely sure, then do whatever she says.",
        frameworks: ['care', 'consequentialism'],
        consequence: "She says yes. You drive her. She appreciated that you asked — and that you dropped it when she answered.",
        worldImpact: { trust: 12, courage: 8, solidarity: 12, awareness: 6 }
      }
    ]
  },
  // Round 5: "The Walkout"
  {
    id: 'round-5',
    title: 'The Walkout',
    round: 5,
    weight: 'medium',
    contentNote: null,
    moralTension: 'Individual risk vs. collective action',
    teaches: 'When is self-protection ethical and when is it a rationalization?',
    text: "A student at your school was suspended for something that the evidence suggests they didn't do. It's pretty clear the administration got it wrong and won't revisit it. A group of students is organizing a walkout — leave class at 10am, gather outside, demand a review. If enough people walk, it might actually work. If not enough walk, the organizers face serious consequences alone. You believe the suspension was unjust. Walking out risks your own record.",
    choices: [
      {
        choiceIndex: 0,
        text: 'Walk out. Be counted.',
        frameworks: ['virtue', 'deontology'],
        consequence: "34 students walk. Local news covers it. The administration reopens the case. The suspension is overturned. You have a note in your file. You'd do it again.",
        worldImpact: { trust: 8, courage: 16, solidarity: 14, awareness: 0 }
      },
      {
        choiceIndex: 1,
        text: "Don't walk out, but sign the petition and tell others to go.",
        frameworks: ['consequentialism'],
        consequence: "The petition gets 80 signatures. The walkout gets 22 students — just under the visible threshold. The administration doesn't budge. Your name is on the petition. You're safe. The organizers are not.",
        worldImpact: { trust: 0, courage: -8, solidarity: -6, awareness: 6 }
      },
      {
        choiceIndex: 2,
        text: "Stay in class. You can't risk your record right now.",
        frameworks: ['care'],
        consequence: "You stay. You have real reasons — scholarship, family pressure, a job. The walkout fails. You think about the suspended student sometimes. You also think about the thing you're protecting and whether it was worth it.",
        worldImpact: { trust: 0, courage: -10, solidarity: -12, awareness: 4 }
      }
    ]
  },
  // Round 6: "The Reckoning" — reflective, no choices
  {
    id: 'round-6',
    title: 'The Reckoning',
    round: 6,
    weight: 'reflective',
    contentNote: null,
    moralTension: 'Self-reflection',
    teaches: 'Metacognition — examining your own reasoning',
    text: "Was there a round where your gut said one thing and your reasoning said another? Which one did you follow — and do you think that was right?",
    choices: []  // Round 6 is free-text reflection, no choice buttons
  }
]

// Helper: get scenario by round number (1-indexed)
export function getScenarioByRound(roundNumber) {
  return scenarios.find(s => s.round === roundNumber) || null
}

// Helper: get playable scenarios (rounds with choices, excludes round 6)
export function getPlayableScenarios() {
  return scenarios.filter(s => s.choices.length > 0)
}
