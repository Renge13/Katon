<!--
STATUS: WORKING DOCUMENT for Reyner's Card A recomposition. Written by Cowork 2026-08-29.
NOT A SPEC. The spec is `card-polish-spec.md` §10 (the ruling) and §2 (the reasoning it starts from).
This file is the INPUT TO THE PASS: what the card is made of, what constrains each piece, and what
each piece has to survive. It carries NO positions on purpose - see WHY THERE ARE NO COORDINATES.
-->

# Card A — the 4:5 recomposition worksheet

## THE BUDGET

```
907 x 1267   ->   1080 x 1350
0.716        ->   0.800

+19.1% width      +6.6% height      +26.9% area
```

**The horizontal gain is 2.9x the vertical.** A reflow that spends the new room on vertical rhythm is
spending room that is not there. Measured by `npm run preview:cards` (`4bf3ca5`); the page recomputes
it from `CARD_A` and the target on every run rather than printing a literal.

**And more room is not the goal.** Use it where it improves hierarchy, whitespace, readability,
illustration/text balance and breathing room. **Do not enlarge everything because the space exists.**
The goal is a better composition, not maximum canvas occupancy.

---

## WHY THERE ARE NO COORDINATES IN THIS FILE

§2's banner rules that every export-pixel position anchored to the old frame is superseded and
**must not be scaled into the new one** - the 763px inner width, the `0.815` measure factor derived
from it, the measured headroom figures, the hairline `marginTop`s, the 86.4 margin. Listing them here
would invite exactly the proportional resize the ruling forbids.

**What survives is the type scale, the stack order, and the flex behaviour.** Those are below,
read from `components/cards/Card.js` rather than from the spec, because the spec describes deltas and
the code is what renders.

---

## THE STACK, in render order

From `CardA` (`components/cards/Card.js:1332`). Nine children, top to bottom:

| # | Element | Type role | Notes |
|---|---|---|---|
| 1 | **Headline** | `kicker` 30 · `headline` 139 · `nameId` 28 · `aspek` 46 | A leading "The" becomes a kicker above the noun. All ten archetypes carry the article since 2026-08-19 |
| 2 | **Hairline 1** | 3 export px at `alpha(ink, 0.16)` | after the Aspek |
| 3 | **Tags** | `tag` 25 | **three fixed trait words only** - Card A passes `showDynamic: false` |
| 4 | **Hook** | `hook` 39, line-height 1.52 | **carries `flex: 1`** - see below |
| 5 | **Hairline 2** | 3 export px | immediately above the badges |
| 6 | **Badges** | `badgeLabel` 30 (Card A), gap 14 | **not capped on Card A** - without meanings they are one short line each. No diamond |
| 7 | **Hairline 3** | 3 export px | above the footer |
| 8 | **Footer** | `footer` 24 | gender + birthdate left, `katon.app` right |
| — | **Watermark** | 0.80 of card width, `accent` at 0.18 / 0.14 | crops the corner, passes behind the headline |

**THE HOOK IS THE SLACK ABSORBER, and this is the single most important layout fact.** `Hook` carries
`flex: 1`, so every pixel of vertical slack lands there rather than as one dead block above the
footer - and hairline 2 rides down with it. Whatever you do vertically, **the hook is where the
height goes.** It is also the line people screenshot: §2.3 made it the second-largest thing on the
card deliberately.

**No seal on Card A.** `SCALE.seal` exists but the seal is Card B's foil element. Card A stays
cleaner and lighter - that is the ruled A/B split, not an omission to correct.

---

## WHAT THE COMPOSITION MUST SURVIVE

Measured from the live engine, 2026-08-29. **Design against these, not against Jati.**

| Stress | Worst case | Length |
|---|---|---|
| Headline, longest | **丁 Api Unggun** / *The Bonfire* | 10 |
| Headline, shortest | **甲 Jati** / *The Teak* | 4 |
| English pair, longest | **癸 Embun** / *The Morning Dew* | 15 |
| Aspek, longest | **Aspek Pengelola** | 15 |
| Fixed tag row, longest | **丙 Matahari**: Hangat / Bersemangat / Terbuka | 30 |

**癸 Embun is the hardest single chart** and it is worth naming why: it is the only one whose English
pair is three words, so it takes a kicker on top of an **already two-line headline**. §2.1 measured
that cost on the old frame - the headline grew 248.3 -> 323.9 export px and the `flex-grow` hook
absorbed all of it. On the new frame the extra width helps here more than anywhere else.

**Two variants that are not archetype-driven and are easy to forget:**

- **An hour-less chart has no fourth pillar.** The layout must not assume four.
- **A null-gender footer renders date only** - `buildFooter` emits no placeholder.

---

## THE ORDER OF THE PASS (ruled, §10)

1. **GEOMETRY** — 1080x1350, square, opaque, no mat, no rim, no shadow. Settled; nothing to decide.
2. **SURFACE** — the archetype gradient is retained. **Decide its precise role and intensity.** Its
   old job was separating the object from a canvas and there is no canvas; its new job is
   materiality and depth. Three stops stepping AWAY from the ink, deliberately shallow, because an
   earlier rule ran the field to near-black and swept one archetype's gradient through another's
   flat field. That constraint still binds whatever intensity you choose.
3. **COMPOSITION** — headline, illustration, hierarchy, whitespace, footer and `KATON.APP`, and
   the archetype-specific variations above. **NOT the seal: Card A has none, and the no-seal ruling
   is binding.** An earlier draft of this line said "seal placement" and was wrong; it is corrected
   here so it cannot become an implementation instruction by being read literally.

**Ship the composition as its own change** so all ten can be reviewed together in
`npm run preview:cards` before the export implementation lands.
