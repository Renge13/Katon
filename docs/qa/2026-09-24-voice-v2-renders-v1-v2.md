# Voice v1 vs v2 renders, 2026-09-24: 5 fixture charts + 2 pairs, judge advisory

Round 2 step 7. Branch `feat/voice-v2` at `26b5279`, STAGE6 `1.30.0`, writer `gemini-3.1-flash-lite`, judge
`gemini-3.1-pro-preview` (v2 only, ADVISORY: stored, never rejects). In memory: the harness deletes the
Supabase variables before any module loads and refuses if `isSupabaseConfigured()` is still true.

```
node --conditions=react-server scripts/qa-voice-v2-renders.mjs   # renders, spends
node scripts/qa-voice-v2-pdfs.mjs                                 # PDFs + index.html, spends nothing
```

Output (gitignored): `reports/voice-v2/<subject>-<voice>.{json,pdf}` and `reports/voice-v2/index.html`, which puts
each subject's v1 and v2 PDFs side by side. Each JSON carries every writer draft, served or rejected. Every PDF
was checked to contain its render's first and last block (`lib/pdf/inspect.js#pageTexts`, negative control
false). **Cowork reads these before Reyner.**

Subjects: fixture charts 1 (丙 weak, Reyner's own), 4 (癸 weak), 6 (壬, the 00:15 late-子 edge), 8 (庚),
13 (乙, the 立春 boundary); pairs `PZ0t_B3YDnzdXc2LWV38D` and `g4WH4_9QbCrCj3Gha934q`. The pairs' birth data
was confirmed against each pair's `GET /api/pair/<id>`: all five compat modules reproduce byte-for-byte.

## Run 2 (the one the PDFs are built from), STAGE6 1.30.0

| Reading | Voice | Served | Words | Drafts | D rejections (drafts) | Judge findings (advisory) | Spend |
|---|---|---|---|---|---|---|---|
| chart1 | v1 | gemini | 713 | 1 | - | - | $0.0044 |
| chart1 | v2 | **FLOOR** | (838, floor) | 2 | D3 typography x2: U+2014 in "...rasa 'hampir pas'—seolah..." and "...di sekitarmu—baik melalui..." | not run (no draft passed D) | $0.0052 |
| chart4 | v1 | gemini | 549 | 2 | `fact.condition_named` "Dominant Output" | - | $0.0087 |
| chart4 | v2 | gemini | 344 | 2 | D3 hanzi: "Kamu adalah Embun (癸)" | J4 hard `strength_weak` cost; J4 hard `relation_冲_巳亥` cost | $0.0772 |
| chart6 | v1 | gemini | 575 | 2 | `coverage.field_dropped` main_profile gift | - | $0.0082 |
| chart6 | v2 | gemini | 328 | 1 | - | J4 soft `day_master_Water` gift; J4 soft `spouse_palace` label | $0.0532 |
| chart8 | v1 | gemini | 726 | 1 | - | - | $0.0045 |
| chart8 | v2 | gemini | 361 | 2 | D3 typography: U+2014 "...rasa 'hampir pas'—seolah selalu..." | J4 hard `day_master_Metal` cost; J4 soft `element_dominant_Metal` gift; J4 soft `spouse_palace` label | $0.0841 |
| chart13 | v1 | gemini | 601 | 1 | - | - | $0.0040 |
| chart13 | v2 | gemini | 393 | 1 | - | J4 hard `main_profile` cost; J4 soft `strength_balanced` label | $0.0821 |
| PZ0t | v1 | gemini | 311 | 1 | - | - | $0.0024 |
| PZ0t | v2 | **FLOOR** | (102, floor) | 2 | D3 hanzi: "Matahari (丙)", "Gunung (戊)", "Aspek Pengelola (正財)", "Aspek Pendamping (比肩)"; then D1 "Kuat" in the heading "Tarikan Kuat dan Ritme yang Bergesek" | not run | $0.0075 |
| g4WH4 | v1 | gemini | 344 | 1 | - | - | $0.0026 |
| g4WH4 | v2 | gemini | 400 | 1 | - | **J1 hard, TRUE:** "Namun, di sinilah letak kekuatannya: dia membawa elemen Air yang tidak dominan di baganmu, memberikan keseimbangan yang menenangkan di area yang tadinya rawan rapuh." (engine: B supplies Wood to A; Water is A's DOMINANT element). J4 soft `p4_temperament` | $0.0835 |

Run 2 total $0.4274. Floor rate: v1 0/7, **v2 2/7**. Served-reading length: v2 mirrors 328-393 words against
v1's 549-726; the one served v2 pair 400 against v1's 344.

**Judge cost per chart: $0.051-$0.080 (run 2, five served v2 readings), against the writer's $0.002-$0.005.**
The advisory judge is 15-36x the writer per reading (chart4 15x, chart8 17x, g4WH4 20x, chart6 27x, chart13 36x). Thought tokens are most of it.

## What the run shows (observations, nothing changed on them)

1. **Typography is v2's leading rejection: 6 of 22 v2 drafts** over both runs (run 1: chart8 x2, chart13 x1;
   run 2: chart1 x2, chart8 x1). Every run-2 hit is U+2014, the em-dash; run 1 saved no drafts, so its three are the
   check's name only. It floored chart 1 in run 2 and chart 8 in run 1. The v2 prompt already says "Keyboard characters only". D3 is hard by the spec.
2. **Hanzi in brackets**, `Embun (癸)`, `Aspek Pengelola (正財)`: the writer uses the Chinese as the bracket term.
   D3 caught both; chart 4 recovered on regeneration, PZ0t did not.
3. **D1 fired on a PARAPHRASED quadrant name.** The fact gives "Tarikan Kuat, Ritme Bergesek"; the draft wrote
   "Tarikan Kuat dan Ritme yang Bergesek", so the supplied-term mask did not match and "Kuat" read as the strength
   term. The compat prompt asks for the names "exactly as the facts give them", so the draft broke a form rule,
   but D1's reason is the wrong one.
4. **The judge caught a real inversion that D1-D4 served** (g4WH4 v2, above). Advisory, so it shipped in the render.
5. **J4 "cost missing" recurs on served v2 mirrors** (chart4, chart8, chart13 in run 2; chart1, chart4, chart6 in
   run 1), alongside v2 readings about half v1's length.
6. **Pinyin brackets**: the served g4WH4 v2 reads "Matahari (Bing)" and "Taman (Ji)", where the naming rule puts
   the English term in brackets. No check covers it.
7. **The v2 compat prompt is gendered** ("Help her understand ... then who he is", spec §3 verbatim). In g4WH4 the
   reader (A) is male. The prose uses kamu/dia, so nothing visible broke.

## D4 `pair.verdict` hits, every one, with its quote

**Pairs: 0** in every pair draft of both runs (12 drafts: v1 5, v2 7). **Mirrors: `cocok` fires on ordinary
usage**, where D4's verdict check does not apply (pairs only):

- run 1 chart1 v1, draft 3: "Namun, kamu bisa bertahan bertahun-tahun di situasi yang sudah tidak cocok karena dorongan untuk berubah tidak muncul dari dalam diri."
- run 1 chart1 v2, draft 1: "Kamu bisa bertahan bertahun-tahun di situasi yang sudah tidak cocok dan menganggapnya biasa saja karena dorongan untuk berubah tidak muncul otomatis dari dalam diri."
- run 2 chart1 v2, draft 1: "Namun, ketiadaan ini membuatmu sulit untuk berbelok arah; kamu bisa bertahan terlalu lama di situasi yang sudah tidak cocok karena dorongan untuk berubah tidak muncul secara otomatis dari dalam dirimu."
- run 2 chart1 v2, draft 2: "Kamu fokus pada apa yang ada di depan mata, yang membuatmu bisa bertahan lama di situasi yang mungkin sudah tidak cocok bagimu."

All four are chart 1's `element_missing_Wood` cost ("susah putar arah"). The same sentence in a pair reading
would be a hard D4 reject. Pattern: `\b(tidak |kurang |sangat )?cocok\b`.

## Run 1 (STAGE6 1.29.0), kept in `reports/voice-v2/run1-stage6-1.29.0/`

Same subjects, before `26b5279`. **Both v2 pairs floored on the shape check** ("blocks[0] cites unknown fact
day_master_Fire", 2 of 2 drafts each): the writer cited the mirror facts E2 supplies, which the shape check did
not know. That was my E2 gap and `26b5279` fixed it (red first). Otherwise: v2 chart8 floored on typography,
v1 0/7 floors, v2 mirrors 305-596 words against v1 600-794. Total $0.3231. Run 1 saved no drafts, so its
typography hits carry no quotes.
