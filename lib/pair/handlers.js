import 'server-only';
// ============================================================
// lib/pair/handlers.js — POST /api/pair
// ============================================================
// Creates a `pair`: two people's birth inputs, one purchase, one report.
//
// ══ WHAT THIS DOES NOT DO, AND IT IS MOST OF THE FILE'S POINT ══
// Ruled by Reyner 2026-09-07 (night), verbatim in docs/prompts/X-compat-2b1.md:
//
//   "No free P0 reading, no named relation tease, and no Gemini render before
//    payment. The pre-payment Compat flow should be deterministic/static and
//    cheap. The AI compatibility report is generated only after successful
//    payment."
//
// So this COMPUTES NOTHING ABOUT THE RELATIONSHIP. No chart is built, no
// archetype is named, no `lib/compat/*` module is called and no renderer is
// touched. It validates two births, resolves the season gate, and writes a row.
// The spec asserts the response and the stored row carry no hanzi and no fact
// key, because a create that quietly built the facts "to validate them" would be
// a free compat result sitting in the database.
//
// ══ PERSON B NEVER BECOMES A `reading` ROW ══════════════════
// The other ruling the same night: person B gets no mirror, no reading, no link,
// no notification, no account. A `reading` row IS a reachable URL - its id is a
// CSPRNG bearer token and `GET /api/mirror/[token]` serves it to whoever holds
// it - so a reading row for B is an openable reading OF B whatever any UI links.
// Both births live on the pair row and both charts are computed in memory at
// serve time. `tests/pair-route.spec.mjs` counts reading rows across a create.
//
// ══ THE 409 IS A NEW PATTERN, NOT A COPY OF THE MIRROR ══════
// Prompt X-b1 says the 409 works "exactly as the mirror flow does for one". IT
// DOES NOT: the mirror's season gate is CLIENT-side. `components/Funnel.jsx:329`
// calls `POST /api/season-check` first and only then creates the reading, and
// `app/api/season-check/route.js` says why in its own words - so the reading is
// created ONCE with the resolved answer "instead of being written and then
// mutated". There is no 409 anywhere in the mirror flow.
//
// The 409 here is still right, and the reason is that prompt X-b1 requires this
// to be verifiable end to end with curl BEFORE any UI exists. With no client
// there is nobody to ask the question in advance, so the server has to refuse and
// name what it needs. It keeps the mirror's actual invariant - a row is written
// once, with the answer already in it - which is why the 409 writes nothing.
// X-b3's UI may ask up front like the funnel does; this endpoint stays correct
// either way.
// ============================================================

import { nanoid } from 'nanoid';

import { createPair } from '../pairStore.js';
// Nickname and status checks (Prompt BC §1): the sanitiser is the prompt-injection guard.
import { sanitizeNickname, statusError } from './names.js';
import { birthInputError, needsTermSide } from '../birthInput.js';
import { consume, clientIp } from '../ratelimit.js';
import { resolveSession, sessionCookieHeader } from '../mirror/session.js';
import { recordEvent } from '../analytics/events.js';
import { cleanSource } from '../site/linkSource.js';

const reply = (body, status = 200, headers = {}) => Response.json(body, { status, headers });

/**
 * Session and rate limit, on the same dimensions as the mirror POST.
 *
 * `pair_create` is its OWN bucket rather than sharing `mirror_create`: compat is
 * a first-class entry point (ruled 2026-09-07), so a buyer who never touches the
 * mirror must not spend the mirror's budget, and a mirror explorer must not be
 * locked out of buying. Same dimensions, same numbers, separate budget.
 *
 * Order matters and matches the mirror's: the session is resolved before the
 * limit is charged, so a client is always counted against a session it will send
 * back.
 */
async function admit(request) {
  const { sessionId, isNew } = resolveSession(request);
  const headers = isNew ? { 'set-cookie': sessionCookieHeader(sessionId) } : {};

  const verdict = await consume('pair_create', { ip: clientIp(request), session: sessionId });
  if (!verdict.allowed) {
    return { refusal: reply({ error: verdict.reason }, 429, headers) };
  }
  return { refusal: null, headers };
}

/** One person's birth input, normalised off the request body. */
const birthOf = (side) => ({
  birthDate: side?.birthDate,
  birthTime: side?.birthTime ?? null,
  gender: side?.gender ?? null,
  termSide: side?.termSide ?? null,
});

/**
 * POST /api/pair — create a pair from two birth inputs.
 *
 * @param {Request} request body `{ a, b, a_reading_id? }`
 * @returns {Promise<Response>} 201 `{ id }` | 400 | 409 | 429
 */
