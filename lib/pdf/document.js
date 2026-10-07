// ============================================================
// The Complete Edition PDF — the document
// ============================================================
// Prompt M build steps 2 and 3. Cover, reading, chart, appendix. FOUR sections, not
// five: the colophon page was killed by Reyner on 2026-08-22 and rule 25 now rides at
// the foot of the COVER (AB A11, 2026-09-22; it sat on the chart page before). See
// chartPageFoot and coverFoot.
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
// Per prompt M's NOT IN THIS PROMPT: no card image and no checkout wiring. The
// DESIGN PASS it deferred is Prompt AB section 4 (2026-09-22/23): the cover, the
// measure, the serif headings, the running footer, the bars and the table rhythm,
// each marked ok by Reyner on the P2 markup and judged by him on the rebuilt PDFs.
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
import { glossRuns } from '../render/glossItalics.js';
import { GLOSS_NAMES_EN } from '../render/glossNames.js';
import { ELEMENT_PRESENCE_NOTE } from '../semantic/index.js';
import { buildFooter } from '../card/cardData.js';
import { CHROME_COPY } from '../site/copy.js';
import { ELEMENT_GLOSS, elColor, presenceBars } from '../site/elements.js';
import { mirrorChartView } from '../mirror/view.js';
import { splitParagraphs } from '../render/paragraphs.js';
import {
  buildAppendix, assertEveryMechanicExplained, anchorId, assertAnchorsUnique,
} from './appendix.js';
import {
  registerPdfFonts, FAMILY_HAN, FAMILY_SERIF, FAMILY_SANS, faceMetrics,
} from './fonts.js';

const E = React.createElement;

// ── THE MEASURE. A12, ruled ok 2026-09-22. ──────────────────
// The text column was the full A4 width less 56pt a side - about 95 characters of
// 11pt Helvetica per line, which reads as a memo on a laptop and makes her zoom on
// a phone. 104pt a side leaves a 387pt column, which is roughly 70 characters of
// Indonesian prose at this size (measured on the fixture PDFs, see the PR). ONE
// number, exported, because the running footer and the cover foot sit on the same
// left edge and a second copy of it is how they drift off the text column.
// 112 SINCE PROMPT AW (2026-09-30): the body is Hanken Grotesk now, and at 104 the
// reading measured a median 70 characters a line; AW asks for 65-70. At 112 (a 371pt
// column) it measures as recorded in the AW commit.
export const PAGE_MARGIN_X = 112;
// TABLE PAGES KEEP A WIDER COLUMN. The measure is a rule about PROSE: a 10pt
// two-column table on the 387pt prose column put a 237pt meaning column beside a 150pt term,
// which is ~45 characters and made the compat appendix five pages. At 64pt the
// meaning column is ~320pt, about 60 characters of 10pt - the measure the rule is
// after, applied to the column that is actually read.
export const TABLE_MARGIN_X = 64;

// The site's clay accent (`--clay` in app/globals.css) and its warm ink, for the
// wordmark and the cover eyebrow only. Everything else stays ink on paper.
const CLAY = '#C4622A';
const INK_WARM = '#3C3226';
const MUTED = '#8A8A8A';
// The wordmark's type size (Prompt AW §1). Its dot and gap are derived from it.
const WORDMARK_PT = 9;

// ── THE WEB'S TOKENS (app/globals.css), for AW §2's port ──
// Hex values copied from :root because a PDF cannot read CSS variables; each is
// named for its variable so a change there has one obvious place to follow here.
// The page stays white paper: the web's cream canvas (--kertas) is a screen colour,
// and on paper the cards read by their border, as they do on screen.
const T = {
  kertas2: '#FCFAF5', // --kertas-2, raised cards
  kertas3: '#FBF6EE', // --kertas-3, the bar track
  divider: '#EFE7DA', // --divider
  border: '#E7DDCE', // --border
  tinta: '#241F19', // --tinta, primary text
  tintaSoft: '#6E6153', // --tinta-soft, body prose
  kayu: '#3B3025', // --kayu, headings and the English names
  mutedWarm: '#9E9080', // --muted-warm, labels
};
// Web pixels to PDF points for the chart (the web column is ~600px, the PDF table
// column 467pt).
const PX = 0.72;

