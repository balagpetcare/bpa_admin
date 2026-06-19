'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Modal, Form, Badge, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { useApi } from '@/hooks/useApi'
import { contactTypeApi, type ContactType } from '@/lib/api/contact-inquiry.api'
import type { ApiError } from '@/lib/api'

const EMPTY: Partial<ContactType> = { slug: '', labelEn: '', labelBn: '', description: '', isActive: true, sortOrder: 0 }

export default function ContactTypesPage() {
  const fetchFn = useCallback(() => contactTypeApi.list(), [])
  const { data: types, loading, error, refetch } = useApi(fetchFn, [])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<ContactType>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const openCreate = () => { setEditing(EMPTY); setSaveError(''); setModalOpen(true) }
  const openEdit = (t: ContactType) => { setEditing({ ...t }); setSaveError(''); setModalOpen(true) }

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    try {
      if (editing.id) {
        await contactTypeApi.update(editing.id, editing)
      } else {
        await contactTypeApi.create(editing)
      }
      setModalOpen(false)
      refetch()
    } catch (e: any) {
      setSaveError(e.message ?? 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contact type?')) return
    try {
      await contactTypeApi.delete(id)
      refetch()
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Contact Types"
        breadcrumbs={[
          { label: 'Contact Inquiries', href: '/contact-inquiries' },
          { label: 'Contact Types' },
        ]}
        action={
          <Button size="sm" onClick={openCreate}>
            <Icon icon="solar:add-circle-bold" className="me-1" /> Add Type
          </Button>
        }
      />

      <ApiErrorAlert error={error as ApiError | null} />

      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4"><Spinner /></div>
          ) : !types?.length ? (
            <p className="text-muted text-center py-4">No contact types yet. Add one to get started.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Slug</th>
                    <th>Label (EN)</th>
                    <th>Label (BN)</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {types.map((t) => (
                    <tr key={t.id}>
                      <td><code>{t.slug}</code></td>
                      <td>{t.labelEn}</td>
                      <td className="text-muted">{t.labelBn ?? '—'}</td>
                      <td>{t.sortOrder}</td>
                      <td><Badge bg={t.isActive ? 'success' : 'secondary'}>{t.isActive ? 'Active' : 'Inactive'}</Badge></td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button size="sm" variant="outline-primary" onClick={() => openEdit(t)}>
                            <Icon icon="solar:pen-bold" />
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => handleDelete(t.id)}>
                            <Icon icon="solar:trash-bin-minimalistic-bold" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={modalOpen} onHide={() => setModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing.id ? 'Edit' : 'Add'} Contact Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {saveError && <div className="alert alert-danger">{saveError}</div>}
          <Form.Group className="mb-3">
            <Form.Label>Slug <span className="text-danger">*</span></Form.Label>
            <Form.Control
              value={editing.slug ?? ''}
              onChange={(e) => setEditing((d) => ({ ...d, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
              placeholder="e.g. government-ngo"
            />
            <Form.Text>Lowercase letters, numbers, hyphens only</Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Label (English) <span className="text-danger">*</span></Form.Label>
            <Form.Control value={editing.labelEn ?? ''} onChange={(e) => setEditing((d) => ({ ...d, labelEn: e.target.value }))} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Label (Bengali)</Form.Label>
            <Form.Control value={editing.labelBn ?? ''} onChange={(e) => setEditing((d) => ({ ...d, labelBn: e.target.value }))} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={2} value={editing.description ?? ''} onChange={(e) => setEditing((d) => ({ ...d, description: e.target.value }))} />
          </Form.Group>
          <div className="row g-3">
            <div className="col">
              <Form.Group>
                <Form.Label>Sort Order</Form.Label>
                <Form.Control type="number" value={editing.sortOrder ?? 0} onChange={(e) => setEditing((d) => ({ ...d, sortOrder: parseInt(e.target.value) || 0 }))} />
              </Form.Group>
            </div>
            <div className="col d-flex align-items-end pb-1">
              <Form.Check
                type="switch"
                label="Active"
                checked={editing.isActive ?? true}
                onChange={(e) => setEditing((d) => ({ ...d, isActive: e.target.checked }))}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" /> : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
