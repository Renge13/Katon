<!--
STATUS: RULED CONTENT - Reyner's tranche-2a rulings, 2026-08-12. Register is Reyner's; the base
text is his rewrite of Cowork's proposals. These strings replace the named fields in
docs/content/glossary.json VERBATIM.
Origin: PROGRESS.md "MIRROR QA VERDICT 2026-08-10", fix plan step 2, tranche 2a.
Drafted on a clean tree at 9882a57 (2026-08-11 18:36 +0700).

ON MAIN FIRST, ALONE, BEFORE THE PR THAT APPLIES IT. The #28 precedent: decision state never
lives on the branch it rules on.

APPLY WITH:  node scripts/apply-rulings.mjs docs/content/tranche2a-rulings.md --expect 28

ONE PREREQUISITE, AND IT IS NOT OPTIONAL. `elemen_dominan` is a NEW GROUP. apply-rulings.mjs
exits non-zero on a missing node ("REFUSING: no glossary node for ..."), so the five keys must be
scaffolded in glossary.json BEFORE the script runs, in the SAME content commit:

    "elemen_dominan": {
      "_note": "Keyed by facts.js elementRelation() -> relation_to_day_master. Not by element.",
      "same":          { "name_id": null, "name_en": "Dominant Self Element" },
      "feeds":         { "name_id": null, "name_en": "Dominant Resource" },
      "drains":        { "name_id": null, "name_en": "Dominant Output" },
      "is_controlled": { "name_id": null, "name_en": "Dominant Wealth" },
      "controls":      { "name_id": null, "name_en": "Dominant Officer" }
    }

`name_id: null` follows the elemen_hilang precedent - the element's Indonesian name reaches prose
from provenance.element, not from this cell. The WIRING (facts.js reading this group instead of
GLOSSARY.elemen) is a SEPARATE commit, measured on its own. Rule 13.

BOTH FLAGGED NOTES ARE CLOSED, 2026-08-12, by Reyner. `dengan jernih` confirmed at aspek.傷官 (it is
already the applied text); `output`/`input` stay as ruled in elemen_dominan.drains. NOTHING IN THIS
FILE IS PENDING. A later session must not read either note as an open question.

TWO NOTES ON THE COMMIT MESSAGE. This file carries the tranche AND a register sweep (section 6).
The message must name both - `git add -A` sweeping in more than the subject line describes has
already happened twice in this repo.
-->

# Tranche 2a - ruled strings (apply verbatim)

Twenty-eight assignments. Sections 1 to 5 are the tranche; section 6 is a register sweep of
Reyner's already-ruled `gampang` -> `mudah` swap in cells tranche 1 never touched.

Every string in sections 1 to 5 was checked against `lib/validate/blocklist.json` (67 compiled
patterns) plus banned typography, question marks, the `bukan X tapi Y` construction, `pasti akan`,
`100%` and the slang list. One hit was found and bent; it is recorded at 4.1. Everything else is
clean as ruled.

## elemen_dominan.same
- label_meaning: "Baganmu didominasi elemen diri. Kamu melangkah tanpa perlu izin orang lain, dan tak suka ruang pribadimu diatur-atur."
- gift_seed: "Pendirianmu kokoh. Saat orang lain ragu, arahmu tetap jelas."
- cost_seed: "Kepala keras membuat masukan sukar masuk. Kamu baru sadar salah jalan setelah dampaknya telanjur besar."
- actionable_seed: "Pilih satu orang yang berani menyanggahmu, lalu minta pendapatnya sebelum mengambil keputusan besar. Dengarkan sampai habis tanpa memotong."

  Fires on fixture charts 2 (Tanah) and 8 (Logam). 比劫 saturating.

## elemen_dominan.feeds
- label_meaning: "Baganmu sarat elemen penopang. Bantuan, ilmu, dan perlindungan mengalir lebih mudah kepadamu dibanding orang lain."
- gift_seed: "Kamu jarang krisis bekal. Selalu ada yang membimbing atau membukakan jalan."
- cost_seed: "Terlalu nyaman ditopang membuatmu terus menunda eksekusi. Kamu terjebak dalam masa persiapan yang tak kunjung usai."
- actionable_seed: "Pakai satu ilmu atau persiapan yang sudah lama kamu tumpuk minggu ini, meski rasanya belum sempurna. Ilmu baru hanya berguna setelah yang lama dipakai."

  Fires on fixture charts 7 (Air) and 11 (Tanah). 印 Resource saturating.

