<!--
STATUS: HANDOVER — Claude Code build prompt. Created 2026-07-30.
This is PROMPT C. Run Prompt A (calculator swap) from KATON-calculator-decision.md FIRST —
the strength engine's heaviest factor depends on a correct Month Branch.
Prompt B (regression lock) can run in parallel or after.
-->

# Prompt C — the Day Master Strength Engine

## HOW TO USE

Paste everything below the line into Claude Code. **Do not run this before Prompt A.** 得令 (seasonal
command) is the heaviest factor in the model and it reads the Month Branch, which is exactly what the
calculator swap fixes.

Expect 2–3 sessions. This is the longest single build in the project and it gates compatibility, the
annual reading, the luck-pillar map, and every element-based actionable.

---

Build the Day Master strength engine for Katon. This is the accuracy core of the product. Accuracy
is the hard constraint. Do not take shortcuts, do not guess at BaZi rules, and do not rely on your
own training data for BaZi specifics — it contains frequent errors. Every rule below is given
explicitly; if something is not specified, ask rather than improvise.

## PRECONDITION

`lib/bazi/pillars.ts` must already be on tyme4ts with the `LunarSect2EightCharProvider` (流派2)
convention and naive local wall-clock. If `lib/bazi/calculator.js` still exists, stop and run
Prompt A first.

## SCHOOL

旺衰法 (strength-balance). This is deliberate and locked. Joey Yap's tooling is the external
validation oracle. Do not implement 子平法 or blend schools.

## WHAT TO BUILD

`lib/bazi/strength.ts`, exporting one function:

```ts
computeStrength(chart): {
  supportShare: number,          // 0..100
  verdict: 'weak' | 'balanced' | 'strong',
  confidence: 'high' | 'low',
  followChart: { detected: boolean, type?: string, confidence?: number },
  elementStrength: Record<Element, number>,   // seasonal-weighted, 0..100 normalised to largest
  favorable: Element[],          // ordered, most favorable first
  unfavorable: Element[],
  factors: { deLing: number, deDi: number, deSheng: number, deShi: number }  // for debugging + QA
}
```

`factors` is not cosmetic. It must be inspectable, because calibration depends on seeing which
factor drove a wrong verdict.

## THE MODEL

### Step 1 — enumerate weighted contributors

Every one of the eight characters contributes. Hidden stems contribute at their qi share.

- Each **Heavenly Stem** (year, month, day, hour): weight **1.0**. The Day Master stem itself is
  counted separately, see Step 4.
- Each **Earthly Branch**: distribute **1.0** across its hidden stems using this table. Use exactly
  these values, do not re-derive them:

```
子 壬1.0
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

If the hour is unknown, use six characters and set a flag. Do not substitute a default hour.

### Step 2 — 得令, seasonal command (the heaviest factor)

Apply a multiplier to every contributor based on the **Month Branch**, using the twelve-stage
relationship of that contributor's element to the season.

Implement the seasonal multiplier as a lookup table `SEASON_MULTIPLIER[monthBranch][element]`,
with these starting values:

```
prosperous (旺)   1.4     element rules the season
supported (相)    1.2     element is produced by the season's ruler
resting   (休)    1.0     element produces the season's ruler
trapped   (囚)    0.8     element controls the season's ruler
dead      (死)    0.6     element is controlled by the season's ruler
```

Season rulers: 寅卯 Wood · 巳午 Fire · 申酉 Metal · 亥子 Water · 辰未戌丑 Earth.

**These five constants are the primary calibration knobs.** Put them in a single exported
`STRENGTH_PARAMS` object. Do not scatter magic numbers through the code.

### Step 3 — 得地, rooting (a categorical gate, not a score)

The Day Master is **rooted** if its own element appears in the hidden stems of ANY branch.

Distinguish and record separately:
- **強根**: 臨官/祿 or 帝旺 branch for the Day Master (e.g. 丙 in 巳 or 午)
- **弱根**: element present in a branch but only as a minor hidden stem

Rooting is a **boolean gate**, not a contribution. It is used by follow-chart detection in Step 6 and
must be reported. Do not fold it into the score as a bonus.

### Step 4 — support versus drain

Relative to the Day Master's element:

```
SUPPORT:  same element (比劫)  +  element that produces DM (印, Resource)
DRAIN:    element DM produces (食伤, Output)
        + element DM controls (財, Wealth)
        + element that controls DM (官殺, Officer)
