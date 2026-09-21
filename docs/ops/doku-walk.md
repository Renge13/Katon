# DOKU walk

Prompt V, §2 and §5. Two parts: the **pre-sandbox probe** below, which needed no
credentials and is complete; and the **sandbox walk** (§5), which is NOT done and is
blocked on a sandbox key pair reaching this machine.

Every claim here carries the command that produced it and its date. A claim without one
is a memory, not a fact.

---

## Part 1 — The pre-sandbox probe, 2026-09-21 (Code)

Run before any route work, per Reyner's instruction. No credential was used and none was
sent: every request below carries either no `Client-Id` or the literal string
`PROBE-NOT-A-KEY`.

### 1.1 Both endpoint paths are real, on sandbox AND production

```
$ curl -sS -X POST https://api-sandbox.doku.com/checkout/v1/payment \
       -H "Content-Type: application/json" -d '{}' -w "\nstatus=%{http_code}\n"
{"error":{"code":"invalid_header_request","message":"Header Client-Id is required","type":"invalid_request_error"}}
status=400

$ curl -sS https://api-sandbox.doku.com/orders/v1/status/probe
{"error":{"code":"invalid_header_request","message":"Header Client-Id is required","type":"invalid_request_error"}}

$ curl -sS -o /dev/null -w "%{http_code}\n" -X POST https://api.doku.com/checkout/v1/payment \
       -H "Content-Type: application/json" -d '{}'
400
```

### 1.2 The header contract, confirmed in the order DOKU checks it

Adding one header at a time, each time reading which one it asks for next:

| headers sent | DOKU answers |
|---|---|
| none | `Header Client-Id is required` |
| `Client-Id` | `Header Request-Id is required` |
| `+ Request-Id` | `Header Request-Timestamp is required` |
| `+ Request-Timestamp` | `Header Signature is required` |
| `+ Signature` (bogus) | `invalid_client_id` — `Invalid Client-Id` |

So the four headers §2 names are exactly the four required, and **Client-Id is validated
before the signature is**. A wrong key never reaches signature verification, which is why
nothing beyond this point is answerable without a real sandbox pair.

### 1.3 `Request-Timestamp` tolerance is ±3600 seconds — ANSWERED

This is one of §2's four open questions, and it is now closed:

```
$ curl ... -H "Request-Timestamp: 2020-01-01T00:00:00Z" ...
{"error":{"code":"request_time_out_of_range",
          "message":"Header Request-Timestamp is not in +- 3600 second of now",
          "type":"invalid_request_error"}}
```

Two consequences, and the second one **changes a decision in the prompt**:

- The window is checked **before** `Client-Id`, so it is enforced on every call we make.
- **§3's note "`Request-Timestamp` window: not enforced in v1 ... Record as a
  deferred-register row" was conditional on exactly this finding.** DOKU rejects stale
  timestamps on the outbound direction, so the client side needs clock discipline: the
  timestamp must be generated at send time, never cached on a module scope and never
  carried across a retry. It says nothing yet about whether we should enforce a window on
  the notifications DOKU sends *us* — that half stays open and stays a deferred row.

Format is strict ISO8601 with `T` and `Z`:

```
Request-Timestamp: not-a-timestamp        -> Invalid format Header Request-Timestamp
Request-Timestamp: 2026-09-21 03:30:00    -> Invalid format Header Request-Timestamp
Request-Timestamp: 2026-09-21T03:10:03Z   -> (passes format, fails on Client-Id)
```

### 1.4 QRIS on Checkout — GO on the API, still open on the ACCOUNT

The prompt's two cited doc URLs both 404. The live paths are different:

```
$ WebFetch https://dashboard.doku.com/docs/docs/technical-references/generate-signature/   -> 404
$ WebFetch https://developers.doku.com/accept-payment/doku-checkout/...                     -> 404
```

The live ones, from `https://developers.doku.com/llms.txt`:

- `https://developers.doku.com/accept-payments/doku-checkout/integration-guide/backend-integration.md`
  (note **accept-payments**, plural)
- `https://developers.doku.com/get-started-with-doku-api/signature-component/non-snap/signature-component-from-request-header.md`
- `https://developers.doku.com/get-started-with-doku-api/notification/http-notification-sample-non-snap.md`

Against those:

- `payment.payment_method_types` **does accept `"QRIS"`** on `/checkout/v1/payment`.
- `customer` is "largely optional unless using specific payment methods (Jenius, Akulaku,
  Indodana, Kredivo)". **QRIS is not among them**, so no customer block is required. To
  be confirmed in the sandbox, but the design need not assume one.
- On duplicates: "Merchants must ensure each `order.invoice_number` is unique to prevent
  duplicate transactions." That is a merchant obligation, not a documented server
  behaviour, so **§3's `.${Date.now().toString(36)}` suffix stays**; the sandbox is still
  the place to learn what DOKU actually does on a repeat.

