<!--
STATUS: AUDIT. NOTHING HERE IS A CHANGE. Reyner rules each row; only then does
anything move. Ordered by evidence, not by how bad it looks.
-->

# Renderer prompt — ambiguity audit, 2026-08-22

Commissioned by Reyner after three floor causes in one day turned out to be the prompt
being readable two ways rather than the model being careless:

- the **hour branch** — the prompt described only `hour_known: false` and handed the
  model the sentence, which it then wrote on an hour-bearing chart (`1977a2c`)
- the **verbatim-copy leak** — "Every fact carries `label_bracket` ... COPY THAT STRING
  VERBATIM" told the model to write the exact strings a paragraph three lines below
  forbids. 48 of 56 `fact.condition_named` firings (`38e19e6`, fixed in `6ba3e72`)
- the **opening-versus-importance scoping** — below, row 1. Not yet fixed.

Read adversarially: looking for instructions that **conflict**, that **under-scope**, or
that **assert something about the payload or the validator that is not true**. Every
code claim carries the command that produced it, per repo convention.

`docs/content/renderer-prompt.txt` is 289 lines at `PROMPT_VERSION e5cecda4617491e1`.

---

## Rank 1 — CONFLICT: the opening is fixed, and the model is also told to lead with the highest importance

```
:27  facts[] opens with three facts ... They come first, ahead of every other fact
:33  Lead them with the highest-importance fact unless a different order genuinely
     serves this chart better. If you start elsewhere, the highest-importance fact
     must still get the most room.
```

