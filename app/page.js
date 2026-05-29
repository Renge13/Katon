// Placeholder landing for Phase 1. The real state-driven funnel
// (input → anticipation → sharecard → free read → bridge → paywall → unlock)
// is built in Phase 3. This page only confirms the Next.js scaffold runs.

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'system-ui, sans-serif',
        background: '#F6F1E8',
        color: '#2A2520',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div>
        <h1 style={{ letterSpacing: '0.3em', fontWeight: 600 }}>KATON</h1>
        <p style={{ color: '#5A4A3A' }}>
          Refleksi personal dari waktu kelahiranmu.
        </p>
        <p style={{ marginTop: '2rem', fontSize: 12, color: '#B08442' }}>
          Phase 1 scaffold · funnel lands in Phase 3
        </p>
      </div>
    </main>
  );
}
