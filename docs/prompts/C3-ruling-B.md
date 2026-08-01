<!--
STATUS: HANDOVER — Ruling B for Prompt C session 3. Created 2026-08-01 after session 2
(72ed4fc metric, 325001a ruling A). Read alongside C-strength-engine.md and C2-rulings.md.
-->

# Ruling B — do NOT fix Earth yet. Get the data first.

Session 2's diagnostic 2 is the most important result in this build:

> **Element ranking can host Joey's top-3 in only 6/13 charts. 11/13 is unreachable by any
> projection scheme.** The defect is element strength.

Correct, and it changes the question. You are trying to fit an element model while only able to see
Joey's **top 3 bars** — a keyhole. Before changing the model, widen the keyhole.

---

## 1. THE FULL TEN BARS EXIST. GET THEM.

Joey's PDF prints all ten profiles with natal percentages on page 2, under
"10 PROFILES STRENGTH CHART". The fixture only ever captured the top 3 because that is what was
transcribed, not because that is what Joey publishes.

**Chart 13 in full, transcribed from the PDF (1989-02-04 04:00, DM 乙):**

```
比肩 80    偏印 80    正財 78    偏財 72    七殺 55
劫財 55    傷官 17    食神 17    正印  0    正官  0
```

Derived element totals (sum each god pair):

```
Earth 150   Wood 135   Water 80   Metal 55   Fire 34
```

**That is the thing you have never been able to see: Joey's element strengths directly.** Five known
values per chart. Across 13 charts that is 65 data points to fit against, instead of inferring an
element model through a three-bar aperture.

**Action for Reyner:** re-run the other 12 fixture charts in Joey's plotter and transcribe page 2's
ten natal percentages for each. Roughly 30 minutes. It unblocks everything below.

## 2. WHAT CHART 13 ALREADY PROVES

**(a) Ruling A was directionally right even though the metric did not move.**
`正印 (壬) = 0` and `正官 (庚) = 0`. Neither 壬 nor 庚 appears anywhere in that chart, as a stem or a
hidden stem. **Zero stem presence produces a zero bar.** A pure element-base model cannot do that;
Water totals 80 and it all goes to 癸. Keep the pair-presence projection.

**(b) But the relationship is heavily compressed, not linear.** Presence versus bar:

```
戊 2.7 -> 78      乙 2.4 -> 80      己 1.2 -> 72      甲 0.6 -> 55
癸 0.4 -> 80      丁 0.3 -> 17      丙 0.3 -> 17      辛 0.1 -> 55
壬 0.0 ->  0      庚 0.0 ->  0
```

Presence alone does not explain it. 癸 at 0.4 scores 80 while 甲 at 0.6 scores 55. **Seasonal weighting
is doing the rest**, and the two together are clearly saturating — a 27x presence spread compresses
into a 78:0 bar spread. Worth testing a concave transform (sqrt, or normalise-then-cap) rather than
assuming linearity.

**(c) 丙 0.3 and 丁 0.3 both score 17.** Equal presence, equal bar, same element. Clean confirmation
that within-pair splitting is presence-driven, which matches your 5/6 within-element result.

## 3. HYPOTHESIS FOR EARTH — test it, do not assume it

Chart 13's month branch is 丑. The current table treats 辰未戌丑 as **Earth months**, which under
旺相休囚死 makes Earth 旺 and Water 死. Joey's actual numbers for that chart put **Water at 80 and Fire
at 34** — Water high, Fire lowest. Under an Earth-ruled 丑 that is inverted.

Under a **Water-ruled** 丑 it fits: Water 旺, Wood 相, Fire 死. Joey has Water high, Wood 135, Fire
lowest. Three out of five.

That points at the classical treatment your finding B already gestured at — **土旺於四季**. Earth does
not rule a season of its own. The four Earth branches sit at the **tail of the other four seasons**:

```
辰  tail of spring   -> Wood-ruled
未  tail of summer   -> Fire-ruled
戌  tail of autumn   -> Metal-ruled
丑  tail of winter   -> Water-ruled
```

**This is a hypothesis with one chart of support. Do not implement it as a ruling.** `CLAUDE.md` rule
4 applies: BaZi rules do not get improvised, and there are competing classical treatments of exactly
this point. Test it against the full ten-bar data once it exists, report the numbers, and if it wins
we lock it with evidence.

Note it also explains the Earth inflation from the other direction: Earth stops being 旺 in four
months of the year, which is precisely where the engine tops out on Earth in 7 charts against Joey's 4.

## 4. WHY THE GRID-SEARCH WINNER WAS A TRAP

You declined to adopt `prosperous 2.4` with everything else flattened to `0.4`. Right call, and here is
the reason stated plainly: flattening 相/休/囚/死 to a single value means **"only the season's own
element counts."** That is not a seasonal finding, it is the optimiser routing around a wrong season
assignment. If the 辰未戌丑 hypothesis is correct, the need for that flattening should disappear.

**Re-run the grid search after the season mapping changes.** If the winner moves back toward the spec
defaults, that is strong evidence the mapping was the real defect.

## 5. SEQUENCE FOR SESSION 3

1. **Wait for the full ten-bar fixture data.** Do not start without it.
2. Extend `tests/bazi-validation.fixture.js` to hold all ten bars per chart. Derive and store the five
   element totals alongside, since those are what you are actually fitting.
3. Add a **third oracle: element rank order** (5 values, 13 charts). That is a far less noisy signal
   than the Ten God top-3 and it targets the actual defect.
4. Now Spearman is computable. Replace pairwise concordance with real Spearman over all ten, keeping
   the tie handling.
5. Test the 辰未戌丑 season-mapping hypothesis. Report element rank order before and after.
6. Only then re-run the grid search.

**Do not change the Earth hidden-stem weights.** They are classical and shared with every other branch.
If season mapping does not fix the inflation, the next suspect is the transform in 2(b), not the qi
shares.
