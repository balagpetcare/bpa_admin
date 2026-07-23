'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, Row, Col, Form, Button, Tabs, Tab, Spinner, Alert, Badge, Modal } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import MediaPickerInput from '@/components/ui/MediaPickerInput'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { ApiError } from '@/lib/api'
import {
  pushNotificationsApi,
  type CreateCampaignDto,
  type NotificationCategory,
  type NotificationPriority,
  type NotificationChannel,
  type AudienceType,
  type AudienceFilter,
  type NotificationCampaign,
  type PreviewResult,
} from '@/lib/api/push-notifications.api'
import type { MediaFile } from '@/types/bpa.types'
import AudienceFilterBuilder from '../components/AudienceFilterBuilder'
import CampaignStatusBadge from '../components/CampaignStatusBadge'
import { isValidDeepLink, DEEP_LINK_EXAMPLES } from '../components/deepLink'

const CATEGORIES: NotificationCategory[] = [
  'pet_health',
  'campaign',
  'video',
  'post',
  'membership',
  'booking',
  'payment',
  'certificate',
  'account',
  'emergency',
  'promotional',
]
const PRIORITIES: NotificationPriority[] = ['low', 'normal', 'high', 'critical']

type FormState = {
  title: string
  titleBn: string
  body: string
  bodyBn: string
  imageUrl: string
  imageFileId: string | null
  deepLink: string
  category: NotificationCategory
  priority: NotificationPriority
  channel: NotificationChannel
  audienceType: AudienceType
  audienceFilter: AudienceFilter
  expiresAt: string
}

const EMPTY_FORM: FormState = {
  title: '',
  titleBn: '',
  body: '',
  bodyBn: '',
  imageUrl: '',
  imageFileId: null,
  deepLink: '',
  category: 'campaign',
  priority: 'normal',
  channel: 'push_and_in_app',
  audienceType: 'all_users',
  audienceFilter: {},
  expiresAt: '',
}

function toDto(f: FormState): CreateCampaignDto {
  return {
    title: f.title,
    titleBn: f.titleBn || undefined,
    body: f.body,
    bodyBn: f.bodyBn || undefined,
    imageUrl: f.imageUrl || undefined,
    deepLink: f.deepLink || undefined,
    category: f.category,
    priority: f.priority,
    channel: f.channel,
    audienceType: f.audienceType,
    audienceFilter: f.audienceType === 'segment' ? f.audienceFilter : undefined,
    expiresAt: f.expiresAt ? new Date(f.expiresAt).toISOString() : undefined,
  }
}

