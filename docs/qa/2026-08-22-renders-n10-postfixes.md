<!--
STATUS: RAW QA DUMP. Generated, not written. Do not edit the prose in this file -
it is evidence, and an edited render is not one. Regenerate with npm run qa:renders.
-->

# QA renders — 2026-08-22

Charts 5, 13, 1 and fresh-1996 through the real chain. **Prose is verbatim and nothing
below a rule is edited.** Nobody has judged these; that is Reyner's, after Cowork annotates.

## FLOOR RATE, n = 10 per chart

| Chart | runs | scored | floored | floor rate | transport-truncated | cached |
|---|---|---|---|---|---|---|
| chart 5 | 10 | 10 | 2 | **20%** | 0 | 0 |
| chart 13 | 10 | 10 | 0 | **0%** | 0 | 0 |
| chart 1 | 10 | 10 | 2 | **20%** | 0 | 0 |
| fresh-1996 | 10 | 10 | 0 | **0%** | 0 | 0 |
| **POOLED** | **40** | **40** | **4** | **10%** | **0** | **0** |

`scored` is the denominator the rate uses. A run whose chain was cut short by a provider
transport error is EXCLUDED, because the gate did not floor it - the trap
`probe-retry-depth` hit on 2026-08-19, where one 503 was the whole difference between a
reported 3% floor and a real 0 of 39.

## COVERAGE DISTRIBUTION, so `fieldOverlap` can be fitted from data

`fieldOverlap` = **0.2**, `fieldMinHits` = **2**. A field fails only when
ratio is under the threshold AND hits are under the minimum, so the two columns are not
interchangeable. Every observation is here, passing and failing both - a threshold fitted
from rejections alone cannot tell "nothing came near the line" from "half the corpus sits
one stem above it".

| ratio bucket | observations | of which hits >= 2 (rescued) | would FAIL |
|---|---|---|---|
| 0.00 - 0.05 **(under threshold)** | 3 | 0 | 3 |
| 0.05 - 0.10 **(under threshold)** | 7 | 0 | 7 |
| 0.10 - 0.15 **(under threshold)** | 25 | 16 | 9 |
| 0.15 - 0.20 **(under threshold)** | 18 | 18 | 0 |
| 0.20 - 0.30 | 58 | 58 | 0 |
| 0.30 - 0.40 | 100 | 100 | 0 |
| 0.40 - 0.60 | 314 | 314 | 0 |
| 0.60 - 1.00 | 1524 | 1524 | 0 |
| **TOTAL** | **2049** | **2030** | **19** |

19 of 2049 observations would fail (1%).

Failing observations by FIELD - `coverage` is four different demands under one name:

| field | failing |
|---|---|
| `gift` | 11 |
| `cost` | 8 |

## FLAG RATES across all 10 run(s) per chart

| Chart | rendered runs | opening.archetype_missing |
|---|---|---|
| chart 5 | 8 | 0/8 |
| chart 13 | 10 | 0/10 |
| chart 1 | 8 | 0/8 |
| fresh-1996 | 10 | 2/10 |
| **POOLED** | **36** | **2/36** |

A flag never rejects. The DENOMINATOR IS RENDERED RUNS: a floored run has no model
output to judge, so including it would dilute the rate with runs that could not have
exhibited the thing being counted.

## ⚠ 1 of 4 READINGS BELOW ARE THE FLOOR, NOT A READING

`source: module_assembly` means Stage 6 rejected the model on every attempt in its
budget - one initial plus two regenerations since 2026-08-19, so THREE, not the two
this banner used to claim - and the reader was served
**module assembly** — the deterministic floor, which renders glossary strings Reyner already
ruled. It is fluent Indonesian and it is indistinguishable from a reading by eye. A register
or quality verdict formed on one of these is a verdict on the glossary, not on the renderer.

- **chart 5** (1988-07-10 22:00) — the reading printed below is `module_assembly`, from run 1 of 10.

**They are included below anyway, labelled**, because what the floor produces is worth
seeing next to what the model produces. Read the banner before the prose, every time.

---

## THE 4 FLOORED RUN(S), AND WHY EACH ONE FLOORED

Every floored run across all runs, not only the printed one. A run floors when Stage 6
rejected every attempt in the regeneration budget - one initial plus 3 regeneration(s). THE NUMBER IS READ FROM `lib/render/config.js`, never written here: this sentence said "plus two regenerations" as a literal until 2026-08-22, which would have described the wrong gate the moment the budget moved.
Transport-truncated runs are NOT here: they are listed separately and were never
floored by the gate.

| Chart | run | attempt | rejected on |
|---|---|---|---|
| chart 5 | 1 | 1 | coverage.cost_dropped |
|  |  | 2 | fact.condition_named **(HARD)** |
|  |  | 3 | coverage.field_dropped, coverage.field_dropped, coverage.field_dropped |
|  |  | 4 | coverage.field_dropped, style.essay_connectives |
| chart 5 | 7 | 1 | fact.condition_named, style.hedging **(HARD)** |
|  |  | 2 | fact.condition_named **(HARD)** |
|  |  | 3 | coverage.field_dropped |
|  |  | 4 | fact.condition_named **(HARD)** |
| chart 1 | 4 | 1 | style.hedging, style.essay_connectives |
|  |  | 2 | style.essay_connectives |
|  |  | 3 | fact.condition_named, fact.condition_named **(HARD)** |
|  |  | 4 | style.hedging |
| chart 1 | 6 | 1 | fact.condition_named, fact.condition_named, style.essay_connectives **(HARD)** |
|  |  | 2 | coverage.cost_dropped |
|  |  | 3 | fact.condition_named **(HARD)** |
|  |  | 4 | coverage.cost_dropped, coverage.field_dropped |

