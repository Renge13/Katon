<!--
STATUS: RELEASED by Reyner 2026-09-21 ("please start"). Written by Cowork 2026-09-21 against the LIVE
device tree (HEAD was `fix/pdf-font-not-in-lambda`, i.e. #123's branch; none of the payment files below
differ from main - V-0 is merged at `ca3358f`). BRANCH FROM MAIN after #123 lands.
THIS FILE IS NOT DURABLE UNTIL CODE COMMITS IT. Commit 0 is this prompt, alone.
Order: THIS (V) -> `?dari` -> real-money walk on DOKU production -> promotion to own network -> U (Render).
A RULING RECORDED IN THE REPO BEATS THIS FILE, ALWAYS. Rulings this executes: PROVIDER = DOKU Checkout
(project `KATON-doku-integration-notes-2026-09-08.md`; DOKU account VERIFIED 2026-09-08, PT Katon Digital
Nusantara); rule 18 (paid flips only in the verified provider notification, `settlePair` /
`markReadingPaid`, the single door); `paymentFence.js` header ("`doku` arrives in Prompt V and is ADDED to
this set, not swapped for anything"); pay route ("DOKU SLOTS IN ABOVE THIS LINE, not in place of it").
-->

# Prompt V — the DOKU Checkout adapter. `PAYMENTS_PROVIDER` becomes `doku | mock | closed`.

## What this is, in one paragraph
Sales have been closed since 2026-09-08. This prompt reopens them behind DOKU Checkout (the hosted
payment page, QRIS): the server creates a checkout session and gets a URL; the buyer pays on DOKU's page;
DOKU POSTs a SIGNED notification to `/api/doku/notify`; the route verifies the HMAC signature and settles
through the same door the mock walk uses. Adapter only. **No product change, no copy change in the paid
flow, no reader-visible change except that the buy button works again.** The six reader-visible strings
that name Xendit are handled in §8 by Reyner's ruling, not by this prompt's judgement.

## Four checks, cited (Cowork, 2026-09-21)
1. Every repo path and symbol below was read from the live tree on 2026-09-21: `lib/paymentFence.js`
   (`PROVIDERS = new Set(['mock', 'closed'])`, `paymentsProvider`, `paymentFenceReason`,
   `mockPaymentsAllowed`), `app/api/pay/[id]/route.js` (`INVOICE_DESCRIPTION` held with an eslint
   exemption; the mock branch; the defensive `return notConfigured('payment_closed')` floor),
   `lib/pair/settle.js#settlePair(pairId, pairRow, statusPaid, settledAmount)`,
   `lib/readingStore.js#markReadingPaid / setInvoice({invoiceId, waNumber, sku})`,
   `lib/pairStore.js#setPairInvoice({invoiceId, invoiceUrl, sku, email})`, `lib/pricing.js#priceFor /
   amountMatchesSku / SELLABLE_SKUS`, `lib/site/baseUrl.js#pairUrl / readingUrl`, `lib/http.js`
   (`json, badRequest, unauthorized, notFound, notConfigured`), `lib/analytics/events.js`
   (`checkout_started`, `purchase_confirmed`), `scripts/forge-tests.mjs` (fence cases at 68-94; the
   deleted forgery checks' note at 289), `tests/payments-provider.spec.mjs` (12 tests), `next.config.mjs`
   (`outputFileTracingIncludes`), `.env.example`, `lib/site/copy.js` Xendit strings at 233, 310, 405,
   445, 526, 629. ids are `nanoid(21)` (`lib/pair/handlers.js:142`, `lib/mirror/handlers.js:150`); the
   nanoid alphabet has no `.`, which §3 relies on.
   **DOKU facts are from DOKU's published docs read 2026-09-21** (URLs in §2) and are a STARTING POINT,
   NOT A SOURCE: CLAUDE.md rule 4's "tables handed to you in a prompt" applies to an API spec exactly as to
   a BaZi table. **The sandbox accepting your signature is the second source. Nothing in §2 is trusted
   until the sandbox has agreed with it, and where the docs and the sandbox disagree, STOP and report.**
2. Red first, four instruments, each falsified on its own: tampered body -> signature rejected; wrong
   secret -> rejected; wrong `Request-Target` -> rejected; amount not equal to the stored sku's price ->
   `amount_mismatch`, no flip. The fixture for the first three is a REAL sandbox notification captured
   in §5, not a hand-typed one - a fixture Cowork or Code composes proves the code agrees with itself.
3. No new gate on the product. Two structural fences, both mirrors of ones that exist: `doku` REFUSES
   without both keys (as the fence used to for the old adapter), and sandbox mode is REFUSED in
   production (exactly as `mock` is). The notify route does not re-fetch status on the hot path (§3,
   "why no check-status call") - that is a cause-removal, not a check.
4. Customer: this is the whole point. Without it there is no Katon revenue. What it delays: nothing
   else; it IS the critical path. Two rounds, then ship or park.

## 1. Env and fence

New variables (server-only, never `NEXT_PUBLIC_`):
```
PAYMENTS_PROVIDER=doku
DOKU_CLIENT_ID=            # Back Office -> Integrations -> API keys (Reyner supplies)
DOKU_SECRET_KEY=           # same place. HMAC key for signing AND for verifying notifications
DOKU_SANDBOX=1             # PRESENT = api-sandbox.doku.com. ABSENT = api.doku.com. REFUSED in production.
```
`lib/paymentFence.js`:
- `PROVIDERS = new Set(['doku', 'mock', 'closed'])`; the JSDoc union gains `'doku'`.
- `paymentsProvider()`: after the mock guard, add the symmetrical one: `if (value === 'doku' &&
  process.env.DOKU_SANDBOX && process.env.VERCEL_ENV === 'production') return 'closed'`. A sandbox
  key in production is not "take money", it is "pretend to". Same shape, same reason, same test.
- `paymentFenceReason()`: `closed` -> `'payment_closed'`; `mock` -> `null`; `doku` -> `null` when
  `DOKU_CLIENT_ID` and `DOKU_SECRET_KEY` are both set, else `'doku_client_id_unset'` /
  `'doku_secret_key_unset'`. The pay route's second reason line comes back WITH this answer, as its own
  comment says: `if (fence) return notConfigured(\`payment_not_configured:${fence}\`)` after the
  `payment_closed` line.
- Add `export function dokuConfigured()` returning the boolean the notify route needs; keep it in this
  file so "what does production require" has one home. Rewrite the header comment's two-value table to
  three; keep the "WHY 'closed' IS THE DEFAULT" paragraph word for word.

## 2. `lib/doku/client.js` — SERVER ONLY (`import 'server-only'`), no React, no Next

### The published facts (read 2026-09-21; VERIFY EACH IN THE SANDBOX BEFORE RELYING ON IT)
- Create checkout: `POST {base}/checkout/v1/payment`; sandbox base `https://api-sandbox.doku.com`,
  production `https://api.doku.com`. (developers.doku.com, doku-checkout/integration-guide/backend-integration)
- Headers on every call: `Client-Id`, `Request-Id` (unique, max 128), `Request-Timestamp` (UTC ISO8601
  with `Z`, e.g. `2020-08-11T08:45:42Z`), `Signature`.
- Signature component, one per line joined by `\n`, NO trailing newline:
  ```
  Client-Id:<value>
  Request-Id:<value>
  Request-Timestamp:<value>
  Request-Target:<path, e.g. /checkout/v1/payment>
  Digest:<base64(sha256(raw JSON body))>
  ```
  `Signature: HMACSHA256=` + base64(HMAC-SHA256(secretKey, component)). GET requests omit the Digest
  line entirely. (dashboard.doku.com/docs/docs/technical-references/generate-signature/)
- Body: `order.amount` (integer IDR, no decimals, max 12 digits), `order.invoice_number` (max 64),
  `order.callback_url`, `order.callback_url_result`, `order.auto_redirect` (bool), `order.language`,
  `payment.payment_due_date` (minutes, default 60), `payment.payment_method_types: ["QRIS"]`,
  `customer.{id,name,email,phone}` optional, `order.line_items[]` optional for QRIS.
- Response: `response.payment.url` (the hosted page), `response.payment.token_id`,
  `response.payment.expired_date` (yyyyMMddHHmmss, UTC+7), `response.order.session_id`.
- Notification: DOKU POSTs JSON to the merchant's Notification URL with the SAME four headers;
  `Request-Target` is the PATH of the notification URL (`/api/doku/notify`); the Digest is over the raw
  body DOKU sent. Body carries `order.invoice_number`, `order.amount`, `transaction.status`
  (`SUCCESS` | `FAILED`; check-status also knows `PENDING`, `EXPIRED`), `transaction.date`,
  `channel.id`, `service.id`, `acquirer.id`. Merchant answers 2xx; otherwise DOKU retries 9 times
  over 7 days. (dashboard.doku.com/docs/docs/http-notification/)
- Check status: `GET {base}/orders/v1/status/{invoice_number}`, same headers, no Digest.
- Sandbox simulator: `https://sandbox.doku.com/integration/simulator/`.
- **NOT FOUND IN THE DOCS AND MUST COME FROM THE SANDBOX:** the exact notification body for a QRIS
  payment made through Checkout (the docs' samples are VA, card, e-money); whether a repeated
  `invoice_number` is rejected, ignored, or returns the existing session; whether `customer` is
  required for QRIS; the Request-Timestamp tolerance window. Record each answer in
  `docs/ops/doku-walk.md` with the date and the sandbox response that showed it.

### Exports
- `signComponents({clientId, requestId, timestamp, target, digest|null}, secret)` -> the
  `HMACSHA256=...` string. PURE (no env, no network) so it is unit-testable and so the notify route
  and the client share one implementation - two copies of a signing rule is the exact bug this
  project keeps recording.
- `digestOf(rawBody: string)` -> base64 sha256. Over the RAW string, never over `JSON.stringify(parsed)`:
  re-serialising reorders nothing in theory and everything in practice.
- `createCheckout({ invoiceNumber, amount, callbackUrl, callbackUrlResult, email, lineItemName })`
  -> `{ paymentUrl, tokenId, expiredDate, raw }`. Throws `err.code = 'not_configured'` when either
  key is missing, `'checkout_failed'` on non-2xx (message carries DOKU's `message` array, never the
  keys). `Request-Id` = `crypto.randomUUID()`. `payment_method_types: ['QRIS']`,
  `payment_due_date` left at DOKU's default unless the sandbox forces a value.
- `verifyNotification({ headers, rawBody, target })` -> `{ ok, reason }` with reasons
  `not_configured | missing_header | bad_signature`. Constant-time compare via the same SHA-256-then-
  `timingSafeEqual` trick the old adapter used (both sides hashed so lengths match). `target` is passed
  in by the route as the literal `'/api/doku/notify'` - NEVER derived from the incoming request URL,
  because a proxy or a preview alias can rewrite that and a verifier that trusts the request to tell it
  what to verify against is not a verifier.
- `checkStatus(invoiceNumber)` -> `{ status, amount, invoiceNumber, raw }`. Used by the ops script
  only (§6). Not called by any route.
- `PAID_STATUSES = ['SUCCESS']`.

## 3. Routes

### `POST /api/pay/[id]` — the `doku` branch, ABOVE the defensive floor
After the mock branch, `if (paymentsProvider() === 'doku') { ... }`:
- `invoiceNumber = \`${id}.${Date.now().toString(36)}\``. **Why a suffix:** DOKU's `invoice_number`
  is the merchant's unique key and a buyer who abandons a session and clicks Buy again creates a second
  one for the same pair. The nanoid alphabet contains no `.`, so the settle side recovers the row id
  with `invoiceNumber.split('.')[0]` and nothing else. **If the sandbox shows DOKU tolerates a repeated
  invoice_number by returning the existing session, DROP the suffix and use the bare id** - simpler is
  better and the note in `doku-walk.md` records which way it went. Either way `setPairInvoice` /
  `setInvoice` store the FULL invoice number in `invoice_id`.
- `amount = priceFor(sku)` - the route re-imports `priceFor`, which V-0 removed because nothing called
  it. The rule in the route's own header ("the client may name a SKU, never a price") is unchanged.
- `callbackUrl` / `callbackUrlResult`: `pairUrl(id, '?bayar=selesai')` for compat, `readingUrl(id,
  '?bayar=selesai')` otherwise - ABSOLUTE, from `baseUrl()`, because DOKU redirects a browser from its
  own domain (the mock branch's comment explains why mock is the exception). `?bayar=selesai` stays a
  UI hint and never an entitlement (`components/PasanganReport.jsx:11`, `components/Funnel.jsx:1720`).
- `email`: compat's checked email into `customer.email`; artifact sends no customer block unless the
  sandbox requires one.
- `lineItemName = INVOICE_DESCRIPTION[sku]` — the held constant finally has its reader. Remove the
  eslint exemption and the "IT IS UNREFERENCED TODAY" paragraph; keep the rest of the block, it is the
  ruling history. NOTE for Reyner in §8: on QRIS the bank/e-wallet statement shows the MERCHANT NAME
  (the PT), not this string; this string is what the buyer sees on DOKU's page. The 2026-08-22 approval
  was of a statement line; if that changes what he wants to say, it is his call, not this prompt's.
- Store, `recordEvent(id, 'checkout_started', { sku, provider: 'doku' })` AFTER the session exists
  (the V-0 route's own rule), return `json({ ok: true, pending: true, invoiceUrl: paymentUrl })`. The
  client (`components/Pasangan.jsx:176`, `components/Funnel.jsx:1254`) already opens `invoiceUrl` in a
  new tab; nothing client-side changes.
- The `catch`: `not_configured` -> `notConfigured('payment_not_configured:doku')`; anything else ->
  `json({ error: 'invoice_failed' }, 502)` as today. No dev fallback returns - V-0 deleted that class.

### `POST /api/doku/notify` — the ONLY place `paid` flips for a real payment (rule 18)
Thin route, logic in `lib/doku/notify.js` so `node --test` can reach it (the repo's stated reason every
handler lives in `lib/`). Order of operations, and the order IS the security:
1. `if (!dokuConfigured()) return notConfigured('doku_not_configured')` — no keys, no verification
   possible, refuse before reading anything.
2. `rawBody = await request.text()`. The digest is over these bytes. Parse AFTER verifying.
3. `verifyNotification({ headers: request.headers, rawBody, target: '/api/doku/notify' })`; `!ok` ->
   `unauthorized('invalid signature')` (401). Log the reason, never the body.
4. Parse. `invoiceNumber = body.order.invoice_number`, `amount = body.order.amount`, `statusPaid =
   PAID_STATUSES.includes(body.transaction.status)`. Missing `invoice_number` -> `badRequest`.
5. `rowId = invoiceNumber.split('.')[0]`. Pair FIRST (`getPair`), then reading, same order and same
   reason as the old webhook ("a pair hit is unambiguous"). Unknown id -> `json({ received: true })`
   so DOKU stops retrying.
6. Pair: `await settlePair(rowId, pairRow, statusPaid, amount)`. `settlePair` already does the
   per-sku amount check (`amountMatchesSku`), the idempotent flip and the warm render; NOTHING is added
   to it. Reading: the amount check inline exactly as the old webhook did (`amountMatchesSku(amount,
   row.sku)`, fail-closed on null sku), then `markReadingPaid`; `recordEvent(rowId,
   'purchase_confirmed', { sku })` on `paidConfirmed` only - the counter flips where `paid` flips and
   nowhere else. The WhatsApp claim/release machinery from the old webhook is NOT rebuilt (Katon has no
   sender; the old route's own comment called it a guard on a send that does not exist).
7. Return `json({ received: true })` (200) for every verified notification, including `FAILED` and
   `amount_mismatch` - those are logged, not retried. Only a signature failure or a server error is
   non-2xx.

**Why no check-status call on the hot path.** The old webhook re-fetched the invoice because Xendit's
callback carried only a shared token, so the body could not be trusted. DOKU's notification is HMAC'd
with the secret key over the exact body: a body that verifies IS DOKU's record. Re-fetching would add a
network call inside a handler DOKU retries on failure, for a guarantee the signature already gives.
Check-status exists for the ops script, where a human wants to look.

**`Request-Timestamp` window:** not enforced in v1. A replayed SUCCESS is idempotent (`markPairPaid`
false->true only) and a replayed FAILED settles nothing. Record as a deferred-register row with what
would close it, if the sandbox shows DOKU itself rejects stale timestamps (then the client side needs
clock discipline, which is a different note).

## 4. Tests, red first — `tests/doku.spec.mjs` + edits
- `SIGNATURE MATCHES DOKU'S OWN WORKED EXAMPLE`: if the generate-signature doc page shows a complete
  input set with its resulting `HMACSHA256=...`, that is the fixture. If it shows only the output (the
  page Cowork read did), the fixture is a captured sandbox request/notification (§5) and this test's
  header says so. **No fixture that Code or Cowork composed from the rule** - that only proves the code
  agrees with itself.
- `A TAMPERED BODY IS REJECTED` (flip one byte of the captured raw body; same headers) ->
  `bad_signature`. `A WRONG SECRET IS REJECTED`. `A WRONG REQUEST-TARGET IS REJECTED` (verify with
  `/api/webhook/xendit` as the target - the old path, deliberately, so a copy-paste of the old route
  name can never verify). Each shown red by breaking only its own proposition; the runs go in the
  commit message.
- `AMOUNT IS VERIFIED AGAINST THE STORED SKU, NOT THE BODY'S CLAIM`: a verified SUCCESS for 19000 on a
  `compat` pair does not flip. This is `settlePair`'s existing rule exercised through the new door.
- `THE NOTIFY ROUTE READS RAW BYTES` — source assertion: `lib/doku/notify.js` calls `request.text()`
  and no `request.json()` appears before `verifyNotification`.
- `tests/payments-provider.spec.mjs`: add `DOKU WITHOUT KEYS REFUSES`, `DOKU SANDBOX IS REFUSED IN
  PRODUCTION` (mirror of the mock test at line 48), and extend `withEnv`'s KEYS with the three DOKU
  vars. The V-0 tests `NO XENDIT IN THE PAYMENT PATH` and `THE ADAPTER AND ITS WEBHOOK ARE GONE` stay
  and stay green.
- `scripts/forge-tests.mjs`: restore the two `--live` forgery checks the 2026-09-18 note deleted,
  pointed at `/api/doku/notify`: no headers -> 401; a syntactically valid body with a wrong signature ->
  401. **Assert 401 exactly**, per that note's own lesson ("a check that green-lights a missing route is
  not a check"). Add a fence case: `PAYMENTS_PROVIDER=doku` with no keys -> `doku_client_id_unset`.
- `package.json`: `test:doku` script, and add it to `scripts/test-all.mjs` / `scripts/gate-plan.mjs` the way the other suites are registered (read `gate-plan.mjs` first; `tests/ci-parity.spec.mjs` asserts CI runs nothing `npm test` does not, so whatever CI runs must be in the local plan).

## 5. Sandbox walk on Preview (Code does this; Reyner supplies the values in §8)
1. Reyner puts `DOKU_CLIENT_ID`, `DOKU_SECRET_KEY` (SANDBOX pair), `DOKU_SANDBOX=1` and
   `PAYMENTS_PROVIDER=doku` in Vercel PREVIEW scope (replacing `mock` there for the duration), and sets
   the Notification URL in the DOKU SANDBOX Back Office to
   `https://<this PR's preview alias>/api/doku/notify`.
2. Code walks `/kompatibilitas` on the preview: checkout session created (log the DOKU response minus
   keys), pay in `sandbox.doku.com/integration/simulator/`, notification arrives, pair flips, report
   renders. Capture the RAW notification (headers + body) from the function log into
   `tests/fixtures/doku-notification.sandbox.json` - that is the fixture §4 needs, and the commit that
   adds it is the one that makes the signature tests real. Redact nothing but the `Client-Id` value.
3. Also walk the `artifact` sku from `/r/<token>` once.
4. Write `docs/ops/doku-walk.md`: the values, the steps, the four sandbox answers §2 asked for, and
   what a walk does NOT prove (production keys, real settlement, statement text).
5. Then Reyner restores Preview to `mock` (so the free walk keeps working) - or leaves sandbox; his
   call, note it.

## 6. Ops
- `scripts/doku-status.mjs <invoice_number>`: signs a GET to check-status and prints
  `transaction.status`, `order.amount`, `order.invoice_number`. For the day a buyer says "I paid" and
  the row says otherwise. Reads env from `.env.local`; refuses with a clear line if keys are absent.
- `docs/ops/paid-flow-walk.md`: the "What a walk does NOT prove" section already says DOKU's walk is
  the alternative; point it at `doku-walk.md`.

## 7. Ledger and docs (Code)
- `.env.example`: the three DOKU vars with the comment shape used for `PAYMENTS_PROVIDER`.
- `CLAUDE.md:33` STACK: "QRIS via DOKU (Prompt V; sales closed until it lands)" -> "QRIS via DOKU
  Checkout". Rule 18 already names the single door; unchanged.
- `next.config.mjs`: nothing - `lib/doku/client.js` reads no files. Say so in the PR rather than leaving it
  to be wondered.
- `docs/PROGRESS.md`: ledger row for this PR with the four red lines and the sandbox walk date. The
  INTERIM REGISTER row "Compatibility. SALES CLOSED 2026-09-08" gets its status appended: "REOPENED
  behind DOKU on <date of production flip>" - **appended by the commit that flips production, not by
  this PR**. The Xendit row is untouched (closes on the account confirmation).
- `docs/NEXT.md`: chain line advances.

## 8. REYNER — what only you can do, in order
**Before Code can walk the sandbox (§5):**
1. DOKU SANDBOX Back Office (separate login from production): Client-Id and Secret Key. Put both in
   Vercel PREVIEW scope as `DOKU_CLIENT_ID` / `DOKU_SECRET_KEY`, plus `DOKU_SANDBOX=1`, and set
   `PAYMENTS_PROVIDER=doku` in Preview. Tell Code when done; Code gives you the preview alias for the
   Notification URL field.
2. Confirm QRIS is enabled as a Checkout method on the sandbox AND production account (the 2026-09-08
   notes say you asked DOKU by email; the answer decides whether the walk can happen).

**Before production (after Code's sandbox walk is green and the PR is merged):**
3. PRODUCTION Client-Id / Secret Key into Vercel PRODUCTION scope; `PAYMENTS_PROVIDER=doku` in
   Production; **NO `DOKU_SANDBOX`** there (it would read as closed anyway - that is the fence - but
   do not set it). Notification URL in the production Back Office: `https://katon.app/api/doku/notify`.
4. Redeploy production. Walk one real Rp 39.000 compat purchase yourself. That is the acceptance;
   Code reads `served_from`, the notify log line and the `purchase_confirmed` event, and writes the
   INTERIM REGISTER "REOPENED" status with that date.

**Rulings, both flagged and none auto-decided:**
5. **`auto_redirect`.** DOKU's page can bounce the buyer straight back to `/kompatibilitas/<id>
   ?bayar=selesai` on success (`order.auto_redirect: true`) or show its own result page with a
   "Back to merchant" button (default). Xendit auto-redirected; the report page already handles the
   `?bayar=selesai` waiting state. Cowork's proposal: `true`, so the buyer's last screen is Katon's,
   which was the reason the redirect URLs were added in the first place. A choice a reader can see is
   yours (rule 9).
6. **Six reader-visible strings in `lib/site/copy.js` name Xendit.** Proposed replacements below,
   swept for rule 20 (keyboard characters only). Rule them in place or amend; Code applies verbatim in
   its own commit (two commits in one PR, per the small-tranche shape in the katon skill §6). Flag from
   Cowork on register: these are near-mechanical substitutions, so the Buku Terjemahan risk is low, but
   line 233's second sentence and line 526 are the two worth your eye.

| line | current | proposed |
|---|---|---|
| 233 (/harga `payment`) | Pembayaran memakai QRIS dan diproses oleh Xendit. Semua harga dalam rupiah, sekali bayar, tanpa langganan. | Pembayaran memakai QRIS dan diproses oleh DOKU. Semua harga dalam rupiah, sekali bayar, tanpa langganan. |
| 310 (footer `operatorAfter`) | ..., badan usaha yang terdaftar di Kota Tangerang Selatan, Banten. Pembayaran diproses lewat QRIS oleh Xendit. Untuk pertanyaan apa pun, ... | ..., badan usaha yang terdaftar di Kota Tangerang Selatan, Banten. Pembayaran diproses lewat QRIS oleh DOKU. Untuk pertanyaan apa pun, ... |
| 405 (privasi, data collected) | Catatan pembayaran dari Xendit: nomor invoice, jumlah, dan status. Kami tidak pernah menerima atau menyimpan nomor kartu maupun data akun bankmu. | Catatan pembayaran dari DOKU: nomor invoice, jumlah, dan status. Kami tidak pernah menerima atau menyimpan nomor kartu maupun data akun bankmu. |
| 445 (privasi, processors) | Xendit, untuk pembayaran QRIS. Data pembayaranmu diproses di sistem mereka, bukan di sistem kami. | DOKU, untuk pembayaran QRIS. Data pembayaranmu diproses di sistem mereka, bukan di sistem kami. |
| 526 (syarat, paid) | Pesananmu berlaku setelah pembayaran dikonfirmasi oleh Xendit. Sebelum konfirmasi itu masuk, belum ada pesanan yang berjalan. | Pesananmu berlaku setelah pembayaran dikonfirmasi oleh DOKU. Sebelum konfirmasi itu masuk, belum ada pesanan yang berjalan. |
| 629 (contact, how) | Bukti pembayaran atau nomor invoice dari Xendit. | Bukti pembayaran atau nomor invoice dari DOKU. |

   Also for your awareness, not a ruling: past buyers' payment records really were processed by
   Xendit. Whether the privacy page should say "DOKU (sebelumnya Xendit)" for a while is a judgement
   about your readers; Cowork's view is no - there was one such buyer and it was you.

7. **`INVOICE_DESCRIPTION` on QRIS.** See §3: on QRIS the statement line is the PT's name; the ruled
   strings appear on DOKU's checkout page as the line item. No change proposed; you are told because the
   2026-08-22 approval was framed as a statement line.

## Acceptance
- `node --test` green incl. `tests/doku.spec.mjs` with a CAPTURED fixture; the four red runs in commit
  messages; `npm run report:forge -- --live` shows both 401s against a running dev server with
  `PAYMENTS_PROVIDER=doku` and dummy keys.
- Sandbox walk on Preview: checkout -> simulator -> notification -> `paid` -> report, for `compat` and
  `artifact`, dated in `docs/ops/doku-walk.md`.
- `grep -rn -i xendit lib app components tests scripts --include=*.js --include=*.jsx --include=*.mjs`
  returns only dated history comments and the two V-0 tests that assert absence (after §8.6 lands,
  `lib/site/copy.js` drops out of the list).
- Production flip and the Rp 39.000 walk are Reyner's and are NOT this PR's acceptance.

## What this prompt does not do
`?dari` prefill (next). Render migration (U, held). Any prose or design change (Z2, design pass). The
Xendit account (Reyner; PROGRESS row). Two rounds, then ship or park.
