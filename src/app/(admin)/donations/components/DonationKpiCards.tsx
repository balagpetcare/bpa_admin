'use client'

import { Row, Col, Card, Placeholder } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import type { DonationDashboardStats } from '@/lib/api/donations.api'

interface KpiItem {
  icon: string
  label: string
  value: string
  sub?: string
  variant: string
  href: string
}

function buildKpis(s: DonationDashboardStats): KpiItem[] {
  return [
    {
      icon: 'solar:dollar-minimalistic-bold-duotone',
      label: 'Total Raised',
      value: `৳${s.totalRaised.toLocaleString()}`,
      sub: `Avg: ৳${Math.round(s.averageDonationAmount).toLocaleString()}`,
      variant: 'success',
      href: '/donations/list?status=success',
    },
    {
      icon: 'solar:sun-bold-duotone',
      label: 'Today Raised',
      value: `৳${s.todayRaised.toLocaleString()}`,
      sub: `Week: ৳${(s.thisWeekAmount ?? 0).toLocaleString()}`,
      variant: 'primary',
      href: '/donations/list?status=success',
    },
    {
      icon: 'solar:calendar-bold-duotone',
      label: 'This Month Raised',
      value: `৳${s.monthRaised.toLocaleString()}`,
      sub: 'Audited monthly target',
      variant: 'info',
      href: '/donations/list?status=success',
    },
    {
      icon: 'solar:users-group-two-rounded-bold-duotone',
      label: 'Unique Donors',
      value: s.donorCount.toLocaleString(),
      sub: `${s.recurringDonorCount} recurring supporters`,
      variant: 'warning',
      href: '/donations/list?status=success',
    },
    {
      icon: 'solar:check-circle-bold-duotone',
      label: 'Completed Donations',
      value: s.successfulDonations.toLocaleString(),
      sub: `Out of ${s.totalDonations} initiated`,
      variant: 'success',
      href: '/donations/list?status=success',
    },
    {
      icon: 'solar:clock-circle-bold-duotone',
      label: 'Pending Verification',
      value: s.pendingDonations.toLocaleString(),
      sub: `৳${s.pendingAmount.toLocaleString()} in review`,
      variant: 'warning',
      href: '/donations/list?status=pending_review',
    },
    {
      icon: 'solar:close-circle-bold-duotone',
      label: 'Failed / Cancelled',
      value: s.failedDonations.toLocaleString(),
      sub: `৳${s.failedAmount.toLocaleString()} lost/abandoned`,
      variant: 'danger',
      href: '/donations/list?status=failed',
    },
    {
      icon: 'solar:qr-code-bold-duotone',
      label: 'QR & Sources',
      value: s.qrDonations.toLocaleString(),
      sub: 'Mobile wallet & QR scans',
      variant: 'secondary',
      href: '/donations/list',
    },
  ]
}

interface Props {
  stats: DonationDashboardStats | null
  loading: boolean
}

export default function DonationKpiCards({ stats, loading }: Props) {
  if (loading || !stats) {
    return (
      <Row className="g-3 mb-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Col key={i} xs={12} sm={6} xl={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <Placeholder as="div" animation="glow">
                  <Placeholder xs={8} size="lg" className="mb-2" />
                  <Placeholder xs={5} size="xs" />
                </Placeholder>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    )
  }

  const kpis = buildKpis(stats)

  return (
    <Row className="g-3 mb-4">
      {kpis.map((k) => (
        <Col key={k.label} xs={12} sm={6} xl={3}>
          <Card className="h-100 border-0 shadow-sm card-hover">
            <Card.Body>
              <div className="d-flex align-items-center gap-3">
                <div className={`avatar-md bg-soft-${k.variant} rounded flex-centered flex-shrink-0`} style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon icon={k.icon} className={`fs-24 text-${k.variant}`} style={{ fontSize: '24px' }} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-muted mb-0 small text-truncate fw-semibold">{k.label}</p>
                  <h4 className="mb-0 text-dark fw-bold">{k.value}</h4>
                  {k.sub && <span className="text-muted fs-11 text-truncate d-block">{k.sub}</span>}
                </div>
              </div>
              <Link href={k.href} className="stretched-link" aria-label={k.label} />
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  )
}
