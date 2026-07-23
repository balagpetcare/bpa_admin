'use client'

import { useState, useCallback } from 'react'
import { Card, Row, Col, Button, Form, Badge, Modal } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import QrCodeImage from '@/components/ui/QrCodeImage'
import { useApi, useApiMutation } from '@/hooks/useApi'
import {
  listQrCodes,
  createQrCode,
  updateQrCode,
  deleteQrCode,
  listPurposes,
  listCampaigns,
  qrCodePublicUrl,
  type DonationQrCode,
} from '@/lib/api/donations.api'
import type { ApiError } from '@/lib/api'

const TYPE_OPTS = [
  { value: 'general', label: 'General Donation' },
  { value: 'purpose', label: 'Purpose-specific' },
  { value: 'campaign', label: 'Campaign-specific' },
  { value: 'source', label: 'Event / Poster / Source' },
]

const EMPTY: Partial<DonationQrCode> = {
  label: '',
  type: 'general',
  slug: '',
  isActive: true,
  sourceTag: '',
}

const TYPE_VARIANT: Record<string, string> = {
  general: 'primary',
  purpose: 'success',
  campaign: 'info',
  source: 'warning',
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function QrCodesContent() {
  const { mutate } = useApiMutation<unknown, unknown>()
  const [showCreate, setShowCreate] = useState(false)
  const [qrPreview, setQrPreview] = useState<DonationQrCode | null>(null)
  const [form, setForm] = useState<Partial<DonationQrCode>>(EMPTY)
  const [saving, setSaving] = useState(false)

  const fn = useCallback(() => listQrCodes(), [])
  const { data: codes, loading, error, refetch } = useApi(fn, [])

  const purposeFn = useCallback(() => listPurposes(), [])
  const { data: purposes } = useApi(purposeFn, [])

  const campaignFn = useCallback(() => listCampaigns(), [])
  const { data: campaigns } = useApi(campaignFn, [])

  function set<K extends keyof DonationQrCode>(key: K, value: any) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await mutate(() => createQrCode(form), undefined)
    setSaving(false)
    setShowCreate(false)
    setForm(EMPTY)
    refetch()
  }

  async function handleDelete(id: string, label: string) {
    if (!confirm(`Delete QR code "${label}"?`)) return
    await mutate(() => deleteQrCode(id), undefined)
    refetch()
  }

  async function toggleActive(code: DonationQrCode) {
    await mutate(() => updateQrCode(code.id, { isActive: !code.isActive }), undefined)
    refetch()
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="QR Codes"
        breadcrumbs={[{ label: 'Donations' }, { label: 'QR Codes' }]}
        action={
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
            <Icon icon="solar:add-circle-bold" className="me-1" />
            Create QR Code
          </Button>
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />

      <LoadingOverlay loading={loading}>
        <Row className="g-4">
          {(codes ?? []).length === 0 && !loading && (
            <Col xs={12}>
              <Card className="text-center py-5">
                <Card.Body>
                  <Icon icon="solar:qr-code-bold-duotone" className="text-muted fs-1 mb-3" />
                  <h5 className="text-muted">No QR codes yet</h5>
                  <p className="text-muted small">Create your first QR code to start tracking donations by source.</p>
                  <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
                    <Icon icon="solar:add-circle-bold" className="me-1" />
                    Create QR Code
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          )}
          {(codes ?? []).map((code: DonationQrCode) => (
            <Col key={code.id} xs={12} sm={6} xl={4}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <Badge bg={`${TYPE_VARIANT[code.type]}-subtle`} text={TYPE_VARIANT[code.type]} className="mb-1">
                        {TYPE_OPTS.find((t) => t.value === code.type)?.label}
                      </Badge>
                      <h6 className="mb-0 mt-1">{code.label}</h6>
                      <small className="text-muted font-monospace">{code.slug}</small>
                    </div>
                    <div className="d-flex gap-1">
                      <Button
                        variant={code.isActive ? 'soft-success' : 'soft-secondary'}
                        size="sm"
                        title="Toggle Active"
                        onClick={() => toggleActive(code)}>
                        <Icon icon={code.isActive ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} />
                      </Button>
                      <Button variant="soft-primary" size="sm" title="View QR" onClick={() => setQrPreview(code)}>
                        <Icon icon="solar:qr-code-bold" />
                      </Button>
                      <Button variant="soft-danger" size="sm" title="Delete" onClick={() => handleDelete(code.id, code.label)}>
                        <Icon icon="solar:trash-bin-trash-bold" />
                      </Button>
                    </div>
                  </div>

                  {/* Target */}
                  {code.campaign && (
                    <div className="text-muted small mb-1">
                      <Icon icon="solar:target-bold" className="me-1" />
                      Campaign: {code.campaign.titleEn}
                    </div>
                  )}
                  {code.purpose && (
                    <div className="text-muted small mb-1">
                      <Icon icon="solar:heart-bold" className="me-1" />
                      Purpose: {code.purpose.titleEn}
                    </div>
                  )}
                  {code.sourceTag && (
                    <div className="text-muted small mb-1">
                      <Icon icon="solar:tag-bold" className="me-1" />
                      Source: {code.sourceTag}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="d-flex gap-3 mt-3 pt-3 border-top">
                    <div className="text-center flex-1">
                      <div className="fw-bold">{code.scanCount}</div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>
                        Scans
                      </div>
                    </div>
                    <div className="text-center flex-1">
                      <div className="fw-bold">{code.donationCount}</div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>
                        Donations
                      </div>
                    </div>
                    <div className="text-center flex-1">
                      <div className="fw-bold text-success">৳{Number(code.totalRaised || 0).toLocaleString()}</div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>
                        Raised
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </LoadingOverlay>

      {/* Create Modal */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Form onSubmit={handleCreate}>
          <Modal.Header closeButton>
            <Modal.Title className="h6">Create QR Code</Modal.Title>
          </Modal.Header>
          <Modal.Body className="d-flex flex-column gap-3">
            <Form.Group>
              <Form.Label>
                Label <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                value={form.label ?? ''}
                onChange={(e) => {
                  set('label', e.target.value)
                  set('slug', slugify(e.target.value))
                }}
                placeholder="e.g. Clinic Poster April 2026"
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>
                Slug (tracking key) <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control className="font-monospace" value={form.slug ?? ''} onChange={(e) => set('slug', slugify(e.target.value))} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>
                Type <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select value={form.type ?? 'general'} onChange={(e) => set('type', e.target.value)}>
                {TYPE_OPTS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            {form.type === 'purpose' && (
              <Form.Group>
                <Form.Label>Purpose</Form.Label>
                <Form.Select value={form.purposeId ?? ''} onChange={(e) => set('purposeId', e.target.value)}>
                  <option value="">— Select purpose —</option>
                  {(purposes ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.titleEn}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}
            {form.type === 'campaign' && (
              <Form.Group>
                <Form.Label>Campaign</Form.Label>
                <Form.Select value={form.campaignId ?? ''} onChange={(e) => set('campaignId', e.target.value)}>
                  <option value="">— Select campaign —</option>
                  {(campaigns ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.titleEn}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}
            {form.type === 'source' && (
              <Form.Group>
                <Form.Label>Source Tag</Form.Label>
                <Form.Control
                  value={form.sourceTag ?? ''}
                  onChange={(e) => set('sourceTag', e.target.value)}
                  placeholder="e.g. petfest-2026, dhanmondi-poster"
                />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="outline-secondary" size="sm" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" />
                  Creating…
                </>
              ) : (
                'Create QR Code'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* QR Preview Modal */}
      {qrPreview && (
        <Modal show centered onHide={() => setQrPreview(null)}>
          <Modal.Header closeButton>
            <Modal.Title className="h6">{qrPreview.label}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center py-4">
            <div className="d-inline-block bg-white p-4 rounded border mb-4">
              <QrCodeImage value={qrCodePublicUrl(qrPreview.slug)} size={220} />
            </div>
            <p className="text-muted small font-monospace mb-0">{qrCodePublicUrl(qrPreview.slug)}</p>
            <div className="d-flex gap-3 justify-content-center mt-3 pt-3 border-top">
              <div>
                <div className="fw-bold">{qrPreview.scanCount}</div>
                <div className="text-muted" style={{ fontSize: '11px' }}>
                  Scans
                </div>
              </div>
              <div>
                <div className="fw-bold">{qrPreview.donationCount}</div>
                <div className="text-muted" style={{ fontSize: '11px' }}>
                  Donations
                </div>
              </div>
              <div>
                <div className="fw-bold text-success">৳{Number(qrPreview.totalRaised || 0).toLocaleString()}</div>
                <div className="text-muted" style={{ fontSize: '11px' }}>
                  Raised
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" size="sm" onClick={() => setQrPreview(null)}>
              Close
            </Button>
            <a
              href={`data:image/png;base64,`}
              download={`qr-${qrPreview.slug}.png`}
              className="btn btn-primary btn-sm"
              onClick={() => {
                const canvas = document.querySelector<HTMLCanvasElement>('canvas')
                if (canvas) {
                  const link = document.createElement('a')
                  link.href = canvas.toDataURL()
                  link.download = `bpa-qr-${qrPreview.slug}.png`
                  link.click()
                }
              }}>
              <Icon icon="solar:download-bold" className="me-1" />
              Download PNG
            </a>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  )
}
