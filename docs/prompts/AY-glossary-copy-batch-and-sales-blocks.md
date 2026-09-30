# Prompt AY: glossary copy batch (one re-key) + the two sales blocks (Cowork, 2026-10-01)
Untracked in the working tree as `docs/prompts/AY-glossary-copy-batch-and-sales-blocks.md`. Commit it with your first change.

Cite the four checks. No regex through a shell heredoc. No model-based judge. **No prompt change** in this prompt: the fix is at the source (CHECK 3). The surviving imperatives came from command-form `actionable_seed` cells.

**The copy below is Reyner's, ruled 2026-10-01 (his v3), with three small Cowork edits he approved when pasting this prompt.** They are marked ‡:
1. adding back "-mu" and "baganmu" where a line lost its person;
2. using the approved Tanah line's word order ("… paling banyak muncul di bagan") for every Dominan line;
3. "pegangan kokoh" instead of "pegangan kuat" in the balanced-strength cell.

Cells Reyner did not edit keep Cowork's v1 draft (`docs/prompts/KATON-copy-batch-v2-2026-10-01.md` §6); they are marked (v1). Build every string **byte for byte** as written here.

## §1. PR 1: glossary (`docs/content/glossary.json`)

### `actionable_seed`
| Cell | Final |
|---|---|
| aspek 比肩 | Kebiasaan mengurus semuanya sendiri membuat orang lain jarang menawarkan bantuan, padahal menyampaikan kebutuhan lebih awal meringankan beban sebelum menumpuk. |
| aspek 劫財 (v1) | Satu pencapaian utama dengan target yang dikunci minimal setahun sering menjadi jangkar yang kamu butuhkan. Peluang baru, semenarik apa pun, bisa menunggu sampai tenggatnya tiba. |
| aspek 食神 | Kualitas kerja tidak bersuara sendiri, sehingga rekam jejak yang ditunjukkan langsung kepada pihak tepat membuat kontribusi diakui tanpa menunggu pujian. |
| aspek 傷官 | Kritik yang ditahan sampai emosi reda jauh lebih didengar, karena satu poin perbaikan jernih esok harinya lebih bermakna daripada banyak perdebatan. |
| aspek 正財 | Beban kerja menumpuk ketika semuanya dipegang sendiri, sehingga melimpahkan satu tugas kepada orang lain adalah awal baik meski hasilnya tidak sesempurna buatan tanganmu. |
| aspek 偏財 (v1) | Peluang yang sudah di tangan layak dieksekusi tuntas sebelum kamu mengejar yang baru. Peluang yang setengah jalan hanya membuang energi. |
| aspek 正官 (v1) | Waktu untuk santai tidak akan datang dari orang lain, karena mereka justru bersandar pada disiplinmu. Jadwal santai yang kamu buat sendiri, bebas dari tuntutan untuk selalu benar, akan bertahan kalau kamu menjaganya seserius aturan kerja. |
| aspek 七殺 | Tantangan baru perlu ditimbang apakah memang esensial atau sekadar bentukan pikiran sendiri, agar waktu istirahat terjadi karena pilihan bukan kelelahan. |
| aspek 正印 | Tenggat waktu lebih efektif mengakhiri masa persiapan daripada menunggu perasaan siap, karena langkah pertama membuka jalan dan petunjuk baru muncul setelah bergerak. |
| aspek 偏印 | Penjelasan panjang lebar tidak diperlukan, sebab kesimpulan akhir dan satu alasan terkuat sudah cukup membuat orang lain mengerti tanpa menguras tenaga. |
| bintang 桃花 | Pesona alami membuka pintu dengan mudah, tetapi kedekatan nyata butuh waktu, sehingga kehadiran konsisten adalah cara merawat hubungan. |
| bintang 天乙貴人 (v1) | Pertolongan di baganmu ada, tetapi bentuknya menunggu diminta. Meminta lebih awal dari yang terasa nyaman membuatnya lebih cepat sampai kepadamu. |
| bintang 驛馬 (v1) | Di tengah perubahan, satu jangkar yang stabil, entah pekerjaan atau relasi, membuatmu tetap berpijak. Saat hasrat berpindah muncul, mengubah rutinitas kecil lebih dulu memberi ruang untuk menimbang sebelum membongkar hal besar. |
| bintang 空亡 | Pengakuan atas prestasi sering kali tidak otomatis berbekas, sehingga menyebutkan hasil kerja dengan suara lantang membantu mengakui kemenangan tersebut sebagai milikmu. |
| bintang 羊刃 (v1) | Keputusan memutus hubungan atau komitmen lebih jernih setelah diendapkan semalam. Ketegasanmu tidak akan luntur hanya karena kamu menundanya sehari. |
| bintang 文昌 (v1) | Setiap kali selesai mempelajari hal baru, satu penerapan kecil dalam tujuh hari membuat ilmunya benar-benar menempel. Teori baru terasa berharga setelah ada wujud nyatanya. |
| bintang 孤辰 (v1) | Saat kamu butuh menyendiri untuk mengisi ulang energi, satu kalimat kabar singkat ke orang sekitarmu sudah cukup mencegah prasangka yang tak perlu. |
| elemen 火 | Waktu pemulihan diri layak diatur seserius jadwal kerja, agar proses pemulihan terjadi sebelum tenaga benar-benar habis. |
| elemen 水 | Aturan yang terlalu kaku sulit dijalani, sehingga memegang tujuan akhir sambil membebaskan cara mencapainya membuat komitmen bertahan lama. |
| kekuatan weak | Lingkungan sekitar sangat menentukan besar kecilnya energi, sehingga memastikan ada sumber pengisi daya sebelum mengambil peran baru mencegah kehabisan tenaga. |
| kekuatan balanced ‡ | Komitmen tertulis untuk enam bulan ke depan menjadi pegangan kokoh saat keraguan datang, jauh lebih diandalkan daripada menunggu dorongan luar. |
| kekuatan strong | Energi berlebih paling pas disalurkan ke satu kegiatan fisik atau proyek intensif mingguan, agar tenaga tidak meluap menjadi konflik percuma. |
| elemen_hilang 木 | Dorongan berpindah haluan jarang muncul sendiri, sehingga pemicu luar seperti tanda kalender atau janji lebih bisa diandalkan untuk mulai melangkah. |
| elemen_hilang 火 ‡ | Kabar pekerjaan berkala yang diselingi obrolan santai membuat kehadiranmu tetap terasa, sebab ikatan sulit terbangun jika kamu terus bersembunyi di balik layar. |
| elemen_hilang 土 | Rutinitas kecil yang diulang pada jam sama setiap minggu menjadi pijakan kokoh untuk membangun kestabilan fisik dan pikiran. |
| elemen_hilang 金 | Urusan menggantung selesai lebih efisien lewat percakapan lugas, karena membiarkan masalah berlarut jauh lebih menguras energi daripada ketegangan sesaat. |
| elemen_hilang 水 | Tiga prinsip utama yang dipadukan dengan kebebasan penuh memberi pegangan tanpa membuat kaku, sebab mempertahankan metode lama semata kebiasaan bukanlah integritas. |
| elemen_dominan same (v1) | Satu orang yang berani menyanggahmu sangat berharga sebelum keputusan besar. Pendapatnya paling berguna kalau kamu mendengarkannya sampai habis tanpa memotong. |
| elemen_dominan feeds (v1) | Satu ilmu atau persiapan yang sudah lama kamu tumpuk bisa mulai dipakai minggu ini, meski rasanya belum sempurna. Ilmu baru hanya berguna setelah yang lama dipakai. |
| elemen_dominan drains (v1) | Menuntaskan satu tugas sebelum menyentuh yang baru, dan menyisihkan satu hari seminggu tanpa target output apa pun, memberimu waktu untuk mengisi ulang. |
| elemen_dominan is_controlled (v1) | Tiga prioritas utama untuk kuartal ini, dengan sisanya diparkir dulu, membuat perhatianmu tidak terpecah. Daftar tunggu bisa disentuh setelah tiga hal itu selesai. |
| elemen_dominan controls (v1) | Bulan ini, melepas satu beban yang sebenarnya bukan tanggunganmu bisa terasa melegakan. Batas itu paling terjaga kalau kamu menyampaikannya dengan tegas kepada pihak terkait. |
| relasi 六合 | Saat satu bagian hidup goyang, menjaga rutinitas pasangannya tetap berjalan menjadi penahan efektif agar efek domino tidak menyebar. |
| relasi 半合 | Perasaan belum pas sering kali merupakan bagian dari ritme alami, sehingga jeda singkat menunjukkan bahwa apa yang ada di tangan sebenarnya sudah memadai. |
| relasi 冲 | Gejolak di area ini berfungsi sebagai dorongan untuk naik kelas, di mana rencana cadangan membuat respons terhadap keadaan berjalan dengan strategi matang. |
| relasi 害 | Masalah atau kejanggalan kecil lebih mudah diurai begitu terlihat, karena membiarkan masalah menumpuk hanya memicu ledakan emosi tidak perlu. |
| relasi 刑 | Pola rumit dapat ditelusuri kembali ke keputusan awal, dan karena prosesnya dimulai dari diri sendiri, kendali untuk mengubah arah sepenuhnya berada di tanganmu. |

