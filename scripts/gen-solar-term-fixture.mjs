// ============================================================
// Generate the solar-term regression fixture
// ============================================================
// Computes the 12 節 that open BaZi months, for every year 1930–2030, from an
// INDEPENDENT ephemeris — astronomy-engine (Don Cross, MIT), which shares no
// ancestry with tyme4ts.
//
// WHY THIS EXISTS
// Adopting tyme4ts turned "do I trust this dependency?" into "did this
// dependency change?" — a question CI can answer on every push. This fixture is
// the frozen answer. tyme4ts and sxtwl are both ports of 寿星天文历, so their
// agreement proves porting fidelity, not astronomical correctness;
// astronomy-engine is one of the two independent checks (the other is the
// Hong Kong Observatory spot-check, which is a human publication).
//
// The 節 are found by root-finding APPARENT GEOCENTRIC SOLAR LONGITUDE, which is
// the actual definition of a solar term — not by interpolating a table.
//
// Output: tests/solar-terms.fixture.json, 1,212 rows, instants in UTC.
// UTC deliberately: the file must carry no timezone convention of its own, so it
// can arbitrate between engines that disagree about framing. Consumers convert.
//
// Run: npm run gen:solar-terms
// ============================================================

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { MakeTime, SearchSunLongitude } from 'astronomy-engine';

const START_YEAR = 1930;
const END_YEAR = 2030;

// The 12 節 (month-opening terms), in BaZi-year order starting at 立春.
// `lon` is apparent geocentric solar longitude in degrees — the definition.
// `approx` is only a search seed, never an answer.
// 小寒 opens the last BaZi month of year Y but falls in JANUARY of Y+1; that is
// what yearOffset encodes, and it is the same off-by-a-year trap the sxtwl
// oracle warns about.
const JIE = [
  { term: '立春', lon: 315, approx: [2, 4], yearOffset: 0 },
  { term: '驚蟄', lon: 345, approx: [3, 6], yearOffset: 0 },
  { term: '清明', lon: 15, approx: [4, 5], yearOffset: 0 },
  { term: '立夏', lon: 45, approx: [5, 6], yearOffset: 0 },
  { term: '芒種', lon: 75, approx: [6, 6], yearOffset: 0 },
  { term: '小暑', lon: 105, approx: [7, 7], yearOffset: 0 },
  { term: '立秋', lon: 135, approx: [8, 8], yearOffset: 0 },
  { term: '白露', lon: 165, approx: [9, 8], yearOffset: 0 },
  { term: '寒露', lon: 195, approx: [10, 8], yearOffset: 0 },
  { term: '立冬', lon: 225, approx: [11, 7], yearOffset: 0 },
  { term: '大雪', lon: 255, approx: [12, 7], yearOffset: 0 },
  { term: '小寒', lon: 285, approx: [1, 6], yearOffset: 1 },
];

// Seed the search 10 days before the approximate date and allow 30. A term
// wanders at most ~1 day around its approximate date and consecutive terms are
// ~30 days apart, so this window contains exactly one crossing of `lon`.
const SEARCH_BACK_DAYS = 10;
const SEARCH_LIMIT_DAYS = 30;

const rows = [];

for (let baziYear = START_YEAR; baziYear <= END_YEAR; baziYear++) {
  for (const { term, lon, approx, yearOffset } of JIE) {
    const [month, day] = approx;
    const seed = new Date(Date.UTC(baziYear + yearOffset, month - 1, day));
    seed.setUTCDate(seed.getUTCDate() - SEARCH_BACK_DAYS);

    const found = SearchSunLongitude(lon, MakeTime(seed), SEARCH_LIMIT_DAYS);
    if (!found) {
      throw new Error(`no solar-longitude crossing for ${term} (${lon}°) near ${baziYear}`);
    }

    const utc = found.date.toISOString();

    // Guard the search window: a crossing more than 3 days from the seed date
    // means the wrong event was found and every downstream comparison is noise.
    const drift = Math.abs(found.date - new Date(Date.UTC(baziYear + yearOffset, month - 1, day))) / 86400000;
    if (drift > 3) {
      throw new Error(`${term} ${baziYear} resolved to ${utc}, ${drift.toFixed(1)}d from its seed — wrong crossing`);
    }

    rows.push({ baziYear, term, lon, utc });
  }
}

const out = {
  // Provenance travels with the data: a fixture whose origin is unclear cannot
  // arbitrate anything.
  _generator: 'scripts/gen-solar-term-fixture.mjs',
  _oracle: 'astronomy-engine (apparent geocentric solar longitude root-finding)',
  _note: 'Instants are UTC. The 12 節 that open BaZi months. baziYear is the 立春-anchored year the term opens a month within — 小寒 therefore falls in January of baziYear+1.',
  _years: [START_YEAR, END_YEAR],
  _count: rows.length,
  terms: rows,
};

const here = dirname(fileURLToPath(import.meta.url));
const target = join(here, '..', 'tests', 'solar-terms.fixture.json');
writeFileSync(target, JSON.stringify(out, null, 0) + '\n', 'utf8');

console.log(`wrote ${rows.length} rows → tests/solar-terms.fixture.json`);
console.log(`years ${START_YEAR}–${END_YEAR}, ${JIE.length} 節 per year`);
console.log(`first: ${rows[0].term} ${rows[0].baziYear} @ ${rows[0].utc}`);
console.log(`last : ${rows.at(-1).term} ${rows.at(-1).baziYear} @ ${rows.at(-1).utc}`);
