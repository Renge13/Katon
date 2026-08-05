<!--
STATUS: LIVE — session-resume file. READ THIS FIRST in any new session.
UPDATED: 2026-07-14 — MAJOR PIVOT. Hand-authored content -> deterministic engine + LLM renderer.
UPDATED: 2026-07-29 — ENGINE FOUNDATION. Phase 1 built & validated. resolveState found not to be a
         strength model. Joey's element bars found to BE a strength distribution.
UPDATED: 2026-07-30 — CALCULATOR CLOSED + STRATEGY RESET. sxtwl retired in favour of tyme4ts
         (measured equivalent). Time convention empirically pinned against Joey. Launch strategy
         changed to CARD-FIRST; strength engine / 78 modules / paid compat all PARKED. New revenue
         model: free mirror + optional paid hi-res card & PDF (no gate). See SUPERSEDED at bottom.
UPDATED: 2026-08-01 — Badge anchors verified 60/60 against Joey with full table-row coverage. 華蓋
         descoped. Stale mirror `D:\Work\Katon assets\Katon md` neutralised, its two unique files
         rescued into the repo. `docs/COWORK-BRIEF.md` added as the Cowork session entry point.
UPDATED: 2026-08-04 — MODEL QUESTION CLOSED (12-4, 3.1-flash-lite stays primary, riders dropped).
         Stage 3 pre-verbalises the relation span (`positions_id`); it WORKED. Four gate checks added
         from Reyner's blind-judging notes; the pairs file was POST-gate, so two were live escapes.
         Two defects found and deliberately NOT fixed: `relation_positions` is a gate false positive
         (8/8 measured) and a third Stage 3 collapse gap hits charts 9 and 12.
UPDATED: 2026-08-03 — XENDIT SITE COMPLIANCE. Site footer + /harga /tentang /privasi /syarat
         /pengembalian shipped (Prompt I). Serves TODO #8. Two pre-existing defects found and NOT
         fixed here: the paywall shows a retired Rp 49.000, and the funnel carries 9 banned
         ellipsis characters.
PURPOSE: single source of "what's decided / what's next". The SUPERSEDED section wins any conflict.
-->

# Katon — PROGRESS Ledger

> **New session?** Claude Code starts at `NEXT.md`. Cowork starts at `COWORK-BRIEF.md`.
> Both after `../CLAUDE.md`. Brief yourself from the repo, never from memory or a summary.
> **`D:\Work\Katon assets\Katon md` is a STALE MIRROR — do not read it.** It still carries the
> rejected Aspek names (Setara, Karya, Pijar, Peluang) and a PROGRESS.md with no decisions in it.

## THE PIVOT IN ONE PARAGRAPH
Hand-authoring reading cells produced flat, hedged prose that failed a cold-read walkthrough. We
reversed "no runtime AI" for the RENDERING layer only. The deterministic engine owns ALL facts,
hierarchy and structure and emits opinionated semantic JSON; an LLM renders that JSON into plain
Indonesian; every output passes a deterministic post-validation gate; every reading is result-cached
so it is deterministic-after-first-generation. The engine is the moat. The LLM is "a creative
translation + copywriting layer, never a calculator."

## THE STRATEGY RESET IN ONE PARAGRAPH (2026-07-30, revised same day)
We were building depth before distribution. The archetype — the shareable face, the whole viral
surface — comes from the DAY PILLAR, which is pure 60-day arithmetic with **zero ephemeris and zero
solar-term dependency**. It cannot be wrong and never needed the engine work. The known failure (per
research/coldread-analysis.md, first line: *"The copy is not the problem. Coherence is."*) was never
accuracy — nobody has ever complained the math was wrong.

**REVISION, same session.** The mid-session call to park the strength engine and cut compat from v1
is **REVERSED**. Reyner: compat is the v1 money engine, no compromise. And the stronger reason:
**the strength engine is not the compatibility tax — it gates almost the entire paid catalogue**
(compat, annual reading, luck-pillar map, career depth). Four revenue lines behind one ~2-week build.

The sequencing constraint still holds and is not either/or: **you cannot sell compat to nobody.** It
needs a second birthdate, so the free mirror must ship and acquire first. Therefore: build the engine
**in parallel** with mirror content authoring. Mirror in ~4–5 weeks, compat shortly after.

---

## DETAIL FILES — paths are relative to docs/
### Claude Code handover prompts, in run order
- `prompts/A-calculator-swap.md` ....... DONE. tyme4ts swap + time-convention lock.
- `prompts/A2-followups.md` ............ DONE. boundary split, season gate (option B).
- `prompts/B-regression-lock.md` ....... DONE. CI solar-term oracle, three sources.
- `prompts/C-strength-engine.md` ....... the base spec. NOTE: its 子 hidden-stem row and its
                                         Oracle-2 metric were both wrong; C4/C5 supersede them.
- `prompts/C2-rulings.md` .............. metric fix, pair-distribution, 旺相休囚死 vs 十二長生.
- `prompts/C3-ruling-B.md` ............. get the full ten bars; Earth deferred.
- `prompts/C4-data-and-two-corrections.md` . the 子 fix + ruling A refuted.
- `prompts/C5-earth-adopted-transform-next.md` . 土旺於四季 adopted; the 16% inversion finding.
- `prompts/C6-sqrt-adopted-oracle4.md` . sqrt adopted; Oracle 4. Its step 2 is STRUCK.
- `prompts/D1-engine-additions.md` ..... DONE. 刑, 胎元, gender field.
- `prompts/D1b-remove-life-palace.md` .. DONE. 命宮 removed; its convention is unresolved at n=5.
- `prompts/D2-stage3.md` .............. DONE 2026-08-02, all three phases. Stage 3 hierarchy scoring +
                                         semantic JSON. Its end-to-end AI Studio gate is NOT run.
- `prompts/D2a-stage3-anchors.md` ..... DONE. Its §1 tables are locked in `tests/badge-anchors.spec.mjs`;
                                         its §4 target-file correction is applied. Two of its own claims
                                         were wrong — see errors 13 and 14 in `COWORK-BRIEF.md`.

### Engine
- `engine/joey-bars-13.json` ........... GROUND TRUTH. 13 charts x 10 bars, presence + element totals.
                                         Collected from Joey's plotter directly. The fixture imports it.
- `engine/joey-implied-strength.json` .. ORACLE 4 data. supportShare derived from Joey own element totals.
- `engine/joey-profile-mapping.md` ..... profile name -> Ten God, from Joey's printed legend. Do not re-derive.
- `engine/calculator-decision.md` ...... calculator + time convention. CLOSED.
- `engine/engine-session-state.md` ..... method spec. NOTE: strength engine is DONE (Oracle 4 r=0.929).
- `engine/bazi-blueprint.md` ........... feature map, pull-power, coherence rules CR-1..6.
- `engine/pipeline-spec.md` ............ the 7-stage build spec. CURRENT.

### Content
- `content/renderer-prompt.txt` ........ THE Stage-5 system prompt. Single source of truth. Paste this.
- `content/renderer-prompt-notes.md` ... what the live runs proved and why each rule exists. Run-by-run rationale.
- `content/glossary-naming.md` ......... LOCKED naming. Read before authoring any content.
- `content/glossary.json` .............. the engine content table. COMPLETE, 49 entries, Reyner-reviewed.
- `content/glossary-REVIEW.md` ......... human-readable review sheet. Regenerated from the JSON, not edited by hand.
- `content/sharecard-spec.md` .......... CURRENT card information architecture. Two cards: free shareable + paid artifact.
                                         Supersedes bazi-card-skill-v4.md's information architecture.
- `content/provecell-01-USER.json` ..... the hand-authored TARGET shape for fixture chart 1. Corrected
                                         2026-08-02: `lean`/`provisional` deleted, two 七殺 attributions
                                         fixed to 正官.
- `content/provecell-01-ENGINE.json` ... GENERATED by Stage 3 for the same chart. Diff against the USER
                                         file. Regenerate: `node scripts/emit-semantic.mjs 1989-09-13 09:00 --write`.
- `content/provecell-01-*` (others) .... renderer test kit + fixture + rubric.
- `content/bazi-card-skill-v4.md` ...... LEGACY visual system. Its info architecture is superseded by sharecard-spec.md.
- `content/_STATIC-STRINGS.md` ......... system copy. Needs a one-voice + keyboard-chars audit.

### Product
- `product/compatibility-reading-spec.md` . the 合婚 workflow + ethical spine. RESCUED 08-01 from the
                                         stale mirror; NOT reconciled against the Aspek/Bintang naming
                                         lock. Read as proposal, not decision.
- `product/paid-product-map.md` ........ the full paid surface, ranked. Annual reading and parent->child
                                         are the two products not previously counted.
- `product/launch-decisions.md` ........ pricing, the 19k upsell, imajidiri teardown, abuse math.
                                         Its build order was REVERSED; see STRATEGY RESET above.
- `product/compatibility-reading-spec.md` . the 合婚 spec. Next after the engine.
- `product/PRELAUNCH-security-checklist.md` . run before taking real money.

### Research and archive
- `research/coldread-analysis.md` ...... why the old drafts failed. Still the QA rubric.
- `research/mechanism-inventory.md` .... which facts are real personalization axes.
- `research/` others ................... mixed currency. Mine for insight, never treat as spec.
- `archive/` ........................... DEAD. Never build from these.
- `DOC-STANDARD.md` .................... one file per topic, no addendums. Follow it.

---

## CALCULATOR — CLOSED (2026-07-30)
- **`tyme4ts` is the calculator.** MIT, zero deps, pure TS, 1.1 MB, 0.72 ms/chart, active. It is the
  same 寿星天文历 engine as sxtwl. **sxtwl is retired as a runtime dep** — no npm package, no JS/WASM
  path, and none needed. Demoted to CI-only oracle.
- Measured over all 1,212 節 boundaries 1930–2030: sxtwl vs tyme4ts max |Δ| 24.5 s; ShouXing lineage
  vs astronomy-engine (independent ephemeris) median 9 s / max 52 s. **DAY-level disagreements: 0.**
  Ephemeris risk ≈ 1 in 90,000 and is flaggable.
- **`LunarSect2EightCharProvider` (流派2 / 晚子時) is the locked convention.** Required for fixture
  parity — the default provider rolls the day at 23:00 and fails chart 7. With it: **12/12**.
- **Time convention: naive local wall-clock. No timezone conversion. No True Solar Time.**
  Empirically confirmed: Joey's plotter (bazi.joeyyap.com/plot) has **no city and no timezone field**,
  so it applies neither. Discriminator run 07-30 — 04 Feb 1989 04:00 returned **戊辰 乙丑 乙未 戊寅**,
  an exact match to the naive prediction (tz-aware would have given 己巳 丙寅). Historical tz offsets
  (Jakarta +07:30 pre-1964, Singapore/KL +07:30 pre-1982, Shanghai summer DST 1986–91) are therefore
  **moot**. Persist an unused `tz` field so the convention stays cheap to revisit.
- **DELETE `lib/bazi/calculator.js`.** Do not port it, do not keep it as a cross-check.
  Keep `tenGods.js` and `mainProfile.js` — deliberate Katon logic.
- **Trap for whoever does the swap:** tyme4ts's `getJulianDay().getDay()` is **UTC+8-based**, not
  UT-based. Naive JD arithmetic introduces an 8-hour error that flips month branches. Assert against
  立春 1989 = 1989-02-04 04:27 (+08) and 白露 1989 = 1989-09-07 23:53 (+08).

## VALIDATION FIXTURE — 13 CHARTS
Rows 1–12 in engine/engine-session-state.md. Added 07-30 from Joey PDF:
```
13  1989-02-04 04:00 | 乙 | 丑 | 比肩 | Managers | Friend80/Phil80/Dir78/Pio72
```
Boundary chart. **All 13 charts now carry Joey's full ten bars** in `engine/joey-bars-13.json`, and the
fixture imports that file rather than re-typing numbers. Pillars agree with Joey's own printed pillars
13/13. For Track A see MEASUREMENTS above and CLAUDE.md rule 8 — the principle is locked, the number is not.

---

