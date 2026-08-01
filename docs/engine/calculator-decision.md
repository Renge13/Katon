<!--
STATUS: DECISION DOC — resolves the "OPEN BLOCKER — CALCULATOR" section of
        KATON-engine-session-state.md. Written 2026-07-29 after empirical measurement
        (not desk research). Supersedes "swap in sxtwl" as the action item.
-->

# Katon — Calculator Decision (resolves TODO #1a)

## VERDICT IN ONE PARAGRAPH

There is no maintained JS/WASM build of sxtwl, and **you don't need one**. `tyme4ts`
(6tail, MIT, zero deps, pure TypeScript, 1.1 MB, actively maintained — last publish
2026-06-12) is numerically the same 寿星天文历 engine as sxtwl. Measured over all 1,212
節 (month-starting solar term) boundaries from 1930–2030: **zero day-level
disagreements** between sxtwl 2.0.7 (C++), tyme4ts 1.5.2 (TS), and astronomy-engine
2.1.19 (independent VSOP87-class ephemeris). And the one fixture chart the hand-rolled
calculator "needed special handling" for turns out to be a **convention flag, not an
ephemeris error** — tyme4ts hits 12/12 on your validation table once the 流派2 provider
is set. Adopt tyme4ts as the runtime calculator; keep sxtwl and astronomy-engine as
CI-only oracles that generate a checked-in regression fixture. The real accuracy hole is
somewhere else entirely — see §4.

---

## 1. THE OPTIONS, MEASURED

| Option | Verdict | Why |
|---|---|---|
| **sxtwl via npm** | ✗ does not exist | Not on the npm registry. Confirmed. |
| **sxtwl → WASM (emscripten)** | ✗ reject | `sxtwl_cpp` exposes bindings via SWIG for Python/Lua/Java only. No JS target. You'd be maintaining a bespoke emscripten build — a hand-rolled *build* is the same class of risk as a hand-rolled *calculator*, plus WASM cold-start cost on Vercel for zero accuracy gain (see row 5). |
| **sxtwl via Python sidecar** | ✗ reject for runtime | Vercel Python functions + cross-runtime call for a 0.7 ms computation. Adds a failure mode and a cold start to buy nothing. **Keep it for CI only.** |
| **`tyme4ts` (6tail)** | ✓ **ADOPT** | MIT, zero deps, pure TS, 1.1 MB, active. Same ShouXing engine as sxtwl. 12/12 on your fixture. 0.72 ms/chart. Runs anywhere Node runs. |
| **`lunar-typescript` / `lunar-javascript` (6tail)** | ~ fallback | Same author, same engine (exports `ShouXingUtil` directly — confirms the lineage). Older API design; `tyme4ts` is the author's stated successor. Use only if tyme4ts has a blocking API gap. |
| **`astronomy-engine` (cosinekitty)** | ✓ **as oracle** | MIT, zero deps. `SearchSunLongitude(lon, …)` root-finds apparent geocentric solar longitude → derive 節氣 directly. **Genuinely independent** of the ShouXing lineage. This is your third oracle, not your runtime. |
| **HKO published solar-term tables** | ✓ **as spot-check** | hko.gov.hk, sourced from HM Nautical Almanac Office + USNO, in HKT (UTC+8). Human/institutional authority, not a port. Use for a ~20-row hand spot-check, not bulk. |

### Measured agreement — 1,212 節 boundaries, 1930–2030

```
sxtwl 2.0.7 (C++)  vs  tyme4ts 1.5.2 (TS)
  median |Δ| = 0.0016 s      max |Δ| = 24.5 s     >1 s: 186 / 1212
  DAY-LEVEL disagreements: 0

ShouXing lineage  vs  astronomy-engine (independent ephemeris)
  median |Δ| = 9 s           max |Δ| = 52 s       p99: 38 s
  DAY-LEVEL disagreements: 0
  HOUR-label disagreements: 5   (irrelevant — hour pillar is not solar-term-derived)
```

