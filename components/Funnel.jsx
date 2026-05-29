'use client';

import { useEffect, useRef, useState } from 'react';
import { ELEMENT_CONFIG } from '@/lib/bazi/elementConfig.js';
import Sharecard from './Sharecard.jsx';
import { exportSharecardPNG } from './exportCard.js';

const DOMAINS = [
  { key: 'hubungan', label: 'Hubungan' },
  { key: 'karier', label: 'Karier' },
  { key: 'rezeki', label: 'Rezeki' },
];
const DOMAIN_LABEL = { hubungan: 'Hubungan', karier: 'Karier', rezeki: 'Rezeki' };
const ANTICIPATION = ['Ngitung empat pilarmu…', 'Nyari elemen intimu…', 'Nyusun polamu…'];
const pad = (n) => String(n).padStart(2, '0');
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Funnel() {
  const [phase, setPhase] = useState('input'); // input | calculating | result
  const [form, setForm] = useState({ day: '', month: '', year: '', hour: '', minute: '', domain: 'hubungan' });
  const [error, setError] = useState(null);
  const [reading, setReading] = useState(null);
  const [step, setStep] = useState(0);

  function reset() {
    setReading(null);
    setError(null);
    setPhase('input');
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const { day, month, year, hour, minute, domain } = form;
    if (!day || !month || !year) { setError('Isi tanggal lahirmu dulu ya.'); return; }
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
      setPhase('result');
    } catch {
      setError('Ada yang nggak beres. Coba lagi sebentar.');
      setPhase('input');
    }
  }

  useEffect(() => {
    if (phase !== 'calculating') return;
    const t1 = setTimeout(() => setStep(1), 850);
    const t2 = setTimeout(() => setStep(2), 1700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  if (phase === 'input') return <InputScreen form={form} setForm={setForm} error={error} onSubmit={onSubmit} />;
  if (phase === 'calculating') {
    return (
      <div className="funnel">
        <div className="anticipation">
          <div className="bloom" />
          <div className="anticipation-step fade-in" key={step}>{ANTICIPATION[step]}</div>
        </div>
      </div>
    );
  }
  return <Result reading={reading} onReset={reset} />;
}

function readableError(res) {
  if (res.error === 'archetype_content_unavailable') {
    return `Bacaan untuk arketipe ${res.dayMaster || ''} belum siap. Saat ini baru 丙 (Matahari) yang lengkap.`;
  }
  return 'Ada yang nggak beres. Coba lagi sebentar.';
}

/* ---------------- Input ---------------- */
function InputScreen({ form, setForm, error, onSubmit }) {
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target ? e.target.value : e }));
  const years = []; for (let y = 2012; y >= 1940; y--) years.push(y);
  return (
    <div className="funnel">
      <div className="hero">
        <div className="wordmark">KATON</div>
        <div className="hero-lead">Refleksi personal dari waktu kelahiranmu.</div>
        <div className="hero-statement">Kamu punya pola.</div>
        <div className="hero-sub">Dan mungkin selama ini, kamu belum pernah benar-benar melihatnya.</div>
      </div>
      <form className="input-card" onSubmit={onSubmit}>
        <div className="field-label">Tanggal lahir</div>
        <div className="row">
          <select value={form.day} onChange={set('day')} aria-label="Tanggal">
            <option value="">Tgl</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={form.month} onChange={set('month')} aria-label="Bulan">
            <option value="">Bulan</option>
            {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select value={form.year} onChange={set('year')} aria-label="Tahun">
            <option value="">Tahun</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="field-label">Jam lahir <span style={{ color: 'var(--muted)', fontWeight: 400 }}>· opsional</span></div>
        <div className="row">
          <select value={form.hour} onChange={set('hour')} aria-label="Jam">
            <option value="">Jam</option>
            {Array.from({ length: 24 }, (_, i) => i).map((h) => <option key={h} value={h}>{pad(h)}</option>)}
          </select>
          <select value={form.minute} onChange={set('minute')} aria-label="Menit">
            <option value="">Menit</option>
            {Array.from({ length: 60 }, (_, i) => i).map((m) => <option key={m} value={m}>{pad(m)}</option>)}
          </select>
        </div>
        <div className="muted-note">Isi kalau inget — bacaanmu tetap akurat tanpa ini, cuma kalau ada, beberapa lapisan jadi lebih dalam.</div>

        <div className="field-label">Lagi kepikiran apa?</div>
        <div className="domain-chips">
          {DOMAINS.map((d) => (
            <button type="button" key={d.key} className="chip" aria-pressed={form.domain === d.key} onClick={() => setForm((f) => ({ ...f, domain: d.key }))}>
              {d.label}
            </button>
          ))}
        </div>

        {error && <div className="error">{error}</div>}
        <button className="btn-primary" type="submit">Lihat Refleksiku</button>
        <div className="assurance">Cuma butuh tanggal lahir. Nggak ada akun, nggak ada spam.</div>
      </form>
    </div>
  );
}

