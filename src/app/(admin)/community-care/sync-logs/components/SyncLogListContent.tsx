'use client'

import { useState } from 'react'
import { Card, Button, Table, Row, Col, Form, Badge } from 'react-bootstrap'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi } from '@/hooks/useApi'
import { petSmartSolutionApi } from '@/lib/api/pet-smart-solution.api'
import type { ApiError } from '@/lib/api'
import type { PetSmartSyncLog, PetSmartSyncStatus } from '@/types/bpa.types'

const STATUS_VARIANTS: Record<PetSmartSyncStatus, string> = {
  success: 'success',
  failed: 'danger',
  pending: 'warning',
  skipped: 'secondary',
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
  { value: 'pending', label: 'Pending' },
  { value: 'skipped', label: 'Skipped' },
]

const SYNC_TYPE_OPTIONS = [
  { value: '', label: 'All Sync Types' },
  { value: 'contributors', label: 'Contributors' },
  { value: 'care_partner_cards', label: 'Care Partner Cards' },
  { value: 'pet_census_leads', label: 'Pet Census Leads' },
  { value: 'zones', label: 'Zones' },
]

export default function SyncLogListContent() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<PetSmartSyncStatus | ''>('')
  const [syncType, setSyncType] = useState('')

  const { data, loading, error } = useApi(
    () => petSmartSolutionApi.listSyncLogs({ page, limit: 30, status: status || undefined, syncType: syncType || undefined }),
    [page, status, syncType],
  )
  const logs = data?.data ?? []
  const meta = data?.meta ?? null

  return (
    <div className="container-fluid">
      <PageHeader title="PSS Sync Logs" breadcrumbs={[{ label: 'Community Care Fund' }, { label: 'Sync Logs' }]} />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <Row className="g-2 mb-3">
            <Col md={4}>
              <Form.Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as PetSmartSyncStatus | '')
                  setPage(1)
                }}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select
                value={syncType}
                onChange={(e) => {
                  setSyncType(e.target.value)
                  setPage(1)
                }}>
                {SYNC_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <LoadingOverlay loading={loading}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Sync Type</th>
                  <th>Entity</th>
                  <th>Status</th>
                  <th>Started</th>
                  <th>Finished</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      No sync logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log: PetSmartSyncLog) => (
                    <tr key={log.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/community-care/sync-logs/${log.id}`)}>
                      <td className="small text-capitalize">{log.syncType.replace(/_/g, ' ')}</td>
                      <td>
                        <div className="small text-capitalize">{log.entityType.replace(/_/g, ' ')}</div>
                        <div className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
                          {log.entityId.slice(0, 12)}...
                        </div>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <Badge bg={`${STATUS_VARIANTS[log.status]}-subtle`} text={STATUS_VARIANTS[log.status]}>
                          {log.status}
                        </Badge>
                      </td>
                      <td className="small">{new Date(log.startedAt).toLocaleString()}</td>
                      <td className="small">{log.finishedAt ? new Date(log.finishedAt).toLocaleString() : 'In progress'}</td>
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        <Button variant="soft-primary" size="sm" onClick={() => router.push(`/community-care/sync-logs/${log.id}`)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </LoadingOverlay>

          {meta && meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                {meta.total} logs - Page {meta.page} of {meta.totalPages}
              </small>
              <div className="d-flex gap-1">
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasPrev} onClick={() => setPage((p) => p - 1)}>
                  Prev
                </Button>
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasNext} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
