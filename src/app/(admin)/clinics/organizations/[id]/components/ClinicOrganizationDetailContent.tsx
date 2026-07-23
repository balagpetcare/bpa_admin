'use client'

import { useCallback } from 'react'
import { Card, Button, Row, Col, Badge, Alert } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import MediaPreview from '@/components/ui/MediaPreview'
import { confirmDialog, confirmPermanentDelete } from '@/components/ui/ConfirmDialog'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { clinicsApi, type ClinicOrganization } from '@/lib/api/clinics.api'
import { ApiError } from '@/lib/api'

export default function ClinicOrganizationDetailContent({ id }: { id: string }) {
  const { can, isSuperAdmin: isGlobalSuperAdmin } = usePermission()
  const router = useRouter()
  const fetchFn = useCallback(() => clinicsApi.organizations.getById(id), [id])
  const { data, loading, error, refetch } = useApi(fetchFn, [id])
  const { mutate, loading: mutating } = useApiMutation<unknown, unknown>()

  if (loading)
    return (
      <LoadingOverlay loading>
        <div className="p-5" />
      </LoadingOverlay>
    )

  if (error) {
    const isNotFound = error instanceof ApiError && error.status === 404
    return (
      <div className="container-fluid">
        <PageHeader
          title="Clinic Organization"
          breadcrumbs={[{ label: 'Clinic Directory' }, { label: 'Organizations', href: '/clinics/organizations' }]}
        />
        {isNotFound ? (
          <Alert variant="warning">
            This organization could not be found. It may have been permanently deleted.
            <div className="mt-2">
              <Link href="/clinics/organizations" className="btn btn-sm btn-outline-secondary">
                Back to organizations
              </Link>
            </div>
          </Alert>
        ) : (
          <>
            <ApiErrorAlert error={error as ApiError} />
            <Button variant="outline-secondary" size="sm" onClick={refetch}>
              <Icon icon="solar:refresh-bold" className="me-1" />
              Retry
            </Button>
          </>
        )}
      </div>
    )
  }

  if (!data) return null
  const org: ClinicOrganization = data
  const branchCount = org._count?.branches ?? 0
  const canUpdate = can('clinic_organizations:update')
  const canArchive = can('clinic_organizations:archive')
  const canRestore = can('clinic_organizations:restore')

  async function handleTogglePublished() {
    await mutate(() => clinicsApi.organizations.setPublished(id, !org.published), undefined)
    refetch()
  }

  async function handleArchive() {
    const ok = await confirmDialog({
      title: `Archive "${org.name}"?`,
      text: 'It and its branches will be hidden from the public directory. Restorable later.',
      variant: 'warning',
      confirmText: 'Archive',
    })
    if (!ok) return
    await mutate(() => clinicsApi.organizations.archive(id), undefined)
    refetch()
  }

  async function handleRestore() {
    await mutate(() => clinicsApi.organizations.restore(id), undefined)
    refetch()
  }

  async function handleDelete() {
    if (branchCount > 0) {
      await confirmDialog({
        title: 'Cannot permanently delete this organization',
        text: `It still has ${branchCount} branch(es). Archive or delete those branches first.`,
        variant: 'warning',
        confirmText: 'OK',
      })
      return
    }
    const confirmation = await confirmPermanentDelete(org.slug, 'clinic organization')
    if (!confirmation) return
    await mutate(() => clinicsApi.organizations.remove(id, confirmation), undefined)
    router.push('/clinics/organizations')
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title={org.name}
        breadcrumbs={[{ label: 'Clinic Directory' }, { label: 'Organizations', href: '/clinics/organizations' }, { label: org.name }]}
        action={
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" onClick={() => router.push('/clinics/organizations')}>
              Back to list
            </Button>
            {canUpdate && (
              <Link href={`/clinics/organizations/${id}/edit`} className="btn btn-primary">
                <Icon icon="solar:pen-bold" className="me-1" />
                Edit
              </Link>
            )}
          </div>
        }
      />

      {org.archivedAt && (
        <Alert variant="secondary">
          This organization is archived (since {new Date(org.archivedAt).toLocaleString()}) and is never shown on the public directory.
        </Alert>
      )}

      <div className="d-flex flex-wrap gap-2 mb-3">
        {canUpdate && !org.archivedAt && (
          <Button variant={org.published ? 'soft-warning' : 'soft-success'} size="sm" onClick={handleTogglePublished} disabled={mutating}>
            <Icon icon={org.published ? 'solar:eye-closed-bold' : 'solar:eye-bold'} className="me-1" />
            {org.published ? 'Unpublish' : 'Publish'}
          </Button>
        )}
        {canArchive && !org.archivedAt && (
          <Button variant="soft-warning" size="sm" onClick={handleArchive} disabled={mutating}>
            <Icon icon="solar:archive-down-bold" className="me-1" />
            Archive
          </Button>
        )}
        {canRestore && org.archivedAt && (
          <Button variant="soft-info" size="sm" onClick={handleRestore} disabled={mutating}>
            <Icon icon="solar:refresh-bold" className="me-1" />
            Restore
          </Button>
        )}
        {isGlobalSuperAdmin && (
          <Button variant="soft-danger" size="sm" onClick={handleDelete} disabled={mutating}>
            <Icon icon="solar:trash-bin-trash-bold" className="me-1" />
            Delete permanently
          </Button>
        )}
      </div>

      <Row className="g-3">
        <Col lg={7}>
          <Card className="mb-3">
            <Card.Header className="fw-semibold">Images</Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <div className="small text-muted mb-1">Clinic Logo</div>
                  {org.logoMedia || org.logoUrl ? (
                    <MediaPreview
                      media={org.logoMedia ?? { url: org.logoUrl }}
                      alt={`${org.name} logo`}
                      fit="contain"
                      className="rounded border bg-light"
                      style={{ height: 120, width: '100%' }}
                    />
                  ) : (
                    <span className="text-muted small">Not set</span>
                  )}
                </Col>
                <Col md={6}>
                  <div className="small text-muted mb-1">Cover Image</div>
                  {org.coverMedia || org.coverImageUrl ? (
                    <MediaPreview
                      media={org.coverMedia ?? { url: org.coverImageUrl }}
                      alt={`${org.name} cover`}
                      fit="cover"
                      className="rounded border bg-light"
                      style={{ height: 120, width: '100%' }}
                    />
                  ) : (
                    <span className="text-muted small">Not set</span>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header className="fw-semibold">Organization Profile</Card.Header>
            <Card.Body>
              <dl className="row mb-0">
                <dt className="col-sm-3">Name</dt>
                <dd className="col-sm-9">{org.name}</dd>
                <dt className="col-sm-3">Slug</dt>
                <dd className="col-sm-9">{org.slug}</dd>
                <dt className="col-sm-3">Description</dt>
                <dd className="col-sm-9">{org.description || <span className="text-muted">Not set</span>}</dd>
                <dt className="col-sm-3">Website</dt>
                <dd className="col-sm-9">{org.website || <span className="text-muted">Not set</span>}</dd>
                <dt className="col-sm-3">Email</dt>
                <dd className="col-sm-9">{org.email || <span className="text-muted">Not set</span>}</dd>
              </dl>
            </Card.Body>
          </Card>

          {(org.socialLinks?.length ?? 0) > 0 && (
            <Card className="mb-3">
              <Card.Header className="fw-semibold">Social Links</Card.Header>
              <Card.Body>
                <ul className="mb-0 ps-3">
                  {org.socialLinks.map((s, i) => (
                    <li key={i}>
                      <Badge bg="secondary-subtle" text="secondary" className="me-2">
                        {s.platform}
                      </Badge>
                      <a href={s.url} target="_blank" rel="noreferrer">
                        {s.label || s.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          )}

          <Card>
            <Card.Header className="fw-semibold d-flex justify-content-between align-items-center">
              Branches ({branchCount})
              {can('clinic_branches:create') && (
                <Link href={`/clinics/create?organizationId=${id}`} className="btn btn-sm btn-outline-primary">
                  <Icon icon="solar:add-circle-bold" className="me-1" />
                  Add branch
                </Link>
              )}
            </Card.Header>
            <Card.Body>
              <Link href={`/clinics?organizationId=${id}`} className="btn btn-sm btn-outline-secondary">
                View this organization&apos;s branches
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card>
            <Card.Header className="fw-semibold">Status</Card.Header>
            <Card.Body>
              <dl className="row mb-0">
                <dt className="col-sm-6">Published</dt>
                <dd className="col-sm-6">
                  <Badge bg={org.published ? 'success-subtle' : 'secondary-subtle'} text={org.published ? 'success' : 'secondary'}>
                    {org.published ? 'Published' : 'Unpublished'}
                  </Badge>
                </dd>
                <dt className="col-sm-6">Featured</dt>
                <dd className="col-sm-6">{org.featured ? 'Yes' : 'No'}</dd>
                <dt className="col-sm-6">Verification</dt>
                <dd className="col-sm-6">
                  <Badge bg="secondary-subtle" text="secondary">
                    {org.verificationStatus}
                  </Badge>
                </dd>
                <dt className="col-sm-6">Claimed</dt>
                <dd className="col-sm-6">{org.claimedStatus}</dd>
                <dt className="col-sm-6">Created</dt>
                <dd className="col-sm-6">{new Date(org.createdAt).toLocaleDateString()}</dd>
                <dt className="col-sm-6">Last updated</dt>
                <dd className="col-sm-6">{new Date(org.updatedAt).toLocaleString()}</dd>
              </dl>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
