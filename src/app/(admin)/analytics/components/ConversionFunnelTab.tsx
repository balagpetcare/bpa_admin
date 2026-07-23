'use client'

import { Row, Col, Card, ProgressBar, Spinner, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import type { ConversionFunnelData } from '@/lib/api/analytics.api'

interface ConversionFunnelTabProps {
  conversions: ConversionFunnelData | null
  loading: boolean
}

interface FunnelStep {
  stage: string
  count: number
}

function FunnelCard({ title, icon, color, steps }: { title: string; icon: string; color: string; steps: FunnelStep[] }) {
  const baseCount = steps[0]?.count || 1
  const finalCount = steps[steps.length - 1]?.count || 0
  const overallRate = ((finalCount / baseCount) * 100).toFixed(1)

  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="bg-transparent border-light py-3 d-flex align-items-center justify-content-between">
        <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
          <div className={`rounded p-2 bg-soft-${color} text-${color}`} style={{ display: 'inline-flex' }}>
            <Icon icon={icon} width={18} />
          </div>
          <span>{title} Funnel</span>
        </h6>
        <Badge bg={`${color}-subtle`} className={`text-${color} border border-${color}-subtle px-2 py-1`}>
          {overallRate}% Conversion
        </Badge>
      </Card.Header>
      <Card.Body className="d-flex flex-column gap-3 py-4">
        {steps.map((step, idx) => {
          // Retention relative to the very first step
          const pctOfBase = Math.round((step.count / baseCount) * 100)

          // Drop-off from previous step
          let dropOffText = ''
          if (idx > 0) {
            const prevCount = steps[idx - 1].count || 1
            const drop = Math.round(((prevCount - step.count) / prevCount) * 100)
            dropOffText = `-${drop}% drop`
          }

          return (
            <div key={step.stage} className="position-relative">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="small text-dark fw-bold">{step.stage}</span>
                <span className="text-muted small">
                  {step.count.toLocaleString()} <span className="fw-semibold text-dark">({pctOfBase}%)</span>
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="flex-grow-1">
                  <ProgressBar now={pctOfBase} variant={color} style={{ height: '8px' }} />
                </div>
                {dropOffText && (
                  <span className="text-danger fw-bold fs-10 flex-shrink-0" style={{ width: '65px', textAlign: 'right' }}>
                    {dropOffText}
                  </span>
                )}
              </div>
              {idx < steps.length - 1 && (
                <div className="d-flex justify-content-center my-1">
                  <Icon icon="solar:arrow-down-linear" className="text-muted opacity-50" width={14} />
                </div>
              )}
            </div>
          )
        })}
      </Card.Body>
    </Card>
  )
}

export default function ConversionFunnelTab({ conversions, loading }: ConversionFunnelTabProps) {
  const c = conversions ?? { membership: [], donation: [], campaign: [], census: [] }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '300px' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-2 text-muted">Calculating funnels retention rates...</span>
      </div>
    )
  }

  return (
    <Row className="g-3">
      <Col xs={12} md={6}>
        <FunnelCard title="Membership Registration" icon="solar:card-bold-duotone" color="primary" steps={c.membership} />
      </Col>
      <Col xs={12} md={6}>
        <FunnelCard title="Donation Campaign" icon="solar:hand-money-bold-duotone" color="success" steps={c.donation} />
      </Col>
      <Col xs={12} md={6}>
        <FunnelCard title="Campaign Event Bookings" icon="solar:calendar-bold-duotone" color="warning" steps={c.campaign} />
      </Col>
      <Col xs={12} md={6}>
        <FunnelCard title="Pet Census Demographics" icon="solar:cat-bold-duotone" color="info" steps={c.census} />
      </Col>
    </Row>
  )
}
