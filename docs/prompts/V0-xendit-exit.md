<!--
STATUS: RELEASED by Reyner 2026-09-18 ("fully leave Xendit asap, make it priority"). Written by Cowork
2026-09-18 against the STAGED tree (HEAD was `feat/pdf-appendix-card`; none of the files below are touched
by Y-4, but BRANCH FROM MAIN after #121 lands, or from main now - do not stack this on the PDF branch).
THIS FILE IS NOT DURABLE UNTIL CODE COMMITS IT. Commit 0 is this prompt, alone.
Order: THIS (V-0) -> V (DOKU adapter) -> `?dari` -> real-money walk on DOKU -> promotion to own network.
A RULING RECORDED IN THE REPO BEATS THIS FILE, ALWAYS. The ruling this executes: "Xendit exit now"
(Reyner 2026-09-08, PROGRESS ledger row "Compatibility. SALES CLOSED 2026-09-08"), and the decision rule in
the INTERIM REGISTER row "XENDIT PRICING CHANGES 2026-10-01": no purchases -> TERMINATE before 1 October.
Reyner took the TERMINATE branch on 2026-09-18. That row CLOSES when his account-closure confirmation is in
hand, not when this PR merges - see "What this PR does not do".
-->

# Prompt V-0 — remove the Xendit adapter. `PAYMENTS_PROVIDER` becomes `mock | closed`.

## Why a separate prompt, and why before DOKU
The 2026-09-08 outline put Xendit deletion at commit 5 of Prompt V, after DOKU worked. That ties the exit to
DOKU's pace (signing scheme against docs + sandbox, credentials in Reyner's hands). Reyner ruled the exit
the priority, so it lands on its own: small, reviewable in one sitting, and V then ADDS an adapter to a
two-value fence instead of swapping one adapter for another. Nothing here changes what a reader sees.

## Four checks, cited (Cowork, 2026-09-18, staged tree)
1. Every path and symbol below was read from the staged files, not from memory: `lib/xendit.js`,
   `lib/paymentFence.js`, `app/api/pay/[id]/route.js`, `app/api/webhook/xendit/route.js`,
   `app/api/mock-pay/[id]/route.js`, `lib/pair/settle.js`, `tests/payments-provider.spec.mjs`,
   `.env.example`, `CLAUDE.md:33,140`. The comment-only mentions are listed by `grep -rn -i xendit`, quoted
   in "Comment sweep". `PAYMENTS_PROVIDER` is in neither `.env.example` nor `CLAUDE.md` (grep: zero hits).
2. Red-first is real here: the test `XENDIT IS UNCHANGED, which is what makes this reversible`
   (`tests/payments-provider.spec.mjs:79`) is the instrument that MUST go red when the adapter is removed,
   and its replacement must be shown red against the pre-change fence before it is green.
3. No new gate. This REMOVES a code path (the `not_configured` dev fallback in the pay route and the
   body-trust dev branch in the webhook), it adds none.
4. Customer: sees nothing. Sales are already closed in production (`PAYMENTS_PROVIDER` unset -> `closed`).
   What it buys is that the exit is DONE rather than pending, and that a stale `PAYMENTS_PROVIDER=xendit`
   in any environment can never again point at a dead account. That is worth one small PR and no more -
   two rounds cap, then merge.

