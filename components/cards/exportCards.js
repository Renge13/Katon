'use client';
// ============================================================
// TWO EXPORT TARGETS, NOT ONE — share and download
// ============================================================
// RULED 2026-08-14 (docs/content/card-polish-spec.md §7).
//
// The capture used to take the CANVAS node, so every downloaded file carried the
// 86.4px field around the object. The download should stop at the card edge. That
// needs two targets rather than one changed target, because the field is not
// decoration — it is what makes the shared file feed-safe.
//
//   SHARE     the canvas.  A 1080x1350 (4:5), B 1080x1920 (9:16).  For posting.
//   DOWNLOAD  the object.  A 1080x1350,       B 907x1747.          For keeping.
//
// CARD A'S TWO ROWS ARE NOW THE SAME SURFACE (prompt R commit 1). It has no mat,
// so there is no field to keep and nothing to crop away - the share and the
// download are the same 1080x1350 pixels reached through two different node ids.
// COLLAPSING THEM INTO ONE ASSET IS COMMIT 3, not this commit; the ids and the
// two-target contract are untouched here so the export path keeps working while
// the geometry moves.
//
// ── WHY BOTH, AND WHY THE DOWNLOAD CANNOT REPLACE THE SHARE ──
// The object alone is 63:88 = 0.716, which is neither 3:4 nor 4:5. Post that and
// every platform letterboxes or auto-crops it, and an auto-crop takes the top and
// bottom of a card whose whole design puts the headline at the top and the seal at
// the bottom. The feed-native ratios are the 08-03 ruling and they are unchanged.
//
// ── THREE THINGS THE CARD-ONLY CAPTURE HAS TO HANDLE ───────
//   1. PNG WITH ALPHA, NEVER JPEG. The object has a 40px corner radius, so
//      cropping to its bounds leaves four transparent corners. A JPEG has no
//      alpha channel and fills them with black or white triangles.
//   2. CARD B'S DROP SHADOW IS DRAWN OUTSIDE THE OBJECT BOUNDS and would be
//      clipped to a hard grey band along two edges. It is dropped from the
//      download instead. The rim is what makes the object read as an object; the
//      shadow only ever existed to lift it off the canvas, and there is no canvas
//      here. Padding the capture to keep the shadow would contradict "stop at the
//      card edge".
//   3. THE RIM SURVIVES EXACTLY. It is an SVG stroke inset by half its width with
//      `rx: 39`, so it sits inside the crop rather than straddling it. An
//      off-by-one here shows as a hairline of canvas colour along the border.
//
// ── WHY THE DESCRIPTOR IS SEPARATE FROM THE CAPTURE ────────
// `captureSpec()` is pure and exported, so `tests/card.spec.mjs` can assert the
// ruled sizes and options under plain node. html-to-image needs a DOM and cannot
// run there, and a rule that is only exercised in a browser nobody opens is a
// rule that drifts. The browser half below is a thin wrapper over it.
// ============================================================

import { toPng } from 'html-to-image';
import { CARD_A, CARD_B, OBJECT_ID_SUFFIX, exportSize } from './Card.js';

/** @typedef {'share'|'download'} CaptureKind */

/**
 * What to capture, at what size, with what options. PURE.
 *
 * @param {CaptureKind} kind
 * @param {'A'|'B'} card
 * @param {string} [id] the card's DOM id, as passed to <CardA>/<CardB>
 */
export function captureSpec(kind, card, id = card === 'A' ? 'card-a' : 'card-b') {
  const spec = card === 'A' ? CARD_A : CARD_B;
  // ── CARD A HAS NO CANVAS SINCE PROMPT R COMMIT 1 ──
  // The share capture still addresses the outer node, which now collapses onto the
  // object at the same size, so a share export of Card A is 1080x1350 and is the
  // same pixels as its download. THE TWO TARGETS STILL EXIST AND STILL DIFFER FOR
  // CARD B, which is why this is a fallback rather than a rewrite: collapsing the
  // two into one asset is prompt R's COMMIT 3, and doing it here would put an
  // export-format change inside a commit whose subject is geometry.
  //
  // FOUND AT RUNTIME, NOT BY THE GREP R PRESCRIBED. R says to find every consumer
  // of `CARD_A.canvas` before editing the constant; this one reads `spec.canvas`
  // through an alias, so no grep for `CARD_A.canvas` reaches it. Recorded because
  // the next session will be told to grep for the same thing.
  const canvas = exportSize(spec);
  if (kind === 'share') {
    return {
      kind, card,
      // The canvas node itself: the field is the point.
      nodeId: id,
      width: canvas.w,
      height: canvas.h,
      // PNG throughout. The share export has no transparency to preserve, but one
      // format for both keeps the pipeline single-purpose.
      type: 'png',
      style: {},
    };
  }
  if (kind === 'download') {
    return {
      kind, card,
      nodeId: `${id}${OBJECT_ID_SUFFIX}`,
      width: spec.card.w,
      height: spec.card.h,
      type: 'png',
      // Card A has no shadow to begin with; declaring it for both keeps the
      // download's contract "no shadow, ever" a property of the capture rather
      // than of which card happens to be passed in.
      style: { boxShadow: 'none' },
    };
  }
  throw new Error(`Unknown capture kind "${kind}"`);
}

