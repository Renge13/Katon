// ============================================================
// Prompt J — the mirror route
// ============================================================
// Run: npm run test:mirror
//
// No network and no API key. The provider is stubbed through `globalThis.fetch`
// (lib/render/providers/gemini.js resolves `config.fetchImpl || fetch` at call
// time), so "a cache hit makes zero provider calls" is asserted against a stub
// that THROWS if it is touched rather than against the absence of a key — which
// would make the assertion vacuously true.
//
// NOTE: run with `node --conditions=react-server` (the npm script does this).
// lib/mirror/handlers.js and the stores it uses carry `server-only` guards,
// which resolve to an empty stub under that condition.
// ============================================================

import assert from 'node:assert/strict';
import { test, beforeEach, afterEach } from 'node:test';

import {
  createMirrorReading, serveMirrorReading, recordMirrorFeedback, floorRefusalReason,
} from '../lib/mirror/handlers.js';
import { readCache, writeCache, __clearMemCache } from '../lib/render/cache.js';
import { STAGE6_VERSION } from '../lib/render/fence.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { semanticFromRow } from '../lib/mirror/reading.js';
import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { RATE_LIMITS, __clearMemRateLimit } from '../lib/ratelimit.js';
import { SESSION_COOKIE } from '../lib/mirror/session.js';

const ORIGIN = 'http://localhost/api/mirror';

// Two charts that are not the same person, so their semantic profiles - and
// therefore their cache keys - cannot collide and quietly make a "miss" test
// pass on another test's stored row.
const CHART_A = { birthDate: '1989-02-04', birthTime: '04:00' };
const CHART_B = { birthDate: '1994-11-21', birthTime: '13:45' };

/** The dev in-memory reading store, pinned on globalThis by lib/readingStore.js. */
const readingMem = () => globalThis.__katonReadingMem;

function request({ method = 'GET', body, url = ORIGIN, session, ip } = {}) {
  const headers = { 'content-type': 'application/json' };
  // Omitted by default so the rate limiter charges nothing: every request mints
  // a throwaway session and has no resolvable IP, which is what lets the other
  // tests here create as many readings as they need. The limiter's own tests
  // pin an identity deliberately.
  if (session) headers.cookie = `${SESSION_COOKIE}=${session}`;
  if (ip) headers['x-forwarded-for'] = ip;
  return new Request(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const create = (body, opts = {}) => createMirrorReading(request({ method: 'POST', body, ...opts }));
const serve = (readingToken, opts = {}) => serveMirrorReading(request(opts), readingToken);
const feedback = (readingToken, body, opts = {}) => recordMirrorFeedback(
  request({ method: 'POST', body, ...opts }), readingToken,
);

async function createOk(body = CHART_A) {
  const res = await create(body);
  // Read the body only on failure - a Response body can be consumed once, and
  // an eager `await res.text()` inside the assert message consumes it always.
  if (res.status !== 201) assert.fail(`create returned ${res.status}: ${await res.text()}`);
  return (await res.json()).token;
}

// ── the fetch stub ─────────────────────────────────────────

let realFetch;
let fetchCalls;

/** Every provider call fails. The chain exhausts and lands on the floor. */
function stubFailingProvider() {
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return new Response('upstream down', { status: 503 });
  };
}

/** Any provider call at all is a test failure. */
function stubForbiddenProvider() {
  globalThis.fetch = async () => {
    fetchCalls += 1;
    throw new Error('provider was called on a cache hit');
  };
}

/**
 * A provider response that PASSES Stage 6.
 *
 * Built from the module floor plus a penutup, which is the construction
 * tests/stage6-validation.spec.mjs uses and which that file proves clears the
 * gate on all 13 fixture charts. Hand-faking prose that satisfies the coverage,
 * fact and style guards is not something a test should be attempting.
 */
function stubRecoveredProvider(semanticJson) {
  const reading = {
    blocks: assembleFallback(semanticJson).blocks,
    penutup: 'Peta ini sudah cukup jelas untuk kamu jalani mulai sekarang.',
  };
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return Response.json({
      candidates: [{ content: { parts: [{ text: JSON.stringify(reading) }] }, finishReason: 'STOP' }],
    });
  };
}

/**
 * Put a REAL gated row in the cache for this token, and return what was served.
 *
 * Needed by every test that used to rely on the floor being cached. Since rule
 * 16's amendment the floor stores nothing, so a cache row now only exists once a
 * render has actually passed Stage 6 - which is the point.
 */
