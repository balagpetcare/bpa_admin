'use client'

import { useCallback, useState } from 'react'
import {
  Alert, Badge, Button, Card, Col, Form, InputGroup,
  Modal, Row, Table,
} from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { campaignsApi } from '@/lib/api/campaigns.api'
import type { ApiError } from '@/lib/api'
import type { Participant, CampaignRegistrationStatus } from '@/types/bpa.types'
import dayjs from 'dayjs'

const PAY_STATUS_COLORS: Record<string, string> = {
  success: 'success', pending: 'warning', failed: 'danger',
  cancelled: 'secondary', pending_review: 'info', refunded: 'info',
}

const REG_STATUS_COLORS: Record<CampaignRegistrationStatus, string> = {
  pending_payment: 'warning', paid: 'success', checked_in: 'info',
  vaccinated: 'primary', certificate_issued: 'secondary',
  completed: 'dark', no_show: 'danger', cancelled: 'danger',
}

function fmtBdt(v: string | number) { return `৳${Number(v).toLocaleString()}` }

// ─── Drawer ───────────────────────────────────────────────────────

function ParticipantDrawer({ p, onClose }: { p: Participant; onClose: () => void }) {
  const pets = p.petBookings ?? []
  const certCount = pets.filter(pb => pb.certificates?.length > 0).length
  const checkedInCount = pets.filter(pb => pb.checkedInAt).length
  const vaccinatedCount = pets.filter(pb => pb.vaccinatedAt).length

  return (
    <Modal show onHide={onClose} size="lg" scrollable>
      <Modal.Header closeButton className="border-bottom">
        <Modal.Title className="fs-5 fw-bold">
          <code className="me-2 text-primary">{p.bookingNumber}</code>
          <Badge bg={REG_STATUS_COLORS[p.status]} className="text-capitalize ms-1">
            {p.status.replace(/_/g, ' ')}
          </Badge>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div className="p-4 border-bottom">
          <h6 className="text-uppercase text-muted small fw-bold mb-3">Owner</h6>
          <Row className="g-2">
            <Col sm={6}><label className="text-muted small">Name</label><div className="fw-semibold">{p.owner.ownerName}</div></Col>
            <Col sm={6}><label className="text-muted small">Phone</label><div>{p.owner.mobile}</div></Col>
            <Col sm={6}><label className="text-muted small">Email</label><div>{p.owner.email ?? '—'}</div></Col>
            <Col sm={6}><label className="text-muted small">Address</label><div>{p.owner.address ?? '—'}</div></Col>
          </Row>
        </div>

        <div className="p-4 border-bottom">
          <h6 className="text-uppercase text-muted small fw-bold mb-3">Session</h6>
          <Row className="g-2">
            <Col sm={6}><label className="text-muted small">Date</label><div className="fw-semibold">{dayjs(p.session.sessionDate).format('ddd, MMM D, YYYY')}</div></Col>
            <Col sm={6}><label className="text-muted small">Time</label><div>{p.session.startTime} — {p.session.endTime}</div></Col>
            <Col sm={12}><label className="text-muted small">Venue</label><div>{p.session.venue?.name ?? '—'}</div></Col>
          </Row>
        </div>

        <div className="p-4 border-bottom">
          <h6 className="text-uppercase text-muted small fw-bold mb-3">
            Pets ({pets.length}) · Checked-in: {checkedInCount} · Vaccinated: {vaccinatedCount} · Certs: {certCount}
          </h6>
          {pets.length === 0 ? (
            <p className="text-muted small mb-0">No pet bookings.</p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {pets.map(pb => (
                <div key={pb.id} className="border rounded p-3 bg-light">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <span className="fw-semibold">{pb.pet.name}</span>
                      <span className="text-muted ms-2 small">{pb.pet.petType} · {pb.pet.breed ?? '—'}</span>
                    </div>
                    <Badge bg={REG_STATUS_COLORS[pb.status]} className="text-capitalize small">
                      {pb.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div className="d-flex gap-3 mt-2 small text-muted">
                    <span><Icon icon="solar:login-bold" className="me-1" />Check-in: {pb.checkedInAt ? dayjs(pb.checkedInAt).format('MMM D HH:mm') : '—'}</span>
                    <span><Icon icon="solar:syringe-bold" className="me-1" />Vaccinated: {pb.vaccinatedAt ? dayjs(pb.vaccinatedAt).format('MMM D HH:mm') : '—'}</span>
                  </div>
                  {pb.certificates?.length > 0 && (
                    <div className="mt-1 small">
                      <Icon icon="solar:document-text-bold" className="text-secondary me-1" />
                      Cert: <code>{pb.certificates[0].certificateNumber}</code>
                      <span className="text-muted ms-2">{dayjs(pb.certificates[0].issuedAt).format('MMM D')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {p.payment && (
          <div className="p-4 border-bottom">
            <h6 className="text-uppercase text-muted small fw-bold mb-3">Payment</h6>
            <Row className="g-2">
              <Col sm={6}><label className="text-muted small">Status</label><div><Badge bg={PAY_STATUS_COLORS[p.payment.status] ?? 'secondary'}>{p.payment.status}</Badge></div></Col>
              <Col sm={6}><label className="text-muted small">Amount</label><div className="fw-bold text-success">{fmtBdt(p.payment.amount)}</div></Col>
              <Col sm={6}><label className="text-muted small">Gateway</label><div>{p.payment.gateway?.toUpperCase() ?? '—'}</div></Col>
              <Col sm={6}><label className="text-muted small">Merchant Txn ID</label><div><code className="small">{p.payment.merchantTxnId ?? '—'}</code></div></Col>
              <Col sm={6}><label className="text-muted small">EPS Txn ID</label><div><code className="small">{p.payment.epsTxnId ?? '—'}</code></div></Col>
              <Col sm={6}><label className="text-muted small">Gateway Ref</label><div><code className="small">{p.payment.gatewayRef ?? '—'}</code></div></Col>
              <Col sm={6}><label className="text-muted small">Paid At</label><div>{dayjs(p.payment.updatedAt).format('MMM D, YYYY HH:mm')}</div></Col>
            </Row>
          </div>
        )}

        <div className="p-4">
          <h6 className="text-uppercase text-muted small fw-bold mb-2">Meta</h6>
          <div className="small text-muted">Booked: {dayjs(p.createdAt).format('MMM D, YYYY HH:mm')} · Guest: {p.isGuest ? 'Yes' : 'No'}</div>
          {p.notes && <Alert variant="warning" className="mt-2 small py-2 mb-0">{p.notes}</Alert>}
        </div>
      </Modal.Body>
      <Modal.Footer className="border-top">
        <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}

// ─── Main ─────────────────────────────────────────────────────────

export default function ParticipantsList({ campaignId }: { campaignId: string }) {
  const { can } = usePermission()

  // Filters
  const [search, setSearch] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [registrationStatus, setRegistrationStatus] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)

  // UI state
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  const filterParams = {
    search: search || undefined,
    paymentStatus: paymentStatus || undefined,
    registrationStatus: registrationStatus || undefined,
    sessionId: sessionId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    limit: 50,
  }

  const fetchFn = useCallback(
    () => campaignsApi.listParticipants(campaignId, filterParams),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [campaignId, search, paymentStatus, registrationStatus, sessionId, dateFrom, dateTo, page],
  )
  const { data, loading, error } = useApi(fetchFn, [campaignId, search, paymentStatus, registrationStatus, sessionId, dateFrom, dateTo, page])

  const paySummaryFn = useCallback(() => campaignsApi.getPaymentSummary(campaignId), [campaignId])
  const { data: paySummary } = useApi(paySummaryFn, [campaignId])

  const items = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  function resetFilters() {
    setSearch(''); setPaymentStatus(''); setRegistrationStatus('')
    setSessionId(''); setDateFrom(''); setDateTo(''); setPage(1)
  }

  function buildExportQs() {
    const p: Record<string, string> = {}
    if (search) p.search = search
    if (paymentStatus) p.paymentStatus = paymentStatus
    if (registrationStatus) p.registrationStatus = registrationStatus
    if (sessionId) p.sessionId = sessionId
    if (dateFrom) p.dateFrom = dateFrom
    if (dateTo) p.dateTo = dateTo
    return p
  }

  function handleExport(type: 'csv' | 'xlsx') {
    setExportError(null)
    try {
      const url = type === 'csv'
        ? campaignsApi.exportCsvUrl(campaignId, buildExportQs())
        : campaignsApi.exportXlsxUrl(campaignId, buildExportQs())
      const a = document.createElement('a')
      a.href = url; a.download = ''; a.click()
    } catch {
      setExportError('Export failed. Please try again.')
    }
  }

  const paidInfo = paySummary?.['success']
  const pendingInfo = paySummary?.['pending']
  const failedInfo = paySummary?.['failed']
  const cancelledInfo = paySummary?.['cancelled']

  return (
    <div className="container-fluid">
      <PageHeader
        title="Participants & Payments"
        breadcrumbs={[
          { label: 'Campaigns', href: '/campaigns' },
          { label: 'Detail', href: `/campaigns/${campaignId}` },
          { label: 'Participants' },
        ]}
        action={
          <div className="d-flex gap-2">
            {can('campaigns:read') && (
              <>
                <Button variant="outline-success" size="sm" onClick={() => handleExport('csv')} className="d-flex align-items-center gap-1">
                  <Icon icon="solar:file-text-bold" className="fs-16" />CSV
                </Button>
                <Button variant="outline-primary" size="sm" onClick={() => handleExport('xlsx')} className="d-flex align-items-center gap-1">
                  <Icon icon="solar:file-bold" className="fs-16" />Excel
                </Button>
              </>
            )}
            {can('campaigns:update') && (
              <Link href={`/campaigns/${campaignId}/bulk-sms`} className="btn btn-sm btn-primary d-flex align-items-center gap-1">
                <Icon icon="solar:chat-round-like-bold" className="fs-16" />Bulk SMS
              </Link>
            )}
          </div>
        }
      />

      {exportError && <Alert variant="danger" dismissible onClose={() => setExportError(null)}>{exportError}</Alert>}
      <ApiErrorAlert error={error as ApiError | null} />

      {/* Payment summary bar */}
      {paySummary && (
        <Row className="g-3 mb-3">
          {[
            { label: 'Paid', info: paidInfo, variant: 'success', icon: 'solar:check-circle-bold-duotone' },
            { label: 'Pending', info: pendingInfo, variant: 'warning', icon: 'solar:clock-circle-bold-duotone' },
            { label: 'Failed', info: failedInfo, variant: 'danger', icon: 'solar:close-circle-bold-duotone' },
            { label: 'Cancelled', info: cancelledInfo, variant: 'secondary', icon: 'solar:forbidden-circle-bold-duotone' },
          ].map(({ label, info, variant, icon }) => (
            <Col key={label} sm={6} lg={3}>
              <Card className={`border-0 shadow-sm border-start border-4 border-${variant}`}>
                <Card.Body className="py-2 px-3 d-flex align-items-center gap-3">
                  <Icon icon={icon} className={`fs-24 text-${variant}`} />
                  <div>
                    <div className="fw-bold fs-5">{(info?.count ?? 0).toLocaleString()}</div>
                    {info?.total !== undefined && <div className="small text-muted">৳{info.total.toLocaleString()}</div>}
                    <div className={`text-${variant} small fw-semibold text-uppercase`}>{label}</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body className="py-2">
          <Row className="g-2 align-items-center">
            <Col xs={12} sm={6} md={4} lg={3}>
              <InputGroup size="sm">
                <InputGroup.Text><Icon icon="solar:magnifer-bold" /></InputGroup.Text>
                <Form.Control
                  placeholder="Booking ref, owner, phone, email, txn ID…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                />
              </InputGroup>
            </Col>
            <Col xs={6} sm={4} md={2}>
              <Form.Select size="sm" value={paymentStatus} onChange={e => { setPaymentStatus(e.target.value); setPage(1) }}>
                <option value="">All Payments</option>
                <option value="success">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending_review">Pending Review</option>
              </Form.Select>
            </Col>
            <Col xs={6} sm={4} md={2}>
              <Form.Select size="sm" value={registrationStatus} onChange={e => { setRegistrationStatus(e.target.value); setPage(1) }}>
                <option value="">All Statuses</option>
                <option value="pending_payment">Pending Payment</option>
                <option value="paid">Paid</option>
                <option value="checked_in">Checked In</option>
                <option value="vaccinated">Vaccinated</option>
                <option value="certificate_issued">Certificate Issued</option>
                <option value="completed">Completed</option>
                <option value="no_show">No Show</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Col>
            <Col xs={6} sm={3} md={2}>
              <Form.Control size="sm" type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }} placeholder="From" />
            </Col>
            <Col xs={6} sm={3} md={2}>
              <Form.Control size="sm" type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }} placeholder="To" />
            </Col>
            <Col xs="auto">
              <Button size="sm" variant="outline-secondary" onClick={resetFilters}>Reset</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom py-2 d-flex justify-content-between align-items-center">
          <span className="small text-muted">{total.toLocaleString()} participant{total !== 1 ? 's' : ''}</span>
          <div className="d-flex gap-2">
            <Button size="sm" variant="soft-success" onClick={() => handleExport('csv')} className="d-flex align-items-center gap-1">
              <Icon icon="solar:file-text-bold" />Export CSV
            </Button>
            <Button size="sm" variant="soft-primary" onClick={() => handleExport('xlsx')} className="d-flex align-items-center gap-1">
              <Icon icon="solar:file-bold" />Export Excel
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <LoadingOverlay loading={loading}>
            <div className="table-responsive">
              <Table hover className="table-centered align-middle mb-0 small">
                <thead className="table-light text-uppercase" style={{ fontSize: '0.7rem' }}>
                  <tr>
                    <th className="ps-3">Booking Ref</th>
                    <th>Owner</th>
                    <th>Pets</th>
                    <th>Session · Venue</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>EPS Txn ID</th>
                    <th>Reg Status</th>
                    <th className="text-center">Check-in</th>
                    <th className="text-center">Vaccinated</th>
                    <th className="text-center">Certificate</th>
                    <th>Booked</th>
                    <th className="pe-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="text-center py-5">
                        <Icon icon="solar:inbox-bold-duotone" className="fs-36 text-muted mb-2 d-block mx-auto" />
                        <div className="text-muted">No participants found</div>
                        {(search || paymentStatus || registrationStatus) && (
                          <Button size="sm" variant="outline-secondary" className="mt-2" onClick={resetFilters}>Clear filters</Button>
                        )}
                      </td>
                    </tr>
                  ) : items.map((p: Participant) => {
                    const petCount = p.petBookings?.length ?? 0
                    const petNames = p.petBookings?.map(pb => pb.pet.name).join(', ') ?? '—'
                    const checkedIn = p.petBookings?.every(pb => pb.checkedInAt) ?? false
                    const vaccinated = p.petBookings?.every(pb => pb.vaccinatedAt) ?? false
                    const hasCert = p.petBookings?.some(pb => pb.certificates?.length > 0) ?? false

                    return (
                      <tr key={p.id}>
                        <td className="ps-3">
                          <code className="text-primary">{p.bookingNumber}</code>
                        </td>
                        <td>
                          <div className="fw-semibold">{p.owner.ownerName}</div>
                          <div className="text-muted">{p.owner.mobile}</div>
                          {p.owner.email && <div className="text-muted" style={{ fontSize: '0.7rem' }}>{p.owner.email}</div>}
                        </td>
                        <td>
                          <div className="fw-semibold">{petCount} pet{petCount !== 1 ? 's' : ''}</div>
                          <div className="text-muted" style={{ maxWidth: 120 }}>{petNames}</div>
                        </td>
                        <td>
                          <div>{dayjs(p.session.sessionDate).format('MMM D, YYYY')}</div>
                          <div className="text-muted">{p.session.venue?.name ?? '—'}</div>
                        </td>
                        <td className="fw-semibold">{fmtBdt(p.totalAmountBdt)}</td>
                        <td>
                          {p.payment ? (
                            <Badge bg={PAY_STATUS_COLORS[p.payment.status] ?? 'secondary'}>
                              {p.payment.status}
                            </Badge>
                          ) : <span className="text-muted">—</span>}
                        </td>
                        <td>
                          {p.payment?.epsTxnId
                            ? <code className="small">{p.payment.epsTxnId}</code>
                            : <span className="text-muted">—</span>}
                        </td>
                        <td>
                          <Badge bg={REG_STATUS_COLORS[p.status]} className="text-capitalize">
                            {p.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <Icon
                            icon={checkedIn ? 'solar:check-circle-bold-duotone' : 'solar:close-circle-bold-duotone'}
                            className={`fs-18 text-${checkedIn ? 'success' : 'muted'}`}
                          />
                        </td>
                        <td className="text-center">
                          <Icon
                            icon={vaccinated ? 'solar:check-circle-bold-duotone' : 'solar:close-circle-bold-duotone'}
                            className={`fs-18 text-${vaccinated ? 'primary' : 'muted'}`}
                          />
                        </td>
                        <td className="text-center">
                          <Icon
                            icon={hasCert ? 'solar:check-circle-bold-duotone' : 'solar:close-circle-bold-duotone'}
                            className={`fs-18 text-${hasCert ? 'secondary' : 'muted'}`}
                          />
                        </td>
                        <td className="text-muted">{dayjs(p.createdAt).format('MMM D, YY')}</td>
                        <td className="pe-3">
                          <Button size="sm" variant="soft-primary" onClick={() => setSelectedParticipant(p)} className="d-flex align-items-center gap-1">
                            <Icon icon="solar:eye-bold" />View
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </div>
          </LoadingOverlay>
        </Card.Body>
        {totalPages > 1 && (
          <Card.Footer className="bg-white border-top d-flex justify-content-between align-items-center py-2">
            <small className="text-muted">Page {page} of {totalPages} · {total.toLocaleString()} total</small>
            <div className="d-flex gap-1">
              <Button size="sm" variant="soft-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹ Prev</Button>
              <Button size="sm" variant="soft-secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next ›</Button>
            </div>
          </Card.Footer>
        )}
      </Card>

      {selectedParticipant && (
        <ParticipantDrawer p={selectedParticipant} onClose={() => setSelectedParticipant(null)} />
      )}
    </div>
  )
}
