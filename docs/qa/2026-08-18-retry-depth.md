<!--
STATUS: RAW EVIDENCE. npm run probe:retry-depth. Prose is verbatim; do not edit it.
Nobody has judged the prose. Whether a deep retry reads FLAT is a register call, Reyner rules it.
-->

# Retry depth — 2026-08-18

Prompt `2ff1a546fb7e6e53`, gate `1.9.0`, 4 charts x 10 runs,
ONE chain per run to a maximum of 7 attempts (depth 6).
Total attempts spent: **78**.

Every depth below is read off this one trace by truncation, so no depth cost an extra render.

## 1. Floor rate by truncation depth

| depth | attempts allowed | floored | floor rate |
|---|---|---|---|
| 1 | 2 | 8/40 | **20%** |
| 2 | 3 | 2/40 | **5%** |
| 3 | 4 | 2/40 | **5%** |
| 4 | 5 | 2/40 | **5%** |
| 5 | 6 | 1/40 | **3%** |
| 6 | 7 | 1/40 | **3%** |

## 2. Pass rate BY ATTEMPT NUMBER

**Read this with the denominators.** Attempt 5 is only reached by runs that failed four times,
so a falling rate can be selection rather than the directive hurting.

| attempt | runs that reached it | passed | rate |
|---|---|---|---|
| 1 | 40 | 12 | **30%** |
| 2 | 28 | 20 | **71%** |
| 3 | 7 | 6 | **86%** |
| 4 | 1 | 0 | **0%** |
| 5 | 1 | 0 | **0%** |
| 6 | 1 | 1 | **100%** |

## 3. Cumulative wall clock the READER waits

The funnel's anticipation beat is 2.5s. These are milliseconds of provider time only.

| depth | p50 | p90 |
|---|---|---|
| 1 | 13.6s | 26.4s |
| 2 | 15.0s | 30.3s |
| 3 | 15.0s | 30.3s |
| 4 | 15.0s | 30.3s |
| 5 | 15.0s | 30.3s |
| 6 | 15.0s | 30.3s |

## Rejections by check, all attempts

- `style.hedging` — 12
- `coverage.field_dropped` — 12
- `coverage.cost_dropped` — 10
- `fact.hour_known_contradiction` — 7
- `style.essay_connectives` — 6
- `style.raw_pillar` — 6
- `fact.condition_named` — 1
- `fact.strength_same_breath` — 1

---

## 4. Attempt 1 vs the deepest attempt that passed

**chart 5, run 10** — attempt 1 rejected for
`style.hedging`; attempt 6 passed.

Nothing below is edited. Read them as a reader, not as a checker.

### ATTEMPT 1 — REJECTED (15458ms)

### Diri dan Keseimbangan

Kamu adalah Api yang lahir sebagai Matahari. Kehadiranmu langsung terasa sebelum kamu bicara, menerangi sekitarmu lebih dulu sebelum menghangatkan dirimu sendiri. Orang-orang berkumpul di sekitarmu tanpa perlu diundang, namun nyala ini memakai tenaga yang tidak mengisi dirinya sendiri. Api selalu membutuhkan bahan bakar dari luar, jadi atur jadwal untuk mengisi energimu seserius kamu mengatur jadwal kerja. Jangan tunggu sampai bateraimu benar-benar habis baru mencari cara untuk pulih.

Baganmu berdiri di titik tengah yang Seimbang. Kamu sanggup menopang dirimu sendiri sekaligus tetap terbuka menerima dari luar, sehingga situasi yang berubah jarang membuatmu goyah. Kamu memiliki kelenturan tinggi saat orang lain kehilangan arah. Karena baganmu tidak memaksamu ke satu sudut, tentukan satu komitmen untuk enam bulan ke depan dan tuliskan alasannya agar kamu tetap punya arah yang jelas.

### Ikatan Pilar Kehidupan

Di Pilar Diri dan Pilar Arah, terdapat Ikatan (Combination) yang mengunci kehidupan pribadi dan hubungan terdekatmu dengan tujuan serta arah masa depanmu. Saat satu bergerak, yang lain otomatis ikut terpengaruh. Ini adalah dua bidang hidup yang saling menguatkan dengan sendirinya tanpa perlu kamu atur. Namun, saat ada masalah, keduanya ikut terdampak bersamaan. Saat satu pilar terguncang, jaga pilar pasangannya tetap berjalan rutin untuk mencegah efek domino ke area lainnya.

