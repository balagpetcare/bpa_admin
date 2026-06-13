'use client'

import { useCallback, useState } from 'react'
import { Card, Table, Badge, Button } from 'react-bootstrap'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi } from '@/hooks/useApi'
import { campaignAnalyticsApi } from '@/lib/api/campaign-analytics.api'
import type { ApiError } from '@/lib/api'
import type { QRScanLog } from '@/types/bpa.types'

export default function QrScanLogsView({ campaignId }: { campaignId: string }) {
  const [page, setPage] = useState(1)

  const fetchFn = useCallback(
    () => campaignAnalyticsApi.getQrScanLogs(campaignId, { page, limit: 30 }),
    [campaignId, page],
  )
  const { data, loading, error } = useApi(fetchFn, [campaignId, page])

  const items = (data?.items ?? []) as QRScanLog[]
  const meta = data?.meta as { totalPages: number } | undefined

  return (
    <div className="container-fluid">
      <PageHeader
        title="QR Scan Logs"
        breadcrumbs={[
          { label: 'Campaigns', href: '/campaigns' },
          { label: 'Detail', href: `/campaigns/${campaignId}` },
          { label: 'QR Logs' },
        ]}
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body className="p-0">
          <LoadingOverlay loading={loading}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Time</th>
                  <th>Volunteer</th>
                  <th>Pet</th>
                  <th>Status</th>
                  <th>Result</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4 text-muted">No scan logs yet</td></tr>
                ) : items.map(log => (
                  <tr key={log.id}>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td>{log.scannedBy.name}</td>
                    <td>
                      {log.petBooking
                        ? <><span className="fw-semibold">{log.petBooking.pet.name}</span> <small className="text-muted text-capitalize">({log.petBooking.pet.petType})</small></>
                        : <span className="text-muted">—</span>
                      }
                    </td>
                    <td>
                      {log.petBooking
                        ? <Badge bg="secondary" className="text-capitalize">{log.petBooking.status.replace('_', ' ')}</Badge>
                        : <span className="text-muted">—</span>
                      }
                    </td>
                    <td>
                      <Badge bg={log.scanResult === 'found' ? 'success' : 'danger'}>
                        {log.scanResult}
                      </Badge>
                    </td>
                    <td><small className="text-muted font-monospace">{log.ipAddress ?? '—'}</small></td>
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
