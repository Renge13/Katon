<!--
STATUS: RAW EVIDENCE, DERIVED. npm run probe:retry-erosion. ZERO provider calls -
every number is computed from the stored prose in docs/qa/2026-08-18-retry-depth.json.
Nothing here is a judgement. Whether an erosion matters is a REGISTER call, Reyner rules it.
-->

# What a retry costs the prose — 2026-08-19

Trace `docs/qa/2026-08-18-retry-depth.json`, prompt `2ff1a546fb7e6e53`, gate `1.9.0` **as that run self-reported it**
(see the PROGRESS row on the 1.9.0 ambiguity - the label does not identify the gate).

**20 runs passed at attempt 2** and stored prose for both attempts. That is the
shippable depth, and it is the comparison the attempt-1-vs-attempt-6 side-by-side could not make.

## 1. Attempt 1 -> attempt 2, over the runs that passed at 2

| erosion | lost | gained | rate over n=20 |
|---|---|---|---|
| archetype name absent from the opening paragraph | 2 | 1 | **10%** |
| dominance claim stops naming an element | 2 | 0 | **18%** of 11 pairs with a claim in both |
| no dominance claim in either attempt (NOT erosion - see below) | 9 | - | of 20 |
| EN bracket coverage falls (`aspek`) | 4 | 2 | **20%** of 20 comparable |
| EN bracket coverage falls (`bintang`) | 2 | 3 | **13%** of 16 comparable |
| EN bracket coverage falls (`relasi_cabang`) | 2 | 3 | **10%** of 20 comparable |
| EN bracket coverage falls (`pilar`) | 0 | 0 | **0%** of 20 comparable |
| EN bracket coverage falls (`elemen`) | 4 | 0 | **20%** of 20 comparable |
| paragraph count falls | 12 | 4 | **60%** |

Paragraphs mean **8.3 -> 7.1**, characters mean **4623 -> 4636**.

**THE 9 PAIRS WITH NO DOMINANCE CLAIM ARE THE ENGINE BEING RIGHT, and they cluster
perfectly by chart** (chart 1, fresh-1996), which is what rules out a detector fault.
Their charts have no dominant element to name: top element share is **chart 5 Earth 54%** and
**chart 13 Earth 49%**, both of which DO produce a claim, against **chart 1 Water 38%** and
**fresh-1996 Metal 36%**, neither of which does. The model states dominance only where the
chart supports it, so this row is evidence FOR the pipeline rather than a gap in it.

### Per run, so a rate is never read without its rows

| chart | run | stem | attempt 1 rejected for | archetype | element | paragraphs |
|---|---|---|---|---|---|---|
| chart 5 | 2 | 丙 | `style.hedging` | kept | kept | 8 -> 9 |
| chart 5 | 3 | 丙 | `coverage.field_dropped` | kept | **LOST** | 10 -> 6 |
| chart 5 | 6 | 丙 | `style.hedging` | kept | kept | 10 -> 7 |
| chart 5 | 7 | 丙 | `style.hedging` | kept | kept | 8 -> 6 |
| chart 5 | 9 | 丙 | `coverage.field_dropped`, `style.hedging` | kept | **LOST** | 7 -> 6 |
| chart 13 | 2 | 乙 | `fact.hour_known_contradiction`, `style.raw_pillar` | absent both | kept | 8 -> 8 |
| chart 13 | 4 | 乙 | `fact.hour_known_contradiction`, `coverage.cost_dropped`, `style.raw_pillar` | absent both | kept | 8 -> 8 |
| chart 13 | 5 | 乙 | `style.essay_connectives` | absent both | kept | 8 -> 6 |
| chart 13 | 6 | 乙 | `fact.hour_known_contradiction`, `style.raw_pillar` | absent both | kept | 8 -> 8 |
| chart 13 | 9 | 乙 | `fact.hour_known_contradiction`, `style.raw_pillar` | absent both | kept | 8 -> 8 |
| chart 13 | 10 | 乙 | `fact.hour_known_contradiction`, `style.raw_pillar` | absent both | kept | 8 -> 6 |
| chart 1 | 1 | 丙 | `coverage.cost_dropped`, `coverage.field_dropped`, `coverage.cost_dropped` | **LOST** | no claim located | 7 -> 6 |
| chart 1 | 5 | 丙 | `style.hedging`, `style.essay_connectives` | kept | no claim located | 10 -> 8 |
| chart 1 | 6 | 丙 | `coverage.field_dropped`, `coverage.field_dropped`, `coverage.cost_dropped` | kept | no claim located | 10 -> 8 |
| chart 1 | 9 | 丙 | `style.essay_connectives` | kept | no claim located | 10 -> 5 |
| fresh-1996 | 2 | 壬 | `coverage.cost_dropped` | kept | no claim located | 7 -> 6 |
| fresh-1996 | 4 | 壬 | `coverage.field_dropped` | gained | no claim located | 9 -> 5 |
| fresh-1996 | 5 | 壬 | `fact.strength_same_breath`, `coverage.field_dropped` | **LOST** | no claim located | 7 -> 9 |
| fresh-1996 | 8 | 壬 | `coverage.field_dropped`, `coverage.cost_dropped` | absent both | no claim located | 7 -> 8 |
| fresh-1996 | 10 | 壬 | `coverage.cost_dropped` | absent both | no claim located | 7 -> 9 |

