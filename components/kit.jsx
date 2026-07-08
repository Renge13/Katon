'use client';
// Shared presentational atoms for the Katon funnel — ported from the Claude Design
// "Sunyi" kit. Inline styles + tokens from globals.css. Motion via CSS classes
// (k-rise etc.) so it is reliable and respects prefers-reduced-motion.

// ── element → pigment map: THE single source of truth for element theming ──
// deep/mid/wash (pigment) + bar fill + glow (dark-surface accent) + label (ID) +
// bg (element-tinted "sanctuary" dark canvas). Every element-themed surface —
// persona, pillars, bars, bridge, paywall, deep-read, sharecard — resolves its
// accent from here (directly, or via the --el-* CSS vars threaded in Funnel).
const EL = {
  water: { deep: '#173039', mid: '#3C6C7A', wash: '#CFE1E8', bar: 'var(--senja)', glow: '#6FA0AE', label: 'Air',   bg: 'radial-gradient(120% 85% at 50% -10%, #2C545F 0%, #16333B 46%, #0A161A 100%)' },
  fire:  { deep: '#8B3A1A', mid: '#C4622A', wash: '#FADEC2', bar: 'var(--clay)',  glow: '#E08A54', label: 'Api',   bg: 'radial-gradient(120% 85% at 50% -10%, #7A3218 0%, #3A1A0D 46%, #160B06 100%)' },
  wood:  { deep: '#2E5C2E', mid: '#5A8F4E', wash: '#D6EACD', bar: 'var(--sage)',  glow: '#8DBE80', label: 'Kayu',  bg: 'radial-gradient(120% 85% at 50% -10%, #2C5730 0%, #16301A 46%, #0A140C 100%)' },
  earth: { deep: '#5A4E3A', mid: '#8A7A5E', wash: '#EAE1D1', bar: 'var(--emas)',  glow: '#C6AC7E', label: 'Bumi',  bg: 'radial-gradient(120% 85% at 50% -10%, #5A4D38 0%, #302818 46%, #14100A 100%)' },
  metal: { deep: '#454A52', mid: '#7C808A', wash: '#DEE2E8', bar: '#9DA1A8',      glow: '#AEB2BB', label: 'Logam', bg: 'radial-gradient(120% 85% at 50% -10%, #4A4E56 0%, #26282E 46%, #101114 100%)' },
};
function elKey(name) {
  const n = (name || '').toLowerCase();
  if (/(water|air)/.test(n)) return 'water';
  if (/(fire|api)/.test(n)) return 'fire';
  if (/(wood|kayu)/.test(n)) return 'wood';
  if (/(earth|bumi|tanah)/.test(n)) return 'earth';
  if (/(metal|logam)/.test(n)) return 'metal';
  return 'earth';
}
export const elColor = (name) => EL[elKey(name)];

// hex → rgba string (for building element-tinted alpha values).
export function alpha(hex, a) {
  const n = hex.replace('#', '');
  return `rgba(${parseInt(n.slice(0, 2), 16)},${parseInt(n.slice(2, 4), 16)},${parseInt(n.slice(4, 6), 16)},${a})`;
}

// ── icons (Tabler-style outline, 1.6 stroke) ──────────────────────────────
function Ic({ d, size = 18, sw = 1.6, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">{d}</svg>
  );
}
export const Icon = {
  chevDown: (p) => <Ic {...p} d={<path d="M6 9l6 6 6-6" />} />,
  lock:     (p) => <Ic {...p} d={<g><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></g>} />,
  save:     (p) => <Ic {...p} d={<g><path d="M12 4v11" /><path d="M8 11l4 4 4-4" /><path d="M6 20h12" /></g>} />,
  check:    (p) => <Ic {...p} d={<path d="M5 12l5 5 9-10" />} />,
  arrow:    (p) => <Ic {...p} d={<g><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></g>} />,
  sparkle:  (p) => <Ic {...p} d={<path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z" />} />,
};

// ── CSS-driven staggered reveal ───────────────────────────────────────────
export function Reveal({ children, delay = 0, style }) {
  return <div className="k-rise" style={{ ...style, animationDelay: `${delay}s` }}>{children}</div>;
}

// ── atoms ─────────────────────────────────────────────────────────────────
export function Eyebrow({ children, color, style }) {
  return <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: color || 'var(--clay)', ...style }}>{children}</div>;
}

