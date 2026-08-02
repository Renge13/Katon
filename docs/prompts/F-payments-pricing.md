<!--
STATUS: HANDOVER — Claude Code build prompt. Created 2026-08-02 by Cowork, prices confirmed by Reyner.
This is PROMPT F. It is INFRA work: run it in its own session/PR, never in the Stage 3 (D2) session.
Prompt E remains reserved for the compat pair-layer engine (see PROGRESS, compat flow block).
-->

# Prompt F — retire pre-pivot pricing, install the v1 price architecture

## Read first, in order
1. `../../CLAUDE.md` — rules 14-20 especially (paywall server-gated, one voice, keyboard chars).
2. `../PROGRESS.md` — "COMPAT FLOW" and "CARD VISUAL SYSTEM" DECIDED blocks, 2026-08-02.
3. `../product/launch-decisions.md` — §"PROPOSED price architecture 2026-08-02" (numbers confirmed
   by Reyner same day; treat as decided).

## Why this prompt exists

The payment path still sells the DEAD pre-pivot product:
- `lib/pricing.js` exports `PRICE_IDR = 49000` commented "Rp 49.000 — locked". That price was
  superseded (CLAUDE.md SUPERSEDED list) and nothing else in the repo knows it.
- `app/api/pay/[id]/route.js` refuses to create an invoice unless `row.domain` is set — the
  pre-pivot domain-reading gate. Paid is no longer a domain reading.
- `app/api/webhook/xendit/route.js` verifies `invoice.amount === PRICE_IDR` — correct pattern,
  stale constant.
- The invoice description in the pay route contains an em-dash — one of the two known rule-20
  violations in CLAUDE.md.

## Scope — what THIS prompt does (foundation only)

**In scope:** the pricing model, per-SKU webhook verification, the stale-gate removal, the
description string. **Out of scope:** the Complete Edition fulfillment (needs the card component,
separate prompt) and the compat checkout (needs Prompt E). The legacy /full unlock stays wired and
fenced so nothing user-facing breaks mid-transition — v1 SKUs point at it until fulfillment swaps.

## Tasks, in commit order

### 1. `lib/pricing.js` — SKU table replaces the constant
```js
// Prices: docs/product/launch-decisions.md §"PROPOSED price architecture 2026-08-02".
// Mechanic: list is the public anchor and NEVER rises; launch (harga peluncuran) is the
// only test variable. Confirmed by Reyner 2026-08-02.
export const SKUS = {
  artifact: { list: 25000, launch: 19000 },   // Complete Edition card + PDF
  compat:   { list: 45000, launch: 29000 },   // compatibility reading (checkout not built yet)
};
export const LAUNCH_PRICING = true; // flip to false to charge list
export const priceFor = (sku) => SKUS[sku][LAUNCH_PRICING ? 'launch' : 'list'];
```
Keep a named export shim only if something imports `PRICE_IDR` that you cannot update in this PR;
otherwise delete the constant entirely. Grep first.

### 2. `app/api/pay/[id]/route.js`
- Remove the `row.domain` requirement (pre-pivot). The invoice is created for a SKU — default and
  only sellable SKU right now: `artifact`. Store the SKU on the invoice record (alongside
  `invoiceId`) so the webhook can verify per-SKU.
- `amount: priceFor(sku)`.
- Rewrite the invoice description: keyboard characters only (no em-dash), one composed voice.
  Proposal, flagged for register: `"Katon - Complete Edition (kartu resolusi tinggi + PDF)"`.
  `[REYNER]` must approve the final string before merge.

### 3. `app/api/webhook/xendit/route.js`
- Verify `invoice.amount === priceFor(storedSku)` — per-SKU, not the global constant.
- Everything else unchanged: `paid` flips ONLY here (rule 18), fail-closed fence stays, no client
  path ever supplies a price or SKU-price mapping.

### 4. Tests (same PR)
- Pricing sanity: every SKU has `launch <= list`; `compat > artifact` at both tiers.
- Webhook rejects a paid invoice whose amount matches the WRONG tier (e.g. list when launch active)
  or wrong SKU. This is the regression that protects rule 18 when prices change.

### 5. Separate commit: the second rule-20 violation
`components/Sharecard.jsx` uses an em-dash as an empty-state placeholder. Replace with a keyboard
character. One-line commit, message says exactly that.

## Constraints
- No engine files. No `lib/bazi/*`. Nothing in the D2/Stage 3 surface.
- Each commit independently revertable; the commit message describes everything staged (run
  `git status` and read it BEFORE writing the subject).
- If anything you find contradicts this prompt or the docs, STOP and report — do not reconcile
  silently. The docs win over this prompt; CLAUDE.md wins over the docs.
