'use client'

import { useState } from 'react'
import { Card, Table, Spinner, Button, Modal, Form, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import { confirmDelete } from '@/components/ui/ConfirmDialog'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import {
  pushNotificationsApi,
  type AutomationRule,
  type CreateAutomationRuleDto,
  type NotificationCategory,
  type NotificationPriority,
} from '@/lib/api/push-notifications.api'

const CATEGORIES: NotificationCategory[] = [
  'pet_health',
  'campaign',
  'video',
  'post',
  'membership',
  'booking',
  'payment',
  'certificate',
  'account',
  'emergency',
  'promotional',
]
const PRIORITIES: NotificationPriority[] = ['low', 'normal', 'high', 'critical']

const EMPTY: CreateAutomationRuleDto = {
  name: '',
  triggerType: 'domain_event',
  eventType: '',
  offsetDays: undefined,
  templateId: '',
  category: 'pet_health',
  priority: 'normal',
  isActive: true,
}

export default function AutomatedRulesPage() {
  const { can } = usePermission()
  const canCreate = can('notification_automation_rules:create')
  const canUpdate = can('notification_automation_rules:update')
  const canDelete = can('notification_automation_rules:delete')

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const { data, loading, error, refetch } = useApi(() => pushNotificationsApi.listAutomationRules({ page, limit }), [page, limit])
  const { data: templatesData } = useApi(() => pushNotificationsApi.listTemplates({ limit: 100 }), [])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AutomationRule | null>(null)
  const [form, setForm] = useState<CreateAutomationRuleDto>(EMPTY)

  const saveMutation = useApiMutation<AutomationRule, void>()
  const deleteMutation = useApiMutation<void, string>()

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setModalOpen(true)
  }

  const openEdit = (r: AutomationRule) => {
    setEditing(r)
    setForm({
      name: r.name,
      triggerType: r.triggerType,
      eventType: r.eventType ?? '',
      offsetDays: r.offsetDays ?? undefined,
      templateId: r.templateId,
      category: r.category,
      priority: r.priority,
      isActive: r.isActive,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    const dto = { ...form, eventType: form.eventType || undefined }
    const result = editing
      ? await saveMutation.mutate(() => pushNotificationsApi.updateAutomationRule(editing.id, dto), undefined)
      : await saveMutation.mutate(() => pushNotificationsApi.createAutomationRule(dto), undefined)
    if (result) {
      setModalOpen(false)
      refetch()
    }
  }

  const handleDelete = async (r: AutomationRule) => {
    const ok = await confirmDelete(r.name)
    if (!ok) return
    const result = await deleteMutation.mutate((id) => pushNotificationsApi.deleteAutomationRule(id), r.id)
    if (result !== null) refetch()
  }

  return (
    <div>
      <PageHeader
        title="Automated Notification Rules"
        action={
          canCreate ? (
            <Button size="sm" onClick={openCreate}>
              <Icon icon="solar:add-circle-bold-duotone" className="me-1" />
              New Rule
            </Button>
          ) : undefined
        }
      />
      <ApiErrorAlert error={error ?? deleteMutation.error} />
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner />
            </div>
          ) : !data || data.data.length === 0 ? (
            <EmptyState title="No automation rules" description="Automation rules trigger notifications from domain events or pet reminder schedules." />
          ) : (
            <Table hover responsive className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Trigger</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td className="small">
                      {r.triggerType === 'domain_event' ? `Event: ${r.eventType ?? '—'}` : `Pet reminder, offset ${r.offsetDays ?? 0}d`}
                    </td>
                    <td className="text-capitalize">{r.category.replace('_', ' ')}</td>
                    <td className="text-capitalize">{r.priority}</td>
                    <td>
                      <Badge bg={r.isActive ? 'success' : 'secondary'}>{r.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="text-end">
                      {canUpdate && (
                        <Button size="sm" variant="outline-secondary" className="me-1" onClick={() => openEdit(r)}>
                          Edit
                        </Button>
                      )}
                      {canDelete && (
                        <Button size="sm" variant="outline-danger" onClick={() => handleDelete(r)}>
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          {data && (
            <div className="px-3 pb-3">
              <Pagination
                page={data.meta.page}
                limit={data.meta.limit}
                total={data.meta.total}
                totalPages={data.meta.totalPages}
                hasPrev={data.meta.hasPrev}
                hasNext={data.meta.hasNext}
                onPageChange={setPage}
                onLimitChange={setLimit}
                label="rules"
              />
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={modalOpen} onHide={() => setModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Edit Rule' : 'New Automation Rule'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ApiErrorAlert error={saveMutation.error} />
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Rabies booster due in 7 days" />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Trigger Type</Form.Label>
            <Form.Select value={form.triggerType} onChange={(e) => setForm((f) => ({ ...f, triggerType: e.target.value as 'domain_event' | 'pet_reminder_schedule' }))}>
              <option value="domain_event">Domain Event</option>
              <option value="pet_reminder_schedule">Pet Reminder Schedule</option>
            </Form.Select>
          </Form.Group>

          {form.triggerType === 'domain_event' ? (
            <Form.Group className="mb-3">
              <Form.Label>Event Type</Form.Label>
              <Form.Control
                value={form.eventType}
                onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value }))}
                placeholder="e.g. campaign.registration.confirmed"
              />
            </Form.Group>
          ) : (
            <Form.Group className="mb-3">
              <Form.Label>Offset Days (before/after due date)</Form.Label>
              <Form.Control
                type="number"
                value={form.offsetDays ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, offsetDays: e.target.value === '' ? undefined : Number(e.target.value) }))}
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Template</Form.Label>
            <Form.Select value={form.templateId} onChange={(e) => setForm((f) => ({ ...f, templateId: e.target.value }))}>
              <option value="">Select a template</option>
              {(templatesData?.data ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.key})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <div className="row g-3">
            <div className="col-md-6">
              <Form.Label>Category</Form.Label>
              <Form.Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as NotificationCategory }))}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace('_', ' ')}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-6">
              <Form.Label>Priority</Form.Label>
              <Form.Select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as NotificationPriority }))}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>

          <Form.Check
            className="mt-3"
            type="switch"
            id="rule-active"
            label="Active"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" disabled={saveMutation.loading || !form.name || !form.templateId} onClick={handleSave}>
            {saveMutation.loading ? <Spinner size="sm" /> : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
