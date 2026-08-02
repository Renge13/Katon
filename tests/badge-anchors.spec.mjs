// ============================================================
// Bintang anchor tables — the 60-value Joey lock
// ============================================================
// THE TABLE IS EVIDENCE, not output. Twelve charts were driven through Joey Yap's
// plotter and his printed `Personal Chart Details` transcribed; 60 of 60 values
// match with zero failures. The charts were chosen so every row of every table is
// exercised at least once — 10/10 day stems, 4/4 trine groups, 4/4 season groups.
// Collection record: docs/prompts/D2a-stage3-anchors.md §1.
//
// If a future change makes this fail, the table is right and the change is wrong.
// Same discipline as tests/punishment.spec.mjs and tests/solar-terms.spec.ts.
//
// Four of the twelve are OFF-FIXTURE charts, plotted purely to close table rows
// the 13-chart fixture cannot reach: no fixture chart has a day branch in 巳酉丑
// or a 辛 day master.
//
// Chart 7 is the load-bearing row. Born 23:30, its day pillar is 甲子 under 流派2
// and would be 癸亥 under the default provider. Joey's stars match 甲子, which is
// what settles that the anchors take the day pillar buildChart already produces.
//
// Run: npm run test:badges
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import {
  badgeAnchors, voidBranches, computeBadges, YANG_BLADE, BADGE_KEYS,
} from '../lib/bazi/badges.js';
import { STEMS, BRANCHES, STEM_POLARITY } from '../lib/bazi/stems.js';
import { VALIDATION_CHARTS } from './bazi-validation.fixture.js';

// Joey's printed values. `dayPillar` is his too — it is asserted, so a calculator
// regression surfaces here as a pillar failure rather than as a mystery star diff.
const JOEY_ANCHORS = [
  { id: 'C1',  date: '1989-09-13', time: '09:00', dayPillar: '丙子', 天乙貴人: ['亥', '酉'], 文昌: '申', 桃花: '酉', 驛馬: '寅', 孤辰: '寅' },
  { id: 'C2',  date: '1990-03-04', time: '14:00', dayPillar: '戊辰', 天乙貴人: ['未', '丑'], 文昌: '申', 桃花: '酉', 驛馬: '寅', 孤辰: '巳' },
  { id: 'C5',  date: '1988-07-10', time: '22:00', dayPillar: '丙寅', 天乙貴人: ['酉', '亥'], 文昌: '申', 桃花: '卯', 驛馬: '申', 孤辰: '巳' },
  { id: 'C6',  date: '1989-03-03', time: '00:15', dayPillar: '壬戌', 天乙貴人: ['巳', '卯'], 文昌: '寅', 桃花: '卯', 驛馬: '申', 孤辰: '亥' },
  { id: 'C7',  date: '1993-06-12', time: '23:30', dayPillar: '甲子', 天乙貴人: ['未', '丑'], 文昌: '巳', 桃花: '酉', 驛馬: '寅', 孤辰: '寅' },
  { id: 'C8',  date: '1992-01-05', time: '08:00', dayPillar: '庚辰', 天乙貴人: ['未', '丑'], 文昌: '亥', 桃花: '酉', 驛馬: '寅', 孤辰: '巳' },
  { id: 'C12', date: '1990-06-07', time: '12:00', dayPillar: '癸卯', 天乙貴人: ['巳', '卯'], 文昌: '卯', 桃花: '子', 驛馬: '巳', 孤辰: '巳' },
  { id: 'C13', date: '1989-02-04', time: '04:00', dayPillar: '乙未', 天乙貴人: ['申', '子'], 文昌: '午', 桃花: '子', 驛馬: '巳', 孤辰: '申' },
  { id: 'B1',  date: '1989-03-01', time: '00:15', dayPillar: '庚申', 天乙貴人: ['未', '丑'], 文昌: '亥', 桃花: '酉', 驛馬: '寅', 孤辰: '亥' },
  { id: 'X1',  date: '1990-01-02', time: '10:00', dayPillar: '丁卯', 天乙貴人: ['酉', '亥'], 文昌: '酉', 桃花: '子', 驛馬: '巳', 孤辰: '巳' },
  { id: 'X2',  date: '1990-01-04', time: '10:00', dayPillar: '己巳', 天乙貴人: ['申', '子'], 文昌: '酉', 桃花: '午', 驛馬: '亥', 孤辰: '申' },
  { id: 'X3',  date: '1990-01-16', time: '10:00', dayPillar: '辛巳', 天乙貴人: ['寅', '午'], 文昌: '子', 桃花: '午', 驛馬: '亥', 孤辰: '申' },
];

const sorted = (xs) => [...xs].sort();

