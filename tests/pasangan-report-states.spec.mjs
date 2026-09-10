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
import { readFileSync } from 'node:fs';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import PasanganReport from '../components/PasanganReport.jsx';
import { viewFor, VIEWS, READY_VIEWS } from '../lib/pair/reportView.js';
import { CHROME_COPY, PASANGAN_COPY } from '../lib/site/copy.js';
import { projectNames } from '../lib/pair/reportView.js';
import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';

// ── THE NAMES COME FROM A REAL SEMANTIC, NOT FROM THIS FILE ──
// The first version of this spec hand-wrote its `names` map, and that is why it
// passed while the server shipped an empty one for every pair: a fixture invented
// for the shape you expect cannot tell you the shape you get. Built from the
// engine now, through the same projection the route uses.
const REAL_SEMANTIC = buildPairSemantic(
  calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00', gender: 'male' }),
  calculateBaziChart({ birthDate: '1990-03-04', birthTime: '14:00', gender: 'female' }),
);
const REAL_NAMES = projectNames(REAL_SEMANTIC);

/** The real production response, verbatim (pair g4WH4, Y-1). */
const PROD = JSON.parse(readFileSync(new URL('./fixtures/pair-reading-g4WH4.json', import.meta.url), 'utf8'));

const A_DATE = '1989-09-13';
const B_DATE = '1990-03-04';

