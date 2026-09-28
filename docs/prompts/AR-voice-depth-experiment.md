# Prompt AR: voice depth experiment, round 5 (Cowork, 2026-09-28)
Untracked in the working tree as `docs/prompts/AR-voice-depth-experiment.md`. Commit it with your first change.

Cite the four checks. Two-round cap. No model-based judge. No production change: this is a measured experiment. Reyner judges the output blind.

## Why (Reyner, 2026-09-28, verbatim)
```
it's still too sparse, too rigid, too short because it blurts the mechanic but doesn't elaborate and storytell enough in simple human term.
Assumption: Is this because the model's limitation? What's the next model after flash-lite 3.1 that's better but doesnt break the bank?
Assumption: is it because our prompt to the renderer still too restrictive?
```
**This reopens the 2026-09-26 "no writer bake-off" ruling** (product-boundary rulings item 6) for one measured round. Reyner reopens it by pasting AR.

**Cowork's diagnosis** (to be confirmed or refuted by this round, not assumed):
1. **`temperature: 0.2`** (`lib/render/config.js:60`) is the spec-era setting. The v2 path does not override it (`lib/render/index.js:300` overrides only `maxOutputTokens`). Its own comment says determinism comes from the cache, not the temperature.
2. **Breadth over depth:** one pass covers ~8-9 facts in ~350-500 words, so each fact gets 2-3 sentences.
3. **The examples anchor length:** `docs/content/voice-examples-v2.txt` is ~960 words for five examples, about 190 each.
4. **The model:** 3.1 Flash-Lite is the smallest tier.

The v2 prompt itself (546 words) is not the main restriction; it already says "interpret freely".

## §1. Four arms, same charts, same deterministic gate (1.57.0), in memory, no cache writes
- **Charts:** chart1, chart13, and the production chart behind `smewTNtzNaoQmWysi6mYU` (辛巳 庚寅 戊申 己未; reconstruct it as you did in the AP check). Mirror only.
- **Arms:**

| Arm | Model | Temperature | Structure |
|---|---|---|---|
| A | `gemini-3.1-flash-lite` | 0.2 | today's v2 prompt (control) |
| B | `gemini-3.1-flash-lite` | 0.9 | DEPTH prompt (below) |
| C | `gemini-3.8-flash` | 0.9 | DEPTH prompt |
| D | `gemini-3.1-pro-preview` | 0.9 | DEPTH prompt (ceiling reference only, not a launch candidate) |

Pin exact model ids; never `-latest`. Record thinking-token counts. If a model spends thinking tokens by default, report them and run at the provider's lowest thinking setting; say which setting that was.

- **The DEPTH prompt** is today's v2 prompt with exactly these changes, and nothing else:
  1. **Depth first.** "Choose the three or four facts that matter most for her (the first three are required, as today). Give each one room: what it is in plain everyday words and why the engine says it (from `provenance`); how it shows up in her daily life, with one concrete scene; what it costs her; and, when the fact carries a cost, what helps, from its `actionable`. Write each as a short story, not a definition."
  2. **Then the rest, briefly.** "Every `bintang` fact appears, at least as one or two sentences each."
  3. **Length.** "A full reading is roughly 700-1000 words. The examples show the voice, not the length."
  4. **Everything else stays the same:** every "Do not invent" line, the form rules, the JSON shape, the examples.
- **Outputs:** in `reports/voice-v2/round5/`, render each reading to PDF. **Blind the filenames** (`r5-01.pdf` … `r5-12.pdf`) and keep the arm key in a separate file, `reports/voice-v2/round5/KEY.json`, which Reyner opens only after he has judged.

## §2. Measure per reading (report table, keyed by blinded id)
- word count;
- served or floor;
- regenerations;
- gate findings (hard and logged);
- how many `bintang` facts appear;
- whether each cost-bearing block ends with what helps;
- latency (ms);
- tokens in / out / thinking;
- cost at today's list price, and for arm C also at the 1 January 2027 price.

## §3. Truth sweep on top of the gate
Longer prose makes more claims. Run the existing counters (`scripts/count-portrait-claims.mjs` and the fact checks) and list every claim the engine can't back, per arm. No new checks.

## §4. Stop and report
Nothing changes in production. Reyner reads the 12 PDFs blind and picks. Cowork writes the rulings.
