#!/usr/bin/env node
/**
 * Katon — solar-term triple-oracle boundary diff.
 *
 * Compares the 12 節 (BaZi month-starting solar terms) across 1930–2030 between:
 *   A) tyme4ts        — the production calculator (寿星天文历 lineage, pure TS)
 *   B) astronomy-engine — independent VSOP87-class ephemeris, root-finds apparent
 *                         geocentric solar longitude at multiples of 15°
 *
 * (sxtwl 2.0.7 is the third oracle; run scripts/oracle-sxtwl.py separately — it is
 *  Python/C++ and must never enter the Vercel build.)
 *
 * WHY THIS EXISTS: the 得令 factor of the strength engine depends entirely on a correct
 * Month Branch, which depends entirely on these 1,212 instants. A day-level disagreement
 * here is a silently wrong reading. This script is the proof, and the regression lock.
 *
 * MEASURED BASELINE (2026-07-29, tyme4ts 1.5.2 / astronomy-engine 2.1.19):
 *   median |Δ| = 9 s · p99 = 38 s · max = 52 s
 *   DAY-level disagreements: 0 / 1212      ← the only number that can fail the build
 *   HOUR-label disagreements: 5            ← irrelevant; hour pillar is not 節氣-derived
 *
 * Usage:  npm i -D tyme4ts astronomy-engine && node solar-term-oracle-diff.mjs [--json]
 * Exit 1 on any DAY-level disagreement.
 */

import * as A from 'astronomy-engine';
import { SolarTerm } from 'tyme4ts';

const Y0 = 1930;
const Y1 = 2030;

// name → [tyme4ts SolarTerm index, apparent solar longitude °, usual Gregorian month]
// tyme4ts index: 0=冬至 1=小寒 2=大寒 3=立春 4=雨水 5=驚蟄 ... (step 1 per term)
const JIE = {
  立春: [3, 315, 2, '寅'],
  驚蟄: [5, 345, 3, '卯'],
  清明: [7, 15, 4, '辰'],
  立夏: [9, 45, 5, '巳'],
  芒種: [11, 75, 6, '午'],
  小暑: [13, 105, 7, '未'],
  立秋: [15, 135, 8, '申'],
  白露: [17, 165, 9, '酉'],
  寒露: [19, 195, 10, '戌'],
  立冬: [21, 225, 11, '亥'],
  大雪: [23, 255, 12, '子'],
  小寒: [1, 285, 1, '丑'],
};

/**
 * TRAP: tyme4ts's JulianDay is UTC+8-BASED, not UT-based. Subtracting the Unix JD
 * epoch yields an epoch-ms value that is ALREADY UTC+8 civil time wearing a UTC label.
 * Do not "convert to +08" afterwards or you introduce an 8-hour error that flips
 * month branches. Asserted below against two known 1989 instants.
 */
const JD_UNIX_EPOCH = 2440587.5;
const tymeCivilMs = (jd) => (jd - JD_UNIX_EPOCH) * 86400e3;

// astronomy-engine returns a true UTC instant; shift to UTC+8 civil for comparison.
const aeCivilMs = (astroTime) => astroTime.date.getTime() + 8 * 3600e3;

const iso = (ms) => new Date(Math.round(ms / 1000) * 1000).toISOString().slice(0, 19);
const atDay = (ms) => iso(ms).slice(0, 10);
const atHour = (ms) => iso(ms).slice(0, 13);
const atMinute = (ms) => iso(ms).slice(0, 16);

function tymeTerm(year, name) {
  return tymeCivilMs(SolarTerm.fromIndex(year, JIE[name][0]).getJulianDay().getDay());
}

function aeTerm(year, name) {
  const [, lon, month] = JIE[name];
  const start = new A.AstroTime(new Date(Date.UTC(year, month - 1, 1)));
  const t = A.SearchSunLongitude(lon, start, 40);
  if (!t) throw new Error(`SearchSunLongitude found no solution: ${year} ${name}`);
  return aeCivilMs(t);
}

// ---- sanity gate: catches the UTC+8 JD trap before any diffing happens -------------
function assertKnownInstants() {
  const checks = [
    [1989, '立春', '1989-02-04T04:27'],
    [1989, '白露', '1989-09-07T23:53'],
  ];
  for (const [y, name, expect] of checks) {
    const got = atMinute(tymeTerm(y, name));
    if (got !== expect) {
      console.error(
        `FATAL: tyme4ts JD interpretation is wrong.\n` +
          `  ${y} ${name}: expected ~${expect} (+08), got ${got}\n` +
          `  An 8-hour delta here means the UTC+8-based Julian Day was double-shifted.`
      );
      process.exit(1);
    }
  }
}

function main() {
  assertKnownInstants();

  const rows = [];
  for (let y = Y0; y <= Y1; y++) {
    for (const name of Object.keys(JIE)) {
      const ty = tymeTerm(y, name);
      const ae = aeTerm(y, name);
      rows.push({
        year: y,
        term: name,
        branch: JIE[name][3],
        tyme: iso(ty),
        ae: iso(ae),
        deltaSec: Math.round((ty - ae) / 1000),
        dDay: atDay(ty) !== atDay(ae),
        dHour: atHour(ty) !== atHour(ae),
        dMinute: atMinute(ty) !== atMinute(ae),
      });
    }
  }

  if (process.argv.includes('--json')) {
    process.stdout.write(JSON.stringify(rows));
    return;
  }

  const abs = rows.map((r) => Math.abs(r.deltaSec)).sort((a, b) => a - b);
  const q = (p) => abs[Math.floor(abs.length * p)];
  const dayFails = rows.filter((r) => r.dDay);

  console.log(`\nKaton solar-term oracle diff — ${rows.length} 節 boundaries, ${Y0}–${Y1}`);
  console.log(`  tyme4ts 寿星天文历  vs  astronomy-engine (independent ephemeris)\n`);
  console.log(`  |Δ| seconds   min ${abs[0]}  median ${q(0.5)}  p99 ${q(0.99)}  MAX ${abs.at(-1)}`);
  console.log(`  disagree @ MINUTE  ${rows.filter((r) => r.dMinute).length} / ${rows.length}`);
  console.log(`  disagree @ HOUR    ${rows.filter((r) => r.dHour).length}      (tolerated)`);
  console.log(`  disagree @ DAY     ${dayFails.length}      <-- must be 0\n`);

  console.log('  worst 8 divergences:');
  rows
    .slice()
    .sort((a, b) => Math.abs(b.deltaSec) - Math.abs(a.deltaSec))
    .slice(0, 8)
    .forEach((r) =>
      console.log(
        `    ${r.year} ${r.term}(${r.branch})  tyme=${r.tyme}  ae=${r.ae}  Δ=${r.deltaSec}s`
      )
    );

  if (dayFails.length) {
    console.error('\nFAIL — day-level disagreement. A Month Branch is at stake:\n');
    dayFails.forEach((r) =>
      console.error(`  ${r.year} ${r.term}(${r.branch})  tyme=${r.tyme}  ae=${r.ae}`)
    );
    process.exit(1);
  }

  const drift = abs.at(-1);
  if (drift > 120) {
    console.warn(`\nWARN — max |Δ| ${drift}s exceeds the 120s baseline envelope.`);
    console.warn('  A dependency bump may have changed the ephemeris. Investigate.');
  }
  console.log('\nPASS — no day-level disagreement. Month Branch assignment is safe.\n');
}

main();