## PRODUCT / FUNNEL — DECIDED
- **FREE = the full mirror, ungated.** Acquisition + willingness-to-pay engine, NOT a revenue line.
- **NEW (07-30): optional paid hi-res card + packaged PDF report, ~19k.** Offered AFTER the free
  reading has landed and the sharecard is in hand. **It is an upsell, never a gate.** Refusal costs
  nothing — they still share. Take rate is the pricing evidence we currently lack. Rationale and the
  rejected alternatives are in product/launch-decisions.md.
- **The 19k mirror GATE is rejected** — and note the earlier stated reason ("to recover lunch-money
  API cost") was void: total cost to cache the *entire* mirror space forever is ~$115. The real
  reason is that a gate at the top of the funnel asks for money before any investment exists.
- ONE later paywall at COMPATIBILITY, after the 2nd person is entered and the pairing tease is seen.
  **Price is an OPEN QUESTION — 80–99k has no market evidence behind it. Test 25–45k.** (imajidiri
  charges 15k for a comparable-feeling self artifact.)
- Reading structure: person-centric, core-outward. Gift before cost. One committed image, no hedging.
- **VOICE (corrected 07-30):** plain, precise, everyday Indonesian. Composed and direct. Accessible
  words, short sentences, no verbosity. Warmth through precision, never friendliness. Reads as *kamu*.
  **One voice everywhere, including chrome.** No prose slang (ngerasa/bikin/kayak/capek), no chat
  particles (tuh/lho/deh), and not bureaucratic-baku either. Keyboard characters only — no em-dash,
  no curly quotes. Yin/Yang never surfaced as bare words.
  **The casual "old friend" register is DEAD** — killed explicitly by research/coldread-analysis.md §"THE
  VOICE DECISION": *"drop the casual old-friend register entirely… that reaction was caused BY the
  casual front door."* The ultra-casual front door was creating doubt about legitimacy before the user
  saw any value. Any note claiming the two registers coexist is wrong; the cold-read is the later
  decision and it wins.
- Ten Gods: classical concepts in plain Indonesian. **Never** Joey's trademarked profile names
  (Director/Diplomat/Warrior are his IP). Locked display names in engine/engine-session-state.md.
- **Loading state says "Menghitung bagan kelahiranmu" — never "dianalisis sama AI."** Advertising the
  AI invites the suspicion that it merely rephrased the user's own input.
- **Capture email AFTER the free mirror, optional, framed as "save your reading."** Currently we
  capture nothing — no retention asset, no way to announce compat. Keeps the no-account principle.

## ARCHITECTURE — DECIDED
- Engine (validated vs Joey): 4 pillars, elements, strength, Ten Gods, seat, roots, branch relations,
  favorable element. Central, the moat.
- Stage 3: engine also computes HIERARCHY (extremity + convergence + actionability + tension →
  importance) and emits opinionated JSON. Gift/cost/villain strings come from engine-owned MODULES,
  never the LLM.
- Result cache (Supabase, key = `hash(semantic_JSON + engine_version)`): hit = no API call.
- Renderer behind a provider abstraction. Gemini primary; OpenAI secondary (needs stricter style
  directives — ban em-dash, ban "bukan X tapi Y").
- Post-validation gate (Stage 6): fact-guard, forbidden-content, style-guard, length. Fails twice →
  module-assembled fallback + QA flag. **LLM output is guilty until validated.**
- Structured-output JSON + `target_language` field: build in NOW.
- **Rate-limit per IP/session; no bulk endpoint; no enumerable reading URLs.** The real abuse risk is
  content harvesting to clone the module library — not API cost.

---

## MEASUREMENTS — dated observations, not locked constants
Update these when they move. A DROP is a regression to investigate. A RISE after an input correction
is expected. Never copy these numbers into CLAUDE.md as locked values.

| Metric | Value | As of | Note |
|---|---|---|---|
| Pillars vs fixture | 13/13 | 08-01 | |
| **Pillars vs Joey's own printed pillars** | **13/13** | 08-01 | first full cross-check; came free with the ten-bar collection |
| Ten Gods | 13/13 | 08-01 | |
| Track A profile | **8/13** | 08-01 | was 7/13; rose when the 子 hidden stem was corrected. Track A itself untouched. |
| Oracle 1 strength verdicts sane | 13/13 | 08-01 | |
| Oracle 2 Ten God top-3 set match | 2/13 | 07-31 | hard threshold on a noisy tail; see Spearman below before concluding anything |
| Oracle 2 mean Spearman | 0.783 | 08-01 | full ten bars |
| Oracle 2 pair concordance | 82.2% | 08-01 | |
| **Oracle 3 element rank exact** | **4/13** | 08-01 | **PRIMARY GATE**; 3/13 before sqrt |
| **Oracle 3 top-1 element** | **9/13** | 08-01 | was 6/13 before sqrt |
| **Oracle 3 mean Spearman** | **0.874** | 08-01 | 0.682 -> 0.782 (土旺於四季) -> 0.874 (sqrt) |
| **Oracle 3 pair concordance** | **89.9%** | 08-01 | 79.8% -> 84.5% -> 89.9% |
| Verdict distribution | 5 weak / 8 balanced / 0 strong | 08-01 | Joey-implied is 7/6/0 — NOT a regression |
| Joey-implied supportShare range | 20.1% to 55.3% | 08-01 | `engine/joey-implied-strength.json`; no chart reaches 60 |
| **Oracle 4 Pearson r** | **0.929** | 08-01 | engine supportShare vs Joey-implied, 13 charts. The verdict layer's underlying number is SOUND. |
| **Oracle 4 Spearman rho** | **0.934** | 08-01 | same ordering as Joey |
| Oracle 4 mean SIGNED error | +3.6 pts | 08-01 | engine reads systematically HIGH — an offset, not noise. Relevant when thresholds are eventually chosen. |
| Oracle 4 mean abs error | 5.0 pts | 08-01 | max 10.2 (charts 10 and 6) |
| Oracle 4 label agreement | 11/13 | 08-01 | informational only — the labels have no ground truth. Both misses (6, 10) straddle the 40 cut. |
| Zero-presence law | 130/130 | 08-01 | verified against Joey's own presence figures |
| Projection-independent ceiling | 7/13 | 08-01 | was 6/13 |
| Engine Earth-first | 5 charts | 08-01 | was 7; Joey's is 4 |
| Within-element agreement | 48/57 (9 inversions) | 08-01 | **transform-INVARIANT** under linear/sqrt/log1p. Needs a MECHANISM, not a reweighting. Diagnostic 0 in the harness. |
| 旺 re-fit after sqrt (NOT adopted) | +0.020 rho | 08-01 | optimum collapsed 2.4 -> flat 1.6-1.8 plateau. Rule 13 demonstrated numerically. Left at 1.4. |
| **Blind model judging, 16 pairs, 8 charts (Reyner, labels hidden)** | **3.1-flash-lite 12, 3.5-flash-lite 4** | 08-02 | ~4% probability under coin-flip. 3.5 also costs more ($0.30/$2.50 vs $0.25/$1.50 per M). **MODEL DECISION CLOSED: 3.1-flash-lite stays primary; rule 15 untouched.** Judging notes exposed 4 candidate gate checks: duplicate-sentence detector, code/variable-leak regex, meta-disclaimer patterns, minimum-paragraphing check. |
| Gate-check renders, chart 1 (3.1-flash-lite, temp 0.2, n=2) | 0/2 clean, both salvageable by one regeneration | 08-02 | Run 1: secara-adverbial + profile palace dropped. Run 2: bukan-melainkan in the PENUTUP (third leak past the prompt ban), 半合 positions misstated, profile palace dropped again. Strength same-breath PASSED both runs, zero invention both runs. Stage 6 confirmed load-bearing; the H checks map 1:1 onto every observed failure. |
| **STAGE 6 FIRST-PASS RATE (3.1-flash-lite)** | **10.3%** (4/39) | 08-02 | **THE LAUNCH-GATING NUMBER.** `npm run measure:stage6 -- --n 3`, 13 charts x n=3, temp 0.2, prompt `baa5b7c0e3320b13`, gate `1.0.0`. Does the PROMPT work: this is the one that should move when renderer-prompt.txt is edited. It is LOW, and the cause is concentrated, not diffuse — see the per-check row. |
| Stage 6 SHIPPED rate (3.1-flash-lite) | 38.5% (15/39) | 08-02 | First pass plus the one regeneration. What a user would experience. Regeneration rescues 28.2% of runs, so the gate's retry is doing most of the work the prompt is not. |
| Stage 6 FALLBACK rate (3.1-flash-lite) | 61.5% (24/39) | 08-02 | Failed twice, served the module floor, flagged for QA. Accurate but noticeably less good. **This is the number that must come down before launch.** All 39 runs reached the gate; zero transport failures, so none of this is provider noise. |
| Stage 6 failures per check (3.1-flash-lite) | palace_dropped 41 · hedge_construction 20 · relation_positions 18 · hedging 16 · essay_connectives 11 · adverbial 7 · tension_collapse 1 · condition_named 1 · field_dropped 1 · cost_dropped 1 · too_many_breaks 1 | 08-02 | Counts are per ATTEMPT (78 attempts). **Two failures are 59 of the 118: the palace is dropped and the branch-relation span is misstated.** Both were independently observed by Reyner in the n=2 manual gate-check, which is the strongest evidence the gate is measuring the model and not itself. Neither is a voice problem; both are the renderer ignoring a structured field it was given. A prompt fix targeting those two is the highest-value next move. |
| Stage 6 gate false-positive fix | 33 of 133 rejections were the GATE | 08-02 | First batch reported 5.1% first-pass. `bare_polarity` compiled case-insensitively and matched the relative pronoun *yang* ("api yang menyala") — 20 hits, all false. `english_leakage` matched "the" inside rule 23's own sanctioned bracket "(The Sun)" — 13 hits, all false. Fixed in `3f4ea43` with two-directional regression tests; the batch above is the RE-RUN. The discarded 5.1% is recorded here only so the correction is traceable. |
| Stage 6 rider arm (2.5-flash-lite) | NO DATA | 08-02 | All 39 runs returned HTTP 429 quota-exceeded before reaching the gate, on the same key that served 3.1-flash-lite without a single failure. The A/B blind-judge pairs file therefore **does not exist**; it cannot be written unless both arms produce prose. The free-tier/model-availability question is unresolved, not answered. |
| Stage 6 threshold distributions (3.1-flash-lite) | same_breath med 0.93 (min 0.36, p10 0.50) · coverage med 1.00 (min 0.11, p10 0.73) · total_chars med 3260 (max 4915) · block_chars med 499 (min 149) | 08-02 | Observed values, **passes included** — a threshold cannot be fitted from rejections alone. All four constants are UNFITTED and all four currently sit far from the data: sameBreathOverlap 0.25 vs a p10 of 0.50, fieldOverlap 0.20 vs a p10 of 0.73, maxTotalChars 12000 vs a max of 4915, minBlockChars 40 vs a min of 149. **None of them is currently rejecting anything**, which means the observed failure rate is entirely the categorical checks. Raising them is a real option and a separate commit with its own measurement (rule 13, one at a time). |
| **STAGE 6 FIRST-PASS RATE, prompt `9f5ee276`** | **23.1%** (9/39) | 08-02 | **Re-measured after `d0cfb16`** (palace naming mandatory in-block, relation spans must name every position). Same harness, same 13 charts, same n=3, same gate `1.0.0`, rider off. **First-pass more than doubled from 10.3%.** The row above it is the `baa5b7c0` baseline and stays; this is the A/B. |
| Stage 6 SHIPPED rate, prompt `9f5ee276` | 53.8% (21/39) | 08-02 | was 38.5%. Regeneration rescues 30.8%, roughly steady (was 28.2%) — the prompt got better without the retry doing less. |
| Stage 6 FALLBACK, prompt `9f5ee276` | fb-gate 46.2% · **fb-net 0.0%** | 08-02 | was 61.5% combined. The fallback column is now SPLIT: fb-gate reached Stage 6 and failed twice (quality), fb-net never reached it (provider/quota). fb-net 0 means every one of the 39 runs is a real quality observation. |
| **Stage 6 per-check delta, `baa5b7c0` -> `9f5ee276`** | palace_dropped **55% -> 29%** · relation_positions **24% -> 28%** · hedge_construction 27% -> 23% · hedging 22% -> 17% · essay_connectives 15% -> 10% · adverbial 9% -> 7% | 08-02 | Normalised per GATE EVALUATION (74 then, 69 now), not raw counts — the denominator moves with the regeneration rate, so raw counts would overstate every improvement. **The prompt fix worked on the palace and did NOT work on relation spans.** Palace roughly halved. Relation spans went marginally the wrong way, which at n=39 is flat: the instruction was read and not obeyed. Five singleton checks (tension_collapse, condition_named, field_dropped, cost_dropped, too_many_breaks) fired once each in the baseline and zero times now; at n=1 that is noise, not a result. |
| Stage 6 dominant failures now | palace_dropped 20 · relation_positions 19 | 08-02 | Still the top two, still 57% of all 79 rejections, but no longer one problem — palace is now the same size as relation. **relation_positions is the harder one and needs a different lever than prompt wording**, having survived an explicit instruction naming it. Candidates: pre-verbalise the span in the payload, or accept that a three-position span is genuinely hard to say and relax the check to a subset rule. That is a decision, not a tweak. |
| Stage 6 threshold distributions, `9f5ee276` | same_breath med 0.93 (min 0.50) · coverage med 1.00 (min 0.22) · total_chars med 3366 (max 5063) · block_chars med 498 (min 204) | 08-02 | Unchanged in shape from the baseline. All four constants still sit far below the data and **still reject nothing** — the entire failure rate remains categorical. Fitting them would not move the launch number. |
| **STAGE 6 RUN-TO-RUN VARIANCE** | first-pass **17.9% / 23.1% / 25.6%** across 3 identical batches | 08-02 | **READ THIS BEFORE TRUSTING ANY SINGLE NUMBER ABOVE OR BELOW.** Same prompt `9f5ee276`, same gate `1.0.0`, same 13 charts, same n=3, temp 0.2. Spread is **7.7 points** on first-pass and 7.7 on shipped (53.8/61.5/61.5). At n=39 this harness cannot resolve a difference smaller than about 8 points. The 10.3% -> ~22% prompt improvement is comfortably outside that band and is real; **any arm-vs-arm gap under 8 points is not a result.** Raising n is the fix and it is now cheap (billing is live). |
| Stage 6 rider, 3.1 vs 3.5-flash-lite | 3.1: first-pass 17.9%, shipped 61.5%, fb-gate 38.5% · 3.5: first-pass 23.1%, shipped 56.4%, fb-gate 43.6% | 08-02 | Same batch, n=3, prompt `9f5ee276`. **The two arms are INDISTINGUISHABLE at this n** — both gaps (5.2 and 5.1 points, in opposite directions) sit inside the variance band above. No model decision is supported by this run. 16 anonymised pairs emitted for blind judging. |
| Stage 6 rider substitution | `gemini-2.5-flash-lite` is RETIRED | 08-02 | The ledger's named rider returns **HTTP 404 "no longer available to new users"** — it is still listed by the models endpoint but is not callable. The earlier 429 was masking this; billing removed the quota error and exposed the real one. `gemini-2.0-flash-lite` is also 404. Only `gemini-3.5-flash-lite` and the `gemini-flash-lite-latest` alias remain callable, so the rider arm ran against **3.5-flash-lite**. This changes the question from "can we move down" to "should we move up" and **needs Reyner's ratification** before the ledger's rider note is treated as answered. |
| Stage 6 per-check, both arms | 3.1: hedge_construction 18 · palace_dropped 16 · relation_positions 16 · hedging 10 · essay_connectives 8 · adverbial 3 — 3.5: **palace_dropped 34** · relation_positions 16 · essay_connectives 6 · hedge_construction 4 · adverbial 2 · too_many_breaks 2 · tension_collapse 1 · field_dropped 1 | 08-02 | Denominators are gate evaluations: 71 (3.1), 67 (3.5). **The one difference that is NOT inside the noise band: 3.5 drops the palace more than twice as often** (51% of evaluations vs 23%) while breaking the hedge construction far less (6% vs 25%). The two models fail in different places rather than one being better. relation_positions is identical on both (23% vs 24%), which is further evidence it is not a model-quality problem. |
| Stage 6 harness correction | schema failures were counted as transport | 08-02 | The gate/transport split shipped in `3e7c9ad` classed a malformed-JSON response as a provider failure. Six attempts on the 3.5 arm were affected and one whole run was labelled `fallback_transport` when the model had in fact returned unparseable output twice. A schema violation is a MODEL failure; the 3.5 fb-gate figure above is corrected to 43.6% and its fb-net to 0.0%. Fixed with a test; no re-run was needed because all six were unambiguous. |
| Solar-term boundaries, day-level | 0 disagreements / 1212 | 07-30 | three oracles |
| Joey #1 element distribution | Earth 5, Fire 4, Wood 3, Metal 1, Water 0 | 08-01 | from full ten bars |
| **Badge anchors vs Joey's printed stars** | **60/60** | 08-01 | 貴人 文昌 桃花 驛馬 孤辰 across 12 charts. **Every table row exercised** — 10/10 day stems, 4/4 trine groups, 4/4 season groups. Tables in `prompts/D2a-stage3-anchors.md`. |
| Badge anchors, YEAR-pillar alternative | 0/12 桃花, 0/12 驛馬, 1/12 孤辰 | 08-01 | the day-pillar ruling is not marginal |
| **Badge frequency (avg per chart)** | **2.15, range 1-4** | 08-02 | RE-MEASURED from the verified anchors (was 2.5 with a candidate 華蓋 table). 28 badges over 13 charts. Nobody at 0, nothing universal, so the comparison mechanic survives. Phase 2's extremity term reads this. |
| **Bintang Penolong frequency** | **77% (10/13)** | 08-02 | re-measured; unchanged from the stale figure by coincidence, 10 of 13 either way. The never-top-3 rule stands on the same footing. |
| **Badge frequency, per badge** | 貴人 10 · 文昌 5 · 驛馬 4 · 空亡 4 · 桃花 2 · 羊刃 2 · 孤辰 1 | 08-02 | out of 13. `tests/badge-anchors.spec.mjs` asserts all seven. **All three per-badge figures D2 phase 2 cites survive unchanged** — Mata Pisau 15% (2/13), Tanda Kekosongan 31% (4/13), Bintang Penolong 77% (10/13). Only the AVERAGE moved, and only because 華蓋 left the set. |
| **Badge anchors, YEAR-pillar alternative** | **0/10 桃花, 0/10 驛馬, 1/10 孤辰** | 08-02 | CORRECTS the 08-01 row below it. Denominator is 10, not 12: X2 and X3 both have year branch == day branch (巳), so the two conventions are the same computation there and cannot discriminate. Stated correctly the ruling is STRONGER — every chart that can tell them apart favours the day pillar. |
| Stage 3 facts per chart | 9 to 16, mean 12.5 | 08-02 | Phase 1 inventory, unranked. Thinnest charts 7 (9) and 12 (10) are the `quiet_chart` candidates. |
| Stage 3 CR-1 fire rate | 4/13 | 08-02 | charts 1, 7, 9, 12. **9/13 without the balanced-verdict exclusion** — see the 08-02 Stage 3 section. |
| Stage 3 void_stack fire rate | 1/13 | 08-02 | chart 1 only, at stack size 3. The exemplar the target file describes. |
| Stage 3 glossary gaps | 1 fact type | 08-02 | `strength_<verdict>` has no glossary entry at all. Every other fact type is fully backed. |
| **Stage 3 chart-1 rank rho vs hand-written** | **0.81** | 08-02 | Spearman over the 11 facts the target file carries. **Top-3 SET is exact.** Not a gate — a record, so a change that scrambles ordering shows as a drop. |
| **Bintang Penolong in top-3** | **0/13** | 08-02 | the load-bearing D2 assertion. Engine ranks it 11th of 11 on chart 1 where the hand file put it 7th; the engine applies the never-headline rule more consistently than the hand scoring did. |
| Stage 3 quiet_chart rate | 2/13 | 08-02 | charts 5 and 13, at `quietFloor` 70. Unfitted default. |
| **Stage 3 JSON byte-identical on recompute** | **13/13** | 08-02 | the cache guarantee. Cache keys all distinct, no collisions. |
| Stage 3 facts after collapse, chart 1 | 14 of 16 | 08-02 | `main_profile` absorbed by CR-1, `badge_空亡` by its void stack. |
| Stage 3 required points, chart 1 | 9 | 08-02 | hand-written file has 8; the extra is `day_master_Fire`, which the target carries as its first point. |
| **STAGE 6 FIRST-PASS RATE, prompt `443fcb57`, gate `1.1.0`** | **18.5%** (24/130) | **08-04** | **n=10, primary only, rider OFF.** `npm run measure:stage6 -- --n 10`, 13 charts x n=10, temp 0.2. Two changes land together and they push OPPOSITE ways, so read this against the band, not against the last number: the prompt gained the `positions_id` handover, and the GATE GAINED FOUR CHECKS. Against the 17.9 / 23.1 / 25.6 variance band this is INSIDE it, at the bottom. Holding inside the band while the bar rose is not a regression; it is also not a demonstrated improvement. **Binomial 95% CI at n=130 is +-6.7 points**, so n=10 does NOT deliver the +-2-3 points hoped for - that needs n~50 (644 runs). |
| Stage 6 SHIPPED rate, prompt `443fcb57`, gate `1.1.0` | 43.8% (57/130) | 08-04 | was 53.8 / 61.5 / 61.5. **BELOW the band, and the cause is known and intended:** `structure.unparagraphed` is new and rejects 25.8% of gate evaluations. Readings that used to ship now fail on a real defect. The gate got stricter; the prompt did not get worse. 95% CI +-8.5 points. |
| Stage 6 FALLBACK, prompt `443fcb57` | fb-gate 56.2% · **fb-net 0.0%** | 08-04 | was 46.2% / 0.0%. Every one of the 130 runs is a real quality observation. One HTTP 503 across 235 attempts, absorbed by the transport retry. |
| **Stage 6 per-check, gate `1.1.0`** | palace_dropped 43.6% · hedge_construction 41.7% · hedging 31.3% · **unparagraphed 25.8%** · essay_connectives 25.2% · relation_positions 18.4% · adverbial 7.4% · condition_named 1.2% · unsanctioned_bracket 1.2% · field_dropped 1.2% · tension_collapse 1.2% · cost_dropped 0.6% | 08-04 | Normalised per GATE EVALUATION (163), the ledger's convention - the denominator moves with the regeneration rate and raw counts would overstate everything. 324 rejections. **palace_dropped is back on top at 43.6% (was 29%)** and needs its own look; nothing in this pass touched it. |
| **`relation_positions`: the phrase handover WORKED, the CHECK is broken** | **8 of 8 failures are gate false positives** | **08-04** | 28% -> 18.4% per evaluation after `positions_id`. The residual is NOT the renderer. Diagnostic over the only three charts that still fail (2, 11, 6): **every finding had `missing == []`** - the span was stated COMPLETELY - and every one failed on an EXTRA position (`expected [month,year] named [year,month,hour]`). Separately, **5 of 5** relation blocks reaching the gate carried `positions_id` VERBATIM. Cause: the check scans for bare `tahun/bulan/hari/jam`, which `renderer-prompt.txt` itself MANDATES in `batang bulan` / `cabang hari` / `batang jam` (~line 76) and in the `Hari lahirmu` idiom. Same class as `bare_polarity`/*yang*. **NOT fixed here on purpose** - it targets the same metric as the handover and fitting both in one measurement is rule 13. Own commit, own measurement. |
| **The four checks added 08-04, by real-defect yield** | unparagraphed 42 · duplicate_sentence 0 · code_leak 0 · meta 0 | 08-04 | Over 163 gate evaluations. `unparagraphed` is doing all the work and is the whole reason shipped fell. The other three cost nothing and catch nothing at n=130, which is what insurance looks like when it is not needed yet. All four were validated against the 32 gate-passed samples in the 08-02 pairs file before shipping: **zero false positives there.** |
| **`paragraphFloorChars` = 700 is FITTED ON A BIASED SAMPLE and needs re-deciding** | rejects 25.8% of evaluations | 08-04 | Set from the 32 gate-PASSED pairs samples, where block length was med 415 / p90 570 / max 954. The full n=130 population is LONGER: **med 493, p90 748, max 1390** (n=1310 blocks). So 700 now sits BELOW p90 rather than above it, which is why it fires so much. Passes-only is as biased a sample as rejections-only - the same error the harness header warns about. **This is a real decision for Reyner, not a bug:** a 700-char unbroken paragraph IS a wall, and regeneration rescues most of them, but the threshold moved the launch number and was never ratified. |
| **STAGE 6, gate `1.2.0`** (relation_positions scan scoped) | first-pass **18.5%** (24/130) · shipped **47.7%** (62/130) · fb-gate 52.3% · fb-net 0.0% | **08-05** | `8c64d37`, same prompt `443fcb57`, n=10, primary only. First-pass identical to gate 1.1.0 to the run (24/130 both times), shipped 43.8% -> 47.7%. Both moves are inside the CI, so this change did not measurably alter the launch numbers - which is the expected shape for a fix that removes false REJECTIONS from a check that was not the binding constraint. |
| **`relation_positions` after the fix: 16.1%, NOT ~zero. THE FIX WAS ONLY THE MINOR CAUSE.** | 18.4% -> **16.1%** (30 -> 27 raw) | **08-05** | Scoping the bare-word scan (`8c64d37`) cleared chart 6 entirely (2 -> 0) and left charts 2 and 11 (8 and 5 of 10 runs). **THE DOMINANT CAUSE IS BRAID CONTAMINATION, diagnosed from the actual failing block text.** `blocksCiting` returns the same block for every fact it cites, and the position scan takes the UNION of everything named in it, so in a braided block each relation is charged with the OTHER facts' palaces. Chart 2: one block cites both relations and states BOTH spans correctly ("Di Pilar Akar dan Pilar Kerja ... Setengah Gabungan" and "Ikatan antara Pilar Akar dan Pilar Arah"), and each fact fails on the other's palace. Chart 11: the relation is braided with badges and "Bintang Perantau di Pilar Arah" contributes the extra `hour`. `renderer-prompt.txt` REQUIRES braiding ("A braided block MUST close by converging"), so the check penalises the prose it asks for. **THE FIX: drop the `extra` condition and keep `missing`.** Every genuine misstatement is a MISSING position - the originally observed failure was "spans year+hour+month, text said tahun dan bulan" - while `extra` cannot be attributed to any one fact in a braid. Not done here: same metric, own measurement (rule 13). |
| Method note: the 8/8 attribution was right about WHAT, wrong about WHY | - | 08-05 | The 08-04 diagnostic read finding MESSAGES, which show expected-vs-named but never the prose. That correctly proved the spans were complete (`missing == []`) and wrongly suggested an incidental mandated word was adding the extra. A second diagnostic appeared to refute braiding, but it was itself broken: on a FLOOR result `blocks` is the floor's while `findings` come from the failed LLM attempt, so it compared unrelated objects. Only calling the provider directly and running the gate over the parsed output showed the cause. **Lesson for this harness: a finding message is evidence about the CHECK, never about the TEXT.** |
| **STAGE 6, gate `1.3.0`** (paragraph rule = 8 sentences, 1100-char backstop) | first-pass **20.8%** (27/130) · shipped **48.5%** (63/130) · fb-gate 51.5% · fb-net 0.0% | **08-05** | `4ef7bf7`, Reyner's ruling, same prompt `443fcb57`, n=10, primary only. Moves from gate 1.2.0 (18.5 / 47.7) are both inside the CI. |
| **The paragraph rule was RE-TARGETED, not relaxed: `unparagraphed` 25.3%** | 25.8% (700 chars) -> 29.2% -> **25.3%** (8 sentences) | **08-05** | Changing the unit did NOT reduce the rejection rate. It is the same ~25% of gate evaluations, now measured on the criterion that matches what a reader experiences instead of on width. So the rule is more defensible and the DRAG IS UNCHANGED - it is still the 4th largest rejection cause, and shipped moved 47.7% -> 48.5%, i.e. not at all. `block_chars` max 1626 means the 1100 backstop is also firing. |
| **WHY: `renderer-prompt.txt` FORBIDS what the gate now REQUIRES.** | prompt lines 226-227 | **08-05** | **The renderer cannot satisfy both, which is the whole explanation for the stuck 25%.** Line 226: *"text has no sentence limit."* Line 227: *"Use them [paragraph breaks] only in a braided block carrying three or more facts."* So a one-fact block of twelve sentences is prose the prompt explicitly asks for and the gate now rejects. **The next lever for this check is a PROMPT line, not a threshold** - tell the renderer to break past 8 sentences and drop the three-fact restriction. Structural instruction, not register, but it changes `PROMPT_VERSION` and needs its own measurement (rule 13). Until then a quarter of evaluations will keep failing a rule the renderer was told not to follow. |
| **STAGE 6, engine `0.4.2` + gate `1.3.0`** (CR-1/convergence collapse) | first-pass **26.9%** (35/130) · shipped **45.4%** (59/130) · fb-gate 53.8% · fb-net 0.8% | **08-05** | `7fb06d8`, same prompt `443fcb57`, n=10, primary only. **First-pass 20.8% -> 26.9%, the largest single move any change in this sequence has produced** and just outside the +-6.7 CI. Plausible but NOT established at n=130; the replicate below is what decides it. |
| **`duplicate_sentence` is 0, which is C's target confirmed** | 1 run -> **0 runs** | 08-05 | The check that FOUND the collapse gap no longer fires anywhere. Charts 9 and 12 each lost one duplicated fact. |
| Shipped went DOWN while first-pass went UP, and that is arithmetic not regression | shipped 48.5% -> 45.4% | 08-05 | Regeneration fell 27.7% -> 18.5%, and shipped is first-pass plus rescued: 26.9 + 18.5 = 45.4, against 20.8 + 27.7 = 48.5. Fewer readings need rescuing and fewer of the ones that do get rescued. Both shipped figures sit inside the +-8.5 CI, so shipped has now been flat across gates 1.1.0 through 1.3.0 at 43.8 / 47.7 / 48.5 / 45.4. **Nothing in this sequence has moved the shipped rate.** |
| Collateral: `palace_dropped` 34.9% -> 25.3%, `relation_positions` 18.1% -> 14.3% | - | 08-05 | Neither was targeted by C. Both fall out of a smaller fact set on charts 9 and 12 - fewer required points means fewer chances to drop a palace - so read these as a denominator effect, not as progress on either check. Gate evaluations fell 166 -> 154 for the same reason. `relation_positions` is still braid contamination and still unfixed. |
| Stage 6 threshold distributions, gate `1.1.0` | same_breath med 0.93 (min 0.20, p10 0.50) · coverage med 1.00 (min 0.00, p10 0.69) · total_chars med 3313 (max 4797) · block_chars med 493 (p90 748, max 1390) | 08-04 | n=231 / 3792 / 235 / 1310. The three ORIGINAL unfitted constants still reject nothing: sameBreathOverlap 0.25 vs a p10 of 0.50, fieldOverlap 0.20 vs a p10 of 0.69, maxTotalChars 12000 vs a max of 4797. `coverage` min is now 0.00 and `same_breath` min 0.20 - the first observations to fall BELOW their thresholds, so these two are no longer provably inert and are worth a look before they are fitted. |

## DECIDED 2026-08-04 — model question CLOSED; span pre-verbalised; four gate checks; n=10 measured

**MODEL DECISION IS CLOSED (Reyner).** Blind judging went **12-4 for 3.1-flash-lite**, which also
costs less ($0.25/$1.50 vs $0.30/$2.50 per M). It stays primary; rule 15 untouched. **No more rider
arms.** `scripts/measure-stage6.mjs` no longer defaults `--rider` to a model — it used to default to
`gemini-2.5-flash-lite`, which is RETIRED (HTTP 404), so every default run spent half its calls on an
arm that could not answer and then reported it as fallback. A rider is now opt-in. `--no-rider` still
works and is redundant.

### 1. Stage 3 pre-verbalises the branch-relation span (`positions_id`)

`relation_positions` was the one check an explicit prompt instruction never moved (24% -> 28% across
`baa5b7c0` -> `9f5ee276`, flat at n=39). The renderer was handed an ARRAY of positions and told to say
all of them, and kept saying two of three. It is now handed the finished phrase.

`provenance.positions_id` ships on **all 21 relation facts across the 13 fixture charts** — both
`branch_relation` and `punishment`, because the prompt line says "a relation's span" and a 刑 is a
relation the reader sees as one. `palacePhrase()` in `lib/semantic/glossary.js`. Chart 1:
`"Pilar Akar, Pilar Kerja, dan Pilar Arah"`.

- **It is a DATA JOIN, not copy.** Every name comes from `GLOSSARY.pilar`. Nothing is authored, so no
  register review is owed. Asserted: `tests/stage3-facts.spec.mjs` checks the phrase names exactly the
  palaces the fact claims, no more and no fewer, against `GLOSSARY.pilar` itself.
- **Sorted into READING ORDER, which the raw field is not.** Chart 1's `positions` are
  `[year, hour, month]` because the relation table lists the pair's branches in table order. Speaking
  that order aloud is wrong, so the phrase sorts year/month/day/hour and a test asserts it.
- `positions` and `palaces` both stay: the gate checks against them and QA reads them.
- One prompt line added at `renderer-prompt.txt` §THE PALACES AND THE PARTS. Verified `positions_id`
  survives `scrubInternal` into the payload the provider actually sees.
- **`ENGINE_VERSION` 0.4.0-stage3 -> 0.4.1-stage3.** A new field is a contract change, so the whole
  cache invalidates. Correct: every cached reading predates the field.

**IT WORKED, AND THE MEASUREMENT SAYS SO — see the `relation_positions` row in MEASUREMENTS.** 5 of 5
relation blocks reaching the gate carried the phrase verbatim, and 8 of 8 residual failures are the
CHECK's false positive, not the renderer's. Which is the next item.

### 2. THE 08-02 BLIND-JUDGING PAIRS FILE WAS **POST-GATE**. All four defects were gate MISSES.

This was the question to settle before adding anything, and it is settled twice over:
- `measure-stage6.mjs` records a sample for judging only when `!fallback` (`perArm[model] = result`).
- `renderReading` returns a non-fallback result **solely from the `gate.ok` branch**
  (`lib/render/index.js`), so non-fallback means gate-passed by construction.
- Empirically: all **46** served rows of that batch passed.

So the defects Reyner found were in text the gate had already approved. Re-running the four new checks
over those **32 gate-passed samples**:

| defect | in gate-passed text | verdict |
|---|---|---|
| unparagraphed wall | **2 / 32** — worst 954 chars, 17 unbroken sentences | live escape |
| duplicate sentence | **1 / 32** — chart 3, same sentence twice in one block | live escape |
| code/variable leak | 0 / 32 | insurance |
| meta-disclaimer | 0 / 32 | insurance |

**Why the wall escaped: the gate had a CEILING on paragraph breaks (`maxBreaksPerBlock`) and no FLOOR.**
Zero breaks was legal at any length. `minBlockChars` guards emptiness, not density.

Four checks added, all `soft` (one regeneration), **`STAGE6_VERSION` 1.0.0 -> 1.1.0**:
`structure.unparagraphed`, `structure.duplicate_sentence` (both in `structure.js`, both structural
properties of rendered text), `style.code_leak` and six new `style.meta` entries (both in
`blocklist.json`, which is DATA Reyner can extend without a deploy).

**Duplicate detection is scoped to the WHOLE reading, not one block.** The observed case was
within-block, but braided blocks make cross-block restatement the worse failure, not the milder one.
Comparison is exact beyond case/whitespace/terminal punctuation: a near-duplicate detector needs a
similarity threshold, and an unfitted threshold on a brand-new check is how false positives ship.

**TWO FALSE POSITIVES WERE CAUGHT BEFORE SHIPPING, both the `bare_polarity`/*yang* shape:**
1. **The camelCase code-leak regex compiled case-INSENSITIVELY** (`compile()` defaults to `iu`), which
   reduces `[a-z]+[A-Z]` to `[a-z]+[a-z]` — it matched every word in the language and flagged all 398
   glossary strings. Pinned with `"flags": "u"`.
2. **`NO ENGINE STRING WOULD TRIP THE STYLE GATE` was hardcoding `'iu'`**, ignoring each entry's own
   `flags`, so it was stricter than the gate it guards and could not validate a case-sensitive pattern
   at all. Now compiles the way `style.js` does. `bare_polarity` was passing that test by luck.
3. A third was caught in the audit itself and never shipped: a naive `sebagai (ai|model)` disclaimer
   pattern matches **"Sebagai Air (Water)"**, correct prose on every Water chart. The shipped `meta`
   entry keeps `\b` after `AI` and there is now a test named after this.

### 3. TWO DEFECTS FOUND BY THE NEW CHECKS. Neither fixed here, both have their own commit.

**a) A THIRD Stage 3 collapse gap, charts 9 and 12 of 13.** When the CR-1 tension's Aspek is ALSO a
converging Aspek, Stage 3 emits both `profile_vs_favorable` and `aspek_convergence_<same god>`. Both
resolve to the SAME glossary entry, so label + label_meaning + gift + cost render **twice, word for
word** — six duplicated sentences on chart 9 (正財), seven on chart 12 (偏財). Chart 1's CR-1 god is 正財
and it has no 正財 convergence, which is why 11 of 13 are clean.

This is the same pattern `collapseSuperseded()` already handles twice (`main_profile` absorbed by CR-1,
`badge_空亡` by its void stack) and the fix belongs there. **Not done here because it moves those charts'
fact sets, `required_points` and hierarchy ranks, and landing it inside a prompt-change measurement
would confound both (rule 13).** It also means the renderer is currently handed the same content twice
on those charts, so it is a plausible CAUSE of the duplicate sentences Reyner saw, not just a floor
defect. `tests/stage6-validation.spec.mjs` asserts the failure EXACTLY, with the exemption **derived
from the cause** rather than a chart-id list, so it retires itself when the collapse lands and cannot
absorb a chart that starts duplicating for some other reason.

**b) `fact.relation_positions` is a GATE BUG, measured 8/8.** See the MEASUREMENTS row. The check
scans for bare `tahun/bulan/hari/jam`, and `renderer-prompt.txt` itself mandates `batang bulan` /
`cabang hari` / `batang jam` and the `Hari lahirmu` idiom, so a block that states its span correctly in
palace names and then correctly names a stem picks up a spurious extra position and fails. **It is all
four words, not just `hari`** — the measured extras were `hour` and `month`. Minimal repro on chart 1
(span `[year, hour, month]`, no `day`): adding `"batang hari"` to a correct block flips it to
`names [day, year, month, hour]`. Fix technique already exists in this codebase — `englishLeakage()`
cuts the sanctioned bracket out before scanning.

### 4. Two things the measurement changed that were NOT decisions anyone made

- **`paragraphFloorChars` = 700 was fitted on a biased sample.** It was set from the gate-PASSED pairs
  (p90 570) and the full population is longer (p90 748, max 1390), so it fires on 25.8% of evaluations
  and is most of why shipped fell to 43.8%. Passes-only is as biased as rejections-only. **Reyner's
  call**, with the distribution now in MEASUREMENTS.
- **`palace_dropped` is back on top at 43.6%**, up from 29% after the `d0cfb16` prompt fix that halved
  it. Nothing in this pass touched the palace instruction. Either the fix decayed against a changed
  prompt or the earlier figure was a lucky batch. It is now the largest single rejection cause and the
  highest-value target after the `relation_positions` gate fix.

**Two test fixtures were self-duplicating and are fixed.** `goodReading()` (stage6) and `goodRender`
(stage5) both set `penutup` to a glossary string their own blocks already render, so both repeated
themselves and `structure.duplicate_sentence` correctly rejected them. Any glossary string would
collide — the floor renders every string of every fact — so both now use a fixture sentence asserted
clean against the whole blocklist. **The checks were not weakened to accommodate a fixture.**

## DECIDED 2026-08-03 — card sizes LOCKED, Card A head, footer gender strings (Reyner)

Three rulings by Reyner. They close the last two open items in the 08-02 CARD VISUAL SYSTEM block
below except the colour tokens and `tags_en`, which are in review as of this date.

**1. SIZES LOCKED.**
- **Card A: a 63:88 card OBJECT (TCG ratio) rendered on a 3:4, 1080x1440 feed-safe canvas.** The card
  floats on the colour field with a slim margin. Rationale: 3:4 matches Instagram's 2026 grid, so the
  image crops in neither feed nor profile grid; the TCG ratio makes the thing on the canvas read as a
  *card* rather than a graphic. This **supersedes the 08-02 proposal of 1080x1350 (4:5)**.
- **Card B: 1080x1920 (9:16), unchanged.** Taller is the exclusivity signal.

  Derived geometry (arithmetic, 08-03): a 3:4 canvas and a 63:88 card admit exactly one uniform
  margin. Solving `(1080-2m)/(1440-2m) = 63/88` gives **m = 86.4**, card **907 x 1267**. So the card
  can sit optically centred with an equal margin on all four sides at no cost to either ratio; any
  slimmer margin makes the top-bottom and left-right gaps unequal. **OPEN, one sub-question the ruling
  does not settle:** what distinguishes the card object from the canvas when both carry the same
  colour field. Cowork recommends a hairline inset plus a soft shadow, same colour both sides, because
  the alternative (a different surface value for the card) adds a fourth colour token per archetype.
  Mocked that way in the 08-03 token proposal; not locked.

**2. CARD A HEAD: EN-only (`name_en`), no Indonesian eyebrow.** The Indonesian archetype name appears
nowhere on the free card; it lives in the reading. **This closes the OPEN item** in the 08-02 block
("EN-only, or tiny ID eyebrow"). Aspek stays Indonesian on both cards, per 08-02.

**3. GENDER FOOTER STRINGS: `PEREMPUAN` / `LAKI-LAKI` APPROVED** as proposed. Register review done.
Footer stays gender + birthdate + katon.app; null gender still renders date + source only.

## DECIDED 2026-08-03 — Xendit merchant-compliance chrome shipped (footer + 5 static pages)

`prompts/I-xendit-site-compliance.md`, all six tasks. Serves **TODO #8**. Xendit rejected activation
(ticket 2686100) on KBLI mismatch AND website criteria; MCS Consulting owns the KBLI side, this is
the website side. New: `lib/site/entity.js`, `lib/site/copy.js`, `lib/site/format.js`,
`components/SiteFooter.jsx`, `components/StaticPage.jsx`, and `app/{harga,tentang,privasi,syarat,pengembalian}/page.js`.

**All five pages prerender as static.** `npm run build` on 2026-08-03 lists `/harga`, `/tentang`,
`/privasi`, `/syarat`, `/pengembalian` as `○ (Static)`, and the entity name is present in each
generated `.next/server/app/<route>.html`. The Xendit reviewer sees real content in view-source
without executing JS, which was acceptance check 5 and is now a structural property, not a promise.

**The footer is mounted in the LAYOUT.** Verified live on `/`, `/harga`, `/tentang` and
`/r/[token]` against the dev server. Mounting it per page would have missed the reading route,
which is the one page a reviewer following a shared link actually lands on. It carries the entity
name, the contact email and the five links, and **deliberately NOT the registered address** — see
the 08-03 string-review section below.

**TRIPWIRE — three code changes that make `/privasi` FALSE and must update it in the same PR.**
The privacy policy states these as commitments, not as descriptions, and a policy that lags the code
is the one kind of privacy defect that is worse than having no policy:
1. **Adding any analytics or tracking tag, or any cookie.** `collectNote` says Katon sets neither.
   Verified absent 2026-08-03 by
   `grep -rn "localStorage|sessionStorage|cookies()|document.cookie|gtag|analytics" app components lib`.
2. **Capturing a name or an email address anywhere.** `collectNote` says Katon asks for no name, and
   the processor clause says no email reaches the model provider. Today the only contact field is
   `wa_number` at checkout. The ledger's own "capture email AFTER the free mirror" item (PRODUCT /
   FUNNEL section) is exactly the change that trips this.
3. **Arming the OpenAI fallback** (`KATON_OPENAI_MODEL` / `OPENAI_API_KEY`). The processor list already
   names OpenAI as a standby, so arming it does not add a processor — but if the secondary is ever
   dropped or swapped, the named list is wrong.

**LAUNCH GATE — the WhatsApp number and its copy move as ONE UNIT (Reyner, 2026-08-03).**
`/syarat` promises *"tautannya kami kirim ke nomor WhatsApp yang kamu masukkan saat pembayaran"* and
`/privasi` lists the number as collected. **`lib/wa.js` is a provider-gated stub**: no WA provider is
wired, `sendReadingLink` no-ops and returns `{ sent: false, reason: 'no_provider' }`, and the webhook
treats that as the expected MVP state. So the promise cannot currently be kept. A buyer is not
stranded, because the product is reachable at the reading link either way, but the terms overstate.
**No real sale until one of these two is true:**
- `lib/wa.js` actually sends, OR
- the WA field and every string about it are removed TOGETHER from all three surfaces: the checkout
  field in `components/Funnel.jsx`, `SITE_COPY.privasi.collect[2]`, and
  `SITE_COPY.syarat.paid[2]`.

Removing one or two of the three is worse than doing nothing: it leaves a policy that describes a
field that no longer exists, or a field nothing discloses. Both were checked 2026-08-03 —
`grep -n "wa_number\|waNumber" components/Funnel.jsx app/api/pay/\[id\]/route.js`.

**LAUNCH_PRICING FLIP RUNBOOK (Reyner, 2026-08-03).** `lib/pricing.js` documents the hazard in its
own words: an invoice created before a `LAUNCH_PRICING` change and settled after it will **NOT**
unlock, because `amountMatchesSku` checks a single tier on purpose. Order of operations:
1. **Shorten the invoice window first.** CORRECTION to the runbook as dictated: `createQrisInvoice`
   (`lib/xendit.js`) sends `external_id`, `amount`, `currency`, `description` and `payment_methods`
   and **does not send `invoice_duration` at all**, so invoices sit at Xendit's default expiry rather
   than at anything we control. Making this step real needs a payment-side change (Prompt F owns
   `lib/xendit.js`); until then this step is "wait out the default window", not "set a short one".
   Verified 2026-08-03: `grep -n "expir\|invoice_duration\|duration" lib/xendit.js` returns nothing.
2. **Drain in-flight invoices.** No new checkout, and every pending invoice either settles or expires.
3. **Then flip the lever**, and only then.
4. If one slips through anyway, `/pengembalian` is the buyer's written remedy: a confirmed payment
   whose product never became available is the first bullet under "Yang bisa dikembalikan", so the
   refund path is already promised and does not need a special case.

**SUPPORT COMMITMENT WITH NO TOOLING: recomputing a wrong birth date.** `/pengembalian` tells a buyer
who entered the wrong date that *"kami akan mencoba menghitung ulang untukmu"*, and offers that
instead of a refund. There is **no code path for it**. `app/api/reading/[id]/hour/route.js` adds a
missing birth HOUR and is the only mutation endpoint; nothing corrects a birth DATE, so honouring this
means manual work in the Supabase SQL editor per request (and the reading's cache key changes with the
chart, so the row cannot simply be edited in place without thinking about `render_cache`). Verified
2026-08-03: `ls app/api/reading/\[id\]/` shows `full`, `hour`, `interest`, `route.js` and nothing else.
The promise is deliberate and correct commercially — it is cheaper than a refund and better for the
buyer — but it is a SUPPORT commitment, not a feature. If volume ever makes it painful, the fix is an
endpoint, not a policy edit.

**No rupiah figure exists in any page or copy string.** `/harga` resolves every number from
`lib/pricing.js`. The launch/list anchor renders only while `priceFor(sku) < SKUS[sku].list`, so
flipping `LAUNCH_PRICING` needs no edit here. `compat` is gated on `isSellable()`, not on wording:
it shows priced + `segera` + no action today and becomes buyable the moment Prompt E adds it to
`SELLABLE_SKUS`. `formatIdr` is hand-rolled in `lib/site/format.js` rather than `Intl.NumberFormat`,
which emits U+00A0 on some ICU builds and can differ between the rendering server and the hydrating
browser.

**Rule 20 is now enforced mechanically on this surface, not by a one-off grep.**
`scripts/check-copy.js` walks `SITE_COPY` and `ENTITY`. Legal prose is the longest body of
user-facing copy in the repo and is exactly where a pasted smart quote survives review.

**THE PRIVACY POLICY'S CLAIMS WERE CHECKED AGAINST THE CODE, NOT RECALLED** (2026-08-03; commands
are in the `lib/site/copy.js` comment block). Two claims changed as a result, and both would have
been wrong if the prompt's draft had been transcribed:
- The prompt lists "alamat email jika pembayaran". Checkout captures a **WhatsApp number**
  (`wa_number`, `app/api/pay/[id]/route.js`) and **no email is captured anywhere today**.
- `gender` is accepted by `app/api/reading/route.js` but is **not collected by the UI** —
  `grep -n "gender" components/Funnel.jsx` returns nothing — so it is not listed as collected.
- No cookies, no storage, no analytics, verified by
  `grep -rn "localStorage|sessionStorage|cookies()|document.cookie|gtag|analytics" app components lib`
  returning one code comment and nothing else. Stated on the page because it is true today; it stops
  being true the moment anyone adds an analytics tag, so re-check before claiming it again.
- The LLM payload carries no identifier and no raw birth date (`lib/render/payload.js`; the Stage 3
  semantic JSON has no date field). That is why the page can say what it says about the model
  provider.

**TWO PRE-EXISTING DEFECTS FOUND, NEITHER FIXED HERE** (content PRs stay independently reviewable):
1. **`components/Funnel.jsx:613` hardcodes `Rp 49.000` in the LIVE paywall.** That price is retired
   in CLAUDE.md's SUPERSEDED list and gone from `lib/pricing.js`, and the invoice actually charges
   `priceFor('artifact')` = **Rp 19.000**. The user is shown one number and charged another. This is
   payment-adjacent UI, so it belongs with Prompt F, but flag its severity: an advertised price that
   differs from the charged amount is exactly what a payment-processor reviewer escalates, and
   activation is currently blocked. Line 611's `Rp 300-500rb` anchor is the same dead 49k copy.
2. **Nine banned ellipsis characters (U+2026) in user-facing funnel strings.** Rule 20 violation.
   `rg -n '\x{2026}' components app lib --glob '*.{js,jsx}'` on 2026-08-03: `Funnel.jsx` lines 255,
   352, 462, 553, 607, 651, 671, 799, 902. The two `lib/` hits are the ban patterns themselves and
   are correct. The root cause is structural: the funnel inlines its strings, so no checker covers
   it. Fix needs a copy bank or a source-level scan, not nine edits. Per rule 20, this note closes
   when a fixing commit exists.

**ACCEPTANCE CHECK 6 IS CLOSED. Reyner reviewed all six pages string by string on 2026-08-03** and
ruled on every flag raised. What he changed:
- **Footer: registered address REMOVED**, along with `addressLabel`. Xendit's own criteria do not ask
  for one. `ENTITY.address` is kept unrendered for the PDF and future invoices.
- **Middle dot BANNED.** `U+00B7` was a title separator in all five page titles and the root title in
  `app/layout.js`; all six are hyphens now and the character is on the `check-copy` ban list. Rule 20
  keeps zero exceptions. **The ban does not reach everything** — about 10 strings in
  `lib/bazi/interpretation/cardCopy.js` (not walked by the checker) and about 10 separator uses in
  `components/{Funnel,kit,Sharecard}.jsx` still carry it. Widening the walk to `cardCopy.js` fails the
  build immediately, so that is a deliberate decision and not a side effect. Out of scope for this PR.
- **Product names are an EN tier layer.** `Bacaan Kompatibilitas` became `Compatibility Reading`,
  matching `Complete Edition`; body copy stays Indonesian.
- **`/harga`'s Complete Edition note now carries the purchase path with the funnel linked inline**,
  because Xendit criterion 2 asks for a checkout flow and this page has no buy button by design.
- **`/tentang` dropped "tiga langkah"** — the paragraph listed four things.
- **`/privasi` gained the UU PDP cross-border sentence** in Reyner's own words.
- **`/pengembalian`: `3x24 jam kerja` became `3 hari kerja`**, the claim window became one constant
  (`claimWindowDays` + a `{claimDays}` placeholder) instead of two hand-written 7s, and `eligibleNote`
  now names the repairable cases instead of counting them.
- **Page `meta` moved into the bank** so `check-copy` walks the browser-tab titles and search
  snippets. `/tentang`'s description was reworded because it hardcoded the entity name.

Ruled to STAY, having been questioned: the domicile in `/tentang`'s operator paragraph (with the
footer address gone it is the only entity-location tie), `sistem klasik Tiongkok`, `delapan komponen`,
the 17+ age floor, `Konsekuensinya jujur kami sebut`, the 14-day deletion window, `Pelindungan`, the
`segera` label on a priced-but-unsellable compat row, the `/syarat` WhatsApp delivery clause, the
launch-price clause, and the recomputation promise. The last three are covered by the LAUNCH GATE, the
LAUNCH_PRICING RUNBOOK and the SUPPORT COMMITMENT notes above.

## DECIDED 2026-08-02 — Stage 3 PHASE 1 landed (fact inventory + badge anchors)

`prompts/D2-stage3.md` + `D2a`, phase 1 of 3. **No scoring, no JSON contract, no required_points** —
those are phases 2 and 3. New: `lib/bazi/badges.js`, `lib/bazi/relations.js`, `lib/semantic/facts.js`,
`lib/semantic/glossary.js`, `tests/badge-anchors.spec.mjs`, `tests/stage3-facts.spec.mjs`.

**Badge anchors: 60/60 reproduced independently**, on Joey's own day pillars, with every table row
exercised. Locked as evidence in `tests/badge-anchors.spec.mjs`.

**Seven detectable badges, not eight.** D2a §"WHAT THIS CHANGES IN D2" says 羊刃 and 空亡 "were already
computed". **Neither existed anywhere in `lib/`** — this is spec error 13, the same shape as error 9 and
in the document that corrected error 9. Both are implemented here and both are legitimate under rule 4,
for reasons that are NOT the same as 華蓋's:
- 羊刃 is written down twice in `docs/` (`engine-session-state.md` line 92, `bazi-blueprint.md` line 223)
  with the same table, and `DI_WANG_BRANCH` in `strength.ts` corroborates it inside the repo — 羊刃 IS
  the yang stem's 帝旺 branch.
- 空亡 is not a table. A 旬 covers ten of the twelve branches; the two it misses are void. The spec
  asserts it structurally over all 60 pillars, not by sampling.
- 華蓋 had a table nobody wrote down, no repo corroboration, and no oracle. It stays descoped and is
  deliberately absent from `badges.js`.

**Four rulings made where D2/D2a were silent or wrong. All four are reversible and all four are tested:**

1. **`provenance` is emitted as STRUCTURED DATA, not prose.** The target file carries it as finished
   Indonesian sentences that exist nowhere in `glossary.json`, so producing them means Stage 3 authoring
   user-facing copy — which D2 forbids and which only Reyner can approve on register. **The sentence
   layer is deferred to Phase 3 as an explicit register-review item.** The data is strictly richer than
   the sentence, so nothing is lost. NOTE while deciding it: the target file's provenance strings use
   *"Dihitung dari pilar harimu"*, and `renderer-prompt.txt` §PROVENANCE IS NOT ARITHMETIC bans exactly
   that phrasing. Whatever ships must not model banned copy.
2. **CR-1 does not fire on balanced charts.** Without the exclusion it fires 9/13, because 8 of 13 are
   balanced and for a balanced chart the engine picks the unfavourable side by whichever is merely less
   scarce — then flags itself `confidence: low` for doing so. Building a reading's emotional core on a
   split the engine already distrusts is what D2 means by a forced tension. With it: 4/13. Carry-forward:
   the fixture has zero `strong` charts, so today this reads as weak-charts-only; re-measure if the
   40/60 thresholds move.
3. **The day stem is excluded from Aspek convergence counting.** It is the self, not a relation to the
   self, and counting it inflates 比肩 by one on every chart ever computed. The target file agrees — it
   reads chart 1's 比肩 as the two hidden 丙, not three.
4. **A void stack counts at most one convergent Aspek per branch (main qi only).** Counting all hidden
   stems made a three-stem branch stack almost automatically: chart 13's void 辰 scored 3 on 戊/乙/癸
   alone, with no badge and no profile source. That is a branch with three hidden stems, not a
   convergence. After the fix, `void_stack` fires on chart 1 only — exactly the exemplar D2 describes.

**Chart 1 vs the hand-written target: all 11 target facts present, 5 extra.** The extras are
`main_profile` (the plain fact under the CR-1 tension, now marked `supersedes`/`superseded_by` so Phase 3
collapses them deterministically), `element_dominant_Water` (the same finding as `officer_convergence`
seen from the element side), `aspek_convergence_食神` and `_偏財` (戊 x2 at qi 0.1 and 庚 x2 at 0.3, both
from the duplicated 巳 — they converge by the letter of the rule and barely at all by presence, which is
why **Phase 2's convergence term must weight by presence, not by position count**), and `badge_空亡`
under the stack. None is a defect; all are the Phase 2/3 dedupe surface.

**TWO MORE TARGET-FILE CORRECTIONS, same class as D2a §4's `lean`.** `provecell-01-USER.json` attributes
七殺 to chart 1 twice — the fact id `spouse_palace_7k`, and `officer_convergence`'s label "Aspek Pengatur
dan Aspek Penantang". **壬 appears nowhere in chart 1**, so 七殺 scores exactly 0 and 正官 scores 100.
Both should be 正官 alone. This is the zero-presence law catching a hand-written file. Fix them in the
Phase 3 commit alongside `lean`/`provisional`.

**Good news on the re-measurement D2a §2 ordered:** the three per-badge frequencies D2 phase 2 actually
reads — Mata Pisau 15%, Tanda Kekosongan 31%, Bintang Penolong 77% — are all **unchanged**. Only the
average moved, 2.5 to 2.15, and only because 華蓋 left the set. Nothing in the extremity term was
silently mis-scored, and the Penolong never-top-3 rule stands on the same 77%. (Those three figures are
cited in `D2-stage3.md` as living in `sharecard-spec.md`; that file carries only the average and the
77%. Minor, noted so nobody hunts for them.)

**Two doc defects found in passing, not fixed here:** the 08-01 ledger entry below calls 華蓋 "Bintang
Cendekia" — the glossary says 華蓋 is **Bintang Sunyi** and 文昌 is Bintang Cendekia. And
`lib/readingView.js` renders Earth as "Bumi" while the glossary says "Tanah"; that surface predates the
glossary and is out of Stage 3's scope, but it is exactly the drift `lib/semantic/glossary.js` derives
its element map to prevent.

## DECIDED 2026-08-02 — Stage 3 PHASE 3 landed (JSON contract + cache key)

`lib/semantic/index.js` + `tests/stage3-contract.spec.mjs` + `scripts/emit-semantic.mjs`.
**Stage 3 is complete.** `engine_version` is `0.4.0-stage3`; bumping it invalidates the whole cache.

**Byte-identity is asserted, not assumed.** Two runs of the same chart produce identical JSON and an
identical cache key, on all 13 charts. That is not tidiness: a reordered key or a float that rounds
differently means a cache miss, a second LLM call, and a second DIFFERENT reading of the same birthdate.
The hash is taken over a key-sorted canonical form so a future refactor cannot silently invalidate the
table; array order still counts, because `facts` is ranked and the ranking is meaning.

**`required_points` is emitted as a STRUCTURED checklist** (`fact_id` + `must_cover`), not as Indonesian
sentences, for the same reason as `provenance` — and one more: a fact-id checklist is the only form
**Stage 6 can validate mechanically.** It can check that a reading covered fact X; it cannot check that
a reading covered a sentence. D2's rule holds either way: every required point has a backing fact, and a
test asserts `must_cover` can only ask for content the fact actually carries. Chart 1 yields 9 points
against the hand file's 8; the extra is `day_master_Fire`, which the target carries as its *first*
required point, so the two agree on coverage and differ only on what counts as a point. **Not included:**
"penutup berupa verdict yang percaya diri" — a style instruction with no backing fact, already in
`renderer-prompt.txt` where it belongs.

**Two collapses, so the renderer never gets the same paragraph twice.** `main_profile` is absorbed by
the CR-1 tension (same glossary entry, same four strings, only the framing differs) and `badge_空亡` by a
void stack that covers every position it hits. Both are recorded in a `qa.facts_collapsed` block rather
than silently dropped. Chart 1: 16 facts in, 14 out. A void badge with no stack over it survives —
asserted on charts 5, 6 and 13.

**`provecell-01-USER.json` CORRECTED** — the fix D2a §4 ordered, plus two more of the same class the
Stage 3 inventory caught:
- `verdict: "lean"` and `provisional: true` deleted. The engine says supportShare 16.5 against a 40
  threshold, which is decisively weak, and `confidence: low` comes from the 半合 root pull, not from
  sitting near a threshold. `confidence_reasons` added. `favorable` needed no change.
- `officer_convergence` was labelled "Aspek Pengatur dan Aspek Penantang" / "Direct Officer & Seven
  Killings". **七殺 is 壬 and 壬 appears nowhere in chart 1**, so 七殺 scores exactly 0 and 正官 scores 100.
  All three Water occurrences are 癸 = 正官. Corrected to 正官 alone.
- `spouse_palace_7k` renamed `spouse_palace` for the same reason: 子 hides 癸, so the seat is 正官.
  The prose never named either god and needed no change.

**THE END-TO-END GATE WAS NOT RUN.** D2's final step is pasting Stage 3's chart-1 output into AI Studio
with `renderer-prompt.txt` and comparing the reading against run 5. That needs an LLM call. The JSON is
generated and paste-ready at **`docs/content/provecell-01-ENGINE.json`** (regenerate with
`node scripts/emit-semantic.mjs 1989-09-13 09:00 --write`). **Predict before running it:** the reading
should be thin exactly where `strength_weak` sits, because that fact is top-3 and carries no
`label_meaning`, `gift` or `cost` for the renderer to cash out. If the thinness is anywhere else, the
JSON is wrong and diffing against `provecell-01-USER.json` will say where.

## DECIDED 2026-08-02 — Stage 3 PHASE 2 landed (hierarchy scoring)

`lib/semantic/hierarchy.js` + `tests/stage3-hierarchy.spec.mjs`. Both D2 non-negotiables hold:
**Bintang Penolong is top-3 on 0 of 13 charts**, and 11 of 13 charts are not quiet.

**NOTHING IS FITTED.** Rule 13 — the scoring logic and the constants that tune it cannot land in the
same commit, or whichever is fitted first absorbs the other's explanatory work. Every constant is in
`HIERARCHY_PARAMS` at a reasoned default, and a test asserts those defaults so that editing them IS the
calibration and needs its own measurement.

**D2's four axes do not rank the spine, so there is a fifth term, and it is flagged as an addition.**
The four always-present facts — Day Master, strength verdict, main profile, spouse palace — are by
construction not extreme, not convergent and not paradoxical. On the four axes alone they sink to the
bottom of every chart, and a reading whose lowest-ranked fact is the Day Master is not a reading. So
`role` is a BASE, not an axis: spine facts start at 55 and the axes move them, findings start at 25 and
must earn their place. The hand-written target does the same thing implicitly, scoring the Day Master at
68 with no axis to justify it.

**Tension is GRADED, not binary.** CR-1 100, void stack 90, 刑 70, 冲 60, spouse palace 50, 害 45. A flat
bonus would let six minor frictions outrank the one real paradox.

**Chart-1 diff against the hand-written file** (D2 asks for this table; exact numbers were judgment
calls and are not targeted):

| target fact | hand | Stage 3 | in hand top-3 | in S3 top-3 |
|---|---|---|---|---|
| strength_lean -> strength_weak | 97 | 78 | YES | YES |
| profile_drains_self -> profile_vs_favorable | 95 | 85 | YES | YES |
| void_month_stack -> void_stack_month | 93 | 100 | YES | YES |
| officer_convergence -> aspek_convergence_正官 | 91 | 70 | - | - |
| wood_missing -> element_missing_Wood | 89 | 70 | - | - |
| peach_blossom -> badge_桃花 | 86 | 65 | - | - |
| nobleman -> badge_天乙貴人 | 80 | 43 | - | - |
| spouse_palace_7k -> spouse_palace | 78 | 70 | - | - |
| metal_half_trine -> relation_半合_巳酉 | 74 | 69 | - | - |
| steward_vs_selfreliant -> aspek_convergence_比肩 | 72 | 44 | - | - |
| day_master_fire -> day_master_Fire | 68 | 55 | - | - |
| *(engine only)* badge_空亡 | - | 59 | - | - |
| *(engine only)* main_profile | - | 55 | - | - |
| *(engine only)* aspek_convergence_偏財 | - | 34 | - | - |
| *(engine only)* element_dominant_Water | - | 31 | - | - |
| *(engine only)* aspek_convergence_食神 | - | 28 | - | - |

**Top-3 set is exact. Spearman 0.81 over the 11 mapped facts.** The one large divergence is Bintang
Penolong, hand 7th of 11 and engine 11th — intended, and the hand file's own note ("never headline it,
77% is not extremity") is the reason.

**The obvious first target for a fitting pass, when one is authorised:** the scale is compressed and ties
at exactly 70 are common (chart 3 has three). Ties break deterministically on emission order, so the
cache is safe, but the ordering among them is arbitrary rather than editorial. Second target: branch
relations float to the top of quiet charts because each type is individually rare, which may be right and
has not been checked against anything.

## DECIDED 2026-08-02 — archetype names, fixed tags, EN display layer

**The 10 archetype names are LOCKED** in `glossary.json` → `arketipe` (was `arketipe_kandidat`):
Jati, Bambu, Matahari, Api Unggun, Gunung, Taman, Besi Tempa, Permata, Samudra, Embun — each with a
`name_en` pair (The Teak, The Bamboo, The Sun, The Bonfire, The Mountain, The Garden, The Forge,
The Jewel, The Ocean, Morning Dew). Beringin was rejected on political association. Jati is Reyner's
own pick — premium heirloom wood, classical 甲, and the *jati diri* pun self-demonstrates the product.

**The 30 fixed sharecard tags are LOCKED** in `glossary.json` → `tag_arketipe`. 3 per archetype, all
30 distinct, title-case stored, uppercase rendered. `tags_en` pending an EN register pass.

**EN display layer scoped:** names + tags + card strings only; the reading body stays Indonesian.
Rule 23 amended: brackets convention is reading-prose only; the sharecard never shows brackets.

**COMPAT FLOW — RECONCILED AND DECIDED** (review trail: `archive/compat-flow-REVIEW.md`; the spec
body `product/compatibility-reading-spec.md` is corrected in place and is now buildable):
- Funnel: enter B → **P0 tease FREE** (two faces + ONE named relational fact, zero explanation;
  comparison card shareable pre-payment — it is compat's own acquisition engine) → paywall → P1-P8.
- **Account + email created at first compat checkout.** The mirror stays anonymous — no login wall
  (Joey's front-door login serves his lead-gen model, not ours). The account owns the chart address
  book that P8's loop accumulates. Per-account rate limits on top of rule 19.
- **No consent line for person B** (Reyner, deliberate): the reading is anonymous and does not
  affect B; the P2 reframe copy carries the ethics alone.
- **P6 Luck Pillar sync DESCOPED from v1** (rule 25 edge + optional gender + no female-set fixture).
  Timing lives in the annual product later.
- **P5 affinity/fit quadrants KEPT as a documented Katon ruling** — deterministic rule to be written
  before implementation; no classical authority claimed for the 2x2 itself.
- Pricing: **visible "harga peluncuran" cohorts, never silent A/B** (screenshot culture). List/launch
  numbers to be set in launch-decisions.md; band stays 25-45k tested.
- Engine additions inventoried for a future Prompt E (cross-chart relations, spouse-palace hits,
  cross-chart complementarity with strength_confidence, quadrant rule, pair cache). No plotter
  oracle exists for the pair layer; relation tables are already test-locked, pair-level rules are
  Katon rulings and must be written in docs before implementation.

**CARD VISUAL SYSTEM — direction and layout DECIDED** (same day, mockup trail in
`content/sharecard-mockups-01.html` and `-02.html`; detailing/polish deferred, Reyner will tinker):
- Direction: **typographic poster.** Colour field + one geometric mark per archetype + typography.
  **No watercolour — the 10 commissions are CANCELLED**, the parked item is dead, and "paintable"
  drops out of the naming criteria. One typeface: **Archivo variable** (wght x wdth, SIL OFL).
- Card A: flat colour field, mark top, name/Aspek/6 tags/verbatim hook/badges/footer. Indonesian.
- Card B: taller ratio, gradient field, ghost mark background, content bottom-anchored,
  **head in EN (name_en) + Aspek in Indonesian**, appendix band with animal-element row + element
  bars, "Complete Edition" chrome. The classical EN Aspek terms (Direct Wealth etc.) are
  bracket-terms only, NEVER display copy.
- **Hanzi: card images carry NONE; the 4x2 hanzi grid lives in the PDF chart sheet only**
  (CONFIRMED by Reyner 08-02). Rule 23's legitimacy object survives in the PDF; no amendment needed.
- **EN header on BOTH cards** (Reyner 08-02), Aspek Indonesian everywhere. The ID/EN A/B is dead.
  ~~OPEN: EN-only, or tiny ID eyebrow~~ → **CLOSED 08-03: EN-only, no eyebrow.** See the 08-03 section.
- **Footer carries gender + birthdate + katon.app.** Gender is optional in the engine; null gender
  = date + source only. ~~PEREMPUAN/LAKI-LAKI strings are proposals pending register~~ →
  **APPROVED 08-03.**
- ~~**Sizes PROPOSED, pending Reyner: Card A 1080x1350 (4:5 feed), Card B 1080x1920 (9:16 full
  story).**~~ → **SUPERSEDED 08-03. Card A is a 63:88 card object on a 3:4 1080x1440 canvas;
  Card B 1080x1920 unchanged.** See the 08-03 section.
- Card B carries the hook (spec: everything on A plus appendix); appendix = labeled pillar grid
  (Tahun/Bulan/Hari/Jam, animal + element) + labeled element bars + Complete Edition chrome.
- Colour tokens fixed for 5 of 10 archetypes; remaining 5 to derive (Api Unggun must not collide
  with Matahari). tags_en remains open. **STATUS 08-03: both are WITH REYNER for review** — the
  5 tokens as a swatch preview (measured against the locked 5, Api Unggun clears Matahari at
  dE 0.29 where the set's existing floor is 0.09) and `tags_en` as a 30-row register table.
  Nothing written into `glossary.json` or the mockup until he approves.

**The 刑 glossary entry is REGISTER-APPROVED and landed** in `glossary.json` → `relasi_cabang.刑`.
"Simpul" confirmed (Belitan considered, not taken). `label_meaning` rewritten to drop the banned
negation-contrast construction. name_en stays "Punishment" per the Seven Killings precedent —
classical EN term in brackets for legitimacy; the Indonesian does the reframing. D2a §3 marked landed.

Decision trail: `docs/content/archetype-tags-REVIEW.md` (now superseded; move to `archive/` after
commit). Together with the 刑 approval this closes 3 of the 5 Reyner-blocked items in COWORK-BRIEF §6.

## DECIDED 2026-08-01 — mechanic scope, and one thing deferred to a later product

**刑 (Punishment) ADDED: self-punishment, full trine, and the 子卯 pair. Partial TRINES excluded.**
(Wording corrected 2026-08-02: the earlier "self and full trine only" omitted the 子卯 pair, which is
a distinct two-branch type, implemented and locked in `tests/punishment.spec.mjs` — not a partial.)
The only mechanic in the set that
describes self-inflicted friction; everything else is either external pressure or a carried badge.
Measured frequency: 自刑 alone 4/13 (31%), full 三刑 0/13, partial trines would push it to 7/13 (54%)
and destroy the signal. Partials excluded.

**Life Palace and Conception Palace ADDED as DISPLAY ONLY.** On every Joey chart, so absence is
noticeable. No interpretation: 命宮 requires the birth hour and is blank for a large share of users,
and both are effectively extra pillars whose interpretation would open a whole new surface.

**華蓋 (Bintang Cendekia) DESCOPED 2026-08-01.** Joey's plotter prints exactly five natal stars — 貴人,
文昌, 桃花, 驛馬, 孤辰 — and 華蓋 is not among them. It was added by Claude, not by the oracle, so under
rule 4 there is no way to verify an anchor for it. The glossary entry stays, marked not-detectable.
This is spec error 10.

**寡宿 (Widow Star) REJECTED.** Not on gender grounds — Reyner ruled the product serves both genders.
Rejected because "you will be alone" is structurally a prediction about future relationship status,
which rule 22 bans, and 孤辰 already covers the psychological ground without the claim.

**破 (Break) REJECTED.** Real, rarely load-bearing, and every added mechanic costs surface area.

**Badge scarcity is a product constraint, not an aesthetic one.** Measured with the current 6-star set:
avg 2.5 badges per person, range 1-4, none universal. That distribution is what makes "which do you
have?" a real question, which is the comparison mechanic that makes a card spread. Adding stars toward
the classical maximum would put everyone at 8 badges and kill it.

**GENDER field added (optional, null default).** Affects luck pillar direction only — forward for
yang-year males and yin-year females, reverse otherwise. Natal chart, Ten Gods, strength, badges,
palaces and compatibility are all gender-independent.
**Carry-forward:** every chart in `engine/joey-bars-13.json` was collected with Joey set to MALE. Fine
for natal bars. But the **annual reading** and **luck-pillar map** both read luck pillars, so those
products will need female-set fixture charts to validate against.

## RESOLVED — stop reporting these as open (2026-08-01)
- **Migration `0006_render_cache.sql` is APPLIED in Supabase (2026-08-02).** Run in the SQL editor,
  `render_cache` verified present via `information_schema.tables` (screenshot evidence, Cowork
  session 08-02); RLS enabled with no policies per the migration itself. The result cache is real —
  no more silent in-memory degrade. Do not flag again.
- **Migration `0005_sku.sql` is APPLIED in Supabase (2026-08-02).** Run in the SQL editor, column
  verified present by `information_schema.columns` query returning `sku` (screenshot evidence,
  Cowork session 08-02). `main` is deploy-safe for the Prompt F payment commits. Do not flag again.
- **The 6 test rows in the live `reading` table are DELETED.** Removed manually via the Supabase SQL
  editor; `select count(*)` confirmed at 24. Do not flag again.
- **`tests/tools/solar-term-oracle-diff.mjs` was deleted deliberately.** It was a prototype;
  `tests/solar-terms.spec.ts` supersedes it with real scraped HKO data and CI wiring. Two copies of
  the same oracle is the bug `docs/README.md` warns about. Not an accident, not to be restored.
- **Migration `0003_term_side.sql` is APPLIED in Supabase.** Column verified present. `main` is
  deploy-safe.
- **RLS on `public.reading` verified:** `relrowsecurity = true`, zero policies. That is the correct
  secure default — service role only. The whole model rests on the service-role key never reaching
  the browser. If a Supabase call is ever moved client-side it will silently return nothing; do NOT
  "fix" that by adding a permissive policy.

## OPEN / TODO (priority order, revised 07-30 evening)

1. **STRENGTH ENGINE** — un-parked, ~2 weeks. 得令/得地/得生/得勢, follow-chart (從格) as a strict
   high-threshold gate, `strength_confidence` on edge charts. Validate against **both** oracles:
   the strong/weak verdict AND Joey's bar rank-order, across the 13-chart fixture. Method spec in
   engine/engine-session-state.md (project knowledge). **Gates: compat, annual reading, luck-pillar
   map, career verdicts, all element-based actionables.**
2. **THE GLOSSARY** — ~64 entries, 2–3 sentences each. Replaces the ~78 prose modules; different
   shape entirely. Names are LOCKED in content/glossary-naming.md. Write each `label_meaning` as a
   **felt experience, never a definition** — that rule fixed the two "hard to understand" defects in
   run 3. **Leverage: these badges are also the sharecard tags. One glossary serves card + reading.**
3. **Calculator swap** — Prompt A in engine/calculator-decision.md. One session, deletes ~200 lines of
   liability. Then commit Phase 1 (message in §6), then Prompt B regression lock (CI only;
   `tests/tools/solar-term-oracle-diff.mjs` drops straight in).
4. **Stage 3** (hierarchy + semantic JSON in the four-field shape: provenance / label / label_meaning /
   gift / cost / palace / actionable) and **Stage 6** post-validation.
   **Renderer measurement note (2026-08-02, CLOSED same day):** the harness exists (Prompt H) and
   ran. `gemini-2.5-flash-lite` is RETIRED — HTTP 404 "no longer available to new users" (so is
   2.0-flash-lite); the down-market rider question is dead by market action, not by measurement.
   Substituted rider: `gemini-3.5-flash-lite` (the only other live lite arm), pending Reyner's
   ratification — the question inverted from "move down?" to "move up?". At n=39 the arms are
   indistinguishable on aggregate (run variance band ~8 points) but fail DIFFERENTLY per-check:
   3.5 drops palaces 2x more, 3.1 hedges 4x more. Blind judging decides which failure reads worse.
   The model+prompt_version metadata proposal SHIPPED with G/H.
   Stage 6 must mechanically catch what the runs exposed: tension-collapse vocabulary
   (*menyatu / selaras / saling melengkapi / identitas utuh*), invented specificity, dropped `cost`
   strings, and schema-order slot-filling.
5. Sharecard visual system + the paid hi-res card / PDF artifact + the **gift SKU** (cheapest new
   product you have — same reading, different checkout).
6. Ship the free mirror. Distribute on IG. **Measure share rate and 19k take rate** — the two numbers
   every downstream decision depends on.
7. **COMPATIBILITY** — the money engine. Price band 25–45k, TESTED, not 80–99k by intuition.
8. **Start Xendit KYC now** (bank account is in hand) — external latency, background it. Stick with
   Xendit, not Mayar: PT KATON on the checkout is a real trust advantage.
   **STATUS 2026-08-03:** activation was REJECTED (ticket 2686100) on two grounds. KBLI mismatch is
   MCS Consulting's. The website criteria are DONE in code — see the 08-03 section above — and now
   wait on (a) Reyner's string approval, (b) merge and deploy, (c) the dummy-account walkthrough for
   the reviewer, which is an ops task and was never in scope for the code prompt.

### Reading format — SETTLED 07-30 (three live runs against Gemini Flash)
- **CR-5 IS LIFTED.** "Lemah" and "kuat" are permitted as consumer words. Finding from Keynan's
  Gemini reading: the friction *"what do you mean I'm weak?"* IS beat 2 of the loop, and it pulls the
  reader into beat 3. Euphemism prevents the question and costs you the reader.
  **Condition: the explanation lands in the same breath, never a sentence later.** And never bare on
  the sharecard, where there is no room for beat 3 — a blunt label without resolution is an insult
  with a citation. Rule is in content/renderer-prompt.txt §"NAME IT PLAINLY".
- **The move: provenance → name → cash-out.** Cash-out has two halves, both required: the general
  meaning of the name, then the specific consequence for this person. Never stop after the general half.
- **Braided blocks must converge.** After separate cash-outs, one or two sentences on what it means
  that these things sit together. This is what rescues a fact that read as obscure alone.
- **Naming: Indonesian name, English in brackets once, no Chinese characters.** Aspek = internal
  disposition, Bintang = external marker. Full table in content/glossary-naming.md.
- **Penutup is a confident verdict.** No rhetorical questions, no reflection prompts.
- **`label_meaning` describes a felt experience, never defines a concept.** Abstraction is the failure mode.
- Renderer prompt: **`content/renderer-prompt.txt`** is the single source of truth. content/renderer-prompt-notes.md
  is documentation only.

## PARKED (deliberately, until real signal)
- ~~Strength engine~~ **UN-PARKED 07-30 — it is now TODO #1.** It gates compat, the annual reading,
  the luck-pillar map, career depth, and every element-based actionable.
- ~~Paid compatibility~~ **UN-PARKED — it is the v1 money engine.** Ships after the mirror acquires.
- The ~78 prose modules → **superseded by the ~64-entry GLOSSARY.** Different shape, see TODO #2.
- 3-way / household synthesis. Highest LTV, heaviest ethics, do it last and do it right.
- Annual reading, luck-pillar map, parent→child — real products, sequenced in product/paid-product-map.md.
- 10 bespoke watercolour illustrations — **growth-blocking, not learning-blocking.** Ship to a small
  cohort without them; commission in parallel; add before any real push.

---

## STILL TRUE (carried, not re-litigated)
- Methodology: 旺衰法, Joey Yap as ground-truth oracle. Pure BaZi only — Weton/Javanese removed entirely.
- Exactly 10 archetypes, one per Day Master. The archetype IS the coherence spine.
- Ethics: no fatalism, no prophecy, no caste-ranking of gods/strength; timing = "cuaca". Heavier for 3-way.
- Deterministic FACTS. Only PROSE is LLM-rendered-then-frozen. Same-birthday-same-reading via cache.
- Boundary charts (節氣 edge, 子 hour) → flag for QA, read softly. At ±2 min no method is authoritative.
- Stack: Next.js 15, Supabase, Vercel (Renge13/Katon, main). Xendit QRIS. Domain katon.app.
- Renderer principle: engine emits ranked facts + required content points; the LLM arranges FREELY;
  Stage-6 validates content COVERAGE, never structural conformance. No fixed templates.
- PR discipline: each PR independently reviewable and revertable. No infra in content PRs.
- Reyner is the sole authority on Indonesian register. Claude defers and flags.

## SUPERSEDED (ignore in older notes — this section wins)
- "No runtime AI" → reversed for the RENDERING layer only.
- "Hand-author the reading cells / FINAL.md string tables" → replaced by engine-JSON → LLM render.
- **"sxtwl is the designated calc library"** → retired as a runtime dep; tyme4ts is the calculator.
- **"Timezone/LMT is an open question gating the engine"** → CLOSED. Naive wall-clock, confirmed
  empirically against Joey 07-30.
- **"Free mirror has no paid object attached"** → superseded by the optional 19k hi-res card + PDF.
- **"Ship the free mirror in 5–7 weeks after the strength engine"** → superseded by CARD-FIRST,
  2–3 weeks, engine parked.
- **"Author all ~78 modules before launch"** → superseded by the **~64-entry GLOSSARY**: one
  `label_meaning` per badge, written once, reused by everyone who carries it. Chart-specific text
  lives only in `gift`/`cost`/`actionable`. Not bespoke prose.
- **"Park the strength engine / cut compat from v1"** (proposed midday 07-30) → **REVERSED same day.**
  The engine gates compat, annual reading, luck-pillar map and career depth. Compat is the money engine.
- **"Voice = casual old friend"** → DEAD, killed by research/coldread-analysis.md. One composed voice
  everywhere. Any note claiming the registers coexist is wrong.
- **"10 Dewa" as the name for 十神** → banned. *Dewa* reads as a Hindu deity to a Muslim-majority
  audience. It is **Sepuluh Aspek (Ten Gods)**. Market risk, not a translation nicety.
- **"Seven Killings" rendered literally** (*Tujuh Pembunuh*) → banned. It is **Aspek Penantang
  (Seven Killings)**.
- "The café/stranger test is the one gate" → the cold-read walkthrough already surfaced the failure.
- "Portrait-first vs domain-first" → RESOLVED: no domain gate; pillars ARE the domains positionally.
- "The test-ungate flag is the mechanism for a free mirror" → the mirror is ungated BY DESIGN now.
  Remove `NEXT_PUBLIC_FREE_FULL_READING` from Vercel; do not let a test flag become the architecture.
