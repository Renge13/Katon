// ============================================================
// tests/pillar-time-labels.spec.mjs — Tahun / Bulan / Hari / Jam above each pillar
// ============================================================
// Run: npm run test:pillar-time-labels
//
// Prompt BL (Reyner ruled 2026-10-08). Readers report "inti diri saya salah": most
// expect it from their birth YEAR (shio), Katon reads it from the DAY stem, and
// nothing on the chart said which pillar comes from which part of the birth.
//
//   1. A small header above each pillar card, outside the box, by the pillar's
//      POSITION (never its array index): Tahun, Bulan, Hari, Jam. The empty
//      no-hour cell (Pilar Arah, "Tambahkan jam lahir") gets Jam too.
//   2. The intro line, verbatim.
//   3. Web Bagan AND the PDF chart page (Complete Edition and each compat person).
//      Pilar Konsepsi, printed only in the PDF, keeps an EMPTY header slot.
//   4. Caption size, read from the card's own eyebrow; sentence case; muted.
//   5. Never wider than its card, one line, and clear of the INTI DIRI pill.
//
// WHAT THIS CAN AND CANNOT SEE. jsdom does no layout, so the web half asserts the
// rendered markup (which header sits over which cell, and its inline style). The
// web pixel half (width at 320 and 375px, the pill clearance) is the browser walk,
// `scripts/bl-pillar-labels-walk.mjs`. The PDF half here IS pixels: it reads the
// drawn content stream for the words and rasterises the page for widths and gaps,
// and it proves that instrument can fail with an oversized header before trusting it.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import { Reading } from '../components/Funnel.jsx';
import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { mirrorChartView } from '../lib/mirror/view.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { buildCompleteEditionPdf, buildPairPdf } from '../lib/pdf/build.js';
import { textBoxes } from '../lib/pdf/inspect.js';
import { rasterPages } from '../lib/pdf/raster.js';
import { PDF_STYLES } from '../lib/pdf/document.js';
import { CHROME_COPY } from '../lib/site/copy.js';

// ── RULED 2026-10-08, VERBATIM ─────────────────────────────
const RULED_LABELS = { year: 'Tahun', month: 'Bulan', day: 'Hari', hour: 'Jam' };
const RULED_INTRO = 'Empat pilar dari tahun, bulan, hari, dan jam lahirmu. Inti dirimu dibaca dari hari lahir.';

const A = { birthDate: '1989-09-13', birthTime: '09:00' };
const B = { birthDate: '1990-03-04', birthTime: '14:00' };
const withHour = calculateBaziChart(A);
const noHour = calculateBaziChart({ birthDate: A.birthDate, birthTime: null });
const viewOf = (c) => mirrorChartView(c, buildSemanticJson(c));
const served = (chart, extra = {}) => ({
  token: 'tok123abc', chart, blocks: [{ heading: 'Inti dirimu', paragraphs: ['Paragraf satu.'] }],
  penutup: '', pending: false, card: null, ...extra,
});
const src = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

async function mount(element) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(element); });
  return { host, unmount: async () => { await act(async () => root.unmount()); host.remove(); } };
}
const stubFetch = () => {
  const prev = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({}) });
  return () => { globalThis.fetch = prev; };
};

// ── THE STRINGS ────────────────────────────────────────────

test('BL §3 + "labels live in one place": the four words and the intro are in CHROME_COPY verbatim', () => {
  assert.deepEqual(CHROME_COPY.pillar_time_labels, RULED_LABELS, 'keyed by position');
  assert.equal(CHROME_COPY.bagan_intro, RULED_INTRO);
  // Read from the bank on both surfaces, never retyped: the web's PillarColumn (kit.jsx,
  // which Funnel's Bagan uses) and the PDF's chart row. The pill is the control: it is
  // read the same way today, so a source grep that cannot see a bank read would fail it.
  for (const f of ['components/kit.jsx', 'lib/pdf/document.js']) {
    assert.match(src(f), /CHROME_COPY\.pillar_time_labels\[position\]/u, `${f} reads the shared labels by position`);
  }
  assert.match(src('components/Funnel.jsx'), /<PillarColumn /u, 'the Bagan builds its cells in PillarColumn');
  // Funnel is checked over its Bagan block only: its birth-time picker has an unrelated
  // `<option>Jam</option>` (the hour select's placeholder, Funnel.jsx's form).
  const funnel = src('components/Funnel.jsx');
  const baganAt = funnel.indexOf('eyebrow="Bagan Kelahiran"');
  const bagan = funnel.slice(baganAt, funnel.indexOf('data-hour-missing', baganAt));
  assert.ok(baganAt > -1 && bagan.includes('<PillarColumn '), 'control: the Bagan block was found');
  for (const [f, s] of [['Funnel.jsx Bagan', bagan], ['components/kit.jsx', src('components/kit.jsx')], ['lib/pdf/document.js', src('lib/pdf/document.js')]]) {
    for (const w of Object.values(RULED_LABELS)) {
      assert.ok(!s.includes(`'${w}'`) && !s.includes(`"${w}"`) && !s.includes(`>${w}<`), `${f} retypes "${w}"`);
    }
  }
  assert.match(src('components/kit.jsx'), /CHROME_COPY\.pillar_core_pill/u, 'control: the pill is read from the bank');
});

