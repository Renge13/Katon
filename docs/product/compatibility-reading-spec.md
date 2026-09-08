<!--
STATUS: header added 2026-08-01. The body is unchanged and was already in the repo — an earlier claim in
this session that it needed rescuing from the stale mirror was WRONG (see COWORK-BRIEF.md error 11).
What was genuinely fixed: `product/paid-product-map.md` had been pointing at the old mirror filename,
so this file looked absent when followed by reference.

RECONCILED 2026-08-02 (decision trail: the compat-flow review sheet, now in docs/archive/). Decisions
landed in this body: tease-first funnel (paywall between P0 and P1), P0 free tease = faces + ONE named
relational fact, comparison card shareable pre-payment, P6 Luck Pillar sync DESCOPED from v1,
P5 quadrants kept as a documented Katon ruling, no consent line for person B (P2 reframe copy carries
the ethics), account + email created at first compat checkout (mirror stays anon) [SUPERSEDED 2026-09-07 by
ruling C: email IDENTITY, no password-based account], price section
replaced by the launch-decisions pointer. Names corrected to the 08-02 locked set.
Voice sweep to the composed register still pending at authoring time.

THE SURFACE SHIPPED 2026-09-08 (X-b3), AND TWO OF THIS DOCUMENT'S DECISIONS ARE SUPERSEDED BY IT:

  - "tease-first funnel (paywall between P0 and P1)" and "P0 free tease = faces + ONE named
    relational fact" are DEAD. Superseded 2026-09-07 by the product model below and enforced in
    code on 2026-09-08: pre-payment is STATIC - product block, price, inclusions, the form - and a
    test enumerates the endpoints the page may call. Nothing computed about either person is shown
    before payment.
  - "comparison card shareable pre-payment" is DEAD twice over: there is no pre-payment computation
    to put on a card, and there is no compat card at all in v1. A card would put two people's
    archetypes on a shareable image and person B consented to nothing.

  What SHIPPED instead: /kompatibilitas (front-door card, static product page, two births, an
  email, QRIS) and /kompatibilitas/<id> (pending, then the report). Every reader-facing string is
  an unruled placeholder and a production build refuses until Reyner rules them. See
  PROGRESS.md's LIVE STATE Compatibility row for what a reader actually gets.

THE PRODUCT MODEL RULED 2026-09-07 (night), verbatim in docs/prompts/X-compat-2b1.md and in
PROGRESS.md's RULED 2026-09-07 (night). THREE RULINGS, and the first two change this document's
shape rather than its wording:

1. PERSON B GETS NOTHING. "Compatibility is a single product that Person A purchases using two
   people's birth data. The output is one Compatibility Reading about the relationship. Person B
   gets: no mirror, no individual reading, no link, no notification, no account, no information sent
   to them. Her birth data is used only as the second input to the compatibility calculation. Do not
   expose or create a user-facing B mirror flow."

2. COMPATIBILITY IS A FIRST-CLASS ENTRY POINT. "The Katon front door should have two clear product
   paths: Mirror - understand yourself. Compatibility - understand the dynamic between two people.
   A user who only wants Compatibility should not have to generate or pay for a Mirror reading
   first. The Compat pre-payment flow must not require an AI Mirror render. Give Compatibility its
   own route/entry point now. Do not create it as a secondary 'Upcoming' item under Mirror."

3. NO FREE COMPAT RESULT. "No free P0 reading, no named relation tease, and no Gemini render before
   payment. The pre-payment Compat flow should be deterministic/static and cheap. The AI
   compatibility report is generated only after successful payment. This supersedes the previous P0
   idea entirely."

SO P0 IS SUPERSEDED - see its own section below, which is struck rather than deleted because the
2026-08-02 decision trail explains what it was for. The only pre-payment computation is the
solar-term boundary check, run for BOTH people. P1-P5 and P7 stand; P6 stays descoped; P8 later.

RULING C APPLIED 2026-09-07 (Reyner, verbatim in docs/prompts/W-compat-1.md and PROGRESS.md's
RULED 2026-09-07): email-only identity, NOT a conventional account. The two places this file said
"account + email created at first compat checkout" now say "email identity created/associated" - the
08-02 reconciled line above is left as written, with its correction inline, because it is a record of
what was decided that day and ruling C changed it five weeks later. No password, no login, no
reset-password, no sessions; access is by secure link.
-->

