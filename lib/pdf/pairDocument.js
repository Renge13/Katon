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
import { P2_FRAME_BY_RELATION, p3SupplyKey, p2FrameKeys } from '../semantic/pair.js';
import { PASANGAN_COPY } from '../site/copy.js';
import { RENDER_COPY } from '../render/copy.js';
import { birthSummary, GENDER_WORDS } from '../site/birthSummary.js';
import { CHROME_COPY } from '../site/copy.js';
import { buildPairAppendix } from './pairAppendix.js';
import { assertEveryMechanicExplained, assertAnchorsUnique, anchorId } from './appendix.js';
import {
  PDF_STYLES as s, chartBlock, appendixPages, coverFoot, refRow, runningFooter, wordmark,
  provenanceLine, closingPage,
  glossChildren,
  GLOSS_TEXT_PROPS,
  eyebrowHeading,
} from './document.js';
import { splitParagraphs } from '../render/paragraphs.js';
import { elColor } from '../site/elements.js';

// ── THE COMPLETE EDITION'S SYSTEM, LOCAL STYLES (Prompt BC §4, 2026-10-02) ──
// Reyner, 2026-10-01: "the design styling on compat is not consistent with the mirror
// (the color, separator), also the data part need better layouting." The reading page
// now uses the CE's own pieces (eyebrowHeading with its divider, splitParagraphs, the
// prose styles), and these few styles exist only here so the mirror's document cannot
// move (its page fixture would catch it).
const PS = {
  // The column heads: the CE's tracked small caps (its coverProfile / eyebrow family).
  colHead: { fontSize: 8, letterSpacing: 8 * 0.14, textTransform: 'uppercase', color: '#8A7F72' },
  // One table row with a thin divider under it, the CE's sectionRule colour.
  row: { borderBottomWidth: 0.75, borderBottomColor: '#EFE7DA', paddingBottom: 12, marginBottom: 12 },
  // The palace-frame row's sentence, spanning the Kamu and Dia columns.
  span: { fontSize: 10, lineHeight: 1.5, color: '#333333' },
  // The births on the cover, in the CE's profile-line format.
  birth: { fontSize: 8.5, lineHeight: 1.3, letterSpacing: 8.5 * 0.14, textTransform: 'uppercase', color: '#8A7F72', marginTop: 30 },
};
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
  // ── ONE LINE: `子 Tikus`. C3, ruled ok 2026-09-22. ──
  // Still two faces - the character in the han family, the name in Latin, which is
  // the tofu lesson above - but as NESTED runs of one line rather than two stacked
  // Texts, so each column reads as one item.
  return [
    E(Text, { key: 'hn', style: s.entryName },
      E(Text, { style: s.hanInline }, branch),
      ...(name ? [` ${name}`] : [])),
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
  //   term     the relation's FRAME cell `name_id` (`p2_frame_*`, Reyner 2026-09-26;
  //            it was the seat cell's name, which describes both seats), so the row
  //            still resolves to the legend
  //   columns  the pillar that CREATES the frame, in that person's column, and the
  //            spouse palace it touches - the other person's day branch - in theirs
  //   meaning  `p2_palace_frame`'s own `label_meaning`, ALWAYS. The day-pair
  //            variant's meaning never appears in a frame row.
  //
  // ITERATED OVER THE HITS AND NOT OVER `variants`, which is what makes the columns
  // possible at all: a variant key is a relation with no position behind it, and the
  // whole content of this row is WHICH PILLAR reached WHICH palace.
  const frame = factOf(semanticJson, 'p2_palace_frame');
  // E13 (2026-10-02): the frame's own cell, by direction - `p2_palace_frame` for a
  // B->A frame, `p2_palace_frame_reader` for A->B only. Read through p2FrameKey, the
  // same choice the fact's entry made, so the PDF and the reading cannot disagree.
  // BC amendment 1 item 5 (2026-10-02): and by relation - a harmony frame leads with the
  // harmony sentence, and a direction carrying both leads with both, as the fact does
  // (`p2FrameKeys`).
  const frameLead = frame
    ? p2FrameKeys(frame.provenance).map((k) => GLOSSARY.kompatibilitas?.[k]?.label_meaning).filter(Boolean).join(' ')
    : '';
  const seenFrames = new Set();
  for (const hit of [...(frame?.provenance?.a_hits_b || []), ...(frame?.provenance?.b_hits_a || [])]) {
    // A day-to-day hit IS the day pair, mirrored. It already has its own row, and
    // printing it again as a "frame" would say the seat reaches itself.
    if (hit.from?.position === 'day' && hit.to?.position === 'day') continue;
    const key = P2_FRAME_BY_RELATION[hit.relation];
    const cell = key ? GLOSSARY.kompatibilitas?.[key] : null;
    if (!cell || !frameLead) continue;

    // `from` is the pillar creating the frame; `to` is the spouse palace. Each goes
    // in ITS OWN person's column, so the direction is readable without a sentence.
    const aBranch = hit.from.chart === 'A' ? hit.from.branch : hit.to.branch;
    const bBranch = hit.from.chart === 'A' ? hit.to.branch : hit.from.branch;
    const dedupe = `${key}.${aBranch}.${bBranch}`;
    if (seenFrames.has(dedupe)) continue;
    seenFrames.add(dedupe);

    // ── THE PILLAR THAT CREATES THE FRAME IS NAMED (2026-09-26) ──
    // The ruling above puts "the pillar that CREATES the frame" in that person's
    // column, and the glossary's own note on `p2_palace_frame` says "the renderer
    // names the pillar". Only its BRANCH was printed. So a pair whose partner has the
    // same branch in the day and hour pillars (g4WH4: B 己未 day, 辛未 hour) printed
    // "Kursi Bergesekan 子 Tikus | 未 Kambing" twice - the day pair, and B's HOUR
    // pillar reaching A's seat - and read as one fact printed twice. The pillar's
    // name is the glossary's own `pilar.<position>.name_id` (no new string).
    const pillar = GLOSSARY.pilar?.[hit.from.position]?.name_id ?? null;
    rows.push({
      term: cell.name_id ?? null,
      aPillar: hit.from.chart === 'A' ? pillar : null,
      bPillar: hit.from.chart === 'A' ? null : pillar,
      // The legend entry to reference is the RELATION's, which is the entry the
      // appendix carries for it - not `p2_palace_frame`, whose cell is nameless and
      // therefore has no reference row at all (correction 1).
      anchorKey: key,
      a: aBranch,
      b: bBranch,
      branches: true,
      // ── THE FRAME SENTENCE IS NOT ON THE ROW. C2, ruled 2026-09-22. ──
      // It used to be `frameCell.label_meaning` on EVERY frame row, so a buyer read
      // one sentence three times in her own data table and the product looked like
      // it was contradicting itself. The 2026-09-14 ruling that put it here is
      // UNCHANGED and is not being reversed: the relation's own meaning must never
      // appear on a frame row, and it still does not. What changes is that the
      // frame's shared sentence prints ONCE, as the lead line of the frame group -
      // see `factsPage`. Same ruled words, one appearance.
      //
      // AB §2 corrects the markup's diagnosis on the way past: this was never a
      // glossary entry that lost its key. The cell is nameless by design.
      frame: true,
      // The group's lead sentence, printed once before the first frame row (C2).
      // Carried on the row since E13 so it follows the frame's direction.
      lead: frameLead,
      meaning: '',
    });
  }

  // ── THE REFRAME, UNDER THE SEAT ROWS. RULED 2026-09-22. ──
  // `p2_reframe` exists as a fact only when the day variant is a hard one -
  // `dayVariant !== 'p2_harmony' && !== 'p2_none'` in `lib/semantic/pair.js` - so
  // its presence IS "a hard seat exists" and no second condition is computed here.
  //
  // IT IS A NOTE, NOT A ROW: no term, no columns, full width. It does not describe
  // a mechanic in the way every other row does; it tells a reader what the seat
  // rows above her do NOT mean. Reyner ruled the placement on 2026-09-22 after AB
  // §2 would have dropped it from the document entirely - see `pairAppendix.js`.
  //
  // PLACED HERE, between the seat rows and P3, because "under the seat rows" is
  // where it answers the thing she has just read. A note at the foot of the table
  // would be a footnote to five facts instead of a reply to two.
  const reframe = factOf(semanticJson, 'p2_reframe');
  const reframeCell = GLOSSARY.kompatibilitas?.p2_reframe;
  if (reframe && reframeCell?.label_meaning) {
    rows.push({ note: true, term: null, a: '', b: '', meaning: reframeCell.label_meaning });
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
    // The cell is the engine's choice (`p3SupplyKey`): `p3_reader_gives` when only
    // the reader gives, so the meaning column never says the partner brings her
    // something the partner does not (Prompt AM ruling 1).
    add(p3SupplyKey(supplies), given('a'), given('b'));
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

function coverPage({
  semanticJson, pair, rendered, chartA, chartB,
}) {
  const a = semanticJson.core?.a || {};
  const b = semanticJson.core?.b || {};
  // ── A2: THE RULED BIRTH FORM, ONE LINE PER PERSON. ──────────
  // It printed `1989-09-13 - female` (ISO, English gender); the first fix printed
  // `pairLine` - "Perempuan, 13 September 1989 dan Laki-laki, 4 Maret 1990" - which
  // is the web header's sentence, not A2's form. Round-1 markup R3 (2026-09-24):
  // BOTH covers print `birthSummary` output unchanged - `13 Sep 1989, 09.00,
  // Perempuan` - one line per person, the reader first (engine order, `core.a`).
  // Date and hour come from each person's CHART (built from the pair row's own
  // columns), the gender from the pair block, which is the only place it lives.
  const births = [[chartA, pair?.a], [chartB, pair?.b]]
    .map(([chart, person]) => (chart ? birthSummary(
      { date: chart.birthDate, time: chart.birthTime, gender: person?.gender },
      { timeUnknown: CHROME_COPY.summary_time_unknown, genderWords: GENDER_WORDS },
    ) : null))
    .filter(Boolean);
  return E(Page, { size: 'A4', style: s.page },
    wordmark(),
    E(Text, { style: s.coverEyebrow }, RENDER_COPY.pdfEditionCompat),
    // ── INDONESIAN LEADS. A3, ruled ok 2026-09-22. ────────────
    // REVERSES the 2026-09-14 "English leads" ruling below, by Reyner's own later
    // mark (rule 23: Indonesian first, English pair once). What stays true of it:
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
    // ── THE ENGLISH TITLES ALONE, G1 (Reyner 2026-10-02; rule 23 amended) ──
    // The title is the two English names joined by "dan"; the Indonesian pair it
    // replaces is no longer shown, and the English sub-line under it goes with it.
    // BROKEN BEFORE "dan", ON PURPOSE: the English titles are longer than the Indonesian
    // names were, and left to wrap the title split a name ("The Mountain dan The" /
    // "Ocean", pair 2x6). Each name now keeps its own line.
    // ── EACH TITLE IN ITS PERSON'S ELEMENT COLOUR (Prompt BC §4) ── as the CE's cover
    // sets its one title in the reader's element colour; "dan" stays ink.
    E(Text, { style: [s.coverTitle, s.coverTitlePair] },
      E(Text, { style: { color: elColor(a.element)?.deep } }, a.archetype_name_en),
      '\n',
      'dan ',
      E(Text, { style: { color: elColor(b.element)?.deep } }, b.archetype_name_en)),
    // THE TWO BIRTHS, AND NOT ONE FIELD MORE. Y-3: exactly as the report header
    // shows them today. `servePairReading`'s `pair` block carries date and gender
    // and nothing else - no time, no chart, nothing derived about person B. If
    // Reyner wants birth times on the cover he rules it.
    ...births.map((line, i) => E(Text, {
      key: `birth${i}`, style: i ? { ...PS.birth, marginTop: 4 } : PS.birth,
    }, line)),
    E(Text, { style: { ...s.body, marginTop: 6 } }, PASANGAN_COPY.pdf_cover_sub),
    // A11: the disclaimer, at the cover foot as on the mirror (the provenance line left
    // the page for the metadata, Prompt BE §5a).
    ...(rendered ? [coverFoot({ semanticJson, rendered })] : []),
    // F1 on every page, the cover included (Prompt BE §5b). LAST, so the cover's text
    // still opens on the wordmark.
    runningFooter(RENDER_COPY.pdfEditionCompat));
}

// A HEADING KEEPS ITS FIRST PARAGRAPH (2026-09-26): KEEP_WITH_NEXT lived here for the h2
// headings. Since Prompt BC §4 the chapters use the CE's eyebrowHeading, which carries its
// own minPresenceAhead, so the constant went with the h2 headings.

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
    runningFooter(RENDER_COPY.pdfEditionCompat),
    // ── THE TITLE LEADS. C1, ruled ok 2026-09-22. ────────────
    // The `p0_opening` line used to print ABOVE the quadrant title, so a body-size
    // sentence outranked the reading's own headline and the page opened with its
    // second-most-important line. Title first, opening as its sub-line.
    //
    // THE 2026-09-14 RULING IS NOT DISTURBED. That one says the quadrant goes AFTER
    // the engine's P0 sentence because P0 "stays the document's first line" - but
    // what it was protecting is that the ENGINE's sentence is not displaced by a
    // model's, and it is not: both are still here, still engine-owned, still in the
    // same block. What changes is which one is set as the heading. A reader meets
    // the headline first and the sentence explains it, which is the order every
    // other page of this document already uses.
    ...(quadrant ? [E(Text, { key: 'title', style: s.h1 }, quadrant)] : []),
    // ── EVERY CHAPTER IN THE CE'S STYLE (Prompt BC §4) ── the divider and the orange
    // eyebrow heading (eyebrowHeading, the CE's own), then the paragraphs split as the
    // web splits them, in the CE's prose styles. The words are the cache row's.
    ...[opening, ...rest].filter(Boolean).flatMap((b, i) => {
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
        heading
          ? eyebrowHeading(heading, { key: `h${i}`, section: true, first: i === 0 })
          : E(View, { key: `h${i}`, style: [s.sectionRule, i === 0 ? { marginTop: 10 } : null] }),
        ...splitParagraphs(b.text).map((p, j) => E(Text, {
          key: `t${i}.${j}`, style: [s.prose, j ? s.proseNext : null], orphans: 3, widows: 3, ...GLOSS_TEXT_PROPS,
        }, ...glossChildren(p))),
      ];
    }),
    ...(rendered.penutup
      ? [E(Text, { key: 'penutup', style: [s.prose, s.penutup], orphans: 3, widows: 3, ...GLOSS_TEXT_PROPS }, ...glossChildren(rendered.penutup))]
      : []));
}