function ComposeInner() {
  const router = useRouter()
  const params = useSearchParams()
  const campaignId = params.get('id')
  const { can } = usePermission()

  const canCreate = can('notifications:create')
  const canUpdate = can('notifications:update')
  const canApprove = can('notifications:approve')
  const canSend = can('notifications:send')
  const canEmergency = can('notifications:emergency')

  const { data: existing, loading: loadingExisting, error: loadError, refetch } = useApi(
    campaignId ? () => pushNotificationsApi.getCampaign(campaignId) : null,
    [campaignId],
  )

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [langTab, setLangTab] = useState<'en' | 'bn'>('en')
  const [deepLinkTouched, setDeepLinkTouched] = useState(false)

  const [estimate, setEstimate] = useState<number | null>(null)
  const [estimating, setEstimating] = useState(false)
  const [estimateError, setEstimateError] = useState<string | null>(null)

  const [preview, setPreview] = useState<PreviewResult | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const [testDeviceId, setTestDeviceId] = useState('')
  const [testResult, setTestResult] = useState<{ sent: boolean; error?: string } | null>(null)

  const [confirmAction, setConfirmAction] = useState<null | 'send-now' | 'schedule'>(null)
  const [scheduleAt, setScheduleAt] = useState('')
  const [actionResult, setActionResult] = useState<string | null>(null)

  const saveMutation = useApiMutation<NotificationCampaign, CreateCampaignDto>()
  const actionMutation = useApiMutation<NotificationCampaign, void>()

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title,
        titleBn: existing.titleBn ?? '',
        body: existing.body,
        bodyBn: existing.bodyBn ?? '',
        imageUrl: existing.imageUrl ?? '',
        imageFileId: null,
        deepLink: existing.deepLink ?? '',
        category: existing.category,
        priority: existing.priority,
        channel: existing.channel,
        audienceType: existing.audienceType,
        audienceFilter: existing.audienceFilter ?? {},
        expiresAt: existing.expiresAt ? existing.expiresAt.slice(0, 16) : '',
      })
    }
  }, [existing])

  const campaign = existing ?? null
  const readOnly = campaign !== null && campaign.status !== 'draft'

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => setForm((f) => ({ ...f, [key]: val }))

  const handleSaveDraft = async () => {
    if (campaignId && campaign) {
      const result = await saveMutation.mutate((dto) => pushNotificationsApi.updateCampaign(campaignId, dto), toDto(form))
      if (result) refetch()
    } else {
      const result = await saveMutation.mutate((dto) => pushNotificationsApi.createCampaign(dto), toDto(form))
      if (result) router.replace(`/bpa-app-control/push-notifications/compose?id=${result.id}`)
    }
  }

  const runEstimate = useCallback(async () => {
    if (!campaignId) return
    setEstimating(true)
    setEstimateError(null)
    try {
      const res = await pushNotificationsApi.estimateAudience(campaignId)
      setEstimate(res.estimatedReach)
    } catch (err) {
      setEstimate(null)
      setEstimateError(err instanceof ApiError ? err.message : 'Failed to estimate audience')
    } finally {
      setEstimating(false)
    }
  }, [campaignId])

  // Debounced re-estimate whenever the saved campaign's audience changes.
  useEffect(() => {
    if (!campaignId || !campaign) return
    const t = setTimeout(() => runEstimate(), 500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, campaign?.audienceType, JSON.stringify(campaign?.audienceFilter)])

  const runPreview = async () => {
    if (!campaignId) return
    setPreviewLoading(true)
    setPreviewError(null)
    try {
      const res = await pushNotificationsApi.preview(campaignId, langTab)
      setPreview(res)
    } catch (err) {
      setPreview(null)
      setPreviewError(err instanceof ApiError ? err.message : 'Failed to render preview')
    } finally {
      setPreviewLoading(false)
    }
  }

  const runTestSend = async () => {
    if (!campaignId || !testDeviceId.trim()) return
    try {
      const res = await pushNotificationsApi.testSend(campaignId, testDeviceId.trim())
      setTestResult(res)
    } catch (err) {
      setTestResult({ sent: false, error: err instanceof ApiError ? err.message : 'Test send failed' })
    }
  }

  const handleSubmitForApproval = async () => {
    if (!campaignId) return
    const result = await actionMutation.mutate(() => pushNotificationsApi.approve(campaignId), undefined)
    if (result) {
      setActionResult('Submitted for approval.')
      refetch()
    }
  }

  const handleApprove = async () => {
    if (!campaignId) return
    const result = await actionMutation.mutate(() => pushNotificationsApi.approve(campaignId), undefined)
    if (result) {
      setActionResult('Campaign approved.')
      refetch()
    }
  }

  const handleConfirmSend = async () => {
    if (!campaignId) return
    if (confirmAction === 'send-now') {
      const result = await actionMutation.mutate(() => pushNotificationsApi.sendNow(campaignId), undefined)
      if (result) setActionResult(`Send triggered. Status: ${result.status}. Targeted: ${result.targetedCount}, Attempted: ${result.attemptedCount}.`)
    } else if (confirmAction === 'schedule' && scheduleAt) {
      const result = await actionMutation.mutate(() => pushNotificationsApi.schedule(campaignId, new Date(scheduleAt).toISOString()), undefined)
      if (result) setActionResult(`Scheduled for ${new Date(result.scheduledAt ?? scheduleAt).toLocaleString()}.`)
    }
    setConfirmAction(null)
    refetch()
  }

  const deepLinkValid = isValidDeepLink(form.deepLink)
  const isApproved = !!campaign?.approvedAt

  if (campaignId && loadingExisting) {
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={campaignId ? 'Edit Campaign' : 'Compose Notification'}
        breadcrumbs={[
          { label: 'BPA App Control', href: '/bpa-app-control' },
          { label: 'Push Notifications', href: '/bpa-app-control/push-notifications/dashboard' },
          { label: campaignId ? 'Edit' : 'Compose' },
        ]}
        action={campaign ? <CampaignStatusBadge status={campaign.status} /> : undefined}
      />

      <ApiErrorAlert error={loadError ?? saveMutation.error ?? actionMutation.error} />
      {actionResult && (
        <Alert variant="success" dismissible onClose={() => setActionResult(null)}>
          {actionResult}
        </Alert>
      )}

      {readOnly && (
        <Alert variant="info">
          This campaign is <strong>{campaign?.status}</strong> and can no longer be edited. You may still preview, view analytics, or (if
          scheduled) cancel it from the Scheduled tab.
        </Alert>
      )}

      <Row className="g-3">
        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-transparent">
              <strong>Content</strong>
            </Card.Header>
            <Card.Body>
              <Tabs activeKey={langTab} onSelect={(k) => setLangTab((k as 'en' | 'bn') ?? 'en')} className="mb-3">
                <Tab eventKey="en" title="English">
                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      value={form.title}
                      disabled={readOnly}
                      onChange={(e) => set('title', e.target.value)}
                      maxLength={120}
                      placeholder="Notification title"
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Body</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={form.body}
                      disabled={readOnly}
                      onChange={(e) => set('body', e.target.value)}
                      maxLength={500}
                      placeholder="Notification body"
                    />
                  </Form.Group>
                </Tab>
                <Tab eventKey="bn" title="বাংলা">
                  <Form.Group className="mb-3">
                    <Form.Label>Title (Bangla)</Form.Label>
                    <Form.Control value={form.titleBn} disabled={readOnly} onChange={(e) => set('titleBn', e.target.value)} maxLength={120} />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Body (Bangla)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={form.bodyBn}
                      disabled={readOnly}
                      onChange={(e) => set('bodyBn', e.target.value)}
                      maxLength={500}
                    />
                  </Form.Group>
                </Tab>
              </Tabs>

              <Form.Group className="mb-3">
                <MediaPickerInput
                  label="Image (optional)"
                  value={form.imageFileId}
                  previewUrl={form.imageUrl || null}
                  onChange={(fileId, file: MediaFile | null) => {
                    set('imageFileId', fileId)
                    set('imageUrl', file?.url ?? '')
                  }}
                  disabled={readOnly}
                  helpText="Shown as the large image in the notification, where the platform supports it."
                />
              </Form.Group>

              <Form.Group className="mb-1">
                <Form.Label>Deep Link (optional)</Form.Label>
                <Form.Control
                  value={form.deepLink}
                  disabled={readOnly}
                  onChange={(e) => {
                    set('deepLink', e.target.value)
                    setDeepLinkTouched(true)
                  }}
                  isInvalid={deepLinkTouched && !deepLinkValid}
                  placeholder="bpa://campaigns/{id}"
                />
                <Form.Control.Feedback type="invalid">
                  Must match one of the supported patterns, e.g. {DEEP_LINK_EXAMPLES[2]}
                </Form.Control.Feedback>
              </Form.Group>
              <div className="small text-muted mb-3">Supported patterns: {DEEP_LINK_EXAMPLES.join(', ')}</div>

              <Row className="g-3">
                <Col md={4}>
                  <Form.Label>Category</Form.Label>
                  <Form.Select disabled={readOnly} value={form.category} onChange={(e) => set('category', e.target.value as NotificationCategory)}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.replace('_', ' ')}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label>Priority</Form.Label>
                  <Form.Select disabled={readOnly} value={form.priority} onChange={(e) => set('priority', e.target.value as NotificationPriority)}>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label>Channel</Form.Label>
                  <Form.Select disabled={readOnly} value={form.channel} onChange={(e) => set('channel', e.target.value as NotificationChannel)}>
                    <option value="push">Push only</option>
                    <option value="in_app">In-app only</option>
                    <option value="push_and_in_app">Push + In-app</option>
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label>Expires At (optional)</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    disabled={readOnly}
                    value={form.expiresAt}
                    onChange={(e) => set('expiresAt', e.target.value)}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
              <strong>Audience</strong>
              {campaignId && (
                <div className="small">
                  {estimating ? (
                    <span className="text-muted">
                      <Spinner size="sm" className="me-1" />
                      Estimating reach...
                    </span>
                  ) : estimateError ? (
                    <span className="text-danger">{estimateError}</span>
                  ) : estimate !== null ? (
                    <Badge bg="primary-subtle" text="primary">
                      Estimated reach: {estimate.toLocaleString()}
                    </Badge>
                  ) : (
                    <Button size="sm" variant="outline-primary" onClick={runEstimate}>
                      Estimate reach
                    </Button>
                  )}
                </div>
              )}
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Check
                  inline
                  type="radio"
                  name="audienceType"
                  id="audience-all"
                  label="All users"
                  disabled={readOnly}
                  checked={form.audienceType === 'all_users'}
                  onChange={() => set('audienceType', 'all_users')}
                />
                <Form.Check
                  inline
                  type="radio"
                  name="audienceType"
                  id="audience-segment"
                  label="Segment"
                  disabled={readOnly}
                  checked={form.audienceType === 'segment'}
                  onChange={() => set('audienceType', 'segment')}
                />
              </Form.Group>
              {form.audienceType === 'segment' && (
                <AudienceFilterBuilder value={form.audienceFilter} onChange={(v) => set('audienceFilter', v)} disabled={readOnly} />
              )}
              {!campaignId && <div className="text-muted small">Save as draft to see a live recipient estimate.</div>}
            </Card.Body>
          </Card>

          {!readOnly && (
            <div className="d-flex gap-2 mb-3">
              {(campaignId ? canUpdate : canCreate) && (
                <Button
                  variant="outline-primary"
                  disabled={saveMutation.loading || !form.title || !form.body || (deepLinkTouched && !deepLinkValid)}
                  onClick={handleSaveDraft}>
                  {saveMutation.loading ? <Spinner size="sm" className="me-1" /> : <Icon icon="solar:diskette-bold-duotone" className="me-1" />}
                  {campaignId ? 'Save Draft' : 'Create Draft'}
                </Button>
              )}
            </div>
          )}
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-transparent">
              <strong>Preview</strong>
            </Card.Header>
            <Card.Body>
              {!campaignId ? (
                <div className="text-muted small">Save as draft to render an Android/iOS preview.</div>
              ) : (
                <>
                  <Button size="sm" variant="outline-secondary" className="mb-3" disabled={previewLoading} onClick={runPreview}>
                    {previewLoading ? <Spinner size="sm" className="me-1" /> : <Icon icon="solar:eye-bold-duotone" className="me-1" />}
                    Render Preview ({langTab === 'bn' ? 'বাংলা' : 'English'})
                  </Button>
                  {previewError && <Alert variant="danger">{previewError}</Alert>}
                  {preview && (
                    <div className="d-flex flex-column gap-2">
                      {(['android', 'ios'] as const).map((platform) => (
                        <div key={platform} className="border rounded-3 p-2">
                          <div className="small fw-semibold text-capitalize mb-1">{platform}</div>
                          {preview[platform].imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={preview[platform].imageUrl ?? ''} alt="" className="w-100 rounded mb-1" style={{ maxHeight: 100, objectFit: 'cover' }} />
                          )}
                          <div className="fw-semibold small">{preview[platform].title}</div>
                          <div className="small text-muted">{preview[platform].body}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-transparent">
              <strong>Send to Test Device</strong>
            </Card.Header>
            <Card.Body>
              {!campaignId ? (
                <div className="text-muted small">Save as draft first.</div>
              ) : (
                <>
                  <Form.Control
                    className="mb-2"
                    placeholder="Installation ID"
                    value={testDeviceId}
                    onChange={(e) => setTestDeviceId(e.target.value)}
                  />
                  <Button size="sm" variant="outline-secondary" disabled={!testDeviceId.trim()} onClick={runTestSend}>
                    Send test
                  </Button>
                  {testResult && (
                    <Alert variant={testResult.sent ? 'success' : 'danger'} className="mt-2 mb-0 py-2 small">
                      {testResult.sent ? 'Test notification sent.' : testResult.error ?? 'Failed to send test notification.'}
                    </Alert>
                  )}
                </>
              )}
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent">
              <strong>Approval & Sending</strong>
            </Card.Header>
            <Card.Body>
              {!campaignId ? (
                <div className="text-muted small">Save as draft first.</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  <div className="small">
                    Approval: {isApproved ? <Badge bg="success">Approved</Badge> : <Badge bg="secondary">Not approved</Badge>}
                  </div>

                  {!isApproved && canApprove && (
                    <Button size="sm" variant="outline-success" disabled={actionMutation.loading} onClick={handleApprove}>
                      Approve Campaign
                    </Button>
                  )}
                  {!isApproved && !canApprove && (
                    <Button size="sm" variant="outline-warning" disabled={actionMutation.loading} onClick={handleSubmitForApproval}>
                      Submit for Approval
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="primary"
                    disabled={
                      actionMutation.loading ||
                      !canSend ||
                      !(isApproved || (campaign?.category === 'emergency' && canEmergency)) ||
                      campaign?.status !== 'draft'
                    }
                    title={!canSend ? 'Requires notifications:send permission' : !isApproved && !canEmergency ? 'Requires approval first' : undefined}
                    onClick={() => setConfirmAction('send-now')}>
                    Send Now
                  </Button>

                  <div>
                    <Form.Control
                      type="datetime-local"
                      size="sm"
                      className="mb-1"
                      value={scheduleAt}
                      onChange={(e) => setScheduleAt(e.target.value)}
                      disabled={!canSend || campaign?.status !== 'draft'}
                    />
                    <Button
                      size="sm"
                      variant="outline-primary"
                      disabled={actionMutation.loading || !canSend || !scheduleAt || campaign?.status !== 'draft'}
                      title={!canSend ? 'Requires notifications:send permission' : undefined}
                      className="w-100"
                      onClick={() => setConfirmAction('schedule')}>
                      Schedule
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={confirmAction !== null} onHide={() => setConfirmAction(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{confirmAction === 'send-now' ? 'Send notification now?' : 'Schedule notification?'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">
            This will {confirmAction === 'send-now' ? 'immediately push' : 'schedule'} <strong>{form.title}</strong> to{' '}
            {form.audienceType === 'all_users' ? 'all users' : `an estimated ${estimate?.toLocaleString() ?? '(unestimated)'} recipients`}.
          </p>
          {confirmAction === 'schedule' && <p className="mb-0 small text-muted">Scheduled for: {scheduleAt ? new Date(scheduleAt).toLocaleString() : '—'}</p>}
          <p className="mb-0 small text-danger">This action sends real push notifications and cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setConfirmAction(null)}>
            Cancel
          </Button>
          <Button variant="primary" disabled={actionMutation.loading} onClick={handleConfirmSend}>
            {actionMutation.loading ? <Spinner size="sm" /> : 'Confirm'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default function ComposePage() {
  return (
    <Suspense fallback={<div className="text-center py-5"><Spinner /></div>}>
      <ComposeInner />
    </Suspense>
  )
}
