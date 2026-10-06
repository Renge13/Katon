// ============================================================
// tests/pdf-closing.spec.mjs — the PDF's footer, closing page and hidden provenance
// ============================================================
// Run: npm run test:pdf-closing
//
// Prompt BE §5 (Reyner, 2026-10-06), both editions:
//   a. the provenance line (`katon.app - <engine> - prompt <v> - gate <v>`) leaves every
//      page, and lives on, invisibly, in the document metadata;
//   b. a running footer on every page, F1, small and grey;
//   c. after the glossary, one closing page with the four C1 sections.
// The strings are Reyner's, confirmed 2026-10-06, and are compared byte for byte.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { buildCompleteEditionPdf, buildPairPdf, APPENDIX_HEADING } from '../lib/pdf/build.js';
import { pageTexts, pdfObjects } from '../lib/pdf/inspect.js';
import { RENDER_COPY } from '../lib/render/copy.js';

const F1 = '© 2026 PT Katon Digital Nusantara. All rights reserved. | katon.app';
const C1 = [
  ['Tentang bacaan ini.', RENDER_COPY.pdfDisclaimer],
  ['Privasi.', 'Data kelahiranmu terlindungi dan hanya digunakan untuk menyusun bacaan ini. Kebijakan selengkapnya: katon.app/privasi.'],
  ['Hak cipta.', 'Bacaan ini disusun khusus untuk penggunaan pribadi. Dilarang menyebarluaskan, mereproduksi, atau memperjualbelikan isinya untuk tujuan komersial.'],
  ['Kontak.', 'hello@katon.app | PT Katon Digital Nusantara | Tangerang Selatan, Banten'],
];

const A = { birthDate: '1989-09-13', birthTime: '09:00' };
const B = { birthDate: '1990-03-04', birthTime: '14:00' };
const renderedFor = (semanticJson) => ({
  ...assembleFallback(semanticJson),
  prompt_version: 'testprompt00',
  stage6_version: '1.25.0',
});

let built = null;
async function docs() {
  if (built) return built;
  const chart = calculateBaziChart(A);
  const sj = buildSemanticJson(chart);
  const m = await buildCompleteEditionPdf({ chart, semanticJson: sj, rendered: renderedFor(sj), gender: 'female' });
  const chartA = calculateBaziChart(A);
  const chartB = calculateBaziChart(B);
  const pj = buildPairSemantic(chartA, chartB);
  const c = await buildPairPdf({
    chartA, chartB, semanticJson: pj, rendered: renderedFor(pj),
    pair: { a: { date: A.birthDate, gender: 'female' }, b: { date: B.birthDate, gender: 'male' } },
  });
  built = [
    { name: 'mirror', buffer: m.buffer, texts: pageTexts(m.buffer), provenance: `katon.app - ${sj.engine_version} - prompt testprompt00 - gate 1.25.0` },
    { name: 'compat', buffer: c.buffer, texts: pageTexts(c.buffer), provenance: `katon.app - ${pj.engine_version} - prompt testprompt00 - gate 1.25.0` },
  ];
  return built;
}

const flat = (t) => t.replace(/\s+/gu, ' ').trim();

/**
 * The document info dictionary's string values, decoded (literal or UTF-16BE hex).
 * react-pdf writes each value as an INDIRECT object (`/Subject 48 0 R`), so a reference
 * is resolved through `pdfObjects` before decoding.
 */
function infoStrings(buffer) {
  const raw = buffer.toString('latin1');
  const objects = pdfObjects(buffer);
  const decode = (s) => {
    const lit = /^\s*\(((?:\\.|[^\\)])*)\)/u.exec(s);
    if (lit) return lit[1].replace(/\\(.)/gu, '$1');
    const hex = /^\s*<([0-9A-Fa-f]+)>/u.exec(s);
    if (hex) {
      const bytes = Buffer.from(hex[1], 'hex');
      const body = bytes[0] === 0xfe && bytes[1] === 0xff ? Buffer.from(bytes.subarray(2)) : bytes;
      return body.swap16().toString('utf16le');
    }
    return null;
  };
  const out = {};
  for (const key of ['Title', 'Author', 'Subject', 'Keywords']) {
    const ref = new RegExp(`/${key}\\s+(\\d+)\\s+0\\s+R`, 'u').exec(raw);
    const inline = new RegExp(`/${key}(\\s*[(<][^\\n]*)`, 'u').exec(raw);
    const value = ref ? decode(objects.get(ref[1])?.head ?? '') : (inline ? decode(inline[1]) : null);
    if (value !== null) out[key] = value;
  }
  return out;
}

test('§5a THE PROVENANCE IS ON NO PAGE, AND IS IN THE METADATA', async () => {
  for (const d of await docs()) {
    for (const [i, t] of d.texts.entries()) {
      assert.equal(flat(t).includes('prompt testprompt00'), false, `${d.name} page ${i + 1} still prints the provenance`);
      assert.equal(flat(t).includes('gate 1.25.0'), false, `${d.name} page ${i + 1} still prints the gate version`);
    }
    const info = infoStrings(d.buffer);
    assert.ok([info.Subject, info.Keywords].some((v) => v === d.provenance),
      `${d.name}: the provenance is not in the metadata; info: ${JSON.stringify(info)}`);
  }
});

test('§5b F1 IS THE RUNNING FOOTER ON EVERY PAGE', async () => {
  for (const d of await docs()) {
    for (const [i, t] of d.texts.entries()) {
      assert.ok(flat(t).includes(F1), `${d.name} page ${i + 1} of ${d.texts.length} has no F1 footer`);
    }
  }
});

test('§5c THE LAST PAGE IS THE CLOSING PAGE, AFTER THE GLOSSARY, WITH THE FOUR C1 SECTIONS', async () => {
  for (const d of await docs()) {
    const last = flat(d.texts.at(-1));
    for (const [label, body] of C1) {
      assert.ok(last.includes(label), `${d.name}: the closing page lacks "${label}"`);
      assert.ok(last.includes(flat(body)), `${d.name}: the closing page lacks the ${label} text`);
    }
    // EVERY PAGE IS A4, the closing page included: a flex-grown closing page once came out
    // 288pt tall, sized to its content (2026-10-06), and its text alone could not show it.
    const boxes = [...d.buffer.toString('latin1').matchAll(/\/MediaBox\s*\[([^\]]*)\]/gu)].map((x) => x[1].trim());
    assert.equal(boxes.length, d.texts.length, `${d.name}: one MediaBox per page`);
    assert.deepEqual([...new Set(boxes)], ['0 0 595.280029 841.890015'], `${d.name}: every page is A4`);
    const glossaryAt = d.texts.findIndex((t) => flat(t).includes(APPENDIX_HEADING));
    assert.ok(glossaryAt > -1 && glossaryAt < d.texts.length - 1, `${d.name}: the glossary comes before the closing page`);
    assert.equal(last.includes(APPENDIX_HEADING), false, `${d.name}: the closing page is its own page`);
  }
});
