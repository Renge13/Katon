# Claude Design Prompt — Katon Reading Prototype (v2, coherence-fixed, professional voice)

Paste everything below the line into Claude Design.

---

Build an interactive mobile-first web prototype for **Katon**, a BaZi (Chinese Four Pillars)
self-discovery reading app for Indonesian women 25–40. Clean, calm, premium. Watercolor/paper
aesthetic, generous whitespace, one accent color per element.

## VOICE — professional, Apple-marketing standard (Indonesian)

One voice everywhere. Composed, precise, confident. NOT casual, NOT chatty, NOT bureaucratic.
- Short declarative sentences. State it, stop, let it land.
- Concrete over abstract: "Air mengelilingi apimu." never "ada ketidakseimbangan elemen."
- Plain words elevated by restraint. No slang (ngerasa/bikin/kayak/capek), no particles (tuh/lho/deh).
- Warmth through precision, not friendliness. Always address as "kamu".
- Benefit-forward, no hedging, no condescension.
- Em-dash allowed for this demo.
Think: the reading sees you exactly, and says so plainly. Authority that is warm because it is precise.

## THE CORE ARCHITECTURE — read this first

The whole reading is ONE repeated component, the **FactBlock** ("Lego piece"). Same 4-part shape:
1. `label` — the mechanism name (small header)
2. `value` — the computed chart fact (prominent, one or two lines)
3. `visual` — optional (element bars, glyph badge, pillar grid, relation diagram)
4. `meaning` — 1–3 short sentences. This is the payoff.

Build the FactBlock renderer ONCE; the reading is an ordered array of FactBlocks poured through it.

**Progressive disclosure** is the key interaction. Blocks reveal ONE AT A TIME on scroll / "lanjut ↓".
Each block ends pointing to the next. Engineer the feeling: "oh — wait, there's more? — still more?"

Everything is DETERMINISTIC and pre-written. Values below are already computed. Hardcode them exactly.

### THREE COHERENCE RULES (apply to every block — these fix what broke the last prototype)

1. **The chart has a spine. Establish it before any element talk.** The reader must learn, up front,
   that they ARE the Day Master (one specific element), and every other element is the *weather around
   it*. Without this, a reader with a tall Water bar asks "why am I weak Fire, not strong Water?" —
   which breaks trust in the whole engine. The tallest bar is NOT you. You are the day-stem.

2. **Name it, close it.** If a block introduces a term (a glyph, an animal, a Ten God, "Harm"), the
   SAME block must cash it out in one clause. Never name a mechanism and explain something else.

3. **One villain, carried through.** Person A's core tension is: too much Water smothers her Fire.
   That is THE through-line. When a second draining element appears later (Earth, in compatibility),
   explicitly reconcile it to the villain — never introduce a contradicting second story.

Also: every mechanism block gives BOTH faces (the gift first, then the cost) and a handle (something
true to do or notice). Never lead with the wound. And do NOT print raw "Yin/Yang" as bare words —
carry that quality inside the archetype and imagery instead.

---

## SCREEN 1 — Front door

- Wordmark: KATON.
- Headline: "Dirimu, dihitung dari tanggal lahirmu."
- Subline: "Metode Empat Pilar (八字). Cukup tanggal lahir. Tanpa akun."
- Input: Tanggal lahir (date). Jam lahir (opsional).
  - Jam-lahir helper, redesigned as a small unlock affordance (icon + short line, not a paragraph):
    "🔒 Tahu jam lahirmu? Membuka satu lapisan lagi: cita-cita, anak, dan sisi terdalammu."
- Primary button: "Baca dirimu". (Demo: prefill Person A — 13 Sep 1989, 09:00 — go to Screen 2.)
- Secondary line under it (for returning users / the compat path): "Sudah tahu dirimu? Periksa
  kecocokan dengan seseorang →" (Demo: also routes into the second-person input.)
- Assurance, small, with a shield icon: "Tanggal lahir hanya dipakai untuk perhitungan. Tidak disimpan."

Design note: this screen must read CREDIBLE at first glance (the "is this serious?" test). Composed
type, calm. The Empat Pilar (八字) reference is the legitimacy anchor — keep it visible.

