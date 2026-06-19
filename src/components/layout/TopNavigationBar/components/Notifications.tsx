'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Badge, Dropdown, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'
import { notificationsApi, type AdminNotification } from '@/lib/api/notifications.api'

const PRIORITY_COLOR: Record<string, string> = {
  critical: 'danger',
  high:     'warning',
  normal:   'primary',
  low:      'secondary',
}

const TYPE_ICON: Record<string, string> = {
  contact_inquiry:                         'solar:letter-bold-duotone',
  membership_purchase:                     'solar:card-2-bold-duotone',
  membership_payment_completed:            'solar:card-2-bold-duotone',
  donation_new:                            'solar:hand-heart-bold-duotone',
  donation_payment_completed:              'solar:hand-heart-bold-duotone',
  campaign_registration_new:               'solar:calendar-add-bold-duotone',
  campaign_registration_payment_completed: 'solar:calendar-check-bold-duotone',
  pet_census_submission:                   'solar:cat-bold-duotone',
  sms_failed:                              'solar:chat-square-warning-bold-duotone',
  payment_failed:                          'solar:wallet-money-bold-duotone',
  system:                                  'solar:settings-bold-duotone',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const Notifications = () => {
  const [items, setItems]   = useState<AdminNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const [open, setOpen]     = useState(false)
  const intervalRef         = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationsApi.unreadCount()
      setUnread(res?.count ?? 0)
    } catch {}
  }

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await notificationsApi.list({ limit: '10', status: 'unread' })
      setItems(res.data ?? [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchUnreadCount()
    intervalRef.current = setInterval(fetchUnreadCount, 60_000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const handleToggle = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) fetchNotifications()
  }

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id)
      setItems(prev => prev.map(n => n.id === id ? { ...n, status: 'read' as const } : n))
      setUnread(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead()
      setItems(prev => prev.map(n => ({ ...n, status: 'read' as const })))
      setUnread(0)
    } catch {}
  }

  return (
    <Dropdown className="topbar-item" show={open} onToggle={handleToggle}>
      <DropdownToggle
        as="a"
        role="button"
        className="topbar-button position-relative content-none"
        id="page-header-notifications-dropdown"
        aria-haspopup="true"
        aria-expanded={open}>
        <IconifyIcon icon="solar:bell-bing-bold-duotone" className="fs-24 align-middle" />
        {unread > 0 && (
          <Badge
            bg="danger"
            pill
            className="position-absolute top-0 start-100 translate-middle"
            style={{ fontSize: '0.65rem', minWidth: '1.2rem' }}>
            {unread > 99 ? '99+' : unread}
          </Badge>
        )}
      </DropdownToggle>

      <DropdownMenu className="py-0 dropdown-lg dropdown-menu-end" aria-labelledby="page-header-notifications-dropdown">
        <div className="p-3 border-bottom border-dashed">
          <Row className="align-items-center">
            <div className="col">
              <h6 className="m-0 fs-16 fw-semibold">
                Notifications
                {unread > 0 && <Badge bg="danger" className="ms-2">{unread}</Badge>}
              </h6>
            </div>
            {unread > 0 && (
              <div className="col-auto">
                <button className="btn btn-link btn-sm p-0 text-muted" onClick={handleMarkAllRead}>
                  Mark all read
                </button>
              </div>
            )}
          </Row>
        </div>

        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
          {loading && (
            <div className="text-center py-3 text-muted small">Loading…</div>
          )}
          {!loading && items.length === 0 && (
            <div className="text-center py-4 text-muted">
              <IconifyIcon icon="solar:bell-off-bold-duotone" className="fs-36 mb-2 d-block mx-auto" />
              <p className="mb-0 small">No unread notifications</p>
            </div>
          )}
          {!loading && items.map(n => (
            <div
              key={n.id}
              className={`d-flex align-items-start p-3 border-bottom border-dashed gap-2 ${n.status === 'unread' ? 'bg-light' : ''}`}>
              <div
                className={`flex-shrink-0 rounded-circle p-1 text-${PRIORITY_COLOR[n.priority] ?? 'primary'} bg-${PRIORITY_COLOR[n.priority] ?? 'primary'} bg-opacity-10`}
                style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconifyIcon icon={TYPE_ICON[n.type] ?? 'solar:bell-bold-duotone'} className="fs-18" />
              </div>
              <div className="flex-grow-1 overflow-hidden">
                <p className="mb-0 fw-semibold text-truncate small">{n.title}</p>
                <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>{n.message}</p>
                <p className="mb-0 text-muted" style={{ fontSize: '0.7rem' }}>{timeAgo(n.createdAt)}</p>
              </div>
              {n.status === 'unread' && (
                <button className="btn btn-link btn-sm p-0 text-muted flex-shrink-0" title="Mark read" onClick={() => handleMarkRead(n.id)}>
                  <IconifyIcon icon="solar:check-circle-bold-duotone" className="fs-16" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="p-2 text-center border-top">
          <Link href="/notifications" className="btn btn-link btn-sm text-muted" onClick={() => setOpen(false)}>
            View all notifications
          </Link>
        </div>
      </DropdownMenu>
    </Dropdown>
  )
}

export default Notifications
