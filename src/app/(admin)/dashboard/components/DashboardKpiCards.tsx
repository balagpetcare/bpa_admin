'use client'

import { Row, Col, Card } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import type { AnalyticsSummary } from '@/types/bpa.types'

interface KpiItem {
  icon: string
  label: string
  value: number
  variant: string
  href: string
}

function buildKpis(s: AnalyticsSummary): KpiItem[] {
  return [
    { icon: 'solar:users-group-two-rounded-bold-duotone', label: 'Total Users',      value: s.totalUsers ?? 0,          variant: 'primary', href: '/users' },
    { icon: 'solar:document-text-bold-duotone',           label: 'Total News',       value: s.totalNews,                variant: 'info',    href: '/cms/news' },
    { icon: 'solar:calendar-bold-duotone',                label: 'Total Events',     value: s.totalEvents,              variant: 'success', href: '/cms/events' },
    { icon: 'solar:hand-heart-bold-duotone',              label: 'Volunteers',       value: s.totalVolunteers ?? 0,     variant: 'warning', href: '/volunteers' },
    { icon: 'solar:letter-bold-duotone',                  label: 'Total Contacts',   value: s.totalContacts ?? 0,       variant: 'secondary', href: '/contacts' },
    { icon: 'solar:gallery-bold-duotone',                 label: 'Media Files',      value: s.totalMedia ?? 0,          variant: 'dark',    href: '/media' },
    { icon: 'solar:clock-circle-bold-duotone',            label: 'Pending Volunteers', value: s.pendingVolunteers,      variant: 'warning', href: '/volunteers?status=pending' },
    { icon: 'solar:bell-bold-duotone',                    label: 'Unread Contacts',  value: s.unreadContacts,           variant: 'danger',  href: '/contacts?status=unread' },
  ]
}

export default function DashboardKpiCards({ summary }: { summary: AnalyticsSummary }) {
  const kpis = buildKpis(summary)
  return (
    <Row className="g-3 mb-4">
      {kpis.map((k) => (
        <Col key={k.label} xs={12} sm={6} xl={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center gap-3">
                <div className={`avatar-md bg-soft-${k.variant} rounded flex-centered flex-shrink-0`}>
                  <Icon icon={k.icon} className={`fs-24 text-${k.variant}`} />
                </div>
                <div>
                  <p className="text-muted mb-0 small">{k.label}</p>
                  <h3 className="mb-0 text-dark">{k.value.toLocaleString()}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  )
}
