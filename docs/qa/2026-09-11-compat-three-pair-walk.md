# Compat reading, three pairs: floor / baseline / round 1

Prompt Z section 4. Reyner reads three pairs side by side; his verdict is the gate.
The numbers in `2026-09-11-compat-voice-after.md` only say whether the change did anything.

- **floor** — module assembly. The ruled cells, concatenated. No model.
- **baseline** — the reading as it shipped before this PR. Cells and prompt from `13b2629`, re-rendered today.
- **round 1** — 42 seeds + pair prompt `fcdd1dd95968be52`.

THE BASELINE IS A FRESH DRAW, not the reading anyone received. Same cells and
same prompt as before the PR, but the model is sampled again, so a difference
between columns is the change PLUS one draw of variance. Two draws of the same
config already differed in the after-run (floors 1/10 then 3/10).

baseline prompt `ceb898d80f52471c` → round 1 prompt `fcdd1dd95968be52`

## ONE THING TO READ FOR, MEASURED BEFORE YOU START

**Round 1 still reproduces seeds verbatim. It changed WHAT it copies, not that it copies.**

Taking the first nine words of each ruled seed and asking whether that exact run
appears in the column:

    baseline   0 of 42   (the old cells had no seeds, so this is definitionally 0)
    round 1   10 of 42

The prompt now says, in as many words, that "reproducing a field verbatim, or
close to verbatim, is a failure of the block". Ten of forty-two seeds are landing
on the page unchanged anyway. The `label_meaning` overlap did fall (1.00 -> 0.83
median, verbatim blocks 9 -> 1), so the model is no longer copying the TECHNICAL
sentence - it is copying the new ones instead.

That is the question your read should settle: whether a block that transcribes a
good seed is acceptable because the seed is good, or whether it is the same
defect wearing better clothes. The numbers cannot answer it; they only say the
copying moved.

WHAT I CHECKED AND WILL NOT CLAIM: I thought round 1 had become less concrete -
the 1x2 baseline names "unsur Matahari" and "unsur Tanah" where round 1 says
"salah satu dari kalian". Counting the names across the whole column does not
support it (Matahari 4 vs 4, Gunung 2 vs 3, Tanah 1 vs 0), so it is one block and
not a pattern. Worth your eye, not worth a finding.

---

## 1x2  (contrasting · q2 · p2_none)

A Matahari · B Gunung

### floor
```
    p0_opening
      Ini adalah bacaan tentang dua individu: Matahari dan Gunung.

    p2_day_pair
      Kursi pasangan kalian berjalan terpisah tanpa tarik-menarik khusus. Dinamika utama kalian berasal dari aspek bagan lainnya.

    p2_palace_frame
      Salah satu pilar di bagan dia terhubung langsung dengan kursi pasanganmu. Elemen hidupnya memengaruhi ranah terdekatmu.

    p3_supply
      Dia membawa elemen yang tidak dominan di baganmu. Kehadirannya secara alami memberi keseimbangan yang kamu butuhkan.

    p4_temperament
      Karakter dominan kalian berasal dari kelompok berbeda. Cara pandang yang berbeda bisa memperluas perspektif jika dikomunikasikan terbuka.

    p5_pull_fit
      Magnet hubungan sangat kuat, namun pola keseharian sering bersimpangan. Dinamika terasa pekat dan menuntut kompromi jelas dalam rutinitas.
```

### baseline
```
    p0_opening
      Ini adalah bacaan tentang dua individu: Matahari dan Gunung. Kamu membawa kehangatan yang menyebar, sementara dia berdiri sebagai Gunung yang kokoh dan stabil.

    p1_stem_relation
      Unsur Matahari milikmu memberi energi ke unsur Tanah miliknya. Ada dinamika pengayom dan yang diayomi dengan alur yang konsisten. Kamu secara alami memanaskan dan menghidupkan potensi yang dia miliki.

    p2_day_pair
      Kursi pasangan kalian berjalan terpisah tanpa tarik-menarik khusus. Dinamika utama kalian berasal dari aspek bagan lainnya. Salah satu pilar di bagan dia terhubung langsung dengan kursi pasanganmu. Elemen hidupnya memengaruhi ranah terdekatmu. Gesekan yang muncul adalah peta untuk menavigasi hubungan, bukan penilaian atas kualitasnya. Gunakan ini untuk memahami di mana kalian perlu memberi ruang satu sama lain.

    p3_supply
      Dia membawa elemen air yang tidak dominan di baganmu. Kehadirannya secara alami memberi keseimbangan yang kamu butuhkan. Sebaliknya, kamu membawa unsur kayu yang dia perlukan untuk menjaga stabilitas tanahnya. Kebutuhan yang terpenuhi ini menjadi fondasi bagi kalian untuk tumbuh bersama.

    p4_temperament
      Karakter dominan kalian berasal dari kelompok berbeda. Kamu fokus pada pengelolaan hasil, sementara dia lebih mengutamakan kemandirian dan pendampingan. Cara pandang yang berbeda ini memperluas perspektif jika dikomunikasikan terbuka.

    p5_pull_fit
      Magnet hubungan sangat kuat. Namun, pola keseharian sering bersimpangan. Dinamika terasa pekat dan menuntut kompromi jelas dalam rutinitas agar ritme kalian tidak terus bergesekan.

    penutup
      Hubungan ini meminta kamu untuk lebih sabar dalam menyelaraskan ritme harian yang berbeda. Bagi dia, hubungan ini meminta keterbukaan untuk menerima kehangatan dan arahan yang kamu tawarkan.
```

