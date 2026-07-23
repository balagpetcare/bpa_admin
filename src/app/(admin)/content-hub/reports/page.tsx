'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, Table, Button, Form, Row, Col } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import EmptyState from '@/components/ui/EmptyState'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { confirmDelete } from '@/components/ui/ConfirmDialog'
import { contentApi, ContentReport } from '@/lib/api/content.api'
import type { ApiError } from '@/lib/api'

export default function ReportsPage() {
  const [reports, setReports] = useState<ContentReport[]>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  // Filters
  const [status, setStatus] = useState<string>('pending')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<{ total: number; totalPages: number; page: number } | null>(null)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await contentApi.listReports({
        status: status || undefined,
        page,
        limit: 20,
      })
      if (Array.isArray(res)) {
        setReports(res)
      } else {
        const responseData = res as any
        setReports(responseData.data || responseData.items || [])
        setMeta(responseData.meta || null)
      }
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setLoading(false)
    }
  }, [status, page])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const handleResolve = async (id: string, newStatus: string) => {
    try {
      await contentApi.resolveReport(id, newStatus)
      fetchReports()
    } catch (err) {
      setError(err as ApiError)
    }
  }

  const handleDeletePost = async (postId: string) => {
    const ok = await confirmDelete('this reported post')
    if (!ok) return

    try {
      await contentApi.deletePost(postId)
      fetchReports()
    } catch (err) {
      setError(err as ApiError)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    const ok = await confirmDelete('this reported comment')
    if (!ok) return

    try {
      await contentApi.deleteComment(commentId)
      fetchReports()
    } catch (err) {
      setError(err as ApiError)
    }
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <span className="badge bg-success-subtle text-success">Resolved</span>
      case 'dismissed':
        return <span className="badge bg-secondary-subtle text-secondary">Dismissed</span>
      case 'reviewed':
        return <span className="badge bg-info-subtle text-info">Reviewed</span>
      default:
        return <span className="badge bg-warning-subtle text-warning">Pending</span>
    }
  }

  return (
    <div className="container-fluid py-4">
      <PageHeader title="Content Reports Review" breadcrumbs={[{ label: 'Content Hub' }, { label: 'Reports' }]} />

      <ApiErrorAlert error={error} onDismiss={() => setError(null)} />

      <Card className="mb-4">
        <Card.Body>
          <Row className="g-2 items-center">
            <Col md={3}>
              <Form.Label className="fw-semibold small">Status Filter</Form.Label>
              <Form.Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  setPage(1)
                }}>
                <option value="">All Reports</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <LoadingOverlay loading={loading}>
            <div className="table-responsive">
              <Table hover className="table-centered align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Reported By</th>
                    <th>Reference Type</th>
                    <th>Reported Content</th>
                    <th>Reason / Issue</th>
                    <th>Status</th>
                    <th>Reported Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!reports || reports.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState
                          icon="solar:danger-bold-duotone"
                          title="No reports to review"
                          description="Great! No posts or comments are flagged by users right now."
                        />
                      </td>
                    </tr>
                  ) : (
                    reports.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <div>
                            <span className="fw-semibold text-dark block">{r.reportedBy?.name || 'Anonymous User'}</span>
                            <span className="text-muted small block">{r.reportedBy?.email || ''}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${r.postId ? 'bg-primary-subtle text-primary' : 'bg-warning-subtle text-warning'}`}>
                            {r.postId ? 'Post' : 'Comment'}
                          </span>
                        </td>
                        <td>
                          {r.post && (
                            <div>
                              <span className="fw-medium text-dark block">{r.post.titleEn}</span>
                              <span className="text-muted small block">Slug: {r.post.slug}</span>
                            </div>
                          )}
                          {r.comment && (
                            <div>
                              <span className="text-dark block font-sans line-clamp-2 max-w-xs italic font-medium">
                                &ldquo;{r.comment.body}&rdquo;
                              </span>
                              <span className="text-muted small block">By User: {r.comment.user?.name || 'Unknown'}</span>
                            </div>
                          )}
                        </td>
                        <td>
                          <p className="mb-0 text-danger font-semibold text-sm max-w-xs leading-relaxed">{r.reason}</p>
                        </td>
                        <td>{renderStatusBadge(r.status)}</td>
                        <td>
                          <span className="text-secondary small">
                            {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-1 flex-wrap">
                            {r.status === 'pending' && (
                              <Button variant="soft-info" size="sm" onClick={() => handleResolve(r.id, 'reviewed')} title="Mark Reviewed">
                                <Icon icon="solar:check-circle-bold" />
                              </Button>
                            )}

                            {r.status !== 'resolved' && (
                              <Button variant="soft-success" size="sm" onClick={() => handleResolve(r.id, 'resolved')} title="Resolve Report">
                                <Icon icon="solar:shield-check-bold" />
                              </Button>
                            )}

                            {r.status !== 'dismissed' && (
                              <Button variant="soft-secondary" size="sm" onClick={() => handleResolve(r.id, 'dismissed')} title="Dismiss Report">
                                <Icon icon="solar:close-circle-bold" />
                              </Button>
                            )}

                            {r.postId && (
                              <Button variant="soft-danger" size="sm" onClick={() => handleDeletePost(r.postId!)} title="Delete Offending Post">
                                <Icon icon="solar:trash-bin-trash-bold" /> Post
                              </Button>
                            )}

                            {r.commentId && (
                              <Button
                                variant="soft-danger"
                                size="sm"
                                onClick={() => handleDeleteComment(r.commentId!)}
                                title="Delete Offending Comment">
                                <Icon icon="solar:trash-bin-trash-bold" /> Comment
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

            {meta && meta.totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <small className="text-muted">
                  {meta.total} report{meta.total !== 1 ? 's' : ''} · Page {meta.page} of {meta.totalPages}
                </small>
                <div className="d-flex gap-1">
                  <Button size="sm" variant="outline-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    ‹
                  </Button>
                  <Button size="sm" variant="outline-secondary" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
                    ›
                  </Button>
                </div>
              </div>
            )}
          </LoadingOverlay>
        </Card.Body>
      </Card>
    </div>
  )
}
