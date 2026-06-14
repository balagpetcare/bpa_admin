'use client'

import { useState } from 'react'
import { Card, Button, Form, Row, Col } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { useApiMutation } from '@/hooks/useApi'
import { socialImpactProgramsApi, type SocialImpactProgramCreatePayload } from '@/lib/api/social-impact-programs.api'
import type { ApiError } from '@/lib/api'
import type { SocialImpactProgram, SocialImpactProgramType } from '@/types/bpa.types'

interface SocialImpactProgramFormProps {
  programId?: string
  initialValues?: Partial<SocialImpactProgramCreatePayload & { isActive: boolean }>
}

const IMPACT_TYPE_OPTIONS: { value: SocialImpactProgramType; label: string }[] = [
  { value: 'STRAY_TREATMENT', label: 'Stray Treatment' },
  { value: 'FEEDING', label: 'Feeding' },
  { value: 'VACCINATION', label: 'Vaccination' },
  { value: 'RESCUE', label: 'Rescue' },
  { value: 'SHELTER', label: 'Shelter' },
  { value: 'LOW_INCOME_SUPPORT', label: 'Low-Income Support' },
  { value: 'EDUCATION', label: 'Education' },
]

export default function SocialImpactProgramForm({ programId, initialValues }: SocialImpactProgramFormProps) {
  const router = useRouter()
  const { mutate, loading, error } = useApiMutation<SocialImpactProgram, unknown>()
  const isEdit = !!programId

  const [form, setForm] = useState({
    titleEn: initialValues?.titleEn ?? '',
    titleBn: initialValues?.titleBn ?? '',
    descriptionEn: initialValues?.descriptionEn ?? '',
    descriptionBn: initialValues?.descriptionBn ?? '',
    impactType: (initialValues?.impactType ?? 'STRAY_TREATMENT') as SocialImpactProgramType,
    icon: initialValues?.icon ?? '',
    sortOrder: String(initialValues?.sortOrder ?? '0'),
    isActive: initialValues?.isActive ?? true,
  })

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: SocialImpactProgramCreatePayload = {
      titleEn: form.titleEn,
      titleBn: form.titleBn,
      descriptionEn: form.descriptionEn || undefined,
      descriptionBn: form.descriptionBn || undefined,
      impactType: form.impactType,
      icon: form.icon || undefined,
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
    }
    const result = await mutate(
      () => isEdit
        ? socialImpactProgramsApi.update(programId, payload)
        : socialImpactProgramsApi.create(payload),
      undefined,
    )
    if (result) router.push('/community-care/social-impact-programs')
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title={isEdit ? 'Edit Social Impact Program' : 'New Social Impact Program'}
        breadcrumbs={[
          { label: 'Community Care Fund' },
          { label: 'Social Impact Programs', href: '/community-care/social-impact-programs' },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col xs={12}><h6 className="text-muted text-uppercase fw-semibold mb-0" style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>English Content</h6></Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Title (English) <span className="text-danger">*</span></Form.Label>
                  <Form.Control value={form.titleEn} onChange={e => set('titleEn', e.target.value)} required placeholder="e.g. Stray Dog Rescue Program" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Description (English)</Form.Label>
                  <Form.Control as="textarea" rows={2} value={form.descriptionEn} onChange={e => set('descriptionEn', e.target.value)} placeholder="Optional description in English" />
                </Form.Group>
              </Col>

              <Col xs={12}><hr className="my-1" /><h6 className="text-muted text-uppercase fw-semibold mb-0" style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>বাংলা কন্টেন্ট</h6></Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>শিরোনাম (বাংলা) <span className="text-danger">*</span></Form.Label>
                  <Form.Control value={form.titleBn} onChange={e => set('titleBn', e.target.value)} required placeholder="যেমন: পথকুকুর উদ্ধার কার্যক্রম" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>বিবরণ (বাংলা)</Form.Label>
                  <Form.Control as="textarea" rows={2} value={form.descriptionBn} onChange={e => set('descriptionBn', e.target.value)} placeholder="ঐচ্ছিক বিবরণ বাংলায়" />
                </Form.Group>
              </Col>

              <Col xs={12}><hr className="my-1" /></Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Impact Type <span className="text-danger">*</span></Form.Label>
                  <Form.Select value={form.impactType} onChange={e => set('impactType', e.target.value as SocialImpactProgramType)}>
                    {IMPACT_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Icon</Form.Label>
                  <Form.Control value={form.icon} onChange={e => set('icon', e.target.value)} placeholder="e.g. solar:cat-bold" />
                  <Form.Text className="text-muted">Iconify icon key (optional)</Form.Text>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Sort Order</Form.Label>
                  <Form.Control type="number" min={0} value={form.sortOrder} onChange={e => set('sortOrder', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Form.Check type="switch" id="program-isActive" label="Active" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="mb-1" />
              </Col>
            </Row>

            <div className="d-flex gap-2 mt-4">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm me-2" />}
                <Icon icon="solar:check-circle-bold" className="me-1" />
                {isEdit ? 'Save Changes' : 'Create Program'}
              </Button>
              <Button variant="outline-secondary" onClick={() => router.push('/community-care/social-impact-programs')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
