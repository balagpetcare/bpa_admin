'use client'

import { useState } from 'react'
import { Card, Button, Form, Row, Col, Alert, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import { useApiMutation } from '@/hooks/useApi'
import { campaignsApi } from '@/lib/api/campaigns.api'
import type { CampaignContentMetadata, CampaignType } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

const CAMPAIGN_TYPES: { value: CampaignType; label: string }[] = [
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'deworming', label: 'Deworming' },
  { value: 'microchip', label: 'Microchip' },
  { value: 'health_camp', label: 'Health Camp' },
  { value: 'spay_neuter', label: 'Spay / Neuter' },
]

const ALL_PET_TYPES: { value: string; label: string; icon: string }[] = [
  { value: 'dog', label: 'Dog', icon: '🐕' },
  { value: 'cat', label: 'Cat', icon: '🐈' },
  { value: 'bird', label: 'Bird', icon: '🐦' },
  { value: 'rabbit', label: 'Rabbit', icon: '🐇' },
  { value: 'guinea_pig', label: 'Guinea Pig', icon: '🐹' },
  { value: 'fish', label: 'Fish', icon: '🐟' },
  { value: 'reptile', label: 'Reptile', icon: '🦎' },
  { value: 'other', label: 'Other', icon: '🐾' },
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
    metadata?: CampaignContentMetadata | null
  }
}

function parseLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function lines(value?: string[] | null): string {
  return (value ?? []).join('\n')
}

function faqLines(value?: CampaignContentMetadata['faqItems']): string {
  return (value ?? []).map((item) => `${item.question} | ${item.answer}`).join('\n')
}

function parseFaqLines(value: string): NonNullable<CampaignContentMetadata['faqItems']> {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [question, ...answerParts] = line.split('|')
      return {
        question: question?.trim() ?? '',
        answer: answerParts.join('|').trim(),
      }
    })
    .filter((item) => item.question && item.answer)
}

