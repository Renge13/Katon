// ============================================================
// BaZi engine validation report (Tasks 2–7)
// ============================================================
// Runs the engine against the 12-chart ground-truth fixture and prints:
//   Task 2 — four pillars, computed vs expected (incl. boundary edge cases)
//   Task 3 — every Ten God assignment per chart (PDF spot-check)
//   Task 4 — Track A canonical Main Profile === expected  [12/12 target]
//   Task 5 — Track B: bars top-3 rank order + loud alternatives (MARGIN)
//   Task 6 — no-hour: Day Master + Track-A profile unchanged
//   Task 7 — summary table + every failure's specific mismatch
//
// Run: node tests/bazi-engine.report.mjs
// ============================================================

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { computeChart } from '../lib/bazi/computeChart.js';
import { tenGodsForChart, TEN_GOD_LABEL } from '../lib/bazi/tenGods.js';
import { mainProfile } from '../lib/bazi/mainProfile.js';
import { tenGodTally, loudAlternatives, LOUD_MARGIN } from '../lib/bazi/tenGodTally.js';
import { VALIDATION_CHARTS, PILLAR_EDGE_CASES } from './bazi-validation.fixture.js';

const tick = (ok) => (ok ? '✓' : '✗');
const pillarStr = (p) => (p ? `${p.stem}${p.branch}` : '——');
const fx = (n) => n.toFixed(1);

const failures = [];
const record = (id, task, detail) => failures.push({ id, task, detail });

const results = [];

for (const tc of VALIDATION_CHARTS) {
  const { id, date, time, expect } = tc;
  const chart = calculateBaziChart({ birthDate: date, birthTime: time });
  const tg = tenGodsForChart(chart);
  const profile = mainProfile(chart, { silent: true });
  const tally = tenGodTally(chart);
  const loud = loudAlternatives(tally, profile.hanzi);

  // ---- Task 2: pillars ----
  const dmOk = chart.day.stem === expect.dayMaster;
  const dmElOk = chart.day.element === expect.dayMasterElement;
  const monthBrOk = chart.month.branch === expect.monthBranch;
  const edge = PILLAR_EDGE_CASES[id] || {};
  const edgeChecks = [];
  if (edge.year)  edgeChecks.push(['year', pillarStr(chart.year), edge.year]);
  if (edge.month) edgeChecks.push(['month', pillarStr(chart.month), edge.month]);
  if (edge.day)   edgeChecks.push(['day', pillarStr(chart.day), edge.day]);
  if (edge.hour)  edgeChecks.push(['hour', pillarStr(chart.hour), edge.hour]);
  const edgeOk = edgeChecks.every(([, got, exp]) => got === exp);
  const pillarsOk = dmOk && dmElOk && monthBrOk && edgeOk;
  if (!pillarsOk) {
    const bits = [];
    if (!dmOk) bits.push(`dayMaster ${chart.day.stem}≠${expect.dayMaster}`);
    if (!dmElOk) bits.push(`element ${chart.day.element}≠${expect.dayMasterElement}`);
    if (!monthBrOk) bits.push(`monthBranch ${chart.month.branch}≠${expect.monthBranch}`);
    for (const [name, got, exp] of edgeChecks) if (got !== exp) bits.push(`${name} ${got}≠${exp}`);
    record(id, 'pillars', bits.join(', '));
  }

  // ---- Task 3 sanity ----
  const tenGodsOk =
    tg.stems.every((s) => s.isDayMaster || (s.hanzi && s.label)) &&
    tg.hidden.every((h) => h.hanzi && h.label) &&
    tg.stems.find((s) => s.isDayMaster)?.hanzi === '比肩';
  if (!tenGodsOk) record(id, 'tenGods', 'incomplete or self-check failed');

  // ---- Task 4: Track A ----
  const profileOk = profile.hanzi === expect.mainProfileHanzi;
  if (!profileOk) {
    const inBranch = (chart.month.branch, true); // detail printed below
    record(id, 'profileA',
      `got ${profile.hanzi}/${profile.label} (root ${profile.rootQi}-qi ${profile.rootStem}` +
      `${profile.fallback ? ',FALLBACK' : ',revealed'}) ≠ expected ${expect.mainProfileHanzi}/${expect.mainProfileLabel}`);
  }

  // ---- Task 5a: bars rank order (top-3) ----
  const engineTop3 = tally.ranked.slice(0, 3).map((r) => r.hanzi);
  const expTop3 = expect.topThreeBars.map((b) => b.god);
  const barsRankOk = engineTop3.every((g, i) => g === expTop3[i]);
  if (!barsRankOk) {
    record(id, 'barsRankB',
      `top3 [${engineTop3.join(',')}] ≠ expected [${expTop3.join(',')}]`);
  }

  // ---- Task 6: no-hour stability ----
  const noHour = computeChart(date, null, { silent: true });
  const dmStable = noHour.dayMaster === chart.day.stem;
  const profileStable = noHour.mainProfile.hanzi === profile.hanzi;
  const noHourStable = dmStable && profileStable;
  if (!noHourStable) {
    const bits = [];
    if (!dmStable) bits.push(`DM ${noHour.dayMaster}≠${chart.day.stem}`);
    if (!profileStable) bits.push(`profile ${noHour.mainProfile.hanzi}≠${profile.hanzi}`);
    record(id, 'noHourStable', bits.join(', '));
  }

  results.push({
    tc, chart, tg, profile, tally, loud, noHour,
    pillarsOk, tenGodsOk, profileOk, barsRankOk, noHourStable,
    edgeChecks, engineTop3, expTop3,
  });
}

