'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Alert, Badge, Button, Card, Col, Form, InputGroup, Modal, Row, Table } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import EmptyState from '@/components/ui/EmptyState'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import MediaPickerInput from '@/components/ui/MediaPickerInput'
import StatusBadge from '@/components/ui/StatusBadge'
import { confirmDelete, confirmDialog } from '@/components/ui/ConfirmDialog'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { campaignsApi } from '@/lib/api/campaigns.api'
import {
  appControlApi,
  APP_CONTROL_PAGE_OPTIONS,
  type AppControlDestinationType,
  type AppControlPayload,
  type AppControlRecord,
  type AppControlStatus,
  type AppControlTargetAudience,
  type AppThemeSettingPayload,
  type AppThemeSettingRecord,
  type AppVersionSettingPayload,
  type AppVersionSettingRecord,
} from '@/lib/api/app-control.api'
import type { ApiError } from '@/lib/api'

type ResourceKind = 'standard' | 'theme' | 'version'

type FormState = {
  title: string
  subtitle: string
  description: string
  imageUrl: string
  mobileImageUrl: string
  ctaText: string
  destinationType: AppControlDestinationType
  destinationValue: string
  sortOrder: string
  startsAt: string
  endsAt: string
  isActive: boolean
  targetAudience: AppControlTargetAudience
  status: AppControlStatus
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  fontFamily?: string
  logoUrl?: string
  minimumVersion?: string
  latestVersion?: string
  forceUpdate?: boolean
  releaseNotes?: string
}

