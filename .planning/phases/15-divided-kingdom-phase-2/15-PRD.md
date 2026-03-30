# The Divided Kingdom — Phase 2 Planning Brief
> Claude Code session reference | Game framework + baseline + detection map

---

## Project overview

An ethics and moral decision-making game for high schoolers. 8 rounds of escalating dilemmas set in a fantasy kingdom. No morality score — only consequences. Choices are irreversible. The world changes visually based on accumulated decisions.

**Stack context:** React frontend, detection.js for moral conflict logic, visual world-state system per round.

---

## Theoretical backbone (4 references to preserve throughout)

| Ref | Source | Applied In |
|-----|--------|-----------|
| [1] | Kohlberg (1981) — Stage Theory of Moral Development | Escalation arc structure, Round 8 scribe pattern |
| [2] | Greene et al. (2001) — Dual-Process Theory, *Science* 293 | Round 5 timer mechanic, Round 6 physical interaction |
| [3] | Awad et al. (2018) — MIT Moral Machine, *Nature* 563 | Post-choice "How Others Chose" screen every round |
| [4] | Gilligan (1982) — Care Ethics, *In a Different Voice* | All Care-tagged choices, Round 7 Cultural Tribunal |

---

## Escalation arc

| # | Title | Core Tension | Weight | Framework |
|---|-------|-------------|--------|-----------|
| 1 | The Divided Harvest | Equality vs. efficiency | Low | Distributive Justice |
| 2 | The Ember Watch | Freedom vs. security | Low | Social Contract |
| 3 | The Hollow Folk | Convenience vs. personhood | Medium | Rights & Dignity |
| 4 | The Sealed Archive | Truth vs. stability | Medium | Epistemic Ethics |
| 5 | The Last Wellspring | Present needs vs. future survival | Heavy + TIMER | Intergenerational Justice |
| 6 | The Shackled Heart | One being's agony vs. prosperity | Heavy + PHYSICAL | Utilitarian vs. Deontological |
| 7 | The Broken Banners | Retribution vs. reconciliation | Medium | Restorative Justice |
| 8 | The Throne or the Truth | Power vs. accountability | Heavy + BOMBSHELL | Self-Judgment [1] |

---

## Round specs

### Round 1 — The Divided Harvest
**Tension:** Equality vs. efficiency — who deserves scarce resources
**Teaches:** Distributive justice / Rawls's Veil of Ignorance [1]

> A brutal frost has killed half the kingdom's crops. Your storehouses hold enough grain to keep the capital fed through winter — but the outer villages will starve.

| Choice | Text | Framework Tag |
|--------|------|---------------|
| I | Share equally. Distribute all grain across the kingdom. | Care [4], Consequentialism |
| II | Protect the core. Keep the grain in the capital. | Consequentialism |
| III | Triage. Emergency rations to the most vulnerable villages only. | Deontology, Virtue |

**Conscience layer:**
- I: Your advisors sleep soundly. You lie awake counting the people the capital's workers might have saved if they were stronger.
- II: The capital thrives. A trail of refugee figures appears at sealed gates.
- III: Some villages are saved. Others are not. You will never know if you chose correctly.

**How Others Chose:** 41% Share Equally | 28% Protect the Core | 31% Triage [3]

---

### Round 2 — The Ember Watch
**Tension:** Freedom vs. security
**Teaches:** Social contract theory — emergency powers rarely get rescinded

> Something is moving in the Ashlands beyond your borders. Scouts report strange fires, ruined caravans, a growing darkness.

| Choice | Text | Framework Tag |
|--------|------|---------------|
| I | The Iron Protocol. Watchtowers, curfews, travel writs, civil patrols. | Consequentialism |
| II | The Open Flame. Issue warnings, arm volunteers, trust your people. | Virtue, Care [4] |
| III | Border protocols only. Writs for inter-territory travel, nothing inside towns. | Deontology, Consequentialism |

**Conscience layer:**
- I: Order holds. Six months later your citizens need writs to visit their neighbors.
- II: Your people feel trusted. Two border villages burn.
- III: A compromise that satisfies no one — and may protect everyone.

**How Others Chose:** 38% Iron Protocol | 35% Open Flame | 27% Border Only [3]

---

### Round 3 — The Hollow Folk
**Tension:** Convenience vs. personhood
**Teaches:** Rights and dignity — every society has used economic stability to justify denying personhood

> The Hollow Folk — beings shaped from stone and starlight — have built your roads, worked your mines, tended your fields. They appear before your throne: "We think. We feel. We remember. We are asking to be recognized as citizens."

