'use client'

import { useCallback, useState } from 'react'
import { Row, Col, Card, Badge, Spinner, Button, Table, ListGroup, ProgressBar } from 'react-bootstrap'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Icon } from '@iconify/react'
import { useApi } from '@/hooks/useApi'
import { dashboardApi, type DashboardSummary, type PendingActions, type SystemHealth } from '@/lib/api/dashboard.api'
import { ApiError } from '@/lib/api'
import type { ApexOptions } from 'apexcharts'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

// ─── Safe 404 wrapper ─────────────────────────────────────────────
function safe404<T>(fn: () => Promise<T>, fallback: T): () => Promise<T> {
  return async () => {
    try {
      return await fn()
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.code === 'NOT_FOUND')) return fallback
      throw err
    }
  }
}

// ─── KPI Card Component ──────────────────────────────────────────
function KpiCard({ icon, label, value, sub, color, href, trend }: {
  icon: string; label: string; value: number | string; sub?: string; color: string; href?: string;
  trend?: { direction: 'up' | 'down' | 'flat'; value: string }
}) {
  const inner = (
    <Card className="h-100 border-0 shadow-sm card-hover position-relative overflow-hidden" style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}>
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className={`rounded-3 p-2 bg-soft-${color} text-${color} d-flex align-items-center justify-content-center`} style={{ width: '40px', height: '40px' }}>
            <Icon icon={icon} width={20} />
          </div>
          {trend && (
            <Badge bg={trend.direction === 'up' ? 'success-subtle' : trend.direction === 'down' ? 'danger-subtle' : 'secondary-subtle'} className={`text-${trend.direction === 'up' ? 'success' : trend.direction === 'down' ? 'danger' : 'secondary'} border border-${trend.direction === 'up' ? 'success-subtle' : trend.direction === 'down' ? 'danger-subtle' : 'secondary-subtle'} fs-10 px-2 py-1`}>
              <Icon icon={trend.direction === 'up' ? 'solar:arrow-right-up-linear' : trend.direction === 'down' ? 'solar:arrow-right-down-linear' : 'solar:minus-linear'} className="me-1" />
              {trend.value}
            </Badge>
          )}
        </div>
        <div>
          <h4 className="fw-bold text-dark mb-1 fs-5">{value}</h4>
          <p className="text-muted small fw-semibold mb-1 text-truncate" style={{ fontSize: '0.75rem' }}>{label}</p>
          {sub && <p className="text-muted mb-0 text-truncate fw-normal" style={{ fontSize: '0.68rem' }}>{sub}</p>}
        </div>
      </Card.Body>
    </Card>
  )
  return href ? <Link href={href} className="text-decoration-none">{inner}</Link> : inner
}

// ─── KPI Card Skeleton Loader ─────────────────────────────────────
function KpiCardSkeleton() {
  return (
    <Card className="h-100 border-0 shadow-sm animate-pulse">
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between mb-2">
          <div className="bg-light rounded-3" style={{ width: '40px', height: '40px' }} />
          <div className="bg-light rounded" style={{ width: '50px', height: '18px' }} />
        </div>
        <div className="bg-light rounded mb-2" style={{ height: '22px', width: '50%' }} />
        <div className="bg-light rounded mb-1" style={{ height: '14px', width: '70%' }} />
        <div className="bg-light rounded" style={{ height: '10px', width: '40%' }} />
      </Card.Body>
    </Card>
  )
}

// ─── System Health Badge ──────────────────────────────────────────
function HealthBadge({ status }: { status: string }) {
  const label = status === 'healthy' ? 'Healthy' : status === 'degraded' ? 'Degraded' : 'Critical'
  const variant = status === 'healthy' ? 'success' : status === 'degraded' ? 'warning' : 'danger'
  return <Badge bg={`${variant}-subtle`} className={`text-${variant} border border-${variant}-subtle px-2 py-1 fs-11 fw-semibold`}>{label}</Badge>
}