```

The Day Master stem itself counts to SUPPORT at weight 1.0.

```
supportShare = seasonWeighted(SUPPORT) / (seasonWeighted(SUPPORT) + seasonWeighted(DRAIN)) * 100
```

### Step 5 — verdict and confidence

```
supportShare < 40        -> weak
40 <= share <= 60        -> balanced
supportShare > 60        -> strong
```

Thresholds go in `STRENGTH_PARAMS`.

`confidence: 'low'` when **any** of:
- `supportShare` is within ±5 of either threshold
- the Day Master is unrooted but `supportShare` >= 40
- a 半合 or 三合 combination transforms a branch that is one of the DM's roots
  (this case is real and it is in the fixture — chart 1: two 巳 roots pulled toward Metal by 巳酉)

Low confidence never blocks a reading. It flags the chart for QA and instructs the renderer to
avoid a hard verdict.

### Step 6 — follow chart (從格), strict gate

Rare. **It must not become a casual third bucket** — a loose implementation false-positives and
produces confidently wrong readings.

Require ALL of:
1. Day Master is **completely unrooted** (Step 3 boolean is false)
2. One single force is >= 90% of the drain side
3. No Resource element present anywhere, including hidden stems
4. The Month Branch supports the dominant force

Detection only in this phase. Do not implement follow-chart interpretation yet. Emit
`followChart.confidence` so borderline cases are visible.

### Step 7 — element bars

Same computation, different projection: seasonal-weighted total per element, normalised so the
largest is 100.

**These are a seasonal element-strength distribution, NOT a Ten God token count.** A token tally is
provably wrong here — chart 1 and chart 9 in the fixture both invert under a token model. If your
bars rank-order disagrees with the fixture, the bug is in the seasonal weighting, not the tally.

Keep this strictly separate from the old `buildElementBars` display function, which is element
presence for display only. Never conflate them. Different function, different name, different file.

### Step 8 — favorable element

```
verdict weak     -> favorable = [Resource, Companion],  unfavorable = [Officer, Wealth, Output]
verdict strong   -> favorable = [Output, Wealth, Officer], unfavorable = [Resource, Companion]
verdict balanced -> favorable = whichever side is scarcer; flag confidence 'low'
```

Order `favorable` by which is scarcer in the chart. This drives career verdicts and compatibility, so
the ordering is load-bearing, not cosmetic.

## VALIDATION — two oracles, both must be reported

Extend `tests/bazi-engine.report.mjs`.

**Oracle 1 — strength verdict.** For each of the 13 fixture charts, print `supportShare`, verdict,
confidence, and the four `factors`. There is no published Joey verdict for all 13; the pass condition
is **internal coherence and no absurd results** (e.g. a chart with zero Resource, a hostile season and
70% drain must not come out 'strong').

**Oracle 2 — element bar rank order.** This is the hard, checkable one. Joey's top-3 bars are in the
fixture. Report rank-order agreement per chart and in aggregate.

**Target: >= 11/13 on bar rank-order.** Below that, tune `STRENGTH_PARAMS` — do not special-case
individual charts. Any chart-specific branch in the scoring code is a bug.

**Chart 1 (1989-09-13 09:00, 丙) is the calibration anchor.** Expected verdict: **weak**. 丙 in 酉 is
死 (Death stage), Wood is 0.00 so there is no Resource at all, drain is ~72.5%, and although there are
two 巳 (臨官/祿) roots, 巳酉 半合 pulls them toward Metal. Expected `confidence: 'low'` — strong rooting
against a hostile season is exactly the marginal case. Joey's bars for this chart:
Director 88 / Friend 85 / Pioneer 80.

Chart 13 (1989-02-04 04:00, 乙, month 丑) has bars Friend 80 / Philosopher 80 / Director 78 / Pioneer 72
and is a solar-term boundary chart. Use it to confirm the boundary flag propagates.

## OUT OF SCOPE — do not build these

- Follow-chart interpretation (detection only)
- Career or lifestyle verdicts
- Any renderer or prose work
- Any change to `tenGods.js` or `mainProfile.js`. Track A staying at **7/12 is CORRECT** — it is the
  intended divergence from Joey's proprietary two-source tiebreak. Do not "fix" it.

## DELIVERABLE

One PR, engine + tests only, independently revertable. In the description include the before/after
report table and the bar rank-order score. State the final `STRENGTH_PARAMS` values and which charts
drove each adjustment.
