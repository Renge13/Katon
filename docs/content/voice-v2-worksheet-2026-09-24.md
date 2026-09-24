# Voice v2 worksheet: factual integrity, expressive freedom (Cowork, 2026-09-24)

**NOT DURABLE UNTIL CODE COMMITS IT** as `docs/content/voice-v2-worksheet-2026-09-24.md`, alone.
Status: ROUND 1 of 2. Reyner marks the R column. Round 2 is real Gemini renders under the ruled rules.
After round 2: ship or park (two-round cap).

The question this sheet tests, in Reyner's words: **how much expressive freedom can we give the renderer
while keeping factual integrity intact?** The test is not "does this sound safer". It is **"does this feel
significantly more like something a person would pay to read?"**

---

## 1. The principle

> **Do not invent facts. Interpret the supplied facts generously.**
> (Replaces: "never add a sentence that carries no new fact", `renderer-prompt.txt:260`.)

The engine owns the FACT layer. The renderer owns the MEANING layer. The line between them:

| FACT layer: renderer may NOT | MEANING layer: renderer SHOULD |
|---|---|
| add a chart fact, star, pillar, position, relation or interaction the JSON does not carry | explain why a supplied fact matters to this person |
| state a causal link between two facts unless the JSON states the relation (`provenance.relation`, `cycle`, `relation_to_day_master`, `relation_to_season`) | connect supplied facts into one theme; state that two facts SIT TOGETHER (same pillar, same palace) |
| present a psychological claim as certain beyond what gift/cost/label_meaning say | describe tendencies with calibrated words (`sering`, `biasanya`, `jarang`) |
| predict, fix a destiny, or say something is inevitable | show tension and trade-off; turn a strength into its burden and back |
| give a compat verdict, score, or rank the two people | tell a dynamic as a scene or a pattern in an ordinary week |
| narrow `orang` to a specific relationship the JSON did not name | use restrained imagery drawn from the chart's own elements, animals and seasons |
| show arithmetic, percentages, thresholds | vary rhythm; repeat a theme when repetition strengthens the portrait |

**The one new factual rule this needs (Cowork proposal):** *co-location may be stated, causation may not.*
"Pilar Akar yang sama juga membawa Mata Pisau-nya" is allowed (both facts supplied, same position).
"Mata Pisau-nya yang membuat kursimu berbenturan" is forbidden (no rule in the JSON links them).

---

## 2. What Cowork measured before proposing anything (CHECK 1, CHECK 2)

