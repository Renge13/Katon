## READ THIS FIRST, THEN THE PROSE

**The worked example did its job and then did too much of it.** Round 2 put one
RULED block in the prompt (B3) because prohibition without demonstration had not
worked. The model learned the move: the direction is resolved, the reader is
`kamu`, the daily beat is a scene. It also learned the sentences.

Measured on the instrument B3 asked for
(`node scripts/count-seed-runs.mjs --prose <this file> --column "round 2"`):

| | round 1 | round 2 | target |
|---|---|---|---|
| ruled seeds with their first nine words verbatim | 13/42 | **9/42** | <= 3/42 |
| nine-word runs from the B3 example reproduced | 0 | **38** | 0 |

**Compare the `p1_stem_relation` block of 1x2 and of Y-1 below. They are word for
word the same block**, and both are the prompt's example with the element names
swapped. Two different pairs, one sentence. That is not a reading.

One draw of Y-1 floored and was drawn again; both are below. The seed figure sat at 7/42 and 9/42 across three runs of this page, so treat it as "down from 13, nowhere near 3". The 38 held across all three, so it is the prompt and not a draw.

**The round-1 figure that was published was 10/42 and it is wrong.** It was
computed ad hoc and never committed; the counting is written down now and gives
13/42 normalised, 8/42 as a raw substring, and no rule tried returns 10. The
round-1 artifact is NOT re-stamped - it records what was measured. The direction
of the round-1 finding is unchanged and slightly stronger.

## WHAT ELSE THE RUN SAYS (n=20, two draws, `2026-09-13-compat-voice-round2b-*`)

Won, cleanly:

- `p0_model_wrote_anyway` **0/20 attempts**. Told not to write an opening, the
  model never wrote one. 3c's prompt half holds without the engine having to
  argue with it.
- `pair.penutup_register` **2/20 served readings**. Both round-1 penutups in the
  v1 walk would have fired; the closings now talk to the reader.
- `pair.direction_resolved` **3/20 served readings**. Round 1 lost the direction
  in 3 of 3 direction-carrying blocks.

Lost:

- **Floor rate 5/20** (4/10 then 1/10), against 3/10 at round 1 and 1/10 at
  baseline. B4's target was <= 1/20. Every floored pair spent its whole budget
  (`stage6_budget_spent`); none was a provider or spend-guard floor.
- `style.hedging` is in almost every one, and the literal is `cenderung`, in the
  MEANING sentence rather than the daily beat. B4's line is scoped to the daily
  beat, so it was pointed at the wrong sentence. The seeds are not the source: a
  sweep of all 67 ruled compat strings against the 70 live patterns returns one
  hit, the `{` in the opening template, which `sweepableGlossary()` handles.
- `style.hedge_construction` fires on `bukan vonis ..., melainkan ...` - which is
  the P2 reframe idea said in the banned shape. **This is not round 2's and it is
  not new.** The prompt's own P2 line ("A clash is never a verdict. It is a map
  ... not a judgment on it") asks for the meaning that most naturally lands as
  `bukan X melainkan Y`. Recorded as a standing conflict between a ruled
  requirement and a live pattern, for its own ruling.

## ONE DEFECT IN THIS PR WAS CAUGHT AND FIXED BEFORE THIS RUN

The first walk-v2 run rejected `style.unsanctioned_bracket` on 3 of 3 pairs:
`(Gunung)`, `(Samudra)`, `(Taman)`. The cause was round 2's own B2 text, which
told the model to write `dia (Taman)` - a bracket around a name, which rule 23
reserves for the English pair of a glossary term. The instruction asked for a
construction the gate rejects. Fixed to apposition (`dia, Taman,`); the bracket
appears in neither post-fix draw. Prompt `0bab7b55609aa60f` ->
`6e7b2997b97c40a3`, and the three pre-fix draws are kept and indexed as what
they are.

## WHAT THIS DOES NOT ESTABLISH

The floor and baseline columns are not re-rendered here - they are in v1 and
neither has moved. A difference between the two columns below is round 2 plus one
draw of variance, on three pairs; the rates above come from the n=20 run, not
from this page. No round-2 draw on these three pairs floored, so the floor rate
in the rates section is not visible in the prose.
