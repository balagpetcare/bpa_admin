'use client'

import { useEffect, useState } from 'react'
import { Card, Button, Form, Row, Col } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import MediaPickerInput from '@/components/ui/MediaPickerInput'
import { useApiMutation } from '@/hooks/useApi'
import { transparencyReportsApi, type TransparencyReportPayload } from '@/lib/api/transparency-reports.api'
import type { ApiError } from '@/lib/api'
import type { MediaFile, TransparencyReport } from '@/types/bpa.types'

interface TransparencyFormProps {
  reportId?: string
  initialValues?: Partial<TransparencyReportPayload>
  initialCoverImageUrl?: string | null
}

const REPORT_TYPES = ['monthly', 'quarterly', 'annual', 'special']

export default function TransparencyForm({ reportId, initialValues, initialCoverImageUrl }: TransparencyFormProps) {
  const router = useRouter()
  const { mutate, loading, error } = useApiMutation<TransparencyReport, unknown>()
  const isEdit = !!reportId
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(initialCoverImageUrl ?? null)

  const [form, setForm] = useState({
    title: initialValues?.title ?? '',
    slug: initialValues?.slug ?? '',
    reportType: initialValues?.reportType ?? 'monthly',
    periodStart: initialValues?.periodStart ?? '',
    periodEnd: initialValues?.periodEnd ?? '',
    totalCollectedBdt: String(initialValues?.totalCollectedBdt ?? '0'),
    totalSpentBdt: String(initialValues?.totalSpentBdt ?? '0'),
    balanceBdt: String(initialValues?.balanceBdt ?? '0'),
    summaryMd: initialValues?.summaryMd ?? '',
    bodyMd: initialValues?.bodyMd ?? '',
    attachmentUrl: initialValues?.attachmentUrl ?? '',
    coverImageId: initialValues?.coverImageId ?? null,
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  useEffect(() => {
    const collected = Number(form.totalCollectedBdt) || 0
    const spent = Number(form.totalSpentBdt) || 0
    setForm((f) => ({ ...f, balanceBdt: String(Number((collected - spent).toFixed(2))) }))
  }, [form.totalCollectedBdt, form.totalSpentBdt])

  function handleCoverChange(fileId: string | null, file: MediaFile | null) {
    set('coverImageId', fileId)
    setCoverPreviewUrl(file?.url ?? null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: TransparencyReportPayload = {
      title: form.title,
      slug: form.slug,
      reportType: form.reportType,
      periodStart: form.periodStart,
      periodEnd: form.periodEnd,
      totalCollectedBdt: Number(form.totalCollectedBdt),
      totalSpentBdt: Number(form.totalSpentBdt),
      balanceBdt: Number(form.balanceBdt),
      summaryMd: form.summaryMd || undefined,
      bodyMd: form.bodyMd || undefined,
      attachmentUrl: form.attachmentUrl || undefined,
      coverImageId: form.coverImageId || null,
    }
    const result = await mutate(() => (isEdit ? transparencyReportsApi.update(reportId, payload) : transparencyReportsApi.create(payload)), undefined)
    if (result) router.push('/community-care/transparency')
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title={isEdit ? 'Edit Report' : 'New Report'}
        breadcrumbs={[
          { label: 'Community Care Fund' },
          { label: 'Transparency', href: '/community-care/transparency' },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label>
                    Title <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control value={form.title} onChange={(e) => set('title', e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Report Type</Form.Label>
                  <Form.Select value={form.reportType} onChange={(e) => set('reportType', e.target.value)}>
                    {REPORT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Slug <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control value={form.slug} onChange={(e) => set('slug', e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>
                    Period Start <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control type="date" value={form.periodStart} onChange={(e) => set('periodStart', e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>
                    Period End <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control type="date" value={form.periodEnd} onChange={(e) => set('periodEnd', e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Total Collected (BDT)</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.totalCollectedBdt}
                    onChange={(e) => set('totalCollectedBdt', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Total Spent (BDT)</Form.Label>
                  <Form.Control type="number" min={0} step="0.01" value={form.totalSpentBdt} onChange={(e) => set('totalSpentBdt', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Balance (BDT)</Form.Label>
                  <Form.Control type="number" step="0.01" value={form.balanceBdt} readOnly />
                  <Form.Text className="text-muted">Calculated as collected minus published/report spending.</Form.Text>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Summary (Markdown)</Form.Label>
                  <Form.Control as="textarea" rows={5} value={form.summaryMd} onChange={(e) => set('summaryMd', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Body / Details (Markdown)</Form.Label>
                  <Form.Control as="textarea" rows={8} value={form.bodyMd} onChange={(e) => set('bodyMd', e.target.value)} />
                  <Form.Text className="text-muted">
                    Use this for report notes, spending categories, and context. This is published as fund reporting only.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <MediaPickerInput
                  label="Report Cover / Media"
                  value={form.coverImageId}
                  previewUrl={coverPreviewUrl}
                  onChange={handleCoverChange}
                  mimeTypePrefix=""
                  accept="image/*,application/pdf"
                  emptyLabel="Select media or file"
                  uploadLabel="Upload media/file"
                  helpText="Optional media reference from the existing media library."
                />
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Downloadable File URL</Form.Label>
                  <Form.Control
                    type="url"
                    value={form.attachmentUrl}
                    onChange={(e) => set('attachmentUrl', e.target.value)}
                    placeholder="https://..."
                  />
                  <Form.Text className="text-muted">
                    Use this for a public PDF or file link when the report has a separate downloadable attachment.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex gap-2 mt-4">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm me-2" />}
                <Icon icon="solar:check-circle-bold" className="me-1" />
                {isEdit ? 'Save Changes' : 'Create Report'}
              </Button>
              <Button variant="outline-secondary" onClick={() => router.push('/community-care/transparency')}>
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
