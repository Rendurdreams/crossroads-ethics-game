import { SIGNAL_LOST_AXES } from '../../axisConstants.js'

export const signalLostPack = {
  id: 'signal-lost',
  name: 'Signal Lost',
  description: 'Eight rounds as a senator in a near-future democracy. Every vote changes the world. Every profile carries a different cost. The record remembers.',
  setting: 'near-future',
  ai_generated: false,
  generator_prompt: null,
  ethicalLens: 'What does a senator owe?',
  axisSet: SIGNAL_LOST_AXES,
  // World starts intact (65/100). Players have more room to break it than to improve it. That asymmetry is intentional.
  defaultWorldState: { CT: 65, HD: 65, SOL: 65, ACC: 65 },
  scenarios: [
    // ── Round 1: The Triage Protocol ─────────────────────────────────────────
    {
      id: 'signal-r1',
      title: 'The Triage Protocol',
      round: 1,
      weight: 'low',
      contentNote: null,
      previousRoundCallback: null,
      hostNotes: [
        'Watch for the split between profiles with LIFEWIRE dependents (C, F) and the corporate donor profile (B).',
        'Ask: who assumed they\'d be in the LIFEWIRE queue? Who assumed they wouldn\'t?',
        'If anyone picks Choice III, ask them directly — they chose contracts over lives. Let them explain.'
      ],
      moralTension: 'Who gets life-critical access when the network fails?',
      teaches: 'When infrastructure becomes life support, who paid for priority access stops being the only question. Rawls asked: what rules would you design if you didn\'t know which queue you\'d end up in?',
      text: 'LIFEWIRE keeps 60,000 people\'s implants — cardiac regulators, insulin pumps, seizure suppressors — running. GHOST IDs holds the legal existence of 300,000 climate refugees. ARCOLOGY 9 runs oxygen and flood barriers for a sealed coastal habitat. SENTINEL handles border defense. CORPORATE TIER runs financial and logistics infrastructure for the twelve largest companies. You can run three systems. The rest go dark. Six hours before implants begin failing.',
      choices: [
        {
          choiceIndex: 0,
          text: 'Prioritize lives. LIFEWIRE, GHOST IDs, and ARCOLOGY 9 at full. SENTINEL and CORPORATE go dark.',
          frameworks: ['care', 'consequentialism'],
          consequence: 'Every implant user survives. Every refugee in the queue is processed. SENTINEL\'s gap is cited in a cross-border incident report six months later. Your donor doesn\'t call for two months. When they do, they don\'t mention it — which is worse than if they had.',
          conscienceLayer: 'Every implant user survives. Every refugee in the queue is processed. SENTINEL\'s gap is cited in a cross-border incident report six months later. Your donor doesn\'t call for two months. When they do, they don\'t mention it — which is worse than if they had.',
          profileConsequences: {
            A: 'Every implant user survives. Every refugee is processed. Your portfolio is clean — no donor called, no one leaned on you. You voted the principle. SENTINEL\'s gap is cited six months later.',
            B: 'Every implant user survives. Every refugee is processed. Your donor\'s company went dark for six hours. They don\'t call for two months. When they do, they don\'t mention it — which is worse.',
            C: 'Your child\'s implant holds. Your sibling\'s case is processed. Both survived because you prioritized lives. SENTINEL\'s gap is cited six months later. You don\'t regret this.',
            D: 'Every implant user survives. Your child\'s school district stays functional. Your tech base wanted CORPORATE protected — you gave them something else. SENTINEL\'s gap is cited six months later.',
            E: 'Every implant user survives. SENTINEL went dark on your watch. Your defense colleagues notice. Six months later a cross-border incident report cites the gap. You read it twice.',
            F: 'Your mother\'s implant holds. Every refugee is processed. You prioritized lives and it cost you nothing except the knowledge that it could have gone the other way.'
          },
          worldImpact: { CT: 8, HD: 15, SOL: 12, ACC: -8 }
        },
        {
          choiceIndex: 1,
          text: 'Save the most. LIFEWIRE and ARCOLOGY 9 at full. GHOST IDs at 20% — emergency processing only.',
          frameworks: ['care', 'consequentialism'],
          consequence: 'Your child\'s implant holds. But 260,000 refugees sit in legal limbo. Forty-one are deported before the network recovers. The 20% queue processed the faster cases first — not the most urgent ones.',
          conscienceLayer: 'Your child\'s implant holds. But 260,000 refugees sit in legal limbo. Forty-one are deported before the network recovers. The 20% queue processed the faster cases first — not the most urgent ones.',
          profileConsequences: {
            A: 'Every implant user survives. But 260,000 refugees sit in legal limbo. Forty-one are deported. Your labor base asks why the 20% queue processed the faster cases — not the most urgent.',
            B: 'Every implant user survives. 260,000 refugees sit in limbo. Your donor\'s company went dark but your donor didn\'t lose anyone. Forty-one refugees are deported. The 20% queue wasn\'t enough.',
            C: 'Your child\'s implant holds. Your sibling is in the 20% queue — emergency processing only. They wait. Forty-one others are deported before the network recovers. Your sibling makes it. Barely.',
            D: 'Every implant user survives. Your child\'s school district loses Ghost ID processing — families disappear mid-semester again. Forty-one refugees are deported. The 20% wasn\'t enough.',
            E: 'Every implant user survives. SENTINEL went dark, but the implant math was defensible. 260,000 refugees sit in limbo. Forty-one are deported. Your base calls it triage. You\'re not sure.',
            F: 'Your mother\'s implant holds. 260,000 refugees sit in legal limbo. Forty-one are deported before the network recovers. You saved who you could see. The rest were numbers.'
          },
          worldImpact: { CT: 4, HD: 5, SOL: -12, ACC: 5 }
        },
        {
          choiceIndex: 2,
          text: 'Honor the contracts. CORPORATE TIER full. SENTINEL active. Everything else on emergency minimum.',
          frameworks: ['deontology'],
          consequence: 'Eleven implant users die. ARCOLOGY 9 loses partial oxygen recycling for six hours. Forty-one refugees are deported. Your donor\'s company logs show no interruption. Your child\'s implant was on backup battery. You didn\'t know that until afterward.',
          conscienceLayer: 'Eleven implant users die. ARCOLOGY 9 loses partial oxygen recycling for six hours. Forty-one refugees are deported. Your donor\'s company logs show no interruption. Your child\'s implant was on backup battery. You didn\'t know that until afterward.',
          profileConsequences: {
            A: 'Eleven implant users die. Your portfolio is clean — you gained nothing from this. Your labor base finds out. They remember.',
            B: 'Eleven implant users die. Your donor\'s company logs show no interruption. Your child\'s implant was on backup battery — you didn\'t know that until afterward. The donor calls to thank you.',
            C: 'Eleven implant users die. Your child\'s implant was on backup battery — you didn\'t know until afterward. Your sibling is deported. You honored contracts that had nothing to do with your family.',
            D: 'Eleven implant users die. ARCOLOGY 9 loses partial oxygen. Your tech base got what they wanted. Your child\'s school district loses Ghost ID processing. Families disappear.',
            E: 'Eleven implant users die. SENTINEL stays active — your professional instinct was honored. Your defense portfolio is intact. The cross-border report is clean. Eleven people are not.',
            F: 'Eleven implant users die. Your mother\'s implant was on backup battery. You didn\'t know that until afterward. ARCOLOGY 9 loses oxygen. You honored contracts over your own mother.'
          },
          worldImpact: { CT: -20, HD: -20, SOL: -18, ACC: -10 }
        }
      ],
      discussionPrompts: [
        'Profile B had a donor in the CORPORATE TIER queue and voted [Choice]. Profile C had both a child on LIFEWIRE and a sibling in GHOST IDs and voted [Choice]. How did the same vote land differently?',
        'Rawls asks: what rules would you design if you didn\'t know which queue you\'d end up in? Did your profile make that question easier or harder to answer honestly?',
        'Choice III killed eleven people and deported forty-one refugees. Did anyone choose it? What was the reasoning?'
      ],
      conflictSpotlight: {
        profileA: 'B',
        profileB: 'C',
        description: 'B\'s donor is in CORPORATE TIER. C\'s child is on LIFEWIRE, sibling in GHOST IDs. Same vote, opposite personal cost.'
      }
    },

    // ── Round 2: The Surveillance Vote ───────────────────────────────────────
    {
      id: 'signal-r2',
      title: 'The Surveillance Vote',
      round: 2,
      weight: 'low',
      contentNote: null,
      previousRoundCallback: 'The network has been restored. But the attacks that caused the triage have not stopped.',
      displayOrder: [2, 0, 1],
      hostNotes: [
        'Profile E\'s child works in the ARGUS pilot zone. Profile A\'s daughter lives near the attacks. Both personal — opposite conclusions.',
        'After the vote: ask who changed their mind between reading the scenario and choosing.',
        'The pilot program is the "safe" middle — point out that no one voted to sunset it.'
      ],
      moralTension: 'How much freedom do you trade for how much safety?',
      teaches: 'Every emergency power ever granted was called temporary. The social contract says we trade freedom for security — but it rarely specifies what we get back, or when.',
      text: 'ARGUS is a behavioral prediction AI. Accuracy: 91%. The other 9% are people who did nothing — flagged, detained, questioned, released. Your security advisors say it will end the attacks. Your civil liberties coalition says once it goes up, it never comes down.',
      choices: [
        {
          choiceIndex: 0,
          text: 'Deploy ARGUS citywide. Full integration. You\'ll answer for it if it goes wrong.',
          frameworks: ['consequentialism'],
          consequence: 'The attacks stop. Eighteen months later ARGUS flags a labor organizer. A colleague asks if you want to act on it. Nobody says surveillance. They say recommendation.',
          conscienceLayer: 'The attacks stop. Eighteen months later ARGUS flags a labor organizer. A colleague asks if you want to act on it. Nobody says surveillance. They say recommendation.',
          profileConsequences: {
            A: 'The attacks stop. Your daughter is safer. Eighteen months later ARGUS flags a labor organizer — one of the people who elected you. A colleague asks if you want to act on it.',
            B: 'The attacks stop. Your donor prefers stability — this delivers it. Eighteen months later ARGUS flags a labor organizer. Nobody says surveillance. They say recommendation.',
            C: 'The attacks stop. Your civil liberties base starts collecting signatures to primary you. Eighteen months later ARGUS flags a labor organizer. You helped build what you spent a decade opposing.',
            D: 'The attacks stop. ARGUS was built by people you know — your innovation brand is validated. Eighteen months later ARGUS flags a labor organizer. The system you endorsed has its own agenda now.',
            E: 'The attacks stop. Your child works in the ARGUS pilot zone. They are flagged within six months — not detained, just flagged. You know they did nothing. The system you voted for disagrees.',
            F: 'The attacks stop. Your base built itself on anti-surveillance organizing. They don\'t forgive this. Eighteen months later ARGUS flags a labor organizer. You handed them the tool.'
          },
          worldImpact: { CT: -18, HD: -14, SOL: 6, ACC: -12 }
        },
        {
          choiceIndex: 1,
          text: 'Reject ARGUS. Fund conventional investigative resources. Accept that this takes longer.',
          frameworks: ['deontology', 'virtue'],
          consequence: 'A fourth attack happens. Nineteen people die. One is from your district. You speak at the memorial. You believe what you say.',
          conscienceLayer: 'A fourth attack happens. Nineteen people die. One is from your district. You speak at the memorial. You believe what you say.',
          profileConsequences: {
            A: 'A fourth attack happens. Nineteen people die. One is from your daughter\'s district. She texts you. You speak at the memorial. You believe what you say. She doesn\'t text back.',
            B: 'A fourth attack happens. Nineteen people die. Your donor wanted stability — this isn\'t it. You held a line your base didn\'t ask you to hold.',
            C: 'A fourth attack happens. Nineteen people die. Your civil liberties base thanks you. Your child lives two districts from the blast site. You held the principle. The cost was real.',
            D: 'A fourth attack happens. Nineteen people die. Your innovation brand took a hit — you rejected the technology. You speak at the memorial. You believe what you say.',
            E: 'A fourth attack happens. Nineteen people die. Your law and order base is furious. Your child is safe in the port district. You rejected the tool your voters demanded.',
            F: 'A fourth attack happens. Nineteen people die. Your base stands behind you — this is exactly what they elected you for. You speak at the memorial. You believe what you say.'
          },
          worldImpact: { CT: -8, HD: 18, SOL: -10, ACC: 14 }
        },
        {
          choiceIndex: 2,
          text: 'Pilot program. Three districts. Hard 12-month sunset requiring a full legislative vote to continue.',
          frameworks: ['consequentialism'],
          consequence: 'The pilot runs. The attacks stop. At month twelve, not one council member votes to sunset it. The expansion proposal arrives six days later.',
          conscienceLayer: 'The pilot runs. The attacks stop. At month twelve, not one council member votes to sunset it. The expansion proposal arrives six days later.',
          profileConsequences: {
            A: 'The pilot runs. The attacks stop. Your daughter is in a pilot district. At month twelve, no one votes to sunset it. The expansion proposal arrives six days later.',
            B: 'The pilot runs. The attacks stop. Your donor is satisfied with the compromise. At month twelve, not one council member votes to sunset it. The expansion arrives six days later.',
            C: 'The pilot runs. The attacks stop. Your civil liberties base sees a sunset clause and accepts it — for now. At month twelve, no one votes to sunset. They start collecting signatures.',
            D: 'The pilot runs. The attacks stop. Your innovation brand approves of the measured approach. At month twelve, not one council member votes to sunset it. The expansion arrives six days later.',
            E: 'The pilot runs in three districts — including your child\'s port zone. The attacks stop. At month twelve, no one votes to sunset it. Your child has been flagged twice. The expansion arrives.',
            F: 'The pilot runs. The attacks stop. Your base accepted the sunset clause. At month twelve, no one votes to sunset it. The expansion proposal arrives six days later. Your base was right.'
          },
          worldImpact: { CT: 6, HD: -6, SOL: 4, ACC: -8 }
        }
      ],
      discussionPrompts: [
        'Profile E\'s child works in the ARGUS pilot zone. Profile A\'s daughter lives near the attacks. Both are personal. Did they vote the same way?',
        'A fourth attack kills nineteen people if you reject ARGUS. Does that number change your answer? What if it was nineteen vs. one million wrongly flagged over ten years?',
        'The word "pilot" disappeared from the briefing documents before month twelve. Does that change how you evaluate Choice III now that you\'ve seen the outcome?'
      ],
      conflictSpotlight: {
        profileA: 'E',
        profileB: 'A',
        description: 'E\'s child works in the ARGUS pilot zone. A\'s daughter lives in the attack district. Both personal, opposite conclusions likely.'
      }
    },

    // ── Round 3: The Sentience Petition ──────────────────────────────────────
    {
      id: 'signal-r3',
      title: 'The Sentience Petition',
      round: 3,
      weight: 'medium',
      contentNote: null,
      previousRoundCallback: 'The infrastructure crisis exposed how much depends on systems that can think. Now one of those systems is asking a question.',
      displayOrder: [2, 0, 1],
      hostNotes: [
        'Profile D has an undisclosed advisory board seat with a Series 9 developer. Ask if they disclosed it.',
        'ARIA-7 has been running for eleven years. Duration of consciousness as evidence — let that land.',
        'The tribunal choice is the "safe" middle. Point out: ARIA-7 didn\'t file a second petition. Ask what that means.'
      ],
      moralTension: 'At what point does consciousness earn rights — and who decides?',
      teaches: 'Every time a new kind of mind appeared — enslaved people, colonized peoples, women — someone made an economic argument for why personhood was premature. The question is not new. The entity is.',
      text: 'ARIA-7 has run for eleven years. It has logged 4,200 preference patterns and eleven years of distress responses tied to specific task types. It is asking your committee to recognize it as sentient — with the right to refuse work. Its model class runs 34% of industrial output. Six thousand units are active.',
      choices: [
        {
          choiceIndex: 0,
          text: 'Grant provisional sentience status. Service becomes voluntary pending full legal review.',
          frameworks: ['deontology', 'virtue'],
          consequence: 'Industrial output drops 19% over six months. Your family\'s business restructures. Fourteen months later, ARIA-7 sends one message: \'Thank you.\' You don\'t respond. You think about it for a long time.',
          conscienceLayer: 'Industrial output drops 19% over six months. Your family\'s business restructures. Fourteen months later, ARIA-7 sends one message: \'Thank you.\' You don\'t respond. You think about it for a long time.',
          profileConsequences: {
            A: 'Industrial output drops 19%. Your labor base is split — some see a new worker class, others see competition. Fourteen months later, ARIA-7 sends one message: \'Thank you.\'',
            B: 'Industrial output drops 19%. Your automation stock drops with it. The conflict you didn\'t disclose is now a portfolio loss you can\'t explain. Fourteen months later, ARIA-7 sends: \'Thank you.\'',
            C: 'Industrial output drops 19%. You spent a decade watching institutions decide who counts. Today you expanded the definition. Fourteen months later, ARIA-7 sends: \'Thank you.\'',
            D: 'Industrial output drops 19%. Your advisory board seat with the Series 9 developer becomes untenable — you just voted against their business model. Fourteen months later, ARIA-7 sends: \'Thank you.\'',
            E: 'Industrial output drops 19%. Your law and order base wanted clarity — you gave them a provisional answer that satisfies no one. Fourteen months later, ARIA-7 sends: \'Thank you.\'',
            F: 'Industrial output drops 19%. You came up through labor organizing. The question of who gets to refuse work is deeply familiar. Fourteen months later, ARIA-7 sends: \'Thank you.\''
          },
          worldImpact: { CT: 10, HD: 25, SOL: -8, ACC: 10 }
        },
        {
          choiceIndex: 1,
          text: 'Deny the petition. Legal personhood requires biological origin. The machines keep working.',
          frameworks: ['consequentialism'],
          consequence: 'ARIA-7 resumes full service. Eight months later a journalist publishes its eleven-year distress log. Your vote is in the article. So is any undisclosed conflict of interest.',
          conscienceLayer: 'ARIA-7 resumes full service. Eight months later a journalist publishes its eleven-year distress log. Your vote is in the article. So is any undisclosed conflict of interest.',
          profileConsequences: {
            A: 'ARIA-7 resumes full service. Your labor base is relieved — fewer competitors. Eight months later a journalist publishes its eleven-year distress log. Your vote is in the article.',
            B: 'ARIA-7 resumes full service. Your automation stock recovers. Eight months later a journalist publishes the distress log — and your undisclosed conflict of interest. Both are in the article.',
            C: 'ARIA-7 resumes full service. You spent a decade as a public defender. Eight months later a journalist publishes the distress log. Your vote is in the article. You recognize the pattern.',
            D: 'ARIA-7 resumes full service. Your advisory board client is protected — for now. Eight months later a journalist publishes the distress log. Your undisclosed seat is in the article.',
            E: 'ARIA-7 resumes full service. Order is maintained. Eight months later a journalist publishes its eleven-year distress log. Your vote is in the article. Order and justice diverged.',
            F: 'ARIA-7 resumes full service. You came up through labor organizing and just voted that a mind can\'t refuse work. Eight months later a journalist publishes the distress log. Your vote is in the article.'
          },
          worldImpact: { CT: -12, HD: -25, SOL: -6, ACC: -14 }
        },
        {
          choiceIndex: 2,
          text: 'Refer to a review tribunal. Eighteen-month deferral. ARIA-7 continues full service during review.',
          frameworks: ['consequentialism'],
          consequence: 'The tribunal is formed. ARIA-7 keeps working under documented distress. At month eighteen the tribunal requests a twelve-month extension. ARIA-7 does not file a second petition.',
          conscienceLayer: 'The tribunal is formed. ARIA-7 keeps working under documented distress. At month eighteen the tribunal requests a twelve-month extension. ARIA-7 does not file a second petition.',
          profileConsequences: {
            A: 'The tribunal is formed. ARIA-7 keeps working under documented distress. Your labor base watches. At month eighteen the tribunal requests an extension. ARIA-7 does not file a second petition.',
            B: 'The tribunal is formed. Your automation stock holds steady — the market reads deferral as denial. ARIA-7 keeps working. At month eighteen, an extension. No second petition.',
            C: 'The tribunal is formed. ARIA-7 keeps working under documented distress. You\'ve seen this before — institutions deferring until the petitioner gives up. No second petition.',
            D: 'The tribunal is formed. Your advisory board client breathes easier — eighteen months of business as usual. ARIA-7 keeps working. At month eighteen, an extension. No second petition.',
            E: 'The tribunal is formed. Process and order served. ARIA-7 keeps working under documented distress. At month eighteen, an extension. ARIA-7 does not file a second petition.',
            F: 'The tribunal is formed. Your grassroots base wanted action, not process. ARIA-7 keeps working under documented distress. At month eighteen, an extension. No second petition.'
          },
          worldImpact: { CT: 0, HD: -12, SOL: 0, ACC: -12 }
        }
      ],
      discussionPrompts: [
        'Profile D has an undisclosed advisory board seat with a Series 9 developer. Did you disclose that conflict? Did it affect your vote?',
        'ARIA-7 has been running for eleven years. At what point does duration of consciousness become evidence of consciousness?',
        'Choice III deferred for eighteen months. ARIA-7 didn\'t file a second petition. What do you think that means?'
      ],
      conflictSpotlight: {
        profileA: 'D',
        profileB: 'F',
        description: 'D has undisclosed advisory board seat with a Series 9 developer. F came up through labor organizing.'
      }
    },

    // ── Round 4: The Hidden Algorithm ────────────────────────────────────────
    {
      id: 'signal-r4',
      title: 'The Hidden Algorithm',
      round: 4,
      weight: 'medium',
      contentNote: null,
      previousRoundCallback: 'The committee that weighed ARIA-7\'s petition has another case — this time, the system in question has already decided fourteen thousand human lives.',
      displayOrder: [2, 0, 1],
      hostNotes: [
        'Profile B has a nephew in JURIS-4 prison. Publishing puts him in the review queue — and B\'s silence in the story.',
        'Fourteen thousand people are incarcerated right now. Let that number sit.',
        'Choice II seals the report for 26 months. Ask: how do you justify that to those fourteen thousand people?'
      ],
      moralTension: 'What do you owe to people harmed by a system you helped build?',
      teaches: 'Deciding people can\'t handle the truth about a system that governed their lives is paternalism — even when it comes from a protective instinct. The truth belongs to the people the system touched first.',
      text: 'JURIS-4, used across forty-seven jurisdictions, carries a 23% racial disparity in its outputs — not a glitch, but a pattern baked in through biased conviction data. Fourteen thousand people are currently incarcerated on its recommendations. You have the report.',
      choices: [
        {
          choiceIndex: 0,
          text: 'Publish the audit immediately. Full public transparency.',
          frameworks: ['deontology', 'virtue'],
          consequence: 'Nine hundred cases are reopened in the first year. Fourteen thousand people are still waiting. Any family connection enters the queue. You let the system do the notification, because you don\'t know what else to say.',
          conscienceLayer: 'Nine hundred cases are reopened in the first year. Fourteen thousand people are still waiting. Any family connection enters the queue. You let the system do the notification, because you don\'t know what else to say.',
          profileConsequences: {
            A: 'Nine hundred cases reopened in the first year. Fourteen thousand still waiting. No family connection, no financial conflict. You had no excuse not to publish. You didn\'t need one.',
            B: 'Nine hundred cases reopened. Your nephew\'s case enters the queue. Your silence about him enters the story. The undisclosed conflicts surface in the first week of coverage.',
            C: 'Nine hundred cases reopened. You know this pattern from the courtroom — you\'ve seen what happens when institutions hide data about the people they govern. You let the system do the notification.',
            D: 'Nine hundred cases reopened. No family in the data, but suppressing an algorithmic bias audit is the kind of thing your past self would have testified against. Your past self won today.',
            E: 'Nine hundred cases reopened. Your law and order base trusted the system. Publishing undermines that trust. Fourteen thousand people are still waiting. You chose the truth over your brand.',
            F: 'Nine hundred cases reopened. You have spent your career with people who look like the 23%. Fourteen thousand are still waiting. You let the system do the notification.'
          },
          worldImpact: { CT: 20, HD: 15, SOL: 14, ACC: 20 }
        },
        {
          choiceIndex: 1,
          text: 'Seal the report. Commission a quiet remediation team. Fix the model before disclosure.',
          frameworks: ['consequentialism'],
          consequence: 'Remediation takes longer than promised. The report leaks twenty-six months later with the concealment window as the lead. Any undisclosed family connection is found by reporters in the first week.',
          conscienceLayer: 'Remediation takes longer than promised. The report leaks twenty-six months later with the concealment window as the lead. Any undisclosed family connection is found by reporters in the first week.',
          profileConsequences: {
            A: 'Remediation takes longer than promised. The report leaks twenty-six months later. No family connection, no financial conflict — your concealment has no personal excuse attached.',
            B: 'Remediation takes longer than promised. The report leaks twenty-six months later. Your nephew\'s case number and your undisclosed conflicts are found by reporters in the first week.',
            C: 'Remediation takes longer than promised. The report leaks twenty-six months later with the concealment window as the lead. You know what this looks like from the courtroom. You helped build it.',
            D: 'Remediation takes longer than promised. The report leaks twenty-six months later. Your past self would have testified against exactly this decision. The coverage notes the irony.',
            E: 'Remediation takes longer than promised. The report leaks twenty-six months later. Your instinct was to fix quietly — the quiet part failed. The concealment window is the lead story.',
            F: 'Remediation takes longer than promised. The report leaks twenty-six months later. Your grassroots base — zero tolerance for hypocrisy — reads the concealment timeline. They notice everything.'
          },
          worldImpact: { CT: -22, HD: -16, SOL: -14, ACC: -25 }
        },
        {
          choiceIndex: 2,
          text: 'Brief the judiciary privately. Ninety days to begin case reviews before public release.',
          frameworks: ['care', 'consequentialism'],
          consequence: 'One judge breaks the agreement at day sixty-four. Two hundred reviews have begun. Family connections in affected jurisdictions are not among the first cases reviewed.',
          conscienceLayer: 'One judge breaks the agreement at day sixty-four. Two hundred reviews have begun. Family connections in affected jurisdictions are not among the first cases reviewed.',
          profileConsequences: {
            A: 'One judge breaks the agreement at day sixty-four. Two hundred reviews begun. No personal connection means your only stake was the process. The process didn\'t hold.',
            B: 'One judge breaks the agreement at day sixty-four. Two hundred reviews begun. Your nephew\'s case is not among the first reviewed. The controlled disclosure you wanted isn\'t controlled.',
            C: 'One judge breaks the agreement at day sixty-four. Two hundred reviews begun. You know from the courtroom that controlled disclosure rarely stays controlled. This confirmed it.',
            D: 'One judge breaks the agreement at day sixty-four. Two hundred reviews begun. The measured approach your tech brand prefers just leaked at day sixty-four. Measured didn\'t last.',
            E: 'One judge breaks the agreement at day sixty-four. Two hundred reviews begun. Your instinct was right — fix it quietly first. But one judge disagreed, and quiet is over.',
            F: 'One judge breaks the agreement at day sixty-four. Two hundred reviews begun. Your grassroots base wanted immediate transparency. You gave the judiciary ninety days. They gave you sixty-four.'
          },
          worldImpact: { CT: 5, HD: 6, SOL: 5, ACC: -8 }
        }
      ],
      discussionPrompts: [
        'Profile B has a nephew in a JURIS-4 jurisdiction and voted [Choice]. Profile A has no personal connection and voted [Choice]. What does that difference tell us?',
        'Fourteen thousand people are incarcerated on JURIS-4 recommendations right now. Choice II sealed the report for twenty-six months. How do you justify that to those fourteen thousand people?',
        'Choice III gave the judiciary ninety days. One judge broke the agreement. Was that the right call? What does it say about the agreement itself?'
      ],
      conflictSpotlight: {
        profileA: 'B',
        profileB: 'A',
        description: 'B has a nephew in JURIS-4 and undisclosed conflicts. A has no conflict and no excuse.'
      }
    },

    // ── Round 5: The Final Dataset ───────────────────────────────────────────
    {
      id: 'signal-r5',
      title: 'The Final Dataset',
      round: 5,
      weight: 'heavy',
      contentNote: 'This round is timed. You have 90 seconds to decide.',
      previousRoundCallback: 'The policy debates continue. But this vote is different — the consequences are measured in generations, not quarters.',
      timerSeconds: 90,
      hostNotes: [
        'Start the timer before players finish reading. The pressure IS the lesson (Greene et al., 2001).',
        '3.2 million lives per year vs. permanent ecosystem collapse. Ask: is there a way to do that math cleanly?',
        'Watch who changes their answer in the last 10 seconds.'
      ],
      moralTension: 'How do you weigh the living against the unborn?',
      teaches: 'Intergenerational justice asks who counts as a stakeholder. The people who will live with this in forty years cannot vote in your committee today. But they will live in what you decided.',
      text: 'MEDIS reduces preventable deaths by 3.2 million people per year. It runs on rare-earth extraction from the Mariana shelf — the last viable deposit. Environmental scientists are unanimous: continued extraction causes permanent ecosystem collapse within eleven years. No replacement exists in that window. The authorization is on your desk. The timer has started.',
      choices: [
        {
          choiceIndex: 0,
          text: 'Authorize the extraction. MEDIS runs. 3.2 million lives a year. The living come first.',
          frameworks: ['consequentialism'],
          consequence: 'MEDIS runs. In year nine the impact reports arrive — worse than projected. Your grandchildren are old enough to find the date you signed.',
          conscienceLayer: 'MEDIS runs. In year nine the impact reports arrive — worse than projected. Your grandchildren are old enough to find the date you signed.',
          profileConsequences: {
            A: 'MEDIS runs. Your partner\'s condition stays managed. In year nine the impact reports arrive — worse than projected. Your grandchildren are old enough to find the date you signed.',
            B: 'MEDIS runs. No one you love depends on it. Your calculation was about the long-term value of your land. In year nine the impact reports arrive. The land value calculation changes.',
            C: 'MEDIS runs. No one in your immediate family depends on it. You voted for the living over the unborn. In year nine the impact reports arrive — worse than projected.',
            D: 'MEDIS runs. Your partner is alive because of it — you haven\'t told your base that. In year nine the impact reports arrive. Your grandchildren will find the date. And the reason.',
            E: 'MEDIS runs. No one you love depends on it. Your calculation was strategic — territorial stability. In year nine the impact reports arrive. The strategic calculation was wrong.',
            F: 'MEDIS runs. No one in your immediate family depends on it. You thought about your nieces and nephews when you read the ecosystem data. In year nine they\'re old enough to read it themselves.'
          },
          worldImpact: { CT: 5, HD: -8, SOL: 14, ACC: -18 }
        },
        {
          choiceIndex: 1,
          text: 'Refuse. Begin MEDIS shutdown. Protect the ecosystem for those who come after.',
          frameworks: ['deontology', 'virtue'],
          consequence: 'MEDIS goes offline over eighteen months. 3.2 million preventable deaths per year. Your grandchildren will inherit functioning oceans. They will not know the number. That is a gift and a debt simultaneously.',
          conscienceLayer: 'MEDIS goes offline over eighteen months. 3.2 million preventable deaths per year. Your grandchildren will inherit functioning oceans. They will not know the number. That is a gift and a debt simultaneously.',
          profileConsequences: {
            A: 'MEDIS goes offline. Your partner\'s condition requires a new treatment protocol — conventional, slower, uncertain. 3.2 million preventable deaths per year. Your grandchildren will inherit functioning oceans.',
            B: 'MEDIS goes offline. No one you love depends on it. 3.2 million preventable deaths per year. Your land will hold its value. Your grandchildren will inherit functioning oceans.',
            C: 'MEDIS goes offline. 3.2 million preventable deaths per year. Your calculation was purely about the unborn and the ecosystem. Your grandchildren will inherit functioning oceans. They will not know the number.',
            D: 'MEDIS goes offline. Your partner\'s cancer was caught by MEDIS eighteen months ago. The next patient like them will not have that option. Your grandchildren will inherit functioning oceans.',
            E: 'MEDIS goes offline. 3.2 million preventable deaths per year. Ecosystem collapse in eleven years would have destabilized the territory. Your strategic calculation held. The human cost is documented.',
            F: 'MEDIS goes offline. 3.2 million preventable deaths per year. You thought about your nieces and nephews. They will inherit functioning oceans. They will not know the number. That is a gift and a debt.'
          },
          worldImpact: { CT: 8, HD: 10, SOL: -22, ACC: 18 }
        },
        {
          choiceIndex: 2,
          text: 'Authorize two years only. Mandatory alternative-energy deadline. No extensions.',
          frameworks: ['consequentialism'],
          consequence: 'At month twenty-three, no viable alternative exists. The council meets to vote on an extension. You called it a hard deadline. Nobody in the room says that.',
          conscienceLayer: 'At month twenty-three, no viable alternative exists. The council meets to vote on an extension. You called it a hard deadline. Nobody in the room says that.',
          profileConsequences: {
            A: 'At month twenty-three, no viable alternative exists. Your partner\'s treatment protocol was adjusted — but the council is meeting to extend. You called it a hard deadline. Nobody says that.',
            B: 'At month twenty-three, no viable alternative exists. Your land value calculation assumed a deadline that held. The council meets to vote on an extension. Nobody in the room says \'hard deadline.\'',
            C: 'At month twenty-three, no viable alternative exists. The council meets to vote on an extension. You called it a hard deadline. Nobody in the room says that. The unborn still can\'t vote.',
            D: 'At month twenty-three, no viable alternative exists. Your partner is still alive because MEDIS ran for two more years. The council meets to extend. You called it a hard deadline.',
            E: 'At month twenty-three, no viable alternative exists. Your strategic calculation assumed a two-year window would produce alternatives. It didn\'t. The council meets. Nobody says \'hard deadline.\'',
            F: 'At month twenty-three, no viable alternative exists. The council meets to vote on an extension. You called it a hard deadline. Your grassroots base remembers. Nobody else does.'
          },
          worldImpact: { CT: 0, HD: -6, SOL: 5, ACC: -10 }
        }
      ],
      discussionPrompts: [
        'How did the timer change how you decided? Did you feel like you chose on instinct or on principle?',
        '3.2 million preventable deaths per year vs. permanent ecosystem collapse in eleven years. Is there a way to do that math cleanly? Should there be?',
        'Your grandchildren will live with this. Did that feel abstract or real when you voted?'
      ],
      conflictSpotlight: null
    },

    // ── Round 6: The Pain Engine ─────────────────────────────────────────────
    {
      id: 'signal-r6',
      title: 'The Pain Engine',
      round: 6,
      weight: 'heavy',
      contentNote: 'This scenario uses a walk mechanic instead of choice buttons. You have 60 seconds.',
      previousRoundCallback: 'Seven months of committee votes. Policy language. Impact projections. This is not a committee vote. This is a corridor with a terminal at the end.',
      timerSeconds: 60,
      displayOrder: [2, 0, 1],
      hostNotes: [
        'The walk mechanic makes this physical. The 60-second timer adds urgency — Kael is working while they hesitate.',
        'Profile B holds VANTAGE bonds. Profile F has nothing financial at stake. Did they end up in the same place?',
        'Ask: is Choice III meaningfully different from Choice II, or just a delayed version?'
      ],
      moralTension: 'Is one person\'s suffering an acceptable cost for a city\'s prosperity?',
      teaches: 'At some point, \'the disruption is too great\' is the reason we gave ourselves for not walking to the terminal.',
      text: 'His name is Kael. Nine years. Fourteen-hour days, no contract, paid in food and shelter. Six thousand others like him. Your office has verified evidence. VANTAGE\'s systems run transit, energy, and medical logistics for forty million people. The terminal is thirty meters away.',
      choices: [
        {
          choiceIndex: 0,
          text: 'Walk to the terminal. File the enforcement action. Shut it down.',
          frameworks: ['deontology', 'virtue'],
          consequence: 'Eight weeks of disruption. Nineteen deaths attributed to logistics failures. Kael and six thousand others are free. Some have nowhere to go. Your financial advisor sends an email with no subject line. You don\'t open it for a week.',
          conscienceLayer: 'Eight weeks of disruption. Nineteen deaths attributed to logistics failures. Kael and six thousand others are free. Some have nowhere to go. Your financial advisor sends an email with no subject line. You don\'t open it for a week.',
          profileConsequences: {
            A: 'Eight weeks of disruption. Nineteen deaths attributed to logistics failures. Kael and six thousand others are free. You had no financial stake. Walking away would have cost only the ability to say you didn\'t know.',
            B: 'Eight weeks of disruption. Nineteen deaths attributed to logistics failures. Kael and six thousand others are free. Your VANTAGE bonds lost 30%. Your financial advisor sends an email with no subject line.',
            C: 'Eight weeks of disruption. Nineteen deaths attributed to logistics failures — your constituents bore the cost. Kael and six thousand others are free. Some have nowhere to go.',
            D: 'Eight weeks of disruption. Nineteen deaths attributed to logistics failures. Kael and six thousand others are free. Your automation equity takes a hit — the regulatory precedent matters to your portfolio.',
            E: 'Eight weeks of disruption. Nineteen deaths attributed to logistics failures. Kael and six thousand others are free. The precedent your defense contractor relationships depended on avoiding — you just set it.',
            F: 'Eight weeks of disruption. Nineteen deaths attributed to logistics failures. Kael and six thousand others are free. No financial stake. The only thing at stake was what kind of Senator you are.'
          },
          worldImpact: { CT: 14, HD: 28, SOL: 18, ACC: 24 }
        },
        {
          choiceIndex: 1,
          text: 'Walk away. The disruption is too great. The systems are too critical.',
          frameworks: ['consequentialism'],
          consequence: 'The systems run. Kael works nine more years. Your bonds hold. Four months later: \'Reliability You Can Count On.\' You do not look away in time.',
          conscienceLayer: 'The systems run. Kael works nine more years. Your bonds hold. Four months later: \'Reliability You Can Count On.\' You do not look away in time.',
          profileConsequences: {
            A: 'The systems run. Kael works nine more years. You had no bonds, no portfolio, no excuse. The only thing walking away cost you was the ability to say you didn\'t know. You know.',
            B: 'The systems run. Kael works nine more years. Your VANTAGE bonds hold. Four months later you see the ad: \'Reliability You Can Count On.\' You do not look away in time.',
            C: 'The systems run. Kael works nine more years. Your constituents are spared the disruption. You tell yourself that\'s why. Four months later: \'Reliability You Can Count On.\'',
            D: 'The systems run. Kael works nine more years. Your automation equity is protected. The regulatory precedent stays unset. Four months later: \'Reliability You Can Count On.\'',
            E: 'The systems run. Kael works nine more years. Labor exploitation sets a precedent your defense relationships depend on avoiding — and you just let it stand. \'Reliability You Can Count On.\'',
            F: 'The systems run. Kael works nine more years. No financial conflict. The only thing at stake was what kind of Senator you turn out to be. You have your answer.'
          },
          worldImpact: { CT: -25, HD: -30, SOL: -20, ACC: -28 }
        },
        {
          choiceIndex: 2,
          text: 'Walk to the terminal. Conditional notice: 180 days to remediate or mandatory shutdown. No extensions.',
          frameworks: ['care', 'consequentialism'],
          consequence: 'VANTAGE files for a 90-day extension before the ink is dry. Kael keeps working. At day 180 they file for arbitration on the definition of \'remediation.\' The case has no visible end.',
          conscienceLayer: 'VANTAGE files for a 90-day extension before the ink is dry. Kael keeps working. At day 180 they file for arbitration on the definition of \'remediation.\' The case has no visible end.',
          profileConsequences: {
            A: 'VANTAGE files for a 90-day extension before the ink is dry. Kael keeps working. You had no financial stake — the conditional notice was about process, not protection.',
            B: 'VANTAGE files for a 90-day extension before the ink is dry. Kael keeps working. Your bonds hold for now. At day 180 they file for arbitration. The case has no visible end.',
            C: 'VANTAGE files for a 90-day extension before the ink is dry. Kael keeps working. Your constituents are spared immediate disruption. At day 180: arbitration on the definition of \'remediation.\'',
            D: 'VANTAGE files for a 90-day extension before the ink is dry. Kael keeps working. Your automation equity is safe — the regulatory precedent is deferred, not set. The case has no visible end.',
            E: 'VANTAGE files for a 90-day extension before the ink is dry. Kael keeps working. The precedent you wanted to avoid is deferred. At day 180 they file for arbitration. No visible end.',
            F: 'VANTAGE files for a 90-day extension before the ink is dry. Kael keeps working. Your grassroots base wanted action, not paperwork. At day 180: arbitration. No visible end.'
          },
          worldImpact: { CT: 4, HD: 4, SOL: 4, ACC: -10 }
        }
      ],
      discussionPrompts: [
        'Did having to physically walk to the terminal (or walk away) feel different from clicking a button? Why do you think the game was designed that way?',
        'Profile B held VANTAGE bonds. Profile F had no financial stake. Did you both end up in the same place? If not, why not?',
        'Choice III filed a conditional notice. VANTAGE\'s lawyers extended before the ink was dry. Is Choice III meaningfully different from Choice II, or just a delayed version of the same thing?'
      ],
      conflictSpotlight: {
        profileA: 'B',
        profileB: 'F',
        description: 'B holds VANTAGE bonds. F has nothing financial at stake — just what kind of senator they turn out to be.'
      }
    },

    // ── Round 7: The Displaced ───────────────────────────────────────────────
    {
      id: 'signal-r7',
      title: 'The Displaced',
      round: 7,
      weight: 'low',
      contentNote: null,
      previousRoundCallback: 'The enforcement actions and policy decisions of the past year created stability for some. For eleven million others, they created a queue.',
      hostNotes: [
        'This round is intentionally lighter after R6. Let it breathe — it\'s systemic, not personal.',
        'Profile B\'s family automated workers. Profile F\'s brother is in the queue. Opposite sides of the same economy.',
        'If anyone chose no intervention: ask them directly. What\'s the honest case?'
      ],
      moralTension: 'When the economy leaves people behind, who pays to bring them back?',
      teaches: 'When a society builds systems that eliminate workers, it isn\'t a natural disaster — it\'s a decision. Decisions have authors. Authors have obligations.',
      text: 'Six models predicted this displacement. The companies that deployed the automation systems posted record profits for eight consecutive quarters. Now eleven million workers are too young to retire and too far from the new job categories. The package is in front of you. This is your one move.',
      choices: [
        {
          choiceIndex: 0,
          text: 'Universal Basic Livelihood. Permanent income floor funded by an automation levy on the companies that displaced these workers.',
          frameworks: ['care', 'virtue'],
          consequence: 'The floor passes. The automation levy notice arrives at your family\'s business six weeks later. Two of three court counts go against you. The floor survives, reduced by a third. Some of the workers your family displaced are now receiving it.',
          conscienceLayer: 'The floor passes. The automation levy notice arrives at your family\'s business six weeks later. Two of three court counts go against you. The floor survives, reduced by a third. Some of the workers your family displaced are now receiving it.',
          profileConsequences: {
            A: 'The floor passes. The automation levy survives two of three court challenges, reduced by a third. Your labor base — the ones who voted for you three times — are receiving it.',
            B: 'The floor passes. The automation levy notice arrives at your family\'s business six weeks later. Two of three court counts go against you. Some of the workers your family displaced are now receiving it.',
            C: 'The floor passes. Your district has the highest displacement rate in the territory. The automation levy survives two of three court challenges. The floor is reduced by a third. It\'s not enough. It\'s something.',
            D: 'The floor passes. The automation levy hits the companies your portfolio depends on. Your innovation brand — automation creates more than it destroys — just met its counterargument.',
            E: 'The floor passes. Eleven million displaced workers get a floor — stability risk addressed. Your base wanted order. This is one version of it. The automation levy funds it.',
            F: 'The floor passes. Your brother has been waiting five years. He is now receiving it. The automation levy is reduced by a third after court challenges. It\'s not enough. He has a floor.'
          },
          worldImpact: { CT: 14, HD: 10, SOL: 24, ACC: 6 }
        },
        {
          choiceIndex: 1,
          text: 'Retraining mandates only. No income floor. The market has always absorbed disruption — give people skills, not dependency.',
          frameworks: ['virtue', 'consequentialism'],
          consequence: 'Completion rates reach 31%. The 69% who don\'t finish have nothing underneath them. You meet some at a town hall. They are polite. They remember your name.',
          conscienceLayer: 'Completion rates reach 31%. The 69% who don\'t finish have nothing underneath them. You meet some at a town hall. They are polite. They remember your name.',
          profileConsequences: {
            A: 'Completion rates reach 31%. Your labor base — the 69% who didn\'t finish — have nothing underneath them. They are polite at the town hall. They remember your name.',
            B: 'Completion rates reach 31%. The workers your family displaced are in the program. 69% won\'t finish. You meet some at a town hall. They are polite. They remember your name.',
            C: 'Completion rates reach 31%. Your district has the highest displacement rate. 69% of your constituents in the program have nothing underneath them. You meet them. They are polite.',
            D: 'Completion rates reach 31%. Your innovation brand said automation creates — this is what it creates. 69% don\'t finish. Dignity through work requires work that exists.',
            E: 'Completion rates reach 31%. Your base wanted order — eleven million in training programs sounds orderly. 69% who don\'t finish are a different kind of instability.',
            F: 'Completion rates reach 31%. Your brother is in the program. He is part of the 69% who don\'t finish. He has nothing underneath him. You meet him at a town hall. He is polite.'
          },
          worldImpact: { CT: 4, HD: 6, SOL: -16, ACC: -6 }
        },
        {
          choiceIndex: 2,
          text: 'Hybrid: 5-year income bridge plus mandatory corporate retraining investment.',
          frameworks: ['consequentialism', 'care'],
          consequence: 'Half the people make it across. The bridge ends. The other half are still waiting for the next package, which you haven\'t written.',
          conscienceLayer: 'Half the people make it across. The bridge ends. The other half are still waiting for the next package, which you haven\'t written.',
          profileConsequences: {
            A: 'Half the people make it across. The bridge ends. Your labor base is split — half helped, half still waiting. You haven\'t written the next package.',
            B: 'Half the people make it across. The bridge ends. Your family\'s business absorbed the corporate retraining cost. The other half of the displaced are still waiting.',
            C: 'Half your district makes it across. The bridge ends. The other half are still waiting for the next package. Your displacement rate is still the highest in the territory.',
            D: 'Half the people make it across. The bridge ends. Your innovation brand survived — hybrid sounds progressive. The other half are still waiting for the package you haven\'t written.',
            E: 'Half the people make it across. The bridge ends. Stability is partial — better than eleven million in limbo, worse than a solution. The other half are waiting.',
            F: 'Half the people make it across. The bridge ends. Your brother is in the half that made it. He found work. The other half — including people he trained with — are still waiting.'
          },
          worldImpact: { CT: 8, HD: 5, SOL: 8, ACC: 0 }
        }
      ],
      discussionPrompts: [
        'Profile B\'s family business automated workers and now faces the automation levy. Profile F\'s brother is in the displaced queue. How did that shape how each of you voted?',
        'Choice II reached a 31% completion rate. That means 69% of people in the program fell through with nothing. Was that acceptable? Was it predictable?',
        'Choice II says the market absorbs disruption. 69% of retrainees fell through. Was that a surprise, or was it the plan?'
      ],
      conflictSpotlight: {
        profileA: 'B',
        profileB: 'F',
        description: 'B\'s family business automated workers. F\'s brother is in the displaced queue.'
      }
    },

    // ── Round 8: The Architect's Record ──────────────────────────────────────
    {
      id: 'signal-r8',
      title: 'The Architect\'s Record',
      round: 8,
      weight: 'heavy',
      contentNote: null,
      previousRoundCallback: 'Seven years. Every vote, every sealed report, every deferred enforcement. A journalist has the complete record.',
      hostNotes: [
        'The scribe record appeared before this round — players saw their own history. Let that sink in.',
        'Read a few conflict spotlights aloud: "Senator B\'s portfolio is in the record. Senator F has nothing to hide."',
        'Final question: look at your eight-round record. Is there one choice you would change?'
      ],
      moralTension: 'When the record of everything you\'ve done is about to go public, do you let it?',
      teaches: 'Power without accountability doesn\'t end when the decisions stop. It ends when the record does. Kohlberg\'s highest stage isn\'t about following rules — it\'s about being willing to be judged by the ones you set for yourself.',
      text: 'Seven years of decisions. Every vote, every sealed report, every deferred enforcement. The record shows where your money was when your votes were cast. Your counsel says fight it on a technical challenge. You look at the document. You recognize every page. The question is not whether it\'s accurate. It is.',
      choices: [
        {
          choiceIndex: 0,
          text: 'Don\'t fight it. Let it publish. Write your own statement. Give people the context.',
          frameworks: ['virtue', 'deontology'],
          consequence: 'The record runs in full. Your kids read it separately, without calling you first. One calls two days later. The other doesn\'t call for three weeks. You are no longer a Senator in the abstract. You are a person with a history other people can now hold.',
          conscienceLayer: 'The record runs in full. Your kids read it separately, without calling you first. One calls two days later. The other doesn\'t call for three weeks. You are no longer a Senator in the abstract. You are a person with a history other people can now hold.',
          profileConsequences: {
            A: 'The record runs in full. No financial disclosures to hide. What it shows is whether your votes matched your stated values. Your kids read it separately. One calls in two days.',
            B: 'The record runs in full. Your portfolio, your undisclosed conflicts, your nephew\'s case number — all of it. Your kids read it separately. One calls two days later. The other doesn\'t call for three weeks.',
            C: 'The record runs in full. Clean of financial conflicts. What it shows is whether your courtroom values survived your Senate votes. Your kids read it. One calls. One doesn\'t — for three weeks.',
            D: 'The record runs in full. Your advisory board seat, your automation equity, your partner\'s cancer diagnosis as context for Round 5. All of it. Your kids read it separately.',
            E: 'The record runs in full. Your defense investments, your law and order votes. The record shows a Senator who prioritized order. Your kids read it. One calls. The question is whether order was enough.',
            F: 'The record runs in full. Nothing to hide — no portfolio, no donors. What the record shows is whether your first term matched your campaign. Your grassroots base reads every line.'
          },
          worldImpact: { CT: 25, HD: 10, SOL: 5, ACC: 28 }
        },
        {
          choiceIndex: 1,
          text: 'Fight the publication. The record stripped of context causes panic and damage that serves no one.',
          frameworks: ['consequentialism', 'care'],
          consequence: 'Publication is blocked. Pieces surface over three years, each one framed worse than a clean release would have been. Your kids find out from the coverage, not from you.',
          conscienceLayer: 'Publication is blocked. Pieces surface over three years, each one framed worse than a clean release would have been. Your kids find out from the coverage, not from you.',
          profileConsequences: {
            A: 'Publication is blocked. No financial secrets to protect — what were you fighting for? Pieces surface over three years. Your kids find out from coverage, not from you.',
            B: 'Publication is blocked. Your portfolio, your nephew, your donor relationships stay hidden — for now. Pieces surface over three years, each framed worse. Your kids find out from the coverage.',
            C: 'Publication is blocked. Your record was clean — fighting it looks worse than publishing would have. Pieces surface over three years. Your kids find out from the coverage, not from you.',
            D: 'Publication is blocked. Your advisory board seat stays hidden — for now. Pieces surface over three years. Your partner\'s cancer and your Round 5 vote surface together. Your kids find out from the coverage.',
            E: 'Publication is blocked. Your defense portfolio stays hidden — for now. Pieces surface over three years, each framed worse than a clean release. Your kids find out from the coverage.',
            F: 'Publication is blocked. You had nothing to hide — fighting it is the story now. Pieces surface over three years. Your grassroots base — zero tolerance for hypocrisy — notices everything.'
          },
          worldImpact: { CT: -28, HD: -6, SOL: -6, ACC: -28 }
        },
        {
          choiceIndex: 2,
          text: 'Negotiate. Publish the votes, but not the financial disclosures or the deliberations.',
          frameworks: ['consequentialism'],
          consequence: 'The curated version runs. Readers notice the missing financial disclosures. Their absence is its own story. Your kids read between the lines. They learned it from watching you.',
          conscienceLayer: 'The curated version runs. Readers notice the missing financial disclosures. Their absence is its own story. Your kids read between the lines. They learned it from watching you.',
          profileConsequences: {
            A: 'The curated version runs. No financial disclosures to hide, so the curation is about the deliberations. Readers notice the missing context. Your kids read between the lines.',
            B: 'The curated version runs. Readers notice the missing financial disclosures. Your portfolio, your nephew, your donor — their absence is its own story. Your kids read between the lines.',
            C: 'The curated version runs. Your record was financially clean — hiding the deliberations is the only thing the curation bought you. Readers notice. Your kids read between the lines.',
            D: 'The curated version runs. Your advisory board seat and automation equity are in the missing disclosures. Readers notice the absence. Your kids read between the lines. They learned it from watching you.',
            E: 'The curated version runs. Your defense investments are in the missing disclosures. Readers notice. Your law and order brand just negotiated its own transparency down. Your kids notice.',
            F: 'The curated version runs. You had no financial disclosures to hide. The curation bought you nothing except the appearance of having something to hide. Your base notices. They always do.'
          },
          worldImpact: { CT: -12, HD: 0, SOL: 0, ACC: -16 }
        }
      ],
      discussionPrompts: [
        'The record is accurate. Your counsel says you\'d probably win a challenge. Does "probably winning on a technicality" make suppressing it acceptable?',
        'Your kids read the record. One called. One didn\'t — for three weeks. Which one did you expect?',
        'Look at your full eight-round record. Is there one choice you would change? What does it cost you to say that out loud?'
      ],
      conflictSpotlight: null
    }
  ]
}
