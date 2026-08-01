// ============================================================
// Main Profile rule experiment (analysis only — changes no engine code)
// ============================================================
// Tests candidate Main Profile rules against the 12-chart fixture to identify
// the real algorithm. Prints:
//   A. detailed breakdown of the 6 charts failing the current rule
//   B. pass count of each candidate rule across all 12
//   C. a whole-chart scan for the fixture's expected Ten God (to locate the
//      real source when the month branch cannot produce it)
//
// Fixture values are treated as authoritative (verified against source PDFs).
// Run: node tests/bazi-profile-experiment.mjs
// ============================================================

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { STEM_ELEMENTS, HIDDEN_STEMS } from '../lib/bazi/stems.js';
import { tenGod } from '../lib/bazi/tenGods.js';
import { VALIDATION_CHARTS } from './bazi-validation.fixture.js';

const QI = ['main', 'middle', 'residual'];

// The four Heavenly Stems, with a flag for the Day Master's own stem.
function heavenlyStems(chart) {
  const s = [
    { pos: 'year', stem: chart.year.stem, isDM: false },
    { pos: 'month', stem: chart.month.stem, isDM: false },
    { pos: 'day', stem: chart.day.stem, isDM: true },
  ];
  if (chart.hour) s.push({ pos: 'hour', stem: chart.hour.stem, isDM: false });
  return s;
}

// element set of the reveal group. mode: 'four' = all 4 stems (incl DM);
// 'three' = exclude the Day Master's own stem.
function revealElements(chart, mode) {
  return new Set(
    heavenlyStems(chart)
      .filter((s) => (mode === 'three' ? !s.isDM : true))
      .map((s) => STEM_ELEMENTS[s.stem]),
  );
}

function monthHidden(chart, dm) {
  const branch = chart.month.branch;
  return (HIDDEN_STEMS[branch] || []).map((h, i) => ({
    qi: QI[i] || `h${i}`,
    stem: h.stem,
    element: STEM_ELEMENTS[h.stem],
    ...tenGod(dm, h.stem),
  }));
}

// ── Candidate rules → return the chosen hidden-stem entry ──
// R_A: first REVEALED (reveal = 4 stems incl DM) in qi order, else main-qi
function ruleA(hidden, revealed) {
  return hidden.find((h) => revealed.has(h.element)) || hidden[0];
}
// R_B: first REVEALED (reveal = 3 stems excl DM), else main-qi  [current engine]
function ruleB(hidden, revealed) {
  return hidden.find((h) => revealed.has(h.element)) || hidden[0];
}
// R_C: main-qi ALWAYS (ignore revelation)
function ruleC(hidden) {
  return hidden[0];
}
// R_D: main-qi DEFAULT; step to first revealed SECONDARY only if main-qi is
//      NOT itself revealed; else main-qi. (reveal = 4 stems)
function ruleD(hidden, revealed) {
  if (revealed.has(hidden[0].element)) return hidden[0];        // main-qi confirmed
  const sec = hidden.slice(1).find((h) => revealed.has(h.element));
  return sec || hidden[0];                                      // else revealed secondary, else main-qi
}

const rows = VALIDATION_CHARTS.map((tc) => {
  const chart = calculateBaziChart({ birthDate: tc.date, birthTime: tc.time });
  const dm = chart.day.stem;
  const hidden = monthHidden(chart, dm);
  const rev4 = revealElements(chart, 'four');
  const rev3 = revealElements(chart, 'three');
  return {
    tc, chart, dm, hidden, rev4, rev3,
    A: ruleA(hidden, rev4).hanzi,
    B: ruleB(hidden, rev3).hanzi,
    C: ruleC(hidden).hanzi,
    D: ruleD(hidden, rev4).hanzi,
    exp: tc.expect.mainProfileHanzi,
  };
});

// ── A. detailed breakdown of the charts the current rule (B) fails ──
console.log('══════ FAILING-CHART BREAKDOWN (current rule = R_B) ══════');
for (const r of rows.filter((x) => x.B !== x.exp)) {
  console.log(`\n#${r.tc.id} ${r.tc.date} ${r.tc.time}  DM ${r.dm}  month ${r.chart.month.branch}`);
  console.log(`   4 heavenly stems: ${heavenlyStems(r.chart).map((s) => s.stem + (s.isDM ? '(DM)' : '')).join(' ')}`);
  console.log(`   month hidden stems (qi order):`);
  for (const h of r.hidden) {
    const rev4 = r.rev4.has(h.element) ? 'revealed(4)' : '—';
    const rev3 = r.rev3.has(h.element) ? 'revealed(3,exclDM)' : '—';
    console.log(`     ${h.qi.padEnd(8)} ${h.stem}(${h.element}) → ${h.hanzi}/${h.label}   [${rev4}, ${rev3}]`);
  }
  console.log(`   expected: ${r.exp}`);
  console.log(`   → R_B(first-revealed,exclDM)=${r.B}  R_A(first-revealed,4)=${r.A}  R_C(main-qi)=${r.C}  R_D(main-default+tiebreak)=${r.D}`);
  const inBranch = r.hidden.some((h) => h.hanzi === r.exp);
  console.log(`   expected Ten God present among month-branch hidden stems? ${inBranch ? 'YES' : 'NO — impossible from this month branch'}`);
}

// ── B. pass counts ──
const count = (key) => rows.filter((r) => r[key] === r.exp).length;
console.log('\n\n══════ RULE PASS COUNTS (out of 12) ══════');
console.log(`   R_A  first-revealed, reveal=4 stems (incl DM), else main-qi : ${count('A')}/12`);
console.log(`   R_B  first-revealed, reveal=3 stems (excl DM), else main-qi : ${count('B')}/12   [current engine]`);
console.log(`   R_C  main-qi ALWAYS                                        : ${count('C')}/12`);
console.log(`   R_D  main-qi default + revealed-secondary tiebreak (4)     : ${count('D')}/12   [hypothesis]`);

console.log('\n   per-chart:  id | exp | A  | B  | C  | D');
for (const r of rows) {
  const mark = (v) => `${v}${v === r.exp ? '✓' : ' '}`;
  console.log(`   ${String(r.tc.id).padStart(2)} | ${r.exp} | ${mark(r.A)}| ${mark(r.B)}| ${mark(r.C)}| ${mark(r.D)}`);
}

// ── C. whole-chart scan for the expected Ten God ──
// Where does the fixture's expected profile actually live in the chart?
console.log('\n\n══════ WHOLE-CHART LOCATION OF THE EXPECTED PROFILE ══════');
for (const r of rows) {
  const dm = r.dm;
  const locs = [];
  const stems = heavenlyStems(r.chart);
  for (const s of stems) {
    if (!s.isDM && tenGod(dm, s.stem).hanzi === r.exp) locs.push(`${s.pos}-stem ${s.stem}`);
  }
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const p = r.chart[pos];
    if (!p) continue;
    (HIDDEN_STEMS[p.branch] || []).forEach((h, i) => {
      if (tenGod(dm, h.stem).hanzi === r.exp) locs.push(`${pos}-branch ${p.branch}/${QI[i] || i} ${h.stem}`);
    });
  }
  const flag = r.B === r.exp ? '   ' : ' * ';
  console.log(`${flag}#${String(r.tc.id).padStart(2)} exp ${r.exp}: ${locs.length ? locs.join(' | ') : 'NOT PRESENT ANYWHERE IN CHART'}`);
}
