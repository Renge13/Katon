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
UPDATED: 2026-08-05 — XENDIT REJECTION 2. `NEXT_PUBLIC_FREE_FULL_READING` removed from the codebase;
         the paywall renders again. INTERIM STATE FLAGGED: this re-enables the legacy 19k deep-read
         gate, and the Xendit account is in TEST MODE so Vercel holds a test key - LIVE keys must be
         generated and swapped before any real transaction. Fulfillment swap is the next build
         priority after submission. Read that section before touching the paid path.
         COPY SET ALIGNED same day: invoice, /harga and /tentang all say `Bacaan Mendalam`, the name
         the funnel already used. The card + PDF copy returns wholesale at the fulfillment swap.
UPDATED: 2026-08-06 — `harga.meta.description` closed, the last surface carrying the dead claim.
         Every copy surface now names Bacaan Mendalam.
UPDATED: 2026-08-13 — THREE REGISTERS ADDED AT THE TOP, and the 08-05 interim CLOSED. LIVE STATE
         answers "what does a real user get today" in one table; THE INTERIM REGISTER gives every
         temporary divergence an end condition and an owner; THE DEFERRED REGISTER lists what was
         ruled OUT of the swap package. Cause: a Cowork session argued the business model for two
         rounds against a model that was already live. Reyner ruled the 7-beat deep read RETIRED and
         the locked free-full-mirror model restored; mirror promotion precondition 2 re-ruled to
         match, in both places it lives.
PURPOSE: single source of "what's decided / what's next". The SUPERSEDED section wins any conflict.
         For "what SHIPS", read LIVE STATE at the top — it is the only section that answers that, and
         it is the one a product argument needs first.
-->

# Katon — PROGRESS Ledger

> **New session?** Claude Code starts at `NEXT.md`. Cowork starts at `COWORK-BRIEF.md`.
> Both after `../CLAUDE.md`. Brief yourself from the repo, never from memory or a summary.
> **`D:\Work\Katon assets\Katon md` is a STALE MIRROR — do not read it.** It still carries the
> rejected Aspek names (Setara, Karya, Pijar, Peluang) and a PROGRESS.md with no decisions in it.

---

## LIVE STATE — what a real user gets TODAY (verified 2026-08-13)

**Read this before advising on the product, and before arguing about the business model.**
`CLAUDE.md` describes the TARGET. This block describes what the deployed code actually does. They
diverge, and every other section of this file is about how we get from one to the other.

| Surface | What a real user gets today | Served by | Gate |
|---|---|---|---|
| Free reading | Archetype + modifier, day master (element/polarity/hanzi), four pillars, 胎元, five element bars, three prose sections (`siapaKamu`, `kenapaBegini`, `keMana`), one teaser lead | `contents/*hubungan*.md` -> `scripts/build-content.mjs` -> `lib/content/<archetype>.js`. **No LLM, zero provider calls** | none, ungated |
| Sharecard | Downloadable PNG of the same free content | same | none |
| **Bacaan Mendalam, Rp 19.000** | The **7-beat deep read** (`paidContent.beat1..beat7`) + the paid pillar recap and post-pay hour door | **the same `contents/*hubungan*.md` cells**, `getPaidDomain(stem, state, domain)` | **PAYWALL.** `row.paid === true`, flipped only in the verified Xendit webhook |
| Karier / Uang | Nothing. A "Segera" row that captures a WhatsApp number (`interest_wa`) | no content exists — every file in `contents/` is `*-hubungan-FINAL.md` | n/a |
| Compatibility | Nothing. Not purchasable | not built | `compat` is priced (45.000/29.000) and **absent from `SELLABLE_SKUS`**, so checkout 400s |
| **The new pipeline** (`/api/mirror`) | **Nothing. It serves no user.** Engine semantic JSON -> Gemini -> Stage 6 -> `render_cache` | Stage 3-6, `docs/content/glossary.json` + `renderer-prompt.txt` | **FENCED.** 404 unless `MIRROR_PREVIEW_TOKEN` is set AND presented. Linked from nowhere |
| Sharecard (the one that exists) | A 9:16 poster: legacy archetype name, modifier, element tag, one literary line, feed/drain columns, `katon.app` | `components/Sharecard.jsx` from `lib/content` — the SAME legacy cells | none, ungated |
| **Card A / Card B** (built 2026-08-13, iterated same day) | **Nothing. Wired to no route and no component.** Renders only into `reports/card-preview.html` via `npm run preview:cards` | `lib/card/` + `components/cards/Card.js`, from `glossary.json` + Stage 3 facts | **NOT SHIPPABLE YET, for three reasons:** five of ten colour tokens are unapproved; its archetype names disagree with the reading's (see below); and nothing loads Archivo, its ruled typeface, outside the preview page |
| Static pages | `/harga` `/tentang` `/privasi` `/syarat` `/pengembalian` + footer | `lib/site/copy.js` | none |

**The one-line summary: every word a real user reads today comes from `contents/*hubungan*.md`.**
The new pipeline — the engine, the glossary, the renderer, the Stage-6 gate, every measurement in the
MEASUREMENTS table below — has never served a single reader.

**Two divergences from the locked model, both live:**

1. **FREE IS NOT THE FULL MIRROR.** `CLAUDE.md` says free is the full mirror and paid is "an upsell
   offered AFTER the free reading lands, never a gate." What actually happens is that the 7-beat
   deep read sits behind the Rp 19.000 wall. The gate is back. It has been back since 2026-08-05 and
   the reason is in THE INTERIM REGISTER below. **Reyner ruled the revert to the locked model on
   2026-08-13**; nothing has shipped yet.
2. **NOT ONE CELL IS FOUNDER-VALIDATED, AND A PAYING CUSTOMER RECEIVES THEM.** Counted 2026-08-13,
   `contents/` holds 20 files, all `*-hubungan-FINAL.md`. `grep -l "pending founder" contents/*.md`
   returns **16** — e.g. `akar-amplified-hubungan-FINAL.md:3`, *"STATUS: LIVE (helper-PRIMARY, Claude
   structure+register-fix; pending founder validation)"*. Of the remaining four, three are stamped
   **SCAFFOLD, pre-validation** (`akar-balanced:2`, `jati-balanced:2`, `pedang-balanced:2`) and
   `matahari-balanced` carries **no STATUS header at all**. The only two files containing the word
   `VALIDATED` (`gunung-balanced:18`, `samudra-amplified:18`) use it about one inline fix and both
   also carry `pending founder validation` in their own STATUS line. **Zero founder-validated cells,
   free or paid.**
3. **TWO ARCHETYPE NAME SETS ARE LIVE IN THE REPO, and they disagree on five of ten.** Found
   2026-08-13 while building the card. The legacy path a user reads today
   (`grep -n archetypeName lib/content/*.js`) says **AKAR, PELITA, LADANG, PEDANG, HUJAN** for
   乙丁己庚癸. `docs/content/glossary.json` -> `arketipe`, which the new pipeline and the card both
   read, says **Bambu, Api Unggun, Taman, Besi Tempa, Embun**. 甲丙戊辛壬 agree (Jati, Matahari,
   Gunung, Permata, Samudra). **This is why the card cannot simply be wired to the funnel**: the card
   would name her Bambu and the reading beside it would name her Akar. It resolves itself when the
   swap package retires the `contents/*.md` path — the glossary set is the one that survives — so it
   is a sequencing constraint, not a third open decision.

**THE RULE FOR THIS BLOCK: it is updated in the SAME COMMIT as any funnel change.** A commit that
changes what a user gets and does not touch this block is incomplete, and a reviewer should say so.

**Why it exists.** On 2026-08-13 a Cowork session argued a business-model question for two rounds
without noticing that the model it was arguing against **was already live** — the fact was sitting in
this file at the "the gate is back" line (the 2026-08-05 INTERIM section), inside a wall of history
nobody reads to the bottom. `CLAUDE.md` described the target, the code ran something else, and
nothing anywhere recorded the difference. A ledger that only records decisions cannot answer
"what ships?", and that is the question every product argument actually rests on.

---

## THE INTERIM REGISTER

**An interim with no end condition and no owner is not an interim, it is a decision nobody made.**
Every temporary divergence from a locked rule goes here with all four fields filled. Three of them
are cheap; the two that get skipped are the two that matter.

| Interim | What it is | Why it was accepted | WHAT ENDS IT | WHO CHECKS | Status |
|---|---|---|---|---|---|
| **The Xendit submission-window paywall** | `NEXT_PUBLIC_FREE_FULL_READING` removed 2026-08-05, which re-enabled the legacy 19k unlock: the 7-beat deep read went back behind the wall, so FREE stopped being the full mirror | Xendit's second rejection was for having **no reachable checkout**. The flag had quietly become the architecture — the paywall never rendered in production, so there was nothing for a reviewer to see. Accepted at zero traffic: nobody was being charged in that window | Xendit verification approved, then the fulfillment swap: paid becomes card + PDF and the deep read returns to the free mirror | Reyner | **CLOSED 2026-08-13.** Verification approved **08-07**, QRIS activated **08-11**, first self-purchase completed (Reyner's report, 08-13). Reyner ruled the revert to the locked model **2026-08-13**. The swap itself is now the build, tracked as the swap package under THE DEFERRED REGISTER |

**What that interim cost, recorded because it is the argument for the two columns on the right.** It
had `what it is` and `why` from the day it was written and neither `what ends it` nor `who checks`.
Its window was the Xendit submission — days. It ran for **eight days past approval** (08-05 to 08-13)
and was found by accident, in a business-model argument that had already gone two rounds against a
model that was live. Nothing was watching it because nothing had been made responsible for it.

---

## THE DEFERRED REGISTER — ruled OUT of the swap package

**THE SWAP PACKAGE, ruled 2026-08-13.** Free full mirror served from the new pipeline; Rp 19.000
becomes card + PDF; the deep read and the `contents/*.md` path are retired; `/harga`, `/syarat` and
the invoice description describe what actually ships; Reyner's QA passed and the outside reads are
in. **NOTHING ELSE HOLDS THE DATE.**

Everything below was considered and ruled OUT of that package. Each row carries what unblocks it, so
a later session can tell "deferred with a reason" from "forgotten". Every row verified still open on
2026-08-13 with the command or file named.

