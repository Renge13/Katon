// ============================================================
// tests/stagger-cadence.spec.mjs — the reading's stagger, and the global it must not touch
// ============================================================
// Run: npm run test:stagger  (needs --import ./scripts/jsx-register.mjs for jsdom)
//
// Reyner, 2026-09-04: the 0/60/100/140ms persona sequence "is technically working
// but visually reads as one fade... I'd target roughly 350-450ms total stagger
// across the persona block. Something like 0/120/240/360ms. Keep the individual
// reveal itself relatively quick."
//
// ── WHAT THIS FILE CAN AND CANNOT SEE, STATED FIRST ────────
// **jsdom LOADS NO STYLESHEET, so it cannot compute `animation-duration` at all.**
// `app/globals.css` is never applied here. Any assertion in this file claiming to
// have verified 450ms in jsdom would be false, and would be the
// instrument-that-cannot-fail shape CLAUDE.md's card-check convention exists for.
//
// So the work is split honestly:
//
//   IN THIS FILE  the DELAYS, which `Reveal` sets as an INLINE style
//                 (components/kit.jsx:53), so they are real rendered DOM; the
//                 `--k-rise-dur` custom property, also inline on the reading
//                 root; and the one `globals.css` text assertion that links the
//                 property to a duration at all.
//   IN A BROWSER  the COMPUTED `animation-duration`, because only a browser
//                 applies the cascade. Runs recorded below.
//
// ── THE BROWSER RUNS, RED THEN GREEN ───────────────────────
// RED, against production (which was pre-PR1 `main`, 1118d58), reading screen:
//
//     persona delays  0s / 0.06s / 0.1s / 0.14s
//     durations       ["0.8s"]  (all 27 .k-rise nodes)
//     --k-rise-dur    (unset)
//     HOME            0s / 0.08s / 0.14s / 0.22s / 0.3s, all 0.8s
//
// GREEN, against a LOCAL DEV BUILD of this branch (`npm run dev`, real browser,
// real stylesheet), reading screen:
//
//     --k-rise-dur    .45s   (on the reading root)
//     persona         0s / 0.12s / 0.24s / 0.36s, all 0.45s
//     Bagan           0s / 0.12s / 0.24s,         all 0.45s
//     reading         one distinct duration across all 27 nodes: ["0.45s"]
//     HOME            0s / 0.08s / 0.14s / 0.22s / 0.3s, all 0.8s
//
// The block therefore ends at 360 + 450 = 810ms, against today's 940ms.
//
// **WHY LOCAL DEV AND NOT THE DEPLOY PREVIEW, which is what this header first
// claimed:** the branch preview is behind Vercel Authentication and redirects to
// a login, so it cannot be read from here. Local dev is a different BUILD but the
// same cascade, which is the only thing these assertions are about. **The
// production-build confirmation is Reyner's own walk on the preview**, and it is
// not claimed here. Corrected rather than left standing, because a run cited
// against the wrong artifact is the citation failure this repo has already paid
// for once (`docs/qa/2026-09-03-submit-to-chart.md`, quoted as production).
//
// ── THE PROPOSITIONS ───────────────────────────────────────
//   1. The persona block is 0/120/240/360ms.
//   2. The Bagan block is 0/120/240ms, matching it. Two stagger rhythms inside
//      one scroll is the defect this alignment prevents.
//   3. The reading root sets --k-rise-dur to .45s.
//   4. `.k-rise` reads that property with a .8s FALLBACK, and carries no literal
//      duration of its own. This is what makes proposition 5 true by construction
//      rather than by coincidence.
//   5. THE HOME SCREEN IS UNCHANGED, and does NOT set --k-rise-dur. This is the
//      accidental-global-edit catch and it is the assertion most likely to be
//      left out - `.k-rise` is used on Home (:418-516) and the season screen
//      (:546-645) as well as the reading.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { mirrorChartView } from '../lib/mirror/view.js';
import Funnel from '../components/Funnel.jsx';

const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '04:00' });
const CHART_VIEW = mirrorChartView(chart, buildSemanticJson(chart));

function stubFetch() {
  const prev = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    const u = String(url);
    if (u.includes('/api/season-check')) return { json: async () => ({ needsHour: false }) };
    if (u === '/api/mirror' && opts?.method === 'POST') {
      return { json: async () => ({ token: 'tok1', chart: CHART_VIEW }) };
    }
    if (u.startsWith('/api/mirror/')) {
      if (u.endsWith('/event')) return { json: async () => ({ ok: true }) };
      return { json: async () => ({ token: 'tok1', chart: CHART_VIEW, blocks: [], penutup: '', card: null }) };
    }
    return { json: async () => ({}) };
  };
  return () => { globalThis.fetch = prev; };
}

