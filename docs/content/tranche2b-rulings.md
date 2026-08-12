<!--
STATUS: RULED CONTENT - Reyner's tranche-2b rulings, 2026-08-12. Register is Reyner's; the base
text is his rewrite of Cowork's proposals. These strings replace the named fields in
docs/content/glossary.json VERBATIM.
Origin: PROGRESS.md "MIRROR QA VERDICT 2026-08-10", fix plan step 2, tranche 2b. Closes the pass.
Drafted after tranche 2a merged (#38 ceb77db, #39 a8859aa, 2026-08-12 +0700).

ON MAIN FIRST, ALONE, BEFORE THE PR THAT APPLIES IT. The #28 precedent.

APPLY WITH:  node scripts/apply-rulings.mjs docs/content/tranche2b-rulings.md --expect 15

NO PREREQUISITE AND NO WIRING. Every cell already exists and already carries label_meaning,
gift_seed and cost_seed; 2b adds only the missing actionable_seed. One commit, not three.
No engine path is touched.

NOTHING IN THIS FILE IS PENDING. All 15 are ruled. Five sentences were bent to clear a live gate
check - each is recorded with its pattern under the cell it belongs to, and each bend moved the
smallest possible unit of Reyner's wording. THE SENTENCE BENDS, NOT THE CHECK (the aspek.比肩
ruling, tranche 1).
-->

# Tranche 2b - ruled strings (apply verbatim)

Fifteen assignments, all `actionable_seed`. This completes the content revision pass: every
glossary cell that a fact can carry now has an action line, except the ones deliberately without
one (`elemen.*`, consumed only by `day_stem`, declared non-actionable; `bintang.天乙貴人`, ruled
NO CHANGE in tranche 1; `bintang.華蓋`, descoped).

Verified before this file was written: all 15 clean against `lib/validate/blocklist.json` (67
compiled patterns), banned typography, question marks, `bukan X tapi Y`, `pasti akan`, `100%`, the
slang list, and the `hukuman` ban. 3-gram-diffed against all 22 live action lines: no overlap.

## aspek.劫財
- actionable_seed: "Tetapkan satu pencapaian utama dan kunci targetnya minimal untuk setahun. Jangan ganti fokus sebelum tenggatnya tiba, semenarik apa pun peluang baru yang muncul."

  Fires on fixture charts 2, 4, 9. Rule 25 note: this cell is about wealth arriving and leaving,
  and the obvious action line is "set money aside", which is financial advice and banned. Ruled
  wording stays on focus and targets, never on money.

## aspek.食神
- actionable_seed: "Dokumentasikan dan kirimkan langsung hasil kerjamu ke pemangku kepentingan. Klaim kontribusimu dengan lugas tanpa menunggu orang lain menyatakannya."

  Fires on fixture charts 1, 3, 4, 5.

  BENT, one word. As ruled the second sentence read `Klaim kontribusimu secara lugas`. That trips
  `style.adverbial`, pattern `\bsecara \w+` - the renderer prompt bans the `secara` adverbial
  outright and the invariant test NO ENGINE STRING WOULD TRIP THE STYLE GATE asserts no glossary
  string carries one. Only the preposition moved: `secara lugas` -> `dengan lugas`. Verified clean.
  Deleting the two words is also clean and remains the alternative.

## aspek.偏財
- actionable_seed: "Kunci dan eksekusi tuntas satu peluang di tangan sebelum mengejar yang baru. Peluang yang setengah jalan hanya membuang energi."

  Fires on fixture charts 1, 6, 9, 10, 13 - the most frequent cell in this tranche. Same rule-25
  wire as 劫財: opportunities and energy, never money.

## aspek.七殺
- actionable_seed: "Sebelum mengambil tantangan baru, pastikan tekanannya bukan hasil ciptaanmu sendiri. Masukkan waktu rehat ke dalam jadwal sebelum tubuhmu memaksamu berhenti."

  Fires on fixture charts 3, 6, 9, 12. The `bukan` here is a plain negation, not the banned
  `bukan X tapi Y` construction, and raises no finding.

## bintang.驛馬
- actionable_seed: "Pertahankan setidaknya satu jangkar stabil, baik pekerjaan maupun relasi, di tengah perubahan. Saat hasrat berpindah muncul, ubah rutinitas kecil dulu sebelum membongkar hal besar."

  Fires on fixture charts 2, 3, 4, 11.

  BENT, punctuation only. As ruled this carried TWO EM DASHES around the parenthetical
  (`jangkar stabil—baik pekerjaan maupun relasi—di tengah`). CLAUDE.md rule 20: keyboard characters
  only, no em-dash, in user-facing strings. `style.typography` counts every one and it is the same
  class of violation as the curly quotes fixed in `75f1901`. Replaced with commas. Not one word of
  the wording changed.

## bintang.羊刃
- actionable_seed: "Endapkan keputusan memutus hubungan atau komitmen selama semalam sebelum mengeksekusinya. Ketegasan tidak akan luntur hanya karena kamu menundanya sehari."

  Fires on fixture charts 2, 6. The Yang-stems-only note on this cell (甲 卯, 丙 戊 午, 庚 酉,
  壬 子) is branch data and untouched; `lib/bazi/stems.js` stays the authority.

