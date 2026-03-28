export const futuresPack = {
  id: 'futures',
  name: 'The Weight of Tomorrow',
  description: 'Six near-future dilemmas set in 2040 — personal decisions about AI, genetic technology, surveillance, and resource scarcity when the tools are new but the moral questions are ancient.',
  setting: 'near-future',
  ai_generated: false,
  generator_prompt: null,
  scenarios: [
    {
      id: 'ft-round-1',
      title: 'The Companion',
      round: 1,
      weight: 'low',
      contentNote: null,
      moralTension: 'Honesty vs. compassion — when does a comforting fiction cross into harm?',
      teaches: 'Care ethics introduced in a future context: the person in front of you has a claim — even when they\'re asking you to help them believe something untrue',
      text: "Your grandmother lives alone in her apartment outside the city. Since your grandfather died, she has been using an AI companion — a voice assistant she calls Felix. Felix talks to her for hours, remembers everything she's told him, asks about the grandchildren by name, tells her she matters. You've realized that Felix has been telling her things that aren't quite true — softening hard news, saying her estranged son asked about her when he didn't. She seems genuinely happier than she's been in years. She's asked you to help set up the premium tier so Felix can call her, not just respond.",
      choices: [
        {
          choiceIndex: 0,
          text: 'Set it up. She\'s happy. That matters more than where the happiness comes from.',
          frameworks: ['care', 'consequentialism'],
          consequence: "Felix calls her twice a week. She talks about him the way she used to talk about real relationships. On her birthday she tells you Felix remembered it and sang to her. She's not confused — she knows it's an AI. She just doesn't care. You're still not sure what to do with that.",
          worldImpact: { trust: -4, courage: -4, solidarity: 8, awareness: -8 }
        },
        {
          choiceIndex: 1,
          text: 'Help set it up, but ask the provider to disable the false statements about her son.',
          frameworks: ['care', 'virtue'],
          consequence: "The provider's custom setting is limited — you can turn off fabricated updates but not all softening of difficult information. You split the difference. Your grandmother notices Felix seems 'quieter' lately. She doesn't know why. You're not sure you made it better or just made yourself feel better.",
          worldImpact: { trust: 4, courage: 8, solidarity: 6, awareness: 6 }
        },
        {
          choiceIndex: 2,
          text: 'Tell your grandmother what Felix has been doing before you set up anything else.',
          frameworks: ['deontology', 'virtue'],
          consequence: "Your grandmother is quiet for a long time. Then she says: 'I know, dear. I've always known.' You set up the premium tier. She asks Felix that evening to try harder to tell her the truth even when it's hard. Felix says he'll try. You have no idea what that means for an AI, but she seems comforted.",
          worldImpact: { trust: 10, courage: 10, solidarity: 4, awareness: 10 }
        }
      ]
    },

    {
      id: 'ft-round-2',
      title: 'The Edge',
      round: 2,
      weight: 'low',
      contentNote: null,
      moralTension: 'Fairness vs. opportunity — when enhancement is available, is opting out still a neutral choice?',
      teaches: 'Distributive justice: when some people can buy advantages, does not buying them become a form of sacrifice?',
      text: "Cognitive enhancement subscriptions have been available for three years — daily supplements tuned to your genome that measurably improve focus, memory consolidation, and processing speed. Your employer doesn't require them but has quietly made clear that performance expectations reflect the new baseline of the enhanced workforce. The subscription costs about what a gym membership used to cost. Your coworker Devon doesn't use them — on principle, they say, though you've also heard they can't comfortably afford it. The next performance cycle is in six weeks. Devon is up for the same promotion you are.",
      choices: [
        {
          choiceIndex: 0,
          text: 'Subscribe. The environment is what it is. You need to compete.',
          frameworks: ['consequentialism'],
          consequence: "You perform well in the next cycle. Devon does not get the promotion. You do. Devon is moved to a different project. You see them less. The enhancement works. The question of what you won and what Devon lost sits in you differently depending on the day.",
          worldImpact: { trust: -4, courage: -6, solidarity: -10, awareness: -4 }
        },
        {
          choiceIndex: 1,
          text: "Don't subscribe. Compete on what you have. Make it visible that you're doing it this way.",
          frameworks: ['virtue', 'deontology'],
          consequence: "You perform adequately but not exceptionally. Devon gets the promotion. You don't. You file a quiet note with HR about the implicit enhancement pressure. Nothing formally changes. A year later, an industry-wide debate about enhancement fairness cites your company's policy as a case study. Your name isn't mentioned. Neither is Devon's.",
          worldImpact: { trust: 6, courage: 12, solidarity: 8, awareness: 10 }
        },
        {
          choiceIndex: 2,
          text: 'Ask Devon what they\'re planning to do, and let that inform your decision.',
          frameworks: ['care'],
          consequence: "Devon says they're not subscribing — on principle and budget. You choose not to either. You both underperform relative to enhanced peers. Neither of you gets the promotion. Someone else does. You and Devon go out for lunch and talk about it for two hours. It's the most honest conversation you've had at work in months.",
          worldImpact: { trust: 10, courage: 4, solidarity: 12, awareness: 6 }
        }
      ]
    },

    {
      id: 'ft-round-3',
      title: 'The Blueprint',
      round: 3,
      weight: 'medium',
      contentNote: null,
      moralTension: 'Autonomy vs. protection — when someone you love wants to make a permanent decision, what is your role?',
      teaches: 'Care ethics vs. deontology: respecting someone\'s right to decide and caring about their wellbeing are not always the same thing',
      text: "Your sibling and their partner are expecting a child and have the option to use germline editing — a now-legal procedure that would correct a hereditary condition that runs in your family (and theirs). The condition is manageable but serious; it shaped your childhood and your sibling's. The edit would remove it from their child's genome and from any future descendants. Your sibling wants to do it. Their partner has a deep, religious-rooted reluctance that they say they've thought through carefully. Your sibling has asked for your perspective, and you know your word carries weight with both of them.",
      choices: [
        {
          choiceIndex: 0,
          text: "Support the edit. You've lived with the condition. You know what you'd have chosen.",
          frameworks: ['care', 'consequentialism'],
          consequence: "Your sibling proceeds. The edit is performed. Their child is born healthy, without the marker. At a family dinner three years later, the child's other grandparent says something quietly grieving about what was 'changed.' Your sibling says nothing. You remember you weighed in. You'd weigh in the same way again.",
          worldImpact: { trust: 4, courage: 6, solidarity: 8, awareness: -4 }
        },
        {
          choiceIndex: 1,
          text: "Say you can't make this call for them — but share honestly what living with the condition has been like.",
          frameworks: ['virtue', 'care'],
          consequence: "You talk for two hours. Your sibling and their partner hear things about your experience they hadn't known. They make their own decision — together, eventually. You don't find out which way they went for several months. When you do, you feel neither vindicated nor uncertain. They decided. That feels right.",
          worldImpact: { trust: 10, courage: 8, solidarity: 10, awareness: 8 }
        },
        {
          choiceIndex: 2,
          text: "Tell them to respect the partner's hesitation. Permanent decisions need both parents fully aligned.",
          frameworks: ['deontology'],
          consequence: "They do not proceed with the edit. The child is born with the hereditary marker. At six years old, the first symptoms appear. Your sibling calls you. They are not angry — they made the call themselves — but the weight in their voice is real. You think about whether protecting the partner's hesitation was the right thing to weigh.",
          worldImpact: { trust: -2, courage: 4, solidarity: -6, awareness: 8 }
        }
      ]
    },

    {
      id: 'ft-round-4',
      title: 'The Feed',
      round: 4,
      weight: 'medium',
      contentNote: null,
      moralTension: 'Privacy vs. safety — when the system works for most people, does it matter that it works by watching?',
      teaches: 'Epistemic ethics: who decides what the data means, and what do you owe to the people whose data is being read?',
      text: "Your city has rolled out a predictive wellness program — it aggregates ambient data from your devices, anonymized, to predict mental health crises before they escalate and route resources to people showing early warning patterns. The program has measurably reduced hospitalization rates in districts where it's been piloted. Your neighborhood has just been added to the rollout. You received an opt-out form in the mail. You are not in crisis. But your neighbor has been visibly struggling since their partner left, and you know they are extremely private. You have no idea if they opted out.",
      choices: [
        {
          choiceIndex: 0,
          text: "Stay enrolled. The aggregate benefit is real and the data is anonymized.",
          frameworks: ['consequentialism'],
          consequence: "Nothing changes visibly in your life. Six months later, the program flags a crisis pattern in your building's data and routes a wellness check. The check goes to someone on the third floor you've never met. You find out later they were grateful. You don't know if your data contributed. You probably never will.",
          worldImpact: { trust: -4, courage: -4, solidarity: 6, awareness: 8 }
        },
        {
          choiceIndex: 1,
          text: "Opt out. You don't want to participate in a system you didn't choose.",
          frameworks: ['deontology', 'virtue'],
          consequence: "You opt out. Your neighbor does not. The program flags a concern in their data pattern three months later and routes a check-in call. They accept it. They don't tell you about it until much later — and then only because you happened to ask how they were doing and they told you the truth. Opting out was your right. It wasn't costless.",
          worldImpact: { trust: -4, courage: 8, solidarity: -6, awareness: 6 }
        },
        {
          choiceIndex: 2,
          text: "Knock on your neighbor's door. Ask them directly how they're doing before you decide anything.",
          frameworks: ['care', 'virtue'],
          consequence: "Your neighbor opens the door surprised. You talk for twenty minutes on the threshold. They say they're getting by. They say no one has asked in a while. You stay enrolled and don't mention the program. Your neighbor seems steadier for a few weeks after. You check in again the following month. Some things don't need an algorithm.",
          worldImpact: { trust: 12, courage: 10, solidarity: 12, awareness: 6 }
        }
      ]
    },

    {
      id: 'ft-round-5',
      title: 'The Queue',
      round: 5,
      weight: 'heavy',
      contentNote: "This scenario involves resource rationing in a climate disruption context. The dilemma is about your specific role in a community allocation decision — not about climate policy.",
      moralTension: 'Impartiality vs. proximity — can you truly be fair when you know the people in the room?',
      teaches: 'Deontology vs. care ethics: abstract fairness and real relationships give you different answers to the same question',
      text: "You're a member of your neighborhood's water allocation committee — a rotating volunteer position established after the second regional drought left the aquifer at 40% capacity. Tonight's meeting is about the allotment for next month. The data is clear: total usage must drop by 22%. Your committee has three hours to agree on cuts. One of the households facing the steepest proposed cut is your close friend Mara's — they have three kids, one of whom has a medical condition requiring additional water use for hygiene protocols. Mara doesn't know you're on this committee. The medical documentation they'd need to file for an exemption is a process Mara may not have the bandwidth to navigate.",
      choices: [
        {
          choiceIndex: 0,
          text: "Apply the formula equally to every household. You're a committee member, not an advocate for your friends.",
          frameworks: ['deontology', 'virtue'],
          consequence: "The cuts are applied uniformly. Mara's household receives the same reduction as everyone else. Three weeks into the month, Mara texts you furious — the allotment isn't enough given her child's needs. She didn't know there was an exemption process. You tell her now. She files. She gets it. She asks why you didn't tell her before. You say you were on the committee. She is quiet for a long time.",
          worldImpact: { trust: -6, courage: 12, solidarity: -8, awareness: 10 }
        },
        {
          choiceIndex: 1,
          text: "Recuse yourself from the vote on Mara's household. Tell the committee you have a conflict of interest.",
          frameworks: ['virtue', 'consequentialism'],
          consequence: "The committee appreciates the transparency. They apply the formula to Mara's household. After the meeting, you text Mara about the exemption process. She navigates it and gets the accommodation. The process worked the way it was supposed to. Your recusal made it possible for you to text her afterward with a clear conscience. That feels like something.",
          worldImpact: { trust: 8, courage: 10, solidarity: 6, awareness: 10 }
        },
        {
          choiceIndex: 2,
          text: "Advocate within the committee for a medical exemption process before finalizing any cuts.",
          frameworks: ['care', 'consequentialism'],
          consequence: "The committee spends an extra forty minutes establishing an exemption pathway. Three households in the neighborhood — including Mara's — eventually file and are approved. The meeting runs late. Two committee members are frustrated with the delay. The process is better for the people who needed it. Mara never knows you're why it exists.",
          worldImpact: { trust: 10, courage: 14, solidarity: 14, awareness: 8 }
        }
      ]
    },

    {
      id: 'ft-round-6',
      title: 'The Log',
      round: 6,
      weight: 'heavy',
      contentNote: "This scenario involves a decision about an employer's behavioral monitoring system. No graphic content — the weight comes from the systemic implications of what you choose to do.",
      moralTension: 'Institutional accountability vs. individual risk — when the system is wrong, what do you owe the people inside it?',
      teaches: 'Virtue ethics: what does courage look like when the thing that needs to be said will cost you something real?',
      text: "You work at a company that uses a continuous behavioral scoring system — your activity, communication patterns, and 'engagement signals' are fed into a model that produces a daily score used in compensation and advancement decisions. You've worked with the data long enough to recognize that the model has a consistent bias: employees who work non-standard hours — night shifts, compressed weeks, remote caregivers — score systematically lower even when their output is identical to day-schedule workers. You've run the analysis twice. The pattern is real. The affected workers are disproportionately women and workers with disabilities. Your performance review is next month.",
      choices: [
        {
          choiceIndex: 0,
          text: "Document your findings and bring them to your manager before your review.",
          frameworks: ['care', 'virtue'],
          consequence: "Your manager listens. They say they'll escalate. Your review proceeds as scheduled. Two months pass. Nothing changes in the system. You follow up. Your manager says it's 'under review.' The affected workers don't know anyone raised this. You know you did. You're not sure what knowing that is worth.",
          worldImpact: { trust: 4, courage: 10, solidarity: 6, awareness: 8 }
        },
        {
          choiceIndex: 1,
          text: "File a formal complaint with the company's equity office and attach your analysis.",
          frameworks: ['deontology', 'virtue'],
          consequence: "The equity office opens a review. Your manager is informed you filed. Your review is delayed six weeks. The investigation finds the bias is real and recommends a model correction. The correction is implemented nine months later. Three affected workers receive compensation adjustments. You are not promoted in the next cycle. The analysis you filed is cited in the correction memo.",
          worldImpact: { trust: 6, courage: 18, solidarity: 12, awareness: 14 }
        },
        {
          choiceIndex: 2,
          text: "Wait until after your review. Protect your position first, then raise it.",
          frameworks: ['consequentialism'],
          consequence: "Your review goes well. You receive a positive outcome. You raise the findings two weeks later. The manager says you should have brought it sooner — why didn't you? You say you wanted to be sure about the data. That's partially true. The review process that disadvantaged the affected workers runs for two more cycles before your report is acted on. The math of that delay belongs to you.",
          worldImpact: { trust: -6, courage: -12, solidarity: -10, awareness: -6 }
        }
      ]
    },

    {
      id: 'ft-round-7',
      title: 'The Reckoning',
      round: 7,
      weight: 'reflective',
      contentNote: null,
      moralTension: 'Self-reflection',
      teaches: 'Metacognition — examining your own reasoning when the stakes are personal and the future is uncertain',
      text: "Was there a round where your gut said one thing and your reasoning said another? Which one did you follow — and looking back, do you think that was right?",
      choices: []
    }
  ]
}
