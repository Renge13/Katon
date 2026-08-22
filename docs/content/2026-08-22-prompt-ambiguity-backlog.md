<!--
STATUS: BACKLOG. NOTHING HERE IS QUEUED. No row has an owner, a date or a
measurement waiting on it. Reyner's ruling, 2026-08-22: two rows ship now and the
rest wait for real reader feedback rather than for another audit pass.

This file exists so "deferred with a reason" stays distinguishable from
"forgotten", which is the same job THE DEFERRED REGISTER does in PROGRESS.md. It
is not a to-do list and a later session should not treat it as one.
-->

# Renderer prompt ambiguity — the backlog

Source: [2026-08-22-renderer-prompt-ambiguity-audit.md](2026-08-22-renderer-prompt-ambiguity-audit.md),
nine rows, commissioned after three floor causes in one day turned out to be the
prompt readable two ways. Every code claim below carries the command that produced
it and its date, per repo convention. Line numbers are against
`PROMPT_VERSION 22316c3349d0ea46` (289 -> 293 lines at `4779e96`) and **the audit's
own numbers are 1 to 4 lines lower**, because `4779e96` inserted text above them.

## What shipped, and why only this

| Audit row | Ruling | Commit |
|---|---|---|
| **Row 6** — "cut low-importance facts" against "cover every required_point" | **FIXED.** Importance decides room, never presence. Anything backing a `required_point` and the opening three are never cuttable, whatever they rank | `4779e96`, `PROMPT_VERSION e5cecda4617491e1 -> 22316c3349d0ea46` |
| Not an audit row — the directive quoting the literal it forbids, from the audit's preamble and PROGRESS 08-22 | **FIXED.** `stricterDirective` scrubs the chart's condition labels, and the parenthesised pass takes the parens with it so the directive cannot demonstrate the shape it rejects | `d313571`, no version moves — see the DEFERRED REGISTER row on unstamped messages |

**Why the rest waits.** Reyner's ruling: the gate is at a 10% pooled floor and the
three remaining causes were already judged model behaviour rather than instrument
defects. Another eight prompt edits measured against each other would spend the
budget on rows nobody has evidence hurt a reader. **Real reader feedback is the
unblocker for this whole file**, not a further audit.

**A count reconciliation, so nothing looks dropped.** The ruling said seven rows
go to backlog. Eight rows remain after row 6, and all eight are below: row 2 is
evidence rather than a defect and row 8 was already carried in the DEFERRED
REGISTER before the audit, so either one is a defensible exclusion from a count of
seven. Both are recorded anyway — a row costs a table line, and re-deriving a
missing one costs a session.

---

## Row 1 — the opening is fixed, and the model is also told to lead with the highest importance

```
:28  facts[] opens with three facts ... They come first, ahead of every other fact
:34  Lead them with the highest-importance fact unless a different order genuinely
     serves this chart better. If you start elsewhere, the highest-importance fact
     must still get the most room.
```

`:34`'s "them" means the remaining facts. Nothing in the sentence carries that
scope, and its escape hatch explicitly licenses starting elsewhere with no
carve-out for the opening three.

**THE HALF THAT SHIPPED AND THE HALF THAT DID NOT.** Rows 1 and 6 are one conflict
read from two sides: row 6 is about CUTTING, row 1 about ORDER. `4779e96` moved the
cutting axis only, deliberately, because the two fixes confound each other
(rule 13 applied to the prompt). `:34` is untouched.

**Evidence, and it is the strongest in the audit:**

```
$ node --conditions=react-server ... buildSemanticJson    # 2026-08-22, re-run
chart 5      day master rank 5 of 7   top point relation_六合_寅亥  "Ikatan"    78
chart 13     day master rank 4 of 6   top point relation_冲_丑未   "Benturan"  77
chart 1      day master rank 9 of 9   top point void_stack_month  "Tanda Kekosongan" 100
fresh-1996   day master rank 9 of 9   top point profile_vs_favorable "Aspek Pelindung" 85
```

Day master importance is **55 on all four charts**. `opening.archetype_missing`
fires **10/10** on fresh-1996 and **0/9** on chart 13.

**What unblocks it:** the measurement on `4779e96`. If the coverage floor alone
moves fresh-1996 off 10/10, `:34` may need nothing. If it does not, `:34` is the
next single-axis candidate and it gets its own commit and its own run.

## Row 2 — it is not outranking, it is the KIND of fact on top

**NOT A DEFECT. This row is evidence, and it is here so it is not re-derived.** It
refutes the premise behind the natural fix for row 1, which is the reason row 1
cannot simply be written.

