<!--
STATUS: RAW QA DUMP. Generated, not written. Do not edit the prose in this file -
it is evidence, and an edited render is not one. Regenerate with npm run qa:renders.
-->

# QA renders — 2026-08-22

Charts 5, 13, 1 and fresh-1996 through the real chain. **Prose is verbatim and nothing
below a rule is edited.** Nobody has judged these; that is Reyner's, after Cowork annotates.

## FLOOR RATE, n = 10 per chart

| Chart | runs | scored | floored | floor rate | transport-truncated | cached |
|---|---|---|---|---|---|---|
| chart 5 | 10 | 10 | 3 | **30%** | 0 | 0 |
| chart 13 | 10 | 10 | 1 | **10%** | 0 | 0 |
| chart 1 | 10 | 10 | 0 | **0%** | 0 | 0 |
| fresh-1996 | 10 | 10 | 0 | **0%** | 0 | 0 |
| **POOLED** | **40** | **40** | **4** | **10%** | **0** | **0** |

`scored` is the denominator the rate uses. A run whose chain was cut short by a provider
transport error is EXCLUDED, because the gate did not floor it - the trap
`probe-retry-depth` hit on 2026-08-19, where one 503 was the whole difference between a
reported 3% floor and a real 0 of 39.

## COVERAGE DISTRIBUTION, so `fieldOverlap` can be fitted from data

`fieldOverlap` = **0.2**, `fieldMinHits` = **2**. A field fails only when
ratio is under the threshold AND hits are under the minimum, so the two columns are not
interchangeable. Every observation is here, passing and failing both - a threshold fitted
from rejections alone cannot tell "nothing came near the line" from "half the corpus sits
one stem above it".

| ratio bucket | observations | of which hits >= 2 (rescued) | would FAIL |
|---|---|---|---|
| 0.00 - 0.05 **(under threshold)** | 6 | 0 | 6 |
| 0.05 - 0.10 **(under threshold)** | 3 | 0 | 3 |
| 0.10 - 0.15 **(under threshold)** | 29 | 19 | 10 |
| 0.15 - 0.20 **(under threshold)** | 35 | 35 | 0 |
| 0.20 - 0.30 | 90 | 86 | 0 |
| 0.30 - 0.40 | 106 | 106 | 0 |
| 0.40 - 0.60 | 436 | 436 | 0 |
| 0.60 - 1.00 | 2074 | 2074 | 0 |
| **TOTAL** | **2779** | **2756** | **19** |

19 of 2779 observations would fail (1%).

Failing observations by FIELD - `coverage` is four different demands under one name:

| field | failing |
|---|---|
| `cost` | 13 |
| `gift` | 6 |

## FLAG RATES across all 10 run(s) per chart

| Chart | rendered runs | brackets.inserted | opening.archetype_missing | opening.element_fused |
|---|---|---|---|---|
| chart 5 | 7 | 0/7 | 1/7 | 1/7 |
| chart 13 | 9 | 3/9 | 0/9 | 0/9 |
| chart 1 | 10 | 1/10 | 4/10 | 2/10 |
| fresh-1996 | 10 | 1/10 | 10/10 | 0/10 |
| **POOLED** | **36** | **5/36** | **15/36** | **3/36** |

A flag never rejects. The DENOMINATOR IS RENDERED RUNS: a floored run has no model
output to judge, so including it would dilute the rate with runs that could not have
exhibited the thing being counted.

---

## THE 4 FLOORED RUN(S), AND WHY EACH ONE FLOORED

Every floored run across all runs, not only the printed one. A run floors when Stage 6
rejected every attempt in the regeneration budget - one initial plus 3 regeneration(s). THE NUMBER IS READ FROM `lib/render/config.js`, never written here: this sentence said "plus two regenerations" as a literal until 2026-08-22, which would have described the wrong gate the moment the budget moved.
Transport-truncated runs are NOT here: they are listed separately and were never
floored by the gate.

| Chart | run | attempt | rejected on |
|---|---|---|---|
| chart 5 | 7 | 1 | fact.condition_named, fact.condition_named, style.hedging **(HARD)** |
|  |  | 2 | fact.condition_named **(HARD)** |
|  |  | 3 | fact.condition_named, fact.condition_named **(HARD)** |
|  |  | 4 | style.hedging |
| chart 5 | 8 | 1 | fact.condition_named, fact.condition_named **(HARD)** |
|  |  | 2 | style.hedging |
|  |  | 3 | fact.condition_named, fact.condition_named **(HARD)** |
|  |  | 4 | fact.condition_named, fact.condition_named, style.hedging **(HARD)** |
| chart 5 | 10 | 1 | style.hedging |
|  |  | 2 | fact.condition_named, fact.condition_named **(HARD)** |
|  |  | 3 | style.hedging |
|  |  | 4 | fact.condition_named, fact.condition_named, style.unsanctioned_bracket **(HARD)** |
| chart 13 | 4 | 1 | coverage.cost_dropped |
|  |  | 2 | fact.condition_named **(HARD)** |
|  |  | 3 | coverage.cost_dropped |
|  |  | 4 | fact.condition_named, style.essay_connectives **(HARD)** |

Checks by how often they fired inside a floored run:

| check | fired |
|---|---|
| `fact.condition_named` | 17 |
| `style.hedging` | 6 |
| `coverage.cost_dropped` | 2 |
| `style.unsanctioned_bracket` | 1 |
| `style.essay_connectives` | 1 |

## EVERY REJECTED ATTEMPT, WITH THE FINDING'S OWN MESSAGE (64)

Across ALL runs, not only floored ones. `outcome` says what became of the run this
attempt belongs to, so a rejection that a later attempt fixed is not read as a floor.

**chart 5, run 1, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Metal" is a condition, not a badge, and must not be named
- `fact.condition_named` — element_dominant_Earth is a condition and this block names it: "Logam (Missing Metal)"

**chart 5, run 1, attempt 2** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Metal" is a condition, not a badge, and must not be named
- `fact.condition_named` — "Dominant Output" is a condition, not a badge, and must not be named

**chart 5, run 3, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Metal" is a condition, not a badge, and must not be named
- `fact.condition_named` — element_dominant_Earth is a condition and this block names it: "Logam (Missing Metal)"

**chart 5, run 3, attempt 2** — run RENDERED

- `coverage.field_dropped` — element_missing_Metal: "gift" did not survive into the prose (0/8 stems)
- `style.hedging` — /\bcenderung\b/ at "nya. Kamu cenderung bertahan di situasi yang sudah"

**chart 5, run 3, attempt 3** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Metal" is a condition, not a badge, and must not be named
- `fact.condition_named` — "Dominant Output" is a condition, not a badge, and must not be named

