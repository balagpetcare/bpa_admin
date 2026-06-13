'use client'

import { useCallback } from 'react'
import { Card, Row, Col, Button, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi } from '@/hooks/useApi'
import { petSmartSolutionApi } from '@/lib/api/pet-smart-solution.api'
import type { ApiError } from '@/lib/api'
import type { PetSmartSyncStatus } from '@/types/bpa.types'

const STATUS_VARIANTS: Record<PetSmartSyncStatus, string> = {
  success: 'success',
  failed: 'danger',
  pending: 'warning',
  skipped: 'secondary',
}

export default function SyncLogDetailContent({ id }: { id: string }) {
  const router = useRouter()
  const fetchFn = useCallback(() => petSmartSolutionApi.getSyncLog(id), [id])
  const { data: log, loading, error } = useApi(fetchFn, [id])

  return (
    <div className="container-fluid">
      <PageHeader
        title="Sync Log Detail"
        breadcrumbs={[{ label: 'Community Care Fund' }, { label: 'Sync Logs', href: '/community-care/sync-logs' }, { label: 'Detail' }]}
        action={
          <Button variant="outline-secondary" size="sm" onClick={() => router.push('/community-care/sync-logs')}>
            <Icon icon="solar:arrow-left-bold" className="me-1" />Back
          </Button>
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <LoadingOverlay loading={loading}>
        {log && (
          <Row className="g-3">
            <Col lg={6}>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">Sync Info</span>
                  <Badge bg={`${STATUS_VARIANTS[log.status]}-subtle`} text={STATUS_VARIANTS[log.status]}>
                    {log.status}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <dl className="row mb-0">
                    <dt className="col-sm-4">Sync Type</dt>
                    <dd className="col-sm-8 text-capitalize">{log.syncType.replace(/_/g, ' ')}</dd>
                    <dt className="col-sm-4">Entity Type</dt>
                    <dd className="col-sm-8 text-capitalize">{log.entityType.replace(/_/g, ' ')}</dd>
                    <dt className="col-sm-4">Entity ID</dt>
                    <dd className="col-sm-8 font-monospace small">{log.entityId}</dd>
                    <dt className="col-sm-4">Setting</dt>
                    <dd className="col-sm-8 font-monospace small">{log.setting?.settingKey ?? 'N/A'}</dd>
                    <dt className="col-sm-4">Started</dt>
                    <dd className="col-sm-8">{new Date(log.startedAt).toLocaleString()}</dd>
                    <dt className="col-sm-4">Finished</dt>
                    <dd className="col-sm-8">{log.finishedAt ? new Date(log.finishedAt).toLocaleString() : 'In progress'}</dd>
                    <dt className="col-sm-4">Error</dt>
                    <dd className="col-sm-8 text-danger small">{log.errorMessage ?? 'None'}</dd>
                  </dl>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="mb-3">
                <Card.Header className="fw-semibold">Request Summary</Card.Header>
                <Card.Body>
                  <pre className="small bg-light p-2 rounded mb-0" style={{ minHeight: 120, maxHeight: 220, overflow: 'auto' }}>
                    {log.requestSummary ?? 'No request summary captured.'}
                  </pre>
                </Card.Body>
              </Card>

              <Card>
                <Card.Header className="fw-semibold">Response Summary</Card.Header>
                <Card.Body>
                  <pre className="small bg-light p-2 rounded mb-0" style={{ minHeight: 120, maxHeight: 220, overflow: 'auto' }}>
                    {log.responseSummary ?? 'No response summary captured.'}
                  </pre>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </LoadingOverlay>
    </div>
  )
}
