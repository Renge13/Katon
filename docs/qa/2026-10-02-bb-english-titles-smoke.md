<!--
STATUS: SMOKE CHECK (Prompt BB §3.5), not a judged round. Claude Code, 2026-10-02.
On feat/english-archetype-titles (G1 + E7), STAGE6 1.71.0. The same five mirror charts and
the PZ0t pair as the BA smoke. Production's own path, in memory, nothing written.
-->

# The BB §3 smoke: English archetype titles, five mirrors and one pair

```
node --conditions=react-server scripts/smoke-round6-switch.mjs --out reports/voice-v2/english-titles/smoke-bb3.json
```

Mirror prompt `v2-6c66cba2394b709b`, pair `v2-bc2d5dbd65415f8b`, gate **1.71.0**, temperature 0.9 (mirror). **6/6 served by the writer, 0 regenerations, 0 floors, $0.0186.** 0 relation English, 0 questions. The writer is handed only the English title; the gate writes any Indonesian archetype mention as that title (`terms.archetype_english`, lib/validate/archetypeTitles.js).

The script needed one fix to run: it parsed the element glosses out of `components/Funnel.jsx`, which #186 moved to `lib/site/elements.js`; it now imports them.

## First two sentences, and every sentence naming an archetype

| reading | first two sentences | archetype sentences | rewritten by the gate |
|---|---|---|---|
| chart1 (The Sun) | "Sebagai Api, kehadiranmu terasa jelas bahkan sebelum kamu berbicara. Kamu adalah sosok yang menerangi sekitarmu, namun nyala itu memakan bahan bakar yang tidak selalu mengisi dirinya sendiri." | **none: the archetype is not named anywhere** | no |
| chart4 (The Morning Dew) | "Kamu adalah The Morning Dew Pagi, seorang dengan elemen dasar Air yang menyesuaikan diri dengan keadaan tanpa pernah kehilangan arah tujuan. Meskipun energimu tergolong Lemah, ini bukan berarti kamu tidak mampu; ini justru penanda bahwa sumber tenagamu berada di luar dirimu." | the first sentence | **yes: "The Morning Dew Pagi"** |
| chart7 (The Teak) | "Sebagai Kayu atau Pohon The Teak, kamu tumbuh dengan menjangkau hal baru. Berhenti berkembang terasa lebih buruk bagimu daripada salah arah, ..." | the first sentence | **yes: "Pohon The Teak"** |
| chart13 (The Bamboo) | "Sebagai Kayu atau Si The Bamboo, kamu membawa dorongan alami untuk terus tumbuh dan menjangkau hal baru. Dalam keseharian, ini terasa seperti kebutuhan konstan untuk memperbaiki keadaan; ..." | the first sentence | **yes: "Si The Bamboo"** |
| smewTN (The Mountain) | "Kamu adalah Tanah dalam wujud The Mountain. Sebagai Tanah, kamu adalah tempat orang lain berpijak dan menaruh beban yang tidak ingin mereka jatuhkan, karena mereka tahu kamu tidak akan goyah." | the first sentence | yes, reads cleanly |
| PZ0t (The Sun, The Mountain) | "Ini adalah bacaan tentang dinamika dua individu: The Sun dan The Mountain. Lewat bacaan ini, kita akan melihat bagaimana cara kalian merespons satu sama lain di keseharian, ..." | the engine opening; "Kamu adalah Api (The Sun) yang kehadirannya langsung terasa bahkan sebelum kamu bicara." | no |

No Indonesian archetype name reached any served text.

## What it shows

1. **The writer writes the Indonesian name it was not given, in 4 of 5 mirrors.** Its only archetype input is the English title, and the v2 examples (Reyner's, not edited here) show "Kamu adalah Samudra". It translates the title back ("Embun Pagi", "Pohon Jati", "Si Bambu"), and the gate's word-for-word swap leaves the compound: **"The Morning Dew Pagi", "Pohon The Teak", "Si The Bamboo"**. That is a defect a reader sees, created by this PR's normaliser.
2. **chart1 never names its archetype.** That was already only counted (`opening.archetype_missing` is a flag) and the result page header and cover carry the title.
3. **PZ0t brackets the title after the element**: "Api (The Sun)". No Indonesian archetype name, but a bracket beside the title.

The cause is the writer's input, not the gate (check 3): one direction line in the prompt ("write the archetype exactly as its English title, never translated or paired with an Indonesian word") removes it, and the gate's swap stays as the backstop. BB forbids touching the compat prompt (Prompt BC) and the mirror prompt's voice, so the line is not added here; it is Reyner's call whether it rides this PR or BC.

## Screenshots (folder `2026-10-02-english-titles/`)

- `result-header-375.jpg`, `result-header-desktop.jpg`: the result page header, local dev, chart4 (1995-06-01 06:00, Perempuan): "The Morning Dew" alone as the title; at 375px it wraps to two lines.
- `ce-chart4.pdf`, `ce-pages/ce-01.png` (cover: "The Morning Dew" alone), `ce-pages/ce-02.png` (first reading page, with the "The Morning Dew Pagi" sentence): built from this smoke's chart4 render.
- `compat-PZ0t.pdf`, `compat-pages/compat-01.png`: the compat cover, "The Sun" / "dan The Mountain", from this smoke's PZ0t render.
- `card-b-before/`, `card-b-after/`: Card B on the five gate charts, before and after the Indonesian eyebrow left.
