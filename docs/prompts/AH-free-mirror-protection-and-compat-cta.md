# Prompt AH: free-mirror abuse protection + the Mirror → Compatibility CTA (Cowork, 2026-09-26)
**Run after AG.** Rulings: `docs/product/product-boundary-rulings-2026-09-26.md`, items 3, 6 and 7. Evidence: `docs/qa/2026-09-26-architecture-cost.md`, Q10 to Q12.
**Part 1 is answered and RULED (2026-09-28):** `docs/product/ah-protection-rulings-2026-09-28.md`. Part 2 builds from that file; its bot check is Vercel BotID Basic, not Turnstile.
**Principle (Reyner):** abuse protection, never a worse free product. The free Mirror stays the whole reading.
**Rule 9:** anything a reader can SEE (copy, a bot check, what she gets when the budget runs out) is Reyner's to rule. Everything invisible is Cowork's and yours.

## Part 1: step 0, report and propose (read-only; answer before building)
1. **Budget exhaustion today.** When `render_attempts_daily` is exhausted, what exactly does an uncached reader get (the floor?), on which screen, and for how long? Quote the code.
2. **One actor's reach.** Today, how much of the daily budget can one IP take, and how much can a cookie-dropping script take? Use the numbers in `lib/ratelimit.js` and `config.js`.
3. **Ceiling sizing.** Given the measured cost per uncached reading (v1 Rp 114; v2 plus Flash-lite judge around Rp 95, with a worst case of Rp 202), tabulate daily readings and daily Rp spend for three ceilings, so Reyner can pick a daily spend cap in Rp.
4. **Options for these invisible levers.** For each, give one line on the trade-off and your pick:
   - a per-IP and per-session daily cap on UNCACHED renders (cache hits stay free and unlimited);
   - a per-actor share of the global budget, so no single actor can exhaust it;
   - a reserve slice of the budget that only low-volume actors can use.
5. **Options for the VISIBLE levers,** for Reyner to rule:
   - (a) a bot check (for example an invisible or managed Turnstile), and when it would ever show;
   - (b) what a genuine reader gets when the budget is out. Candidates: today's floor; the chart now with the reading's skeleton and an automatic retry after the reset; or a "come back later" message on her permanent link.

   Describe what she sees under each option. Write no copy.

**STOP after Part 1.** Cowork turns it into rulings for Reyner.

## Part 2: build (after the Part 1 rulings)
- The invisible levers as ruled. Each ships alone, with a version bump where it changes a gate or limit, and a test shown red first.
- **Instruments:**
  - a simulated scripted actor, which must hit its cap while a second actor still renders;
  - the ceiling-exhaustion path, which must show the ruled behaviour.

## Part 3: the Mirror → Compatibility CTA (ruling 3)
- **Placement:** on the Mirror result page at the curiosity moment, after the reading's closing paragraph. It is visible only when `checkoutOpen()`.
  - Not in a grid.
  - Not next to the CE offer. The CE stays at the keep/share moment, by the card.
  - One live purchase CTA per moment.
- **Copy:** a new copy slot, left unruled (the repo's PENDING / `check:unruled` mechanism). Reyner writes it. Do not draft it.
- **Friction:** report whether the compatibility flow can start with person A pre-filled from the current reading (`pair.a_reading_id` exists), so she enters only the other person. If it can, wire it. If it needs new work, report its size first.
- **Measurement:** funnel events for the CTA being seen and clicked, keyed so a compatibility purchase can be traced back to the Mirror that led to it (AF Q12 found pair events keyed by pair id only). Report the event names.
- **Tests:**
  - The CTA is absent when sales are closed and present when they are open.
  - It never renders in the same moment as the CE offer.

## Unchanged
- The free reading's content.
- The CE contents.
- `lib/voice.js:19`.
- No Pro model anywhere.
