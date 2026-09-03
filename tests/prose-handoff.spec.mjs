// ============================================================
// tests/prose-handoff.spec.mjs — the space is never empty
// ============================================================
// When `pending` flipped false the skeleton unmounted and the prose mounted in
// ONE React commit, so there was a paint with neither on screen. Measured on the
// real funnel and written up in `docs/qa/2026-09-03-skeleton-to-prose-gap.md`:
//
//     t=197726  skel: 4   proseRisers: 0
//     t=198231  skel: 0   proseRisers: 20     <- one batch, prose at opacity 0
//
// `.k-rise` is `.8s ... both`, so `fill: both` pins the prose at opacity 0 until
// its run begins. Blank, in a space the skeleton had been holding with something
// visible - worse than a plain swap.
//
// ── THE PROPERTY, WHICH IS NOT A TECHNIQUE ─────────────────
// Reyner ruled the requirement rather than the mechanism: **at no frame of the
// transition is that region blank.** The skeleton stays until the prose is
// visibly taking its place. So what is asserted here is the OVERLAP - a step at
// which both are on screen - and not any particular class name or duration.
//
// ── WHY THE MIDDLE STEP IS THE WHOLE TEST ──────────────────
// The prompt is explicit: "a test that only checks the end state passes on the
// defect - today's end state is already correct." Prose renders fine once it
// arrives; the bug lives entirely in the handoff. Every assertion below is
// therefore about the step BETWEEN the two stable states.
//
// ── WHAT jsdom CANNOT SEE, SAID PLAINLY ────────────────────
// `app/globals.css` is never loaded here and jsdom has no layout and no CSS
// animation, so NOTHING in this file measures an opacity, a duration, or a
// pixel. The overlap is asserted STRUCTURALLY: both node sets present in the
// same committed render. The opacity curve that proves the defect was measured
// in a real browser and lives in the QA file above; this suite holds the
// structure that makes the cross-fade possible, and a real-browser check is
// quoted in the commit message.
//
// ── SHOWN RED BEFORE THE CHANGE ────────────────────────────
// Against `0f26a11` - commit 1 landed, and `Reading` exported with a
// `data-prose-skeleton` hook and `PROSE_HANDOFF_MS` defined but NO behaviour, so
// that the red would be about the overlap and not about a missing import:
//
//   ✖ the skeleton is still there on the paint the prose arrives
//     AssertionError [ERR_ASSERTION]: the skeleton must not leave before the
//     prose is visibly taking its place - that paint is the blank one
//       actual: 0,
//       expected: 4,
//   ✖ the region is never empty at any step from pending to prose
//     AssertionError [ERR_ASSERTION]: step 1: the prose region went blank (handoff)
//   ✖ the exiting skeleton is out of flow, so nothing jumps
//   ✖ the stagger is perceptible, not serial
//     AssertionError: the whole stagger must stay under 60ms, got 0.08s
//   ✔ reduced motion swaps instantly, with no overlap and no gap
//   ✔ a reading that never pended renders no skeleton at all
//
// THE TWO GREENS ARE THE POINT AS MUCH AS THE FOUR REDS. Reduced motion was
// already correct and had to stay correct; the never-pended path is the end
// state, and the prompt is explicit that an end-state test passes on the defect.
//
// ONE OF THESE ASSERTIONS PASSED ON THE DEFECT FIRST TIME AND WAS REWRITTEN. See
// `visible()` below: counting any prose node in the DOM reported the blank frame
// as occupied, because the broken build has all five paragraphs mounted at
// opacity 0 and jsdom cannot tell that from readable text.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { mirrorChartView } from '../lib/mirror/view.js';
import { Reading, PROSE_HANDOFF_MS } from '../components/Funnel.jsx';

const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '04:00' });
const CHART_VIEW = mirrorChartView(chart, buildSemanticJson(chart));

// Two blocks with several paragraphs, so the stagger has something to stagger.
const BLOCKS = [
  { heading: 'Inti dirimu', paragraphs: ['Paragraf satu yang cukup panjang.', 'Paragraf dua.', 'Paragraf tiga.'] },
  { heading: 'Caramu bergerak', paragraphs: ['Paragraf empat.', 'Paragraf lima.'] },
];

