<!--
STATUS: LIVE — session-resume file. READ THIS FIRST in any new session.
UPDATED: 2026-07-14 — MAJOR PIVOT. Hand-authored content -> deterministic engine + LLM renderer.
UPDATED: 2026-07-29 — ENGINE FOUNDATION. Phase 1 built & validated. resolveState found not to be a
         strength model. Joey's element bars found to BE a strength distribution.
UPDATED: 2026-07-30 — CALCULATOR CLOSED + STRATEGY RESET. sxtwl retired in favour of tyme4ts
         (measured equivalent). Time convention empirically pinned against Joey. Launch strategy
         changed to CARD-FIRST; strength engine / 78 modules / paid compat all PARKED. New revenue
         model: free mirror + optional paid hi-res card & PDF (no gate). See SUPERSEDED at bottom.
PURPOSE: single source of "what's decided / what's next". The SUPERSEDED section wins any conflict.
-->

# Katon — PROGRESS Ledger

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
KATON-coldread-analysis.md, first line: *"The copy is not the problem. Coherence is."*) was never
accuracy — nobody has ever complained the math was wrong.

**REVISION, same session.** The mid-session call to park the strength engine and cut compat from v1
is **REVERSED**. Reyner: compat is the v1 money engine, no compromise. And the stronger reason:
**the strength engine is not the compatibility tax — it gates almost the entire paid catalogue**
(compat, annual reading, luck-pillar map, career depth). Four revenue lines behind one ~2-week build.

The sequencing constraint still holds and is not either/or: **you cannot sell compat to nobody.** It
needs a second birthdate, so the free mirror must ship and acquire first. Therefore: build the engine
**in parallel** with mirror content authoring. Mirror in ~4–5 weeks, compat shortly after.

---

## DETAIL FILES (pull as needed)
### CLAUDE CODE HANDOVER PROMPTS — run in this order
- **KATON-prompt-A-calculator-swap.md** ... 1st. tyme4ts swap + time-convention lock. Then commit Phase 1.
- **KATON-prompt-B-regression-lock.md** ... 2nd. CI-only solar-term oracle. Harness already written.
- **KATON-prompt-C-strength-engine.md** ... 3rd, TODO #1, ~2-3 sessions. Gates the whole paid catalogue.

### Other detail files
- **KATON-renderer-prompt.txt** .. THE Stage-5 system prompt. Single source of truth. Paste this.
- **KATON-glossary-naming.md** ... LOCKED naming: Sepuluh Aspek, the 10 Aspek, the Bintang badges,
                                the palaces, and the felt-not-defined rule. **Read before authoring content.**
- **KATON-paid-product-map.md** .. the full paid surface, ranked. Annual reading + parent→child are
                                the two products not previously counted. **Read for roadmap/pricing.**
- **KATON-provecell-01.md** ...... the renderer test kit + rubric. `provecell-01-USER.json` is the fixture.
- **KATON-master-prompt.md** ..... documentation of the renderer prompt + what the 3 live runs proved.
- **KATON-launch-decisions.md** ... 07-30. Pricing, the paid-PDF upsell, competitor teardown
                                (imajidiri), abuse/cost math. NOTE: its "park compat / card-first"
                                recommendation was REVERSED later the same day — see this file's
                                STRATEGY RESET and TODO. **Read for launch work, not sequencing.**
- **KATON-calculator-decision.md** . NEW 07-30. Calculator + time convention, CLOSED. Contains the two
                                copy-pasteable Claude Code prompts (A = swap, B = regression lock).
- solar-term-oracle-diff.mjs ..... runnable triple-oracle boundary diff. Drop in `scripts/`. Passes.
- KATON-pipeline-spec.md ......... THE build spec. 7 stages, failstates, fallback, payload, cache. CURRENT.
- KATON-coldread-analysis.md ..... why the drafts failed (6 root clusters). Still the QA rubric. CURRENT.
- KATON-mechanism-inventory.md ... what facts the chart can yield + which are real personalization axes. CURRENT.
- KATON-engine-session-state.md .. engine build state. Still valid for the strength engine, but that
                                work is now PARKED — read only when un-parking.
- katon-bazi-blueprint.md ........ feature map, pull-power, coherence rules CR-1..6. Read for reading-gen.
- KATON-master-prompt.md ......... **~60% STALE, 3 direct contradictions with locked rules. FIX BEFORE USE.**
- KATON-compatibility-reading-spec.md . good, but PARKED (v2).
- KATON-full-mechanism-architecture.md . STALE PREMISE ("same complete reading as a master") — that is
                                the rabbit-hole thesis we just rejected. Do not build from it.