## elemen_dominan.drains
- label_meaning: "Baganmu terisi oleh karya dan output. Energi mengucur lewat ide, kreasi, dan kejelian melihat ruang perbaikan."
- gift_seed: "Ide dan karya mengalir tanpa henti. Kamu tak pernah kehabisan gagasan."
- cost_seed: "Output-mu menguras habis input-mu. Kamu terus memberi sampai lupa mengisi ulang daya diri sendiri."
- actionable_seed: "Selesaikan satu tugas sepenuhnya sebelum menyentuh yang baru, dan sisihkan satu hari seminggu bebas dari target output apa pun."

  Fires on fixture charts 4 (Kayu) and 5 (Tanah). 食傷 Output saturating. Chart 5 is the
  "Beban yang Menetap" complaint: she is a Fire day master who was being served the Earth
  person's paragraph, and her Pemijar block and her dominant-Earth block are the same mechanism.

  REGISTER NOTE, RAISED AND CLOSED 2026-08-12. Three of these four strings carry bare English
  (`output`, `input`). Mechanically they are safe: `style.english_leakage` checks a fixed
  function-word list (the, your, you are, this is, which, because of, however, therefore) and none of
  these match, and no blocklist pattern fires. So this was a register call, not a gate risk, and it
  belonged to Reyner alone. The only test worth applying is rule 23's shape - a term the reader can
  point at is fine, a term she must decode is not.

  **REYNER, 2026-08-12: `output` and `input` STAY exactly as ruled.** The flag is closed, not
  outstanding. Do not re-raise it in a later tranche without new evidence from a real read.

## elemen_dominan.is_controlled
- label_meaning: "Baganmu dipenuhi hal-hal yang menuntut pengelolaan: peluang, tanggung jawab, dan urusan orang lain."
- gift_seed: "Kesempatan tak pernah habis di tanganmu. Kamu selalu punya objek untuk dikelola."
- cost_seed: "Urusan melebihi kapasitas fisikmu. Perhatianmu terpecah dan banyak hal terbengkalai setengah jalan."
- actionable_seed: "Pilih hanya tiga prioritas utama untuk kuartal ini dan parkir sisanya. Fokus selesaikan tiga hal itu sebelum menyentuh daftar tunggu."

  Fires on fixture chart 13 (Tanah). 財 Wealth saturating. Chart 13 is the second Earth-dominant
  chart and today receives chart 2's paragraph word for word.

## elemen_dominan.controls
- label_meaning: "Baganmu didominasi tuntutan luar: aturan, beban tanggung jawab, dan ekspektasi publik."
- gift_seed: "Kamu tangguh di bawah tekanan. Situasi yang menakutkan bagi orang lain adalah arena harianmu."
- cost_seed: "Tekanan bertubi-tubi membuatmu tak pernah merasa cukup. Selalu ada standar baru yang menghantuimu."
- actionable_seed: "Lepaskan satu beban yang sebenarnya bukan kewajibanmu bulan ini. Sampaikan batas ini dengan tegas kepada pihak terkait."

  Fires on fixture chart 1 (Air). 官殺 Officer saturating.

## kekuatan.balanced
- actionable_seed: "Tentukan satu komitmen untuk enam bulan ke depan dan tuliskan alasannya. Begitu ragu menghampiri, baca ulang catatan itu alih-alih menunggu dorongan luar."

  Fires on 8 of 13 fixture charts (2, 3, 5, 6, 8, 10, 11, 13). Prompt K put strength in the
  OPENING SPINE of every reading, so until now the block where 8 of 13 readers meet themselves
  carried no action line at all. This is the highest-frequency gap tranche 2a closes.