**Read this correctly.** The ephemeris question is *closed*. Three independent-ish
implementations agree on every month-pillar boundary for 101 years. The residual
disagreement window is ≤52 seconds. A user is misassigned only if their birth *minute*
lands inside one of those windows: ≈1,212 × ~30 s / (101 yr) ≈ **1 in 90,000**. And it's
fully detectable — flag any birth within ±2 min of a boundary. You already have
`boundary_flag` in the spec.

---

## 2. THE ACTUAL FINDING — YOUR "FAILURE" WAS A CONVENTION FLAG

Ran your 12-chart fixture straight through tyme4ts.

**Before** (`SixtyCycleHour` / default provider) — **11/12**:

```
 7 | 1993-06-12 23:30 | 癸酉 戊午 乙丑 丙子 | got 乙午 · want 甲午 | FAIL
```

tyme4ts default rolls the day forward at 23:00 (子時 belongs to the next day). Your
fixture — and Joey — hold the day at midnight. That's 流派1 vs 流派2, a *school
convention*, not a calculation error. tyme4ts ships both.

**After** (`LunarHour.provider = new LunarSect2EightCharProvider()`) — **12/12**:

```
 1 1989-09-13 09:00  己巳 癸酉 丙子 癸巳  PASS   [Reyner]
 2 1990-03-04 14:00  庚午 戊寅 戊辰 己未  PASS
 3 1992-04-20 08:00  壬申 甲辰 丙寅 壬辰  PASS
 4 1995-06-01 06:00  乙亥 辛巳 癸亥 乙卯  PASS
 5 1988-07-10 22:00  戊辰 己未 丙寅 己亥  PASS
 6 1989-03-03 00:15  己巳 丙寅 壬戌 庚子  PASS   [早子]
 7 1993-06-12 23:30  癸酉 戊午 甲子 丙子  PASS   [晚子 — the discriminator]
 8 1992-01-05 08:00  辛未 庚子 庚辰 庚辰  PASS
 9 1990-08-07 10:00  庚午 癸未 甲辰 己巳  PASS
10 1985-02-04 12:00  乙丑 戊寅 甲戌 庚午  PASS   [立春 year-rollover]
11 1991-01-10 04:00  庚午 己丑 庚辰 戊寅  PASS
12 1990-06-07 12:00  庚午 壬午 癸卯 戊午  PASS

流派2 provider → 12/12   (Day Master + Month Branch; all four pillars printed above)
```

Every edge case your hand-rolled calculator was carefully hand-fixed for — 立春
rollover, 早子/晚子 — tyme4ts gets right out of the box with one config line.

**Implication:** delete `lib/bazi/calculator.js`. Do not port it, do not keep it as a
cross-check. It's ~200 lines of liability whose only merit was passing 12 dates.
Keep `tenGods.js` and `mainProfile.js` — those are yours and deliberately diverge from
Joey. Only the *pillars* layer is replaced.

---

## 3. TRAP THAT WOULD HAVE BITTEN YOU

`tyme4ts`'s `getJulianDay().getDay()` returns a **UTC+8-based** Julian Day, not a
UT-based one. I hit this on the first run: naive `(jd - 2440587.5) * 86400000` then
"convert to +08" produces an **8-hour error** — which absolutely does flip month
branches. Whoever writes the swap must assert against a known instant before trusting
any JD arithmetic. Put it in the test file:

```
立春 1989 = 1989-02-04 04:27 (+08)     驚蟄 1989 = 1989-03-06 ...
白露 1989 = 1989-09-07 23:53 (+08)  ← Reyner's chart's month boundary, 5 days before birth
```

---

## 4. TIME CONVENTION — RESOLVED

> **CORRECTION, 2026-07-29 (same day).** An earlier draft of this section ranked
> "local timezone offset history" as risk #1 and instructed the swap prompt to resolve
> IANA timezones. **That was wrong and would have caused the exact failure it claimed to
> prevent.** Joey Yap's plotter (bazi.joeyyap.com/plot) has **no city field and no
> timezone field** — only name, gender, date, time. It is structurally incapable of
> applying either a timezone conversion or a longitude correction. The evidence was
> already in §2: the 12/12 fixture run used `SolarTime.fromYmdHms` with **no timezone
> conversion whatsoever**. Naive wall-clock reproduced Joey on all twelve charts. The
> original ranking ignored its own passing test. Section rewritten below.

