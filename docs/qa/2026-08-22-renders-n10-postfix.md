<!--
STATUS: RAW QA DUMP. Generated, not written. Do not edit the prose in this file -
it is evidence, and an edited render is not one. Regenerate with npm run qa:renders.
-->

# QA renders — 2026-08-21

Charts 5, 13, 1 and fresh-1996 through the real chain. **Prose is verbatim and nothing
below a rule is edited.** Nobody has judged these; that is Reyner's, after Cowork annotates.

## FLOOR RATE, n = 10 per chart

| Chart | runs | scored | floored | floor rate | transport-truncated | cached |
|---|---|---|---|---|---|---|
| chart 5 | 10 | 10 | 5 | **50%** | 0 | 0 |
| chart 13 | 10 | 10 | 0 | **0%** | 0 | 0 |
| chart 1 | 10 | 10 | 5 | **50%** | 0 | 0 |
| fresh-1996 | 10 | 8 | 4 | **50%** | 2 | 0 |
| **POOLED** | **40** | **38** | **14** | **37%** | **2** | **0** |

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
| 0.00 - 0.05 **(under threshold)** | 9 | 0 | 9 |
| 0.05 - 0.10 **(under threshold)** | 11 | 0 | 11 |
| 0.10 - 0.15 **(under threshold)** | 25 | 14 | 11 |
| 0.15 - 0.20 **(under threshold)** | 19 | 19 | 0 |
| 0.20 - 0.30 | 88 | 87 | 0 |
| 0.30 - 0.40 | 106 | 106 | 0 |
| 0.40 - 0.60 | 428 | 428 | 0 |
| 0.60 - 1.00 | 1970 | 1970 | 0 |
| **TOTAL** | **2656** | **2624** | **31** |

31 of 2656 observations would fail (1%).

Failing observations by FIELD - `coverage` is four different demands under one name:

| field | failing |
|---|---|
| `cost` | 17 |
| `gift` | 13 |
| `label_meaning` | 1 |

## FLAG RATES across all 10 run(s) per chart

| Chart | rendered runs | brackets.inserted | brackets.mismatch | opening.element_fused |
|---|---|---|---|---|
| chart 5 | 5 | 5/5 | 0/5 | 5/5 |
| chart 13 | 10 | 9/10 | 0/10 | 0/10 |
| chart 1 | 5 | 4/5 | 0/5 | 1/5 |
| fresh-1996 | 4 | 4/4 | 0/4 | 0/4 |
| **POOLED** | **24** | **22/24** | **0/24** | **6/24** |

A flag never rejects. The DENOMINATOR IS RENDERED RUNS: a floored run has no model
output to judge, so including it would dilute the rate with runs that could not have
exhibited the thing being counted.

## ⚠ 2 of 4 READINGS BELOW ARE THE FLOOR, NOT A READING

`source: module_assembly` means Stage 6 rejected the model on every attempt in its
budget - one initial plus two regenerations since 2026-08-19, so THREE, not the two
this banner used to claim - and the reader was served
**module assembly** — the deterministic floor, which renders glossary strings Reyner already
ruled. It is fluent Indonesian and it is indistinguishable from a reading by eye. A register
or quality verdict formed on one of these is a verdict on the glossary, not on the renderer.

- **chart 5** (1988-07-10 22:00) — the reading printed below is `module_assembly`, from run 1 of 10.
- **fresh-1996** (1996-10-02 19:20) — the reading printed below is `module_assembly`, from run 1 of 10.

**They are included below anyway, labelled**, because what the floor produces is worth
seeing next to what the model produces. Read the banner before the prose, every time.

---

## THE 14 FLOORED RUN(S), AND WHY EACH ONE FLOORED

Every floored run across all runs, not only the printed one. A run floors when Stage 6
rejected every attempt in the regeneration budget - one initial plus two regenerations.
Transport-truncated runs are NOT here: they are listed separately and were never
floored by the gate.

