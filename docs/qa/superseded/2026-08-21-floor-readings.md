<!--
STATUS: RAW QA DUMP. Generated, not written. Do not edit the prose in this file -
it is evidence, and an edited render is not one. Regenerate with npm run qa:renders.
-->

# QA renders — 2026-08-21

Charts 5, 13, 1 and fresh-1996 through the real chain. **Prose is verbatim and nothing
below a rule is edited.** Nobody has judged these; that is Reyner's, after Cowork annotates.

## FLOOR RATE, n = 1 per chart

| Chart | runs | scored | floored | floor rate | transport-truncated | cached |
|---|---|---|---|---|---|---|
| chart 5 | 1 | 1 | 1 | **100%** | 0 | 0 |
| chart 13 | 1 | 1 | 1 | **100%** | 0 | 0 |
| chart 1 | 1 | 1 | 1 | **100%** | 0 | 0 |
| fresh-1996 | 1 | 1 | 1 | **100%** | 0 | 0 |
| **POOLED** | **4** | **4** | **4** | **100%** | **0** | **0** |

`scored` is the denominator the rate uses. A run whose chain was cut short by a provider
transport error is EXCLUDED, because the gate did not floor it - the trap
`probe-retry-depth` hit on 2026-08-19, where one 503 was the whole difference between a
reported 3% floor and a real 0 of 39.

**n = 1, SO THERE IS NO RATE HERE, only an observation.** Precondition 3 cannot be read
off a single render: three consecutive n=1 runs of these four charts returned 0/4, 2/4
and 1/4 with identical failing checks. Use `--n 10` to measure.

## ⚠ 4 of 4 ARE THE FLOOR, NOT A READING

`source: module_assembly` means Stage 6 rejected the model on every attempt in its
budget - one initial plus two regenerations since 2026-08-19, so THREE, not the two
this banner used to claim - and the reader was served
**module assembly** — the deterministic floor, which renders glossary strings Reyner already
ruled. It is fluent Indonesian and it is indistinguishable from a reading by eye. A register
or quality verdict formed on one of these is a verdict on the glossary, not on the renderer.

- **chart 5** (1988-07-10 22:00) — `module_assembly`, failed twice on: 
- **chart 13** (1989-02-04 04:00) — `module_assembly`, failed twice on: 
- **chart 1** (1989-09-13 09:00) — `module_assembly`, failed twice on: 
- **fresh-1996** (1996-10-02 19:20) — `module_assembly`, failed twice on: 

**They are included below anyway, labelled**, because what the floor produces is worth
seeing next to what the model produces. Read the banner before the prose, every time.

---

## chart 5 — 1988-07-10 22:00

> the quietFloor re-ask — padding confirmed by Reyner 2026-08-11, attributed to unwritten cells

### ⚠ THIS IS THE FLOOR. It is not the renderer's output and must not be read as one.

| | |
|---|---|
| `source` | **module_assembly** |
| `model` | — (no model output was served) |
| `prompt_version` | — (floor renders no prompt) |
| loaded prompt | 2ff1a546fb7e6e53 |
| `stage6_version` | 1.13.0-floor |
| `qa_flag` | — |
| `cached` | false |
| pillars | 戊辰 己未 丙寅 己亥 |
| facts / required | 13 / 7 |

---

### Api

Matahari (The Sun). Api (Fire). Kehadiranmu langsung terasa sebelum kamu bicara. Kamu menerangi sekitarmu lebih dulu sebelum menghangatkan dirimu sendiri, dan nyala itu memakai tenaga yang tidak mengisi dirinya sendiri.

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

### ⚠ THIS IS THE FLOOR. It is not the renderer's output and must not be read as one.

| | |
|---|---|
| `source` | **module_assembly** |
| `model` | — (no model output was served) |
| `prompt_version` | — (floor renders no prompt) |
| loaded prompt | 2ff1a546fb7e6e53 |
| `stage6_version` | 1.13.0-floor |
| `qa_flag` | — |
| `cached` | false |
| pillars | 戊辰 乙丑 乙未 戊寅 |
| facts / required | 11 / 6 |

---

### Kayu

