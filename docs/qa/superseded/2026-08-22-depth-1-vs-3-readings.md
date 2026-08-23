<!--
STATUS: RAW QA DUMP. Generated, not written. Do not edit the prose in this file -
it is evidence, and an edited reading is not one. Regenerate with npm run qa:depth-pairs.
-->

# Served readings, depth 1 beside depth 3 — 2026-08-22

Two charts, each at two depths. **Zero cost:** every word is lifted verbatim from
`docs/qa/2026-08-18-retry-depth.json`, which stored the prose of all 77 attempts of a
40-run trace already paid for.

The question is the one the 45% / 65% / 33% findings-erosion figure cannot answer:
does a reader who waited for two extra regenerations get a worse reading. Depth 2 was
ruled on prose in `docs/qa/2026-08-19-retry-erosion.md`; this is the same kind of
evidence for depth 3.

## Read this first, because it bounds the verdict

- **Vintage.** Gate `1.9.0`, prompt `2ff1a546fb7e6e53`. Today's are `1.17.0` and `7d074ea5232671b9`, so this is a historical vintage. What has NOT changed is `stricterDirective` itself, which is the thing under judgement, so the question is still being asked of the code that answers it today.
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
| run | 4 | 1 |
| regenerations spent | 0 | 2 |
| characters | 4713 | 3658 |
| paragraphs | 10 | 6 |
| rejected on the way | — | style.hedging then coverage.field_dropped, style.hedging |

## chart 5 — DEPTH 1 (passed on the first attempt, no directive)

### Diri dan Keseimbangan

Kamu adalah Api Matahari. Kehadiranmu langsung terasa bahkan sebelum kamu bicara, karena kamu menerangi sekitarmu lebih dulu sebelum menghangatkan dirimu sendiri. Orang-orang berkumpul di sekitarmu tanpa perlu diundang, namun nyala ini memakai tenaga yang tidak mengisi dirinya sendiri. Api selalu membutuhkan bahan bakar dari luar, jadi jangan menunggu sampai bateraimu benar-benar habis sebelum mencari cara untuk pulih. Atur jadwal untuk mengisi energimu seserius kamu mengatur jadwal kerja.

Baganmu berdiri di titik tengah yang stabil, yang disebut Seimbang. Kamu sanggup menopang dirimu sendiri sekaligus tetap terbuka menerima dari luar. Situasi bisa berubah, tetapi kamu jarang ikut goyah karena kamu memiliki kelenturan yang tinggi. Karena baganmu tidak memaksamu ke satu sudut ekstrem, arah hidupmu harus kamu tentukan sendiri. Tentukan satu komitmen untuk enam bulan ke depan dan tuliskan alasannya agar kamu tetap punya pegangan saat keraguan muncul.

### Ikatan Pilar Kehidupan

Di Pilar Diri dan Pilar Arah, terdapat Ikatan (Combination) yang mengunci dua area hidupmu. Pilar Diri adalah tempat kehidupan pribadi dan hubungan terdekatmu, sementara Pilar Arah adalah tujuan dan arah masa depanmu. Keduanya berjalan berdampingan; saat satu bergerak, yang lain otomatis ikut terpengaruh. Ini adalah anugerah karena keduanya saling menguatkan dengan sendirinya, namun masalah di satu area jarang berhenti di sana saja. Saat satu pilar terguncang, jaga pilar pasangannya tetap berjalan rutin agar efek domino tidak meluas.

### Arus Karya dan Batasan

Baganmu didominasi oleh elemen Tanah, yang berarti energi mengucur deras lewat ide, kreasi, dan kejelian melihat ruang perbaikan. Ide dan karya mengalir tanpa henti, namun output ini menguras habis input-mu sampai kamu lupa mengisi ulang daya diri sendiri. Selesaikan satu tugas sepenuhnya sebelum menyentuh yang baru, dan sisihkan satu hari seminggu bebas dari target output apa pun.

