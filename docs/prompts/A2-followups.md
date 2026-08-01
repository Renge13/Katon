<!--
STATUS: HANDOVER — follow-ups on Prompt A, after commit 1bafff2. Created 2026-07-30.
Item 1 is a SPEC BUG I introduced in Prompt A. Items 2-4 are hygiene from the code report.
Do these before Prompt C. They are small.
-->

# Prompt A2 — follow-ups after the tyme4ts swap

## 1. SPLIT `boundaryFlag` — my spec was wrong

Your report: *"boundaryFlag fires on any on-the-hour odd-hour birth (09:00, 23:00 — chart 1 trips it
at '0 min after')."* You are right and the ±2 min hour rule as written is useless. 09:00 **is** the
巳時 edge, so effectively every user who types a round hour trips the flag. A flag that fires on the
majority of charts carries no information.

Worse, it conflates two completely different risks:

- **Solar-term boundary** → the MONTH pillar may be wrong. Serious. Affects 得令, the heaviest factor
  in the strength engine, and therefore the whole reading.
- **時辰 edge** → the HOUR pillar may be wrong. Much smaller, and usually caused by the user rounding
  their own birth time rather than by any calculation.

Replace the single boolean:

```ts
boundary: {
  solarTerm: { flagged: boolean, term?: string, minutesFrom?: number },
  hourEdge:  { flagged: boolean, minutesFrom?: number },
  timeLikelyRounded: boolean
}
```

Rules:

- `solarTerm.flagged` — birth within **±2 minutes** of the governing 節. Keep as is. This is the one
  that matters.
- `hourEdge.flagged` — birth within ±2 minutes of a 時辰 edge **AND** `timeLikelyRounded === false`.
- `timeLikelyRounded` — true when the minute is `00` or `30`. A user typing "09:00" almost certainly
  means "sekitar jam 9", not 09:00:00. Do not treat their rounding as astronomical precision.

Expected effect: chart 1 (09:00) stops flagging. Chart 13 (立春 day) keeps flagging, on `solarTerm`.

Keep a derived `boundaryFlag` getter equal to `solarTerm.flagged || hourEdge.flagged` so nothing
downstream breaks.

## 2. VERIFY `calculateBaziChart` OUTPUT, not just its shape

You moved chart assembly out of the deleted `calculator.js` into `buildChart.js`, and reported that
*"the `calculateBaziChart` shape is unchanged, so all consumers work untouched."*

Shape is not enough. `lib/chart.js` and `lib/readingView.js` are production paths that render to real
users, and the element-balance and harmony/clash logic moved files. **A silent value change there
would alter live readings with no test catching it.**

Add a one-off equivalence check: run the old `calculateBaziChart` (from git history at the parent of
`1bafff2`) and the new one over all 13 fixture charts plus ~50 random dates, and deep-diff the full
returned object. Report any key whose value differs. If everything matches, delete the script and say
so in the PR. If anything differs, that is the finding.

## 3. `pillars.ts` is outside ESLint

You flagged it: the flat config only globs `{js,jsx,mjs}`. The single most accuracy-critical file in
the repo is the one file with no lint coverage. Add `typescript-eslint` and extend the glob. Small
now, annoying later.

## 4. Dead code removal

`solarTerms.js` (35 KB), `scripts/generate-solar-terms.js`, and the `astronomia` devDep once
`test:bazi` is retired. You already dropped the re-export, which was the important part — a second
unvalidated source of truth for month boundaries is exactly the bug class this swap removed. Finish
the deletion so nobody resurrects it.

---

## 5. PRODUCT DECISION REQUIRED — 節-day births with no time

This is the real finding in your report and it is not a code issue.

Chart 13: born 1989-02-04, 立春 fires at **04:27 inside that day**. With no birth time the month
pillar is genuinely undetermined, and **no convention recovers it.** Probing noon is the correct
maximum-likelihood guess, but for a 04:00 birth it produces the wrong answer, and the user is never
told.

That is roughly **1 day in 30** of all birth dates, times the share of users who do not know their
birth time. Not an edge case at Indonesian scale.

Three options, Reyner decides:

| Option | Behaviour | Cost |
|---|---|---|
| **A** | Probe noon silently, as today | Some users get a wrong month pillar and never know |
| **B** | Detect the case and **ask for the birth time**, explaining that this specific date needs it | One extra input step, only for ~3% of users |
| **C** | Compute both branches and render only facts that hold under both | Safe, but the reading thins out badly |

**Recommendation: B.** It is the only option that is both accurate and honest, it triggers rarely, and
asking *"tanggal lahirmu tepat di pergantian musim, jadi jamnya menentukan"* is a **legitimacy moment**
rather than friction. It demonstrates the engine knows something a generic calculator does not.

---

## DECIDED 2026-07-30: option B, with two refinements. IMPLEMENT.

**Reyner:** *"sounds great and it does feel legitimate, and also gives the person a 'chosen' moment
where not everyone has that."*

**That framing is the spec.** This is not an apology for missing data. It is: *your birthday landed on
the day a season turned, and that makes your chart unusual.* Scarcity the user did not buy and cannot
fake. Write the copy that way — the ask for an hour is the consequence, never the headline.

**Refinement 1 (from the code report, accepted): fire it AFTER the anticipation pause, not at input.**
At the input step it reads as another form field before any value has been delivered — the
highest-friction point in the funnel. After the pause, the user has already committed and the message
lands as the engine knowing something. Correct call.

**Refinement 2 (from the code report, accepted): ask for the HOUR, not the minute.** The 時辰
(two-hour period) is 2h wide and the 節 falls at a single instant, so "pagi / siang / sore / malam" or
a bare hour resolves it. Much softer than "what time exactly were you born."

**Sizing, corrected by the code report:** not 3% of all users. It is the no-time users born on a
節 day *before* the 節 instant — roughly **1–2% of no-time users**. Still not an edge case at
Indonesian scale, and still silent today, which is the actual problem.

**Detection is free:** `boundary.solarTerm.flagged === true` with `minutesFrom` absent is exactly and
only this state. Pure UI branch, no engine work.

**Copy direction for Reyner (his register call):** lead with the rarity, not the request. Something in
the shape of *"tanggal lahirmu jatuh tepat di hari pergantian musim — ini cuma terjadi 12 hari dalam
setahun. Buat kamu, jam lahir menentukan bagan yang mana yang benar."* Then the four-option picker.