export default function CampaignForm({ campaignId, initialValues }: CampaignFormProps) {
  const router = useRouter()
  const { mutate, loading, error } = useApiMutation<unknown, unknown>()
  const isEdit = !!campaignId

  const [form, setForm] = useState({
    title: initialValues?.title ?? '',
    slug: initialValues?.slug ?? '',
    description: initialValues?.description ?? '',
    campaignType: initialValues?.campaignType ?? ('vaccination' as CampaignType),
    startDate: initialValues?.startDate ?? '',
    endDate: initialValues?.endDate ?? '',
    registrationOpenAt: initialValues?.registrationOpenAt ?? '',
    registrationCloseAt: initialValues?.registrationCloseAt ?? '',
    basePriceBdt: initialValues?.basePriceBdt ?? '0',
    maxPetsPerBooking: initialValues?.maxPetsPerBooking ?? '5',
    isFeatured: initialValues?.isFeatured ?? false,
    allowedPetTypes: initialValues?.allowedPetTypes ?? ([] as string[]),
    shortSubtitle: initialValues?.metadata?.shortSubtitle ?? '',
    trustPointsText: lines(initialValues?.metadata?.trustPoints),
    organizerName: initialValues?.metadata?.organizerName ?? '',
    partnerNamesText: lines(initialValues?.metadata?.partnerNames),
    medicalSupervisionText: initialValues?.metadata?.medicalSupervisionText ?? '',
    policyItemsText: lines(initialValues?.metadata?.policyItems),
    eligibilityItemsText: lines(initialValues?.metadata?.eligibilityItems),
    whatToBringItemsText: lines(initialValues?.metadata?.whatToBringItems),
    supportPhone: initialValues?.metadata?.supportPhone ?? '',
    supportEmail: initialValues?.metadata?.supportEmail ?? '',
    supportWhatsApp: initialValues?.metadata?.supportWhatsApp ?? '',
    certificateInfo: initialValues?.metadata?.certificateInfo ?? '',
    faqItemsText: faqLines(initialValues?.metadata?.faqItems),
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function togglePetType(type: string) {
    setForm((f) => ({
      ...f,
      allowedPetTypes: f.allowedPetTypes.includes(type) ? f.allowedPetTypes.filter((t) => t !== type) : [...f.allowedPetTypes, type],
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
      metadata: {
        shortSubtitle: form.shortSubtitle || null,
        trustPoints: parseLines(form.trustPointsText),
        organizerName: form.organizerName || null,
        partnerNames: parseLines(form.partnerNamesText),
        medicalSupervisionText: form.medicalSupervisionText || null,
        policyItems: parseLines(form.policyItemsText),
        eligibilityItems: parseLines(form.eligibilityItemsText),
        whatToBringItems: parseLines(form.whatToBringItemsText),
        supportPhone: form.supportPhone || null,
        supportEmail: form.supportEmail || null,
        supportWhatsApp: form.supportWhatsApp || null,
        certificateInfo: form.certificateInfo || null,
        faqItems: parseFaqLines(form.faqItemsText),
      },
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
        breadcrumbs={[{ label: 'Campaign Mgmt' }, { label: 'Campaigns', href: '/campaigns' }, { label: isEdit ? 'Edit' : 'Create' }]}
      />

      {error && <Alert variant="danger">{(error as ApiError).message}</Alert>}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Title <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Campaign title" />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Slug</Form.Label>
                  <Form.Control
                    value={form.slug}
                    onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    placeholder="campaign-url-slug"
                  />
                  <Form.Text className="text-muted">URL identifier. Leave empty to auto-generate.</Form.Text>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>
                    Campaign Type <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select required value={form.campaignType} onChange={(e) => set('campaignType', e.target.value as CampaignType)}>
                    {CAMPAIGN_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    placeholder="Campaign description"
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Short Subtitle</Form.Label>
                  <Form.Control
                    value={form.shortSubtitle}
                    onChange={(e) => set('shortSubtitle', e.target.value)}
                    placeholder="Short supporting line below the campaign title"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Start Date <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control required type="datetime-local" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    End Date <span className="text-danger">*</span>
                  </Form.Label>
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
                      <Badge bg="success" className="ms-2">
                        {form.allowedPetTypes.length} selected
                      </Badge>
                    )}
                  </Form.Label>
                  <div className="d-flex flex-wrap gap-2 p-3 border rounded bg-light">
                    {ALL_PET_TYPES.map((pt) => {
                      const checked = form.allowedPetTypes.includes(pt.value)
                      return (
                        <button
                          key={pt.value}
                          type="button"
                          onClick={() => togglePetType(pt.value)}
                          className={`btn btn-sm d-flex align-items-center gap-1 ${checked ? 'btn-success' : 'btn-outline-secondary'}`}>
                          <span>{pt.icon}</span>
                          <span>{pt.label}</span>
                          {checked && <Icon icon="solar:check-circle-bold" className="ms-1" />}
                        </button>
                      )
                    })}
                  </div>
                  <Form.Text className="text-muted">
                    {form.allowedPetTypes.length === 0 ? (
                      <span className="text-danger fw-bold">Please select at least one allowed pet type.</span>
                    ) : (
                      `Only ${form.allowedPetTypes.map((v) => ALL_PET_TYPES.find((p) => p.value === v)?.label ?? v).join(', ')} will be accepted at registration.`
                    )}
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    Campaign Base Price / Registration Fee per Pet (BDT) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.basePriceBdt}
                    onChange={(e) => set('basePriceBdt', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Max Pets Per Booking</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="20"
                    value={form.maxPetsPerBooking}
                    onChange={(e) => set('maxPetsPerBooking', e.target.value)}
                  />
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

              <Col md={12}>
                <hr className="my-2" />
                <h5 className="mb-3">Campaign Detail Content</h5>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Organizer Name</Form.Label>
                  <Form.Control
                    value={form.organizerName}
                    onChange={(e) => set('organizerName', e.target.value)}
                    placeholder="Bangladesh Pet Association (BPA)"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Medical Supervision Text</Form.Label>
                  <Form.Control
                    value={form.medicalSupervisionText}
                    onChange={(e) => set('medicalSupervisionText', e.target.value)}
                    placeholder="Licensed veterinarians and campaign doctors supervise vaccinations."
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Support Phone</Form.Label>
                  <Form.Control value={form.supportPhone} onChange={(e) => set('supportPhone', e.target.value)} placeholder="01XXXXXXXXX" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Support Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={form.supportEmail}
                    onChange={(e) => set('supportEmail', e.target.value)}
                    placeholder="support@example.com"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Support WhatsApp</Form.Label>
                  <Form.Control value={form.supportWhatsApp} onChange={(e) => set('supportWhatsApp', e.target.value)} placeholder="8801XXXXXXXXX" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Certificate Info</Form.Label>
                  <Form.Control
                    value={form.certificateInfo}
                    onChange={(e) => set('certificateInfo', e.target.value)}
                    placeholder="QR-verified digital certificate issued after vaccination."
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Trust Points</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={form.trustPointsText}
                    onChange={(e) => set('trustPointsText', e.target.value)}
                    placeholder={'One item per line'}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Partner Names</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={form.partnerNamesText}
                    onChange={(e) => set('partnerNamesText', e.target.value)}
                    placeholder={'One partner per line'}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Policy Items</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    value={form.policyItemsText}
                    onChange={(e) => set('policyItemsText', e.target.value)}
                    placeholder={'One item per line'}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Eligibility Items</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    value={form.eligibilityItemsText}
                    onChange={(e) => set('eligibilityItemsText', e.target.value)}
                    placeholder={'One item per line'}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>What To Bring Items</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    value={form.whatToBringItemsText}
                    onChange={(e) => set('whatToBringItemsText', e.target.value)}
                    placeholder={'One item per line'}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>FAQ Items</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={form.faqItemsText}
                    onChange={(e) => set('faqItemsText', e.target.value)}
                    placeholder={'One FAQ per line: Question | Answer'}
                  />
                  <Form.Text className="text-muted">
                    Use the dedicated Campaign FAQs manager when you need sortable, bilingual FAQs. These metadata FAQs only fill gaps in the app when
                    no managed FAQs exist.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2 mt-4">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Saving…' : isEdit ? 'Update Campaign' : 'Create Campaign'}
              </Button>
              <Button variant="soft-secondary" onClick={() => router.push('/campaigns')}>
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
