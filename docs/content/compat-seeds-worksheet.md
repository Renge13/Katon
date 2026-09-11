<!--
STATUS: WORKSHEET v2, Cowork drafts, 2026-09-10 (v1 superseded the same day after Reyner re-framed
the tranche). Reyner rules by rewriting in place. Nothing here ships until it is in
docs/content/compat-seeds-rulings.md (Cowork produces that from his rulings, sweeps, lands on main
alone) and applied by scripts/apply-rulings.mjs --expect 42.

WHAT THIS TRANCHE IS (Reyner, 2026-09-10, verbatim in substance):
- Scope: 21 actual compatibility fact cells x 2 fields (meaning_seed, daily_seed) = 42 strings. The
  p0 template and the three p7 penutup leads are structural, not independent facts, and get no seed.
  No more fields, no broader scope.
- Purpose: better SEMANTIC MATERIAL for the renderer, not final Indonesian copy. Division of labour:
  Claude drafts the semantic material -> Reyner rules the semantic content -> Gemini renders the
  final reading in natural Indonesian. Cowork's Indonesian does not need to be natural or polished;
  Buku Terjemahan is NOT the reference here. Gemini owns the final expression.
- meaning_seed: what the fact means BETWEEN these two people - how it shapes the interaction, what
  one person experiences from the other, what tension or ease it creates. Not a paraphrase of
  label_meaning. Tests: is the interpretation supported by the fact; does it add relational meaning
  rather than restate the mechanism; has it introduced a claim the ruled fact does not support.
  Technical terminology may appear but must not do the explanatory work by itself.
