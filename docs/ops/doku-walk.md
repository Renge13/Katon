# DOKU walk

Prompt V, §2 and §5. Two parts: the **pre-sandbox probe** below, which needed no
credentials and is complete; and the **sandbox walk** (§5), which is NOT done and is
blocked on a sandbox key pair reaching this machine.

Every claim here carries the command that produced it and its date. A claim without one
is a memory, not a fact.

---

## THE PRODUCTION-FLIP GATE (a-h). Updated 2026-09-23 on Reyner's ruling

**Sales reopen only when every item is true, and then Reyner's Rp 39.000 walk is acceptance.**
Items a-d are the four-item gate as ruled in the launch cut (`docs/handoff/launch-cut-2026-09-21.md`
§3 item 1). Until this date they were written only there and in the Claude project; this file did
not carry them, so this section ADDS the gate here rather than amending an existing one. e-h were
added 2026-09-23 (PAY-SAFETY-ALL-PURCHASES and REPO-IS-SOURCE, launch cut §0b).

| | gate | status 2026-09-23 | proof |
|---|---|---|---|
| a | QRIS active for production | OPEN (DOKU ticket 1149053) | DOKU Back Office |
| b | one delivered notification captured | OPEN - DOKU has delivered none, on any walk (§ WALK 2 and 3 below) | the `DOKU_CAPTURE` log line |
| c | production keys, `PAYMENTS_PROVIDER=doku`, no `DOKU_SANDBOX` | OPEN - production has no `PAYMENTS_PROVIDER` and no DOKU vars | Vercel env (Reyner) |
| d | notify URL set on the production QRIS channel | OPEN | production Back Office (Reyner) |
| e | #129 merged (pair reconcile on load) | **DONE**, `91a21e8` | `gh pr view 129` |
| f | mirror reconcile merged and verified: one on-load call, never from the poll; one DOKU check-status settling through `settleReading` only on SUCCESS for its own invoice at the right amount; no call when closed or mocked; red-first both ways; fence guard broken on purpose; one REAL sandbox check-status through the reconcile path | **DONE**, `186b827` (#131) | `npm run probe:reconcile` (2026-09-23: `status=SUCCESS`, `amount_mismatch` on the wrong sku, `paid=true` on the right one) |
| g | `pending_body` replacement merged | **DONE**, `769337a` in #129 | `tests/pasangan-copy.spec.mjs` |
| h | item 4 and PAY-SAFETY-ALL-PURCHASES on main | **DONE**, `186b827` (#131: launch cut §3 item 4 and §0b) | `grep -n "PAY-SAFETY-ALL-PURCHASES" docs/handoff/launch-cut-2026-09-21.md` |

Then: **Reyner's two production purchases: Rp 19.000 mirror AND Rp 39.000 compat (ruled 2026-09-24).**

### DOKU notes

- 09-24: QRIS reset applied on sandbox; the QRIS Credential Settings tab is an INPUT form for credentials issued by DOKU Ops (Client ID, Shared Key, Client Secret, MPAN, NMID), blank after the reset.
- **2026-09-24, sandbox BRN-0285-1789959005561 (Reyner, read in the Back Office):**
  - **QRIS Notify URL is EMPTY**, and every save there has always failed with an error toast. The
    2026-09-21 line "The URL had been saved on the QRIS channel" (§ WHY NOTHING WAS DELIVERED) is struck
    in place and marked CORRECTED - it was a secondhand account of a save, recorded as fact (COWORK-BRIEF §4).
  - **The VA BCA Payment Notification URL IS saved**: `…feat-doku-checkout…/api/doku/notify`, API 1.1,
    Aggregator. So walk 2's premise (a URL registered on the channel that took the payment) holds.
  - **A SNAP banner is shown** in the Back Office. Open question to DOKU.
  - **Sandbox QRIS Disable was applied twice and still shows Active.** Production QR Payment is NOT
    activated and was left untouched.

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

### THE VA WALK, 2026-09-21 — done, and it did NOT produce the fixture

Approved by Reyner as **sandbox transport only; the product stays QRIS**. `lib/doku/client.js`
is untouched and its `PAYMENT_METHOD_TYPES` is still `['QRIS']`. The VA session was
built by a one-off script kept OUT of the repo on purpose — a VA-creating script in
`scripts/` would eventually be read as the product — and it mirrored `createCheckout`'s
body exactly except `payment_method_types`.

**What happened, in order:**

1. `POST /api/pair` on the preview -> `JoWcjAT0Rc3DlLQlj3JiT` (`sku: compat`, `paid: false`).
2. Checkout session for `JoWcjAT0Rc3DlLQlj3JiT.muarh2o9`, amount 39000,
   `VIRTUAL_ACCOUNT_BCA` -> **200**, VA number `1900800000347861`, and
   `additional_info.origin` = `{"product":"CHECKOUT","api_format":"JOKUL"}` — a genuine
   Checkout record, not the SNAP adapter the docs' sample came from.
3. Paid in `sandbox.doku.com/integration/simulator/` (BCA VA) -> **Payment Success,
   IDR 39000.00**. Note the decimal.
4. `npm run doku:status -- JoWcjAT0Rc3DlLQlj3JiT.muarh2o9` ->
   `transaction.status: SUCCESS`. **DOKU has the money.**
5. **The pair did NOT flip.** Polled for two minutes: `{"status":"not_paid"}`.

**Step 5 has two possible causes with opposite fixes**, so they were separated rather
than guessed at: either DOKU never delivered the notification, or it delivered one this
route rejected. A notification signed with the real sandbox secret and POSTed at
`/api/doku/notify` by hand returned **200 `{"received":true}`** and the pair flipped to
`paid`, serving its full compat facts.

So the route, the signature verification, the `invoice_number` split, the amount
coercion (that hand-signed body carried `"39000.00"`, a decimal STRING) and the settle
path are all **proven on a real Vercel lambda**. What is missing is DOKU's delivery.

**THE PAIR STAYING `not_paid` UNTIL A VERIFIED NOTIFICATION ARRIVED IS RULE 18 WORKING.**
A real payment completed at DOKU and nothing in Katon flipped: there is no second path
to `paid`, and the walk demonstrates that rather than asserting it.

**NO FIXTURE WAS CAPTURED, because nothing was delivered to capture.** §4 and Amendment
B.6 want a captured Checkout notification; a body this session composed is exactly what
they rule out, and the hand-signed one above is a diagnostic, not a fixture.

What WAS captured is real DOKU bytes of a different kind:
`tests/fixtures/doku-checkstatus.sandbox.json`, the check-status record for this
transaction. **It is labelled VA and it is not the notification fixture.** It earns its
place by pinning a measured surprise: `order.amount` is the NUMBER `39000` there and the
STRING `"39000"` in the create-checkout response **for the same order**. DOKU is
inconsistent across its own endpoints, which is why `amountNumber` exists.

**One defect this session shipped and the walk found:** `npm run doku:status` ran plain
node against a `server-only` module and died on its first invocation, before a line of
its own code. Fixed with `--conditions=react-server`, and pinned by a test, because no
behavioural test could see a wrong launch line.

### WHY NOTHING WAS DELIVERED — NOTIFICATION URLs ARE PER CHANNEL

Answered by Reyner, 2026-09-21, and it is the kind of thing that is obvious once said
and expensive until then:

> **DOKU registers a Notification URL against each PAYMENT CHANNEL, not against the
> merchant account.** ~~The URL had been saved on the **QRIS** channel — which is
> inactive —~~ **CORRECTED 2026-09-24 (Reyner): the QRIS Notify URL is EMPTY, and
> every save there has always failed with an error toast** - and the walk paid through
> **VA BCA**, whose channel had no URL at all. So DOKU had nowhere to send it and never
> tried.

**THE PRODUCTION CONSEQUENCE, and it is the reason this is written down here rather
than left in a chat message.** "Is the Notification URL registered?" is not a
yes/no question about the account. It is one question **per channel Katon sells
through**, and the answer can be yes for a channel nobody uses while being no for the
one taking money. When QRIS is enabled on production, the URL has to be registered
**on the QRIS channel there**, and checking "the URL is set" in the Back Office without
checking WHICH CHANNEL it is set against will look correct and be wrong.

The failure is also silent by construction: the buyer pays, DOKU records SUCCESS, and
Katon's row simply never flips. Nothing errors. The only symptom is a paid customer
with no product — which is exactly the shape of failure `npm run doku:status` exists
for.

### WALK 2, 2026-09-21 — the URL was registered, and DOKU STILL SENT NOTHING

With the Notification URL saved on the **VA BCA** channel, the walk was repeated:

```
05:26:24Z  pair qvW0XL5L2Zb25p9Xg71Uv created
05:26:33Z  Checkout session qvW0XL5L2Zb25p9Xg71Uv.muasyrm4, VA 1900800000347916
05:27:37Z  paid in the simulator -> Payment Success, IDR 39000.00
05:27:37Z -> 05:32:35Z   polled 14 times -> not_paid throughout
```

`npm run doku:status` again: `transaction.status: SUCCESS`. And a hand-signed
notification marked `capture-probe-053325`, sent at `05:33:25Z` against a deliberately
non-existent row id, returned `200 {"received":true}` without touching the pair.

**Reyner then read the Back Office, and this is the finding that matters:**

> There is **no Checkout-level notification setting** at all, and the **Notification
> Center shows ZERO attempts for both invoices**.

**So DOKU never tried to send anything.** That clears the verifier completely - "DOKU
delivered and the route rejected it" was one of the two live hypotheses after walk 1,
and it is now dead on DOKU's own record rather than on our reasoning. It also means
the per-channel URL finding above, while true, was not the whole cause: registering it
on VA BCA changed nothing.

### THE OVERRIDE, AND WHY IT IS WORTH TRYING BEFORE QRIS IS ENABLED

`additional_info.override_notification_url` is a documented, optional field on
`POST /checkout/v1/payment`:

> "This parameter is intended to override the configured `Notification URL` with
> another URL."
> — developers.doku.com/accept-payments/doku-checkout/integration-guide/backend-integration.md,
>   read 2026-09-21

If DOKU honours it, it is worth more than a workaround for this walk. **It moves the
notification destination out of a Back Office screen and into the request**, which is
exactly the class of silent failure this page has now recorded twice: a URL that is set,
looks set, and is set against the wrong thing. A destination named in the code is one a
test can assert.

Whether it ships is decided by the sandbox, not by the docs, and not before.

### WALK 3, 2026-09-21 — the override is ACCEPTED and changes NOTHING

```
07:33:38Z  marker capture-probe-073338 posted to /api/doku/notify -> 200
07:33:47Z  session JE8fscaWVJjsYLl7FGMRR.muaxiei3, VA 1900800000348046
07:35:02Z  paid in the simulator -> Payment Success, IDR 39000.00
07:35:03Z -> 07:41:32Z   polled 16 times over 6.5 minutes -> not_paid throughout
```

DOKU **echoed the override back in the create response**, so the field was read and
accepted, not ignored as unknown:

```json
"additional_info": {
  "override_notification_url": "https://katon-git-feat-doku-checkout-.../api/doku/notify",
  "origin": { "product": "CHECKOUT", "apiFormat": "JOKUL" }
}
```

`doku:status`: `transaction.status: SUCCESS`. Logs for this walk are on deployment
`4mCyBVybdge8GTkxFLDNfdJs6ojd` (commit `33a9ec5`).

**THE CONCLUSION, AND IT IS WHY THE WALKS STOP HERE.** Three walks, three payments DOKU
recorded as SUCCESS, **zero notification attempts**. The variables changed across them -
channel registration, then a documented per-request override DOKU visibly accepted -
made no difference whatsoever. That is not the shape of a misconfiguration. It is the
shape of **HTTP Notification not being enabled for this sandbox merchant**, the same
class of account-level switch as QRIS being inactive.

Ruled 2026-09-21: stop spending walks on it. Each one costs a deployment cycle and
tests a variable already eliminated. Reyner is asking DOKU directly whether HTTP
Notification is active on the sandbox merchant, alongside the QRIS request.

**AND THE FIXTURE STOPPED BEING A MERGE GATE.** Cowork moved it to a PRODUCTION-FLIP
gate: nothing about the notification body shape can be learned until DOKU delivers one,
and holding the adapter unmerged does not make that happen sooner. The DEFERRED REGISTER
carries what that leaves unguarded. `DOKU_CAPTURE` STAYS SET - it is the instrument that
catches the first delivered notification whenever it comes, and removing it now would
mean rediscovering all of this.

### HOW THE NEXT WALK CAPTURES THE FIXTURE

The last walk could not have produced one even if DOKU had delivered: nothing put the
raw notification anywhere readable, and this session cannot read Vercel function logs.
§5 assumed the log would carry it, so now it does.

`lib/doku/notify.js` gained a **capture**, fenced three ways: an explicit
`DOKU_CAPTURE` flag, never when `VERCEL_ENV=production`, and **only after the HMAC has
passed**. That last one is the fence that matters — the rule it sits beside is "the
reason, never the body", which is about an UNVERIFIED body, since anyone can POST one.
After verification the bytes are DOKU's own. All three were shown red on purpose,
including by moving the capture above the verify.

It prints the four headers and the raw body. The Signature is an HMAC of that body
under the secret and does not reveal it; the Client-Id is an identifier, not a
credential. **The secret is never touched.**

**To run the next walk:**

1. Reyner sets `DOKU_CAPTURE=1` in Vercel **Preview** scope, and confirms the
   Notification URL is registered **on the VA BCA channel**.
2. Code re-runs the walk (new pair, VA session, simulator).
3. The pair flips, which proves DOKU's own signature verifies against
   `lib/doku/signature.js` — the deepest thing the fixture is for.
4. Reyner copies the two `[doku][capture]` lines from the preview's Runtime Logs;
   they become `tests/fixtures/doku-notification.sandbox.json`, **labelled VA**.
5. `DOKU_CAPTURE` comes back out. The deferred register carries the row that removes
   the capture itself.

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