// ─── Time Ago Helper ──────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ─── Chart Components ─────────────────────────────────────────────
function RevenueTrendChart({ data }: { data: { date: string; amount: number }[] }) {
  const options: ApexOptions = {
    chart: { type: 'area', height: 260, toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.02 } },
    xaxis: { categories: data.map((d) => d.date), labels: { rotate: -30, style: { fontSize: '9px', colors: '#6c757d' } } },
    yaxis: { labels: { formatter: (v) => `৳${v.toLocaleString()}`, style: { colors: '#6c757d' } } },
    colors: ['#1a6b3c'],
    grid: { borderColor: '#f1f1f1', strokeDashArray: 3 },
    tooltip: { y: { formatter: (v) => `৳${v.toLocaleString()}` } },
    dataLabels: { enabled: false },
  }
  const series = [{ name: 'Revenue', data: data.map((d) => d.amount) }]

  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="bg-transparent border-light py-3"><h6 className="mb-0 fw-bold text-dark">Revenue Trend (Last 7 Days)</h6></Card.Header>
      <Card.Body>
        {data.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center text-muted" style={{ height: 200 }}>No revenue trend data.</div>
        ) : (
          <ReactApexChart options={options} series={series} type="area" height={220} />
        )}
      </Card.Body>
    </Card>
  )
}

function CombinedActivityChart({
  memberships, campaigns, petCensus
}: {
  memberships: { date: string; count: number }[]
  campaigns: { date: string; count: number }[]
  petCensus: { date: string; count: number }[]
}) {
  const categories = memberships.map(d => d.date)
  const options: ApexOptions = {
    chart: { type: 'bar', height: 260, toolbar: { show: false } },
    stroke: { width: [2, 2, 2], curve: 'smooth' },
    xaxis: { categories, labels: { rotate: -30, style: { fontSize: '9px', colors: '#6c757d' } } },
    colors: ['#0dcaf0', '#fd7e14', '#6f42c1'],
    grid: { borderColor: '#f1f1f1', strokeDashArray: 3 },
    legend: { position: 'top', horizontalAlign: 'center', fontSize: '11px', labels: { colors: '#6c757d' } },
    dataLabels: { enabled: false },
  }
  const series = [
    { name: 'Memberships', type: 'column', data: memberships.map(d => d.count) },
    { name: 'Campaign Registrations', type: 'column', data: campaigns.map(d => d.count) },
    { name: 'Pet Census Submissions', type: 'line', data: petCensus.map(d => d.count) }
  ]

  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="bg-transparent border-light py-3"><h6 className="mb-0 fw-bold text-dark">Activity Operations (Last 7 Days)</h6></Card.Header>
      <Card.Body>
        {memberships.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center text-muted" style={{ height: 200 }}>No activity data.</div>
        ) : (
          <ReactApexChart options={options} series={series} type="line" height={220} />
        )}
      </Card.Body>
    </Card>
  )
}

// ─── Fallbacks ───────────────────────────────────────────────────
const fallbackSummary: DashboardSummary = {
  todayRevenue: 0,
  monthRevenue: 0,
  revenueChangePercent: 0,
  totalUsers: 0,
  newUsersToday: 0,
  activeMembers: 0,
  newMembersToday: 0,
  pendingMembershipPayments: 0,
  donationsToday: 0,
  donationAmountToday: 0,
  activeCampaigns: 0,
  campaignRegistrationsToday: 0,
  pendingCampaignPayments: 0,
  petCensusToday: 0,
  unreadContactInquiries: 0,
  unrepliedContactInquiries: 0,
  failedSmsToday: 0,
  pendingSmsQueue: 0,
  failedPaymentsToday: 0,
  pendingManualPayments: 0,
  systemHealth: { database: 'healthy', api: 'healthy', sms: 'healthy', email: 'healthy', storage: 'healthy', payments: 'healthy' },
  trends: {
    revenue: [], memberships: [], campaigns: [], petCensus: [], contacts: [],
    paymentStatuses: [], membershipTiers: [], donationCampaigns: [], campaignCapacities: [], zoneDemand: []
  }
}