async function warmCache(token) {
  const { semanticJson } = semanticFromRow(readingMem().get(token));
  stubRecoveredProvider(semanticJson);
  const body = await (await serve(token)).json();
  assert.equal(body.meta.source, 'gemini', 'the warm-up render did not pass the gate');
  return body;
}

beforeEach(() => {
  // A key must be PRESENT or the chain has no providers to skip, and the
  // zero-calls assertion would prove nothing.
  process.env.GEMINI_API_KEY = 'test-key-never-sent-anywhere';
  realFetch = globalThis.fetch;
  fetchCalls = 0;
  stubFailingProvider();
  readingMem().clear();
  __clearMemCache();
  __clearMemRateLimit();
});

afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.GEMINI_API_KEY;
});

// ── the fence is GONE. This is what replaced it. ──────────
//
// Until 2026-08-23 three tests here pinned `MIRROR_PREVIEW_TOKEN`: unset meant the
// route could admit nobody, a wrong token 404'd, and a refusal was byte-identical
// to an unknown reading. The promotion removed the fence, because the funnel front
// door now creates and reads mirror readings and a fence in front of the mirror is
// a fence in front of the site.
//
// THE TESTS ARE REPLACED RATHER THAN DELETED, and the reason is that deleting them
// would leave no record that the route is deliberately open - which reads, to the
// next person, exactly like an oversight. So the pair below asserts the two things
// that must STILL be true with nothing in front:

test('the route is OPEN - no token, no header, and it serves', async () => {
  assert.equal(process.env.MIRROR_PREVIEW_TOKEN, undefined,
    'nothing in this suite sets a preview token any more');
  const token = await createOk();
  assert.equal((await serve(token)).status, 200);
});

test('an unknown reading is still a BARE 404, because harvesting is the risk', async () => {
  // Rule 19's named risk is content harvesting, and a body that distinguished
  // "no such reading" from anything else would tell a harvester which tokens are
  // real. With the fence gone this is the ONLY refusal the serve path makes, so it
  // is the only one that can leak - which makes it worth more than it was before.
  const unknown = await serve('no-such-reading-token');
  assert.equal(unknown.status, 404);
  assert.deepEqual(await unknown.json(), { error: 'not_found' });

  // A LEGACY row - one with no cache_key - gets the same answer, byte for byte.
  // Those rows are the retired funnel's, and nothing creates one after this commit;
  // the branch stays because rows written before it are still in the table.
  const legacy = await createOk();
  readingMem().get(legacy).cache_key = null;
  const stale = await serve(legacy);
  assert.equal(stale.status, 404);
  assert.deepEqual(await stale.json(), { error: 'not_found' });
});

// ── POST validation ────────────────────────────────────────

test('the POST rejects everything it cannot compute a chart from', async () => {
  for (const body of [
    undefined,
    {},
    { birthDate: '' },
    { birthDate: '1989-2-4' },
    { birthDate: '04/02/1989' },
    { birthDate: 20260101 },
    { birthDate: '1989-02-04', birthTime: '4:00' },
    { birthDate: '1989-02-04', birthTime: '25:00' },
    { birthDate: '1989-02-04', gender: 'other' },
    { birthDate: '1989-02-04', termSide: 'maybe' },
  ]) {
    const res = await create(body);
    assert.equal(res.status, 400, `expected 400 for ${JSON.stringify(body)}`);
  }
});

test('an hour-less birthdate is accepted, and the chart says the hour is unknown', async () => {
  const token = await createOk({ birthDate: '1989-02-04' });
  const body = await (await serve(token)).json();
  assert.equal(body.chart.hour_known, false);
  // Three cells, not four with one blank. A UI must not have to infer the
  // difference between "no hour given" and "hour pillar failed to compute".
  assert.deepEqual(body.chart.pillars.map((p) => p.position), ['year', 'month', 'day']);
});

// ── the row ────────────────────────────────────────────────

