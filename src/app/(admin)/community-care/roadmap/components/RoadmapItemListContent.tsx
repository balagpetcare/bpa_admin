'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Row, Col, Form, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import RoadmapItemStatusBadge from './RoadmapItemStatusBadge'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { roadmapItemsApi } from '@/lib/api/roadmap-items.api'
import type { ApiError } from '@/lib/api'
import type { RoadmapItem, RoadmapItemStatus } from '@/types/bpa.types'

const STATUS_OPTIONS: { value: RoadmapItemStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'LIVE', label: 'Live' },
]

export default function RoadmapItemListContent() {
  const { can } = usePermission()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<RoadmapItemStatus | ''>('')
  const { mutate } = useApiMutation<unknown, unknown>()

  const fetchFn = useCallback(
    () => roadmapItemsApi.list({ page, limit: 20, status: status || undefined }),
    [page, status],
  )
  const { data, loading, error, refetch } = useApi(fetchFn, [page, status])
  const items = data?.data ?? []
  const meta = data?.meta ?? null

  async function handleDelete(id: string) {
    if (!confirm('Delete this roadmap item? This cannot be undone.')) return
    await mutate(() => roadmapItemsApi.remove(id), undefined)
    refetch()
  }

  async function handleToggleActive(item: RoadmapItem) {
    await mutate(() => roadmapItemsApi.update(item.id, { isActive: !item.isActive }), undefined)
    refetch()
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Future Roadmap"
        breadcrumbs={[{ label: 'Community Care Fund' }, { label: 'Future Roadmap' }]}
        action={
          can('roadmap_items:create') ? (
            <Link href="/community-care/roadmap/create" className="btn btn-primary">
              <Icon icon="solar:add-circle-bold" className="me-1" />New Item
            </Link>
          ) : undefined
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <Row className="g-2 mb-3">
            <Col md={4}>
              <Form.Select value={status} onChange={e => { setStatus(e.target.value as RoadmapItemStatus | ''); setPage(1) }}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Form.Select>
            </Col>
          </Row>

          <LoadingOverlay loading={loading}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Title</th>
                  <th>Phase / Year</th>
                  <th>Status</th>
                  <th>Active</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4 text-muted">No roadmap items found</td></tr>
                ) : items.map((item: RoadmapItem) => (
                  <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/community-care/roadmap/${item.id}`)}>
                    <td className="text-muted small">{item.sortOrder}</td>
                    <td>
                      <div className="fw-semibold">{item.titleEn}</div>
                      <div className="text-muted small">{item.titleBn}</div>
                    </td>
                    <td>
                      <div className="small fw-medium">{item.phase}</div>
                      <div className="text-muted small">{item.year}</div>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <RoadmapItemStatusBadge status={item.status} />
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <Badge bg={item.isActive ? 'success-subtle' : 'secondary-subtle'} text={item.isActive ? 'success' : 'secondary'}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="text-end" onClick={e => e.stopPropagation()}>
                      <div className="d-flex gap-1 justify-content-end">
                        {can('roadmap_items:update') && (
                          <>
                            <Link href={`/community-care/roadmap/${item.id}`} className="btn btn-soft-primary btn-sm">
                              <Icon icon="solar:pen-bold" />
                            </Link>
                            <Button variant={item.isActive ? 'soft-warning' : 'soft-success'} size="sm" title={item.isActive ? 'Deactivate' : 'Activate'} onClick={() => handleToggleActive(item)}>
                              <Icon icon={item.isActive ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
                            </Button>
                          </>
                        )}
                        {can('roadmap_items:delete') && (
                          <Button variant="soft-danger" size="sm" onClick={() => handleDelete(item.id)}>
                            <Icon icon="solar:trash-bin-trash-bold" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </LoadingOverlay>

          {meta && meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">{meta.total} items · Page {meta.page} of {meta.totalPages}</small>
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
