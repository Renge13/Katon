# Prompt BF: return to your reading, and the Konsepsi pillar (Reyner, 2026-10-06)
Goes in the working tree as `docs/prompts/BF-return-to-reading.md`. Untracked until you commit it.

**Self-contained: you may be a fresh Code session.** Read `CLAUDE.md` first. Read `.git/HEAD`. Start a new branch off `main` (#199 is merged as `6aac8a6`; confirm on GitHub). One PR, do not merge.

Cite the four checks. No regex through a shell heredoc. No model-based judge. No engine, writer-prompt or Stage 6 change (STAGE6 stays 1.73.0; assert both prompt versions unchanged). Every user-facing string in §4 is applied verbatim as Reyner confirmed it when this prompt was pasted. Red first wherever behaviour changes.

## 1. Coming back to your reading (Reyner's walk, preview of #199)
Observed: after a free reading at `/r/<token>`, Reyner opened `/harga`, then pressed the browser's back button or the header's "Bacaan Diri". Both landed on the front door (the birth-date form), not on his reading.

a. **Diagnose the back button first** and report the cause in one paragraph, with the code lines. A reading has its own URL, so back from `/harga` should return to `/r/<token>`. Fix it so it does, on mobile Safari/Chrome behaviour as far as you can test (headless is fine).
b. **Remember the last reading on this device**: store the last reading token in `localStorage` (wrapped in try/catch; the page must work when storage is unavailable). Never store the birth date itself.
c. **Front door, when a reading is remembered:** above the form, a resume card with the archetype title, string R1, a primary button R2 to `/r/<token>`, and a quiet secondary link R3 that clears the memory and shows the plain form. If the stored token no longer resolves, clear it silently and show the plain form.
d. The header "Bacaan Diri" keeps linking to `/`, where the resume card now does the work. Do not add a new header item.
e. **Cost check, report only:** create the same birth date twice on the preview/local path and report whether the second reading's text comes from the result cache (CLAUDE.md rule 16) or calls Gemini again. Change nothing based on it.

## 2. End of the free reading: what next
At the end of the free reading (after the Complete Edition offer and the share card), one small "next" block with R4 linking to `/` with the memory kept (so the resume card shows) and the form ready for another person. The compat entry appears here ONLY when compat is on sale (`COMPAT_SALES` open), reusing the existing compat CTA string and route; with compat closed it is absent (assert both states). Reuse existing strings wherever they exist; report every new string.

## 3. Bagan kelahiran: "the middle" and the Konsepsi pillar
a. The intro line "Empat lapisan energi dari tanggal lahirmu. Yang di tengah adalah intinya." is misleading: there are four pillars plus Konsepsi below, and "the middle" is not one card. Replace it with K1.
b. Under the Pilar Konsepsi card, a small grey caption reusing the glossary's existing ruled text for that pillar verbatim (the glossary entry that reads "Dihitung dari perkiraan masa pembuahan, sekitar sepuluh bulan sebelum kelahiranmu. Pilar ini melengkapi bagan dan tidak dibaca sendiri."). Read it from the glossary, never retype it. Konsepsi stays on the page and in the PDF (CLAUDE.md rule 4: 胎元 stays).

## 3b. Birth hour: lower the hesitation, and say what the hour did
Reyner's concern: many people do not know their birth hour; the hour field may make them hesitate or postpone ("I'll ask my mother"), and the reading never says whether the hour was used. Facts: the field is already optional (`components/BirthFields.jsx:119` "Jam lahir · opsional"); the semantic JSON carries `hour_known` (`lib/semantic/index.js:346`); the archetype comes from the day pillar, so it never depends on the hour.
a. **Front door:** keep the label "Jam lahir · opsional" exactly as it is. Under the hour field, add a small grey hint H1. Nothing else on the form changes.
b. **Reading page, hour NOT given:** directly under the Bagan kelahiran cards, one plain line H2 and a link H3 that opens the front door with the birth date (and gender, if given) prefilled and the hour field focused. This is deterministic UI text, never writer prose (CLAUDE.md rule 14). Hour given: show nothing extra. Report with a 375 px screenshot what the Pilar Arah card shows today when the hour is missing.
c. **Not in this PR:** measuring hour known vs hour unknown (reading completion, then paid conversion) is a separate follow-up. Add no events, queries or explanation text for it here.

## 4. Strings (verbatim)
- **R1** (resume card line): "Bacaanmu masih tersimpan di perangkat ini."
- **R2** (primary button): "Buka bacaanku"
- **R3** (secondary link): "Mulai bacaan baru"
- **R4** (end-of-reading link): "Baca tanggal lain"
- **K1** (Bagan kelahiran intro): "Empat pilar dari tanggal lahirmu. Pilar yang bertanda Inti Diri adalah intinya."
- **H1** (hint under the hour field): "Tidak tahu? Lewati saja."
- **H2** (reading page, hour not given): "Jam lahir belum diisi, jadi Pilar Arah belum dihitung."
- **H3** (link under H2): "Tambahkan jam lahir"

## 5. Report and stop
Commits, red-first runs, the back-button cause, the cost check, 375 px screenshots (front door with resume card; end-of-reading block with compat closed; Bagan kelahiran with the new line and the Konsepsi caption; front door with H1; reading without an hour, with H2 and H3), the preview URL. Do not merge.