| Deferred | What it is | What unblocks it |
|---|---|---|
| **Compatibility** | The v1 money engine per CLAUDE.md. Not built | **Sourcing 天干五合**, the five stem combinations, which are step 2 of the classical workflow the compat spec follows. `grep -rn "甲己\|乙庚\|丙辛\|丁壬\|戊癸" lib/ tests/` -> **0** on 2026-08-13. The only substantive hit anywhere is Indonesian prose in `docs/archive/calcdump-CxD.md:45` — not a table, not code. (Scope the grep to `lib/ tests/`: across `docs/` it now also matches this row and COWORK-BRIEF's, so a docs-wide count measures the registers, not the engine. Searching the NAME `天干五合` returns zero everywhere and will mislead you — search the five pairs.) **And an oracle that can verify a CROSS-CHART claim** — Joey's plotter is single-chart (probed 2026-08-12), so COWORK-BRIEF section 4's rule bites: what has no oracle cannot be implemented |
| **Email capture at checkout** | Recovery and delivery channel. Today the reading URL is the only address Katon holds, and checkout asks for nothing (`d81434a` removed the WhatsApp field) | A register call on the wording plus a column. Also **required by the compat spec**, which creates account + email at the first compat CHECKOUT while the mirror stays anonymous |
| **Server-side conversion counters** | Nothing records funnel steps. `d81434a` removed a required field between intent and checkout with no instrumentation to see the effect | A build. **This BLOCKS the 25-45k price test CLAUDE.md requires** — a price test with no conversion measurement is a coin toss with extra steps. Note the /privasi correction under this table |
| **The Pending poll dead end** | `components/Funnel.jsx` polls `/full` every 3s and gives up after 60 tries onto a permanent spinner. Reachable in-session and now also via the Xendit success redirect (`c5e649c`) | A decision on what a 3-minute-old unconfirmed payment should say. It cannot fall back to the offer — she paid — so it needs copy, which is a register call |
| **`secara lengkap` in the hour-less disclosure** | `style.adverbial` is `\bsecara \w+` (`lib/validate/blocklist.json:200`) and the hour-less sentence uses `secara lengkap` (`docs/research/rejections-K-v1-2026-08-11.md:103`). **The gate rejects a sentence the product must be able to say** | A ruling on which side bends. This is the `aspek.比肩` shape — a legitimate ban punishing required prose — not the `relation_positions` shape, and error 22 is the record of confusing the two |
| **`renderer-prompt.txt` hygiene** | Em-dashes at **:59** and **:92**, and **`ramalan` at :207** — a token `forbidden_content.fatalism` bans HARD (`\bramalan\b`), sitting in the instructions the model reads. The line is *"Timing is cuaca, never ramalan"*, so the prompt teaches the banned word while banning the concept | A rewrite that states the rule without naming the token, plus its own measurement (rule 13). The em-dashes are prompt text, not user-facing strings, so rule 20 does not reach them — but the model is being shown the character we ban |
| **`forbidden_content.fatalism` bans any four-digit year** | `\b(19\|20)\d{2}\b` (`lib/validate/blocklist.json:13`). A reader's own birth year is **provenance she supplied**, not a dated prophecy | A ruling on whether the year the reader typed may be echoed back. The two 08-12 fatalism hits are unattributed — the probe that "cleared" the year hypothesis read the wrong field and was retracted, so the hypothesis is neither supported nor excluded |
| **The domain selector offers three choices, one is live** | `DOMAINS` in `components/Funnel.jsx` renders Hubungan / Karier / Uang; only `hubungan` has content | Content for the other two, or a decision to stop offering them. Today the two dead choices convert into demand capture, which is honest but is not what a three-way selector looks like |
| **Archivo is not loaded outside the preview** | The card's ruled typeface (2026-08-13). `scripts/card-preview.mjs` links it from Google Fonts; `app/layout.js` deliberately does not, because that would ship a font download on every route for a card no route renders | **The commit that wires a card adds Archivo to `app/layout.js` as `--font-archivo`.** Same silent-dependency class as the gender input below: nothing fails, the card just renders in the system sans and nobody is told. Recorded here and in the `FONT` constant in `components/cards/Card.js` |
| **Gender — CORRECTED 2026-08-13, it is NOT inert** | Accepted by `/api/reading`, stored on the row, absent from the UI, and `computePillars` `void`s it. It changes nothing **rendered in the reading** | **THE CARD FOOTER.** The 08-03 ruling puts `PEREMPUAN` / `LAKI-LAKI` on both cards, so gender is a card input, not a luck-pillar-only field. The 08-13 funnel work kept it out of the form on the reasoning that it changes nothing rendered — TRUE of the reading, FALSE of the card, and harmless only while no card ships. **Re-add the input when the card ships**; `buildFooter` renders the null case as date + source with no placeholder, so nothing breaks meanwhile and nothing prompts either. Luck pillars (annual reading, luck-pillar map) remain the second consumer |

**A CORRECTION TO THE COUNTER ROW, because the wording matters more than the intent.** /privasi does
NOT currently promise "no analytics". `SITE_COPY.privasi.collectNote` says *"tidak memasang cookie
pelacak atau alat analitik pihak ketiga"* — **pihak ketiga**, third party. A first-party server-side
counter is neither a tracking cookie nor a third-party tool, so that public sentence survives
unchanged. What DOES have to move is the doc comment above `privasi` in `lib/site/copy.js`, which
asserts "no cookies, no storage, no analytics" as a verified code fact, and the `collect` / `purpose`
lists, which would need to say what is counted. Smaller than "rewrite the privacy promise", and
precise about which string is actually load-bearing.

---

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
| Mirror route tests | 36 route + 11 limiter, 0 fail | 08-07 | Prompt J. No network, no key: the provider is a `globalThis.fetch` stub that throws on a cache hit, so "zero provider calls" is asserted against a stub and not against the absence of a key |
| Repo suites green | 15 of 15 | 08-07 | was 13 before J |
| `npm run build` | passes, 3 new dynamic routes | 08-07 | it did NOT before `888e5bc` — `new URL(..., import.meta.url)` in the prompt loader is a webpack asset reference. `/harga` and `/tentang` still `○ (Static)` |
| **Cache keys moved by the `element_missing` `internal_only` fix** | **2 of 13** | **08-07** | charts 1 and 5, the only two with a missing-element fact; the other 11 bit-identical. This is why `ENGINE_VERSION` was NOT bumped — the hash invalidates exactly the affected charts, and a bump would discard 11/13 to fix 2 |
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
| **THE HONEST LOOK AT SHIPPED: 50.8% pooled, +-6.1** | first-pass **30.0%** (78/260) · shipped **50.8%** (132/260) | **08-05** | **TWO IDENTICAL n=10 batches** at engine `0.4.2` + gate `1.3.0` + prompt `443fcb57`, pooled to n=260. This is the row to quote for the current state of the pipeline. Per batch: first-pass 26.9 / 33.1, shipped 45.4 / 56.2. |
| **RUN-TO-RUN VARIANCE AT n=130: 6.2 points first-pass, 10.8 points SHIPPED** | - | **08-05** | **READ THIS BEFORE BELIEVING ANY SINGLE-BATCH COMPARISON IN THIS FILE, INCLUDING THE THREE ROWS ABOVE.** Two batches with identical code, prompt, gate, charts and n differ by 10.8 points on shipped - WIDER than the +-8.5 single-batch CI. So n=130 cannot resolve the ~3-6 point moves that gates 1.1.0 -> 1.3.0 appeared to produce, and every A/B/C comparison in this sequence sits inside noise. **The three fixes were justified on CORRECTNESS, and none of them has a measured effect on the launch numbers.** This replicates the n=39 finding (7.7-point spread) at four times the sample: the variance is not shrinking the way binomial arithmetic predicts, so something beyond sampling is moving between batches. n=50 stays reserved for the pre-launch gate. |
| **C's real effect is CHART 9, and it is decisive there** | palace_dropped chart 9: **8/10 -> 0/10 -> 0/10** | **08-05** | Per-chart, the only clean signal in the whole sequence. Collapsing the duplicated 正財 fact eliminated chart 9's `palace_dropped` completely and the result replicated. Chart 12 barely moved (9 -> 8 -> 7) and other charts drifted both ways (chart 7: 2 -> 4 -> 4; chart 10: 4 -> 6 -> 7), so **the aggregate drop 34.9% -> ~24% is chart 9 plus noise, not a general improvement.** Mechanism that fits: the duplicate made the renderer write the same Aspek twice and name its palace in only one block, so the other citation failed. |
| **`palace_dropped` is CONCENTRATED, not diffuse - the target list** | charts 5 (7/7/7) · 12 (9/8/7) · 10 (4/6/7) · 7 (2/4/4) | **08-05** | Useful for whoever picks this up: chart 5 fails on 7 of 10 runs in all three batches, which is near-deterministic and therefore diagnosable from a single chart rather than statistically. Charts 1, 2, 13 are at or near zero. A per-chart fix beats a prompt-wide one. |
| The two "insurance" checks: `meta` caught its first real case | meta 1 run · code_leak 0 · duplicate_sentence 0 | 08-05 | Over 260 runs at the final config. `duplicate_sentence` is 0 because C removed its cause. `style.meta` firing once is the first evidence either insurance check earns its place; `code_leak` has still never fired. |
| `relation_positions` is now near-DETERMINISTIC on chart 2 | chart 2: 7/10 -> **10/10** · charts 1 and 6 at 1-2 | 08-05 | Further confirmation it is structural rather than stochastic. Chart 2 carries TWO branch relations that the renderer braids into one block, and `blocksCiting` charges each fact with the other's palaces. A renderer error would not fail 10 times out of 10. The `extra`-condition fix remains the outstanding item. |
| **STAGE 6, gate `1.4.0` + prompt `cb55f3b9`** (two levers, one batch) | first-pass **20.8%** (27/130) · shipped **38.5%** (50/130) · fb-gate 60.8% | **08-06** | `948e169`, n=10, rider off. **Shipped is the LOWEST ever recorded** and well outside the CI against the 50.8% pooled baseline. One lever worked perfectly and the other backfired; read them on their own counters, below. |
| **LEVER (a) `relation_positions`: 14-18% -> ZERO. Complete.** | **0 runs, 0 rejections** | **08-06** | Dropping the `extra` condition and keeping `missing` eliminated the check entirely across 130 runs. It had survived a prompt instruction, a payload handover and a scan-scoping fix; it was a gate bug the whole time, exactly as the 8/8 `missing == []` attribution said. **This check is now silent and should stay that way** - if it ever fires again it is a genuine dropped position and worth reading. |
| **LEVER (b) THE PARAGRAPH PROMPT BACKFIRED: `unparagraphed` 30% -> 73.9%** | 48 -> **113** rejections | **08-06** | The gate check is byte-identical to `1.3.0`, so the prompt edit is the only possible cause. It nearly tripled the failure and took shipped down 12 points. **REVERT CANDIDATE.** |
| **WHY, and it kills the whole approach: THE RENDERER NEVER EMITS A PARAGRAPH BREAK.** | **0 of 31 blocks** carried `\n\n` | **08-06** | Measured directly off parsed provider output, 3 charts x 2 runs. Not "rarely" - **zero**. Including a 13-sentence, 1112-character block carrying THREE facts, which even the OLD prompt explicitly permitted to break. So the instruction is INERT: the model does not produce the character in this JSON field, and no wording will make `unparagraphed` satisfiable by asking. The only way a reading can pass today is by keeping every block under 8 sentences, which nothing in the prompt asks for. |
| Why the rate tripled when block sizes did not move | blocks/run 7.63 -> 8.40 · block_chars med 490 -> 493, p90 745 -> 741 | 08-06 | Block length is UNCHANGED. Two compounding causes instead: the per-block over-8 rate roughly doubled (~4.5% -> ~10%, sampled), and there are 10% more blocks per reading. The check fires if ANY block in a reading fails, so per-evaluation risk is `1 - (1-p)^blocks` and compounds hard: 10% per block over 8.4 blocks is ~59% per reading. **A per-block rule reported per-evaluation will always look worse than it is; the two rates must not be confused.** |
| **THE FIX IS DETERMINISTIC, NOT INSTRUCTIONAL (recommendation, not done)** | - | 08-06 | `structureGuard` already NORMALISES before it judges (it collapses 3+ newlines). Inserting a break at a sentence boundary in an over-long block is the same class of act - formatting, never words - and would convert a 74% rejection into a silent fix, with rule 20 untouched because no vocabulary is authored. The alternatives are worse: dropping Reyner's ruled rule, or asking the model again for a character it has never once produced. **Needs Reyner's call on whether the gate may reformat, and its own measurement.** |
| `palace_dropped` 36.6% on this batch is NOT its honest number | 24% -> 36.6% | 08-06 | Recorded so nobody reads it as a regression in the palace instruction. This batch has 10% more blocks per reading and a broken paragraph rule inflating every downstream count; the batch is contaminated for any check other than the two levers. **`palace_dropped` still needs the clean batch it was promised** - after (b) is resolved. |
| **THE CLEAN BATCH — gate `1.5.0`, prompt `443fcb57`. BEST NUMBERS RECORDED.** | first-pass **36.9%** (48/130) · shipped **62.3%** (81/130) · fb-gate 37.7% · fb-net 0.0% | **08-06** | `6f2c65a`, n=10, rider off. **Shipped is above the ENTIRE observed range of the previous configuration** (two batches spanned 45.4-56.2). Against the 50.8% pooled baseline the gap is 11.5 points at ~2.2 SD, nominally significant - but this harness has demonstrated EXTRA-BINOMIAL variance (10.8-point spread between identical batches), so read it as strong and unreplicated, not settled. A replicate is what would settle it. Total rejections 311 -> **187**. |
| **FOUR CHECKS ARE NOW SILENT** | unparagraphed **0** · relation_positions **0** · duplicate_sentence 0 · code_leak 0 · meta 0 | **08-06** | Of the four added 08-04 from Reyner's blind-judging notes, none now fires. `duplicate_sentence` was silenced by the Stage 3 collapse, `relation_positions` by dropping the `extra` condition, `unparagraphed` by the deterministic insert. **`unparagraphed` at 0 is BY CONSTRUCTION and is not evidence about the renderer** - the number that carries that information is the insert rate below. |
| **Paragraph inserts: 0.20 per gate evaluation, 2.8% of blocks** | 33 inserts · 163 evaluations · 1191 blocks | **08-06** | The honest measure of how often the renderer actually writes a wall, now that rejecting it has stopped being the mechanism. About one reading in five contains one over-long block. **This also retires the old `unparagraphed` percentages as a measure of anything**: 30% and 73.9% of EVALUATIONS were a per-block rate compounded over ~8 blocks, not a statement that a third or three quarters of prose was unreadable. |
| **`palace_dropped` — 27.6%, ITS FIRST HONEST NUMBER** | 45 rejections over 163 evaluations | **08-06** | The batch it was promised: no paragraph rule inflating the count, no extra blocks, four other checks silent. It is now the second-largest rejection cause behind `hedge_construction` and **the largest FACT-level one**. |
| **`palace_dropped` IS THREE CHARTS, replicated across three batches** | chart 5 (7/7/7) · chart 12 (8/7/7) · chart 10 (6/7/7) | **08-06** | Runs affected out of 10, batches 0.4.2-A / 0.4.2-B / clean. Those three are **21 of the 45 rejections (47%)**, and with charts 7 (4/4/5) and 11 (4/3/4) it is 30 of 45 (67%). Charts 2 and 13 never fire. **Chart 5 has failed exactly 7 of 10 in all three batches** - that is near-deterministic, so it is diagnosable by reading one chart's output rather than by running statistics. **Do the per-chart diagnosis before any prompt-wide palace edit.** |
| **REPLICATED. SHIPPED IS 63.8% AND THE IMPROVEMENT IS ESTABLISHED.** | pooled n=260: first-pass **36.9%** +-5.9 · shipped **63.8%** +-5.8 | **08-06** | Two batches at gate `1.5.0` / engine `0.4.2` / prompt `443fcb57`. Against the previous configuration's pooled 30.0% / 50.8%, **shipped is +13.0 points at 3.0 SD (p ~ 0.003) with non-overlapping CIs** - the first change in this whole sequence that clears the variance band. **First-pass +6.9 points is NOT established** (1.65 SD, p ~ 0.10); report it as suggestive. |
| **THE HARNESS VARIANCE COLLAPSED, and that is a finding in itself** | spread **0.0** pts first-pass · **3.1** pts shipped | **08-06** | Previous configuration: 6.2 and 10.8 points between identical batches. Now first-pass is 48/130 in BOTH batches - identical to the run - and shipped differs by 3.1. **The extra-binomial variance that made every earlier comparison unreadable was largely the unstable checks themselves**: `unparagraphed` compounding a per-block rate over ~8 blocks, and `relation_positions` firing on braid layout. Silencing them made the instrument stable enough to resolve a real effect. The old 8-point "cannot resolve below this" caveat applies to the OLD configuration, not this one. |
| Paragraph inserts, replicated | 0.20 / 0.25 per gate evaluation | 08-06 | Stable. About one reading in four or five carries an over-long block the gate reformats. |
| **`palace_dropped` 22.4% pooled, and it is NOISIER than one batch suggested** | 27.6% / 17.4% -> pooled **22.4%** | **08-06** | **CORRECTS the 08-06 row above it.** That row called chart 5 "near-deterministic at 7/10 in all three batches"; the fourth batch returned **4**, so the sequence is 7/7/7/4 and the per-chart rate is not deterministic. The CONCENTRATION survives - charts 5, 10 and 12 are the top three in both gate-1.5.0 batches (7/7/7 then 4/4/5), 34 of 74 pooled rejections - but the diagnosis below stands on captured OUTPUT, not on rates, which is why it is unaffected. |
| **`palace_dropped` DIAGNOSED: `spouse_palace` is near-unsatisfiable BY CONTRACT** | **5 of 5 captured failures**, charts 5 and 10 | **08-06** | Read off actual provider output, not inferred. Every captured failure is the same fact, `spouse_palace`, required to name the literal string `Pilar Diri`. Two surface forms, and **the prompt produces both**: (1) chart 5 writes *"Fondasi Pasanganmu berada di pilar hari"* - and `renderer-prompt.txt` **CONTRADICTS ITSELF** here, banning `pilar hari` by name at line 82 and listing *"ini datang dari pilar harimu"* as **encouraged** at line 143; (2) chart 10 writes *"Fondasi Pasanganmu ditempati oleh Aspek Peraih"*, which is **verbatim the model sentence the prompt prescribes at line 97**, and names no pillar at all. So the sentence the prompt tells the renderer to write does not satisfy the check for the fact it was written for. The only passing phrasing, *"Fondasi Pasanganmu ... di Pilar Diri"*, is redundant (Fondasi Pasangan IS the day pillar's branch) and nothing asks for it. **A CONTRACT BUG, not a renderer failure.** Scope: `spouse_palace` is **13 of the 29 palace demands in the fixture (45%)**, one on every chart. |
| **Recommended lever for `palace_dropped` (not done)** | - | 08-06 | In `checkPalaces`, accept a fact's own `label` when that label is the BRANCH name of the required palace - so `spouse_palace` naming `Fondasi Pasangan` satisfies its `Pilar Diri` demand. It locates the fact MORE precisely, not less, and `GLOSSARY.pilar.day.branch_name_id` already holds the pairing, so it is a data join and needs no register decision. **Separately and regardless: resolve the line 82 / line 143 contradiction** - a real prompt defect either way. A `\bpilar\s+(tahun\|bulan\|hari\|jam)\w*` blocklist entry is a candidate AFTER that (pre-checked 08-06: zero false positives against the glossary, clean on all four `Pilar X` names, catches all observed forms) - landing it first would punish the renderer for obeying line 143. |
| **GATE `1.6.0` — `palace_dropped` ELIMINATED. BEST NUMBERS BY A WIDE MARGIN.** | first-pass **50.0%** (65/130) · shipped **75.4%** (98/130) · fb-gate 24.6% · fb-net 0.0% | **08-06** | `0cc164b`, the branch-name fix measured ALONE, prompt untouched at `443fcb57`. Against the replicated pooled baseline (36.9% / 63.8%): first-pass **+13.1** at 2.5 SD, shipped **+11.6** at 2.4 SD, both nominally significant. Single batch, so treat the magnitudes as provisional - but see the next row, which is not a statistical claim at all. |
| **`palace_dropped`: 22.4% -> 0. Not reduced, GONE.** | **0 rejections in 130 runs** | **08-06** | Categorical, not statistical. It was the largest FACT-level cause and the second-largest overall. **This also proves the diagnosis was complete**: accepting the branch name for `spouse_palace` removed EVERY palace failure, including the `main_profile` -> `Pilar Kerja` demands, which means those were never failing on their own. All of `palace_dropped` was one contract bug on one fact, exactly as the 5-of-5 capture said. |
| Hard findings collapsed 32-43 -> **5** | - | 08-06 | `fact.palace_dropped` is severity HARD, so eliminating it took almost all hard rejections with it. A hard finding sends a reading to the floor without spending the regeneration budget, which is why the fallback rate fell so much further than the rejection count did (147 rejections vs 189, but fb-gate 34.6% -> 24.6%). |
| **GATE `1.7.0` + prompt `9b5b67d7`** (raw-pillar contradiction resolved + banned) | first-pass **53.1%** (69/130) · shipped **74.6%** (97/130) · rejections **128** | **08-06** | `c113f45`. **Shipped is FLAT against gate 1.6.0 (75.4%)** and first-pass +3.1 is inside noise. This change was correctness, not throughput: the prompt no longer contradicts itself and the rule is enforced once. Total rejections still fell 147 -> 128. |
| **`hedge_construction` 39.9% -> 25.9% off a change that never mentioned hedging** | 65 -> 41 rejections | **08-06** | **DO NOT BANK THIS.** Nothing in `c113f45` touches hedging; the only prompt edit was one phrase in the encouraged-provenance list. Either the check is far noisier batch-to-batch than its size suggests, or a single-phrase prompt edit perturbs unrelated style behaviour - and both readings matter for what comes next, since hedge_construction is the designated next target. `hedging` (19.6 -> 13.9) and `essay_connectives` (18.4 -> 15.2) drifted the same way while `adverbial` doubled (4.3 -> 8.9), which looks like reshuffling rather than improvement. **Replicate before treating hedge_construction as smaller than it was.** |
| The new `raw_pillar` ban fires at 10.1% | 16 rejections, 4th largest | 08-06 | A brand-new ban with no track record, immediately a top-five cause. It is enforcing a rule the prompt now states once, so the hits should be real - but that is exactly the claim the rejection gallery exists to test. **Read its entries with more suspicion than the established bans.** |
| `palace_dropped` reappeared at 2 (1.3%) after being 0 | 0 -> 2 | 08-06 | Small and worth watching rather than acting on. Plausible mechanism: the raw_pillar ban removes the phrasing the renderer previously reached for to locate a fact, and on two runs it dropped the location entirely instead of switching to the palace name. If it grows, that is the trade the ban is making. |
| Paragraph inserts 0.28 -> 0.44 per evaluation | 45 -> 70 | 08-06 | Blocks got longer or denser under the new prompt. Harmless now that the gate reformats rather than rejects - which is precisely the case for having made that change before this one. |
| **REJECTION GALLERY shipped: `reports/rejection-gallery.md`** | 5 complete rejected readings | **08-06** | `npm run gallery:rejections`. Full prose plus the sentence each check matched, reading first and objections after, picked for check variety. Built because a COUNT cannot answer the only question that matters about a style ban: is it killing prose Reyner would actually want. **With Reyner for a ruling.** |
| **GALLERY FINDING 1 — the renderer INVENTED an unknown birth hour, twice** | chart 1, `hour_known: TRUE` | **08-06** | **The most serious defect found this session, and no FACT check catches it.** Chart 1's penutup reads *"Pilar jam lahirmu tidak dapat dipetakan karena waktu kelahiran tidak diketahui"* - on a chart whose hour IS known (09:00), in a reading that names **Pilar Arah** one paragraph above. Reproduced on two independent runs. That is a plain falsehood about the reader's own chart and a rule-14 violation: the LLM decided something true and got it wrong. **It was caught only incidentally, by the brand-new `raw_pillar` STYLE ban** - without that ban, added hours earlier, it would have shipped. **Recommended: a HARD fact check - when `hour_known` is true, the text may not claim the hour is unknown or unmappable.** Cheap, mechanical, and it closes a hole that reaches the user as a lie. |
| Fixture gap this exposes: **zero charts have `hour_known: false`** | 13/13 known | 08-06 | So the prompt's own `hour_known: false` branch ("state once, plainly, that the fourth pillar cannot be mapped") is exercised by NO fixture chart, and the check recommended above can only be tested in one direction until a no-hour chart is added. A large share of real users will not know their birth hour, so this is a real coverage hole, not a tidiness one. |
| **GALLERY FINDING 2 — `hedge_construction`'s top trigger may be prose the prompt DEMANDS** | same sentence in 3 of 5 entries | **08-06** | Every hedge_construction entry in the gallery is the same sentence: *"Lemah di sini bukan berarti tidak mampu, melainkan sumber tenagamu ada di luar dirimu."* That is the resolve-in-the-same-breath move rule 21 and §NAME IT PLAINLY REQUIRE, phrased with an explicit contrast connective. The prompt's own model sentence - *"Lemah di sini bicara soal cadangan, bukan soal kemampuan"* - uses `bukan` and escapes the regex only because no `tapi`/`melainkan` follows it. **So the largest rejection cause in the pipeline may be firing mostly on the correct rhetorical move in a slightly different shape.** REYNER'S RULING, not a code decision: if that sentence is prose he would ship, the regex needs narrowing before hedge_construction is chased any further. |
| **HEDGE REPLICATE — 25.9% WAS NOT REAL. Pooled `hedge_construction` is 28.8%.** | 25.9% / **31.6%** -> pooled **28.8%** | **08-07** | Two batches at gate `1.7.0`, 13 charts, n=10 each. **The 5.7-point spread between IDENTICAL batches is larger than most differences this ledger has treated as results** - so a single-batch read of this check carries about +-6, and 25.9% was the low draw. It is still the largest rejection cause by a wide margin. Reyner's instinct to replicate before acting was right. |
| Gate `1.7.0` pooled, two batches | first-pass 53.1 / 50.8 -> **51.9%** · shipped 74.6 / 72.3 -> **73.5%** | 08-07 | The stable figures for the pre-1.8.0 configuration, and the baseline any 13-chart comparison should be made against. |
| The 39.9% -> 28.8% hedge drop is probably real and still UNEXPLAINED | 1.6.0 -> 1.7.0 pooled | 08-07 | 11 points, which clears the 5.7-point batch spread, so it is unlikely to be noise. But the only change between those gates was ONE PHRASE in the prompt's encouraged-provenance list, which has nothing to do with hedging. **A single-phrase prompt edit moving an unrelated style check by 11 points is a fact about the renderer worth understanding before the next prompt edit** - it means prompt changes have effects nobody predicts and the per-check table cannot be read as a set of independent levers. |
| `raw_pillar` is stable at ~10.4% | 10.1% / 10.8% | 08-07 | Replicated. The new ban is a genuine top-five cause, not a first-batch artifact. |
| `palace_dropped` crept back to 2.2% pooled | 1.3% / 3.2% | 08-07 | Was 0 at gate 1.6.0, before the raw-pillar ban. Small, replicated, and consistent with the mechanism flagged on 08-06: the ban removes the phrasing the renderer reached for to locate a fact, and it sometimes drops the location rather than switching to the palace name. Worth watching; not worth acting on at 7 rejections in 316. |
| **GATE `1.8.0` — first-pass 70.0%, shipped 88.5%. BEST BY A LONG WAY.** | first-pass **70.0%** (91/130) · shipped **88.5%** (115/130) · fb-gate 10.8% · rejections **85** | **08-07** | `1bfac48` + `815dff6`, run `--no-hourless` on the SAME 13 charts as the baseline so the carve-out is not confounded by the chart-set change. Against the pooled 51.9% / 73.5%: first-pass **+18.1 at 3.6 SD**, shipped **+15.0 at 3.8 SD**. Both far outside the batch spread; these are real. Rejections 140 -> 85. |
| **The `bukan berarti` carve-out removed 88% of `hedge_construction`** | 28.8% -> **3.2%** (5 rejections) | **08-07** | **So seven of every eight hedge rejections were the sanctioned construction, not the hedge.** The check is now precise rather than gutted - the residual 5 are genuine `bukan X tapi Y`, and tests assert the three-times-escaped form still rejects. It has gone from the largest rejection cause in the pipeline to the sixth. **The general lesson is the expensive one: a ban can spend most of its budget on prose the prompt requires, and a COUNT can never show that. The gallery is what found it, and other bans deserve the same read.** |
| **`hour_known_contradiction` fires at 9.7% — the falsehood was COMMON, not rare** | **15 rejections**, 2nd largest cause | **08-07** | The check added today, on 13 charts that ALL have a known hour. **Roughly one generation in ten told the reader her birth hour was unknown when it was not** - a plain falsehood about her own chart. It is every one of the 15 hard findings in this batch. Before today NOTHING looked for it: it surfaced only because the `raw_pillar` style ban happened to match the same sentence a day earlier, so for the whole life of this pipeline these readings shipped. **The single most valuable thing the rejection gallery produced, and the strongest argument for reading output rather than counting it.** |
| Stage 6 threshold distributions, gate `1.1.0` | same_breath med 0.93 (min 0.20, p10 0.50) · coverage med 1.00 (min 0.00, p10 0.69) · total_chars med 3313 (max 4797) · block_chars med 493 (p90 748, max 1390) | 08-04 | n=231 / 3792 / 235 / 1310. The three ORIGINAL unfitted constants still reject nothing: sameBreathOverlap 0.25 vs a p10 of 0.50, fieldOverlap 0.20 vs a p10 of 0.69, maxTotalChars 12000 vs a max of 4797. `coverage` min is now 0.00 and `same_breath` min 0.20 - the first observations to fall BELOW their thresholds, so these two are no longer provably inert and are worth a look before they are fitted. |
| **ACTIONABILITY IS DECLARED, NOT INFERRED — the three ranking records re-measured** | rho **0.81 -> 0.73** · chart-1 `required_points` order changed · one-time re-rank **12 of 13 charts**, keys **13 of 13** | **08-11** | The axis read `fact.actionable`, the PROSE, so a fact gained +10 the moment someone wrote its sentence and authoring content re-ranked charts (the tranche-1 pass moved 11 of 13). Now `facts.js#ACTIONABLE_KINDS` declares it per `provenance.kind`. **The ruled line: a kind is actionable if it names a CONDITION THE READER CAN RESPOND TO, not a DISPOSITION SHE IS.** 7 true / 5 false, ruled by Reyner. The movers are exactly the kinds declared actionable whose prose was never written - chart 1: `strength_weak` 78 -> 88, `relation_半合_巳酉` 69 -> 79, `element_dominant_Water` 31 -> 41; facts that already had seeds did not move at all. The rho drop is the hand-written target being stale about AUTHORING state (scored 08-02 against empty cells), which is the coupling this removed. **Updated deliberately, not regenerated to pass.** |
| **`quiet_chart` fires on 0 of 13, was 2 of 13 — RULED: the padding is real, the threshold is not the cause** | charts 5 and 13 -> **none** · `quietFloor` **stays 70, untouched** | **08-11** | Not predicted when the actionability declaration landed, and a BEHAVIOUR disappearing rather than a number moving: `quiet_chart` tells the renderer to say less, and at 0 of 13 that instruction reaches nobody. Cause: charts 5 and 13 had no fact at or above `quietFloor` (70), and the +10 for `branch_relation` being declared actionable pushed their top fact over - chart 5's 六合 68 -> 78, chart 13's 冲 67 -> 77. Nothing about either chart changed. **REYNER'S READ (`reports/mirror-qa-chart-05-quiet.md`, `-13-`): the padding is CONFIRMED on chart 5** - "Beban yang Menetap" says one trait five ways with no action, and the 六合 block gives three rephrasings with no named domains and no action. **But every offender is a cell TRANCHE 1 DID NOT WRITE. The attribution is unwritten content, not the threshold** - a full cell ends on something to do, and a thin one has nothing to end on, so it rephrases. **RULING: `quietFloor` stays at 70, untouched. Re-render chart 5 after tranche 2 lands; if it still pads with full cells, re-fit as its own measured change.** The lesson generalises: a threshold that looks mis-set may be reading a content gap. |
| **THE STORED GATE ROW IS NOT A USABLE BASELINE. Identical config, four days apart: shipped 88.5% vs 94.6%.** | first-pass 70.0 -> **60.0** · shipped 88.5 -> **94.6** · hard **15 -> 1** · rejections **85 -> 34** | **08-11** | A same-session CONTROL run of the exact gate-`1.8.0` configuration (engine `0.4.2`, prompt `9b5b67d7`, same 13 charts, `--no-hourless`, n=10). Nothing in the repo differs from the 08-07 row; only the day does. **The two moved in OPPOSITE directions - first-pass down 10, shipped up 6 - and `hour_known_contradiction` fired 15 times then and ONCE now.** The 08-07 hedge replicate already warned that a single batch carries about +-6; this says the same for the headline rates and much worse for a single check. **Consequence, and it is a method rule, not a K finding: a stored gate row cannot serve as the comparator for a later change. Any prompt or engine change measured against one is measuring the day.** Arms must be run back to back in one session, and ideally replicated, before a difference means anything. |
| **PROMPT K SHIPPED — the reader meets herself first** | `day_master` rank 9/14 -> **1/14** on `fresh-1996`; served reading block 6-of-7 -> **block 1** | **08-11** | `identityFirst` in `lib/semantic/index.js` lifts the identity spine (Day Master, strength verdict, main profile or the CR-1 that supersedes it) to the front of `facts[]`; everything after keeps the importance descent. Derived from the JSON's own `core`/`strength` blocks, not a hand-list of ids. `spouse_palace` is role-spine and deliberately stays in the descent - it is a PLACE, not the reader. ENGINE_VERSION `0.4.2` -> `0.4.3-stage3`, so every cache key moves; free at zero traffic. Re-read files: `reports/mirror-qa-chart-01-K.md`, `reports/mirror-qa-fresh-1996-K.md`. |
| **BLOCKS PER READING is the one metric that replicates - and it is what the renderer-prompt wording moves** | identical config **5.1 / 5.1** · K wordings **7.3 / 5.4 / 7.1** | **08-11** | Measured over 616-1396 blocks per run, which is why it is stable where the rates are not: the two gate-`1.8.0` runs four days apart agree to the decimal. Three wordings of the same K instruction were measured. "Write them first, in the order the array gives them" (`69a9afe2`) and the minimal one-sentence insert (`9c167561`) both inflate block count ~40% - chart 1 went from 4 blocks carrying 10 facts to **9 blocks carrying 9 facts**, one fact per block, which is the "tour of the chart" the prompt bans and a direct worsening of QA finding 2. Adding "First does not mean three blocks" (`8877da29`) holds it at **5.4**. **The engine reorder is common to all three, so the wording is the whole effect; the reorder alone fragments nothing.** `8877da29` is what shipped. Its cost is coverage p10 0.55 against the control's 0.67 - a soft-check trade, taken on the metric that replicates over three rates that do not. |
| **THE MODULE-ASSEMBLY FLOOR IS 13/13 CLEAN — and the cause of the last two findings was nobody's prediction** | floor readings raising a gate finding **2 of 13 -> 0 of 13** | **08-12** | `ac24441`, the tranche-2a wiring commit, measured alone. **The two were `structure.duplicate_sentence` on charts 2 and 8, and those are exactly the two `same`-relation charts** - `elementRelation(dmElement, element)` returns `same` there because the dominant element IS the day master's element, so `element_dominant` and `day_stem` resolved to the identical `GLOSSARY.elemen[hanzi]` entry and the floor, which renders every string of every fact, printed it word for word twice. Keying `element_dominant` to its own `elemen_dominan` group **per relation** removed the collision at its source rather than by collapsing a fact. **Record this mechanism, do not rediscover it:** the finding looked like a floor-renderer defect and was actually two facts sharing one glossary node, which is the same shape as the third Stage 3 collapse gap (charts 9 and 12, 08-04) arriving through a different door. A shared glossary entry between two facts that can co-occur is a duplicate waiting to happen. |
| **A content tranche and its wiring BOTH re-ranked nothing — the second and third confirmations that prose is decoupled from ranking** | fact order moved **0 of 13** on `6947af0` and **0 of 13** on `ac24441` · cache keys moved 10 of 13 then 8 of 13 | **08-12** | The tripwire from the actionability declaration (08-11 row above), and it is clean twice. Importances on the wiring commit are byte-identical before and after: 41, 70, 64, 70, 41, 70, 61, 67. Keys moving while order does not is the correct signature - the strings changed, the axes did not, because `actionabilityOf` reads `ACTIONABLE_KINDS[fact.provenance?.kind]` and nothing in `hierarchy.js` reads fact content. **The tranche-2a prompt predicted 8 of 13 orders would move and was wrong; that is COWORK-BRIEF error 21**, and the aggravating half is that it also told the reader the move was "expected, NOT the re-coupling tripwire firing", which would have authorised dismissing a real alarm. |
| **THE PALACE-DOMAIN WEAVE: +25.6 first-pass, and the join ALONE is a regression** | arm A 28.8% / 54.4% -> arm B **54.4% / 78.1%** · pre-join arm: `raw_pillar` 4.0% -> 33.8% on the join alone | **08-12** | Same session, back to back, gate `1.9.0`, n=10, 16 charts, 160 runs each, fb-net 0.0% both, prompt hash the only difference. Per evaluation: `raw_pillar` 33.8 -> 5.6, `field_dropped` 22.9 -> 6.6, `essay_connectives` 15.4 -> 4.0, `unsanctioned_bracket` 9.0 -> 1.0. **Shown a gloss field with no instruction the model bracketed it and wrote raw pillar words, so the join must never ship without the prompt commit.** The pre-join arm is CONTAMINATED (third consecutive batch, 167 HTTP 429s, fb-net 50.6%, ~100 evaluations) and is directional only. Two checks worsened, neither levered: `adverbial` 6.5 -> 11.1 (unexplained; the hour-less `secara lengkap` sentence exists in both arms) and `forbidden.fatalism` 0 -> 2 runs, both chart 101, both to fallback, not reproduced in 14 targeted renders. |
| **The floor states a relation's span** | **0 of 18 -> 18 of 18** relation blocks · floors 0 of 14 hard both sides | **08-12** | `b30b7cd`. Deterministic, no provider. Chart 6 opened `"Gesekan (Harm)."` and now opens `"Pilar Akar dan Pilar Kerja."` Authors nothing: `positions_id` is pre-verbalised from the same Reyner-reviewed palace names. Secondary effect: a floor relation block now states its span completely, so `named` is a superset of `expected` and the round-4 failure class cannot reach the floor even if a seed carries a calendar unit. |
| **API CREDITS DEPLETED — precondition 3 cannot be met until billing is topped up** | `RESOURCE_EXHAUSTED` from the live error body | **08-12** | Read off the actual 429 payload, not inferred: *"Your prepayment credits are depleted."* The QA re-render of charts 5, 13, 1 and fresh-1996 returned `source: module_assembly` on all four - the floor. **The weave is metric-verified and PROSE-UNVERIFIED**: arm B's 160 runs are real LLM output, but the harness stores no prose without `--rider`, so no captured sentence shows the gloss landing as a clause. Chart 5's deferred `quietFloor` re-ask also stays deferred, because it needs a real read of full cells. **Reyner's action, and nobody else's.** |
| **TRANCHE 2B: the ranking tripwire holds a FOURTH time, and every reader's key moved** | cache keys **13 of 13** · fact order **0 of 13** · importance vectors **0 of 13** · fact count and required_points unchanged 13 of 13 | **08-12** | `273292a`, 15 `actionable_seed` assignments, no engine path. 13 of 13 keys is the strongest form of "this content reached every reader" and it agrees with the per-cell fire lists (the union of the 15 cells' fixture charts is all 13). Order at zero is what makes it a content change: since #34 actionability is DECLARED, so prose cannot buy rank. **Four checks, never once fired.** A first firing would mean prose had re-coupled to ranking — the bug #34 removed — and is a bug report, not a curiosity. |
| **GATE `1.9.0` — `fact.relation_positions` round 4 FIXED: a calendar unit is not a pillar** | **108 of 108 HARD → 0 of 108** · control 0 → 0 · floors 0 of 14 both sides | **08-12** | The exposure population is every relation fact on 13 fixture charts plus the hour-less chart, against each of the **six live glossary cells that carry a calendar unit**, in the shape that actually fires: span NOT stated + a bare unit. `NOT_A_SPAN` gained three CLASSES (counted duration, calendar deictic, temporal pre-modifier) derived by sweeping the whole glossary and `renderer-prompt.txt` through the real scan — **eight** tokens survived and none was a span statement, so the three idioms in the ruling were a subset. `bulan Ayam` / `tahun Ular` are deliberately NOT stripped: stripping only removes positions from `named`, so stripping a form that genuinely names a pillar would fire where the text is right. Reyner's `di kemudian hari` restored in the next commit, which IS the regression test (keys 4 of 13, **order 0 of 13**). **A claim of this session's own was disproved in the measuring: a correctly-stated span plus a calendar unit fires 0 of 108, because gate `1.4.0` had already dropped the `extra` condition.** Two tests added, stage6 64 → 66, including `NO ENGINE STRING NAMES A PILLAR BY BARE WORD` over every glossary string. |
| **The floor never states a relation's span — pre-existing, unmasked by the above, NOT fixed** | every relation block, every chart | **08-12** | A `branch_relation` fact carries no `fact.palace` (the span is `provenance.positions_id`) and `assembleFallback` prints only `fact.palace`, so a floor relation block says what the relation is and never where it sits. The check skipped it because nothing was named, which is why four rounds of this bug never surfaced here. **So the 503s were a false positive about a REAL omission.** The cheap fix is one line leading the block with `positions_id` — authors nothing, the string is already engine-owned and Reyner-reviewed. Own change, own measurement. |
| **`fact.relation_positions` fired for the first time since it was silenced, and it is the CHECK that is wrong** | HARD on **5 charts** (6, 8, 10, 11, hour-less 1989-02-04) → **0** after a 3-word deletion | **08-12** | The 08-06 note said this check "is now silent and should stay that way - if it ever fires again it is a genuine dropped position and worth reading". **Read: it was not genuine.** `di kemudian hari` carries a bare `hari`; the check reads a bare pillar word as a claim about that pillar and **skips any block naming no position** (`fact.js:439`), so the floor's 害 block had never been scanned before this tranche. The new sentence supplied `hari` → named `[day]` → span `[month, year]` reported DROPPED → HARD → `floorRefusalReason` 503s the reader. **Same family as `kehidupan sehari-hari`** (`fact.js:85-91`, fixed 08-11 by a whole-token scan, which cannot reach a standalone token). **RECOMMENDATION, not done: `NOT_A_SPAN` entries for `kemudian hari` / `suatu hari` / `hari ini`** — gate change, own measurement (rule 13). Indonesian uses `hari` temporally more than positionally, so this recurs on production prose, not just glossary strings. Also a method note: the stage6 floor test stops at the first failing chart, so the blast radius was 5 charts while the message showed 1 — probe all 13 before believing a per-chart count. |
| The `hour_known_contradiction` spike under K was the KNOWN penutup failure, not a K regression | 1 (control) · 15 / 25 / 38 (K arms) · 15 (08-07) | 08-11 | Read in `docs/research/rejections-K-v1-2026-08-11.md` rather than counted. The failing sentence is verbatim the 08-06 gallery finding - *"Keempat pilar harimu tidak dapat dipetakan karena jam lahir tidak diketahui"*, in the **penutup**, in a reading that names Pilar Akar, Pilar Kerja and Pilar Arah three paragraphs above. It lives in the closing sentence, which K does not touch, and it fired 15 times in the 08-07 baseline before K existed. **Its rate swings 1 to 38 across runs of code that differs in ways it cannot see, which makes it the loudest single argument for the baseline rule two rows up.** Left open: nothing here explains why the rate moves, and it remains a plain falsehood when it fires. |

## 2026-08-12 — THE QUEUED RENDERER PASS: measured, and its QA read is BLOCKED ON BILLING

Precondition 3's build, three commits (rule 13 throughout), then a fourth that could not run.

- **`9b2b6b2` engine** — the payload join. `pilar.*.domain_id` had been DATA READ BY NOTHING since
  tranche 1; every palace now carries its life domain. `ENGINE_VERSION` 0.4.3 -> 0.4.4-stage3.
  Keys 13 of 13, **fact order 0 of 13** (tripwire, sixth check), importances 0 of 13.
- **`d55f128` prompt** — the weave plus the breath phrase, as a same-day pair. `PROMPT_VERSION`
  `8877da29` -> `2ff1a546`.
- **`b30b7cd` render** — the floor now states a relation's span: 0 of 18 relation blocks named their
  span, now 18 of 18. Chart 6 opened `"Gesekan (Harm)."` and now opens
  `"Pilar Akar dan Pilar Kerja."`

### THE JOIN ALONE IS A REGRESSION. These two commits must never ship apart.

The paired arms, back to back in one session, gate `1.9.0`, n=10 over all 16 charts, 160 runs each,
transport clean both sides (fb-net 0.0%), prompt hash the only difference:

| | arm A: join, no instruction | arm B: join + prompt |
|---|---|---|
| first-pass | 28.8% (46/160) | **54.4%** (87/160) |
| shipped | 54.4% (87/160) | **78.1%** (125/160) |
| fb-gate | 45.6% | 21.9% |
| hard | 33 | 16 |

Per gate evaluation the mechanism is specific, not diffuse: `style.raw_pillar` 33.8% -> 5.6%,
`coverage.field_dropped` 22.9% -> 6.6%, `style.essay_connectives` 15.4% -> 4.0%,
`style.unsanctioned_bracket` 9.0% -> 1.0%, `fact.condition_named` 12.4% -> 4.0%.

**A third arm at the pre-join baseline says the join by itself made things worse** — `raw_pillar`
4.0% -> 33.8%, `unsanctioned_bracket` 2.0% -> 9.0%. Shown a gloss field with no instruction, the model
bracketed it and reached for raw pillar words. So arm B is partly repair and partly gain, and the
shipping rule follows: **merging the join without the prompt commit ships a measured regression that
every deterministic check passes.**

**THAT THIRD ARM IS CONTAMINATED AND IS NOT A BASELINE ROW.** It was the third consecutive 160-run
batch and it exhausted the API account: 167 HTTP 429s, 81 of 160 runs fell to `fallback_transport`,
fb-net 50.6%, ~100 gate evaluations instead of ~200. Directional only.

**Two checks moved the wrong way and neither was levered.** `style.adverbial` 6.5% -> 11.1%: read as
prose, the hour-less disclosure sentence uses `secara lengkap`, but that sentence exists in both arms,
so the rise is unexplained (the pre-join arm sat between them at 8.0%). `forbidden.fatalism` 0 -> 2
runs, both on chart 101, both to fallback, so neither reached a reader — HARD and rule 25, so it is
flagged rather than filed, and NOT reproduced in 14 targeted renders.

### BLOCKED: the QA re-render, and therefore promotion precondition 3

**The Gemini account's prepayment credits are depleted** (`RESOURCE_EXHAUSTED`, verified 2026-08-12
from the live error body, not inferred). Consequences, stated plainly because they are the reason this
section stops here:

1. **The QA re-render did not happen.** Chart 5, chart 13, chart 1 and fresh-1996 all returned
   `source: module_assembly` — the floor. Four report files were written and then DELETED rather than
   kept, because they labelled floor text as a served reading, and a mislabelled artifact is worse
   than a missing one. **Precondition 3 cannot be met until billing is topped up. That is Reyner's,
   and nobody else can do it.**
2. **The weave is METRIC-VERIFIED AND PROSE-UNVERIFIED.** arm B's 160 runs are real LLM output and
   the rates moved hard in the right direction, but the harness stores no prose without `--rider`, so
   **no captured sentence shows the gloss landing as a clause.** The first thing to do when credits
   return is the re-render, and the question is unchanged: does it read as a clause or as a
   definition, and does the breath phrase fire when two facts share a pillar?
3. **Chart 5's deferred `quietFloor` re-ask stays deferred.** It needs a real read of full cells, and
   there was no real render to read. The standing note stands: a threshold that looks mis-set may be
   reading a content gap.

**A CLAIM OF THIS SESSION'S OWN, RETRACTED.** The prompt commit's message says no captured prose
contained a four-digit year, offered against the `forbidden.fatalism` hits. **That evidence is void:**
the probe read `res.rendered.blocks`, and `renderReading` spreads `gate.normalized`, so blocks live at
`res.blocks` — the scan ran over an empty string and could not have found anything. What survives is
the part that came from `res.findings`: fatalism did not reproduce in 14 renders. The year hypothesis
is neither supported nor excluded.

