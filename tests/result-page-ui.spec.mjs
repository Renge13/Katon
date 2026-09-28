// ============================================================
// tests/result-page-ui.spec.mjs — the mirror result page, Prompt AQ
// ============================================================
// Run: npm run test:result-page-ui
//
// Reyner's four notes of 2026-09-28, after reading production reading
// `smewTNtzNaoQmWysi6mYU`. Each item is asserted off the RENDERED DOM of the real
// `Reading` component, the thing a reader sees, never off a style object.
//
//   §1  gender and birth date under the archetype header, in the card footer's
//       exact format, and ONLY when the session holds them
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { mirrorChartView } from '../lib/mirror/view.js';
import { Reading } from '../components/Funnel.jsx';

const chart = calculateBaziChart({ birthDate: '2001-02-14', birthTime: null });
const CHART_VIEW = mirrorChartView(chart, buildSemanticJson(chart));

/** A served reading as the re-access route holds it: no birth date, no gender. */
const SERVED = {
  token: 't',
  chart: CHART_VIEW,
  blocks: [{ heading: 'Inti dirimu', paragraphs: ['Paragraf satu.'] }],
  penutup: '',
  pending: false,
  card: null,
};

/** The same reading as the session that created it holds it (Funnel#createReading). */
const IN_SESSION = { ...SERVED, birthDate: '2001-02-14', gender: 'female' };

/** Any fetch answers `{}`; the page's counters are fire-and-forget. */
function stubFetch() {
  const prev = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), body: init?.body ? JSON.parse(init.body) : null });
    return { ok: true, status: 200, json: async () => ({}) };
  };
  return { calls, restore: () => { globalThis.fetch = prev; } };
}

async function mount(reading) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(React.createElement(Reading, { reading, onReset() {}, salesOpen: false })); });
  return {
    host,
    text: () => host.textContent || '',
    unmount: () => { act(() => root.unmount()); host.remove(); },
  };
}

// ── §1. GENDER AND BIRTH DATE IN THE HEADER ────────────────

test('§1 PRECONDITION: the header renders the archetype this line sits under', async () => {
  const f = stubFetch();
  const m = await mount(SERVED);
  try {
    assert.ok(CHART_VIEW.archetype?.name_id, 'the fixture chart has an archetype');
    assert.ok(m.text().includes(CHART_VIEW.archetype.name_id));
  } finally { m.unmount(); f.restore(); }
});

test('§1 IN SESSION: the header carries the card footer line, "PEREMPUAN | 14 Feb 2001", uppercased', async () => {
  const f = stubFetch();
  const m = await mount(IN_SESSION);
  try {
    const line = m.host.querySelector('[data-profile-line]');
    assert.ok(line, 'the profile line renders when the session holds a date and a gender');
    // The card's own words and separator (mergeFooter), and the card's own case
    // rule: the footer is uppercased by CSS, not by the string.
    assert.equal(line.textContent, 'PEREMPUAN | 14 Feb 2001');
    assert.equal(line.style.textTransform, 'uppercase');
  } finally { m.unmount(); f.restore(); }
});

test('§1 IN SESSION, no gender: the date alone, with no separator', async () => {
  const f = stubFetch();
  const m = await mount({ ...IN_SESSION, gender: null });
  try {
    const line = m.host.querySelector('[data-profile-line]');
    assert.ok(line);
    assert.equal(line.textContent, '14 Feb 2001');
  } finally { m.unmount(); f.restore(); }
});

// A GUARD, NOT A RED-FIRST ASSERTION: it passes before the change too, because
// before the change nothing rendered at all. It is here so the line cannot come
// back as an empty row or a bare " | " on a shared link.
test('§1 RE-ACCESS: no date, no gender -> no line, no empty row, no stray separator', async () => {
  const f = stubFetch();
  const m = await mount(SERVED);
  try {
    assert.equal(m.host.querySelector('[data-profile-line]'), null);
    assert.equal(m.text().includes(' | '), false, 'no bare separator anywhere on the page');
  } finally { m.unmount(); f.restore(); }
});

// ── §2. THE UPCOMING BLOCK IS GONE ─────────────────────────
// Its eyebrow, its lead, the Setahun ke Depan card and the interest link, by the
// words a reader saw. Literals on purpose: the copy bank they came from is deleted
// in the same commit, so importing it would make this test unable to run.
const UPCOMING_WORDS = [
  'Yang sedang dikerjakan',
  'Dua bacaan ini belum dijual',
  'Setahun ke Depan',
  'Beri tahu saya kalau sudah siap',
];

test('§2 THE PAGE NO LONGER RENDERS THE UPCOMING BLOCK', async () => {
  const f = stubFetch();
  const m = await mount(IN_SESSION);
  try {
    for (const w of UPCOMING_WORDS) {
      assert.equal(m.text().includes(w), false, `"${w}" is still on the result page`);
    }
  } finally { m.unmount(); f.restore(); }
});

test('§2 AND IT NO LONGER FIRES upcoming_seen - a counter for a block nobody can see', async () => {
  // jsdom has no IntersectionObserver, so the old block fired on mount. That makes
  // this a real red on the old build rather than a wait for a scroll.
  const f = stubFetch();
  const m = await mount(IN_SESSION);
  try {
    await act(async () => {});
    const fired = f.calls.filter((c) => c.body?.event === 'upcoming_seen');
    assert.equal(fired.length, 0, 'upcoming_seen was posted');
  } finally { m.unmount(); f.restore(); }
});

