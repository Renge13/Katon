<!--
STATUS: RAW QA DUMP. Generated, not written. Do not edit the prose in this file -
it is evidence, and an edited reading is not one. Regenerate with npm run qa:depth-pairs.
-->

# Served readings, depth 1 beside depth 3 — 2026-08-22

Two charts, each at two depths. **Zero cost:** every word is lifted verbatim from
`docs/qa/2026-08-22-renders-n10-postfixes.json`, which stored the prose of all 72 attempts of a 40-run trace already paid for.

The question is the one the 45% / 65% / 33% findings-erosion figure cannot answer:
does a reader who waited for two extra regenerations get a worse reading. Depth 2 was
ruled on prose in `docs/qa/2026-08-19-retry-erosion.md`; this is the same kind of
evidence for depth 3.

## Read this first, because it bounds the verdict

- **Vintage.** Gate `1.17.0`, prompt `22316c3349d0ea46`. **Both current.**
- **Same chart on both sides.** A depth-1 reading of one chart against a depth-3
  reading of another would confound the depth with the chart.
- **Nothing is selected for quality.** Each side is the FIRST run of that chart at
  that depth in run order. Picking the nicer one is sampling until the answer is
  pretty, which is the rule `qa-renders.mjs` already refuses to break.
- **A depth-3 reading passed the same gate as a depth-1 reading.** Both are
  servable. The question is not correctness, it is whether the writing is worth
  the wait.

---

# chart 5

| | depth 1 | depth 3 |
|---|---|---|
| run | 3 | 2 |
| regenerations spent | 0 | 2 |
| characters | 5326 | 4571 |
| paragraphs | 12 | 10 |
| rejected on the way | — | fact.condition_named then coverage.field_dropped, coverage.field_dropped |

## chart 5 — DEPTH 1 (passed on the first attempt, no directive)

### Diri dan Keseimbangan

Kamu adalah Api (Fire) dengan arketipe Matahari (The Sun). Kehadiranmu langsung terasa sebelum kamu bicara. Kamu menerangi sekitarmu lebih dulu sebelum menghangatkan dirimu sendiri, dan nyala itu memakai tenaga yang tidak mengisi dirinya sendiri. Orang-orang berkumpul di sekitarmu tanpa perlu kamu undang, namun mereka tidak melihat seberapa cepat kamu merasa kosong begitu ruangan sepi. Atur jadwal untuk mengisi energimu seserius kamu mengatur jadwal kerja. Jangan tunggu sampai bateraimu benar-benar habis baru mencari cara untuk pulih.

Baganmu berdiri di titik tengah yang Seimbang (Balanced). Kamu sanggup menopang dirimu sendiri sekaligus tetap terbuka menerima dari luar. Situasi berubah, tetapi kamu jarang ikut goyah. Kamu memiliki kelenturan yang tinggi. Perubahan mendadak yang membuat orang lain kehilangan arah biasanya hanya menggeser langkahmu sedikit saja. Tentukan satu komitmen untuk enam bulan ke depan dan tuliskan alasannya. Begitu ragu menghampiri, baca ulang catatan itu alih-alih menunggu dorongan luar.

### Aspek Pemijar

Di Pilar Kerja yang mencakup pekerjaan dan kariermu, kamu memiliki Aspek Pemijar (Hurting Officer). Kamu cepat melihat cara yang lebih baik dan sulit diam saat melihat hal yang tidak efisien. Mengikuti aturan yang tidak masuk akal terasa menyiksa. Kamu paling cepat menemukan celah dan paling berani menyuarakan kebenaran.

Ide yang tajam biasanya datang darimu. Kejujuranmu mahal harganya. Orang yang kamu koreksi sering mengingat rasa sakitnya, bukan kebenarannya. Tunda penyampaian kritik saat kamu emosi. Besoknya, sampaikan hanya satu poin perbaikan beserta dampaknya dengan jernih. Satu masukan yang diterima jauh lebih bernilai dibanding lima yang ditolak.