## 2026-08-12 — TRANCHE 2B: fix-plan step 2 is CLOSED (15 action lines)

The content revision pass from the 2026-08-10 mirror QA verdict is complete. Two commits, the #28
shape: `1a42a69` put `content/tranche2b-rulings.md` on `main` alone (PR #40, merged `fa85302`
2026-08-12 17:29 +0700, from `git log`), then `273292a` applied it. Fifteen `actionable_seed`
assignments, no scaffold, no wiring, no engine path.

**Every glossary cell a fact can carry now has an action line**, except the three deliberately
without one: `elemen.*` (consumed only by `day_stem`, declared non-actionable in `ACTIONABLE_KINDS`),
`bintang.天乙貴人` (ruled NO CHANGE in tranche 1) and `bintang.華蓋` (descoped). QA finding 3,
"jargon without a Monday morning", is answered for the whole glossary rather than for one tranche's
cells.

**THE TRIPWIRE, FOURTH CHECK, STILL CLEAN: cache keys 13 of 13, fact order 0 of 13, importance
vectors 0 of 13.** 13 of 13 keys is the strongest available form of "this reached every reader" and
it agrees with the per-cell fire lists — the union of the 15 cells' fixture charts is all 13. See
MEASUREMENTS.

### The bend the gate forced, and why the check is the thing that is wrong