// ── THE WEB BAGAN ──────────────────────────────────────────

/** Each grid column: its header, its card, and the card's own eyebrow. */
function columns(host) {
  const cols = [...host.querySelectorAll('[data-pillar-col]')];
  return cols.map((col) => {
    const header = col.querySelector('[data-pillar-time]');
    const card = [...col.children].find((c) => c !== header);
    // The card's eyebrow is its first text row: PILAR AKAR, PILAR ARAH (the empty cell).
    const eyebrow = [...(card?.querySelectorAll('div') || [])].find((d) => d.style.textTransform === 'uppercase' && /^Pilar /u.test(d.textContent));
    return { col, header, card, eyebrow, position: col.getAttribute('data-pillar-col') };
  });
}

/** The palace each position carries, from the view model the Bagan is built from. */
const palaceOf = (view) => Object.fromEntries([
  ...view.pillars.map((p) => [p.position, p.palace]),
  ...(view.missing_pillar ? [[view.missing_pillar.position, view.missing_pillar.palace]] : []),
]);

async function assertBagan(view, where) {
  const restore = stubFetch();
  const ui = await mount(React.createElement(Reading, { reading: served(view, { birthDate: A.birthDate, gender: 'female' }), onReset() {} }));
  try {
    const cols = columns(ui.host);
    const palaces = palaceOf(view);
    assert.equal(cols.length, 4, `${where}: four columns, each with a header`);
    // The grid holds the columns: one per cell, nothing else.
    assert.equal(cols[0].col.parentElement.style.display, 'grid', `${where}: the columns are the grid's cells`);
    assert.equal(cols[0].col.parentElement.children.length, 4, `${where}: four grid cells`);
    for (const c of cols) {
      assert.ok(c.header, `${where}: ${c.position} has a header`);
      // FOR ITS POSITION: the header names the part of the birth the CARD below it is.
      assert.ok(c.card.textContent.includes(palaces[c.position]), `${where}: the ${c.position} column holds ${palaces[c.position]}`);
      assert.equal(c.header.textContent, RULED_LABELS[c.position], `${where}: ${palaces[c.position]} is headed ${RULED_LABELS[c.position]}`);
      // Outside the box, above it.
      assert.equal(c.card.contains(c.header), false, `${where}: the ${c.position} header is outside its card`);
      assert.ok(c.header.compareDocumentPosition(c.card) & window.Node.DOCUMENT_POSITION_FOLLOWING, `${where}: the header comes before its card`);
      // §5: caption size READ FROM the card's eyebrow, sentence case, the muted colour, one line.
      assert.ok(c.eyebrow, `${where}: the ${c.position} card has its eyebrow (control)`);
      assert.equal(c.header.style.fontSize, c.eyebrow.style.fontSize, `${where}: the header is the eyebrow's size`);
      assert.notEqual(c.header.style.textTransform, 'uppercase', `${where}: sentence case`);
      assert.equal(c.header.style.color, 'var(--muted-warm)', `${where}: the muted chart colour`);
      assert.equal(c.header.style.whiteSpace, 'nowrap', `${where}: one line`);
    }
    // The day cell says Hari and still carries the pill (on the card, not the header).
    const day = cols.find((c) => c.position === 'day');
    assert.equal(day.header.textContent, 'Hari');
    assert.ok(day.card.textContent.includes(CHROME_COPY.pillar_core_pill), `${where}: the INTI DIRI pill stays on the day card`);
    assert.equal(day.header.textContent.includes(CHROME_COPY.pillar_core_pill), false, `${where}: and not in the header`);
    return cols;
  } finally { await ui.unmount(); restore(); }
}

