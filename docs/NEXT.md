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

**The current work is the CONTENT REVISION PASS — step 2 of the fix plan. Cowork and Reyner, no
code.** Every glossary cell against the three tests in the verdict section (a cost-answering
actionable; a reconciling hinge between gift and cost; jargon demoted behind the behavior it names),
plus new finding 5, the palace domain gloss woven into first mention. **The next build prompt gets
written after that pass, not before** — a build prompt written now would be guessing at what the
pass decides.

(Prompt J is DONE — merged as PR #18-#20 on 2026-08-07, live and fenced on production. The carried
`element_missing` item landed with it as PR #20.

Prompt K is DONE — merged as PR #21 on 2026-08-11. Reyner's re-read passed it: *"meeting yourself
first completely fixes the upside-down feeling."* Findings 2 and 3 remain, assigned to steps 2 and
3. Promotion is still 1 of 3: condition 2 is the fulfillment swap, condition 3 needs the content
pass and a re-QA.)

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
- Flag anything in the docs that contradicts what you find. Nineteen spec errors have been caught
  that way, all of them Cowork's.
