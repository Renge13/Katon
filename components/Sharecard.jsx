'use client';
// Sharecard — 9:16 watercolor card rendered from the new bing.js-shape free
// content. Inline styles (not CSS classes) so html-to-image exports reliably.
// Display 360×640; exportCard scales ×3 to 1080×1920.

import { ELEMENT_CONFIG } from '@/lib/bazi/elementConfig.js';
import { branchesToTaggable } from '@/lib/zodiac.js';

const BASE = {
  bg: '#F6F1E8', border: '#E4DAD0', divider: '#EDE5DC',
  ink: '#2A2520', inkSoft: '#5A4A3A', muted: '#A8927E',
};

const ID_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const mi = parseInt(m, 10) - 1;
  return mi >= 0 && mi < 12 ? `${parseInt(d, 10)} ${ID_MONTHS[mi]} ${y}` : iso;
}

function TaggableCol({ label, items, ink, muted, pad }) {
  return (
    <div style={{ paddingLeft: pad ? 12 : 0 }}>
      <div style={{ fontSize: 9, letterSpacing: 1, color: muted, fontWeight: 600, marginBottom: 5 }}>{label}</div>
      {(items && items.length ? items : null) ? items.map((t, i) => (
        <div key={i} style={{ marginBottom: 5 }}>
          <div style={{ fontSize: 13, color: ink, lineHeight: 1.15 }}>{t.archetype}</div>
          <div style={{ fontSize: 9.5, color: muted }}>lahir tahun {t.zodiac}</div>
        </div>
      )) : <div style={{ fontSize: 13, color: ink }}>—</div>}
    </div>
  );
}

export default function Sharecard({ data, birthDate, id = 'sharecard' }) {
  if (!data) return null;
  const cfg = ELEMENT_CONFIG[data.dayMasterElement] || ELEMENT_CONFIG.Fire;
  const dims = data.card?.dimensions || {};
  const lines = [dims.kekuatan, dims.polaTersembunyi, dims.yangOrangNggakSadar].filter(Boolean);
  const selaras = data.card?.selaras || branchesToTaggable(data.card?.compatibleBranches);
  const pemicu = data.card?.pemicu || branchesToTaggable(data.card?.clashBranches);

  return (
    <div
      id={id}
      style={{
        width: 360, height: 640, position: 'relative', overflow: 'hidden',
        borderRadius: 18, background: BASE.bg, color: BASE.ink,
        boxShadow: `0 0 0 1px ${BASE.border}`,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* watercolor bloom */}
      <div style={{
        position: 'absolute', top: -90, right: -70, width: 280, height: 280, borderRadius: '50%',
        background: `radial-gradient(circle at 45% 40%, ${cfg.wash}, rgba(255,255,255,0) 70%)`,
        opacity: 0.9, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -110, left: -80, width: 300, height: 300, borderRadius: '50%',
        background: `radial-gradient(circle at 50% 50%, ${cfg.wash}, rgba(255,255,255,0) 68%)`,
        opacity: 0.55, pointerEvents: 'none',
      }} />

      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '18px 22px 0', fontSize: 10, color: BASE.muted, position: 'relative' }}>
        <span>{fmtDate(birthDate)}</span>
        <span style={{ letterSpacing: 2 }}>KATON · 八字</span>
      </div>

      {/* identity */}
      <div style={{ padding: '30px 22px 0', position: 'relative' }}>
        <div style={{ fontSize: 11, letterSpacing: 1.5, color: cfg.mid, marginBottom: 6 }}>
          {data.dayMasterChinese} · {cfg.label}
        </div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 40, fontWeight: 700, letterSpacing: 3, color: cfg.deep, lineHeight: 1, textTransform: 'uppercase' }}>
          {data.archetypeName}
        </div>
        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14, color: BASE.inkSoft, marginTop: 14, lineHeight: 1.45 }}>
          {data.card?.tagline}
        </div>
      </div>

      {/* three dimension lines (three-shapes rule) */}
      <div style={{ padding: '26px 22px 0', position: 'relative', flex: 1 }}>
        {lines.map((line, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '13px 0', borderTop: i === 0 ? 'none' : `1px solid ${BASE.divider}` }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.mid, marginTop: 7, flexShrink: 0 }} />
            <span style={{ fontSize: 13.5, lineHeight: 1.45, color: BASE.ink }}>{line}</span>
          </div>
        ))}
      </div>

      {/* harmony / clash — archetype name primary, zodiac as secondary hint */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', padding: '16px 22px', borderTop: `1px solid ${BASE.divider}`, position: 'relative' }}>
        <TaggableCol label="SELARAS DENGAN" items={selaras} ink={BASE.ink} muted={BASE.muted} />
        <div style={{ background: BASE.border }} />
        <TaggableCol label="DIUJI OLEH" items={pemicu} ink={BASE.ink} muted={BASE.muted} pad />
      </div>

      {/* footer */}
      <div style={{ padding: '0 22px 18px', fontSize: 10, color: BASE.muted, letterSpacing: 1, position: 'relative' }}>
        katon.app
      </div>
    </div>
  );
}
