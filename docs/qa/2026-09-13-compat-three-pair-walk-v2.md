# Compat reading, three pairs: round 1 / round 2

walk v2 | gate 1.24.0 | round 2 prompt 6e7b2997b97c40a3
round 1 column is QUOTED from docs/qa/2026-09-11-compat-three-pair-walk.md (prompt fcdd1dd95968be52), never re-rendered
3 pairs, up to 2 draws each if the first floors

## READ THIS FIRST, THEN THE PROSE

**The worked example did its job and then did too much of it.** Round 2 put one
RULED block in the prompt (B3) because prohibition without demonstration had not
worked. The model learned the move: the direction is resolved, the reader is
`kamu`, the daily beat is a scene. It also learned the sentences.

Measured on the instrument B3 asked for
(`node scripts/count-seed-runs.mjs --prose <this file> --column "round 2"`):

| | round 1 | round 2 | target |
|---|---|---|---|
| ruled seeds with their first nine words verbatim | 13/42 | **9/42** | <= 3/42 |
| nine-word runs from the B3 example reproduced | 0 | **38** | 0 |

**Compare the `p1_stem_relation` block of 1x2 and of Y-1 below. They are word for
word the same block**, and both are the prompt's example with the element names
swapped. Two different pairs, one sentence. That is not a reading.

One draw of Y-1 floored and was drawn again; both are below. The seed figure sat at 7/42 and 9/42 across three runs of this page, so treat it as "down from 13, nowhere near 3". The 38 held across all three, so it is the prompt and not a draw.

**The round-1 figure that was published was 10/42 and it is wrong.** It was
computed ad hoc and never committed; the counting is written down now and gives
13/42 normalised, 8/42 as a raw substring, and no rule tried returns 10. The
round-1 artifact is NOT re-stamped - it records what was measured. The direction
of the round-1 finding is unchanged and slightly stronger.

## WHAT ELSE THE RUN SAYS (n=20, two draws, `2026-09-13-compat-voice-round2b-*`)

Won, cleanly:

- `p0_model_wrote_anyway` **0/20 attempts**. Told not to write an opening, the
  model never wrote one. 3c's prompt half holds without the engine having to
  argue with it.
- `pair.penutup_register` **2/20 served readings**. Both round-1 penutups in the
  v1 walk would have fired; the closings now talk to the reader.
- `pair.direction_resolved` **3/20 served readings**. Round 1 lost the direction
  in 3 of 3 direction-carrying blocks.

Lost:

- **Floor rate 5/20** (4/10 then 1/10), against 3/10 at round 1 and 1/10 at
  baseline. B4's target was <= 1/20. Every floored pair spent its whole budget
  (`stage6_budget_spent`); none was a provider or spend-guard floor.
- `style.hedging` is in almost every one, and the literal is `cenderung`, in the
  MEANING sentence rather than the daily beat. B4's line is scoped to the daily
  beat, so it was pointed at the wrong sentence. The seeds are not the source: a
  sweep of all 67 ruled compat strings against the 70 live patterns returns one
  hit, the `{` in the opening template, which `sweepableGlossary()` handles.
- `style.hedge_construction` fires on `bukan vonis ..., melainkan ...` - which is
  the P2 reframe idea said in the banned shape. **This is not round 2's and it is
  not new.** The prompt's own P2 line ("A clash is never a verdict. It is a map
  ... not a judgment on it") asks for the meaning that most naturally lands as
  `bukan X melainkan Y`. Recorded as a standing conflict between a ruled
  requirement and a live pattern, for its own ruling.

## ONE DEFECT IN THIS PR WAS CAUGHT AND FIXED BEFORE THIS RUN

The first walk-v2 run rejected `style.unsanctioned_bracket` on 3 of 3 pairs:
`(Gunung)`, `(Samudra)`, `(Taman)`. The cause was round 2's own B2 text, which
told the model to write `dia (Taman)` - a bracket around a name, which rule 23
reserves for the English pair of a glossary term. The instruction asked for a
construction the gate rejects. Fixed to apposition (`dia, Taman,`); the bracket
appears in neither post-fix draw. Prompt `0bab7b55609aa60f` ->
`6e7b2997b97c40a3`, and the three pre-fix draws are kept and indexed as what
they are.

