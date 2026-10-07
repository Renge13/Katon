<!--
STATUS: RULED 2026-09-07 by Reyner. AMENDED 2026-09-08 (V6) - section 2 only; see the
AMENDED block above 2.1. P4 (section 1) was untouched by V6.
AMENDED 2026-10-07 (Prompt BD1, docs/prompts/BD1-compat-p4-option-e.md) - section 1.1 only: Reyner's
option E (ruled 2026-10-04, evidence docs/qa/2026-10-02-bb-engine-scoping.md §1.3). `contrasting` is
split four ways by directed family step; `matching` and `related` are unchanged. The four cells and
their provenance: docs/content/compat-p4-option-e-rulings-2026-10-04.md. Written by Cowork from the worksheet of the same day
(Claude project: KATON-compat-p4-p5-worksheet-2026-09-07.md) and Reyner's revision of P4.
THIS FILE IS THE RULE. `lib/compat/temperament.js` and `lib/compat/pullFit.js` implement it and cite
its section numbers; a change here is a behaviour change and ships with a red test first.
Every input named exists on `main` at db9e74c or later: `lib/semantic/index.js:245-321` per chart,
`lib/compat/{branchRelations,complementarity,stemRelation}.js` cross-chart.
-->

# Compat P4 / P5 — the ruled rules

**Framing, ruled:** P4's patterns (three until 2026-10-07, six since) and P5's 2x2 are **Katon's interpretive framework**. They are
deterministic and built only from classical facts the engine already computes, but they are NOT
claims that classical BaZi defines these categories. Content must never say they are.

## 1. P4 — temperament: Matching / Related / four directed steps

Inputs: each person's `main_profile` (dominant Aspek, one of ten).

**Family position and step (amended 2026-10-07, option E).** Each person's family is taken from
their OWN Day Master, exactly as `tenGodRelation` derives it, and placed on the generating cycle:
companion 0, output 1, wealth 2, officer 3, resource 4. The step is `d = (kB - kA) mod 5`, where A is
the reader ("kamu") and B the partner ("ia"), as in `lib/semantic/pair.js`'s P3 cells.

| 1.1 relation | d | Definition | Pattern (Katon) | Cell |
|---|---|---|---|---|
| `same_god` | | both `main_profile` identical | **matching** | `p4_matching` |
| `same_group` | 0 | different god, same element relation to the Day Master (polarity differs): 比肩/劫財, 食神/傷官, 正財/偏財, 正官/七殺, 正印/偏印 | **related** | `p4_related` |
| `different_group` | 1 | A's family generates B's | **a_generates_b** | `p4_a_generates_b` |
| `different_group` | 2 | A's family controls B's | **a_controls_b** | `p4_a_controls_b` |
| `different_group` | 3 | B's family controls A's | **b_controls_a** | `p4_b_controls_a` |
| `different_group` | 4 | B's family generates A's | **b_generates_a** | `p4_b_generates_a` |

`relation` keeps its three values; only `pattern` splits. **The pattern is no longer symmetric in A
and B, on purpose:** swapping the two charts maps `a_generates_b <-> b_generates_a` and
`a_controls_b <-> b_controls_a`, and leaves `matching`, `related` and `relation` alone.
`contrasting` (`p4_contrasting`, "Pola Kontras") is RETIRED: the engine no longer emits it. Rates
over random pairs, seed 20260907: matching 10.5%, related 8.9%, the four steps 19.5% to 21.1%
(BB §1.3).

1.2 The reader gets BOTH: each person's Aspek named (glossary `name_id`, English pair once, rule
23) AND the pattern badge. The badge is not a fit verdict; "matching" is not "good" and a
"controls" step is not "bad" (rule 25). The family cycle is Katon's framework derivation, never
presented as a classical 十神 生克 claim (rule 4).
1.3 The five groups are not a new table: a Ten God is element-relation x polarity, so `same_group`
is "same element relation, polarity ignored", derived from `lib/bazi/tenGods.js` (read-only).

## 2. P5 — pull / fit

> ## AMENDED 2026-09-08 — V6, ruled by Reyner
>
> **Three clauses changed and one was deleted.** The evidence is
> `docs/qa/2026-09-07-compat-base-rates.md`, **run 2b**, which put seven rule sets on one seed and
> the same 5000 pairs. V6 is the row this amendment adopts:
>
> ```
>   V0   q1 66.3%   q2  8.6%   q3 21.8%   q4  3.4%    pull 74.9%   fit 88.1%
>   V6   q1 21.5%   q2 25.7%   q3 20.9%   q4 31.9%    pull 47.2%   fit 42.4%
> ```
>
> V6 is the only measured shape in which all four quadrants carry real weight — spread 20.9% to
> 31.9%, none vestigial, none dominant. Under V0 two thirds of readers were told q1 and 3.4% ever
> saw q4, so two of the four quadrants' content would have been written for almost nobody.
>
> **WHAT THIS AMENDMENT IS NOT EVIDENCE OF.** An even spread is a property of the distribution, not
> of the reading being true, and **there is still no oracle for a pair claim** (Joey Yap's plotter
> is single-chart, probed 2026-08-12). A rule set can distribute beautifully and describe nothing.
> These rates are also over RANDOM pairs, not couples. What run 2b supports is narrower and is the
> whole basis of the change: of seven measured shapes, this is the one where authoring four
> quadrants' worth of content is not mostly wasted.

