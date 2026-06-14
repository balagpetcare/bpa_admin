'use client'

import { useCallback, useState } from 'react'
import { Alert, Card, Button, Row, Col, Badge, Table } from 'react-bootstrap'
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
import type { CampaignSession, CampaignService } from '@/types/bpa.types'
import dayjs from 'dayjs'

const LIFECYCLE_ACTIONS: { status: string; action: string; label: string; variant: string; icon: string }[] = [
  { status: 'draft', action: 'publish', label: 'Publish Campaign', variant: 'success', icon: 'solar:rocket-bold-duotone' },
  { status: 'published', action: 'openRegistration', label: 'Open Registration', variant: 'primary', icon: 'solar:play-bold-duotone' },
  { status: 'registration_open', action: 'closeRegistration', label: 'Close Registration', variant: 'warning', icon: 'solar:stop-bold-duotone' },
  { status: 'registration_closed', action: 'complete', label: 'Mark Completed', variant: 'info', icon: 'solar:check-read-bold-duotone' },
]

export default function CampaignDetailContent({ campaignId }: { campaignId: string }) {
  const { can } = usePermission()
  const { mutate } = useApiMutation<unknown, unknown>()
  const [reopenError, setReopenError] = useState<string | null>(null)

  const fetchFn = useCallback(() => campaignsApi.getById(campaignId), [campaignId])
  const { data: campaign, loading, error, refetch } = useApi(fetchFn, [campaignId])

  async function handleLifecycle(action: string) {
    const lifecycleMap: Record<string, (id: string) => Promise<unknown>> = {
      publish: campaignsApi.publish,
      openRegistration: campaignsApi.openRegistration,
      closeRegistration: campaignsApi.closeRegistration,
      complete: campaignsApi.complete,
    }
    await mutate(() => lifecycleMap[action](campaignId), undefined)
    refetch()
  }

  async function handleCancel() {
    if (!confirm('Cancel this campaign? This action cannot be undone.')) return
    await mutate(() => campaignsApi.cancel(campaignId), undefined)
    refetch()
  }

  async function handleReopen() {
    if (!confirm('Are you sure you want to reopen this campaign? Status will change to Registration Open.')) return
    setReopenError(null)
    try {
      await campaignsApi.reopen(campaignId)
      refetch()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setReopenError(msg.includes('registration close date') || msg.includes('close date')
        ? 'Please update the registration close date before reopening.'
        : msg || 'Failed to reopen campaign.')
    }
  }

  if (loading) return <LoadingOverlay loading><div style={{ minHeight: 400 }} /></LoadingOverlay>
  if (error) return <div className="p-4"><ApiErrorAlert error={error as ApiError} /></div>
  if (!campaign) return null

  const nextAction = LIFECYCLE_ACTIONS.find(a => a.status === campaign.status)

  // Pricing summary
  const serviceList: CampaignService[] = campaign.services ?? []
  const servicesTotalBdt = serviceList.reduce((sum: number, s: CampaignService) => sum + (s.priceBdt ?? 0), 0)
  const campaignFeeBdt = Number(campaign.basePriceBdt ?? 0)
  const discountAmountBdt = servicesTotalBdt - campaignFeeBdt
  const discountPercent = servicesTotalBdt > 0 ? Math.round((discountAmountBdt / servicesTotalBdt) * 100) : 0
  const hasPricingSummary = servicesTotalBdt > 0

  const stats = [
    { label: 'Status', value: <CampaignStatusBadge status={campaign.status} />, icon: 'solar:info-circle-bold-duotone', variant: 'primary' },
    { label: 'Type', value: campaign.campaignType.replace('_', ' '), icon: 'solar:tag-bold-duotone', variant: 'info', capitalize: true },
    { label: 'Campaign Fee', value: `৳${campaignFeeBdt.toLocaleString()}`, icon: 'solar:wad-of-money-bold-duotone', variant: 'success' },
    { label: 'Registrations', value: campaign._count?.registrations ?? 0, icon: 'solar:users-group-two-rounded-bold-duotone', variant: 'warning' },
    { label: 'Sessions', value: campaign.sessions?.length ?? 0, icon: 'solar:calendar-bold-duotone', variant: 'danger' },
    { label: 'Total Capacity', value: (campaign.sessions as CampaignSession[])?.reduce((acc: number, s) => acc + s.capacity, 0) ?? 0, icon: 'solar:user-plus-bold-duotone', variant: 'secondary' },
  ]

  return (
    <div className="container-fluid pb-4">
      <PageHeader
        title={campaign.title}
        breadcrumbs={[{ label: 'Campaign Management' }, { label: 'Campaigns', href: '/campaigns' }, { label: campaign.title }]}
        action={
          <div className="d-flex gap-2">
            {nextAction && can('campaigns:lifecycle') && (
              <Button variant={nextAction.variant} onClick={() => handleLifecycle(nextAction.action)} className="d-flex align-items-center">
                <Icon icon={nextAction.icon} className="me-1 fs-18" />{nextAction.label}
              </Button>
            )}
            {can('campaigns:update') && (
              <Link href={`/campaigns/${campaignId}/edit`} className="btn btn-outline-primary d-flex align-items-center">
                <Icon icon="solar:pen-bold-duotone" className="me-1 fs-18" />Edit
              </Link>
            )}
            {['registration_closed', 'completed'].includes(campaign.status) && can('campaigns:lifecycle') && (
              <Button variant="outline-warning" onClick={handleReopen} className="d-flex align-items-center">
                <Icon icon="solar:refresh-bold-duotone" className="me-1 fs-18" />Reopen
              </Button>
            )}
            {!['completed', 'cancelled'].includes(campaign.status) && can('campaigns:lifecycle') && (
              <Button variant="outline-danger" onClick={handleCancel} className="d-flex align-items-center">
                <Icon icon="solar:trash-bin-trash-bold-duotone" className="me-1 fs-18" />Cancel
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

      {/* Summary Cards */}
      <Row className="g-3 mb-4">
        {stats.map((stat, i) => (
          <Col key={i} xl={2} lg={4} sm={6}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className={`avatar-sm bg-soft-${stat.variant} rounded`}>
                    <Icon icon={stat.icon} className={`fs-20 text-${stat.variant}`} />
                  </div>
                </div>
                <h4 className="mt-2 mb-1 fw-bold">{stat.value}</h4>
                <p className="text-muted mb-0 small text-uppercase fw-semibold">{stat.label}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Pricing Summary */}
      {hasPricingSummary && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-white border-bottom py-3">
            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
              <Icon icon="solar:tag-price-bold-duotone" className="text-success" />
              Pricing Summary
            </h5>
          </Card.Header>
          <Card.Body>
            <Row className="g-3 text-center">
              <Col sm={6} lg={3}>
                <div className="bg-light rounded p-3">
                  <div className="text-muted small fw-semibold text-uppercase mb-1">Services Total Value</div>
                  <div className="fs-4 fw-bold text-dark">৳{servicesTotalBdt.toLocaleString()}</div>
                  <div className="text-muted small">{serviceList.filter(s => (s.priceBdt ?? 0) > 0).length} priced service{serviceList.filter(s => (s.priceBdt ?? 0) > 0).length !== 1 ? 's' : ''}</div>
                </div>
              </Col>
              <Col sm={6} lg={3}>
                <div className="bg-light rounded p-3">
                  <div className="text-muted small fw-semibold text-uppercase mb-1">Campaign Fee / Pet</div>
                  <div className="fs-4 fw-bold text-success">৳{campaignFeeBdt.toLocaleString()}</div>
                  <div className="text-muted small">registration fee</div>
                </div>
              </Col>
              <Col sm={6} lg={3}>
                <div className="bg-light rounded p-3">
                  <div className="text-muted small fw-semibold text-uppercase mb-1">Discount Amount</div>
                  <div className={`fs-4 fw-bold ${discountAmountBdt > 0 ? 'text-danger' : 'text-muted'}`}>
                    {discountAmountBdt > 0 ? `৳${discountAmountBdt.toLocaleString()} OFF` : '৳0'}
                  </div>
                  <div className="text-muted small">per pet</div>
                </div>
              </Col>
              <Col sm={6} lg={3}>
                <div className="bg-light rounded p-3">
                  <div className="text-muted small fw-semibold text-uppercase mb-1">Discount %</div>
                  <div className={`fs-4 fw-bold ${discountPercent > 0 ? 'text-warning' : 'text-muted'}`}>
                    {discountPercent > 0 ? `${discountPercent}% OFF` : 'No discount'}
                  </div>
                  <div className="text-muted small">vs. market value</div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      <Row className="g-4">
        <Col lg={8}>
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
                        <span>{dayjs(campaign.startDate).format('MMM D, YYYY')} — {dayjs(campaign.endDate).format('MMM D, YYYY')}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-muted small fw-semibold text-uppercase mb-1 d-block">Registration Window</label>
                      <div className="d-flex align-items-center gap-2">
                        <Icon icon="solar:user-plus-bold-duotone" className="text-success" />
                        <span>
                          {campaign.registrationOpenAt ? dayjs(campaign.registrationOpenAt).format('MMM D') : 'N/A'} — {campaign.registrationCloseAt ? dayjs(campaign.registrationCloseAt).format('MMM D, YYYY') : 'N/A'}
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
                      <div 
                        className="description-content" 
                        style={{ 
                          fontSize: '1.05rem', 
                          lineHeight: '1.7',
                          color: '#334155'
                        }}
                      >
                        {campaign.description}
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>

          {/* Sessions Table */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <Icon icon="solar:calendar-bold-duotone" className="text-primary" />
                Sessions Schedule
              </h5>
              <Link href={`/campaigns/${campaignId}/sessions`} className="btn btn-sm btn-soft-primary">Manage Sessions</Link>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead className="bg-light text-muted small text-uppercase">
                    <tr>
                      <th className="ps-4">Date & Time</th>
                      <th>Venue</th>
                      <th>Registrations</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(campaign.sessions?.length ?? 0) === 0 ? (
                      <tr><td colSpan={4} className="text-center py-5 text-muted">No sessions scheduled yet</td></tr>
                    ) : (
                      campaign.sessions.map((s: any) => (
                        <tr key={s.id}>
                          <td className="ps-4">
                            <div className="fw-semibold">{dayjs(s.sessionDate).format('ddd, MMM D')}</div>
                            <div className="text-muted small">{s.startTime} — {s.endTime}</div>
                          </td>
                          <td>{s.venue?.name ?? <span className="text-muted italic">No venue assigned</span>}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="progress flex-grow-1" style={{ height: 6, maxWidth: 100 }}>
                                <div 
                                  className={`progress-bar bg-${(s.bookedCount / s.capacity) > 0.9 ? 'danger' : 'success'}`} 
                                  style={{ width: `${Math.min(100, (s.bookedCount / s.capacity) * 100)}%` }} 
                                />
                              </div>
                              <span className="small fw-medium">{s.bookedCount} / {s.capacity}</span>
                            </div>
                          </td>
                          <td className="text-center">
                            {s.bookedCount >= s.capacity ? <Badge bg="danger-subtle" text="danger">Full</Badge> : <Badge bg="success-subtle" text="success">Available</Badge>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm sticky-top" style={{ top: 'calc(var(--bs-topbar-height) + 1.5rem)' }}>
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <Icon icon="solar:settings-bold-duotone" className="text-primary" />
                Management Menu
              </h5>
            </Card.Header>
            <Card.Body className="p-2">
              <div className="nav flex-column nav-pills campaign-mgmt-nav">
                <MgmtLink href={`/campaigns/${campaignId}/edit`} icon="solar:pen-bold-duotone" label="Edit Campaign Details" variant="primary" />
                <MgmtLink href={`/campaigns/${campaignId}/registrations`} icon="solar:clipboard-list-bold-duotone" label="Registrations" variant="primary" />
                <MgmtLink href={`/campaigns/${campaignId}/waitlist`} icon="solar:clock-circle-bold-duotone" label="Waitlist" variant="warning" />
                <MgmtLink href={`/campaigns/${campaignId}/checkin`} icon="solar:qr-code-bold-duotone" label="Check-In / Vaccinate" variant="success" />
                <hr className="my-2 mx-3 opacity-10" />
                <MgmtLink href={`/campaigns/${campaignId}/sessions`} icon="solar:calendar-bold-duotone" label="Sessions" count={campaign.sessions?.length} />
                <MgmtLink href={`/campaigns/${campaignId}/services`} icon="solar:sticker-bold-duotone" label="Services" count={campaign.services?.length} />
                <MgmtLink href={`/campaigns/${campaignId}/doctors`} icon="solar:stethoscope-bold-duotone" label="Doctors" count={campaign.doctors?.length} />
                <MgmtLink href={`/campaigns/${campaignId}/volunteers`} icon="solar:hand-heart-bold-duotone" label="Volunteers" count={campaign.volunteers?.length} />
                <hr className="my-2 mx-3 opacity-10" />
                <MgmtLink href={`/campaigns/${campaignId}/media`} icon="solar:gallery-bold-duotone" label="Media Gallery" variant="info" />
                <MgmtLink href={`/campaigns/${campaignId}/vaccination`} icon="solar:syringe-bold-duotone" label="Vaccination Records" variant="secondary" />
                <MgmtLink href={`/campaigns/${campaignId}/certificates`} icon="solar:document-text-bold-duotone" label="Certificates" variant="dark" />
                <MgmtLink href={`/campaigns/${campaignId}/analytics`} icon="solar:chart-bold-duotone" label="Analytics" variant="primary" />
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
          padding: 0.75rem 1rem;
          margin: 0.2rem 0.5rem;
          border-radius: 0.5rem;
          color: #5d7186;
          font-weight: 500;
          transition: all 0.2s;
        }
        .campaign-mgmt-nav .nav-link:hover {
          background-color: #f1f5f9;
          color: #1e293b;
          transform: translateX(4px);
        }
        .campaign-mgmt-nav .nav-link .nav-icon {
          margin-right: 0.75rem;
          font-size: 1.25rem;
          opacity: 0.8;
        }
        .campaign-mgmt-nav .nav-link:hover .nav-icon {
          opacity: 1;
        }
      `}</style>
    </div>
  )
}

function MgmtLink({ href, icon, label, variant = 'primary', count }: { href: string; icon: string; label: string; variant?: string; count?: number }) {
  return (
    <Link href={href} className="nav-link">
      <Icon icon={icon} className={`nav-icon text-${variant}`} />
      <span className="flex-grow-1">{label}</span>
      {count !== undefined && <Badge bg="light" text="dark" className="border">{count}</Badge>}
    </Link>
  )
}
