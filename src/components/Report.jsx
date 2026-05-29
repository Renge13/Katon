// ============================================================
// Report — long-form reflective reading (shadcn-style accordion)
// ============================================================
// Renders the report from getReport(chart). Behind a CTA so the
// click itself is the tiny ritual of entering the deeper read.
//
// Inside: a vertical stack of 7 chapter rows (accordion items).
// Single-open behavior — clicking a closed row opens it and
// collapses the currently open one. Bab 1 (Pola Dasar) opens
// by default. Clicking the currently-open row is a no-op so
// the reader always has one chapter visible.
//
// Watercolor canvas styling unified with the site palette.
// ============================================================

import { useMemo, useState, useRef, useEffect } from 'react'
import {
  IconLeaf,
  IconCompass,
  IconUsers,
  IconUser,
  IconHeart,
  IconSun,
  IconLock,
} from '@tabler/icons-react'
import { getReport } from '@/lib/bazi'
import './Report.css'

const BAB_ORDINALS = ['SATU', 'DUA', 'TIGA', 'EMPAT', 'LIMA', 'ENAM', 'TUJUH']

const ELEMENT_LABEL_ID = {
  Wood:  'Kayu',
  Fire:  'Api',
  Earth: 'Bumi',
  Metal: 'Logam',
  Water: 'Air',
}

