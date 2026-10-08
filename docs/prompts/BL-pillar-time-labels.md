# Prompt BL: Tahun / Bulan / Hari / Jam above each pillar (Reyner ruled 2026-10-08)
Goes in the working tree as `docs/prompts/BL-pillar-time-labels.md`. Untracked until you commit it: commit it in this PR.

**Self-contained: you may be a fresh Code session.** Read `CLAUDE.md`. Work in your own worktree. Branch `fix/pillar-time-labels` off `origin/main` (must contain #211, `ad0794d`). Report the open-PR list first.

Cite the four checks. No regex through a shell heredoc. No model-based judge. Red first. No engine, glossary, writer-prompt or Stage 6 change. **Do not merge.**

## Why
Readers report "inti diri saya salah". Most expect it from their birth YEAR (shio); Katon reads it from the DAY stem. Nothing on the web chart says which pillar comes from which part of the birth.

## Ruled (Reyner 2026-10-08)
1. **A small column header above each pillar card, outside the box**: `Tahun`, `Bulan`, `Hari`, `Jam`, in that order, mapped by the pillar's `position` (year, month, day, hour), never by array index. The pillar's own name (Pilar Akar, Pilar Kerja, Pilar Diri, Pilar Arah) stays inside the card unchanged. The header must not touch or overlap the day cell's "INTI DIRI" pill (it sits on that card's top edge): leave clear space and show it in your screenshots.
2. **The missing-hour cell** (`EmptyPillarCell`, Pilar Arah with "Tambahkan jam lahir") gets `Jam` above it too.
3. **Intro line** `CHROME_COPY.bagan_intro` (`lib/site/copy.js:1119`) becomes, verbatim:
   `Empat pilar dari tahun, bulan, hari, dan jam lahirmu. Inti dirimu dibaca dari hari lahir.`
   Cowork swept it and the four labels 2026-10-08 (18 patterns, `style.js:63` compile, controls fired): clean.
4. **Where:** the web reading's Bagan (`components/Funnel.jsx` ~1085-1105, `components/kit.jsx` `PillarCell` / `EmptyPillarCell`) **and** the PDF chart page (`lib/pdf/document.js` `chartBlock` ~574-690, `s.pillarLabel` ~683), which serves both the Complete Edition and each person's chart in the compat PDF. **Not** the share card.
5. Style: **caption size** (Reyner, 2026-10-08): the same font size as the existing pillar eyebrow inside the card (`kit.jsx` `PillarCell` label, 9.5px on the web; `s.pillarLabel` in the PDF), read from that style, never larger. Sentence case (not uppercase), the muted colour already used for chart secondary text. Read values from existing tokens/styles; do not retype hex values.
6. **Never wider than its card** (Reyner, 2026-10-08): one line, no wrap, centred over the card, and its rendered width must not exceed the card's width at any viewport down to 320px, nor in the PDF. Add this to the red test: measure header width against card width in the browser at 320px and 375px (and in the drawn PDF), and show it failing with a deliberately oversized header before restoring.

**Open point, do not decide it yourself:** the PDF chart page also prints Pilar Konsepsi (off the web, ruled 2026-10-06). It has no birth-time unit. Leave its header **empty** (keep column alignment) and show it in the PDF screenshot; Reyner rules later if it needs a word.

## Labels live in one place
Put the four strings in the copy bank (the module the chart already reads `bagan_intro` / `pillar_core_pill` from), keyed by position, and have the web and the PDF both read them from there. Copy-bank shape tests must stay green; update counts with the arithmetic shown.

## Validation and report
Red first: a test that renders the Bagan for a chart with an hour and one without, and fails unless each cell has the header for ITS position (day cell says `Hari`, missing-hour cell says `Jam`); and a PDF test that the chart page draws the four words above the matching pillars (read the drawn PDF, as `tests/pdf-closing.spec.mjs` does). Show it failing on `main`.
Screenshots under `docs/qa/2026-10-08-bl-pillar-labels/`: web Bagan at 375px and 1280px (with hour, without hour), PDF chart page (Complete Edition and one compat person page). Confirm the pill/header clearance at 375px. `npm test`, `npm run check:qa`, CI green. Report the PR link and preview URL. **Do not merge.**