### 4a. What Joey actually does

The tool's own instruction text: *"Please key in your western (Gregorian Calendar) date
and time of birth, based on the local time of where you were born… the software will
automatically convert and plot your BaZi based on the Chinese Solar Calendar."*

Decoded: it takes the clock digits you type and compares them directly against a
solar-term table computed in the **+08 frame**. No conversion, no longitude correction.
A birth at 09:00 in Jakarta is treated identically to a birth at 09:00 in Beijing.

- **True Solar Time (真太陽時 / LMT): OFF.** Not a choice — structurally impossible
  without a birth longitude. Settled permanently.
- **Timezone conversion: OFF.** Structurally impossible without a birth location.
- **Frame of the solar-term table: +08.** Confirmed by 12/12 fixture parity against
  tyme4ts, whose tables are +08-based.

### 4b. Confirmation test (2 minutes)

Enter **1989 / February / 4 / 04:00**. 立春 1989 falls at **04:27 (+08)**, so this
straddles the boundary and both the year and month pillar flip:

| Joey returns | Interpretation |
|---|---|
| **戊辰 乙丑** 乙未 戊寅 | Naive wall-clock, no conversion. **Expected.** |
| **己巳 丙寅** 乙未 己卯 | Converting +07 → +08. Would invalidate the fixture. |

Two different *year* pillars — unmissable. (Backup discriminator: 白露 1989 = 23:53 (+08);
enter 1989/Sep/7/23:30 → naive gives 己巳 壬申 庚午 戊子, tz-aware gives 己巳 癸酉 辛未 戊子.)

### 4c. The decision this creates — a product call, not a technical one

**Option A — match Joey (naive wall-clock). ← ADOPTED**
100% agreement with the validation oracle and with the tool users will cross-check
against. The timezone-history landmine disappears entirely: since nothing is ever
converted, it is irrelevant that Asia/Jakarta was +07:30 before 1964, that
Singapore/KL were +07:30 before 1982, or that Asia/Shanghai ran summer DST 1986–1991.
Those inaccuracies exist inside Joey's model too, so matching him preserves consistency
rather than importing error. Cost: astronomically incoherent — local clock digits
measured against Beijing's seasonal instants. No consumer perceives this, and it is
what the entire consumer BaZi market does.

**Option B — tz-aware (rejected).**
Defensible to an astronomer. Costs the oracle, and gives roughly **1 in 700** users a
month pillar that disagrees with the tool they will check Katon against. For a product
whose value proposition is authoritative self-recognition, "Katon says a different
month than Joey" is the worst available failure mode.

Decided by the already-locked methodological principle in
KATON-engine-session-state.md: *"Adopt classical rigor only where it prevents a
false/self-contradictory statement; ignore it where it's lineage-preference the
consumer never perceives."*

**Hedge:** accept and persist an optional IANA `tz` field on the input record that the
calculation does **not** read. This makes revisiting the convention a recompute rather
than a data re-collection.

### 4d. Revised risk table

| # | Risk | Window | Users affected | Status |
|---|---|---|---|---|
| 1 | Convention mismatch vs Joey | up to 1 hour | ~1 in 700 | **closed — Option A** |
| 2 | True Solar Time (LMT) | up to 30 min | — | **closed — Joey applies none** |
| 3 | Timezone offset history | 30–60 min | — | **moot under Option A** |
| 4 | Ephemeris implementation choice | ≤52 s | ~1 in 90,000 | **closed — §1** |

Every row is now closed. The remaining accuracy surface is the boundary flag: births
within ±2 minutes of a 節 or 時辰 edge should be marked and read softly, because at that
resolution *no* method is authoritative.

---

## 5. RECOMMENDED ARCHITECTURE

```
RUNTIME (Vercel, Next.js 15)
  tyme4ts  ← the only calculator. Pure TS, zero deps, 0.72 ms/chart, no WASM,
             no sidecar, no cold-start penalty.
  IANA tz resolution for birth instant. Never a hardcoded offset.

CI ONLY (never shipped)
  scripts/solar-term-oracle.mjs   → astronomy-engine, independent ephemeris
  scripts/solar-term-oracle.py    → sxtwl 2.0.7, ShouXing reference
  tests/solar-terms.fixture.json  → 1,212 pinned 節 instants, 1930–2030, checked in

  CI asserts tyme4ts == fixture. If 6tail ships a version bump that moves a
  boundary, CI fails loudly instead of silently changing users' charts.
```

