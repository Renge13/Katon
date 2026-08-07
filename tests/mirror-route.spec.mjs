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

import { createMirrorReading, serveMirrorReading } from '../lib/mirror/handlers.js';
import { PREVIEW_HEADER, previewFenceReason } from '../lib/mirror/fence.js';
import { __clearMemCache } from '../lib/render/cache.js';

const PREVIEW = 'preview-token-for-tests';
const ORIGIN = 'http://localhost/api/mirror';

// Two charts that are not the same person, so their semantic profiles - and
// therefore their cache keys - cannot collide and quietly make a "miss" test
// pass on another test's stored row.
const CHART_A = { birthDate: '1989-02-04', birthTime: '04:00' };
const CHART_B = { birthDate: '1994-11-21', birthTime: '13:45' };

/** The dev in-memory reading store, pinned on globalThis by lib/readingStore.js. */
const readingMem = () => globalThis.__katonReadingMem;

function request({ method = 'GET', token = PREVIEW, body, url = ORIGIN } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (token !== null) headers[PREVIEW_HEADER] = token;
  return new Request(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const create = (body, opts = {}) => createMirrorReading(request({ method: 'POST', body, ...opts }));
const serve = (readingToken, opts = {}) => serveMirrorReading(request(opts), readingToken);

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

beforeEach(() => {
  process.env.MIRROR_PREVIEW_TOKEN = PREVIEW;
  // A key must be PRESENT or the chain has no providers to skip, and the
  // zero-calls assertion would prove nothing.
  process.env.GEMINI_API_KEY = 'test-key-never-sent-anywhere';
  realFetch = globalThis.fetch;
  fetchCalls = 0;
  stubFailingProvider();
  readingMem().clear();
  __clearMemCache();
});

afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.GEMINI_API_KEY;
  process.env.MIRROR_PREVIEW_TOKEN = PREVIEW;
});

// ── the fence ──────────────────────────────────────────────

test('with MIRROR_PREVIEW_TOKEN unset the route has no way to admit anyone', async () => {
  delete process.env.MIRROR_PREVIEW_TOKEN;
  assert.equal(previewFenceReason(), 'mirror_preview_token_unset');

  // Even a request carrying what WOULD be the right token.
  assert.equal((await create(CHART_A)).status, 404);
  assert.equal((await serve('anything')).status, 404);
});

test('no preview token = 404, wrong preview token = 404, right token = 200', async () => {
  assert.equal((await create(CHART_A, { token: null })).status, 404);
  assert.equal((await create(CHART_A, { token: 'wrong' })).status, 404);
  // Same length as the real one, so the refusal is not a length check.
  assert.equal((await create(CHART_A, { token: 'x'.repeat(PREVIEW.length) })).status, 404);

  const token = await createOk();
  assert.equal((await serve(token, { token: null })).status, 404);
  assert.equal((await serve(token, { token: 'wrong' })).status, 404);
  assert.equal((await serve(token)).status, 200);
});

test('a refused request is indistinguishable from an unknown reading', async () => {
  const token = await createOk();
  const refused = await (await serve(token, { token: 'wrong' })).json();
  const unknown = await (await serve('no-such-reading-token')).json();
  assert.deepEqual(refused, unknown);
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
  assert.deepEqual(Object.keys(body).sort(), ['path', 'token']);

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

test('a cache hit makes ZERO provider calls and returns the identical text', async () => {
  const token = await createOk();
  const first = await (await serve(token)).json();

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
  const firstBody = await (await serve(a1)).json();

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
