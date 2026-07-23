'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, Table, Button, Form, Row, Col, InputGroup } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import EmptyState from '@/components/ui/EmptyState'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { confirmDelete } from '@/components/ui/ConfirmDialog'
import { contentApi, ContentComment } from '@/lib/api/content.api'
import type { ApiError } from '@/lib/api'

export default function CommentsPage() {
  const [comments, setComments] = useState<ContentComment[]>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  // Filters
  const [status, setStatus] = useState<string>('')
  const [reported, setReported] = useState<boolean>(false)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<{ total: number; totalPages: number; page: number } | null>(null)

  const fetchComments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Cast the endpoint output
      const res = await contentApi.listComments({
        status: status || undefined,
        reported: reported ? true : undefined,
        page,
        limit: 20,
      })
      // Adapt array/pagination from backend listComments endpoint if it wraps array
      if (Array.isArray(res)) {
        setComments(res)
      } else {
        // Safe check
        const responseData = res as any
        setComments(responseData.data || responseData.items || [])
        setMeta(responseData.meta || null)
      }
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setLoading(false)
    }
  }, [status, reported, page])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleModerate = async (commentId: string, newStatus: string) => {
    try {
      await contentApi.moderateComment(commentId, newStatus)
      fetchComments()
    } catch (err) {
      setError(err as ApiError)
    }
  }

  const handleDelete = async (comment: ContentComment) => {
    const ok = await confirmDelete(`comment by ${comment.user?.name || 'Anonymous'}`)
    if (!ok) return

    try {
      await contentApi.deleteComment(comment.id)
      fetchComments()
    } catch (err) {
      setError(err as ApiError)
    }
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="badge bg-success-subtle text-success">Approved</span>
      case 'hidden':
        return <span className="badge bg-secondary-subtle text-secondary">Hidden</span>
      case 'spam':
        return <span className="badge bg-danger-subtle text-danger">Spam</span>
      default:
        return <span className="badge bg-warning-subtle text-warning">Pending</span>
    }
  }

  return (
    <div className="container-fluid py-4">
      <PageHeader title="Comment Moderation" breadcrumbs={[{ label: 'Content Hub' }, { label: 'Comments' }]} />

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
                <option value="">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="hidden">Hidden</option>
                <option value="spam">Spam</option>
              </Form.Select>
            </Col>

            <Col md={3} className="d-flex align-items-end pb-1 mt-md-4">
              <Form.Check
                type="checkbox"
                id="reported-checkbox"
                label="Only Show Reported Comments"
                checked={reported}
                onChange={(e) => {
                  setReported(e.target.checked)
                  setPage(1)
                }}
                className="fw-semibold text-secondary"
              />
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
                    <th>User</th>
                    <th>Post Reference</th>
                    <th>Comment Body</th>
                    <th>Status</th>
                    <th>Posted Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!comments || comments.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState
                          icon="solar:chat-round-line-bold-duotone"
                          title="No comments found"
                          description="Comment listings will show up here after users post on your educational pages."
                        />
                      </td>
                    </tr>
                  ) : (
                    comments.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div>
                            <span className="fw-semibold text-dark block">{c.user?.name || 'Anonymous'}</span>
                            <span className="text-muted small block">{c.user?.email || ''}</span>
                          </div>
                        </td>
                        <td>
                          {c.post ? (
                            <div>
                              <span className="fw-medium text-primary block">{c.post.titleEn}</span>
                              <span className="badge bg-light text-muted small">{c.post.type}</span>
                            </div>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>
                          <p className="mb-0 text-dark font-medium line-clamp-2 max-w-sm" style={{ whiteSpace: 'pre-wrap' }}>
                            {c.body}
                          </p>
                        </td>
                        <td>{renderStatusBadge(c.status)}</td>
                        <td>
                          <span className="text-secondary small">
                            {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            {c.status !== 'approved' && (
                              <Button variant="soft-success" size="sm" onClick={() => handleModerate(c.id, 'approved')} title="Approve">
                                <Icon icon="solar:check-circle-bold" />
                              </Button>
                            )}
                            {c.status !== 'hidden' && (
                              <Button variant="soft-secondary" size="sm" onClick={() => handleModerate(c.id, 'hidden')} title="Hide">
                                <Icon icon="solar:eye-closed-bold" />
                              </Button>
                            )}
                            {c.status !== 'spam' && (
                              <Button variant="soft-warning" size="sm" onClick={() => handleModerate(c.id, 'spam')} title="Mark Spam">
                                <Icon icon="solar:shield-warning-bold" />
                              </Button>
                            )}
                            <Button variant="soft-danger" size="sm" onClick={() => handleDelete(c)} title="Delete Permanently">
                              <Icon icon="solar:trash-bin-trash-bold" />
                            </Button>
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
                  {meta.total} comment{meta.total !== 1 ? 's' : ''} · Page {meta.page} of {meta.totalPages}
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
