// ============================================================
// The compat PDF — the document
// ============================================================
// Prompt Y-3 commit 3. A second COMPOSER for `buildPdf`, not a second pipeline:
// the fixed point, the three verifies, the fonts and the 申 canary are all the
// mirror's and are reached through the same door.
//
// ── THE PDF AUTHORS NOTHING. THE SAME HARD RULE, WITH ONE MORE TRAP ──
// Every word a reader sees here comes from somewhere that already ruled it:
//
//   the reading    `rendered.blocks` / `rendered.penutup`, VERBATIM from
//                  render_cache. The route refuses when there is no row rather
//                  than rendering one, so this document is only ever the reading
//                  she already has.
//   the headings   `PASANGAN_COPY.pdf_*`, Reyner's slots. While unruled they draw
//                  a `@@UNRULED` sentinel and a PRODUCTION build refuses; a
//                  preview build passes so the document can be walked and read.
//   the names      `glossary.json`, through the facts' own `label` and through
//                  `GLOSSARY.kompatibilitas[...].name_id`.
//   the columns    `PASANGAN_COPY.form_a_legend` / `form_b_legend` - "Kamu" and
//                  "Dia", Reyner's ruled 2026-09-08 values. Reused, not retyped.
//
// ── AND THE TRAP, WHICH HAS ALREADY COST A PAYING READER ──
// On 2026-09-08 `contrasting` and `q4` - raw engine keys - reached someone who had
// paid Rp 39.000, because a payload field carried a key and the component printed
// it believing it was a name. `lib/pair/serveReading.js` says out loud that the PDF
// is the next consumer that could make the same mistake independently. So:
//
//   * every name here is resolved through the glossary or through `f.label`;
//   * `namedOr` returns NULL for a missing cell and the row renders as an absence,
//     never as the key;
//   * the spec asserts that NO page text contains any `GLOSSARY.kompatibilitas`
//     key, any `q1..q4`, or any `provenance.cycle` value.
//
// ── RULE 25 BOUNDS THE FACTS TABLE, AND THE ENGINE HANDS US THE AMMUNITION ──
// `p5_pull_fit.provenance` carries `pull`, `fit`, `pull_reasons` and `fit_reasons`;
// `p3_supply.provenance.supplies[]` carries `supplier_presence_percent`. Those are
// scores and axis values. The quadrant prints its `name_id` and NOTHING else, and
// a supply prints its element and direction and no percentage. Y-3 R2 says the
// document is bounded only by the locked rules, and this is where they bind.
// ============================================================

import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';

import { GLOSSARY, elementId } from '../semantic/glossary.js';
import { buildSemanticJson } from '../semantic/index.js';
// READ, NEVER RETYPED. A relation -> cell table copied into this layer is a mapping
// that drifts from the engine and disagrees only on the rows nobody checks.
import { P2_BY_RELATION } from '../semantic/pair.js';
import { PASANGAN_COPY } from '../site/copy.js';
import { buildPairAppendix } from './pairAppendix.js';
import { assertEveryMechanicExplained, assertAnchorsUnique, anchorId } from './appendix.js';
import {
  PDF_STYLES as s, chartPage, appendixPages, chartPageFoot, refRow,
} from './document.js';
import { registerPdfFonts } from './fonts.js';

const E = React.createElement;

/**
 * A glossary `name_id`, or NULL.
 *
 * The same function `lib/pair/serveReading.js` defines and for the same reason: a
 * key with no cell yields null, which renders as no label, rather than printing the
 * key. A missing cell is a content gap and a content gap must look like an absence.
 */
const namedOr = (key) => GLOSSARY.kompatibilitas?.[key]?.name_id ?? null;

/** A pair fact by id. */
const factOf = (semanticJson, id) => (semanticJson.facts || []).find((f) => f.id === id) ?? null;

/**
 * `辰` -> the character in the HAN family, then `Naga` in the Latin one.
 *
 * TWO TEXTS AND NOT ONE STRING, and the reason is a defect this had on its first
 * draft: a single `Text` in `entryName` sets the whole run in the Latin family, and
 * react-pdf substitutes for the branch character - `pageTexts` came back with a
 * stray `P` and `*` where 子 and 未 belong, which is a tofu on the page. The
 * document-wide `drawnCodePoints` cannot catch it, because the same characters draw
 * correctly on the chart pages.
 *
 * Rule 23 either way: hanzi you can POINT AT, paired with its Indonesian name,
 * never bare - and now actually drawn.
 */
