# Prompt AB — PAID PRODUCT PASSABLE ("P2"): both PDFs + the on-screen compat report (Cowork, 2026-09-22). RELEASED.

**Code: commit this file alone as `docs/prompts/AB-paid-passable.md`, first commit of the branch.** Cowork's
tree writes are not durable (COWORK-BRIEF §4). Input: `docs/handoff/p2-markup-2026-09-22.md`, every row
marked **ok** by Reyner on 2026-09-22 (his marks are in the project copy; the repo copy carries them too once
you commit his version - ask him to paste the marked file if the tree copy is unmarked).

Cite the katon skill's four checks before starting. Facts below were read from the tree at
`.git/HEAD` = `ref: refs/heads/docs/launch-cut` (payment/PDF files identical to main; re-grep before editing).

## 0. What this buys a customer (CHECK 4)
The Rp 19.000 and Rp 39.000 documents look finished on her phone, say nothing twice, print no empty cell,
and speak Indonesian on every line including the cover. The screen report stops opening a paragraph gap
and stops printing an eyebrow with nothing under it. Nothing in the PROSE changes (Z2, post-launch).

## 1. Scope
`lib/pdf/document.js`, `lib/pdf/pairDocument.js`, `lib/pdf/appendix.js`, `lib/pdf/pairAppendix.js`,
`lib/pdf/fonts.js` (+ `lib/pdf/fonts/`), `lib/pdf/build.js` (page-break helpers only), `next.config.*`
(`outputFileTracingIncludes` for any new font), `components/ProseBlocks.jsx` / `PasanganReport.jsx` for
the two screen defects, `tests/pdf-*.spec.mjs`, `docs/PROGRESS.md` LIVE STATE rows for both PDFs.
NOT in scope: the renderer, the prompt, the glossary MEANINGS, the facts chosen, section order, the
reading page's prose. A new visible string is a `PENDING()` sentinel unless §4 says it is ruled.

## 2. ONE CORRECTION TO THE MARKUP, before anything is built (CHECK 1, Cowork's error)
Markup row **C2** called the three identical descriptions under `Kursi Terikat / Berbenturan / Bergesekan`
a DEFECT ("a glossary entry lost its key"). It is not. `pairDocument.js:145-193` shows those are PALACE
FRAME rows and the identical sentence is `p2_palace_frame.label_meaning`, printed on every frame row **by
Reyner's ruling of 2026-09-14 (ruling 1)**: the relation's own meaning must NEVER appear on a frame row.
The cell is nameless by design (`pairAppendix.js:111` treats it as a condition). So there is no key to
restore and no test about "shared description" to write. What remains is the VISIBLE problem Reyner marked
ok on: a buyer reads one sentence three times. Cowork's fix, a layout of ruled content with no new words:
print the frame sentence ONCE as the lead line of a frame group, then the frame rows beneath it carrying
term + branches + columns and NO meaning cell. Same for the appendix: `p2_palace_frame` and `p2_reframe`
are frames, not terms; they leave the legend (they already appear in the table and the reading). **Reyner:
this is visible - say no and the rows keep the repeated sentence.** Ledger this correction in COWORK-BRIEF
§4: Cowork read the PDF (right) and named a cause from architecture instead of from the composer (wrong).

## 3. Defects - build first, red test first (CHECK 2), no ruling needed
| markup | fix | test that FAILS on today's PDF before the change |
|---|---|---|
| A4 penutup style | `PDF_STYLES.penutup` (`document.js:93`, `fontSize: 12, lineHeight: 1.25`) becomes the body style (11/1.6) + `marginTop`. Same in `pairDocument.js`. | text runs of the penutup have the same font size as the body runs (read from the built PDF with the existing inspector, `lib/pdf/inspect.js`) |
| A5 orphan page | widow/orphan control: `minPresenceAhead` / `wrap={false}` on the last N lines; a heading keeps its first 3 lines (`break` rules react-pdf supports). | no page whose text is < 3 lines when the previous page is full; compat fixture p3 today is exactly that |
| A6 unnamed element cells | `elemen_hilang/*` and `elemen_dominan/*` have no `name_id` by design. **RULED 2026-09-22 (Reyner): label format `Tanpa [Elemen]` / `Dominan [Elemen]`.** Derive the element word from the ruled element names already in the glossary (`Kayu Api Tanah Logam Air`); no new string bank entry, the format is the ruling. Applies to BOTH appendices. | no appendix row with an empty term (mirror + compat fixtures both fail today: 3 and 4 rows) |
| A7 empty meaning | `pilar/conception.label_meaning` is empty. The row AND its group are omitted when the meaning is empty (the chart page already shows 胎元). If Reyner later rules a meaning, it prints. | no appendix row with an empty meaning; no group with zero rows |
| A9 split label | keep-with-next on the term cell (`wrap={false}` on the row `View`). | no page ending in a term whose meaning starts on the next |
| C2 repeated sentence | §2 above. | frame sentence appears exactly once in the facts page text |
| screen: paragraph gap | one paragraph style in `ProseBlocks.jsx`; penutup by space, not size. | DOM: every `p` in the report shares font-size and line-height |
| screen: PETA DINAMIKA eyebrow | component rule: an eyebrow renders only when a heading follows it; a headingless block gets the eyebrow's text AS its heading (engine-owned words, no new string). | render the fixture report: no eyebrow element whose next sibling is a paragraph |

