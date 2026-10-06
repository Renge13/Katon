#!/usr/bin/env node
// ============================================================
// scripts/funnel-walk.mjs — one reading, creation to purchase, and every funnel row it left
// ============================================================
//   node --conditions=react-server --env-file=<.env.local with the SANDBOX DOKU pair> scripts/funnel-walk.mjs
//
// Prompt BG §2.6: "verify firing, not definitions". This drives the REAL route modules
// in-process, in order, and prints every `funnel_event` row the reading left:
//   POST /api/mirror                 reading_created (has_hour)
//   GET  /api/mirror/<token>         mirror_served   (= reading_viewed)
//   POST /api/mirror/<token>/event   offer_seen, three times: first view, a reload, a re-scroll
//   POST /api/pay/<token>            checkout_started (a REAL, unpaid SANDBOX DOKU checkout)
//   POST /api/doku/notify            purchase_confirmed, from a notification HAND-SIGNED with
//                                    the sandbox secret for that checkout's invoice (the VA
//                                    walk 1 precedent, docs/PROGRESS.md test rows)
//   POST /api/mirror/<token>/event   offer_seen once more, now that it is paid
//
// WHY NOT MOCK PAYMENTS: the mock unlock (`/api/mock-pay`) flips `paid` and records no
// `purchase_confirmed` - that event is the verified notification's alone - so a mock walk
// cannot show step 5. Sandbox DOKU is local only here: no Supabase (the in-memory store),
// and GEMINI_API_KEY is removed before anything loads, so the reading is the FLOOR and the
// run costs nothing.
//
// The route files import through the bundler alias `@/`; scripts/alias-register.mjs maps it to
// the repo root, the only thing that stands between plain Node and those modules.
// ============================================================

import './alias-register.mjs'; // the bundler's @/ alias, one shared copy of the rule

if (!process.env.DOKU_SANDBOX || !process.env.DOKU_CLIENT_ID || !process.env.DOKU_SECRET_KEY) {
  console.error('funnel-walk: needs the SANDBOX DOKU pair (DOKU_SANDBOX, DOKU_CLIENT_ID, DOKU_SECRET_KEY).');
  process.exit(2);
}
if (process.env.VERCEL_ENV) { console.error('funnel-walk: local only.'); process.exit(2); }
process.env.PAYMENTS_PROVIDER = 'doku';
delete process.env.GEMINI_API_KEY;
for (const k of Object.keys(process.env)) if (k.startsWith('SUPABASE')) delete process.env[k];

const { createMirrorReading, serveMirrorReading, recordMirrorEvent } = await import('../lib/mirror/handlers.js');
const { POST: payRoute } = await import('../app/api/pay/[id]/route.js');
const { handleDokuNotification, NOTIFY_TARGET } = await import('../lib/doku/notify.js');
const { digestOf, signComponents } = await import('../lib/doku/signature.js');
const { getReading } = await import('../lib/readingStore.js');
const { priceFor } = await import('../lib/pricing.js');
const { readEvents } = await import('../lib/analytics/events.js');

const json = (body) => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
const step = (label, res) => console.log(`${label.padEnd(44)} ${res.status}`);

const created = await createMirrorReading(new Request('http://localhost/api/mirror', json({ birthDate: '1989-09-13', birthTime: '09:00', gender: 'female' })));
const { token } = await created.json();
step(`POST /api/mirror -> ${token}`, created);

step('GET  /api/mirror/<token>', await serveMirrorReading(new Request(`http://localhost/api/mirror/${token}`), token));

for (const why of ['first view', 'after a reload', 'after a re-scroll']) {
  step(`POST /event offer_seen (${why})`, await recordMirrorEvent(new Request(`http://localhost/api/mirror/${token}/event`, json({ event: 'offer_seen' })), token));
}

const pay = await payRoute(new Request(`http://localhost/api/pay/${token}`, json({})), { params: Promise.resolve({ id: token }) });
const payBody = await pay.json();
step('POST /api/pay/<token>', pay);
console.log(`  checkout url  ${payBody.invoiceUrl ?? payBody.url ?? JSON.stringify(payBody)}`);

const invoice = (await getReading(token)).invoice_id;
const raw = JSON.stringify({
  service: { id: 'QRIS' }, channel: { id: 'QRIS_DOKU' },
  order: { invoice_number: invoice, amount: String(priceFor('artifact')) },
  transaction: { status: 'SUCCESS', date: new Date().toISOString().slice(0, 19) + 'Z' },
});
const requestId = crypto.randomUUID();
const timestamp = new Date().toISOString().slice(0, 19) + 'Z';
const notify = await handleDokuNotification(new Request(`http://localhost${NOTIFY_TARGET}`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json', 'client-id': process.env.DOKU_CLIENT_ID, 'request-id': requestId, 'request-timestamp': timestamp,
    signature: signComponents({ clientId: process.env.DOKU_CLIENT_ID, requestId, timestamp, target: NOTIFY_TARGET, digest: digestOf(raw) }, process.env.DOKU_SECRET_KEY),
  },
  body: raw,
}));
step(`POST ${NOTIFY_TARGET} (invoice ${invoice})`, notify);
console.log(`  paid now      ${(await getReading(token)).paid}`);

step('POST /event offer_seen (paid reading)', await recordMirrorEvent(new Request(`http://localhost/api/mirror/${token}/event`, json({ event: 'offer_seen' })), token));

console.log('\nfunnel_event rows for this reading:');
for (const r of (await readEvents()).filter((e) => e.reading_id === token).sort((a, b) => a.created_at.localeCompare(b.created_at))) {
  console.log(`  ${r.event.padEnd(20)} count ${String(r.count).padEnd(3)} detail ${JSON.stringify(r.detail)}`);
}