/** The two kinds, so callers and tests enumerate the same list. */
export const CAPTURE_KINDS = ['share', 'download'];

/**
 * Capture a rendered card to a PNG data URL.
 *
 * `backgroundColor` is deliberately NEVER set: html-to-image defaults to
 * transparent, and the download depends on that for its four rounded corners.
 * Passing a colour here would fill them and silently undo the whole point of
 * cropping to the object.
 *
 * ── THE CARD MUST BE LAID OUT AT EXPORT SIZE. THERE IS NO SCALING HERE ──
 *
 * This function used to render the clone back up to export size with
 * `transform: scale(s.width / node.getBoundingClientRect().width)` and a
 * top-left origin. That produced a BLANK share card in production for three
 * days, and the reason is html-to-image's own `applyStyle`:
 *
 *     e.width && (n.width = "".concat(e.width, "px"))
 *
 * It writes the OUTPUT width onto the clone before our `style` is applied. So a
 * canvas laid out at 367px was relayouted to 1080px while its child object kept
 * its 367px-scale metrics; the canvas CENTRES its child (Card.js:904), which put
 * the object at (386, 505); and the top-left scale of 2.941 then threw it to
 * (1135, 1484), outside a 1080x1440 box, where `overflow: hidden` clipped it.
 * What was left was the canvas background: one colour, correct size, correct
 * corner pixel, and every geometry assertion in the probe still green.
 *
 * The download target escaped the blanking, because the object stacks from the
 * top-left rather than centring - but not the relayout, so it exported the left
 * third of a card three times too wide, with anything the column flex pushed to
 * the bottom below the captured area. It was damaged, not correct.
 *
 * THE FIX IS TO REMOVE THE SCALING, NOT TO CORRECT IT. Callers render the card
 * at true export size and shrink it for DISPLAY with a CSS transform on a
 * wrapper (`components/Funnel.jsx`). A transform does not change an element's
 * layout box, so the clone here is 1:1 with the output and there is nothing to
 * undo. Measured 0 differing pixels between a wrapped card and a bare one, on
 * both targets of both cards - `scripts/probe-card-export.mjs`, the "vs bare1"
 * column.
 *
 * `width`/`height` are still passed. They are a no-op on a correctly laid out
 * node - they write the size the node already has - and they keep the output
 * contract stated at the call site rather than inferred from the DOM.
 */
export async function captureCard(kind, card, { id } = {}) {
  if (typeof document === 'undefined') throw new Error('export must run in the browser');
  await document.fonts.ready;

  const s = captureSpec(kind, card, id);
  const node = document.getElementById(s.nodeId);
  if (!node) throw new Error(`#${s.nodeId} not found - is the card rendered with id="${id}"?`);

  // REFUSE A DISPLAY-SCALED NODE RATHER THAN EXPORT IT WRONG. `offsetWidth` is
  // the layout box, so it is unaffected by any CSS transform on this node or on
  // an ancestor - which is exactly the distinction that matters: the display
  // wrapper is invisible here, a card actually rendered small is not.
  //
  // The old code treated this case as routine and compensated for it. That is
  // what produced the blank card, so it is now the one thing this function will
  // not do. An error reaches the reader as "coba lagi"; a silently wrong card
  // reaches her feed.
  if (Math.abs(node.offsetWidth - s.width) > 1) {
    throw new Error(
      `#${s.nodeId} is laid out at ${node.offsetWidth}px but the ${kind} capture is ${s.width}px. `
      + 'Render the card at scale 1 and shrink it for display with a CSS transform on a wrapper.',
    );
  }

  return toPng(node, {
    width: s.width,
    height: s.height,
    pixelRatio: 1,
    cacheBust: true,
    style: { ...s.style, margin: '0' },
  });
}

/** Capture and hand the file to the browser's download. */
export async function downloadCard(kind, card, { id, filename = 'katon.png' } = {}) {
  const dataUrl = await captureCard(kind, card, { id });
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
  return dataUrl;
}
