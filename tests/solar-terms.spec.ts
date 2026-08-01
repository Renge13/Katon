// ============================================================
// Solar-term regression LOCK — tyme4ts vs an independent ephemeris
// ============================================================
// Asserts that tyme4ts's 節 boundaries still agree with
// tests/solar-terms.fixture.json (astronomy-engine, apparent geocentric solar
// longitude) across all 1,212 month boundaries from 1930 to 2030.
//
// WHAT THIS BUYS
// Adopting a dependency for the accuracy core turns "do I trust this library?"
// into "did this library change?". This file answers the second question on
// every push, for about 90 KB of JSON.
//
// WHAT IT PROVES, AND WHAT IT DOES NOT
// tyme4ts and sxtwl are both ports of 寿星天文历. Agreement between THEM proves
// the port is faithful and nothing more. astronomy-engine shares no ancestry
// with either, so agreement with THIS fixture is evidence the underlying
// astronomy is right. The Hong Kong Observatory spot-check
// (solar-terms.hko-spotcheck.json) is the third leg: a human institutional
// publication rather than any code lineage.
//
// TWO KINDS OF "DISAGREEMENT" — they are not the same thing
//   MAGNITUDE: |Δ| between the two instants. This is the accuracy question.
//   BUCKET   : do the two instants fall in the same +08 calendar DATE. This is
//              the Katon question — jieWithinDay() asks whether a 節 falls
//              inside a birth date, so a date disagreement moves which day the
//              season gate fires on.
// Bucket comparison at MINUTE and HOUR granularity is reported but NOT locked,
// because it is dominated by straddles: 小暑 1996 is 03:59:56 vs 04:00:00 —
// 3.2 s apart, two different clock hours. Locking that would fail the build on
// a rounding coincidence. Five boundaries straddle an hour edge at adoption.
//
// FAILURE POLICY
//   |Δ| ≥ 1 hour            → FAIL. Far beyond any plausible ephemeris spread.
//   +08 DATE differs        → FAIL. A different calendar date means a different
//                             Month Branch for someone born that day.
//   > 120 s                 → WARN. Worth looking at; not wrong.
// Measured at adoption: 0 date disagreements, max |Δ| ≈ 52 s, median ≈ 9 s.
//
// Run: npm run test:solar-terms
// ============================================================

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { SolarTerm } from 'tyme4ts';

const WARN_SECONDS = 120;
const HOUR8_MS = 8 * 3600 * 1000;

interface FixtureRow {
  baziYear: number;
  term: string;
  lon: number;
  utc: string;
}

const here = dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(readFileSync(join(here, 'solar-terms.fixture.json'), 'utf8')) as {
  _count: number;
  terms: FixtureRow[];
};

/**
 * Fixture longitude → tyme4ts SolarTerm index.
 *
 * tyme4ts indexes the 24 terms from 冬至 = 0 in 15° steps, so
 * lon = (index × 15 + 270) mod 360. Keying on LONGITUDE rather than name avoids
 * the simplified/traditional mismatch (tyme4ts says 惊蛰, the fixture says 驚蟄)
 * and is the definition of the term anyway.
 */
function termIndexForLongitude(lon: number): number {
  const index = (((lon - 270) % 360) + 360) % 360 / 15;
  assert.ok(Number.isInteger(index) && index % 2 === 1, `${lon}° is not a 節 index`);
  return index;
}

/**
 * tyme4ts's instant for a term, as absolute UTC milliseconds.
 *
 * THE TRAP: getJulianDay() is UTC+8-based, not UT-based, so the SolarTime it
 * yields is already +08 WALL CLOCK. Reading it as UTC (or doing your own JD
 * arithmetic on top of it) double-shifts by 8 hours and silently flips month
 * branches. The subtraction below is the only correct reading, and the
 * "known instants" test guards it.
 */
function tyme4tsUtcMs(gregorianYear: number, index: number): number {
  const at = SolarTerm.fromIndex(gregorianYear, index).getJulianDay().getSolarTime();
  return Date.UTC(at.getYear(), at.getMonth() - 1, at.getDay(), at.getHour(), at.getMinute(), at.getSecond()) - HOUR8_MS;
}

/** Calendar parts in the +08 frame — the frame BaZi month boundaries live in. */
function parts8(utcMs: number) {
  const d = new Date(utcMs + HOUR8_MS);
  return {
    date: d.toISOString().slice(0, 10),
    hour: d.toISOString().slice(0, 13),
    minute: d.toISOString().slice(0, 16),
  };
}

