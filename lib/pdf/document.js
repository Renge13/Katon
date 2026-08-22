// ============================================================
// The Complete Edition PDF — the document
// ============================================================
// Prompt M build steps 2 and 3. Cover, reading, chart, appendix, colophon.
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
//   the colophon     `SITE_COPY.syarat.limits`. See the colophon note below.
//
// If a string in this file is not traceable to one of those, it is a defect.
//
// ── WHAT IS DELIBERATELY NOT HERE ─────────────────────────
// Per prompt M's NOT IN THIS PROMPT: no design pass (typography, colour and cover
// treatment come after Reyner signs off what the document SAYS), no card image, and
// no checkout wiring. The styles below are plain and legible on purpose - they are
// scaffolding for a content review, not a proposal about how the document should
// look. Steps 4 and 5 of the build order (the page-reference fixed point and its
// three verifies, and correction 2's gate wired into the emit path) are also NOT in
// this file yet.
// ============================================================

import React from 'react';
import {
  Document, Page, Text, View, StyleSheet,
} from '@react-pdf/renderer';

import { SITE_COPY } from '../site/copy.js';
import { GLOSSARY } from '../semantic/glossary.js';
import { buildAppendix, assertEveryMechanicExplained } from './appendix.js';
import { registerPdfFonts, FAMILY_HAN, FAMILY_LATIN } from './fonts.js';

const E = React.createElement;

