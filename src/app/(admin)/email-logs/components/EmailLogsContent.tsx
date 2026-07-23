'use client'

import { useState, useCallback } from 'react'
import { Card, Button } from 'react-bootstrap'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import EmailLogTable from './EmailLogTable'
import EmailFilterBar from './EmailFilterBar'
import EmailLogDetailsModal from './EmailLogDetailsModal'
import { useApi } from '@/hooks/useApi'
import { emailLogsApi } from '@/lib/api/email-logs.api'
import type { EmailLog, EmailStatus } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

export default function EmailLogsContent() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<EmailStatus | ''>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selected, setSelected] = useState<EmailLog | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchFn = useCallback(
    () =>
      emailLogsApi.list({
        page,
        limit: 20,
        search: search || undefined,
        status: status || undefined,
        dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
        dateTo: dateTo ? new Date(dateTo + 'T23:59:59').toISOString() : undefined,
      }),
    [page, search, status, dateFrom, dateTo],
  )

  const { data, loading, error } = useApi(fetchFn, [page, search, status, dateFrom, dateTo])
  const logs = data?.data ?? []
  const meta = data?.meta ?? null

  const handleView = (log: EmailLog) => {
    setSelected(log)
    setModalOpen(true)
  }
  const handleSearch = (v: string) => {
    setSearch(v)
    setPage(1)
  }
  const handleStatus = (v: EmailStatus | '') => {
    setStatus(v)
    setPage(1)
  }
  const handleDateFrom = (v: string) => {
    setDateFrom(v)
    setPage(1)
  }
  const handleDateTo = (v: string) => {
    setDateTo(v)
    setPage(1)
  }

  return (
    <div className="container-fluid">
      <PageHeader title="Email Logs" breadcrumbs={[{ label: 'Notifications' }, { label: 'Email Logs' }]} />

      <ApiErrorAlert error={error as ApiError | null} />

      <Card>
        <Card.Body>
          <EmailFilterBar
            search={search}
            status={status}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onSearchChange={handleSearch}
            onStatusChange={handleStatus}
            onDateFromChange={handleDateFrom}
            onDateToChange={handleDateTo}
          />

          <EmailLogTable data={logs} loading={loading} onView={handleView} />

          {meta && meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                {meta.total} record{meta.total !== 1 ? 's' : ''} · Page {meta.page} of {meta.totalPages}
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

      <EmailLogDetailsModal log={selected} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
