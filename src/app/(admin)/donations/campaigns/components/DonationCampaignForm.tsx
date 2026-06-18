'use client'

import { useState } from 'react'
import { Card, Button, Form, Row, Col } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { useApiMutation } from '@/hooks/useApi'
import { createCampaign, updateCampaign, type DonationCampaign } from '@/lib/api/donations.api'
import type { ApiError } from '@/lib/api'

interface Props {
  campaignId?: string
  initial?: Partial<DonationCampaign>
}

const EMPTY: Partial<DonationCampaign> = {
  titleEn: '',
  titleBn: '',
  slug: '',
  descriptionEn: '',
  descriptionBn: '',
  goalAmount: '0',
  defaultAmount: '500',
  status: 'draft',
  isActive: true,
  isFeatured: false,
  allowCustomAmount: true,
  sortOrder: 0,
  startDate: '',
  endDate: '',
  videoUrl: '',
  featuredImageUrl: '',
}

export default function DonationCampaignForm({ campaignId, initial }: Props) {
  const router = useRouter()
  const { mutate, loading, error } = useApiMutation<DonationCampaign, unknown>()
  const isEdit = !!campaignId

  const [form, setForm] = useState<Partial<DonationCampaign>>({ ...EMPTY, ...initial })

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function slugify(v: string) {
    return v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const dto = {
      ...form,
      goalAmount: String(form.goalAmount),
      defaultAmount: form.defaultAmount ? String(form.defaultAmount) : undefined,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
    }
    const result = isEdit
      ? await mutate(() => updateCampaign(campaignId, dto), undefined)
      : await mutate(() => createCampaign(dto), undefined)

    if (result) router.push('/donations/campaigns')
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title={isEdit ? 'Edit Campaign' : 'New Campaign'}
        breadcrumbs={[
          { label: 'Donations', href: '/donations' },
          { label: 'Campaigns', href: '/donations/campaigns' },
          { label: isEdit ? 'Edit' : 'Create' },
        ]}
      />
      <ApiErrorAlert error={error as ApiError | null} />

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          {/* Main content */}
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Header><h6 className="mb-0">Campaign Content</h6></Card.Header>
              <Card.Body className="d-flex flex-column gap-3">
                <Form.Group>
                  <Form.Label>Title (English) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    value={form.titleEn ?? ''}
                    onChange={(e) => {
                      set('titleEn', e.target.value)
                      if (!isEdit) set('slug', slugify(e.target.value))
                    }}
                    required
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Title (Bangla)</Form.Label>
                  <Form.Control value={form.titleBn ?? ''} onChange={(e) => set('titleBn', e.target.value)} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Slug (URL)</Form.Label>
                  <Form.Control
                    className="font-monospace"
                    value={form.slug ?? ''}
                    onChange={(e) => set('slug', slugify(e.target.value))}
                    required
                  />
                  <Form.Text className="text-muted">bpa.org.bd/donations/campaigns/<strong>{form.slug || '…'}</strong></Form.Text>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Description (English)</Form.Label>
                  <Form.Control as="textarea" rows={5} value={form.descriptionEn ?? ''} onChange={(e) => set('descriptionEn', e.target.value)} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Description (Bangla)</Form.Label>
                  <Form.Control as="textarea" rows={3} value={form.descriptionBn ?? ''} onChange={(e) => set('descriptionBn', e.target.value)} />
                </Form.Group>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header><h6 className="mb-0">Media</h6></Card.Header>
              <Card.Body className="d-flex flex-column gap-3">
                <Form.Group>
                  <Form.Label>Featured Image URL</Form.Label>
                  <Form.Control
                    type="url"
                    value={form.featuredImageUrl ?? ''}
                    onChange={(e) => set('featuredImageUrl', e.target.value)}
                    placeholder="https://..."
                  />
                  {form.featuredImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.featuredImageUrl} alt="preview" className="mt-2 rounded" style={{ maxHeight: 200, objectFit: 'cover', width: '100%' }} />
                  )}
                </Form.Group>
                <Form.Group>
                  <Form.Label>Video URL (YouTube/Vimeo embed)</Form.Label>
                  <Form.Control
                    type="url"
                    value={form.videoUrl ?? ''}
                    onChange={(e) => set('videoUrl', e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            <Card className="mb-4">
              <Card.Header><h6 className="mb-0">Publish</h6></Card.Header>
              <Card.Body className="d-flex flex-column gap-3">
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select value={form.status ?? 'draft'} onChange={(e) => set('status', e.target.value as DonationCampaign['status'])}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
                <Form.Check type="switch" label="Active" checked={form.isActive ?? true} onChange={(e) => set('isActive', e.target.checked)} />
                <Form.Check type="switch" label="Featured on donate page" checked={form.isFeatured ?? false} onChange={(e) => set('isFeatured', e.target.checked)} />
                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary" disabled={loading} className="flex-1">
                    {loading ? <><span className="spinner-border spinner-border-sm me-1" />Saving…</> : isEdit ? 'Update Campaign' : 'Create Campaign'}
                  </Button>
                  <Button type="button" variant="outline-secondary" onClick={() => router.push('/donations/campaigns')}>Cancel</Button>
                </div>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header><h6 className="mb-0">Goal & Amounts</h6></Card.Header>
              <Card.Body className="d-flex flex-column gap-3">
                <Form.Group>
                  <Form.Label>Goal Amount (BDT) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    value={form.goalAmount ?? '0'}
                    onChange={(e) => set('goalAmount', e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Default Donation Amount</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    value={form.defaultAmount ?? ''}
                    onChange={(e) => set('defaultAmount', e.target.value)}
                  />
                </Form.Group>
                <Form.Check type="switch" label="Allow custom amount" checked={form.allowCustomAmount ?? true} onChange={(e) => set('allowCustomAmount', e.target.checked)} />
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header><h6 className="mb-0">Dates</h6></Card.Header>
              <Card.Body className="d-flex flex-column gap-3">
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={form.startDate ? form.startDate.slice(0, 16) : ''}
                    onChange={(e) => set('startDate', e.target.value)}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={form.endDate ? form.endDate.slice(0, 16) : ''}
                    onChange={(e) => set('endDate', e.target.value)}
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header><h6 className="mb-0">Sort Order</h6></Card.Header>
              <Card.Body>
                <Form.Control
                  type="number"
                  min={0}
                  value={form.sortOrder ?? 0}
                  onChange={(e) => set('sortOrder', Number(e.target.value))}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  )
}
