---
name: bazi-states-and-compatibility
version: 4 (NEW — created this session, did not exist in v3)
description: >
  The element-state personalization system and the feed/drain compatibility rule for Katon.
  This is the mechanical core that makes two people of the same Day Master archetype read
  DIFFERENTLY. Consult before computing any card modifier, any reading variant, or any
  "who feeds / who drains you" output (card OR paid reading). PURE BaZi, deterministic.
---

# Katon — Element States & Compatibility Rule (v4)

## Why this document exists

v3 keyed everything to the Day Master archetype alone (10 archetypes). That produces a
STEREOTYPE that is wrong for most people. Proof: a 丙/Matahari whose chart is dominant in Water
(the element that controls Fire) is NOT the warm, outward, people-pleasing "default Matahari" —
they are inward, governed, strategic ("Matahari di Balik Awan"). The founder's own chart is this
case and the generic Matahari reading did not fit him.

**Conclusion (locked): personalization MUST happen at the archetype × element-state level, not
the archetype level.** The element-state is what makes the reading true. This is non-negotiable;
it is the product.

---

## The Five Elements engine (reference)

Five elements: Kayu (Wood), Api (Fire), Bumi (Earth), Logam (Metal), Air (Water).

**Generating cycle (生 — feeds):** Kayu→Api→Bumi→Logam→Air→Kayu.
**Controlling cycle (克 — drains/controls):** Kayu→Bumi, Api→Logam, Bumi→Air, Logam→Kayu, Air→Api.

For any Day Master element D:
- **Feeds D (resource):** the element one step BACK in the generating cycle.
- **Drains D (controls D):** the element that controls D.
- **D feeds (output):** the next element in the generating cycle.
- **D controls (wealth/task):** the element D controls.
- **Same as D:** mirrors/competes.

A chart's element counts come from the 8 characters (4 stems + 4 branch hidden stems), weighted —
hence fractional counts (e.g. Kayu 0, Api 1.6, Air 2). BaZi does not require birth hour; hour adds
the hour pillar and can shift the balance (and thus the state).

---

## The Five States

Every chart resolves to ONE state, chosen by priority (below). States are defined RELATIVE to the
Day Master, by which relationship-category is dominant or missing.

1. **Governed** — dominant in the element that CONTROLS the Day Master. The self is governed,
   cooled, turned inward, pressured. (e.g. Water-dominant Fire = "Matahari di Balik Awan".)
2. **Depleted** — MISSING the element that FEEDS the Day Master. Runs on reserves, no fuel source.
3. **Amplified** — dominant in the Day Master's OWN element. The pure/extreme version of the archetype.
4. **Over-fueled** — dominant in the element that FEEDS the Day Master. Over-resourced, intense, can choke on its own fuel.
5. **Balanced** — no strong dominant or missing. The even, full version. The fallback floor.

### Estimated prevalence (Monte Carlo, approximate — verify against the real engine)
Balanced ~26%, Governed ~24%, Over-fueled ~19%, Depleted ~16%, Amplified ~15%.
**All five are common (each ~15–26%). None is a rare edge case. Write all five.** Skipping any
leaves >15% of users with a worse/fallback experience.

---

## Priority resolution (which state wins when a chart qualifies for several)

The card shows ONE modifier (a single shareable identity, never stacked suffixes). Walk the
priority list top-to-bottom; the first condition the chart meets becomes the state. Secondary
patterns may appear inside the READING text, never as the headline modifier.

Priority order (most-defining first):
1. **Governed** (controller-element dominant) — the strongest "story" a chart tells.
2. **Depleted** (resource-element missing) — a concrete, felt vulnerability.
3. **Amplified** (own-element dominant).
4. **Over-fueled** (resource-element dominant).
5. **Balanced** (fallback — always available floor).

**Tiebreak within a condition:** by magnitude (higher element count wins), then by chart-position
proximity to the Day Master (same pillar > adjacent > distant).

**Deterministic:** same birthdate (+ optional hour) → same state → same modifier, always. No AI at
runtime. The state SELECTS among pre-written variants; it does not generate.

### Thresholds (a tunable knob — calibrate against the real engine)
"Dominant" ≈ count well above the chart average (~1.6× avg used in simulation). "Missing" ≈ count
near zero (≤~0.15 after hidden-stem leftovers). These thresholds move the state splits; tune them
on real data, do not treat the simulation percentages as final.

---

