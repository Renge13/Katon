// ============================================================
// tests/pair-frame-labels.spec.mjs — a frame hit never wears a seat's name
// ============================================================
// Prompt AD, Job A (2026-09-26). A palace-frame hit is one person's NON-DAY
// pillar (year / month / hour) forming a relation with the other person's day
// branch. Until this commit it was keyed through `P2_BY_RELATION` into the SEAT
// cells, whose names and meanings all describe BOTH seats - so the appendix told
// PZ0t, a pair with no seat relation at all, that the seats lock, oppose and rub.
// Reyner ruled four frame cells (`p2_frame_*`) that day.
//
// The fixture is production evidence: `tests/fixtures/pair-frame-hits.fixture.json`
// holds each pair's branchRelations as the live GET served them, and the first
// test proves the births reproduce them before anything else is trusted.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { compatBranchRelations } from '../lib/compat/branchRelations.js';
import { buildPairSemantic, variantKeysFor, p2FrameKey, p2FrameKeys } from '../lib/semantic/pair.js';
import { buildPairAppendix } from '../lib/pdf/pairAppendix.js';
import { factRows } from '../lib/pdf/pairDocument.js';
import FIXTURE from './fixtures/pair-frame-hits.fixture.json' with { type: 'json' };
import GLOSSARY from '../docs/content/glossary.json' with { type: 'json' };

const K = GLOSSARY.kompatibilitas;
const SEAT = { '六合': 'p2_harmony', '冲': 'p2_clash', '害': 'p2_harm', '刑': 'p2_punishment' };
const FRAME = {
  '六合': 'p2_frame_harmony', '冲': 'p2_frame_clash', '害': 'p2_frame_harm', '刑': 'p2_frame_punishment',
};
const SEAT_KEYS = new Set(Object.values(SEAT));

const built = FIXTURE.pairs.map((p) => {
  const chartA = calculateBaziChart(p.a);
  const chartB = calculateBaziChart(p.b);
  return { ...p, chartA, chartB, semanticJson: buildPairSemantic(chartA, chartB) };
});
const isDayDay = (h) => h.from?.position === 'day' && h.to?.position === 'day';
const hitsOf = (sj) => {
  const frame = sj.facts.find((f) => f.id === 'p2_palace_frame');
  return [...(frame?.provenance?.b_hits_a || []), ...(frame?.provenance?.a_hits_b || [])];
};

test('precondition: the fixture births reproduce production\'s branch relations', () => {
  for (const p of built) {
    assert.deepEqual(compatBranchRelations(p.chartA, p.chartB), p.branchRelations, p.id);
  }
});

test('A NON-DAY FRAME HIT IS KEYED TO ITS p2_frame_* CELL, NEVER TO A SEAT CELL', () => {
  for (const { id, semanticJson } of built) {
    const frame = semanticJson.facts.find((f) => f.id === 'p2_palace_frame');
    assert.ok(frame, `${id}: precondition, a palace frame`);
    const nonDay = hitsOf(semanticJson).filter((h) => !isDayDay(h));
    assert.ok(nonDay.length > 0, `${id}: precondition, at least one non-day frame hit`);

    const keys = variantKeysFor(frame);
    for (const h of nonDay) {
      assert.ok(keys.includes(FRAME[h.relation]),
        `${id}: ${h.from.chart} ${h.from.position} ${h.relation} is missing ${FRAME[h.relation]}`);
    }
    // A seat key may ride in the frame ONLY for a day-to-day hit, which IS the day
    // pair mirrored. Anything else is a frame hit wearing a seat's name.
    const dayDayRelations = new Set(hitsOf(semanticJson).filter(isDayDay).map((h) => h.relation));
    for (const k of keys.filter((x) => SEAT_KEYS.has(x))) {
      const relation = Object.keys(SEAT).find((r) => SEAT[r] === k);
      assert.ok(dayDayRelations.has(relation),
        `${id}: frame carries seat key ${k} with no day-to-day ${relation} behind it`);
    }
    // Every frame key is a real, NAMED cell - the PDF row and the appendix print it.
    for (const k of keys.filter((x) => x.startsWith('p2_frame_'))) {
      assert.ok(K[k]?.name_id && K[k]?.label_meaning, `${id}: ${k} is a ruled cell`);
    }
  }
});

test('THE DAY PAIR STILL USES THE SEAT CELLS', () => {
  const expected = {
    g4WH4_9QbCrCj3Gha934q: 'p2_harm',
    PZ0t_B3YDnzdXc2LWV38D: 'p2_none',
    'rVe4ca-FOhsprfGUucTxA': 'p2_harmony',
  };
  for (const { id, semanticJson } of built) {
    const day = semanticJson.facts.find((f) => f.id === 'p2_day_pair');
    assert.equal(day.provenance.variant, expected[id], id);
  }
});

