'use client';
// ============================================================
// The funnel — PROMOTED to the mirror pipeline (2026-08-23)
// ============================================================
// Until this commit the front door created a row through `POST /api/reading` and
// read hand-authored prose out of `contents/*hubungan*.md`, and the Rp 19.000
// paywall unlocked a 7-beat "Bacaan Mendalam" sliced from those same cells. All of
// that is retired. What a reader gets now:
//
//   FREE   the full mirror. Engine semantic JSON -> Gemini -> Stage 6 -> cache,
//          served by `/api/mirror/[token]`. Plus Card A as the shareable.
//   PAID   Rp 19.000 for the hi-res Card B and the Complete Edition PDF,
//          delivered by `/api/deliver/[token]/*` behind `row.paid === true`.
//          Offered AFTER the reading lands. NEVER a gate.
//
// ── WHY IT IS ONE COMMIT ──────────────────────────────────
// The route header for `/api/mirror/[token]` argues it and the argument is the
// reason this file changed all at once: retiring the gate and replacing the
// unvalidated prose are the same act. The paid beats and the free prose came from
// ONE source, so promoting the free half orphans the paid half in the same breath.
// And any partial state is visibly incoherent: the card names her Bambu where the
// legacy reading names her Akar (two live archetype name sets, five of ten
// disagreeing), and renaming the invoice alone would charge for a card and a PDF
// while handing over the deep read.
//
// ── WHAT THE FREE READING NO LONGER HIDES ─────────────────
// There is no teaser, no `LockedLines`, no blurred placeholder. The mirror is
// ungated BY DESIGN (CLAUDE.md, and its SUPERSEDED list names the test flag that
// once stood in for this). The offer below the reading is an upsell on an artifact,
// not a lock on a paragraph.
//
// ── THE THINGS THIS FILE MUST NOT INVENT ──────────────────
// `boundary` is exposed by the serve view and deliberately NOT rendered: prompt J
// only surfaces the flag, and the copy for "read this softly" is Reyner's pass.
// Nothing here writes a sentence about it.
// ============================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { CardA, CardB, CARD_A, exportSize } from './cards/Card.js';
import {
  downloadCard, captureCard, dataUrlToFile, canSharePngFiles, shareOrSave, SHARE_CANCELLED,
} from './cards/exportCards.js';

/**
 * Fire one funnel counter. FIRE AND FORGET, DELIBERATELY.
 *
 * Four of the eight events happen only in the browser, so they need a request of
 * their own. This one is never awaited for correctness and its failure is
 * swallowed: a counter may not delay a download, block a render, or surface an
 * error to a reader. `keepalive` so the card-download event survives the page
 * being navigated away from immediately after.
 *
 * The server refuses any event name outside the client-fireable four - see
 * `recordMirrorEvent`. This function does not need to know that list; it just
 * must not be relied upon.
 */
