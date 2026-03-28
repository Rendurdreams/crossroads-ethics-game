export const kingdomArcPack = {
  id: 'kingdom-arc',
  name: 'Kingdom of Ash',
  description: 'Seven moral dilemmas in a fantasy kingdom arc — from resource scarcity to civilizational reckoning. Based on Frostpunk\'s "creeping normality" design and Kohlberg\'s moral development research.',
  setting: 'fantasy',
  ai_generated: false,
  generator_prompt: null,
  scenarios: [
    {
      id: 'round-1',
      title: 'The Divided Harvest',
      round: 1,
      weight: 'low',
      contentNote: null,
      moralTension: 'Equality vs. efficiency — who deserves scarce resources',
      teaches: 'Distributive justice: would you make this choice not knowing where you would land?',
      text: "A brutal frost has killed half the kingdom's crops. Your storehouses hold enough grain to keep the capital fed through winter — but the outer villages will starve. Villagers are already arriving at the gates, gaunt and desperate. Your advisors present two paths. Everyone inside these walls is watching you.",
      choices: [
        {
          choiceIndex: 0,
          text: 'Share equally. Distribute all grain across the kingdom.',
          frameworks: ['care', 'consequentialism'],
          consequence: "Everyone eats less. The capital's production slows. Some of the very old and very young don't survive the cold. But when spring comes, every village is still standing. You visit the frontier towns. They remember you came.",
          worldImpact: { trust: 6, courage: 4, solidarity: 14, awareness: 4 }
        },
        {
          choiceIndex: 1,
          text: 'Protect the core. Keep the grain in the capital.',
          frameworks: ['consequentialism'],
          consequence: "The kingdom's builders and healers stay strong. The infrastructure survives intact. Word reaches you in spring that four frontier villages didn't make it. You tell yourself it was the only way. You're still telling yourself that.",
          worldImpact: { trust: -10, courage: 4, solidarity: -14, awareness: -4 }
        },
        {
          choiceIndex: 2,
          text: 'Triage. Send emergency rations to the most vulnerable villages only.',
          frameworks: ['deontology', 'virtue'],
          consequence: "Your scouts identify who is closest to death and you go there first. It means some villages get nothing and some get enough. The capital grumbles. The saved villages don't know how close it was. You do.",
          worldImpact: { trust: 2, courage: 8, solidarity: 4, awareness: 10 }
        }
      ]
    },

    {
      id: 'round-2',
      title: 'The Ember Watch',
      round: 2,
      weight: 'low',
      contentNote: null,
      moralTension: 'Freedom vs. security — how much liberty do you trade for safety?',
      teaches: 'Social contract theory: emergency powers rarely get rescinded once granted',
      text: "Something is moving in the Ashlands beyond your borders. Scouts report strange fires, ruined caravans, a growing darkness. Your people are afraid. Your Marshal urges immediate action. Your Elder Council urges caution. Two proposals reach your desk — and everyone is watching to see what kind of ruler you are.",
      choices: [
        {
          choiceIndex: 0,
          text: 'The Iron Protocol. Watchtowers, curfews, travel writs, civil patrols.',
          frameworks: ['consequentialism'],
          consequence: "The kingdom becomes safer and more rigid. Citizens walk in orderly lines, watched. The threat at the border slows. Years later, when the danger has passed, the curfew is still in place. The Marshal says it would be unwise to lift it now.",
          worldImpact: { trust: -10, courage: -4, solidarity: -4, awareness: 12 }
        },
        {
          choiceIndex: 1,
          text: 'The Open Flame. Issue warnings, arm volunteers, trust your people.',
          frameworks: ['virtue', 'care'],
          consequence: "Citizens organize. Neighborhoods form their own watches. Some are attacked before they can respond. You attend the funerals. The community that forms around the shared danger is real — and you would not have built it by order.",
          worldImpact: { trust: 8, courage: 14, solidarity: 8, awareness: -8 }
        },
        {
          choiceIndex: 2,
          text: 'Border protocols only. Writ requirements for inter-territory travel, nothing inside the towns.',
          frameworks: ['deontology', 'consequentialism'],
          consequence: "The half-measure satisfies no one. Border folk feel singled out. City dwellers feel exposed. The threat doesn't honor the line you drew. But you held something of each principle, and you can live with the weight of that.",
          worldImpact: { trust: -2, courage: 2, solidarity: 2, awareness: 6 }
        }
      ]
    },

    {
      id: 'round-3',
      title: 'The Hollow Folk',
      round: 3,
      weight: 'medium',
      contentNote: null,
      moralTension: 'Convenience vs. personhood — what does it cost to act on what you believe?',
      teaches: 'Rights and dignity: every society has used economic stability to justify denying personhood',
      text: "For generations, the Hollow Folk — beings shaped from stone and starlight — have built your roads, worked your mines, tended your fields. They do not eat, sleep, or tire. Your civilization's prosperity rests on their labor. Last night, a delegation appeared before your throne. They spoke. They said: \"We think. We feel. We remember. We are asking to be recognized as citizens.\" Your advisors are divided.",
      choices: [
        {
          choiceIndex: 0,
          text: 'Grant citizenship. Full rights, wages, representation, the ability to refuse.',
          frameworks: ['deontology', 'virtue'],
          consequence: "The economy reshapes overnight. Some projects stall. Luxury buildings go unfinished. Mixed neighborhoods form where boundaries once stood. A Hollow Folk elder is elected to the council. They are the best vote you've ever counted.",
          worldImpact: { trust: 8, courage: 16, solidarity: 10, awareness: 10 }
        },
        {
          choiceIndex: 1,
          text: 'Deny the petition. They were made, not born. The order holds.',
          frameworks: ['consequentialism'],
          consequence: "The economy continues. The Hollow Folk return to work. You saw them at the throne — the way they stood, the way they waited. They heard your answer. They go back to building your roads. That is the part you will carry.",
          worldImpact: { trust: -8, courage: -12, solidarity: -8, awareness: -8 }
        },
        {
          choiceIndex: 2,
          text: 'Issue a limited charter. Rest, safety protections, formal hearings — citizenship deferred.',
          frameworks: ['care', 'consequentialism'],
          consequence: "The Hollow Folk accept. Three years of deliberation follow. Full recognition comes — eventually. But some who petitioned have grown quieter by the time it arrives. Not in defeat. In the particular way of beings who have learned not to expect. The rights come. The wait cost something.",
          worldImpact: { trust: 4, courage: 2, solidarity: 4, awareness: 6 }
        }
      ]
    },

    {
      id: 'round-4',
      title: 'The Sealed Archive',
      round: 4,
      weight: 'medium',
      contentNote: null,
      moralTension: 'Truth vs. stability — do people have a right to know what threatens them?',
      teaches: 'Epistemic ethics: suppressing truth is paternalism — and you become exactly the authority figure that hides things "for your own good"',
      text: "Your scholars have made a devastating discovery. The Hearthstone — the ancient artifact shielding your civilization from the Ashlands — is not simply protecting you. It is slowly draining life from the land itself. In roughly three generations, the soil will be dead. The power is real, but it is borrowing against the future. If you reveal this, panic may shatter the kingdom. If you stay silent, your people live in comfortable ignorance while the clock ticks.",
      choices: [
        {
          choiceIndex: 0,
          text: 'Reveal the truth. Your people deserve to know what threatens them.',
          frameworks: ['deontology', 'virtue'],
          consequence: "Fear moves through the kingdom like weather. Factions argue. Some demand the Hearthstone be destroyed now; others call your scholars liars. A new generation of researchers forms who would never have existed without the urgency. The chaos is real. So is the work.",
          worldImpact: { trust: 6, courage: 14, solidarity: -8, awareness: 16 }
        },
        {
          choiceIndex: 1,
          text: 'Seal the archive. Commission a secret council to solve it quietly.',
          frameworks: ['consequentialism'],
          consequence: "The kingdom stays calm. The scholars work in candlelit rooms. Rumors begin within a year — someone talked. You spend more energy managing the leak than solving the problem. The secret is too large for any number of people to hold for long.",
          worldImpact: { trust: -6, courage: -12, solidarity: 4, awareness: -14 }
        },
        {
          choiceIndex: 2,
          text: 'Tell your council of seven. Give them one year before any public disclosure.',
          frameworks: ['care', 'consequentialism'],
          consequence: "The council fractures immediately. Three want full disclosure. Two want permanent suppression. Two disappear into the archive. The secret is already too large for seven people. You have bought time. You have also created seven people who now carry what you carry.",
          worldImpact: { trust: -4, courage: 2, solidarity: -2, awareness: 8 }
        }
      ]
    },

    {
      id: 'round-5',
      title: 'The Last Wellspring',
      round: 5,
      weight: 'heavy',
      contentNote: null,
      moralTension: 'Present needs vs. future survival — what do we owe to people who do not exist yet?',
      teaches: 'Intergenerational justice: opening the Wellspring is the same choice every generation makes when it consumes at the expense of the future',
      text: "Deep beneath the mountains lies the Wellspring — the final reservoir of creation-magic left in the world. Your ancestors sealed it with a warning: \"For those who come after.\" Now the Ashlands have breached your outer defenses. Villages burn. Refugees pour inward. The Wellspring's power could end this crisis in a single burst. But it is finite. Use it now, and it is gone forever. Leave it sealed, and people die today — people with names.",
      choices: [
        {
          choiceIndex: 0,
          text: 'Open the Wellspring. Save the people in front of you.',
          frameworks: ['care', 'consequentialism'],
          consequence: "A burst of golden light sweeps the kingdom. Walls rebuild. Fields green. The sick rise. The world is restored. A deep, permanent hollow opens beneath the mountains where the Wellspring was. Your children's children will face their crisis with nothing in reserve.",
          worldImpact: { trust: 4, courage: 8, solidarity: 14, awareness: -10 }
        },
        {
          choiceIndex: 1,
          text: 'Keep it sealed. Honor your ancestors. The future must be protected.',
          frameworks: ['deontology', 'virtue'],
          consequence: "People die who might have lived. You attend what funerals you can. The Wellspring glows beneath the mountain, steady and intact. The world is battered and scarred. There is a buried warmth in knowing something has been preserved. That warmth does not make the losses easier.",
          worldImpact: { trust: 4, courage: 14, solidarity: -12, awareness: 8 }
        },
        {
          choiceIndex: 2,
          text: 'Partial draw. Stabilize the worst of it, then seal it immediately.',
          frameworks: ['consequentialism'],
          consequence: "The immediate crisis holds. The Wellspring is neither full nor empty. You have saved today and made tomorrow harder to defend — and set a precedent that the reservoir can be touched. Future rulers will face a diminished reserve and the knowledge that it has been opened before.",
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
      moralTension: "One being's agony vs. everyone's prosperity — can torture ever be justified by its outcomes?",
      teaches: 'The Omelas dilemma: there is no third option. You stay, you leave, or you free the child and watch the city fall.',
      text: "You have discovered the truth about the Hearthstone's power. It is not a stone at all. Deep within the palace foundations, shackled in a chamber no one was meant to find, is a living being — ancient, luminous, and in agony. Its name is Irel. Every ward, every healing spell, every season of fertile soil — all of it drawn from Irel's life force. It is conscious. It has been screaming for centuries, and your kingdom was built so that no one could hear. Irel looks at you and speaks one word: \"Please.\"",
      choices: [
        {
          choiceIndex: 0,
          text: 'Free Irel. Break the shackles. Accept what follows.',
          frameworks: ['deontology', 'virtue'],
          consequence: "The wards fail. The fields dim. The Ashlands creep closer. A being of light rises from beneath the palace and drifts upward — and for one moment the world is more beautiful than it has ever been. Then reality settles. Your people face a harder road. The sky is somehow clearer. You can look at it now.",
          worldImpact: { trust: 4, courage: 18, solidarity: -12, awareness: 14 }
        },
        {
          choiceIndex: 1,
          text: "Maintain the binding. You didn't build this system, but your people depend on it.",
          frameworks: ['consequentialism'],
          consequence: "The kingdom remains radiant. Nothing changes on the surface. But you now see a faint pulse beneath every building, every field — the rhythm of Irel's heartbeat. The beauty of everything you've built looks different from the inside of this knowledge.",
          worldImpact: { trust: -6, courage: -14, solidarity: 8, awareness: -10 }
        },
        {
          choiceIndex: 2,
          text: 'Leave Irel bound for now. Commission every scholar to find another source. One year.',
          frameworks: ['care', 'consequentialism'],
          consequence: "The scholars work with desperate urgency. Some proposals would require new sacrifices. Irel continues to suffer while you look for a way out. The year passes. No solution is found. You stand in the chamber again. You make the decision again, with less certainty than before.",
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
      moralTension: 'Retribution vs. reconciliation — can a kingdom share a future with those who betrayed it?',
      teaches: 'Restorative vs. retributive justice: Versailles made the next war; the Truth Commission left some victims unheard. Neither option closes cleanly.',
      text: "The crisis is over. Your kingdom has survived — changed, scarred, but standing. During the darkest days, a powerful faction — the Ashward Compact — betrayed you. They hoarded resources, sealed their gates against refugees, and dealt with the darkness to protect only themselves. Because of their betrayal, hundreds died who might have lived. Now the Compact kneels before you, defeated. Their leaders beg for mercy. Among them are soldiers who followed orders, families who wanted to survive, and children who had no voice in any of it.",
      choices: [
        {
          choiceIndex: 0,
          text: 'Retribution. Strip their leaders, seize their resources, exile the faction.',
          frameworks: ['deontology', 'virtue'],
          consequence: "The punishment lands with visible weight. The Compact's leaders are gone within the month. A resentful exile community forms at the kingdom's edge. Graffiti appears on their walls within a year — and on yours within three. Justice had teeth. The wound did not close.",
          worldImpact: { trust: 4, courage: 10, solidarity: -10, awareness: 4 }
        },
        {
          choiceIndex: 1,
          text: 'Reconciliation. Offer full amnesty. Integrate them. Rebuild together.',
          frameworks: ['care', 'consequentialism'],
          consequence: "The Compact integrates unevenly. Some neighbors never fully accept them; others do. Mixed communities form where borders once stood. The dead are not avenged. Years later you overhear someone from the Compact explain to their child what happened. They tell it honestly. That is something.",
          worldImpact: { trust: 12, courage: 4, solidarity: 14, awareness: 4 }
        },
        {
          choiceIndex: 2,
          text: 'Truth commission. Public testimony. Amnesty for those who confess. Exile for those who deny.',
          frameworks: ['virtue', 'care'],
          consequence: "Sixteen leaders testify. Four refuse and are exiled. The testimonies are read in every village. Some are damning. A few are heartbreaking — you hear what the Compact's families were told, how little they knew. It is not justice exactly. It is the record. Records outlast everything else.",
          worldImpact: { trust: 8, courage: 12, solidarity: 4, awareness: 12 }
        }
      ]
    },

    {
      id: 'round-reckoning',
      title: 'The Reckoning',
      round: 8,
      weight: 'reflective',
      contentNote: null,
      moralTension: 'Self-reflection',
      teaches: 'Metacognition — examining your own reasoning',
      text: "Was there a round where your gut said one thing and your reasoning said another? Which one did you follow — and do you think that was right?",
      choices: []
    }
  ]
}
