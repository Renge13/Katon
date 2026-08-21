<!--
STATUS: ANALYSIS, zero cost. No provider call was made to produce this. It reads
artifacts already paid for. Nothing is fixed here - this is the fix LIST.
-->

# Why the floor rate is 21%: what the paid artifacts can and cannot say

## FIRST, THE HOLE. The 8 floored runs' reasons were never recorded.

`docs/qa/2026-08-21-renders-n10.md` measured 40 runs and recorded per-attempt detail
for **run 1 of each chart only**. So the eight floored runs that produce the 21% have
**no rejection lists behind them**. That is a defect in the harness, fixed in
`fix/harness-records-what-it-measures`, and it cannot be recovered without paying
again.

Everything below is therefore assembled from **other** paid artifacts. It is enough to
rank a fix list and not enough to close the question.

## The evidence that exists, and what gate produced it

| source | gate | what it holds |
|---|---|---|
| `2026-08-21-renders-rule23-inserted.md` | **1.13.0** | 3 fully-recorded floors, 9 attempts |
| `2026-08-21-renders-n10.md` | **1.13.0** | run-1 attempts for 4 charts, 3 rejections |
| `2026-08-18-retry-depth.json` | 1.9.0 | **77 attempts** with per-attempt checks, 4 charts |

The first two are the SAME GATE as the 21% measurement. The third is the only
large-n per-chart data that exists, and three checks have moved since it was
produced - `style.adverbial` deleted, `mungkin` moved out of `style.hedging`, and the
archetype requirement added - so **its `style.hedging` rates are an upper bound for
today, not a current reading.**

## Which checks account for the floors, at gate 1.13.0

Every attempt inside a recorded floor:

| chart | attempt 1 | attempt 2 | attempt 3 |
|---|---|---|---|
| chart 5 | `style.hedging` | `coverage.field_dropped` x3 | `coverage.field_dropped` x2, `style.hedging` |
| chart 1 | `coverage.cost_dropped`, `style.hedging`, `style.essay_connectives` | `style.hedging` x2 | `style.essay_connectives` |
| fresh-1996 | `fact.strength_contradiction`, `fact.strength_same_breath`, `coverage.field_dropped` x2, `coverage.cost_dropped` x2 **(HARD)** | `style.hedge_construction` | `opening.archetype_missing` |

**Two families do all the work.** `coverage.*` (field/cost dropped) and `style.*`
(hedging, essay_connectives, hedge_construction). Between them they account for every
attempt in the chart-5 and chart-1 floors, and for two of three in fresh-1996's.

**No bracket check appears anywhere.** Rule 23 is fully out of the floor path since
insertion landed, which the 9-attempt run already showed and this confirms.

## The per-chart clustering: DIFFERENT checks, not one check at different rates

From the 77-attempt data (gate 1.9.0, caveat above). Hits per scored attempt:

| check | chart 5 | chart 13 | chart 1 | fresh-1996 |
|---|---|---|---|---|
| `style.hedging` | **9/22 (41%)** | — | 3/22 | — |
| `coverage.field_dropped` | 5/22 | — | 4/22 | 3/15 |
| `coverage.cost_dropped` | — | 1/18 | **6/22 (27%)** | 3/15 |
| `fact.hour_known_contradiction` | — | **6/18 (33%)** | 1/22 | — |
| `style.raw_pillar` | — | **5/18 (28%)** | 1/22 | — |
| `style.essay_connectives` | 1/22 | 2/18 | 3/22 | — |
| `fact.strength_same_breath` | — | — | — | **1/15** |
| `fact.condition_named` | — | — | 1/22 | — |
| attempts | 22 | 18 | 22 | 15 |

**The answer to the question asked: different checks, per chart, decisively.**

- **chart 5** is a `style.hedging` chart. 41% of its attempts, and **zero** on charts
  13 and fresh-1996. Its floor at 1.13.0 is hedging plus dropped fields.
- **chart 13** is a `fact.hour_known_contradiction` + `style.raw_pillar` chart, and
  has **no hedging at all**. It is also the least-floored chart with a recorded reason
  (10% at n=10).
- **chart 1** is spread thinnest - six different checks, none above 27%. That is
  consistent with its **0/10**: no single check is reliable enough on this chart to
  exhaust a three-attempt budget.
- **fresh-1996** is the only chart that fails at the **FACT** level.
  `fact.strength_same_breath` appears on no other chart, and its 1.13.0 floor opened
  with a **HARD `fact.strength_contradiction`**.

**So chart 1 at 0% and fresh-1996 at 44% are not the same check at two rates.** Chart
1's failures are many and individually unlikely; fresh-1996 carries a chart-specific
FACT-level failure that no other chart shows, and a HARD failure at attempt 1 spends a
regeneration on a fact problem before the style and coverage problems get their turn.

This is the shape of the 08-11 finding rather than a threshold argument: a rate that
looks like a tuning problem is reading a **content gap on one chart**.

## THE FIX LIST, ranked by floors-per-unit-of-work. Nothing here is done.

1. **`fact.strength_*` on fresh-1996 — chart-specific, and the only HARD failure.**
   Highest value: it is the worst chart (44%), the failure is at attempt 1, and it is
   HARD, so it costs a regeneration before anything else is attempted. Look at that
   chart's strength facts and their glossary cells, not at the check. One chart's
   content, not a threshold.

2. **`fact.hour_known_contradiction` firing at attempt 1 on charts that HAVE an hour.**
   It is chart 13's top check at 33%, and in the n=10 run it fired HARD at attempt 1 on
   **chart 1 and fresh-1996 as well** - both of which have hours. A HARD fact failure
   on a fact that is plainly true in the payload points at the prompt or the payload
   making "hour known" ambiguous, which would be a cheap systemic win rather than a
   per-chart one.

3. **`coverage.field_dropped` / `coverage.cost_dropped`, the broadest family.** Present
   on all four charts and in every recorded floor. This is where the 08-11 parallel
   bites hardest: `fieldOverlap` is UNFITTED by its own docblock and the harness was
   built to fit it from the observed distribution. **The distribution is now being
   collected** (`metrics.coverage` records passes and failures), so this is a
   fit-from-data question rather than a taste question - but the fit needs a run whose
   metrics are kept, which no artifact currently is.

4. **`style.hedging` on chart 5.** 41% at 1.9.0 and the caveat matters most here:
   `mungkin` was moved out of this check on 08-17, so today's rate is lower by an
   unknown amount. **Re-measure before touching it.** If it survives at anything like
   that rate on one chart and zero on two others, it is chart-5 content.

5. **`style.essay_connectives` on chart 1.** Two of its three floor attempts. Small,
   and the ledger already warns this ban came from Reyner's own blind judging, so it is
   the least safe thing on this list to relax.

## What the next paid run must carry, or this repeats

The corrected harness now records every floored run's rejection list, a check tally,
and flag rates across all runs on a rendered-run denominator. **`metrics.coverage` is
still not written to the artifact**, so item 3 cannot be fitted even from a corrected
run. That is the one gap left to close before spending again.
