# Prompt AJ, amendment 1: Reyner's rulings of 2026-09-28 (Cowork)
Untracked in the working tree as `docs/prompts/AJ-amendment-1-reyner-rulings.md`. Commit it with the rulings-record commit below.

## Reyner's rulings, verbatim (2026-09-28, in reply to Cowork's round-4 table)
```
2. Accept, pending the listed fixes
3. Keep open-ended close, remove the example phrase
4. Accept example sentence reuse when facts match
5. Keep 1,500 calls/day
6. Add Turnstile at create-reading only
7. Keep fallback text when budget is exhausted
One thing I would not approve yet is the "Penyeimbang Unsur" issue. That's a semantic BaZi-engine question, not a voice/prompt issue. Let Code trace exactly how that statement is calculated before changing either the engine or the copy.
```
**Merge approval:** by pasting AJ with "Reyner says merge", Reyner approved merging #155 and #157 (item 1).

What each ruling refers to, keyed so none of them is ambiguous:
- **2. Voice acceptance of round 4 is CONDITIONAL.** The listed fixes are AJ §2 (single pair opening), AJ §3 (no nested brackets) and ruling 3 below. It is not acceptance of the Penyeimbang Unsur question, which stays open under AJ §4.
- **3. The "open-ended close".** Keep the move: a thought may end on an open observation. Remove the example phrase from the v2 writer prompt. Code quoted the current wording as: "You may end a thought on an open observation that makes her want to look further, for instance at the people closest to her". The "for instance …" clause goes. The permission to end on an open observation stays.
- **4. Example reuse.** A sentence from `docs/content/voice-examples-v2.txt` may appear verbatim in a reading whose facts match. Keep `scripts/check-example-reuse.mjs` as a QA instrument only. It is never a gate.
- **5. Daily writer cap** stays at 1,500 calls.
- **6. Bot check:** Cloudflare Turnstile on the create-reading step only. Never on the permalink, the result page, a paid page or a PDF.
- **7. Budget exhausted:** the reader gets today's fallback (floor) reading, with no new copy.
- **Penyeimbang Unsur:** trace only (AJ §4.1). No change to the engine, the glossary, the prompt or the checks until Cowork and Reyner have read the trace.

## Where the rulings are recorded (one docs PR to main, alone)
1. **Voice rulings (2, 3, 4):** append dated rows to `docs/content/voice-constraint-rulings-2026-09-26.md`, using the file's own row format and the next free numbers. Quote Reyner verbatim, add the keyed referent above, and update STATUS: voice acceptance is conditional on AJ §2, AJ §3 and ruling 3.
2. **Abuse-protection rulings (5, 6, 7):** create `docs/product/ah-protection-rulings-2026-09-28.md` holding the verbatim block above, the keyed referents, and Cowork's technical rulings from AJ: paid renders never floored by free budget; the per-IP daily cap sized as a share of the global cap; the reserve slice only if AJ §5.1 shows it survives IP rotation. Point to it from the AH prompt.
3. Quote every changed line in the PR. Reyner pre-approves merging this docs PR on green CI: it records his own words.

## Added work, on `feat/voice-v2`
**§6. Ruling 3, prompt change.** Remove the example clause from the v2 writer prompt(s) where it appears; grep both the mirror and pair prompts. The prompt hash changes, so say what that does to cached v2 rows (the prompt is not in the cache key, per your AG report).
- **Red first:** a test that the built v2 prompt contains no "for instance at the people closest to her" (or its exact current wording). It must fail on today's prompt.

**§7. Re-render round 4b (about $0.02), after §2, §3 and §6 are all committed.**
- Same seven subjects, same harness, output to `reports/voice-v2/round4b/`. Floored readings marked FLOOR.
- Report per reading:
  - the opening count (pairs);
  - any nested bracket;
  - every sentence starting "Mungkin menarik";
  - every served question mark;
  - gate findings, regenerations and cost.
- Quote the last paragraph of each reading.
- **Do not merge `feat/voice-v2` to main and do not touch `lib/voice.js:19`.** Promotion to v2 waits for Cowork's read of round 4b and Reyner's final go.

**AH Part 2 is not started.** Stop after the AJ §5 report as planned. Cowork writes the Part 2 spec from the §5 findings and these rulings.
- Turnstile needs a site key and secret that only Reyner can create, in his Cloudflare account. Do not create accounts or placeholder keys.
