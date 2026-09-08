# Walking the paid flow, for free

**Sales are CLOSED in production (Reyner, 2026-09-08: Katon is exiting Xendit).
There is to be no real Xendit transaction by anyone, including for testing.
Xendit test keys are NOT needed and are not set.**

The paid path still has to be walkable end to end, so `PAYMENTS_PROVIDER=mock`
exists. It pays nothing. The Gemini spend of a real render is accepted, and it is
the only cost of a walk.

## What each value does

| `PAYMENTS_PROVIDER` | `POST /api/pay` | who can set it |
|---|---|---|
| `closed` | 503 `payment_closed`; the page renders its sales-closed state | production, and the default when the variable is unset or unrecognised |
| `mock` | returns a LOCAL `/kompatibilitas/<id>?bayar=mock` url; no provider, no money, no network | Preview and local only |
| `xendit` | the historical adapter, unchanged | nothing, for now |

**`mock` is refused when `VERCEL_ENV=production`.** `paymentsProvider()` downgrades
it to `closed` there, so the free unlock cannot be reached on the live site even
if the variable is set by mistake. `tests/payments-provider.spec.mjs` asserts it.

## On Preview

1. **Reyner sets `PAYMENTS_PROVIDER=mock` for the Preview scope in Vercel.**
   Project -> Settings -> Environment Variables -> add `PAYMENTS_PROVIDER`, value
   `mock`, tick **Preview** only. Leave Production alone: it must stay `closed`,
   and an unset variable is already `closed`.
2. Redeploy the preview, or push once, so the new value is picked up.
3. Open the preview's `/kompatibilitas`, fill both births and an email, submit.
4. The button leads straight to `/kompatibilitas/<id>?bayar=mock` - no Xendit tab,
   because the "invoice url" is this site's own page.
5. That page unlocks the pair through `POST /api/mock-pay/<id>`, which flips
   `paid` through the SAME `settlePair` the verified webhook uses, then shows the
   skeleton and swaps in the reading when it arrives.

**Preview cannot render prose.** `GEMINI_API_KEY` is Production-only, so the fence
refuses the render and the report serves the module-assembly FLOOR - Reyner's own
ruled glossary text. That is the correct product on that surface and it is what
the page shows; it is not a defect to report. What a preview walk verifies is the
FLOW, the layout and the copy, not the model's prose.

## Locally

```bash
PAYMENTS_PROVIDER=mock npm run dev
```

Local reads `.env.local`, which does carry `GEMINI_API_KEY`, so a local walk
renders real prose and costs real Gemini spend. Use it when the prose is the
thing being checked.

## What a walk does NOT prove

- **Nothing about Xendit.** The adapter is untouched and unexercised. A future
  provider swap (DOKU) needs its own walk against its own sandbox.
- **Nothing about the webhook's signature check.** `mock-pay` is a different door
  with its own fence; the webhook's token verification is exercised only by the
  webhook.
- **Nothing about production latency.** The render cost measured locally on
  2026-09-08 was 2.7-5.4s for one or two attempts, and the n=20 run saw draws
  needing six. Production adds its own distance to Gemini.
