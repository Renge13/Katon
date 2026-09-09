// ============================================================
// tests/pasangan-report-states.spec.mjs — seven states, one fixture each
// ============================================================
// Y-2 commit 3, ruling 4: "Report page has exactly seven states: not found,
// unpaid/resume, pending payment, rendering (skeleton), ready, floor-served,
// error. None removed." The prompt's own test instruction: "one fixture per
// state from the REAL response shapes; each state renders its strings and never
// another state's; no state renders B's birth."
//
// ── THE "NEVER ANOTHER STATE'S STRINGS" HALF IS THE POINT ──
// Every defect this rewrite fixes was a state wearing another state's clothes.
// `pending_title` ("Menunggu Konfirmasi Pembayaran") stood over a reader who had
// already paid and was waiting on PROSE - two branches reaching for one slot. A
// dropped connection rendered the UNPAID product block, offering to sell a
// reading to someone who already owned one. Asserting what a state does NOT say
// is what catches that class, and it is why every case below checks both.
//
// ── B'S BIRTH DATE IS THE ONE EXCEPTION, AND IT IS DELIBERATE ──
// The prompt says "no state renders B's birth". That was written before
// Addendum 2 item 1, which puts BOTH birth dates in the report header on
// purpose: the buyer typed them and needs to confirm the reading is about the
// right two people. So the rule is narrowed here rather than dropped, and the
// narrowing is asserted: the header is the ONLY place, it is behind the paywall,
// and no UNPAID state carries either date. See THE UNPAID STATES SHOW NO BIRTH.

import test from 'node:test';
import assert from 'node:assert/strict';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import PasanganReport from '../components/PasanganReport.jsx';
import { viewFor, VIEWS, READY_VIEWS } from '../lib/pair/reportView.js';
import { CHROME_COPY, PASANGAN_COPY } from '../lib/site/copy.js';

const A_DATE = '1989-09-13';
const B_DATE = '1990-03-04';

/** The `GET /api/pair/<id>/reading` body, in the shape serveReading returns. */
const READING = (served_from = 'render') => ({
  status: 'paid',
  served_from,
  pair: { a: { date: A_DATE, gender: 'male' }, b: { date: B_DATE, gender: 'female' } },
  facts: { a: {}, b: {}, pattern: 'Pola Kontras', quadrant: 'Tarikan Tenang, Ritme Bergesek' },
  names: {
    p1_stem_relation: 'Inti Menghidupi',
    p2_day_pair: 'Kursi Berbenturan',
    p3_supply: 'Penyeimbang Unsur',
    p4_temperament: 'Pola Kontras',
    p5_pull_fit: 'Tarikan Tenang, Ritme Bergesek',
  },
  reading: {
    blocks: [
      { fact_ids: ['p0_opening'], heading: 'Model Heading Nol', text: 'Paragraf pembuka.' },
      { fact_ids: ['p1_stem_relation'], heading: 'Model Heading Satu', text: 'Paragraf satu.' },
      { fact_ids: ['p2_day_pair'], heading: 'Model Heading Dua', text: 'Paragraf dua.' },
      { fact_ids: ['p3_supply'], heading: 'Model Heading Tiga', text: 'Paragraf tiga.' },
      { fact_ids: ['p4_temperament'], heading: 'Model Heading Empat', text: 'Paragraf empat.' },
      { fact_ids: ['p5_pull_fit'], heading: 'Model Heading Lima', text: 'Paragraf lima.' },
    ],
    penutup: 'Penutupnya.',
  },
});

/**
 * Stub both endpoints for one state.
 *
 * `ok`/`status` are set the way a real `Response` sets them, because the
 * component now distinguishes a transport failure from a 404 BODY and a stub
 * that omits them cannot express the difference.
 */
function stub({ pair, reading = null, pairThrows = false, pairStatus = 200 }) {
  const prev = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u.endsWith('/reading')) {
      return { ok: true, status: 200, json: async () => reading };
    }
    if (pairThrows) throw new TypeError('network');
    return { ok: pairStatus < 400, status: pairStatus, json: async () => pair };
  };
  return () => { globalThis.fetch = prev; };
}

