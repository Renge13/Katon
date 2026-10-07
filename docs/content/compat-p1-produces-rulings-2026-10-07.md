<!--
STATUS: RULED. Reyner, 2026-10-07. Two kompatibilitas strings, replacing values in an existing cell
(`p1_produces`, Inti Menghidupi). Copied from docs/prompts/BJ-merge-and-inti-menghidupi.md by script,
byte for byte; code cannot read the Claude project, so this file is the repo's only copy of the ruling.

WHY. BI's round (docs/qa/2026-10-07-bi-direction-round.md): with P1 and P4 pointing in opposite
directions, controls/controls read 4/4 correct and produces/generates 0/4 clean. The cause is content:
`p1_produces.daily_seed` ("Keputusan dan inisiatif baru hampir selalu dipicu oleh orang yang sama. Yang
lain menyambut, mengeksekusi, ...") described the same initiator/executor dynamic as Pola Menyalakan
(`p4_*_generates_*`). With opposite directions the reading contradicted itself; with the same direction
it said the same thing twice.

THE OWNERSHIP SPLIT, Reyner 2026-10-07, the same split as 2026-10-04's Inti Menekan / Pola Membentuk
(docs/content/compat-p4-option-e-rulings-2026-10-04.md): **Inti Menghidupi owns care, support and
safety; Pola Menyalakan owns ideas and initiative.**

UNCHANGED: `name_id` (Inti Menghidupi) and `label_meaning`.

SWEPT by Cowork 2026-10-07 against main's blocklist (18 patterns, compiled as lib/validate/style.js:63
does, controls fired): clean. 3-gram overlaps are short and incidental: "menjadi tempat bersandar"
(aspek.正官 gift_seed), "melewati hari yang" (the p2 palace-frame harmony meaning_seeds), "hari yang
berat" (p2_harmony daily_seed). Nothing was changed for them.

Applied to glossary.json with:
  node scripts/apply-rulings.mjs docs/content/compat-p1-produces-rulings-2026-10-07.md --expect 2
Everything above the first "## " heading is ignored by that script.
-->

# glossary.json#kompatibilitas.p1_produces - Inti Menghidupi, care not initiative, RULED

| field | was | ruled |
|---|---|---|
| `meaning_seed` | Alur energi berjalan searah dan stabil dari satu pihak ke pihak lain. Yang memberi menjadi sumber dorongan, yang menerima mendapat rasa aman; peran ini konsisten dan jarang berbalik. | Kepedulian dan dukungan mengalir secara stabil dari satu arah. Salah satu dari kalian secara alami menjadi tempat bersandar, sementara yang lain merasa aman dan terlindungi. Peran ini konsisten dan jarang bertukar tempat. |
| `daily_seed` | Keputusan dan inisiatif baru hampir selalu dipicu oleh orang yang sama. Yang lain menyambut, mengeksekusi, dan merasa aman bergerak dalam alur tersebut. | Ketika melewati hari yang berat, sosok yang sama selalu menjadi tempat berpulang. Kehadirannya memberi ketenangan, membuat yang dijaga merasa benar-benar diperhatikan tanpa harus meminta. |

## kompatibilitas.p1_produces

- meaning_seed: "Kepedulian dan dukungan mengalir secara stabil dari satu arah. Salah satu dari kalian secara alami menjadi tempat bersandar, sementara yang lain merasa aman dan terlindungi. Peran ini konsisten dan jarang bertukar tempat."
- daily_seed: "Ketika melewati hari yang berat, sosok yang sama selalu menjadi tempat berpulang. Kehadirannya memberi ketenangan, membuat yang dijaga merasa benar-benar diperhatikan tanpa harus meminta."
