'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Toast, ToastContainer } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import SmsLogTable from './SmsLogTable'
import SmsFilterBar from './SmsFilterBar'
import SmsLogDetailsModal from './SmsLogDetailsModal'
import SmsStatsCards from './SmsStatsCards'
import RetryFailedModal from './RetryFailedModal'
import { useApi } from '@/hooks/useApi'
import { smsLogsApi } from '@/lib/api/sms-logs.api'
import type { SmsLog, SmsStatus } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

export default function SmsLogsContent() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<SmsStatus | ''>('')
  const [module, setModule] = useState('')
  const [messageType, setMessageType] = useState('')
  const [failureReason, setFailureReason] = useState('')
  const [isOtp, setIsOtp] = useState<'' | 'true' | 'false'>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selected, setSelected] = useState<SmsLog | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [retryModalOpen, setRetryModalOpen] = useState(false)
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; variant: 'success' | 'danger' }>>([])

  const filterDeps = [page, search, status, module, messageType, failureReason, isOtp, dateFrom, dateTo]

  const fetchFn = useCallback(
    () => smsLogsApi.list({
      page, limit: 20,
      search: search || undefined,
      status: status || undefined,
      module: module || undefined,
      messageType: messageType || undefined,
      failureReason: failureReason || undefined,
      isOtp: isOtp === '' ? undefined : isOtp === 'true',
      dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
      dateTo: dateTo ? new Date(dateTo + 'T23:59:59').toISOString() : undefined,
    }),
    filterDeps,
  )

  const statsFetchFn = useCallback(() => smsLogsApi.getStats(), [])

  const { data, loading, error, refetch } = useApi(fetchFn, filterDeps)
  const { data: stats, loading: statsLoading } = useApi(statsFetchFn, [])

  const logs = data?.data ?? []
  const meta = data?.meta ?? null

  const addToast = (message: string, variant: 'success' | 'danger') => {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, variant }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000)
  }

  const handleView = async (log: SmsLog) => {
    // Fetch full log with attempt history
    try {
      const full = await smsLogsApi.getById(log.id)
      setSelected(full)
    } catch {
      setSelected(log)
    }
    setModalOpen(true)
  }

  const handleResend = async (log: SmsLog) => {
    try {
      const result = await smsLogsApi.resend(log.id)
      if (result.skipped) {
        addToast(`Skipped: ${result.skipReason ?? 'unknown'}`, 'danger')
      } else {
        addToast(result.status === 'sent' ? 'SMS resent successfully.' : `Resend failed (status: ${result.status})`, result.status === 'sent' ? 'success' : 'danger')
      }
      refetch()
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to resend SMS', 'danger')
    }
  }

  const handleResendFromModal = async (id: string, force = false) => {
    const result = await smsLogsApi.resend(id, { force })
    if (result.skipped) throw new Error(`Resend skipped: ${result.skipReason}`)
    if (result.status !== 'sent') throw new Error(`SMS resend returned status: ${result.status}`)
    refetch()
  }

  const handleRetryFailed = async () => {
    const result = await smsLogsApi.retryFailed({
      module: module || undefined,
      messageType: messageType || undefined,
      failureReason: failureReason || undefined,
    })
    refetch()
    return result
  }

  const handleReset = () => {
    setSearch(''); setStatus(''); setModule(''); setMessageType('');
    setFailureReason(''); setIsOtp(''); setDateFrom(''); setDateTo(''); setPage(1)
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="SMS Logs"
        breadcrumbs={[{ label: 'Payments & Logs' }, { label: 'SMS Logs' }]}
        action={
          <Button size="sm" variant="warning" onClick={() => setRetryModalOpen(true)}>
            <Icon icon="solar:refresh-bold" className="me-1" />
            Retry Failed
          </Button>
        }
      />

      <SmsStatsCards stats={stats ?? null} loading={statsLoading} />

      <ApiErrorAlert error={error as ApiError | null} />

      <Card>
        <Card.Body>
          <SmsFilterBar
            search={search} status={status} module={module} messageType={messageType}
            failureReason={failureReason} isOtp={isOtp} dateFrom={dateFrom} dateTo={dateTo}
            onSearchChange={(v) => { setSearch(v); setPage(1) }}
            onStatusChange={(v) => { setStatus(v); setPage(1) }}
            onModuleChange={(v) => { setModule(v); setPage(1) }}
            onMessageTypeChange={(v) => { setMessageType(v); setPage(1) }}
            onFailureReasonChange={(v) => { setFailureReason(v); setPage(1) }}
            onIsOtpChange={(v) => { setIsOtp(v); setPage(1) }}
            onDateFromChange={(v) => { setDateFrom(v); setPage(1) }}
            onDateToChange={(v) => { setDateTo(v); setPage(1) }}
            onReset={handleReset}
          />

          <SmsLogTable data={logs} loading={loading} onView={handleView} onResend={handleResend} />

          {meta && meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                {meta.total} record{meta.total !== 1 ? 's' : ''} · Page {meta.page} of {meta.totalPages}
              </small>
              <div className="d-flex gap-1">
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasPrev} onClick={() => setPage((p) => p - 1)}>‹</Button>
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasNext} onClick={() => setPage((p) => p + 1)}>›</Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      <SmsLogDetailsModal
        log={selected}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onResend={handleResendFromModal}
      />

      <RetryFailedModal
        isOpen={retryModalOpen}
        onClose={() => setRetryModalOpen(false)}
        onConfirm={handleRetryFailed}
      />

      <ToastContainer position="bottom-end" className="p-3">
        {toasts.map((t) => (
          <Toast key={t.id} bg={t.variant} autohide delay={5000}>
            <Toast.Body className="text-white">{t.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </div>
  )
}