Line 33 says "them", meaning the remaining facts. Nothing in the sentence carries that
scope — it reads as a rule about the document. And the escape hatch ("unless a different
order genuinely serves this chart better", "if you start elsewhere") explicitly licenses
starting somewhere else, with no carve-out for the opening three.

**This is the fresh-1996 failure and it has a mechanism.** The day master's importance is
**55 on all four charts**, and on fresh-1996 it ranks **last of 9 required points**:

```
$ node --conditions=react-server -e "...buildSemanticJson..."   # 2026-08-22
chart 5      day master rank 5 of 7   top point relation_六合_寅亥  "Ikatan"    78
chart 13     day master rank 4 of 6   top point relation_冲_丑未   "Benturan"  77
chart 1      day master rank 9 of 9   top point void_stack_month  "Tanda Kekosongan" 100
fresh-1996   day master rank 9 of 9   top point profile_vs_favorable "Aspek Pelindung" 85
```

A model obeying line 33 leads with the 85 and buries the 55. `opening.archetype_missing`
fires **10/10** on fresh-1996 and **0/9** on chart 13.

**But the discriminator is NOT "something outranks the day master" — see row 2.**

Two rules, overlapping scopes, and the higher-numbered one is the one with a stated
exception. Nothing tells the model which wins.

## Rank 2 — REFUTES A PROPOSED FIX: it is not outranking, it is the KIND of fact on top

Reyner's reading was: the two charts that flag have an Aspek as the top required point;
the two that don't have a branch relation. **Chart 1 refutes the premise.** Its top
required point is `void_stack_month` at **100**, not `profile_vs_favorable` at 85 — and
on the 22 stored chart-1 proses it opens on the day master **21 times**:

```
$ node ... over docs/qa/2026-08-18-retry-depth.json   # 2026-08-22, 77 stored proses
chart 5      opening names day master 22/22
chart 13     opening names day master 18/18
chart 1      opening names day master 21/22   (1 x void_stack_month "Tanda Kekosongan")
fresh-1996   opening names Aspek Pelindung 12/15,  day master 3/15
```

So being outranked does not move the opening — chart 1 is outranked by **100 versus 55**
and still opens on itself. What moves it is an **Aspek** on top, which is the half of
Reyner's reasoning that survives: an Aspek has a name a sentence can be built around, and
a branch relation and a void stack do not.

**A second hypothesis fits the same four points and separates them exactly:** the day
master ranks **last** on both charts that flag and **mid-table** on the two that do not.
n=4 charts; both hypotheses fit. Neither is confirmable at this n.

**AND THE FLAG CONFLATES TWO DIFFERENT FAILURES,** which matters before anything is
written into the prompt:

```
$ node ... first sentence of each stored prose        # 2026-08-22
chart 13   names the ELEMENT 18/18, names the ARCHETYPE 0/18   <- opened on itself, wrong name
fresh-1996 names NEITHER 12/15                                 <- opened on something else
```

Chart 13's was a naming slip inside a correct opening, and `must_cover: 'archetype'`
closed it (0/9 today). fresh-1996's is taxonomy-first and is untouched at 10/10. One flag,
two defects, one of them already fixed.

## Rank 3 — CONTRADICTION: "never copy from provenance fields" versus "use provenance.positions_id VERBATIM"

```
:11  Never copy hanzi or English tokens from provenance fields into prose.
:113 The span is already written for you: use `provenance.positions_id` VERBATIM.
     Copy it exactly and do not shorten it, reorder it, or rebuild it from
     `provenance.positions`.
```

`positions_id` **is** a provenance field. The first rule is about hanzi and English tokens
and the second is about an Indonesian string, so the two are reconcilable — by a reader who
notices that the first rule's object is narrower than its subject. Nothing says so.

There is a third instance of the same fault line at `:9`: "Do NOT copy them verbatim
either. Rewrite them so they flow" — about engine-authored strings, which `label_bracket`
and `positions_id` both are. **The prompt bans verbatim copying in general and mandates it
in three specific places, and never states the distinction it is relying on** (substance
strings get rewritten, citation strings get copied). This is the exact fault line the
`label_bracket` leak fell through, and it has two more live edges.

## Rank 4 — ASSERTS SOMETHING FALSE ABOUT THE VALIDATOR

```
:37  The validator downstream checks content coverage, never structure. Past the
     opening three you will never be penalised for an unusual order.
```

Not true, and not marginally:

```
$ grep -rno "finding('[a-z_.]*'" lib/validate/*.js | sed ... | sort -u    # 2026-08-22
structure.block_too_short  structure.duplicate_sentence  structure.length
structure.stray_newline    structure.too_many_breaks     structure.unparagraphed
$ grep -rno "check: '[a-z_.]*'" lib/validate/*.js | ...
opening.archetype_missing  opening.element_fused  brackets.inserted  brackets.normalised
```

Six structural checks and two positional ones. `structure.unparagraphed` has rejected
**73.9%** of gate evaluations at one point (its own docblock records it). The prompt is
telling the model it cannot be rejected for shape, in a document whose next section
prescribes shape in detail. This is a promise the gate does not keep.

## Rank 5 — CONTRADICTION: "do not write section headings" versus the schema's `heading` field

```
:39  Do not write section headings. Do not number your points.
:273 heading is a short label for the block, 2 to 5 words, in the target language.
     Plain words, no BaZi jargon in the heading itself.
```

A flat contradiction, resolved only by knowing that `:39` means "do not write headings
INSIDE `text`". Two of `:273`'s own constraints are then observed broken in the current
artifact, and neither is gated:

```
$ grep -h "^### " docs/qa/2026-08-22-renders-n10-budget3.md | ... | awk '{print NF-1}'
2 words: 4   3 words: 7   4 words: 5   5 words: 3   6 words: 1
$ grep -n "^### " docs/qa/2026-08-22-renders-n10-budget3.md
Aspek Pemijar · Aspek Peraih dalam Karier dan Hubungan · Tanda Kekosongan ·
Fondasi Pasangan · Ikatan Pilar Kehidupan · Pola Pendamping, Pengelola, dan Pemikir
```

One heading over the word limit, six carrying BaZi jargon. **And headings are invisible to
every check** — `renderedProse` excludes them from bracket-once by ruling, and
`openingGuard` excludes them from the opening haystack by ruling. Both exclusions are
right for what they were for. Together they mean `:273` has no enforcement anywhere.

## Rank 6 — UNDER-SCOPE: cut the low-importance facts, and also cover every required point

```
:7   Low-importance facts get a clause or get cut.
:17  required_points[] is the content that MUST appear.
:289 Cover every required_point somewhere in blocks.
:197 Only the highest-importance facts earn all three beats and full room. Lower-
     importance facts get a clause folded into a neighbouring block, or get cut.
```

Nothing says a required point may never be cut, and the lowest-importance required point
on every one of the four charts is **the day master at 55**:

```
$ node ... required_point importance range      # 2026-08-22
chart 5 lowest 55 (day_master_Fire) / highest 78      chart 13 lowest 55 / highest 77
chart 1 lowest 55 (day_master_Fire) / highest 100     fresh-1996 lowest 55 / highest 85
```

So the instruction to cut low-importance facts points, on all four charts, at the one fact
the reading exists to deliver. This is rank 1 read from the other side, and it is a
candidate cause for `coverage.cost_dropped` (8 firings inside floored runs) and
`coverage.field_dropped` (6) — the second and third floor causes today.

## Rank 7 — THE PROMPT IS STRICTER THAN THE GATE, on hedging

```
:242 Hedging words inside a claim: mungkin, agak, cenderung, sepertinya
```

`style.hedging` was deliberately split so `mungkin` fires on the reader and not on a third
party (`docs/qa/`, 08-17). The prompt bans the word outright. Not a floor cause and not
wrong, but an instruction that over-bans spends the model's attention on sentences the gate
would have accepted, and it will read as a contradiction to anyone comparing the two.

## Rank 8 — KNOWN, ALREADY IN THE DEFERRED REGISTER

```
:223 Timing is cuaca, never ramalan.
```

`blocklist.json` bans `\bramalan\b` HARD. The prompt teaches the banned token while banning
the concept. Listed for completeness; PROGRESS already carries it with an owner.

## Rank 9 — REDUNDANCY THAT INVITES DIVERGENCE

The output JSON skeleton appears **twice, verbatim** (`:264` under OUTPUT FORMAT, `:283`
under `Schema:` at `:280`). Not an ambiguity today. It is the two-copies-of-one-truth shape that
`lib/render/prompt.js` opens by warning about in its own header — "a second copy already
drifted once".

---

## What is deliberately NOT in this list

- **Anything about the register or the content rules.** Those are Reyner's and they are not
  ambiguous; they are opinions, correctly stated as opinions.
- **A proposed fix for any row.** Rank 1 and rank 2 in particular contradict each other's
  natural fix: narrowing the scope of `:33` addresses rank 1 without touching the fact that
  an Aspek is nameable and a void stack is not. Writing both fixes at once would confound
  them, which is rule 13 applied to the prompt.
- **Any measurement.** The `label_bracket` fix from `6ba3e72` is itself unmeasured, and the
  next paid run measures it. Nothing here should ride in front of that.
