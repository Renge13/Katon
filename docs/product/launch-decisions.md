<!--
STATUS: LIVE — commercial + launch decisions. Companion to PROGRESS.md.
CREATED: 2026-07-30. Captures the strategy reset, the revenue model, the abuse/cost analysis,
         and the imajidiri competitor teardown.
Read this before any launch, pricing, or funnel work.
-->

# Katon — Launch & Commercial Decisions

> **⚠ SEQUENCING IN §1 AND §5 WAS REVERSED LATER THE SAME DAY (2026-07-30).**
> The strength engine is **UN-PARKED** and compat is **back in scope** as the v1 money engine — because
> the engine gates compat, the annual reading, the luck-pillar map and career depth (four revenue
> lines, one ~2-week build), not just compat. See PROGRESS.md "STRATEGY RESET" + TODO, and
> KATON-paid-product-map.md.
> **What still stands in this file:** the pricing analysis (§2), the abuse/cost math (§3), and the
> competitor teardown (§4). Read those. Ignore the build order in §1 and §5.

## 1. THE STRATEGY RESET  ~~(superseded — see banner above)~~

**Decision: ship the card first. Park the depth.**

The reasoning, in the order it should move you:

**a) The archetype needs none of the engine work.** The Day Master — the 10 archetypes, the shareable
face, the spine of the card — comes from the **day pillar**, which is pure 60-day modular arithmetic
off an anchor date. No ephemeris. No solar terms. It cannot be wrong. Everything in the 2026-07-29 and
07-30 engine sessions (1,212 solar-term boundaries, sxtwl vs tyme4ts, 52-second disagreements) affects
only the **month** pillar and the 立春 year boundary — which feed strength, Ten Gods, profile and bars.
Those are the *depth* layers. The viral surface has been safely computable the whole time.

**b) The known failure was never accuracy.** `KATON-coldread-analysis.md`, first line: *"The copy is
not the problem. Coherence is."* Nobody has ever complained the math was wrong. Two sessions on
calculation accuracy was displacement activity — tractable, verifiable, satisfying work substituting
for the ambiguous, unverifiable work of making prose land.

**c) Depth is not what drives response rate.** The IG character-card format that pulled 511 "add
yours" contains zero mechanism: no percentages, no elements, no jargon. Name, tags, misunderstood-as,
superpower, blindspot, concrete objects.

**Timeline: 2–3 weeks to ship, not 5–7.**

**Parked:** strength engine, element bars, favorable element, the ~78 prose modules, paid compat,
3-way synthesis. The specs are written and waiting; un-park after the card ships.

**Still worth doing:** the tyme4ts swap. One session, deletes ~200 lines of liability, and the month
pillar is needed eventually. Do it because it's cheap, not because it blocks.

---

## 2. REVENUE MODEL — DECIDED

```
FREE (ungated, complete)           PAID (optional, ~19k)         PAID (later, price TBD)
─────────────────────────          ──────────────────────        ──────────────────────
Full mirror reading            →   Hi-res card + packaged   →    Compatibility (relation)
Sharecard / archetype              PDF report                    2nd person required
Recognition moment delivered       Offered AFTER the read        Paywall after pairing tease
```

**The rule: gate nothing, sell something.**

The 19k object is an **upsell, never a gate**. It is offered after the free reading has landed and the
sharecard is already in the user's hands. Three properties make this work:

1. The ask lands on a warm person who just felt seen.
2. Refusal costs nothing — they still share, so the viral loop is untouched.
3. **Take rate is the pricing evidence we currently do not have.** If warm users convert at 19k, the
   mirror demonstrably has price power and gating can be revisited *with data*.

### Why the 19k mirror GATE was rejected

Worth recording precisely, because this idea keeps resurfacing:

- The originally-stated reason ("to recover lunch-money API cost") was **void** — see §3. Cost was
  never an argument for gating, in either direction.
- The real reason: **a gate at the top of the funnel asks for money before any investment exists.**
  imajidiri can charge 15k because by then the user has answered 12 questions, written two essays and
  handed over email + WhatsApp. Sunk cost does the converting. A Katon user has typed one birthdate.
- Two gates in one funnel (19k then compat) compounds badly — the second ask reads as nickel-and-diming.
- Strategic cost: you'd be trading a willingness-to-pay engine for a small revenue line.

### Compatibility pricing is an OPEN QUESTION

**80–99k has no market evidence behind it.** It was set by intuition. imajidiri charges **Rp15,000**
(~$1) for a comparable-feeling self artifact — below the "let me think about it" line.

Compat is a *considered* purchase about a relationship, different psychology, plausibly supports more.
But **test 25–45k before committing to 80–99k.** The gap between "impulse" and "considered" is where
most Indonesian digital products die. Pricing is currently an assumption wearing the clothes of a
decision.

---

## 3. ABUSE & COST — SETTLED WITH ARITHMETIC

**The question:** can people abuse a free mirror at the cost of the API key, or resell it?

**API cost ceiling: ~$115. Total. Ever.**

```
Gemini 2.5 Flash-Lite            ~$0.0008 per uncached reading
Naive upper bound of mirror space  144,000 distinct semantic profiles
                                 ─────────────────────────────────
Cost to cache the ENTIRE space forever      ~$115
```

Readings are cached on `hash(semantic_JSON + engine_version)`, and 144,000 is the overcount the
architecture already rejected (~78 modules assembling ~7–8 per chart). Common charts are pre-warmed
deliberately, so abuse can only ever touch the rare long tail. A reseller running 10,000 charts hits
mostly cache and costs fractions of a cent on the misses.

