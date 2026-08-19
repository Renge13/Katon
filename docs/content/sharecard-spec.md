<!--
STATUS: SUPERSEDED FOR EVERYTHING BUILT — see the banner below. Created 2026-08-01, last
substantively written 2026-08-13.
Reyner decides the register and the visual system. This doc decides WHAT information appears and WHY.
-->

# ⚠ SUPERSEDED BY `docs/content/card-polish-spec.md` (authority as of 2026-08-15)

**If you are speccing, building or reviewing anything card-shaped, `card-polish-spec.md` wins.**
This file is the 2026-08-01 information architecture — WHAT appears and WHY — and the reasoning in
it is still good. Its PICTURES ARE NOT. Card A and Card B were built as 1a and 1e on 2026-08-14/15
and the built cards diverge from the sketch below in at least seven places.

**Why this banner exists at all.** On 2026-08-13 a session cost real time because the obvious
filename was the wrong file. One line at the top prevents that permanently, and it is cheaper than
reconciling two specs.

**The divergences, each with the command that found it** (verified 2026-08-17, working tree at
`21d690a`):

| This file says | The built card does | Check |
|---|---|---|
| Card A headline is `MATAHARI` over `Sang Pengelola` (§3, and the sketch) | Card A prints **`name_en` alone**, split into a kicker and a noun (`THE` / `SUN`), with the Aspek beneath. The Indonesian name is **Card B only** | `components/cards/Card.js#CardA` passes no `showNameId`; `#Headline` gates `nameId` on it |
| The Card A sketch shows **six** tag words | **Three fixed**, no dynamic tags. This file's own §2 amendment (2026-08-13) says so — the sketch was never updated to match it | `CardA` passes `showDynamic: false` |
| Badges render as `◆ Bunga Persik` (the sketch, and the §1 amendment) | **No diamond.** The hairline above the block delimits it instead | `card-polish-spec.md` §2.5; `grep -n "◆" components/cards/Card.js` returns nothing |
| Card B carries **all badges** including the common ones | **Two.** `CARD_B_BADGE_LIMIT = 2`, ruled 2026-08-15 after three overflowed the object by 63 export px and were silently clipped | `grep -n CARD_B_BADGE_LIMIT components/cards/Card.js` |
| Card B carries 胎元 | **Not rendered**, ruled 2026-08-13. The engine still computes it and the reading still shows it; the card drops it | `components/cards/Card.js:1107`, `lib/card/cardData.js:176` |
| Card B has **no URL watermark** | The footer carries **`katon.app`**, stacked above the seal | `lib/card/cardData.js#buildFooter` returns `right: 'katon.app'`; `#FoilFooter` renders it |
| Bintang badges average **2.5** per person (§WHAT'S NEW) | **2.15**, range 1-4. Re-measured 2026-08-02 when 華蓋 left the set | `PROGRESS.md` MEASUREMENTS, "Badge frequency (avg per chart)" |

**What in here is still authoritative:** the four 2026-08-01 decisions and their 08-13 amendments —
Bintang Penolong is kept but never headlined, the tag hybrid is Card B only, the headline carries two
axes, and Card B exists to be a visible badge of purchase. Those are rulings. The layout sketch is
not, and it is the only part that has gone wrong.

---

# Sharecard — information architecture

## THE ONE JOB

**The card is the acquisition engine, not the reading.** Its only job is to make someone screenshot it
and post it. Everything else is the reading's job.

The proof point is imajidiri: their post pulled 511 "add yours" on **archetype name plus six tags**.
No mechanism, no percentages, no explanation. Anything the card carries beyond that has to earn its
space against the risk of diluting the two things that actually travel.

## WHAT'S NEW SINCE THE LEGACY CARD

The legacy card had archetype, element bars and a feed/drain column. Three things exist now that
didn't:

| New | Why it matters on a card |
|---|---|
| **Bintang badges** | Scarcity and comparison. Measured across 13 charts: **avg 2.5 per person, range 1-4, none universal.** That is the ideal distribution - everyone gets something, nobody gets everything, "which do you have?" is a real question. |
| **Sepuluh Aspek** | Real tags with real meaning, replacing the old state-modifier words. |
| **Strength engine** | Favorable element is now trustworthy, so feed/drain can be stated as fact. |

**The badge layer is the single biggest upgrade** and it should be prominent. It is the only element
on the card that creates comparison between two people, which is what makes a card spread.

Note **Bintang Penolong appears in 77% of charts.** DECIDED: keep it, never headline it, always render
it with its palace. See the decisions section below.

## TWO CARDS, NOT ONE

This maps exactly onto the revenue model and stops the two jobs fighting each other.

### CARD A — the free shareable. Optimised for travel.

```
  ┌──────────────────────────┐
  │  [watercolour, per        │
  │   archetype]              │
  │                           │
  │  MATAHARI                 │   1. TWO-AXIS HEADLINE. Day Master drives the visual.
  │  Sang Pengelola           │      The Aspek replaces the old weather-modifier. 100 states.
  │                           │
  │  TEKUN  TEGAS  HANGAT     │   2. TAGS - 3 fixed per archetype + 3 dynamic from the chart
  │  TELITI  MANDIRI  RAPI    │
  │                           │
  │  "Orang mengira kamu      │   3. THE HOOK - one line, "often misunderstood as"
  │   tidak butuh bantuan."   │      This is the recognition moment. imajidiri proved it.
  │                           │
  │  ◆ Bunga Persik           │   4. BADGES - 1 to 4. The comparison driver.
  │  ◆ Tanda Kekosongan       │      Indonesian name only. No English bracket, no room for beat 3.
  │                           │
  │  13 Sep 1989 · katon.app  │   5. FOOTER - provenance and the address
  └──────────────────────────┘
```

**What is deliberately NOT on Card A:**
- **The strength verdict.** Rule 21: "lemah" is permitted only when the explanation lands in the same
  breath, and a card has no room for beat 3. A bare "Api Lemah" on a shareable image is an insult
  with a citation.
- **Percentages or numbers of any kind.** They invite comparison of the wrong thing.
- **The eight characters.** They are the legitimacy object, but legitimacy is the reading's job. On a
  card they are visual noise to everyone who cannot read them.

  **CLARIFIED 2026-08-13 (Reyner), because this line and the watermark look like a contradiction and
  are not.** The ban is on **the grid as CONTENT** — eight characters a reader is asked to decode —
  **not on a single stem as TEXTURE.** Card A carries one translucent Day Master stem as a watermark
  behind the headline, the live product's own treatment, and that is the whole of hanzi on the free
  card. CLAUDE.md rule 23 draws the same line: hanzi you can point at is fine, hanzi you must read is
  not, and nobody reads a watermark. **The four pillar characters STAY on Card B**, unchanged — they
  are the cross-checkable legitimacy object and were never what this bullet was about.

  **The pictogram glyph set is DROPPED** (the per-archetype marks sketched in
  `sharecard-tokens-proposal.html`). It repeated what the headline already said, and a drawn mark is
  invention where the stem is data the engine computed. Do not commission or re-derive them.
- **Prose.** One hook line, nothing else.

### CARD B — the paid hi-res artifact (~19k). Optimised for keeping.

Everything on Card A, plus the appendix that makes it feel like a document rather than a graphic:

- **The chart** - eight characters in a 4x2 grid, each paired with its Indonesian animal and element,
  so it is readable rather than decorative. This is the cross-checkable legitimacy object.
- **Element bars** - visual, no numbers.
- **All badges** including the common ones, with a one-line meaning each.
- **The four palaces** labelled, plus 胎元 (Istana Konsepsi). **NOT 命宮** - see D1b, its convention is unresolved.
- Print resolution, no URL watermark, dated.

**Card A must be genuinely good at share quality.** Do not degrade the free card to drive the 19k.
That prices your own viral loop.

**Card B's difference must be visible at thumbnail size in a feed.** Print resolution is invisible on
Instagram. See decision 4 below - it is a badge of purchase, and a badge nobody can see is not a badge.

## FIELD SOURCES — every element traced to engine output

| Card element | Source | Needs strength engine? |
|---|---|---|
| Archetype name + element | Day Master stem | No |
| Watercolour | Day Master (1 of 10) | No |
| Tags | 3 fixed per archetype + 3 from the chart's Aspek/badges | No |
| Hook line | `glossary.json` -> `salah_dikira`, keyed by DM stem. **Used VERBATIM on the card** | No |
| Badges | Bintang catalogue, anchor formulas | No |
| Chart grid (Card B) | Four pillars + `shio` glossary | No |
| Element bars (Card B) | Element presence, display only | No |
| Feed/drain (Card B, optional) | Favorable element | **Yes** |

**Almost the entire card is engine-free.** Only the optional feed/drain line needs the strength work.
Card A could be built today.

## DECIDED 2026-08-01 — all four open questions

### 1. Bintang Penolong (77%) — KEEP, but never as a headline, and always with its palace

It is common; the fact is not. Measured across 13 charts:

```
Pilar Kerja        4      help arrives through work
Pilar Arah         3      through what you are building
Pilar Akar         3      through family and origin
Fondasi Pasangan   1      through the person closest to you
2+ Penolong:       1 chart
on a VOID branch:  2 charts
```

Roughly **12 to 16 distinct states**, not one platitude. Chart 1 has it in Pilar Kerja AND on a void
branch, which reads as "help exists through your work and it does not stick" — nothing like chart 12's
Fondasi Pasangan placement.

Two rules:
- **Never headline it.** It scores low on the hierarchy axes by construction: 77% is not extremity, and
  a single position is not convergence. It is a clause folded into a neighbouring block, or it is cut.
- **Always render it with its palace, and say so when it is void.** Never "bantuan akan datang". Always
  "bantuan datang lewat pekerjaan".

  **SCOPED 2026-08-13 (Reyner): the palace rule is about PROSE, and the card bullets drop it.** Read
  the rule's own examples and they are sentences — "bantuan datang lewat pekerjaan" is a clause in a
  reading, where a bare "help arrives" is the platitude the rule exists to prevent. A card bullet is
  not making that claim. It now reads `◆ Penyendiri`, not `◆ Penyendiri Pilar Akar`: the reading
  carries provenance, the card does not need it, and the line space is scarce. **The prose rule is
  unchanged.**

### 2. Tags — HYBRID. 3 fixed per archetype + 3 dynamic from the chart.

Fixed-only gives the card **10 possible states**, which is a zodiac sign — with birthdate-only input a
user will notice their card is identical to a stranger's within a week. Dynamic-only blurs the
archetype and is combinatorially hard to QA.

Three fixed tags anchor the archetype so every Matahari card has family resemblance. Three drawn from
the actual Aspek and badges so no two are identical. **30 fixed strings total.**

**AMENDED 2026-08-13 (Reyner): the hybrid is CARD B ONLY. Card A carries the three fixed trait words
and no dynamic tags at all.** "Aspek Pengatur" is system vocabulary — it means nothing to someone
meeting Katon in a feed, and **Card A has no comprehension budget to teach it.** Card B is a document
its owner has paid for and read a reading beside, so the vocabulary has somewhere to land.

The differentiation argument above still holds and is still measured: `npm run measure:card-tags`
gives 13 of 13 distinct dynamic triples across the fixture. It now applies to Card B. Card A's
differentiation comes from the archetype, the Aspek headline, the hook line and the badges, which is
already more than the ten states the fixed-only option was rejected for.

Two problems dissolved for free. The tag row no longer mixes one-word traits with two-word system
labels in one style, so the restyle that needed never has to happen. And a Bintang could previously
appear twice on Card A, dimmed in the tag row and again as a badge bullet; on Card A there is now no
tag row to collide with. The dedupe in `lib/card/cardData.js#dynamicTags` still matters for Card B.

### 3. Headline — TWO AXES. Day Master stays, the weather-modifier is replaced by the Aspek.

```
MATAHARI          <- element identity. drives the visual. 10 states.
Sang Pengelola    <- the Aspek. drives the behavioural read. 10 states.
```

**Day Master stays the headline.** It is classically the self (日主), and it is the only axis that maps
to visuals — "Pengelola" has no colour, no image, no watercolour. Drop the element and the ten
illustrations lose their basis. Rule 24 is intact: the archetype is still one per Day Master, and the
Aspek is a second axis rather than a replacement.

**The weather-modifier is the thing being removed.** "Matahari di balik awan" forces every downstream
sentence into the same metaphor, and metaphor does not survive repetition. Putting the Aspek in that
slot fixes it **structurally**: the element metaphor appears once, at the top, and the reading's spine
is stewardship — a completely different vocabulary. The fire imagery has nowhere to propagate to
because the body is not about fire.

**100 combinations, and neither line carries the whole burden.**

### 4. Card B exists to be a visible badge of purchase

Reyner's framing, and it is stronger than the original "better material" rationale: a visibly different
card version is **social proof of having bought**. Sharing it signals "I paid", which is aspirational,
and non-payers see a card they cannot produce.

**Hard constraint that follows: the difference must be visible at thumbnail size in a feed.** Print
resolution is invisible on Instagram. It needs a different colour treatment, an extra panel, or a
visible mark — something that reads as "other version" while scrolling. A difference nobody can see is
the same as no difference.

**And Card A must still be genuinely good at share quality.** If the free card is degraded to sell
Card B, there is no top of funnel for Card B to be aspirational to.

### `misunderstood_as` — WRITTEN, awaiting register review

Ten lines, keyed by Day Master stem, in `glossary.json` under `salah_dikira`. Keyed by DM because the
element is what people perceive first; role-level misperception is already carried by the Aspek
`cost_seed` strings (Pendamping: *"Orang mengira kamu tidak membutuhkannya"* is already exactly this).

## WHAT THIS SUPERSEDES

`content/bazi-card-skill-v4.md` predates the Aspek/Bintang layer, the strength engine and the pivot.
Read it for the visual system if useful; do not take its information architecture.