export async function createPairRow(request) {
  const { refusal, headers } = await admit(request);
  if (refusal) return refusal;

  // Every response from here carries the session cookie when one was minted, for
  // the same reason the mirror does it: a validation failure that dropped it
  // would leave a client retrying with a FRESH session each time, so the session
  // counter would sit at one forever and only the per-IP ceiling would work.
  const rejected = (message) => reply({ error: message }, 400, headers);

  let body;
  try {
    body = await request.json();
  } catch {
    return rejected('invalid JSON body');
  }

  const a = birthOf(body?.a);
  const b = birthOf(body?.b);

  // ── NICKNAMES (optional) AND STATUS (required), Prompt BC §1 ──
  // Refused before the birth checks' 409 and before anything is stored.
  const nickA = sanitizeNickname(body?.a?.nickname);
  const nickB = sanitizeNickname(body?.b?.nickname);
  if (nickA.error || nickB.error) return rejected('nickname_invalid');
  if (statusError(body?.status)) return rejected('status_invalid');

  // Validated through the SAME function the mirror validates one birth with, so
  // the two cannot drift. The prefix is what makes a 400 say which person failed.
  for (const [side, input] of [['a', a], ['b', b]]) {
    const invalid = birthInputError(input, side);
    if (invalid) return rejected(invalid);
  }

  // ── the season gate, for BOTH people ──
  // The ONLY pre-payment computation, and it is a public calendar fact about a
  // DATE rather than anything about a person: `seasonTurnOnDate` says whether a
  // 節 falls inside that day. It matters because a boundary birth changes the
  // MONTH pillar, and a buyer must answer it BEFORE paying rather than pay for a
  // reading of the wrong chart.
  const gates = { a: needsTermSide(a), b: needsTermSide(b) };
  const unanswered = ['a', 'b'].filter((side) => gates[side].needed);
  if (unanswered.length > 0) {
    // 409, AND NOTHING IS WRITTEN. A 409 that had already stored the pair would
    // leave a half-made purchase behind; the row is created once, with the
    // answer already in it.
    return reply({
      error: 'needs_term_side',
      needs_term_side: unanswered,
      terms: Object.fromEntries(unanswered.map((side) => [side, {
        term: gates[side].term,
        at: gates[side].at,
      }])),
    }, 409, headers);
  }

  const id = nanoid(21); // CSPRNG (nanoid uses crypto), never sequential
  // Nullable by design: she may arrive from her mirror, or off the front door
  // with no reading at all (ruling 2). Accepted from the body because only the
  // client knows which reading it came from; it is a reference, never a
  // credential, and nothing about the pair is gated on it.
  const aReadingId = typeof body?.a_reading_id === 'string' ? body.a_reading_id : null;

  await createPair({
    id,
    a_reading_id: aReadingId,

    a_birth_date: a.birthDate,
    a_birth_time: a.birthTime,
    a_gender: a.gender,
    a_term_side: a.termSide,

    b_birth_date: b.birthDate,
    b_birth_time: b.birthTime,
    b_gender: b.gender,
    b_term_side: b.termSide,

    a_nickname: nickA.value,
    b_nickname: nickB.value,
    status: body.status,

    // Ruling C collects the email AT CHECKOUT, not here: a pair can be created
    // and abandoned, and storing an address for an abandoned pair collects
    // personal data for nothing.
    email: null,
    sku: 'compat',
    paid: false,      // rule 18: only the verified webhook flips this
    cache_key: null,  // X-b2 sets it when the pair's semantic JSON is built
  });

  // ── `pair_created`, CARRYING THE LINK SOURCE (Prompt BM item 4, 2026-10-08) ──
  // After the row is written, so a refused create (400, 409) records nothing. Keyed by
  // the PAIR id, like pair_served: in no mirror denominator. The source is re-validated
  // here (lib/site/linkSource.js) for the reason the mirror's is: a date-shaped code
  // must cost the code, never the event. recordEvent never throws and its result is
  // ignored - a counter may not decide whether a pair is created. checkout_started and
  // purchase_confirmed share this id and do NOT copy the source; the SQL joins them
  // (docs/ops/compat-funnel.sql).
  await recordEvent(id, 'pair_created', { ...cleanSource(body?.src), from_mirror: Boolean(aReadingId) });

  // `{ id }` ONLY. No chart, no archetype, no relation - ruling 3. The client
  // already has the birth data it typed, and everything else is behind payment.
  return reply({ id }, 201, headers);
}
