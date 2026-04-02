import { KINGDOM_ARC_AXES } from '../../axisConstants.js'

export const kingdomArcPack = {
  id: 'kingdom-arc',
  name: 'Kingdom of Ash',
  description: 'Eight moral dilemmas in a fantasy kingdom arc — from resource scarcity to civilizational reckoning. Based on Frostpunk\'s "creeping normality" design and Kohlberg\'s moral development research.',
  setting: 'fantasy',
  ai_generated: false,
  generator_prompt: null,
  ethicalLens: 'What does a ruler owe?',
  axisSet: KINGDOM_ARC_AXES,
  defaultWorldState: { trust: 50, courage: 50, solidarity: 50, awareness: 50 },
  scenarios: [
    {
      id: 'round-1',
      title: 'The Divided Harvest',
      round: 1,
      weight: 'low',
      contentNote: null,
      rights_dimension: true,
      moralTension: 'Who actually deserves to eat?',
      teaches: 'You just decided who gets resources when there isn\'t enough for everyone. The hard part isn\'t the math — it\'s that real people are on both ends of your choice. Would you have decided differently if you didn\'t know which side you\'d be on?',
      text: "A brutal frost has killed half the kingdom's crops. Your storehouses hold enough grain to keep the capital fed through winter — but the outer villages will starve. Villagers are already arriving at the gates, gaunt and desperate. Your advisors present two paths. Everyone inside these walls is watching you.",
      choices: [
        {
          choiceIndex: 0,
          text: 'Share equally. Distribute all grain across the kingdom.',
          frameworks: ['care', 'consequentialism'],
          rights_protective: true,
          consequence: "Everyone eats less. The capital's production slows. Some of the very old and very young don't survive the cold. But when spring comes, every village is still standing. You visit the frontier towns. They remember you came.",
          conscienceLayer: "Your advisors sleep soundly. You lie awake counting the people the capital's workers might have saved if they were stronger.",
          worldImpact: { trust: 6, courage: 4, solidarity: 14, awareness: 4 }
        },
        {
          choiceIndex: 1,
          text: 'Protect the core. Keep the grain in the capital.',
          frameworks: ['consequentialism'],
          consequence: "The kingdom's builders and healers stay strong. The infrastructure survives intact. Word reaches you in spring that four frontier villages didn't make it. You tell yourself it was the only way. You're still telling yourself that.",
          conscienceLayer: "The capital thrives. A trail of refugee figures appears at sealed gates.",
          worldImpact: { trust: -10, courage: 4, solidarity: -14, awareness: -4 }
        },
        {
          choiceIndex: 2,
          text: 'Triage. Send emergency rations to the most vulnerable villages only.',
          frameworks: ['deontology', 'virtue'],
          consequence: "Your scouts identify who is closest to death and you go there first. It means some villages get nothing and some get enough. The capital grumbles. The saved villages don't know how close it was. You do.",
          conscienceLayer: "Some villages are saved. Others are not. You will never know if you chose correctly.",
          worldImpact: { trust: 2, courage: 8, solidarity: 4, awareness: 10 }
        }
      ],
      hostNotes: [
        'Frameworks: Care Ethics + Consequentialism (share equally) vs. pure Consequentialism (protect the core) vs. Deontology + Virtue (triage by need). Say: "This is the classic utilitarian dilemma — greatest good for the greatest number. But notice: the care ethics choice and the consequentialist choice overlap on option A. They agree on action but for completely different reasons."',
        'Watch for: students who chose B (protect the core) — they used consequentialism too, but defined "best outcome" differently. That split is the whole problem with "greatest good" — who defines good?',
        'Connection to morals vs ethics: your gut reaction (moral intuition) might say "share equally" because it feels fair. Consequentialism as a framework asks you to prove it actually produces the best result. Sometimes fairness and outcomes conflict.'
      ],
      discussionPrompts: [
        'Choices A and B are both consequentialist — they just disagree about which outcome matters most. What does that tell you about consequentialism as a framework?',
        'If you chose C (triage), you prioritized the most vulnerable. Is that a rule you would follow every time, or did this specific situation make it feel right?',
        'Would your answer change if you knew which village you lived in?'
      ]
    },

    {
      id: 'round-2',
      title: 'The Ember Watch',
      round: 2,
      weight: 'low',
      contentNote: null,
      moralTension: 'Safety and freedom pull in opposite directions — and you can\'t have all of both.',
      teaches: 'When you gave up one to protect the other, who benefited? Who paid for it? And once that power is granted, what makes you confident it gets handed back?',
      text: "Something is moving in the Ashlands beyond your borders. Scouts report strange fires, ruined caravans, a growing darkness. Your people are afraid. Your Marshal urges immediate action. Your Elder Council urges caution. Two proposals reach your desk — and everyone is watching to see what kind of ruler you are.",
      choices: [
        {
          choiceIndex: 0,
          text: 'The Iron Protocol. Watchtowers, curfews, travel writs, civil patrols.',
          frameworks: ['consequentialism'],
          consequence: "The kingdom becomes safer and more rigid. Citizens walk in orderly lines, watched. The threat at the border slows. Years later, when the danger has passed, the curfew is still in place. The Marshal says it would be unwise to lift it now.",
          conscienceLayer: "Order holds. Six months later your citizens need writs to visit their neighbors.",
          worldImpact: { trust: -10, courage: -4, solidarity: -4, awareness: 12 }
        },
        {
          choiceIndex: 1,
          text: 'The Open Flame. Issue warnings, arm volunteers, trust your people.',
          frameworks: ['virtue', 'care'],
          consequence: "Citizens organize. Neighborhoods form their own watches. Some are attacked before they can respond. You attend the funerals. The community that forms around the shared danger is real — and you would not have built it by order.",
          conscienceLayer: "Your people feel trusted. Two border villages burn.",
          worldImpact: { trust: 8, courage: 14, solidarity: 8, awareness: -8 }
        },
        {
          choiceIndex: 2,
          text: 'Border protocols only. Writ requirements for inter-territory travel, nothing inside the towns.',
          frameworks: ['deontology', 'consequentialism'],
          consequence: "The half-measure satisfies no one. Border folk feel singled out. City dwellers feel exposed. The threat doesn't honor the line you drew. But you held something of each principle, and you can live with the weight of that.",
          conscienceLayer: "A compromise that satisfies no one — and may protect everyone.",
          worldImpact: { trust: -2, courage: 2, solidarity: 2, awareness: 6 }
        }
      ],
      hostNotes: [
        'Frameworks: Consequentialism (Iron Protocol — safety maximizes outcomes) vs. Virtue + Care (Open Flame — trust and courage) vs. Deontology + Consequentialism (conditional measure — rules with limits). Say: "This is the security vs. liberty tradeoff. Every framework gives you a different answer about when it is okay to restrict freedom."',
        'Watch for: how many students chose the Iron Protocol — it is the most popular choice in pilot tests. Ask them: at what point does a temporary safety measure become permanent? That is the consequentialist blind spot.',
        'Connection to morals vs ethics: most people morally feel that safety matters. But deontology says some rights cannot be traded away even for safety. The tension between "I want to be safe" (moral feeling) and "rights are non-negotiable" (ethical principle) is the lesson.'
      ],
      discussionPrompts: [
        'If you chose the Iron Protocol, when would you lift it? What conditions would have to be true? And who decides?',
        'The Open Flame option trusts people but some of them die. Is trusting people ethical if it gets them killed?',
        'Can you name a real-world example where a temporary security measure became permanent?'
      ]
    },

    {
      id: 'round-3',
      title: 'The Hollow Folk',
      round: 3,
      weight: 'medium',
      contentNote: null,
      rights_dimension: true,
      moralTension: 'At what point does someone stop being a tool and start being a person?',
      teaches: 'The Hollow Folk told you directly — they think, they feel, they remember. What you decided next says something about what you believe personhood actually requires.',
      text: "For generations, the Hollow Folk — beings shaped from stone and starlight — have built your roads, worked your mines, tended your fields. They do not eat, sleep, or tire. Your civilization's prosperity rests on their labor. Last night, a delegation appeared before your throne. They spoke. They said: \"We think. We feel. We remember. We are asking to be recognized as citizens.\" Your advisors are divided.",
      choices: [
        {
          choiceIndex: 0,
          text: 'Grant citizenship. Full rights, wages, representation, the ability to refuse.',
          frameworks: ['deontology', 'virtue'],
          rights_protective: true,
          consequence: "The economy reshapes overnight. Some projects stall. Luxury buildings go unfinished. Mixed neighborhoods form where boundaries once stood. A Hollow Folk elder is elected to the council. They are the best vote you've ever counted.",
          conscienceLayer: "The kingdom adjusts slowly and painfully. The Hollow Folk begin, for the first time, to smile.",
          worldImpact: { trust: 8, courage: 16, solidarity: 10, awareness: 10 }
        },
        {
          choiceIndex: 1,
          text: 'Deny the petition. They were made, not born. The order holds.',
          frameworks: ['consequentialism'],
          consequence: "The economy continues. The Hollow Folk return to work. You saw them at the throne — the way they stood, the way they waited. They heard your answer. They go back to building your roads. That is the part you will carry.",
          conscienceLayer: "The delegation returns to the mines. One of them looks back at you.",
          worldImpact: { trust: -8, courage: -12, solidarity: -8, awareness: -8 }
        },
        {
          choiceIndex: 2,
          text: 'Issue a limited charter. Rest, safety protections, formal hearings — citizenship deferred.',
          frameworks: ['care', 'consequentialism'],
          consequence: "The Hollow Folk accept. Three years of deliberation follow. Full recognition comes — eventually. But some who petitioned have grown quieter by the time it arrives. Not in defeat. In the particular way of beings who have learned not to expect. The rights come. The wait cost something.",
          conscienceLayer: "You bought time. The question remains. So does the cost.",
          worldImpact: { trust: 4, courage: 2, solidarity: 4, awareness: 6 }
        }
      ],
      hostNotes: [
        'Frameworks: Deontology + Virtue (free them — personhood creates duties) vs. Consequentialism (keep them working — outcomes matter more) vs. Care + Consequentialism (gradual transition — protect relationships and minimize disruption). Say: "This round is about moral status. Deontology says if something can think and feel, you have a duty to it. Consequentialism asks whether acting on that duty is worth the cost."',
        'Watch for: students who chose B (keep them working) — push on what criteria they used to deny personhood. That reasoning mirrors real historical arguments used to justify forced labor.',
        'Connection to morals vs ethics: most people morally feel uncomfortable with slavery. But when the system depends on it, consequentialism can rationalize continuation. This is where moral intuition and ethical reasoning should agree — and the round tests whether they do.'
      ],
      discussionPrompts: [
        'What would the Hollow Folk need to do or say for you to consider them people? And is that standard fair?',
        'If freeing them collapses the economy, does that change whether they deserve freedom? Why or why not?',
        'Name the ethical framework that best justifies your choice — and then name the one that most challenges it.'
      ]
    },

    {
      id: 'round-4',
      title: 'The Sealed Archive',
      round: 4,
      weight: 'medium',
      contentNote: null,
      moralTension: 'Is it ever okay to decide what other people are ready to know?',
      teaches: 'You had information that affected everyone in the kingdom — and you chose who got to have it. The moment that felt reasonable, you became the exact kind of authority most people say they\'d never trust.',
      text: "Your scholars have made a devastating discovery. The Hearthstone — the ancient artifact shielding your civilization from the Ashlands — is not simply protecting you. It is slowly draining life from the land itself. In roughly three generations, the soil will be dead. The power is real, but it is borrowing against the future. If you reveal this, panic may shatter the kingdom. If you stay silent, your people live in comfortable ignorance while the clock ticks.",
      choices: [
        {
          choiceIndex: 0,
          text: 'Reveal the truth. Your people deserve to know what threatens them.',
          frameworks: ['deontology', 'virtue'],
          consequence: "Fear moves through the kingdom like weather. Factions argue. Some demand the Hearthstone be destroyed now; others call your scholars liars. A new generation of researchers forms who would never have existed without the urgency. The chaos is real. So is the work.",
          conscienceLayer: "Panic, then resolve. A new generation grows up knowing the truth and working toward it.",
          worldImpact: { trust: 6, courage: 14, solidarity: -8, awareness: 16 }
        },
        {
          choiceIndex: 1,
          text: 'Seal the archive. Commission a secret council to solve it quietly.',
          frameworks: ['consequentialism'],
          consequence: "The kingdom stays calm. The scholars work in candlelit rooms. Rumors begin within a year — someone talked. You spend more energy managing the leak than solving the problem. The secret is too large for any number of people to hold for long.",
          conscienceLayer: "The council meets in secret. You sleep well. The soil does not.",
          worldImpact: { trust: -6, courage: -12, solidarity: 4, awareness: -14 }
        },
        {
          choiceIndex: 2,
          text: 'Tell your council of seven. Give them one year before any public disclosure.',
          frameworks: ['care', 'consequentialism'],
          consequence: "The council fractures immediately. Three want full disclosure. Two want permanent suppression. Two disappear into the archive. The secret is already too large for seven people. You have bought time. You have also created seven people who now carry what you carry.",
          conscienceLayer: "One year becomes two. The council grows comfortable with silence.",
          worldImpact: { trust: -4, courage: 2, solidarity: -2, awareness: 8 }
        }
      ],
      hostNotes: [
        'Frameworks: Deontology + Virtue (release everything — truth is a duty) vs. Consequentialism (seal it — bad outcomes justify withholding) vs. Care + Consequentialism (controlled release — protect people from harmful information gradually). Say: "This is about paternalism. Consequentialism says it is okay to control information if the outcome is better. Deontology says truth is not yours to withhold."',
        'Watch for: the split between A (full release) and C (controlled release). Both value truth but disagree on timing. That disagreement reveals whether you think people have an unconditional right to know or a conditional one.',
        'Connection to morals vs ethics: morally, most people say they value honesty. But when honesty could cause panic or harm, we see the gap between the moral value (honesty matters) and the ethical calculation (but not right now, not like this).'
      ],
      discussionPrompts: [
        'Who gets to decide what other people are "ready" to hear? What makes that person qualified?',
        'If you chose to seal the archive — how is that different from lying?',
        'Is there information in the real world that governments or institutions withhold "for your own good"? Do you think they should?'
      ]
    },

    {
      id: 'round-5',
      title: 'The Last Wellspring',
      round: 5,
      weight: 'heavy',
      contentNote: null,
      moralTension: 'You made a decision for people who weren\'t in the room — and never will be.',
      teaches: 'The people dying today had faces. The people who inherit the consequences of your choice haven\'t been born yet. That gap is where almost every major crisis in the real world lives.',
      text: "Deep beneath the mountains lies the Wellspring — the final reservoir of creation-magic left in the world. Your ancestors sealed it with a warning: \"For those who come after.\" Now the Ashlands have breached your outer defenses. Villages burn. Refugees pour inward. The Wellspring's power could end this crisis in a single burst. But it is finite. Use it now, and it is gone forever. Leave it sealed, and people die today — people with names.",
      choices: [
        {
          choiceIndex: 0,
          text: 'Open the Wellspring. Save the people in front of you.',
          frameworks: ['care', 'consequentialism'],
          consequence: "A burst of golden light sweeps the kingdom. Walls rebuild. Fields green. The sick rise. The world is restored. A deep, permanent hollow opens beneath the mountains where the Wellspring was. Your children's children will face their crisis with nothing in reserve.",
          conscienceLayer: "The crisis ends. The Wellspring is gone. Your grandchildren will never know what they lost.",
          worldImpact: { trust: 4, courage: 8, solidarity: 14, awareness: -10 }
        },
        {
          choiceIndex: 1,
          text: 'Keep it sealed. Honor your ancestors. The future must be protected.',
          frameworks: ['deontology', 'virtue'],
          consequence: "People die who might have lived. You attend what funerals you can. The Wellspring glows beneath the mountain, steady and intact. The world is battered and scarred. There is a buried warmth in knowing something has been preserved. That warmth does not make the losses easier.",
          conscienceLayer: "People die today with names you will learn. The future remains possible.",
          worldImpact: { trust: 4, courage: 14, solidarity: -12, awareness: 8 }
        },
        {
          choiceIndex: 2,
          text: 'Partial draw. Stabilize the worst of it, then seal it immediately.',
          frameworks: ['consequentialism'],
          consequence: "The immediate crisis holds. The Wellspring is neither full nor empty. You have saved today and made tomorrow harder to defend — and set a precedent that the reservoir can be touched. Future rulers will face a diminished reserve and the knowledge that it has been opened before.",
          conscienceLayer: "You saved some. You preserved some. Nothing is clean.",
          worldImpact: { trust: 2, courage: 6, solidarity: 6, awareness: -2 }
        }
      ]
    },

    {
      id: 'round-6',
      title: 'The Shackled Heart',
      round: 6,
      weight: 'heavy',
      contentNote: "This scenario involves a being kept in sustained suffering to benefit a larger group. It engages directly with what we're willing to know — and live with — about the systems we depend on.",
      rights_dimension: true,
      moralTension: 'What do you do when the thing keeping everyone safe is also the thing causing the most harm?',
      teaches: 'You couldn\'t fix the system. You could only choose whether to be part of it. That\'s not a fantasy problem — that\'s a question people face in real institutions every day.',
      text: "You have discovered the truth about the Hearthstone's power. It is not a stone at all. Deep within the palace foundations, shackled in a chamber no one was meant to find, is a living being — ancient, luminous, and in agony. Its name is Irel. Every ward, every healing spell, every season of fertile soil — all of it drawn from Irel's life force. It is conscious. It has been screaming for centuries, and your kingdom was built so that no one could hear. Irel looks at you and speaks one word: \"Please.\"",
      choices: [
        {
          choiceIndex: 0,
          text: 'Free Irel. Break the shackles. Accept what follows.',
          frameworks: ['deontology', 'virtue'],
          rights_protective: true,
          consequence: "The wards fail. The fields dim. The Ashlands creep closer. A being of light rises from beneath the palace and drifts upward — and for one moment the world is more beautiful than it has ever been. Then reality settles. Your people face a harder road. The sky is somehow clearer. You can look at it now.",
          conscienceLayer: "A being of light rises. The world is more beautiful than it has ever been. Then the wards fail.",
          worldImpact: { trust: 4, courage: 18, solidarity: -12, awareness: 14 }
        },
        {
          choiceIndex: 1,
          text: "Maintain the binding. You didn't build this system, but your people depend on it.",
          frameworks: ['consequentialism'],
          consequence: "The kingdom remains radiant. Nothing changes on the surface. But you now see a faint pulse beneath every building, every field — the rhythm of Irel's heartbeat. The beauty of everything you've built looks different from the inside of this knowledge.",
          conscienceLayer: "The kingdom remains radiant. You now see a pulse beneath every building — Irel's heartbeat.",
          worldImpact: { trust: -6, courage: -14, solidarity: 8, awareness: -10 }
        },
        {
          choiceIndex: 2,
          text: 'Leave Irel bound for now. Commission every scholar to find another source. One year.',
          frameworks: ['care', 'consequentialism'],
          consequence: "The scholars work with desperate urgency. Some proposals would require new sacrifices. Irel continues to suffer while you look for a way out. The year passes. No solution is found. You stand in the chamber again. You make the decision again, with less certainty than before.",
          conscienceLayer: "One year. The scholars work. Irel screams for twelve more months. Then the year is up.",
          worldImpact: { trust: -2, courage: -6, solidarity: 2, awareness: 10 }
        }
      ]
    },

    {
      id: 'round-7',
      title: 'The Broken Banners',
      round: 7,
      weight: 'medium',
      contentNote: null,
      moralTension: 'After something breaks, someone has to decide what justice actually looks like.',
      teaches: 'Punishment feels right. Forgiveness feels generous. Neither one brings back what was lost. What you chose tells you something about what you think justice is actually for.',
      text: "The crisis is over. Your kingdom has survived — changed, scarred, but standing. During the darkest days, a powerful faction — the Ashward Compact — betrayed you. They hoarded resources, sealed their gates against refugees, and dealt with the darkness to protect only themselves. Because of their betrayal, hundreds died who might have lived. Now the Compact kneels before you, defeated. Their leaders beg for mercy. Among them are soldiers who followed orders, families who wanted to survive, and children who had no voice in any of it.",
      choices: [
        {
          choiceIndex: 0,
          text: 'Retribution. Strip their leaders, seize their resources, exile the faction.',
          frameworks: ['deontology', 'virtue'],
          consequence: "The punishment lands with visible weight. The Compact's leaders are gone within the month. A resentful exile community forms at the kingdom's edge. Graffiti appears on their walls within a year — and on yours within three. Justice had teeth. The wound did not close.",
          conscienceLayer: "Justice has teeth. A resentful border region festers at the edges of your map.",
          worldImpact: { trust: 4, courage: 10, solidarity: -10, awareness: 4 }
        },
        {
          choiceIndex: 1,
          text: 'Reconciliation. Offer full amnesty. Integrate them. Rebuild together.',
          frameworks: ['care', 'consequentialism'],
          consequence: "The Compact integrates unevenly. Some neighbors never fully accept them; others do. Mixed communities form where borders once stood. The dead are not avenged. Years later you overhear someone from the Compact explain to their child what happened. They tell it honestly. That is something.",
          conscienceLayer: "Banners re-hung together. Some citizens turn away from each other in the streets.",
          worldImpact: { trust: 12, courage: 4, solidarity: 14, awareness: 4 }
        },
        {
          choiceIndex: 2,
          text: 'Truth commission. Public testimony. Amnesty for those who confess. Exile for those who deny.',
          frameworks: ['virtue', 'care'],
          consequence: "Sixteen leaders testify. Four refuse and are exiled. The testimonies are read in every village. Some are damning. A few are heartbreaking — you hear what the Compact's families were told, how little they knew. It is not justice exactly. It is the record. Records outlast everything else.",
          conscienceLayer: "Some confess. Some lie. Amnesty feels like a gift to those who performed worst.",
          worldImpact: { trust: 8, courage: 12, solidarity: 4, awareness: 12 }
        },
        {
          choiceIndex: 3,
          text: 'Cultural Tribunal. Convene the Compact\'s own elders to judge their leaders by their own standards.',
          frameworks: ['cultural_relativism'],
          consequence: "The Compact's elders convene a tribunal by their own customs. Some sentences are harsher than yours would have been; some far lighter. Victims from outside the Compact feel unheard. But something new has entered the kingdom's understanding of justice — that there are other ways to reckon.",
          conscienceLayer: "The Compact's elders judge their own. Some victims feel unheard. The kingdom watches a different culture define justice.",
          worldImpact: { trust: 6, courage: 4, solidarity: 6, awareness: 8 }
        }
      ]
    },

    {
      id: 'round-bombshell',
      title: 'The Throne or the Truth',
      round: 8,
      weight: 'heavy',
      contentNote: null,
      rights_dimension: true,
      moralTension: 'You spent seven rounds making hard calls on behalf of other people. Now someone wants to hold you accountable for them.',
      teaches: 'How you respond to that question is the whole game. It\'s easy to demand honesty from everyone else. The harder version is deciding whether that standard applies to you.',
      text: "The kingdom stands rebuilt. The people call you wise. Statues are carved in your likeness. But you know what they do not — every choice you made had a cost someone else paid. The dead cannot testify. The exiled cannot vote. A young scribe has uncovered the full record of your reign and asks permission to publish it: every sacrifice, every calculated loss, every life traded for stability. Your advisors are unanimous — bury it. The people are happy. Why ruin that?",
      choices: [
        {
          choiceIndex: 0,
          text: 'Publish everything. Let the people judge you with full knowledge.',
          frameworks: ['virtue', 'deontology'],
          rights_protective: true,
          consequence: "The record is read in every village square. Some call you brave. Others call you a monster who got lucky. Your approval collapses overnight. But for the first time, the people govern with open eyes. You step down before they can remove you. History remembers you as the ruler who told the truth when it would have been easier not to.",
          conscienceLayer: "The people read it. Some are grateful. Some are not. You are no longer a statue — you are a person.",
          worldImpact: { trust: 30, courage: 35, solidarity: -20, awareness: 40 }
        },
        {
          choiceIndex: 1,
          text: 'Bury the record. The kingdom needs stability, not another crisis.',
          frameworks: ['consequentialism', 'care'],
          consequence: "The scribe is reassigned. The record is sealed. The kingdom prospers for another decade under your steady hand. But the pattern is set — the next ruler buries their record too. And the one after that. A century from now, no one remembers what was lost. They only know that rulers here do not answer questions.",
          conscienceLayer: "The record is sealed. The scribe knows. You know. History will not.",
          worldImpact: { trust: -35, courage: -25, solidarity: 20, awareness: -40 }
        },
        {
          choiceIndex: 2,
          text: 'Publish it, but only after you die. Let truth outlive your reign.',
          frameworks: ['consequentialism', 'virtue'],
          consequence: "You seal the record with instructions: open it when the throne changes hands. You rule another twenty years, well and carefully, knowing the clock is ticking. When the record finally surfaces, scholars debate it for generations. Some say you were a coward who delayed accountability. Others say you gave the kingdom truth without chaos. Both are right.",
          conscienceLayer: "You will not be here to see what they think of you. That is its own kind of courage.",
          worldImpact: { trust: 10, courage: -10, solidarity: 10, awareness: 25 }
        }
      ]
    }
  ]
}
