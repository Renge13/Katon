// ============================================================
// The Complete Edition PDF — the document
// ============================================================
// Prompt M build steps 2 and 3. Cover, reading, chart, appendix. FOUR sections, not
// five: the colophon page was killed by Reyner on 2026-08-22 and rule 25 now rides at
// the foot of the chart page. See chartPageFoot.
//
// ── React.createElement, NOT JSX, AND FOR THE SAME REASON AS THE CARD ──
// `components/cards/Card.js` already settled this: Node cannot load JSX (it strips
// TypeScript types and nothing else), the repo has no esbuild, no @swc/core and no
// babel runtime to borrow, and the alternatives were a build step for one file or a
// second copy of the layout inside a script. A second copy of a layout is two sources
// of truth for the thing the file exists to define. So `E`, and one tree that Next,
// a script and `node --test` all load.
//
// ── THE PDF AUTHORS NOTHING. THIS IS A HARD RULE. ─────────
// Every word here comes from somewhere that already ruled it:
//
//   the reading      `rendered.blocks` / `rendered.penutup`, VERBATIM from
//                    render_cache. Not re-rendered, not re-wrapped, not tidied. A
//                    PDF that regenerates its own prose is a second reading wearing
//                    the first one's name.
//   the chart page   `semanticJson.chart` - the eight characters with their
//                    Indonesian animals and palaces, which is the engine's own
//                    pairing.
//   the appendix     `buildAppendix`, which reads glossary.json.
//   the disclaimer   `RENDER_COPY.pdfDisclaimer`, Reyner's ruled line, in the bank
//                    scripts/check-copy.js sweeps. See chartPageFoot.
//
// If a string in this file is not traceable to one of those, it is a defect.
//
// ── WHAT IS DELIBERATELY NOT HERE ─────────────────────────
// Per prompt M's NOT IN THIS PROMPT: no design pass (typography, colour and cover
// treatment come after Reyner signs off what the document SAYS), no card image, and
// no checkout wiring. The styles below are plain and legible on purpose - they are
// scaffolding for a content review, not a proposal about how the document should
// look.
//
// ── STEP 4 IS HALF HERE AND HALF IN build.js, ON PURPOSE ──
// This file OWNS the printed form: the anchors on appendix entries, the reference
// list on the chart page, and `refRow` as the one definition of how a reference
// reads. It does not own the ANSWER - `pageMap` arrives as a parameter, because a
// reference's page number depends on the layout the reference itself changes, and
// resolving that is a loop over whole builds rather than a property of one tree.
// `lib/pdf/build.js` runs that loop, refuses to emit on drift, and is the only door
// to Complete Edition bytes. Step 5, correction 2's gate, is at `completeEdition`.
// ============================================================

import React from 'react';
import {
  Document, Page, Text, View, StyleSheet,
} from '@react-pdf/renderer';

import { RENDER_COPY } from '../render/copy.js';
import { GLOSSARY } from '../semantic/glossary.js';
import { ELEMENT_PRESENCE_NOTE } from '../semantic/index.js';
import {
  buildAppendix, assertEveryMechanicExplained, anchorId, assertAnchorsUnique,
} from './appendix.js';
import { registerPdfFonts, FAMILY_HAN, FAMILY_LATIN } from './fonts.js';

const E = React.createElement;

