'use client'

import { useState } from 'react'
import { Card, Table, Spinner, Button, Modal, Form, Tabs, Tab, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import MediaPickerInput from '@/components/ui/MediaPickerInput'
import { confirmDelete } from '@/components/ui/ConfirmDialog'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import {
  pushNotificationsApi,
  type NotificationTemplate,
  type CreateTemplateDto,
  type NotificationCategory,
  type NotificationPriority,
} from '@/lib/api/push-notifications.api'
import type { MediaFile } from '@/types/bpa.types'
import { isValidDeepLink, DEEP_LINK_EXAMPLES } from '../components/deepLink'

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

const EMPTY: CreateTemplateDto = {
  key: '',
  category: 'campaign',
  title: '',
  titleBn: '',
  body: '',
  bodyBn: '',
  imageUrl: '',
  deepLink: '',
  defaultPriority: 'normal',
  isActive: true,
}

export default function TemplatesPage() {
  const { can } = usePermission()
  const canCreate = can('notification_templates:create')
  const canUpdate = can('notification_templates:update')
  const canDelete = can('notification_templates:delete')

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const { data, loading, error, refetch } = useApi(() => pushNotificationsApi.listTemplates({ page, limit }), [page, limit])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<NotificationTemplate | null>(null)
  const [form, setForm] = useState<CreateTemplateDto>(EMPTY)
  const [imageFileId, setImageFileId] = useState<string | null>(null)
  const [langTab, setLangTab] = useState<'en' | 'bn'>('en')

  const saveMutation = useApiMutation<NotificationTemplate, void>()
  const deleteMutation = useApiMutation<void, string>()

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setImageFileId(null)
    setModalOpen(true)
  }

  const openEdit = (t: NotificationTemplate) => {
    setEditing(t)
    setForm({
      key: t.key,
      category: t.category,
      title: t.title,
      titleBn: t.titleBn ?? '',
      body: t.body,
      bodyBn: t.bodyBn ?? '',
      imageUrl: t.imageUrl ?? '',
      deepLink: t.deepLink ?? '',
      defaultPriority: t.defaultPriority,
      isActive: t.isActive,
    })
    setImageFileId(null)
    setModalOpen(true)
  }

  const handleSave = async () => {
    const dto = { ...form, imageUrl: form.imageUrl || undefined, deepLink: form.deepLink || undefined, titleBn: form.titleBn || undefined, bodyBn: form.bodyBn || undefined }
    const result = editing
      ? await saveMutation.mutate(() => pushNotificationsApi.updateTemplate(editing.id, dto), undefined)
      : await saveMutation.mutate(() => pushNotificationsApi.createTemplate(dto), undefined)
    if (result) {
      setModalOpen(false)
      refetch()
    }
  }

  const handleDelete = async (t: NotificationTemplate) => {
    const ok = await confirmDelete(t.title)
    if (!ok) return
    const result = await deleteMutation.mutate((id) => pushNotificationsApi.deleteTemplate(id), t.id)
    if (result !== null) refetch()
  }

  const deepLinkValid = isValidDeepLink(form.deepLink ?? '')

  return (
    <div>
      <PageHeader
        title="Notification Templates"
        action={
          canCreate ? (
            <Button size="sm" onClick={openCreate}>
              <Icon icon="solar:add-circle-bold-duotone" className="me-1" />
              New Template
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
            <EmptyState title="No templates yet" description="Create reusable notification templates for automation rules and campaigns." />
          ) : (
            <Table hover responsive className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <code className="small">{t.key}</code>
                    </td>
                    <td>{t.title}</td>
                    <td className="text-capitalize">{t.category.replace('_', ' ')}</td>
                    <td className="text-capitalize">{t.defaultPriority}</td>
                    <td>
                      <Badge bg={t.isActive ? 'success' : 'secondary'}>{t.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="text-end">
                      {canUpdate && (
                        <Button size="sm" variant="outline-secondary" className="me-1" onClick={() => openEdit(t)}>
                          Edit
                        </Button>
                      )}
                      {canDelete && (
                        <Button size="sm" variant="outline-danger" onClick={() => handleDelete(t)}>
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
                label="templates"
              />
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={modalOpen} onHide={() => setModalOpen(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Edit Template' : 'New Template'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ApiErrorAlert error={saveMutation.error} />
          <Form.Group className="mb-3">
            <Form.Label>Key</Form.Label>
            <Form.Control value={form.key} onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))} placeholder="e.g. vaccination_reminder" />
          </Form.Group>

          <Tabs activeKey={langTab} onSelect={(k) => setLangTab((k as 'en' | 'bn') ?? 'en')} className="mb-3">
            <Tab eventKey="en" title="English">
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Body</Form.Label>
                <Form.Control as="textarea" rows={3} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
              </Form.Group>
            </Tab>
            <Tab eventKey="bn" title="বাংলা">
              <Form.Group className="mb-3">
                <Form.Label>Title (Bangla)</Form.Label>
                <Form.Control value={form.titleBn ?? ''} onChange={(e) => setForm((f) => ({ ...f, titleBn: e.target.value }))} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Body (Bangla)</Form.Label>
                <Form.Control as="textarea" rows={3} value={form.bodyBn ?? ''} onChange={(e) => setForm((f) => ({ ...f, bodyBn: e.target.value }))} />
              </Form.Group>
            </Tab>
          </Tabs>

          <Form.Group className="mb-3">
            <MediaPickerInput
              label="Image (optional)"
              value={imageFileId}
              previewUrl={form.imageUrl || null}
              onChange={(fileId, file: MediaFile | null) => {
                setImageFileId(fileId)
                setForm((f) => ({ ...f, imageUrl: file?.url ?? '' }))
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Deep Link (optional)</Form.Label>
            <Form.Control
              value={form.deepLink ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, deepLink: e.target.value }))}
              isInvalid={!!form.deepLink && !deepLinkValid}
              placeholder="bpa://campaigns/{id}"
            />
            <Form.Control.Feedback type="invalid">Must match a supported pattern, e.g. {DEEP_LINK_EXAMPLES[2]}</Form.Control.Feedback>
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
              <Form.Label>Default Priority</Form.Label>
              <Form.Select
                value={form.defaultPriority}
                onChange={(e) => setForm((f) => ({ ...f, defaultPriority: e.target.value as NotificationPriority }))}>
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
            id="template-active"
            label="Active"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={saveMutation.loading || !form.key || !form.title || !form.body || (!!form.deepLink && !deepLinkValid)}
            onClick={handleSave}>
            {saveMutation.loading ? <Spinner size="sm" /> : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