Checks by how often they fired inside a floored run:

| check | fired |
|---|---|
| `fact.condition_named` | 9 |
| `coverage.field_dropped` | 6 |
| `style.essay_connectives` | 4 |
| `coverage.cost_dropped` | 3 |
| `style.hedging` | 3 |

## EVERY REJECTED ATTEMPT, WITH THE FINDING'S OWN MESSAGE (36)

Across ALL runs, not only floored ones. `outcome` says what became of the run this
attempt belongs to, so a rejection that a later attempt fixed is not read as a floor.

**chart 5, run 1, attempt 1** — run FLOORED

- `coverage.cost_dropped` — relation_六合_寅亥: "cost" did not survive into the prose (0/5 stems)

**chart 5, run 1, attempt 2** — run FLOORED — **HARD**

- `fact.condition_named` — "Dominant Output" is a condition, not a badge, and must not be named

**chart 5, run 1, attempt 3** — run FLOORED

- `coverage.field_dropped` — strength_balanced: "gift" did not survive into the prose (1/11 stems)
- `coverage.field_dropped` — main_profile: "gift" did not survive into the prose (1/11 stems)
- `coverage.field_dropped` — element_missing_Metal: "gift" did not survive into the prose (1/8 stems)

**chart 5, run 1, attempt 4** — run FLOORED

- `coverage.field_dropped` — element_missing_Metal: "gift" did not survive into the prose (1/8 stems)
- `style.essay_connectives` — /\bdengan demikian\b|\badapun\b|\bhal tersebut\b|\bsebagaimana\b/ at "dahal hal-hal tersebut terus menempel dan menguras"

**chart 5, run 2, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Dominant Output" is a condition, not a badge, and must not be named

**chart 5, run 2, attempt 2** — run RENDERED

- `coverage.field_dropped` — strength_balanced: "gift" did not survive into the prose (1/11 stems)
- `coverage.field_dropped` — element_missing_Metal: "gift" did not survive into the prose (1/8 stems)

**chart 5, run 4, attempt 1** — run RENDERED

- `coverage.field_dropped` — element_missing_Metal: "gift" did not survive into the prose (1/8 stems)

**chart 5, run 4, attempt 2** — run RENDERED — **HARD**

- `fact.condition_named` — "Dominant Output" is a condition, not a badge, and must not be named

**chart 5, run 4, attempt 3** — run RENDERED — **HARD**

- `fact.condition_named` — "Dominant Output" is a condition, not a badge, and must not be named
- `coverage.field_dropped` — element_missing_Metal: "gift" did not survive into the prose (1/8 stems)

**chart 5, run 7, attempt 1** — run FLOORED — **HARD**

- `fact.condition_named` — "Dominant Output" is a condition, not a badge, and must not be named
- `style.hedging` — /\bcenderung\b/ at "nya. Kamu cenderung bertahan di situasi yang sudah"

**chart 5, run 7, attempt 2** — run FLOORED — **HARD**

- `fact.condition_named` — "Dominant Output" is a condition, not a badge, and must not be named

**chart 5, run 7, attempt 3** — run FLOORED

- `coverage.field_dropped` — element_missing_Metal: "gift" did not survive into the prose (1/8 stems)

**chart 5, run 7, attempt 4** — run FLOORED — **HARD**

- `fact.condition_named` — "Dominant Output" is a condition, not a badge, and must not be named

**chart 5, run 9, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Dominant Output" is a condition, not a badge, and must not be named

**chart 5, run 9, attempt 2** — run RENDERED — **HARD**

- `fact.condition_named` — "Dominant Output" is a condition, not a badge, and must not be named
- `coverage.field_dropped` — element_missing_Metal: "gift" did not survive into the prose (1/8 stems)

**chart 13, run 1, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Dominant Wealth" is a condition, not a badge, and must not be named

**chart 1, run 1, attempt 1** — run RENDERED

- `style.essay_connectives` — /\bkondisi ini\b/ at "sendiri. Kondisi ini dipertegas dengan status bag"

**chart 1, run 2, attempt 1** — run RENDERED

- `coverage.cost_dropped` — badge_桃花: "cost" did not survive into the prose (1/13 stems)
- `style.essay_connectives` — /\bkondisi ini\b/ at "sendiri. Kondisi ini dipertegas dengan status bag"; /\bhal ini\b/ at "kalender. Hal ini berkaitan dengan Aspek Pengatur"

**chart 1, run 2, attempt 2** — run RENDERED — **HARD**

- `fact.condition_named` — element_missing_Wood is a condition and this block names it: "Aspek Pengatur (Direct Officer)"
- `fact.condition_named` — element_dominant_Water is a condition and this block names it: "Aspek Pengatur (Direct Officer)"
- `style.raw_pillar` — /\bpilar\s+(tahun|bulan|hari|jam)\w*/ at "muncul di pilar bulan, hari, dan jam. Kamu tahu ap"

**chart 1, run 3, attempt 1** — run RENDERED

- `style.essay_connectives` — /\bkondisi ini\b/ at "k pulih. Kondisi ini dipertegas oleh status bagan"; /\bhal ini\b/ at "ya berat. Hal ini diperkuat oleh dominasi unsur Ai"

**chart 1, run 4, attempt 1** — run FLOORED