```
$ node ... over docs/qa/2026-08-18-retry-depth.json   # 2026-08-22, 77 stored proses
chart 5      opening names day master 22/22
chart 13     opening names day master 18/18
chart 1      opening names day master 21/22   (1 x void_stack_month)
fresh-1996   opening names Aspek Pelindung 12/15,  day master 3/15
```

Being outranked does not move the opening: chart 1 is outranked 100 to 55 and
still opens on itself 21 of 22 times. What moves it is an **Aspek** on top — a
thing with a name a sentence can be built around, which a branch relation and a
void stack are not. A second hypothesis fits the same four points and separates
them exactly: the day master ranks **last** on both flagging charts and mid-table
on the two that do not. **n=4 charts. Both hypotheses fit. Neither is confirmable
at this n**, and that is the finding.

**AND THE FLAG CONFLATES TWO DEFECTS**, which is the part that must survive into
any future fix:

```
$ node ... first sentence of each stored prose        # 2026-08-22
chart 13   names the ELEMENT 18/18, names the ARCHETYPE 0/18   <- opened on itself, wrong name
fresh-1996 names NEITHER 12/15                                 <- opened on something else
```

Chart 13's was a naming slip inside a correct opening and `must_cover: 'archetype'`
already closed it (0/9). fresh-1996's is taxonomy-first and untouched. **One flag,
two defects, one already fixed** — so the flag's rate is not a single quantity and
must not be read as one.

**What unblocks it:** more charts. Nothing else. A fifth and sixth fixture chart
would separate the two hypotheses; no prompt edit can.

## Row 3 — "never copy from provenance fields" against "use provenance.positions_id VERBATIM"

```
:12   Never copy hanzi or English tokens from provenance fields into prose.
:114  The span is already written for you: use `provenance.positions_id` VERBATIM.
:9    Do NOT copy them verbatim either. Rewrite them so they flow.
```

`positions_id` **is** a provenance field. The rules are reconcilable — the first
one's object (hanzi and English tokens) is narrower than its subject (provenance
fields), and `positions_id` is Indonesian — but **nothing in the prompt states the
distinction it relies on**: substance strings get rewritten, citation strings get
copied.

**Why this row is the highest-value one left.** It is the exact fault line the
`label_bracket` leak fell through, and that leak was 48 of 56 firings of the
leading floor cause. Two more live edges sit on the same line.

**What unblocks it:** nothing external. It is writable today, as one commit, and it
is the row to reach for first if reader feedback says the readings cite badly.
Held only because the ruling stopped at two.

## Row 4 — the prompt asserts something false about the validator

```
:38  The validator downstream checks content coverage, never structure. Past the
     opening three you will never be penalised for an unusual order.
```

```
$ grep -rno "finding('[a-z_.]*'" lib/validate/*.js | ... | sort -u    # 2026-08-22
structure.block_too_short  structure.duplicate_sentence  structure.length
structure.stray_newline    structure.too_many_breaks     structure.unparagraphed
$ grep -rno "check: '[a-z_.]*'" lib/validate/*.js | ...
opening.archetype_missing  opening.element_fused  brackets.inserted  brackets.normalised
```

Six structural checks and two positional ones. `structure.unparagraphed` has
rejected **73.9%** of gate evaluations at one point (its own docblock records it).
The prompt promises the model it cannot be rejected for shape, in a document whose
next section prescribes shape in detail.

**What unblocks it:** nothing. Also writable today. It is a false statement about
the code rather than an ambiguity, which makes it the cheapest row here and the
one least likely to need a measurement — but "least likely" is not "does not", and
a sentence telling the model what it will not be penalised for is load-bearing.

## Row 5 — "do not write section headings" against the schema's `heading` field

```
:40   Do not write section headings. Do not number your points.
:276  heading is a short label for the block, 2 to 5 words, in the target
      language. Plain words, no BaZi jargon in the heading itself.
```

Resolved only by knowing `:40` means "not inside `text`". Two of `:276`'s own
constraints are observed broken in the current artifact:

```
$ grep -h "^### " docs/qa/2026-08-22-renders-n10-budget3.md | ... | awk '{print NF-1}'
2 words: 4   3 words: 7   4 words: 5   5 words: 3   6 words: 1
```

One heading over the word limit, six carrying BaZi jargon.

**AND HEADINGS ARE INVISIBLE TO EVERY CHECK.** `renderedProse` excludes them from
bracket-once by ruling; `openingGuard` excludes them from the opening haystack by
ruling. **Both exclusions are correct for what they were for.** Together they mean
`:276` has no enforcement anywhere.

**What unblocks it:** a ruling on whether `heading` is worth gating at all. That is
a product question — headings are the most visible line of a block and nothing
checks them — and it is a register call, so it is Reyner's and not a code decision.