function mount() {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => root.render(React.createElement(Funnel)));
  return {
    host,
    setField: (sel, value) => act(() => {
      const el = host.querySelector(sel);
      const proto = Object.getPrototypeOf(el);
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
      el.dispatchEvent(new window.Event('input', { bubbles: true }));
    }),
    submit: () => act(() => {
      host.querySelector('form')?.dispatchEvent(
        new window.Event('submit', { bubbles: true, cancelable: true }));
    }),
    settle: async (ms = 5) => { await act(async () => {
      await new Promise((r) => setTimeout(r, ms)); }); },
    unmount: () => { act(() => root.unmount()); host.remove(); },
  };
}

/** Inline animation-delay of every `.k-rise` under a node, in document order. */
const delaysIn = (node) => [...node.querySelectorAll('.k-rise')]
  .map((n) => n.style.animationDelay);

async function readingScreen() {
  const restore = stubFetch();
  const ui = mount();
  ui.setField('input[type="date"]', '1989-09-13');
  ui.setField('input[type="time"]', '04:00');
  ui.submit();
  await ui.settle(20);
  return { ui, restore };
}

// ── 1 and 2: the two blocks, on one cadence ────────────────

test('PROPOSITION 1 and 2: persona is 0/120/240/360ms and Bagan matches at 0/120/240', async () => {
  const { ui, restore } = await readingScreen();
  try {
    const delays = delaysIn(ui.host);
    assert.ok(delays.length > 12, `expected the reading to render; got ${delays.length} .k-rise nodes`);

    // The persona block is the first four Reveals in the reading root.
    assert.deepEqual(delays.slice(0, 4), ['0s', '0.12s', '0.24s', '0.36s'],
      'the persona block must run 0/120/240/360ms');

    // Bagan: located by its own copy rather than by index, so an inserted block
    // above it does not silently repoint this assertion at something else.
    const nodes = [...ui.host.querySelectorAll('.k-rise')];
    const lead = nodes.findIndex((n) => /Empat lapisan energi/.test(n.textContent || ''));
    assert.ok(lead > 0, 'the Bagan Kelahiran block was not found by its copy');
    assert.deepEqual(
      [nodes[lead], nodes[lead + 1], nodes[lead + 2]].map((n) => n.style.animationDelay),
      ['0s', '0.12s', '0.24s'],
      'the Bagan block must share the persona cadence, not run its own',
    );
  } finally { ui.unmount(); restore(); }
});

// ── 3 and 4: the property, and the plumbing that makes it work ──

test('PROPOSITION 3: the reading root scopes --k-rise-dur to .45s', async () => {
  const { ui, restore } = await readingScreen();
  try {
    const root = ui.host.querySelector('.k-fade');
    assert.ok(root, 'the reading root (.k-fade) was not found');
    assert.equal(root.style.getPropertyValue('--k-rise-dur').trim(), '.45s');
  } finally { ui.unmount(); restore(); }
});

test('PROPOSITION 4: .k-rise reads the property and keeps a .8s fallback', () => {
  const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
  const rule = css.split('\n').find((l) => l.startsWith('.k-rise {'));
  assert.ok(rule, '.k-rise rule not found in app/globals.css');

  // The fallback is what keeps Home and the season screen at .8s without either
  // of them mentioning the property. Losing it would silently apply the browser
  // default (0s) to both, i.e. no animation at all.
  assert.match(rule, /var\(--k-rise-dur,\s*\.8s\)/,
    '.k-rise must read var(--k-rise-dur, .8s)');
  assert.doesNotMatch(rule, /animation:\s*kRise\s+\.?\d/,
    '.k-rise must not carry a literal duration - that is the global edit this PR avoids');
});

// ── 5: the screen that must not have moved ─────────────────

test('PROPOSITION 5: Home is untouched and sets no --k-rise-dur', async () => {
  const restore = stubFetch();
  const ui = mount();
  try {
    // No submit: this is the front door as a reader first sees it.
    assert.deepEqual(delaysIn(ui.host), ['0s', '0.08s', '0.14s', '0.22s', '0.3s'],
      'Home\'s stagger is out of scope for this PR and must not have changed');

    for (const n of [ui.host, ...ui.host.querySelectorAll('*')]) {
      const v = n.style?.getPropertyValue?.('--k-rise-dur');
      assert.ok(!v, 'nothing on Home may scope --k-rise-dur; it must inherit the .8s fallback');
    }
  } finally { ui.unmount(); restore(); }
});
