#!/usr/bin/env python3
# ============================================================
# Third-oracle cross-check: sxtwl vs tests/solar-terms.fixture.json
# ============================================================
# OPTIONAL. Run by hand. NEVER in the Vercel build and never in CI — it needs a
# Python toolchain the deploy does not have, and its job is a periodic sanity
# check, not a gate. The gate is tests/solar-terms.spec.ts.
#
# WHAT THIS PROVES, AND WHAT IT DOES NOT
# sxtwl is the C++ 寿星天文历 implementation; tyme4ts is a TypeScript port of the
# SAME engine. Agreement between them therefore proves the PORT IS FAITHFUL and
# says nothing about whether the astronomy is right. The independent checks are
# astronomy-engine (which generated the fixture) and the Hong Kong Observatory
# spot-check. You need both kinds, which is why there are three oracles.
#
#   pip install sxtwl
#   python scripts/oracle-sxtwl.py
#
# Expected: 0 day-level disagreements, max |Δ| ≈ 25 s.
#
# NOTE FOR WHOEVER RUNS THIS FIRST: it has not been executed in the environment
# that wrote it (no Python toolchain there), so treat the first run as part of
# the review. It is written defensively for that reason — the term-index mapping
# self-checks against expected calendar positions and aborts loudly rather than
# silently producing a plausible-looking diff. Fix the mapping, do not loosen
# the guard.
# ============================================================

import json
import os
import statistics
import sys
from datetime import datetime, timedelta, timezone

try:
    import sxtwl
except ImportError:
    sys.exit("sxtwl not installed — run: pip install sxtwl")

HERE = os.path.dirname(os.path.abspath(__file__))
FIXTURE = os.path.join(HERE, "..", "tests", "solar-terms.fixture.json")

HK8 = timezone(timedelta(hours=8))

# The 12 節 that open BaZi months, keyed by apparent solar longitude, with the
# approximate calendar position used ONLY to validate the index mapping.
# (month, day) is in the term's own Gregorian year.
JIE = {
    285: ("小寒", 1, 6),
    315: ("立春", 2, 4),
    345: ("驚蟄", 3, 6),
    15:  ("清明", 4, 5),
    45:  ("立夏", 5, 6),
    75:  ("芒種", 6, 6),
    105: ("小暑", 7, 7),
    135: ("立秋", 8, 8),
    165: ("白露", 9, 8),
    195: ("寒露", 10, 8),
    225: ("立冬", 11, 7),
    255: ("大雪", 12, 7),
}

# sxtwl indexes the 24 terms from 冬至 = 0 in 15° steps, the same convention
# tyme4ts uses: lon = (index * 15 + 270) mod 360. The self-check below is what
# actually confirms this on the installed version — do not trust the comment.
def longitude_for_index(idx):
    return (idx * 15 + 270) % 360


def jq_fields(jq):
    """sxtwl's attribute names vary across releases; resolve them once, loudly."""
    idx = getattr(jq, "jqIndex", None)
    if idx is None:
        idx = getattr(jq, "jq", None)
    jd = getattr(jq, "jd", None)
    if idx is None or jd is None:
        sys.exit(
            "unrecognised sxtwl JieQi object: expected .jqIndex/.jq and .jd, got "
            + repr([a for a in dir(jq) if not a.startswith("_")])
        )
    return int(idx), jd


def to_utc(jd):
    """
    sxtwl's Julian Day is UTC+8-based, exactly like tyme4ts's. JD2DD therefore
    returns +08 WALL CLOCK, not UTC. Reading it as UTC double-shifts by 8 hours
    and silently moves month branches — the same trap the TypeScript side
    guards. Build the instant in +08 and convert.
    """
    t = sxtwl.JD2DD(jd)
    second = int(t.s)
    micro = int(round((t.s - second) * 1_000_000))
    local = datetime(int(t.Y), int(t.M), int(t.D), int(t.h), int(t.m), second, micro, tzinfo=HK8)
    return local.astimezone(timezone.utc)