export const PDF_STYLES = StyleSheet.create({
  page: {
    paddingTop: 60, paddingBottom: 72, paddingHorizontal: PAGE_MARGIN_X,
    // Hanken Grotesk since Prompt AW: the web's --font-sans. Was Helvetica.
    fontFamily: FAMILY_SANS, fontSize: 11, lineHeight: 1.6, color: T.tinta,
  },
  // ── B2, THE RUNNING FOOTER. Ruled ok 2026-09-22. ────────────
  // `Katon - <product>` bottom-left on every page after the cover, 8pt, muted. No
  // page number (ruled out 2026-09-14). `fixed` repeats it on every page a wrapping
  // Page breaks onto; absolute so it never takes a line from the text column.
  tablePage: { paddingHorizontal: TABLE_MARGIN_X },
  runningFoot: {
    position: 'absolute', bottom: 34, left: PAGE_MARGIN_X, fontSize: 8, color: MUTED,
  },
  // ── A1, THE COVER. ──────────────────────────────────────────
  // ── THE MARK IS THE WEB MARK (Prompt AW §1, 2026-09-30) ──
  // components/SiteHeader.jsx: a 9px clay dot, a 9px gap, KATON in Hanken Grotesk 600
  // at 13px with 0.28em tracking, #3c3226. Here at 9pt, so the dot and the gap are
  // 9/13 of the type size. The dot's vertical centre is set by wordmark() below from
  // the face's own metrics, not by a margin.
  wordmarkRow: { flexDirection: 'row', alignItems: 'center' },
  wordmarkDot: {
    width: WORDMARK_PT * (9 / 13), height: WORDMARK_PT * (9 / 13), borderRadius: WORDMARK_PT * (4.5 / 13),
    backgroundColor: CLAY, marginRight: WORDMARK_PT * (9 / 13),
  },
  wordmarkText: {
    fontSize: WORDMARK_PT, fontFamily: FAMILY_SANS, fontWeight: 600, letterSpacing: WORDMARK_PT * 0.28, color: INK_WARM,
  },
  // The web header's eyebrow (REFLEKSIMU): Hanken 600, 0.16em (Prompt AW §2 item 5).
  coverEyebrow: {
    fontFamily: FAMILY_SANS, fontSize: 8.5, fontWeight: 600, lineHeight: 1.3, letterSpacing: 8.5 * 0.16,
    textTransform: 'uppercase', color: CLAY, marginTop: 190, marginBottom: 14,
  },
  // The motif: the chart's own characters, drawn quiet. Hanzi you can POINT AT
  // (rule 23), and they are the chart, not decoration borrowed from elsewhere.
  coverMotif: {
    fontFamily: FAMILY_HAN, fontSize: 30, lineHeight: 1.2, color: '#DDD6CB', letterSpacing: 10,
    marginTop: 34,
  },
  coverBirth: { fontSize: 10, color: '#555555', marginTop: 30 },
  // The Complete Edition's birth line in #177's profile-line format, the web header's
  // style (11.5px, 0.14em, uppercase, --muted-warm) (Prompt AW §2 item 5).
  coverProfile: {
    fontSize: 8.5, lineHeight: 1.3, letterSpacing: 8.5 * 0.14, textTransform: 'uppercase',
    color: T.mutedWarm, marginTop: 30,
  },
  // bottom 60 since Prompt BE §5b: F1 now runs on the cover too, at bottom 34, and the
  // foot sits clear above it (it was 48, which overprinted the footer).
  coverFoot: { position: 'absolute', bottom: 60, left: PAGE_MARGIN_X, right: PAGE_MARGIN_X },
  // ── THE CHART PAGE, THE WEB'S DESIGN (Prompt AW §2, 2026-09-30) ──
  // components/kit.jsx (Eyebrow, PillarCell, BalanceBar), Funnel.jsx (Section, the
  // conception card, Tanda Istimewamu), in points at PX.
  eyebrow: {
    fontFamily: FAMILY_SANS, fontWeight: 600, fontSize: 11 * PX, lineHeight: 1.3, letterSpacing: 11 * PX * 0.16,
    textTransform: 'uppercase', color: CLAY, marginBottom: 16 * PX,
  },
  sectionRule: { borderTopWidth: 0.75, borderTopColor: T.divider, marginTop: 30 * PX, paddingTop: 24 * PX },
  sectionRuleCompact: { marginTop: 10, paddingTop: 8 },
  chartHeadingCompact: { fontSize: 18, marginBottom: 8 },
  pillarCardCompact: { paddingTop: 9, paddingBottom: 7 },
  chartIntro: { fontSize: 13 * PX, lineHeight: 1.55, color: T.mutedWarm, marginTop: -2, marginBottom: 14 * PX },
  pillarRow: { flexDirection: 'row', marginTop: 10 },
  pillarCard: {
    flexGrow: 1, flexBasis: 0, marginRight: 9 * PX, position: 'relative', alignItems: 'center',
    borderWidth: 0.75, borderColor: T.border, borderRadius: 16 * PX, backgroundColor: T.kertas2,
    paddingTop: 15 * PX, paddingBottom: 13 * PX, paddingHorizontal: 8 * PX,
  },
  // The INTI DIRI pill straddles the card's top edge, as on the web (top -9px).
  corePillWrap: { position: 'absolute', top: -9 * PX, left: 0, right: 0, alignItems: 'center' },
  corePill: {
    fontFamily: FAMILY_SANS, fontWeight: 600, fontSize: 9 * PX, lineHeight: 1, letterSpacing: 9 * PX * 0.1,
    textTransform: 'uppercase', color: '#FFFFFF', borderRadius: 99, paddingVertical: 3 * PX, paddingHorizontal: 9 * PX,
  },
  pillarLabel: {
    fontFamily: FAMILY_SANS, fontWeight: 600, fontSize: 9.5 * PX, lineHeight: 1.3, letterSpacing: 9.5 * PX * 0.1,
    textTransform: 'uppercase', color: T.mutedWarm, marginBottom: 6 * PX, textAlign: 'center',
  },
  pillarStem: { fontFamily: FAMILY_HAN, fontSize: 30 * PX, lineHeight: 1.35 },
  pillarBranch: { fontFamily: FAMILY_HAN, fontSize: 17 * PX, lineHeight: 1.15, marginTop: 1 },
  pillarMeta: { fontSize: 10 * PX, lineHeight: 1.3, color: T.tintaSoft, marginTop: 8 * PX, textAlign: 'center' },
  conceptionCard: {
    alignSelf: 'center', alignItems: 'center', width: 180 * PX, marginTop: 14 * PX,
    borderWidth: 0.75, borderColor: T.divider, borderRadius: 12 * PX, backgroundColor: T.kertas2,
    paddingVertical: 10 * PX, paddingHorizontal: 4 * PX,
  },
  conceptionHan: { fontFamily: FAMILY_HAN, fontSize: 20 * PX, lineHeight: 1.2, color: T.tinta, marginTop: 1, marginBottom: 1 },
  barBlock: { marginBottom: 16 * PX },
  barHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 7 * PX },
  barNames: { flexDirection: 'row', alignItems: 'flex-end' },
  barLabel: { fontFamily: FAMILY_SERIF, fontSize: 16 * PX, lineHeight: 1.2, color: T.tinta, marginRight: 8 * PX },
  barGloss: { fontSize: 12.5 * PX, lineHeight: 1.35, color: T.mutedWarm },
  barTag: {
    fontFamily: FAMILY_SANS, fontWeight: 600, fontSize: 10 * PX, lineHeight: 1.35, letterSpacing: 10 * PX * 0.12,
    textTransform: 'uppercase',
  },
  barTrack: {
    height: 8 * PX, borderRadius: 6 * PX, backgroundColor: T.kertas3, borderWidth: 0.5, borderColor: T.divider,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 6 * PX },
  badgeCard: {
    borderWidth: 0.75, borderColor: T.divider, borderRadius: 16 * PX, backgroundColor: T.kertas2,
    paddingTop: 16 * PX, paddingHorizontal: 16 * PX, paddingBottom: 14 * PX, marginBottom: 12 * PX,
  },
  badgeHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  badgeName: { fontFamily: FAMILY_SERIF, fontSize: 19 * PX, lineHeight: 1.25, color: T.tinta, marginRight: 10 * PX },
  badgePillar: {
    fontFamily: FAMILY_SANS, fontSize: 11 * PX, lineHeight: 1.5, letterSpacing: 11 * PX * 0.12,
    textTransform: 'uppercase', color: T.mutedWarm, textAlign: 'right', flexShrink: 1,
  },
  badgeEn: { fontFamily: FAMILY_SERIF, fontStyle: 'italic', fontSize: 14.5 * PX, lineHeight: 1.3, color: T.kayu, marginTop: 2 * PX },
  badgeMeaning: { fontSize: 14 * PX, lineHeight: 1.6, color: T.tintaSoft, marginTop: 8 * PX },
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
  // ── HEADINGS IN THE SITE'S SERIF. A12, the headings half. ──
  // Spectral, embedded by `3859cc9` and traced into both PDF lambdas. Headings were
  // Helvetica a point or two larger than the body, which is why they "barely read
  // as headings". A heading also gets 1.5x the space ABOVE it that it gets below,
  // so it binds to the text it introduces rather than to the text before it.
  // ── THE WEB HEADER'S TYPE SCALE (Prompt AW §2 item 5) ──
  // Funnel.jsx's persona: the archetype at 44px in the serif, its English once at
  // 18px in the serif's italic, --kayu. At the cover's scale: 40pt and 16pt. The
  // Complete Edition colours the title in the day master's deep tone, as the web
  // does; the compat cover (two archetypes, two elements) keeps the ink.
  coverTitle: {
    fontFamily: FAMILY_SERIF, fontSize: 40, lineHeight: 1.1, marginBottom: 10, color: T.tinta,
  },
  // The compat title carries TWO names ("Api Unggun dan Besi Tempa" is the longest
  // pair), so it sets smaller, to stay one line on the prose column.
  coverTitlePair: { fontSize: 29 },
  coverSub: {
    fontFamily: FAMILY_SERIF, fontStyle: 'italic', fontSize: 16, lineHeight: 1.3, color: T.kayu, marginBottom: 0,
  },
  h1: {
    fontFamily: FAMILY_SERIF, fontSize: 22, lineHeight: 1.25, marginBottom: 16,
  },
  h2: {
    fontFamily: FAMILY_SERIF, fontWeight: 600, fontSize: 13.5, lineHeight: 1.25,
    marginTop: 22, marginBottom: 6,
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
  // The reading's paragraphs, the web's Para (15.5px / 1.75, --tinta-soft) at the
  // page's 11pt, and the web's 14px gap between paragraphs of one block.
  // fontSize IS REQUIRED BESIDE A UNITLESS lineHeight: react-pdf multiplies it by the
  // SAME style object's fontSize, and by its 18pt default when there is none (the
  // first build set 1.7 alone and drew 30.6pt lines).
  prose: { fontSize: 11, lineHeight: 1.7, color: T.tintaSoft },
  proseNext: { marginTop: 14 * PX },
  // The hanzi at glyph-proof size. The chart page's cells are the web's pillar cards
  // since Prompt AW (pillarCard); `han` stays for glyphProof, which draws every
  // character the product can draw.
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
  //
  // ── A8, ruled ok 2026-09-22. ─────────────────────────────
  // Term column FIXED at 150pt with wrap, meaning takes the rest - it was 30% of
  // the page, so a nine-word term filled its column and the meaning started
  // mid-page. 12pt between rows (6pt more than before), and a group heading gets
  // TWICE the row gap above it so the groups read as groups.
  kamusRow: { flexDirection: 'row', marginBottom: 12 },
  kamusTerm: { width: 150, paddingRight: 12, fontSize: 10 },
  kamusMeaning: { flex: 1, fontSize: 10, color: '#333333' },
  groupHeading: {
    fontFamily: FAMILY_SERIF, fontWeight: 600, fontSize: 13.5, lineHeight: 1.25,
    marginTop: 24, marginBottom: 10,
  },
  // The frame group's lead line (C2): body-size prose introducing the rows under
  // it, with the space a lead needs and none of the emphasis a heading would add.
  factsLead: { fontSize: 10, color: '#333333', marginBottom: 10 },
  // The reframe note (ruled 2026-09-22): full width, no cells, set apart from the
  // seat rows above it by space rather than by a rule or a box.
  factsNote: { fontSize: 10, color: '#333333', marginTop: 2, marginBottom: 12 },
  // C3: one facts row and its description, with 10pt before the next row; the
  // description smaller and muted so the row heading leads.
  // ── MORE AIR, 2026-09-24 (Reyner: "Data di Balik Bacaan Ini" rows read crowded).
  // 10 -> 18 between rows, 3 -> 6 between a row and its muted description, and the
  // closing verdict gets its own room above its rule (`factsVerdict`).
  factsGroup: { marginBottom: 18 },
  factsVerdict: { marginTop: 14 },
  factsDesc: {
    fontSize: 9.5, lineHeight: 1.5, color: '#666666', marginTop: 6,
  },
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
/**
 * B2's footer, `Katon - <product>`, for every page after the cover.
 *
 * @param {string} edition `RENDER_COPY.pdfEditionMirror` / `pdfEditionCompat`
 */
// ── F1 REPLACES B2's TEXT (Prompt BE §5b, Reyner 2026-10-06) ──
// The running footer is now F1 (`RENDER_COPY.pdfFooter`) on EVERY page, the cover
// included; `edition` is still accepted so no caller changes, and still names the
// product on each cover's eyebrow. Same 8pt muted style as B2, never larger.
export function runningFooter(edition, { table = false } = {}) {
  // On a table page the footer follows the wider column's left edge.
  const style = table ? { ...s.runningFoot, left: TABLE_MARGIN_X } : s.runningFoot;
  return E(Text, { key: 'foot', fixed: true, style }, RENDER_COPY.pdfFooter);
}

/**
 * The provenance, `katon.app - <engine> - prompt <v> - gate <v>`, so a document in
 * someone's downloads folder can be traced to the engine, prompt and gate that produced
 * it. SINCE PROMPT BE §5a (Reyner 2026-10-06) IT IS ON NO PAGE: it is the document's
 * metadata Subject, which support can read and a reader never sees.
 */
export function provenanceLine({ semanticJson, rendered }) {
  return [`katon.app - ${semanticJson.engine_version || ''}`,
    rendered?.prompt_version && `prompt ${rendered.prompt_version}`,
    rendered?.stage6_version && `gate ${rendered.stage6_version}`]
    .filter(Boolean).join(' - ');
}

/**
 * THE CLOSING PAGE (Prompt BE §5c, Reyner 2026-10-06): after the glossary, the last page
 * of both documents. C1's four sections, a label in the same size set in semibold, low on
 * the page like a book's colophon. No new colour and no heading.
 *
 * PROMPT BI (Reyner 2026-10-07), both editions since the page is shared:
 *   - the logomark, `wordmark()` exactly as the cover draws it (not redrawn, not resized),
 *     vertically centred on the page with its left edge on the text column;
 *   - the four sections in the RUNNING FOOTER's size and colour, read from its own style
 *     object (`s.runningFoot`) so the two cannot drift apart. Labels keep their weight.
 */
export function closingPage() {
  // The footer's own values, never retyped (was s.footNote's #555555).
  const sectionText = { ...s.footNote, fontSize: s.runningFoot.fontSize, color: s.runningFoot.color };
  // ABSOLUTE, LIKE THE COVER FOOT, AND NOT A GROWING FLEX BOX: with `wrap: false` and a
  // flexGrow column, react-pdf sized the page to its content (288pt tall, measured
  // 2026-10-06), not to A4. Pinned 96pt above the bottom edge, clear of the footer at 34.
  return E(Page, { size: 'A4', style: s.page },
    runningFooter(null),
    // The mark: a full-height absolute column centring one row, so the row's centre (and
    // the dot, which wordmark() centres on the cap height) is the page's centre.
    E(View, {
      style: {
        position: 'absolute', top: 0, bottom: 0, left: PAGE_MARGIN_X, right: PAGE_MARGIN_X, justifyContent: 'center',
      },
    }, wordmark()),
    E(View, { style: { position: 'absolute', left: PAGE_MARGIN_X, right: PAGE_MARGIN_X, bottom: 96 } },
      ...RENDER_COPY.pdfClosingSections.map((sec, i) => E(View, {
        key: `closing${i}`, style: { marginTop: i ? 12 : 0 },
      },
      E(Text, { style: { ...sectionText, fontWeight: 600 } }, sec.label),
      E(Text, { style: sectionText }, sec.text)))));
}

/**
 * The header's logomark, drawn: the clay dot beside letterspaced KATON.
 *
 * ── THE DOT SITS ON THE CAP-HEIGHT CENTRE, BY THE FONT'S METRICS (Prompt AW §1) ──
 * Reyner, 2026-09-30: "orange dot on Katon logo still not aligned" (10.5px low at
 * 200 dpi, tests/pdf-wordmark.spec.mjs). The row centres the dot on the Text BOX, and
 * the box is not the letters: react-pdf draws a line's baseline at box top + the face's
 * ascent, with no half-leading (@react-pdf/render renderLine), and a one-line box is
 * `lineHeight` tall. So the box centre (L/2) equals the cap-height centre
 * (ascent - capHeight/2) exactly when L = 2 * ascent - capHeight, in em. Read from the
 * face's own file, so a font change moves the number rather than the dot.
 */
export function wordmark() {
  const m = faceMetrics(FAMILY_SANS, 600);
  return E(View, { style: s.wordmarkRow },
    E(View, { style: s.wordmarkDot }),
    E(Text, { style: [s.wordmarkText, { lineHeight: 2 * m.ascent - m.capHeight }] }, 'KATON'));
}

/**
 * Reading prose as Text children, with the bracketed glossary English in italic
 * (Prompt AQ §4, one voice with the web reading). The brackets stay upright.
 *
 * The body face is Helvetica, a standard-14 font, so `fontStyle: 'italic'` resolves
 * to Helvetica-Oblique with nothing to register or embed. STYLING ONLY: the runs
 * concatenate back to `text` exactly, so what the PDF says is the cache row verbatim.
 *
 * @param {string} text
 * @returns {Array<string|Object>} children for a Text element
 */
export function glossChildren(text) {
  return glossRuns(text || '', GLOSS_NAMES_EN).map((r, i) => (r.gloss
    ? E(Text, { key: `g${i}`, style: { fontStyle: 'italic' } }, r.text.replace(/ /gu, NBSP))
    : r.text));
}

/**
 * ── A BRACKETED GLOSS IS ONE UNBREAKABLE UNIT (Reyner, 2026-09-30, #186) ──
 * "Treat every bracketed gloss as one unbreakable inline unit: no line break or
 * hyphenation inside it. If it doesn't fit, the whole unit moves to the next line."
 *
 * TWO BREAK POINTS LIVED INSIDE "(Peach Blossom)", and they needed different levers:
 *   - the SPACE between the words: textkit breaks only at an ASCII space (its word
 *     split is `/([ ]+)/`), so glossChildren draws the gloss's spaces as U+00A0;
 *   - the RUN BOUNDARIES "(" | Peach Blossom | ")": the italic gloss is its own run,
 *     textkit splits words per run, and a word continuing into the next run with no
 *     space gets a HYPHENATION PENALTY node - a break point that draws a "-". That is
 *     how chart 1's walk printed "(Peach Blossom-" with ")" on the next line.
 *     `hyphenationPenalty: 10000` is textkit's `linebreak.infinity`, the one value its
 *     breaker never breaks at. The hyphenation callback (fonts.js) already keeps every
 *     real word whole, so the only penalties this removes are those run seams.
 * The space BEFORE "(" stays an ordinary break, so the whole unit moves to the next line.
 * Every Text built from glossChildren takes these props, in both PDFs.
 */
export const NBSP = '\u00A0';
export const GLOSS_TEXT_PROPS = Object.freeze({ hyphenationPenalty: 10000 });

/**
 * The reading, laid out as the web lays it out (Prompt AW §2 item 4): each block is
 * components/ProseBlocks.jsx's Section, a divider and the model's heading as the
 * web's orange uppercase eyebrow, then its paragraphs split exactly as the web splits
 * them (lib/render/paragraphs.js splitParagraphs) with the web's gap between them. A
 * heading never ends a page: eyebrowHeading carries minPresenceAhead. The words are
 * the cache row's, VERBATIM; only where they sit changes.
 */
export function readingPage(rendered) {
  return E(Page, { size: 'A4', style: s.page, wrap: true },
    runningFooter(RENDER_COPY.pdfEditionMirror),
    E(Text, { style: s.h1 }, 'Bacaanmu'),
    ...(rendered.blocks || []).flatMap((b, i) => [
      // A heading is optional in the contract and degrades to empty. With none, the
      // block still gets its divider, as the web's Section does.
      b.heading
        ? eyebrowHeading(b.heading, { key: `h${i}`, section: true, first: i === 0 })
        : E(View, { key: `h${i}`, style: [s.sectionRule, i === 0 ? { marginTop: 10 } : null] }),
      ...splitParagraphs(b.text).map((p, j) => E(Text, {
        key: `t${i}.${j}`, style: [s.prose, j ? s.proseNext : null], orphans: 3, widows: 3, ...GLOSS_TEXT_PROPS,
      }, ...glossChildren(p))),
    ]),
    ...(rendered.penutup
      ? [E(Text, { key: 'penutup', style: [s.prose, s.penutup], orphans: 3, widows: 3, ...GLOSS_TEXT_PROPS }, ...glossChildren(rendered.penutup))]
      : []));
}

/**
 * The cover. Names her, and says what the document is.
 *
 * The birth date comes from the BAZI chart, not the semantic JSON: `semantic.qa`
 * carries fact counts, not provenance, and `scrubInternal` exists precisely because
 * the semantic payload is not where reader-facing detail lives.
 */
function coverPage({ chart, semanticJson, rendered, gender = null }) {
  const core = semanticJson.core || {};
  const sc = semanticJson.chart || {};
  // ~~A2 (2026-09-22): `13 Sep 1989, 09.00, Perempuan`, birthSummary's form~~,
  // superseded on this cover by AW §2 item 5. The gender is still the reading row's,
  // passed in by the delivery handler. The compat cover keeps birthSummary.
  // ── #177's PROFILE LINE, NOT birthSummary (Prompt AW §2 item 5) ──
  // "PEREMPUAN | 14 FEB 2001 | 13.00": the card footer's own gender and date
  // (lib/card/cardData.js buildFooter, what the web header's line is built from) and
  // the hour as she entered it, 24-hour with a dot. No hour, no third segment; no
  // gender, the date alone. The style uppercases it, as the web's CSS does.
  const hour = typeof chart.birthTime === 'string' && /^\d{2}:\d{2}$/u.test(chart.birthTime)
    ? chart.birthTime.replace(':', '.') : null;
  const profile = [buildFooter({ gender, birthDate: chart.birthDate }).left, hour].filter(Boolean).join(' | ');
  const motif = ['year', 'month', 'day', 'hour'].map((k) => sc[k]).filter(Boolean).join(' ');
  return E(Page, { size: 'A4', style: s.page },
    wordmark(),
    E(Text, { style: s.coverEyebrow }, RENDER_COPY.pdfEditionMirror),
    // ── INDONESIAN LEADS. A3, ruled ok 2026-09-22. ────────────
    // REVERSES the 2026-09-14 "English leads" ruling (ruling 2), by Reyner's own
    // later mark: CLAUDE.md rule 23 is Indonesian name first, English pair ONCE.
    // `name_id` is the title; `name_en` sits under it, smaller, once. The element
    // the old sub-line carried is on the chart page one turn later.
    // ── THE ENGLISH TITLE ALONE, G1 (Reyner 2026-10-02; rule 23 amended) ──
    // Supersedes A3 above for the archetype: name_en is the title and the Indonesian
    // name is no longer shown to readers, so the sub-line under it goes.
    E(Text, { style: [s.coverTitle, { color: elColor(core.element).deep }] }, core.archetype_name_en || core.archetype_name_id || 'Katon'),
    ...(motif ? [E(Text, { style: s.coverMotif }, motif)] : []),
    ...(profile ? [E(Text, { style: s.coverProfile }, profile)] : []),
    E(Text, { style: { ...s.body, marginTop: 6 } }, 'Bacaan lengkap dari bagan kelahiranmu.'),
    // A11: the disclaimer and provenance move to the cover foot.
    ...(rendered ? [coverFoot({ semanticJson, rendered })] : []),
    // F1 on every page, the cover included (Prompt BE §5b). LAST, so the cover's text
    // still opens on the wordmark.
    runningFooter(RENDER_COPY.pdfEditionMirror));
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
export function chartBlock({
  chart: baziChart, semanticJson,
  // `heading` because the compat document prints TWO chart blocks and their headings
  // are ruled copy slots, not a constant this file can know. It defaults to exactly
  // what the mirror always printed.
  //
  // `appendix`, `pageMap` and `refEntries` were REMOVED 2026-09-14 (R6) along with
  // the reference list they existed to draw. Kept as unused parameters they would be
  // dead plumbing that still reads as a feature; a composer that wants references
  // back adds them here alongside `buildPdf`'s `references`.
  heading = 'Bagan Kelahiran',
  // A BLOCK, NOT A PAGE (A11/C5, 2026-09-22): the compat document stacks both
  // charts on ONE page, so the chart is elements a page is built from. `chartPage`
  // below is the mirror's one-block page.
  headingStyle = null,
  // The web's line under Bagan Kelahiran (CHROME_COPY.bagan_intro, K1 since Prompt
  // BF). The MIRROR's only: on a pair it would be false of person B's chart.
  intro = false,
  // Tanda Istimewamu, the web's badge cards (AW §2 item 3). The mirror's chart page.
  badges = false,
  // THE PAIR PAGE'S FORM. C5 (Reyner, 2026-09-22): both compat charts share ONE page.
  // The web-sized block is ~450pt, so two did not fit: compact puts 胎元 in the pillar
  // row as a fifth card (where C5's layout had it) and tightens the bars and sections.
  compact = false,
}) {
  const chart = semanticJson.chart || {};
  // ── THE WEB'S CHART, NATIVE (Prompt AW §2, 2026-09-30) ──
  // Reyner: "can't we embed the preview design on the PDF? I really like the pillars
  // design". Cowork's technical ruling: port it into react-pdf primitives with the
  // web's tokens, never a screenshot (blurry in print, text unselectable) and never a
  // headless browser in the lambda. The data is the web's own: `mirrorChartView`, the
  // function the result page's chart is built from, so the two cannot disagree about
  // a pillar. The layout is components/kit.jsx PillarCell and Funnel.jsx's conception
  // card, in points. 胎元 stays name-only, as ruled 2026-08-07 (no label_meaning).
  const view = mirrorChartView(baziChart, semanticJson);
  const pillars = view.pillars || [];

  return [
    // THE CHART'S HEAD NEVER SPLITS: heading, the pillars and 胎元 are one unbreakable
    // view. On the compat page the second person's conception card broke across two
    // pages (its label on one, its characters on the next) before this.
    E(View, { key: 'head', wrap: false },
      E(Text, { style: [headingStyle || s.h1, compact ? s.chartHeadingCompact : null] }, heading),
      ...(intro ? [E(Text, { key: 'intro', style: s.chartIntro }, CHROME_COPY.bagan_intro)] : []),
      E(View, { key: 'cells', style: s.pillarRow },
        ...pillars.map((p, i) => pillarCard(p, !compact && i === pillars.length - 1, compact)),
        ...(compact && view.conception_pillar ? [conceptionCard(view.conception_pillar, { inRow: true })] : [])),
      ...(!compact && view.conception_pillar ? [conceptionCard(view.conception_pillar)] : [])),
    eyebrowHeading('Sebaran Unsur', { key: 'eh', section: true, compact }),
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
    E(Text, { key: 'en', style: s.chartIntro }, chart.element_presence_note || ELEMENT_PRESENCE_NOTE),
    ...elementBars(chart.element_presence, { compact }),
    ...(badges && view.badge_cards?.length ? [
      eyebrowHeading(CHROME_COPY.badges_title, { key: 'bh', section: true }),
      ...view.badge_cards.map((b) => badgeCard(b)),
    ] : []),
  ];
}

/**
 * The web's eyebrow (components/kit.jsx Eyebrow): Hanken 600, uppercase, tracked,
 * clay. As a SECTION head it carries the web Section's divider above it (Funnel.jsx
 * Section: a 1px divider rule, then space, then the eyebrow).
 *
 * NEVER THE LAST THING ON A PAGE (AW §2 item 4): `minPresenceAhead` moves it to the
 * next page unless about three lines of what it introduces fit under it.
 */
// ── A HEADING KEEPS ITS PARAGRAPH (Reyner 2026-10-06, on #199) ──
// "A heading never sits at the bottom of a page apart from its body." The reserve was 72pt,
// which fits three prose lines - but a paragraph of four or five lines cannot split under
// `orphans: 3, widows: 3` (3 + 1 and 3 + 2 both break a rule), so it moved WHOLE to the next
// page and left its heading behind (the 2c clash reading, compat page 2; the same prose in the
// Complete Edition). So the heading reserves room for five prose lines plus its own margin:
// either the short paragraph fits whole, or a long one splits with three lines here.
const HEADING_KEEP_PT = Math.ceil(5 * 11 * 1.7 + 16 * PX);

export function eyebrowHeading(text, { key, section = false, first = false, compact = false } = {}) {
  return E(View, {
    key, minPresenceAhead: HEADING_KEEP_PT, wrap: false,
    style: section ? [s.sectionRule, first ? { marginTop: 10 } : null, compact ? s.sectionRuleCompact : null] : null,
  }, E(Text, { style: [s.eyebrow, compact ? { marginBottom: 8 } : null] }, text));
}

/** One pillar, components/kit.jsx PillarCell in points. */
function pillarCard(p, last, compact = false) {
  const c = elColor(p.element);
  const core = !!p.is_day_master;
  return E(View, {
    key: p.position,
    style: [s.pillarCard, compact ? s.pillarCardCompact : null, core ? { borderColor: c.mid, backgroundColor: mix(c.wash, T.kertas2, 0.55) } : null, last ? { marginRight: 0 } : null],
  },
  ...(core ? [E(View, { key: 'pill', style: s.corePillWrap },
    E(Text, { style: [s.corePill, { backgroundColor: c.mid }] }, CHROME_COPY.pillar_core_pill))] : []),
  E(Text, { style: s.pillarLabel }, p.palace || ''),
  E(Text, { style: [s.pillarStem, { color: c.deep }] }, p.stem || ''),
  E(Text, { style: [s.pillarBranch, { color: c.mid }] }, p.branch || ''),
  // "Logam · Ular", the web's own join (element, then animal).
  E(Text, { style: s.pillarMeta }, [p.element, p.animal].filter(Boolean).join(' · ')));
}

/** 胎元, centred under the four: Funnel.jsx's conception card. Name-only (2026-08-07). */
function conceptionCard(cp, { inRow = false } = {}) {
  return E(View, { key: 'conception', style: inRow ? [s.pillarCard, s.pillarCardCompact, { marginRight: 0 }] : s.conceptionCard },
    E(Text, { style: s.pillarLabel }, cp.label),
    E(Text, { style: s.conceptionHan }, cp.hanzi),
    E(Text, { style: s.pillarMeta }, [cp.element, cp.animal].filter(Boolean).join(' · ')));
}

/**
 * The five element bars, components/kit.jsx BalanceBar in points: the element in the
 * serif, its gloss, the web's tag on the most and the least (every tied bar), and the bar in
 * the element's colour. NO NUMBERS (AW §3 item 3): printed under "Sebaran visual,
 * bukan ukuran kekuatan." they read as scores, and the web shows none. The share,
 * the tags and the tie rule are lib/site/elements.js presenceBars, the web's own.
 *
 * DISPLAY ONLY (rule 9): `element_presence`, the display normalisation, drawn.
 */
export function elementBars(presence, { compact = false } = {}) {
  const { bars, most, least } = presenceBars(presence);
  return bars.map((b, i) => {
    const c = elColor(b.element);
    const tag = most.includes(i) ? [CHROME_COPY.presence_tag_most, c.mid]
      : least.includes(i) ? [CHROME_COPY.presence_tag_least, CLAY] : null;
    return E(View, { key: `bar-${b.label}`, style: [s.barBlock, compact ? { marginBottom: 5 } : null], wrap: false },
      E(View, { style: [s.barHead, compact ? { marginBottom: 2 } : null] },
        E(View, { style: s.barNames },
          E(Text, { style: s.barLabel }, b.label),
          ...(ELEMENT_GLOSS[b.label] ? [E(Text, { key: 'g', style: s.barGloss }, ELEMENT_GLOSS[b.label])] : [])),
        ...(tag ? [E(Text, { key: 't', style: [s.barTag, { color: tag[1] }] }, tag[0])] : [])),
      E(View, { style: s.barTrack },
        E(View, { style: [s.barFill, { width: `${b.pct}%`, backgroundColor: c.mid }] })));
  });
}

/** One badge, the result page's "Tanda Istimewamu" card (#177/#182) in points. */
function badgeCard(b) {
  return E(View, { key: b.id, style: s.badgeCard, wrap: false },
    E(View, { style: s.badgeHead },
      E(Text, { style: s.badgeName }, b.name_id),
      E(Text, { style: s.badgePillar }, b.palace)),
    E(Text, { style: s.badgeEn }, b.name_en),
    E(Text, { style: s.badgeMeaning }, b.meaning));
}

/** Mix two #RRGGBB colours: the web's wash-to-paper gradient, as one flat fill. */
function mix(a, b, t) {
  const ch = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return `#${[0, 1, 2].map((i) => Math.round(ch(a, i) * t + ch(b, i) * (1 - t)).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * The mirror's chart page: its chart block and the running footer, nothing else.
 * A11: no colophon here any more - it is on the cover foot.
 */
export function chartPage({
  chart, semanticJson, heading = 'Bagan Kelahiran', edition = RENDER_COPY.pdfEditionMirror,
}) {
  // A DATA PAGE, so the table column: five pillar cells need the width.
  return E(Page, { size: 'A4', style: [s.page, s.tablePage], wrap: true },
    runningFooter(edition, { table: true }),
    ...chartBlock({ chart, semanticJson, heading, intro: true, badges: true }));
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
export function appendixPages(appendix, { note = null, edition = RENDER_COPY.pdfEditionMirror, groupLabels = {} } = {}) {
  return E(Page, { size: 'A4', style: [s.page, s.tablePage], wrap: true },
    runningFooter(edition, { table: true }),
    E(Text, { style: s.h1 }, 'Istilah dalam Bacaanmu'),
    // THE SUB-LINE IS THE CALLER'S NOW (prompt Y-3 commit 3). The mirror passes the
    // sentence it always printed, so its bytes do not move. The compat document
    // passes NOTHING and prints no sub-line: "semuanya dari baganmu sendiri" is
    // false of a legend drawn from two charts, and the alternative - writing a
    // second Indonesian sentence here - is exactly the unreviewed copy rule 20
    // forbids. It is a candidate slot for Reyner, not a line for this file.
    ...(note === null ? [] : [E(Text, { style: s.small }, note)]),
    ...keepLastGroupWithPrevious(appendix.groups
      .filter((g) => g.entries.length > 0)
      .map((g) => {
        // ── ONE ROW PER TERM, TWO COLUMNS (R7, 2026-09-14) ────────
        // Term left, meaning right, on one baseline. It was stacked - name on its
        // own line, meaning under it - which is what made a legend of ~20 entries
        // read as a list rather than a reference.
        //
        // THE ANCHOR STAYS ON THE ROW. react-pdf turns `id` into a named
        // destination carrying the page object this View landed on. Nothing
        // references it since R6, and Reyner kept the machinery anyway, so the
        // destination has to keep existing for it to guard anything.
        //
        // ── A ROW NEVER BREAKS (round-1 markup R1, 2026-09-24) ──────
        // `wrap: false` keeps a term and its whole meaning on one page. It was
        // wrappable, so on the round-1 compat PDF `Lemah` sat alone at the foot of
        // p7 with its meaning on p8 - A9, marked ok on 09-22, and missed because the
        // #126 widow/orphan test measured prose paragraphs only. A meaning is at most
        // a few lines, so an unbreakable row costs at most that much blank at a foot.
        const rows = g.entries.map((e) => E(View, {
          key: `${g.group}.${e.section}.${e.key}`,
          style: s.kamusRow,
          id: anchorId(e),
          wrap: false,
        },
        // A named entry gets its name. A CONDITION gets an empty left column and
        // its meaning on the right - correction 1: `label: null` means no name in
        // English OR Indonesian, and an empty cell keeps the table aligned without
        // inventing one.
        E(Text, { style: s.kamusTerm }, e.name || ''),
        E(Text, { style: s.kamusMeaning }, e.meaning || '')));
        // THE GROUP HEADING TRAVELS WITH ITS FIRST ROW (R1): one unbreakable View,
        // so a heading can never be the last thing on a page with its rows overleaf.
        return [
          E(View, { key: `g${g.group}`, wrap: false },
            // A group's printed label may differ from its key (AW §3.1: the mirror's Shio).
            E(Text, { style: s.groupHeading }, groupLabels[g.group] ?? g.group),
            rows[0]),
          ...rows.slice(1),
        ];
      })));
}

/**
 * THE GLOSSARY'S LAST GROUP NEVER SITS ALONE ON A PAGE (Reyner 2026-10-06, amendment 1 to BE,
 * on #199). Each group's heading already travels with its first row, so the glossary could end
 * on a page holding only its last group - the clash prose's Complete Edition put "Shio (tahun
 * lahirmu)" and its one row alone on page 8, and the floor compat PDF for charts 12 x 6 put
 * Shio's two rows alone on page 7. The previous group's last element (its last row, or its
 * heading-and-row block when it has one row) and the last group go in one unbreakable View,
 * so they move together. The facts table's rule, applied to the glossary.
 *
 * The last group is Shio in both editions: one row in the mirror, at most two in compat (one
 * animal per chart). Should a longer group ever come last, only its heading-and-first-row block
 * joins the bundle, so the unbreakable View stays well short of a page.
 *
 * @param {Array<Array<React.ReactElement>>} perGroup each group's elements, in order
 */
const LAST_GROUP_WHOLE_MAX = 3;
function keepLastGroupWithPrevious(perGroup) {
  if (perGroup.length < 2) return perGroup.flat();
  const prev = perGroup.at(-2);
  const last = perGroup.at(-1);
  const joined = last.length <= LAST_GROUP_WHOLE_MAX ? last : last.slice(0, 1);
  return [
    ...perGroup.slice(0, -2).flat(),
    ...prev.slice(0, -1),
    E(View, { key: 'glossaryTail', wrap: false }, prev.at(-1), ...joined),
    ...last.slice(joined.length),
  ];
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
 *
 * ── IT MOVED AGAIN, TO THE COVER FOOT. A11, ruled ok 2026-09-22. ──
 * The chart page was 55% blank with the colophon sitting mid-page. The same lines,
 * unchanged, now sit at the foot of the COVER in both documents (`coverFoot`), which
 * is where a printed book puts its colophon. The name is kept because the words
 * are; only the page moved.
 */
export function coverFoot() {
  return E(View, { key: 'coverFoot', style: s.coverFoot },
    ...chartPageFoot());
}

// ── THE PROVENANCE LINE LEFT THE PAGE (Prompt BE §5a, Reyner 2026-10-06) ──
// It is the document's metadata Subject now (`provenanceLine`); the disclaimer stays.
export function chartPageFoot() {
  return [
    E(View, { key: 'rule', style: s.rule }),
    E(Text, { key: 'disc', style: s.footNote }, RENDER_COPY.pdfDisclaimer),
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
  chart, semanticJson, rendered, pageMap, gender = null,
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
    title: `Katon - ${semanticJson.core?.archetype_name_en || semanticJson.core?.archetype_name_id || 'Bacaan'}`,
    author: 'katon.app',
    // THE PROVENANCE, OFF THE PAGE AND INTO THE METADATA (Prompt BE §5a).
    subject: provenanceLine({ semanticJson, rendered }),
    // No Creator/Producer string beyond the default: nothing here should advertise
    // which model wrote the prose, the same reason RENDER_COPY never does.
  },
  coverPage({
    chart, semanticJson, rendered, gender,
  }),
  readingPage(rendered),
  chartPage({ chart, semanticJson }),
  appendixPages(appendix, {
    note: `${appendix.count} istilah, semuanya dari baganmu sendiri.`,
    groupLabels: { Shio: RENDER_COPY.pdfShioGroupMirror },
  }),
  // C1, the closing page, after the glossary (Prompt BE §5c).
  closingPage());
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