## The Feed/Drain (Compatibility) Rule — Option 2, state-aware

This single rule drives BOTH:
- the **card's "Yang Menenangkan / Yang Melelahkan" zone** (free, teased), and
- the **paid reading's "Yang Ngisi / Yang Nguras" section** (deep, explained, with who-they-are guidance).

**They MUST agree.** One computation, two depths. If the card says "bikin tenang: Gunung" the paid
reading's "yang ngisi" must describe Gunung/Earth types — never contradict.

### The principle (classical 用神 / favorable-element logic, approximated to the state system)
NOT a fixed friend/enemy binary. The rule is:
**"What moves you toward balance FEEDS you (ngisi). What pushes you further from balance DRAINS you (nguras)."**
Which element does that depends on the STATE:

- **Depleted** (missing feeder) → the FEEDER element feeds you (you're starved of it). Base rule holds.
  Drain = the controller element.
- **Governed** (flooded with controller) → what feeds you is what RELIEVES the flood: the element
  that controls your controller, and/or your feeder (which absorbs the excess and fuels you). Drain =
  more of the controller.
- **Amplified** (flooded with own element) → what feeds you is the element that DRAINS your excess
  (your output or controller). Drain = more of your own element (echo chamber).
- **Over-fueled** (flooded with feeder) → less feeder; what helps burns off the excess. Drain = more feeder.
- **Balanced** → base rule: feeder feeds, controller drains. The gentle default.

### Base feed/drain table (by Day Master element — the Balanced/Depleted default)
| Day Master | FEEDS you (生) | DRAINS you (克) |
|---|---|---|
| Kayu (Wood) | Air → Samudra/Hujan | Logam → Pedang/Permata |
| Api (Fire) | Kayu → Oak/Bambu | Air → Samudra/Hujan |
| Bumi (Earth) | Api → Matahari/[Yin Fire] | Kayu → Oak/Bambu |
| Logam (Metal) | Bumi → Gunung/[Yin Earth] | Api → Matahari/[Yin Fire] |
| Air (Water) | Logam → Pedang/Permata | Bumi → Gunung/[Yin Earth] |

For non-Balanced/Depleted states, adjust per the state principle above (e.g. an Amplified Fire is
NOT fed by more Wood; it needs draining — Earth/output or Water/control).

### Presentation
- **On the card:** archetype names primary ("Gunung, Bumi"), labels are the fixed baku system string
  ("YANG MENENANGKAN" / "YANG MELELAHKAN" — no per-archetype metaphor variants, v5.2). Optional
  secondary shio-year caption ONLY where the branch/year math genuinely aligns with the element
  logic — never fake the alignment.
- **In the paid reading:** explain WHO they are and HOW to recognize them ("biasanya tipe Gunung
  atau Bumi, orang yang stabil dan sabar... itu Bumi yang kamu kurang"). This is the actionable
  guidance users pay for, and it taps the Indonesian/Chinese shio-matching cultural tradition.

### IMPORTANT — supersedes v3 "Harmony (合) / Clash (冲)"
v3's card used the Earthly-Branch 六合/六冲 (shio/zodiac-year) mechanic for "Harmonis/Konflik."
**This is REMOVED from the card.** Reason: it is a DIFFERENT mechanic (branch/year) from the rest of
the card (element-based), making the card incoherent top-to-bottom. The card's compatibility zone is
now the ELEMENT-based feed/drain above, coherent with the identity and talent zones and laddering
into the paid Ngisi/Nguras. Shio-year survives only as an optional secondary caption where it aligns.

---

## Depth ladder (how far personalization can go)
- **Level 1:** Day Master only (the v3 stereotype). Too coarse. Rejected.
- **Level 2 (BUILD THIS):** Archetype × element-state (the 5 states above). Bounded, writable,
  fixes the stereotype problem. ~50 variants.
- **Level 3 (LATER, only if validated insufficient):** full Ten Gods (十神) — reads every
  relationship, not just the dominant one. More accurate, exponentially more complex. Do NOT build
  until Level 2 is validated as insufficient via the cold-read test.
- (Time-bound 大运/流年 is a separate axis — future renewable tier, not personality depth.)

**Validation gate:** the clean test is a COLD read on a stranger (e.g. the known 1961 Matahari),
chart computed, no prior knowledge of the person. If Level 2 lands cold → sufficient for MVP. The
founder's own fit is SUGGESTIVE but confounded (we knew him while writing). Do not over-trust it.