**chart 5, run 4, attempt 1** — run RENDERED

- `style.hedging` — /\bcenderung\b/ at "nya. Kamu cenderung bertahan di situasi yang sudah"

**chart 5, run 4, attempt 2** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Metal" is a condition, not a badge, and must not be named
- `fact.condition_named` — "Dominant Output" is a condition, not a badge, and must not be named

**chart 5, run 5, attempt 1** — run RENDERED

- `style.hedging` — /\bcenderung\b/ at "nya. Kamu cenderung bertahan di situasi yang sudah"

**chart 5, run 6, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Metal" is a condition, not a badge, and must not be named
- `fact.condition_named` — "Dominant Output" is a condition, not a badge, and must not be named

**chart 5, run 7, attempt 1** — run FLOORED — **HARD**

- `fact.condition_named` — "Missing Metal" is a condition, not a badge, and must not be named
- `fact.condition_named` — element_dominant_Earth is a condition and this block names it: "Logam (Missing Metal)"
- `style.hedging` — /\bcenderung\b/ at "nya. Kamu cenderung bertahan di situasi yang sudah"

**chart 5, run 7, attempt 2** — run FLOORED — **HARD**

- `fact.condition_named` — "Dominant Output" is a condition, not a badge, and must not be named

**chart 5, run 7, attempt 3** — run FLOORED — **HARD**

- `fact.condition_named` — "Missing Metal" is a condition, not a badge, and must not be named
- `fact.condition_named` — element_dominant_Earth is a condition and this block names it: "Logam (Missing Metal)"

**chart 5, run 7, attempt 4** — run FLOORED

- `style.hedging` — /\bcenderung\b/ at "imu. Kamu cenderung bertahan di situasi yang sudah"

**chart 5, run 8, attempt 1** — run FLOORED — **HARD**

- `fact.condition_named` — "Missing Metal" is a condition, not a badge, and must not be named
- `fact.condition_named` — element_dominant_Earth is a condition and this block names it: "Logam (Missing Metal)"

**chart 5, run 8, attempt 2** — run FLOORED

- `style.hedging` — /\bcenderung\b/ at "nya. Kamu cenderung bertahan di situasi yang sudah"

**chart 5, run 8, attempt 3** — run FLOORED — **HARD**

- `fact.condition_named` — "Missing Metal" is a condition, not a badge, and must not be named
- `fact.condition_named` — element_dominant_Earth is a condition and this block names it: "Logam yang hilang (Missing Metal)"

**chart 5, run 8, attempt 4** — run FLOORED — **HARD**

- `fact.condition_named` — element_missing_Metal is a condition and this block names it: "Dominant Output (Dominant Output)"
- `fact.condition_named` — "Dominant Output" is a condition, not a badge, and must not be named
- `style.hedging` — /\bcenderung\b/ at "imu. Kamu cenderung bertahan di situasi yang sudah"

**chart 5, run 9, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Metal" is a condition, not a badge, and must not be named
- `fact.condition_named` — "Dominant Output" is a condition, not a badge, and must not be named
- `style.unsanctioned_bracket` — "(Dominant Earth)" is not a glossary term; rule 23 allows the English bracket only as a citation of a name

**chart 5, run 9, attempt 2** — run RENDERED

- `style.hedging` — /\bcenderung\b/ at "imu. Kamu cenderung bertahan di situasi yang sudah"

**chart 5, run 9, attempt 3** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Metal" is a condition, not a badge, and must not be named
- `coverage.field_dropped` — element_missing_Metal: "gift" did not survive into the prose (0/8 stems)
- `style.hedging` — /\bcenderung\b/ at "atu. Kamu cenderung bertahan di situasi yang sudah"

**chart 5, run 10, attempt 1** — run FLOORED

- `style.hedging` — /\bcenderung\b/ at "nya. Kamu cenderung bertahan di situasi yang sudah"

**chart 5, run 10, attempt 2** — run FLOORED — **HARD**

- `fact.condition_named` — "Missing Metal" is a condition, not a badge, and must not be named
- `fact.condition_named` — element_dominant_Earth is a condition and this block names it: "Logam (Missing Metal)"

**chart 5, run 10, attempt 3** — run FLOORED

- `style.hedging` — /\bcenderung\b/ at "nya. Kamu cenderung bertahan di situasi yang sudah"

**chart 5, run 10, attempt 4** — run FLOORED — **HARD**

- `fact.condition_named` — "Missing Metal" is a condition, not a badge, and must not be named
- `fact.condition_named` — "Dominant Output" is a condition, not a badge, and must not be named
- `style.unsanctioned_bracket` — "(Dominant Earth)" is not a glossary term; rule 23 allows the English bracket only as a citation of a name

**chart 13, run 1, attempt 1** — run RENDERED

- `coverage.cost_dropped` — main_profile: "cost" did not survive into the prose (1/7 stems)

**chart 13, run 2, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Dominant Wealth" is a condition, not a badge, and must not be named
- `coverage.cost_dropped` — main_profile: "cost" did not survive into the prose (1/7 stems)

**chart 13, run 4, attempt 1** — run FLOORED

- `coverage.cost_dropped` — main_profile: "cost" did not survive into the prose (1/7 stems)

**chart 13, run 4, attempt 2** — run FLOORED — **HARD**

- `fact.condition_named` — "Dominant Wealth" is a condition, not a badge, and must not be named

**chart 13, run 4, attempt 3** — run FLOORED

- `coverage.cost_dropped` — main_profile: "cost" did not survive into the prose (1/7 stems)

**chart 13, run 4, attempt 4** — run FLOORED — **HARD**

- `fact.condition_named` — "Dominant Wealth" is a condition, not a badge, and must not be named
- `style.essay_connectives` — /\bhal ini\b/ at "Wealth). Hal ini menandai banyaknya peluang, tang"

**chart 13, run 6, attempt 1** — run RENDERED

- `style.hedging` — /\bcenderung\b/ at "mana kamu cenderung melihat hubungan sebagai pelua"

**chart 13, run 6, attempt 2** — run RENDERED

- `coverage.cost_dropped` — main_profile: "cost" did not survive into the prose (1/7 stems)

**chart 13, run 6, attempt 3** — run RENDERED — **HARD**

- `fact.condition_named` — "Dominant Wealth" is a condition, not a badge, and must not be named

**chart 13, run 7, attempt 1** — run RENDERED

- `coverage.cost_dropped` — main_profile: "cost" did not survive into the prose (1/7 stems)

**chart 13, run 7, attempt 2** — run RENDERED — **HARD**

- `fact.condition_named` — "Dominant Wealth" is a condition, not a badge, and must not be named

**chart 13, run 7, attempt 3** — run RENDERED

