'use client'

import { Row, Col, Card, ProgressBar, Table, Spinner, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import dynamic from 'next/dynamic'
import type { ApexOptions } from 'apexcharts'
import type { RevenueAnalytics, SupportAnalyticsData } from '@/lib/api/analytics.api'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface FinancialsSupportTabProps {
  revenue: RevenueAnalytics | null
  support: SupportAnalyticsData | null
  loading: boolean
}

export default function FinancialsSupportTab({ revenue, support, loading }: FinancialsSupportTabProps) {
  const r = revenue ?? { revenuePoints: [], methodBreakdown: [], rates: { success: 0, failed: 0, pending: 0 } }
  const s = support ?? { supportPoints: [], categoryBreakdown: [], replied: 0, pending: 0 }

  // 1. Revenue Chart Config
  const revDates = r.revenuePoints.map(pt => pt.date)
  const revAmounts = r.revenuePoints.map(pt => pt.amount)
  const revenueOptions: ApexOptions = {
    chart: { type: 'area', height: 220, toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.01 } },
    xaxis: { categories: revDates, labels: { rotate: -30, style: { fontSize: '9px', colors: '#6c757d' } } },
    yaxis: { labels: { formatter: (val) => `৳${val.toLocaleString()}` } },
    colors: ['#198754'],
    grid: { borderColor: '#f1f1f1', strokeDashArray: 3 },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val) => `৳${val.toLocaleString()}` } }
  }
  const revenueSeries = [{ name: 'Revenue amount', data: revAmounts }]

  // 2. Support Chart Config
  const supDates = s.supportPoints.map(pt => pt.date)
  const supCounts = s.supportPoints.map(pt => pt.count)
  const supportOptions: ApexOptions = {
    chart: { type: 'line', height: 200, toolbar: { show: false } },
    stroke: { width: 2, curve: 'smooth' },
    xaxis: { categories: supDates, labels: { rotate: -30, style: { fontSize: '9px', colors: '#6c757d' } } },
    colors: ['#dc3545'],
    grid: { borderColor: '#f1f1f1', strokeDashArray: 3 },
    dataLabels: { enabled: false }
  }
  const supportSeries = [{ name: 'Tickets Opened', data: supCounts }]

  // Rates math
  const payTotal = (r.rates.success + r.rates.failed + r.rates.pending) || 1
  const successRate = Math.round((r.rates.success / payTotal) * 100)
  const failedRate = Math.round((r.rates.failed / payTotal) * 100)
  const pendingRate = Math.round((r.rates.pending / payTotal) * 100)

  // Support resolution math
  const supportTotal = (s.replied + s.pending) || 1
  const resolvedRate = Math.round((s.replied / supportTotal) * 100)

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '300px' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-2 text-muted">Retrieving transactional logs...</span>
      </div>
    )
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* SECTION 1: Revenue Snapshot & Payment Methods */}
      <Row className="g-3">
        <Col xs={12} lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-light py-3">
              <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                <Icon icon="solar:wallet-bold-duotone" className="text-success" />
                <span>Gross Revenue Trends</span>
              </h6>
            </Card.Header>
            <Card.Body>
              {revAmounts.length === 0 ? (
                <p className="text-muted text-center py-4 mb-0">No revenue data found for this range.</p>
              ) : (
                <ReactApexChart options={revenueOptions} series={revenueSeries} type="area" height={220} />
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-light py-3">
              <h6 className="mb-0 fw-bold text-dark">Payment Status Rate</h6>
            </Card.Header>
            <Card.Body className="d-flex flex-column justify-content-around gap-3">
              <div>
                <div className="d-flex justify-content-between mb-1 small">
                  <span className="fw-semibold text-success">Successful Payments</span>
                  <span>{successRate}% ({r.rates.success})</span>
                </div>
                <ProgressBar now={successRate} variant="success" style={{ height: '6px' }} />
              </div>
              <div>
                <div className="d-flex justify-content-between mb-1 small">
                  <span className="fw-semibold text-warning">Pending Review</span>
                  <span>{pendingRate}% ({r.rates.pending})</span>
                </div>
                <ProgressBar now={pendingRate} variant="warning" style={{ height: '6px' }} />
              </div>
              <div>
                <div className="d-flex justify-content-between mb-1 small">
                  <span className="fw-semibold text-danger">Failed Payments</span>
                  <span>{failedRate}% ({r.rates.failed})</span>
                </div>
                <ProgressBar now={failedRate} variant="danger" style={{ height: '6px' }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        {/* Payment gateways breakdown */}
        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-light py-3">
              <h6 className="mb-0 fw-bold text-dark">Revenue Mix by Gateway</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover className="table-centered align-middle mb-0 text-nowrap table-borderless">
                <thead className="table-light text-muted small">
                  <tr>
                    <th className="ps-3">Gateway</th>
                    <th className="text-center">Transactions</th>
                    <th className="text-end pe-3">Settled Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {r.methodBreakdown.map((m) => (
                    <tr key={m.method} className="border-bottom border-light">
                      <td className="ps-3 small fw-bold text-dark">
                        <Badge bg="success-subtle" className="text-success border border-success-subtle text-uppercase me-2">{m.method}</Badge>
                        Payment Channel
                      </td>
                      <td className="text-center small">{m.count} txs</td>
                      <td className="text-end fw-bold text-dark pe-3">৳{m.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  {r.methodBreakdown.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center text-muted py-4">No gateway shares.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Support Tickets overview */}
        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-light py-3">
              <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                <Icon icon="solar:chat-line-bold-duotone" className="text-danger" />
                <span>Support Inquiries Trend</span>
              </h6>
            </Card.Header>
            <Card.Body>
              {supCounts.length === 0 ? (
                <p className="text-muted text-center py-4 mb-0">No ticket records in range.</p>
              ) : (
                <ReactApexChart options={supportOptions} series={supportSeries} type="line" height={160} />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        {/* Support categories breakdown & resolution metrics */}
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-light py-3 d-flex align-items-center justify-content-between">
              <h6 className="mb-0 fw-bold text-dark">Inquiry Backlog & Categories</h6>
              <div className="d-flex align-items-center gap-2 small">
                <span className="text-muted">Resolution Rate:</span>
                <Badge bg="success-subtle" className="text-success border border-success-subtle fw-bold">{resolvedRate}% Resolved</Badge>
                <span className="text-dark fw-semibold">({s.replied} solved / {s.pending} pending)</span>
              </div>
            </Card.Header>
            <Card.Body>
              <span className="small text-uppercase text-muted fw-bold d-block mb-3">Topic Categories Splits</span>
              <Row className="g-3">
                {s.categoryBreakdown.map((cat) => (
                  <Col key={cat.name} xs={6} md={4} lg={3}>
                    <div className="p-3 bg-light rounded border border-light text-center">
                      <div className="fs-5 fw-bold text-dark">{cat.count}</div>
                      <div className="text-muted small text-truncate mt-1" title={cat.name}>{cat.name}</div>
                    </div>
                  </Col>
                ))}
                {s.categoryBreakdown.length === 0 && (
                  <Col xs={12} className="text-center text-muted py-2 small">No categories registered.</Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