## 2. The EN bracket, across every stored attempt

Rule 23 asks for the English term in brackets ONCE per reading. **No Stage 6 check enforces
it**, which is why this is counted rather than assumed. Pooled over `aspek` + `bintang` +
`relasi_cabang`, the three categories the corpus demonstrably brackets.

Across **39 PASSING renders**: **174 of 205** terms carried their bracket (**85%**), and **13 of 39** passing renders (**33%**) shipped at least one term unbracketed.

| attempt | passing renders | terms present | bracketed | bracket rate | renders missing >=1 |
|---|---|---|---|---|---|
| 1 | 12 | 68 | 67 | **99%** | 1 |
| 2 | 20 | 103 | 84 | **82%** | 7 |
| 3 | 6 | 29 | 19 | **66%** | 4 |
| 6 | 1 | 5 | 4 | **80%** — ANECDOTE, n=1 | 1 |

### The two categories held out of the pool, and why the number matters

| category | terms present (all attempts) | bracketed | rate |
|---|---|---|---|
| `pilar` | 274 | 0 | **0%** |
| `elemen` | 170 | 13 | **8%** |

A near-zero rate here is EVIDENCE ABOUT SCOPE, not a violation count: it says the corpus
never brackets these, so rule 23 either does not bind them or has never been applied to them.
Pooling them would have manufactured a large fake violation. Which categories rule 23 binds is
Reyner's ruling, and this table is the input to it.

## 3. Two full examples

Verbatim, unedited. Chosen as the worst and the cleanest attempt-2 pass by erosion count,
so the pair brackets the range rather than flattering it.

### WORST — chart 5 run 3 (丙), 2 of 3 erosions

Attempt 1 rejected for `coverage.field_dropped`.

**ATTEMPT 1 — REJECTED** (10 paragraphs, 4159 chars)

### Diri dan Keseimbangan

Kamu adalah Api Matahari. Kehadiranmu langsung terasa bahkan sebelum kamu bicara, karena kamu menerangi sekitarmu lebih dulu sebelum menghangatkan dirimu sendiri. Orang-orang berkumpul di sekitarmu tanpa perlu diundang, namun nyala ini memakai tenaga yang tidak mengisi dirinya sendiri. Api selalu membutuhkan bahan bakar dari luar, jadi jangan tunggu sampai bateraimu benar-benar habis sebelum mencari cara untuk pulih. Atur jadwal untuk mengisi energimu seserius kamu mengatur jadwal kerja.

Baganmu berdiri di titik tengah yang Seimbang. Kamu sanggup menopang dirimu sendiri sekaligus tetap terbuka menerima dari luar. Situasi mungkin berubah, tetapi kamu jarang ikut goyah karena kamu memiliki kelenturan yang tinggi. Titik tengah ini tidak memberi dorongan ekstrem, sehingga arah hidupmu harus kamu tentukan sendiri. Tentukan satu komitmen untuk enam bulan ke depan dan tuliskan alasannya agar kamu tetap fokus saat keraguan menghampiri.