// ── Task 2 ──
console.log('\n══════════════ TASK 2 — FOUR PILLARS ══════════════');
for (const r of results) {
  const { tc, chart, pillarsOk, edgeChecks } = r;
  console.log(`\n#${String(tc.id).padStart(2)} ${tc.date} ${tc.time} ${tc.gender}  ${tick(pillarsOk)}`);
  console.log(`    year ${pillarStr(chart.year)} | month ${pillarStr(chart.month)} | day ${pillarStr(chart.day)} | hour ${pillarStr(chart.hour)}`);
  if (chart.boundaryFlag) console.log(`    ⚠ boundary: ${chart.boundaryReason}`);
  console.log(`    DM ${chart.day.stem}(${chart.day.element}) ${tick(chart.day.stem === tc.expect.dayMaster && chart.day.element === tc.expect.dayMasterElement)}  ·  monthBr ${chart.month.branch} ${tick(chart.month.branch === tc.expect.monthBranch)}  [expect ${tc.expect.dayMaster}/${tc.expect.dayMasterElement}, ${tc.expect.monthBranch}]`);
  for (const [name, got, exp] of edgeChecks) console.log(`    edge ${name}: ${got} ${tick(got === exp)} [expect ${exp}]`);
}

// ── Task 3 ──
console.log('\n\n══════════════ TASK 3 — TEN GODS ══════════════');
for (const r of results) {
  const { tc, chart, tg } = r;
  console.log(`\n#${String(tc.id).padStart(2)} DM ${tg.dayMaster}(${chart.day.element})`);
  console.log(`    stems : ${tg.stems.map((s) => `${s.pos}:${s.stem}${s.isDayMaster ? '(自·比肩)' : `→${s.hanzi}`}`).join('  ')}`);
  console.log(`    hidden: ${tg.hidden.map((h) => `${h.pos}·${h.branch}/${h.qi}:${h.stem}→${h.hanzi}`).join('  ')}`);
}

// ── Task 4 ──
console.log('\n\n══════════════ TASK 4 — TRACK A CANONICAL MAIN PROFILE ══════════════');
let pA = 0;
for (const r of results) {
  if (r.profileOk) pA++;
  const branchHiddenGods = (r.chart.month.branch);
  console.log(`#${String(r.tc.id).padStart(2)} ${tick(r.profileOk)} got ${r.profile.hanzi}/${r.profile.label} (root ${r.profile.rootQi}-qi ${r.profile.rootStem}, ${r.profile.fallback ? 'FALLBACK' : 'revealed'}) | expect ${r.tc.expect.mainProfileHanzi}/${r.tc.expect.mainProfileLabel}`);
}
console.log(`\n  Track A: ${pA}/${VALIDATION_CHARTS.length} match ground truth`);

