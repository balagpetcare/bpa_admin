'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Form, InputGroup } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import ContactsTable from './ContactsTable'
import ContactDetailsModal from './ContactDetailsModal'
import { useApi } from '@/hooks/useApi'
import { contactsApi } from '@/lib/api/contacts.api'
import type { ContactSubmission, ContactStatus } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

type StatusFilter = ContactStatus | ''

export default function ContactsContent() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('')
  const [selected, setSelected] = useState<ContactSubmission | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchFn = useCallback(
    () => contactsApi.list({ page, limit: 20, search: search || undefined, status: status || undefined }),
    [page, search, status],
  )
  const { data, loading, error, refetch } = useApi(fetchFn, [page, search, status])
  const contacts = data?.data ?? []
  const meta = data?.meta ?? null

  const handleView = (c: ContactSubmission) => { setSelected(c); setModalOpen(true) }
  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handleStatus = (v: StatusFilter) => { setStatus(v); setPage(1) }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Contact Messages"
        breadcrumbs={[{ label: 'Community' }, { label: 'Contacts' }]}
      />

      <ApiErrorAlert error={error as ApiError | null} />

      <Card>
        <Card.Body>
          <div className="d-flex gap-2 mb-3 flex-wrap">
            <InputGroup style={{ maxWidth: 320 }}>
              <InputGroup.Text><Icon icon="solar:magnifer-bold" /></InputGroup.Text>
              <Form.Control
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {search && (
                <Button variant="outline-secondary" onClick={() => handleSearch('')}>
                  <Icon icon="solar:close-circle-bold" />
                </Button>
              )}
            </InputGroup>

            <Form.Select
              style={{ maxWidth: 160 }}
              value={status}
              onChange={(e) => handleStatus(e.target.value as StatusFilter)}
            >
              <option value="">All statuses</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </Form.Select>
          </div>

          <ContactsTable data={contacts} loading={loading} onView={handleView} />

          {meta && meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                {meta.total} message{meta.total !== 1 ? 's' : ''} · Page {meta.page} of {meta.totalPages}
              </small>
              <div className="d-flex gap-1">
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasPrev} onClick={() => setPage(p => p - 1)}>‹</Button>
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasNext} onClick={() => setPage(p => p + 1)}>›</Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      <ContactDetailsModal
        contact={selected}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onStatusChanged={refetch}
      />
    </div>
  )
}