### Ikatan Pilar

Di Pilar Diri dan Pilar Arah, terdapat Ikatan (Combination). Kehidupan pribadi dan hubungan terdekatmu di Pilar Diri berjalan berdampingan dengan tujuan serta arah masa depanmu di Pilar Arah. Saat satu bergerak, yang lain otomatis ikut terpengaruh. Ini adalah dua bidang hidup yang saling menguatkan dengan sendirinya, namun masalah di satu area jarang berhenti di sana saja. Saat satu pilar terguncang, jaga pilar pasangannya tetap berjalan rutin untuk mencegah efek domino ke area lainnya.

### Aliran Energi

Baganmu didominasi oleh elemen Tanah yang mengalir lewat ide, kreasi, dan kejelian melihat ruang perbaikan. Ide dan karya mengalir tanpa henti, namun output ini menguras habis input-mu sampai kamu lupa mengisi ulang daya diri sendiri. Selesaikan satu tugas sepenuhnya sebelum menyentuh yang baru dan sisihkan satu hari seminggu bebas dari target apa pun.

Di sisi lain, kamu tidak memiliki elemen Logam. Memutuskan untuk berhenti atau mengakhiri sesuatu terasa jauh lebih sulit bagimu daripada memulainya, sehingga hal yang seharusnya sudah selesai terus menempel dan menguras energi. Beranikan diri mengakhiri urusan yang menggantung lewat satu percakapan tegas. Batas tegas harus kamu buat dengan sengaja karena tidak akan muncul sendiri.

### Aspek Pemijar

Di Pilar Kerja yang mencakup karier dan lingkungan pekerjaanmu, kamu membawa Aspek Pemijar (Hurting Officer). Kamu cepat melihat cara yang lebih baik dan sulit diam saat melihat hal yang tidak efisien. Mengikuti aturan yang tidak masuk akal terasa menyiksa, namun kejujuranmu mahal harganya karena orang yang kamu koreksi sering mengingat rasa sakitnya, bukan kebenarannya. Tunda penyampaian kritik saat kamu emosi dan sampaikan hanya satu poin perbaikan beserta dampaknya dengan jernih di hari berikutnya.

### Fondasi Pasangan

Fondasi Pasanganmu di Pilar Diri, yang mengatur kehidupan pribadi dan hubungan terdekat, ditempati oleh Aspek Pemikir (Indirect Resource). Kamu memahami sesuatu lewat jalan intuitif yang sulit dijelaskan dan sering melihat pola yang luput dari pandangan orang lain. Kamu tidak perlu menjelaskan semua alur pikiranmu; cukup sampaikan kesimpulannya dan satu alasan paling kuat agar orang lain mengerti tanpa membuat energimu terkuras.

### Tanda dan Bantuan

Di Pilar Arah yang menentukan tujuan masa depanmu, terdapat Tanda Kekosongan (Void). Orang lain melihat kamu berhasil, tetapi kamu sering merasa belum pantas menyandangnya. Kamu tidak pernah bersandar pada keberuntungan di bidang ini, sehingga apa pun yang kamu capai dibangun murni dengan kerja keras. Sebut hasil kerjamu dengan lantang meskipun rasanya canggung.

Di pilar yang sama, kamu juga memiliki Bintang Penolong (Nobleman). Saat kamu benar-benar jalan buntu, selalu ada orang yang muncul membantu. Bantuan ini perlu kamu jemput, jadi mintalah bantuan lebih awal dari yang terasa nyaman.

### Penutup

Kamu adalah individu yang mampu menyeimbangkan diri di tengah arus perubahan yang konstan. Dengan ketajaman ide dan kerja keras yang tulus, kamu memiliki kapasitas besar untuk membangun sesuatu yang berarti. Teruslah melangkah dengan berani dan jangan ragu untuk menetapkan batas yang kamu butuhkan.

---

**ATTEMPT 2 — PASSED** (6 paragraphs, 3908 chars)

### Diri dan Keseimbangan

