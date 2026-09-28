# Voice v2, round 4b: after the round-4 fixes (Prompt AJ amendment 1 §7)

**Date:** 2026-09-28. **Branch:** `feat/voice-v2` at `9243128`. **Gate:** STAGE6 `1.51.0`. **Writer:**
`gemini-3.1-flash-lite`, no judge. **Prompts:** mirror `v2-8fcc1571d7316795`, pair `v2-e701903e16b6ffab`.
**What changed since round 4 (`2026-09-28-voice-v2-round4-representative.md`):**
- AJ §2 (`e1f11aa`): the v2 pair writer is no longer handed `p0_opening`.
- AJ §3 (`9c62b0c`): no archetype bracket inside an existing parenthesis.
- B31 / AJ amendment 1 §6 (`9243128`): the open-ended close keeps its permission and loses its example phrase.

Same seven subjects and harness; rVe4ca's births are the reconstruction noted in round 4. In memory, not
from `render_cache`. No voice score: Reyner judges.
```
node --conditions=react-server scripts/qa-voice-v2-renders.mjs --out reports/voice-v2/round4b --voices v2 --subjects chart1,chart4,chart6,chart8,chart13,PZ0t_B3YDnzdXc2LWV38D,rVe4ca-FOhsprfGUucTxA
node scripts/qa-voice-v2-pdfs.mjs --dir reports/voice-v2/round4b
```

| Subject | Served | Regens | Openings (pairs) | Nested bracket | "Mungkin menarik" | Served "?" | Gating findings served | Cost |
|---|---|---|---|---|---|---|---|---|
| chart1 | render | 0 | - | 0 | 1 | 0 | 0 | $0.0028 |
| chart4 | render | 0 | - | 0 | 0 | 0 | 0 | $0.0025 |
| chart6 | render | 0 | - | 0 | 0 | 0 | 0 | $0.0025 |
| chart8 | render | 0 | - | 0 | 1 | **1** | 0 | $0.0028 |
| chart13 | render | 0 | - | 0 | 1 | 0 | 0 | $0.0023 |
| PZ0t | render | 0 | **1** | 0 | 1 | 0 | 0 | $0.0042 |
| rVe4ca | **FLOOR** | 1 | 1 | 0 | 0 | 0 | (floor) | $0.0073 |
| **Total** | 6/7 | | | **0** | **4/7** (round 4: 7/7) | 1 | | **$0.0245** |

The FLOOR file is `rVe4ca-FOhsprfGUucTxA-v2-FLOOR.pdf`.

## What moved
- **One opening per pair, and no nested brackets anywhere.** Fixed.
- **"Mungkin menarik untuk ..." fell from 7/7 to 4/7, not to zero.** The phrase is in no prompt, example or
  glossary cell (`grep -c "Mungkin menarik\|menarik untuk"` over `renderer-prompt-v2.txt`,
  `compat-renderer-prompt-v2.txt` and `voice-examples-v2.txt`: 0 each), so what is left is the model's own
  habit for an open close.
- **chart8 serves a question** in that same close ("... sebelum merasa cukup?"). `style.rhetorical_question` is
  a flag on v2.

## rVe4ca floored, in this run and in the AJ §2 measurement: both times on D1 false positives
The draft's rejections, quoted:
- `v2.d1_invented_term` "Kuat" (kekuatan). The sentence is "Hubungan kalian memiliki **Tarikan Kuat dan Ritme
  Seirama** ..." - the supplied quadrant name "Tarikan Kuat, Ritme Seirama" with "dan" for the comma, and D1
  then reads "Kuat" as a strength term.
- `v2.d1_invented_term` "Berseberangan" (kompatibilitas). ~~The sentence is "... menghasilkan interpretasi yang
  **berseberangan**." That is the ordinary adjective, and Reyner's own Example 4 wording ("dua interpretasi
  yang berseberangan"). D1 matches it against the frame-clash name `p2_frame_clash` "Berseberangan".~~
  **CORRECTED 2026-09-28 (Prompt AK §1):** that attribution was wrong. D1 is case-sensitive (`new RegExp(...,
  'gu')` in `inventedTerms`), so the lowercase adjective never fired. The hit is the draft's TITLE-CASE
  HEADING, "Perspektif yang Berseberangan" (block `p4_temperament` + `p2_palace_frame`;
  `tests/fixtures/voice-v2-d1-misfires.json`). The word is capitalised by heading style, and it happens to be
  the true name of rVe4ca's frame clash (冲), which `p2_palace_frame` carries with `label: null`.

Neither is an invented fact. Both are the gate matching a glossary NAME against ordinary or paraphrased words.
Reported, not changed: it is a gate change and needs Cowork's ruling. In the AJ §2 measurement
(`reports/voice-v2/aj2`), the same draw also had `pair.supply_inverted` on "kamu membawa elemen Api yang ia
butuhkan". There the writer read the elements the way AJ §4.1 questions, and 1.39.0 rejected it.

## Last paragraph of each reading, verbatim
- **chart1:** "Kamu memiliki struktur yang sangat kuat dalam menopang tanggung jawab orang lain, namun sering kali lupa bahwa Matahari pun butuh waktu untuk terbenam agar bisa terbit kembali dengan tenaga penuh. Mungkin menarik untuk melihat bagian mana dari dirimu yang selama ini hanya menunggu instruksi dari luar, padahal sebenarnya sudah cukup untuk melangkah sendiri."
- **chart4:** "Pola-pola ini hanyalah cuaca yang membentuk lanskap keseharianmu. Kamu mungkin ingin melihat lebih jauh bagaimana Bintang Penolong yang muncul di Pilar Kerja dan Pilar Arah bisa menjadi jangkar saat kamu merasa terlalu lelah menanggung semuanya sendirian."
- **chart6:** "Kamu memiliki kapasitas untuk menembus situasi yang buntu bagi orang lain, namun tantangan terbesarmu mungkin adalah belajar kapan harus berhenti sejenak dan membiarkan dirimu beristirahat tanpa merasa kehilangan arah."
- **chart8:** "Pola-pola ini adalah cuaca dalam keseharianmu. Kamu tidak perlu mengubah dirimu, cukup perhatikan kapan kamu memotong proses terlalu cepat atau kapan kamu memikul beban sendirian karena merasa tidak ada yang bisa membantu. Mungkin menarik untuk melihat kembali, di area mana kamu merasa paling sering harus 'menambah satu hal lagi' sebelum merasa cukup?"
- **chart13:** "Kamu memiliki kemampuan alami untuk terus tumbuh dan menangkap peluang, namun tantangan terbesarmu terletak pada bagaimana mengelola beban yang kamu ambil sendiri. Mungkin menarik untuk melihat bagaimana kamu bisa mulai memilah mana yang benar-benar perlu kamu pegang dan mana yang bisa kamu lepaskan agar energimu tidak habis di tengah jalan."
- **PZ0t:** "Dinamika kalian adalah perpaduan antara tarikan magnetis yang kuat dan ritme harian yang membutuhkan penyesuaian sadar. Mungkin menarik untuk memperhatikan bagaimana kalian menavigasi gesekan kecil tersebut saat sedang berada di ruang yang sama, mengingat kalian berdua memiliki cara yang sangat berbeda dalam memproses dunia."
- **rVe4ca (FLOOR, the glossary's own text, not a render):** "Chemistry terasa kuat dan rutinitas harian saling menopang. Kuncinya adalah menjaga keterbukaan agar kenyamanan tidak dianggap biasa."