**What is NOT answered: whether QRIS is enabled as a Checkout method on Reyner's
sandbox and production accounts (§8.2).** That is an account setting, invisible from
outside, and it is the actual go/no-go.

### 1.5 The signature spec matches §2 exactly

Verified against the live signature-component page, which is a second source per
CLAUDE.md rule 4 — the prompt's own table is not one:

```
Client-Id:<value>
Request-Id:<value>
Request-Timestamp:<value>
Request-Target:<path>
Digest:<base64(sha256(raw JSON body))>
```

"joined with `\n` ... with no trailing newline"; Digest "only applied for POST Method";
final header is `HMACSHA256=` prepended to the base64 HMAC-SHA256. §2 is correct on all
five points.

**It is NOT a usable test fixture.** The page prints component lines and a signature but
never the secret key, so the pair cannot be checked. §4 anticipated this ("If it shows
only the output ... the fixture is a captured sandbox request") and that branch is the
one that applies.

### 1.6 Two divergences from the prompt, both small and both real

1. **`message` is a STRING, not an array.** §2's `createCheckout` says the
   `checkout_failed` message "carries DOKU's `message` array". Every error above returns
   `{"error":{"code","message","type"}}` with `message` a plain string. The error shape
   for a *validated* request may still differ; the handler should cope with both rather
   than index into one.
2. **Base64 padding is inconsistent between DOKU's own samples.** The request-signing
   example ends `...GVgv5s=` (44 chars, padded); the notification sample's header is
   `HMACSHA256=vl9DBTX5KhEiXmnpOD0TSm8PYQknuHPdyHSTSc3W6Ps` (43 chars, **unpadded**).
   A verifier that compares the two strings byte for byte fails if DOKU strips padding on
   notifications. `verifyNotification` should compare decoded bytes, or normalise padding
   before comparing — and the captured sandbox notification settles which form is real.
   This is the kind of thing that passes every local test and fails on the first real
   payment, so it is written down before the code is.

### 1.7 A QRIS notification sample exists, and it is the WRONG ONE

The non-SNAP notification page carries a QRIS body. It is not usable as the Checkout
fixture, because the body declares its own origin:

```json
"additional_info": { "origin": { "product": "QRIS", "system": "snap-adapter", "apiFormat": "SNAP" } }
```

That is the SNAP adapter's QRIS, not Checkout's. §2's "MUST COME FROM THE SANDBOX" stands
unchanged. Two things in it are worth carrying forward as expectations to check against
the real capture:

- `order.amount` is `20000.00` — a **decimal**, not an integer. JSON parses it to the
  number `20000`, so an `===` against `priceFor(sku)` still holds, but the
  `amountMatchesSku` path should be exercised with a decimal body in the test rather than
  assumed.
- `transaction.status` is `SUCCESS`; the page groups QRIS with the methods whose statuses
  are `SUCCESS | FAILED`, which matches `PAID_STATUSES = ['SUCCESS']`.

---

## Part 2 — The sandbox walk (§5)

**NOT DONE. Blocked.**

`scripts/doku-probe.mjs` is written and answers §2's three remaining questions in one run.
It needs `DOKU_CLIENT_ID` and `DOKU_SECRET_KEY` (the **sandbox** pair) in `.env.local` on
the machine running it. The four variables Reyner set live in Vercel **Preview** scope,
which this machine cannot read, and there is no Vercel CLI or token here — see the
2026-09-21 note in the memory index.

Two ways forward, Reyner's call:

1. Put the sandbox Client-Id and Secret Key in `.env.local` locally, and
   `npm run probe:doku` answers 2.1–2.3 below without deploying anything.
2. Or wait for §5's preview walk, where the adapter itself is the instrument — but that
   means building `lib/doku/client.js` against a signature rule nothing has confirmed,
   which is the order §2 exists to prevent.

### Still open

| # | question | how it gets answered |
|---|---|---|
| 2.1 | Is QRIS enabled as a Checkout method on the sandbox account? | `probe:doku` — a real `createCheckout` either returns a `payment.url` or names the method as unavailable |
| 2.2 | What does a repeated `invoice_number` do? | `probe:doku` sends the same one twice |
| 2.3 | Is `customer` required for QRIS? | `probe:doku` sends one request without a customer block |
| 2.4 | The exact QRIS-on-Checkout notification body | §5 walk only: pay in `sandbox.doku.com/integration/simulator/` and capture from the function log |

### What a sandbox walk will NOT prove

Production keys, real settlement, real QRIS acquirer behaviour, or the statement text a
buyer's bank shows. Those are §8.3–8.4 and they are Reyner's. **Production is off limits
to this session: no production credential, no production env var, no production Back
Office.**
