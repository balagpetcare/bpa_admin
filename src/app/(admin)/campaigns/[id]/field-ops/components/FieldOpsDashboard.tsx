'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Alert, Badge, Row, Col, Form, Table, Spinner, Accordion, InputGroup } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { campaignsApi } from '@/lib/api/campaigns.api'
import type { ApiError } from '@/lib/api'
import type {
  QRVerifyResult, QRVerifyPetBooking, FieldOpsStats,
  QRScanLogEntry, CampaignRegistrationStatus
} from '@/types/bpa.types'
import dayjs from 'dayjs'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; label: string }> = {
    pending_payment: { color: 'warning', label: 'Pending Payment' },
    paid: { color: 'info', label: 'Paid' },
    checked_in: { color: 'primary', label: 'Checked In' },
    vaccinated: { color: 'success', label: 'Vaccinated' },
    certificate_issued: { color: 'success', label: 'Certificate Issued' },
    completed: { color: 'success', label: 'Completed' },
    no_show: { color: 'secondary', label: 'No Show' },
    cancelled: { color: 'danger', label: 'Cancelled' },
    VALID: { color: 'success', label: 'Valid' },
    INVALID: { color: 'danger', label: 'Invalid' },
    PAYMENT_PENDING: { color: 'warning', label: 'Payment Pending' },
    ALREADY_CHECKED_IN: { color: 'info', label: 'Already Checked In' },
    ALREADY_VACCINATED: { color: 'success', label: 'Already Vaccinated' },
    EXPIRED: { color: 'secondary', label: 'Expired' },
    WRONG_SESSION: { color: 'danger', label: 'Wrong Session' },
    CANCELLED: { color: 'danger', label: 'Cancelled' },
  }
  const m = map[status] ?? { color: 'secondary', label: status }
  return <span className={`badge bg-${m.color}-subtle text-${m.color}`}>{m.label}</span>
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <Card className="text-center border-0 shadow-sm h-100">
      <Card.Body className="py-3">
        <div className={`text-${color} mb-1`} style={{ fontSize: 28 }}><Icon icon={icon} /></div>
        <div className="fw-bold fs-4">{value}</div>
        <div className="text-muted small">{label}</div>
      </Card.Body>
    </Card>
  )
}

function PetActionButtons({
  campaignId, pet, verifyResult, onAction
}: {
  campaignId: string
  pet: QRVerifyPetBooking
  verifyResult: QRVerifyResult
  onAction: () => void
}) {
  const { mutate, loading, error, clearError } = useApiMutation<unknown, unknown>()
  const [localMsg, setLocalMsg] = useState<string | null>(null)
  const [certUrl, setCertUrl] = useState<string | null>(null)

  async function doCheckIn() {
    clearError(); setLocalMsg(null); setCertUrl(null)
    const r = await mutate(() => campaignsApi.checkIn(campaignId, { petBookingId: pet.id, registrationId: verifyResult.registrationId }), undefined) as any
    if (r) { setLocalMsg('Checked in successfully!'); onAction() }
  }

  async function doVaccinate() {
    clearError(); setLocalMsg(null); setCertUrl(null)
    const r = await mutate(() => campaignsApi.vaccinationComplete(campaignId, { petBookingId: pet.id }), undefined) as any
    if (r) {
      const data = r.data ?? r
      const msg = data?.warningNoSigningDoctor
        ? 'Vaccination recorded — no signing doctor assigned, certificate cannot be auto-issued.'
        : 'Vaccination completed successfully!'
      setLocalMsg(msg)
      onAction()
    }
  }

  async function doIssueCert() {
    clearError(); setLocalMsg(null); setCertUrl(null)
    const r = await mutate(() => campaignsApi.issueCertificate(campaignId, { petBookingId: pet.id }), undefined) as any
    if (r) {
      const data = r.data ?? r
      setCertUrl(data?.verifyUrl ?? data?.pdfUrl ?? null)
      setLocalMsg(data?.alreadyExisted ? 'Certificate already exists.' : 'Certificate issued!')
      onAction()
    }
  }

  async function doResend() {
    clearError(); setLocalMsg(null); setCertUrl(null)
    const r = await mutate(() => campaignsApi.resendCertificate(campaignId, pet.id), undefined) as any
    if (r) {
      const data = r.data ?? r
      setCertUrl(data?.verifyUrl ?? data?.pdfUrl ?? null)
      setLocalMsg('Certificate link retrieved.')
    }
  }

  const a = pet.allowedActions

  return (
    <div className="d-flex flex-column gap-2 mt-2">
      {(error as ApiError | null) && (
        <Alert variant="danger" className="py-2 small mb-0">{(error as any)?.message ?? 'Error'}</Alert>
      )}
      {localMsg && (
        <Alert variant={certUrl ? 'success' : 'info'} className="py-2 small mb-0">
          {localMsg}
          {certUrl && <div className="mt-1"><a href={certUrl} target="_blank" rel="noreferrer" className="fw-bold">View Certificate →</a></div>}
        </Alert>
      )}
      <div className="d-flex flex-wrap gap-2">
        {a.canCheckIn && (
          <Button variant="primary" size="sm" onClick={doCheckIn} disabled={loading} style={{ minWidth: 120 }}>
            {loading ? <Spinner size="sm" /> : <><Icon icon="solar:check-circle-bold" className="me-1" />Check In</>}
          </Button>
        )}
        {a.canMarkVaccinated && (
          <Button variant="success" size="sm" onClick={doVaccinate} disabled={loading} style={{ minWidth: 140 }}>
            {loading ? <Spinner size="sm" /> : <><Icon icon="solar:syringe-bold" className="me-1" />Complete Vaccination</>}
          </Button>
        )}
        {a.canIssueCertificate && (
          <Button variant="warning" size="sm" onClick={doIssueCert} disabled={loading} style={{ minWidth: 140 }}>
            {loading ? <Spinner size="sm" /> : <><Icon icon="solar:diploma-bold" className="me-1" />Issue Certificate</>}
          </Button>
        )}
        {a.canResendCertificate && (
          <Button variant="outline-secondary" size="sm" onClick={doResend} disabled={loading} style={{ minWidth: 120 }}>
            {loading ? <Spinner size="sm" /> : <><Icon icon="solar:link-bold" className="me-1" />Resend Cert</>}
          </Button>
        )}
      </div>
    </div>
  )
}

