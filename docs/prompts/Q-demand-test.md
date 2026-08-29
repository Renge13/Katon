<!--
STATUS: QUEUED build prompt. Written by Cowork 2026-08-29 from Reyner's rulings of the same day.
AUTHORITY: `docs/product/paid-product-map.md` section `## RULED 2026-08-29` is the product authority.
           This file is HOW, never WHETHER. If this prompt and that section disagree, that one wins.
SCOPE:     instrumentation, pricing data, and the post-mirror funnel order. NO engine work.
           The Compat build and the Annual build are NOT in this prompt and are not queued.
-->

# Prompt Q — the September demand test

## 0. WHAT THIS IS

Katon is live, correct, and has served no strangers. Nothing measures the funnel. This prompt builds
the smallest thing that can answer **which product people want**, using traffic that is about to be
acquired anyway, without building either candidate product.

**It does not decide the roadmap.** It produces five numbers with clean denominators. The decision
rule they feed is in the RULED section and is restated in §7 so Code does not have to interpret it.

**What is deliberately NOT here:** the pair engine, the annual engine, 天干五合 sourcing, the oracle
probe. The oracle probe is Reyner's, runs in parallel, and is a research task rather than a build.

---

## 1. RULED INPUTS — do not reinterpret these

From `docs/product/paid-product-map.md` `## RULED 2026-08-29`:

- Launch ladder **19 / 39 / 79**, mature ladder **29 / 49 / 99**.
- Post-mirror order is **Mirror -> Artifact decision -> Compat / Annual interest**.
- **One live purchase CTA per moment.** Upcoming products are secondary signals, never competing CTAs.
- Annual is **not** assumed to be the money product. Compat is **not** filed as a growth-only product.
  No code, comment, copy or doc may encode either assumption.
- The `CLAUDE.md` test band is amended to **25-49k**.
- Xendit QRIS is **0.7%**, confirmed by Reyner. The 19k price is not reopened on fee grounds.

---

## 2. COMMIT ORDER

Six commits. 0 is docs-only. Each carries at least one assertion that fails without its change
(CLAUDE.md convention, 2026-08-26).

### COMMIT 0 — docs only, no behaviour

1. `CLAUDE.md`: the price band **25-45k -> 25-49k**. Cite Reyner 2026-08-29 and the RULED section.
   Do not "round" 49 back to 45 in any later pass.
2. `CLAUDE.md` **rule 15**: remove the mutable status. It currently asserts the balance alert
   *"does not exist yet and sits in the deferred register with an owner and an end condition"*, and
   both halves are now wrong - auto-reload exists as an operational mitigation for the depletion
   case, and the row lives in the **interim** register. Apply rule 8's principle: **a locked rule
   carries the durable rule, and points at the live register for status.** Rule 15 keeps its
   architectural claim (one provider, so an outage is a 100% floor rate, and the floor is the
   availability budget) and replaces the status sentence with a pointer to the interim register row.
   No status number or existence claim stays inside the locked file.

### COMMIT 1 — pricing data

`lib/pricing.js`:

```js
artifact: { list: 29000, launch: 19000 },
compat:   { list: 49000, launch: 39000 },
annual:   { list: 99000, launch: 79000 },
```

- `LAUNCH_PRICING` stays `true`. It is not touched in September.
- **`SELLABLE_SKUS` stays `['artifact']`.** That file's own docblock is the rule: pricing a thing and
  selling a thing are separate decisions, and taking money for an unbuilt product is the failure the
  list exists to prevent. A checkout for `compat` or `annual` must still 400.
- Update the `SKUS` docblock to name all three products and to cite the RULED section for the ladder.

**Assertions that must fail without this commit:**
- `priceFor('annual')` returns 79000 at launch and 99000 with `{ launch: false }`.
- `isSellable('annual') === false` and `isSellable('compat') === false`.
- A checkout POST for `annual` returns 400 (the existing route test, extended).
- `amountMatchesSku` still rejects an artifact invoice paid at the compat amount. Adding SKUs must
  not widen what any one SKU accepts.

### COMMIT 2 — storage

New migration `supabase/migrations/0009_demand_test.sql`, following the repo convention in
`0005_sku.sql`: **run the migration before deploying the code that reads it.**

```sql
create table if not exists public.funnel_event (
  id         bigserial primary key,
  reading_id text not null,
  event      text not null,
  detail     jsonb,
  count      integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists funnel_event_once_idx
  on public.funnel_event (reading_id, event);
create index if not exists funnel_event_created_idx on public.funnel_event (created_at);
alter table public.funnel_event enable row level security;

create table if not exists public.product_interest (
  id         bigserial primary key,
  reading_id text not null,
  product    text not null,
  contact    text,
  created_at timestamptz not null default now()
);
create unique index if not exists product_interest_once_idx
  on public.product_interest (reading_id, product);
alter table public.product_interest enable row level security;
```