## WHAT THIS DOES NOT ESTABLISH

The floor and baseline columns are not re-rendered here - they are in v1 and
neither has moved. A difference between the two columns below is round 2 plus one
draw of variance, on three pairs; the rates above come from the n=20 run, not
from this page. No round-2 draw on these three pairs floored, so the floor rate
in the rates section is not visible in the prose.

## 1x2   A Matahari · B Gunung

### round 1  (quoted from v1, prompt fcdd1dd95968be52)
```
p0_opening
      Ini adalah bacaan tentang dua individu: Matahari dan Gunung. Keduanya membawa energi dasar yang berbeda dalam cara mereka berinteraksi dengan dunia.

    p1_stem_relation
      Inti menghidupi adalah dinamika di mana unsur salah satu dari kalian memberi energi ke yang lain. Alur energi berjalan searah dan stabil dari satu pihak ke pihak lain. Yang memberi menjadi sumber dorongan, sementara yang menerima mendapat rasa aman. Peran ini konsisten dan jarang tertukar. Keputusan dan inisiatif baru hampir selalu dipicu oleh orang yang sama, sementara yang lain menyambut, mengeksekusi, dan merasa aman bergerak dalam alur tersebut.

    p2_day_pair
      Kursi Independen berarti ruang pribadi kalian berjalan terpisah tanpa tarik-menarik otomatis. Kedekatan tidak terjadi spontan, melainkan dibangun dari area lain. Kalian bisa berada di ruang yang sama dalam kesibukan masing-masing tanpa gangguan, namun jarak emosional cepat terasa jika tidak ada kegiatan bersama. Selain itu, salah satu pilar di bagan pasangan menyentuh langsung ruang privatmu. Dinamika dari area hidupnya berdampak langsung ke suasana hubungan. Saat area hidup pasangan tersebut mengalami tekanan, suasananya langsung terbawa ke rumah dan kamu merasakannya sebelum dia sempat cerita.

    p3_supply
      Dia membawa elemen yang tidak dominan di baganmu. Kehadirannya secara alami memberi keseimbangan yang kamu butuhkan. Kehadiran pasangan meredakan kegelisahan di area tertentu, sehingga ketiadaannya membuat area tersebut terasa tidak stabil.

    p4_temperament
      Karakter dominan kalian berasal dari kelompok berbeda. Sudut pandang dasar yang berbeda memberikan perspektif baru jika dikomunikasikan, namun rawan disalahartikan jika dibiarkan tanpa penjelasan. Kalian merespons kabar atau kejadian yang sama dengan fokus yang berbeda total, menghasilkan dua interpretasi yang berseberangan dari satu peristiwa.

    p5_pull_fit
      Magnet hubungan sangat kuat, namun pola keseharian sering bersimpangan. Dinamika terasa pekat dan menuntut kompromi jelas dalam rutinitas. Momen berdua terasa sangat dekat, tapi urusan ritme harian dan kebiasaan kecil berulang kali memicu gesekan teknis.

    penutup
      Hubungan ini meminta Matahari untuk belajar melambat dan memberi ruang bagi ritme yang lebih tenang. Gunung diminta untuk lebih terbuka dalam mengomunikasikan kebutuhan pribadinya agar tidak terjadi kesalahpahaman dari perbedaan perspektif.
```

