'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Row, Col, Form, InputGroup } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import CensusStatusBadge from './CensusStatusBadge'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { petCensusApi, type PetCensusListParams } from '@/lib/api/pet-census.api'
import type { ApiError } from '@/lib/api'
import type { PetCensusPetType, PetCensusSubmission, PetCensusStatus } from '@/types/bpa.types'

const STATUS_OPTIONS: Array<{ value: PetCensusStatus | ''; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'converted', label: 'Converted' },
  { value: 'archived', label: 'Archived' },
  { value: 'submitted', label: 'Submitted (legacy)' },
  { value: 'verified', label: 'Verified (legacy)' },
  { value: 'duplicate', label: 'Duplicate (legacy)' },
]

const PET_TYPE_OPTIONS: Array<{ value: PetCensusPetType | ''; label: string }> = [
  { value: '', label: 'All Pet Types' },
  { value: 'cat', label: 'Cat' },
  { value: 'dog', label: 'Dog' },
  { value: 'bird', label: 'Bird' },
  { value: 'other', label: 'Other' },
]

function petSummary(s: PetCensusSubmission) {
  if (s.petType && s.petCount > 0) return `${s.petCount} ${s.petType}${s.petCount > 1 ? 's' : ''}`
  const parts = [
    s.petCountDog > 0 ? `${s.petCountDog} dog` : '',
    s.petCountCat > 0 ? `${s.petCountCat} cat` : '',
    s.petCountOther > 0 ? `${s.petCountOther} other` : '',
  ].filter(Boolean)
  return parts.length ? parts.join(', ') : '-'
}