test('the POST persists birth data server-side and never echoes it back', async () => {
  const res = await create(CHART_A);
  const body = await res.json();
  // `chart` joined token and path on 2026-08-26 so the funnel can draw the
  // pillars, the bars, 胎元 and the archetype name before the render starts.
  assert.deepEqual(Object.keys(body).sort(), ['chart', 'path', 'token']);

  // THE INVARIANT THIS TEST IS ACTUALLY FOR, asserted directly rather than
  // through the key list. The key list alone would pass a `chart` that carried
  // the birth date inside it, which is the failure worth catching - the pillars
  // are DERIVED from the birth datetime and a careless view could round-trip it.
  // Nothing in the payload may spell the date or the time back.
  const serialised = JSON.stringify(body);
  for (const secret of [CHART_A.birthDate, CHART_A.birthTime, CHART_A.birthDate.slice(0, 4)]) {
    assert.ok(!serialised.includes(secret), `the create echoed "${secret}" back`);
  }
  // And it is the SAME object the serve returns under the same key, from one
  // `mirrorChartView`. Two shapes for one thing is how the card and the reading
  // came to disagree about her archetype's name; the client merges rather than
  // reconciles precisely because this holds.
  const servedBody = await (await serve(body.token)).json();
  assert.deepEqual(body.chart, servedBody.chart, 'create and serve disagree about the chart');

  const row = readingMem().get(body.token);
  assert.equal(row.birth_date, CHART_A.birthDate);
  assert.equal(row.birth_time, CHART_A.birthTime);
  // The marker that this is a mirror row and not a legacy funnel row.
  assert.match(row.cache_key, /^[0-9a-f]{64}$/);
});

test('tokens are not enumerable: neighbours of a real token do not resolve', async () => {
  const token = await createOk();
  assert.equal(token.length, 21);

  const neighbours = [
    token.slice(0, -1),
    `${token}a`,
    token.slice(0, -1) + (token.at(-1) === 'a' ? 'b' : 'a'),
    '1', '2', 'aaaaaaaaaaaaaaaaaaaaa',
  ];
  for (const guess of neighbours) {
    assert.equal((await serve(guess)).status, 404, `${guess} resolved`);
  }

  // Two creates of the SAME birthdate are two different tokens. A token that
  // were a function of the birth data would be guessable from it.
  assert.notEqual(await createOk(CHART_A), token);
});

test('a legacy funnel row is not readable through the mirror route', async () => {
  // A row with birth data but no cache_key is what /api/reading writes.
  readingMem().set('legacy-row-token', {
    id: 'legacy-row-token', day_master: '丙', state: 'governed',
    birth_date: CHART_A.birthDate, birth_time: CHART_A.birthTime, paid: false,
  });
  assert.equal((await serve('legacy-row-token')).status, 404);
});

// ── the serve shape ────────────────────────────────────────

test('the serve shape splits paragraphs, so no block text reaches a client raw', async () => {
  const token = await createOk();
  const body = await (await serve(token)).json();

  assert.ok(body.blocks.length > 0);
  for (const block of body.blocks) {
    assert.ok(Array.isArray(block.paragraphs) && block.paragraphs.length > 0);
    assert.ok(Array.isArray(block.fact_ids) && block.fact_ids.length > 0);
    assert.equal(typeof block.heading, 'string');
    // The contract: the client never sees a newline it has to interpret.
    for (const paragraph of block.paragraphs) assert.ok(!paragraph.includes('\n'));
    assert.equal(block.text, undefined);
  }
  assert.equal(typeof body.penutup, 'string');
});

test('the chart is cross-checkable: hanzi kept, never bare (rule 23)', async () => {
  const token = await createOk();
  const { chart } = await (await serve(token)).json();

  assert.deepEqual(chart.pillars.map((p) => p.position), ['year', 'month', 'day', 'hour']);
  // 1989-02-04 04:00 -> 戊辰 乙丑 乙未 戊寅 (CLAUDE.md rule 3, confirmed empirically).
  assert.deepEqual(chart.pillars.map((p) => p.hanzi), ['戊辰', '乙丑', '乙未', '戊寅']);

  for (const pillar of chart.pillars) {
    assert.equal(pillar.hanzi, `${pillar.stem}${pillar.branch}`);
    // Every character cell carries its Indonesian pairing. Hanzi you can point
    // at is fine; hanzi you must read is not.
    assert.ok(pillar.animal, `${pillar.position} has no animal`);
    assert.ok(pillar.element, `${pillar.position} has no element`);
    assert.ok(pillar.palace, `${pillar.position} has no palace name`);
  }
  assert.equal(chart.pillars.find((p) => p.is_day_master).position, 'day');

  // The element name comes from the glossary, not from lib/readingView.js's
  // local map - which renders Earth as "Bumi" where the glossary says "Tanah".
  const names = new Set(chart.pillars.map((p) => p.element));
  assert.ok(!names.has('Bumi'), 'element name did not come from the glossary');

  assert.ok(chart.archetype.name_id);
  assert.equal(chart.element_presence_note, 'display distribution only, never a strength score');
});