function fireEvent(token, event, extra = null) {
  if (!token) return;
  try {
    fetch(`/api/mirror/${token}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // `extra` carries the ONE payload any client event has: the product on
      // `interest_registered`. The server validates it against INTEREST_PRODUCTS
      // and refuses anything else, so this is a convenience, not a trust boundary.
      body: JSON.stringify({ event, ...(extra || {}) }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* a counter never breaks the page */ }
}
import { Reveal, Eyebrow, Button, Rule, BalanceBar, PillarCell, Icon, elColor, alpha } from './kit.jsx';
import { priceFor } from '../lib/pricing.js';
import { UPCOMING_COPY } from '../lib/site/copy.js';
import { formatIdr } from '../lib/site/format.js';

// Neutral, generic element glosses — describe the ELEMENT, not the person.
//
// KEYED ON THE GLOSSARY'S NAMES, which is a change: this map used to say `Bumi`
// and `element_presence` says `Tanah`. lib/semantic/glossary.js flags that exact
// drift in its own header, and with the legacy view layer gone the glossary is the
// only source of an element's Indonesian name.
const ELEMENT_GLOSS = {
  Kayu: 'tumbuh dan menjangkau',
  Api: 'menyala dan menghangatkan',
  Tanah: 'menopang dan menampung',
  Logam: 'memadat dan menajam',
  Air: 'mengalir dan meresap',
};
const RANGE = (n, from = 0) => Array.from({ length: n }, (_, i) => i + from);
// Accepted birth dates: 1900-01-01 through today. The engine supports 1900-2030,
// so today is always inside it. `max` is built from LOCAL time, not toISOString(),
// which is UTC and would rule out today for the first seven hours of every WIB day.
const EARLIEST_BIRTH_DATE = '1900-01-01';
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// The paid accent + canvas resolve from the element theme via CSS vars set once at
// the reading root (see themeVars). GLOW/SANCTUARY are indirections so every
// sanctuary surface follows the element instead of a hardcoded water tint.
const SANCTUARY = 'var(--el-sanctuary)';
const GLOW = 'var(--el-glow)';
const LIGHT = '#EAF1F2';
const wrap = { maxWidth: 460, margin: '0 auto', padding: '0 22px 96px' };

// The card display scale. Card A is 1080 wide and the column is 460 at most, so it
// is shown at roughly a third.
//
// IT IS A DISPLAY NUMBER AND NOTHING ELSE. The card is RENDERED at 1080x1440 and
// shrunk by a CSS transform on a wrapper; `captureCard` reads the layout box,
// which a transform does not change, so the export is 1:1 whatever this is set to.
// The previous version of this comment ended "nothing about the exported pixels
// depends on this number" while the capture was scaling the clone by its inverse -
// which is precisely how the exported pixels depended on it, and how the share card
// came out blank. Changing this value must not change a single exported pixel; the
// "vs bare1" column in `scripts/probe-card-export.mjs` is what holds that.
const CARD_SCALE = 0.34;

// Element theme → CSS vars, set ONCE at the reading root; every nested surface
// inherits the same accent.
function themeVars(element) {
  const t = elColor(element);
  return {
    '--el-glow': t.glow,
    '--el-sanctuary': t.bg,
    '--el-g30': alpha(t.glow, 0.30),
    '--el-g25': alpha(t.glow, 0.25),
    '--el-g22': alpha(t.glow, 0.22),
    '--el-g20': alpha(t.glow, 0.20),
    '--el-g16': alpha(t.glow, 0.16),
    '--el-g14': alpha(t.glow, 0.14),
    '--el-g12': alpha(t.glow, 0.12),
  };
}

const pad = (n) => String(n).padStart(2, '0');

/**
 * A card RENDERED at export size and shown small. Display only.
 *
 * ── WHY THE SCALE IS MEASURED AND NOT A CONSTANT ──
 * `CARD_SCALE` is picked for the widest the column ever gets (460 minus 22px of
 * padding each side). At a 375px viewport the column is 331, and 1080 x 0.34 is
 * 367 - so a fixed scale overflows by 36px on every phone, which is the whole
 * audience. Clipped, that takes 7px off the RIGHT EDGE OF THE CARD ITSELF and
 * leaves the field 29px on the left and 0 on the right.
 *
 * The card used to be a direct flex item at `scale={CARD_SCALE}`, and flex
 * SHRANK it to 331: the canvas re-centred its child, so the object stayed whole
 * and only the field got narrower. That was survivable to look at and fatal to
 * the export, because `captureCard` measured the shrunken node and scaled the
 * clone by 1080/331 instead of 1080/367. Rendering at export size fixed the
 * export and inherited the layout problem, because the card no longer shrinks -
 * it is a block child now, and block layout does not touch an explicit width.
 * Hence: measure the box, fit the scale to it, never exceed CARD_SCALE.
 *
 * The capture is unaffected either way. It reads `offsetWidth`, which is the
 * layout box and always 1080 here, whatever this scale is.
 */
function ScaledCard({ spec, max = CARD_SCALE, children }) {
  const box = useRef(null);
  const [k, setK] = useState(max);
  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const fit = () => setK(Math.min(max, el.clientWidth / exportSize(spec).w));
    fit();
    // Not a window resize listener: the column also changes width when a
    // scrollbar appears, which fires no resize event.
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [spec, max]);
  return (
    <div ref={box} style={{ width: '100%', maxWidth: exportSize(spec).w * max, height: exportSize(spec).h * k, overflow: 'hidden' }}>
      <div style={{ transform: `scale(${k})`, transformOrigin: 'top left' }}>{children}</div>
    </div>
  );
}

/**
 * The display bars, from `element_presence`.
 *
 * NORMALISED TO THE MAX, and that is display normalisation ONLY — rule 9 forbids
 * reading these as a strength score, and rule 10 records that a token tally
 * provably inverts on two fixture charts. The engine's own caveat travels with
 * them (`element_presence_note`), the same way the PDF prints it, rather than being
 * left to whoever reads the bar.
 */
function presenceBars(presence) {
  const entries = Object.entries(presence || {});
  const max = Math.max(1, ...entries.map(([, v]) => Number(v) || 0));
  return entries.map(([label, value]) => ({
    label,
    element: label,
    value: Number(value) || 0,
    pct: Math.round(((Number(value) || 0) / max) * 100),
  }));
}

export default function Funnel() {
  // THE PHASE IS THE SCREEN. `calculating` used to be one of these values and it
  // was never a screen of its own - it was a full-screen TAKEOVER that replaced
  // whichever screen the reader was on, which is exactly what commit 1 deletes.
  // Being in flight is now orthogonal to where she is, so it is `busy` below.
  const [phase, setPhase] = useState('input'); // input | season | result
  // `date` is an <input type="date"> value (YYYY-MM-DD) and `time` an
  // <input type="time"> value snapped to the hour (HH:00). MINUTES ARE NOT ASKED
  // HERE ON PURPOSE - see <Home> and the season branch in onSubmit.
  const [form, setForm] = useState({ date: '', time: '', gender: '' });
  const [error, setError] = useState(null);
  const [reading, setReading] = useState(null);
  // A create is in flight. It DISABLES THE CONTROL RATHER THAN HIDING IT, and the
  // disabling is not cosmetic: without it a reader who sees no feedback taps
  // again, fires a second POST and gets a SECOND reading - a second row and a
  // second `reading_created` event under a different reading_id, which inflates
  // the denominator of the demand test during the week it is being measured.
  const [busy, setBusy] = useState(false);
  // Set only on the ~12 days a year a season turns inside the birth date and that
  // turn is actually unresolved: { birthDate, term, at, birthHour }.
  const [season, setSeason] = useState(null);

  function reset() {
    setReading(null); setError(null); setSeason(null); setBusy(false); setPhase('input');
    if (typeof window !== 'undefined') window.history.pushState(null, '', '/');
  }

  /**
   * Create the reading, then read it. TWO CALLS, and the split is the pipeline's:
   * `POST /api/mirror` writes the row and deliberately does not render, so a create
   * can never quietly buy an LLM call; `GET /api/mirror/[token]` is where the cache
   * is consulted and a provider is called on a miss. The anticipation stays on
   * screen for the whole of it rather than for a fixed 2.5s, because a miss is a
   * real render and it is not instant.
   */
  async function createReading(birthDate, birthTime, resolution = {}) {
    const created = await fetch('/api/mirror', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        birthDate,
        birthTime: resolution.birthTime ?? birthTime,
        termSide: resolution.termSide ?? null,
        gender: form.gender || null,
      }),
    }).then((r) => r.json());
    if (created.error || !created.token) {
      setError(readableError(created)); setSeason(null); setPhase('input'); return;
    }

    // ── THE CHART GOES UP NOW. THE PROSE ARRIVES UNDER IT. ──
    //
    // `POST` returns the deterministic block with the token, so her four pillars,
    // element bars, 胎元 and her archetype's NAME are on screen before the render
    // starts. None of those are the model's work - rule 14 puts every fact in the
    // engine - and she used to wait p50 7.6s (up to ~23s at three attempts) with a
    // single static line of copy for facts that already existed.
    //
    // `pending` is what the reading renders a wordless skeleton for. NO COPY:
    // Reyner ruled 2026-08-26 that the loading words are written against what is
    // actually on screen, after this ships. The old anticipation lines describe
    // work she can now watch being already done.
    setReading({
      token: created.token, chart: created.chart, blocks: [], penutup: '',
      pending: true, birthDate, gender: form.gender || null,
    });
    // Bookmarkable without remounting: swap the URL via history.pushState, NOT
    // router.push, which would mount the /r route and discard this state.
    if (typeof window !== 'undefined') window.history.pushState(null, '', `/r/${created.token}`);
    setSeason(null);
    setPhase('result');

    const served = await fetch(`/api/mirror/${created.token}`).then((r) => r.json());
    if (served.error || !served.token) {
      setError(readableError(served)); setSeason(null); setPhase('input'); return;
    }

    // birthDate is kept CLIENT-SIDE for the card footer. The serve payload does not
    // carry it - lib/mirror/view.js builds the free card with `birthDate: null` so
    // no birth data leaves the server on the free path.
    //
    // The full payload carries `chart` under the same key POST did, from the same
    // `mirrorChartView`, so this merge replaces it with an identical object rather
    // than reconciling two shapes.
    setReading({ ...served, birthDate, gender: form.gender || null });
  }

  async function onSubmit(e) {
    e.preventDefault();
    // THE GUARD, AND IT IS NOT THE `disabled` ATTRIBUTE. A disabled button cannot
    // be clicked, but this handler is on the FORM: implicit submission, a stray
    // Enter, and a second tap that lands before React has re-rendered all reach
    // it anyway. `disabled` is the feedback; this line is the guarantee.
    if (busy) return;
    setError(null);
    const birthDate = form.date;
    if (!birthDate) { setError('Isi tanggal lahirmu dulu.'); return; }
    if (birthDate < EARLIEST_BIRTH_DATE || birthDate > today()) {
      setError('Periksa lagi tanggalnya. Katon menghitung kelahiran dari tahun 1900 sampai hari ini.');
      return;
    }
    // The hour, never the minute. Snapped rather than trusted: an <input type="time">
    // can still carry a minute when a browser ignores step, and a minute typed here
    // would be false precision. It cannot change a single pillar off a solar-term
    // day, and on one it is asked for properly, below.
    const birthTime = form.time ? `${form.time.slice(0, 2)}:00` : null;
    // SHE STAYS ON THE FORM. Nothing replaces the screen; the submit button below
    // carries the state.
    setBusy(true);
    try {
      // Ask whether a season turns inside this date BEFORE creating the reading, so
      // the row is written once, already resolved, rather than written and mutated.
      //
      // ASKED ON EVERY SUBMIT, not only when the time is blank. Hour-only input has
      // its own unresolved case: a 節 that falls INSIDE the hour she gave. Measured
      // on 1989-02-04 (立春 04:27:09): 04:00 gives 戊辰 乙丑, 04:30 gives 己巳 丙寅 -
      // two pillars different, off the minute alone.
      // THE 2,500ms PAUSE THAT USED TO SIT IN A Promise.all HERE IS DELETED. It was
      // never work: `docs/archive/MEMORY.md:64` calls it "a manufactured pause
      // framed as *reading her*" and `docs/handoff/2026-08-19-branch-pr.md:97` says
      // "the funnel's 2.5s pause is a designed pause, not a wait on work". The
      // number was three anticipation lines at 850ms. Commit 1 deleted that screen,
      // so the pause had nothing left to pace and read as unexplained waiting.
      //
      // DO NOT RESTORE IT AS A PROCESSING DELAY. Nothing here needs time. Reyner,
      // 2026-09-03: "Don't preserve the old ceremony by preserving dead scaffolding.
      // If the result feels too immediate on the phone, we design a new anticipation
      // treatment that EARNS the time rather than bringing back a silent 2.5s wait."
      const turn = await fetch('/api/season-check', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthDate }),
      }).then((r) => r.json()).catch(() => null);

      if (turn?.needsHour) {
        const birthHour = birthTime === null ? null : Number(birthTime.slice(0, 2));
        // With no time at all, the turn is a whole day wide. With an hour, only the
        // hour CONTAINING the turn is ambiguous - every other hour sits cleanly on
        // one side of it and needs no question.
        if (birthHour === null || birthHour === turn.hour) {
          setSeason({ birthDate, term: turn.term, at: turn.at, birthHour });
          setPhase('season');
          return;
        }
      }
      await createReading(birthDate, birthTime);
    } catch {
      setError('Ada yang salah. Coba lagi sebentar.');
      setPhase('input');
    } finally {
      // Cleared on EVERY exit, including the season branch's early return - the
      // gate's answer handler checks this same flag, so a `busy` left standing
      // there would wedge the gate shut on the ~12 days a year it appears.
      setBusy(false);
    }
  }

  // Answer from the season gate. `resolution` is { termSide } | { birthTime } | {}.
  //
  // THE GATE STAYS ON SCREEN, AND THIS IS THE EDGE THE TAKEOVER WAS HIDING. This
  // is the SECOND entry into an in-flight create, and unlike the first there is no
  // form behind it to return to. Falling back to <Home> would throw her backwards
  // past a question she has just answered, so `phase` is left at 'season' and
  // <SeasonGate> holds its own busy state - which it already had, for its own
  // double-answer guard, from before the takeover was deleted.
  async function onSeasonAnswer(resolution) {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await createReading(season.birthDate, null, resolution);
    } catch {
      setError('Ada yang salah. Coba lagi sebentar.');
      setPhase('input');
    } finally {
      setBusy(false);
    }
  }

  // THE CYCLING ANTICIPATION LINES ARE DELETED, AND THEY WERE HOURS OLD. #86's
  // commit C replaced a holding pair of timeouts with one wrapping interval, and
  // it was a real improvement to a screen that no longer earns its place: the
  // takeover was built when a reader waited the WHOLE render on an empty page
  // (p50 7.6s, up to ~23s), and chart-early cut that window to roughly 2.5s.
  // Ripple rings and cycling copy are ceremony for 2.5 seconds, and running them
  // in front of the prose skeleton put TWO loading treatments back to back in one
  // 22s funnel. Removing this is the ruling, not an accident, and it is recorded
  // here because a deletion this fresh reads like a botched merge otherwise.

  if (phase === 'input') return <Home form={form} setForm={setForm} error={error} onSubmit={onSubmit} busy={busy} />;
  if (phase === 'season') return <SeasonGate season={season} onAnswer={onSeasonAnswer} />;
  return <Reading reading={reading} onReset={reset} />;
}

function readableError(res) {
  // The mirror route's 429 is the one refusal worth naming: it is recoverable by
  // waiting, and "something went wrong" would send her to retry immediately.
  if (res?.error === 'rate_limited' || res?.error === 'session' || res?.error === 'ip') {
    return 'Terlalu banyak bacaan dari perangkat ini. Coba lagi nanti.';
  }
  return 'Ada yang salah. Coba lagi sebentar.';
}

/* ---------------- shared bits ---------------- */
function Wordmark({ light }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--clay)' }} />
      <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, letterSpacing: '.28em', fontSize: 13, color: light ? 'rgba(244,238,227,.9)' : '#3c3226' }}>KATON</span>
    </div>
  );
}
function FieldLabel({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted-warm)', margin: '0 0 10px' }}>{children}</div>;
}
function Section({ eyebrow, children, style }) {
  return (
    <div style={{ marginTop: 40, paddingTop: 34, borderTop: '1px solid var(--divider)', ...style }}>
      {eyebrow && <Reveal><Eyebrow style={{ marginBottom: 16 }}>{eyebrow}</Eyebrow></Reveal>}
      {children}
    </div>
  );
}
function Para({ children, style }) {
  return <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15.5, lineHeight: 1.75, color: 'var(--tinta-soft)', margin: 0, ...style }}>{children}</p>;
}

/* ---------------- Home (input) ---------------- */
function Home({ form, setForm, error, onSubmit, busy }) {
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target ? e.target.value : e }));
  return (
    <div style={wrap}>
      <div style={{ paddingTop: 60 }}>
        <Reveal><Wordmark /></Reveal>
        {/* THE PROMISE, AND IT COMES BEFORE THE ASK. Reyner's ruled copy, applied
            verbatim 2026-08-13; swept against lib/validate/blocklist.json, the
            typography rule and the slang list on 2026-08-12.

            DO NOT ADD "langkah aksi mingguan" OR "hasil dalam 30 detik" HERE OR
            ANYWHERE. The first promises a weekly cadence this product does not
            have; the second is a latency claim nothing measures. Both pass every
            automated gate, which is exactly why they are named in the code. */}
        <Reveal delay={0.08} style={{ marginTop: 44 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 34, lineHeight: 1.12, letterSpacing: '-.01em', color: 'var(--tinta)', margin: 0 }}>Ada pola di balik setiap keputusanmu.</h1>
        </Reveal>
        <Reveal delay={0.14}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.6, color: 'var(--tinta-soft)', margin: '12px 0 0' }}>Pahami dinamika diri, potensi, dan arah langkah berikutnya lewat bacaan yang objektif.</p>
        </Reveal>

        <form onSubmit={onSubmit}>
          <Reveal delay={0.22} style={{ marginTop: 28 }}>
            <div style={{ background: 'var(--kertas-2)', border: '1px solid var(--divider)', borderRadius: 20, padding: '18px 18px 20px', boxShadow: 'var(--shadow-card)' }}>
              {/* NATIVE PICKERS. `min` keeps it inside the engine's supported range
                  and `max` stops a birthdate in the future. */}
              <FieldLabel>Tanggal lahir</FieldLabel>
              <input type="date" value={form.date} onChange={set('date')} min={EARLIEST_BIRTH_DATE} max={today()} aria-label="Tanggal lahir" />

              <div style={{ height: 16 }} />
              {/* HOUR, NOT HOUR AND MINUTE. Measured 2026-08-12 against
                  calculateBaziChart: over 5,664 minute values on four ordinary
                  dates, ZERO changed a pillar. Every 時辰 boundary sits on an exact
                  odd hour (14:59 and 15:00 differ; 14:00 through 14:59 do not), so a
                  minute field on the front door collects precision that cannot be
                  used. The one place it CAN matter is a solar-term day, where the
                  season gate asks for it and explains why. `step=3600` asks the
                  browser for whole hours; onSubmit snaps regardless, because a
                  browser that ignores step must not turn into stored precision. */}
              <FieldLabel>Jam lahir · opsional</FieldLabel>
              <input type="time" step="3600" value={form.time} onChange={set('time')} aria-label="Jam lahir" />
              <div style={{ fontSize: 12, color: 'var(--muted-warm)', marginTop: 8, lineHeight: 1.5 }}>Jamnya saja sudah cukup. Bacaanmu tetap akurat tanpa ini, tapi kalau ada, beberapa lapisan jadi lebih dalam.</div>

              <div style={{ height: 16 }} />
              {/* GENDER IS BACK, AND THE CONDITION FOR RE-ADDING IT IS THIS COMMIT.
                  The note that stood here said it plainly: "re-add the field in the
                  same commit that ships a card, or the card ships with a footer that
                  can never fill." This commit ships both cards.

                  It still changes NOTHING the reading renders - `computePillars`
                  `void`s it (lib/bazi/pillars.ts) because it touches luck-pillar
                  direction only and no luck pillars exist. What it feeds is the CARD
                  FOOTER, where the 2026-08-03 ruling puts PEREMPUAN / LAKI-LAKI on
                  both cards.

                  OPTIONAL, and the null case is first-class rather than degraded:
                  `buildFooter` renders date + source with no placeholder and no gap
                  where a word would be. That is the same 08-03 ruling. */}
              <FieldLabel>Jenis kelamin · opsional</FieldLabel>
              <select value={form.gender} onChange={set('gender')} aria-label="Jenis kelamin">
                {/* THE EMPTY OPTION CARRIES NO LABEL, AND THE BLANK ROW IS THE POINT.
                    Ruled 2026-09-03. The date and time fields above are native
                    pickers with no placeholder, and `Tidak diisi` made this the one
                    control in the card that narrated its own empty state. Blank
                    matches its neighbours.

                    `value=""` IS UNCHANGED, so `form.gender || null` at both call
                    sites still resolves an unanswered field to null and the card
                    footer's first-class no-gender case (the 08-03 ruling above) is
                    untouched. This is a label edit; nothing downstream can tell. */}
                <option value=""></option>
                <option value="female">Perempuan</option>
                <option value="male">Laki-laki</option>
              </select>
            </div>
          </Reveal>

          <Reveal delay={0.3} style={{ marginTop: 22 }}>
            {error && <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</div>}
            {/* THE BUTTON CARRIES THE STATE, because nothing replaces the screen
                any more. `Menyiapkan...` is REUSED from the checkout button
                below rather than newly ruled - Reyner approved that string on
                2026-08-23 and rule 20 is one voice everywhere, so a second word
                for the same moment would be a second register. */}
            <Button type="submit" disabled={busy}>{busy ? 'Menyiapkan...' : 'Lihat Refleksiku'}</Button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 12.5, color: 'var(--muted-warm)', marginTop: 14 }}>
              <Icon.lock size={13} /> Bersifat pribadi. Hanya untukmu.
            </div>
          </Reveal>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Season gate (unchanged by promotion) ---------------- */
function SeasonGate({ season, onAnswer }) {
  const askMinute = season?.birthHour !== null && season?.birthHour !== undefined;
  const [mode, setMode] = useState(askMinute ? 'minute' : 'choose'); // choose | exact | minute
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [busy, setBusy] = useState(false);
  const at = season?.at || '';

  function answer(resolution) {
    if (busy) return;
    setBusy(true);
    onAnswer(resolution);
  }

  const choice = {
    width: '100%', textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: 15.5,
    fontWeight: 500, color: 'var(--tinta)', background: 'var(--kertas-2)',
    border: '1px solid var(--border)', borderRadius: 14, padding: '15px 18px',
    cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.5 : 1, transition: 'background .2s',
  };

  return (
    <div className="k-fade" style={{ ...wrap, paddingTop: 72 }}>
      <Reveal><Eyebrow>Hari yang jarang</Eyebrow></Reveal>

      <Reveal delay={0.06}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 30, lineHeight: 1.16, letterSpacing: '-.01em', color: 'var(--tinta)', margin: '16px 0 0' }}>
          Tanggal lahirmu jatuh tepat di hari pergantian musim.
        </h1>
      </Reveal>

      <Reveal delay={0.12}>
        <Para style={{ marginTop: 14 }}>
          {askMinute
            ? <>Hanya 12 hari dalam setahun seperti ini. Di tahun kelahiranmu, musimnya berganti tepat jam {at}, dan itu jatuh di dalam jam yang kamu isi.</>
            : <>Hanya 12 hari dalam setahun seperti ini. Di tahun kelahiranmu, musimnya berganti tepat jam {at}.</>}
        </Para>
      </Reveal>

      <Reveal delay={0.18} style={{ margin: '26px 0' }}><Rule width={120} /></Reveal>

      <Reveal delay={0.22}>
        <Para style={{ color: 'var(--tinta)' }}>
          {mode === 'minute'
            ? <>Menit berapa kamu lahir? Jawabannya menentukan pilar bulanmu: inti dari seluruh bacaan.</>
            : <>Kamu lahir sebelum atau setelah jam itu? Jawabannya menentukan pilar bulanmu: inti dari seluruh bacaan.</>}
        </Para>
      </Reveal>

      {/* Minute mode. The ONLY place Katon asks for a minute, and it asks because
          here it is the difference between two month pillars. The hour is already
          known, so it is shown fixed rather than re-asked. */}
      {mode === 'minute' ? (
        <Reveal style={{ marginTop: 22 }}>
          <div style={{ background: 'var(--kertas-2)', border: '1px solid var(--divider)', borderRadius: 20, padding: '18px 18px 20px', boxShadow: 'var(--shadow-card)' }}>
            <FieldLabel>Menit lahir</FieldLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 10, alignItems: 'center' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--tinta)' }}>{pad(season.birthHour)}:</div>
              <select value={minute} onChange={(e) => setMinute(e.target.value)} aria-label="Menit"><option value="">Menit</option>{RANGE(60).map((m) => <option key={m} value={m}>{pad(m)}</option>)}</select>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Button onClick={() => answer({ birthTime: `${pad(season.birthHour)}:${pad(minute)}` })} disabled={busy || minute === ''}>
              {busy ? 'Menyusun ulang...' : 'Lanjut'}
            </Button>
          </div>
          <button type="button" onClick={() => setMode('choose')} disabled={busy}
            style={{ display: 'block', margin: '14px auto 0', background: 'none', border: 'none', color: 'var(--muted-warm)', fontSize: 13.5, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            Aku tidak ingat menitnya
          </button>
        </Reveal>
      ) : mode === 'choose' ? (
        <Reveal delay={0.28} style={{ display: 'grid', gap: 10, marginTop: 22 }}>
          <button type="button" style={choice} disabled={busy} onClick={() => answer({ termSide: 'before' })}>
            Sebelum jam {at}
          </button>
          <button type="button" style={choice} disabled={busy} onClick={() => answer({ termSide: 'after' })}>
            Setelah jam {at}
          </button>
          {/* Not offered when she already gave an hour and has just said she does
              not remember the minute — asking for the clock time again is asking
              the same question she declined. */}
          {!askMinute && (
            <button type="button" style={choice} disabled={busy} onClick={() => setMode('exact')}>
              Aku ingat jam lahirku
            </button>
          )}
          <button type="button" style={{ ...choice, background: 'transparent', border: 'none', color: 'var(--muted-warm)', fontSize: 14, textAlign: 'center', padding: '10px 0' }}
            disabled={busy} onClick={() => answer({})}>
            Aku tidak yakin
          </button>
          {/* Both side answers resolve the MONTH pillar and carry no hour, so an
              hour given at the front door is dropped here. Said plainly rather
              than left as a silently missing pillar. */}
          {askMinute && (
            <div style={{ fontSize: 12.5, color: 'var(--muted-warm)', lineHeight: 1.55, textAlign: 'center', marginTop: 2 }}>
              Tanpa menitnya, pilar jam tidak bisa dipakai. Pilar bulanmu tetap tepat.
            </div>
          )}
        </Reveal>
      ) : (
        <Reveal style={{ marginTop: 22 }}>
          <div style={{ background: 'var(--kertas-2)', border: '1px solid var(--divider)', borderRadius: 20, padding: '18px 18px 20px', boxShadow: 'var(--shadow-card)' }}>
            <FieldLabel>Jam lahir</FieldLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <select value={hour} onChange={(e) => setHour(e.target.value)} aria-label="Jam"><option value="">Jam</option>{RANGE(24).map((h) => <option key={h} value={h}>{pad(h)}</option>)}</select>
              <select value={minute} onChange={(e) => setMinute(e.target.value)} aria-label="Menit"><option value="">Menit</option>{RANGE(60).map((m) => <option key={m} value={m}>{pad(m)}</option>)}</select>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted-warm)', marginTop: 8, lineHeight: 1.5 }}>
              Jamnya saja sudah cukup. Dengan ini kamu juga mendapat pilar keempat.
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Button onClick={() => answer({ birthTime: `${pad(hour)}:${pad(minute || 0)}` })} disabled={busy || hour === ''}>
              {busy ? 'Menyusun ulang...' : 'Lanjut'}
            </Button>
          </div>
          <button type="button" onClick={() => setMode('choose')} disabled={busy}
            style={{ display: 'block', margin: '14px auto 0', background: 'none', border: 'none', color: 'var(--muted-warm)', fontSize: 13.5, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            ← Kembali
          </button>
        </Reveal>
      )}
    </div>
  );
}

/* ---------------- Reading (the full mirror, ungated) ---------------- */
/**
 * ONE CONTINUOUS SCROLL, AND NOTHING IN IT IS WITHHELD.
 *
 * The block order is the ENGINE's. `blocks[]` arrives importance-ordered from Stage
 * 3 through the renderer, and re-sorting here would be the client second-guessing
 * the hierarchy - rule 14 inverted. There is no fixed heading map any more either:
 * the retired deep read had seven locked beat headings, and a mirror block carries
 * its own heading or none, so the client prints what it is given.
 *
 * PARAGRAPHS ARRIVE PRE-SPLIT. `lib/mirror/view.js` does it, because a block's
 * `text` separates paragraphs with two newlines and HTML collapses whitespace - a
 * client that dropped the raw string into one element would lose every break
 * SILENTLY and the reading would still read, just as a wall.
 */
/**
 * How long the skeleton and the prose overlap.
 *
 * IT MUST EQUAL `kSkelOut`'s DURATION in app/globals.css, and that is asserted
 * rather than trusted - two sources of truth for one duration is exactly the
 * shape that drifts silently, so tests/prose-handoff.spec.mjs reads the
 * stylesheet and compares. `animationend` would remove the second source
 * entirely and was rejected: it never fires for an element in a background tab
 * or with animations disabled, and a skeleton pinned over the reading forever is
 * a worse bug than the one being fixed. A timer always ends.
 */
export const PROSE_HANDOFF_MS = 450;

/**
 * THE PROSE REVEAL. Three numbers, and the third is the only one that is a
 * DESIGN CONSTRAINT rather than a taste setting.
 *
 * Reyner judged the previous version on his own machine: it read as INSTANT
 * rather than smooth. Two causes, both measured rather than guessed:
 *
 *   1. `--ease-quiet` is cubic-bezier(0.22, 1, 0.36, 1) - an ease-out-quint that
 *      spends almost nothing in its second half. Seeked on the real element it
 *      was 96% complete at t=180ms of a 360ms animation, so the duration was
 *      effectively half what it said. `--ease-prose` replaces it HERE ONLY;
 *      `--ease-quiet` is untouched and the rest of the site still uses it.
 *   2. The stagger was `Math.min(j, 2) * 0.03` where `j` is the index WITHIN a
 *      block, so it reset every block and all nine blocks started their first
 *      paragraph at zero. Not literally no stagger, but the whole reading moved
 *      as one, which is what "instant" was describing.
 *
 * THE STEP IS DERIVED FROM THE PARAGRAPH COUNT, NEVER HARDCODED, and that is the
 * point of `PROSE_REVEAL_BUDGET_MS`. A fixed per-item delay is what produced the
 * defect this whole branch started from: at 90ms across the ~17 paragraphs a real
 * reading carries, the last one would begin 1.4s after the first and the page
 * would trickle for seconds after loading had finished. The budget bounds the
 * WHOLE reveal - first paragraph's start to last paragraph's end - regardless of
 * how many arrive. Retune the feel here, in one place.
 */
export const PROSE_FADE_MS = 450;          // one paragraph's own fade
export const PROSE_REVEAL_BUDGET_MS = 1200; // first start -> last end, ALWAYS
export const PROSE_STEP_MAX_MS = 90;        // the step a short reading gets to use

/**
 * The delay for the `i`th paragraph of `total`, in seconds, in DOM order.
 *
 * `STEP_MAX` is a CEILING, not the step: a two-paragraph reading would otherwise
 * spread itself across the entire budget and read as two lonely beats. Short
 * readings get the natural rhythm; long ones compress to fit. Either way the last
 * paragraph has finished by `PROSE_REVEAL_BUDGET_MS`.
 */
export function proseDelayMs(i, total) {
  if (total <= 1) return 0;
  const room = PROSE_REVEAL_BUDGET_MS - PROSE_FADE_MS;
  return i * Math.min(PROSE_STEP_MAX_MS, room / (total - 1));
}

/**
 * Does this reader want no motion? Read at the moment the handoff starts rather
 * than subscribed to: a media query flipped mid-transition is not a scenario a
 * reader can produce, and the listener would outlive the reveal it governs.
 */
function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  catch { return false; }
}

export function Reading({ reading, onReset, initialStage }) {
  const chart = reading.chart;
  // ── THE PROSE HANDOFF ──────────────────────────────────
  //
  // 'gone' | 'holding' | 'crossing'. The skeleton does not unmount when `pending`
  // flips; it CROSSES OVER the prose and leaves once the prose is visibly taking
  // its place. The property Reyner ruled is that at no frame is this region
  // blank, and the old code broke it in one React commit: skeleton out and prose
  // in together, with `.k-rise`'s `fill: both` holding the prose at opacity 0.
  // Measured: docs/qa/2026-09-03-skeleton-to-prose-gap.md.
  const pending = !!reading.pending;
  // Read ONCE, not subscribed to: a media query flipped mid-transition is not a
  // scenario a reader can produce, and a listener would outlive the 360ms it
  // governs. The lazy initialiser is what keeps it out of the render body.
  const [reduceMotion] = useState(prefersReducedMotion);
  // STARTS false EVEN WHEN `pending` IS TRUE. Seeding it from `pending` armed the
  // cross-fade before `reduceMotion` had been consulted, so a reader who asked for
  // no motion got one anyway - caught by the reduced-motion assertion below. The
  // render-time line further down is the ONLY thing that arms it, and it checks.
  const [armed, setArmed] = useState(false);

  // DERIVED DURING RENDER, NOT IN AN EFFECT, AND THAT IS THE WHOLE CORRECTNESS
  // ARGUMENT. An effect runs AFTER the browser paints, so a version of this that
  // set 'crossing' from useEffect produced a real intermediate frame with the
  // skeleton still IN FLOW beside the prose. Measured in a browser, not reasoned
  // about: the first paragraph sat at y=430 on that paint and at y=304 on the
  // next one, a 126px jump - the exact thing the overlap exists to prevent, and
  // invisible to a jsdom test because act() collapses the two renders into one.
  // REDUCED MOTION NEVER ARMS IT AT ALL, rather than arming and then undoing it.
  // Same instant swap either way, but nothing has to be cleaned up afterwards.
  if (pending && !armed && !reduceMotion) setArmed(true);
  const crossing = armed && !pending;
  const showSkeleton = pending || crossing;

  // REDUCED MOTION KEEPS ITS INSTANT, GAPLESS SWAP, and it gets it from never
  // being armed rather than from a timer - the skeleton is gone in the SAME render
  // that mounts the prose. It is the one path that never had this defect
  // (globals.css disables .k-rise under it, so the prose is readable on arrival),
  // and crossing a non-fading skeleton over it would be a NEW defect: opaque bars
  // sitting on top of readable text.
  useEffect(() => {
    if (pending || !armed) return undefined;
    const id = setTimeout(() => setArmed(false), PROSE_HANDOFF_MS);
    return () => clearTimeout(id);
  }, [pending, armed]);

  // The reveal's running index, computed once per render rather than by mutating
  // a counter inside the JSX - `proseOffsets[i]` is how many paragraphs precede
  // block `i` down the page, so block-local `j` still keys the map while the
  // DELAY comes from the global position. `penutup` is one more item at the end.
  const { proseOffsets, proseTotal } = useMemo(() => {
    const offsets = [];
    let n = 0;
    for (const b of (reading.blocks || [])) { offsets.push(n); n += (b.paragraphs || []).length; }
    return { proseOffsets: offsets, proseTotal: n + (reading.penutup ? 1 : 0) };
  }, [reading.blocks, reading.penutup]);

  const element = chart?.day_master?.element;
  const el = elColor(element);
  const bars = presenceBars(chart?.element_presence);

  let domIdx = -1; let minIdx = -1; let maxPct = -1; let minPct = 101;
  bars.forEach((b, i) => {
    if (b.pct > maxPct) { maxPct = b.pct; domIdx = i; }
    if (b.pct < minPct) { minPct = b.pct; minIdx = i; }
  });

  const arch = chart?.archetype || {};
  // The card footer's date and gender are the CLIENT's - the free payload carries
  // neither (lib/mirror/view.js). On a re-access there is no session and no date,
  // and `buildFooter` treats that as a first-class case rather than a gap.
  const cardData = reading.card
    ? { ...reading.card, footer: mergeFooter(reading.card.footer, reading.birthDate, reading.gender) }
    : null;

  return (
    <div className="k-fade" style={{ ...wrap, ...themeVars(element) }}>
      <button onClick={onReset} style={{ background: 'none', border: 'none', color: 'var(--muted-warm)', fontSize: 13, cursor: 'pointer', padding: '18px 0 0', fontFamily: 'var(--font-sans)' }}>← Ganti tanggal</button>

      {/* persona. RULE 23's BRACKET-ONCE: the Indonesian name leads and the English
          pair appears once, here, and never again in the body. */}
      <Reveal><Eyebrow>Refleksimu</Eyebrow></Reveal>
      <Reveal delay={0.06}><div style={{ fontFamily: 'var(--font-serif)', fontSize: 44, lineHeight: 1, color: el.deep, margin: '16px 0 0' }}>{arch.name_id}</div></Reveal>
      {arch.name_en && <Reveal delay={0.1}><p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, lineHeight: 1.4, color: 'var(--kayu)', margin: '12px 0 0' }}>{arch.name_en}</p></Reveal>}
      <Reveal delay={0.14}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 11.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--tinta-soft)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: el.mid }} /> {element}{chart?.day_master?.stem ? ` · ${chart.day_master.stem}` : ''}
        </div>
      </Reveal>

      {/* THE PROSE, AND THE SKELETON THAT HANDS THE SPACE OVER TO IT.
          Wordless on purpose - see .k-skel in globals.css and the ruling behind
          it. The bar widths are uneven so the block reads as paragraphs rather
          than as a progress meter, which would imply a completion it cannot
          know. `aria-hidden` with a polite live region carrying nothing: a screen
          reader is told the reading is loading by the region appearing, not by a
          decorative bar it would otherwise read as content.

          `display: flow-root` IS LOAD-BEARING AND NOT A TIDY-UP. It stops the
          children's top margins collapsing THROUGH this wrapper, which is what
          makes `top: 0` on the departing skeleton land in exactly the same place
          as its in-flow position: both the skeleton and the first Section carry
          marginTop 34 inside the same block formatting context. Without it the
          wrapper's edge moves with its first child and the overlay jumps 34px on
          the frame it goes absolute. */}
      <div style={{ position: 'relative', display: 'flow-root' }}>
        {showSkeleton && (
          // WHILE CROSSING IT IS OUT OF FLOW. The prose is far taller than four
          // 13px bars; a departing skeleton still taking layout would push the
          // whole reading down and let it snap back on unmount - a jump in the
          // middle of the cross-fade. `aria-busy` is dropped the moment the prose
          // is real, so a screen reader is not told a finished reading is loading.
          //
          // NO marginTop ON THIS BOX, IN EITHER STATE, AND IT IS NOT AN OVERSIGHT.
          // The 38 lives on the first bar and is the only offset in play. When this
          // box is static that margin collapses out through it (no border, no
          // padding) and the bar lands 38px below the wrapper; when it is absolute
          // the box establishes a block formatting context, the margin STOPS
          // collapsing, and it lands 38px below `top: 0` - the same place. A
          // marginTop of 34 here read identically in the source and moved the bars
          // 34px on the frame they went absolute, because only one of the two
          // states collapsed it away.
          <div data-prose-skeleton
            className={crossing ? 'k-skel-exit' : undefined}
            aria-busy={pending ? 'true' : undefined}
            aria-hidden={crossing ? 'true' : undefined}
            style={crossing
              ? { position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none' }
              : undefined}>
            {[[38, 92], [0, 100], [0, 86], [0, 64]].map(([mt, w], i) => (
              <div key={i} aria-hidden="true" className="k-skel"
                style={{ height: 13, width: `${w}%`, marginTop: i ? 12 : mt }} />
            ))}
          </div>
        )}

        {/* the reading. `.k-prose` RATHER THAN <Reveal>, which is `.k-rise`: that
            one is 0.8s from opacity 0 and is used all over the site, so it is
            left alone and a slower, differently eased reveal is used here.

            THE INDEX IS GLOBAL AND IN DOM ORDER - `proseIndex`, not `j`. It used
            to be the index within a block, which reset at every heading and
            started nine first paragraphs simultaneously. The reveal has to read
            as ONE sequence down the page, so the counter has to run down the
            page too. `penutup` is the last item in that sequence and takes the
            last delay rather than a hardcoded one. */}
        {(reading.blocks || []).map((b, i) => (
          <Section key={i} eyebrow={b.heading || undefined} style={i === 0 ? { marginTop: 34 } : undefined}>
            {(b.paragraphs || []).map((p, j) => (
              <div key={j} className="k-prose"
                style={{ animationDelay: `${proseDelayMs(proseOffsets[i] + j, proseTotal)}ms` }}>
                <Para style={{ marginTop: j ? 14 : 0 }}>{p}</Para>
              </div>
            ))}
          </Section>
        ))}
        {reading.penutup && (
          <div className="k-prose"
            style={{ animationDelay: `${proseDelayMs(proseTotal - 1, proseTotal)}ms`, marginTop: 34 }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, lineHeight: 1.6, color: 'var(--kayu)', margin: 0 }}>{reading.penutup}</p>
          </div>
        )}
      </div>

      {/* Bagan Kelahiran — the legitimacy object. RULE 23's KEEP SIDE: the eight
          characters ARE the chart and they are what lets a reader cross-check Katon
          against any other calculator. Never bare - each carries its animal and
          element. */}
      {chart?.pillars?.length > 0 && (
        <Section eyebrow="Bagan Kelahiran">
          <Reveal><p style={{ fontSize: 13, color: 'var(--muted-warm)', margin: '-6px 0 16px', lineHeight: 1.55 }}>Empat lapisan energi dari tanggal lahirmu. Yang di tengah adalah intinya.</p></Reveal>
          <Reveal delay={0.06}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${chart.pillars.length},1fr)`, gap: 9 }}>
              {chart.pillars.map((p) => (
                <PillarCell key={p.position} label={p.palace} stem={p.stem} branch={p.branch}
                  elementId={p.element} element={p.element} polarity={p.animal} isDayMaster={p.is_day_master} />
              ))}
            </div>
          </Reveal>
          {/* 胎元 — display only, no interpretation, and no invented label. Reyner
              ruled `pilar.conception` carries NO label_meaning on purpose (2026-08-07);
              it prints because Joey prints it and a cross-checking reader notices its
              absence. 命宮 is deliberately absent: two candidate conventions score
              4/5 and 3/5 against Joey's own printed values, and in a block whose only
              job is to be checkable a wrong value is worse than a missing one. */}
          {chart.conception_pillar && (
            <Reveal delay={0.12} style={{ marginTop: 14 }}>
              <div style={{ textAlign: 'center', border: '1px solid var(--divider)', borderRadius: 12, padding: '10px 4px', background: 'var(--kertas-2)', maxWidth: 180, margin: '0 auto' }}>
                <div style={{ fontSize: 9.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted-warm)' }}>{chart.conception_pillar.label}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--tinta)', margin: '5px 0 2px' }}>{chart.conception_pillar.hanzi}</div>
                <div style={{ fontSize: 10.5, color: 'var(--muted-warm)' }}>{chart.conception_pillar.element} · {chart.conception_pillar.animal}</div>
              </div>
            </Reveal>
          )}
        </Section>
      )}

      {/* Sebaran Unsur. THE ENGINE'S OWN CAVEAT TRAVELS WITH THE NUMBERS - rule 9
          forbids reading these as a strength score, and the note is the engine's
          words rather than the client's. */}
      {bars.length > 0 && (
        <Section eyebrow="Sebaran Unsur">
          {chart.element_presence_note && <Reveal><p style={{ fontSize: 13, color: 'var(--muted-warm)', margin: '-6px 0 18px', lineHeight: 1.55 }}>{chart.element_presence_note}</p></Reveal>}
          <div style={{ display: 'grid', gap: 16 }}>
            {bars.map((b, i) => (
              <Reveal key={b.label} delay={i * 0.04}>
                <BalanceBar label={b.label} gloss={ELEMENT_GLOSS[b.label]} pct={b.pct} element={b.element} isDominant={i === domIdx} isMissing={i === minIdx} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* the free shareable — Card A. It replaces the retired <Sharecard>, and the
          reason it can sit beside the reading now is that both name her archetype
          from the same glossary. */}
      {/* EYEBROW AND LEAD, REYNER-APPROVED 2026-08-23 ("SHIP AS PROPOSED").
          Exact bytes, and not re-swept: prompt S is explicit that a check now
          rejecting one of these is presumed WRONG until its history is read. */}
      {cardData && (
        <Section eyebrow="Bagikan kartumu" style={{ marginTop: 52 }}>
          <Reveal><p style={{ fontSize: 13, color: 'var(--muted-warm)', margin: '-6px 0 18px', lineHeight: 1.55 }}>Satu kartu ringkas tentang dirimu, siap kamu simpan atau kirim ke siapa pun.</p></Reveal>
          <ShareCardA data={cardData} token={reading.token} />
        </Section>
      )}

      {/* the offer. AFTER the reading, never in front of it. */}
      <div style={{ marginTop: 52 }}><Offer reading={reading} initialStage={initialStage} /></div>

      {/* THE UPCOMING BLOCK, AND IT SITS BELOW THE ARTIFACT DECISION ON PURPOSE.
          Ruled order: Mirror -> Artifact decision -> Compat / Annual interest.
          One live purchase CTA per moment; these two are secondary signals and
          must never read as a second thing to buy. */}
      <div style={{ marginTop: 44 }}><Upcoming reading={reading} /></div>
    </div>
  );
}

/** The client's own footer values, merged over the server's date-less one. */
function mergeFooter(footer, birthDate, gender) {
  if (!birthDate && !gender) return footer;
  const label = gender === 'female' ? 'PEREMPUAN' : (gender === 'male' ? 'LAKI-LAKI' : null);
  const date = formatCardDate(birthDate);
  return {
    ...footer,
    gender: label,
    date,
    left: [label, date].filter(Boolean).join(' | '),
  };
}

/**
 * `1989-09-13` -> `13 Sep 1989`.
 *
 * A SECOND IMPLEMENTATION OF `formatCardDate`, and it is deliberate rather than
 * sloppy: `lib/card/cardData.js` is reached through `server-only` modules on every
 * path that imports it, and this is a client component. The month table is the same
 * three-letter Indonesian set, and `tests/card.spec.mjs` pins the server's. If the
 * two ever disagree the card's footer disagrees with the paid card's footer, which
 * is why they are named for each other here.
 */
const ID_MONTHS_CLIENT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
function formatCardDate(iso) {
  if (!iso || typeof iso !== 'string') return '';
  const [y, m, d] = iso.split('-');
  const mi = parseInt(m, 10) - 1;
  if (!(mi >= 0 && mi < 12)) return iso;
  return `${parseInt(d, 10)} ${ID_MONTHS_CLIENT[mi]} ${y}`;
}

/**
 * Card A, rendered and downloadable.
 *
 * THE SHARE CAPTURE, not the download one. `captureSpec` rules the difference:
 * share takes the CANVAS (1080x1440, field included) because the field is what
 * makes the file feed-safe, and download takes the OBJECT. The object alone is
 * 63:88, which is neither 3:4 nor 4:5, so every platform letterboxes or auto-crops
 * it - and an auto-crop takes the top and bottom of a card whose headline is at the
 * top and whose seal is at the bottom.
 */
/**
 * THE CARD DATA THAT REACHES PIXELS, as one comparable string.
 *
 * This is the eager capture's staleness assertion and it is the whole reason the
 * capture is allowed to be eager. `data` is rebuilt on the client and the FOOTER
 * MERGES THE BIRTH DATE AFTER MOUNT (measured: `13 SEP 1989` appearing late), so a
 * capture taken too early ships a card with the wrong footer and nothing looks
 * wrong. Prompt S: "a silently stale File is worse than a slow one."
 *
 * A whole-object stringify rather than a field list, deliberately: a field list is
 * a second copy of "what the card draws" that goes stale the first time the card
 * draws something new, silently, in the direction of sharing a wrong card.
 */
function cardStamp(data) {
  try { return JSON.stringify(data); } catch { return null; }
}

export function ShareCardA({ data, token, capture = captureCard }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  // { dataUrl, file, stamp } from the eager capture, or null.
  const [ready, setReady] = useState(null);

  const stamp = useMemo(() => cardStamp(data), [data]);
  const filename = `katon-${(data.nameEn || 'kartu').toLowerCase().replace(/\s+/g, '-')}.png`;

  // THE LABEL IS RIGHT FROM FIRST PAINT, which needs a detection that does not
  // wait on the capture. Keying this off the eager File made the button read
  // `Simpan Gambar` and then flip to `Bagikan Kartu` a second later, changing
  // under the reader's eyes - seen in a browser, not predicted. `canSharePngFiles`
  // asks the same question with a one-byte probe, because `canShare` is about the
  // payload's TYPE rather than its bytes. The real file is still checked inside
  // `shareOrSave` before anything is handed over.
  //
  // RESOLVED DURING RENDER, NOT IN AN EFFECT. There is no hydration hazard here:
  // `reading` starts null and arrives from a client fetch, so the first render that
  // contains this component is already on the client. An effect that setState'd the
  // answer was written first and `react-hooks` refused it, correctly - it was a
  // cascading render for a value that was available all along.
  const shareSupported = useMemo(() => canSharePngFiles(), []);

  // ── THE EAGER CAPTURE. APPROVED BY REYNER 2026-08-23. ──
  // `navigator.share` needs an active user activation, and the capture is not
  // instant (61 font requests measured for one card). On iOS Safari an await of
  // that length between the tap and `share()` consumes the activation: the sheet
  // never opens and nothing says why. So the File is in hand before she taps.
  //
  // CONDITION 1 - IT MUST NOT BLOCK OR DELAY THE READING. It is kicked off the
  // critical path in a timeout, and a failure here is swallowed: a reader who has
  // tapped nothing must never see an error about a capture she did not ask for.
  // The tap path re-captures, so a failed eager capture costs latency, not the card.
  //
  // CONDITION 2 - IT MUST BE INVALIDATED IF THE CARD DATA CHANGES. Keyed on
  // `stamp`, so a late footer merge re-runs it, and `share()` re-checks the stamp
  // before using what this stored.
  useEffect(() => {
    if (!stamp) return undefined;
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const dataUrl = await capture('share', 'A', { id: 'card-a' });
        if (cancelled) return;
        setReady({ dataUrl, file: dataUrlToFile(dataUrl, filename), stamp });
      } catch { /* never surfaced: she has not asked for anything yet */ }
    }, 0);
    return () => { cancelled = true; clearTimeout(t); };
  }, [stamp, filename, capture]);

  async function share() {
    setFailed(false);
    // THE STALENESS ASSERTION, and it is the reason `ready` carries its stamp at
    // all. A File captured against different data is DISCARDED here rather than
    // shared - the cost is one re-capture, and the alternative is a card in her
    // feed with somebody else's footer.
    const fresh = ready && ready.stamp === stamp ? ready : null;

    if (fresh) {
      // NOTHING IS AWAITED BEFORE `share()` ON THIS PATH. That is the entire point
      // of the eager capture; adding an await here would restore the iOS bug it
      // was approved to prevent.
      const result = await shareOrSave({ file: fresh.file, dataUrl: fresh.dataUrl, filename });
      if (result !== SHARE_CANCELLED) fireEvent(token, 'card_downloaded');
      return;
    }

    // NO FRESH FILE: capture now. Slower, and on iOS this is the path that can
    // lose the activation - `shareOrSave` then saves instead of sharing, which is
    // the degrade this whole change is landed behind.
    setBusy(true);
    try {
      const dataUrl = await capture('share', 'A', { id: 'card-a' });
      setReady({ dataUrl, file: dataUrlToFile(dataUrl, filename), stamp });
      const result = await shareOrSave({ file: dataUrlToFile(dataUrl, filename), dataUrl, filename });
      // COUNTED ONLY ON SUCCESS, and cancelling is not success. A capture that
      // threw produced no file, and the share-rate denominator must not include
      // deliveries that did not happen - this button shipped BLANK once (#74),
      // which is exactly the failure a fire-on-click counter would have hidden
      // behind a healthy-looking rate.
      if (result !== SHARE_CANCELLED) fireEvent(token, 'card_downloaded');
    } catch {
      setFailed(true);
    }
    setBusy(false);
  }
  return (
    <>
      <Reveal delay={0.06} style={{ display: 'flex', justifyContent: 'center' }}>
        {/* RENDERED AT EXPORT SIZE, SHRUNK FOR DISPLAY ONLY.
            `captureCard` captures this node at 1:1 and refuses a node laid out
            at anything else, because scaling the clone back up is what blanked
            the share card. A CSS transform does not change the layout box, so
            #card-a stays at EXPORT SIZE to the capture while the reader sees it
            at whatever fits her column. See ScaledCard.

            CORRECTED 2026-09-02: this said "stays 1080x1440", which prompt R
            retired. Card A is 1080x1350, full-bleed, with no canvas and no mat -
            `CARD_A` in components/cards/Card.js:109 has no `canvas` key at all,
            and card-polish-spec.md §10 is the authority. The number is not
            restated here on purpose: a size written in a comment beside a
            component that reads `spec` is a second source of truth, and this one
            had already gone stale once. */}
        <ScaledCard spec={CARD_A}>
          <CardA data={data} scale={1} id="card-a" />
        </ScaledCard>
      </Reveal>
      <Reveal delay={0.12} style={{ marginTop: 20 }}>
        {/* COPY RULED BY REYNER 2026-08-23, "SHIP AS PROPOSED". Exact bytes.
            REYNER-APPROVED 2026-08-23: `Bagikan Kartu`, `Menyiapkan...`.
            The label says what the button does; on the fallback path it genuinely
            is a save, so that path keeps `Simpan Gambar` - one capture, two
            destinations, two honest labels. `shareSupported` is resolved from the
            EAGER FILE rather than from `navigator.share`, for the same reason the
            detection is: a browser that has `share` and refuses files must read
            the save label, not the share one. */}
        <Button variant="gold" onClick={share} disabled={busy} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon.save size={17} /> {busy ? 'Menyiapkan...' : (shareSupported ? 'Bagikan Kartu' : 'Simpan Gambar')}
        </Button>
        {/* REYNER-APPROVED, unchanged. A cancelled share sheet never reaches this. */}
        {failed && <div style={{ color: 'var(--red)', fontSize: 13, marginTop: 10 }}>Gambarnya gagal dibuat. Coba lagi.</div>}
      </Reveal>
    </>
  );
}

