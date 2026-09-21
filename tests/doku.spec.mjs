// ============================================================
// tests/doku.spec.mjs — POST /api/doku/notify, the door `paid` flips through
// ============================================================
// Run: npm run test:doku
//
// Prompt V §4. This is the security suite: everything here is about what does NOT
// settle. The handler is the real one, the store is the real one (its in-memory mode,
// the way `tests/pair-pdf-route.spec.mjs` uses it), and the notifications are really
// signed - nothing is stubbed except the network that would have delivered them.
//
// ── THE FIXTURE QUESTION, ANSWERED HONESTLY ───────────────
// §4 and Amendment B.6 require a CAPTURED Checkout notification as the fixture, not
// one composed from the rule, because a composed fixture "only proves the code agrees
// with itself". THAT CAPTURE DOES NOT EXIST YET: QRIS is inactive on the sandbox
// account (docs/ops/doku-walk.md Part 2), so no QRIS payment could be made and no
// QRIS notification could arrive.
//
// What makes these tests worth more than a self-consistency check anyway is that the
// SIGNING RULE itself is no longer self-asserted. The sandbox verified it on
// 2026-09-21: a request signed by `signComponents` was accepted, and the same request
// signed with a deliberately wrong secret came back `{"code":"invalid_signature"}` -
// so DOKU checks the signature before the body, and an accepted body proves an
// accepted signature. `tests/doku-signature.spec.mjs` holds that story.
//
// So: the ASSEMBLY and the CRYPTO are confirmed against DOKU. What is still composed
// here is the notification BODY SHAPE - `order.invoice_number`, `order.amount`,
// `transaction.status` - which is read off DOKU's published sample rather than a
// capture. When the capture lands it goes in `tests/fixtures/` and the three
// signature tests below re-point at it. THIS FILE SAYS SO RATHER THAN IMPLYING THE
// QUESTION IS CLOSED.
// ============================================================

import assert from 'node:assert/strict';
import { test, beforeEach, afterEach } from 'node:test';

import { handleDokuNotification, NOTIFY_TARGET } from '../lib/doku/notify.js';
import { createPair, getPair } from '../lib/pairStore.js';
import { digestOf, signComponents } from '../lib/doku/signature.js';
import { priceFor } from '../lib/pricing.js';

const pairMem = (globalThis.__katonPairMem ??= new Map());

const CLIENT_ID = 'BRN-0001-TEST';
const SECRET = 'SK-test-secret-0001';

const A = { birthDate: '1989-09-13', birthTime: '09:00' };
const B = { birthDate: '1990-03-04', birthTime: '14:00' };

beforeEach(() => {
  pairMem.clear();
  process.env.DOKU_CLIENT_ID = CLIENT_ID;
  process.env.DOKU_SECRET_KEY = SECRET;
});
afterEach(() => {
  delete process.env.DOKU_CLIENT_ID;
  delete process.env.DOKU_SECRET_KEY;
});

const newPair = async (sku = 'compat') => {
  const id = `pair${Math.random().toString(36).slice(2, 10)}`;
  await createPair({
    id,
    a_birth_date: A.birthDate, a_birth_time: A.birthTime, a_gender: null, a_term_side: null,
    b_birth_date: B.birthDate, b_birth_time: B.birthTime, b_gender: null, b_term_side: null,
    sku, paid: false, email: null,
  });
  return id;
};

/**
 * A notification body in DOKU's shape.
 *
 * `amount` defaults to a STRING, because that is what the sandbox actually sends
 * (`"39000"` on create, 2026-09-21). The default is the awkward form on purpose: a
 * fixture that defaults to a number would let a handler that forgets to coerce pass
 * every test here and fail on the first real payment.
 */
const bodyFor = (invoiceNumber, { amount = String(priceFor('compat')), status = 'SUCCESS' } = {}) => ({
  service: { id: 'QRIS' },
  channel: { id: 'QRIS_DOKU' },
  order: { invoice_number: invoiceNumber, amount },
  transaction: { status, date: '2026-09-21T03:00:00Z' },
});

