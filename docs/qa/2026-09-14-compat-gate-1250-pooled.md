# The n=20 on gate 1.25.0 — did the pair exemption move the number it was ruled to move?

Z-close section 3 (`docs/prompts/Z-close-2026-09-13.md`). Two draws of the ten
fixture pairs, same harness, gate **1.25.0**, prompt **unchanged** at
`6e7b2997b97c40a3`. The draws are
[`2026-09-14-compat-gate-1250-draw1.md`](2026-09-14-compat-gate-1250-draw1.md) and
[`2026-09-14-compat-gate-1250-draw2.md`](2026-09-14-compat-gate-1250-draw2.md); this
file pools them and nothing more. **No prompt edit follows from it. It is a record.**

---

## THE ANSWER, WITH FIXED DENOMINATORS

| | gate 1.24.0 (round 2, n=20) | gate 1.25.0 (this run, n=20) |
|---|---|---|
| floor rate, overall | **5/20** (4/10 then 1/10) | **2/20** (1/10 then 1/10) |
| floor rate, pairs carrying `p2_reframe` | Y-1 floored **3 of 4** draws | **1/8** |
| `style.hedge_construction` rejections | the visible literal on **every** clash-pair floor | **0** across 20 readings / 31 attempts |

The four `p2_reframe` pairs are fixed and named in both draws, so the 1/8 denominator
is the same eight readings each time: `2x6` (`p2_clash`), `1x12` (`p2_punishment`),
`2x8` (`p2_punishment`), `Y-1 fixture` (`p2_harm`).

**`style.hedge_construction` does not appear once.** That is the exemption doing
exactly and only what R2-SCOPE describes, and it is the whole claim this run supports.

**The one `p2_reframe` floor is not the check that was exempted.** `2x6` floored in
draw 2 on `style.hedging` + `style.essay_connectives`, `stage6_budget_spent`. The
clash-pair reader is no longer the reader most likely to be handed the floor; she is
now as likely as anyone else, which is what R2's fourth check said the change buys.

### What this run does NOT establish

Two draws of ten. A 5/20 to 2/20 move is inside what this harness has shown draw
variance to do on its own (round 2 alone ran 4/10 then 1/10 on one unchanged prompt).
**The defensible claim is the zero, not the delta**: a rejection class that was the
visible cause on every clash-pair floor is gone, and the pooled rate did not rise.

---

## `style.hedging`: WHERE `cenderung` ACTUALLY LANDS

Z-close section 3 asked for this because two accounts of it disagreed. The round-2
report said the **meaning** sentence; Z-close said all three walk literals were the
`p2_reframe` **daily** seed. This run attributes every rejecting literal by content,
so the question is answered with a ratio rather than an eye.

| literal | pair | closest cell | ratio |
|---|---|---|---|
| `gesekan cenderung dipendam sampai menjadi percikan` | 2x6 (x3), Y-1 | `p2_reframe.daily_seed` | **1.00**, 1.00, 1.00, 0.60 |
| `kalian cenderung memakai/menggunakan strategi bertahan` | 1x3 (x2), 1x101 (x3) | `p1_stem_relation.daily_seed` | 1.00, 0.57, 0.57, 0.57, 0.50 |
| `kalian yang cenderung berjalan sendiri` | 3x7 | unresolved | - |

**Z-close was right about the field and incomplete about the fact.** Both literals sit
in a DAILY seed sentence, never a meaning one - but there are **two** of them, and the
second is `p1_stem_relation`, which no previous report named. The round-2 report's
"meaning sentence" is wrong.

**AND THE SEEDS ARE CLEAN, which is the part a ratio of 1.00 could easily be misread
as.** A 1.00 means the sentence carries every distinctive stem of the seed, not that
the seed contains the banned word. Neither does:

```
p2_reframe.daily_seed
  "Saat kesadaran tinggi, gesekan langsung dibahas hari itu juga.
   Saat lelah, gesekan dipendam sampai menjadi percikan yang lebih besar."
p1_stem_relation.daily_seed
  "Satu orang rutin mengingatkan jadwal atau janji. ..."
  -> carries `cenderung`: false, both
```

