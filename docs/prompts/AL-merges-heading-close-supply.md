# Prompt AL: merges, the heading misfire, the closing hedge, Penyeimbang Unsur, CE PDF state (Cowork, 2026-09-28)
Untracked in the working tree as `docs/prompts/AL-merges-heading-close-supply.md`. Commit it with your first change.

Cite the four checks. Two-round cap. No regex through a shell heredoc. Each change ships alone, is shown red first, and gets its own version bump where a gate or served text changes. Red-first literals come from REJECTION lines or served JSON, extracted by script, never retyped.

## Reyner's rulings for this prompt (2026-09-28, verbatim)
```
1. Yes. Remove "Mungkin menarik" mechanically as proposed.
2. Yes. Adopt the stricter Penyeimbang Unsur rule.
3. Yes. Hide "Unduh PDF" until the reading is ready, using the existing Compatibility pattern.
4. Yes to #161–#165. Merge #161 before #165.
```
Keyed referents:
- 1 is §2 below.
- 2 is §3, the candidate measured in AK §2: "X membawa elemen E only when the supplier holds MORE of E than the receiver".
- 3 is §4.
- 4 is §0.

Record rulings 1-3 in one docs PR to main, alone: 1 in the voice rulings file, 2 and 3 in `docs/product/ah-protection-rulings-2026-09-28.md` or wherever the compat engine rulings live (say which). Quote every changed line. Reyner pre-approves merging that docs PR on green CI.

## §0. On "merge"
1. #161 (paid budget).
2. Retarget #165 to main and merge it.
3. #162, #163, #164.
4. Merge main into `feat/voice-v2` (merge, don't rebase). Suite and replay.

**BotID on Preview.** Deploy main to Preview and show:
- the Mirror page's own create request succeeds;
- a bare `curl` POST to `/api/mirror` is refused with the existing rate-limit response, and no reading is created.

Also list every repo script or QA harness that POSTs to a deployed `/api/mirror`. Say which ones BotID will now block and what each needs. Report only.

## §1. feat/voice-v2: D1 and title-case headings (Cowork's technical ruling)
Headings are title case, so a capital letter in a heading is not evidence of a term. The ruling:
- In a block `heading`, D1 does not treat a single capitalised word as a term claim.
- In a heading, D1 fires only on a complete multi-word glossary term name that the engine did not supply for this reading.
- Prose is unchanged.

- **Red first:** PZ0t's round-4c rejection line ("Tarikan Kuat dan Perbedaan Sudut Pandang"), plus the round-4b "Perspektif yang Berseberangan" heading.
- **Control:** a heading carrying a full unsupplied term (pick one from the glossary by script) must still reject.
- **Replay:** all stored drafts, both voices. List every finding that moves.

## §2. feat/voice-v2: removing the closing hedge (Reyner's ruling B33 "remove it", implemented deterministically)
The prompt route was tried twice (B31, B33), and "Mungkin menarik" stayed at 4 of 7. Cap reached. Cowork's technical implementation:
- **The rule.** If a block's FINAL sentence begins with "Mungkin menarik untuk" or "Menarik untuk" (sentence-initial, either case), drop that sentence, as long as the block still has at least one sentence. No word is added or rewritten.
- **Re-check.** Run the gate on the result. If dropping it breaks a hard check (for example coverage), keep the original sentence and log `close.hedge_kept`. Otherwise log `close.hedge_dropped`.
- **Scope.** A sentence starting with the phrase in the middle of a block is left alone and logged. v2 only.
- **Red first:** use the five round-4c blocks, extracted by script from `reports/voice-v2/round4c/*.json` (chart4, chart6, chart8, chart13 and PZ0t). Show each block's served ending before and after.
- **Zero cost:** apply it to the stored round-4c served readings rather than re-rendering. Report each changed close, and any `hedge_kept`.

## §3. main: Penyeimbang Unsur (ruling 2, adopted)
- **The change.** `supplyFor` (`lib/compat/complementarity.js`) skips any element the supplier holds less of than the receiver, or the same amount. It keeps the current walk (receiver's favourable list, scarcest first).
- **Red first:** rVe4ca. Today it picks A to B = Air, B to A = Api. The candidate picks A to B = Api, B to A = Tanah (your AK §2 numbers).
- Add a test that a pair where no element qualifies gets no Penyeimbang fact in that direction. Check that the glossary line and the PDF table then omit it cleanly.
- **Report:**
  - the §2 table re-run against the real code;
  - whether 1.39.0 still agrees (it reads the engine);
  - how many cached pair keys change, meaning those pairs re-render once. Do not touch the database.
- Bump the version. One PR; Reyner approves.
- Then merge main into the branch.

## §4. main: the Complete Edition PDF before it's ready (ruling 3)
Hide "Unduh PDF" until the reading is ready, reusing the Compatibility report's exact mechanism and states. No new copy. Quote what the pair report shows in each state, and show that the CE page now does the same.
- **Red first:** a CE page whose PDF would return 409 must not render the download link.
- If the Compatibility pattern shows reader-facing text in the waiting state, reuse that text only if it reads correctly for a Complete Edition. If it doesn't, stop and report: copy is Reyner's.

## §5. Promotion readiness (report only)
List everything that has to happen to switch production to v2:
- the `lib/voice.js:19` change;
- migration 0011 (is it still needed?);
- cache behaviour for existing v1 rows;
- env vars;
- the merge path for `feat/voice-v2` to main;
- anything else.

Quote the source of each item. Don't do any of it.

## Report format
Per item: commits, red-first proof, output, and what the customer gets. End with the split.