- `coverage.cost_dropped` — main_profile: "cost" did not survive into the prose (1/7 stems)

**chart 1, run 1, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Wood" is a condition, not a badge, and must not be named

**chart 1, run 1, attempt 2** — run RENDERED

- `style.hedging` — /\bcenderung\b/ at "ubunganmu cenderung berat karena kamu jarang membe"
- `style.essay_connectives` — /\bhal ini\b/ at "u benar. Hal ini tercermin di Fondasi Pasangan, y"

**chart 1, run 1, attempt 3** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Wood" is a condition, not a badge, and must not be named
- `style.essay_connectives` — /\bhal ini\b/ at "u benar. Hal ini tercermin di Fondasi Pasangan, y"

**chart 1, run 2, attempt 1** — run RENDERED

- `coverage.cost_dropped` — void_stack_month: "cost" did not survive into the prose (1/7 stems)
- `style.hedging` — /\bcenderung\b/ at "mana kamu cenderung membawa tanggung jawab yang sa"

**chart 1, run 2, attempt 2** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Wood" is a condition, not a badge, and must not be named

**chart 1, run 3, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Wood" is a condition, not a badge, and must not be named

**chart 1, run 4, attempt 1** — run RENDERED

- `style.hedging` — /\bcenderung\b/ at "ana, kamu cenderung membawa disiplin yang sama, ya"
- `style.essay_connectives` — /\bhal ini\b/ at "lu benar. Hal ini tercermin pula di Fondasi Pasang"

**chart 1, run 4, attempt 2** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Wood" is a condition, not a badge, and must not be named
- `style.hedging` — /\bcenderung\b/ at "mana kamu cenderung membawa disiplin yang sama ke"
- `style.essay_connectives` — /\bkondisi ini\b/ at "sendiri. Kondisi ini diperjelas dengan statusmu s"

**chart 1, run 4, attempt 3** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Wood" is a condition, not a badge, and must not be named
- `coverage.cost_dropped` — badge_桃花: "cost" did not survive into the prose (0/13 stems)

**chart 1, run 6, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Wood" is a condition, not a badge, and must not be named
- `style.hedging` — /\bcenderung\b/ at "mana kamu cenderung membawa disiplin dan tanggung"
- `style.unsanctioned_bracket` — "(Missing Element)" is not a glossary term; rule 23 allows the English bracket only as a citation of a name

**chart 1, run 7, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Wood" is a condition, not a badge, and must not be named
- `coverage.field_dropped` — element_missing_Wood: "gift" did not survive into the prose (1/8 stems)
- `style.essay_connectives` — /\bhal ini\b/ at "lu benar. Hal ini juga tercermin pada Fondasi Pasa"

**chart 1, run 8, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Wood" is a condition, not a badge, and must not be named
- `style.essay_connectives` — /\bhal ini\b/ at "lu benar. Hal ini berkaitan dengan Fondasi Pasanga"

**chart 1, run 8, attempt 2** — run RENDERED

- `style.essay_connectives` — /\bhal ini\b/ at "u benar. Hal ini berkaitan dengan Fondasi Pasanga"

**chart 1, run 8, attempt 3** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Wood" is a condition, not a badge, and must not be named

**chart 1, run 9, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Wood" is a condition, not a badge, and must not be named
- `coverage.cost_dropped` — badge_桃花: "cost" did not survive into the prose (1/13 stems)

**fresh-1996, run 1, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Wood" is a condition, not a badge, and must not be named
- `coverage.field_dropped` — element_missing_Wood: "gift" did not survive into the prose (1/8 stems)

**fresh-1996, run 1, attempt 2** — run RENDERED

- `coverage.cost_dropped` — badge_桃花: "cost" did not survive into the prose (0/13 stems)

**fresh-1996, run 2, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Wood" is a condition, not a badge, and must not be named

**fresh-1996, run 3, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Wood" is a condition, not a badge, and must not be named
- `coverage.field_dropped` — day_master_Water: "gift" did not survive into the prose (0/5 stems)

**fresh-1996, run 3, attempt 2** — run RENDERED

- `coverage.cost_dropped` — badge_桃花: "cost" did not survive into the prose (1/13 stems)

**fresh-1996, run 4, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Wood" is a condition, not a badge, and must not be named

**fresh-1996, run 5, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Wood" is a condition, not a badge, and must not be named

**fresh-1996, run 6, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Wood" is a condition, not a badge, and must not be named

**fresh-1996, run 7, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Wood" is a condition, not a badge, and must not be named

**fresh-1996, run 9, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Wood" is a condition, not a badge, and must not be named

**fresh-1996, run 9, attempt 2** — run RENDERED

- `coverage.cost_dropped` — badge_桃花: "cost" did not survive into the prose (1/13 stems)

**fresh-1996, run 9, attempt 3** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Wood" is a condition, not a badge, and must not be named
- `coverage.field_dropped` — element_missing_Wood: "gift" did not survive into the prose (0/8 stems)

**fresh-1996, run 10, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Wood" is a condition, not a badge, and must not be named
- `style.hedging` — /\bcenderung\b/ at "rimu yang cenderung menunggu kesempurnaan, kamu ki"

---

## RETRY EROSION IN FINDINGS — does a regeneration break what it had passed?

| step | regeneration steps | steps introducing a NEW check | new checks | checks that SURVIVED the directive |
|---|---|---|---|---|
| attempt 1 -> 2 | 31 | 14 (45%) | 16 | 5 |
| attempt 2 -> 3 | 17 | 11 (65%) | 13 | 4 |
| attempt 3 -> 4 | 12 | 4 (33%) | 6 | 1 |

A check in the SURVIVED column was named to the model by `stricterDirective` and fired
again anyway. A check that survives every step of the budget is not short of chances.