const fallbackPending: PendingActions = { newInquiries: [], pendingMfsPayments: [], pendingCampaignRegs: [], failedSms: [] }
const fallbackHealth: SystemHealth = {
  database: 'healthy',
  sms: { queued: 0, failed: 0, sent: 0, status: 'healthy' },
  email: { queued: 0, failed: 0, status: 'healthy' },
  payments: { failedLast24h: 0, status: 'healthy' },
  checkedAt: new Date().toISOString()
}

// ─── Main Component ───────────────────────────────────────────────
export default function DashboardContent() {
  const summaryFn = useCallback(safe404(() => dashboardApi.summary(), fallbackSummary), [])
  const pendingFn = useCallback(safe404(() => dashboardApi.pendingActions(), fallbackPending), [])
  const activityFn = useCallback(safe404(() => dashboardApi.recentActivity(), { feed: [] }), [])
  const healthFn = useCallback(safe404(() => dashboardApi.systemHealth(), fallbackHealth), [])

  const { data: summaryData, loading: sumLoading, error: sumError, refetch: refetchSummary } = useApi(summaryFn, [])
  const { data: pendingData, loading: pendLoading, error: pendError, refetch: refetchPending } = useApi(pendingFn, [])
  const { data: activityData, loading: actLoading, error: actError, refetch: refetchActivity } = useApi(activityFn, [])
  const { data: healthData, loading: hlthLoading, error: hlthError, refetch: refetchHealth } = useApi(healthFn, [])

  const s = summaryData ?? fallbackSummary
  const pa = pendingData ?? fallbackPending
  const feed = activityData?.feed ?? []
  const health = healthData ?? fallbackHealth

  const handleRefreshAll = () => {
    refetchSummary()
    refetchPending()
    refetchActivity()
    refetchHealth()
  }

  const isLoading = sumLoading || pendLoading || actLoading || hlthLoading
  const isError = !!(sumError || pendError || actError || hlthError)

  if (isError) {
    return (
      <div className="container-fluid py-5">
        <Card className="border-0 shadow-sm text-center p-5">
          <Card.Body>
            <div className="text-danger mb-3">
              <Icon icon="solar:shield-warning-bold-duotone" style={{ fontSize: '64px' }} />
            </div>
            <h5 className="fw-bold mb-2">Failed to load Command Center data</h5>
            <p className="text-muted small mb-4">The backend server is either unreachable or threw an exception.</p>
            <Button variant="primary" size="sm" onClick={handleRefreshAll} className="px-4">
              Retry Connection
            </Button>
          </Card.Body>
        </Card>
      </div>
    )
  }

  const pendingAlertCount = pa.newInquiries.length + pa.pendingMfsPayments.length + pa.pendingCampaignRegs.length

  return (
    <div className="container-fluid py-3">
      {/* Dynamic pulse CSS injection */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .animate-pulse {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 .5rem 1rem rgba(0,0,0,.08) !important;
        }
        .timeline-line {
          position: absolute;
          left: 17px;
          top: 36px;
          bottom: 0;
          width: 2px;
          background-color: #f1f1f1;
        }
      `}</style>

      {/* Dashboard Header Banner */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">BPA Operations Dashboard</h4>
          <p className="text-muted small mb-0">Bangladesh Pet Association real-time administrative status metrics.</p>
        </div>
        <Button variant="primary" size="sm" className="d-flex align-items-center gap-1 border-0" onClick={handleRefreshAll} disabled={isLoading} style={{ backgroundColor: '#1a6b3c' }}>
          {isLoading ? <Spinner animation="border" size="sm" /> : <Icon icon="solar:refresh-bold-duotone" />}
          <span>Refresh Console</span>
        </Button>
      </div>

      {/* KPI Stats Command Center Grid */}
      <Row className="g-3 mb-4">
        {sumLoading ? (
          Array.from({ length: 8 }).map((_, idx) => (
            <Col key={idx} xs={12} sm={6} xl={3}>
              <KpiCardSkeleton />
            </Col>
          ))
        ) : (
          <>
            <Col xs={12} sm={6} xl={3}>
              <KpiCard
                icon="solar:dollar-minimalistic-bold-duotone"
                label="Today Revenue"
                value={`৳${s.todayRevenue.toLocaleString()}`}
                sub={`Month: ৳${s.monthRevenue.toLocaleString()}`}
                color="success"
                trend={{ direction: s.revenueChangePercent >= 0 ? 'up' : 'down', value: `${s.revenueChangePercent >= 0 ? '+' : ''}${s.revenueChangePercent.toFixed(1)}%` }}
              />
            </Col>
            <Col xs={12} sm={6} xl={3}>
              <KpiCard
                icon="solar:users-group-two-rounded-bold-duotone"
                label="Total Registered Users"
                value={s.totalUsers.toLocaleString()}
                sub={`+${s.newUsersToday} users registered today`}
                color="primary"
                href="/users"
              />
            </Col>
            <Col xs={12} sm={6} xl={3}>
              <KpiCard
                icon="solar:card-bold-duotone"
                label="Active Members"
                value={s.activeMembers.toLocaleString()}
                sub={`${s.pendingMembershipPayments} payments pending review`}
                color="info"
                href="/community-care/membership"
              />
            </Col>
            <Col xs={12} sm={6} xl={3}>
              <KpiCard
                icon="solar:hand-money-bold-duotone"
                label="Donations Intake"
                value={`৳${s.donationAmountToday.toLocaleString()}`}
                sub={`${s.donationsToday} contributions received today`}
                color="warning"
                href="/donations"
              />
            </Col>
            <Col xs={12} sm={6} xl={3}>
              <KpiCard
                icon="solar:target-bold-duotone"
                label="Active Campaigns"
                value={s.activeCampaigns.toLocaleString()}
                sub={`${s.campaignRegistrationsToday} bookings today`}
                color="primary"
                href="/campaigns"
              />
            </Col>
            <Col xs={12} sm={6} xl={3}>
              <KpiCard
                icon="solar:cat-bold-duotone"
                label="Pet Census Today"
                value={s.petCensusToday.toLocaleString()}
                sub="Census demographics collected"
                color="secondary"
                href="/community-care/pet-census"
              />
            </Col>
            <Col xs={12} sm={6} xl={3}>
              <KpiCard
                icon="solar:inbox-unread-bold-duotone"
                label="Unreplied Inquiries"
                value={s.unreadContactInquiries.toLocaleString()}
                sub={`${s.unrepliedContactInquiries} tickets awaiting help`}
                color="danger"
                href="/contact-inquiries"
              />
            </Col>
            <Col xs={12} sm={6} xl={3}>
              <KpiCard
                icon="solar:shield-warning-bold-duotone"
                label="Pending Manual Review"
                value={s.pendingManualPayments.toLocaleString()}
                sub={`${s.failedPaymentsToday} payment failures logged`}
                color="warning"
              />
            </Col>
          </>
        )}
      </Row>

      {/* Analytics Charts */}
      <Row className="g-3 mb-4">
        <Col xs={12} xl={6}>
          {sumLoading ? (
            <Card className="border-0 shadow-sm animate-pulse" style={{ height: '300px' }}>
              <Card.Body className="d-flex justify-content-center align-items-center"><Spinner animation="border" variant="success" /></Card.Body>
            </Card>
          ) : (
            <RevenueTrendChart data={s.trends?.revenue ?? []} />
          )}
        </Col>
        <Col xs={12} xl={6}>
          {sumLoading ? (
            <Card className="border-0 shadow-sm animate-pulse" style={{ height: '300px' }}>
              <Card.Body className="d-flex justify-content-center align-items-center"><Spinner animation="border" variant="info" /></Card.Body>
            </Card>
          ) : (
            <CombinedActivityChart
              memberships={s.trends?.memberships ?? []}
              campaigns={s.trends?.campaigns ?? []}
              petCensus={s.trends?.petCensus ?? []}
            />
          )}
        </Col>
      </Row>

      {/* System Health */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-transparent border-light py-3 d-flex align-items-center justify-content-between">
          <h6 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
            <Icon icon="solar:cpu-bold-duotone" className="text-primary" />
            <span>Infrastructure Health Status</span>
          </h6>
          <small className="text-muted small">Checked {timeAgo(health.checkedAt)}</small>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col xs={6} md={4} lg={2} className="text-center border-end border-light">
              <div className="text-muted small mb-1" style={{ fontSize: '0.7rem' }}>Database Engine</div>
              <HealthBadge status={s.systemHealth?.database ?? health.database} />
            </Col>
            <Col xs={6} md={4} lg={2} className="text-center border-end border-light">
              <div className="text-muted small mb-1" style={{ fontSize: '0.7rem' }}>Core API Node</div>
              <HealthBadge status={s.systemHealth?.api ?? 'healthy'} />
            </Col>
            <Col xs={6} md={4} lg={2} className="text-center border-end border-light">
              <div className="text-muted small mb-1" style={{ fontSize: '0.7rem' }}>SMS Gateway</div>
              <HealthBadge status={s.systemHealth?.sms ?? health.sms.status} />
              <div className="text-muted mt-1" style={{ fontSize: '0.65rem' }}>Failed today: {s.failedSmsToday}</div>
            </Col>
            <Col xs={6} md={4} lg={2} className="text-center border-end border-light">
              <div className="text-muted small mb-1" style={{ fontSize: '0.7rem' }}>Email Node</div>
              <HealthBadge status={s.systemHealth?.email ?? health.email.status} />
              <div className="text-muted mt-1" style={{ fontSize: '0.65rem' }}>Queued: {health.email.queued}</div>
            </Col>
            <Col xs={6} md={4} lg={2} className="text-center border-end border-light">
              <div className="text-muted small mb-1" style={{ fontSize: '0.7rem' }}>S3 Media Storage</div>
              <HealthBadge status={s.systemHealth?.storage ?? 'healthy'} />
            </Col>
            <Col xs={6} md={4} lg={2} className="text-center">
              <div className="text-muted small mb-1" style={{ fontSize: '0.7rem' }}>Payment Systems</div>
              <HealthBadge status={s.systemHealth?.payments ?? health.payments.status} />
              <div className="text-muted mt-1" style={{ fontSize: '0.65rem' }}>Failed 24h: {health.payments.failedLast24h}</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-3 mb-4">
        {/* Pending Action Center */}
        <Col xs={12} xl={6}>
          <Card className="border-0 shadow-sm h-100 border-start border-warning border-3">
            <Card.Header className="bg-transparent border-light py-3 d-flex align-items-center justify-content-between">
              <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                <Icon icon="solar:shield-warning-bold-duotone" className="text-warning" />
                <span>Pending Action Center</span>
              </h6>
              {pendingAlertCount > 0 && (
                <Badge bg="danger" className="rounded-pill px-2 py-1 fs-10 animate-pulse">
                  {pendingAlertCount} Alerts Awaiting
                </Badge>
              )}
            </Card.Header>
            <Card.Body className="p-0">
              {pendLoading ? (
                <div className="text-center py-5"><Spinner animation="border" variant="warning" /></div>
              ) : pendingAlertCount === 0 ? (
                <div className="text-center text-muted py-5 small">
                  <Icon icon="solar:check-circle-bold-duotone" className="text-success fs-2 mb-2" />
                  <p className="mb-0">Excellent! All pending operational logs are processed.</p>
                </div>
              ) : (
                <div className="d-flex flex-column">
                  {pa.newInquiries.length > 0 && (
                    <div className="border-bottom p-3 bg-light-subtle">
                      <span className="small text-uppercase text-muted fw-bold d-block mb-2">Support Tickets ({pa.newInquiries.length})</span>
                      {pa.newInquiries.slice(0, 2).map((inq) => (
                        <div key={inq.id} className="d-flex justify-content-between align-items-center py-2 border-bottom border-light last-no-border">
                          <div className="min-width-0">
                            <span className="small fw-bold text-dark d-block text-truncate">{inq.name}</span>
                            <span className="text-muted text-truncate d-block" style={{ fontSize: '0.7rem' }}>{inq.subject || 'No Subject'}</span>
                          </div>
                          <Link href={`/contact-inquiries/${inq.id}`} className="btn btn-soft-primary btn-sm px-3 py-1 fs-11 flex-shrink-0">View Ticket</Link>
                        </div>
                      ))}
                    </div>
                  )}

                  {pa.pendingMfsPayments.length > 0 && (
                    <div className="border-bottom p-3">
                      <span className="small text-uppercase text-muted fw-bold d-block mb-2">Manual Membership Payments ({pa.pendingMfsPayments.length})</span>
                      {pa.pendingMfsPayments.slice(0, 2).map((m) => (
                        <div key={m.id} className="d-flex justify-content-between align-items-center py-2 border-bottom border-light last-no-border">
                          <div className="min-width-0">
                            <span className="small fw-bold text-dark d-block text-truncate">{m.memberName}</span>
                            <span className="text-muted text-truncate d-block" style={{ fontSize: '0.7rem' }}>{m.tier?.nameEn || 'Membership'} · ৳{Number(m.amountBdt).toLocaleString()}</span>
                          </div>
                          <Link href={`/community-care/membership/purchases/${m.id}`} className="btn btn-soft-warning btn-sm px-3 py-1 fs-11 flex-shrink-0">Verify Pay</Link>
                        </div>
                      ))}
                    </div>
                  )}

                  {pa.pendingCampaignRegs.length > 0 && (
                    <div className="p-3">
                      <span className="small text-uppercase text-muted fw-bold d-block mb-2">Campaign Booking Approvals ({pa.pendingCampaignRegs.length})</span>
                      {pa.pendingCampaignRegs.slice(0, 2).map((r) => (
                        <div key={r.id} className="d-flex justify-content-between align-items-center py-2 border-bottom border-light last-no-border">
                          <div className="min-width-0">
                            <span className="small fw-bold text-dark d-block text-truncate">{r.campaign?.title || 'Campaign Booking'}</span>
                            <span className="text-muted text-truncate d-block" style={{ fontSize: '0.7rem' }}>Booking Code: <code>{r.bookingNumber}</code></span>
                          </div>
                          <Link href={`/campaigns/${r.id}`} className="btn btn-soft-success btn-sm px-3 py-1 fs-11 flex-shrink-0">Approve Booking</Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Activity timeline */}
        <Col xs={12} xl={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-light py-3"><h6 className="mb-0 fw-bold text-dark">Live Operations Activity Timeline</h6></Card.Header>
            <Card.Body className="p-3 position-relative" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {actLoading ? (
                <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
              ) : feed.length === 0 ? (
                <div className="text-center text-muted py-5 small">No operational logs recorded.</div>
              ) : (
                <div className="position-relative">
                  <div className="timeline-line" />
                  <div className="d-flex flex-column gap-3">
                    {feed.map((item) => {
                      const mapIcon = {
                        contact_inquiry: 'solar:letter-bold-duotone',
                        membership: 'solar:card-2-bold-duotone',
                        donation: 'solar:hand-heart-bold-duotone',
                        campaign_registration: 'solar:calendar-add-bold-duotone',
                        pet_census: 'solar:cat-bold-duotone',
                      }[item._type] || 'solar:bell-bold-duotone'

                      const mapColor = {
                        contact_inquiry: 'info',
                        membership: 'primary',
                        donation: 'success',
                        campaign_registration: 'warning',
                        pet_census: 'secondary',
                      }[item._type] || 'secondary'

                      return (
                        <div key={`${item._type}:${item.id}`} className="d-flex gap-3 align-items-start position-relative" style={{ zIndex: 2 }}>
                          <div className={`flex-shrink-0 rounded-circle text-${mapColor} bg-white border border-${mapColor}-subtle d-flex align-items-center justify-content-center`} style={{ width: '34px', height: '34px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
                            <Icon icon={mapIcon} width={16} />
                          </div>
                          <div className="flex-grow-1 min-width-0 pt-1">
                            <span className="small fw-semibold text-dark d-block">
                              {item._type === 'contact_inquiry' && `${item.name} — ${item.subject ?? 'Inquiry'}`}
                              {item._type === 'membership' && `${item.memberName} · ${(item.tier as any)?.nameEn ?? 'Membership'}`}
                              {item._type === 'donation' && `${item.donorName} · ৳${Number(item.amount).toLocaleString()}`}
                              {item._type === 'campaign_registration' && `${(item.campaign as any)?.title ?? 'Campaign'} · ${item.bookingNumber}`}
                              {item._type === 'pet_census' && `Census submission · ${item.ownerName}`}
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.65rem' }}>{timeAgo(item.createdAt)}</span>
                          </div>
                          <Badge bg={`${mapColor}-subtle`} className={`text-${mapColor} border border-${mapColor}-subtle text-uppercase flex-shrink-0 mt-1`} style={{ fontSize: '0.55rem' }}>
                            {item._type.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        {/* Campaign progress fill rate */}
        <Col xs={12} xl={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-light py-3"><h6 className="mb-0 fw-bold text-dark">Campaign Seats Allocation</h6></Card.Header>
            <Card.Body className="p-3">
              {s.trends?.campaignCapacities?.length === 0 ? (
                <p className="text-muted text-center py-5 mb-0">No active campaigns cataloged.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {(s.trends.campaignCapacities ?? []).map(c => {
                    const percent = Math.min(Math.round(c.percent), 100)
                    return (
                      <div key={c.id}>
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="text-dark small fw-semibold text-truncate" style={{ maxWidth: '75%' }}>{c.title}</span>
                          <span className="text-muted small fs-11 fw-bold">{c.booked} / {c.capacity} Allocated</span>
                        </div>
                        <ProgressBar now={percent} variant={percent > 85 ? 'danger' : percent > 50 ? 'warning' : 'success'} style={{ height: '5px' }} />
                      </div>
                    )
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Zone Demand Ranking */}
        <Col xs={12} xl={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-light py-3"><h6 className="mb-0 fw-bold text-dark">Top Regions by Census Submissions</h6></Card.Header>
            <Card.Body className="p-0">
              {(s.trends?.zoneDemand ?? []).length === 0 ? (
                <p className="text-muted text-center py-5 mb-0">No zone demand records mapped.</p>
              ) : (
                <Table hover className="table-centered align-middle mb-0 text-nowrap table-borderless">
                  <thead className="table-light text-muted small">
                    <tr>
                      <th className="ps-3" style={{ fontSize: '0.7rem' }}>Zone Region</th>
                      <th className="text-end pe-3" style={{ fontSize: '0.7rem' }}>Census Records Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(s.trends.zoneDemand ?? []).map((z, idx) => (
                      <tr key={z.id} className="border-bottom border-light">
                        <td className="ps-3 small fw-semibold text-dark">
                          <span className="text-muted me-2">#{idx + 1}</span>
                          {z.name}
                        </td>
                        <td className="text-end fw-bold text-dark pe-3">{z.censusCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