function branchCell(branch) {
  if (!branch) return [];
  const name = GLOSSARY.shio?.[branch]?.name_id;
  return [
    E(Text, { key: 'h', style: s.hanInline }, branch),
    ...(name ? [E(Text, { key: 'n', style: s.entryName }, name)] : []),
  ];
}

// ── THE FACTS TABLE ─────────────────────────────────────────
// One row per fact the reading carries, with the direction in the COLUMNS. Y-3:
// "If a fact's ruled text is direction-neutral, print it as ruled; the table's
// columns carry the direction, the sentence does not need to." That is what lets
// `p1_produces`'s ruled cell keep saying "salah satu ... yang lain" while this
// table says which is which - the cell is one string for both directions by
// ruling, so resolving the direction in prose would mean rewriting it.

/**
 * The rows, as data. Separated from the drawing so the spec can assert what is IN
 * the table without parsing a PDF, and so rule 25's bounds are visible in one
 * function rather than spread through a layout.
 *
 * @returns {Array<{term: string|null, anchorKey: string|null, a: string, b: string,
 *   meaning: string}>}
 */
export function factRows(semanticJson) {
  const rows = [];
  // `branches: true` says the two columns hold BRANCH CHARACTERS, which the page
  // draws in the han family beside their Indonesian names. It is a data flag rather
  // than an element here so `factRows` stays assertable without parsing a PDF.
  const add = (key, a, b, branches = false) => {
    const cell = GLOSSARY.kompatibilitas?.[key];
    if (!cell) return;
    rows.push({
      term: namedOr(key),
      anchorKey: key,
      a: a ?? '',
      b: b ?? '',
      branches,
      meaning: cell.label_meaning ?? '',
    });
  };

  // ── P1, the stem relation. DIRECTION FROM `provenance.cycle`. ──
  // The engine knows who gives: `a_produces_b`, `b_controls_a` and so on. The
  // columns carry the two ELEMENTS by their glossary `name_id`, because the cycle
  // string is an engine key and rule 14 keeps keys off the page.
  const p1 = factOf(semanticJson, 'p1_stem_relation');
  if (p1?.provenance?.variant) {
    add(p1.provenance.variant,
      elementId(p1.provenance.a?.element),
      elementId(p1.provenance.b?.element));
  }

  // ── P2, the day-branch relation(s), branches as hanzi + name ──
  const p2 = factOf(semanticJson, 'p2_day_pair');
  if (p2?.provenance?.variant) {
    add(p2.provenance.variant, p2.provenance.a_branch, p2.provenance.b_branch, true);
  }
  // ── THE PALACE FRAME. RULED 2026-09-14 (Reyner, ruling 1). ──
  // Cowork read the Y-1 PDF and found a row headed `Kursi Terikat` carrying
  // `p2_harmony.label_meaning` - "kursi pasangan kalian saling mengunci" - for a pair
  // whose seats are HARMED, not locked. The frame there is B's YEAR pillar touching
  // A's spouse palace; the sentence printed was about a day-pair harmony this chart
  // does not have. The old code iterated `provenance.variants` and passed the variant
  // key to `add`, so the row inherited the DAY PAIR's cell.
  //
  // The ruled shape:
  //   term     the P2 relation's `name_id`, so the row still resolves to the legend
  //   columns  the pillar that CREATES the frame, in that person's column, and the
  //            spouse palace it touches - the other person's day branch - in theirs
  //   meaning  `p2_palace_frame`'s own `label_meaning`, ALWAYS. The day-pair
  //            variant's meaning never appears in a frame row.
  //
  // ITERATED OVER THE HITS AND NOT OVER `variants`, which is what makes the columns
  // possible at all: a variant key is a relation with no position behind it, and the
  // whole content of this row is WHICH PILLAR reached WHICH palace.
  const frame = factOf(semanticJson, 'p2_palace_frame');
  const frameCell = GLOSSARY.kompatibilitas?.p2_palace_frame;
  const seenFrames = new Set();
  for (const hit of [...(frame?.provenance?.a_hits_b || []), ...(frame?.provenance?.b_hits_a || [])]) {
    // A day-to-day hit IS the day pair, mirrored. It already has its own row, and
    // printing it again as a "frame" would say the seat reaches itself.
    if (hit.from?.position === 'day' && hit.to?.position === 'day') continue;
    const key = P2_BY_RELATION[hit.relation];
    const cell = key ? GLOSSARY.kompatibilitas?.[key] : null;
    if (!cell || !frameCell) continue;

    // `from` is the pillar creating the frame; `to` is the spouse palace. Each goes
    // in ITS OWN person's column, so the direction is readable without a sentence.
    const aBranch = hit.from.chart === 'A' ? hit.from.branch : hit.to.branch;
    const bBranch = hit.from.chart === 'A' ? hit.to.branch : hit.from.branch;
    const dedupe = `${key}.${aBranch}.${bBranch}`;
    if (seenFrames.has(dedupe)) continue;
    seenFrames.add(dedupe);

    rows.push({
      term: cell.name_id ?? null,
      // The legend entry to reference is the RELATION's, which is the entry the
      // appendix carries for it - not `p2_palace_frame`, whose cell is nameless and
      // therefore has no reference row at all (correction 1).
      anchorKey: key,
      a: aBranch,
      b: bBranch,
      branches: true,
      meaning: frameCell.label_meaning ?? '',
    });
  }

  // ── P3, one row per supply, `from`/`to` mapped to the columns ──
  // NO `supplier_presence_percent`. It is a number about how much of an element a
  // chart holds, and rule 25 keeps scores off a reader's page.
  const p3 = factOf(semanticJson, 'p3_supply');
  const supplies = p3?.provenance?.supplies || [];
  if (supplies.length > 0) {
    // ── ONE ROW, BOTH COLUMNS. RULED 2026-09-14 (Y-4 commit 3). ──
    // This emitted one row PER SUPPLY, so a pair where each gives the other an
    // element got two rows both headed `Penyeimbang Unsur` carrying the SAME
    // sentence - the table saying one thing twice. The row is the FACT, and the
    // fact is "these two elements move between you"; each side's column names what
    // that side gives, so the direction still reads without a sentence saying it.
    const given = (side) => supplies
      .filter((sup) => sup.from === side)
      .map((sup) => elementId(sup.element))
      .filter(Boolean)
      .join(', ');
    add('p3_supplies', given('a'), given('b'));
  } else if (p3) {
    add('p3_no_supply', '', '');
  }
  const same = factOf(semanticJson, 'p3_same_imbalance');
  if (same) add('p3_same_imbalance', '', '');

  // ── P4, the pattern, and the two temperaments it compared ──
  const p4 = factOf(semanticJson, 'p4_temperament');
  if (p4?.provenance?.pattern) {
    // The two Aspek names, from the glossary, never the `比肩` hanzi bare and never
    // the English `companion` / `wealth` relation keys.
    const aspek = (side) => GLOSSARY.aspek?.[p4.provenance?.[side]?.god]?.name_id ?? '';
    add(`p4_${p4.provenance.pattern}`, aspek('a'), aspek('b'));
  }

  // ── P5, the quadrant. ITS `name_id` AND NOTHING ELSE. ──
  // No score, no axis numbers, no verdict word (rule 25, and Y-3 says it twice).
  // `pull`, `fit`, `pull_reasons` and `fit_reasons` are all in provenance and all
  // stay there.
  const p5 = factOf(semanticJson, 'p5_pull_fit');
  if (p5?.provenance?.quadrant) add(`p5_${p5.provenance.quadrant}`, '', '');

  return rows;
}

