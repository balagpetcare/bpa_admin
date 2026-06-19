'use client'

import { Row, Col, Card, ProgressBar, Table, Spinner, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import dynamic from 'next/dynamic'
import type { ApexOptions } from 'apexcharts'
import type { MembershipAnalytics, CampaignAnalyticsData, PetCensusAnalyticsData } from '@/lib/api/analytics.api'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface OperationsTabProps {
  membership: MembershipAnalytics | null
  campaigns: CampaignAnalyticsData | null
  petCensus: PetCensusAnalyticsData | null
  loading: boolean
}

export default function OperationsTab({ membership, campaigns, petCensus, loading }: OperationsTabProps) {
  const m = membership ?? { membershipPoints: [], tierBreakdown: [], zoneBreakdown: [] }
  const c = campaigns ?? { campaignPoints: [], campaignBreakdown: [], capacities: [] }
  const p = petCensus ?? { censusPoints: [], zoneBreakdown: [], petTypes: [] }

  // 1. Membership Chart Config
  const memDates = m.membershipPoints.map(pt => pt.date)
  const memCounts = m.membershipPoints.map(pt => pt.count)
  const membershipOptions: ApexOptions = {
    chart: { type: 'area', height: 200, toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.3, opacityTo: 0.01 } },
    xaxis: { categories: memDates, labels: { rotate: -30, style: { fontSize: '9px', colors: '#6c757d' } } },
    colors: ['#0dcaf0'],
    grid: { borderColor: '#f1f1f1', strokeDashArray: 3 },
    dataLabels: { enabled: false },
    tooltip: { x: { format: 'yyyy-MM-dd' } }
  }
  const membershipSeries = [{ name: 'Memberships Issued', data: memCounts }]

  // 2. Campaign Regs Chart Config
  const campDates = c.campaignPoints.map(pt => pt.date)
  const campCounts = c.campaignPoints.map(pt => pt.count)
  const campaignOptions: ApexOptions = {
    chart: { type: 'bar', height: 200, toolbar: { show: false } },
    xaxis: { categories: campDates, labels: { rotate: -30, style: { fontSize: '9px', colors: '#6c757d' } } },
    colors: ['#fd7e14'],
    grid: { borderColor: '#f1f1f1', strokeDashArray: 3 },
    dataLabels: { enabled: false }
  }
  const campaignSeries = [{ name: 'Registrations', data: campCounts }]

  // 3. Pet Census Chart Config
  const censusDates = p.censusPoints.map(pt => pt.date)
  const censusCounts = p.censusPoints.map(pt => pt.count)
  const censusOptions: ApexOptions = {
    chart: { type: 'line', height: 200, toolbar: { show: false } },
    stroke: { width: 3, curve: 'straight' },
    xaxis: { categories: censusDates, labels: { rotate: -30, style: { fontSize: '9px', colors: '#6c757d' } } },
    colors: ['#6f42c1'],
    grid: { borderColor: '#f1f1f1', strokeDashArray: 3 },
    dataLabels: { enabled: false }
  }
  const censusSeries = [{ name: 'Census Logs', data: censusCounts }]

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '300px' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-2 text-muted">Analyzing operation logs...</span>
      </div>
    )
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* SECTION 1: Membership Hub */}
      <Row className="g-3">
        <Col xs={12} lg={7}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-light py-3">
              <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                <Icon icon="solar:card-bold-duotone" className="text-info" />
                <span>Membership Purchases Trend</span>
              </h6>
            </Card.Header>
            <Card.Body>
              {memCounts.length === 0 ? (
                <p className="text-muted text-center py-4 mb-0">No membership activations in range.</p>
              ) : (
                <ReactApexChart options={membershipOptions} series={membershipSeries} type="area" height={200} />
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-light py-3">
              <h6 className="mb-0 fw-bold text-dark">Membership Tiers & Regions</h6>
            </Card.Header>
            <Card.Body className="d-flex flex-column justify-content-between gap-3">
              <div>
                <span className="small text-uppercase text-muted fw-bold d-block mb-2">Tiers Mix</span>
                <div className="d-flex flex-wrap gap-2">
                  {m.tierBreakdown.map((t) => (
                    <Badge key={t.name} bg="info-subtle" className="text-info border border-info-subtle p-2 fs-11">
                      {t.name}: <strong className="text-dark">{t.count}</strong>
                    </Badge>
                  ))}
                  {m.tierBreakdown.length === 0 && <span className="text-muted fs-11">No tier splits.</span>}
                </div>
              </div>
              <div>
                <span className="small text-uppercase text-muted fw-bold d-block mb-2">Top Zones Demand</span>
                <div className="d-flex flex-column gap-1">
                  {m.zoneBreakdown.slice(0, 3).map((z) => (
                    <div key={z.name} className="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                      <span className="small text-dark fw-semibold">{z.name}</span>
                      <Badge bg="secondary-subtle" className="text-secondary fs-10">{z.count} members</Badge>
                    </div>
                  ))}
                  {m.zoneBreakdown.length === 0 && <span className="text-muted fs-11">No zone activities.</span>}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* SECTION 2: Campaign Operations */}
      <Row className="g-3">
        <Col xs={12} lg={7}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-light py-3">
              <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                <Icon icon="solar:calendar-bold-duotone" className="text-warning" />
                <span>Campaign Registrations Trend</span>
              </h6>
            </Card.Header>
            <Card.Body>
              {campCounts.length === 0 ? (
                <p className="text-muted text-center py-4 mb-0">No bookings in range.</p>
              ) : (
                <ReactApexChart options={campaignOptions} series={campaignSeries} type="bar" height={200} />
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-light py-3">
              <h6 className="mb-0 fw-bold text-dark">Campaign Capacities & Fill Status</h6>
            </Card.Header>
            <Card.Body className="d-flex flex-column gap-3 overflow-auto" style={{ maxHeight: '240px' }}>
              {c.capacities.map((cap) => {
                const percent = Math.min(Math.round(cap.percent), 100)
                return (
                  <div key={cap.title} className="small">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-dark fw-semibold text-truncate" style={{ maxWidth: '70%' }}>{cap.title}</span>
                      <span className="text-muted fs-10">{cap.booked} / {cap.capacity} ({percent}%)</span>
                    </div>
                    <ProgressBar now={percent} variant={percent > 90 ? 'danger' : percent > 50 ? 'warning' : 'success'} style={{ height: '5px' }} />
                  </div>
                )
              })}
              {c.capacities.length === 0 && <span className="text-muted text-center py-4 fs-12">No active campaigns monitor.</span>}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* SECTION 3: Pet Census Demographic Analytics */}
      <Row className="g-3">
        <Col xs={12} lg={7}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-light py-3">
              <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                <Icon icon="solar:cat-bold-duotone" className="text-primary" />
                <span>Pet Census Daily Intake Logs</span>
              </h6>
            </Card.Header>
            <Card.Body>
              {censusCounts.length === 0 ? (
                <p className="text-muted text-center py-4 mb-0">No census data recorded in range.</p>
              ) : (
                <ReactApexChart options={censusOptions} series={censusSeries} type="line" height={200} />
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-light py-3">
              <h6 className="mb-0 fw-bold text-dark">Pet Species & Region Splits</h6>
            </Card.Header>
            <Card.Body className="d-flex flex-column justify-content-between gap-3">
              <div>
                <span className="small text-uppercase text-muted fw-bold d-block mb-2">Species Mix</span>
                <div className="d-flex flex-wrap gap-2">
                  {p.petTypes.map((pt) => (
                    <Badge key={pt.type} bg="primary-subtle" className="text-primary border border-primary-subtle p-2 fs-11">
                      {pt.type}: <strong className="text-dark">{pt.count}</strong>
                    </Badge>
                  ))}
                  {p.petTypes.length === 0 && <span className="text-muted fs-11">No species data.</span>}
                </div>
              </div>
              <div>
                <span className="small text-uppercase text-muted fw-bold d-block mb-2">Top Census Zones</span>
                <div className="d-flex flex-column gap-1">
                  {p.zoneBreakdown.slice(0, 3).map((z) => (
                    <div key={z.name} className="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                      <span className="small text-dark fw-semibold">{z.name}</span>
                      <Badge bg="secondary-subtle" className="text-secondary fs-10">{z.count} logs</Badge>
                    </div>
                  ))}
                  {p.zoneBreakdown.length === 0 && <span className="text-muted fs-11">No zone data logged.</span>}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