# Katon — Paid Compatibility Reading (合婚) Spec

> The paid unlock. Grounded in the classical BaZi marriage-compatibility (合婚) workflow, which is a
> real structured sub-discipline — not invented. Same descending-hook journey as the free mirror,
> but every fact is now RELATIONAL (you + this specific person), and the payoffs escalate from
> "how you two meet" → "where the friction is" → "why the pull is real" → "what's coming for you two."
>
> Ethical spine (non-negotiable, and classically correct): a clash is NEVER a verdict. Every output
> is a MAP for navigating the relationship, not a judgment on it. Low score = friction COST, not
> failure. This is not us being soft — it is how master practitioners actually read 合婚.

---

## THE CLASSICAL WORKFLOW WE'RE FOLLOWING (so it's authentic, not vibes)

Standard professional sequence, consistent across sources:
1. Generate both complete charts (needs birth date; hour strongly recommended — even 1hr off can flip
   the Day Pillar and change everything).
2. Two Day Masters — do the core selves support / combine / clash?
3. **Spouse Palace comparison (THE centerpiece)** — do the two Day Branches combine (六合) or clash
   (六冲)? Does one person's chart clash/harm/punish the OTHER's Spouse Palace?
4. Element complementarity — does each supply what the other lacks ("rain on a drought")? Or do they
   pile into the same imbalance?
5. Ten Gods personality fit — complementary or colliding temperaments.
6. Luck Pillar sync — are they in-phase right now / when do stress or support windows hit?
7. Synthesis — strengths + friction points, framed as a navigable map.

One classical school weights it roughly: ~50% core stars + Spouse Palace, ~30% element compatibility,
~10% individual chart strength. Use as a guide for how much VISUAL WEIGHT each section gets, not a
literal score.

---

## THE PAID JOURNEY (descending hook, relational payoffs)

**THE ENTRY ASSUMPTION IS SUPERSEDED, 2026-09-07 (night), ruling 2.** It read: "user has read their
free mirror, hit 'how compatible are you with someone?', and entered the second person's birth
date". Compat is now a FIRST-CLASS ENTRY POINT - a user who only wants Compatibility does not have
to generate or pay for a Mirror reading first, and the pre-payment flow must not require an AI
Mirror render. A buyer may arrive from her mirror (the pair then carries `a_reading_id`) or straight
off the front door with no reading at all.

**AND THE PAYWALL NO LONGER SITS BETWEEN P0 AND P1, because there is no P0** (ruling 3). Payment
comes first; the whole report is behind it. **Email identity is created/associated at
first compat checkout; no password-based account is required** (ruling C, Reyner 2026-09-07): email
is collected at checkout, transactionally framed, the purchase and report are associated with it, and
access is provided through a secure link. No passwords, login, reset-password or sessions. The mirror
itself stays anonymous.

### ~~P0 — The pairing reveal (the FREE tease — decided 08-02, option c)~~ **SUPERSEDED 2026-09-07 (night)**

> **No free P0 reading, no named relation tease, and no Gemini render before payment. The
> pre-payment Compat flow should be deterministic/static and cheap. The AI compatibility report is
> generated only after successful payment. This supersedes the previous P0 idea entirely.**
> — Reyner, 2026-09-07

**WHAT REPLACES IT: nothing pre-payment except a boundary question.** The only computation before
payment is the solar-term check (`/api/season-check`), run for BOTH people, because a boundary
birth changes the chart and the buyer must answer it before paying for a reading of the wrong
chart. The pre-payment surface is a static product block - description, price, inclusions - and
that is X-b3's work.

**THE STRUCK TEXT IS KEPT because the 2026-08-02 decision trail explains what P0 was for**, and a
later session proposing a free tease should be able to see that it was tried, decided, and then
superseded rather than never considered:

~~Both cards, side by side. Two archetype faces at a glance, PLUS exactly ONE named relational fact
with zero explanation (e.g. the seat relation named, not read). The machine proves it sees
something relational; the explanation is what is behind the paywall. "[You, Embun] x [Her,
Permata]." The comparison card is itself shareable PRE-PAYMENT ("look how different we are") - it is
the compat product's own acquisition engine. No prose. This is the P0 dopamine hit, and the itch the
paywall converts.~~