// The frame group's lead sentence was a module constant, `p2_palace_frame`'s
// `label_meaning`, until E13 (2026-10-02): an A->B-only frame printed the B->A
// sentence above its own rows. It now rides on each frame row as `lead`, read from
// the glossary cell `factRows` chose. Still the glossary's value, never a literal.

/**
 * A row with nothing in either person's column - a pair-level fact, not a
 * per-person one (`p3_no_supply`, `p3_same_imbalance`, the P5 quadrant).
 *
 * ── C4, ruled ok 2026-09-22. ────────────────────────────
 * The quadrant row printed as a row with two empty cells. Any row whose columns are
 * both empty now renders FULL WIDTH - term, then its meaning - because an empty
 * `Kamu` / `Dia` cell says "this person has nothing here", which is false of a fact
 * about the two of them together.
 */
const pairLevel = (r) => !r.note && !r.frame && !String(r.a || '').trim() && !String(r.b || '').trim();

// The three column widths, one definition for the head and every row.
const COL = { term: '34%', a: '33%', b: '33%' };

/**
 * The facts page: the data behind the reading, as a table.
 *
 * ── THE COLOPHON LEFT THIS PAGE. A11, ruled ok 2026-09-22. ──
 * Its foot carried rule 25's line and the provenance, because it was the last page
 * before the legend. They are on the COVER foot now, in both documents
 * (`coverFoot`), and this page is only the table.
 *
 * ── C3, THE ROW RHYTHM. Ruled ok 2026-09-22. ────────────
 * Row heading, cells, description and the next heading were one undifferentiated
 * rhythm. Now: the description is a smaller muted line under its row, and each row
 * group has 10pt before the next. A row and its description are ONE unbreakable
 * group (A9's rule, so a term never ends a page with its meaning on the next).
 */
