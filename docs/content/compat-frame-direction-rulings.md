<!--
STATUS: RULED. Reyner, 2026-10-02. One cell, three strings. Proposed by Cowork in
docs/prompts/BB-rulings-record-blockers-gates-and-titles.md §1.2 (E13); Reyner confirmed them in the
message he sent with Prompt BB, verbatim: "E13 strings confirmed. The Indonesian phrasing is natural,
emotionally resonant, and perfectly captures the dynamic without sounding like a translated
textbook." No edit was made to Cowork's wording.

WHY THIS EXISTS. `kompatibilitas.p2_palace_frame` is written for one direction only: a pillar of the
partner (dia) reaching the reader's (kamu) spouse seat - `b_hits_a`. For the BB pair (A 2005-02-14
07:00, B 1999-07-07 17:00) the only non-day frame hit is A's month 寅 clashing B's day 申 (`a_hits_b`),
so the printed text stated the reverse of the fact. The engine now picks this cell when the frame's
non-day hits are A->B only (lib/semantic/pair.js `p2FrameKey`); B->A, both directions, or the
mirrored day pair alone keep `p2_palace_frame`. Direction-fixed like `p3_reader_gives`: kamu is the
reader, dia and -nya the partner. No name_id: it is a frame, like `p2_palace_frame`.

The cell is new, so it was created in glossary.json with these three values and checked
byte-identical with:
  node scripts/apply-rulings.mjs docs/content/compat-frame-direction-rulings.md --expect 3 --dry
-->

# glossary.json#kompatibilitas - the A->B palace frame, RULED

## kompatibilitas.p2_palace_frame_reader

- label_meaning: "Salah satu pilar di baganmu terhubung langsung dengan kursi pasangannya. Elemen hidupmu memengaruhi ranah terdekatnya."
- meaning_seed: "Salah satu pilar kehidupanmu menyentuh langsung ruang privat pasanganmu, membuat dinamika dari area hidupmu berdampak langsung ke suasana hubungan."
- daily_seed: "Saat area hidupmu itu mengalami tekanan, suasananya langsung terbawa ke rumah dan dia merasakannya sebelum kamu sempat cerita."
