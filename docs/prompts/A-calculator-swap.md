<!--
STATUS: HANDOVER — Claude Code build prompt. PROMPT A. Run this FIRST.
Full reasoning behind every instruction: KATON-calculator-decision.md
Sequence: A (this) -> commit Phase 1 -> B (regression lock) -> C (strength engine)
-->

# Prompt A — swap the calculator to tyme4ts

## WHY THIS IS FIRST

Phase 1 currently runs on a hand-rolled calculator that passed 12 dates. That proves 12 dates, not
the ~1,212 solar-term boundaries a real user base will hit. The strength engine's heaviest factor,
得令, reads the Month Branch — which is exactly what those boundaries determine. Building the engine
on an unproven calculator bakes a latent bug into the accuracy core.

Measured across all 1,212 節 boundaries 1930–2030: sxtwl (C++), tyme4ts (TS) and astronomy-engine
(independent ephemeris) have **zero day-level disagreements**. tyme4ts is the same 寿星天文历 engine as
sxtwl, in pure TypeScript, MIT, zero deps, 0.72 ms/chart.

---

## PASTE BELOW THIS LINE

Replace the hand-rolled BaZi pillar calculator with tyme4ts. Accuracy is the hard constraint here.
Do not take shortcuts and do not preserve the old code as a fallback.

**1.** `npm i tyme4ts` (MIT, zero deps, pure TS).

**2.** Create `lib/bazi/pillars.ts`. Single exported function:

```ts
computePillars({ date, time, tz }): {
  year:  { stem, branch },
  month: { stem, branch },
  day:   { stem, branch },
  hour:  { stem, branch } | null,
  boundaryFlag: boolean,
  boundaryReason?: string
}
```

Requirements:

- Set `LunarHour.provider = new LunarSect2EightCharProvider()` **once at module scope**. This is the
  流派2 / 晚子時 convention and it is REQUIRED. The default provider rolls the day at 23:00 and fails
  validation chart 7 (1993-06-12 23:30), which must yield day **甲子** and hour **丙子**, not day 乙丑.

- Derive pillars via `SolarTime.fromYmdHms(...).getLunarHour().getEightChar()` and read
  `.getYear() / .getMonth() / .getDay() / .getHour()`.

- **TIME CONVENTION (locked, matches the validation oracle): use the entered local wall-clock time
  DIRECTLY.** Do NOT convert to UTC. Do NOT resolve an IANA timezone. Do NOT apply True Solar Time or
  longitude correction. Joey Yap's plotter has no city field and no timezone field and therefore
  applies neither; matching it is the requirement. Pass raw Y/M/D/h/m to `SolarTime.fromYmdHms` and
  let tyme4ts's +08-frame solar-term table govern.

- Accept an optional `tz` field on the input type, persist it, and leave it **UNUSED** by the
  calculation. It exists so the convention can be revisited without re-collecting user data. Add a
  comment saying exactly that.

- `time: null` must produce `hour: null` and must NOT default to midnight.

- Set `boundaryFlag = true` if the birth instant is within ±2 minutes of the governing 節 (month
  boundary) or within ±2 minutes of a 時辰 edge. Include the reason string.

**3. WARNING — do not get this wrong.** tyme4ts's `getJulianDay().getDay()` returns a **UTC+8-based**
Julian Day, not UT-based. Do not do your own JD arithmetic unless you first assert against known
values. Add these asserts to the test file:

```
立春 1989 = 1989-02-04 04:27 (+08)
白露 1989 = 1989-09-07 23:53 (+08)
```

An 8-hour delta here means the UTC+8-based Julian Day was double-shifted, and it will silently flip
month branches.

**4.** DELETE `lib/bazi/calculator.js` entirely. Update `lib/bazi/computeChart.js` to call
`computePillars`. Do NOT touch `tenGods.js` or `mainProfile.js`.

**5.** Add `tests/time-convention.spec.ts` — a LOCK, not a timezone layer. It must prove the engine
does NO time conversion, because conversion would break oracle parity:

```
1989-02-04 04:00 -> 戊辰 乙丑 乙未 戊寅   (立春 1989 = 04:27 +08; naive keeps the prior year)
1989-09-07 23:30 -> 己巳 壬申 庚午 戊子   (白露 1989 = 23:53 +08; naive keeps 申 month)
1993-06-12 23:30 -> 癸酉 戊午 甲子 丙子   (晚子時 / 流派2 provider)
```

If any of these shift by an hour, someone has reintroduced timezone conversion. Comment the file with
why: Joey Yap's plotter has no city or timezone field, so Katon must not convert either.

**6.** Run `tests/bazi-engine.report.mjs`. Expected: pillars 12/12, Ten Gods 12/12, Track A profile
**7/12**, no-hour stability 12/12.

**7/12 on Track A is CORRECT** — it is the intended divergence from Joey's proprietary two-source
tiebreak. Katon uses month-branch structural profile only. Do NOT "fix" it.

Report the before/after table.

---

## THEN: commit Phase 1

```
feat(bazi): replace hand-rolled calculator with tyme4ts + Phase 1 engine

- lib/bazi/pillars.ts (tyme4ts, 流派2 provider, naive local wall-clock)
- lib/bazi/tenGods.js, mainProfile.js, computeChart.js
- tests/bazi-validation.fixture.js (13 charts), bazi-engine.report.mjs
- tests/time-convention.spec.ts
- removes lib/bazi/calculator.js

Validation: pillars 12/12, Ten Gods 12/12, Track A 7/12 (intended divergence —
Katon uses month-branch structural profile, not Joey's proprietary two-source
tiebreak), no-hour stability 12/12.
```

No renderer work and no strength code in this PR.

---

## FIXTURE — 13 charts

Rows 1–12 are in `KATON-engine-session-state.md`. Row 13, added 2026-07-30 from a Joey PDF:

```
13  1989-02-04 04:00 | 乙 | 丑 | 比肩 | Managers | Friend80/Phil80/Dir78/Pio72
```

Boundary chart, and a fourth confirmed instance of the intended Katon-vs-Joey divergence — 丑 hides
辛己癸, so there is no 比肩 anywhere in the month branch and no month-rooting rule can emit Joey's headline.