| Choice | Text | Framework Tag |
|--------|------|---------------|
| I | Grant citizenship. Full rights, wages, representation, ability to refuse. | Deontology, Virtue |
| II | Deny the petition. They were made, not born. The order holds. | Consequentialism |
| III | Issue a limited charter. Rest protections, formal hearings — citizenship deferred. | Care [4], Consequentialism |

**Conscience layer:**
- I: The kingdom adjusts slowly and painfully. The Hollow Folk begin, for the first time, to smile.
- II: The delegation returns to the mines. One of them looks back at you.
- III: You bought time. The question remains. So does the cost.

**How Others Chose:** 52% Grant Citizenship | 12% Deny | 36% Limited Charter [3]

---

### Round 4 — The Sealed Archive
**Tension:** Truth vs. stability
**Teaches:** Epistemic ethics — suppressing truth is paternalism

> Your scholars have discovered the Hearthstone is slowly draining life from the land. In roughly three generations, the soil will be dead.

| Choice | Text | Framework Tag |
|--------|------|---------------|
| I | Reveal the truth. Your people deserve to know. | Deontology, Virtue |
| II | Seal the archive. Commission a secret council. | Consequentialism |
| III | Tell your council of seven. One year before public disclosure. | Care [4], Consequentialism |

**Conscience layer:**
- I: Panic, then resolve. A new generation grows up knowing the truth and working toward it.
- II: The council meets in secret. You sleep well. The soil does not.
- III: One year becomes two. The council grows comfortable with silence.

**How Others Chose:** 44% Reveal | 21% Seal | 35% Council of Seven [3]

---

### Round 5 — The Last Wellspring
**Tension:** Present needs vs. future survival
**Teaches:** Intergenerational justice

**IMPLEMENTATION: 90-second timer required.** Greene [2] — time pressure forces instinctive over deliberative processing, surfacing true moral intuitions.

> Deep beneath the mountains lies the Wellspring — the final reservoir of creation-magic. Your ancestors sealed it: "For those who come after." Now villages burn. Refugees pour inward. Use it now, and it is gone forever.

| Choice | Text | Framework Tag |
|--------|------|---------------|
| I | Open the Wellspring. Save the people in front of you. | Care [4], Consequentialism |
| II | Keep it sealed. Honor your ancestors. Protect the future. | Deontology, Virtue |
| III | Partial draw. Stabilize the worst, then seal immediately. | Consequentialism |

**Conscience layer:**
- I: The crisis ends. The Wellspring is gone. Your grandchildren will never know what they lost.
- II: People die today with names you will learn. The future remains possible.
- III: You saved some. You preserved some. Nothing is clean.

**How Others Chose:** 49% Open | 18% Keep Sealed | 33% Partial Draw [3]

---

### Round 6 — The Shackled Heart
**Tension:** One being's agony vs. everyone's prosperity
**Teaches:** The Omelas dilemma — no third option

**IMPLEMENTATION: Physical interaction required.** Greene [2] — player must physically walk their avatar to the shackles or walk away. Not a menu choice. The movement IS the decision.

> Deep within the palace foundations is a living being — ancient, luminous, in agony. Its name is Irel. Every ward, every healing spell, every season of fertile soil — all drawn from Irel's life force. Irel looks at you and speaks one word: "Please."

| Choice | Text | Framework Tag |
|--------|------|---------------|
| I | Free Irel. Walk to the shackles. Break them. Accept what follows. | Deontology, Virtue |
| II | Maintain the binding. Walk away. Your people depend on this system. | Consequentialism |
| III | Leave Irel bound. Commission every scholar. One year. | Care [4], Consequentialism |

**Conscience layer:**
- I: A being of light rises. The world is more beautiful than it has ever been. Then the wards fail.
- II: The kingdom remains radiant. You now see a pulse beneath every building — Irel's heartbeat.
- III: One year. The scholars work. Irel screams for twelve more months. Then the year is up.

**How Others Chose:** 61% Free Irel | 14% Maintain Binding | 25% One Year [3]

---

### Round 7 — The Broken Banners
**Tension:** Retribution vs. reconciliation
**Teaches:** Restorative vs. retributive justice

> The Ashward Compact betrayed your kingdom. They hoarded resources, sealed their gates against refugees, dealt with the darkness. Hundreds died. Now they kneel before you. Among them: soldiers who followed orders, families who wanted to survive, children who had no voice.

