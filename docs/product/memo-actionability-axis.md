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

## What I would want to know before deciding

Whether the reading order is meant to be **stable across content edits**. Prompt K established that
the ENGINE owns order (rule 14). If order is engine-owned, then content authoring changing it is a
category error and B follows almost automatically. If order is allowed to reflect content richness,
A is defensible and the churn is the price.

That is a product question about what the ordering means, not a tuning question, which is why this
is a memo and not a PR.

## Constraint on whatever is chosen

Rule 13: this is one term, and it gets one measurement of its own. It must not ride with a tranche,
and the harness cannot currently settle it anyway - see the 08-11 baseline row in PROGRESS, where
identical configurations scored 88.5% and 94.6%. **The metric for this change is fact order and
cache-key movement, both of which are deterministic and free to measure**, not a pass rate. Order is
the thing that moved and order is the thing to check.