- `style.hedging` — /\bcenderung\b/ at "ubunganmu cenderung mengikuti pola tanggung jawab"
- `style.essay_connectives` — /\bkondisi ini\b/ at "k pulih. Kondisi ini dipertegas dengan status bag"

**chart 1, run 4, attempt 2** — run FLOORED

- `style.essay_connectives` — /\bhal ini\b/ at "u benar. Hal ini tercermin di Fondasi Pasangan, y"

**chart 1, run 4, attempt 3** — run FLOORED — **HARD**

- `fact.condition_named` — element_missing_Wood is a condition and this block names it: "Aspek Pengatur (Direct Officer)"
- `fact.condition_named` — element_dominant_Water is a condition and this block names it: "Aspek Pengatur (Direct Officer)"

**chart 1, run 4, attempt 4** — run FLOORED

- `style.hedging` — /\bcenderung\b/ at "ubunganmu cenderung mengikuti pola tanggung jawab"

**chart 1, run 6, attempt 1** — run FLOORED — **HARD**

- `fact.condition_named` — element_missing_Wood is a condition and this block names it: "Aspek Pengatur (Direct Officer)"
- `fact.condition_named` — element_dominant_Water is a condition and this block names it: "Aspek Pengatur (Direct Officer)"
- `style.essay_connectives` — /\bkondisi ini\b/ at "k pulih. Kondisi ini dipertegas oleh status bagan"

**chart 1, run 6, attempt 2** — run FLOORED

- `coverage.cost_dropped` — badge_桃花: "cost" did not survive into the prose (0/13 stems)

**chart 1, run 6, attempt 3** — run FLOORED — **HARD**

- `fact.condition_named` — "Dominant Officer" is a condition, not a badge, and must not be named

**chart 1, run 6, attempt 4** — run FLOORED

- `coverage.cost_dropped` — void_stack_month: "cost" did not survive into the prose (1/7 stems)
- `coverage.field_dropped` — element_missing_Wood: "gift" did not survive into the prose (1/8 stems)

**chart 1, run 7, attempt 1** — run RENDERED

- `style.essay_connectives` — /\bkondisi ini\b/ at "k pulih. Kondisi ini dipertegas dengan statusmu s"

**chart 1, run 7, attempt 2** — run RENDERED

- `coverage.cost_dropped` — badge_桃花: "cost" did not survive into the prose (1/13 stems)
- `style.essay_connectives` — /\bhal ini\b/ at "lu benar. Hal ini juga tercermin di Fondasi Pasang"

**chart 1, run 7, attempt 3** — run RENDERED — **HARD**

- `fact.condition_named` — "Dominant Officer" is a condition, not a badge, and must not be named

**chart 1, run 8, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — "Missing Wood" is a condition, not a badge, and must not be named
- `fact.condition_named` — "Dominant Officer" is a condition, not a badge, and must not be named
- `style.essay_connectives` — /\bkondisi ini\b/ at "k pulih. Kondisi ini dipertegas dengan status bag"

**chart 1, run 9, attempt 1** — run RENDERED — **HARD**

- `fact.condition_named` — element_missing_Wood is a condition and this block names it: "Aspek Pengatur (Direct Officer)"
- `fact.condition_named` — element_dominant_Water is a condition and this block names it: "Aspek Pengatur (Direct Officer)"
- `style.essay_connectives` — /\bkondisi ini\b/ at "k pulih. Kondisi ini dipertegas dengan statusmu s"

**fresh-1996, run 2, attempt 1** — run RENDERED

- `coverage.cost_dropped` — badge_桃花: "cost" did not survive into the prose (0/13 stems)

**fresh-1996, run 2, attempt 2** — run RENDERED — **HARD**

- `fact.condition_named` — "Dominant Resource" is a condition, not a badge, and must not be named
- `coverage.cost_dropped` — badge_桃花: "cost" did not survive into the prose (1/13 stems)

**fresh-1996, run 6, attempt 1** — run RENDERED

- `coverage.cost_dropped` — badge_桃花: "cost" did not survive into the prose (1/13 stems)

---

## RETRY EROSION IN FINDINGS — does a regeneration break what it had passed?

| step | regeneration steps | steps introducing a NEW check | new checks | checks that SURVIVED the directive |
|---|---|---|---|---|
| attempt 1 -> 2 | 16 | 8 (50%) | 9 | 5 |
| attempt 2 -> 3 | 10 | 6 (60%) | 6 | 1 |
| attempt 3 -> 4 | 6 | 4 (67%) | 5 | 1 |

A check in the SURVIVED column was named to the model by `stricterDirective` and fired
again anyway. A check that survives every step of the budget is not short of chances.

