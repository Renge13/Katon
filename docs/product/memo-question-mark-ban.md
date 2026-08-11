<!--
STATUS: OPTIONS MEMO. Written 2026-08-11 by Claude Code. NOT a decision and NOT implemented.
The decision is Reyner's. Nothing in the gate or the glossary was changed on the strength of this.
ORIGIN: tranche-1 content pass (PR #22) raised style.rhetorical_question on 8 of 13 charts.
-->

# Memo: the question-mark ban

## The one number that should decide this

**Zero.** `style.rhetorical_question` has fired **0 times in 650 live generations** - five harness
runs of 130, spanning the 08-07 baseline and all four 08-11 configurations.

```
node -e "for (const f of ...) ... summary['gemini-3.1-flash-lite'].checks['style.rhetorical_question']"
  2026-08-07T12-40   0 of 130      2026-08-11T01-56   0 of 130
  2026-08-11T01-39   0 of 130      2026-08-11T02-12   0 of 130
                                    2026-08-11T02-22   0 of 130
```

The renderer does not write question marks. The ban has never once caught the thing it was written
to catch, and relaxing it would therefore change nothing about model output that we have evidence
for.

**The entire observed cost of this ban falls on the FLOOR**, which copies glossary seeds verbatim.
Two ruled tranche-1 strings contain a self-question, and one of them (`kekuatan.weak`) is on every
chart, so the check now fires on 8 of 13 floor readings. It is a soft finding, so it fails no gate -
but it is 8 of 13 readings carrying a QA flag that means nothing.

## What the ban is defending

Not nothing. `renderer-prompt.txt` names the exact failure and quotes it:

> Rhetorical questions are banned here as everywhere. "Bagian mana dari dirimu yang paling butuh
> ruang?" is exactly what not to write.

That sentence is a reflection prompt - the reading handing the work back to the reader instead of
delivering a verdict. `coldread-analysis.md` is upstream of it. The penutup rule is explicit for the
same reason: state a verdict, do not ask a question.

So the ban has a real target. What it does not have is evidence that the target still exists in a
pipeline that also carries the penutup instruction, the "confident verdict" rule, and a model that
has produced 650 consecutive question-free readings.

## The three options

### A. Keep it as is

Every ruled string must avoid `?`. Costs a rewrite of two tranche-1 strings and constrains every
future `actionable_seed`, because "ask yourself X" is the most natural shape a coaching actionable
takes and it is the shape both flagged strings reached for independently.

- **Blast radius:** 2 strings now, plus an ongoing tax on tranches 2..N. Zero effect on model output.
- **Argument for:** the cheapest guard against a failure Reyner personally flagged, and the cost of
  keeping an inert check is close to nothing *for the model*. Bans are hard to re-add once dropped.
- **Argument against:** it is being paid for entirely by the content pass, and it is the content
  pass that the QA verdict says is the current bottleneck.

### B. Drop it

- **Blast radius:** unknown, and that is the honest answer. It would remove the only mechanical
  guard on a failure the prompt names explicitly. The 650 clean generations say the model does not
  need the guard *today*, on *this* prompt, with *this* model. All three of those change.
- **Argument for:** an inert check that only ever fires on our own ruled content is worse than no
  check - it trains everyone to read `rhetorical_question` as noise, and a QA flag nobody believes
  is a QA flag that will be ignored when it is right.
- **Argument against:** the `hedge_construction` precedent runs the other way. That check looked
  like the largest rejection cause in the pipeline until the gallery showed seven of eight hits were
  the sanctioned construction. The fix there was to NARROW it, not to drop it, and narrowing turned
  a noisy check into a precise one. This is the same shape.

### C. Scope it (recommended for consideration)

Ban the question that hands work to the reader; allow the question that a reading asks and then
answers. Two candidate mechanics, both cheap:

1. **Answered-question carve-out.** A `?` is allowed when the sentence that follows it is
   declarative - the reading asks and immediately answers. Both flagged strings pass:
   *"...tanya ke diri sendiri: siapa atau apa yang akan mengisi ulang energiku di sini? **Kalau
   jawabannya tidak ada, kamu sendiri yang akan kehabisan tenaga.**"* The banned example fails,
   because it is the last sentence of the reading with nothing after it.
2. **Position rule.** Ban `?` in the penutup entirely, allow it in block prose. The named failure is
   a closing move; the penutup already has its own "state a verdict" rule this would enforce
   mechanically.

- **Blast radius:** both flagged strings survive unedited; the named failure still rejects. Needs
  one narrow change in `lib/validate/style.js` plus test cases, in its own PR.
- **Argument against:** it is a new mechanism fitted to two examples, and rule 13 says one change
  one measurement. It should not ride with anything else.

## What I would not do

Decide this from the count alone. "Zero in 650" is the argument for **not keeping it unchanged
purely out of caution** - it is not by itself an argument for dropping a guard on a failure mode you
named from reading real output. Option C keeps the guard pointed at that failure and stops charging
the content pass for it.

## If you rule C

The carve-out belongs in `lib/validate/style.js` beside the `bukan berarti` carve-out, which is the
precedent for exactly this: a check narrowed after the gallery showed it was mostly hitting
sanctioned prose. That change wants its own PR, its own tests, and no other lever moving.
