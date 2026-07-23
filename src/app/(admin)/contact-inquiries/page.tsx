'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Button, Form, InputGroup, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { useApi } from '@/hooks/useApi'
import { contactInquiryApi, type InquiryStatus, type InquiryPriority, type InquiryListItem } from '@/lib/api/contact-inquiry.api'
import type { ApiError } from '@/lib/api'

const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: 'New',
  read: 'Read',
  pending: 'Pending',
  in_progress: 'In Progress',
  waiting_response: 'Waiting',
  resolved: 'Resolved',
  closed: 'Closed',
  spam: 'Spam',
}

const STATUS_VARIANT: Record<InquiryStatus, string> = {
  new: 'danger',
  read: 'secondary',
  pending: 'warning',
  in_progress: 'primary',
  waiting_response: 'info',
  resolved: 'success',
  closed: 'dark',
  spam: 'light',
}

const PRIORITY_VARIANT: Record<InquiryPriority, string> = {
  normal: 'secondary',
  high: 'warning',
  urgent: 'danger',
}

export default function ContactInquiriesPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<InquiryStatus | ''>('')
  const [priority, setPriority] = useState<InquiryPriority | ''>('')

  const fetchFn = useCallback(
    () =>
      contactInquiryApi.list({
        page,
        limit: 25,
        search: search || undefined,
        status: (status as InquiryStatus) || undefined,
        priority: (priority as InquiryPriority) || undefined,
      }),
    [page, search, status, priority],
  )

  const { data, loading, error } = useApi(fetchFn, [page, search, status, priority])
  const inquiries: InquiryListItem[] = data?.data ?? []
  const meta = data?.meta ?? null

  const handleSearch = (v: string) => {
    setSearch(v)
    setPage(1)
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Contact Inquiries"
        breadcrumbs={[{ label: 'Contact Inquiries' }]}
        action={
          <div className="d-flex gap-2">
            <Button size="sm" variant="outline-secondary" onClick={() => router.push('/contact-inquiries/types')}>
              <Icon icon="solar:settings-bold" className="me-1" />
              Types
            </Button>
            <Button size="sm" variant="outline-secondary" onClick={() => router.push('/contact-inquiries/categories')}>
              <Icon icon="solar:tag-bold" className="me-1" />
              Categories
            </Button>
            <Button size="sm" variant="outline-secondary" onClick={() => router.push('/contact-inquiries/departments')}>
              <Icon icon="solar:buildings-bold" className="me-1" />
              Departments
            </Button>
            <Button size="sm" variant="outline-secondary" onClick={() => router.push('/contact-inquiries/priority-rules')}>
              <Icon icon="solar:shield-warning-bold" className="me-1" />
              Rules
            </Button>
          </div>
        }
      />

      <ApiErrorAlert error={error as ApiError | null} />

      <Card>
        <Card.Body>
          {/* Filters */}
          <div className="d-flex gap-2 mb-3 flex-wrap">
            <InputGroup style={{ maxWidth: 320 }}>
              <InputGroup.Text>
                <Icon icon="solar:magnifer-bold" />
              </InputGroup.Text>
              <Form.Control placeholder="Search by name, email, ticket…" value={search} onChange={(e) => handleSearch(e.target.value)} />
              {search && (
                <Button variant="outline-secondary" onClick={() => handleSearch('')}>
                  <Icon icon="solar:close-circle-bold" />
                </Button>
              )}
            </InputGroup>

            <Form.Select
              style={{ maxWidth: 160 }}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as any)
                setPage(1)
              }}>
              <option value="">All statuses</option>
              {(Object.keys(STATUS_LABELS) as InquiryStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Form.Select>

            <Form.Select
              style={{ maxWidth: 140 }}
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value as any)
                setPage(1)
              }}>
              <option value="">All priorities</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Form.Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-4 text-muted">Loading inquiries…</div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <Icon icon="solar:inbox-bold" width={40} className="mb-2 d-block mx-auto opacity-30" />
              No inquiries found
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Ticket</th>
                    <th>Name / Email</th>
                    <th>Type / Category</th>
                    <th>Subject</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inq) => (
                    <tr
                      key={inq.id}
                      className={inq.status === 'new' ? 'fw-semibold' : ''}
                      style={{ cursor: 'pointer' }}
                      onClick={() => router.push(`/contact-inquiries/${inq.id}`)}>
                      <td>
                        <code className="small text-muted">{inq.ticketNumber}</code>
                      </td>
                      <td>
                        <div className="fw-medium">{inq.name}</div>
                        <small className="text-muted">{inq.email}</small>
                      </td>
                      <td>
                        {inq.contactType && (
                          <div>
                            <small className="text-muted">{inq.contactType.labelEn}</small>
                          </div>
                        )}
                        {inq.category && <small className="text-muted">{inq.category.labelEn}</small>}
                      </td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: 220 }}>
                          {inq.subject}
                        </div>
                      </td>
                      <td>
                        <Badge bg={PRIORITY_VARIANT[inq.priority]} text={inq.priority === 'high' ? 'dark' : undefined}>
                          {inq.priority.charAt(0).toUpperCase() + inq.priority.slice(1)}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={STATUS_VARIANT[inq.status]}>{STATUS_LABELS[inq.status]}</Badge>
                      </td>
                      <td>
                        <small className="text-muted">{new Date(inq.createdAt).toLocaleDateString()}</small>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/contact-inquiries/${inq.id}`)
                          }}>
                          <Icon icon="solar:eye-bold" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                {meta.total} inquir{meta.total !== 1 ? 'ies' : 'y'} · Page {meta.page} of {meta.totalPages}
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
