'use client'

import React from 'react'
import { Card, Alert, Row, Col, Button } from 'react-bootstrap'
import { useWizardContext } from '../useCampaignWizard'
import MediaPreview from '@/components/ui/MediaPreview'
import { Icon } from '@iconify/react'
import { getPublishIssues } from '../campaign-workflow'

export default function CampaignReviewStep() {
  const {
    form: { getValues },
    isEdit,
    campaign,
    goToStep,
  } = useWizardContext()
  const values = getValues()
  const issues = getPublishIssues(values, campaign, new Date(), values.status, undefined)
  const warnings = issues.filter((item) => item.severity === 'warning')
  const blockers = issues.filter((item) => item.severity === 'error')

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Review & Publish</h5>
      </Card.Header>
      <Card.Body>
        <Alert variant="info">
          Please review the campaign details before completing the setup.
          {values.status === 'published' && ' This campaign will be immediately visible to the public.'}
        </Alert>

        <Alert variant={blockers.length ? 'danger' : warnings.length ? 'warning' : 'success'} className="small">
          <div className="fw-semibold mb-1">
            {blockers.length ? `${blockers.length} blocker(s)` : 'Ready for publish review'}
            {warnings.length ? `, ${warnings.length} warning(s)` : ''}
          </div>
          <ul className="mb-0 ps-3">
            {issues.slice(0, 4).map((item) => {
              const isPlanIssue = item.message.toLowerCase().includes('plan')
              return (
                <li key={item.message}>
                  {item.message}
                  {isPlanIssue && (
                    <Button
                      variant="link"
                      className="p-0 ms-2 text-decoration-none align-baseline"
                      style={{ fontSize: 'inherit' }}
                      onClick={() => goToStep('plans')}>
                      Fix in Plans step
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        </Alert>

        <Row className="mb-4 g-4">
          <Col md={6}>
            <h6 className="fw-bold border-bottom pb-2">Campaign Identity</h6>
            <div className="d-flex flex-column gap-1">
              <div>
                <strong>Slug:</strong> {values.slug || '-'}
              </div>
              <div>
                <strong>Title (EN):</strong> {values.titleEn || '-'}
              </div>
              <div>
                <strong>Title (BN):</strong> {values.titleBn || '-'}
              </div>
              <div>
                <strong>Status:</strong> <span className="badge bg-secondary">{values.status}</span>
              </div>
            </div>
          </Col>

          <Col md={6}>
            <h6 className="fw-bold border-bottom pb-2">Schedule</h6>
            <div className="d-flex flex-column gap-1">
              <div>
                <strong>Offer Starts:</strong> {values.offerStartAt ? new Date(values.offerStartAt).toLocaleString() : '-'}
              </div>
              <div>
                <strong>Offer Ends:</strong> {values.offerEndAt ? new Date(values.offerEndAt).toLocaleString() : '-'}
              </div>
              <div>
                <strong>App Starts:</strong> {values.applicationStartAt ? new Date(values.applicationStartAt).toLocaleString() : '-'}
              </div>
              <div>
                <strong>App Ends:</strong> {values.applicationEndAt ? new Date(values.applicationEndAt).toLocaleString() : '-'}
              </div>
            </div>
          </Col>

          <Col md={6}>
            <h6 className="fw-bold border-bottom pb-2">Support Info</h6>
            <div className="d-flex flex-column gap-1">
              <div>
                <Icon icon="solar:phone-bold" className="me-2 text-muted" />
                {values.supportPhone || '-'}
              </div>
              <div>
                <Icon icon="solar:letter-bold" className="me-2 text-muted" />
                {values.supportEmail || '-'}
              </div>
              <div>
                <Icon icon="bi:whatsapp" className="me-2 text-muted" />
                {values.supportWhatsapp || '-'}
              </div>
              <div>
                <Icon icon="solar:map-point-bold" className="me-2 text-muted" />
                {values.supportAddress || '-'}
              </div>
            </div>
          </Col>

          <Col md={12}>
            <h6 className="fw-bold border-bottom pb-2">Media Details</h6>
            <div className="d-flex flex-wrap gap-3">
              {values.heroImageUrl && (
                <div style={{ width: 120 }}>
                  <MediaPreview media={{ url: values.heroImageUrl, mimeType: 'image/jpeg' }} alt="Hero" className="rounded border w-100" />
                  <div className="text-center small mt-1 text-muted">Hero</div>
                </div>
              )}
              {values.mobileImageUrl && (
                <div style={{ width: 80 }}>
                  <MediaPreview media={{ url: values.mobileImageUrl, mimeType: 'image/jpeg' }} alt="Mobile" className="rounded border w-100" />
                  <div className="text-center small mt-1 text-muted">Mobile</div>
                </div>
              )}
              {values.thumbnailUrl && (
                <div style={{ width: 80 }}>
                  <MediaPreview media={{ url: values.thumbnailUrl, mimeType: 'image/jpeg' }} alt="Thumbnail" className="rounded border w-100" />
                  <div className="text-center small mt-1 text-muted">Thumbnail</div>
                </div>
              )}
              {!values.heroImageUrl && !values.mobileImageUrl && !values.thumbnailUrl && <div className="text-muted">No media provided.</div>}
            </div>
          </Col>
        </Row>

        {isEdit && (
          <Alert variant="success" className="mb-0">
            Once saved, you can add Plans, Benefits, Media, and Documents from the bottom sections.
          </Alert>
        )}
        {!isEdit && (
          <Alert variant="warning" className="mb-0">
            After completing this wizard, you will be redirected to the edit view where you can add Plans, Benefits, Media, and Documents.
          </Alert>
        )}
      </Card.Body>
    </Card>
  )
}
