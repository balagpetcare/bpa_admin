export default function HeroSliderSkeleton() {
  return (
    <section className="hero-slider-shell hero-slider-shell--loading" aria-label="Loading homepage hero">
      <div className="hero-slider-skeleton container-fluid">
        <div className="hero-slider-skeleton__badge shimmer" />
        <div className="hero-slider-skeleton__title shimmer" />
        <div className="hero-slider-skeleton__body shimmer" />
        <div className="hero-slider-skeleton__actions">
          <div className="hero-slider-skeleton__button shimmer" />
          <div className="hero-slider-skeleton__button hero-slider-skeleton__button--ghost shimmer" />
        </div>
      </div>
    </section>
  )
}
