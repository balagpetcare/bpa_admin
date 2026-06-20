'use client'

import { useCallback, useState } from 'react'
import {
  Alert, Badge, Button, Card, Col, Form,
  Modal, Row, Spinner, Tab, Table, Tabs,
} from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { campaignsApi } from '@/lib/api/campaigns.api'
import type { BulkSmsFilters, BulkSmsPreviewResult, BulkSmsBatch } from '@/types/bpa.types'
import dayjs from 'dayjs'

const TEMPLATE_VARS = [
  { key: '{{ownerName}}', label: 'Owner Name' },
  { key: '{{campaignTitle}}', label: 'Campaign Title' },
  { key: '{{sessionDate}}', label: 'Session Date' },
  { key: '{{venueName}}', label: 'Venue Name' },
  { key: '{{bookingRef}}', label: 'Booking Ref' },
  { key: '{{paymentStatus}}', label: 'Payment Status' },
]

const QUICK_AUDIENCES = [
  { label: 'All Participants', icon: 'solar:users-group-two-rounded-bold-duotone', filters: {}, variant: 'primary' },
  { label: 'Paid Only', icon: 'solar:check-circle-bold-duotone', filters: { paymentStatus: 'success' }, variant: 'success' },
  { label: 'Pending Payment', icon: 'solar:clock-circle-bold-duotone', filters: { paymentStatus: 'pending' }, variant: 'warning' },
  { label: 'Failed Payments', icon: 'solar:close-circle-bold-duotone', filters: { paymentStatus: 'failed' }, variant: 'danger' },
  { label: 'Cancelled', icon: 'solar:forbidden-circle-bold-duotone', filters: { registrationStatus: 'cancelled' }, variant: 'secondary' },
]

// ─── Confirmation modal ───────────────────────────────────────────