test('BL §1: with an hour, each of the four cells has the header for ITS position', async () => {
  const cols = await assertBagan(viewOf(withHour), 'with hour');
  assert.deepEqual(cols.map((c) => c.header.textContent), ['Tahun', 'Bulan', 'Hari', 'Jam']);
  assert.equal(cols.some((c) => c.card.hasAttribute('data-pillar-empty')), false, 'no empty cell');
});

test('BL §2: without an hour, the empty Pilar Arah cell is headed Jam', async () => {
  const view = viewOf(noHour);
  assert.equal(view.pillars.length, 3, 'precondition: the engine sends three pillars');
  const cols = await assertBagan(view, 'no hour');
  const empty = cols.find((c) => c.card.hasAttribute('data-pillar-empty'));
  assert.ok(empty, 'the empty cell is a column');
  assert.equal(empty.position, 'hour');
  assert.equal(empty.header.textContent, 'Jam', 'the missing-hour cell says Jam');
  assert.ok(empty.card.textContent.includes(CHROME_COPY.hour_add), 'with H3 still inside it');
});

test('BL §1: mapped by position, never by array index (the pillars arrive reversed)', async () => {
  const view = viewOf(withHour);
  const reversed = { ...view, pillars: [...view.pillars].reverse() };
  const cols = await assertBagan(reversed, 'reversed');
  assert.deepEqual(cols.map((c) => c.header.textContent), ['Jam', 'Hari', 'Bulan', 'Tahun'],
    'each header follows its own pillar, wherever the array puts it');
});

// ── THE PDF CHART PAGE ─────────────────────────────────────

const DPI = 200;
const px = (pt) => Math.round((pt * DPI) / 72);
const LABEL = PDF_STYLES.pillarLabel;
// Paper is the raster's white; the card fill (--kertas-2) is not.
const isPaper = (img, x, y) => {
  const i = (y * img.width + x) * 4;
  return img.data[i] >= 254 && img.data[i + 1] >= 254 && img.data[i + 2] >= 254;
};
const renderedFor = (sj) => ({ ...assembleFallback(sj), prompt_version: 'testprompt00', stage6_version: 'test' });

async function ce(chart = withHour) {
  const sj = buildSemanticJson(chart);
  const { buffer } = await buildCompleteEditionPdf({ chart, semanticJson: sj, rendered: renderedFor(sj), gender: 'female' });
  return { buffer, views: [mirrorChartView(chart, sj)] };
}
async function compat() {
  const chartB = calculateBaziChart(B);
  const pj = buildPairSemantic(withHour, chartB);
  const { buffer } = await buildPairPdf({
    chartA: withHour, chartB, semanticJson: pj, rendered: renderedFor(pj),
    pair: { a: { date: A.birthDate, gender: 'female' }, b: { date: B.birthDate, gender: 'male' } },
  });
  return { buffer, views: [viewOf(withHour), viewOf(chartB)] };
}

/**
 * Every pillar row drawn in a PDF, measured. A row is the eyebrows (PILAR ...) drawn at
 * one y. For each card in it: its drawn edges (the non-paper span through the eyebrow
 * line), the header runs drawn above it, the header's INK width, and the paper between
 * the header's ink and whatever is next below it (the pill on the day card, the card's
 * top edge on the others).
 */
