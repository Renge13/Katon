# Prompt AQ: Mirror result page UI (Reyner's rulings, 2026-09-28)
Untracked in the working tree as `docs/prompts/AQ-result-page-ui.md`. Commit it with your first change.

Cite the four checks. Each item gets its own commit, shown red first where it is behaviour. One PR to main, which Reyner approves after seeing a Preview. UI only: no engine, gate or prompt change here.

## Reyner, 2026-09-28, verbatim (after reading production reading `smewTNtzNaoQmWysi6mYU`)
```
* need the profile data on the header (gender and birthdate)
* "Yang sedang dikerjakan", "Dua bacaan ini belum dijual", Setahun ke Depan section should all be removed.
* <- Ganti tanggal and Refleksimu is too close, need more spacing in between.
* the term in the brackets or in english should be put in italic
```

## §1. Gender and birth date in the header
- **Show** them under the archetype header ("Gunung / The Mountain / TANAH · 戊"). Reuse the card footer's exact format and source ("PEREMPUAN | 14 FEB 2001", `mergeFooter` in `components/Funnel.jsx`). No new copy; the words are the card's.
- **Cowork's default, pending Reyner:** the same rule as the card. The free payload carries neither value (`lib/mirror/view.js`, `freeCardData` passes `birthDate: null, gender: null`), so the header shows them in the session that created the reading. On a reopened or shared link it shows nothing, just as the card footer does today.
  - Serving them on the permalink would put a birth date and gender on any link a reader shares. That is Reyner's to rule, and it is not done here.
  - If he rules "show on reopened links too", stop and report what storing and serving them would take.
- **Red first:** a render with a session date shows the line; a re-access render without one shows no empty line or stray separator.

## §2. Remove the upcoming block
- Remove the whole "Yang sedang dikerjakan" block (`lib/site/copy.js#UPCOMING_COPY` → `components/Funnel.jsx#Upcoming`): eyebrow, lead, the Setahun ke Depan card, and its "Beri tahu saya kalau sudah siap" link.
- **Report** what else reads that block or its interest events (`scripts/verify-upcoming-seen.mjs`, the funnel readout, any `upcoming_*` events). Keep the recorded data; remove only the surface. Say which scripts become dead, and delete or park each with a note.
- **Say what now follows the card.** Product-boundary ruling: the Compat CTA goes on the Mirror result page when payments open. Leave that slot empty now. Its copy is Reyner's, so don't build it.
- **Red first:** the page no longer renders `Yang sedang dikerjakan`.

## §3. Spacing between "← Ganti tanggal" and "REFLEKSIMU"
Increase the gap between the back link and the eyebrow. Use the page's existing spacing tokens (no new magic number), for example the same step used between the eyebrow block and the first divider. Show before/after screenshots at 375px and desktop in the PR.

## §4. English terms and bracketed glosses in italic (web and PDF)
- **In reading prose:** italicise the bracketed English gloss after a term, for example "(*The Mountain*)", "(*Seven Killings*)", "(*Void*)", "(*Clash*)", "(*Punishment*)", "(*Eating God*)". The brackets stay upright; only the English inside is italic.
- **Detection is deterministic:** italicise a parenthetical only when its content matches a known English name in the glossary (`name_en` of archetype, aspek, bintang, relation, and the other sections that carry one), taken from the glossary itself, never a hand list. Anything else in brackets stays as it is.
- **Where:**
  - the web reading (blocks and penutup);
  - the Complete Edition and Compatibility PDFs, since it is one voice everywhere (CLAUDE.md rule 20). The PDF font must have an italic face; if it doesn't, say so and do web only.
  - The sharecard never shows brackets (rule 23), so no change there.
- **Styling only.** The stored text and the gate see exactly what they see today. Prove it: the semantic JSON and the served prose are byte-identical before and after.
- **Red first:** a rendered block containing "(The Mountain)" produces an italic node around "The Mountain" and nothing else.

## Report
Per item: commit, red-first proof, screenshots, and the Preview URL for Reyner. End with the split.
