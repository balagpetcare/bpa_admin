'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import dayjs from 'dayjs'
import { Button, Card, Col, Dropdown, Form, InputGroup, Row, Table } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import StatusBadge from '@/components/ui/StatusBadge'
import { confirmDelete } from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { membershipCampaignApi } from '@/lib/api/membership-campaign.api'
import { ApiError } from '@/lib/api'
import type { MembershipCampaign, MembershipCampaignStatus } from '@/lib/api/membership-campaign.api'
import { getPublishStateLabel, getStatusTone } from './wizard/campaign-workflow'

type StatusIndicatorTone = 'success' | 'warning' | 'danger' | 'info' | 'secondary'
type ScheduleState = 'active' | 'upcoming' | 'expired' | 'open' | 'closed' | 'not_configured'

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const
const DATE_DISPLAY_FORMAT = 'DD MMM YYYY'
const DATE_TIME_DISPLAY_FORMAT = 'DD MMM YYYY, hh:mm A'

function formatDate(value?: string | null) {
  return value ? dayjs(value).format(DATE_DISPLAY_FORMAT) : 'Not configured'
}

function formatDateTime(value?: string | null) {
  return value ? dayjs(value).format(DATE_TIME_DISPLAY_FORMAT) : 'Not configured'
}

function formatDateRange(startAt?: string | null, endAt?: string | null) {
  if (!startAt && !endAt) return 'Not configured'
  return `${formatDate(startAt)} - ${formatDate(endAt)}`
}

function getPrimaryStatusLabel(status: MembershipCampaignStatus) {
  return getPublishStateLabel(status)
}

function getScheduleState(
  startAt: string | null | undefined,
  endAt: string | null | undefined,
  labels: { active: string; upcoming: string; expired: string },
  now = new Date(),
) {
  if (!startAt && !endAt) {
    return { label: 'Not configured', tone: 'secondary' as StatusIndicatorTone, state: 'not_configured' as ScheduleState }
  }

  const start = startAt ? new Date(startAt) : null
  const end = endAt ? new Date(endAt) : null

  if (start && now < start) {
    return { label: labels.upcoming, tone: 'info' as StatusIndicatorTone, state: 'upcoming' as ScheduleState }
  }

  if (end && now > end) {
    return { label: labels.expired, tone: 'warning' as StatusIndicatorTone, state: 'expired' as ScheduleState }
  }

  return { label: labels.active, tone: 'success' as StatusIndicatorTone, state: 'active' as ScheduleState }
}

function getApplicationState(startAt?: string | null, endAt?: string | null, now = new Date()) {
  if (!startAt && !endAt) {
    return { label: 'Not configured', tone: 'secondary' as StatusIndicatorTone, state: 'not_configured' as ScheduleState }
  }

  const start = startAt ? new Date(startAt) : null
  const end = endAt ? new Date(endAt) : null

  if (start && now < start) {
    return { label: 'Upcoming', tone: 'info' as StatusIndicatorTone, state: 'upcoming' as ScheduleState }
  }

  if (end && now > end) {
    return { label: 'Closed', tone: 'warning' as StatusIndicatorTone, state: 'closed' as ScheduleState }
  }

  return { label: 'Open', tone: 'success' as StatusIndicatorTone, state: 'open' as ScheduleState }
}

function getVisibleRange(page: number, limit: number, total: number) {
  if (total === 0) return '0 of 0'
  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)
  return `${start}-${end} of ${total}`
}

function CampaignListSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }, (_, index) => (
        <tr key={index} className="placeholder-glow">
          <td>
            <div className="placeholder col-8 mb-2" />
            <div className="placeholder col-6 mb-2" />
            <div className="placeholder col-5" />
          </td>
          <td>
            <div className="placeholder col-9 mb-2" />
            <div className="placeholder col-8" />
          </td>
          <td>
            <div className="placeholder col-7 mb-2" />
            <div className="placeholder col-8" />
          </td>
          <td>
            <div className="placeholder col-7" />
          </td>
          <td>
            <div className="placeholder col-8 ms-auto" />
          </td>
        </tr>
      ))}
    </>
  )
}

function CampaignCardSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }, (_, index) => (
        <Card key={index} className="border shadow-sm">
          <Card.Body className="placeholder-glow">
            <div className="placeholder col-8 mb-2" />
            <div className="placeholder col-6 mb-2" />
            <div className="placeholder col-9 mb-3" />
            <div className="placeholder col-7 mb-2" />
            <div className="placeholder col-5 mb-3" />
            <div className="placeholder col-4" />
          </Card.Body>
        </Card>
      ))}
    </>
  )
}

function CampaignActions({
  campaign,
  canRead,
  canUpdate,
  canDelete,
  loading,
  onDelete,
  onCopySlug,
}: {
  campaign: MembershipCampaign
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
  loading: boolean
  onDelete: (campaign: MembershipCampaign) => Promise<void>
  onCopySlug: (slug: string) => Promise<void>
}) {
  const primaryHref = canUpdate
    ? `/community-care/membership/campaigns/${campaign.id}/edit`
    : `/community-care/membership/campaigns/${campaign.id}/edit?step=review`
  const primaryLabel = canUpdate ? 'Edit' : 'View'

  return (
    <div className="d-flex align-items-center justify-content-end gap-2 flex-wrap">
      {(canUpdate || canRead) && (
        <Link href={primaryHref} className={`btn btn-soft-primary btn-sm${loading ? ' disabled' : ''}`} aria-disabled={loading}>
          {primaryLabel}
        </Link>
      )}
      <Dropdown align="end">
        <Dropdown.Toggle size="sm" variant="outline-secondary" className="no-caret d-flex align-items-center gap-1" disabled={loading}>
          <Icon icon="solar:menu-dots-bold" />
          <span className="d-none d-sm-inline">More</span>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {(canUpdate || canRead) && (
            <Dropdown.Item as={Link} href={`/community-care/membership/campaigns/${campaign.id}/edit`} className="d-flex align-items-center gap-2">
              <Icon icon={canUpdate ? 'solar:pen-bold' : 'solar:eye-bold'} className="text-primary" />
              {canUpdate ? 'Edit campaign' : 'Open campaign'}
            </Dropdown.Item>
          )}
          {canRead && (
            <Dropdown.Item
              as={Link}
              href={`/community-care/membership/campaigns/${campaign.id}/edit?step=review`}
              className="d-flex align-items-center gap-2">
              <Icon icon="solar:eye-bold" className="text-info" />
              Preview
            </Dropdown.Item>
          )}
          <Dropdown.Item className="d-flex align-items-center gap-2" onClick={() => onCopySlug(campaign.slug)} disabled={loading}>
            <Icon icon="solar:copy-bold" className="text-secondary" />
            Copy slug
          </Dropdown.Item>
          {canDelete && (
            <>
              <Dropdown.Divider />
              <Dropdown.Item className="d-flex align-items-center gap-2 text-danger" onClick={() => onDelete(campaign)} disabled={loading}>
                <Icon icon="solar:trash-bin-trash-bold" className="text-danger" />
                Delete
              </Dropdown.Item>
            </>
          )}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  )
}