Kamu adalah Api yang lahir sebagai Matahari. Kehadiranmu langsung terasa sebelum kamu bicara, menerangi sekitarmu lebih dulu sebelum menghangatkan dirimu sendiri. Nyala ini memakai tenaga yang tidak mengisi dirinya sendiri, sehingga orang sering mengira energimu tidak pernah habis padahal kamu cepat merasa kosong begitu ruangan sepi. Kamu perlu mengatur jadwal untuk mengisi energimu seserius kamu mengatur jadwal kerja. Jangan tunggu sampai bateraimu benar-benar habis baru mencari cara untuk pulih. Baganmu berdiri di titik tengah yang stabil, yang berarti kamu sanggup menopang dirimu sendiri sekaligus tetap terbuka menerima dari luar. Kamu memiliki kelenturan tinggi sehingga perubahan mendadak yang membuat orang lain kehilangan arah biasanya hanya menggeser langkahmu sedikit saja. Karena titik tengah tidak memberi dorongan ekstrem, kamu harus menentukan sendiri arah hidupmu. Tentukan satu komitmen untuk enam bulan ke depan dan tuliskan alasannya agar kamu tidak menunggu dorongan luar saat ragu menghampiri.

### Ikatan Pilar Kehidupan

Di Pilar Diri dan Pilar Arah, terdapat Ikatan (Combination) yang mengunci dua bagian baganmu. Kehidupan pribadi dan hubungan terdekatmu di Pilar Diri berjalan berdampingan dengan tujuan dan arah masa depanmu di Pilar Arah. Saat satu bergerak, yang lain otomatis ikut terpengaruh. Ini adalah dua bidang hidup yang saling menguatkan dengan sendirinya, namun saat ada masalah, keduanya ikut terdampak bersamaan. Saat satu pilar kehidupanmu terguncang, jaga pilar pasangannya tetap berjalan rutin untuk mencegah efek domino ke area lainnya.

### Karya dan Batasan

Baganmu terisi oleh karya dan output yang mengucur lewat ide, kreasi, dan kejelian melihat ruang perbaikan. Kamu tidak pernah kehabisan gagasan, namun output ini menguras habis input-mu sampai kamu lupa mengisi ulang daya diri sendiri. Selesaikan satu tugas sepenuhnya sebelum menyentuh yang baru dan sisihkan satu hari seminggu bebas dari target output apa pun. Di sisi lain, kamu tidak memiliki unsur Logam. Memutuskan untuk berhenti atau mengakhiri sesuatu terasa jauh lebih sulit bagimu daripada memulainya, sehingga kamu sering bertahan di situasi yang sudah jelas selesai. Meski ini membuatmu memberi kesempatan lebih banyak kepada orang lain, hal yang seharusnya selesai akan terus menempel dan menguras energimu. Beranikan diri mengakhiri urusan yang menggantung lewat satu percakapan tegas karena ketegangan singkat saat menyelesaikannya jauh lebih baik daripada membiarkannya terus menguras energimu.

### Aspek Pemijar

Di Pilar Kerja yang mencakup pekerjaan dan kariermu, kamu memiliki Aspek Pemijar (Hurting Officer). Kamu cepat melihat cara yang lebih baik dan sulit diam saat melihat hal yang tidak efisien, sehingga mengikuti aturan yang tidak masuk akal terasa menyiksa. Kamu paling cepat menemukan celah dan berani menyuarakan kebenaran, namun kejujuranmu mahal harganya karena orang yang kamu koreksi sering mengingat rasa sakitnya, bukan kebenarannya. Tunda penyampaian kritik saat kamu emosi dan sampaikan hanya satu poin perbaikan beserta dampaknya dengan jernih di hari berikutnya.

### Fondasi Pasangan

Fondasi Pasanganmu di Pilar Diri, yang mencakup kehidupan pribadi dan hubungan terdekatmu, ditempati oleh Aspek Pemikir (Indirect Resource). Kamu memahami sesuatu lewat jalan intuitif yang sulit dijelaskan dan sering melihat pola yang luput dari pandangan orang lain. Kamu tidak perlu menjelaskan semua alur pikiranmu kepada orang lain; cukup sampaikan kesimpulannya dan satu alasan paling kuat agar energimu tidak terkuras.

### Penutup

