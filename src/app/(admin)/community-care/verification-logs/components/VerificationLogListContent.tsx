'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Row, Col, Form, Badge } from 'react-bootstrap'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi } from '@/hooks/useApi'
import { cardVerificationLogsApi } from '@/lib/api/card-verification-logs.api'
import type { ApiError } from '@/lib/api'
import type { CardVerificationLog } from '@/types/bpa.types'

const RESULT_VARIANTS: Record<string, string> = {
  valid: 'success',
  expired: 'warning',
  revoked: 'danger',
  not_found: 'secondary',
}

const RESULT_OPTIONS = [
  { value: '', label: 'All Results' },
  { value: 'valid', label: 'Valid' },
  { value: 'expired', label: 'Expired' },
  { value: 'revoked', label: 'Revoked' },
  { value: 'not_found', label: 'Not Found' },
]

export default function VerificationLogListContent() {
  const [page, setPage] = useState(1)
  const [scanResult, setScanResult] = useState('')

  const fetchFn = useCallback(
    () => cardVerificationLogsApi.list({ page, limit: 30, scanResult: scanResult || undefined }),
    [page, scanResult],
  )
  const { data, loading, error } = useApi(fetchFn, [page, scanResult])
  const logs = data?.data ?? []
  const meta = data?.meta ?? null

  return (
    <div className="container-fluid">
      <PageHeader
        title="Verification Logs"
        breadcrumbs={[{ label: 'Community Care Fund' }, { label: 'Verif. Logs' }]}
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <Row className="g-2 mb-3">
            <Col md={4}>
              <Form.Select value={scanResult} onChange={(e) => { setScanResult(e.target.value); setPage(1) }}>
                {RESULT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Form.Select>
            </Col>
          </Row>

          <LoadingOverlay loading={loading}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Card Number</th>
                  <th>Result</th>
                  <th>IP Address</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-4 text-muted">No logs found</td></tr>
                ) : logs.map((l: CardVerificationLog) => (
                  <tr key={l.id}>
                    <td className="font-monospace small">{l.card.cardNumber}</td>
                    <td>
                      <Badge bg={`${RESULT_VARIANTS[l.scanResult] ?? 'secondary'}-subtle`} text={RESULT_VARIANTS[l.scanResult] ?? 'secondary'}>
                        {l.scanResult}
                      </Badge>
                    </td>
                    <td className="small text-muted">{l.ipAddress ?? '—'}</td>
                    <td className="small">{new Date(l.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </LoadingOverlay>

          {meta && meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">{meta.total} logs · Page {meta.page} of {meta.totalPages}</small>
              <div className="d-flex gap-1">
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasPrev} onClick={() => setPage(p => p - 1)}>‹</Button>
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasNext} onClick={() => setPage(p => p + 1)}>›</Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