## Row 7 — the prompt is stricter than the gate, on hedging

```
:245  Hedging words inside a claim: mungkin, agak, cenderung, sepertinya
```

`style.hedging` was deliberately split so `mungkin` fires on the reader and not on
a third party (`docs/qa/`, 08-17). The prompt bans the word outright.

Not a floor cause and not wrong. An instruction that over-bans spends the model's
attention on sentences the gate would have accepted, and it reads as a
contradiction to anyone comparing the two.

**What unblocks it:** nothing, and it may correctly never move. Narrowing the
prompt to match the split gate is a prompt change needing its own measurement
(rule 13), for a row with no measured cost. **Recorded as low priority on
purpose** — the same shape as the `secara ...` note in the DEFERRED REGISTER, where
guidance to a writer and a rejection gate are deliberately different instruments.

## Row 8 — already carried elsewhere, plus a staleness this work exposed

```
:226  4. NO VERDICTS THAT CLOSE A DOOR. ... Timing is cuaca, never ramalan.
```

`blocklist.json` bans `\bramalan\b` HARD. The prompt teaches the banned token while
banning the concept. **Already in the DEFERRED REGISTER** under
"`renderer-prompt.txt` hygiene" — this row adds nothing to it.

**BUT THAT REGISTER ROW'S CODE FACTS HAVE GONE STALE, found while writing this and
recorded because the repo convention says a claim without its command is a
memory.** The row reads *"Em-dashes at :59 and :92, and `ramalan` at :207"*:

```
$ grep -n "[—“”’]" docs/content/renderer-prompt.txt      # 2026-08-22
109:**When you state which pillars a branch relation spans, name EVERY position ...
$ grep -n "ramalan" docs/content/renderer-prompt.txt     # 2026-08-22
226:4. NO VERDICTS THAT CLOSE A DOOR. ... Timing is cuaca, never ramalan.
```

**One em-dash, not two, and not at either line named. `ramalan` is at :226, not
:207.** Some of that drift is `4779e96` shifting lines by 4; the em-dash count is
not — two were named and one exists, which predates this work. **Not corrected
here:** the register row is not an audit row and editing PROGRESS's DEFERRED
REGISTER outside the ruling's scope is exactly the sweep-in the commit-message
convention exists to stop. Flagged, dated, with the commands.

## Row 9 — redundancy that invites divergence

The output JSON skeleton appears **twice, verbatim** — `:266` under OUTPUT FORMAT
(`:262`) and `:285` under `Schema:` (`:283`), from
`grep -n '^{$\|## OUTPUT FORMAT\|^Schema:' docs/content/renderer-prompt.txt` on
2026-08-22. Not an ambiguity today.

It is the two-copies-of-one-truth shape that `lib/render/prompt.js` opens by
warning about in its own header — *"a second copy already drifted once"*. The cost
is realised only when they diverge, and nothing detects that.

**What unblocks it:** nothing, but note the cheap option the audit did not name — a
test asserting the two blocks are byte-identical costs nothing, moves no version,
and converts a silent future divergence into a failing suite. That is smaller than
deleting one copy, which is a prompt change needing a measurement.

---

## Two observations from the fix work, neither an audit row

**1. Fact ids reach the model carrying English and hanzi tokens.** A milder cousin
of the leak `d313571` closed. Directive messages interpolate `f.where` ids and
coverage messages name them in prose:

```
$ node --conditions=react-server ... forbiddenLiterals + fact ids   # 2026-08-22
chart 5   forbidden ["Missing Metal","Dominant Output"]
          ids relation_六合_寅亥, element_missing_Metal, element_dominant_Earth
chart 13  forbidden ["Dominant Wealth"]
          ids relation_冲_丑未, element_dominant_Earth
```

So a directive can contain `the cost of element_missing_Metal is not rendered`,
and `:12` tells the model never to copy English or hanzi tokens from provenance
into prose. **Deliberately not scrubbed:** fact ids are the model's own citation
vocabulary — it must write them into `fact_ids` — so they are legitimately in its
input, and no check rejects an id. Unlike a condition's `label_bracket`, this is
not a string the gate would reject. Recorded because it is the same fault line as
row 3 and someone will notice the ids before they notice the row.

**2. `qa-depth-pairs.mjs`'s own docblock is now stale.** It says the 08-18 vintage
is acceptable because *"`stricterDirective` ... has not been touched since"*. That
was true when written and `d313571` ended it. It does not matter for the next run,
which regenerates the pair from its own tape at the current gate — which is what
the `--from` flag was built for — but the sentence should not be read as current.