### round 1
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

---

## 2x6  (contrasting · q1 · p2_clash)

A Gunung · B Samudra

### floor
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

### baseline
```
    p0_opening
      Ini adalah bacaan tentang dua individu: Gunung dan Samudra. Kamu membawa keteguhan Gunung, sementara dia membawa keluasan Samudra.

    p1_stem_relation
      Elemen tanahmu membatasi elemen airnya. Interaksi ini menghadirkan struktur dan arah bagi hubungan kalian. Kamu berperan sebagai wadah yang mengarahkan alirannya, namun perlu waspada agar kendali ini tidak berubah menjadi tekanan yang membatasi ruang geraknya.

    p2_day_pair
      Kursi pasangan kalian saling berbenturan. Dinamika berjalan intens, di mana gesekan kecil bisa terasa jauh lebih tajam. Gesekan pada kursi pasangan ini bukan penentu kegagalan. Ini adalah peta yang menandakan hubungan yang membutuhkan perhatian ekstra dan kesadaran penuh. Salah satu pilar di bagannya terhubung langsung dengan kursi pasanganmu. Elemen hidupnya memengaruhi ranah terdekatmu, sehingga setiap perbedaan yang muncul menuntut ruang untuk didengarkan tanpa harus segera diselesaikan.

    p3_supply
      Dia membawa elemen air yang tidak dominan di baganmu. Kehadirannya secara alami memberi keseimbangan yang kamu butuhkan untuk tetap fleksibel. Sebaliknya, kamu membawa elemen logam yang dia perlukan untuk memperkuat struktur bagannya. Kalian saling mengisi celah yang ada pada satu sama lain.

    p4_temperament
      Karakter dominan kalian berasal dari kelompok berbeda. Kamu membawa Aspek Pendamping yang mengutamakan kemandirian, sementara dia membawa Aspek Peraih yang berorientasi pada hasil. Cara pandang yang berbeda ini bisa memperluas perspektif kalian jika dikomunikasikan secara terbuka.

    p5_pull_fit
      Chemistry terasa kuat dan rutinitas harian kalian saling menopang. Kuncinya adalah menjaga keterbukaan agar kenyamanan yang terbangun tidak dianggap sebagai hal yang biasa.

    penutup
      Hubungan ini meminta kamu untuk melatih kesabaran dalam menghadapi perbedaan ritme yang muncul dari benturan kursi pasangan. Dia diminta untuk belajar menghargai batasan yang kamu tetapkan sebagai bentuk stabilitas bagi kalian berdua.
```

### round 1  (FLOORED — this draw fell to module assembly)
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

---

## Y-1 fixture  (contrasting · q4 · p2_harm)

A Matahari · B Taman

### floor
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

### baseline
```
    p0_opening
      Ini adalah bacaan tentang dua individu: Matahari dan Taman. Keduanya membawa energi yang berbeda dalam cara mereka berinteraksi dengan dunia.

    p1_stem_relation
      Unsur Matahari menghidupi unsur Taman. Ada dinamika pengayom dan yang diayomi dengan alur yang konsisten di antara kalian.

    p2_day_pair
      Terjadi gesekan halus antar kursi pasangan. Gesekan ini bekerja perlahan lewat detail kecil yang menumpuk, bukan lewat konflik besar. Ini bukan penentu kegagalan. Gesekan pada kursi pasangan menandakan hubungan yang membutuhkan perhatian ekstra dan kesadaran penuh. Salah satu pilar di bagan dia terhubung langsung dengan kursi pasanganmu. Elemen hidupnya memengaruhi ranah terdekatmu.

    p3_supply
      Dia membawa elemen yang tidak dominan di baganmu. Kehadirannya secara alami memberi keseimbangan yang kamu butuhkan.

    p4_temperament
      Karakter dominan kalian berasal dari kelompok berbeda. Cara pandang yang berbeda bisa memperluas perspektif jika dikomunikasikan terbuka.

    p5_pull_fit
      Tarikan alami minim dan ritme harian membutuhkan penyesuaian. Kelangsungan hubungan murni digerakkan oleh komitmen dan keputusan sadar.

    penutup
      Hubungan ini meminta kamu untuk lebih sabar dalam menavigasi gesekan kecil yang muncul dari perbedaan ritme harian. Dia diminta untuk lebih terbuka dalam menerima pengaruh yang kamu berikan agar keseimbangan tetap terjaga.
```

### round 1
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

