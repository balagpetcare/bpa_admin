'use client'

import { useState, useCallback } from 'react'
import { Card, Row, Col, Button, Form, Badge, Modal, ProgressBar } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi, useApiMutation } from '@/hooks/useApi'
import {
  listTransparencyReports,
  createTransparencyReport,
  updateTransparencyReport,
  deleteTransparencyReport,
  type TransparencyReport,
} from '@/lib/api/donations.api'
import type { ApiError } from '@/lib/api'

const EMPTY: Partial<TransparencyReport> = {
  reportMonth: '',
  titleEn: '',
  titleBn: '',
  totalReceived: '0',
  totalUsed: '0',
  vaccinationExpense: '0',
  foodExpense: '0',
  treatmentExpense: '0',
  rescueExpense: '0',
  administrationExpense: '0',
  summaryEn: '',
  summaryBn: '',
  pdfUrl: '',
  isPublished: false,
}

export default function TransparencyReportsContent() {
  const [editing, setEditing] = useState<Partial<TransparencyReport> | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const { mutate } = useApiMutation<unknown, unknown>()

  const fn = useCallback(() => listTransparencyReports(), [])
  const { data: reports, loading, error, refetch } = useApi(fn, [])

  function openCreate() {
    setEditing(EMPTY)
    setEditingId(null)
  }
  function openEdit(r: TransparencyReport) {
    setEditing(r)
    setEditingId(r.id)
  }
  function closeModal() {
    setEditing(null)
    setEditingId(null)
  }

  function set<K extends keyof TransparencyReport>(key: K, value: any) {
    setEditing((f) => (f ? { ...f, [key]: value } : f))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    setSaving(true)
    if (editingId) {
      await mutate(() => updateTransparencyReport(editingId, editing), undefined)
    } else {
      await mutate(() => createTransparencyReport(editing), undefined)
    }
    setSaving(false)
    closeModal()
    refetch()
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete report "${title}"?`)) return
    await mutate(() => deleteTransparencyReport(id), undefined)
    refetch()
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Transparency Reports"
        breadcrumbs={[{ label: 'Donations' }, { label: 'Transparency Reports' }]}
        action={
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Icon icon="solar:add-circle-bold" className="me-1" />
            New Report
          </Button>
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />

      <LoadingOverlay loading={loading}>
        <Row className="g-4">
          {(reports ?? []).length === 0 && !loading && (
            <Col xs={12}>
              <Card className="text-center py-5">
                <Card.Body>
                  <Icon icon="solar:eye-bold-duotone" className="text-muted fs-1 mb-3" />
                  <h5 className="text-muted">No reports published yet</h5>
                  <Button variant="primary" size="sm" onClick={openCreate}>
                    Add First Report
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          )}
          {(reports ?? []).map((r: TransparencyReport) => {
            const total = Number(r.totalReceived)
            const used = Number(r.totalUsed)
            const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0
            return (
              <Col key={r.id} xs={12} md={6} xl={4}>
                <Card className="h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <Badge
                          bg={r.isPublished ? 'success-subtle' : 'secondary-subtle'}
                          text={r.isPublished ? 'success' : 'secondary'}
                          className="mb-1">
                          {r.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                        <h6 className="mb-0 mt-1">{r.titleEn}</h6>
                        <small className="text-muted">{r.reportMonth}</small>
                      </div>
                      <div className="d-flex gap-1">
                        <Button variant="soft-primary" size="sm" onClick={() => openEdit(r)}>
                          <Icon icon="solar:pen-bold" />
                        </Button>
                        <Button variant="soft-danger" size="sm" onClick={() => handleDelete(r.id, r.titleEn)}>
                          <Icon icon="solar:trash-bin-trash-bold" />
                        </Button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between text-sm mb-1">
                        <span className="text-muted small">Utilization</span>
                        <span className="fw-bold small text-success">{pct}%</span>
                      </div>
                      <ProgressBar now={pct} style={{ height: 6 }} variant="success" />
                    </div>

                    <div className="d-flex gap-3 border-top pt-3">
                      <div className="text-center flex-1">
                        <div className="fw-bold text-success small">৳{Number(r.totalReceived).toLocaleString()}</div>
                        <div className="text-muted" style={{ fontSize: '10px' }}>
                          Received
                        </div>
                      </div>
                      <div className="text-center flex-1">
                        <div className="fw-bold small">৳{Number(r.totalUsed).toLocaleString()}</div>
                        <div className="text-muted" style={{ fontSize: '10px' }}>
                          Used
                        </div>
                      </div>
                      {r.pdfUrl && (
                        <a
                          href={r.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-soft-primary btn-sm align-self-center"
                          title="Download PDF">
                          <Icon icon="solar:download-bold" />
                        </a>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )
          })}
        </Row>
      </LoadingOverlay>

      {/* Create / Edit Modal */}
      <Modal show={!!editing} onHide={closeModal} size="lg" scrollable>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title className="h6">{editingId ? 'Edit Report' : 'New Transparency Report'}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="d-flex flex-column gap-3">
            {editing && (
              <>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        Report Month (YYYY-MM) <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        value={editing.reportMonth ?? ''}
                        onChange={(e) => set('reportMonth', e.target.value)}
                        placeholder="2026-06"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        Title (English) <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control value={editing.titleEn ?? ''} onChange={(e) => set('titleEn', e.target.value)} required />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group>
                  <Form.Label>Title (Bangla)</Form.Label>
                  <Form.Control value={editing.titleBn ?? ''} onChange={(e) => set('titleBn', e.target.value)} />
                </Form.Group>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        Total Received (BDT) <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min={0}
                        value={editing.totalReceived ?? '0'}
                        onChange={(e) => set('totalReceived', e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        Total Used (BDT) <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min={0}
                        value={editing.totalUsed ?? '0'}
                        onChange={(e) => set('totalUsed', e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <p className="text-muted small mb-0 fw-bold">Breakdown:</p>
                <Row className="g-2">
                  {(['vaccinationExpense', 'foodExpense', 'treatmentExpense', 'rescueExpense', 'administrationExpense'] as const).map((field) => (
                    <Col key={field} md={4}>
                      <Form.Group>
                        <Form.Label className="small text-muted text-capitalize">
                          {field.replace('Expense', '').replace(/([A-Z])/g, ' $1')}
                        </Form.Label>
                        <Form.Control
                          type="number"
                          min={0}
                          value={(editing as any)[field] ?? '0'}
                          onChange={(e) => set(field as any, e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  ))}
                </Row>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Summary (English)</Form.Label>
                      <Form.Control as="textarea" rows={3} value={editing.summaryEn ?? ''} onChange={(e) => set('summaryEn', e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Summary (Bangla)</Form.Label>
                      <Form.Control as="textarea" rows={3} value={editing.summaryBn ?? ''} onChange={(e) => set('summaryBn', e.target.value)} />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group>
                  <Form.Label>PDF URL</Form.Label>
                  <Form.Control type="url" value={editing.pdfUrl ?? ''} onChange={(e) => set('pdfUrl', e.target.value)} placeholder="https://..." />
                </Form.Group>
                <Form.Check
                  type="switch"
                  label="Published (visible on website)"
                  checked={editing.isPublished ?? false}
                  onChange={(e) => set('isPublished', e.target.checked)}
                />
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="outline-secondary" size="sm" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" />
                  Saving…
                </>
              ) : editingId ? (
                'Update Report'
              ) : (
                'Create Report'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}
