#!/usr/bin/env node
// ============================================================
// scripts/probe-reconcile.mjs — one REAL DOKU check-status through the reconcile path
// ============================================================
//   npm run probe:reconcile -- <invoice_number> [--sku artifact|compat]
//
// PAY-SAFETY-ALL-PURCHASES's verification (Reyner, 2026-09-23): the mocked tests
// prove the guards and the settle, and cannot prove the REQUEST - that it is formed
// and signed the way DOKU accepts. This sends one real check-status through
// `reconcileReading`, the path the page's POST /api/deliver/<id>/reconcile runs,
// using `lib/doku/client.js#checkStatus` - the client `doku:status` uses.
//
// IT WRITES NOTHING ANYWHERE. It refuses to run with a Supabase URL in the env, so
// the reading row it creates is the in-memory store's and dies with the process.
// Which DOKU it asks is `DOKU_SANDBOX`'s decision (present = sandbox), exactly as
// for `doku:status`.
// ============================================================

const invoiceNumber = process.argv[2];
const skuAt = process.argv.indexOf('--sku');
const sku = skuAt > -1 ? process.argv[skuAt + 1] : 'artifact';

if (!invoiceNumber || !invoiceNumber.includes('.')) {
  console.error('usage: npm run probe:reconcile -- <invoice_number id.suffix> [--sku artifact|compat]');
  process.exit(1);
}
if (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('probe:reconcile: refusing to run against a real database. Unset the Supabase URL.');
  process.exit(1);
}

const { createReading, setInvoice, getReading } = await import('../lib/readingStore.js');
const { reconcileReading } = await import('../lib/deliver/reconcile.js');
const { dokuBase } = await import('../lib/doku/client.js');

const id = invoiceNumber.split('.')[0];
await createReading({ id, day_master: '丙', paid: false, sku });
await setInvoice(id, { invoiceId: invoiceNumber, sku });

console.log(`provider=${process.env.PAYMENTS_PROVIDER} base=${dokuBase()} row=${id} sku=${sku}`);
const out = await reconcileReading(id);
console.log(`reconcileReading -> ${JSON.stringify(out)}`);
console.log(`row.paid after -> ${(await getReading(id)).paid}`);
