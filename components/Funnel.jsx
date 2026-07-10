'use client';

import { useEffect, useRef, useState } from 'react';
import Sharecard from './Sharecard.jsx';
import { exportSharecardPNG } from './exportCard.js';
import { Reveal, Eyebrow, Button, Rule, BalanceBar, PillarCell, Icon, elColor, alpha } from './kit.jsx';
import { freeFullReadingEnabled } from '../lib/flags.js';

const DOMAINS = [
  { key: 'hubungan', label: 'Hubungan' },
  { key: 'karier', label: 'Karier' },
  { key: 'uang', label: 'Uang' },
];
const DOMAIN_LABEL = { hubungan: 'Hubungan', karier: 'Karier', uang: 'Uang' };
// Locked paid-beat headings (mirror of lib/content BEAT_HEADINGS; that module is
// server-only so the client keeps its own display copy).
const BEAT_HEADINGS = {
  1: 'Yang Perlu Kamu Dengar Dulu',
  2: 'Bagaimana Ini Muncul',
  3: 'Yang Sebenarnya Terjadi',
  4: 'Yang Menenangkan vs Yang Melelahkan',
  5: 'Empat Pilarmu · 八字',
  6: 'Cara Memutuskannya',
  7: 'Apa Artinya',
};
const ANTICIPATION = ['Membaca tanggal lahirmu', 'Menyusun empat pilarmu', 'Menghitung keseimbangan energimu'];
// Neutral, generic element glosses — describe the ELEMENT, not the person.
const ELEMENT_GLOSS = { Kayu: 'tumbuh dan menjangkau', Api: 'menyala dan menghangatkan', Bumi: 'menopang dan menampung', Logam: 'memadat dan menajam', Air: 'mengalir dan meresap' };
const ELEMENT_ID = { Wood: 'Kayu', Fire: 'Api', Earth: 'Bumi', Metal: 'Logam', Water: 'Air' };
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
// Birth year: 1900 through the current year inclusive. The BaZi calc engine supports
// 1900–2030 (lib/bazi/solarTerms.js), so the current year is always within range.
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = (() => { const a = []; for (let y = CURRENT_YEAR; y >= 1900; y--) a.push(y); return a; })();
const RANGE = (n, from = 0) => Array.from({ length: n }, (_, i) => i + from);

// The paid/deep-read accent + canvas resolve from the element theme via CSS vars
// set once at the reading root (see themeVars). GLOW/SANCTUARY are indirections so
// every sanctuary surface follows the element instead of a hardcoded water tint.
const SANCTUARY = 'var(--el-sanctuary)';
const GLOW = 'var(--el-glow)';
const LIGHT = '#EAF1F2';
const wrap = { maxWidth: 460, margin: '0 auto', padding: '0 22px 96px' };
const darkField = { backgroundColor: 'rgba(9,18,21,.4)', borderColor: 'var(--el-g30)', color: LIGHT };

