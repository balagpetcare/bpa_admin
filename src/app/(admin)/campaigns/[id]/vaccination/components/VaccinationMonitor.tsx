'use client'

import { useCallback, useState } from 'react'
import { Card, Table, Badge, Form, InputGroup, Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi } from '@/hooks/useApi'
import { checkinApi } from '@/lib/api/checkin.api'
import type { ApiError } from '@/lib/api'
import type { VaccinationRecord } from '@/types/bpa.types'

export default function VaccinationMonitor({ campaignId }: { campaignId: string }) {
  const [page, setPage] = useState(1)

  const fetchFn = useCallback(
    () => checkinApi.listVaccinationRecords({ campaignId, page, limit: 30 }),
    [campaignId, page],
  )
  const { data, loading, error } = useApi(fetchFn, [campaignId, page])

  const items = (data?.items ?? []) as VaccinationRecord[]
  const meta = data?.meta as { totalPages: number } | undefined

  return (
    <div className="container-fluid">
      <PageHeader
        title="Vaccination Records"
        breadcrumbs={[
          { label: 'Campaigns', href: '/campaigns' },
          { label: 'Detail', href: `/campaigns/${campaignId}` },
          { label: 'Vaccinations' },
        ]}
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body className="p-0">
          <LoadingOverlay loading={loading}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Pet</th>
                  <th>Vaccine</th>
                  <th>Batch #</th>
                  <th>Administered</th>
                  <th>Next Due</th>
                  <th>Doctor</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4 text-muted">No vaccination records yet</td></tr>
                ) : items.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div className="fw-semibold">{(r as unknown as { pet?: { name?: string } }).pet?.name ?? '—'}</div>
                      <small className="text-muted text-capitalize">{(r as unknown as { pet?: { petType?: string } }).pet?.petType}</small>
                    </td>
                    <td>{r.vaccineName}</td>
                    <td>{r.batchNumber ? <code>{r.batchNumber}</code> : <span className="text-muted">—</span>}</td>
                    <td>{new Date(r.administeredAt).toLocaleString()}</td>
                    <td>
                      {r.nextDueDate
                        ? <Badge bg="info">{new Date(r.nextDueDate).toLocaleDateString()}</Badge>
                        : <span className="text-muted">—</span>
                      }
                    </td>
                    <td>{r.doctor?.name ?? <span className="text-muted">—</span>}</td>
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