export interface AppControlManagerProps {
  resource: string
  title: string
  description: string
  breadcrumbs: Array<{ label: string; href?: string }>
  icon: string
  emptyTitle: string
  emptyDescription: string
  kind?: ResourceKind
  createDefaults?: Partial<FormState>
  hideDestinationTypeFilter?: boolean
  maintenanceModeOnly?: boolean
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

const DEFAULT_FORM: FormState = {
  title: '',
  subtitle: '',
  description: '',
  imageUrl: '',
  mobileImageUrl: '',
  ctaText: '',
  destinationType: 'NONE',
  destinationValue: '',
  sortOrder: '0',
  startsAt: '',
  endsAt: '',
  isActive: true,
  targetAudience: 'all',
  status: 'draft',
  primaryColor: '',
  secondaryColor: '',
  accentColor: '',
  fontFamily: '',
  logoUrl: '',
  minimumVersion: '',
  latestVersion: '',
  forceUpdate: false,
  releaseNotes: '',
}

function toLocalDateTimeInput(value?: string | null) {
  if (!value) return ''
  const d = new Date(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toApiDateTime(value: string) {
  return value ? new Date(value).toISOString() : null
}

function getInitialForm(record?: AppControlRecord | AppThemeSettingRecord | AppVersionSettingRecord | null, defaults?: Partial<FormState>): FormState {
  if (!record) return { ...DEFAULT_FORM, ...defaults }
  return {
    title: record.title ?? '',
    subtitle: record.subtitle ?? '',
    description: record.description ?? '',
    imageUrl: record.imageUrl ?? '',
    mobileImageUrl: record.mobileImageUrl ?? '',
    ctaText: record.ctaText ?? '',
    destinationType: record.destinationType ?? 'NONE',
    destinationValue: record.destinationValue ?? '',
    sortOrder: String(record.sortOrder ?? 0),
    startsAt: toLocalDateTimeInput(record.startsAt),
    endsAt: toLocalDateTimeInput(record.endsAt),
    isActive: record.isActive ?? true,
    targetAudience: record.targetAudience ?? 'all',
    status: record.status ?? 'draft',
    primaryColor: 'primaryColor' in record ? record.primaryColor ?? '' : '',
    secondaryColor: 'secondaryColor' in record ? record.secondaryColor ?? '' : '',
    accentColor: 'accentColor' in record ? record.accentColor ?? '' : '',
    fontFamily: 'fontFamily' in record ? record.fontFamily ?? '' : '',
    logoUrl: 'logoUrl' in record ? record.logoUrl ?? '' : '',
    minimumVersion: 'minimumVersion' in record ? record.minimumVersion ?? '' : '',
    latestVersion: 'latestVersion' in record ? record.latestVersion ?? '' : '',
    forceUpdate: 'forceUpdate' in record ? record.forceUpdate : false,
    releaseNotes: 'releaseNotes' in record ? record.releaseNotes ?? '' : '',
    ...defaults,
  }
}

function destinationValueLabel(type: AppControlDestinationType) {
  switch (type) {
    case 'CAMPAIGN': return 'Campaign'
    case 'INTERNAL_PAGE': return 'App Page'
    case 'EXTERNAL_URL': return 'External URL'
    case 'MEMBERSHIP': return 'Membership Target'
    case 'DONATION': return 'Donation Target'
    case 'PET_CENSUS': return 'Pet Census Target'
    case 'SERVICE': return 'Service Target'
    default: return 'Destination'
  }
}

export default function AppControlManager({
  resource,
  title,
  description,
  breadcrumbs,
  icon,
  emptyTitle,
  emptyDescription,
  kind = 'standard',
  createDefaults,
  hideDestinationTypeFilter = false,
  maintenanceModeOnly = false,
}: AppControlManagerProps) {
  const { permissions, isSuperAdmin } = usePermission()
  const canManage = isSuperAdmin || permissions.includes('app_control:manage')
  const canPublish = isSuperAdmin || permissions.includes('app_control:publish')
  const canDelete = isSuperAdmin || permissions.includes('app_control:delete')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AppControlStatus | ''>('')
  const [isActive, setIsActive] = useState<boolean | ''>('')
  const [destinationTypeFilter, setDestinationTypeFilter] = useState<AppControlDestinationType | ''>('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<AppControlRecord | AppThemeSettingRecord | AppVersionSettingRecord | null>(null)
  const [form, setForm] = useState<FormState>(getInitialForm(null, createDefaults))
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!showModal) {
      setForm(getInitialForm(editing, createDefaults))
    }
  }, [editing, showModal, createDefaults])

  const listFn = useCallback(
    () => appControlApi.list(resource, { page, limit: 20, search, status, isActive, destinationType: destinationTypeFilter }),
    [resource, page, search, status, isActive, destinationTypeFilter],
  )
  const { data, loading, error, refetch } = useApi(listFn, [resource, page, search, status, isActive, destinationTypeFilter])

  const campaignsFn = useCallback(() => campaignsApi.list({ page: 1, limit: 100 }), [])
  const { data: campaignsData } = useApi(campaignsFn, [])

  const { mutate, loading: saving, error: mutationError, clearError } = useApiMutation<AppControlRecord, unknown>()
  const { mutate: mutateDelete, loading: deleting, error: deleteError, clearError: clearDeleteError } = useApiMutation<void, unknown>()
  const items = useMemo(() => {
    const rows = (data?.data ?? []) as AppControlRecord[]
    if (maintenanceModeOnly) {
      return rows.filter((row) => row.destinationValue === 'maintenance_mode')
    }
    return rows
  }, [data, maintenanceModeOnly])

  const meta = data?.meta
  const campaigns = campaignsData?.data ?? []

  function openCreate() {
    setEditing(null)
    setForm(getInitialForm(null, createDefaults))
    setFormError(null)
    clearError()
    setShowModal(true)
  }

  function openEdit(item: AppControlRecord | AppThemeSettingRecord | AppVersionSettingRecord) {
    setEditing(item)
    setForm(getInitialForm(item, createDefaults))
    setFormError(null)
    clearError()
    setShowModal(true)
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validateForm() {
    if (!form.title.trim()) return 'Title is required.'
    if (form.startsAt && form.endsAt && new Date(form.endsAt) < new Date(form.startsAt)) return 'End date must be after start date.'
    if (form.destinationType === 'EXTERNAL_URL' && form.destinationValue.trim()) {
      try { new URL(form.destinationValue.trim()) } catch { return 'Please enter a valid external URL.' }
    }
    if (form.destinationType !== 'NONE' && !form.destinationValue.trim()) return 'Destination target is required.'
    if (form.destinationType === 'CAMPAIGN' && !form.destinationValue.trim()) return 'Select a campaign.'
    if (kind === 'version') {
      if (!form.minimumVersion?.trim()) return 'Minimum version is required.'
      if (!form.latestVersion?.trim()) return 'Latest version is required.'
    }
    return null
  }

  function buildPayload(): AppControlPayload | AppThemeSettingPayload | AppVersionSettingPayload {
    const base: AppControlPayload = {
      title: form.title.trim() || null,
      subtitle: form.subtitle.trim() || null,
      description: form.description.trim() || null,
      imageUrl: form.imageUrl.trim() || null,
      mobileImageUrl: form.mobileImageUrl.trim() || null,
      ctaText: form.ctaText.trim() || null,
      destinationType: form.destinationType,
      destinationValue: form.destinationType === 'NONE' ? null : form.destinationValue.trim() || null,
      sortOrder: Number(form.sortOrder || 0),
      isActive: form.isActive,
      startsAt: toApiDateTime(form.startsAt),
      endsAt: toApiDateTime(form.endsAt),
      targetAudience: form.targetAudience,
      status: form.status,
    }

    if (kind === 'theme') {
      return {
        ...base,
        primaryColor: form.primaryColor?.trim() || null,
        secondaryColor: form.secondaryColor?.trim() || null,
        accentColor: form.accentColor?.trim() || null,
        fontFamily: form.fontFamily?.trim() || null,
        logoUrl: form.logoUrl?.trim() || null,
      }
    }

    if (kind === 'version') {
      return {
        ...base,
        minimumVersion: form.minimumVersion?.trim() || '',
        latestVersion: form.latestVersion?.trim() || '',
        forceUpdate: !!form.forceUpdate,
        releaseNotes: form.releaseNotes?.trim() || null,
      }
    }

    return base
  }

  async function handleSave() {
    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      return
    }

    setFormError(null)
    const payload = buildPayload()

    const result = editing
      ? await mutate(() => appControlApi.update(resource, editing.id, payload), undefined)
      : await mutate(() => appControlApi.create(resource, payload), undefined)

    if (result) {
      setShowModal(false)
      refetch()
    }
  }

  async function handleDelete(item: AppControlRecord) {
    const ok = await confirmDelete(item.title || 'this record')
    if (!ok) return
    const deleted = await mutateDelete(() => appControlApi.remove(resource, item.id), undefined)
    if (deleted !== null) refetch()
  }

  async function handlePublishToggle(item: AppControlRecord) {
    const publish = item.status !== 'published'
    const ok = await confirmDialog({
      title: publish ? `Publish ${item.title || 'record'}?` : `Unpublish ${item.title || 'record'}?`,
      text: publish ? 'This record will become published.' : 'This record will be moved back to draft.',
      confirmText: publish ? 'Publish' : 'Unpublish',
      variant: publish ? 'info' : 'warning',
    })
    if (!ok) return
    const updated = await mutate(() => appControlApi.publish(resource, item.id, publish), undefined)
    if (updated) refetch()
  }

  function renderDestinationControl() {
    if (form.destinationType === 'NONE') return null

    if (form.destinationType === 'CAMPAIGN') {
      return (
        <Form.Group className="mb-3">
          <Form.Label>Campaign Selector</Form.Label>
          <Form.Select value={form.destinationValue} onChange={(e) => setField('destinationValue', e.target.value)}>
            <option value="">Select campaign</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.slug || campaign.id}>
                {campaign.title}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      )
    }

    if (form.destinationType === 'INTERNAL_PAGE') {
      return (
        <Form.Group className="mb-3">
          <Form.Label>Predefined App Page</Form.Label>
          <Form.Select value={form.destinationValue} onChange={(e) => setField('destinationValue', e.target.value)}>
            <option value="">Select app page</option>
            {APP_CONTROL_PAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Form.Select>
        </Form.Group>
      )
    }

    return (
      <Form.Group className="mb-3">
        <Form.Label>{destinationValueLabel(form.destinationType)}</Form.Label>
        <Form.Control
          type={form.destinationType === 'EXTERNAL_URL' ? 'url' : 'text'}
          value={form.destinationValue}
          onChange={(e) => setField('destinationValue', e.target.value)}
          placeholder={form.destinationType === 'EXTERNAL_URL' ? 'https://example.com/page' : 'Enter destination target'}
        />
      </Form.Group>
    )
  }

  return (
    <>
      <PageHeader
        title={title}
        breadcrumbs={breadcrumbs}
        action={canManage ? (
          <Button variant="primary" onClick={openCreate}>
            <Icon icon="solar:add-circle-bold" className="me-1" />
            Add Record
          </Button>
        ) : null}
      />

      <Card className="border-0 shadow-sm mb-3">
        <Card.Body className="p-4">
          <div className="d-flex align-items-start gap-3">
            <div className="rounded-3 bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 46, height: 46 }}>
              <Icon icon={icon} width="22" />
            </div>
            <div>
              <p className="mb-0 text-muted">{description}</p>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mb-3">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Label className="small fw-semibold">Search</Form.Label>
              <InputGroup>
                <InputGroup.Text><Icon icon="solar:magnifer-linear" /></InputGroup.Text>
                <Form.Control value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search title, subtitle, description..." />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Label className="small fw-semibold">Status</Form.Label>
              <Form.Select value={status} onChange={(e) => { setStatus(e.target.value as AppControlStatus | ''); setPage(1) }}>
                <option value="">All statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="small fw-semibold">Active State</Form.Label>
              <Form.Select
                value={isActive === '' ? '' : String(isActive)}
                onChange={(e) => {
                  const value = e.target.value
                  setIsActive(value === '' ? '' : value === 'true')
                  setPage(1)
                }}
              >
                <option value="">All records</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Form.Select>
            </Col>
            {!hideDestinationTypeFilter && (
              <Col md={2}>
                <Form.Label className="small fw-semibold">Destination</Form.Label>
                <Form.Select value={destinationTypeFilter} onChange={(e) => { setDestinationTypeFilter(e.target.value as AppControlDestinationType | ''); setPage(1) }}>
                  <option value="">All</option>
                  {DESTINATION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Form.Select>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      <ApiErrorAlert error={error as ApiError | null} />
      <ApiErrorAlert error={mutationError as ApiError | null} onDismiss={clearError} />
      <ApiErrorAlert error={deleteError as ApiError | null} onDismiss={clearDeleteError} />

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-transparent border-bottom py-3 d-flex justify-content-between align-items-center">
          <span className="fw-semibold">Records</span>
          <span className="text-muted small">{items.length} item{items.length === 1 ? '' : 's'}</span>
        </Card.Header>
        <Card.Body className="p-0">
          <LoadingOverlay loading={loading || deleting}>
            {items.length === 0 ? (
              <EmptyState
                icon={icon}
                title={emptyTitle}
                description={emptyDescription}
                action={canManage ? <Button variant="primary" size="sm" onClick={openCreate}>Create first record</Button> : undefined}
              />
            ) : (
              <div className="table-responsive">
                <Table hover className="table-centered align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Content</th>
                      <th>Status</th>
                      <th>Audience</th>
                      <th>Destination</th>
                      <th>Schedule</th>
                      <th>Sort</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="rounded overflow-hidden border bg-light flex-shrink-0" style={{ width: 56, height: 56 }}>
                              {item.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.imageUrl} alt={item.title || 'App control image'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                                  <Icon icon={icon} width="22" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="fw-semibold">{item.title || 'Untitled'}</div>
                              <div className="text-muted small">{item.subtitle || item.description || 'No supporting text added yet.'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            <StatusBadge status={item.status} />
                            <Badge bg={item.isActive ? 'success-subtle' : 'secondary-subtle'} text={item.isActive ? 'success' : 'secondary'}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </td>
                        <td className="text-capitalize">{item.targetAudience.replace('_', ' ')}</td>
                        <td>
                          <div className="small fw-semibold">{item.destinationType}</div>
                          <div className="text-muted small">{item.destinationValue || 'No destination'}</div>
                        </td>
                        <td>
                          <div className="small text-muted">Start: {item.startsAt ? new Date(item.startsAt).toLocaleString() : 'Always'}</div>
                          <div className="small text-muted">End: {item.endsAt ? new Date(item.endsAt).toLocaleString() : 'No end date'}</div>
                        </td>
                        <td>
                          <div className="fw-semibold">{item.sortOrder}</div>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-1 flex-wrap">
                            {canManage && (
                              <Button variant="soft-primary" size="sm" onClick={() => openEdit(item)} title="Edit">
                                <Icon icon="solar:pen-bold" />
                              </Button>
                            )}
                            {canPublish && (
                              <Button variant={item.status === 'published' ? 'soft-warning' : 'soft-success'} size="sm" onClick={() => handlePublishToggle(item)} title={item.status === 'published' ? 'Unpublish' : 'Publish'}>
                                <Icon icon={item.status === 'published' ? 'solar:eye-closed-bold' : 'solar:check-circle-bold'} />
                              </Button>
                            )}
                            {canDelete && (
                              <Button variant="soft-danger" size="sm" onClick={() => handleDelete(item)} title="Delete">
                                <Icon icon="solar:trash-bin-trash-bold" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </LoadingOverlay>
        </Card.Body>
        {meta && meta.totalPages > 1 && (
          <Card.Footer className="bg-transparent d-flex justify-content-between align-items-center py-3">
            <span className="small text-muted">Page {meta.page} of {meta.totalPages} · {meta.total} total</span>
            <div className="d-flex gap-2">
              <Button size="sm" variant="outline-secondary" disabled={!meta.hasPrev} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button size="sm" variant="outline-secondary" disabled={!meta.hasNext} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </Card.Footer>
        )}
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? `Edit ${title}` : `Create ${title}`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && (
            <Alert variant="danger" dismissible onClose={() => setFormError(null)} className="py-2">
              {formError}
            </Alert>
          )}

          <Row className="g-3">
            <Col lg={8}>
              <Card className="border">
                <Card.Body>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Title</Form.Label>
                        <Form.Control value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Enter title" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Subtitle</Form.Label>
                        <Form.Control value={form.subtitle} onChange={(e) => setField('subtitle', e.target.value)} placeholder="Enter subtitle" />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" rows={4} value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Enter description" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <MediaPickerInput
                        label="Image Upload"
                        value={null}
                        previewUrl={form.imageUrl || null}
                        onChange={(_id, file) => setField('imageUrl', file?.url || '')}
                        emptyLabel="Choose image from media"
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Image URL</Form.Label>
                        <Form.Control type="url" value={form.imageUrl} onChange={(e) => setField('imageUrl', e.target.value)} placeholder="https://..." />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Mobile Image URL</Form.Label>
                        <Form.Control type="url" value={form.mobileImageUrl} onChange={(e) => setField('mobileImageUrl', e.target.value)} placeholder="https://..." />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>CTA Button Text</Form.Label>
                        <Form.Control value={form.ctaText} onChange={(e) => setField('ctaText', e.target.value)} placeholder="Open now" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Destination Type</Form.Label>
                        <Form.Select
                          value={form.destinationType}
                          onChange={(e) => {
                            const value = e.target.value as AppControlDestinationType
                            setField('destinationType', value)
                            setField('destinationValue', '')
                          }}
                        >
                          {DESTINATION_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Target Audience</Form.Label>
                        <Form.Select value={form.targetAudience} onChange={(e) => setField('targetAudience', e.target.value as AppControlTargetAudience)}>
                          {TARGET_AUDIENCE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      {renderDestinationControl()}
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control type="datetime-local" value={form.startsAt} onChange={(e) => setField('startsAt', e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>End Date</Form.Label>
                        <Form.Control type="datetime-local" value={form.endsAt} onChange={(e) => setField('endsAt', e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Sort Order</Form.Label>
                        <Form.Control type="number" min={0} value={form.sortOrder} onChange={(e) => setField('sortOrder', e.target.value)} />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="border mb-3">
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select value={form.status} onChange={(e) => setField('status', e.target.value as AppControlStatus)}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Check
                    type="switch"
                    id={`${resource}-active-toggle`}
                    label="Active record"
                    checked={form.isActive}
                    onChange={(e) => setField('isActive', e.target.checked)}
                  />
                </Card.Body>
              </Card>

              {kind === 'theme' && (
                <Card className="border mb-3">
                  <Card.Header className="bg-transparent"><h6 className="mb-0">Theme Settings</h6></Card.Header>
                  <Card.Body>
                    <Row className="g-3">
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Primary Color</Form.Label>
                          <Form.Control value={form.primaryColor} onChange={(e) => setField('primaryColor', e.target.value)} placeholder="#1A6B3C" />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Secondary Color</Form.Label>
                          <Form.Control value={form.secondaryColor} onChange={(e) => setField('secondaryColor', e.target.value)} placeholder="#F4B942" />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Accent Color</Form.Label>
                          <Form.Control value={form.accentColor} onChange={(e) => setField('accentColor', e.target.value)} placeholder="#0E2B20" />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Font Family</Form.Label>
                          <Form.Control value={form.fontFamily} onChange={(e) => setField('fontFamily', e.target.value)} placeholder="Manrope, sans-serif" />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Logo URL</Form.Label>
                          <Form.Control type="url" value={form.logoUrl} onChange={(e) => setField('logoUrl', e.target.value)} placeholder="https://..." />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              {kind === 'version' && (
                <Card className="border mb-3">
                  <Card.Header className="bg-transparent"><h6 className="mb-0">Version Rules</h6></Card.Header>
                  <Card.Body>
                    <Row className="g-3">
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Minimum Version</Form.Label>
                          <Form.Control value={form.minimumVersion} onChange={(e) => setField('minimumVersion', e.target.value)} placeholder="1.0.0" />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Latest Version</Form.Label>
                          <Form.Control value={form.latestVersion} onChange={(e) => setField('latestVersion', e.target.value)} placeholder="1.2.0" />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Check
                          type="switch"
                          id={`${resource}-force-update`}
                          label="Force update"
                          checked={!!form.forceUpdate}
                          onChange={(e) => setField('forceUpdate', e.target.checked)}
                        />
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Release Notes</Form.Label>
                          <Form.Control as="textarea" rows={4} value={form.releaseNotes} onChange={(e) => setField('releaseNotes', e.target.value)} />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              {resource === 'page-contents' && (
                <Card className="border">
                  <Card.Body>
                    <p className="text-muted small mb-0">
                      {title === 'Maintenance Mode'
                        ? 'This page is currently backed by the Page CMS API and intended for maintenance-related content/config entries.'
                        : 'Use destination rules to connect this page content to app routes or external targets.'}
                    </p>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
          {canManage && (
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update Record' : 'Create Record'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  )
}
