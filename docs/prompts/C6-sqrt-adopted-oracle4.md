<!--
STATUS: HANDOVER — Prompt C session 5. Created 2026-08-01 after 0874719.
sqrt ADOPTED. My prediction part 3 was wrong and the reason matters. New Oracle 4 for the
verdict layer, with data at docs/engine/joey-implied-strength.json.
-->

# C6 — sqrt adopted. My prediction was half wrong. And the verdict layer now has an oracle.

## RULING: adopt sqrt. Done, and it is the right call.

```
Oracle 3            linear    sqrt
exact rank order      3/13     4/13
top-1 element         6/13     9/13
mean Spearman        0.782    0.874
pair concordance     84.5%    89.9%
```

Beats log1p (0.821) and every fitted power exponent, and takes **no parameter**. It wins on parsimony
as well as fit. Locked.

## MY PREDICTION PART 3 WAS WRONG, AND YOUR DIAGNOSIS IS CORRECT

I predicted chart 1 would stay poor because its 戊/己 within-element inversion could not be fixed by a
monotone transform. **That reasoning conflated two oracles.**

**Oracle 3 scores element totals, which are god-pair sums. It is structurally blind to within-pair
order.** Chart 1's poor O3 score was never caused by the 戊/己 inversion — it was Water out-ranking
Metal, a cross-element failure, which is exactly what the transform exists to fix. Water carried
presence 3.0; `sqrt(3.0) = 1.73` stops it dominating and Metal (旺 in 酉) takes first, matching Joey.

**You were right to check the bug hypothesis first anyway, and the invariant you used is the correct
one:** within-element agreement frozen at 48/57 with 0/9 inversions captured under `linear`, `sqrt`
**and** `log1p`. If monotonicity had broken or the transform had been applied after the seasonal
multiplier, that number would have moved. It does not, in any mode. Promoting it to Diagnostic 0 so it
stays permanently falsifiable is exactly right.

The prediction failing is the process working. It forced a rigorous attribution instead of "it got
better", and the attribution is the finding.

## THE VERDICT LAYER NOW HAS AN ORACLE — and "0 strong" is not a regression

You flagged 5 weak / 8 balanced / **0 strong** as lost discrimination. I derived the same quantity from
**Joey's own element totals** — support = DM element + Resource element, drain = the other three. Joey
normalises bars per chart, but supportShare is a within-chart ratio so the normalisation cancels.

```
Joey-implied supportShare, sorted:
20  23  27  30  34  35  36  |  47  47  |  53  54  54  55
min 20.1    median 35.9    MAX 55.3
```

**Joey's highest chart is 55.3%. Under 40/60 thresholds, Joey produces zero strong charts too —
7 weak / 6 balanced / 0 strong, against the engine's 5 / 8 / 0.**

So the sqrt transform moved the verdict layer *toward* Joey as well, and the thresholds were wrong
before the transform existed. Nothing was lost.

Data: **`docs/engine/joey-implied-strength.json`**, per chart, with the derivation and its assumption
stated in the file.

### ORACLE 4 — and do NOT fit thresholds

The instinct will be to re-fit 40/60 so the distribution "looks right". **Do not.** That is fitting to
a prior, on 13 charts, with no ground truth for the labels.

**Oracle 4 is the correlation between the engine's `supportShare` and Joey-implied `supportShare`,
as a continuous quantity.** Report Pearson and Spearman across the 13 charts.

- If the correlation is high, the strength computation is right and the thresholds are a downstream
  labelling choice you can make deliberately, informed by where Joey's distribution actually sits.
- If it is low, the thresholds are irrelevant because the underlying number is wrong.

Get the correlation first. The cut points are the easy part and they come last.

**Caveat, stated honestly:** this derivation assumes Joey's bars are element strength in the 旺衰 sense.
That is well supported — it is the same assumption the whole bar model rests on — but it is still an
assumption, and Oracle 4 inherits it. It is not independent of Oracle 3.

## STEP 2 CONFIRMED THE CONFOUNDING, QUANTIFIED

```
旺    1.2   1.3   1.4*  1.6   1.8   2.0   2.4
rho  .853  .882  .874  .882  .894  .886  .871
```

The optimum collapsed from 2.4 to a flat 1.6–1.8 plateau and re-fitting now buys +0.020. **That is
rule 13 demonstrated with numbers:** the steepened 旺 was standing in for the missing transform, and
once the transform was real its appetite mostly vanished.

**Leaving it at 1.4 is correct.** Do not bank +0.02 while an unmodelled mechanism is still open. A
plateau rather than a spike is reassuring about 1.6–1.8 being trustworthy later, but later is after
the 16% residual has a mechanism.

## CLAUDE.md NUMBERING — fixed

Good catch. Calculation 11–13 collided with Architecture 11–13. Renumbered: Calculation 1–6,
Engine 7–13, Architecture 14–19, Voice 20–25. No duplicates, no gaps. **"Rule 13" now unambiguously
means "never fit two candidate terms in one measurement."**

## SEQUENCE FOR SESSION 5

1. **Oracle 4**: correlate engine `supportShare` against `joey-implied-strength.json`. Report Pearson
   and Spearman. Do not touch thresholds.
2. **十二長生** for the 16% within-element residual. Agreed it goes first — it is a different mechanism
   rather than a reweighting, and Joey prints life-stage labels on every luck pillar so he demonstrably
   computes them. Measure on within-element agreement (48/57) as the primary signal, since that is the
   number the transform provably cannot move.
3. Thresholds last, and only once Oracle 4 says the underlying number is sound.

One at a time. Rule 13.
