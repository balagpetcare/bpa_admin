'use client'

import { useState, useCallback } from 'react'
import { Table, Button, Badge, Form } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import EmptyState from '@/components/ui/EmptyState'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { eventsApi } from '@/lib/api/events.api'
import type { RegistrationStatus, EventRegistration } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

const STATUS_COLOR: Record<RegistrationStatus, string> = {
  pending:   'warning',
  confirmed: 'success',
  cancelled: 'danger',
}

interface RegistrationsTabProps {
  eventId: string
}

export default function RegistrationsTab({ eventId }: RegistrationsTabProps) {
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | ''>('')
  const [page, setPage] = useState(1)

  const fetchFn = useCallback(
    () => eventsApi.listRegistrations(eventId, { page, limit: 20, status: statusFilter || undefined }),
    [eventId, page, statusFilter],
  )
  const { data, loading, error, refetch } = useApi(fetchFn, [eventId, page, statusFilter])
  const regs = data?.data ?? []
  const meta = data?.meta ?? null

  const { mutate, loading: updating } = useApiMutation<EventRegistration, { regId: string; status: RegistrationStatus }>()

  const updateStatus = async (regId: string, newStatus: RegistrationStatus) => {
    await mutate(
      ({ regId: rId, status: s }) => eventsApi.updateRegistrationStatus(eventId, rId, s),
      { regId, status: newStatus },
    )
    refetch()
  }

  return (
    <div>
      <div className="d-flex gap-2 mb-3">
        <Form.Select
          size="sm"
          style={{ width: 180 }}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as RegistrationStatus | ''); setPage(1) }}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </Form.Select>
        {meta && <small className="align-self-center text-muted">{meta.total} registration{meta.total !== 1 ? 's' : ''}</small>}
      </div>

      <ApiErrorAlert error={error as ApiError | null} />

      <LoadingOverlay loading={loading || updating}>
        <div className="table-responsive">
          <Table hover className="table-centered align-middle mb-0" size="sm">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {regs.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState icon="solar:users-group-two-rounded-bold-duotone" title="No registrations" description="No registrations match the current filter." />
                  </td>
                </tr>
              ) : (
                regs.map((reg) => (
                  <tr key={reg.id}>
                    <td className="fw-semibold">{reg.name}</td>
                    <td>{reg.email}</td>
                    <td>{reg.phone ?? <span className="text-muted">—</span>}</td>
                    <td>
                      <Badge bg={STATUS_COLOR[reg.status]} className="text-capitalize">{reg.status}</Badge>
                    </td>
                    <td className="small">{new Date(reg.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="d-flex gap-1">
                        {reg.status !== 'confirmed' && (
                          <Button variant="soft-success" size="sm" onClick={() => updateStatus(reg.id, 'confirmed')} title="Confirm">
                            <Icon icon="solar:check-circle-bold" />
                          </Button>
                        )}
                        {reg.status !== 'cancelled' && (
                          <Button variant="soft-danger" size="sm" onClick={() => updateStatus(reg.id, 'cancelled')} title="Cancel">
                            <Icon icon="solar:close-circle-bold" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </LoadingOverlay>

      {meta && meta.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">Page {meta.page} of {meta.totalPages}</small>
          <div className="d-flex gap-1">
            <Button size="sm" variant="outline-secondary" disabled={!meta.hasPrev} onClick={() => setPage(p => p - 1)}>‹</Button>
            <Button size="sm" variant="outline-secondary" disabled={!meta.hasNext} onClick={() => setPage(p => p + 1)}>›</Button>
          </div>
        </div>
      )}
    </div>
  )
}
