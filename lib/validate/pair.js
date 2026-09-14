// ============================================================
// Stage 6 — the checks that exist only for a pair reading
// ============================================================
// ACTIVE ONLY WHEN `semanticJson.kind === 'pair'`. A mirror reading has one
// subject and no reframe, so every check here would be either meaningless or
// wrong on it - and the mirror's floor-rate fixtures must not move.
//
// ── WHY THESE TWO REJECT AND THE THIRD DOES NOT ────────────
// `both_named` and `reframe_present` are HARD. Each was shown red on a REAL
// Gemini render before it was trusted, which is prompt X-b2's own condition and
// the lesson of the production copy gate that ran for ten days without ever
// executing (COWORK-BRIEF row 46).
//
// `no_verdict` ships with an EMPTY pattern list. The patterns are Indonesian
// constructions and therefore Reyner's alone (rule 20), and a check that fires
// and logs but rejects nothing is not a gate change - it cannot move the floor
// rate, which is the whole point of landing one that way first. It is here so
// that ruling the patterns is a data edit rather than a code change.
// ============================================================

import BLOCKLIST from './blocklist.json' with { type: 'json' };
import { stemOverlap } from './text.js';

/**
 * How much of the reframe's distinctive wording must survive into the block.
 *
 * ABOVE `COVERAGE_PARAMS.fieldOverlap` (0.2), which is the share a rewritten
 * SEED must keep. A seed is a default the renderer is meant to condition and
 * mostly reword; the reframe is the compat spec's ethical spine and a reading
 * that keeps a fifth of it has not carried it. UNFITTED like every threshold in
 * this repo - the n=10 run reports the distribution.
 */
export const REFRAME_OVERLAP = 0.5;

/**
 * A finding, in the shape every other guard emits.
 *
 * ── IT USED TO SAY `code`, AND THAT MADE IT INVISIBLE, 2026-09-08 ──
 * The field was `code` while coverage.js, fact.js, structure.js and style.js all
 * emit `check`. Nothing failed, because severity is what the gate reads - but the
 * two places that ATTRIBUTE a finding both read `check`:
 *
 *   lib/render/index.js:463   stage6: rejecting.map((f) => f.check)
 *   lib/validate/directive.js:120   `- [${f.check}] ${...}`
 *
 * So a pair rejection was recorded in the QA tape as `undefined`, and the
 * regeneration directive told the model `- [undefined] the opening block must
 * name both people`. The docstring above this line claimed "shape-compatible
 * with the other guards' findings" and was the only check anyone had.
 *
 * `fact_ids` is kept as well as `where`: the pair checks know which facts they
 * are about, and the mirror's guards mostly do not.
 */
const finding = (check, message, factIds = [], severity = 'hard') => ({
  check, message, fact_ids: factIds, where: null, severity,
});

/**
 * BOTH people are named in the opening block.
 *
 * The pair analogue of `opening.archetype_missing`, and it is HARD where that one
 * is soft. The reason is that a mirror opening on the element instead of the
 * archetype is a reading that lands badly; a PAIR reading that names one person
 * and not the other is a reading about the wrong thing. It is the first
 * obligation the compat spec states and the one a reader would notice instantly.
 *
 * ── THE OPENING BLOCK, NOT THE WHOLE READING ───────────────
 * Same haystack rule as `openingGuard`: the first block's prose, headings
 * excluded. A name appearing in block four is not the reader meeting the pairing.
 * Unlike openingGuard this reads the whole first block rather than its first
 * sentence, because two names rarely fit in one and the compat prompt asks only
 * that they open the reading together.
 */
