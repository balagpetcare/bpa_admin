'use client'

import { Row, Col, Card, ProgressBar, Table, Spinner, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import dynamic from 'next/dynamic'
import type { ApexOptions } from 'apexcharts'
import type { AnalyticsOverview, TrafficAnalyticsData } from '@/lib/api/analytics.api'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface OverviewTrafficTabProps {
  overview: AnalyticsOverview | null
  traffic: TrafficAnalyticsData | null
  loading: boolean
}

export default function OverviewTrafficTab({ overview, traffic, loading }: OverviewTrafficTabProps) {
  const o = overview ?? {
    users: { total: 0, growth: 0 },
    revenue: { total: 0 },
    memberships: { total: 0, growth: 0 },
    donations: { total: 0, growth: 0 },
    campaigns: { active: 0, registrations: 0 },
    petCensus: { total: 0, growth: 0 },
    support: { total: 0, growth: 0 },
  }

  const t = traffic ?? {
    trafficPoints: [],
    topPages: [],
    deviceBreakdown: [],
    referrers: [],
  }

  const kpis = [
    {
      label: 'Total Users',
      value: o.users.total,
      sub: `+${o.users.growth} new users`,
      icon: 'solar:users-group-two-rounded-bold-duotone',
      color: 'primary',
    },
    {
      label: 'Membership Growth',
      value: o.memberships.total,
      sub: `+${o.memberships.growth} new members`,
      icon: 'solar:card-bold-duotone',
      color: 'info',
    },
    {
      label: 'Donations Received',
      value: o.donations.total,
      sub: `+${o.donations.growth} today/period`,
      icon: 'solar:hand-money-bold-duotone',
      color: 'success',
    },
    {
      label: 'Contact Inquiries',
      value: o.support.total,
      sub: `+${o.support.growth} active tickets`,
      icon: 'solar:inbox-unread-bold-duotone',
      color: 'danger',
    },
  ]

  // Apex Traffic chart
  const categories = t.trafficPoints.map((p) => p.date)
  const views = t.trafficPoints.map((p) => p.pageViews)
  const visitors = t.trafficPoints.map((p) => p.uniqueVisitors)

  const trafficChartOptions: ApexOptions = {
    chart: { type: 'area', height: 280, toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.02 } },
    xaxis: {
      categories,
      labels: { rotate: -30, style: { fontSize: '10px', colors: '#6c757d' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: '#6c757d' } } },
    colors: ['#0d6efd', '#20c997'],
    grid: { borderColor: '#f1f1f1', strokeDashArray: 3 },
    legend: { position: 'top', horizontalAlign: 'right' },
    dataLabels: { enabled: false },
    tooltip: { shared: true },
  }

  const trafficChartSeries = [
    { name: 'Page Views', data: views },
    { name: 'Unique Visitors', data: visitors },
  ]

  // Device breakdown
  const deviceTotal = t.deviceBreakdown.reduce((acc, curr) => acc + curr.count, 0) || 1

  return (
    <div>
      {/* KPI stats */}
      <Row className="g-3 mb-4">
        {kpis.map((k) => (
          <Col key={k.label} xs={12} sm={6} xl={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="d-flex align-items-center gap-3">
                <div className={`avatar-md bg-soft-${k.color} rounded-3 text-${k.color} flex-centered p-3`} style={{ width: '48px', height: '48px' }}>
                  <Icon icon={k.icon} width={24} />
                </div>
                <div>
                  <h4 className="fw-bold mb-0 text-dark">{k.value.toLocaleString()}</h4>
                  <div className="text-muted small fw-semibold">{k.label}</div>
                  <div className="text-muted fs-11">{k.sub}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Traffic Trend */}
      <Row className="g-3 mb-4">
        <Col xs={12} lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-light py-3 d-flex align-items-center justify-content-between">
              <h6 className="mb-0 fw-bold text-dark">Website Traffic Performance</h6>
              <div className="d-flex gap-2 align-items-center">
                <Badge bg="primary-subtle" className="text-primary border border-primary border-primary-subtle fs-11">
                  Page Views
                </Badge>
                <Badge bg="success-subtle" className="text-success border border-success border-success-subtle fs-11">
                  Unique Visitors
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '280px' }}>
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : t.trafficPoints.length === 0 ? (
                <div className="d-flex justify-content-center align-items-center text-muted" style={{ height: '280px' }}>
                  No traffic history found.
                </div>
              ) : (
                <ReactApexChart options={trafficChartOptions} series={trafficChartSeries} type="area" height={280} />
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Device breakdown & referrers */}
        <Col xs={12} lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-light py-3">
              <h6 className="mb-0 fw-bold text-dark">Traffic Sources & Device Breakdown</h6>
            </Card.Header>
            <Card.Body className="d-flex flex-column justify-content-between gap-4">
              {/* Devices */}
              <div>
                <span className="small text-uppercase text-muted fw-bold d-block mb-3">Device Mix</span>
                <div className="d-flex flex-column gap-2">
                  {t.deviceBreakdown.map((d) => {
                    const percent = Math.round((d.count / deviceTotal) * 100)
                    const variant = d.device === 'Desktop' ? 'primary' : d.device === 'Mobile' ? 'success' : 'info'
                    return (
                      <div key={d.device} className="small">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-dark fw-semibold">{d.device}</span>
                          <span className="text-muted">
                            {percent}% ({d.count})
                          </span>
                        </div>
                        <ProgressBar now={percent} variant={variant} style={{ height: '5px' }} />
                      </div>
                    )
                  })}
                  {t.deviceBreakdown.length === 0 && <span className="text-muted text-center py-2 d-block fs-12">No device logs available.</span>}
                </div>
              </div>

              {/* Referrers */}
              <div>
                <span className="small text-uppercase text-muted fw-bold d-block mb-2">Top Referrers</span>
                <div className="d-flex flex-column gap-2">
                  {t.referrers.map((r, idx) => (
                    <div key={r.referrer} className="d-flex align-items-center justify-content-between py-1 border-bottom border-light">
                      <span className="text-dark small text-truncate fw-semibold">
                        <span className="text-muted me-2">#{idx + 1}</span>
                        {r.referrer}
                      </span>
                      <Badge bg="secondary-subtle" className="text-secondary border border-secondary-subtle fs-11">
                        {r.count} sessions
                      </Badge>
                    </div>
                  ))}
                  {t.referrers.length === 0 && <span className="text-muted text-center py-2 d-block fs-12">No referrer logs.</span>}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Top Pages Table */}
      <Row className="g-3">
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-light py-3">
              <h6 className="mb-0 fw-bold text-dark">Top Visited Pages (Most Popular Routes)</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover className="table-centered align-middle mb-0 text-nowrap table-borderless">
                <thead className="table-light text-muted small">
                  <tr>
                    <th className="ps-3">Path Routing</th>
                    <th className="text-end pe-3">Page Views</th>
                  </tr>
                </thead>
                <tbody>
                  {t.topPages.map((page, idx) => (
                    <tr key={page.path} className="border-bottom border-light">
                      <td className="ps-3 small fw-semibold text-dark">
                        <span className="text-muted me-2">#{idx + 1}</span>
                        <code>{page.path}</code>
                      </td>
                      <td className="text-end fw-bold text-dark pe-3">{page.pageViews.toLocaleString()}</td>
                    </tr>
                  ))}
                  {t.topPages.length === 0 && (
                    <tr>
                      <td colSpan={2} className="text-center text-muted py-4">
                        No page logs recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