test('THE PDF FACTS PAGE NAMES A FRAME ROW WITH THE FRAME LABEL', () => {
  for (const { id, semanticJson } of built) {
    const frameRows = factRows(semanticJson).filter((r) => r.frame);
    assert.ok(frameRows.length > 0, `${id}: precondition, frame rows`);
    for (const r of frameRows) {
      assert.ok(r.anchorKey.startsWith('p2_frame_'), `${id}: frame row anchored at ${r.anchorKey}`);
      assert.equal(r.term, K[r.anchorKey].name_id, `${id}: frame row term`);
    }
  }
});

test('THE APPENDIX NEVER EXPLAINS A SEAT RELATION THE SEATS DO NOT HAVE', () => {
  for (const { id, chartA, chartB, semanticJson } of built) {
    const day = semanticJson.facts.find((f) => f.id === 'p2_day_pair').provenance.variant;
    const appendix = buildPairAppendix({ chartA, chartB, semanticJson });
    const keys = appendix.groups.flatMap((g) => g.entries)
      .filter((e) => e.section === 'kompatibilitas').map((e) => e.key);
    for (const k of keys.filter((x) => SEAT_KEYS.has(x))) {
      assert.equal(k, day, `${id}: appendix explains seat cell ${k}; the seats are ${day}`);
    }
  }
});

test('EVERY GLOSSARY LABEL IS UNIQUE', () => {
  // Every `name_id` (and the pillar's `branch_name_id`) across the glossary. Two
  // cells with one label would make a legend entry ambiguous and a facts-page row
  // resolve to either.
  const labels = [];
  const walk = (o, at) => {
    if (!o || typeof o !== 'object' || Array.isArray(o)) return;
    for (const [k, v] of Object.entries(o)) {
      if ((k === 'name_id' || k === 'branch_name_id') && typeof v === 'string') labels.push([v, at]);
      else walk(v, at ? `${at}.${k}` : k);
    }
  };
  walk(GLOSSARY, '');
  assert.ok(labels.length > 80, `precondition: the walk found the labels (${labels.length})`);
  // ── ONE RULED EXCEPTION, AND IT IS A PAIR OF VARIANTS, NOT TWO TERMS ──
  // Reyner ruled `p3_reader_gives.name_id` = "Penyeimbang Unsur", the same name as
  // `p3_supplies` (Prompt AM, 2026-09-28): it is the one term, Penyeimbang Unsur,
  // said from the reader's side. Neither risk this test names can arise: a reading
  // carries at most one of the two (lib/semantic/pair.js `p3SupplyKey` returns one
  // key), so no legend or facts page holds both, and appendix anchors are
  // `section.key` (lib/pdf/appendix.js `anchorId`), never the label. Only this pair
  // is exempt; any other shared label still fails.
  const SAME_TERM = new Set(['kompatibilitas.p3_supplies', 'kompatibilitas.p3_reader_gives']);
  const seen = new Map();
  for (const [label, at] of labels) {
    const bothVariants = SAME_TERM.has(at) && SAME_TERM.has(seen.get(label));
    assert.ok(!seen.has(label) || bothVariants, `"${label}" is the label of both ${seen.get(label)} and ${at}`);
    seen.set(label, at);
  }
});

// ── E13: THE FRAME TEXT FOLLOWS THE HIT'S DIRECTION (Prompt BB §1.2, 2026-10-02) ──
// `p2_palace_frame` was written for one direction only: "Salah satu pilar di bagan
// dia terhubung langsung dengan kursi pasanganmu" - a pillar of B (dia) reaching A's
// (kamu) seat. For the BB pair the only non-day hit is A's month 寅 clashing B's day
// 申 (a_hits_b), so the printed text stated the reverse of the fact. The A->B words
// are Reyner-confirmed (his message with Prompt BB, 2026-10-02) and live in
// `p2_palace_frame_reader`.
//
// A day-to-day hit is the day pair mirrored and appears in BOTH lists (here 六合
// 巳-申), so it says nothing about direction and is ignored when choosing.
const BB_A = calculateBaziChart({ birthDate: '2005-02-14', birthTime: '07:00' });
const BB_B = calculateBaziChart({ birthDate: '1999-07-07', birthTime: '17:00' });
const frameOf = (sj) => sj.facts.find((f) => f.id === 'p2_palace_frame');

test('E13 premise: the BB pair\'s only non-day frame hit is A month 寅 -> B day 申 (冲)', () => {
  const p = frameOf(buildPairSemantic(BB_A, BB_B)).provenance;
  const nonDay = (xs) => xs.filter((h) => !isDayDay(h));
  assert.deepEqual(nonDay(p.b_hits_a), [], 'no B->A non-day hit');
  assert.deepEqual(nonDay(p.a_hits_b).map((h) => [h.from.position, h.relation, ...h.branches]), [['month', '冲', '寅', '申']]);
});

