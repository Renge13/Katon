// scripts/validate-bazi.mjs
// BaZi calculator validation — run with `npm run test:bazi`.
//
// Strategy (since no live Joey Yap calculator is available in CI):
//
//  1. DAY PILLAR — an INDEPENDENT reference (`refDayPillar`) computes the day
//     pillar by simple modular day-counting from the documented anchor
//     1900-01-01 = 甲戌. Before it is trusted, it is self-checked against an
//     externally-validated ground-truth day pillar: Reyner's real chart
//     1989-09-13 = 丙子 (confirmed against a real calculator + felt experience,
//     per CLAUDE.md). The day cycle is a continuous 60-day sexagenary loop, so a
//     single real-world-pinned point + correct arithmetic determines every other
//     day. The app's calculateBaziChart is then cross-checked against this
//     reference across 20 dates spanning 1900–2025 (incl. leap days) to catch any
//     boundary/timezone drift.
//
//  2. YEAR + MONTH PILLAR — hard-coded authoritative expectations around 立春 and
//     solar-term boundaries (the parts most implementations get wrong). Values
//     follow standard 立春/solar-term rules.
//
//  3. Full reference chart — Reyner: 1989-09-13 → 丙子 → Matahari → missing Wood,
//     dominant Water.
//
// NOTE: the bazi-calculator skill's INLINE "known dates" (e.g. 1984-01-01=甲子,
// 2000-10-01=庚辰) were found to be ERRONEOUS and mutually inconsistent (it claims
// both 1984-01-01 and 2024-01-01 are 甲子, impossible 40 years apart). They are
// deliberately NOT used here. The app calculator is correct; the skill text is not.

import { calculateBaziChart } from '../lib/bazi/index.js';

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// Independent day-pillar reference. Anchor: 1900-01-01 = 甲戌 (stem 0, branch 10).
function refDayPillar(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const days = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1900, 0, 1)) / 86400000);
  const s = ((0 + days) % 10 + 10) % 10;
  const b = ((10 + days) % 12 + 12) % 12;
  return STEMS[s] + BRANCHES[b];
}

let failures = 0;
const log = (ok, msg, extra = '') => {
  if (!ok) failures++;
  console.log(`${ok ? '✓' : '✗'} ${msg}${extra ? '  ' + extra : ''}`);
};

// --- 0. Trust the independent reference only after pinning it to ground truth ---
console.log('— reference self-check (against externally-validated day pillars) —');
const GROUND_TRUTH = {
  '1989-09-13': '丙子', // Reyner — real-world validated
  '1900-01-01': '甲戌', // documented anchor
  '2024-01-01': '甲子', // jiazi reset
};
let refSound = true;
for (const [date, exp] of Object.entries(GROUND_TRUTH)) {
  const got = refDayPillar(date);
  const ok = got === exp;
  if (!ok) refSound = false;
  log(ok, `ref ${date} = ${got}`, ok ? '' : `(expected ${exp})`);
}
if (!refSound) {
  console.error('\nABORT: independent reference does not reproduce ground truth.');
  process.exit(1);
}

// --- 1. DAY PILLAR: app vs independent reference, 20 dates ---
console.log('\n— day pillar: calculateBaziChart vs independent reference (20 dates) —');
const DAY_DATES = [
  '1900-01-01', '1949-10-01', '1970-01-01', '1984-01-01', '1984-02-03',
  '1984-02-05', '1988-12-31', '1989-09-13', '1990-01-20', '1995-04-04',
  '2000-01-01', '2000-10-01', '2008-08-08', '2012-02-29', '2016-02-29',
  '2020-01-01', '2022-02-03', '2022-02-04', '2024-01-01', '2025-01-01',
];
for (const date of DAY_DATES) {
  const c = calculateBaziChart({ birthDate: date, birthTime: '12:00' });
  const got = `${c.day.stem}${c.day.branch}`;
  const exp = refDayPillar(date);
  log(got === exp, `${date} → ${got}`, got === exp ? '' : `(ref ${exp})`);
}

// --- 2. YEAR + MONTH PILLAR: solar-term / 立春 boundary cases ---
console.log('\n— year + month pillar: solar-term boundary cases —');
const SOLAR_CASES = [
  { date: '2000-10-01', year: '庚辰', monthBranch: '酉' },
  { date: '2022-02-04', year: '壬寅', monthBranch: '寅' }, // on/after 立春
  { date: '2022-02-03', year: '辛丑', monthBranch: '丑' }, // before 立春 → prior year
  { date: '1984-01-01', year: '癸亥', monthBranch: '子' }, // before 立春 1984 → 1983 BaZi year
  { date: '1984-02-03', year: '癸亥', monthBranch: '丑' }, // before 立春 1984
  { date: '1984-02-05', year: '甲子', monthBranch: '寅' }, // after 立春 1984
];
for (const tc of SOLAR_CASES) {
  const c = calculateBaziChart({ birthDate: tc.date, birthTime: '12:00' });
  const gotYear = `${c.year.stem}${c.year.branch}`;
  const okYear = gotYear === tc.year;
  log(okYear, `${tc.date} year = ${gotYear}`, okYear ? '' : `(expected ${tc.year})`);
  const okMonth = c.month.branch === tc.monthBranch;
  log(okMonth, `${tc.date} month branch = ${c.month.branch}`, okMonth ? '' : `(expected ${tc.monthBranch})`);
}

// --- 3. Full reference chart (Reyner) ---
console.log('\n— reference chart: Reyner 1989-09-13 09:00 —');
const r = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
log(`${r.day.stem}${r.day.branch}` === '丙子', `day pillar = ${r.day.stem}${r.day.branch}`, '(expect 丙子)');
log(r.dayMaster.stem === '丙', `day master = ${r.dayMaster.stem}`, '(expect 丙)');
const missing = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'].find((e) => (r.elementBalance[e] || 0) === 0);
log(missing === 'Wood', `missing element = ${missing}`, '(expect Wood)');
let dom = null, max = 0;
for (const e of ['Wood', 'Fire', 'Earth', 'Metal', 'Water']) {
  if ((r.elementBalance[e] || 0) > max) { max = r.elementBalance[e]; dom = e; }
}
log(dom === 'Water', `dominant element = ${dom}`, '(expect Water)');

// --- summary ---
console.log(`\n${failures === 0 ? 'PASS' : 'FAIL'} — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
