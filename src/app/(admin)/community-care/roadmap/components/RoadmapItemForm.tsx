'use client'

import { useState } from 'react'
import { Card, Button, Form, Row, Col } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { useApiMutation } from '@/hooks/useApi'
import { roadmapItemsApi, type RoadmapItemCreatePayload } from '@/lib/api/roadmap-items.api'
import type { ApiError } from '@/lib/api'
import type { RoadmapItem, RoadmapItemStatus } from '@/types/bpa.types'

interface RoadmapItemFormProps {
  itemId?: string
  initialValues?: Partial<RoadmapItemCreatePayload & { isActive: boolean }>
}

const STATUS_OPTIONS: { value: RoadmapItemStatus; label: string }[] = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'LIVE', label: 'Live' },
]

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => currentYear + i)

export default function RoadmapItemForm({ itemId, initialValues }: RoadmapItemFormProps) {
  const router = useRouter()
  const { mutate, loading, error } = useApiMutation<RoadmapItem, unknown>()
  const isEdit = !!itemId

  const [form, setForm] = useState({
    phase: initialValues?.phase ?? '',
    year: String(initialValues?.year ?? currentYear),
    titleEn: initialValues?.titleEn ?? '',
    titleBn: initialValues?.titleBn ?? '',
    descriptionEn: initialValues?.descriptionEn ?? '',
    descriptionBn: initialValues?.descriptionBn ?? '',
    status: (initialValues?.status ?? 'PLANNED') as RoadmapItemStatus,
    sortOrder: String(initialValues?.sortOrder ?? '0'),
    isActive: initialValues?.isActive ?? true,
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: RoadmapItemCreatePayload = {
      phase: form.phase,
      year: Number(form.year),
      titleEn: form.titleEn,
      titleBn: form.titleBn,
      descriptionEn: form.descriptionEn || undefined,
      descriptionBn: form.descriptionBn || undefined,
      status: form.status,
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
    }
    const result = await mutate(() => (isEdit ? roadmapItemsApi.update(itemId, payload) : roadmapItemsApi.create(payload)), undefined)
    if (result) router.push('/community-care/roadmap')
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title={isEdit ? 'Edit Roadmap Item' : 'New Roadmap Item'}
        breadcrumbs={[
          { label: 'Community Care Fund' },
          { label: 'Future Roadmap', href: '/community-care/roadmap' },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              {/* Phase & Year */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Phase <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control value={form.phase} onChange={(e) => set('phase', e.target.value)} required placeholder="e.g. Phase 1 – Foundation" />
                  <Form.Text className="text-muted">Short phase label, e.g. &quot;Phase 1&quot; or &quot;Q2 2026&quot;</Form.Text>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>
                    Year <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select value={form.year} onChange={(e) => set('year', e.target.value)}>
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>
                    Status <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select value={form.status} onChange={(e) => set('status', e.target.value as RoadmapItemStatus)}>
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* English */}
              <Col xs={12}>
                <hr className="my-1" />
                <h6 className="text-muted text-uppercase fw-semibold mb-0" style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                  English Content
                </h6>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Title (English) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    value={form.titleEn}
                    onChange={(e) => set('titleEn', e.target.value)}
                    required
                    placeholder="e.g. Community Fund Launch"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Description (English)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={form.descriptionEn}
                    onChange={(e) => set('descriptionEn', e.target.value)}
                    placeholder="Optional milestone description in English"
                  />
                </Form.Group>
              </Col>

              {/* Bangla */}
              <Col xs={12}>
                <hr className="my-1" />
                <h6 className="text-muted text-uppercase fw-semibold mb-0" style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                  বাংলা কন্টেন্ট
                </h6>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    শিরোনাম (বাংলা) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    value={form.titleBn}
                    onChange={(e) => set('titleBn', e.target.value)}
                    required
                    placeholder="যেমন: কমিউনিটি ফান্ড চালু"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>বিবরণ (বাংলা)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={form.descriptionBn}
                    onChange={(e) => set('descriptionBn', e.target.value)}
                    placeholder="ঐচ্ছিক মাইলফলক বিবরণ বাংলায়"
                  />
                </Form.Group>
              </Col>

              {/* Meta */}
              <Col xs={12}>
                <hr className="my-1" />
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Sort Order</Form.Label>
                  <Form.Control type="number" min={0} value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <Form.Check
                  type="switch"
                  id="roadmap-isActive"
                  label="Active"
                  checked={form.isActive}
                  onChange={(e) => set('isActive', e.target.checked)}
                  className="mb-1"
                />
              </Col>
            </Row>

            <div className="d-flex gap-2 mt-4">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm me-2" />}
                <Icon icon="solar:check-circle-bold" className="me-1" />
                {isEdit ? 'Save Changes' : 'Create Item'}
              </Button>
              <Button variant="outline-secondary" onClick={() => router.push('/community-care/roadmap')}>
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
