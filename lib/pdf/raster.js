// ============================================================
// lib/pdf/raster.js — a PDF page as pixels, for tests and QA images (Prompt AW)
// ============================================================
// DEV AND TEST ONLY. Nothing on a request path imports this: pdfjs-dist and
// @napi-rs/canvas are devDependencies. It exists because two AW checks are about what
// a page LOOKS like, which lib/pdf/inspect.js cannot see: inspect reads the text a page
// draws, never where the ink lands (its own header says the snapshot is "blind to
// typography BY CONSTRUCTION"). The logo dot's alignment and the before/after page
// images are both questions about ink.
//
// pdfjs renders the bytes the route serves, fonts included (the PDF embeds them), so
// what is measured is the artifact, not a description of it.
// ============================================================

import { createRequire } from 'node:module';
import path from 'node:path';

import { createCanvas } from '@napi-rs/canvas';

// THE STANDARD-14 FACES. A react-pdf document that names Helvetica embeds no font
// program for it, and without these pdfjs draws a substitute serif: the first images
// this module made showed Helvetica body text as Times-like type, which is a picture
// of the rasteriser, not of the document. pdfjs ships metric-compatible faces for the
// standard 14 (Liberation / Foxit); pointing it at them is what makes a Helvetica page
// measure like Helvetica.
const STANDARD_FONTS = `${path.join(path.dirname(createRequire(import.meta.url).resolve('pdfjs-dist/package.json')), 'standard_fonts').split(path.sep).join('/')}/`;

let pdfjs = null;
async function lib() {
  pdfjs ??= await import('pdfjs-dist/legacy/build/pdf.mjs');
  return pdfjs;
}

/**
 * Render pages of a PDF to RGBA pixels.
 *
 * @param {Uint8Array|Buffer} bytes
 * @param {Object} [opts]
 * @param {number} [opts.dpi=200]
 * @param {number[]} [opts.pages] 1-based page numbers; all when omitted
 * @returns {Promise<Array<{page: number, width: number, height: number, data: Uint8ClampedArray, png: () => Buffer}>>}
 */
export async function rasterPages(bytes, { dpi = 200, pages = null } = {}) {
  const { getDocument } = await lib();
  const doc = await getDocument({
    data: new Uint8Array(bytes), disableFontFace: true, useSystemFonts: false, isEvalSupported: false,
    standardFontDataUrl: STANDARD_FONTS, verbosity: 0,
  }).promise;
  const want = pages ?? Array.from({ length: doc.numPages }, (_, i) => i + 1);
  const out = [];
  for (const n of want) {
    const page = await doc.getPage(n);
    const viewport = page.getViewport({ scale: dpi / 72 });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    out.push({ page: n, width: canvas.width, height: canvas.height, data, png: () => canvas.toBuffer('image/png') });
  }
  await (doc.destroy?.() ?? doc.cleanup?.());
  return out;
}

/**
 * The bounding box of pixels matching `match(r, g, b)` inside a region.
 *
 * @returns {{x0: number, y0: number, x1: number, y1: number, cx: number, cy: number, n: number}|null}
 */
export function inkBox(img, match, { x0 = 0, y0 = 0, x1 = img.width, y1 = img.height } = {}) {
  let bx0 = Infinity; let by0 = Infinity; let bx1 = -Infinity; let by1 = -Infinity; let n = 0;
  for (let y = Math.max(0, y0); y < Math.min(img.height, y1); y += 1) {
    for (let x = Math.max(0, x0); x < Math.min(img.width, x1); x += 1) {
      const i = (y * img.width + x) * 4;
      if (!match(img.data[i], img.data[i + 1], img.data[i + 2])) continue;
      n += 1;
      if (x < bx0) bx0 = x; if (x > bx1) bx1 = x;
      if (y < by0) by0 = y; if (y > by1) by1 = y;
    }
  }
  if (!n) return null;
  return { x0: bx0, y0: by0, x1: bx1, y1: by1, cx: (bx0 + bx1) / 2, cy: (by0 + by1) / 2, n };
}
