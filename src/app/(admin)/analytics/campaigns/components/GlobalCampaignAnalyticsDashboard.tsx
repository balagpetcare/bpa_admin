'use client'

import { Row, Col, Card, Table, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi } from '@/hooks/useApi'
import { campaignAnalyticsApi } from '@/lib/api/campaign-analytics.api'
import type { ApiError } from '@/lib/api'
import type { GlobalCampaignAnalytics } from '@/types/bpa.types'

const STATUS_VARIANT: Record<string, string> = {
  draft: 'secondary',
  published: 'info',
  registration_open: 'success',
  registration_closed: 'warning',
  completed: 'primary',
  cancelled: 'danger',
}

function KpiCard({ icon, label, value, variant }: { icon: string; label: string; value: number | string; variant: string }) {
  return (
    <Card>
      <Card.Body>
        <div className="d-flex align-items-center gap-3">
          <div className={`avatar-md bg-soft-${variant} rounded flex-centered flex-shrink-0`}>
            <Icon icon={icon} className={`fs-24 text-${variant}`} />
          </div>
          <div>
            <p className="text-muted mb-0 small">{label}</p>
            <h3 className="mb-0 text-dark">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

export default function GlobalCampaignAnalyticsDashboard() {
  const { data, loading, error } = useApi(() => campaignAnalyticsApi.getGlobal(), [])

  const g = data as GlobalCampaignAnalytics | null
  const t = g?.totals

  const revenueBdt = t?.totalRevenueBdt ? Number(t.totalRevenueBdt).toLocaleString('en-BD') : '0'

  return (
    <div className="container-fluid">
      <PageHeader title="Global Campaign Analytics" breadcrumbs={[{ label: 'Analytics', href: '/analytics' }, { label: 'Campaigns' }]} />

      <ApiErrorAlert error={error as ApiError | null} />

      <LoadingOverlay loading={loading}>
        {g && (
          <>
            {/* Summary KPIs */}
            <Row className="g-3 mb-4">
              <Col sm={6} xl={3}>
                <KpiCard icon="solar:flag-bold" label="Total Campaigns" value={g.totalCampaigns} variant="primary" />
              </Col>
              <Col sm={6} xl={3}>
                <KpiCard icon="solar:play-bold" label="Active Campaigns" value={g.activeCampaigns} variant="success" />
              </Col>
              <Col sm={6} xl={3}>
                <KpiCard icon="solar:users-group-rounded-bold" label="Total Registrations" value={t?.totalRegistrations ?? 0} variant="info" />
              </Col>
              <Col sm={6} xl={3}>
                <KpiCard icon="solar:check-circle-bold" label="Paid Registrations" value={t?.totalPaid ?? 0} variant="success" />
              </Col>
              <Col sm={6} xl={3}>
                <KpiCard icon="solar:cat-bold" label="Total Pets" value={t?.totalPets ?? 0} variant="warning" />
              </Col>
              <Col sm={6} xl={3}>
                <KpiCard icon="solar:syringe-bold" label="Vaccinated" value={t?.totalVaccinated ?? 0} variant="success" />
              </Col>
              <Col sm={6} xl={3}>
                <KpiCard icon="solar:diploma-bold" label="Certificates Issued" value={t?.totalCertificates ?? 0} variant="info" />
              </Col>
              <Col sm={6} xl={3}>
                <KpiCard icon="solar:money-bag-bold" label="Total Revenue (BDT)" value={`৳${revenueBdt}`} variant="primary" />
              </Col>
            </Row>

            {/* Recent Campaigns */}
            <Card>
              <Card.Header>
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="mb-0">Recent Campaigns</h5>
                  <Link href="/campaigns" className="btn btn-sm btn-soft-primary">
                    View All
                  </Link>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table className="table-centered mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Campaign</th>
                        <th>Status</th>
                        <th className="text-end">Registrations</th>
                        <th className="text-end">Paid</th>
                        <th className="text-end">Vaccinated</th>
                        <th className="text-end">Revenue (BDT)</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.recentCampaigns.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <span className="fw-medium">{c.title}</span>
                            <br />
                            <span className="text-muted small">
                              {new Date(c.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </td>
                          <td>
                            <Badge bg={STATUS_VARIANT[c.status] ?? 'secondary'} className="text-capitalize">
                              {c.status.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="text-end">{c.analytics?.totalRegistrations ?? '—'}</td>
                          <td className="text-end">{c.analytics?.totalPaid ?? '—'}</td>
                          <td className="text-end">{c.analytics?.totalVaccinated ?? '—'}</td>
                          <td className="text-end">{c.analytics ? `৳${Number(c.analytics.totalRevenueBdt).toLocaleString('en-BD')}` : '—'}</td>
                          <td>
                            <Link href={`/campaigns/${c.id}/analytics`} className="btn btn-sm btn-soft-secondary">
                              <Icon icon="solar:chart-2-bold" className="me-1" />
                              Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </>
        )}
      </LoadingOverlay>
    </div>
  )
}
