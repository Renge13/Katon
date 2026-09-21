// ============================================================
// lib/doku/signature.js — the signing rule, once
// ============================================================
// Prompt V §2. PURE: no env, no network, no `server-only`, no Next. That is the whole
// point of it being its own file rather than living inside `client.js` as §2 sketched
// it - the client is `server-only`, and a probe script, a unit test and the notify
// route all need the signing rule. §2's own reason for one implementation ("two copies
// of a signing rule is the exact bug this project keeps recording") argues for this
// split rather than against it: a `server-only` module that a plain `node` script
// cannot import is how the second copy gets written.
//
// ── THE RULE, VERIFIED AGAINST DOKU'S OWN PAGE 2026-09-21 ──
// developers.doku.com/get-started-with-doku-api/signature-component/non-snap/
//   signature-component-from-request-header.md
//
//   Client-Id:<value>
//   Request-Id:<value>
//   Request-Timestamp:<value>
//   Request-Target:<path>
//   Digest:<base64(sha256(raw JSON body))>
//
// "joined with `\n` ... with no trailing newline". Digest "only applied for POST
// Method". Final header: `HMACSHA256=` prepended to the base64 HMAC-SHA256.
//
// CLAUDE.md rule 4 applies to an API spec exactly as to a BaZi table, so the prompt's
// copy of this was NOT the source - the page was, and `docs/ops/doku-walk.md` §1.5
// records the check. The crypto itself is cross-checked against openssl in
// `tests/doku-signature.spec.mjs`, which is a genuinely independent implementation;
// the one thing neither can settle is whether DOKU accepts what we produce, and that
// needs the sandbox.
//
// ── BASE64 PADDING IS NOT ASSUMED ─────────────────────────
// DOKU's own samples disagree with themselves: the request-signing example is padded
// (`...GVgv5s=`), the notification sample is not (`...STSc3W6Ps`). See doku-walk.md
// §1.6. So `signaturesMatch` compares DECODED BYTES rather than strings. A string
// compare would pass every local test and fail on the first real notification, which
// is the failure this note exists to prevent.
// ============================================================

import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

/** The header lines that make up the component, in DOKU's order. */
export const COMPONENT_ORDER = ['Client-Id', 'Request-Id', 'Request-Timestamp', 'Request-Target', 'Digest'];

/** The prefix DOKU puts on the `Signature` header value. */
export const SIGNATURE_PREFIX = 'HMACSHA256=';

/**
 * Base64 SHA-256 of the RAW request body.
 *
 * OVER THE RAW STRING, never over `JSON.stringify(parsed)`. Re-serialising reorders
 * nothing in theory and everything in practice, and the digest is what binds the
 * signature to the bytes that actually arrived.
 *
 * @param {string} rawBody
 * @returns {string} base64
 */
export function digestOf(rawBody) {
  return createHash('sha256').update(rawBody, 'utf8').digest('base64');
}

/**
 * Assemble the signature component string.
 *
 * @param {Object} parts
 * @param {string} parts.clientId
 * @param {string} parts.requestId
 * @param {string} parts.timestamp ISO8601 UTC with `Z`
 * @param {string} parts.target the PATH, e.g. `/checkout/v1/payment`
 * @param {string|null} [parts.digest] omitted entirely for GET
 * @returns {string} `\n`-joined, no trailing newline
 */
export function componentString({ clientId, requestId, timestamp, target, digest = null }) {
  const values = { 'Client-Id': clientId, 'Request-Id': requestId, 'Request-Timestamp': timestamp, 'Request-Target': target, Digest: digest };
  return COMPONENT_ORDER
    // A GET has no body, so the Digest LINE IS ABSENT - not present-and-empty. An
    // empty `Digest:` line is a different component string and a different signature.
    .filter((name) => values[name] !== null && values[name] !== undefined)
    .map((name) => `${name}:${values[name]}`)
    .join('\n');
}

/**
 * The `Signature` header value for a set of components.
 *
 * @param {Object} parts as `componentString`
 * @param {string} secret the DOKU Secret Key
 * @returns {string} `HMACSHA256=<base64>`
 */
export function signComponents(parts, secret) {
  const mac = createHmac('sha256', secret).update(componentString(parts), 'utf8').digest('base64');
  return `${SIGNATURE_PREFIX}${mac}`;
}

/**
 * Constant-time compare of two `Signature` header values, padding-insensitive.
 *
 * Both sides are stripped of the prefix, decoded from base64 and compared as bytes, so
 * a padded and an unpadded spelling of the same 32-byte MAC match. A length mismatch
 * returns false BEFORE `timingSafeEqual`, which throws on unequal lengths.
 *
 * @param {string|null|undefined} a
 * @param {string|null|undefined} b
 * @returns {boolean}
 */
export function signaturesMatch(a, b) {
  const bytes = (value) => {
    if (typeof value !== 'string') return null;
    const raw = value.startsWith(SIGNATURE_PREFIX) ? value.slice(SIGNATURE_PREFIX.length) : value;
    const buf = Buffer.from(raw.trim(), 'base64');
    // A 32-byte HMAC-SHA256 and nothing else. Anything shorter is a truncated or
    // non-base64 value that Buffer.from silently tolerates, and letting it through
    // would make a garbage header compare equal to another garbage header.
    return buf.length === 32 ? buf : null;
  };
  const left = bytes(a);
  const right = bytes(b);
  if (!left || !right) return false;
  return timingSafeEqual(left, right);
}