All against `main` on 2026-09-24 (`.git/HEAD` = main), engine `0.4.4-stage3`, gate `1.25.0`.
Facts come from `buildSemanticJson` / `buildPairSemantic` run on the device for the round-2 fixture pair
(A 1989-09-13 09:00 perempuan, B 1990-03-04 14:00 laki-laki). Scripts: `reports/cowork-v2samples.mjs`,
`reports/cowork-v2validate.mjs` (gitignored, Cowork's).

1. **The ban list is NOT the main cause.** All seven v2 samples in §5 were swept against the 70 live
   patterns, compiled as `lib/validate/style.js:64` compiles them. Control `Kalian cenderung sangat cocok
   dan selaras.` fired 3 (tension_collapse, hedging, verdict). **Every sample: 0 hits.** A far more
   interpretive reading is already possible under today's bans.
2. **The prompt tells the model not to interpret.** `renderer-prompt.txt`:
   - `:3` "You are not an astrologer and not a stylist... Do not reach for elegance."
   - `:17` actionable: "When a fact carries one, include it." (source of the homework endings)
   - `:173` "A reader who has to decode a metaphor has already stopped reading."
   - `:236-238` "short sentences, no verbosity... Constrain it, do not decorate it."
   - `:260` "never add a sentence that carries no new fact." (kills every "why it matters" sentence)
3. **The engine requires homework.** `lib/semantic/index.js:214` puts `actionable` in `must_cover` for every
   fact that has one: 8 of the 9 required points on this chart.
4. **The coverage gate rewards paraphrase.** `lib/validate/coverage.js` checks each `must_cover` field by
   STEM OVERLAP with the engine string. Run on the three mirror samples (§5): **0 hard findings, 7 soft**
   (soft = regenerate). Two kinds:
   - *False misses, meaning kept in new words:* `void_stack_month.label_meaning` (1/11 stems) and
     `profile_vs_favorable.label_meaning` (0/7) flag although the sample says exactly what they mean.
   - *Real omissions by Cowork:* `element_missing_Wood` gift/cost and `badge_桃花` gift/cost were only used
     as a clause. v2 has to rule whether a low-importance fact may be a clause (see H9).
   A gate that measures shared words will always pull the prose back towards the engine's own sentences.
   That is the "database output" feeling.
5. **Compat is starved upstream.** `buildPairSemantic` gives each person only `archetype`, `element`,
   `main_profile` (`core.a` / `core.b`). **A portrait of either person is impossible today**: his Seimbang,
   Dominan Tanah, Mata Pisau and Bintang Perantau exist only in HIS mirror JSON, which the pair renderer never
   sees. And the pair JSON already holds specifics the reading hides:
   - `p2_palace_frame`: HIS Pilar Akar (午) clashes HER Fondasi Pasangan (子); HIS Pilar Arah (未) harms it;
     HER Pilar Kerja (酉) binds HIS Fondasi Pasangan (辰). The reading said only "ada pilar kehidupan dia
     yang menyentuh ruang privatmu".
   - `p3_supply` runs BOTH ways: she brings Air, his most favoured element; he brings Kayu, hers (and her
     chart has none). The reading gave only one direction.

---

## 3. The current rules, as hypotheses (Reyner's instruction: not sacred)

KEEP = protects a fact or the reader. CHANGE = right problem, wrong tool. DROP = its product cost is larger
than the problem it solved.

| # | Rule today | What it solved | What it costs the product | Proposal | R |
|---|---|---|---|---|---|
| H1 | Engine owns facts; never author a fact (`:212-216`, rule 14) | invented stars, flattering fiction | nothing | **KEEP**, plus the co-location / causation line (§1) | |
| H2 | Positions, palaces, `positions_id` verbatim, batang/cabang pairing | wrong pillars, a reader cross-checking and losing trust | nothing | **KEEP** | |
| H3 | No fatalism, prediction, medical/financial, god ranking (rule 25) | harm, dependency | nothing | **KEEP** | |
| H4 | Compat: no verdict, no score, no ranking, don't address B | "cocok/tidak cocok" as a product | nothing | **KEEP** | |
| H5 | "Not a stylist, don't reach for elegance" (`:3`, `:238`) | purple prose, horoscope tone | the reading has no voice | **DROP**; replace with the positive target in §4 | |
| H6 | "Never add a sentence that carries no new fact" (`:260`) | padding | forbids explanation, connection, turn | **CHANGE** to: every sentence serves a supplied fact (explains it, connects it, or shows it) | |
| H7 | Include every actionable; `actionable` in `must_cover` (`:17`, `index.js:214`) | readings that felt passive | coaching-homework feel | **CHANGE**: actionable optional; at most 2-3 per reading, where it follows; drop from `must_cover` | |
| H8 | Metaphor discouraged (`:173`) vs "keep the causal image" (`:220`) | decoding tax | contradiction; model picks the safe side | **CHANGE**: one restrained image per section, taken from the chart's elements, animals or seasons, and it must clarify a supplied mechanism | |
| H9 | Coverage by stem overlap on every field (`coverage.js`) | facts silently dropped, costs dropped | pulls prose back to the engine's wording | **CHANGE**: hard-require the fact is cited and its NAME appears; require `cost` meaning for importance >= 60 only; stem overlap becomes a logged metric, not a regeneration | |
| H10 | Hedge ban: mungkin, agak, cenderung, sepertinya (`:245`) | wishy-washy claims | forces certainty on psychological claims, which Reyner's guardrail forbids | **CHANGE**: ban stacked hedges and hedged FACTS; allow calibrated tendency words (`sering`, `biasanya`, `cenderung`) on behaviour | |
| H11 | "Short sentences, no verbosity" (`:236`) | bloat | flat rhythm | **CHANGE**: "vary rhythm; short sentences for the blow, longer ones for the explanation" | |
| H12 | HOLD THE TENSION: never reconcile a cost (`:202-210`) | costs turned into compliments | forbids the strength-to-burden turn | **KEEP the ban on dissolving a tension**; explicitly ALLOW the turn (strength -> burden, burden -> what it protects) as long as both sides stay standing | |
| H13 | "bukan X, melainkan Y" ban (`:246`) | the model's most repeated tic | also kills a normal Indonesian contrast | **CHANGE** to a limit: at most once per reading | |
| H14 | tension_collapse tokens (`menyatu`, `selaras`...) as global bans | harmony words erasing a tension | fire on innocent uses (Cowork's own draft hit `menyatu` about a role, not a tension) | **CHANGE**: keep hard in penutup and compat; elsewhere log, don't reject | |
| H15 | Three beats per significant fact (`:42-50`) | "a name explained but not applied" | formula; every block the same shape | **CHANGE**: the three beats are a tool, not a template; a section may be led by a THEME that spans facts | |
| H16 | Compat journey P1-P7, one fact per block (`compat-renderer-prompt.txt:63-74`) | coverage of every pair fact | five compressed dynamics, no people | **CHANGE** to three acts (§4). Needs engine work: both people's portrait facts in the pair payload | |
| H17 | "Every friction is between them, never inside one of them" | blaming one person | forbids portraits | **KEEP for dynamics**; portraits may name each person's own gift AND cost, evenly | |
| H18 | No rhetorical questions, no hanzi in prose, keyboard characters | known failure modes | nothing | **KEEP** | |

---

## 4. The positive voice target

**Specific -> interpretive -> human -> emotionally recognizable -> grounded.**
The reader should hit moments of *"that explains something about me"*, not *"here is another BaZi fact"*.

What excellent Katon writing DOES:
1. **Leads with the person, not the term.** The term arrives as proof of something she already recognises.
2. **Explains why.** Every major fact gets its mechanism in plain words, taken from the JSON's relation fields.
3. **Connects.** When facts share a pillar or a relation, it says what it means that they sit together.
4. **Contrasts.** Inside vs outside, others vs her, what people see vs what she carries.
5. **Turns.** A strength shows its price; a burden shows what it protects. Both stay standing.
6. **Uses one image where it clarifies**, from her own chart (Api, Kayu, Logam, bulan Ayam, Gunung).
7. **Varies rhythm.** A long sentence to explain, a short one to land.
8. **Advises rarely.** Two or three moves in the whole reading, where they follow from what was just seen.

**Mirror structure:** the opening three stay first (engine decision). After that, sections are organised by
THEME, each theme braiding the facts that belong to it. Target 1,200-1,600 words (today about 900).

**Compat structure, three acts:**
1. **Kamu dalam hubungan ini:** her Day Master, strength, dominant Aspek, Fondasi Pasangan, plus her 1-2
   highest facts, told for a relationship.
2. **Dia:** the same for him, in third person, gift and cost evenly, never addressed.
3. **Di antara kalian:** each pair fact as a SCENE, using the concrete cross-hits (which pillar of whose
   touches whose seat), both supply directions, the pull/fit shape. Close with the penutup rules unchanged.

Target 1,800-2,500 words (today about 430). Depth comes from acts 1-2 and from the specifics in act 3, not
from making five blocks longer.

---

## 5. Before / after, same engine facts

Each "after" was written by Cowork (Claude), not by Gemini under a v2 prompt. **Round 2 is the real test**:
the thing that ships is Gemini's render, so this sheet proves the direction, not the model.
Swept: 70 patterns, 0 hits each. Grounding notes name the fact behind every interpretive move.

### S1. Strong contrast: `void_stack_month` braided with its notables

**Before (round-2 PDF, cached render):**
> Di Pilar Kerja, yang mencakup pekerjaan dan kariermu, terdapat Tanda Kekosongan (Void). Orang lain melihat
> kamu berhasil di bidang ini, tetapi kamu sendiri sering merasa belum pantas menyandangnya. ... Sampaikan
> hasil kerjamu dengan lantang, meskipun rasanya canggung.
> Di pilar yang sama, terdapat Aspek Pengelola (Direct Wealth). ... Pilih satu tugas untuk diserahkan ke
> orang lain bulan ini.
> Juga di Pilar Kerja, kamu memiliki Bunga Persik (Peach Blossom). ... Pilih beberapa orang, lalu bagikan
> cerita yang jujur ...

**After:**
> **Semua yang Dilihat Orang**
>
> Kalau orang diminta menunjuk di mana kamu paling bersinar, hampir semuanya akan menunjuk ke pekerjaanmu. Di Pilar Kerja, bagian bagan yang membaca pekerjaan dan kariermu, berkumpul hal-hal yang membuat orang percaya padamu. Ada Aspek Pengelola (Direct Wealth), yang membuat apa pun yang kamu pegang jarang berantakan. Ada Bunga Persik (Peach Blossom), yang membuat orang mengingatmu setelah satu pertemuan. Ada Bintang Penolong (Nobleman), yang membuat bantuan datang tepat saat jalanmu buntu.
>
> Tetapi pilar yang sama membawa Tanda Kekosongan (Void). Dari luar, pilar ini penuh. Dari dalam, ia terasa kosong. Orang sudah menganggapmu ahli, sementara kamu masih menunggu bukti berikutnya. Pujian datang, kamu mengucapkan terima kasih, lalu pujian itu lewat tanpa pernah menetap.
>
> Ini menjelaskan kenapa keberhasilan di tempat kerja jarang terasa seperti milikmu sendiri. Kamu tidak pernah bersandar pada keberuntungan di sana. Semua yang ada di pilar itu kamu bangun sendiri, dengan kerja keras. Justru karena itu, kamu tahu persis berapa usaha di baliknya, dan usaha itu tidak pernah terasa cukup.

**Grounding:** `void_stack_month.provenance.notables` = main_profile_source 正財, 天乙貴人, 桃花, all at month.
"Dari luar penuh, dari dalam kosong" is the contrast built from `label_meaning` + that co-location.
"Justru karena itu..." connects the void's `gift` (built by hard work) to its `cost` (always waiting for the
next proof). No new fact. **Four homework lines removed.**

### S2. Restrained imagery: `day_master_Fire` + `strength_weak` + `element_missing_Wood`

**Before:**
> Kamu adalah Api Matahari (The Sun). Kehadiranmu langsung terasa sebelum kamu bicara ... Kamu Api Lemah.
> Lemah di sini bicara soal cadangan energi, bukan soal kemampuan. Sumber tenagamu ada di luar dirimu. ...
> Atur jadwal untuk mengisi energimu seserius kamu mengatur jadwal kerja. ...

**After:**
> **Matahari di Bulan Logam**
>
> Kamu adalah Matahari (The Sun), unsur Api. Kehadiranmu terasa sebelum kamu bicara. Suasana ruangan berubah saat kamu masuk, dan orang berkumpul di sekitarmu tanpa perlu kamu undang.
>
> Api menyala dari kayu. Di baganmu, tidak ada unsur Kayu sama sekali. Bahan bakarmu tidak pernah tersedia di dalam, jadi ia harus datang dari luar: dari orang, tempat, dan suasana yang tepat. Kamu juga lahir di bulan Ayam, bulan yang dikuasai Logam, dan Api menghabiskan tenaga untuk menundukkan Logam. Itu sebabnya baganmu membaca Api-mu Lemah. Lemah di sini bicara soal cadangan, bukan soal kemampuan.
>
> Bayangkan api yang menerangi seluruh ruangan, sementara kayunya harus terus ditambahkan orang lain. Di lingkungan yang pas, kamu tumbuh jauh melampaui orang di sekitarmu. Di lingkungan yang salah, kamu kehabisan tenaga lebih cepat daripada siapa pun di ruangan itu. Yang membuatnya berat, hampir tidak ada yang sadar, karena dari luar kamu tetap terlihat terang.

**Grounding:** "Api menyala dari kayu" = `element_missing_Wood.provenance.relation_to_day_master: feeds`
(Wood feeds Fire); Kayu is also first in `strength.favorable`. "Bulan Ayam, dikuasai Logam, Api menghabiskan
tenaga" = `strength_weak.provenance`: month_branch 酉, season_ruler_element Logam, relation_to_season
`controls`. This is the "why" Gemini gave with its roots; here it comes from OUR engine's own fields, which
the prompt never asked the model to use. "Hampir tidak ada yang sadar" connects Api's `gift` (presence) to
Lemah's `cost` ("menanggung lelah sendirian"). **Boundary flag:** the missing-Wood fact is used only as fuel.
Its own gift/cost ("susah putar arah") must still appear elsewhere (H9 ruling).

### S3. Strength becomes burden: `aspek_convergence_正官` + `spouse_palace` + `element_dominant_Water`

**Before:**
> Kamu memiliki Aspek Pengatur (Direct Officer) yang muncul di Pilar Kerja, Pilar Diri, dan Pilar Arah. Kamu
> tahu apa yang seharusnya dilakukan ... Waktu untuk santai tidak akan datang dari orang lain, jadi buat
> jadwal sendiri untuk santai tanpa tuntutan harus selalu benar.

**After:**
> **Orang yang Selalu Bisa Dipegang**
>
> Aspek Pengatur (Direct Officer) muncul tiga kali di baganmu: di batang bulan, di batang jam, dan di cabang hari, tepat di Fondasi Pasanganmu, tempat hubungan terdekatmu dibaca. Satu kali saja sudah cukup membuat seseorang dikenal bisa dipegang omongannya. Tiga kali berarti rasa tanggung jawab itu ikut ke mana pun kamu pergi. Ke kantor. Ke rencana jangka panjangmu. Bahkan ke rumah.
>
> Orang menaruh tanggung jawab padamu sejak muda, dan kamu tidak pernah memintanya. Saat keadaan kacau, orang mencari kamu karena mereka tahu kamu tidak ikut goyah. Situasi yang menakutkan bagi orang lain adalah arena harianmu.
>
> Kekuatan yang sama punya harga, dan harganya kamu bayar diam-diam. Orang lain bisa pulang dan melepas perannya. Kamu jarang bisa. Tuntutan untuk selalu benar tidak berhenti di pintu kantor, jadi kamu jarang memberi izin pada dirimu sendiri untuk bersikap longgar. Selalu ada standar baru yang harus dikejar. Orang melihat ketenanganmu. Mereka jarang melihat berapa banyak yang kamu tahan untuk tetap terlihat tenang.

**Grounding:** occurrences = month stem 癸, day branch 癸 (spouse seat: `spouse_palace.provenance.seat_god
正官`), hour stem 癸. Kantor / rencana / rumah = Pilar Kerja / Pilar Arah / Fondasi Pasangan. "Arena harianmu"
and "standar baru" = `element_dominant_Water` gift/cost. "Satu kali saja..." is interpretation of the
convergence count: meaning from `label_meaning`, not a new fact. **Boundary flag:** "berapa banyak yang kamu
tahan" is a psychological reading of cost ("jarang memberi izin longgar"). It is stated as `jarang`, not as
certainty (H10).

### S4. Compat: both people first, then the dynamic

**Before:** the whole round-2 compat reading, about 430 words in five blocks: Inti Menghidupi, Ruang Pribadi
dan Dampak, Penyeimbang Unsur, Pola Kontras, the P5 paragraph.

**After (sample, about 500 words; a full v2 reading would carry every pair fact the same way):**

> **Kamu dalam Hubungan Ini**
>
> Kamu adalah Matahari: Api yang terasa sebelum bicara, dengan tenaga yang harus terus diisi dari luar, karena tidak ada unsur Kayu di baganmu. Karakter dominanmu adalah Aspek Pengelola (Direct Wealth). Kamu dipercaya memegang hal penting dan merawatnya dengan rapi. Dalam hubungan, ini biasanya berarti kamu yang mengurus, merencanakan, dan memastikan semuanya berjalan. Hubungan yang terasa wajar bagimu adalah hubungan dengan tanggung jawab yang jelas, karena Aspek Pengatur duduk di Fondasi Pasanganmu.
>
> **Dia**
>
> Dia adalah Gunung (The Mountain), unsur Tanah, dan Tanah mengisi bagannya jauh lebih banyak daripada unsur lain. Dia tempat orang berpijak. Apa yang dititipkan padanya tidak dibiarkan jatuh. Bagannya berdiri di titik tengah yang stabil, jadi perubahan mendadak yang membuat orang lain kehilangan arah biasanya hanya menggeser langkahnya sedikit.
>
> Karakter dominannya adalah Aspek Pendamping (Friend). Dia terbiasa menyelesaikan semuanya sendiri, dan meminta tolong terasa lebih berat baginya daripada mengerjakan sesuatu dua kali. Di Pilar Akar-nya, tempat asal-usul dan keluarganya dibaca, ada Mata Pisau: titik di mana dia berhenti menimbang dan langsung memutuskan. Di Pilar Kerja-nya ada Bintang Perantau: diam terlalu lama di satu tempat membuatnya gelisah. Pendiriannya kokoh. Harganya, masukan sukar masuk, dan apa yang ia tahan terlalu lama di dalam akhirnya mengeras.
>
> **Di Antara Kalian**
>
> Api milikmu memberi energi ke Tanah miliknya. Api yang menyala meninggalkan tanah yang lebih subur, dan begitulah alurnya di antara kalian. Hampir selalu kamu yang membuka pembicaraan soal rencana baru. Dia menyambut, lalu menjalankannya dengan tenang, karena bagannya memang dibuat untuk menjadi pijakan. Tapi ingat dari mana tenagamu datang. Di hubungan ini kamu yang paling sering memberi, dan Api yang terus memberi tanpa diisi akan cepat habis.
>
> Di titik ini arusnya berbalik. Dia membawa Kayu, unsur yang sama sekali tidak ada di baganmu, dan justru unsur yang menjadi bahan bakar Api-mu. Kamu membawa Air, unsur yang paling dibutuhkan bagannya. Kalian masing-masing memegang sesuatu yang tidak ada di bagan yang lain.
>
> Kursi pasangan kalian, cabang hari masing-masing, tidak langsung saling tarik. Tapi dua bagian hidupnya menyentuh kursimu dari samping. Pilar Akar-nya berbenturan dengan Fondasi Pasanganmu. Pilar Arah-nya, tempat rencana masa depannya dibaca, bergesekan dengannya. Yang paling terasa di rumahmu datang dari dua hal di sekitar dirinya: urusan keluarganya dan rencana jangka panjangnya. Saat salah satunya sedang berat, kamu merasakannya lebih dulu, sebelum dia sempat cerita. Pilar Akar yang sama juga membawa Mata Pisau-nya. Dari arah sebaliknya, Pilar Kerja-mu terikat dengan kursi pasangannya. Caramu bekerja adalah salah satu hal yang menarik dia mendekat. Ini peta untuk dibaca bersama, bukan penilaian atas hubungan kalian.
>
> Kalian dekat dengan cepat, dan kedekatan itu pekat. Yang sering bersimpangan adalah ritme harian: siapa mengurus apa, kapan, dan dengan cara siapa. Kamu membaca sebuah kejadian dari apa yang perlu dirawat dan diamankan. Dia membacanya dari apa yang bisa ia tangani sendiri. Dua orang mendengar kabar yang sama, lalu pulang dengan dua cerita berbeda.
>
> **Penutup**
>
> Hubungan ini meminta kamu menjaga dari mana tenagamu datang, karena di sini kamu yang paling sering memberi. Hubungan ini juga meminta kamu menjelaskan caramu memandang sesuatu sebelum dia menyimpulkannya sendiri. Dari dia, hubungan ini meminta kesediaan untuk bercerita lebih awal saat urusan keluarga atau rencananya sedang berat.

**Grounding:**
- Act 1: her mirror facts (`strength_weak`, `element_missing_Wood`, main profile, `spouse_palace.seat_god`).
  **Not in the pair payload today (§2.5).**
- Act 2: his mirror facts (`strength_balanced`, `element_dominant_Earth`, `badge_羊刃` at Pilar Akar,
  `badge_驛馬` at Pilar Kerja, `day_master_Earth` gift/cost). **Not in the pair payload today.**
- Act 3: `p1_stem_relation.cycle a_produces_b`. "Api yang terus memberi tanpa diisi" connects that cycle with
  HER `strength_weak`. Both supplied, a connection, not a new fact. `p3_supply` both directions,
  `receiver_favourable_rank 0` both. `p2_palace_frame`: b_hits_a 冲 午 year -> 子 day, 害 未 hour -> 子 day;
  a_hits_b 六合 酉 month -> 辰 day. "Pilar Akar yang sama juga membawa Mata Pisau-nya" is CO-LOCATION ONLY
  (the §1 rule in action). `p4` contrasting, `p5` q2 (pull high, fit low).

**Boundary flags for Reyner:**
1. "Caramu bekerja adalah salah satu hal yang menarik dia mendekat" reads the 六合 (bond, `label_meaning`
   "daya tarik alami") from HER work pillar to HIS seat. Interpretation, not stated in the JSON. Allowed?
2. "Api yang menyala meninggalkan tanah yang lebih subur" is the classical image of Fire producing Earth.
   Restrained imagery (H8), or too much?
3. Act 2 names his costs ("masukan sukar masuk"). H17 proposal: portraits carry gift AND cost evenly for both
   people. Act 1 carries hers (tenaga dari luar).

---

## 6. Round 2 (Code), after the R column is marked

1. **Prompt v2 behind a version switch**, preview only. Rewrite `renderer-prompt.txt` and
   `compat-renderer-prompt.txt` from the ruled H-rows. The positive target (§4) goes FIRST, bans after. The
   prompt should get SHORTER, not longer.
2. **Engine (small, no new BaZi):** drop `actionable` from `must_cover` (H7). Add each person's portrait
   facts to the pair payload by reusing `buildSemanticJson` for A and B (H16). No new tables, no new rules.
3. **Gate:** coverage change (H9) and token-ban scoping (H13, H14). **Each accept-changing edit is its own
   commit with its own `STAGE6_VERSION` bump** (CLAUDE.md, GATE CHANGES SHIP ISOLATED).
4. **Measure:** Gemini renders for 5 fixture charts + 2 pairs under v1 and v2. Report hard fails, soft
   regenerations, floor rate, words per reading. Send Reyner the PDFs side by side.
5. **Reyner judges one question:** would a person pay to read v2? Then ship or park (cap).

**Deliberately NOT in v2:** new engine facts (roots, polarity, 藏干 roots of the Day Master). Gemini's
"two Si branches root your Fire" is exactly that kind of fact. Adding it is engine work needing a second
source (Joey's plotter), not recall. Park unless round 2 shows it is the missing piece.

---

## 7. Reyner rules (paste-ready)

| # | Question | Cowork recommends | R |
|---|---|---|---|
| Q1 | Adopt the principle and the co-location / causation line (§1)? | yes | |
| Q2 | H5-H18 as proposed in §3? (mark rows that differ) | yes | |
| Q3 | Compat three acts + portrait facts in the pair payload? | yes | |
| Q4 | Length targets: mirror 1,200-1,600 words, compat 1,800-2,500? | yes | |
| Q5 | Boundary flags S4.1 / S4.2 / S4.3: allowed? | 1 yes, 2 yes, 3 yes | |
| Q6 | Is S1-S4 "significantly more like something a person would pay to read"? Rewrite any line in your register. | (Reyner's call alone) | |
| Q7 | If DOKU clears before round 2 ends: launch on v1 and ship v2 after, or hold? | launch on v1 if round 2 is more than a week out | |