const s = StyleSheet.create({
  page: {
    paddingTop: 56, paddingBottom: 56, paddingHorizontal: 56,
    fontFamily: FAMILY_LATIN, fontSize: 11, lineHeight: 1.6, color: '#1A1A1A',
  },
  coverTitle: { fontSize: 34, marginBottom: 6 },
  coverSub: { fontSize: 13, color: '#555555', marginBottom: 28 },
  h1: { fontSize: 18, marginBottom: 14 },
  h2: { fontSize: 12, marginTop: 16, marginBottom: 5 },
  body: { marginBottom: 10 },
  penutup: { marginTop: 14, fontSize: 12 },
  // The pillar cells. `han` is the ONLY place the hanzi family is used - see the
  // note on rule 23 at chartPage.
  cellRow: { flexDirection: 'row', marginTop: 10 },
  cell: { width: '25%', paddingRight: 10 },
  han: { fontFamily: FAMILY_HAN, fontSize: 26, marginBottom: 4 },
  cellLabel: { fontSize: 9, color: '#555555' },
  entry: { marginBottom: 7 },
  entryName: { fontSize: 11 },
  entryMeaning: { fontSize: 10, color: '#333333' },
  groupHeading: { fontSize: 13, marginTop: 14, marginBottom: 6 },
  small: { fontSize: 9, color: '#555555' },
  rule: { borderBottomWidth: 1, borderBottomColor: '#DDDDDD', marginVertical: 12 },
});

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
      E(Text, { key: `t${i}`, style: s.body }, b.text || ''),
    ]),
    ...(rendered.penutup ? [E(Text, { style: s.penutup }, rendered.penutup)] : []));
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
    E(Text, { style: s.coverTitle }, core.archetype_name_id || 'Katon'),
    E(Text, { style: s.coverSub },
      [core.archetype_name_en, core.element].filter(Boolean).join(' - ')),
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
function chartPage({ chart: baziChart, semanticJson }) {
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

  return E(Page, { size: 'A4', style: s.page },
    E(Text, { style: s.h1 }, 'Bagan Kelahiran'),
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
    // The engine's own words for what this is. `element_presence_note` says
    // "display distribution only, never a strength score" and rule 9 forbids
    // conflating the two, so the caveat travels with the numbers rather than being
    // left to the reader.
    E(Text, { style: s.small }, 'Sebaran tampilan, bukan skor kekuatan.'),
    ...presence.map(([name, value]) => E(Text, { key: name, style: s.entryMeaning },
      `${name}: ${value}`)));
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
function appendixPages(appendix) {
  return E(Page, { size: 'A4', style: s.page, wrap: true },
    E(Text, { style: s.h1 }, 'Istilah dalam Bacaanmu'),
    E(Text, { style: s.small },
      `${appendix.count} istilah, semuanya dari baganmu sendiri.`),
    ...appendix.groups
      .filter((g) => g.entries.length > 0)
      .flatMap((g) => [
        E(Text, { key: `g${g.group}`, style: s.groupHeading }, g.group),
        ...g.entries.map((e) => E(View, { key: `${g.group}.${e.section}.${e.key}`, style: s.entry },
          // A named entry gets its name. A condition gets its meaning and nothing
          // else - the `name` field is null for exactly those, by ruling.
          ...(e.name ? [E(Text, { style: s.entryName }, e.name)] : []),
          ...(e.meaning ? [E(Text, { style: s.entryMeaning }, e.meaning)] : []))),
      ]));
}

/**
 * The colophon.
 *
 * ── THE COPY IS BORROWED, AND THAT IS DELIBERATE ──────────
 * Prompt M says "Cowork drafted the colophon from rule 25 and Reyner reads it before
 * launch. Ship the draft; do not rewrite it." THE DRAFT IS NOT IN THIS REPO - it
 * lives in the Cowork spec, which M itself says Claude Code cannot read and which
 * has no standing. By M's own rule that is a defect in the prompt rather than a gap
 * in access, so this does not invent a replacement.
 *
 * Instead it prints `SITE_COPY.syarat.limits`, which is ALREADY rule 25 turned into
 * user-facing Indonesian, already shipped, and already Reyner's. Its own docblock
 * says so: "The 'Batas layanan' section is rule 25 turned into a user-facing
 * disclaimer." Reusing ruled copy respects rule 20 - Reyner is the sole authority on
 * register, and Cowork proposes rather than decides - where authoring a fresh
 * paragraph of Indonesian here would not.
 *
 * If Reyner wants the drafted colophon instead, it replaces this and the swap is one
 * array. Nothing else in the document depends on which strings these are.
 */
function colophonPage({ semanticJson, rendered }) {
  return E(Page, { size: 'A4', style: s.page },
    E(Text, { style: s.h1 }, SITE_COPY.syarat.limitsHeading),
    ...SITE_COPY.syarat.limits.map((line, i) => E(Text, { key: i, style: s.body }, line)),
    E(View, { style: s.rule }),
    // Provenance, so a document in someone's downloads folder can be traced back to
    // the exact engine, prompt and gate that produced it. `stage6_version` on a
    // cached row is the gate that CLEARED this prose, which is the thing a later
    // question about it will need.
    E(Text, { style: s.small }, `katon.app - ${semanticJson.engine_version || ''}`),
    E(Text, { style: s.small },
      [rendered.prompt_version && `prompt ${rendered.prompt_version}`,
        rendered.stage6_version && `gate ${rendered.stage6_version}`]
        .filter(Boolean).join(' - ')));
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
export function completeEdition({ chart, semanticJson, rendered }) {
  registerPdfFonts();
  const appendix = buildAppendix({ chart, semanticJson });
  // CORRECTION 2's GATE, at the door of the document rather than in the script, so
  // no caller can emit a PDF without it. It asserts every mechanic contributes a
  // MEANING and is indifferent to whether it has a NAME - demanding a name is what
  // forces correction 1's bug.
  assertEveryMechanicExplained(appendix);

  return E(Document, {
    title: `Katon - ${semanticJson.core?.archetype_name_id || 'Bacaan'}`,
    author: 'katon.app',
    // No Creator/Producer string beyond the default: nothing here should advertise
    // which model wrote the prose, the same reason RENDER_COPY never does.
  },
  coverPage({ chart, semanticJson }),
  readingPage(rendered),
  chartPage({ chart, semanticJson }),
  appendixPages(appendix),
  colophonPage({ semanticJson, rendered }));
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
