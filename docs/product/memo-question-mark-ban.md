<!--
STATUS: OPTIONS MEMO. Written 2026-08-11 by Claude Code. NOT a decision and NOT implemented.
The decision is Reyner's. Nothing in the gate or the glossary was changed on the strength of this.
ORIGIN: tranche-1 content pass (PR #22) raised style.rhetorical_question on 8 of 13 charts.
-->

# Memo: the question-mark ban

## The one number that should decide this, stated correctly

**Zero - but the sample is 130 on the current prompt, not 650.** The first version of this memo led
with "650 live generations" and listed the runs by timestamp without their prompt versions, which
invited exactly the misreading Reyner caught: the renderer prompt was edited on 08-11, so most of
that sample is evidence about a prompt that no longer exists.

The window, explicitly (`prompt_version` from each run log; current is `8877da29765cc34d`):

| run | prompt | n | fired |
|---|---|---|---|
| 2026-08-07T12-40 | `9b5b67d7` (pre-K) | 130 | 0 |
| 2026-08-11T01-39 | `69a9afe2` (K v1) | 130 | 0 |
| **2026-08-11T01-56** | **`8877da29` — CURRENT** | **130** | **0** |
| 2026-08-11T02-12 | `9c167561` (K v3) | 130 | 0 |
| 2026-08-11T02-22 | `9b5b67d7` (pre-K) | 130 | 0 |

So: **0 in 130 on the current prompt**, plus 0 in 520 across three neighbouring versions of it. By
the rule of three, 0/130 puts the 95% upper bound near **2.3%** - not "never", but small, and the
four other prompts agreeing makes a prompt-specific fluke unlikely.

The renderer does not write question marks. The ban has never caught the thing it was written to
catch on any prompt we have measured.

**A second, independent signal points the same way.** `tests/stage6-validation.spec.mjs`'s
"NO ENGINE STRING WOULD TRIP THE STYLE GATE" - the invariant added after `f068352` cleaned 12
offending glossary strings - does NOT flag the two tranche-1 `?` strings. It sweeps the blocklist
STYLE patterns, and `rhetorical_question` is not one of them; it is a hardcoded `/\?/` in
`style.js`. The repo's own definition of "an engine string that trips the style gate" already
excludes this check.

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

## RULED 2026-08-11: exempt the sanctioned prose, keep the check on model output

> The gate polices what the model improvises, never the dictionary.

Reading (ii) - the one the cited `hedge_construction` precedent implies. Engine-authored question
sentences are exempt, derived from the glossary exactly as `sanctionedBrackets()` derives the
English allowlist. The exemption is by SENTENCE and VERBATIM, which is what keeps the model
policed: the prompt orders a rewrite rather than a copy, so a paraphrased question does not match
and still fails. Only the floor, which copies exactly, is exempt.

The failure the ban was written for still rejects, and a test pins it.

Shipped in PR #29, merged 2026-08-11. It is a no-op on main today - no glossary cell carries a
`?` - and activates when tranche 1 lands, which is why it is derived rather than listed.

## What I would not do

Decide this from the count alone. "Zero in 650" is the argument for **not keeping it unchanged
purely out of caution** - it is not by itself an argument for dropping a guard on a failure mode you
named from reading real output. Option C keeps the guard pointed at that failure and stops charging
the content pass for it.

## If you rule C

The carve-out belongs in `lib/validate/style.js` beside the `bukan berarti` carve-out, which is the
precedent for exactly this: a check narrowed after the gallery showed it was mostly hitting
sanctioned prose. That change wants its own PR, its own tests, and no other lever moving.
