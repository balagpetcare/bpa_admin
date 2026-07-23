'use client'

import { useCallback, useState } from 'react'
import React from 'react'
import { Alert, Card, Button, Row, Col, Badge, Table, ProgressBar } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import CampaignStatusBadge from '../../components/CampaignStatusBadge'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { campaignsApi } from '@/lib/api/campaigns.api'
import type { ApiError } from '@/lib/api'
import type { CampaignDetail, CampaignLiveStats, CampaignSessionStat } from '@/types/bpa.types'
import dayjs from 'dayjs'

const LIFECYCLE_ACTIONS = [
  { status: 'draft', action: 'publish', label: 'Publish Campaign', variant: 'success', icon: 'solar:rocket-bold-duotone' },
  { status: 'published', action: 'openRegistration', label: 'Open Registration', variant: 'primary', icon: 'solar:play-bold-duotone' },
  { status: 'registration_open', action: 'closeRegistration', label: 'Close Registration', variant: 'warning', icon: 'solar:stop-bold-duotone' },
  { status: 'registration_closed', action: 'complete', label: 'Mark Completed', variant: 'info', icon: 'solar:check-read-bold-duotone' },
]

function fmt(n: number) {
  return n.toLocaleString()
}
function fmtBdt(n: number) {
  return `৳${n.toLocaleString()}`
}

// ─── KPI card ────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: React.ReactNode
  icon: string
  variant: string
  sub?: string
}
function KpiCard({ label, value, icon, variant, sub }: KpiCardProps) {
  return (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Body className="p-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className={`avatar-sm bg-soft-${variant} rounded d-flex align-items-center justify-content-center`} style={{ width: 38, height: 38 }}>
            <Icon icon={icon} className={`fs-20 text-${variant}`} />
          </div>
        </div>
        <h4 className="mt-1 mb-0 fw-bold">{value}</h4>
        {sub && <div className="text-muted small">{sub}</div>}
        <p className="text-muted mb-0 small text-uppercase fw-semibold mt-1">{label}</p>
      </Card.Body>
    </Card>
  )
}

// ─── Payment breakdown mini card ─────────────────────────────────