async function mount({ search = '', ...props } = {}) {
  // `?bayar=` is read from `window.location.search`, not from a prop, because it
  // is a REDIRECT hint the payment provider puts in the URL. Driven the same way
  // here rather than adding a test-only prop to the component.
  window.history.replaceState(null, '', `/kompatibilitas/p1${search}`);
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(React.createElement(PasanganReport, { id: 'p1', ...props })); });
  await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
  return {
    host,
    text: () => host.textContent || '',
    unmount: () => { act(() => root.unmount()); host.remove(); },
  };
}

// Every reader-facing string a state could show, so "never another state's" can
// be checked as a set difference rather than by remembering to list them.
const ALL_STRINGS = {
  notfound: PASANGAN_COPY.notfound_title,
  unpaid: PASANGAN_COPY.unpaid_resume,
  pending: PASANGAN_COPY.pending_title,
  rendering: CHROME_COPY.rendering_title,
  error: CHROME_COPY.error_title,
  link_keep: PASANGAN_COPY.link_keep,
};

function assertOnly(ui, ...keys) {
  const text = ui.text();
  for (const [k, v] of Object.entries(ALL_STRINGS)) {
    const want = keys.includes(k);
    assert.equal(text.includes(v), want,
      `expected ${want ? 'to see' : 'NOT to see'} "${v}" in the ${keys[0]} state`);
  }
}

// ── THE STATE MACHINE, WITHOUT MOUNTING ────────────────────

test('SEVEN STATES, AND THE PRIORITY ORDER IS THE POINT', () => {
  assert.equal(VIEWS.length, 7);
  const base = { pair: null, reading: null, failed: false, justPaid: false, mockPay: false, exhausted: false };

  assert.equal(viewFor({ ...base, pair: { error: 'not_found' } }), 'not_found');
  assert.equal(viewFor({ ...base, pair: { status: 'unpaid' } }), 'unpaid');
  assert.equal(viewFor({ ...base, pair: { status: 'unpaid' }, justPaid: true }), 'pending_payment');
  assert.equal(viewFor({ ...base, pair: { status: 'unpaid' }, mockPay: true }), 'pending_payment');
  assert.equal(viewFor({ ...base, pair: { status: 'paid' } }), 'rendering');
  assert.equal(viewFor({ ...base, pair: { status: 'paid' }, reading: READING('render') }), 'ready');
  assert.equal(viewFor({ ...base, pair: { status: 'paid' }, reading: READING('cache') }), 'ready');
  assert.equal(viewFor({ ...base, pair: { status: 'paid' }, reading: READING('floor') }), 'floor');

  // ── A DROPPED CONNECTION MUST NOT READ AS "UNPAID" ─────────
  // This is the defect the priority order exists for. A failed fetch leaves
  // `pair` null; without `error` first, null falls through to `unpaid` and the
  // page offers to sell a reading to someone who already owns one.
  assert.equal(viewFor({ ...base, failed: true }), 'error');
  assert.equal(viewFor({ ...base, pair: { status: 'paid' }, reading: READING(), failed: true }), 'error',
    'a failure outranks even a reading in hand');
  assert.equal(viewFor({ ...base, pair: { status: 'unpaid' }, justPaid: true, exhausted: true }), 'error',
    'a poll that ran out is an error, not a permanent skeleton');

  assert.deepEqual([...READY_VIEWS].sort(), ['floor', 'ready']);
});

// ── ONE FIXTURE PER STATE ──────────────────────────────────

test('NOT FOUND says so, and nothing else', async () => {
  const restore = stub({ pair: { error: 'not_found' }, pairStatus: 404 });
  const ui = await mount();
  try {
    assertOnly(ui, 'notfound');
    assert.ok(ui.text().includes(CHROME_COPY.home_link), 'a 404 is not a dead end');
  } finally { ui.unmount(); restore(); }
});

test('UNPAID offers the purchase, and never a waiting message', async () => {
  const restore = stub({ pair: { status: 'unpaid', sku: 'compat', price: 39000 } });
  const ui = await mount();
  try {
    assertOnly(ui, 'unpaid');
  } finally { ui.unmount(); restore(); }
});

