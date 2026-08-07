// ============================================================
// Rule 19 — the fixed-window rate limiter
// ============================================================
// Run: npm run test:ratelimit
//
// SEPARATE FILE ON PURPOSE. The fail-closed case needs a Supabase client to
// exist and then fail, and lib/supabase.js memoises that client in a module
// variable — once built with the fake credentials here it would stay built for
// every later test in the same process, silently moving the reading store and
// the render cache off their in-memory dev backends. `node --test` gives each
// FILE its own process, so the blast radius is this file.
//
// NOTE: run with `node --conditions=react-server` (the npm script does this).
// ============================================================

import assert from 'node:assert/strict';
import { test, beforeEach, afterEach } from 'node:test';

import {
  consume, clientIp, RATE_LIMITS, __clearMemRateLimit,
} from '../lib/ratelimit.js';
import { readSessionId, resolveSession, sessionCookieHeader, SESSION_COOKIE } from '../lib/mirror/session.js';

const withCookie = (value) => new Request('http://localhost/', {
  headers: value === null ? {} : { cookie: value },
});

beforeEach(() => {
  __clearMemRateLimit();
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

// ── the window ─────────────────────────────────────────────

test('a bucket allows exactly its limit, then refuses', async () => {
  const { limit } = RATE_LIMITS.mirror_create.session;

  for (let i = 1; i <= limit; i += 1) {
    const got = await consume('mirror_create', { session: 's1' });
    assert.equal(got.allowed, true, `refused on hit ${i} of ${limit}`);
  }

  const over = await consume('mirror_create', { session: 's1' });
  assert.equal(over.allowed, false);
  assert.equal(over.reason, 'rate_limited_session');
  assert.ok(over.retryAfter > 0 && over.retryAfter <= RATE_LIMITS.mirror_create.session.windowSeconds);
});

test('the window rolls: the next window starts the count again', async () => {
  const { limit, windowSeconds } = RATE_LIMITS.mirror_create.session;
  const now = Date.parse('2026-08-07T10:00:00Z');

  for (let i = 0; i <= limit; i += 1) await consume('mirror_create', { session: 's1' }, { now });
  assert.equal((await consume('mirror_create', { session: 's1' }, { now })).allowed, false);

  const next = now + windowSeconds * 1000;
  assert.equal((await consume('mirror_create', { session: 's1' }, { now: next })).allowed, true);
});

test('identities do not share a counter, and neither do buckets', async () => {
  const { limit } = RATE_LIMITS.mirror_create.session;
  for (let i = 0; i <= limit; i += 1) await consume('mirror_create', { session: 's1' });

  assert.equal((await consume('mirror_create', { session: 's2' })).allowed, true);
  assert.equal((await consume('mirror_serve', { session: 's1' })).allowed, true);
});

test('an absent dimension is neither charged nor refused', async () => {
  // A first POST arrives before any session cookie exists; a local request has
  // no resolvable client IP. The other dimension still applies.
  for (let i = 0; i < 200; i += 1) {
    assert.equal((await consume('mirror_create', { ip: null, session: null })).allowed, true);
  }
});

test('every dimension is charged even when an earlier one already refused', async () => {
  // Short-circuiting on the first denial would under-count the IP of exactly the
  // client whose IP total matters most.
  const sessionLimit = RATE_LIMITS.mirror_create.session.limit;
  const ipLimit = RATE_LIMITS.mirror_create.ip.limit;

  for (let i = 0; i <= ipLimit; i += 1) {
    await consume('mirror_create', { ip: '1.2.3.4', session: `s${i}` });
  }
  // The IP is over its own ceiling despite every request using a fresh session.
  const got = await consume('mirror_create', { ip: '1.2.3.4', session: 'brand-new' });
  assert.equal(got.allowed, false);
  assert.equal(got.reason, 'rate_limited_ip');
  assert.ok(ipLimit > sessionLimit, 'the IP dimension must be the looser one (carrier NAT)');
});

test('an unknown bucket is a programming error, not a silent allow', async () => {
  await assert.rejects(() => consume('not_a_bucket', { session: 's1' }), /unknown rate-limit bucket/);
});

// ── fail closed ────────────────────────────────────────────

test('a limiter backend that cannot answer REFUSES', async () => {
  process.env.SUPABASE_URL = 'https://rate-limit-test.invalid';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key-for-tests';

  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('{"message":"boom"}', {
    status: 500, headers: { 'content-type': 'application/json' },
  });

  try {
    const got = await consume('mirror_create', { session: 's1' });
    // An unlimited endpoint is the exact state rule 19 forbids, and "the limiter
    // was broken" is not a reason to enter it.
    assert.equal(got.allowed, false);
    assert.equal(got.reason, 'limiter_unavailable');
  } finally {
    globalThis.fetch = realFetch;
  }
});

// ── the session cookie ─────────────────────────────────────

test('the session cookie is read back, and a hostile value is treated as absent', async () => {
  const id = '11111111-2222-3333-4444-555555555555';
  assert.equal(readSessionId(withCookie(`${SESSION_COOKIE}=${id}`)), id);
  assert.equal(readSessionId(withCookie(`other=x; ${SESSION_COOKIE}=${id}; more=y`)), id);
  assert.equal(readSessionId(withCookie(null)), null);
  assert.equal(readSessionId(withCookie(`${SESSION_COOKIE}=`)), null);

  // The value becomes part of a rate-limit key, so a caller-chosen value would
  // be a caller-chosen counter.
  for (const hostile of ['../../etc', 'a'.repeat(4000), 'mirror_create:ip:1.2.3.4', '<script>']) {
    assert.equal(readSessionId(withCookie(`${SESSION_COOKIE}=${hostile}`)), null);
  }
});

test('a session is minted when absent and kept when present', () => {
  const fresh = resolveSession(withCookie(null));
  assert.equal(fresh.isNew, true);
  assert.match(fresh.sessionId, /^[0-9a-f-]{36}$/);

  const existing = resolveSession(withCookie(`${SESSION_COOKIE}=${fresh.sessionId}`));
  assert.deepEqual(existing, { sessionId: fresh.sessionId, isNew: false });
});

test('the cookie is httpOnly and SameSite, and Secure only in production', () => {
  const header = sessionCookieHeader('abc');
  assert.match(header, /HttpOnly/);
  assert.match(header, /SameSite=Lax/);
  // Not Secure outside production: a Secure cookie is never stored over plain
  // http, so local dev would mint a new session on every request and the
  // session dimension would quietly stop limiting anything.
  assert.ok(!header.includes('Secure'));

  const before = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'production';
    assert.match(sessionCookieHeader('abc'), /Secure/);
  } finally {
    if (before === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = before;
  }
});

// ── the client IP ──────────────────────────────────────────

test('the client IP is the first x-forwarded-for entry, and null when there is none', () => {
  const req = (headers) => new Request('http://localhost/', { headers });
  assert.equal(clientIp(req({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' })), '203.0.113.7');
  assert.equal(clientIp(req({ 'x-forwarded-for': ' 203.0.113.7 ' })), '203.0.113.7');
  assert.equal(clientIp(req({ 'x-real-ip': '203.0.113.9' })), '203.0.113.9');
  assert.equal(clientIp(req({})), null);
});

afterEach(() => {
  __clearMemRateLimit();
});
