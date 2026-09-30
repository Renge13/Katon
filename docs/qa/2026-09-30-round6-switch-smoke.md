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
