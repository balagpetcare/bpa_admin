'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Row, Col, Form, InputGroup, Badge, Modal } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { listDonations, exportDonationsCsv, type Donation } from '@/lib/api/donations.api'
import type { ApiError } from '@/lib/api'
import { getApiBase } from '@/lib/utils/api-url'

const API_BASE = getApiBase()

const STATUS_OPTS = [
  { value: '', label: 'All Statuses' },
  { value: 'success', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const STATUS_VARIANT: Record<string, string> = {
  success: 'success',
  pending: 'warning',
  pending_review: 'info',
  failed: 'danger',
  cancelled: 'secondary',
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function DonationListContent() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [detail, setDetail] = useState<Donation | null>(null)

  const fetchFn = useCallback(
    () =>
      listDonations({
        page,
        limit: 25,
        search: search || undefined,
        status: status || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
    [page, search, status, dateFrom, dateTo],
  )
  const { data, loading, error } = useApi(fetchFn, [page, search, status, dateFrom, dateTo])
  const donations = data?.data ?? []
  const meta = data?.meta ?? null

  const [csvExporting, setCsvExporting] = useState(false)

  async function handleExportCsv() {
    setCsvExporting(true)
    try {
      await exportDonationsCsv({ status: status || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined })
    } catch (err) {
      console.error('CSV export failed:', err)
    }
    setCsvExporting(false)
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="All Donations"
        breadcrumbs={[{ label: 'Donations' }, { label: 'All Donations' }]}
        action={
          <Button variant="outline-success" size="sm" onClick={handleExportCsv} disabled={csvExporting}>
            {csvExporting ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" />
                Exporting…
              </>
            ) : (
              <>
                <Icon icon="solar:export-bold" className="me-1" /> Export CSV
              </>
            )}
          </Button>
        }
      />

      <ApiErrorAlert error={error as ApiError | null} />

      <Card>
        <Card.Body>
          {/* Filters */}
          <Row className="g-2 mb-3">
            <Col md={4}>
              <InputGroup size="sm">
                <InputGroup.Text>
                  <Icon icon="solar:magnifer-bold" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search reference, name, email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select
                size="sm"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  setPage(1)
                }}>
                {STATUS_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Control
                size="sm"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  setPage(1)
                }}
                placeholder="From"
              />
            </Col>
            <Col md={2}>
              <Form.Control
                size="sm"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  setPage(1)
                }}
                placeholder="To"
              />
            </Col>
          </Row>

          <LoadingOverlay loading={loading}>
            <Table hover responsive className="table-centered align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Reference</th>
                  <th>Donor</th>
                  <th>Amount</th>
                  <th>Purpose / Campaign</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Provider</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4 text-muted">
                      No donations found.
                    </td>
                  </tr>
                ) : (
                  donations.map((d) => (
                    <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => setDetail(d)}>
                      <td>
                        <span className="font-monospace fw-semibold small">{d.referenceNo}</span>
                      </td>
                      <td>
                        <div className="fw-semibold">{d.isAnonymous ? <em className="text-muted">Anonymous</em> : d.donorName}</div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>
                          {d.donorEmail || d.donorPhone || ''}
                        </div>
                        {d.donorCountry && (
                          <div className="text-muted" style={{ fontSize: '11px' }}>
                            {d.donorCountry}
                          </div>
                        )}
                      </td>
                      <td className="fw-bold text-success">
                        {d.currency} {Number(d.amount).toLocaleString()}
                      </td>
                      <td>
                        {d.campaign && (
                          <div style={{ fontSize: '11px' }}>
                            <Badge bg="primary-subtle" text="primary">
                              {d.campaign.titleEn}
                            </Badge>
                          </div>
                        )}
                        {d.purpose && (
                          <div style={{ fontSize: '11px' }}>
                            <Badge bg="success-subtle" text="success">
                              {d.purpose.titleEn}
                            </Badge>
                          </div>
                        )}
                        {!d.campaign && !d.purpose && <span className="text-muted fst-italic">General Fund</span>}
                      </td>
                      <td>
                        {d.qrSlug ? (
                          <Badge bg="info-subtle" text="info">
                            QR: {d.qrSlug}
                          </Badge>
                        ) : d.source ? (
                          <span className="text-muted small">{d.source}</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <Badge
                          bg={`${STATUS_VARIANT[d.status] ?? 'secondary'}-subtle`}
                          text={STATUS_VARIANT[d.status] ?? 'secondary'}
                          className="text-capitalize">
                          {d.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="light" text="dark">
                          EPS
                        </Badge>
                      </td>
                      <td className="text-muted small">
                        <div>{fmt(d.createdAt)}</div>
                        {d.paidAt && (
                          <div className="text-success" style={{ fontSize: '10px' }}>
                            Paid: {fmt(d.paidAt)}
                          </div>
                        )}
                      </td>
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex gap-1 justify-content-end">
                          <Button variant="soft-primary" size="sm" title="View" onClick={() => setDetail(d)}>
                            <Icon icon="solar:eye-bold" />
                          </Button>
                          {d.status === 'success' && (
                            <a
                              className="btn btn-soft-success btn-sm"
                              title="Download Receipt"
                              href={`${API_BASE}/public/donations/receipt/${d.referenceNo}/pdf`}
                              target="_blank"
                              rel="noopener noreferrer">
                              <Icon icon="solar:download-bold" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </LoadingOverlay>

          {meta && (meta.totalPages ?? 1) > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                {meta.total} total · Page {meta.page} of {meta.totalPages}
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

      {/* Detail Modal */}
      <Modal show={!!detail} onHide={() => setDetail(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="font-monospace small">{detail?.referenceNo}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detail && (
            <Row className="g-3">
              <Col md={6}>
                <p className="text-muted small mb-1 fw-bold text-uppercase">Donor</p>
                <p className="mb-0 fw-semibold">{detail.isAnonymous ? 'Anonymous' : detail.donorName}</p>
                {detail.donorEmail && <p className="mb-0 small text-muted">{detail.donorEmail}</p>}
                {detail.donorPhone && <p className="mb-0 small text-muted">{detail.donorPhone}</p>}
                {detail.donorCountry && <p className="mb-0 small text-muted">{detail.donorCountry}</p>}
                {detail.organizationName && (
                  <p className="mb-0 small">
                    <strong>Org:</strong> {detail.organizationName}
                  </p>
                )}
              </Col>
              <Col md={6}>
                <p className="text-muted small mb-1 fw-bold text-uppercase">Payment</p>
                <p className="mb-1 fs-4 fw-bold text-success">
                  {detail.currency} {Number(detail.amount).toLocaleString()}
                </p>
                <Badge
                  bg={`${STATUS_VARIANT[detail.status] ?? 'secondary'}-subtle`}
                  text={STATUS_VARIANT[detail.status] ?? 'secondary'}
                  className="text-capitalize">
                  {detail.status.replace('_', ' ')}
                </Badge>
                {detail.gatewayTransactionId && <p className="mb-0 small text-muted mt-2">Txn: {detail.gatewayTransactionId}</p>}
                {detail.payment?.epsTxnId && <p className="mb-0 small text-muted">EPS Txn: {detail.payment.epsTxnId}</p>}
              </Col>
              {detail.campaign && (
                <Col md={6}>
                  <p className="text-muted small mb-1 fw-bold text-uppercase">Campaign</p>
                  <p className="mb-0">{detail.campaign.titleEn}</p>
                </Col>
              )}
              {detail.purpose && (
                <Col md={6}>
                  <p className="text-muted small mb-1 fw-bold text-uppercase">Purpose</p>
                  <p className="mb-0">{detail.purpose.titleEn}</p>
                </Col>
              )}
              {detail.message && (
                <Col xs={12}>
                  <p className="text-muted small mb-1 fw-bold text-uppercase">Message</p>
                  <p className="mb-0 fst-italic">&ldquo;{detail.message}&rdquo;</p>
                </Col>
              )}
              <Col xs={12}>
                <p className="text-muted small mb-1 fw-bold text-uppercase">Timeline</p>
                <p className="mb-0 small">Created: {fmt(detail.createdAt)}</p>
                {detail.paidAt && <p className="mb-0 small text-success">Paid: {fmt(detail.paidAt)}</p>}
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          {detail?.status === 'success' && (
            <a
              className="btn btn-success btn-sm"
              href={`${API_BASE}/public/donations/receipt/${detail.referenceNo}/pdf`}
              target="_blank"
              rel="noopener noreferrer">
              <Icon icon="solar:download-bold" className="me-1" /> Download Receipt PDF
            </a>
          )}
          <Button variant="secondary" size="sm" onClick={() => setDetail(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