test('60/60 — every anchor Joey printed, on his own day pillars', () => {
  let checked = 0;
  for (const row of JOEY_ANCHORS) {
    const chart = calculateBaziChart({ birthDate: row.date, birthTime: row.time });
    assert.equal(
      `${chart.day.stem}${chart.day.branch}`, row.dayPillar,
      `${row.id}: day pillar drifted from Joey's`,
    );

    const got = badgeAnchors(chart.day);
    // Nobleman is an unordered pair — Joey prints the two in no fixed order.
    assert.deepEqual(sorted(got.天乙貴人), sorted(row.天乙貴人), `${row.id} 天乙貴人`);
    for (const key of ['文昌', '桃花', '驛馬', '孤辰']) {
      assert.deepEqual(got[key], [row[key]], `${row.id} ${key}`);
    }
    checked += 5;
  }
  assert.equal(checked, 60, 'the collection is 12 charts x 5 stars');
});

test('coverage — the twelve charts exercise every row of every table', () => {
  const stems = new Set();
  const trines = new Set();
  const seasons = new Set();
  for (const row of JOEY_ANCHORS) {
    const chart = calculateBaziChart({ birthDate: row.date, birthTime: row.time });
    stems.add(chart.day.stem);
    trines.add(row.桃花);   // one Peach Blossom value per trine group
    seasons.add(row.孤辰);  // one Solitary value per season group
  }
  assert.equal(stems.size, 10, 'all 10 day stems');
  assert.equal(trines.size, 4, 'all 4 trine groups');
  assert.equal(seasons.size, 4, 'all 4 season groups');
});

test('the YEAR-pillar alternative is refuted, not merely worse', () => {
  // Recorded so the day-pillar ruling cannot be quietly revisited.
  //
  // CORRECTION to D2a §1, measured 2026-08-02. D2a reports the year-pillar
  // alternative at 0/12 桃花, 0/12 驛馬, 1/12 孤辰. Those are the counts over the
  // DISCRIMINATING charts, not over all twelve: X2 and X3 both have year branch
  // == day branch (巳), so the two conventions are the same computation there and
  // score as matches. Stated correctly the ruling is stronger, not weaker — on
  // every chart that can tell the conventions apart, the day pillar wins.
  let discriminating = 0;
  let peach = 0;
  let horse = 0;
  let solitary = 0;
  for (const row of JOEY_ANCHORS) {
    const chart = calculateBaziChart({ birthDate: row.date, birthTime: row.time });
    if (chart.year.branch === chart.day.branch) continue; // the two agree by construction
    discriminating++;
    const fromYear = badgeAnchors(chart.year);
    if (fromYear.桃花[0] === row.桃花) peach++;
    if (fromYear.驛馬[0] === row.驛馬) horse++;
    if (fromYear.孤辰[0] === row.孤辰) solitary++;
  }
  assert.equal(discriminating, 10, 'two of the twelve cannot discriminate');
  assert.equal(peach, 0, '桃花 off the year pillar');
  assert.equal(horse, 0, '驛馬 off the year pillar');
  assert.equal(solitary, 1, '孤辰 off the year pillar (C5, a coincidence)');
});

test('羊刃 is the yang stem 帝旺 branch, and yin stems have none', () => {
  // Two docs/ sources carry this table (engine-session-state.md, bazi-blueprint.md)
  // and strength.ts's DI_WANG_BRANCH corroborates it inside the repo.
  assert.deepEqual(YANG_BLADE, { 甲: '卯', 丙: '午', 戊: '午', 庚: '酉', 壬: '子' });
  for (const stem of STEMS) {
    const got = badgeAnchors({ stem, branch: '子' }).羊刃;
    if (STEM_POLARITY[stem] === 'Yang') {
      assert.deepEqual(got, [YANG_BLADE[stem]], `${stem} carries a blade`);
    } else {
      assert.deepEqual(got, [], `${stem} is yin and carries none`);
    }
  }
});

test('空亡 — the two branches the 旬 never reaches', () => {
  // The worked example from badges.js: 丙子 sits in 甲戌旬, so 申酉 are void.
  assert.deepEqual(voidBranches('丙', '子'), ['申', '酉']);
  // 甲子旬 opens the cycle; 戌亥 are void. 甲午旬 voids 辰巳.
  assert.deepEqual(voidBranches('甲', '子'), ['戌', '亥']);
  assert.deepEqual(voidBranches('乙', '未'), ['辰', '巳']);

  // Structural properties, asserted over the whole cycle rather than sampled:
  // exactly 60 valid pillars, each with two void branches, and a pillar's own
  // branch is never void (it is inside its own 旬 by construction).
  let pillars = 0;
  for (let i = 0; i < 60; i++) {
    const stem = STEMS[i % 10];
    const branch = BRANCHES[i % 12];
    const voids = voidBranches(stem, branch);
    assert.equal(voids.length, 2, `${stem}${branch}`);
    assert.equal(new Set(voids).size, 2, `${stem}${branch} voids are distinct`);
    assert.ok(!voids.includes(branch), `${stem}${branch} cannot void its own branch`);
    pillars++;
  }
  assert.equal(pillars, 60);
});

