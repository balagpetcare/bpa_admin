'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, Row, Col, Button, Form, Badge, Alert } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi, useApiMutation } from '@/hooks/useApi'
import {
  getPageSettings as getDonationPageSettings,
  updatePageSettings as updateDonationPageSettings,
  type DonationPageSettings,
} from '@/lib/api/donations.api'
import type { ApiError } from '@/lib/api'

type FaqItem = { questionEn: string; questionBn: string; answerEn: string; answerBn: string }

function parseFaqs(raw: string | undefined): FaqItem[] {
  try {
    return JSON.parse(raw ?? '[]')
  } catch {
    return []
  }
}

export default function DonationCmsContent() {
  const fn = useCallback(() => getDonationPageSettings(), [])
  const { data, loading, error, refetch } = useApi(fn, [])
  const { mutate, loading: saving, error: saveError } = useApiMutation<DonationPageSettings, unknown>()
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState<Partial<DonationPageSettings>>({})
  const [faqs, setFaqs] = useState<FaqItem[]>([])

  useEffect(() => {
    if (data) {
      setForm(data)
      setFaqs(parseFaqs(typeof data.faqJson === 'string' ? data.faqJson : JSON.stringify(data.faqJson ?? [])))
    }
  }, [data])

  function set<K extends keyof DonationPageSettings>(key: K, value: any) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function addFaq() {
    setFaqs((f) => [...f, { questionEn: '', questionBn: '', answerEn: '', answerBn: '' }])
  }

  function updateFaq(i: number, field: keyof FaqItem, value: string) {
    setFaqs((f) => f.map((faq, idx) => (idx === i ? { ...faq, [field]: value } : faq)))
  }

  function removeFaq(i: number) {
    setFaqs((f) => f.filter((_, idx) => idx !== i))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const payload = { ...form, faqJson: JSON.stringify(faqs) }
    const result = await mutate(() => updateDonationPageSettings(payload), undefined)
    if (result) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      refetch()
    }
  }

  return (
    <div className="container-fluid">
      <PageHeader title="Donation Page CMS" breadcrumbs={[{ label: 'Donations', href: '/donations' }, { label: 'Page CMS' }]} />
      <ApiErrorAlert error={(error || saveError) as ApiError | null} />
      {saved && (
        <Alert variant="success" className="py-2">
          <Icon icon="solar:check-circle-bold" className="me-2" />
          Settings saved successfully.
        </Alert>
      )}

      <LoadingOverlay loading={loading}>
        <Form onSubmit={handleSave}>
          {/* Hero Section */}
          <Card className="mb-4" id="hero">
            <Card.Header>
              <h6 className="mb-0">Hero Section</h6>
            </Card.Header>
            <Card.Body className="d-flex flex-column gap-3">
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Hero Title (English)</Form.Label>
                    <Form.Control value={form.heroTitleEn ?? ''} onChange={(e) => set('heroTitleEn', e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Hero Title (Bangla)</Form.Label>
                    <Form.Control value={form.heroTitleBn ?? ''} onChange={(e) => set('heroTitleBn', e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Hero Subtitle (English)</Form.Label>
                    <Form.Control as="textarea" rows={2} value={form.heroSubtitleEn ?? ''} onChange={(e) => set('heroSubtitleEn', e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Hero Subtitle (Bangla)</Form.Label>
                    <Form.Control as="textarea" rows={2} value={form.heroSubtitleBn ?? ''} onChange={(e) => set('heroSubtitleBn', e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Hero Image URL</Form.Label>
                    <Form.Control
                      type="url"
                      value={form.heroImageUrl ?? ''}
                      onChange={(e) => set('heroImageUrl', e.target.value)}
                      placeholder="https://..."
                    />
                    {form.heroImageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.heroImageUrl} alt="hero preview" className="mt-2 rounded w-100" style={{ maxHeight: 140, objectFit: 'cover' }} />
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Hero Video URL (optional)</Form.Label>
                    <Form.Control
                      type="url"
                      value={form.heroVideoUrl ?? ''}
                      onChange={(e) => set('heroVideoUrl', e.target.value)}
                      placeholder="https://youtube.com/..."
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Goal Amount (BDT)</Form.Label>
                    <Form.Control type="number" min={0} value={form.goalAmount ?? ''} onChange={(e) => set('goalAmount', e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* CTA Texts */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">CTA Texts</h6>
            </Card.Header>
            <Card.Body className="d-flex flex-column gap-3">
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Primary CTA (English)</Form.Label>
                    <Form.Control
                      value={form.primaryCtaTextEn ?? ''}
                      onChange={(e) => set('primaryCtaTextEn', e.target.value)}
                      placeholder="Donate Now"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Secondary CTA (English)</Form.Label>
                    <Form.Control
                      value={form.secondaryCtaTextEn ?? ''}
                      onChange={(e) => set('secondaryCtaTextEn', e.target.value)}
                      placeholder="Learn How It Works"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group>
                <Form.Label>Transparency Text (English)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={form.transparencyTextEn ?? ''}
                  onChange={(e) => set('transparencyTextEn', e.target.value)}
                  placeholder="100% of your donation goes directly to animal care..."
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Section Toggles */}
          <Card className="mb-4" id="settings">
            <Card.Header>
              <h6 className="mb-0">Section Visibility</h6>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                {(
                  [
                    ['showPurposeCards', 'Show Purposes Section'],
                    ['showCampaigns', 'Show Active Campaigns'],
                    ['showDonorWall', 'Show Donor Wall'],
                    ['showImpactStories', 'Show Impact Stories'],
                    ['showTransparency', 'Show Transparency Summary'],
                    ['showQrSection', 'Show QR Code'],
                  ] as const
                ).map(([key, label]) => (
                  <Col xs={12} sm={6} md={4} key={key}>
                    <Form.Check
                      type="switch"
                      label={label}
                      checked={(form as any)[key] ?? true}
                      onChange={(e) => set(key as any, e.target.checked)}
                    />
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          {/* SEO */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">SEO</h6>
            </Card.Header>
            <Card.Body className="d-flex flex-column gap-3">
              <Form.Group>
                <Form.Label>SEO Title (English)</Form.Label>
                <Form.Control
                  value={form.seoTitleEn ?? ''}
                  onChange={(e) => set('seoTitleEn', e.target.value)}
                  placeholder="Donate to BPA — Help Street Animals"
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>SEO Description (English)</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.seoDescriptionEn ?? ''} onChange={(e) => set('seoDescriptionEn', e.target.value)} />
                <Form.Text className="text-muted">{(form.seoDescriptionEn ?? '').length}/160 characters</Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>

          {/* FAQ Editor */}
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">FAQ Section</h6>
              <Button type="button" variant="outline-primary" size="sm" onClick={addFaq}>
                <Icon icon="solar:add-circle-bold" className="me-1" />
                Add Question
              </Button>
            </Card.Header>
            <Card.Body className="d-flex flex-column gap-4">
              {faqs.length === 0 && (
                <p className="text-muted text-center small py-3">No FAQ items yet. Click &ldquo;Add Question&rdquo; to add one.</p>
              )}
              {faqs.map((faq, i) => (
                <div key={i} className="border rounded p-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Badge bg="secondary-subtle" text="secondary">
                      FAQ #{i + 1}
                    </Badge>
                    <Button type="button" variant="soft-danger" size="sm" onClick={() => removeFaq(i)}>
                      <Icon icon="solar:trash-bin-trash-bold" />
                    </Button>
                  </div>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small">Question (EN)</Form.Label>
                        <Form.Control size="sm" value={faq.questionEn} onChange={(e) => updateFaq(i, 'questionEn', e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small">Question (BN)</Form.Label>
                        <Form.Control size="sm" value={faq.questionBn} onChange={(e) => updateFaq(i, 'questionBn', e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small">Answer (EN)</Form.Label>
                        <Form.Control
                          as="textarea"
                          size="sm"
                          rows={2}
                          value={faq.answerEn}
                          onChange={(e) => updateFaq(i, 'answerEn', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small">Answer (BN)</Form.Label>
                        <Form.Control
                          as="textarea"
                          size="sm"
                          rows={2}
                          value={faq.answerBn}
                          onChange={(e) => updateFaq(i, 'answerBn', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              ))}
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-end gap-2 mb-4">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" />
                  Saving…
                </>
              ) : (
                <>
                  <Icon icon="solar:diskette-bold" className="me-1" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </Form>
      </LoadingOverlay>
    </div>
  )
}
