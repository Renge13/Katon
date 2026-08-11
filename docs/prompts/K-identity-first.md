<!--
STATUS: HANDOVER — Claude Code build prompt. Created 2026-08-10 by Cowork.
This is PROMPT K — identity-first reading order. Own session/PR, one product change, measured.
ORIGIN: Reyner's buyer-hat QA verdict (PROGRESS.md "MIRROR QA VERDICT 2026-08-10"): the reading
opens with its most dramatic finding and buries who-you-are at the bottom. His ruling: the reader
meets herself first, then descends through the findings.
DATE NOTE, CORRECTED 2026-08-11: this prompt originally said the 08-07 stamps on the rule-16
amendment note, the J header and the COWORK-BRIEF renumber note were wrong and should be changed
to 08-10. They are RIGHT and they stay — `git log --date=iso` puts that work at 2026-08-07.
Written 2026-08-10; the build ran 2026-08-11. COWORK-BRIEF error 18.
-->

# Prompt K — the reader meets herself first

## Read first, in order
1. `../PROGRESS.md` — the "MIRROR QA VERDICT 2026-08-10" section. It is the requirement.
2. `../CLAUDE.md` rules 13 (one change, one measurement), 14 (engine owns structure), 20 (voice is
   locked; nothing here touches register).
3. The mechanism, before choosing a lever: Stage 3 emits facts importance-sorted — there is a test
   pinning that sortedness (added with Prompt H; find it and read it before editing anything).
   `lib/semantic/` fact emission + `required_points`, and the structure section of
   `content/renderer-prompt.txt`.
   **CORRECTED 2026-08-11: this originally continued "and the renderer follows JSON order". It does
   not.** `content/renderer-prompt.txt:22-26` is headed ARRANGEMENT IS FREE and says the array order
   is "a ranking, not a sequence". So the renderer-prompt line is REQUIRED, not contingent, and the
   "if the emitted order alone does not move the rendered order" branch below is already resolved.
   COWORK-BRIEF error 19.

## The change — ONE product change
The reading OPENS with the identity spine, in this order, before any finding:
  1. the day-master fact (element + archetype; it carries `salah_dikira`, which is what keeps an
     identity opening specific rather than horoscope-generic),
  2. the strength verdict fact (same-breath rule 21 unchanged),
  3. the main-profile fact — or the CR-1 fact that supersedes it, when one exists.
Everything AFTER the spine keeps the existing importance descent untouched. The engine already
tags these facts `role: "spine"` in `hierarchy` and already names the identity set in the JSON's
`core` object — the ordering rule must be derived from those existing structures, not from a new
hand-list of fact ids. Note `spouse_palace` is also role-spine but is NOT identity; the rule you
implement has to keep it in the findings descent, which is why "sort spine first" is wrong as-is.
If the emitted order alone does not move the rendered order (verify, don't assume), the minimal
renderer-prompt line rides in the same PR — this is one product change with one primary metric,
not two levers fitted separately.

## Constraints
- The ORDER is the engine's decision (rule 14). No instruction may leave ordering to the model.
- Voice, glossary strings, gate checks: untouched. This prompt authors no Indonesian.
- The sortedness test gets UPDATED to pin the new contract (spine-identity prefix + importance
  descent), not deleted.
- Cache keys: emission order changes the semantic JSON, so EVERY cache key moves. Expected;
  traffic is zero; say so in the commit message. Old rows orphan as in the 0006 cleanup note.
- Each commit independently revertable; message describes everything staged.

## Measurement
- Primary metric: Reyner re-reads `chart-01` and `fresh-1996` (regenerate the QA files the same
  way as before). His read is the pass/fail.
- Regression guard, not target: `npm run measure:stage6 -- --n 10` before merge. Shipped must hold
  the gate-1.8.0 band (88.5% single batch; treat anything within the harness's demonstrated
  batch spread as holding). Report per-check deltas; structural reordering can plausibly move
  coverage/same-breath checks — if a check moves hard, read the failing output before touching
  any lever (house method).
- Record numbers in PROGRESS MEASUREMENTS, dated 2026-08-10.

## Do not touch
`lib/bazi/*` calculation, the gate (`lib/validate/*`), glossary.json, the legacy funnel, payments.

## Stop and report
On any contradiction between this prompt and the repo: docs win over this prompt, CLAUDE.md wins
over docs. Seventeen spec errors are in the ledger, all of them Cowork's. Check before asserting.
(Nineteen as of 2026-08-11: errors 18 and 19 were both caught in this prompt's own build session,
and 19 is in this prompt. The count above is left as written, dated, rather than back-edited.)
