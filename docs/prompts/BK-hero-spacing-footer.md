# Prompt BK: tighter hero and a shorter desktop footer (Reyner ruled 2026-10-07, option B)
Goes in the working tree as `docs/prompts/BK-hero-spacing-footer.md`. Untracked until you commit it: commit it in this PR.

**Self-contained: you may be a fresh Code session.** Read `CLAUDE.md`. Work in your own worktree. Branch `fix/hero-spacing-footer` off `main`. **Start only after BJ's §2 PR is open** (it does not touch these files, but keep one job at a time). Report the open-PR list first.

Cite the four checks. No regex through a shell heredoc. No model-based judge. Red first. **Do not merge.** Layout only: no copy change, no reading/engine/prompt change, no change to the order of anything on the page.

## Measured on production by Cowork, 2026-10-07 (verify, do not trust)
| viewport | header bottom | h1 top | CTA "Lihat Refleksiku" bottom | footer top | footer height | page height |
|---|---|---|---|---|---|---|
| 1440x900 | 50 | 154 | 635 | 833 | 190 | 1022 (scrolls 122) |
| 375x812 | 50 | 154 | 629 | 827 | - | 1046 |
- The 104px gap under the header comes mostly from `paddingTop: 60` in `Home` (`components/Funnel.jsx:595`). Its comment says the hero logomark moved into the header (Y-2b); the spacer stayed. `components/Pasangan.jsx:258` and `:319` carry the same `paddingTop: 60`.
- Under the hero: about 120px of empty space between the "Baca dinamika dua orang" link (bottom 712) and the footer (833): `wrap`'s `96px` bottom padding (`Funnel.jsx:140`) plus the footer's `marginTop: 24`.

## The change (Reyner ruled the targets)
1. **Top:** gap from header bottom to the headline's top ≈ **48px on desktop (≥768px wide), ≈ 40px on phones**. Apply to the home hero and the `/kompatibilitas` landing (same spacer). Other routes unchanged.
2. **Bottom:** on the home page, the space between the last hero element and the footer's top border ≈ **48px**. Do not change `wrap`'s bottom padding for pages where it protects something (reading end, paid states); scope it to the home hero and say how.
3. **Desktop footer (≥768px), every route:** make it shorter without removing or rewording anything. Within the existing 460px column: put the operator line and the contact line on ONE line (separated the way the site already separates inline items, e.g. " · "), and tighten the footer's own spacing (top/bottom padding, the nav's `marginBottom`, the KATON.APP `marginTop`). Target footer height ≈ 120-130px at 1440x900. **Phones keep today's footer exactly.** If one line does not fit in 460px, stop and report with a screenshot rather than shrinking type.
4. **Acceptance:** at 1440x900 the home page does not scroll (page height ≤ 900); at 375x812 the CTA bottom is at least 56px higher than today. Report the same table as above, before and after, measured in a browser on your branch (not the style objects).

## Validation and report
Red first: a test that renders Home and fails on the old spacer value or the old footer structure on desktop (assert computed layout if the repo's harness allows, otherwise the rendered markup). `npm test`, `npm run check:qa`, CI green. Screenshots before/after at 1440x900 and 375x812 for `/` and `/kompatibilitas` under `docs/qa/2026-10-07-bk-spacing/`. Report the table, the screenshot paths, the PR link and preview URL. **Do not merge.**
