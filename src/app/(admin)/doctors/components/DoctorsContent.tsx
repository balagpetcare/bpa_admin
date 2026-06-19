'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Modal, Form, InputGroup, Row, Col, Alert } from 'react-bootstrap'
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
  const [isActiveFilter, setIsActiveFilter] = useState<'true' | 'false' | 'all'>('true')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Doctor | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const { mutate, loading: saving, error: mutationError, clearError } = useApiMutation<unknown, unknown>()

  const fetchFn = useCallback(() => doctorsApi.list({
    page,
    limit: 20,
    search: search || undefined,
    isActive: isActiveFilter
  }), [page, search, isActiveFilter])
  
  const { data, loading, error, refetch } = useApi(fetchFn, [page, search, isActiveFilter])
  
  // Defensive normalize function to get Doctor[] from any response shape
  const doctors: Doctor[] = (() => {
    let items: any[] = []
    if (!data) items = []
    else if (Array.isArray(data)) items = data
    else if (data.data) {
      if (Array.isArray(data.data)) items = data.data
      else if (Array.isArray((data.data as any).items)) items = (data.data as any).items
    }
    else if (Array.isArray((data as any).items)) items = (data as any).items

    return items.map((d: any) => {
      // Map licenseNo alias to licenseNumber if needed
      const licenseNumber = d.licenseNumber || d.licenseNo
      return {
        ...d,
        licenseNumber
      } as Doctor
    })
  })()

  const meta = (() => {
    if (!data) return null
    if ((data as any).meta) return (data as any).meta
    if (data.data && (data.data as any).meta) return (data.data as any).meta
    return null
  })()

  function openCreate() {
    setEditing(null); setForm(EMPTY_FORM); setSuccessMsg(null); clearError(); setShowModal(true)
  }
  function openEdit(d: Doctor) {
    setEditing(d)
    setForm({ name: d.name, email: d.email ?? '', phone: d.phone ?? '', licenseNumber: d.licenseNumber ?? '', specialization: d.specialization ?? '', bio: d.bio ?? '' })
    setSuccessMsg(null); clearError(); setShowModal(true)
  }

  async function handleSave() {
    setSuccessMsg(null)
    clearError()

    // Client-side validation
    if (!form.name.trim()) return
    if (!form.licenseNumber.trim()) {
      setForm(f => ({ ...f, licenseNumber: '' })) // ensure field is empty for the UI
      return
    }

    // Always send licenseNumber. Do NOT coerce empty string → undefined.
    const dto: {
      name: string; email?: string; phone?: string; licenseNumber: string;
      specialization?: string; bio?: string;
    } = {
      name: form.name,
      licenseNumber: form.licenseNumber,
      ...(form.email ? { email: form.email } : {}),
      ...(form.phone ? { phone: form.phone } : {}),
      ...(form.specialization ? { specialization: form.specialization } : {}),
      ...(form.bio ? { bio: form.bio } : {}),
    }

    let result: unknown
    if (editing) {
      result = await mutate(() => doctorsApi.update(editing.id, dto), undefined)
    } else {
      result = await mutate(() => doctorsApi.create(dto), undefined)
    }

    // Only close + refetch on success (mutate returns null on error)
    if (result) {
      setShowModal(false)
      setSuccessMsg(editing ? 'Doctor updated successfully.' : 'Doctor created successfully.')
      refetch()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deactivate this doctor?')) return
    clearError()
    const result = await mutate(() => doctorsApi.remove(id), undefined)
    if (result) {
      setSuccessMsg('Doctor deactivated.')
      refetch()
    }
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
      {successMsg && (
        <Alert variant="success" dismissible onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}
      <ApiErrorAlert error={error as ApiError | null} />
      
      {/* Duplicate license conflict helper when list is empty */}
      {mutationError && (mutationError.status === 409 || mutationError.code === 'CONFLICT') && doctors.length === 0 && (
        <Alert variant="warning" dismissible>
          A doctor with this license already exists. Try clearing filters or showing inactive doctors.
        </Alert>
      )}

      <Card>
        <Card.Body>
          <Row className="g-2 mb-3 align-items-center">
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
            <Col md={3}>
              <Form.Select
                value={isActiveFilter}
                onChange={(e) => { setIsActiveFilter(e.target.value as 'true' | 'false' | 'all'); setPage(1) }}
              >
                <option value="true">Active Doctors</option>
                <option value="false">Inactive Doctors</option>
                <option value="all">All Doctors</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" className="w-100 d-flex align-items-center justify-content-center gap-1" onClick={() => refetch()}>
                <Icon icon="solar:restart-bold" /> Refresh
              </Button>
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
                {error ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-danger">
                      Failed to load doctors: {error.message || 'Unknown error'}
                    </td>
                  </tr>
                ) : doctors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted">
                      No doctors found
                    </td>
                  </tr>
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

      <Modal show={showModal} onHide={() => { clearError(); setShowModal(false) }}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Edit' : 'Add'} Doctor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Show mutation errors (validation failures) inside the modal */}
          <ApiErrorAlert error={mutationError as ApiError | null} onDismiss={clearError} />

          <Form>
            {(['name', 'email', 'phone', 'licenseNumber', 'specialization'] as const).map((field) => (
              <Form.Group className="mb-3" key={field}>
                <Form.Label className="text-capitalize">
                  {field.replace(/([A-Z])/g, ' $1')}
                  {field === 'name' || field === 'licenseNumber' ? <span className="text-danger ms-1">*</span> : null}
                </Form.Label>
                <Form.Control
                  value={form[field]}
                  onChange={(e) => setForm(f => ({ ...f, [field]: e.target.value }))}
                  required={field === 'name' || field === 'licenseNumber'}
                  isInvalid={field === 'licenseNumber' && !form.licenseNumber.trim()}
                />
                {field === 'licenseNumber' && !form.licenseNumber.trim() && (
                  <Form.Control.Feedback type="invalid">
                    License number is required
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            ))}
            <Form.Group className="mb-3">
              <Form.Label>Bio</Form.Label>
              <Form.Control as="textarea" rows={3} value={form.bio} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { clearError(); setShowModal(false) }}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || !form.name.trim() || !form.licenseNumber.trim()}>
            {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
