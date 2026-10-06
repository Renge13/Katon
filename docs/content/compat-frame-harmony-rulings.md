<!--
STATUS: RULED. Reyner, 2026-10-02. Two cells, three strings each. Verbatim from
docs/prompts/BC-amendment-1-adjustment-round.md item 5 ("Harmony (六合) hits get Reyner's harmony
strings (below), in both directions; clash, harm and punishment keep the current pressure text").
No edit was made to the wording.

WHY THIS EXISTS. `kompatibilitas.p2_palace_frame` and `p2_palace_frame_reader` are PRESSURE text
("Saat area hidup pasangan tersebut mengalami tekanan ..."). Until this ruling every palace-frame
hit got one of them, whatever its relation, so a pillar forming a 六合 (Six Harmony) with the
partner's day seat was described as a source of pressure. The clash pair (A 1973-05-10 00:00,
B 1971-08-07 13:00) is the worked example: B's month and hour 未 each form 六合 with A's day 午, and
the fact carried the B->A pressure text.

Direction-fixed like the E13 pair (docs/content/compat-frame-direction-rulings.md): kamu is the
reader (A), dia, ia and -nya the partner (B). `p2_palace_frame_harmony` is B->A (a pillar of the
partner reaches the reader's seat), `p2_palace_frame_reader_harmony` is A->B. No name_id: frames,
like `p2_palace_frame`.

The cells are new, so they were created in glossary.json with these six values and checked
byte-identical with:
  node scripts/apply-rulings.mjs docs/content/compat-frame-harmony-rulings.md --expect 6 --dry
-->

# glossary.json#kompatibilitas - the harmony palace frame, RULED

## kompatibilitas.p2_palace_frame_harmony

- label_meaning: "Sisi kehidupannya terhubung langsung dengan ruang amanmu. Apa pun pencapaiannya di luar sana, hal itu menjadi jangkar yang membuatmu merasa lebih tenang."
- meaning_seed: "Dunianya di luar bukanlah ancaman untuk waktu kalian berdua. Justru, setiap kali ia melewati hari yang baik, hawa positif itu ikut terbawa pulang dan membuatmu lega."
- daily_seed: "Saat urusannya sedang lancar, ia akan pulang membawa energi yang sangat nyaman. Tanpa perlu banyak kata, kehadirannya saja sudah cukup untuk melunturkan lelahmu seharian."

## kompatibilitas.p2_palace_frame_reader_harmony

- label_meaning: "Sisi kehidupanmu terhubung langsung dengan ruang amannya. Apa pun pencapaianmu di luar sana, hal itu menjadi jangkar yang membuatnya merasa lebih tenang."
- meaning_seed: "Duniamu di luar bukanlah ancaman untuk waktu kalian berdua. Justru, setiap kali kamu melewati hari yang baik, hawa positif itu ikut terbawa pulang dan membuatnya lega."
- daily_seed: "Saat urusanmu sedang lancar, kamu akan pulang membawa energi yang sangat nyaman. Tanpa perlu banyak kata, kehadiranmu saja sudah cukup untuk melunturkan lelahnya seharian."
