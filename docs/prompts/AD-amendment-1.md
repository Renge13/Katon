# Prompt AD, amendment 1 (Cowork, 2026-09-26)
Replaces the "Changes (v2 path only)" table of Job B in `docs/prompts/AD-frame-fix-and-checks-loosening.md`. **Cowork's error:** that table's "Today" column described the v1 gate. Code's step 0 showed that v2 (`lib/validate/v2.js`) already runs style, coverage and structure at flag. Commit this file next to AD on `feat/voice-v2`.

**Principle for every call below:** no new rule that steers the writer. Truth checks stay strict. Voice issues are logged for review, never regenerated.

## Rulings (Cowork, technical)
1. **B15 and B18 are not built as soft checks.** Rhetorical questions are already flag on v2, which satisfies B15. For B18, see item 4.
2. **D2 stays citation-based** (by `fact_id`), with no term matching. Only the required set shrinks:
   - **Mirror:** the three facts picked by `IDENTITY_MATCHERS` (`lib/semantic/index.js:150`). Not everything tagged `role 'spine'`.
   - **Pair:** `p2_day_pair` and `p5_pull_fit`. `p0_opening` is already enforced by `pair.both_named` (hard). `p2_reframe` is already enforced by `pair.reframe_missing` (hard). Neither also needs a D2 citation.
   - Everything else is optional; the writer chooses.
3. **B2, B3, B6, B14, B20, C1:** nothing to build beyond item 2. The v1 coverage and style guards stay at flag on v2. C1 `coverage.slot_filling` may still be removed (dead code).
4. **Truth gap, report only, do not enable yet:** the audit section A deterministic fact checks (`factGuard`: `fact.day_master`, `fact.strength_contradiction`, `fact.badge_invented`, `fact.condition_named`, `fact.hour_known_contradiction`, `fact.relation_positions`) do not run on v2.
   - Quote the commit or comment that excluded them from v2 (`git log -S factGuard -- lib/validate/v2.js`, or `git blame`).
   - Replay `factGuard` over the round-3 v2 renders (`reports/voice-v2/round3/`). For every finding, report the check, the sentence, and whether it is a real error or a false positive.
   - Cowork then rules which checks run on v2 as hard. `fact.palace_dropped`, `fact.strength_same_breath` and `fact.strength_bare_label` would be flag only (B20, B18).
5. **Judge prompt (one shared call, `lib/validate/judge.js:153`):**
   - J2 rubric: interpretive "karena..." is legitimate. Flag only an engine cause that isn't in the input.
   - J3: narrow to rule 25 only (events that will happen, health, money, fate).
   - J4: remove its section.
   - J1: add the scene boundary (B9).
   - Then recalibrate on the final combined prompt: the old 15 cases plus at least 5 pass-scenes and 5 fail-inventions. The target is still 15/15 on the old cases and 0 false negatives on the new ones. STOP and report otherwise.
   - **Cost:** check the last calibration's cost in `docs/qa/`. If this run is estimated at more than USD 5, report the estimate first.
6. **Unchanged from AD:**
   - The v1 zero-diff proof.
   - The findings replay table (round-3 and v1 renders through the new v2 gate).
   - The J2 findings listed in full.
   - `lib/voice.js:19` untouched.
   - Nothing merges to main.

## Unit tests (each shown failing before the change)
- **Mirror:** a draft citing only the three identity facts → no D2 finding. The same draft missing the strength fact → D2 soft.
- **Pair:** a draft citing `p2_day_pair` and `p5_pull_fit`, but not `p3_supply` or `p4_temperament` → no D2 finding.
