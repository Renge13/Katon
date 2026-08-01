// ============================================================
// Four Pillars (四柱) — solar-term engine
// ============================================================
// The ONLY place in Katon that turns a birth date/time into Heavenly Stems and
// Earthly Branches. Backed by tyme4ts (MIT, zero deps), which is the 寿星天文历
// engine — the same ephemeris as sxtwl — in pure TypeScript.
//
// WHY A LIBRARY AND NOT OUR OWN MATH
// The hand-rolled calculator this replaces passed 12 fixture dates. 12 dates is
// not the ~1,212 節 (month-boundary) instants between 1930 and 2030 that a real
// user base will land on, and the Month Branch those boundaries decide is the
// heaviest input to the strength engine (得令). Measured across all 1,212 節
// boundaries 1930–2030, sxtwl, tyme4ts and astronomy-engine (an independent
// ephemeris) have zero day-level disagreements.
//
// Do NOT reintroduce local solar-term arithmetic. If a pillar looks wrong, the
// fixture (tests/bazi-validation.fixture.js) or the convention below is the
// thing to argue with — not this file's math.
// ============================================================

import {
  LunarHour,
  LunarSect2EightCharProvider,
  SolarTerm,
  SolarTime,
} from 'tyme4ts';

// ── 流派2 / 晚子時 convention (REQUIRED, set once) ──────────
// tyme4ts's default provider rolls the DAY pillar at 23:00. Katon uses 流派2:
// the day rolls at midnight, and the 子 hour opening at 23:00 takes its stem
// from the incoming day. Validation chart 7 (1993-06-12 23:30) is the lock —
// it must yield day 甲子 / hour 丙子. The default provider yields day 乙丑.
LunarHour.provider = new LunarSect2EightCharProvider();

// ── Time convention (LOCKED — matches the validation oracle) ──
// The entered local wall-clock time is used DIRECTLY:
//   · no conversion to UTC
//   · no IANA timezone resolution
//   · no True Solar Time / longitude correction
// Joey Yap's plotter — the oracle every fixture row is transcribed from — has
// no city field and no timezone field, so it applies none of these. Matching it
// is the requirement. Raw Y/M/D/h/m go to SolarTime.fromYmdHms and tyme4ts's
// +08-framed solar-term table governs.
// tests/time-convention.spec.ts locks this. See also KATON-calculator-decision.md.

/**
 * Probe hour used ONLY to resolve year/month/day when the birth time is unknown.
 *
 * Under 流派2 the day pillar is identical for every hour of a calendar day, so
 * this only matters on a 節 day, where the month (and possibly year) pillar
 * changes partway through. Noon is the maximum-likelihood choice: a day holds
 * exactly one 節 instant, so the branch governing noon is always the branch
 * covering more than half the day. Such cases are reported via `boundaryFlag`.
 *
 * This probe NEVER produces an hour pillar — `time: null` yields `hour: null`.
 */
const NO_TIME_PROBE_HOUR = 12;

/** A birth instant this close to a boundary is not safely resolvable. */
const BOUNDARY_MINUTES = 2;

export interface PillarsInput {
  /** Local civil date, 'YYYY-MM-DD'. */
  date: string;
  /** Local civil time, 'HH:MM'. null / omitted = unknown (no hour pillar). */
  time?: string | null;
  /**
   * DELIBERATELY UNUSED BY THE CALCULATION. Accepted and persisted only so the
   * time convention above can be revisited later without re-collecting user
   * data. Reading this field in pillar math would break oracle parity.
   */
  tz?: string | null;
  /**
   * Which side of the in-day 節 the birth falls on, when the exact time is
   * unknown. ONLY consulted when `time` is null AND a 節 falls inside the birth
   * day — the one case where the month pillar is otherwise a coin toss.
   *
   * This resolves the MONTH pillar without inventing an HOUR pillar: `hour`
   * stays null. Never fabricate a birth time to stand in for this — a made-up
   * hour would render as a real fourth pillar.
   */
  termSide?: 'before' | 'after' | null;
  /**
   * Optional, default null. Accepted and persisted; it does NOT affect anything
   * this function returns.
   *
   * Gender affects EXACTLY ONE THING: luck-pillar (大運) direction — forward for
   * yang-year males and yin-year females, reverse otherwise. It does not touch the
   * natal chart, Ten Gods, strength, badges, palaces or compatibility, all of
   * which read the natal chart only. Luck pillars are not built yet, so there is
   * no consumer; the field exists so it does not have to be re-collected later.
   *
   * When luck pillars ARE built, use tyme4ts's gender-aware API
   * (ChildLimit.fromSolarTime(solarTime, Gender) -> DecadeFortune) rather than
   * deriving the direction by hand.
   */
  gender?: 'male' | 'female' | null;
}

