# Card polish spec — 1a (free) and 1e (paid)

**For:** Claude Code, working in `D:\claude-projects\katon`.
**Implements:** `Katon Cards.dc.html` → `components/cards/Card.js`.
**Written:** 2026-08-14. Design reference renders at **scale 0.36**; every number below is
**export pixels** (design px ÷ 0.36), which is the unit `Card.js` already works in.

Read this whole file before editing. §6 lists four things that **contradict rulings already in
the repo** — do not implement those silently, and do not "fix" them by moving a standard.

---

## 1. What is being changed, and what is not

**Ruled 2026-08-14 by Reyner: implement the design reference exactly.** All three open questions
in §6 were approved — the dimmed ink levels, Card B's rim and shadow, and the brass. §6 now
records each as a ruling plus the mechanism it needs; it is no longer a list of blockers.

The current `CardA` and `CardB` are the same object at two densities. Nothing separates them in
a feed except the aspect ratio, which the feed crops away. 1a sharpens A's typographic
hierarchy; 1e gives B a **finish** — a metallic rim, a specular sheen, brass on four specific
elements, and a foil seal — so "paid" is legible at 100px tall.

**Not reopened. Do not touch:**

- Geometry. `CARD_A` 1080×1440 canvas / 86.4 margin / 907×1267 object; `CARD_B` 1080×1920 /
  86.4 / 907×1747. Radius 40, padding 72, `boxSizing: 'border-box'` on both boxes. The design
  reference measures identically — 1a and 1e are drawn at exactly these numbers.
- The gradient system: `GRADIENT_STOPS`, `stepAway()`, flat canvas + gradient object.
- ~~`CARD_B_BADGE_LIMIT = 3`~~ — **superseded 2026-08-15: it is 2.** The §6.5 re-probe found three
  badges overflow the object by 63px on real copy (丁, three entries inside the 200 ceiling), and
  spacing recovered only 79 of the needed 138. Ruled: the badge count is the lever the budget is
  for, so it took the cut. `MAX_LABEL_MEANING = 200` holds, but only at a cap of two.
- Card A drops dynamic Aspek tags; Card B carries them. Card A has no `nameId`.
- 胎元 stays unrendered. Hanzi stays decorative. No palace on badge bullets.
- `CARD_TOKENS`. This spec adds **no** per-archetype colour. See §6.3 for the one global
  addition it does need.

---

## 2. Card A — 1a

