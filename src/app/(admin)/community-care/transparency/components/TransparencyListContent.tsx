'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Row, Col, Form } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import TransparencyStatusBadge from './TransparencyStatusBadge'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { transparencyReportsApi } from '@/lib/api/transparency-reports.api'
import type { ApiError } from '@/lib/api'
import type { TransparencyReport, TransparencyReportStatus } from '@/types/bpa.types'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

const formatCurrency = (value: string | number | null | undefined) => `৳${Number(value ?? 0).toLocaleString()}`

export default function TransparencyListContent() {
  const { can } = usePermission()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<TransparencyReportStatus | ''>('')
  const { mutate } = useApiMutation<unknown, unknown>()

  const fetchFn = useCallback(() => transparencyReportsApi.list({ page, limit: 20, status: status || undefined }), [page, status])
  const { data, loading, error, refetch } = useApi(fetchFn, [page, status])
  const reports = data?.data ?? []
  const meta = data?.meta ?? null

  async function handleDelete(id: string) {
    if (!confirm('Delete this report?')) return
    await mutate(() => transparencyReportsApi.remove(id), undefined)
    refetch()
  }

  async function handlePublish(id: string, isPublished: boolean) {
    await mutate(() => (isPublished ? transparencyReportsApi.unpublish(id) : transparencyReportsApi.publish(id)), undefined)
    refetch()
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Transparency Reports"
        breadcrumbs={[{ label: 'Community Care Fund' }, { label: 'Transparency' }]}
        action={
          can('transparency_reports:create') ? (
            <Link href="/community-care/transparency/create" className="btn btn-primary">
              <Icon icon="solar:add-circle-bold" className="me-1" />
              New Report
            </Link>
          ) : undefined
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <Row className="g-2 mb-3">
            <Col md={4}>
              <Form.Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as TransparencyReportStatus | '')
                  setPage(1)
                }}>
                {STATUS_OPTIONS.map((option) => (
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
                  <th>Report</th>
                  <th>Type</th>
                  <th>Period</th>
                  <th>Collected</th>
                  <th>Spent</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
                      No reports found
                    </td>
                  </tr>
                ) : (
                  reports.map((report: TransparencyReport) => (
                    <tr key={report.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/community-care/transparency/${report.id}`)}>
                      <td>
                        <div className="fw-semibold">{report.title}</div>
                        <div className="text-muted small">{report.slug}</div>
                      </td>
                      <td className="small text-capitalize">{report.reportType.replace(/_/g, ' ')}</td>
                      <td className="small">
                        {new Date(report.periodStart).toLocaleDateString()} - {new Date(report.periodEnd).toLocaleDateString()}
                      </td>
                      <td className="small">{formatCurrency(report.totalCollectedBdt)}</td>
                      <td className="small">{formatCurrency(report.totalSpentBdt)}</td>
                      <td className="fw-semibold small">{formatCurrency(report.balanceBdt)}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <TransparencyStatusBadge status={report.status} />
                      </td>
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex gap-1 justify-content-end">
                          {can('transparency_reports:publish') && report.status !== 'archived' && (
                            <Button
                              variant={report.status === 'published' ? 'soft-warning' : 'soft-success'}
                              size="sm"
                              title={report.status === 'published' ? 'Unpublish' : 'Publish'}
                              onClick={() => handlePublish(report.id, report.status === 'published')}>
                              <Icon icon={report.status === 'published' ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
                            </Button>
                          )}
                          {can('transparency_reports:update') && (
                            <Link href={`/community-care/transparency/${report.id}`} className="btn btn-soft-primary btn-sm">
                              <Icon icon="solar:pen-bold" />
                            </Link>
                          )}
                          {can('transparency_reports:delete') && report.status === 'draft' && (
                            <Button variant="soft-danger" size="sm" onClick={() => handleDelete(report.id)}>
                              <Icon icon="solar:trash-bin-trash-bold" />
                            </Button>
                          )}
                        </div>
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
                {meta.total} reports - Page {meta.page} of {meta.totalPages}
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
