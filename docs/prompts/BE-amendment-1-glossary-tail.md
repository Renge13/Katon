# Prompt BE, amendment 1: the glossary's last group (fresh Code session, 2026-10-06)
Goes in the working tree as `docs/prompts/BE-amendment-1-glossary-tail.md`. Untracked until you commit it: commit it on #199.

**You are a fresh Code session.** The previous one ran out of context. Before anything: read `CLAUDE.md`, `docs/prompts/BE-post-purchase-polish.md` (the prompt #199 implements) and the §0 entries already on the branch. Read `.git/HEAD`; you should be on `feat/post-purchase-polish` at `6376108` or later.

Cite the four checks. No regex through a shell heredoc. No model-based judge.

## Where #199 stands (from the previous session's report)
- PR [Renge13/Katon#199](https://github.com/Renge13/Katon/pull/199), branch `feat/post-purchase-polish`, head `6376108`, NOT merged, Auto-fix OFF. Full suite 108/108.
- Done: §0-§5 of BE; download line under the tapped button (`2153d97`); compat lands on the start of the paid reading (`e2bb3e2`); PDF page breaks: headings keep room for five lines, the facts table's last two rows move together (`e7239dc`), probe `probe-page-breaks.mjs` clean on 38 documents; §0 amendments (`f512333`); page images in `docs/qa/2026-10-06-be-pdf-page-breaks/`.
- STAGE6 stays 1.73.0; both writer prompts unchanged.

## The one change (Reyner approved, 2026-10-06)
In the Complete Edition built from the clash text, page 8 holds only the glossary's last group ("Shio (tahun lahirmu)" with its single row "Kerbau") on an otherwise empty page (`docs/qa/2026-10-06-be-pdf-page-breaks/ce-clash-08.png`). Apply the same rule as the facts table: **the glossary's last group never sits alone on a page; it moves together with the group before it** (or with the last rows of that group). Both editions, wherever the glossary appears.

1. Extend the probe and the page-break spec: a check that fails on `6376108` for the clash Complete Edition (stop counting at the end of the glossary; the closing page is not glossary).
2. Fix, then re-run the probe over the same 38 documents; zero lone last groups and zero lone facts rows, zero stranded headings.
3. Read every changed page yourself; attach before/after images of the changed pages to the PR.
4. Full suite green. Commit, push. **Do not merge.** Report and stop.