export const PDF_STYLES = StyleSheet.create({
  page: {
    paddingTop: 56, paddingBottom: 56, paddingHorizontal: 56,
    fontFamily: FAMILY_LATIN, fontSize: 11, lineHeight: 1.6, color: '#1A1A1A',
  },
  // ── EVERY STYLE ABOVE 11pt CARRIES ITS OWN lineHeight ─────
  // RULED 2026-09-14 (Reyner, ruling 3), and the cause is one inherited number.
  // `page` sets `fontSize: 11, lineHeight: 1.6`; react-pdf resolves that to an
  // ABSOLUTE 17.6pt and inherits the NUMBER, not the ratio - so a 34pt cover title
  // and a 26pt pillar character both got a 17.6pt line box. Measured on the artifact
  // before the fix: the cover title had 4.7pt of room and the pillar characters
  // 17.4pt, which is the animal name printed over the hanzi on every chart page.
  //
  // 1.25 is the ordinary heading ratio and 1.15 is enough for the pillar cell, whose
  // glyphs are followed by two 9pt labels. This is line-height and spacing ONLY, as
  // ruled: no font, colour or layout changes anywhere in this block.
  //
  // A STYLE AT OR BELOW 11pt NEEDS NOTHING - the inherited 17.6pt box is larger than
  // it needs, never smaller, so `small`, `cellLabel`, `entryMeaning`, `entryName`,
  // `refRow`, `footNote` and `hanInline` are deliberately untouched.
  coverTitle: { fontSize: 34, lineHeight: 1.25, marginBottom: 6 },
  coverSub: {
    fontSize: 13, lineHeight: 1.25, color: '#555555', marginBottom: 28,
  },
  h1: { fontSize: 18, lineHeight: 1.25, marginBottom: 14 },
  h2: {
    fontSize: 12, lineHeight: 1.25, marginTop: 16, marginBottom: 5,
  },
  body: { marginBottom: 10 },
  // ── THE PENUTUP IS BODY TEXT. A4, ruled ok 2026-09-22. ────
  // It was `fontSize: 12, lineHeight: 1.25` against an 11/1.6 body, which made the
  // last paragraph of the reading look like a different KIND of text - a pull quote,
  // a note, anything but what it is. Reyner saw the same thing on screen and called
  // it "the paragraph gap"; it is one defect on two surfaces and this is the PDF half.
  //
  // DISTINGUISHED BY SPACE, NOT BY SIZE, which is the row's own instruction. The
  // `marginTop` grows to carry the separation the size used to carry badly.
  //
  // NO `fontSize` AND NO `lineHeight` HERE ON PURPOSE: inheriting the page's 11/1.6
  // is what guarantees it stays equal to the body if the body is ever re-typed.
  // Naming 11 again would be a second source of truth for one number.
  penutup: { marginTop: 22 },
  // The pillar cells. `han` is the ONLY place the hanzi family is used - see the
  // note on rule 23 at chartPage.
  cellRow: { flexDirection: 'row', marginTop: 10 },
  cell: { width: '25%', paddingRight: 10 },
  han: {
    fontFamily: FAMILY_HAN, fontSize: 26, lineHeight: 1.4, marginBottom: 4,
  },
  // THE SAME FAMILY AT TABLE SIZE, for the compat facts table (prompt Y-3 commit
  // 3). It exists because the first draft of that table set a branch character in
  // `entryName` - the LATIN family - and react-pdf substituted: `pageTexts` came
  // back with a stray `P` and `*` where 子 and 未 should be, which is a tofu in the
  // rendered page. `drawnCodePoints` could not see it, because the same characters
  // are drawn correctly on the chart pages and that instrument is document-wide.
  // Rule 23 is satisfied either way - the character is paired with its Indonesian
  // name - but only if the character actually draws.
  hanInline: { fontFamily: FAMILY_HAN, fontSize: 11 },
  cellLabel: { fontSize: 9, color: '#555555' },
  entry: { marginBottom: 7 },
  entryName: { fontSize: 11 },
  entryMeaning: { fontSize: 10, color: '#333333' },
  // ── THE KAMUS RINGKAS (R7, 2026-09-14) ────────────────────
  // Term beside meaning rather than above it. `wrap: false` on the row would clip a
  // long cell, so the row wraps and the two columns stay aligned at the top - R8
  // says the ruled cells print WHOLE, and a fixed-height row is how that quietly
  // stops being true. Only what the table needs to be legible, per Y-4.
  kamusRow: { flexDirection: 'row', marginBottom: 6 },
  kamusTerm: { width: '30%', paddingRight: 10, fontSize: 10 },
  kamusMeaning: { width: '70%', fontSize: 10, color: '#333333' },
  groupHeading: {
    fontSize: 13, lineHeight: 1.25, marginTop: 14, marginBottom: 6,
  },
  // The frame group's lead line (C2): body-size prose introducing the rows under
  // it, with the space a lead needs and none of the emphasis a heading would add.
  factsLead: { fontSize: 10, color: '#333333', marginBottom: 10 },
  // The reframe note (ruled 2026-09-22): full width, no cells, set apart from the
  // seat rows above it by space rather than by a rule or a box.
  factsNote: { fontSize: 10, color: '#333333', marginTop: 2, marginBottom: 12 },
  small: { fontSize: 9, color: '#555555' },
  // 8pt, Reyner's ruled size for the disclaimer that replaced the colophon page.
  footNote: { fontSize: 8, color: '#555555', lineHeight: 1.5 },
  footProvenance: { fontSize: 8, color: '#8A8A8A', marginTop: 4 },
  rule: { borderBottomWidth: 1, borderBottomColor: '#DDDDDD', marginVertical: 12 },
  // One reference row. No colour and no underline: this is the content pass, and
  // prompt M puts typography after Reyner signs off what the document SAYS.
  refRow: { fontSize: 10, marginBottom: 2, color: '#1A1A1A', textDecoration: 'none' },
});