test('no heading, palace or archetype name is a Chinese character (rule 23, REMOVE side)', async () => {
  const token = await createOk();
  const { blocks, chart } = await (await serve(token)).json();
  const hanzi = /[一-鿿]/;

  for (const block of blocks) {
    assert.ok(!hanzi.test(block.heading), `heading carries hanzi: ${block.heading}`);
  }
  for (const pillar of chart.pillars) {
    assert.ok(!hanzi.test(pillar.palace));
    assert.ok(!hanzi.test(pillar.animal));
    assert.ok(!hanzi.test(pillar.element));
  }
  assert.ok(!hanzi.test(chart.archetype.name_id));
});

// ── rate limiting (rule 19) ────────────────────────────────

const SESSION = '11111111-2222-3333-4444-555555555555';

test('the create path trips at its session limit and says how long to wait', async () => {
  const { limit } = RATE_LIMITS.mirror_create.session;

  for (let i = 1; i <= limit; i += 1) {
    const res = await create(CHART_A, { session: SESSION });
    assert.equal(res.status, 201, `refused on create ${i} of ${limit}`);
  }

  const over = await create(CHART_A, { session: SESSION });
  assert.equal(over.status, 429);
  assert.equal((await over.json()).error, 'rate_limited_session');
  assert.ok(Number(over.headers.get('retry-after')) > 0);
});

test('the serve path is limited too, because the cache IS the thing worth harvesting', async () => {
  const token = await createOk();
  const { limit } = RATE_LIMITS.mirror_serve.ip;

  // Every request after the first is a cache hit: free to answer, and exactly
  // what a scraper sends. Distinct sessions, one IP - the scraper's shape.
  for (let i = 1; i <= limit; i += 1) {
    const res = await serve(token, { ip: '203.0.113.7' });
    assert.equal(res.status, 200, `refused on read ${i} of ${limit}`);
  }
  const over = await serve(token, { ip: '203.0.113.7' });
  assert.equal(over.status, 429);
  assert.equal((await over.json()).error, 'rate_limited_ip');
});

// THIS TEST USED TO ASSERT THE FENCE RAN FIRST - that a wrong-token request was
// refused before it could charge a real client's session quota. There is no fence,
// so there is no request that gets refused ahead of the limiter, and the property
// it protected has to be restated rather than kept: the LIMITER is now the outermost
// gate on this route, and everything it admits is charged.
test('the limiter is now the OUTERMOST gate, so even a rejected body is charged', async () => {
  const { limit } = RATE_LIMITS.mirror_create.session;

  // A garbage body still costs the session a unit. THAT IS DELIBERATE, and with the
  // fence gone it is the load-bearing half: if validation ran first and only valid
  // requests were counted, a scraper could send malformed bodies at this route all
  // day for free. `admit` runs before the body is parsed, and the 400's own
  // set-cookie test below is the other half of the same arrangement.
  for (let i = 0; i < limit; i += 1) {
    assert.equal((await create({ birthDate: 'nope' }, { session: SESSION })).status, 400);
  }
  const over = await create(CHART_A, { session: SESSION });
  assert.equal(over.status, 429, "the rejected bodies should have exhausted the session");
  assert.equal((await over.json()).error, 'rate_limited_session');

  // And the ceiling is per identity, not global: a different session is unaffected.
  assert.equal((await create(CHART_A, { session: 'a-different-session-entirely' })).status, 201);
});

test('a session cookie is minted on first contact and not re-minted after', async () => {
  const first = await create(CHART_A);
  const setCookie = first.headers.get('set-cookie');
  assert.match(setCookie, new RegExp(`^${SESSION_COOKIE}=[0-9a-f-]{36};`));
  assert.match(setCookie, /HttpOnly/);

  const second = await create(CHART_A, { session: SESSION });
  assert.equal(second.headers.get('set-cookie'), null);
});

test('a rejected body still carries the session cookie', async () => {
  // Otherwise a client retrying a bad payload gets a FRESH session each time and
  // the session dimension counts to one forever.
  const res = await create({ birthDate: 'nope' });
  assert.equal(res.status, 400);
  assert.match(res.headers.get('set-cookie') || '', new RegExp(`^${SESSION_COOKIE}=`));
});

