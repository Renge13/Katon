<!--
STATUS: PROPOSAL. Written by Claude Code 2026-08-29 against Reyner's ruling of the same day.
NOT IMPLEMENTED. He ruled the SHAPE and asked for the MECHANISM to come back before any code lands.
Nothing in this file exists in the codebase yet. Do not treat it as a description of the system.
Register row: `docs/PROGRESS.md` deferred register, "PREVIEW DEPLOYMENTS CANNOT RENDER A READING".
-->

# Preview gets its own Gemini key, and its own small budget

## THE RULING THIS IMPLEMENTS (Reyner, 2026-08-29)

1. **Never expose the production credential to Preview.** A separate Preview key or project, so a
   leaked preview URL cannot spend against production.
2. **Preview needs an application-level request budget, deliberately small**, so ordinary preview
   testing cannot generate uncontrolled spend.
3. **The billing alert is a warning mechanism, not a spending control. Do not treat the alert as the
   cap.**
4. **Document the exact env-var/config separation and the mechanism that limits Preview requests.**

**And the standing refusal that shaped it:** do not reuse the production key because the API permits
it. Ticking "Preview" on `GEMINI_API_KEY` remains refused - preview URLs are guessable from the
branch name (`katon-git-<branch>-renge13s-projects.vercel.app`), so that is a spending credential
behind a guessable URL.

---

## THE THREE ENVIRONMENTS

| | Key | Renders | What it is for |
|---|---|---|---|
| **Local** | none, or a deliberately invalid one | **zero, by design** | Development, and the FREE failure-path test. `renderFenceReason()` returns null when `NODE_ENV !== 'production'`, so an invalid key walks the entire funnel through the floor at no cost - real routes, real page, no stubs |
| **Preview** | `GEMINI_API_KEY_PREVIEW`, dedicated, low quota | **limited real generations** | Verifying that a change actually renders, before it reaches production |
| **Production** | `GEMINI_API_KEY`, production project | normal | Serving readers |

**The local row is not a fallback, it is the first choice.** It already verifies seven of prompt Q's
eight events for free. Preview budget is spent only on the one thing local cannot show: that a real
provider call succeeds against a real deploy.

---

## THE ENV-VAR SEPARATION

Two variables, never one variable on three environments:

```
GEMINI_API_KEY            Vercel: Production ONLY   (unchanged, and it stays Production-only)
GEMINI_API_KEY_PREVIEW    Vercel: Preview ONLY      (new, a different key from a different project)
PREVIEW_RENDER_BUDGET     Vercel: Preview ONLY      (new, integer, default small — see below)
```

**A single resolver, so no call site chooses.** `lib/render/config.js` gains one function and every
provider call goes through it:

```js
// PROPOSED — not implemented.
export function renderKey() {
  if (process.env.VERCEL_ENV === 'preview') return process.env.GEMINI_API_KEY_PREVIEW || null;
  return process.env.GEMINI_API_KEY || null;
}
```

`VERCEL_ENV` is the discriminator, not `NODE_ENV`: a preview deploy is `NODE_ENV=production` and
`VERCEL_ENV=preview`, so `NODE_ENV` cannot tell them apart. **That is the single most likely
implementation bug in this whole change** — using `NODE_ENV` here would hand previews the production
key, which is the exact outcome the ruling forbids, and it would look correct locally.

**A preview must never be able to read `GEMINI_API_KEY`.** Vercel scopes variables per environment,
so the production key is simply absent from a preview runtime — the resolver's branch is a second
line of defence, not the first. Both are required: the scoping is what makes it true, the resolver is
what makes it *checkable*, and the test asserts the resolver never returns the production value under
`VERCEL_ENV=preview`.

`renderFenceReason()` and `geminiConfigured()` both move onto `renderKey()`, so a preview with no
preview key fails closed exactly as production does today.

---

## THE BUDGET MECHANISM

**Application-level, counted before the call, and it is a CAP rather than an alert.**

- Preview only. `PREVIEW_RENDER_BUDGET` is unset in production and the counter is not consulted
  there, so this cannot throttle a real reader.
- Counted in the **same `funnel_event` table prompt Q builds**, under a reserved event key, so this
  needs no second store and no new dependency. The counter is a row, not memory: **serverless
  instances do not share memory**, and an in-process counter would reset on every cold start and cap
  nothing. This is the same reasoning that made guard (b) insufficient on its own.
- The window is a **rolling 24 hours**, and the cap is deliberately small. **Proposed: 20 renders per
  day across all previews.** That is enough to verify a change several times over and far too few to
  matter financially if a preview URL leaks.
- **On exhaustion the render is REFUSED, not queued and not degraded silently.** It returns the
  existing `RenderRefused` with a new reason, `preview_budget_exhausted`, so the page serves the
  deterministic floor — which is a legitimate, ruled, production-grade output, not an error state.
  A developer who hits the cap sees the floor and the reason in the logs.
- **The cap is checked before the provider call, never after.** A post-hoc counter records spend it
  has already permitted.

**Why an application cap and not a Google-side quota.** A provider quota is a good second layer and
should also be set, but it is not sufficient alone: it is invisible to the app, its exhaustion
surfaces as an opaque 429 that the chain cannot distinguish from a transient one, and — per the
fence-validity row — a refused key and an invalid key produce the same silent state through the same
passing fence. An application counter is legible, testable, and can name its own reason.

**Why not the billing alert.** Ruled explicitly: an alert fires *after* the money is spent. It is a
warning mechanism. It is also, per that same register row's 2026-08-27 amendment, possibly watching
the wrong signal — there are third-party reports of prepayment-depleted 429s while the balance still
shows funds. **Neither of those makes it a control.**

---

## WHAT THIS CHANGES ABOUT VERIFICATION

Today, per the register row: local, then production **after** the merge, with no stage in between. A
verification plan that says "check it on the preview" cannot run.

With this, a preview can render a small number of readings, so **the reading, the card and the paid
path become checkable before merge**. That is the whole point of the change, and it is why it
matters more now than it did a week ago — prompt Q instruments the funnel, Card A is about to be
recomposed, and both want a stage between local and production.

**It does not remove the local invalid-key path.** That stays the default for anything a floor can
demonstrate, because it is free.

---

## WHAT MUST BE TRUE BEFORE THIS SHIPS

- [ ] **Reyner approves this mechanism.** It is a spend decision before it is an engineering one, and
      the ruling asked for the design to come back first.
- [ ] A second Gemini project/key exists, with its own provider-side quota as a second layer.
- [ ] `PREVIEW_RENDER_BUDGET` set on Preview only. The number is Reyner's.
- [ ] The resolver is tested: under `VERCEL_ENV=preview` it never returns the production value, and
      **the test is shown failing against a `NODE_ENV`-based implementation** — that is the bug this
      change is most likely to ship, so it is the assertion that has to exist.
- [ ] The cap is tested at the boundary: the Nth render proceeds, the N+1th refuses with
      `preview_budget_exhausted`, and production is unaffected with the variable unset.
- [ ] The register row is amended to describe what shipped, not what was proposed.
