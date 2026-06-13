'use client'

import { useState } from 'react'
import { Card, Button, Form, Row, Col } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { useApiMutation } from '@/hooks/useApi'
import { communityZonesApi, type ZoneCreatePayload } from '@/lib/api/community-zones.api'
import type { ApiError } from '@/lib/api'
import type { CommunityZone, CommunityZoneStatus } from '@/types/bpa.types'

interface ZoneFormProps {
  zoneId?: string
  initialValues?: Partial<ZoneCreatePayload>
}

const STATUS_OPTIONS: { value: CommunityZoneStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'coming_soon', label: 'Coming Soon' },
]

export default function ZoneForm({ zoneId, initialValues }: ZoneFormProps) {
  const router = useRouter()
  const { mutate, loading, error } = useApiMutation<CommunityZone, unknown>()
  const isEdit = !!zoneId

  const [form, setForm] = useState({
    name: initialValues?.name ?? '',
    slug: initialValues?.slug ?? '',
    description: initialValues?.description ?? '',
    city: initialValues?.city ?? '',
    district: initialValues?.district ?? '',
    division: initialValues?.division ?? '',
    targetContributors: String(initialValues?.targetContributors ?? '100'),
    targetAmountBdt: String(initialValues?.targetAmountBdt ?? ''),
    clinicAddress: initialValues?.clinicAddress ?? '',
    clinicPhone: initialValues?.clinicPhone ?? '',
    mapEmbedUrl: initialValues?.mapEmbedUrl ?? '',
    sortOrder: String(initialValues?.sortOrder ?? '0'),
    status: (initialValues?.status ?? 'active') as CommunityZoneStatus,
  })

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: ZoneCreatePayload = {
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
      city: form.city,
      district: form.district,
      division: form.division,
      targetContributors: Number(form.targetContributors),
      targetAmountBdt: Number(form.targetAmountBdt),
      clinicAddress: form.clinicAddress || undefined,
      clinicPhone: form.clinicPhone || undefined,
      mapEmbedUrl: form.mapEmbedUrl || undefined,
      sortOrder: Number(form.sortOrder),
      status: form.status,
    }
    const result = await mutate(
      () => isEdit ? communityZonesApi.update(zoneId, payload) : communityZonesApi.create(payload),
      undefined,
    )
    if (result) router.push('/community-care/zones')
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title={isEdit ? 'Edit Zone' : 'New Zone'}
        breadcrumbs={[{ label: 'Community Care Fund' }, { label: 'Zones', href: '/community-care/zones' }, { label: isEdit ? 'Edit' : 'New' }]}
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Zone Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control value={form.name} onChange={(e) => set('name', e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Slug <span className="text-danger">*</span></Form.Label>
                  <Form.Control value={form.slug} onChange={(e) => set('slug', e.target.value)} required placeholder="e.g. dhaka-north" />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>City <span className="text-danger">*</span></Form.Label>
                  <Form.Control value={form.city} onChange={(e) => set('city', e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>District <span className="text-danger">*</span></Form.Label>
                  <Form.Control value={form.district} onChange={(e) => set('district', e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Division <span className="text-danger">*</span></Form.Label>
                  <Form.Control value={form.division} onChange={(e) => set('division', e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Target Contributors <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="number" min={1} value={form.targetContributors} onChange={(e) => set('targetContributors', e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Target Amount (BDT) <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="number" min={0} step="0.01" value={form.targetAmountBdt} onChange={(e) => set('targetAmountBdt', e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Clinic Address</Form.Label>
                  <Form.Control value={form.clinicAddress} onChange={(e) => set('clinicAddress', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Clinic Phone</Form.Label>
                  <Form.Control value={form.clinicPhone} onChange={(e) => set('clinicPhone', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Map Embed URL</Form.Label>
                  <Form.Control value={form.mapEmbedUrl} onChange={(e) => set('mapEmbedUrl', e.target.value)} placeholder="Google Maps embed iframe src" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Sort Order</Form.Label>
                  <Form.Control type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select value={form.status} onChange={(e) => set('status', e.target.value as CommunityZoneStatus)}>
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex gap-2 mt-4">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm me-2" />}
                <Icon icon="solar:check-circle-bold" className="me-1" />
                {isEdit ? 'Save Changes' : 'Create Zone'}
              </Button>
              <Button variant="outline-secondary" onClick={() => router.push('/community-care/zones')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
