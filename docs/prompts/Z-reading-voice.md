# Prompt Z: the compat reading voice - "technicality may surface, the meaning must land"

Cowork, 2026-09-10. Reyner's rulings: 2026-09-09 walk "reading quality still lacking; technicality is
okay to be surfaced, but the explanation should be very clear on the meaning"; 2026-09-09 morning
"reads like the floor". Y-2 Addendum 2 item 9 routed this here. Rule 14 unchanged throughout: the
engine owns every fact, the model chooses words. Gate changes ship isolated (STAGE6_VERSION).

## 0. Evidence (commands run 2026-09-10 against files staged from main)

**The render IS the floor.** `tests/fixtures/pair-reading-g4WH4.json` is a real Gemini render (Y-1
production, served_from cache). Stem overlap of each block against the glossary cell of its own fact,
instrument `hug.mjs` (stems > 3 letters, cell-side ratio; falsifier: an unrelated sentence scores
0.17 max, so the instrument discriminates):

    p0_opening      3/3   (1.00)             block 7w  / cell 7w
    p1_produces     8/15  (0.53)             block 17w / cell 20w
    p2_harm        16/16  (1.00) VERBATIM    block 52w / cell 19w (braided with reframe + palace)
    p3_supplies    13/13  (1.00)             block 17w / cell 16w
    p4_contrasting 16/16  (1.00)             block 26w / cell 17w
    p5_q4          15/15  (1.00) VERBATIM    block 17w / cell 17w
    penutup 31w

Five of six blocks carry every distinctive stem of their cell; two are byte-for-byte; block length
equals cell length. The gate is NOT the cause: `COVERAGE_PARAMS.fieldOverlap = 0.2, fieldMinHits = 2`
(lib/validate/coverage.js:26) asks for a fifth of the stems, not all of them.

**The input is the cause.** `glossary.json → kompatibilitas`: 25 cells, field frequency
`{label_meaning: 25, name_id: 19}` - ONE content sentence per fact. The mirror's `aspek` cells carry
`label_meaning, gift_seed, cost_seed, actionable_seed`. `docs/content/renderer-prompt-notes.md`, Run 2:
"it became transcription, concatenating the input strings verbatim. Diagnosis: over-constrained. The
renderer can only be as good as its input, and the input was conclusions with no causes." Run 3 fixed
the mirror with richer facts, not a better prompt. The compat prompt (`docs/content/compat-renderer-
prompt.txt`) even says "Each fact carries its own content strings" and "which of each fact's strings
must survive" - given one 17-word string, surviving means copying.

**Why not a prompt-only round first (Check 3, pushed back on myself).** With one sentence of input,
"explain the meaning" has two outcomes: the model transcribes anyway (nothing else to say), or it
invents the meaning - and a model deciding what a chart means is rule 14 broken by design. So the
meaning must be RULED content. The prompt still changes (section 3), but as the second half.

**Cache and the P0 caveat, resolved.** `lib/semantic/index.js:396` `cacheKey = sha256(engine_version
+ canonical(semanticJson))` - the WHOLE semantic JSON, cell strings included. So #114's template
change moved every compat cache key; Reyner's "cached" reading had in fact re-rendered once, and the
P0 line reaches readers because the model echoes the template (fixture: 1.00 overlap). Not guaranteed.
This prompt makes it engine-emitted (section 3c). Consequence to state: every ruled-cell change below
re-renders every existing paid pair once on next open (a handful today; one Gemini call each).

## 1. The content tranche (Reyner rules; the product change)

Each of the 25 `kompatibilitas` cells gains two fields, patterned on the mirror's seeds:

| field | what it is | register test |
|---|---|---|
| `meaning_seed` | what this fact means BETWEEN the two of them, in plain words a reader with no BaZi follows. The technical term may be named once; the sentence must stand without it. | Delete every BaZi word; the sentence still says something true about the pair. |
| `daily_seed` | one ordinary-week situation where this dynamic shows, written as a pattern to notice, never as a prediction (rule 25: cuaca, not ramalan). | Contains a concrete scene (a decision, a plan, a conversation, a habit), no future tense, no verdict. |

`label_meaning` stays as the technical statement (the "technicality may surface" half). `name_id`
unchanged. 25 x 2 = 50 strings. Flow = skill section 6, the tranche flow, because this IS a tranche:
Cowork drafts the worksheet patterned on `compat-glossary-rulings-RULED-2026-09-08`; Reyner rewrites
in his voice; Cowork sweeps (style.js:64 compile, 70 patterns, falsifiers 4/4; plus 3-gram overlap
across all 50 and against every existing label_meaning - two cells sharing a sentence has shipped
before); rulings file lands on main ALONE; Code applies with `scripts/apply-rulings.mjs --expect 50`.