Di sisi lain, kamu memiliki kondisi tanpa elemen Logam. Memutuskan untuk berhenti atau mengakhiri sesuatu terasa jauh lebih sulit bagimu daripada memulainya, sehingga kamu sering bertahan di situasi yang sudah jelas selesai. Meski ini memberimu kelebihan dalam memberi kesempatan lebih banyak kepada orang lain, hal-hal yang seharusnya sudah selesai terus menempel dan menguras energimu. Beranikan diri mengakhiri urusan yang menggantung lewat satu percakapan tegas.

### Aspek Pemijar

Di Pilar Kerja yang mencakup karier dan lingkungan kerjamu, kamu memiliki Aspek Pemijar (Hurting Officer). Kamu cepat melihat cara yang lebih baik dan sulit diam saat melihat hal yang tidak efisien, karena mengikuti aturan yang tidak masuk akal terasa menyiksa. Kamu paling cepat menemukan celah dan paling berani menyuarakan kebenaran, namun kejujuranmu mahal harganya karena orang yang kamu koreksi sering mengingat rasa sakitnya, bukan kebenarannya. Tunda penyampaian kritik saat kamu emosi, lalu sampaikan hanya satu poin perbaikan beserta dampaknya dengan jernih di hari berikutnya.

### Fondasi Pasangan

Fondasi Pasanganmu, yang terletak di Pilar Diri, menjadi tempat membaca dinamika hubungan paling dekat. Di sini terdapat Aspek Pemikir (Indirect Resource), yang berarti kamu memahami sesuatu lewat jalan intuitif yang sulit dijelaskan. Kamu melihat pola yang luput dari pandangan orang lain, namun kamu sering merasa berjarak dari lingkungan sekitar karena menjelaskan isi kepalamu terasa lebih melelahkan daripada memikirkannya sendiri. Kamu tidak perlu menjelaskan semua alur pikiranmu; cukup sampaikan kesimpulannya dan satu alasan paling kuat.

### Tanda dan Bantuan

Di Pilar Arah, kamu memiliki Tanda Kekosongan (Void). Orang lain melihat kamu berhasil di bidang ini, tetapi kamu sendiri sering merasa belum pantas menyandangnya. Hasilnya tidak pernah kurang, namun rasa memilikinya yang tidak pernah ikut hadir. Kamu tidak pernah bersandar pada keberuntungan di sini, sehingga apa pun yang kamu capai, kamu bangun murni dengan kerja keras. Sebut hasil kerjamu dengan lantang meskipun rasanya canggung.

Di pilar yang sama, terdapat juga Bintang Penolong (Nobleman). Saat kamu benar-benar jalan buntu, selalu ada orang yang muncul membantu, sering kali orang yang tidak kamu duga. Bantuan itu perlu kamu jemput, jadi mintalah bantuan lebih awal dari yang terasa nyaman.

### Penutup

Kamu adalah individu yang mampu menyeimbangkan arus ide yang deras dengan ketajaman intuisi yang jarang dimiliki orang lain. Kamu memiliki kapasitas besar untuk terus berkarya, namun kekuatanmu terletak pada keberanian untuk menetapkan batasan yang tegas. Teruslah melangkah dengan keyakinan bahwa bantuan akan selalu ada saat kamu bersedia memintanya.

## chart 5 — DEPTH 3 (passed on the third attempt, after two directives)

### Diri dan Keseimbangan

Kamu adalah Api Matahari. Kehadiranmu langsung terasa bahkan sebelum kamu bicara, menerangi sekitarmu sebelum menghangatkan dirimu sendiri. Orang-orang berkumpul di sekitarmu tanpa perlu diundang, namun nyala ini memakai tenaga yang tidak mengisi dirinya sendiri. Kamu tidak bisa terus menyala hanya dari cadangan energimu. Atur jadwal untuk mengisi energimu seserius kamu mengatur jadwal kerja, dan jangan tunggu sampai bateraimu benar-benar habis sebelum mencari cara untuk pulih. Baganmu berdiri di titik tengah yang stabil, yang disebut Seimbang. Kamu sanggup menopang dirimu sendiri sekaligus tetap terbuka menerima dari luar, sehingga perubahan mendadak yang membuat orang lain kehilangan arah biasanya hanya menggeser langkahmu sedikit saja. Karena titik tengah tidak memberi dorongan ekstrem, arah hidupmu harus kamu tentukan sendiri. Tentukan satu komitmen untuk enam bulan ke depan dan tuliskan alasannya agar kamu tetap fokus saat ragu menghampiri.

