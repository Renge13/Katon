# Prompt AO: correct the migration record, confirm the AN fix, open the promotion PRs (Cowork, 2026-09-28)
Untracked in the working tree as `docs/prompts/AO-confirm-fix-and-promotion-prs.md`. Commit it with your first change.

Cite the four checks. Two-round cap. No regex through a shell heredoc. No model-based judge of readings (Reyner, AN).

## §1. The migration-0011 row is wrong. Correct it first.
`docs/PROGRESS.md:292` (on `feat/voice-v2`) says "MIGRATION 0011 IS NOT KNOWN TO BE APPLIED", with status **OPEN**. AN told you it was applied. The fact, stated once so it is on record:
- **Reyner applied migration 0011 to production Supabase on 2026-09-28** in the SQL editor: `alter table public.render_cache add column if not exists review jsonb;` returned "Success. No rows returned".
- **He verified it** with the information_schema query from that same row, which returned one row: `review | jsonb`. The screenshot is in the Cowork chat.

**Fix:** mark the row RESOLVED 2026-09-28 with that evidence, and move it where the register's own convention puts resolved rows. Leave the superseded 2026-09-25 VOICE row (line ~364) unedited, because it is a historical record. Quote the diff.

**Why it matters:** a status that disagrees with the database is the same failure the Katon skill records twice (a Next list or status carried forward). Tell Reyner the correct fact in your report.

## §2. Confirm the AN upstream fix on a sample, then decide the checks (Reyner's ruling applies)
One render per pair proves the fix can work once, not that the error rate fell. On `feat/voice-v2` at `c4c1b1f` or later:
1. **Render** PZ0t and rVe4ca 3 times each, plus two more fixture pairs (pick by script: pairs whose payload carries a strength or Aspek fact for either person) 3 times each. That's 12 renders, about $0.05. Use `--subjects`. Output to `reports/voice-v2/an2/`.
2. **Count** with the §1.3 counter from AN, unchanged: every birth-month, season, and Aspek-at-pillar claim, marked true, false or subject-undetermined against the engine for that person.
3. **Decide:**
   - **0 false:** record the measurement (MEASUREMENTS row). Add a DEFERRED REGISTER row for the two unbuilt checks, saying what they would guard and that the measurement priced them out.
   - **Any false month or season claim:** build the birth-month check.
   - **Any false Aspek-at-pillar claim:** build the Aspek-at-pillar check, with the possessive subject rule you proposed ("Aspek Pengelola-mu" means A; "-nya" or "dia" means B; otherwise don't fire and log it).
   - For either check: red first on the served literal, extracted by script; replay every stored draft; its own STAGE6 bump. Reyner's AN ruling covers these two checks and nothing broader.
4. **Report** the undetermined count too. If it's large, say so; that is a measurement gap, not a pass.

## §3. Open, do not merge, the promotion PR: `feat/voice-v2` into main
- **A merge commit, not a squash**, so the hashes the docs cite survive.
- **The PR description** quotes AM §3's v1-impact finding (0 semantic JSON diffs; the only v1 differences are the ruled `coverage.slot_filling` log removal and version stamping). Re-run both measurements on the PR head and quote them.
- **List** every STAGE6 and prompt version that main will carry after the merge.
- Suite and CI must be green. **Reyner approves the merge.** Production stays on v1 after it, because `lib/voice.js:19` is unchanged.

## §4. Open, do not merge, the switch PR, stacked after §3
- **One change:** remove the production force at `lib/voice.js:19`, and update the file header that still says v2 "is not ruled for readers".
- **The PR description states the deploy steps:**
  1. Reyner sets `VOICE=v2` in Vercel **Production** scope before or with the merge.
  2. First production check: Reyner creates one new free Mirror on katon.app and one Compat, and confirms each serves a v2 reading, not the floor.
  3. **Rollback:** set `VOICE=v1` in Vercel Production and redeploy. No code revert is needed once line 19 is gone. Confirm this from `voiceVersion()`; don't assume it.
- **State what happens to existing cached v1 rows:** they re-render once on their next open, from the free and paid caps. Quote the numbers from AM §5.
- **Reyner approves the merge.**

## Report format
Per item: commits, red-first proof, output, and what the customer gets. End with the split.