| Chart | run | step | fixed | survived | NEW |
|---|---|---|---|---|---|
| chart 5 | 1 | 1 -> 2 | — | fact.condition_named | — |
| chart 5 | 1 | 2 -> 3 | fact.condition_named | — | — |
| chart 5 | 3 | 1 -> 2 | fact.condition_named | — | coverage.field_dropped, style.hedging |
| chart 5 | 3 | 2 -> 3 | coverage.field_dropped, style.hedging | — | fact.condition_named |
| chart 5 | 3 | 3 -> 4 | fact.condition_named | — | — |
| chart 5 | 4 | 1 -> 2 | style.hedging | — | fact.condition_named |
| chart 5 | 4 | 2 -> 3 | fact.condition_named | — | — |
| chart 5 | 5 | 1 -> 2 | style.hedging | — | — |
| chart 5 | 6 | 1 -> 2 | fact.condition_named | — | — |
| chart 5 | 7 | 1 -> 2 | style.hedging | fact.condition_named | — |
| chart 5 | 7 | 2 -> 3 | — | fact.condition_named | — |
| chart 5 | 7 | 3 -> 4 | fact.condition_named | — | style.hedging |
| chart 5 | 8 | 1 -> 2 | fact.condition_named | — | style.hedging |
| chart 5 | 8 | 2 -> 3 | style.hedging | — | fact.condition_named |
| chart 5 | 8 | 3 -> 4 | — | fact.condition_named | style.hedging |
| chart 5 | 9 | 1 -> 2 | fact.condition_named, style.unsanctioned_bracket | — | style.hedging |
| chart 5 | 9 | 2 -> 3 | — | style.hedging | fact.condition_named, coverage.field_dropped |
| chart 5 | 9 | 3 -> 4 | fact.condition_named, coverage.field_dropped, style.hedging | — | — |
| chart 5 | 10 | 1 -> 2 | style.hedging | — | fact.condition_named |
| chart 5 | 10 | 2 -> 3 | fact.condition_named | — | style.hedging |
| chart 5 | 10 | 3 -> 4 | style.hedging | — | fact.condition_named, style.unsanctioned_bracket |
| chart 13 | 1 | 1 -> 2 | coverage.cost_dropped | — | — |
| chart 13 | 2 | 1 -> 2 | fact.condition_named, coverage.cost_dropped | — | — |
| chart 13 | 4 | 1 -> 2 | coverage.cost_dropped | — | fact.condition_named |
| chart 13 | 4 | 2 -> 3 | fact.condition_named | — | coverage.cost_dropped |
| chart 13 | 4 | 3 -> 4 | coverage.cost_dropped | — | fact.condition_named, style.essay_connectives |
| chart 13 | 6 | 1 -> 2 | style.hedging | — | coverage.cost_dropped |
| chart 13 | 6 | 2 -> 3 | coverage.cost_dropped | — | fact.condition_named |
| chart 13 | 6 | 3 -> 4 | fact.condition_named | — | — |
| chart 13 | 7 | 1 -> 2 | coverage.cost_dropped | — | fact.condition_named |
| chart 13 | 7 | 2 -> 3 | fact.condition_named | — | coverage.cost_dropped |
| chart 13 | 7 | 3 -> 4 | coverage.cost_dropped | — | — |
| chart 1 | 1 | 1 -> 2 | fact.condition_named | — | style.hedging, style.essay_connectives |
| chart 1 | 1 | 2 -> 3 | style.hedging | style.essay_connectives | fact.condition_named |
| chart 1 | 1 | 3 -> 4 | fact.condition_named, style.essay_connectives | — | — |
| chart 1 | 2 | 1 -> 2 | coverage.cost_dropped, style.hedging | — | fact.condition_named |
| chart 1 | 2 | 2 -> 3 | fact.condition_named | — | — |
| chart 1 | 3 | 1 -> 2 | fact.condition_named | — | — |
| chart 1 | 4 | 1 -> 2 | — | style.hedging, style.essay_connectives | fact.condition_named |
| chart 1 | 4 | 2 -> 3 | style.hedging, style.essay_connectives | fact.condition_named | coverage.cost_dropped |
| chart 1 | 4 | 3 -> 4 | fact.condition_named, coverage.cost_dropped | — | — |
| chart 1 | 6 | 1 -> 2 | fact.condition_named, style.hedging, style.unsanctioned_bracket | — | — |
| chart 1 | 7 | 1 -> 2 | fact.condition_named, coverage.field_dropped, style.essay_connectives | — | — |
| chart 1 | 8 | 1 -> 2 | fact.condition_named | style.essay_connectives | — |
| chart 1 | 8 | 2 -> 3 | style.essay_connectives | — | fact.condition_named |
| chart 1 | 8 | 3 -> 4 | fact.condition_named | — | — |
| chart 1 | 9 | 1 -> 2 | fact.condition_named, coverage.cost_dropped | — | — |
| fresh-1996 | 1 | 1 -> 2 | fact.condition_named, coverage.field_dropped | — | coverage.cost_dropped |
| fresh-1996 | 1 | 2 -> 3 | coverage.cost_dropped | — | — |
| fresh-1996 | 2 | 1 -> 2 | fact.condition_named | — | — |
| fresh-1996 | 3 | 1 -> 2 | fact.condition_named, coverage.field_dropped | — | coverage.cost_dropped |
| fresh-1996 | 3 | 2 -> 3 | coverage.cost_dropped | — | — |
| fresh-1996 | 4 | 1 -> 2 | fact.condition_named | — | — |
| fresh-1996 | 5 | 1 -> 2 | fact.condition_named | — | — |
| fresh-1996 | 6 | 1 -> 2 | fact.condition_named | — | — |
| fresh-1996 | 7 | 1 -> 2 | fact.condition_named | — | — |
| fresh-1996 | 9 | 1 -> 2 | fact.condition_named | — | coverage.cost_dropped |
| fresh-1996 | 9 | 2 -> 3 | coverage.cost_dropped | — | fact.condition_named, coverage.field_dropped |
| fresh-1996 | 9 | 3 -> 4 | fact.condition_named, coverage.field_dropped | — | — |
| fresh-1996 | 10 | 1 -> 2 | fact.condition_named, style.hedging | — | — |

---

## chart 5 — 1988-07-10 22:00

> the quietFloor re-ask — padding confirmed by Reyner 2026-08-11, attributed to unwritten cells

### Real render

| | |
|---|---|
| `source` | **gemini** |
| `model` | gemini-3.1-flash-lite |
| `prompt_version` | 33fa7e882bb183bd |
| loaded prompt | 33fa7e882bb183bd |
| `stage6_version` | 1.17.0 |
| `qa_flag` | — |
| `cached` | false |
| pillars | 戊辰 己未 丙寅 己亥 |
| facts / required | 13 / 7 |

Attempts, in order:

1. `gemini` rejected — fact.condition_named, fact.condition_named **(HARD)**
2. `gemini` rejected — fact.condition_named, fact.condition_named **(HARD)**
3. `gemini` passed Stage 6

---

### Matahari yang Stabil

Kamu adalah Matahari (The Sun). Kehadiranmu langsung terasa sebelum kamu bicara. Kamu menerangi sekitarmu lebih dulu sebelum menghangatkan dirimu sendiri, dan nyala itu memakai tenaga yang tidak mengisi dirinya sendiri. Orang-orang berkumpul di sekitarmu tanpa perlu kamu undang, namun api selalu membutuhkan bahan bakar dari luar. Kamu tidak bisa terus menyala hanya dari cadangan energimu sendiri. Atur jadwal untuk mengisi energimu seserius kamu mengatur jadwal kerja. Sediakan waktu untuk bertemu orang atau mendatangi tempat yang bisa memulihkan tenagamu. Jangan tunggu sampai bateraimu benar-benar habis baru mencari cara untuk pulih.