## SCREEN 2 — Calculating (~2.5s, anticipation)
Framed as reading, not loading. Rotating:
"Menyusun empat pilarmu…" → "Menimbang kelima elemen…" → "Menemukan pola intimu…"

---

## SCREEN 3 — THE FREE MIRROR (Person A — 丙 Fire, 13 Sep 1989 09:00)

One-at-a-time reveal. Use EXACTLY this content.

**BLOCK S — The spine (NEW, comes FIRST, before the card). This is the coherence fix.**
A short, elegant explainer the reader taps through in one breath. Visual: a simple diagram — one
central glyph (丙) labeled "KAMU", with four smaller element tokens orbiting it labeled "sekitarmu".
- label: "Cara membaca dirimu"
- value: "Dari delapan unsur di tanggal lahirmu, satu adalah KAMU. Sisanya adalah cuaca di sekitarmu."
- meaning: "Intimu adalah satu elemen tetap. Elemen lain yang banyak bukan berarti itu dirimu — itu
  yang mengelilingimu, menguatkan atau menekanmu. Jadi elemen yang paling tinggi di grafik nanti
  bukan dirimu. Dirimu ada di tengah."
- hint: "Inilah intimu ↓"

**BLOCK 0 — The Card (shareable badge-sheet). NO paragraphs. Labels, glyphs, bars only.**
- Eyebrow: "KARTUMU"
- Archetype name (large): "Matahari di Balik Awan"
- Core token: 丙 with a small gloss "aksara 'Matahari'" · tag "Intimu: Api"
- Strength badge: "API LEMAH" (neutral tag, calm color — NOT red/alarm)
- Element bars: Kayu 0 · Api 2.2 · Bumi 1.2 · Logam 1.6 · **Air 3.0** (Air tallest; mark 丙/Api as
  "KAMU" so the card itself teaches that Api is the self, not the tallest bar)
- Flag chips: "Paling banyak: Air" · "Kosong: Kayu"
- Ten God chip: "Peran utama: Wibawa (正官)"
- Relationship-seat chip: "Di dasar dirimu: Air (子)"
- A locked chip: "🔒 Cuaca hidupmu — nanti"
- Footer: KATON.APP · [Bagikan] [Simpan]
- Caption under card: "Ini ringkasanmu. Di bawah, kita baca satu per satu. ↓"

**BLOCK 1 — Inti Dirimu (identity)**
- label: "Inti Dirimu"
- value: "Kamu Matahari. Elemen Api."
- visual: large 丙 with gloss "丙 · aksara Tionghoa untuk Matahari"
- meaning: "Hangat, sulit diabaikan, membuat ruangan terasa lebih hidup saat kamu hadir. Tapi
  mataharimu sedang tertutup sesuatu. Di blok berikutnya kamu akan lihat oleh apa."
- hint: "Seberapa kuat apimu ↓"
  (name-it/close-it: "matahari tertutup sesuatu" is closed in the very next block, not left hanging.)

**BLOCK 2 — Seberapa Kuat Apimu (strength — the master verdict, kept high)**
- label: "Kekuatan Intimu"
- value: "Apimu lemah. Bukan kekurangan — hanya sedikit yang menopangnya."
- visual: a calm horizontal meter, marker left-of-center between LEMAH · SEIMBANG · KUAT
- meaning: "Ingat, kamu adalah Api. Di tanggal lahirmu, Air jauh lebih banyak, dan Air meredupkan
  Api. Itu sebabnya mataharimu tertutup. Bukan berarti kamu rapuh — artinya kamu paling menyala saat
  ada yang menopang, bukan saat memikul sendirian."