// ── boundary softness ──────────────────────────────────────

test('the known solar-term edge chart surfaces boundary, and says which risk', async () => {
  // 立春 1989 falls at 1989-02-04 04:27 (+08). A birth 0.1 minutes before it is
  // inside the two-minute window where no method is authoritative.
  const token = await createOk({ birthDate: '1989-02-04', birthTime: '04:27' });
  const body = await (await serve(token)).json();

  assert.equal(body.boundary, true);
  assert.equal(body.boundary_sources.chart_edge, true);
});

test('an hour-less birth on a 節 day is a chart edge too', async () => {
  const token = await createOk({ birthDate: '1989-02-04' });
  const body = await (await serve(token)).json();
  assert.equal(body.boundary_sources.chart_edge, true);
});

test('a marginal strength verdict is a SEPARATE risk from a chart edge', async () => {
  // Same date, 04:00: the chart is certain, the verdict read off it is not.
  // Collapsing the two would fire the flag for the wrong reason.
  const token = await createOk(CHART_A);
  const body = await (await serve(token)).json();

  assert.equal(body.boundary_sources.chart_edge, false);
  assert.equal(body.boundary_sources.strength_confidence, true);
  assert.equal(body.boundary, true, 'the single flag is the union of the two');
});

test('a chart with neither risk is not flagged', async () => {
  const token = await createOk(CHART_B);
  const body = await (await serve(token)).json();
  assert.deepEqual(body.boundary_sources, { chart_edge: false, strength_confidence: false });
  assert.equal(body.boundary, false);
});

test('confidence_reasons never leaves the server', async () => {
  const token = await createOk(CHART_A);
  const raw = await (await serve(token)).text();
  // Engine diagnostics in English with hanzi, marked internal_only in the
  // semantic JSON. The renderer is banned from writing either, and so is this
  // route: softening is learned from the LEVEL, never from these strings.
  assert.ok(!raw.includes('confidence_reasons'));
  assert.ok(!raw.includes('supportShare'));
  assert.ok(!raw.includes('半合'));
});

// ── the cache ──────────────────────────────────────────────

test('a provider outage lands on the floor rather than failing the request', async () => {
  const token = await createOk();
  const body = await (await serve(token)).json();

  assert.ok(fetchCalls > 0, 'the provider was never attempted');
  assert.equal(body.meta.source, 'module_assembly');
  assert.equal(body.meta.cached, false);
  // Rule 17: the floor is servable BECAUSE it is engine content, and the row
  // records which gate cleared it rather than the version installed today.
  assert.match(body.meta.stage6_version, /-floor$/);
});

test('A FLOOR THAT FAILS THE GATE IS REFUSED, NOT SERVED', () => {
  // Issue #23, option (b), ruled 2026-08-11. The floor used to reach a reader
  // with no gate over it at all, so FAILING the gate routed AROUND the gate -
  // the worse the pipeline was doing, the less validation the reader got.
  //
  // Not hypothetical. The tranche-1 content pass put forbidden.fatalism into
  // three fixture charts' floors via a ruled glossary seed, and the only reason
  // it did not ship is that the gate was run by hand during review.
  //
  // The decision function is tested directly rather than through the route,
  // because the glossary on main is clean: there is no chart whose floor fails
  // today, and this must hold whatever the glossary says tomorrow.
  const semantic = buildSemanticJson(calculateBaziChart({
    birthDate: '1989-09-13', birthTime: '09:00',
  }));
  const floor = { ...assembleFallback(semantic), source: 'module_assembly' };

  assert.equal(floorRefusalReason(floor, semantic), null,
    'a clean floor serves - this is the state on main today');

  const poisoned = {
    ...floor,
    penutup: 'Pada tahun 2027 kamu akan menemukan arah yang kamu cari.',
  };
  const reason = floorRefusalReason(poisoned, semantic);
  assert.match(reason, /^floor_failed_gate:/);
  assert.match(reason, /forbidden\.fatalism/,
    'the reason names the check, so a 503 in the logs is diagnosable');

  // Provider output is NOT re-checked here - it already passed the gate inside
  // renderReading, and re-running it would double-charge every served reading.
  assert.equal(floorRefusalReason({ ...poisoned, source: 'gemini' }, semantic), null);
});