interface Comparison {
  row: FixtureRow;
  deltaSeconds: number;
  sameDay: boolean;
  sameHour: boolean;
  sameMinute: boolean;
}

const comparisons: Comparison[] = fixture.terms.map((row) => {
  const expectedMs = Date.parse(row.utc);
  const index = termIndexForLongitude(row.lon);
  // Ask tyme4ts by the TRUE Gregorian year the term falls in (+08), not by the
  // BaZi year — 小寒 opens a month of BaZi year Y but lands in January of Y+1.
  const gregorianYear = Number(parts8(expectedMs).date.slice(0, 4));
  const actualMs = tyme4tsUtcMs(gregorianYear, index);

  const e = parts8(expectedMs);
  const a = parts8(actualMs);
  return {
    row,
    deltaSeconds: (actualMs - expectedMs) / 1000,
    sameDay: e.date === a.date,
    sameHour: e.hour === a.hour,
    sameMinute: e.minute === a.minute,
  };
});

const absDeltas = comparisons.map((c) => Math.abs(c.deltaSeconds)).sort((x, y) => x - y);
const median = absDeltas[Math.floor(absDeltas.length / 2)];
const max = absDeltas.at(-1) ?? 0;

// MAGNITUDE buckets — how far apart the two instants actually are.
const overMinute = comparisons.filter((c) => Math.abs(c.deltaSeconds) >= 60);
const overHour = comparisons.filter((c) => Math.abs(c.deltaSeconds) >= 3600);
const overDay = comparisons.filter((c) => Math.abs(c.deltaSeconds) >= 86400);
const overWarn = comparisons.filter((c) => Math.abs(c.deltaSeconds) > WARN_SECONDS);

// BUCKET disagreements — same instant, different +08 calendar bucket. Only the
// DATE one is locked; see the header note on straddles.
const dateDiffs = comparisons.filter((c) => !c.sameDay);
const hourStraddles = comparisons.filter((c) => !c.sameHour);
const minuteStraddles = comparisons.filter((c) => !c.sameMinute);

const describe = (c: Comparison) =>
  `${c.row.term} ${c.row.baziYear} (${c.row.lon}°) expected ${c.row.utc} — Δ ${c.deltaSeconds.toFixed(1)}s`;

// ── The UTC+8 Julian Day guard ─────────────────────────────
// If this fails, every delta above is meaningless: the comparison is reading
// tyme4ts in the wrong frame, not measuring a disagreement.

test('tyme4ts instants are read in the +08 frame, not double-shifted', () => {
  // 立春 1989 = 1989-02-04 04:27 (+08) = 1989-02-03 20:27 UTC.
  const lichun1989 = tyme4tsUtcMs(1989, 3);
  assert.equal(new Date(lichun1989).toISOString().slice(0, 16), '1989-02-03T20:27');
  assert.equal(parts8(lichun1989).minute, '1989-02-04T04:27');

  // 白露 1989 = 1989-09-07 23:53 (+08). An 8-hour error here would move the DATE.
  const bailu1989 = tyme4tsUtcMs(1989, 17);
  assert.equal(parts8(bailu1989).minute, '1989-09-07T23:53');
});

test('the fixture is the expected shape and size', () => {
  assert.equal(fixture.terms.length, 1212, '101 years × 12 節');
  assert.equal(fixture._count, fixture.terms.length);
  assert.equal(comparisons.length, 1212);
  // Every row must have produced a real comparison, not a NaN that silently
  // passes every inequality below.
  assert.ok(comparisons.every((c) => Number.isFinite(c.deltaSeconds)), 'a row failed to compare');
});

// ── The lock ───────────────────────────────────────────────

test('no +08 calendar DATE disagreement across 1,212 boundaries 1930–2030', () => {
  for (const c of dateDiffs.slice(0, 20)) console.error(`  DATE ${describe(c)}`);
  assert.equal(
    dateDiffs.length, 0,
    'a date disagreement moves a Month Branch — some birthdate now reads wrong',
  );
});

test('no boundary is off by an hour or more', () => {
  for (const c of overHour.slice(0, 20)) console.error(`  HOUR+ ${describe(c)}`);
  assert.equal(overHour.length, 0, 'far beyond any plausible ephemeris disagreement');
  assert.equal(overDay.length, 0);
});

// ── Third oracle: Hong Kong Observatory ────────────────────
// The other two oracles are code. This one is a human institutional
// publication, so it is the only check that cannot share a software bug with
// anything else in the stack. HKO publishes to the MINUTE, so the tolerance is
// 60 s — enough to absorb their rounding, far too tight to hide a real error.

