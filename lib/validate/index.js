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
 */
export const STAGE6_VERSION = '1.46.0';

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
  const { rendered: normalized, inserts, normalised: fixed } = insertBrackets(structured, semanticJson);
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
