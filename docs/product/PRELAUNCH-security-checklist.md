# Katon — Pre-Launch Security Checklist (run before taking real money)

From the June 2026 repo audit. The gating architecture is SECURE as built; these verify it stays
secure in the deployed environment and that nobody can forge an unlock. Hand to coding agent.

## MUST (real downside if skipped)

### 1. Production env vars present — close the dev-webhook fallback
The webhook has a dev-only branch: when `XENDIT_SECRET_KEY` is unset it trusts the payload body
(status/external_id) after only the token check, SKIPPING the Xendit invoice re-fetch. In prod this
branch must be unreachable.
- [ ] Confirm `XENDIT_SECRET_KEY` is set in the production (Vercel) environment.
- [ ] Confirm `XENDIT_WEBHOOK_TOKEN` is set in production.
- [ ] HARDEN: make prod fail CLOSED — if `XENDIT_SECRET_KEY` is missing in a production deploy, the
      webhook should refuse to grant (return error), NOT fall through to the trusting dev branch.
      Right now safety depends on the env var being set; make missing-key = no-grant, not blind-trust.

### 2. Forge tests — verify the gate actually holds (audit was read-only, did not run these)
- [ ] Hit `GET /api/reading/<token>/full` on an UNPAID reading → must return teaser only, never paid copy.
- [ ] Replay a webhook with a missing/wrong `x-callback-token` → must 401, must NOT flip `paid`.
- [ ] Replay a webhook with a VALID token but for an invoice that is NOT actually PAID at Xendit →
      must NOT grant (confirms the invoice re-fetch, not just the token, guards the unlock).
- [ ] Network-tab / built-bundle check: load a reading in the browser BEFORE paying, search the JS
      bundle + all network responses for paid prose (e.g. a beat-3 sentence, "Yang Sebenarnya Terjadi"
      body text) → must be ABSENT until payment.

### 3. Amount + idempotency
- [ ] Confirm grant requires `amount === PRICE_IDR` (a paid-but-wrong-amount invoice must not unlock).
- [ ] Re-fire the same success webhook twice → `paid` flips once, WA sends at most once (idempotent).

## SHOULD (hygiene, no security downside)
- [ ] Delete stale Vite artifacts: root `dist/` and `.claude/worktrees/*` (the "is this Vite?" confusion source).
- [ ] Confirm Supabase (not dev in-memory store) is the active reading store in production.
- [ ] Confirm the CSPRNG token path (`nanoid(21)`) is what ships (no debug/sequential fallback).

## NOTE — not security, but launch-blocking for breadth
- Content registry (`lib/content/index.js`) currently wires only 丙 Matahari; other 9 archetypes
  return 501. Wiring written readings into content files is a separate workstream from security.
  A user whose Day Master isn't yet wired gets no reading — decide whether to soft-launch on a subset
  or wait for fuller coverage.
