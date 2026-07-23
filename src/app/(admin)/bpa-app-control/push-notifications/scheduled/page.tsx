'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, Table, Spinner, Button } from 'react-bootstrap'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import { confirmDialog } from '@/components/ui/ConfirmDialog'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { pushNotificationsApi } from '@/lib/api/push-notifications.api'
import CampaignStatusBadge from '../components/CampaignStatusBadge'

export default function ScheduledPage() {
  const { can } = usePermission()
  const canSend = can('notifications:send')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const { data, loading, error, refetch } = useApi(
    () => pushNotificationsApi.listCampaigns({ status: 'scheduled', page, limit }),
    [page, limit],
  )
  const cancelMutation = useApiMutation<unknown, string>()

  const handleCancel = async (id: string, title: string) => {
    const ok = await confirmDialog({ title: `Cancel "${title}"?`, text: 'The scheduled notification will not be sent.', confirmText: 'Cancel campaign' })
    if (!ok) return
    const result = await cancelMutation.mutate((cid) => pushNotificationsApi.cancel(cid), id)
    if (result !== null) refetch()
  }

  return (
    <div>
      <PageHeader title="Scheduled Notifications" />
      <ApiErrorAlert error={error ?? cancelMutation.error} />
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner />
            </div>
          ) : !data || data.data.length === 0 ? (
            <EmptyState title="No scheduled campaigns" description="Notifications scheduled for a future time will appear here." />
          ) : (
            <Table hover responsive className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Scheduled For</th>
                  <th>Est. Reach</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/bpa-app-control/push-notifications/compose?id=${c.id}`}>{c.title}</Link>
                    </td>
                    <td className="text-capitalize">{c.category.replace('_', ' ')}</td>
                    <td>{c.scheduledAt ? new Date(c.scheduledAt).toLocaleString() : '—'}</td>
                    <td>{c.estimatedReach ?? '—'}</td>
                    <td>
                      <CampaignStatusBadge status={c.status} />
                    </td>
                    <td className="text-end">
                      <Button
                        size="sm"
                        variant="outline-danger"
                        disabled={!canSend || cancelMutation.loading}
                        title={!canSend ? 'Requires notifications:send permission' : undefined}
                        onClick={() => handleCancel(c.id, c.title)}>
                        Cancel
                      </Button>
                    </td>
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
                label="campaigns"
              />
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