### 2.1 PULL (is there a charge between the two charts?)
`pull = high` when ANY of:
- 2.1.a `dayBranchPair` contains harmony 六合
- 2.1.b `dayBranchPair` contains clash 冲 — **counted as pull on purpose**: the spec's P2 reframe
  calls a clashed seat "intensity and transformation"; intensity is attraction, not fit
- 2.1.c `combination` present (Day Masters are a 天干五合 pair)
- 2.1.d **the other person's MONTH branch harmonises or clashes with your Day Branch.**
  Concretely: an entry of `bHitsASpousePalace` or `aHitsBSpousePalace` whose
  `from.position === 'month'` and whose relation is 六合 or 冲. **NOT all four pillars.**

  *Amended 2026-09-08.* It read "any entry of `bHitsASpousePalace` or `aHitsBSpousePalace` is
  harmony or clash", which scanned all EIGHT pairings — four of B's branches against A's day
  branch, plus the mirror. At roughly two of twelve branches relating to any given branch, a hit
  was close to certain: **it fired on 72.1% of pairs and supplied almost the whole of pull** (74.9%
  overall). Narrowing it to the month branch takes pull-high to 47.2%. The month branch is the
  choice rather than an arbitrary narrowing because it is the seat the strength engine already
  treats as decisive — 得令, the season the Day Master is born into.
Otherwise `pull = low`.

### 2.2 FIT (do the energetics hold each other up day to day?)
`fit = high` when ALL of:
- ~~2.2.a `aSupplies` or `bSupplies` is non-null~~ **DELETED 2026-09-08.**

  **A conjunct that never fails is not a check.** It is a line that reads like a safeguard, costs a
  reader's trust when they find it, and is counted in reasoning about what FIT means. Measured on
  5000 pairs, in every form proposed:

  | form of 2.2.a | held | so it failed on |
  |---|---|---|
  | as ruled — a supplier in either direction | **100.0%** | 0 of 5000 |
  | tightened to the receiver's rank-0 favourable element | **99.5%** | 24 |
  | tightened to supply in BOTH directions | **99.9%** | 7 |
  | **deleted entirely** | — | fit-high **42.4%**, which is V3's 42.4% exactly |

  The last row is the decisive one: V3 keeps the ruled 2.2.a and V6 has none, and their fit-high
  rates are identical. The clause's presence moved fit on zero pairs. **Tightening it was tried
  first and refuted** — that is what the middle two rows are — so this is a deletion after two
  proposed repairs failed, not a deletion in preference to repairing it.

  **What is NOT being claimed:** that element supply is irrelevant to compatibility. Only that
  *"does either chart hold any of the elements the other's verdict favours"* is a question whose
  answer is always yes across two whole charts, so asking it decides nothing. A different quantity
  might; that would be a new clause with its own evidence, not this one restored.
- 2.2.b `sameImbalance` **is empty.**

  *Amended 2026-09-08, wording only — no behaviour change.* It read "is false". The value is not a
  boolean: `lib/compat/complementarity.js` emits it as the LIST of elements absent from BOTH
  charts, empty when there is none. "Is empty" is what the code has always done and what the spec
  now says.
- 2.2.c `dayBranchPair` contains neither harm 害 nor punishment 刑, **AND no entry of
  `bHitsASpousePalace` or `aHitsBSpousePalace` is 害 or 刑 either.**

  *Extended 2026-09-08.* It read only the day pair. Palace 害/刑 is present on **57.3%** of pairs,
  so folding it in is the single largest lever in the whole rule: fit-high goes from 88.1% to
  42.4%. That is deliberate — under the old clause, fit was high for seven readers in eight, and a
  verdict that lands on seven in eight is not a verdict.

  Note the ASYMMETRY with 2.1.d, which is not an oversight: 2.1.d reads only the MONTH branch,
  2.2.c reads ALL palace entries. Pull asks whether there is a charge, and the month seat is where
  the ruling locates it; fit asks whether the two hold each other up day to day, and friction
  anywhere in the chart counts against that.
Otherwise `fit = low`.

### 2.3 Quadrant
| pull | fit | id | Spec's description | Label |
|---|---|---|---|---|
| high | high | q1 | rare, easy | `@@UNRULED: p5_q1@@` |
| high | low | q2 | the addictive-hard one | `@@UNRULED: p5_q2@@` |
| low | high | q3 | slow-burn / steady | `@@UNRULED: p5_q3@@` |
| low | low | q4 | little there | `@@UNRULED: p5_q4@@` |

2.4 No overall score. If any number is ever shown it is labelled friction cost, per the spec's P7.
2.5 The engine emits `pull_reasons` and `fit_reasons` (which clauses fired) so the renderer explains
the quadrant from facts and never from its own inference (rule 14).

## 3. Flagged, not in v1 until sourced: the spouse star
Classically one person's Day Master being the other's spouse star (正官/七殺 for her, 正財/偏財 for
him) is a marriage-affinity signal; it would add a clause 2.1.e to PULL. **Ruled high-value v1
candidate, sourcing required** (two authorities, same bar as 天干五合). Joey Yap, *Hack Your
Destiny With BaZi*: checked 2026-09-07, does not state it. Not implemented.

## 4. Owed
Seven Indonesian strings (three P4 badges `p4_*`, four P5 labels `p5_*`) — Reyner. *(2026-10-07: the
P4 half is discharged - all six P4 cells are ruled and in the glossary, see §1.1.)* Spouse-star sources (Cowork). Unreachable quadrants from the
fixture, if any, recorded as fixture gaps.