// EXPORTED FOR THE COMPAT COMPOSER (prompt Y-3 commit 3), which adds a facts table
// and must not invent a second visual language to do it - Y-3's NOT IN THIS PROMPT
// says the design pass comes after Reyner has read what the document SAYS, and two
// stylesheets would BE a design decision taken quietly. `s` stays as the local name
// so every line below is untouched.
const s = PDF_STYLES;

/**
 * One page of her reading. Build step 2's other half.
 *
 * Exported on its own because step 2 is "font registration + ONE page" - a single
 * page that draws real prose and real hanzi is what proves the font pipeline before
 * a five-section document is worth assembling.
 */
export function readingPage(rendered) {
  return E(Page, { size: 'A4', style: s.page, wrap: true },
    E(Text, { style: s.h1 }, 'Bacaanmu'),
    ...(rendered.blocks || []).flatMap((b, i) => [
      // A heading is optional in the contract and degrades to empty, so it is only
      // drawn when there is one. An empty Text would still take vertical space.
      ...(b.heading ? [E(Text, { key: `h${i}`, style: s.h2 }, b.heading)] : []),
      E(Text, { key: `t${i}`, style: s.body, orphans: 3, widows: 3 }, b.text || ''),
    ]),
    ...(rendered.penutup
      ? [E(Text, { style: s.penutup, orphans: 3, widows: 3 }, rendered.penutup)]
      : []));
}

/**
 * The cover. Names her, and says what the document is.
 *
 * The birth date comes from the BAZI chart, not the semantic JSON: `semantic.qa`
 * carries fact counts, not provenance, and `scrubInternal` exists precisely because
 * the semantic payload is not where reader-facing detail lives.
 */
function coverPage({ chart, semanticJson }) {
  const core = semanticJson.core || {};
  const birth = [chart.birthDate, chart.birthTime].filter(Boolean).join(' ');
  return E(Page, { size: 'A4', style: s.page },
    // ── ENGLISH LEADS. RULED 2026-09-14 (Reyner, ruling 2). ──
    // `name_en` is the bigger title; `name_id` sits under it, smaller, with the
    // element it always carried. Ruled on the COMPAT cover and applied here in the
    // same breath - "same `coverPage` shape" - so this is the first intended change
    // to the mirror document since `tests/fixtures/pdf-chart1-pages.json` was
    // captured, and that fixture is re-pinned in the commit that makes it.
    //
    // THE METADATA TITLE DOES NOT MOVE WITH IT, ruled explicitly. That string is
    // what a reader sees in a viewer tab and in her downloads folder, and the
    // document is Indonesian.
    E(Text, { style: s.coverTitle }, core.archetype_name_en || 'Katon'),
    E(Text, { style: s.coverSub },
      [core.archetype_name_id, core.element].filter(Boolean).join(' - ')),
    E(View, { style: s.rule }),
    E(Text, { style: s.body }, 'Bacaan lengkap dari bagan kelahiranmu.'),
    ...(birth ? [E(Text, { style: s.small }, birth)] : []));
}