export interface Pillar {
  /** Heavenly Stem (天干) hanzi. */
  stem: string;
  /** Earthly Branch (地支) hanzi. */
  branch: string;
}

/**
 * Solar-term (節) proximity — the boundary that decides the MONTH pillar.
 *
 * This is the one that matters. The Month Branch is the heaviest input to 得令
 * in the strength engine, so getting it wrong moves the whole reading.
 */
export interface SolarTermBoundary {
  flagged: boolean;
  /** The 節 in question. Present iff `flagged`. */
  term?: string;
  /**
   * Signed minutes from that 節 — negative means born before it. FRACTIONAL:
   * 節 instants carry seconds (立春 1989 fires at 04:27:09).
   *
   * Present iff `flagged` AND the birth instant is known. It is ABSENT in the
   * time-unknown case, where the 節 falls somewhere inside the birth day and
   * the uncertainty spans the whole day rather than a couple of minutes.
   */
  minutesFrom?: number;
  /**
   * Set when a 節 fell inside the birth day but the caller supplied `termSide`,
   * so the month pillar is determined after all. `flagged` is false in that
   * case — the risk is gone — and this records how.
   */
  resolvedBy?: 'termSide';
}

/**
 * 時辰 edge proximity — decides the HOUR pillar only. Much lower stakes, and
 * usually caused by the user rounding their own birth time rather than by
 * anything astronomical. Suppressed entirely when `timeLikelyRounded`.
 */
export interface HourEdgeBoundary {
  flagged: boolean;
  /** Signed minutes from the edge — negative means before. Present iff `flagged`. */
  minutesFrom?: number;
}

export interface Boundary {
  solarTerm: SolarTermBoundary;
  hourEdge: HourEdgeBoundary;
  /**
   * The entered minute is `00` or `30`. Someone typing "09:00" almost certainly
   * means "sekitar jam 9", not 09:00:00 — so their rounding must not be read as
   * astronomical precision. False when no time was given.
   */
  timeLikelyRounded: boolean;
}

export interface Pillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  /** null when the birth time is unknown. Never defaulted to midnight. */
  hour: Pillar | null;
  /**
   * 命宮 Life Palace is DELIBERATELY ABSENT. Removed 2026-08-01 (D1b) after four
   * more Joey values were collected: no candidate convention reproduces him.
   *
   *   solar-term month branch (tyme4ts getOwnSign)  4/5 — fails chart 2
   *   lunar month number (the obvious alternative)  3/5 — fails charts 7 and 10
   *
   * So a shipped value would be wrong on roughly 1 in 5 charts. The palace block
   * exists ONLY as the legitimacy object a curious user cross-checks against
   * Joey, and there a wrong value is strictly worse than an absent one: absent
   * reads as "they left that field out", wrong reads as "their calculation
   * disagrees with Joey's" in the one place designed to prove it does not.
   *
   * It is fragile by construction, not by accident. 命宮 consumes the YEAR STEM,
   * the MONTH and the HOUR, so it compounds three independent convention choices
   * and every boundary ambiguity in the engine lands in this one field at once.
   * That is why it fails precisely on the charts that are already edge cases —
   * chart 2 is a CNY/solar-term mismatch, chart 7 is 晚子時, chart 10 is 立春.
   *
   * The derivation is still reachable as `lifePalaceCandidate()` below so the
   * finding stays executable, but nothing computes or displays it. To un-defer:
   * settle the convention against 10+ Joey values including a CNY/solar mismatch,
   * a 晚子時 birth and a 立春 birth. Nothing interprets it, so it costs nothing
   * to leave out.
   */
  /**
   * 胎元 Conception Palace. DISPLAY ONLY, same reasoning.
   *
   * Always available: derived from the MONTH pillar alone (stem +1, branch +3),
   * so it survives an unknown birth hour.
   *
   * Triple-verified: Joey's printed 胎元 甲子 for chart 1, tyme4ts
   * getFetalOrigin(), and the standard formula computed by hand — all three agree
   * across five charts.
   */
  conceptionPalace: Pillar;
  /**
   * The two risks, kept apart. They are not comparable: a 節 boundary can move
   * the month pillar and therefore the reading; a 時辰 edge can only move the
   * hour pillar. Consumers should branch on `boundary.solarTerm.flagged`.
   */
  boundary: Boundary;
  /**
   * Derived convenience: `solarTerm.flagged || hourEdge.flagged`. A plain
   * property rather than an accessor so it survives JSON round-trips.
   * Prefer `boundary` — this cannot tell the two risks apart.
   */
  boundaryFlag: boolean;
  /** Human-readable explanation, present only when boundaryFlag is true. */
  boundaryReason?: string;
}

