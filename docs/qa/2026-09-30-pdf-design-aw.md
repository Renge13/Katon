# Complete Edition and Compatibility PDF: the web's design (Prompt AW)

**Date:** 2026-09-30. **Branch:** `feat/pdf-web-design` (on #182, so the badge cards carry every pillar). Styling and structure only: no engine, gate or prompt change.

```
node scripts/qa-pdf-design.mjs before     # on the branch before the design commits
node scripts/qa-pdf-design.mjs after
node scripts/qa-pdf-reading-diff.mjs reports/pdf-design/before reports/pdf-design/after
```

**What the images are made of.** The two Complete Editions carry REAL renders: the AV §3 smoke readings for smewTN (2001-02-14 13:00, female) and chart1 (1989-09-13 09:00, male). **The Compatibility PDF (smewTN + chart1) is THE FLOOR**, the deterministic fallback prose, because no render exists for that pair. Judge its layout, not its prose.

Every page, before and after, as JPEG at 110 dpi: `2026-09-30-pdf-design-aw/before/` and `after/`, named `<doc>-pNN.jpg`.

## Pages

| Document | Before | After | Where the page went |
|---|---|---|---|
| Complete Edition, smewTN | 7 | 8 | Tanda Istimewamu (four cards) now on the chart page: three of them flow onto a page of their own |
| Complete Edition, chart1 | 6 | 7 | the same |
| Compatibility, smewTN + chart1 (floor) | 8 | 7 | both charts on one page (C5), the appendix shorter (one Shio per person) |

## The reading text is unchanged

`qa-pdf-reading-diff.mjs` reads the reading pages (Bacaanmu to Bagan Kelahiran) as one word stream and compares it with the SOURCE prose, the smoke record:

```
ce-smewTN before: 408 words vs source 408: IDENTICAL
ce-smewTN after: 408 words vs source 408: IDENTICAL
ce-smewTN after, prose case-sensitive: IDENTICAL
ce-chart1 before: 466 words vs source 466: IDENTICAL
ce-chart1 after: 466 words vs source 466: IDENTICAL
ce-chart1 after, prose case-sensitive: IDENTICAL
```

Headings compare case-folded: they are set as the web's uppercase eyebrow. Shown able to fail: one planted word ("kokoh" to "kukuh") reads `DIFFERS at word 12`, exit 1.

## The measure

Median characters per line on the reading pages: **68** (smewTN) and **69** (chart1), quartiles 65-71. Was 73 before. AW asks for about 65-70.

## §3: glossary and chart-page clarity

1. **Shio: only the year animal. Built.** The appendix's Shio group holds the year branch's animal alone (smewTN: Ular), labelled **"Shio (tahun lahirmu)"** (`RENDER_COPY.pdfShioGroupMirror`; AW's default, RULED by Reyner 2026-09-30 in Prompt AX). The Compatibility PDF: one year Shio per person, deduplicated, under the plain **"Shio"** (a "-mu" label would be false of the partner; a second label is Reyner's to write, not Code's).
2. **"Seimbang" beside "Dominan Tanah". Nothing changed.** The two cells:
   - `kekuatan.balanced.label_meaning` (printed as **Seimbang**): "Baganmu berdiri di titik tengah yang stabil. Kamu sanggup menopang dirimu sendiri sekaligus tetap terbuka menerima dari luar. Situasi berubah, tetapi kamu jarang ikut goyah."
   - `elemen_dominan.same.label_meaning` (printed as **Dominan Tanah**): "Baganmu didominasi elemen diri. Kamu melangkah tanpa perlu izin orang lain, dan tak suka ruang pribadimu diatur-atur."
3. **Numbers under Sebaran Unsur: dropped** (AW's default), in both documents. The test that pinned "27,5" now asserts no value prints.
4. **"PALING KUAT" on a scale that says it is not strength. RULED 2026-09-30 (Prompt AX): "PALING BANYAK" / "PALING SEDIKIT" on web and PDF, and a tie tags every tied element; built in #186 (smewTN now tags Tanah AND Logam). The images below predate that ruling.** As first reported: How the tag is chosen (`lib/site/elements.js presenceBars`, the web's own): each value as a share of the largest, rounded; **the FIRST bar with the highest share** is tagged Paling kuat and **the FIRST with the lowest** Paling tipis, in `element_presence` order (Kayu, Api, Tanah, Logam, Air). **A tie tags one bar, the earlier**: smewTN's Tanah and Logam both read 36,3 and only Tanah is tagged.
5. **Tanda Kekosongan's meaning ends on a fragment. Not edited.** `bintang.空亡.label_meaning`: "Orang lain melihat kamu berhasil di bidang ini, tetapi kamu sendiri sering merasa belum pantas menyandangnya. Hasilnya tidak pernah kurang. Rasa memilikinya yang tidak pernah ikut hadir."
6. **Pilar Konsepsi has no explanation. Kept.** Display-only by the 2026-08-07 ruling (`pilar.conception` carries no `label_meaning` on purpose). Open for a one-line meaning Reyner writes.
7. **What a first-time reader trips on** (listed, not fixed):
   - **The cover's provenance line**: "katon.app - 0.4.4-stage3 - prompt v2-c3fa645503fe6d12 - gate 1.62.0". Engine, prompt and gate versions, on the first page, with no meaning for her.
   - **"Sebaran visual, bukan ukuran kekuatan."** directly above a tag reading **"PALING KUAT"** (item 4).
   - **"Seimbang"** next to **"Dominan Tanah"** (item 2), and on chart1 **"Lemah"** next to **"Dominan Air"**: a weak chart dominated by an element reads as a contradiction without the difference named.
   - **"Pilar Konsepsi"**: a fifth pillar on the chart page, never explained (item 6).
   - **The hanzi motif on the cover** (辛巳 庚寅 戊申 己未): unexplained until the chart page pairs each with its animal.
   - **"Relasi Cabang"**, an appendix group heading: "cabang" (branch) is never said to mean a pillar's lower character.
   - **"Fondasi Pasangan"** in the reading: its only explanation is inside Pilar Diri's appendix row ("cabangnya adalah Fondasi Pasangan").
   - **Compatibility, "Data di Balik Bacaan Ini"**: "Senggolan Halus" and "Saling Tarik" print a branch, an animal and a pillar with no line of meaning of their own; "Kursi" (seat) is used without saying what a seat is.
   - **Compatibility, the appendix**: after AW, the partner's month, day and hour animals print in the facts table and under his pillars but are no longer in the glossary (by the Shio ruling).

## The Preview walk (Prompt AX §6), before #183

Both Preview PDFs fetched from the #186 Preview at `f4767dc` and every page rasterised: `2026-09-30-pdf-design-aw/walk-preview/` (`ce-NN.jpg` 7 pages, `compat-NN.jpg` 8 pages).
- Complete Edition: `/api/deliver/Pez1Ggq5SL311dsTIEtc6/pdf` (a KNOWN TEST ROW). Compatibility: `/api/pair/rVe4ca-FOhsprfGUucTxA/pdf` (a KNOWN TEST ROW).
- **Present:** "Shio (tahun lahirmu)" (mirror); "PALING BANYAK" / "PALING SEDIKIT" on every chart, no old tag word.
- **No page ends on a heading**, in either document (scanned page by page).
- **The pair page holds both charts**, both Sebaran Unsur sections and all ten bars (page 4).
- **NOT YET PRESENT, by design:** the AX glossary lines (Tanda Kekosongan, Dominan, Pilar Konsepsi) are in #183, which is not merged. The walk repeats after #183 and the rebase.