- daily_seed: a concrete, ordinary-life manifestation that makes the dynamic recognisable ("yes,
  that is the kind of thing that happens between us"). Plans, decisions, conversations, habits,
  coordination, small disagreements, timing, expectations. The scene MAY carry emotional tension or
  consequence; it must stay grounded in the ruled dynamic and not become an invented prediction.
- Semantic discipline is NOT emotional blandness. Strong wording, tension, consequence, contrast and
  synthesis are allowed when grounded in the ruled material. What is out: invented chart facts,
  arbitrary drama that fits any couple, generic relationship guidance.
- Advice / prediction / verdict are not banned as forms. Generic advice unrelated to the dynamic is
  bad; specific implications that follow from it are useful. Deterministic forecasting and invented
  events are bad; a plausible consequence of the dynamic is useful. A synthetic conclusion grounded in
  the findings is allowed; an arbitrary score or oracle claim is not. Invented life events, destiny,
  marriage/breakup predictions stay out.
- Semantic boundary (rule 14): the engine owns every fact; the model chooses words. A seed may
  interpret, contextualise and make the fact relatable; it must not silently extend the rule into a
  new metaphysical, psychological or causal claim. Plausibility is not sufficient. (The v1 draft's
  "giver can tire" on p1_produces is STRUCK on this rule: the cell supports an asymmetry, not a cost.)
- Direction-neutral cells stay neutral with "yang satu / yang lain"; provenance names the roles.
- Reyner's review criterion per seed: Is it true? Is it meaningfully relational? Is it useful to the
  renderer? Does it stay within the fact? Not: is it polished Indonesian.

SWEEP (Cowork, before Reyner saw this): the seeds may be served by the floor (lib/render/fallback.js
assembles from glossary fields) and are fed to the model as facts, so they still pass the gate's own
blocklist: compiled as lib/validate/style.js:64, 70 patterns, falsifiers fired; keyboard characters
only; 3-gram overlap seed-vs-seed and seed-vs-label_meaning. Record at the foot.
-->

# Compat glossary seeds - WORKSHEET v2 (21 cells, 42 seeds)

## Calibration (read first; the three layers the whole tranche depends on)

Cell: `p2_harm` [Kursi Bergesekan].

**label_meaning = the technical chart fact** (unchanged, already ruled):
> Terjadi gesekan halus antar kursi pasangan. Gesekan ini bekerja perlahan lewat detail kecil yang menumpuk, bukan lewat konflik besar.

**meaning_seed, BAD** - a paraphrase; the mechanism said again, nothing about what happens between the two people:
> Ada gesekan kecil di kursi pasangan kalian yang perlahan menumpuk.

**meaning_seed, GOOD** - what each experiences from the other, and the tension it creates; stays inside "small, slow, accumulating, not open conflict":
> Tidak ada benturan besar di antara kalian, tetapi ada rasa tidak nyaman yang menumpuk dari hal yang masing-masing anggap sepele. Bagi yang satu, yang lain terus mengulangi hal kecil yang sama; bagi yang lain, ia terus dinilai untuk sesuatu yang tidak penting. Yang melukai adalah pengulangannya, jauh lebih dari peristiwanya sendiri.

**daily_seed, BAD** - generic advice, then an invented forecast; neither is a scene of this dynamic:
> Bicarakan hal kecil sebelum menumpuk agar hubungan tetap sehat.
> Kalian akan sering bertengkar dan akhirnya menjauh.

**daily_seed, GOOD** - a recognisable ordinary-week scene with consequence, grounded in "small, repeated, quietly counted":
> Kebiasaan kecil yang satu, seperti membalas pesan terlambat atau lupa hal yang sudah dijanjikan, terasa biasa bagi pelakunya dan terus dicatat diam-diam oleh yang lain, sampai suatu hari ledakan soal hal sepele ternyata membawa daftar panjang yang tidak pernah diucapkan.

---

## P1 - the two Day Masters on the cycle

### p1_same [Inti Sejenis]
label_meaning: Inti diri kalian dibangun dari unsur yang sama. Sangat mudah saling paham, tapi juga rawan berbenturan di titik yang persis sama.
meaning_seed: Kalian mengenali diri sendiri di dalam dia: cara berpikir, cara marah, cara menghindar. Itu membuat rasa dipahami datang cepat dan hampir tanpa usaha. Sisi lainnya: kelemahan yang sama saling menguatkan alih-alih saling menutup, karena tidak ada yang berdiri di luar pola untuk menarik yang lain keluar.
daily_seed: Dalam pertengkaran, kalian berdua bertahan dengan cara yang sama dan mundur dengan cara yang sama, sehingga tidak ada yang lebih dulu mendinginkan suasana. Sebaliknya, saat salah satu bercerita soal masalah di luar rumah, yang lain langsung tahu apa yang dirasakan tanpa perlu dijelaskan.
ruling:

### p1_produces [Inti Menghidupi] (direction-neutral)
label_meaning: Unsur salah satu dari kalian memberi energi ke yang lain. Ada dinamika pengayom dan yang diayomi dengan alur yang konsisten.
meaning_seed: Ada arah yang jelas: energi mengalir dari yang satu ke yang lain, dan alirannya tetap dari waktu ke waktu. Bagi yang menerima, pasangannya adalah sumber dorongan dan rasa aman; bagi yang memberi, pasangannya adalah orang yang tumbuh karena dirinya. Peran ini stabil, dan justru karena stabil, keduanya jarang bertukar tempat.
daily_seed: Ketika ada keraguan sebelum mengambil keputusan, yang menguatkan hampir selalu orang yang sama. Rencana, ajakan, dan semangat untuk memulai datang dari sisi yang itu juga; sisi yang lain menyambutnya dan berjalan lebih jauh karena itu.
ruling:

### p1_controls [Inti Menekan] (direction-neutral)
label_meaning: Salah satu elemen membatasi atau mengarahkan yang lain. Bisa menghadirkan struktur, tapi juga tekanan, tergantung dinamika kendali di antara kalian.
meaning_seed: Yang satu memberi bentuk, batas, dan arah pada yang lain. Bagi yang diarahkan, ini terasa sebagai pegangan ketika ia menginginkannya dan sebagai tekanan ketika ia tidak memintanya; bagi yang mengarahkan, ini terasa sebagai tanggung jawab yang wajar dan kadang sebagai beban menjaga. Suasana hubungan ditentukan oleh apakah arahan itu disepakati atau dipaksakan.
daily_seed: Yang satu yang mengingatkan soal jadwal, pengeluaran, atau janji yang belum ditepati. Pada hari yang baik, yang lain merasa hidupnya lebih tertata karena itu; pada hari yang buruk, kalimat yang sama terdengar seperti teguran, dan percakapan berubah menjadi soal siapa yang berhak mengatur siapa.
ruling:

### p1_combination [Pasangan Inti]
label_meaning: Inti diri kalian membentuk pasangan klasik dalam BaZi. Hubungan terasa alami sejak awal tanpa hambatan komunikasi yang berarti.
meaning_seed: Rasa mengerti datang lebih dulu daripada usaha untuk saling mengenal. Di mata masing-masing, yang lain adalah orang yang mudah diajak bicara dan jarang salah menangkap maksud. Kemudahan ini adalah dasar, bukan hasil: perbedaan lain di bacaan ini tetap ada dan tidak dihapus oleh rasa akrab ini.
daily_seed: Percakapan pertama kalian terasa seperti melanjutkan obrolan yang sudah lama berjalan. Ketika yang satu bercerita setengah kalimat, yang lain sudah menangkap ke mana arahnya, dan kesalahpahaman yang biasa terjadi pada pasangan baru jarang muncul di antara kalian.
ruling:

## P2 - the two Day Branches, the seats

### p2_harmony [Kursi Terikat]
label_meaning: Kursi pasangan kalian saling mengunci. Tercipta daya tarik alami sejak awal yang bekerja secara spontan.
meaning_seed: Di ruang paling pribadi, kalian saling menarik tanpa perlu diusahakan. Bagi keduanya, yang lain terasa seperti tempat pulang yang nyaman, dan kenyamanan ini hadir sendiri bahkan saat hal lain sedang tidak beres. Justru karena bekerja sendiri, daya tarik ini mudah dianggap tidak perlu dijaga.
daily_seed: Setelah bertengkar soal hal lain, kalian tetap tidur di sisi yang sama dan bangun dengan jarak yang sudah menyusut sendiri. Setelah hari yang berat di luar, pilihan pertama kalian adalah berada di dekat satu sama lain, bahkan tanpa banyak bicara.
ruling:

### p2_clash [Kursi Berbenturan]
label_meaning: Kursi pasangan kalian saling bertolak belakang. Dinamika berjalan intens, di mana gesekan kecil bisa terasa jauh lebih tajam.
meaning_seed: Di ruang paling pribadi, kebutuhan kalian sering berlawanan arah, dan keduanya merasakannya di tempat yang paling peka. Di mata yang satu, yang lain terus menyentuh titik sensitifnya tanpa sengaja, dan hal kecil terasa lebih besar dari ukurannya karena jatuh di area itu. Suasana bisa berubah cepat, dari dekat ke tegang dan kembali lagi.
daily_seed: Perbedaan soal urusan rumah, seperti jam istirahat, kerapian, atau cara menghabiskan waktu luang, bisa berubah menjadi pertengkaran yang jauh lebih panas dari topiknya. Setelahnya, kalian berdua sering heran kenapa hal sekecil itu bisa terasa sebesar itu.
ruling:

### p2_harm [Kursi Bergesekan]
label_meaning: Terjadi gesekan halus antar kursi pasangan. Gesekan ini bekerja perlahan lewat detail kecil yang menumpuk, bukan lewat konflik besar.
meaning_seed: Tidak ada benturan besar di antara kalian, tetapi ada rasa tidak nyaman yang menumpuk dari hal yang masing-masing anggap sepele. Bagi yang satu, yang lain terus mengulangi hal kecil yang sama; bagi yang lain, ia terus dinilai untuk sesuatu yang tidak penting. Yang melukai adalah pengulangannya, jauh lebih dari peristiwanya sendiri.
daily_seed: Kebiasaan kecil yang satu, seperti membalas pesan terlambat atau lupa hal yang sudah dijanjikan, terasa biasa bagi pelakunya dan terus dicatat diam-diam oleh yang lain, sampai suatu hari ledakan soal hal sepele ternyata membawa daftar panjang yang tidak pernah diucapkan.
ruling:

### p2_punishment [Kursi Bersimpul]
label_meaning: Kursi pasangan kalian terikat pada pola masa lalu. Pola lama ini berulang di tahap berbeda jika tidak disadari bersama.
meaning_seed: Di ruang pribadi kalian ada pola lama yang masing-masing bawa dari sebelum bertemu, dan hubungan ini menjadi tempat pola itu mencari jalan untuk berulang. Reaksi yang dipicu yang satu pada yang lain terasa lebih tua dari hubungan ini sendiri. Pola ini hanya terlihat ketika kalian berdua sengaja memperhatikannya bersama; sendiri-sendiri, masing-masing hanya melihat kesalahan yang lain.
daily_seed: Pertengkaran yang berbeda topik ternyata berakhir dengan kalimat dan perasaan yang sama seperti bulan lalu. Salah satu dari kalian mengenali rasa pernah mengalami ini sebelum bisa menjelaskan kenapa, dan reaksi yang keluar lebih besar dari kejadian yang memicunya.
ruling:

### p2_reframe (the mandatory reframe; rides with clash, harm, punishment)
label_meaning: Ini bukan penentu kegagalan. Gesekan pada kursi pasangan menandakan hubungan yang membutuhkan perhatian ekstra dan kesadaran penuh.
meaning_seed: Gesekan di kursi pasangan tidak mengukur layak atau tidaknya hubungan ini, dan tidak menentukan akhirnya. Yang ia tunjukkan adalah letak perhatian yang paling dibutuhkan: area yang akan terus meminta kesadaran dari kalian berdua, bukan area yang harus dihindari.
daily_seed: Kalian mengenali dinamika ini dari seberapa cepat hal kecil dibicarakan: pada minggu yang berjalan baik, hal itu dibahas hari itu juga; pada minggu yang berat, hal itu dibawa sampai akhir pekan dan keluar dalam bentuk yang lebih besar.
ruling:

### p2_none [Kursi Independen]
label_meaning: Kursi pasangan kalian berjalan terpisah tanpa tarik-menarik khusus. Dinamika utama kalian berasal dari aspek bagan lainnya.
meaning_seed: Ruang pribadi kalian tidak saling menarik dan tidak saling menekan, jadi tidak ada percikan otomatis dan tidak ada gesekan otomatis di sana. Yang lain tidak mengganggu ruang pribadi masing-masing, dan juga tidak otomatis mengisinya. Rasa dekat atau jauh di antara kalian ditentukan oleh bagian lain dari bacaan ini, dan itu berarti kedekatan di sini adalah sesuatu yang dibangun, bukan yang ditemukan.
daily_seed: Kalian bisa menghabiskan malam di ruangan yang sama dengan kesibukan masing-masing tanpa merasa ada yang kurang, dan juga tanpa merasa perlu mendekat. Kedekatan tumbuh dari hal yang kalian kerjakan bersama; ketika kegiatan bersama berkurang, jaraknya terasa lebih cepat daripada yang kalian duga.
ruling:

### p2_palace_frame (frame; the renderer names the pillar)
label_meaning: Salah satu pilar di bagan dia terhubung langsung dengan kursi pasanganmu. Elemen hidupnya memengaruhi ranah terdekatmu.
meaning_seed: Salah satu sisi hidup dia masuk langsung ke ruang paling pribadimu tanpa dia perlu berniat begitu. Kamu mengalami bagian hidupnya itu sebagai sesuatu yang ikut tinggal di rumah kalian: ketika sisi itu tenang, rumah terasa lebih tenang; ketika sisi itu bergejolak, kamu merasakannya lebih dulu daripada orang lain di sekitarnya.
daily_seed: Saat bagian hidup dia itu sedang berat, suasananya sampai ke ruang kalian berdua pada hari yang sama, sebelum dia sempat menceritakannya. Kamu sering menjadi orang pertama yang menyadari ada yang berubah, dan kadang menanggung suasananya sebelum tahu penyebabnya.
ruling:

## P3 - what each chart holds that the other needs

### p3_supplies [Penyeimbang Unsur] (direction-neutral)
label_meaning: Dia membawa elemen yang tidak dominan di baganmu. Kehadirannya secara alami memberi keseimbangan yang kamu butuhkan.
meaning_seed: Yang satu membawa sesuatu yang bagan yang lain kekurangan, sehingga ada rasa lengkap yang tidak perlu diusahakan. Yang menerima menemukan pada pasangannya penenang di area yang biasanya membuatnya goyah; yang memberi sering tidak menyadari bahwa hal yang bagi dirinya biasa saja adalah penopang bagi yang lain. Karena tidak terlihat sebagai usaha, pemberian ini jarang mendapat pengakuan.
daily_seed: Di area itu, yang satu merasa lebih tenang hanya karena yang lain ada di sekitarnya. Cara yang lain menghadapi hal yang biasanya membuat yang satu gelisah terasa seperti penawar, dan hilangnya kehadiran itu, misalnya saat berjauhan beberapa hari, langsung terasa di area yang sama.
ruling:

### p3_same_imbalance [Tantangan Serupa]
label_meaning: Bagan kalian sama-sama minim elemen tertentu. Karena tidak ada penyeimbang otomatis di area ini, dukungan perlu dicari dari luar.
meaning_seed: Ada satu area yang kalian berdua sama-sama tidak kuat, jadi tidak ada yang bisa menopang yang lain di sana. Yang satu menoleh ke yang lain dan menemukan orang yang juga tidak punya jawabannya, sehingga area ini terasa kosong berdua. Itu bukan kesalahan siapa pun. Yang dijelaskannya adalah kenapa urusan tertentu terus tertunda di antara kalian.
daily_seed: Urusan di area itu sering tertunda karena kalian berdua sama-sama menghindarinya, dan ketika akhirnya dibicarakan, keduanya menunggu yang lain mengambil langkah pertama. Yang menggerakkannya biasanya orang di luar hubungan ini, seperti keluarga atau teman, atau keadaan yang tidak bisa ditunda lagi.
ruling:

### p3_no_supply [Mandiri Elementar]
label_meaning: Tidak ada aliran elemen khusus yang saling mengisi. Hubungan berjalan mandiri tanpa rasa saling tergantung secara energi.
meaning_seed: Tidak ada yang menutup kekurangan yang lain, jadi masing-masing tetap utuh seperti sebelum bertemu. Yang lain tampak berdiri sendiri dan tidak membutuhkan pasangannya untuk merasa lengkap; ini melegakan bagi yang menghargai ruang dan bisa terasa dingin bagi yang ingin dibutuhkan. Rasa saling butuh, kalau ada, datang dari pilihan dan tidak dari kekurangan.
daily_seed: Kalian bisa menjalani minggu yang sibuk dengan jadwal terpisah dan bertemu lagi seperti tidak pernah terputus. Yang membuat kalian kembali adalah keinginan, bukan kebutuhan, dan pertanyaan yang kadang muncul diam-diam di antara kalian adalah apakah yang lain sungguh memerlukan dirinya.
ruling:

## P4 - the pattern badge (Katon's own framework, ranks nothing)

### p4_matching [Pola Cermin]
label_meaning: Aspek dominan di bagan kalian identik. Saling memahami terjadi cepat, namun hal yang memicu kekesalan biasanya adalah refleksi diri sendiri.
meaning_seed: Kalian menilai dunia dengan ukuran yang sama, jadi keputusan besar jarang perlu diperdebatkan dan masing-masing merasa dimengerti tanpa banyak penjelasan. Yang mengganggu dari dia biasanya adalah sisi dirimu sendiri yang kamu lihat dari luar, dan itulah kenapa kekesalan di antara kalian terasa lebih pribadi daripada seharusnya.
daily_seed: Kalian saling mengeluhkan hal yang sama tentang orang lain, dan ketika suasana sedang buruk, hal yang sama itu pula yang kalian keluhkan tentang satu sama lain. Sifat dia yang paling cepat memicu kesal adalah sifat yang orang lain juga sebut ada padamu.
ruling:

### p4_related [Pola Serumpun]
label_meaning: Karakter dominan kalian berakar dari rumpun yang sama dengan pendekatan berbeda. Tujuan akhir serupa, meski dieksekusi lewat cara berbeda.
meaning_seed: Kalian menginginkan hal yang sama, tetapi menempuhnya lewat jalan yang berbeda. Yang lain menjadi sekutu dalam tujuan dan pengganggu dalam cara; ketegangan yang muncul hampir selalu soal urutan, tempo, atau metode, hampir tidak pernah soal arah. Karena perbedaannya ada di cara dan tidak di tujuan, ia bisa dibicarakan sampai selesai.
daily_seed: Saat merencanakan sesuatu bersama, kalian sepakat soal hasilnya dalam hitungan menit, lalu menghabiskan sisa malam berdebat soal urutan langkahnya. Keduanya merasa sudah mengalah karena tujuannya sama, dan keduanya heran kenapa yang lain masih keras soal cara.
ruling:

### p4_contrasting [Pola Kontras]
label_meaning: Karakter dominan kalian berasal dari kelompok berbeda. Cara pandang yang berbeda bisa memperluas perspektif jika dikomunikasikan terbuka.
meaning_seed: Kalian memandang situasi yang sama dari sudut yang berbeda, sehingga masing-masing melihat hal yang tidak dilihat yang lain. Saat dibicarakan, yang lain membuka sudut pandang baru; saat dipendam, yang lain menjadi sulit dibaca. Perbedaan ini memperluas pandangan ketika diucapkan dan mempersempitnya ketika dipendam, karena yang dipendam mudah disalahartikan sebagai penolakan.
daily_seed: Menghadapi kabar yang sama, kalian menangkap hal yang berbeda lebih dulu, dan pulang dari acara yang sama dengan cerita yang terasa seperti dua acara berbeda. Percakapan terbaik kalian terjadi saat perbedaan itu dibandingkan dengan rasa penasaran; percakapan terburuk terjadi ketika salah satu menyimpulkan bahwa yang lain tidak peduli.
ruling:

## P5 - the quadrant (no score is ever shown)

### p5_q1 [Tarikan Kuat, Ritme Seirama]
label_meaning: Chemistry terasa kuat dan rutinitas harian saling menopang. Kuncinya adalah menjaga keterbukaan agar kenyamanan tidak dianggap biasa.
meaning_seed: Rasa tertarik dan ritme keseharian berjalan searah, sehingga hubungan ini terasa ringan dijalani, dan yang lain terasa mudah dijalani sekaligus tetap menarik. Risikonya justru di situ: hal yang mudah jarang diperiksa, dan kenyamanan bisa berubah menjadi anggapan bahwa semuanya akan selalu begitu tanpa perlu diucapkan.
daily_seed: Rutinitas kecil seperti sarapan atau perjalanan pulang terasa menyenangkan tanpa perlu direncanakan, dan di tengah pekan yang penuh kalian tetap menemukan waktu berdua tanpa membicarakannya lebih dulu. Yang jarang terjadi justru percakapan tentang hubungan itu sendiri, karena tidak ada yang terasa perlu dibicarakan.
ruling:

### p5_q2 [Tarikan Kuat, Ritme Bergesek]
label_meaning: Magnet hubungan sangat kuat, namun pola keseharian sering bersimpangan. Dinamika terasa pekat dan menuntut kompromi jelas dalam rutinitas.
meaning_seed: Kalian saling menarik dengan kuat, tetapi cara kalian menjalani hari tidak berjalan seiring. Bagi keduanya, yang lain adalah orang yang paling diinginkan dan paling melelahkan sekaligus, karena rasa dekat dan rasa lelah datang dari sumber yang sama. Tanpa kesepakatan yang jelas soal rutinitas, tarikan yang kuat ini menghabiskan tenaga yang seharusnya menopangnya.
daily_seed: Malam berdua terasa hangat, lalu pagi berikutnya jam bangun, cara makan, atau kebiasaan kerja kembali bertabrakan. Minggu kalian bergantian antara sangat dekat dan sangat lelah, dan pertengkaran paling sering muncul soal hal kecil yang berulang setiap hari, bukan soal hal besar.
ruling:

### p5_q3 [Tarikan Tenang, Ritme Seirama]
label_meaning: Rutinitas harian mengalir stabil meski tarikan emosional tumbuh bertahap. Hubungan berjalan tenang tanpa banyak gejolak luar.
meaning_seed: Keseharian kalian mudah dijalani bersama, sementara rasa tertarik tumbuh perlahan lewat kebersamaan itu. Yang lain lebih dulu menjadi orang yang bisa diandalkan, dan baru kemudian menjadi orang yang dirindukan. Hubungan ini lebih terasa sebagai ketenangan daripada gejolak, dan ketenangan itu bisa disalahartikan sebagai kurangnya rasa, padahal rasanya tumbuh di tempat yang tidak ribut.
daily_seed: Kalian jarang punya cerita dramatis untuk diceritakan ke teman, tetapi rumah terasa tertata dan minggu berjalan tanpa banyak kejutan. Rasa sayang terlihat dari hal yang dikerjakan, lebih dari yang diucapkan, dan kadang salah satu bertanya dalam hati apakah tenang seperti ini sudah cukup, lalu menemukan jawabannya justru di hari-hari biasa.
ruling:

### p5_q4 [Tarikan Tenang, Ritme Bergesek]
label_meaning: Tarikan alami minim dan ritme harian membutuhkan penyesuaian. Kelangsungan hubungan murni digerakkan oleh komitmen dan keputusan sadar.
meaning_seed: Tidak banyak yang otomatis di hubungan ini: rasa tertarik tidak datang sendiri dan keseharian tidak langsung seiring. Yang lain adalah pilihan yang harus diambil ulang, bukan arus yang membawa, dan itu berarti hubungan ini berdiri pada keputusan sadar kalian berdua. Kekuatannya adalah bahwa setiap langkahnya disengaja; kerentanannya adalah bahwa ia tidak menahan dirinya sendiri saat keduanya lelah.
daily_seed: Waktu berdua harus dijadwalkan agar terjadi, dan penyesuaian kecil soal kebiasaan dibicarakan alih-alih terjadi sendiri. Ketika jadwal padat, hubungan ini terasa seperti janji yang dipegang, dan minggu-minggu saat tidak ada yang sengaja mengulurkan tangan terasa lebih jauh daripada minggu-minggu lain.
ruling:

---

## Sweep record (Cowork, 2026-09-10, v2, before Reyner saw this)

Instrument `sweep-seeds.mjs`: blocklist compiled as `lib/validate/style.js:64` (70 patterns), plus
non-keyboard, dash/curly/question mark, `bukan X tapi/melainkan Y`, `secara <adverb>`, and 3-gram
overlap seed-vs-seed and seed-vs-every-label_meaning. Falsifiers 6/6 fired.

42 seeds parsed, 35-61 words each. Blocklist first pass: 2 hits - `p2_reframe.meaning_seed`
"meramalkan" (the ramalan pattern, rule 25) and `p3_same_imbalance.meaning_seed` a `bukan ...
tetapi` construction; both reworded; 0/42 after. Non-keyboard 0. Question marks 0.

Structural finding, fixed: the first v2 draft used "masing-masing mengalami yang lain sebagai orang
yang" in 15 of 21 meaning_seeds. One cell per beat lands in every reading, so the floor would have
said it five times and the renderer would have learned it as a template (renderer-prompt-notes, Run
1: "the template beat the instruction"). Varied per cell; 0 occurrences remain. Remaining 3-gram
overlaps are connective tissue only ("yang lain adalah", "di antara kalian"); the one substantive
pair left (p2_clash / p2_harm "yang lain terus") cannot co-occur - the seat variants are exclusive.

Not swept, by design: the calibration BAD examples.

Cowork's own flags for Reyner's eye - consequences drawn from the cell, not stated in it (no marker
in the text; judge on his "plausibility is not sufficient" criterion):
- p2_none.daily_seed, last clause "jaraknya terasa lebih cepat" - consequence of "no automatic pull".
- p3_supplies.meaning_seed "jarang mendapat pengakuan" - consequence of "terasa alami".
- p5_q3.meaning_seed "bisa disalahartikan sebagai kurangnya rasa" - consequence of "tenang".
- p5_q4.meaning_seed "tidak menahan dirinya sendiri saat keduanya lelah" - flip side of "digerakkan
  murni oleh komitmen".
