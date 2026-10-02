// ============================================================
// tests/pair-route.spec.mjs — POST /api/pair
// ============================================================
// THE LOAD-BEARING ASSERTION IN THIS FILE IS "PERSON B IS NEVER A READING ROW".
// Ruled by Reyner 2026-09-07 (night), verbatim in docs/prompts/X-compat-2b1.md:
//
//   "Person B gets: no mirror, no individual reading, no link, no notification,
//    no account, no information sent to them. Her birth data is used only as the
//    second input to the compatibility calculation."
//
// That is a constraint on the DATA MODEL, not on the UI, and the reason is that a
// `reading` row IS a reachable URL: its id is a CSPRNG bearer token and
// `GET /api/mirror/[token]` serves the reading to whoever holds it. A reading row
// for person B is therefore an openable reading OF person B, regardless of what
// any UI links to. The convenient implementation - build both charts by creating
// two readings and joining them - is the one thing the ruling forbids.
//
// So the test counts reading rows across a pair create and asserts the count did
// not move. A later session that "simplifies" the pair into two readings fails
// here with the reason attached, rather than shipping a URL nobody meant to mint.
// ============================================================

import assert from 'node:assert/strict';
import { test, beforeEach } from 'node:test';

import { RATE_LIMITS, __clearMemRateLimit } from '../lib/ratelimit.js';
import { birthInputError, needsTermSide, DATE_RE, TIME_RE } from '../lib/birthInput.js';

// The dev in-memory stores, which is what these routes write to with no Supabase
// configured. Reading them directly is how the row COUNT is observed - there is
// no list endpoint, and there should not be one (rule 19: no bulk endpoint).
const readingMem = (globalThis.__katonReadingMem ??= new Map());
const pairMem = (globalThis.__katonPairMem ??= new Map());

import { createPairRow } from '../lib/pair/handlers.js';

const post = (body) => createPairRow(new Request('http://localhost/api/pair', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  // The relationship status is REQUIRED since Prompt BC §1 (2026-10-02); these tests are
  // about births, so every post carries one unless it names its own.
  body: JSON.stringify({ status: 'PDKT', ...body }),
}));

// A boundary birth: 1985-02-04 carries 立春, which is why it is fixture chart 10
// and why CLAUDE.md rule 3 cites 立春 1989 = 1989-02-04 04:27. With no birth time
// the month pillar is undetermined for the whole day.
const A_PLAIN = { birthDate: '1989-09-13', birthTime: '09:00' };
const B_PLAIN = { birthDate: '1990-03-04', birthTime: '14:00' };
const B_BOUNDARY = { birthDate: '1985-02-04', birthTime: null };

beforeEach(() => {
  readingMem.clear();
  pairMem.clear();
  __clearMemRateLimit();
});

test('the season-gate condition is COPIED from the shipped consumer, not re-derived', () => {
  // components/Funnel.jsx:334-339 is the live gate. Its condition is
  // `birthHour === null || birthHour === turn.hour`, so:
  //   - no time at all -> needed (the turn is a whole day wide)
  //   - an hour that is NOT the turn's hour -> not needed
  // A reconstruction that asked on every hour of a turn day, or on none, would
  // disagree with the mirror about the ~12 days a year this fires.
  const dayWide = needsTermSide({ birthDate: '1985-02-04', birthTime: null });
  assert.equal(dayWide.needed, true);
  assert.ok(dayWide.term, 'the term is named so a client can ask the question');

  // An answered gate is never asked again.
  assert.equal(
    needsTermSide({ birthDate: '1985-02-04', birthTime: null, termSide: 'before' }).needed,
    false,
  );
  // A date with no turn on it never asks.
  assert.equal(needsTermSide({ birthDate: '1989-09-13', birthTime: '09:00' }).needed, false);
});