export function Button({ children, variant = 'primary', type = 'button', onClick, disabled, style, light }) {
  const base = { fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 16, cursor: disabled ? 'default' : 'pointer', border: 'none', borderRadius: 16, padding: '15px 22px', transition: 'transform .2s var(--ease-quiet), box-shadow .2s, background .2s', width: '100%', opacity: disabled ? 0.5 : 1 };
  const v = {
    primary: { background: 'var(--clay)', color: '#fff', boxShadow: 'var(--shadow-cta)' },
    gold:    { background: 'transparent', color: light ? 'rgba(244,238,227,.92)' : 'var(--kayu)', border: `1px solid ${light ? 'rgba(174,132,63,.4)' : 'var(--border)'}` },
    ghost:   { background: 'transparent', color: light ? 'rgba(244,238,227,.85)' : 'var(--tinta-soft)', border: `1px solid ${light ? 'rgba(174,132,63,.4)' : 'var(--border)'}` },
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'translateY(1px)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = ''; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
      style={{ ...base, ...v, ...style }}>{children}</button>
  );
}

export function Rule({ light, width = '100%', style }) {
  const line = light ? 'rgba(174,132,63,.28)' : 'var(--divider)';
  const dot = light ? 'rgba(174,132,63,.7)' : 'var(--emas)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width, margin: '0 auto', ...style }}>
      <div style={{ flex: 1, height: 1, background: line }} />
      <div style={{ width: 4, height: 4, borderRadius: '50%', background: dot }} />
      <div style={{ flex: 1, height: 1, background: line }} />
    </div>
  );
}

// One "Komposisi Energimu" bar — width = pct (max-normalized). NEUTRAL: no raw
// numbers; gloss describes the ELEMENT; badges mark dominant/thinnest only.
export function BalanceBar({ label, gloss, pct, element, isDominant, isMissing }) {
  const c = elColor(element);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 7 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--tinta)' }}>{label}</span>
          <span style={{ fontSize: 12.5, color: 'var(--muted-warm)' }}>{gloss}</span>
        </div>
        {isDominant && <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: c.mid }}>Paling kuat</span>}
        {isMissing && <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--clay)' }}>Paling tipis</span>}
      </div>
      <div style={{ height: 8, borderRadius: 6, background: 'var(--kertas-3)', overflow: 'hidden', border: '1px solid var(--divider)' }}>
        <div className="k-bar" style={{ height: '100%', width: `${pct}%`, borderRadius: 6, background: `linear-gradient(90deg, ${c.mid}, ${c.deep})`, transformOrigin: 'left' }} />
      </div>
    </div>
  );
}

// One "Empat Pilarmu" cell. Neutral: stem/branch + element·polarity label only.
export function PillarCell({ label, stem, branch, elementId, element, polarity, isDayMaster }) {
  const c = elColor(element || elementId);
  return (
    <div style={{
      position: 'relative', borderRadius: 16, padding: '15px 8px 13px', textAlign: 'center',
      background: isDayMaster ? `linear-gradient(180deg, ${c.wash}, var(--kertas-2))` : 'var(--kertas-2)',
      border: `1px solid ${isDayMaster ? c.mid : 'var(--border)'}`,
      boxShadow: isDayMaster ? '0 10px 24px -14px rgba(60,42,24,.4)' : 'none',
    }}>
      {isDayMaster && <div style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: 9, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#fff', background: c.mid, borderRadius: 999, padding: '3px 9px' }}>Inti diri</div>}
      <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted-warm)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30, lineHeight: 1, color: c.deep }}>{stem || '·'}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1, color: c.mid, marginTop: 3 }}>{branch || '·'}</div>
      <div style={{ fontSize: 10, color: 'var(--tinta-soft)', marginTop: 8 }}>{elementId ? `${elementId}${polarity ? ` · ${polarity}` : ''}` : 'belum diisi'}</div>
    </div>
  );
}