Bambu (The Bamboo). Kayu (Wood). Kamu tumbuh dengan menjangkau hal baru. Berhenti berkembang terasa lebih buruk bagimu daripada salah arah. Kamu memiliki dorongan alami untuk maju dan memperbaiki keadaan. Orang di sekitarmu ikut terdorong oleh energimu. Kamu sulit melambat, bahkan di saat tubuh dan pikiranmu sangat membutuhkan istirahat.

### Seimbang

Seimbang (Balanced). Baganmu berdiri di titik tengah yang stabil. Kamu sanggup menopang dirimu sendiri sekaligus tetap terbuka menerima dari luar. Situasi berubah, tetapi kamu jarang ikut goyah.

Kamu memiliki kelenturan yang tinggi. Perubahan mendadak yang membuat orang lain kehilangan arah biasanya hanya menggeser langkahmu sedikit saja. Titik tengah tidak memberi dorongan ekstrem yang memaksa. Arah hidupmu harus kamu tentukan sendiri, karena baganmu tidak akan memaksamu ke satu sudut. Tentukan satu komitmen untuk enam bulan ke depan dan tuliskan alasannya. Begitu ragu menghampiri, baca ulang catatan itu alih-alih menunggu dorongan luar.

### Aspek Peraih

Pilar Kerja. Aspek Peraih (Indirect Wealth). Kamu melihat peluang di tempat yang dilewati orang lain. Kesempatan dan hasil terasa mudah datang, tetapi juga mudah lepas.

Kamu tidak takut pada ketidakpastian. Pintu sering terbuka justru karena kamu berani mengetuk lebih dulu. Yang datang besar bisa hilang besar. Kamu jarang menyimpannya cukup lama untuk benar-benar merasa aman. Kunci dan eksekusi tuntas satu peluang di tangan sebelum mengejar yang baru. Peluang yang setengah jalan hanya membuang energi.

### Benturan

Pilar Kerja dan Pilar Diri. Benturan (Clash). Dua bagian baganmu saling berhadapan langsung. Perubahan di area ini biasanya datang mendadak dan membawa guncangan, bukan lewat proses perlahan.

Kamu terbiasa beradaptasi dengan guncangan cepat. Situasi sulit yang membuat orang lain panik sudah pernah kamu lewati. Ketenangan di area ini tidak datang otomatis. Kestabilannya butuh dijaga dengan usaha yang sadar dan terus-menerus. Perlakukan dinamika di area ini sebagai dorongan untuk naik kelas. Siapkan rencana cadangan sebelum dibutuhkan agar kamu merespons dengan strategi, bukan panik.

<!-- no heading: a null-label condition, described not named -->

Baganmu dipenuhi hal-hal yang menuntut pengelolaan: peluang, tanggung jawab, dan urusan orang lain. Kesempatan tak pernah habis di tanganmu. Kamu selalu punya objek untuk dikelola. Urusan melebihi kapasitas fisikmu. Perhatianmu terpecah dan banyak hal terbengkalai setengah jalan. Pilih hanya tiga prioritas utama untuk kuartal ini dan parkir sisanya. Fokus selesaikan tiga hal itu sebelum menyentuh daftar tunggu.

### Fondasi Pasangan

Pilar Diri. Fondasi Pasangan (Spouse Palace). Tempat membaca dinamika hubungan paling dekat. Isinya menunjukkan tekstur relasi yang terasa wajar bagimu, meskipun orang lain bisa menganggapnya berat.

### Penutup

*(empty — `notes.penutup_unavailable` is true)*

---

## chart 1 — 1989-09-13 09:00

> the reference chart for every card and contrast measurement

### ⚠ THIS IS THE FLOOR. It is not the renderer's output and must not be read as one.

| | |
|---|---|
| `source` | **module_assembly** |
| `model` | — (no model output was served) |
| `prompt_version` | — (floor renders no prompt) |
| loaded prompt | 2ff1a546fb7e6e53 |
| `stage6_version` | 1.13.0-floor |
| `qa_flag` | — |
| `cached` | false |
| pillars | 己巳 癸酉 丙子 癸巳 |
| facts / required | 14 / 9 |

---

### Api