/**
 * The chart page: the eight characters, and what they are.
 *
 * RULE 23, AND IT IS THE REASON THIS PAGE IS ALLOWED TO CARRY HANZI AT ALL. The
 * ruling of 2026-08-01 is that hanzi you can POINT AT is fine and hanzi you must
 * READ is not: the eight characters ARE the chart, they are the legitimacy object,
 * and they are what lets a reader cross-check Katon against any other calculator. So
 * they stay - each paired with its Indonesian animal and palace, never bare.
 *
 * 胎元 IS NAME-ONLY, and that is a standing ruling rather than an omission. Reyner
 * ruled on 2026-08-07 that `pilar.conception` carries no `label_meaning` on purpose,
 * and prompt M's correction 4 records a session being told to ship a Cowork-drafted
 * line for it anyway. It prints because Joey prints it and a cross-checking reader
 * would find it missing; it explains nothing because nothing downstream interprets
 * it. The glossary name is read rather than typed.
 */
export function chartPage({
  chart: baziChart, semanticJson, rendered = null,
  // `heading` because the compat document prints TWO chart pages and their headings
  // are ruled copy slots, not a constant this file can know. It defaults to exactly
  // what the mirror always printed.
  //
  // `appendix`, `pageMap` and `refEntries` were REMOVED 2026-09-14 (R6) along with
  // the reference list they existed to draw. Kept as unused parameters they would be
  // dead plumbing that still reads as a feature; a composer that wants references
  // back adds them here alongside `buildPdf`'s `references`.
  heading = 'Bagan Kelahiran',
}) {
  const chart = semanticJson.chart || {};
  // 胎元 is NOT in semanticJson.chart - it is on the calculated chart as
  // `conceptionPalace`, because it is not one of the four positions. The glossary's
  // own note says anything iterating the pillars must key on year/month/day/hour and
  // never on Object.keys, and this is the other half of that: read it from where it
  // actually is rather than expecting it beside the four.
  const conceptionPillar = baziChart?.conceptionPalace || null;
  const order = ['year', 'month', 'day', 'hour'];
  const conception = GLOSSARY.pilar?.conception?.name_id || 'Pilar Konsepsi';

  const cells = order
    // An hour-less chart has no fourth pillar. It is skipped rather than drawn
    // empty: `hour_known: false` is a fact the reading states once, plainly, and a
    // blank cell would be the document implying it twice.
    .filter((k) => chart[k])
    .map((k) => E(View, { key: k, style: s.cell },
      E(Text, { style: s.han }, chart[k]),
      E(Text, { style: s.cellLabel }, chart.animals?.[k] || ''),
      E(Text, { style: s.cellLabel }, chart.palaces?.[k] || '')));

  const presence = Object.entries(chart.element_presence || {});

  // `wrap: true` FROM THE MOMENT THIS PAGE CARRIES A LIST. It did not need it while
  // it was four cells and five bars, and an unwrapped Page does not overflow onto a
  // second page - it CLIPS. A silently truncated reference list is the failure mode
  // that would still verify, because every ref this build printed would be right and
  // some of them would not be on the page.
  return E(Page, { size: 'A4', style: s.page, wrap: true },
    E(Text, { style: s.h1 }, heading),
    E(View, { style: s.cellRow }, ...cells),
    E(View, { style: s.rule }),
    E(Text, { style: s.h2 }, conception),
    E(View, { style: s.cellRow },
      E(View, { style: s.cell },
        E(Text, { style: s.han },
          conceptionPillar ? `${conceptionPillar.stem}${conceptionPillar.branch}` : ''),
        E(Text, { style: s.cellLabel }, conceptionPillar?.animal || ''))),
    E(View, { style: s.rule }),
    E(Text, { style: s.h2 }, 'Sebaran Unsur'),
    // The engine's own words for what this is. Rule 9 forbids conflating display
    // normalisation with a strength score, so the caveat travels with the numbers
    // rather than being left to the reader.
    //
    // ── THE SAME STRING AS `lib/semantic/index.js`. RULED 2026-08-31 ──
    // It read `Sebaran tampilan, bukan skor kekuatan.` and `skor` is BANNED by
    // `style.arithmetic.2` - a blocked word on the Rp 19.000 artifact, which
    // nothing runs the blocklist against. The comment that stood here quoted the
    // free page's ENGLISH string as its justification; both were replaced together,
    // because a corrected value with a stale justification beside it is the shape
    // of error 27.
    //
    // THEY MUST NOT DIVERGE AGAIN. One caveat, one `Sebaran Unsur` heading, two
    // surfaces - and for months the paid reader got Indonesian while the free
    // reader got English, because the PDF was translated and the page never was.
    // `tests/engine-copy-language.spec.mjs` pins them equal and pins both to
    // Indonesian. Ruling: `docs/content/presence-note-ruling.md`.
    E(Text, { style: s.small }, chart.element_presence_note || ELEMENT_PRESENCE_NOTE),
    ...presence.map(([name, value]) => E(Text, { key: name, style: s.entryMeaning },
      `${name}: ${value}`)),
    // RULE 25 IN ONE LINE, at the foot of the chart page rather than on a page of its
    // own. See chartPageFoot.
    ...(rendered ? chartPageFoot({ semanticJson, rendered }) : []));
}

