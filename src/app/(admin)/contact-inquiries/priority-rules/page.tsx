'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, Button, Modal, Form, Badge, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { useApi } from '@/hooks/useApi'
import {
  priorityRuleApi,
  contactTypeApi,
  inquiryCategoryApi,
  contactDepartmentApi,
  type ContactPriorityRule,
  type ContactType,
  type InquiryCategory,
  type ContactDepartment,
  type InquiryPriority,
} from '@/lib/api/contact-inquiry.api'
import type { ApiError } from '@/lib/api'

const EMPTY: Partial<ContactPriorityRule> = {
  contactTypeSlug: '',
  categorySlug: '',
  priority: 'normal',
  departmentId: undefined,
  isActive: true,
  sortOrder: 0,
}

const PRIORITY_VARIANT: Record<InquiryPriority, string> = {
  normal: 'secondary',
  high: 'warning',
  urgent: 'danger',
}

export default function PriorityRulesPage() {
  const fetchFn = useCallback(() => priorityRuleApi.list(), [])
  const { data: rules, loading, error, refetch } = useApi(fetchFn, [])

  const [types, setTypes] = useState<ContactType[]>([])
  const [categories, setCategories] = useState<InquiryCategory[]>([])
  const [departments, setDepartments] = useState<ContactDepartment[]>([])

  useEffect(() => {
    contactTypeApi
      .list()
      .then(setTypes)
      .catch(() => null)
    inquiryCategoryApi
      .list()
      .then(setCategories)
      .catch(() => null)
    contactDepartmentApi
      .list()
      .then(setDepartments)
      .catch(() => null)
  }, [])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<ContactPriorityRule>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const openCreate = () => {
    setEditing(EMPTY)
    setSaveError('')
    setModalOpen(true)
  }
  const openEdit = (r: ContactPriorityRule) => {
    setEditing({ ...r, departmentId: r.departmentId ?? undefined })
    setSaveError('')
    setModalOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    try {
      const payload: Partial<ContactPriorityRule> = {
        contactTypeSlug: editing.contactTypeSlug || undefined,
        categorySlug: editing.categorySlug || undefined,
        priority: editing.priority!,
        departmentId: editing.departmentId || undefined,
        isActive: editing.isActive ?? true,
        sortOrder: editing.sortOrder ?? 0,
      }
      if (editing.id) {
        await priorityRuleApi.update(editing.id, payload)
      } else {
        await priorityRuleApi.create(payload)
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
    if (!confirm('Delete this rule?')) return
    try {
      await priorityRuleApi.delete(id)
      refetch()
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Priority Rules"
        breadcrumbs={[{ label: 'Contact Inquiries', href: '/contact-inquiries' }, { label: 'Priority Rules' }]}
        action={
          <Button size="sm" onClick={openCreate}>
            <Icon icon="solar:add-circle-bold" className="me-1" /> Add Rule
          </Button>
        }
      />

      <ApiErrorAlert error={error as ApiError | null} />

      <p className="text-muted small mb-3">
        Rules auto-assign priority and department when a new inquiry matches a contact type or category slug. More specific rules (type + category)
        take precedence over less specific ones.
      </p>

      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner />
            </div>
          ) : !rules?.length ? (
            <p className="text-muted text-center py-4">No priority rules yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Contact Type Slug</th>
                    <th>Category Slug</th>
                    <th>Priority</th>
                    <th>Auto-assign Department</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <code className="text-muted">{r.contactTypeSlug ?? '(any)'}</code>
                      </td>
                      <td>
                        <code className="text-muted">{r.categorySlug ?? '(any)'}</code>
                      </td>
                      <td>
                        <Badge bg={PRIORITY_VARIANT[r.priority]}>{r.priority.charAt(0).toUpperCase() + r.priority.slice(1)}</Badge>
                      </td>
                      <td className="text-muted small">{r.department?.nameEn ?? '—'}</td>
                      <td>
                        <Badge bg={r.isActive ? 'success' : 'secondary'}>{r.isActive ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button size="sm" variant="outline-primary" onClick={() => openEdit(r)}>
                            <Icon icon="solar:pen-bold" />
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => handleDelete(r.id)}>
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
          <Modal.Title>{editing.id ? 'Edit' : 'Add'} Priority Rule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {saveError && <div className="alert alert-danger">{saveError}</div>}
          <Form.Group className="mb-3">
            <Form.Label>Contact Type Slug (leave blank to match all types)</Form.Label>
            {types.length > 0 ? (
              <Form.Select value={editing.contactTypeSlug ?? ''} onChange={(e) => setEditing((d) => ({ ...d, contactTypeSlug: e.target.value }))}>
                <option value="">(any contact type)</option>
                {types.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.labelEn} ({t.slug})
                  </option>
                ))}
              </Form.Select>
            ) : (
              <Form.Control
                value={editing.contactTypeSlug ?? ''}
                onChange={(e) => setEditing((d) => ({ ...d, contactTypeSlug: e.target.value }))}
                placeholder="e.g. government-ngo"
              />
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Category Slug (leave blank to match all categories)</Form.Label>
            {categories.length > 0 ? (
              <Form.Select value={editing.categorySlug ?? ''} onChange={(e) => setEditing((d) => ({ ...d, categorySlug: e.target.value }))}>
                <option value="">(any category)</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.labelEn} ({c.slug})
                  </option>
                ))}
              </Form.Select>
            ) : (
              <Form.Control
                value={editing.categorySlug ?? ''}
                onChange={(e) => setEditing((d) => ({ ...d, categorySlug: e.target.value }))}
                placeholder="e.g. animal-rescue"
              />
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              Assign Priority <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={editing.priority ?? 'normal'}
              onChange={(e) => setEditing((d) => ({ ...d, priority: e.target.value as InquiryPriority }))}>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Auto-assign Department</Form.Label>
            <Form.Select
              value={editing.departmentId ?? ''}
              onChange={(e) => setEditing((d) => ({ ...d, departmentId: e.target.value || undefined }))}>
              <option value="">(no auto-assign)</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameEn}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <div className="row g-3">
            <div className="col">
              <Form.Group>
                <Form.Label>Sort Order</Form.Label>
                <Form.Control
                  type="number"
                  value={editing.sortOrder ?? 0}
                  onChange={(e) => setEditing((d) => ({ ...d, sortOrder: parseInt(e.target.value) || 0 }))}
                />
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
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" /> : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
