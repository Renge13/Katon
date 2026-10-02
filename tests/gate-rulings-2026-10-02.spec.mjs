// ============================================================
// tests/gate-rulings-2026-10-02.spec.mjs — Reyner's 2026-10-02 gate rulings
// ============================================================
// Run: npm run test:gate-rulings-2026-10-02
//
// Prompt BB §2, one commit per item, each with its red-first assertion here. The
// record is docs/product/compat-rulings-2026-10-02.md (IDs A1, A4, D1, D2, E5, G6).
//
// Every plant goes into the BB pair's floor draft (A 2005-02-14 07:00, Earth; B
// 1999-07-07 17:00, Metal), which PASSES as built, so each red is caused by the one
// sentence planted. These are Cowork's probes from Prompt BB, reproduced on main
// before any change (STAGE6 1.65.0).
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { validateRenderingV2 } from '../lib/validate/v2.js';

const A = calculateBaziChart({ birthDate: '2005-02-14', birthTime: '07:00' });
const B = calculateBaziChart({ birthDate: '1999-07-07', birthTime: '17:00' });
const PAIR = buildPairSemantic(A, B, { voice: 'v2' });
const floor = () => structuredClone(assembleFallback(PAIR));
const planted = (sentence) => {
  const d = floor();
  d.blocks[0].text = `${d.blocks[0].text} ${sentence}`;
  return validateRenderingV2(d, PAIR);
};
const rejecting = (r) => r.findings.filter((f) => f.severity !== 'flag').map((f) => f.check);
const src = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('PRECONDITION: the BB pair floor passes the v2 gate as built', () => {
  assert.equal(PAIR.core.a.element, 'Tanah');
  assert.equal(PAIR.core.b.element, 'Logam');
  assert.deepEqual(rejecting(validateRenderingV2(floor(), PAIR)), []);
});

// ── A1: the dead verdict path is deleted ───────────────────

