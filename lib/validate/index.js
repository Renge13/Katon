// ============================================================
// Stage 6 — the deterministic gate
// ============================================================
// Rule 17: nothing reaches a user without passing this. LLM output is guilty
// until validated.
//
// THIS GATE IS LOAD-BEARING, NOT BELT-AND-BRACES. The evidence is in the ledger:
// the banned "bukan X melainkan Y" construction has now escaped an explicit
// prompt ban THREE times (renderer-prompt-notes run 5, twice; PROGRESS
// gate-check run 2, in the penutup). No prompt edit has ever fixed it. A regex
// plus one regeneration is the only thing that has.
//
// NO LLM JUDGES AN LLM HERE. Every check is deterministic, which is what makes a
// pass reproducible and a failure explainable to Reyner in one line.
//
// ── SEVERITY IS AN ETHICS LINE, NOT A CONFIDENCE LINE ──────
//   hard  fact contradiction, forbidden content. Rule 25 and rule 14. An already
//         cached reading that fails one of these falls back IMMEDIATELY
//         (pipeline-spec Stage 7); it does not keep serving while queued.
//   soft  style, coverage, structure. Fail once -> regenerate with a stricter
//         directive. Fail twice -> module-assembled floor + flag for QA.
//   flag  does not fail the gate. Queues a human look.
// ============================================================

import { factGuard } from './fact.js';
import { coverageGuard } from './coverage.js';
import { openingGuard } from './opening.js';
import { bracketGuard, insertBrackets } from './brackets.js';
import { englishArchetypes } from './archetypeTitles.js';
import { forbiddenGuard, styleGuard } from './style.js';
import { structureGuard } from './structure.js';
import { pairGuard } from './pair.js';
import { renderedText, renderedProse } from './text.js';

