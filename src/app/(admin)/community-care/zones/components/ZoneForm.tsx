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
import type { CommunityZone, CommunityZoneStatus, ZoneClinicStatus } from '@/types/bpa.types'

interface ZoneFormProps {
  zoneId?: string
  initialValues?: Partial<ZoneCreatePayload & { publicVisible?: boolean, targetMembers?: number, priorityOrder?: number, clinicStatus?: string, expectedLaunchNote?: string }>
}

const STATUS_OPTIONS: { value: CommunityZoneStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'coming_soon', label: 'Coming Soon' },
]

const CLINIC_STATUS_OPTIONS: { value: ZoneClinicStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'priority', label: 'Priority' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
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
    targetMembers: String(initialValues?.targetMembers ?? '1000'),
    priorityOrder: String(initialValues?.priorityOrder ?? '0'),
    clinicStatus: (initialValues?.clinicStatus ?? 'planned') as ZoneClinicStatus,
    expectedLaunchNote: initialValues?.expectedLaunchNote ?? '',
    publicVisible: initialValues?.publicVisible ?? true,
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
      targetMembers: Number(form.targetMembers),
      priorityOrder: Number(form.priorityOrder),
      clinicStatus: form.clinicStatus,
      expectedLaunchNote: form.expectedLaunchNote || undefined,
      publicVisible: form.publicVisible,
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
            <h5 className="mb-3 text-uppercase bg-light p-2"><Icon icon="solar:info-circle-bold" className="me-1" /> Basic Information</h5>
            <Row className="g-3 mb-4">
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
                  <Form.Label>Description / Covered Areas</Form.Label>
                  <Form.Control as="textarea" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="List major areas covered by this zone..." />
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
            </Row>

            <h5 className="mb-3 text-uppercase bg-light p-2"><Icon icon="solar:stethoscope-bold" className="me-1" /> Clinic & Demand Settings</h5>
            <Row className="g-3 mb-4">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Target Members (Card Holders) <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="number" min={1} value={form.targetMembers} onChange={(e) => set('targetMembers', e.target.value)} required />
                  <Form.Text className="text-muted">Used for progress tracking</Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Clinic Status</Form.Label>
                  <Form.Select value={form.clinicStatus} onChange={(e) => set('clinicStatus', e.target.value as ZoneClinicStatus)}>
                    {CLINIC_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Priority Rank (Manual)</Form.Label>
                  <Form.Control type="number" value={form.priorityOrder} onChange={(e) => set('priorityOrder', e.target.value)} />
                  <Form.Text className="text-muted">Overrides demand ranking if set</Form.Text>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Expected Launch Note</Form.Label>
                  <Form.Control value={form.expectedLaunchNote} onChange={(e) => set('expectedLaunchNote', e.target.value)} placeholder="e.g. Launching in Q3 2026" />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Check 
                  type="switch"
                  id="public-visible-switch"
                  label="Visible in Public Purchase Flow"
                  checked={form.publicVisible}
                  onChange={(e) => set('publicVisible', e.target.checked)}
                />
              </Col>
            </Row>

            <h5 className="mb-3 text-uppercase bg-light p-2"><Icon icon="solar:wad-of-money-bold" className="me-1" /> Legacy Fund Tracking</h5>
            <Row className="g-3 mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Target Contributors (Legacy)</Form.Label>
                  <Form.Control type="number" min={1} value={form.targetContributors} onChange={(e) => set('targetContributors', e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Target Amount (BDT) (Legacy)</Form.Label>
                  <Form.Control type="number" min={0} step="0.01" value={form.targetAmountBdt} onChange={(e) => set('targetAmountBdt', e.target.value)} required />
                </Form.Group>
              </Col>
            </Row>

            <h5 className="mb-3 text-uppercase bg-light p-2"><Icon icon="solar:map-point-bold" className="me-1" /> Location & Contact</h5>
            <Row className="g-3">
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
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Internal Sort Order</Form.Label>
                  <Form.Control type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Admin Status</Form.Label>
                  <Form.Select value={form.status} onChange={(e) => set('status', e.target.value as CommunityZoneStatus)}>
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex gap-2 mt-4">
              <Button type="submit" variant="primary" size="lg" disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm me-2" />}
                <Icon icon="solar:check-circle-bold" className="me-1" />
                {isEdit ? 'Update Zone Demand & Priority' : 'Create Zone'}
              </Button>
              <Button variant="outline-secondary" size="lg" onClick={() => router.push('/community-care/zones')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
