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
//   SHARE     the canvas.  A 1080x1440 (3:4), B 1080x1920 (9:16).  For posting.
//   DOWNLOAD  the object.  A 907x1267,        B 907x1747.          For keeping.
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
import { CARD_A, CARD_B, OBJECT_ID_SUFFIX } from './Card.js';

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
  if (kind === 'share') {
    return {
      kind, card,
      // The canvas node itself: the field is the point.
      nodeId: id,
      width: spec.canvas.w,
      height: spec.canvas.h,
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
 */
export async function captureCard(kind, card, { id, scale = 1 } = {}) {
  if (typeof document === 'undefined') throw new Error('export must run in the browser');
  await document.fonts.ready;

  const s = captureSpec(kind, card, id);
  const node = document.getElementById(s.nodeId);
  if (!node) throw new Error(`#${s.nodeId} not found - is the card rendered with id="${id}"?`);

  // The card is rendered at some display `scale` and exported at 1:1 export
  // pixels, so the clone is scaled back up by the inverse. Measured off the node
  // rather than trusted from the argument when it can be: a caller that renders
  // at 0.36 and forgets to say so would otherwise export a 327px-wide card.
  const rendered = node.getBoundingClientRect().width;
  const factor = rendered > 0 ? s.width / rendered : 1 / scale;

  return toPng(node, {
    width: s.width,
    height: s.height,
    pixelRatio: 1,
    cacheBust: true,
    style: {
      ...s.style,
      transform: `scale(${factor})`,
      transformOrigin: 'top left',
      // The transform does not change layout, so the clone is still laid out at
      // its rendered size; the width/height above define the output box.
      margin: '0',
    },
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