> **PARTLY SUPERSEDED 2026-08-29 by `## 10. RULED 2026-08-29 — CARD A IS 1080x1350, AND THE CARD IS
> THE EXPORT` at the bottom of this file. READ THE SCOPE BEFORE DISCARDING ANYTHING HERE.**
>
> **SUPERSEDED: Card A's GEOMETRY and every EXPORT-PIXEL POSITION derived from it.** §10 replaces the
> 907x1267 object on a 1080x1440 canvas with a **1080x1350 card and no canvas**, and rules that the
> recomposition is **not a proportional scale**. So the numbers below that are anchored to the old
> frame do not carry over and must not be scaled into the new one: the **763px inner width** and the
> `0.815` factor derived from it (`763/936`), the measured headroom figures
> (`248.3 -> 323.9 export px`, "302.3px of headroom", "23px to spare"), the hairline `marginTop`
> values, the **86.4 margin** (which §10 makes **Card B's own number** rather than an inheritance),
> and the export-px conversions throughout. **Re-derive them from the design pass; do not recompute
> them from these.**
>
> **NOT SUPERSEDED, and this is most of the section's actual content:**
> - **The TYPE HIERARCHY REASONING of §2.1** — that a leading `"The"` becomes a kicker above the
>   headline, and *why* the 0.815 measure-derivation is walked back for a one-word headline. The
>   RATIO argument survives its numbers. **The "do not write the kicker rule as first word" warning
>   stands in full**, including its deliberate survival of its own premise, and `splitName`'s
>   article-less branch is still pinned by two unit cases.
> - **The TOKEN AND INK WORK** — §2.5, §2.6, §2.7's four ink levels, and the §6.1 exemption
>   mechanism they point at. Opacity is not geometry.
> - **§2.2's ruling that the hairlines are INSIDE the object** and are not the inset edge hairline
>   rejected on 2026-08-13. That rejection stands (§6.2); only the placement pixels move.
> - **EVERYTHING ABOUT CARD B**, in this section and every other. §10 touches Card A alone.
>
> §10 lists what the design pass must re-evaluate. This section is the reasoning it starts from, not
> a set of coordinates to preserve.

Six deltas to `CardA` and its helpers. Everything else stays.

### 2.1 Headline splits into kicker + noun

Today `Headline` does `String(data.nameEn).split(' ')` and renders every word as a line at
`SCALE.headline`. So "The Teak" is two 112px lines and the article gets the same weight as the
noun.

New rule: **a leading `"The"` becomes a kicker above the headline**, and the remaining words are
the headline.

```
kicker   30px / 700 / letter-spacing 5.6 / uppercase / margin-bottom 14
headline 139px / 800 / line-height 0.90 / letter-spacing -0.7 / uppercase
```

`SCALE.headline` goes **112 → 139**, and this needs its own comment because it walks back a
derivation. The 0.815 factor (`763/936`) exists because type had to come down with the *line
measure*. A one-word headline is not measure-constrained — "TEAK" at 139 occupies 63% of the
763px inner width, so it cannot wrap. Add `SCALE.kicker = 30` (the live card's eyebrow size).

**⚠ Do not write the kicker rule as "first word".** This warning stood on `癸` Embun being
`"Morning Dew"` while the other nine started with "The". **Reyner ruled that away on 2026-08-19:
Embun is `"The Morning Dew"`, and all ten now carry the article.** The warning survives its own
premise and is deliberately kept — the rule is about what the field MAY contain, not about what it
happens to contain today, and `splitName`'s article-less branch is still pinned by two unit cases in
`tests/card.spec.mjs`. Cost of the article, measured on the real layout the same day: 癸 gains a
kicker on top of an already two-line headline (248.3 -> 323.9 export px), the `flex-grow:1` hook
paragraph absorbs all 75.6px, and 302.3px of headroom remain.

```js
const words = String(data.nameEn || '').split(' ');
const hasArticle = words.length > 1 && words[0].toLowerCase() === 'the';
const kicker = hasArticle ? words[0] : null;
const headWords = hasArticle ? words.slice(1) : words;
// Multi-word headline is NOT measure-safe at 139. "MORNING" at 139 is ~740px
// against 763 of inner width — it fits, but with 23px to spare, so it must be
// asserted rather than assumed.
const headSize = headWords.length > 1 ? SCALE.headline * 0.80 : SCALE.headline;
```

Pin both branches in `tests/card.spec.mjs`: `甲` renders a kicker and a one-line headline, `癸`
renders no kicker and a two-line headline.

### 2.2 Three hairline rules

Full-width `1px`-design → **3 export px** rules at `alpha(token.ink, 0.16)`, placed:

1. after the Aspek (`marginTop: 47`),
2. after the hook, immediately above the badges,
3. above the footer (`marginTop: 42`).

These are **inside** the object, dividing content zones. They are not the inset hairline on the
object edge that was rejected on 2026-08-13 — that ruling is about how the object separates from
the canvas, and it stands (§6.2).

### 2.3 Hook grows

`SCALE.hook` **35 → 39**, `lineHeight` 1.45 → 1.52, `marginTop` 34 → 61. It keeps `flex: 1` and
`maxWidth: 700`. This is the line people screenshot; it was the third-largest thing on the card
and is now the second.

### 2.4 Tags and Aspek spacing

`Tags` `marginTop` 34 → **31**. Aspek `marginTop` 18 → **25**. Sizes unchanged — `SCALE.tag`
25, `SCALE.aspek` 46, letter-spacing 3.4, gap `14px 32px` all already match the reference.

### 2.5 Badges lose the ◆

`◆ ${b.label}` → `b.label`. The hairline above the block already delimits it, and the diamond
is the only non-typographic mark on Card A. `gap` 10 → **14**.

### 2.6 Watermark crops the corner

Card A only: `top: 90 → -128`, `right: -70 → -144`, size `0.83 → 0.80` of card width.

The **fill stays `accent`** at the ruled `0.18`/`0.14` — unchanged, and see §3.5: an earlier
draft of this spec lowered Card A to `0.115/0.09` and switched Card B to a darkened field, which
left the same glyph on the same archetype rendering *lighter* than the field on A and *darker* on
B. One rule, both cards.

**It still passes behind the headline** — measured in the reference, the glyph's strokes cross the
full height of the headline line and reach into the tag row. That is what a watermark does, and
the repo's ruled placement (`top: 90`) sits *deeper* behind the type than this one. The only
change here is the crop: pulling the glyph harder into the corner moves its densest region — the
crossbar junction — off-card. **If you want a watermark that genuinely clears the headline ink, it
has to come down to roughly 0.46 of card width**, which abandons the ruled 0.83 proportion and
stops reading as texture. Not recommended.

**The alpha does not move.** An earlier draft argued the drop to 0.115 was load-bearing for
headline legibility; §6.7 supersedes that. 0.18/0.14 shipped and the headline reads.

**Keep the yang/yin split.** The reference drew one value; the ruled behaviour is that polarity
reads through weight (`YANG` set → the stronger alpha). Preserve the two-value branch.

### 2.7 Ink levels — see §6.1 before implementing

Card A draws four ink levels, not one. Ruled 2026-08-14; the mechanism and its test are §6.1.

| role | opacity |
|---|---|
| `headline`, `hook` | 1 |
| `badgeLabel` | 0.82 |
| `aspek` | 0.75 |
| `footer` | 0.53 |
| `tagFixed` | 0.51 |
| `kicker` | 0.48 |
| hairlines (non-text) | 0.16 |

---

## 3. Card B — 1e

1e's content and geometry are **already what `CardB` renders** — pillar cells at gap 16 /
radius 22 / padding 24·8·22, stem 62, branch 38, label 20, meta 21, bars at height 9 / gap 10 /
label 19, footer 24. Verified against the reference: identical. So this is a **finish** layer
plus one new element, not a re-layout.

Card B keeps the boxed pillar cells (`PillarCells` as written). The ruled band from the Foil
exploration was **not** taken — boxes give the day pillar somewhere to carry the metallic.

### 3.1 The rim

A 2px inset ring on the object, gradient along 152°: bright at top-left, dark through the
middle, bright again at 62%, dark at the corner. This is what reads at thumbnail size.

**Do not implement with `mask-composite`.** See §4 — it does not survive the export path. Draw
it as an inline SVG overlay, last child of the object, `aria-hidden`:

```
<svg width=907 height=1747 style="position:absolute; inset:0; pointerEvents:none">
  <defs><linearGradient id="rim" gradientTransform="rotate(152 .5 .5)">
    stops: ink@0.72 / ink@0.07 34% / ink@0.44 62% / ink@0.05 100%
  </linearGradient></defs>
  <rect x=1 y=1 width=905 height=1745 rx=39 fill=none stroke=url(#rim) stroke-width=2/>
</svg>
```

The gradient id must be unique per card instance (`useId` or a stem-derived suffix) — two cards
in one document with the same id silently share the first gradient.

### 3.2 The sheen

One `aria-hidden` div, `inset: 0`, under the content, over the gradient:

```
linear-gradient(158deg,
  rgba(255,255,255,.15) 0%, rgba(255,255,255,.05) 26%,
  rgba(255,255,255,0) 46%, rgba(255,255,255,0) 100%)
```

White-alpha, not a token colour, so it works on all seven dark fields unchanged. Light fields
invert it — §5.

### 3.3 Brass, on exactly four things

```
BRASS_LIGHT (on dark fields)  #F5EDD6 → #C9A76A → #F2E6C4   (seal, 140°)
BRASS_TEXT  (on dark fields)  #D9BC85                        (solid — see §4)
BRASS_DARK  (on light fields) #6E5628 → #A98A4A → #5C4720
BRASS_TEXT_DARK               #6E5628
```

1. **`nameId`** ("JATI"), 28px / 700 / ls 5.6 / uppercase, with a hairline to its right fading
   from `brass@0.6` to transparent.
2. **Badge labels**, 29px / 640.
3. **The day-pillar cell**: background `rgba(233,214,166,.13)`, border `rgba(233,214,166,.55)`,
   plus `boxShadow: inset 0 0 33px rgba(233,214,166,.12)`.
4. **The Inti Diri pill**: brass gradient background, text `#3E2F14`, 16px / 700 / ls 3.3,
   padding 4·12.5. Day-pillar stem gets `textShadow: 0 0 39px rgba(242,230,196,.42)`.

Everything else stays `ink` per `TEXT_ROLES`. **Items 1, 2 and 4 carry text**, so they are new
`TEXT_ROLES` rows and `lib/card/domContrast.js` must measure them — §6.4.

### 3.4 The seal (new element)

Footer becomes two stacked lines (birthdate, then `katon.app`, gap 8) on the left, with a
**111px** brass disc on the right: `BRASS_LIGHT` at 140°, an inner 92px ring at
`rgba(60,44,20,.42)`, the Day Master stem centred at 47px in the serif face,
`boxShadow: 0 6px 22px rgba(0,0,0,.34)`.

The stem appears twice on the card now (watermark + seal). That is deliberate — the watermark is
texture, the seal is a mark — but both stay `aria-hidden`; no third hanzi may appear.

### 3.5 Watermark

**Corrected 2026-08-14 after review of the built cards. This supersedes the earlier
`darken(field, .45)` rule, which was wrong — see §6.7.**

The watermark fill is **`accent`**, at `0.18` for yang stems and `0.14` for yin, on **both**
cards. That is the repo's own 08-13 ruled value and it is the only fill that is hue-true by
construction: `accent` is defined as the field's hue at equal or lower chroma. Position and size
as before — `top: -105`, `right: -133`, 0.69 of card width.

The deboss is Card B's only, and it is **two hard ±2px offsets, no blur**:

```
textShadow: 0 2px 0 alpha(ink, 0.07), 0 -2px 0 rgba(0,0,0,0.10)
```

2 export px on a 907px-wide card is 0.2% of the width — a hint of relief. Anything larger, or any
blur radius at all, renders as a misregistered second copy of the glyph rather than as depth.

**Suppress the deboss on the three light fields — `inkIsDark(token) === true`** (己 Taman,
辛 Permata, 癸 Embun; the predicate is named for the *ink*, so it is true exactly where the field
is light). On a light field the dark half of the offset has no gradient to sink into and reads as
grime around the strokes. An earlier draft wrote this condition negated; the token names were
always the intent.

Yang/yin weight split preserved on both cards.

### 3.6 Ink levels

Same system as §2.7. Where a role exists on both cards it takes the **same** value — one role, one
opacity, no per-card drift.

| role | opacity |
|---|---|
| `headline`, `hook`, `pillarGanzhi` (stem) | 1 |
| `pillarGanzhi` (branch) | 0.80 |
| `aspek` | 0.75 |
| `pillarMeta` | 0.74 |
| `badgeMeaning` | 0.72 |
| `barLabel` | 0.58 |
| `footer` | 0.53 |
| `pillarLabel`, `pillarAnimal`, `tagFixed`, `tagDynamic` | 0.51 |
| `kicker` | 0.48 |

The **day-pillar cell lifts every one of its own rows** by roughly 0.1 — label 0.82 (brass),
branch 0.88, meta 0.90, animal 0.64 — which is how the cell reads as the emphasised one without a
second border weight. `nameId` and `badgeLabel` are brass, not ink, so they are outside this table.

---

## 4. Export fidelity — two hard constraints

The card renders through `react-dom/server` under plain node (`scripts/card-preview.mjs`) and
exports through **html-to-image**, which walks computed styles. Two things in the design
reference will not survive it, and both fail *silently* — the PNG just comes out wrong.

1. **`-webkit-mask-composite` / `mask-composite`.** Used in the reference for the rim. Replace
   with the SVG stroke in §3.1.
2. **`background-clip: text` gradient text.** Used in the reference for "JATI" and the badge
   labels. Replace with **solid** `BRASS_TEXT`. At 28-29px the metallic sweep across a short
   string is not perceptible anyway; the gradient stays where it is large — the seal and the rim.

Also: `borderRadius` on the object plus `overflow: hidden` is already relied on to clip the
watermark; the SVG rim sits inside that clip, so its `rx` is 39 (40 − half the 2px stroke), not
40. Off-by-one here shows as a hairline of canvas colour at the corners.

---

## 5. The light-field branch

Foil's whole vocabulary assumes a dark field: white sheen, near-white ink, pale brass, white-
alpha cell fills. **Three tokens are light fields with dark ink** — `己` Taman `#D0B87E`,
`辛` Permata `#EDEAE4`, `癸` Embun `#A9CFE0` — and on those the sheen is invisible, pale brass
drops to near-zero contrast, and the cell fills disappear.

Branch on the predicate that already exists — `inkIsDark(token)` — never on a stem list, so
approving or re-hexing a token cannot desync it:

| | dark field (7) | light field (3) |
|---|---|---|
| sheen | white-alpha, top-left | `rgba(255,255,255,.62)` highlight → `rgba(0,0,0,.07)` at the corner: reads as a lit edge with a shadow under it, not a wash |
| rim | `ink@0.72 → 0.05` | `rgba(255,255,255,.85)` alternating with `darken(field,.55)@0.30` |
| brass | `BRASS_LIGHT` / `BRASS_TEXT` | `BRASS_DARK` / `BRASS_TEXT_DARK` |
| seal ink | `#3E2F14` | `#F3EBD5` |
| cell fill | `ink@0.05`, border `ink@0.16` | `ink@0.07`, border `ink@0.22` |

Two global finishes, not ten. `Katon Cards.dc.html` §1f renders all ten with this branch applied.

---

## 6. Rulings — 2026-08-14

All three were put to Reyner with their visual consequences and **all three were approved**, with
the instruction to match the design reference exactly. What follows is each ruling and the
mechanism it needs. §6.4-6.6 are measurements and probes, not decisions, and still stand.

### 6.1 ✓ RULED — dimmed ink is allowed again, as an exemption with a pinned list

The reference draws hierarchy at **six ink levels** (§2.7, §3.6). `TEXT_ROLES` currently forbids
this, and forbids it from measurement: every role is ink at full opacity, Bambu's floor is 0.94,
and *"opacity is no longer available as a hierarchy tool here."* That note was correct about the
arithmetic and is now **superseded on the design question** — not on the arithmetic.

So do not delete that reasoning, and do not move `MIN_CONTRAST`. Implement it the way the repo
already handles its one other exemption:

- `TEXT_ROLES` carries the real `opacity` per row again, from the two tables above.
- Add `DIM_EXEMPT` — the roles the ruling exempts, as an explicit array beside `AA_EXEMPT`, with
  the same standing comment: **a report, not a permission**. It can only shrink. Nothing joins it
  without someone editing that line.
- Every role **not** in `DIM_EXEMPT` still asserts `MIN_CONTRAST` 4.5 at its stated opacity.
- `lib/card/domContrast.js` keeps measuring the rendered markup, and keeps *reporting* the
  exempt roles' real ratios rather than skipping them. The number stays visible.

Be aware of what is in that list, because it is not all articles: `tagFixed` and `tagDynamic` at
0.51 are **content words** — Teguh, Menaungi, Konsisten. If a legibility complaint ever arrives,
those are the rows to raise first, and the cheap fix is to return the tag rows to full ink while
leaving the kicker and footer dimmed — that keeps most of the hierarchy and costs one value.

### 6.2 ✓ RULED — Card B carries the rim and the drop shadow

The 2026-08-13 rejection of the inset hairline and drop shadow stands **for Card A**, which ships
with neither. Card B gets both: the SVG rim of §3.1 and `0 20px 44px rgba(0,0,0,.38)`.

Consistent with the original reasoning as well as the new ruling — that rejection was about a
border needing *a fourth colour token per archetype*, and the rim is the token's own ink at four
alphas. Update the `Canvas` comment to record both the ruling and this distinction, or the next
reader will read the 08-13 note as still absolute.

### 6.3 ✓ RULED — brass enters the system as a global finish

Two values, `BRASS_LIGHT` and `BRASS_DARK`, selected by `inkIsDark(token)`. **Never** per
archetype, and `CARD_TOKENS` is untouched — its field/ink/accent rule and the derivation behind it
are unaffected. Put brass in its own export in `lib/card/tokens.js` with a comment saying exactly
that, so a future reader cannot mistake it for a fourth token slot.

### 6.4 Brass on text must be measured, not assumed

`nameId`, badge labels and the Inti Diri pill carry brass **text**. Add them to `TEXT_ROLES` as
explicit rows and let `lib/card/domContrast.js` measure the rendered markup — do not reason
about it from the table.

Expected: on dark fields `BRASS_TEXT #D9BC85` should clear 4.5 comfortably; the Inti Diri pill
(`#3E2F14` on brass) is dark-on-light and should score well above it — **better** than the
`field`-on-`ink` pill it replaces. The light-field branch is the risk: `BRASS_TEXT_DARK #6E5628`
on `#EDEAE4` is fine, on `#D0B87E` (Taman) it is warm-on-warm and may not reach 4.5.

**Fallback if any brass text fails:** that role's brass retreats to ink at the §3.6 opacity and
brass stays on non-text — rim, seal, cell border, pill background. 1e still reads as the paid
card; the seal and rim are what carry it at thumbnail size. Report the failure, do not
silently substitute.

### 6.5 Re-probe Card B's content budget

`MAX_LABEL_MEANING = 200` was probed against a **one-line** footer. 1e's footer is two stacked
lines plus a 111px seal, which is taller. Re-run `npm run audit:card-budget -- --probe` at
3 badges × 200 characters before trusting the ceiling. If it has fallen, say so — all 8 bintang
entries currently sit at 109-186, so there may still be headroom, but the tripwire moves.

### 6.6 Two token findings, unrelated to the finish

Both predate 1e; recording them because the finish makes them visible.

**Accent-on-field.** `sharecard-tokens-measure.mjs` sets the bar as the locked set's own, not an
abstract WCAG target — correct, since accent is non-text. The five locked triples measure
3.31 / 3.43 / 3.45 / 5.40 / 5.69, so the floor is **3.31** (Matahari, exactly on it). Three
PROPOSED tokens fall under: **戊 Gunung 3.02, 癸 Embun 3.05, 己 Taman 3.26**. Derive that floor
from the `approved: true` rows rather than hardcoding it, so approving a token moves the bar.

**戊 Gunung is the weakest card in the set** and the only dark field failing on accent alone:
`#E3CFA8` on `#8F7040`, 3.02. A warm pale accent on warm mid ochre gives the metallic nothing to
sit against — its bars and seal nearly dissolve. It is also the sole `AA_EXEMPT` entry (ink 4.21;
`#896B3D` clears it at 4.53). Both are token decisions, not card decisions.

### 6.7 ⚠ Correction — the watermark fill (found in the built cards, 2026-08-14)

An earlier version of this spec specified `darken(field, .45) @ 0.26` for Card B's watermark.
**That was wrong and §3.5 replaces it.** Recording the reason, because it is a trap that applies
to any future "darker version of the token" rule:

Mixing a hex toward black in sRGB drops **chroma along with lightness**, so a 45% darkening does
not produce a deeper version of the token — it produces mud. Measured on the built cards:
`辛` Permata `#EDEAE4` → neutral grey with no hue left at all; `己` Taman `#D0B87E` → grey-brown;
`壬` Samudra `#0E3A5C` → desaturated slate. Only `丙` Matahari kept any identity, and it read as
a brown blot rather than as fire.

The repo already had the right answer and this spec walked away from it. `accent` is *defined* as
the field's own hue at equal or lower chroma — it cannot go grey. Use it, at the ruled alphas.

The same reasoning applies to the gradient: `stepAway()` steps toward white or black and is
correct **only** because `GRADIENT_STOPS` are 0 / 0.08 / 0.16 — shallow enough that chroma loss
is invisible. Do not reuse `stepAway` at a large amount anywhere.

---

### 6.8 ✓ RULED 2026-08-15 — 戊 Gunung’s field comes down to #4A3A1E

Every Gunung failure has one cause: **the field is not dark.** At `#8F7040` it is the lightest of
the seven dark fields by a wide margin, and all three of its defects follow from that — ink 4.21,
accent 3.02, brass text 2.52. Re-hexing the accent or exempting the ink treats them as three
problems. They are one.

Ruled: **field `#4A3A1E`**, ink and accent unchanged. Yang Earth is the mountain — mass and
stone — and the current value reads as dry soil, so this is closer to the archetype as well as to
the numbers. Measured:

| | now | proposed | floor |
|---|---|---|---|
| ink `#FAF4E9` on field | 4.21 | **10.02** | 4.5 |
| accent `#E3CFA8` on field | 3.02 | **7.18** | 3.31 |
| brass text `#D9BC85` on field | 2.52 | **6.00** | 4.5 |

Three consequences:

- `AA_EXEMPT` becomes **empty**. Keep the array and its comment — it is the mechanism, and it
  emptying is the outcome the mechanism was for.
- `brassTextFor` stops falling back on 戊, taking the §6.4 failures from five to four (Bambu,
  Matahari, Taman, Embun remain).
- Gunung stops being the accent-floor problem. **癸 Embun 3.05 and 己 Taman 3.26 still fall under
  3.31** — those are light fields and a different question; not addressed here.

Nothing else in `CARD_TOKENS` moves, and 戊 is `approved: false`, so no mockup pin breaks.

All figures above are `contrast()` output, re-measured by Code on 08-15 — not hand arithmetic. Two
of the hand-computed values this section originally carried were wrong (accent 7.19→7.18, old brass
2.50→2.52) and `tokens.js` now pins all three to `contrast()` so the comment cannot drift.

The hex is the design side’s pick, not a measured inevitability — any field dark enough clears all
three floors. `Katon Cards.dc.html` renders it in the ten-card gallery as of 2026-08-15; if it
reads wrong beside Api Unggun at thumbnail size, the value moves and the reasoning above does not.

**戊 stays `approved: false`.** This ruling fixes the card’s contrast, not the token’s approval —
that is still one of the five outstanding token decisions.

---

## 7. Export targets — two, not one

The capture currently takes the **canvas** node, so the downloaded file carries the 86.4px field
around the object. Ruled 2026-08-14: the download should stop at the card edge. That needs two
targets, because the field is not decoration — it is what makes the file feed-safe.

| | node captured | size | use |
|---|---|---|---|
| **Share** | canvas | A 1080×1440 (3:4), B 1080×1920 (9:16) | posting. Feed-native ratios, per the 08-03 ruling. Unchanged. |
| **Download** | card object | A 907×1267, B 907×1747 | keeping. Card only, no field. |

The card object alone is 63:88 ≈ 0.716, which is neither 3:4 nor 4:5 — so if the download
replaced the share export, every posted card would get letterboxed or auto-cropped by the
platform. Keep both.

Three things the card-only capture must handle:

1. **PNG with alpha, never JPEG.** The object has a 40px corner radius; cropping to its bounds
   means the four corners are transparent. A JPEG fills them with black or white triangles.
2. **Card B's drop shadow is drawn outside the object bounds and will be clipped.** Omit it from
   the download — `boxShadow: 'none'` on the capture clone. The rim is what makes it read as an
   object, and the shadow only ever existed to lift it off the canvas. Padding the capture to
   preserve the shadow would contradict "stop at the card edge."
3. **The rim survives, exactly.** It is an SVG stroke inset 1px with `rx: 39`, so it sits inside
   the crop. Assert the corner pixels are transparent and the edge pixels are rim, not field —
   an off-by-one here shows as a hairline of canvas colour along the border.

---

## 8. Tests to add or update in `tests/card.spec.mjs`

1. Object dimensions unchanged: A 907×1267 on 1080×1440, B 907×1747 on 1080×1920, uniform 86.4,
   asserted **in the rendered markup** (a computed-style read reports the content box).
2. Card A renders a kicker for `甲` and **no** kicker for `癸`; `癸`'s headline is two lines.
3. `TEXT_ROLES` opacities match §2.7 and §3.6 exactly, and the set of roles below opacity 1 is
   **identical** to `DIM_EXEMPT` — so a role can never be dimmed without being listed, and the
   list can only shrink (§6.1).
4. Every role **not** in `DIM_EXEMPT` clears `MIN_CONTRAST` at its stated opacity, over all ten
   tokens.
5. Every brass text role measured over all ten tokens via `domContrast.js`, both branches of
   `inkIsDark`.
6. The rim is an SVG stroke, and no rendered style contains `mask-composite` or
   `background-clip: text` (guards §4 — both fail silently in export).
7. Rim gradient ids are unique when two cards render in one document.
9. Watermark fill is `accent` at 0.18/0.14 on **both** cards, over all ten tokens — no
   `darken()` and no `stepAway()` in the watermark path (guards §6.7).
10. Card B's watermark deboss is suppressed when `!inkIsDark(token)`.
11. The download capture is the **object** node at 907×1267 / 907×1747, PNG with transparent
    corners and no `boxShadow`; the share capture is the **canvas** node at 1080×1440 /
    1080×1920 (§7).

## 9. Standing dependency — do not skip

`FONT` is `var(--font-archivo)`. **Nothing loads Archivo outside the preview script.** The
commit that wires either card into a route must add Archivo to `app/layout.js` as
`--font-archivo`, or the card silently renders in the system sans and no test catches it.

---

## 10. RULED 2026-08-29 — CARD A IS 1080x1350, AND THE CARD IS THE EXPORT

**Reyner, 2026-08-29. This section is the authority on Card A's geometry.** It re-rules the
2026-08-03 sizes FOR CARD A ONLY and supersedes §7's two-target rationale for Card A only.
**Card B is untouched: 1080x1920 canvas, 907x1747 object, rim, shadow, `padY`, the 7px budget and
the "tighten spacing, never trim prose, never change outer dimensions" rule all stand unchanged.**

### The decision

| | Before (ruled 2026-08-03) | After (ruled 2026-08-29) |
|---|---|---|
| Canvas | 1080x1440 (3:4) | **none** |
| Mat / margin | 86.4px uniform field | **none** |
| Card object | 907x1267 (63:88, 0.716) | **1080x1350 (4:5, 0.8)** |
| What is exported | canvas for share, object for download | **the card, one asset, both paths** |

**THIS IS NOT A RESIZE. It is a recomposition.** Card A is re-laid-out inside 1080x1350 using the
current card as the visual reference. Do not scale the existing composition proportionally, and do
not preserve 907x1267 geometry for historical consistency.

### The principle

**Card A is a shareable identity artifact, not a document screenshot.** Its distribution surfaces are
Instagram, Threads, Facebook groups and messaging. The canonical asset is therefore designed natively
for a social-feed format rather than composed on a taller canvas and then handed to a platform to
reframe.

**The card itself is the exported asset. No mat, no workaround, no dependence on cropping behaviour.**

**AMENDED 2026-08-29, SAME DAY, BECAUSE THE FIRST DRAFT OF THIS SECTION OVERSTATED THE CROP.** This
section originally argued that the current export depends on the receiving platform preserving it.
**Measured, `4bf3ca5`, panel 1 of the recomposition preview: it does not.** A 4:5 centre crop of the
1080x1440 canvas removes 45px from the top and bottom; the mat is 86.4px; **45 < 86.4, so the crop
never reaches the object.** The card survives a feed crop intact and it always has.

**What the crop destroys is the UNIFORMITY of the mat, which was the mat's entire justification.**
86.4 is not a taste value - `tests/card.spec.mjs:67` derives it as the only number satisfying the
3:4 canvas and the 63:88 object at once. After a feed crop it is 86.4 left and right against 41.4
top and bottom, **a 2.09:1 asymmetry**. So the posted card is not a clipped card; it is a card in a
frame that no longer means anything.

**This is a weaker claim than the one it replaces and a better argument for the re-rule.** The mat is
not protecting the object - it is failing to be uniform, at the exact moment anyone sees it. The
ruling is unchanged; only the reasoning is corrected, and it is corrected here rather than left to be
rediscovered by whoever next checks the arithmetic.

1080x1350 is larger in BOTH dimensions than the 907x1267 it replaces, so the recomposition gains
design area while losing the surrounding field.

### The A/B relationship

Card A and Card B **are allowed to have different outer dimensions**, and now do. Family resemblance
is carried by the DESIGN SYSTEM, not by shared geometry: typography, visual hierarchy, colour
language, illustration treatment, seal and brand elements (**as shared VOCABULARY - the seal itself
is Card B's and Card A carries none**), borders and corners, spacing character,
Katon branding. **Do not distort or constrain Card A to make it geometrically match Card B.**

The 86.4 margin was Card A's ruled value, and §2's own note records that Card B merely CARRIES it for
family resemblance. That inheritance direction now has to invert: **86.4 becomes Card B's own number**,
not "Card A's margin", and any test asserting `CARD_B.margin === CARD_A.margin` is asserting a
relationship that no longer exists.

### What the design pass must re-evaluate

Headline hierarchy and wrapping; illustration scale and placement; whitespace;
information density; footer and `KATON.APP` placement; the relationship between the visual focal point
and the text; overall balance within 4:5; and **how the composition reads at a glance in a feed.**
The result should feel intentional at 1080x1350, not like a crop of the previous card.

### THE FINAL DESIGN RULING — Reyner, 2026-08-29, later the same day

The three design inputs this re-rule forced are now RULED. **Do not re-open the ratio, the corners,
the gradient, the rim or the shadow.**

**Card A is:**

| | |
|---|---|
| Frame | **1080x1350, 4:5** |
| Bleed | **full-bleed** - no mat, no canvas, no surrounding field |
| Opacity | **fully opaque.** No transparent outer corners, anywhere |
| Corners | **square** |
| Rim | **none** |
| Shadow | **none** |
| Surface | **the archetype gradient is RETAINED**, with a new job |
| Card B | **completely untouched** |

**THE GRADIENT KEEPS ITS PLACE AND LOSES ITS OLD REASON.** The 2026-08-13 ruling (`Card.js:925`)
gave it the job of *separating the object from the canvas* - *"the two separate by surface rather
than by a drawn border, which needs no fourth colour token per archetype."* **There is no canvas, so
that job no longer exists.** The gradient stays because it now does a different one: **surface,
materiality, depth.** The design pass refines it to read as subtle material rather than as an object
floating on something. This is a re-statement of purpose, not a licence to re-derive the stops.

**AND CARD A DOES NOT GET A RIM, DELIBERATELY.** The 2026-08-13 objection to a Card A border was
COST - it needed a fourth colour token per archetype - and Card B's rim mechanism (the token's own
ink at four alphas) removes that objection, so a rim for Card A is now cheap and available. **It is
still refused**, and the reason is product rather than cost:

> **Card A = identity, shareability, the immediate artifact. Card B = premium, keepsake, richer
> physicality.** Card A stays visually cleaner and lighter than Card B. **Do not add a rim to Card A
> merely to make it feel more finished** - Card B's stronger physical-object treatment is part of
> what is being paid for, and spending it on the free card spends the differentiation.

**THE IMPLEMENTATION CONSEQUENCE, stated so prompt R does not rediscover it:** `exportCards.js`
point 1 - *"PNG WITH ALPHA, NEVER JPEG"* - exists because a 40px radius leaves four transparent
corners. **That rationale is now CARD B ONLY.** Card A is opaque and square, so its export carries no
transparency at all. PNG stays for pipeline consistency; the reason it was mandatory does not apply
to Card A any more, and the docblock must say which card it is talking about.

### THE DESIGN PASS RUNS IN THIS ORDER

1. **OUTER GEOMETRY** - 1080x1350, square opaque edges, no mat, no rim, no shadow.
2. **SURFACE** - retain the gradient concept; refine it to read as subtle materiality and depth
   rather than an object floating on a canvas.
3. **COMPOSITION** - reflow headline, illustration, information hierarchy, whitespace, footer and
   `KATON.APP`, and the overall focal point. **Do not mechanically stretch the old composition.**

**THE SEAL IS NOT IN THAT LIST, AND ITS ABSENCE IS RULED.** The foil seal is CARD B's, part of what
is paid for, exactly like the rim. Two drafts of this section and of `card-a-4x5-worksheet.md`
listed "seal placement" among the things to re-evaluate; **both were wrong and both are corrected**,
because a stale line in a worksheet is one careless read away from becoming a specification. Reyner,
2026-08-29: the no-seal ruling stays binding and Card B keeps its own seal treatment untouched.

The measured budget for step 3, from `npm run preview:cards` (`4bf3ca5`): **+19.1% width, +6.6%
height, +26.9% area, ratio 0.716 -> 0.800. The horizontal gain is 2.9x the vertical**, so a reflow
that spends the new room on vertical rhythm is spending room that is not there.

### THE IMPLEMENTATION SEQUENCE

```
#80 merge  ->  #81 after Reyner's copy approval  ->  Card A design pass
           ->  Card A implementation and export  ->  validation on the real social surfaces
           ->  September traffic
```

`docs/prompts/Q-demand-test.md` proceeds independently. **Meaningful acquisition traffic does not
start until the final Card A share asset works correctly.**

### Export behaviour

Once the recomposed card exists, the implementation exports the 1080x1350 card DIRECTLY:

- no mat, no surrounding field;
- no reliance on post-download cropping;
- **no second layout transformation between the designed card and the exported card.**

The downloaded and shared image must look exactly like the canonical composition. For Card A the two
export targets of §7 collapse into one output; Card B keeps both, unchanged.

### Sequence — and prompt P does not run first

1. Re-rule (this section).
2. Recompose Card A in the design tool.
3. Implement and export the final frame directly.
4. Validate on the real sharing surfaces.
5. Only then, the September traffic test.

**`docs/prompts/P-card-frame.md` must NOT be implemented against the old geometry.** Its commit 1
pointed Card A's button at a 907x1267 object; that object ceases to exist. P is superseded by this
section and its ruling is absorbed into it - the mat is gone, which is what P was for.

### Critical path

Katon uses the share card as part of its acquisition loop. **The card must work as a real social
asset before traffic is spent on the September experiment.** The instrumentation of
`docs/prompts/Q-demand-test.md` may proceed independently; the meaningful traffic test does not start
until Card A is in final form and the export is correct.

### Documentation drift, corrected without reopening anything

The deferred-register row saying gender should be "re-added to the funnel when the card ships" is
**stale**. The funnel already renders the input (`components/Funnel.jsx:400`) and it already reaches
the footer (`mergeFooter`, `components/Funnel.jsx:693`; `buildFooter`, `lib/card/cardData.js:47`).
Correct the row in the next documentation sweep. **The gender decision is not reopened.**