### round 2, draw 1
```
    p0_opening
      Ini adalah bacaan tentang dua individu: Matahari dan Gunung.

    p1_stem_relation
      Unsur Api milikmu memberi energi ke unsur Tanah miliknya dengan alur yang stabil. Kamu menjadi sumber dorongan, sementara dia menerima dan merasa aman bergerak di dalamnya. Dalam seminggu biasa, ini terlihat dari siapa yang membuka pembicaraan soal rencana baru: hampir selalu kamu. Dia menyambut, lalu mengeksekusinya dengan tenang. Peran ini konsisten dan jarang berbalik.

    p2_day_pair + p2_palace_frame
      Kursi pasangan kalian berjalan independen tanpa daya tarik atau gesekan otomatis. Kedekatan tidak terjadi spontan, melainkan harus dibangun dari area lain. Namun, salah satu pilar kehidupan dia menyentuh langsung ruang privatmu, membuat dinamika dari area hidupnya berdampak langsung ke suasana hubungan. Saat area hidupnya mengalami tekanan, suasananya langsung terbawa ke rumah dan kamu merasakannya sebelum dia sempat bercerita.

    p3_supply
      Dia membawa unsur Kayu yang tidak dominan di baganmu. Kehadirannya secara alami memberi keseimbangan yang kamu butuhkan di area yang tadinya rawan rapuh. Kehadiran dia meredakan kegelisahanmu, sehingga ketiadaannya membuat area tersebut terasa tidak stabil.

    p4_temperament
      Karakter dominan kalian berasal dari kelompok berbeda. Sudut pandang dasar yang berbeda ini memberikan perspektif baru jika dikomunikasikan, namun rawan disalahartikan jika dibiarkan tanpa penjelasan. Kalian sering merespons kabar atau kejadian yang sama dengan fokus yang berbeda total, menghasilkan dua interpretasi yang berseberangan dari satu peristiwa.

    p5_pull_fit
      Magnet emosional antara kalian sangat kuat, namun ritme harian sering bersimpangan. Dinamika ini terasa pekat, intens, sekaligus melelahkan. Momen berdua terasa sangat dekat, tapi urusan ritme harian dan kebiasaan kecil berulang kali memicu gesekan teknis.

    penutup
      Hubungan ini meminta kamu untuk lebih sabar dalam menyelaraskan ritme harian yang sering bersimpangan dengan dia, Gunung. Kamu diminta untuk menyadari bahwa perbedaan sudut pandang yang dia bawa adalah ruang untuk memperluas perspektif, bukan hambatan. Gunakan dorongan energimu untuk menciptakan alur yang menenangkan bagi dia, sementara kamu belajar menerima bahwa dia memiliki cara sendiri dalam merespons dunia.
```

## 2x6   A Gunung · B Samudra

### round 1  (quoted from v1, prompt fcdd1dd95968be52)
```
p0_opening
      Ini adalah bacaan tentang dua individu: Gunung dan Samudra.

    p2_day_pair
      Kursi pasangan kalian saling bertolak belakang. Dinamika berjalan intens, di mana gesekan kecil bisa terasa jauh lebih tajam.

    p2_reframe
      Ini bukan penentu kegagalan. Gesekan pada kursi pasangan menandakan hubungan yang membutuhkan perhatian ekstra dan kesadaran penuh.

    p2_palace_frame
      Salah satu pilar di bagan dia terhubung langsung dengan kursi pasanganmu. Elemen hidupnya memengaruhi ranah terdekatmu.

    p3_supply
      Dia membawa elemen yang tidak dominan di baganmu. Kehadirannya secara alami memberi keseimbangan yang kamu butuhkan.

    p4_temperament
      Karakter dominan kalian berasal dari kelompok berbeda. Cara pandang yang berbeda bisa memperluas perspektif jika dikomunikasikan terbuka.

    p5_pull_fit
      Chemistry terasa kuat dan rutinitas harian saling menopang. Kuncinya adalah menjaga keterbukaan agar kenyamanan tidak dianggap biasa.
```

### round 2, draw 1

rejections on the way here, with the literal that fired:
  - style.hedging: /\bcenderung\b/ at ", gesekan cenderung dipendam sampai menjadi percik"
  - style.hedge_construction: /\bbukan\b(?!\s+berarti\b)[^.!?]{0,140}?\b(tapi|melainkan)\b/ at "turan ini bukan vonis ketidakcocokan, melainkan ti"