Recorded because the finding message alone points at the text, and the text is fine.

`relasi_cabang.害`'s ruled line ended `... ledakan yang tak perlu di kemudian hari.` That idiom
carries the bare token `hari`, and `fact.relation_positions` (`lib/validate/fact.js:423`) reads a
bare pillar word as a claim about that pillar. It **skips a block that names no position at all**
(`fact.js:439`), so the floor's 害 block had never been scanned; the new sentence supplied `hari`,
the scan concluded the text named `[day]`, the fact spans `[month, year]`, and both were reported
DROPPED. Severity is HARD, and `lib/mirror/handlers.js#floorRefusalReason` turns a hard-rejected
floor into a **503**.

Measured before the bend, 13 fixture charts plus the hour-less chart: **HARD on charts 6, 8, 10, 11
and hour-less 1989-02-04 — every chart `害` fires on.** The stage6 test asserts per chart and stops
at the first, which is why the failure initially presented as one chart; probing all 13 is what
showed the real blast radius. Three words were deleted (nothing added, no word in that cell authored
by Code), and it is **flagged in the rulings file for Reyner to accept or reverse**, with two
verified alternatives (`pada akhirnya`, `nanti`).

**THE RECOMMENDATION, NOT DONE HERE: add the temporal idioms to `NOT_A_SPAN`** —
`kemudian hari`, `suatu hari`, `hari ini`. It is a gate change and needs its own measurement
(rule 13), and this tranche touches no engine path by instruction. **The sentence bent, not the
check, which is the `aspek.比肩` ruling — but the check is where the defect lives.** Promoted to the
promotion checklist as precondition 4; the full history is the next block.

### `fact.relation_positions` — the whole history, because it has now cost work four times

Recorded 2026-08-12 so the next session inherits the pattern instead of the latest symptom. **The
check has been known broken since 2026-08-04 and every round has fixed a DIFFERENT surface form of
one root cause: it reads a bare pillar word as a claim about that pillar.**

| # | When | What it cost | What was fixed |
|---|---|---|---|
| 1 | 08-04 → 08-05 | Diagnosed at **8 of 8 failures are gate false positives** (MEASUREMENTS, 08-04 row: *"the check scans for bare `tahun/bulan/hari/jam`"*). Then a second diagnosis, because the first was right about WHAT and wrong about WHY | Gate `1.2.0` (`8c64d37`) scoped the scan past the prompt's own mandated forms (`batang bulan`, `cabang hari`, `Hari lahirmu`) |
| 2 | 08-06 | Survived a prompt instruction, a payload handover and the scan scoping; still 14-18% | Gate `1.4.0` dropped the `extra` condition and kept `missing`. Went to **zero across 130 runs** |
| 3 | 08-11 | **Found by the tranche-1 CONTENT pass on a ruled glossary string** — `kehidupan sehari-hari` in `relasi_cabang.半合.cost_seed` raised a HARD finding on **5 of 13** fixture charts, a false accusation of a false statement about the reader's own chart | PR #25, two commits: a whole-token scan (`\bhari` was claiming `sehari-hari`, `jam` claiming `jaminan`, `bulan` claiming `bulanan`) plus reduplicated plurals |
| 4 | 08-12 | **Tranche 2b.** HARD on 4 fixture charts + the hour-less chart, i.e. every chart `害` fires on; three words deleted from a ruled string | **Nothing.** The sentence bent, because this tranche was instructed to touch no engine path |

**TWO CORRECTIONS TO HOW THIS WAS BRIEFED, both found by checking the repo, and the second one
strengthens the case for the fix rather than weakening it:**