**AND THE ACQUISITION ARGUMENT IS THE THING THAT WAS TRADED AWAY, not overlooked.** P0's whole case
was that the comparison card is compat's own acquisition engine. Ruling 3 gives that up in exchange
for no Gemini spend before payment and no free relational claim. If share-driven acquisition turns
out to matter more than the render cost, this is the paragraph to re-open - with a ruling, not a
revert.

### P1 — "How your two cores meet" (Day Master × Day Master)
One tight fact: do your Day Masters combine, support, or clash?
- Combine/support → "your core selves click without effort."
- Clash → "your cores push on each other — here's the axis of it."
Payoff type: RECOGNITION ("yeah, that's the dynamic").
1–2 sentences. Not a paragraph.

### P2 — THE SPOUSE PALACE (the centerpiece — give it the most weight)
The seat comparison. This is where "I clashed with rooster?!" lives and it's classically the single
most important beat. Three checks, each a distinct fact:
- **Your two Day Branches together**: combination (六合 = effortless pull), clash (六冲 = built-in
  tension/intensity), harm (害 = quiet erosion), or punishment (刑 = recurring friction).
- **Does her chart hit YOUR Spouse Palace?** (someone can disturb the seat of your closest bond)
- **Do you hit HERS?**
Payoff type: RELATIONAL SHOCK ("wait, WE clash?"). This is the beat that makes them screenshot and
makes them want to check the NEXT person.
CRITICAL framing: a Spouse-Palace clash is immediately reframed — "this is not a bad match. A clashed
seat means intensity and transformation, and many of the strongest long-term couples carry exactly
this. It means the relationship rewards conscious effort, not that it fails." (Classically accurate;
ethically required.)

### P3 — "What she gives you / what you give her" (element complementarity)
The feed/drain rule, now BETWEEN TWO PEOPLE. The most actionable, warmest section.
- Does she carry the element your chart is starved of? → "rain on a drought" — she supplies what you
  can't generate for yourself.
- Do you supply hers?
- Or do you both pile into the same imbalance? → "two floods; no one is the bank for the other"
  (reuse the same-element drain logic from the mirror, now cross-chart).
Payoff type: CONSEQUENTIAL + WARM ("so THAT's why I feel calmer/more drained around her").
This is the section that feels like love language translation. High emotional value.

### P4 — "How your temperaments actually fit" (Ten Gods personality read)
The psychological-matching layer. Are you complementary (her steadiness meets your intensity) or
colliding (both assertive, both need to lead)? Read from the dominant Ten Gods of each chart.
Payoff type: RECOGNITION, deeper ("this is literally our fights / our ease").
Keep it behaviorally concrete — name the actual dynamic, not the god's Chinese term.

### P5 — THE PULL: high affinity vs compatibility (KEPT 08-02 as a documented KATON RULING —
the inputs are classical, the 2x2 framework is ours; the quadrant assignment must be a written
deterministic rule before implementation, and we never claim classical authority for the framework)
The sophisticated centerpiece emotionally. Separate ATTRACTION from FIT:
- High affinity = the chart explains WHY you're magnetically drawn (the 'stories' fit).
- Compatibility = whether the day-to-day energetics actually support each other.
- The four quadrants: high pull + high fit (rare, easy) / high pull + low fit (the addictive-hard
  one) / low pull + high fit (the slow-burn/steady one) / low pull + low fit (little there).
Payoff type: REVELATION ("this explains every relationship I've ever had"). This is the beat people
quote to friends. It's also the ethical safety valve — you explain the pull to someone "wrong"
without ever saying leave.

### P6 — DESCOPED FROM V1 (decided 08-02). Luck Pillar sync + dated triggers.
Three stacked reasons: dated year windows skirt rule 25 however cuaca-framed; gender is optional so
the section silently vanishes for null-gender users (a paid beat that sometimes does not exist);
and the 13-chart fixture was collected male-only, so the luck-pillar layer is UNVALIDATED (rule 4).
Timing returns in the annual-reading product, validated properly with female-set fixtures.
The original design is kept below for that product:
The timing layer, relational.
- Are you both in supportive phases now, or is one in a hard season?
- Dated windows: "2027 stirs your Spouse Palace — a year that pressures OR deepens the bond,
  depending on how you both meet it."