### Ikatan Pilar

Pilar Diri dan Pilar Arah ditempati oleh Ikatan (Combination). Pilar Diri mencakup kehidupan pribadi dan hubungan terdekatmu, sementara Pilar Arah mencakup tujuan dan arah masa depanmu. Dua bagian dari baganmu saling mengunci. Area hidup yang diwakili keduanya berjalan berdampingan; saat satu bergerak, yang lain otomatis ikut terpengaruh. Kamu memiliki dua bidang hidup yang saling menguatkan dengan sendirinya tanpa perlu kamu atur. Namun, saat ada masalah, keduanya ikut terdampak bersamaan. Saat satu pilar kehidupanmu terguncang, jaga pilar pasangannya tetap berjalan rutin. Menjaga satu pilar tetap stabil mencegah efek domino ke area lainnya.

### Dominasi dan Batasan

Tidak ada unsur Logam di baganmu. Memutuskan untuk berhenti atau mengakhiri sesuatu terasa jauh lebih sulit bagimu daripada memulainya. Kamu bertahan di situasi yang sudah jelas selesai. Kamu memberi kesempatan lebih banyak kepada orang lain, namun hal-hal yang seharusnya sudah selesai terus menempel dan menguras energi. Beranikan diri mengakhiri urusan yang menggantung lewat satu percakapan tegas.

Menggantung masalah jauh lebih menguras energi dibanding ketegangan singkat saat menyelesaikannya. Di sisi lain, baganmu terisi oleh karya dan output karena unsur Tanah mengisi baganmu jauh lebih banyak daripada unsur lain. Ide dan karya mengalir tanpa henti. Kamu tak pernah kehabisan gagasan. Output-mu menguras habis input-mu. Selesaikan satu tugas sepenuhnya sebelum menyentuh yang baru, dan sisihkan satu hari seminggu bebas dari target output apa pun.

### Tanda di Pilar Arah

Di Pilar Arah, terdapat Tanda Kekosongan (Void). Orang lain melihat kamu berhasil di bidang ini, tetapi kamu sendiri sering merasa belum pantas menyandangnya. Hasilnya tidak pernah kurang. Rasa memilikinya yang tidak pernah ikut hadir. Kamu tidak pernah bersandar pada keberuntungan di bidang ini. Apa pun yang kamu capai di sana, kamu bangun murni dengan kerja keras.

Sebut hasil kerjamu dengan lantang, meskipun rasanya canggung. Di pilar yang sama, terdapat juga Bintang Penolong (Nobleman). Saat kamu benar-benar jalan buntu, selalu ada orang yang muncul membantu. Kamu jarang benar-benar sendirian di titik tersempit. Minta bantuan lebih awal dari yang terasa nyaman. Pertolongan di baganmu ada, bentuknya menunggu diminta.

### Fondasi dan Pendukung

Fondasi Pasanganmu ditempati oleh Aspek Pemikir (Indirect Resource). Ini adalah tempat membaca dinamika hubungan paling dekat. Kamu memahami sesuatu lewat jalan intuitif yang sulit dijelaskan. Kesimpulanmu sering benar sebelum kamu sempat membuktikannya. Kamu melihat pola yang luput dari pandangan orang lain. Kamu sering merasa berjarak dari lingkungan sekitar. Cukup sampaikan kesimpulannya dan satu alasan paling kuat.

Di baganmu juga terdapat Aspek Perajin (Eating God) yang membuatmu senang mengerjakan sesuatu sampai selesai tanpa perlu ditonton. Kamu menikmati pekerjaan tanpa bergantung pada pengakuan orang lain. Dokumentasikan dan kirimkan langsung hasil kerjamu ke pemangku kepentingan. Selain itu, Aspek Pelindung (Direct Resource) hadir sebagai bantuan yang muncul tepat pada waktunya. Kamu jarang benar-benar sendirian, namun batasi masa persiapanmu dengan tanggal, bukan dengan menunggu rasa siap.

