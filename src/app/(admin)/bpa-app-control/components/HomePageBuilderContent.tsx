'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Badge, Button, Card, Col, Form, InputGroup, Modal, Row } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import EmptyState from '@/components/ui/EmptyState'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import MediaPickerInput from '@/components/ui/MediaPickerInput'
import StatusBadge from '@/components/ui/StatusBadge'
import { confirmDialog } from '@/components/ui/ConfirmDialog'
import { usePermission } from '@/hooks/usePermission'
import type { ApiError } from '@/lib/api'
import {
  APP_CONTROL_PAGE_OPTIONS,
  APP_HOME_SECTION_OPTIONS,
  appControlApi,
  type AppControlDestinationType,
  type AppControlRecord,
  type AppControlTargetAudience,
  type AppHomeSectionType,
} from '@/lib/api/app-control.api'
import { campaignsApi } from '@/lib/api/campaigns.api'

type FormState = {
  sectionType: AppHomeSectionType | ''
  subtitle: string
  description: string
  imageUrl: string
  mobileImageUrl: string
  ctaText: string
  destinationType: AppControlDestinationType
  destinationValue: string
  isActive: boolean
  targetAudience: AppControlTargetAudience
}

const DEFAULT_FORM: FormState = {
  sectionType: '',
  subtitle: '',
  description: '',
  imageUrl: '',
  mobileImageUrl: '',
  ctaText: '',
  destinationType: 'NONE',
  destinationValue: '',
  isActive: true,
  targetAudience: 'all',
}

const DESTINATION_OPTIONS: Array<{ value: AppControlDestinationType; label: string }> = [
  { value: 'NONE', label: 'None' },
  { value: 'CAMPAIGN', label: 'Campaign' },
  { value: 'MEMBERSHIP', label: 'Membership' },
  { value: 'DONATION', label: 'Donation' },
  { value: 'PET_CENSUS', label: 'Pet Census' },
  { value: 'SERVICE', label: 'Service' },
  { value: 'INTERNAL_PAGE', label: 'Internal Page' },
  { value: 'EXTERNAL_URL', label: 'External URL' },
]

const TARGET_AUDIENCE_OPTIONS: Array<{ value: AppControlTargetAudience; label: string }> = [
  { value: 'all', label: 'All Users' },
  { value: 'guest', label: 'Guests' },
  { value: 'member', label: 'Members' },
  { value: 'donor', label: 'Donors' },
  { value: 'volunteer', label: 'Volunteers' },
  { value: 'staff', label: 'Staff' },
]

function getSectionMeta(type: string | null | undefined) {
  return APP_HOME_SECTION_OPTIONS.find((option) => option.value === type) ?? null
}

function getInitialForm(record?: AppControlRecord | null): FormState {
  if (!record) return DEFAULT_FORM
  return {
    sectionType: (record.title as AppHomeSectionType) ?? '',
    subtitle: record.subtitle ?? '',
    description: record.description ?? '',
    imageUrl: record.imageUrl ?? '',
    mobileImageUrl: record.mobileImageUrl ?? '',
    ctaText: record.ctaText ?? '',
    destinationType: record.destinationType ?? 'NONE',
    destinationValue: record.destinationValue ?? '',
    isActive: record.isActive ?? true,
    targetAudience: record.targetAudience ?? 'all',
  }
}

function destinationValueLabel(type: AppControlDestinationType) {
  switch (type) {
    case 'CAMPAIGN':
      return 'Campaign'
    case 'INTERNAL_PAGE':
      return 'App Page'
    case 'EXTERNAL_URL':
      return 'External URL'
    case 'MEMBERSHIP':
      return 'Membership Target'
    case 'DONATION':
      return 'Donation Target'
    case 'PET_CENSUS':
      return 'Pet Census Target'
    case 'SERVICE':
      return 'Service Target'
    default:
      return 'Destination'
  }
}

