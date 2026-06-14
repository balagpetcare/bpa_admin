import Link from 'next/link'

export default function HeroSliderEmptyState() {
  return (
    <section className="hero-slider-shell hero-slider-empty" aria-label="Homepage hero fallback">
      <div className="hero-slider-empty__backdrop" />
      <div className="container-fluid hero-slider-empty__content">
        <span className="hero-slider-empty__badge">BPA</span>
        <h1 className="hero-slider-empty__title">Community care, campaigns, and public service in one place.</h1>
        <p className="hero-slider-empty__body">
          Hero slides are not published yet, so the homepage is showing a safe fallback instead of an empty banner.
        </p>
        <div className="d-flex flex-wrap gap-2">
          <Link href="/dashboard" className="btn btn-light">Open Dashboard</Link>
          <Link href="/cms/hero-slider" className="btn btn-outline-light">Manage Hero Slides</Link>
        </div>
      </div>
    </section>
  )
}