- RLS on with **no policies**, exactly like `reading` - all access is server-side through the service
  role key. There is no client-side table access in this app and this does not introduce one.
- Writes go through a **single data-access module**, `lib/analytics/events.js`, in the same spirit as
  `lib/readingStore.js` being the single door. One `recordEvent(readingId, event, detail)` that does
  an upsert: insert, and on conflict bump `count` and `updated_at`. First-occurrence timestamps are
  therefore preserved and a refresh cannot inflate a rate.
- Dev fallback: a process-local `Map` pinned on `globalThis`, mirroring `readingStore`, so local
  verification needs no Supabase.
- **`recordEvent` must never throw into a request path.** Instrumentation that can break a reading is
  worse than no instrumentation. Catch, log, continue.

**NO PII IN `funnel_event`.** `detail` carries render source and nothing else. Never birth date,
birth time, name, or contact. Contact lives only in `product_interest`, only when the reader typed it.

**RULE 16 IS NOT VIOLATED AND THE COMMIT MESSAGE SHOULD SAY SO.** Rule 16 forbids persisting a
**floor render**. Recording that a floor was served is not the render, does not become a cache entry,
and does not stop the next request from retrying the provider. A future session will flag this;
answer it in the code comment rather than in a PR thread.

### COMMIT 3 — instrumentation

Eight events, at the points that already exist. Nothing new renders in this commit.

| Event | Fired where | `detail` |
|---|---|---|
| `reading_created` | `POST /api/mirror` after the row is created | `{ has_hour: bool }` |
| `mirror_served` | `GET /api/mirror/[token]` on the first serve carrying prose | `{ source: 'rendered' \| 'module_assembly' }` |
| `card_downloaded` | the free Card A download handler | none |
| `offer_seen` | the Artifact offer block renders | none |
| `checkout_started` | an invoice is created | `{ sku }` |
| `purchase_confirmed` | the verified Xendit webhook flips `paid` | `{ sku }` |
| `upcoming_seen` | the Compat/Annual block renders (commit 4) | none |
| `interest_registered` | a reader taps either upcoming product (commit 4) | `{ product }` |

**`mirror_served` carries the render source, and that is not decoration.** The deferred-register row
*"THE RENDER FENCE CHECKS THAT A KEY EXISTS, NEVER THAT IT WORKS"* asks for a **free, passive**
detector of a dead provider and says the passive end is the only one to price first. A run of
`mirror_served` events all reading `module_assembly` is exactly that detector, at zero provider cost.
**Cross-reference that row from the code comment and from the row itself, both directions.**

`lib/site/copy.js`: the doc comment above `privasi` asserts "no cookies, no storage, no analytics" as
a verified code fact and becomes false here. **The public sentence survives untouched** - it promises
no *pihak ketiga* tracking, and a first-party server-side counter is neither a tracking cookie nor a
third-party tool. Update the doc comment, and the `collect` / `purpose` lists to say what is counted.
Nothing else in `/privasi` changes. **Reyner rules any Indonesian wording; propose, do not decide.**

### COMMIT 4 — the funnel order and the two upcoming products

This is the only commit a reader can see.

1. **The Artifact offer stays exactly where it is and stays alone.** It remains the only purchasable
   thing in the primary commercial moment. Nothing about it changes.
2. **Below it, after the Artifact decision, a new "upcoming" block** showing both products with their
   launch prices, visually secondary to the Artifact CTA - not two more buttons of the same weight.
   - "You + someone" - Rp 39.000
   - "Your year ahead" - Rp 79.000
   Both marked as not yet available. Nothing here creates a checkout, and neither product may reach
   `/api/pay`.
3. **Tapping one records `interest_registered` immediately.** The tap IS the metric. A contact field
   appears *after* the tap and is **optional** - requiring contact before the signal is recorded would
   measure willingness to hand over a phone number rather than desire for the product.
4. **English strings above are placeholders.** All reader-facing Indonesian is Reyner's. Propose
   wording in the PR body, flag it, ship nothing he has not ruled. Rule 20: keyboard characters only.

**`docs/PROGRESS.md` LIVE STATE must be updated in THIS SAME COMMIT.** That block's own rule: a
commit that changes what a user gets and does not touch it is incomplete. Add the upcoming block to
the table and say plainly that neither product is purchasable.

### COMMIT 5 — the read-out

`scripts/demand-readout.mjs`, read-only, prints the funnel with **every denominator named on its own
line**. No dashboard, no dependency.

```
window            2026-09-01 .. 2026-09-30
readings created                       N
completed mirror readers               N     <- THE DENOMINATOR
  of which floored (module_assembly)   N  (x%)
share/download rate                    x%    (card_downloaded / completed)
artifact conversion                    x%    (purchase_confirmed[artifact] / completed)
  checkout started but not confirmed   N
upcoming block seen                    N     <- THE SECOND DENOMINATOR
compat interest                        x%    (interest[compat] / upcoming_seen)
annual interest                        x%    (interest[annual] / upcoming_seen)
```