Baganmu berdiri di titik tengah yang stabil. Kamu sanggup menopang dirimu sendiri sekaligus tetap terbuka menerima dari luar. Situasi berubah, tetapi kamu jarang ikut goyah. Kamu memiliki kelenturan yang tinggi. Perubahan mendadak yang membuat orang lain kehilangan arah biasanya hanya menggeser langkahmu sedikit saja. Titik tengah tidak memberi dorongan ekstrem yang memaksa. Arah hidupmu harus kamu tentukan sendiri, karena baganmu tidak akan memaksamu ke satu sudut. Tentukan satu komitmen untuk enam bulan ke depan dan tuliskan alasannya. Begitu ragu menghampiri, baca ulang catatan itu alih-alih menunggu dorongan luar.

### Ikatan Pilar Kehidupan

Di Pilar Diri dan Pilar Arah, terdapat Ikatan (Combination). Pilar Diri adalah kehidupan pribadi dan hubungan terdekatmu, sementara Pilar Arah adalah tujuan dan arah masa depanmu. Dua bagian dari baganmu saling mengunci. Area hidup yang diwakili keduanya berjalan berdampingan; saat satu bergerak, yang lain otomatis ikut terpengaruh.

Ada dua bidang hidupmu yang saling menguatkan dengan sendirinya tanpa perlu kamu atur. Saat ada masalah, keduanya ikut terdampak bersamaan. Masalah di satu area jarang berhenti di sana saja. Saat satu pilar kehidupanmu terguncang, jaga pilar pasangannya tetap berjalan rutin. Menjaga satu pilar tetap stabil mencegah efek domino ke area lainnya.

### Karya dan Batasan

Memutuskan untuk berhenti atau mengakhiri sesuatu terasa jauh lebih sulit bagimu daripada memulainya. Kamu bertahan di situasi yang sudah jelas selesai. Kamu memberi kesempatan lebih banyak kepada orang lain, namun hal-hal yang seharusnya sudah selesai terus menempel dan menguras energi. Batas tegas harus kamu buat dengan sengaja karena tidak akan muncul sendiri. Beranikan diri mengakhiri urusan yang menggantung lewat satu percakapan tegas. Menggantung masalah jauh lebih menguras energi dibanding ketegangan singkat saat menyelesaikannya.

Baganmu terisi oleh karya dan output. Energi mengucur lewat ide, kreasi, dan kejelian melihat ruang perbaikan. Ide dan karya mengalir tanpa henti. Kamu tak pernah kehabisan gagasan. Output-mu menguras habis input-mu. Kamu terus memberi sampai lupa mengisi ulang daya diri sendiri. Selesaikan satu tugas sepenuhnya sebelum menyentuh yang baru, dan sisihkan satu hari seminggu bebas dari target output apa pun.

### Aspek Pemijar

Di Pilar Kerja yang mencakup pekerjaan dan kariermu, kamu memiliki Aspek Pemijar (Hurting Officer). Kamu cepat melihat cara yang lebih baik dan sulit diam saat melihat hal yang tidak efisien. Mengikuti aturan yang tidak masuk akal terasa menyiksa. Kamu paling cepat menemukan celah dan paling berani menyuarakan kebenaran.

Ide yang tajam biasanya datang darimu. Kejujuranmu mahal harganya. Orang yang kamu koreksi sering mengingat rasa sakitnya, bukan kebenarannya. Tunda penyampaian kritik saat kamu emosi. Besoknya, sampaikan hanya satu poin perbaikan beserta dampaknya dengan jernih. Satu masukan yang diterima jauh lebih bernilai dibanding lima yang ditolak.

### Fondasi Pasangan

Fondasi Pasanganmu di Pilar Diri, yang mencakup kehidupan pribadi dan hubungan terdekatmu, ditempati oleh Aspek Pemikir (Indirect Resource). Kamu memahami sesuatu lewat jalan intuitif yang sulit dijelaskan. Kesimpulanmu sering benar sebelum kamu sempat membuktikannya. Kamu melihat pola yang luput dari pandangan orang lain.

Firasatmu punya dasar, meski sulit diutarakan dengan kata-kata. Kamu sering merasa berjarak dari lingkungan sekitar. Menjelaskan isi kepalamu terasa lebih melelahkan daripada memikirkannya sendiri. Kamu tidak perlu menjelaskan semua alur pikiranmu. Cukup sampaikan kesimpulannya dan satu alasan paling kuat.

### Tanda di Pilar Arah

Di Pilar Arah yang mencakup tujuan dan arah masa depanmu, terdapat Tanda Kekosongan (Void). Orang lain melihat kamu berhasil di bidang ini, tetapi kamu sendiri sering merasa belum pantas menyandangnya. Hasilnya tidak pernah kurang. Rasa memilikinya yang tidak pernah ikut hadir. Kamu tidak pernah bersandar pada keberuntungan di bidang ini. Apa pun yang kamu capai di sana, kamu bangun murni dengan kerja keras. Pengakuan orang lain tidak pernah menempel di dalam dirimu. Orang sudah menganggapmu ahli, tetapi kamu masih terus menunggu bukti berikutnya. Sebut hasil kerjamu dengan lantang, meskipun rasanya canggung.

Di pilar yang sama, terdapat juga Bintang Penolong (Nobleman). Saat kamu benar-benar jalan buntu, selalu ada orang yang muncul membantu. Sering kali orang yang tidak kamu duga dan datang di saat yang tepat. Kamu jarang benar-benar sendirian di titik tersempit. Ada jalur bantuan yang terbuka untukmu. Bantuan itu perlu kamu jemput. Kamu terbiasa menyelesaikan semuanya sendiri sampai lupa bahwa ada yang bisa dimintai bantuan. Minta bantuan lebih awal dari yang terasa nyaman. Pertolongan di baganmu ada, bentuknya menunggu diminta.

### Penutup

Kamu adalah sosok yang terus bergerak menciptakan perubahan melalui ide-ide tajam. Fokuslah pada keberanian untuk mengakhiri apa yang sudah selesai agar energimu tetap terjaga. Masa depanmu terbuka lebar selama kamu bersedia meminta bantuan saat langkah terasa berat.

---

## chart 13 — 1989-02-04 04:00

> the 立春 boundary chart, and the one Track A is expected to miss

### Real render