test('a SOFT finding on the floor keeps serving', () => {
  // The other half of the ruling, matching floorIfHardFailing's policy for
  // cached rows: pulling a reading over a style count would leave a hole for
  // everyone sharing that semantic profile, and the floor is blander rather
  // than untrue. Only hard findings - rule 14 and rule 25 - refuse.
  const semantic = buildSemanticJson(calculateBaziChart({
    birthDate: '1989-09-13', birthTime: '09:00',
  }));
  const floor = { ...assembleFallback(semantic), source: 'module_assembly' };
  const soft = {
    ...floor,
    penutup: `${floor.penutup} Kondisi ini terasa jelas untukmu.`,
  };
  assert.equal(floorRefusalReason(soft, semantic), null,
    'a soft finding must not refuse');
});

test('a cache hit makes ZERO provider calls and returns the identical text', async () => {
  const token = await createOk();
  const first = await warmCache(token);

  fetchCalls = 0;
  stubForbiddenProvider();

  const second = await (await serve(token)).json();
  assert.equal(fetchCalls, 0, 'the provider was called on a cache hit');
  assert.equal(second.meta.cached, true);
  assert.deepEqual(second.blocks, first.blocks);
  assert.equal(second.penutup, first.penutup);
  // A hit is as attributable as a fresh render.
  assert.equal(second.meta.stage6_version, first.meta.stage6_version);
});

test('two readings of the same chart share one cached text; a different chart does not', async () => {
  const a1 = await createOk(CHART_A);
  const firstBody = await warmCache(a1);

  const a2 = await createOk(CHART_A);
  fetchCalls = 0;
  stubForbiddenProvider();
  const secondBody = await (await serve(a2)).json();
  assert.equal(fetchCalls, 0, 'a second token for the same chart re-rendered');
  assert.deepEqual(secondBody.blocks, firstBody.blocks);

  // A different chart is a different key, so it must reach the provider.
  const b = await createOk(CHART_B);
  fetchCalls = 0;
  stubFailingProvider();
  await serve(b);
  assert.ok(fetchCalls > 0, 'a different chart was served from another chart\'s row');
});

// ── Stage 7 feedback ───────────────────────────────────────

test('a thumbs-down flags the cached row, and the reading keeps serving', async () => {
  const token = await createOk();
  const before = await warmCache(token);

  const res = await feedback(token, { vote: 'down' });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, vote: 'down', flagged: true });

  const key = readingMem().get(token).cache_key;
  assert.equal((await readCache(key)).status, 'flagged');

  // Pulling it would leave a hole for everyone who shares that semantic
  // profile. A reading somebody disliked is not a reading that is wrong.
  const after = await (await serve(token)).json();
  assert.deepEqual(after.blocks, before.blocks);
});

test('a thumbs-up is accepted and changes no status', async () => {
  const token = await createOk();
  await warmCache(token);

  const res = await feedback(token, { vote: 'up' });
  assert.deepEqual(await res.json(), { ok: true, vote: 'up', flagged: false });
  assert.equal((await readCache(readingMem().get(token).cache_key)).status, 'unreviewed');
});

test('the feedback endpoint rejects an unknown reading and a bad vote', async () => {
  const token = await createOk();
  await serve(token);

  // The two preview-token cases that stood here went with the fence. What is left
  // is the part that was never the fence's job.
  assert.equal((await feedback('no-such-token', { vote: 'down' })).status, 404);
  assert.equal((await feedback(token, { vote: 'maybe' })).status, 400);
  assert.equal((await feedback(token, {})).status, 400);
});

// ── the hard-check exception (pipeline-spec Stage 7) ───────

/** Plant a cached row that would pass shape checks but fails a HARD gate check. */
async function plantHardFailingRow(key) {
  await writeCache(key, {
    engineVersion: 'planted',
    // "ramalan" names the thing rule 25 forbids the product from being, and it
    // is a HARD reject in lib/validate/blocklist.json. Everything else about
    // this row is well-formed, so only the hard check can be what fires.
    blocks: [{ fact_ids: ['planted'], heading: 'Planted', text: 'Ini ramalan untuk kamu.' }],
    penutup: 'Penutup.',
    source: 'gemini',
    model: 'planted-model',
    promptVersion: 'planted',
    stage6Version: STAGE6_VERSION,
  });
}

