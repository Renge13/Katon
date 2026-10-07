# Prompt BH: compat sales copy (Reyner ruled 2026-10-07)
Goes in the working tree as `docs/prompts/BH-compat-sales-copy.md`. Untracked until you commit it: commit it in this PR.

**Self-contained: you may be a fresh Code session.** Read `CLAUDE.md`. Read `.git/HEAD`. Work in your own worktree, not the main checkout. Branch `fix/compat-sales-copy` off `main` (must contain #206, `a561dfc`). Report the open-PR list first.

Cite the four checks. No regex through a shell heredoc. No model-based judge. No engine, glossary, writer-prompt or Stage 6 change. Red first. Never set `PAYMENTS_PROVIDER=mock` or `COMPAT_SALES` on any Preview. **Do not merge.**

## Why
Compat went on sale today. Its page (`/kompatibilitas`, `PASANGAN_COPY` in `lib/site/copy.js` ~803-812, rendered by `components/Pasangan.jsx` ~266-340) still promises "Pola hubungan: Cermin, Serumpun, atau Kontras". Kontras was retired by #206. Reyner rewrote the page lead and the inclusion list.

## The ruled strings (verbatim, Reyner 2026-10-07)
**`page_lead`** (replaces "Peta dinamika dua pola: ..."):
`Pahami dinamika antara dua orang. Temukan di mana kalian mudah sejalan, di mana sering terjadi salah paham, dan bagaimana cara terbaik untuk saling melengkapi.`

**The inclusions: four items, replacing the five `includes_1..5`.** Each has a label shown **bold**, followed by its text in the normal weight:

| # | label | text |
|---|---|---|
| 1 | Karakter Bawaan: | Bagaimana sifat asli kalian berdua berpadu saat sedang bersama. |
| 2 | Pola Interaksi: | Apakah kalian sefrekuensi, saling memotivasi, melengkapi kekurangan, atau justru sering berdebat. |
| 3 | Titik Gesekan: | Mengetahui hal-hal spesifik yang berpotensi memicu konflik dan cara meredamnya. |
| 4 | Dinamika Hubungan: | Bagaimana kalian saling mendukung, menyeimbangkan peran, dan menyelaraskan langkah. |

Unchanged: the title "Bacaan Kompatibilitas", the price, `price_note`, the form, `/harga`.

Cowork swept all five strings 2026-10-07 against `main`'s blocklist, compiled as `style.js:63` does (18 patterns): clean; controls fired. No em-dash, no question mark.

**Ruled scope (record it):** Reyner's draft ended the lead with "baik sebagai pasangan, keluarga, sahabat, maupun rekan kerja". That clause is OUT for now, by his decision on Cowork's advice: the product only offers PDKT / Pacaran / Menikah, and the reading's P2 seat (day branch = spouse palace), P5 pull quadrant and Bunga Persik are romantic. It returns when a non-couple compat exists.

## The work
1. **Commit 1, ruled words only:** add the six strings and the scope note to `docs/content/pasangan-copy-rulings.md` as a dated amendment (follow the file's own format), and update `docs/content/compat-surface-strings-review.md` so its rows are not stale. This prompt file goes in this commit.
2. **Commit 2, code.** Cowork's technical ruling: store each item's label and text as **separate fields** (e.g. `includes: [{ label, text }, ...]` or `includes_N_label` / `includes_N_text`, your choice, say which). Never split a string on its colon at render time. Render the label in a `<strong>` (or the existing bold weight token) followed by a space and the text. Delete `includes_5` and the old `includes_1..4` values; update the comment above them (it names the P1..P5 journey order, which no longer applies).
3. Red first: update `tests/compat-surface.spec.mjs` so it fails on `main` (e.g. asserts the page contains no "Kontras", contains the ruled lead, and renders exactly four items with each label in bold). Show it red, then green.
4. Grep `lib app components tests scripts docs/content` for `Kontras` and report every hit with file:line. Change only reader-visible strings on the compat page. Leave the glossary's retired `p4_contrasting` and the writer example alone (both are logged follow-ups).

## Also record (PROGRESS DEFERRED REGISTER, one row)
"Non-couple compat (Keluarga / Sahabat / Rekan Kerja). Ruled out of BH by Reyner 2026-10-07. Needs: new status options; a written source before reading the day branch (spouse palace) for non-couples (rule 4); non-romantic P2 and P5 cells and Bunga Persik handling; a writer-prompt pass. Trigger: demand from couples' sales. Unguarded meanwhile: nothing, the page no longer claims it."

## Validation and report
`npm test`, `npm run check:qa`, CI green. Check the page on a phone-width view in your local dev server (or describe why not). Report: open-PR list, the field shape you chose, red/green output, the `Kontras` grep list, the PR link and its preview URL. **Do not merge.**
