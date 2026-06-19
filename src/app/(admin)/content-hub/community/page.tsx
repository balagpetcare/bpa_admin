'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, Table, Button, Form, Row, Col, InputGroup } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import EmptyState from '@/components/ui/EmptyState'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { confirmDelete } from '@/components/ui/ConfirmDialog'
import { contentApi, ContentPost, Category, ContentPostType } from '@/lib/api/content.api'
import type { ApiError } from '@/lib/api'

export default function CommunityPostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  // Filters
  const [q, setQ] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('') // Empty means all community types
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<{ total: number; totalPages: number; page: number } | null>(null)

  // Fetch categories once
  useEffect(() => {
    contentApi.listCategories()
      .then(setCategories)
      .catch(console.error)
  }, [])

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // If typeFilter is set, query that specifically. Otherwise query all and filter client-side.
      const queryParams: any = {
        q: q || undefined,
        categoryId: categoryId || undefined,
        status: status || undefined,
        page,
        limit: 15,
      }

      if (typeFilter) {
        queryParams.type = typeFilter
      }

      const res = await contentApi.listPosts(queryParams)

      let fetchedItems: ContentPost[] = []
      let fetchedMeta: any = null

      if (Array.isArray(res)) {
        fetchedItems = res
      } else {
        const responseData = res as any
        fetchedItems = responseData.data || responseData.items || []
        fetchedMeta = responseData.meta || null
      }

      // Filter out VIDEO posts if we are displaying all types
      if (!typeFilter) {
        fetchedItems = fetchedItems.filter((p) => p.type !== 'VIDEO')
      }

      setPosts(fetchedItems)
      setMeta(fetchedMeta)
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setLoading(false)
    }
  }, [q, typeFilter, categoryId, status, page])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleDelete = async (post: ContentPost) => {
    const ok = await confirmDelete(post.titleEn)
    if (!ok) return

    setLoading(true)
    try {
      await contentApi.deletePost(post.id)
      fetchPosts()
    } catch (err) {
      setError(err as ApiError)
      setLoading(false)
    }
  }

  const handleToggle = async (id: string, field: keyof ContentPost, value: any) => {
    try {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
      )
      await contentApi.updatePost(id, { [field]: value })
    } catch (err) {
      setError(err as ApiError)
      fetchPosts()
    }
  }

  const handleStatusChange = async (id: string, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      )
      const payload: Partial<ContentPost> = {
        status: newStatus,
        publishedAt: newStatus === 'published' ? new Date().toISOString() : null,
      }
      await contentApi.updatePost(id, payload)
    } catch (err) {
      setError(err as ApiError)
      fetchPosts()
    }
  }

  const renderTypeBadge = (type: ContentPostType) => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return <span className="badge bg-danger-subtle text-danger">Announcement</span>
      case 'DONATION_STORY':
        return <span className="badge bg-success-subtle text-success">Donation Story</span>
      case 'CAMPAIGN_UPDATE':
        return <span className="badge bg-primary-subtle text-primary">Campaign Update</span>
      case 'PET_CARE_TIP':
        return <span className="badge bg-info-subtle text-info">Pet Care Tip</span>
      default:
        return <span className="badge bg-secondary-subtle text-secondary">Community Post</span>
    }
  }

  return (
    <div className="container-fluid py-4">
      <PageHeader
        title="Community Posts"
        breadcrumbs={[{ label: 'Content Hub' }, { label: 'Community' }]}
        action={
          <Link href="/content-hub/community/create" className="btn btn-primary d-flex align-items-center gap-1">
            <Icon icon="solar:document-text-bold" />
            Add Community Post
          </Link>
        }
      />

      <ApiErrorAlert error={error} onDismiss={() => setError(null)} />

      {/* Filters Card */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Label className="fw-semibold small">Search</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0">
                  <Icon icon="solar:magnifer-linear" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by title or slug..."
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value)
                    setPage(1)
                  }}
                  className="border-start-0 bg-light"
                />
              </InputGroup>
            </Col>

            <Col md={3}>
              <Form.Label className="fw-semibold small">Post Type</Form.Label>
              <Form.Select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">All Community Types</option>
                <option value="COMMUNITY_POST">Community Post</option>
                <option value="ANNOUNCEMENT">Announcement</option>
                <option value="DONATION_STORY">Donation Story</option>
                <option value="CAMPAIGN_UPDATE">Campaign Update</option>
                <option value="PET_CARE_TIP">Pet Care Tip</option>
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Label className="fw-semibold small">Category</Form.Label>
              <Form.Select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameEn}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Label className="fw-semibold small">Status</Form.Label>
              <Form.Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card>
        <Card.Body className="p-0">
          <LoadingOverlay loading={loading}>
            <div className="table-responsive">
              <Table hover className="table-centered align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '25%' }}>Post Title</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th>Pinned</th>
                    <th>Homepage</th>
                    <th>Comments</th>
                    <th>Stats</th>
                    <th className="text-end" style={{ width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan={10}>
                        <EmptyState
                          icon="solar:document-text-bold-duotone"
                          title="No community posts found"
                          description="Get started by writing your first community hub post."
                        />
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={post.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {post.coverImageUrl ? (
                              <img
                                src={post.coverImageUrl}
                                alt={post.titleEn}
                                className="rounded"
                                style={{ width: '50px', height: '40px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="rounded bg-light d-flex align-items-center justify-content-center text-muted" style={{ width: '50px', height: '40px' }}>
                                <Icon icon="solar:document-text-linear" width={20} />
                              </div>
                            )}
                            <div className="text-truncate" style={{ maxWidth: '240px' }}>
                              <span className="fw-semibold text-dark d-block text-truncate" title={post.titleEn}>{post.titleEn}</span>
                              <span className="text-muted small d-block text-truncate">/{post.slug}</span>
                            </div>
                          </div>
                        </td>
                        <td>{renderTypeBadge(post.type)}</td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {post.category?.nameEn || 'Uncategorized'}
                          </span>
                        </td>
                        <td>
                          <Form.Select
                            size="sm"
                            value={post.status}
                            onChange={(e) => handleStatusChange(post.id, e.target.value as any)}
                            className="form-select-sm py-0 fw-medium"
                            style={{ width: '110px' }}
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                          </Form.Select>
                        </td>
                        <td>
                          <Form.Check
                            type="switch"
                            id={`featured-${post.id}`}
                            checked={post.isFeatured}
                            onChange={(e) => handleToggle(post.id, 'isFeatured', e.target.checked)}
                          />
                        </td>
                        <td>
                          <Form.Check
                            type="switch"
                            id={`pinned-${post.id}`}
                            checked={post.isPinned}
                            onChange={(e) => handleToggle(post.id, 'isPinned', e.target.checked)}
                          />
                        </td>
                        <td>
                          <Form.Check
                            type="switch"
                            id={`homepage-${post.id}`}
                            checked={post.showOnHomepage}
                            onChange={(e) => handleToggle(post.id, 'showOnHomepage', e.target.checked)}
                          />
                        </td>
                        <td>
                          <Form.Check
                            type="switch"
                            id={`comments-${post.id}`}
                            checked={post.allowComments}
                            onChange={(e) => handleToggle(post.id, 'allowComments', e.target.checked)}
                          />
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2 small text-muted">
                            <span title="Views"><Icon icon="solar:eye-linear" /> {post.viewCount}</span>
                            <span title="Likes"><Icon icon="solar:heart-linear" /> {post.likeCount}</span>
                            <span title="Comments"><Icon icon="solar:chat-round-line-linear" /> {post.commentCount}</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-1 justify-content-end">
                            <Link href={`/content-hub/community/${post.id}/edit`} className="btn btn-soft-primary btn-sm">
                              <Icon icon="solar:pen-bold" />
                            </Link>
                            <Button variant="soft-danger" size="sm" onClick={() => handleDelete(post)}>
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
              <div className="d-flex justify-content-between align-items-center p-3 border-top">
                <small className="text-muted">
                  Showing {posts.length} of {meta.total} posts · Page {meta.page} of {meta.totalPages}
                </small>
                <div className="d-flex gap-1">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ‹ Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next ›
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
