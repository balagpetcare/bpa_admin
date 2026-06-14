'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { Button, Card, Col, Form, InputGroup, Row } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { confirmDelete } from '@/components/ui/ConfirmDialog'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { heroSliderApi, type HeroSlideWriteDto } from '@/lib/api/hero-slider.api'
import type { ApiError } from '@/lib/api'
import type { HeroSlideListItem, HeroSlideStatus } from '@/types/bpa.types'
import HeroSliderSortableTable from './HeroSliderSortableTable'

export default function HeroSliderListContent() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<HeroSlideStatus | ''>('')
  const [locale, setLocale] = useState<'en' | 'bn' | ''>('')
  const [localData, setLocalData] = useState<HeroSlideListItem[] | null>(null)
  const { mutate } = useApiMutation<HeroSlideListItem, HeroSlideWriteDto>()

  const fetchFn = useCallback(
    () => heroSliderApi.list({ page, limit: 20, search: search || undefined, status, locale }),
    [page, search, status, locale],
  )

  const { data, loading, error, refetch } = useApi(fetchFn, [page, search, status, locale])
  const fetched = data?.data ?? []
  const slides = localData ?? fetched
  const meta = data?.meta ?? null

  if (fetched && localData && JSON.stringify(fetched.map((item) => item.id)) === JSON.stringify(localData.map((item) => item.id))) {
    setLocalData(null)
  }

  const handleDelete = async (slide: HeroSlideListItem) => {
    const confirmed = await confirmDelete(`hero slide "${slide.title}"`)
    if (!confirmed) return
    await heroSliderApi.remove(slide.id)
    setLocalData(null)
    refetch()
  }

  const handleToggleActive = async (slide: HeroSlideListItem, isActive: boolean) => {
    const dto: HeroSlideWriteDto = {
      locale: slide.locale,
      title: slide.title,
      badgeText: slide.badgeText,
      eyebrow: slide.eyebrow,
      headline: slide.headline,
      body: slide.body,
      campaignTag: slide.campaignTag,
      status: slide.status,
      isActive,
      mediaType: slide.mediaType,
      overlayPosition: slide.overlayPosition,
      ctaType: slide.ctaType,
      ctaLabel: slide.ctaLabel,
      ctaHref: slide.ctaHref,
      ctaTarget: slide.ctaTarget,
      secondaryCtaType: slide.secondaryCtaType,
      secondaryCtaLabel: slide.secondaryCtaLabel,
      secondaryCtaHref: slide.secondaryCtaHref,
      secondaryCtaTarget: slide.secondaryCtaTarget,
      desktopImage: slide.desktopImage,
      mobileImage: slide.mobileImage,
      video: slide.video,
      stats: slide.stats,
      countdownLabel: slide.countdownLabel,
      countdownTargetAt: slide.countdownTargetAt,
      startAt: slide.startAt,
      endAt: slide.endAt,
      sortOrder: slide.sortOrder,
    }

    const result = await mutate(() => heroSliderApi.update(slide.id, dto), dto)
    if (result) refetch()
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Hero Slider Management"
        breadcrumbs={[{ label: 'Content' }, { label: 'Hero Slider' }]}
        action={(
          <Link href="/cms/hero-slider/create" className="btn btn-primary">
            <Icon icon="solar:add-circle-bold" className="me-1" />
            New Slide
          </Link>
        )}
      />

      <ApiErrorAlert error={error as ApiError | null} />

      <Card>
        <Card.Body>
          <Row className="g-2 mb-3">
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text><Icon icon="solar:magnifer-bold" /></InputGroup.Text>
                <Form.Control
                  placeholder="Search slides..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); setLocalData(null) }}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select value={status} onChange={(e) => { setStatus(e.target.value as HeroSlideStatus | ''); setPage(1); setLocalData(null) }}>
                <option value="">All statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select value={locale} onChange={(e) => { setLocale(e.target.value as 'en' | 'bn' | ''); setPage(1); setLocalData(null) }}>
                <option value="">All locales</option>
                <option value="en">English</option>
                <option value="bn">Bangla</option>
              </Form.Select>
            </Col>
          </Row>

          <HeroSliderSortableTable
            data={slides}
            loading={loading}
            onDeleted={handleDelete}
            onToggled={handleToggleActive}
            onReordered={setLocalData}
          />

          {meta && meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                {meta.total} slide{meta.total !== 1 ? 's' : ''} · Page {meta.page} of {meta.totalPages}
              </small>
              <div className="d-flex gap-1">
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasPrev} onClick={() => setPage((p) => p - 1)}>&lsaquo;</Button>
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasNext} onClick={() => setPage((p) => p + 1)}>&rsaquo;</Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