| Chart | run | step | fixed | survived | NEW |
|---|---|---|---|---|---|
| chart 5 | 1 | 1 -> 2 | coverage.cost_dropped | — | fact.condition_named |
| chart 5 | 1 | 2 -> 3 | fact.condition_named | — | coverage.field_dropped |
| chart 5 | 1 | 3 -> 4 | — | coverage.field_dropped | style.essay_connectives |
| chart 5 | 2 | 1 -> 2 | fact.condition_named | — | coverage.field_dropped |
| chart 5 | 2 | 2 -> 3 | coverage.field_dropped | — | — |
| chart 5 | 4 | 1 -> 2 | coverage.field_dropped | — | fact.condition_named |
| chart 5 | 4 | 2 -> 3 | — | fact.condition_named | coverage.field_dropped |
| chart 5 | 4 | 3 -> 4 | fact.condition_named, coverage.field_dropped | — | — |
| chart 5 | 7 | 1 -> 2 | style.hedging | fact.condition_named | — |
| chart 5 | 7 | 2 -> 3 | fact.condition_named | — | coverage.field_dropped |
| chart 5 | 7 | 3 -> 4 | coverage.field_dropped | — | fact.condition_named |
| chart 5 | 9 | 1 -> 2 | — | fact.condition_named | coverage.field_dropped |
| chart 5 | 9 | 2 -> 3 | fact.condition_named, coverage.field_dropped | — | — |
| chart 13 | 1 | 1 -> 2 | fact.condition_named | — | — |
| chart 1 | 1 | 1 -> 2 | style.essay_connectives | — | — |
| chart 1 | 2 | 1 -> 2 | coverage.cost_dropped, style.essay_connectives | — | fact.condition_named, style.raw_pillar |
| chart 1 | 2 | 2 -> 3 | fact.condition_named, style.raw_pillar | — | — |
| chart 1 | 3 | 1 -> 2 | style.essay_connectives | — | — |
| chart 1 | 4 | 1 -> 2 | style.hedging | style.essay_connectives | — |
| chart 1 | 4 | 2 -> 3 | style.essay_connectives | — | fact.condition_named |
| chart 1 | 4 | 3 -> 4 | fact.condition_named | — | style.hedging |
| chart 1 | 6 | 1 -> 2 | fact.condition_named, style.essay_connectives | — | coverage.cost_dropped |
| chart 1 | 6 | 2 -> 3 | coverage.cost_dropped | — | fact.condition_named |
| chart 1 | 6 | 3 -> 4 | fact.condition_named | — | coverage.cost_dropped, coverage.field_dropped |
| chart 1 | 7 | 1 -> 2 | — | style.essay_connectives | coverage.cost_dropped |
| chart 1 | 7 | 2 -> 3 | coverage.cost_dropped, style.essay_connectives | — | fact.condition_named |
| chart 1 | 7 | 3 -> 4 | fact.condition_named | — | — |
| chart 1 | 8 | 1 -> 2 | fact.condition_named, style.essay_connectives | — | — |
| chart 1 | 9 | 1 -> 2 | fact.condition_named, style.essay_connectives | — | — |
| fresh-1996 | 2 | 1 -> 2 | — | coverage.cost_dropped | fact.condition_named |
| fresh-1996 | 2 | 2 -> 3 | fact.condition_named, coverage.cost_dropped | — | — |
| fresh-1996 | 6 | 1 -> 2 | coverage.cost_dropped | — | — |

---

## chart 5 — 1988-07-10 22:00

> the quietFloor re-ask — padding confirmed by Reyner 2026-08-11, attributed to unwritten cells

### ⚠ THIS IS THE FLOOR. It is not the renderer's output and must not be read as one.

| | |
|---|---|
| `source` | **module_assembly** |
| `model` | — (no model output was served) |
| `prompt_version` | — (floor renders no prompt) |
| loaded prompt | 22316c3349d0ea46 |
| `stage6_version` | 1.17.0-floor |
| `qa_flag` | stage6_budget_spent |
| `cached` | false |
| served at attempt | — (floor) of 4 |
| pillars | 戊辰 己未 丙寅 己亥 |
| facts / required | 13 / 7 |

Attempts, in order:

1. `gemini` rejected — coverage.cost_dropped
2. `gemini` rejected — fact.condition_named **(HARD)**
3. `gemini` rejected — coverage.field_dropped, coverage.field_dropped, coverage.field_dropped
4. `gemini` rejected — coverage.field_dropped, style.essay_connectives

Findings recorded on the served result:

- `coverage.field_dropped` (soft) — element_missing_Metal: "gift" did not survive into the prose (1/8 stems)
- `style.essay_connectives` (soft) — /\bdengan demikian\b|\badapun\b|\bhal tersebut\b|\bsebagaimana\b/ at "dahal hal-hal tersebut terus menempel dan menguras"

---

### Api

Kamu adalah Matahari (The Sun) dengan unsur Api. Kehadiranmu langsung terasa sebelum kamu bicara. Kamu menerangi sekitarmu lebih dulu sebelum menghangatkan dirimu sendiri, dan nyala itu memakai tenaga yang tidak mengisi dirinya sendiri.

Orang-orang berkumpul di sekitarmu tanpa perlu kamu undang. Suasana ruangan berubah saat kamu masuk. Api selalu membutuhkan bahan bakar dari luar. Kamu tidak bisa terus menyala hanya dari cadangan energimu sendiri. Atur jadwal untuk mengisi energimu seserius kamu mengatur jadwal kerja. Sediakan waktu untuk bertemu orang atau mendatangi tempat yang bisa memulihkan tenagamu. Jangan tunggu sampai bateraimu benar-benar habis baru mencari cara untuk pulih.

### Seimbang

Seimbang (Balanced). Baganmu berdiri di titik tengah yang stabil. Kamu sanggup menopang dirimu sendiri sekaligus tetap terbuka menerima dari luar. Situasi berubah, tetapi kamu jarang ikut goyah.

Kamu memiliki kelenturan yang tinggi. Perubahan mendadak yang membuat orang lain kehilangan arah biasanya hanya menggeser langkahmu sedikit saja. Titik tengah tidak memberi dorongan ekstrem yang memaksa. Arah hidupmu harus kamu tentukan sendiri, karena baganmu tidak akan memaksamu ke satu sudut. Tentukan satu komitmen untuk enam bulan ke depan dan tuliskan alasannya. Begitu ragu menghampiri, baca ulang catatan itu alih-alih menunggu dorongan luar.

### Aspek Pemijar

