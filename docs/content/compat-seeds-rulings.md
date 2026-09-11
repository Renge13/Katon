<!--
STATUS: RULED. Reyner, 2026-09-10. Cowork drafted (docs/content/compat-seeds-worksheet.md, v2), Reyner
rewrote all 42, Cowork swept. Lands on main ALONE before the PR that applies it (the #28 ruling), then:
  node scripts/apply-rulings.mjs docs/content/compat-seeds-rulings.md --expect 42
Apply on a tree where glossary.json#kompatibilitas already holds the 21 cells (it does since X-b2);
the script inserts the two new fields at the end of each cell (no cost_seed anchor in this section).

WHAT THESE ARE (Reyner's ruling, 2026-09-10): SEMANTIC MATERIAL for the renderer, not final copy.
label_meaning = the technical chart fact (unchanged here). meaning_seed = what the fact means BETWEEN
the two people. daily_seed = a concrete ordinary-life manifestation that makes the dynamic
recognisable. Gemini owns the final Indonesian; the renderer preserves the IDEA and invents no
interpretation (rule 14). Scope is exactly 21 fact cells x 2 = 42. p0_opening and the three p7_*_lead
keys are structural and carry no seed by ruling.

VERBATIM MEANS VERBATIM. Reyner is the sole authority. Do not adjust punctuation, capitalisation or
spacing to match a neighbouring string.

RULINGS THAT TRAVEL WITH THE STRINGS:
- Direction-neutral cells (p1_produces, p1_controls, p3_supplies) name roles, not people; provenance
  says who. The renderer names who from `provenance`.
- p2_reframe rides with p2_clash / p2_harm / p2_punishment (safety_flags.p2_reframe_required).
- p2_palace_frame is a frame; the renderer names the pillar.
- Reyner's four consequence rulings on Cowork's flags: p2_none.daily_seed KEEP (logical consequence
  of no automatic pull/friction); p3_supplies.meaning_seed TIGHTENED (balance dynamic, not the
  giver's psychology); p5_q3.meaning_seed KEEP; p5_q4.meaning_seed KEEP.

SWEEP (Cowork, 2026-09-10/11, `sweep-rulings.mjs`: parsed with the repo's own parseRulings, blocklist
compiled as lib/validate/style.js:64 = 70 patterns, falsifiers 5/5 fired, plus keyboard-only,
dash/curly/?, bukan..tapi, secara-adverbial, 3-gram overlaps). apply-rulings --dry against a copy of
glossary.json: 42 parsed and verified; --expect 41 REFUSED (count guard fires). 42 seeds, 15-28 words,
max 203 chars (ceiling 600). Non-keyboard 0, question marks 0, bukan..tapi 0, seed~seed substantive
overlap 0. LIVE BLOCKLIST HITS: 0/42 (final).

AMENDMENTS BY REYNER, 2026-09-11, on Cowork's sweep flags (all his wording, verbatim below):
- p4_related.meaning_seed: "tujuan akhir selaras" fired the `selaras` pattern (Stage 6). Reyner first
  chose "sejalan", then rewrote the whole seed ("gelombang yang sama ... bertolak belakang"). Clean.
- p3_no_supply.meaning_seed: rewritten for relational meaning (Flag 3). The rewrite introduced
  "saling melengkapi", which fires the `saling melengkapi` pattern (the lookbehind exempts only
  tidak/belum/kurang directly before it; "tuntutan" in between does not). Reyner amended to
  "tidak ada tuntutan untuk saling mengisi". Clean.
- p5_q4.meaning_seed: rewritten for relational meaning (Flag 3). Clean.
Flags 1 and 3 CLOSED. Flag 2 stands as an observation: six seeds carry a `secara <adverb>`
(p1_combination klasik, p2_harmony otomatis, p3_supplies alami, p3_no_supply utuh, p5_q1 emosional,
p5_q4 sengaja). Not on the live blocklist (style.adverbial deleted 2026-08-17); the renderer prompt
asks the model to avoid the form. Semantic material, Gemini rewrites; left as ruled.
-->

# glossary.json#kompatibilitas - 21 cells x 2 seeds, RULED

## kompatibilitas.p1_same

- meaning_seed: "Inti diri yang sama membuat pemahaman datang instan, tapi titik buta dan kelemahan yang sama berlipat ganda karena tidak ada yang berdiri di luar pola."
- daily_seed: "Saat berkonflik, kalian memakai strategi bertahan yang sama sehingga tidak ada yang mendinginkan suasana. Namun saat ada masalah luar, kalian paham perasaan satu sama lain tanpa penjelasan."

## kompatibilitas.p1_produces

- meaning_seed: "Alur energi berjalan searah dan stabil dari satu pihak ke pihak lain. Yang memberi menjadi sumber dorongan, yang menerima mendapat rasa aman; peran ini konsisten dan jarang berbalik."
- daily_seed: "Keputusan dan inisiatif baru hampir selalu dipicu oleh orang yang sama. Yang lain menyambut, mengeksekusi, dan merasa aman bergerak dalam alur tersebut."

## kompatibilitas.p1_controls

- meaning_seed: "Yang satu memberi batas dan arah, yang lain menjadi sasaran pembentukan. Terasa menenangkan saat butuh pegangan, tapi terasa menekan jika kendali dipaksakan."
- daily_seed: "Satu orang rutin mengingatkan jadwal atau janji. Di hari baik ini terasa seperti keteraturan, di hari buruk ini memicu perdebatan soal siapa yang berhak mengatur siapa."

## kompatibilitas.p1_combination

- meaning_seed: "Hubungan terasa akrab dari awal karena pola inti yang saling mengunci secara klasik. Komunikasi mengalir alami tanpa hambatan pemahaman dasar."
- daily_seed: "Obrolan pertama terasa seperti melanjutkan percakapan lama. Setengah kalimat diucapkan, pihak lain sudah tahu ujungnya, meminimalkan salah paham dasar."

## kompatibilitas.p2_harmony

- meaning_seed: "Tarikan alami bekerja di ruang paling privat. Ada rasa aman dan tempat pulang yang selalu menarik kalian berdua kembali, terlepas dari dinamika di luar."
- daily_seed: "Setelah pertengkaran atau hari yang berat di luar, kalian secara otomatis mencari keberadaan satu sama lain tanpa perlu dorongan kata-kata."

## kompatibilitas.p2_clash

- meaning_seed: "Kebutuhan privat kalian berbenturan langsung. Gesekan terasa intens karena menyenggol area paling sensitif, membuat hal kecil cepat membesar."
- daily_seed: "Perbedaan kebiasaan rumah tangga atau ruang pribadi cepat berubah menjadi adu argumen panas yang skalanya terasa berlebihan dibanding topik aslinya."

## kompatibilitas.p2_harm

- meaning_seed: "Gesekan tidak hadir lewat ledakan besar, melainkan rasa tidak nyaman halus yang menumpuk dari detail kecil yang diabaikan salah satu pihak."
- daily_seed: "Kebiasaan kecil yang dianggap sepele oleh satu orang dicatat diam-diam oleh yang lain, sampai akhirnya keluar menjadi tumpukan kekecewaan."

## kompatibilitas.p2_punishment

- meaning_seed: "Hubungan ini memicu kembali pola emosional lama yang dibawa masing-masing. Reaksi yang muncul sering kali lebih tua dan pekat daripada pemicunya sendiri."
- daily_seed: "Konflik topik baru selalu berujung pada pola argumen dan rasa sakit yang sama persis, seolah mengulang skenario lama yang belum selesai."

## kompatibilitas.p2_reframe

- meaning_seed: "Benturan pada kursi pasangan menandakan titik yang menuntut kesadaran ekstra, bukan vonis kelayakan atau ketidakcocokan hubungan."
- daily_seed: "Saat kesadaran tinggi, gesekan langsung dibahas hari itu juga. Saat lelah, gesekan dipendam sampai menjadi percikan yang lebih besar."

## kompatibilitas.p2_none

- meaning_seed: "Ruang pribadi berjalan independen tanpa daya tarik atau gesekan otomatis dari pilar ini. Kedekatan tidak terjadi spontan, melainkan dibangun dari area lain."
- daily_seed: "Kalian bisa berada di ruang yang sama dalam kesibukan masing-masing tanpa gangguan, namun jarak emosional cepat terasa jika tidak ada kegiatan bersama."

## kompatibilitas.p2_palace_frame

- meaning_seed: "Salah satu pilar kehidupan pasangan menyentuh langsung ruang privatmu, membuat dinamika dari area hidupnya berdampak langsung ke suasana hubungan."
- daily_seed: "Saat area hidup pasangan tersebut mengalami tekanan, suasananya langsung terbawa ke rumah dan kamu merasakannya sebelum dia sempat cerita."

## kompatibilitas.p3_supplies

- meaning_seed: "Salah satu membawa elemen yang absen di bagan pasangannya, memberikan rasa seimbang dan tenang di area yang tadinya rawan rapuh."
- daily_seed: "Kehadiran pasangan secara alami meredakan kegelisahan di area tertentu, sehingga ketiadaannya langsung membuat area tersebut terasa tidak stabil."

## kompatibilitas.p3_same_imbalance

- meaning_seed: "Keduanya memiliki titik kosong elemen yang sama, sehingga tidak ada penopang otomatis di area tersebut dan butuh kesadaran atau bantuan luar."
- daily_seed: "Keputusan di area tertentu sering tertunda karena kalian berdua sama-sama menghindar, sampai ada dorongan dari keadaan atau pihak luar."

## kompatibilitas.p3_no_supply

- meaning_seed: "Masing-masing mempertahankan ruang energinya secara utuh. Hubungan terasa ringan karena tidak ada tuntutan untuk saling mengisi, namun bisa terasa terpisah jika tidak ada area yang sengaja dibangun bersama."
- daily_seed: "Keduanya bisa menjalani kesibukan terpisah tanpa rasa kehilangan penopang, di mana kebersamaan didasari oleh pilihan murni, bukan kebutuhan energi."

## kompatibilitas.p4_matching

- meaning_seed: "Aspek dominan yang identik membuat cara pandang sama, namun hal yang paling mengesalkan dari pasangan biasanya adalah cerminan dari kelemahan diri sendiri."
- daily_seed: "Kalian sepakat menilai pihak luar, tapi saat berkonflik, hal yang paling memicu kekesalan adalah sifat pasangan yang juga kamu miliki."

## kompatibilitas.p4_related

- meaning_seed: "Kalian berada di gelombang yang sama soal hasil akhir, tetapi ritme dan cara mencapainya sering bertolak belakang."
- daily_seed: "Cepat sepakat soal target akhir, tapi menghabiskan waktu berdebat soal urutan langkah dan cara mencapainya."

## kompatibilitas.p4_contrasting

- meaning_seed: "Sudut pandang dasar berbeda memberikan perspektif baru jika dikomunikasikan, namun rawan disalahartikan jika dibiarkan tanpa penjelasan."
- daily_seed: "Merespons kabar atau kejadian yang sama dengan fokus yang berbeda total, menghasilkan dua interpretasi yang berseberangan dari satu peristiwa."

## kompatibilitas.p5_q1

- meaning_seed: "Chemistry tinggi dan ritme harian berjalan seiring, menciptakan hubungan yang terasa ringan sekaligus tetap menarik secara emosional."
- daily_seed: "Rutinitas harian mengalir tanpa hambatan dan waktu berkualitas tercipta alami, membuat hubungan jarang diterpa gejolak."

## kompatibilitas.p5_q2

- meaning_seed: "Magnet emosional kuat bertemu dengan ritme harian yang sering bersimpangan, menghasilkan dinamika yang pekat, intens, sekaligus melelahkan."
- daily_seed: "Momen berdua terasa sangat dekat, tapi urusan ritme harian dan kebiasaan kecil berulang kali memicu gesekan teknis."

## kompatibilitas.p5_q3

- meaning_seed: "Ritme harian sangat seirama sementara daya tarik emosional tumbuh bertahap lewat ketenangan dan rasa saling mengandalkan."
- daily_seed: "Hari-hari berjalan stabil dan teratur tanpa cerita dramatis, di mana rasa sayang lebih banyak terwujud dalam tindakan nyata daripada kata-kata."

## kompatibilitas.p5_q4

- meaning_seed: "Ketiadaan dorongan otomatis membuat hubungan tidak berjalan dengan sendirinya; keberlanjutannya murni lahir dari niat dan pilihan sadar yang diperbarui setiap hari."
- daily_seed: "Kebersamaan dan penyesuaian harus dijadwalkan secara sengaja; jika tidak ada inisiatif aktif, hubungan mudah terasa berjarak."
