'use client'

import { useCallback, useState } from 'react'
import { Card, Table, Badge, Form, InputGroup, Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi } from '@/hooks/useApi'
import { registrationsApi } from '@/lib/api/registrations.api'
import type { ApiError } from '@/lib/api'
import type { CampaignRegistration, CampaignRegistrationStatus } from '@/types/bpa.types'

const STATUS_COLORS: Record<CampaignRegistrationStatus, string> = {
  pending_payment: 'warning',
  paid: 'success',
  checked_in: 'info',
  vaccinated: 'primary',
  certificate_issued: 'secondary',
  completed: 'dark',
  no_show: 'danger',
  cancelled: 'danger',
}

export default function RegistrationsList({ campaignId }: { campaignId: string }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const fetchFn = useCallback(
    () => registrationsApi.list({ campaignId, search: search || undefined, status: status || undefined, page, limit: 20 }),
    [campaignId, search, status, page],
  )
  const { data, loading, error } = useApi(fetchFn, [campaignId, search, status, page])

  const items = (data?.items ?? []) as CampaignRegistration[]
  const meta = data?.meta as { total: number; totalPages: number } | undefined

  return (
    <div className="container-fluid">
      <PageHeader
        title="Registrations"
        breadcrumbs={[
          { label: 'Campaigns', href: '/campaigns' },
          { label: 'Detail', href: `/campaigns/${campaignId}` },
          { label: 'Registrations' },
        ]}
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card className="mb-3">
        <Card.Body className="py-2">
          <div className="d-flex gap-2 flex-wrap">
            <InputGroup style={{ maxWidth: 280 }}>
              <InputGroup.Text><Icon icon="solar:magnifer-bold" /></InputGroup.Text>
              <Form.Control placeholder="Search booking / owner…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
            </InputGroup>
            <Form.Select style={{ maxWidth: 180 }} value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
              <option value="">All Statuses</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="paid">Paid</option>
              <option value="checked_in">Checked In</option>
              <option value="vaccinated">Vaccinated</option>
              <option value="completed">Completed</option>
              <option value="no_show">No Show</option>
              <option value="cancelled">Cancelled</option>
            </Form.Select>
          </div>
        </Card.Body>
      </Card>
      <Card>
        <Card.Body className="p-0">
          <LoadingOverlay loading={loading}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Booking #</th>
                  <th>Owner</th>
                  <th>Session</th>
                  <th>Pets</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-4 text-muted">No registrations found</td></tr>
                ) : items.map(r => (
                  <tr key={r.id}>
                    <td><code className="text-primary">{r.bookingNumber}</code></td>
                    <td>
                      <div className="fw-semibold">{r.owner.ownerName}</div>
                      <small className="text-muted">{r.owner.mobile}</small>
                    </td>
                    <td>
                      <div>{new Date(r.session.sessionDate).toLocaleDateString()}</div>
                      <small className="text-muted">{r.session.startTime} · {r.session.venue?.name ?? '—'}</small>
                    </td>
                    <td>{r._count?.petBookings ?? 0}</td>
                    <td>৳{r.totalAmountBdt}</td>
                    <td>
                      <Badge bg={STATUS_COLORS[r.status]} className="text-capitalize">
                        {r.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td><small>{new Date(r.createdAt).toLocaleDateString()}</small></td>
                    <td>
                      <Link href={`/campaigns/${campaignId}/registrations/${r.id}`} className="btn btn-sm btn-soft-primary">
                        <Icon icon="solar:eye-bold" />
                      </Link>
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
            <Button size="sm" variant="soft-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</Button>
            <Button size="sm" variant="soft-secondary" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>›</Button>
          </div>
        </div>
      )}
    </div>
  )
}