Kamu adalah individu yang mampu menyeimbangkan ide-ide tajam dengan ketahanan diri yang stabil. Dengan mengenali kapan harus berhenti dan kapan harus meminta bantuan, kamu akan mampu mengarahkan nyalamu dengan lebih efisien. Masa depanmu terbuka lebar untuk dibangun dengan kerja keras yang kamu miliki.

---

### CLEANEST — fresh-1996 run 10 (壬), 0 of 3 erosions

Attempt 1 rejected for `coverage.cost_dropped`.

**ATTEMPT 1 — REJECTED** (7 paragraphs, 4226 chars)

### Profil dan Kekuatan Diri

Kamu memiliki Aspek Pelindung (Direct Resource) yang menonjol di Pilar Kerja, yang mencakup pekerjaan dan kariermu. Kamu cepat menyerap ilmu dan orang lain senang membimbingmu, sehingga bantuan sering muncul tepat pada waktunya. Kenyamanan ini bisa memperlambat langkahmu karena kamu sering terlalu lama bersiap sebelum mulai melangkah. Batasi masa persiapanmu dengan tanggal, bukan dengan menunggu rasa siap. Mulai saja dulu meski rasanya belum sepenuhnya siap karena petunjuk berikutnya biasanya baru terlihat setelah kamu melangkah. Kamu adalah Air yang kuat. Sumber tenagamu lahir langsung dari dalam dirimu sendiri, membuatmu sanggup berjalan mandiri lebih jauh dari kebanyakan orang. Daya tahanmu solid dan tekanan keras yang membuat orang lain menyerah justru bisa kamu balikkan menjadi bahan bakar untuk maju. Energi sebesar ini membutuhkan saluran yang jelas agar tidak berbalik menjadi gesekan dengan orang terdekat. Alirkan energi lebihmu ke satu kegiatan fisik atau proyek intensif setiap minggu. Sebagai Air, kamu menyesuaikan diri dengan keadaan tanpa kehilangan arah tujuan. Kamu mampu menembus situasi yang buntu bagi orang lain karena tidak kaku pada satu cara. Komitmen jangka panjang pada satu bentuk kaku terasa berat bagimu, namun kamu bisa bertahan lama selama punya ruang untuk mengubah rute.

### Pola Setengah Gabungan

Di Pilar Akar dan Pilar Diri, yang masing-masing mencakup asal-usul dan kehidupan pribadimu, terdapat Setengah Gabungan (Half Combination). Tarikan energi ini sudah bekerja untukmu dan memberi arah yang jelas. Namun, karena baru dua dari tiga bagian yang terhubung, ini terasa seperti rasa hampir pas. Semuanya sudah jalan, tapi kamu selalu merasa harus menambah satu hal lagi sebelum berani menyebutnya selesai. Rasa belum lengkap itu hanya bagian dari polamu. Saat muncul keinginan untuk menambah satu hal lagi, berhenti sejenak dan tanya apakah yang ada sekarang sudah cukup untuk melangkah.

### Gesekan dalam Pekerjaan

Di Pilar Kerja dan Pilar Arah, yang mencakup karier serta tujuan masa depanmu, terdapat Gesekan (Harm). Ini adalah masalah sepele yang menumpuk perlahan hingga terasa memberatkan. Kamu sangat peka pada detail kecil yang diabaikan orang lain, sehingga masalah jarang membesar tanpa terdeteksi olehmu lebih dulu. Bereskan kejanggalan kecil begitu terlihat agar tidak memicu ledakan yang tak perlu di kemudian hari.

### Dorongan untuk Berubah

Kamu tidak memiliki unsur Kayu. Kamu jarang menunggu inspirasi dan tidak pernah gelisah tanpa alasan, sehingga kamu fokus bekerja dari apa yang ada di depan mata. Namun, kamu susah untuk putar arah karena dorongan untuk berubah tidak muncul otomatis dari dalam diri. Jangan menunggu merasa siap untuk pindah. Buat pemicu dari luar seperti memasang tanggal keputusan di kalender atau membuat janji ke orang lain.

### Fondasi Pasangan

