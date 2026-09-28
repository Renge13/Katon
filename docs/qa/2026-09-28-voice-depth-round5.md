# Voice depth round 5 (Prompt AR §1-§3), BLINDED

**Date:** 2026-09-28. **Branch:** `exp/voice-depth-r5` off `main` 9a2163c. **Gate:** STAGE6 `1.57.0`, no model-based judge (none is in the render path). In memory: Supabase refused, the render cache cleared before each reading, nothing written to `render_cache`. **Spend:** $0.2484 for 12 readings plus 9 one-word thinking probes.

```
node --conditions=react-server scripts/qa-voice-depth-r5.mjs          # renders (spends)
node scripts/qa-voice-depth-r5.mjs --pdfs                              # blinded PDFs + KEY.json
node --conditions=react-server scripts/report-voice-depth-r5.mjs      # this table, off the records
```

**This file is keyed by blinded id and names no arm.** The PDFs are `reports/voice-v2/round5/r5-01.pdf` to `r5-12.pdf`, and the key is `reports/voice-v2/round5/KEY.json`. The per-arm roll-up is `reports/voice-v2/round5-data/REPORT-arms.md` and it unblinds, so open it after the key. **Cost, tokens and latency differ by model, so the table below will unblind the arms too. Read the PDFs first.**

## What the arms were (without saying which id is which)
Four arms on three mirror charts (chart1, chart13, and `smewTNtzNaoQmWysi6mYU` reconstructed as 2001-02-14 13:00 female):

| Arm | Model | Temp | Thinking | Prompt |
|---|---|---|---|---|
| A | `gemini-3.1-flash-lite` | 0.2 | default = 0 thinking tokens | v2 prompt (control) |
| B | `gemini-3.1-flash-lite` | 0.9 | default = 0 thinking tokens | DEPTH |
| C | `gemini-3.8-flash` | 0.9 | `low` | DEPTH |
| D | `gemini-3.1-pro-preview` | 0.9 | `low` | DEPTH (ceiling reference) |

- **Reconstruction check.** The chart view built from 2001-02-14 13:00 female is byte-identical to production's `GET /api/mirror/smewTNtzNaoQmWysi6mYU`. The same holds at 14:00. At 12:00 (the control) it differs.
- **Thinking.** Measured with a one-word probe per model and level. Flash-lite at default spends 0 thinking tokens, so A and B send no thinking config, as production does. 3.8 Flash and 3.1 Pro spend about 60 tokens by default and refuse MINIMAL ("Thinking level MINIMAL is not supported for this model"), so C and D run at LOW. **At LOW, 9 of the 10 C and D writer calls reported no thinking tokens; one reported 2097.**
- **DEPTH.** The v2 prompt with AR §1's three instructions. One sentence was REPLACED: "After those, choose the facts that make the strongest reading." That is the breadth instruction the depth one supersedes. Every other byte is unchanged, which was checked by removing each paragraph and comparing. The matcher was shown failing first: one character off gives 0 occurrences, and the run refuses. **One tension stays in the prompt:** it still says "Advice is optional, never required", while DEPTH asks for "what helps" on a cost.
- **One transport change, all arms:** `timeoutMs` 120s instead of 45s, so a slow thinking model is measured rather than floored by the socket guard. One reading ran over 45s and is flagged in the table.

## §2 per reading

| id | chart | words | served | regens | gate hard / logged | bintang shown | cost blocks ending on what helps (heuristic) | ms | tokens in / out / thinking | cost |
|---|---|---|---|---|---|---|---|---|---|---|
| r5-01 | chart1 | 440 | served | 1 | 0 / 6 | 2/3 | 2/3 | 10272 | 13248 / 1708 / 0 | $0.0059 |
| r5-02 | smewTNt | 302 | served | 0 | 0 / 8 | 2/4 | 1/3 | 3536 | 6856 / 676 / 0 | $0.0027 |
| r5-03 | chart1 | 377 | served | 0 | 0 / 10 | 3/3 | 3/4 | 5373 | 6462 / 823 / 0 | $0.0029 |
| r5-04 | chart13 | 421 | served | 0 | 0 / 10 | 0/1 | 1/3 | 4978 | 5345 / 862 / 0 | $0.0026 |
| r5-05 | smewTNt | 364 | served | 1 | 0 / 26 | 2/4 | 0/3 | 9863 | 14006 / 1662 / 0 | $0.0060 |
| r5-06 | chart13 | 534 | served | 0 | 0 / 12 | 1/1 | 1/3 | 6067 | 5471 / 870 / 0 | $0.0027 |
| r5-07 | chart13 | 375 | **FLOOR** | 1 | 2 / 2 | 0/1 | 4/5 | 27183 | 10988 / 2958 / 0 | $0.0575 |
| r5-08 | smewTNt | 788 | served | 0 | 0 / 5 | 4/4 | 3/5 | 9015 | 6982 / 1505 / 0 | $0.0109 (2027: $0.0218) |
| r5-09 | chart1 | 632 | served | 1 | 0 / 14 | 3/3 | 3/4 | 42518 (>45s) | 13221 / 2787 / 2097 | $0.0851 |
| r5-10 | chart13 | 375 | **FLOOR** | 1 | 1 / 1 | 0/1 | 4/5 | 17153 | 10984 / 2703 / 0 | $0.0184 (2027: $0.0367) |
| r5-11 | chart1 | 815 | served | 1 | 0 / 3 | 3/3 | 2/4 | 17642 | 13228 / 3278 / 0 | $0.0222 (2027: $0.0444) |
| r5-12 | smewTNt | 729 | served | 0 | 0 / 4 | 4/4 | 2/4 | 13320 | 6982 / 1476 / 0 | $0.0317 |

