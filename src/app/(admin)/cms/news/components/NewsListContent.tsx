'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Row, Col, Form, InputGroup } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import NewsTable from './NewsTable'
import { useApi } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { newsApi } from '@/lib/api/news.api'
import type { NewsStatus } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

export default function NewsListContent() {
  const { can } = usePermission()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<NewsStatus | ''>('')

  const fetchFn = useCallback(
    () => newsApi.list({ page, limit: 20, search: search || undefined, status: status || undefined }),
    [page, search, status],
  )
  const { data, loading, error, refetch } = useApi(fetchFn, [page, search, status])
  const articles = data?.data ?? []
  const meta = data?.meta ?? null

  return (
    <div className="container-fluid">
      <PageHeader
        title="News"
        breadcrumbs={[{ label: 'Content' }, { label: 'News' }]}
        action={
          can('news:create') ? (
            <Link href="/cms/news/create" className="btn btn-primary">
              <Icon icon="solar:document-add-bold" className="me-1" />
              New Article
            </Link>
          ) : undefined
        }
      />

      <ApiErrorAlert error={error as ApiError | null} />

      <Card>
        <Card.Body>
          <Row className="g-2 mb-3">
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text>
                  <Icon icon="solar:magnifer-bold" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search articles..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as NewsStatus | '')
                  setPage(1)
                }}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <NewsTable data={articles} loading={loading} onDeleted={refetch} />

          {meta && meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                {meta.total} article{meta.total !== 1 ? 's' : ''} · Page {meta.page} of {meta.totalPages}
              </small>
              <div className="d-flex gap-1">
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasPrev} onClick={() => setPage((p) => p - 1)}>
                  ‹
                </Button>
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasNext} onClick={() => setPage((p) => p + 1)}>
                  ›
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