/** The `GET /api/pair/<id>/reading` body, in the shape serveReading returns. */
const READING = (served_from = 'render') => ({
  status: 'paid',
  served_from,
  pair: { a: { date: A_DATE, gender: 'male' }, b: { date: B_DATE, gender: 'female' } },
  facts: { a: {}, b: {}, pattern: 'Pola Kontras', quadrant: 'Tarikan Tenang, Ritme Bergesek' },
  names: REAL_NAMES,
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
  link_keep: CHROME_COPY.link_keep,
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
    //
    // READ FROM THE FIELD, not from text content: Y-2c item 1 put the URL in an
    // `<input readOnly>`. Left as a text scan this would fail on a page that
    // shows the URL perfectly well, which is a red for the wrong reason.
    const urlField = ui.host.querySelector('input');
    assert.ok(urlField && /\/kompatibilitas\/p1/u.test(urlField.value),
      'the error view shows the page URL');
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
    // FROM THE PROJECTION, NOT FROM LITERALS. This list was hand-written and one
    // of its four names ("Kursi Berbenturan") is not even the name this pair
    // gets - the engine picks `p2_none` -> "Kursi Independen" here. A literal
    // expectation is how the empty projection passed review in the first place.
    for (const [id, name] of Object.entries(REAL_NAMES)) {
      assert.ok(text.includes(name), `the glossary name "${name}" (${id}) is missing`);
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
  globalThis.fetch = async () => {
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

// ── ITEM 3: BOTH LEVELS ON EVERY LABELLED BLOCK ────────────

test('THE NAMES PROJECTION IS NOT EMPTY, AND IT COVERS P1, P2 AND P3', () => {
  // ── THE DEFECT #113 SHIPPED, AND THE ASSERTION THAT MISSED IT ──
  // `serveReading` projected `f.entry?.name_id`. `lib/semantic/facts.js#fact`
  // spreads `contentFrom(entry)` and keeps NO `entry` key, so that expression is
  // undefined for every fact and the projection was `{}` on every pair. P1/P2/P3
  // rendered an eyebrow with no headline; P4/P5 looked fine only because
  // `labelFor` falls back to `facts.pattern`/`facts.quadrant`, which know those
  // two ids and no others.
  //
  // Built from the ENGINE here, not from a literal, because a hand-written
  // fixture is exactly what let the empty projection pass review.
  assert.ok(Object.keys(REAL_NAMES).length >= 5,
    `the projection is near-empty: ${JSON.stringify(REAL_NAMES)}`);
  for (const id of ['p1_stem_relation', 'p2_day_pair', 'p3_supply', 'p4_temperament', 'p5_pull_fit']) {
    assert.equal(typeof REAL_NAMES[id], 'string', `${id} has no name in the projection`);
    assert.ok(REAL_NAMES[id].length > 0);
  }
  // Nameless facts stay ABSENT rather than null: a missing cell must look like
  // an absence, never like a key.
  assert.equal('p0_opening' in REAL_NAMES, false, 'p0 has no name_id and must not be invented one');
});

test('EVERY LABELLED BLOCK OF THE REAL PRODUCTION READING HAS BOTH LEVELS', async () => {
  // The Y-1 production response, verbatim, with the projection the route now
  // sends. Reyner's screenshots of this reading are the evidence for the defect:
  // "INTI DIRI" then prose, "KURSI PASANGAN" then prose, no headline on either.
  const restore = stub({
    pair: { status: 'paid' },
    reading: { ...PROD, names: REAL_NAMES, pair: READING().pair },
  });
  const ui = await mount();
  try {
    const text = ui.text();
    // For each beat that has a section label AND a name, BOTH must be on screen.
    const BEATS = {
      p1_stem_relation: PASANGAN_COPY.section_core,
      p2_day_pair: PASANGAN_COPY.section_seat,
      p3_supply: PASANGAN_COPY.section_element,
      p4_temperament: PASANGAN_COPY.section_pattern,
      p5_pull_fit: PASANGAN_COPY.section_rhythm,
    };
    for (const [id, eyebrow] of Object.entries(BEATS)) {
      assert.ok(text.includes(eyebrow), `${id}: the section eyebrow "${eyebrow}" is missing`);
      assert.ok(text.includes(REAL_NAMES[id]),
        `${id}: the eyebrow is there but the HEADLINE "${REAL_NAMES[id]}" is not - `
        + 'this is the #113 defect, an eyebrow over bare prose');
    }
  } finally { ui.unmount(); restore(); }
});

test('THE CLOSING PARAGRAPH CARRIES section_close, EYEBROW ONLY BY RULING', async () => {
  // ── THE PROMPT'S PROPOSED FIX WOULD NOT HAVE WORKED ────────
  // It says to add a P7 entry to `SECTION_BY_BEAT`. Measured first, as it asks:
  //
  //   fact_ids across the production blocks:
  //     p0_opening p1_stem_relation p2_day_pair p2_reframe p2_palace_frame
  //     p3_supply p4_temperament p5_pull_fit
  //   any p7? false
  //
  // The closing italic paragraph is NOT A BLOCK. It is `reading.penutup`, a
  // separate string with its own render branch, and `SECTION_BY_BEAT` is only
  // ever consulted for blocks. A p7 mapping would have changed nothing.
  //
  // P7 HAS NO GLOSSARY NAME (`p7_*_lead` cells carry `name_id: null`), so this
  // block is eyebrow-only BY RULING and is the one exception to "both levels".
  const restore = stub({
    pair: { status: 'paid' },
    reading: { ...PROD, names: REAL_NAMES, pair: READING().pair },
  });
  const ui = await mount();
  try {
    const text = ui.text();
    assert.ok(text.includes(PASANGAN_COPY.section_close),
      `"${PASANGAN_COPY.section_close}" never renders; the closing paragraph has nothing over it`);
    // And it sits with the penutup, not orphaned somewhere above it.
    const iEyebrow = text.indexOf(PASANGAN_COPY.section_close);
    const iPenutup = text.indexOf(PROD.reading.penutup.slice(0, 40));
    assert.ok(iEyebrow < iPenutup && iPenutup - iEyebrow < 200,
      'section_close must sit directly above the closing paragraph');
  } finally { ui.unmount(); restore(); }
});

test('THE MIRROR PENUTUP STAYS BARE', () => {
  // `ProseBlocks` is shared. The compat report passes the closing eyebrow; the
  // mirror passes nothing and its penutup renders exactly as it did, because Y-2
  // commit 4 is explicit that nothing structural changes in the funnel.
  const src = readFileSync(new URL('../components/Funnel.jsx', import.meta.url), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//gu, '').replace(/^\s*\/\/.*$/gmu, '');
  assert.equal(src.includes('closeEyebrow'), false,
    'the mirror must not pass a closing eyebrow');
});

// ── ITEM 4: THE EYEBROW AND THE NAME ARE DIFFERENT WORDS NOW ──

test('section_element IS `Keseimbangan Unsur`, AND P3 SHOWS BOTH LEVELS', async () => {
  // ── AMENDMENT f, AND WHY THE SUPPRESSION IS GONE WITH IT ───
  // The ruled eyebrow used to be "Penyeimbang Unsur", the same words as
  // `p3_supplies.name_id`, so P3 said it twice one line apart. #113 suppressed
  // the exact duplicate in `labelFor`. Reyner changed the eyebrow instead, so
  // the CAUSE is gone - and a suppression with no cause is the next mystery, so
  // it comes out in this commit.
  assert.equal(PASANGAN_COPY.section_element, 'Keseimbangan Unsur');
  assert.notEqual(PASANGAN_COPY.section_element, REAL_NAMES.p3_supply,
    'the eyebrow and the P3 name must be different words; that is what amendment f is for');

  const restore = stub({
    pair: { status: 'paid' },
    reading: { ...PROD, names: REAL_NAMES, pair: READING().pair },
  });
  const ui = await mount();
  try {
    const text = ui.text();
    assert.ok(text.includes('Keseimbangan Unsur'), 'the ruled eyebrow');
    assert.ok(text.includes(REAL_NAMES.p3_supply),
      `the P3 headline "${REAL_NAMES.p3_supply}" must render beside it, not be suppressed`);
  } finally { ui.unmount(); restore(); }
});

test('THE DUPLICATE SUPPRESSION IS GONE FROM labelFor', () => {
  // Asserted on the source because the behaviour it removed is now unreachable:
  // with different words there is no duplicate left to suppress, so no rendered
  // output distinguishes "suppression removed" from "suppression present". That
  // is exactly when a source assertion is the honest one - and it is why this is
  // a separate test from the rendering one above rather than a line inside it.
  const src = readFileSync(new URL('../components/PasanganReport.jsx', import.meta.url), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//gu, '').replace(/^\s*\/\/.*$/gmu, '');
  assert.equal(src.includes('name === eyebrow'), false,
    'the duplicate suppression outlived its cause (amendment f gave P3 different words)');
});
