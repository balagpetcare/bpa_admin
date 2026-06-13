'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import CustomFlatpickr from '@/components/CustomFlatpickr'
import { useApiMutation } from '@/hooks/useApi'
import { heroSliderApi, type HeroSlideWriteDto } from '@/lib/api/hero-slider.api'
import type { HeroSlideListItem } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'
import HeroSlideMediaField from './HeroSlideMediaField'
import HeroSlidePreviewCard from './HeroSlidePreviewCard'

interface HeroSliderFormProps {
  slide?: HeroSlideListItem | null
}

function toInitialForm(slide?: HeroSlideListItem | null): HeroSlideWriteDto {
  return {
    locale: slide?.locale ?? 'en',
    title: slide?.title ?? '',
    badgeText: slide?.badgeText ?? '',
    eyebrow: slide?.eyebrow ?? '',
    headline: slide?.headline ?? '',
    body: slide?.body ?? '',
    campaignTag: slide?.campaignTag ?? '',
    status: slide?.status ?? 'draft',
    isActive: slide?.isActive ?? true,
    mediaType: slide?.mediaType ?? 'image',
    overlayPosition: slide?.overlayPosition ?? 'left',
    ctaType: slide?.ctaType ?? 'none',
    ctaLabel: slide?.ctaLabel ?? '',
    ctaHref: slide?.ctaHref ?? '',
    ctaTarget: slide?.ctaTarget ?? '_self',
    secondaryCtaType: slide?.secondaryCtaType ?? 'none',
    secondaryCtaLabel: slide?.secondaryCtaLabel ?? '',
    secondaryCtaHref: slide?.secondaryCtaHref ?? '',
    secondaryCtaTarget: slide?.secondaryCtaTarget ?? '_self',
    desktopImage: slide?.desktopImage ?? null,
    mobileImage: slide?.mobileImage ?? null,
    video: slide?.video ?? null,
    stats: slide?.stats ?? [],
    countdownLabel: slide?.countdownLabel ?? '',
    countdownTargetAt: slide?.countdownTargetAt ?? null,
    startAt: slide?.startAt ?? null,
    endAt: slide?.endAt ?? null,
    sortOrder: slide?.sortOrder ?? 0,
  }
}