Cells whose fact is direction-neutral (p1_produces, p1_controls, p3_supplies) keep the mirror's
convention: the seed names roles, the renderer names who from provenance. Cowork drafts these with
"yang satu / yang lain", not A/B.

## 2. Measurement harness (Code, before and after; same instrument, shown failing first)

`scripts/measure-compat-voice.mjs`: for N pairs (N = 10; reuse the Y-1 fixture pair plus nine
synthetic pairs covering all four p5 quadrants, all three p4 patterns, at least one p2_harm and one
p2_clash - Code picks dates, lists them in the script), run the render chain once per pair and report
per block: cell-stem overlap (the `hug.mjs` method, copied not reconstructed), block words / cell
words, verbatim yes/no; plus floor rate (renders that fell to module assembly) and Stage 6 findings by
check id. Falsify the instrument: feed it the floor for one pair and expect 1.00 everywhere; feed it
an unrelated paragraph and expect < 0.2. Print both before trusting a number.

Baseline = current prompt + current cells. Cost: 10 renders. The fixture's own numbers above are the
first row.

## 3. The prompt change (Code applies; Cowork drafts; Reyner may amend the voice paragraph)

`docs/content/compat-renderer-prompt.txt`, one commit, `prompt_version` bumped:

a. Replace "Each fact carries its own content strings ... which of each fact's strings must survive
   into the prose" with a description of the THREE fields and what each is FOR: `label_meaning` is the
   chart fact and may keep its term; `meaning_seed` is what it means between these two people and is
   the sentence the reader must be able to repeat to a friend; `daily_seed` is the scene that makes it
   recognisable. A block carries all three, in that order, in the model's own words. "Survive" is
   about the IDEA, never the wording: reproducing a field verbatim is a failure of the block.
b. Give room: "A block with importance above the median runs to what the three fields need, usually
   three to five sentences. Short is not a virtue here; a block that only restates its fact has not
   done its job." (Length is a structural allowance, not a fact - the model may use it.)
c. **P0 is engine-emitted.** `lib/semantic/pair.js` marks `p0_opening` as `rendered_by: 'engine'`;
   `serveReading` emits block 0 from the template itself and the model receives facts[] WITHOUT p0
   and an instruction: "The opening sentence is already written and names both people. Your first
   block is P1. Do not name the two archetypes again in a first sentence of your own." `pair.both_named`
   then validates the engine line (trivially true) - if it must keep validating model prose, say so
   and STOP: that is a gate change and ships alone with a STAGE6_VERSION bump. Rule 14: the opening
   is structure, and a model paraphrase can recreate "three people" on any chart.
d. Voice paragraph, Cowork draft for Reyner to amend (rule 20 applies, one voice): "Tulis seperti
   menjelaskan pada teman yang tidak tahu BaZi: sebut istilahnya, lalu langsung katakan artinya untuk
   mereka berdua, lalu tunjukkan di mana itu terasa dalam seminggu biasa." - swept before it ships.

## 4. Re-measure and walk (round 1 of 2, cap)

Same harness, same 10 pairs, new cells + new prompt. Expected direction: median cell overlap falls
well under 1.00 (the seeds give the model something else to say), block/cell word ratio rises, floor
rate not materially above baseline. Report the distribution, not a pass/fail. Then Reyner reads THREE
pairs side by side: floor / old render / new render - his verdict is the gate, the numbers only say
whether the change did anything. If the verdict is "still the floor", round 2 is a prompt-only
adjustment on the same cells; if round 2 fails, park with what is unguarded. No round 3.

## 5. What this delays and what it buys (Check 4)

Delays Y-3 (PDF, release precondition) by the tranche's ruling time - Reyner's 50 strings are the
critical path, not Code. Buys the only thing a paying reader receives: a reading that explains itself.
Everything else shipped this week is chrome around this.

## Sequence (paste-ready)
1. Cowork: worksheet `docs/content/compat-seeds-worksheet.md`, 50 drafts, swept. -> Reyner rules.
2. Cowork: sweep his rulings, `compat-seeds-rulings.md` -> Code lands it on main alone.
3. Code: harness (section 2) with baseline run, commit alone.
4. Code: apply rulings (`--expect 50`), prompt change (section 3a-b, d), P0 engine-emitted (3c) as
   its own commit; STOP if 3c touches the gate.
5. Code: after-run (section 4); Reyner: three-pair walk; ruling.
