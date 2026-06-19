'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Modal, Form, Badge, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { useApi } from '@/hooks/useApi'
import { contactDepartmentApi, type ContactDepartment } from '@/lib/api/contact-inquiry.api'
import type { ApiError } from '@/lib/api'

const EMPTY: Partial<ContactDepartment> = {
  slug: '', nameEn: '', nameBn: '', description: '', contactEmail: '', isActive: true, sortOrder: 0,
}

export default function ContactDepartmentsPage() {
  const fetchFn = useCallback(() => contactDepartmentApi.list(), [])
  const { data: departments, loading, error, refetch } = useApi(fetchFn, [])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<ContactDepartment>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const openCreate = () => { setEditing(EMPTY); setSaveError(''); setModalOpen(true) }
  const openEdit = (d: ContactDepartment) => { setEditing({ ...d }); setSaveError(''); setModalOpen(true) }

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    try {
      if (editing.id) {
        await contactDepartmentApi.update(editing.id, editing)
      } else {
        await contactDepartmentApi.create(editing)
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
    if (!confirm('Delete this department?')) return
    try {
      await contactDepartmentApi.delete(id)
      refetch()
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Contact Departments"
        breadcrumbs={[
          { label: 'Contact Inquiries', href: '/contact-inquiries' },
          { label: 'Departments' },
        ]}
        action={
          <Button size="sm" onClick={openCreate}>
            <Icon icon="solar:add-circle-bold" className="me-1" /> Add Department
          </Button>
        }
      />

      <ApiErrorAlert error={error as ApiError | null} />

      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4"><Spinner /></div>
          ) : !departments?.length ? (
            <p className="text-muted text-center py-4">No departments yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Slug</th>
                    <th>Name</th>
                    <th>Contact Email</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((d) => (
                    <tr key={d.id}>
                      <td><code>{d.slug}</code></td>
                      <td>
                        <div>{d.nameEn}</div>
                        {d.nameBn && <small className="text-muted">{d.nameBn}</small>}
                      </td>
                      <td className="text-muted small">{d.contactEmail ?? '—'}</td>
                      <td>{d.sortOrder}</td>
                      <td><Badge bg={d.isActive ? 'success' : 'secondary'}>{d.isActive ? 'Active' : 'Inactive'}</Badge></td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button size="sm" variant="outline-primary" onClick={() => openEdit(d)}>
                            <Icon icon="solar:pen-bold" />
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => handleDelete(d.id)}>
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
          <Modal.Title>{editing.id ? 'Edit' : 'Add'} Department</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {saveError && <div className="alert alert-danger">{saveError}</div>}
          <Form.Group className="mb-3">
            <Form.Label>Slug <span className="text-danger">*</span></Form.Label>
            <Form.Control
              value={editing.slug ?? ''}
              onChange={(e) => setEditing((d) => ({ ...d, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
              placeholder="e.g. welfare-team"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Name (English) <span className="text-danger">*</span></Form.Label>
            <Form.Control value={editing.nameEn ?? ''} onChange={(e) => setEditing((d) => ({ ...d, nameEn: e.target.value }))} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Name (Bengali)</Form.Label>
            <Form.Control value={editing.nameBn ?? ''} onChange={(e) => setEditing((d) => ({ ...d, nameBn: e.target.value }))} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Department Email</Form.Label>
            <Form.Control type="email" value={editing.contactEmail ?? ''} onChange={(e) => setEditing((d) => ({ ...d, contactEmail: e.target.value }))} placeholder="dept@bpa.org.bd" />
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
              <Form.Check type="switch" label="Active" checked={editing.isActive ?? true} onChange={(e) => setEditing((d) => ({ ...d, isActive: e.target.checked }))} />
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
