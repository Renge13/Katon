import 'server-only';
// SERVER ONLY. Xendit QRIS invoice creation + webhook callback-token verification.
//
// Xendit's webhook auth model: every callback carries an `x-callback-token`
// header equal to your account's Callback Verification Token (from the Xendit
// dashboard). We compare it to XENDIT_WEBHOOK_TOKEN. There is no per-payload HMAC
// signature for invoice callbacks — the shared token IS the verification.

import crypto from 'node:crypto';

/**
 * THE ONLY XENDIT ENDPOINT IN THE REPO, and as of 2026-09-03 it sits under a
 * COMMERCIAL FREEZE that has nothing to do with whether this code works.
 *
 * **DO NOT MIGRATE THIS TO THE PAYMENT SESSION API.** Not as a cleanup, not as a
 * fix for the legacy-fee risk below, not because Xendit's docs call this path
 * legacy. Migration is ONE OF THREE OUTCOMES - migrate, terminate, or stay - and
 * Reyner has not ruled between them.
 *
 * WHY, in one line each. Xendit's 2026-10-01 pricing adds a USD 50 monthly
 * minimum that binds every month at this volume (~Rp 880.000/month of fixed cost
 * on an account earning nothing), a USD 250 monthly maintenance fee IF the
 * account is on the legacy API, and a per-transaction processing fee charged on
 * ALL ATTEMPTS. Whether `/v2/invoices` counts as legacy is an OPEN QUESTION with
 * Xendit support, not a known fact - reading "v2" as "not legacy" is a guess.
 *
 * THE DECISION IS REYNER'S, in the last week of September, on the funnel's
 * purchase data: no purchases means terminate before 1 October, purchases means
 * migrate. A session that "helpfully" migrates has spent effort on a path that
 * may be terminated in weeks, and has made terminating MORE expensive by adding
 * code to it.
 *
 * FULL ROW, WITH THE FEE CORRECTION AND THE END CONDITION:
 * `docs/PROGRESS.md`, THE INTERIM REGISTER, the row headed
 * **XENDIT PRICING CHANGES 2026-10-01**. Cited by heading rather than by line
 * because lines move and this pointer must not rot into a wrong address.
 *
 * ORDINARY MAINTENANCE OF THIS FILE CONTINUES NORMALLY. The freeze is on NEW
 * Xendit work, not on the paid path.
 *
 * This block is here rather than only in the ledger for the reason CLAUDE.md
 * gives for putting the `STAGE6_VERSION` rule on its own constant: the person
 * about to change this does not open `docs/PROGRESS.md` first.
 */
const XENDIT_INVOICE_URL = 'https://api.xendit.co/v2/invoices';

/**
 * Constant-time token comparison. Both sides are SHA-256'd first so the buffers
 * are always equal length (timingSafeEqual throws on length mismatch) and the
 * raw token length isn't leaked through timing.
 */
function constantTimeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a), 'utf8').digest();
  const hb = crypto.createHash('sha256').update(String(b), 'utf8').digest();
  return crypto.timingSafeEqual(ha, hb);
}

/**
 * Verify the x-callback-token header against the configured webhook token.
 * Returns { ok, reason }. `ok` is true ONLY when a configured token is present
 * and matches in constant time.
 */
export function verifyCallbackToken(presentedToken) {
  const expected = process.env.XENDIT_WEBHOOK_TOKEN;
  if (!expected) return { ok: false, reason: 'not_configured' };
  if (!presentedToken) return { ok: false, reason: 'missing_token' };
  return { ok: constantTimeEqual(presentedToken, expected), reason: 'token_compare' };
}

/**
 * Create a QRIS invoice for a reading. `external_id = readingId` so the webhook
 * callback correlates straight back to the row (no extra lookup column needed).
 * Throws with err.code = 'not_configured' when XENDIT_SECRET_KEY is unset, so the
 * route can fall back to a dev pending state without real Xendit.
 *
 * `successRedirectUrl` / `failureRedirectUrl` are the WAY BACK. Checkout opens in
 * a second tab, and without them that tab ends on a Xendit page with no route to
 * the thing she just bought - the buyer's last screen is the payment processor's.
 * Both are optional so a caller that has no absolute origin simply omits them
 * rather than posting a broken one; Xendit falls back to its own pages.
 *
 * NEITHER IS AN UNLOCK PATH. They are browser redirects the buyer could type
 * herself, so they carry no entitlement: `paid` still flips only in the verified
 * webhook (CLAUDE.md rule 18), and the page they land on re-reads it from the
 * server. There is no expiry redirect in the invoice API - an expired invoice
 * ends on Xendit's own expired page, and only a fresh invoice leaves it.
 */
export async function createQrisInvoice({
  readingId, amount, description, successRedirectUrl, failureRedirectUrl,
}) {
  const key = process.env.XENDIT_SECRET_KEY;
  if (!key) {
    const e = new Error('xendit_secret_key_not_set');
    e.code = 'not_configured';
    throw e;
  }
  const auth = Buffer.from(`${key}:`).toString('base64'); // Xendit: secretKey as Basic username

  const res = await fetch(XENDIT_INVOICE_URL, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      external_id: readingId,
      amount,
      currency: 'IDR',
      description,
      payment_methods: ['QRIS'],
      ...(successRedirectUrl ? { success_redirect_url: successRedirectUrl } : {}),
      ...(failureRedirectUrl ? { failure_redirect_url: failureRedirectUrl } : {}),
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const e = new Error(`xendit_invoice_failed: ${res.status} ${data?.message || ''}`);
    e.code = 'invoice_failed';
    throw e;
  }
  // invoice_url hosts the QRIS QR; expose qr string too if present.
  return { invoiceId: data.id, invoiceUrl: data.invoice_url, raw: { status: data.status } };
}

/**
 * Re-fetch an invoice from Xendit by id. The webhook uses this to confirm payment
 * against AUTHORITATIVE data (Xendit's own record) rather than trusting the
 * callback body — so a leaked callback token can't forge an unlock. Returns the
 * canonical { id, externalId, status, amount }. Throws err.code='not_configured'
 * when XENDIT_SECRET_KEY is unset (dev).
 */
export async function getInvoice(invoiceId) {
  const key = process.env.XENDIT_SECRET_KEY;
  if (!key) {
    const e = new Error('xendit_secret_key_not_set');
    e.code = 'not_configured';
    throw e;
  }
  const auth = Buffer.from(`${key}:`).toString('base64');
  const res = await fetch(`${XENDIT_INVOICE_URL}/${encodeURIComponent(invoiceId)}`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const e = new Error(`xendit_get_invoice_failed: ${res.status} ${data?.message || ''}`);
    e.code = 'get_failed';
    throw e;
  }
  return {
    id: data.id,
    externalId: data.external_id,
    status: String(data.status || '').toUpperCase(),
    amount: data.amount,
  };
}

// Xendit invoice statuses that mean "money received".
export const PAID_STATUSES = ['PAID', 'SETTLED'];
