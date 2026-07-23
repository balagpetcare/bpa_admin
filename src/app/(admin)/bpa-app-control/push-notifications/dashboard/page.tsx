'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Card, Col, Row, Table, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import EmptyState from '@/components/ui/EmptyState'
import { useApi } from '@/hooks/useApi'
import { pushNotificationsApi } from '@/lib/api/push-notifications.api'
import CampaignStatusBadge from '../components/CampaignStatusBadge'

function isWithinDays(iso: string | null, days: number): boolean {
  if (!iso) return false
  const then = new Date(iso).getTime()
  return Date.now() - then <= days * 24 * 60 * 60 * 1000
}

export default function PushNotificationsDashboardPage() {
  const { data: sentData, loading: sentLoading, error: sentError } = useApi(
    () => pushNotificationsApi.listCampaigns({ status: 'sent', limit: 100 }),
    [],
  )
  const { data: recentData, loading: recentLoading, error: recentError } = useApi(
    () => pushNotificationsApi.listCampaigns({ limit: 10 }),
    [],
  )

  const stats = useMemo(() => {
    const items = sentData?.data ?? []
    const sentThisWeek = items.filter((c) => isWithinDays(c.sentAt, 7)).length
    const sentThisMonth = items.filter((c) => isWithinDays(c.sentAt, 30)).length
    const totals = items.reduce(
      (acc, c) => {
        acc.attempted += c.attemptedCount || 0
        acc.accepted += c.acceptedCount || 0
        acc.opened += c.openedCount || 0
        acc.targeted += c.targetedCount || 0
        return acc
      },
      { attempted: 0, accepted: 0, opened: 0, targeted: 0 },
    )
    const successRate = totals.attempted > 0 ? (totals.accepted / totals.attempted) * 100 : null
    const openRate = totals.accepted > 0 ? (totals.opened / totals.accepted) * 100 : null
    return { sentThisWeek, sentThisMonth, successRate, openRate }
  }, [sentData])

  return (
    <div>
      <PageHeader
        title="Notifications Dashboard"
        breadcrumbs={[{ label: 'BPA App Control', href: '/bpa-app-control' }, { label: 'Push Notifications' }]}
        action={
          <Link href="/bpa-app-control/push-notifications/compose" className="btn btn-primary btn-sm">
            <Icon icon="solar:pen-new-square-bold-duotone" className="me-1" />
            Compose Notification
          </Link>
        }
      />

      <ApiErrorAlert error={sentError ?? recentError} />

      <Row className="g-3 mb-4">
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="text-muted small mb-1">Sent This Week</div>
              <h3 className="mb-0">{sentLoading ? <Spinner size="sm" /> : stats.sentThisWeek}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="text-muted small mb-1">Sent This Month</div>
              <h3 className="mb-0">{sentLoading ? <Spinner size="sm" /> : stats.sentThisMonth}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="text-muted small mb-1">Delivery Success Rate</div>
              <h3 className="mb-0">
                {sentLoading ? <Spinner size="sm" /> : stats.successRate === null ? '—' : `${stats.successRate.toFixed(1)}%`}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="text-muted small mb-1">Open Rate</div>
              <h3 className="mb-0">{sentLoading ? <Spinner size="sm" /> : stats.openRate === null ? '—' : `${stats.openRate.toFixed(1)}%`}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-transparent">
          <strong>Recent Campaigns</strong>
        </Card.Header>
        <Card.Body className="p-0">
          {recentLoading ? (
            <div className="text-center py-5">
              <Spinner />
            </div>
          ) : !recentData || recentData.data.length === 0 ? (
            <EmptyState title="No campaigns yet" description="Compose your first notification campaign." />
          ) : (
            <Table hover responsive className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Targeted</th>
                  <th>Accepted</th>
                  <th>Opened</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentData.data.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/bpa-app-control/push-notifications/compose?id=${c.id}`}>{c.title}</Link>
                    </td>
                    <td className="text-capitalize">{c.category.replace('_', ' ')}</td>
                    <td>
                      <CampaignStatusBadge status={c.status} />
                    </td>
                    <td>{c.targetedCount}</td>
                    <td>{c.acceptedCount}</td>
                    <td>{c.openedCount}</td>
                    <td className="small text-muted">{new Date(c.updatedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