1. **Tranche 2b is the FOURTH time this check has cost work, not the third.** Round 3 (08-11) was a
   separate fix round with its own PR and two commits; `git log --all --grep="relation_positions" -i`
   shows it. Three fixes have shipped for one root cause.
2. **It is NOT the first time it hard-rejected a Reyner-ruled engine string. Round 3 was too** —
   also a ruled glossary cell, also found by a content pass, also HARD, on more charts (5 of 13).
   **What differs is the RESOLUTION, and the two rounds went opposite ways.** `7f289f0`'s own commit
   message says, in capitals: *"THE PROSE IS NOT THE BUG AND IS NOT CHANGED. `kehidupan sehari-hari`
   is ordinary Indonesian."* That session fixed the check and refused to touch the prose. Tranche 2b
   bent the prose, because of the no-engine-path instruction. **So the repo now contains one ruled
   string bent to satisfy a check that an earlier session explicitly refused to bend prose for.**
   That inconsistency is the argument: the precedent is "fix the check", and the fix is still not
   built. Reyner ratified the deletion 2026-08-12 (three of his words removed, none added, and every
   alternative introduces new vocabulary), so 2b's bend stands — but it stands as the exception.

### ROUND 4 IS CLOSED, 2026-08-12: the check was fixed and Reyner's words restored

**Gate `1.8.0` -> `1.9.0`.** Two commits, in this order, because the second is the first one's
regression test: `NOT_A_SPAN` gained three classes, measured with the bent string still in place
(rule 13); then `di kemudian hari` went back into `relasi_cabang.害` and the fixed check passes it.
**The ruled wording ships complete.** The `sesegera mungkin` -> `begitu terlihat` bend STAYS —
`style.hedging` is a legitimate ban, and that distinction is the whole content of COWORK-BRIEF error
22.

**THE FIX WENT WIDER THAN THE THREE NAMED IDIOMS, and the extra scope came from evidence.** The whole
glossary and `renderer-prompt.txt` were swept through the real stripping and tokeniser, and **eight**
bare pillar tokens survived, none of them a span statement: `bulan ini` (`aspek.正財`,
`elemen_dominan.controls`), `tujuh hari` (`bintang.文昌`), `enam bulan ke depan` (`kekuatan.balanced`),
`satu hari seminggu` (`elemen_dominan.drains`), `di jam yang sama` (`elemen_hilang.土`), and
`bulan Ayam` / `tahun Ular` from the prompt's own examples. So the patterns are three CLASSES —
counted duration, calendar deictic, temporal pre-modifier — and the named idioms fall inside them. A
list of three would have been round 5 waiting to happen.

**`bulan Ayam` and `tahun Ular` are deliberately NOT stripped**, and the reason is a trap worth
keeping: stripping only ever REMOVES a position from `named`, and `missing` is derived from what is
named, so stripping a form that genuinely names a pillar moves it into `missing` and makes the check
fire where the text is right. Strip only what cannot be a chart reference.

