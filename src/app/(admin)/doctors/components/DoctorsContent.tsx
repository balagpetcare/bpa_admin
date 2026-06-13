'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Modal, Form, InputGroup, Row, Col } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { doctorsApi } from '@/lib/api/doctors.api'
import type { ApiError } from '@/lib/api'
import type { Doctor } from '@/types/bpa.types'

const EMPTY_FORM = { name: '', email: '', phone: '', licenseNumber: '', specialization: '', bio: '' }

export default function DoctorsContent() {
  const { can } = usePermission()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Doctor | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const { mutate, loading: saving } = useApiMutation<unknown, unknown>()

  const fetchFn = useCallback(() => doctorsApi.list({ page, limit: 20, search: search || undefined }), [page, search])
  const { data, loading, error, refetch } = useApi(fetchFn, [page, search])
  const doctors = data?.data ?? []
  const meta = data?.meta ?? null

  function openCreate() {
    setEditing(null); setForm(EMPTY_FORM); setShowModal(true)
  }
  function openEdit(d: Doctor) {
    setEditing(d)
    setForm({ name: d.name, email: d.email ?? '', phone: d.phone ?? '', licenseNumber: d.licenseNumber ?? '', specialization: d.specialization ?? '', bio: d.bio ?? '' })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    const dto = { name: form.name, email: form.email || undefined, phone: form.phone || undefined, licenseNumber: form.licenseNumber || undefined, specialization: form.specialization || undefined, bio: form.bio || undefined }
    if (editing) {
      await mutate(() => doctorsApi.update(editing.id, dto), undefined)
    } else {
      await mutate(() => doctorsApi.create(dto), undefined)
    }
    setShowModal(false); refetch()
  }

  async function handleDelete(id: string) {
    if (!confirm('Deactivate this doctor?')) return
    await mutate(() => doctorsApi.remove(id), undefined)
    refetch()
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Doctors"
        breadcrumbs={[{ label: 'Campaign Mgmt' }, { label: 'Doctors' }]}
        action={
          can('doctors:create') ? (
            <Button variant="primary" onClick={openCreate}>
              <Icon icon="solar:add-circle-bold" className="me-1" />New Doctor
            </Button>
          ) : undefined
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <Row className="g-2 mb-3">
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text><Icon icon="solar:magnifer-bold" /></InputGroup.Text>
                <Form.Control
                  placeholder="Search doctors..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                />
              </InputGroup>
            </Col>
          </Row>
          <LoadingOverlay loading={loading}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Doctor</th>
                  <th>License</th>
                  <th>Specialization</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4 text-muted">No doctors found</td></tr>
                ) : (
                  doctors.map((d: Doctor) => (
                    <tr key={d.id}>
                      <td>
                        <div className="fw-semibold">{d.name}</div>
                        <div className="text-muted small">{d.email ?? '—'}</div>
                      </td>
                      <td>{d.licenseNumber ?? <span className="text-muted">—</span>}</td>
                      <td>{d.specialization ?? <span className="text-muted">—</span>}</td>
                      <td>
                        <span className={`badge bg-${d.isActive ? 'success' : 'secondary'}-subtle text-${d.isActive ? 'success' : 'secondary'}`}>
                          {d.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-end">
                        {can('doctors:update') && (
                          <Button variant="soft-primary" size="sm" className="me-1" onClick={() => openEdit(d)}>
                            <Icon icon="solar:pen-bold" />
                          </Button>
                        )}
                        {can('doctors:delete') && (
                          <Button variant="soft-danger" size="sm" onClick={() => handleDelete(d.id)}>
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
          {meta && meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">{meta.total} doctors · Page {meta.page} of {meta.totalPages}</small>
              <div className="d-flex gap-1">
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasPrev} onClick={() => setPage(p => p - 1)}>‹</Button>
                <Button size="sm" variant="outline-secondary" disabled={!meta.hasNext} onClick={() => setPage(p => p + 1)}>›</Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Edit' : 'Add'} Doctor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {(['name', 'email', 'phone', 'licenseNumber', 'specialization'] as const).map((field) => (
              <Form.Group className="mb-3" key={field}>
                <Form.Label className="text-capitalize">{field.replace(/([A-Z])/g, ' $1')}</Form.Label>
                <Form.Control
                  value={form[field]}
                  onChange={(e) => setForm(f => ({ ...f, [field]: e.target.value }))}
                  required={field === 'name'}
                />
              </Form.Group>
            ))}
            <Form.Group className="mb-3">
              <Form.Label>Bio</Form.Label>
              <Form.Control as="textarea" rows={3} value={form.bio} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Create'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