Pilar Kerja. Aspek Pemijar (Hurting Officer). Kamu cepat melihat cara yang lebih baik dan sulit diam saat melihat hal yang tidak efisien. Mengikuti aturan yang tidak masuk akal terasa menyiksa.

Kamu paling cepat menemukan celah dan paling berani menyuarakan kebenaran. Ide yang tajam biasanya datang darimu. Kejujuranmu mahal harganya. Orang yang kamu koreksi sering mengingat rasa sakitnya, bukan kebenarannya. Tunda penyampaian kritik saat kamu emosi. Besoknya, sampaikan hanya satu poin perbaikan beserta dampaknya dengan jernih. Satu masukan yang diterima jauh lebih bernilai dibanding lima yang ditolak.

### Ikatan

Pilar Diri dan Pilar Arah. Ikatan (Combination). Dua bagian dari baganmu saling mengunci. Area hidup yang diwakili keduanya berjalan berdampingan; saat satu bergerak, yang lain otomatis ikut terpengaruh.

Ada dua bidang hidupmu yang saling menguatkan dengan sendirinya tanpa perlu kamu atur. Saat ada masalah, keduanya ikut terdampak bersamaan. Masalah di satu area jarang berhenti di sana saja. Saat satu pilar kehidupanmu terguncang, jaga pilar pasangannya tetap berjalan rutin. Menjaga satu pilar tetap stabil mencegah efek domino ke area lainnya.

<!-- no heading: a null-label condition, described not named -->

Memutuskan untuk berhenti atau mengakhiri sesuatu terasa jauh lebih sulit bagimu daripada memulainya. Kamu bertahan di situasi yang sudah jelas selesai. Kamu memberi kesempatan lebih banyak kepada orang lain. Hubungan atau pekerjaan jarang kamu putus tergesa-gesa. Hal-hal yang seharusnya sudah selesai terus menempel dan menguras energi. Batas tegas harus kamu buat dengan sengaja karena tidak akan muncul sendiri. Beranikan diri mengakhiri urusan yang menggantung lewat satu percakapan tegas. Menggantung masalah jauh lebih menguras energi dibanding ketegangan singkat saat menyelesaikannya.

<!-- no heading: a null-label condition, described not named -->

Baganmu terisi oleh karya dan output. Energi mengucur lewat ide, kreasi, dan kejelian melihat ruang perbaikan. Ide dan karya mengalir tanpa henti. Kamu tak pernah kehabisan gagasan. Output-mu menguras habis input-mu. Kamu terus memberi sampai lupa mengisi ulang daya diri sendiri. Selesaikan satu tugas sepenuhnya sebelum menyentuh yang baru, dan sisihkan satu hari seminggu bebas dari target output apa pun.

### Fondasi Pasangan

Pilar Diri. Fondasi Pasangan (Spouse Palace). Tempat membaca dinamika hubungan paling dekat. Isinya menunjukkan tekstur relasi yang terasa wajar bagimu, meskipun orang lain bisa menganggapnya berat.

### Penutup

*(empty — `notes.penutup_unavailable` is true)*

---

## chart 13 — 1989-02-04 04:00

> the 立春 boundary chart, and the one Track A is expected to miss

### Real render

| | |
|---|---|
| `source` | **gemini** |
| `model` | gemini-3.1-flash-lite |
| `prompt_version` | 22316c3349d0ea46 |
| loaded prompt | 22316c3349d0ea46 |
| `stage6_version` | 1.17.0 |
| `qa_flag` | — |
| `cached` | false |
| served at attempt | 2 of 2 |
| pillars | 戊辰 乙丑 乙未 戊寅 |
| facts / required | 11 / 6 |

Attempts, in order:

1. `gemini` rejected — fact.condition_named **(HARD)**
2. `gemini` passed Stage 6

---

### Identitas dan Keseimbangan Diri

Kamu adalah Bambu (The Bamboo), sosok yang tumbuh dengan menjangkau hal baru. Berhenti berkembang terasa lebih buruk bagimu daripada salah arah. Kamu memiliki dorongan alami untuk maju dan memperbaiki keadaan, namun kamu sulit melambat bahkan saat tubuh dan pikiranmu sangat membutuhkan istirahat. Baganmu berdiri di titik tengah yang Seimbang (Balanced).

Kamu sanggup menopang dirimu sendiri sekaligus tetap terbuka menerima dari luar. Perubahan mendadak yang membuat orang lain kehilangan arah biasanya hanya menggeser langkahmu sedikit saja. Karena baganmu tidak memaksamu ke satu sudut, arah hidupmu harus kamu tentukan sendiri. Tentukan satu komitmen untuk enam bulan ke depan dan tuliskan alasannya. Begitu ragu menghampiri, baca ulang catatan itu alih-alih menunggu dorongan luar.

### Peraih di Pilar Kerja

Di Pilar Kerja, yang mencakup pekerjaan dan kariermu, kamu memiliki Aspek Peraih (Indirect Wealth). Kamu melihat peluang di tempat yang dilewati orang lain. Kesempatan dan hasil terasa mudah datang, tetapi juga mudah lepas. Kamu tidak takut pada ketidakpastian dan pintu sering terbuka justru karena kamu berani mengetuk lebih dulu. Namun, yang datang besar bisa hilang besar karena kamu jarang menyimpannya cukup lama untuk benar-benar merasa aman. Kunci dan eksekusi tuntas satu peluang di tangan sebelum mengejar yang baru, karena peluang yang setengah jalan hanya membuang energi.

### Benturan Pilar Kerja dan Diri