// Element theme → CSS vars, set ONCE at the reading root; every nested surface
// (persona, chart, bridge, paywall, deep-read) inherits the same accent.
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
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Funnel() {
  const [phase, setPhase] = useState('input'); // input | calculating | result
  const [form, setForm] = useState({ day: '', month: '', year: '', hour: '', minute: '', domain: 'hubungan' });
  const [error, setError] = useState(null);
  const [reading, setReading] = useState(null);
  const [step, setStep] = useState(0);

  function reset() {
    setReading(null); setError(null); setPhase('input');
    // Return the URL to root (additive; pushState only — no route remount).
    if (typeof window !== 'undefined') window.history.pushState(null, '', '/');
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const { day, month, year, hour, minute, domain } = form;
    if (!day || !month || !year) { setError('Isi tanggal lahirmu dulu.'); return; }
    const birthDate = `${year}-${pad(month)}-${pad(day)}`;
    const birthTime = hour !== '' ? `${pad(hour)}:${pad(minute || 0)}` : null;
    setStep(0);
    setPhase('calculating');
    try {
      const [res] = await Promise.all([
        fetch('/api/reading', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ birthDate, birthTime, domain }),
        }).then((r) => r.json()),
        delay(2500),
      ]);
      if (res.error) { setError(readableError(res)); setPhase('input'); return; }
      setReading({ ...res, birthDate }); // birthDate kept client-side for the card header
      // Make the reading bookmarkable/shareable without remounting: swap the URL to
      // /r/<id> via history.pushState (NOT router.push, which would mount the /r route
      // and discard this in-session state). In-session unlock behavior is unchanged.
      if (res.token && typeof window !== 'undefined') window.history.pushState(null, '', `/r/${res.token}`);
      setPhase('result');
    } catch {
      setError('Ada yang salah. Coba lagi sebentar.');
      setPhase('input');
    }
  }

  useEffect(() => {
    if (phase !== 'calculating') return;
    const t1 = setTimeout(() => setStep(1), 850);
    const t2 = setTimeout(() => setStep(2), 1700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  if (phase === 'input') return <Home form={form} setForm={setForm} error={error} onSubmit={onSubmit} />;
  if (phase === 'calculating') return <Anticipation step={step} />;
  return <Reading reading={reading} onReset={reset} />;
}

function readableError(res) {
  if (res.error === 'archetype_content_unavailable') return `Bacaan untuk arketipe ${res.dayMaster || 'ini'} belum siap.`;
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
function Home({ form, setForm, error, onSubmit }) {
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target ? e.target.value : e }));
  return (
    <div style={wrap}>
      <div style={{ paddingTop: 60 }}>
        <Reveal><Wordmark /></Reveal>
        <Reveal delay={0.08} style={{ marginTop: 44 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 34, lineHeight: 1.12, letterSpacing: '-.01em', color: 'var(--tinta)', margin: 0 }}>Kamu punya pola.</h1>
        </Reveal>
        <Reveal delay={0.14}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.6, color: 'var(--tinta-soft)', margin: '12px 0 0' }}>Dan mungkin selama ini, kamu belum pernah benar-benar melihatnya.</p>
        </Reveal>

        <form onSubmit={onSubmit}>
          <Reveal delay={0.22} style={{ marginTop: 28 }}>
            <div style={{ background: 'var(--kertas-2)', border: '1px solid var(--divider)', borderRadius: 20, padding: '18px 18px 20px', boxShadow: 'var(--shadow-card)' }}>
              <FieldLabel>Tanggal lahir</FieldLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.45fr 1.2fr', gap: 8 }}>
                <select value={form.day} onChange={set('day')} aria-label="Tanggal"><option value="">Tgl</option>{RANGE(31, 1).map((d) => <option key={d} value={d}>{d}</option>)}</select>
                <select value={form.month} onChange={set('month')} aria-label="Bulan"><option value="">Bulan</option>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select>
                <select value={form.year} onChange={set('year')} aria-label="Tahun"><option value="">Tahun</option>{YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</select>
              </div>

              <div style={{ height: 16 }} />
              <FieldLabel>Jam lahir · opsional</FieldLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <select value={form.hour} onChange={set('hour')} aria-label="Jam"><option value="">Jam</option>{RANGE(24).map((h) => <option key={h} value={h}>{pad(h)}</option>)}</select>
                <select value={form.minute} onChange={set('minute')} aria-label="Menit"><option value="">Menit</option>{RANGE(60).map((m) => <option key={m} value={m}>{pad(m)}</option>)}</select>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted-warm)', marginTop: 8, lineHeight: 1.5 }}>Isi kalau kamu ingat. Bacaanmu tetap akurat tanpa ini, tapi kalau ada, beberapa lapisan jadi lebih dalam.</div>
              {/* Domain selector removed from the front door — moved to the paywall (the
                  live-decision prompt). Reading still defaults domain to "hubungan"
                  (Funnel form state), so free-reading generation is unaffected. */}
            </div>
          </Reveal>

          <Reveal delay={0.3} style={{ marginTop: 22 }}>
            {error && <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</div>}
            <Button type="submit">Lihat Refleksiku</Button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 12.5, color: 'var(--muted-warm)', marginTop: 14 }}>
              <Icon.lock size={13} /> Bersifat pribadi. Hanya untukmu.
            </div>
          </Reveal>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Anticipation ---------------- */