Fondasi Pasanganmu berada di Pilar Diri yang mencakup kehidupan pribadi dan hubungan terdekatmu. Di sana terdapat Aspek Pemikir (Indirect Resource) yang membuatmu memahami sesuatu lewat jalan intuitif yang sulit dijelaskan. Kamu melihat pola yang luput dari pandangan orang lain dan firasatmu punya dasar kuat, meski kamu sering merasa berjarak dari lingkungan sekitar karena menjelaskan isi kepalamu terasa melelahkan.

### Bunga Persik dan Mata Pisau

Di Pilar Kerja, kamu memiliki Bunga Persik (Peach Blossom). Orang mengingatmu setelah satu pertemuan tanpa kamu perlu berusaha keras. Pintu terbuka lebih cepat untukmu, namun ingat bahwa kesan pertama hanya membuka pintu dan hubungan yang dekat harus dibangun dengan kehadiran yang konsisten. Di Pilar Akar, terdapat Mata Pisau (Yang Blade). Ada titik di mana kamu berhenti menimbang dan langsung mengambil keputusan tegas yang sering menyelamatkan situasi kritis. Ketajaman ini bisa melukai hubungan jika tidak dikelola, jadi endapkan keputusan memutus hubungan selama semalam sebelum mengeksekusinya.

### Penutup

Kamu adalah sosok yang mandiri dengan kemampuan intuitif yang tajam dalam membaca pola. Dengan ketegasan yang kamu miliki, kamu mampu menembus hambatan yang tidak bisa dilewati orang lain. Teruslah melangkah meski tanpa rasa siap yang sempurna, karena arah tujuanmu sudah jelas.

---

**ATTEMPT 2 — PASSED** (9 paragraphs, 5472 chars)

### Profil dan Kekuatan Diri

Kamu memiliki Aspek Pelindung (Direct Resource) yang dominan di Pilar Kerja, yang mencakup area pekerjaan dan kariermu. Ini berarti kamu cepat menyerap ilmu dan orang lain senang membimbingmu, sehingga selalu ada bantuan yang muncul tepat pada waktunya. Bantuan ini adalah anugerah, namun kenyamanan tersebut bisa memperlambat langkahmu karena kamu sering terlalu lama bersiap sebelum benar-benar mulai melangkah. Batasi masa persiapanmu dengan tanggal, bukan dengan menunggu rasa siap. Mulai saja dulu meski rasanya belum sepenuhnya siap, karena petunjuk atau bantuan berikutnya biasanya baru terlihat setelah kamu mulai melangkah.

Kamu adalah Air yang kuat. Sumber tenagamu lahir langsung dari dalam dirimu sendiri, membuatmu sanggup berjalan mandiri lebih jauh dari kebanyakan orang. Daya tahanmu solid, dan tekanan keras yang membuat orang lain menyerah justru bisa kamu balikkan menjadi bahan bakar untuk maju. Namun, energi sebesar ini membutuhkan saluran yang jelas. Tanpa arah dan kesibukan yang tepat, tenaga berlebih itu berbalik menjadi gesekan konstan dengan orang-orang terdekatmu. Alirkan energi lebihmu ke satu kegiatan fisik atau proyek intensif setiap minggu agar tidak tumpah menjadi konflik.

Sebagai seorang Samudra, kamu menyesuaikan diri dengan keadaan tanpa pernah kehilangan arah tujuan. Orang lain sering kesulitan menebak langkahmu berikutnya, padahal arah tujuanmu sebenarnya selalu sama, hanya jalurnya yang berganti-ganti. Kamu mampu menembus situasi yang buntu bagi orang lain karena kamu tidak kaku pada satu cara. Ingatlah bahwa komitmen jangka panjang pada satu bentuk kaku terasa amat berat bagimu. Jangan paksa dirimu masuk ke aturan yang terlalu kaku, karena aturan seperti itu sulit kamu pertahankan.

### Pola Hubungan dan Arah