Pilar Kerja dan Pilar Diri, yang mencakup kehidupan pribadi dan hubungan terdekatmu, mengalami Benturan (Clash). Perubahan di area ini biasanya datang mendadak dan membawa guncangan. Kamu terbiasa beradaptasi dengan guncangan cepat, namun kestabilan di area ini tidak datang otomatis dan butuh dijaga dengan usaha sadar. Perlakukan dinamika ini sebagai dorongan untuk naik kelas. Siapkan rencana cadangan sebelum dibutuhkan agar kamu merespons dengan strategi, bukan panik.

### Pengelolaan Tanggung Jawab

Baganmu dipenuhi oleh unsur Tanah yang menuntut pengelolaan, mulai dari peluang, tanggung jawab, hingga urusan orang lain. Kesempatan tak pernah habis di tanganmu, namun urusan sering melebihi kapasitas fisikmu sehingga perhatianmu terpecah dan banyak hal terbengkalai setengah jalan. Pilih hanya tiga prioritas utama untuk kuartal ini dan parkir sisanya. Fokus selesaikan tiga hal itu sebelum menyentuh daftar tunggu.

### Fondasi Pasangan

Fondasi Pasanganmu berada di Pilar Diri. Isinya menunjukkan tekstur relasi yang terasa wajar bagimu, meskipun orang lain bisa menganggapnya berat. Di sini, kamu membawa Aspek Peraih yang membuatmu selalu melihat peluang dalam hubungan, namun juga menuntutmu untuk belajar menjaga apa yang sudah ada agar tidak mudah lepas.

### Tanda Kekosongan

Di Pilar Akar yang mencakup asal-usul dan latar belakangmu, terdapat Tanda Kekosongan (Void). Orang lain melihat kamu berhasil di bidang ini, tetapi kamu sendiri sering merasa belum pantas menyandangnya. Hasilnya tidak pernah kurang, namun rasa memilikinya yang tidak pernah ikut hadir. Kamu tidak pernah bersandar pada keberuntungan di sini, sehingga apa pun yang kamu capai dibangun murni dengan kerja keras. Sebut hasil kerjamu dengan lantang, meskipun rasanya canggung, agar pengakuan itu bisa menempel di dalam dirimu.

### Kemandirian dan Pengelolaan

Kamu memiliki Aspek Pendamping (Friend) yang membuatmu terbiasa menyelesaikan semuanya sendiri. Meminta tolong terasa lebih berat daripada mengerjakan sesuatu dua kali lipat, padahal bantuan sering datang terlambat karena orang mengira kamu tidak membutuhkannya. Di sisi lain, kamu memiliki Aspek Pengelola (Direct Wealth) yang tersebar di Pilar Akar dan Pilar Arah. Kamu dipercaya memegang hal penting dan merawatnya dengan rapi, namun semakin banyak yang kamu pegang, semakin sedikit energi yang tersisa untuk dirimu sendiri. Pilih satu tugas untuk diserahkan ke orang lain bulan ini dan biarkan hasilnya berjalan meskipun tidak serapi caramu.

### Intuisi Pemikir

Kamu memiliki Aspek Pemikir (Indirect Resource) yang tersebar di Pilar Akar dan Pilar Kerja. Kamu memahami sesuatu lewat jalan intuitif yang sulit dijelaskan dan sering melihat pola yang luput dari pandangan orang lain. Kamu sering merasa berjarak dari lingkungan sekitar karena menjelaskan isi kepalamu terasa melelahkan. Cukup sampaikan kesimpulannya dan satu alasan paling kuat agar orang lain mengerti tanpa membuat energimu terkuras.

### Penutup

Kamu adalah sosok yang mampu menyeimbangkan dorongan untuk terus maju dengan tanggung jawab besar yang kamu kelola. Keberanianmu mengetuk pintu peluang adalah kekuatan, namun belajar untuk berhenti sejenak dan meminta bantuan akan membuat langkahmu jauh lebih berkelanjutan. Masa depanmu adalah hasil dari kerja keras yang kamu bangun sendiri, terlepas dari apakah kamu sudah merasa pantas atau belum.

---

## chart 1 — 1989-09-13 09:00

> the reference chart for every card and contrast measurement

### Real render

| | |
|---|---|
| `source` | **gemini** |
| `model` | gemini-3.1-flash-lite |
| `prompt_version` | 22316c3349d0ea46 |
| loaded prompt | 22316c3349d0ea46 |
| `stage6_version` | 1.17.0 |
| `qa_flag` | — |
| `cached` | false |
| served at attempt | 2 of 2 |
| pillars | 己巳 癸酉 丙子 癸巳 |
| facts / required | 14 / 9 |

Attempts, in order:

1. `gemini` rejected — style.essay_connectives
2. `gemini` passed Stage 6

---

### Dirimu dan Sumber Tenaga

Kamu adalah Matahari (The Sun). Kehadiranmu langsung terasa sebelum kamu bicara. Kamu menerangi sekitarmu lebih dulu sebelum menghangatkan dirimu sendiri, dan nyala itu memakai tenaga yang tidak mengisi dirinya sendiri. Orang-orang berkumpul di sekitarmu tanpa perlu kamu undang, namun api selalu membutuhkan bahan bakar dari luar. Kamu tidak bisa terus menyala hanya dari cadangan energimu sendiri. Atur jadwal untuk mengisi energimu seserius kamu mengatur jadwal kerja. Sediakan waktu untuk bertemu orang atau mendatangi tempat yang bisa memulihkan tenagamu. Jangan tunggu sampai bateraimu benar-benar habis baru mencari cara untuk pulih.

