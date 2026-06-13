'use client'

import { useState } from 'react'
import { Card, Button, Form, Row, Col, Alert } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { useApiMutation } from '@/hooks/useApi'
import { contributionPlansApi, type PlanCreatePayload } from '@/lib/api/contribution-plans.api'
import type { ApiError } from '@/lib/api'
import type { ContributionPlan } from '@/types/bpa.types'

interface PlanFormProps {
  planId?: string
  initialValues?: Partial<PlanCreatePayload & { benefitsSummaryJson?: string[] }>
}

export default function PlanForm({ planId, initialValues }: PlanFormProps) {
  const router = useRouter()
  const { mutate, loading, error } = useApiMutation<ContributionPlan, unknown>()
  const isEdit = !!planId

  const [form, setForm] = useState({
    title: initialValues?.title ?? '',
    slug: initialValues?.slug ?? '',
    amountBdt: String(initialValues?.amountBdt ?? ''),
    description: initialValues?.description ?? '',
    legalDisclaimerText: initialValues?.legalDisclaimerText ?? '',
    benefitsText: (initialValues?.benefitsSummaryJson ?? []).join('\n'),
    isActive: initialValues?.isActive ?? true,
    sortOrder: String(initialValues?.sortOrder ?? '0'),
  })

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: PlanCreatePayload = {
      title: form.title,
      slug: form.slug,
      amountBdt: Number(form.amountBdt),
      description: form.description || undefined,
      legalDisclaimerText: form.legalDisclaimerText || undefined,
      benefitsSummaryJson: form.benefitsText ? form.benefitsText.split('\n').map(s => s.trim()).filter(Boolean) : undefined,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder),
    }
    const result = await mutate(
      () => isEdit ? contributionPlansApi.update(planId, payload) : contributionPlansApi.create(payload),
      undefined,
    )
    if (result) router.push('/community-care/plans')
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title={isEdit ? 'Edit Plan' : 'New Plan'}
        breadcrumbs={[{ label: 'Community Care Fund' }, { label: 'Plans', href: '/community-care/plans' }, { label: isEdit ? 'Edit' : 'New' }]}
      />
      <ApiErrorAlert error={error as ApiError | null} />

      <Alert variant="info" className="mb-3">
        <Icon icon="solar:info-circle-bold" className="me-2" />
        <strong>Legal Note:</strong> Plans must not imply ownership, profit-sharing, financial return, or guaranteed discounts on products or medicines.
      </Alert>

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                  <Form.Control value={form.title} onChange={(e) => set('title', e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Slug <span className="text-danger">*</span></Form.Label>
                  <Form.Control value={form.slug} onChange={(e) => set('slug', e.target.value)} required placeholder="e.g. care-partner-annual" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Amount (BDT) <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="number" min={1} step="0.01" value={form.amountBdt} onChange={(e) => set('amountBdt', e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Sort Order</Form.Label>
                  <Form.Control type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <Form.Check
                  type="switch"
                  id="plan-active"
                  label="Active"
                  checked={form.isActive}
                  onChange={(e) => set('isActive', e.target.checked)}
                  className="mb-2"
                />
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Benefits Summary <span className="text-muted small">(one per line)</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={form.benefitsText}
                    onChange={(e) => set('benefitsText', e.target.value)}
                    placeholder="Access to BPA community clinic (subject to availability)&#10;Annual care camp invitation&#10;BPA Care Partner certificate"
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Legal Disclaimer Text</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={form.legalDisclaimerText}
                    onChange={(e) => set('legalDisclaimerText', e.target.value)}
                    placeholder="Care Partner Card is a contribution recognition and service benefit card only. It is not ownership, share, profit-sharing, investment, or financial return."
                  />
                  <Form.Text className="text-muted">This text will be shown on all Care Partner Cards for this plan.</Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex gap-2 mt-4">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm me-2" />}
                <Icon icon="solar:check-circle-bold" className="me-1" />
                {isEdit ? 'Save Changes' : 'Create Plan'}
              </Button>
              <Button variant="outline-secondary" onClick={() => router.push('/community-care/plans')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