/** The two births, exactly as the report header shows them. Dates only. */
function birthLine(pair, side) {
  const person = pair?.[side];
  if (!person) return '';
  return [person.date, person.gender].filter(Boolean).join(' - ');
}

function coverPage({ semanticJson, pair }) {
  const a = semanticJson.core?.a || {};
  const b = semanticJson.core?.b || {};
  return E(Page, { size: 'A4', style: s.page },
    // ── ENGLISH LEADS. RULED 2026-09-14 (Reyner, ruling 2). ──
    // `name_en` is the bigger title, `name_id` under it and smaller. Both strings
    // were on this cover before the ruling, the other way round.
    //
    // A first, B second in BOTH lines - ENGINE ORDER, which is the reader's order:
    // `core.a` is the buyer in every pair payload.
    //
    // THE SEPARATOR STAYS ` - `. Reyner's example wrote "The Sun · The Garden" with
    // a middle dot. Rule 20 is keyboard characters only and `·` is not one, so the
    // example is read as illustrating the CONTENT - both English names, English
    // first - rather than ruling the separator. Flagged to him rather than adopted
    // or ignored silently.
    //
    // The EN display layer, names only (rule 23's 2026-08-02 ruling). No brackets:
    // the brackets convention is for reading PROSE, and this is a title block.
    E(Text, { style: s.coverTitle },
      [a.archetype_name_en, b.archetype_name_en].filter(Boolean).join(' - ')),
    E(Text, { style: s.coverSub }, `${a.archetype_name_id} dan ${b.archetype_name_id}`),
    E(View, { style: s.rule }),
    E(Text, { style: s.body }, PASANGAN_COPY.pdf_cover_sub),
    // THE TWO BIRTHS, AND NOT ONE FIELD MORE. Y-3: exactly as the report header
    // shows them today. `servePairReading`'s `pair` block carries date and gender
    // and nothing else - no time, no chart, nothing derived about person B. If
    // Reyner wants birth times on the cover he rules it.
    ...[['a', birthLine(pair, 'a')], ['b', birthLine(pair, 'b')]]
      .filter(([, line]) => line)
      .map(([side, line]) => E(Text, { key: side, style: s.small }, line)));
}

