// ============================================================
// tests/doku-signature.spec.mjs — the signing rule, against two outside sources
// ============================================================
// Run: npm run test:doku-signature
//
// Prompt V §4 rules out a fixture "that Code or Cowork composed from the rule - that
// only proves the code agrees with itself". It then names the sandbox as the second
// source. The sandbox is not reachable from this machine yet (docs/ops/doku-walk.md
// Part 2), so this file uses the two outside sources that ARE reachable, and is
// explicit about the one question neither can answer:
//
//   ASSEMBLY  DOKU's own published component string, quoted verbatim from
//             developers.doku.com/get-started-with-doku-api/signature-component/
//             non-snap/signature-component-from-request-header.md (read 2026-09-21).
//             Five lines with real values. It is a second source for the SHAPE.
//   CRYPTO    openssl, a genuinely independent implementation of SHA-256 and
//             HMAC-SHA256, shelled out to here rather than reimplemented.
//
// WHAT NEITHER SETTLES: whether DOKU ACCEPTS what we produce. The published page
// prints a component string and a signature but never the secret key, so the pair
// cannot be checked, and that is precisely why §4 asks for a captured sandbox
// request. When `tests/fixtures/doku-notification.sandbox.json` exists, the
// verification tests §4 names belong beside it and this file keeps only the two
// checks above. THIS FILE IS NOT A SUBSTITUTE FOR THAT CAPTURE.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';

import {
  componentString, digestOf, signComponents, signaturesMatch, SIGNATURE_PREFIX,
} from '../lib/doku/signature.js';

/** base64(sha256(input)) by way of openssl. */
const opensslDigest = (input) => execFileSync('openssl', ['dgst', '-sha256', '-binary'], { input })
  .toString('base64');

/** base64(hmac-sha256(secret, input)) by way of openssl. */
const opensslHmac = (input, secret) => execFileSync(
  'openssl', ['dgst', '-sha256', '-hmac', secret, '-binary'], { input },
).toString('base64');

// ── DOKU's published example, verbatim ──
// The values are theirs, copied character for character from the page. The point of
// the test is that OUR assembly reproduces THEIR string, so editing either side to
// make it pass defeats it.
const DOKU_EXAMPLE = {
  clientId: 'MCH-0001-10791114622547',
  requestId: 'cc682442-6c22-493e-8121-b9ef6b3fa728',
  timestamp: '2020-08-11T08:45:42Z',
  target: '/doku-virtual-account/v2/payment-code',
  digest: '5WIYK2TJg6iiZ0d5v4IXSR0EkYEkYOezJIma3Ufli5s=',
};

const DOKU_EXAMPLE_COMPONENT = [
  'Client-Id:MCH-0001-10791114622547',
  'Request-Id:cc682442-6c22-493e-8121-b9ef6b3fa728',
  'Request-Timestamp:2020-08-11T08:45:42Z',
  'Request-Target:/doku-virtual-account/v2/payment-code',
  'Digest:5WIYK2TJg6iiZ0d5v4IXSR0EkYEkYOezJIma3Ufli5s=',
].join('\n');

test("THE COMPONENT IS DOKU'S OWN PUBLISHED STRING, BYTE FOR BYTE", () => {
  const built = componentString(DOKU_EXAMPLE);
  assert.equal(built, DOKU_EXAMPLE_COMPONENT);
  // Stated separately because it is the clause the page calls out and the one an
  // implementation gets wrong silently: a trailing newline changes the hash and
  // nothing about the string LOOKS different.
  assert.ok(!built.endsWith('\n'), 'no trailing newline');
  assert.equal(built.split('\n').length, 5, 'five lines, one per header');
});

