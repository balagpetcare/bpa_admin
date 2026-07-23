'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Row, Col, Form, Badge, Dropdown } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import MediaPreview from '@/components/ui/MediaPreview'
import Pagination from '@/components/ui/Pagination'
import { confirmDialog, confirmPermanentDelete } from '@/components/ui/ConfirmDialog'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import {
  clinicsApi,
  type ClinicBranch,
  type ClinicVerificationStatus,
  type ClinicStatusFilter,
  type ClinicTriState,
  type ClinicBulkAction,
} from '@/lib/api/clinics.api'
import type { ApiError } from '@/lib/api'

const VERIFICATION_OPTIONS: { value: ClinicVerificationStatus | ''; label: string }[] = [
  { value: '', label: 'All Verification Statuses' },
  { value: 'UNKNOWN', label: 'Unknown' },
  { value: 'UNVERIFIED', label: 'Unverified' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'REJECTED', label: 'Rejected' },
]

const PUBLISHED_OPTIONS: { value: 'all' | 'true' | 'false'; label: string }[] = [
  { value: 'all', label: 'All (Published + Unpublished)' },
  { value: 'true', label: 'Published only' },
  { value: 'false', label: 'Unpublished only' },
]

const STATUS_OPTIONS: { value: ClinicStatusFilter; label: string }[] = [
  { value: 'active', label: 'Active (not archived)' },
  { value: 'archived', label: 'Archived only' },
  { value: 'all', label: 'All (active + archived)' },
]

const TRISTATE_FILTER_OPTIONS: { value: ClinicTriState | ''; label: string }[] = [
  { value: '', label: 'Any' },
  { value: 'YES', label: 'Yes' },
  { value: 'NO', label: 'No' },
  { value: 'UNKNOWN', label: 'Unknown' },
]

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'createdAt', label: 'Created date' },
  { value: 'updatedAt', label: 'Updated date' },
  { value: 'lastVerifiedAt', label: 'Verification date' },
] as const

function verificationBadge(status: ClinicVerificationStatus) {
  const map: Record<ClinicVerificationStatus, { bg: string; text: string }> = {
    UNKNOWN: { bg: 'secondary-subtle', text: 'secondary' },
    UNVERIFIED: { bg: 'warning-subtle', text: 'warning' },
    VERIFIED: { bg: 'success-subtle', text: 'success' },
    REJECTED: { bg: 'danger-subtle', text: 'danger' },
  }
  const { bg, text } = map[status]
  return (
    <Badge bg={bg} text={text}>
      {status}
    </Badge>
  )
}

function statusBadge(item: ClinicBranch) {
  if (item.archivedAt) {
    return (
      <Badge bg="dark-subtle" text="dark">
        Archived
      </Badge>
    )
  }
  return (
    <Badge bg={item.published ? 'success-subtle' : 'secondary-subtle'} text={item.published ? 'success' : 'secondary'}>
      {item.published ? 'Published' : 'Unpublished'}
    </Badge>
  )
}

const WARNING_LABELS: Record<string, string> = {
  missing_coordinates: 'No coordinates',
  missing_phone: 'No phone',
  missing_hours: 'No hours',
  not_verified: 'Not verified',
}