export default function HomePageBuilderContent() {
  const { permissions, isSuperAdmin } = usePermission()
  const canManage = isSuperAdmin || permissions.includes('app_control:manage')
  const [records, setRecords] = useState<AppControlRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<AppControlRecord | null>(null)
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [campaignOptions, setCampaignOptions] = useState<Array<{ id: string; title: string; slug?: string | null }>>([])

  const fetchSections = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await appControlApi.list<AppControlRecord>('home-sections', { page: 1, limit: 100 })
      setRecords((response.data ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder))
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  useEffect(() => {
    campaignsApi
      .list({ page: 1, limit: 100 })
      .then((response: any) => {
        const rows = Array.isArray(response) ? response : (response?.data ?? [])
        setCampaignOptions(rows.map((row: any) => ({ id: row.id, title: row.title ?? row.name ?? row.slug ?? row.id, slug: row.slug })))
      })
      .catch(() => {})
  }, [])

  const sectionCards = useMemo(() => records.slice().sort((a, b) => a.sortOrder - b.sortOrder), [records])

  const usedSectionTypes = useMemo(() => new Set(sectionCards.map((record) => record.title).filter(Boolean)), [sectionCards])

  const availableSectionTypes = useMemo(() => APP_HOME_SECTION_OPTIONS.filter((option) => !usedSectionTypes.has(option.value)), [usedSectionTypes])

  const activePreviewSections = useMemo(() => sectionCards.filter((record) => record.isActive && record.status !== 'archived'), [sectionCards])

  const openCreate = () => {
    setEditing(null)
    setForm(DEFAULT_FORM)
    setFormError(null)
    setShowModal(true)
  }

  const openEdit = (record: AppControlRecord) => {
    setEditing(record)
    setForm(getInitialForm(record))
    setFormError(null)
    setShowModal(true)
  }

  const closeModal = () => {
    if (saving) return
    setShowModal(false)
    setEditing(null)
    setForm(DEFAULT_FORM)
    setFormError(null)
  }

  const validateForm = () => {
    if (!form.sectionType) return 'Section type is required.'
    const duplicate = sectionCards.find((record) => record.title === form.sectionType && record.id !== editing?.id)
    if (duplicate) return 'This homepage section already exists. Duplicate critical sections are not allowed.'
    if (form.destinationType === 'EXTERNAL_URL') {
      try {
        if (form.destinationValue) new URL(form.destinationValue)
        else return 'External URL is required for this destination type.'
      } catch {
        return 'Enter a valid external URL.'
      }
    }
    if (form.destinationType !== 'NONE' && !form.destinationValue.trim()) {
      return `${destinationValueLabel(form.destinationType)} is required.`
    }
    return null
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      return
    }

    const nextSortOrder = editing?.sortOrder ?? sectionCards.length
    const payload = {
      title: form.sectionType,
      subtitle: form.subtitle || null,
      description: form.description || null,
      imageUrl: form.imageUrl || null,
      mobileImageUrl: form.mobileImageUrl || null,
      ctaText: form.ctaText || null,
      destinationType: form.destinationType,
      destinationValue: form.destinationType === 'NONE' ? null : form.destinationValue || null,
      isActive: form.isActive,
      targetAudience: form.targetAudience,
      sortOrder: nextSortOrder,
      status: 'published' as const,
    }

    setSaving(true)
    setFormError(null)
    try {
      if (editing) {
        const updated = await appControlApi.update<AppControlRecord, typeof payload>('home-sections', editing.id, payload)
        setRecords((prev) => prev.map((record) => (record.id === editing.id ? updated : record)))
      } else {
        const created = await appControlApi.create<AppControlRecord, typeof payload>('home-sections', payload)
        setRecords((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder))
      }
      closeModal()
    } catch (err) {
      setFormError((err as ApiError)?.message ?? 'Failed to save the homepage section.')
    } finally {
      setSaving(false)
    }
  }

  const persistReorder = async (nextRecords: AppControlRecord[]) => {
    setRecords(nextRecords)
    try {
      await appControlApi.reorder(
        'home-sections',
        nextRecords.map((record, index) => ({ id: record.id, sortOrder: index })),
      )
      setRecords((prev) => prev.map((record, index) => ({ ...record, sortOrder: index })))
    } catch (err) {
      setError(err as ApiError)
      fetchSections()
    }
  }

  const handleMove = async (id: string, direction: -1 | 1) => {
    const currentIndex = sectionCards.findIndex((record) => record.id === id)
    const targetIndex = currentIndex + direction
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= sectionCards.length) return

    const nextRecords = sectionCards.slice()
    const [moved] = nextRecords.splice(currentIndex, 1)
    nextRecords.splice(targetIndex, 0, moved)
    const normalized = nextRecords.map((record, index) => ({ ...record, sortOrder: index }))
    await persistReorder(normalized)
  }

  const handleToggle = async (record: AppControlRecord) => {
    const confirmed = await confirmDialog({
      title: `${record.isActive ? 'Disable' : 'Enable'} section?`,
      text: `${record.isActive ? 'This section will be hidden from the app home page.' : 'This section will be shown on the app home page.'}`,
      confirmText: record.isActive ? 'Disable' : 'Enable',
      variant: 'warning',
    })
    if (!confirmed) return

    setSaving(true)
    try {
      const updated = await appControlApi.update<AppControlRecord, { isActive: boolean }>('home-sections', record.id, {
        isActive: !record.isActive,
      })
      setRecords((prev) => prev.map((item) => (item.id === record.id ? updated : item)))
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container-fluid py-4">
      <PageHeader
        title="Home Page Builder"
        breadcrumbs={[{ label: 'BPA App Control', href: '/bpa-app-control' }, { label: 'Home Page Builder' }]}
        action={
          <div className="d-flex gap-2">
            <Button variant={previewMode ? 'outline-primary' : 'primary'} onClick={() => setPreviewMode((value) => !value)}>
              <Icon icon="solar:smartphone-bold-duotone" className="me-1" />
              {previewMode ? 'Hide Preview' : 'Preview Mode'}
            </Button>
            {canManage && (
              <Button variant="success" onClick={openCreate} disabled={availableSectionTypes.length === 0}>
                <Icon icon="solar:add-circle-bold-duotone" className="me-1" />
                Add Section
              </Button>
            )}
          </div>
        }
      />

      <p className="text-muted mb-4">
        Configure the order and visibility of mobile home sections. This builder persists through the App Control API and does not hardcode layout
        content in the app.
      </p>

      <ApiErrorAlert error={error} onDismiss={() => setError(null)} />

      <Row className="g-4">
        <Col xl={previewMode ? 8 : 12}>
          <Card>
            <Card.Body className="position-relative">
              <LoadingOverlay loading={loading || saving}>
                {sectionCards.length === 0 ? (
                  <EmptyState
                    icon="solar:widget-5-bold-duotone"
                    title="No homepage sections configured"
                    description="Add the first section to start building the app home screen order."
                    action={
                      canManage ? (
                        <Button variant="primary" onClick={openCreate}>
                          Create First Section
                        </Button>
                      ) : undefined
                    }
                  />
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {sectionCards.map((record, index) => {
                      const meta = getSectionMeta(record.title)
                      return (
                        <Card key={record.id} className="border">
                          <Card.Body>
                            <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between">
                              <div className="d-flex gap-3">
                                <div
                                  className="rounded-circle bg-light d-flex align-items-center justify-content-center flex-shrink-0"
                                  style={{ width: 48, height: 48 }}>
                                  <Icon icon="solar:widget-2-bold-duotone" width={22} />
                                </div>
                                <div>
                                  <div className="d-flex flex-wrap gap-2 align-items-center mb-1">
                                    <h5 className="mb-0">{meta?.label ?? record.title ?? 'Untitled Section'}</h5>
                                    <StatusBadge status={record.isActive ? 'active' : 'inactive'} label={record.isActive ? 'Active' : 'Inactive'} />
                                    <Badge bg="light" text="dark">
                                      Order #{record.sortOrder}
                                    </Badge>
                                  </div>
                                  <div className="text-muted small mb-2">{meta?.summary ?? 'Homepage section block.'}</div>
                                  <div className="small text-body-secondary mb-2">
                                    {record.description?.trim() || record.subtitle?.trim() || 'No preview summary configured yet.'}
                                  </div>
                                  <div className="d-flex flex-wrap gap-2 small">
                                    {record.destinationType !== 'NONE' && (
                                      <Badge bg="info-subtle" text="dark">
                                        {record.destinationType}: {record.destinationValue || 'Not set'}
                                      </Badge>
                                    )}
                                    {record.ctaText && (
                                      <Badge bg="secondary-subtle" text="dark">
                                        CTA: {record.ctaText}
                                      </Badge>
                                    )}
                                    <Badge bg="light" text="dark">
                                      Audience: {record.targetAudience}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              <div className="d-flex flex-wrap gap-2 align-items-start justify-content-lg-end">
                                {canManage && (
                                  <>
                                    <Button
                                      variant="outline-secondary"
                                      size="sm"
                                      onClick={() => handleMove(record.id, -1)}
                                      disabled={index === 0 || saving}>
                                      <Icon icon="solar:alt-arrow-up-bold" />
                                    </Button>
                                    <Button
                                      variant="outline-secondary"
                                      size="sm"
                                      onClick={() => handleMove(record.id, 1)}
                                      disabled={index === sectionCards.length - 1 || saving}>
                                      <Icon icon="solar:alt-arrow-down-bold" />
                                    </Button>
                                    <Button variant="outline-primary" size="sm" onClick={() => openEdit(record)}>
                                      <Icon icon="solar:pen-bold-duotone" className="me-1" />
                                      Edit
                                    </Button>
                                    <Button
                                      variant={record.isActive ? 'outline-warning' : 'outline-success'}
                                      size="sm"
                                      onClick={() => handleToggle(record)}>
                                      <Icon icon={record.isActive ? 'solar:eye-closed-bold' : 'solar:eye-bold'} className="me-1" />
                                      {record.isActive ? 'Disable' : 'Enable'}
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </LoadingOverlay>
            </Card.Body>
          </Card>
        </Col>

        {previewMode && (
          <Col xl={4}>
            <Card className="sticky-top" style={{ top: '1rem' }}>
              <Card.Header className="d-flex align-items-center justify-content-between">
                <div>
                  <h5 className="mb-0">App Home Preview</h5>
                  <div className="small text-muted">Active section order only</div>
                </div>
                <Badge bg="primary">{activePreviewSections.length} sections</Badge>
              </Card.Header>
              <Card.Body>
                <div className="mx-auto rounded-4 border bg-dark-subtle p-3" style={{ maxWidth: 320 }}>
                  <div className="rounded-4 bg-white p-3 d-flex flex-column gap-3" style={{ minHeight: 520 }}>
                    {activePreviewSections.length === 0 ? (
                      <EmptyState
                        icon="solar:smartphone-2-bold-duotone"
                        title="No active sections"
                        description="Enable at least one section to preview the mobile home layout."
                      />
                    ) : (
                      activePreviewSections.map((record) => {
                        const meta = getSectionMeta(record.title)
                        return (
                          <div key={record.id} className="rounded-3 border p-3 bg-light">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <strong className="small">{meta?.label ?? record.title}</strong>
                              <Badge bg="light" text="dark">
                                #{record.sortOrder}
                              </Badge>
                            </div>
                            <div className="small text-muted">{record.description?.trim() || meta?.summary || 'Section preview summary'}</div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <Modal show={showModal} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton={!saving}>
          <Modal.Title>{editing ? 'Edit Home Section' : 'Add Home Section'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <Alert variant="danger">{formError}</Alert>}

          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Section Type</Form.Label>
              <Form.Select
                value={form.sectionType}
                onChange={(event) => setForm((current) => ({ ...current, sectionType: event.target.value as AppHomeSectionType }))}
                disabled={Boolean(editing)}>
                <option value="">Select a section</option>
                {(editing ? APP_HOME_SECTION_OPTIONS : availableSectionTypes).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={6}>
              <Form.Label>Target Audience</Form.Label>
              <Form.Select
                value={form.targetAudience}
                onChange={(event) => setForm((current) => ({ ...current, targetAudience: event.target.value as AppControlTargetAudience }))}>
                {TARGET_AUDIENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={12}>
              <Form.Label>Section Heading</Form.Label>
              <Form.Control
                value={form.subtitle}
                onChange={(event) => setForm((current) => ({ ...current, subtitle: event.target.value }))}
                placeholder="Optional custom heading shown to users"
              />
            </Col>

            <Col md={12}>
              <Form.Label>Preview Summary</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Brief summary for the section card and preview mode"
              />
            </Col>

            <Col md={12}>
              <Form.Label>Section Image</Form.Label>
              <MediaPickerInput
                emptyLabel="Select Image"
                previewUrl={form.imageUrl || null}
                value={null}
                onChange={(_, file) => setForm((current) => ({ ...current, imageUrl: file?.url ?? '' }))}
              />
            </Col>

            <Col md={6}>
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                value={form.imageUrl}
                onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
                placeholder="https://..."
              />
            </Col>

            <Col md={6}>
              <Form.Label>Mobile Image URL</Form.Label>
              <Form.Control
                value={form.mobileImageUrl}
                onChange={(event) => setForm((current) => ({ ...current, mobileImageUrl: event.target.value }))}
                placeholder="https://..."
              />
            </Col>

            <Col md={6}>
              <Form.Label>CTA Text</Form.Label>
              <Form.Control
                value={form.ctaText}
                onChange={(event) => setForm((current) => ({ ...current, ctaText: event.target.value }))}
                placeholder="Learn More"
              />
            </Col>

            <Col md={6}>
              <Form.Label>Destination Type</Form.Label>
              <Form.Select
                value={form.destinationType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    destinationType: event.target.value as AppControlDestinationType,
                    destinationValue: event.target.value === 'NONE' ? '' : current.destinationValue,
                  }))
                }>
                {DESTINATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Col>

            {form.destinationType === 'CAMPAIGN' && (
              <Col md={12}>
                <Form.Label>Campaign</Form.Label>
                <Form.Select
                  value={form.destinationValue}
                  onChange={(event) => setForm((current) => ({ ...current, destinationValue: event.target.value }))}>
                  <option value="">Select a campaign</option>
                  {campaignOptions.map((campaign) => (
                    <option key={campaign.id} value={campaign.slug || campaign.id}>
                      {campaign.title}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            )}

            {form.destinationType === 'INTERNAL_PAGE' && (
              <Col md={12}>
                <Form.Label>App Page</Form.Label>
                <Form.Select
                  value={form.destinationValue}
                  onChange={(event) => setForm((current) => ({ ...current, destinationValue: event.target.value }))}>
                  <option value="">Select an app page</option>
                  {APP_CONTROL_PAGE_OPTIONS.map((page) => (
                    <option key={page.value} value={page.value}>
                      {page.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            )}

            {form.destinationType !== 'NONE' && form.destinationType !== 'CAMPAIGN' && form.destinationType !== 'INTERNAL_PAGE' && (
              <Col md={12}>
                <Form.Label>{destinationValueLabel(form.destinationType)}</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <Icon icon="solar:link-round-bold-duotone" />
                  </InputGroup.Text>
                  <Form.Control
                    value={form.destinationValue}
                    onChange={(event) => setForm((current) => ({ ...current, destinationValue: event.target.value }))}
                    placeholder={form.destinationType === 'EXTERNAL_URL' ? 'https://...' : 'Enter target value'}
                  />
                </InputGroup>
              </Col>
            )}

            <Col md={12}>
              <Form.Check
                type="switch"
                id="home-section-active"
                label="Section enabled"
                checked={form.isActive}
                onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={closeModal} disabled={saving}>
            Cancel
          </Button>
          {canManage && (
            <Button variant="primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Section'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  )
}
