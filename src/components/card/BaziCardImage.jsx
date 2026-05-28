import './BaziCardImage.css'

/* Image-overlay sharecard.
   The watercolor template PNG (archetype name, KBD/HARMONIS/KONFLIK ghost
   labels, element icons, sun illustration, katon.app footer) is the full-bleed
   background. The code overlays only dynamic copy on top. */

const ELEMENT_DOT_COLORS = {
  fire:  '#C4622A',
  wood:  '#5A8F4E',
  water: '#5A8898',
  earth: '#8A7A5E',
  metal: '#787A82',
}

/* Icon centers measured by pixel-scanning the template image. */
const ELEMENT_DOT_X = {
  fire:  '18.5%',
  wood:  '35.2%',
  water: '51.0%',
  earth: '67.8%',
  metal: '84.1%',
}

const ELEMENT_ORDER = ['fire', 'wood', 'water', 'earth', 'metal']

/* Tiered fill: 0–10 → 0, 11–24 → 1, 25–34 → 2, 35+ → 3 */
function filledCount(pct) {
  if (pct >= 35) return 3
  if (pct >= 25) return 2
  if (pct >= 11) return 1
  return 0
}

function DotGroup({ element, pct }) {
  const color = ELEMENT_DOT_COLORS[element]
  const filled = filledCount(pct)
  return (
    <div
      className="rci-dot-group"
      style={{
        position: 'absolute',
        left: ELEMENT_DOT_X[element],
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="rci-dot"
          style={{
            background: color,
            opacity: i < filled ? 1 : 0.15,
          }}
        />
      ))}
    </div>
  )
}

/* Split "Didominasi Api · intensitas ..." on the first " · ".
   First half gets archetype-mid color; bullet + second half gets muted brown. */
function ElementNoteText({ note, midColor, mutedColor }) {
  const sep = ' · '
  const idx = note.indexOf(sep)
  if (idx === -1) {
    return <span style={{ color: mutedColor }}>{note}</span>
  }
  const head = note.slice(0, idx)
  const tail = note.slice(idx)
  return (
    <>
      <span style={{ color: midColor }}>{head}</span>
      <span style={{ color: mutedColor }}>{tail}</span>
    </>
  )
}

