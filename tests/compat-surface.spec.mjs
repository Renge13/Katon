// ============================================================
// tests/compat-surface.spec.mjs — the reader-facing compat surface
// ============================================================
// X-b3's surface: the route, the copy slots, the shared birth fields, and the
// Xendit redirect regression X-b1 shipped on purpose and named.
//
// It does NOT render React. The funnel's own component tests mount through
// `scripts/jsx-register.mjs`, and what is worth pinning here is the CONTRACT:
// which strings exist, where the route is written down, and what the payment
// route builds. Those are the things a later edit can break silently.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { PASANGAN_COPY, SITE_COPY, UPCOMING_COPY, COPY_BANKS } from '../lib/site/copy.js';
import { UNRULED_SOURCES } from '../lib/site/unruledScan.js';
import { SENTINEL } from '../scripts/check-unruled-copy.mjs';
import { COMPAT_ROUTE, compatPairRoute } from '../lib/site/routes.js';
import { pairUrl, readingUrl } from '../lib/site/baseUrl.js';
import { priceFor, SELLABLE_SKUS } from '../lib/pricing.js';
import { readableError } from '../lib/site/readableError.js';
import { proseDelayMs, PROSE_FADE_MS, PROSE_REVEAL_BUDGET_MS, PROSE_STEP_MAX_MS } from '../components/ProseBlocks.jsx';

const ROOT = path.resolve(import.meta.dirname, '..');
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8');

/**
 * Source with comments stripped.
 *
 * A scan that reads comments matches its own documentation, which has happened
 * three times in this repo in two days - a spec looking for dropped `gift_seed`
 * matched the README saying they were dropped, and a detector matched the
 * `@@UNRULED` in its own header. `Funnel.jsx:207` explains what a `date` value is
 * and would otherwise read as a date input.
 */
