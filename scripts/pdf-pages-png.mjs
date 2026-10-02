#!/usr/bin/env node
// ============================================================
// scripts/pdf-pages-png.mjs — every page of a PDF as a PNG (Prompt AW proof images)
// ============================================================
//   node scripts/pdf-pages-png.mjs <file.pdf> <out-dir> [--dpi 110] [--prefix p]
//
// Writes <out-dir>/<prefix>-01.png ... one per page, through lib/pdf/raster.js.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { rasterPages } from '../lib/pdf/raster.js';

const [file, outDir] = process.argv.slice(2);
if (!file || !outDir) { console.error('usage: pdf-pages-png.mjs <file.pdf> <out-dir> [--dpi N] [--prefix p]'); process.exit(2); }
const opt = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : fallback; };
const dpi = Number(opt('dpi', 110));
const prefix = opt('prefix', path.basename(file, '.pdf'));

fs.mkdirSync(outDir, { recursive: true });
const pages = await rasterPages(fs.readFileSync(file), { dpi });
for (const p of pages) {
  const out = path.join(outDir, `${prefix}-${String(p.page).padStart(2, '0')}.png`);
  fs.writeFileSync(out, p.png());
  console.log(`${out} ${p.width}x${p.height}`);
}
