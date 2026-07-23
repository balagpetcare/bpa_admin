'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Modal, Form, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { campaignsApi } from '@/lib/api/campaigns.api'
import type { ApiError } from '@/lib/api'
import type { CampaignFaq } from '@/types/bpa.types'

const EMPTY_FORM = {
  questionEn: '',
  questionBn: '',
  answerEn: '',
  answerBn: '',
  category: '',
  sortOrder: '0',
  isActive: true,
}

export default function FaqsManager({ campaignId }: { campaignId: string }) {
  const { can } = usePermission()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<CampaignFaq | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const { mutate, loading: saving } = useApiMutation<unknown, unknown>()

  const faqsFn = useCallback(() => campaignsApi.listCampaignFaqs(campaignId), [campaignId])
  const { data: faqs, loading, error, refetch } = useApi(faqsFn, [campaignId])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }
  function openEdit(f: CampaignFaq) {
    setEditing(f)
    setForm({
      questionEn: f.questionEn,
      questionBn: f.questionBn ?? '',
      answerEn: f.answerEn,
      answerBn: f.answerBn ?? '',
      category: f.category ?? '',
      sortOrder: String(f.sortOrder),
      isActive: f.isActive,
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.questionEn.trim() || !form.answerEn.trim()) return
    const dto = {
      questionEn: form.questionEn,
      questionBn: form.questionBn || null,
      answerEn: form.answerEn,
      answerBn: form.answerBn || null,
      category: form.category || null,
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
    }
    if (editing) {
      await mutate(() => campaignsApi.updateCampaignFaq(campaignId, editing.id, dto), undefined)
    } else {
      await mutate(() => campaignsApi.createCampaignFaq(campaignId, dto), undefined)
    }
    setShowModal(false)
    refetch()
  }

  async function handleToggleActive(f: CampaignFaq) {
    await mutate(() => campaignsApi.updateCampaignFaq(campaignId, f.id, { isActive: !f.isActive }), undefined)
    refetch()
  }

  async function handleDelete(faqId: string) {
    if (!confirm('Delete this FAQ?')) return
    await mutate(() => campaignsApi.deleteCampaignFaq(campaignId, faqId), undefined)
    refetch()
  }

  async function handleMoveUp(index: number) {
    const list = faqs ?? []
    if (index === 0) return
    const ids = list.map((f) => f.id)
    ;[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]]
    await mutate(() => campaignsApi.reorderCampaignFaqs(campaignId, ids), undefined)
    refetch()
  }

  async function handleMoveDown(index: number) {
    const list = faqs ?? []
    if (index === list.length - 1) return
    const ids = list.map((f) => f.id)
    ;[ids[index], ids[index + 1]] = [ids[index + 1], ids[index]]
    await mutate(() => campaignsApi.reorderCampaignFaqs(campaignId, ids), undefined)
    refetch()
  }

  const faqList: CampaignFaq[] = faqs ?? []

  return (
    <div className="container-fluid">
      <PageHeader
        title="Campaign FAQs"
        breadcrumbs={[{ label: 'Campaigns', href: '/campaigns' }, { label: 'Detail', href: `/campaigns/${campaignId}` }, { label: 'FAQs' }]}
        action={
          can('campaign_faqs:create') ? (
            <Button variant="primary" onClick={openCreate}>
              <Icon icon="solar:add-circle-bold" className="me-1" />
              Add FAQ
            </Button>
          ) : undefined
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />

      <Card>
        <Card.Body className="p-0">
          <LoadingOverlay loading={loading}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 60 }}>Order</th>
                  <th>Question (EN)</th>
                  <th>Question (BN)</th>
                  <th>Category</th>
                  <th style={{ width: 100 }}>Status</th>
                  <th style={{ width: 160 }} className="text-end">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {faqList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      No FAQs yet. Click &ldquo;Add FAQ&rdquo; to create one.
                    </td>
                  </tr>
                ) : (
                  faqList.map((f: CampaignFaq, i: number) => (
                    <tr key={f.id}>
                      <td>
                        <div className="d-flex flex-column align-items-center gap-1">
                          <Button variant="link" size="sm" className="p-0 text-muted" disabled={i === 0} onClick={() => handleMoveUp(i)}>
                            <Icon icon="solar:arrow-up-bold" width={14} />
                          </Button>
                          <span className="small fw-medium">{f.sortOrder}</span>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-muted"
                            disabled={i === faqList.length - 1}
                            onClick={() => handleMoveDown(i)}>
                            <Icon icon="solar:arrow-down-bold" width={14} />
                          </Button>
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold">{f.questionEn}</div>
                        <div className="text-muted small text-truncate" style={{ maxWidth: 300 }}>
                          {f.answerEn}
                        </div>
                      </td>
                      <td>
                        {f.questionBn ? (
                          <>
                            <div className="fw-semibold">{f.questionBn}</div>
                            <div className="text-muted small text-truncate" style={{ maxWidth: 300 }}>
                              {f.answerBn}
                            </div>
                          </>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>
                        {f.category ? (
                          <Badge bg="light" text="dark" className="border">
                            {f.category}
                          </Badge>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>
                        <Form.Check
                          type="switch"
                          checked={f.isActive}
                          onChange={() => handleToggleActive(f)}
                          disabled={!can('campaign_faqs:update')}
                        />
                      </td>
                      <td className="text-end">
                        {can('campaign_faqs:update') && (
                          <Button variant="soft-primary" size="sm" className="me-1" onClick={() => openEdit(f)}>
                            <Icon icon="solar:pen-bold" />
                          </Button>
                        )}
                        {can('campaign_faqs:delete') && (
                          <Button variant="soft-danger" size="sm" onClick={() => handleDelete(f.id)}>
                            <Icon icon="solar:trash-bin-trash-bold" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </LoadingOverlay>
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Edit' : 'Add'} FAQ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Question (English) <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control value={form.questionEn} onChange={(e) => setForm((f) => ({ ...f, questionEn: e.target.value }))} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Question (Bangla)</Form.Label>
              <Form.Control value={form.questionBn} onChange={(e) => setForm((f) => ({ ...f, questionBn: e.target.value }))} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Answer (English) <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.answerEn}
                onChange={(e) => setForm((f) => ({ ...f, answerEn: e.target.value }))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Answer (Bangla)</Form.Label>
              <Form.Control as="textarea" rows={3} value={form.answerBn} onChange={(e) => setForm((f) => ({ ...f, answerBn: e.target.value }))} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Registration, Vaccination, Certificate"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Sort Order</Form.Label>
              <Form.Control type="number" min="0" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} />
            </Form.Group>
            <Form.Check
              type="switch"
              id="faq-active"
              label="Active"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
