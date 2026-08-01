<!--
STATUS: HANDOVER — Prompt C session 3. Created 2026-08-01.
The full ten-bar data is collected. Two spec corrections, one of them in the accuracy core.
Data: docs/engine/joey-bars-13.json  (13 charts x 10 bars, with stem presence and element totals)
-->

# C4 — the data is in, and it corrects two things I got wrong

All 13 charts collected directly from Joey's plotter (browser-driven, not transcribed by hand). Every
one of the 12 new charts reproduces its existing fixture top-3 exactly, so the collection is verified
against prior ground truth.

**Data file: `docs/engine/joey-bars-13.json`.** Per chart it holds the pillars, day master, month
branch, all ten bars keyed by Ten God with `{stem, element, score, presence}`, the five derived
element totals, and the element rank order.

---

## CORRECTION 1 — the hidden-stem table in Prompt C is WRONG for 子. Fix this first.

Prompt C specified:

```
子 壬1.0        <-- WRONG
```

Joey's own output for chart 1 prints:

```
子 Zi  Rat 鼠  水 Yang Water
癸 Gui  -Water水  官 DO
```

**子 hides 癸 (Yin Water), not 壬.** The mainstream 藏干 table agrees. This is my error and it is in the
accuracy core — every chart containing 子 has been assigning Water to the wrong god. Charts 1, 6, 7, 8,
11 and 12 in the fixture all contain 子.

I verified all twelve branches against Joey's printed hidden stems. **Only 子 was wrong.** The rest of
the table stands exactly as specified:

```
子 癸1.0                          <-- CORRECTED
丑 己0.6 癸0.3 辛0.1
寅 甲0.6 丙0.3 戊0.1
卯 乙1.0
辰 戊0.6 乙0.3 癸0.1
巳 丙0.6 庚0.3 戊0.1
午 丁0.6 己0.4
未 己0.6 丁0.3 乙0.1
申 庚0.6 壬0.3 戊0.1
酉 辛1.0
戌 戊0.6 辛0.3 丁0.1
亥 壬0.6 甲0.4
```

Note 亥 keeps 壬 as its main qi. The Yang/Yin Water split is 亥→壬, 子→癸 — which is the opposite of
what the branch's own polarity label suggests, and is exactly why it is easy to get wrong.

## CORRECTION 2 — ruling A is REFUTED. Bars are per-stem, not per-element-pair.

I ruled that Joey computes an element base and shares it across the god pair. **That is wrong.**

**The zero-presence law: a god scores exactly 0 if and only if its stem is absent from the chart.
130/130 slots consistent, 100%,** across all 13 charts (verified with the corrected 子 table; it was
126/130 with the wrong one, and the four violations were exactly the 子 charts — independent
confirmation of correction 1).

A shared element base cannot produce that. Chart 1 is decisive:

```
Fire is the Day Master's own element.
  比肩 丙  presence 2.2  ->  bar 85
  劫財 丁  presence 0.0  ->  bar  0
```

Same element, one god at 85 and the other at 0. Under a shared base 丁 could not be zero. Same story
with Water in chart 1: 正官 癸 = 78, 七殺 壬 = 0.

**So the projection is per-stem presence, seasonally weighted. There is no pair to split.** Keep
`tenGodProjection` as a switch for the record, but the pair modes are now known-wrong and should not
be the default.

## THE RELATIONSHIP IS SATURATING, NOT LINEAR

Chart 1, sorted by bar:

```
正財 辛 Metal  presence 1.0  -> 88
比肩 丙 Fire   presence 2.2  -> 85
偏財 庚 Metal  presence 0.6  -> 80
正官 癸 Water  presence 3.0  -> 78
食神 戊 Earth  presence 0.2  -> 50
傷官 己 Earth  presence 1.0  -> 42
```

Presence is **not monotone** with the bar. 癸 at 3.0 scores below 庚 at 0.6. So the seasonal element
multiplier is doing heavy work, and the whole thing compresses hard — a 15x presence spread lands
inside a 46-point band. Test a concave transform on presence before adding parameters.

Note also that within one element the ordering IS presence-monotone (戊 0.2 > 己 1.0 inverts, so not
even that holds cleanly — investigate whether Joey weights stem position, e.g. a visible stem
outranking a hidden one regardless of qi share).

## THE NEW ORACLE — element rank order

This is what you asked for, and it targets the actual defect.

```
ch  month  Joey's element rank
 1   癸酉   Metal > Earth > Fire > Water > Wood
 2   戊寅   Wood > Earth > Fire > Water > Metal
 3   甲辰   Wood > Water > Earth > Fire > Metal
 4   辛巳   Wood > Water > Fire > Earth > Metal
 5   己未   Earth > Fire > Wood > Water > Metal
 6   丙寅   Fire > Water > Wood > Earth > Metal
 7   戊午   Fire > Earth > Water > Wood > Metal
 8   庚子   Earth > Metal > Water > Wood > Fire
 9   癸未   Fire > Earth > Wood > Water > Metal
10   戊寅   Fire > Wood > Earth > Metal > Water
11   己丑   Earth > Metal > Wood > Water > Fire
12   壬午   Earth > Fire > Water > Wood > Metal
13   乙丑   Earth > Wood > Water > Metal > Fire
```

Joey's #1 element: **Earth 5, Fire 4, Wood 3, Metal 1, Water 0.**

Session 2 reported the engine tops Earth in 7 charts against "Joey's 4". The real number is **5**, so
the Earth inflation is smaller than measured but still real. Note Water is never #1 in any chart.

## SEQUENCE FOR SESSION 3

1. **Fix the 子 hidden stem.** Re-run everything. Report what moves — Oracle 1 verdicts may change on
   the six 子 charts, and chart 1's anchor numbers will shift.
2. Load `joey-bars-13.json` into the fixture. Replace the top-3-only bars with all ten.
3. **Add Oracle 3: element rank order** (5 values x 13 charts). Make this the primary gate — it is far
   less noisy than the Ten God projection and it is where the defect lives.
4. Real Spearman is now computable over all ten bars. Replace pairwise concordance.
5. Set `tenGodProjection` default to per-stem presence x seasonal. Retire the pair modes as
   known-wrong.
6. **Only then** test the 辰未戌丑 season-mapping hypothesis from C3, measured on Oracle 3.
7. Re-run the grid search last.

Do not tune parameters until steps 1 and 2 are done. The 子 correction alone changes the inputs to
every measurement taken so far.