test('E13: AN A->B-ONLY FRAME carries the reader-side words, in the fact, its keys and the PDF', () => {
  const sj = buildPairSemantic(BB_A, BB_B);
  const frame = frameOf(sj);
  const R = K.p2_palace_frame_reader;
  assert.ok(R, 'the A->B cell exists');
  assert.equal(R.label_meaning, 'Salah satu pilar di baganmu terhubung langsung dengan kursi pasangannya. Elemen hidupmu memengaruhi ranah terdekatnya.');
  // Re-ruled 2026-10-04 (BC amendment 2b, docs/content/glossary-voice-rulings-2026-10-04.md):
  // the E13 seed carried "dinamika".
  assert.equal(R.meaning_seed, 'Salah satu pilar kehidupanmu menyentuh langsung ruang privat pasanganmu. Apa yang sedang kamu hadapi di area hidup itu ikut masuk ke dalam hubungan kalian dan mewarnai suasananya.');
  assert.equal(R.daily_seed, 'Saat area hidupmu itu mengalami tekanan, suasananya langsung terbawa ke rumah dan dia merasakannya sebelum kamu sempat cerita.');
  for (const field of ['label_meaning', 'meaning_seed', 'daily_seed']) {
    assert.equal(frame[field], R[field], `the fact's ${field} is the A->B text`);
  }
  assert.ok(variantKeysFor(frame).includes('p2_palace_frame_reader'));
  assert.ok(!variantKeysFor(frame).includes('p2_palace_frame'), 'and not the B->A cell');
  const lead = factRows(sj).find((r) => r.frame)?.lead;
  assert.equal(lead, R.label_meaning, 'the PDF frame group leads with the A->B sentence');
});

test('E13: A B->A-ONLY FRAME (the same pair swapped) keeps the existing words', () => {
  const sj = buildPairSemantic(BB_B, BB_A);
  const frame = frameOf(sj);
  for (const field of ['label_meaning', 'meaning_seed', 'daily_seed']) {
    assert.equal(frame[field], K.p2_palace_frame[field], `the fact's ${field} is the B->A text`);
  }
  assert.ok(variantKeysFor(frame).includes('p2_palace_frame'));
  assert.equal(factRows(sj).find((r) => r.frame)?.lead, K.p2_palace_frame.label_meaning);
});

test('E13: WHEN BOTH DIRECTIONS HIT, the existing B->A words stay (true: a B->A hit exists)', () => {
  // Asserted on the chooser itself, because no fixture pair is guaranteed to hit both
  // ways and a test that returns early when it finds none can pass on anything.
  const hit = (fromChart, fromPos, toPos = 'day') => ({ from: { chart: fromChart, position: fromPos }, to: { position: toPos } });
  const dayDay = [hit('A', 'day'), hit('B', 'day')];
  assert.equal(p2FrameKey({ a_hits_b: [hit('A', 'month')], b_hits_a: [hit('B', 'year')] }), 'p2_palace_frame', 'both ways');
  assert.equal(p2FrameKey({ a_hits_b: [hit('A', 'month')], b_hits_a: [] }), 'p2_palace_frame_reader', 'A->B only');
  assert.equal(p2FrameKey({ a_hits_b: [hit('A', 'month'), dayDay[0]], b_hits_a: [dayDay[1]] }), 'p2_palace_frame_reader',
    'A->B plus the mirrored day pair is still A->B only');
  assert.equal(p2FrameKey({ a_hits_b: [], b_hits_a: [hit('B', 'hour')] }), 'p2_palace_frame', 'B->A only');
  assert.equal(p2FrameKey({ a_hits_b: [dayDay[0]], b_hits_a: [dayDay[1]] }), 'p2_palace_frame', 'day pair alone');
});

// ── BC AMENDMENT 1 item 5: A HARMONY HIT GETS THE HARMONY TEXT (Reyner, 2026-10-02) ──
// Both frame cells above are PRESSURE text, and until this ruling every frame hit got one
// of them whatever its relation. Harmony (六合) hits now take Reyner's harmony strings
// (docs/content/compat-frame-harmony-rulings.md), by the same direction E13 chose; clash,
// harm and punishment keep the pressure text. The worked example is the clash pair: its
// day seats clash (冲 子-午), and B's month and hour 未 each form 六合 with A's day 午.
const CLASH_A = calculateBaziChart({ birthDate: '1973-05-10', birthTime: '00:00', gender: 'female' });
const CLASH_B = calculateBaziChart({ birthDate: '1971-08-07', birthTime: '13:00', gender: 'male' });
const FIELDS = ['label_meaning', 'meaning_seed', 'daily_seed'];

