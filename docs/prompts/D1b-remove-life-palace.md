<!--
STATUS: HANDOVER — reverses part of D1. Created 2026-08-01 after collecting 4 more Joey 命宮 values.
胎元 STAYS (5/5). 命宮 must be REMOVED until its convention is resolved.
-->

# D1b — remove 命宮. Your n=1 caveat was right.

You flagged 命宮 as resting on one Joey data point and said it should be re-checked. I collected four
more from his plotter. **The convention does not hold.**

## The data

```
 ch  lunarM  solarBr  hourBr   Joey    via solar-term   via lunar month
  1      8      酉       巳     丁卯     丁卯  OK          丁卯  OK
  2      2      寅       未     癸未     甲申  XX          癸未  OK
  3      3      辰       辰     己酉     己酉  OK          己酉  OK
  7      4      午       子     癸亥     癸亥  OK          甲子  XX
 10     12      寅       午     乙酉     乙酉  OK          丙戌  XX

 solar-term month branch (what tyme4ts getOwnSign does):  4/5
 lunar month number (the obvious alternative):             3/5
```

**Neither candidate formula reproduces Joey on all five charts.** So the shipped `命宮` value is wrong
on at least 1 in 5 charts, and we do not know which convention is right.

## Why this matters more than 4/5 sounds

The palace block exists **only** to be the legitimacy object — the thing a curious user cross-checks
against Joey's own output. A wrong value there is worse than an absent one:

- **Absent** reads as "they did not include that field."
- **Wrong** reads as "their calculation disagrees with Joey's," in the one place designed to prove it does not.

There is no interpretation riding on it (display only, by D1's own ruling), so removing it costs
nothing and eliminates a self-inflicted credibility hole.

## Why it is fragile by construction

Look at which three charts fail:

- **Chart 2** — lunar month 2 versus solar-term month 寅. A Chinese-New-Year / solar-term mismatch.
- **Chart 7** — the 晚子時 case (23:30). Which day's and which hour's branch feed the formula is itself
  a convention choice.
- **Chart 10** — the 立春 boundary, where the year stem is convention-dependent.

**命宮 consumes the year stem, the month AND the hour, so it compounds three separate convention
choices.** Every boundary ambiguity in the engine arrives in this one field simultaneously. That is why
it fails exactly on the charts that are already edge cases, and it is why "close enough" is not a
sensible target for it.

## THE RULING

**Remove 命宮 from the chart sheet and from the chart object.** Keep the code behind a flag if you want
it recoverable, but do not compute or display it.

**Keep 胎元.** It is 5/5 against Joey, triple-verified (Joey's value, tyme4ts `getFetalOrigin()`, and the
standard month-stem+1 / branch+3 formula computed independently), and it reads the month pillar only —
so it carries none of the compounding.

Update `tests/palaces.spec.mjs` accordingly: the 命宮 assertions become a **documented XFAIL** recording
the 4/5 and the three failing charts, so the finding is not lost and nobody re-adds it casually.

## To un-defer later

命宮 needs its convention settled against **10 or more** Joey values, deliberately including boundary
cases (a CNY/solar mismatch, a 晚子時 birth, a 立春 birth). Only then implement, and only then display.
Until that exists it stays out.

Joey's plotter requires sign-in; Reyner is logged in, so more values are collectable when this becomes
worth doing. It is not worth doing now — it is a display field with no interpretation attached.

## One more thing to record

Your finding about the `bazi-calculator` skill is now formalised. `CLAUDE.md` names it as
**not a valid source** for BaZi tables. Its 藏干 table still reads `子: 壬(100%)` — the exact error
`cb43bc7` corrected — it has no 刑 table, and it does not cover 命宮. The repo's own locked tests are the
authority now.
