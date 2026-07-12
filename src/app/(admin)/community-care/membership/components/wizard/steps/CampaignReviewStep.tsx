'use client'

import React from 'react'
import { Card, Alert } from 'react-bootstrap'
import { useWizardContext } from '../useCampaignWizard'

export default function CampaignReviewStep() {
  const { form: { getValues }, isEdit } = useWizardContext()
  const values = getValues()

  return (
    <Card>
      <Card.Header><h5 className="mb-0">Review & Publish</h5></Card.Header>
      <Card.Body>
        <Alert variant="info">
          Please review the campaign details before completing the setup. 
          {values.status === 'published' && ' This campaign will be immediately visible to the public.'}
        </Alert>

        <div className="mb-4">
          <h6 className="fw-bold">Campaign Identity</h6>
          <div className="d-flex flex-column gap-1">
            <div><strong>Slug:</strong> {values.slug || '-'}</div>
            <div><strong>Title (EN):</strong> {values.titleEn || '-'}</div>
            <div><strong>Title (BN):</strong> {values.titleBn || '-'}</div>
            <div><strong>Status:</strong> <span className="badge bg-secondary">{values.status}</span></div>
          </div>
        </div>

        <div className="mb-4">
          <h6 className="fw-bold">Schedule</h6>
          <div className="d-flex flex-column gap-1">
            <div><strong>Offer Starts:</strong> {values.offerStartAt ? new Date(values.offerStartAt).toLocaleString() : '-'}</div>
            <div><strong>Offer Ends:</strong> {values.offerEndAt ? new Date(values.offerEndAt).toLocaleString() : '-'}</div>
          </div>
        </div>

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
