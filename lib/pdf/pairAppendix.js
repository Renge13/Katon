// ============================================================
// The compat PDF — the appendix (legend) for a PAIR
// ============================================================
// Prompt Y-3 commit 2. Pure data: two charts + the pair's semantic JSON in, the
// USED SUBSET of the glossary out. No PDF, no layout, no fonts.
//
// ── IT IS THEIR TWO CHARTS, NOT THE GLOSSARY ───────────────
// Same principle as `buildAppendix`, twice over: a legend that lists every compat
// cell is a reference book, and the reader bought a reading about one pair. The
// Y-1 fixture pair resolves 6 of the 24 ruled compat cells; a clash pair resolves a
// different 6, overlapping but not equal.
//
// ── WHY THIS REUSES `buildAppendix` RATHER THAN RE-DERIVING ──
// The per-chart half of this appendix is the mirror's, exactly: the same pillars,
// the same Shio, the same 胎元 display-only ruling, the same correction 1 and
// correction 2. So each chart is run through `buildAppendix` with its own mirror
// semantic JSON and the two results are merged. A second derivation of "which
// glossary entry does this fact come from" would be a second place for correction 1
// to be got wrong, and correction 1 is the one this repo has already paid for.
//
// ── ALL SEVEN GROUPS. `Relasi Cabang` IS IN, RULED 2026-09-14 ──
// Y-3 enumerated six per-chart groups and left `Relasi Cabang` - a SINGLE chart's
// own branch relations - out, on the argument that one person's internal 冲 sitting
// in the same legend as `Kursi Berbenturan` invites a reader to read the first as
// the second. **Reyner reversed that on 2026-09-14** and the reversal is the
// straightforward reading of R2: the document is "as complete as possible",
// bounded ONLY by the locked rules, and "a reader might conflate two things" is a
// presentation worry rather than a locked rule. A term that appears in a chart and
// is not explained in the legend is the gap the appendix exists to close.
//
// So `PER_CHART_GROUPS` is `GROUP_ORDER` entire, and it is written as a copy rather
// than as the constant itself so the two orders cannot silently become one object
// that a later edit to either end moves.
//
// ── `p0_opening` IS NOT A TERM AND IS EXCLUDED ─────────────
// It resolves through `variantKeysFor` like every other fact, but its cell is the
// opening SENTENCE and its `label_meaning` is a template carrying `{A}` and `{B}`.
// An appendix entry for it would print unfilled placeholders into a paid document.
// Asserted in the spec rather than left to this comment.
// ============================================================

import { GLOSSARY } from '../semantic/glossary.js';
import { buildSemanticJson } from '../semantic/index.js';
import { variantKeysFor } from '../semantic/pair.js';
import { buildAppendix, GROUP_ORDER } from './appendix.js';

/** The compat group, first: it is what the document is about. */
export const PAIR_GROUP = 'Kompatibilitas';

/**
 * The per-chart groups Y-3 enumerates, in prompt M's own order. Derived from
 * `GROUP_ORDER` by exclusion rather than retyped, so a group added to the mirror's
 * order appears here too and the omission stays a list of ONE name.
 */
export const PER_CHART_GROUPS = GROUP_ORDER.slice();

export const PAIR_GROUP_ORDER = [PAIR_GROUP, ...PER_CHART_GROUPS];

/**
 * Cells that resolve through `variantKeysFor` but are not TERMS.
 *
 * One member. `p0_opening`'s cell is the reading's first sentence and its
 * `label_meaning` is a template - printing it in a legend ships `{A}` and `{B}` to a
 * paying reader.
 */
export const NOT_A_TERM = new Set(['p0_opening']);

/**
 * Build the appendix for a pair.
 *
 * @param {Object} args
 * @param {Object} args.chartA output of calculateBaziChart for person A (the reader)
 * @param {Object} args.chartB the same for person B
 * @param {Object} args.semanticJson output of buildPairSemantic
 * @returns {{
 *   groups: Array<{group: string, entries: Array<Object>}>,
 *   carried: string[],
 *   count: number,
 *   compat: Array<Object>,
 *   chartA: Array<Object>,
 *   chartB: Array<Object>,
 * }} `compat`, `chartA` and `chartB` are the REFERENCE subsets for the three pages
 *   that carry a reference list: named, non-condition entries only, exactly the
 *   filter `buildPdf` applies when it decides what must be printed.
 */