function checkBothNamed(rendered, semanticJson, out) {
  // ── THE FLOOR EXEMPTION IS GONE, 2026-09-08 (evening) ──
  // It existed because the module-assembly floor could not name both people: no
  // ruled cell opened a pair reading, `RENDER_COPY.floorIdentity` is a
  // single-subject sentence, and inventing a connective is user-facing Indonesian
  // and Reyner's alone (rule 20). A HARD check on the floor would have made every
  // pair 503 the moment the provider failed - measured, not reasoned: it turned
  // the pair-semantic spec's four quadrants red the moment the check was wired in.
  //
  // Reyner ruled `kompatibilitas.p0_opening`. The floor now opens by naming both
  // people, so the exemption is describing a gap that no longer exists - and an
  // exemption kept past its cause is how a check quietly stops applying to the
  // path most likely to break. **THE FLOOR IS NOW HELD TO THE SAME RULE AS THE
  // MODEL**, which is what makes this a gate change with its own version bump.
  const a = semanticJson.core?.a?.archetype_name_id;
  const b = semanticJson.core?.b?.archetype_name_id;
  if (!a || !b) return;

  const opening = (rendered.blocks || [])[0]?.text || '';
  const missing = [
    !opening.includes(a) ? a : null,
    !opening.includes(b) ? b : null,
  ].filter(Boolean);

  if (missing.length === 0) return;

  // BOTH-MISSING AND ONE-MISSING ARE THE SAME FINDING, deliberately. The failure
  // is "the opening does not introduce the pairing", and splitting it would
  // invite a fix that adds the cheaper of the two names.
  out.push(finding(
    'pair.both_named',
    `the opening block must name both people; missing: ${missing.join(', ')}`,
    ['p5_pull_fit'],
  ));
}

/**
 * The P2 reframe is present when the seat is difficult.
 *
 * `p2_reframe` is a FACT with its own ruled cell, so this is the ordinary
 * coverage question asked at a place where a miss is an ethics failure rather
 * than a thinness one: the compat spec's spine is that a clash is never a
 * verdict. `coverageGuard` already requires every required point to be covered,
 * but it is SOFT on a miss and this must not be.
 *
 * WHAT IT CHECKS is that the reframe's own ruled text is reflected in the block
 * that carries the day pair - not that some reassuring words appear somewhere.
 *
 * ── IT USES stemOverlap, AND THE FIRST VERSION DID NOT ─────
 * That version took the cell's longest sentence and asked what share of its
 * 4-plus-letter words appeared in the block. On the real cell those words are
 * `gesekan pada kursi pasangan menandakan hubungan yang membutuhkan perhatian
 * ekstra kesadaran penuh` - and `pada`, `yang`, `hubungan`, `pasangan` and
 * `kursi` are all over any compat reading. **A real Gemini render with every
 * reframe sentence STRIPPED still scored above the threshold**, so the check
 * passed on text carrying no reframe at all. It was measuring its own
 * vocabulary.
 *
 * `stemOverlap` is the repo's own comparison: it drops stopwords, stems the
 * tails, and matches word-initially. `coverage.js` uses it for exactly this
 * question, so this is one definition of "did the idea survive" rather than a
 * second one - and the threshold sits above `COVERAGE_PARAMS.fieldOverlap`
 * because a reframe is not a seed the renderer may mostly drop.
 */
function checkReframePresent(rendered, semanticJson, out) {
  if (!(semanticJson.safety_flags || []).includes('p2_reframe_required')) return;

  const fact = (semanticJson.facts || []).find((f) => f.id === 'p2_reframe');
  if (!fact?.label_meaning) return;

  const blocks = rendered.blocks || [];
  const carrier = blocks.find((b) => (b.fact_ids || []).includes('p2_reframe'))
    ?? blocks.find((b) => (b.fact_ids || []).includes('p2_day_pair'))
    ?? blocks[0];

  const { ratio, hits, total, missing } = stemOverlap(fact.label_meaning, carrier?.text || '');
  if (total === 0) return;
  if (ratio >= REFRAME_OVERLAP) return;

  out.push(finding(
    'pair.reframe_missing',
    'the day pair is difficult and safety_flags asks for the reframe, but the '
    + `block carrying it keeps ${hits} of ${total} of its distinctive stems `
    + `(missing: ${missing.slice(0, 5).join(', ')})`,
    ['p2_reframe'],
  ));
}