interface ConfirmModalProps {
  preview: BulkSmsPreviewResult
  template: string
  onConfirm: () => void
  onCancel: () => void
  sending: boolean
}
function ConfirmModal({ preview, template, onConfirm, onCancel, sending }: ConfirmModalProps) {
  return (
    <Modal show onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2">
          <Icon icon="solar:chat-round-like-bold-duotone" className="text-primary" />
          Confirm Bulk SMS
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="warning" className="d-flex align-items-center gap-2">
          <Icon icon="solar:danger-bold-duotone" className="fs-20 flex-shrink-0" />
          You are about to send SMS to <strong>{preview.recipientCount.toLocaleString()} recipients</strong>. This action cannot be undone.
        </Alert>

        <div className="mb-3">
          <label className="fw-semibold small text-uppercase text-muted mb-1">Template Preview</label>
          <div className="bg-light rounded p-3 small border">{template}</div>
        </div>

        {preview.sampleRecipients?.length > 0 && (
          <div>
            <label className="fw-semibold small text-uppercase text-muted mb-1">Sample Messages ({preview.sampleRecipients.length} shown)</label>
            <div className="d-flex flex-column gap-2" style={{ maxHeight: 200, overflowY: 'auto' }}>
              {preview.sampleRecipients.map((r, i) => (
                <div key={i} className="border rounded p-2 small">
                  <div className="fw-semibold text-primary">{r.ownerName} · {r.bookingNumber}</div>
                  <div className="text-muted mt-1">{r.renderedMessage}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel} disabled={sending}>Cancel</Button>
        <Button variant="primary" onClick={onConfirm} disabled={sending} className="d-flex align-items-center gap-2">
          {sending ? <Spinner size="sm" /> : <Icon icon="solar:send-bold-duotone" />}
          {sending ? 'Sending…' : `Send to ${preview.recipientCount.toLocaleString()} recipients`}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

// ─── History tab ──────────────────────────────────────────────────

function SmsHistory({ campaignId }: { campaignId: string }) {
  const fn = useCallback(() => campaignsApi.bulkSmsHistory(campaignId), [campaignId])
  const { data: batches, loading } = useApi<BulkSmsBatch[]>(fn, [campaignId])

  if (loading) return <div className="text-center py-4"><Spinner /></div>
  if (!batches || batches.length === 0) return (
    <div className="text-center py-5 text-muted">
      <Icon icon="solar:chat-round-like-bold-duotone" className="fs-36 mb-2 d-block mx-auto" />
      No SMS batches sent yet.
    </div>
  )

  return (
    <Table hover className="small align-middle">
      <thead className="table-light text-uppercase" style={{ fontSize: '0.7rem' }}>
        <tr>
          <th>Sent At</th>
          <th>By</th>
          <th className="text-center">Recipients</th>
          <th className="text-center">Queued</th>
          <th className="text-center">Failed</th>
          <th>Status</th>
          <th>Template</th>
        </tr>
      </thead>
      <tbody>
        {batches.map(b => (
          <tr key={b.id}>
            <td>{dayjs(b.createdAt).format('MMM D, YYYY HH:mm')}</td>
            <td>{b.createdBy?.name ?? '—'}</td>
            <td className="text-center fw-bold">{b.recipientCount.toLocaleString()}</td>
            <td className="text-center">{b.queuedCount.toLocaleString()}</td>
            <td className="text-center text-danger">{b.failedCount.toLocaleString()}</td>
            <td>
              <Badge bg={b.status === 'completed' ? 'success' : b.status === 'failed' ? 'danger' : 'warning'}>
                {b.status}
              </Badge>
            </td>
            <td>
              <div style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={b.template}>
                {b.template}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

// ─── Main ─────────────────────────────────────────────────────────

export default function BulkSmsCenter({ campaignId }: { campaignId: string }) {
  const { can } = usePermission()
  const { mutate } = useApiMutation<unknown, unknown>()

  const [template, setTemplate] = useState('')
  const [filters, setFilters] = useState<BulkSmsFilters>({})
  const [preview, setPreview] = useState<BulkSmsPreviewResult | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [sending, setSending] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  function insertVar(v: string) {
    setTemplate(t => t + v)
  }

  function applyQuickAudience(f: BulkSmsFilters) {
    setFilters(f); setPreview(null)
  }

  async function handlePreview() {
    if (!template.trim()) { setErrMsg('Template is required.'); return }
    setErrMsg(null); setPreviewing(true)
    try {
      const result = await campaignsApi.bulkSmsPreview(campaignId, { template, filters })
      setPreview(result)
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : 'Preview failed.')
    } finally {
      setPreviewing(false)
    }
  }

  async function handleSend() {
    if (!preview) return
    setSending(true)
    try {
      const result = await campaignsApi.bulkSmsSend(campaignId, {
        template,
        filters,
        previewCount: preview.recipientCount,
        confirmation: true,
      })
      setShowConfirm(false)
      setSuccessMsg(`SMS batch submitted: ${(result as any)?.queued ?? preview.recipientCount} messages queued.`)
      setTemplate(''); setFilters({}); setPreview(null)
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : 'Send failed.')
      setShowConfirm(false)
    } finally {
      setSending(false)
    }
  }

  const charCount = template.length
  const smsUnits = Math.ceil(charCount / 160) || 1

  return (
    <div className="container-fluid">
      <PageHeader
        title="Bulk SMS Center"
        breadcrumbs={[
          { label: 'Campaigns', href: '/campaigns' },
          { label: 'Detail', href: `/campaigns/${campaignId}` },
          { label: 'Bulk SMS' },
        ]}
        action={
          <Link href={`/campaigns/${campaignId}/participants`} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <Icon icon="solar:users-group-two-rounded-bold" />Participants
          </Link>
        }
      />

      {successMsg && <Alert variant="success" dismissible onClose={() => setSuccessMsg(null)} className="d-flex align-items-center gap-2"><Icon icon="solar:check-circle-bold-duotone" className="fs-20" />{successMsg}</Alert>}
      {errMsg && <Alert variant="danger" dismissible onClose={() => setErrMsg(null)}>{errMsg}</Alert>}

      <Tabs defaultActiveKey="compose" className="mb-4 border-bottom">
        <Tab eventKey="compose" title={<span className="d-flex align-items-center gap-1"><Icon icon="solar:pen-bold-duotone" />Compose</span>}>
          <Row className="g-4">
            {/* Left: template + filters */}
            <Col lg={7}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white border-bottom py-3">
                  <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                    <Icon icon="solar:chat-square-bold-duotone" className="text-primary" />
                    Message Template
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-2 d-flex flex-wrap gap-1">
                    {TEMPLATE_VARS.map(v => (
                      <Button key={v.key} size="sm" variant="outline-primary" onClick={() => insertVar(v.key)} className="d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                        <Icon icon="solar:add-circle-bold" />{v.label}
                      </Button>
                    ))}
                  </div>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder={`Dear {{ownerName}}, your booking {{bookingRef}} for the {{campaignTitle}} on {{sessionDate}} at {{venueName}} is confirmed. Payment: {{paymentStatus}}.`}
                    value={template}
                    onChange={e => { setTemplate(e.target.value); setPreview(null) }}
                  />
                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-muted">{charCount} chars · {smsUnits} SMS unit{smsUnits > 1 ? 's' : ''} per recipient</small>
                    {charCount > 5000 && <small className="text-danger">Exceeds 5000 character limit</small>}
                  </div>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom py-3">
                  <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                    <Icon icon="solar:filter-bold-duotone" className="text-primary" />
                    Audience Filters
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col sm={6}>
                      <Form.Label className="small fw-semibold">Payment Status</Form.Label>
                      <Form.Select size="sm" value={filters.paymentStatus ?? ''} onChange={e => setFilters(f => ({ ...f, paymentStatus: e.target.value || undefined }))}>
                        <option value="">All</option>
                        <option value="success">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="cancelled">Cancelled</option>
                      </Form.Select>
                    </Col>
                    <Col sm={6}>
                      <Form.Label className="small fw-semibold">Registration Status</Form.Label>
                      <Form.Select size="sm" value={filters.registrationStatus ?? ''} onChange={e => setFilters(f => ({ ...f, registrationStatus: e.target.value || undefined }))}>
                        <option value="">All</option>
                        <option value="pending_payment">Pending Payment</option>
                        <option value="paid">Paid</option>
                        <option value="checked_in">Checked In</option>
                        <option value="vaccinated">Vaccinated</option>
                        <option value="certificate_issued">Certificate Issued</option>
                        <option value="cancelled">Cancelled</option>
                      </Form.Select>
                    </Col>
                    <Col sm={6}>
                      <Form.Label className="small fw-semibold">Date From</Form.Label>
                      <Form.Control size="sm" type="date" value={filters.dateFrom ?? ''} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value || undefined }))} />
                    </Col>
                    <Col sm={6}>
                      <Form.Label className="small fw-semibold">Date To</Form.Label>
                      <Form.Control size="sm" type="date" value={filters.dateTo ?? ''} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value || undefined }))} />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* Right: quick audience + preview */}
            <Col lg={5}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white border-bottom py-3">
                  <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                    <Icon icon="solar:bolt-bold-duotone" className="text-warning" />
                    Quick Audience
                  </h5>
                </Card.Header>
                <Card.Body className="d-flex flex-column gap-2">
                  {QUICK_AUDIENCES.map(qa => (
                    <Button
                      key={qa.label}
                      variant={`outline-${qa.variant}`}
                      size="sm"
                      onClick={() => applyQuickAudience(qa.filters)}
                      className="d-flex align-items-center gap-2 text-start"
                    >
                      <Icon icon={qa.icon} className="fs-16 flex-shrink-0" />
                      {qa.label}
                    </Button>
                  ))}
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom py-3">
                  <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                    <Icon icon="solar:eye-bold-duotone" className="text-info" />
                    Preview & Send
                  </h5>
                </Card.Header>
                <Card.Body>
                  {!preview ? (
                    <div className="text-center py-3">
                      <Icon icon="solar:chat-round-like-bold-duotone" className="fs-36 text-muted mb-2 d-block mx-auto" />
                      <p className="text-muted small">Write your template and click Preview to see recipient count and sample messages.</p>
                      <Button
                        variant="outline-primary"
                        onClick={handlePreview}
                        disabled={previewing || !template.trim()}
                        className="d-flex align-items-center gap-2 mx-auto"
                      >
                        {previewing ? <Spinner size="sm" /> : <Icon icon="solar:eye-bold" />}
                        {previewing ? 'Loading…' : 'Preview Recipients'}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className={`text-center py-3 rounded mb-3 ${preview.recipientCount === 0 ? 'bg-warning-subtle' : 'bg-success-subtle'}`}>
                        <div className={`fw-bold fs-2 ${preview.recipientCount === 0 ? 'text-warning' : 'text-success'}`}>
                          {preview.recipientCount.toLocaleString()}
                        </div>
                        <div className="text-muted small fw-semibold text-uppercase">Recipients</div>
                      </div>

                      {preview.sampleRecipients?.length > 0 && (
                        <div className="mb-3">
                          <label className="small fw-semibold text-muted text-uppercase mb-1">Sample</label>
                          <div className="d-flex flex-column gap-2" style={{ maxHeight: 180, overflowY: 'auto' }}>
                            {preview.sampleRecipients.slice(0, 3).map((r, i) => (
                              <div key={i} className="border rounded p-2 small bg-light">
                                <div className="fw-semibold">{r.ownerName}</div>
                                <div className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>{r.renderedMessage}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="d-flex gap-2">
                        <Button variant="outline-secondary" size="sm" onClick={handlePreview} disabled={previewing}>
                          {previewing ? <Spinner size="sm" /> : 'Refresh'}
                        </Button>
                        {can('campaigns:update') && preview.recipientCount > 0 && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                            onClick={() => setShowConfirm(true)}
                          >
                            <Icon icon="solar:send-bold-duotone" />
                            Send to {preview.recipientCount.toLocaleString()}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="history" title={<span className="d-flex align-items-center gap-1"><Icon icon="solar:history-bold-duotone" />History</span>}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <SmsHistory campaignId={campaignId} />
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {showConfirm && preview && (
        <ConfirmModal
          preview={preview}
          template={template}
          onConfirm={handleSend}
          onCancel={() => setShowConfirm(false)}
          sending={sending}
        />
      )}
    </div>
  )
}
