# PHASE-4A — pre-production verification checklist

Two things in the payment path depend on **live infrastructure** and cannot be
verified from the code alone. Both must be confirmed by a human against the real
Supabase project + Xendit account **before this branch ships to production.**
Both are currently **left as-is in code by design** — this file is the reminder,
not a fix.

## 1. Supabase `reading` table must have all payment columns

The data-access layer (`lib/readingStore.js`) writes/reads these columns. There is
**no migration file in the repo** (the schema is managed in the Supabase dashboard),
so a missing column fails **only at runtime in production** — and some failures are
swallowed client-side (e.g. `/interest` demand-capture), so they can silently drop
data without an obvious error.

Confirm the `reading` table has, at minimum:

| column           | type      | written/read by                                  |
|------------------|-----------|--------------------------------------------------|
| `paid`           | `boolean` | `markReadingPaid` / gates `/full` (default false) |
| `paid_at`        | timestamp | `markReadingPaid`                                |
| `wa_sent`        | `boolean` | `claimWaSend` / `releaseWaSend` (default false)   |
| `invoice_id`     | text      | `setInvoice` (Xendit invoice id)                 |
| `interest_domain`| text      | `setInterest` (coming-soon demand capture)       |
| `interest_wa`    | text      | `setInterest`                                    |

> `paid` and `wa_sent` **must default to `false`** (not null) — the idempotent
> conditional updates use `.eq('paid', false)` / `.eq('wa_sent', false)`, and a
> `NULL` will not match, breaking the paid-flip and the WA-send-once guard.

## 2. Xendit invoice `amount` must be returned as a number

The webhook (`app/api/webhook/xendit/route.js`) confirms a real payment with:

```js
paidConfirmed = PAID_STATUSES.includes(invoice.status) && invoice.amount === PRICE_IDR;
// PRICE_IDR = 49000 (number)
```

`invoice.amount` comes straight from `getInvoice` → `data.amount` in
`lib/xendit.js`. The check is **strict `===`**, so if Xendit's API returns `amount`
as a string (`"49000"`) it will **never equal** the numeric `PRICE_IDR` and a
genuinely-paid user will **not** be unlocked. This fails **closed** (safe — it
never over-grants), but it would silently block real payments.

Confirm against a real Xendit invoice payload that `amount` is a JSON number. If it
can be a string, coerce with `Number(data.amount)` in `lib/xendit.js`'s `getInvoice`
mapping (do the coercion there, once, not in the webhook).