/**
 * Build a signed notification request.
 *
 * @param {Object} body
 * @param {Object} [opts]
 * @param {string} [opts.secret] sign with a different secret
 * @param {string} [opts.target] sign against a different Request-Target
 * @param {string} [opts.tamperedRaw] send THESE bytes instead of the signed ones
 * @param {string[]} [opts.drop] header names to omit
 */
function signedRequest(body, {
  secret = SECRET, target = NOTIFY_TARGET, tamperedRaw = null, drop = [],
} = {}) {
  const raw = JSON.stringify(body);
  const requestId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
  const timestamp = '2026-09-21T03:00:00Z';
  const headers = {
    'content-type': 'application/json',
    'client-id': CLIENT_ID,
    'request-id': requestId,
    'request-timestamp': timestamp,
    signature: signComponents({
      clientId: CLIENT_ID, requestId, timestamp, target, digest: digestOf(raw),
    }, secret),
  };
  for (const name of drop) delete headers[name];
  return new Request(`http://localhost${NOTIFY_TARGET}`, {
    method: 'POST',
    headers,
    // The TAMPER happens after signing, which is the whole point: the signature is
    // over `raw` and the bytes on the wire are different.
    body: tamperedRaw ?? raw,
  });
}

// ── the three signature refusals ──

test('A TAMPERED BODY IS REJECTED', async () => {
  const id = await newPair();
  const invoice = `${id}.abc123`;
  const honest = JSON.stringify(bodyFor(invoice));
  // One byte: the amount's last digit. A body that still parses, still names a real
  // pair, and still says SUCCESS - so nothing but the digest can catch it.
  const tampered = honest.replace('"39000"', '"39001"');
  assert.notEqual(tampered, honest, 'the tamper really changed the bytes');

  const res = await handleDokuNotification(signedRequest(bodyFor(invoice), { tamperedRaw: tampered }));
  assert.equal(res.status, 401);
  assert.equal((await getPair(id)).paid, false, 'and nothing settled');
});

test('A WRONG SECRET IS REJECTED', async () => {
  const id = await newPair();
  const res = await handleDokuNotification(
    signedRequest(bodyFor(`${id}.abc123`), { secret: `${SECRET}-WRONG` }),
  );
  assert.equal(res.status, 401);
  assert.equal((await getPair(id)).paid, false);
});

test('A WRONG REQUEST-TARGET IS REJECTED', async () => {
  // Signed against the OLD webhook path, deliberately. `Request-Target` is part of
  // the component, so a notification signed for a different endpoint must not verify
  // here - and using the dead Xendit path means a copy-paste of the old route name
  // into the DOKU Back Office can never quietly work.
  const id = await newPair();
  const res = await handleDokuNotification(
    signedRequest(bodyFor(`${id}.abc123`), { target: '/api/webhook/xendit' }),
  );
  assert.equal(res.status, 401);
  assert.equal((await getPair(id)).paid, false);
});

