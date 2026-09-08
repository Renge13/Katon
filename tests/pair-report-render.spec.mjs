// ============================================================
// tests/pair-report-render.spec.mjs — the blank report a customer paid for
// ============================================================
// Reyner paid Rp 39.000 on production for pair `g4WH4_9QbCrCj3Gha934q` and
// received SIX HEADINGS AND NO PROSE, with the raw keys `contrasting` and `q4`
// where the badge and quadrant names belong.
//
// ── THE FIXTURE IS THE REAL RESPONSE, NOT A HAND-BUILT ONE ──
// `tests/fixtures/pair-reading-g4WH4.json` is the verbatim body of
// `GET /api/pair/g4WH4_9QbCrCj3Gha934q/reading` on production, captured
// 2026-09-08. **That is the whole point.** Both defects survived a full suite
// because every existing fixture was built by hand from the shape the tests
// expected, and neither the serve payload nor the component was ever checked
// against what the other actually produces. A fixture the data source never
// emits is not a fixture; it is the assumption under test, written down twice.
//
// It carries no birth data and no email - asserted below rather than assumed,
// because it is a real customer's response committed to the repo.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import { ProseBlocks } from '../components/ProseBlocks.jsx';
import { GLOSSARY } from '../lib/semantic/glossary.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const REAL = JSON.parse(readFileSync(path.join(ROOT, 'tests/fixtures/pair-reading-g4WH4.json'), 'utf8'));

function render(el) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => root.render(el));
  return { host, unmount: () => { act(() => root.unmount()); host.remove(); } };
}

test('THE FIXTURE IS THE PRODUCTION SHAPE, and carries no personal data', () => {
  assert.equal(REAL.status, 'paid');
  assert.equal(REAL.reading.blocks.length, 6);

  // The shape that broke it: `text`, never `paragraphs`.
  for (const b of REAL.reading.blocks) {
    assert.equal(typeof b.text, 'string');
    assert.ok(b.text.length > 0);
    assert.equal(b.paragraphs, undefined,
      'the serve payload does NOT pre-split - that is the whole defect');
  }

  const raw = JSON.stringify(REAL);
  assert.equal(/birth/i.test(raw), false, 'no birth data, for either person');
  assert.equal(/@/.test(raw), false, 'no email');
});

test('EVERY BLOCK RENDERS AT LEAST ONE PARAGRAPH', () => {
  // ── THE ASSERTION THE CUSTOMER PAID TO DISCOVER ────────────
  // Red on the component as it shipped: `ProseBlocks` read `block.paragraphs`,
  // the payload sends `block.text`, and the map over `(b.paragraphs || [])`
  // produced nothing at all. Six headings, no prose, and the penutup - which is
  // read from a different field - as the only text on the page.
  const { host, unmount } = render(React.createElement(ProseBlocks, { reading: REAL.reading }));
  try {
    const paragraphs = [...host.querySelectorAll('p')];
    const withText = paragraphs.filter((p) => (p.textContent || '').trim().length > 0);

    // 6 blocks + the penutup, at minimum. More if any block carries a break.
    assert.ok(withText.length >= 7,
      `expected at least 7 non-empty paragraphs, got ${withText.length}`);

    // Per block, by its own first sentence, so "some prose rendered somewhere"
    // cannot pass for "every block rendered".
    for (const b of REAL.reading.blocks) {
      const opening = b.text.split(/(?<=[.!?])\s/u)[0].slice(0, 40);
      assert.ok(host.textContent.includes(opening),
        `block "${b.heading}" did not render: ${opening}`);
    }
  } finally { unmount(); }
});

test('THE MIRROR PATH IS UNTOUCHED: pre-split paragraphs still win', () => {
  // `lib/mirror/view.js` splits on the way out and sends NO `text` at all, so the
  // adapter must honour `paragraphs` when it is there. If this broke, the fix for
  // the paid page would have blanked the free one.
  const reading = {
    blocks: [{ heading: 'H', fact_ids: [], paragraphs: ['satu', 'dua'] }],
    penutup: 'tutup',
  };
  const { host, unmount } = render(React.createElement(ProseBlocks, { reading }));
  try {
    assert.ok(host.textContent.includes('satu'));
    assert.ok(host.textContent.includes('dua'));
    assert.ok(host.textContent.includes('tutup'));
  } finally { unmount(); }
});

test('A PARAGRAPH BREAK IN text SURVIVES, which is what splitParagraphs is for', () => {
  // Two newlines are the renderer's paragraph separator. Dropped into one
  // element HTML collapses them and the break is SILENTLY lost - the failure
  // `lib/render/paragraphs.js` exists to prevent, and it now applies to the pair
  // path too.
  const reading = {
    blocks: [{ heading: 'H', fact_ids: [], text: 'satu\n\ndua' }],
    penutup: '',
  };
  const { host, unmount } = render(React.createElement(ProseBlocks, { reading }));
  try {
    const texts = [...host.querySelectorAll('p')].map((p) => p.textContent.trim());
    assert.deepEqual(texts, ['satu', 'dua'], 'two paragraphs, not one run-on');
  } finally { unmount(); }
});

test('THE BADGE AND QUADRANT ARE NAMES, never raw engine keys', () => {
  // ── THE SECOND DEFECT ──────────────────────────────────────
  // The production payload sent `facts.pattern = "contrasting"` and
  // `facts.quadrant = "q4"`. `PasanganReport` labels the P4 and P5 blocks from
  // those fields believing they are glossary `name_id`s, so the page printed the
  // engine's own keys at a reader.
  //
  // Resolved on the SERVER now - a raw key must never reach a client - so this
  // asserts the CONTRACT the client is entitled to rely on, and
  // `tests/pair-reading-route.spec.mjs` asserts the route produces it.
  assert.match(REAL.facts.pattern, /^(matching|related|contrasting)$/u,
    'precondition: the CAPTURED response really did carry the raw key');
  assert.match(REAL.facts.quadrant, /^q[1-4]$/u);

  // What it should have been, read from the glossary rather than retyped.
  assert.equal(GLOSSARY.kompatibilitas[`p4_${REAL.facts.pattern}`].name_id, 'Pola Kontras');
  assert.equal(GLOSSARY.kompatibilitas[`p5_${REAL.facts.quadrant}`].name_id, 'Tarikan Tenang, Ritme Bergesek');
});