Kamu adalah individu yang mampu menyeimbangkan diri di tengah arus perubahan yang konstan. Dengan ide yang terus mengalir, tantangan terbesarmu adalah belajar kapan harus berhenti dan memberi ruang bagi dirimu sendiri untuk pulih. Masa depanmu terbuka lebar selama kamu berani meminta bantuan dan menetapkan batasan yang tegas.

## chart 5 — DEPTH 3 (passed on the third attempt, after two directives)

### Identitas dan Keseimbangan

Kamu adalah Matahari (The Sun). Kehadiranmu langsung terasa sebelum kamu bicara. Kamu menerangi sekitarmu lebih dulu sebelum menghangatkan dirimu sendiri, dan nyala itu memakai tenaga yang tidak mengisi dirinya sendiri. Orang-orang berkumpul di sekitarmu tanpa perlu kamu undang, namun api selalu membutuhkan bahan bakar dari luar. Kamu tidak bisa terus menyala hanya dari cadangan energimu sendiri. Atur jadwal untuk mengisi energimu seserius kamu mengatur jadwal kerja. Jangan tunggu sampai bateraimu benar-benar habis baru mencari cara untuk pulih.

Baganmu berdiri di titik tengah yang Seimbang (Balanced). Kamu sanggup menopang dirimu sendiri sekaligus tetap terbuka menerima dari luar. Situasi berubah, tetapi kamu jarang ikut goyah. Kamu memiliki kelenturan yang tinggi, namun titik tengah ini tidak memberi dorongan ekstrem yang memaksa. Arah hidupmu harus kamu tentukan sendiri. Tentukan satu komitmen untuk enam bulan ke depan dan tuliskan alasannya agar kamu tidak menunggu dorongan luar saat ragu menghampiri.

### Ikatan Pilar Kehidupan

Di Pilar Diri dan Pilar Arah, terdapat Ikatan (Combination). Kehidupan pribadi dan hubungan terdekatmu di Pilar Diri berjalan berdampingan dengan tujuan dan arah masa depanmu di Pilar Arah. Saat satu bergerak, yang lain otomatis ikut terpengaruh. Kamu memiliki dua bidang hidup yang saling menguatkan dengan sendirinya, namun saat ada masalah, keduanya ikut terdampak bersamaan. Saat satu pilar kehidupanmu terguncang, jaga pilar pasangannya tetap berjalan rutin untuk mencegah efek domino ke area lainnya.

### Pola Energi Bagan

Tidak ada unsur Logam di baganmu. Memutuskan untuk berhenti atau mengakhiri sesuatu terasa jauh lebih sulit bagimu daripada memulainya. Kamu bertahan di situasi yang sudah jelas selesai. Meski kamu memberi kesempatan lebih banyak kepada orang lain, hal-hal yang seharusnya sudah selesai terus menempel dan menguras energi. Beranikan diri mengakhiri urusan yang menggantung lewat satu percakapan tegas.

Di sisi lain, unsur Tanah mengisi baganmu jauh lebih banyak daripada unsur lain. Energi mengucur lewat ide, kreasi, dan kejelian melihat ruang perbaikan. Ide dan karya mengalir tanpa henti, namun output-mu menguras habis input-mu. Selesaikan satu tugas sepenuhnya sebelum menyentuh yang baru, dan sisihkan satu hari seminggu bebas dari target output apa pun.

### Aspek Pemijar

Di Pilar Kerja, yang mencakup pekerjaan dan kariermu, kamu memiliki Aspek Pemijar (Hurting Officer). Kamu cepat melihat cara yang lebih baik dan sulit diam saat melihat hal yang tidak efisien. Mengikuti aturan yang tidak masuk akal terasa menyiksa. Kamu paling cepat menemukan celah dan paling berani menyuarakan kebenaran, namun kejujuranmu mahal harganya. Orang yang kamu koreksi sering mengingat rasa sakitnya, bukan kebenarannya. Tunda penyampaian kritik saat kamu emosi. Sampaikan hanya satu poin perbaikan beserta dampaknya dengan jernih di hari berikutnya.