- hint: "Lihat sebaran elemenmu ↓"
  (closes BLOCK 1's open loop explicitly; names the villain — Water — for the first time.)

**BLOCK 3 — Sebaran Elemen (the bar chart)**
- label: "Sebaran Elemenmu"
- value: "Air paling banyak. Kayu tidak ada."
- visual: THE bar chart. Kayu 0, Api 2.2 (marked "KAMU"), Bumi 1.2, Logam 1.6, Air 3.0 (marked
  "paling banyak"). Api and Air visually linked by a thin line labeled "Air meredupkan Api".
- meaning: "Air sebanyak ini membuatmu sangat menyerap suasana dan perasaan orang. Menariknya, dari
  luar ini sering terlihat sebagai tenang, bahkan cuek — padahal di dalam kamu menampung banyak.
  Tanpa Kayu, tidak ada yang mengubah semua yang kamu serap menjadi arah."
- hint: "Lalu kamu butuh apa ↓"
  (Cluster-5 fix: pre-empts the "I'm nonchalant, not sensitive" misread by naming the calm surface.)

**BLOCK 4 — Yang Menguatkanmu (favorable element — cashes out EVERY element it names)**
- label: "Yang Menguatkanmu"
- value: "Kamu butuh Kayu dan Api. Bukan Air."
- visual: two glowing tokens (Kayu, Api) beside a dimmed Air token
- meaning: "Kayu memberi apimu arah dan tujuan — bahan yang membuat nyala berarti. Api lain memberimu
  panas pinjaman: orang dan kegiatan yang menyalakanmu lagi saat kamu meredup. Air melakukan
  sebaliknya. Ia menambah yang sudah terlalu banyak, dan membuatmu makin tenggelam."
- hint: "Peran terkuatmu ↓"
  (Cluster-4 fix: explicitly explains BOTH Kayu AND Api, and what "more Water" concretely does.)

**BLOCK 5 — Peran Terkuatmu (top Ten God — gift BEFORE cost)**
- label: "Peran Terkuatmu"
- value: "Wibawa (正官). Muncul dua kali."
- visual: badge "正官 ×2" with gloss "Zheng Guan · peran 'Wibawa'"
- meaning: "Orang memberimu tanggung jawab karena mereka percaya. Kamu punya wibawa alami — dianggap
  bisa diandalkan, tempat orang bersandar. Sisi beratnya: kamu menuntut banyak dari dirimu, serius
  pada tugas, kadang menekan diri sendiri. Inilah alasan mataharimu 'di balik awan' — kamu terus
  menjaga kendali."
- hint: "Bagaimana dengan pasangan ↓"
  (Cluster-4 fix: opens with the gift — trust, natural authority — THEN the cost. No more "no positivity".)

**BLOCK 6 — Di Dasar Dirimu (Spouse Palace tease — renamed from "kursi jodoh", self-closing)**
- label: "Di Dasar Dirimu"
- value: "Di dasar dirimu duduk elemen Air (子, Tikus)."
- visual: a foundation/seat motif with 子, glossed "子 · Tikus · elemen Air"
- meaning: "Di bagian paling dalam dirimu — tempat pasangan hidup 'bersandar' dalam metode ini —
  isinya Air lagi. Artinya kamu cenderung tertarik pada orang yang membuatmu merasa dipahami dan
  dibawa ke kedalaman. Hati-hati pada satu hal: dua orang yang sama-sama penuh Air bisa saling
  menenggelamkan."
- hint (THE HOOK): "Cocok atau tidak dengan orang tertentu? Itu butuh tanggal lahir DIA juga. ↓"
  (name-it/close-it: 子/Tikus/Air all glossed in-line; "where does the Air come from" answered — the
  branch 子 is itself Water. "kursi jodoh" replaced with "di dasar dirimu / tempat pasangan bersandar".)

**BLOCK 7 — Sisi Terdalammu (Hour pillar — UNLOCKED, since A gave 09:00; give real content, not placeholder)**
- label: "Sisi Terdalammu"
- value: "Karena kamu tahu jam lahir, pilar keempat terbuka: 癸巳."
- visual: the 4-pillar grid, hour pillar highlighted as newly-lit
- meaning: "Lapisan ini bicara soal cita-cita, anak, dan dunia batin yang jarang orang lihat. Pilar
  jammu menambah Air lagi (癸) di atas Api (巳) — dorongan batin yang kuat untuk merawat dan
  melindungi, dijaga rapat di dalam. Tanpa jam lahir, seseorang tidak akan pernah melihat bagian ini."
  (Cluster-6 fix: real content so collecting the hour pays off. Ties back to the Water villain — coherent.)

**PAYWALL — the turn outward (entry only; no charge yet)**
- Card headline: "Kamu sudah mengenal dirimu. Sekarang, orang terdekatmu."
- Sub: "Cocok atau tidak dengan seseorang — itu pertanyaan yang tanggal lahirmu sendiri tidak bisa
  jawab. Perlu tanggal lahir dia juga."
- Button: "Periksa kecocokan" → Screen 4 (input FIRST, payment later).
- Flow principle: input + tease come BEFORE payment. The reader must get invested in THIS pairing
  before the wallet appears. Sequence: turn-outward → Screen 4 input → 5a tease (free) → 5b paywall
  → 5c mock payment → 5d full reading.

---

## SCREEN 4 — Enter the second person (free, before payment)
- Heading: "Masukkan tanggal lahirnya."
- Date + optional Jam lahir (same unlock helper).
- Relationship selector (neutral — do NOT assume "Ibu"): chips [Pasangan] [Orang tua] [Anak] [Teman].
  Demo default: Pasangan.
- Assurance: "Tanggal lahirnya juga hanya dipakai untuk perhitungan."
- Button: "Lihat kecocokan" → Screen 5a. (Demo: prefill Person B — 14 Sep 1997, jam tidak diketahui.)

## SCREEN 5a — Pairing tease (FREE — the hook before the wallet)
- **BLOCK P0 — Pairing card.** Two mini badge-cards side by side, full and shareable:
  - LEFT: "Matahari di Balik Awan" · 丙 Api · API LEMAH · sebaran Air-tinggi
  - RIGHT: "Ladang yang Subur" · 己 Bumi · BUMI KUAT · sebaran Bumi-tinggi · chip "🔒 jam belum diketahui"
  - Header "KAMU × DIA"
- **BLOCK P-tease — the seat headline only, meaning blurred.**
  - value (shown): "Di dasar kalian: Air (子) bertemu Bumi (未). Hubungannya disebut 'Harm' (害)."
  - one un-blurred hook line: "Ada gesekan halus di antara kalian — jenis yang sering disalahpahami
    pasangan tanpa mereka sadari."
  - then the meaning fades into a lock; blocks P1, P3–P7 shown as blurred silhouettes so the reader
    SEES how much waits.
- Sticky button: "Buka bacaan lengkap · Rp 99.000" → Screen 5b.

## SCREEN 5b — Paywall detail
- "Yang terbuka:" then a plain checklist (each = the value, not vague teasers):
  - "Arti 子 × 未 untuk kalian — kenapa 'Harm', dan cara menjalaninya"
  - "Siapa mengisi siapa — dan siapa yang lebih cepat lelah"
  - "Kenapa tarikannya kuat meski cocoknya tidak seimbang"
  - "Tahun yang akan menguji kalian"
  - "Peta kekuatan dan gesekan kalian"
- Price: Rp 99.000. "Sekali bayar, berlaku selamanya." CTA: "Bayar & buka" → Screen 5c.

## SCREEN 5c — Simulated payment (mock; real build swaps in Xendit)
- QRIS / e-wallet / bank tabs. Amount Rp 99.000.
- Clearly-labeled demo button: "Simulasikan pembayaran berhasil" → "Berhasil ✓" → Screen 5d.

## SCREEN 5d — PAID COMPATIBILITY (A 丙 × B 己). Same FactBlock renderer, relational content.

Coherence carries over: A's villain is still "too much Water smothers her Fire." The new draining
element (Earth) is RECONCILED to that, never contradicted. Every relation term is glossed in-block.

**BLOCK P0 — Pairing card** (full version of the tease anchor). Re-show at top.

**BLOCK P1 — Saat Inti Kalian Bertemu (DM × DM)**
- label: "Saat Inti Kalian Bertemu"
- value: "Apimu (丙) bertemu Buminya (己). Dalam siklus elemen, Api menghidupkan Bumi. Kamu memberi
  ke dia."
- visual: 丙 —(menghidupkan)→ 己
- meaning: "Secara alami kamu yang memberi energi, dia yang menampung. Kamu menyalakannya. Terasa
  enak di awal. Tapi perhatikan arahnya: cenderung satu arah, dari kamu ke dia."
- hint: "Di dasar kalian ↓"
  (name-it/close-it: states the Fire→Earth generation rule explicitly, so "Api bikin Bumi" is grounded.)

**BLOCK P2 — Di Dasar Kalian (Spouse Palace pair — the centerpiece, most visual weight)**
- label: "Di Dasar Kalian"
- value: "Air (子) di dasarmu bertemu Bumi (未) di dasarnya. Hubungan ini disebut 'Harm' (害) — bukan
  bentrok keras, tapi gesekan halus."
- visual: 子 · 未 with a soft friction line (NOT a dramatic clash burst); a small legend distinguishing
  Bentrok (冲, keras) from Harm (害, halus) so the reader learns Harm is the milder one.
- meaning: "'Harm' bukan tabrakan yang langsung terlihat. Ini gesekan pelan: satu sisi perlahan
  mengikis rasa aman sisi lain, biasanya soal rumah dan ketenangan. Tanda nyatanya: hal-hal kecil
  yang berulang, bukan pertengkaran besar."
- reframe (softer styling): "Gesekan bukan vonis. 'Menjalaninya dengan sadar' berarti satu hal
  konkret: menamai gesekan kecil saat muncul, bukan memendamnya sampai menumpuk. Banyak pasangan
  terkuat justru punya pola ini."
- hint: "Apa yang kalian beri satu sama lain ↓"
  (Cluster-2/3 fix: defines Harm vs Bentrok so "is that clashing?" is answered; makes "menjalani dengan
  sadar" concrete instead of a platitude.)

**BLOCK P3 — Yang Kalian Beri (element complementarity — reconciles the Earth villain, the big fix)**
- label: "Yang Kalian Beri Satu Sama Lain"
- value: "Kamu memberi Air ke dia. Dia memberi Bumi ke kamu. Tapi keduanya tidak seimbang."
- visual: two-way flow: Kamu —Air→ Dia (glowing, "mengisi") ; Dia —Bumi→ Kamu (dimmed, "melelahkan")
- meaning: "Dia kering Air, dan kamu penuh Air — jadi kamu mengisi kekurangannya. Baik untuk dia.
  Arah sebaliknya berbeda. Ingat apimu lemah karena kebanyakan Air? Bumi bekerja lain: Bumi tidak
  menenggelamkan Api, Bumi menyerap tenaganya pelan-pelan. Untuk api yang sudah lemah, diserap terus
  terasa melelahkan. Itu sebabnya kamu sering lebih lelah daripada dia setelah bersama."
- hint: "Kenapa kalian tertarik ↓"
  (THE coherence fix for Cluster 2: explicitly reconciles Earth to the Water story — "Air menenggelamkan,
  Bumi menyerap" — two different mechanisms, same villain family, NAMED as such. No contradiction.)

**BLOCK P4 — Kenapa Kalian Tertarik (affinity vs fit — now with a mechanism, not an assertion)**
- label: "Kenapa Kalian Tertarik"
- value: "Tarikannya kuat. Kecocokan harian tidak seimbang. Keduanya bisa terjadi bersamaan."
- visual: a 2×2 (sumbu: Tarikan rendah→tinggi × Cocok rendah→tinggi), dot in "tarikan tinggi / cocok
  sedang", with a one-line key: "Tarikan datang dari memberi-menerima yang kuat (Api→Bumi). Cocok
  datang dari saling mengisi yang seimbang — dan di sini arahnya berat sebelah."
- meaning: "Tarikan dan kecocokan diukur dari hal berbeda. Tarikan kuat karena kamu memberi dan dia
  menampung — itu terasa nyambung, cepat. Kecocokan harian menimbang apakah kalian saling mengisi
  secara seimbang. Di sini kamu mengisi dia lebih dari dia mengisimu. Maka: tarikan tinggi, cocok
  sedang. Bukan takdir buruk — artinya butuh usaha sadar, bukan hanya mengandalkan rasa."
- hint: "Cuaca untuk kalian ↓"
  (Cluster-2 fix: gives the MECHANISM behind affinity-vs-fit — attraction from the strong one-way
  give, fit from balanced exchange — so "how is that possible?" is answered, not restated.)

**BLOCK P5 — Cuaca Untuk Kalian (timing — now teased in the free mirror via BLOCK 0's locked chip)**
- label: "Cuaca Untuk Kalian"
- value: "Sekitar 2027, sebuah tahun akan mengguncang dasar hubungan ini. Untuk menguji, bukan
  memecah."
- visual: a small timeline, a marker ~2027, labeled "musim uji"
- meaning: "Dalam metode ini, tahun tertentu 'menyentuh' dasar hubungan dan mengaktifkan gesekan yang
  biasanya diam. Bentuknya: perpindahan, perubahan rumah, atau pergeseran cara pandang. Bukan ramalan
  — anggap ini prakiraan cuaca. Jika dijalani bersama dengan sadar, tahun seperti ini justru
  memperdalam hubungan."
- hint: "Peta kalian ↓"
  (Cluster-2 fix: this layer is now legitimate because BLOCK 0 carried a locked "cuaca hidupmu" chip
  in the free mirror — it was foreshadowed, not bolted on. Weather-framed, ethics-safe.)

**BLOCK P6 — Peta Kalian (synthesis — adds a NEW takeaway, not just a recap)**
- label: "Peta Kalian"
- value: two columns — "Yang menguatkan" [Kamu mudah menyalakannya · Kamu mengisi Air yang dia
  kering] vs "Yang perlu dijaga" [Arah energi satu arah · Gesekan 子–未 soal rumah]
- meaning: "Ini bukan nilai lulus atau gagal. Ini peta. Satu hal yang paling berguna: hubungan ini
  meminta kamu belajar MENERIMA, bukan hanya memberi — karena arah alaminya membuatmu terus memberi
  sampai lelah. Di situ letak kerjanya."
  (Cluster-6 fix: the map ends on ONE new synthesized instruction — "learn to receive" — so it's not
  a useless recap. It names the single thing this specific pairing asks of him.)

**BLOCK P7 — Loop out (next pairing — neutral, no assumed relationship)**
- "Kamu sudah membaca kamu × dia. Tambahkan orang lain untuk melihat kecocokan lain — atau lihat
  tiga orang sekaligus."
- Neutral chips: [Tambah orang] [Kecocokan bertiga]. Do NOT hardcode "Ibu".

---

## DESIGN NOTES
- Mobile-first, single column, large tap targets.
- One-at-a-time block reveal, smooth fade/slide, persistent "↓ lanjut".
- Element colors: Kayu green, Api warm-orange, Bumi ochre, Logam slate, Air deep-blue.
- Cards (BLOCK 0, P0) must be genuinely screenshot-worthy and comparable side by side.
- "API LEMAH", "Harm", any friction: NEUTRAL/calm styling, never alarm-red. No verdicts. Timing is
  "cuaca", never prophecy.
- On EVERY block, honor the three coherence rules and the gift-before-cost order.
- Glosses (丙, 子, 害, 正官, etc.) appear inline on first use — never a bare glyph or raw term.

## THE TWO CHARTS (already computed — deterministic)
Person A — 13 Sep 1989, 09:00: pillars 己巳 / 癸酉 / 丙子 / 癸巳. DM 丙 Fire. Strength WEAK (0.28).
  Elements: Kayu 0, Api 2.2, Bumi 1.2, Logam 1.6, Air 3.0. Dominant Air, missing Kayu.
  Top Ten God Zheng Guan (Wibawa) ×2. Spouse-Palace branch 子 (Water).
Person B — 14 Sep 1997, hour unknown: pillars 丁丑 / 己酉 / 己未 / [hour locked]. DM 己 Earth.
  Strength STRONG (0.75). Elements: Kayu 0.1, Api 1.3, Bumi 3.2, Logam 1.1, Air 0.3. Dominant Bumi.
  Spouse-Palace branch 未 (Earth).
Compat A×B: 丙 Fire generates 己 Earth (A gives to B). Seats 子–未 = HARM (害, subtle). A supplies
  Water to B (B is dry — helps); B supplies Earth to A (drains A's already-weak Fire — Earth EXHAUSTS
  Fire, distinct from Water which CONTROLS/smothers Fire). Pull high, fit uneven (one-way give).