test('a cached reading that fails a HARD check falls back immediately', async () => {
  const token = await createOk();
  await plantHardFailingRow(readingMem().get(token).cache_key);

  fetchCalls = 0;
  stubForbiddenProvider();
  const body = await (await serve(token)).json();

  // Not the stored text, and not a provider call either. The floor is engine
  // content, always available, and always accurate.
  assert.equal(fetchCalls, 0);
  assert.equal(body.meta.source, 'module_assembly');
  assert.equal(body.meta.hard_fail_fallback, true);
  assert.equal(body.meta.cached, false, 'the served text is not the cached row');
  assert.ok(!JSON.stringify(body.blocks).includes('ramalan'));
});

test('the fallback does NOT overwrite the row it refused to serve', async () => {
  const token = await createOk();
  const key = readingMem().get(token).cache_key;
  await plantHardFailingRow(key);

  await serve(token);

  // Overwriting with the floor would answer the QA question by deleting it.
  const row = await readCache(key);
  assert.equal(row.source, 'gemini');
  assert.equal(row.blocks[0].text, 'Ini ramalan untuk kamu.');
});

test('a SOFT failure keeps serving; only hard checks pull a reading', async () => {
  const token = await createOk();
  const key = readingMem().get(token).cache_key;
  await writeCache(key, {
    engineVersion: 'planted',
    // Coverage and style will both complain about this. None of it is hard.
    blocks: [{ fact_ids: ['planted'], heading: 'Planted', text: 'Satu kalimat pendek saja.' }],
    penutup: 'Penutup.',
    source: 'gemini',
    model: 'planted-model',
    promptVersion: 'planted',
    stage6Version: STAGE6_VERSION,
  });

  const body = await (await serve(token)).json();
  assert.equal(body.meta.source, 'gemini');
  assert.deepEqual(body.blocks[0].paragraphs, ['Satu kalimat pendek saja.']);
});

// ── the floor serves but never persists (rule 16, amended 08-07) ──

test('an outage serves the floor and stores NOTHING', async () => {
  const token = await createOk();
  const body = await (await serve(token)).json();

  assert.equal(body.meta.source, 'module_assembly');
  assert.ok(body.blocks.length > 0, 'the product never hard-fails on the free mirror');
  // The whole point: a one-hour Gemini blip must not cost this chart its real
  // reading forever. A stored floor would be a cache hit for every later request
  // and the chain would never run again until ENGINE_VERSION moved.
  assert.equal(await readCache(readingMem().get(token).cache_key), null);
  assert.equal(
    await readCache(readingMem().get(token).cache_key, { includeUnvalidated: true }), null,
    'not even as an unservable row',
  );
});

test('a second request during the outage retries, and does not flap', async () => {
  const token = await createOk();
  const first = await (await serve(token)).json();

  fetchCalls = 0;
  const second = await (await serve(token)).json();

  assert.ok(fetchCalls > 0, 'the second request must retry the provider, not serve a frozen floor');
  // assembleFallback is pure engine content, so re-deriving it is byte-identical.
  // A reader refreshing during an outage sees no churn.
  assert.deepEqual(second.blocks, first.blocks);
  assert.equal(second.penutup, first.penutup);
});

test('one request spends the regeneration budget once, outage or not', async () => {
  const token = await createOk();
  fetchCalls = 0;
  await serve(token);

  // attemptsPerProvider 2, one provider armed (OPENAI_API_KEY unset), and the
  // Stage 6 budget is separate from the transport retry. Not persisting the
  // floor must not turn one request into an unbounded retry loop.
  assert.equal(fetchCalls, 2, `expected 2 provider attempts, got ${fetchCalls}`);
});

test('when the provider recovers the render is gated, stored, and frozen', async () => {
  const token = await createOk();

  // 1. Outage: floor, nothing stored.
  assert.equal((await (await serve(token)).json()).meta.source, 'module_assembly');
  const key = readingMem().get(token).cache_key;
  assert.equal(await readCache(key), null);

  // 2. Recovery.
  const { semanticJson } = semanticFromRow(readingMem().get(token));
  stubRecoveredProvider(semanticJson);
  fetchCalls = 0;
  const recovered = await (await serve(token)).json();

  assert.equal(fetchCalls, 1, 'a passing render takes one call');
  assert.equal(recovered.meta.source, 'gemini');
  assert.equal(recovered.meta.cached, false);
  assert.equal(recovered.meta.stage6_version, STAGE6_VERSION, 'it passed the real gate');

  const row = await readCache(key);
  assert.ok(row, 'a validated render IS stored');
  assert.equal(row.source, 'gemini');
  assert.equal(row.stage6_version, STAGE6_VERSION);

  // 3. Byte-identical forever, with the provider forbidden.
  fetchCalls = 0;
  stubForbiddenProvider();
  for (let i = 0; i < 3; i += 1) {
    const again = await (await serve(token)).json();
    assert.equal(fetchCalls, 0);
    assert.equal(again.meta.cached, true);
    assert.deepEqual(again.blocks, recovered.blocks);
    assert.equal(again.penutup, recovered.penutup);
  }
});