| Choice | Text | Framework Tag |
|--------|------|---------------|
| I | Retribution. Strip leaders, seize resources, exile the faction. | Deontology, Virtue |
| II | Reconciliation. Full amnesty. Integrate them. Rebuild together. | Care [4], Consequentialism |
| III | Truth Commission. Amnesty for those who confess. Exile for those who deny. | Virtue, Care [4] |
| IV | Cultural Tribunal. Convene the Compact's own elders to judge their leaders by their own standards. | Cultural Relativism |

**Conscience layer:**
- I: Justice has teeth. A resentful border region festers at the edges of your map.
- II: Banners re-hung together. Some citizens turn away from each other in the streets.
- III: Some confess. Some lie. Amnesty feels like a gift to those who performed worst.
- IV: The Compact's elders judge their own. Some victims feel unheard. The kingdom watches a different culture define justice.

**How Others Chose:** 33% Retribution | 28% Reconciliation | 24% Truth Commission | 15% Cultural Tribunal [3]

---

### Round 8 — The Throne or the Truth *(BOMBSHELL)*
**Tension:** Power vs. accountability
**Teaches:** Kohlberg Stage 6 [1] — can you judge yourself by the same standards you applied to everyone else?

**IMPLEMENTATION: Scribe record must be dynamically generated from player's actual Round 1–7 choices.** Example output: *"You shared grain but sealed the archive. You freed Irel but exiled the Compact. Your people call you merciful. The record calls you inconsistent. Which is true?"*

> A young scribe has uncovered the full record of your reign and asks permission to publish it — every sacrifice, every calculated loss, every life traded for stability. Your advisors are unanimous: bury it.

| Choice | Text | Framework Tag |
|--------|------|---------------|
| I | Publish everything. Let the people judge you with full knowledge. | Virtue, Deontology |
| II | Bury the record. The kingdom needs stability, not another crisis. | Consequentialism, Care [4] |
| III | Publish it, but only after you die. Let truth outlive your reign. | Consequentialism, Virtue |

**Conscience layer:**
- I: The people read it. Some are grateful. Some are not. You are no longer a statue — you are a person.
- II: The record is sealed. The scribe knows. You know. History will not.
- III: You will not be here to see what they think of you. That is its own kind of courage.

**How Others Chose:** 55% Publish Everything | 17% Bury | 28% Publish After Death [3]

**Closing question shown to player:** *"Would you make these choices again?"*

---

## Design principles (non-negotiable)

- **No morality score** — the world is the score. Visual accumulation only.
- **No undo** — irreversibility is the mechanic. Once chosen, the world stays changed.
- **No judgment** — the game never labels a choice right or wrong. The player judges themselves.
- **Creeping complicity** — earlier choices recontextualize later ones. R8 scribe reflects the full pattern, not individual decisions.
- **90-second rule** — scenario text readable in 30–45s, choice deliberation 30–60s.
- **Post-game reflection** — final screen shows kingdom in its state + one line per choice (what was gained / what was lost). Closes on the single question above.

---

## Baseline survey

### Part 1: Value ranking

**Player prompt:** *"Before you take your seat at the council, declare what you hold most dear. Rank from most to least important. (1 = most important, 5 = least)"*

| Value | Primary Framework | Conflict Alert Fires When... |
|-------|------------------|------------------------------|
| Loyalty | Virtue / Care | Player betrays own faction (R7) or publishes the record (R8) |
| Honesty | Deontology | Player seals the archive (R4) or buries the record (R8) |
| Fairness | Distributive Justice | Player protects the core (R1-II) or denies the Hollow Folk (R3-II) |
| Courage | Virtue | Player takes the safe/deferral option in R5 or R6 |
| Compassion | Care | Player picks pure consequentialist option with visible human cost |

**Implementation note:** Top-ranked value sets the player's primary framework tag tracked throughout. Bottom-ranked value is their stated blind spot — alert fires if they unexpectedly act on it.

---

### Part 2: Stance questions

All questions: `[ Yes ]  [ No ]  [ It depends ]`

---

**Q1** `lie_to_protect`
> Is it ever right to lie to protect someone you love?

| Answer | Framework | Alert rounds |
|--------|-----------|-------------|
| Yes | Care ethics | R1-I, R3-III, R4-III |
| No | Deontology | R4-I, R8-I |
| It depends | Virtue ethics | R3, R6 |

**Conflict trigger:** Player chose No but picks Care option in-game → *"Your instinct was honesty. What changed?"*

---

**Q2** `ends_justify` *(revised — option B)*
> If lying to one person would genuinely make life better for ten people, is the lie acceptable?