interface HkoRow { hko: string; term: string; lon: number; hkt: string }

const hko = JSON.parse(readFileSync(join(here, 'solar-terms.hko-spotcheck.json'), 'utf8')) as {
  terms: HkoRow[];
};

test('tyme4ts agrees with the Hong Kong Observatory published tables', () => {
  const HKO_TOLERANCE_S = 60;
  const failures: string[] = [];
  let worst = 0;

  for (const row of hko.terms) {
    const [datePart, timePart] = row.hkt.split('T');
    const [y, mo, d] = datePart.split('-').map(Number);
    const [h, mi] = timePart.split(':').map(Number);
    const publishedMs = Date.UTC(y, mo - 1, d, h, mi, 0) - HOUR8_MS;

    const actualMs = tyme4tsUtcMs(y, termIndexForLongitude(row.lon));
    const deltaS = (actualMs - publishedMs) / 1000;
    worst = Math.max(worst, Math.abs(deltaS));

    // The DATE must match outright — that is the Month Branch.
    const publishedDate = parts8(publishedMs).date;
    const actualDate = parts8(actualMs).date;
    if (publishedDate !== actualDate) {
      failures.push(`${row.term} ${row.hko} — HKO ${row.hkt} vs tyme4ts ${parts8(actualMs).minute} (DATE differs)`);
    } else if (Math.abs(deltaS) > HKO_TOLERANCE_S) {
      failures.push(`${row.term} ${row.hko} — HKO ${row.hkt} vs tyme4ts ${parts8(actualMs).minute} (Δ ${deltaS.toFixed(1)}s)`);
    }
  }

  console.log(`\n  tyme4ts vs Hong Kong Observatory — ${hko.terms.length} published 節, max |Δ| ${worst.toFixed(1)}s`);
  for (const f of failures) console.error(`    ${f}`);
  assert.equal(failures.length, 0, 'disagreement with the published HKO tables');
});

test('the HKO spot-check also agrees with the astronomy-engine fixture', () => {
  // Cross-checks the two INDEPENDENT oracles against each other, so a silent
  // regeneration of the fixture cannot quietly redefine what "correct" means.
  const byKey = new Map(fixture.terms.map((r) => [`${parts8(Date.parse(r.utc)).date}|${r.lon}`, r]));
  let matched = 0;
  const failures: string[] = [];

  for (const row of hko.terms) {
    const key = `${row.hkt.slice(0, 10)}|${row.lon}`;
    const f = byKey.get(key);
    if (!f) { failures.push(`${row.term} ${row.hkt} — no fixture row on that date`); continue; }
    matched++;
    const [datePart, timePart] = row.hkt.split('T');
    const [y, mo, d] = datePart.split('-').map(Number);
    const [h, mi] = timePart.split(':').map(Number);
    const deltaS = (Date.parse(f.utc) - (Date.UTC(y, mo - 1, d, h, mi, 0) - HOUR8_MS)) / 1000;
    if (Math.abs(deltaS) > 60) failures.push(`${row.term} ${row.hkt} — fixture Δ ${deltaS.toFixed(1)}s`);
  }

  for (const f of failures) console.error(`    ${f}`);
  assert.equal(failures.length, 0);
  assert.equal(matched, hko.terms.length, 'every HKO row should map to a fixture row');
});

test('agreement report', () => {
  console.log(`
  tyme4ts vs astronomy-engine — ${comparisons.length} 節 boundaries, 1930–2030
    median |Δ|              ${median.toFixed(1)}s
    max |Δ|                 ${max.toFixed(1)}s
    magnitude ≥ 1 min       ${overMinute.length}
    magnitude ≥ 1 hour      ${overHour.length}   (locked: must be 0)
    magnitude ≥ 1 day       ${overDay.length}   (locked: must be 0)
    +08 DATE differs        ${dateDiffs.length}   (locked: must be 0)
    +08 hour-edge straddle  ${hourStraddles.length}   (informational — see header)
    +08 minute-edge straddle ${minuteStraddles.length}  (informational)
    over ${WARN_SECONDS}s                ${overWarn.length}`);

  if (overWarn.length > 0) {
    console.warn(`  WARN: ${overWarn.length} boundaries exceed ${WARN_SECONDS}s (not a failure):`);
    for (const c of overWarn.slice(0, 10)) console.warn(`    ${describe(c)}`);
  }

  // Guards the comparison itself, not the ephemerides: a delta near a day means
  // the wrong term was matched and every number above is noise.
  assert.ok(max < 86400, 'a delta approaching a day means the wrong term was matched');
});
