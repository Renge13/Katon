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

**PREVIEW NEEDS ITS OWN `GEMINI_API_KEY` OR THE WALK SERVES THE FLOOR.** The
variable is scoped per environment in Vercel, so a key set for Production does
nothing on Preview: the render fence refuses, and the report shows the
module-assembly floor - Reyner's own ruled glossary text, correct on that surface
and not a defect, but NOT the model's prose.

That distinction decides what a walk can tell you:

| `GEMINI_API_KEY` on Preview | what the walk verifies |
|---|---|
| not set | the FLOW, the layout and the copy. The report is the floor |
| set | all of the above, plus the prose the model actually writes |

**Set for Preview 2026-09-08**, alongside `PAYMENTS_PROVIDER=mock`, so a preview
walk now renders real prose - and spends real Gemini money, once per pair, which
is the accepted cost. The floor is still what a preview shows if the key is ever
removed, and the page cannot tell you which it served: `served_from` is in the
payload and deliberately not on screen (rule 15 - the floor is the second half of
the design, not a degraded mode). To check, read `served_from` from
`GET /api/pair/<id>/reading`.

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
