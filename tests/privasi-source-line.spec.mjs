// ============================================================
// tests/privasi-source-line.spec.mjs — /privasi says the link source is recorded
// ============================================================
// Run: npm run test:privasi-source-line
//
// Prompt BN (Reyner ruled 2026-10-09). Since #213 a reading's `reading_created` and a
// pair's `pair_created` carry the link code, referrer host and landing segment
// (lib/site/linkSource.js). The ruled sentence is appended to `collectNote`, after its
// existing last sentence, one space between. Asserted on the RENDERED page
// (scripts/alias-register.mjs resolves its `@/` imports), not only on the bank, so a page
// that stopped rendering `collectNote` fails here too.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import PrivasiPage from '../app/privasi/page.js';

// Reyner's words, 2026-10-09, verbatim. A literal on purpose: this is the ruled string the
// bank must carry, so it may not be read from the bank it is checking.
const RULED = 'Kami juga mencatat dari tautan atau situs mana kamu datang, bersama bacaanmu, supaya tahu tautan mana yang berguna.';
// The sentence it follows (ruled 2026-10-06, docs/product/compat-rulings-2026-10-02.md).
const BEFORE = 'Kunjungan halaman hanya dihitung secara anonim, tanpa cookie dan tanpa mencatat tautan bacaanmu.';

const text = (html) => html.replace(/<[^>]+>/gu, '');

test('BN: /privasi renders the ruled source sentence, appended to the collect note with one space', () => {
  const html = renderToStaticMarkup(React.createElement(PrivasiPage));
  const paragraphs = [...html.matchAll(/<p\b[^>]*>(.*?)<\/p>/gsu)].map((m) => text(m[1]));
  const note = paragraphs.find((p) => p.includes(BEFORE));
  assert.ok(note, 'precondition: the collect note paragraph is on the page');
  assert.ok(note.endsWith(`${BEFORE} ${RULED}`), `the ruled sentence follows the old last sentence, one space between:\n${note}`);
  assert.equal(text(html).split(RULED).length - 1, 1, 'the sentence appears exactly once on the page');
});

test('BN: the ruled sentence carries keyboard characters only (rule 20)', () => {
  assert.doesNotMatch(RULED, /[–—‘’“”·…]/u);
});