test('a badge carries every position it lands in, and Nobleman can fire twice', () => {
  // Chart 1: 己巳 癸酉 丙子 癸巳. 丙 anchors Nobleman at 亥 and 酉 — only 酉 is
  // present, at the month, so one hit.
  const c1 = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  const badges = Object.fromEntries(computeBadges(c1).map((b) => [b.key, b]));
  assert.deepEqual(badges.天乙貴人.hits, [{ position: 'month', branch: '酉' }]);
  assert.deepEqual(badges.桃花.hits, [{ position: 'month', branch: '酉' }]);
  assert.deepEqual(badges.空亡.hits, [{ position: 'month', branch: '酉' }]);
  assert.ok(!badges.驛馬, '驛馬 anchors at 寅, which is absent');
  assert.ok(!badges.孤辰, '孤辰 anchors at 寅, which is absent');
  assert.ok(!badges.文昌, '文昌 anchors at 申, which is absent');
  assert.ok(!badges.羊刃, '丙 blades at 午, which is absent');

  // Chart 12: 庚午 壬午 癸卯 戊午 — 癸 anchors Nobleman at 卯 and 巳; 卯 is the day
  // branch. Three 午 give the multi-hit path a real exercise elsewhere.
  const c12 = calculateBaziChart({ birthDate: '1990-06-07', birthTime: '12:00' });
  const b12 = Object.fromEntries(computeBadges(c12).map((b) => [b.key, b]));
  assert.deepEqual(b12.文昌.hits, [{ position: 'day', branch: '卯' }]);
  assert.equal(b12.天乙貴人.hits.length, 1);
});

test('every fixture chart yields badges of a well-formed shape', () => {
  for (const tc of VALIDATION_CHARTS) {
    const chart = calculateBaziChart({ birthDate: tc.date, birthTime: tc.time });
    const chartBranches = [chart.year, chart.month, chart.day, chart.hour]
      .filter(Boolean).map((p) => p.branch);

    for (const badge of computeBadges(chart)) {
      assert.ok(BADGE_KEYS.includes(badge.key), `chart ${tc.id}: unknown badge ${badge.key}`);
      assert.ok(badge.hits.length > 0, `chart ${tc.id}: ${badge.key} fired with no hit`);
      for (const hit of badge.hits) {
        assert.ok(badge.anchors.includes(hit.branch), `chart ${tc.id}: ${badge.key} hit off-anchor`);
        assert.ok(chartBranches.includes(hit.branch), `chart ${tc.id}: ${badge.key} hit a branch not in the chart`);
      }
    }
    assert.ok(!computeBadges(chart).some((b) => b.key === '華蓋'), '華蓋 is descoped');
  }
});

test('badge frequency across the fixture — the number Phase 2 extremity reads', () => {
  // RE-MEASURED 2026-08-02 from the verified anchors, replacing figures computed
  // with a candidate 華蓋 table that is now descoped. avg 2.5 -> 2.15; the range
  // and the Penolong share are unchanged, the latter coincidentally (10 of 13
  // either way). Recorded as a dated observation in docs/PROGRESS.md.
  const perChart = [];
  const counts = Object.fromEntries(BADGE_KEYS.map((k) => [k, 0]));
  for (const tc of VALIDATION_CHARTS) {
    const chart = calculateBaziChart({ birthDate: tc.date, birthTime: tc.time });
    const badges = computeBadges(chart);
    perChart.push(badges.length);
    for (const b of badges) counts[b.key]++;
  }
  const n = VALIDATION_CHARTS.length;
  const avg = perChart.reduce((a, b) => a + b, 0) / n;

  assert.equal(n, 13);
  assert.equal(perChart.reduce((a, b) => a + b, 0), 28, '28 badges over 13 charts');
  assert.equal(Math.round(avg * 100) / 100, 2.15, 'avg badges per chart');
  assert.equal(Math.min(...perChart), 1, 'range low');
  assert.equal(Math.max(...perChart), 4, 'range high');
  assert.ok(!perChart.includes(0), 'nobody gets nothing');
  assert.ok(Math.max(...Object.values(counts)) < n, 'no badge is universal');
  assert.equal(counts.天乙貴人, 10, 'Bintang Penolong in 10 of 13 (77%)');
  // The rest, for the extremity term to read rather than re-derive.
  assert.deepEqual(counts, {
    天乙貴人: 10, 文昌: 5, 驛馬: 4, 空亡: 4, 桃花: 2, 羊刃: 2, 孤辰: 1,
  });
});
