// ============================================================
// tests/prose-screen.spec.mjs — the report's two screen defects (AB §3)
// ============================================================
// Run: npm run test:prose-screen
//
// Prompt AB §3's last two rows, carried into PR 2 because #126 did not touch
// `components/` (`git diff --stat 378be38^..f9473ec -- components/` is empty).
//
//   paragraph gap   the penutup was set 18/1.6 serif italic against a 15.5/1.75
//                   body, so the reading's last paragraph read as a different
//                   KIND of text. Reyner's name for it: "the paragraph gap".
//   eyebrow alone   `PETA DINAMIKA` printed as an eyebrow with the penutup
//                   directly under it, and a labelled block whose glossary cell
//                   has no name did the same. An eyebrow is a label FOR a
//                   heading; with no heading it is a caption over nothing.
//
// BOTH ARE READ OFF THE RENDERED DOM, from the production-shaped fixture, not
// from the component's style objects - the thing a reader sees.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import { ProseBlocks } from '../components/ProseBlocks.jsx';

const ROOT = path.resolve(import.meta.dirname, '..');
const REAL = JSON.parse(readFileSync(path.join(ROOT, 'tests/fixtures/pair-reading-g4WH4.json'), 'utf8'));

// The fixture carries the production penutup; assert it so a fixture edit that
// drops it cannot turn the paragraph test into a test of nothing.
const READING = REAL.reading;

function render(el) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => root.render(el));
  return { host, unmount: () => { act(() => root.unmount()); host.remove(); } };
}

/**
 * The compat report's shape: every block labelled, ONE of them with a section
 * eyebrow and no glossary name (the p0/p7 case, and the Y-2 empty-names bug),
 * plus the closing eyebrow over the penutup.
 */
const labelFor = (b) => {
  const i = READING.blocks.indexOf(b);
  if (i === 0) return null;
  if (i === 1) return { eyebrow: 'Inti Diri', name: null };
  return { eyebrow: 'Pola Hubungan', name: 'Nama Dari Glosarium' };
};

const report = () => React.createElement(ProseBlocks, {
  reading: READING, labelFor, modelHeadings: false, closeEyebrow: 'Peta Dinamika',
});

test('PRECONDITION: the fixture has a penutup and a block to label', () => {
  assert.ok(READING.penutup && READING.penutup.length > 20);
  assert.ok(READING.blocks.length >= 3);
});

test('EVERY PARAGRAPH IN THE REPORT SHARES ONE SIZE AND ONE LINE HEIGHT', () => {
  const { host, unmount } = render(report());
  try {
    const ps = [...host.querySelectorAll('p')].filter((p) => (p.textContent || '').trim());
    const penutup = ps.find((p) => p.textContent.trim() === READING.penutup.trim());
    assert.ok(penutup, 'the penutup renders as a paragraph');
    const shapes = new Set(ps.map((p) => `${p.style.fontSize}/${p.style.lineHeight}`));
    assert.equal(shapes.size, 1,
      `paragraphs come in ${shapes.size} shapes: ${[...shapes].join(', ')} - the penutup must be body text`);
  } finally { unmount(); }
});

/**
 * Every eyebrow on the page, and the first text-bearing element after it in
 * document order. An eyebrow is identified by its rendered style (uppercase
 * tracking), which is what makes it look like one to a reader.
 */
function eyebrowsAndNext(host) {
  const all = [...host.querySelectorAll('*')];
  const index = new Map(all.map((el, i) => [el, i]));
  // Leaf elements with text, in document order: the things a reader reads.
  const leaves = all.filter((el) => el.children.length === 0 && (el.textContent || '').trim());
  const eyebrows = all.filter((el) => el.style.textTransform === 'uppercase');
  return eyebrows.map((eb) => {
    const at = index.get(eb);
    const next = leaves.find((el) => index.get(el) > at && !eb.contains(el));
    return { eyebrow: eb.textContent, next };
  });
}

test('NO EYEBROW IS FOLLOWED DIRECTLY BY A PARAGRAPH', () => {
  const { host, unmount } = render(report());
  try {
    const pairs = eyebrowsAndNext(host);
    assert.ok(pairs.length > 0, 'precondition: the report renders eyebrows at all');
    for (const { eyebrow, next } of pairs) {
      assert.ok(next, `eyebrow "${eyebrow}" is the last thing on the page`);
      // A boolean, never the element: `assert` diffing a jsdom node exhausts the
      // heap (measured - RangeError on the first draft of this line).
      assert.equal(Boolean(next.closest('p')), false,
        `eyebrow "${eyebrow}" sits directly over a paragraph ("${next.textContent.slice(0, 40)}...")`);
    }
  } finally { unmount(); }
});

test('A HEADINGLESS BLOCK AND THE PENUTUP GET THE EYEBROW\'S WORDS AS THEIR HEADING', () => {
  // The rule's other half: the words are not lost, they are promoted. No new
  // string - the section label and `section_close` are what already rules them.
  const { host, unmount } = render(report());
  try {
    const text = host.textContent;
    assert.ok(text.includes('Inti Diri'), 'the nameless block keeps its section words');
    assert.ok(text.includes('Peta Dinamika'), 'the penutup keeps its section words');
    const eyebrowTexts = eyebrowsAndNext(host).map((x) => x.eyebrow);
    assert.equal(eyebrowTexts.includes('Inti Diri'), false, 'as a heading, not as an eyebrow');
    assert.equal(eyebrowTexts.includes('Peta Dinamika'), false, 'as a heading, not as an eyebrow');
    // And a block WITH a name keeps its two levels, so the test can fail the
    // other way: a fix that deleted every eyebrow would pass the test above.
    assert.ok(eyebrowTexts.includes('Pola Hubungan'), 'a named block keeps its eyebrow');
  } finally { unmount(); }
});