### Fondasi Pasangan

Fondasi Pasanganmu di Pilar Diri, yang mencakup kehidupan pribadi dan hubungan terdekatmu, ditempati oleh Aspek Pemikir (Indirect Resource). Kamu memahami sesuatu lewat jalan intuitif yang sulit dijelaskan. Kamu melihat pola yang luput dari pandangan orang lain, namun sering merasa berjarak dari lingkungan sekitar. Kamu tidak perlu menjelaskan semua alur pikiranmu. Cukup sampaikan kesimpulannya dan satu alasan paling kuat agar orang lain mengerti tanpa membuat energimu terkuras.

### Tanda dan Bantuan

Di Pilar Arah, yang mencakup tujuan dan arah masa depanmu, terdapat Tanda Kekosongan (Void). Orang lain melihat kamu berhasil di bidang ini, tetapi kamu sendiri sering merasa belum pantas menyandangnya. Hasilnya tidak pernah kurang, namun rasa memilikinya tidak pernah ikut hadir. Kamu tidak pernah bersandar pada keberuntungan di sana, sehingga apa pun yang kamu capai dibangun murni dengan kerja keras. Sebut hasil kerjamu dengan lantang, meskipun rasanya canggung.

Di pilar yang sama, terdapat juga Bintang Penolong (Nobleman). Saat kamu benar-benar jalan buntu, selalu ada orang yang muncul membantu. Kamu jarang benar-benar sendirian di titik tersempit, namun bantuan itu perlu kamu jemput. Minta bantuan lebih awal dari yang terasa nyaman.

Kamu adalah individu yang mampu menyeimbangkan diri di tengah arus perubahan yang konstan. Dengan ketajaman ide dan ketangguhan kerja yang kamu miliki, kamu hanya perlu belajar kapan harus melepaskan apa yang sudah selesai dan kapan harus meminta bantuan. Masa depanmu terbuka lebar selama kamu berani mengakui pencapaianmu sendiri.

---

# chart 1

| | depth 1 | depth 3 |
|---|---|---|
| run | 5 | 2 |
| regenerations spent | 0 | 2 |
| characters | 5241 | 5193 |
| paragraphs | 11 | 11 |
| rejected on the way | — | coverage.cost_dropped, style.essay_connectives then fact.condition_named, fact.condition_named, style.raw_pillar |

## chart 1 — DEPTH 1 (passed on the first attempt, no directive)

### Diri dan Tenaga

Kamu adalah Api (Fire) dengan profil Matahari (The Sun). Kehadiranmu langsung terasa sebelum kamu bicara. Kamu menerangi sekitarmu lebih dulu sebelum menghangatkan dirimu sendiri, dan nyala itu memakai tenaga yang tidak mengisi dirinya sendiri. Orang-orang berkumpul di sekitarmu tanpa perlu kamu undang, namun mereka tidak melihat seberapa cepat kamu merasa kosong begitu ruangan sepi. Atur jadwal untuk mengisi energimu seserius kamu mengatur jadwal kerja. Sediakan waktu untuk bertemu orang atau mendatangi tempat yang bisa memulihkan tenagamu. Jangan tunggu sampai bateraimu benar-benar habis baru mencari cara untuk pulih.

Kamu memiliki kondisi Lemah (Weak). Lemah di sini bukan berarti tidak mampu, melainkan sumber tenagamu ada di luar dirimu. Kamu sangat peka membaca situasi dan tahu cara memanfaatkan dukungan di sekitarmu. Saat berada di lingkungan yang pas, pertumbuhanmu bisa jauh melampaui orang lain. Namun, karena sumber tenagamu dari luar, kamu kehabisan energi lebih cepat saat salah menempatkan diri. Perhatikan lingkunganmu dengan serius. Sebelum mengambil peran baru, tanya ke diri sendiri siapa atau apa yang akan mengisi ulang energimu di sana.

