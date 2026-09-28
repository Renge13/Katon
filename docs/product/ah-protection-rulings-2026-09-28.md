# Abuse-protection rulings, 2026-09-28 (Reyner; Cowork's technical rulings)
STATUS: RULED. Reyner's words below are verbatim from Prompt AJ amendment 1
(`docs/prompts/AJ-amendment-1-reyner-rulings.md`) and amendment 2
(`docs/prompts/AJ-amendment-2-botid.md`), both 2026-09-28. They answer AH Part 1
(`docs/prompts/AH-free-mirror-protection-and-compat-cta.md`). AH Part 2 builds from this file.
The evidence is Prompt AF (`docs/qa/2026-09-26-architecture-cost.md`, Q10-Q12) and the AH Part 1 report.

## Reyner, verbatim
```
5. Keep 1,500 calls/day
6. Add Turnstile at create-reading only
7. Keep fallback text when budget is exhausted
```
And later the same day, replacing 6:
```
Switch ruling #6 to Vercel BotID Basic. Use it only on the create-reading/AI-generation route. Keep Deep Analysis out for now.
```

## What each ruling means (keyed, so none is ambiguous)
- **5. Daily writer cap** stays at 1,500 calls (`DAILY_ATTEMPT_CEILING`, `lib/render/config.js`).
- **6. Bot check - RULED TWICE, the second ruling is in force.**
  - *First (2026-09-28):* Cloudflare Turnstile on the create-reading step only; never on the permalink,
    the result page, a paid page or a PDF.
  - *Replaced the same day:* **Vercel BotID Basic**, because there is no Cloudflare account and the stack
    is GitHub, Supabase, Vercel and DOKU. BotID Basic is free on all plans, invisible, and needs no new
    account or keys (https://vercel.com/docs/botid, read 2026-09-28).
  - *Scope (Cowork):* every request that creates a NEW reading and can start a writer call without
    payment - the free Mirror create, plus any pair create that renders before payment. NOT the
    permalink or result-page GET, the paid pages, the PDFs, the DOKU notify route, or the serve-time
    re-render of an existing reading.
  - *Basic only.* **Never call Deep Analysis**, which is a Pro-plan charge.
- **7. Budget exhausted:** the reader gets today's fallback (floor) reading, with no new copy.

## Cowork's technical rulings (AJ; invisible, so not Reyner's)
- **A paying reader is never floored because free traffic used the budget.** Paid renders get their own
  bound, separate from the free daily cap.
- **The per-IP daily cap on new readings is sized as a share of the global cap**, so one setting covers
  both "no single actor exhausts it" and "it scales when the cap changes".
- ~~**The reserve slice ships only if AJ §5.1 shows it survives IP rotation.** Otherwise it leaves the plan.~~
  **DROPPED 2026-09-28 (Prompt AK §3.5).** AJ §5.1 showed it does not survive rotation: it was reserved for
  "actors with fewer than 3 new readings today", and a rotating-IP script makes 1-2 per IP, so every IP
  qualifies and the reserve drains like the rest. The per-IP daily cap (100 new readings per IP per day,
  `mirror_create_daily` in `lib/ratelimit.js`) handles a single heavy IP, and BotID Basic on
  `POST /api/mirror` handles the rotating one.

## Reyner, 2026-09-28, second set (Prompt AK amendment 1), verbatim
```
3. Penyeimbang Unsur: proceed with AK §2 measurement only. No engine change until we see how many compatibility pairs actually change.
4. Separate paid AI budget: approve.
5. Complete Edition fallback: must be fixed before launch. If the saved Mirror is fallback text, the paid flow must generate a full reading before rendering the paid PDF.
6. Per-IP 100/day + BotID on `/api/mirror`: approve as the abuse-protection layer.
```
Keyed (Cowork, AK amendment 1):
- **3. Penyeimbang Unsur:** AK §2 measures the candidate meaning ("X membawa E" only when the supplier holds
  MORE of E than the receiver); no engine, glossary or check change until the counts are read.
- **4. Separate paid AI budget:** approves AK §3.1 - a render for a PAID reading (a paid pair, or the Mirror
  of a token with a paid Complete Edition) draws on its own daily counter, a runaway guard of 500 calls;
  the free cap stays at 1,500 (ruling 5).
- **5. Complete Edition fallback, BEFORE LAUNCH:** AK §3.6 - if the saved Mirror is missing or is the
  floor, the paid flow renders a full reading (from the paid budget) before the PDF is built, and warms it
  at settle. The PDF never prints floor prose.
- **6. Per-IP 100/day + BotID on `/api/mirror`:** approves AK §3.2 and §3.3 as the abuse-protection layer.

## Reyner, 2026-09-28, third set (Prompt AL), verbatim
```
1. Yes. Remove "Mungkin menarik" mechanically as proposed.
2. Yes. Adopt the stricter Penyeimbang Unsur rule.
3. Yes. Hide "Unduh PDF" until the reading is ready, using the existing Compatibility pattern.
4. Yes to #161–#165. Merge #161 before #165.
```
Keyed (Cowork, Prompt AL):
- **1** is a voice ruling and is recorded as B35 in `docs/content/voice-constraint-rulings-2026-09-26.md`.
- **2. Penyeimbang Unsur, ADOPTED.** Replaces the measurement-only limit of ruling 3 above. `supplyFor`
  (`lib/compat/complementarity.js`) names "X membawa elemen E" only when the supplier holds MORE of E than
  the receiver; an element the supplier holds less of, or the same amount of, is skipped. The walk is
  unchanged: the receiver's favourable list, scarcest first. A direction where no element qualifies
  carries no Penyeimbang fact. This is the candidate AK §2 measured.
- **3. Complete Edition PDF before it is ready:** the Complete Edition page hides "Unduh PDF" until the
  reading is ready, reusing the Compatibility report's existing mechanism and states. No new copy: if the
  Compatibility waiting-state text does not read correctly for a Complete Edition, the work stops and the
  copy goes to Reyner.
- **4** is the merge order for PRs #161-#165 (Prompt AL §0). Executed 2026-09-28.
