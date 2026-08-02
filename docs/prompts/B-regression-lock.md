<!--
STATUS: HANDOVER — Claude Code build prompt. PROMPT B. Run after A.
Full reasoning: ../engine/calculator-decision.md. Harness already written: solar-term-oracle-diff.mjs
Sequence: A (swap) -> commit Phase 1 -> B (this) -> C (strength engine)
-->

# Prompt B — solar-term regression lock

## WHY

Adopting tyme4ts converts "do I trust this dependency?" into "did this dependency change?" — a
question CI can answer on every push. That is the real no-compromise guarantee, and it costs about
90 KB of JSON.

`tests/tools/solar-term-oracle-diff.mjs` in this folder already does the tyme4ts vs astronomy-engine comparison
and passes. It drops straight into `scripts/`.

---

## PASTE BELOW THIS LINE

Build the solar-term regression lock. This is CI-only tooling. **None of it ships to the client
bundle.**

**1.** `scripts/gen-solar-term-fixture.mjs`

Using astronomy-engine (`npm i -D astronomy-engine`), compute the 12 節 that start BaZi months for
every year 1930–2030 by root-finding apparent geocentric solar longitude with `SearchSunLongitude`:

```
立春 315°  驚蟄 345°  清明 15°   立夏 45°
芒種 75°   小暑 105°  立秋 135°  白露 165°
寒露 195°  立冬 225°  大雪 255°  小寒 285°
```

Emit `tests/solar-terms.fixture.json` — 1,212 rows, ISO-8601 instants **in UTC**. Store UTC, not +08,
so the file carries no timezone convention of its own.

**2.** `tests/solar-terms.spec.ts`

For all 1,212 rows, assert tyme4ts's boundary agrees with the fixture. Report median |Δ|, max |Δ|,
and counts of disagreement at MINUTE / HOUR / DAY granularity.

- **FAIL the build on any DAY-level disagreement.** A day-level disagreement means a Month Branch is
  wrong, which means a reading is silently wrong.
- WARN above 120 s.

Expected, already measured: **0 day-level, 0 hour-level, max |Δ| ≈ 52 s, median 9 s.**

`tests/tools/solar-term-oracle-diff.mjs` already implements this comparison including the UTC+8 JD trap guard.
Reuse it rather than rewriting.

**3.** `scripts/oracle-sxtwl.py` — optional, run manually, **never in the Vercel build**

`pip install sxtwl`. Emit the same 1,212 boundaries via `sxtwl.getJieQiByYear(y)` + `sxtwl.JD2DD(jd)`.

**Trap:** `getJieQiByYear(y)` returns terms that span into year y+1. Key rows by the TRUE Gregorian
year taken from `JD2DD`, not by the loop variable, or 小寒 lands a full year off.

Diff against the fixture. Expected: 0 day-level disagreements, max |Δ| ≈ 25 s.

**4.** Add a ~20-row hand spot-check against Hong Kong Observatory's published 24-solar-term tables
(hko.gov.hk — HM Nautical Almanac Office / USNO data, times in HKT/UTC+8) as
`tests/solar-terms.hko-spotcheck.json`.

This is the one oracle that is a human institutional publication rather than a code port. tyme4ts and
sxtwl share the same 寿星天文历 ancestor, so their agreement proves porting fidelity, not astronomical
correctness. astronomy-engine and HKO are the independent checks.

**5.** Deliver as its own PR, CI tooling only, independently revertable.

---

## NOTE ON WHAT THIS DOES AND DOESN'T PROVE

Agreement between tyme4ts and sxtwl proves the port is faithful. Agreement with astronomy-engine and
HKO proves the underlying astronomy is right. You need both, which is why there are three oracles and
not one.
