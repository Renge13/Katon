# Prompt BN: /privasi discloses the link source (Reyner ruled 2026-10-09)
Goes in the working tree as `docs/prompts/BN-privasi-source-line.md`. Untracked until you commit it: commit it in this PR.

**Self-contained: you may be a fresh Code session.** Read `CLAUDE.md`. Work in your own worktree. Branch `copy/privasi-source-line` off `origin/main` (must contain #213, `52a692d`). Report the open-PR list first.

Cite the four checks. No regex through a shell heredoc. No model-based judge. Red first. Copy only: no engine, glossary, writer-prompt, PDF, analytics or Stage 6 change. **Do not merge.**

## Why
Since #213 a reading's `reading_created` (and a pair's `pair_created`) carries the link code, referrer host and landing segment. `/privasi` says page visits are counted anonymously without cookies, which stays true, but it does not say the source is recorded with the reading. Reyner approved the disclosure sentence 2026-10-09.

## Ruled (Reyner 2026-10-09), verbatim
Append this sentence to `PRIVASI_COPY.collectNote` (`lib/site/copy.js` ~451), after the existing last sentence, separated by one space:

`Kami juga mencatat dari tautan atau situs mana kamu datang, bersama bacaanmu, supaya tahu tautan mana yang berguna.`

Cowork swept it 2026-10-08/09: 0 hits on the 18 live blocklist patterns (compiled `new RegExp(entry.pattern, entry.flags || 'iu')`; controls `Kamu akan kaya jika investasi saham.` 2 hits, `Pola a_generates_b terbaca.` 1 hit); no rule-20 characters.

Two commits in one PR: (1) the ruling recorded where `/privasi` rulings live (find the existing record for `collectNote` / the 2026-10-06 analytics sentence; if none, a dated line in PROGRESS next to the `/privasi` decision), (2) the string change. Update copy-bank counts or snapshots with the arithmetic shown.

## Validation and report
Red first: a test that `/privasi` renders the new sentence, failing on `main`. `npm test`, `npm run check:qa`, `check:copy`, CI green. Screenshot of `/privasi` at 375px showing the paragraph. Report the PR link and preview URL. **Do not merge.**