test('PENDING PAYMENT waits on the WEBHOOK, and says the payment words', async () => {
  const restore = stub({ pair: { status: 'unpaid' } });
  const ui = await mount({ search: '?bayar=selesai' });
  try {
    assertOnly(ui, 'pending');
    assert.ok(ui.host.querySelector('[aria-busy="true"]'), 'the skeleton is up, not a blank page');
  } finally { ui.unmount(); restore(); }
});

test('RENDERING waits on the PROSE, and must not say the payment words', async () => {
  // ── THE DEFECT THIS ASSERTION IS FOR ───────────────────────
  // The row says paid and the prose has not arrived. This rendered
  // `pending_title` - "Menunggu Konfirmasi Pembayaran" - to a reader whose money
  // had already been taken and whose row already said so. Two waits, one label,
  // because two branches reached for the same slot.
  const restore = stub({ pair: { status: 'paid' }, reading: { status: 'rendering' } });
  const ui = await mount();
  try {
    assertOnly(ui, 'rendering');
    assert.ok(ui.host.querySelector('[aria-busy="true"]'), 'the report\'s own shape, greyed');
  } finally { ui.unmount(); restore(); }
});

test('ERROR is reachable from a dead network, and is never a dead end', async () => {
  const restore = stub({ pair: null, pairThrows: true });
  const ui = await mount();
  try {
    assertOnly(ui, 'error');
    assert.ok(ui.text().includes(CHROME_COPY.error_body));
    // The page URL is her ONLY access, so an apology she cannot quote is useless.
    assert.ok(/\/kompatibilitas\/p1/u.test(ui.text()), 'the error view shows the page URL');
    assert.ok(ui.text().includes(CHROME_COPY.home_link));
  } finally { ui.unmount(); restore(); }
});

test('A 500 IS AN ERROR AND A 404 IS NOT', async () => {
  // The distinction the `ok === false && status !== 404` check exists to make.
  const restore = stub({ pair: { error: 'boom' }, pairStatus: 500 });
  const ui = await mount();
  try { assertOnly(ui, 'error'); } finally { ui.unmount(); restore(); }
});

// ── READY, AND FLOOR, WHICH IS READY ───────────────────────

test('READY opens with the title and the two births, from facts', async () => {
  const restore = stub({ pair: { status: 'paid' }, reading: READING('render') });
  const ui = await mount();
  try {
    const text = ui.text();
    assert.ok(text.includes(PASANGAN_COPY.page_title), 'the report opens with the page title');
    // Addendum 2 item 1: long-form dates, gender words as the form shows them.
    assert.ok(text.includes('Laki-laki, 13 September 1989 dan Perempuan, 4 Maret 1990'),
      `the pair line is missing from: ${text.slice(0, 300)}`);
    // The dropped slot must not come back.
    assert.equal(text.includes('Bacaan Kalian Sudah Siap'), false);
    assertOnly(ui, 'ready', 'link_keep');
  } finally { ui.unmount(); restore(); }
});

test('EVERY BLOCK CARRIES A SECTION LABEL AND A GLOSSARY NAME, AND NO MODEL HEADING', async () => {
  // Addendum 2 item 2. The stutter Reyner saw was `Pola Kontras` appearing as
  // the eyebrow, the glossary name AND the model's heading within three lines.
  const restore = stub({ pair: { status: 'paid' }, reading: READING('render') });
  const ui = await mount();
  try {
    const text = ui.text();
    for (const slot of ['section_core', 'section_seat', 'section_element', 'section_pattern', 'section_rhythm']) {
      assert.ok(text.includes(PASANGAN_COPY[slot]), `${slot} is missing`);
    }
    for (const name of ['Inti Menghidupi', 'Kursi Berbenturan', 'Penyeimbang Unsur', 'Pola Kontras']) {
      assert.ok(text.includes(name), `the glossary name "${name}" is missing`);
    }
    // NOT ONE model heading, including the P0 block which has no section mapping
    // at all - that is the block `modelHeadings={false}` exists for.
    for (let i = 0; i <= 5; i++) {
      assert.equal(text.includes(`Model Heading ${['Nol', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima'][i]}`), false,
        `a model-written heading reached the report (block ${i})`);
    }
    // ── AND NEVER THE SAME WORDS TWICE ────────────────────────
    // `section_element` and `p3_supplies.name_id` are BOTH "Penyeimbang Unsur",
    // so P3 said it as an eyebrow and again as a headline one line below. That is
    // the stutter this addendum removes, in miniature.
    const dup = text.split(PASANGAN_COPY.section_element).length - 1;
    assert.equal(dup, 1,
      `"${PASANGAN_COPY.section_element}" appears ${dup} times; a block must not say its own label twice`);

    // And the prose itself is all there - suppressing headings must not suppress
    // the paragraphs under them.
    for (const p of ['Paragraf pembuka.', 'Paragraf lima.', 'Penutupnya.']) {
      assert.ok(text.includes(p), `${p} is missing`);
    }
  } finally { ui.unmount(); restore(); }
});

