'use client';
import { elColor, alpha } from './kit.jsx';
// Sharecard — 9:16 "sanctuary" poster rendered from state-keyed free content.
// Inline styles only (no CSS classes) so html-to-image exports reliably.
// Display 360×640; exportCard scales ×3 to 1080×1920.
//
// Per-archetype distinction (so 10 archetypes never collapse into one frame):
//   1. Element pigment family (5)  — dark tinted canvas + glow, from the chart element.
//   2. Unique stem glyph (10)      — the Day Master character as a giant watermark.
//   3. Polarity (Yin/Yang)         — splits the two same-element archetypes: glyph
//                                     placement + bloom character + a Yang top accent.
//   4. Per-archetype copy          — name, modifier, dimension, feed/drain.

const YANG = new Set(['甲', '丙', '戊', '庚', '壬']); // else Yin

const SERIF = 'var(--font-spectral), Georgia, "Times New Roman", serif';
const SANS = 'var(--font-hanken), system-ui, -apple-system, sans-serif';
const LIGHT = '#EFE7D8';
const SOFT = 'rgba(239,231,216,0.66)';

const ID_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const mi = parseInt(m, 10) - 1;
  return mi >= 0 && mi < 12 ? `${parseInt(d, 10)} ${ID_MONTHS[mi]} ${y}` : iso;
}

// Element-based feed/drain column: archetype NAMES (the share hook — "which are you?").
function FeedDrainCol({ label, names, glow, pad }) {
  const list = names && names.length ? names : null;
  return (
    <div style={{ paddingLeft: pad ? 14 : 0 }}>
      <div style={{ fontFamily: SANS, fontSize: 9, letterSpacing: 1.4, color: alpha(glow, 0.85), fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      {list ? list.map((name, i) => (
        <div key={i} style={{ fontFamily: SERIF, fontSize: 14, color: LIGHT, lineHeight: 1.35 }}>{name}</div>
      )) : <div style={{ fontFamily: SERIF, fontSize: 14, color: LIGHT }}>—</div>}
    </div>
  );
}

export default function Sharecard({ data, birthDate, id = 'sharecard' }) {
  if (!data) return null;
  const el = elColor(data.dayMasterElement);
  const card = data.card || {};
  const stem = data.dayMasterChinese || '';
  const isYang = YANG.has(stem);
  const polarity = isYang ? 'Yang' : 'Yin';

  return (
    <div
      id={id}
      style={{
        width: 360, height: 640, position: 'relative', overflow: 'hidden',
        borderRadius: 22, background: el.bg, color: LIGHT,
        boxShadow: `inset 0 0 0 1px ${alpha(el.glow, 0.18)}`,
        fontFamily: SANS, display: 'flex', flexDirection: 'column',
      }}
    >
      {/* giant Day Master glyph — unique per archetype; placement varies by polarity */}
      <div style={{
        position: 'absolute', fontFamily: SERIF, fontSize: 300, lineHeight: 0.8,
        color: alpha(el.glow, isYang ? 0.22 : 0.16), pointerEvents: 'none', userSelect: 'none',
        ...(isYang
          ? { top: 34, right: -26, transform: 'none' }
          : { bottom: 64, left: -30, transform: 'rotate(-8deg)' }),
      }}>{stem}</div>

      {/* watercolor bloom — tight top-right for Yang, diffuse lower-left for Yin */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: isYang
          ? `radial-gradient(60% 42% at 80% 10%, ${alpha(el.glow, 0.16)}, transparent 55%)`
          : `radial-gradient(88% 62% at 20% 90%, ${alpha(el.glow, 0.15)}, transparent 62%)`,
      }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(60% 40% at 24% 8%, rgba(255,255,255,0.05), transparent 55%)' }} />

      {/* header — date omitted entirely when birthDate is absent (e.g. re-access via
          /r/[token], where raw birth data never leaves the server); KATON stays right. */}
      <div style={{ display: 'flex', justifyContent: birthDate ? 'space-between' : 'flex-end', padding: '20px 24px 0', fontSize: 10, color: SOFT, position: 'relative', letterSpacing: 0.5 }}>
        {birthDate && <span>{fmtDate(birthDate)}</span>}
        <span style={{ letterSpacing: 2.4 }}>KATON · 八字</span>
      </div>

      {/* Yang gets a quiet top accent line; Yin does not (a calmer, softer frame) */}
      {isYang && <div style={{ position: 'relative', height: 1, margin: '16px 24px 0', background: `linear-gradient(90deg, ${alpha(el.glow, 0.5)}, transparent)` }} />}

      {/* identity */}
      <div style={{ padding: isYang ? '20px 24px 0' : '26px 24px 0', position: 'relative' }}>
        <div style={{ fontSize: 10, letterSpacing: 2.6, textTransform: 'uppercase', color: alpha(el.glow, 0.95), fontWeight: 600 }}>Persona</div>
        <div style={{ fontFamily: SERIF, fontSize: 46, letterSpacing: 1, color: '#FBF6EE', lineHeight: 1, marginTop: 12, textTransform: 'uppercase' }}>
          {data.archetypeName}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 13, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: SOFT }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: el.glow }} />
          {el.label} · {polarity} · {stem}
        </div>
        {card.modifier && (
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 19, color: alpha(el.glow, 0.95), marginTop: 14, lineHeight: 1.25 }}>
            {card.modifier}
          </div>
        )}
      </div>

      {/* dimension — the literary line */}
      <div style={{ padding: '20px 24px 0', position: 'relative', flex: 1 }}>
        <p style={{ fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.55, color: 'rgba(239,231,216,0.92)', margin: 0 }}>{card.dimension}</p>
      </div>

      {/* feed / drain — element-based, archetype names primary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', padding: '16px 24px', borderTop: `1px solid ${alpha(el.glow, 0.22)}`, position: 'relative' }}>
        <FeedDrainCol label="Yang menenangkan" names={card.feed} glow={el.glow} />
        <div style={{ background: alpha(el.glow, 0.22) }} />
        <FeedDrainCol label="Yang melelahkan" names={card.drain} glow={el.glow} pad />
      </div>

      {/* footer */}
      <div style={{ padding: '0 24px 20px', fontSize: 10, color: SOFT, letterSpacing: 1.4, position: 'relative' }}>
        katon.app
      </div>
    </div>
  );
}
