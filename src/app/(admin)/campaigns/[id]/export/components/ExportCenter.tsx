'use client'

import { useState } from 'react'
import { Alert, Badge, Button, Card, Col, Form, Row } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import { campaignsApi } from '@/lib/api/campaigns.api'

const EXPORT_FORMATS = [
  {
    id: 'csv',
    label: 'CSV Export',
    description: 'Flat CSV file with all participants. Best for spreadsheet tools.',
    icon: 'solar:file-text-bold-duotone',
    variant: 'success',
    ext: '.csv',
  },
  {
    id: 'xlsx',
    label: 'Excel Export',
    description: 'Multi-sheet Excel workbook: Summary, Participants, Paid, Pending, Cancelled, Sessions.',
    icon: 'solar:file-bold-duotone',
    variant: 'primary',
    ext: '.xlsx',
    badge: 'Recommended',
  },
]

const QUICK_FILTERS: { label: string; params: Record<string, string> }[] = [
  { label: 'All Participants', params: {} },
  { label: 'Paid Only', params: { paymentStatus: 'success' } },
  { label: 'Pending Payment', params: { paymentStatus: 'pending' } },
  { label: 'Failed Payments', params: { paymentStatus: 'failed' } },
  { label: 'Cancelled', params: { registrationStatus: 'cancelled' } },
  { label: 'Checked-In', params: { registrationStatus: 'checked_in' } },
  { label: 'Vaccinated', params: { registrationStatus: 'vaccinated' } },
  { label: 'Certificates Issued', params: { registrationStatus: 'certificate_issued' } },
]

export default function ExportCenter({ campaignId }: { campaignId: string }) {
  const [paymentStatus, setPaymentStatus] = useState('')
  const [registrationStatus, setRegistrationStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [exportError, setExportError] = useState<string | null>(null)
  const [lastExported, setLastExported] = useState<string | null>(null)

  function buildParams() {
    const p: Record<string, string> = {}
    if (paymentStatus) p.paymentStatus = paymentStatus
    if (registrationStatus) p.registrationStatus = registrationStatus
    if (dateFrom) p.dateFrom = dateFrom
    if (dateTo) p.dateTo = dateTo
    return p
  }

  function triggerExport(type: 'csv' | 'xlsx', extraParams?: Record<string, string>) {
    setExportError(null)
    try {
      const params = { ...buildParams(), ...extraParams }
      const url = type === 'csv' ? campaignsApi.exportCsvUrl(campaignId, params) : campaignsApi.exportXlsxUrl(campaignId, params)
      const a = document.createElement('a')
      a.href = url
      a.download = ''
      a.click()
      setLastExported(`${type.toUpperCase()} export started at ${new Date().toLocaleTimeString()}`)
    } catch {
      setExportError('Export failed. Please try again.')
    }
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Export Center"
        breadcrumbs={[{ label: 'Campaigns', href: '/campaigns' }, { label: 'Detail', href: `/campaigns/${campaignId}` }, { label: 'Export Center' }]}
        action={
          <Link href={`/campaigns/${campaignId}/participants`} className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1">
            <Icon icon="solar:users-group-two-rounded-bold" />
            View Participants
          </Link>
        }
      />

      {exportError && (
        <Alert variant="danger" dismissible onClose={() => setExportError(null)}>
          {exportError}
        </Alert>
      )}
      {lastExported && (
        <Alert variant="success" dismissible onClose={() => setLastExported(null)}>
          {lastExported}
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={5}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <Icon icon="solar:filter-bold-duotone" className="text-primary" />
                Export Filters
              </h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column gap-3">
              <Form.Group>
                <Form.Label className="small fw-semibold">Payment Status</Form.Label>
                <Form.Select size="sm" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                  <option value="">All</option>
                  <option value="success">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label className="small fw-semibold">Registration Status</Form.Label>
                <Form.Select size="sm" value={registrationStatus} onChange={(e) => setRegistrationStatus(e.target.value)}>
                  <option value="">All</option>
                  <option value="pending_payment">Pending Payment</option>
                  <option value="paid">Paid</option>
                  <option value="checked_in">Checked In</option>
                  <option value="vaccinated">Vaccinated</option>
                  <option value="certificate_issued">Certificate Issued</option>
                  <option value="completed">Completed</option>
                  <option value="no_show">No Show</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
              <Row className="g-2">
                <Col>
                  <Form.Label className="small fw-semibold">Date From</Form.Label>
                  <Form.Control size="sm" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </Col>
                <Col>
                  <Form.Label className="small fw-semibold">Date To</Form.Label>
                  <Form.Control size="sm" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </Col>
              </Row>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setPaymentStatus('')
                  setRegistrationStatus('')
                  setDateFrom('')
                  setDateTo('')
                }}>
                Reset Filters
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <Icon icon="solar:file-download-bold-duotone" className="text-success" />
                Export with Current Filters
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                {EXPORT_FORMATS.map((f) => (
                  <Col key={f.id} sm={6}>
                    <div className={`border border-${f.variant} border-opacity-25 rounded p-3 h-100 d-flex flex-column gap-2`}>
                      <div className="d-flex align-items-center gap-2">
                        <Icon icon={f.icon} className={`fs-28 text-${f.variant}`} />
                        <div>
                          <div className="fw-semibold">
                            {f.label}{' '}
                            {f.badge && (
                              <Badge bg={`${f.variant}-subtle`} text={f.variant} className="ms-1 small">
                                {f.badge}
                              </Badge>
                            )}
                          </div>
                          <div className="text-muted small">{f.ext}</div>
                        </div>
                      </div>
                      <p className="text-muted small mb-auto">{f.description}</p>
                      <Button
                        variant={f.variant}
                        size="sm"
                        onClick={() => triggerExport(f.id as 'csv' | 'xlsx')}
                        className="d-flex align-items-center gap-1 justify-content-center">
                        <Icon icon="solar:download-bold" />
                        Download {f.ext}
                      </Button>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <Icon icon="solar:bolt-bold-duotone" className="text-warning" />
                Quick Exports
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column gap-2">
                {QUICK_FILTERS.map((qf) => (
                  <div key={qf.label} className="d-flex align-items-center justify-content-between border rounded p-2">
                    <span className="fw-semibold small">{qf.label}</span>
                    <div className="d-flex gap-1">
                      <Button size="sm" variant="outline-success" onClick={() => triggerExport('csv', qf.params)}>
                        <Icon icon="solar:file-text-bold" />
                      </Button>
                      <Button size="sm" variant="outline-primary" onClick={() => triggerExport('xlsx', qf.params)}>
                        <Icon icon="solar:file-bold" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