## 4. Layout - all marked ok, build in the same round, Reyner judges on the preview PDFs
- **A1 cover.** Wordmark (the header's `SiteHeader` mark as SVG/PNG, already in the repo) top-left; product
  eyebrow **RULED: `Edisi Lengkap` / `Bacaan Kompatibilitas`** (literals, ruled 2026-09-22); Indonesian
  archetype as title (A3, ruled); English pair once, smaller; birth line(s) from `lib/site/birthSummary.js`
  (`birthSummary` / `pairLine`, A2 ruled - kills the ISO date and `female/male`); disclaimer + colophon
  move to the cover foot (A11). The hanzi of the four pillars as a quiet motif (FAMILY_HAN, low contrast)
  if it costs nothing; skip if it fights the title.
- **A8 appendix table.** term column 150pt with wrap, meaning column the rest; 6pt more between rows;
  group heading `marginTop` twice the row gap.
- **A10 element bars.** five rows: label, a filled `View` whose width is the percentage of the widest,
  value right-aligned. Ink `#1A1A1A` on `#EEE` track; no colour semantics (rule 25 keeps scores quiet -
  the values already print, the bar is the same number drawn).
- **A11/C5 chart pages.** compat: `Bagan Kelahiranmu` and `Bagan Kelahiran Dia` on ONE page, stacked, each
  block with its own element bars; mirror: chart + bars + Pilar Konsepsi on one page with no colophon.
- **A12 type.** Measure: page padding so the text column is ~70 characters at 11pt (about 60mm margins on
  A4 or a 2-column facts page - pick by trying both on the compat fixture). Headings: embed **Spectral**
  (the site's `--font-serif`, OFL, `next/font/google` in `app/layout.js`) - put the TTF under
  `lib/pdf/fonts/`, register via `Font.register`, add it to `outputFileTracingIncludes` exactly as the Han
  face is (the #123 lesson: a font that is not traced 500s in the lambda and never locally), and PROVE it
  on a preview deploy by fetching both PDF routes (the smoke fetch the deferred register already names).
  If Spectral cannot be embedded for any reason, heavier Helvetica-Bold headings + 1.5x space above; do not
  spend a round on it. Body stays Helvetica (or Hanken if the same embedding path is trivially reused).
- **B2 running footer.** `Katon - Edisi Lengkap` / `Katon - Bacaan Kompatibilitas` bottom-left on every
  page after the cover, 8pt muted. No page numbers (ruled out 09-14).
- **C1 headline order.** `Tarikan Kuat, Ritme Bergesek` first as the page title; the `p0_opening` line as
  its sub-line.
- **C3 facts rows.** description 9.5pt muted under the row, 10pt before the next row; hanzi + animal on one
  line (`子 Tikus`) in each column.
- **C4 verdict row.** the quadrant row (`Tarikan Kuat, Ritme Bergesek`) renders full-width as the table's
  closing line, no empty cells.

## 5. Round structure - CAP TWO
Round 1: everything in §3 and §4; PR with both fixture PDFs rebuilt into `reports/pdf-passable/` (gitignored,
send them to Reyner) plus 390-wide screenshots of the report page. Reyner reads on his phone, marks. Round
2: his marks only. Anything still open after round 2 goes to the DEFERRED REGISTER with what it costs a
buyer. Page count is a consequence, assert nothing on it (Y-4 rule); the fixed-point verifies keep running.

## 6. Ledger (Code writes)
LIVE STATE: both PDF rows describe the new documents; the compat row's "NOT YET REACHABLE" is already
corrected (`69cea31`). COWORK-BRIEF §4: the C2 mis-diagnosis (§2). DEFERRED: anything from §4 not landed.
`docs/NEXT.md` pointer moves to this prompt when work starts.
