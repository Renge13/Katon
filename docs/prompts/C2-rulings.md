<!--
STATUS: HANDOVER — rulings for Prompt C session 2. Created 2026-08-01 after session 1
(8fe8946 engine, 3020332 calibration harness). Read alongside C-strength-engine.md.
-->

# Prompt C session 2 — rulings

Session 1 result: **Oracle 1 is 13/13 sane. Oracle 2 is 0/13, and a 25,000-combination grid search
proves the ceiling is 2/13.** Not tunable. You were right to leave `STRENGTH_PARAMS` at spec defaults
rather than bank a marginally-less-wrong 2/13 and bury the finding. That was the correct call.

---

## RULING A — pair distribution: BUILD IT, and build it first

**Accepted as the primary hypothesis.** The evidence is strong:

- Joey publishes **ten** bars but there are only **five** elements. Each element maps to exactly two
  gods, one yin one yang.
- In 7 of 13 charts his top-3 holds both gods of one element.
- Chart 9 shows **食神 98 / 傷官 98** — an exact tie, both Fire. A model that assigns an element's whole
  mass to one god by polarity cannot produce that.

**The model to prototype:**

```
1. Compute seasonal element strength  ->  five values  (this part already works)
2. Both gods of an element inherit that element's base
3. Modulate each god by how much its OWN stem actually appears in the chart
   (stems at 1.0, hidden stems at their qi share)
4. Normalise to 100
```

Step 3 checks out on chart 1: Metal base is shared, and 辛 appears at 1.0 (酉) while 庚 appears at
0.6 (two 巳 at 0.3). Joey gives 正財 88 / 偏財 80. Higher stem presence, higher bar. Consistent.

**Treat step 3 as a hypothesis, not a given.** If stem-presence modulation does not reproduce the
spread, try polarity-match-with-Day-Master as the modulator instead, and report which fits better.
Do not blend both to force a number.

**Measure after A before touching anything else.**

## RULING B — Earth inflation: WAIT, do not fix yet

Real finding, correct instinct, wrong moment. Fix A, re-measure, then decide.

Reason: A redistributes element mass across god pairs, which changes how Earth's accumulated mass
surfaces in the bars. Part of the Earth over-topping may be a symptom of A rather than an independent
defect. **Two simultaneous changes to a model with one noisy metric is how you end up unable to
attribute either.**

If Earth still tops 7 charts against Joey's 4 after A lands, then it is independent and we rule on the
classical treatment (土旺於四季 — Earth ruling only the tail of each season rather than owning
辰未戌丑 outright). Bring me the post-A numbers.

## RULING C — my brief was wrong, the implementation is right

You are correct and I conflated two systems.

- The five-value table I supplied **is** 旺相休囚死 (five seasonal phases).
- My aside "丙 in 酉 = 死 (Death stage)" describes **十二長生** (twelve life stages). Different system.

**Keep 旺相休囚死 as implemented.** Autumn is Metal-ruled; Fire controls Metal; Fire is therefore
**囚 (trapped) = 0.8**, exactly as you built it. Do not change it to 0.6. Chart 1 still comes out weak
at 20% share, so the anchor holds either way.

The brief's aside is the error. Ignore it.

## RULING D — the 72.5% vs 80% drain is not a discrepancy

Mine was **unweighted element presence** (raw stems + hidden stems, no seasonal multiplier) — the
display quantity. Yours is **seasonally weighted**, which is the strength quantity. Different numbers
measuring different things, and `CLAUDE.md` rule 9 says never conflate them. Both are right. No action.

## RULING E — the Oracle 2 metric must handle ties

**"11/13 exact rank order" is unreachable as specified, and that is my spec's fault.**

Joey publishes ties: chart 9 has 98/98 at the top, chart 13 has 80/80. On a tied pair there is no
assertable order, so those charts can fail while being completely correct.

Replace the metric with three numbers, reported separately:

1. **Top-3 set match** — do the same three gods appear, ignoring order. Primary metric. **Target 11/13.**
2. **Rank correlation** (Spearman) over all ten, with tied scores given tied ranks. Catches
   whole-shape errors the top-3 misses.
3. **Exact order** — keep it, but as informational only. Never a gate.

Do this before re-measuring A, or you will not be able to tell whether A helped.

---

## Fixture

Your two mapping corrections are **confirmed from primary source**, not just corroboration.
Joey's own printed legend is now transcribed in `docs/engine/joey-profile-mapping.md`:
Warrior = 七殺, Director = 正財 (Direct Wealth), Leader = 劫財. Use that table; do not re-derive.

## Sequence for session 2

1. Fix the Oracle 2 metric (ties). Re-baseline.
2. Prototype A. Measure. Report all three numbers.
3. Only then bring me B with post-A evidence.

Keep the engine and any calibration in separate commits, as before.
