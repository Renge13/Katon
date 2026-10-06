# Prompt BC, amendment 1: the adjustment round (Reyner's rulings, 2026-10-02)
Goes in the working tree as `docs/prompts/BC-amendment-1-adjustment-round.md`. Commit it on #197 with §0.

Cite the four checks. No regex through a shell heredoc. No model-based judge.

Merge #196 now (docs only, pre-approved).

## §0. Record (one docs-only commit on #197)
Add to `docs/product/compat-rulings-2026-10-02.md`, under "Prompt BC decisions (Reyner, 2026-10-02)", verbatim:
- **Adjustment round:** "Temperature 0.7. Keep `pair.both_named`; the prompt asks for both titles in the first chapter. Six to eight chapters, each two or three paragraphs. Harmony frame hits get their own text; clash, harm and punishment keep the pressure text."
- **Voice principle, product-wide:** "We can be premium by our design, but warm and use everyday voice for tone and manner." Plain, everyday Indonesian with no slang and no chat particles; never casual chat register (the "old friend" register stays dead, CLAUDE.md rule 20). Compat gets it in this round; the mirror gets it in the mirror round.

## BC adjustment round, on #197 (one round; red first where a check or fact changes; do not merge)

1. **Temperature:** pair 0.7 in `lib/render/config.js`.

2. **Opening:** keep `pair.both_named` as it is. Add to the pair prompt, in "Who is who": "In the first chapter, name both archetype titles once alongside their names."

3. **Length and voice:** add to the pair prompt's Form line: "six to eight chapters, each two or three paragraphs". Also refine the Voice instruction to enforce the new tone: "Write with deep intimacy and warmth, removing the invisible wall between the expert and the reader. Use plain, everyday Indonesian (Bahasa Indonesia sehari-hari) but strictly NO slang (tanpa bahasa gaul) and no chat particles. Do not use clinical, abstract, or bureaucratic terms (e.g., avoid 'dinamika', 'menopang', 'ruang personal'). Ground the emotion in vivid, real-world human situations."

4. **PZ0t `supply_inverted`:** from the rejected drafts and the semantic, report the cause in one paragraph. Then give the writer the supplied element by its Indonesian name with the supplier's and receiver's names (nickname, else English title) on the `p3_supply` fact, so it never has to map A/B or English element names itself. Red first on PZ0t.

5. **Relation-aware `p2_palace_frame` text:** list every relation `p2_palace_frame` emits and the text each gets today. Harmony (六合) hits get Reyner's harmony strings (below), in both directions; clash, harm and punishment keep the current pressure text. Red first on the clash pair (1973-05-10 00:00 F + 1971-08-07 13:00 M): its B→A 六合 hit must not get the pressure text. Report the new pair prompt version. Also report how many base-rate pairs get a harmony hit and a pressure hit in the same direction (their two texts would sit side by side); report only, no change.
   - B→A label_meaning: "Sisi kehidupannya terhubung langsung dengan ruang amanmu. Apa pun pencapaiannya di luar sana, hal itu menjadi jangkar yang membuatmu merasa lebih tenang."
   - B→A meaning_seed: "Dunianya di luar bukanlah ancaman untuk waktu kalian berdua. Justru, setiap kali ia melewati hari yang baik, hawa positif itu ikut terbawa pulang dan membuatmu lega."
   - B→A daily_seed: "Saat urusannya sedang lancar, ia akan pulang membawa energi yang sangat nyaman. Tanpa perlu banyak kata, kehadirannya saja sudah cukup untuk melunturkan lelahmu seharian."
   - A→B label_meaning: "Sisi kehidupanmu terhubung langsung dengan ruang amannya. Apa pun pencapaianmu di luar sana, hal itu menjadi jangkar yang membuatnya merasa lebih tenang."
   - A→B meaning_seed: "Duniamu di luar bukanlah ancaman untuk waktu kalian berdua. Justru, setiap kali kamu melewati hari yang baik, hawa positif itu ikut terbawa pulang dan membuatnya lega."
   - A→B daily_seed: "Saat urusanmu sedang lancar, kamu akan pulang membawa energi yang sangat nyaman. Tanpa perlu banyak kata, kehadiranmu saja sudah cukup untuk melunturkan lelahnya seharian."

6. **The example (Reyner, 2026-10-02):** the voice line now asks the writer to avoid "dinamika", so in the "Saling Menyelamatkan dalam Diam" chapter change "Keajaiban sesungguhnya dari dinamika ini ada pada elemen Api yang Nadia bawa." to "Keajaiban sesungguhnya dari hubungan kalian ada pada elemen Api yang Nadia bawa." Make the change in both `docs/content/compat-target-sample-2026-10-02.md` and the PAIR EXAMPLES section of `docs/content/voice-examples-v2.txt`. Change nothing else in the example. Repin with one reason.

7. **Form labels and privacy sentences:** apply exactly Reyner's ruled wording below; nothing else.
   - "Nama panggilan (opsional)"
   - "Dipakai untuk menyebut kalian di dalam bacaan."
   - "Status hubungan kalian"
   - "Nama panggilan hanya boleh berisi huruf, spasi, tanda petik, atau tanda hubung, paling banyak 20 karakter."
   - "Pilih status hubungan kalian."
   - "Nama panggilan yang kamu isi, untuk dirimu dan untuk orang kedua, beserta status hubungan kalian, disimpan bersama bacaan ini dan hanya dipakai untuk menyusunnya."
   - "Yang dikirim ke penyedia ini hanya hasil hitungan bagan. Untuk bacaan kompatibilitas, ikut dikirim juga nama panggilan dan status hubungan yang kamu isi. Tanggal lahir mentah dan email tidak pernah dikirim."

8. **Re-run** the same four pairs at 0.7, two renders each (8 renders, production path). Same report as BC §3: served/floor and why, words, every finding, full texts in a new QA doc. **Stop.**

After Reyner reads it: merge #197 (only after he confirms the migration `0012_pair_names_status.sql` ran in Supabase) and #198 on his go.
