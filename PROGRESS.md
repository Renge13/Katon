# PROGRESS — Claude Design "Sunyi" redesign

Session-resume file for the Katon UI/UX redesign implementation.

## Branch / PR
- **Branch:** `redesign/claude-design-sunyi` (own branch, own PR — SEPARATE from content PR #3).
- Based off `content/hubungan-20cells` tip (`0fa4936`) because `main` is 7 commits stale
  and lacks the whole app. **Zero commits land on the content branch.**
- Design source: `Katon Design System/ui_kits/katon-app/` ("Sunyi") + `tokens/*.css`.
  The older reverse-engineered direction (`katon-reading/`, formal `components/`,
  Cinzel/7-chapter `readme.md`, old archetype names) is deliberately NOT used.

## Spec decisions (locked this session)
- **Free chart boundary:** the chart (Four Pillars + element composition) renders in the
  FREE reading with NEUTRAL descriptive labels + neutral DATA only. All
  interpretive/prescriptive copy stays paid. (To be written into CLAUDE.md.)
  - Element bars: `pct` only (max-normalized width). The raw weighted `value` is DROPPED
    from the payload so counts never reach the client. (Gate 1 · option A + C.)
  - Element glosses (describe the element, not the person): Kayu "tumbuh dan menjangkau",
    Api "menyala dan menghangatkan", Bumi "menopang dan menampung", Logam "memadat dan
    menajam", Air "mengalir dan meresap". Badges: "Paling kuat" / "Paling tipis".
- **Sharecard:** dark element-tinted "sanctuary" poster, keeps existing data
  (`modifier, dimension, feed/drain`). Per-archetype distinction = element tint (5) +
  unique Day Master glyph (10) + polarity layout split (Yin/Yang) + per-archetype copy.
  Glyph opacity raised for thumbnail legibility. NO emoji pictograph (cheapens register;
  if ever needed post-launch, a custom drawn mark, never emoji). (Gate 3.)

## Paywall conversion-mechanics change (Gate 4 — deliberate)
- The old teaser→offer DOUBLE-TAP is collapsed into ONE sanctuary card (price shown WITH
  the teaser), matching CLAUDE.md ("price shown with teaser; ask WA only after Buka/Bayar")
  and the Sunyi design. Logged here so a post-launch conversion dip is diagnosable as this
  change, not content.
- Register rule held: the transition line into the paywall must NOT use the banned
  "ada satu hal yang [luput/jarang/kamu sadari]" skeleton or any variant.

## Content flag (NOT a launch blocker — for founder to revisit post-launch)
- **Balanced sameness cluster:** Jati (甲) and Matahari (丙) Balanced body copy read as the
  same wound — "the steady one everyone leans on, but who holds you?" — same arc, same
  closing question. Known drift of Matahari/Gunung/Jati onto the "unsupported strong-one"
  core. The sharecard puts them side by side for the first time, which is where the drift
  shows. Cards observed exhibiting it so far: **甲 Jati, 丙 Matahari** (watch 戊 Gunung).
  Revisit the Balanced-state copy post-launch.

## Done (implementation complete, NOT yet committed)
- Backend free-chart payload (`lib/readingView.js`: `freeChartView`, `buildPillars`
  +polarity/isDayMaster, `buildElementBars` pct-only/no `value`; `app/api/reading/route.js`
  passthrough). CLAUDE.md updated with the free-chart boundary ruling.
- Fonts: Spectral + Hanken Grotesk via `next/font` (`app/layout.js`).
- `app/globals.css` rewritten: design tokens + motion keyframes + restyled form controls
  (birthday selects + WA/tel inputs). All legacy component classes removed.
- `components/kit.jsx` (Reveal, Eyebrow, Button, Rule, BalanceBar, PillarCell, Icon, elColor).
- `components/Sharecard.jsx` redesigned (dark element-tinted poster, glyph + polarity).
- `components/Funnel.jsx` fully re-skinned (Home, Anticipation, Reading, Paywall stages,
  Unlocking gleam, Unlocked). Preserved intact: server-gating, Xendit `/pay`, WA capture,
  `/full` polling, pending + invoice fallback, hour-enrichment door, PNG export, segera
  interest capture, real 7-beat paid content.
- Legacy CSS: Category A deleted directly; Category B removed via the globals rewrite.
- Cleanup: `Katon Design System/` gitignored + eslint-excluded.

## Verification (all green)
- Gate 2 re-grep AFTER rewrite: 0 references to the full legacy class set (only `k-*`
  motion classes remain).
- `npm run test:forge` → 4/4 pass (unlock-forging fails closed).
- `npm run build` → compiles clean, all routes, `/` = 16.1 kB.
- Server-gating intact: a real paid sentence is ABSENT from `.next/static` (client) and
  PRESENT only in `.next/server`. Client never imports `lib/content`.
- Visual walkthrough (Reyner 1989-09-13 / Hubungan, API mocked in-browser because the
  local Supabase insert 500s — see below): input → anticipation rings → reading (persona,
  FREE neutral pillars + bars with Paling kuat/tipis) → dark sharecard → bridge → collapsed
  sanctuary paywall → dark WA input → pending → unlocking gleam → unlocked (7 beats,
  dropcap, TOC, beat5 pillar recap + hour door, segera upsell).
- `npm run lint`: redesign files clean. 8 PRE-EXISTING errors remain in
  `scripts/build-content.mjs` (content-build script, untouched by this work) — not a
  redesign regression; leave for the content owner.

## Theming bug fix (element accent — single source of truth)
- **Bug:** the deep-read (Bacaan Mendalam) + paywall sanctuary surfaces hardcoded a
  water accent (`GLOW = '#6FA0AE'`, fixed teal gradient) and the dropcap color was
  hardcoded in CSS. So a non-Water chart rendered half-themed (e.g. Matahari: orange
  persona, blue-green deep-read).
- **Fix (token, not patch):** kit `elColor` (the single `EL` map) is the one source —
  extended with `label` + `bg` (sanctuary gradient) + exported `alpha`. Funnel sets
  `--el-*` CSS vars ONCE at the reading root (`themeVars`); every sanctuary surface,
  the dropcap, the gleam, and the deep-read shadow inset read those vars. Sharecard
  now imports `elColor`/`alpha` from kit too (removed its duplicate palette). Grep
  confirms NO hardcoded element colors remain outside kit. Gold accents stay
  universal by design (ritual/decision-rule/unlock seal).
- **Verified across 3 tints** (mocked API, full walkthrough each): Fire (Matahari,
  terracotta), Wood (Jati, green), Earth (Gunung, tan). Accent is consistent on every
  surface — persona → chart → sharecard → bridge → paywall → deep-read — and legible:
  each element's glow reads on its dark tinted canvas, body text is high-contrast.
  Earth (softest tan) still passes. `npm run build` clean after the refactor.
- Note: the preview screenshot tool couldn't capture var()-gradient dark surfaces at
  scroll>0 this session; verified via computed styles + tall-viewport / body-transform
  captures instead.

## Reference pattern (for the deferred lib/content/shared.js Tier 3 refactor)
The element-color drift was solved the correct way, and it generalizes: **one source
of truth, threaded as tokens, zero duplicates.** Concretely — the element palette
lives ONLY in kit's `EL` map (`elColor`); Funnel sets `--el-*` CSS vars once at the
reading root; every surface (incl. Sharecard, which imports `elColor` rather than
keeping its own palette) reads from there. Grep confirms no hardcoded element colors
outside kit. **The deferred `lib/content/shared.js` Tier 3 refactor is the same class
of problem (values hand-set per cell instead of flowing from one source) and wants
the same solution shape: define once, reference everywhere, grep to prove no
duplicates remain.**

## Shared blocker: deployment config on the stale `rena` Vercel project (gates #3 CI AND live e2e)
**CONFIRMED (dashboard-verified) cause of #3's red Vercel check:** NOT env, NOT a build
break. The Next.js build **succeeded** on Vercel (compiled, linted, generated all 6
pages, printed the route table). The failure is post-build project misconfig:
*"No Output Directory named 'dist' found after the Build completed."* The stale `rena`
project is set to expect `dist/` output, but this is a Next.js app → output is `.next/`.
So `0fa4936` compiles clean on Vercel's own infra — the content is fine; the red is a
project-config artifact.
- **Before e2e, fix deployment config** — either remove the `dist/` Output Directory
  override (let it default to `.next/`) / add a correct `vercel.json`, OR (cleaner) stand
  up a properly-named **Katon** Vercel project linked to the repo. This is the same
  project that will run the live Supabase + Xendit e2e, so it must be right regardless.
- **Also still required for e2e:** preview/prod env vars (`SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY`, `XENDIT_SECRET_KEY`, `XENDIT_WEBHOOK_TOKEN`,
  `NEXT_PUBLIC_BASE_URL`) — the same env behind the local `/api/reading` 500.
- Treat "deployment config (output dir + project) + env" as one shared task; fixing it
  clears #3 CI and unblocks e2e.
- **Lint debt (non-blocking):** the Next ESLint-plugin warning + the 8 pre-existing
  `scripts/build-content.mjs` lint errors surface on Vercel too. Build passes (scripts/
  isn't linted by `next build`); clean this up when next in the content pipeline.

## Known / open items
- **Local `/api/reading` 500:** the configured Supabase insert fails in this local env
  (env/DB issue, NOT a redesign regression — `createReading` and the insert row are
  unchanged, and the 500 precedes any redesign code). Full e2e needs a working Supabase +
  Xendit webhook; covered here via forge tests + mocked-API visual walkthrough.
- **Not committed yet.** Next step: commit on `redesign/claude-design-sunyi` and open its
  own PR (separate from content PR #3). Awaiting go.
- Post-launch: Balanced sameness copy revisit (see content flag above).