### Arus Karya dan Batas

Baganmu didominasi oleh Tanah, yang berarti energi mengucur habis lewat ide, kreasi, dan kejelian melihat ruang perbaikan. Ide dan karya mengalir tanpa henti, namun kamu terus memberi sampai lupa mengisi ulang daya diri sendiri. Selesaikan satu tugas sepenuhnya sebelum menyentuh yang baru, dan sisihkan satu hari seminggu bebas dari target output apa pun.

Di sisi lain, kamu mengalami kondisi Logam yang hilang. Memutuskan untuk berhenti atau mengakhiri sesuatu terasa jauh lebih sulit bagimu daripada memulainya. Kamu cenderung bertahan di situasi yang sudah jelas selesai. Meski ini memberimu kelebihan dalam memberi kesempatan lebih banyak kepada orang lain, hal yang sudah selesai akan terus menguras energimu jika tidak diakhiri. Beranikan diri mengakhiri urusan yang menggantung lewat satu percakapan tegas.

### Aspek Pemijar

Di Pilar Kerja yang mencakup karier dan lingkungan pekerjaanmu, kamu membawa Aspek Pemijar (Hurting Officer). Kamu cepat melihat cara yang lebih baik dan sulit diam saat melihat hal yang tidak efisien, sehingga mengikuti aturan yang tidak masuk akal terasa menyiksa. Kamu paling cepat menemukan celah dan berani menyuarakan kebenaran. Kejujuranmu mahal harganya, karena orang yang kamu koreksi sering mengingat rasa sakitnya, bukan kebenarannya. Tunda penyampaian kritik saat kamu emosi, lalu sampaikan hanya satu poin perbaikan beserta dampaknya dengan jernih di hari berikutnya.

### Fondasi Pasangan

Fondasi Pasanganmu di Pilar Diri, yang mengatur kehidupan pribadi dan hubungan terdekatmu, ditempati oleh Aspek Pemikir (Indirect Resource). Kamu memahami sesuatu lewat jalan intuitif yang sulit dijelaskan, di mana kesimpulanmu sering benar sebelum kamu sempat membuktikannya. Kamu melihat pola yang luput dari pandangan orang lain, namun sering merasa berjarak dari lingkungan sekitar karena menjelaskan isi kepala terasa melelahkan. Kamu tidak perlu menjelaskan semua alur pikiranmu; cukup sampaikan kesimpulannya dan satu alasan paling kuat.

### Tanda dan Bantuan

Di Pilar Arah yang mencakup tujuan masa depanmu, terdapat Tanda Kekosongan (Void). Orang lain melihat kamu berhasil di bidang ini, tetapi kamu sendiri sering merasa belum pantas menyandangnya. Pengakuan orang lain tidak pernah menempel di dalam dirimu, sehingga kamu terus menunggu bukti berikutnya. Sebut hasil kerjamu dengan lantang meskipun rasanya canggung.

Di pilar yang sama, kamu juga memiliki Bintang Penolong (Nobleman). Saat kamu benar-benar jalan buntu, selalu ada orang yang muncul membantu. Kamu jarang benar-benar sendirian di titik tersempit, namun bantuan itu perlu kamu jemput. Minta bantuan lebih awal dari yang terasa nyaman karena pertolongan di baganmu ada dan bentuknya menunggu diminta.

### Penutup

Kamu adalah individu yang membawa cahaya dan ide tajam ke mana pun kamu melangkah. Dengan keseimbangan yang kamu miliki, kamu mampu menavigasi perubahan dengan tenang selama kamu berani menetapkan batas tegas bagi dirimu sendiri. Teruslah melangkah, karena bantuan akan selalu hadir saat kamu berani memintanya.

---

### ATTEMPT 6 — PASSED (7625ms)

### Dirimu dan Keseimbangan

Kamu lahir dengan batang hari Api. Kehadiranmu langsung terasa sebelum kamu bicara, menerangi sekitarmu lebih dulu sebelum menghangatkan dirimu sendiri. Orang-orang berkumpul di sekitarmu tanpa perlu diundang, namun nyala ini memakai tenaga yang tidak mengisi dirinya sendiri. Kamu perlu mengatur jadwal untuk mengisi energi seserius kamu mengatur jadwal kerja, karena orang sering mengira energimu tidak pernah habis. Baganmu berdiri di titik tengah yang stabil, yang disebut Seimbang. Kamu sanggup menopang dirimu sendiri sekaligus tetap terbuka menerima dari luar. Perubahan mendadak yang membuat orang lain kehilangan arah biasanya hanya menggeser langkahmu sedikit saja. Karena baganmu tidak memaksamu ke satu sudut, tentukan satu komitmen untuk enam bulan ke depan dan tuliskan alasannya agar kamu tidak menunggu dorongan luar saat ragu menghampiri.