/**
 * The gate's own version, stamped onto every row it passes.
 *
 * ── THE RULE, AND IT IS NOT ADVISORY ───────────────────────
 * **A change to what this gate ACCEPTS OR REJECTS bumps this constant IN THE SAME
 * COMMIT.** A new check, a deleted check, a threshold move, a blocklist entry
 * added or removed, a token ban replaced by a structural one. If a reading that
 * used to pass now fails, or the reverse, the number moves. There is no size
 * threshold below which it does not: deleting one blocklist pattern is exactly
 * the change this constant exists to record.
 *
 * WHY IT MATTERS, in one sentence: `persistRendered` writes `stage6Version` onto
 * every cached row on purpose - it is the version the reading ACTUALLY passed, not
 * the version installed today - so "which readings were validated under the old
 * rules" has to stay answerable, and a stale constant is the one thing that can
 * make it unanswerable.
 *
 * ── 1.9.0 WAS AMBIGUOUS FOR ONE DAY. THIS IS THAT FIX ──────
 * On 2026-08-17/18, `style.adverbial` was DELETED and `style.hedging`'s `mungkin`
 * was moved out of the blocklist into `hedgeAboutReader()` - a change that stops
 * rejecting readings that used to fail, which is the textbook case for a bump. The
 * constant stayed at 1.9.0, so two materially different gates both stamped
 * `1.9.0` and every row and artifact written under either is indistinguishable
 * from the other by its own label.
 *
 * The two probe artifacts caught in that window are reconciled in
 * `docs/PROGRESS.md` BY FILE MTIME, which is the only evidence that separates
 * them. Their headers are deliberately NOT re-stamped: they were produced by code
 * that self-reported 1.9.0, and editing an artifact's provenance after the fact is
 * the failure this repo keeps finding, not the fix for it.
 *
 * ── 1.11.0: THE OPENING MUST NAME THE ARCHETYPE ────────────
 * 2026-08-21. `opening.archetype_missing` (soft) is a NEW WAY TO FAIL, so the
 * constant moves. Reyner ruled on 2026-08-19 that a reading opening on the element
 * or on an Aspek is unsellable at Rp 19.000; two of four charts in that read failed
 * on exactly that sentence. The obligation is engine-side - `must_cover` gains
 * 'archetype' in lib/semantic/index.js - and lib/validate/opening.js checks it.
 *
 * `brackets.*` shipped in the SAME commit and did NOT move the accept boundary,
 * which is why one bump covered both: every bracket finding was `severity: 'flag'`,
 * and `failing` below excludes flags, so no reading's verdict could differ because
 * of it. It was a reporter.
 *
 * ── 1.12.0 IS SPENT AND WAS NEVER SHIPPED. DO NOT REUSE IT. ─
 * It identifies the gate that ENFORCED rule 23 by rejecting the model - built as
 * ruled on 2026-08-21, then measured: floor rate 0/4 -> 2/4. Under the STRICT
 * precondition 3 ruled the same day a floored chart FAILS, so it was refused and
 * never merged. The branch `feat/rule23-enforced` is kept undeleted, and
 * `docs/qa/2026-08-21-renders-rule23-enforced.md` on it is a real artifact that
 * self-reports `1.12.0` four times. That is exactly the provenance this constant
 * exists to preserve, so the number is burned rather than recycled: a version that
 * names two different gates is the defect the 1.9.0 note above describes.
 *
 * ── 1.13.0: RULE 23 IS APPLIED BY THE PIPELINE ─────────────
 * 2026-08-21. `insertBrackets` runs before every check and puts `(English)` on the
 * first prose mention of each bound term, so the gate now validates - and caches -
 * text that already complies. `brackets.unbracketed` and `brackets.mismatch` stay
 * `flag` and mean "the insertion is broken", never "the model forgot"; a new
 * `brackets.inserted` flag carries each insertion with its surrounding context,
 * because whether a correct insertion READS well is the one thing no assertion can
 * judge.
 *
 * The constant moves because the text being validated is no longer the text the
 * model returned. Rule 14 the right way round: the LLM chooses words, the engine
 * owns names, and putting one engine string after another is formatting.
 *
 * ── 1.14.0: VERDICT WORDS ARE READ AS VERDICTS ─────────────
 * 2026-08-21. Two false positives removed, both reproduced from paid prose, so readings
 * that used to be rejected now pass and the constant moves.
 *
 * `yang kuat` is an ADJECTIVE. The one `fact.strength_same_breath` in the 77-attempt
 * trace fired on "Aspek Pelindung (Direct Resource) yang kuat", where the word modifies
 * the Aspek and claims no verdict - a token ban where the defect is a construction, the
 * same shape as the `mungkin` fix. `verdictUse` skips adjectival hits and SCANS ON, so
 * an early adjectival use cannot mask a bare label later in the block.
 *
 * AN ELEMENT IS NOT A SUBJECT. The verdict-claim pattern was
 * `\b(kamu|<element>)\s+<wrong>\b`, so on fresh-1996 - element Air, verdict strong -
 * "Unsur Air seimbang dengan Logam" read as claiming the verdict is Seimbang. Rules 9
 * and 10 say the bars are a display distribution and NEVER a strength score, so that
 * check was making the conflation the engine forbids. The subject list is reader words.
 *
 * NOT CHANGED, and recorded as a limit: the second pass still fires on any wrong verdict
 * word inside the block that CITES the strength fact, whatever the subject. No false
 * positive has been observed against it, and widening a check on a hypothesis is what
 * this repo keeps paying for.
 *
 * ── 1.24.0: THE COMPAT OPENING IS THE ENGINE'S SENTENCE ────
 * 2026-09-13. No check was added, removed or re-thresholded. The constant moves
 * for the 1.13.0 reason exactly: the text this gate validates is no longer the
 * text the model returned. `lib/render/pairOpening.js` puts the ruled
 * `kompatibilitas.p0_opening` block at the front of every pair rendering, on the
 * model path before this function runs and on the floor path on the way out, and
 * drops the model's own opening if it wrote one.
 *
 * So the accept boundary DOES move, even though no predicate here changed: a
 * paraphrased opening used to be a reading that passed `pair.both_named` (both
 * names were present - the check doing its job, and its job not being the one
 * that was needed) and now it is a reading whose opening was replaced before the
 * check ran. Same input, different verdict on the served text, which is what this
 * constant answers for. `docs/qa/2026-09-11-compat-three-pair-walk.md` E2 is the
 * render that made the case.
 *
 * `checkBothNamed` IS DELIBERATELY UNTOUCHED and now reads the engine's own
 * sentence. That is not the gate marking its own homework: the day the template
 * is edited into a sentence naming one person, the reading must still fail, and
 * a check weakened because "the engine writes it now" is how that stops being
 * true.
 *
 * ── 1.25.0: `hedge_construction` IS EXEMPT FOR PAIRS ────────
 * 2026-09-13, Reyner's R2 and R2-SCOPE (verbatim in `blocklist.json`, and in
 * `docs/prompts/Z-close-2026-09-13.md`). This one DOES move the accept boundary
 * and in the loosening direction, which is why it ships alone: a compat reading
 * may now say `bukan X, melainkan Y`, and a mirror reading still may not.
 *
 * THE CAUSE WAS UPSTREAM OF THE CHECK, which is the only reason a ban is being
 * narrowed rather than a prompt being edited. The compat prompt MANDATES the
 * reframe - a clash is a map, not a verdict - and the precise Indonesian for
 * that meaning is the shape the 2026-08-06 gallery ruling banned on the mirror.
 * A ruled instruction and a ruled check were pointed at each other, and the
 * clash-pair reader was the one most likely to be served the floor as a result:
 * all three visible floor literals in `docs/qa/2026-09-13-compat-three-pair-
 * walk-v2.md` (:162, :219-220, :248) are this check on that move.
 *
 * WHAT DID NOT MOVE, asserted in `tests/compat-stage6-pair.spec.mjs`: the
 * pattern, the `bukan berarti` carve-out, `pair.reframe_missing`, and every
 * mirror verdict - `styleGuard(r, t, p, mirror)` is still deep-equal to
 * `styleGuard(r, t, p)`. The mirror assertions in `tests/stage6-validation.spec.mjs`
 * were left exactly as they were, so they now serve as the proof of that.
 *
 * ── 1.26.0: THE VOICE-v2 DETERMINISTIC GATE, D1-D4 (2026-09-24) ──
 * Voice v2 round 2 (docs/content/voice-v2-spec-2026-09-24.md §4a), VOICE=v2 only:
 * a v2 semantic JSON is judged by `lib/validate/v2.js` instead of this function.
 * D1 invented term / D3 form / D4 ethics lexicon hard, D2 uncited required point
 * soft; every `style.*` and stem-overlap finding is LOGGED at `flag` and can no
 * longer reject a v2 reading; D4 promotes `verdict` to hard for pairs and leaves
 * `ranking` / `self_harm` logged. v1 - what production serves - is untouched:
 * this function and its checks did not change, and the v1 suites prove it.
 *
 * ── 1.27.0: THE VOICE-v2 JUDGE, J1-J4, GATES (2026-09-24) ─────
 * VOICE=v2 only. After D1-D4 pass, one judge call (`lib/validate/judge.js`):
 * J1 invention / J2 invented causality hard, J3 certainty soft, J4 coverage hard
 * when the COST is missing and soft otherwise; a malformed finding (no grounding
 * shown) is kept and never acted on; a judge that cannot run is NOT a pass. v1 is
 * untouched and never calls the judge.
 *
 * ── 1.28.0: v2 D4 GATES ranking AND self_harm (2026-09-24) ────
 * VOICE=v2 only. The spec's D4 row had dropped two of blocklist.json's five
 * forbidden_content categories; corrected by Reyner (spec §4a). In v2 they were
 * logged at `flag`; now hard, as they always were in v1. v1 unchanged.
 *
 * ── 1.29.0: THE v2 JUDGE IS ADVISORY (2026-09-24) ─────────────
 * Reyner's ruling after the first judge calibration failed (J3 0/3, hard J2
 * false positives on clean samples): the judge runs and is stored, never
 * rejects. D1-D4 alone gate v2. Undoes 1.27.0's gating; v1 unchanged.
 *
 * ── 1.30.0: A v2 PAIR MAY CITE THE SUPPLIED MIRROR FACTS (2026-09-24) ──
 * Not a Stage 6 check: the render's SHAPE check (lib/render/index.js
 * knownFactIds) now accepts `semanticJson.mirror` fact ids on a v2 pair. It
 * decides serve-or-floor exactly as a gate does, so it ships isolated with its own
 * bump and the floor rate stays attributable. v1 has no mirror; unchanged.
 *
 * ── 1.31.0: v2 ARCHETYPE BRACKETS COME FROM THE ENGINE (2026-09-25) ──
 * Round 3 fix (i), Reyner 2026-09-24: before any v2 check, v1's own
 * `insertBrackets` runs over the archetype(s) in `core` (both people on a pair,
 * the ruled p0 opening untouched), and a square-bracket gloss after an archetype
 * name is read as its bracket. "Matahari (丙)" was a D3 hard reject and is now
 * served as "Matahari (The Sun)". v1 unchanged: brackets.js is not edited.
 *
 * ── 1.32.0: v2 TYPOGRAPHY IS NORMALISED, NOT REJECTED (2026-09-25) ──
 * Round 3 fix (ii), Reyner 2026-09-24: after fix (i), before any check, em/en
 * dashes become " - ", curly quotes straight, the ellipsis "...", and a bracket
 * holding only hanzi is removed. D3's typography check can no longer fire on a
 * v2 draft; hanzi outside a bracket is still D3 hard. v1 unchanged: it still
 * rejects these characters (style.typography / style.hanzi, soft).
 *
 * ── 1.33.0: v2 J1 GATES (2026-09-25) ───────────────────────────
 * Round 3, Reyner 2026-09-24, after J1 passed its calibration (15/15 seeded
 * inventions, 0 clean false positives, 3 runs:
 * docs/qa/2026-09-25-voice-v2-j1-calibration.md). A J1 finding is HARD: one
 * regeneration with the quote fed back, a second J1 floors. A judge that cannot
 * run gates too (J1 unchecked is not a pass). J2-J4 stay advisory at `flag`.
 * The change is in lib/render/index.js, where the judge is called. v1 never
 * calls the judge; unchanged.
 *
 * ── 1.34.0: v2 D2 CHECKS A SMALLER REQUIRED SET (2026-09-26) ───
 * Prompt AD amendment 1, item 2 (Cowork, on Reyner's B2/B3/C7). D2 is still a
 * citation check, now over `v2CitedPointIds` (lib/semantic/index.js) only: the
 * mirror's three identity facts, or a pair's p2_day_pair and p5_pull_fit. A v2
 * draft that leaves any other required point uncited used to take a soft D2 and a
 * regeneration; it now passes. `required_points` itself is unchanged in both
 * voices - the floor is built from it.
 *
 * ── 1.35.0 IS SPENT ON A SIDE BRANCH. DO NOT REUSE IT. ────────
 * `feat/voice-v2-judge-rubric` (38a7a2c) self-reports 1.35.0 for a judge rubric
 * whose calibration FAILED (docs/qa/2026-09-26-voice-v2-j1-recalibration.md on that
 * branch). Burned for the 1.12.0 reason above: one number, one gate.
 *
 * ── 1.36.0: factGuard GATES v2 (2026-09-26) ─────────────────────
 * Prompt AD amendment 2, item 3 (Cowork). v1's deterministic truth checks now run
 * on v2: fact.day_master, strength_contradiction, badge_invented, condition_named,
 * hour_known_contradiction and relation_positions HARD; palace_dropped,
 * strength_same_breath and strength_bare_label logged at flag (Reyner's B18/B20).
 * v2 never ran them before; a v2 draft that contradicts the chart in one of those
 * six ways now regenerates, then floors. v1 unchanged.
 *
 * ── 1.37.0: v2 SQUARE-BRACKET GLOSSES ARE NORMALISED (2026-09-26) ──
 * Prompt AD amendment 2, item 4. Post-processing, before every v2 check, the 1.31.0
 * / 1.32.0 reason: the text judged and served is no longer the text returned. A
 * square English gloss after a supplied Aspek or Bintang becomes its round
 * label_bracket; after anything else (element, relation, palace) it is removed.
 * No regeneration and no new check. v1 unchanged: it still rejects `[` as
 * style.code_leak.
 *
 * ── 1.38.0: THE v2 JUDGE RUNS ON FLASH-LITE (2026-09-26) ────────
 * Reyner's ruling, Prompt AD amendment 2 item 0: "Flash-lite only, no Pro" for the
 * writer, the judge and calibration. JUDGE_MODEL (lib/validate/judge.js) is now the
 * writer's id from lib/render/config.js, `gemini-3.1-flash-lite`, where it was
 * `gemini-3.1-pro-preview`. J1 gates, so a different model is a different gate.
 * Rubric unchanged in this commit. Calibration on Flash-lite, both arms:
 * docs/qa/2026-09-26-voice-v2-j1-flash-lite-arms.md.
 *
 * ── 1.39.0-1.41.0 ARE MAIN'S, MERGED IN AT 1.45.0 (Prompt AG item 1) ──
 * Main numbered them above this branch's 1.26.0-1.38.0 so no version means two
 * gates. Their records, as main wrote them:
 *
 * ── 1.39.0: PAIR DIRECTION AND SUPPLIER ARE HARD ────────────
 * 2026-09-26, Prompt AG item 1 (Reyner's MVP ruling: engine-provable errors get
 * hard deterministic checks). `pair.stem_inverted`: a block citing
 * `p1_stem_relation` says the other person produces or controls, against
 * `provenance.cycle`. `pair.supply_inverted`: a block citing `p3_supply` names an
 * element that is not the one `supplies[]` gives for that direction. Tightens only,
 * pair only. The v1 production cache row `tests/fixtures/pair-reading-g4WH4.json`
 * ("Dia membawa elemen air", where B brings Wood) is now rejected.
 * See lib/validate/pairTruth.js and tests/pair-truth.spec.mjs.
 *
 * ── 1.40.0: A CROSS-CHART RELATION LANDS ON A DAY SEAT ──────
 * 2026-09-26, Prompt AG item 1. `pair.cross_chart_seat`: a sentence names a
 * relation (benturan, ikatan, gesekan, ...) between a non-day pillar of each
 * chart and no day seat. Every cross-chart relation the engine computes has a day
 * seat at one end (`p2_day_pair` day-to-day; `p2_palace_frame` hits always land
 * `to.position: 'day'`), so such a sentence is invented by construction. Tightens
 * only, pair only. calibrate-j1's seed-S4 and fail-monthclash are the red cases.
 *
 * ── 1.41.0: ELEMENT DOMINANCE AGREES WITH THE ENGINE ────────
 * 2026-09-26, Prompt AG item 1. `fact.element_dominance`: an element named with
 * a dominance word (paling banyak, dominan, mendominasi; never after tidak /
 * kurang / bukan) is missing from the chart (`element_missing_*`), or is not the
 * top share of `chart.element_presence`. MIRROR AND PAIR: on a pair it reads each
 * person's facts from `mirror.a` / `mirror.b`, which only v2 builds, so a v1 pair
 * is unchanged. Tightens only. calibrate-j1's seed-S3 is the red case.
 *
 * ── 1.42.0: NO JUDGE IN THE v2 RENDER PATH (2026-09-26) ─────────
 * Reyner's MVP ruling (docs/product/product-boundary-rulings-2026-09-26.md item 5):
 * engine -> Flash-lite writer -> deterministic checks -> serve. lib/render/index.js
 * makes no judge call on any path: the J1 gate (1.33.0) and `v2.judge_unavailable`
 * are gone, so a v2 draft that passes D1-D4 is served where a J1 finding or a
 * judge outage used to regenerate or floor it. LOOSENS, v2 only; v1 never called
 * the judge. lib/validate/judge.js and scripts/calibrate-j1.mjs stay as QA tools.
 *
 * ── 1.43.0: A CACHED ROW IS RE-GATED BY ITS OWN VOICE (2026-09-26) ──
 * Prompt AG item 4, an AF defect. lib/mirror/handlers.js re-checks a cached row on
 * serve (floorIfHardFailing) and a floor before it is served (floorRefusalReason),
 * and both ran the v1 validator whatever the voice. They now run
 * validateRenderingV2 on a v2 semantic JSON. So a cached v2 row is judged by the
 * rules it was written under: a bare strength label, hard on v1 and a flag on v2,
 * no longer floors it. v1 unchanged. No predicate moved; which gate runs did.
 *
 * ── 1.44.0: fact.badge_invented READS BOTH MIRRORS ON A v2 PAIR (2026-09-26) ──
 * Prompt AG item 4, an AF defect. checkBadgeInvention read `semantic.facts` only,
 * which on a pair is the pair facts, so any badge the engine supplied through
 * `mirror.a` / `mirror.b` was "invented" - hard on v2 via V2_FACT_HARD. It now
 * reads the same union as v2.js suppliedTerms. LOOSENS, v2 pairs only: a v1 pair
 * has no `mirror`, and a badge neither person carries still fires.
 *
 * ── 1.45.0: MAIN'S PAIR-TRUTH CHECKS ON v2 (merge of fix/pair-truth-checks) ──
 * 2026-09-26, Prompt AG item 1: "truth fixes, so they go to BOTH voices". The
 * merge makes v2 run main's 1.39.0-1.41.0 checks. pair.stem_inverted,
 * pair.supply_inverted and pair.cross_chart_seat live in pairGuard, which v2's D3
 * runs at its own severity, so they are HARD on v2. fact.element_dominance lives in
 * factGuard, which v2 downgrades to a flag unless the id is in V2_FACT_HARD - so
 * at 1.45.0 it LOGS on v2, and joining it to V2_FACT_HARD is 1.46.0, alone.
 * Tightens, v2 only (v1 already runs all four at main's versions).
 *
 * ── 1.46.0: fact.element_dominance IS HARD ON v2 (2026-09-26) ──
 * Prompt AG item 1: the ruled "hard deterministic checks on v1 and v2". The id
 * joins V2_FACT_HARD (lib/validate/v2.js), so an element named as dominant that the
 * chart lacks, or does not hold most of, now rejects a v2 draft instead of logging.
 * Tightens, v2 only.
 *
 * ── 1.47.0: A CACHED PAIR ROW IS RE-GATED ON SERVE ──────────
 * 2026-09-28, Prompt AI §2. lib/pair/serveReading.js ran Stage 6 over a FLOOR
 * only; a cached pair row was served as stored, whatever gate had been added since
 * it was written. It now runs the mirror's serve-time re-gate (`regateCached`,
 * lib/mirror/handlers.js): a hard fail serves the floor and takes the row out of
 * service, so the next visit renders. No predicate moved; a gate now runs where
 * none did, so what a paid pair reader is served can change. Tightens, pair only.
 * The case: the 2026-09-08 g4WH4 paid row (`tests/fixtures/pair-reading-g4WH4.json`).
 *
 * ── 1.48.0: MAIN'S 1.47.0 ON v2 (merge of main at c6a4aa4, 2026-09-28) ──
 * The merge brings #155's serve-time re-gate onto this branch: a cached PAIR row
 * is now re-gated on serve (it was not re-gated at all), and a hard fail on either
 * kind takes the row out of service so the next visit renders. On this branch the
 * re-gate is voice-aware (1.43.0's gateFor), so a v2 row is judged by v2's rules.
 * No predicate moved; a gate now runs where none did. Tightens, pairs.
 *
 * ── 1.49.0: THE PAIR PDF RE-CHECKS A CACHED READING BEFORE PRINTING IT ──
 * 2026-09-28, Prompt AJ §1. lib/pair/servePdf.js printed the cached row unchecked;
 * only the report PAGE re-gated it (1.47.0), so a buyer who asked for the PDF before
 * opening the page got the stored text whatever gate had been added since. It now
 * reads through `readPrintableCache` (lib/mirror/handlers.js), which is the page's own
 * `regateCached`: a hard fail takes the row out of service and counts as a miss, so
 * the PDF warms through the report door and prints the fresh render (or answers 409
 * if that render floors). No predicate moved; a gate now runs where none did.
 * Tightens, pair PDF only. The case: the 2026-09-08 g4WH4 paid row.
 *
 * ── 1.50.0: THE CE PDF RE-CHECKS A CACHED READING BEFORE PRINTING IT ──
 * 2026-09-28, Prompt AJ §1. The same change as 1.49.0 for the Complete Edition
 * (lib/deliver/handlers.js serveDeliveryPdf): the cached mirror row is read through
 * `readPrintableCache`, the reading page's own re-gate, so a hard-failing row is
 * taken out of service and the PDF warms through the reading door and prints the
 * fresh render (or 409 if that floors). No predicate moved; a gate now runs where
 * none did. Tightens, CE PDF only.
 *
 * ── 1.51.0: NO NESTED ARCHETYPE BRACKETS ON v2 (2026-09-28) ──
 * Prompt AJ §3, Cowork's ruling. Round 4 served "Sebagai Kayu (Bambu (The Bamboo))"
 * and "Sebagai Logam (Besi Tempa (The Forge))". bracketArchetypes (lib/validate/v2.js)
 * now hides every archetype mention already inside parentheses from the insertion:
 * the English goes on the first BARE mention, and with none, nothing is inserted (the
 * cover shows the English). Post-processing, the 1.37.0 reason: the text served is no
 * longer the text returned. v2 only.
 *
 * ── 1.52.0: MAIN'S PDF RE-GATE ON v2 (merge of main at 586c2e2, 2026-09-28) ──
 * The merge brings 1.49.0-1.50.0 (#158) onto this branch: both PDF routes read the
 * cached row through readPrintableCache, and on this branch that re-gate is the
 * voice-aware gateFor (1.43.0), so a v2 row is judged by v2's rules before a PDF
 * prints it. No predicate moved; a gate now runs where none did. Tightens, PDFs.
 *
 * ── 1.53.0: A SUPPLIED TERM WRITTEN WITH "dan" FOR ITS COMMA IS THAT TERM (v2) ──
 * 2026-09-28, Prompt AK §1, Cowork's ruling. rVe4ca floored twice because the writer
 * wrote the supplied quadrant "Tarikan Kuat, Ritme Seirama" as "Tarikan Kuat dan Ritme
 * Seirama" and D1 then rejected the bare "Kuat" as an invented strength term.
 * normaliseSuppliedTermSpelling (lib/validate/v2.js) restores the ruled spelling of a
 * name THIS reading supplies and logs `terms.normalised` at flag, before D1 runs.
 * Post-processing that changes the served text and what D1 sees: LOOSENS, v2 only.
 *
 * ── 1.54.0: D1 IN A HEADING READS ONLY MULTI-WORD TERMS (v2) ──
 * 2026-09-28, Prompt AL §1, Cowork's technical ruling. Headings are title case, so a
 * capital letter there is not evidence of a term: PZ0t (round 4c) was rejected for
 * "Kuat" in "Tarikan Kuat dan Perbedaan Sudut Pandang", rVe4ca (round 4b) for
 * "Berseberangan" in "Perspektif yang Berseberangan". In a heading, D1 now fires only
 * on a complete multi-word glossary term name the engine did not supply; prose is read
 * as before (inventedTermsD1, lib/validate/v2.js). LOOSENS, v2 only.
 *
 * ── 1.55.0: THE CLOSING HEDGE IS DROPPED (v2) ──
 * 2026-09-28, Prompt AL §2; Reyner's B33 made mechanical by B35. When a block's or the
 * penutup's FINAL sentence begins "Mungkin menarik untuk" or "Menarik untuk" and one
 * sentence remains, that sentence is dropped from the served text, nothing added. The
 * gate re-runs on the result and keeps the sentence (`close.hedge_kept`) if a rejecting
 * check would newly fire; otherwise `close.hedge_dropped`. Mid-block: left, logged.
 * Post-processing that changes the served text; it can never reject. v2 only.
 *
 * ── 1.56.0: AN ASPEK AT A NAMED PILLAR MUST BE WHERE THE ENGINE PLACES IT ──
 * 2026-09-28, Prompt AO §2, on Reyner's AN ruling. `fact.aspek_pillar` (lib/validate/
 * fact.js checkAspekPillars): "Aspek X ... di Pilar Y" is HARD when no stem or hidden
 * stem at Y carries X for the person the sentence is about (the reader on a mirror;
 * "-mu" A, "-nya"/"dia" B on a pair, else logged as fact.aspek_pillar_unattributed).
 * Both voices; mirrors, and pairs whose payload carries each person's chart (v2).
 * TIGHTENS.
 *
 * ── 1.57.0: A NO-SUBJECT ASPEK CLAIM FALSE FOR BOTH PEOPLE IS REJECTED ──
 * 2026-09-28, Prompt AP §3, Cowork's technical ruling inside Reyner's AN ruling. On a
 * pair, a "Aspek X ... di Pilar Y" claim with no subject marker that matches NEITHER
 * person's engine placement is HARD (it is false whoever it is about). True for one
 * person and false for the other, it stays logged. TIGHTENS, pairs only.
 *
 * ── 1.58.0: THE STRENGTH VERDICT, NOT THE WORD ──
 * 2026-09-30, Prompt AS §3, Cowork's technical ruling. `fact.strength_contradiction`'s
 * citing-block pass counts a wrong verdict word only when it is predicated of HER: its
 * subject (through copulas and degree words only) is kamu/baganmu/dirimu, her Day
 * Master element or her archetype name, read from `core`; a negator, a pole join
 * ("kuat maupun lemah") or a clause break means no claim. All six round-5 firings were
 * ordinary "kuat" on another noun or verb and caused both round-5 floors. The
 * whole-text reader pass is unchanged. LOOSENS, both voices.
 *
 * ── 1.59.0: POST-PROCESSING NEVER NESTS A BRACKET ──
 * 2026-09-30, Prompt AS Amendment 1 §B, Cowork's technical ruling. r5-05 was served
 * "(Aspek Penantang (Seven Killings))" and three more: brackets.square_normalised made
 * the writer's in-parenthesis [English] round. Every step that writes a bracket now
 * asks `insideOpenParen` (lib/validate/brackets.js): v2's square-gloss normaliser and
 * archetype square-to-round REMOVE a gloss inside an open parenthesis, and v1's
 * insertBrackets skips such a mention for the next bare one (v2's archetype insertion
 * already did, 1.51.0). Changes served text; rejects nothing. Numbered 1.59.0 because
 * AS §3 (#174) holds 1.58.0; the two ship as separate PRs in either order.
 *
 * ── 1.60.0: THE FONDASI OCCUPANT IS A SUPPLIED TERM (v2 D1) ──
 * 2026-09-30, Prompt AU §4, CHECK 3. D1's supplied list now includes
 * spouse_palace.seat_content.label, which the engine supplies and the writer payload
 * carries. Fixture chart 12 seats 食神 (Aspek Perajin) there with no fact of its own, so
 * naming it was rejected as invented; it was the one chart of 13 where folding the
 * occupant into the floor's Fondasi block tripped D1. LOOSENS, v2 only.
 *
 * ── 1.61.0: A FOLDED RELATIONS BLOCK IS READ SENTENCE BY SENTENCE ──
 * 2026-09-30, Prompt AV §2 item 4 (the round-6 folding fix, AT §2), on Reyner's
 * "Fold the clashes". `fact.relation_positions` in a block citing MORE THAN ONE
 * relation judges each relation only on the sentences that name it, so a pillar given
 * for one is not charged to the others and "hari-harimu" in a sentence about none of
 * them is not a day pillar. A block citing one relation reads as before, and a
 * sentence naming a relation with PART of its span still rejects. LOOSENS, both voices.
 *
 * ── 1.62.0: A RELATION CARRIES NO ENGLISH ──
 * 2026-09-30, Prompt AV §2 item 3, on Reyner's ruling (English brackets on Arketipe,
 * Aspek and Bintang only). On a v2 MIRROR a parenthetical directly after a relation's
 * Indonesian name (glossary relasi_cabang) is removed whatever it contains, logged as
 * brackets.relation_stripped (lib/validate/v2.js stripRelationBrackets): the writer
 * invents its own English, so the rule is positional, not a word list. On v2, a
 * relation's glossary English is also no longer a sanctioned bracket (logged only).
 * Changes served text; rejects nothing. Pairs unchanged.
 *
 * ── 1.63.0: A BADGE AT A NAMED PILLAR MUST BE WHERE THE ENGINE PLACES IT ──
 * 2026-09-30, Prompt AV §4, Cowork's technical ruling. `fact.bintang_pillar` (lib/
 * validate/fact.js checkBintangPillars): "Bintang X ... di Pilar Y", for every glossary
 * bintang including Tanda Kekosongan, is HARD when no fact carrying X places it at Y.
 * Since #177 the badge card beside the prose shows the engine's pillar, so a wrong one
 * contradicts the page. Subject handling is fact.aspek_pillar's (1.56.0 / 1.57.0): the
 * reader on a mirror; on a pair "-mu" A, "-nya"/"dia" B, no marker and false for both
 * HARD, true for one only logged as fact.bintang_pillar_unattributed. TIGHTENS, both
 * voices; mirrors, and pairs whose payload carries each person's facts (v2).
 *
 * ── 1.64.0: THE WORD BANS ARE LIFTED; THREE INVISIBLE CHECKS STAY ──
 * 2026-10-01, Prompt AZ §1, on Reyner's ruling: "Lift the ban on A and B. We don't ban
 * specifics for the writer, just give overall direction", and "Keep 3 checks."
 * blocklist.json keeps only (1) pipeline leaks - style.code_leak and the style.meta
 * entries that name the machine (sebagai AI / model bahasa / JSON / prompt /
 * berdasarkan data yang diberikan); (2) forbidden_content.self_harm; (3)
 * forbidden_content.medical and .financial. Everything else - every register group
 * (essay_connectives, hedging, hedge_construction, tension_collapse, slang, particles,
 * bare_polarity), fatalism, ranking, arithmetic, raw_pillar, the rest of style.meta and
 * verdict.patterns - moved to `_retired_2026-10-01`, which nothing reads. v1, v2,
 * mirror, pair, floor, and the glossary / copy-bank sweeps. The writer gets direction
 * instead (the shared v2 prompt). The fact checks, the bracket normalising, the
 * closing-hedge drop and the typography rule are not word bans and do not move.
 * LOOSENS, both voices.
 *
 * ── 1.65.0: "mungkin" ABOUT HER IS NO LONGER A CHECK ──────
 * 2026-10-01, Prompt BA §1, on Reyner's ruling: "Drop the "mungkin"-about-her check.
 * I agree that this is effectively a word ban." `hedgeAboutReader` (lib/validate/
 * style.js, reported as `style.hedging`) is deleted: soft on v1 (mirror, pair, floor,
 * the cached-row recheck), logged on v2. KEPT, unchanged: the question-mark check
 * (style.js hasUnsanctionedQuestion, `style.rhetorical_question`) and English leakage
 * (style.js englishLeakage, `style.english_leakage`). LOOSENS, v1 only in effect.
 *
 * ── 1.66.0: THE REFRAME OVERLAP CHECK IS REMOVED ─────────
 * 2026-10-02, Prompt BB §2.2, Reyner's A4: "Drop the 50% word-overlap check."
 * `pair.reframe_missing` (lib/validate/pair.js checkReframePresent, REFRAME_OVERLAP
 * 0.5) is deleted: hard on every pair reading, v1 and v2. "A clash is a map, never
 * a judgement" stays as prompt direction. (A1, the same day, deleted v2's dead
 * pair-verdict check with no bump: it matched nothing.) LOOSENS, pairs only.
 *
 * ── 1.67.0: `obat` AND `terapi` LEAVE THE MEDICAL BAN ────
 * 2026-10-02, Prompt BB §2.3, Reyner's D1: "Narrow D1 and D2 to allow dramatic
 * metaphors like "obat" while keeping the clinical bans." blocklist.json
 * `forbidden_content.medical` loses the bare words `obat` and `terapi`; kept:
 * resep dokter, ke dokter, pengobatan, penyakit, diagnosa, diagnosis, gejala, depresi,
 * gangguan (mental|kecemasan), kesehatan mentalmu. LOOSENS, both voices.
 *
 * ── 1.68.0: THE DESPAIR PHRASES LEAVE THE SELF-HARM BAN ──
 * 2026-10-02, Prompt BB §2.4, Reyner's D2 (with D1). blocklist.json
 * `forbidden_content.self_harm` loses its second pattern, `menyerah saja` and
 * `tidak ada gunanya`; the first, `bunuh diri|menyakiti diri|melukai diri`, is kept.
 * LOOSENS, both voices.
 *
 * ── 1.69.0: fact.day_master CHECKS BOTH PEOPLE ON A PAIR ──
 * 2026-10-02, Prompt BB §2.5, Reyner's E5: "extend the Day Master truth checks to both
 * individuals." `checkDayMaster` (lib/validate/fact.js) returned early on a pair, whose
 * `core` is `{ a, b }`; it now checks A by kamu / inti dirimu and B by dia / ia / inti
 * dirinya against each one's own element. Hard on v2 (V2_FACT_HARD) and on v1, as on
 * the mirror. The mirror is unchanged. TIGHTENS, pairs only.
 *
 * ── 1.70.0: PIPELINE LEAKS REJECT ON v2 ───────────────────
 * 2026-10-02, Prompt BB §2.6, Reyner's G6: "MAKE HARD." `style.meta` and
 * `style.code_leak` (blocklist.json, unchanged) now reject a v2 reading, mirror and
 * pair, at their own severity (soft: one regeneration with the quotes, then the floor),
 * as they always did on v1. Every other style.* finding stays logged on v2
 * (`V2_STYLE_GATING`, lib/validate/v2.js). Priced first by replay: 0 of 211 stored
 * drafts newly fail. TIGHTENS, v2 only.
 *
 * ── 1.71.0: THE ARCHETYPE IS ITS ENGLISH TITLE IN PROSE ───
 * 2026-10-02, Prompt BB §3, Reyner's G1 + E7 (rule 23 amended): "Accept English
 * titles" / "Everywhere". The archetype bracket insertion is gone from both gates
 * (v2 `bracketArchetypes`, v1 `insertBrackets`'s arketipe scope); in its place
 * `englishArchetypes` (lib/validate/archetypeTitles.js) writes every mention of each
 * person's archetype as its English title, dropping any bracket beside it.
 * `pair.both_named`, `pair.penutup_register`, `opening.archetype_missing` and the
 * strength-verdict subject read the English title. The writer is handed only the
 * English title (core.archetype_name_id is internal_only) and the pair opening is
 * filled with the English titles. CHANGES WHAT IS SERVED; both_named now requires the
 * English names, both voices.
 *
 * ── 1.72.0: MEDICATION INSTRUCTIONS ARE BACK IN THE MEDICAL BAN ──
 * 2026-10-02, Reyner, after D1 (1.67.0) freed the bare word `obat` and "Minum obat
 * penenang setiap pagi." passed: "add one pattern to forbidden_content.medical for
 * medication instructions (minum / meminum / konsumsi / mengonsumsi obat; obat penenang
 * / tidur / antidepresan)". One blocklist pattern; the metaphor ("Dia adalah obat untuk
 * lelahmu.") stays free. TIGHTENS, both voices.
 */