const PENDING = { token: 't', chart: CHART_VIEW, blocks: [], penutup: '', pending: true, card: null };
const SERVED = { token: 't', chart: CHART_VIEW, blocks: BLOCKS, penutup: 'Penutupnya.', pending: false, card: null };

/**
 * Stub `matchMedia`. jsdom implements it as always-false, which is the full-motion
 * case; the reduced-motion case has to be asked for.
 *
 * IT IS SET BEFORE THE FIRST RENDER, not during: the component reads the
 * preference at the moment the handoff starts, and a media query flipped
 * mid-transition is not a scenario a reader can produce.
 */
function stubMotion(reduce) {
  const prev = window.matchMedia;
  window.matchMedia = (q) => ({
    matches: reduce && /prefers-reduced-motion/.test(q),
    media: q, onchange: null,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {},
  });
  return () => { window.matchMedia = prev; };
}

function mount(reading) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  const render = (r) => act(() => root.render(
    React.createElement(Reading, { reading: r, onReset() {} })));
  render(reading);

  const skeletonBars = () => host.querySelectorAll('.k-skel');
  // The prose is identified by its TEXT, not by a class: a class-based probe
  // would go green the moment someone renamed the reveal wrapper, and the
  // proposition is about what a reader can see, not about markup.
  const proseNodes = () => [...host.querySelectorAll('p')]
    .filter((p) => /^Paragraf /.test(p.textContent || ''));

  return {
    host, render,
    skeletonBars, proseNodes,
    skeletonBox: () => host.querySelector('[data-prose-skeleton]'),
    /**
     * What is VISIBLE in the prose region on this paint.
     *
     * THE PROSE DOES NOT COUNT ON THE HANDOFF PAINT, AND THAT IS THE WHOLE
     * POINT. The first version of this helper counted any prose node in the DOM
     * and it PASSED ON THE DEFECT: the broken build puts all five paragraphs in
     * the document on that paint, at opacity 0, and jsdom - which never loads
     * `app/globals.css` and has no animation - cannot tell that from readable
     * text. An instrument that reports the blank frame as occupied is the exact
     * shape this repo keeps getting burned by.
     *
     * So a prose node counts as visible only once the handoff has SETTLED. Until
     * then the only thing that can hold the space is the skeleton, which has no
     * entrance animation to be invisible during. The opacity curve that justifies
     * this lives in docs/qa/2026-09-03-skeleton-to-prose-gap.md, measured in a
     * real browser; jsdom holds the structure, not the pixels.
     */
    visible: (settled) => skeletonBars().length > 0 || (settled && proseNodes().length > 0),
    /** Let the handoff timer run out. */
    finish: async () => { await act(async () => {
      await new Promise((r) => setTimeout(r, PROSE_HANDOFF_MS + 80)); }); },
    unmount: () => { act(() => root.unmount()); host.remove(); },
  };
}

// ── THE OVERLAP ────────────────────────────────────────────

test('the skeleton is still there on the paint the prose arrives', () => {
  const restore = stubMotion(false);
  const ui = mount(PENDING);
  try {
    assert.equal(ui.skeletonBars().length, 4, 'the skeleton holds the space while pending');
    assert.equal(ui.proseNodes().length, 0, 'no prose yet');

    // THE FLIP. Nothing else happens in between - this is the committed render
    // that used to be the blank one.
    ui.render(SERVED);

    assert.equal(ui.proseNodes().length, 5, 'the prose is on screen');
    assert.equal(ui.skeletonBars().length, 4,
      'the skeleton must not leave before the prose is visibly taking its place '
      + '- that paint is the blank one');
  } finally { ui.unmount(); restore(); }
});

test('the region is never empty at any step from pending to prose', async () => {
  const restore = stubMotion(false);
  const ui = mount(PENDING);
  try {
    const steps = [];
    steps.push({ label: 'pending', visible: ui.visible(false) });
    ui.render(SERVED);
    steps.push({ label: 'handoff', visible: ui.visible(false) });
    await ui.finish();
    steps.push({ label: 'settled', visible: ui.visible(true) });

    steps.forEach((s, i) => assert.equal(s.visible, true,
      `step ${i}: the prose region went blank (${s.label})`));

    // And it does settle - an overlap that never ends is a skeleton pinned over
    // the reading forever, which passes "never blank" and is a worse bug.
    assert.equal(ui.skeletonBars().length, 0, 'the skeleton must eventually go');
    assert.equal(ui.proseNodes().length, 5);
  } finally { ui.unmount(); restore(); }
});