export function buildPairAppendix({ chartA, chartB, semanticJson }) {
  const byGroup = new Map(PAIR_GROUP_ORDER.map((g) => [g, []]));
  const seen = new Map();

  // One entry per `section.key`, and the FIRST one wins - which matters because the
  // two charts share Shio and Pilar entries and both would otherwise push a
  // duplicate with the same anchor. `assertAnchorsUnique` would catch that as a
  // collision; deduping here is what makes it not happen, and returning the already
  // seen object is what lets both charts' reference lists point at one anchor.
  const push = (group, entry) => {
    const dedupe = `${entry.section}.${entry.key}`;
    if (seen.has(dedupe)) return seen.get(dedupe);
    seen.set(dedupe, entry);
    byGroup.get(group).push(entry);
    return entry;
  };

  // ── the pair's own cells, from the facts ──
  const compat = [];
  for (const fact of semanticJson.facts || []) {
    for (const key of variantKeysFor(fact)) {
      if (NOT_A_TERM.has(key)) continue;
      const cell = GLOSSARY.kompatibilitas?.[key];
      if (!cell) continue;
      // ── AN UNNAMED COMPAT CELL LEAVES THE LEGEND, 2026-09-22 (AB §2) ──
      // `p2_palace_frame` and `p2_reframe` have no `name_id` because they are
      // FRAMES, not terms. A legend is a list of terms a reader can look up; an
      // entry with no term to look up is a paragraph that has wandered into a
      // table, which is exactly how markup row A6 described it.
      //
      // ── AND BOTH OF THEM HAD TO GET A HOME FIRST ──────────
      // AB §2 justified the removal by saying they "already appear in the table and
      // the reading". Measured on the 2x6 pair, that was true of `p2_palace_frame`
      // and FALSE of `p2_reframe`: zero facts-table rows, so dropping it deleted
      // its meaning from the product - and that meaning is the de-catastrophising
      // line shown to readers whose seats are HARD. `tests/pdf-pair-appendix.spec.mjs`
      // caught it and the check was right.
      //
      // RULED BY REYNER 2026-09-22: print the reframe UNDER THE SEAT ROWS in the
      // facts table, only when a hard seat exists. So it leaves the legend here and
      // arrives there - see `factRows`. No new visible string was needed, which is
      // why the `PENDING` slot drafted for a legend term is gone again.
      if (!cell.name_id) continue;
      const unnamed = false;
      const entry = push(PAIR_GROUP, {
        key,
        section: 'kompatibilitas',
        name: unnamed ? null : cell.name_id,
        name_en: cell.name_en ?? null,
        meaning: cell.label_meaning ?? '',
        fact_id: fact.id,
        condition: unnamed,
      });
      if (entry.name) compat.push(entry);
    }
  }

  // ── each chart's own mechanics, through the MIRROR generator ──
  const perChart = (chart) => {
    const kept = [];
    const mirror = buildAppendix({ chart, semanticJson: buildSemanticJson(chart) });
    for (const g of mirror.groups) {
      if (!PER_CHART_GROUPS.includes(g.group)) continue;
      for (const e of g.entries) {
        const entry = push(g.group, e);
        if (entry.name && !entry.condition) kept.push(entry);
      }
    }
    return kept;
  };
  const a = perChart(chartA);
  const b = perChart(chartB);

  const groups = PAIR_GROUP_ORDER
    .map((group) => ({ group, entries: byGroup.get(group) }))
    .filter((g) => g.entries.length > 0);

  return {
    groups,
    // NAMES ONLY, AND NO CONDITIONS. Correction 1, unchanged.
    carried: groups.flatMap((g) => g.entries.filter((e) => !e.condition).map((e) => e.name)),
    count: groups.reduce((n, g) => n + g.entries.length, 0),
    compat,
    chartA: a,
    chartB: b,
  };
}
