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
      variant: 'success',
      href: '/donations/list?status=success',
    },
    {
      icon: 'solar:sun-bold-duotone',
      label: 'Today Raised',
      value: s.todayRaised != null ? `৳${s.todayRaised.toLocaleString()}` : '—',
      variant: 'primary',
      href: '/donations/list',
    },
    {
      icon: 'solar:calendar-bold-duotone',
      label: 'This Month',
      value: s.monthRaised != null ? `৳${s.monthRaised.toLocaleString()}` : '—',
      variant: 'info',
      href: '/donations/list',
    },
    {
      icon: 'solar:users-group-two-rounded-bold-duotone',
      label: 'Total Donors',
      value: s.successfulDonations.toLocaleString(),
      variant: 'warning',
      href: '/donations/list?status=success',
    },
    {
      icon: 'solar:check-circle-bold-duotone',
      label: 'Paid Donations',
      value: s.successfulDonations.toLocaleString(),
      variant: 'success',
      href: '/donations/list?status=success',
    },
    {
      icon: 'solar:clock-circle-bold-duotone',
      label: 'Pending',
      value: (s.pendingDonations ?? 0).toLocaleString(),
      variant: 'warning',
      href: '/donations/list?status=pending',
    },
    {
      icon: 'solar:close-circle-bold-duotone',
      label: 'Failed',
      value: (s.failedDonations ?? 0).toLocaleString(),
      variant: 'danger',
      href: '/donations/list?status=failed',
    },
    {
      icon: 'solar:qr-code-bold-duotone',
      label: 'QR Donations',
      value: (s.qrDonations ?? 0).toLocaleString(),
      variant: 'secondary',
      href: '/donations/list?source=qr',
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
            <Card className="h-100">
              <Card.Body>
                <Placeholder as="div" animation="glow">
                  <Placeholder xs={8} size="lg" />
                  <Placeholder xs={4} size="sm" className="mt-2" />
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
          <Card className="h-100 card-hover">
            <Card.Body>
              <div className="d-flex align-items-center gap-3">
                <div className={`avatar-md bg-soft-${k.variant} rounded flex-centered flex-shrink-0`}>
                  <Icon icon={k.icon} className={`fs-24 text-${k.variant}`} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-muted mb-0 small text-truncate">{k.label}</p>
                  <h3 className="mb-0 text-dark">{k.value}</h3>
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