test('FLOOR RENDERS BYTE-IDENTICALLY TO A RENDER', async () => {
  // Rule 15: the floor is Reyner's own ruled glossary prose, not a degraded
  // mode. The two are the same component with the same props, so the markup is
  // the comparison - a marker, a class, a badge would all show up here.
  const r1 = stub({ pair: { status: 'paid' }, reading: READING('render') });
  const a = await mount();
  const htmlA = a.host.innerHTML;
  a.unmount(); r1();

  const r2 = stub({ pair: { status: 'paid' }, reading: READING('floor') });
  const b = await mount();
  const htmlB = b.host.innerHTML;
  b.unmount(); r2();

  assert.equal(htmlA, htmlB, 'a floor-served report must be indistinguishable from a rendered one');
});

// ── THE BIRTH-DATA RULE, NARROWED AND PINNED ───────────────

test('THE UNPAID STATES SHOW NO BIRTH DATE AT ALL', async () => {
  // The prompt's "no state renders B's birth" survives everywhere it still
  // applies. Addendum 2 item 1 puts both dates in the PAID header on purpose;
  // nothing before payment carries either.
  for (const [label, s] of [
    ['not_found', { pair: { error: 'not_found' }, pairStatus: 404 }],
    ['unpaid', { pair: { status: 'unpaid', price: 39000 } }],
    ['rendering', { pair: { status: 'paid' }, reading: { status: 'rendering' } }],
  ]) {
    const restore = stub(s);
    const ui = await mount();
    try {
      const text = ui.text();
      for (const d of ['1989', '1990', 'September', 'Maret']) {
        assert.equal(text.includes(d), false, `the ${label} state leaked "${d}"`);
      }
    } finally { ui.unmount(); restore(); }
  }
});

// ── THE FIRST FRAME (Addendum 2 item 3) ────────────────────

test('THE SKELETON IS UP BEFORE THE FIRST FETCH RESOLVES, NOT A BLANK PAGE', async () => {
  // ── THE DEFECT, IN THE PROMPT'S OWN WORDS ──────────────────
  // "the report route mounts with the skeleton immediately. 5-8 s of blank page
  // is a defect, assert against it (a rendered skeleton within one frame of
  // navigation)." It rendered `null` until both fetches came back, so after a
  // checkout redirect - the worst possible moment - she looked at an empty
  // screen with a footer under it.
  //
  // THE FETCH IS HELD OPEN, which is what makes "before it resolves" a real
  // moment rather than a race this test happens to win.
  let release;
  const held = new Promise((r) => { release = r; });
  const prev = globalThis.fetch;
  globalThis.fetch = async (url) => {
    await held;
    return { ok: true, status: 200, json: async () => ({ status: 'unpaid' }) };
  };

  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    // ONE act, no timers: this is the mount frame and nothing has resolved.
    await act(async () => { root.render(React.createElement(PasanganReport, { id: 'p1' })); });

    assert.ok(host.querySelector('[aria-busy="true"]'),
      'the first frame must carry the skeleton, not an empty page');
    assert.ok((host.textContent || '').trim().length === 0,
      'and no copy: nothing is known yet, so the page must not guess which state it is in');

    release();
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
    // And it does resolve into a real state rather than sitting on the skeleton.
    assert.ok((host.textContent || '').includes(PASANGAN_COPY.unpaid_resume));
  } finally {
    act(() => root.unmount()); host.remove(); globalThis.fetch = prev;
  }
});