Payoff type: ANTICIPATORY ("something's coming for US"). This is the return mechanic — it's why they
re-run the reading next year, and why the annual tier makes sense.
Weather-framing only. Never "you'll break up in 2027." Always "a season that asks X of you both."

### P7 — The map (synthesis, NOT a verdict)
Pull the whole thing into a navigable summary:
- Your 2–3 strengths as a pair (where you support each other).
- Your 2–3 friction points (named plainly, with the "this is workable" frame).
- The single most useful sentence: what this specific pairing ASKS of each of you.
NO overall pass/fail score as a headline. If a score is shown at all, it's labeled "friction cost,"
with copy: "this measures where effort concentrates, not whether it works." A dramatic single number
is the exact anti-pattern every serious source warns against.

### P8 — The loop out (next paid action)
"You've read [you × her]. Want to see [you × your mom]? [her × your mom]? Your whole household?"
- Compatibility is per-pair; family/3-way is composed of pairwise blocks + a role frame.
- This is the household-3x revenue signal made real (self + wife + child, and the relationships
  between all three).
- The itch created in P2 ("I should check the next person") gets its outlet here.

---

## WHAT'S FREE vs WHAT'S PAID (the line, now that we know the content)

FREE (the mirror — self only, full mechanism, given openly): DM, strength, elements, favorable
element, top Ten God, your OWN Spouse Palace tendency (the tease: "here's the kind of partner your
seat expects" — WITHOUT a second person to compare against).

The free Spouse-Palace tease is the itch: it tells you what your seat wants, which makes you desperate
to know if a SPECIFIC person matches it. That desire is the paywall.

PAID (RELATION — you + this specific person): everything P1–P8. The second chart is the unlock.
The value is unambiguous: a solo chart structurally CANNOT answer "are we compatible" — it needs the
second person. This is why it's honestly worth paying for; it's a categorically different question,
not the mirror extended.

---

## AUTHORING COST (the honest scope)

This is a MATRIX, and that's the hard part. Compatibility reads pairs, so naively it's 10×10 Day
Masters × states × relationship-types = explosion. Manage it the way the mechanics actually work:

- **P2/P6 (branch relations) are RULE-BASED, not authored per pair.** Clash/combine/harm/punishment
  are boolean checks on 12 branches — a fixed lookup table + ~6 authored outcome blocks each. Cheap.
- **P3 (element complementarity) is RULE-BASED.** Feed/drain between two element profiles = the
  existing favorable-element logic run cross-chart. A handful of authored outcome patterns
  (she-fills-you / you-fill-her / same-flood / neutral). Cheap.
- **P1/P4 (Day Master fit, Ten Gods fit) are the authored matrix.** But collapse it: read at the
  ELEMENT-RELATIONSHIP level (does her element feed/drain/control/mirror yours?), which is ~5
  relationship types, not 100 named pairs. Author ~5 dynamics, texture with the archetype names at
  runtime. This is the "low tens of cells" target from the existing compatibility spec.
- **P5 (affinity vs fit) is a RULE built on P1+P3** — attraction from combination/control presence,
  fit from element complementarity. Computed, then 4 authored quadrant blocks. Cheap and huge impact.
- **P7 synthesis** = template that assembles the above. Cheap.

Net: the expensive part is a ~5×5 element-relationship grid + branch outcome blocks + 4 affinity
quadrants, NOT a 100-cell pair matrix. Buildable. The archetype names are the runtime texture layer
over rule-based mechanics — same pattern as the free mirror.

---

## THE PRICE POINT — SUPERSEDED 08-02
~~99k against ~500k stated willingness-to-pay~~ — dead; no market evidence. The band is 25-45k,
TESTED, per launch-decisions.md and CLAUDE.md. Test mechanic decided 08-02: visible "harga
peluncuran" cohorts (list price fixed, launch discount varies), never silent simultaneous A/B —
screenshot culture makes silent price differences read as cheating. List/launch numbers are
tracked in launch-decisions.md, not here. The first paid pairing should slightly over-deliver to
justify the next purchase (the household loop is the real LTV — this part stands).
