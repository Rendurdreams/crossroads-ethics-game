import { KINGDOM_ARC_AXES } from '../../axisConstants.js'

export const realWorldModernPack = {
  id: 'real-world-modern',
  name: 'Common Ground',
  description: 'Six contemporary dilemmas drawn from real life — social media accountability, workplace ethics, community decisions, and the friction between loyalty and truth.',
  setting: 'real-world',
  ai_generated: false,
  generator_prompt: null,
  ethicalLens: 'What do you owe the people around you?',
  axisSet: KINGDOM_ARC_AXES,
  defaultWorldState: { trust: 50, courage: 50, solidarity: 50, awareness: 50 },
  scenarios: [
    {
      id: 'rw-round-1',
      title: 'The Screenshot',
      round: 1,
      weight: 'low',
      contentNote: null,
      moralTension: 'Loyalty vs. accountability — when does protecting a friend become enabling harm?',
      teaches: 'Care ethics introduced: the person in front of you has a claim, but so does the person they hurt',
      text: "Your close friend Jordan posted something this weekend — a mean-spirited joke targeting a classmate who has been quietly struggling all semester. The classmate hasn't seen it yet. Jordan doesn't know you saw it. The post has a handful of likes from mutual friends. It's not illegal, not over any line that the school would act on, but it's unkind in a way that would hurt if the classmate found it. Jordan would be mortified if you confronted them. Or they might not care at all — you're not sure which.",
      choices: [
        {
          choiceIndex: 0,
          text: 'Say nothing. It will probably disappear on its own.',
          frameworks: ['care'],
          consequence: "The post fades. The classmate never finds it. Three weeks later you notice Jordan has posted something similar about someone else. You wonder if the silence was a signal you didn't mean to send.",
          worldImpact: { trust: -4, courage: -8, solidarity: -4, awareness: -6 }
        },
        {
          choiceIndex: 1,
          text: 'Text Jordan privately. Tell them what you saw and why it bothers you.',
          frameworks: ['virtue', 'care'],
          consequence: "Jordan goes quiet for a day, then deletes the post. They never apologize — to you or the classmate. But the post is gone. The friendship survives with a new edge to it. You're not sure if that edge is respect or distance.",
          worldImpact: { trust: 6, courage: 10, solidarity: 4, awareness: 6 }
        },
        {
          choiceIndex: 2,
          text: 'Tell the classmate it exists so they can decide what to do with that information.',
          frameworks: ['deontology', 'virtue'],
          consequence: "The classmate finds the post and is hurt by it. They confront Jordan directly. It becomes a bigger conflict than you intended to start. Jordan doesn't speak to you for two weeks. The classmate, later, thanks you. It's complicated in a way that doesn't feel like victory.",
          worldImpact: { trust: 4, courage: 14, solidarity: -4, awareness: 10 }
        }
      ]
    },

    {
      id: 'rw-round-2',
      title: 'The Reference',
      round: 2,
      weight: 'low',
      contentNote: null,
      moralTension: 'Honesty vs. loyalty — what do you owe someone who trusted you with their reputation?',
      teaches: 'Deontology: what duties do we take on when we agree to vouch for someone?',
      text: "Your roommate Priya is applying for a competitive summer internship and has asked you to be a reference — someone who can speak to her work ethic and reliability. You care about Priya and want her to succeed. But over the last semester, you've watched her miss deadlines, bail on group responsibilities, and let other people cover for her. She's not a bad person, just genuinely struggling. The internship application gives you a form with one question: \"Would you recommend this person for a professional environment?\"",
      choices: [
        {
          choiceIndex: 0,
          text: 'Write a strong reference. She deserves the chance to grow into it.',
          frameworks: ['care'],
          consequence: "Priya gets the internship. She calls you the day she starts — nervous, grateful, trying. You hear from her mid-summer: she almost quit. By the end, she got a commendation from her supervisor. She grew into it. You'll never know if she would have without the chance.",
          worldImpact: { trust: 8, courage: -4, solidarity: 12, awareness: -4 }
        },
        {
          choiceIndex: 1,
          text: 'Be honest in your reference. Describe her strengths and the challenges you\'ve seen.',
          frameworks: ['deontology', 'virtue'],
          consequence: "Priya doesn't get the internship. She's devastated. She asks if you said something. You tell her the truth. The friendship takes a long pause. Months later she tells you it was the most honest thing anyone had ever done for her. You're not sure what to do with that.",
          worldImpact: { trust: 4, courage: 14, solidarity: -6, awareness: 10 }
        },
        {
          choiceIndex: 2,
          text: 'Tell Priya you\'re not the right person to reference her — and say why.',
          frameworks: ['consequentialism', 'virtue'],
          consequence: "Priya is hurt in the moment. She pushes back. Then she goes quiet, finds another reference, and gets the internship anyway. You learn about it later. You're relieved. Whether you made the right call for her — or just for yourself — stays an open question.",
          worldImpact: { trust: -2, courage: 8, solidarity: -4, awareness: 8 }
        }
      ]
    },

    {
      id: 'rw-round-3',
      title: 'The Group Chat',
      round: 3,
      weight: 'medium',
      contentNote: null,
      rights_dimension: true,
      moralTension: 'Bystander responsibility — does witnessing something make you part of it?',
      teaches: 'Virtue ethics: what would a person of good character do when the cost of acting is real but invisible?',
      text: "There is a group chat you've been part of since freshman year. You're not especially close with most of the people in it — it started as a study group and became something else. Over the last month, the conversation has shifted. One person in particular has been posting content about another student that started as gossip and is escalating into targeted harassment. The target doesn't know the chat exists. No one in the chat has said anything to stop it. You could leave. You could say something. You could screenshot and report it. Any of these costs you something.",
      choices: [
        {
          choiceIndex: 0,
          text: 'Leave the chat quietly. You didn\'t start it and you\'re not participating.',
          frameworks: ['consequentialism'],
          consequence: "You leave. The chat continues without you. You don't have to watch it anymore. The target eventually finds out about it through someone else — not you. You feel clean and irrelevant in equal measure. Bystanders always look clean from the outside.",
          worldImpact: { trust: -4, courage: -10, solidarity: -8, awareness: -4 }
        },
        {
          choiceIndex: 1,
          text: 'Post in the chat telling the group to stop. Publicly, where everyone can see.',
          frameworks: ['virtue', 'deontology'],
          rights_protective: true,
          consequence: "The chat goes quiet for a day. Some people leave. The main offender calls you sensitive and makes the next round of posts directly about you. Two people privately message you to say they were relieved someone said something. The harassment of the original target slows but doesn't fully stop. You said the thing. That's real.",
          worldImpact: { trust: 6, courage: 16, solidarity: 6, awareness: 10 }
        },
        {
          choiceIndex: 2,
          text: 'Screenshot and report it to the school\'s conduct office.',
          frameworks: ['deontology', 'consequentialism'],
          rights_protective: true,
          consequence: "An investigation opens. The school treats it as an active harassment case. The main poster receives a formal warning. The target is asked to participate in the process and finds out what was being said. They're grateful and horrified in equal parts. You're asked about your own role. You say you was a member of the chat. That's true.",
          worldImpact: { trust: 4, courage: 12, solidarity: 4, awareness: 14 }
        }
      ]
    },

    {
      id: 'rw-round-4',
      title: 'The Tip',
      round: 4,
      weight: 'medium',
      contentNote: null,
      moralTension: 'Individual loyalty vs. institutional accountability — what happens when someone you respect does something wrong?',
      teaches: 'Consequentialism vs. deontology: the calculation of harm isn\'t yours to make alone when others are affected',
      text: "Your mentor — a professor who wrote a pivotal recommendation letter for you and gave you your first real research opportunity — has started recycling old material. In a seminar, you recognized passages from an older paper and found them word-for-word in a recent lecture recorded and shared online. It's not plagiarism of another scholar; it's the professor's own earlier work, but it's being presented as new scholarship to your institution and, potentially, to grant agencies. You're the only student who noticed. Several people's careers and programs depend on this professor's continued success.",
      choices: [
        {
          choiceIndex: 0,
          text: 'Do nothing. You don\'t know the full picture, and it\'s not your fight.',
          frameworks: ['care'],
          consequence: "Nothing visible changes. A year later, another student notices the same pattern and reports it through a different channel. An investigation reveals a pattern going back several years. Your inaction protected no one. Your silence is documented as part of the timeline. You weren't asked — but you knew.",
          worldImpact: { trust: -6, courage: -12, solidarity: -4, awareness: -8 }
        },
        {
          choiceIndex: 1,
          text: 'Ask the professor directly, privately. Give them the chance to explain or correct it.',
          frameworks: ['care', 'virtue'],
          consequence: "The professor thanks you for coming to them first. Nothing changes publicly. You see the same pattern in the following semester. The private conversation gave them warning — and may have made them more careful about what you specifically see. You don't know what to call that.",
          worldImpact: { trust: 4, courage: 8, solidarity: -2, awareness: 6 }
        },
        {
          choiceIndex: 2,
          text: 'Report it to the academic integrity office with your documentation.',
          frameworks: ['deontology', 'virtue'],
          consequence: "An inquiry opens. The professor is formally questioned. They're not dismissed, but they lose a grant cycle and are asked to undergo a review process. They never speak to you again. Two junior researchers in the department who depended on the professor's projects are set back by the inquiry's uncertainty. The record is corrected. The cost is real.",
          worldImpact: { trust: -4, courage: 16, solidarity: -8, awareness: 14 }
        }
      ]
    },

    {
      id: 'rw-round-5',
      title: 'The Eviction',
      round: 5,
      weight: 'heavy',
      contentNote: "This scenario involves housing insecurity and a community facing displacement. The dilemma is about your role — not about the larger policy.",
      rights_dimension: true,
      moralTension: 'Proximity creates obligation — but how much, and at what cost to yourself?',
      teaches: 'Care ethics: the argument that we owe more to those close to us — and the question of what happens when everyone reasons this way',
      text: "A family on your block is being evicted Friday. You know them — their kids played in the street last summer. The eviction is technically legal; they are two months behind on rent. A local advocacy group has organized a presence at the building to slow the process — peaceful, legal, but potentially costly if the landlord calls the police, which they have done before. The group has asked your building to co-sign a public letter and show up Friday. Signing the letter could affect your own lease, which is up for renewal in three months. The family has no one else.",
      choices: [
        {
          choiceIndex: 0,
          text: 'Sign the letter and show up Friday.',
          frameworks: ['virtue', 'care'],
          rights_protective: true,
          consequence: "Fourteen neighbors show up. The eviction is delayed by two weeks through a procedural challenge. The family finds temporary housing. Your landlord sends you a letter noting your 'participation in building activities.' Your lease renewal comes with a rent increase they describe as 'market rate.' You can afford it, but barely.",
          worldImpact: { trust: 8, courage: 16, solidarity: 14, awareness: 8 }
        },
        {
          choiceIndex: 1,
          text: 'Sign the letter but don\'t show up. Solidarity from a distance.',
          frameworks: ['consequentialism'],
          consequence: "The letter has twelve signatures, including yours. The turnout on Friday is low. The eviction proceeds. The family leaves by Saturday. Someone from the advocacy group posts the co-signers' names. Your landlord calls you. The conversation is tense. You didn't even go.",
          worldImpact: { trust: -2, courage: -8, solidarity: -6, awareness: 4 }
        },
        {
          choiceIndex: 2,
          text: "Don't sign, don't show up. You can't risk your housing right now.",
          frameworks: ['care'],
          consequence: "Your lease renews without incident. The eviction proceeds. You see the family carrying boxes to a car on Friday afternoon. The kids don't wave. You tell yourself you had reasons. The reasons are real. So is what you saw through the window.",
          worldImpact: { trust: -6, courage: -12, solidarity: -14, awareness: -4 }
        }
      ]
    },

    {
      id: 'rw-round-6',
      title: 'The Algorithm',
      round: 6,
      weight: 'heavy',
      contentNote: "This scenario involves a decision about automated systems and community health data. No graphic content — but the stakes are systemic.",
      rights_dimension: true,
      moralTension: 'Efficiency vs. equity — who decides when the math works but the people don\'t?',
      teaches: 'Consequentialism challenged: when the outcome metric is flawed, optimizing for it is not the same as doing good',
      text: "You work as a student researcher on a city health department project. The team has developed an algorithm that predicts which households are at highest risk of preventable illness, using publicly available data. The system works — in aggregate, it has directed resources efficiently. But you've noticed something: the training data over-represents certain neighborhoods, and the algorithm has been systematically under-prioritizing an immigrant community in the northeast quadrant. The bias is statistically subtle but directionally consistent. Your supervisor — who has staked significant reputation on this system — wants to publish next month. You are the only analyst who has run this specific diagnostic.",
      choices: [
        {
          choiceIndex: 0,
          text: 'Raise it internally before publication. Give the team a chance to address it.',
          frameworks: ['care', 'consequentialism'],
          consequence: "Your supervisor delays publication by six weeks. The bias correction reduces overall efficiency metrics by 4%, which causes friction with the city funder. The corrected system is published. The northeast quadrant's resource allocation improves. Your supervisor credits the team generally. You're not named. The correction is real.",
          worldImpact: { trust: 8, courage: 10, solidarity: 10, awareness: 12 }
        },
        {
          choiceIndex: 1,
          text: 'Document your findings and send them to the department\'s equity review board.',
          frameworks: ['deontology', 'virtue'],
          rights_protective: true,
          consequence: "The equity review board flags the paper before publication. An external audit is commissioned. Publication is delayed six months. Your supervisor is formally questioned. The system is corrected. The community is better served. You are not invited back for the following semester's research cycle.",
          worldImpact: { trust: 4, courage: 18, solidarity: 8, awareness: 16 }
        },
        {
          choiceIndex: 2,
          text: "Stay quiet. You're a student researcher; it's not your call to make.",
          frameworks: ['consequentialism'],
          consequence: "The paper publishes. The system rolls out. Eighteen months later, a public health researcher at another university identifies the same bias pattern in published data. A correction is issued. The gap in service to the northeast quadrant is documented as a policy failure. Your name is on the original paper. You were a student researcher. That is also true.",
          worldImpact: { trust: -8, courage: -14, solidarity: -10, awareness: -12 }
        }
      ]
    },

    {
      id: 'rw-round-7',
      title: 'The Reckoning',
      round: 7,
      weight: 'reflective',
      contentNote: null,
      moralTension: 'Self-reflection',
      teaches: 'Metacognition — examining your own reasoning in contemporary contexts',
      text: "Was there a round where your gut said one thing and your reasoning said another? Which one did you follow — and looking back at it now, do you think that was the right call?",
      choices: []
    }
  ]
}
