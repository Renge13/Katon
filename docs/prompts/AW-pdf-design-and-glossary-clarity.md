# Prompt AW: Complete Edition PDF, the web's design, and a glossary that doesn't confuse (Cowork, 2026-09-30)
Untracked in the working tree as `docs/prompts/AW-pdf-design-and-glossary-clarity.md`. Commit it with your first change.

Cite the four checks. Two-round cap. No regex through a shell heredoc. No model-based judge.
- **Start after AV's PRs are reported.**
- **Styling and structure only:** no engine, gate or prompt change, and the stored text and semantic JSON stay byte-identical. The Compatibility PDF gets the same treatment wherever it shares a component.

## Reyner, 2026-09-30, verbatim
```
* the PDF: orange dot on Katon logo still not aligned
* the PDF glossary: we usually on know one Shio -the year we born-, but the glossary lists 4, it will potentially confuse the reader. Also check for anything that potentially confusing
* the overall PDF layout, format, etc can be better, or can't we embed the preview design on the PDF? I really like the pillars design
```
Also, ruled the same day: the #177 badge cards stay ABOVE the reading. Status line: "Bacaanmu sedang ditulis..." with three periods.

**Cowork looked at `reports/voice-v2/round6/r6-07.pdf` page by page.** The findings below come from that PDF.

## §1. The logo dot
At 200 dpi, the dot's centre sits about 10px (roughly 1.3mm) below the cap-height centre of "KATON" on the cover. Centre it on the wordmark's cap height, measured from the font metrics, not nudged by eye.
- **Red first:** a raster test on the cover that measures both centres and fails at more than 1px at 200 dpi.
- Apply the same fix to every PDF page header that carries the mark.

## §2. Bring the web's design into the PDF: native, not a screenshot
**Cowork's technical ruling:** port the web components into `@react-pdf/renderer` primitives, using the same tokens (colours, radii, borders, Spectral and the sans face, spacing).
- **Don't embed a screenshot:** it would be blurry in print, and the text inside it couldn't be selected or searched.
- **Don't add a headless browser in the serverless function:** it's too heavy and too slow for the PDF route.

What to port:
1. **Bagan Kelahiran:** the pillar cards exactly as on #177, including:
   - the "INTI DIRI" pill on Pilar Diri;
   - hanzi over the animal;
   - "Logam · Ular" labels;
   - the Pilar Konsepsi card below.
2. **Sebaran Unsur:** the web's bars and element labels ("tumbuh dan menjangkau" …), and the web's tags as the web shows them. **No numbers** (§3 item 3).
3. **Tanda Istimewamu:** the badge cards from #177, on the chart page.
4. **The reading pages:**
   - the web's heading style (the orange uppercase eyebrow for block headings) and paragraph spacing;
   - a measure of about 65-70 characters;
   - no page opening on an orphan heading. Today "Karya yang Tersembunyi" sits alone at the foot of page 2.
5. **The cover:** keep what AB ruled (wordmark, "Edisi Lengkap" eyebrow, archetype title, English once, pillars motif, birth line, disclaimer and provenance). Use the web header's type scale, and use the profile line format from #177 (`PEREMPUAN | 14 FEB 2001 | 14.00`).

Proof:
- before/after PNGs of every page, for smewTN and chart1;
- page count before and after;
- a text-extraction diff showing the reading text is unchanged.
- **Reyner walks it before merge.**

## §3. Glossary and chart-page clarity
Reyner's ruling (Shio), plus Cowork's audit of r6-07. Items marked **[REYNER]** are reader-visible copy or content. Code builds the default written here, and Reyner can override it in his paste.
1. **Shio: only the year animal.** Reyner has ruled this.
   - The appendix's Shio group shows one entry, the year branch's animal (for smewTN, Ular). Label it so the reader knows it is her birth-year Shio.
   - The other three animals stay only where they already are, as the animal under each pillar on the chart page. That is a label of the pillar, not "your Shio".
   - **[REYNER]** The group label: default "Shio (tahun lahirmu)".
   - Apply the same rule to the Compatibility PDF: one year Shio per person (R2 = A still holds).
2. **[REYNER] "Seimbang" next to "Dominan Tanah".** The appendix tells her in one breath that her chart is balanced and that it is dominated by her own element. Both are engine truths about different things (strength verdict versus an element condition), but the reader sees a contradiction.
   - Default: keep both. Add nothing to the copy.
   - Report the two glossary cells, so that Reyner can rewrite one line that says which is which.
3. **Numbers under Sebaran Unsur.** The PDF prints 8,8 / 15 / 36,3 / 36,3 / 3,8, units unknown, right under "Sebaran visual, bukan ukuran kekuatan." To the reader, those read as scores.
   - Default: drop the numbers, as the web does.
4. **[REYNER] "PALING KUAT" on a scale that says it's not strength.** On the web (and the PDF after §2), Sebaran Unsur carries "Sebaran visual, bukan ukuran kekuatan." and then tags one element "PALING KUAT".
   - On smewTN, Logam is tied with Tanah (36,3 each), yet only Tanah is tagged.
   - Report how the tag is chosen and how ties are handled.
   - Change nothing; the tag word is Reyner's.
5. **[REYNER] Tanda Kekosongan's meaning ends on a fragment:** "Hasilnya tidak pernah kurang. Rasa memilikinya yang tidak pernah ikut hadir." The second sentence has no main clause. Quote the cell, and don't edit it.
6. **[REYNER] Pilar Konsepsi appears on the chart page with no explanation.** It is display-only by the 2026-08-07 ruling, with no `label_meaning`.
   - Default: keep it.
   - Report that the ruling is still open for a one-line meaning Reyner writes.
7. **Anything else a first-time reader would trip on.** Read both PDFs (Complete Edition and Compatibility) as a first-time reader and list every term or number that appears without meaning, and every pair of lines that seem to contradict each other. List them only; don't fix them.

## Report
Per section:
- commits;
- red-first proof;
- before/after page images;
- the §3 list with each cell quoted;
- Preview URLs for a Complete Edition and a Compatibility PDF.

End with the split.