Matahari (The Sun). Api (Fire). Kehadiranmu langsung terasa sebelum kamu bicara. Kamu menerangi sekitarmu lebih dulu sebelum menghangatkan dirimu sendiri, dan nyala itu memakai tenaga yang tidak mengisi dirinya sendiri.

Orang-orang berkumpul di sekitarmu tanpa perlu kamu undang. Suasana ruangan berubah saat kamu masuk. Api selalu membutuhkan bahan bakar dari luar. Kamu tidak bisa terus menyala hanya dari cadangan energimu sendiri. Atur jadwal untuk mengisi energimu seserius kamu mengatur jadwal kerja. Sediakan waktu untuk bertemu orang atau mendatangi tempat yang bisa memulihkan tenagamu. Jangan tunggu sampai bateraimu benar-benar habis baru mencari cara untuk pulih.

### Lemah

Lemah (Weak). Lemah di sini bukan berarti tidak mampu. Sumber tenagamu ada di luar dirimu. Tempat yang tepat membuatmu melesat cepat, dan tempat yang salah mengurasmu sampai habis.

Kamu sangat peka membaca situasi dan tahu cara memanfaatkan dukungan di sekitarmu. Saat berada di lingkungan yang pas, pertumbuhanmu bisa jauh melampaui orang lain. Karena sumber tenagamu dari luar, kamu kehabisan energi lebih cepat saat salah menempatkan diri. Tanpa ekosistem yang menopang, kamu menanggung lelah sendirian. Perhatikan lingkunganmu dengan serius, bukan hanya sebagai latar belakang. Sebelum mengambil peran baru, tanya ke diri sendiri: siapa atau apa yang akan mengisi ulang energiku di sini? Kalau jawabannya tidak ada, kamu sendiri yang akan kehabisan tenaga.

### Aspek Pengelola

Pilar Kerja. Aspek Pengelola (Direct Wealth). Kamu dipercaya memegang hal penting dan merawatnya dengan rapi. Orang merasa tenang saat kamu yang memegang kendali.

Apa yang kamu urus jarang berantakan. Kepercayaan datang sendiri tanpa perlu kamu minta. Semakin banyak yang kamu pegang, semakin sedikit energi yang tersisa untuk dirimu sendiri. Beban kerja yang kamu pegang akan terus bertambah kalau tidak pernah ada yang kamu bagikan. Pilih satu tugas untuk diserahkan ke orang lain bulan ini. Berikan petunjuk yang jelas, dan biarkan hasilnya berjalan meskipun tidak serapi caramu.

### Tanda Kekosongan

Pilar Kerja. Tanda Kekosongan (Void). Orang lain melihat kamu berhasil di bidang ini, tetapi kamu sendiri sering merasa belum pantas menyandangnya. Hasilnya tidak pernah kurang. Rasa memilikinya yang tidak pernah ikut hadir.

Kamu tidak pernah bersandar pada keberuntungan di bidang ini. Apa pun yang kamu capai di sana, kamu bangun murni dengan kerja keras. Pengakuan orang lain tidak pernah menempel di dalam dirimu. Orang sudah menganggapmu ahli, tetapi kamu masih terus menunggu bukti berikutnya. Pengakuan di bidang ini tidak akan menempel dengan sendirinya. Sebut hasil kerjamu dengan lantang, meskipun rasanya canggung.

### Setengah Gabungan

Pilar Akar, Pilar Kerja, dan Pilar Arah. Setengah Gabungan (Half Combination). Dua dari tiga bagian sudah saling tarik. Arah geraknya sudah jelas, meski kekuatannya belum sepenuhnya padu.

Tarikan energi ini sudah bekerja untukmu dan memberi arah yang jelas. Dua dari tiga bagian sudah terhubung, jadi tinggal satu lagi yang kurang. Dalam kehidupan sehari-hari, ini terasa seperti rasa 'hampir pas': semuanya sudah jalan dan arahnya jelas, tapi kamu selalu merasa harus menambah satu hal lagi sebelum berani menyebutnya selesai. Rasa 'belum lengkap' itu hanya bagian dari polamu, bukan tanda ada yang salah. Saat muncul keinginan untuk menambah satu hal lagi, berhenti sejenak dan tanya: apakah yang ada sekarang sudah cukup untuk melangkah? Sering kali, jawabannya sudah lebih dari cukup.

