'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Modal, Form } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { campaignsApi } from '@/lib/api/campaigns.api'
import { vaccineCatalogApi } from '@/lib/api/vaccine-catalog.api'
import type { ApiError } from '@/lib/api'
import type { CampaignService, VaccineCatalog } from '@/types/bpa.types'

const EMPTY = { name: '', description: '', priceOverrideBdt: '', sortOrder: '0', vaccineCatalogId: '' }

export default function ServicesManager({ campaignId }: { campaignId: string }) {
  const { can } = usePermission()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<CampaignService | null>(null)
  const [form, setForm] = useState(EMPTY)
  const { mutate, loading: saving } = useApiMutation<unknown, unknown>()

  const servicesFn = useCallback(() => campaignsApi.listServices(campaignId), [campaignId])
  const vaccinesFn = useCallback(() => vaccineCatalogApi.list({ limit: 100 }), [])
  const { data: services, loading, error, refetch } = useApi(servicesFn, [campaignId])
  const { data: vaccinesData } = useApi(vaccinesFn, [])

  function openCreate() { setEditing(null); setForm(EMPTY); setShowModal(true) }
  function openEdit(s: CampaignService) {
    setEditing(s)
    setForm({ name: s.name, description: s.description ?? '', priceOverrideBdt: s.priceOverrideBdt ?? '', sortOrder: String(s.sortOrder), vaccineCatalogId: s.vaccineCatalogId ?? '' })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    const dto = { name: form.name, description: form.description || undefined, priceOverrideBdt: form.priceOverrideBdt ? Number(form.priceOverrideBdt) : undefined, sortOrder: Number(form.sortOrder), vaccineCatalogId: form.vaccineCatalogId || undefined }
    if (editing) { await mutate(() => campaignsApi.updateService(campaignId, editing.id, dto), undefined) }
    else { await mutate(() => campaignsApi.createService(campaignId, dto), undefined) }
    setShowModal(false); refetch()
  }

  async function handleDelete(serviceId: string) {
    if (!confirm('Delete this service?')) return
    await mutate(() => campaignsApi.deleteService(campaignId, serviceId), undefined)
    refetch()
  }

  const vaccines = vaccinesData?.data ?? []

  return (
    <div className="container-fluid">
      <PageHeader
        title="Services"
        breadcrumbs={[{ label: 'Campaigns', href: '/campaigns' }, { label: 'Detail', href: `/campaigns/${campaignId}` }, { label: 'Services' }]}
        action={
          can('campaign_services:create') ? (
            <Button variant="primary" onClick={openCreate}>
              <Icon icon="solar:add-circle-bold" className="me-1" />Add Service
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
                <tr><th>#</th><th>Service</th><th>Vaccine</th><th>Price Override</th><th className="text-end">Actions</th></tr>
              </thead>
              <tbody>
                {(services ?? []).length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4 text-muted">No services yet</td></tr>
                ) : (services ?? []).map((s: CampaignService) => (
                  <tr key={s.id}>
                    <td className="text-muted">{s.sortOrder}</td>
                    <td><div className="fw-semibold">{s.name}</div><div className="text-muted small">{s.description}</div></td>
                    <td>{s.vaccineCatalog?.name ?? <span className="text-muted">—</span>}</td>
                    <td>{s.priceOverrideBdt ? `৳${s.priceOverrideBdt}` : <span className="text-muted">—</span>}</td>
                    <td className="text-end">
                      {can('campaign_services:update') && <Button variant="soft-primary" size="sm" className="me-1" onClick={() => openEdit(s)}><Icon icon="solar:pen-bold" /></Button>}
                      {can('campaign_services:delete') && <Button variant="soft-danger" size="sm" onClick={() => handleDelete(s.id)}><Icon icon="solar:trash-bin-trash-bold" /></Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </LoadingOverlay>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>{editing ? 'Edit' : 'Add'} Service</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Service Name <span className="text-danger">*</span></Form.Label>
              <Form.Control value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Vaccine (optional)</Form.Label>
              <Form.Select value={form.vaccineCatalogId} onChange={(e) => setForm(f => ({ ...f, vaccineCatalogId: e.target.value }))}>
                <option value="">None</option>
                {vaccines.map((v: VaccineCatalog) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price Override (BDT)</Form.Label>
              <Form.Control type="number" min="0" step="0.01" value={form.priceOverrideBdt} onChange={(e) => setForm(f => ({ ...f, priceOverrideBdt: e.target.value }))} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Sort Order</Form.Label>
              <Form.Control type="number" min="0" value={form.sortOrder} onChange={(e) => setForm(f => ({ ...f, sortOrder: e.target.value }))} />
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
