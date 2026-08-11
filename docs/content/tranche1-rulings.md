<!--
STATUS: RULED CONTENT — Reyner's tranche-1 rulings, 2026-08-11. Register is Reyner's; the base
text is his rewrite of Cowork's proposals ("Buku Terjemahan Syndrome" correction), with a minimal
register sweep he requested (banned/chat tokens only: gampang->mudah, Makanya->Karena itu,
bikin->membuat, cuma->hanya, bakal->akan, ujung-ujungnya->pada akhirnya, bilang->menyebutnya,
kelihatan->terlihat, "belum 100%"->"belum sepenuhnya siap", curly quotes->straight).
These strings replace the named fields in docs/content/glossary.json VERBATIM.
Origin: PROGRESS.md "MIRROR QA VERDICT 2026-08-10", fix plan step 2, tranche 1.

RELOCATED TO MAIN 2026-08-11, ruled by Reyner: DECISION STATE MUST NEVER LIVE ON THE BRANCH IT
RULES ON. This file was first committed on `content/tranche1-rulings` (PR #22) alongside the
glossary change it governs, which meant every ruling in it was invisible to anyone reading main and
would have been lost if that PR were closed. Tranche 2 could have reopened settled questions
without ever seeing them. It now lives on main, permanently, decoupled from the content PRs that
apply it. Later tranches get their own file here, on main, BEFORE the PR that applies them.

STATE OF THE APPLYING PR, so this file is readable on its own: PR #22 carries the glossary as
originally ruled, INCLUDING the elemen.水 clause corrected below - the correction is stacked on top
as PR #24, and neither is merged. So a reader comparing this file to #22's glossary will find one
intended difference, and #24 is it.
-->

# Tranche 1 — ruled strings (apply verbatim)

## elemen_hilang.木
- cost_seed: "Kamu mudah menyelesaikan apa yang ada di depan mata, tapi susah untuk putar arah. Dorongan untuk berubah tidak pernah muncul dari dalam diri. Karena itu, kamu bisa bertahan bertahun-tahun di situasi yang sudah tidak cocok dan menganggapnya biasa saja."
- actionable_seed: "Jangan menunggu merasa siap untuk pindah, karena rasa itu tidak akan datang. Buat pemicu dari luar: pasang tanggal keputusan di kalender atau buat janji ke orang lain. Begitu tanggalnya tiba dan belum ada perubahan, langsung melangkah."

## bintang.桃花
- gift_seed: "Pintu terbuka lebih cepat untukmu karena orang penasaran ingin mengenalmu lebih jauh. Kesan pertamamu bekerja sebelum kamu mulai bicara. Pakai kesan itu di awal, jangan disimpan sampai orang sudah membentuk pendapat sendiri."
- actionable_seed: "Daya tarik memang membuat orang memperhatikanmu, tapi hubungan yang dekat harus dibangun pelan-pelan. Pilih beberapa orang, lalu bagikan cerita yang jujur dan luangkan waktu bersama mereka. Kesan pertama hanya membuka pintu; kehadiran yang konsisten yang membuat orang bertahan."

## kekuatan.weak
- actionable_seed (NEW field): "Perhatikan lingkunganmu dengan serius, bukan hanya sebagai latar belakang. Sebelum mengambil peran baru, tanya ke diri sendiri: siapa atau apa yang akan mengisi ulang energiku di sini? Kalau jawabannya tidak ada, kamu sendiri yang akan kehabisan tenaga."

## elemen.火
- label_meaning (CONFIRMED by Reyner 2026-08-11, applied): "Kehadiranmu langsung terasa sebelum kamu bicara. Kamu menerangi sekitarmu lebih dulu sebelum menghangatkan dirimu sendiri, dan nyala itu memakai tenaga yang tidak mengisi dirinya sendiri."
- actionable_seed (NEW field): "Atur jadwal untuk mengisi energimu seserius kamu mengatur jadwal kerja. Sediakan waktu untuk bertemu orang atau mendatangi tempat yang bisa memulihkan tenagamu. Jangan tunggu sampai bateraimu benar-benar habis baru mencari cara untuk pulih."

## elemen.水
- actionable_seed (NEW field): "Jangan paksa dirimu masuk ke aturan yang terlalu kaku, karena aturan seperti itu sulit kamu pertahankan. Pegang teguh tujuan utamamu, tapi bebaskan cara mencapainya. Komitmenmu bisa bertahan lama selama kamu punya ruang untuk mengubah rute."

  RULED 2026-08-11, one clause, rule 25. As FIRST ruled this read "karena pada akhirnya **pasti
  akan** kamu tinggalkan" - a fixed future outcome, matching the gate's fatalism pattern
  `\bpasti akan\b`, which put `forbidden.fatalism` (HARD) into the module-assembly floor on charts
  4, 6 and 12. **"sulit kamu pertahankan" is RULED by Reyner, 2026-08-11**, and the line above is
  the tranche-1 text of record. It was proposed by Claude Code and is no longer a proposal. Only the
  causal clause moved; the two sentences after it are Reyner's original and are untouched. The
  glossary change that applies it is PR #24.

## relasi_cabang.半合
- cost_seed: "Dua dari tiga bagian sudah terhubung, jadi tinggal satu lagi yang kurang. Dalam kehidupan sehari-hari, ini terasa seperti rasa 'hampir pas': semuanya sudah jalan dan arahnya jelas, tapi kamu selalu merasa harus menambah satu hal lagi sebelum berani menyebutnya selesai."
- actionable_seed (NEW field): "Rasa 'belum lengkap' itu hanya bagian dari polamu, bukan tanda ada yang salah. Saat muncul keinginan untuk menambah satu hal lagi, berhenti sejenak dan tanya: apakah yang ada sekarang sudah cukup untuk melangkah? Sering kali, jawabannya sudah lebih dari cukup."

## aspek.正官
- actionable_seed (NEW field): "Waktu untuk santai tidak akan datang dari orang lain, karena mereka justru bersandar pada disiplinmu. Buat jadwal sendiri untuk santai tanpa tuntutan harus selalu benar, dan jaga jadwal itu seserius kamu menjaga aturan kerja."

## aspek.正財
- actionable_seed (NEW field): "Beban kerja yang kamu pegang akan terus bertambah kalau tidak pernah ada yang kamu bagikan. Pilih satu tugas untuk diserahkan ke orang lain bulan ini. Berikan petunjuk yang jelas, dan biarkan hasilnya berjalan meskipun tidak serapi caramu."

## aspek.比肩
- actionable_seed (NEW field): "Orang mengira kamu selalu sanggup sendiri, jadi bantuan jarang ditawarkan. Mintalah bantuan lebih awal sebelum situasinya makin mendesak."

  RULED 2026-08-11, Reyner's final wording, replacing the first ruling. That read
  "Orang jarang menawarkan bantuan **bukan** karena tidak peduli, **tapi** karena kamu selalu
  terlihat sanggup melakukannya sendiri...", which is the banned `bukan X tapi Y` construction -
  renderer-prompt.txt calls it the most frequently broken rule in the prompt and names
  "bukan karena X, melainkan karena Y" as one of its hiding places. It tripped
  `style.hedge_construction`, and it was caught by the repo's own invariant test
  NO ENGINE STRING WOULD TRIP THE STYLE GATE, which named the cell exactly.

  **THE SENTENCE BENDS, NOT THE CHECK.** The construction is banned for the renderer, so a glossary
  seed may not carry it either - an engine string that trips the style gate would punish the
  renderer for faithfully carrying engine content, which is the failure `f068352` cleaned out of
  twelve cells and this invariant exists to prevent recurring.

  Verified before landing: the replacement raises no forbidden or style finding under the real
  guards, and it carries no question mark.

## bintang.天乙貴人
- NO CHANGE. Anchor cell; passes all three tests as-is.

## aspek.正印
- actionable_seed (NEW field): "Batasi masa persiapanmu dengan tanggal, bukan dengan menunggu rasa siap. Mulai saja dulu meski rasanya belum sepenuhnya siap; petunjuk atau bantuan berikutnya biasanya baru terlihat setelah kamu mulai melangkah."

## aspek.偏印
- actionable_seed (NEW field): "Kamu tidak perlu menjelaskan semua alur pikiranmu. Cukup sampaikan kesimpulannya dan satu alasan paling kuat. Itu sudah cukup untuk membuat orang lain mengerti tanpa membuat energimu terkuras."

## pilar — NEW `domain_id` field, all four (the weave gloss, finding 5)
- year (Pilar Akar): "asal-usul dan latar belakangmu"
- month (Pilar Kerja): "pekerjaan dan kariermu"
- day (Pilar Diri): "kehidupan pribadi dan hubungan terdekatmu"
- hour (Pilar Arah): "tujuan dan arah masa depanmu"
(`domain_id` is DATA ONLY in this commit — nothing consumes it yet. The payload join and the
renderer first-mention rule are step 3, measured separately as same-day pairs.)