### Ikatan Pilar

Di Pilar Diri dan Pilar Arah, terdapat Ikatan (Combination). Kehidupan pribadi dan hubungan terdekatmu di Pilar Diri berjalan berdampingan dengan tujuan dan arah masa depanmu di Pilar Arah. Saat satu bergerak, yang lain otomatis ikut terpengaruh. Ini adalah dua bidang hidup yang saling menguatkan dengan sendirinya, namun saat ada masalah, keduanya ikut terdampak bersamaan. Saat satu pilar terguncang, jaga pilar pasangannya tetap berjalan rutin untuk mencegah efek domino ke area lainnya.

### Output dan Batasan

Baganmu terisi oleh karya dan output yang dominan, di mana energi mengucur lewat ide, kreasi, dan kejelian melihat ruang perbaikan. Kamu tidak pernah kehabisan gagasan, namun output ini menguras habis input-mu sampai kamu lupa mengisi ulang daya diri sendiri. Selesaikan satu tugas sepenuhnya sebelum menyentuh yang baru dan sisihkan satu hari seminggu bebas dari target apa pun. Di sisi lain, kamu mengalami kondisi tanpa Logam. Memutuskan untuk berhenti atau mengakhiri sesuatu terasa jauh lebih sulit bagimu daripada memulainya. Kamu memberi kesempatan lebih banyak kepada orang lain, namun hal yang seharusnya sudah selesai terus menempel dan menguras energi. Beranikan diri mengakhiri urusan yang menggantung lewat satu percakapan tegas karena batas tegas harus kamu buat dengan sengaja.

### Aspek Pemijar

Di Pilar Kerja yang mencakup pekerjaan dan kariermu, kamu memiliki Aspek Pemijar (Hurting Officer). Kamu cepat melihat cara yang lebih baik dan sulit diam saat melihat hal yang tidak efisien, sehingga mengikuti aturan yang tidak masuk akal terasa menyiksa. Kamu paling cepat menemukan celah dan berani menyuarakan kebenaran, namun kejujuranmu mahal harganya karena orang yang kamu koreksi sering mengingat rasa sakitnya. Tunda penyampaian kritik saat kamu emosi dan sampaikan hanya satu poin perbaikan beserta dampaknya dengan jernih di hari berikutnya.

### Fondasi Pasangan

Fondasi Pasanganmu di Pilar Diri, yang mencakup kehidupan pribadi dan hubungan terdekatmu, ditempati oleh Aspek Pemikir. Kamu memahami sesuatu lewat jalan intuitif yang sulit dijelaskan dan sering melihat pola yang luput dari pandangan orang lain. Kamu tidak perlu menjelaskan semua alur pikiranmu; cukup sampaikan kesimpulannya dan satu alasan paling kuat agar orang lain mengerti tanpa membuat energimu terkuras.

### Penutup

Kamu adalah sosok yang mampu menjaga keseimbangan di tengah arus ide yang tidak pernah berhenti mengalir. Dengan mengenali kapan harus berhenti dan kapan harus meminta bantuan, kamu akan mampu mengarahkan nyalamu dengan lebih bijak. Masa depanmu terbuka lebar selama kamu berani menetapkan batas bagi dirimu sendiri.

---

# chart 13

| | depth 1 | depth 3 |
|---|---|---|
| run | 1 | 3 |
| regenerations spent | 0 | 2 |
| characters | 5574 | 3932 |
| paragraphs | 8 | 6 |
| rejected on the way | — | fact.hour_known_contradiction then style.essay_connectives |