Why the pinned fixture matters more than the library choice: it converts "do I trust
this dependency?" into "did this dependency change?" — a question CI answers on every
push. That is the real no-compromise guarantee, and it's ~90 KB of JSON.

Rejected: precomputing the table and shipping *only* the table at runtime. It's
tempting (fully auditable, zero dependency) but you'd still hand-roll day-pillar
counting, 立春 year rollover, and the 子時 conventions — i.e. you'd rebuild the exact
thing you're trying to delete. Ship the library, pin the numbers.

---

## 6. COPY-PASTEABLE CLAUDE CODE PROMPTS

### Prompt A — the swap (do first)

```
Replace the hand-rolled BaZi pillar calculator with tyme4ts. Accuracy is the hard
constraint here; do not take shortcuts and do not preserve the old code as a fallback.

1. `npm i tyme4ts` (MIT, zero deps, pure TS).

2. Create `lib/bazi/pillars.ts`. Single exported function:

     computePillars({ date, time, tz }): {
       year:  { stem, branch }, month: { stem, branch },
       day:   { stem, branch }, hour:  { stem, branch } | null,
       boundaryFlag: boolean, boundaryReason?: string
     }

   Requirements:
   - Set `LunarHour.provider = new LunarSect2EightCharProvider()` ONCE at module
     scope. This is the 流派2 / 晚子時 convention and it is REQUIRED — the default
     provider rolls the day at 23:00 and fails validation chart 7 (1993-06-12 23:30,
     which must yield day 甲子 / hour 丙子, NOT day 乙丑).
   - Derive pillars via
     `SolarTime.fromYmdHms(...).getLunarHour().getEightChar()` and read
     `.getYear() / .getMonth() / .getDay() / .getHour()`.
   - TIME CONVENTION (locked, matches the validation oracle): use the entered local
     wall-clock time DIRECTLY. Do NOT convert to UTC. Do NOT resolve an IANA timezone.
     Do NOT apply True Solar Time / longitude correction. Joey Yap's plotter has no
     city or timezone input and therefore applies none; matching it is the requirement.
     Pass raw Y/M/D/h/m to SolarTime.fromYmdHms and let tyme4ts's +08-frame solar-term
     table govern. See §4 of KATON-calculator-decision.md.
   - Accept an optional `tz` field on the input type, persist it, and leave it UNUSED
     by the calculation. It exists so the convention can be revisited without
     re-collecting user data. Add a comment saying exactly that.
   - `time: null` must produce `hour: null` and must NOT default to midnight.
   - Set boundaryFlag=true if the birth instant is within ±2 minutes of the governing
     節 (month boundary) or within ±2 minutes of a 時辰 edge. Include the reason.

3. WARNING — do not get this wrong: tyme4ts's `getJulianDay().getDay()` returns a
   UTC+8-BASED Julian Day, not UT-based. Do not do your own JD arithmetic unless you
   first assert against known values. Add these asserts to the test file:
     立春 1989 = 1989-02-04 04:27 (+08)
     白露 1989 = 1989-09-07 23:53 (+08)

4. DELETE `lib/bazi/calculator.js` entirely. Update `lib/bazi/computeChart.js` to call
   computePillars. Do NOT touch `tenGods.js` or `mainProfile.js` — those are
   intentional Katon logic and must keep passing at 12/12 and 7/12 respectively.

5. Run tests/bazi-engine.report.mjs. Expected: pillars 12/12, Ten Gods 12/12,
   Track A profile 7/12 (7/12 is CORRECT — intended divergence from Joey, do not
   "fix" it), no-hour stability 12/12. Report the before/after table.
```

### Prompt B — the boundary diff / regression lock (do second)