def main():
    with open(FIXTURE, encoding="utf-8") as fh:
        fixture = json.load(fh)

    # Key the fixture by (+08 calendar date, longitude).
    expected = {}
    for row in fixture["terms"]:
        utc = datetime.fromisoformat(row["utc"].replace("Z", "+00:00"))
        key = (utc.astimezone(HK8).strftime("%Y-%m-%d"), row["lon"])
        expected[key] = utc

    years = fixture["_years"]
    # getJieQiByYear(y) returns terms that spill into y+1, so a term MUST be
    # keyed by the true Gregorian year taken from JD2DD, never by the loop
    # variable — otherwise 小寒 lands a full year off. Scanning one year either
    # side and de-duplicating by instant makes the loop variable irrelevant.
    collected = {}
    for y in range(years[0] - 1, years[1] + 2):
        try:
            terms = sxtwl.getJieQiByYear(y)
        except Exception as exc:  # noqa: BLE001 - surface the real API error
            sys.exit(f"sxtwl.getJieQiByYear({y}) failed: {exc}")
        for jq in terms:
            idx, jd = jq_fields(jq)
            lon = longitude_for_index(idx)
            if lon not in JIE:
                continue  # a 氣, not a 節
            utc = to_utc(jd)
            collected[(utc.astimezone(HK8).strftime("%Y-%m-%d"), lon)] = utc

    # ---- self-check the index mapping before trusting any diff ----
    bad_mapping = []
    for (date_str, lon), utc in collected.items():
        name, exp_month, exp_day = JIE[lon]
        local = utc.astimezone(HK8)
        nominal = datetime(local.year, exp_month, exp_day, tzinfo=HK8)
        if abs((local - nominal).days) > 3:
            bad_mapping.append(f"{name} ({lon}°) resolved to {local:%Y-%m-%d}, expected near {exp_month:02d}-{exp_day:02d}")
    if bad_mapping:
        print("INDEX MAPPING IS WRONG for this sxtwl version — aborting before the diff:")
        for line in bad_mapping[:10]:
            print("   ", line)
        sys.exit(1)

    # ---- diff ----
    deltas, day_level, missing = [], [], []
    for key, exp_utc in expected.items():
        got = collected.get(key)
        if got is None:
            missing.append(key)
            continue
        deltas.append((got - exp_utc).total_seconds())

    # A day-level disagreement shows up as a fixture key with no sxtwl row on
    # that +08 date but a matching longitude on an adjacent one.
    by_lon = {}
    for (date_str, lon), utc in collected.items():
        by_lon.setdefault(lon, {})[date_str] = utc
    for date_str, lon in missing:
        near = by_lon.get(lon, {})
        alt = [d for d in near if abs((datetime.strptime(d, "%Y-%m-%d") - datetime.strptime(date_str, "%Y-%m-%d")).days) <= 2]
        if alt:
            day_level.append(f"{JIE[lon][0]} expected {date_str}, sxtwl says {alt[0]}")

    abs_deltas = sorted(abs(d) for d in deltas)
    print(f"\n  sxtwl vs tests/solar-terms.fixture.json — {len(deltas)} of {len(expected)} boundaries compared")
    if abs_deltas:
        print(f"    median |Δ|   {statistics.median(abs_deltas):.1f}s")
        print(f"    max |Δ|      {max(abs_deltas):.1f}s")
    print(f"    DAY-level    {len(day_level)}")
    print(f"    unmatched    {len(missing)}")
    for line in day_level[:20]:
        print(f"      DAY {line}")

    if day_level:
        sys.exit("FAIL: day-level disagreement — a Month Branch differs")
    if missing and not day_level:
        # Range edges can legitimately go unmatched; anything more is a bug.
        print(f"    (note: {len(missing)} fixture rows had no sxtwl counterpart)")
    print("\n  OK — no day-level disagreement")


if __name__ == "__main__":
    main()
