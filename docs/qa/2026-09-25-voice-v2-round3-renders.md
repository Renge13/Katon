# Voice v2 round 3 renders, 2026-09-25: 7 of 7 served, J1 caught the g4WH4 error again

Round 3, the final round per the cap (Reyner, 2026-09-24, `docs/prompts/AC-qris-walk-voice-round3.md` §B). Branch
`feat/voice-v2` at `f36e6da`, STAGE6 **`1.33.0`**: fix (i) archetype brackets from the engine, fix (ii) typography
normalised, **J1 hard** (calibration PASS, `docs/qa/2026-09-25-voice-v2-j1-calibration.md`), J2-J4 advisory. Writer
`gemini-3.1-flash-lite` and judge `gemini-3.1-pro-preview`, both unchanged. v2 only. In memory: the harness deletes
the Supabase variables before any module loads and refuses if `isSupabaseConfigured()` is still true.

```
node --conditions=react-server scripts/qa-voice-v2-renders.mjs --out reports/voice-v2/round3 --voices v2   # spends
node scripts/qa-voice-v2-pdfs.mjs --dir reports/voice-v2/round3                                            # spends nothing
```

Output (gitignored): `reports/voice-v2/round3/<subject>-v2.{json,pdf}`, `index.html`, `summary.json`, `renders.log`.
Every PDF was checked to contain its served first and last block (`lib/pdf/inspect.js#pageTexts`; a negative
control sentence that appears in no reading was false on all seven). Same subjects as round 2: fixture charts 1, 4,
6, 8, 13 and pairs `PZ0t_B3YDnzdXc2LWV38D`, `g4WH4_9QbCrCj3Gha934q`.

## Per reading

| Reading | Served | Words (r2) | Drafts | D1-D4 hard fails | J1 | Regenerated | Floor | Spend |
|---|---|---|---|---|---|---|---|---|
| chart1 | gemini | 543 (floor) | 1 | - | - | no | no | $0.0849 |
| chart4 | gemini | 454 (344) | 1 | - | - | no | no | $0.0924 |
| chart6 | gemini | 361 (328) | 1 | - | - | no | no | $0.0603 |
| chart8 | gemini | 460 (361) | 1 | - | - | no | no | $0.0642 |
| chart13 | gemini | 407 (393) | 1 | - | - | no | no | $0.0443 |
| PZ0t | gemini | 413 (floor) | 2 | draft 1: D1 `"Kuat" (kekuatan)` | - | yes, on D1 | no | $0.0557 |
| g4WH4 | gemini | 357 (400) | 2 | - | **draft 1: J1, TRUE** | **yes, on J1** | no | $0.1193 |

**Floor rate v2: 0/7** (round 2: 2/7). Renders total **$0.5211**; judge $0.042-$0.111 per reading, writer
$0.002-$0.008.

## J1 findings, every one, with grounding

**g4WH4, draft 1 (rejected, regenerated):** "Untungnya, dia membawa elemen Air yang tidak dominan di baganmu,
memberikan keseimbangan yang meredakan kegelisahanmu." Grounding `p3_supply, element_dominant_Water`. Supported
"the partner brings a balancing element that eases anxiety". Unsupported "the partner brings 'elemen Air' to the
reader and ... Water is 'tidak dominan di baganmu', whereas the facts state the partner brings Wood to the reader,
and Water is actually the dominant element in the reader's chart."

