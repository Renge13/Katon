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
- **The reserve slice ships only if AJ §5.1 shows it survives IP rotation.** Otherwise it leaves the plan.