/* ---------------- The offer: Rp 19.000, card + PDF ---------------- */
/**
 * AN UPSELL, NOT A GATE. Nothing above this point is hidden, and the closing line
 * is the FREE-is-never-a-gate guarantee - Reyner's string, reused verbatim from
 * `SITE_COPY.harga.artifact.noteAfter` rather than re-worded here.
 *
 * ── THE POLL WATCHES THE DELIVERY, NOT THE READING ────────
 * It used to poll `/api/reading/[id]/full` and wait for paid PROSE to appear. There
 * is no paid prose any more, so it polls the delivery manifest and waits for the
 * two items to become ready. That is one predicate for both artifacts by design
 * (`lib/deliver/handlers.js`): they are bought together, gated together, and
 * refused together.
 */
function Offer({ reading, initialStage }) {
  // offer | pending | delivered
  const [stage, setStage] = useState(initialStage || 'offer');
  // `offer_seen` FIRES WHEN THE OFFER IS ACTUALLY OFFERED, not when the component
  // mounts in some other stage. A reader returning to a delivered reading is not
  // being shown an offer, and counting her would inflate the denominator that
  // artifact conversion divides by. The ref keeps a re-render from re-firing;
  // the unique index would dedupe it anyway, but a counter that spams its own
  // endpoint is still wrong.
  const seenRef = useRef(false);
  useEffect(() => {
    if (seenRef.current) return;
    if ((initialStage || 'offer') !== 'offer') return;
    seenRef.current = true;
    fireEvent(reading?.token, 'offer_seen');
  }, [reading?.token, initialStage]);
  const [invoiceUrl, setInvoiceUrl] = useState(null);
  const [busy, setBusy] = useState(false);
  const pollRef = useRef(null);

  async function startCheckout() {
    if (busy) return;
    setBusy(true);
    const res = await fetch(`/api/pay/${reading.token}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).then((r) => r.json()).catch(() => null);
    // Open the Xendit checkout (QRIS) in a new tab; this tab keeps polling and
    // unlocks when the verified webhook flips paid. Triggered from the click gesture
    // so it is not popup-blocked, and a fallback link shows in the pending state.
    if (res?.invoiceUrl) { setInvoiceUrl(res.invoiceUrl); window.open(res.invoiceUrl, '_blank', 'noopener'); }
    setBusy(false);
    setStage('pending');
  }

  useEffect(() => {
    if (stage !== 'pending') return;
    let tries = 0;
    pollRef.current = setInterval(async () => {
      tries += 1;
      const m = await fetch(`/api/deliver/${reading.token}`).then((x) => x.json()).catch(() => null);
      if (m?.paid && m.items?.length && m.items.every((i) => i.ready)) {
        clearInterval(pollRef.current);
        setStage('delivered');
      }
      if (tries > 60) clearInterval(pollRef.current);
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [stage, reading.token]);

  if (stage === 'delivered') return <Delivery token={reading.token} />;
  if (stage === 'pending') return <Pending invoiceUrl={invoiceUrl} />;

  return (
    <Reveal>
      <div style={{ position: 'relative', overflow: 'hidden', background: SANCTUARY, borderRadius: 26, padding: '30px 24px 26px', color: LIGHT, boxShadow: 'var(--shadow-deep)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.22em', textTransform: 'uppercase', color: GLOW, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon.sparkle size={14} /> Complete Edition
        </div>
        {/* REYNER-APPROVED, and RESTORED rather than written. This is the artifact
            body from before 2026-08-05, when it was replaced because the paid path
            delivered a 7-beat reading and there was no card and no PDF behind it.
            The delivery exists now, so the string it was replaced FOR is the string
            that comes back. */}
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 20, lineHeight: 1.5, color: '#F2F6F6', margin: '20px 0 0' }}>Kartu resolusi tinggi dan PDF dari bacaanmu, siap disimpan atau dicetak.</p>

        <div style={{ height: 24 }} />
        <div style={{ background: 'rgba(9,18,21,.4)', border: '1px solid var(--el-g22)', borderRadius: 16, padding: 18 }}>
          {/* `flexWrap` IS THE LOAD-BEARING HALF. MEASURED IN THE BROWSER 2026-09-02:
              at 320px the row has 190px and its two children need 226px together
              (price 135.3 + gap 8 + label 82.7). Without wrapping, the label does not
              shrink - it OVERFLOWS THE PANEL, right edge 291px against the panel's
              274px - and the item that gives way instead is the one that can still
              break internally: the PRICE, orphaning "Rp" above "19.000" at 32px serif.
              Wrapping moves the break to the gap BETWEEN them, a seam that already
              exists, and the label drops to its own line under the amount.

              ONLY AT 320. Measured at 375 / 390 / 414 the row is 51.2px tall and the
              label still sits beside the price, unchanged. */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            {/* Resolved from lib/pricing.js, never hardcoded: the offer must show
                exactly what the invoice charges.

                `nowrap` IS A GUARD AND NOT THE FIX, and it is written that way because
                the measurement says so rather than because it reads better. With the
                flexWrap above in place, removing this changes NOTHING at 320px: the
                label has already dropped, so the price owns the full 190px and its
                135.3px fits. It engages below roughly 266px of viewport, where the row
                is narrower than the price itself - measured at 260px (row 130px), the
                price is 51.2px tall with it and 102.4px without.

                It stays because `formatIdr` writes "Rp 19.000" with a space, a space is
                a break opportunity, and an amount is one token. Pinning it is cheaper
                than trusting the widths nobody tests. */}
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, color: '#fff', whiteSpace: 'nowrap' }}>{formatIdr(priceFor('artifact'))}</div>
            {/* `nowrap`, for the same reason the upcoming-products price below
                carries it. MEASURED IN THE BROWSER 2026-09-02, not assumed:

                  375px (iPhone-class)  label needs 82.7px, has 101.7px - 19px spare
                  320px (iPhone SE)     height 17.6px -> 35.2px, i.e. two lines

                So it does NOT wrap at 375 and DOES at 320, where it reads as two
                stacked labels beside a 32px price. The headroom at 375 is 19px,
                which a longer price string eats on its own - `formatIdr(priceFor())`
                resolves at render time and Rp 149.000 is wider than Rp 19.000. Two
                words at .1em tracking cost nothing to pin. */}
            <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: GLOW, whiteSpace: 'nowrap' }}>sekali bayar</div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Button onClick={startCheckout} disabled={busy} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {busy ? 'Menyiapkan pembayaran...' : <>Ambil Complete Edition <Icon.arrow size={17} /></>}
            </Button>
          </div>
          {/* THE GUARANTEE, AND IT IS NOT OPTIONAL. Verbatim from
              SITE_COPY.harga.artifact.noteAfter, which is where it already carries
              Reyner's approval. */}
          <div style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(234,241,242,.7)', marginTop: 14, textAlign: 'center' }}>Melewatinya tidak mengurangi apa pun dari bacaan gratismu.</div>
        </div>
      </div>
    </Reveal>
  );
}

/* ---------------- Upcoming: two products, no checkout ---------------- */
/**
 * THE SECOND DENOMINATOR, AND IT IS NOT A STORE.
 *
 * Prompt Q commit 4. Compat and Annual are priced (lib/pricing.js) and NOT
 * sellable (SELLABLE_SKUS is ['artifact']). Nothing here calls /api/pay, and if a
 * future edit makes either product reachable by that route, that edit is wrong -
 * taking money for an unbuilt product is the failure the sellable list exists to
 * prevent.
 *
 * ── EVERY STRING HERE IS UNRULED ──
 * They come from UPCOMING_COPY and each one is currently a visible
 * `@@UNRULED: ...@@` placeholder. Reyner is the sole authority on Indonesian
 * register and had not ruled this block; the structure ships so commits 5 and 6
 * are not blocked, and scripts/check-unruled-copy.mjs refuses a PRODUCTION build
 * while a placeholder survives. Preview builds pass, because he has to see it to
 * rule it.
 *
 * ── THE TAP IS THE METRIC ──
 * `interest_registered` fires on the tap itself, BEFORE any contact field
 * appears. Requiring a contact first would measure willingness to hand over a
 * phone number, which is a different question from wanting the product, and it is
 * not the question September is asking. The contact box is optional, appears
 * after the signal is already recorded, and skipping it costs nothing.
 *
 * ── VISUALLY SECONDARY, DELIBERATELY ──
 * A flat bordered surface on the page background, not the Artifact offer's dark
 * panel, and no primary Button. Ruled: one live purchase CTA per moment. Two
 * buttons of equal weight would make the free reading feel like a shop.
 *
 * ── EXPORTED FOR `tests/contact-submit.spec.mjs`, AND ONLY FOR IT ──
 * Nothing else imports it; `Reading` renders it directly one scope away. The
 * confirmation below is a claim about the server (see `UPCOMING_COPY.contactSent`),
 * so the assertion that guards it has to press the real button and read the real
 * DOM. A test of an extracted helper would keep passing if this component went back
 * to confirming unconditionally, which is the failure CLAUDE.md's 2026-08-26 entry
 * describes: a test that passes whether the feature exists or not.
 */
export function Upcoming({ reading }) {
  // Which product the reader has already tapped, if any. One at a time: the
  // contact box belongs to the product she just tapped, and two open boxes would
  // ask her to answer the same question twice.
  const [tapped, setTapped] = useState(null);
  const [contact, setContact] = useState('');
  const [sent, setSent] = useState(false);

  // `upcoming_seen` IS THE SECOND DENOMINATOR, AND IT IS GATED ON VISIBILITY -
  // not on mount, which is what `offer_seen` does one component above.
  //
  // THE DIFFERENCE IS NOT COSMETIC AND IT IS THE WHOLE POINT OF THE METRIC.
  // Prompt Q defines compat and annual interest as interest / `upcoming_seen`
  // rather than interest / completed readers, precisely so that "a reader who
  // never scrolled to the block never had the chance and must not sit in the
  // denominator". Firing on mount would count every completed reader, which
  // makes `upcoming_seen` a slower spelling of "completed" and silently deletes
  // the distinction the second denominator exists to draw. Both rates would then
  // read LOW for a reason that has nothing to do with either product.
  //
  // Threshold 0.5 rather than a single pixel: half the block on screen is the
  // cheapest honest reading of "she had the chance to see it".
  const seenRef = useRef(false);
  const blockRef = useRef(null);
  useEffect(() => {
    if (seenRef.current) return undefined;
    const node = blockRef.current;
    if (!node) return undefined;

    // No IntersectionObserver (old browser, jsdom): fall back to firing, because
    // undercounting the DENOMINATOR inflates every rate divided by it. An
    // over-counted denominator is conservative; an under-counted one flatters.
    if (typeof IntersectionObserver !== 'function') {
      seenRef.current = true;
      fireEvent(reading?.token, 'upcoming_seen');
      return undefined;
    }

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting || seenRef.current) continue;
        seenRef.current = true;
        fireEvent(reading?.token, 'upcoming_seen');
        io.disconnect();
      }
    }, { threshold: 0.5 });
    io.observe(node);
    return () => io.disconnect();
  }, [reading?.token]);

  function tap(product) {
    // Recorded FIRST, with no contact. See the header: the tap is the metric.
    if (tapped !== product) fireEvent(reading?.token, 'interest_registered', { product });
    setTapped(product);
    setSent(false);
    setContact('');
  }

  /**
   * THE ONE AWAITED EVENT ON THIS PAGE, and the exception is deliberate.
   *
   * ── WHY IT CANNOT USE `fireEvent` ──────────────────────────
   * `fireEvent` is fire-and-forget BY DESIGN - "a counter never breaks the page" -
   * and the other seven events keep that contract exactly as it is. This one is
   * not a counter. `UPCOMING_COPY.contactSent` says "Emailmu sudah masuk.", which
   * is a claim that the server RECEIVED something, and `fireEvent` swallows every
   * failure. `setSent(true)` also sat outside the `if (contact.trim())` guard, so
   * the confirmation appeared on an empty box, on a failed POST, and on a 410-gone
   * reading. A wrong confirmation looks exactly like a right one, which is why
   * nothing on screen ever showed this.
   *
   * ── `res.ok` AND THE BODY, NOT EITHER ALONE ────────────────
   * `recordMirrorEvent` answers `{ ok: true }` at 200 and an `{ error }` shape at
   * 400/404/410/429. A 200 whose body does not say ok is not a success, so the
   * status by itself is not enough to make the claim true.
   *
   * ── ON FAILURE, NOTHING VISIBLE CHANGES, AND THERE IS NO ERROR STRING ──
   * Ruled 2026-09-01. `product_interest` is unique on (reading_id, product) and
   * upserts, so pressing Kirim again is harmless - the input stays visible with
   * its value intact, which says "not yet" without a twelfth slot nobody ruled.
   * That same upsert is why posting the contact as a SECOND `interest_registered`
   * for the same product attaches it to the signal already recorded rather than
   * creating a second one.
   */
  async function submitContact() {
    const value = contact.trim();
    // An empty box sends nothing and confirms nothing. The tap is already
    // recorded and is the metric; there is no second signal here to lose.
    if (!value) return;

    const token = reading?.token;
    if (!token) return;

    try {
      const res = await fetch(`/api/mirror/${token}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'interest_registered', product: tapped, contact: value }),
      });
      if (!res.ok) return;
      const body = await res.json().catch(() => null);
      if (body?.ok !== true) return;
      setSent(true);
    } catch {
      // Offline, aborted, or a body that would not parse. Leave the input and its
      // value exactly where they are; she can press Kirim again at no cost.
    }
  }

  const products = [
    { key: 'compat', copy: UPCOMING_COPY.compat },
    { key: 'annual', copy: UPCOMING_COPY.annual },
  ];

  return (
    <Reveal>
      <div ref={blockRef} style={{ borderTop: '1px solid var(--divider)', paddingTop: 28 }}>
        {/* SENTENCE CASE, RULED 2026-08-31 (upcoming-copy-rulings.md, AMENDED section).
            `Eyebrow` is SHARED - 3 other call sites - and is NOT edited: it spreads
            `...style` last, so overriding here wins with no component change and no
            effect on any other eyebrow on the site.

            THE TRACKING GOES WITH THE CASE. `.16em` is tuned for capitals; sentence
            case at caps tracking is spaced-out lowercase, which reads worse than
            either end state and looks like a bug rather than a decision. `normal` is
            the neutral default rather than a new tracking value chosen here - the
            ruling is sentence case, and picking a bespoke number would be composing. */}
        <Eyebrow style={{ marginBottom: 10, textTransform: 'none', letterSpacing: 'normal' }}>{UPCOMING_COPY.eyebrow}</Eyebrow>
        <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--muted-warm)', margin: '0 0 18px' }}>{UPCOMING_COPY.lead}</p>

        <div style={{ display: 'grid', gap: 12 }}>
          {products.map(({ key, copy }) => (
            <div key={key} style={{ border: '1px solid var(--divider)', borderRadius: 16, padding: '16px 16px 14px', background: 'var(--surface-quiet, transparent)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, color: 'var(--tinta)' }}>{copy.label}</div>
                {/* Resolved from lib/pricing.js, never hardcoded - same rule the
                    Artifact offer follows. A price typed here would be a second
                    source of truth for what a thing costs. */}
                <div style={{ fontSize: 14, color: 'var(--muted-warm)', whiteSpace: 'nowrap' }}>{formatIdr(priceFor(key))}</div>
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--tinta-soft)', margin: '8px 0 0' }}>{copy.sub}</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                {/* SENTENCE CASE, same ruling. This `textTransform` was mine, added in
                    `7cec498` while the content was still an `@@UNRULED@@` placeholder -
                    a styling choice made before the words existed, which is exactly the
                    kind that survives unexamined. Reyner ruled it out. Tracking relaxed
                    with it, for the reason above. */}
                <span style={{ fontSize: 11, letterSpacing: 'normal', color: 'var(--muted-warm)', border: '1px solid var(--divider)', borderRadius: 999, padding: '4px 10px' }}>{UPCOMING_COPY.availability}</span>
                {/* A TEXT BUTTON, NOT A <Button>. Equal visual weight with the
                    Artifact CTA is the thing the ruled order forbids. */}
                <button
                  type="button"
                  onClick={() => tap(key)}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', fontSize: 13.5, fontWeight: 600, color: 'var(--el-glow-ink, var(--tinta))', textDecoration: 'underline', textUnderlineOffset: 3 }}
                >
                  {UPCOMING_COPY.interestCta}
                </button>
              </div>

              {tapped === key && (
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--divider)' }}>
                  {/* TWO RECEIPTS FOR TWO MOMENTS, ruled 2026-09-01. The tap and
                      the optional contact submit are things this block keeps
                      apart on purpose, and one string confirming both meant the
                      submit was never acknowledged at all. `contactSent` is a
                      claim that the POST landed, so it renders off `sent`, which
                      submitContact only sets on a verified success. */}
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--tinta-soft)', margin: '0 0 10px' }}>
                    {sent ? UPCOMING_COPY.contactSent : UPCOMING_COPY.interestNoted}
                  </p>
                  {!sent && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder={UPCOMING_COPY.contactLabel}
                        style={{ flex: '1 1 200px', minWidth: 0, font: 'inherit', fontSize: 13.5, padding: '9px 11px', borderRadius: 10, border: '1px solid var(--divider)', background: 'transparent', color: 'var(--tinta)' }}
                      />
                      <button
                        type="button"
                        onClick={submitContact}
                        style={{ font: 'inherit', fontSize: 13.5, fontWeight: 600, padding: '9px 14px', borderRadius: 10, border: '1px solid var(--divider)', background: 'transparent', cursor: 'pointer', color: 'var(--tinta)' }}
                      >
                        {UPCOMING_COPY.contactSubmit}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

function Pending({ invoiceUrl }) {
  return (
    <div style={{ background: SANCTUARY, borderRadius: 26, padding: '40px 24px', color: LIGHT, boxShadow: 'var(--shadow-deep)', textAlign: 'center' }}>
      <div className="k-spin" style={{ width: 34, height: 34, border: '3px solid var(--el-g25)', borderTopColor: GLOW, borderRadius: '50%', margin: '0 auto 16px' }} />
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: '#F2F6F6', margin: 0 }}>Menunggu konfirmasi pembayaran...</p>
      <p style={{ fontSize: 13, color: 'rgba(234,241,242,.6)', marginTop: 8 }}>Begitu masuk, kartu dan PDF-mu langsung siap di sini.</p>
      {invoiceUrl && (
        <p style={{ fontSize: 13, marginTop: 14, color: 'rgba(234,241,242,.7)' }}>
          Halaman pembayaran tidak terbuka?{' '}
          <a href={invoiceUrl} target="_blank" rel="noopener noreferrer" style={{ color: GLOW, fontWeight: 600 }}>Buka di sini ↗</a>
        </p>
      )}
    </div>
  );
}

/* ---------------- The delivery: two artifacts, one purchase ---------------- */
/**
 * ── WHY THE CARD IS FETCHED AND THE PDF IS A LINK ─────────
 * They are different mechanisms and the difference is in the artifacts, not in the
 * gate. The PDF is server-rendered bytes, so the browser downloads a URL. The card
 * is a capture of a live DOM node at ruled pixel sizes (html-to-image), so the
 * data has to come down and be drawn before it can be saved - and prompt M rules
 * OUT embedding the card in the PDF precisely so the document does not depend on
 * that path.
 *
 * The card DATA is fetched rather than reused from the reading: the free payload
 * withholds `appendix`, which is Card B's whole second half - the four pillar
 * characters with their palaces and the element distribution. That withholding is
 * the paywall on the card.
 *
 * CARD B IS RENDERED OFF-SCREEN AT FULL SIZE and never shown at 1:1. `captureCard`
 * needs the node in the document to clone it, and it measures the rendered width to
 * scale the clone, so a hidden node must still have a real width - `visibility:
 * hidden` inside a clipped box, never `display: none`, which has no box to measure.
 */
function Delivery({ token }) {
  const [paidCard, setPaidCard] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | failed
  const [saving, setSaving] = useState(null); // 'card' | 'pdf' | null

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await fetch(`/api/deliver/${token}/card`).then((x) => x.json()).catch(() => null);
      if (cancelled) return;
      if (r?.card) {
        // NO FOOTER MERGE HERE, unlike Card A. The paid endpoint supplies the birth
        // date and gender from the row itself, so a buyer opening her link on a
        // fresh device still gets a correct footer - which is the whole reason that
        // endpoint sends them and the free one does not.
        setPaidCard(r.card);
        setState('ready');
      } else {
        setState('failed');
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  async function saveCard() {
    setSaving('card');
    try {
      await downloadCard('download', 'B', { id: 'card-b', filename: `katon-${(paidCard?.nameId || 'kartu').toLowerCase().replace(/\s+/g, '-')}.png` });
    } catch { /* the button re-enables; the PDF is unaffected */ }
    setSaving(null);
  }

  return (
    <div className="k-fade" style={{ background: SANCTUARY, borderRadius: 26, padding: '30px 22px 34px', color: LIGHT, boxShadow: 'var(--shadow-deep)' }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: GLOW }}>Complete Edition</div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, lineHeight: 1.1, color: '#fff', margin: '12px 0 0' }}>Sudah siap.</h2>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.7, color: 'rgba(234,241,242,.72)', margin: '12px 0 0' }}>Kartu dan PDF-mu bisa diunduh kapan saja dari tautan bacaan ini.</p>

      <div style={{ margin: '22px 0 24px' }}><Rule light /></div>

      {state === 'loading' && <p style={{ fontSize: 13.5, color: 'rgba(234,241,242,.6)', margin: 0 }}>Menyiapkan kartumu...</p>}
      {state === 'failed' && <p style={{ fontSize: 13.5, color: 'rgba(234,241,242,.75)', margin: 0 }}>Kartumu belum bisa dimuat. Muat ulang halaman ini.</p>}

      {state === 'ready' && paidCard && (
        <>
          {/* Off-screen at scale 1. Clipped rather than hidden with display:none,
              which would leave nothing for captureCard to measure. */}
          {/* NO `whiteSpace: nowrap` HERE, and its absence is the point.
              This is the sr-only recipe minus that one property. In sr-only it
              stops a screen reader's text collapsing oddly inside a 1px box - but
              this container is aria-hidden and holds no text for anyone to read.
              It exists ONLY to give captureCard a full-size node to measure.
              `white-space` INHERITS, so nowrap reached every text node in Card B
              and the paid card exported with its quote and both badge lines
              running off the right edge, unwrapped. Nothing on screen showed it:
              the container is clipped to 1px, so the damage was visible only in
              the downloaded file. */}
          <div aria-hidden="true" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
            <CardB data={paidCard} scale={1} id="card-b" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CardB data={paidCard} scale={CARD_SCALE * 0.72} id="card-b-preview" />
          </div>
          <div style={{ display: 'grid', gap: 12, marginTop: 22 }}>
            <Button variant="gold" light onClick={saveCard} disabled={saving === 'card'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Icon.save size={17} /> {saving === 'card' ? 'Menyimpan...' : 'Simpan Kartu'}
            </Button>
            {/* A PLAIN LINK, not a fetch-then-blob. The endpoint sets
                Content-Disposition: attachment, so the browser saves it and the tab
                keeps its state; building a blob would hold a whole PDF in memory to
                achieve the same thing. */}
            <a href={`/api/deliver/${token}/pdf`} style={{ textDecoration: 'none' }}>
              <Button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Icon.save size={17} /> Unduh PDF
              </Button>
            </a>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- Re-access route: /r/[token] ----------------
   The receiving end of the URL the funnel pushes on reading creation. `token` is
   the reading id. Reads the SAME endpoints the funnel does - no second gating path:
     GET /api/mirror/[token]    the full mirror, ungated
     GET /api/deliver/[token]   whether the card + PDF are hers yet
   The reading is shown either way, because it is free. The delivery opens beneath it
   when it is ready. */
export function ReadingByToken({ token }) {
  const [status, setStatus] = useState('loading'); // loading | notfound | ready
  const [reading, setReading] = useState(null);
  const [delivered, setDelivered] = useState(false);
  // Xendit's success_redirect_url lands here with `?bayar=selesai`. It says only
  // "she came back from checkout", never "she paid" - the paid flag comes from the
  // server, and a hand-typed query string must not change what she is shown beyond
  // which waiting state opens first.
  const [fromCheckout] = useState(() => typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('bayar') === 'selesai');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/mirror/${token}`);
        if (!res.ok) { if (!cancelled) setStatus('notfound'); return; }
        const served = await res.json();
        if (!served || served.error || !served.token) { if (!cancelled) setStatus('notfound'); return; }

        const m = await fetch(`/api/deliver/${token}`).then((r) => r.json()).catch(() => null);
        if (cancelled) return;
        setReading(served);
        setDelivered(Boolean(m?.paid && m.items?.length && m.items.every((i) => i.ready)));
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('notfound');
      }
    })();
  }, [token]);

  const goHome = () => { if (typeof window !== 'undefined') window.location.href = '/'; };

  if (status === 'loading') return <ReadingLoading />;
  if (status === 'notfound') return <ReadingNotFound onHome={goHome} />;

  // `delivered` opens the offer straight into its delivered state for a buyer
  // returning to her link. `fromCheckout` is the near-miss case: the success
  // redirect regularly beats the webhook by a few seconds, and re-offering a product
  // to somebody who has already paid for it is the worst reading of that moment - so
  // it opens in the waiting state and the poll finishes the job.
  return (
    <Reading
      reading={reading}
      onReset={goHome}
      initialStage={delivered ? 'delivered' : (fromCheckout ? 'pending' : undefined)}
    />
  );
}

function ReadingLoading() {
  return (
    <div style={{ ...wrap, paddingTop: 120, textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--muted-warm)', margin: 0 }}>Membuka bacaanmu...</p>
    </div>
  );
}

function ReadingNotFound({ onHome }) {
  return (
    <div style={{ ...wrap, paddingTop: 96, textAlign: 'center' }}>
      <Reveal><div style={{ display: 'flex', justifyContent: 'center' }}><Wordmark /></div></Reveal>
      <Reveal delay={0.08} style={{ marginTop: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 28, lineHeight: 1.15, color: 'var(--tinta)', margin: 0 }}>Bacaan tidak ditemukan.</h1>
      </Reveal>
      <Reveal delay={0.14}><p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.6, color: 'var(--tinta-soft)', margin: '12px 0 0' }}>Tautannya mungkin keliru atau sudah tidak berlaku.</p></Reveal>
      <Reveal delay={0.2} style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}><Button onClick={onHome}>Mulai dari awal</Button></Reveal>
    </div>
  );
}
