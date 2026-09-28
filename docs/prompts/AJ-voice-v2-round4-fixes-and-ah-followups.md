# Prompt AJ: round-4 fixes and AH Part 1 follow-ups (Cowork, 2026-09-28)
Untracked in the working tree as `docs/prompts/AJ-voice-v2-round4-fixes-and-ah-followups.md`. Not durable until you commit it, so commit it with the first change below.

Cite the four checks before acting. Two-round cap. Never write a regex through a shell heredoc. Every change ships alone, is shown red first, and gets its own version bump where a gate or render path changes.

## Cowork's verification of your round-4 report (so you know what is already settled)
- I read the round-4 PDFs myself (the text of all seven, page 2 as an image for chart13 and PZ0t). They are real renders, not floors. Your three visible findings are confirmed.
- In chart13, the dash that looks lost in `pdftotext` ("ritme ini situasi") is present on the page ("ritme ini -" at a line end). It's an extraction artifact, not a defect.
- **x-forwarded-for is settled.** Vercel's docs say it overwrites `X-Forwarded-For` "to prevent IP spoofing" (https://vercel.com/docs/headers/request-headers), and `lib/ratelimit.js:265-276` already says so and reads it. No action.

## §0. Only once Reyner says "merge"
1. Before #157 merges, add one docs commit to it: a **DEFERRED REGISTER** row in PROGRESS for the seed-S2 named-pillar relation check.
   - Parked by Cowork (AG item 2): 0 true positives, 3 of 6 pair sentences misfired.
   - Unguarded: a pair sentence naming a specific non-day pillar relation between the two charts, beyond what 1.40.0's seat check covers.
   - What would close it: a check that reads a negated relation ("tanpa daya tarik atau gesekan") as a negation, re-measured on the stored pair texts.
   - Quote the row in the PR.
2. Squash-merge #155, then #157.
3. Merge main into `feat/voice-v2` (merge, don't rebase), then run the suite and replay.

## §1. main: the PDF routes re-check cached readings
You reported that both PDF routes print a cached reading without re-checking it. Use the same re-gate-and-invalidate that #155 added to the page path, with no second implementation.
- **Red first:** plant the 2026-09-08 g4WH4 paid row and request the PDF before the page. The old code prints "Dia membawa elemen air".
- **Green:** the PDF never prints a hard-failing reading.
- Say what the reader gets on that first PDF request (floor PDF, or a re-render).
- Follow #155's versioning convention.
- Customer gets: a paid PDF can never print a false engine fact.

## §2. feat/voice-v2: the pair opening appears twice. Remove the cause.
The engine owns `p0_opening` and prepends it (`lib/render/pairOpening.js`), yet the writer can still copy it. Cowork's ruling: **the v2 pair writer is never handed the `p0_opening` text.** Take it out of the facts, required points and anything else in the v2 pair payload. Keep `withEngineOpening`'s strip as the backstop.
- **Red first:**
  - A test that the built v2 pair prompt contains no `p0_opening` text.
  - A stub writer that restates every fact it is given produces exactly one opening sentence in the served reading.
- **Measure (about $0.008):** re-render PZ0t and rVe4ca only. Report whether block 1 now opens with a model-written intro instead (grep "Ini adalah bacaan" and "Bacaan ini"). Quote block 1 of each.
- **v1, report only:** count the stored v1 pair drafts where the opening sentence appears twice.
  - If the count is above zero, the same cause removal goes to main as its own PR.
  - If the v1 prompt requires the model to write the opening, say so and stop. Don't guess.

## §3. feat/voice-v2: no nested brackets
chart13 served "Sebagai Kayu (Bambu (The Bamboo))" and chart8 served "Sebagai Logam (Besi Tempa (The Forge))". Cowork's ruling for `bracketArchetypes` (`lib/validate/v2.js`):
- **Never insert the English bracket on an archetype mention that is already inside parentheses.** Insert it on the first bare prose mention.
- If there is no bare mention, insert nothing: the cover already shows the English name.
- **Red first:** use those two served strings verbatim, taken from the round-4 JSON files, not retyped.
- Unit tests are enough here, with no re-render. Bump the version.

## §4. Engine truth, report only (no change; a BaZi rule needs a second source first)
1. **rVe4ca, Penyeimbang Unsur.** The table says Kamu: Air, Dia: Api. The v2 text says "Dia membawa elemen Api yang kamu butuhkan, sementara kamu membawa elemen Air yang ia butuhkan".
   - The Sebaran Unsur on the same PDF shows A with Air 1.3 and Api 11.3, and B with Air 5 and Api 7.5. On that spread, A seems to "bring" the element A barely has.
   - In PZ0t the same columns read the other way: A has Air 37.5, and B brings Kayu, which A has 0 of.
   - Quote the engine code that picks these elements, print the inputs it used for both pairs, and state what each column means ("brings" or "lacks").
   - If the engine and the prose disagree, or the engine disagrees with itself across the two pairs, stop and report. Also say whether 1.39.0 checks against the same interpretation.
2. **chart4:** "Kapasitas energimu tergolong Lemah karena kamu lahir di bulan Ular yang didominasi elemen Api." Does the engine's strength come from the month? Quote the code. If it doesn't, this is an invented cause. Report only.

## §5. AH Part 1 follow-ups (report only, one round, then STOP)
1. **Reserve slice.** It is reserved for "actors with fewer than 3 new readings today". A rotating-IP script makes 1–2 readings per IP, so every IP qualifies. Show how the reserve survives that attack. If it can't, say so, and it leaves the plan. The per-IP daily cap already handles a single heavy IP.
2. **Paid renders vs the daily cap.** Does a paid Complete Edition or Compat render draw from the same 1,500-call cap as free Mirrors? Quote the code.
   - Cowork's ruling for AH Part 2: **a paying reader never gets the floor because free traffic used the budget.** Paid renders get their own bound.
   - Report only now.
3. **Alerting.** Is anything notified when the cap is hit? Quote the code, or say there is none.

AH Part 2 waits for Reyner's visible rulings (cap in Rp, bot check, what a reader gets when the budget is out). Cowork will send them as a rulings file.

## Report format
Per item: commits, red-first proof, test or replay output, and what the customer gets. End with the split: what Reyner does, and what waits.