function factsPage({ rows }) {
  const cells = { flexDirection: 'row' };
  // A TABLE PAGE: the wider column (`TABLE_MARGIN_X`), for the appendix's reason.
  return E(Page, { size: 'A4', style: [s.page, s.tablePage], wrap: true },
    runningFooter(RENDER_COPY.pdfEditionCompat, { table: true }),
    E(Text, { style: s.h1 }, PASANGAN_COPY.pdf_facts_heading),
    // The column heads: Reyner's ruled address terms, reused rather than retyped.
    E(View, { style: { ...cells, marginBottom: 4 } },
      E(View, { style: { width: COL.term, paddingRight: 8 } }, E(Text, { style: s.cellLabel }, '')),
      E(View, { style: { width: COL.a, paddingRight: 8 } },
        E(Text, { style: PS.colHead }, PASANGAN_COPY.form_a_legend)),
      E(View, { style: { width: COL.b } },
        E(Text, { style: PS.colHead }, PASANGAN_COPY.form_b_legend))),
    E(View, { style: s.rule }),
    ...keepLastRowsTogether(rows.map((r, i) => {
      const meaning = String(r.meaning || '').trim()
        ? [E(Text, { key: 'm', style: s.factsDesc }, r.meaning)] : [];
      return [
        // ── THE FRAME GROUP'S LEAD LINE, PRINTED ONCE (C2) ──
        // Before the FIRST frame row only. The sentence belongs to the group of frame
        // rows rather than to any one of them, which is what "she reads it three
        // times" was telling us; a lead line is that relationship drawn.
        // ── IT HAS A LABEL NOW (Prompt BC §4; Reyner: "the data part need better
        // layouting") ── it printed as a sentence with nothing on its left. Its label is
        // the ruled chrome string for this group, `section_seat` ("Kursi Pasangan"); its
        // sentence spans the Kamu and Dia columns.
        ...(r.frame && rows.findIndex((x) => x.frame) === i
          ? [E(View, { key: `lead${i}`, style: [cells, PS.row], wrap: false },
            E(View, { style: { width: COL.term, paddingRight: 8 } }, E(Text, { style: s.entryName }, PASANGAN_COPY.section_seat)),
            E(View, { style: { width: `${parseFloat(COL.a) + parseFloat(COL.b)}%` } }, E(Text, { style: PS.span }, r.lead)))]
          : []),
        // A NOTE HAS NO ROW AT ALL - no term cell, no columns, full width. It is the
        // reframe (ruled 2026-09-22).
        ...(r.note ? [E(Text, { key: `n${i}`, style: s.factsNote }, r.meaning)] : []),
        // A PAIR-LEVEL ROW (C4) is its term and its meaning, full width. The P5
        // quadrant is the table's closing line, so it gets a rule above it.
        ...(pairLevel(r) ? [E(View, {
          key: `p${i}`,
          style: String(r.anchorKey || '').startsWith('p5_') ? [s.factsGroup, s.factsVerdict] : s.factsGroup,
          wrap: false,
        },
          ...(String(r.anchorKey || '').startsWith('p5_') ? [E(View, { key: 'rule', style: s.rule })] : []),
          E(Text, { key: 't', style: s.entryName }, r.term ?? ''),
          ...meaning)] : []),
        ...(r.note || pairLevel(r) ? [] : [E(View, { key: `r${i}`, style: [s.factsGroup, PS.row], wrap: false },
          E(View, { style: cells },
            E(View, { style: { width: COL.term, paddingRight: 8 } },
              // A nameless cell prints no term - correction 1. The meaning below still
              // explains it, which is the whole of correction 2.
              E(Text, { style: s.entryName }, r.term ?? '')),
            E(View, { style: { width: COL.a, paddingRight: 8 } },
              ...(r.branches ? branchCell(r.a) : [E(Text, { style: s.entryName }, r.a)]),
              ...(r.aPillar ? [E(Text, { key: 'ap', style: s.cellLabel }, r.aPillar)] : [])),
            E(View, { style: { width: COL.b } },
              ...(r.branches ? branchCell(r.b) : [E(Text, { style: s.entryName }, r.b)]),
              ...(r.bPillar ? [E(Text, { key: 'bp', style: s.cellLabel }, r.bPillar)] : []))),
          // A frame row carries no meaning cell, so it prints none rather than an
          // empty Text that still takes vertical space.
          ...meaning)]),
      ];
    }), rows));
}

