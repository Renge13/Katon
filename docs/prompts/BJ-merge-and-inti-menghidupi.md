# Prompt BJ: merge #208 and #209, then the Inti Menghidupi rewrite (Reyner ruled 2026-10-07)
Goes in the working tree as `docs/prompts/BJ-merge-and-inti-menghidupi.md`. Untracked until you commit it: commit it in the §2 PR.

**Self-contained: you may be a fresh Code session.** Read `CLAUDE.md`. Work in your own worktrees. Report the open-PR list first.

Cite the four checks. No regex through a shell heredoc. No model-based judge. Red first. Never set `PAYMENTS_PROVIDER=mock` or `COMPAT_SALES` on any Preview.

## §1. Merge go from Reyner: #208 and #209
1. Confirm CI green on both. If either is red, stop and report.
2. Squash-merge #208, then #209, keep the branches (repo practice). Both add a row at the top of `docs/qa/README.md`: on the conflict, **keep both rows**, nothing else changes; re-run `npm run check:qa` and `npm test` on the result before merging, and report the merge SHAs.
3. In the main checkout: `git switch main`, `git pull`. Report `main` HEAD and that `.git/HEAD` reads `ref: refs/heads/main`.
4. After the production deploy is live, report its commit.

## §2. PR `fix/inti-menghidupi-seeds` off the new `main` (do NOT merge; Cowork reads the round first)
**Why.** BI's round (`docs/qa/2026-10-07-bi-direction-round.md`): controls/controls 4/4 correct, produces/generates 0/4 clean. The cause is content: `kompatibilitas.p1_produces` daily_seed ("Keputusan dan inisiatif baru hampir selalu dipicu oleh orang yang sama. Yang lain menyambut, mengeksekusi, ...") describes the same initiator/executor dynamic as `p4_*_generates_*` (Pola Menyalakan). With opposite directions the reading contradicts itself; with the same direction it says the same thing twice. Reyner ruled the same split as 2026-10-04's Inti Menekan / Pola Membentuk: **Inti Menghidupi owns care, support and safety; Pola Menyalakan owns ideas and initiative.**

**Ruled strings (Reyner 2026-10-07, verbatim), `kompatibilitas.p1_produces`:**
- `meaning_seed`: `Kepedulian dan dukungan mengalir secara stabil dari satu arah. Salah satu dari kalian secara alami menjadi tempat bersandar, sementara yang lain merasa aman dan terlindungi. Peran ini konsisten dan jarang bertukar tempat.`
- `daily_seed`: `Ketika melewati hari yang berat, sosok yang sama selalu menjadi tempat berpulang. Kehadirannya memberi ketenangan, membuat yang dijaga merasa benar-benar diperhatikan tanpa harus meminta.`

`name_id` and `label_meaning` stay. Cowork swept both 2026-10-07 against `main`'s blocklist (18 patterns, `style.js:63` compile, controls fired): clean. 3-gram overlaps are short and incidental ("menjadi tempat bersandar" with aspek 正官 gift_seed; "melewati hari yang" with the p2 palace-frame harmony meaning_seeds; "hari yang berat" with p2_harmony daily_seed); report whether any of those can appear in the same compat reading, change nothing.

1. **Commit 1, ruled words only:** a dated rulings record in the repo's format (the 2026-10-04 option-E rulings file is the precedent; the ownership split goes in it). This prompt file in the same commit.
2. **Commit 2:** apply the two strings by script from the rulings record, with a byte-identity check, the same way BD1 inserted the P4 cells. Update any test that pins `p1_produces`' old text or counts; say which.
3. Red first where behaviour changes (the glossary shape/byte test).
4. **Round, report only:** re-run BI's round (`docs/qa/2026-10-07-bi-direction-round/round.mjs`) for the **four produces/generates pairs only**, Reyner's pair (`reyner`, Rey/Eta, Menikah) first, then sample-19, sample-44, sample-50. Same format, new doc `docs/qa/2026-10-07-bj-menghidupi-round.md`: both facts with `direction`, every block mentioning either fact verbatim, Stage 6 outcome, cost. Judge nothing.
5. Compat cache keys move (glossary text is in the semantic JSON); the mirror's must not (assert one). No `ENGINE_VERSION` bump.

## Report
Open-PR list, §1 SHAs and deploy commit, §2 red/green, round doc path, PR link. **Do not merge §2.**
