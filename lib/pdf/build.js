// ============================================================
// The Complete Edition PDF — the reference fixed point, and the three verifies
// ============================================================
// Prompt M BUILD STEP 4, and prompt M calls it SHIP-BLOCKING. This module is the
// only door to Complete Edition bytes. `completeEdition` returns an element tree and
// takes a page map; nothing but this file is supposed to render one.
//
// ── WHY A FIXED POINT AND NOT TWO PASSES ──────────────────
// Correction 3, and the sentence is worth keeping verbatim because it is the whole
// design: *"printing `hal. N` on the chart page changes that page's height, which
// can push the appendix onto a different page than the measuring pass saw. A
// two-pass build can print a reference its own second pass invalidated."*
//
// `hal. 9` and `hal. 10` are different widths. A row that fits on one line at 9 can
// wrap at 10, the chart page grows, the appendix starts a page later, and every
// reference the build just printed is off by one - while the build reports success,
// because a two-pass build never looks again.
//
// So: build, read the map the artifact actually has, and if it differs from the map
// that was printed, build again with the new one. Emit only when the map printed and
// the map measured are the same map. REFUSE otherwise. A drifting document is not
// shipped with a warning; it is not shipped.
//
// ── THE THREE VERIFIES, AND WHY ONE IS NOT ENOUGH ─────────
// Correction 3 records the first verifier being wrong: it searched the whole PDF for
// an entry's name and took the first hit, and `Pilar Kerja` appears in the reading
// on page 2 and in the chart table on page 5 long before the appendix, so it
// reported 21 mismatches that were all its own. The lesson taken here is not "search
// better" - it is that these three questions are different questions and want three
// different instruments:
//
//   1. BY CONSTRUCTION   the map printed == the map the shipped bytes record.
//                        Instrument: /Dests, written by the renderer from the real
//                        layout. Object graph, no prose. Catches drift.
//   2. BOUNDED           no reference points before the appendix's first page, and
//                        none past the last. Instrument: page arithmetic over the
//                        /Kids order. Catches a map that is self-consistent and
//                        pointing at the reading.
//   3. SPOTTED           the reference was actually PRINTED, with that number, on
//                        the chart page. Instrument: that page's own text.
//                        Catches a converged map that reached no reader - which
//                        neither 1 nor 2 can see, because both are happy with a
//                        document that prints nothing.
//
// Check 3 is the one that would have caught `referenceList` silently returning [].
// ============================================================

import { renderToBuffer } from '@react-pdf/renderer';

import { completeEdition, refRow } from './document.js';
import { buildAppendix, assertAnchorsUnique } from './appendix.js';
import { namedDestinationPages, pageObjectOrder, pageTexts } from './inspect.js';
import { pairDocument } from './pairDocument.js';
import { buildPairAppendix } from './pairAppendix.js';
import { PASANGAN_COPY } from '../site/copy.js';

/**
 * How many rebuilds the fixed point is allowed. Cowork's reference draft converged
 * after 1.
 *
 * NOT A BUDGET AND NOT FITTED. It is an oscillation detector: a map that has not
 * settled in this many passes is not slow, it is cycling - row A wraps when B does
 * not and vice versa - and one more pass would not settle it either. The failure is
 * a REFUSAL, so the cost of this being too low is a build that stops rather than a
 * document that ships wrong.
 */
export const MAX_REBUILDS = 6;

/**
 * Build a Complete Edition PDF, or refuse.
 *
 * @param {Object} args
 * @param {Object} args.chart output of calculateBaziChart
 * @param {Object} args.semanticJson Stage 3 output
 * @param {Object} args.rendered a render_cache row, VERBATIM
 * @returns {Promise<{buffer: Buffer, pageMap: Object, report: Object}>}
 * @throws {Error} on drift, on an unresolved reference, or on any verify failing
 */
export async function buildCompleteEditionPdf({
  chart, semanticJson, rendered, gender = null,
}) {
  return buildPdf({
    appendix: buildAppendix({ chart, semanticJson }),
    compose: (pageMap) => completeEdition({
      chart, semanticJson, rendered, pageMap, gender,
    }),
  });
}

