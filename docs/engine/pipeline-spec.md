# Katon — Reading Pipeline Spec (deterministic engine + LLM renderer)

The rule that governs everything: the engine decides ALL facts, hierarchy, and structure. The LLM
chooses ONLY words. If the LLM is ever in a position to decide something true, the design is wrong.

---

## THE MIRROR SPACE (why pre-warming is feasible)

The naive permutation is ~144,000 (10 DM × 3 strength × 5 dominant × 6 missing × 10 seat × 16 branch
combos). You do NOT author that. You author ~78 independent BLOCK-VARIANTS:

  Inti Diri (per DM): 10 · Strength meaning (DM×strength): 30 · Dominant element: 5 ·
  Missing element: 6 · Favorable element (per DM): 10 · Seat/Ten God: 10 · Branch relation: 5 ·
  Hour locked/unlocked: 2  =  ~78 modules.

The engine picks which ~7-8 modules a chart needs and in what order (hierarchy). Assembly is
deterministic. QA is 78 items once, not 144k. This is the finite, controllable free-mirror set.

---

## PIPELINE (7 stages)

```
[1 Birth data] -> [2 Math engine] -> [3 Hierarchy + semantic JSON] -> [4 Cache check]
   -> (hit) served, done
   -> (miss) [5 Render: LLM] -> [6 Post-validation] -> [7 Store + serve]  ->  feedback loop
```

### Stage 1 — Input
Birth date (required) + hour (optional) + relationship-type (compat only) + 2nd birth data (compat).
FAILSTATES:
- Invalid/impossible date -> reject at input, never reaches engine.
- 節氣 (solar-term) boundary date, or 子 (23:00-01:00) hour -> engine flag `boundary_risk=true`;
  these are the known LLM/calc danger zones. Do not fail; compute deterministically (sxtwl handles
  it) and log the flag so QA can spot-check these charts.
- Hour unknown -> set `hour_known=false`; engine omits Hour pillar cleanly, reading states it once.

### Stage 2 — Math engine (deterministic, no AI, this is the moat)
Produces the full chart: 4 pillars, stems, branches, hidden stems, element counts, strength verdict,
Ten Gods, seat, roots, branch relations, favorable element. Validated against Joey Yap.
FAILSTATES:
- Engine exception (bad lib call, unexpected input) -> HARD FAIL, show graceful error, DO NOT fall
  through to LLM. A reading without verified math must never be generated. This is the one place a
  failure must stop the pipeline entirely.
- Strength-calc edge (the Joey-Yap discrepancy): until reconciled, engine emits `strength_confidence`.
  Low-confidence strength -> flag for QA, still render (with careful copy), never silently ship a
  contested master-verdict.

