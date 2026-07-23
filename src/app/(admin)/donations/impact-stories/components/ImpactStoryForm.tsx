'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Form, Row, Col } from 'react-bootstrap'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { createImpactStory, updateImpactStory, listPurposes, listCampaigns, type DonationImpactStory } from '@/lib/api/donations.api'
import type { ApiError } from '@/lib/api'

const STORY_TYPES = ['rescue', 'treatment', 'vaccination', 'adoption', 'nutrition', 'rehabilitation', 'other']
const ANIMAL_TYPES = ['dog', 'cat', 'bird', 'rabbit', 'turtle', 'other']

interface Props {
  storyId?: string
  initial?: Partial<DonationImpactStory>
}

const EMPTY: Partial<DonationImpactStory> = {
  titleEn: '',
  titleBn: '',
  slug: '',
  storyType: 'rescue',
  animalType: '',
  animalName: '',
  location: '',
  shortDescriptionEn: '',
  shortDescriptionBn: '',
  fullStoryEn: '',
  fullStoryBn: '',
  beforeImageUrl: '',
  afterImageUrl: '',
  costUsed: '',
  storyDate: '',
  isPublished: false,
  isFeatured: false,
}

export default function ImpactStoryForm({ storyId, initial }: Props) {
  const router = useRouter()
  const { mutate, loading, error } = useApiMutation<DonationImpactStory, unknown>()
  const isEdit = !!storyId

  const [form, setForm] = useState<Partial<DonationImpactStory>>({ ...EMPTY, ...initial })

  const purFn = useCallback(() => listPurposes(), [])
  const { data: purposes } = useApi(purFn, [])
  const camFn = useCallback(() => listCampaigns(), [])
  const { data: campaigns } = useApi(camFn, [])

  function set<K extends keyof typeof form>(key: K, value: any) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function slugify(v: string) {
    return v
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = isEdit ? await mutate(() => updateImpactStory(storyId, form), undefined) : await mutate(() => createImpactStory(form), undefined)
    if (result) router.push('/donations/impact-stories')
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title={isEdit ? 'Edit Impact Story' : 'New Impact Story'}
        breadcrumbs={[
          { label: 'Donations', href: '/donations' },
          { label: 'Impact Stories', href: '/donations/impact-stories' },
          { label: isEdit ? 'Edit' : 'Create' },
        ]}
      />
      <ApiErrorAlert error={error as ApiError | null} />

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Story Content</h6>
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
                  <Form.Label>
                    Slug <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control className="font-monospace" value={form.slug ?? ''} onChange={(e) => set('slug', slugify(e.target.value))} required />
                </Form.Group>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Short Description (EN)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={form.shortDescriptionEn ?? ''}
                        onChange={(e) => set('shortDescriptionEn', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Short Description (BN)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={form.shortDescriptionBn ?? ''}
                        onChange={(e) => set('shortDescriptionBn', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group>
                  <Form.Label>
                    Full Story (English) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control as="textarea" rows={8} value={form.fullStoryEn ?? ''} onChange={(e) => set('fullStoryEn', e.target.value)} required />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Full Story (Bangla)</Form.Label>
                  <Form.Control as="textarea" rows={6} value={form.fullStoryBn ?? ''} onChange={(e) => set('fullStoryBn', e.target.value)} />
                </Form.Group>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <h6 className="mb-0">Images</h6>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Before Image URL</Form.Label>
                      <Form.Control
                        type="url"
                        value={form.beforeImageUrl ?? ''}
                        onChange={(e) => set('beforeImageUrl', e.target.value)}
                        placeholder="https://..."
                      />
                      {form.beforeImageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={form.beforeImageUrl} alt="before" className="mt-2 rounded w-100" style={{ maxHeight: 160, objectFit: 'cover' }} />
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>After Image URL</Form.Label>
                      <Form.Control
                        type="url"
                        value={form.afterImageUrl ?? ''}
                        onChange={(e) => set('afterImageUrl', e.target.value)}
                        placeholder="https://..."
                      />
                      {form.afterImageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={form.afterImageUrl} alt="after" className="mt-2 rounded w-100" style={{ maxHeight: 160, objectFit: 'cover' }} />
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Publish</h6>
              </Card.Header>
              <Card.Body className="d-flex flex-column gap-3">
                <Form.Check
                  type="switch"
                  label="Published (visible on website)"
                  checked={form.isPublished ?? false}
                  onChange={(e) => set('isPublished', e.target.checked)}
                />
                <Form.Check type="switch" label="Featured" checked={form.isFeatured ?? false} onChange={(e) => set('isFeatured', e.target.checked)} />
                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" />
                        Saving…
                      </>
                    ) : isEdit ? (
                      'Update Story'
                    ) : (
                      'Create Story'
                    )}
                  </Button>
                  <Button type="button" variant="outline-secondary" onClick={() => router.push('/donations/impact-stories')}>
                    Cancel
                  </Button>
                </div>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Details</h6>
              </Card.Header>
              <Card.Body className="d-flex flex-column gap-3">
                <Form.Group>
                  <Form.Label>
                    Story Type <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select value={form.storyType ?? 'rescue'} onChange={(e) => set('storyType', e.target.value)} required>
                    {STORY_TYPES.map((t) => (
                      <option key={t} value={t} className="text-capitalize">
                        {t}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Row className="g-2">
                  <Col>
                    <Form.Group>
                      <Form.Label>Animal Type</Form.Label>
                      <Form.Select value={form.animalType ?? ''} onChange={(e) => set('animalType', e.target.value)}>
                        <option value="">—</option>
                        {ANIMAL_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Animal Name</Form.Label>
                      <Form.Control value={form.animalName ?? ''} onChange={(e) => set('animalName', e.target.value)} placeholder="Bimbo" />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group>
                  <Form.Label>Location</Form.Label>
                  <Form.Control value={form.location ?? ''} onChange={(e) => set('location', e.target.value)} placeholder="Dhaka, Mirpur" />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Story Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.storyDate ? form.storyDate.slice(0, 10) : ''}
                    onChange={(e) => set('storyDate', e.target.value)}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Cost Used (BDT)</Form.Label>
                  <Form.Control type="number" min={0} value={form.costUsed ?? ''} onChange={(e) => set('costUsed', e.target.value)} />
                </Form.Group>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <h6 className="mb-0">Link to Campaign / Purpose</h6>
              </Card.Header>
              <Card.Body className="d-flex flex-column gap-3">
                <Form.Group>
                  <Form.Label>Campaign (optional)</Form.Label>
                  <Form.Select value={form.campaignId ?? ''} onChange={(e) => set('campaignId', e.target.value || undefined)}>
                    <option value="">— None —</option>
                    {(campaigns ?? []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.titleEn}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Purpose (optional)</Form.Label>
                  <Form.Select value={form.purposeId ?? ''} onChange={(e) => set('purposeId', e.target.value || undefined)}>
                    <option value="">— None —</option>
                    {(purposes ?? []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.titleEn}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  )
}