| | |
|---|---|
| `source` | **gemini** |
| `model` | gemini-3.1-flash-lite |
| `prompt_version` | 33fa7e882bb183bd |
| loaded prompt | 33fa7e882bb183bd |
| `stage6_version` | 1.17.0 |
| `qa_flag` | — |
| `cached` | false |
| pillars | 戊辰 乙丑 乙未 戊寅 |
| facts / required | 11 / 6 |

Attempts, in order:

1. `gemini` rejected — coverage.cost_dropped
2. `gemini` passed Stage 6

---

### Dirimu dan Keseimbangan

Kamu adalah Bambu (The Bamboo), dengan batang hari Kayu. Kamu tumbuh dengan menjangkau hal baru, dan berhenti berkembang terasa lebih buruk bagimu daripada salah arah. Kamu memiliki dorongan alami untuk maju dan memperbaiki keadaan, yang membuat orang di sekitarmu ikut terdorong oleh energimu. Namun, kamu sulit melambat, bahkan di saat tubuh dan pikiranmu sangat membutuhkan istirahat. Orang mengira kamu mudah mengikuti arus, padahal kamu hanya sedang menunggu celah, dan arah tujuanmu tidak pernah berubah.

Baganmu berdiri di titik tengah yang stabil, yang disebut Seimbang (Balanced). Kamu sanggup menopang dirimu sendiri sekaligus tetap terbuka menerima dari luar, sehingga situasi yang berubah jarang membuatmu goyah. Kamu memiliki kelenturan yang tinggi, di mana perubahan mendadak yang membuat orang lain kehilangan arah biasanya hanya menggeser langkahmu sedikit saja. Titik tengah ini tidak memberi dorongan ekstrem yang memaksa, sehingga arah hidupmu harus kamu tentukan sendiri. Tentukan satu komitmen untuk enam bulan ke depan dan tuliskan alasannya. Begitu ragu menghampiri, baca ulang catatan itu alih-alih menunggu dorongan luar.

### Dinamika Pilar Kerja dan Diri

Di Pilar Kerja dan Pilar Diri, terdapat Benturan (Clash). Pilar Kerja mencakup pekerjaan dan kariermu, sementara Pilar Diri adalah kehidupan pribadi dan hubungan terdekatmu. Benturan ini berarti dua bagian baganmu saling berhadapan langsung, sehingga perubahan di area ini biasanya datang mendadak dan membawa guncangan, bukan lewat proses perlahan. Kamu terbiasa beradaptasi dengan guncangan cepat, dan situasi sulit yang membuat orang lain panik sudah pernah kamu lewati. Ketenangan di area ini tidak datang otomatis, dan kestabilannya butuh dijaga dengan usaha yang sadar dan terus-menerus. Perlakukan dinamika di area ini sebagai dorongan untuk naik kelas. Siapkan rencana cadangan sebelum dibutuhkan agar kamu merespons dengan strategi, bukan panik.

### Pengelolaan Beban

Baganmu dipenuhi elemen Tanah yang dominan, yang berarti baganmu dipenuhi hal-hal yang menuntut pengelolaan seperti peluang, tanggung jawab, dan urusan orang lain. Kesempatan tak pernah habis di tanganmu, dan kamu selalu punya objek untuk dikelola. Namun, urusan sering melebihi kapasitas fisikmu, sehingga perhatianmu terpecah dan banyak hal terbengkalai setengah jalan. Pilih hanya tiga prioritas utama untuk kuartal ini dan parkir sisanya. Fokus selesaikan tiga hal itu sebelum menyentuh daftar tunggu.

### Aspek Peraih dalam Karier dan Hubungan

Di Pilar Kerja, kamu memiliki Aspek Peraih (Indirect Wealth). Kamu melihat peluang di tempat yang dilewati orang lain, sehingga kesempatan dan hasil terasa mudah datang, tetapi juga mudah lepas. Kamu tidak takut pada ketidakpastian dan pintu sering terbuka justru karena kamu berani mengetuk lebih dulu. Namun, yang datang besar bisa hilang besar, dan kamu jarang menyimpannya cukup lama untuk benar-benar merasa aman. Kunci dan eksekusi tuntas satu peluang di tangan sebelum mengejar yang baru, karena peluang yang setengah jalan hanya membuang energi.

Aspek ini juga menempati Fondasi Pasangan di Pilar Diri, yang merupakan tempat membaca dinamika hubungan paling dekat. Isinya menunjukkan tekstur relasi yang terasa wajar bagimu, meskipun orang lain bisa menganggapnya berat.

### Tanda Kekosongan

Di Pilar Akar yang mencakup asal-usul dan latar belakangmu, terdapat Tanda Kekosongan (Void). Orang lain melihat kamu berhasil di bidang ini, tetapi kamu sendiri sering merasa belum pantas menyandangnya. Hasilnya tidak pernah kurang, namun rasa memilikinya yang tidak pernah ikut hadir. Kamu tidak pernah bersandar pada keberuntungan di bidang ini, sehingga apa pun yang kamu capai, kamu bangun murni dengan kerja keras. Pengakuan orang lain tidak pernah menempel di dalam dirimu, dan orang sudah menganggapmu ahli, tetapi kamu masih terus menunggu bukti berikutnya. Sebut hasil kerjamu dengan lantang, meskipun rasanya canggung.

### Pola Pendamping, Pengelola, dan Pemikir

Kamu memiliki Aspek Pendamping (Friend) di Pilar Akar, Pilar Kerja, dan Pilar Diri, yang membuatmu terbiasa menyelesaikan semuanya sendiri. Meminta tolong terasa lebih berat daripada mengerjakan sesuatu dua kali lipat. Kamu tidak runtuh saat tidak ada yang menopang, namun bantuan sering datang terlambat karena kamu tidak pernah memintanya. Mintalah bantuan lebih awal sebelum situasinya makin mendesak.

Di Pilar Akar dan Pilar Arah, terdapat Aspek Pengelola (Direct Wealth). Kamu dipercaya memegang hal penting dan merawatnya dengan rapi, sehingga apa yang kamu urus jarang berantakan. Namun, semakin banyak yang kamu pegang, semakin sedikit energi yang tersisa untuk dirimu sendiri. Pilih satu tugas untuk diserahkan ke orang lain bulan ini. Berikan petunjuk yang jelas, dan biarkan hasilnya berjalan meskipun tidak serapi caramu.

Terakhir, di Pilar Akar dan Pilar Kerja terdapat Aspek Pemikir (Indirect Resource). Kamu memahami sesuatu lewat jalan intuitif yang sulit dijelaskan. Kamu melihat pola yang luput dari pandangan orang lain, namun kamu sering merasa berjarak dari lingkungan sekitar. Kamu tidak perlu menjelaskan semua alur pikiranmu, cukup sampaikan kesimpulannya dan satu alasan paling kuat.

