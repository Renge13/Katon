# Prompt BC, amendment 2c: paragraphs per chapter (Reyner ruled 2026-10-04)
Goes in the working tree as `docs/prompts/BC-amendment-2c-paragraphs.md`. Untracked until you commit it: commit it on #197 with §0.

Cite the four checks. No regex through a shell heredoc. No model-based judge.

**Order:** after 2b's commits. Then one re-run covers 2b and 2c together. Stop after it. Do not merge #197 or #198. No gate change: STAGE6 stays 1.73.0 and no check is added, removed or loosened (assert the constant in the commit message).

**The diagnosis (Reyner):** "the readings are thin because the writer is collapsing each chapter into one paragraph and losing the daily-life scene. This is a structural problem, not a word-count problem." Evidence: one paragraph per chapter in 7 of 8 renders (amendment 1) and 8 of 8 (amendment 2), with the prompt asking for two or three; the writer returns each chapter as one `text` string.

## §0. Record (one docs-only commit on #197)
Add to `docs/product/compat-rulings-2026-10-02.md`, after "Amendment 2 (Reyner, 2026-10-04)", as **"Amendment 2c (Reyner, 2026-10-04)"**, verbatim:
- "Give each chapter 2 or 3 paragraph entries rather than one text field."
- "The first paragraph explains the chart/fact in the reading's voice."
- "The second paragraph is specifically a concrete, ordinary-life scene showing how that pattern can appear between the two people."
- "A third paragraph is allowed only when it genuinely adds something; do not pad."
- "Preserve the final rendered output format by joining the paragraphs downstream. Nothing else in the product should change."
- "Add the one prompt line for `membawa elemen`: use that wording only when describing what one partner brings to the other; describe a person's own element in another way."
- "Keep the existing check. Do not create a new gate."
- "Do not treat 800-1,000 words as a target. The objective is restoring the missing scene paragraph and the resulting reading depth."

## 1. Pair output shape (red first)
- **Pair only.** The mirror's schema, prompt and parse do not change; keep or add a test that asserts the mirror schema is byte-identical.
- The v2 pair response schema (`lib/render/schema.js`, and wherever the provider receives it) changes each block from `text: string` to `paragraphs: string[]`, keeping `fact_ids` and `heading`, property order `fact_ids`, `heading`, `paragraphs`. Ask for 2 to 3 items with `minItems`/`maxItems` only if the Gemini response schema honours them (check the provider docs or the API's reply; report which).
- **Join at parse:** the pair parse turns `paragraphs` into `text` by joining non-empty, trimmed entries with two newlines. Everything after the parse (Stage 6, cache, floor, PDF, result page) receives the same `{fact_ids, heading, text}` shape it receives today. Assert this with a test.
- **No new rejection.** A block with one paragraph, or more than three, is accepted and joined as given; only today's existing shape errors (missing or empty content) still throw. Count paragraphs in the report instead.
- `penutup` stays one string.

## 2. Pair prompt, two edits (one commit, red first, one prompt-version bump)
File: `docs/content/compat-renderer-prompt-v2.txt`.

a. **"Form"**: replace `Six to eight chapters, each two or three paragraphs.` with:
> Six to eight chapters. Each chapter is two or three paragraphs in `paragraphs`: the first says what the fact means for these two people, in the reading's voice; the second is a concrete, ordinary-life scene showing how that pattern can appear between them; a third only when it adds something new. Never pad.

In the same line, change the JSON shape to `{"blocks":[{"fact_ids":[...],"heading":"...","paragraphs":["...","..."]}],"penutup":"..."}` and delete `Paragraph breaks are two newlines.`

b. **"Facts"**: append after "Do not present one chart fact as the chart cause of another unless the JSON says so.":
> Write "membawa elemen" only for what one partner brings to the other (`p3_supply`). Describe a person's own element in another way.

Report the old and new pair prompt versions. The mirror prompt does not change.

## 3. Re-run (8 renders, covering 2b and 2c), then stop
Same four pairs, two renders each at 0.7, production path, same script. New QA doc, same shape as `docs/qa/2026-10-04-bc-names-close-round.md`, plus:
- paragraphs per chapter, from the writer's raw `paragraphs` arrays and from the served text;
- for every second paragraph: is it a scene (people doing something in an ordinary moment)? List the ones that are not, sentence by sentence; no model judge, a person reads them;
- `pair.supply_inverted` rejections and their sentences (2 of 8 renders last round, both "membawa elemen" on a person's own element);
- the counts of "dinamika"/"menopang", "kamu"/"-mu" sentences, and penutup sentences with "jika", "dengan menyadari" or "dengan menghargai", against the last round;
- words, as information only. No word-count target.

**Side-by-side (Reyner asked for it; you build it):** one table, three columns: the gold sample's "Alur Peran yang Menghidupkan" chapter (`docs/content/compat-target-sample-2026-10-02.md`), sample render 2's corresponding chapter from the last round ("Alur Energi yang Mengayomi", `docs/qa/2026-10-04-bc-names-close-round.md`), and this round's sample render 2 chapter that draws on the same fact (`p1_stem_relation`). Verbatim text, paragraph breaks kept, with each column's paragraph count. Put it near the top of the QA doc.

**Stop.**