| Chart | run | attempt | rejected on |
|---|---|---|---|
| chart 5 | 1 | 1 | coverage.field_dropped, style.hedging |
|  |  | 2 | fact.condition_named, fact.condition_named, opening.archetype_missing **(HARD)** |
|  |  | 3 | fact.condition_named, fact.condition_named **(HARD)** |
| chart 5 | 3 | 1 | coverage.field_dropped, coverage.field_dropped, style.hedging |
|  |  | 2 | style.hedging |
|  |  | 3 | coverage.field_dropped, coverage.cost_dropped, opening.archetype_missing |
| chart 5 | 7 | 1 | coverage.field_dropped, style.hedging |
|  |  | 2 | opening.archetype_missing |
|  |  | 3 | fact.condition_named, fact.condition_named, style.hedging, style.unsanctioned_bracket **(HARD)** |
| chart 5 | 8 | 1 | coverage.field_dropped |
|  |  | 2 | coverage.field_dropped, opening.archetype_missing |
|  |  | 3 | style.unsanctioned_bracket |
| chart 5 | 10 | 1 | style.hedging |
|  |  | 2 | style.hedging |
|  |  | 3 | style.hedging |
| chart 1 | 2 | 1 | fact.condition_named, opening.archetype_missing, style.essay_connectives, style.unsanctioned_bracket **(HARD)** |
|  |  | 2 | style.unsanctioned_bracket |
|  |  | 3 | opening.archetype_missing |
| chart 1 | 7 | 1 | opening.archetype_missing, style.essay_connectives |
|  |  | 2 | coverage.cost_dropped |
|  |  | 3 | opening.archetype_missing |
| chart 1 | 8 | 1 | opening.archetype_missing |
|  |  | 2 | fact.condition_named **(HARD)** |
|  |  | 3 | forbidden.fatalism **(HARD)** |
| chart 1 | 9 | 1 | opening.archetype_missing, style.essay_connectives |
|  |  | 2 | fact.condition_named, style.unsanctioned_bracket **(HARD)** |
|  |  | 3 | coverage.field_dropped, coverage.cost_dropped, style.hedging |
| chart 1 | 10 | 1 | opening.archetype_missing |
|  |  | 2 | style.unsanctioned_bracket |
|  |  | 3 | opening.archetype_missing |
| fresh-1996 | 1 | 1 | opening.archetype_missing |
|  |  | 2 | style.unsanctioned_bracket |
|  |  | 3 | fact.condition_named, coverage.cost_dropped, coverage.cost_dropped, opening.archetype_missing **(HARD)** |
| fresh-1996 | 5 | 1 | opening.archetype_missing |
|  |  | 2 | style.unsanctioned_bracket |
|  |  | 3 | coverage.field_dropped, opening.archetype_missing, style.hedging, style.essay_connectives |
| fresh-1996 | 9 | 1 | fact.condition_named, opening.archetype_missing **(HARD)** |
|  |  | 2 | coverage.cost_dropped |
|  |  | 3 | opening.archetype_missing |
| fresh-1996 | 10 | 1 | coverage.cost_dropped, coverage.cost_dropped, opening.archetype_missing |
|  |  | 2 | style.unsanctioned_bracket |
|  |  | 3 | opening.archetype_missing |

Checks by how often they fired inside a floored run:

| check | fired |
|---|---|
| `opening.archetype_missing` | 20 |
| `fact.condition_named` | 11 |
| `style.hedging` | 10 |
| `coverage.field_dropped` | 9 |
| `style.unsanctioned_bracket` | 9 |
| `coverage.cost_dropped` | 8 |
| `style.essay_connectives` | 4 |
| `forbidden.fatalism` | 1 |

## chart 5 — 1988-07-10 22:00

> the quietFloor re-ask — padding confirmed by Reyner 2026-08-11, attributed to unwritten cells

### ⚠ THIS IS THE FLOOR. It is not the renderer's output and must not be read as one.