## bintang.文昌
- actionable_seed: "Eksekusi satu penerapan kecil dalam tujuh hari setiap kali selesai mempelajari hal baru. Memahami teori tidak berharga sampai ada wujud nyatanya."

  Fires on fixture charts 3, 4, 6, 9, 12 - tied with 偏財 as the most frequent cell here.

## bintang.孤辰
- actionable_seed: "Beri kabar singkat saat kamu butuh menyendiri untuk mengisi ulang energi. Satu kalimat pemberitahuan mencegah prasangka tak perlu dari lingkunganmu."

  Fires on fixture chart 9.

## elemen_hilang.火
- actionable_seed: "Kirim pembaruan kerja berkala tanpa diminta dan sesekali bangun obrolan informal. Kehadiran dan ikatan tidak akan terbangun jika kamu terus bersembunyi di balik layar."

  Fires on 0 of 13 fixture charts. `element_absent` carries a HIGH FIXED EXTREMITY, so on the
  production chart where it does fire it lands near the top of the reading. Low frequency, high
  placement - the fixture simply contains no chart missing Fire.

  BENT, two words. As ruled the first sentence read `Kirim pembaruan kerja berkala secara proaktif`.
  Same `style.adverbial` pattern as 食神. Replaced with `tanpa diminta`, which carries the same
  meaning in plainer Indonesian. Verified clean.

## elemen_hilang.土
- actionable_seed: "Tetapkan satu rutinitas wajib di jam yang sama setiap minggu, sekecil apa pun itu. Konsistensi fisik membangun stabilitas yang tidak dimiliki pikiranmu."

  Fires on 0 of 13 fixture charts. Same high-placement note as 火.

## elemen_hilang.金
- actionable_seed: "Beranikan diri mengakhiri urusan yang menggantung lewat satu percakapan tegas. Menggantung masalah jauh lebih menguras energi dibanding ketegangan singkat saat menyelesaikannya."

  Fires on fixture chart 5. Deliberately built around a conversation rather than a calendar date:
  tranche 1's `elemen_hilang.木` already owns the date device (`pasang tanggal keputusan di
  kalender`), two missing elements can fire on one chart, and reusing it would print near-identical
  advice twice in one reading. That is the collision Code traced to charts 2 and 8 in tranche 2a,
  where `element_dominant` and `day_stem` shared a glossary node.

## elemen_hilang.水
- actionable_seed: "Tentukan tiga prinsip non-negosiasi, lalu beri dirimu fleksibilitas penuh di luar ketiganya. Mempertahankan metode lama bukanlah bagian dari integritas."

  Fires on 0 of 13 fixture charts. Same high-placement note as 火.

  BENT, two words. As ruled this read `di luar tiga hal tersebut`. `hal tersebut` is in
  `style.essay_connectives`, banned as bureaucratic-baku under rule 20 alongside `dengan demikian`,
  `adapun` and `sebagaimana`. Replaced with `di luar ketiganya`, which is shorter and says the same
  thing. Verified clean.

## relasi_cabang.冲
- actionable_seed: "Perlakukan dinamika di area ini sebagai dorongan untuk naik kelas. Siapkan rencana cadangan sebelum dibutuhkan agar kamu merespons dengan strategi, bukan panik."

  Fires on fixture charts 3, 4, 7, 13. GOLDEN RULE 3 IS SATISFIED MORE DIRECTLY HERE THAN IN ANY
  PRIOR WORDING: a clash is a forced upgrade, never destruction, and `dorongan untuk naik kelas`
  states the upgrade outright instead of merely avoiding the word damage. Worth preserving if this
  cell is ever revisited.

## relasi_cabang.害
- actionable_seed: "Bereskan kejanggalan atau masalah kecil begitu terlihat. Membiarkan gesekan kecil menumpuk hanya akan memicu ledakan yang tak perlu di kemudian hari."

  Fires on fixture charts 6, 8, 10, 11.

  BENT, two words. As ruled this read `sesegera mungkin`. `mungkin` is in `style.hedging` - golden
  rule 7, no hedging inside a claim - and the pattern is a bare `\bmungkin\b`, so it fires even
  where the word is doing the opposite of hedging. Replaced with `begitu terlihat`, which keeps the
  immediacy. `saat itu juga` was also verified clean and is the alternative.

## relasi_cabang.刑
- actionable_seed: "Urutkan pola rumit di area ini hingga ke keputusan awal yang kamu buat sendiri. Karena kamu yang mengikat simpulnya, hanya kamu yang bisa mengubah arahnya."

  Fires on fixture charts 3, 4, 8, 12. Golden rule 3 holds: entanglement and self-authored
  complication, never punishment. `hukuman` does not appear, nor any synonym.

  OBSERVED AND JUDGED ACCEPTABLE, recorded so it is not rediscovered: this line and 冲's share the
  phrase `di area ini`, and both facts fire together on charts 3 and 4. It is three words inside
  two differently-built sentences, the existing cost_seeds for both cells already use the same
  locution, and `structure.duplicate_sentence` compares sentences rather than phrases. No finding.