### Pekerjaan dan Karier

Di Pilar Kerja yang mencakup pekerjaan dan kariermu, terdapat Tanda Kekosongan (Void). Orang lain melihat kamu berhasil di bidang ini, tetapi kamu sendiri sering merasa belum pantas menyandangnya. Hasilnya tidak pernah kurang, namun rasa memilikinya yang tidak pernah ikut hadir. Kamu tidak pernah bersandar pada keberuntungan di sini; apa pun yang kamu capai, kamu bangun murni dengan kerja keras. Pengakuan orang lain tidak pernah menempel di dalam dirimu, sehingga kamu terus menunggu bukti berikutnya. Sebut hasil kerjamu dengan lantang, meskipun rasanya canggung.

Di pilar yang sama, kamu juga memiliki Aspek Pengelola (Direct Wealth). Kamu dipercaya memegang hal penting dan merawatnya dengan rapi. Orang merasa tenang saat kamu yang memegang kendali. Apa yang kamu urus jarang berantakan dan kepercayaan datang sendiri tanpa perlu kamu minta. Namun, semakin banyak yang kamu pegang, semakin sedikit energi yang tersisa untuk dirimu sendiri. Pilih satu tugas untuk diserahkan ke orang lain bulan ini. Berikan petunjuk yang jelas, dan biarkan hasilnya berjalan meskipun tidak serapi caramu.

### Arah dan Langkah

Kamu memiliki Setengah Gabungan (Half Combination) yang membentang di Pilar Akar, Pilar Kerja, dan Pilar Arah. Tarikan energi ini sudah bekerja untukmu dan memberi arah yang jelas. Dalam kehidupan sehari-hari, ini terasa seperti rasa hampir pas; semuanya sudah jalan, tapi kamu selalu merasa harus menambah satu hal lagi sebelum berani menyebutnya selesai. Rasa belum lengkap itu hanya bagian dari polamu. Saat muncul keinginan untuk menambah satu hal lagi, berhenti sejenak dan tanya apakah yang ada sekarang sudah cukup untuk melangkah.

### Dorongan Bergerak

Tidak ada unsur Kayu di baganmu. Kamu jarang menunggu inspirasi dan tidak pernah gelisah tanpa alasan. Kamu tidak butuh alasan besar untuk mulai bergerak dan fokus bekerja dari apa yang ada di depan mata. Namun, kamu susah untuk putar arah. Karena dorongan untuk berubah tidak muncul dari dalam diri, kamu bisa bertahan bertahun-tahun di situasi yang sudah tidak cocok. Jangan menunggu merasa siap untuk pindah. Buat pemicu dari luar, seperti memasang tanggal keputusan di kalender atau membuat janji ke orang lain.

### Disiplin dan Hubungan

Kamu memiliki Aspek Pengatur (Direct Officer) yang muncul di Pilar Kerja, Pilar Diri, dan Pilar Arah. Kamu tahu apa yang seharusnya dilakukan dan tetap menjalankannya meski tidak ada yang melihat. Orang menaruh tanggung jawab padamu sejak muda, namun tuntutan untuk selalu benar membuatmu jarang memberi izin pada dirimu sendiri untuk bersikap longgar. Buat jadwal sendiri untuk santai tanpa tuntutan harus selalu benar.

Di Pilar Diri yang mencakup kehidupan pribadi dan hubungan terdekatmu, terdapat Fondasi Pasangan. Dinamika hubunganmu di sini diwarnai oleh Aspek Pengatur, yang menunjukkan tekstur relasi yang terasa wajar bagimu, meskipun orang lain bisa menganggapnya berat.

### Daya Tarik dan Dukungan