test('THE TARGET IS THE LITERAL, NEVER THE REQUEST\'S OWN PATH', async () => {
  // ── THIS TEST EXISTS BECAUSE THE ONE ABOVE DOES NOT COVER IT ──
  // `A WRONG REQUEST-TARGET IS REJECTED` was shown NOT to go red when the handler
  // was changed to derive the target from `new URL(request.url).pathname`, and it
  // cannot: that request's own path already IS `/api/doku/notify`, so deriving and
  // using the literal give the same string and the signature fails either way. It
  // guards "the target participates in the signature", which is a weaker and
  // different proposition.
  //
  // What the rule actually protects against is a proxy, a preview alias or a
  // rewrite changing what the incoming request thinks its own path is. So: a
  // request that ARRIVES at a different path, carrying a signature computed for
  // THAT path. A deriving verifier accepts it. The literal must refuse it.
  const id = await newPair();
  const body = bodyFor(`${id}.abc123`);
  const raw = JSON.stringify(body);
  const requestId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
  const timestamp = '2026-09-21T03:00:00Z';
  const rewritten = '/proxied/rewritten/notify';

  const res = await handleDokuNotification(new Request(`http://localhost${rewritten}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'client-id': CLIENT_ID,
      'request-id': requestId,
      'request-timestamp': timestamp,
      signature: signComponents({
        clientId: CLIENT_ID, requestId, timestamp, target: rewritten, digest: digestOf(raw),
      }, SECRET),
    },
    body: raw,
  }));

  assert.equal(res.status, 401, 'a signature computed for the arrival path must not verify');
  assert.equal((await getPair(id)).paid, false);
});

test('A MISSING SIGNATURE HEADER IS REJECTED, not treated as absent-and-fine', async () => {
  const id = await newPair();
  for (const header of ['signature', 'request-id', 'request-timestamp']) {
    const res = await handleDokuNotification(signedRequest(bodyFor(`${id}.abc123`), { drop: [header] }));
    assert.equal(res.status, 401, `missing ${header}`);
  }
  assert.equal((await getPair(id)).paid, false);
});

test('NO KEYS MEANS REFUSE BEFORE READING ANYTHING', async () => {
  delete process.env.DOKU_SECRET_KEY;
  const id = await newPair();
  const res = await handleDokuNotification(signedRequest(bodyFor(`${id}.abc123`)));
  assert.equal(res.status, 503);
  assert.equal((await res.json()).error, 'doku_not_configured');
  assert.equal((await getPair(id)).paid, false);
});

// ── what a VERIFIED notification does ──

test('A VERIFIED SUCCESS FLIPS paid, AND THE AMOUNT ARRIVES AS A STRING', async () => {
  // THE HAPPY PATH AND THE COERCION IN ONE, because they are the same event. DOKU
  // sends `"39000"`, `amountMatchesSku` takes a number and returns false for a
  // string, so without `amountNumber` this exact notification - verified, correct,
  // fully paid - settles as `amount_mismatch` and the buyer never gets what she
  // bought. Measured against the sandbox 2026-09-21.
  const id = await newPair();
  const res = await handleDokuNotification(signedRequest(bodyFor(`${id}.abc123`)));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { received: true });
  assert.equal((await getPair(id)).paid, true);
});

test('A DECIMAL AMOUNT ALSO SETTLES - the docs sample sends 20000.00', async () => {
  const id = await newPair();
  const body = bodyFor(`${id}.abc123`, { amount: `${priceFor('compat')}.00` });
  const res = await handleDokuNotification(signedRequest(body));
  assert.equal(res.status, 200);
  assert.equal((await getPair(id)).paid, true);
});

test('AMOUNT IS VERIFIED AGAINST THE STORED SKU, NOT THE BODY\'S CLAIM', async () => {
  // A verified SUCCESS for the artifact price on a `compat` pair. Everything about
  // it is authentic - the signature is real, DOKU really sent it - and it still must
  // not settle, because the price does not match the sku recorded at intent.
  const id = await newPair('compat');
  const res = await handleDokuNotification(
    signedRequest(bodyFor(`${id}.abc123`, { amount: String(priceFor('artifact')) })),
  );
  // 200, not an error: it is understood and declined. A non-2xx would have DOKU
  // retry it nine times over seven days for no reason.
  assert.equal(res.status, 200);
  assert.equal((await getPair(id)).paid, false, 'the wrong price settles nothing');
});

test('A FAILED TRANSACTION SETTLES NOTHING, and still answers 2xx', async () => {
  const id = await newPair();
  const res = await handleDokuNotification(
    signedRequest(bodyFor(`${id}.abc123`, { status: 'FAILED' })),
  );
  assert.equal(res.status, 200);
  assert.equal((await getPair(id)).paid, false);
});

test('A REPLAYED SUCCESS IS IDEMPOTENT', async () => {
  // DOKU retries a non-2xx nine times over seven days, and a duplicate delivery is
  // ordinary. The second one must not count a second purchase or start a second
  // render. This is also why the INBOUND timestamp window stays a deferred row
  // rather than a check: a legitimate retry is indistinguishable from a replay.
  const id = await newPair();
  const request = () => handleDokuNotification(signedRequest(bodyFor(`${id}.abc123`)));
  assert.equal((await request()).status, 200);
  assert.equal((await getPair(id)).paid, true);
  assert.equal((await request()).status, 200);
  assert.equal((await getPair(id)).paid, true);
});

test('AN UNKNOWN ID IS A 2xx, so DOKU stops retrying', async () => {
  const res = await handleDokuNotification(signedRequest(bodyFor('nosuchrow.abc123')));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { received: true });
});

test('A BARE INVOICE NUMBER WITH NO SUFFIX STILL FINDS ITS ROW', async () => {
  // The suffix is the pay route's, and `split('.')[0]` has to be a no-op without
  // one. If the sandbox ever shows DOKU returns the existing session on a repeated
  // invoice_number, §3 says drop the suffix - and this asserts that dropping it
  // needs no change here.
  const id = await newPair();
  const res = await handleDokuNotification(signedRequest(bodyFor(id)));
  assert.equal(res.status, 200);
  assert.equal((await getPair(id)).paid, true);
});

test('A MISSING invoice_number IS A 400', async () => {
  const body = bodyFor('x');
  delete body.order.invoice_number;
  const res = await handleDokuNotification(signedRequest(body));
  assert.equal(res.status, 400);
});

// ── the two assertions docs/NEXT.md says Prompt V OWES ──

test('THE DOKU BRANCH SENDS COMPAT THROUGH pairUrl, NEVER readingUrl', async () => {
  // `docs/NEXT.md` "WHAT PROMPT V OWES THAT V-0 REMOVED THE TESTS FOR", item 1. This
  // is regression X-b1: a compat checkout shipped with NEITHER redirect url and left
  // the buyer's last screen on the provider's page. The assertion died with the old
  // adapter because its subject stopped existing, not because the requirement did.
  //
  // ON THE SOURCE, because exercising the route needs Next's whole request pipeline
  // and `@/` alias, and what can go wrong here is a one-identifier edit.
  const { readFileSync } = await import('node:fs');
  const src = readFileSync(new URL('../app/api/pay/[id]/route.js', import.meta.url), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//gu, '')
    .replace(/^\s*\/\/.*$/gmu, '');

  const branch = src.slice(src.indexOf("paymentsProvider() === 'doku'"));
  assert.ok(branch.length > 0, 'the doku branch exists');
  assert.match(branch, /createCheckout\(/u);

  // ── EACH URL IS CHECKED ON ITS OWN LINE, AND THAT IS THE POINT ──
  // A single `assert.match(branch, /isCompat \? pairUrl\(/)` over the whole branch
  // was the first version and IT DID NOT GUARD: rewriting `home` to a bare
  // `readingUrl(id)` left it green, because `done` still carried the pattern. That
  // is X-b1's exact shape - one redirect right and the other wrong - so an
  // assertion satisfied by one occurrence is satisfied by the bug.
  const lineFor = (name) => {
    const at = branch.indexOf(`const ${name} =`);
    assert.ok(at > -1, `the doku branch declares \`${name}\``);
    return branch.slice(at, branch.indexOf('\n', at));
  };
  const homeLine = lineFor('home');
  const doneLine = lineFor('done');

  for (const [name, line] of [['home', homeLine], ['done', doneLine]]) {
    assert.match(line, /isCompat \? pairUrl\(/u,
      `\`${name}\` must resolve compat through pairUrl, never readingUrl: ${line}`);
  }

  // AND THE MARKER IS ON THE RESULT URL ONLY. DOKU's `callback_url` is the "Back to
  // Merchant" button on the CHECKOUT page - a buyer who left WITHOUT PAYING - and
  // `callback_url_result` is the one on the result page. Marking both would tell the
  // report page "payment done" for an abandoned checkout.
  assert.match(branch, /callbackUrl: home/u, 'the checkout-page return carries no marker');
  assert.match(branch, /callbackUrlResult: done/u, 'the result-page return carries the marker');
  assert.equal(homeLine.includes('bayar=selesai'), false,
    'the abandon path must not claim a payment happened');
  assert.ok(doneLine.includes('bayar=selesai'), 'the result path does carry the hint');
});

// ── the capture, and its three fences ──

/** Run `fn` with console.log collected rather than printed. */
async function captured(fn) {
  const lines = [];
  const real = console.log;
  console.log = (...args) => lines.push(args.join(' '));
  try { await fn(); } finally { console.log = real; }
  return lines;
}

test('THE CAPTURE IS OFF UNLESS ASKED FOR, AND NEVER IN PRODUCTION', async () => {
  // Three fences on a debug path that prints a payment body. Each is checked on its
  // own, because "it did not print" has three possible causes and only one of them
  // is the flag.
  const id = await newPair();
  const send = () => handleDokuNotification(signedRequest(bodyFor(`${id}.abc123`)));

  // 1. OFF BY DEFAULT.
  let lines = await captured(send);
  assert.deepEqual(lines.filter((l) => l.includes('[doku][capture]')), [],
    'no flag, no capture');

  // 2. REFUSED IN PRODUCTION even with the flag, like every other free-ish path in
  //    this codebase. A body in a production log is a body in a production log.
  process.env.DOKU_CAPTURE = '1';
  process.env.VERCEL_ENV = 'production';
  try {
    lines = await captured(send);
    assert.deepEqual(lines.filter((l) => l.includes('[doku][capture]')), [],
      'the flag does not open the door in production');
  } finally { delete process.env.VERCEL_ENV; }

  // 3. AND IT WORKS WHERE IT IS MEANT TO, or the walk cannot capture the fixture.
  try {
    lines = await captured(send);
    const cap = lines.filter((l) => l.includes('[doku][capture]'));
    assert.equal(cap.length, 2, 'headers and body, one line each');
    assert.match(cap.join('\n'), /"signature":"HMACSHA256=/u, 'the headers are there');
    assert.match(cap.join('\n'), /"invoice_number"/u, 'and the raw body');
  } finally { delete process.env.DOKU_CAPTURE; }
});

test('AN UNVERIFIED BODY IS NEVER CAPTURED, WHATEVER THE FLAG SAYS', async () => {
  // THE FENCE THAT MATTERS MOST, and it is about ORDER rather than configuration.
  // `lib/doku/notify.js` says "the reason, never the body" because an unverified
  // body is attacker-controlled - anyone can POST one. The capture is the single
  // exception to that line and it earns it by running AFTER the HMAC passes. A
  // capture moved above the verify would turn a debug aid into an unauthenticated
  // write to the log a human reads later and trusts.
  const id = await newPair();
  process.env.DOKU_CAPTURE = '1';
  try {
    const lines = await captured(() => handleDokuNotification(
      signedRequest(bodyFor(`${id}.abc123`), { secret: `${SECRET}-WRONG` }),
    ));
    assert.deepEqual(lines.filter((l) => l.includes('[doku][capture]')), [],
      'a body that failed verification must not reach the log');
  } finally { delete process.env.DOKU_CAPTURE; }
});

// ── checkStatus, against DOKU's REAL bytes ──

test('checkStatus READS DOKU\'S OWN RECORDED BYTES, where the amount is a NUMBER', async () => {
  // `tests/fixtures/doku-checkstatus.sandbox.json` is a REAL sandbox response,
  // captured 2026-09-21 from the VA walk (docs/ops/doku-walk.md Part 3). It is NOT
  // the §4 notification fixture and does not pretend to be - §4 wants a captured
  // NOTIFICATION and DOKU never delivered one. What this pins is the shape of the
  // one real DOKU payload the walk did obtain.
  //
  // THE MEASURED SURPRISE IT EXISTS FOR: `order.amount` is the NUMBER `39000` here,
  // and the STRING `"39000"` in the create-checkout response for the very same
  // order. DOKU is inconsistent across its own endpoints, which is exactly why
  // `amountNumber` exists and why neither call site may assume a type.
  const { readFileSync } = await import('node:fs');
  const fixture = JSON.parse(readFileSync(
    new URL('./fixtures/doku-checkstatus.sandbox.json', import.meta.url), 'utf8',
  ));
  assert.equal(typeof fixture.order.amount, 'number', 'check-status sends a number');
  assert.equal(fixture.additional_info.origin.product, 'CHECKOUT',
    'a Checkout record, not the SNAP adapter the docs sample came from');

  const { checkStatus } = await import('../lib/doku/client.js');
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify(fixture), { status: 200 });
  try {
    process.env.DOKU_SANDBOX = '1';
    const out = await checkStatus(fixture.order.invoice_number);
    assert.equal(out.status, 'SUCCESS');
    assert.equal(out.amount, 39000);
    assert.equal(out.invoiceNumber, fixture.order.invoice_number);

    // ── AND THE SAME RECORD WITH DOKU'S OTHER SPELLING ────
    // The assertion above does NOT guard the coercion, and that was shown: deleting
    // `amountNumber` from `checkStatus` left it green, because this fixture's amount
    // is already a number. So the same bytes are replayed with the amount as the
    // STRING DOKU uses on create-checkout for this very order. One endpoint, two
    // spellings, one answer - and this half goes red without the coercion.
    globalThis.fetch = async () => new Response(
      JSON.stringify({ ...fixture, order: { ...fixture.order, amount: '39000.00' } }),
      { status: 200 },
    );
    const asString = await checkStatus(fixture.order.invoice_number);
    assert.equal(asString.amount, 39000, 'a decimal string is the same money');
    assert.equal(typeof asString.amount, 'number', 'and it comes back as a number');
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.DOKU_SANDBOX;
  }
});

test('THE doku:status SCRIPT CARRIES --conditions=react-server, OR IT CANNOT RUN', async () => {
  // A DEFECT THIS SESSION SHIPPED AND THEN HIT. `scripts/doku-status.mjs` imports
  // `lib/doku/client.js`, which is `server-only`; the npm script ran plain node, so
  // the very first invocation died with "This module cannot be imported from a
  // Client Component module" before reaching a single line of its own code.
  //
  // NO BEHAVIOURAL TEST COULD SEE IT: the script is an ops tool, nothing imports it,
  // and every unit test of `client.js` already runs under the right condition. The
  // thing that was wrong was the LAUNCH LINE, so that is what is asserted.
  const { readFileSync } = await import('node:fs');
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  for (const name of ['doku:status']) {
    assert.match(pkg.scripts[name], /--conditions=react-server/u,
      `${name} imports a server-only module and must declare the condition`);
  }
  // `probe:doku` deliberately does NOT need it: it imports only
  // `lib/doku/signature.js`, which is pure and carries no `server-only`. Asserted so
  // that "why does one have it and not the other" is answered rather than guessed.
  const signature = readFileSync(new URL('../lib/doku/signature.js', import.meta.url), 'utf8');
  assert.equal(signature.includes("import 'server-only'"), false,
    'the signing rule stays importable by a plain node script');
});

// ── the source assertion §4 names ──

test('THE NOTIFY HANDLER READS RAW BYTES, AND PARSES ONLY AFTER VERIFYING', async () => {
  // The order of operations IS the security, and it is a one-line edit away from
  // being wrong in a way no behavioural test would catch: `request.json()` before
  // the verify would still settle every honest notification in this file. So the
  // proposition is asserted on the source.
  const { readFileSync } = await import('node:fs');
  const src = readFileSync(new URL('../lib/doku/notify.js', import.meta.url), 'utf8')
    // Comments stripped - this file's own prose says `request.json()` while
    // explaining why it must not appear, and a detector that matches its own
    // documentation is a mistake this repo has now made five times.
    .replace(/\/\*[\s\S]*?\*\//gu, '')
    .replace(/^\s*\/\/.*$/gmu, '');

  assert.match(src, /await request\.text\(\)/u, 'it reads raw bytes');
  assert.equal(/request\.json\(\)/u.test(src), false, 'and never asks Request to parse for it');

  const rawAt = src.indexOf('request.text()');
  const verifyAt = src.indexOf('verifyNotification');
  const parseAt = src.indexOf('JSON.parse');
  assert.ok(rawAt > -1 && verifyAt > rawAt, 'the bytes are read before they are verified');
  assert.ok(parseAt > verifyAt, 'and nothing is parsed until the signature has passed');
});
