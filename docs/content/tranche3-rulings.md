<!--
STATUS: RULED. Reyner, 2026-08-23. Cowork drafted, Reyner rewrote, Cowork swept.
This file lands on main ALONE, before the PR that applies it (the #28 ruling).

APPLY WITH:
  node scripts/apply-rulings.mjs docs/content/tranche3-rulings.md --expect 7 --dry
  node scripts/apply-rulings.mjs docs/content/tranche3-rulings.md --expect 7

PRECONDITION: this file CANNOT be applied against glossary.json as it stands today.
`glossary.spouse_palace` does not exist:

  $ python3 -c "import json; g=json.load(open('docs/content/glossary.json')); print(g.get('spouse_palace'))"
  None
  $ python3 -c "import json; g=json.load(open('docs/content/glossary.json')); print(list(g.keys()))"
  ['_README', 'aspek', 'bintang', 'elemen', 'kekuatan', 'elemen_hilang', 'elemen_dominan',
   'shio', 'relasi_cabang', 'pilar', 'salah_dikira', 'arketipe', 'tag_arketipe']

apply-rulings.mjs REFUSES on a missing node (`REFUSING: no glossary node for ...`), which is
correct and must not be relaxed. The scaffold commit described in the build prompt creates the
five nodes FIRST, seeded byte-identically with today's shared sentence, so the scaffold is
behaviour-neutral and this file is the only thing that changes what a reader reads.

MECHANISM: Option C, ruled 2026-08-22. Keyed on `provenance.relation_to_day_master`, the field
`lib/semantic/facts.js:481` already emits. Five values, five strings, each saying something
different and TRUE. No new engine mechanism, no invented BaZi rule.

WHAT IS BEING REPLACED: `glossary.pilar.day.branch_label_meaning`, one sentence received by
13 of 13 fixture charts:
  "Tempat membaca dinamika hubungan paling dekat. Isinya menunjukkan tekstur relasi yang terasa
   wajar bagimu, meskipun orang lain bisa menganggapnya berat."
100% of customers get it. Two friends comparing readings find it every time.

RULE 4 NOTE. The five relations are engine-computed, not improvised. The direction of the field
is other-element -> day master, confirmed by the engine's own emitted example in the worksheet
(`seat_god: 正官` -> `relation_to_day_master: "controls"`): 正官 controls the day master, so
`controls` = the seat makes a demand of the reader, and `is_controlled` = the seat is what the
reader manages. The drafts follow that direction. If any of the five describes the relation
wrongly, the draft is wrong and not the engine.

SWEEP, 2026-08-23. 65 blocklist patterns compiled from lib/validate/blocklist.json with each
entry's own `flags` (the per-entry override is what Cowork got wrong on 2026-08-22), plus 8
typography / register checks. `style.adverbial` was NOT re-added: it was deleted 2026-08-17 on
measured evidence and a retired check has no standing here.

  SELF-TEST on a deliberately bad input, which is what makes CLEAN reportable:
    "Kamu bukan lemah tapi kuat, dan pada 2027 kamu pasti akan berhasil, sepertinya agak
     cenderung begitu?"
    -> 8 findings: fatalism[year], fatalism[pasti akan], hedge_construction,
       hedging[agak], hedging[cenderung], hedging[sepertinya], question mark, bukan X tapi Y

  CLEAN  spouse_palace.same            (162 chars)
  CLEAN  spouse_palace.feeds           (156 chars)
  CLEAN  spouse_palace.drains          (157 chars)
  CLEAN  spouse_palace.is_controlled   (141 chars)
  CLEAN  spouse_palace.controls        (161 chars)
  CLEAN  kekuatan.balanced label_meaning_resilience (140 chars)
  CLEAN  kekuatan.balanced label_meaning_agency (135 chars)
  TOTAL FINDINGS: 0

  3-GRAM OVERLAP vs all 224 glossary strings of >=4 words: max 1 on every string.

ONE FINDING FIXED BEFORE THIS FILE EXISTED. Reyner's first `is_controlled` read
"dan kamu cenderung mengurusnya" - `style.hedging` bans `cenderung`, it is live in
blocklist.json, and tests/stage6-validation.spec.mjs runs every style pattern over the whole
glossary, so committing it would have failed npm test rather than degrading prose. He deleted
the word. Nothing else in the sentence moved. Recorded because the same word was removed from
the same draft on 2026-08-22 and the removal was not carried into the review copy.
-->

# Tranche 3 rulings - cross-chart repetition variants

Ruled by Reyner, 2026-08-23. Seven assignments.

## spouse_palace.same

- label_meaning: "Hubungan paling dekatmu bekerja seperti cermin. Apa yang kamu beri akan terpantul kembali, dan gesekan biasanya bersumber dari siapa yang mau mengalah lebih dulu."

## spouse_palace.feeds

- label_meaning: "Hubungan paling dekatmu terasa seperti tempat berteduh. Seseorang menopangmu di sana, dan justru karena terlalu nyaman, kamu bisa lupa cara berdiri sendiri."

## spouse_palace.drains

- label_meaning: "Dalam hubungan paling dekat, kamulah yang lebih banyak memberi. Energimu mengalir keluar secara alami, hingga kamu baru sadar terkuras setelah berjalan jauh."

## spouse_palace.is_controlled

- label_meaning: "Hubungan paling dekatmu menuntut pengelolaan aktif. Ada tanggung jawab yang hadir, dan kamu mengurusnya lebih dulu sebelum bisa menikmatinya."

## spouse_palace.controls

- label_meaning: "Hubungan paling dekatmu menuntutmu memenuhi standar tertentu. Kamu sanggup memikulnya, dan justru karena kamu terlihat mampu, jarang ada yang menawarkan bantuan."

## kekuatan.balanced

Option B, ruled as the fallback for cells with no discriminating field. Balanced is balanced;
there is nothing in the fact to key on. The existing `label_meaning` is UNCHANGED and becomes
phrasing 1 of three, so no ruled prose is destroyed and the renderer picks among three.

**The convergence risk is open and is NOT closed by this ruling.** The model cannot see what
other readers received, so it may settle on one phrasing and the collision returns. That is
measurable only after the prose exists, and the measurement is named in the build prompt.

- label_meaning_resilience: "Baganmu berpijak di posisi netral. Kamu memiliki daya tahan alami terhadap guncangan, sehingga tidak gampang terbawa arus atau tekanan luar."
- label_meaning_agency: "Baganmu tidak condong ke sudut ekstrem. Keseimbangan ini memberimu stabilitas, tetapi arah gerak sepenuhnya menuntut keputusan sadarmu."