Di Pilar Akar dan Pilar Diri, terdapat Setengah Gabungan (Half Combination). Pilar Akar mencakup asal-usul dan latar belakangmu, sementara Pilar Diri meliputi kehidupan pribadi dan hubungan terdekatmu. Tarikan energi ini sudah bekerja untukmu dan memberi arah yang jelas. Namun, karena baru dua dari tiga bagian yang terhubung, dalam kehidupan sehari-hari ini terasa seperti rasa hampir pas. Semuanya sudah jalan dan arahnya jelas, tapi kamu selalu merasa harus menambah satu hal lagi sebelum berani menyebutnya selesai. Rasa belum lengkap itu hanya bagian dari polamu, bukan tanda ada yang salah. Saat muncul keinginan untuk menambah satu hal lagi, berhenti sejenak dan tanya apakah yang ada sekarang sudah cukup untuk melangkah.

### Gesekan dalam Karier

Di Pilar Kerja dan Pilar Arah, terdapat Gesekan (Harm). Pilar Kerja meliputi pekerjaan dan kariermu, sedangkan Pilar Arah mencakup tujuan dan arah masa depanmu. Ini adalah gesekan kecil yang terjadi terus-menerus, bukan benturan besar, berupa masalah sepele yang menumpuk perlahan hingga terasa memberatkan. Sisi positifnya, kamu sangat peka pada detail kecil yang diabaikan orang lain sehingga masalah jarang membesar tanpa terdeteksi olehmu lebih dulu. Bereskan kejanggalan atau masalah kecil begitu terlihat, karena membiarkan gesekan kecil menumpuk hanya akan memicu ledakan yang tak perlu di kemudian hari.

### Dorongan untuk Berubah

Kamu tidak memiliki unsur Kayu. Kamu jarang menunggu inspirasi dan tidak pernah gelisah tanpa alasan, sehingga kamu fokus bekerja dari apa yang ada di depan mata. Kamu mudah menyelesaikan tugas yang ada, namun susah untuk putar arah karena dorongan untuk berubah tidak pernah muncul otomatis dari dalam diri. Kamu bisa bertahan bertahun-tahun di situasi yang sudah tidak cocok dan menganggapnya biasa saja. Jangan menunggu merasa siap untuk pindah, karena rasa itu tidak akan datang. Buat pemicu dari luar, seperti memasang tanggal keputusan di kalender atau membuat janji ke orang lain.

### Fondasi Pasangan

Fondasi Pasanganmu berada di Pilar Diri, yang mencakup kehidupan pribadi dan hubungan terdekatmu. Di sini terdapat Aspek Pemikir (Indirect Resource), yang berarti kamu memahami sesuatu lewat jalan intuitif yang sulit dijelaskan. Kamu melihat pola yang luput dari pandangan orang lain dan firasatmu punya dasar, meski sulit diutarakan dengan kata-kata. Kamu sering merasa berjarak dari lingkungan sekitar karena menjelaskan isi kepalamu terasa lebih melelahkan daripada memikirkannya sendiri. Kamu tidak perlu menjelaskan semua alur pikiranmu, cukup sampaikan kesimpulannya dan satu alasan paling kuat.

### Bunga Persik dan Ketegasan

Di Pilar Kerja, kamu memiliki Bunga Persik (Peach Blossom). Orang mengingatmu setelah satu pertemuan tanpa kamu perlu berusaha keras, dan pintu terbuka lebih cepat untukmu. Namun, perhatian datang lebih cepat daripada kedekatan, dan jarak menuju kedekatan sungguhan kadang tidak pernah tertutup. Pilih beberapa orang, lalu bagikan cerita yang jujur dan luangkan waktu bersama mereka. Di Pilar Akar, kamu juga memiliki Mata Pisau (Yang Blade). Ada titik di mana kamu berhenti menimbang dan langsung mengambil keputusan tegas yang sering menyelamatkan situasi kritis. Namun, ketajaman yang sama bisa melukai hubungan atau situasi yang tidak perlu dirusak. Endapkan keputusan memutus hubungan atau komitmen selama semalam sebelum mengeksekusinya.

### Penutup

Kamu adalah individu yang memiliki ketahanan luar biasa dan kemampuan intuitif yang tajam. Dengan memahami pola dirimu sendiri, kamu bisa mengarahkan energi besar yang kamu miliki ke arah yang lebih produktif. Teruslah melangkah dengan keyakinan pada kemampuanmu sendiri.

---

