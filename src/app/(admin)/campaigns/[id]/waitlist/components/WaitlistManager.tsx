'use client'

import { useCallback, useState } from 'react'
import { Card, Table, Badge, Form, Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { registrationsApi } from '@/lib/api/registrations.api'
import type { ApiError } from '@/lib/api'
import type { CampaignWaitlistEntry, WaitlistStatus } from '@/types/bpa.types'

const STATUS_COLORS: Record<WaitlistStatus, string> = {
  waiting: 'warning',
  promoted: 'success',
  expired: 'secondary',
  cancelled: 'danger',
}

export default function WaitlistManager({ campaignId }: { campaignId: string }) {
  const { can } = usePermission()
  const [status, setStatus] = useState('waiting')
  const [page, setPage] = useState(1)
  const { mutate } = useApiMutation<unknown, unknown>()

  const fetchFn = useCallback(
    () => registrationsApi.listWaitlist({ campaignId, status: status || undefined, page, limit: 20 }),
    [campaignId, status, page],
  )
  const { data, loading, error, refetch } = useApi(fetchFn, [campaignId, status, page])

  const items = (data?.items ?? []) as CampaignWaitlistEntry[]
  const meta = data?.meta as { totalPages: number } | undefined

  async function handleCancel(id: string) {
    if (!confirm('Remove this entry from the waitlist?')) return
    await mutate(() => registrationsApi.cancelWaitlist(id), undefined)
    refetch()
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Waitlist"
        breadcrumbs={[
          { label: 'Campaigns', href: '/campaigns' },
          { label: 'Detail', href: `/campaigns/${campaignId}` },
          { label: 'Waitlist' },
        ]}
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card className="mb-3">
        <Card.Body className="py-2">
          <Form.Select style={{ maxWidth: 180 }} value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
            <option value="">All</option>
            <option value="waiting">Waiting</option>
            <option value="promoted">Promoted</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </Form.Select>
        </Card.Body>
      </Card>
      <Card>
        <Card.Body className="p-0">
          <LoadingOverlay loading={loading}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Owner</th>
                  <th>Session</th>
                  <th>Pets</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Expires</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-4 text-muted">No waitlist entries</td></tr>
                ) : items.map(w => (
                  <tr key={w.id}>
                    <td><Badge bg="secondary">{w.position}</Badge></td>
                    <td>
                      <div className="fw-semibold">{w.owner.ownerName}</div>
                      <small className="text-muted">{w.owner.mobile}</small>
                    </td>
                    <td>
                      <div>{new Date(w.session.sessionDate).toLocaleDateString()}</div>
                      <small className="text-muted">{w.session.startTime} · {w.session.venue?.name ?? '—'}</small>
                    </td>
                    <td>{w.petCount}</td>
                    <td>
                      <Badge bg={STATUS_COLORS[w.status]} className="text-capitalize">{w.status}</Badge>
                    </td>
                    <td><small>{new Date(w.createdAt).toLocaleDateString()}</small></td>
                    <td><small>{w.expiresAt ? new Date(w.expiresAt).toLocaleString() : '—'}</small></td>
                    <td>
                      {w.status === 'waiting' && can('campaign_registrations:delete') && (
                        <Button variant="soft-danger" size="sm" onClick={() => handleCancel(w.id)}>
                          <Icon icon="solar:trash-bin-trash-bold" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </LoadingOverlay>
        </Card.Body>
      </Card>
      {meta && meta.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">Page {page} of {meta.totalPages}</small>
          <div className="d-flex gap-1">
            <Button size="sm" variant="outline-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</Button>
            <Button size="sm" variant="outline-secondary" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>›</Button>
          </div>
        </div>
      )}
    </div>
  )
}