### Penutup

Kamu adalah individu yang tangguh dan mampu menopang diri sendiri di tengah perubahan yang mendadak. Dengan keberanianmu mengejar peluang dan ketelitian dalam mengelola tanggung jawab, kamu memiliki kapasitas besar untuk terus berkembang. Percayalah pada hasil kerjamu sendiri dan jangan ragu untuk membagi beban dengan orang lain saat langkahmu terasa berat.

---

## chart 1 — 1989-09-13 09:00

> the reference chart for every card and contrast measurement

### Real render

| | |
|---|---|
| `source` | **gemini** |
| `model` | gemini-3.1-flash-lite |
| `prompt_version` | 33fa7e882bb183bd |
| loaded prompt | 33fa7e882bb183bd |
| `stage6_version` | 1.17.0 |
| `qa_flag` | — |
| `cached` | false |
| pillars | 己巳 癸酉 丙子 癸巳 |
| facts / required | 14 / 9 |

Attempts, in order:

1. `gemini` rejected — fact.condition_named **(HARD)**
2. `gemini` rejected — style.hedging, style.essay_connectives
3. `gemini` rejected — fact.condition_named, style.essay_connectives **(HARD)**
4. `gemini` passed Stage 6

---

### Matahari yang Butuh Bahan Bakar

Kamu adalah Api yang lahir sebagai Matahari (The Sun). Kehadiranmu langsung terasa sebelum kamu bicara, menerangi sekitarmu lebih dulu sebelum menghangatkan dirimu sendiri. Orang-orang berkumpul di sekitarmu tanpa perlu diundang, namun mereka sering mengira energimu tidak pernah habis. Padahal, kamu adalah Api Lemah. Lemah di sini bukan berarti tidak mampu, melainkan sumber tenagamu ada di luar dirimu. Kamu sangat peka membaca situasi dan tahu cara memanfaatkan dukungan di sekitarmu, tetapi kamu kehabisan energi lebih cepat saat salah menempatkan diri. Api selalu membutuhkan bahan bakar dari luar, dan kamu tidak bisa terus menyala hanya dari cadangan energimu sendiri.

Atur jadwal untuk mengisi energimu seserius kamu mengatur jadwal kerja. Sediakan waktu untuk bertemu orang atau mendatangi tempat yang bisa memulihkan tenagamu. Jangan tunggu sampai bateraimu benar-benar habis baru mencari cara untuk pulih. Perhatikan lingkunganmu dengan serius, bukan hanya sebagai latar belakang. Sebelum mengambil peran baru, tanya ke diri sendiri: siapa atau apa yang akan mengisi ulang energiku di sini? Kalau jawabannya tidak ada, kamu sendiri yang akan kehabisan tenaga.

### Pencapaian di Pilar Kerja

Di Pilar Kerja yang mencakup pekerjaan dan kariermu, terdapat Tanda Kekosongan (Void). Orang lain melihat kamu berhasil di bidang ini, tetapi kamu sendiri sering merasa belum pantas menyandangnya. Hasilnya tidak pernah kurang, namun rasa memilikinya yang tidak pernah ikut hadir. Kamu tidak pernah bersandar pada keberuntungan di sini, apa pun yang kamu capai kamu bangun murni dengan kerja keras. Pengakuan orang lain tidak pernah menempel di dalam dirimu, sehingga kamu masih terus menunggu bukti berikutnya. Pengakuan di bidang ini tidak akan menempel dengan sendirinya, jadi sebut hasil kerjamu dengan lantang meskipun rasanya canggung.

Di pilar yang sama, kamu juga memiliki Aspek Pengelola (Direct Wealth). Kamu dipercaya memegang hal penting dan merawatnya dengan rapi, sehingga orang merasa tenang saat kamu yang memegang kendali. Apa yang kamu urus jarang berantakan dan kepercayaan datang sendiri. Namun, semakin banyak yang kamu pegang, semakin sedikit energi yang tersisa untuk dirimu sendiri. Pilih satu tugas untuk diserahkan ke orang lain bulan ini, berikan petunjuk yang jelas, dan biarkan hasilnya berjalan meskipun tidak serapi caramu.

Selain itu, terdapat Bunga Persik (Peach Blossom) dan Bintang Penolong (Nobleman) di Pilar Kerja. Bunga Persik membuat orang mengingatmu setelah satu pertemuan tanpa kamu perlu berusaha keras, namun perhatian datang lebih cepat daripada kedekatan. Pilih beberapa orang, lalu bagikan cerita yang jujur dan luangkan waktu bersama mereka. Sementara itu, Bintang Penolong memastikan selalu ada orang yang muncul membantu saat kamu benar-benar jalan buntu. Minta bantuan lebih awal dari yang terasa nyaman, karena pertolongan di baganmu ada dan menunggu diminta.

### Rasa Hampir Pas

Pilar Akar, Pilar Kerja, dan Pilar Arah membentuk Setengah Gabungan (Half Combination). Tarikan energi ini sudah bekerja untukmu dan memberi arah yang jelas, namun karena hanya dua dari tiga bagian yang terhubung, ini terasa seperti rasa hampir pas. Semuanya sudah jalan dan arahnya jelas, tapi kamu selalu merasa harus menambah satu hal lagi sebelum berani menyebutnya selesai. Rasa belum lengkap itu hanya bagian dari polamu, bukan tanda ada yang salah. Saat muncul keinginan untuk menambah satu hal lagi, berhenti sejenak dan tanya: apakah yang ada sekarang sudah cukup untuk melangkah? Sering kali, jawabannya sudah lebih dari cukup.

### Disiplin dan Arah Gerak

Kamu memiliki kondisi tanpa unsur Kayu. Kamu jarang menunggu inspirasi dan tidak pernah gelisah tanpa alasan, sehingga kamu fokus bekerja dari apa yang ada di depan mata. Kamu mudah menyelesaikan tugas, tapi susah untuk putar arah. Jangan menunggu merasa siap untuk pindah, karena rasa itu tidak akan datang. Buat pemicu dari luar seperti memasang tanggal keputusan di kalender. Begitu tanggalnya tiba dan belum ada perubahan, langsung melangkah.

Di sisi lain, kamu memiliki Aspek Pengatur (Direct Officer) yang muncul di Pilar Kerja, Pilar Diri, dan Pilar Arah. Kamu tahu apa yang seharusnya dilakukan dan tetap menjalankannya meski tidak ada yang melihat. Orang menaruh tanggung jawab padamu sejak muda, namun tuntutan untuk selalu benar tidak pernah berhenti. Buat jadwal sendiri untuk santai tanpa tuntutan harus selalu benar, dan jaga jadwal itu seserius kamu menjaga aturan kerja. Dinamika ini juga tercermin di Fondasi Pasangan yang berada di Pilar Diri, tempat membaca kehidupan pribadi dan hubungan terdekatmu. Di sini, Aspek Pengatur menunjukkan tekstur relasi yang terasa wajar bagimu, meskipun orang lain bisa menganggapnya berat.

