<!--
STATUS: RELEASED. Section 0 fully ruled by Reyner 2026-08-31. Written by Cowork 2026-08-31
from the APPROVED COMPOSITION (Reyner, 2026-08-31). Authority for the design is
`docs/content/card-polish-spec.md` §10 and `docs/content/card-a-4x5-worksheet.md`. This file is HOW,
never WHETHER.

COMMIT THIS FILE FIRST, ALONE, ON main, BEFORE COMMIT 1. Cowork's writes to the working tree are not
durable - two have been destroyed by a branch operation, one of them a ruling record.
-->

# Prompt R — Card A 1080x1350, recomposition and export

## THE APPROVED COMPOSITION — Reyner, 2026-08-31

| Input | Decision |
|---|---|
| **DEPTH** | **1.0x. `GRADIENT_STOPS` unchanged at `[0, 0.08, 0.16]`** (`components/cards/Card.js:490`) |
| **PAD** | **100% of the recovered width to MEASURE, 0% to added side padding.** `PADDING` stays 72 |
| **Illustration** | **Intentional bleed.** Watermark stays `0.80` of card width and crops at the true edge |
| **Hour-less chart** | Must render with no fourth pillar, no reserved space |
| **Null-gender footer** | Must render date only, no placeholder |

**DEPTH IS A NO-OP IN CODE AND THAT IS THE CORRECT OUTCOME.** The ruling closes the question; it does
not change a constant. Do not "apply" it. `tests/card.spec.mjs:440` and the `stepAway`/`darken`
exclusion at `:928-933` stay green untouched.

---

## 0. BOTH INPUTS RULED — Reyner, 2026-08-31

### 0a. RULED — the word-count reduction is replaced by a real-fit gate

> **Replace the word-count `x 0.80` branch with a real-fit gate. Embun remains at 139 on the new
> 936px measure unless the rendered text actually fails to fit.** — Reyner, 2026-08-31

`Card.js:1054` today: `const headSize = head.length > 1 ? sc.headline * 0.80 : sc.headline;`

Its docblock (`Card.js:1038-1041`) records why it exists: *"`MORNING` measures about 740px against 763
of inner width. It fits, with 23px to spare, which is close enough that it must be asserted rather
than assumed."* **It is a fit workaround with 23px of margin, and PAD removes the reason for it.**

```
PADDING = 72 (Card.js:90), held absolute by the PAD ruling
old inner measure   907 - 144 = 763    "MORNING" ~740   ->  23px spare
new inner measure  1080 - 144 = 936    "MORNING" ~740   -> 196px spare
```

**THE CONSTRAINT IS THE LONGEST SINGLE WORD, NOT THE HEAD.** `splitName` lifts a leading article into
the kicker and the remaining head WRAPS, so a two-word head never has to fit on one line. Only its
longest word does. That is why the docblock measures `MORNING` alone and not `MORNING DEW`.

**This makes the gate a static fact about ten strings, not a runtime measurement.** Rule 24 fixes the
set at exactly ten archetypes, one per Day Master stem, and the names are data
(`glossary.json` -> `arketipe.name_en`). Every single-word head already renders at full 139 against
**763** today and ships, so at 936 every one of them fits by construction. The only open case was the
one multi-word head, and 740 < 936 settles it.

**Implement it as a measured fit, resolved once over all ten, and pinned** - in
`npm run preview:cards` or the card-budget harness, not as a metrics call during render. Card.js
renders to markup that is captured later; there is no measurement pass at render time, and inventing
one to answer a question about ten fixed strings is the expensive way round. The branch **stays in the
code** for a future name that genuinely overflows; it simply stops firing on word count.

**`tests/card.spec.mjs:650` asserts the opposite of the ruling and must be rewritten:**

> *"exactly one archetype has a multi-word head, and it is the one that reduces to 0.80"*

Under the gate, that archetype has a multi-word head and **does not reduce**. Rewrite it to assert the
FIT rather than the word count, and **show it red on the pre-change build first** - a test rewritten in
the same commit as the behaviour it covers is the 2026-08-26 failure this repo has a rule about.

### 0b. RULED — watermark size approved, placement re-derived

> **Retain the watermark at 0.80 of card width -> 864px on the 1080px frame. The size is approved;
> re-derive only its top/right placement during composition.** — Reyner, 2026-08-31

`Card.js:747` sizes the glyph as `spec.card.w * 0.80`, proportional to width, so it follows the frame
with no edit: `907 x 0.80 = 725.6` -> `1080 x 0.80 = 864`. **Change nothing about the size.**

The offsets are superseded and are NOT inherited. `card-polish-spec.md:145` gives Card A
`top: 90 -> -128`, `right: -70 -> -144`; those are old-frame export pixels and the worksheet's §2
banner forbids scaling them into the new frame. `tests/card.spec.mjs:1094-1108` pins only the ANCHOR
(a `top:` and a `right:`, never `bottom:` or `left:`), so the anchor survives and the numbers do not.

Re-derive them in commit 2 against the spec's own frame-independent constraint
(`card-polish-spec.md:153`):

> the glyph's strokes cross the full height of the headline line and reach into the tag row, and its
> densest region - the crossbar junction - sits off-card.

**Do not use 0.46.** `card-polish-spec.md:157` prices it as the size at which the glyph clears the
headline ink and stops reading as texture, and names it Not recommended. The ruling is bleed, not
clearance.

## COMMIT 1 — geometry and the tests that encode the old frame

**Gate change discipline: this commit lands alone.** It changes what the card IS, and every failure
below must be shown red before the change and green after.

`CARD_A` loses its canvas and its margin. Card A is the export.

```js
// components/cards/Card.js:84
export const CARD_A = { canvas: { w: 1080, h: 1440 }, margin: 86.4, card: { w: 907, h: 1267 } };
//                  -> { card: { w: 1080, h: 1350 } }
```

