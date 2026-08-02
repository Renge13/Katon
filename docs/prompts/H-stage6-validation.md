<!--
STATUS: HANDOVER — Claude Code build prompt. Created 2026-08-02 by Cowork.
This is PROMPT H — Stage 6, the post-validation gate. Run AFTER Prompt G. Its own session/PR.
Rule 17: NOTHING reaches a user without passing this gate. LLM output is guilty until validated.
This gate is LOAD-BEARING, not belt-and-braces: run 5 emitted the banned "bukan X melainkan Y"
construction TWICE despite an explicit prompt ban. The prompt cannot fix it; only this can.
-->

# Prompt H — Stage 6: the deterministic gate

## Read first, in order
1. `../../CLAUDE.md` — rules 17, 20, 21, 25.
2. `../engine/pipeline-spec.md` — §Stage 6. The check categories and failstates.
3. `../content/renderer-prompt-notes.md` — §STILL OPEN lists every defect the live runs exposed;
   each one becomes a mechanical check here.
4. `../content/provecell-01-*` — the test kit, fixture, and rubric.
5. `../PROGRESS.md` — "Renderer measurement note (2026-08-02)": the measurement harness below.

## The checks — every one deterministic, no LLM judges LLM

### 1. FACT GUARD (hard reject)
The text may not contradict the semantic JSON. Minimum: the strength verdict (JSON "Seimbang" +
text "lemah" = reject), the Day Master element, badge presence (a badge named in text must exist
in JSON — invention is the run-1 failure), palace attributions.
**The same-breath check (rule 21 + `glossary.kekuatan._note`, wired 2026-08-02):** if the rendered
text carries the verdict word (lemah/kuat/seimbang used AS the verdict), the block containing it
must also carry the substance of that verdict's `label_meaning` — the explanation lands in the same
block, never a bare label. `label` and `label_meaning` ship as separate JSON fields, so emitting
the verdict bare is mechanically possible and nothing upstream can prevent it. Hard reject.

### 2. COVERAGE, not structure (carried principle — validate coverage, NEVER structural conformance)
- Every `required_point` in the JSON is addressed somewhere in `blocks[]`. Order is the renderer's
  free choice; presence is not.
- No dropped `cost` strings: gift-without-cost is the ethics failure mode (rule 25's "no ranking"
  has teeth only if costs survive).
- Schema-order slot-filling detection: if block order exactly matches JSON input order AND
  importance ranks are non-monotonic in that order, flag for QA (the run-1 template failure).

### 3. FORBIDDEN CONTENT (hard reject)
Fatalism/prophecy phrasing (dated predictions, "akan" + fixed outcomes), medical/financial advice,
ranking gods or strength states as good/bad, self-harm-adjacent advice. Regex + keyword blocklist,
maintained as data (a JSON blocklist file), not inline code.

### 4. STYLE GUARD (regenerate with stricter directive; harder thresholds on OpenAI output)
- Em-dash and curly quotes: count must be ZERO in rendered text (rule 20).
- **`bukan ... tapi|melainkan ...`: the load-bearing regex.** Confirmed unfixable by prompt alone.
- Tension-collapse vocabulary: *menyatu, selaras, saling melengkapi, identitas utuh* (run-1 failure;
  keep as data, Reyner can extend the list).
- Banned slang (*ngerasa/bikin/kayak/capek*), chat particles (*tuh/lho/deh*), meta ("sebagai AI"),
  English leakage outside the sanctioned bracket terms, `secara ...` adverbials.
- "unsur" applied to an animal branch; a `label: null` fact rendered as though it were a badge.

### 5. STRUCTURE + LENGTH
Normalise first: collapse 3+ newlines to 2. Then reject: any lone `\n`, more than two paragraph
breaks in one block, token/section budget overruns.

## Failstates (exactly as specced)
Fail → regenerate ONCE with a stricter directive appended. Fail twice → serve the module-assembled
fallback (Prompt G task 4) + flag the chart for human QA. Never ship unvalidated prose. A 👎-flagged
cached reading keeps serving until reviewed UNLESS it failed a hard fact/safety check — those fall
back immediately.

## The measurement harness (the launch-gating number)
A script (CI-runnable) that renders the provecell fixture N times per chart through the live chain
and reports: Stage-6 pass rate per check per model, regeneration rate, fallback rate. This is the
number that decides launch readiness — it does not exist yet anywhere.
Per the ledger note: when first run, include a `gemini-2.5-flash-lite` arm as a RIDER in the same
batch and emit anonymised A/B pairs for Reyner to blind-judge. Do not make the rider its own project.

## Tests
Adversarial fixtures: hand-construct texts that violate each check (one per check) and assert
rejection; assert a known-good run-3-style text passes. The blocklists and vocab lists are data
files with their own tiny schema test so a malformed edit fails CI, not production.

## Constraints
- No engine files, no payment surface. Separate PR from G.
- Blocklist/vocab additions after this ships are CONTENT changes: data-file edits, Reyner-approvable,
  no code deploy.
- Contradiction found → STOP and report. Docs win over this prompt; CLAUDE.md wins over docs.