/**
 * THE LAST ROW NEVER STANDS ALONE (Reyner 2026-10-06, on #199). Every row is already
 * unbreakable, so the table could end on a page that held only its last row - the P5
 * quadrant - as the floor 1 x 2 PDF did on page 5. The second-to-last row (a note is not a
 * row) and everything after it are one unbreakable group, so they move together.
 *
 * @param {Array<Array<React.ReactElement>>} perRow each row's elements, in order
 * @param {Object[]} rows the rows they were built from
 */
function keepLastRowsTogether(perRow, rows) {
  const real = rows.map((r, i) => (r.note ? -1 : i)).filter((i) => i >= 0);
  if (real.length < 2) return perRow.flat();
  const from = real.at(-2);
  return [...perRow.slice(0, from).flat(), E(View, { key: 'tail', wrap: false }, ...perRow.slice(from).flat())];
}

/**
 * Both charts, on ONE page. C5 / A11, ruled ok 2026-09-22.
 *
 * They were two pages each about 40% used. Stacked, each block keeps its own heading
 * (Reyner's two ruled slots), its pillars with the conception pillar beside them, and
 * its own element bars. `wrap` stays on so a chart that ever grows does not CLIP -
 * an unwrapped react-pdf Page truncates silently rather than overflowing.
 */
