'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Card, Row, Col, Button, Form } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import CensusStatusBadge from './CensusStatusBadge'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { petCensusApi } from '@/lib/api/pet-census.api'
import type { ApiError } from '@/lib/api'
import type { PetCensusStatus } from '@/types/bpa.types'

const STATUS_OPTIONS: PetCensusStatus[] = ['new', 'contacted', 'converted', 'archived']

function labelStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <>
      <dt className="col-sm-4">{label}</dt>
      <dd className="col-sm-8">{value || '-'}</dd>
    </>
  )
}

export default function PetCensusDetailContent({ id }: { id: string }) {
  const router = useRouter()
  const { can } = usePermission()
  const { mutate, loading: mutating } = useApiMutation<unknown, unknown>()
  const [adminNote, setAdminNote] = useState('')

  const fetchFn = useCallback(() => petCensusApi.getById(id), [id])
  const { data: s, loading, error, refetch } = useApi(fetchFn, [id])

  useEffect(() => {
    if (s) setAdminNote(s.adminNote ?? '')
  }, [s])

  async function handleStatusChange(newStatus: PetCensusStatus) {
    await mutate(() => petCensusApi.updateStatus(id, newStatus), undefined)
    refetch()
  }

  async function handleNoteSave() {
    await mutate(() => petCensusApi.update(id, { adminNote }), undefined)
    refetch()
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Census Submission"
        breadcrumbs={[{ label: 'Community Care Fund' }, { label: 'Pet Census', href: '/community-care/pet-census' }, { label: 'Detail' }]}
        action={
          <Button variant="outline-secondary" size="sm" onClick={() => router.push('/community-care/pet-census')}>
            <Icon icon="solar:arrow-left-bold" className="me-1" />Back
          </Button>
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <LoadingOverlay loading={loading}>
        {s && (
          <Row className="g-3">
            <Col lg={6}>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">Owner Info</span>
                  <CensusStatusBadge status={s.status} />
                </Card.Header>
                <Card.Body>
                  <dl className="row mb-0">
                    <InfoRow label="Name" value={s.ownerName} />
                    <InfoRow label="Mobile" value={<a href={`tel:${s.ownerMobile}`}>{s.ownerMobile}</a>} />
                    <InfoRow label="Email" value={s.ownerEmail ? <a href={`mailto:${s.ownerEmail}`}>{s.ownerEmail}</a> : null} />
                    <InfoRow label="Address" value={s.ownerAddress} />
                    <InfoRow label="Zone / Area" value={s.zone?.name ?? s.areaText} />
                    <InfoRow label="Submitted" value={new Date(s.submittedAt).toLocaleString()} />
                    <InfoRow label="Source" value={s.source || s.sourceRoute} />
                  </dl>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <Card.Header className="fw-semibold">Pet Census Data</Card.Header>
                <Card.Body>
                  <dl className="row mb-3">
                    <InfoRow label="Pet Type" value={s.petType ?? 'Legacy count submission'} />
                    <InfoRow label="Pet Count" value={s.petCount || (s.petCountDog + s.petCountCat + s.petCountOther)} />
                    <InfoRow label="Breed" value={s.breed} />
                    <InfoRow label="Legacy Counts" value={`Dogs ${s.petCountDog}, Cats ${s.petCountCat}, Other ${s.petCountOther}`} />
                    <InfoRow label="Consent" value={s.hasConsented ? 'Yes' : 'No'} />
                  </dl>
                  <div className="d-flex flex-wrap gap-2">
                    {s.isCarePartnerInterested && <span className="badge bg-primary-subtle text-primary p-2">Care Partner</span>}
                    {s.isVaccinationInterested && <span className="badge bg-info-subtle text-info p-2">Vaccination</span>}
                    {s.isClinicInterested && <span className="badge bg-success-subtle text-success p-2">Clinic Planning</span>}
                    {s.isPetShopInterested && <span className="badge bg-warning-subtle text-warning p-2">Pet Shop Planning</span>}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <Card.Header className="fw-semibold">Notes</Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <div className="text-muted small mb-1">Public Notes</div>
                    <div className="border rounded p-3 bg-light" style={{ whiteSpace: 'pre-wrap' }}>
                      {s.notes || 'No public notes provided.'}
                    </div>
                  </div>
                  {can('pet_census:update') && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Admin Note</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          placeholder="Internal note for BPA follow-up"
                        />
                      </Form.Group>
                      <Button size="sm" disabled={mutating} onClick={handleNoteSave}>
                        <Icon icon="solar:diskette-bold" className="me-1" />Save Note
                      </Button>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <Card.Header className="fw-semibold">Request Metadata</Card.Header>
                <Card.Body>
                  <dl className="row mb-0">
                    <InfoRow label="IP Address" value={s.ipAddress} />
                    <InfoRow label="User Agent" value={<span style={{ wordBreak: 'break-word' }}>{s.userAgent ?? '-'}</span>} />
                    <InfoRow label="Updated" value={new Date(s.updatedAt).toLocaleString()} />
                  </dl>
                </Card.Body>
              </Card>
            </Col>

            {can('pet_census:update') && (
              <Col lg={12}>
                <Card>
                  <Card.Header className="fw-semibold">Update Status</Card.Header>
                  <Card.Body>
                    <div className="d-flex gap-2 flex-wrap">
                      {STATUS_OPTIONS.map((st) => (
                        <Button
                          key={st}
                          variant={s.status === st ? 'primary' : 'outline-secondary'}
                          size="sm"
                          disabled={mutating}
                          onClick={() => handleStatusChange(st)}
                        >
                          {labelStatus(st)}
                        </Button>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        )}
      </LoadingOverlay>
    </div>
  )
}