| measured, 13 fixture charts + the hour-less chart | gate 1.8.0 | gate 1.9.0 |
|---|---|---|
| span NOT stated + a calendar unit (the floor's shape), every relation fact x each of the 6 live cells | **108 of 108 HARD** | **0 of 108** |
| span stated correctly + a calendar unit (control) | 0 of 108 | 0 of 108 |
| floor hard-rejected | 0 of 14 | 0 of 14 |
| cache keys / fact order moved by the restore | — | 4 of 13 keys (charts 6, 8, 10, 11) · **order 0 of 13** |

**ONE CLAIM OF THIS SESSION'S OWN WAS DISPROVED BY THAT MEASUREMENT and is corrected rather than
quietly dropped.** The first draft of the fix asserted that any braid of one of those cells with a
relation fact was a hard finding waiting to happen. **It is not:** with the span stated correctly a
calendar unit changes nothing, because gate `1.4.0` dropped the `extra` condition. It fires only when
the block does NOT state the span, which is what stops `named.size === 0` from skipping.

### NEWLY VISIBLE, PRE-EXISTING, AND NOT FIXED: the floor never states a relation's span

Found while measuring the above, and it is the reason the check had been silent on the floor for so
long. **A `branch_relation` fact carries no `fact.palace`** — its span lives in
`provenance.positions_id`, pre-verbalised as palace names ("Pilar Akar dan Pilar Kerja") — **and
`assembleFallback` prints only `fact.palace`.** So every floor relation block says what the relation
IS and never where it sits, and the check skipped it because nothing was named. Tranche 2b's idiom
made `named` non-empty, which unmasked the gap and then mis-described it as *"the text names [day]"*.

So the 503s were a false positive about a REAL omission. **Not fixed here** (own change, own
measurement, and it is a content-quality question: the floor is meant to be bland, but a relation with
no location is thinner than the data allows). The cheap version is one line in `assembleFallback` —
lead a relation block with `provenance.positions_id`, which authors nothing, since the string is
already engine-owned and Reyner-reviewed.

### The forward argument, recorded because it is why this could not wait

**Compat content is relationship prose, and temporal idiom is native register there.** The v1 money
engine is about two people over time — how they meet, where friction recurs, what is coming — so
`suatu hari`, `bulan ini`, `di kemudian hari`, `beberapa tahun ke depan` are the natural way to write
it, not edge cases to be avoided. **Every future content tranche pays this tax until the check is
right, and each one presents as a content problem when it is a gate problem**: the author sees a HARD
finding on their own sentence and the cheapest response is always to change the sentence. That is
exactly what happened in tranche 2b, and it is how a broken check quietly edits the product's voice.
The fix above is what stops the compat pass from spending its budget on the same argument.

**Why it was safe to defer and unsafe to defer past promotion, which is why it was a precondition
rather than a backlog item:** a hard finding sends the reading to the module-assembly floor, and
`floorRefusalReason` answers a hard-rejected floor with a **503**. Behind the preview fence at zero
traffic, that is a curiosity nobody hits. On a public mirror it is a 503 generator, and the trigger is
not exotic: **Indonesian uses `hari` temporally far more often than positionally** (`kemudian hari`,
`suatu hari`, `hari ini`, `sehari-hari`), the renderer writes free prose by design, and rule 15 puts
an LLM in that path. Every round so far was found by content authoring, where the string is fixed and
inspectable. **Round 5 would have been found by a reader — which is why round 4 ends in a fix and not
in a bent sentence.**

### External feedback adjudicated (Gemini, via Reyner, 2026-08-12)

Same treatment as the 2026-08-10 Gemini round, and for the same reason: recorded so it is not
re-imported wholesale later.

**REJECTED — "sort facts by real actionability seeds instead of the false `actionable: true` flag".**
This recommends undoing PR #34. `actionabilityOf` (`lib/semantic/hierarchy.js:219`) reads
`ACTIONABLE_KINDS` only, and its own comment states the reason: `fact.actionable` **is** the
`actionable_seed` string, so scoring on it made a fact more important because somebody had written
more words about it. **Prose buying rank is the bug that was removed, not a feature to restore.**
Measured three times since, now four: a content tranche moves cache keys and never fact order. There
is no version of "sort by the real seeds" that does not re-couple authoring to ranking, and rule 14
gives order to the engine, as a function of the chart.

**ADOPTED / ALREADY TRUE — prose is decoupled from ranking, and the copy constraints are
architectural boundaries** rather than style preferences (rule 25; golden rule 3 on 冲 and 刑 — a
clash is a forced upgrade, 刑 is self-authored entanglement, never punishment). Both are already how
the system works; the feedback is right and is not new work. Tranche 2b's `冲` line states the
upgrade outright (`dorongan untuk naik kelas`) instead of merely avoiding the word damage, which is
the most direct satisfaction of golden rule 3 in any wording so far and is worth preserving if that
cell is revisited.

**NOTED — the renderer-side context join (`pilar.*.domain_id`) is the real remaining bottleneck.**
Correct, and already queued: it is item (a) of the post-tranche renderer pass recorded in the
tranche-1 verdict below (QA finding 5, `domain_id` is in the glossary for all four pillars as data
and nothing reads it yet). **Not new work, and not a new finding.** It rides with item (b), the
breath phrase for two facts in one pillar, because both are first-mention prose rules in the same
section and one paired measurement is cheaper than two.

## DONE 2026-08-12 — TRANCHE 2A merged (28 ruled strings + the `elemen_dominan` wiring)

Fix-plan step 2 continues. **PR #38, merged 2026-08-12 17:14 +0700 as `ceb77db`** — dates from
`git log origin/main --format="%h a:%ad c:%cd %s" --date=iso`, never a session clock (error 18). Two
commits, deliberately separate (rule 13), both measured on their own: `6947af0` 16:41 and `ac24441`
16:43, both +0700. Numbers are in MEASUREMENTS; this section is the mechanism.

- **`6947af0` content** — `elemen_dominan` scaffolded as a new glossary group (five keys, `name_id`
  null on all five, following the `elemen_hilang` precedent) and 28 assignments applied verbatim from
  `content/tranche2a-rulings.md` via `apply:rulings --expect 28`. 24 are the tranche, **4 are a
  register sweep** of Reyner's already-ruled `gampang` -> `mudah` in cells tranche 1 never touched.
  The highest-frequency gap it closes is `kekuatan.balanced.actionable_seed`: it fires on 8 of 13
  fixture charts, and Prompt K put strength in the OPENING SPINE of every reading, so the block where
  8 of 13 readers meet themselves carried no action line at all.
- **`ac24441` engine** — `element_dominant` now reads `elemen_dominan` keyed by
  `relation_to_day_master`, not `GLOSSARY.elemen[hanzi]` keyed by element.

**WHY THE WIRING WAS A CORRECTNESS FIX, not a content nicety.** The old binding served the element's
CHARACTER entry, which describes what it is like to BE that element. So a reader merely SATURATED with
an element was handed the paragraph written for somebody else's day master. **Fixture chart 5 is the
case Reyner caught in the quiet-chart read** (08-11 row, `reports/mirror-qa-chart-05-quiet.md`): a Fire
day master whose dominant-Earth block was the Earth person's description, which is exactly why her
Pemijar block and her dominant-element block read as one mechanism said twice. That read attributed the
padding to unwritten content and ruled `quietFloor` untouched; this is the second, independent cause
underneath the same complaint.

**THE FLOOR IS NOW 13/13 CLEAN, and the cause was nobody's prediction.** See the MEASUREMENTS row.
Short version: the last two findings were `structure.duplicate_sentence` on charts 2 and 8, the two
`same`-relation charts, where `element_dominant` and `day_stem` resolved to the SAME glossary entry and
the floor printed it twice. Relation-keying removed the collision at its source. **The generalisable
rule: two facts that can co-occur must not share a glossary node.** It reached the gate looking like a
floor-renderer defect and it was a data-binding collision, the same shape as the 08-04 Stage 3 collapse
gap arriving through a different door.

**Both of the rulings file's flagged notes are CLOSED** (Reyner, 08-12): `dengan jernih` confirmed at
`aspek.傷官` — it is already the applied text, so nothing needs re-applying — and `output`/`input` stay
as ruled in `elemen_dominan.drains`. `content/tranche2a-rulings.md` carries nothing pending; a later
session must not read either note as an open question.

**One prediction in the tranche-2a prompt was wrong and it is COWORK-BRIEF error 21.** It said the
wiring would move fact order on 8 of 13 charts because the fact "finally carries an actionable". But
since PR #34 actionability has been declared rather than inferred, so writing prose cannot buy rank at
all, and the measured answer is 0 of 13 with identical importances. The row exists for the second half: the prompt
also said the move would be *"expected, NOT
the re-coupling tripwire firing"*, which would have authorised dismissing a genuine alarm. **A
prediction that tells a reader what to disregard must carry its grep.**

## DECIDED 2026-08-10 — MIRROR QA VERDICT (Reyner, buyer-hat): promotion condition 3 NOT MET

The four production QA readings (Prompt J run, gate `1.8.0`, all four passed the gate) were judged
by Reyner reading as the buyer. **Verdict: not ship-quality.** The pipeline is sound — the floor
retry proved itself live, chart 13 served the rule-3 pillars exactly — and the prose still fails
the reader. All four findings are EXPERIENCE-level, invisible to the gate by construction:

1. **Identity buried.** The reading opens on the most dramatic finding and reveals who-you-are just
   before the penutup (Samudra ranked ~9th of 12 on `fresh-1996`). The importance descent is doing
   exactly what it was designed to do, and the design is wrong for the opening. **RULING: the
   reader meets herself first** — day master + strength + main profile as the opening spine, then
   the descent. This amends the descending-hook order for the OPENING ONLY. Build: Prompt K.
2. **Modular stacking.** Blocks read as engine output stacked, no thematic handoffs. NOTE: the fix
   cannot be connective words — `essay_connectives` is a live ban that came from Reyner's own blind
   judging. Deferred to a LATER prompt (engine-assigned narrative-role tags + a handoff
   instruction), only if the stacking survives K + the content pass. One change at a time (rule 13).
   **CLOSED 2026-08-11 — it did not survive. Thematic headers plus grounded action endings closed
   the seams; step 3 is CANCELLED and was never built. See the tranche-1 verdict below.**
3. **Jargon without a Monday morning.** Most cells carry no actionable, and label_meanings assume
   the reader will accept a BaZi label as an explanation.
4. **Gift/cost reads as contradiction** (missing-Wood: "starts easily" vs "stays stuck for years";
   桃花: attention vs closeness-gap). The pair is true in the mechanism and unreconciled in the text.

**The sharpest sub-finding (checked against the served file, not memory): the 桃花 actionable WAS
present in the reading Reyner reviewed, one sentence after the cost he quoted — and he did not
experience it as a fix, because it answers the GIFT (use first impressions early) and leaves the
COST (the closeness gap) unanswered. CONTENT RULE, ratified: every `actionable` must answer its
fact's COST, not restate or amplify the gift. Cells whose actionable fails that test count as
having none.**

**The fix plan, in order (one change, one measurement):**
1. **Prompt K** (`prompts/K-identity-first.md`) — identity-first order. Engine-owned, no register.
   Primary metric is Reyner's re-read; harness n=10 is the regression guard only.
   **DONE 2026-08-11, PR #21. Reyner's re-read passed it.**
2. **Content revision pass** (Cowork + Reyner, no code) — every glossary cell against three tests:
   cost-answering actionable; a reconciling hinge between gift and cost; jargon demoted to a
   secondary clause behind the behavior it names (rule 23 unchanged: Indonesian name first, EN
   bracket once). This pass REPLACES the queued compat content session in the schedule — compat
   cells will be authored to whatever pattern survives this pass.
   **TRANCHE 1 DONE 2026-08-11, PR #22 + #24. PASSED — see the verdict below. Tranche 2 GREEN-LIT.**
   **TRANCHE 2A DONE 2026-08-12, PR #38 — see the 08-12 section above.** It also carried the
   `elemen_dominan` wiring, which closed the last floor finding and the second cause under chart 5's
   padding.
   **STEP 2 IS CLOSED BY TRANCHE 2B, 2026-08-12** — PR #40 put the rulings on `main`, the applying
   commit landed the last 15 action lines. Every cell a fact can carry now has one, except `elemen.*`,
   `bintang.天乙貴人` and `bintang.華蓋`, all three deliberate. **What remains of this fix plan is
   step 4, the voice A/B, which was always gated behind steps 1+2.**
3. ~~**Transitions / narrative roles**~~ — **CANCELLED 2026-08-11, not deferred.** See below.
4. **VOICE A/B (added 2026-08-10, Reyner's call after the Gemini-feedback discussion).** Two
   renderer prompts identical except the voice paragraph: the current composed-voice wording vs a
   revision worded by Reyner+Cowork (informed by, not copied from, the "grounded mentor" instinct —
   sharper, consequence-driven, coffee-table direct). Anonymised pairs over the same charts, Reyner
   judges blind — the exact method that closed the model question 12-4. Runs AFTER steps 1+2, or
   both arms measure stiff content instead of voice. Rule 20 is amended only if the challenger
   wins; the gate's fact checks (hour contradiction, palace joins) are what make a looser style
   leash affordable to even test. His stated principle, recorded: he cannot always articulate the
   model, but he can feel whether output is right — the blind pair is how that feeling becomes a
   measurement.

**External feedback adjudicated (Gemini, via Reyner, 2026-08-10)** — recorded so it is not
re-imported wholesale later: ADOPTED — pre-reconciled gift→hinge→cost→action inside the existing
field contract (the gate's `must_cover` reads fields; no schema change); behavior-first jargon
packaging, corrected to rule 23's Indonesian-first bracket. DEFERRED — narrative_role tags, to
step 3, engine-assigned only. **REJECTED** — the "grounded mentor / executive coaching" voice swap
(re-litigates rule 20's one composed voice; register authority is Reyner, per cell, not a model)
and the blanket ban list of "abstract fillers" (several proposed bans are Reyner-reviewed glossary
lines tied to archetype imagery; the `hedge_construction` lesson stands — a ban can spend most of
its budget on prose the product requires, and only the gallery method may justify new bans).

Cache note: step 1 and step 2 each move every cache key (JSON order, glossary strings). Expected
and free at zero traffic; both must land before promotion re-QA.

### TRANCHE 1 VERDICT 2026-08-11 (Reyner, buyer-hat, on the landed stack)

**PASSED.** The action lines land as advice - his words, *"night-and-day"* against the pre-tranche
readings. Register is clean: no translationese, no mangled sentences. Finding 3 of the QA verdict
("jargon without a Monday morning") is answered for the cells tranche 1 wrote.

Read on `reports/mirror-qa-chart-01-tranche1.md` and `reports/mirror-qa-fresh-1996-tranche1.md`.

**FIX-PLAN STEP 3 (transitions / narrative roles) IS CANCELLED, NOT DEFERRED.** Finding 2, modular
stacking, is closed without ever building the fix that was scoped for it. **Thematic block headers
plus grounded action endings closed the seams on their own** - a block that ends on something the
reader can do does not read as an isolated module, and the next header re-orients her without a
connective. The reader does not miss the handoff.

This is worth keeping because the scoped fix would have been wrong twice over: engine-assigned
`narrative_role` tags plus a handoff instruction, built to solve a problem that two unrelated
changes dissolved. **The seam was never a transitions problem; it was an endings problem.** Rule 13
held the line - step 3 was gated behind "only if the stacking survives K + the content pass", and
it did not survive. Do not revive it without new evidence from a real read.

**Two items are recorded for ONE small renderer-prompt pass AFTER tranche 2 lands**, paired
same-day per the 08-11 baseline method rule, and NEITHER IS BUILT NOW:
  a. **The pillar-domain gloss, woven into the first palace mention.** QA finding 5; `domain_id` is
     already in the glossary for all four pillars as data (tranche 1), and nothing reads it yet.
  b. **A breath phrase when two facts stack in one pillar** - "Di pilar yang sama, terdapat juga
     ..." Reyner's nitpick from the chart-1 read.
They ride together because they are both first-mention prose rules in the same section, and because
one paired measurement is cheaper than two.

Date-stamp note, CORRECTED 2026-08-11 before this section was committed: the draft of this entry
claimed the 08-07 stamps on the rule-16 amendment note, the J header and the COWORK-BRIEF renumber
note were wrong and told later sessions to change them to 08-10. **They were right and they stay.**
`git log -6 --format="%h a:%ad c:%cd %s" --date=iso` puts `6ca09b6` and PRs #18-#20 at 2026-08-07
22:19-23:10 +0700, author and committer both; `reports/mirror-qa-fresh-1996.md:5` says the QA
readings were served on production 2026-08-07. What happened on 08-10 is the buyer-hat READING of
those files, which is what this section is dated for. COWORK-BRIEF error 18.

### RE-READ VERDICT 2026-08-11 (Reyner, buyer-hat, on the K re-renders)

**Finding 1 is FIXED.** Reyner, on `reports/mirror-qa-chart-01-K.md` and
`reports/mirror-qa-fresh-1996-K.md`: *"meeting yourself first completely fixes the upside-down
feeling."* **K's primary metric passed, so step 1 of the fix plan is DONE** and merged as PR #21.
Note what carried the decision: the harness could not settle it (see the 08-11 baseline row in
MEASUREMENTS - the stored gate row did not reproduce), and the re-read did. That is the order of
authority this prompt was written with, and it held.

**Findings 2 and 3 are CONFIRMED as still present** - stacked blocks, and cold system labels - and
stay assigned to steps 2 and 3 exactly as planned. Neither is re-opened by this verdict.

**NEW FINDING 5 - palace names carry no life-domain context in prose.** "Pilar Kerja" reads as an
internal variable that leaked to the user. The reader cannot tell whether it means her job, her
career arc, or how she is seen. The name is doing the work of a label while telling her nothing.

**RULING (Reyner): fix by WEAVING the domain gloss into the FIRST MENTION in prose.**
`GLOSSARY.pilar.*.label_meaning` already carries the reviewed definitions - verified 2026-08-11,
`node -e "const g=require('./docs/content/glossary.json'); console.log(g.pilar.month)"` returns
*"Karier, lingkungan profesional, dan relasi kerja. Ini adalah panggung utama tempat orang lain
menilai kemampuanmu."*, and all four positions carry one - **so this is a JOIN, not new authoring.**
A legend variant may live in the CHART DISPLAY block later; **never before the prose.** A legend
first would teach the reader to decode a table instead of reading a sentence, which is the same
comprehension tax rule 23 removed from headings.

**Assigned to step 2 (the content revision pass), with a likely small payload join to follow it.**
The content pass decides the wording; a payload change, if one is needed to put `label_meaning`
where the renderer can reach it per fact, is a separate engine commit measured on its own (rule 13).

## DECIDED 2026-08-05 — test-ungate flag REMOVED; the paywall is live again as an INTERIM state

**Why now.** Xendit rejected the site a second time: *"This contents of this website are incomplete.
Make sure it contains your product / services, prices, checkout page, address, and contact number."*
The rejection is CORRECT and Prompt I did not cause it. `/harga`, `/tentang`, the legal pages and the
footer entity all shipped 08-03 and are fine. What was missing is a reachable **checkout**, because
`NEXT_PUBLIC_FREE_FULL_READING` was still set in Vercel and it had quietly become the architecture.

Evidence, both run 2026-08-05 against a freshly generated reading on each host:
```
prod  https://www.katon.app/r/ZVm4Aghlo9q1zVDjGFQXi
  buttons: ["← Ganti tanggal","Simpan Gambar","Kabari aku","Kabari aku",<footer links>]
  hasRp:   false
local (flag unset) http://localhost:3000/r/g8JgXk2w8TkNPRrDUrUXy
  buttons: ["← Ganti tanggal","Simpan Gambar","Hubungan","Karier","Uang","Buka Refleksiku"]
  rp:      ["Rp 300-500rb.","Rp 19.000"]
```
The flag routed the paywall through `ungating` -> `unlocked`, so `Teaser` — the only component that
renders a price or a buy button — never mounted in production. Not a copy problem; the checkout did
not exist on the live site.

**What shipped.** Removed from every code path, not switched off: `lib/flags.js` deleted,
`freeFullReadingEnabled()` gone from `components/Funnel.jsx` (import, `ungating` stage, the
up-front `/full` fetch, and the `ReadingByToken` re-visit branch) and from
`app/api/reading/[id]/full/route.js`, whose gate is now `row.paid === true` and nothing else.
`.env.example` carries a do-not-reintroduce note in place of the old stanza. Verified on the dev
server: an UNPAID reading returns `paid:false`, no `paidContent`, teaser only. Reyner deletes the
Vercel env var on a coordinated deploy.

### THE INTERIM STATE — do not let this ship quietly past submission

> **CLOSED 2026-08-13.** This is the interim's own write-up and it stays as the record. Its status,
> its end condition and its owner now live in **THE INTERIM REGISTER** at the top of this file, and
> what a user gets while it is still deployed is in **LIVE STATE**. This section had no end condition
> and no owner, which is why it outlived its window by eight days and was found by accident. Read the
> registers first; read this for the reasoning.

**XENDIT VERIFICATION APPROVED — go-live ritual executed 2026-08-07 (Cowork session), status:**
- Business verified, bank account (BCA, PT KATON DIGITAL NUSANTARA) **active**.
- Live `xnd_production_...` key + live webhook verification token generated and **swapped into
  Vercel Production; redeployed.** The live-key-swap item below is DONE.
- Webhook URL saved for Invoices-paid + paid-after-expiry. Xendit's test callback returned 502
  `invoice_lookup_failed` — that is the fail-closed design PASSING (fictional invoice, re-fetch
  refused; the token check passed en route). Not a defect.
- **QRIS channel: ACTIVATED 2026-08-11** (Reyner's report, recorded here 2026-08-12 — before this it
  existed only in the Cowork chat and nowhere in the repo, which is why a session reading the ledger
  would still have believed a real purchase was impossible). The NMID registration cleared on the
  patient path, so the WAIT decision below was correct and no channel was lifted temporarily.
  ~~"In Progress" — no real purchase is possible until it flips to Activated~~ — closed.
- **THE GO-LIVE RITUAL HAS EXACTLY ONE STEP LEFT: the first real self-purchase.** Rp 19.000, own
  birthdate, own bank app, then **screenshot the paid invoice into the ledger.** Nothing else in the
  ritual is outstanding: business verified, bank account active, live key and webhook token swapped
  into Vercel Production, webhook URL saved, QRIS activated. **This step is Reyner's alone** — it
  requires his bank app and his money, and Cowork/Code cannot perform it or verify it for him.
  It is what proves the money path end to end: invoice created, QR scanned, webhook verified, `paid`
  flipped server-side (rule 18: `paid` flips only in the verified Xendit webhook).
- **Channels ruling (Reyner 2026-08-07): launch is QRIS-ONLY.** Coverage is universal via bank/
  e-wallet apps, MDR ~0.7% vs ~Rp 4.000 flat for VAs (a fifth of the ticket). Additional channels
  are a conversion lever to revisit ONLY on measured payment-step abandonment.

~~RESUBMITTED 2026-08-06, awaiting review~~ — superseded by the approval above. The original
warning stands for the FUNNEL mismatches below, which remain live until the fulfillment swap.

Re-enabling the paywall re-enables the **legacy 19k unlock**, which is NOT the product CLAUDE.md
describes. Two specific mismatches, both accepted by Reyner for the Xendit submission window and
both live the moment the deploy lands, plus one live-key swap that must not be forgotten:

1. **The free mirror is no longer complete.** Rule: FREE is the full mirror, ungated, and paid is
   "an upsell offered AFTER the free reading lands, never a gate." What actually happens now is the
   7-beat Bacaan Mendalam sits BEHIND the Rp 19.000 wall (`Unlocked` in `components/Funnel.jsx`
   renders `paidContent.beat1..beat7`). **The gate is back.**

   **This one sentence is the whole reason the LIVE STATE block exists.** It was accurate the day it
   was written and it stayed accurate for eight days after the interim's window closed, buried at
   line ~967 of a 1,600-line ledger. On 2026-08-13 a Cowork session argued the business model for two
   rounds against a model that was already deployed, because the only place reality was recorded was
   here. **RULED 2026-08-13 (Reyner): the 7-beat deep read is RETIRED and the locked model is
   restored.** Not yet shipped — see precondition 2 below and the swap package at the top.
2. **The charge description did not match what is delivered — FIXED 08-05, then the whole copy set
   followed it.** `INVOICE_DESCRIPTION.artifact` (`app/api/pay/[id]/route.js`) read
   `Katon - CE card + PDF reading` while the buyer received a deep-read unlock, with no PDF and no
   hi-res card anywhere in the paid path. Charging for one thing and delivering another is a
   merchant-compliance risk in its own right, so the string was changed to describe what is actually
   delivered.

   **First fix superseded the same day.** `Katon - Bacaan lengkap` cleared the delivery mismatch and
   created a copy one: `lengkap` was the FREE row's own claim on /harga, so the paid line borrowed the
   word that distinguishes the free product. **Reyner-approved copy set, 2026-08-05: every surface now
   says `Bacaan Mendalam`** — the name the funnel has always used
   (`components/Funnel.jsx:587`, `:712`).

   | Surface | Now reads |
   |---|---|
   | `INVOICE_DESCRIPTION.artifact` | `Katon - Bacaan Mendalam` |
   | `SITE_COPY.harga.lead` | "Bacaan pertamamu gratis. Bacaan Mendalam dibuka sekali bayar, tanpa langganan." |
   | `SITE_COPY.harga.free.body` | "Bacaan personal dari tanggal lahirmu. Tidak perlu akun dan tidak perlu bayar." (drops `lengkap` + "semua bagiannya terbuka") |
   | `SITE_COPY.harga.artifact.name` | `Bacaan Mendalam` (was `Complete Edition`) |
   | `SITE_COPY.harga.artifact.body` | "Menelusuri polamu lebih dalam di hubungan, karier, atau uang. Sekali baca, milikmu selamanya." |
   | `SITE_COPY.tentang.paragraphs[2]` | last three sentences replaced; the card and the card+PDF promises are gone |

   **The card + PDF copy set returns WHOLESALE at the fulfillment swap.** Every string above is
   interim and every one of them has its revert condition in a comment beside it. `harga.launchLabel`
   ("harga peluncuran") is untouched and the badge still renders — it is driven by `isSellable()` and
   `launch < list`, never by copy. **The SKU key stays `artifact`**: display name and SKU key diverge
   on purpose, because the webhook validates the re-fetched invoice amount against that key.

   Verified 2026-08-05 on this branch: `npm run check:copy` passes over SITE_COPY and ENTITY;
   `npm run build` keeps `/harga` and `/tentang` at `○ (Static)`, and
   `grep -o "Bacaan Mendalam" .next/server/app/{harga,tentang}.html` finds the string in both
   prerendered files, so it is in view-source without executing JS.

   **THE LAST SURFACE — CLOSED 2026-08-06.** `SITE_COPY.harga.meta.description` read *"Bacaan Katon
   gratis dan lengkap. Complete Edition dan Compatibility Reading adalah tambahan opsional."* — both
   dead claims at once, on the browser-tab description and the search-result snippet, which is the
   one user-facing string a reviewer can reach without loading the page. It was outside the 08-05
   approved set and was recorded rather than rewritten. **Reyner approved the replacement 08-06:**
   *"Bacaan personal dari tanggal lahirmu, gratis. Bacaan Mendalam berbayar bisa kamu ambil atau
   lewati."* He rejected the alternative of reusing `lead` verbatim: a snippet that clones the first
   line the reader then sees wastes the slot. **With this, every copy surface names Bacaan Mendalam.**
3. **THE WHOLE XENDIT ACCOUNT IS IN TEST MODE until verification passes, so the key in Vercel is a
   TEST key too.** Nothing in production can take real money today. After verification succeeds,
   generate LIVE keys and swap them in Vercel **before any real transaction** - both
   `XENDIT_SECRET_KEY` and `XENDIT_WEBHOOK_TOKEN`, since the callback token is per-mode as well.
   A test key in production fails silently in the worst direction: invoices are created, the webhook
   never settles real money, and the paid unlock never fires for a customer who thinks they paid.
   **This swap is the single easiest thing on this page to forget.**

**Accepted because traffic is zero** — nobody is being charged in this window. **The fulfillment
swap is the next build priority after submission**: paid delivers card + PDF, the deep-read returns
to the free mirror. Until that lands, this section is the reason the numbers look right and the
product does not.

### THE MIRROR ROUTE IS BUILT AND FENCED — do not promote it early (2026-08-07, Prompt J)

`/api/mirror` exists and serves real Stage 3-6 readings. **Nothing links to it and nothing user-facing
changed.** It is reachable only with the `MIRROR_PREVIEW_TOKEN` header; with the env var unset the
route 404s entirely, which is a missing capability rather than a switch (the STAGE6_VERSION pattern,
and the `NEXT_PUBLIC_FREE_FULL_READING` lesson three sections up).

**PROMOTION** — wiring the funnel to this route and removing the preview-token requirement — is a
SEPARATE, LATER, DELIBERATE commit. Its **four** named preconditions, also written into the header of
`app/api/mirror/[token]/route.js` so no session can promote without reading them (that header was
updated in the same commit as this row, comment only — a checklist that lives in one of two places is
how a session promotes without reading it):

| # | Precondition | Status |
|---|---|---|
| 1 | Xendit verification approved + live keys swapped | **MET 2026-08-07.** QRIS **activated 2026-08-11**; the first self-purchase is tracked above and is NOT part of this condition |
| 2 | **RE-RULED 2026-08-13 (Reyner).** The Rp 19.000 has a deliverable that is NOT the free mirror — card + PDF exist and ship — and `/harga`, `/syarat` and `INVOICE_DESCRIPTION` describe that rather than the deep read. See the re-ruling note below the table | NOT MET |
| 3 | Reyner has QA'd real readings through the preview | **NOT MET, and BLOCKED 2026-08-12: the Gemini account's prepayment credits are depleted, so every render returns the floor.** The queued renderer pass it was waiting on is built and measured (see the 08-12 section); the read itself needs billing topped up first |
| 4 | **`fact.relation_positions` no longer reads a temporal `hari` as a pillar** — the `NOT_A_SPAN` fix, own commit, own measurement (rule 13) | **MET 2026-08-12**, gate `1.9.0`. Added and met the same day; the fix went wider than the three named idioms (see below) |

### Precondition 2, RE-RULED 2026-08-13 (Reyner)

The old row read *"the fulfillment swap shipped — Complete Edition card + PDF exist, so the Rp 19.000
upsell is a real thing to buy."* That framed the swap as something that could land BESIDE promotion.
It cannot, and the ruling that makes it plain is that **the 7-beat Bacaan Mendalam is RETIRED and the
locked free-full-mirror model is restored.**

**RETIRING THE GATE AND REPLACING THE UNVALIDATED PROSE ARE THE SAME ACT.** The paid beats and the
free prose have ONE source. `scripts/build-content.mjs` slices each `contents/<archetype>-<state>-
hubungan-FINAL.md` into 3 FREE and 7 PAID sections of one `lib/content/<archetype>.js`, and the
generator hard-fails if that structure breaks — so the two halves are not merely adjacent, they are
the same artifact. Promoting this route replaces the FREE half with Stage 3-6 output; the same commit
orphans the PAID half, which is the only thing Rp 19.000 buys today. **There is no ordering in which
one of those lands without the other.**

The second half of the act is what those cells are: **not one is founder-validated.** 16 of 20 say
`pending founder validation`, three say SCAFFOLD/pre-validation, one has no STATUS line (counted
2026-08-13; the commands are in the LIVE STATE block at the top of this file). A paying customer
receives that prose today. Retiring the deep read is what stops that, and it is the same commit again.

**So the precondition is now: the Rp 19.000 has a deliverable that is NOT the free mirror.** Card +
PDF exist and ship, and `/harga`, `/syarat` and `INVOICE_DESCRIPTION` describe that rather than the
deep read. Without it, promotion leaves a live SKU selling something the same commit just gave away
for free — which is a merchant-compliance problem of exactly the shape the 08-05 invoice-description
fix already had to solve once.

The full package this belongs to is THE DEFERRED REGISTER at the top of this file, which also lists
what was ruled OUT of it.

**Precondition 4 was promoted from backlog and MET the same day, 2026-08-12.** It was promoted because
the exposure is a difference of kind, not degree: a hard finding drops the reading to the floor, and
`floorRefusalReason` answers a hard-rejected floor with a **503**. Fenced at zero traffic that is a
curiosity found by whoever authors content; on a public mirror it is a **503 generator**, because
Indonesian uses `hari` temporally far more often than positionally and the renderer writes free prose
by design. **Kept in the table now that it is met** rather than deleted, because the row is the record
of why a gate fix was a release gate at all, and a future promotion should be able to see that
reasoning applied once and then satisfied.

**2 of 4** — conditions 1 and 4. The header of `app/api/mirror/[token]/route.js` read **1 of 4** with
condition 4 marked NOT MET until 2026-08-13, because 4 was met here and not there. That is the drift
this checklist was deliberately duplicated to prevent, arriving anyway. **Change a row in one place
and change it in the other in the same commit**, or the copy that is wrong becomes the one a
promoting session happens to read.

Condition 3 is the one J unblocks: QA is
`curl -H "x-mirror-preview-token: $MIRROR_PREVIEW_TOKEN" https://www.katon.app/api/mirror/<token>`
after a POST to `/api/mirror` with a birthdate. It returns JSON, not a page — J built no UI, by
design. **Use `www.`** — the apex 308-redirects to it, and a redirect is the one place a header can
quietly go missing depending on the client (found the hard way during the 08-07 QA run).

**Two migrations must be run BEFORE the deploy** (repo convention): `0007_reading_cache_key.sql` and
`0008_rate_limit.sql`. 0008 is the louder one — the limiter FAILS CLOSED, so code deployed ahead of
that migration refuses every request with a 429 rather than waving them through. **Both applied and
confirmed live 2026-08-07**, not by inspection but by behaviour: the production POST returned 201
(so `cache_key` exists, 0007) and did not 429 (so `rate_limit_hit` answered, 0008).

**RULED 2026-08-07 (Reyner, via Cowork) — the floor serves but is never persisted.** This shipped as
a gap in the first pass: a floor result was stored like any other render, so a one-hour Gemini blip
permanently cost those charts their LLM reading — the next request is a cache hit and the chain never
runs again until `ENGINE_VERSION` moves. Now `persistRendered` refuses a `module_assembly` result and
the next request retries. `CLAUDE.md` rule 16 is amended to match: determinism attaches to the first
generation **that passes Stage 6**. Enforced at the single door, not in the route, so a later route
cannot reintroduce it by not knowing. Costs nothing in churn — `assembleFallback` is pure engine
content, so a refresh during an outage is byte-identical.

**Known gaps still open, recorded not fixed.** 👍 is accepted and stored nowhere: `render_cache` has
no column for it and a counter is a schema change. 胎元 is absent from the mirror's chart display
because its only Indonesian label is hand-authored in `lib/readingView.js` and exists in no glossary
entry; that is a register call and register is Reyner's.

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
- "The test-ungate flag is the mechanism for a free mirror" → **DONE 08-05.** `NEXT_PUBLIC_FREE_FULL_READING`
  is deleted from the codebase, not merely unset, and `lib/flags.js` is gone with it. It HAD become the
  architecture: it was left on in Vercel and the paywall never rendered in production. Do not
  reintroduce it. The mirror being ungated is a FULFILLMENT decision to build, never an env var.
