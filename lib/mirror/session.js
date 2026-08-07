// ============================================================
// The mirror session cookie
// ============================================================
// The per-session half of rule 19's "rate-limit per IP/session". An opaque
// CSPRNG id in an httpOnly cookie, minted on first contact.
//
// ── WHAT THIS IS NOT ───────────────────────────────────────
// Not authentication, not identity, not analytics. It carries no birth data, no
// reading token and nothing derived from either, and nothing reads it except the
// rate limiter. httpOnly so no script can read it back; SameSite=Lax so it does
// not travel on cross-site requests it has no business on.
//
// ── AND WHAT IT CANNOT DO ──────────────────────────────────
// A cookie bounds an honest browser and nothing else: an attacker who never
// sends one gets a fresh session on every request. That is not a flaw to be
// engineered around here, it is why the per-IP dimension exists beside it.
// ============================================================

import { randomUUID } from 'node:crypto';

export const SESSION_COOKIE = 'katon_sid';

/** Thirty days. Long enough that an honest revisit keeps its session. */
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

/** Read one cookie out of a request's Cookie header. */
export function readSessionId(request) {
  const header = request?.headers?.get?.('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() !== SESSION_COOKIE) continue;
    const value = part.slice(eq + 1).trim();
    // Anything that is not the shape we mint is treated as absent rather than
    // trusted: the value becomes part of a rate-limit key, and a caller-chosen
    // key is a caller-chosen counter.
    return /^[0-9a-f-]{36}$/.test(value) ? value : null;
  }
  return null;
}

/**
 * The session for this request, and whether it has to be sent back.
 *
 * Minted BEFORE the limit check rather than after, so the very first request of
 * a session is counted against it too.
 */
export function resolveSession(request) {
  const existing = readSessionId(request);
  if (existing) return { sessionId: existing, isNew: false };
  return { sessionId: randomUUID(), isNew: true };
}

/** The Set-Cookie value for a freshly minted session. */
export function sessionCookieHeader(sessionId) {
  return [
    `${SESSION_COOKIE}=${sessionId}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    // Production is HTTPS-only; local dev is not, and a Secure cookie there
    // would never be stored, so every dev request would mint a new session and
    // the session dimension would silently stop limiting anything.
    ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
    `Max-Age=${MAX_AGE_SECONDS}`,
  ].join('; ');
}
