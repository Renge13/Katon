# Katon MEMORY — v4 Session Addendum

> Append this block to MEMORY.md (or fold into "Locked decisions"). It records the design session
> that produced the element-state system, the revised reading structure, and the v4 card IA. These
> SUPERSEDE the corresponding v3 decisions. The engineering (secure Next.js migration, verified
> Xendit sandbox payment) is functionally complete and UNCHANGED by this session — this is content/
> structure design, not built yet.

## New locked decisions (this session)

1. **Element-STATE personalization (the big one).** Readings personalize at archetype × element-state,
   NOT archetype alone. Day-Master-only produces a stereotype that is wrong for most people (proof:
   founder is 丙/Matahari but Water-dominant = "Matahari di Balik Awan", inward strategist, NOT the
   warm default Matahari). Five states: Governed / Depleted / Amplified / Over-fueled / Balanced.
   All ~15–26% prevalence — write all five. Priority resolution picks ONE state for the card modifier.
   See `bazi-states-and-compatibility-v4`. THIS IS THE PRODUCT / THE MOAT. Non-negotiable.

2. **Feed/Drain rule = state-aware ("Option 2"):** what moves you toward balance feeds you; what
   worsens imbalance drains you. ONE rule drives both the card's "Yang Menenangkan/Melelahkan" zone and the
   paid "Ngisi/Nguras" — they must agree. Replaces v3's shio-based Harmonis/Konflik on the card
   (which was an incoherent different mechanic). Shio survives only as optional caption where aligned.

3. **Reading structure = river→ocean (internal metaphor, plain user-facing labels):**
   - Free "river": Siapa Kamu (self in motion) → Kenapa Begini (element balance as plain-language WHY,
     no characters) → Ke Mana Ini Bawa Kamu (consequence) → Bridge (domain-specific fork in her voice).
     Free DESCRIBES the pattern; WITHHOLDS the driver. River beats 1–3 are domain-independent.
   - Paid "ocean" (7 beats, emotional DIP not chasm): Yang Perlu Kamu Denger Dulu (strength/shield-down)
     → Gimana Ini Muncul (scenes) → Yang Sebenernya Kejadian (reframe, framed as reasonable adaptation)
     → Ngisi/Nguras (people filter + guidance) → Empat Pilarmu 八字 (proof, post-pay) → Cara Mutusinnya
     (decision rule) → what each answer means (landing, NOT a rhetorical question). Closer: "ini bukan
     ramalan... yang mutusin tetap kamu" + upsell loop.
   See `bazi-interpreter-v4-delta`.

4. **Paywall = locked accordion (titles + helper lines promising UNDERSTANDING/DIRECTION), not blurred
   content.** ONE CTA Rp 49.000 single domain at first paywall; bundle (~79–99k) is POST-reading upsell.

5. **Card IA v4:** headline = archetype + state modifier as one phrase (no dot, no tagline); dimensions
   = Surface→Turn paragraph (flatters, hints at more, Ache stays in paid reading); NEW Talenta zone
   (3 coherent behavioral talents from the outward/capability axis); feed/drain zone replaces shio;
   footer = katon.app only; watercolor full-bleed background. See `bazi-card-v4-delta`.

6. **Voice [UPDATED 2026-06-19, v5.2 → now polished BAKU, not casual]:** NO em-dashes (AI tell).
   Register is baku per interpreter §8 (casual "old friend" register retired; see MEMORY #4). Founder
   does final pass for natural Indonesian feel (AI tends to translate English nuance); AI owns
   structure, founder owns voice.

7. **Depth ceiling:** build Level 2 (archetype × state). Ten Gods (Level 3) only if Level 2 fails the
   cold-read test. Don't over-engineer depth before validating.

## Validation status (open)
- The element-state structure is validated on n=2 examples, BOTH AI-written (founder's Governed
  Matahari = confounded since AI knew him; a cold Depleted Pedang = clean and read coherently).
- CLEAN test still pending: cold read on the known 1961 Matahari (compute their actual state, read
  with no prior knowledge of the person). This determines if Level 2 is sufficient.
- Shareability test (strangers share unprompted) still BLOCKED on content — needs ~5–6 archetypes
  written for variation. Cannot run on 1 archetype (everyone gets Matahari).

## Sequencing decision (this session)
Do CONTENT-heavy work (write 3–4 full archetype-states to the v4 structure, in DOCS) BEFORE bringing
the structure to Code. Reason: structure is still settling; building a moving target is expensive.
Write until the shape stops changing, THEN hand Code one clean v4 spec to implement in one pass. The
app currently works end-to-end with the old structure; no urgency to rebuild. Content is the bottleneck.