| | |
|---|---|
| `source` | **module_assembly** |
| `model` | — (no model output was served) |
| `prompt_version` | — (floor renders no prompt) |
| loaded prompt | 2f5a5b0ce833f649 |
| `stage6_version` | 1.14.0-floor |
| `qa_flag` | stage6_budget_spent |
| `cached` | false |
| pillars | 戊辰 己未 丙寅 己亥 |
| facts / required | 13 / 7 |

Attempts, in order:

1. `gemini` rejected — coverage.field_dropped, style.hedging
2. `gemini` rejected — fact.condition_named, fact.condition_named, opening.archetype_missing **(HARD)**
3. `gemini` rejected — fact.condition_named, fact.condition_named **(HARD)**

Findings recorded on the served result:

- `fact.condition_named` (hard) — element_missing_Metal is a condition and this block names it: "Logam (Metal)"
- `fact.condition_named` (hard) — element_dominant_Earth is a condition and this block names it: "Logam (Metal)"
- `brackets.mismatch` (flag) — PIPELINE DEFECT, not model output: after insertBrackets, arketipe "Matahari" carries "(Fire)" where the engine supplies "(The Sun)"

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
| `prompt_version` | 2f5a5b0ce833f649 |
| loaded prompt | 2f5a5b0ce833f649 |
| `stage6_version` | 1.14.0 |
| `qa_flag` | — |
| `cached` | false |
| pillars | 戊辰 乙丑 乙未 戊寅 |
| facts / required | 11 / 6 |

Attempts, in order:

1. `gemini` passed Stage 6

Findings recorded on the served result:

- `brackets.inserted` (flag) — rule 23 inserted "(The Bamboo)" after arketipe "Bambu" -- READ THIS: ...ayu, yang dalam bagan ini diwakili oleh Bambu (The Bamboo). Kamu tumbuh dengan menjangkau hal baru...

---

### Diri dan Keseimbangan

Kamu adalah Kayu, yang dalam bagan ini diwakili oleh Bambu (The Bamboo). Kamu tumbuh dengan menjangkau hal baru, dan berhenti berkembang terasa lebih buruk bagimu daripada salah arah. Orang mengira kamu mudah mengikuti arus, padahal kamu hanya sedang menunggu celah dan arah tujuanmu tidak pernah berubah. Kamu memiliki dorongan alami untuk maju dan memperbaiki keadaan, namun kamu sulit melambat bahkan saat tubuh dan pikiranmu sangat membutuhkan istirahat. Baganmu berdiri di titik tengah yang seimbang.

Kamu sanggup menopang dirimu sendiri sekaligus tetap terbuka menerima dari luar. Situasi bisa berubah, tetapi kamu jarang ikut goyah. Kelenturan ini adalah kekuatanmu, di mana perubahan mendadak yang membuat orang lain kehilangan arah biasanya hanya menggeser langkahmu sedikit saja. Karena baganmu tidak memaksamu ke satu sudut, arah hidupmu harus kamu tentukan sendiri. Tentukan satu komitmen untuk enam bulan ke depan dan tuliskan alasannya. Begitu ragu menghampiri, baca ulang catatan itu alih-alih menunggu dorongan luar.

### Benturan dalam Dinamika

Pilar Kerja dan Pilar Diri, yang masing-masing mencakup pekerjaan dan kariermu serta kehidupan pribadi dan hubungan terdekatmu, mengalami Benturan (Clash). Dua bagian baganmu ini saling berhadapan langsung. Perubahan di area ini biasanya datang mendadak dan membawa guncangan, bukan lewat proses perlahan. Kamu terbiasa beradaptasi dengan guncangan cepat, dan situasi sulit yang membuat orang lain panik sudah pernah kamu lewati. Namun, kestabilan di area ini tidak datang otomatis dan butuh dijaga dengan usaha yang sadar. Perlakukan dinamika ini sebagai dorongan untuk naik kelas. Siapkan rencana cadangan sebelum dibutuhkan agar kamu merespons dengan strategi, bukan panik.

