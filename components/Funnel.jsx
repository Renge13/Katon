'use client';

import { useEffect, useRef, useState } from 'react';
import Sharecard from './Sharecard.jsx';
import { exportSharecardPNG } from './exportCard.js';

const DOMAINS = [
  { key: 'hubungan', label: 'Hubungan' },
  { key: 'karier', label: 'Karier' },
  { key: 'rezeki', label: 'Rezeki' },
];
const ANTICIPATION = ['Ngitung empat pilarmu…', 'Nyari elemen intimu…', 'Nyusun polamu…'];
const pad = (n) => String(n).padStart(2, '0');
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Funnel() {
  const [phase, setPhase] = useState('input'); // input | calculating | result
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [domain, setDomain] = useState('hubungan');
  const [error, setError] = useState(null);

  const [reading, setReading] = useState(null); // { token, domain, freeContent, teaser }
  const [step, setStep] = useState(0);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!day || !month || !year) { setError('Isi tanggal lahirmu dulu ya.'); return; }
    const birthDate = `${year}-${pad(month)}-${pad(day)}`;
    const birthTime = hour !== '' ? `${pad(hour)}:${pad(minute || 0)}` : null;
    setPhase('calculating');
    try {
      const [res] = await Promise.all([
        fetch('/api/reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ birthDate, birthTime, domain }),
        }).then((r) => r.json()),
        delay(2500), // anticipation floor
      ]);
      if (res.error) { setError(readableError(res)); setPhase('input'); return; }
      setReading(res);
      setPhase('result');
    } catch {
      setError('Ada yang nggak beres. Coba lagi sebentar.');
      setPhase('input');
    }
  }

  // staged anticipation messages
  useEffect(() => {
    if (phase !== 'calculating') return;
    setStep(0);
    const t1 = setTimeout(() => setStep(1), 850);
    const t2 = setTimeout(() => setStep(2), 1700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  if (phase === 'input') {
    return <InputScreen {...{ day, setDay, month, setMonth, year, setYear, hour, setHour, minute, setMinute, domain, setDomain, error, onSubmit }} />;
  }
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
  return <Result reading={reading} />;
}

function readableError(res) {
  if (res.error === 'archetype_content_unavailable') {
    return `Bacaan untuk arketipe ${res.dayMaster || ''} belum siap. Saat ini baru 丙 (Matahari) yang lengkap.`;
  }
  return 'Ada yang nggak beres. Coba lagi sebentar.';
}

/* ---------------- Input ---------------- */
function InputScreen({ day, setDay, month, setMonth, year, setYear, hour, setHour, minute, setMinute, domain, setDomain, error, onSubmit }) {
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
          <select value={day} onChange={(e) => setDay(e.target.value)} aria-label="Tanggal">
            <option value="">Tgl</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Bulan">
            <option value="">Bulan</option>
            {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)} aria-label="Tahun">
            <option value="">Tahun</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="field-label">Jam lahir <span style={{ color: 'var(--muted)', fontWeight: 400 }}>· opsional</span></div>
        <div className="row">
          <select value={hour} onChange={(e) => setHour(e.target.value)} aria-label="Jam">
            <option value="">Jam</option>
            {Array.from({ length: 24 }, (_, i) => i).map((h) => <option key={h} value={h}>{pad(h)}</option>)}
          </select>
          <select value={minute} onChange={(e) => setMinute(e.target.value)} aria-label="Menit">
            <option value="">Menit</option>
            {Array.from({ length: 60 }, (_, i) => i).map((m) => <option key={m} value={m}>{pad(m)}</option>)}
          </select>
        </div>
        <div className="muted-note">Nggak inget jam? Nggak apa-apa — polamu tetap kebaca tanpa itu.</div>

        <div className="field-label">Lagi kepikiran apa?</div>
        <div className="domain-chips">
          {DOMAINS.map((d) => (
            <button type="button" key={d.key} className="chip" aria-pressed={domain === d.key} onClick={() => setDomain(d.key)}>
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

/* ---------------- Result (scrolling) ---------------- */
function Result({ reading }) {
  const fc = reading.freeContent;
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try { await exportSharecardPNG('sharecard', `katon-${(fc.archetypeName || 'kamu').toLowerCase()}.png`); }
    catch { /* ignore */ }
    setSaving(false);
  }

  return (
    <div className="funnel fade-in">
      <div className="card-stage">
        <Sharecard data={fc} birthDate={reading.birthDate} />
        <div className="card-actions">
          <button className="btn-ghost" onClick={save} disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan Gambar'}</button>
        </div>
      </div>

      <section className="section">
        <div className="eyebrow">Siapa kamu</div>
        <p style={{ marginTop: 12 }}>{fc.freeRead?.siapaKamu}</p>
      </section>

      <section className="section">
        <div className="eyebrow">Komposisi energimu</div>
        <p style={{ marginTop: 12 }}>{fc.elementNote}</p>
      </section>

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

      <section className="section">
        <Paywall reading={reading} />
      </section>
    </div>
  );
}

/* ---------------- Paywall + unlock ---------------- */
function Paywall({ reading }) {
  const [stage, setStage] = useState('teaser'); // teaser | wa | pending | unlocked
  const [wa, setWa] = useState('');
  const [paidContent, setPaidContent] = useState(null);
  const pollRef = useRef(null);

  async function submitWa(e) {
    e.preventDefault();
    if (!/^[0-9+]{8,}$/.test(wa.replace(/\s/g, ''))) return;
    await fetch(`/api/pay/${reading.token}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wa_number: wa }),
    }).catch(() => {});
    setStage('pending');
  }

  // While pending, poll /full. The verified webhook flips paid (real Xendit in
  // Phase 4a; triggered manually in dev). When paid, the REAL content arrives.
  useEffect(() => {
    if (stage !== 'pending') return;
    let tries = 0;
    pollRef.current = setInterval(async () => {
      tries += 1;
      const r = await fetch(`/api/reading/${reading.token}/full`).then((x) => x.json()).catch(() => null);
      if (r && r.paid && r.paidContent) {
        clearInterval(pollRef.current);
        setPaidContent(r.paidContent);
        setStage('unlocked');
      }
      if (tries > 60) clearInterval(pollRef.current);
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [stage, reading.token]);

  if (stage === 'unlocked' && paidContent) return <Unlocked content={paidContent} />;

  if (stage === 'pending') {
    return (
      <div className="pending">
        <div className="spinner" />
        <p style={{ fontWeight: 600, color: 'var(--ink)' }}>Menunggu konfirmasi pembayaran…</p>
        <p style={{ fontSize: 13 }}>Begitu masuk, bacaanmu langsung kebuka di sini.</p>
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

  // teaser
  const t = reading.teaser;
  return (
    <div className="paywall">
      <div className="eyebrow">Bacaan Mendalam {reading.domain ? `· ${reading.domain}` : ''}</div>
      {t && <h2 style={{ fontFamily: 'var(--serif)', fontSize: 21, margin: '10px 0 12px' }}>{t.title}</h2>}
      {t && (
        <p className="teaser-text">
          {t.text}<span className="cut"> </span>
        </p>
      )}
      <div className="frost" aria-hidden="true">
        <div className="frost-lines">
          <span style={{ width: '94%' }} /><span style={{ width: '88%' }} /><span style={{ width: '96%' }} />
          <span style={{ width: '70%' }} /><span style={{ width: '90%' }} /><span style={{ width: '60%' }} />
        </div>
        <div className="frost-lock">Terkunci</div>
      </div>

      <div className="cred">✦ Dibaca dari Empat Pilar (八字) kelahiranmu — bukan ramalan, sebuah lensa.</div>

      <div className="price-block">
        <div className="anchor">Konsultasi kayak gini biasanya Rp 300–500rb.</div>
        <div className="price">Rp 49.000 <small>selamanya</small></div>
        <div className="decoy"><s>Rp 249.000/tahun</s> — Segera</div>
      </div>

      <button className="btn-primary" onClick={() => setStage('wa')}>Buka Refleksiku</button>
      <div className="fineprint">🔒 Sekali baca. Milikmu selamanya.</div>
    </div>
  );
}

/* ---------------- Unlocked (5 beats) ---------------- */
function Unlocked({ content }) {
  return (
    <div className="unlocked fade-in">
      <div className="eyebrow">Bacaan Mendalam</div>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, margin: '8px 0 4px' }}>{content.title}</h2>
      {content.subtitle && <p style={{ color: 'var(--ink-soft)', fontStyle: 'italic' }}>{content.subtitle}</p>}

      {/* beat 1 — polanya */}
      <div className="beat"><h3>Polanya</h3><p>{content.polanya}</p></div>

      {/* beat 2 — the reframe */}
      <div className="beat">
        <h3>Yang sebenernya kejadian</h3>
        <div className="reframe"><p style={{ margin: 0 }}>{content.yangSebenernyaKejadian}</p></div>
      </div>

      {/* beat 3 — scenes */}
      <div className="beat">
        <h3>Gimana ini muncul</h3>
        <ul>{(content.gimanaIniMuncul || []).map((s, i) => <li key={i}>{s}</li>)}</ul>
      </div>

      {/* beat 4 — drains / feeds */}
      <div className="beat">
        <h3>Yang ngabisin kamu</h3><p>{content.yangNgabisin}</p>
        <h3 style={{ marginTop: 16 }}>Yang ngisi kamu</h3><p>{content.yangNgisi}</p>
      </div>

      {/* beat 5 — the prescription */}
      <div className="beat">
        <h3>Cara mutusinnya</h3>
        <p>{content.caraMutusinnya}</p>
        <div className="rule-card"><div className="rule">“{content.decisionRule}”</div></div>
      </div>

      {content.closing && <p className="closing">{content.closing}</p>}
    </div>
  );
}
