'use client'

import { Row, Col, Card } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import type { AnalyticsSummary } from '@/types/bpa.types'

export default function AnalyticsKpiCards({ summary }: { summary: AnalyticsSummary }) {
  const cards = [
    { icon: 'solar:users-group-two-rounded-bold-duotone', label: 'Total Users',      value: summary.totalUsers ?? 0,     variant: 'primary' },
    { icon: 'solar:calendar-bold-duotone',                label: 'Total Events',     value: summary.totalEvents,          variant: 'success' },
    { icon: 'solar:document-text-bold-duotone',           label: 'Published News',   value: summary.totalNews,            variant: 'info' },
    { icon: 'solar:wallet-bold-duotone',                  label: 'Total Payments',   value: summary.totalPayments,        variant: 'warning' },
  ]

  return (
    <Row className="g-3 mb-4">
      {cards.map((c) => (
        <Col key={c.label} xs={12} sm={6} xl={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center gap-3">
                <div className={`avatar-md bg-soft-${c.variant} rounded flex-centered flex-shrink-0`}>
                  <Icon icon={c.icon} className={`fs-24 text-${c.variant}`} />
                </div>
                <div>
                  <p className="text-muted mb-0 small">{c.label}</p>
                  <h3 className="mb-0 text-dark">{c.value.toLocaleString()}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  )
}
