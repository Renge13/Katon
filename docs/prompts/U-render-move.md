<!--
STATUS: QUEUED, DO NOT START. Written by Cowork 2026-09-14, then HELD the same night on Reyner's correction:
the ruled trigger (PROGRESS INTERIM REGISTER 2026-09-05; launch-plan state 2026-09-07) is "Vercel Hobby until
first promotion BEYOND OWN NETWORK; then Render Singapore". Cowork had carried "U before promotion" forward
from its own state docs without re-reading the ruling. Order now: V (DOKU) -> `?dari` -> real-money walk ->
promotion to own network on Vercel Hobby -> THIS PROMPT -> promotion beyond own network.
When released: Code commits it FIRST, alone, on `feat/render-move`.
A RULING RECORDED IN THE REPO BEATS THIS FILE, ALWAYS. The destination and the trigger were ruled in
`docs/PROGRESS.md` INTERIM REGISTER ("KATON RUNS A COMMERCIAL PRODUCT ON A NON-COMMERCIAL PLAN",
2026-09-05) and `docs/qa/2026-09-05-workers-compatibility-spike.md`; this prompt executes them.
-->

# Prompt U — move the service from Vercel Hobby to Render, Singapore

## THE RENDER SERVICE MUST BE IN SINGAPORE.
That is the first line of this brief by ruling (spike doc, 2026-09-05). `63d6488`'s 11.5x came entirely
from collocating with the `ap-southeast-1` database; a service in the wrong region hands it back
silently, and Render does not let a region be changed after creation (`render.com/docs/regions`, read
2026-09-14) — a wrong pick is a delete-and-recreate.

Four checks, cited: (1) every code fact below was grepped on the staged tree 2026-09-14 (the two
`VERCEL_ENV` reads at `lib/paymentFence.js:44` and `scripts/check-unruled-copy.mjs:95`; the cron at
`vercel.json`; `CRON_SECRET` at `lib/health/keepalive.js:107`; `regions: ["sin1"]`); Render facts
from render.com docs/pricing read 2026-09-14 — Singapore listed, region immutable, cron job = separate
service min USD 1/mo, smallest paid web instance USD 7/mo 512 MB, single-service PR previews on the
Hobby workspace plan; (2) the acceptance instrument is the one that already measured the region move
(`docs/qa/2026-09-05-region-move-both-legs.md` method), run against a deliberately wrong-region
control if one is cheap, otherwise against the recorded Vercel-iad1 numbers as the known-bad;
(3) nothing here changes what the product says or accepts; two host-neutral env reads replace two
Vercel-specific ones, and that is the whole behaviour change; (4) customer: nothing visible if done
right — same URL, same latency band, and a paid product no longer one policy flag away from a paused
deployment during its launch week.

## WHY NOW (from the register row, so it is not re-argued)
Hobby forbids commercial use; katon.app processes payments. The ruled trigger is "before any
meaningful promotion", an action Reyner takes rather than a threshold nobody watches. Promotion is
after V (DOKU) and the real-money walk; U goes first so the host is settled before money moves.

## SPLIT OF WORK
- **Reyner (account actions Cowork and Code cannot do):** create the Render account + workspace,
  add payment; create the web service in **Singapore** from the GitHub repo `Renge13/Katon`, branch
  `main`, instance USD 7/mo (512 MB) to start; create the cron job service (Singapore, USD 1/mo);
  paste env vars (list below); add the custom domain `katon.app` (+ `www` if used) in Render and take
  the DNS records it gives; lower the DNS TTL at the registrar a day BEFORE cutover; flip DNS at
  cutover; keep the Vercel project alive for a 7-day rollback window, then remove `katon.app` from
  Vercel (the terms exposure ends when the domain leaves, not when traffic does). Create a NEW Gemini
  API key for Render — the production key is Vercel-Sensitive and unrecoverable (state 2026-09-08).
- **Code (repo):** commits 0-5 below.
- **Cowork:** reads the acceptance artifact and recommends cutover / rollback.

## Commit 0 — this file, alone.

## Commit 1 — `KATON_ENV` replaces `VERCEL_ENV` (the only behaviour change; SHOW RED FIRST)
Two reads make production safety depend on a Vercel-only variable. On Render `VERCEL_ENV` is
undefined, so today's code would (a) let `PAYMENTS_PROVIDER=mock` stay OPEN in production and (b) run
the copy gate non-strict on a production build. Both are silent.
- New `lib/env.js`: `appEnv()` returns `process.env.KATON_ENV || process.env.VERCEL_ENV || 'development'`,
  values `production | preview | development`; `isProduction()`. Fallback to `VERCEL_ENV` so Vercel
  keeps behaving during the overlap, removed in commit 5 after cutover.
