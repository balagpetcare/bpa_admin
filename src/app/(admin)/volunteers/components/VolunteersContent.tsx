'use client'

import { useState, useCallback } from 'react'
import { Card, Button } from 'react-bootstrap'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import VolunteersTable from './VolunteersTable'
import VolunteerFilterBar from './VolunteerFilterBar'
import VolunteerDetailsModal from './VolunteerDetailsModal'
import { useApi } from '@/hooks/useApi'
import { volunteersApi } from '@/lib/api/volunteers.api'
import type { Volunteer, VolunteerStatus } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

export default function VolunteersContent() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<VolunteerStatus | ''>('')
  const [selected, setSelected] = useState<Volunteer | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchFn = useCallback(
    () => volunteersApi.list({ page, limit: 20, search: search || undefined, status: status || undefined }),
    [page, search, status],
  )
  const { data, loading, error, refetch } = useApi(fetchFn, [page, search, status])
  const volunteers = data?.data ?? []
  const meta = data?.meta ?? null

  const handleView = (v: Volunteer) => { setSelected(v); setModalOpen(true) }
  const handleStatusChanged = () => { refetch() }

  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handleStatus = (v: VolunteerStatus | '') => { setStatus(v); setPage(1) }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Volunteers"
        breadcrumbs={[{ label: 'Community' }, { label: 'Volunteers' }]}
      />

      <ApiErrorAlert error={error as ApiError | null} />

      <Card>
        <Card.Body>
          <VolunteerFilterBar
            search={search}
            status={status}
            onSearchChange={handleSearch}
            onStatusChange={handleStatus}
          />

          <VolunteersTable data={volunteers} loading={loading} onView={handleView} />

          {meta && meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                {meta.total} application{meta.total !== 1 ? 's' : ''} · Page {meta.page} of {meta.totalPages}
              </small>
              <div className="d-flex gap-1">
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasPrev} onClick={() => setPage(p => p - 1)}>‹</Button>
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasNext} onClick={() => setPage(p => p + 1)}>›</Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      <VolunteerDetailsModal
        volunteer={selected}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onStatusChanged={handleStatusChanged}
      />
    </div>
  )
}