export default function HeroSliderForm({ slide }: HeroSliderFormProps) {
  const router = useRouter()
  const isEdit = !!slide
  const [form, setForm] = useState<HeroSlideWriteDto>(() => toInitialForm(slide))
  const [clientError, setClientError] = useState<string | null>(null)
  const { mutate, loading, error, clearError } = useApiMutation<HeroSlideListItem, HeroSlideWriteDto>()

  const ctaEnabled = form.ctaType !== 'none'
  const secondaryCtaEnabled = form.secondaryCtaType !== 'none'
  const showVideoField = form.mediaType === 'video'
  const stats = form.stats ?? []

  const pageTitle = useMemo(
    () => (isEdit ? `Edit Slide: ${slide?.title}` : 'New Hero Slide'),
    [isEdit, slide?.title],
  )

  const update = <K extends keyof HeroSlideWriteDto>(key: K, value: HeroSlideWriteDto[K]) => {
    clearError()
    setClientError(null)
    setForm((current) => ({ ...current, [key]: value }))
  }

  const applyStatus = (status: HeroSlideWriteDto['status']) => update('status', status)

  const validateBeforeSubmit = () => {
    if (!form.title.trim()) return 'Slide title is required.'
    if (!form.headline.trim()) return 'Headline is required.'
    if (!form.desktopImage) return 'Desktop image is required.'
    if (!form.mobileImage) return 'Mobile image is required.'
    if (showVideoField && !form.video) return 'Video slides require a video file.'
    if (ctaEnabled && !form.ctaLabel?.trim()) return 'CTA label is required when CTA is enabled.'
    if (ctaEnabled && !form.ctaHref?.trim()) return 'CTA target is required when CTA is enabled.'
    if (secondaryCtaEnabled && !form.secondaryCtaLabel?.trim()) return 'Second CTA label is required when second CTA is enabled.'
    if (secondaryCtaEnabled && !form.secondaryCtaHref?.trim()) return 'Second CTA target is required when second CTA is enabled.'
    if (form.startAt && form.endAt && new Date(form.startAt) > new Date(form.endAt)) return 'End date must be after the start date.'
    if (form.countdownTargetAt && !form.countdownLabel?.trim()) return 'Countdown label is required when countdown is enabled.'
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validateBeforeSubmit()
    if (validationError) {
      setClientError(validationError)
      return
    }

    const payload: HeroSlideWriteDto = {
      ...form,
      title: form.title.trim(),
      badgeText: form.badgeText?.trim() || null,
      eyebrow: form.eyebrow?.trim() || null,
      headline: form.headline.trim(),
      body: form.body?.trim() || null,
      campaignTag: form.campaignTag?.trim() || null,
      ctaLabel: form.ctaType === 'none' ? null : form.ctaLabel?.trim() || null,
      ctaHref: form.ctaType === 'none' ? null : form.ctaHref?.trim() || null,
      secondaryCtaLabel: form.secondaryCtaType === 'none' ? null : form.secondaryCtaLabel?.trim() || null,
      secondaryCtaHref: form.secondaryCtaType === 'none' ? null : form.secondaryCtaHref?.trim() || null,
      video: form.mediaType === 'video' ? form.video ?? null : null,
      countdownLabel: form.countdownLabel?.trim() || null,
      stats: stats.filter((item) => item.label.trim() || item.value.trim()),
    }

    const result = await mutate(
      () => isEdit ? heroSliderApi.update(slide!.id, payload) : heroSliderApi.create(payload),
      payload,
    )

    if (result) {
      router.push('/cms/hero-slider')
    }
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title={pageTitle}
        breadcrumbs={[
          { label: 'Content' },
          { label: 'Hero Slider', href: '/cms/hero-slider' },
          { label: isEdit ? 'Edit' : 'Create' },
        ]}
      />

      <Form onSubmit={handleSubmit}>
        <Row className="g-3">
          <Col xl={8}>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Content</h6>
                <div className="d-flex gap-2">
                  <Button type="button" variant="outline-secondary" size="sm" onClick={() => applyStatus('draft')}>
                    Save as Draft
                  </Button>
                  <Button type="button" variant="outline-success" size="sm" onClick={() => applyStatus('published')}>
                    Mark Published
                  </Button>
                  {isEdit && (
                    <Button type="button" variant="outline-dark" size="sm" onClick={() => applyStatus('archived')}>
                      Archive
                    </Button>
                  )}
                </div>
              </Card.Header>
              <Card.Body>
                <ApiErrorAlert error={error as ApiError | null} onDismiss={clearError} />
                {clientError && <Alert variant="danger">{clientError}</Alert>}

                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Slide Title</Form.Label>
                      <Form.Control value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Internal admin label" />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Badge</Form.Label>
                      <Form.Control value={form.badgeText ?? ''} onChange={(e) => update('badgeText', e.target.value)} placeholder="New campaign" />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Locale</Form.Label>
                      <Form.Select value={form.locale} onChange={(e) => update('locale', e.target.value as HeroSlideWriteDto['locale'])}>
                        <option value="en">English</option>
                        <option value="bn">Bangla</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Status</Form.Label>
                      <Form.Select value={form.status} onChange={(e) => update('status', e.target.value as HeroSlideWriteDto['status'])}>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Eyebrow</Form.Label>
                      <Form.Control value={form.eyebrow ?? ''} onChange={(e) => update('eyebrow', e.target.value)} placeholder="Optional small heading" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Campaign Tag</Form.Label>
                      <Form.Control value={form.campaignTag ?? ''} onChange={(e) => update('campaignTag', e.target.value)} placeholder="Vaccination Drive" />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Headline</Form.Label>
                      <Form.Control value={form.headline} onChange={(e) => update('headline', e.target.value)} placeholder="Main homepage message" />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Body Copy</Form.Label>
                      <Form.Control as="textarea" rows={4} value={form.body ?? ''} onChange={(e) => update('body', e.target.value)} placeholder="Optional supporting copy" />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Media Type</Form.Label>
                      <Form.Select value={form.mediaType} onChange={(e) => update('mediaType', e.target.value as HeroSlideWriteDto['mediaType'])}>
                        <option value="image">Image Slide</option>
                        <option value="video">Video Slide</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Overlay Position</Form.Label>
                      <Form.Select value={form.overlayPosition} onChange={(e) => update('overlayPosition', e.target.value as HeroSlideWriteDto['overlayPosition'])}>
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-flex align-items-end">
                    <Form.Check
                      type="switch"
                      id="hero-slide-active"
                      label="Active slide"
                      checked={form.isActive}
                      onChange={(e) => update('isActive', e.target.checked)}
                    />
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Publish Start</Form.Label>
                      <CustomFlatpickr
                        className="form-control"
                        placeholder="Schedule start"
                        value={form.startAt ? new Date(form.startAt) : undefined}
                        options={{ enableTime: true, dateFormat: 'Y-m-d H:i', allowInput: true }}
                        onChange={(dates: Date[]) => update('startAt', dates[0]?.toISOString() ?? null)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Publish End</Form.Label>
                      <CustomFlatpickr
                        className="form-control"
                        placeholder="Schedule end"
                        value={form.endAt ? new Date(form.endAt) : undefined}
                        options={{ enableTime: true, dateFormat: 'Y-m-d H:i', allowInput: true }}
                        onChange={(dates: Date[]) => update('endAt', dates[0]?.toISOString() ?? null)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Countdown Label</Form.Label>
                      <Form.Control
                        value={form.countdownLabel ?? ''}
                        onChange={(e) => update('countdownLabel', e.target.value)}
                        placeholder="Registration closes in"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Countdown Target</Form.Label>
                      <CustomFlatpickr
                        className="form-control"
                        placeholder="Optional countdown target"
                        value={form.countdownTargetAt ? new Date(form.countdownTargetAt) : undefined}
                        options={{ enableTime: true, dateFormat: 'Y-m-d H:i', allowInput: true }}
                        onChange={(dates: Date[]) => update('countdownTargetAt', dates[0]?.toISOString() ?? null)}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <HeroSlideMediaField
                      label="Desktop Image"
                      value={form.desktopImage}
                      onChange={(value) => update('desktopImage', value)}
                      helpText="Recommended for wide desktop hero layouts."
                      mimeTypePrefix="image/"
                    />
                  </Col>
                  <Col md={6}>
                    <HeroSlideMediaField
                      label="Mobile Image"
                      value={form.mobileImage}
                      onChange={(value) => update('mobileImage', value)}
                      helpText="Recommended for portrait and smaller screens."
                      mimeTypePrefix="image/"
                    />
                  </Col>
                  {showVideoField && (
                    <Col md={12}>
                      <HeroSlideMediaField
                        label="Optional Video"
                        value={form.video ?? null}
                        onChange={(value) => update('video', value)}
                        helpText="Video slides still require desktop and mobile fallback images."
                        mimeTypePrefix="video/"
                      />
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>

            <Card className="mt-3">
              <Card.Header>
                <h6 className="mb-0">CTA Configuration</h6>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>CTA Type</Form.Label>
                      <Form.Select value={form.ctaType} onChange={(e) => update('ctaType', e.target.value as HeroSlideWriteDto['ctaType'])}>
                        <option value="none">No CTA</option>
                        <option value="internal">Internal Route</option>
                        <option value="external">External URL</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {ctaEnabled && (
                    <>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>CTA Label</Form.Label>
                          <Form.Control value={form.ctaLabel ?? ''} onChange={(e) => update('ctaLabel', e.target.value)} placeholder="Learn more" />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>CTA Target</Form.Label>
                          <Form.Select value={form.ctaTarget} onChange={(e) => update('ctaTarget', e.target.value as HeroSlideWriteDto['ctaTarget'])}>
                            <option value="_self">Same Tab</option>
                            <option value="_blank">New Tab</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>{form.ctaType === 'internal' ? 'Internal Route' : 'External URL'}</Form.Label>
                          <Form.Control
                            value={form.ctaHref ?? ''}
                            onChange={(e) => update('ctaHref', e.target.value)}
                            placeholder={form.ctaType === 'internal' ? '/campaigns' : 'https://example.com'}
                          />
                        </Form.Group>
                      </Col>
                    </>
                  )}
                </Row>
              </Card.Body>
            </Card>

            <Card className="mt-3">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Secondary CTA</h6>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Second CTA Type</Form.Label>
                      <Form.Select value={form.secondaryCtaType} onChange={(e) => update('secondaryCtaType', e.target.value as HeroSlideWriteDto['secondaryCtaType'])}>
                        <option value="none">No Second CTA</option>
                        <option value="internal">Internal Route</option>
                        <option value="external">External URL</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {secondaryCtaEnabled && (
                    <>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Second CTA Label</Form.Label>
                          <Form.Control value={form.secondaryCtaLabel ?? ''} onChange={(e) => update('secondaryCtaLabel', e.target.value)} placeholder="Volunteer now" />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Second CTA Target</Form.Label>
                          <Form.Select value={form.secondaryCtaTarget} onChange={(e) => update('secondaryCtaTarget', e.target.value as HeroSlideWriteDto['secondaryCtaTarget'])}>
                            <option value="_self">Same Tab</option>
                            <option value="_blank">New Tab</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>{form.secondaryCtaType === 'internal' ? 'Internal Route' : 'External URL'}</Form.Label>
                          <Form.Control
                            value={form.secondaryCtaHref ?? ''}
                            onChange={(e) => update('secondaryCtaHref', e.target.value)}
                            placeholder={form.secondaryCtaType === 'internal' ? '/volunteers' : 'https://example.com'}
                          />
                        </Form.Group>
                      </Col>
                    </>
                  )}
                </Row>
              </Card.Body>
            </Card>

            <Card className="mt-3">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Statistics</h6>
                <Button
                  type="button"
                  size="sm"
                  variant="outline-secondary"
                  disabled={stats.length >= 3}
                  onClick={() => update('stats', [...stats, { id: crypto.randomUUID(), label: '', value: '' }])}
                >
                  Add Stat
                </Button>
              </Card.Header>
              <Card.Body>
                {stats.length === 0 ? (
                  <p className="text-muted mb-0 small">Optional quick stats block shown under the hero copy.</p>
                ) : (
                  <Row className="g-3">
                    {stats.map((stat, index) => (
                      <Col md={12} key={stat.id}>
                        <div className="border rounded p-3">
                          <Row className="g-2 align-items-end">
                            <Col md={5}>
                              <Form.Group>
                                <Form.Label>Label</Form.Label>
                                <Form.Control
                                  value={stat.label}
                                  onChange={(e) => update('stats', stats.map((item) => item.id === stat.id ? { ...item, label: e.target.value } : item))}
                                  placeholder={`Statistic ${index + 1} label`}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={5}>
                              <Form.Group>
                                <Form.Label>Value</Form.Label>
                                <Form.Control
                                  value={stat.value}
                                  onChange={(e) => update('stats', stats.map((item) => item.id === stat.id ? { ...item, value: e.target.value } : item))}
                                  placeholder="25K+"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={2}>
                              <Button
                                type="button"
                                variant="outline-danger"
                                className="w-100"
                                onClick={() => update('stats', stats.filter((item) => item.id !== stat.id))}
                              >
                                Remove
                              </Button>
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card.Body>
            </Card>

            <div className="d-flex gap-2 mt-3">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Saving...' : isEdit ? 'Update Slide' : 'Create Slide'}
              </Button>
              <Link href="/cms/hero-slider" className="btn btn-light">
                Cancel
              </Link>
            </div>
          </Col>

          <Col xl={4}>
            <HeroSlidePreviewCard form={form} />
          </Col>
        </Row>
      </Form>
    </div>
  )
}
