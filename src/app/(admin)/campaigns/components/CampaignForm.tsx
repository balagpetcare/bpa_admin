'use client'

import { useState } from 'react'
import { Card, Button, Form, Row, Col, Alert, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import { useApiMutation } from '@/hooks/useApi'
import { campaignsApi } from '@/lib/api/campaigns.api'
import type { CampaignType } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

const CAMPAIGN_TYPES: { value: CampaignType; label: string }[] = [
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'deworming', label: 'Deworming' },
  { value: 'microchip', label: 'Microchip' },
  { value: 'health_camp', label: 'Health Camp' },
  { value: 'spay_neuter', label: 'Spay / Neuter' },
]

const ALL_PET_TYPES: { value: string; label: string; icon: string }[] = [
  { value: 'dog',        label: 'Dog',        icon: '🐕' },
  { value: 'cat',        label: 'Cat',        icon: '🐈' },
  { value: 'bird',       label: 'Bird',       icon: '🐦' },
  { value: 'rabbit',     label: 'Rabbit',     icon: '🐇' },
  { value: 'guinea_pig', label: 'Guinea Pig', icon: '🐹' },
  { value: 'fish',       label: 'Fish',       icon: '🐟' },
  { value: 'reptile',    label: 'Reptile',    icon: '🦎' },
  { value: 'other',      label: 'Other',      icon: '🐾' },
]

interface CampaignFormProps {
  campaignId?: string
  initialValues?: {
    title: string
    slug: string
    description: string
    campaignType: CampaignType
    startDate: string
    endDate: string
    registrationOpenAt: string
    registrationCloseAt: string
    basePriceBdt: string
    maxPetsPerBooking: string
    isFeatured?: boolean
    allowedPetTypes?: string[]
  }
}

export default function CampaignForm({ campaignId, initialValues }: CampaignFormProps) {
  const router = useRouter()
  const { mutate, loading, error } = useApiMutation<unknown, unknown>()
  const isEdit = !!campaignId

  const [form, setForm] = useState({
    title: initialValues?.title ?? '',
    slug: initialValues?.slug ?? '',
    description: initialValues?.description ?? '',
    campaignType: initialValues?.campaignType ?? 'vaccination' as CampaignType,
    startDate: initialValues?.startDate ?? '',
    endDate: initialValues?.endDate ?? '',
    registrationOpenAt: initialValues?.registrationOpenAt ?? '',
    registrationCloseAt: initialValues?.registrationCloseAt ?? '',
    basePriceBdt: initialValues?.basePriceBdt ?? '0',
    maxPetsPerBooking: initialValues?.maxPetsPerBooking ?? '5',
    isFeatured: initialValues?.isFeatured ?? false,
    allowedPetTypes: initialValues?.allowedPetTypes ?? [] as string[],
  })

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function togglePetType(type: string) {
    setForm(f => ({
      ...f,
      allowedPetTypes: f.allowedPetTypes.includes(type)
        ? f.allowedPetTypes.filter(t => t !== type)
        : [...f.allowedPetTypes, type],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (form.allowedPetTypes.length === 0) {
      alert('Please select at least one allowed pet type.')
      return
    }

    const dto = {
      title: form.title,
      slug: form.slug || undefined,
      description: form.description || undefined,
      campaignType: form.campaignType,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      registrationOpenAt: form.registrationOpenAt ? new Date(form.registrationOpenAt).toISOString() : undefined,
      registrationCloseAt: form.registrationCloseAt ? new Date(form.registrationCloseAt).toISOString() : undefined,
      basePriceBdt: Number(form.basePriceBdt),
      maxPetsPerBooking: Number(form.maxPetsPerBooking),
      isFeatured: form.isFeatured,
      allowedPetTypes: form.allowedPetTypes,
    }

    let result: unknown
    if (isEdit) {
      result = await mutate(() => campaignsApi.update(campaignId, dto), undefined)
    } else {
      result = await mutate(() => campaignsApi.create(dto), undefined)
    }

    if (result) {
      const id = (result as { id: string }).id
      router.push(`/campaigns/${id}`)
    }
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title={isEdit ? 'Edit Campaign' : 'New Campaign'}
        breadcrumbs={[
          { label: 'Campaign Mgmt' },
          { label: 'Campaigns', href: '/campaigns' },
          { label: isEdit ? 'Edit' : 'Create' },
        ]}
      />

      {error && <Alert variant="danger">{(error as ApiError).message}</Alert>}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                  <Form.Control required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Campaign title" />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Slug</Form.Label>
                  <Form.Control value={form.slug} onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="campaign-url-slug" />
                  <Form.Text className="text-muted">URL identifier. Leave empty to auto-generate.</Form.Text>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Campaign Type <span className="text-danger">*</span></Form.Label>
                  <Form.Select required value={form.campaignType} onChange={(e) => set('campaignType', e.target.value as CampaignType)}>
                    {CAMPAIGN_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Campaign description" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Start Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control required type="datetime-local" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>End Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control required type="datetime-local" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Registration Opens</Form.Label>
                  <Form.Control type="datetime-local" value={form.registrationOpenAt} onChange={(e) => set('registrationOpenAt', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Registration Closes</Form.Label>
                  <Form.Control type="datetime-local" value={form.registrationCloseAt} onChange={(e) => set('registrationCloseAt', e.target.value)} />
                </Form.Group>
              </Col>

              {/* ── Allowed Pet Types ── */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Allowed Pet Types <span className="text-danger">*</span>
                    {form.allowedPetTypes.length > 0 && (
                      <Badge bg="success" className="ms-2">{form.allowedPetTypes.length} selected</Badge>
                    )}
                  </Form.Label>
                  <div className="d-flex flex-wrap gap-2 p-3 border rounded bg-light">
                    {ALL_PET_TYPES.map(pt => {
                      const checked = form.allowedPetTypes.includes(pt.value)
                      return (
                        <button
                          key={pt.value}
                          type="button"
                          onClick={() => togglePetType(pt.value)}
                          className={`btn btn-sm d-flex align-items-center gap-1 ${checked ? 'btn-success' : 'btn-outline-secondary'}`}
                        >
                          <span>{pt.icon}</span>
                          <span>{pt.label}</span>
                          {checked && <Icon icon="solar:check-circle-bold" className="ms-1" />}
                        </button>
                      )
                    })}
                  </div>
                  <Form.Text className="text-muted">
                    {form.allowedPetTypes.length === 0
                      ? <span className="text-danger fw-bold">Please select at least one allowed pet type.</span>
                      : `Only ${form.allowedPetTypes.map(v => ALL_PET_TYPES.find(p => p.value === v)?.label ?? v).join(', ')} will be accepted at registration.`
                    }
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Campaign Base Price / Registration Fee per Pet (BDT) <span className="text-danger">*</span></Form.Label>
                  <Form.Control required type="number" min="0" step="0.01" value={form.basePriceBdt} onChange={(e) => set('basePriceBdt', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Max Pets Per Booking</Form.Label>
                  <Form.Control type="number" min="1" max="20" value={form.maxPetsPerBooking} onChange={(e) => set('maxPetsPerBooking', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex align-items-end">
                <Form.Group>
                  <Form.Check
                    type="switch"
                    id="isFeatured"
                    label="Feature on Homepage"
                    checked={form.isFeatured}
                    onChange={(e) => set('isFeatured', e.target.checked)}
                  />
                  <Form.Text className="text-muted">Highlighted in the homepage campaigns section</Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2 mt-4">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Saving…' : isEdit ? 'Update Campaign' : 'Create Campaign'}
              </Button>
              <Button variant="soft-secondary" onClick={() => router.push('/campaigns')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
