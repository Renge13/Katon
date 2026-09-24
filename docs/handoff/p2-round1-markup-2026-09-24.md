# P2 round 1 markup: PR #128 PDFs, read page by page by Cowork (2026-09-24)

**NOT DURABLE UNTIL CODE COMMITS IT** as `docs/handoff/p2-round1-markup-2026-09-24.md`.

Source: `reports/pdf-passable/round1/mirror.pdf` (7 pp) and `round1/compat.pdf` (9 pp). Both are cached
MODEL RENDERS, not floor. Read as page images. Class legend as in `p2-markup-2026-09-22.md`:
DEFECT = Cowork/Code fix without a ruling. COPY = Reyner's alone. Column R = Reyner's mark; for this round every mark is Cowork's, by Reyner's delegation of 2026-09-24.
**This is round 2 of 2 (the cap). After it: ship or park.**

## Code's five visible calls (PR #128 description)

| # | Call | Cowork | R |
|---|---|---|---|
| 1 | Free reading penutup loses serif italic (shared component) | accept: one body style is what A4 asked for | ok (Cowork, delegated by Reyner 2026-09-24) |
| 2 | Free headings unchanged | nothing to rule | ok (Cowork, delegated by Reyner 2026-09-24) |
| 3 | CE cover `Matahari` + `The Sun`, element dropped | accept. This is Reyner's own A3 ruling (09-22: Indonesian H1, English once, smaller). Cowork's 09-23 "push back" contradicted it and is withdrawn. Element on the cover is optional taste; reading p2 line 1 already says "Api Matahari". | ok (Cowork, delegated by Reyner 2026-09-24) |
| 4 | Compat cover, no hanzi motif | accept | ok (Cowork, delegated by Reyner 2026-09-24) |
| 5 | Table pages wider than prose pages | accept | ok (Cowork, delegated by Reyner 2026-09-24) |

## New rows from the page read

| # | Where | Class | What I see | Fix | R |
|---|---|---|---|---|---|
| R1 | compat p7 foot to p8 | DEFECT (A9 not fixed) | Glossary label `Lemah` sits alone at the foot of p7; its meaning starts p8. A9 (09-22, marked ok) is exactly this. The #126 orphan/widow test covers prose paragraphs, not glossary rows, so it passed. | Keep each glossary row (label + meaning) unbreakable, and keep a group heading with its first row. Red-first: an assertion that FAILS on this round-1 compat PDF (label on one page, meaning on the next). | ok: each glossary row (label + meaning) unbreakable, group heading kept with its first row; red-first on round1/compat.pdf (Cowork, delegated by Reyner 2026-09-24) |
| R2 | compat glossary p7-p8 | COPY / structure | The compat glossary merges BOTH charts' terms, but the entries are the mirror's second-person text. So terms from HIS chart are told to HER: `Seimbang` "Baganmu berdiri di titik tengah yang stabil" (she is Lemah, one row above); `Dominan Tanah` "Baganmu didominasi elemen diri" (she is Dominan Air); `Tanah` "...padamu"; `Ikatan` "Dua bagian dari baganmu"; `Aspek Pendorong`, `Aspek Pelindung`, `Mata Pisau`, `Bintang Perantau` all "Kamu ...". False statements about the buyer, same class as C2. Present on 09-22 too; Cowork missed it then. | **Cowork recommends A:** compat glossary = the `Kompatibilitas` group + terms from the READER's own chart + Shio (Shio text is neutral, no kamu). Terms only in the partner's chart are dropped. No new strings. B: keep his terms under a "Dari bagan dia" group, which needs Reyner-written third-person meanings (new copy, round 2 cannot absorb it). | A: Kompatibilitas group + the reader's own chart terms + Shio; partner-only terms dropped (Cowork, delegated by Reyner 2026-09-24) |
| R3 | both covers | ruled (A2), applied inconsistently | CE: `13 Sep 1989, 09.00` (no gender). Compat: `Perempuan, 13 September 1989 dan Laki-laki, 4 Maret 1990` (full month, gender first). A2 ruled the `birthSummary` form `13 Sep 1989, 09.00, Perempuan` for both. | Both covers use `lib/site/birthSummary.js` output unchanged. Compat: one line per person. Reyner confirms gender on the CE cover. | ok: both covers print birthSummary output unchanged, gender included; compat one line per person (Cowork, delegated by Reyner 2026-09-24) |
| R4 | chart pages, both | COPY (small) | Bar values use a decimal POINT: `27.5`, `58.8`, `1.3`. Indonesian readers expect a comma (`27,5`). | Format with `id-ID` (comma). Same fix on the web report if it shows the numbers, so the two match. | ok: id-ID formatting (27,5), and the same formatter on the web report if it shows the values (Cowork, delegated by Reyner 2026-09-24) |
| R5 | both covers | COPY (optional) | Colophon shows `prompt 22316c3349d0ea46 - gate 1.25.0` to the buyer. Useful for support, meaningless to her. | Keep (muted, and it identifies the render for support) or shorten to `katon.app - 0.4.4`. Cowork: keep. | keep the colophon (Cowork, delegated by Reyner 2026-09-24) |
| R6 | chart page, both | park | `Pilar Konsepsi` is shown but explained nowhere (A7 dropped its empty row). | Park: needs a ruled `label_meaning` for 胎元. DEFERRED REGISTER row. | park: DEFERRED REGISTER row (Cowork, delegated by Reyner 2026-09-24) |

## Checked, fine
Covers read as objects (A1). Titles first (C1). Serif headings, ~70ch measure (A12). Running footer (B2).
Element bars drawn (A10). Both charts on one page (C5). Facts table: muted descriptions, `子 Tikus` on one
line, verdict as a full-width closing line (C3, C4). C2 frame sentence appears once. No empty meaning
cells. `Tanpa Kayu` / `Dominan Air` labels (A6). CE glossary count "20 istilah" matches its rows (5+3+4+1+4+3).
