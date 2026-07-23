'use client'

import { useCallback, useState } from 'react'
import { Alert, Badge, Button, Card, Col, Dropdown, Form, InputGroup, Row, Table } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { registrationsApi } from '@/lib/api/registrations.api'
import { campaignsApi } from '@/lib/api/campaigns.api'
import type { ApiError } from '@/lib/api'
import type { CampaignRegistration, CampaignRegistrationStatus } from '@/types/bpa.types'
import dayjs from 'dayjs'

const STATUS_COLORS: Record<CampaignRegistrationStatus, string> = {
  pending_payment: 'warning',
  paid: 'success',
  checked_in: 'info',
  vaccinated: 'primary',
  certificate_issued: 'secondary',
  completed: 'dark',
  no_show: 'danger',
  cancelled: 'danger',
}

const PAY_COLORS: Record<string, string> = {
  success: 'success',
  pending: 'warning',
  failed: 'danger',
  cancelled: 'secondary',
  pending_review: 'info',
  refunded: 'info',
}

export default function RegistrationsList({ campaignId }: { campaignId: string }) {
  const { can } = usePermission()
  const { mutate } = useApiMutation<unknown, unknown>()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [page, setPage] = useState(1)
  const [exportError, setExportError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchFn = useCallback(
    () => registrationsApi.list({ campaignId, search: search || undefined, status: status || undefined, page, limit: 20 }),
    [campaignId, search, status, page],
  )
  const { data, loading, error, refetch } = useApi(fetchFn, [campaignId, search, status, page])

  const paySummaryFn = useCallback(() => campaignsApi.getPaymentSummary(campaignId), [campaignId])
  const { data: paySummary } = useApi(paySummaryFn, [campaignId])

  const items = (data?.items ?? []) as CampaignRegistration[]
  const meta = data?.meta as { total: number; totalPages: number } | undefined

  function buildExportQs() {
    const p: Record<string, string> = {}
    if (search) p.search = search
    if (status) p.registrationStatus = status
    if (paymentStatus) p.paymentStatus = paymentStatus
    return p
  }

  function handleExport(type: 'csv' | 'xlsx') {
    setExportError(null)
    try {
      const url = type === 'csv' ? campaignsApi.exportCsvUrl(campaignId, buildExportQs()) : campaignsApi.exportXlsxUrl(campaignId, buildExportQs())
      const a = document.createElement('a')
      a.href = url
      a.download = ''
      a.click()
    } catch {
      setExportError('Export failed. Please try again.')
    }
  }

  async function handleCancel(id: string) {
    if (!confirm('Cancel this registration? This cannot be undone.')) return
    setActionError(null)
    try {
      await mutate(() => registrationsApi.cancel(id), undefined)
      refetch()
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : 'Cancel failed.')
    }
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Registrations"
        breadcrumbs={[{ label: 'Campaigns', href: '/campaigns' }, { label: 'Detail', href: `/campaigns/${campaignId}` }, { label: 'Registrations' }]}
        action={
          <div className="d-flex gap-2 flex-wrap">
            <Link href={`/campaigns/${campaignId}/participants`} className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
              <Icon icon="solar:users-group-two-rounded-bold" />
              Participants View
            </Link>
            {can('campaigns:read') && (
              <>
                <Button size="sm" variant="outline-success" onClick={() => handleExport('csv')} className="d-flex align-items-center gap-1">
                  <Icon icon="solar:file-text-bold" />
                  CSV
                </Button>
                <Button size="sm" variant="outline-primary" onClick={() => handleExport('xlsx')} className="d-flex align-items-center gap-1">
                  <Icon icon="solar:file-bold" />
                  Excel
                </Button>
              </>
            )}
          </div>
        }
      />

      {exportError && (
        <Alert variant="danger" dismissible onClose={() => setExportError(null)}>
          {exportError}
        </Alert>
      )}
      {actionError && (
        <Alert variant="danger" dismissible onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}
      <ApiErrorAlert error={error as ApiError | null} />

      {/* Payment summary bar */}
      {paySummary && (
        <Row className="g-3 mb-3">
          {[
            { label: 'Paid', key: 'success', variant: 'success', icon: 'solar:check-circle-bold-duotone' },
            { label: 'Pending', key: 'pending', variant: 'warning', icon: 'solar:clock-circle-bold-duotone' },
            { label: 'Failed', key: 'failed', variant: 'danger', icon: 'solar:close-circle-bold-duotone' },
            { label: 'Cancelled', key: 'cancelled', variant: 'secondary', icon: 'solar:forbidden-circle-bold-duotone' },
          ].map(({ label, key, variant, icon }) => {
            const info = paySummary?.[key]
            return (
              <Col key={key} sm={6} lg={3}>
                <Card
                  className={`border-0 shadow-sm border-start border-4 border-${variant} cursor-pointer`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setPaymentStatus(key === paymentStatus ? '' : key)
                    setPage(1)
                  }}>
                  <Card.Body className="py-2 px-3 d-flex align-items-center gap-3">
                    <Icon icon={icon} className={`fs-24 text-${variant}`} />
                    <div>
                      <div className="fw-bold fs-5">{(info?.count ?? 0).toLocaleString()}</div>
                      {info?.total !== undefined && <div className="small text-muted">৳{info.total.toLocaleString()}</div>}
                      <div className={`text-${variant} small fw-semibold text-uppercase`}>{label}</div>
                    </div>
                    {paymentStatus === key && <Icon icon="solar:check-circle-bold" className={`ms-auto text-${variant}`} />}
                  </Card.Body>
                </Card>
              </Col>
            )
          })}
        </Row>
      )}

      {/* Filters */}
      <Card className="mb-3 border-0 shadow-sm">
        <Card.Body className="py-2">
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <InputGroup style={{ maxWidth: 280 }} size="sm">
              <InputGroup.Text>
                <Icon icon="solar:magnifer-bold" />
              </InputGroup.Text>
              <Form.Control
                placeholder="Booking ref, owner name, phone…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </InputGroup>
            <Form.Select
              size="sm"
              style={{ maxWidth: 170 }}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}>
              <option value="">All Statuses</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="paid">Paid</option>
              <option value="checked_in">Checked In</option>
              <option value="vaccinated">Vaccinated</option>
              <option value="certificate_issued">Certificate Issued</option>
              <option value="completed">Completed</option>
              <option value="no_show">No Show</option>
              <option value="cancelled">Cancelled</option>
            </Form.Select>
            {(search || status || paymentStatus) && (
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={() => {
                  setSearch('')
                  setStatus('')
                  setPaymentStatus('')
                  setPage(1)
                }}>
                Reset
              </Button>
            )}
            <small className="text-muted ms-auto">{meta?.total?.toLocaleString() ?? '—'} total</small>
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <LoadingOverlay loading={loading}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Booking #</th>
                  <th>Owner</th>
                  <th>Session</th>
                  <th>Pets</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-5">
                      <Icon icon="solar:inbox-bold-duotone" className="fs-36 text-muted mb-2 d-block mx-auto" />
                      <div className="text-muted">No registrations found</div>
                    </td>
                  </tr>
                ) : (
                  items.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <code className="text-primary">{r.bookingNumber}</code>
                      </td>
                      <td>
                        <div className="fw-semibold">{r.owner.ownerName}</div>
                        <small className="text-muted">{r.owner.mobile}</small>
                      </td>
                      <td>
                        <div>{dayjs(r.session.sessionDate).format('MMM D, YYYY')}</div>
                        <small className="text-muted">
                          {r.session.startTime} · {r.session.venue?.name ?? '—'}
                        </small>
                      </td>
                      <td>{r._count?.petBookings ?? r.petBookings?.length ?? 0}</td>
                      <td>৳{r.totalAmountBdt}</td>
                      <td>
                        {r.payment ? (
                          <Badge bg={PAY_COLORS[r.payment.status] ?? 'secondary'} className="text-capitalize">
                            {r.payment.status}
                          </Badge>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>
                        <Badge bg={STATUS_COLORS[r.status]} className="text-capitalize">
                          {r.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td>
                        <small>{dayjs(r.createdAt).format('MMM D, YYYY')}</small>
                      </td>
                      <td>
                        <Dropdown align="end">
                          <Dropdown.Toggle size="sm" variant="soft-secondary" className="no-caret d-flex align-items-center gap-1">
                            <Icon icon="solar:menu-dots-bold" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item
                              as={Link}
                              href={`/campaigns/${campaignId}/registrations/${r.id}`}
                              className="d-flex align-items-center gap-2">
                              <Icon icon="solar:eye-bold" className="text-primary" />
                              View Detail
                            </Dropdown.Item>
                            {r.payment && (
                              <Dropdown.Item className="d-flex align-items-center gap-2" disabled>
                                <Icon icon="solar:bill-list-bold" className="text-success" />
                                View Payment
                              </Dropdown.Item>
                            )}
                            {can('campaigns:update') && r.status !== 'cancelled' && (
                              <Dropdown.Item className="d-flex align-items-center gap-2 text-danger" onClick={() => handleCancel(r.id)}>
                                <Icon icon="solar:close-circle-bold" className="text-danger" />
                                Cancel Booking
                              </Dropdown.Item>
                            )}
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </LoadingOverlay>
        </Card.Body>
        {meta && meta.totalPages > 1 && (
          <Card.Footer className="bg-white border-top d-flex justify-content-between align-items-center py-2">
            <small className="text-muted">
              Page {page} of {meta.totalPages}
            </small>
            <div className="d-flex gap-1">
              <Button size="sm" variant="soft-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                ‹ Prev
              </Button>
              <Button size="sm" variant="soft-secondary" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
                Next ›
              </Button>
            </div>
          </Card.Footer>
        )}
      </Card>
    </div>
  )
}
