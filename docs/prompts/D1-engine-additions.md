<!--
STATUS: HANDOVER — first prompt after the strength engine. Created 2026-08-01.
Three small additions, all decided. Then Stage 3 (D2) is the next big piece.
-->

# D1 — three engine additions, then stop

Small, independent, all ruled on. Do them in any order. Separate commits.

**Before you start: rule 4 applies to me as well.** I am asserting BaZi tables below and I have got
three wrong already this build (the 子 hidden stem, 旺相休囚死 vs 十二長生, and Oracle 3's blindness to
within-pair order). **Verify every table here against a second source before implementing.** If a
source disagrees, stop and report rather than picking one.

---

## 1. 刑 (Punishment) — self-punishment and full trine ONLY

### The ruling and why

刑 is the **only mechanic in the whole set that describes self-inflicted friction.** Everything else is
either something that comes at you (Officer pressure, Clash, Harm) or something you carry (badges).
自刑 is a configuration that turns on itself. That is a distinct emotional register and it is highly
recognisable to a reader.

**Frequency, measured across the 13 fixture charts:**

```
counting partial trines:   7/13  = 54%   -> too common, becomes noise
自刑 (self) only:           4/13  = 31%   -> scarce and meaningful
full 三刑:                  0/13         -> rare, special when it appears
```

**Count 自刑 and FULL 三刑. Do not count partial trines.** Two of three branches present is not a
punishment for our purposes. Including partials pushes it to 54% and it stops carrying information.

### The table — VERIFY THIS

```
自刑  self-punishment, a branch repeated:   辰辰   午午   酉酉   亥亥
三刑  full trine, all three present:        寅巳申   丑戌未
相刑  mutual pair:                          子卯
```

Notes for verification:
- The 自刑 set is 辰午酉亥. Other branches repeated are NOT self-punishment.
- 寅巳申 and 丑戌未 must be **complete**. Two of three is excluded by the ruling above.
- 子卯 is a pair, not a partial trine, so it counts. It appears in 0 of 13 fixture charts, so it is rare.
- Do not confuse 刑 with 害 (Harm, already implemented) or 破 (Break, deliberately excluded).

### Output shape

Add to the branch-relation output alongside the existing combine/trine/clash/harm:

```ts
punishment: { type: 'self' | 'trine' | 'pair', branches: string[] }[]
```

Empty array when none. Glossary entry: I will add `刑` to `relasi_cabang` once you confirm the table.

### What NOT to do
Do not add 破 (Break). It is real and rarely load-bearing, and every added mechanic costs surface area.

---

## 2. Life Palace (命宮) and Conception Palace (胎元) — DISPLAY ONLY

### The ruling

Both appear on **every** Joey chart, in the "Personal Chart Details" block. A user who cross-checks
will notice their absence, and legitimacy is the point of that block.

**But compute and print only. No interpretation, no glossary entry, no hierarchy score, no reading
fact.** Two reasons:

- **Life Palace needs the birth hour.** It is blank for every user who does not know their time, which
  the season-gate work established is a large slice. A field that is empty for a third of users is bad
  reading material.
- They are effectively a fifth and sixth pillar. Interpreting them means new Ten Gods, new palace
  meanings, a whole new surface — and most modern practice barely uses them.

### Output shape

```ts
lifePalace:       { stem, branch, animal } | null   // null when hour unknown
conceptionPalace: { stem, branch, animal }          // derivable from the month pillar alone
```

Print on the chart sheet with a plain Indonesian label and the animal name, the way the four pillars
already are. Nothing more.

### VERIFY the derivation
命宮 and 胎元 both have standard formulas, and 命宮 in particular has more than one convention in
circulation. **Find the derivation, check it against Joey's printed output for the fixture charts, and
report which convention matches.** We have his values for chart 1: `命宮 丁卯 Fire Rabbit`,
`胎元 甲子 Wood Rat`. That is a direct test — if your formula does not reproduce those two, it is the
wrong convention.

---

## 3. Gender field — ADD IT

### Why

Reyner's ruling: build for both genders. Men go to oracles for business readings, and the audience is
not women-only.

**Gender affects exactly one thing: luck pillar direction.** Forward for yang-year males and yin-year
females; reverse otherwise. It does **not** affect the natal chart, Ten Gods, strength, badges,
palaces, or compatibility — all of those read the natal chart only.

### Output shape

```ts
computePillars({ date, time, tz, gender })   // gender: 'male' | 'female'
```

- **Optional, defaulting to null.** The natal mirror does not need it, so do not make it required and
  do not add a form field to the current funnel.
- Persist it on the reading row so it does not have to be re-collected later.
- Luck pillar direction is the only consumer. If tyme4ts exposes a gender-aware fortune/luck-pillar
  API, use it rather than deriving the direction by hand.

### Note for later, not now
Every chart in `joey-bars-13.json` was collected with Joey set to **MALE**. That is fine — natal bars
are gender-independent. But the **annual reading** and the **luck-pillar map** (products 2 and 5 in
`product/paid-product-map.md`) both read luck pillars, so when those are built the fixture will need
female-set charts to validate against. Record that in PROGRESS.md rather than acting on it.

---

## THEN STOP

Do not start Stage 3. It is the next big piece and it gets its own prompt (D2) once these three land
and the fact inventory is settled.

Report in the usual shape. For each of the three tables above, say which source you verified it
against.