```
Build the solar-term regression lock. This is CI-only tooling; none of it ships to
the client bundle.

1. `scripts/gen-solar-term-fixture.mjs`
   Using astronomy-engine (`npm i -D astronomy-engine`), compute the 12 節 that start
   BaZi months for every year 1930–2030 by root-finding apparent geocentric solar
   longitude with `SearchSunLongitude`:
     立春 315° · 驚蟄 345° · 清明 15° · 立夏 45° · 芒種 75° · 小暑 105°
     立秋 135° · 白露 165° · 寒露 195° · 立冬 225° · 大雪 255° · 小寒 285°
   Emit `tests/solar-terms.fixture.json` — 1,212 rows, ISO-8601 instants in UTC.
   Store UTC, not +08, so the file carries no timezone convention.

2. `tests/solar-terms.spec.ts`
   For all 1,212 rows, assert tyme4ts's boundary agrees with the fixture. Report:
   median |Δ|, max |Δ|, and counts of disagreement at MINUTE / HOUR / DAY granularity.
   FAIL the build on any DAY-level disagreement. WARN above 120 s.
   Expected result (already measured): 0 day-level, 0 hour-level, max |Δ| ≈ 52 s.

3. `scripts/oracle-sxtwl.py` (optional, run manually, never in the Vercel build)
   `pip install sxtwl`; emit the same 1,212 boundaries via
   `sxtwl.getJieQiByYear(y)` + `sxtwl.JD2DD(jd)`. NOTE: getJieQiByYear(y) returns
   terms spanning into year y+1 — key rows by the TRUE Gregorian year from JD2DD, not
   by the loop variable, or 小寒 lands a year off. Diff against the fixture. Expected:
   0 day-level disagreements, max |Δ| ≈ 25 s.

4. Add a 20-row hand spot-check against Hong Kong Observatory's published 24-solar-term
   tables (hko.gov.hk, HM Nautical Almanac Office / USNO data, times in HKT/UTC+8) as
   `tests/solar-terms.hko-spotcheck.json`. This is the one oracle that is a human
   institutional publication rather than a code port.

5. Add `tests/time-convention.spec.ts` — a LOCK, not a timezone layer. It must prove
   the engine does NO time conversion, because conversion would break oracle parity:
     1989-02-04 04:00 -> 戊辰 乙丑 乙未 戊寅   (立春 1989 = 04:27 +08; naive keeps prior year)
     1989-09-07 23:30 -> 己巳 壬申 庚午 戊子   (白露 1989 = 23:53 +08; naive keeps 申 month)
     1993-06-12 23:30 -> 癸酉 戊午 甲子 丙子   (晚子時 / 流派2 provider)
   If any of these shift by an hour, someone has reintroduced timezone conversion.
   Comment the file with WHY: Joey Yap's plotter has no city/timezone field, so Katon
   must not convert either.
```

---

## 7. DECISION LOG (for PROGRESS.md)

- **sxtwl is retired as the designated runtime library.** No JS/WASM path exists and
  none is needed. Replacement: **tyme4ts** (same 寿星天文历 engine, pure TS, MIT).
  sxtwl demoted to CI-only oracle. This does not weaken the "astronomical library,
  never hand-rolled" rule — it satisfies it with three independent oracles instead of one.
- **流派2 / 晚子時 (`LunarSect2EightCharProvider`) is the locked convention.** Required
  for fixture parity. Document it as a school choice, not an implementation detail.
- **Time convention locked: naive local wall-clock. No timezone conversion, no True
  Solar Time.** Joey Yap's plotter has no city or timezone field and therefore applies
  neither; Katon matches the oracle. Historical tz offsets (Jakarta +07:30 pre-1964,
  Singapore/KL +07:30 pre-1982, Shanghai summer DST 1986–1991) are consequently moot.
  An unused `tz` field is persisted to keep a future reversal cheap. See §4.
- **Correction on record:** an earlier draft of §4 ranked timezone handling as the top
  accuracy risk and told the swap prompt to resolve IANA zones. That would have made the
  engine diverge from its own validation oracle for ~1 in 700 users. The 12/12 fixture
  run had already disproved it — it used no timezone conversion. Superseded by §4a–4d.
- **No blockers remain ahead of the strength engine.** Sequence is: Prompt A (swap) →
  commit Phase 1 → Prompt B (regression lock) → strength engine.