function Anticipation({ step }) {
  return (
    <div className="k-fade" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="k-ring" style={{ animationDelay: '0s' }} />
        <span className="k-ring" style={{ animationDelay: '1s' }} />
        <span className="k-ring" style={{ animationDelay: '2s' }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: 'var(--clay)', boxShadow: '0 0 0 6px rgba(196,98,42,.12)' }} />
      </div>
      <div style={{ height: 34, marginTop: 30, position: 'relative', width: 280, textAlign: 'center' }}>
        {ANTICIPATION.map((l, i) => (
          <div key={i} style={{ position: 'absolute', inset: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--tinta-soft)', opacity: step === i ? 1 : 0, transform: step === i ? 'none' : 'translateY(6px)', transition: 'all .6s var(--ease-quiet)' }}>{l}…</div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Reading (one continuous scroll) ---------------- */
function Reading({ reading, onReset, initialFull }) {
  const fc = reading.freeContent;
  const chart = reading.chart;
  const el = elColor(chart?.dayMasterElement || fc?.dayMasterElement);
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    try { await exportSharecardPNG('sharecard', `katon-${(fc.archetypeName || 'kamu').toLowerCase()}.png`); } catch { /* */ }
    setSaving(false);
  }

  const bars = chart?.elementBars || [];
  let domIdx = -1, minIdx = -1, maxPct = -1, minPct = 101;
  bars.forEach((b, i) => { if (b.pct > maxPct) { maxPct = b.pct; domIdx = i; } if (b.pct < minPct) { minPct = b.pct; minIdx = i; } });

  const name = fc.archetypeName || '';
  const titleName = name ? name.charAt(0) + name.slice(1).toLowerCase() : '';
  const chinese = chart?.dayMasterChinese || fc.dayMasterChinese;
  const polarity = chart?.dayMasterPolarity;
  const elLabel = ELEMENT_ID[chart?.dayMasterElement || fc.dayMasterElement];

  return (
    <div className="k-fade" style={{ ...wrap, ...themeVars(chart?.dayMasterElement || fc?.dayMasterElement) }}>
      <button onClick={onReset} style={{ background: 'none', border: 'none', color: 'var(--muted-warm)', fontSize: 13, cursor: 'pointer', padding: '18px 0 0', fontFamily: 'var(--font-sans)' }}>← Ganti tanggal</button>

      {/* persona */}
      <Reveal><Eyebrow>Refleksimu</Eyebrow></Reveal>
      <Reveal delay={0.06}><div style={{ fontFamily: 'var(--font-serif)', fontSize: 44, lineHeight: 1, color: el.deep, margin: '16px 0 0' }}>{titleName}</div></Reveal>
      {/* modifier sits directly under the title as one unit; element tag moved below it */}
      {fc.card?.modifier && <Reveal delay={0.1}><p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, lineHeight: 1.4, color: 'var(--kayu)', margin: '12px 0 0' }}>{fc.card.modifier}</p></Reveal>}
      <Reveal delay={0.14}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 11.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--tinta-soft)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: el.mid }} /> {elLabel}{polarity ? ` · ${polarity}` : ''}{chinese ? ` · ${chinese}` : ''}
        </div>
      </Reveal>
      {fc.river?.siapaKamu && <Reveal delay={0.18}><Para style={{ marginTop: 16 }}>{fc.river.siapaKamu}</Para></Reveal>}

      {/* Empat Pilarmu — FREE, neutral labels only */}
      {chart?.pillars && (
        <Section eyebrow="Empat Pilarmu">
          <Reveal><p style={{ fontSize: 13, color: 'var(--muted-warm)', margin: '-6px 0 16px', lineHeight: 1.55 }}>Empat lapisan energi dari tanggal lahirmu. Yang di tengah adalah intinya.</p></Reveal>
          <Reveal delay={0.06}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 9 }}>
              {['tahun', 'bulan', 'hari', 'jam'].map((k) => {
                const pl = chart.pillars[k];
                return pl
                  ? <PillarCell key={k} label={pl.label} stem={pl.stem} branch={pl.branch} elementId={pl.elementId} element={pl.element} polarity={pl.polarity} isDayMaster={pl.isDayMaster} />
                  : <PillarCell key={k} label="Jam" />;
              })}
            </div>
          </Reveal>
        </Section>
      )}

      {/* Komposisi Energimu — FREE, neutral labels only */}
      {bars.length > 0 && (
        <Section eyebrow="Komposisi Energimu">
          <div style={{ display: 'grid', gap: 16 }}>
            {bars.map((b, i) => (
              <Reveal key={b.element} delay={i * 0.04}>
                <BalanceBar label={b.label} gloss={ELEMENT_GLOSS[b.label]} pct={b.pct} element={b.element} isDominant={i === domIdx} isMissing={i === minIdx} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* free prose */}
      {fc.river?.kenapaBegini && <Section eyebrow="Kenapa begini"><Reveal><Para>{fc.river.kenapaBegini}</Para></Reveal></Section>}
      {fc.keMana && <Section eyebrow="Ke mana ini bawa kamu"><Reveal><Para>{fc.keMana}</Para></Reveal></Section>}

      {/* sharecard */}
      <Section eyebrow="Simpan sebagai kartu" style={{ marginTop: 52 }}>
        <Reveal><p style={{ fontSize: 13, color: 'var(--muted-warm)', margin: '-6px 0 18px', lineHeight: 1.55 }}>Satu kartu ringkas tentang dirimu, untuk disimpan atau dibagikan.</p></Reveal>
        <Reveal delay={0.06} style={{ display: 'flex', justifyContent: 'center' }}><Sharecard data={fc} birthDate={reading.birthDate} /></Reveal>
        <Reveal delay={0.12} style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <Button variant="gold" onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Icon.save size={17} /> {saving ? 'Menyimpan…' : 'Simpan Gambar'}</Button>
        </Reveal>
      </Section>

      {/* bridge */}
      {fc.bridge?.[0] && (
        <Reveal delay={0.04} style={{ marginTop: 52 }}>
          <div style={{ background: `radial-gradient(120% 80% at 50% 0%, ${el.wash}, var(--kertas-2))`, border: '1px solid var(--border)', borderRadius: 20, padding: '30px 24px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22, lineHeight: 1.4, letterSpacing: '-.01em', color: 'var(--kayu)', margin: 0 }}>{fc.bridge[0]}</p>
            <div style={{ margin: '22px auto' }}><Rule width={120} /></div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.65, color: 'var(--tinta-soft)', margin: 0 }}>Bacaan mendalam menelusuri pola ini lebih jauh, tanpa menyuruhmu memilih.</p>
          </div>
        </Reveal>
      )}

      {/* paywall */}
      <div style={{ marginTop: 36 }}><Paywall reading={reading} initialFull={initialFull} /></div>
    </div>
  );
}

/* ---------------- Paywall (progressive disclosure, server-gated) ---------------- */
function Paywall({ reading, initialFull }) {
  // initialFull (optional): when provided (re-access to an already-paid reading), the
  // paywall opens straight to the unlocked view. Omitted in the funnel → default flow.
  // TEST-UNGATE: with the flag on and no initialFull, open in 'ungating' — fetch /full
  // (served under the same flag) and show the deep-read instead of the teaser+paywall.
  const freeFull = freeFullReadingEnabled();
  const [stage, setStage] = useState(initialFull ? 'unlocked' : (freeFull ? 'ungating' : 'teaser')); // teaser | wa | pending | unlocking | unlocked | ungating
  const [wa, setWa] = useState('');
  const [full, setFull] = useState(initialFull || null);
  const [invoiceUrl, setInvoiceUrl] = useState(null);
  // Domain choice now lives at the paywall (moved from the front door). Defaults to the
  // reading's domain (itself "hubungan" by default). Only "hubungan" is live; Karier/Uang
  // are "Segera" demand-capture. The live pay flow uses the reading as created (hubungan).
  const [selectedDomain, setSelectedDomain] = useState(reading.domain || 'hubungan');
  const pollRef = useRef(null);

  async function submitWa(e) {
    e.preventDefault();
    if (!/^[0-9+]{8,}$/.test(wa.replace(/\s/g, ''))) return;
    const res = await fetch(`/api/pay/${reading.token}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wa_number: wa }),
    }).then((r) => r.json()).catch(() => null);
    // Open the Xendit checkout (QRIS) in a new tab; this tab keeps polling /full and
    // unlocks when the verified webhook flips paid. (Triggered from the submit gesture
    // so it isn't popup-blocked; a fallback link shows in the pending state too.)
    if (res?.invoiceUrl) { setInvoiceUrl(res.invoiceUrl); window.open(res.invoiceUrl, '_blank', 'noopener'); }
    setStage('pending');
  }

  useEffect(() => {
    if (stage !== 'pending') return;
    let tries = 0;
    pollRef.current = setInterval(async () => {
      tries += 1;
      const r = await fetch(`/api/reading/${reading.token}/full`).then((x) => x.json()).catch(() => null);
      if (r && r.paid && r.paidContent) {
        clearInterval(pollRef.current);
        setFull(r);
        setStage('unlocking');
      }
      if (tries > 60) clearInterval(pollRef.current);
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [stage, reading.token]);

  useEffect(() => {
    if (stage !== 'unlocking') return;
    const t = setTimeout(() => setStage('unlocked'), 1700);
    return () => clearTimeout(t);
  }, [stage]);

  // TEST-UNGATE: fetch the full reading up-front (no payment) and show the deep-read.
  // The /full route serves paidContent under the same flag. VIEW-ONLY — this never
  // calls the pay/webhook flow and never marks the reading paid. If content doesn't
  // arrive (flag off server-side, etc.), fall back to the normal teaser+paywall.
  useEffect(() => {
    if (!freeFull || initialFull || full) return;
    let cancelled = false;
    (async () => {
      const r = await fetch(`/api/reading/${reading.token}/full`).then((x) => x.json()).catch(() => null);
      if (cancelled) return;
      if (r && r.paid && r.paidContent) { setFull(r); setStage('unlocked'); }
      else setStage('teaser');
    })();
    return () => { cancelled = true; };
  }, [freeFull, initialFull, full, reading.token]);

  if (stage === 'unlocked' && full) return <Unlocked full={full} token={reading.token} onUpdate={setFull} />;
  if (stage === 'ungating') return <div style={{ padding: '48px 0', textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--muted-warm)' }}>Membuka bacaan lengkap…</div>;
  if (stage === 'unlocking') return <Unlocking />;
  if (stage === 'pending') return <Pending invoiceUrl={invoiceUrl} />;
  if (stage === 'wa') return <WaCapture wa={wa} setWa={setWa} onSubmit={submitWa} />;
  return <Teaser reading={reading} onOpen={() => setStage('wa')} selectedDomain={selectedDomain} setSelectedDomain={setSelectedDomain} />;
}

// Frosted placeholder — generic blurred bars, NEVER the real locked copy.
function LockedLines() {
  return (
    <div style={{ position: 'relative', marginTop: 16 }}>
      <div style={{ opacity: 0.45, userSelect: 'none', filter: 'blur(4px)', maskImage: 'linear-gradient(180deg,#000 0%, transparent 94%)', WebkitMaskImage: 'linear-gradient(180deg,#000 0%, transparent 94%)' }}>
        {[96, 88, 92, 74].map((w, i) => <div key={i} style={{ height: 11, width: `${w}%`, borderRadius: 6, background: 'rgba(207,225,232,.32)', margin: '13px 0' }} />)}
      </div>
      <div style={{ position: 'absolute', left: '50%', bottom: -2, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, letterSpacing: '.06em', color: GLOW }}>
        <Icon.lock size={14} /> Terkunci
      </div>
    </div>
  );
}

// Teaser + price in ONE sanctuary card (price shown with the teaser; WA asked only
// after "Buka"). See PROGRESS.md — deliberate collapse of the old teaser→offer tap.
function Teaser({ reading, onOpen, selectedDomain, setSelectedDomain }) {
  const t = reading.teaser;
  const domain = selectedDomain || reading.domain || 'hubungan';
  const domainLabel = DOMAIN_LABEL[domain] || '';
  const isLive = domain === 'hubungan'; // only Hubungan is a live paid read; others = Segera
  return (
    <Reveal>
      <div style={{ position: 'relative', overflow: 'hidden', background: SANCTUARY, borderRadius: 26, padding: '30px 24px 26px', color: LIGHT, boxShadow: 'var(--shadow-deep)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.22em', textTransform: 'uppercase', color: GLOW, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon.sparkle size={14} /> Bacaan Mendalam{domainLabel ? ` · ${domainLabel}` : ''}
        </div>

        {/* Domain selector (moved here from the front door) — the live-decision prompt.
            Hubungan = live paid read; Karier/Uang = Segera demand-capture (not wired live). */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, lineHeight: 1.4, color: '#F2F6F6', marginBottom: 12 }}>Yang lagi kamu bawa sekarang?</div>
          <div style={{ display: 'flex', background: 'rgba(9,18,21,.4)', border: '1px solid var(--el-g20)', borderRadius: 12, padding: 4, gap: 4 }}>
            {DOMAINS.map((d) => {
              const active = domain === d.key;
              return (
                <button type="button" key={d.key} aria-pressed={active} onClick={() => setSelectedDomain(d.key)}
                  style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 500, padding: '9px 0', borderRadius: 9, border: 'none', cursor: 'pointer', transition: '.2s', background: active ? GLOW : 'transparent', color: active ? '#0b1417' : 'rgba(234,241,242,.7)' }}>
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {isLive ? (
          <>
            {t?.lead && <p style={{ fontFamily: 'var(--font-serif)', fontSize: 20, lineHeight: 1.5, color: '#F2F6F6', margin: '20px 0 0' }}>{t.lead}<span style={{ color: 'rgba(234,241,242,.45)' }}> …</span></p>}
            <LockedLines />
            <div style={{ height: 24 }} />
            <div style={{ background: 'rgba(9,18,21,.4)', border: '1px solid var(--el-g22)', borderRadius: 16, padding: 18 }}>
              <div style={{ fontSize: 12.5, color: 'rgba(234,241,242,.6)' }}>Sekali konsultasi biasanya Rp 300-500rb.</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '6px 0 0' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, color: '#fff' }}>Rp 49.000</div>
                <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: GLOW }}>sekali bayar</div>
              </div>
              <div style={{ marginTop: 16 }}>
                <Button onClick={onOpen} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>Buka Refleksiku <Icon.arrow size={17} /></Button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 11.5, color: GLOW, opacity: 0.85, marginTop: 14 }}><Icon.lock size={13} /> Sekali baca. Milikmu selamanya.</div>
            </div>
          </>
        ) : (
          <div style={{ marginTop: 20 }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.65, color: 'rgba(234,241,242,.7)', margin: '0 0 12px' }}>Bacaan {domainLabel} sedang disiapkan. Tinggalkan nomor kalau mau dikabari begitu siap.</p>
            <SegeraRow token={reading.token} domain={domain} label={domainLabel} />
          </div>
        )}
      </div>
    </Reveal>
  );
}

function WaCapture({ wa, setWa, onSubmit }) {
  return (
    <Reveal>
      <form onSubmit={onSubmit} style={{ background: SANCTUARY, borderRadius: 26, padding: '30px 24px', color: LIGHT, boxShadow: 'var(--shadow-deep)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.22em', textTransform: 'uppercase', color: GLOW }}>Satu langkah lagi</div>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 19, lineHeight: 1.5, color: '#F2F6F6', margin: '14px 0 16px' }}>Ke mana bacaanmu dikirim? Masukkan nomor WhatsApp-mu.</p>
        <input type="tel" placeholder="08xxxxxxxxxx" value={wa} onChange={(e) => setWa(e.target.value)} style={darkField} />
        <div style={{ marginTop: 16 }}><Button type="submit">Lanjut Bayar</Button></div>
        <div style={{ fontSize: 11.5, color: 'rgba(234,241,242,.6)', marginTop: 14, textAlign: 'center' }}>Nomormu hanya untuk mengirim bacaan dan link-mu. Bukan untuk spam.</div>
      </form>
    </Reveal>
  );
}

function Pending({ invoiceUrl }) {
  return (
    <div style={{ background: SANCTUARY, borderRadius: 26, padding: '40px 24px', color: LIGHT, boxShadow: 'var(--shadow-deep)', textAlign: 'center' }}>
      <div className="k-spin" style={{ width: 34, height: 34, border: '3px solid var(--el-g25)', borderTopColor: GLOW, borderRadius: '50%', margin: '0 auto 16px' }} />
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: '#F2F6F6', margin: 0 }}>Menunggu konfirmasi pembayaran…</p>
      <p style={{ fontSize: 13, color: 'rgba(234,241,242,.6)', marginTop: 8 }}>Begitu masuk, bacaanmu langsung terbuka di sini.</p>
      {invoiceUrl && (
        <p style={{ fontSize: 13, marginTop: 14, color: 'rgba(234,241,242,.7)' }}>
          Halaman pembayaran tidak terbuka?{' '}
          <a href={invoiceUrl} target="_blank" rel="noopener noreferrer" style={{ color: GLOW, fontWeight: 600 }}>Buka di sini ↗</a>
        </p>
      )}
    </div>
  );
}

function Unlocking() {
  return (
    <div className="k-fade" style={{ position: 'relative', overflow: 'hidden', background: SANCTUARY, borderRadius: 26, padding: '56px 24px', color: LIGHT, boxShadow: 'var(--shadow-deep)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="k-gleam" />
      <div style={{ position: 'relative', width: 74, height: 74, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1px solid rgba(174,132,63,.5)', color: 'var(--emas)' }}>
        <span className="k-seal"><Icon.lock size={26} /></span>
        <span className="k-seal-check" style={{ position: 'absolute' }}><Icon.check size={28} /></span>
      </div>
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'rgba(234,241,242,.8)', marginTop: 26 }}>Refleksimu terbuka…</p>
    </div>
  );
}

/* ---------------- Unlocked (deep-read, 7 real beats) ---------------- */
function DarkParas({ text, dropcap }) {
  if (!text) return null;
  return text.split('\n\n').map((p, i) => (
    <p key={i} className={dropcap && i === 0 ? 'k-dropcap' : ''} style={{ fontFamily: 'var(--font-sans)', fontSize: 15.5, lineHeight: 1.8, color: 'rgba(234,241,242,.86)', margin: i ? '12px 0 0' : 0 }}>{p}</p>
  ));
}
function ReframeCard({ children }) {
  return (
    <div style={{ background: 'rgba(9,18,21,.4)', borderLeft: `3px solid ${GLOW}`, borderRadius: 12, padding: 16, margin: '12px 0 0' }}>
      <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 16, fontStyle: 'italic', lineHeight: 1.55, color: '#EAF1F2' }}>{children}</p>
    </div>
  );
}

function Unlocked({ full, token, onUpdate }) {
  const c = full.paidContent;
  const H = BEAT_HEADINGS;
  const domainLabel = DOMAIN_LABEL[full.domain] || '';
  const chinese = full.chart?.dayMasterChinese || '';
  const scrollTo = (id) => () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (!c) return null;

  const BEAT = { marginBottom: 34 };
  const H3 = { fontFamily: 'var(--font-serif)', fontSize: 22, lineHeight: 1.2, color: '#F4F8F8', margin: '0 0 12px' };
  const BODY = { fontFamily: 'var(--font-sans)', fontSize: 15.5, lineHeight: 1.8, color: 'rgba(234,241,242,.86)', margin: '0 0 10px' };
  const label4 = { fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: GLOW, opacity: 0.8 };
  const kicker = (t) => <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: GLOW, opacity: 0.8, marginBottom: 10 }}>{t}</div>;

  const toc = [['b3', 'Yang Sebenarnya'], ['b4', 'Menenangkan vs Melelahkan'], ['b5', 'Empat Pilarmu'], ['b6', 'Cara Memutuskannya']];
  if (full.segeraDomains?.length) toc.push(['b-domains', 'Domain Lain']);

  return (
    <div className="k-fade" style={{ background: SANCTUARY, borderRadius: 26, padding: '30px 22px 40px', color: LIGHT, boxShadow: 'var(--shadow-deep)' }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: GLOW }}>Bacaan Mendalam{chinese ? ` · ${chinese}` : ''}</div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, lineHeight: 1.05, color: '#fff', margin: '12px 0 0' }}>{domainLabel}</h2>
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15.5, lineHeight: 1.7, color: 'rgba(234,241,242,.72)', margin: '14px 0 0' }}>Bukan ramalan, bukan nasihat. Satu cara melihat pola yang sama lebih dekat.</p>

      <div className="k-toc" style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '22px 0 6px', paddingBottom: 4 }}>
        {toc.map(([id, txt]) => (
          <button key={id} onClick={scrollTo(id)} style={{ flex: '0 0 auto', fontSize: 12, padding: '7px 12px', borderRadius: 999, border: '1px solid var(--el-g30)', background: 'rgba(9,18,21,.3)', color: 'rgba(234,241,242,.8)', cursor: 'pointer', whiteSpace: 'nowrap' }}>{txt}</button>
        ))}
      </div>

      <div style={{ margin: '22px 0 30px' }}><Rule light /></div>

      <div id="b1" style={BEAT}>{kicker('Bagian satu')}<h3 style={H3}>{H[1]}</h3><DarkParas text={c.beat1} dropcap /></div>

      <div id="b2" style={BEAT}>{kicker('Bagian dua')}<h3 style={H3}>{H[2]}</h3>
        {c.beat2?.intro && <p style={BODY}>{c.beat2.intro}</p>}
        <ul style={{ margin: 0, paddingLeft: 18, color: 'rgba(234,241,242,.86)' }}>{(c.beat2?.scenes || []).map((s, i) => <li key={i} style={{ margin: '8px 0', lineHeight: 1.7 }}>{s}</li>)}</ul>
      </div>

      <div id="b3" style={BEAT}>{kicker('Bagian tiga')}<h3 style={H3}>{H[3]}</h3><DarkParas text={c.beat3?.body} />{c.beat3?.pull && <ReframeCard>{c.beat3.pull}</ReframeCard>}</div>

      <div id="b4" style={BEAT}>{kicker('Bagian empat')}<h3 style={H3}>{H[4]}</h3>
        <div style={{ ...label4, margin: '0 0 6px' }}>Yang melelahkan</div><p style={BODY}>{c.beat4?.drain}</p>
        <div style={{ ...label4, margin: '14px 0 6px' }}>Yang menenangkan</div><p style={BODY}>{c.beat4?.feed}</p>
        {c.beat4?.sign && <ReframeCard>{c.beat4.sign}</ReframeCard>}
      </div>

      <PaidPillars id="b5" chart={full.chart} token={token} onUpdate={onUpdate} explanation={c.beat5?.explanation} hourNote={c.beat5?.hourNote} kicker={kicker('Bagian lima')} H3={H3} BODY={BODY} />

      <div id="b6" style={BEAT}>{kicker('Bagian enam')}<h3 style={H3}>{H[6]}</h3>
        {c.beat6?.lead && <p style={BODY}>{c.beat6.lead}</p>}
        {c.beat6?.rule && <div style={{ background: 'rgba(174,132,63,.12)', border: '1px solid rgba(174,132,63,.4)', borderRadius: 14, padding: 18, margin: '12px 0' }}><div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontStyle: 'italic', color: '#F0D9AE', lineHeight: 1.4 }}>“{c.beat6.rule}”</div></div>}
        {c.beat6?.body && <p style={BODY}>{c.beat6.body}</p>}
      </div>

      <div id="b7" style={BEAT}>{kicker('Bagian tujuh')}<h3 style={H3}>{H[7]}</h3><DarkParas text={c.beat7} /></div>

      {c.closer && <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'rgba(234,241,242,.75)', lineHeight: 1.7, margin: '8px 0 0' }}>{c.closer}</p>}

      {full.segeraDomains?.length > 0 && (
        <div id="b-domains" style={{ marginTop: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: GLOW, opacity: 0.8, marginBottom: 14 }}>Dua sisi lain dari dirimu</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {full.segeraDomains.map((d) => <SegeraRow key={d.domain} token={token} domain={d.domain} label={d.label} />)}
          </div>
          <p style={{ fontSize: 12, color: 'rgba(234,241,242,.5)', marginTop: 12 }}>Karier dan Uang sedang disiapkan. Tinggalkan nomor kalau mau dikabari.</p>
        </div>
      )}
    </div>
  );
}

/* Beat 5 — Empat Pilarmu recap (from the live chart) + interpretive explanation
   (paid) + post-pay hour-enrichment door. Pillars themselves are also shown FREE;
   this recap reflects any hour added here. No BaZi numbers come from content. */
function PaidPillars({ id, chart, token, onUpdate, explanation, hourNote, kicker, H3, BODY }) {
  const p = chart?.pillars;
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [busy, setBusy] = useState(false);
  if (!p) return null;

  async function addHour(e) {
    e.preventDefault();
    if (hour === '') return;
    setBusy(true);
    const birthTime = `${pad(hour)}:${pad(minute || 0)}`;
    const r = await fetch(`/api/reading/${token}/hour`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birthTime }),
    }).then((x) => x.json()).catch(() => null);
    setBusy(false);
    if (r && r.chart) onUpdate(r);
  }

  return (
    <div id={id} style={{ marginBottom: 34 }}>
      {kicker}
      <h3 style={H3}>Empat Pilarmu · 八字</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, margin: '6px 0 16px' }}>
        {['tahun', 'bulan', 'hari', 'jam'].map((k) => {
          const pl = p[k];
          return (
            <div key={k} style={{ textAlign: 'center', border: '1px solid var(--el-g25)', borderRadius: 12, padding: '12px 4px', background: 'rgba(9,18,21,.3)' }}>
              <div style={{ fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(234,241,242,.5)' }}>{pl ? pl.label : 'Jam'}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#EAF1F2', margin: '6px 0 2px' }}>{pl ? `${pl.stem}${pl.branch}` : '··'}</div>
              <div style={{ fontSize: 10, color: GLOW }}>{pl ? pl.elementId : 'belum diisi'}</div>
            </div>
          );
        })}
      </div>
      {explanation && <p style={BODY}>{explanation}</p>}
      {!p.hasHour && hourNote && <ReframeCard>{hourNote}</ReframeCard>}
      {!p.hasHour && (
        <form onSubmit={addHour} style={{ marginTop: 12, padding: 14, border: '1px dashed var(--el-g30)', borderRadius: 12, background: 'rgba(9,18,21,.25)' }}>
          <div style={{ fontSize: 13, color: 'rgba(234,241,242,.7)' }}>Jam lahir belum diisi. Tambahkan untuk bacaan yang lebih lengkap.</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginTop: 10 }}>
            <select value={hour} onChange={(e) => setHour(e.target.value)} aria-label="Jam" style={darkField}><option value="">Jam</option>{RANGE(24).map((h) => <option key={h} value={h}>{pad(h)}</option>)}</select>
            <select value={minute} onChange={(e) => setMinute(e.target.value)} aria-label="Menit" style={darkField}><option value="">Menit</option>{RANGE(60).map((m) => <option key={m} value={m}>{pad(m)}</option>)}</select>
            <Button type="submit" variant="gold" light disabled={busy || hour === ''} style={{ width: 'auto', padding: '0 18px' }}>{busy ? '…' : 'Tambah'}</Button>
          </div>
        </form>
      )}
    </div>
  );
}

/* A "segera" (coming-soon) domain row with WhatsApp demand-capture. CAPTURE ONLY. */
function SegeraRow({ token, domain, label }) {
  const [open, setOpen] = useState(false);
  const [wa, setWa] = useState('');
  const [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!/^[0-9+]{8,}$/.test(wa.replace(/\s/g, ''))) return;
    await fetch(`/api/reading/${token}/interest`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, wa_number: wa }),
    }).catch(() => null);
    setDone(true);
  }

  return (
    <div style={{ background: 'rgba(9,18,21,.4)', border: '1px solid var(--el-g20)', borderRadius: 16, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 19, color: '#EEF3F3' }}>{label}</div>
          <div style={{ fontSize: 12, color: GLOW, opacity: 0.7 }}>Segera</div>
        </div>
        {!done && <button type="button" onClick={() => setOpen((o) => !o)} style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--emas)', border: '1px solid rgba(174,132,63,.4)', borderRadius: 999, padding: '8px 16px', background: 'transparent', cursor: 'pointer' }}>Kabari aku</button>}
      </div>
      {open && !done && (
        <form onSubmit={submit} style={{ marginTop: 12 }}>
          <input type="tel" placeholder="08xxxxxxxxxx" value={wa} onChange={(e) => setWa(e.target.value)} style={darkField} />
          <div style={{ marginTop: 8 }}><Button type="submit">Kabari kalau sudah siap</Button></div>
        </form>
      )}
      {done && <div style={{ fontSize: 12.5, color: 'rgba(234,241,242,.6)', marginTop: 10 }}>Oke. Kami kabari kamu kalau bacaan {label} sudah siap.</div>}
    </div>
  );
}

/* ---------------- Re-access route: /r/[token] ----------------
   The receiving end of the link the app builds (sendReadingLink → /r/<id>) and of
   the URL the funnel now pushes on reading creation. `token` is the reading id.
   Fetches the SAME server-gated endpoints the funnel uses — no new gating path:
     - GET /api/reading/[token]        → free view + `paid` flag (always safe)
     - GET /api/reading/[token]/full   → paid content ONLY if paid===true
   Render: paid → full reading (free portrait + Unlocked, reusing <Reading>);
   unpaid → teaser + paywall only (decision at the top); invalid token → not-found. */
export function ReadingByToken({ token }) {
  const [status, setStatus] = useState('loading'); // loading | notfound | ready
  const [freeView, setFreeView] = useState(null);
  const [full, setFull] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/reading/${token}`);
        if (!res.ok) { if (!cancelled) setStatus('notfound'); return; }
        const fv = await res.json();
        if (!fv || fv.error || !fv.token) { if (!cancelled) setStatus('notfound'); return; }
        let paidFull = null;
        // TEST-UNGATE: with the flag on, revisiting an unpaid link shows the full reading
        // too (same render as a paid one — portrait + deep-read). VIEW-ONLY; the /full
        // route gates content, and the DB row stays paid=false.
        if (fv.paid || freeFullReadingEnabled()) {
          const fr = await fetch(`/api/reading/${token}/full`).then((r) => r.json()).catch(() => null);
          if (fr && fr.paid && fr.paidContent) paidFull = fr;
        }
        if (!cancelled) { setFreeView(fv); setFull(paidFull); setStatus('ready'); }
      } catch {
        if (!cancelled) setStatus('notfound');
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const goHome = () => { if (typeof window !== 'undefined') window.location.href = '/'; };

  if (status === 'loading') return <ReadingLoading />;
  if (status === 'notfound') return <ReadingNotFound onHome={goHome} />;

  // PAID → full reading (free portrait + Unlocked), reusing <Reading> with initialFull.
  if (full) return <Reading reading={freeView} onReset={goHome} initialFull={full} />;

  // UNPAID → teaser + paywall ONLY (returning visitor already saw the free portrait;
  // put the unlock decision at the top rather than below a re-scroll).
  return (
    <div style={{ ...wrap, ...themeVars(freeView.chart?.dayMasterElement), paddingTop: 26 }}>
      <button onClick={goHome} style={{ background: 'none', border: 'none', color: 'var(--muted-warm)', fontSize: 13, cursor: 'pointer', padding: '0 0 20px', fontFamily: 'var(--font-sans)' }}>← Beranda</button>
      <Reveal><Wordmark /></Reveal>
      <div style={{ marginTop: 22 }}><Paywall reading={freeView} /></div>
    </div>
  );
}

function ReadingLoading() {
  return (
    <div style={{ ...wrap, paddingTop: 120, textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--muted-warm)', margin: 0 }}>Membuka bacaanmu…</p>
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