/**
 * No overall verdict or score.
 *
 * SHIPS WITH NO PATTERNS AND THEREFORE REJECTS NOTHING. Rule doc 2.4 forbids a
 * score and an overall pass/fail, and the constructions that express one are
 * Indonesian - "cocok", "tidak cocok", a percentage, a rating - which makes them
 * Reyner's to rule. The category exists in `blocklist.json` with an empty list so
 * that ruling them is a data edit.
 *
 * It LOGS what it would have caught, at `flag` severity, which cannot fail a
 * reading. That is deliberate: a flag is visible in the QA table, so the patterns
 * can be fitted against real renders before any of them rejects anything.
 */
function checkNoVerdict(text, blocklist, out) {
  // `.patterns`, NOT the category object. The first version read
  // `blocklist?.verdict?.filter?.(...)` - and `verdict` is
  // `{ _rule, patterns }`, an object with no `.filter`, so the optional call
  // yielded undefined and the `?? []` swallowed it. **The check could never have
  // fired, even after Reyner ruled the patterns**, and it would have looked armed
  // the whole time. Caught by asking what the expression evaluates to rather than
  // by reading it.
  const entries = (blocklist?.verdict?.patterns ?? []).filter((e) => e?.pattern);
  for (const entry of entries) {
    const regex = new RegExp(entry.pattern, entry.flags || 'iu');
    if (regex.test(text)) {
      out.push(finding(
        'pair.verdict',
        `${entry.pattern} - a pair reading states no overall verdict (rule doc 2.4)`,
        [],
        'flag',
      ));
    }
  }
}

/**
 * The neutral wording the direction-neutral cells are written in.
 *
 * `p1_produces`, `p1_controls` and `p3_supplies` are ONE cell for both
 * directions by ruling, so the cell cannot say who; `provenance.cycle` and
 * `provenance.supplies[].from` carry it and the renderer resolves them. Round 1
 * transcribed the neutrality instead: 3 of 3 direction-carrying blocks
 * (`docs/qa/2026-09-11-compat-three-pair-walk.md` E1). These are the cells' own
 * words, so this is not a ban on a register - it is "you copied the placeholder".
 */
const NEUTRAL_DIRECTION = /\b(salah satu|yang satu|yang lain|satu pihak|pihak lain)\b/iu;

/**
 * The reader is `kamu` / `-mu`; the other person is `dia` / `-nya`.
 *
 * THE SUFFIX BRANCHES ARE DELIBERATELY LOOSE and the `-nya` one especially so:
 * `artinya`, `biasanya` and `kehadirannya` all match it and only the last is a
 * possessive. That is the safe direction for a COUNTER - a loose match makes this
 * check quieter, never louder, so the number it reports is a floor on the defect
 * rather than an inflated one. The three-character minimum is not decoration:
 * `\w+mu` matches `ilmu`.
 *
 * In practice the E1 defect is caught by the `salah satu` regex and by a block
 * with no `kamu` in it, and both of those are exact.
 */
const NAMES_A_SIDE = /\bkamu\b|\b\w{3,}mu\b/iu;
const NAMES_B_SIDE = /\bdia\b|\b\w{3,}nya\b/iu;

/**
 * LOG ONLY. A direction-carrying block that never says who.
 *
 * ── WHY THIS REJECTS NOTHING, AND MUST NOT ─────────────────
 * The repo convention: a check that fires and logs but rejects nothing is not a
 * gate change, so it may travel with other work and it cannot move the floor
 * rate. That is exactly what is wanted here. The defect is a PROSE defect that a
 * prompt is being asked to fix in the same PR; wiring a rejection at the same
 * time would confound the prompt's effect with the gate's, and a round-2 draw
 * that floored would be unattributable between the two.
 *
 * It also means the count is honest about false positives before anything
 * depends on it: a block that resolves the direction with an archetype name and
 * no pronoun would be logged here and is not actually wrong.
 */