```
    p0_opening
      Ini adalah bacaan tentang dua individu: Gunung dan Samudra.

    p1_stem_relation
      Unsur Tanah milikmu memberi batas dan arah bagi unsur Air miliknya. Kamu menjadi pihak yang membentuk, sementara dia menjadi sasaran pembentukan. Dinamika ini terasa menenangkan saat dia membutuhkan pegangan, namun terasa menekan jika kendali dipaksakan. Dalam seminggu biasa, kamu rutin mengingatkan jadwal atau janji. Di hari baik, ini terasa seperti keteraturan, namun di hari buruk, ini memicu perdebatan soal siapa yang berhak mengatur siapa.

    p2_day_pair + p2_reframe + p2_palace_frame
      Kursi pasangan kalian saling berbenturan, yang menandakan titik tuntutan kesadaran ekstra, bukan vonis ketidakcocokan. Kebutuhan privat kalian sering bersinggungan langsung, membuat gesekan terasa intens dan hal kecil cepat membesar. Salah satu pilar kehidupan dia juga menyentuh langsung ruang privatmu, sehingga dinamika dari area hidupnya berdampak langsung ke suasana hubungan.
      Saat area hidupnya mengalami tekanan, suasananya terbawa ke rumah dan kamu merasakannya sebelum dia sempat bercerita. Perbedaan kebiasaan rumah tangga atau ruang pribadi sering berubah menjadi adu argumen panas yang skalanya terasa berlebihan dibanding topik aslinya. Saat kesadaran tinggi, gesekan ini dibahas hari itu juga, namun saat lelah, gesekan dipendam sampai menjadi percikan yang lebih besar.

    p3_supply
      Kalian saling membawa elemen yang absen di bagan masing-masing, memberikan rasa seimbang di area yang tadinya rawan rapuh. Dia membawa unsur Air yang kamu butuhkan, sementara kamu membawa unsur Logam yang dia perlukan. Kehadiran pasangan secara alami meredakan kegelisahan di area tertentu, sehingga ketiadaannya membuat area tersebut terasa tidak stabil.

    p4_temperament
      Karakter dominan kalian berasal dari kelompok berbeda, di mana kamu membawa Aspek Pendamping dan dia membawa Aspek Peraih. Sudut pandang dasar yang berbeda ini memberikan perspektif baru jika dikomunikasikan, namun rawan disalahartikan jika dibiarkan tanpa penjelasan. Dalam keseharian, kalian sering merespons kabar atau kejadian yang sama dengan fokus yang berbeda total, menghasilkan dua interpretasi yang berseberangan dari satu peristiwa.

    p5_pull_fit
      Chemistry antara kalian terasa tinggi dan ritme harian berjalan seiring, menciptakan hubungan yang terasa ringan sekaligus tetap menarik secara emosional. Rutinitas harian mengalir tanpa hambatan dan waktu berkualitas tercipta alami, membuat hubungan jarang diterpa gejolak. Kuncinya adalah menjaga keterbukaan agar kenyamanan yang ada tidak dianggap biasa.

    penutup
      Hubungan ini meminta kamu untuk menjaga kesadaran saat gesekan di kursi pasangan muncul, agar kamu bisa membahasnya sebelum menjadi beban. Kamu diminta untuk menghargai perspektif dia yang berbeda, serta menyadari bahwa keteraturan yang kamu berikan adalah bentuk dukungan bagi dia, bukan sekadar kendali.
```

## Y-1 fixture   A Matahari · B Taman

