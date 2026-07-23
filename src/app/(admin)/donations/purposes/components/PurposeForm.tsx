'use client'

import { useState } from 'react'
import { Card, Button, Form, Row, Col, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { useApiMutation } from '@/hooks/useApi'
import { createPurpose, updatePurpose, type DonationPurpose } from '@/lib/api/donations.api'
import type { ApiError } from '@/lib/api'

const ICON_OPTIONS = ['heart', 'syringe', 'ambulance', 'bone', 'scissors', 'users', 'hospital', 'paw-print', 'utensils', 'shield']

interface Props {
  purposeId?: string
  initial?: Partial<DonationPurpose>
}

const EMPTY: Partial<DonationPurpose> = {
  titleEn: '',
  titleBn: '',
  slug: '',
  descriptionEn: '',
  descriptionBn: '',
  icon: 'heart',
  imageUrl: '',
  impactTextEn: '',
  impactTextBn: '',
  isActive: true,
  sortOrder: 0,
  suggestedAmounts: [100, 500, 1000, 5000],
}

export default function PurposeForm({ purposeId, initial }: Props) {
  const router = useRouter()
  const { mutate, loading, error } = useApiMutation<DonationPurpose, unknown>()
  const isEdit = !!purposeId

  const [form, setForm] = useState<Partial<DonationPurpose>>({ ...EMPTY, ...initial })
  const [amountInput, setAmountInput] = useState('')

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function slugify(v: string) {
    return v
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  function addAmount() {
    const n = Number(amountInput)
    if (!n || n <= 0) return
    const prev = form.suggestedAmounts ?? []
    if (!prev.includes(n))
      set(
        'suggestedAmounts',
        [...prev, n].sort((a, b) => a - b),
      )
    setAmountInput('')
  }

  function removeAmount(a: number) {
    set(
      'suggestedAmounts',
      (form.suggestedAmounts ?? []).filter((x) => x !== a),
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = isEdit ? await mutate(() => updatePurpose(purposeId, form), undefined) : await mutate(() => createPurpose(form), undefined)
    if (result) router.push('/donations/purposes')
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title={isEdit ? 'Edit Purpose' : 'New Donation Purpose'}
        breadcrumbs={[
          { label: 'Donations', href: '/donations' },
          { label: 'Purposes', href: '/donations/purposes' },
          { label: isEdit ? 'Edit' : 'Create' },
        ]}
      />
      <ApiErrorAlert error={error as ApiError | null} />

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Purpose Content</h6>
              </Card.Header>
              <Card.Body className="d-flex flex-column gap-3">
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        Title (English) <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        value={form.titleEn ?? ''}
                        onChange={(e) => {
                          set('titleEn', e.target.value)
                          if (!isEdit) set('slug', slugify(e.target.value))
                        }}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Title (Bangla)</Form.Label>
                      <Form.Control value={form.titleBn ?? ''} onChange={(e) => set('titleBn', e.target.value)} />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group>
                  <Form.Label>Slug</Form.Label>
                  <Form.Control className="font-monospace" value={form.slug ?? ''} onChange={(e) => set('slug', slugify(e.target.value))} required />
                </Form.Group>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Description (English)</Form.Label>
                      <Form.Control as="textarea" rows={3} value={form.descriptionEn ?? ''} onChange={(e) => set('descriptionEn', e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Description (Bangla)</Form.Label>
                      <Form.Control as="textarea" rows={3} value={form.descriptionBn ?? ''} onChange={(e) => set('descriptionBn', e.target.value)} />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Impact Text (English)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="৳500 funds 10 vaccines"
                        value={form.impactTextEn ?? ''}
                        onChange={(e) => set('impactTextEn', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Impact Text (Bangla)</Form.Label>
                      <Form.Control as="textarea" rows={2} value={form.impactTextBn ?? ''} onChange={(e) => set('impactTextBn', e.target.value)} />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <h6 className="mb-0">Suggested Donation Amounts</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {(form.suggestedAmounts ?? []).map((a) => (
                    <Badge key={a} bg="primary-subtle" text="primary" className="d-flex align-items-center gap-1 px-3 py-2">
                      ৳{a.toLocaleString()}
                      <button type="button" onClick={() => removeAmount(a)} className="btn-close btn-close-sm ms-1" style={{ fontSize: '8px' }} />
                    </Badge>
                  ))}
                  {(form.suggestedAmounts ?? []).length === 0 && <span className="text-muted small">No amounts added yet.</span>}
                </div>
                <div className="d-flex gap-2" style={{ maxWidth: 300 }}>
                  <Form.Control
                    type="number"
                    min={1}
                    placeholder="e.g. 1000"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addAmount()
                      }
                    }}
                    size="sm"
                  />
                  <Button type="button" variant="outline-primary" size="sm" onClick={addAmount}>
                    Add
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Settings</h6>
              </Card.Header>
              <Card.Body className="d-flex flex-column gap-3">
                <Form.Group>
                  <Form.Label>Icon Key</Form.Label>
                  <Form.Select value={form.icon ?? 'heart'} onChange={(e) => set('icon', e.target.value)}>
                    {ICON_OPTIONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Image URL</Form.Label>
                  <Form.Control type="url" value={form.imageUrl ?? ''} onChange={(e) => set('imageUrl', e.target.value)} placeholder="https://..." />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Sort Order</Form.Label>
                  <Form.Control type="number" min={0} value={form.sortOrder ?? 0} onChange={(e) => set('sortOrder', Number(e.target.value))} />
                </Form.Group>
                <Form.Check type="switch" label="Active" checked={form.isActive ?? true} onChange={(e) => set('isActive', e.target.checked)} />
                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" />
                        Saving…
                      </>
                    ) : isEdit ? (
                      'Update Purpose'
                    ) : (
                      'Create Purpose'
                    )}
                  </Button>
                  <Button type="button" variant="outline-secondary" onClick={() => router.push('/donations/purposes')}>
                    Cancel
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  )
}