export const STAGE6_VERSION = '1.72.0';

/**
 * Run the gate.
 *
 * @param {Object} rendered parsed blocks[] contract
 * @param {Object} semanticJson Stage 3 output. The FULL object, never the
 *   scrubbed provider view: the gate checks against what is TRUE, and the
 *   internal_only fields are part of that.
 * @param {Object} [options]
 * @param {string} [options.provider='gemini'] tightens the style thresholds
 * @returns {{
 *   ok: boolean, hard: boolean, findings: Array, normalized: Object,
 *   stage6_version: string,
 * }} `hard` is true when any hard finding fired - the caller uses it to decide
 *   between "regenerate" and "fall back immediately".
 */
export function validateRendering(rendered, semanticJson, { provider = 'gemini' } = {}) {
  // Every UNFITTED threshold's observed value, recorded whether it passed or
  // failed. The harness fits the thresholds from these, and it cannot do that
  // from rejections alone: a set of failures cannot distinguish "nothing came
  // near the line" from "half the corpus sits one stem above it".
  const metrics = {
    same_breath: [], coverage: [], block_chars: [], breaks_per_block: [], total_chars: [],
    // Rule 23 bracket verdicts, one per scoped term actually mentioned - recorded
    // whether it passed or failed, because the fitting harness needs both. Since
    // 1.13.0 the pipeline INSERTS the bracket, so a non-bracketed verdict here means
    // insertBrackets is broken. See lib/validate/brackets.js.
    brackets: [],
    // How many brackets the pipeline had to insert. A COUNT, not a rejection - the
    // same treatment paragraph_inserts gets below, and for the same reason: a silent
    // deterministic fix must not look like a failure and must not be invisible.
    bracket_inserts: 0,
    // Brackets the model got WRONG and the pipeline corrected. Louder than an
    // insertion: the model was given the value and paraphrased it anyway.
    bracket_normalised: 0,
    // A COUNT, not a rejection. Deterministic reformatting is a silent fix, so it
    // must not look like a failure - but it must not be invisible either, or the
    // gate would be quietly rewriting every reading with nothing to show for it.
    // The harness reports it beside the rejection table (Reyner, 2026-08-06).
    paragraph_inserts: 0,
  };

  // Structure first: it normalises, and every later check should read the text
  // that will actually be stored rather than the raw one.
  const { findings: structural, normalized: structured } = structureGuard(rendered, metrics);

  // RULE 23 IS APPLIED, NOT ASKED FOR. Deterministic insertion of (English) on the
  // first prose mention of each bound term, before anything is judged - so the text
  // the gate checks is the text that gets cached and served (it is spread into the
  // result as `...gate.normalized`). Asking the model to remember it cost 2 of 4
  // charts their reading when it was a gate; see lib/validate/brackets.js.
  // The ARCHETYPE is not bracketed: it is written as its English title (G1, 1.71.0;
  // lib/validate/archetypeTitles.js), before the bracket insertion for Aspek and Bintang.
  const { rendered: titled, replaced: archetypeTitles } = englishArchetypes(structured, semanticJson);
  metrics.archetype_titles_normalised = archetypeTitles.length;
  const { rendered: normalized, inserts, normalised: fixed } = insertBrackets(titled, semanticJson);
  metrics.bracket_inserts = inserts.length;
  metrics.bracket_normalised = fixed.length;
  const text = renderedText(normalized);

  const findings = [
    ...factGuard(normalized, semanticJson, text, metrics),
    ...forbiddenGuard(text),
    ...coverageGuard(normalized, semanticJson, metrics),
    ...openingGuard(normalized, semanticJson),
    // PROSE ONLY, never headings - see renderedProse. A bare label in a heading is
    // not a first mention, and treating it as one rejects the floor on every chart.
    ...bracketGuard(semanticJson, renderedProse(normalized), metrics, inserts, fixed),
    ...styleGuard(normalized, text, provider, semanticJson),
    // PAIR ONLY. Returns [] for a mirror reading, so the mirror's floor-rate
    // fixtures cannot move - asserted in tests/compat-stage6-pair.spec.mjs.
    ...pairGuard(normalized, semanticJson, text),
    ...structural,
  ];

  const hard = findings.some((f) => f.severity === 'hard');
  const failing = findings.filter((f) => f.severity !== 'flag');

  return {
    ok: failing.length === 0,
    hard,
    findings,
    metrics,
    normalized,
    stage6_version: STAGE6_VERSION,
  };
}

// MOVED to ./directive.js on 2026-08-22, and re-exported so no call site changes.
// The docblock that stood here went with it, minus two claims that had gone stale:
// "the ONE regeneration" (the budget is 3) and "the prompt is the cacheable prefix
// and the thing prompt_version identifies" (prompt_version now covers the
// directive too, which is the whole point of the move).
// The directive is appended to MASTER_PROMPT, so from the model's side it IS
// prompt text - and it had no version stamp at all. Reyner ruled it part of
// `PROMPT_VERSION`, which means `lib/render/prompt.js` has to read its template;
// leaving the constant in this file would have made prompt.js import the whole
// validator and close an import cycle. See that file's header for what is stamped
// and what still is not.
export { stricterDirective, DIRECTIVE_TEMPLATE, forbiddenLiterals } from './directive.js';

export { FACT_PARAMS } from './fact.js';
export { COVERAGE_PARAMS } from './coverage.js';
export { STYLE_PARAMS, CATEGORIES } from './style.js';
export { STRUCTURE_PARAMS } from './structure.js';