function chartsPage({ chartA, chartB }) {
  // compact: C5, both charts on ONE page (see chartBlock).
  const block = (chart, heading) => chartBlock({
    chart, semanticJson: buildSemanticJson(chart), heading, compact: true,
  });
  // A DATA PAGE, so the table column, as on the mirror's chart page.
  return E(Page, { size: 'A4', style: [s.page, s.tablePage], wrap: true },
    runningFooter(RENDER_COPY.pdfEditionCompat, { table: true }),
    // One keyed View per chart: the two blocks share element keys (`bar-Api`...).
    E(View, { key: 'a' }, ...block(chartA, PASANGAN_COPY.pdf_chart_a_heading)),
    E(View, { key: 'sep', style: { ...s.rule, marginVertical: 14 } }),
    E(View, { key: 'b' }, ...block(chartB, PASANGAN_COPY.pdf_chart_b_heading)));
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

  return E(Document, {
    title: `Katon - ${semanticJson.core?.a?.archetype_name_en} dan ${semanticJson.core?.b?.archetype_name_en}`,
    author: 'katon.app',
    // No Creator/Producer string naming a model, for the mirror's reason.
    // THE PROVENANCE, OFF THE PAGE AND INTO THE METADATA (Prompt BE §5a).
    subject: provenanceLine({ semanticJson, rendered }),
  },
  coverPage({
    semanticJson, pair, rendered, chartA, chartB,
  }),
  readingPage(rendered, semanticJson),
  chartsPage({ chartA, chartB }),
  factsPage({ rows }),
  // NO SUB-LINE. The mirror's says "semuanya dari baganmu sendiri", which is false
  // of a legend drawn from two charts, and writing a second sentence here would be
  // unreviewed Indonesian. A candidate slot for Reyner, not a line for this file.
  appendixPages(appendix, { edition: RENDER_COPY.pdfEditionCompat }),
  // C1, the closing page, after the glossary (Prompt BE §5c).
  closingPage());
}


/** Every anchor the compat document references, for a caller that wants the ids. */
export const pairAnchorIds = (appendix) => appendix.groups
  .flatMap((g) => g.entries).map((e) => anchorId(e));

/** The reference row form, re-exported so a caller need not reach past this module. */
export { refRow };
