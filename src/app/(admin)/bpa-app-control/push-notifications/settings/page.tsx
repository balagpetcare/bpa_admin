'use client'

import { useState } from 'react'
import { Card, Table, Spinner, Alert } from 'react-bootstrap'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import { useApi } from '@/hooks/useApi'
import { pushNotificationsApi } from '@/lib/api/push-notifications.api'

// Kept intentionally minimal: the admin push-notifications API contract does
// not currently expose a Firebase/queue health endpoint or configurable
// toggles, so this page only surfaces the one real thing available — the
// campaign lifecycle audit trail — rather than fabricating settings that
// wouldn't do anything.
export default function PushNotificationSettingsPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const { data, loading, error } = useApi(() => pushNotificationsApi.listAudit({ page, limit }), [page, limit])

  return (
    <div>
      <PageHeader title="Notification Settings" />

      <Alert variant="secondary" className="small">
        Firebase / queue health and other admin-configurable toggles are not yet exposed by the push-notifications admin API. This page
        will be extended once those endpoints exist. Below is the real campaign audit trail from <code>GET /admin/push-notifications/audit</code>.
      </Alert>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-transparent">
          <strong>Campaign Audit Trail</strong>
        </Card.Header>
        <Card.Body className="p-0">
          <ApiErrorAlert error={error} />
          {loading ? (
            <div className="text-center py-5">
              <Spinner />
            </div>
          ) : !data || data.data.length === 0 ? (
            <EmptyState title="No audit events yet" description="Campaign create/approve/send/cancel events will appear here." />
          ) : (
            <Table hover responsive className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Campaign</th>
                  <th>Action</th>
                  <th>Actor</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((e) => (
                  <tr key={e.id}>
                    <td className="small text-muted">{new Date(e.createdAt).toLocaleString()}</td>
                    <td className="small">{e.campaignId}</td>
                    <td className="text-capitalize">{e.action.replace(/_/g, ' ')}</td>
                    <td className="small">{e.actorName ?? e.actorId ?? 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          {data && (
            <div className="px-3 pb-3">
              <Pagination
                page={data.meta.page}
                limit={data.meta.limit}
                total={data.meta.total}
                totalPages={data.meta.totalPages}
                hasPrev={data.meta.hasPrev}
                hasNext={data.meta.hasNext}
                onPageChange={setPage}
                onLimitChange={setLimit}
                label="events"
              />
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
