<!--
STATUS: RULED. Reyner, 2026-10-04. Twelve kompatibilitas strings, replacing values in existing cells.
Verbatim from docs/prompts/BC-amendment-2b-glossary-twelve.md (the table below is copied from it).

WHY. These twelve strings handed the compat writer "dinamika" or "menopang", the words the pair
prompt's voice line asks it to avoid (BC amendment 1). Amendment 2's re-run measured the voice line
alone: "dinamika" 10 times in 7 of 8 readings (docs/qa/2026-10-04-bc-names-close-round.md).

NOT CHANGED HERE: four MIRROR strings carry the same words - aspek.比肩.gift_seed,
kekuatan.weak.cost_seed, kekuatan.balanced.label_meaning, pilar.day.branch_label_meaning. They wait
for the mirror round.

Applied to glossary.json with:
  node scripts/apply-rulings.mjs docs/content/glossary-voice-rulings-2026-10-04.md --expect 12
Everything above the first "## " heading is ignored by that script, which is why the table is here.
-->

# glossary.json#kompatibilitas - the twelve voice lines, RULED

Reyner ruled 2026-10-04: replace the twelve compat glossary strings that handed the writer 'dinamika' or 'menopang' with the strings below, verbatim.

| key | current | ruled |
|---|---|---|
| `p0_opening.label_meaning` | Ini adalah bacaan tentang dinamika dua individu: {A} dan {B}. Lewat bacaan ini, kita akan melihat bagaimana cara kalian merespons satu sama lain di keseharian, di mana fokus kalian bertemu atau berbeda, dan apa yang sebenarnya menggerakkan ritme di balik hubungan ini. | Ini adalah bacaan tentang dua orang: {A} dan {B}. Di sini kita melihat cara kalian saling menanggapi dalam keseharian, di mana kalian bertemu dan di mana kalian berbeda, dan apa yang sebenarnya menggerakkan hubungan ini. |
| `p1_produces.label_meaning` | Unsur salah satu dari kalian memberi energi ke yang lain. Ada dinamika pengayom dan yang diayomi dengan alur yang konsisten. | Unsur salah satu dari kalian menghidupi unsur yang lain. Satu orang mengayomi, yang lain merasa diayomi, dan arah ini jarang berbalik. |
| `p1_controls.label_meaning` | Salah satu elemen membatasi atau mengarahkan yang lain. Bisa menghadirkan struktur, tapi juga tekanan, tergantung dinamika kendali di antara kalian. | Unsur salah satu dari kalian mengarahkan dan membatasi yang lain. Dari sini lahir keteraturan, dan dari sini pula lahir tekanan, tergantung siapa yang memegang kendali dan bagaimana caranya. |
| `p2_harmony.meaning_seed` | Tarikan alami bekerja di ruang paling privat. Ada rasa aman dan tempat pulang yang selalu menarik kalian berdua kembali, terlepas dari dinamika di luar. | Tarikan alami bekerja di ruang paling privat. Ada rasa aman dan tempat pulang yang selalu menarik kalian berdua kembali, seramai apa pun hari di luar sana. |
| `p2_clash.label_meaning` | Kursi pasangan kalian saling bertolak belakang. Dinamika berjalan intens, di mana gesekan kecil bisa terasa jauh lebih tajam. | Kursi pasangan kalian saling bertolak belakang. Hubungan ini jarang terasa datar, dan gesekan kecil bisa terasa jauh lebih tajam dari ukurannya. |
| `p2_none.label_meaning` | Kursi pasangan kalian berjalan terpisah tanpa tarik-menarik khusus. Dinamika utama kalian berasal dari aspek bagan lainnya. | Kursi pasangan kalian berjalan sendiri-sendiri, tanpa tarik-menarik khusus. Yang paling mewarnai hubungan kalian datang dari bagian bagan yang lain. |
| `p2_palace_frame.meaning_seed` | Salah satu pilar kehidupan pasangan menyentuh langsung ruang privatmu, membuat dinamika dari area hidupnya berdampak langsung ke suasana hubungan. | Salah satu pilar kehidupan pasanganmu menyentuh langsung ruang privatmu. Apa yang sedang ia hadapi di area hidup itu ikut masuk ke dalam hubungan kalian dan mewarnai suasananya. |
| `p2_palace_frame_reader.meaning_seed` | Salah satu pilar kehidupanmu menyentuh langsung ruang privat pasanganmu, membuat dinamika dari area hidupmu berdampak langsung ke suasana hubungan. | Salah satu pilar kehidupanmu menyentuh langsung ruang privat pasanganmu. Apa yang sedang kamu hadapi di area hidup itu ikut masuk ke dalam hubungan kalian dan mewarnai suasananya. |
| `p2_frame_clash.label_meaning` | Salah satu pilar berhadapan langsung dengan kursi pasangan. Karena posisinya berseberangan persis, dinamikanya menjadi lebih intens dan mudah memanas. | Salah satu pilar berhadapan langsung dengan kursi pasangan. Karena posisinya berseberangan persis, tekanan dari sana terasa lebih keras dan lebih cepat memanas. |
| `p5_q1.label_meaning` | Chemistry terasa kuat dan rutinitas harian saling menopang. Kuncinya adalah menjaga keterbukaan agar kenyamanan tidak dianggap biasa. | Chemistry terasa kuat dan keseharian kalian saling mengisi. Kenyamanan datang dengan mudah, dan justru karena itu ia mudah dianggap biasa. |
| `p5_q2.label_meaning` | Magnet hubungan sangat kuat, namun pola keseharian sering bersimpangan. Dinamika terasa pekat dan menuntut kompromi jelas dalam rutinitas. | Magnet hubungan sangat kuat, namun pola keseharian sering bersimpangan. Rasanya pekat dan dekat, tetapi rutinitas bersama menuntut banyak kompromi. |
| `p5_q2.meaning_seed` | Magnet emosional kuat bertemu dengan ritme harian yang sering bersimpangan, menghasilkan dinamika yang pekat, intens, sekaligus melelahkan. | Kalian sulit saling melepaskan, tetapi sulit juga berjalan dengan langkah yang sama. Hubungan ini terasa pekat, intens, dan kadang melelahkan. |