## Precondition (safe today, verified)
`lib/paymentFence.js#paymentFenceReason` asks the provider FIRST ("THE PROVIDER IS ASKED FIRST, because the
Xendit keys are about to be unset and their absence must not then read as a misconfiguration") and
`tests/payments-provider.spec.mjs:67` asserts `CLOSED REFUSES BEFORE THE XENDIT KEYS ARE EVEN CONSULTED`.
So Reyner deleting `XENDIT_SECRET_KEY` / `XENDIT_WEBHOOK_TOKEN` on Vercel is safe BEFORE this PR lands,
and this PR is safe before he does. Neither waits on the other.

## Commits (one PR, `feat/xendit-exit`)

### Commit 0 — this prompt, alone.

### Commit 1 — the instrument goes red first
In `tests/payments-provider.spec.mjs`:
- DELETE the test `XENDIT IS UNCHANGED, which is what makes this reversible` (lines 79-91 on the staged
  tree). Its premise is gone by ruling.
- ADD `A STALE PAYMENTS_PROVIDER=xendit MEANS CLOSED`: `withEnv({ PAYMENTS_PROVIDER: 'xendit',
  NODE_ENV: 'production', XENDIT_SECRET_KEY: 'k', XENDIT_WEBHOOK_TOKEN: 't' })` ->
  `paymentsProvider() === 'closed'` and `paymentFenceReason() === 'payment_closed'`. RUN IT AGAINST THE
  UNCHANGED FENCE AND PASTE THE RED LINE INTO THE PR (it will read `xendit` / `null`). That is the proof
  the instrument can fail.
- ADD a source assertion `NO XENDIT IN THE PAYMENT PATH`: `lib/xendit.js` does not exist,
  `app/api/webhook/xendit/route.js` does not exist, and `grep -rn -i xendit --include=*.js --include=*.jsx
  --include=*.mjs lib app components` returns zero hits (implement with a small walker, not a shell grep;
  read the file list from `fs`). Red before commit 2, green after.
- In the test `THE PAY ROUTE ANSWERS payment_closed`, the assertion `src.indexOf("paymentsProvider() ===
  'mock'") < src.indexOf('createQrisInvoice({')` must change: assert instead that `createQrisInvoice` does
  NOT appear in the route.
- Drop `XENDIT_SECRET_KEY`, `XENDIT_WEBHOOK_TOKEN` from `withEnv`'s KEYS after commit 2 (keep them in
  commit 1 so the red run is honest).

### Commit 2 — delete the adapter and every branch that reached it
- `git rm lib/xendit.js` and `git rm app/api/webhook/xendit/route.js`. The whole directory
  `app/api/webhook/` goes if nothing else is in it (staged listing: only `xendit/`).
- `lib/paymentFence.js`: `PROVIDERS = new Set(['mock', 'closed'])`. `paymentFenceReason()` returns
  `'payment_closed'` for closed, `null` for mock, and has NO third branch - the `NODE_ENV` dev bypass
  and both `XENDIT_*` checks are deleted. DELETE `devBypassAllowed()` (its only callers are the two files
  being deleted/edited here - confirm with grep before deleting; the staged tree shows
  `app/api/pay/[id]/route.js` and `app/api/webhook/xendit/route.js` only). Rewrite the header comment: the
  three-value table becomes two values, the "'xendit' the historical adapter" line goes, and the "WHY
  'closed' IS THE DEFAULT" paragraph STAYS word for word. Add one line: `doku` arrives in Prompt V.
- `app/api/pay/[id]/route.js`: remove the `createQrisInvoice` import and the whole real-provider branch
  after the mock block, including the `catch` with the `not_configured` dev fallback. After the mock
  block the route returns `notConfigured('payment_closed')` - defensive, because the fence already
  refused, and a future provider branch slots in above it. Remove the `devBypassAllowed` import. KEEP
  `INVOICE_DESCRIPTION` and its whole comment block untouched: those strings are Reyner-ruled chrome and
  DOKU's checkout page will carry them (the `compat` `@@UNRULED@@` sentinel included). Keep
  `recordEvent(id, 'checkout_started', { sku, provider: 'mock' })` as is.
- `lib/pair/settle.js`: the two log prefixes `[webhook/xendit]` -> `[settle]`. The `@param statusPaid
  Xendit says the money arrived` -> `the provider's own record says the money arrived`. Behaviour
  unchanged; `tests/pair-checkout.spec.mjs` must stay green without edits to its assertions (it asserts
  `markPairPaid` has exactly one call site - still true).
