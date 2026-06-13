'use client'

import { Card, Badge, Button } from 'react-bootstrap'
import type { HeroSlideWriteDto } from '@/lib/api/hero-slider.api'

interface HeroSlidePreviewCardProps {
  form: HeroSlideWriteDto
}

export default function HeroSlidePreviewCard({ form }: HeroSlidePreviewCardProps) {
  const background = form.mobileImage?.url ?? form.desktopImage?.url ?? null

  return (
    <Card className="shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span className="fw-semibold">Slide Preview</span>
        <Badge bg="primary-subtle" text="primary">{form.mediaType}</Badge>
      </Card.Header>
      <Card.Body>
        <div
          className="rounded overflow-hidden border position-relative bg-dark text-white"
          style={{
            minHeight: 280,
            backgroundImage: background ? `linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.55)), url(${background})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {form.mediaType === 'video' && form.video?.url && (
            <div className="position-absolute top-0 end-0 m-3">
              <Badge bg="danger">Video</Badge>
            </div>
          )}

          <div
            className={`h-100 d-flex p-4 ${
              form.overlayPosition === 'left'
                ? 'justify-content-start text-start'
                : form.overlayPosition === 'center'
                  ? 'justify-content-center text-center'
                  : 'justify-content-end text-end'
            }`}
          >
            <div style={{ maxWidth: 420 }}>
              {form.badgeText && (
                <div className="mb-2">
                  <span className="badge bg-light text-dark">{form.badgeText}</span>
                </div>
              )}
              {form.eyebrow && <div className="small text-uppercase opacity-75 mb-2">{form.eyebrow}</div>}
              <h3 className="mb-2 text-white">{form.headline || 'Hero headline preview'}</h3>
              {form.body && <p className="mb-3">{form.body}</p>}
              <div className="d-flex flex-wrap gap-2">
                {form.ctaType !== 'none' && form.ctaLabel && (
                  <Button variant="light" size="sm">{form.ctaLabel}</Button>
                )}
                {form.secondaryCtaType !== 'none' && form.secondaryCtaLabel && (
                  <Button variant="outline-light" size="sm">{form.secondaryCtaLabel}</Button>
                )}
              </div>
              {form.stats && form.stats.length > 0 && (
                <div className="d-flex gap-3 flex-wrap mt-3">
                  {form.stats.map((stat) => (
                    <div key={stat.id}>
                      <div className="fw-semibold">{stat.value}</div>
                      <div className="small opacity-75">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}
