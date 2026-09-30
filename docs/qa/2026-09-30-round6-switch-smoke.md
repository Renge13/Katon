# Round-6 switch: the smoke check (Prompt AV §3)

**Date:** 2026-09-30. **Branch:** `feat/voice-round6-switch` (stacked on #180 and #181). **Not a judged round:** one render per chart, no model judge, no PDFs.

```
node --conditions=react-server scripts/smoke-round6-switch.mjs --out reports/voice-v2/round6-switch/smoke-1.json
```

**Configuration, asserted on the wire for every call** (a miss exits the run): production's own path with no override. The v2 mirror prompt `v2-c3fa645503fe6d12` at the head of the system prompt, temperature 0.9, no relation `label_bracket` in the writer payload. Writer `gemini-3.1-flash-lite`. Gate STAGE6 `1.62.0`. In memory: Supabase refused, the cache cleared before each reading, nothing written. **Spend: $0.0135** for five readings.

| chart | served | words | relation English after the strip | badges named in the prose (information only) | questions to her | regens | cost | final sentence of the penutup |
|---|---|---|---|---|---|---|---|---|
| chart1 | served | 466 | 0 | 2/3 | 0 | 0 | $0.0028 | "Kamu adalah sosok yang tangguh di bawah tekanan dan selalu menjadi sandaran bagi orang lain, namun ingatlah bahwa disiplin yang kamu miliki adalah milikmu sendiri yang juga berhak mendapatkan ruang untuk beristirahat tanpa tuntutan." |
| chart4 | served | 445 | 0 | 3/3 | 0 | 0 | $0.0028 | "Kamu adalah pribadi yang mampu menembus situasi yang buntu bagi orang lain dengan cara yang luwes, meski kamu sendiri sering kali membutuhkan ekosistem yang tepat untuk menjaga energimu tetap menyala." |
| chart7 | served | 452 | 0 | 1/1 | 0 | 0 | $0.0024 | "Kamu adalah pribadi yang mampu tumbuh dengan tekad yang kuat, selalu menemukan cara untuk didukung oleh lingkungan, dan memiliki daya pikat alami yang membuka banyak pintu bagimu." |
| chart13 | served | 396 | 0 | 0/1 | 0 | 0 | $0.0024 | "Kamu adalah pribadi yang tangguh, yang mampu menyesuaikan diri di tengah badai namun tetap teguh memegang kendali atas apa yang sedang kamu bangun." |
| smewTN | served | 408 | 0 | 1/4 | 0 | 0 | $0.0030 | "Kamu adalah seseorang yang mampu menahan beban besar tanpa goyah, yang menemukan kejernihan justru saat situasi sedang menekan, dan yang terus membangun pencapaian dengan tanganmu sendiri meskipun pengakuan dunia sering kali terasa jauh." |

**Read by Code, not scored:**
- **No close teases.** Every penutup is a single settled observation about her. Round 6 teased in 6 of 10 closes ("menarik untuk diselami", "banyak hal yang menanti"). A whole-prose scan for the tease phrases Reyner quoted found one hit, and it is not a tease: chart4's "Bintang Penolong ... selalu menantimu" is about the badge.
- **"ingatlah" (a coaching imperative) appears in 3 of 5** readings (chart1's penutup, chart4 and chart7 in the body). Not an AV target; reported.
- **chart4 places Bintang Penolong "di Pilar Kerja dan Pilar Arah". That is TRUE** (天乙貴人 hits month 巳 and hour 卯), and it exposed that #177's badge card named only the first pillar. Fixed separately in #182.

## Rerun after Prompt AX §1-§2 (2026-09-30)

```
node --conditions=react-server scripts/smoke-round6-switch.mjs --out reports/voice-v2/round6-switch/smoke-2.json
```

Same five charts, same asserted wire, on the amended configuration: v2 mirror prompt `v2-7df61378eede313b` (Reyner's badge, imperative and no-restating lines), the Example 3 bracket removed, the AX glossary lines. Gate 1.62.0. **$0.0132.**

| chart | served | words | relation English | questions | final sentence of the penutup |
|---|---|---|---|---|---|
| chart1 | served | 528 | 0 | 0 | "Kehebatanmu tidak terletak pada ketiadaan lelah, melainkan pada bagaimana kamu tetap berdiri tegak dengan memilih lingkungan dan batasan yang tepat bagi dirimu sendiri." |
| chart4 | served | 388 | 0 | 0 | "Kamu adalah sosok yang terus mengalir, yang kedalaman perannya di dunia justru tumbuh dari keterhubungan yang kamu jalin dengan lingkungan sekitar, dan keberanianmu untuk bergerak melampaui apa yang dianggap batas oleh orang lain." |
| chart7 | served | 427 | 0 | 0 | "Kamu adalah sosok yang terus tumbuh dengan kepekaan tinggi terhadap lingkungan, yang mampu mengelola tanggung jawab besar namun tetap memiliki akses pada dukungan yang tak terduga." |
| chart13 | served | 357 | 0 | 0 | "Kamu adalah seseorang yang tumbuh melalui keberanian untuk terus menembus batas, dengan kemampuan alami untuk menjaga keseimbangan di tengah arus yang selalu berubah." |
| smewTN | served | 386 | 0 | 0 | "Kekuatanmu tidak terletak pada ketiadaan masalah, melainkan pada kemampuanmu untuk tetap berdiri teguh saat semua bagian hidupmu saling tarik satu sama lain." |

**No close teases.** Two closes (chart1, smewTN) use "tidak terletak pada X, melainkan pada Y", a not-X-but-Y turn.

**Imperatives and reminders addressed to her: FOUR SURVIVE, so AX §3 stops here.**
- chart1: "Rasa belum lengkap ini hanyalah bagian dari polamu; saat keinginan untuk menambah satu hal lagi muncul, **cobalah** berhenti sejenak dan bertanya apakah hasil yang ada sekarang sebenarnya sudah lebih dari cukup untuk melangkah."
- chart1: "Namun, **ingatlah** bahwa waktu untuk santai tidak akan datang dengan sendirinya dari pihak lain; kamu perlu memberi izin pada dirimu sendiri untuk sesekali tidak selalu benar dan tidak harus selalu dalam kendali penuh."
- chart13: "Namun, titik tengah ini tidak memberi dorongan ekstrem, sehingga **kamu harus** menjadi penentu arah hidupmu sendiri."
- smewTN: "Untuk mengatasinya, **cobalah** mendokumentasikan dan mengirimkan hasil kerjamu langsung kepada pemangku kepentingan tanpa menunggu orang lain menyatakannya."

Listed by the script but NOT imperatives (a descriptive "harus"): chart4 "kapan harus berhenti dan melangkah", "ada harga yang harus dibayar"; chart13 "merasa harus terus berlari"; smewTN "membuatmu harus sering beradaptasi".

**The likely cause, upstream (CHECK 3).** The mirror prompt says a cost ends with "what helps, from its `actionable`, in your own words", and at least 20 of the glossary's 37 actionable cells are written as commands ("Pilih satu tugas ...", "Buat jadwal ...", "Mintalah bantuan ..."). Both `cobalah` sentences paraphrase such a seed. The new line forbids the imperative while the source it points at is one.

**Restating the page (5+ shared words).** chart4: "Beruntung, kamu memiliki Aspek Pelindung (Direct Resource) di Pilar Kerja, yang menjamin bahwa kamu tidak benar-benar sendirian; bantuan justru sering datang di saat yang tepat, ..." shares "datang di saat yang tepat" with Bintang Penolong's card meaning, and attaches it to Aspek Pelindung.

## Rerun 3, after Reyner's one adjustment (2026-09-30), the last run the cap allows

```
node --conditions=react-server scripts/smoke-round6-switch.mjs --out reports/voice-v2/round6-switch/smoke-3.json
```

**The adjustment, Reyner verbatim:** "her four pillars" becomes "her pillars", and after the imperative line: "When you draw on an `actionable`, rewrite it as a possibility in your own words, for example 'Yang bisa membantu adalah …' or 'Kamu bisa …', never in its command form." v2 mirror prompt `v2-9bef2ec0b0533039` (pair unchanged, `v2-3fdacdca5b04cd46`). Same five charts, same asserted wire, gate 1.62.0, temperature 0.9. **$0.0135.**

**The JSON record was lost:** the script wrote it after printing and `reports/voice-v2/round6-switch/` did not exist in this worktree (ENOENT; fixed in the same commit). Everything below is the console output, verbatim. The run was not repeated: at 0.9 a second run is a different sample, and the cap is one re-render.

| chart | served | words | relation English | questions | regens | cost | final sentence of the penutup |
|---|---|---|---|---|---|---|---|
| chart1 | served | 512 | 0 | 0 | 0 | $0.0029 | "Kamu tidak perlu selalu menjadi yang paling benar atau paling kuat; yang terpenting adalah menyadari bahwa kapasitasmu untuk bersinar sangat bergantung pada seberapa baik kamu menjaga sumber bahan bakarmu sendiri." |
| chart4 | served | 400 | 0 | 0 | 0 | $0.0027 | "Kamu adalah pribadi yang piawai menembus kebuntuan dengan cara yang tidak kaku, dan ketajamanmu dalam melihat celah pertumbuhan adalah kekuatan yang terus mengalir dalam keseharianmu." |
| chart7 | served | 435 | 0 | 0 | 0 | $0.0023 | "Kamu adalah sosok yang terus bertumbuh, seseorang yang mampu membawa keteraturan di tengah guncangan, dan selalu memiliki jalan keluar berkat dukungan yang mengalir di sekitarmu." |
| chart13 | served | 420 | 0 | 0 | 0 | $0.0025 | "Meskipun guncangan adalah bagian dari keseharianmu, kamu memiliki ketangkasan untuk tetap berdiri kokoh di tengah badai." |
| smewTN | served | 461 | 0 | 0 | 0 | $0.0030 | "Kamu adalah sosok yang stabil dan tangguh, dengan kemampuan untuk menavigasi tekanan yang justru membuat orang lain menyerah lebih awal." |

**No close teases.** No "tidak terletak pada ... melainkan" close this run. The script's restating check printed nothing.

**The imperative list.** None of "ingatlah", "jangan lupa", "kamu harus", "pastikan", "cobalah". The script lists every bare "harus"; six hits, read one by one:

- chart1: "Namun, ini adalah harga yang harus kamu bayar: semakin banyak urusan yang kamu pikul sendirian, ..." Descriptive (the cost).
- chart4: "... menetapkan satu pencapaian utama dan menguncinya setidaknya untuk satu tahun bisa memberikan stabilitas yang kamu butuhkan tanpa harus kehilangan semangat untuk bergerak." Descriptive. **This is the command-form seed ("tetapkan satu pencapaian utama dan kunci targetnya", r6-01) rewritten as a possibility**, which is what the new line asks for.
- chart7: "... lebih baik salah arah daripada harus berhenti berkembang." Descriptive.
- chart7: "Perhatian datang kepadamu tanpa harus kamu kejar, ..." Descriptive.
- smewTN: "... kamu sering kali merasa harus menentukan sendiri ke mana harus melangkah, ..." Descriptive (what she feels).
- **chart13: "Kamu sanggup menopang dirimu sendiri, namun karena tidak ada dorongan ekstrem dari luar, arah hidupmu memang harus kamu tentukan sendiri." NOT CLEARED BY CODE.** "harus kamu tentukan" is "harus" addressed to her, and it is smoke-2's counted imperative ("sehingga kamu harus menjadi penentu arah hidupmu sendiri") in object-first order. It can also be read as a statement of the chart (no outside push, so the direction is hers). Register is Reyner's; this run stops on it.

**One close is advice-shaped, not listed.** chart1's penutup opens "Kamu tidak perlu ..." and turns on "yang terpenting adalah menyadari bahwa ...": no listed word, but a reminder in the position of the settled observation. Reported for the read.
