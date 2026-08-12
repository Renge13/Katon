<!--
STATUS: LIVE POINTER. Maintained by Claude (Cowork). Reyner does not edit it.

DESIGN NOTE, 2026-08-01: this file went stale twice by duplicating the task list from the prompt it
points at. It is now a POINTER ONLY. It names the prompt and nothing else, so the only thing that can
go stale is which prompt it names. Do not re-add a task summary here.

2026-08-07: it went stale a THIRD way — the pointer itself was not updated when Prompt J was written
(this file still described the 08-02 harness task five days after that work finished). Rule for
Cowork: updating this pointer is PART of writing or queueing a build prompt, not a separate task.
-->

# NEXT

## Read, in order
1. `../CLAUDE.md` — the locked rules, 1 to 25.
2. `PROGRESS.md` — the "MIRROR QA VERDICT 2026-08-10" section (the current requirement and why),
   MEASUREMENTS (**read the 08-11 baseline row FIRST — a stored gate row is not a valid comparator
   for a later change**), and THE INTERIM STATE (Xendit go-live status — read it before touching
   anything near the paid path).
3. **THERE IS NO ACTIVE BUILD PROMPT.** Do not go looking for one.

**The current work is the CONTENT REVISION PASS, TRANCHE 2 — step 2 of the fix plan. Cowork and
Reyner, no code.** Tranche 1 PASSED (see the verdict in `PROGRESS.md`) and tranche 2 is green-lit;
Cowork is drafting the proposals. **Nothing is actionable for Claude Code until Reyner's rulings
arrive as a rulings file**, same flow as tranche 1:

  1. the rulings file lands on MAIN first, on its own — decision state never lives on the branch it
     rules on (the #28 ruling);
  2. `node scripts/apply-rulings.mjs docs/content/tranche2-rulings.md --expect <N>` applies it —
     `--expect` is mandatory and is the guard that would have caught the tranche-1 corruption;
  3. sweep the new strings, run the suite, measure cache keys AND fact order, open the PR.

Fact order should now move on ZERO charts (measured: tranche 1 on top of the actionability
declaration moved 13 of 13 cache keys and 0 of 13 orderings). **If a content tranche ever re-ranks a
chart again, something has re-coupled prose to ranking and that is the bug.**

**QUEUED BEHIND TRANCHE 2, NOT BEFORE IT: one small renderer-prompt pass**, two items together,
measured as a same-day pair — the pillar-domain gloss on first palace mention (`domain_id` is
already in the glossary as data), and a breath phrase when two facts stack in one pillar. Details in
the tranche-1 verdict section. Also queued: re-render chart 5 to settle whether `quietFloor` needs
re-fitting, which is a decision waiting on tranche 2's content rather than on a threshold argument.

(Prompt J is DONE — merged as PR #18-#20 on 2026-08-07, live and fenced on production. The carried
`element_missing` item landed with it as PR #20.

Prompt K is DONE — merged as PR #21 on 2026-08-11. Reyner's re-read passed it: *"meeting yourself
first completely fixes the upside-down feeling."*

**Fix-plan step 3, transitions / narrative roles, is CANCELLED — not deferred, and never built.**
Thematic headers plus grounded action endings closed the seams; the reader does not miss
connectives. Do not revive it without new evidence from a real read.

Promotion is still 1 of 3: condition 2 is the fulfillment swap, condition 3 needs tranche 2 and a
re-QA.)

## Before the next measured change — READ THIS
The 08-11 control run showed the exact gate-`1.8.0` configuration scoring 88.5% and 94.6% shipped
on two different days, with one fact check firing 15 times and once. **Measuring a change against a
stored row measures the day.** Run the arms back to back in one session, prefer metrics with
thousands of samples (blocks per reading replicated to the decimal; the headline rates did not),
and read rejected prose before believing a per-check delta — the `hour_known_contradiction` spike
that looked like a K regression turned out to be the 08-06 penutup failure, unchanged.

## Standing rules
- Engine changes and calibration in **separate commits**.
- Never improvise a BaZi rule (rule 4). That includes tables handed to you in a prompt.
- Measurements go in `PROGRESS.md`, never into `CLAUDE.md` as locked constants (rule 8).
- The commit message must describe everything staged.
- Low on context mid-sequence: **stop and report** rather than half-landing a change.
- If this file sends you back into engine calibration, push back — that work is closed
  (`PROGRESS.md` RESOLVED).
- Flag anything in the docs that contradicts what you find. Twenty spec errors have been caught
  that way, all of them Cowork's.
