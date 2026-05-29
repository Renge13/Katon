# Known-good day pillars (verified)

Authoritative cross-check values for the day-pillar cycle. Use THESE — do **not**
re-derive from the `bazi-calculator` skill's inline "known dates", which are
**buggy and self-contradictory** (it claims `1984-01-01 = 甲子` and
`2000-10-01 = 庚辰`, and asserts both `1984-01-01` and `2024-01-01` are 甲子 —
impossible 40 years apart). The skill's *anchor* is correct; its spot-checks are not.

The day pillar is a continuous 60-day sexagenary cycle. One real-world-verified
point + correct day-counting determines every other day. These three pin it:

| Date (Gregorian) | Day Pillar | Role |
|------------------|-----------|------|
| 1900-01-01 | 甲戌 (jiǎ-xū)  | Anchor (stem index 0, branch index 10) |
| 1989-09-13 | 丙子 (bǐng-zǐ) | Canonical test chart — Reyner, 丙 Matahari. Real-world validated. |
| 2024-01-01 | 甲子 (jiǎ-zǐ)  | Modern jiazi reset check |

Independently confirmed by the repo owner: `1984-01-01 = 甲午` (not 甲子),
`2000-10-01 = 壬辰` (not 庚辰).

The full validation suite (20 day pillars + solar-term boundary cases) lives in
`scripts/validate-bazi.mjs` (`npm run test:bazi`).
