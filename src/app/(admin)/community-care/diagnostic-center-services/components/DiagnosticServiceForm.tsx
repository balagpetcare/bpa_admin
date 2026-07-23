'use client'

import { useState } from 'react'
import { Card, Button, Form, Row, Col } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { useApiMutation } from '@/hooks/useApi'
import { diagnosticCenterServicesApi, type DiagnosticCenterServiceCreatePayload } from '@/lib/api/diagnostic-center-services.api'
import type { ApiError } from '@/lib/api'
import type { DiagnosticCenterService, DiagnosticServiceCategory } from '@/types/bpa.types'

interface DiagnosticServiceFormProps {
  serviceId?: string
  initialValues?: Partial<DiagnosticCenterServiceCreatePayload & { isActive: boolean }>
}

const CATEGORY_OPTIONS: { value: DiagnosticServiceCategory; label: string }[] = [
  { value: 'LAB', label: 'Lab' },
  { value: 'IMAGING', label: 'Imaging' },
  { value: 'SPECIALIST', label: 'Specialist' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'FUTURE_TECH', label: 'Future Tech' },
]

export default function DiagnosticServiceForm({ serviceId, initialValues }: DiagnosticServiceFormProps) {
  const router = useRouter()
  const { mutate, loading, error } = useApiMutation<DiagnosticCenterService, unknown>()
  const isEdit = !!serviceId

  const [form, setForm] = useState({
    titleEn: initialValues?.titleEn ?? '',
    titleBn: initialValues?.titleBn ?? '',
    descriptionEn: initialValues?.descriptionEn ?? '',
    descriptionBn: initialValues?.descriptionBn ?? '',
    category: (initialValues?.category ?? 'LAB') as DiagnosticServiceCategory,
    icon: initialValues?.icon ?? '',
    sortOrder: String(initialValues?.sortOrder ?? '0'),
    isActive: initialValues?.isActive ?? true,
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: DiagnosticCenterServiceCreatePayload = {
      titleEn: form.titleEn,
      titleBn: form.titleBn,
      descriptionEn: form.descriptionEn || undefined,
      descriptionBn: form.descriptionBn || undefined,
      category: form.category,
      icon: form.icon || undefined,
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
    }
    const result = await mutate(
      () => (isEdit ? diagnosticCenterServicesApi.update(serviceId, payload) : diagnosticCenterServicesApi.create(payload)),
      undefined,
    )
    if (result) router.push('/community-care/diagnostic-center-services')
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title={isEdit ? 'Edit Diagnostic Service' : 'New Diagnostic Center Service'}
        breadcrumbs={[
          { label: 'Community Care Fund' },
          { label: 'Diagnostic Center Services', href: '/community-care/diagnostic-center-services' },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col xs={12}>
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
                    placeholder="e.g. Complete Blood Count (CBC)"
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
                    placeholder="Optional description in English"
                  />
                </Form.Group>
              </Col>

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
                    placeholder="যেমন: সম্পূর্ণ রক্ত গণনা (CBC)"
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
                    placeholder="ঐচ্ছিক বিবরণ বাংলায়"
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <hr className="my-1" />
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    Category <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select value={form.category} onChange={(e) => set('category', e.target.value as DiagnosticServiceCategory)}>
                    {CATEGORY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Icon</Form.Label>
                  <Form.Control value={form.icon} onChange={(e) => set('icon', e.target.value)} placeholder="e.g. solar:test-tube-bold" />
                  <Form.Text className="text-muted">Iconify icon key (optional)</Form.Text>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Sort Order</Form.Label>
                  <Form.Control type="number" min={0} value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Form.Check
                  type="switch"
                  id="service-isActive"
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
                {isEdit ? 'Save Changes' : 'Create Service'}
              </Button>
              <Button variant="outline-secondary" onClick={() => router.push('/community-care/diagnostic-center-services')}>
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