### Penutup

Kamu adalah pribadi yang tangguh dan disiplin, selalu menjadi sandaran bagi orang lain di sekitarmu. Kamu memiliki kapasitas besar untuk mengelola tanggung jawab, namun kini saatnya kamu mulai mengelola energimu sendiri dengan lebih baik. Kamu tidak perlu selalu menanggung semuanya sendirian untuk membuktikan nilaimu.

---

## fresh-1996 — 1996-10-02 19:20

> the Samudra opening that ranked 9th of 14 before Prompt K

### Real render

| | |
|---|---|
| `source` | **gemini** |
| `model` | gemini-3.1-flash-lite |
| `prompt_version` | 33fa7e882bb183bd |
| loaded prompt | 33fa7e882bb183bd |
| `stage6_version` | 1.17.0 |
| `qa_flag` | — |
| `cached` | false |
| pillars | 丙子 丁酉 壬申 庚戌 |
| facts / required | 14 / 9 |

Attempts, in order:

1. `gemini` rejected — fact.condition_named, coverage.field_dropped **(HARD)**
2. `gemini` rejected — coverage.cost_dropped
3. `gemini` passed Stage 6

Findings recorded on the served result:

- `opening.archetype_missing` (flag) — the reading's first sentence does not name the archetype "Samudra" (day_master_Water); it opens: "Kamu memiliki Aspek Pelindung (Direct Resource) yang menonjol di Pilar Kerja, yang mencakup area pekerjaan dan kariermu."

---

### Profil dan Kekuatan Diri

Kamu memiliki Aspek Pelindung (Direct Resource) yang menonjol di Pilar Kerja, yang mencakup area pekerjaan dan kariermu. Aspek ini menandai bahwa kamu cepat menyerap ilmu dan orang lain senang membimbingmu, sehingga bantuan sering muncul tepat pada waktunya. Kamu jarang benar-benar sendirian, namun kenyamanan dari bantuan tersebut bisa memperlambat langkahmu karena kamu sering terlalu lama bersiap sebelum mulai melangkah. Batasi masa persiapanmu dengan tanggal, bukan dengan menunggu rasa siap. Mulai saja dulu meski rasanya belum sepenuhnya siap, karena petunjuk atau bantuan berikutnya biasanya baru terlihat setelah kamu mulai melangkah.

Kekuatanmu sebagai Air (Water) yang Kuat (Strong) lahir langsung dari dalam dirimu sendiri. Kamu sanggup berjalan mandiri lebih jauh dari kebanyakan orang. Daya tahanmu nyata dan solid, di mana tekanan keras yang membuat orang lain menyerah justru bisa kamu balikkan menjadi bahan bakar untuk maju. Energi sebesar ini membutuhkan saluran yang jelas agar tidak berbalik menjadi gesekan konstan dengan orang terdekat. Alirkan energi lebihmu ke satu kegiatan fisik atau proyek intensif setiap minggu. Sebagai Samudra (The Ocean), kamu menyesuaikan diri dengan keadaan tanpa kehilangan arah tujuan. Kamu mampu menembus situasi yang buntu bagi orang lain, namun komitmen jangka panjang pada satu bentuk kaku terasa amat berat bagimu. Pegang teguh tujuan utamamu, tapi bebaskan cara mencapainya.

### Arah dan Ketegasan

Di Pilar Akar dan Pilar Diri, terdapat Setengah Gabungan (Half Combination) yang menghubungkan asal-usul dan kehidupan pribadimu. Arah geraknya sudah jelas, meski kekuatannya belum sepenuhnya padu. Ini terasa seperti rasa hampir pas, di mana semuanya sudah jalan tapi kamu selalu merasa harus menambah satu hal lagi sebelum berani menyebutnya selesai. Rasa belum lengkap itu hanya bagian dari polamu, bukan tanda ada yang salah. Saat keinginan itu muncul, tanyakan apakah yang ada sekarang sudah cukup untuk melangkah.

Di Pilar Akar, kamu juga memiliki Mata Pisau (Yang Blade). Ada titik di mana kamu berhenti menimbang dan langsung mengambil keputusan tegas. Ketegasan ini sering menyelamatkan situasi kritis, namun apa yang terputus di titik ini sulit untuk disambung kembali. Endapkan keputusan memutus hubungan atau komitmen selama semalam sebelum mengeksekusinya.

### Gesekan dan Daya Tarik

Pilar Kerja dan Pilar Arah mengalami Gesekan (Harm), yaitu masalah sepele yang menumpuk perlahan hingga terasa memberatkan. Kamu sangat peka pada detail kecil yang diabaikan orang lain, sehingga masalah jarang membesar tanpa terdeteksi olehmu. Bereskan kejanggalan kecil begitu terlihat agar tidak memicu ledakan yang tak perlu. Di Pilar Kerja, kamu juga memiliki Bunga Persik (Peach Blossom). Orang mengingatmu setelah satu pertemuan tanpa kamu perlu berusaha keras. Pintu terbuka lebih cepat untukmu karena orang penasaran ingin mengenalmu, namun perhatian datang lebih cepat daripada kedekatan. Hubungan yang dekat harus dibangun pelan-pelan dengan kehadiran yang konsisten.

### Fondasi dan Gerak

Kamu jarang menunggu inspirasi dan tidak pernah gelisah tanpa alasan. Kamu fokus bekerja dari apa yang ada di depan mata, namun susah untuk putar arah. Jangan menunggu merasa siap untuk pindah, karena rasa itu tidak akan datang. Buat pemicu dari luar seperti tanggal keputusan di kalender. Sementara itu, Fondasi Pasanganmu di Pilar Diri, yang mencakup kehidupan pribadi dan hubungan terdekatmu, ditempati oleh Aspek Pemikir (Indirect Resource). Kamu memahami sesuatu lewat jalan intuitif yang sulit dijelaskan. Kamu tidak perlu menjelaskan semua alur pikiranmu, cukup sampaikan kesimpulannya dan satu alasan paling kuat.

### Penutup

Kamu adalah individu dengan daya tahan tinggi yang mampu menembus kebuntuan melalui intuisi yang tajam. Dengan menyadari pola persiapanmu yang panjang dan gesekan kecil yang muncul, kamu bisa melangkah lebih jauh tanpa terbebani. Masa depanmu terbuka lebar selama kamu berani memulai meski tanpa rasa siap yang sempurna.

---