/**
 * The appendix: every mechanic in HER chart, with what it means.
 *
 * CORRECTION 1 IS ENFORCED UPSTREAM, in `buildAppendix`, which is where its
 * assertion lives. A condition (`label: null`) has no name here in English OR in
 * Indonesian - it carries its ruled `label_meaning` and no heading. Inventing
 * `Kayu yang Hilang` is the same defect as printing "Missing Wood"; both are naming
 * a thing she does not carry.
 */
export function appendixPages(appendix, { note = null } = {}) {
  return E(Page, { size: 'A4', style: s.page, wrap: true },
    E(Text, { style: s.h1 }, 'Istilah dalam Bacaanmu'),
    // THE SUB-LINE IS THE CALLER'S NOW (prompt Y-3 commit 3). The mirror passes the
    // sentence it always printed, so its bytes do not move. The compat document
    // passes NOTHING and prints no sub-line: "semuanya dari baganmu sendiri" is
    // false of a legend drawn from two charts, and the alternative - writing a
    // second Indonesian sentence here - is exactly the unreviewed copy rule 20
    // forbids. It is a candidate slot for Reyner, not a line for this file.
    ...(note === null ? [] : [E(Text, { style: s.small }, note)]),
    ...appendix.groups
      .filter((g) => g.entries.length > 0)
      .flatMap((g) => [
        E(Text, { key: `g${g.group}`, style: s.groupHeading }, g.group),
        // ── ONE ROW PER TERM, TWO COLUMNS (R7, 2026-09-14) ────────
        // Term left, meaning right, on one baseline. It was stacked - name on its
        // own line, meaning under it - which is what made a legend of ~20 entries
        // read as a list rather than a reference.
        //
        // THE ANCHOR STAYS ON THE ROW. react-pdf turns `id` into a named
        // destination carrying the page object this View landed on. Nothing
        // references it since R6, and Reyner kept the machinery anyway, so the
        // destination has to keep existing for it to guard anything.
        ...g.entries.map((e) => E(View, {
          key: `${g.group}.${e.section}.${e.key}`,
          style: s.kamusRow,
          id: anchorId(e),
        },
        // A named entry gets its name. A CONDITION gets an empty left column and
        // its meaning on the right - correction 1: `label: null` means no name in
        // English OR Indonesian, and an empty cell keeps the table aligned without
        // inventing one.
        E(Text, { style: s.kamusTerm }, e.name || ''),
        E(Text, { style: s.kamusMeaning }, e.meaning || ''))),
      ]));
}