Kamu memiliki kondisi Lemah (Weak). Lemah di sini bukan berarti tidak mampu, melainkan sumber tenagamu ada di luar dirimu. Kamu sangat peka membaca situasi dan tahu cara memanfaatkan dukungan di sekitarmu. Saat berada di lingkungan yang pas, pertumbuhanmu bisa jauh melampaui orang lain. Karena sumber tenagamu dari luar, kamu kehabisan energi lebih cepat saat salah menempatkan diri. Perhatikan lingkunganmu dengan serius, bukan hanya sebagai latar belakang. Sebelum mengambil peran baru, tanya ke diri sendiri: siapa atau apa yang akan mengisi ulang energiku di sini?

### Karier dan Pengakuan

Di Pilar Kerja, yang mencakup pekerjaan dan kariermu, terdapat Tanda Kekosongan (Void). Orang lain melihat kamu berhasil di bidang ini, tetapi kamu sendiri sering merasa belum pantas menyandangnya. Hasilnya tidak pernah kurang. Rasa memilikinya yang tidak pernah ikut hadir. Kamu tidak pernah bersandar pada keberuntungan di bidang ini, namun pengakuan orang lain tidak pernah menempel di dalam dirimu. Sebut hasil kerjamu dengan lantang, meskipun rasanya canggung.

Di pilar yang sama, kamu memiliki Aspek Pengelola (Direct Wealth). Kamu dipercaya memegang hal penting dan merawatnya dengan rapi. Apa yang kamu urus jarang berantakan, tetapi semakin banyak yang kamu pegang, semakin sedikit energi yang tersisa untuk dirimu sendiri. Pilih satu tugas untuk diserahkan ke orang lain bulan ini. Berikan petunjuk yang jelas, dan biarkan hasilnya berjalan meskipun tidak serapi caramu.

Juga di Pilar Kerja, kamu punya Bunga Persik (Peach Blossom). Orang mengingatmu setelah satu pertemuan tanpa kamu perlu berusaha keras. Pintu terbuka lebih cepat untukmu karena orang penasaran ingin mengenalmu lebih jauh. Namun, perhatian datang lebih cepat daripada kedekatan. Pilih beberapa orang, lalu bagikan cerita yang jujur dan luangkan waktu bersama mereka. Kesan pertama hanya membuka pintu; kehadiran yang konsisten yang membuat orang bertahan.

### Arah dan Langkah

Kamu memiliki Setengah Gabungan (Half Combination) yang membentang di Pilar Akar, Pilar Kerja, dan Pilar Arah. Dua dari tiga bagian sudah saling tarik, memberi arah yang jelas meski kekuatannya belum sepenuhnya padu. Dalam kehidupan sehari-hari, ini terasa seperti rasa hampir pas; semuanya sudah jalan, tapi kamu selalu merasa harus menambah satu hal lagi sebelum berani menyebutnya selesai. Rasa belum lengkap itu hanya bagian dari polamu. Saat muncul keinginan untuk menambah satu hal lagi, berhenti sejenak dan tanya: apakah yang ada sekarang sudah cukup untuk melangkah?

### Disiplin dan Hubungan

Tidak ada unsur Kayu di baganmu. Kamu jarang menunggu inspirasi dan tidak pernah gelisah tanpa alasan. Kamu fokus bekerja dari apa yang ada di depan mata, namun susah untuk putar arah. Buat pemicu dari luar untuk berubah, seperti memasang tanggal keputusan di kalender. Kamu juga memiliki Aspek Pengatur (Direct Officer) yang tersebar di Pilar Kerja, Pilar Diri, dan Pilar Arah. Kamu tahu apa yang seharusnya dilakukan dan tetap menjalankannya meski tidak ada yang melihat. Tuntutan untuk selalu benar tidak pernah berhenti. Buat jadwal sendiri untuk santai tanpa tuntutan harus selalu benar.

Fondasi Pasanganmu, yang mencakup kehidupan pribadi dan hubungan terdekatmu, ditempati oleh Aspek Pengatur. Dinamika hubunganmu terasa wajar saat ada tanggung jawab yang jelas, meskipun orang lain bisa menganggapnya berat.

### Penutup

Kamu adalah sosok yang tangguh dan disiplin, yang mampu memikul tanggung jawab besar dengan ketenangan yang jarang dimiliki orang lain. Keberhasilanmu adalah hasil nyata dari kerja keras yang kamu bangun sendiri. Saat kamu mulai berani meminta bantuan dan memberi ruang bagi dirimu untuk beristirahat, potensi yang kamu miliki akan jauh lebih leluasa untuk berkembang.

---

## fresh-1996 — 1996-10-02 19:20

> the Samudra opening that ranked 9th of 14 before Prompt K

### Real render

| | |
|---|---|
| `source` | **gemini** |
| `model` | gemini-3.1-flash-lite |
| `prompt_version` | 22316c3349d0ea46 |
| loaded prompt | 22316c3349d0ea46 |
| `stage6_version` | 1.17.0 |
| `qa_flag` | — |
| `cached` | false |
| served at attempt | 1 of 1 |
| pillars | 丙子 丁酉 壬申 庚戌 |
| facts / required | 14 / 9 |

Attempts, in order:

1. `gemini` passed Stage 6

Findings recorded on the served result:

- `opening.archetype_missing` (flag) — the reading's first sentence does not name the archetype "Samudra" (day_master_Water); it opens: "Di Pilar Kerja, kamu memiliki Aspek Pelindung (Direct Resource)."

---

