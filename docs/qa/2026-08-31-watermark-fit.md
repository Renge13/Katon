<!--
STATUS: MEASUREMENT. Run 2026-08-31 on `feat/card-a-4x5`, headless Chromium.
Re-run with `npm run measure:watermark`, or a candidate with `-- --top N --right N`.
-->

# Watermark placement at 1080x1350 — re-derived, and the answer is unchanged

## The question

Prompt R section 0b, ruled by Reyner 2026-08-31:

> Retain the watermark at 0.80 of card width -> 864px on the 1080px frame. The size is approved;
> re-derive only its top/right placement during composition.

The size needed no work: `spec.card.w * 0.80` follows the frame on its own, 907 -> 1080 giving 864.
The placement did, because `card-a-4x5-worksheet.md` §2's banner forbids scaling old-frame export
pixels into the new one, and `card-polish-spec.md:153` states the constraint as a **relationship**:

> the glyph's strokes cross the full height of the headline line and reach into the tag row, and its
> densest region - the crossbar junction - sits off-card.

Both anchors of that relationship moved, and neither moved proportionally to the card.

## Method

`scripts/measure-watermark-fit.mjs`. Each card is rendered **twice**, once with the watermark node
suppressed, and the bounding box of the differing pixels is taken as the glyph's **ink**.

**The div box is not the ink box.** At 864px with line-height 0.8 the div is 864x691, and the strokes
sit inset from it by an amount that differs per stem. Measuring the div would answer a question
nobody asked.

All ten stems, because the constraint is per glyph: a placement that crosses 甲's headline may miss
丙's.

## Result at the inherited pair, `top: -128, right: -144`

```
  stem  ink y           ink x           headline y     tags y         cross reach off
  甲     0..587          474..1079       120..245       404..432        ok    ok  ok
  乙     0..544          437..1079       120..245       404..432        ok    ok  ok
  丙     0..586          466..1079       120..245       404..432        ok    ok  ok
  丁     0..583          600..829        120..245       404..432        ok    ok  NO
  戊     0..583          398..1079       120..245       404..432        ok    ok  ok
  己     0..556          481..1079       120..245       404..432        ok    ok  ok
  庚     0..589          390..1079       120..245       404..432        ok    ok  ok
  辛     0..585          408..1079       120..245       404..432        ok    ok  ok
  壬     0..529          402..1079       120..245       404..432        ok    ok  ok
  癸     0..587          394..1079       120..370       529..557        ok    ok  ok
```

**Both requirements hold on all ten.** Every glyph's ink starts at y=0 (clipped by the top edge) and
crosses the headline band, and every one reaches the tag row.

## Two things the table shows that the numbers alone do not

**1. 丁 does not run off the right edge, and that is not a failure.** Its ink is 600..829, stopping
251px short. The harness reports it because the third column was written as a predicate, but
`card-polish-spec.md:153` states the crossbar clause as a **description of what the crop achieves for
the reference glyph**, not as a per-stem acceptance test. 丁 is a horizontal stroke with a hook; it
has no crossbar junction to put off-card. Forcing its ink past the right edge means `right: -395`,
which would throw every other glyph most of the way out of frame.

Treating that clause as a gate would be reading a description as a mechanism, which is ledger row 44.

**2. 癸's tag row is at 529, not 404 — and this commit moved it there.** The 0a fit gate stopped
reducing its two-line headline, so the headline block grew (120..370 against 120..245) and pushed the
tag row down 125px. That makes 癸 the **binding constraint** on how far the watermark can be pulled
up.

## The band, measured

| `top` | 癸 ink bottom | 癸 tags top | verdict |
|---|---|---|---|
| **-128** (inherited) | 587 | 529 | reaches, 58px margin |
| -160 | 555 | 529 | reaches, 26px margin |
| -186 | 529 | 529 | **boundary — MISS** |
| -200 | 515 | 529 | misses by 14px |
| -260 | 455 | 529 | misses |
| -320 | 395 | — | fails on all ten: stops crossing the headline too |

So the legal band is roughly `top` in (-186, -128], and the inherited value sits at the safe end of
it with 58px of margin.

## The decision, and why it is "unchanged" rather than "unexamined"

**`WATERMARK_A` stays `{ top: -128, right: -144 }`.**

This is a derivation whose answer is the same as the input, which is not the same thing as scaling
the old numbers in or assuming they still held. The relationship was measured across all ten glyphs
on the new frame, and the bound that constrains it was found and pinned.

**What was deliberately NOT done:** picking a more negative `top` inside the band. More crop is more
aligned with §2.6's stated intent — pulling the glyph harder into the corner — but choosing *how much*
more, at the cost of margin against the 癸 bound, is an aesthetic call on a composition Reyner owns.
The band is recorded here so that call can be made with a number rather than by eye.

**Open for Reyner:** anywhere in (-186, -128] is legal. -160 is the midpoint and buys visibly more
crop at 26px of margin.