export default function FieldOpsDashboard({ campaignId }: { campaignId: string }) {
  const { can } = usePermission()

  // QR verify section
  const [qrInput, setQrInput] = useState('')
  const [verifyResult, setVerifyResult] = useState<QRVerifyResult | null>(null)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Stats & scan logs section
  const statsFn = useCallback(() => campaignsApi.getOperationalStats(campaignId), [campaignId, refreshKey])
  const { data: statsRaw, loading: loadingStats } = useApi(statsFn, [campaignId, refreshKey])

  const scanLogsFn = useCallback(() => campaignsApi.getScanLogs(campaignId, { limit: 20 }), [campaignId, refreshKey])
  const { data: scanLogsRaw, loading: loadingLogs } = useApi(scanLogsFn, [campaignId, refreshKey])

  const stats: FieldOpsStats | null = (() => {
    const raw = statsRaw as any
    if (!raw) return null
    return raw.data ?? raw
  })()

  const scanLogs: QRScanLogEntry[] = (() => {
    const raw = scanLogsRaw as any
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    if (Array.isArray(raw.data)) return raw.data
    return []
  })()

  async function handleVerify() {
    if (!qrInput.trim()) return
    setVerifying(true); setVerifyError(null); setVerifyResult(null)
    try {
      const res = await campaignsApi.qrVerify(campaignId, {
        qrToken: qrInput.trim(),
        bookingReference: qrInput.trim(),
      }) as any
      const data = res?.data ?? res
      setVerifyResult(data)
      setRefreshKey(k => k + 1)
    } catch (e: any) {
      setVerifyError(e?.message ?? 'Verification failed.')
    } finally {
      setVerifying(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleVerify()
  }

  function handleClear() {
    setQrInput(''); setVerifyResult(null); setVerifyError(null)
  }

  const scanResultColor = (r: string) => {
    if (r === 'VALID') return 'success'
    if (['PAYMENT_PENDING', 'ALREADY_CHECKED_IN', 'WRONG_SESSION'].includes(r)) return 'warning'
    return 'danger'
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-0 fw-bold">Field Operations</h4>
          <nav aria-label="breadcrumb" className="small text-muted">
            <Link href="/campaigns">Campaigns</Link> &rsaquo; <Link href={`/campaigns/${campaignId}`}>Detail</Link> &rsaquo; Field Ops
          </nav>
        </div>
        <div className="d-flex gap-2">
          <Link href={`/campaigns/${campaignId}/staff`} className="btn btn-outline-secondary btn-sm">
            <Icon icon="solar:users-group-two-rounded-bold" className="me-1" />Staff
          </Link>
          <Link href={`/campaigns/${campaignId}/doctors`} className="btn btn-outline-secondary btn-sm">
            <Icon icon="solar:stethoscope-bold" className="me-1" />Doctors
          </Link>
          <Button variant="outline-primary" size="sm" onClick={() => setRefreshKey(k => k + 1)}>
            <Icon icon="solar:restart-bold" className="me-1" />Refresh Stats
          </Button>
        </div>
      </div>

      {/* Stats row */}
      {stats && (
        <Row className="g-3 mb-4">
          <Col xs={6} md={3} lg={2}>
            <StatCard label="Total Bookings" value={stats.totalBookings} icon="solar:ticket-bold" color="primary" />
          </Col>
          <Col xs={6} md={3} lg={2}>
            <StatCard label="Paid" value={stats.paidBookings} icon="solar:wallet-bold" color="success" />
          </Col>
          <Col xs={6} md={3} lg={2}>
            <StatCard label="Checked In" value={stats.checkedIn} icon="solar:check-circle-bold" color="info" />
          </Col>
          <Col xs={6} md={3} lg={2}>
            <StatCard label="Vaccinated" value={stats.vaccinated} icon="solar:syringe-bold" color="success" />
          </Col>
          <Col xs={6} md={3} lg={2}>
            <StatCard label="Certs Issued" value={stats.certIssued} icon="solar:diploma-bold" color="warning" />
          </Col>
          <Col xs={6} md={3} lg={2}>
            <StatCard label="Pending Payment" value={stats.pendingPayment} icon="solar:clock-circle-bold" color="danger" />
          </Col>
        </Row>
      )}
      {loadingStats && !stats && (
        <div className="text-center py-3 text-muted small"><Spinner size="sm" className="me-2" />Loading stats…</div>
      )}

      {/* QR / Reference Verify */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-white border-bottom py-3">
          <h5 className="mb-0 fw-bold"><Icon icon="solar:qr-code-bold" className="me-2 text-primary" />Scan / Verify Booking</h5>
        </Card.Header>
        <Card.Body>
          <InputGroup className="mb-3" style={{ maxWidth: 600 }}>
            <Form.Control
              type="text"
              placeholder="Enter QR token or booking reference number..."
              value={qrInput}
              onChange={e => setQrInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              size="lg"
              style={{ fontSize: '1.1rem' }}
            />
            {qrInput && (
              <Button variant="outline-secondary" onClick={handleClear} title="Clear">
                <Icon icon="solar:close-circle-bold" />
              </Button>
            )}
            <Button variant="primary" onClick={handleVerify} disabled={verifying || !qrInput.trim()} style={{ minWidth: 120 }}>
              {verifying ? <Spinner size="sm" /> : <><Icon icon="solar:magnifer-bold" className="me-1" />Verify</>}
            </Button>
          </InputGroup>
          <div className="text-muted small">Paste QR code token or booking reference. Press Enter to verify.</div>

          {verifyError && (
            <Alert variant="danger" className="mt-3 d-flex align-items-center gap-2">
              <Icon icon="solar:close-circle-bold" style={{ fontSize: 20, flexShrink: 0 }} />
              <span>{verifyError}</span>
            </Alert>
          )}

          {verifyResult && (
            <div className="mt-4">
              {/* Scan result banner */}
              <Alert variant={
                verifyResult.scanResult === 'VALID' ? 'success'
                  : ['PAYMENT_PENDING', 'ALREADY_CHECKED_IN'].includes(verifyResult.scanResult) ? 'warning'
                    : 'danger'
              } className="d-flex align-items-center gap-2 mb-3">
                <Icon icon={verifyResult.scanResult === 'VALID' ? 'solar:check-circle-bold' : 'solar:danger-triangle-bold'} style={{ fontSize: 24 }} />
                <div>
                  <strong>Scan result: <StatusBadge status={verifyResult.scanResult} /></strong>
                  {!verifyResult.isPaid && <span className="ms-2 badge bg-danger">Payment Pending</span>}
                </div>
              </Alert>

              {/* Owner + session info */}
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Card className="border-0 bg-light h-100">
                    <Card.Body className="py-2">
                      <div className="small text-muted mb-1 fw-semibold text-uppercase">Owner</div>
                      <div className="fw-bold">{verifyResult.owner?.name}</div>
                      <div className="text-muted small">{verifyResult.owner?.phoneMasked}</div>
                      <div className="text-muted small">{verifyResult.owner?.emailMasked}</div>
                      <div className="mt-1">
                        <span className="badge bg-secondary-subtle text-secondary me-1">Booking: {verifyResult.bookingNumber}</span>
                        <StatusBadge status={verifyResult.overallStatus} />
                        {!verifyResult.isPaid && <span className="ms-1 badge bg-danger">Unpaid</span>}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 bg-light h-100">
                    <Card.Body className="py-2">
                      <div className="small text-muted mb-1 fw-semibold text-uppercase">Session</div>
                      <div className="fw-bold">{verifyResult.session?.venue?.name}</div>
                      <div className="text-muted small">{verifyResult.session?.venue?.address}</div>
                      <div className="text-muted small">
                        {verifyResult.session && dayjs(verifyResult.session.sessionDate).format('DD MMM YYYY')} ·{' '}
                        {verifyResult.session?.startTime} – {verifyResult.session?.endTime}
                      </div>
                      {verifyResult.assignedDoctors?.length > 0 && (
                        <div className="mt-1 small text-muted">
                          Doctors: {verifyResult.assignedDoctors.map(d => d.name).join(', ')}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* No signing doctor warning */}
              {verifyResult.assignedDoctors?.length === 0 && (
                <Alert variant="warning" className="d-flex align-items-center gap-2 py-2 small mb-3">
                  <Icon icon="solar:danger-triangle-bold" style={{ fontSize: 18, flexShrink: 0 }} />
                  <span>No signing doctor assigned to this session. Certificates cannot be issued. </span>
                  <Link href={`/campaigns/${campaignId}/doctors`} className="ms-1 text-warning-emphasis fw-bold">Assign doctor →</Link>
                </Alert>
              )}

              {/* Per-pet bookings */}
              <h6 className="fw-bold mb-2">Pet Bookings ({verifyResult.petBookings?.length ?? 0})</h6>
              {(verifyResult.petBookings ?? []).map((pet: QRVerifyPetBooking) => (
                <Card key={pet.id} className={`mb-3 border-2 ${pet.status === 'cancelled' ? 'border-danger opacity-75' : pet.status === 'vaccinated' || pet.status === 'certificate_issued' ? 'border-success' : pet.status === 'checked_in' ? 'border-primary' : 'border-secondary'}`}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span className="fw-bold fs-6">{pet.pet?.name}</span>
                        <span className="ms-2 text-muted small">{pet.pet?.petType}{pet.pet?.breed ? ` · ${pet.pet.breed}` : ''}</span>
                      </div>
                      <StatusBadge status={pet.status} />
                    </div>

                    {/* Services */}
                    {pet.services?.length > 0 && (
                      <div className="mb-2 small">
                        {pet.services.map(s => (
                          <span key={s.id} className={`badge me-1 ${s.administered ? 'bg-success-subtle text-success' : 'bg-light text-secondary border'}`}>
                            {s.administered && <Icon icon="solar:check-circle-bold" className="me-1" />}
                            {s.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Cert info */}
                    {pet.certificate && (
                      <div className="small text-success mb-2">
                        <Icon icon="solar:diploma-bold" className="me-1" />
                        Cert #{pet.certificate.certificateNumber} · Issued {dayjs(pet.certificate.issuedAt).format('DD MMM YYYY')}
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="small text-muted d-flex flex-wrap gap-3 mb-2">
                      {pet.checkedInAt && <span><Icon icon="solar:check-circle-bold" className="me-1 text-primary" />Checked in {dayjs(pet.checkedInAt).format('HH:mm')}</span>}
                      {pet.vaccinatedAt && <span><Icon icon="solar:syringe-bold" className="me-1 text-success" />Vaccinated {dayjs(pet.vaccinatedAt).format('HH:mm')}</span>}
                    </div>

                    {/* Action buttons */}
                    {pet.status !== 'cancelled' && (
                      <PetActionButtons
                        campaignId={campaignId}
                        pet={pet}
                        verifyResult={verifyResult}
                        onAction={() => setRefreshKey(k => k + 1)}
                      />
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Scan Logs */}
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold"><Icon icon="solar:history-bold" className="me-2 text-secondary" />Recent QR Scan Logs</h5>
          <Link href={`/campaigns/${campaignId}/qr-logs`} className="btn btn-outline-secondary btn-sm">
            View All
          </Link>
        </Card.Header>
        <Card.Body className="p-0">
          <LoadingOverlay loading={loadingLogs}>
            <Table hover responsive className="align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Time</th>
                  <th>Result</th>
                  <th>Scanned By</th>
                  <th>Pet</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {scanLogs.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4 text-muted">No scan logs yet</td></tr>
                ) : scanLogs.map((log: QRScanLogEntry) => (
                  <tr key={log.id}>
                    <td className="text-nowrap">{dayjs(log.createdAt).format('DD MMM HH:mm')}</td>
                    <td><StatusBadge status={log.scanResult} /></td>
                    <td>{log.scannedBy?.name ?? '—'}</td>
                    <td>{log.petBooking?.pet?.name ?? <span className="text-muted">—</span>}</td>
                    <td className="text-muted">{log.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </LoadingOverlay>
        </Card.Body>
      </Card>
    </div>
  )
}
