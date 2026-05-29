import { useState } from 'react'
import BaziCardImage from '@/components/card/BaziCardImage.jsx'
import { exportCardImage } from '@/utils/exportCardImage.jsx'

/* Demo page for the new image-overlay sharecard.
   Two pre-defined 丙 charts:
     - Reyner (fire-dominant)
     - Water-dominant 丙 variant
   Same archetype, only dots + element note change. */

const MATAHARI_BASE = {
  archetypeId:   'matahari',
  elementLabel:  '丙火 · YANG FIRE',
  archetypeName: 'MATAHARI',
  tagline:       'Hadir untuk menerangi, bukan untuk bersinar sendirian.',
  colors: { deep: '#8B3A1A', mid: '#C4622A' },
  kekuatan: 'Masuk ke ruangan dan suasana berubah, bahkan sebelum bicara.',
  bayangan: 'Butuh diakui lebih dari yang mau diakui sendiri.',
  dampak:   'Yang bertemu sering pergi dengan keyakinan yang tidak mereka miliki sebelumnya.',
  harmonis: {
    names: ['Samudra', 'Hujan'],
    note:  'Air memberi kedalaman pada cahaya yang ingin menyebar.',
  },
  konflik: {
    names: ['Gunung', 'Ladang'],
    note:  'Bumi menyerap energi, bisa menguras jika tidak dijaga.',
  },
  templateSrc: '/cards/matahari-template.png',
  /* Matches the current Matahari template (labels + hairlines + rena.io
     footer all baked into the image). Flip to false when the template is
     regenerated with the stripped design. */
  bakedLabels: true,
}

const CHART_REYNER = {
  ...MATAHARI_BASE,
  birthDate: '13 SEP 1989',
  elementBalance: { fire: 35, wood: 20, water: 5, earth: 25, metal: 15 },
  elementNote: 'Didominasi Api · intensitas yang sering melampaui situasi.',
}

const CHART_WATER_DOMINANT = {
  ...MATAHARI_BASE,
  birthDate: '13 SEP 1989',
  elementBalance: { fire: 14, wood: 10, water: 41, earth: 20, metal: 15 },
  elementNote: 'Rendah Api · kehangatan yang lebih terjaga, lebih sulit diakses.',
}

const CHARTS = {
  reyner: CHART_REYNER,
  water:  CHART_WATER_DOMINANT,
}

export default function CardDemo() {
  const [chartKey, setChartKey] = useState('reyner')
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState(null)

  const cardData = CHARTS[chartKey]

  async function handleExport() {
    setExporting(true)
    setError(null)
    try {
      await exportCardImage('bazi-card', `katon-matahari-${chartKey}.png`)
    } catch (err) {
      setError(err?.message || 'Gagal menyimpan gambar.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#18140F',
        color: '#E8DDD2',
        padding: '32px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        fontFamily: 'DM Sans, system-ui, sans-serif',
      }}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <DemoButton
          active={chartKey === 'reyner'}
          onClick={() => setChartKey('reyner')}
        >
          Fire-dominant (Reyner)
        </DemoButton>
        <DemoButton
          active={chartKey === 'water'}
          onClick={() => setChartKey('water')}
        >
          Water-dominant 丙
        </DemoButton>
      </div>

      <div style={{ width: 390, height: 693 }}>
        <BaziCardImage cardData={cardData} id="bazi-card" />
      </div>

      <button
        onClick={handleExport}
        disabled={exporting}
        style={{
          padding: '10px 22px',
          background: exporting ? '#3A3028' : '#C56F50',
          color: '#FBF7F3',
          border: 'none',
          borderRadius: 999,
          fontFamily: 'DM Sans, system-ui, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          letterSpacing: '0.04em',
          cursor: exporting ? 'wait' : 'pointer',
        }}
      >
        {exporting ? 'Menyimpan...' : 'Simpan Kartu'}
      </button>

      {error && (
        <div style={{ color: '#E8A878', fontSize: 13 }}>{error}</div>
      )}

      <div
        style={{
          maxWidth: 520,
          fontSize: 12,
          color: '#A8927E',
          lineHeight: 1.6,
          textAlign: 'center',
          marginTop: 12,
        }}
      >
        Demo page. Toggle charts to confirm only the 15 dots and the italic
        element note change. Template image expected at
        <code style={{ color: '#E8DDD2' }}> /cards/matahari-template.png</code>.
      </div>
    </div>
  )
}

function DemoButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        background: active ? '#3A2820' : 'transparent',
        color: active ? '#FBF7F3' : '#A8927E',
        border: '1px solid #3A2820',
        borderRadius: 999,
        fontFamily: 'DM Sans, system-ui, sans-serif',
        fontWeight: 500,
        fontSize: 12,
        letterSpacing: '0.04em',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}
