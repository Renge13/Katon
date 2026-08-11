<!--
STATUS: OPTIONS MEMO. Written 2026-08-11 by Claude Code. NOT a decision and NOT implemented.
The decision is Reyner's. HIERARCHY_PARAMS was not touched; rule 13 forbids fitting it here anyway.
ORIGIN: tranche-1 content pass (PR #22) re-ranked fact order on 11 of 13 charts.
-->

# Memo: the actionability axis

## What happened

`HIERARCHY_PARAMS.weight.actionability` is **10**, and `actionabilityOf` returns 100 or 0 - a binary
+10 to a fact's importance for carrying an `actionable` string. Tranche 1 added `actionable_seed` to
nine glossary cells. **Fact order changed on 11 of 13 charts**, and all 13 cache keys moved.

Nothing about those charts changed. No new fact, no new calculation, no scoring change. The only
thing that moved is which cells Reyner has written an actionable for.

## The structural problem, stated plainly

```
cells carrying actionable_seed     before tranche 1:  4 / 37  (11%)
                                   after  tranche 1: 13 / 37  (35%)
facts carrying actionable          before:  17 / 156 (11%)
                                   after :  66 / 156 (42%)
```

**The axis's discriminating power is a function of how far through the content pass we are, and it
goes to zero when the pass finishes.** At 11% coverage it separated 17 facts from 139. Today it
separates 66 from 90. At 100% - which is the stated goal of step 2 - it awards +10 to every fact and
ranks nothing at all.

So the axis is not currently measuring "this fact is actionable". It is measuring **"Reyner has
gotten to this cell"**, and it will keep reshuffling every chart's reading order on every tranche
until it finally means nothing. Every tranche between here and there moves all 13 cache keys and
re-ranks most charts, and none of that churn carries information about the charts.

This is worth separating from the ordinary "content changes move cache keys" fact, which is expected
and free. Cache-key movement is harmless. **Order movement is not**, because order is what the
reader experiences and what Prompt K just spent a session fixing.

## Options

### A. Leave it

- **Blast radius:** every remaining tranche re-ranks most charts. At completion the axis is a
  uniform +10, i.e. a no-op with a misleading name, and the four axes become three.
- **Argument for:** it is honest about the current state, costs nothing to do, and rule 13 says do
  not fit a term while another change is in flight. The churn is transitional and self-cancelling.
- **Argument against:** "self-cancelling" is only true if step 2 reaches every cell. If it stalls at
  70%, the axis permanently encodes authoring progress as if it were chart meaning.

### B. Drop actionability from ranking; keep `actionable` in the payload

The field still reaches the renderer and still appears in `must_cover`. It simply stops contributing
to `importance`.

- **Blast radius:** one-time re-rank on the charts that currently get the bonus (66 facts), then
  stable forever regardless of how many tranches land. Ranking returns to the three axes D2 actually
  specifies - extremity, convergence, tension - plus the spine base.
- **Argument for:** it is the only option under which content authoring stops perturbing reading
  order. It also matches what the axis was for: D2 lists actionability as a tiebreak-sized term
  ("binary bonus, deliberately small"), and a term that will be uniform at completion is not a
  ranking signal.
- **Argument against:** an actionable fact genuinely is more useful to a reader, and there is an
  argument that it should outrank an equally-extreme fact with nothing to do about it. Dropping it
  gives that up permanently.

### C. Cap or grade it

- **Graded** needs a per-cell quality signal, and none exists. Inventing one means the engine
  scoring content quality, which is authoring by another name. Not recommended.
- **Capped** - e.g. the bonus applies only to the top N facts, or only breaks ties within one
  importance band - keeps a preference for actionable facts without letting it reorder across bands.
  A pure tiebreak (`a.importance === b.importance` -> prefer actionable) is the smallest version and
  would have caused **zero** of the 11 re-ranks, since those crossed bands.
- **Blast radius:** small and bounded; needs a measurement of its own under rule 13.
- **Argument against:** it is a new mechanism, and the honest reason to reach for it is discomfort
  with B rather than evidence that ties are common.

## DECIDED 2026-08-11 (Reyner): option D — engine-side declaration

> Rule 14 governs: the engine owns order, so order must be a function of the chart, not of which
> prose has been authored yet. Actionability moves to an engine-side declaration, a property of the
> fact or domain, not inferred from the presence of `actionable_seed`.

This is a fourth option, and it is better than the three below because it fixes the INPUT rather
than the weight. A, B and C all argue about what to do with a signal that is measuring the wrong
thing. D makes the signal measure the right thing, after which the graded-vs-binary question can be
asked honestly - and it is deliberately deferred until then.

### What declares it, and where

`lib/semantic/facts.js`, at emission, one boolean per fact. Not `hierarchy.js`: the hierarchy scores
facts and must not also decide what they are, and not the glossary, because the glossary is content
and the whole point is to stop content deciding order.

The field split matters, because `actionable` currently means two things at once:

| field | what it is | who reads it |
|---|---|---|
| `actionable` | the PROSE, from `actionable_seed` | renderer, `must_cover` |
| `actionability` **(new)** | a BOOLEAN the engine declares | `actionabilityOf` in `hierarchy.js` |

`contentFrom` keeps mapping `actionable_seed -> actionable` untouched, so the renderer contract and
`must_cover` do not move. `actionabilityOf` changes from `fact.actionable ? 100 : 0` to
`fact.actionability ? 100 : 0` - one expression.

**What the declaration keys on is the open question, and it is Reyner's.** The cheapest defensible
version is by `provenance.kind`: a missing element, a badge, a branch relation and a strength
verdict are all things a reader can act on; a Day Master is not, because it is a description of who
she is rather than a lever. That yields a table of ~10 entries next to `FACT_GATES`. The alternative
- per-fact, decided at each `fact({...})` call - is more granular and more places to get it wrong.
I would start with `provenance.kind` and let a later tranche argue for exceptions.

### Migration path for the 11 existing seeds

**None of them move, and no glossary edit is needed.** That is the point of the split: the seeds are
prose, and prose stops being a ranking input. Concretely:

1. Land the declaration with every fact declared `actionability: false` — a pure no-op that changes
   no ordering and no cache key. This is the refactor, and it is separately revertable.
2. Land the declaration's VALUES as their own commit, with the one-time re-rank that implies. This
   is the only step that moves order, and it is measured on order, not on a pass rate.
3. Tranches 2..N then add prose freely. Order does not move again, ever, for a content reason.

Splitting 1 and 2 matters because it separates "the mechanism changed" from "the ranking changed",
which is rule 13 applied to a refactor rather than to a fitted constant.

### Does ranking become stable across content edits

**Yes, completely, and that is the test of whether this worked.** After step 3 above, adding or
removing an `actionable_seed` cannot change `importance`, cannot change fact order, and cannot
change `required_points` order. It still changes the cache key - the prose is in the JSON - and that
remains expected and free.

The stability is verifiable without a provider: emit the semantic JSON for all 13 fixture charts
before and after a content edit and diff the fact-id order. Under D that diff is empty by
construction. A test asserting it belongs with the declaration.

### What breaks in #22

Nothing new breaks, and **two of the three "stale" failures stop being stale**:

- `stage3-hierarchy` chart-1 rank correlation (rho 0.81 -> 0.73) and `stage3-contract` chart-1
  `required_points` order both currently fail BECAUSE the tranche re-ranked. Under D the tranche
  stops re-ranking, so both revert to their committed expectations and need no edit. Whether they
  move again depends entirely on step 2's declared values - which is correct, because that is an
  engine change and those tests exist to notice engine changes.
- The collapse-record order failure is the same story.
- The floor-passes-its-own-gate failure is UNAFFECTED. It is about content tripping style and fact
  checks, not about ranking, and #24 plus #25 are what address it.
- The stage5/mirror knock-on is unaffected for the same reason.

So the sequencing that minimises churn is: land D's refactor and values on main first, then rebase
#22 onto it. #22's diff then becomes what it always should have been - a content change that changes
content.

### Cost against A, B and C

| | order stable? | glossary churn | engine change | what it costs |
|---|---|---|---|---|
| A leave | no, every tranche | none | none | order keeps tracking authoring progress; axis is a no-op at 100% |
| B drop from ranking | yes | none | one line | gives up the preference for actionable facts permanently |
| C cap to tiebreak | mostly | none | small + a measurement | keeps a weak preference; new mechanism fitted to no evidence |
| **D declare (chosen)** | **yes** | **none** | **two commits + a table** | **the declaration table is a judgment call that has to be made once, explicitly** |

D costs more than B by exactly one thing: someone must decide which fact kinds are actionable, and
be wrong about some of them. B avoids that by giving up the signal. D is the better trade if the
signal is worth anything at all — and D2 thought it was, which is why the axis exists.

## The question that decided it — ANSWERED

Whether the reading order is meant to be **stable across content edits**. Prompt K established that
the ENGINE owns order (rule 14). Reyner's answer, 2026-08-11: it is, and content authoring moving it
is a category error. That ruling is what selects D over A and C, and what makes B's give-up
unnecessary.

## Constraint on whatever is chosen

Rule 13: this is one term, and it gets one measurement of its own. It must not ride with a tranche,
and the harness cannot currently settle it anyway - see the 08-11 baseline row in PROGRESS, where
identical configurations scored 88.5% and 94.6%. **The metric for this change is fact order and
cache-key movement, both of which are deterministic and free to measure**, not a pass rate. Order is
the thing that moved and order is the thing to check.