/**
 * The reading, verbatim from the cache row.
 *
 * NOT `readingPage` FROM THE MIRROR, and the difference is one line: the mirror's
 * heading is `Bacaanmu`, which is false of a document about two people. Rather than
 * parameterise a heading nobody has ruled for this document, the compat reading
 * page carries NO heading at all - the cover names the pair one page earlier, and
 * the first block is the engine's own opening sentence.
 */
function readingPage(rendered, semanticJson) {
  // ── THE QUADRANT IS THE READING'S TITLE. RULED 2026-09-14 (Y-4 commit 3). ──
  // The engine already decides the quadrant, so naming it at the top is STRUCTURE
  // (rule 14) rather than a new claim: no new string, no verdict word, just the
  // `name_id` the glossary already rules. It goes AFTER the engine P0 sentence,
  // which stays the document's first line.
  //
  // `namedOr` rather than the raw key, for the reason `serveReading` records: on
  // 2026-09-08 `q4` reached a reader who had paid Rp 39.000, because a field carried
  // a key and the surface printed it. The web report names it from the same
  // resolved source, so the page and the PDF cannot disagree.
  const quadrant = semanticJson?.core?.quadrant
    ? namedOr(`p5_${semanticJson.core.quadrant}`) : null;
  const [opening, ...rest] = rendered.blocks || [];

  return E(Page, { size: 'A4', style: s.page, wrap: true },
    ...(opening ? [
      ...(opening.heading ? [E(Text, { key: 'h0', style: s.h2 }, opening.heading)] : []),
      E(Text, { key: 't0', style: s.body }, opening.text || ''),
    ] : []),
    ...(quadrant ? [E(Text, { key: 'title', style: s.h1 }, quadrant)] : []),
    ...rest.flatMap((b, n) => {
      const i = n + 1;
      // ── THE P5 BLOCK DOES NOT REPEAT THE TITLE ────────────────
      // The P5 block's heading IS the quadrant `name_id` - the same words now
      // standing as the reading's title one screen up. Printing both is the stutter
      // Reyner already ruled on once (2026-09-09 amendment f: `section_element` and
      // `p3_supplies.name_id` were the same words, and the duplicate was suppressed
      // in `PasanganReport`). Suppressing the LOWER one keeps his ruled title where
      // he put it. Technicality under rule 9; if he wants the block heading kept and
      // the title worded differently, that is a new string and therefore his.
      const heading = b.heading && b.heading !== quadrant ? b.heading : null;
      return [
        ...(heading ? [E(Text, { key: `h${i}`, style: s.h2 }, heading)] : []),
        E(Text, { key: `t${i}`, style: s.body }, b.text || ''),
      ];
    }),
    ...(rendered.penutup ? [E(Text, { style: s.penutup }, rendered.penutup)] : []));
}

/**
 * The facts page: the data behind the reading, as a table.
 *
 * The foot of THIS page carries rule 25's line and the provenance, because it is
 * the document's last page before the legend and it is the data page - the same
 * job `chartPageFoot` does on the mirror's chart page. Y-3's list says "Colophon -
 * the mirror's, unchanged"; THE MIRROR HAS NO COLOPHON. Reyner killed that page on
 * 2026-08-22 and the disclaimer moved to the chart page's foot at 8pt. The prompt
 * is stale on that one line and this is the unchanged thing it was pointing at.
 */
