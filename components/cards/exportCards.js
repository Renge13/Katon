'use client';
// ============================================================
// EXPORT TARGETS — two for Card B, ONE for Card A
// ============================================================
// RULED 2026-08-14 (docs/content/card-polish-spec.md §7).
//
// The capture used to take the CANVAS node, so every downloaded file carried the
// 86.4px field around the object. The download should stop at the card edge. That
// needs two targets rather than one changed target, because the field is not
// decoration — it is what makes the shared file feed-safe.
//
//   CARD B   SHARE     the canvas, 1080x1920 (9:16), field included. For posting.
//            DOWNLOAD  the object,  907x1747, stops at the rim.      For keeping.
//   CARD A   ONE ASSET, BOTH PATHS. 1080x1350 (4:5), the object.
//
// ── CARD A COLLAPSED TO ONE ASSET (prompt R commit 3) ──
// The two targets only ever existed because of the MAT: the field is what made a
// shared file feed-safe, and the download had to stop at the card edge to be worth
// keeping. Card A has no mat. It is full-bleed, opaque and square, so there is no
// field to include and nothing to crop away, and both kinds now return the SAME
// descriptor rather than two that happen to agree. A difference that exists only
// in the code is one somebody later "fixes" in the wrong direction.
//
// ── WHY BOTH STILL EXIST FOR CARD B ──
// Its object alone is 63:88 = 0.716, which is neither 3:4 nor 4:5. Post that and
// every platform letterboxes or auto-crops it, and an auto-crop takes the top and
// bottom of a card whose whole design puts the headline at the top and the seal at
// the bottom. The feed-native ratios are the 08-03 ruling and they are unchanged.
//
// ── THREE THINGS THE CARD-ONLY CAPTURE HAS TO HANDLE ───────
//   1. PNG WITH ALPHA, NEVER JPEG — **CARD B ONLY**, since prompt R commit 3.
//      CARD B's object has a 40px corner radius, so cropping to its bounds leaves
//      four transparent corners, and a JPEG has no alpha channel to hold them: it
//      fills them with black or white triangles.
//      **CARD A HAS NO TRANSPARENCY AT ALL.** It is square, full-bleed and fully
//      opaque, so there are no alpha corners to preserve and this reason does not
//      apply to it. PNG stays for both, for pipeline consistency rather than for
//      alpha - which is §10's stated implementation consequence, and the reason
//      this docblock now says WHICH CARD it is talking about. A rule kept for a
//      reason that has stopped being true is a rule nobody can safely change.
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

/** The two kinds, so callers and tests enumerate the same list. */
export const CAPTURE_KINDS = ['share', 'download'];

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

  // VALIDATED BEFORE ANY EARLY RETURN. The Card A branch below returns the same
  // asset for both kinds, and an unknown kind must still be REFUSED rather than
  // quietly handed that asset - which is what happened when this check lived only
  // at the bottom of the function, caught by the existing `assert.throws`.
  if (!CAPTURE_KINDS.includes(kind)) throw new Error(`Unknown capture kind "${kind}"`);

  // ── ONE ASSET, BOTH PATHS, FOR A CARD WITH NO MAT (prompt R commit 3) ──
  // The two targets exist because the FIELD is what makes a shared file feed-safe
  // while the download should stop at the card edge. Card A has no field any more:
  // it is 1080x1350, full-bleed and opaque, and the canvas node and the object node
  // are the same pixels at the same size. So the two kinds return the SAME
  // descriptor rather than two that happen to agree - a difference that exists only
  // in the code is a difference someone will later "fix" in the wrong direction.
  //
  // CARD B IS UNAFFECTED and keeps two genuinely different targets: 1080x1920 with
  // its field for sharing, 907x1747 stopping at the rim for keeping.
  if (!spec.canvas) {
    return {
      kind, card,
      // The OBJECT node. Both nodes are the same size now, and the object is the
      // one that IS the card - `id` addresses a box whose only job was to hold a
      // mat that no longer exists.
      nodeId: `${id}${OBJECT_ID_SUFFIX}`,
      width: spec.card.w,
      height: spec.card.h,
      type: 'png',
      // Card A never had a shadow; declaring it keeps "no shadow, ever" a property
      // of the capture rather than of which card was passed in.
      style: { boxShadow: 'none' },
    };
  }
  // BELOW HERE IS CARD B ONLY - the branch above returns for any spec without a
  // canvas. `exportSize` is still used rather than `spec.canvas` because that is
  // the rule the source guard in tests/card.spec.mjs enforces file-wide, and an
  // exception "safe because of the branch above" is exactly the reasoning that put
  // a TypeError on the free reading page.
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
      // The shadow is dropped from the download - see point 2 above. This branch
      // is Card B only now; Card A carries the same suppression on its single
      // asset, so "no shadow, ever" stays a property of the capture.
      style: { boxShadow: 'none' },
    };
  }
  // No trailing throw: the kind is validated at the top, before any early
  // return, so this point is unreachable for a valid kind and unreachable for an
  // invalid one. A second guard here would be dead code that reads like a check.
  throw new Error(`unreachable: kind "${kind}" passed validation but matched no branch`);
}


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