Di Pilar Kerja, kamu memiliki Bunga Persik (Peach Blossom). Orang mengingatmu setelah satu pertemuan tanpa kamu perlu berusaha keras. Kesan pertamamu bekerja sebelum kamu mulai bicara, namun jarak menuju kedekatan sungguhan kadang tidak pernah tertutup. Pilih beberapa orang, lalu bagikan cerita yang jujur dan luangkan waktu bersama mereka.

Masih di Pilar Kerja, kamu memiliki Bintang Penolong (Nobleman). Saat kamu benar-benar jalan buntu, selalu ada orang yang muncul membantu. Minta bantuan lebih awal dari yang terasa nyaman karena pertolongan itu menunggu diminta. Selain itu, baganmu didominasi oleh unsur Air yang membawa tuntutan luar berupa aturan dan ekspektasi publik. Kamu tangguh di bawah tekanan, namun lepaskan satu beban yang sebenarnya bukan kewajibanmu bulan ini.

Kamu adalah sosok yang tangguh dan mampu memikul tanggung jawab besar dengan disiplin yang tinggi. Kamu tidak perlu menunggu pengakuan dari luar untuk memvalidasi kerja keras yang sudah kamu bangun. Mulailah untuk lebih berani meminta bantuan dan memberi ruang bagi dirimu sendiri untuk beristirahat.

## chart 1 — DEPTH 3 (passed on the third attempt, after two directives)

### Dirimu dan Sumber Energi

Kamu adalah Matahari (The Sun). Kehadiranmu langsung terasa sebelum kamu bicara. Kamu menerangi sekitarmu lebih dulu sebelum menghangatkan dirimu sendiri, dan nyala itu memakai tenaga yang tidak mengisi dirinya sendiri. Orang-orang berkumpul di sekitarmu tanpa perlu kamu undang, namun mereka tidak melihat seberapa cepat kamu merasa kosong begitu ruangan sepi. Api selalu membutuhkan bahan bakar dari luar, sehingga kamu tidak bisa terus menyala hanya dari cadangan energimu sendiri. Atur jadwal untuk mengisi energimu seserius kamu mengatur jadwal kerja. Sediakan waktu untuk bertemu orang atau mendatangi tempat yang bisa memulihkan tenagamu. Jangan tunggu sampai bateraimu benar-benar habis baru mencari cara untuk pulih.

Kamu adalah Api Lemah. Lemah di sini bukan berarti tidak mampu, melainkan sumber tenagamu ada di luar dirimu. Kamu sangat peka membaca situasi dan tahu cara memanfaatkan dukungan di sekitarmu. Saat berada di lingkungan yang pas, pertumbuhanmu bisa jauh melampaui orang lain. Namun, karena sumber tenagamu dari luar, kamu kehabisan energi lebih cepat saat salah menempatkan diri. Perhatikan lingkunganmu dengan serius, bukan hanya sebagai latar belakang. Sebelum mengambil peran baru, tanya ke diri sendiri: siapa atau apa yang akan mengisi ulang energiku di sini? Kalau jawabannya tidak ada, kamu sendiri yang akan kehabisan tenaga.

### Dinamika di Pilar Kerja

Di Pilar Kerja, yang mencakup pekerjaan dan kariermu, terdapat Tanda Kekosongan (Void). Orang lain melihat kamu berhasil di bidang ini, tetapi kamu sendiri sering merasa belum pantas menyandangnya. Hasilnya tidak pernah kurang, namun rasa memilikinya yang tidak pernah ikut hadir. Kamu tidak pernah bersandar pada keberuntungan di bidang ini, sehingga apa pun yang kamu capai, kamu bangun murni dengan kerja keras. Pengakuan orang lain tidak pernah menempel di dalam dirimu. Sebut hasil kerjamu dengan lantang, meskipun rasanya canggung.

Di pilar yang sama, kamu memiliki Aspek Pengelola (Direct Wealth). Kamu dipercaya memegang hal penting dan merawatnya dengan rapi. Apa yang kamu urus jarang berantakan, namun semakin banyak yang kamu pegang, semakin sedikit energi yang tersisa untuk dirimu sendiri. Pilih satu tugas untuk diserahkan ke orang lain bulan ini. Berikan petunjuk yang jelas, dan biarkan hasilnya berjalan meskipun tidak serapi caramu.