## chart 13 — DEPTH 1 (passed on the first attempt, no directive)

### Diri dan Keseimbangan

Kamu adalah Kayu (Wood). Kamu tumbuh dengan menjangkau hal baru, dan berhenti berkembang terasa lebih buruk bagimu daripada salah arah. Kamu memiliki dorongan alami untuk maju dan memperbaiki keadaan, yang sering kali membuat orang di sekitarmu ikut terdorong oleh energimu. Namun, kamu sulit melambat, bahkan di saat tubuh dan pikiranmu sangat membutuhkan istirahat. Baganmu berdiri di titik tengah yang stabil, yang disebut Seimbang (Balanced). Kamu sanggup menopang dirimu sendiri sekaligus tetap terbuka menerima dari luar. Perubahan mendadak yang membuat orang lain kehilangan arah biasanya hanya menggeser langkahmu sedikit saja. Titik tengah ini tidak memberi dorongan ekstrem yang memaksa, sehingga arah hidupmu harus kamu tentukan sendiri. Tentukan satu komitmen untuk enam bulan ke depan dan tuliskan alasannya. Begitu ragu menghampiri, baca ulang catatan itu alih-alih menunggu dorongan luar.

### Dinamika Benturan

Di Pilar Kerja dan Pilar Diri, terdapat Benturan (Clash). Pilar Kerja mencakup pekerjaan dan kariermu, sementara Pilar Diri adalah kehidupan pribadi dan hubungan terdekatmu. Dua bagian baganmu ini saling berhadapan langsung, yang berarti perubahan di area ini biasanya datang mendadak dan membawa guncangan, bukan lewat proses perlahan. Kamu terbiasa beradaptasi dengan guncangan cepat, dan situasi sulit yang membuat orang lain panik sudah pernah kamu lewati. Ketenangan di area ini tidak datang otomatis, sehingga kestabilannya butuh dijaga dengan usaha yang sadar dan terus-menerus. Perlakukan dinamika di area ini sebagai dorongan untuk naik kelas. Siapkan rencana cadangan sebelum dibutuhkan agar kamu merespons dengan strategi, bukan panik.

### Pengelolaan Tanggung Jawab

Baganmu dipenuhi elemen Tanah yang dominan, yang berarti kamu dikelilingi oleh hal-hal yang menuntut pengelolaan, mulai dari peluang, tanggung jawab, hingga urusan orang lain. Kesempatan tak pernah habis di tanganmu, dan kamu selalu punya objek untuk dikelola. Namun, urusan ini sering melebihi kapasitas fisikmu, membuat perhatianmu terpecah dan banyak hal terbengkalai setengah jalan. Pilih hanya tiga prioritas utama untuk kuartal ini dan parkir sisanya. Fokus selesaikan tiga hal itu sebelum menyentuh daftar tunggu.

### Aspek Peraih

Di Pilar Kerja, kamu memiliki Aspek Peraih (Indirect Wealth). Kamu melihat peluang di tempat yang dilewati orang lain, di mana kesempatan dan hasil terasa mudah datang, tetapi juga mudah lepas. Kamu tidak takut pada ketidakpastian, dan pintu sering terbuka justru karena kamu berani mengetuk lebih dulu. Namun, yang datang besar bisa hilang besar, dan kamu jarang menyimpannya cukup lama untuk benar-benar merasa aman. Kunci dan eksekusi tuntas satu peluang di tangan sebelum mengejar yang baru, karena peluang yang setengah jalan hanya membuang energi. Di Pilar Diri, yang mencakup kehidupan pribadi dan hubungan terdekatmu, terdapat Fondasi Pasangan. Isinya menunjukkan tekstur relasi yang terasa wajar bagimu, meskipun orang lain bisa menganggapnya berat.

### Tanda Kekosongan