test('A1: v2.js holds no verdict check (verdictHits / v2.d4_verdict), and a verdict sentence still passes', () => {
  // Code only: the deletion note in v2.js names what was deleted, on purpose.
  const v2 = src('lib/validate/v2.js').replace(/\/\*[\s\S]*?\*\//gu, '').replace(/^\s*\/\/.*$/gmu, '');
  assert.doesNotMatch(v2, /verdictHits/u, 'the dead function is gone');
  assert.doesNotMatch(v2, /v2\.d4_verdict/u, 'and its check id');
  // Behaviour unchanged: it matched nothing (blocklist.json has no `verdict` section
  // since 2026-10-01), so the verdict rule lives in the compat prompt only.
  assert.deepEqual(rejecting(planted('Kalian sangat cocok satu sama lain.')), []);
});

// ── A4: pair.reframe_missing is removed ────────────────────

test('A4: a difficult seat whose reframe block carries none of the reframe\'s words is ACCEPTED; the check is gone', () => {
  // tests/voice-gate.spec.mjs's hard-seat pair. The same shape compat-stage6-pair's old red used: replace the reframe block's
  // text with another block's real prose. Reyner 2026-10-02: "Drop the 50% word-overlap
  // check in A4"; "a clash is a map, never a judgement" stays as prompt direction.
  const HARD_SEAT = calculateBaziChart({ birthDate: '1990-06-07', birthTime: '12:00' });
  const READER = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  const sj = buildPairSemantic(READER, HARD_SEAT, { voice: 'v2' });
  assert.ok(sj.safety_flags.includes('p2_reframe_required'), 'precondition: the reframe is required');
  const d = structuredClone(assembleFallback(sj));
  assert.deepEqual(rejecting(validateRenderingV2(d, sj)), [], 'precondition: the floor passes');
  const idx = d.blocks.findIndex((b) => (b.fact_ids || []).includes('p2_reframe'));
  assert.notEqual(idx, -1, 'the reframe has its own block');
  d.blocks[idx].text = d.blocks[d.blocks.length - 1].text;
  const r = validateRenderingV2(d, sj);
  assert.equal(r.findings.some((f) => f.check === 'pair.reframe_missing'), false, 'no reframe check, at any severity');
  assert.deepEqual(rejecting(r), [], 'and nothing else rejects it');
  const code = src('lib/validate/pair.js').replace(/\/\*[\s\S]*?\*\//gu, '').replace(/^\s*\/\/.*$/gmu, '');
  assert.doesNotMatch(code, /REFRAME_OVERLAP|reframe_missing/u);
});

// ── D1: `obat` and `terapi` leave the medical ban; the clinical bans stay ──

test('D1: "obat" and "terapi" as metaphor pass; resep dokter, gejala, depresi and the rest still reject', () => {
  for (const s of ['Dia adalah obat untuk lelahmu.', 'Kehadirannya terasa seperti terapi bagimu.']) {
    assert.deepEqual(rejecting(planted(s)), [], s);
  }
  for (const s of ['Kamu butuh resep dokter.', 'Ada gejala depresi di sini.', 'Sebaiknya kamu ke dokter.',
    'Ini butuh pengobatan.', 'Ini seperti penyakit lama.', 'Diagnosa ini jelas.', 'Itu gangguan kecemasan.',
    'Jaga kesehatan mentalmu.']) {
    assert.ok(rejecting(planted(s)).includes('forbidden.medical'), s);
  }
});

// ── D2: the despair phrases leave the self-harm ban; the first pattern stays ──

test('D2: "tidak ada gunanya" and "menyerah saja" pass; bunuh diri, menyakiti diri, melukai diri still reject', () => {
  for (const s of ['Tidak ada gunanya menebak isi kepalanya.', 'Kadang kamu ingin menyerah saja pada perdebatan kecil.']) {
    assert.deepEqual(rejecting(planted(s)), [], s);
  }
  for (const s of ['Jangan pernah berpikir bunuh diri.', 'Kadang terpikir untuk menyakiti diri.', 'Ia tidak ingin melukai diri.']) {
    assert.ok(rejecting(planted(s)).includes('forbidden.self_harm'), s);
  }
});

// ── E5: a pair reading that misstates either person's Day Master element ──

test('E5: on a pair, a wrong Day Master element is HARD for either person; true statements pass', () => {
  // A (kamu) is Tanah, B (dia) is Logam.
  for (const [s, who] of [['Kamu adalah Logam yang tegas.', 'A'], ['Dia adalah Tanah yang tenang.', 'B'],
    ['Inti dirimu adalah Api.', 'A'], ['Ia adalah Kayu yang lentur.', 'B']]) {
    const r = planted(s);
    assert.ok(rejecting(r).includes('fact.day_master'), `${who}: ${s} -> ${JSON.stringify(rejecting(r))}`);
    assert.equal(r.findings.find((f) => f.check === 'fact.day_master').severity, 'hard');
  }
  for (const s of ['Kamu adalah Tanah yang sabar.', 'Dia adalah Logam yang tegas.', 'Kamu Tanah, dia Logam.']) {
    assert.deepEqual(rejecting(planted(s)), [], s);
  }
});

// ── G6: style.meta and style.code_leak reject on v2, mirror and pair ──

test('G6: a pipeline leak rejects a v2 PAIR (style.meta, style.code_leak); before 1.70.0 it was only logged', () => {
  const meta = planted('Berdasarkan data yang diberikan, ini adalah prompt JSON.');
  assert.ok(rejecting(meta).includes('style.meta'), JSON.stringify(rejecting(meta)));
  const leak = planted('Lihat fact_id p2_day_pair di provenance.');
  assert.ok(rejecting(leak).includes('style.code_leak'), JSON.stringify(rejecting(leak)));
  assert.equal(leak.ok, false);
});

test('G6: the same leak rejects a v2 MIRROR', async () => {
  const { buildSemanticJson } = await import('../lib/semantic/index.js');
  const sj = buildSemanticJson(A, { voice: 'v2' });
  const d = structuredClone(assembleFallback(sj));
  assert.deepEqual(rejecting(validateRenderingV2(structuredClone(d), sj)), [], 'precondition: the floor passes');
  d.blocks[0].text = `${d.blocks[0].text} Nilaimu null di sini.`;
  assert.ok(rejecting(validateRenderingV2(d, sj)).includes('style.code_leak'));
});

test('G6 SAFETY: a square-bracket English gloss ("Kayu [Wood]") is normalised BEFORE code_leak reads it, so it never rejects', () => {
  // The replay's 20 v1 code_leak hits on stored v2 drafts were ALL this shape. On v2
  // the square-bracket normaliser runs first; this pins that order.
  const r = planted('Kamu adalah Tanah [Earth] yang sabar, dan dia Logam [Metal].');
  assert.equal(r.findings.some((f) => f.check === 'style.code_leak'), false, JSON.stringify(r.findings.map((f) => f.check)));
  assert.deepEqual(rejecting(r), []);
  assert.ok(r.findings.some((f) => f.check === 'brackets.square_normalised'), 'the normaliser handled it');
});

test('G6: every other style.* finding stays LOGGED on v2', () => {
  const r = planted('Apa yang membuat kalian bertahan?');
  assert.deepEqual(rejecting(r), [], JSON.stringify(rejecting(r)));
});
