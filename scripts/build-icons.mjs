#!/usr/bin/env node
// ============================================================
// scripts/build-icons.mjs — app/apple-icon.png and app/favicon.ico from app/icon.svg
// ============================================================
//   npm run build:icons
//
// Prompt BO §1. `app/icon.svg` is the ONE source of the mark: option A2, the
// --clay dot from the header logomark ALONE, about 80% of the canvas, on a
// transparent background (Reyner, 2026-10-12, replacing option A's --kertas
// tile, which vanished against a white active tab). The two raster files are
// rendered FROM it, so a change to the mark is one edit and a re-run, never a
// second hand-drawn copy.
//
// ── THE APPLE ICON KEEPS OPTION A ─────────────────────────
// A full-bleed --kertas square with the dot at 44% of the side, as ruled. iOS
// masks a touch icon into its own rounded shape and fills any transparent pixel
// with black, so the tab icon's transparent background cannot be reused there.
// The SVG is drawn onto a --kertas canvas at 55% scale: 80% x 55% = 44%. The
// colour is read from app/globals.css, never retyped here.
//
// ── THE .ico HOLDS PNG ENTRIES ────────────────────────────
// 16x16 and 32x32, each a PNG inside the ICONDIR container. PNG-in-ICO is read
// by every browser and by Windows since Vista, and it keeps this script free of
// a BMP encoder. tests/favicon.spec.mjs reads the ICONDIR back and asserts both
// sizes are inside.
// ============================================================

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SVG_PATH = path.join(ROOT, 'app', 'icon.svg');
const svg = readFileSync(SVG_PATH, 'utf8');

async function renderPng(source, size) {
  const img = await loadImage(Buffer.from(source));
  const canvas = createCanvas(size, size);
  canvas.getContext('2d').drawImage(img, 0, 0, size, size);
  return canvas.toBuffer('image/png');
}

const css = readFileSync(path.join(ROOT, 'app', 'globals.css'), 'utf8');
const KERTAS = css.match(/--kertas:\s*(#[0-9a-f]{6})/iu)?.[1];
if (!KERTAS) throw new Error('build-icons: app/globals.css defines no --kertas');

const APPLE_SIZE = 180;
const APPLE_SCALE = 0.55;
const appleCanvas = createCanvas(APPLE_SIZE, APPLE_SIZE);
const appleCtx = appleCanvas.getContext('2d');
appleCtx.fillStyle = KERTAS;
appleCtx.fillRect(0, 0, APPLE_SIZE, APPLE_SIZE);
const markSide = APPLE_SIZE * APPLE_SCALE;
appleCtx.drawImage(await loadImage(Buffer.from(svg)), (APPLE_SIZE - markSide) / 2, (APPLE_SIZE - markSide) / 2, markSide, markSide);
const apple = appleCanvas.toBuffer('image/png');
writeFileSync(path.join(ROOT, 'app', 'apple-icon.png'), apple);

const entries = await Promise.all([16, 32].map(async (size) => ({ size, png: await renderPng(svg, size) })));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type 1 = icon
header.writeUInt16LE(entries.length, 4);
let offset = 6 + 16 * entries.length;
const dir = entries.map(({ size, png }) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(size, 0); // width
  e.writeUInt8(size, 1); // height
  e.writeUInt8(0, 2); // palette colours
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // colour planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(png.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += png.length;
  return e;
});
writeFileSync(path.join(ROOT, 'app', 'favicon.ico'), Buffer.concat([header, ...dir, ...entries.map((e) => e.png)]));

console.log(`build-icons: app/apple-icon.png (180x180, ${apple.length} B), `
  + `app/favicon.ico (${entries.map((e) => `${e.size}x${e.size}`).join(' + ')}, ${offset} B)`);
