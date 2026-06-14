'use client'

import { useState, useCallback } from 'react'
import { Card, Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import PaymentsTable from './PaymentsTable'
import PaymentFilterBar from './PaymentFilterBar'
import PaymentDetailsModal from './PaymentDetailsModal'
import { useApi } from '@/hooks/useApi'
import { paymentsApi } from '@/lib/api/payments.api'
import type { Payment, PaymentStatus, PaymentGateway } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

export default function PaymentsContent() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PaymentStatus | ''>('')
  const [gateway, setGateway] = useState<PaymentGateway | ''>('')
  const [selected, setSelected] = useState<Payment | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchFn = useCallback(
    () => paymentsApi.list({
      page,
      limit: 20,
      search: search || undefined,
      status: status || undefined,
      gateway: gateway || undefined,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, search, status, gateway, refreshKey],
  )

  const { data, loading, error } = useApi(fetchFn, [page, search, status, gateway, refreshKey])
  const payments = data?.data ?? []
  const meta = data?.meta ?? null

  const pendingCount = payments.filter((p) => p.status === 'pending').length

  const handleView = (p: Payment) => { setSelected(p); setModalOpen(true) }
  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handleStatus = (v: PaymentStatus | '') => { setStatus(v); setPage(1) }
  const handleGateway = (v: PaymentGateway | '') => { setGateway(v); setPage(1) }
  const handleSynced = (updated: Payment) => {
    setSelected(updated)
    setRefreshKey((k) => k + 1)
  }

  const handleReconcilePending = () => {
    setStatus('pending')
    setPage(1)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Payments"
        breadcrumbs={[{ label: 'Payments & Logs' }, { label: 'Payments' }]}
        action={
          pendingCount > 0 ? (
            <Button variant="outline-warning" size="sm" onClick={handleReconcilePending}>
              <Icon icon="solar:refresh-bold" className="me-1" />
              {pendingCount} pending — reconcile
            </Button>
          ) : undefined
        }
      />

      <ApiErrorAlert error={error as ApiError | null} />

      <Card>
        <Card.Body>
          <PaymentFilterBar
            search={search}
            status={status}
            gateway={gateway}
            onSearchChange={handleSearch}
            onStatusChange={handleStatus}
            onGatewayChange={handleGateway}
          />

          <PaymentsTable data={payments} loading={loading} onView={handleView} />

          {meta && meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                {meta.total} payment{meta.total !== 1 ? 's' : ''} · Page {meta.page} of {meta.totalPages}
              </small>
              <div className="d-flex gap-1">
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasPrev} onClick={() => setPage(p => p - 1)}>‹</Button>
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasNext} onClick={() => setPage(p => p + 1)}>›</Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      <PaymentDetailsModal
        payment={selected}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSynced={handleSynced}
      />
    </div>
  )
}