function checkDirectionResolved(rendered, semanticJson, out) {
  const byId = new Map((semanticJson.facts || []).map((f) => [f.id, f]));

  for (const block of rendered.blocks || []) {
    const carries = (block.fact_ids || []).filter((id) => {
      const fact = byId.get(id);
      if (!fact) return false;
      if (id === 'p1_stem_relation') {
        return fact.provenance?.variant === 'p1_produces'
          || fact.provenance?.variant === 'p1_controls';
      }
      if (id === 'p3_supply') return (fact.provenance?.supplies || []).length > 0;
      return false;
    });
    if (carries.length === 0) continue;

    const text = block.text || '';
    const copied = NEUTRAL_DIRECTION.exec(text);
    const nameless = !NAMES_A_SIDE.test(text) || !NAMES_B_SIDE.test(text);
    if (!copied && !nameless) continue;

    out.push(finding(
      'pair.direction_resolved',
      copied
        ? `"${copied[0]}" - the cell's direction-neutral wording reached the reader`
        : 'the block names neither kamu nor dia, so the direction is not resolved',
      carries,
      'flag',
    ));
  }
}

/**
 * LOG ONLY. The closing talks ABOUT the reader instead of TO her.
 *
 * E3 in the walk: baseline closed "Hubungan ini meminta kamu untuk ... Bagi dia,
 * ...", round 1 closed "Hubungan ini meminta Matahari untuk ... Gunung diminta
 * untuk ...". The reader is A. A closing that refers to her by archetype label is
 * a report about two strangers, which is not what she bought.
 *
 * TWO SEPARATE CONDITIONS, ONE FINDING, and deliberately so: "no kamu" and "A is
 * named" are the same failure seen from two sides, and splitting them would
 * invite a fix that satisfies one.
 */
function checkPenutupRegister(rendered, semanticJson, out) {
  const penutup = rendered.penutup || '';
  // The floor leaves `penutup` empty by design (no glossary cell holds a closing),
  // and an empty string is not a register failure - it is the floor. Skipping it
  // keeps this counter about the model, which is the only thing it can inform.
  if (penutup.trim() === '') return;

  const a = semanticJson.core?.a?.archetype_name_id;
  const reasons = [
    !NAMES_A_SIDE.test(penutup) ? 'does not address the reader as kamu' : null,
    a && penutup.includes(a) ? `names the reader (${a}) in her own closing` : null,
  ].filter(Boolean);
  if (reasons.length === 0) return;

  out.push(finding('pair.penutup_register', `penutup ${reasons.join('; ')}`, [], 'flag'));
}

/**
 * Every pair-only check. Returns [] for a mirror reading.
 *
 * @param {Object} rendered normalised rendering
 * @param {Object} semanticJson
 * @param {string} text the rendered text the other guards read
 *
 * NO `provider` PARAMETER. It existed only for `both_named`'s floor exemption,
 * which went when p0_opening was ruled, and a parameter kept "for later" is how
 * that exemption survived its own cause. `validateRendering` still knows the
 * provider; this guard no longer needs to.
 * @returns {Object[]} findings
 */
export function pairGuard(rendered, semanticJson, text) {
  if (semanticJson?.kind !== 'pair') return [];
  const out = [];
  checkBothNamed(rendered, semanticJson, out);
  checkReframePresent(rendered, semanticJson, out);
  checkNoVerdict(text, BLOCKLIST, out);
  // ── LOG ONLY, ADDED 2026-09-13 (Prompt Z round 2, B1 and B2) ──
  // Neither rejects, so `STAGE6_VERSION` does not move for them and they may
  // travel with the prompt change they measure. See each function's header.
  checkDirectionResolved(rendered, semanticJson, out);
  checkPenutupRegister(rendered, semanticJson, out);
  return out;
}