/* ---------------- Result (one continuous scroll) ---------------- */
function Result({ reading, onReset }) {
  const fc = reading.freeContent;
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    try { await exportSharecardPNG('sharecard', `katon-${(fc.archetypeName || 'kamu').toLowerCase()}.png`); } catch { /* */ }
    setSaving(false);
  }
  return (
    <div className="funnel fade-in">
      <button className="back-link" onClick={onReset}>← Ganti tanggal</button>

      <div className="card-stage">
        <Sharecard data={fc} birthDate={reading.birthDate} />
        <div className="card-actions">
          <button className="btn-ghost" onClick={save} disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan Gambar'}</button>
        </div>
      </div>

      <section className="section"><div className="eyebrow">Siapa kamu</div><p style={{ marginTop: 12 }}>{fc.freeRead?.siapaKamu}</p></section>
      <section className="section"><div className="eyebrow">Komposisi energimu</div><p style={{ marginTop: 12 }}>{fc.elementNote}</p></section>
      <section className="section">
        <div className="eyebrow">Pola dasar & cara kamu hadir</div>
        <p style={{ marginTop: 12 }}>{fc.freeRead?.polaDasar}</p>
        <p>{fc.freeRead?.caraKamuHadir}</p>
      </section>

      {fc.bridgeQuestion && (
        <section className="section">
          <div className="bridge">
            <div className="eyebrow" style={{ marginBottom: 10 }}>Yang lagi kamu bawa</div>
            <div className="q">{fc.bridgeQuestion}</div>
          </div>
        </section>
      )}

      <section className="section"><Paywall reading={reading} /></section>
    </div>
  );
}

