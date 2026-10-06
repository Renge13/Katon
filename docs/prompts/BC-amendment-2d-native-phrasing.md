# Prompt BC, amendment 2d: no translated pop-psychology (Reyner ruled 2026-10-06)
Goes in the working tree as `docs/prompts/BC-amendment-2d-native-phrasing.md`. Untracked until you commit it: commit it on #197 with §0.

Cite the four checks. No regex through a shell heredoc. No model-based judge.

On #197. Do not merge #197 or #198. No gate change: STAGE6 stays 1.73.0, and no check or blocklist entry is added (this is a direction line in the prompt, per `voice-constraint-rulings-2026-09-26.md` "REYNER-RULED 2026-10-01").

**Why (Reyner):** in the 2c round, "Mengubah rutinitas kecil menjadi momen kebersamaan yang disengaja adalah cara paling nyata..." (nonames render 1) "reads like a direct, clunky translation of the English pop-psychology phrase 'intentional moments of togetherness.'"

## §0. Record (one docs-only commit on #197)
Add to `docs/product/compat-rulings-2026-10-02.md`, after "Amendment 2c", as **"Amendment 2d (Reyner, 2026-10-06)"**, the line in §1 verbatim, with the reason above.

## 1. Pair prompt, one line (red first, one prompt-version bump)
File: `docs/content/compat-renderer-prompt-v2.txt`, the "Voice" paragraph. Insert after "Ground the emotion in vivid, real-world human situations.":
> Do not use literal translations of English pop-psychology, therapy jargon, or Western relationship concepts (e.g., avoid unnatural translated phrases like kebersamaan yang disengaja, memegang ruang, or melakukan pekerjaan emosional). Express these ideas using natural, native Indonesian phrasing that people actually say in real life (e.g., menyempatkan waktu berdua, hadir sepenuhnya, menjaga komunikasi).

One assertion that fails on `v2-1efca8ec0ea57b50` and passes after. Report the new pair prompt version. The mirror prompt does not change.

## 2. Replace the sample test pair (round script only)
The sample pair (2005-02-14 07:00 F "Nadia" + 1999-07-07 17:00 M "Bima", Menikah) has the gold example's own charts and names, so its renders copy the example (2c round: sample render 1 shared 437 of its 675 six-word sequences with `docs/content/compat-target-sample-2026-10-02.md`). It measures copying, not quality. In the round script, replace it with: 1992-11-23 10:00 F "Rina" + 1990-04-18 21:00 M "Adit", Menikah. Report both people's four pillars and confirm the pair's facts differ from the example's (day pair, stem relation, supply). Change nothing else in the script.

## 3. Re-run (8 renders), then stop
New pair plus PZ0t, clash, nonames, two renders each at 0.7, production path. New QA doc, same shape as `docs/qa/2026-10-04-bc-paragraphs-round.md` (no side-by-side this time). Add, sentence by sentence:
- every sentence containing "disengaja", "memegang ruang", "pekerjaan emosional" or "hadir sepenuhnya" (the last to see whether the example phrase itself gets copied);
- the six-word overlap of each render with the gold sample, as in Cowork's 2c read, with gold-vs-gold as the control.

**Stop.** Reyner reads, then rules on merging #197 and #198.