### round 1  (quoted from v1, prompt fcdd1dd95968be52)
```
p0_opening
      Bacaan ini menyoroti dinamika antara dua individu dengan arketipe Matahari dan Taman. Keduanya membawa energi yang berbeda ke dalam ruang yang sama.

    p1_stem_relation
      Unsur salah satu dari kalian memberi energi ke yang lain. Alur energi berjalan searah dan stabil dari satu pihak ke pihak lain. Yang memberi menjadi sumber dorongan, sementara yang menerima mendapat rasa aman. Peran ini konsisten dan jarang berbalik. Keputusan dan inisiatif baru hampir selalu dipicu oleh orang yang sama, sementara yang lain menyambut dan mengeksekusi dengan rasa aman.

    p2_day_pair
      Terjadi gesekan halus antar kursi pasangan yang bekerja perlahan lewat detail kecil. Gesekan ini tidak hadir lewat ledakan besar, melainkan rasa tidak nyaman halus yang menumpuk dari detail kecil yang diabaikan. Benturan pada kursi pasangan menandakan titik yang menuntut kesadaran ekstra, bukan vonis kelayakan hubungan. Saat kesadaran tinggi, gesekan langsung dibahas hari itu juga. Saat lelah, gesekan dipendam sampai menjadi percikan yang lebih besar.

Salah satu pilar kehidupan pasangan menyentuh langsung ruang privatmu. Dinamika dari area hidupnya berdampak langsung ke suasana hubungan. Saat area hidup pasangan tersebut mengalami tekanan, suasananya langsung terbawa ke rumah dan kamu merasakannya sebelum dia sempat bercerita.

    p3_supply
      Salah satu membawa elemen yang absen di bagan pasangannya. Kehadirannya memberikan rasa seimbang dan tenang di area yang tadinya rawan rapuh. Kehadiran pasangan secara alami meredakan kegelisahan di area tertentu, sehingga ketiadaannya langsung membuat area tersebut terasa tidak stabil.

    p4_temperament
      Karakter dominan kalian berasal dari kelompok berbeda. Sudut pandang dasar yang berbeda memberikan perspektif baru jika dikomunikasikan, namun rawan disalahartikan jika dibiarkan tanpa penjelasan. Kalian sering merespons kabar atau kejadian yang sama dengan fokus yang berbeda total, menghasilkan dua interpretasi yang berseberangan dari satu peristiwa.

    p5_pull_fit
      Ketiadaan dorongan otomatis membuat hubungan tidak berjalan dengan sendirinya. Keberlanjutannya murni lahir dari niat dan pilihan sadar yang diperbarui setiap hari. Kebersamaan dan penyesuaian harus dijadwalkan secara sengaja. Jika tidak ada inisiatif aktif, hubungan mudah terasa berjarak.

    penutup
      Hubungan ini meminta Matahari untuk belajar melambat dan memberikan ruang bagi detail yang dibawa Taman. Taman diminta untuk berani menyuarakan ketidaknyamanan kecil sebelum tumpukan itu menjadi beban yang lebih berat bagi keduanya.
```

### round 2, draw 1  (FLOORED — module assembly)

rejections on the way here, with the literal that fired:
  - style.hedging: /\bcenderung\b/ at ", gesekan cenderung dipendam sampai menjadi percik"
  - style.hedge_construction: /\bbukan\b(?!\s+berarti\b)[^.!?]{0,140}?\b(tapi|melainkan)\b/ at "lian. Ini bukan penentu kegagalan, melainkan tanda"
  - style.hedge_construction: /\bbukan\b(?!\s+berarti\b)[^.!?]{0,140}?\b(tapi|melainkan)\b/ at "lian. Ini bukan penentu kegagalan, melainkan tanda"
```
    p0_opening
      Ini adalah bacaan tentang dua individu: Matahari dan Taman.

    p2_day_pair
      Terjadi gesekan halus antar kursi pasangan. Gesekan ini bekerja perlahan lewat detail kecil yang menumpuk, bukan lewat konflik besar.

    p2_reframe
      Ini bukan penentu kegagalan. Gesekan pada kursi pasangan menandakan hubungan yang membutuhkan perhatian ekstra dan kesadaran penuh.

    p2_palace_frame
      Salah satu pilar di bagan dia terhubung langsung dengan kursi pasanganmu. Elemen hidupnya memengaruhi ranah terdekatmu.

    p3_supply
      Dia membawa elemen yang tidak dominan di baganmu. Kehadirannya secara alami memberi keseimbangan yang kamu butuhkan.

    p4_temperament
      Karakter dominan kalian berasal dari kelompok berbeda. Cara pandang yang berbeda bisa memperluas perspektif jika dikomunikasikan terbuka.

    p5_pull_fit
      Tarikan alami minim dan ritme harian membutuhkan penyesuaian. Kelangsungan hubungan murni digerakkan oleh komitmen dan keputusan sadar.
```

