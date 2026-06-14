'use client'

import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { Alert, Card, Row, Col, Button, Form } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import CensusStatusBadge from './CensusStatusBadge'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { isUuid } from '@/lib/uuid'
import { petCensusApi } from '@/lib/api/pet-census.api'
import { ApiError } from '@/lib/api'
import type { PetCensusStatus, PetCensusVaccinationStatus } from '@/types/bpa.types'

const STATUS_OPTIONS: PetCensusStatus[] = ['new', 'contacted', 'converted', 'duplicate', 'archived']

function labelStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function labelVaccinationStatus(status: PetCensusVaccinationStatus | null) {
  switch (status) {
    case 'up_to_date':
      return 'Up to date'
    case 'not_vaccinated':
      return 'Not vaccinated'
    case 'due':
      return 'Due'
    case 'unknown':
      return 'Unknown'
    default:
      return '-'
  }
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
  const [adminNoteOverride, setAdminNoteOverride] = useState<string | null>(null)
  const normalizedId = id.trim()
  const invalidIdError = !normalizedId
    ? new ApiError('VALIDATION_ERROR', 'No census submission id was provided.')
    : !isUuid(normalizedId)
      ? new ApiError('VALIDATION_ERROR', 'The census submission id is invalid. Please return to the list and reopen the record.')
      : null

  const fetchFn = useCallback(() => petCensusApi.getById(normalizedId), [normalizedId])
  const { data: s, loading, error, refetch } = useApi(invalidIdError ? null : fetchFn, [normalizedId, invalidIdError])
  const adminNote = adminNoteOverride ?? s?.adminNote ?? ''

  async function handleStatusChange(newStatus: PetCensusStatus) {
    if (invalidIdError) return
    await mutate(() => petCensusApi.updateStatus(normalizedId, newStatus), undefined)
    refetch()
  }

  async function handleNoteSave() {
    if (invalidIdError) return
    await mutate(() => petCensusApi.update(normalizedId, { adminNote }), undefined)
    setAdminNoteOverride(null)
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
      <ApiErrorAlert error={(invalidIdError ?? error) as ApiError | null} />
      <LoadingOverlay loading={loading}>
        {invalidIdError && (
          <Alert variant="warning">
            This detail page received an invalid submission id. Please go back to the Pet Census list and open the record again.
          </Alert>
        )}
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
                    <InfoRow label="Division" value={s.division} />
                    <InfoRow label="District" value={s.district} />
                    <InfoRow label="City / Upazila" value={s.cityUpazila} />
                    <InfoRow label="Area / Address" value={s.ownerAddress ?? s.areaText} />
                    <InfoRow label="Area Tag" value={s.areaText} />
                    <InfoRow label="BPA Member" value={s.isBpaMember ? 'Yes' : 'No'} />
                    <InfoRow label="Linked User" value={s.user ? `${s.user.name} (${s.user.email ?? 'no email'})` : 'Guest submission'} />
                    <InfoRow label="Zone / Area" value={s.zone?.name} />
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
                    <InfoRow label="Pet Name" value={s.petName} />
                    <InfoRow label="Pet Type" value={s.petType ?? 'Legacy count submission'} />
                    <InfoRow label="Gender" value={s.petGender} />
                    <InfoRow label="Approx Age" value={s.approxAge} />
                    <InfoRow label="Pet Count" value={s.petCount || (s.petCountDog + s.petCountCat + s.petCountOther)} />
                    <InfoRow label="Pets in Household" value={s.householdPetCount} />
                    <InfoRow label="Breed" value={s.breed} />
                    <InfoRow label="Vaccination Status" value={labelVaccinationStatus(s.vaccinationStatus)} />
                    <InfoRow label="Neutered / Spayed" value={s.neuteredStatus} />
                    <InfoRow label="Health Issue" value={s.healthIssue} />
                    <InfoRow label="Photo" value={s.photoUrl ? <a href={s.photoUrl} target="_blank" rel="noreferrer">Open photo</a> : null} />
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
                          onChange={(e) => setAdminNoteOverride(e.target.value)}
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