/* ---------------- Paywall (progressive disclosure) ---------------- */
function Paywall({ reading }) {
  const [stage, setStage] = useState('teaser'); // teaser | offer | wa | pending | unlocked
  const [wa, setWa] = useState('');
  const [full, setFull] = useState(null);
  const [invoiceUrl, setInvoiceUrl] = useState(null);
  const pollRef = useRef(null);

  async function submitWa(e) {
    e.preventDefault();
    if (!/^[0-9+]{8,}$/.test(wa.replace(/\s/g, ''))) return;
    const res = await fetch(`/api/pay/${reading.token}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wa_number: wa }),
    }).then((r) => r.json()).catch(() => null);
    // Open the Xendit checkout (QRIS) in a new tab; this tab keeps polling /full
    // and unlocks when the verified webhook flips paid. (Triggered from the
    // submit gesture, so it isn't popup-blocked; a fallback link shows below too.)
    if (res?.invoiceUrl) {
      setInvoiceUrl(res.invoiceUrl);
      window.open(res.invoiceUrl, '_blank', 'noopener');
    }
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
        setStage('unlocked');
      }
      if (tries > 60) clearInterval(pollRef.current);
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [stage, reading.token]);

  if (stage === 'unlocked' && full) return <Unlocked full={full} token={reading.token} onUpdate={setFull} />;

  if (stage === 'pending') {
    return (
      <div className="pending">
        <div className="spinner" />
        <p style={{ fontWeight: 600, color: 'var(--ink)' }}>Menunggu konfirmasi pembayaran…</p>
        <p style={{ fontSize: 13 }}>Begitu masuk, bacaanmu langsung kebuka di sini.</p>
        {invoiceUrl && (
          <p style={{ fontSize: 13, marginTop: 12 }}>
            Halaman pembayaran nggak kebuka?{' '}
            <a href={invoiceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-deep)', fontWeight: 600 }}>Buka di sini ↗</a>
          </p>
        )}
      </div>
    );
  }

  if (stage === 'wa') {
    return (
      <form className="paywall" onSubmit={submitWa}>
        <div className="eyebrow">Satu langkah lagi</div>
        <p style={{ marginTop: 12 }}>Ke mana bacaanmu kami kirim? Masukin nomor WhatsApp-mu.</p>
        <input type="tel" placeholder="08xxxxxxxxxx" value={wa} onChange={(e) => setWa(e.target.value)} />
        <button className="btn-primary" type="submit" style={{ marginTop: 16 }}>Lanjut Bayar</button>
        <div className="fineprint">Nomornya cuma buat ngirim bacaan + link-mu. Bukan buat spam.</div>
      </form>
    );
  }

  const t = reading.teaser;
  // Stage (a): teaser + curiosity gap. Stage (b): compact cred + anchored price.
  return (
    <div className="paywall">
      <div className="eyebrow">Bacaan Mendalam {reading.domain ? `· ${DOMAIN_LABEL[reading.domain]}` : ''}</div>
      {t && <h2 style={{ fontFamily: 'var(--serif)', fontSize: 21, margin: '10px 0 12px' }}>{t.title}</h2>}
      {t && <p className="teaser-text">{t.text}<span className="cut"> </span></p>}
      <div className="frost" aria-hidden="true">
        <div className="frost-lines">
          <span style={{ width: '94%' }} /><span style={{ width: '88%' }} /><span style={{ width: '96%' }} />
          <span style={{ width: '70%' }} /><span style={{ width: '90%' }} /><span style={{ width: '60%' }} />
        </div>
        <div className="frost-lock">Terkunci</div>
      </div>

      {stage === 'teaser' && (
        <button className="btn-primary" onClick={() => setStage('offer')}>Buka Bacaan Mendalam</button>
      )}

      {stage === 'offer' && (
        <div className="fade-in">
          <div className="cred">Dihitung dari 八字 BaZi, Empat Pilar dari tanggal lahirmu — bukan kuis.</div>
          <div className="price-block">
            <div className="anchor">Konsultasi kayak gini biasanya Rp 300–500rb.</div>
            <div className="price">Rp 49.000 <small>selamanya</small></div>
            <div className="decoy"><s>Rp 249.000/tahun</s> — Segera</div>
          </div>
          <button className="btn-primary" onClick={() => setStage('wa')}>Buka Refleksiku</button>
          <div className="fineprint">🔒 Sekali baca. Milikmu selamanya.</div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Unlocked (sectioned + TOC) ---------------- */
function Unlocked({ full, token, onUpdate }) {
  const c = full.paidContent;
  const scrollTo = (id) => () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return (
    <div className="unlocked fade-in">
      <div className="eyebrow">Bacaan Mendalam</div>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, margin: '8px 0 4px' }}>{c.title}</h2>
      {c.subtitle && <p style={{ color: 'var(--ink-soft)', fontStyle: 'italic' }}>{c.subtitle}</p>}

      <nav className="toc">
        <button onClick={scrollTo('b-pola')}>Pola</button>
        <button onClick={scrollTo('b-reframe')}>Yang Sebenernya</button>
        <button onClick={scrollTo('b-cara')}>Cara Mutusin</button>
        <button onClick={scrollTo('b-pillars')}>Empat Pilarmu</button>
        {full.otherDomains?.length > 0 && <button onClick={scrollTo('b-domains')}>Domain Lain</button>}
      </nav>

      <div className="beat" id="b-pola"><h3>Polanya</h3><p>{c.polanya}</p></div>
      <div className="beat" id="b-reframe">
        <h3>Yang sebenernya kejadian</h3>
        <div className="reframe"><p style={{ margin: 0 }}>{c.yangSebenernyaKejadian}</p></div>
      </div>
      <div className="beat"><h3>Gimana ini muncul</h3><ul>{(c.gimanaIniMuncul || []).map((s, i) => <li key={i}>{s}</li>)}</ul></div>
      <div className="beat">
        <h3>Yang ngabisin kamu</h3><p>{c.yangNgabisin}</p>
        <h3 style={{ marginTop: 16 }}>Yang ngisi kamu</h3><p>{c.yangNgisi}</p>
      </div>
      <div className="beat" id="b-cara">
        <h3>Cara mutusinnya</h3><p>{c.caraMutusinnya}</p>
        <div className="rule-card"><div className="rule">“{c.decisionRule}”</div></div>
      </div>
      {c.closing && <p className="closing">{c.closing}</p>}

      <FourPillars id="b-pillars" chart={full.chart} token={token} onUpdate={onUpdate} />

      {full.otherDomains?.length > 0 && (
        <div className="beat" id="b-domains">
          <h3>Domain lain</h3>
          {full.otherDomains.map((d) => (
            <div key={d.domain} className="upsell-row">
              <div>
                <div className="upsell-title">{d.title}</div>
                <div className="upsell-sub">{DOMAIN_LABEL[d.domain]} · {d.subtitle}</div>
              </div>
              <span className="upsell-lock">🔒</span>
            </div>
          ))}
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>Kebuka satu-satu. Yang ini dulu kamu resapin.</p>
        </div>
      )}
    </div>
  );
}

/* Four Pillars + element bars + post-pay hour-enrichment door */
function FourPillars({ id, chart, token, onUpdate }) {
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
    <div className="beat" id={id}>
      <h3>Empat Pilarmu · 八字</h3>
      <div className="pillars">
        {['tahun', 'bulan', 'hari'].map((k) => {
          const pl = p[k];
          return (
            <div key={k} className="pillar">
              <div className="pillar-label">{pl.label}</div>
              <div className="pillar-chars">{pl.stem}{pl.branch}</div>
              <div className="pillar-el">{pl.elementId}</div>
            </div>
          );
        })}
        {p.jam ? (
          <div className="pillar">
            <div className="pillar-label">{p.jam.label}</div>
            <div className="pillar-chars">{p.jam.stem}{p.jam.branch}</div>
            <div className="pillar-el">{p.jam.elementId}</div>
          </div>
        ) : (
          <div className="pillar pillar--empty">
            <div className="pillar-label">Jam</div>
            <div className="pillar-chars">··</div>
            <div className="pillar-el">belum diisi</div>
          </div>
        )}
      </div>

      <div className="element-bars">
        {(chart.elementBars || []).map((b) => (
          <div key={b.element} className="ebar-row">
            <span className="ebar-label">{b.label}</span>
            <span className="ebar-track"><span className="ebar-fill" style={{ width: `${b.pct}%`, background: (ELEMENT_CONFIG[b.element] || ELEMENT_CONFIG.Fire).mid }} /></span>
            <span className="ebar-val">{b.value}</span>
          </div>
        ))}
      </div>

      {!p.hasHour && (
        <form className="hour-door" onSubmit={addHour}>
          <div className="hour-door-copy">Jam lahir belum diisi — tambahin buat baca yang lebih lengkap.</div>
          <div className="row" style={{ marginTop: 10 }}>
            <select value={hour} onChange={(e) => setHour(e.target.value)} aria-label="Jam">
              <option value="">Jam</option>
              {Array.from({ length: 24 }, (_, i) => i).map((h) => <option key={h} value={h}>{pad(h)}</option>)}
            </select>
            <select value={minute} onChange={(e) => setMinute(e.target.value)} aria-label="Menit">
              <option value="">Menit</option>
              {Array.from({ length: 60 }, (_, i) => i).map((m) => <option key={m} value={m}>{pad(m)}</option>)}
            </select>
            <button className="btn-ghost" type="submit" disabled={busy || hour === ''}>{busy ? '…' : 'Tambah'}</button>
          </div>
        </form>
      )}
    </div>
  );
}