**The instrument must be shown failing before any number from it is trusted** (CLAUDE.md convention).
Seed a deliberately wrong fixture - a reader with two `mirror_served` rows, an interest with no
`upcoming_seen`, a purchase with no `checkout_started` - and show the script reporting the anomaly
rather than smoothing it. A read-out that cannot report a broken funnel is not evidence about a
working one.

### COMMIT 6 — `docs/NEXT.md`

Update the pointer to name this prompt as the current work. This is part of writing the prompt, not a
follow-up (the 2026-08-07 rule, broken five times since).

---

## 3. DEFINITIONS — exact, because every rate depends on them

- **Completed Mirror reader** = a distinct `reading_id` with at least one `mirror_served` event.
  Deduplicated by the unique index, so refreshes and second tabs do not inflate it. **This is the
  primary denominator. Never use raw traffic.**
- **A floored serve still counts as completed.** She read something. It is split out by `source` so
  every rate can be read floor-vs-rendered, which is also how a bad provider week is told apart from
  a bad product week.
- **Artifact conversion** = `purchase_confirmed[artifact]` / completed Mirror readers.
- **Share rate** = distinct readings with `card_downloaded` / completed Mirror readers. It measures a
  download, not a post. It is a proxy for distribution and must be labelled as one.
- **Compat / Annual interest** = distinct readings with `interest_registered[product]` /
  **`upcoming_seen`**, not / completed readers. A reader who never scrolled to the block never had the
  chance and must not sit in the denominator.
- **Contact capture rate** is reported separately and is not the interest metric.

---

## 4. CONSTRAINTS THAT WILL BITE

- **Previews cannot render.** `GEMINI_API_KEY` is Production-only and the fail-closed fence throws
  first. Verification is **local, then production after merge**. Any plan that says "check the
  preview" cannot run.
- **The local fence is a no-op** (`renderFenceReason()` returns null when `NODE_ENV !== 'production'`),
  so a dev server with an **invalid** key walks the entire funnel through the floor path at **zero
  provider cost** - real routes, real page, no stubs. That is the documented trick in
  `docs/qa/2026-08-27-floor-after-heading-ruling.md`, and it verifies seven of the eight events for
  free. Only the `source: 'rendered'` branch needs one real render.
- **Every render costs money** against a balance whose alert still does not exist. Do not re-render to
  admire the instrumentation.
- **Rule 20:** keyboard characters only in user-facing strings. Code comments are exempt.
- **The instrument-must-fail convention applies to every check added here**, not only to commit 5.
- **`SELLABLE_SKUS` is the fence** that keeps an unbuilt product from taking money. If any commit
  makes `compat` or `annual` reachable by `/api/pay`, that commit is wrong.

---

## 5. VERIFICATION

1. **Local, free:** dev server, invalid Gemini key. Walk the funnel: submit, read the floored mirror,
   download the card, see the offer, see the upcoming block, tap both. Run `demand-readout.mjs`.
   Every rate must be arithmetically checkable by hand against what you just did.
2. **Local, adversarial:** the seeded bad fixture from commit 5. The read-out reports the anomalies.
3. **Local, dedup:** refresh the mirror five times. `completed` stays 1, `count` on `mirror_served`
   goes to 5. This is the assertion that would have caught an inflated denominator.
4. **Production, once, after merge:** one real reading to exercise `source: 'rendered'`, one artifact
   purchase at 19.000 to exercise `purchase_confirmed`. Reyner's own card is fine here - **and it is
   not market evidence, it is a wiring check.** Record it as such.

`npm test`, `npm run check:qa` and `npm run check:copy` all pass before the PR.

---

## 6. WHAT THIS PROMPT DOES NOT DO

The Compat build. The Annual build. 天干五合. Email capture at checkout. The conversion-counter row's
wider ambitions. The Card A 1080x1350 re-rule and prompt P, which are Reyner's design pass. The
Gemini balance alert, which is Reyner's and is not closable by a commit.

---

## 7. HOW THE NUMBERS ARE READ IN OCTOBER — restated so Code needs no interpretation

- **Compat wins on demand AND the oracle gate passes** -> build Compat.
- **Compat wins on demand AND the oracle gate fails** -> build Annual, and record Compat as
  **BLOCKED ON RESEARCH** with an owner. Never "queued".
- **Annual shows compelling demand** -> build Annual.

**Do not call a winner on a small or noisy gap.** The question is whether the difference is materially
meaningful, not whether one number is larger.

**The oracle gate is not "find a published reading matching our prose."** PASS if the pair mechanics
can be independently verified, deterministic pair facts exist that the engine can calculate, those
facts map to defensible interpretations without unsupported invention, and hour-less Person B has a
defined degraded mode. FAIL if core mechanics cannot be verified, claims rest on unsupported rules, or
the reading would need intuitive invention.

**Imlek is mid-February.** An Annual reading that catches its season is built in Oct-Nov. A deadline,
not a thumb on the scale.