### `kekuatan.balanced.cost_seed` ‡
Arah hidupmu sepenuhnya berada di tanganmu sendiri, karena baganmu tidak mendikte satu jalan ekstrem tertentu.

### `elemen_dominan.*.label_meaning` ‡
| Cell | Final |
|---|---|
| same | *(unchanged, approved)* Unsur dirimu paling banyak muncul di bagan. Kamu melangkah tanpa perlu izin orang lain, dan tak suka ruang pribadimu diatur-atur. |
| feeds | Unsur penopangmu paling banyak muncul di bagan. Bantuan, ilmu, dan rasa aman mengalir jauh lebih mudah kepadamu. |
| drains | Unsur yang kamu hasilkan paling banyak muncul di bagan. Energimu tercurah melalui ide, karya, dan kejelian melihat ruang perbaikan. |
| is_controlled | Unsur yang kamu kelola paling banyak muncul di bagan. Keseharianmu berputar pada hal yang menuntut penanganan, dari peluang hingga tanggung jawab orang lain. |
| controls | Unsur pengendalimu paling banyak muncul di bagan. Hidupmu bersinggungan dengan tuntutan luar seperti aturan yang mengikat dan ekspektasi publik. |

### Checks before PR 1 merges (report, then wait for Reyner's go)
1. **Quote every cell before and after,** from the file itself, and confirm the count matches this prompt: 37 advice lines, 1 cost line, 4 meaning lines.
2. **Sweep every new string for:**
   - "harus", "wajib", "ingatlah", "jangan", "pastikan", "cobalah" as a command, and any other line opening with a bare command verb;
   - "?";
   - the Stage 6 blocklist (as the gate compiles it), D1 and the copy-bank typography rules.

   List every hit. None is expected; "memastikan" as a verbal noun is not a command. Show red first with one planted command.