test('the validator is SHARED with the mirror, not a second copy', () => {
  // CHECK: one input contract, one home. The mirror route imports this same
  // function (lib/mirror/handlers.js), so these messages cannot drift from the
  // ones a mirror client sees. The messages are part of the HTTP contract.
  assert.equal(birthInputError({ birthDate: 'nope' }), 'birthDate (YYYY-MM-DD) is required');
  assert.equal(
    birthInputError({ birthDate: '1989-09-13', birthTime: '9:00' }),
    'birthTime must be HH:MM (24h) or omitted',
  );
  assert.equal(
    birthInputError({ birthDate: '1989-09-13', gender: 'other' }),
    'gender must be "male", "female", or omitted',
  );
  assert.equal(
    birthInputError({ birthDate: '1989-09-13', termSide: 'middle' }),
    'termSide must be "before", "after", or omitted',
  );
  assert.equal(birthInputError(A_PLAIN), null);

  // The prefix is what lets one 400 say WHICH person failed, and the mirror
  // deliberately passes none so its existing messages are unchanged.
  assert.equal(birthInputError({ birthDate: 'nope' }, 'b'), 'b: birthDate (YYYY-MM-DD) is required');

  // The regexes are exported so nothing has to re-derive them either.
  assert.ok(DATE_RE.test('1989-09-13') && !DATE_RE.test('89-09-13'));
  assert.ok(TIME_RE.test('23:59') && !TIME_RE.test('24:00'));
});

test('two valid births create a pair, and it returns the id and NOTHING else', () => {
  return post({ a: A_PLAIN, b: B_PLAIN }).then(async (res) => {
    assert.equal(res.status, 201);
    const body = await res.json();

    // `{ id }` ONLY. Ruling 3: no free compat result, so a create may not leak a
    // chart, an archetype, or a relation. Asserted as an exact key set rather
    // than a spot check, so an added field has to be a deliberate edit here.
    assert.deepEqual(Object.keys(body), ['id']);
    assert.equal(typeof body.id, 'string');
    assert.equal(body.id.length, 21, 'nanoid(21), same generator as reading.id');

    // The row holds both births itself.
    const row = pairMem.get(body.id);
    assert.ok(row, 'the pair row exists');
    assert.equal(row.a_birth_date, '1989-09-13');
    assert.equal(row.b_birth_date, '1990-03-04');
    assert.equal(row.paid, false, 'never paid at create; only the webhook flips it');
    assert.equal(row.sku, 'compat');
    assert.equal(row.email, null, 'ruling C collects email AT CHECKOUT, not here');
    assert.equal(row.a_reading_id, null, 'nullable by design - compat is a front door');
  });
});

test('PERSON B NEVER BECOMES A READING ROW', async () => {
  // The assertion this file exists for. See the header for why a reading row is a
  // reachable URL and therefore not a neutral implementation detail.
  assert.equal(readingMem.size, 0, 'precondition: no readings');

  const res = await post({ a: A_PLAIN, b: B_PLAIN });
  assert.equal(res.status, 201);

  assert.equal(
    readingMem.size, 0,
    'a pair create must not create a reading row for EITHER person - B has no '
    + 'reading, no token and no URL anywhere in this system',
  );

  // And nothing in the pair row is a reading id that could be dereferenced.
  const row = pairMem.get((await res.clone().json()).id) ?? [...pairMem.values()][0];
  assert.equal(row.a_reading_id, null);
  assert.equal('b_reading_id' in row, false, 'there is no such column, and there must not be');
});

test('an unanswered boundary birth is a 409 that NAMES which person', async () => {
  // The buyer must answer the boundary before paying, because it changes the
  // chart and she would otherwise pay for a reading of the wrong one.
  const res = await post({ a: A_PLAIN, b: B_BOUNDARY });
  assert.equal(res.status, 409);
  const body = await res.json();
  assert.deepEqual(body.needs_term_side, ['b'], 'names b, not just "someone"');
  assert.ok(body.terms?.b?.term, 'the term is named so the question can be asked');

  // AND NO ROW WAS WRITTEN. A 409 that had already stored the pair would leave a
  // half-made purchase behind, and the mirror's own season-check comment gives
  // the reason in its own words: the row is created ONCE with the resolved answer
  // "instead of being written and then mutated".
  assert.equal(pairMem.size, 0, 'a 409 writes nothing');
  assert.equal(readingMem.size, 0);
});

