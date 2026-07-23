'use client'

import { useState } from 'react'
import { Card, Table, Spinner, Button, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { pushNotificationsApi } from '@/lib/api/push-notifications.api'

export default function FailedDeliveriesPage() {
  const { can } = usePermission()
  const canSend = can('notifications:send')

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const { data, loading, error, refetch } = useApi(() => pushNotificationsApi.listFailedDeliveries({ page, limit }), [page, limit])

  const retryMutation = useApiMutation<{ retried: boolean }, string>()
  const [retriedIds, setRetriedIds] = useState<Set<string>>(new Set())

  const handleRetry = async (id: string) => {
    const result = await retryMutation.mutate((did) => pushNotificationsApi.retryDelivery(did), id)
    if (result) {
      setRetriedIds((prev) => new Set(prev).add(id))
      refetch()
    }
  }

  return (
    <div>
      <PageHeader title="Failed Deliveries" />
      <ApiErrorAlert error={error ?? retryMutation.error} />
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner />
            </div>
          ) : !data || data.data.length === 0 ? (
            <EmptyState title="No failed deliveries" description="Failed or invalid-token deliveries will show up here for retry." icon="solar:check-circle-bold-duotone" />
          ) : (
            <Table hover responsive className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Last Error</th>
                  <th>Retries</th>
                  <th>Failed At</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((d) => (
                  <tr key={d.id}>
                    <td className="small">{d.campaignId}</td>
                    <td className="small">{d.userId}</td>
                    <td>
                      <Badge bg={d.status === 'invalid_token' ? 'dark' : 'danger'} className="text-capitalize">
                        {d.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="small text-danger">{d.lastError ?? '—'}</td>
                    <td>{d.retryCount}</td>
                    <td className="small text-muted">{d.failedAt ? new Date(d.failedAt).toLocaleString() : '—'}</td>
                    <td className="text-end">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        disabled={!canSend || retryMutation.loading || retriedIds.has(d.id)}
                        title={!canSend ? 'Requires notifications:send permission' : undefined}
                        onClick={() => handleRetry(d.id)}>
                        <Icon icon="solar:refresh-bold-duotone" className="me-1" />
                        {retriedIds.has(d.id) ? 'Retried' : 'Retry'}
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
                label="failed deliveries"
              />
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