// ── Input parsing ──────────────────────────────────────────

function parseDate(date: string): { y: number; m: number; d: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date ?? '').trim());
  if (!match) throw new Error(`Invalid birth date "${date}" — expected YYYY-MM-DD`);
  const [, y, m, d] = match;
  return { y: Number(y), m: Number(m), d: Number(d) };
}

function parseTime(time: string): { h: number; mi: number } {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(String(time).trim());
  if (!match) throw new Error(`Invalid birth time "${time}" — expected HH:MM`);
  const h = Number(match[1]);
  const mi = Number(match[2]);
  if (h > 23 || mi > 59) throw new Error(`Invalid birth time "${time}" — out of range`);
  return { h, mi };
}

// ── Boundary detection ─────────────────────────────────────

/** Naive wall-clock minutes. Both operands are +08-framed, so the frame cancels. */
function minutesBetween(a: SolarTime, b: SolarTime): number {
  const ms = (t: SolarTime) =>
    Date.UTC(t.getYear(), t.getMonth() - 1, t.getDay(), t.getHour(), t.getMinute(), t.getSecond());
  return (ms(a) - ms(b)) / 60000;
}

/**
 * The 節 governing this instant's month pillar.
 *
 * getTerm() returns the term in effect, which may be a 氣 (mid-month); the 節
 * is then the previous term. The 12 節 are the odd SolarTerm indices — tyme4ts
 * answers that with isJie().
 */
function governingJie(at: SolarTime): SolarTerm {
  const term = at.getTerm();
  return term.isJie() ? term : term.next(-1);
}