export default function Report({ chart }) {
  const [expanded, setExpanded] = useState(false)
  const [openBab, setOpenBab] = useState(0)
  const report = useMemo(() => getReport(chart), [chart])

  // Scroll anchoring: on first expand, snap to top of report body so
  // the reader sees the header + entry moment + Bab 1 in natural order.
  // On subsequent chapter clicks, snap to the top of the newly-opened
  // bab so the reader starts at the chapter heading, not mid-content.
  const bodyRef = useRef(null)
  const babRefs = useRef([])
  const isFirstExpand = useRef(true)

  useEffect(() => {
    if (!expanded) {
      isFirstExpand.current = true
      return
    }
    if (isFirstExpand.current) {
      bodyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      isFirstExpand.current = false
    } else {
      babRefs.current[openBab]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [expanded, openBab])

  if (!report?.sections?.length) return null

  const meta = chart?.dayMaster
    ? `${ELEMENT_LABEL_ID[chart.dayMaster.element] || ''} ${chart.dayMaster.polarity || ''}`.trim()
    : ''

  if (!expanded) {
    return (
      <section className="paywall-section" aria-label="Bacaan Mendalam">
        <div className="preview">
          <div className="preview-ornament" aria-hidden="true">✦</div>

          <p className="preview-lead">
            Beberapa pola dalam dirimu tidak selalu terlihat saat dijalani.
          </p>

          <div className="preview-rule" aria-hidden="true">
            <span className="preview-rule-line" />
            <span className="preview-rule-dot" />
            <span className="preview-rule-line" />
          </div>

          <p className="preview-body">
            Di Bacaan Mendalam, kamu akan menemukan bukan hanya siapa dirimu, tapi juga arah yang bisa membantumu melangkah lebih jelas.
          </p>

          <ul className="preview-features">
            <li>
              <span className="preview-feature-icon" aria-hidden="true">
                <IconLeaf size={28} stroke={1.5} />
              </span>
              <div className="preview-feature-text">
                <div className="preview-feature-title">Pahami Polamu</div>
                <div className="preview-feature-desc">
                  Memahami cara kamu bekerja, mencintai, dan mengambil keputusan.
                </div>
              </div>
            </li>
            <li>
              <span className="preview-feature-icon" aria-hidden="true">
                <IconCompass size={28} stroke={1.5} />
              </span>
              <div className="preview-feature-text">
                <div className="preview-feature-title">Dapatkan Arah</div>
                <div className="preview-feature-desc">
                  Panduan karier, keuangan, dan kehidupan yang selaras dengan energimu.
                </div>
              </div>
            </li>
            <li>
              <span className="preview-feature-icon" aria-hidden="true">
                <IconUsers size={28} stroke={1.5} />
              </span>
              <div className="preview-feature-text">
                <div className="preview-feature-title">Hubungan yang Selaras</div>
                <div className="preview-feature-desc">
                  Pahami tipe yang paling mendukung dan cara menjaga hubunganmu.
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div className="paywall">
          <div className="paywall-label">
            <IconLock size={14} stroke={2} className="paywall-label-icon" />
            <span>BACAAN MENDALAM</span>
          </div>

          <p className="paywall-headline">
            Panduan personal untuk memahami dirimu dan melangkah dengan lebih tepat.
          </p>

          <ul className="paywall-features">
            <li>
              <IconUser size={22} stroke={1.5} />
              <span>Refleksi Diri</span>
            </li>
            <li>
              <IconCompass size={22} stroke={1.5} />
              <span>Arah Karier &amp; Rezeki</span>
            </li>
            <li>
              <IconHeart size={22} stroke={1.5} />
              <span>Relasi &amp; Kecocokan</span>
            </li>
            <li>
              <IconLeaf size={22} stroke={1.5} />
              <span>Keseimbangan Energi</span>
            </li>
            <li>
              <IconSun size={22} stroke={1.5} />
              <span>Langkah Praktis</span>
            </li>
          </ul>

          <div className="paywall-rule" aria-hidden="true">
            <span className="paywall-rule-line" />
            <span className="paywall-rule-dot">✦</span>
            <span className="paywall-rule-line" />
          </div>

          <div className="paywall-price">Rp79.000</div>

          <button
            className="paywall-cta"
            type="button"
            onClick={() => { setExpanded(true); setOpenBab(0) }}
          >
            Buka Refleksiku
          </button>

          <div className="paywall-fineprint">
            <IconLock size={12} stroke={2} className="paywall-fineprint-icon" />
            <span>Sekali baca. Milikmu selamanya.</span>
          </div>
        </div>
      </section>
    )
  }

  return (
    <article className="report-body" ref={bodyRef}>

      <header className="report-header">
        <div className="report-eyebrow">BACAAN MENDALAM · {report.chinese}</div>
        <h2 className="report-archetype">{report.archetype}</h2>
        {meta && <div className="report-meta">{meta}</div>}
      </header>

      <p className="report-entry">
        Sampai di sini, kamu sudah mengenal siapa dirimu. Bagian ini berbeda:
        bukan lagi tentang sifat, tapi tentang bentuk hidup yang sering muncul
        karena sifat itu. Bagaimana pola yang sama terus terbentuk di hubungan,
        di pekerjaan, di rezeki, di tubuhmu. Bukan ramalan, bukan saran.
        Untuk dilihat, supaya yang tidak terlihat berhenti menggerakkanmu diam-diam.
      </p>

      <div className="report-accordion">
        {report.sections.map((section, i) => {
          const isOpen = i === openBab
          const ordinal = BAB_ORDINALS[i] || String(i + 1)
          return (
            <div
              key={section.sectionKey}
              className={`bab-item${isOpen ? ' bab-item--open' : ''}`}
              ref={(el) => { babRefs.current[i] = el }}
            >
              <button
                type="button"
                className="bab-row"
                aria-expanded={isOpen}
                aria-controls={`bab-panel-${i}`}
                onClick={isOpen ? undefined : () => setOpenBab(i)}
                disabled={isOpen}
              >
                <span className="bab-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="bab-title">{section.title}</span>
                <span className="bab-chevron" aria-hidden="true">▾</span>
              </button>

              {isOpen && (
                <div className="bab-panel" id={`bab-panel-${i}`} role="region">
                  <div className="bab-panel-meta">BAB {ordinal}</div>
                  {section.paragraphs.map((p, j) => (
                    <p
                      key={j}
                      className={`report-paragraph${j === 0 ? ' report-paragraph--first' : ''}`}
                    >
                      {p}
                    </p>
                  ))}
                  {section.deepInsight && (() => {
                    // When the chapter has no Refleksi narrative above
                    // (paragraphs empty), the deepInsight IS the chapter's
                    // primary content. Style the pola as the chapter's
                    // opening paragraph (with drop cap) and skip the
                    // "Wawasan lebih dalam" divider — there's nothing
                    // shallower to be "deeper than".
                    const isPrimary = section.paragraphs.length === 0
                    const paraClass = isPrimary
                      ? 'report-paragraph'
                      : 'deep-insight-para'
                    return (
                    <div className={`deep-insight${isPrimary ? ' deep-insight--primary' : ''}`}>
                      {!isPrimary && (
                        <>
                          <div className="deep-insight-rule" aria-hidden="true">
                            <span className="deep-insight-rule-line" />
                            <span className="deep-insight-rule-dot">✦</span>
                            <span className="deep-insight-rule-line" />
                          </div>
                          <div className="deep-insight-label">Wawasan lebih dalam</div>
                        </>
                      )}

                      <p className={isPrimary ? `${paraClass} report-paragraph--first` : paraClass}>{section.deepInsight.pola}</p>
                      <p className={paraClass}>{section.deepInsight.simpul}</p>

                      <h4 className="deep-insight-h">Bentuk hidup yang sering terbentuk</h4>
                      <ul className="deep-insight-list">
                        {section.deepInsight.bentukHidup.map((b, k) => (
                          <li key={k}>{b}</li>
                        ))}
                      </ul>

                      <h4 className="deep-insight-h">Saat pola ini mulai mengurasmu</h4>
                      <ul className="deep-insight-list">
                        {section.deepInsight.saatMenguras.map((b, k) => (
                          <li key={k}>{b}</li>
                        ))}
                      </ul>

                      <div className="deep-insight-stabilkan">
                        <h4 className="deep-insight-h">Yang sering membuat pola ini lebih stabil</h4>
                        <ul className="deep-insight-list">
                          {section.deepInsight.yangStabilkan.map((b, k) => (
                            <li key={k}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    )
                  })()}
                  {section.reflectionPrompt && (
                    <p className="report-prompt">{section.reflectionPrompt}</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        className="report-collapse-btn"
        type="button"
        onClick={() => setExpanded(false)}
      >
        Tutup Bacaan
      </button>
    </article>
  )
}
