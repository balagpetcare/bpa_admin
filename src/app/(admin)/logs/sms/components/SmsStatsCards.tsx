'use client'

import { Card, Row, Col, Alert } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import type { SmsStats } from '@/lib/api/sms-logs.api'

interface Props {
  stats: SmsStats | null
  loading: boolean
}

export default function SmsStatsCards({ stats, loading }: Props) {
  if (loading || !stats) {
    return (
      <Row className="g-3 mb-4">
        {[...Array(5)].map((_, i) => (
          <Col key={i} xs={6} sm={4} md={2}>
            <Card className="text-center">
              <Card.Body className="py-3">
                <div className="placeholder-glow">
                  <span className="placeholder col-6" />
                </div>
                <div className="placeholder-glow mt-1">
                  <span className="placeholder col-4" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    )
  }

  const cards = [
    { label: 'Total', value: stats.total, icon: 'solar:chat-round-bold-duotone', color: 'text-primary' },
    { label: 'Sent', value: stats.sent, icon: 'solar:check-circle-bold-duotone', color: 'text-success' },
    { label: 'Failed', value: stats.failed, icon: 'solar:close-circle-bold-duotone', color: 'text-danger' },
    { label: 'Queued', value: stats.queued, icon: 'solar:clock-circle-bold-duotone', color: 'text-secondary' },
    { label: 'Failed 24h', value: stats.failedLast24h, icon: 'solar:danger-bold-duotone', color: 'text-warning' },
    { label: 'Balance Issues', value: stats.insufficientBalanceCount, icon: 'solar:wallet-bold-duotone', color: 'text-danger' },
  ]

  return (
    <>
      {stats.possibleGatewayIssue && (
        <Alert variant="warning" className="d-flex align-items-center gap-2 mb-3">
          <Icon icon="solar:danger-bold-duotone" width={20} />
          <strong>Gateway issue detected:</strong> {stats.recentFailuresLast60min} failures in the last 60 minutes may indicate low SMS gateway
          balance or connectivity issue. Please check your gateway account and retry failed messages after recharge.
        </Alert>
      )}
      <Row className="g-3 mb-4">
        {cards.map((c) => (
          <Col key={c.label} xs={6} sm={4} md={2}>
            <Card className="text-center h-100">
              <Card.Body className="py-3">
                <Icon icon={c.icon} width={24} className={`${c.color} mb-1`} />
                <div className="fw-bold fs-5">{c.value.toLocaleString()}</div>
                <div className="text-muted small">{c.label}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}
