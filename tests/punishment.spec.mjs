// ============================================================
// 刑 (Punishment) table + scope lock
// ============================================================
// The table is EVIDENCE. It was verified 2026-08-01 against independent BaZi
// sources (masterseanchan.com, fourpillars.pro, deeporacle.ai, kittybazispace),
// all agreeing on all four rows with no dissent.
//
// It could NOT be verified against either in-repo option, which is why this lock
// exists rather than a cross-check:
//   - tyme4ts has no punishment API at all.
//   - the bazi-calculator skill has no punishment table, and its 藏干 table still
//     carries the 子 = 壬 error this repo corrected in cb43bc7 — so it is not a
//     trustworthy source for BaZi tables.
//
// THE SCOPE RULING IS AS LOAD-BEARING AS THE TABLE. Partial trines are excluded:
// including them takes frequency from 31% to 54% across the fixture, at which
// point the marker stops carrying information. The frequency assertions below are
// what stop a future "improvement" from quietly reintroducing partials.
//
// Run: npm run test:punishment
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { branchPunishments, SELF_PUNISHMENT, PUNISHMENT_TRINES, PUNISHMENT_PAIRS, BRANCHES } from '../lib/bazi/stems.js';
import { VALIDATION_CHARTS } from './bazi-validation.fixture.js';

test('the verified table', () => {
  assert.deepEqual(SELF_PUNISHMENT, ['辰', '午', '酉', '亥']);
  assert.deepEqual(PUNISHMENT_TRINES, [['寅', '巳', '申'], ['丑', '戌', '未']]);
  assert.deepEqual(PUNISHMENT_PAIRS, [['子', '卯']]);
});

test('only 辰午酉亥 self-punish — no other repeated branch does', () => {
  for (const branch of BRANCHES) {
    const got = branchPunishments([branch, branch]);
    if (SELF_PUNISHMENT.includes(branch)) {
      assert.deepEqual(got, [{ type: 'self', branches: [branch, branch] }], `${branch} should self-punish`);
    } else {
      assert.deepEqual(got, [], `${branch} repeated must NOT be a punishment`);
    }
  }
});

test('a partial trine is NOT a punishment — the scope ruling', () => {
  // Two of three is excluded. This is the assertion that keeps frequency at 31%.
  for (const [a, b, c] of PUNISHMENT_TRINES) {
    assert.deepEqual(branchPunishments([a, b]), [], `${a}${b} is partial`);
    assert.deepEqual(branchPunishments([b, c]), [], `${b}${c} is partial`);
    assert.deepEqual(branchPunishments([a, c]), [], `${a}${c} is partial`);
    assert.deepEqual(
      branchPunishments([a, b, c]),
      [{ type: 'trine', branches: [a, b, c] }],
      `${a}${b}${c} complete`,
    );
  }
});

test('子卯 is a pair and counts; a lone member does not', () => {
  assert.deepEqual(branchPunishments(['子', '卯']), [{ type: 'pair', branches: ['子', '卯'] }]);
  assert.deepEqual(branchPunishments(['子']), []);
  assert.deepEqual(branchPunishments(['卯']), []);
});

test('empty when none, and hour-optional', () => {
  assert.deepEqual(branchPunishments([]), []);
  assert.deepEqual(branchPunishments(['子', '丑', '寅']), []);
  // A three-branch chart (no hour) must not throw or invent anything.
  assert.deepEqual(branchPunishments(['辰', '丑', '寅']), []);
});

test('a branch repeated three times is still one self-punishment', () => {
  // Fixture chart 12 has three 午.
  assert.deepEqual(branchPunishments(['午', '午', '卯', '午']), [
    { type: 'self', branches: ['午', '午', '午'] },
    // 卯 alone is not a 子卯 pair.
  ]);
});

test('fixture frequencies reproduce the numbers the ruling was based on', () => {
  // If these move, either the fixture changed or the scope quietly changed.
  let self = 0;
  let trine = 0;
  let pair = 0;
  let withPartials = 0;
  for (const tc of VALIDATION_CHARTS) {
    const chart = calculateBaziChart({ birthDate: tc.date, birthTime: tc.time });
    const branches = [chart.year, chart.month, chart.day, chart.hour].filter(Boolean).map((p) => p.branch);
    const p = chart.punishments;
    if (p.some((x) => x.type === 'self')) self++;
    if (p.some((x) => x.type === 'trine')) trine++;
    if (p.some((x) => x.type === 'pair')) pair++;
    const partial = PUNISHMENT_TRINES.some((t) => t.filter((b) => branches.includes(b)).length >= 2);
    if (p.length > 0 || partial) withPartials++;
  }
  assert.equal(self, 4, '自刑 in 4 of 13 (31%)');
  assert.equal(trine, 0, 'no full 三刑 in the fixture');
  assert.equal(pair, 0, 'no 子卯 in the fixture');
  assert.equal(withPartials, 7, 'counting partials would be 7 of 13 (54%) — why they are excluded');
});
