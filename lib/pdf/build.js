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
import { buildAppendix, anchorId, assertAnchorsUnique } from './appendix.js';
import { namedDestinationPages, pageObjectOrder, pageTexts } from './inspect.js';

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
export async function buildCompleteEditionPdf({ chart, semanticJson, rendered }) {
  const appendix = buildAppendix({ chart, semanticJson });
  const anchors = assertAnchorsUnique(appendix);
  // The referenced subset: named entries only. A CONDITION carries an anchor and an
  // appendix entry and NO reference, because correction 1 keeps it out of the "what
  // is in your chart" list and that list is where references live. So the two counts
  // differ ON PURPOSE, and both are reported rather than one being quietly used as
  // the other - a smaller ref count than anchor count is the ruling, not a gap.
  const referenced = appendix.groups
    .flatMap((g) => g.entries)
    .filter((e) => !e.condition && e.name)
    .map((e) => ({ id: anchorId(e), name: e.name }));

  let printed = {};
  let buffer;
  let rebuilds = 0;

  for (;;) {
    buffer = await renderToBuffer(completeEdition({
      chart, semanticJson, rendered, pageMap: printed,
    }));
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
    buffer, pageMap: printed, anchors, referenced,
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
}) {
  const pages = pageObjectOrder(buffer).length;
  const texts = pageTexts(buffer);

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
  const appendixStart = texts.findIndex((t) => t.includes(APPENDIX_HEADING)) + 1;
  if (appendixStart < 1) {
    throw new Error(`pdf: REF VERIFY 2 failed - no page carries the appendix heading `
      + `"${APPENDIX_HEADING}", so there is nothing to bound references against`);
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
  const chartPageIndex = texts.findIndex((t) => t.includes(CHART_HEADING));
  if (chartPageIndex < 0) {
    throw new Error(`pdf: REF VERIFY 3 failed - no page carries "${CHART_HEADING}"`);
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