- `lib/paymentFence.js:44` and `scripts/check-unruled-copy.mjs:95` read `isProduction()`.
- Tests red first: with `KATON_ENV=production` and no `VERCEL_ENV`, `PAYMENTS_PROVIDER=mock` resolves
  to `closed` (today it resolves to `mock` — that is the red); the copy gate is strict under
  `KATON_ENV=production` alone. `tests/payments-provider.spec.mjs` is where the fence is pinned.
- `.env.example`: document `KATON_ENV`, and state that on Render it is set explicitly per service
  (production on the web service; `preview` on PR previews if Render's single-service previews can
  carry a per-environment override — VERIFY in the Render dashboard, do not assume; if previews
  inherit production vars, PR previews must NOT get `PAYMENTS_PROVIDER=mock` and the mock walk moves
  to a second Render service or stays local).

## Commit 2 — deploy descriptor and runtime pins
- `render.yaml` (Blueprint) at repo root: one web service (`env: node`, region `singapore`,
  `buildCommand: npm ci && npm run build`, `startCommand: npm run start`, `healthCheckPath: /api/keepalive`
  ONLY IF that route answers 200 without the bearer when `CRON_SECRET` is set — read
  `keepalive.js:95-150` first; if it 401s without the bearer, add a separate `/api/health` that does a
  cheap DB round trip and returns `{ok, db_ms}`, same contract as keepalive: ok iff a real round trip
  succeeded, shown red on a throwing DB); one cron job service (`schedule: "0 19 * * *"` — the same
  daily time as `vercel.json`; command `curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://katon.app/api/keepalive`).
  Env vars listed by key with `sync: false` so secrets are pasted in the dashboard, never committed.
- `engines.node` in `package.json` pinned to the major Vercel currently builds with (read it from the
  last Vercel build log or `node -v` in CI; do not guess) and `.node-version` to match.
- `vercel.json` untouched in this commit (Vercel must keep deploying during the overlap).
- `next.config.mjs` `outputFileTracingIncludes` stays: harmless under `next start`, and removing it
  is a Vercel-rollback hazard during the window.

## Commit 3 — the acceptance instrument, committed BEFORE cutover
`scripts/measure-host.mjs`: the `2026-09-05-region-move-both-legs.md` method as a script — warm
tap→chart median n=6 and prose cache-HIT median n=6 against a base URL, plus `/api/health` `db_ms`
median n=10. Prints a table with the recorded Vercel-sin1 numbers (240.5 / 275.5 / ~46ms) beside the
measured ones. Falsifier: run it against the recorded Vercel-iad1 figures as known-bad input (or, if
Reyner accepts the USD cost of a short-lived control, against a Render service created in Oregon and
deleted after) and confirm it reports FAIL. Acceptance: Render-Singapore within 1.3x of the sin1
numbers on all three; `db_ms` under 80ms median. A miss on `db_ms` means the region is wrong —
STOP, do not cut over, recreate the service.

## Commit 4 — walk on the Render URL BEFORE DNS
On `<service>.onrender.com`: `npm test` irrelevant here; instead the ops walks — free mirror end to
end; `docs/ops/paid-flow-walk.md` with `PAYMENTS_PROVIDER=mock` on a preview/second service only
(never mock on the production service); compat PDF download; `/api/keepalive` with the bearer 200,
without 401; `check-unruled-copy --strict` green in the Render build log; memory in the Render
metrics after a PDF build (512 MB is the risk line — if the instance restarts or swaps on
`renderToBuffer`, move to the next size before cutover, not after). Write the artifact
`docs/qa/<date>-render-acceptance.md` with the instrument's table and the walk results. Cowork reads
it; Reyner cuts DNS over.

## Commit 5 — after cutover, after the 7-day window (a separate PR)
Remove the `VERCEL_ENV` fallback in `lib/env.js`; delete `vercel.json`; update `.env.example`,
`CLAUDE.md` STACK line (Vercel → Render), `docs/PROGRESS.md` INTERIM REGISTER row → CLOSED with the
cutover date; `NEXT.md` pointer. Reyner removes the domain from Vercel and deletes the project.

## NOT IN THIS PROMPT
No DOKU (Prompt V; webhook URLs are on `katon.app`, so they follow DNS). No Stage 6 or prompt change.
No `?dari`. No design. No byte cache. No second provider. No changes to the reading, the card or the
PDF. If Render's free/preview behaviour differs from what is written here, STOP and report — the
dashboard is the source of truth, not this file.

## Cost, so it is on record
USD 7 (web) + USD 1 (cron) = ~USD 8/month, against Vercel Pro USD 20 as the resolve-in-place
alternative the register row names. Not a decision — Reyner made it 2026-09-05 — a record.