test('the exiting skeleton is out of flow, so nothing jumps', () => {
  const restore = stubMotion(false);
  const ui = mount(PENDING);
  try {
    const inFlow = ui.skeletonBox();
    assert.notEqual(inFlow, null, 'the skeleton box is findable');
    assert.notEqual(inFlow.style.position, 'absolute',
      'while pending it holds real space, in flow');

    ui.render(SERVED);

    // The prose is far taller than four 13px bars. If the departing skeleton were
    // still in flow it would push the whole reading down and then let it snap back
    // when it unmounts - a jump in the middle of the cross-fade.
    assert.equal(ui.skeletonBox().style.position, 'absolute',
      'the departing skeleton must not occupy layout beside the prose');
  } finally { ui.unmount(); restore(); }
});

// ── REDUCED MOTION: THE ONE PATH WITH NO DEFECT ────────────
//
// It is currently the only path that is already correct - `app/globals.css`
// disables `.k-rise` under it, so the prose is at opacity 1 on arrival and there
// is no gap to close. Reyner's constraint: do not regress it into a cross-fade it
// opted out of.

test('reduced motion swaps instantly, with no overlap and no gap', () => {
  const restore = stubMotion(true);
  const ui = mount(PENDING);
  try {
    assert.equal(ui.skeletonBars().length, 4);
    ui.render(SERVED);
    assert.equal(ui.proseNodes().length, 5, 'the prose is there immediately');
    assert.equal(ui.skeletonBars().length, 0,
      'no cross-fade for a reader who asked for no motion');
  } finally { ui.unmount(); restore(); }
});

test('a reading that never pended renders no skeleton at all', () => {
  // The /r/[token] route mounts <Reading> with prose already in hand. It must not
  // flash a skeleton it never needed.
  const restore = stubMotion(false);
  const ui = mount(SERVED);
  try {
    assert.equal(ui.skeletonBars().length, 0);
    assert.equal(ui.proseNodes().length, 5);
  } finally { ui.unmount(); restore(); }
});

// ── THE TWO SOURCES OF ONE DURATION ────────────────────────

test('the unmount timer and the fade-out last exactly as long as each other', async () => {
  // `PROSE_HANDOFF_MS` drives the unmount; `kSkelOut` drives the fade. They are in
  // different files and different languages, which is the shape that drifts in
  // silence: a skeleton that vanishes 40ms early reopens the blank frame, and one
  // that lingers sits on top of readable prose. Neither shows up in a screenshot.
  const { readFileSync } = await import('node:fs');
  const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
  const rule = css.match(/\.k-skel-exit\s*\{[^}]*animation:\s*kSkelOut\s+([\d.]+)s/);
  assert.notEqual(rule, null, '.k-skel-exit must animate kSkelOut with a duration');
  assert.equal(Math.round(parseFloat(rule[1]) * 1000), PROSE_HANDOFF_MS,
    `globals.css says ${rule[1]}s, Funnel.jsx says ${PROSE_HANDOFF_MS}ms`);
});

// ── THE STAGGER ────────────────────────────────────────────

test('the stagger is perceptible, not serial', () => {
  const restore = stubMotion(false);
  const ui = mount(PENDING);
  try {
    ui.render(SERVED);
    const delays = ui.proseNodes()
      .map((p) => parseFloat(p.parentElement.style.animationDelay) || 0);
    assert.ok(delays.some((d) => d > 0), 'the reveal is still staggered, not a snap');
    // Paragraphs trickling in over a quarter-second read as "still loading" after
    // loading has finished, which is the thing being fixed one line up.
    assert.ok(Math.max(...delays) <= 0.06,
      `the whole stagger must stay under 60ms, got ${Math.max(...delays)}s`);
  } finally { ui.unmount(); restore(); }
});
