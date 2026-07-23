'use client'

import { useState, useCallback } from 'react'
import { Card, Button, Table, Row, Col, Form, Badge, Dropdown } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import MediaPreview from '@/components/ui/MediaPreview'
import Pagination from '@/components/ui/Pagination'
import { confirmDialog, confirmPermanentDelete } from '@/components/ui/ConfirmDialog'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { clinicsApi, type ClinicOrganization, type ClinicStatusFilter, type ClinicBulkAction } from '@/lib/api/clinics.api'
import type { ApiError } from '@/lib/api'

const STATUS_OPTIONS: { value: ClinicStatusFilter; label: string }[] = [
  { value: 'active', label: 'Active (not archived)' },
  { value: 'archived', label: 'Archived only' },
  { value: 'all', label: 'All (active + archived)' },
]

function statusBadge(org: ClinicOrganization) {
  if (org.archivedAt) {
    return (
      <Badge bg="dark-subtle" text="dark">
        Archived
      </Badge>
    )
  }
  return (
    <Badge bg={org.published ? 'success-subtle' : 'secondary-subtle'} text={org.published ? 'success' : 'secondary'}>
      {org.published ? 'Published' : 'Unpublished'}
    </Badge>
  )
}

export default function ClinicOrganizationListContent() {
  const { can, isSuperAdmin: isGlobalSuperAdmin } = usePermission()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ClinicStatusFilter>('active')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)
  const { mutate } = useApiMutation<unknown, unknown>()

  const fetchFn = useCallback(
    () => clinicsApi.organizations.list({ page, limit, search: search || undefined, status }),
    [page, limit, search, status],
  )
  const { data, loading, error, refetch } = useApi(fetchFn, [fetchFn])
  const items = data?.data ?? []
  const meta = data?.meta ?? null

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelected((prev) => (prev.size === items.length ? new Set() : new Set(items.map((i: ClinicOrganization) => i.id))))
  }

  async function handleTogglePublished(item: ClinicOrganization) {
    await mutate(() => clinicsApi.organizations.setPublished(item.id, !item.published), undefined)
    refetch()
  }

  async function handleArchive(item: ClinicOrganization) {
    const ok = await confirmDialog({
      title: `Archive "${item.name}"?`,
      text: 'It and any published branches will be hidden from the public directory. Restorable later.',
      variant: 'warning',
      confirmText: 'Archive',
    })
    if (!ok) return
    await mutate(() => clinicsApi.organizations.archive(item.id), undefined)
    refetch()
  }

  async function handleRestore(item: ClinicOrganization) {
    await mutate(() => clinicsApi.organizations.restore(item.id), undefined)
    refetch()
  }

  async function handleDelete(item: ClinicOrganization) {
    const confirmation = await confirmPermanentDelete(item.slug, 'clinic organization')
    if (!confirmation) return
    await mutate(() => clinicsApi.organizations.remove(item.id, confirmation), undefined)
    refetch()
  }

  async function handleBulkAction(action: ClinicBulkAction) {
    if (selected.size === 0) return
    const ok = await confirmDialog({
      title: `${action} ${selected.size} organization(s)?`,
      variant: action === 'archive' ? 'warning' : 'info',
      confirmText: action,
    })
    if (!ok) return
    setBulkBusy(true)
    try {
      await clinicsApi.organizations.bulkAction(Array.from(selected), action)
      setSelected(new Set())
      refetch()
    } finally {
      setBulkBusy(false)
    }
  }

  const canUpdate = can('clinic_organizations:update')
  const canArchive = can('clinic_organizations:archive')
  const canRestore = can('clinic_organizations:restore')

  return (
    <div className="container-fluid">
      <PageHeader
        title="Clinic Organizations"
        breadcrumbs={[{ label: 'Clinic Directory' }, { label: 'Organizations' }]}
        action={
          can('clinic_organizations:create') ? (
            <Link href="/clinics/organizations/create" className="btn btn-primary">
              <Icon icon="solar:add-circle-bold" className="me-1" />
              Add Organization
            </Link>
          ) : undefined
        }
      />
      <ApiErrorAlert error={error as ApiError | null} />
      <Card>
        <Card.Body>
          <Row className="g-2 mb-3">
            <Col md={6}>
              <Form.Control
                placeholder="Search organization name or slug..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </Col>
            <Col md={3}>
              <Form.Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as ClinicStatusFilter)
                  setPage(1)
                }}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Form.Select>
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
                <Icon icon="solar:buildings-broken" className="fs-36 mb-2 d-block mx-auto" />
                No clinic organizations found for these filters.
              </div>
            ) : (
              <Table hover className="table-centered align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 32 }}>
                      <Form.Check checked={items.length > 0 && selected.size === items.length} onChange={toggleSelectAll} />
                    </th>
                    <th>Organization</th>
                    <th>Branches</th>
                    <th>Verification</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: ClinicOrganization) => (
                    <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/clinics/organizations/${item.id}`)}>
                      <td onClick={(e) => e.stopPropagation()}>
                        <Form.Check checked={selected.has(item.id)} onChange={() => toggleSelected(item.id)} />
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {(item.logoMedia || item.logoUrl) && (
                            <MediaPreview
                              media={item.logoMedia ?? { url: item.logoUrl }}
                              alt={item.name}
                              fit="contain"
                              style={{ width: 36, height: 36, borderRadius: 4, flexShrink: 0 }}
                            />
                          )}
                          <div>
                            <div className="fw-semibold">
                              {item.name}
                              {item.featured && (
                                <Badge bg="warning-subtle" text="warning" className="ms-2">
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <div className="text-muted small">{item.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td>{item._count?.branches ?? 0}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <Badge bg="secondary-subtle" text="secondary">
                          {item.verificationStatus}
                        </Badge>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>{statusBadge(item)}</td>
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        <Dropdown align="end">
                          <Dropdown.Toggle size="sm" variant="soft-secondary" id={`org-actions-${item.id}`}>
                            <Icon icon="solar:menu-dots-bold" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => router.push(`/clinics/organizations/${item.id}`)}>
                              <Icon icon="solar:eye-bold" className="me-2" />
                              View
                            </Dropdown.Item>
                            {canUpdate && (
                              <Dropdown.Item onClick={() => router.push(`/clinics/organizations/${item.id}/edit`)}>
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
              label="organizations"
            />
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