export default function ClinicBranchListContent() {
  const { can, isSuperAdmin: isGlobalSuperAdmin } = usePermission()
  const router = useRouter()
  const searchParams = useSearchParams()
  const organizationId = searchParams.get('organizationId') ?? undefined
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [search, setSearch] = useState('')
  const [published, setPublished] = useState<'all' | 'true' | 'false'>('all')
  const [status, setStatus] = useState<ClinicStatusFilter>('active')
  const [verificationStatus, setVerificationStatus] = useState<ClinicVerificationStatus | ''>('')
  const [district, setDistrict] = useState('')
  const [cityCorporation, setCityCorporation] = useState('')
  const [emergencyAvailability, setEmergencyAvailability] = useState<ClinicTriState | ''>('')
  const [open24Hours, setOpen24Hours] = useState<ClinicTriState | ''>('')
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]['value']>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)
  const { mutate } = useApiMutation<unknown, unknown>()

  const fetchFn = useCallback(
    () =>
      clinicsApi.branches.list({
        page,
        limit,
        search: search || undefined,
        published,
        status,
        organizationId,
        verificationStatus: verificationStatus || undefined,
        district: district || undefined,
        cityCorporation: cityCorporation || undefined,
        emergencyAvailability: emergencyAvailability || undefined,
        open24Hours: open24Hours || undefined,
        sortBy,
        sortDir,
      }),
    [
      page,
      limit,
      search,
      published,
      status,
      organizationId,
      verificationStatus,
      district,
      cityCorporation,
      emergencyAvailability,
      open24Hours,
      sortBy,
      sortDir,
    ],
  )
  const { data, loading, error, refetch } = useApi(fetchFn, [fetchFn])
  const items = data?.data ?? []
  const meta = data?.meta ?? null

  function resetFiltersButKeepSort() {
    setPage(1)
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelected((prev) => (prev.size === items.length ? new Set() : new Set(items.map((i: ClinicBranch) => i.id))))
  }

  async function handleTogglePublished(item: ClinicBranch) {
    const verb = item.published ? 'unpublish' : 'publish'
    const ok = await confirmDialog({
      title: `${verb === 'publish' ? 'Publish' : 'Unpublish'} "${item.branchName}"?`,
      text: verb === 'publish' ? 'It will become visible on the public directory.' : 'It will be hidden from the public directory.',
      variant: 'info',
      confirmText: verb === 'publish' ? 'Publish' : 'Unpublish',
    })
    if (!ok) return
    await mutate(() => clinicsApi.branches.setPublished(item.id, !item.published), undefined)
    refetch()
  }

  async function handleArchive(item: ClinicBranch) {
    const ok = await confirmDialog({
      title: `Archive "${item.branchName}"?`,
      text: 'It will be hidden from the public directory and marked archived. You can restore it later.',
      variant: 'warning',
      confirmText: 'Archive',
    })
    if (!ok) return
    await mutate(() => clinicsApi.branches.archive(item.id), undefined)
    refetch()
  }

  async function handleRestore(item: ClinicBranch) {
    const ok = await confirmDialog({
      title: `Restore "${item.branchName}"?`,
      text: 'It will become active again (still unpublished until you publish it).',
      variant: 'info',
      confirmText: 'Restore',
    })
    if (!ok) return
    await mutate(() => clinicsApi.branches.restore(item.id), undefined)
    refetch()
  }

  async function handleDuplicate(item: ClinicBranch) {
    await mutate(() => clinicsApi.branches.duplicate(item.id), undefined)
    refetch()
  }

  async function handleDelete(item: ClinicBranch) {
    const confirmation = await confirmPermanentDelete(item.slug ?? item.branchName, 'clinic branch')
    if (!confirmation) return
    await mutate(() => clinicsApi.branches.remove(item.id, confirmation), undefined)
    refetch()
  }

  async function handleBulkAction(action: ClinicBulkAction) {
    if (selected.size === 0) return
    const ok = await confirmDialog({
      title: `${action} ${selected.size} branch(es)?`,
      variant: action === 'archive' ? 'warning' : 'info',
      confirmText: action,
    })
    if (!ok) return
    setBulkBusy(true)
    try {
      await clinicsApi.branches.bulkAction(Array.from(selected), action)
      setSelected(new Set())
      refetch()
    } finally {
      setBulkBusy(false)
    }
  }

  const canUpdate = can('clinic_branches:update')
  const canCreate = can('clinic_branches:create')
  const canArchive = can('clinic_branches:archive')
  const canRestore = can('clinic_branches:restore')

  return (
    <div className="container-fluid">
      <PageHeader
        title="Clinics & Branches"
        breadcrumbs={[{ label: 'Clinic Directory' }, { label: 'Clinics & Branches' }]}
        action={
          <div className="d-flex gap-2">
            {can('clinic_organizations:create') && (
              <Link href="/clinics/organizations/create" className="btn btn-outline-primary">
                <Icon icon="solar:buildings-bold" className="me-1" />
                Add Organization
              </Link>
            )}
            {canCreate && (
              <Link href="/clinics/create" className="btn btn-primary">
                <Icon icon="solar:add-circle-bold" className="me-1" />
                Add Branch
              </Link>
            )}
          </div>
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <Row className="g-2 mb-2">
            <Col md={4}>
              <Form.Control
                placeholder="Search organization, branch, phone, area, address, district..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  resetFiltersButKeepSort()
                }}
              />
            </Col>
            <Col md={2}>
              <Form.Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as ClinicStatusFilter)
                  resetFiltersButKeepSort()
                }}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={published}
                onChange={(e) => {
                  setPublished(e.target.value as 'all' | 'true' | 'false')
                  resetFiltersButKeepSort()
                }}>
                {PUBLISHED_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={verificationStatus}
                onChange={(e) => {
                  setVerificationStatus(e.target.value as ClinicVerificationStatus | '')
                  resetFiltersButKeepSort()
                }}>
                {VERIFICATION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
          <Row className="g-2 mb-3">
            <Col md={3}>
              <Form.Control
                placeholder="District"
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value)
                  resetFiltersButKeepSort()
                }}
              />
            </Col>
            <Col md={3}>
              <Form.Control
                placeholder="City corporation"
                value={cityCorporation}
                onChange={(e) => {
                  setCityCorporation(e.target.value)
                  resetFiltersButKeepSort()
                }}
              />
            </Col>
            <Col md={2}>
              <Form.Select
                value={emergencyAvailability}
                onChange={(e) => {
                  setEmergencyAvailability(e.target.value as ClinicTriState | '')
                  resetFiltersButKeepSort()
                }}>
                {TRISTATE_FILTER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    Emergency: {o.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={open24Hours}
                onChange={(e) => {
                  setOpen24Hours(e.target.value as ClinicTriState | '')
                  resetFiltersButKeepSort()
                }}>
                {TRISTATE_FILTER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    24h: {o.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2} className="d-flex gap-1">
              <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value as (typeof SORT_OPTIONS)[number]['value'])}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    Sort: {o.label}
                  </option>
                ))}
              </Form.Select>
              <Button variant="outline-secondary" onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))} title="Toggle sort direction">
                <Icon icon={sortDir === 'asc' ? 'solar:sort-vertical-bold' : 'solar:sort-vertical-bold'} />
                {sortDir === 'asc' ? '↑' : '↓'}
              </Button>
            </Col>
          </Row>

          {selected.size > 0 && (
            <div className="d-flex align-items-center gap-2 mb-3 p-2 bg-light rounded">
              <span className="small fw-semibold">{selected.size} selected</span>
              {canUpdate && (
                <>
                  <Button size="sm" variant="soft-success" disabled={bulkBusy} onClick={() => handleBulkAction('publish')}>
                    Publish
                  </Button>
                  <Button size="sm" variant="soft-warning" disabled={bulkBusy} onClick={() => handleBulkAction('unpublish')}>
                    Unpublish
                  </Button>
                </>
              )}
              {canArchive && status !== 'archived' && (
                <Button size="sm" variant="soft-danger" disabled={bulkBusy} onClick={() => handleBulkAction('archive')}>
                  Archive
                </Button>
              )}
              {canRestore && status === 'archived' && (
                <Button size="sm" variant="soft-info" disabled={bulkBusy} onClick={() => handleBulkAction('restore')}>
                  Restore
                </Button>
              )}
              <Button size="sm" variant="link" className="text-muted" onClick={() => setSelected(new Set())}>
                Clear selection
              </Button>
            </div>
          )}

          <LoadingOverlay loading={loading}>
            {items.length === 0 && !loading ? (
              <div className="text-center py-5 text-muted">
                <Icon icon="solar:hospital-broken" className="fs-36 mb-2 d-block mx-auto" />
                No clinic branches found for these filters.
              </div>
            ) : (
              <Table hover className="table-centered align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 32 }}>
                      <Form.Check checked={items.length > 0 && selected.size === items.length} onChange={toggleSelectAll} />
                    </th>
                    <th>Branch</th>
                    <th>Organization</th>
                    <th>Area / District</th>
                    <th>Verification</th>
                    <th>Data Quality</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: ClinicBranch) => (
                    <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/clinics/${item.id}`)}>
                      <td onClick={(e) => e.stopPropagation()}>
                        <Form.Check checked={selected.has(item.id)} onChange={() => toggleSelected(item.id)} />
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {(() => {
                            const cover = item.images.find((img) => img.isCover) ?? item.images[0]
                            return cover ? (
                              <MediaPreview
                                media={cover.mediaFile ?? { url: cover.url }}
                                alt={item.branchName}
                                fit="cover"
                                style={{ width: 40, height: 40, borderRadius: 4, flexShrink: 0 }}
                              />
                            ) : null
                          })()}
                          <div>
                            <div className="fw-semibold">{item.branchName}</div>
                            <div className="text-muted small">
                              {item.phones.length > 0 ? item.phones.map((p) => p.phoneNumber).join(', ') : 'No phone on file'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{item.organization?.name ?? '—'}</td>
                      <td>
                        {item.area ?? '—'}
                        {item.district ? ` / ${item.district}` : ''}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>{verificationBadge(item.verificationStatus)}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {(item.dataQualityWarnings ?? []).length === 0 ? (
                          <span className="text-success small">
                            <Icon icon="solar:check-circle-bold" className="me-1" />
                            OK
                          </span>
                        ) : (
                          <div className="d-flex flex-wrap gap-1">
                            {(item.dataQualityWarnings ?? []).map((w) => (
                              <Badge key={w} bg="warning-subtle" text="warning">
                                {WARNING_LABELS[w] ?? w}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>{statusBadge(item)}</td>
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        <Dropdown align="end">
                          <Dropdown.Toggle size="sm" variant="soft-secondary" id={`row-actions-${item.id}`}>
                            <Icon icon="solar:menu-dots-bold" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => router.push(`/clinics/${item.id}`)}>
                              <Icon icon="solar:eye-bold" className="me-2" />
                              View
                            </Dropdown.Item>
                            {canUpdate && (
                              <Dropdown.Item onClick={() => router.push(`/clinics/${item.id}/edit`)}>
                                <Icon icon="solar:pen-bold" className="me-2" />
                                Edit
                              </Dropdown.Item>
                            )}
                            {canUpdate && !item.archivedAt && (
                              <Dropdown.Item onClick={() => handleTogglePublished(item)}>
                                <Icon icon={item.published ? 'solar:eye-closed-bold' : 'solar:eye-bold'} className="me-2" />
                                {item.published ? 'Unpublish' : 'Publish'}
                              </Dropdown.Item>
                            )}
                            {canCreate && (
                              <Dropdown.Item onClick={() => handleDuplicate(item)}>
                                <Icon icon="solar:copy-bold" className="me-2" />
                                Duplicate branch
                              </Dropdown.Item>
                            )}
                            {canArchive && !item.archivedAt && (
                              <Dropdown.Item onClick={() => handleArchive(item)}>
                                <Icon icon="solar:archive-down-bold" className="me-2" />
                                Archive
                              </Dropdown.Item>
                            )}
                            {canRestore && item.archivedAt && (
                              <Dropdown.Item onClick={() => handleRestore(item)}>
                                <Icon icon="solar:refresh-bold" className="me-2" />
                                Restore
                              </Dropdown.Item>
                            )}
                            {isGlobalSuperAdmin && (
                              <>
                                <Dropdown.Divider />
                                <Dropdown.Item className="text-danger" onClick={() => handleDelete(item)}>
                                  <Icon icon="solar:trash-bin-trash-bold" className="me-2" />
                                  Delete permanently
                                </Dropdown.Item>
                              </>
                            )}
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </LoadingOverlay>

          {meta && (
            <Pagination
              page={meta.page}
              limit={limit}
              total={meta.total}
              totalPages={meta.totalPages}
              hasPrev={meta.hasPrev}
              hasNext={meta.hasNext}
              onPageChange={setPage}
              onLimitChange={setLimit}
              label="branches"
            />
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