async function pdfRows(buffer) {
  const pages = textBoxes(buffer);
  const out = [];
  for (let p = 0; p < pages.length; p += 1) {
    const runs = pages[p];
    // A row is the eyebrows within 40pt of each other: a card under a wrapped header
    // starts lower, and an exact-y grouping would silently drop that very card.
    const eyebrows = runs.filter((r) => /^PILAR /u.test(r.text.trim()) && r.size === LABEL.fontSize).sort((a, b) => a.y - b.y);
    const clusters = [];
    for (const r of eyebrows) {
      const last = clusters.at(-1);
      if (last && r.y - last[0].y < 40) last.push(r); else clusters.push([r]);
    }
    const rows = clusters.map((row) => row.sort((a, b) => a.x - b.x)).filter((row) => row.length >= 3);
    if (!rows.length) continue;
    const [img] = await rasterPages(buffer, { dpi: DPI, pages: [p + 1] });
    for (const row of rows) {
      const rowTop = Math.min(...row.map((r) => r.y));
      const cards = row.map((label) => {
        const scan = px(label.y + LABEL.fontSize * 0.5);
        let L = px(label.x) + 1; while (L > 0 && !isPaper(img, L - 1, scan)) L -= 1;
        let R = px(label.x) + 1; while (R < img.width - 1 && !isPaper(img, R + 1, scan)) R += 1;
        // The card's top edge, a fifth of the way in (clear of the centred pill).
        const xt = Math.round(L + (R - L) * 0.2);
        let top = scan; while (top > 0 && !isPaper(img, xt, top - 1)) top -= 1;
        return { eyebrow: label.text.trim(), L, R, top };
      });
      const gapHalf = cards.length > 1 ? Math.floor((cards[1].L - cards[0].R) / 2) : 0;
      // Header runs: the eyebrow's size, the muted colour, above the row, not an eyebrow.
      const above = runs.filter((r) => r.size === LABEL.fontSize && r.fill === LABEL.color.toUpperCase()
        && r.y < rowTop + 40 && r.y > rowTop - 60 && !/^PILAR /u.test(r.text.trim()));
      for (const c of cards) {
        const x0 = c.L - gapHalf; const x1 = c.R + gapHalf;
        c.headers = above.filter((r) => { const x = px(r.x); return x >= x0 - 2 && x <= x1 && px(r.y) < c.top; });
        c.headerYs = [...new Set(c.headers.map((r) => r.y))];
        c.text = c.headers.map((r) => r.text).join(' ').trim();
        if (!c.headers.length) continue;
        // Ink: from just above the first header line, the first block of inked rows.
        let y = px(Math.min(...c.headers.map((r) => r.y))) - 4;
        const inked = (yy) => { for (let x = x0; x <= x1; x += 1) if (!isPaper(img, x, yy)) return true; return false; };
        while (y < c.top && !inked(y)) y += 1;
        const inkTop = y; let ix0 = Infinity; let ix1 = -Infinity;
        while (y < c.top && inked(y)) {
          for (let x = x0; x <= x1; x += 1) if (!isPaper(img, x, y)) { ix0 = Math.min(ix0, x); ix1 = Math.max(ix1, x); }
          y += 1;
        }
        const inkBottom = y - 1;
        let next = y; while (next < c.top && !inked(next)) next += 1;
        Object.assign(c, { inkTop, inkBottom, inkW: ix1 - ix0 + 1, cardW: c.R - c.L + 1, clear: next - inkBottom - 1 });
      }
      out.push({ page: p + 1, cards });
    }
  }
  return out;
}

/** What is wrong with a measured row: every way a header can break §5. */
function violations(rows) {
  const v = [];
  for (const { page, cards } of rows) {
    for (const c of cards) {
      if (!c.headers.length) continue;
      if (c.headerYs.length > 1) v.push(`p${page} ${c.eyebrow}: header wraps to ${c.headerYs.length} lines`);
      if (c.inkW > c.cardW) v.push(`p${page} ${c.eyebrow}: header ${c.inkW}px wider than its card ${c.cardW}px`);
      if (c.clear < px(2)) v.push(`p${page} ${c.eyebrow}: only ${c.clear}px clear below the header`);
    }
  }
  return v;
}

/** The drawn header over each card must be the ruled word for that card's position. */
function assertWords(rows, views, where, { expectRows }) {
  assert.equal(rows.length, expectRows, `${where}: ${expectRows} pillar row(s) drawn`);
  rows.forEach(({ cards }, i) => {
    const view = views[i];
    const byEyebrow = Object.fromEntries(view.pillars.map((p) => [p.palace.toUpperCase(), p.position]));
    const konsepsi = view.conception_pillar?.label.toUpperCase();
    for (const c of cards) {
      if (c.eyebrow === konsepsi) {
        assert.equal(c.headers.length, 0, `${where}: Pilar Konsepsi keeps an EMPTY header slot`);
        continue;
      }
      const position = byEyebrow[c.eyebrow];
      assert.ok(position, `${where}: ${c.eyebrow} is a chart position`);
      assert.equal(c.text, RULED_LABELS[position], `${where}: ${c.eyebrow} is headed ${RULED_LABELS[position]}`);
      assert.ok(c.inkBottom < c.top, `${where}: ${c.eyebrow}'s header is drawn above its card`);
      // The header is drawn at the eyebrow's size, in the eyebrow's colour (read from its style).
      for (const r of c.headers) {
        assert.equal(r.size, LABEL.fontSize, `${where}: ${c.text} at the eyebrow's size`);
        assert.equal(r.fill, LABEL.color.toUpperCase(), `${where}: ${c.text} in the eyebrow's colour`);
      }
    }
  });
}