function PayCard({ label, count, amount, variant, icon }: { label: string; count: number; amount?: number; variant: string; icon: string }) {
  return (
    <div
      className={`border border-${variant} border-opacity-25 rounded p-3 text-center h-100`}
      style={{ background: `var(--bs-${variant}-bg-subtle, #f8f9fa)` }}>
      <Icon icon={icon} className={`fs-24 text-${variant} mb-2`} />
      <div className="fw-bold fs-5">{fmt(count)}</div>
      {amount !== undefined && <div className={`small fw-semibold text-${variant}`}>{fmtBdt(amount)}</div>}
      <div className="text-muted small text-uppercase fw-semibold mt-1">{label}</div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────

export default function CampaignDetailContent({ campaignId }: { campaignId: string }) {
  const { can } = usePermission()
  const { mutate } = useApiMutation<unknown, unknown>()
  const [reopenError, setReopenError] = useState<string | null>(null)

  const fetchFn = useCallback(() => campaignsApi.getById(campaignId), [campaignId])
  const { data: campaign, loading, error, refetch } = useApi<CampaignDetail>(fetchFn, [campaignId])

  async function handleLifecycle(action: string) {
    const map: Record<string, (id: string) => Promise<unknown>> = {
      publish: campaignsApi.publish,
      openRegistration: campaignsApi.openRegistration,
      closeRegistration: campaignsApi.closeRegistration,
      complete: campaignsApi.complete,
    }
    await mutate(() => map[action](campaignId), undefined)
    refetch()
  }

  async function handleCancel() {
    if (!confirm('Cancel this campaign? This action cannot be undone.')) return
    await mutate(() => campaignsApi.cancel(campaignId), undefined)
    refetch()
  }

  async function handleReopen() {
    if (!confirm('Reopen this campaign? Status will change to Registration Open.')) return
    setReopenError(null)
    try {
      await campaignsApi.reopen(campaignId)
      refetch()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setReopenError(
        msg.includes('registration close date') || msg.includes('close date')
          ? 'Please update the registration close date before reopening.'
          : msg || 'Failed to reopen campaign.',
      )
    }
  }

  if (loading)
    return (
      <LoadingOverlay loading>
        <div style={{ minHeight: 400 }} />
      </LoadingOverlay>
    )
  if (error)
    return (
      <div className="p-4">
        <ApiErrorAlert error={error as ApiError} />
      </div>
    )
  if (!campaign) return null

  const nextAction = LIFECYCLE_ACTIONS.find((a) => a.status === campaign.status)
  const s: CampaignLiveStats | null = campaign.stats ?? null

  // Fallback counts for when stats are loading / missing
  const totalReg = s?.totalRegistrations ?? campaign._count.registrations ?? 0
  const totalPets = s?.totalPets ?? 0
  const paidCount = s?.paidCount ?? 0
  const paidAmount = s?.paidAmount ?? 0
  const pendingCount = s?.pendingCount ?? 0
  const pendingAmount = s?.pendingAmount ?? 0
  const failedCount = s?.failedCount ?? 0
  const cancelledCount = s?.cancelledCount ?? 0
  const checkedIn = s?.checkedInCount ?? 0
  const vaccinated = s?.vaccinatedCount ?? 0
  const certificates = s?.certificateIssuedCount ?? 0
  const waitlist = s?.waitlistCount ?? 0
  const fillPct = s?.fillPercent ?? 0
  const totalCap = s?.totalCapacity ?? (campaign.sessions ?? []).reduce((a, ss) => a + (ss.capacity ?? 0), 0)
  const usedCap = s?.usedCapacity ?? totalReg
  const remainingCap = s?.remainingCapacity ?? Math.max(0, totalCap - usedCap)

  const sessionStats: CampaignSessionStat[] = s?.sessionStats ?? []

  return (
    <div className="container-fluid pb-4">
      <PageHeader
        title={campaign.title}
        breadcrumbs={[{ label: 'Campaign Management' }, { label: 'Campaigns', href: '/campaigns' }, { label: campaign.title }]}
        action={
          <div className="d-flex gap-2 flex-wrap">
            {nextAction && can('campaigns:lifecycle') && (
              <Button variant={nextAction.variant} onClick={() => handleLifecycle(nextAction.action)} className="d-flex align-items-center gap-1">
                <Icon icon={nextAction.icon} className="fs-18" />
                {nextAction.label}
              </Button>
            )}
            {can('campaigns:update') && (
              <Link href={`/campaigns/${campaignId}/edit`} className="btn btn-outline-primary d-flex align-items-center gap-1">
                <Icon icon="solar:pen-bold-duotone" className="fs-18" />
                Edit
              </Link>
            )}
            {['registration_closed', 'completed'].includes(campaign.status) && can('campaigns:lifecycle') && (
              <Button variant="outline-warning" onClick={handleReopen} className="d-flex align-items-center gap-1">
                <Icon icon="solar:refresh-bold-duotone" className="fs-18" />
                Reopen
              </Button>
            )}
            {!['completed', 'cancelled'].includes(campaign.status) && can('campaigns:lifecycle') && (
              <Button variant="outline-danger" onClick={handleCancel} className="d-flex align-items-center gap-1">
                <Icon icon="solar:trash-bin-trash-bold-duotone" className="fs-18" />
                Cancel
              </Button>
            )}
          </div>
        }
      />

      {reopenError && (
        <Alert variant="danger" dismissible onClose={() => setReopenError(null)} className="mb-3">
          {reopenError}
        </Alert>
      )}

      {/* ─── KPI Cards ─────────────────────────────────────────────── */}
      <Row className="g-3 mb-4">
        <Col xl={2} lg={3} sm={6}>
          <KpiCard label="Status" value={<CampaignStatusBadge status={campaign.status} />} icon="solar:info-circle-bold-duotone" variant="primary" />
        </Col>
        <Col xl={2} lg={3} sm={6}>
          <KpiCard
            label="Total Bookings"
            value={fmt(totalReg)}
            icon="solar:clipboard-list-bold-duotone"
            variant="warning"
            sub={`${fmt(campaign._count?.sessions ?? campaign.sessions?.length ?? 0)} sessions`}
          />
        </Col>
        <Col xl={2} lg={3} sm={6}>
          <KpiCard label="Total Pets" value={fmt(totalPets)} icon="solar:pet-bold-duotone" variant="info" />
        </Col>
        <Col xl={2} lg={3} sm={6}>
          <KpiCard label="Paid" value={fmt(paidCount)} icon="solar:check-circle-bold-duotone" variant="success" sub={fmtBdt(paidAmount)} />
        </Col>
        <Col xl={2} lg={3} sm={6}>
          <KpiCard
            label="Pending Payment"
            value={fmt(pendingCount)}
            icon="solar:clock-circle-bold-duotone"
            variant="warning"
            sub={fmtBdt(pendingAmount)}
          />
        </Col>
        <Col xl={2} lg={3} sm={6}>
          <KpiCard
            label="Cancelled / Failed"
            value={fmt(cancelledCount + failedCount)}
            icon="solar:close-circle-bold-duotone"
            variant="danger"
            sub={`${fmt(cancelledCount)} cancelled · ${fmt(failedCount)} failed`}
          />
        </Col>
        <Col xl={2} lg={3} sm={6}>
          <KpiCard label="Total Collected" value={fmtBdt(paidAmount)} icon="solar:wad-of-money-bold-duotone" variant="success" />
        </Col>
        <Col xl={2} lg={3} sm={6}>
          <KpiCard label="Checked-In" value={fmt(checkedIn)} icon="solar:qr-code-bold-duotone" variant="info" />
        </Col>
        <Col xl={2} lg={3} sm={6}>
          <KpiCard label="Vaccinated" value={fmt(vaccinated)} icon="solar:syringe-bold-duotone" variant="primary" />
        </Col>
        <Col xl={2} lg={3} sm={6}>
          <KpiCard label="Certificates" value={fmt(certificates)} icon="solar:document-text-bold-duotone" variant="secondary" />
        </Col>
        <Col xl={2} lg={3} sm={6}>
          <KpiCard label="Waitlist" value={fmt(waitlist)} icon="solar:list-bold-duotone" variant="dark" />
        </Col>
        <Col xl={2} lg={3} sm={6}>
          <KpiCard
            label="Campaign Fee / Pet"
            value={fmtBdt(Number(campaign.basePriceBdt ?? 0))}
            icon="solar:tag-price-bold-duotone"
            variant="success"
          />
        </Col>
      </Row>

      {/* ─── Payment Breakdown + Capacity ──────────────────────────── */}
      <Row className="g-4 mb-4">
        <Col lg={7}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <Icon icon="solar:bill-list-bold-duotone" className="text-success" />
                Payment Breakdown
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col sm={6} lg={3}>
                  <PayCard label="Paid" count={paidCount} amount={paidAmount} variant="success" icon="solar:check-circle-bold-duotone" />
                </Col>
                <Col sm={6} lg={3}>
                  <PayCard label="Pending" count={pendingCount} amount={pendingAmount} variant="warning" icon="solar:clock-circle-bold-duotone" />
                </Col>
                <Col sm={6} lg={3}>
                  <PayCard label="Failed" count={failedCount} variant="danger" icon="solar:close-circle-bold-duotone" />
                </Col>
                <Col sm={6} lg={3}>
                  <PayCard label="Cancelled" count={cancelledCount} variant="secondary" icon="solar:forbidden-circle-bold-duotone" />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <Icon icon="solar:users-group-two-rounded-bold-duotone" className="text-primary" />
                Capacity Utilisation
              </h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column justify-content-center gap-3">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-semibold text-muted text-uppercase">Fill Rate</span>
                  <span className="fw-bold fs-5">{fillPct}%</span>
                </div>
                <ProgressBar now={fillPct} variant={fillPct >= 90 ? 'danger' : fillPct >= 70 ? 'warning' : 'success'} style={{ height: 10 }} />
              </div>
              <Row className="g-2 text-center">
                <Col xs={4}>
                  <div className="bg-light rounded p-2">
                    <div className="fw-bold fs-5">{fmt(totalCap)}</div>
                    <div className="text-muted small">Total</div>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="bg-light rounded p-2">
                    <div className="fw-bold fs-5 text-primary">{fmt(usedCap)}</div>
                    <div className="text-muted small">Used</div>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="bg-light rounded p-2">
                    <div className="fw-bold fs-5 text-success">{fmt(remainingCap)}</div>
                    <div className="text-muted small">Remaining</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* ─── Left column ─────────────────────────────────────────── */}
        <Col lg={8}>
          {/* Campaign Details */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <Icon icon="solar:document-text-bold-duotone" className="text-primary" />
                Campaign Details
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-4">
                <Col md={6}>
                  <div className="d-flex flex-column gap-3">
                    <div>
                      <label className="text-muted small fw-semibold text-uppercase mb-1 d-block">Campaign Dates</label>
                      <div className="d-flex align-items-center gap-2">
                        <Icon icon="solar:calendar-date-bold-duotone" className="text-primary" />
                        <span>
                          {dayjs(campaign.startDate).format('MMM D, YYYY')} — {dayjs(campaign.endDate).format('MMM D, YYYY')}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-muted small fw-semibold text-uppercase mb-1 d-block">Registration Window</label>
                      <div className="d-flex align-items-center gap-2">
                        <Icon icon="solar:user-plus-bold-duotone" className="text-success" />
                        <span>
                          {campaign.registrationOpenAt ? dayjs(campaign.registrationOpenAt).format('MMM D') : 'N/A'} —{' '}
                          {campaign.registrationCloseAt ? dayjs(campaign.registrationCloseAt).format('MMM D, YYYY') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex flex-column gap-3">
                    <div>
                      <label className="text-muted small fw-semibold text-uppercase mb-1 d-block">Booking Rules</label>
                      <div className="d-flex align-items-center gap-2">
                        <Icon icon="solar:settings-bold-duotone" className="text-info" />
                        <span>Max {campaign.maxPetsPerBooking} pets per booking</span>
                      </div>
                    </div>
                    {campaign.sessions?.[0]?.venue && (
                      <div>
                        <label className="text-muted small fw-semibold text-uppercase mb-1 d-block">Primary Venue</label>
                        <div className="d-flex align-items-center gap-2">
                          <Icon icon="solar:map-point-bold-duotone" className="text-danger" />
                          <span>{campaign.sessions[0].venue.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Col>
                {campaign.description && (
                  <Col xs={12}>
                    <div className="bg-light p-3 rounded">
                      <label className="text-muted small fw-semibold text-uppercase mb-2 d-block">Description</label>
                      <div style={{ fontSize: '1.05rem', lineHeight: '1.7', color: '#334155' }}>{campaign.description}</div>
                    </div>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>

          {/* Session Summary Table */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <Icon icon="solar:calendar-bold-duotone" className="text-primary" />
                Session Summary
              </h5>
              <Link href={`/campaigns/${campaignId}/sessions`} className="btn btn-sm btn-soft-primary">
                Manage
              </Link>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="align-middle mb-0 small">
                  <thead className="bg-light text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>
                    <tr>
                      <th className="ps-3">Date · Venue</th>
                      <th className="text-center">Cap</th>
                      <th className="text-center">Bookings</th>
                      <th className="text-center">Pets</th>
                      <th className="text-center">Paid</th>
                      <th className="text-center">Pending</th>
                      <th className="text-center">Cancelled</th>
                      <th className="text-center">Remaining</th>
                      <th className="text-center pe-3">Fill</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(campaign.sessions?.length ?? 0) === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-5 text-muted">
                          No sessions scheduled yet
                        </td>
                      </tr>
                    ) : sessionStats.length > 0 ? (
                      sessionStats.map((ss) => {
                        const fill = ss.capacity > 0 ? Math.round((ss.totalBookings / ss.capacity) * 100) : 0
                        return (
                          <tr key={ss.sessionId}>
                            <td className="ps-3">
                              <div className="fw-semibold">{dayjs(ss.sessionDate).format('ddd, MMM D')}</div>
                              <div className="text-muted">
                                {ss.startTime} — {ss.endTime}
                              </div>
                              <div className="text-muted">{ss.venueName || '—'}</div>
                            </td>
                            <td className="text-center fw-semibold">{fmt(ss.capacity)}</td>
                            <td className="text-center">{fmt(ss.totalBookings)}</td>
                            <td className="text-center">{fmt(ss.totalPets)}</td>
                            <td className="text-center">
                              <Badge bg="success-subtle" text="success">
                                {fmt(ss.paidCount)}
                              </Badge>
                            </td>
                            <td className="text-center">
                              <Badge bg="warning-subtle" text="warning">
                                {fmt(ss.pendingCount)}
                              </Badge>
                            </td>
                            <td className="text-center">
                              <Badge bg="danger-subtle" text="danger">
                                {fmt(ss.cancelledCount)}
                              </Badge>
                            </td>
                            <td className="text-center fw-semibold text-success">{fmt(ss.remaining)}</td>
                            <td className="text-center pe-3">
                              <div className="d-flex align-items-center gap-1">
                                <div className="progress flex-grow-1" style={{ height: 5, minWidth: 40 }}>
                                  <div className={`progress-bar bg-${fill >= 90 ? 'danger' : 'success'}`} style={{ width: `${fill}%` }} />
                                </div>
                                <span>{fill}%</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      campaign.sessions.map((s: any) => {
                        const fill = s.capacity > 0 ? Math.round((s.bookedCount / s.capacity) * 100) : 0
                        return (
                          <tr key={s.id}>
                            <td className="ps-3">
                              <div className="fw-semibold">{dayjs(s.sessionDate).format('ddd, MMM D')}</div>
                              <div className="text-muted">
                                {s.startTime} — {s.endTime}
                              </div>
                              <div className="text-muted">{s.venue?.name ?? '—'}</div>
                            </td>
                            <td className="text-center fw-semibold">{fmt(s.capacity)}</td>
                            <td className="text-center">{fmt(s.bookedCount)}</td>
                            <td className="text-center">—</td>
                            <td className="text-center">—</td>
                            <td className="text-center">—</td>
                            <td className="text-center">—</td>
                            <td className="text-center fw-semibold text-success">{fmt(Math.max(0, s.capacity - s.bookedCount))}</td>
                            <td className="text-center pe-3">
                              <div className="d-flex align-items-center gap-1">
                                <div className="progress flex-grow-1" style={{ height: 5, minWidth: 40 }}>
                                  <div className={`progress-bar bg-${fill >= 90 ? 'danger' : 'success'}`} style={{ width: `${fill}%` }} />
                                </div>
                                <span>{fill}%</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* ─── Management Menu ─────────────────────────────────────── */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm sticky-top" style={{ top: 'calc(var(--bs-topbar-height, 70px) + 1.5rem)' }}>
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <Icon icon="solar:settings-bold-duotone" className="text-primary" />
                Management Menu
              </h5>
            </Card.Header>
            <Card.Body className="p-2">
              <div className="nav flex-column nav-pills campaign-mgmt-nav">
                <div className="px-3 py-1 text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>
                  Operations
                </div>
                <MgmtLink
                  href={`/campaigns/${campaignId}/registrations`}
                  icon="solar:clipboard-list-bold-duotone"
                  label="Registrations"
                  variant="primary"
                  count={totalReg}
                />
                <MgmtLink
                  href={`/campaigns/${campaignId}/participants`}
                  icon="solar:users-group-two-rounded-bold-duotone"
                  label="Participants & Payments"
                  variant="success"
                  badge="New"
                />
                <MgmtLink
                  href={`/campaigns/${campaignId}/waitlist`}
                  icon="solar:clock-circle-bold-duotone"
                  label="Waitlist"
                  variant="warning"
                  count={waitlist}
                />
                <MgmtLink
                  href={`/campaigns/${campaignId}/checkin`}
                  icon="solar:qr-code-bold-duotone"
                  label="Check-In / Vaccinate"
                  variant="success"
                />

                <hr className="my-2 mx-3 opacity-10" />
                <div className="px-3 py-1 text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>
                  Export & SMS
                </div>
                <MgmtLink
                  href={`/campaigns/${campaignId}/export`}
                  icon="solar:file-download-bold-duotone"
                  label="Export Center"
                  variant="info"
                  badge="CSV · XLSX"
                />
                <MgmtLink
                  href={`/campaigns/${campaignId}/bulk-sms`}
                  icon="solar:chat-round-like-bold-duotone"
                  label="Bulk SMS Center"
                  variant="primary"
                  badge="New"
                />

                <hr className="my-2 mx-3 opacity-10" />
                <div className="px-3 py-1 text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>
                  Campaign Setup
                </div>
                <MgmtLink href={`/campaigns/${campaignId}/edit`} icon="solar:pen-bold-duotone" label="Edit Campaign Details" variant="primary" />
                <MgmtLink
                  href={`/campaigns/${campaignId}/sessions`}
                  icon="solar:calendar-bold-duotone"
                  label="Sessions"
                  count={campaign._count.sessions ?? campaign.sessions?.length}
                />
                <MgmtLink
                  href={`/campaigns/${campaignId}/services`}
                  icon="solar:sticker-square-bold-duotone"
                  label="Services"
                  count={campaign._count.services ?? campaign.services?.length}
                />
                <MgmtLink
                  href={`/campaigns/${campaignId}/doctors`}
                  icon="solar:stethoscope-bold-duotone"
                  label="Doctors"
                  count={campaign._count.doctors ?? campaign.doctors?.length}
                />
                <MgmtLink
                  href={`/campaigns/${campaignId}/coverage-areas`}
                  icon="solar:map-point-wave-bold-duotone"
                  label="Coverage Areas"
                  variant="success"
                />
                <MgmtLink href={`/campaigns/${campaignId}/staff`} icon="solar:users-group-two-rounded-bold-duotone" label="Staff & Volunteers" />

                <hr className="my-2 mx-3 opacity-10" />
                <div className="px-3 py-1 text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>
                  Monitoring
                </div>
                <MgmtLink
                  href={`/campaigns/${campaignId}/field-ops`}
                  icon="solar:play-stream-bold-duotone"
                  label="Field Operations"
                  variant="success"
                />
                <MgmtLink
                  href={`/campaigns/${campaignId}/vaccination`}
                  icon="solar:syringe-bold-duotone"
                  label="Vaccination Records"
                  variant="secondary"
                />
                <MgmtLink
                  href={`/campaigns/${campaignId}/certificates`}
                  icon="solar:document-text-bold-duotone"
                  label="Certificates"
                  variant="dark"
                />
                <MgmtLink href={`/campaigns/${campaignId}/analytics`} icon="solar:chart-bold-duotone" label="Analytics" variant="primary" />

                <hr className="my-2 mx-3 opacity-10" />
                <MgmtLink href={`/campaigns/${campaignId}/media`} icon="solar:gallery-bold-duotone" label="Media Gallery" variant="info" />
                <MgmtLink href={`/campaigns/${campaignId}/faqs`} icon="solar:question-circle-bold-duotone" label="FAQs" variant="primary" />
                <MgmtLink href={`/campaigns/${campaignId}/qr-logs`} icon="solar:qr-code-bold-duotone" label="QR Scan Logs" variant="dark" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx global>{`
        .campaign-mgmt-nav .nav-link {
          display: flex;
          align-items: center;
          padding: 0.65rem 1rem;
          margin: 0.15rem 0.5rem;
          border-radius: 0.5rem;
          color: #5d7186;
          font-weight: 500;
          transition: all 0.15s;
        }
        .campaign-mgmt-nav .nav-link:hover {
          background-color: #f1f5f9;
          color: #1e293b;
          transform: translateX(3px);
        }
        .campaign-mgmt-nav .nav-icon {
          margin-right: 0.7rem;
          font-size: 1.15rem;
          opacity: 0.8;
        }
        .campaign-mgmt-nav .nav-link:hover .nav-icon {
          opacity: 1;
        }
      `}</style>
    </div>
  )
}

function MgmtLink({
  href,
  icon,
  label,
  variant = 'primary',
  count,
  badge,
}: {
  href: string
  icon: string
  label: string
  variant?: string
  count?: number
  badge?: string
}) {
  return (
    <Link href={href} className="nav-link">
      <Icon icon={icon} className={`nav-icon text-${variant}`} />
      <span className="flex-grow-1">{label}</span>
      {count !== undefined && (
        <Badge bg="light" text="dark" className="border ms-1">
          {count}
        </Badge>
      )}
      {badge && (
        <Badge bg={`${variant}-subtle`} text={variant} className="ms-1" style={{ fontSize: '0.65rem' }}>
          {badge}
        </Badge>
      )}
    </Link>
  )
}