### Mengelola Beban

Baganmu dipenuhi oleh elemen Tanah yang dominan, yang berarti kamu dikelilingi oleh hal-hal yang menuntut pengelolaan seperti peluang, tanggung jawab, dan urusan orang lain. Kesempatan tak pernah habis di tanganmu dan kamu selalu punya objek untuk dikelola, namun urusan ini sering melebihi kapasitas fisikmu. Perhatianmu terpecah dan banyak hal terbengkalai setengah jalan. Pilih hanya tiga prioritas utama untuk kuartal ini dan parkir sisanya. Fokus selesaikan tiga hal itu sebelum menyentuh daftar tunggu.

### Peluang dan Hubungan

Di Pilar Kerja, kamu memiliki Aspek Peraih (Indirect Wealth). Kamu melihat peluang di tempat yang dilewati orang lain. Kesempatan dan hasil terasa mudah datang, tetapi juga mudah lepas. Kamu tidak takut pada ketidakpastian dan pintu sering terbuka justru karena kamu berani mengetuk lebih dulu. Namun, yang datang besar bisa hilang besar karena kamu jarang menyimpannya cukup lama untuk merasa aman. Kunci dan eksekusi tuntas satu peluang di tangan sebelum mengejar yang baru, karena peluang yang setengah jalan hanya membuang energi. Di Pilar Diri, terdapat Fondasi Pasangan yang menjadi tempat membaca dinamika hubungan paling dekat. Isinya menunjukkan tekstur relasi yang terasa wajar bagimu, meskipun orang lain bisa menganggapnya berat.

### Tanda Kekosongan

Di Pilar Akar yang mencakup asal-usul dan latar belakangmu, terdapat Tanda Kekosongan (Void). Orang lain melihat kamu berhasil di bidang ini, tetapi kamu sendiri sering merasa belum pantas menyandangnya. Hasilnya tidak pernah kurang, namun rasa memilikinya yang tidak pernah ikut hadir. Kamu tidak pernah bersandar pada keberuntungan di sini, sehingga apa pun yang kamu capai, kamu bangun murni dengan kerja keras. Pengakuan orang lain tidak pernah menempel di dalam dirimu, sehingga kamu terus menunggu bukti berikutnya. Sebut hasil kerjamu dengan lantang, meskipun rasanya canggung.

### Kemandirian dan Pengelolaan

Kamu memiliki Aspek Pendamping (Friend) yang tersebar di Pilar Akar, Pilar Kerja, dan Pilar Diri. Kamu terbiasa menyelesaikan semuanya sendiri dan meminta tolong terasa lebih berat daripada mengerjakan sesuatu dua kali lipat. Kamu tidak runtuh saat tidak ada yang menopang, namun bantuan sering datang terlambat karena orang mengira kamu tidak membutuhkannya. Mintalah bantuan lebih awal sebelum situasinya makin mendesak. Selain itu, Aspek Pengelola (Direct Wealth) di Pilar Akar dan Pilar Arah membuatmu dipercaya memegang hal penting dan merawatnya dengan rapi. Orang merasa tenang saat kamu yang memegang kendali. Apa yang kamu urus jarang berantakan, namun semakin banyak yang kamu pegang, semakin sedikit energi yang tersisa untuk dirimu sendiri. Pilih satu tugas untuk diserahkan ke orang lain bulan ini dan biarkan hasilnya berjalan meskipun tidak serapi caramu.

### Jalan Intuitif

Aspek Pemikir (Indirect Resource) di Pilar Akar dan Pilar Kerja membuatmu memahami sesuatu lewat jalan intuitif yang sulit dijelaskan. Kesimpulanmu sering benar sebelum kamu sempat membuktikannya. Kamu melihat pola yang luput dari pandangan orang lain, namun kamu sering merasa berjarak dari lingkungan sekitar karena menjelaskan isi kepalamu terasa melelahkan. Kamu tidak perlu menjelaskan semua alur pikiranmu. Cukup sampaikan kesimpulannya dan satu alasan paling kuat.