<!-- no heading: a null-label condition, described not named -->

Kamu jarang menunggu inspirasi dan tidak pernah gelisah tanpa alasan. Dorongan untuk berpindah arah tidak pernah muncul otomatis dari dalam diri.

Kamu tidak butuh alasan besar untuk mulai bergerak. Kamu fokus bekerja dari apa yang ada di depan mata. Kamu mudah menyelesaikan apa yang ada di depan mata, tapi susah untuk putar arah. Dorongan untuk berubah tidak pernah muncul dari dalam diri. Karena itu, kamu bisa bertahan bertahun-tahun di situasi yang sudah tidak cocok dan menganggapnya biasa saja. Jangan menunggu merasa siap untuk pindah, karena rasa itu tidak akan datang. Buat pemicu dari luar: pasang tanggal keputusan di kalender atau buat janji ke orang lain. Begitu tanggalnya tiba dan belum ada perubahan, langsung melangkah.

### Aspek Pengatur

Aspek Pengatur (Direct Officer). Kamu tahu apa yang seharusnya dilakukan dan tetap menjalankannya meski tidak ada yang melihat. Melanggar aturan terasa lebih melelahkan daripada mematuhinya.

Orang menaruh tanggung jawab padamu sejak muda. Kamu menjadi tempat bersandar tanpa pernah meminta posisi itu. Tuntutan untuk selalu benar tidak pernah berhenti. Kamu jarang memberi izin pada dirimu sendiri untuk bersikap longgar. Waktu untuk santai tidak akan datang dari orang lain, karena mereka justru bersandar pada disiplinmu. Buat jadwal sendiri untuk santai tanpa tuntutan harus selalu benar, dan jaga jadwal itu seserius kamu menjaga aturan kerja.

### Fondasi Pasangan

Pilar Diri. Fondasi Pasangan (Spouse Palace). Tempat membaca dinamika hubungan paling dekat. Isinya menunjukkan tekstur relasi yang terasa wajar bagimu, meskipun orang lain bisa menganggapnya berat.

### Bunga Persik

Pilar Kerja. Bunga Persik (Peach Blossom). Orang mengingatmu setelah satu pertemuan tanpa kamu perlu berusaha keras. Perhatian datang tanpa harus kamu kejar.

Pintu terbuka lebih cepat untukmu karena orang penasaran ingin mengenalmu lebih jauh. Kesan pertamamu bekerja sebelum kamu mulai bicara. Pakai kesan itu di awal, jangan disimpan sampai orang sudah membentuk pendapat sendiri. Perhatian datang lebih cepat daripada kedekatan. Orang tertarik dulu pada penampilan atau kebiasaanmu, dan jarak menuju kedekatan sungguhan kadang tidak pernah tertutup. Daya tarik memang membuat orang memperhatikanmu, tapi hubungan yang dekat harus dibangun pelan-pelan. Pilih beberapa orang, lalu bagikan cerita yang jujur dan luangkan waktu bersama mereka. Kesan pertama hanya membuka pintu; kehadiran yang konsisten yang membuat orang bertahan.

### Penutup

*(empty — `notes.penutup_unavailable` is true)*

---

## fresh-1996 — 1996-10-02 19:20

> the Samudra opening that ranked 9th of 14 before Prompt K

### ⚠ THIS IS THE FLOOR. It is not the renderer's output and must not be read as one.

| | |
|---|---|
| `source` | **module_assembly** |
| `model` | — (no model output was served) |
| `prompt_version` | — (floor renders no prompt) |
| loaded prompt | 2ff1a546fb7e6e53 |
| `stage6_version` | 1.13.0-floor |
| `qa_flag` | — |
| `cached` | false |
| pillars | 丙子 丁酉 壬申 庚戌 |
| facts / required | 14 / 9 |

---

### Air

Samudra (The Ocean). Air (Water). Kamu menyesuaikan diri dengan keadaan tanpa pernah kehilangan arah tujuan. Orang lain sering kesulitan menebak langkahmu berikutnya.

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

