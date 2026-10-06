// ============================================================
// tests/result-scroll.spec.mjs — the reading opens at its top, not at the button's offset
// ============================================================
// Run: npm run test:result-scroll
//
// Reyner, 2026-10-07: after "Lihat Refleksiku" the reading opened scrolled to around
// Bagan Kelahiran. createReading (components/Funnel.jsx) swaps to the result phase with
// history.pushState and setPhase('result') and never reset the scroll, so the window kept
// the offset she had at the submit button. The fix scrolls to the top, INSTANTLY, when the
// funnel enters the result phase from the form. Left alone, and asserted here as controls:
// the back-button restore (a mount at /r/<token>) and the "Tambahkan jam lahir" arrival.
// The paid arrival's scroll to #unduh is scrollIntoView inside <Offer>, a different call.
//
// jsdom has no layout and does not implement window.scrollTo, so the call is recorded:
// the assertion is that the funnel ASKED for top 0 with behavior 'instant'.
// ============================================================

import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import Funnel from '../components/Funnel.jsx';
import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { mirrorChartView } from '../lib/mirror/view.js';
import { rememberBirth, forgetBirth } from '../lib/site/carryBirth.js';
import { forgetReading } from '../lib/site/lastReading.js';
import { makeSetField } from './helpers/setField.mjs';

const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
const CHART_VIEW = mirrorChartView(chart, buildSemanticJson(chart));
const SERVED = { token: 'tok1', chart: CHART_VIEW, blocks: [{ heading: 'Inti dirimu', paragraphs: ['Satu.'] }], penutup: '', card: null };

let scrolls;
let prevScrollTo;
let prevFetch;

beforeEach(() => {
  scrolls = [];
  prevScrollTo = window.scrollTo;
  window.scrollTo = (...args) => { scrolls.push(args.length === 1 ? args[0] : { left: args[0], top: args[1] }); };
  globalThis.scrollTo = window.scrollTo;
  prevFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    const u = String(url);
    const ok = (body) => ({ ok: true, status: 200, json: async () => body });
    if (u.includes('/api/season-check')) return ok({ needsHour: false });
    if (u === '/api/mirror' && opts?.method === 'POST') return ok({ token: 'tok1', chart: CHART_VIEW });
    if (u.startsWith('/api/mirror/')) return ok(SERVED);
    return ok({});
  };
  forgetReading();
  forgetBirth();
  window.history.replaceState(null, '', '/');
});

afterEach(() => {
  window.scrollTo = prevScrollTo;
  globalThis.scrollTo = prevScrollTo;
  globalThis.fetch = prevFetch;
  window.history.replaceState(null, '', '/');
});

async function mount() {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(React.createElement(Funnel, { salesOpen: false, compatOpen: false })); });
  return {
    host,
    set: makeSetField(host, act, window),
    settle: () => act(async () => { for (let i = 0; i < 8; i += 1) await new Promise((r) => setTimeout(r, 0)); }),
    unmount: async () => { await act(async () => root.unmount()); host.remove(); },
  };
}

const toTop = () => scrolls.filter((s) => s && s.top === 0);

test('submitting the form opens the reading at its top, instantly', async () => {
  const ui = await mount();
  try {
    ui.set('#mirror-date', '1989-09-13');
    ui.set('#mirror-time', '09:00');
    assert.equal(toTop().length, 0, 'precondition: nothing has scrolled yet');
    await act(async () => {
      ui.host.querySelector('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    });
    await ui.settle();
    assert.equal(window.location.pathname, '/r/tok1', 'the result phase was entered');
    assert.ok(ui.host.textContent.includes('Bagan Kelahiran'), 'the reading is on screen');
    const top = toTop();
    assert.equal(top.length, 1, 'scrolled to the top once on entering the result phase');
    assert.equal(top[0].behavior, 'instant', 'instantly, not smoothly');
    assert.equal(top[0].left, 0);
  } finally { await ui.unmount(); }
});

test('control: the back-button restore (a mount at /r/<token>) does not scroll to the top', async () => {
  window.history.replaceState(null, '', '/r/tok1');
  const ui = await mount();
  try {
    await ui.settle();
    assert.ok(ui.host.textContent.includes('Bagan Kelahiran'), 'precondition: the restored reading is on screen');
    assert.equal(toTop().length, 0);
  } finally { await ui.unmount(); }
});

test('control: the "Tambahkan jam lahir" arrival does not scroll to the top', async () => {
  rememberBirth({ date: '1989-09-13', time: null, gender: 'female' });
  window.history.replaceState(null, '', '/?jam=tambah');
  const ui = await mount();
  try {
    await ui.settle();
    assert.equal(ui.host.querySelector('#mirror-year').value, '1989', 'precondition: the arrival prefilled the form');
    assert.equal(toTop().length, 0);
  } finally { await ui.unmount(); forgetBirth(); }
});