**Find every consumer of `CARD_A.canvas` and `CARD_A.margin` before editing the constant.** They are
what break, and a grep is cheaper than a runtime surprise.

`CARD_B` is untouched in value and must stop DERIVING from Card A. `86.4` becomes Card B's own
literal, per §10: *"that inheritance direction now has to invert."*

### The assertions that must die, and they are more than the two named in the plan

| Line | What it asserts | Why it goes |
|---|---|---|
| `tests/card.spec.mjs:67-79` | Card A is a 63:88 object on a 3:4 canvas at one uniform margin; re-derives `m` and asserts `CARD_A.margin === m` and `1080 - 2m === CARD_A.card.w` | there is no canvas and no margin |
| `:102-105` | **`assert.notEqual(CARD_A.canvas.h, 1350)`** — written on 2026-08-03 to block exactly this reversal | it is now the ruling |
| `:114` | `CARD_B.margin === CARD_A.margin` | the inheritance inverts |
| `:603-607` | the margin the geometry implies is uniform on **both** | Card A has none |
| `:627-628` | `margin-bottom:14px` kicker gap, `margin-top:25px` Aspek gap | old-frame hairline values, superseded by the §2 banner; re-baseline in commit 2, not here |

`:102`'s comment says it exists *"so a session that finds 4:5 in an older doc sees the reversal fail a
test."* **Replace it with its mirror** - an assertion that Card A IS 1080x1350 and carries no canvas
and no margin - so the guard keeps working in the new direction instead of being deleted.

### The Card B pixel-identity gate

**Show it failing first.** Deliberately perturb one Card B value, watch the gate report non-zero
differing pixels, revert, watch it report **0**. A gate that has never been red is not a gate - this
repo's worked example is the 2026-08-26 commit that merged a floor fix's comments and not its code
behind an assertion that accepted both shapes.

---

## COMMIT 2 — the recomposition, and nothing else

**All ten archetypes must render in `npm run preview:cards` in this commit**, before any export work,
because that is the review surface §10 requires and a composition reviewed on four charts is not
reviewed.

- Reflow to the 936px measure. **The gain is width: +19.1% frame, +22.7% measure** — measure grows
  faster than the card because `PADDING` is held absolute, which is exactly what Reyner ruled.
- **DO NOT reintroduce the `0.815` factor.** `Card.js:592` records it as `763/936` off the live
  product's card. The new inner measure is *also* 936, by coincidence and not by derivation. A
  session that sees 936 and reaches for 0.815 has matched a number, not a reason.
- The Hook keeps `flex: 1`. It is the slack absorber and hairline 2 rides down with it. Vertical
  slack has a destination; do not invent a spacer.
- Re-derive the watermark offsets per 0b. Re-baseline the kicker and Aspek gaps from `:627-628`.
- Apply the 0a fit gate.

### Render these six, not four

The design canvas carried four archetypes. Two variants are not archetype-driven and will not appear
on any of them:

| Case | Requirement |
|---|---|
| 丁 Api Unggun | 10-char headline |
| 甲 Jati | 4-char headline |
| 癸 Embun / *The Morning Dew* | 15-char English pair, kicker on an already two-line headline |
| 丙 Matahari | 30-char tag row (Hangat / Bersemangat / Terbuka) |
| **hour-less chart** | **no fourth pillar, and no space reserved for one** |
| **null-gender footer** | **date only — `buildFooter` emits no placeholder** |

Reyner's approval is **contingent on the last two rendering with zero placeholder artifacts and no
footer imbalance.** If either fails, it is a local recomposition bug. **It is not evidence against
PAD or DEPTH and must not be treated as grounds to reopen either.**

---

## COMMIT 3 — the export collapse, and LIVE STATE

One asset, both paths. `exportCards.js` point 1 — *"PNG WITH ALPHA, NEVER JPEG"* — is now **Card B
only**: Card A is opaque and square, so its export carries no transparency at all. PNG stays for
pipeline consistency; **the docblock must say which card it is talking about**, per §10's stated
implementation consequence.

Update `PROGRESS.md` LIVE STATE in the same commit. Its row currently reads *"Card A as a downloadable
PNG, 1080x1440 share capture."* That becomes false the moment this lands, and LIVE STATE is the block
the project reads before any product argument.

---

## COMMIT 4 — instruments, doc banners, and the pointer

- Doc banners on the superseded geometry in `card-polish-spec.md` §2 and §7.
- `docs/NEXT.md`: move the pointer to prompt R. **This follows prompt Q's commit 6 precedent** — the
  2026-08-07 rule makes the pointer update part of writing or queueing a build prompt, and Q
  discharged it as its own final commit rather than as a side edit. Do the same here.
- `docs/NEXT.md` on `main` cites `tests/card-budget.spec.mjs`, which exists only on unmerged #77.
  Either resolve the reference or mark it, but do not leave it dangling through another prompt.

---

## OUT OF SCOPE, STATED SO IT IS NOT REDISCOVERED

- **Card B. Entirely.** Canvas, object, rim, shadow, `padY`, seal, the 7px budget, the "tighten
  spacing, never trim prose, never change outer dimensions" rule. The pixel-identity gate is what
  proves it.
- **A rim or a seal on Card A.** Both refused on PRODUCT grounds, not cost. §10: *"Card B's stronger
  physical-object treatment is part of what is being paid for, and spending it on the free card spends
  the differentiation."* The cost objection was removed and the refusal stands anyway. Do not add
  either to make Card A feel more finished.
- **Re-deriving the gradient stops.** DEPTH is ruled at 1.0x and the stops are a constant.
- **`docs/prompts/M-tranche3.md`.** It sits behind this whole chain.