Juga di Pilar Kerja, kamu memiliki Bunga Persik (Peach Blossom). Orang mengingatmu setelah satu pertemuan tanpa kamu perlu berusaha keras. Pintu terbuka lebih cepat untukmu karena orang penasaran ingin mengenalmu lebih jauh. Namun, perhatian datang lebih cepat daripada kedekatan. Pilih beberapa orang, lalu bagikan cerita yang jujur dan luangkan waktu bersama mereka. Selain itu, kamu memiliki Bintang Penolong (Nobleman). Saat kamu benar-benar jalan buntu, selalu ada orang yang muncul membantu. Kamu terbiasa menyelesaikan semuanya sendiri sampai lupa bahwa ada yang bisa dimintai bantuan. Minta bantuan lebih awal dari yang terasa nyaman.

### Pola Setengah Gabungan

Pilar Akar, Pilar Kerja, dan Pilar Arah mengalami Setengah Gabungan (Half Combination). Dua dari tiga bagian sudah saling tarik. Arah geraknya sudah jelas, meski kekuatannya belum sepenuhnya padu. Tarikan energi ini sudah bekerja untukmu dan memberi arah yang jelas. Dalam kehidupan sehari-hari, ini terasa seperti rasa hampir pas: semuanya sudah jalan, tapi kamu selalu merasa harus menambah satu hal lagi sebelum berani menyebutnya selesai. Rasa belum lengkap itu hanya bagian dari polamu. Saat muncul keinginan untuk menambah satu hal lagi, berhenti sejenak dan tanya: apakah yang ada sekarang sudah cukup untuk melangkah?

### Keseimbangan Unsur

Tidak ada unsur Kayu di baganmu. Kamu jarang menunggu inspirasi dan tidak pernah gelisah tanpa alasan. Kamu tidak butuh alasan besar untuk mulai bergerak dan fokus bekerja dari apa yang ada di depan mata. Namun, kamu mudah menyelesaikan apa yang ada di depan mata tapi susah untuk putar arah. Jangan menunggu merasa siap untuk pindah, karena rasa itu tidak akan datang. Buat pemicu dari luar seperti tanggal keputusan di kalender.

Di sisi lain, baganmu didominasi unsur Air. Kamu tangguh di bawah tekanan, namun tuntutan untuk selalu benar tidak pernah berhenti. Lepaskan satu beban yang sebenarnya bukan kewajibanmu bulan ini dan sampaikan batas ini dengan tegas.

### Tanggung Jawab dan Hubungan

Kamu memiliki Aspek Pengatur (Direct Officer). Kamu tahu apa yang seharusnya dilakukan dan tetap menjalankannya meski tidak ada yang melihat. Orang menaruh tanggung jawab padamu sejak muda, namun kamu jarang memberi izin pada dirimu sendiri untuk bersikap longgar. Buat jadwal sendiri untuk santai tanpa tuntutan harus selalu benar.

Fondasi Pasanganmu, yang mencakup kehidupan pribadi dan hubungan terdekatmu, ditempati oleh Aspek Pengatur. Ini menunjukkan tekstur relasi yang terasa wajar bagimu, di mana tanggung jawab dan disiplin menjadi dasar interaksi yang paling dekat.

Kamu adalah sosok yang tangguh dan sangat diandalkan oleh orang-orang di sekitarmu. Dengan mengenali kapan harus berhenti dan meminta bantuan, kamu akan mampu menjaga nyalamu tetap terang tanpa harus kehabisan tenaga.

---

## What is NOT in this file

No verdict, and no counted differences beyond the two neutral ones in each table.
The register call is Reyner's and a summary written above the prose would frame the
read before he has done it - the same reason `qa-renders.mjs` prints its readings
unedited under a source banner and stops there.