- `.env.example`: delete the `# --- Xendit (Phase 4a) ---` block (lines 12-16). ADD, in its place,
  `PAYMENTS_PROVIDER=` with a three-line comment: unset means closed; `mock` is Preview/local only and is
  refused when `VERCEL_ENV=production`; `doku` arrives in Prompt V. This is the first time the variable
  is documented in the example file - it was not there.

### Commit 3 — comment sweep, current-state only
Reword ONLY sentences that describe the CURRENT mechanism. Ledger rows, DECIDED blocks and dated history
in `docs/PROGRESS.md` / `docs/NEXT.md` are NOT edited - they record what was true when written.
- `CLAUDE.md:140` rule 18: "`paid` flips only in the verified Xendit webhook" -> "`paid` flips only in the
  verified provider notification (`settlePair` / `markReadingPaid`, the single door), never from any
  client path." `CLAUDE.md:33` STACK line: "Xendit QRIS" -> "QRIS via DOKU (Prompt V; sales closed until it
  lands)". Add `lib/xendit.js` and `/api/webhook/xendit` to CLAUDE.md's `## SUPERSEDED — ignore these wherever
  they appear` section (staged tree line 271; it exists).
- `lib/readingStore.js:9,45,104`, `lib/pairStore.js:18,62,91`, `lib/deliver/handlers.js:10,52`,
  `lib/pricing.js:15`, `tests/pair-checkout.spec.mjs:8,159`, `tests/mock-walk.spec.mjs:131,139`,
  `app/api/mock-pay/[id]/route.js` header: "Xendit webhook" -> "provider notification", "Xendit
  double-fire" -> "provider double-fire", "Xendit invoice" -> "provider invoice". Where a comment says
  "Xendit redirects a browser to it" the fact is about hosted checkout pages generally - say "the
  provider's hosted page". Line numbers are from the staged tree of 2026-09-18; grep, do not trust them.
- `docs/ops/paid-flow-walk.md`: read it; if it names the Xendit path as the alternative to mock, say the
  alternative is DOKU after V.

### Commit 4 — ledger
- `docs/PROGRESS.md` INTERIM REGISTER row "XENDIT PRICING CHANGES 2026-10-01": append to its status cell:
  "**DECIDED 2026-09-18: TERMINATE.** Reyner took the terminate branch before the funnel data, on the
  2026-09-08 exit ruling. Adapter removed in <this PR>. **Row closes on Reyner's written closure
  confirmation from Xendit, not on this merge** - the fee is on the ACCOUNT, and the account is his to
  close." Do not close the row.
- `docs/PROGRESS.md` ledger: one new row for this PR in the current format - what shipped, the red line
  from commit 1 pasted verbatim, the grep that returns zero.
- `docs/NEXT.md`: the chain line reads `V (DOKU) -> ?dari -> real-money walk -> promotion to own network
  on Vercel Hobby -> U (Render) -> promotion beyond own network`, and V-0 is marked landed.

## Acceptance
- `node --test` green; the commit-1 red line is in the PR description.
- `grep -rn -i xendit --include=*.js --include=*.jsx --include=*.mjs --include=*.example lib app components
  tests .env.example` -> zero hits. `grep -rn -i xendit CLAUDE.md` -> zero hits.
- Preview deploy with `PAYMENTS_PROVIDER=mock`: the mock walk in `docs/ops/paid-flow-walk.md` still
  completes (Code walks it once and says so). Production: unset -> `POST /api/pay/<id>` answers 503
  `payment_closed`, unchanged.

## What this PR does not do
It does not close the Xendit account, withdraw the balance, or delete keys on Vercel. Those are Reyner's,
listed in the Claude project state doc of 2026-09-18, and the 1 October date is on THEM, not on this code.
It does not add DOKU. It does not touch pricing, copy, or any reader-visible surface.
