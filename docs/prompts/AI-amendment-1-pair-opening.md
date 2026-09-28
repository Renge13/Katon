# Prompt AI, amendment 1: the pair opening line (P0 / B19), RULED (Cowork, 2026-09-28)
Untracked in the working tree as `docs/prompts/AI-amendment-1-pair-opening.md`. Not durable until you commit it: commit it with the rulings commit below.

## The ruling (Reyner, 2026-09-28, verbatim; `{A}`/`{B}` are the two archetype `name_id` values, as today)
```
Ini adalah bacaan tentang dinamika dua individu: {A} dan {B}. Lewat bacaan ini, kita akan melihat bagaimana cara kalian merespons satu sama lain di keseharian, di mana fokus kalian bertemu atau berbeda, dan apa yang sebenarnya menggerakkan ritme di balik hubungan ini.
```
It replaces `kompatibilitas.p0_opening.label_meaning` (`docs/content/glossary.json:712` on the working tree, currently `"Ini adalah bacaan tentang dua individu: {A} dan {B}"`). It closes B19 in `docs/content/voice-constraint-rulings-2026-09-26.md`. Why: his earlier draft said "perbedaan fokus kalian", which is false for Pola Cermin (`p4_matching`) and Pola Serumpun pairs. "bertemu atau berbeda" is true of every pair.

Cowork's ban-list sweep of the substituted text (Matahari / Taman): compiled as `new RegExp(entry.pattern, entry.flags || 'iu')`, 70 patterns, **0 hits**. The control `Kalian cenderung sangat cocok dan selaras.` hit 3. No em-dash, no curly quotes, no `?`, no `bukan…tapi`. 3-gram overlap with the glossary is phrase-level only ("satu sama lain", "dan apa yang"). That sweep ran against `feat/voice-v2`'s blocklist, so re-run the repo's own glossary sweep on main.

## Where and how (one PR to main, two commits, Reyner approves the merge)
1. **Rulings commit.** Record it in `docs/content/compat-glossary-rulings-2.md` as the file itself asks ("the row is corrected HERE as well"): update the row, and add an `AMENDED 2026-09-28` note with the old text, the new text, and the reason above. Set the B19 row in the voice rulings file to RULED, pointing to that file. Commit this amendment file in the same commit.
2. **Apply commit.** Change the glossary cell (use `scripts/apply-rulings.mjs --expect 1` if it accepts this file; otherwise say how you applied it). **Byte for byte. Do not touch his words.**

## What to check, each shown red first
- **Terminal punctuation.** The old cell had no final full stop and the render adds one (`lib/render/pairOpening.js` header: "it only appends a full stop"). The new cell ends in `.`. Prove the served opening block equals the ruled text with `{A}`/`{B}` substituted, **exactly one** final full stop, on the model path AND the floor path. The test must fail on the old glossary.
- **Gates vs a ruled string.** Run the v1 gate, and the v2 gate on `feat/voice-v2` after the merge below, over PZ0t and rVe4ca, floor and render. That covers `pair.both_named`, the p0 byte-equality check, sentence-length and pronoun rules (the new text says "kita"), and bracket insertion (the opening must stay exempt). **If any check rejects this line, the presumption is that the check is wrong. Report it and stop. Do not bend the wording.**
- **Cache.** Report, don't change: does changing this glossary text change pair cache keys (so every pair re-renders once, including the 2026-09-08 g4WH4 row), or do cached pair rows keep serving the old opening? Quote the code that decides it. Do not touch the database.
- **Compat PDF.** The opening is now two sentences. Render one compat PDF on main and report whether page 1 still fits. Name the page and quote what is on it.
- Update the comment at `lib/validate/v2.js:165` that quotes the old sentence as "Reyner's ruled sentence". Point it to the glossary cell instead of quoting it. Leave `pairOpening.js:13` alone: it quotes a historical measurement.

## Order within the AI handoff
- Do this after §1 (the #153/#154 merges) and **before §4**, the representative test.
- After it merges, merge main into `feat/voice-v2` again (merge, don't rebase), so the test pairs carry the ruled opening.
- If Reyner has not yet approved this merge when you reach §4, do §2 and §3 first and wait. Do not run the test on the old opening.

**What the customer gets:** a first sentence that is true for every pair type, including matching pairs, and says what the reading will cover.