Pilar Akar, yang mencakup asal-usul dan latar belakangmu, memiliki Tanda Kekosongan (Void). Orang lain melihat kamu berhasil di bidang ini, tetapi kamu sendiri sering merasa belum pantas menyandangnya. Hasilnya tidak pernah kurang, namun rasa memilikinya yang tidak pernah ikut hadir. Kamu tidak pernah bersandar pada keberuntungan di bidang ini, sehingga apa pun yang kamu capai di sana, kamu bangun murni dengan kerja keras. Pengakuan orang lain tidak pernah menempel di dalam dirimu, dan kamu masih terus menunggu bukti berikutnya. Sebut hasil kerjamu dengan lantang, meskipun rasanya canggung.

### Kemandirian dan Pengelolaan

Kamu memiliki Aspek Pendamping (Friend), yang membuatmu terbiasa menyelesaikan semuanya sendiri. Meminta tolong terasa lebih berat daripada mengerjakan sesuatu dua kali lipat. Kamu tidak runtuh saat tidak ada yang menopang, namun bantuan sering datang terlambat karena orang mengira kamu tidak membutuhkannya. Mintalah bantuan lebih awal sebelum situasinya makin mendesak. Di sisi lain, kamu memiliki Aspek Pengelola (Direct Wealth) yang tersebar di Pilar Akar dan Pilar Arah. Kamu dipercaya memegang hal penting dan merawatnya dengan rapi, sehingga orang merasa tenang saat kamu yang memegang kendali. Apa yang kamu urus jarang berantakan, namun semakin banyak yang kamu pegang, semakin sedikit energi yang tersisa untuk dirimu sendiri. Pilih satu tugas untuk diserahkan ke orang lain bulan ini, berikan petunjuk yang jelas, dan biarkan hasilnya berjalan meskipun tidak serapi caramu.

### Intuisi Pemikir

Kamu memiliki Aspek Pemikir (Indirect Resource) di Pilar Akar dan Pilar Kerja. Kamu memahami sesuatu lewat jalan intuitif yang sulit dijelaskan, dan kesimpulanmu sering benar sebelum kamu sempat membuktikannya. Kamu melihat pola yang luput dari pandangan orang lain, namun kamu sering merasa berjarak dari lingkungan sekitar karena menjelaskan isi kepalamu terasa lebih melelahkan daripada memikirkannya sendiri. Kamu tidak perlu menjelaskan semua alur pikiranmu. Cukup sampaikan kesimpulannya dan satu alasan paling kuat.

### Penutup

Kamu adalah sosok yang tangguh dalam mengelola peluang dan terbiasa berdiri di atas kaki sendiri. Keempat pilar dalam baganmu menunjukkan bahwa kamu memiliki kapasitas besar untuk menopang tanggung jawab, meski terkadang kamu perlu belajar untuk melepaskan sebagian beban agar energimu tetap terjaga. Masa depanmu adalah ruang untuk menyeimbangkan antara ambisi yang besar dan kebutuhan untuk benar-benar memiliki apa yang telah kamu capai.

## chart 13 — DEPTH 3 (passed on the third attempt, after two directives)

### Karakter dan Keseimbangan Diri

Kamu adalah Kayu, sosok yang tumbuh dengan menjangkau hal baru. Berhenti berkembang terasa lebih buruk bagimu daripada salah arah. Kamu memiliki dorongan alami untuk maju dan memperbaiki keadaan, bahkan sering kali membuat orang di sekitarmu ikut terdorong oleh energimu. Namun, kamu sulit melambat, bahkan di saat tubuh dan pikiranmu sangat membutuhkan istirahat. Baganmu berdiri di titik tengah yang stabil, yang disebut sebagai Seimbang. Kamu sanggup menopang dirimu sendiri sekaligus tetap terbuka menerima dari luar. Situasi berubah, tetapi kamu jarang ikut goyah. Kelenturan ini membuat perubahan mendadak yang biasanya membuat orang lain kehilangan arah hanya menggeser langkahmu sedikit saja. Titik tengah ini tidak memberi dorongan ekstrem yang memaksa, sehingga arah hidupmu harus kamu tentukan sendiri. Tentukan satu komitmen untuk enam bulan ke depan dan tuliskan alasannya. Begitu ragu menghampiri, baca ulang catatan itu alih-alih menunggu dorongan luar.

