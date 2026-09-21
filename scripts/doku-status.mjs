// ============================================================
// scripts/doku-status.mjs — ask DOKU what it thinks happened
// ============================================================
// Run: npm run doku:status -- <invoice_number>
//
// V-doku.md §6. FOR THE DAY A BUYER SAYS "I PAID" AND THE ROW SAYS OTHERWISE. That
// is the whole brief: a human wants to look, and the alternative is reading a
// function log or the DOKU Back Office.
//
// IT IS NOT ON ANY ROUTE'S PATH, deliberately. §3 says why the notify handler does
// not re-fetch status: DOKU's notification is HMAC'd over the exact body, so a body
// that verifies IS DOKU's record, and a network call inside a handler DOKU retries
// would buy nothing the signature has not already given. Check-status exists for
// this script and for nothing else.
//
// THE INVOICE NUMBER IS THE FULL ONE, suffix included - `<rowId>.<base36>` as the
// pay route wrote it, which is what is in the row's `invoice_id` column. The bare
// row id will not find it.
// ============================================================

import { checkStatus, dokuBase } from '../lib/doku/client.js';

const invoiceNumber = process.argv[2];

if (!invoiceNumber) {
  console.error('\nusage: npm run doku:status -- <invoice_number>\n'
    + '  The FULL invoice number, suffix included - the `invoice_id` column.\n');
  process.exit(1);
}
if (!process.env.DOKU_CLIENT_ID || !process.env.DOKU_SECRET_KEY) {
  console.error('\ndoku-status: DOKU_CLIENT_ID and DOKU_SECRET_KEY must both be set.\n'
    + '  They are read from .env.local. Which DOKU it asks is decided by DOKU_SANDBOX:\n'
    + '  present means sandbox, absent means production.\n');
  process.exit(1);
}

// PRINTED BEFORE THE CALL, not after. The commonest way to misread this output is to
// assume it came from the other environment, and by then the answer is already on
// screen next to a conclusion.
console.log(`asking ${dokuBase()} about ${invoiceNumber}`);

try {
  const { status, amount, invoiceNumber: echoed, raw } = await checkStatus(invoiceNumber);
  console.log(`\n  transaction.status   ${status ?? '(none)'}`);
  console.log(`  order.amount         ${amount ?? '(none)'}`);
  // ECHOED BACK AND COMPARED. A status for the wrong invoice is the one wrong answer
  // that looks exactly like a right one.
  console.log(`  order.invoice_number ${echoed ?? '(none)'}`);
  if (echoed && echoed !== invoiceNumber) {
    console.log('\n  WARNING: DOKU answered about a DIFFERENT invoice number than was asked.');
  }
  console.log(`\n${JSON.stringify(raw, null, 2)}`);
} catch (err) {
  // The message only. `client.js` builds it from DOKU's own `message` and never
  // includes the keys.
  console.error(`\ndoku-status: ${err.message}\n`);
  process.exit(1);
}