// ── §3. THE BACK LINK AND THE EYEBROW HAVE ROOM ────────────
// The step is the page's own: the one between the persona block and the first
// divider (ProseBlocks' first Section, marginTop 34). Asserted as EQUAL to that
// rendered value rather than as a typed 34, so the two cannot drift apart.
test('§3 "Ganti tanggal" sits one persona step above "Refleksimu"', async () => {
  const f = stubFetch();
  const m = await mount(IN_SESSION);
  try {
    const back = [...m.host.querySelectorAll('button')].find((b) => b.textContent.includes('Ganti tanggal'));
    assert.ok(back, 'the back link renders');
    const firstDivider = [...m.host.querySelectorAll('div')].find((d) => d.style.borderTop && d.style.marginTop);
    assert.ok(firstDivider, 'the first divider renders');
    assert.equal(firstDivider.style.marginTop, '34px', 'precondition: the persona step is still 34');
    assert.equal(back.style.marginBottom, firstDivider.style.marginTop);
  } finally { m.unmount(); f.restore(); }
});

// ── §4. THE BRACKETED ENGLISH GLOSS IS ITALIC ──────────────
// Detection is the glossary's own `name_en` set (lib/render/glossNames.js), and the
// names reach the client through the root layout's provider. Mounted here inside
// that same provider, with the same list the layout passes.
import { GlossNamesProvider } from '../components/GlossNames.jsx';
import { GLOSS_NAMES_EN } from '../lib/render/glossNames.js';
import { ProseBlocks } from '../components/ProseBlocks.jsx';

const GLOSS_TEXT = 'Kamu adalah Gunung (The Mountain) yang tenang. Ada Aspek Tujuh Pembunuh (Seven Killings) di Pilar Kerja, dan satu (catatan kecil) yang bukan istilah.';
const GLOSS_PENUTUP = 'Di pilar itu ada Tanda Kekosongan (Void).';

async function mountProse(reading, { provider = true } = {}) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  const inner = React.createElement(ProseBlocks, { reading });
  const el = provider ? React.createElement(GlossNamesProvider, { names: GLOSS_NAMES_EN }, inner) : inner;
  await act(async () => { root.render(el); });
  return { host, unmount: () => { act(() => root.unmount()); host.remove(); } };
}

test('§4 PRECONDITION: the glossary supplies the three names this test uses, and not the decoy', () => {
  for (const n of ['The Mountain', 'Seven Killings', 'Void']) assert.ok(GLOSS_NAMES_EN.includes(n), n);
  assert.equal(GLOSS_NAMES_EN.includes('catatan kecil'), false);
});

test('§4 "(The Mountain)" -> an italic node around "The Mountain" and nothing else', async () => {
  const m = await mountProse({ blocks: [{ heading: 'Inti', paragraphs: [GLOSS_TEXT] }], penutup: GLOSS_PENUTUP });
  try {
    const ems = [...m.host.querySelectorAll('em')].map((e) => e.textContent);
    assert.deepEqual(ems, ['The Mountain', 'Seven Killings', 'Void'],
      'only the glossary English is italic, in order, and "(catatan kecil)" is not');
    // The brackets stay upright: each <em> sits between a "(" and a ")" in plain text.
    for (const em of m.host.querySelectorAll('em')) {
      assert.ok(em.previousSibling?.textContent.endsWith('('), `"(" before ${em.textContent} is outside the italic`);
      assert.ok(em.nextSibling?.textContent.startsWith(')'), `")" after ${em.textContent} is outside the italic`);
    }
  } finally { m.unmount(); }
});

test('§4 STYLING ONLY: every paragraph reads back byte-identical to the served string', async () => {
  const m = await mountProse({ blocks: [{ heading: 'Inti', paragraphs: [GLOSS_TEXT] }], penutup: GLOSS_PENUTUP });
  try {
    const ps = [...m.host.querySelectorAll('p')].map((p) => p.textContent);
    assert.deepEqual(ps, [GLOSS_TEXT, GLOSS_PENUTUP]);
  } finally { m.unmount(); }
});

test('§4 THE RESULT PAGE ITSELF italicises the gloss in its prose', async () => {
  const f = stubFetch();
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  const reading = { ...IN_SESSION, blocks: [{ heading: 'Inti dirimu', paragraphs: [GLOSS_TEXT] }] };
  await act(async () => {
    root.render(React.createElement(GlossNamesProvider, { names: GLOSS_NAMES_EN },
      React.createElement(Reading, { reading, onReset() {}, salesOpen: false })));
  });
  try {
    const ems = [...host.querySelectorAll('.k-prose em')].map((e) => e.textContent);
    assert.deepEqual(ems, ['The Mountain', 'Seven Killings']);
  } finally { act(() => root.unmount()); host.remove(); f.restore(); }
});

test('§4 THE ROOT LAYOUT PROVIDES THE GLOSSARY LIST, so production has the names', async () => {
  const { readFileSync } = await import('node:fs');
  const src = readFileSync(new URL('../app/layout.js', import.meta.url), 'utf8');
  assert.match(src, /<GlossNamesProvider names=\{GLOSS_NAMES_EN\}>/u);
  assert.match(src, /from '@\/lib\/render\/glossNames(\.js)?'/u);
});