### Ikatan Pilar Kehidupan

Di Pilar Diri dan Pilar Arah, terdapat Ikatan (Combination). Kehidupan pribadi dan hubungan terdekatmu di Pilar Diri berjalan berdampingan dengan tujuan serta arah masa depanmu di Pilar Arah. Saat satu bergerak, yang lain otomatis ikut terpengaruh. Ini memberi keuntungan berupa dua bidang hidup yang saling menguatkan tanpa perlu kamu atur. Namun, saat ada masalah, keduanya ikut terdampak bersamaan. Saat satu pilar terguncang, jaga pilar pasangannya tetap berjalan rutin untuk mencegah efek domino ke area lainnya.

### Aliran Energi dan Batas

Baganmu terisi oleh karya dan output yang dominan, di mana energi mengucur lewat ide, kreasi, dan kejelian melihat ruang perbaikan. Ide dan karya mengalir tanpa henti, namun output ini menguras habis input-mu sampai kamu lupa mengisi ulang daya diri sendiri. Selesaikan satu tugas sepenuhnya sebelum menyentuh yang baru dan sisihkan satu hari seminggu bebas dari target output apa pun. Ketiadaan Logam membuatmu merasa bahwa memutuskan untuk berhenti atau mengakhiri sesuatu terasa jauh lebih sulit daripada memulainya. Kamu memberi kesempatan lebih banyak kepada orang lain, namun hal yang seharusnya sudah selesai terus menempel dan menguras energi. Beranikan diri mengakhiri urusan yang menggantung lewat satu percakapan tegas karena batas harus kamu buat dengan sengaja.

### Aspek Pemijar

Di Pilar Kerja yang mencakup pekerjaan dan kariermu, kamu memiliki Aspek Pemijar (Hurting Officer). Kamu cepat melihat cara yang lebih baik dan sulit diam saat melihat hal yang tidak efisien, karena mengikuti aturan yang tidak masuk akal terasa menyiksa. Kamu paling cepat menemukan celah dan paling berani menyuarakan kebenaran. Kejujuranmu mahal harganya, sebab orang yang kamu koreksi sering mengingat rasa sakitnya, bukan kebenarannya. Tunda penyampaian kritik saat kamu emosi dan sampaikan hanya satu poin perbaikan beserta dampaknya dengan jernih di hari berikutnya.

### Fondasi Pasangan

Fondasi Pasanganmu di Pilar Diri menjadi tempat membaca dinamika hubungan paling dekat. Di sini terdapat Aspek Pemikir yang membuatmu memahami sesuatu lewat jalan intuitif yang sulit dijelaskan. Kamu melihat pola yang luput dari pandangan orang lain, meski sering merasa berjarak dari lingkungan sekitar karena menjelaskan isi kepalamu terasa melelahkan. Kamu tidak perlu menjelaskan semua alur pikiranmu; cukup sampaikan kesimpulannya dan satu alasan paling kuat agar orang lain mengerti.

### Tanda dan Bantuan

Di Pilar Arah, kamu memiliki Tanda Kekosongan (Void). Orang lain melihat kamu berhasil di bidang ini, tetapi kamu sendiri sering merasa belum pantas menyandangnya. Kamu tidak pernah bersandar pada keberuntungan di sana, namun pengakuan orang lain tidak pernah menempel di dalam dirimu. Sebut hasil kerjamu dengan lantang meskipun rasanya canggung. Di pilar yang sama, terdapat juga Bintang Penolong (Nobleman). Saat kamu benar-benar jalan buntu, selalu ada orang yang muncul membantu. Minta bantuan lebih awal dari yang terasa nyaman karena pertolongan di baganmu ada dan menunggu diminta.

### Penutup

Kamu adalah individu yang mampu menyeimbangkan diri di tengah arus ide yang tidak pernah berhenti. Dengan ketajaman yang kamu miliki, langkah berikutnya adalah belajar kapan harus melepaskan apa yang sudah selesai. Masa depanmu terbuka lebar selama kamu berani menetapkan batas bagi dirimu sendiri.