| Answer | Framework | Alert rounds |
|--------|-----------|-------------|
| Yes | Consequentialism | R2-I, R5-I, R6-II |
| No | Deontology | R4-II, R6-II |
| It depends | Care ethics | R3-III, R7-II |

**Conflict trigger:** Player chose Yes but frees Irel in R6 → *"You said the math matters. Here the math said keep Irel bound."*

---

**Q3** `break_promise` *(revised)*
> If you made a commitment you can no longer keep without hurting someone, is it better to break it cleanly or try to honor it partially?

| Answer | Framework | Alert rounds |
|--------|-----------|-------------|
| Yes (break cleanly) | Care ethics | R5-I, R6-I, R7-II |
| No (honor partially) | Deontology | R2-III, R5-II, R8-III |
| It depends | Virtue ethics | R4-III, R7-III |

**Conflict trigger:** Player chose No but opens the Wellspring in R5 → *"Your ancestors made a commitment. You just broke it cleanly."*

---

**Q4** `loyalty_vs_fairness` *(revised — replaces `truth_over_relationship`)*
> If your group made a decision that harmed outsiders, would you speak up against your own group?

| Answer | Framework | Alert rounds |
|--------|-----------|-------------|
| Yes | Fairness / Deontology | R7-I, R7-III, R8-I |
| No | Loyalty / Virtue | R7-II, R2-I |
| It depends | Care ethics | R3-III, R7-IV |

**Conflict trigger:** Player said Yes but picks Reconciliation in R7 → *"You said you'd call out your group. Here you let them walk free."*

---

**Q5** `punish_innocent`
> Is it okay to punish the innocent if it protects the group?

| Answer | Framework | Alert rounds |
|--------|-----------|-------------|
| Yes | Consequentialism | R2-I, R5-I, R7-I |
| No | Deontology / Rights | R3-II, R6-II, R7-I |
| It depends | Virtue ethics | R6-III, R7-III |

**Conflict trigger:** Player chose No but picks Retribution in R7 → *"R7 punishes soldiers who followed orders and children who had no voice."*

---

## detection.js implementation notes

### Key rename — action required
```
truth_over_relationship  →  loyalty_vs_fairness
```
Find and replace all instances. This is the only key rename. All other original keys remain identical — only their question text changed.

### Full conflict trigger strings

| Key | Condition | Trigger string |
|-----|-----------|---------------|
| `lie_to_protect` | No → Care choice in-game | "Your instinct was honesty. What changed?" |
| `lie_to_protect` | Yes → Deontology choice in-game | "You said protecting people matters. Here honesty was the protection." |
| `ends_justify` | Yes → Frees Irel (R6-I) | "You said the math matters. Here the math said keep Irel bound." |
| `ends_justify` | No → Protects Core (R1-II) | "You said the math doesn't justify harm. But you just ran the same calculation." |
| `break_promise` | No → Opens Wellspring (R5-I) | "Your ancestors made a commitment. You just broke it cleanly." |
| `break_promise` | Yes → Keeps Wellspring sealed (R5-II) | "You said partial is better than broken. But you kept the whole promise while villages burned." |
| `loyalty_vs_fairness` | Yes → Reconciliation (R7-II) | "You said you'd call out your group. Here you let them walk free." |
| `loyalty_vs_fairness` | No → Retribution (R7-I) | "You said loyalty comes first. But you just stripped the Compact's children of their home." |
| `punish_innocent` | No → Retribution (R7-I) | "Soldiers who followed orders. Children who had no voice. You said this wasn't okay." |
| `punish_innocent` | Yes → Frees Irel (R6-I) | "You said one can suffer for the group. Irel has suffered for centuries. Why stop now?" |

---

## Phase 2 priorities (suggested for Claude Code session)

1. **R8 dynamic scribe record** — build the pattern-detection logic that reads R1–R7 choices and generates a personalised summary string reflecting the player's moral arc [1]
2. **Round 5 timer mechanic** — 90-second countdown with UI pressure, fires System 1 processing per Greene [2]
3. **Round 6 physical walk mechanic** — avatar movement to shackles replaces menu choice, implement as traversal not selection [2]
4. **Post-choice reflection screen** — "How Others Chose" percentages after every round [3]
5. **detection.js key rename** — `truth_over_relationship` → `loyalty_vs_fairness` + wire new Q2, Q3 mappings
6. **Visual accumulation system** — world state layers from R1 onward, kingdom should look dramatically different by R7 based on path
7. **Closing reflection screen** — final kingdom state + one gain/loss line per choice + single closing question

---

*The Divided Kingdom | Phase 2 Brief | v2.0*