## kompatibilitas.p0_opening

- label_meaning: "Ini adalah bacaan tentang dua orang: {A} dan {B}. Di sini kita melihat cara kalian saling menanggapi dalam keseharian, di mana kalian bertemu dan di mana kalian berbeda, dan apa yang sebenarnya menggerakkan hubungan ini."

## kompatibilitas.p1_produces

- label_meaning: "Unsur salah satu dari kalian menghidupi unsur yang lain. Satu orang mengayomi, yang lain merasa diayomi, dan arah ini jarang berbalik."

## kompatibilitas.p1_controls

- label_meaning: "Unsur salah satu dari kalian mengarahkan dan membatasi yang lain. Dari sini lahir keteraturan, dan dari sini pula lahir tekanan, tergantung siapa yang memegang kendali dan bagaimana caranya."

## kompatibilitas.p2_harmony

- meaning_seed: "Tarikan alami bekerja di ruang paling privat. Ada rasa aman dan tempat pulang yang selalu menarik kalian berdua kembali, seramai apa pun hari di luar sana."

## kompatibilitas.p2_clash

- label_meaning: "Kursi pasangan kalian saling bertolak belakang. Hubungan ini jarang terasa datar, dan gesekan kecil bisa terasa jauh lebih tajam dari ukurannya."

## kompatibilitas.p2_none

- label_meaning: "Kursi pasangan kalian berjalan sendiri-sendiri, tanpa tarik-menarik khusus. Yang paling mewarnai hubungan kalian datang dari bagian bagan yang lain."

## kompatibilitas.p2_palace_frame

- meaning_seed: "Salah satu pilar kehidupan pasanganmu menyentuh langsung ruang privatmu. Apa yang sedang ia hadapi di area hidup itu ikut masuk ke dalam hubungan kalian dan mewarnai suasananya."

## kompatibilitas.p2_palace_frame_reader

- meaning_seed: "Salah satu pilar kehidupanmu menyentuh langsung ruang privat pasanganmu. Apa yang sedang kamu hadapi di area hidup itu ikut masuk ke dalam hubungan kalian dan mewarnai suasananya."

## kompatibilitas.p2_frame_clash

- label_meaning: "Salah satu pilar berhadapan langsung dengan kursi pasangan. Karena posisinya berseberangan persis, tekanan dari sana terasa lebih keras dan lebih cepat memanas."

## kompatibilitas.p5_q1

- label_meaning: "Chemistry terasa kuat dan keseharian kalian saling mengisi. Kenyamanan datang dengan mudah, dan justru karena itu ia mudah dianggap biasa."

## kompatibilitas.p5_q2

- label_meaning: "Magnet hubungan sangat kuat, namun pola keseharian sering bersimpangan. Rasanya pekat dan dekat, tetapi rutinitas bersama menuntut banyak kompromi."
- meaning_seed: "Kalian sulit saling melepaskan, tetapi sulit juga berjalan dengan langkah yang sama. Hubungan ini terasa pekat, intens, dan kadang melelahkan."