export default function BaziCardImage({ cardData, id = 'bazi-card' }) {
  const {
    elementLabel,
    tagline,
    colors,
    kekuatan,
    bayangan,
    dampak,
    harmonis,
    konflik,
    birthDate,
    elementBalance,
    elementNote,
    templateSrc = '/cards/matahari-template.png',
    bakedLabels = false,
  } = cardData

  return (
    <div
      id={id}
      className="katon-card-image"
    >
      <img
        src={templateSrc}
        alt=""
        className="rci-bg"
        draggable={false}
      />

      <div className="rci-overlay">
        {/* Zone A — top metadata */}
        <div
          className="rci-zone rci-top"
          style={{ top: '3.5%', left: '6%', right: '6%' }}
        >
          <span
            className="rci-element-label"
            style={{ color: colors.mid }}
          >
            {elementLabel}
          </span>
          <span className="rci-birth-date">{birthDate}</span>
        </div>

        {/* Zone B — tagline (sits between MATAHARI bottom ~40% and KEKUATAN ghost ~46%) */}
        <div
          className="rci-zone rci-tagline"
          style={{
            top: '42%',
            left: '6%',
            right: '6%',
            color: colors.deep,
          }}
        >
          {tagline}
        </div>

        {/* Zone C — Section labels (KEKUATAN/BAYANGAN/DAMPAK).
            Rendered in code when the template doesn't bake them in. Positioned
            at the ghost-label y-centers measured against the original Matahari
            template, so they land in the same spots a baked template would. */}
        {!bakedLabels && (
          <>
            <div
              className="rci-zone rci-section-label"
              style={{ top: '46.4%', left: '12%', color: colors.deep }}
            >KEKUATAN</div>
            <div
              className="rci-zone rci-section-label"
              style={{ top: '54.8%', left: '12%', color: colors.deep }}
            >BAYANGAN</div>
            <div
              className="rci-zone rci-section-label"
              style={{ top: '62.1%', left: '12%', color: colors.deep }}
            >DAMPAK</div>
          </>
        )}

        {/* Zone C — KBD body blocks. Body left-edge aligns with ghost label
            at 12%. Tops calibrated to sit ~0.8% below each label's bottom,
            so all three gaps read equal. */}
        <div className="rci-zone rci-kbd-body" style={{ top: '48%', left: '12%', right: '12%' }}>
          {kekuatan}
        </div>
        <div className="rci-zone rci-kbd-body" style={{ top: '55.8%', left: '12%', right: '12%' }}>
          {bayangan}
        </div>
        <div className="rci-zone rci-kbd-body" style={{ top: '63.7%', left: '12%', right: '12%' }}>
          {dampak}
        </div>

        {/* Zone D — element dots */}
        <div
          className="rci-zone rci-dots-row"
          style={{ top: '77%', left: 0, right: 0, height: '12px' }}
        >
          {ELEMENT_ORDER.map((el) => (
            <DotGroup key={el} element={el} pct={elementBalance[el] ?? 0} />
          ))}
        </div>

        {/* Zone E — element note */}
        <div
          className="rci-zone rci-element-note"
          style={{ top: '79.5%', left: '6%', right: '6%' }}
        >
          <ElementNoteText
            note={elementNote}
            midColor={colors.mid}
            mutedColor="#8A7060"
          />
        </div>

        {/* Zone F — HARMONIS / KONFLIK section labels. Code-rendered when
            template doesn't bake them in. Positioned at the ghost label y. */}
        {!bakedLabels && (
          <>
            <div
              className="rci-zone rci-section-label"
              style={{ top: '85.4%', left: '12%', color: colors.deep }}
            >HARMONIS</div>
            <div
              className="rci-zone rci-section-label"
              style={{ top: '85.4%', left: '58%', color: colors.deep }}
            >KONFLIK</div>
          </>
        )}

        {/* Zone F — harmonis column. Left edge 12% matches HARMONIS ghost
            label left-edge measured from template. */}
        <div
          className="rci-zone rci-pair-col"
          style={{ top: '86.5%', left: '12%', width: '38%' }}
        >
          <div
            className="rci-pair-names"
            style={{ color: colors.deep }}
          >
            {harmonis.names.join(' dan ')}
          </div>
          <div className="rci-pair-note">{harmonis.note}</div>
        </div>

        {/* Zone F — konflik column. Left edge 58% matches KONFLIK ghost
            label left-edge measured from template. */}
        <div
          className="rci-zone rci-pair-col"
          style={{ top: '86.5%', left: '58%', width: '36%' }}
        >
          <div
            className="rci-pair-names"
            style={{ color: colors.deep }}
          >
            {konflik.names.join(' dan ')}
          </div>
          <div className="rci-pair-note">{konflik.note}</div>
        </div>

        {/* Zone G — Footer hairlines + brand mark.
            Legacy template (bakedLabels=true): an opaque cream box covers the
            baked "rena.io" pixels and renders "katon.app" on top, while the
            hairlines flanking the footer come from the template image itself.
            Stripped template (bakedLabels=false): brand mark sits over a clean
            paper background, with hairlines code-rendered on either side. */}
        {bakedLabels ? (
          <div className="rci-footer-overlay">katon.app</div>
        ) : (
          <>
            <div
              className="rci-footer-hairline"
              style={{ top: '97.3%', left: '15%', width: '20%', background: colors.deep }}
            />
            <div className="rci-footer-mark" style={{ color: colors.deep }}>katon.app</div>
            <div
              className="rci-footer-hairline"
              style={{ top: '97.3%', right: '15%', width: '20%', background: colors.deep }}
            />
          </>
        )}
      </div>
    </div>
  )
}