export default function PetCensusListContent() {
  const router = useRouter()
  const { can } = usePermission()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PetCensusStatus | ''>('')
  const [petType, setPetType] = useState<PetCensusPetType | ''>('')
  const [area, setArea] = useState('')
  const [carePartnerOnly, setCarePartnerOnly] = useState(false)
  const [vaccinationOnly, setVaccinationOnly] = useState(false)
  const [clinicOnly, setClinicOnly] = useState(false)
  const [petShopOnly, setPetShopOnly] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const { mutate } = useApiMutation<unknown, unknown>()

  const params: PetCensusListParams = {
    page,
    limit: 20,
    search: search || undefined,
    status: status || undefined,
    petType: petType || undefined,
    area: area || undefined,
    carePartnerInterest: carePartnerOnly || undefined,
    vaccinationInterest: vaccinationOnly || undefined,
    communityClinicInterest: clinicOnly || undefined,
    communityPetShopInterest: petShopOnly || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }

  const fetchFn = useCallback(() => petCensusApi.list(params), [
    page, search, status, petType, area, carePartnerOnly, vaccinationOnly, clinicOnly, petShopOnly, dateFrom, dateTo,
  ])
  const { data, loading, error, refetch } = useApi(fetchFn, [
    page, search, status, petType, area, carePartnerOnly, vaccinationOnly, clinicOnly, petShopOnly, dateFrom, dateTo,
  ])
  const submissions = data?.data ?? []
  const meta = data?.meta ?? null

  async function handleDelete(id: string) {
    if (!confirm('Delete this submission?')) return
    await mutate(() => petCensusApi.remove(id), undefined)
    refetch()
  }

  async function handleExport() {
    const blob = await petCensusApi.exportCsv(params)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'pet-census-2026.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  function resetFilters() {
    setSearch('')
    setStatus('')
    setPetType('')
    setArea('')
    setCarePartnerOnly(false)
    setVaccinationOnly(false)
    setClinicOnly(false)
    setPetShopOnly(false)
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Pet Census"
        breadcrumbs={[{ label: 'Community Care Fund' }, { label: 'Pet Census' }]}
        action={
          <Button variant="outline-primary" size="sm" onClick={handleExport}>
            <Icon icon="solar:download-bold" className="me-1" />Export CSV
          </Button>
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <Row className="g-2 mb-3">
            <Col lg={3} md={6}>
              <InputGroup>
                <InputGroup.Text><Icon icon="solar:magnifer-bold" /></InputGroup.Text>
                <Form.Control
                  placeholder="Search owner, mobile, email..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                />
              </InputGroup>
            </Col>
            <Col lg={2} md={6}>
              <Form.Select value={status} onChange={(e) => { setStatus(e.target.value as PetCensusStatus | ''); setPage(1) }}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Form.Select>
            </Col>
            <Col lg={2} md={6}>
              <Form.Select value={petType} onChange={(e) => { setPetType(e.target.value as PetCensusPetType | ''); setPage(1) }}>
                {PET_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Form.Select>
            </Col>
            <Col lg={2} md={6}>
              <Form.Control
                placeholder="Area"
                value={area}
                onChange={(e) => { setArea(e.target.value); setPage(1) }}
              />
            </Col>
            <Col lg={1} md={6}>
              <Form.Control type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }} />
            </Col>
            <Col lg={1} md={6}>
              <Form.Control type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }} />
            </Col>
            <Col lg={1} md={6}>
              <Button variant="outline-secondary" className="w-100" onClick={resetFilters}>
                <Icon icon="solar:restart-bold" />
              </Button>
            </Col>
          </Row>

          <div className="d-flex gap-3 flex-wrap mb-3 small">
            <Form.Check label="Care Partner" checked={carePartnerOnly} onChange={(e) => { setCarePartnerOnly(e.target.checked); setPage(1) }} />
            <Form.Check label="Vaccination" checked={vaccinationOnly} onChange={(e) => { setVaccinationOnly(e.target.checked); setPage(1) }} />
            <Form.Check label="Clinic" checked={clinicOnly} onChange={(e) => { setClinicOnly(e.target.checked); setPage(1) }} />
            <Form.Check label="Pet Shop" checked={petShopOnly} onChange={(e) => { setPetShopOnly(e.target.checked); setPage(1) }} />
          </div>

          <LoadingOverlay loading={loading}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Owner</th>
                  <th>Pet</th>
                  <th>Area</th>
                  <th>Interests</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-4 text-muted">No submissions found</td></tr>
                ) : submissions.map((s: PetCensusSubmission) => (
                  <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/community-care/pet-census/${s.id}`)}>
                    <td>
                      <div className="fw-semibold small">{s.ownerName}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{s.ownerMobile}</div>
                    </td>
                    <td className="small">
                      <div>{petSummary(s)}</div>
                      {s.breed && <div className="text-muted">{s.breed}</div>}
                    </td>
                    <td className="small">{s.zone?.name ?? s.areaText ?? '-'}</td>
                    <td className="small">
                      <div className="d-flex gap-1 flex-wrap">
                        {s.isCarePartnerInterested && <span className="badge bg-primary-subtle text-primary">Care</span>}
                        {s.isVaccinationInterested && <span className="badge bg-info-subtle text-info">Vacc</span>}
                        {s.isClinicInterested && <span className="badge bg-success-subtle text-success">Clinic</span>}
                        {s.isPetShopInterested && <span className="badge bg-warning-subtle text-warning">Shop</span>}
                      </div>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <CensusStatusBadge status={s.status} />
                    </td>
                    <td className="small">{new Date(s.submittedAt).toLocaleDateString()}</td>
                    <td className="text-end" onClick={(e) => e.stopPropagation()}>
                      <div className="d-flex gap-1 justify-content-end">
                        <Button variant="soft-primary" size="sm" onClick={() => router.push(`/community-care/pet-census/${s.id}`)}>
                          <Icon icon="solar:eye-bold" />
                        </Button>
                        {can('pet_census:delete') && (
                          <Button variant="soft-danger" size="sm" onClick={() => handleDelete(s.id)}>
                            <Icon icon="solar:trash-bin-trash-bold" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </LoadingOverlay>

          {meta && meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">{meta.total} submissions - Page {meta.page} of {meta.totalPages}</small>
              <div className="d-flex gap-1">
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasPrev} onClick={() => setPage(p => p - 1)}>Prev</Button>
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasNext} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