### round 2, draw 2

rejections on the way here, with the literal that fired:
  - style.hedging: /\bcenderung\b/ at ", gesekan cenderung dipendam sampai menjadi percik"
  - style.hedge_construction: /\bbukan\b(?!\s+berarti\b)[^.!?]{0,140}?\b(tapi|melainkan)\b/ at "lian. Ini bukan penentu kegagalan, melainkan titik"
```
    p0_opening
      Ini adalah bacaan tentang dua individu: Matahari dan Taman.

    p1_stem_relation
      Unsur Api milikmu memberi energi ke unsur Tanah miliknya dengan alur yang stabil. Kamu menjadi sumber dorongan, sementara dia menerima dan merasa aman bergerak di dalamnya. Dalam seminggu biasa, ini terlihat dari siapa yang membuka pembicaraan soal rencana baru: hampir selalu kamu. Dia menyambut, lalu mengeksekusinya dengan tenang. Peran ini konsisten dan jarang berbalik.

    p2_day_pair + p2_reframe
      Terjadi gesekan halus antar kursi pasangan kalian. Gesekan ini bekerja perlahan lewat detail kecil yang menumpuk. Benturan pada kursi pasangan menandakan titik yang menuntut kesadaran ekstra, bukan vonis kelayakan atau ketidakcocokan hubungan. Saat kesadaran tinggi, gesekan langsung dibahas hari itu juga. Saat lelah, gesekan dipendam sampai menjadi percikan yang lebih besar.

    p2_palace_frame
      Salah satu pilar kehidupan dia menyentuh langsung ruang privatmu, membuat dinamika dari area hidupnya berdampak langsung ke suasana hubungan. Saat area hidup pasangan tersebut mengalami tekanan, suasananya langsung terbawa ke rumah dan kamu merasakannya sebelum dia sempat bercerita.

    p3_supply
      Kamu membawa unsur Air yang tidak dominan di bagan dia, memberikan rasa seimbang dan tenang di area yang tadinya rawan rapuh. Kehadiranmu secara alami meredakan kegelisahan di area tertentu, sehingga ketiadaanmu langsung membuat area tersebut terasa tidak stabil.

    p4_temperament
      Karakter dominan kalian berasal dari kelompok berbeda. Sudut pandang dasar yang berbeda memberikan perspektif baru jika dikomunikasikan, namun rawan disalahartikan jika dibiarkan tanpa penjelasan. Ini terlihat saat kalian merespons kabar atau kejadian yang sama dengan fokus yang berbeda total, menghasilkan dua interpretasi yang berseberangan dari satu peristiwa.

    p5_pull_fit
      Ketiadaan dorongan otomatis membuat hubungan tidak berjalan dengan sendirinya. Kelangsungan hubungan murni lahir dari niat dan pilihan sadar yang diperbarui setiap hari. Kebersamaan dan penyesuaian harus dijadwalkan secara sengaja. Jika tidak ada inisiatif aktif, hubungan mudah terasa berjarak.

    penutup
      Hubungan ini meminta kamu untuk menjaga kesadaran penuh atas detail kecil yang muncul dalam interaksi harian. Kamu diminta untuk tetap menjadi sumber dorongan yang stabil bagi dia, Taman, sambil secara aktif menjadwalkan waktu kebersamaan agar jarak tidak tercipta. Dia, Taman, membutuhkan ruang untuk membawa perspektifnya sendiri, dan kamu diminta untuk menyambutnya sebagai pelengkap yang menyeimbangkan baganmu.
```
