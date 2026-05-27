// ============================================================
// Navbar — minimal KATON top nav (Home + Methodology stub)
// ============================================================
// Methodology has no route yet; the link is a visual placeholder
// that hints "coming soon" via reduced opacity. Implement the
// page when content is ready.
// ============================================================

export default function Navbar() {
  return (
    <nav className="navbar" aria-label="Primary">
      <a className="nav-link nav-link--active" href="#" aria-current="page">
        Home
      </a>
      <span
        className="nav-link nav-link--disabled"
        role="link"
        aria-disabled="true"
        title="Coming soon"
      >
        Methodology
      </span>
    </nav>
  )
}