test('BL §4: the Complete Edition chart page draws Tahun Bulan Hari Jam above the matching pillars, within width, clear of the pill', async () => {
  const { buffer, views } = await ce();
  const rows = await pdfRows(buffer);
  assertWords(rows, views, 'CE', { expectRows: 1 });
  assert.deepEqual(rows[0].cards.map((c) => c.text), ['Tahun', 'Bulan', 'Hari', 'Jam']);
  assert.deepEqual(violations(rows), []);
});

test('BL §4: the CE without an hour draws Tahun Bulan Hari over its three pillars', async () => {
  const { buffer, views } = await ce(noHour);
  const rows = await pdfRows(buffer);
  assertWords(rows, views, 'CE no hour', { expectRows: 1 });
  assert.deepEqual(rows[0].cards.map((c) => c.text), ['Tahun', 'Bulan', 'Hari']);
  assert.deepEqual(violations(rows), []);
});

test('BL §4 + open point: each compat person\'s chart has the four words, and Pilar Konsepsi an empty slot', async () => {
  const { buffer, views } = await compat();
  const rows = await pdfRows(buffer);
  assertWords(rows, views, 'compat', { expectRows: 2 });
  for (const { cards } of rows) {
    assert.equal(cards.length, 5, 'four pillars and Konsepsi in the row');
    assert.deepEqual(cards.map((c) => c.text), ['Tahun', 'Bulan', 'Hari', 'Jam', '']);
  }
  assert.deepEqual(violations(rows), []);
});

// C5 (Reyner, 2026-09-22): both compat charts share ONE page. The headers add a line and
// its gap above each row, and the first build of BL pushed person B's last element bar
// (Air) alone onto the next page on every pair walked. The compact form absorbs them.
test('BL + C5: the compat chart page still holds BOTH charts whole, every element bar included', async () => {
  const pairs = [[A, B], [{ birthDate: '1995-01-20', birthTime: '23:30' }, { birthDate: '1988-07-07', birthTime: null }]];
  for (const [a, b] of pairs) {
    const chartA = calculateBaziChart(a);
    const chartB = calculateBaziChart(b);
    const pj = buildPairSemantic(chartA, chartB);
    const { buffer } = await buildPairPdf({
      chartA, chartB, semanticJson: pj, rendered: renderedFor(pj),
      pair: { a: { date: a.birthDate, gender: 'female' }, b: { date: b.birthDate, gender: 'male' } },
    });
    const pages = textBoxes(buffer);
    const at = pages.findIndex((runs) => runs.filter((r) => r.text.trim() === 'PILAR DIRI').length === 2);
    assert.ok(at > -1, `${a.birthDate} + ${b.birthDate}: both charts' rows are drawn on one page`);
    // The bars are drawn as the element name in the serif: five per chart, ten on the page.
    const ELEMENTS = ['Kayu', 'Api', 'Tanah', 'Logam', 'Air'];
    const bars = pages[at].filter((r) => ELEMENTS.includes(r.text.trim()) && r.size > LABEL.fontSize * 1.4);
    assert.equal(bars.length, 10, `${a.birthDate} + ${b.birthDate}: ${bars.length} of 10 element bars on the chart page`);
    // The next page does not OPEN with a bar (its "Data di Balik" table names elements
    // too, so "no element name on it" would be the wrong proposition). Its first body run
    // sits above the running footer, which every page carries.
    const opener = pages[at + 1].filter((r) => !r.text.includes('PT Katon Digital')).sort((p, q) => p.y - q.y)[0];
    assert.ok(opener, 'the next page has body text');
    assert.equal(ELEMENTS.includes(opener.text.trim()), false, `${a.birthDate} + ${b.birthDate}: the next page opens with "${opener.text.trim()}", a carried bar`);
  }
});

test('BL §6 CONTROL: the PDF width instrument fires on a deliberately oversized header', async () => {
  const saved = CHROME_COPY.pillar_time_labels;
  assert.ok(saved, 'the bank has the labels');
  CHROME_COPY.pillar_time_labels = { ...saved, month: 'Bulan kelahiran menurut kalender matahari' };
  try {
    const { buffer } = await ce();
    const found = violations(await pdfRows(buffer));
    assert.ok(found.some((s) => /PILAR KERJA/u.test(s)), `the oversized month header must be caught: ${JSON.stringify(found)}`);
    assert.equal(found.some((s) => /PILAR AKAR|PILAR DIRI|PILAR ARAH/u.test(s)), false, 'and only it');
  } finally {
    CHROME_COPY.pillar_time_labels = saved;
  }
});