/** The reference's printed form. One constant, because the verifier greps for it. */
export const REF_PREFIX = 'hal. ';

/**
 * One reference row, exactly as it is drawn.
 *
 * THE WRITER AND THE VERIFIER SHARE THIS FUNCTION ON PURPOSE. `build.js` check 3
 * asserts this string is present on the chart page, and if it rebuilt the row from
 * its own template the check would pass whenever the two templates agreed and fail
 * for cosmetic reasons whenever they did not - a check on a second implementation
 * rather than on the artifact. Same argument as `glyphProof` having one caller-shared
 * definition.
 */
export const refRow = (name, page) => `${name}  ${REF_PREFIX}${page}`;

/**
 * The foot of the chart page: rule 25 in one line, then provenance.
 *
 * ── IT REPLACES A WHOLE PAGE, AND THAT IS THE RULING ──────
 * The document used to end on a colophon page printing `SITE_COPY.syarat.limits` -
 * three paragraphs of rule 25 as a user-facing disclaimer. Reyner killed it on
 * 2026-08-22:
 *
 *   "Ending a paid Rp 19.000 personal reading with copy-pasted Terms of Service
 *    text kills the product experience right at the finish line."
 *
 * The obligation is unchanged and rule 25 is still satisfied - no medical, financial
 * or legal advice - it is just no longer the last thing she reads. His one line lives
 * in `RENDER_COPY.pdfDisclaimer`, in the bank `scripts/check-copy.js` sweeps, and the
 * fallback closing block he supplied is recorded in PROGRESS as UNSHIPPABLE AS
 * WRITTEN because it contains an em-dash.
 *
 * ── THE PROVENANCE COMES WITH IT, AND THAT IS A JUDGEMENT CALL ──
 * The ruling is about the ToS text. It says nothing about the two provenance lines
 * that shared that page, and deleting the page would have deleted them silently -
 * their own note is that they exist "so a document in someone's downloads folder can
 * be traced back to the exact engine, prompt and gate that produced it", and
 * `stage6_version` is the gate that CLEARED this prose, which is the first thing any
 * later question about it needs. So they move rather than die, at 8pt, under the
 * disclaimer. If Reyner wants them gone too that is one line to delete; losing them
 * by not mentioning them would not have been a decision.
 */
export function chartPageFoot({ semanticJson, rendered }) {
  return [
    E(View, { key: 'rule', style: s.rule }),
    E(Text, { key: 'disc', style: s.footNote }, RENDER_COPY.pdfDisclaimer),
    E(Text, { key: 'prov', style: s.footProvenance },
      [`katon.app - ${semanticJson.engine_version || ''}`,
        rendered.prompt_version && `prompt ${rendered.prompt_version}`,
        rendered.stage6_version && `gate ${rendered.stage6_version}`]
        .filter(Boolean).join(' - ')),
  ];
}

/**
 * The Complete Edition, whole.
 *
 * @param {Object} args
 * @param {Object} args.chart output of calculateBaziChart
 * @param {Object} args.semanticJson Stage 3 output
 * @param {Object} args.rendered a render_cache row: blocks, penutup, and the
 *   versions that produced them. VERBATIM - this function never re-renders.
 * @returns {React.ReactElement} a react-pdf Document
 */
