'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Row, Col, Form, InputGroup } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import EventsTable from './EventsTable'
import { useApi } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { eventsApi } from '@/lib/api/events.api'
import type { EventStatus } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function EventsListContent() {
  const { can } = usePermission()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<EventStatus | ''>('')
  const [upcoming, setUpcoming] = useState(false)

  const fetchFn = useCallback(
    () => eventsApi.list({ page, limit: 20, search: search || undefined, status: status || undefined, upcoming: upcoming || undefined }),
    [page, search, status, upcoming],
  )
  const { data, loading, error, refetch } = useApi(fetchFn, [page, search, status, upcoming])
  const events = data?.data ?? []
  const meta = data?.meta ?? null

  return (
    <div className="container-fluid">
      <PageHeader
        title="Events"
        breadcrumbs={[{ label: 'Content' }, { label: 'Events' }]}
        action={
          can('events:create') ? (
            <Link href="/cms/events/create" className="btn btn-primary">
              <Icon icon="solar:calendar-add-bold" className="me-1" />
              New Event
            </Link>
          ) : undefined
        }
      />

      <ApiErrorAlert error={error as ApiError | null} />

      <Card>
        <Card.Body>
          <Row className="g-2 mb-3 align-items-center">
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text><Icon icon="solar:magnifer-bold" /></InputGroup.Text>
                <Form.Control
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select value={status} onChange={(e) => { setStatus(e.target.value as EventStatus | ''); setPage(1) }}>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Form.Select>
            </Col>
            <Col md="auto">
              <Form.Check
                type="switch"
                id="upcomingOnly"
                label="Upcoming only"
                checked={upcoming}
                onChange={(e) => { setUpcoming(e.target.checked); setPage(1) }}
              />
            </Col>
          </Row>

          <EventsTable data={events} loading={loading} onDeleted={refetch} />

          {meta && meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                {meta.total} event{meta.total !== 1 ? 's' : ''} · Page {meta.page} of {meta.totalPages}
              </small>
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
