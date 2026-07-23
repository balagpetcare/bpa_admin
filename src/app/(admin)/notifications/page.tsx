'use client'

import { useState, useCallback } from 'react'
import { Badge, Button, Card, Form } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { useApi } from '@/hooks/useApi'
import { notificationsApi, type AdminNotification } from '@/lib/api/notifications.api'
import type { ApiError } from '@/lib/api'

const STATUS_TABS = ['all', 'unread', 'read', 'dismissed'] as const
type StatusTab = (typeof STATUS_TABS)[number]

const PRIORITY_COLOR: Record<string, string> = {
  critical: 'danger',
  high: 'warning',
  normal: 'primary',
  low: 'secondary',
}

const TYPE_ICON: Record<string, string> = {
  contact_inquiry: 'solar:letter-bold-duotone',
  membership_purchase: 'solar:card-2-bold-duotone',
  membership_payment_completed: 'solar:card-2-bold-duotone',
  donation_new: 'solar:hand-heart-bold-duotone',
  donation_payment_completed: 'solar:hand-heart-bold-duotone',
  campaign_registration_new: 'solar:calendar-add-bold-duotone',
  campaign_registration_payment_completed: 'solar:calendar-check-bold-duotone',
  pet_census_submission: 'solar:cat-bold-duotone',
  sms_failed: 'solar:chat-square-warning-bold-duotone',
  payment_failed: 'solar:wallet-money-bold-duotone',
  system: 'solar:settings-bold-duotone',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function NotificationsPage() {
  const [statusTab, setStatusTab] = useState<StatusTab>('unread')
  const [priority, setPriority] = useState('')
  const [page, setPage] = useState(1)

  const fetchFn = useCallback(
    () =>
      notificationsApi.list({
        status: statusTab,
        priority: priority || undefined,
        page: String(page),
        limit: '30',
      }),
    [statusTab, priority, page],
  )

  const { data, loading, error, refetch } = useApi(fetchFn, [statusTab, priority, page])
  const items: AdminNotification[] = data?.data ?? []
  const meta = data?.meta ?? null

  const handleMarkRead = async (id: string) => {
    await notificationsApi.markRead(id).catch(() => {})
    refetch()
  }

  const handleDismiss = async (id: string) => {
    await notificationsApi.dismiss(id).catch(() => {})
    refetch()
  }

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead().catch(() => {})
    refetch()
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Notifications"
        breadcrumbs={[{ label: 'Notifications' }]}
        action={
          <Button size="sm" variant="outline-secondary" onClick={handleMarkAllRead}>
            <Icon icon="solar:check-circle-bold" className="me-1" />
            Mark all read
          </Button>
        }
      />

      <ApiErrorAlert error={error as ApiError | null} />

      {/* Status tabs */}
      <div className="d-flex gap-2 mb-3 flex-wrap align-items-center">
        <div className="btn-group">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              className={`btn btn-sm ${statusTab === tab ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => {
                setStatusTab(tab)
                setPage(1)
              }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <Form.Select
          size="sm"
          style={{ maxWidth: 160 }}
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value)
            setPage(1)
          }}>
          <option value="">All priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </Form.Select>
      </div>

      <Card>
        <Card.Body className="p-0">
          {loading && <div className="text-center py-5 text-muted">Loading…</div>}
          {!loading && items.length === 0 && (
            <div className="text-center py-5 text-muted">
              <Icon icon="solar:bell-off-bold-duotone" width={48} className="mb-3 d-block mx-auto opacity-30" />
              <p className="mb-0">No notifications in this category</p>
            </div>
          )}
          {!loading &&
            items.map((n) => (
              <div key={n.id} className={`d-flex align-items-start p-3 border-bottom gap-3 ${n.status === 'unread' ? 'bg-light' : ''}`}>
                <div
                  className={`flex-shrink-0 rounded-circle text-${PRIORITY_COLOR[n.priority] ?? 'primary'} bg-${PRIORITY_COLOR[n.priority] ?? 'primary'} bg-opacity-10`}
                  style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon icon={TYPE_ICON[n.type] ?? 'solar:bell-bold-duotone'} width={20} />
                </div>

                <div className="flex-grow-1 min-width-0">
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                    <span className="fw-semibold">{n.title}</span>
                    <Badge bg={PRIORITY_COLOR[n.priority] ?? 'primary'} className="text-uppercase" style={{ fontSize: '0.65rem' }}>
                      {n.priority}
                    </Badge>
                    {n.module && (
                      <Badge bg="secondary" className="bg-opacity-25 text-secondary text-uppercase" style={{ fontSize: '0.65rem' }}>
                        {n.module}
                      </Badge>
                    )}
                  </div>
                  <p className="mb-0 text-muted small">{n.message}</p>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.7rem' }}>
                    {timeAgo(n.createdAt)}
                  </p>
                </div>

                <div className="flex-shrink-0 d-flex gap-1">
                  {n.status === 'unread' && (
                    <Button size="sm" variant="outline-success" title="Mark read" onClick={() => handleMarkRead(n.id)}>
                      <Icon icon="solar:check-circle-bold" />
                    </Button>
                  )}
                  {n.status !== 'dismissed' && (
                    <Button size="sm" variant="outline-secondary" title="Dismiss" onClick={() => handleDismiss(n.id)}>
                      <Icon icon="solar:close-circle-bold" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
        </Card.Body>
      </Card>

      {meta && meta.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">
            {meta.total} notification{meta.total !== 1 ? 's' : ''} · Page {meta.page} of {meta.totalPages}
          </small>
          <div className="d-flex gap-1">
            <Button size="sm" variant="outline-secondary" disabled={!meta.hasPrev} onClick={() => setPage((p) => p - 1)}>
              ‹
            </Button>
            <Button size="sm" variant="outline-secondary" disabled={!meta.hasNext} onClick={() => setPage((p) => p + 1)}>
              ›
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
