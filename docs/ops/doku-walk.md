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

## Part 2 — The sandbox probe, 2026-09-21 (Code), with real keys

Reyner put the sandbox pair in `.env.local`. `npm run probe:doku` ran. **The headline
is a blocker, and it is an account setting, not code.**

### 2.0 QRIS IS INACTIVE ON THE SANDBOX ACCOUNT

All four probe calls returned the same thing:

```
$ npm run probe:doku
── 2.1 + 2.3  QRIS, no customer block
status      400
body        {"message":["PAYMENT CHANNEL IS INACTIVE"]}
```

**No QRIS payment can be made on this account**, so §5's walk cannot happen and §4's
captured QRIS notification does not exist. Amendment B.5 says to stop and report rather
than switch products, and that is what this is. **The product is still QRIS**;
`PAYMENT_METHOD_TYPES = ['QRIS']` is unchanged in `lib/doku/client.js`.

### 2.0a What that failure PROVES, which is a great deal

A follow-up run answered the question the probe could not: does a business-level error
mean the signature passed?

| probe | answer |
|---|---|
| same request, **wrong secret** | `{"error":{"code":"invalid_signature","message":"Invalid Header Signature"}}` |
| same request, **right secret** | `{"message":["PAYMENT CHANNEL IS INACTIVE"]}` |

**DOKU verifies the signature before it looks at the body.** So `PAYMENT CHANNEL IS
INACTIVE` is proof that `signComponents` produced a signature DOKU accepted. The signing
rule is confirmed against the real thing, which is what §4 wanted the sandbox for.

And Checkout itself works end to end on this account:

```
── Q3 VIRTUAL_ACCOUNT_BCA
   status 200  {"message":["SUCCESS"],"response":{"order":{"amount":"39000",...},
     "payment":{"token_id":"37d0...","url":"https://staging.doku.com/checkout-link-..."}}}
```

So: account live, credentials right, signing right, Checkout right. **Only the QRIS
channel is switched off.**

### 2.0b Two things that changed the code

1. **There are TWO error envelopes.** Amendment B.4 says `error.message` is a string.
   That is true of the AUTH envelope only. Business answers - success *and* validation
   failure - use a top-level **array** with no `error` key:
   `{"message":["PAYMENT CHANNEL IS INACTIVE"]}`, `{"message":["SUCCESS"],"response":{...}}`.
   `errorMessageOf` reads both.
2. **`order.amount` comes back as the STRING `"39000"`.** `amountMatchesSku` takes a
   number and returns false for a string, so a verified, correct, fully paid
   notification would have settled as `amount_mismatch`. `amountNumber` is the single
   coercion. This is the finding most likely to have reached a real buyer.

Also: `NOT_A_REAL_CHANNEL` returns the **same** `PAYMENT CHANNEL IS INACTIVE`, so DOKU
does not distinguish an unknown enum from a disabled one. The reading "QRIS is a valid
enum that is not enabled here" rests on the docs confirming the enum plus VA working on
the same account, not on this message alone. And omitting `payment_method_types`
entirely returns `500 INTERNAL SERVER ERROR`, so it is required in practice.

### 2.1-2.3 still unanswered, and the probe said so wrongly

`probe:doku` printed a **2.2 verdict of "REJECTED. Keep the suffix"** and that verdict is
worthless: all four calls failed for a reason that has nothing to do with repeated
invoice numbers. **The instrument reported a conclusion where it had learned nothing**,
which is the inverse of the trap this repo usually hits. The suffix stays because the
question is unanswered, not because it was answered - and the deferred register carries
the row.

`customer` required or not (2.3) is likewise unanswered by the probe. The docs say it is
optional for QRIS and `createCheckout` omits it when there is no email.

---

## Part 3 — The sandbox walk (§5)

**NOT DONE. Blocked on two things, one of them Reyner's and one of them DOKU's.**

`/api/doku/notify` is LIVE on the preview as of 2026-09-21 and answers `401` to an
unsigned body, which is what DOKU's Back Office needs before it will accept a
Notification URL:

```
$ curl -X POST https://katon-git-feat-doku-checkout-renge13s-projects.vercel.app/api/doku/notify \
       -H "Content-Type: application/json" -d '{}'
401

$ FORGE_BASE_URL=https://katon-git-feat-doku-checkout-renge13s-projects.vercel.app \
    npm run report:forge -- --live
  LIVE (vs https://katon-git-feat-doku-checkout-...)
    checkmark  a forged DOKU notification with NO headers is rejected
    checkmark  a forged DOKU notification with a WRONG signature is rejected
```

### The two blockers

1. **REYNER:** set the sandbox Back Office Notification URL to
   `https://katon-git-feat-doku-checkout-renge13s-projects.vercel.app/api/doku/notify`.
   It will save now that the path answers.
2. **DOKU:** enable QRIS as a Checkout method on the sandbox account (and, separately,
   on production before any real sale). This is the one Katon cannot do, and the
   2026-09-08 notes say Reyner already asked by email.

### A way to finish the walk WITHOUT QRIS, if Reyner wants it

`VIRTUAL_ACCOUNT_BCA` is active on the same account and returns a real Checkout
session. Paying one in the simulator would deliver a **real, signed, Checkout
notification** to `/api/doku/notify` — which would prove the signature verification,
the `invoice_number` split, the amount coercion and the `paid` flip against DOKU's
actual bytes rather than a composed body.

**This is not switching products.** The product stays QRIS and the code stays QRIS; VA
would be a one-off transport in a sandbox, used to obtain the fixture. What it would
NOT prove is the QRIS-specific part of the notification body (`service.id`,
`channel.id`, and whatever QRIS-only block accompanies them) — the fields the handler
reads are channel-independent, but §4's fixture would have to be labelled for what it
is. **It needs Reyner's yes, because Amendment B.5 says stop and report rather than
improvise around an inactive channel.**

### Still open

| # | question | how it gets answered |
|---|---|---|
| 2.1 | Is QRIS enabled on the account? | **ANSWERED: NO.** `PAYMENT CHANNEL IS INACTIVE`. DOKU has to switch it on. |
| 2.2 | What does a repeated `invoice_number` do? | unanswered — re-run `probe:doku` once QRIS is live. The suffix stays meanwhile. |
| 2.3 | Is `customer` required for QRIS? | unanswered by probe; docs say optional and `createCheckout` omits it without an email |
| 2.4 | The exact QRIS-on-Checkout notification body | the walk, once QRIS is enabled — or a labelled VA capture, if Reyner says yes |

### What a sandbox walk will NOT prove

Production keys, real settlement, real QRIS acquirer behaviour, or the statement text a
buyer's bank shows. Those are §8.3–8.4 and they are Reyner's. **Production is off limits
to this session: no production credential, no production env var, no production Back
Office.**