/**
 * Build a compat PDF, or refuse. THE ONLY DOOR TO COMPAT BYTES.
 *
 * The heading arguments are the document's OWN strings - ruled copy slots, and a
 * `@@UNRULED` sentinel until Reyner rules them. Verifies 2 and 3 locate pages by
 * what was printed, so they are correct in both states; the production build is
 * what refuses on a sentinel, and it refuses for the whole site rather than here.
 *
 * `chartHeading` is chart A's, which is the FIRST of the two chart pages, and
 * verify 3's haystack runs from it to the page before the appendix - so it covers
 * chart B and the facts page, which is where the other two reference lists are.
 *
 * @param {Object} args as `pairDocument`, minus `pageMap`
 * @returns {Promise<{buffer: Buffer, pageMap: Object, report: Object}>}
 */
export async function buildPairPdf({
  chartA, chartB, semanticJson, rendered, pair,
}) {
  return buildPdf({
    appendix: buildPairAppendix({ chartA, chartB, semanticJson }),
    compose: (pageMap) => pairDocument({
      chartA, chartB, semanticJson, rendered, pair, pageMap,
    }),
    chartHeading: PASANGAN_COPY.pdf_chart_a_heading,
    appendixHeading: APPENDIX_HEADING,
  });
}

/**
 * Build a PDF from a COMPOSER, or refuse. The fixed point, the three verifies and
 * the refusals are all here; what the document IS belongs to the composer.
 *
 * ── WHY THE SEAM IS HERE (prompt Y-3 commit 1) ────────────
 * The compat PDF is the mirror PDF with two charts and a facts page. Everything hard
 * in this file - the fixed point, the three verifies, the /Dests reading, the
 * refusals - is about CROSS-REFERENCES, and cross-references do not care how many
 * charts a document has. So the compat document is a second COMPOSER fed to this
 * builder, the way `buildPairSemantic` is a second producer of the contract
 * `renderReading` consumes. A second PDF pipeline would be a second place for
 * correction 3 to be got wrong.
 *
 * ── THE HEADINGS ARE PARAMETERS NOW, AND THAT FIXES AN OLD SOFT SPOT ──
 * Verifies 2 and 3 locate pages by two heading STRINGS, and this file's own note
 * called that "the one soft spot": they were module constants here, so a rename in
 * `document.js` broke a check rather than the document. They are parameters with the
 * mirror's constants as defaults, so each composer declares the strings its own
 * document prints. The compat document must do this rather than merely benefit from
 * it: its chart headings are RULED COPY SLOTS, so their text is not a constant this
 * module could know, and while a slot is unruled the heading is a sentinel. A
 * verifier keyed to the string the document actually printed is correct in both
 * states; one keyed to a hard-coded Indonesian heading is correct in neither.
 *
 * @param {Object} args
 * @param {(pageMap: Object) => React.ReactElement} args.compose builds the document
 *   tree for a given page map. Called once per pass of the fixed point.
 * @param {Object} args.appendix output of `buildAppendix` / `buildPairAppendix`
 * @param {string} [args.chartHeading] the heading verify 3 finds the reference page
 *   by, and the first page of the reference haystack
 * @param {string} [args.appendixHeading] the heading verify 2 bounds references by
 * @param {Array<{id: string, name: string}>} [args.references] what the document
 *   actually prints a page number for. EMPTY since R6 (2026-09-14) for both
 *   composers, which is what makes the fixed point settle on pass 1.
 * @returns {Promise<{buffer: Buffer, pageMap: Object, report: Object}>}
 * @throws {Error} on drift, on an unresolved reference, or on any verify failing
 */