- **r5-07 and r5-10 are the FLOOR, not a render.** They are module assembly, the same chart13 glossary prose in both, and their PDF provenance reads `gate 1.57.0-floor`. Their words, bintang and "what helps" columns describe the floor. What the model wrote is in the round5-data records.
- **Word counts against DEPTH's 700-1000 target:** three readings reached it (r5-08, r5-11, r5-12). No other served reading passed 632.
- **"What helps" is a heuristic, and it is wrong in both directions.** It counts a block when its last sentence opens like advice or shares a word trigram with a cited `actionable`. Example misses: r5-11 block 2 ends "mintalah pertolongan lebih awal" and is counted no; r5-01 block 1 is counted yes and is not advice. Every last sentence is listed in `reports/voice-v2/round5-data/REPORT-blind.md`, so the real count is a read.
- **Cost:** list price read 2026-09-28 from ai.google.dev/gemini-api/docs/pricing. 3.8 Flash is $0.75 in / $3.75 out "through December 31, 2026" and $1.50 / $7.50 "starting January 1, 2027". Flash-lite is $0.25 / $1.50 and 3.1 Pro $2.00 / $12.00. Thinking bills as output. Cost includes rejected drafts.

## §3 truth sweep
- **`scripts/count-portrait-claims.mjs`, unchanged, on all 12 records, drafts and served:** 11 birth-month, 2 other "bulan <Shio>", 6 season and 34 Aspek-at-pillar claims. **0 false, 0 undetermined.** The counter was shown failing first: "Kamu lahir di bulan Kuda" planted into a copy of r5-08 (smew's month is Macan) was reported FALSE.
- **The gate's fact checks on SERVED text:** only r5-03 logs any, 4x `fact.palace_dropped`. That is an omission (a fact's pillar is not said), not an unbacked claim.
- **The gate's fact checks on REJECTED drafts**, which never reached a reader:

| id | rejected for | read |
|---|---|---|
| r5-01 | `fact.strength_contradiction` "kuat" vs weak; `fact.relation_positions` 半合 巳酉 named at one pillar of three | the first is the check misfiring: the sentence is "kehadiran kuat" (a strong presence), not a strength verdict. The second is real (positions dropped). |
| r5-05 | `fact.strength_contradiction` "kuat" vs balanced | misfire: "tarikan kuat dari Aspek Penantang" |
| r5-07 | `fact.condition_named` "Dominant Wealth"; `fact.strength_contradiction` x2 | the first is real. The second is a misfire on a CORRECT statement of balanced: "posisimu tidak ekstrem kuat maupun lemah" |
| r5-09 | `fact.condition_named` "Missing Wood" | real |
| r5-10 | `fact.strength_contradiction` x2 (both drafts) | misfire: "berakar kuat", "mengalir kuat" |
| r5-11 | `v2.d3_hanzi`; `fact.condition_named` "Missing Wood" | real, both |

**Both floors are `fact.strength_contradiction` firing on the ordinary adverb "kuat".** By this read, all six of its firings this round were misfires, and one fired on a sentence that states the verdict correctly. It is a token check where the defect is a construction. Longer prose uses "kuat" more often, so DEPTH meets this check more often than the control does. **No check was changed** (AR: no production change), and whether to change it is Cowork's and Reyner's call. It is the upstream-cause question from CHECK 3, not a request for a new gate.
