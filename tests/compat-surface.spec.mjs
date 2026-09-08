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
  for (const file of ['components/Funnel.jsx', 'components/Pasangan.jsx', 'lib/site/baseUrl.js']) {
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

test('EVERY SLOT IS STILL A SENTINEL, and a production build must refuse', () => {
  // ── THIS TEST INVERTS WHEN REYNER RULES THE COPY ───────────
  // It is the record that the surface shipped with named holes on purpose. When
  // the worksheet is applied, this becomes "every slot is ruled" and the sentinel
  // assertion below is the one to delete - the same way COMPAT_COPY's did.
  const unruled = [
    ...Object.entries(PASANGAN_COPY),
    ...Object.entries(SITE_COPY).filter(([k]) => k.startsWith('home_')),
  ].filter(([, v]) => typeof v === 'string' && v.includes(SENTINEL));

  assert.equal(unruled.length, 26,
    '22 PASANGAN_COPY slots plus the four home_* slots are unruled');
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