test('HARMONY premise: the clash pair\'s B->A non-day frame hits are all 六合 (B month and hour 未 -> A day 午)', () => {
  const p = frameOf(buildPairSemantic(CLASH_A, CLASH_B)).provenance;
  assert.deepEqual(p.b_hits_a.filter((h) => !isDayDay(h)).map((h) => [h.from.position, h.relation, ...h.branches]),
    [['month', '六合', '午', '未'], ['hour', '六合', '午', '未']]);
});

test('HARMONY: THE CLASH PAIR\'S B->A 六合 FRAME DOES NOT GET THE PRESSURE TEXT, in the fact, its keys or the PDF', () => {
  const sj = buildPairSemantic(CLASH_A, CLASH_B, { voice: 'v2', status: 'PDKT', nicknames: { a: 'Ayu', b: 'Raka' } });
  const frame = frameOf(sj);
  for (const field of FIELDS) {
    assert.notEqual(frame[field], K.p2_palace_frame[field], `the fact's ${field} is still the B->A pressure text`);
  }
  const H = K.p2_palace_frame_harmony;
  assert.ok(H, 'the B->A harmony cell exists');
  assert.equal(H.label_meaning, 'Sisi kehidupannya terhubung langsung dengan ruang amanmu. Apa pun pencapaiannya di luar sana, hal itu menjadi jangkar yang membuatmu merasa lebih tenang.');
  for (const field of FIELDS) assert.equal(frame[field], H[field], `the fact's ${field} is the B->A harmony text`);
  assert.ok(variantKeysFor(frame).includes('p2_palace_frame_harmony'));
  assert.ok(!variantKeysFor(frame).includes('p2_palace_frame'), 'and not the pressure cell');
  assert.equal(factRows(sj).find((r) => r.frame)?.lead, H.label_meaning, 'the PDF frame group leads with the harmony sentence');
});

test('HARMONY: the chooser, by direction and relation (harmony first, then pressure, when one direction carries both)', () => {
  const hit = (fromChart, fromPos, relation, toPos = 'day') => ({ relation, from: { chart: fromChart, position: fromPos }, to: { position: toPos } });
  const R = K.p2_palace_frame_reader_harmony;
  assert.ok(R, 'the A->B harmony cell exists');
  assert.equal(R.daily_seed, 'Saat urusanmu sedang lancar, kamu akan pulang membawa energi yang sangat nyaman. Tanpa perlu banyak kata, kehadiranmu saja sudah cukup untuk melunturkan lelahnya seharian.');
  const rows = [
    [{ a_hits_b: [], b_hits_a: [hit('B', 'month', '六合')] }, ['p2_palace_frame_harmony'], 'B->A harmony'],
    [{ a_hits_b: [hit('A', 'year', '六合')], b_hits_a: [] }, ['p2_palace_frame_reader_harmony'], 'A->B harmony'],
    [{ a_hits_b: [], b_hits_a: [hit('B', 'year', '冲')] }, ['p2_palace_frame'], 'B->A clash keeps pressure'],
    [{ a_hits_b: [hit('A', 'hour', '害')], b_hits_a: [] }, ['p2_palace_frame_reader'], 'A->B harm keeps pressure'],
    [{ a_hits_b: [], b_hits_a: [hit('B', 'hour', '刑')] }, ['p2_palace_frame'], 'B->A punishment keeps pressure'],
    [{ a_hits_b: [], b_hits_a: [hit('B', 'month', '六合'), hit('B', 'hour', '冲')] }, ['p2_palace_frame_harmony', 'p2_palace_frame'], 'B->A both: side by side'],
    [{ a_hits_b: [hit('A', 'day', '六合', 'day')], b_hits_a: [hit('B', 'day', '六合', 'day')] }, ['p2_palace_frame_harmony'], 'day pair alone, 六合'],
    [{ a_hits_b: [hit('A', 'day', '冲', 'day')], b_hits_a: [hit('B', 'day', '冲', 'day')] }, ['p2_palace_frame'], 'day pair alone, 冲'],
    // A day-to-day hit says nothing about the frame once a non-day hit exists (E13).
    [{ a_hits_b: [hit('A', 'day', '冲', 'day')], b_hits_a: [hit('B', 'month', '六合'), hit('B', 'day', '冲', 'day')] }, ['p2_palace_frame_harmony'], 'non-day 六合 beside the mirrored clashed seat'],
    // E13's direction rule is unchanged: both directions read B->A.
    [{ a_hits_b: [hit('A', 'year', '冲')], b_hits_a: [hit('B', 'month', '六合')] }, ['p2_palace_frame_harmony'], 'both directions read B->A'],
  ];
  for (const [prov, want, label] of rows) assert.deepEqual(p2FrameKeys(prov), want, label);
});
