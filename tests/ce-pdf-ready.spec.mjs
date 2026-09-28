// ============================================================
// tests/ce-pdf-ready.spec.mjs — the Complete Edition's "Unduh PDF" waits for the reading
// ============================================================
// Run: npm run test:ce-pdf-ready
//
// Reyner's ruling 3 (Prompt AL §4, docs/product/ah-protection-rulings-2026-09-28.md,
// third set): hide "Unduh PDF" until the reading is ready, using the existing
// Compatibility pattern. That pattern is components/PasanganReport.jsx: the PDF
// control renders on `ready` only and not on `floor`, because the PDF route answers
// 409 on a floored reading (rule 16 keeps floors out of render_cache), and a hidden
// control is chosen over a broken one. No text takes its place; a reload re-renders
// and brings it back.
//
// The CE twin: GET /api/deliver/[id]/pdf answers 409 `reading_not_rendered` when no
// printable render exists after its warm (lib/deliver/handlers.js), while the card
// route still answers 200 - so the Delivery showed the link as soon as the card
// loaded. The served mirror says which it is in `meta.source`: 'module_assembly' is
// the floor (lib/mirror/view.js), the same fact the pair route turns into
// `served_from: 'floor'` (lib/pair/serveReading.js).
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { mirrorChartView } from '../lib/mirror/view.js';
import { buildCardData } from '../lib/card/cardData.js';
import { ReadingByToken } from '../components/Funnel.jsx';

const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '04:00' });
const semanticJson = buildSemanticJson(chart);
const served = (source) => ({
  token: 'tok1',
  chart: mirrorChartView(chart, semanticJson),
  blocks: [{ heading: 'Inti dirimu', paragraphs: ['Paragraf satu.'] }],
  penutup: '',
  pending: false,
  card: null,
  meta: { cached: false, source },
});

function stub(source) {
  const prev = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const u = String(url);
    const ok = (body) => ({ ok: true, status: 200, json: async () => body });
    if (u === '/api/deliver/tok1/card') return ok({ token: 'tok1', card: buildCardData({ chart, semanticJson, birthDate: '1989-09-13', gender: 'female' }) });
    if (u === '/api/deliver/tok1') return ok({ paid: true, items: [{ item: 'card', ready: true }, { item: 'pdf', ready: true }] });
    if (u.startsWith('/api/mirror/')) return ok(served(source));
    return ok({});
  };
  return () => { globalThis.fetch = prev; };
}

async function mount() {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(React.createElement(ReadingByToken, { token: 'tok1', salesOpen: true })); });
  for (let i = 0; i < 6; i += 1) {
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
  }
  return { host, unmount: () => { act(() => root.unmount()); host.remove(); } };
}

const pdfLinks = (host) => host.querySelectorAll('a[href="/api/deliver/tok1/pdf"]').length;

test('READY: a paid reading that passed the gate shows exactly one "Unduh PDF" link', async () => {
  const restore = stub('gemini');
  const ui = await mount();
  try {
    assert.ok(ui.host.textContent.includes('Simpan Kartu'), 'precondition: the delivery opened');
    assert.equal(pdfLinks(ui.host), 1);
    assert.ok(ui.host.textContent.includes('Unduh PDF'));
  } finally { ui.unmount(); restore(); }
});

test('FLOOR: a paid reading served from the floor, whose PDF would answer 409, renders NO download link', async () => {
  const restore = stub('module_assembly');
  const ui = await mount();
  try {
    assert.ok(ui.host.textContent.includes('Simpan Kartu'), 'precondition: the delivery opened, the card is unaffected');
    assert.equal(pdfLinks(ui.host), 0);
    assert.equal(ui.host.textContent.includes('Unduh PDF'), false);
  } finally { ui.unmount(); restore(); }
});

test('NO NEW COPY: the floor delivery differs from the ready one by the PDF link alone', async () => {
  let restore = stub('gemini');
  let ui = await mount();
  const ready = ui.host.textContent;
  ui.unmount(); restore();
  restore = stub('module_assembly');
  ui = await mount();
  const floor = ui.host.textContent;
  ui.unmount(); restore();
  // The button's own text node is " Unduh PDF" (icon, space, label).
  assert.ok(ready.includes(' Unduh PDF'), 'precondition: the ready delivery carries the link text');
  assert.equal(ready.replace(' Unduh PDF', ''), floor);
});