function formatInstant(t: SolarTime): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${t.getYear()}-${pad(t.getMonth())}-${pad(t.getDay())} ${pad(t.getHour())}:${pad(t.getMinute())}`;
}

/**
 * Month-pillar (節) boundary check.
 *
 * Both sides of a month boundary carry the same risk — a birth 1 minute BEFORE
 * the next 節 is as unresolvable as one 1 minute after the governing 節 — so
 * the nearest of the two is what gets measured. That is what "±2 minutes of the
 * governing 節" means in practice.
 */
function checkSolarTerm(at: SolarTime): { boundary: SolarTermBoundary; reason: string | null } {
  const jie = governingJie(at);

  for (const term of [jie, jie.next(2)]) {
    const instant = term.getJulianDay().getSolarTime();
    const delta = minutesBetween(at, instant);
    if (Math.abs(delta) <= BOUNDARY_MINUTES) {
      const side = delta < 0 ? 'before' : 'after';
      return {
        boundary: { flagged: true, term: term.getName(), minutesFrom: delta },
        reason:
          `節 ${term.getName()} at ${formatInstant(instant)} — birth is ` +
          `${Math.abs(delta).toFixed(1)} min ${side} the month boundary`,
      };
    }
  }
  return { boundary: { flagged: false }, reason: null };
}

/**
 * The 節 falling inside the birth day, if there is one. Only meaningful when the
 * birth time is unknown: the boundary is somewhere in the day, so the month
 * pillar is a coin toss rather than a near miss.
 */
function jieWithinDay(
  at: SolarTime,
  y: number,
  m: number,
  d: number,
): { term: SolarTerm; instant: SolarTime } | undefined {
  const jie = governingJie(at);
  return [jie, jie.next(2)]
    .map((term) => ({ term, instant: term.getJulianDay().getSolarTime() }))
    .find(({ instant: i }) => i.getYear() === y && i.getMonth() === m && i.getDay() === d);
}

/**
 * A probe minute that is unambiguously on `side` of a 節 instant, or null if
 * that side has no room inside the birth day (a 節 in the first or last minute).
 *
 * One minute of clearance is enough and is robust to the 節's seconds: a 節 at
 * 04:27:09 is strictly after 04:26 and strictly before 04:28.
 */
function probeForSide(instant: SolarTime, side: 'before' | 'after'): { h: number; mi: number } | null {
  const minuteOfDay = instant.getHour() * 60 + instant.getMinute();
  const target = side === 'before' ? minuteOfDay - 1 : minuteOfDay + 1;
  if (target < 0 || target > 1439) return null;
  return { h: Math.floor(target / 60), mi: target % 60 };
}

/**
 * 時辰 edge check. 時辰 open on the odd hours (子 at 23:00, 丑 at 01:00, …), so
 * -60 covers the previous day's 23:00 for a birth just after midnight.
 *
 * Suppressed when the minute is a round `00`/`30`, which is the overwhelmingly
 * common case: every odd o'clock IS an edge, so without this the flag would
 * fire on a large share of all charts and mean nothing. A user who types a round
 * hour is reporting an approximation, not claiming second-level precision.
 */
function checkHourEdge(
  h: number,
  mi: number,
  timeLikelyRounded: boolean,
): { boundary: HourEdgeBoundary; reason: string | null } {
  if (timeLikelyRounded) return { boundary: { flagged: false }, reason: null };

  const minutes = h * 60 + mi;
  const edges = [-60, 60, 180, 300, 420, 540, 660, 780, 900, 1020, 1140, 1260, 1380];

  for (const edge of edges) {
    const delta = minutes - edge;
    if (Math.abs(delta) <= BOUNDARY_MINUTES) {
      const edgeHour = ((edge / 60) % 24 + 24) % 24;
      const side = delta < 0 ? 'before' : 'after';
      return {
        boundary: { flagged: true, minutesFrom: delta },
        reason:
          `時辰 edge at ${String(edgeHour).padStart(2, '0')}:00 — birth is ` +
          `${Math.abs(delta)} min ${side} it`,
      };
    }
  }
  return { boundary: { flagged: false }, reason: null };
}

/**
 * 命宮 under the solar-term-month convention — NOT FOR DISPLAY.
 *
 * Exported only so the recorded failure stays executable: tests/palaces.spec.mjs
 * asserts this reproduces Joey on 4 of 5 collected charts and names the one it
 * misses. Without it the 4/5 finding would be a comment, and a comment does not
 * fail when someone re-adds the field.
 *
 * DO NOT wire this into a chart object or a view. It is wrong on roughly 1 in 5
 * charts and the palace block's only job is to be cross-checkable against Joey.
 * See the 命宮 note on the Pillars interface for the full reasoning.
 *
 * @returns the candidate palace, or null when the hour is unknown
 */
export function lifePalaceCandidate({ date, time }: { date: string; time?: string | null }): Pillar | null {
  const hasTime = time !== null && time !== undefined && time !== '';
  if (!hasTime) return null; // reads the hour branch; never fabricate from the probe
  const { y, m, d } = parseDate(date);
  const { h, mi } = parseTime(time as string);
  const sign = SolarTime.fromYmdHms(y, m, d, h, mi, 0).getLunarHour().getEightChar().getOwnSign();
  return { stem: sign.getHeavenStem().getName(), branch: sign.getEarthBranch().getName() };
}

// ── Season-turn lookup (for the season gate) ───────────────

export interface SeasonTurn {
  /** The 節 that falls inside this date, e.g. '立春'. */
  term: string;
  /** Local clock time of the turn, 'HH:MM'. */
  at: string;
  /** Hour and minute of the turn, for callers that want to format it themselves. */
  hour: number;
  minute: number;
}

/**
 * The 節 falling inside a given calendar date, or null on the ~353 ordinary days.
 *
 * Pure calendar arithmetic — no birth time, no chart, no reading content. This
 * is what the season gate asks before creating a reading: on one of the ~12 days
 * a year this returns non-null, a birth with no time has an undetermined month
 * pillar and the user is the only one who can resolve it.
 */
export function seasonTurnOnDate(date: string): SeasonTurn | null {
  const { y, m, d } = parseDate(date);
  const probe = SolarTime.fromYmdHms(y, m, d, NO_TIME_PROBE_HOUR, 0, 0);
  const jie = jieWithinDay(probe, y, m, d);
  if (!jie) return null;

  const hour = jie.instant.getHour();
  const minute = jie.instant.getMinute();
  return {
    term: jie.term.getName(),
    at: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    hour,
    minute,
  };
}

// ── Main export ────────────────────────────────────────────

/**
 * Compute the Four Pillars for a birth date/time.
 *
 * @example
 * computePillars({ date: '1989-09-13', time: '09:00' });
 * // → year 己巳, month 癸酉, day 丙子, hour 癸巳
 */
export function computePillars({ date, time = null, tz = null, termSide = null, gender = null }: PillarsInput): Pillars {
  void tz; // see PillarsInput.tz — persisted upstream, never read here.
  // see PillarsInput.gender — luck-pillar direction only, and luck pillars do not
  // exist yet. Reading it anywhere in the natal computation would be a bug.
  void gender;

  const { y, m, d } = parseDate(date);
  const hasTime = time !== null && time !== undefined && time !== '';
  const { h, mi } = hasTime ? parseTime(time as string) : { h: NO_TIME_PROBE_HOUR, mi: 0 };

  const timeLikelyRounded = hasTime && (mi === 0 || mi === 30);
  const reasons: string[] = [];

  // The instant the pillars are read from. For a known birth time this IS the
  // birth instant; with no time it is a probe, which the 節-day branch below may
  // move onto the correct side of the boundary.
  let at = SolarTime.fromYmdHms(y, m, d, h, mi, 0);

  let solarTerm: SolarTermBoundary;
  let hourEdge: HourEdgeBoundary = { flagged: false };

  if (hasTime) {
    const term = checkSolarTerm(at);
    solarTerm = term.boundary;
    if (term.reason) reasons.push(term.reason);

    const edge = checkHourEdge(h, mi, timeLikelyRounded);
    hourEdge = edge.boundary;
    if (edge.reason) reasons.push(edge.reason);
  } else {
    const jieToday = jieWithinDay(at, y, m, d);
    if (!jieToday) {
      // Ordinary day: every hour yields the same month pillar. Nothing at risk.
      solarTerm = { flagged: false };
    } else {
      // A 節 falls inside the birth day, so the month pillar depends on which
      // side of it the birth sits — and with no time that is otherwise a coin
      // toss. `termSide` is the user telling us which side.
      const probe = termSide ? probeForSide(jieToday.instant, termSide) : null;
      if (probe) {
        at = SolarTime.fromYmdHms(y, m, d, probe.h, probe.mi, 0);
        solarTerm = { flagged: false, term: jieToday.term.getName(), resolvedBy: 'termSide' };
      } else {
        // Unresolved: NO_TIME_PROBE_HOUR picks the branch covering most of the
        // day. minutesFrom is deliberately absent — the uncertainty is a whole
        // day wide, not a couple of minutes.
        solarTerm = { flagged: true, term: jieToday.term.getName() };
        reasons.push(
          `birth time unknown and a 節 falls on ${formatInstant(jieToday.instant)} — ` +
          `month pillar resolved to the branch covering most of the day`,
        );
      }
    }
  }

  const eightChar = at.getLunarHour().getEightChar();
  const pillar = (cycle: { getHeavenStem(): { getName(): string }; getEarthBranch(): { getName(): string } }): Pillar => ({
    stem: cycle.getHeavenStem().getName(),
    branch: cycle.getEarthBranch().getName(),
  });

  const boundaryFlag = solarTerm.flagged || hourEdge.flagged;

  return {
    year: pillar(eightChar.getYear()),
    month: pillar(eightChar.getMonth()),
    day: pillar(eightChar.getDay()),
    // Still null: termSide resolves the MONTH, it never invents an hour pillar.
    hour: hasTime ? pillar(eightChar.getHour()) : null,
    // 命宮 reads the hour branch, so with no birth time there is nothing to
    // compute. Deriving it from the noon probe would fabricate a palace out of an
    // hour the user never supplied — the same trap as inventing an hour pillar.
    // 命宮 is deliberately NOT emitted — see the note on Pillars above.
    // 胎元 needs only the month pillar, so it is always real, and it is 5/5.
    conceptionPalace: pillar(eightChar.getFetalOrigin()),
    boundary: { solarTerm, hourEdge, timeLikelyRounded },
    boundaryFlag,
    ...(reasons.length > 0 ? { boundaryReason: reasons.join('; ') } : {}),
  };
}