export default function MembershipCampaignsContent() {
  const { can } = usePermission()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [limit, setLimit] = useState<number>(20)
  const [actionTargetId, setActionTargetId] = useState<string | null>(null)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const { mutate, loading: actionLoading, error: actionError, clearError } = useApiMutation<void, void>()

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(handle)
  }, [search])

  const fetchFn = useCallback(
    () => membershipCampaignApi.listCampaigns({ page, limit, search: debouncedSearch || undefined, status: status || undefined }),
    [page, limit, debouncedSearch, status],
  )
  const { data, loading, error, refetch } = useApi(fetchFn, [page, limit, debouncedSearch, status])

  const campaigns = data?.data ?? null
  const total = data?.meta?.total ?? null
  const hasFilters = debouncedSearch !== '' || status !== ''
  const hasApiError = error && !loading
  const showEmptyState = !loading && !hasApiError && total === 0 && campaigns !== null && campaigns.length === 0
  const showTable = !hasApiError && campaigns !== null && campaigns.length > 0
  const canRead = can('membership_campaigns:read')
  const canUpdate = can('membership_campaigns:update')
  const canDelete = can('membership_campaigns:delete')
  const visibleRange = data?.meta ? getVisibleRange(data.meta.page, data.meta.limit, data.meta.total) : '0 of 0'
  const totalLabel = `${total ?? 0} campaign${total === 1 ? '' : 's'}`
  const statusOptions = useMemo(
    () => [
      { value: '', label: 'All Statuses' },
      { value: 'draft', label: 'Draft' },
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'application_open', label: 'Application Open' },
      { value: 'application_closed', label: 'Paused' },
      { value: 'published', label: 'Published' },
      { value: 'archived', label: 'Archived' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
    [],
  )

  async function handleDelete(campaign: MembershipCampaign) {
    if (!(await confirmDelete('this campaign'))) return
    setActionTargetId(campaign.id)
    try {
      const result = await mutate(() => membershipCampaignApi.deleteCampaign(campaign.id), undefined)
      if (result !== null) {
        refetch()
      }
    } finally {
      setActionTargetId(null)
    }
  }

  async function handleCopySlug(slug: string) {
    await navigator.clipboard.writeText(slug)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug((current) => (current === slug ? null : current)), 2000)
  }

  function clearFilters() {
    setSearch('')
    setDebouncedSearch('')
    setStatus('')
    setPage(1)
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Campaign Plans & Offers"
        breadcrumbs={[{ label: 'Membership Management' }, { label: 'Campaign Plans & Offers' }]}
        action={
          can('membership_campaigns:create') ? (
            <Link href="/community-care/membership/campaigns/create" className="btn btn-primary">
              <Icon icon="solar:add-circle-bold" className="me-1" />
              New Campaign
            </Link>
          ) : undefined
        }
      />
      {hasApiError && (
        <div className="mb-3">
          <ApiErrorAlert error={error as ApiError | null} />
          <div className="mt-2">
            <Button variant="outline-danger" size="sm" onClick={refetch}>
              Retry
            </Button>
          </div>
        </div>
      )}
      {actionError && (
        <div className="mb-3">
          <ApiErrorAlert error={actionError} onDismiss={clearError} />
        </div>
      )}
      <Card>
        <Card.Body>
          <div className="border rounded-3 bg-light-subtle p-3 mb-3">
            <Row className="g-2 align-items-center">
              <Col xs={12} lg={5}>
                <InputGroup>
                  <InputGroup.Text>
                    <Icon icon="solar:magnifer-bold" />
                  </InputGroup.Text>
                  <Form.Control
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    placeholder="Search by title or slug..."
                    aria-label="Search campaigns by English title, Bangla title, or slug"
                  />
                </InputGroup>
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <Form.Select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value)
                    setPage(1)
                  }}>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={12} sm={6} lg={2}>
                <div className="small text-muted">
                  <div className="fw-semibold text-dark">{totalLabel}</div>
                  <div>Showing {visibleRange}</div>
                </div>
              </Col>
              <Col xs={12} lg={2} className="d-flex justify-content-lg-end gap-2 flex-wrap">
                {hasFilters && (
                  <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
                {can('membership_campaigns:create') && (
                  <Link href="/community-care/membership/campaigns/create" className="btn btn-primary btn-sm">
                    <Icon icon="solar:add-circle-bold" className="me-1" />
                    New Campaign
                  </Link>
                )}
              </Col>
            </Row>
          </div>

          {copiedSlug && (
            <div className="small text-success mb-3 d-flex align-items-center gap-2">
              <Icon icon="solar:check-circle-bold" />
              Slug copied: <code>{copiedSlug}</code>
            </div>
          )}

          <LoadingOverlay loading={loading && showTable}>
            {loading && !campaigns ? (
              <>
                <div className="d-none d-md-block">
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Campaign</th>
                          <th>Schedule</th>
                          <th>Status</th>
                          <th>Updated</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <CampaignListSkeleton />
                      </tbody>
                    </Table>
                  </div>
                </div>
                <div className="d-grid gap-3 d-md-none">
                  <CampaignCardSkeleton />
                </div>
              </>
            ) : showEmptyState ? (
              <div className="text-center py-5">
                <Icon icon="solar:megaphone-bold-duotone" width="64" height="64" className="text-muted mb-3" style={{ opacity: 0.5 }} />
                <h5 className="fw-semibold text-dark mb-2">{hasFilters ? 'No campaigns match your filters' : 'No membership campaigns found'}</h5>
                <p className="text-muted mb-4">
                  {hasFilters ? 'Try adjusting your search or filter criteria.' : 'Create your first membership campaign to get started.'}
                </p>
                {hasFilters ? (
                  <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  can('membership_campaigns:create') && (
                    <Link href="/community-care/membership/campaigns/create" className="btn btn-primary btn-sm">
                      <Icon icon="solar:add-circle-bold" className="me-1" />
                      Create New Campaign
                    </Link>
                  )
                )}
              </div>
            ) : showTable ? (
              <>
                <div className="d-none d-md-block">
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                      <thead>
                        <tr>
                          <th style={{ width: '34%' }}>Campaign</th>
                          <th style={{ width: '26%' }}>Schedule</th>
                          <th style={{ width: '18%' }}>Status</th>
                          <th style={{ width: '12%' }}>Updated</th>
                          <th className="text-end" style={{ width: '10%' }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map((item) => {
                          const offerState = getScheduleState(
                            item.offerStartAt,
                            item.offerEndAt,
                            { active: 'Active', upcoming: 'Upcoming', expired: 'Expired' },
                            new Date(),
                          )
                          const applicationState = getApplicationState(item.applicationStartAt, item.applicationEndAt)
                          const isRowActionLoading = actionLoading && actionTargetId === item.id

                          return (
                            <tr key={item.id}>
                              <td>
                                <div className="fw-semibold text-dark">{item.titleEn}</div>
                                <div className="small text-muted mb-1">{item.titleBn || 'No Bangla title'}</div>
                                <div className="small text-muted d-flex align-items-center gap-2">
                                  <code className="text-secondary d-inline-block text-truncate" style={{ maxWidth: '100%' }} title={item.slug}>
                                    {item.slug}
                                  </code>
                                </div>
                              </td>
                              <td>
                                <div className="d-grid gap-2">
                                  <div>
                                    <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                                      Offer
                                    </div>
                                    <div className="small">{formatDateRange(item.offerStartAt, item.offerEndAt)}</div>
                                  </div>
                                  <div>
                                    <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                                      Apply
                                    </div>
                                    <div className="small">{formatDateRange(item.applicationStartAt, item.applicationEndAt)}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="d-grid gap-1">
                                  <div>
                                    <StatusBadge
                                      status={item.status}
                                      label={getPrimaryStatusLabel(item.status)}
                                      variant={getStatusTone(item.status)}
                                    />
                                  </div>
                                  <div className="small text-muted">
                                    Offer: <span className={`fw-semibold text-${offerState.tone}`}>{offerState.label}</span>
                                  </div>
                                  <div className="small text-muted">
                                    Applications: <span className={`fw-semibold text-${applicationState.tone}`}>{applicationState.label}</span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="small fw-semibold text-dark" title={formatDateTime(item.updatedAt)}>
                                  {item.updatedAt ? formatDate(item.updatedAt) : 'Not configured'}
                                </div>
                              </td>
                              <td className="text-end">
                                <CampaignActions
                                  campaign={item}
                                  canRead={canRead}
                                  canUpdate={canUpdate}
                                  canDelete={canDelete}
                                  loading={isRowActionLoading}
                                  onDelete={handleDelete}
                                  onCopySlug={handleCopySlug}
                                />
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </Table>
                  </div>
                </div>

                <div className="d-grid gap-3 d-md-none">
                  {campaigns.map((item) => {
                    const offerState = getScheduleState(
                      item.offerStartAt,
                      item.offerEndAt,
                      { active: 'Active', upcoming: 'Upcoming', expired: 'Expired' },
                      new Date(),
                    )
                    const applicationState = getApplicationState(item.applicationStartAt, item.applicationEndAt)
                    const isCardActionLoading = actionLoading && actionTargetId === item.id

                    return (
                      <Card key={item.id} className="border shadow-sm">
                        <Card.Body className="d-grid gap-3">
                          <div className="d-flex align-items-start justify-content-between gap-2">
                            <div className="min-w-0">
                              <div className="fw-semibold text-dark">{item.titleEn}</div>
                              <div className="small text-muted">{item.titleBn || 'No Bangla title'}</div>
                              <code className="text-secondary d-block text-truncate mt-1" title={item.slug}>
                                {item.slug}
                              </code>
                            </div>
                            <Dropdown align="end">
                              <Dropdown.Toggle size="sm" variant="outline-secondary" className="no-caret" disabled={isCardActionLoading}>
                                <Icon icon="solar:menu-dots-bold" />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                {(canUpdate || canRead) && (
                                  <Dropdown.Item
                                    as={Link}
                                    href={`/community-care/membership/campaigns/${item.id}/edit`}
                                    className="d-flex align-items-center gap-2">
                                    <Icon icon={canUpdate ? 'solar:pen-bold' : 'solar:eye-bold'} className="text-primary" />
                                    {canUpdate ? 'Edit campaign' : 'Open campaign'}
                                  </Dropdown.Item>
                                )}
                                {canRead && (
                                  <Dropdown.Item
                                    as={Link}
                                    href={`/community-care/membership/campaigns/${item.id}/edit?step=review`}
                                    className="d-flex align-items-center gap-2">
                                    <Icon icon="solar:eye-bold" className="text-info" />
                                    Preview
                                  </Dropdown.Item>
                                )}
                                <Dropdown.Item
                                  className="d-flex align-items-center gap-2"
                                  onClick={() => handleCopySlug(item.slug)}
                                  disabled={isCardActionLoading}>
                                  <Icon icon="solar:copy-bold" className="text-secondary" />
                                  Copy slug
                                </Dropdown.Item>
                                {canDelete && (
                                  <>
                                    <Dropdown.Divider />
                                    <Dropdown.Item
                                      className="d-flex align-items-center gap-2 text-danger"
                                      onClick={() => handleDelete(item)}
                                      disabled={isCardActionLoading}>
                                      <Icon icon="solar:trash-bin-trash-bold" className="text-danger" />
                                      Delete
                                    </Dropdown.Item>
                                  </>
                                )}
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>

                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <StatusBadge status={item.status} label={getPrimaryStatusLabel(item.status)} variant={getStatusTone(item.status)} />
                            <span className="small text-muted">
                              Offer: <span className={`fw-semibold text-${offerState.tone}`}>{offerState.label}</span>
                            </span>
                            <span className="small text-muted">
                              Applications: <span className={`fw-semibold text-${applicationState.tone}`}>{applicationState.label}</span>
                            </span>
                          </div>

                          <div className="small d-grid gap-2">
                            <div>
                              <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                                Offer
                              </div>
                              <div>{formatDateRange(item.offerStartAt, item.offerEndAt)}</div>
                            </div>
                            <div>
                              <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                                Applications
                              </div>
                              <div>{formatDateRange(item.applicationStartAt, item.applicationEndAt)}</div>
                            </div>
                            <div className="text-muted" title={formatDateTime(item.updatedAt)}>
                              Updated: {item.updatedAt ? formatDate(item.updatedAt) : 'Not configured'}
                            </div>
                          </div>

                          {(canUpdate || canRead) && (
                            <div className="d-grid">
                              <Link
                                href={
                                  canUpdate
                                    ? `/community-care/membership/campaigns/${item.id}/edit`
                                    : `/community-care/membership/campaigns/${item.id}/edit?step=review`
                                }
                                className={`btn btn-soft-primary btn-sm${isCardActionLoading ? ' disabled' : ''}`}
                                aria-disabled={isCardActionLoading}>
                                {canUpdate ? 'Edit Campaign' : 'View Campaign'}
                              </Link>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    )
                  })}
                </div>

                {data?.meta && (
                  <Pagination
                    page={data.meta.page}
                    limit={data.meta.limit}
                    total={data.meta.total}
                    totalPages={data.meta.totalPages}
                    hasPrev={data.meta.hasPrev}
                    hasNext={data.meta.hasNext}
                    onPageChange={setPage}
                    onLimitChange={(nextLimit) => {
                      if (!PAGE_SIZE_OPTIONS.includes(nextLimit as (typeof PAGE_SIZE_OPTIONS)[number])) return
                      setLimit(nextLimit)
                      setPage(1)
                    }}
                    label="campaigns"
                  />
                )}
              </>
            ) : null}
          </LoadingOverlay>
        </Card.Body>
      </Card>
    </div>
  )
}