test('A GET OMITS THE DIGEST LINE ENTIRELY, NOT AS AN EMPTY ONE', () => {
  // "Digest only applied for POST Method". An empty `Digest:` line is a DIFFERENT
  // component string and therefore a different signature, so absence has to mean
  // absence. check-status is the GET this matters for.
  const built = componentString({ ...DOKU_EXAMPLE, digest: null, target: '/orders/v1/status/INV-1' });
  assert.equal(built.split('\n').length, 4);
  assert.ok(!built.includes('Digest'), `no Digest line at all, got:\n${built}`);
  assert.ok(built.endsWith('Request-Target:/orders/v1/status/INV-1'));
});

test('digestOf AGREES WITH openssl, OVER THE RAW BYTES', () => {
  // A body with the two things a re-serialising implementation destroys: key order
  // that is not alphabetical, and insignificant whitespace.
  const raw = '{"order":{"amount":39000,"invoice_number":"abc.def"},  "payment":{"payment_method_types":["QRIS"]}}';
  assert.equal(digestOf(raw), opensslDigest(raw));

  // And it is the RAW string that is hashed, not a normalised form of it: the same
  // object re-serialised has a different digest, which is the whole reason §2 says
  // never to hash `JSON.stringify(parsed)`.
  assert.notEqual(digestOf(JSON.stringify(JSON.parse(raw))), digestOf(raw));
});

test('signComponents AGREES WITH openssl, AND CARRIES THE PREFIX', () => {
  const secret = 'SK-not-a-real-key-0001';
  const signature = signComponents(DOKU_EXAMPLE, secret);
  assert.ok(signature.startsWith(SIGNATURE_PREFIX), `prefixed, got ${signature}`);
  assert.equal(
    signature.slice(SIGNATURE_PREFIX.length),
    opensslHmac(DOKU_EXAMPLE_COMPONENT, secret),
  );
});

test('A DIFFERENT SECRET, TARGET OR BODY IS A DIFFERENT SIGNATURE', () => {
  const secret = 'SK-not-a-real-key-0001';
  const base = signComponents(DOKU_EXAMPLE, secret);
  assert.notEqual(signComponents(DOKU_EXAMPLE, 'SK-not-a-real-key-0002'), base);
  assert.notEqual(signComponents({ ...DOKU_EXAMPLE, target: '/api/doku/notify' }, secret), base);
  assert.notEqual(signComponents({ ...DOKU_EXAMPLE, digest: digestOf('{}') }, secret), base);
});

test('signaturesMatch IS PADDING-INSENSITIVE - DOKU SPELLS IT BOTH WAYS', () => {
  // doku-walk.md 1.6: the request-signing example is padded, the notification sample
  // is not. A string compare would pass every test here and fail on the first real
  // notification. Same 32 bytes, two spellings, one answer.
  const padded = signComponents(DOKU_EXAMPLE, 'SK-not-a-real-key-0001');
  const unpadded = padded.replace(/=+$/u, '');
  assert.notEqual(padded, unpadded, 'the two spellings really do differ as strings');
  assert.ok(signaturesMatch(padded, unpadded));
  assert.ok(signaturesMatch(unpadded, padded));
});

test('signaturesMatch REFUSES ANYTHING THAT IS NOT A 32-BYTE MAC', () => {
  const good = signComponents(DOKU_EXAMPLE, 'SK-not-a-real-key-0001');
  assert.equal(signaturesMatch(good, signComponents(DOKU_EXAMPLE, 'other')), false, 'wrong secret');
  assert.equal(signaturesMatch(good, null), false);
  assert.equal(signaturesMatch(good, undefined), false);
  assert.equal(signaturesMatch(good, ''), false);
  assert.equal(signaturesMatch(good, `${SIGNATURE_PREFIX}short`), false, 'truncated');
  // Two pieces of garbage must not compare equal to each other. `Buffer.from(x,
  // 'base64')` tolerates nonsense by returning whatever it could decode, so without
  // the length check these would both be the same short buffer.
  assert.equal(signaturesMatch(`${SIGNATURE_PREFIX}!!!`, `${SIGNATURE_PREFIX}!!!`), false);
});