function factsPage({ semanticJson, rendered, rows }) {
  const col = { flexDirection: 'row', marginBottom: 8 };
  return E(Page, { size: 'A4', style: s.page, wrap: true },
    E(Text, { style: s.h1 }, PASANGAN_COPY.pdf_facts_heading),
    // The column heads: Reyner's ruled address terms, reused rather than retyped.
    E(View, { style: { ...col, marginBottom: 4 } },
      E(View, { style: { width: '34%', paddingRight: 8 } }, E(Text, { style: s.cellLabel }, '')),
      E(View, { style: { width: '33%', paddingRight: 8 } },
        E(Text, { style: s.cellLabel }, PASANGAN_COPY.form_a_legend)),
      E(View, { style: { width: '33%' } },
        E(Text, { style: s.cellLabel }, PASANGAN_COPY.form_b_legend))),
    E(View, { style: s.rule }),
    ...rows.flatMap((r, i) => [
      E(View, { key: `r${i}`, style: col },
        E(View, { style: { width: '34%', paddingRight: 8 } },
          // A nameless cell prints no term - correction 1. The meaning below still
          // explains it, which is the whole of correction 2.
          E(Text, { style: s.entryName }, r.term ?? '')),
        E(View, { style: { width: '33%', paddingRight: 8 } },
          ...(r.branches ? branchCell(r.a) : [E(Text, { style: s.entryName }, r.a)])),
        E(View, { style: { width: '33%' } },
          ...(r.branches ? branchCell(r.b) : [E(Text, { style: s.entryName }, r.b)]))),
      E(Text, { key: `m${i}`, style: s.entryMeaning }, r.meaning),
    ]),
    ...chartPageFoot({ semanticJson, rendered }));
}

/**
 * The compat document, whole. Fed to `buildPdf` as a composer.
 *
 * @param {Object} args
 * @param {Object} args.chartA calculateBaziChart output for the reader
 * @param {Object} args.chartB the same for the other person
 * @param {Object} args.semanticJson buildPairSemantic output
 * @param {Object} args.rendered a render_cache row: blocks, penutup, versions.
 *   VERBATIM - this function never re-renders.
 * @param {Object} args.pair `servePairReading`'s `pair` block: the two births
 * @param {Object} args.pageMap anchor -> page, from the fixed point. `{}` on pass 1.
 * @returns {React.ReactElement}
 */
export function pairDocument({
  chartA, chartB, semanticJson, rendered, pair, pageMap,
}) {
  registerPdfFonts();
  const appendix = buildPairAppendix({ chartA, chartB, semanticJson });
  // CORRECTION 2's GATE AND THE ANCHOR CHECK, at the door of the document rather
  // than in a script, exactly as `completeEdition` does it - so no caller can emit
  // a compat PDF without them.
  assertEveryMechanicExplained(appendix);
  assertAnchorsUnique(appendix);

  if (!pageMap || typeof pageMap !== 'object') {
    throw new Error('pairDocument: pageMap is required (pass {} only from the '
      + 'fixed-point loop; callers wanting bytes use buildPairPdf)');
  }

  const rows = factRows(semanticJson);
  // ── THE THREE REFERENCE LISTS ARE GONE. RULED 2026-09-14 (R6). ──
  // This document had the most of them - chart A's terms, chart B's, and the facts
  // page's - and a `factRefs` projection to feed the third. All of it is deleted
  // rather than left unused: dead plumbing still reads as a feature to the next
  // session, and `appendix.chartA` / `chartB` / `compat` remain on the appendix for
  // a composer that wants them back.
  const chartFor = (chart, heading) => chartPage({
    chart,
    semanticJson: buildSemanticJson(chart),
    heading,
  });

  return E(Document, {
    title: `Katon - ${semanticJson.core?.a?.archetype_name_id} dan ${semanticJson.core?.b?.archetype_name_id}`,
    author: 'katon.app',
    // No Creator/Producer string naming a model, for the mirror's reason.
  },
  coverPage({ semanticJson, pair }),
  readingPage(rendered, semanticJson),
  chartFor(chartA, PASANGAN_COPY.pdf_chart_a_heading),
  chartFor(chartB, PASANGAN_COPY.pdf_chart_b_heading),
  factsPage({ semanticJson, rendered, rows }),
  // NO SUB-LINE. The mirror's says "semuanya dari baganmu sendiri", which is false
  // of a legend drawn from two charts, and writing a second sentence here would be
  // unreviewed Indonesian. A candidate slot for Reyner, not a line for this file.
  appendixPages(appendix));
}

/** Every anchor the compat document references, for a caller that wants the ids. */
export const pairAnchorIds = (appendix) => appendix.groups
  .flatMap((g) => g.entries).map((e) => anchorId(e));

/** The reference row form, re-exported so a caller need not reach past this module. */
export { refRow };
