# Prompt V — Amendment 1 (Cowork, 2026-09-21, after Code's round-1 report and PR #124)

**Code: commit this file yourself, alone, as the first commit of round 2.** The rulings below were written
into `docs/prompts/V-doku.md` on the device working tree on 2026-09-21 and did not survive into the copy
Code committed - the failure `docs/COWORK-BRIEF.md` already records ("Cowork's writes to the device tree
are not durable"). This file is the durable form. Where it and `V-doku.md` disagree, THIS FILE WINS.

## A. Reyner's rulings of 2026-09-21 (chat), binding
1. `order.auto_redirect: true`.
2. The six `lib/site/copy.js` strings take the §8.6 proposals verbatim; no further wording change unless
   implementation reveals a problem (then stop and ask).
3. Vercel PREVIEW scope holds `DOKU_CLIENT_ID`, `DOKU_SECRET_KEY` (SANDBOX pair), `DOKU_SANDBOX=1`,
   `PAYMENTS_PROVIDER=doku`; a fresh preview deployment carries them. §8 items 1-2 and 5-6 are DONE.
4. **PRODUCTION IS OFF LIMITS for the whole of Prompt V: no production credential, no production env var,
   no production Back Office.** The production flip and the Rp 39.000 walk are a separate, later
   instruction from Reyner.

## B. Corrections Code found in round 1, adopted
1. **Doc URLs.** The two §2 citations 404; live paths are under `developers.doku.com/accept-payments/...`
   (plural), index at `developers.doku.com/llms.txt`. The five signature-spec points were confirmed
   against the live pages; the prompt's citations, not its spec, were wrong.
2. **Signature comparison is on DECODED BYTES, not strings.** DOKU's own samples disagree on base64
   padding (signing example padded, notification sample unpadded). `signaturesMatch` decodes both sides,
   checks 32-byte length, then `timingSafeEqual`. A string compare would pass every local test and fail
   the first real notification. Keep the test that proves the padded and unpadded forms of one signature
   both verify.
3. **`Request-Timestamp` window is +-3600s and DOKU enforces it outbound**, before `Client-Id`. §3's
   "not enforced in v1" was conditional on this and is now split: (a) OUTBOUND - `client.js` generates
   the timestamp at send time, never at module scope, never reused across a retry; add a test that two
   consecutive signed requests carry different `Request-Id` and a fresh timestamp. (b) INBOUND (should
   `/api/doku/notify` reject a notification whose timestamp is >1h old?) - stays a deferred-register row
   with what it would guard (replay of a signed SUCCESS, which is already idempotent) and what it would
   cost (a legitimate DOKU retry from the 9-attempt/7-day schedule would be REJECTED, so the answer is
   probably no; record it, do not build it).
4. **Error envelope.** `error.message` is a STRING, not an array. `createCheckout`'s thrown message
   carries it as-is.
5. **QRIS is a valid `payment_method_types` value on `/checkout/v1/payment`** (sandbox enum accepted
   it). The §2 "Checkout vs Direct API" gate is therefore GO on the API. Whether QRIS is ENABLED on this
   account is still an account question the sandbox walk answers; if the checkout page shows no QRIS,
   stop and report - do not switch products.
6. The docs' QRIS notification sample is SNAP (`"apiFormat":"SNAP"`), not Checkout. §4's rule stands:
   the fixture is a CAPTURED Checkout notification from the sandbox walk, nothing else.

## C. Unblocking the sandbox walk - who does what
- **Reyner:** put the SANDBOX `DOKU_CLIENT_ID` / `DOKU_SECRET_KEY` (the same values already in Vercel
  Preview) into `.env.local` on the machine Code runs on, together with `DOKU_SANDBOX=1` and
  `PAYMENTS_PROVIDER=doku`. `.env.local` is gitignored (`.gitignore`, and `.env.example` says NEVER
  commit real secrets). Then set the sandbox Back Office Notification URL to
  `https://katon-git-feat-doku-checkout-renge13s-projects.vercel.app/api/doku/notify`.
- **Code, round 2:** `npm run probe:doku` (answers §2's remaining questions: repeated `invoice_number`,
  `customer` required or not, QRIS on the page). Then `lib/doku/client.js`, the fence, the pay-route
  branch, `lib/doku/notify.js` + route, tests, `--live` forgery checks, the copy commit, the ledger -
  all as V-doku.md §§1-7 say, with B.2-B.4 applied. Then the §5 walk on the preview, capturing the raw
  notification as the fixture. **Round 2 is the last round**; anything not done goes to the DEFERRED
  REGISTER with what is unguarded.
- **Note on the preview's `payment_closed`:** expected. #124 has no fence change, so `doku` is not yet a
  value the fence knows and reads as closed. It confirms nothing about the Preview variables either
  way; the first `doku`-aware preview build will.

## D. For the ledger (Code writes the rows)
- COWORK-BRIEF: Cowork's tree write of the amended prompt was not durable (second instance this month,
  the first being the 2026-09-14 prompt-only-in-project). The rule already exists; this is a count.
- Cowork's §2 doc citations 404'd - wrong path segment (`accept-payment` vs `accept-payments`). Verify a
  URL by fetching it before writing it into a prompt.
