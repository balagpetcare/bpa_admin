'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Modal, Form, Badge, Alert } from 'react-bootstrap'
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

const EMPTY = { name: '', description: '', sortOrder: '0', vaccineCatalogId: '', priceBdt: '' }

function fmt(v: number | null | undefined) {
  if (v === null || v === undefined) return null
  return `৳${v.toLocaleString()}`
}

export default function ServicesManager({ campaignId }: { campaignId: string }) {
  const { can } = usePermission()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<CampaignService | null>(null)
  const [form, setForm] = useState(EMPTY)
  const { mutate, loading: saving } = useApiMutation<unknown, unknown>()

  const servicesFn = useCallback(() => campaignsApi.listServices(campaignId), [campaignId])
  const campaignFn = useCallback(() => campaignsApi.getById(campaignId), [campaignId])
  const vaccinesFn = useCallback(() => vaccineCatalogApi.list({ limit: 100 }), [])
  const { data: services, loading, error, refetch } = useApi(servicesFn, [campaignId])
  const { data: campaign } = useApi(campaignFn, [campaignId])
  const { data: vaccinesData } = useApi(vaccinesFn, [])

  function openCreate() { setEditing(null); setForm(EMPTY); setShowModal(true) }
  function openEdit(s: CampaignService) {
    setEditing(s)
    setForm({
      name: s.name,
      description: s.description ?? '',
      sortOrder: String(s.sortOrder),
      vaccineCatalogId: s.vaccineCatalogId ?? '',
      priceBdt: s.priceBdt != null ? String(s.priceBdt) : '',
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    const dto = {
      name: form.name,
      description: form.description || undefined,
      sortOrder: Number(form.sortOrder),
      vaccineCatalogId: form.vaccineCatalogId || undefined,
      priceBdt: form.priceBdt !== '' ? Math.round(Number(form.priceBdt)) : undefined,
    }
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
  const serviceList: CampaignService[] = services ?? []

  // Pricing summary
  const servicesWithPrice = serviceList.filter(s => s.priceBdt != null && s.priceBdt > 0)
  const servicesTotalBdt = servicesWithPrice.reduce((sum, s) => sum + (s.priceBdt ?? 0), 0)
  const campaignFeeBdt = campaign ? Number(campaign.basePriceBdt ?? 0) : 0
  const discountAmountBdt = servicesTotalBdt - campaignFeeBdt
  const discountPercent = servicesTotalBdt > 0 ? Math.round((discountAmountBdt / servicesTotalBdt) * 100) : 0
  const hasPricing = servicesWithPrice.length > 0 && servicesTotalBdt > 0

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

      {/* Pricing Summary Card */}
      {hasPricing && campaign && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-white border-bottom py-3">
            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
              <Icon icon="solar:wad-of-money-bold-duotone" className="text-success" />
              Pricing Summary
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="row g-3">
              <div className="col-sm-6 col-lg-3">
                <div className="bg-light rounded p-3 text-center">
                  <div className="text-muted small fw-semibold text-uppercase mb-1">Services Total Value</div>
                  <div className="fs-4 fw-bold text-dark">৳{servicesTotalBdt.toLocaleString()}</div>
                  <div className="text-muted small">{servicesWithPrice.length} service{servicesWithPrice.length !== 1 ? 's' : ''}</div>
                </div>
              </div>
              <div className="col-sm-6 col-lg-3">
                <div className="bg-light rounded p-3 text-center">
                  <div className="text-muted small fw-semibold text-uppercase mb-1">Campaign Fee / Pet</div>
                  <div className="fs-4 fw-bold text-success">৳{campaignFeeBdt.toLocaleString()}</div>
                  <div className="text-muted small">registration fee</div>
                </div>
              </div>
              <div className="col-sm-6 col-lg-3">
                <div className="bg-light rounded p-3 text-center">
                  <div className="text-muted small fw-semibold text-uppercase mb-1">You Save</div>
                  <div className={`fs-4 fw-bold ${discountAmountBdt > 0 ? 'text-danger' : 'text-muted'}`}>
                    {discountAmountBdt > 0 ? `৳${discountAmountBdt.toLocaleString()}` : '৳0'}
                  </div>
                  <div className="text-muted small">per pet</div>
                </div>
              </div>
              <div className="col-sm-6 col-lg-3">
                <div className="bg-light rounded p-3 text-center">
                  <div className="text-muted small fw-semibold text-uppercase mb-1">Discount</div>
                  <div className={`fs-4 fw-bold ${discountPercent > 0 ? 'text-warning' : 'text-muted'}`}>
                    {discountPercent > 0 ? `${discountPercent}% OFF` : 'No discount'}
                  </div>
                  <div className="text-muted small">vs. market value</div>
                </div>
              </div>
            </div>
            {discountPercent <= 0 && campaignFeeBdt > 0 && (
              <Alert variant="warning" className="mt-3 mb-0 py-2 small">
                Campaign fee equals or exceeds total service value — no discount shown to users.
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}

      <Card>
        <Card.Body className="p-0">
          <LoadingOverlay loading={loading}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Service</th>
                  <th>Vaccine</th>
                  <th>Price</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {serviceList.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4 text-muted">No services yet</td></tr>
                ) : serviceList.map((s: CampaignService) => (
                  <tr key={s.id}>
                    <td className="text-muted">{s.sortOrder}</td>
                    <td>
                      <div className="fw-semibold">{s.name}</div>
                      <div className="text-muted small">{s.description}</div>
                    </td>
                    <td>{s.vaccineCatalog?.name ?? <span className="text-muted">—</span>}</td>
                    <td>
                      {s.priceBdt != null
                        ? <Badge bg="success-subtle" text="success" className="fw-semibold">{fmt(s.priceBdt)}</Badge>
                        : <span className="text-muted small">Not set</span>}
                    </td>
                    <td className="text-end">
                      {can('campaign_services:update') && (
                        <Button variant="soft-primary" size="sm" className="me-1" onClick={() => openEdit(s)}>
                          <Icon icon="solar:pen-bold" />
                        </Button>
                      )}
                      {can('campaign_services:delete') && (
                        <Button variant="soft-danger" size="sm" onClick={() => handleDelete(s.id)}>
                          <Icon icon="solar:trash-bin-trash-bold" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </LoadingOverlay>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Edit' : 'Add'} Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Service Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Vaccine (optional)</Form.Label>
              <Form.Select
                value={form.vaccineCatalogId}
                onChange={(e) => setForm(f => ({ ...f, vaccineCatalogId: e.target.value }))}
              >
                <option value="">None</option>
                {vaccines.map((v: VaccineCatalog) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Service Price (BDT)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 600"
                value={form.priceBdt}
                onChange={(e) => setForm(f => ({ ...f, priceBdt: e.target.value }))}
              />
              <Form.Text className="text-muted">
                Market value of this service. Used to calculate campaign discount.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Sort Order</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={(e) => setForm(f => ({ ...f, sortOrder: e.target.value }))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