### Penutup

Kamu adalah sosok yang tangguh dalam mengelola peluang dan mampu berdiri di atas kaki sendiri. Dengan mengenali kapan harus meminta bantuan dan kapan harus melepaskan beban, kamu akan menemukan ritme yang lebih stabil. Teruslah melangkah dengan keyakinan pada kemampuanmu sendiri.

---

## chart 1 — 1989-09-13 09:00

> the reference chart for every card and contrast measurement

### Real render

| | |
|---|---|
| `source` | **gemini** |
| `model` | gemini-3.1-flash-lite |
| `prompt_version` | 2f5a5b0ce833f649 |
| loaded prompt | 2f5a5b0ce833f649 |
| `stage6_version` | 1.14.0 |
| `qa_flag` | — |
| `cached` | false |
| pillars | 己巳 癸酉 丙子 癸巳 |
| facts / required | 14 / 9 |

Attempts, in order:

1. `gemini` rejected — opening.archetype_missing
2. `gemini` passed Stage 6

---

### Matahari yang Butuh Bahan Bakar

Kamu adalah Matahari (The Sun), sosok dengan kehadiran yang langsung terasa bahkan sebelum kamu bicara. Kamu menerangi sekitarmu lebih dulu sebelum menghangatkan dirimu sendiri, dan nyala itu memakai tenaga yang tidak mengisi dirinya sendiri. Orang-orang berkumpul di sekitarmu tanpa perlu kamu undang, namun mereka sering mengira energimu tidak pernah habis. Mereka tidak melihat seberapa cepat kamu merasa kosong begitu ruangan sepi.

Kamu adalah Api yang lemah. Lemah di sini bukan berarti tidak mampu, melainkan sumber tenagamu ada di luar dirimu. Saat berada di lingkungan yang pas, pertumbuhanmu bisa jauh melampaui orang lain, tetapi kamu kehabisan energi lebih cepat saat salah menempatkan diri. Atur jadwal untuk mengisi energimu seserius kamu mengatur jadwal kerja. Sebelum mengambil peran baru, tanya ke diri sendiri siapa atau apa yang akan mengisi ulang energimu di sana.

### Pencapaian di Pilar Kerja

Di Pilar Kerja yang mencakup pekerjaan dan kariermu, kamu memiliki Tanda Kekosongan (Void). Orang lain melihat kamu berhasil di bidang ini, tetapi kamu sendiri sering merasa belum pantas menyandangnya. Hasilnya tidak pernah kurang, namun rasa memilikinya yang tidak pernah ikut hadir. Kamu tidak pernah bersandar pada keberuntungan di sini, sehingga apa pun yang kamu capai, kamu bangun murni dengan kerja keras. Pengakuan orang lain tidak pernah menempel di dalam dirimu, maka sebut hasil kerjamu dengan lantang meskipun rasanya canggung. Di pilar yang sama, kamu juga memegang Aspek Pengelola (Direct Wealth). Kamu dipercaya memegang hal penting dan merawatnya dengan rapi, sehingga orang merasa tenang saat kamu yang memegang kendali. Apa yang kamu urus jarang berantakan dan kepercayaan datang sendiri, namun semakin banyak yang kamu pegang, semakin sedikit energi yang tersisa untuk dirimu sendiri. Pilih satu tugas untuk diserahkan ke orang lain bulan ini dan biarkan hasilnya berjalan meskipun tidak serapi caramu.