export async function buildPdf({
  compose,
  appendix,
  chartHeading = CHART_HEADING,
  appendixHeading = APPENDIX_HEADING,
  references = [],
}) {
  // ── THE COMPOSER DECLARES WHAT IT REFERENCES. RULED 2026-09-14 (R6). ──
  // This used to DERIVE the referenced set from the appendix - every named,
  // non-condition entry - because both composers printed a "Yang ada di baganmu"
  // list and that list was the reference. Reyner ruled the page-number
  // cross-references out: a reading is a document, not an index. Both composers now
  // reference nothing, so the default is `[]`.
  //
  // THE MACHINERY STAYS, BY THE SAME RULING. The fixed point, the three verifies and
  // the /Dests reading cost nothing and guard any future anchor. What changes is
  // that with nothing referenced there is nothing to RESOLVE: `anchors` is empty, so
  // `readPageMap` returns `{}`, `sameMap({}, {})` is true, and the loop settles on
  // its first pass instead of spending a rebuild discovering that. A composer that
  // wants references again passes them and every check wakes up unchanged.
  //
  // `assertAnchorsUnique` STILL RUNS ON THE WHOLE APPENDIX, deliberately: it is a
  // check on the appendix's own integrity, not on the references, and Y-4 says it is
  // unchanged. An anchor collision is still a refusal even though nothing points at
  // one today.
  const allAnchors = assertAnchorsUnique(appendix);
  const anchors = references.length > 0 ? allAnchors : [];
  const referenced = references;

  let printed = {};
  let buffer;
  let rebuilds = 0;

  for (;;) {
    buffer = await renderToBuffer(compose(printed));
    const measured = readPageMap(buffer, anchors);

    if (sameMap(printed, measured)) break;

    if (rebuilds >= MAX_REBUILDS) {
      throw new Error(`pdf: the page map did not converge in ${MAX_REBUILDS} rebuilds. `
        + `Drifting anchors: ${drift(printed, measured).join(', ')}. `
        + 'Refusing to emit - a two-pass build here prints references its own next '
        + 'pass invalidates (prompt M correction 3).');
    }
    printed = measured;
    rebuilds += 1;
  }

  const report = verifyReferences({
    buffer, pageMap: printed, anchors, referenced, chartHeading, appendixHeading,
  });
  report.rebuilds = rebuilds;
  return { buffer, pageMap: printed, report };
}

/**
 * The map the shipped bytes record: every anchor to the page react-pdf put it on.
 *
 * An anchor with no destination is a REFUSAL rather than an omission. The appendix
 * entry exists, so a missing destination means the renderer did not place it - and
 * the reference for it would silently print nothing, which is the failure this
 * function is upstream of.
 */
function readPageMap(buffer, anchors) {
  const dests = namedDestinationPages(buffer);
  const out = {};
  const missing = [];
  for (const id of anchors) {
    const page = dests.get(id);
    if (!page) missing.push(id);
    else out[id] = page;
  }
  if (missing.length) {
    throw new Error(`pdf: ${missing.length} of ${anchors.length} appendix anchors have no `
      + `named destination in the produced PDF: ${missing.slice(0, 6).join(', ')}`
      + `${missing.length > 6 ? ', ...' : ''}`);
  }
  return out;
}

const sameMap = (a, b) => {
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => a[k] === b[k]);
};

const drift = (printed, measured) => Object.keys(measured)
  .filter((k) => printed[k] !== measured[k])
  .map((k) => `${k} ${printed[k] ?? '(unprinted)'} -> ${measured[k]}`);

/**
 * The three verifies, over the buffer that is about to be returned.
 *
 * Every one of them THROWS. There is no "warn and ship" path: prompt M says step 4
 * is ship-blocking, and a check that logs is a check that gets read once.
 */
