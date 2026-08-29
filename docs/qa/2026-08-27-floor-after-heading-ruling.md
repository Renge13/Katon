<!--
STATUS: ARTIFACT. Claude Code, 2026-08-27. A floored reading served through the real routes and
the real page after the 2026-08-26 rule-21 heading ruling, so the new floor shape is a file
someone can open and cite rather than a paste in a pull request.

IT COST NOTHING. See THE METHOD below - the point of recording it is that it is repeatable, and
that the same arrangement is a live PRODUCTION failure mode rather than only a testing trick.
-->

# The floor, after the heading ruling

**What this answers:** what does a reader actually get when the provider fails, now that the
heading names the fact and the body opens on the meaning?

- **Ruling:** `docs/PROGRESS.md`, RULED 2026-08-26 - a heading directly above a meaning paragraph
  fully satisfies rule 21's "same breath".
- **Chart:** 1994-03-22 07:00, female. 丁 Api Unggun / The Bonfire.
- **Served:** `source: module_assembly` · `model: null` · `cached: false` ·
  `stage6_version: 1.17.0-floor` · 9 blocks · `penutup: ""`
- **`penutup` is empty by design**, not by failure: no glossary entry contains a closing verdict
  and assembling one would mean authoring it (`lib/render/fallback.js` header).

---

## THE METHOD, AND IT COST NOTHING

```bash
# .env.development.local (gitignored), then: npm run dev
GEMINI_API_KEY=invalid-key-so-every-call-fails-and-the-floor-serves
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

```bash
curl -s -X POST localhost:3000/api/mirror -H 'Content-Type: application/json' \
  -d '{"birthDate":"1994-03-22","birthTime":"07:00","gender":"female"}'
