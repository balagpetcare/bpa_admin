'use client'

import { useState } from 'react'
import { Card, Row, Col, Form, InputGroup, Button, Badge, Modal, Table, Alert } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { checkinApi } from '@/lib/api/checkin.api'
import type { ApiError } from '@/lib/api'
import type { PetBookingDetail, CampaignRegistrationStatus } from '@/types/bpa.types'

const STATUS_COLORS: Record<CampaignRegistrationStatus, string> = {
  pending_payment: 'warning',
  paid: 'success',
  checked_in: 'info',
  vaccinated: 'primary',
  certificate_issued: 'secondary',
  completed: 'dark',
  no_show: 'danger',
  cancelled: 'danger',
}

interface VaccinateFormState {
  bookingId: string
  petName: string
  services: Array<{ campaignServiceId: string; name: string; isRequired: boolean; batchNumber: string }>
  doctorId: string
  notes: string
}

export default function CheckInDashboard({ campaignId }: { campaignId: string }) {
  const { can } = usePermission()
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<PetBookingDetail[]>([])
  const [selected, setSelected] = useState<PetBookingDetail | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [vaccinateForm, setVaccinateForm] = useState<VaccinateFormState | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const { mutate, loading } = useApiMutation<PetBookingDetail, unknown>()
  const { mutate: actionMutate, loading: actionLoading, error: actionError } = useApiMutation<PetBookingDetail, unknown>()

  async function handleSearch() {
    if (!searchQuery.trim()) return
    setSearchError(null)
    setSelected(null)
    try {
      const res = await checkinApi.search({ q: searchQuery, campaignId })
      setResults(Array.isArray(res) ? res : [])
    } catch {
      setSearchError('Search failed. Please try again.')
    }
  }

  async function handleScanQr() {
    if (!searchQuery.trim()) return
    setSearchError(null)
    try {
      const booking = await checkinApi.scanQr(searchQuery.trim())
      setSelected(booking)
      setResults([])
    } catch {
      setSearchError('QR token not found. Try searching by name or mobile.')
    }
  }

  async function handleCheckIn(bookingId: string) {
    const updated = await actionMutate(() => checkinApi.checkIn(bookingId), undefined)
    if (updated) {
      setSelected(updated)
      setResults((prev) => prev.map((b) => (b.id === bookingId ? updated : b)))
      setSuccessMsg(`Checked in successfully.`)
      setTimeout(() => setSuccessMsg(null), 3000)
    }
  }

  function openVaccinateModal(booking: PetBookingDetail) {
    setVaccinateForm({
      bookingId: booking.id,
      petName: booking.pet.name,
      services: booking.services
        .filter((s) => !s.administered)
        .map((s) => ({
          campaignServiceId: s.campaignServiceId,
          name: s.campaignService.name,
          isRequired: s.campaignService.isRequired,
          batchNumber: '',
        })),
      doctorId: '',
      notes: '',
    })
  }

  async function handleVaccinate() {
    if (!vaccinateForm) return
    const body = {
      services: vaccinateForm.services.map((s) => ({
        campaignServiceId: s.campaignServiceId,
        batchNumber: s.batchNumber || undefined,
      })),
      doctorId: vaccinateForm.doctorId || undefined,
      notes: vaccinateForm.notes || undefined,
    }
    const updated = await actionMutate(() => checkinApi.vaccinate(vaccinateForm.bookingId, body), undefined)
    if (updated) {
      setSelected(updated)
      setResults((prev) => prev.map((b) => (b.id === vaccinateForm.bookingId ? updated : b)))
      setVaccinateForm(null)
      setSuccessMsg(`Vaccination recorded for ${vaccinateForm.petName}.`)
      setTimeout(() => setSuccessMsg(null), 4000)
    }
  }

  const canCheckIn = can('campaign_checkin:checkin')

  return (
    <div className="container-fluid">
      <PageHeader
        title="Check-In Dashboard"
        breadcrumbs={[{ label: 'Campaigns', href: '/campaigns' }, { label: 'Detail', href: `/campaigns/${campaignId}` }, { label: 'Check-In' }]}
      />

      {successMsg && (
        <Alert variant="success" dismissible onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}
      <ApiErrorAlert error={actionError as ApiError | null} />

      {/* Search / QR Input */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-2 align-items-end">
            <Col md={8}>
              <Form.Label className="fw-semibold">Search or Scan QR</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <Icon icon="solar:magnifer-bold" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Enter booking number, mobile, pet name, or QR token…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </InputGroup>
            </Col>
            <Col md="auto">
              <Button variant="primary" onClick={handleSearch} disabled={loading}>
                <Icon icon="solar:magnifer-bold" className="me-1" />
                Search
              </Button>
            </Col>
            <Col md="auto">
              <Button variant="outline-secondary" onClick={handleScanQr} disabled={loading}>
                <Icon icon="solar:qr-code-bold" className="me-1" />
                Scan QR
              </Button>
            </Col>
          </Row>
          {searchError && (
            <Alert variant="warning" className="mt-2 mb-0">
              {searchError}
            </Alert>
          )}
        </Card.Body>
      </Card>

      <Row className="g-3">
        {/* Search Results */}
        {results.length > 0 && (
          <Col md={selected ? 5 : 12}>
            <Card>
              <Card.Header>
                <h6 className="mb-0">Results ({results.length})</h6>
              </Card.Header>
              <Card.Body className="p-0">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Pet</th>
                      <th>Owner</th>
                      <th>Booking #</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((b) => (
                      <tr
                        key={b.id}
                        className={selected?.id === b.id ? 'table-active' : ''}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelected(b)}>
                        <td className="fw-semibold">
                          {b.pet.name} <small className="text-muted text-capitalize">({b.pet.petType})</small>
                        </td>
                        <td>
                          {b.pet.owner?.ownerName}
                          <br />
                          <small className="text-muted">{b.pet.owner?.mobile}</small>
                        </td>
                        <td>
                          <code>{b.registration.bookingNumber}</code>
                        </td>
                        <td>
                          <Badge bg={STATUS_COLORS[b.status]} className="text-capitalize">
                            {b.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="soft-primary"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelected(b)
                            }}>
                            <Icon icon="solar:eye-bold" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Booking Detail Panel */}
        {selected && (
          <Col md={results.length > 0 ? 7 : 12}>
            <LoadingOverlay loading={actionLoading}>
              <BookingDetailCard
                booking={selected}
                canCheckIn={canCheckIn}
                onCheckIn={() => handleCheckIn(selected.id)}
                onVaccinate={() => openVaccinateModal(selected)}
                onClear={() => {
                  setSelected(null)
                  setResults([])
                }}
              />
            </LoadingOverlay>
          </Col>
        )}
      </Row>

      {/* Vaccinate Modal */}
      {vaccinateForm && (
        <Modal show onHide={() => setVaccinateForm(null)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Mark Vaccinated — {vaccinateForm.petName}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Table bordered size="sm" className="mb-3">
              <thead className="table-light">
                <tr>
                  <th>Service</th>
                  <th>Required</th>
                  <th>Batch Number</th>
                </tr>
              </thead>
              <tbody>
                {vaccinateForm.services.map((s, i) => (
                  <tr key={s.campaignServiceId}>
                    <td>{s.name}</td>
                    <td>{s.isRequired ? <Badge bg="danger">Required</Badge> : <Badge bg="secondary">Optional</Badge>}</td>
                    <td>
                      <Form.Control
                        size="sm"
                        placeholder="Batch / Lot number"
                        value={s.batchNumber}
                        onChange={(e) => {
                          const updated = [...vaccinateForm.services]
                          updated[i] = { ...updated[i], batchNumber: e.target.value }
                          setVaccinateForm({ ...vaccinateForm, services: updated })
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Row className="g-2">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Doctor ID (optional)</Form.Label>
                  <Form.Control
                    placeholder="Doctor UUID"
                    value={vaccinateForm.doctorId}
                    onChange={(e) => setVaccinateForm({ ...vaccinateForm, doctorId: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Notes (optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={1}
                    value={vaccinateForm.notes}
                    onChange={(e) => setVaccinateForm({ ...vaccinateForm, notes: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setVaccinateForm(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleVaccinate} disabled={actionLoading || vaccinateForm.services.length === 0}>
              {actionLoading ? 'Saving…' : 'Record Vaccination'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  )
}

function BookingDetailCard({
  booking,
  canCheckIn,
  onCheckIn,
  onVaccinate,
  onClear,
}: {
  booking: PetBookingDetail
  canCheckIn: boolean
  onCheckIn: () => void
  onVaccinate: () => void
  onClear: () => void
}) {
  const unadministered = booking.services.filter((s) => !s.administered)
  const administered = booking.services.filter((s) => s.administered)

  const canDoCheckIn = canCheckIn && booking.status === 'paid'
  const canDoVaccinate = canCheckIn && ['paid', 'checked_in'].includes(booking.status) && unadministered.length > 0

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          {booking.pet.name} <span className="text-muted fw-normal text-capitalize">({booking.pet.petType})</span>
        </h6>
        <Button variant="outline-secondary" size="sm" onClick={onClear}>
          <Icon icon="solar:close-circle-bold" />
        </Button>
      </Card.Header>
      <Card.Body>
        <Row className="g-3 mb-3">
          <Col xs={6}>
            <small className="text-muted d-block">Status</small>
            <Badge bg={STATUS_COLORS[booking.status]} className="text-capitalize">
              {booking.status.replace(/_/g, ' ')}
            </Badge>
          </Col>
          <Col xs={6}>
            <small className="text-muted d-block">Booking #</small>
            <code>{booking.registration.bookingNumber}</code>
          </Col>
          <Col xs={6}>
            <small className="text-muted d-block">Owner</small>
            <div>{booking.pet.owner?.ownerName}</div>
            <small className="text-muted">{booking.pet.owner?.mobile}</small>
          </Col>
          <Col xs={6}>
            <small className="text-muted d-block">Session</small>
            <div>{new Date(booking.session.sessionDate).toLocaleDateString()}</div>
            <small className="text-muted">
              {booking.session.startTime} · {booking.session.venue?.name ?? '—'}
            </small>
          </Col>
          {booking.checkedInAt && (
            <Col xs={6}>
              <small className="text-muted d-block">Checked In</small>
              {new Date(booking.checkedInAt).toLocaleTimeString()}
            </Col>
          )}
          {booking.vaccinatedAt && (
            <Col xs={6}>
              <small className="text-muted d-block">Vaccinated</small>
              {new Date(booking.vaccinatedAt).toLocaleTimeString()}
            </Col>
          )}
        </Row>

        {/* Services */}
        {booking.services.length > 0 && (
          <div className="mb-3">
            <small className="text-muted d-block mb-1">Services</small>
            {booking.services.map((s) => (
              <Badge key={s.id} bg={s.administered ? 'success' : 'secondary'} className="me-1 mb-1">
                <Icon icon={s.administered ? 'solar:check-circle-bold' : 'solar:clock-circle-bold'} className="me-1" />
                {s.campaignService.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="d-flex gap-2 flex-wrap">
          {canDoCheckIn && (
            <Button variant="success" onClick={onCheckIn}>
              <Icon icon="solar:check-circle-bold" className="me-1" />
              Check In
            </Button>
          )}
          {canDoVaccinate && (
            <Button variant="primary" onClick={onVaccinate}>
              <Icon icon="solar:syringe-bold" className="me-1" />
              Mark Vaccinated ({unadministered.length})
            </Button>
          )}
          {!canDoCheckIn && !canDoVaccinate && (
            <span className="text-muted fst-italic">
              {booking.status === 'vaccinated'
                ? 'All vaccinations completed.'
                : booking.status === 'cancelled'
                  ? 'Booking is cancelled.'
                  : booking.status === 'pending_payment'
                    ? 'Awaiting payment.'
                    : administered.length > 0
                      ? `${administered.length} service(s) administered.`
                      : 'No actions available.'}
            </span>
          )}
        </div>
      </Card.Body>
    </Card>
  )
}
