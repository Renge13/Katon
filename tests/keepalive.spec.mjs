// ============================================================
// tests/keepalive.spec.mjs - the ping must be able to report failure
// ============================================================
// Run: npm run test:keepalive  (needs --conditions=react-server for next/server)
//
// WHAT THIS FILE IS DEFENDING, and it is not "the ping works". A keep-alive that
// returns 200 whatever happens is green forever while the database it was meant
// to protect pauses underneath it, and nothing on any screen ever says so. So the
// propositions here are mostly NEGATIVE - the shapes in which this route must
// refuse to claim success:
//
//   1. A DATABASE THAT RETURNS AN ERROR IS NOT A SUCCESSFUL PING.
//   2. A DATABASE THAT THROWS IS NOT A SUCCESSFUL PING. Two code paths, because
//      the supabase client fails both ways and catching one is how a dead
//      database comes to report `ok`.
//   3. NO DATABASE AT ALL IS NOT A SUCCESSFUL PING. The tempting 200 here is the
//      worst one: it is the state a broken production deploy is in.
//   4. A BAD CRON SECRET DOES NOT REACH THE DATABASE.
//   5. AN UNSET CRON SECRET STILL PINGS. The opposite choice - refuse - would
//      make every cron run a 401 and pause the database exactly as if the route
//      did not exist. That is rule 15's never-executed branch, and it is asserted
//      here so nobody "hardens" it into silence.
//   6. THE PING READS THE TABLE THE FUNNEL WRITES, so it cannot be healthy
//      against a side channel while the funnel is broken.
//
// SHOWN RED ON PURPOSE, per CLAUDE.md's card-check convention. Replacing the
// handler's body with the naive form -
//     try { await ping(); } catch {} return json({ ok: true });
// - fails propositions 1, 2 and 3. The run is in the commit message. A keep-alive
// check that has never produced a red is not evidence.
// ============================================================

import assert from 'node:assert/strict';
import { test, beforeEach, afterEach } from 'node:test';

import { keepAlive, KEEPALIVE_TABLE } from '../lib/health/keepalive.js';

const ORIGIN = 'http://localhost/api/keepalive';

const request = (headers = {}) => new Request(ORIGIN, { method: 'GET', headers });

/**
 * A supabase double shaped exactly like the one call the handler makes:
 * `sb.from(t).select('id').limit(1)`. It records the tables it was asked for, so
 * proposition 4 can assert that a refused request never got this far.
 */
function stubClient({ error = null, throws = null } = {}) {
  const calls = [];
  const client = {
    calls,
    from(table) {
      calls.push(table);
      return {
        select() {
          return {
            limit() {
              if (throws) return Promise.reject(throws);
              return Promise.resolve({ data: [], error });
            },
          };
        },
      };
    },
  };
  return client;
}

let savedSecret;
let savedWarn;
let savedError;

beforeEach(() => {
  savedSecret = process.env.CRON_SECRET;
  delete process.env.CRON_SECRET;
  // The handler logs deliberately on the failure paths. Silenced so a passing
  // run is quiet, and restored in afterEach so a later file still sees a console.
  savedWarn = console.warn;
  savedError = console.error;
  console.warn = () => {};
  console.error = () => {};
});

afterEach(() => {
  if (savedSecret === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = savedSecret;
  console.warn = savedWarn;
  console.error = savedError;
});

// ── the positive case, stated once ─────────────────────────

test('a healthy database is a 200 and a real ping', async () => {
  const sb = stubClient();
  const res = await keepAlive(request(), { getClient: () => sb });
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.pinged, true);
  assert.equal(sb.calls.length, 1, 'the handler must actually hit the database');
});

// ── 1, 2, 3: the failing directions, which are the point ───

test('PROPOSITION 1: a returned error is 503, never a cheerful 200', async () => {
  const sb = stubClient({ error: { message: 'connection refused' } });
  const res = await keepAlive(request(), { getClient: () => sb });
  const body = await res.json();

  assert.equal(res.status, 503);
  assert.equal(body.ok, false);
  assert.equal(body.pinged, false);
  assert.equal(body.reason, 'query_failed');
  assert.match(body.detail, /connection refused/);
});

test('PROPOSITION 2: a THROWN failure is also 503, not swallowed', async () => {
  const sb = stubClient({ throws: new Error('getaddrinfo ENOTFOUND') });
  const res = await keepAlive(request(), { getClient: () => sb });
  const body = await res.json();

  assert.equal(res.status, 503, 'a throw must not fall through to the ok path');
  assert.equal(body.ok, false);
  assert.equal(body.reason, 'query_failed');
});

test('PROPOSITION 3: no database configured is 503, not ok', async () => {
  const res = await keepAlive(request(), { getClient: () => null });
  const body = await res.json();

  assert.equal(res.status, 503);
  assert.equal(body.ok, false);
  assert.equal(body.reason, 'supabase_not_configured');
});

// ── 4, 5: the secret, in both directions ───────────────────

test('PROPOSITION 4: a bad cron secret is 401 and never touches the database', async () => {
  process.env.CRON_SECRET = 'the-real-one';
  const sb = stubClient();

  const missing = await keepAlive(request(), { getClient: () => sb });
  assert.equal(missing.status, 401);
  assert.equal((await missing.json()).reason, 'bad_cron_secret');

  const wrong = await keepAlive(
    request({ authorization: 'Bearer not-the-real-one' }),
    { getClient: () => sb },
  );
  assert.equal(wrong.status, 401);

  assert.equal(sb.calls.length, 0, 'a refused request must not reach the database');
});

test('a correct cron secret pings and reports itself authenticated', async () => {
  process.env.CRON_SECRET = 'the-real-one';
  const sb = stubClient();
  const res = await keepAlive(
    request({ authorization: 'Bearer the-real-one' }),
    { getClient: () => sb },
  );
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.authenticated, true);
  assert.equal(sb.calls.length, 1);
});

test('PROPOSITION 5: an UNSET cron secret still pings, and says it is unauthenticated', async () => {
  delete process.env.CRON_SECRET;
  const sb = stubClient();
  const res = await keepAlive(request(), { getClient: () => sb });
  const body = await res.json();

  // If this ever becomes a 401, every cron run stops landing and the database
  // pauses while the route still looks installed. That is the whole failure.
  assert.equal(res.status, 200, 'an unset secret must not refuse the ping');
  assert.equal(body.ok, true);
  assert.equal(body.authenticated, false, 'and it must not claim to be authenticated');
  assert.equal(sb.calls.length, 1);
});

// ── 6: the ping is pointed at the funnel's own table ───────

test('PROPOSITION 6: the ping reads the table the funnel writes', async () => {
  assert.equal(KEEPALIVE_TABLE, 'reading');

  const sb = stubClient();
  await keepAlive(request(), { getClient: () => sb });
  assert.deepEqual(sb.calls, ['reading'],
    'pinging a side channel could pass while the funnel table is unreachable');
});