// ── 胎元 (ruled 2026-08-07) ────────────────────────────────

test('the conception pillar is served, labelled from the glossary, outside pillars[]', async () => {
  const token = await createOk();
  const { chart } = await (await serve(token)).json();

  const cp = chart.conception_pillar;
  assert.ok(cp, 'no conception pillar');
  assert.equal(cp.label, 'Pilar Konsepsi');
  assert.equal(cp.hanzi, `${cp.stem}${cp.branch}`);
  // Never bare: the same pairing every other hanzi cell carries (rule 23).
  assert.ok(cp.animal);
  assert.ok(cp.element);
  assert.ok(!/[一-鿿]/.test(cp.label + cp.animal + cp.element));

  // It is NOT one of the four chart positions and must not be counted as one.
  assert.deepEqual(chart.pillars.map((p) => p.position), ['year', 'month', 'day', 'hour']);
  assert.ok(!chart.pillars.some((p) => p.hanzi === cp.hanzi && p.palace === cp.label));
});

test('命宮 is still absent, and stays that way', () => {
  // Rule 4 and prompts/D1b: two candidate conventions score 4/5 and 3/5 against
  // Joey's own printed values. In a block whose only job is to be cross-checked,
  // a wrong value is worse than an absent one. This test exists so re-adding it
  // has to be a deliberate act.
  const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  assert.equal(chart.lifePalace, undefined);
  assert.equal(chart.mingGong, undefined);
});

// ── the free shareable, and what the paywall on it actually is ──

test('the serve payload carries Card A, and WITHHOLDS Card B\'s appendix', async () => {
  const token = await createOk();
  const body = await (await serve(token)).json();

  assert.ok(body.card, 'the free payload carries card data');
  // Card A's fields. It replaced components/Sharecard.jsx, which read the retired
  // contents/*.md cells - which is why the card and the reading can no longer
  // disagree about her archetype's name.
  for (const field of ['stem', 'nameEn', 'nameId', 'element', 'aspek', 'tags', 'badges', 'footer']) {
    assert.ok(body.card[field] !== undefined, `card.${field} is missing`);
  }

  // THE PAYWALL ON THE CARD IS THE APPENDIX. It is Card B's second half - the four
  // pillar characters with their palaces and the element distribution - and it is
  // served by /api/deliver/[id]/card behind `row.paid === true`, never here.
  assert.equal(body.card.appendix, undefined,
    'the free payload must not carry the paid card\'s appendix');

  // AND NO BIRTH DATE LEAVES THE SERVER on the free path. That is this view layer's
  // standing invariant, and the card footer is the one place it could slip out - so
  // the footer is built with `birthDate: null` and the client merges its own.
  assert.equal(body.card.footer.date, '', 'the free footer carries no date');
  assert.equal(body.card.footer.gender, null);
  assert.equal(JSON.stringify(body).includes(CHART_A.birthDate), false,
    'the birth date must not appear anywhere in the payload');
});

test('the reading and its card name the SAME archetype - the 08-13 divergence, closed', async () => {
  // Two archetype name sets were live and disagreed on five of ten: the funnel path
  // said AKAR / PELITA / LADANG / PEDANG / HUJAN and glossary.json says Bambu / Api
  // Unggun / Taman / Besi Tempa / Embun. That is why the card could not simply be
  // wired to the funnel - it would have named her Bambu beside a reading naming her
  // Akar. Retiring contents/*.md leaves ONE set, and this is the assertion that it
  // is one: both fields now resolve from the same Stage 3 core.
  for (const chart of [CHART_A, CHART_B]) {
    const token = await createOk(chart);
    const body = await (await serve(token)).json();
    assert.equal(body.card.nameId, body.chart.archetype.name_id,
      'the card and the reading disagree about her archetype');
    assert.equal(body.card.nameEn, body.chart.archetype.name_en);
  }
});