test('both people on a boundary are both named', async () => {
  const res = await post({ a: B_BOUNDARY, b: B_BOUNDARY });
  assert.equal(res.status, 409);
  const body = await res.json();
  assert.deepEqual(body.needs_term_side, ['a', 'b'], 'in reading order');
});

test('an ANSWERED boundary birth creates the pair and stores the answer', async () => {
  const res = await post({ a: A_PLAIN, b: { ...B_BOUNDARY, termSide: 'after' } });
  assert.equal(res.status, 201);
  const { id } = await res.json();
  assert.equal(pairMem.get(id).b_term_side, 'after');
});

test('a bad birth is a 400 that names the person, and writes nothing', async () => {
  for (const [payload, expected] of [
    [{ a: { birthDate: 'nope' }, b: B_PLAIN }, 'a: birthDate (YYYY-MM-DD) is required'],
    [{ a: A_PLAIN, b: { birthDate: '1990-03-04', birthTime: '25:00' } }, 'b: birthTime must be HH:MM (24h) or omitted'],
    [{ a: A_PLAIN }, 'b: birthDate (YYYY-MM-DD) is required'],
    [{}, 'a: birthDate (YYYY-MM-DD) is required'],
  ]) {
    const res = await post(payload);
    assert.equal(res.status, 400, JSON.stringify(payload));
    assert.equal((await res.json()).error, expected);
  }
  assert.equal(pairMem.size, 0);
  assert.equal(readingMem.size, 0);
});

test('the create COMPUTES NOTHING about the relationship', async () => {
  // Ruling 3: "no Gemini render before payment. The pre-payment Compat flow
  // should be deterministic/static and cheap." The only pre-payment computation
  // is the solar-term check, which is a public calendar fact about a DATE and
  // says nothing about a person.
  //
  // Asserted on the RESPONSE and on the ROW: neither may carry a chart, a day
  // master, an archetype, a relation or any hanzi. A create that quietly built
  // the facts "to validate them" would be a free compat result in the database.
  const res = await post({ a: A_PLAIN, b: B_PLAIN });
  assert.equal(res.status, 201);
  const { id } = await res.json();
  const row = pairMem.get(id);
  // WITHOUT THIS the test passes on a stub that creates nothing: an absent row
  // serialises to nothing and trivially contains no hanzi. A no-leak assertion
  // has to prove there was something that COULD have leaked.
  assert.ok(row, 'the row exists, so the no-leak assertions below are not vacuous');
  const serialised = JSON.stringify({ body: { id }, row });

  assert.ok(!/[一-鿿]/u.test(serialised), 'no hanzi anywhere: no chart was stored');
  for (const leak of ['day_master', 'archetype', 'pull', 'fit', 'quadrant', 'pattern', 'facts']) {
    assert.ok(!serialised.includes(leak), `no ${leak} in the create's output or row`);
  }
});

test('the rate-limit bucket exists and carries the mirror POST\'s dimensions', () => {
  // The prompt requires "the same consume() dimensions as the mirror POST".
  const pair = RATE_LIMITS.pair_create;
  assert.ok(pair, 'pair_create bucket exists');
  assert.deepEqual(
    Object.keys(pair).sort(),
    Object.keys(RATE_LIMITS.mirror_create).sort(),
    'same dimensions as mirror_create: session and ip',
  );
  // Its OWN bucket, not mirror_create's: compat is a first-class entry point, so
  // a compat buyer must not spend the mirror's budget and vice versa.
  assert.notEqual(pair, RATE_LIMITS.mirror_create);
});
