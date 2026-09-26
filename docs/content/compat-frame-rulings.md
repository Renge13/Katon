<!--
STATUS: RULED. Reyner, 2026-09-26. Four cells, eight strings, recorded verbatim from
docs/prompts/AD-frame-fix-and-checks-loosening.md (Job A, "Reyner's labels (2026-09-26). Use verbatim").
Applied with:
  node scripts/apply-rulings.mjs docs/content/compat-frame-rulings.md --expect 8

WHY THESE EXIST. A palace-frame hit is one person's NON-DAY pillar (year / month / hour) forming a
relation with the other person's day branch (lib/compat/branchRelations.js `scan`). Until this
tranche the engine keyed a frame hit through `P2_BY_RELATION` into the SEAT cells - `p2_harmony`
"Kursi Terikat", `p2_clash` "Kursi Berbenturan", `p2_harm` "Kursi Bergesekan", `p2_punishment`
"Kursi Bersimpul" - and all four of those meanings describe BOTH seats. So the PDF facts page and
appendix told PZ0t_B3YDnzdXc2LWV38D, a pair with no seat relation at all, that the seats lock,
oppose and rub. The seat cells stay for the day pair; a frame hit takes one of these.
-->

# glossary.json#kompatibilitas - the four frame-hit cells, RULED

## kompatibilitas.p2_frame_harmony

- name_id: "Saling Tarik"
- label_meaning: "Salah satu pilar dan kursi pasangan ibarat magnet. Keduanya langsung menempel dan terhubung dengan sendirinya tanpa perlu dipaksa."

## kompatibilitas.p2_frame_clash

- name_id: "Beda Arah"
- label_meaning: "Salah satu pilar berhadapan langsung dengan kursi pasangan. Karena posisinya berseberangan persis, dinamikanya menjadi lebih intens dan mudah memanas."

## kompatibilitas.p2_frame_harm

- name_id: "Senggolan Halus"
- label_meaning: "Salah satu pilar menyenggol kursi pasangan secara halus. Tidak sampai bertabrakan, tetapi cukup memicu gesekan dari hal-hal kecil yang dibiarkan menumpuk."

## kompatibilitas.p2_frame_punishment

- name_id: "Siklus Berulang"
- label_meaning: "Salah satu pilar dan kursi pasangan memiliki kecenderungan memutar ulang pola masa lalu. Jika tidak disadari, kebiasaan lama akan terus berulang."