Masih di Pilar Kerja, kamu memiliki Bunga Persik (Peach Blossom). Orang mengingatmu setelah satu pertemuan tanpa kamu perlu berusaha keras, dan perhatian datang tanpa harus kamu kejar. Kesan pertamamu bekerja sebelum kamu mulai bicara, namun ingat bahwa perhatian datang lebih cepat daripada kedekatan. Pilih beberapa orang, lalu bagikan cerita yang jujur dan luangkan waktu bersama mereka. Selain itu, kamu memiliki Bintang Penolong (Nobleman). Saat kamu benar-benar jalan buntu, selalu ada orang yang muncul membantu. Bantuan itu perlu kamu jemput, jadi mintalah bantuan lebih awal dari yang terasa nyaman.

### Arah yang Hampir Sempurna

Pilar Akar, Pilar Kerja, dan Pilar Arah ditempati oleh Setengah Gabungan (Half Combination). Tarikan energi ini sudah bekerja untukmu dan memberi arah yang jelas, namun karena hanya dua dari tiga bagian yang terhubung, ini terasa seperti rasa hampir pas. Semuanya sudah jalan dan arahnya jelas, tapi kamu selalu merasa harus menambah satu hal lagi sebelum berani menyebutnya selesai. Rasa belum lengkap itu hanya bagian dari polamu. Saat muncul keinginan untuk menambah satu hal lagi, berhenti sejenak dan tanya apakah yang ada sekarang sudah cukup untuk melangkah.

### Disiplin dan Batasan Diri

Kamu tidak memiliki unsur Kayu. Kamu jarang menunggu inspirasi dan tidak pernah gelisah tanpa alasan, sehingga kamu mudah menyelesaikan apa yang ada di depan mata, tapi susah untuk putar arah. Jangan menunggu merasa siap untuk pindah, karena rasa itu tidak akan datang. Buat pemicu dari luar seperti tanggal keputusan di kalender. Di sisi lain, kamu memiliki Aspek Pengatur (Direct Officer) yang tersebar di Pilar Kerja, Pilar Diri, dan Pilar Arah.

Kamu tahu apa yang seharusnya dilakukan dan tetap menjalankannya meski tidak ada yang melihat. Melanggar aturan terasa lebih melelahkan daripada mematuhinya, sehingga orang menaruh tanggung jawab padamu sejak muda. Buat jadwal sendiri untuk santai tanpa tuntutan harus selalu benar. Dinamika ini juga tercermin di Fondasi Pasangan yang berada di Pilar Diri, tempat membaca kehidupan pribadi dan hubungan terdekatmu. Isinya menunjukkan tekstur relasi yang terasa wajar bagimu, meskipun orang lain bisa menganggapnya berat.

### Penutup

Kamu adalah sosok yang tangguh di bawah tekanan dan mampu memegang kendali dengan disiplin tinggi. Keberhasilanmu adalah hasil kerja keras yang nyata, meski kamu sering merasa belum cukup. Mulailah untuk lebih percaya pada apa yang sudah kamu bangun dan berikan ruang bagi dirimu sendiri untuk beristirahat.

---

## fresh-1996 — 1996-10-02 19:20

> the Samudra opening that ranked 9th of 14 before Prompt K

### ⚠ THIS IS THE FLOOR. It is not the renderer's output and must not be read as one.

| | |
|---|---|
| `source` | **module_assembly** |
| `model` | — (no model output was served) |
| `prompt_version` | — (floor renders no prompt) |
| loaded prompt | 2f5a5b0ce833f649 |
| `stage6_version` | 1.14.0-floor |
| `qa_flag` | stage6_budget_spent |
| `cached` | false |
| pillars | 丙子 丁酉 壬申 庚戌 |
| facts / required | 14 / 9 |

Attempts, in order:

1. `gemini` rejected — opening.archetype_missing
2. `gemini` rejected — style.unsanctioned_bracket
3. `gemini` rejected — fact.condition_named, coverage.cost_dropped, coverage.cost_dropped, opening.archetype_missing **(HARD)**

Findings recorded on the served result:

- `fact.condition_named` (hard) — "Missing Wood" is a condition, not a badge, and must not be named
- `coverage.cost_dropped` (soft) — day_master_Water: "cost" did not survive into the prose (1/11 stems)
- `coverage.cost_dropped` (soft) — badge_桃花: "cost" did not survive into the prose (1/13 stems)
- `opening.archetype_missing` (soft) — the reading's first sentence does not name the archetype "Samudra" (day_master_Water); it opens: "Kamu memiliki Aspek Pelindung (Direct Resource) yang dominan di Pilar Kerja dan Pilar Arah."
- `brackets.inserted` (flag) — rule 23 inserted "(The Ocean)" after arketipe "Samudra" -- READ THIS: ...kamu mulai melangkah.

Sebagai seorang Samudra (The Ocean), kamu adalah Air yang menyesuaikan diri...

---

### Air

Kamu adalah Samudra (The Ocean) dengan unsur Air. Kamu menyesuaikan diri dengan keadaan tanpa pernah kehilangan arah tujuan. Orang lain sering kesulitan menebak langkahmu berikutnya.

Kamu mampu menembus situasi yang buntu bagi orang lain. Jalan selalu ada karena kamu tidak kaku pada satu cara. Sesuatu yang mengalir terus sulit untuk diikat. Komitmen jangka panjang pada satu bentuk kaku terasa amat berat bagimu. Jangan paksa dirimu masuk ke aturan yang terlalu kaku, karena aturan seperti itu sulit kamu pertahankan. Pegang teguh tujuan utamamu, tapi bebaskan cara mencapainya. Komitmenmu bisa bertahan lama selama kamu punya ruang untuk mengubah rute.

### Kuat

Kuat (Strong). Sumber tenagamu lahir langsung dari dalam dirimu sendiri. Kamu sanggup berjalan mandiri lebih jauh dari kebanyakan orang. Daya tahanmu nyata dan solid. Tekanan keras yang membuat orang lain menyerah justru bisa kamu balikkan menjadi bahan bakar untuk maju. Energi sebesar ini membutuhkan saluran yang jelas. Tanpa arah dan kesibukan yang tepat, tenaga berlebih itu berbalik menjadi gesekan konstan dengan orang-orang terdekatmu. Alirkan energi lebihmu ke satu kegiatan fisik atau proyek intensif setiap minggu, agar tak tumpah menjadi konflik dengan orang terdekat.

### Aspek Pelindung

Pilar Kerja. Aspek Pelindung (Direct Resource). Kamu cepat menyerap ilmu dan orang lain senang membimbingmu. Selalu ada bantuan yang muncul tepat pada waktunya.

Kamu jarang benar-benar sendirian. Bantuan datang dari tempat yang tidak kamu duga. Kenyamanan itu bisa memperlambat langkahmu. Kamu sering terlalu lama bersiap sebelum benar-benar mulai melangkah. Batasi masa persiapanmu dengan tanggal, bukan dengan menunggu rasa siap. Mulai saja dulu meski rasanya belum sepenuhnya siap; petunjuk atau bantuan berikutnya biasanya baru terlihat setelah kamu mulai melangkah.

### Setengah Gabungan

Pilar Akar dan Pilar Diri. Setengah Gabungan (Half Combination). Dua dari tiga bagian sudah saling tarik. Arah geraknya sudah jelas, meski kekuatannya belum sepenuhnya padu.

Tarikan energi ini sudah bekerja untukmu dan memberi arah yang jelas. Dua dari tiga bagian sudah terhubung, jadi tinggal satu lagi yang kurang. Dalam kehidupan sehari-hari, ini terasa seperti rasa 'hampir pas': semuanya sudah jalan dan arahnya jelas, tapi kamu selalu merasa harus menambah satu hal lagi sebelum berani menyebutnya selesai. Rasa 'belum lengkap' itu hanya bagian dari polamu, bukan tanda ada yang salah. Saat muncul keinginan untuk menambah satu hal lagi, berhenti sejenak dan tanya: apakah yang ada sekarang sudah cukup untuk melangkah? Sering kali, jawabannya sudah lebih dari cukup.

