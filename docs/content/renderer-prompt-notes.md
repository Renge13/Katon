<!--
STATUS: v3 — 2026-07-30. This file is now DOCUMENTATION ONLY.
THE PROMPT ITSELF LIVES IN: KATON-renderer-prompt.txt  <- single source of truth, paste that
This file records what the prompt does, what changed, and why. Do not duplicate prompt text here;
two copies will drift.
-->

# Katon — Renderer Prompt (documentation)

**The prompt is `KATON-renderer-prompt.txt`.** Paste that into System Instructions. This file explains
it. Tested live against Gemini Flash on 2026-07-30 across three runs; every rule below exists because
a run failed without it.

---

## WHAT THE PROMPT ENFORCES

| Section | Purpose | Added because |
|---|---|---|
| Role + "engine decides, you choose words" | Determinism boundary | Post-pivot architecture |
| **THE MOVE** — provenance → name → cash-out | The dopamine loop | Reyner's reading-flow spec, 07-30 |
| **VARY THE MOVE** + braided convergence | Stops it reading as a template | Run 3 braid landed; make it a requirement |
| **NAMING BADGES** — Indonesian + English bracket | Legitimacy without comprehension tax | Reyner, 07-30 |
| **THE PALACES** — Pilar Akar/Kerja/Diri/Arah, Fondasi Pasangan | Kills 14-word clauses | Run 3: *"Rumah tempat hubungan paling dekatmu dibaca…"* |
| **MAKE MEANING FELT, NOT DEFINED** | Abstraction is the failure mode | Run 3: two "hard to understand" notes |
| **PROVENANCE IS NOT ARITHMETIC** | Legitimacy vs seam | Reyner's step 1 nearly collides with golden rule 1 |
| **DO NOT WRITE A LIST** | Hierarchy over inventory | Cold-read failure: "a tour of the chart's anatomy" |
| **HOLD THE TENSION** | Preserve unresolved pulls | Run 1: turned a tension into a compliment |
| **NEVER AUTHOR A FACT** | Stop invention | Run 1: invented all of `inti_diri`; narrowed "orang" → "pasangan" |
| Golden rules 1–7 | Carried from v1 | Still correct |
| Voice + hard bans | One composed voice | See below |
| Output contract — ordered `blocks[]` | Arrangement must be a choice | Run 1: fixed keys became a template and beat the instruction |

---

## THE THREE RUNS — what each proved

**Run 1** (fixed-key schema, thin JSON). Hard-gate FAIL. Turned the steward/self-reliant *tension*
into "menyatu secara selaras… membentuk identitas utuh" — neutering the one fact Reyner personally
confirms he lives. Invented `inti_diri` wholesale because a `required_point` had no backing fact.
Walked the schema order, ignoring `importance` 94 vs 82. **Diagnosis: the output contract was a
template, and the contract beat the instruction.**

**Run 2** (blocks array, tension rule, day-master fact). All four fixes held — but it became
**transcription**, concatenating the input `gift`/`cost` strings verbatim. **Diagnosis: over-constrained.
The renderer can only be as good as its input, and the input was conclusions with no causes.**

**Run 3** (four-field facts: provenance / label / label_meaning / gift / cost / palace). Braided the
void + Peach Blossom + Nobleman stack into one block and **converged them into a shared consequence** —
the move Reyner flagged as the thing that rescues an obscure fact. Reyner: *"overall I'm satisfied."*
Remaining defects → the naming, palace, felt-meaning and penutup rules now in the prompt.

**The load-bearing lesson: guardrails were never the bottleneck. Poor JSON was.** Raw Gemini with no
system prompt beat run 2 because it improvised the mechanism layer from its own knowledge. The
glossary (`KATON-glossary-naming.md`) is that layer, made deterministic.

---

## VOICE — corrected 2026-07-30

**Plain, precise, everyday Indonesian. Composed and direct. One voice everywhere, including chrome.**

An earlier draft of this file specified a casual "old friend" register with *ngerasa/bikin/kayak*.
**That was wrong**, sourced from a stale memory note rather than the docs.
`KATON-coldread-analysis.md` §"THE VOICE DECISION" explicitly killed it:

> *"drop the casual old-friend register entirely… one voice across the whole product… that reaction
> was caused BY the casual front door."*

The ultra-casual front door was producing "is this serious?" doubt before the user saw any value. The
cold-read is the later decision and it wins. **There is no reading-casual / chrome-baku split.**

Reyner, 07-30: *"Gemini default is perfect, just needs guardrails."* Hence the prompt constrains
rather than decorates — keyboard characters only, no slang, no chat particles, no bureaucratic-baku,
no `secara ...` adverbials, no essay connectives.

---

## STILL OPEN

- **`actionable` field**: only non-element actionables ship in the free mirror. Element-based advice
  ("cari orang ber-Kayu") inverts on the strength verdict and belongs in the compatibility reading —
  by nature, not by convenience. See KATON-paid-product-map.md.
- **Stage 6** must mechanically catch what the runs exposed:
  - tension-collapse vocabulary (*menyatu / selaras / saling melengkapi / identitas utuh*)
  - invented specificity, dropped `cost` strings, schema-order slot-filling
  - **`bukan ... melainkan ...` / `bukan ... tapi ...` — CONFIRMED UNFIXABLE BY PROMPT ALONE.**
    Run 5 emitted it **twice** despite an explicit ban, including in the penutup. The prompt now
    carries rewrite examples, but expect a residual leak rate. This is the single strongest evidence
    that Stage 6 is load-bearing rather than belt-and-braces: a regex catch plus one regeneration
    is the only reliable fix.
  - single `\n` (only `\n\n` is valid), and more than two paragraph breaks in one block
  - a `label: null` fact rendered as though it were a badge
  - "unsur" applied to an animal branch
- The prompt has only been run against Gemini Flash. **The OpenAI adapter needs its own stricter
  style block** per KATON-pipeline-spec.md.

- **UI CONTRACT — paragraph breaks. Not yet implemented; nothing consumes renderer output today.**
  `text` may contain `\n\n` as a paragraph separator. In AI Studio you see the raw JSON escape, which
  is expected. In the app it will NOT appear as literal characters — but if `text` is rendered
  directly into a single element, HTML collapses the whitespace and the paragraph break is **silently
  lost**, turning a braided block into one run-on wall. The block still reads, so this fails quietly
  rather than visibly, which is worse.

  Required when Stage 5 is wired:
  ```
  text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean)  ->  render each as its own <p>
  ```
  Stage 6 normalises first: collapse 3+ newlines to 2, reject a lone `\n`, reject more than two
  breaks in one block. Do not use `white-space: pre-wrap` as the fix — it would also preserve
  stray single newlines the validator is meant to reject.