curl -s localhost:3000/api/mirror/<token>
```

**AN INVALID KEY EXERCISES THE FLOOR PATH END TO END, THROUGH THE REAL ROUTES AND THE REAL PAGE.**
Nothing is stubbed and no code is modified. `POST /api/mirror` writes the row, `GET
/api/mirror/[token]` runs the real render chain, every provider call fails, the regeneration budget
exhausts, `assembleFallback` serves, and `/r/<token>` renders it - confirmed in the browser at
375px: the eyebrow reads `API`, then 21 paragraphs of body. Empty `SUPABASE_*` keeps it on the
in-memory store, so no production row is written either.

**It is free** because a failed provider call bills nothing. That is the whole reason this artifact
exists as a file: the previous version of this reading lived only in a pull-request body, because it
had been served from a dev server nobody else could reach.

**TWO CODE FACTS ABOUT WHY THIS WORKS, because they differ and the difference matters** (verified
2026-08-27, `sed -n '222,226p' lib/render/config.js`):

```js
export function renderFenceReason() {
  if (process.env.NODE_ENV !== 'production') return null;
  if (!process.env.GEMINI_API_KEY) return 'gemini_api_key_unset';
  return null;
}
```

- **Locally the fence is a no-op.** `next dev` sets `NODE_ENV=development`, so it returns null
  before the key is even looked at. The invalid key then fails every call on its own merits.
- **In production the fence checks PRESENCE, never VALIDITY.** So an invalid, revoked, expired or
  refused key passes it, exactly as it passes here. **This is not only a testing trick - it is a
  live production failure mode**, and it has its own row in the deferred register
  (`docs/PROGRESS.md`, "THE RENDER FENCE CHECKS THAT A KEY EXISTS, NEVER THAT IT WORKS").

---

## WHAT TO LOOK AT

**`Kuat` is the case the ruling turns on.** `kekuatan.strong`'s `label_meaning` never restated its
own label, so under the superseded conditional suppression it kept an inline `"Kuat (Strong)."`
purely to satisfy `kekuatan._note`. Under the ruling the heading carries the verdict and the
exception disappears - the body opens straight on the meaning.

**`Aspek Pemikir` and `Tanda Kekosongan`** are the stutter Reyner originally reported. The heading
names the fact once; the palace still leads the body, because it is provenance a `required_point`
demands and Stage 6 caught the floor dropping it once already.

**`Api`** shows what was NOT changed: the archetype identity clause is a ruled sentence rather than
a bare label, and it stays. It is what stops the floor opening on a noun phrase.

---

## THE READING, VERBATIM

### Api

Kamu adalah Api Unggun (The Bonfire) dengan unsur Api. Kehadiranmu langsung terasa sebelum kamu bicara. Kamu menerangi sekitarmu lebih dulu sebelum menghangatkan dirimu sendiri, dan nyala itu memakai tenaga yang tidak mengisi dirinya sendiri.

Orang-orang berkumpul di sekitarmu tanpa perlu kamu undang. Suasana ruangan berubah saat kamu masuk. Api selalu membutuhkan bahan bakar dari luar. Kamu tidak bisa terus menyala hanya dari cadangan energimu sendiri. Atur jadwal untuk mengisi energimu seserius kamu mengatur jadwal kerja. Sediakan waktu untuk bertemu orang atau mendatangi tempat yang bisa memulihkan tenagamu. Jangan tunggu sampai bateraimu benar-benar habis baru mencari cara untuk pulih.

### Kuat

Sumber tenagamu lahir langsung dari dalam dirimu sendiri. Kamu sanggup berjalan mandiri lebih jauh dari kebanyakan orang. Daya tahanmu nyata dan solid. Tekanan keras yang membuat orang lain menyerah justru bisa kamu balikkan menjadi bahan bakar untuk maju. Energi sebesar ini membutuhkan saluran yang jelas. Tanpa arah dan kesibukan yang tepat, tenaga berlebih itu berbalik menjadi gesekan konstan dengan orang-orang terdekatmu. Alirkan energi lebihmu ke satu kegiatan fisik atau proyek intensif setiap minggu, agar tak tumpah menjadi konflik dengan orang terdekat.

### Aspek Pemikir

Pilar Kerja. Kamu memahami sesuatu lewat jalan intuitif yang sulit dijelaskan. Kesimpulanmu sering benar sebelum kamu sempat membuktikannya.

Kamu melihat pola yang luput dari pandangan orang lain. Firasatmu punya dasar, meski sulit diutarakan dengan kata-kata. Kamu sering merasa berjarak dari lingkungan sekitar. Menjelaskan isi kepalamu terasa lebih melelahkan daripada memikirkannya sendiri. Kamu tidak perlu menjelaskan semua alur pikiranmu. Cukup sampaikan kesimpulannya dan satu alasan paling kuat. Itu sudah cukup untuk membuat orang lain mengerti tanpa membuat energimu terkuras.

### Tanda Kekosongan

Pilar Kerja. Orang lain melihat kamu berhasil di bidang ini, tetapi kamu sendiri sering merasa belum pantas menyandangnya. Hasilnya tidak pernah kurang. Rasa memilikinya yang tidak pernah ikut hadir.

Kamu tidak pernah bersandar pada keberuntungan di bidang ini. Apa pun yang kamu capai di sana, kamu bangun murni dengan kerja keras. Pengakuan orang lain tidak pernah menempel di dalam dirimu. Orang sudah menganggapmu ahli, tetapi kamu masih terus menunggu bukti berikutnya. Pengakuan di bidang ini tidak akan menempel dengan sendirinya. Sebut hasil kerjamu dengan lantang, meskipun rasanya canggung.

### Setengah Gabungan

Pilar Kerja dan Pilar Diri. Dua dari tiga bagian sudah saling tarik. Arah geraknya sudah jelas, meski kekuatannya belum sepenuhnya padu.

Tarikan energi ini sudah bekerja untukmu dan memberi arah yang jelas. Dua dari tiga bagian sudah terhubung, jadi tinggal satu lagi yang kurang. Dalam kehidupan sehari-hari, ini terasa seperti rasa 'hampir pas': semuanya sudah jalan dan arahnya jelas, tapi kamu selalu merasa harus menambah satu hal lagi sebelum berani menyebutnya selesai. Rasa 'belum lengkap' itu hanya bagian dari polamu, bukan tanda ada yang salah. Saat muncul keinginan untuk menambah satu hal lagi, berhenti sejenak dan tanya: apakah yang ada sekarang sudah cukup untuk melangkah? Sering kali, jawabannya sudah lebih dari cukup.

### Ikatan

Pilar Akar dan Pilar Kerja. Dua bagian dari baganmu saling mengunci. Area hidup yang diwakili keduanya berjalan berdampingan; saat satu bergerak, yang lain otomatis ikut terpengaruh. Ada dua bidang hidupmu yang saling menguatkan dengan sendirinya tanpa perlu kamu atur. Saat ada masalah, keduanya ikut terdampak bersamaan. Masalah di satu area jarang berhenti di sana saja. Saat satu pilar kehidupanmu terguncang, jaga pilar pasangannya tetap berjalan rutin. Menjaga satu pilar tetap stabil mencegah efek domino ke area lainnya.

### Benturan

Pilar Akar dan Pilar Arah. Dua bagian baganmu saling berhadapan langsung. Perubahan di area ini biasanya datang mendadak dan membawa guncangan, bukan lewat proses perlahan.

Kamu terbiasa beradaptasi dengan guncangan cepat. Situasi sulit yang membuat orang lain panik sudah pernah kamu lewati. Ketenangan di area ini tidak datang otomatis. Kestabilannya butuh dijaga dengan usaha yang sadar dan terus-menerus. Perlakukan dinamika di area ini sebagai dorongan untuk naik kelas. Siapkan rencana cadangan sebelum dibutuhkan agar kamu merespons dengan strategi, bukan panik.

### Gesekan

Pilar Kerja dan Pilar Arah. Gesekan kecil yang terjadi terus-menerus, bukan benturan besar. Masalah-masalah sepele yang menumpuk perlahan hingga terasa memberatkan.

Kamu sangat peka pada detail kecil yang diabaikan orang lain. Masalah jarang membesar tanpa terdeteksi olehmu lebih dulu. Gesekan kecil ini jarang selesai total dalam sekali tindakan. Ia sering muncul kembali dalam bentuk lain yang sedikit berbeda. Bereskan kejanggalan atau masalah kecil begitu terlihat. Membiarkan gesekan kecil menumpuk hanya akan memicu ledakan yang tak perlu di kemudian hari.

### Fondasi Pasangan

Pilar Diri. Tempat membaca dinamika hubungan paling dekat. Isinya menunjukkan tekstur relasi yang terasa wajar bagimu, meskipun orang lain bisa menganggapnya berat.

---

## WHAT THIS IS NOT

- **Not a quality verdict.** It is the floor's SHAPE after a structural ruling. Whether this chart's
  prose is any good is a content read and belongs to a READ artifact.
- **Not a measure of the floor RATE.** One reading, forced. The rate is the 08-23 measurement
  (~20% at `REGENERATION_BUDGET 2`) and is unrelated to how it was forced here.
- **Not a substitute for a preview.** A Vercel preview still cannot render at all - the fence fires
  there because `NODE_ENV` is production and the key is genuinely unset. This method covers the
  FLOOR path only; the rendered path still has no free rehearsal, which is the preview-mock row.