3. **Replay** every stored draft through the gate. List every finding that moves.
4. **The floor:** show before/after text for one floor block that prints an `actionable`, and for the appendix row of one Dominan variant.
5. **Card B pixel gate:** expected to be unchanged, because these cells are not on the card. If a chart moves, follow the standing re-baseline rule (before/after images in this PR).
6. **Re-key:** every saved reading re-renders once on its next open. State the count if a read-only query is available; otherwise say so.
7. **One §3 smoke check** on the 5 charts, current prompt. Stop only if an imperative remains or a close teases. Report all five final sentences and every imperative-looking hit.

## §2. PR 2: the two sales blocks (UI, copy bank, hidden while the payment fence is closed)
Both strings go into the audited copy bank, marked REYNER-RULED 2026-10-01. Prices come from `lib/pricing.js`, never hardcoded.

### Complete Edition offer (`components/Funnel.jsx` `Offer`)
- **Eyebrow:** Complete Edition *(unchanged)*
- **Headline**, replacing "Kartu resolusi tinggi dan PDF dari bacaanmu, siap disimpan atau dicetak.": **Bacaanmu, disusun untuk disimpan.**
- **Three lines**, label then text:
  - **PDF Edisi Lengkap** — Bacaanmu secara utuh, bersama bagan kelahiran, sebaran unsur, dan tanda istimewamu.
  - **Kamus Istilah Personal** — Membedah arti di balik setiap aspek, bintang, pilar, dan relasi yang murni berasal dari baganmu.
  - **Kartu Ringkasan Visual** — Rangkuman profil yang jernih, siap disimpan sebagai pengingat atau dibagikan ke lingkaran terdekat.
- **Price row** ("sekali bayar") and **button** ("Ambil Complete Edition"): unchanged.

The dash above only separates label from text in this prompt. Render the label as its own styled line, and never print an em-dash (rule 20).

### Compatibility block (new, on the Mirror result page, directly after the Complete Edition offer)
- **Eyebrow:** Bacaan Kompatibilitas
- **Headline:** Setiap kedekatan adalah pertemuan dua pola yang berbeda.
- **Two lines:**
  - **Peta Relasi** — Masukkan tanggal lahir kalian berdua. Katon memetakan letak daya tarik, titik gesekan rawan, serta ritme harian yang dijalani bersama.
  - **Poin Utama** — Menyoroti dinamika daya tarik, area penguat, dan unsur yang saling melengkapi.
- **Price row:** the compat price from `lib/pricing.js`, with "sekali bayar".
- **Button:** Mulai Bacaan Berdua. It goes to the existing compatibility page. Report which route.
- **Fence:** hidden while `paymentFence` is closed, like the offer. Red first: rendered when open, absent when closed.
- **Events:** say whether a `compat_cta_seen` / `compat_cta_click` pair exists. If not, propose the names only; adding events is Reyner's call.

### Proof
- Screenshots at 375px and desktop with the fence forced open locally.
- A Preview for Reyner's walk.
- Report and wait for his go.

## Report
Per PR:
- commits;
- red-first proof;
- the §1 tables quoted from the file;
- sweep and replay output;
- the smoke check's five final sentences;
- screenshots and the Preview URL.

End with the split.
