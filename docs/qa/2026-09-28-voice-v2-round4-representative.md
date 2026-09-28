# Voice v2, round 4: the representative test (Prompt AE item 4)

**Date:** 2026-09-28. **Branch:** `feat/voice-v2` at `6a233d0` (the harness commit; the code under test is
`66baa58`). **Gate:** STAGE6 `1.46.0`. **Writer:** `gemini-3.1-flash-lite`. **Judge:** none (removed from the
render path at 1.42.0). **Prompts:** mirror `v2-ae09c859acbfc342`, pair `v2-349d650a51eaa980` (Prompt AE's
instructions plus Reyner's examples; the pair opening is Reyner's 2026-09-28 line, #156).
**Approved by Reyner** (Prompt AI §4). In memory, not from `render_cache`. No voice score: Reyner judges.

**Subjects:** mirrors chart1, chart4, chart6, chart8, chart13; pairs PZ0t and rVe4ca. The examples' own
charts (g4WH4, eJm6p6PjG8f) are excluded. **rVe4ca's births are a RECONSTRUCTION**
(`tests/fixtures/pair-frame-hits.fixture.json`: one of 21 birth pairs whose facts body reproduces production
byte for byte), not the real ones.

**Commands:**
```
node --conditions=react-server scripts/qa-voice-v2-renders.mjs --out reports/voice-v2/round4 --voices v2 --subjects chart1,chart4,chart6,chart8,chart13,PZ0t_B3YDnzdXc2LWV38D,rVe4ca-FOhsprfGUucTxA
node --conditions=react-server scripts/qa-voice-v2-renders.mjs --out reports/voice-v2/round4 --voices v1 --subjects rVe4ca-FOhsprfGUucTxA
node scripts/qa-voice-v2-pdfs.mjs --dir reports/voice-v2/round4
node scripts/check-example-reuse.mjs reports/voice-v2/round4
```
**Artifacts (local, `reports/` is gitignored):** `reports/voice-v2/round4/` - the render JSONs, the PDFs,
`compare.html` (each stored v1 PDF from round 2 next to its round-4 v2 PDF; rVe4ca has no stored v1, so a
FRESH v1 was rendered for it, $0.0025), `round4-table.json`.

## Per reading (v2)

No reading floored, so no file carries FLOOR. Every draft passed first time.

| Subject | Words | Writer calls | Regens | Rejected drafts | Gating findings served | Cost (list price) |
|---|---|---|---|---|---|---|
| chart1 | 519 | 1 | 0 | 0 | 0 | $0.0031 |
| chart4 | 450 | 1 | 0 | 0 | 0 | $0.0030 |
| chart6 | 371 | 1 | 0 | 0 | 0 | $0.0025 |
| chart8 | 446 | 1 | 0 | 0 | 0 | $0.0028 |
| chart13 | 349 | 1 | 0 | 0 | 0 | $0.0024 |
| PZ0t | 373 | 1 | 0 | 0 | 0 | $0.0040 |
| rVe4ca | 370 | 1 | 0 | 0 | 0 | $0.0039 |
| **Total** | | 7 | 0 | 0 | 0 | **$0.0217** |

Thinking tokens 0 on every call. Cost is measured tokens times list price, an estimate, not billing.

**Logged (flag) findings served**, all v2 design: `style.hedging` 7/7, `coverage.cost_dropped` on all five
mirrors, `brackets.inserted`/`normalised` 7/7, `typography.normalised` (an em dash replaced) 4, plus one
each of `style.tension_collapse`, `style.essay_connectives` (2), `style.rhetorical_question` (chart4),
`style.hedge_construction` (2), `style.meta` (chart6), `fact.palace_dropped` (chart6),
`coverage.field_dropped` (2), `style.unsanctioned_bracket` + `style.english_leakage` (chart8, chart13),
`pair.penutup_register` (both pairs), `structure.duplicate_sentence` (PZ0t).

## Three things a reader would see

1. **PZ0t serves the opening sentence TWICE.** The writer braided `p0_opening` into its first block with
   `p2_day_pair` and `p5_pull_fit` and copied the ruled sentence into it. `withEngineOpening`
   (`lib/render/pairOpening.js`) keeps a braided block minus the claim, so block 0 is the engine's opening
   and block 1 opens with the same sentence again, this time with "(The Sun)" and "(The Mountain)"
   inserted. `structure.duplicate_sentence` saw it and logs only. The file's own comment names this limit:
   "if it is ever common the answer is a prompt that stops the braid, not a cleverer splitter here".
2. **Nested brackets on two mirrors:** chart13 "Sebagai Kayu (Bambu (The Bamboo))", chart8 "Sebagai Logam
   (Besi Tempa (The Forge))". The writer put the archetype in brackets after the element; the pipeline then
   inserted the English after the archetype. Flagged `style.unsanctioned_bracket`, served.
3. **One closing move, 7 of 7:** every v2 reading ends a thought with "Mungkin menarik untuk
   melihat/memperhatikan ..." (6 in the penutup, 1 in a block). It traces to the prompt's "You may end a
   thought on an open observation that makes her want to look further, for instance at the people closest to
   her". Both pair penutups also say "salah satu dari kalian". This is a voice question, so it is Reyner's.

Also: chart4 serves a question mark (`style.rhetorical_question`, flag on v2).

## Reuse of the examples

`scripts/check-example-reuse.mjs`, control passed (a planted example sentence found, a clean one not).
Glossary text is excluded, because the examples quote the glossary's own lines. **Baseline: round 3**, rendered
before the examples existed, still shows 1 run on 5 of 7 readings (for example "lumpuh saat situasi memburuk
justru di titik itulah pikiranmu paling jernih"), so the examples share some phrasing with earlier renders
and a run alone is not proof of copying.

| Subject | Exact sentences | Shared 6+ word runs | Read |
|---|---|---|---|
| PZ0t | **2** | 3 | **Copied.** "Di antara kalian mengalir dinamika Inti Menghidupi, di mana unsur Apimu secara alami memberi energi ke unsur Tanahnya." and "Kalian sering merespons kejadian yang sama dengan fokus yang berbeda total, ..." are Example 4 verbatim. PZ0t has the same A (Fire, Matahari) and a B of the same element (Earth) as the example's own pair, g4WH4, so excluding g4WH4 did not exclude its facts. |
| rVe4ca | 1 | 4 | Copied from Example 4 ("Dia kemudian menyambut, mengeksekusi, dan merasa aman bergerak dalam alur tersebut.", "di antara kalian mengalir dinamika Inti Menghidupi, di mana unsur"). |
| chart6 | 0 served, 1 in the draft | 4 | **Copied** from Example 1 (Samudra; chart6 is also a Samudra). The draft's "Sebagai Samudra, elemen Air di dalam dirimu membuatmu menyesuaikan diri dengan keadaan tanpa pernah kehilangan arah tujuan." is Example 1 verbatim; the served copy differs only by the inserted "(The Ocean)", so it counts as runs. Also "sulit ditebak, padahal arah tujuanmu sebenarnya selalu sama, hanya jalurnya saja yang berganti-ganti". |
| chart1 | 0 | 3 | Example 1 and 5 phrasing ("semakin banyak urusan yang kamu pegang, semakin sedikit ...", "... selalu ada orang ... muncul membantu di saat yang tepat"). |
| chart4 | 0 | 1 | Example 2 ("kapasitas energimu tergolong Lemah karena kamu lahir di bulan"). |
| chart13 | 0 | 1 | "antara Pilar Kerja dan Pilar Diri" - the same run is in round 3, so it is baseline. |
| chart8 | 0 | 0 | none |
| rVe4ca v1 (fresh) | 1 | 0 | **Not the examples:** "Dalam seminggu biasa, ini terlihat dari siapa yang membuka pembicaraan ..." is in the v1 compat prompt's own worked example (`docs/content/compat-renderer-prompt.txt:59`), which v1 is shown. |

**Correction to commit `6a233d0`'s message:** it says the glossary-sentence exclusion was needed because a
v1 reading scored an exact hit. The exclusion removed a different false hit (rVe4ca v2, "Ada dinamika
pengayom dan yang diayomi ...", which is the p1 glossary line). The v1 hit is real copying of the v1 prompt's
example, and it stays in the table above.
