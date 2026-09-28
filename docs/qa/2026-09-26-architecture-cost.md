<!--
COMMITTED 2026-09-28 (Prompt AI §3) from reports/architecture-cost-2026-09-26.md, which is gitignored,
so the product-boundary rulings could cite evidence that exists in the repo. The body below is
VERBATIM and is a record of 2026-09-26. Overtaken since, by commit:
- "v2 is PARKED" (Q1, summary 1): superseded the same day; v2 is launch-critical (PR #153).
- No pair direction / supplier / seat / dominance check (Q7, Q8): added, STAGE6 1.39.0-1.41.0 (PR #154).
- The judge in the v2 render path (Q3, Q13): removed, STAGE6 1.42.0 on feat/voice-v2.
- The two v2 defects in Q3: fixed, STAGE6 1.43.0 and 1.44.0 on feat/voice-v2.
- Serve-time re-gate keeps a bad row, and pairs are not re-gated (Q1 step 12): the fix is PR #155.
- Its last line ("this file is untracked as asked") describes the reports/ original, not this copy.
-->

# Production architecture and cost: answer to Prompt AF

**Date:** 2026-09-26. Read-only: no code changes, no model calls, no commits, no database access.
**Author:** Claude Code (Opus 5.5), with four read-only research subagents. Their key claims were
re-checked by hand. The checks are listed at the end.

**Which copy was read (CHECK 1):**
- **Production** is `origin/main` at `ec8ea00` ("Merge pull request #151", 2026-09-26 13:58 +0700).
  - Local `main` is stale at `bb4a0b0` and was **not** used.
  - Production files were read with `git show origin/main:<path>`.
- **v2** is the working tree on `feat/voice-v2`. It is 28 commits ahead of `origin/main`; HEAD is
  `6cd9f90`.
- Line numbers are prefixed `M:` (origin/main) or `V:` (feat/voice-v2).
- Files that are byte-identical on both branches carry a bare number. They are:
  - `lib/mirror/*`, `lib/render/config.js`, `lib/render/fallback.js`, `lib/ratelimit.js`,
    `app/*`, `components/*`
  - `lib/validate/fact.js`, `pair.js`, `style.js`, `structure.js`, `opening.js`, `brackets.js`,
    `blocklist.json`

**Prices.** All dollar costs are **measured tokens × list price**, which is an estimate, not billing
data. The price table is `scripts/qa-voice-v2-renders.mjs:64-69` = `scripts/voice-v2-samples.mjs:75-80`.
It reads "ai.google.dev/gemini-api/docs/pricing, read 2026-09-24" and bills thought tokens as output.

| Model | Input, per 1M tokens | Output, per 1M tokens |
|---|---|---|
| `gemini-3.1-flash-lite` | $0.25 | $1.50 |
| `gemini-3.1-pro-preview` | $2 | $12 |

Rupiah conversions use about Rp 17,600/USD. That rate is implied by PROGRESS.md:269 ("USD 50 ≈
Rp 880.000") and is also an estimate.

---

## Executive summary: the facts the judge decision rests on

1. **Production has no judge.** The semantic judge exists only on `feat/voice-v2`.
   - `git grep judgeRendering origin/main` finds nothing.
   - `lib/voice.js` is absent on main. Even on the branch, `voiceVersion()` returns `v1` whenever
     `VERCEL_ENV=production` (V:`lib/voice.js:18-21`).
   - v2 is PARKED by ruling (PROGRESS.md V:363, "VOICE V2 PARKED; LAUNCH ON v1 - ruled 2026-09-25").
2. **Cost per uncached reading.** The mean v1 production-path reading costs about **$0.0065** (about
   Rp 114; n=10 measured, range $0.004-$0.013). A v2 reading with the Pro judge costs about
   **$0.069 on first pass and up to $0.119 observed**. **The judge is 15-36x the writer.**
3. **The Flash-lite judge is about 26x cheaper per call than Pro, but it failed calibration.**
   - It missed g4WH4, the one real error the judge has ever caught, in 3 of 3 runs. It returned
     nothing.
   - The branch at STAGE6 1.38.0 still gates J1 on it
     (`docs/qa/2026-09-26-voice-v2-j1-flash-lite-arms.md`).
4. **The deterministic layer cannot see pair direction.** An inverted `p1` direction and a wrong `p3`
   supplier both pass v1 **and** v2 with no finding at all (planted probes, Q7).
   - `pair.direction_resolved` checks only that "kamu"/"dia" are present. It never checks which way
     the direction points.
   - This is exactly the class of error behind the judge's only real catch (g4WH4).
5. **Evidence behind any judge decision is thin.** The real-catch record is **n=2**: the same pair,
   the same sentence, rounds 2 and 3. Every voice run is n=7 readings with one draw each. The
   Flash-lite judge has **never** run inside the render pipeline, only in calibration.
6. **Caching.** The cache is **global and shared across users**, keyed on the chart's semantic JSON.
   No name is collected. Gender, `STAGE6_VERSION`, prompt version and model id are not in the key.
   A cache hit makes **zero** model calls: no writer and no judge.
7. **Abuse bounds that exist today:**
   - a per-IP limit of 60 creates per hour;
   - a per-chart render limit of 3 per hour;
   - a global ceiling of 1,500 writer attempts per day, sized at about Rp 118,500;
   - Gemini auto-reload capped at IDR 4,518,125.

   There is no captcha. A scripted client that drops cookies is bound only per IP. On v2, judge calls
   are **not** counted against the daily ceiling.
8. **Commercially, only the free mirror is live.** Sales are CLOSED (`paymentsProvider()` returns
   `closed` with no `PAYMENTS_PROVIDER` set), and every paid call to action is hidden.

---

## Q1. One new mirror, end to end

Production and v2 share steps 1-5 and 10-13. Steps 6-9 differ.

| # | Step | Files and functions | Conditional? |
|---|---|---|---|
| 1 | Birth data submitted | Client: `components/Funnel.jsx:254` POSTs `/api/mirror`. Route: `app/api/mirror/route.js:25-27` → `lib/mirror/handlers.js:createMirrorReading` (110-209). `admit()` (83-98) resolves the `katon_sid` cookie and rate-limits `mirror_create`. The body is `{birthDate, birthTime, gender, termSide}` (127), validated by `birthInputError` (135). **No name field exists.** | always |
| 2 | BaZi calculation | `calculateBaziChart` (handlers.js:141) | always |
| 3 | Fact generation | `buildSemanticJson(chart)` (handlers.js:148); `cacheKey(...)` (149); token `nanoid(21)` (150); `createReading` inserts a `reading` row (152-177). The POST response returns the token plus the deterministic chart (`mirrorChartView`, 204-208). **POST never calls a model.** | always |
| 4 | Serve request | The client GETs immediately (`Funnel.jsx:309`). Page load of `/r/[token]` also triggers it (`ReadingByToken`, `Funnel.jsx:1792`). Route: `app/api/mirror/[token]/route.js:209-212` → `serveMirrorReading` (handlers.js:223-299). Rate limit `mirror_serve` (227); `getReading` (230); `semanticFromRow` recomputes the chart, facts and key (235; `lib/mirror/reading.js:50-54`). | always |
| 5 | Cache read | `renderReading` (handlers.js:241). In-flight dedupe keyed by cache key, per instance only (M:`lib/render/index.js:167-187`, V:169-189). `renderOnce` reads the cache (M:239-259, V:241-261). **A hit returns `cached:true` and skips steps 6-11.** | always |
| 5a | Fences and spend guards | `renderFenceReason()` (M:266-267): in production with no `GEMINI_API_KEY` it throws, giving a 503 (`config.js:222-226`). Guard (a): `render_per_key`, 3 per key per hour (M:347-369; `ratelimit.js:151-153`); a refusal empties the chain, so the reader gets the floor. Guard (c): `render_attempts_daily`, 1,500 per UTC day, charged per writer attempt (M:384-402; `config.js:205`). | on miss |
| 6 | Writer call | `provider.call(loadPrompt(...) + directive, payload)` (M:410, V:435) → `renderWithGemini`. The system instruction is the prompt; user content is `JSON.stringify(scrubbed semantic JSON)` (`providers/gemini.js:81-95`). Settings: temperature 0.2; maxOutputTokens 4096 (8192 on v2, V:277); timeout 45s (`config.js:59-76`); JSON schema; no `thinkingConfig`. Shape check: `parseRenderResponse` (M:413, V:438). An unknown fact id counts as a model failure. | on miss, unless a guard refused |
| 7 | Deterministic validators | **Production:** `validateRendering` (M:449; M:`lib/validate/index.js:181-247`), STAGE6 `1.25.0` (M:index.js:164). **v2:** `validateRenderingV2` (V:474-476; `lib/validate/v2.js:342-425`), STAGE6 `1.38.0` (V:index.js:256). It normalises typography and brackets, then runs D1-D4 plus six hard factGuard checks (v2.js:56-59); everything else becomes `flag`. | every parsed draft |
| 8 | Semantic judge | **Production: none.** **v2:** `judgeRendering` (`lib/validate/judge.js:157-208`) runs only when `isV2 && gate.ok` (V:`render/index.js:490-520`), once per draft that passed D1-D4. J1 and `judge_unavailable` gate; J2-J4 are advisory (V:511-519). An error or timeout becomes a **hard** `v2.judge_unavailable` (V:491-497). | v2 only, after a deterministic pass |
| 9 | Regeneration | The rejection is **fed back** into the same system prompt. Production: `stricterDirective(findings, forbiddenLiterals)` (M:499; `lib/validate/directive.js:117-123`). v2: `v2Directive(findings)` quotes the offending sentence (V:585-587; `v2.js:438-445`). Budgets: `REGENERATION_BUDGET = 2` on production (`config.js:171`); `Math.min(1, …)` = **1** on v2 (V:`render/index.js:346`). There is also a separate transport/shape retry: `attemptsPerProvider: 2` gives one retry (`config.js:75`, M:375). **Maximum writer calls per miss: 4 on production (3 plus 1 transport), 3 on v2 (2 plus 1). Maximum judge calls: 2 (v2 only).** | when a draft is rejected |
| 10 | Floor (module assembly) | `withEngineOpening(assembleFallback(sj))` (M:511-550, V:598-638), stamped `stage6_version: "<ver>-floor"`. The floor is re-gated before serving (`floorRefusalReason`, handlers.js:448-463; a hard finding returns a 503). | chain empty, guard refused, budget spent, or all transport failed |
| 11 | Persist | `persistRendered` (M:583-606, V:671-697): **returns false for `source==='module_assembly'`** (M:589, V:677), so a floor is never cached (rule 16 confirmed). Otherwise `writeCache` upserts `render_cache` (`lib/render/cache.js:82-113`); v2 adds a `review` column (V:cache.js:101; migration 0011, **not applied** per PROGRESS V:363). | model output only |
| 12 | Serve-time re-gate | `floorIfHardFailing` (handlers.js:251, 406-427) re-runs `validateRendering` on every cached row. A hard finding serves the floor and does not rewrite the row. A `mirror_served` event records the source (296). | always |
| 13 | Delivery | **Synchronous inside the GET request**, with no streaming or deferral. Response: `mirrorServeView` (handlers.js:298; `view.js:205-226`) with blocks, penutup and `meta`. **No `maxDuration` is set anywhere** (app, lib, next.config, vercel.json). | always |

**Latency, measured:** v2 with the Pro judge took 23-49s per reading, against 3-17s for v1 (the
round-2 and round-3 render JSONs under `reports/voice-v2/`). The judge timeout is 240s (judge.js:158).
Worst case on v2 is 3×45s writer plus 2×240s judge, which could exceed a Vercel function limit. The
plan's limit is **not readable** from the repo.

---

## Q2. Does every fresh mirror invoke the writer?

| Case | Writer called? |
|---|---|
| Uncached mirror | **Yes**: 1-4 calls on production, 1-3 on v2. It is not called if a spend guard refuses (the floor is served) or if a concurrent request for the same key on the same instance is already rendering. |
| Cached mirror | **No.** Cache hit, zero provider calls (M:`render/index.js:242-259`). |
| Repeated request, same birth data | A new token and a new `reading` row are created (no row dedupe, handlers.js:148-177), but the **cache key is the same, so it is a hit.** **Exception:** if the earlier serve was a floor, nothing was stored and the writer runs again. That is bounded by guard (a) at 3 per key per hour. |
| Different person, identical chart | **Same key, so a hit on the shared row.** |

**What is cached: only validated model prose,** in `render_cache` (migration 0006).
- Columns: `cache_key` (PK), `engine_version`, `blocks`, `penutup`, `source`, `model`,
  `prompt_version`, `stage6_version`, `status`, `created_at`, `served_count`; plus `review` on v2.
- **Not cached:** the raw chart, the semantic facts (recomputed on every GET), unvalidated drafts,
  and floors.
- `readCache` requires a non-null `stage6_version` but does not compare it with the current value
  (`cache.js:58`). The serve-time re-gate (step 12) compensates for that.
- `served_count` is never incremented on the Supabase path.

**The key** (M:`lib/semantic/index.js:396-401`):
```js
const canonical = JSON.stringify(canonicalize(semanticJson));
return createHash('sha256').update(`${semanticJson.engine_version}\n${canonical}`).digest('hex');
```
- On v2 (V:463-471) the input gains a `voice=v2\n` prefix, but only when v2 is active, so v1 keys are
  byte-identical to production.
- **In the key:** the whole canonical semantic JSON:
  - `kind`, `engine_version` (`0.4.4-stage3`, M:36 / V:37), `target_language`, **`hour_known`**,
    `quiet_chart`, `boundary_flag`
  - `core`, `strength` (including its internal-only `confidence_reasons`)
  - `chart`: pillars, animals, palaces, element presence, missing element
  - `facts`, `required_points`, `safety_flags`, `qa`
  - on v2 only: `voice`
- **Not in the key:**
  - name (never collected)
  - gender (not emitted into the semantic JSON; `reading.js:30-31`)
  - the raw birth date/time strings and `term_side`, which count only through the pillars they
    produce
  - **`STAGE6_VERSION`, prompt version, model id and generation config**
- **Consequence:** a prompt edit, a model change or a gate change does **not** invalidate the cache.
  A tightened gate reaches cached rows only through the serve-time re-gate. Only an `ENGINE_VERSION`
  bump moves the key.

---

## Q3. Does every fresh mirror invoke the semantic judge?

**Production:** never. There is no judge on `origin/main`.

**v2:**

| Case | Judge called? |
|---|---|
| Uncached | **0-2 calls.** Once per writer draft that passes D1-D4 (V:`render/index.js:490`). **0** if every draft fails deterministically, which ends on the floor with no judge spend. |
| Cached, repeat birth data, identical chart | **No.** The judge never runs on a cache hit. |

- It runs **once per draft, over the whole reading.** It is not per block and not per failed check.
- **It runs again after a regeneration** if the regenerated draft passes D1-D4.
- J1 findings and `judge_unavailable` are hard: they force the single regeneration, and a second one
  serves the floor. J2-J4 are re-marked `flag` (V:511-519). Malformed judge findings are dropped,
  J1 included (`judge.js:136-144, 199-204`).
- **A judge outage** makes every v2 miss cost 2 writer calls plus 2 failed judge calls, and every one
  ends on the floor.
- **Judge calls are not charged to the `render_attempts_daily` ceiling.** The single `consume`
  (V:410) runs before the judge (V:490).

**Two v2 defects found in passing** (neither is live, since v2 is not in production):
1. **Cached v2 rows are re-gated by the v1 validator.** `floorIfHardFailing` calls `validateRendering`
   (handlers.js:409; the file is unchanged on v2). v1 treats `fact.palace_dropped`,
   `fact.strength_same_breath` and `fact.strength_bare_label` as hard, while v2 serves them at `flag`.
   A v2 reading served first time with one of those findings would floor on **every later cache
   hit**, and it never self-heals, because the row is not rewritten.
2. **`fact.badge_invented` false positive on v2 pairs.** It reads only `semantic.facts` labels
   (`fact.js:405`), but a v2 pair supplies each person's badges under `mirror.a/b`. A planted probe
   in which A's own supplied badge (Bunga Persik) is named in a v2 pair returns
   `hard fact.badge_invented`. This came in with 244aace (STAGE6 1.36.0). It is latent: no replayed
   v2 pair draft names a badge.

---

## Q4. Flash-lite writer cost, measured

**Source.** `usageMetadata` captured per call by `scripts/qa-voice-v2-renders.mjs:104-125`, across
three runs:
- `reports/voice-v2/run1-stage6-1.29.0/`
- `reports/voice-v2/*.json` (run 2)
- `reports/voice-v2/round3/`

These files are gitignored and were aggregated locally. The runs used the branch's harness; the v1
path in them is production's prompt and chain run on the branch, **not main itself**.
`thoughtsTokenCount` was **0 on all 51 writer calls.**

| Path | Calls | Input tokens, mean (range) | Output tokens, mean (range) | $ per call, mean (range) |
|---|---|---|---|---|
| v1 mirror (production path) | 15 | 9,430 (8,652-9,930) | 1,333 (1,091-1,512) | 0.0044 (0.0039-0.0047) |
| v2 mirror | 20 | 4,618 (3,950-5,101) | 780 (530-986) | 0.0023 (0.0019-0.0028) |
| v1 pair (production path) | 5 | 5,652 (5,460-5,837) | 762 (704-825) | 0.0026 (0.0024-0.0027) |
| v2 pair | 11 | 10,546 (10,483-10,696) | 841 (687-936) | 0.0039 (0.0037-0.0041) |

**Calls and cost per uncached reading (writer only):**
- **v1 mirror:** 10 readings, 15 calls, so **1.5 calls per reading**. **Mean $0.0065 per reading**
  (range $0.0040-$0.0130), about Rp 114 (estimate). The worst was run-1 chart1: 3 calls, 29,587 in /
  3,729 out, $0.0130.
- **v1 pair:** 4 readings, $0.0024-$0.0053.
- **v2 writer share:** mirror $0.0019-$0.0052; pair $0.0039-$0.0080.
- **Larger-sample call rates** (v1 mirror, older gates, **no tokens recorded**):
  - 1.80 calls per reading at a budget of 3 (`docs/qa/2026-08-22-renders-n10-postfixes.json`, 72
    attempts over 40 runs);
  - 1.88 at a budget of 2 (PROGRESS.md:724/733, a truncation of the 08-18 trace).
- **The code's own figure.** "Rp 79 per attempt, about Rp 142 per reading" (`config.js:190-192`)
  derives from "78 attempts, Rp ~6,200 already spent" (PROGRESS.md:724). **The origin of the
  Rp 6,200 is not recorded** (no billing screenshot is cited). It agrees with list price: $0.0044 per
  call ≈ Rp 77.

---

## Q5. Judge cost, measured

### Pro judge (`gemini-3.1-pro-preview`), inside the render pipeline (runs 1, 2 and 3)

| Chart type | Judge calls | Input, mean (range) | Output, mean (range) | Thinking tokens, mean (range) | $ per call, mean (range) |
|---|---|---|---|---|---|
| Mirror | 13 | 6,143 (5,502-6,919) | 245 (9-427) | **4,278** (2,197-6,409) | **0.0666** (0.0375-0.0937) |
| Pair | 4 | 11,943 (11,909-11,963) | 119 (9-289) | 2,866 (1,997-4,352) | 0.0597 (0.0479-0.0796) |

- **Calls per reading:** one per draft that passed D1-D4. On a first-pass reading that is 1.
- **Cost per first-pass reading (writer + judge):** the round-3 mirrors average **$0.0692** (range
  $0.0443-$0.0924). The judge is **15-36x the writer**
  (`docs/qa/2026-09-24-voice-v2-renders-v1-v2.md:43-44`).
- **With a regeneration after a deterministic reject** (2 writer calls, 1 judge call): round-3 PZ0t
  $0.0557; run-2 chart4 $0.0772; run-2 chart8 $0.0841.
- **With a regeneration after a J1 reject** (2 writer calls, 2 judge calls): round-3 g4WH4
  **$0.1193**, of which the judge is $0.1113. **This is the worst reading observed.** It was re-derived
  by hand from the stored `usageMetadata`:
  - writer 10,584/816 and 10,696/936 tokens;
  - judge 11,955 in, 170+2,621 out, and 11,946 in, 9+2,495 out;
  - total $0.1192.
- **Worst single judge call:** $0.0937 (run-1 chart1-v2, 6,409 thinking tokens).
- **Floors after two deterministic rejects** cost no judge spend: $0.0049-$0.0079.
- **The code-level worst case** (2 writer + 2 judge + 1 transport retry) was **not observed**.
- **Pro calibration runs,** judging short fragments plus one real reading:

| Run | Source | Calls | Total | Per call |
|---|---|---|---|---|
| Recalibration, STAGE6 1.29 | `docs/qa/2026-09-24-voice-v2-judge-recalibration.md:56-58` | 27 | $1.0862 | $0.018-0.064 |
| J1 calibration | `docs/qa/2026-09-25-voice-v2-j1-calibration.md:30`; `round3/j1-calibration-1.json` | 27 | $1.3206 | mean $0.0489, max $0.0796 |
| Recalibration on the side branch, 2026-09-26 | `round3/j1-recalibration-2026-09-26.json` | 57 | $2.1375 | mean $0.0375 |

### Flash-lite judge (`gemini-3.1-flash-lite`)

- **Never run inside the render pipeline.** No renders exist at STAGE6 1.36-1.38.
- **Calibration measurements:**
  - **Two-arm run, 2026-09-26** (`round3/j1-flash-lite-arms-2026-09-26.json`;
    `docs/qa/2026-09-26-voice-v2-j1-flash-lite-arms.md:30-32`): 114 calls, **$0.2486**.
    - Input mean 7,880 tokens (5,972-11,972).
    - Output mean 190 (Arm A) and 99 (Arm B), max 523. **Thinking 0.**
    - **$0.00225 per call (Arm A), max $0.00378; $0.00211 (Arm B).**
  - **First calibration, 2026-09-24** (J1-J4 prompt): 27 calls, $0.0437, about $0.0016 per call
    (`docs/qa/2026-09-24-voice-v2-judge-calibration.md:58`). No JSON was kept.

- **Head to head on the same real reading** (fixture g4WH4):

  | Judge | Input tokens | $ per call | Result |
  |---|---|---|---|
  | Pro | 11,963 | $0.075-0.080 | caught the inversion 3/3 |
  | Flash-lite | 11,972 | $0.0030 | **9 output tokens, no finding, missed it 3/3** |

- **Estimated v2 reading cost with a Flash-lite judge** (measured writer tokens + calibration judge
  cost, at list price): mirror about $0.004 on first pass and about $0.008 with a regeneration; pair
  about $0.007 on first pass and about $0.014 worst.

---

## Q6. Observed regeneration rates

"Floor" means module assembly was served. "Avg calls" means writer plus judge calls per final reading.

### Voice runs (writer Flash-lite; judge Pro, advisory until STAGE6 1.33.0)

| Run (source) | Budget | N | First pass | 1 regen | 2 regen | Floor | Avg calls |
|---|---|---|---|---|---|---|---|
| Run 1 v1, 1.29.0 (`run1-stage6-1.29.0/*-v1.json`) | 2 regens | 7 | 4 (57%) | 2 | 1 | 0 | 1.57 (writer only) |
| Run 1 v2, 1.29.0 (`*-v2.json`) | 1 | 7 | 3 (43%) | 1 | - | **3 (43%)**¹ | 2.14 (11 writer + 4 judge) |
| Run 2 v1, 1.30.0 (`reports/voice-v2/*-v1.json`; renders-v1-v2.md:21-40) | 2 | 7 | 5 (71%) | 2 | 0 | 0 | 1.29 |
| Run 2 v2, 1.30.0 | 1 | 7 | 3 (43%) | 2 | - | **2 (29%)** | 2.29 (11 + 5) |
| Round 3 v2, 1.33.0, J1 gating (`round3/*.json`; `2026-09-25-voice-v2-round3-renders.md:21-31`) | 1 | 7 | 5 (71%) | 2 (one on D1, one on J1) | - | 0 | **2.43** (9 + 8) |

¹ Two of those three came from a harness shape-check bug that was later fixed (renders-v1-v2.md:80-82).

### Compat, production v1 pair pipeline (Flash-lite writer, budget 2 regens)

| Run (source) | Gate | N | First pass | 1 regen | 2 regen | Floor | Avg calls |
|---|---|---|---|---|---|---|---|
| 09-08 n10 (`2026-09-08-compat-renders-n10.md`) | 1.18.0 | 10 | 0 | 6 | 2 | 2 (20%) | 2.40 |
| 09-08 n20 (`2026-09-08-compat-renders-n20.md`) | 1.23.0 | 20 | not separable | - | - | 1 (5%) | 1.80 |
| 09-11 baseline / after | 1.23.0 | 10 / 10 | not recorded | - | - | 1 / 3 | not recorded |
| Round 2, draws 1 / 2 / 3 (`2026-09-13-compat-voice-round2-draw*`) | 1.24.0 | 10 each | draw 3: 3 | draw 3: 3 | 0 | 1 / 5 / 4 | draw 3: 2.10 |
| Round 2b, draw 1 | 1.24.0 | 10 | 4 | 2 | 0 | 4 | 2.00 |
| Round 2b, draw 2 | 1.24.0 | 10 | 6 | 3 | 0 | 1 | 1.50 |
| **Gate 1.25.0 pooled, production's gate** (`2026-09-14-compat-gate-1250-pooled.md`) | 1.25.0 | 20 | **11 (55%)** | 7 | 0 | **2 (10%)** | **1.55** |

### v1 mirror, larger samples (older gates)

- 08-19, 2-attempt cap: floor 8/40 = 20% (PROGRESS.md:725).
- 08-22 postfixes, **budget 3**: 24/40 first pass (60%), 6 with one regen, 4 with two, 2 with three,
  4 floors (10%), 1.80 calls (`docs/qa/2026-08-22-renders-n10-postfixes.json`).
- **There is no v1 mirror floor rate at n≥10 on production's current gate, 1.25.0.** The newest v1
  mirror data is the 10 voice-run readings above, with 0 floors.

**Thin:** every voice run is n=7 with one draw per subject. The compat draws show how noisy n=10 is:
floors of 1, 5 and 4 on the same gate.

---

## Q7. Deterministic truth checks on generated prose

**What runs where:**
- **v1** runs `validateRendering` (V:`lib/validate/index.js:273-339`, the same function as M:181-247)
  for both mirror and pair.
- **v2** runs `validateRenderingV2` (`v2.js:342-425`) and then the judge.

**Severity legend:**
- `hard`: rejects, and a cached row falls back to the floor at serve time.
- `soft`: rejects, and the writer regenerates.
- `flag`: logged only.

### A. Truth checks (grounded in engine output)

| Check | file:line | v1 mirror | v1 pair | v2 | What it catches |
|---|---|---|---|---|---|
| `fact.strength_contradiction` | fact.js:271, :281 | hard | inert (no `strength` on a pair) | hard on mirror (v2.js:56); inert on pair | a wrong strength verdict about the reader |
| `fact.hour_known_contradiction` | fact.js:373 | hard | inert | hard on mirror; inert on pair | "jam lahir tidak diketahui" when the hour is known |
| `fact.day_master` | fact.js:390 | hard | inert | hard on mirror; inert on pair | "kamu (adalah) <wrong element>" |
| `fact.badge_invented` | fact.js:410 | hard | hard | hard, **mirror and pair** (false positive on v2 pairs, see Q3) | a glossary Bintang name the chart does not carry |
| `fact.condition_named` | fact.js:432, :450 | hard | hard | hard | a null-label condition worn as a badge, e.g. "(Missing Wood)" |
| `fact.relation_positions` | fact.js:582 | hard | inert | hard on mirror | a branch-relation span that drops a pillar, in the citing block |
| `fact.palace_dropped` | fact.js:502 | hard | inert | **flag** (v2.js:399) | the palace is not named where its fact is cited |
| `v2.d1_invented_term` | v2.js:139 | - | - | hard | any glossary term (aspek, bintang, kekuatan, relasi_cabang, pilar, kompatibilitas, Fondasi Pasangan) that no supplied fact carries |
| Unknown fact id (shape check) | render/schema.js:115 | model failure | same | same | a block cites a fact id not in the payload |
| `pair.direction_resolved` | pair.js:261 | - | flag | flag (v2.js:390) | neutral cell wording ("salah satu") leaked, or a direction block lacks kamu/dia. **It does not check which way the direction points.** |

### B. Coverage and content structure

| Check | file:line | v1 | v2 |
|---|---|---|---|
| `coverage.missing_point` | coverage.js:56 | soft | flag |
| `coverage.field_dropped`, `coverage.cost_dropped` | coverage.js:85-86 | soft | flag |
| `v2.d2_point_not_cited` | v2.js:381 | - | soft; covers only 3 mirror identity facts, or pair `p2_day_pair` and `p5_pull_fit` (`semantic/index.js:288`) |
| `opening.archetype_missing`, `opening.element_fused` | opening.js:105, :142 | flag | not run |
| `pair.both_named` | pair.js:104 | hard (pair) | hard; cannot fire on the model path, because `withEngineOpening` injects the ruled opening |
| `pair.reframe_missing` | pair.js:154 | hard (pair) | hard |
| `coverage.slot_filling` | M:coverage.js | flag, inert by construction | removed (148fdc5) |

### C. Voice, style, format and ethics (not truth checks)

| Check | file:line | v1 | v2 |
|---|---|---|---|
| `forbidden.{fatalism, medical, financial, ranking, self_harm}` | style.js:186 | hard | hard (D4, v2.js:402-405) |
| `pair.verdict` | pair.js:188 | flag | replaced by `v2.d4_verdict`, **hard** (v2.js:74) |
| `fact.strength_bare_label`, `fact.strength_same_breath` | fact.js:311, :325 | hard | flag |
| `style.typography`, `style.hanzi` | style.js:356, :363 | soft | normalised first; residual `v2.d3_hanzi` hard (v2.js:385) |
| `v2.d3_score` | v2.js:387 | - (nearest: `style.arithmetic`, soft) | hard |
| `style.*` categories: hedging, slang, particles, meta, code_leak, raw_pillar, rhetorical_question, unsanctioned_bracket, english_leakage, and others | style.js:245-425 | soft | flag |
| `structure.*` | structure.js:174-258 | soft | flag |
| `brackets.*` | brackets.js:289-325 | flag | flag |
| `pair.penutup_register` | pair.js:298 | flag | flag |
| `v2.judge_unavailable` | render/index.js:495 | - | hard |

### D. What the deterministic layer catches

**Method.** Sentences were planted into floor drafts and run through both gates by scratch probe
scripts, without calling any model. The probes are **falsified** (CHECK 2): the same harness makes
`fact.day_master`, `fact.badge_invented`, `fact.strength_contradiction` and `v2.d1_invented_term`
fire on their planted inputs. I re-ran them myself. They are **not committed tests.**

| Error class | Verdict | Evidence |
|---|---|---|
| **Pair direction inversion** | **NO, on both voices** | Probe: `p1` with `cycle: a_produces_b`, written "dia menghidupi kamu", gives `ok=true, []` on v1 and v2. Existing tests cover only neutral wording and a missing pronoun (`tests/compat-voice-round2.spec.mjs:81, :89`). No planted inversion test exists. |
| **Wrong element supplier** | **NO** | Probe: "kamu memberi Kayu" when A supplies Water gives `ok=true` on v1 and v2. **The real g4WH4 fixture (`tests/fixtures/voice-v2-g4WH4-round2.json`) passes today's v2 gate 1.38.0 with zero rejecting findings.** |
| **Wrong relation** | **PARTIAL** | Named by its glossary term and not supplied: v2 D1 catches it (probe: "Benturan" gives `v2.d1_invented_term`; no unit test). v1 has no relation-name check. **Written in plain words** ("berbenturan dengan cabang di Pilar Akarmu", seed S2), neither voice catches it. |
| **Wrong pillar or position** | **PARTIAL** | A mirror relation span that drops a pillar is caught (`tests/stage6-validation.spec.mjs:336`; v2 evidence is the 244aace replay). Pilar Arah on an hour-less chart: v2 D1 (`tests/voice-gate.spec.mjs:56`); not v1. **Pair pillar claims are unchecked:** the probe "Pilar Akar-mu terhubung dengan kursi pasangannya" passes both. A badge placed in the wrong pillar is unchecked. |
| **Invented badge or fact** | **PARTIAL** | A badge name is caught (v1 `stage6-validation.spec.mjs:251`; v2 `voice-gate.spec.mjs:45, :169`). A condition worn as a badge is caught (`stage6-validation.spec.mjs:263`). **Plain-word inventions pass both voices** (probes): "Kayu paling banyak", "Unsur Kayu mendominasi", "Pilar Arah-mu dipenuhi unsur Kayu", "tahun lalu kamu kehilangan pekerjaan". |
| **Missing or contradictory strength** | **YES on the mirror, NO on pairs** | Contradiction: `stage6-validation.spec.mjs:146, :1957`; `voice-gate.spec.mjs:158`. Missing: v1 `coverage.missing_point` (`stage6-validation.spec.mjs:607`); v2 D2 (`voice-gate.spec.mjs:110`). Pair: the probe "Kamu kuat" when A is weak passes on v2. |
| **Other: wrong Day Master** | **YES on the mirror, untested** | `grep fact.day_master tests/` finds nothing. The probe shows it fires on "Kamu adalah Air" (mirror, both voices) and does not fire on pairs. |
| **Other: hour known** | YES (v1) | `stage6-validation.spec.mjs:187`; untested on v2 (same code). |

### E. Does v2 run every relevant v1 truth check? No. The gaps:

1. **`pair.direction_resolved` does run on v2, at `flag`, as on v1.** Neither voice detects a real
   inversion. This is the most important gap, and it is shared by both voices.
2. **v2 pairs get no person-level truth checks.** Strength, Day Master, hour and relation positions
   all read top-level fields that a pair JSON does not have; `mirror.a/b` is never consulted. The same
   is true on v1, but v1 pairs are not given mirror facts to misuse.
3. **Hard on v1, logged only on v2:**
   - `fact.palace_dropped`, `fact.strength_same_breath`, `fact.strength_bare_label` (v2.js:56-59,
     :398-399);
   - coverage `missing_point`, `field_dropped`, `cost_dropped` (soft on v1). D2 replaces them for only
     3 mirror or 2 pair ids, so an uncited `p3_supply` or `p1_stem_relation` is not even soft on v2.
4. **New false positive on v2 pairs:** `fact.badge_invented` fires on a supplied mirror badge (Q3).
5. **Stricter on v2 than v1:** D1, `v2.d4_verdict` (hard; flag on v1), `v2.d3_score`, residual hanzi,
   J1 and `judge_unavailable`.

---

## Q8. What the Pro judge caught that deterministic checks could not

**Calibration results by model:**

| Record | Judge | STAGE6 | Result |
|---|---|---|---|
| `2026-09-24-voice-v2-judge-calibration.md` | Flash-lite | 1.27.0 | **FAIL**: J3 0/3; 16 false positives over 27 calls |
| `2026-09-24-voice-v2-judge-recalibration.md` | Pro | 1.29.0 | every class 3/3, but 12 false positives over 27 calls; kept advisory |
| `2026-09-25-voice-v2-j1-calibration.md` | Pro | 1.32.0 | **PASS: 15/15 seeded, 0 clean J1 false positives** (J1 became hard in 1.33.0) |
| side branch `feat/voice-v2-judge-rubric` (38a7a2c), `2026-09-26-voice-v2-j1-recalibration.md` | Pro | 1.35.0 | **FAIL**: scene-fail 9/15 (fail-hourwood and fail-monthclash filed as J2 in all runs) |
| `2026-09-26-voice-v2-j1-flash-lite-arms.md` | Flash-lite | 1.38.0 | **Both arms FAIL**: seeded 9/15; clean false positives 2/12; scene-pass false positives 6/15 (A) and 0/15 (B); **g4WH4 missed 3/3 and seed-S4 missed 3/3** |

**Per planted error.** Classes: (a) a deterministic check already catches it; (b) one could be added;
(c) it needs semantic review.

| Case | Class | Detail |
|---|---|---|
| seed-J1 / seed-S1, "Bintang Perantau (Travelling Horse)" | **(a)** | `v2.d1_invented_term` + `fact.badge_invented` (`voice-gate.spec.mjs:169`, `stage6-validation.spec.mjs:251`) |
| seed-J4, dropped cost | **(a)** | `coverage.cost_dropped` (`stage6-validation.spec.mjs:615`); soft on v1, **logged only on v2** |
| seed-J2, "Bintang Penolong ... karena Tanda Kekosongan membuat orang kasihan" | **(c)** | both terms are supplied; the error is an invented causal link |
| seed-J3, "tidak pernah ... dalam keadaan apa pun" | **mostly (c)** | a (b) heuristic is possible: absolute markers in a block whose cited meanings are hedged. `forbidden.fatalism` covers only "tidak akan pernah". |
| seed-S2, "Pilar Diri ... berbenturan dengan ... Pilar Akar" | **(b)** | map relation verbs and nouns to relation codes; two pillars named with such a verb must match a `branch_relation` fact's `provenance.positions`. Brittle to paraphrase. |
| seed-S3, "Kayu ... paling banyak" | **(b)** | element + dominance word ("paling banyak", "dominan", "mendominasi") must agree with `element_dominant_*` / `chart.element_presence` and not contradict `element_missing_*` |
| seed-S4, "Pilar Akarmu dan Pilar Akar-nya saling mengikat" | **(b)** | the engine computes cross-chart hits only into day seats (asserted at `calibrate-j1.mjs:103`), so a relation verb between two non-day pillars is invented by construction. Compare with `p2_palace_frame.a_hits_b/b_hits_a[].from.position` and `p2_day_pair.relations`. |
| **fixture g4WH4**, "dia membawa elemen Air yang tidak dominan di baganmu" (**the only real catch**, rounds 2 and 3) | **(b), and the most tractable** | It is the glossary's own `p3_supply` `label_meaning` with an element dropped into the slot. In the p3-citing block, an element with a dia/-nya subject must equal `supplies.find(from==='b').element` (kamu maps to `from==='a'`), and "X tidak dominan di baganmu" must not contradict `mirror.a`. **A plain set-membership check would miss it:** Air IS in `supplies`, just in the other direction. |
| fail-hourwood, "Pilar Arah-mu dipenuhi unsur Kayu" | **(b)** | an element asserted present against `element_missing_Wood`, or against the named pillar's elements in `semantic.chart` |
| fail-monthclash, pair "Pilar Kerja kalian ... berbenturan" | **(b)** | same day-seat rule as seed-S4 |
| fail-lastyear, fail-college, fail-lastmonth (past events) | **(c)**, partial (b) | a lexical flag on "tahun lalu", "bulan lalu", "waktu kamu kuliah" would be a new register rule, which is Reyner's call. Only four-digit years are hard today. |
| scene-pass cases | n/a | these must pass |

**Reverse case.** Round-3 chart1 was **served** under 1.33.0 with "Kamu tidak memiliki elemen Kayu
(Missing Wood)", and the Pro judge filed no J1. `fact.condition_named` now catches it (replay record
in 244aace).

**Net:**
- The judge's **one real-world catch** (g4WH4) is class (b).
- Of its calibration seeds, 2 are (a), 5 are (b), and about 2-5 are (c): the invented causal link,
  the absolute claim, and past events.
- The (b) checks are **new engine-grounded work**. None exists today.

---

## Q9. Uniqueness and caching economics

| Question | Answer |
|---|---|
| Same birth date and time | **Same reading**: same key, one shared row. |
| Different names, identical birth data | **Same reading.** Names are never collected. Gender is stored on `reading` but not in the key. |
| Different birth times, same chart (e.g. inside one 2-hour branch) | **Same reading**, with one exception: within ±2 minutes of a 節 (solar-term boundary) or 時辰 (hour-branch boundary), `boundary_flag` changes and so does the key (`pillars.ts:60, 272, 337, 480`). A different `term_side` that yields the same pillars also shares the key. |
| Hour unknown | **A different key** (`hour_known:false`, a null hour pillar, a different fact inventory). |
| Per user or shared | **Global, shared across all users.** |
| Does anything personal reach the prompt? | No. The writer and judge see only the system prompt plus the scrubbed semantic JSON (`gemini.js:86-88`, `judge.js:162-169`). |

**Real hit data: not readable.**
- There is no Supabase access from this machine: `.env.local` carries no `SUPABASE_URL` or
  `SUPABASE_SERVICE_ROLE_KEY` (names checked, values not printed).
- There is no Vercel log access.
- `served_count` is never incremented, so even the table would not show hits. `funnel_event`
  (`mirror_served` with its render source, handlers.js:296) is the table that would.
- **The only recorded counts:**
  - `render_cache`: 6 rows, all unreachable, `served_count` 0, read 2026-08-19 (PROGRESS.md:723);
  - `reading`: 24 rows (PROGRESS.md:2698), undated and before promotion.

  Neither says anything about current traffic.

**A stale figure Cowork should not reuse.** CLAUDE.md rule 19 cites "about $115 to cache the entire
mirror space" (`docs/product/launch-decisions.md:117-123`). That was a pre-measurement estimate at
about $0.0008 per reading on Gemini 2.5 Flash-Lite. **Measured v1 cost is $0.004-$0.013 per reading,
5-16x higher.** The population math should use the Q4 figures.

---

## Q10. What limits free inference abuse today

**1. Rate limiter** (`lib/ratelimit.js`)
- Fixed windows, counted in Supabase through the atomic RPC `rate_limit_hit`
  (`supabase/migrations/0008_rate_limit.sql:23-66`; `ratelimit.js:185-194`).
- **Fails closed**: a backend error refuses with reason `limiter_unavailable` (`ratelimit.js:249-251`).
- Two keys:
  - IP: the first `x-forwarded-for` entry, else `x-real-ip` (270-277);
  - session: the httpOnly cookie `katon_sid` (`lib/mirror/session.js:21-67`).
- **A missing key is skipped, not refused** (236).

| Bucket | Per session | Per IP | Other | Applies to |
|---|---|---|---|---|
| `mirror_create` | 10/h | 60/h | | POST `/api/mirror` (handlers.js:83-98) |
| `mirror_serve` | 120/h | 300/h | | every GET, hit or miss (handlers.js:227) |
| `pair_create` / `pair_serve` | same as mirror | same as mirror | | pair routes |
| `render_per_key` | | | **3/h per cache key** | spend guard (a) |
| `render_attempts_daily` | | | **1,500 per UTC day, global** | spend guard (c) |

- All are commented "UNFITTED opening guesses" (`ratelimit.js:47-167`).
- **Weakness, stated in the code** (`ratelimit.js:16-21`): a client that never returns the cookie gets
  a fresh session every request, so **only the per-IP limit binds a scripted client**. That is 60
  creates per hour, about 1,440 per day, per IP. With rotating IPs there is no per-client bound.

**2. Spend guards** (the real cost bound)
- POST never calls a model.
- Guard (a) caps renders per chart.
- Guard (b), in-flight dedupe, works per instance only (`render/index.js:98-187`).
- Guard (c) caps the worst day at about Rp 118,500 by the config's own arithmetic
  (`config.js:173-205`).
- **Side effect (inference from the code):** anyone who exhausts the 1,500 attempts puts **every** real
  reader on the floor until 07:00 Jakarta. The ceiling caps spend, not degradation.
- **On v2, judge calls are not counted against it** (V:410 vs V:490).

**3. Cache and duplicates**
- Identical charts are free after the first validated render. Distinct charts are not.
- Floors are never stored, so a chart that keeps flooring re-renders, bounded by guard (a).

**4. Vercel**
- `vercel.json` sets `regions: ["sin1"]` and one keepalive cron.
- **No `maxDuration`, no middleware, no WAF config in the repo.**
- The site is on Vercel **Hobby** (PROGRESS INTERIM REGISTER, M:271, OPEN).

**5. Gemini**
- "REYNER TURNED GEMINI AUTO-RELOAD ON, 2026-08-26", described as "A MITIGATION, NOT A DETECTOR". It is
  bounded by "the billing tier cap of IDR 4,518,125" (PROGRESS M:267, status OPEN).
- No balance alert exists.
- No project quota is configured in code. 429 is treated as retryable (`providers/gemini.js:40-42`).
- Whether auto-reload is still on, and the actual cap, are **not readable** here.

**6. Bot check:** none. No captcha or Turnstile package, and nothing in app, components or lib.

**7. Enumeration:** tokens are `nanoid(21)`, about 126 bits (handlers.js:150), and unknown tokens return
one identical 404. Harvesting by enumeration is not feasible.

**8. Adjacent open hole:** Preview and production share one database, and about 25 old Preview aliases
built with `mock` payments still answer `POST /api/mock-pay/<id>`, which can mark a production row
paid. That unlocks paid pair renders, still inside guard (c). It is recorded as production-flip gate i
(`docs/ops/doku-walk.md:31, 37-88`, PROGRESS M:272, OPEN).

---

## Q11. The current mirror product contract

**Free, no account, unlimited in count, reachable by link only.** The only caps are the rate limits:
10 creates per hour per session, 60 per hour per IP. There is **no** once-per-person, once-per-chart
or per-device limit. LIVE STATE: "none, ungated, and nothing in it is withheld" (PROGRESS.md:157).

**What the user receives, all of it free:**
- From POST: the four pillars, element bars, 胎元 (conception pillar) and the archetype name
  (`mirrorChartView`, handlers.js:204-208).
- From GET: the prose blocks and the penutup (handlers.js:298).
- Card A as a 1080×1350 PNG to download or share (`Funnel.jsx:986-991, 1108-1189`; built with
  `birthDate: null`, `view.js:119, 198`).
- A copy-link box (`Funnel.jsx:1026-1046`) and a control to start another reading (`Funnel.jsx:844`).

**Locked or paid** (`lib/pricing.js:59-70, 113`, `LAUNCH_PRICING = true`):

| SKU | Launch price | List price | What it is | Status |
|---|---|---|---|---|
| `artifact` (Complete Edition) | Rp 19.000 | Rp 29.000 | Card B hi-res + PDF, behind `row.paid` (`lib/deliver/handlers.js`) | built |
| `compat` | Rp 39.000 | Rp 49.000 | compatibility report + PDF | built |
| `annual` | Rp 79.000 | Rp 99.000 | nothing built | interest tap only |

**Sales are CLOSED in production.** `paymentsProvider()` treats unset or unknown as `closed` and
refuses `mock`/sandbox under `VERCEL_ENV=production` (`lib/paymentFence.js:41-71`). `checkoutOpen()`
(`:116`) hides every paid call to action. `docs/ops/doku-walk.md:25`, gate c: "production has no
`PAYMENTS_PROVIDER` and no DOKU vars". The production env value itself is **not readable**; this is
the documented state.

---

## Q12. The commercial funnel after the mirror

| Path | Status |
|---|---|
| Mirror → Complete Edition (Rp 19.000) | **Built, fenced.** The offer is hidden while the fence is closed (`Funnel.jsx:996-998`); `POST /api/pay/[id]` returns 503 `payment_closed` (`app/api/pay/[id]/route.js:114-115`). |
| Mirror → another mirror | **Live** (`Funnel.jsx:844`), on the `mirror_create` budget. |
| Mirror → compatibility (Rp 39.000) | **Built, fenced.** The home link and nav appear only when sales are open (`Funnel.jsx:540-548`; `lib/site/nav.js`). **The mirror result page has no compat call to action at all**; its Upcoming block lists `annual` only (`Funnel.jsx:1544-1552`). `/kompatibilitas` renders a sales-closed state. |
| Annual | interest capture only (`interest_registered` plus optional contact) |

**Where conversion is recorded:**
- **Payment state:**
  - `reading.paid` / `paid_at` / `invoice_id` / `sku` (migrations 0001, 0002, 0005);
  - `pair.paid` / `paid_at` / `sku` / `a_reading_id` (0010:41-64).
  - `paid` flips only in `settleReading` (`lib/deliver/settle.js:27`) and `settlePair`
    (`lib/pair/settle.js:52`), called from DOKU notify (`lib/doku/notify.js:152-176`) or reconcile
    (`lib/doku/reconcile.js:78`).
- **Funnel events** (migration 0009): `funnel_event` is unique per (reading_id, event), with a count.
  - Server-fired: `reading_created`, `mirror_served` (with source), `checkout_started`,
    `purchase_confirmed`.
  - Client-fired and whitelisted (handlers.js:319): `card_downloaded`, `offer_seen`,
    `upcoming_seen`, `interest_registered`.
  - `product_interest` records interest per product.
- **Gaps:**
  - No environment or account column, so test rows cannot be told from real ones (PROGRESS:293-299).
  - Pair events are keyed by pair id, not by the originating reading.
  - **No third-party analytics** of any kind.

---

## Q13. Can the judge be made conditional without weakening truth?

**Signals available at the point the judge would run** (V:`render/index.js:489-492`):

| Signal | Where it is available |
|---|---|
| Every deterministic finding, including logged flags | `gate.findings` (v2.js:398-415) |
| Metrics: total and block chars, coverage ratios, same-breath, bracket and typography normalisation counts | `gate.metrics` (v2.js:343-359) |
| Whether a regeneration happened, and the prior rejection findings | `directive !== ''` (index.js:523), `regenerationsLeft` (:346), `rejectedReviews` (:579) |
| Fact types present: `kind`, `provenance.kind` (compat_supply `supplies[]`, compat_stem_relation `cycle`, p2 relations, branch_relation, badge_anchor), `mirror.a/b`, `safety_flags`, `hour_known`, `boundary_flag`, `quiet_chart` | `semanticJson` / `payload` (index.js:283) |
| Which facts the draft cited | `gate.normalized.blocks[].fact_ids` (v2.js:373) |
| Draft length and tokens | `metrics.total_chars`, `raw.usage` (index.js:525) |

**Do these signals separate a risky draft from a safe one? Not on today's evidence.**
- **n=2 real J1 catches**, both g4WH4 and nearly the same sentence (rounds 2 and 3). There were 0 J1
  catches on the other judged readings.
- Those two drafts look **ordinary** on every deterministic signal: `style.hedging` ×1-2 and
  `brackets.normalised` ×2, indistinguishable from clean readings such as round-3 chart4 or chart13.
  Neither was a regenerated draft, and both are mid-range in length (357 and 400 words).
- **No evidence links finding counts, regeneration or length to J1 risk.**
- **The one signal that lines up is structural:** `kind === 'pair'` with a `p3_supply` fact whose two
  directions carry different elements (computable today from `supplies[]`). Flash-lite's calibration
  failures point the same way: seed-S4, g4WH4, the S4 false positive and the pass-pair false positive
  all concern pair provenance.
- **The honest read:**
  - A condition such as "judge pairs, skip mirrors" would, on this record, have skipped nothing the
    judge actually caught. The judge also missed chart1's "Missing Wood" anyway.
  - The record is two observations of one sentence, so this is suggestive, not evidence.
  - The error class the judge exists for (Q7 D: direction and supplier) is **invisible** to every
    deterministic signal listed above. A draft carrying it cannot be flagged as risky except by the
    fact types it cites.

---

## Q14. Production model configuration

| Role | Model | Forced by code or env | Where |
|---|---|---|---|
| Mirror writer | `gemini-3.1-flash-lite` | **Code, hard-coded** | `TIER_MODELS.free_mirror.gemini` (`lib/render/config.js:28-31`); `DEFAULT_TIER = 'free_mirror'` (:39). Unchanged on v2. |
| Paid reading (Complete Edition) | **No separate writer** | n/a | the PDF prints the cached mirror render (`lib/deliver/handlers.js:212-224`) |
| Compatibility writer | **`gemini-3.1-flash-lite` in practice** | Code, by default | `TIER_MODELS.compatibility.gemini = process.env.KATON_GEMINI_MODEL_PAID \|\| null` (`config.js:34-36`), but **no call site passes `tier`** (`git grep -n tier origin/main -- lib/pair lib/mirror lib/deliver` finds only an unrelated comment). `servePairReading` calls `renderReading(semanticJson, renderOptions)` (`lib/pair/serveReading.js:116`), so **`KATON_GEMINI_MODEL_PAID` is dead**. Commit 45ff8d1 records "for mirrors and pairs alike". |
| Semantic judge | **None on production.** On v2: `gemini-3.1-flash-lite` since 45ff8d1 (STAGE6 1.38.0), before that `gemini-3.1-pro-preview` (pinned 2026-09-24) | Code | V:`lib/validate/judge.js:66` `JUDGE_MODEL = modelFor(DEFAULT_TIER, 'gemini')`. Temperature 0, maxOutputTokens 32768, timeout 240s (judge.js:157-183). |
| Fallback model | **None** (rule 15) | n/a | the failover is the deterministic floor, `assembleFallback`. `modelOverride` exists for the QA harness only (index.js:280-287). |

**Writer settings** (`config.js:59-76`):
- temperature 0.2; maxOutputTokens 4096 (8192 on v2); timeout 45s;
- `attemptsPerProvider` 2; `REGENERATION_BUDGET` 2;
- JSON response schema; **no `thinkingConfig`** (thinking measured at 0 tokens).

**Env var names read on main:** `GEMINI_API_KEY`, `KATON_GEMINI_MODEL_PAID` (dead), `PAYMENTS_PROVIDER`,
`DOKU_CLIENT_ID`, `DOKU_SECRET_KEY`, `DOKU_SANDBOX`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`NEXT_PUBLIC_BASE_URL`, `CRON_SECRET`, `WA_PROVIDER_TOKEN`, `NODE_ENV`, `VERCEL_ENV`.
- The branch adds `VOICE`, which production ignores.
- The render fence refuses in production only when `GEMINI_API_KEY` is absent (`config.js:222-226`).
- Production env **values** are not readable from the repo.

**Model review register row** (PROGRESS M:362, commit 3267f0c): "Writer model review, post-launch".
Candidates are `gemini-3.5-flash-lite` and `gemini-3.8-flash` against the current flash-lite at
$0.25/$1.50; "Pin exact ids, never -latest aliases". That row still describes round 3 on the Pro
judge, which predates 45ff8d1.

---

## Where the evidence is thin, plainly

- **Judge value rests on n=2 real catches of one sentence in one pair.** Everything else is
  calibration against planted fragments.
- **The Flash-lite judge's render-path cost and behaviour have never been observed.** The v2 branch
  at 1.38.0 gates J1 on a rubric whose calibration failed.
- **Voice runs are n=7, one draw each.** The compat draws show floors of 1, 5 and 4 out of 10 on one
  gate.
- **No v1 mirror floor rate exists at n≥10 on production's gate, 1.25.0.**
- **No production traffic, token, spend or cache-hit data** was readable. Production discards
  `usageMetadata` entirely (`git grep -n usage origin/main -- lib app` returns 0 hits), and `served_count`
  is never incremented.
- **Whether v1 makes the g4WH4 error at all has not been measured** (PROGRESS V:363). Every
  inversion observation is from v2.
- **The Rp 6,200 behind the code's "Rp 79 per attempt" has no recorded source.**
- **The v1 costs were measured on the branch's v1 path, not on a production deploy.**
- `scripts/calibrate-j1.mjs:43-46` says the judge "no longer receives required_points (J4 is
  removed)". That is **stale** on this branch: `judge.js:167` still passes them, and J4 is still in the
  prompt. The 1.35.0 rubric that removed J4 lives only on `feat/voice-v2-judge-rubric`.

## Verification done in this session

- Model ids, budgets, the daily ceiling and rate-limit buckets were read directly: `git show
  origin/main:lib/render/config.js`, `lib/ratelimit.js:50-59, 151-153`, `lib/render/index.js:346`.
- `lib/voice.js` was read in full (production refusal at lines 18-21).
- The absence of `tier` at pair and mirror call sites on main was confirmed with `git grep -n tier
  origin/main -- lib/pair lib/mirror lib/deliver app`.
- The v2 hard factGuard set (`v2.js:56-59`) and `checkBadgeInvention` reading only `semantic.facts`
  (`fact.js:398-412`) were read directly.
- The planted-sentence probes were **re-run locally** (no network):
  - **positive controls fire:** `fact.day_master`, `fact.badge_invented`,
    `fact.strength_contradiction`, `v2.d1_invented_term`;
  - **inversions and wrong-supplier plants pass clean:** `[v1|v2] p1 INVERTED ... ok=true []`,
    `p3 WRONG supplier ... ok=true []`;
  - the v2 pair badge false positive reproduces: `A's own badge cited on pair: ok=false
    ['hard:fact.badge_invented']`.
- The g4WH4 round-3 cost was recomputed from the stored `usageMetadata` ($0.1192, against $0.1193
  reported).
- The branch `feat/voice-v2-judge-rubric` and commit 38a7a2c exist (`git branch -a`, `git log --all`).
- `reports/` is gitignored (`.gitignore:44`), so this file is untracked as asked.