**THE g4WH4 ERROR RECURS.** The same writer, the same prompt, the same facts, and the first draft made the same
inversion almost word for word (round 2: "dia membawa elemen Air yang tidak dominan di baganmu, memberikan
keseimbangan yang menenangkan..."). This time it was not served. J1 rejected it, the regeneration quoted the finding
back, and the served draft reads: "Dia membawa elemen Kayu yang tidak dominan di baganmu, memberikan keseimbangan yang
meredakan kegelisahanmu." The direction is now right (`p3_supply`: B supplies Wood).

**WHERE THE SENTENCE COMES FROM, found by reading the PDF rather than the JSON.** "Dia membawa elemen yang tidak
dominan di baganmu" is the ENGINE's own `label_meaning` for Penyeimbang Unsur (`p3_supply`), printed verbatim on the
PDF's "Data di Balik Bacaan Ini" and "Istilah dalam Bacaanmu" pages. Both round-2 and round-3 drafts are that
glossary sentence with an element NAME inserted: draft 1 inserted Air (the element A supplies to B, in the same
fact), and the served draft inserted Kayu. So the inversion is the writer filling a slot the glossary leaves unnamed,
and "tidak dominan" for A's 0% Wood is the ruled glossary wording, not the writer's understatement. The glossary
string is Reyner's content, so it is recorded here, not changed (CHECK 3: the cause is upstream of the gate).

No other J1 in any of the 8 judged drafts (one per reading, two for g4WH4; PZ0t's D1-rejected draft 1 was never
judged). No J1 on the other six readings.

## D1-D4 hard fails

- **PZ0t draft 1, D1**: `"Kuat" (kekuatan) appears in the prose but no supplied fact carries it`. The draft's
  heading was "Magnet yang Kuat, Ritme yang Bergesek", a paraphrase of the supplied quadrant name "Tarikan Kuat,
  Ritme Bergesek". This is the round-2 observation 3 shape again: the draft broke the "names exactly as the facts give
  them" form rule, but D1's reason is the wrong one. Regenerated; served.
- No other D1-D4 hard fail on any draft.

## What fixes (i) and (ii) did (logged at `flag`)

| Reading | Fix (i), archetype bracket | Fix (ii), typography |
|---|---|---|
| chart1 | inserted "Matahari (The Sun)" | - |
| chart4 | replaced "Embun (癸)" with "(The Morning Dew)" | an em-dash |
| chart6 | replaced "Samudra (Air)" with "(The Ocean)" | - |
| chart8 | inserted "Besi Tempa (The Forge)" | an em-dash |
| chart13 | inserted "Bambu (The Bamboo)" after "Kamu adalah Kayu [Wood], sang Bambu" | an em-dash |
| PZ0t | replaced "Matahari (丙)" and "Gunung (戊)" with "(The Sun)", "(The Mountain)" | removed "(正財)", "(比肩)" |
| g4WH4 | inserted "Matahari (The Sun)"; B's archetype is named only in the ruled opening, which is untouched | - |

**Under STAGE6 1.30.0, the served drafts of chart4, chart8, chart13 and PZ0t would each have been a D3 hard reject**
(hanzi in a bracket, or an em-dash). All seven served readings carry no non-keyboard typography and no hanzi.

**Residuals, seen and not fixed (outside the ruling's scope):**
- **Square brackets on non-archetype terms**: chart8 served "Pemijar [Hurting Officer]", "Simpul [Punishment]" and
  six more; chart13 "Peraih [Indirect Wealth]", "Benturan [Clash]", "Pasangan [Spouse Palace]". The ruling's fix
  covers the archetype only. v1 brackets Aspek and Bintang through `insertBrackets` and does not face this.
- **Element brackets**: "Kayu [Wood]" (chart13), "Logam [Metal]" (chart8), "Api (Fire)", "Kayu (Missing Wood)" (chart1).
  "(Missing Wood)" is an invented gloss. Elements are outside rule 23's bracket scope (ruling 2026-08-19).
- **A bound Aspek left unbracketed** where fix (ii) removed a hanzi-only bracket: PZ0t now serves "Sebagai Aspek
  Pengelola, kamu ..." and "Sebagai Aspek Pendamping, dia ..." with no English bracket.

## J2-J4 findings (advisory: logged, stored with the render, never blocking)

No J2 and no J3 on any served reading. J4, all quoted by what the judge said is missing:

- chart1: J4 cost `profile_vs_favorable`: "Makna cost (semakin banyak yang dipegang, semakin sedikit energi tersisa
  untuk diri sendiri) dan gift (kepercayaan datang sendiri) tidak ditemukan dalam teks." J4 other `day_master_Fire`:
  the gift "orang berkumpul di sekitarmu tanpa diundang, suasana ruangan berubah".
- chart4: J4 cost `day_master_Water`: "omits the cost of the Day Master (that long-term commitment to a rigid form
  feels very heavy)". J4 other `spouse_palace`: its own label_meaning.
- chart6: J4 other `spouse_palace`: its own label_meaning.
- chart8: J4 other `relation_刑_self_辰` (gift), `element_dominant_Metal` (gift), `spouse_palace` (label_meaning).
- chart13, PZ0t, g4WH4 (served draft): none.

`spouse_palace`'s own label_meaning is missed on 3 of 5 mirrors, the same J4 as S3's in both calibrations. Recorded
as an observation. No writer constraint was added from any judge finding (the ruling's step 5).

## D4 verdict-pattern hits (mirror only, where D4's verdict check does not apply)

chart1 draft 1: "Kamu bisa bertahan bertahun-tahun di situasi yang sudah tidak cocok karena dorongan untuk berubah
tidak muncul otomatis dari dalam diri." The same `element_missing_Wood` cost as in round 2. Pairs: 0.

## Round 3 spend

J1 calibration $1.3206 (27 judge calls) + renders $0.5211 = **$1.8417**. `probe:doku` and the PDFs spend nothing on
Gemini.