export function completeEdition({
  chart, semanticJson, rendered, pageMap,
}) {
  registerPdfFonts();
  const appendix = buildAppendix({ chart, semanticJson });
  // CORRECTION 2's GATE, at the door of the document rather than in the script, so
  // no caller can emit a PDF without it. It asserts every mechanic contributes a
  // MEANING and is indifferent to whether it has a NAME - demanding a name is what
  // forces correction 1's bug.
  assertEveryMechanicExplained(appendix);
  assertAnchorsUnique(appendix);

  // AN OMITTED pageMap THROWS; AN EMPTY ONE IS LEGAL. Pass 1 of the fixed point has
  // nothing to print yet and passes `{}`, so an empty map is a real state. A missing
  // one is a caller who does not know the fixed point exists, and the document that
  // caller would get has no cross-references in it at all - which is precisely the
  // thing that must not be emittable. `buildCompleteEditionPdf` is the door.
  if (!pageMap || typeof pageMap !== 'object') {
    throw new Error('completeEdition: pageMap is required (pass {} only from the '
      + 'fixed-point loop; callers wanting bytes use buildCompleteEditionPdf)');
  }

  return E(Document, {
    title: `Katon - ${semanticJson.core?.archetype_name_id || 'Bacaan'}`,
    author: 'katon.app',
    // No Creator/Producer string beyond the default: nothing here should advertise
    // which model wrote the prose, the same reason RENDER_COPY never does.
  },
  coverPage({ chart, semanticJson }),
  readingPage(rendered),
  chartPage({
    chart, semanticJson, rendered, appendix, pageMap,
  }),
  appendixPages(appendix, {
    note: `${appendix.count} istilah, semuanya dari baganmu sendiri.`,
  }));
}

/**
 * A one-page proof that a set of characters can actually be DRAWN.
 *
 * ── WHY THIS EXISTS, AND IT IS NOT A TEST FIXTURE ─────────
 * The canary is 申, and no fixture chart contains it. 申 is the Monkey branch; chart
 * 1 draws 己巳癸酉丙子甲 and nothing else. So "does 申 survive into a PDF" cannot be
 * asked of a real document - and asking it anyway is how a round-trip check reported
 * 申 present in a document that had never drawn it.
 *
 * This draws the characters explicitly, so the question has a document that can
 * answer it. Every glyph the product can draw, through the real font path, into a
 * real PDF, read back out.
 *
 * One implementation, two callers - `scripts/build-pdf.mjs` and the spec - because a
 * verifier and the thing it verifies must not be two implementations. That mistake
 * has been paid for in this repo already.
 *
 * @param {Object} args
 * @param {string[]} args.chars characters to draw
 */
export function glyphProof({ chars }) {
  registerPdfFonts();
  return E(Document, { title: 'Katon glyph proof', author: 'katon.app' },
    E(Page, { size: 'A4', style: s.page, wrap: true },
      E(Text, { style: s.h1 }, 'Glyph proof'),
      // One Text per character. A single long run would wrap, and a wrapped run that
      // dropped a glyph would be harder to attribute.
      ...chars.map((c, i) => E(Text, { key: `${c}${i}`, style: s.han }, c))));
}

/**
 * Just the reading page, wrapped in a Document. Build step 2's deliverable.
 *
 * Kept as its own export after step 3 landed, because it is the smallest thing that
 * exercises the whole font path - register, resolve, embed, draw hanzi - and a
 * failure here is unambiguous in a way the same failure inside five sections is not.
 */
export function readingOnly({ chart, semanticJson, rendered }) {
  registerPdfFonts();
  return E(Document, { title: 'Katon', author: 'katon.app' },
    readingPage(rendered),
    // One pillar row, so the page that proves the font path actually draws hanzi.
    chartPage({ chart, semanticJson }));
}