So the shape is: **the model transcribes the daily seed and inserts `cenderung` into
it.** This is not the gate punishing the renderer for obeying - the 24 compat cells
were swept and three `cenderung` were amended out before they shipped
(`docs/content/compat-glossary-rulings.md:3`). The word is the model's.

Per Z-close section 5 this stays a **logged observation**. No prompt edit here.

---

## THE INSTRUMENT, AND THE VERSION OF IT THAT WAS WRONG

The attribution above is new, so it is shown able to fail before its numbers are
quoted. `--falsify` spends nothing and refuses the run if any control misses:

```
$ node --conditions=react-server scripts/measure-compat-voice.mjs --falsify
  a cell against itself      1.00   (expect 1.00)
  a cell against an unrelated paragraph  0.00   (expect < 0.20)
  attribution, a transcribed seed         -> p2_day_pair.daily_seed 1.00
  attribution, a literal not in the prose -> not found in this attempt
  attribution, the model's own sentence   -> THE MODEL'S OWN PROSE (0.00 against every cell)
  -> attribution DISCRIMINATES
```

Breaking `quoted()` on purpose turns all three rows into `no literal in the message`
and the script prints `IS BLIND; refusing to report literals`, so the control is not
decorative.

**THE FIRST VERSION OF THIS ATTRIBUTION WAS WRONG AND IT WAS CONFIDENT, and the run it
produced was discarded rather than published.** It mapped a literal to a BLOCK by
position: split the attempt prose on blank lines, take the chunk containing the
excerpt, read the block at that index. Its controls passed. Its output named
`p0_opening` as the carrier of `kalian cenderung memakai strategi bertahan` - a
sentence the engine-injected opening cannot contain, since that block is
`Ini adalah bacaan tentang dua individu: X dan Y.` and nothing else.

One probe render settled it:

```
SERVED BLOCKS: 6        ATTEMPT 0 chunks: 8
  [2] p2_day_pair+p2_reframe+p2_palace_frame   <- written as TWO paragraphs, [2] and [3]
```

**A prose chunk index is not a block index**, and a chunk count that happens to match
is not evidence that the order does. The positional claim was deleted rather than
patched, because the question actually being asked - did the model write this word or
transcribe it - needs no map. What survives is a content match, and it is labelled as
one in the artifact header so nobody reads a block name into it.

Cost of the correction: one probe render and a second n=20. The first run's floor
rates were not wrong, but they are not published, because an artifact that is right in
one table and unsound in the next is the citation problem `check:qa` exists for.

---

## HONEST LIMITS OF THE LITERAL TABLE

- **6 of 20 literals read `not found in this attempt`.** The excerpt is recovered from
  the finding message and matched against the attempt prose; a literal that spans a
  sentence boundary, or one from an attempt whose prose was not captured, does not
  resolve. It is reported as unresolved rather than assigned to the nearest cell.
- The ratio is `stemOverlap(cell, sentence)` - the fraction of the CELL's distinctive
  stems present in the sentence. It answers "is this the cell's content", not "is this
  the cell's wording".
- Ten fixture pairs, two draws. Same pairs as every compat run since 2026-09-08, so
  these rates are comparable to those and to nothing else.

---

## RAW

| | draw 1 | draw 2 |
|---|---|---|
| floors | 1/10 (`1x101`, `stage6_budget_spent`) | 1/10 (`2x6`, `stage6_budget_spent`) |
| `p2_reframe` floors | 0/4 | 1/4 |
| readings carrying a log-only flag | 1/10 | 4/10 |
| `pair.penutup_register` | 1 | 3 |
| `pair.direction_resolved` | 0 | 1 |
| `p0_model_wrote_anyway` | 0 | 0 |

`p0_model_wrote_anyway` is 0/20 for the second run in a row, so the engine-emitted
opening (gate 1.24.0) is holding.
