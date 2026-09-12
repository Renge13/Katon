// ============================================================
// tests/compat-voice-round2.spec.mjs — the two LOG-ONLY counters
// ============================================================
// Prompt Z round 2, B1 and B2. Neither check rejects anything, which is why they
// are allowed to travel with the prompt edit they measure: the defect is a PROSE
// defect the prompt is being asked to fix, and a gate landing in the same commit
// would confound the prompt's effect with the gate's on any round-2 floor.
//
// ── EVERY FALSIFIER HERE IS A REAL RENDER ──────────────────
// The four prose fixtures are quoted verbatim out of
// `docs/qa/2026-09-11-compat-three-pair-walk.md`, two that MUST log and two that
// MUST NOT. Written any other way these tests would assert that a regex matches
// a string chosen to make it match - which is the failure mode this repo keeps
// paying for, and the reason the negative cases are here at all.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { pairGuard } from '../lib/validate/pair.js';
import { STAGE6_VERSION } from '../lib/validate/index.js';
import { VALIDATION_CHARTS } from './bazi-validation.fixture.js';

const chartOf = (id) => {
  const row = VALIDATION_CHARTS.find((c) => c.id === id);
  if (!row) throw new Error(`no fixture chart ${id}`);
  return calculateBaziChart({ birthDate: row.date, birthTime: row.time });
};

/** 1x2 - the walk's first pair, and the source of three of the four fixtures. */
const P_1x2 = buildPairSemantic(chartOf(1), chartOf(2));
/** The Y-1 fixture pair, the walk's third column. */
const P_Y1 = buildPairSemantic(
  calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' }),
  calculateBaziChart({ birthDate: '1997-09-14', birthTime: null }),
);

const checks = (rendered, sj) => pairGuard(rendered, sj, JSON.stringify(rendered)).map((f) => f.check);
const has = (rendered, sj, check) => checks(rendered, sj).includes(check);

// ── the fixtures, verbatim from the walk artifact ──────────

// walk line 257, Y-1 round 1, P1. Every direction word is the cell's own.
const Y1_ROUND1_P1 = 'Unsur salah satu dari kalian memberi energi ke yang lain. Alur energi berjalan searah dan stabil dari satu pihak ke pihak lain. Yang memberi menjadi sumber dorongan, sementara yang menerima mendapat rasa aman. Peran ini konsisten dan jarang berbalik. Keputusan dan inisiatif baru hampir selalu dipicu oleh orang yang sama, sementara yang lain menyambut dan mengeksekusi dengan rasa aman.';

// walk line 77, 1x2 baseline, P1. The direction is named, both people are in it.
const BASELINE_1x2_P1 = 'Unsur Matahari milikmu memberi energi ke unsur Tanah miliknya. Ada dinamika pengayom dan yang diayomi dengan alur yang konsisten. Kamu secara alami memanaskan dan menghidupkan potensi yang dia miliki.';

// walk line 116, 1x2 round 1. Talks ABOUT the reader, by label.
const ROUND1_1x2_PENUTUP = 'Hubungan ini meminta Matahari untuk belajar melambat dan memberi ruang bagi ritme yang lebih tenang. Gunung diminta untuk lebih terbuka dalam mengomunikasikan kebutuhan pribadinya agar tidak terjadi kesalahpahaman dari perbedaan perspektif.';

// walk line 92, 1x2 baseline. Talks TO her.
const BASELINE_1x2_PENUTUP = 'Hubungan ini meminta kamu untuk lebih sabar dalam menyelaraskan ritme harian yang berbeda. Bagi dia, hubungan ini meminta keterbukaan untuk menerima kehangatan dan arahan yang kamu tawarkan.';

const PENUTUP_OK = BASELINE_1x2_PENUTUP;
const p1BlockOf = (sj, text) => ({
  blocks: [{ fact_ids: ['p1_stem_relation'], heading: 'Inti', text }],
  penutup: PENUTUP_OK,
});

// ── B1: pair.direction_resolved ────────────────────────────

test('the fixtures are what the walk says they are', () => {
  // A precondition, not decoration: `direction_resolved` only looks at
  // `p1_stem_relation` when the variant is direction-neutral, so a pair whose
  // variant were `p1_same` would make every assertion below pass vacuously.
  for (const [label, sj] of [['1x2', P_1x2], ['Y-1', P_Y1]]) {
    const p1 = sj.facts.find((f) => f.id === 'p1_stem_relation');
    assert.ok(
      ['p1_produces', 'p1_controls'].includes(p1.provenance.variant),
      `${label}: variant is ${p1.provenance.variant}, so this check would not run`,
    );
  }
  assert.equal(P_1x2.core.a.archetype_name_id, 'Matahari');
  assert.equal(P_1x2.core.b.archetype_name_id, 'Gunung');
});