### Stage 3 — Hierarchy scoring + semantic JSON (deterministic)
Engine scores each finding: extremity + convergence + actionability + tension -> importance 0-100.
Sorts them. Emits OPINIONATED JSON (the LLM's only input), e.g.:
```json
{ "core":{"element":"Air","capacity":"Seimbang","stability":"Tinggi"},
  "lead_findings":[ {"id":"wealth_x2","importance":92,"gift":"...","cost":"..."}, ... ],
  "villain":"...", "favorable":["Logam","Air"], "hour_known":true,
  "safety_flags":["no_fatalism"], "self_misread":"tampak cuek padahal menyerap" }
```
CRITICAL: the gift/cost/villain strings in the JSON are ENGINE-GENERATED (from the ~78 authored
modules), NOT written by the LLM. The LLM renders prose FROM these; it never authors the JSON.
This is the line that keeps facts deterministic. If the LLM writes the JSON, determinism is lost.
FAILSTATES:
- All findings low-importance (a genuinely unremarkable chart) -> engine emits `quiet_chart=true`;
  render instruction becomes "say less, do not manufacture drama." Prevents Barnum filler.

### Stage 4 — Cache check
Key = hash(engine_version + semantic_JSON). Same JSON -> same key -> same stored reading.
Note the key is on the JSON, not raw birthdate: two different birthdays with identical semantic
profiles share a reading (good — more cache hits, still accurate). Bump engine_version -> full
cache invalidation on next access (controlled re-warm).
- HIT -> serve stored reading. Zero LLM call, zero cost, deterministic. Done.
- MISS -> proceed to render.

### Stage 5 — Render (the LLM; swappable)
System prompt = master prompt (voice + rules). User message = semantic JSON. Config: temperature
0.0-0.2, max_output_tokens capped (punchy), stop on structure violation.
Provider abstraction (see FALLBACK section) — primary Gemini, secondary GPT.
FAILSTATES:
- Timeout / 5xx / rate-limit -> retry once, then FAIL OVER to secondary provider (below).
- Both providers down -> serve MODULE-ASSEMBLED fallback (the ~78 blocks concatenated by hierarchy).
  Less cohesive, but always available, always accurate, zero dependency. The product never hard-fails
  on the free mirror. This is why the module set is built even if whole-render is primary.
- Response empty/garbled -> treat as failure, same fallover chain.

### Stage 6 — Post-validation (deterministic gate BEFORE the user sees it)
Programmatic checks on the rendered text. If any fail -> regenerate once (or fail over / fall back):
- FACT GUARD: does the text contradict the JSON? (e.g. JSON says "Seimbang", text says "lemah")
  Simple keyword/negation check against the known verdict. Hard reject on contradiction.
- FORBIDDEN CONTENT: fatalism/prophecy phrasing, medical/financial claims, ranking gods good/bad,
  any self-harm-adjacent advice. Regex + keyword blocklist. Hard reject.
- STYLE GUARD (esp. for GPT fallback): em-dash count, "bukan X tapi/melainkan Y" hedge-pattern
  count, banned slang, "sebagai AI"/meta phrases, English leakage. Over threshold -> regenerate
  with a stricter directive, or fall back to module assembly.
- LENGTH: within token/section budget.
FAILSTATES:
- Fails validation twice -> serve module-assembled fallback, flag chart for human QA. Never ship
  unvalidated LLM prose to a user.

### Stage 7 — Store + serve + feedback
Store rendered+validated reading against cache key with status `unreviewed`. Serve to user.
Attach 👍/👎. 
- 👎 -> mark cached reading `flagged`, queue for human review; on review either edit-and-refreeze
  or regenerate. A flagged reading keeps serving until fixed (don't leave a hole) unless it failed
  a hard fact/safety check, in which case fall back to module assembly immediately.
- Feedback accumulates into your QA dataset -> the "improve forever, regenerate against quality
  labels when a better model ships" advantage.

---

## PROVIDER FALLBACK (Gemini primary, GPT secondary) — your found failstate

Abstract the renderer behind one interface: `render(system_prompt, json, config) -> text`.
Two adapters: GeminiAdapter (primary), OpenAIAdapter (secondary). Health/again-chain:
```
try Gemini (temp 0.2, retry 1)
  -> fail/timeout/ratelimit -> try GPT (temp 0.2, retry 1, + STRICTER style directive)
     -> fail -> module-assembled fallback (no LLM)
```
KEY POINT you raised: GPT writes more "AI-ish" (em-dashes, bukan-X-tapi-Y, over-polished). So the
OpenAIAdapter injects an ADDITIONAL style-constraint block on top of the master prompt:
  - "Hard ban the em-dash (—). Use period or comma."
  - "Ban the 'bukan X, tapi/melainkan Y' construction entirely. State X. New sentence for the cost."
  - "No meta ('sebagai AI'), no English, no rhetorical questions."
And Stage-6 STYLE GUARD runs HARDER on GPT output (lower thresholds) before it's allowed through.
Net: GPT is a safe understudy because the same post-validation gate catches its known tells; it just
needs a tighter leash at render and a stricter gate at validation. Because output is CACHED, a GPT
render that passes is frozen and served identically thereafter — the provider difference disappears
after first generation. Two users never get "one Gemini one GPT" for the same chart.

CAVEAT: Gemini and GPT will word the SAME json differently. That's fine for DIFFERENT charts. For
the SAME chart it never happens (cache). But if you ever bump engine_version and re-warm, a chart
previously rendered by Gemini might re-render by GPT. Acceptable — it re-freezes. Just don't
hot-swap providers mid-serve on an already-cached chart.

---

## PAYLOAD STRUCTURE (enables prompt caching + multilingual + clean rendering)

Two different caches, do not confuse them:
- RESULT CACHE (ours, Supabase): stores the finished reading keyed on chart hash. Hit = no API call
  at all, zero cost. This is Stage 4. It does the heavy lifting.
- PROMPT CACHE (provider-side, Google/Anthropic): discounts the repeated INPUT prefix (~90% off) on
  calls we DO make. Only helps on result-cache misses (new charts).

To get the provider prompt-cache discount, structure every API call front-to-back:
- FRONT (identical every call, cacheable): the master prompt — voice, rules, Ten Gods guide,
  guardrails, reframing dictionary. Never interleave chart data into it, or the cacheable prefix breaks.
- BACK (varies every call, small): the chart's semantic JSON as the user message.

Do NOT over-optimize this: at Flash-Lite rates the whole bill is lunch money and the result cache
already removes most calls. Structure it right once (free to do), then stop thinking about API cost.
Choose the fallback provider on prose quality + how well it survives Stage-6 validation, NOT on
fractions of a cent.

## RESPONSE FORMAT: Structured Output (JSON mode) + language variable

The LLM returns prose INSIDE a fixed JSON shape, not as free text:
```json
{ "inti_diri":"...", "kekuatan":"...", "dominant_missing":"...", "favorable":"...",
  "seat":"...", "branch":"...", "hour":"..." }
```
Two payoffs:
1. The block renderer slots named fields straight into the UI — no prose-parsing, no guessing where
   one block ends. Keys map 1:1 to FactBlocks.
2. MULTILINGUAL is one variable: pass `target_language:"id"` (later "en","vi","zh"). Keys stay
   identical; only values translate. UI never breaks, block system never changes. Build this in NOW
   even though launch is Indonesian-only — retrofitting later is painful, adding the field now is free.
Stage-6 validation runs per-field against the JSON facts.

## MODEL-PER-TIER BINDING

Bind model choice to product tier (not a global default):
- FREE MIRROR: workhorse/fast model. It's a straightforward JSON-to-prose job; cheap model is fine.
- PAID COMPATIBILITY / 3-way: flagship/premium model. Connecting contradictory chart elements without
  repetition needs the deeper reasoning, and the cost is invisible against an 80-99k sale.
Same renderer interface; the adapter picks the model by tier. Provider-fallback chain applies within
each tier.

DISCIPLINE PHRASE (the one-sentence test for any design decision):
"The LLM is a creative translation + copywriting layer, never a calculator." If a step has the LLM
deciding anything factual, it violates this and is wrong. Do NOT chase 'elite astrologer prose' — the
moat is accurate facts + clean hierarchy + coherence, rendered in plain Indonesian. A cheap model over
correct well-ordered facts beats a flagship over the same facts. Prose quality is not the moat.

## 3-WAY / HOUSEHOLD COMPOSITION (falls out of pairwise, + one new layer)

A 3-person reading (e.g. two parents + child) is NOT a new reading type. Three people A,B,C = three
pairwise compatibility blocks (A×B, A×C, B×C) — each already computed, rendered, and cached by the
compatibility pipeline. Composition was free the moment pairwise was a module not a monolith. Cache
compounds: if A×B was bought earlier, the household reading only generates the two new pairs.

BUT three pair-readings stapled together is an audit, not a reading (same error as two-solo-triggers).
The household reading needs ONE new deterministic SYNTHESIS layer that reads the three pairs against
each other to surface triangle-level facts no single pair contains:
- BRIDGE / OUTLIER: if A×B and A×C are warm but B×C is friction, A is the bridge; B and C connect only
  through A ("everything goes through mom").
- ENERGY POOLING/DRAIN: if two both give to the third, the third is over-resourced and both givers
  deplete.
- COALITION: two same-element people align; the odd element feels outnumbered.
This synthesis is comparison logic on outputs you already have (small), hierarchy-scored like any
finding, cached on the triple key.

ETHICS GATE IS HEAVIER HERE. "Your child is the outsider" / "you and your mother are aligned against
your father" are far heavier than two-person compatibility, narrated to someone living inside the
family. Reframe discipline (map not verdict, friction not fault) must be STRONGER, not weaker. The
3-way's real risk is content-ethics, not technical.

---

## THE THREE NON-NEGOTIABLES (restated as gates, not hopes)
1. Engine owns facts + hierarchy + the JSON's gift/cost strings. LLM renders prose only.
2. Cache (keyed on semantic JSON + engine version) makes readings deterministic-after-first.
   Must exist before launch.
3. Nothing reaches a user without passing Stage-6 post-validation. LLM output is guilty until
   validated. Module-assembly is the always-available floor beneath both providers.

## LAUNCH PLAN (build order)
1. Reconcile strength calc (the Joey-Yap discrepancy) — the one accuracy risk that flips verdicts.
2. Author + QA the ~78 mirror modules (also serve as the no-LLM fallback floor). Finite, done once.
3. Build Stage 3 (hierarchy + JSON) and Stage 6 (post-validation) — these are the real engineering.
4. Wire GeminiAdapter + cache + feedback. Add OpenAIAdapter behind the same interface.
5. Pre-warm + hand-QA the common charts (whole-render, frozen). Ship free mirror ungated.
6. Compatibility tier: same pipeline, generate-and-cache live (higher tolerance, lower volume).
   Single paywall here (80-99k). Mirror stays free.
7. (Later) 3-way/household: reuse cached pairs + build the triangle-synthesis layer + heavier ethics
   gate. Highest-LTV tier; do it right, not stapled.

## BUILD-IN-NOW vs DEFER (so nothing needs a rewrite later)
BUILD IN NOW even though launch is minimal:
- Structured-output JSON response + `target_language` field (multilingual retrofit is painful).
- Payload front/back ordering (prompt-cache discount, free to do right the first time).
- Renderer provider-abstraction interface (Gemini + OpenAI adapters behind one call).
- Result cache keyed on semantic-JSON + engine_version.
DEFER safely (additive, no rewrite):
- OpenAI fallback adapter (interface exists; add the adapter when needed).
- 3-way synthesis layer. Premium model per tier. Annual/luck-pillar renewable tier.