**There is no API-cost argument for gating the mirror. Dropped permanently as a consideration.**

**On reselling:** the economics are terrible for the reseller — manual entry per customer, arbitraging
a free good with labour. They'd earn more just telling people about katon.app and taking an affiliate
cut. And this is already how BaZi works in Indonesia: practitioners charge for readings computed with
free tools, and that market does not destroy tool makers. Flip it — **if someone can resell your free
mirror for money, your free mirror has willingness-to-pay attached.** That's the WTP engine working.

**The real abuse risk is content harvesting, not API cost.** Someone bulk-generating charts to scrape
the module library and prose to clone it. Cheap mitigations, do them regardless:

- Rate-limit per IP / session
- No bulk endpoint
- No enumerable reading URLs

---

## 4. COMPETITOR TEARDOWN — imajidiri.com/character-card

Their architecture is **the inverse of ours**:

| | imajidiri | Katon |
|---|---|---|
| Input | 12 questions incl. 2+ sentence essays | Birthdate only |
| Free | Archetype name + 6 tags | The **full mirror** |
| Paid | The depth — 2 hidden slides, **Rp15,000** | Hi-res card + PDF (~19k); compat later |
| Gate | Email + WhatsApp before result | Nothing |
| Credibility source | "Lagi dianalisis sama AI" | 2000-year-old system + real birth data |
| Payments | Mayar hosted checkout | Xendit QRIS |
| Operator | Solo — checkout redirects to `krisanti-debora.myr.id` / "Temu Pesona" | PT KATON |

### Their essay is their data source AND their fatal weakness

They have no deterministic input. Nothing about the user exists until the user types it. So the card
can only reflect the user's own words back with better typography — their own example answer is
*"saya tenang di tengah kekacauan"* → card reads **The Steady Anchor, JERNIH, TANGGUH**. Recognition is
guaranteed and completely hollow. The user knows they told it that.

**Katon's birthdate-only input is not just lower friction — it is a strictly better magic trick.**
"How did it know?" beats "yes, that's what I typed." Nine digits in, something true out, with nowhere
the user could have leaked it. **This is the wedge. Put it in the marketing copy, not just the
architecture.**

### What the essay buys them, and we should respect

By the time they ask for 15k the user has invested 12 answers, two essays, email and WhatsApp.
*Investment precedes wallet* — our own locked principle, executed harder than we're executing it.
Our answer is the post-read upsell (§2), not a front-loaded quiz.

### Steal

- The card layout and information architecture
- **"Often misunderstood as"** — the recognition hook. Names the gap between how you're seen and who
  you are. That's where the dopamine lives, and we don't have it.
- **Fictional comparison to an Indonesian character** (theirs: Vian, NKCTHI). Instant recognition at
  zero explanation cost; very hard for a foreign competitor to copy.
- **Absurd concrete specificity** — habitat, energy drink, survival kit, best platform. Screenshot bait.
- **Blindspot + a concrete micro-action** ("jeda 10 menit, cek rekening energi kamu")
- The blur-tease ("+2 slide lagi tersembunyi"), progress bar, "11 terjawab" social proof
- The promo-code field — they're running affiliate/influencer distribution. Plan for it.
- **Their microcopy register is exactly our target voice** — *"Bukan yang keliatan mulia. Yang beneran
  bikin kamu semangat bangun pagi."* Hand this to the helper as a reference sample.

### Don't steal

- The essay wall — birthdate-only is our edge
- Email/WhatsApp gate before the result
- **AI-forward framing.** Advertising the AI invites "so it just rephrased what I wrote." Our loading
  state says *"Menghitung bagan kelahiranmu."*
- A checkout branded as someone else's name — a real trust leak at a considered price point

### Gap it exposes in ours

They capture email + WhatsApp; **we capture nothing.** No retention asset, no re-engagement, no way to
tell users when compat ships. Fix: ask **after** the free mirror lands, optional, framed as "save your
reading." Keeps the no-account principle intact.

### Payments verdict

Mayar is a no-code Indonesian checkout (hosted invoice, QRIS/VA/e-wallet/Alfamart) — zero engineering,
which is why a solo operator could ship this. **Stick with Xendit:** the bank account is in hand, and
PT KATON on the checkout is a genuine trust advantage. Keep Mayar in the back pocket only as a stopgap
if KYC drags.

**Honest caveat on all of the above:** 511 "add yours" is one creator, one format-of-the-moment, and
those chains inflate on mutual-follow dynamics. It proves the format travels. It does not prove ours
will. We are also entering an **occupied format** — differentiation must be explicit and loud.

---

## 5. WHAT TO BUILD NEXT

1. **Fix `KATON-master-prompt.md`** — 3 contradictions with locked rules, listed in PROGRESS.md TODO #1.
   30 minutes, and everything downstream depends on it.
2. **Card content spec** — the slots, the coherence rule per slot, and which BaZi facts each slot may
   legitimately draw from. ~10 archetypes × ~8 short fields = **80 tiny cells**, not 78 prose modules.
   *Not yet written — this is the next real artifact.*
3. Calculator swap (Prompt A) → commit Phase 1 → regression lock (Prompt B)
4. Sharecard visual system + the paid hi-res card / PDF artifact
5. Ship to a small cohort. Measure **share rate** and **19k take rate**.
6. Start Xendit KYC now — external latency, background it.

**The two numbers that decide everything downstream:** share rate on the free card, and take rate on
the 19k object. Until those exist, compat pricing and the depth build are both guesses.