### Profil dan Kekuatan Diri

Di Pilar Kerja, kamu memiliki Aspek Pelindung (Direct Resource). Ini adalah area yang mencakup pekerjaan dan kariermu. Kamu cepat menyerap ilmu dan orang lain senang membimbingmu, sehingga bantuan sering muncul tepat pada waktunya. Kamu jarang benar-benar sendirian, namun kenyamanan ini bisa memperlambat langkahmu karena kamu sering terlalu lama bersiap sebelum mulai melangkah. Batasi masa persiapanmu dengan tanggal, bukan dengan menunggu rasa siap. Mulai saja dulu meski rasanya belum sepenuhnya siap, karena petunjuk berikutnya biasanya baru terlihat setelah kamu melangkah.

Kamu adalah seorang Samudra (The Ocean) dengan batang hari Air (Water). Kamu menyesuaikan diri dengan keadaan tanpa kehilangan arah tujuan, meski orang lain sering kesulitan menebak langkahmu. Kamu mampu menembus situasi yang buntu bagi orang lain karena tidak kaku pada satu cara. Komitmen jangka panjang pada satu bentuk kaku terasa berat bagimu, jadi pegang teguh tujuan utamamu dan bebaskan cara mencapainya. Kamu memiliki kondisi Kuat (Strong). Sumber tenagamu lahir dari dalam diri sendiri, membuatmu sanggup berjalan mandiri lebih jauh dari kebanyakan orang. Tekanan keras yang membuat orang lain menyerah justru bisa kamu balikkan menjadi bahan bakar untuk maju. Alirkan energi lebihmu ke satu kegiatan fisik atau proyek intensif setiap minggu agar tidak tumpah menjadi konflik dengan orang terdekat.

### Pola Gerak dan Ketegasan

Pilar Akar dan Pilar Diri ditempati oleh Setengah Gabungan (Half Combination). Pilar Akar adalah asal-usul dan latar belakangmu, sementara Pilar Diri adalah kehidupan pribadi dan hubungan terdekatmu. Tarikan energi ini memberi arah yang jelas, namun kamu sering merasa harus menambah satu hal lagi sebelum berani menyebutnya selesai. Rasa belum lengkap itu hanya bagian dari polamu, bukan tanda ada yang salah. Saat keinginan itu muncul, tanyakan apakah yang ada sekarang sudah cukup untuk melangkah.

Di Pilar Akar, kamu juga memiliki Mata Pisau (Yang Blade). Ada titik di mana kamu berhenti menimbang dan langsung mengambil keputusan tegas yang sering mengejutkan orang lain. Ketegasan ini sanggup menyelamatkan situasi kritis, namun bisa melukai hubungan jika tidak hati-hati. Endapkan keputusan memutus hubungan atau komitmen selama semalam sebelum mengeksekusinya.

### Gesekan dan Daya Tarik

Pilar Kerja dan Pilar Arah mengalami Gesekan (Harm). Pilar Kerja mencakup pekerjaan dan kariermu, sedangkan Pilar Arah adalah tujuan dan arah masa depanmu. Ini adalah gesekan kecil yang terjadi terus-menerus, bukan benturan besar. Kamu sangat peka pada detail kecil yang diabaikan orang lain, sehingga masalah jarang membesar tanpa terdeteksi olehmu. Bereskan kejanggalan kecil begitu terlihat agar tidak menumpuk menjadi ledakan yang tak perlu.

Di Pilar Kerja, kamu juga memiliki Bunga Persik (Peach Blossom). Orang mengingatmu setelah satu pertemuan tanpa kamu perlu berusaha keras. Pintu terbuka lebih cepat untukmu karena orang penasaran ingin mengenalmu, namun perhatian ini datang lebih cepat daripada kedekatan yang sesungguhnya. Pilih beberapa orang dan luangkan waktu bersama mereka secara konsisten agar hubungan yang dekat bisa terbangun.

### Fondasi dan Arah

Tidak ada unsur Kayu di baganmu. Kamu tidak butuh alasan besar untuk mulai bergerak dan fokus bekerja dari apa yang ada di depan mata, namun kamu susah untuk putar arah. Jangan menunggu merasa siap untuk pindah, karena rasa itu tidak akan datang. Buat pemicu dari luar seperti tanggal keputusan di kalender. Di Pilar Diri, terdapat Fondasi Pasangan (Spouse Palace) yang menunjukkan tekstur relasi yang terasa wajar bagimu. Di sana juga bersemayam Aspek Pemikir (Indirect Resource) yang membuatmu memahami sesuatu lewat jalan intuitif. Kamu melihat pola yang luput dari orang lain, namun menjelaskan isi kepalamu sering terasa melelahkan. Cukup sampaikan kesimpulannya dan satu alasan paling kuat untuk membuat orang lain mengerti.

### Pengakuan Diri

Di Pilar Arah, kamu memiliki Tanda Kekosongan (Void). Orang lain melihat kamu berhasil di bidang ini, tetapi kamu sendiri sering merasa belum pantas menyandangnya. Kamu tidak bersandar pada keberuntungan, namun pengakuan orang lain tidak pernah menempel di dalam dirimu. Sebut hasil kerjamu dengan lantang, meskipun rasanya canggung.

### Penutup

Kamu adalah sosok mandiri yang mampu menembus kebuntuan dengan cara yang tidak terduga. Keberanianmu untuk mengambil keputusan tegas adalah kekuatan besar yang akan terus membentuk arah masa depanmu. Tetaplah melangkah meski rasa siap belum sepenuhnya hadir.

---

