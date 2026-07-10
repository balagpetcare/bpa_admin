'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import { A11y, Autoplay, Keyboard, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { HeroSlideListItem } from '@/types/bpa.types'
import { resolveMediaUrl } from '@/lib/utils/media-url'
import HeroCountdown from './HeroCountdown'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface HeroSliderClientProps {
  slides: HeroSlideListItem[]
}

function SlideAction({
  href,
  label,
  target,
  variant,
}: {
  href: string | null
  label: string | null
  target: '_self' | '_blank'
  variant: 'primary' | 'secondary'
}) {
  if (!href || !label) return null

  const className = variant === 'primary' ? 'hero-slide__cta hero-slide__cta--primary' : 'hero-slide__cta hero-slide__cta--secondary'

  if (href.startsWith('/')) {
    return <Link href={href} className={className}>{label}</Link>
  }

  return (
    <a href={href} className={className} target={target} rel={target === '_blank' ? 'noreferrer' : undefined}>
      {label}
    </a>
  )
}

function SlideMedia({ slide, priority }: { slide: HeroSlideListItem; priority: boolean }) {
  const mobileImageUrl = resolveMediaUrl(slide.mobileImage?.url)
  const desktopImageUrl = resolveMediaUrl(slide.desktopImage?.url)
  const videoUrl = resolveMediaUrl(slide.video?.url)

  return (
    <div className="hero-slide__media-layer" aria-hidden="true">
      <picture>
        <source media="(max-width: 767px)" srcSet={mobileImageUrl ?? desktopImageUrl ?? undefined} />
        {slide.mediaType === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={desktopImageUrl ?? mobileImageUrl ?? ''}
            alt={slide.desktopImage?.altText ?? slide.mobileImage?.altText ?? slide.headline}
            className="hero-slide__image"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
          />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={desktopImageUrl ?? mobileImageUrl ?? ''}
              alt={slide.desktopImage?.altText ?? slide.mobileImage?.altText ?? slide.headline}
              className="hero-slide__image hero-slide__image--fallback"
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding="async"
            />
            {videoUrl && (
              <video
                className="hero-slide__video"
                autoPlay
                muted
                loop
                playsInline
                preload={priority ? 'metadata' : 'none'}
                poster={desktopImageUrl ?? mobileImageUrl ?? undefined}
              >
                <source src={videoUrl} type={slide.video?.mimeType} />
              </video>
            )}
          </>
        )}
      </picture>
      <div className="hero-slide__scrim" />
    </div>
  )
}

export default function HeroSliderClient({ slides }: HeroSliderClientProps) {
  const navId = useId().replace(/:/g, '')
  const prevClass = `hero-slider-prev-${navId}`
  const nextClass = `hero-slider-next-${navId}`
  const paginationClass = `hero-slider-pagination-${navId}`
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section className="hero-slider-shell" aria-label="Featured homepage content">
      <Swiper
        className="hero-slider"
        modules={[A11y, Autoplay, Keyboard, Navigation, Pagination]}
        loop={slides.length > 1}
        autoplay={slides.length > 1 ? { delay: 6500, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
        keyboard={{ enabled: true }}
        navigation={{ prevEl: `.${prevClass}`, nextEl: `.${nextClass}` }}
        pagination={{ el: `.${paginationClass}`, clickable: true }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        a11y={{
          enabled: true,
          prevSlideMessage: 'Previous hero slide',
          nextSlideMessage: 'Next hero slide',
          paginationBulletMessage: 'Go to hero slide {{index}}',
        }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <article className={`hero-slide hero-slide--${slide.overlayPosition}`}>
              <SlideMedia slide={slide} priority={index === 0} />
              <div className="container-fluid hero-slide__content">
                <div className="hero-slide__copy">
                  <div className="hero-slide__meta">
                    {slide.badgeText && <span className="hero-slide__badge">{slide.badgeText}</span>}
                    {slide.campaignTag && <span className="hero-slide__tag">{slide.campaignTag}</span>}
                  </div>
                  {slide.eyebrow && <p className="hero-slide__eyebrow">{slide.eyebrow}</p>}
                  {index === 0 ? (
                    <h1 className="hero-slide__headline">{slide.headline}</h1>
                  ) : (
                    <h2 className="hero-slide__headline">{slide.headline}</h2>
                  )}
                  {slide.body && <p className="hero-slide__subheadline">{slide.body}</p>}

                  {(slide.ctaType !== 'none' || slide.secondaryCtaType !== 'none') && (
                    <div className="hero-slide__actions">
                      <SlideAction href={slide.ctaHref} label={slide.ctaLabel} target={slide.ctaTarget} variant="primary" />
                      <SlideAction href={slide.secondaryCtaHref} label={slide.secondaryCtaLabel} target={slide.secondaryCtaTarget} variant="secondary" />
                    </div>
                  )}

                  {slide.stats.length > 0 && (
                    <div className="hero-slide__stats" aria-label="Key statistics">
                      {slide.stats.map((stat) => (
                        <div className="hero-slide__stat" key={stat.id}>
                          <strong>{stat.value}</strong>
                          <span>{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {slide.countdownLabel && slide.countdownTargetAt && (
                    <HeroCountdown label={slide.countdownLabel} targetAt={slide.countdownTargetAt} />
                  )}
                </div>
              </div>
            </article>
          </SwiperSlide>
        ))}

        {slides.length > 1 && (
          <>
            <button className={`hero-slider__nav hero-slider__nav--prev ${prevClass}`} type="button" aria-label="Previous slide">
              <span aria-hidden="true">‹</span>
            </button>
            <button className={`hero-slider__nav hero-slider__nav--next ${nextClass}`} type="button" aria-label="Next slide">
              <span aria-hidden="true">›</span>
            </button>
            <div className={`hero-slider__pagination ${paginationClass}`} aria-label="Hero slider pagination" />
          </>
        )}

        <div className="hero-slider__status" aria-live="polite">
          Slide {activeIndex + 1} of {slides.length}
        </div>
      </Swiper>
    </section>
  )
}