export function verifyReferences({
  buffer, pageMap, anchors, referenced,
  chartHeading = CHART_HEADING, appendixHeading = APPENDIX_HEADING,
}) {
  const pages = pageObjectOrder(buffer).length;
  const texts = pageTexts(buffer);
  // ── LOCATING A PAGE IGNORES WHITESPACE. CONTENT CHECKS DO NOT. ──
  // `pageTexts` returns text with the LAYOUT's line breaks in it, and react-pdf
  // will break inside a long unbroken token: the compat document's chart heading is
  // a ruled copy slot, and while it is unruled it draws `@@UNRULED: pdf_chart_a_
  // heading@@`, which came back as `@@\nUNRULED: pdf_chart_a_heading@@`. Verify 3
  // then reported "no page carries" a heading that was on the page.
  //
  // THIS IS APPLIED TO THE TWO HEADING LOOKUPS ONLY, and the asymmetry is the whole
  // of it: a heading lookup answers WHICH PAGE, and getting it wrong makes the
  // verify FAIL, never pass. The reference-row check below is the content assertion
  // and is left byte-exact, because loosening a matcher that decides whether a
  // reader actually saw something is how a check starts agreeing with expectations.
  const noSpace = (t) => t.replace(/\s+/gu, '');
  const flatTexts = texts.map(noSpace);
  const pageCarrying = (heading) => flatTexts.findIndex((t) => t.includes(noSpace(heading)));

  // ── 1. BY CONSTRUCTION ──
  // The loop's exit condition already proved `printed === measured`. Re-reading it
  // here is not redundant: this reads the FINAL buffer, and it is the one assertion
  // that the bytes being returned are the bytes that converged. A future refactor
  // that renders once more after the loop breaks this and nothing else would.
  const again = readPageMap(buffer, anchors);
  const mismatched = Object.keys(pageMap).filter((k) => again[k] !== pageMap[k]);
  if (mismatched.length) {
    throw new Error(`pdf: REF VERIFY 1 failed - ${mismatched.length} anchors do not land `
      + `where the emitted document printed them: ${mismatched.slice(0, 6).join(', ')}`);
  }

  // ── 2. BOUNDED ──
  // The appendix's first page, from its own heading rather than from arithmetic over
  // section lengths - the reading's page count varies with the prose, so any
  // constant here would be a guess. A reference pointing BEFORE it is the exact
  // failure mode of the verifier correction 3 threw out: `Pilar Kerja` on the chart
  // page is not the appendix's `Pilar Kerja`.
  const appendixStart = pageCarrying(appendixHeading) + 1;
  if (appendixStart < 1) {
    throw new Error(`pdf: REF VERIFY 2 failed - no page carries the appendix heading `
      + `"${appendixHeading}", so there is nothing to bound references against`);
  }
  const outOfRange = Object.entries(pageMap)
    .filter(([, p]) => p < appendixStart || p > pages)
    .map(([id, p]) => `${id} -> ${p}`);
  if (outOfRange.length) {
    throw new Error(`pdf: REF VERIFY 2 failed - appendix starts on page ${appendixStart} of `
      + `${pages}, and these references point outside it: ${outOfRange.join(', ')}`);
  }

  // ── 3. SPOTTED ──
  // The reference has to be ON THE PAGE, drawn, with that number. Everything above
  // is about a map; this is the only check that looks at what the reader sees, and
  // it is the one that catches a correct map that never got printed.
  const chartPageIndex = pageCarrying(chartHeading);
  if (chartPageIndex < 0) {
    throw new Error(`pdf: REF VERIFY 3 failed - no page carries "${chartHeading}"`);
  }
  // The list is allowed to wrap onto the chart page's continuation, so the haystack
  // is the chart page and every page up to the appendix.
  const haystack = texts.slice(chartPageIndex, Math.max(chartPageIndex + 1, appendixStart - 1))
    .join('\n');
  // THE WHOLE ROW, not the number. `hal. 8` on its own is satisfied by any other
  // row's reference, which would make this check pass on a document where one term's
  // reference was missing and another's happened to point at the same page. The row
  // as printed - name, gap, reference - is what the reader sees and is unambiguous.
  // (It also sidesteps correction 3's original trap from the other side: `Pilar
  // Kerja` is on this page twice, once as a palace and once as a reference row, and
  // only one of them carries a page number.)
  const unprinted = referenced
    .filter(({ id, name }) => !haystack.includes(refRow(name, pageMap[id])))
    .map(({ id, name }) => `${id} (${refRow(name, pageMap[id])})`);
  if (unprinted.length) {
    throw new Error(`pdf: REF VERIFY 3 failed - ${unprinted.length} of ${referenced.length} `
      + `reference rows are not drawn on the chart page: ${unprinted.slice(0, 6).join(', ')}`);
  }

  return {
    pages,
    appendixStart,
    anchors: anchors.length,
    referenced: referenced.length,
    // Anchors that carry no reference. Conditions, by correction 1. Named so a
    // reader of the console output does not have to subtract two numbers to find out
    // whether the difference is a ruling or a bug.
    unreferenced: anchors.filter((id) => !referenced.some((r) => r.id === id)),
    // COUNTED, not asserted to be zero. Verify 2 above throws before this line is
    // reached, so a literal 0 here would always be right and would prove nothing -
    // and a printed number that is a constant wearing a measurement's clothes is the
    // thing this repo's own convention is about. If the check is ever loosened, this
    // reports what the artifact has rather than what the code assumed.
    refsBeforeAppendix: Object.values(pageMap).filter((p) => p < appendixStart).length,
  };
}

/**
 * The two headings the verifies locate pages by. They are the document's own
 * strings, imported nowhere else - and that is the one soft spot in this file: a
 * later rename of a heading in `document.js` breaks a check here rather than the
 * document. `tests/pdf-document.spec.mjs` asserts both appear in a built PDF, so the
 * rename fails a test instead of failing silently.
 */
export const APPENDIX_HEADING = 'Istilah dalam Bacaanmu';
export const CHART_HEADING = 'Bagan Kelahiran';