## kekuatan.strong
- actionable_seed: "Alirkan energi lebihmu ke satu kegiatan fisik atau proyek intensif setiap minggu, agar tak tumpah menjadi konflik dengan orang terdekat."

  Fires on 0 of 13 fixture charts. The fixture has no strong day master; production will.

## aspek.傷官
- actionable_seed: "Tunda penyampaian kritik saat kamu emosi. Besoknya, sampaikan hanya satu poin perbaikan beserta dampaknya dengan jernih. Satu masukan yang diterima jauh lebih bernilai dibanding lima yang ditolak."

  ONE WORD BENT, 2026-08-12, CONFIRMED BY REYNER SAME DAY. As ruled, the middle sentence ended
  `...beserta dampaknya secara jernih`. That trips `style.adverbial`, whose pattern is
  `\bsecara \w+` - the renderer-prompt bans the `secara ...` adverbial outright, and the repo's own
  invariant test NO ENGINE STRING WOULD TRIP THE STYLE GATE asserts no glossary string carries one.
  A seed that trips the gate punishes the renderer for faithfully carrying engine content, which is
  the failure `f068352` cleaned out of twelve cells. THE SENTENCE BENDS, NOT THE CHECK - the same
  ruling Reyner made on aspek.比肩 in tranche 1.

  Only the preposition moved: `secara jernih` -> `dengan jernih`. Both were checked; `dengan jernih`
  raises no finding. A second candidate, `sejelas mungkin`, was rejected because it trips
  `style.hedging` on `mungkin`.

  **REYNER, 2026-08-12: `dengan jernih` CONFIRMED.** It is already the text at the `actionable_seed`
  line above, so the ruled string and the applied string are the same thing and nothing needs
  re-applying. The rejected alternative - deleting the two words - is recorded for the reasoning only
  and is NOT a live option. This note is closed.

## relasi_cabang.六合
- actionable_seed: "Saat satu pilar kehidupanmu terguncang, jaga pilar pasangannya tetap berjalan rutin. Menjaga satu pilar tetap stabil mencegah efek domino ke area lainnya."

  Fires on 3 of 13 fixture charts (2, 5, 9). This line deliberately does NOT name the two life
  domains. Which two a reader's 六合 links depends on her chart: the engine pre-verbalises the
  PLACE in `provenance.positions_id` (chart 5 returns "Pilar Diri dan Pilar Arah"), but the
  life-domain gloss is `pilar.*.domain_id`, added as data in tranche 1 and read by nothing yet.
  Naming the domains is the queued renderer pass, item (a). This wording works without it and
  sharpens for free when the join lands.

## elemen.土
- label_meaning: "Orang menaruh hal-hal penting padamu karena kamu tidak mudah goyah. Kamu menampung lebih banyak beban dari yang terlihat di permukaan."

  SWEEP, not authoring: `gampang` -> `mudah`, Reyner's tranche-1 ruled swap, in a cell tranche 1
  never touched. Meaning unchanged, one token.

  NOTE ON WHAT THIS CELL IS FOR, after the wiring commit lands. `elemen` is then consumed by
  exactly one fact, `day_stem` (facts.js:194), and `ACTIONABLE_KINDS.day_stem` is false by design -
  she IS Fire, the reading opens on it, there is no move. RULED 2026-08-12: elemen.木, 土 and 金 get
  NO action lines. An action line there would ship as prose and buy no rank, which is bandwidth
  spent for nothing.

## shio.未
- trait: "Peka pada detail yang dilewati orang lain. Lembut di luar, tetapi tidak mudah digoyahkan."

  SWEEP. `trait` is not in the renderer's field set today, so this string does not reach prose;
  swept anyway so the file is consistent when something does read it.

## salah_dikira.乙
- line: "Orang mengira kamu mudah mengikuti arus. Kamu hanya sedang menunggu celah, dan arah tujuanmu tidak pernah berubah."

  SWEEP. `salah_dikira` is exempt from the style-gate invariant. It is not exempt from Reyner's
  register.

## salah_dikira.丁
- line: "Orang mengira kamu mudah mengalah. Kamu hanya memilih dengan sangat hati-hati siapa yang layak kamu terangi."

  SWEEP.