// ── Task 5a: bars ──
console.log('\n\n══════════════ TASK 5a — TRACK B BARS (top-3 rank order) ══════════════');
let pBars = 0;
for (const r of results) {
  if (r.barsRankOk) pBars++;
  const engineFull = r.tally.ranked.map((x) => `${x.hanzi}${fx(x.percent)}`).join(' ');
  console.log(`#${String(r.tc.id).padStart(2)} ${tick(r.barsRankOk)} engine[${r.engineTop3.join(',')}] vs expect[${r.expTop3.join(',')}]`);
  console.log(`     full: ${engineFull}`);
}
console.log(`\n  Track B bars rank: ${pBars}/${VALIDATION_CHARTS.length} match`);

// ── Task 5b: loud alternatives ──
console.log(`\n\n══════════════ TASK 5b — LOUD ALTERNATIVES (MARGIN=${LOUD_MARGIN} pct-pts) ══════════════`);
for (const r of results) {
  const alts = r.loud.alternatives;
  const altStr = alts.length
    ? alts.map((a) => `${a.hanzi}/${a.label} (${fx(a.percent)}%, gap ${fx(a.gap)})`).join('; ')
    : '(none)';
  console.log(`#${String(r.tc.id).padStart(2)} profile ${r.profile.hanzi} @ ${fx(r.loud.profilePercent)}%  → loud: ${altStr}`);
}

// ── Task 6 ──
console.log('\n\n══════════════ TASK 6 — NO-HOUR STABILITY ══════════════');
console.log('  id | withHour DM/profile | noHour DM/profile | stable | (Track B top shifts — informational)');
for (const r of results) {
  const wh = `${r.chart.day.stem}/${r.profile.hanzi}`.padEnd(6);
  const nh = `${r.noHour.dayMaster}/${r.noHour.mainProfile.hanzi}`.padEnd(6);
  const barShift = `${r.tally.ranked[0].hanzi}→${r.noHour.bars[0].hanzi}`;
  console.log(`  ${String(r.tc.id).padStart(2)} | ${wh}            | ${nh}          | ${tick(r.noHourStable)}     | topBar ${barShift}`);
  // A 節-day birth with no time has a genuinely undetermined month pillar — the
  // boundary falls inside the birth day, so no convention can recover it and the
  // Track-A profile legitimately moves. Print WHY so it is not read as a
  // calculator error. (Same behaviour as the old hand-rolled calculator, which
  // also probed noon; chart 13 is simply the first fixture row that exposes it.)
  if (!r.noHourStable && r.noHour.chart.boundaryFlag) {
    console.log(`     └─ expected: ${r.noHour.chart.boundaryReason}`);
  }
}

// ── Task 7 ──
console.log('\n\n══════════════ TASK 7 — SUMMARY ══════════════');
console.log('  id | pillars | tenGods | profileA | barsRankB | noHourStable | loudAlts');
console.log('  ---+---------+---------+----------+-----------+--------------+---------');
for (const r of results) {
  const loudList = r.loud.alternatives.map((a) => a.hanzi).join(',') || '—';
  console.log(
    `  ${String(r.tc.id).padStart(2)} |    ${tick(r.pillarsOk)}    |    ${tick(r.tenGodsOk)}    |    ${tick(r.profileOk)}     |     ${tick(r.barsRankOk)}     |      ${tick(r.noHourStable)}       | ${loudList}`,
  );
}

console.log('\n  Failures:');
if (failures.length === 0) console.log('    (none)');
else for (const f of failures) console.log(`    #${f.id} [${f.task}] ${f.detail}`);

const tallies = {
  pillars: results.filter((r) => r.pillarsOk).length,
  tenGods: results.filter((r) => r.tenGodsOk).length,
  profileA: results.filter((r) => r.profileOk).length,
  barsRankB: results.filter((r) => r.barsRankOk).length,
  noHourStable: results.filter((r) => r.noHourStable).length,
};
const N = VALIDATION_CHARTS.length;
console.log(`\n  Totals /${N} — pillars ${tallies.pillars} · tenGods ${tallies.tenGods} · profileA ${tallies.profileA} · barsRankB ${tallies.barsRankB} · noHourStable ${tallies.noHourStable}`);
