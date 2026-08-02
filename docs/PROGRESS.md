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
- `prompts/D2-stage3.md` .............. CURRENT. Stage 3 hierarchy scoring + semantic JSON.
- `prompts/D2a-stage3-anchors.md` ..... CURRENT ADDENDUM. **Overrides D2 where they conflict.**
                                         Verified badge anchor tables, 華蓋 descoped, 刑 glossary entry,
                                         two contract corrections.

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
- `content/provecell-01-*` ............. renderer test kit + fixture + rubric.
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
| Solar-term boundaries, day-level | 0 disagreements / 1212 | 07-30 | three oracles |
| Joey #1 element distribution | Earth 5, Fire 4, Wood 3, Metal 1, Water 0 | 08-01 | from full ten bars |
| **Badge anchors vs Joey's printed stars** | **60/60** | 08-01 | 貴人 文昌 桃花 驛馬 孤辰 across 12 charts. **Every table row exercised** — 10/10 day stems, 4/4 trine groups, 4/4 season groups. Tables in `prompts/D2a-stage3-anchors.md`. |
| Badge anchors, YEAR-pillar alternative | 0/12 桃花, 0/12 驛馬, 1/12 孤辰 | 08-01 | the day-pillar ruling is not marginal |
| Badge frequency (avg per chart) | 2.5, range 1-4 | 08-01 | **STALE — measured with a candidate 華蓋 table that is now descoped.** Re-measure in D2a Phase 1; Phase 2's extremity term reads this. |
| Bintang Penolong frequency | 77% | 08-01 | **STALE for the same reason.** Re-measure from the verified anchor. |

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
- **Hanzi removed from the Card B image** (Reyner 08-02). OPEN FLAG: the 4x2 hanzi grid should move
  to the PDF chart sheet so rule 23's legitimacy object survives — awaiting confirmation; if the PDF
  also drops it, rule 23 needs a conscious amendment.
- Colour tokens fixed for 5 of 10 archetypes; remaining 5 to derive (Api Unggun must not collide
  with Matahari). tags_en and the ID/EN A/B remain open; Card B carrying the EN head may settle it.

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
   **Renderer measurement note (2026-08-02):** when Stage 5/6 quality is first measured, the primary
   number is Stage-6 pass rate + provecell rubric on `gemini-3.1-flash-lite`. Run a
   `gemini-2.5-flash-lite` arm as a RIDER in the same batch and have Reyner blind-judge pairs; switch
   the free tier only if indistinguishable. Cost is NOT the driver (~$2 per 1k readings, capped by the
   result cache) — do not make this its own project. Proposal riding along: store `model` +
   `prompt_version` as metadata on cached reading rows so flagged readings are attributable.
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
