<!--
STATUS: RULED. Reyner, 2026-10-04. Four new kompatibilitas cells for P4 option E, and the retirement
of one. Copied from docs/prompts/BD1-compat-p4-option-e.md §3 by script (the table below is
byte-identical to the prompt's); code cannot read the Claude project, so this file is the repo's
only copy of the ruling.

Applied to glossary.json with:
  node scripts/insert-p4-option-e.mjs
which reads the table below, inserts the four cells, and refuses unless every string in the
glossary is byte-identical to this file. tests/compat-p4-option-e.spec.mjs re-asserts that.
-->

# glossary.json#kompatibilitas - P4 option E, the four directed cells, RULED

### Provenance

- **Ruled by Reyner 2026-10-04: the structure.** Two names, each in two directions. A is always
  "kamu" (the reader), the partner is "ia". The `p4_b_*` cells are kamu/ia swaps of his wording
  for the `p4_a_*` cells, approved by him the same day.
- **Ownership split, Reyner 2026-10-04:** "`Inti Menekan` owns schedules/rules, while
  `Pola Membentuk` owns clarity/decision-making." Reason: `p1_controls` (Inti Menekan) can appear
  in the same reading as a `p4_*_controls_*` cell, and a Rp 39.000 reader must not read the same
  dynamic twice.
- **`p4_contrasting` ("Pola Kontras") is RETIRED.** The engine no longer emits `contrasting`; the
  80.6% bucket it named is split four ways below.
- **The rule** is `docs/product/compat-p4-p5-rules.md` §1.1 (amended 2026-10-07). Family position on
  the generating cycle from each person's own Day Master: companion 0, output 1, wealth 2, officer
  3, resource 4. Step `d = (kB - kA) mod 5`, A the reader. Katon's framework, never presented as
  classical (rule 4); "controls" ranks nothing (rule 25).

| key | d | meaning |
|---|---|---|
| `p4_a_generates_b` | 1 | A's family generates B's |
| `p4_a_controls_b` | 2 | A's family controls B's |
| `p4_b_controls_a` | 3 | B's family controls A's |
| `p4_b_generates_a` | 4 | B's family generates A's |

### The four cells, verbatim

| key | name_id | name_en | label_meaning | meaning_seed | daily_seed |
|---|---|---|---|---|---|
| `p4_a_generates_b` | Pola Menyalakan | Kindling Pattern | Caramu melangkah menyalakan semangatnya. Hal yang membuatmu bergerak secara alami menjadi alasan untuknya ikut melangkah. | Dorongan alamimu adalah pemantik untuk caranya menjalani hidup. Ia tumbuh lebih cepat di dekatmu, namun kamu bisa merasa lelah jika harus selalu menjadi pihak yang memulai. | Ide atau antusiasme yang kamu lontarkan di pagi hari sering kali sudah ia jalankan di sore hari, dengan caranya sendiri. |
| `p4_b_generates_a` | Pola Menyalakan | Kindling Pattern | Caranya melangkah menyalakan semangatmu. Hal yang membuatnya bergerak secara alami menjadi alasan untukmu ikut melangkah. | Dorongan alaminya adalah pemantik untuk caramu menjalani hidup. Kamu tumbuh lebih cepat di dekatnya, namun ia bisa merasa lelah jika harus selalu menjadi pihak yang memulai. | Ide atau antusiasme yang ia lontarkan di pagi hari sering kali sudah kamu jalankan di sore hari, dengan caramu sendiri. |
| `p4_a_controls_b` | Pola Membentuk | Shaping Pattern | Kehadiranmu memberi kejelasan pada pikirannya. Kamu secara alami menjadi pihak yang menimbang pilihan dan memperjelas tujuan. | Caramu memandang hidup memberi kepastian pada jalannya. Di hari baik, ia merasa lebih mantap dan terarah karenamu. Di hari berat, kejelasan yang sama bisa terasa menuntut untuknya. | Saat ia datang dengan banyak pemikiran atau pilihan yang berserakan, kamu yang biasanya memilah dan membantunya mengambil satu keputusan pasti. |
| `p4_b_controls_a` | Pola Membentuk | Shaping Pattern | Kehadirannya memberi kejelasan pada pikiranmu. Ia secara alami menjadi pihak yang menimbang pilihan dan memperjelas tujuan. | Caranya memandang hidup memberi kepastian pada jalanmu. Di hari baik, kamu merasa lebih mantap dan terarah karenanya. Di hari berat, kejelasan yang sama bisa terasa menuntut untukmu. | Saat kamu datang dengan banyak pemikiran atau pilihan yang berserakan, ia yang biasanya memilah dan membantumu mengambil satu keputusan pasti. |

### The same four cells, one field per line

Generated from the table above by script, byte for byte, so the parsers that read rulings files
by `## kompatibilitas.<key>` heading (tests/pair-semantic.spec.mjs) see these cells. The table is
the record; these lines are its machine-readable copy.

## kompatibilitas.p4_a_generates_b

- name_id: "Pola Menyalakan"
- name_en: "Kindling Pattern"
- label_meaning: "Caramu melangkah menyalakan semangatnya. Hal yang membuatmu bergerak secara alami menjadi alasan untuknya ikut melangkah."
- meaning_seed: "Dorongan alamimu adalah pemantik untuk caranya menjalani hidup. Ia tumbuh lebih cepat di dekatmu, namun kamu bisa merasa lelah jika harus selalu menjadi pihak yang memulai."
- daily_seed: "Ide atau antusiasme yang kamu lontarkan di pagi hari sering kali sudah ia jalankan di sore hari, dengan caranya sendiri."

## kompatibilitas.p4_a_controls_b

- name_id: "Pola Membentuk"
- name_en: "Shaping Pattern"
- label_meaning: "Kehadiranmu memberi kejelasan pada pikirannya. Kamu secara alami menjadi pihak yang menimbang pilihan dan memperjelas tujuan."
- meaning_seed: "Caramu memandang hidup memberi kepastian pada jalannya. Di hari baik, ia merasa lebih mantap dan terarah karenamu. Di hari berat, kejelasan yang sama bisa terasa menuntut untuknya."
- daily_seed: "Saat ia datang dengan banyak pemikiran atau pilihan yang berserakan, kamu yang biasanya memilah dan membantunya mengambil satu keputusan pasti."

## kompatibilitas.p4_b_controls_a

- name_id: "Pola Membentuk"
- name_en: "Shaping Pattern"
- label_meaning: "Kehadirannya memberi kejelasan pada pikiranmu. Ia secara alami menjadi pihak yang menimbang pilihan dan memperjelas tujuan."
- meaning_seed: "Caranya memandang hidup memberi kepastian pada jalanmu. Di hari baik, kamu merasa lebih mantap dan terarah karenanya. Di hari berat, kejelasan yang sama bisa terasa menuntut untukmu."
- daily_seed: "Saat kamu datang dengan banyak pemikiran atau pilihan yang berserakan, ia yang biasanya memilah dan membantumu mengambil satu keputusan pasti."

## kompatibilitas.p4_b_generates_a

- name_id: "Pola Menyalakan"
- name_en: "Kindling Pattern"
- label_meaning: "Caranya melangkah menyalakan semangatmu. Hal yang membuatnya bergerak secara alami menjadi alasan untukmu ikut melangkah."
- meaning_seed: "Dorongan alaminya adalah pemantik untuk caramu menjalani hidup. Kamu tumbuh lebih cepat di dekatnya, namun ia bisa merasa lelah jika harus selalu menjadi pihak yang memulai."
- daily_seed: "Ide atau antusiasme yang ia lontarkan di pagi hari sering kali sudah kamu jalankan di sore hari, dengan caramu sendiri."