const code = (p) => read(p).replace(/\/\*[\s\S]*?\*\//gu, '').replace(/^\s*\/\/.*$/gmu, '');

// ── THE ROUTE ──────────────────────────────────────────────

test('the route is RULED and written down once', () => {
  // Reyner ruled `/kompatibilitas` on 2026-09-08. It is referenced from the
  // front-door card, the page, the report page and the Xendit redirects; four
  // literals would be three chances to typo one into a 404 that only shows up
  // after a real payment.
  assert.equal(COMPAT_ROUTE, '/kompatibilitas');
  assert.equal(compatPairRoute('abc'), '/kompatibilitas/abc');

  // The page file exists at the ruled path, which is the one thing the constant
  // cannot enforce about itself.
  assert.ok(read('app/kompatibilitas/page.js').includes('Pasangan'));

  // And nothing hardcodes it. A literal here is the drift the module prevents.
  for (const file of ['components/Funnel.jsx', 'components/Pasangan.jsx', 'components/PasanganReport.jsx', 'lib/site/baseUrl.js']) {
    const src = read(file);
    const literals = src.split("'/kompatibilitas").length - 1;
    assert.equal(literals, 0, `${file} hardcodes the route instead of importing it`);
  }
});

// ── THE XENDIT REDIRECT REGRESSION X-b1 NAMED ──────────────

test('A PAIR GETS BOTH REDIRECT URLS, and they are pair URLs', () => {
  // X-b1 shipped compat checkout with NO redirect URLs and said so in a comment:
  // the destination is the report page, the page did not exist, and `readingUrl`
  // builds `/r/<token>` - handing it a PAIR id would send the buyer to a reading
  // URL for an object that is not a reading, which is what the "person B is never
  // a reading row" ruling exists to prevent. The buyer's last screen stayed on
  // Xendit. That was accepted because no reader could reach a compat checkout.
  //
  // This page is that reader. The gap closes here.
  const route = read('app/api/pay/[id]/route.js');
  assert.match(route, /successRedirectUrl: pairUrl\(id, '\?bayar=selesai'\)/u);
  assert.match(route, /failureRedirectUrl: pairUrl\(id\)/u);
  assert.equal(route.includes('...(isCompat ? {} : {'), false,
    'the empty-object branch that omitted them is gone');

  // A DIFFERENT BUILDER, not readingUrl with a different argument.
  assert.equal(pairUrl('abc', '?bayar=selesai').endsWith('/kompatibilitas/abc?bayar=selesai'), true);
  assert.equal(readingUrl('abc').endsWith('/r/abc'), true);
  assert.notEqual(pairUrl('abc'), readingUrl('abc'));
});

test('compat is sellable, which is what makes the page reachable', () => {
  assert.ok(SELLABLE_SKUS.includes('compat'));
  assert.ok(Number.isFinite(priceFor('compat')));
});

// ── THE COPY SLOTS ─────────────────────────────────────────

const PASANGAN_SLOTS = [
  'page_title', 'page_lead',
  'includes_1', 'includes_2', 'includes_3', 'includes_4', 'includes_5',
  'price_note',
  'form_a_legend', 'form_b_legend', 'form_email_label', 'form_email_help',
  'form_submit', 'season_gate_b_intro',
  'pending_title', 'pending_body', 'paid_title', 'link_keep', 'unpaid_resume',
  'report_badge_eyebrow', 'report_quadrant_eyebrow', 'notfound_title',
  // Added by Y-1, 2026-09-08: sales are CLOSED and the page has to say so.
  'sales_closed_title', 'sales_closed_body',
];

test('every slot the surface renders EXISTS', () => {
  // A missing slot renders `undefined` on the page rather than failing anything,
  // which is the failure mode this list exists for.
  for (const slot of PASANGAN_SLOTS) {
    assert.equal(typeof PASANGAN_COPY[slot], 'string', `${slot} must be a string`);
    assert.ok(PASANGAN_COPY[slot].length > 0, `${slot} must not be empty`);
  }
  assert.deepEqual(Object.keys(PASANGAN_COPY).sort(), PASANGAN_SLOTS.slice().sort(),
    'the bank has exactly the slots the surface renders - no orphans either way');

  for (const slot of ['home_mirror_label', 'home_mirror_sub', 'home_compat_label', 'home_compat_sub']) {
    assert.equal(typeof SITE_COPY[slot], 'string', `${slot} must be a string`);
  }
});

test('THE BANK IS REGISTERED, so the gate can see it', () => {
  // The whole point of commit 1. A bank that is not registered is invisible to
  // `check-unruled-copy.mjs`, and this one is 22 live placeholders.
  assert.equal(COPY_BANKS.PASANGAN_COPY, PASANGAN_COPY);
  assert.ok('PASANGAN_COPY' in UNRULED_SOURCES);
});

test('EVERY SLOT IS RULED, and the production build no longer refuses', () => {
  // ── THIS TEST INVERTED, AS ITS PREVIOUS VERSION SAID IT WOULD ──
  // It read "EVERY SLOT IS STILL A SENTINEL, and a production build must refuse"
  // and asserted 26 live placeholders, with a comment naming itself as the
  // assertion to invert when the worksheet landed. It landed 2026-09-08.
  //
  // Byte-identity against the worksheet is tests/pasangan-copy.spec.mjs's job;
  // this one only asserts that nothing is a hole any more.
  const holes = [
    ...Object.entries(PASANGAN_COPY),
    ...Object.entries(SITE_COPY).filter(([k]) => k.startsWith('home_')),
    ...Object.entries(SITE_COPY.privasi).filter(([k]) => k.startsWith('privasi_')),
  ].filter(([, v]) => typeof v === 'string' && v.includes(SENTINEL));

  assert.deepEqual(holes.map(([k]) => k), [], 'a compat slot is still a sentinel');
  // 22 from X-b3 plus the two sales-closed strings Y-1 added.
  assert.equal(Object.keys(PASANGAN_COPY).length, 24);
});

test('NO PRICE-SHAPED NUMBER IS IN THE BANK', () => {
  // Same rule UPCOMING_COPY carries: the price resolves from lib/pricing.js at
  // render time. `price_note` is the sentence AROUND the number.
  assert.ok(!/\d{2}[.,]?\d{3}/u.test(JSON.stringify(PASANGAN_COPY)),
    'a price-shaped number is in PASANGAN_COPY; resolve it from lib/pricing.js');
  assert.match(read('components/Pasangan.jsx'), /priceFor\('compat'\)/u);
});

test('THE UPCOMING BLOCK NO LONGER OFFERS COMPAT', () => {
  // It advertises what is NOT for sale, and compat is for sale.
  assert.equal('compat' in UPCOMING_COPY, false);
  assert.ok(UPCOMING_COPY.annual, 'annual keeps its row and its Belum tersedia');
  assert.equal(read('components/Funnel.jsx').includes('UPCOMING_COPY.compat'), false);
});

// ── THE SHARED BIRTH FIELDS ────────────────────────────────

test('BirthFields IS ONE IMPLEMENTATION, used by both forms', () => {
  // Three copies of a date input is three places for `min`, `max`, `step` or an
  // aria-label to drift, and the compat page needs the fields twice on one
  // screen. Asserted on the source because the alternative - mounting both and
  // comparing rendered attributes - would pass if BOTH copies drifted the same way.
  const fields = read('components/BirthFields.jsx');
  assert.match(fields, /step="3600"/u, 'whole hours only');
  assert.match(fields, /min=\{EARLIEST_BIRTH_DATE\}/u);
  assert.match(fields, /max=\{today\(\)\}/u);

  for (const file of ['components/Funnel.jsx', 'components/Pasangan.jsx']) {
    const src = code(file);
    assert.match(src, /BirthFields/u, `${file} uses the shared component`);
    assert.equal(src.includes('type="date"'), false, `${file} declares no date input of its own`);
    assert.equal(src.includes('step="3600"'), false, `${file} declares no time input of its own`);
  }
});

// ── NOTHING COMPUTED BEFORE PAYMENT ────────────────────────

test('THE PRE-PAYMENT PAGE COMPUTES NOTHING ABOUT EITHER PERSON', () => {
  // The product model, ruled 2026-09-07: no free compat result, no tease, no
  // Gemini before payment. Pre-payment is static - product block, price,
  // inclusions, the form.
  //
  // The ONE exception is the season gate, and it is not an exception to the
  // rule as stated: `seasonTurnOnDate` answers a question about a DATE (does a
  // 節 fall inside it), not about a person, and it is asked before payment
  // precisely so nobody buys a reading of the wrong month pillar.
  const src = code('components/Pasangan.jsx');
  for (const forbidden of ['buildPairSemantic', 'calculateBaziChart', 'compatBranchRelations', 'renderReading', 'GLOSSARY']) {
    assert.equal(src.includes(forbidden), false, `${forbidden} must not be reachable before payment`);
  }

  // THE ONLY ENDPOINTS IT CALLS. `/api/mirror/<token>` is the `?dari=` prefill and
  // it is not an exception either: the mirror's serve payload deliberately carries
  // NO birth data - the free card is built with `birthDate: null` so nothing about
  // a birth leaves the server on that path - so the call returns a token to keep
  // as `a_reading_id` and nothing else.
  const calls = [...src.matchAll(/fetch\(`?'?(\/api\/[^`'$]*)/gu)].map((m) => m[1]);
  assert.deepEqual([...new Set(calls)].sort(),
    ['/api/mirror/', '/api/pair', '/api/pay/', '/api/season-check']);
});

test('THE SERVER 409 IS HANDLED, not just the client-side gate', () => {
  // The client asks the season question first for the nicer flow, but
  // `POST /api/pair` runs `needsTermSide` against the engine's own solar-term
  // table and answers 409 `needs_term_side`. A stale tab, a race or a future
  // refactor that skipped the client check must be sent back to the gate rather
  // than sold a reading of the wrong month pillar.
  const src = read('components/Pasangan.jsx');
  assert.match(src, /needs_term_side/u);
  assert.match(src, /created\.terms/u, 'it uses the terms the server returned');
});

// ── THE REPORT PAGE ────────────────────────────────────────

test('B\'s BIRTH DATA NEVER APPEARS IN ANYTHING THE PAGE CONSUMES', async () => {
  // ── THE RULING THIS PROTECTS ───────────────────────────────
  // Person B gets nothing and is never a reading row. The other half of that is
  // what the BUYER receives: she paid for a reading of the dynamic, not for a
  // copy of somebody else's birth record. A page that renders B's birth date has
  // published it to whoever holds the link.
  //
  // ASSERTED ON THE REAL SERVE PAYLOADS, not on the component: the component can
  // only render what it is given, so the guarantee belongs where the bytes are
  // produced. Both endpoints the page reads are checked.
  const { createPair, markPairPaid } = await import('../lib/pairStore.js');
  const { servePairFacts } = await import('../lib/pair/serve.js');

  const id = `spec-b-privacy-${Date.now()}`;
  const B_DATE = '1990-06-07';
  const B_TIME = '12:00';
  await createPair({
    id,
    a_reading_id: null,
    a_birth_date: '1989-09-13',
    a_birth_time: '09:00',
    a_gender: null,
    a_term_side: null,
    b_birth_date: B_DATE,
    b_birth_time: B_TIME,
    b_gender: null,
    b_term_side: null,
    sku: 'compat',
  });

  // UNPAID first: the pre-payment body must carry nothing about either chart.
  const unpaid = await (await servePairFacts(id)).json();
  assert.equal(unpaid.status, 'not_paid');
  assert.equal(JSON.stringify(unpaid).includes(B_DATE), false, 'no B date while unpaid');

  await markPairPaid(id, {});
  const paid = await (await servePairFacts(id)).json();
  assert.equal(paid.status, 'paid');

  const body = JSON.stringify(paid);
  assert.equal(body.includes(B_DATE), false, 'B\'s birth DATE is not in the facts payload');
  assert.equal(body.includes(B_TIME), false, 'nor her birth TIME');
  // And the same for A, whose data the buyer does own but which the page has no
  // reason to be handed back.
  assert.equal(body.includes('1989-09-13'), false, 'nor A\'s');
});

test('THE REPORT DOES NOT BRANCH ON served_from', () => {
  // The floor is Reyner's own ruled glossary prose (rule 15: it is the second
  // half of the design, not a degraded mode), so marking it would tell a reader
  // she got something lesser when she got the sentences he wrote. `served_from`
  // stays in the payload as the passive detector of a dead provider - an
  // operator's question, not a reader's.
  const src = code('components/PasanganReport.jsx');
  assert.equal(src.includes('served_from'), false,
    'the report must render a floor identically to a render');
});

test('NO CARD, NO PDF, NO SHARE ON THE COMPAT REPORT', () => {
  // Out of scope for v1 and not an oversight: a compat card would put two
  // people's archetypes on a shareable image, and person B consented to nothing.
  const src = code('components/PasanganReport.jsx');
  for (const forbidden of ['CardA', 'CardB', 'captureCard', 'Sharecard', '/api/deliver', 'pdf']) {
    assert.equal(src.includes(forbidden), false, `${forbidden} must not be on the compat report`);
  }
});

test('THE PROSE RENDERER IS SHARED WITH THE MIRROR, not forked', () => {
  // The reveal cadence is ruled behaviour - a fixed per-item delay was replaced
  // by a budget (PROSE_REVEAL_BUDGET_MS), and the running index was made global
  // after a block-local one started every block's first paragraph at once. A
  // second copy is a second place that can rot.
  //
  // A first draft of the extraction RE-WROTE `proseDelayMs` from memory as a
  // fixed step, which is exactly the shape the budget replaced. Caught by reading
  // the original. This asserts the arithmetic, not the import.
  assert.match(code('components/Funnel.jsx'), /<ProseBlocks reading=\{reading\} \/>/u);
  assert.match(code('components/PasanganReport.jsx'), /<ProseBlocks/u);

  const budget = PROSE_REVEAL_BUDGET_MS - PROSE_FADE_MS;
  assert.equal(proseDelayMs(0, 5), 0);
  assert.equal(proseDelayMs(1, 1), 0, 'a single paragraph has no delay');
  assert.equal(proseDelayMs(1, 3), Math.min(PROSE_STEP_MAX_MS, budget / 2));
  // The whole point of the budget: a long reading finishes in the same window.
  assert.ok(proseDelayMs(29, 30) <= budget + 0.001,
    'the last paragraph still starts inside the budget');
});

test('THE PRIVACY NOTICE DISCLOSES THE EMAIL AND THE SECOND PERSON', () => {
  // ── RULING C SAID THIS WOULD COME DUE, AND NAMED THE PR ────
  // The comment above the block used to read "no email is captured anywhere
  // today, so none is claimed", with Reyner's ruling C attached: the line goes
  // false the day the first compat checkout takes one, and **/privasi changes in
  // the SAME PR that ships it**. Commit 4 shipped it. This is that PR.
  const src = read('lib/site/copy.js');
  assert.equal(src.includes('no email is captured anywhere today, so none is claimed'), false,
    'the line ruling C predicted would go false is gone, not merely annotated');

  // Both slots exist and BOTH ARE RENDERED. A disclosure that exists in the bank
  // and never reaches the page is not a disclosure.
  assert.equal(typeof SITE_COPY.privasi.privasi_email, 'string');
  assert.equal(typeof SITE_COPY.privasi.privasi_second_person, 'string');
  const page = read('app/privasi/page.js');
  assert.match(page, /q.privasi_email/u);
  assert.match(page, /q.privasi_second_person/u);
});

// ── THE PREVIEW SUBMIT FAILURE, 2026-09-08 ────────────────
// Reyner walked #105's preview on a phone and submit failed with the generic
// "Ada yang salah. Coba lagi sebentar." Reproduced under the preview's own
// conditions - `next start`, NODE_ENV=production, no Xendit keys - with the
// exact inputs he used:
//
//   $ curl -X POST /api/pair -d '{"a":{"birthDate":"1989-09-13",...},
//                                 "b":{"birthDate":"1997-09-14",...}}'
//     {"id":"5wbKdq3eK_TwXNTx91i_G"}                         HTTP 201
//   $ curl -X POST /api/pay/5wbKdq3eK_TwXNTx91i_G -d '{"sku":"compat",...}'
//     {"error":"payment_not_configured:xendit_secret_key_unset"}   HTTP 503
//
// **NOTHING THREW.** It is `lib/paymentFence.js` refusing on purpose: a Vercel
// PREVIEW runs with NODE_ENV=production, so the fail-closed fence fires unless
// XENDIT_SECRET_KEY and XENDIT_WEBHOOK_TOKEN are set for the Preview environment
// too. `/api/pair` is fine - so it is neither the 409 dual-season path nor the
// store.

test('THE PAIR IS CREATED for the exact inputs from the phone walk', async () => {
  // The half that WORKS, pinned so the next failure is not re-diagnosed from
  // scratch. 1989-09-13 and 1997-09-14 are both ordinary days - no 節 inside
  // either - so no season gate is raised and the 409 branch is not involved.
  const { needsTermSide } = await import('../lib/birthInput.js');
  for (const birthDate of ['1989-09-13', '1997-09-14']) {
    assert.equal(needsTermSide({ birthDate, birthTime: null }).needed, false,
      `${birthDate} is not a solar-term boundary, so no gate and no 409`);
  }
});

test('IN PRODUCTION WITH NO XENDIT KEY, /api/pay REFUSES - shape and all', async () => {
  // The real response, asserted field by field rather than "it errors": the
  // client showed a generic sentence precisely because it only knew that much,
  // and a test that also only knew that much would not have caught this either.
  //
  // ── PAYMENTS_PROVIDER=xendit IS NOW EXPLICIT, 2026-09-08 ───
  // This test pinned the diagnosis of Reyner's preview failure, and at the time
  // there was no provider variable - Xendit was the only path. There is one now
  // and it defaults to CLOSED, so leaving it unset here would make the fence
  // answer `payment_closed` and this test would assert the wrong refusal while
  // still passing on the word "refuses". Naming the provider keeps the assertion
  // about the thing it was written for. `tests/payments-provider.spec.mjs` owns
  // the closed case.
  const { paymentFenceReason, devBypassAllowed } = await import('../lib/paymentFence.js');
  const saved = {
    env: process.env.NODE_ENV,
    key: process.env.XENDIT_SECRET_KEY,
    provider: process.env.PAYMENTS_PROVIDER,
  };
  try {
    process.env.NODE_ENV = 'production';
    process.env.PAYMENTS_PROVIDER = 'xendit';
    delete process.env.XENDIT_SECRET_KEY;

    assert.equal(paymentFenceReason(), 'xendit_secret_key_unset');
    assert.equal(devBypassAllowed(), false,
      'and the dev fallback that hides this locally is OFF - which is why it only showed on preview');

    // The literal body the route builds from that reason. This is the string a
    // later session will grep for when the same thing happens again.
    const body = { error: `payment_not_configured:${paymentFenceReason()}` };
    assert.equal(body.error, 'payment_not_configured:xendit_secret_key_unset');
  } finally {
    process.env.NODE_ENV = saved.env;
    if (saved.key === undefined) delete process.env.XENDIT_SECRET_KEY;
    else process.env.XENDIT_SECRET_KEY = saved.key;
    if (saved.provider === undefined) delete process.env.PAYMENTS_PROVIDER;
    else process.env.PAYMENTS_PROVIDER = saved.provider;
  }
});

test('AND THAT SUBMIT IS NOW REFUSED FOR A DIFFERENT REASON ENTIRELY', async () => {
  // The env var Reyner was told to set for Preview is moot: sales are CLOSED
  // (2026-09-08, Katon is exiting Xendit), so the same submit now answers
  // `payment_closed` on every environment where the provider is not explicitly
  // something else. Recorded here rather than deleting the test above, because
  // the diagnosis was right and the situation moved.
  const { paymentFenceReason } = await import('../lib/paymentFence.js');
  const saved = process.env.PAYMENTS_PROVIDER;
  try {
    delete process.env.PAYMENTS_PROVIDER;
    assert.equal(paymentFenceReason(), 'payment_closed');
  } finally {
    if (saved === undefined) delete process.env.PAYMENTS_PROVIDER;
    else process.env.PAYMENTS_PROVIDER = saved;
  }
});

test('THE WEBHOOK TOKEN IS THE SECOND GATE, so setting one key is not enough', async () => {
  // Worth its own assertion because it is the next thing to go wrong: with only
  // XENDIT_SECRET_KEY set for Preview, the fence still refuses and the symptom is
  // identical from the reader's side.
  const { paymentFenceReason } = await import('../lib/paymentFence.js');
  const saved = {
    env: process.env.NODE_ENV,
    key: process.env.XENDIT_SECRET_KEY,
    tok: process.env.XENDIT_WEBHOOK_TOKEN,
    provider: process.env.PAYMENTS_PROVIDER,
  };
  try {
    process.env.NODE_ENV = 'production';
    process.env.PAYMENTS_PROVIDER = 'xendit';
    process.env.XENDIT_SECRET_KEY = 'set';
    delete process.env.XENDIT_WEBHOOK_TOKEN;
    assert.equal(paymentFenceReason(), 'xendit_webhook_token_unset');
  } finally {
    process.env.NODE_ENV = saved.env;
    if (saved.key === undefined) delete process.env.XENDIT_SECRET_KEY;
    else process.env.XENDIT_SECRET_KEY = saved.key;
    if (saved.tok === undefined) delete process.env.XENDIT_WEBHOOK_TOKEN;
    else process.env.XENDIT_WEBHOOK_TOKEN = saved.tok;
    if (saved.provider === undefined) delete process.env.PAYMENTS_PROVIDER;
    else process.env.PAYMENTS_PROVIDER = saved.provider;
  }
});

test('THE PAGE CANNOT TELL A CONFIG REFUSAL FROM A TRANSIENT ONE, and says so', () => {
  // ── THE PART THAT IS STILL A DEFECT, RECORDED NOT FIXED ────
  // `readableError` maps everything except a rate limit to "Ada yang salah. Coba
  // lagi sebentar." - "try again shortly". For a fail-closed CONFIG refusal that
  // is false: retrying can never succeed until an env var is set. Reyner saw the
  // generic sentence and had to ask what broke.
  //
  // NOT FIXED HERE because the honest fix is a different sentence, and a sentence
  // is user-facing Indonesian and Reyner's alone (rule 20). Adding a PENDING()
  // slot for it was considered and NOT taken: it would ask him to rule copy for a
  // state that should never reach a reader in production, which is ceremony.
  //
  // This test is the record of the gap and it is deliberately weak - it asserts
  // the CURRENT behaviour so that changing it is a decision someone makes on
  // purpose, with his wording, rather than a drive-by.
  const RATE = ['rate_limited', 'session', 'ip'];
  assert.equal(readableError({ error: 'payment_not_configured:xendit_secret_key_unset' }),
    readableError({ error: 'anything_else' }),
    'a config refusal and a transient failure read identically to the reader today');
  for (const e of RATE) {
    assert.notEqual(readableError({ error: e }), readableError({ error: 'other' }),
      'the one refusal that IS named stays named');
  }
});