- KATON-calcdump-CxD.md, KATON-helper-brief.md, KATON-design-prompt.md ... superseded (pre-pivot era).

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
Rows 1–12 in KATON-engine-session-state.md. Added 07-30 from Joey PDF:
```
13  1989-02-04 04:00 | 乙 | 丑 | 比肩 | Managers | Friend80/Phil80/Dir78/Pio72
```
Boundary chart, and a **fourth** instance of the intended Katon-vs-Joey divergence (丑 hides 辛己癸 —
no 比肩 anywhere, so no month-rooting rule can emit Joey's headline). Track A at 7/12 is CORRECT.

---

## PRODUCT / FUNNEL — DECIDED
- **FREE = the full mirror, ungated.** Acquisition + willingness-to-pay engine, NOT a revenue line.
- **NEW (07-30): optional paid hi-res card + packaged PDF report, ~19k.** Offered AFTER the free
  reading has landed and the sharecard is in hand. **It is an upsell, never a gate.** Refusal costs
  nothing — they still share. Take rate is the pricing evidence we currently lack. Rationale and the
  rejected alternatives are in KATON-launch-decisions.md.
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
  **The casual "old friend" register is DEAD** — killed explicitly by KATON-coldread-analysis.md §"THE
  VOICE DECISION": *"drop the casual old-friend register entirely… that reaction was caused BY the
  casual front door."* The ultra-casual front door was creating doubt about legitimacy before the user
  saw any value. Any note claiming the two registers coexist is wrong; the cold-read is the later
  decision and it wins.
- Ten Gods: classical concepts in plain Indonesian. **Never** Joey's trademarked profile names
  (Director/Diplomat/Warrior are his IP). Locked display names in KATON-engine-session-state.md.
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

## OPEN / TODO (priority order, revised 07-30 evening)

1. **STRENGTH ENGINE** — un-parked, ~2 weeks. 得令/得地/得生/得勢, follow-chart (從格) as a strict
   high-threshold gate, `strength_confidence` on edge charts. Validate against **both** oracles:
   the strong/weak verdict AND Joey's bar rank-order, across the 13-chart fixture. Method spec in
   KATON-engine-session-state.md (project knowledge). **Gates: compat, annual reading, luck-pillar
   map, career verdicts, all element-based actionables.**
2. **THE GLOSSARY** — ~64 entries, 2–3 sentences each. Replaces the ~78 prose modules; different
   shape entirely. Names are LOCKED in KATON-glossary-naming.md. Write each `label_meaning` as a
   **felt experience, never a definition** — that rule fixed the two "hard to understand" defects in
   run 3. **Leverage: these badges are also the sharecard tags. One glossary serves card + reading.**
3. **Calculator swap** — Prompt A in KATON-calculator-decision.md. One session, deletes ~200 lines of
   liability. Then commit Phase 1 (message in §6), then Prompt B regression lock (CI only;
   `solar-term-oracle-diff.mjs` drops straight in).
4. **Stage 3** (hierarchy + semantic JSON in the four-field shape: provenance / label / label_meaning /
   gift / cost / palace / actionable) and **Stage 6** post-validation.
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
  with a citation. Rule is in KATON-renderer-prompt.txt §"NAME IT PLAINLY".
- **The move: provenance → name → cash-out.** Cash-out has two halves, both required: the general
  meaning of the name, then the specific consequence for this person. Never stop after the general half.
- **Braided blocks must converge.** After separate cash-outs, one or two sentences on what it means
  that these things sit together. This is what rescues a fact that read as obscure alone.
- **Naming: Indonesian name, English in brackets once, no Chinese characters.** Aspek = internal
  disposition, Bintang = external marker. Full table in KATON-glossary-naming.md.
- **Penutup is a confident verdict.** No rhetorical questions, no reflection prompts.
- **`label_meaning` describes a felt experience, never defines a concept.** Abstraction is the failure mode.
- Renderer prompt: **`KATON-renderer-prompt.txt`** is the single source of truth. KATON-master-prompt.md
  is documentation only.

## PARKED (deliberately, until real signal)
- ~~Strength engine~~ **UN-PARKED 07-30 — it is now TODO #1.** It gates compat, the annual reading,
  the luck-pillar map, career depth, and every element-based actionable.
- ~~Paid compatibility~~ **UN-PARKED — it is the v1 money engine.** Ships after the mirror acquires.
- The ~78 prose modules → **superseded by the ~64-entry GLOSSARY.** Different shape, see TODO #2.
- 3-way / household synthesis. Highest LTV, heaviest ethics, do it last and do it right.
- Annual reading, luck-pillar map, parent→child — real products, sequenced in KATON-paid-product-map.md.
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
- **"Voice = casual old friend"** → DEAD, killed by KATON-coldread-analysis.md. One composed voice
  everywhere. Any note claiming the registers coexist is wrong.
- **"10 Dewa" as the name for 十神** → banned. *Dewa* reads as a Hindu deity to a Muslim-majority
  audience. It is **Sepuluh Aspek (Ten Gods)**. Market risk, not a translation nicety.
- **"Seven Killings" rendered literally** (*Tujuh Pembunuh*) → banned. It is **Aspek Penantang
  (Seven Killings)**.
- "The café/stranger test is the one gate" → the cold-read walkthrough already surfaced the failure.
- "Portrait-first vs domain-first" → RESOLVED: no domain gate; pillars ARE the domains positionally.
- "The test-ungate flag is the mechanism for a free mirror" → the mirror is ungated BY DESIGN now.
  Remove `NEXT_PUBLIC_FREE_FULL_READING` from Vercel; do not let a test flag become the architecture.