### Dinamika Pilar Kerja dan Diri

Di Pilar Kerja dan Pilar Diri, terdapat Benturan (Clash). Dua bagian baganmu saling berhadapan langsung, yang berarti perubahan di area pekerjaan dan kariermu serta kehidupan pribadi dan hubungan terdekatmu biasanya datang mendadak dan membawa guncangan. Kamu terbiasa beradaptasi dengan guncangan cepat, sehingga situasi sulit yang membuat orang lain panik sudah pernah kamu lewati. Ketenangan di area ini tidak datang otomatis dan kestabilannya butuh dijaga dengan usaha yang sadar dan terus-menerus. Perlakukan dinamika di area ini sebagai dorongan untuk naik kelas. Siapkan rencana cadangan sebelum dibutuhkan agar kamu merespons dengan strategi, bukan panik.

### Mengelola Beban dan Peluang

Baganmu dipenuhi elemen Tanah yang dominan, yang menandai banyaknya hal yang menuntut pengelolaan seperti peluang, tanggung jawab, dan urusan orang lain. Kesempatan tak pernah habis di tanganmu dan kamu selalu punya objek untuk dikelola. Namun, urusan sering kali melebihi kapasitas fisikmu, membuat perhatianmu terpecah dan banyak hal terbengkalai setengah jalan. Pilih hanya tiga prioritas utama untuk kuartal ini dan parkir sisanya. Fokus selesaikan tiga hal itu sebelum menyentuh daftar tunggu.

### Aspek Peraih dan Hubungan

Di Pilar Kerja, kamu memiliki Aspek Peraih (Indirect Wealth). Kamu melihat peluang di tempat yang dilewati orang lain, di mana kesempatan dan hasil terasa mudah datang, tetapi juga mudah lepas. Kamu tidak takut pada ketidakpastian dan pintu sering terbuka justru karena kamu berani mengetuk lebih dulu. Namun, yang datang besar bisa hilang besar karena kamu jarang menyimpannya cukup lama untuk benar-benar merasa aman. Kunci dan eksekusi tuntas satu peluang di tangan sebelum mengejar yang baru. Peluang yang setengah jalan hanya membuang energi. Di Pilar Diri, terdapat Fondasi Pasangan yang menjadi tempat membaca dinamika hubungan paling dekat. Isinya menunjukkan tekstur relasi yang terasa wajar bagimu, meskipun orang lain bisa menganggapnya berat.

### Tanda Kekosongan

Di Pilar Akar yang mencakup asal-usul dan latar belakangmu, terdapat Tanda Kekosongan (Void). Orang lain melihat kamu berhasil di bidang ini, tetapi kamu sendiri sering merasa belum pantas menyandangnya. Hasilnya tidak pernah kurang, namun rasa memilikinya yang tidak pernah ikut hadir. Kamu tidak pernah bersandar pada keberuntungan di bidang ini, sehingga apa pun yang kamu capai di sana, kamu bangun murni dengan kerja keras. Pengakuan orang lain tidak pernah menempel di dalam dirimu, sehingga kamu masih terus menunggu bukti berikutnya. Sebut hasil kerjamu dengan lantang, meskipun rasanya canggung.

### Penutup

Kamu adalah sosok yang tangguh dalam mengelola peluang dan beradaptasi dengan guncangan. Dengan memahami batasan energimu, kamu akan lebih mudah menyatukan hasil kerja dengan rasa kepemilikan yang selama ini terasa jauh. Langkah selanjutnya ada di tanganmu sendiri.

---

## What is NOT in this file

No verdict, and no counted differences beyond the two neutral ones in each table.
The register call is Reyner's and a summary written above the prose would frame the
read before he has done it - the same reason `qa-renders.mjs` prints its readings
unedited under a source banner and stops there.

