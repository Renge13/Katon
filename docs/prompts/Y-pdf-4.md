<!--
STATUS: RELEASED 2026-09-14 by Reyner (launch-first; whole cells in the appendix). Written by Cowork.
Code commits it FIRST, alone, on `feat/pdf-appendix-card`. Small PR; may run alongside Prompt U.
-->

# Prompt Y-4 — the PDF as a document, not an index (both PDFs)

From Reyner's read of the compat PDF, 2026-09-14. Two of his three points are PDF-only and land here;
the third (reading synthesis: summary, themed chapters, tips) is Prompt Z2, post-launch by his ruling.

RULED (Reyner, 2026-09-14): kill page-number cross-references; glossary stays as an appendix, as one
compact two-column "Kamus Ringkas" at the very end; appendix prints the ruled `label_meaning` cells
WHOLE (no truncation to one sentence). Applies to the mirror Complete Edition and the compat PDF.

## Commit 0 — this file, alone; ruling recorded in PROGRESS.

## Commit 1 — no more `hal. N`
Delete the reference lists ("Yang ada di baganmu" + `hal. N` rows) from the chart pages and the
facts page, both composers. Keep `buildPdf`'s fixed point and the three verifies as code (they cost
nothing and protect any future anchor) but they now converge on pass 1 with zero references; assert
that. Red first: the page-text fixture for chart 1 shows the reference rows gone; `REF_PREFIX` absent
from every page text of both documents.

## Commit 2 — the appendix as a Kamus Ringkas
One heading (`APPENDIX_HEADING` stays), then a two-column table: term (`name_id`; a `label: null`
condition keeps NO name per Prompt M correction 1 and prints only its meaning in the right column),
meaning (`label_meaning` whole). Groups keep Prompt M's `GROUP_ORDER` as thin sub-headings. Target one
page for the mirror's chart 1, one to two for a pair; page count is a consequence, assert nothing on
it. `assertEveryMechanicExplained` and `assertAnchorsUnique` unchanged. Collision instrument
(`inspect.js`) must report 0 on both documents after.

## Commit 3 — compat facts page tidy
Merge the two `Penyeimbang Unsur` rows into one row with both columns filled (the meaning printed
once). Emit the P5 quadrant `name_id` as the reading's title line directly after the engine P0
sentence — engine structure, rule 14, no new string, no verdict word; on the web report too
(`PasanganReport`), same source, so PDF and page agree. Red first: Y-1 reading page shows
`Tarikan Tenang, Ritme Bergesek` once as a heading before the first block; the web report DOM the same.

## Commit 4 — rebuild, re-pin, ledger
Rebuild Y-1 to `Claude outputs/`; re-pin the mirror page-text fixture with the ruling named; PROGRESS
row with page counts before/after; NEXT.md pointer. Cowork reads the PDF before Reyner does.

## NOT IN THIS PROMPT
No prompt or gate change. No new Indonesian. No synthesis, summary or tips (Z2). No design pass beyond
what the table needs to be legible.
