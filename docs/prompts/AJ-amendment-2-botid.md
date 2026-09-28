# Prompt AJ, amendment 2: ruling 6 changed to Vercel BotID Basic (Cowork, 2026-09-28)
Untracked in the working tree as `docs/prompts/AJ-amendment-2-botid.md`. Commit it with the rulings record.

## Reyner, 2026-09-28, verbatim
```
Switch ruling #6 to Vercel BotID Basic. Use it only on the create-reading/AI-generation route. Keep Deep Analysis out for now.
```
**Why:** there is no Cloudflare account, and the stack is GitHub, Supabase, Vercel and DOKU. BotID Basic is "provided free of charge for all plans", invisible, and needs no new account or keys (https://vercel.com/docs/botid, read 2026-09-28).

**Keyed referent (Cowork):**
- "the create-reading/AI-generation route" means every request that creates a NEW reading and can start a writer call without payment: the free Mirror create, plus any pair create that renders before payment.
- It does NOT cover the permalink or result page GET, the paid pages, the PDFs, the DOKU notify route, or the serve-time re-render of an existing reading.
- Basic only. **Never call Deep Analysis**, which is a Pro-plan charge.

## What changes
- **Rulings record.** In `docs/product/ah-protection-rulings-2026-09-28.md` (AJ amendment 1), ruling 6 records BOTH the original Turnstile ruling and this change, verbatim and dated. The file must not read as if Turnstile was never ruled. If that PR has already merged, make this a follow-up docs commit to main that quotes the changed lines. Reyner pre-approves it on green CI.
- **AH Part 2 (not started)** uses BotID Basic, not Turnstile. There is nothing to wire now and no keys.

## One report item, added to AJ §5 (report only)
Which route(s) today create a new reading and can start a writer call without payment? Quote the path and the handler line for each. Cowork scopes BotID from your list, not from memory.