### Gesekan

Pilar Kerja dan Pilar Arah. Gesekan (Harm). Gesekan kecil yang terjadi terus-menerus, bukan benturan besar. Masalah-masalah sepele yang menumpuk perlahan hingga terasa memberatkan.

Kamu sangat peka pada detail kecil yang diabaikan orang lain. Masalah jarang membesar tanpa terdeteksi olehmu lebih dulu. Gesekan kecil ini jarang selesai total dalam sekali tindakan. Ia sering muncul kembali dalam bentuk lain yang sedikit berbeda. Bereskan kejanggalan atau masalah kecil begitu terlihat. Membiarkan gesekan kecil menumpuk hanya akan memicu ledakan yang tak perlu di kemudian hari.

<!-- no heading: a null-label condition, described not named -->

Kamu jarang menunggu inspirasi dan tidak pernah gelisah tanpa alasan. Dorongan untuk berpindah arah tidak pernah muncul otomatis dari dalam diri.

Kamu tidak butuh alasan besar untuk mulai bergerak. Kamu fokus bekerja dari apa yang ada di depan mata. Kamu mudah menyelesaikan apa yang ada di depan mata, tapi susah untuk putar arah. Dorongan untuk berubah tidak pernah muncul dari dalam diri. Karena itu, kamu bisa bertahan bertahun-tahun di situasi yang sudah tidak cocok dan menganggapnya biasa saja. Jangan menunggu merasa siap untuk pindah, karena rasa itu tidak akan datang. Buat pemicu dari luar: pasang tanggal keputusan di kalender atau buat janji ke orang lain. Begitu tanggalnya tiba dan belum ada perubahan, langsung melangkah.

### Fondasi Pasangan

Pilar Diri. Fondasi Pasangan (Spouse Palace). Tempat membaca dinamika hubungan paling dekat. Isinya menunjukkan tekstur relasi yang terasa wajar bagimu, meskipun orang lain bisa menganggapnya berat.

### Bunga Persik

Pilar Kerja. Bunga Persik (Peach Blossom). Orang mengingatmu setelah satu pertemuan tanpa kamu perlu berusaha keras. Perhatian datang tanpa harus kamu kejar.

Pintu terbuka lebih cepat untukmu karena orang penasaran ingin mengenalmu lebih jauh. Kesan pertamamu bekerja sebelum kamu mulai bicara. Pakai kesan itu di awal, jangan disimpan sampai orang sudah membentuk pendapat sendiri. Perhatian datang lebih cepat daripada kedekatan. Orang tertarik dulu pada penampilan atau kebiasaanmu, dan jarak menuju kedekatan sungguhan kadang tidak pernah tertutup. Daya tarik memang membuat orang memperhatikanmu, tapi hubungan yang dekat harus dibangun pelan-pelan. Pilih beberapa orang, lalu bagikan cerita yang jujur dan luangkan waktu bersama mereka. Kesan pertama hanya membuka pintu; kehadiran yang konsisten yang membuat orang bertahan.

### Mata Pisau

Pilar Akar. Mata Pisau (Yang Blade). Ada titik di mana kamu berhenti menimbang dan langsung mengambil keputusan tegas. Orang di sekitarmu sering kaget dengan seberapa cepat perubahan itu terjadi.

Kamu sanggup mengambil keputusan sulit yang ditunda orang lain. Ketegasan itu sering menyelamatkan situasi kritis. Ketajaman yang sama bisa melukai hubungan atau situasi yang tidak perlu dirusak. Apa yang terputus di titik ini sulit untuk disambung kembali. Endapkan keputusan memutus hubungan atau komitmen selama semalam sebelum mengeksekusinya. Ketegasan tidak akan luntur hanya karena kamu menundanya sehari.

### Penutup

*(empty — `notes.penutup_unavailable` is true)*

---

