'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, Table, Spinner, Form } from 'react-bootstrap'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import { useApi } from '@/hooks/useApi'
import { pushNotificationsApi, type CampaignStatus } from '@/lib/api/push-notifications.api'
import CampaignStatusBadge from '../components/CampaignStatusBadge'

function pct(n: number, d: number): string {
  if (d <= 0) return '—'
  return `${((n / d) * 100).toFixed(1)}%`
}

export default function DeliveryReportsPage() {
  const [status, setStatus] = useState<CampaignStatus | ''>('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const { data, loading, error } = useApi(
    () => pushNotificationsApi.listCampaigns({ status: status || undefined, page, limit }),
    [status, page, limit],
  )

  return (
    <div>
      <PageHeader
        title="Delivery Reports"
        action={
          <Form.Select
            size="sm"
            style={{ width: 200 }}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as CampaignStatus | '')
              setPage(1)
            }}>
            <option value="">All statuses</option>
            <option value="sent">Sent</option>
            <option value="sending">Sending</option>
            <option value="scheduled">Scheduled</option>
            <option value="failed">Failed</option>
          </Form.Select>
        }
      />
      <ApiErrorAlert error={error} />
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner />
            </div>
          ) : !data || data.data.length === 0 ? (
            <EmptyState title="No delivery data" description="Analytics appear once campaigns are sent." />
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Targeted</th>
                    <th>Attempted</th>
                    <th>Accepted</th>
                    <th>Failed</th>
                    <th>Opened</th>
                    <th>Clicked</th>
                    <th>Delivery Rate</th>
                    <th>Open Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Link href={`/bpa-app-control/push-notifications/compose?id=${c.id}`}>{c.title}</Link>
                      </td>
                      <td>
                        <CampaignStatusBadge status={c.status} />
                      </td>
                      <td>{c.targetedCount}</td>
                      <td>{c.attemptedCount}</td>
                      <td>{c.acceptedCount}</td>
                      <td>{c.failedCount}</td>
                      <td>{c.openedCount}</td>
                      <td>{c.clickedCount}</td>
                      <td>{pct(c.acceptedCount, c.attemptedCount)}</td>
                      <td>{pct(c.openedCount, c.acceptedCount)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
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