test('LOGS: the Y-1 round-1 P1, which copied the cell\'s neutrality', () => {
  assert.equal(has(p1BlockOf(P_Y1, Y1_ROUND1_P1), P_Y1, 'pair.direction_resolved'), true);
});

test('DOES NOT LOG: the 1x2 baseline P1, which named who', () => {
  assert.equal(has(p1BlockOf(P_1x2, BASELINE_1x2_P1), P_1x2, 'pair.direction_resolved'), false);
});

test('a block with no pronoun at all logs, even with no neutral phrase', () => {
  // The second arm of the check, which the two real fixtures do not separate: the
  // Y-1 text trips both. Without this, the arm could be deleted and nothing here
  // would notice.
  const text = 'Api memberi energi ke Tanah dengan alur yang stabil dan konsisten sepanjang waktu.';
  assert.equal(NEUTRAL_FREE(text), true);
  assert.equal(has(p1BlockOf(P_1x2, text), P_1x2, 'pair.direction_resolved'), true);
});
/** The fixture above must contain none of the neutral phrases, or it proves nothing. */
const NEUTRAL_FREE = (t) => !/salah satu|yang satu|yang lain|satu pihak|pihak lain/iu.test(t);

test('a block that carries no direction-bearing fact is never logged', () => {
  const p5 = P_1x2.facts.find((f) => f.id === 'p5_pull_fit');
  const rendered = {
    blocks: [{ fact_ids: [p5.id], heading: 'Tarikan', text: 'Salah satu dari kalian menarik yang lain.' }],
    penutup: PENUTUP_OK,
  };
  assert.equal(has(rendered, P_1x2, 'pair.direction_resolved'), false);
});

// ── B2: pair.penutup_register ──────────────────────────────

const penutupOf = (text) => ({
  blocks: [{ fact_ids: ['p1_stem_relation'], heading: 'Inti', text: BASELINE_1x2_P1 }],
  penutup: text,
});

test('LOGS: the 1x2 round-1 penutup, which names the reader by label', () => {
  assert.equal(has(penutupOf(ROUND1_1x2_PENUTUP), P_1x2, 'pair.penutup_register'), true);
});

test('DOES NOT LOG: the 1x2 baseline penutup, which talks to her', () => {
  assert.equal(has(penutupOf(BASELINE_1x2_PENUTUP), P_1x2, 'pair.penutup_register'), false);
});

test('a penutup that says kamu AND names her still logs', () => {
  // Both conditions are one finding on purpose. This is the case that would slip
  // through if they had been split and only the cheaper one were satisfied.
  const text = `Hubungan ini meminta kamu untuk melambat. ${P_1x2.core.a.archetype_name_id} diminta untuk lebih terbuka.`;
  assert.equal(has(penutupOf(text), P_1x2, 'pair.penutup_register'), true);
});

test('THE FLOOR IS NOT LOGGED: an empty penutup is the floor, not a register failure', () => {
  // `assembleFallback` leaves penutup empty by design - no glossary cell holds a
  // closing. Counting that as a register defect would put a constant on every
  // floored draw and make the counter useless for the thing it measures.
  assert.equal(has(penutupOf(''), P_1x2, 'pair.penutup_register'), false);
});

// ── the isolation that matters ─────────────────────────────

test('THE MIRROR IS UNTOUCHED, and neither check is a gate change', () => {
  const mirror = buildSemanticJson(chartOf(1));
  assert.deepEqual(pairGuard(penutupOf(ROUND1_1x2_PENUTUP), mirror, ''), []);

  // Both findings are `flag`, so `validateRendering`'s `failing` filter excludes
  // them and no reading's verdict can differ. That is what lets them travel with
  // the prompt edit, and it is why STAGE6_VERSION does NOT move for this commit.
  const logged = pairGuard(
    p1BlockOf(P_Y1, Y1_ROUND1_P1), P_Y1, Y1_ROUND1_P1,
  ).filter((f) => f.check.startsWith('pair.direction') || f.check.startsWith('pair.penutup'));
  assert.ok(logged.length > 0);
  for (const f of logged) assert.equal(f.severity, 'flag');
  assert.equal(STAGE6_VERSION, '1.24.0');
});
