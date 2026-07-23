'use client'

import { useCallback } from 'react'
import { Card, Button, Row, Col, Badge, Alert, Table } from 'react-bootstrap'
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
import { clinicsApi, type ClinicBranch, type ClinicTriState } from '@/lib/api/clinics.api'
import { ApiError } from '@/lib/api'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function triLabel(v: ClinicTriState): string {
  return v === 'UNKNOWN' ? 'Unknown' : v === 'YES' ? 'Yes' : 'No'
}

const WARNING_LABELS: Record<string, string> = {
  missing_coordinates: 'No coordinates',
  missing_phone: 'No phone',
  missing_hours: 'No hours',
  not_verified: 'Not verified',
}

export default function ClinicBranchDetailContent({ id }: { id: string }) {
  const { can, isSuperAdmin: isGlobalSuperAdmin } = usePermission()
  const router = useRouter()
  const fetchFn = useCallback(() => clinicsApi.branches.getById(id), [id])
  const { data, loading, error, refetch } = useApi(fetchFn, [id])
  const { mutate, loading: mutating } = useApiMutation<ClinicBranch | void, unknown>()

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
        <PageHeader title="Clinic Branch" breadcrumbs={[{ label: 'Clinic Directory' }, { label: 'Clinics & Branches', href: '/clinics' }]} />
        {isNotFound ? (
          <Alert variant="warning">
            This clinic branch could not be found. It may have been permanently deleted.
            <div className="mt-2">
              <Link href="/clinics" className="btn btn-sm btn-outline-secondary">
                Back to list
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
  const branch: ClinicBranch = data
  const canUpdate = can('clinic_branches:update')
  const canArchive = can('clinic_branches:archive')
  const canRestore = can('clinic_branches:restore')
  const canCreate = can('clinic_branches:create')

  async function handleTogglePublished() {
    await mutate(() => clinicsApi.branches.setPublished(id, !branch.published), undefined)
    refetch()
  }

  async function handleArchive() {
    const ok = await confirmDialog({
      title: `Archive "${branch.branchName}"?`,
      text: 'It will be hidden from the public directory. Restorable later.',
      variant: 'warning',
      confirmText: 'Archive',
    })
    if (!ok) return
    await mutate(() => clinicsApi.branches.archive(id), undefined)
    refetch()
  }

  async function handleRestore() {
    await mutate(() => clinicsApi.branches.restore(id), undefined)
    refetch()
  }

  async function handleDuplicate() {
    const duplicated = await mutate(() => clinicsApi.branches.duplicate(id), undefined)
    if (duplicated) router.push(`/clinics/${duplicated.id}/edit`)
  }

  async function handleDelete() {
    const confirmation = await confirmPermanentDelete(branch.slug ?? branch.branchName, 'clinic branch')
    if (!confirmation) return
    await mutate(() => clinicsApi.branches.remove(id, confirmation), undefined)
    router.push('/clinics')
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title={branch.branchName}
        breadcrumbs={[{ label: 'Clinic Directory' }, { label: 'Clinics & Branches', href: '/clinics' }, { label: branch.branchName }]}
        action={
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" onClick={() => router.push('/clinics')}>
              Back to list
            </Button>
            {canUpdate && (
              <Link href={`/clinics/${id}/edit`} className="btn btn-primary">
                <Icon icon="solar:pen-bold" className="me-1" />
                Edit
              </Link>
            )}
          </div>
        }
      />

      {branch.archivedAt && (
        <Alert variant="secondary">
          This branch is archived (since {new Date(branch.archivedAt).toLocaleString()}) and is never shown on the public directory.
        </Alert>
      )}

      <div className="d-flex flex-wrap gap-2 mb-3">
        {canUpdate && !branch.archivedAt && (
          <Button variant={branch.published ? 'soft-warning' : 'soft-success'} size="sm" onClick={handleTogglePublished} disabled={mutating}>
            <Icon icon={branch.published ? 'solar:eye-closed-bold' : 'solar:eye-bold'} className="me-1" />
            {branch.published ? 'Unpublish' : 'Publish'}
          </Button>
        )}
        {canCreate && (
          <Button variant="outline-secondary" size="sm" onClick={handleDuplicate} disabled={mutating}>
            <Icon icon="solar:copy-bold" className="me-1" />
            Duplicate
          </Button>
        )}
        {canArchive && !branch.archivedAt && (
          <Button variant="soft-warning" size="sm" onClick={handleArchive} disabled={mutating}>
            <Icon icon="solar:archive-down-bold" className="me-1" />
            Archive
          </Button>
        )}
        {canRestore && branch.archivedAt && (
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

      {(branch.dataQualityWarnings ?? []).length > 0 && (
        <Alert variant="warning" className="d-flex flex-wrap gap-2 align-items-center">
          <strong className="me-2">Data quality:</strong>
          {(branch.dataQualityWarnings ?? []).map((w) => (
            <Badge key={w} bg="warning-subtle" text="warning">
              {WARNING_LABELS[w] ?? w}
            </Badge>
          ))}
        </Alert>
      )}

      <Row className="g-3">
        <Col lg={7}>
          <Card className="mb-3">
            <Card.Header className="fw-semibold">Location &amp; Contact</Card.Header>
            <Card.Body>
              <dl className="row mb-0">
                <dt className="col-sm-4">Organization</dt>
                <dd className="col-sm-8">
                  {branch.organization ? (
                    <Link href={`/clinics/organizations/${branch.organization.id}`}>{branch.organization.name}</Link>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </dd>
                <dt className="col-sm-4">Address</dt>
                <dd className="col-sm-8">{branch.address || <span className="text-muted">Not set</span>}</dd>
                <dt className="col-sm-4">Area</dt>
                <dd className="col-sm-8">{branch.area || <span className="text-muted">Not set</span>}</dd>
                <dt className="col-sm-4">City Corporation</dt>
                <dd className="col-sm-8">{branch.cityCorporation || <span className="text-muted">Not set</span>}</dd>
                <dt className="col-sm-4">District</dt>
                <dd className="col-sm-8">{branch.district || <span className="text-muted">Not set</span>}</dd>
                <dt className="col-sm-4">Postal Code</dt>
                <dd className="col-sm-8">{branch.postalCode || <span className="text-muted">Not set</span>}</dd>
                <dt className="col-sm-4">Coordinates</dt>
                <dd className="col-sm-8">
                  {branch.latitude != null && branch.longitude != null ? (
                    `${branch.latitude}, ${branch.longitude}`
                  ) : (
                    <span className="text-muted">Not set</span>
                  )}
                </dd>
                <dt className="col-sm-4">Google Maps</dt>
                <dd className="col-sm-8">
                  {branch.googleMapUrl ? (
                    <a href={branch.googleMapUrl} target="_blank" rel="noreferrer">
                      Open map
                    </a>
                  ) : (
                    <span className="text-muted">Not set</span>
                  )}
                </dd>
                <dt className="col-sm-4">Email</dt>
                <dd className="col-sm-8">{branch.email || <span className="text-muted">Not set</span>}</dd>
              </dl>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header className="fw-semibold">Phone Numbers</Card.Header>
            <Card.Body>
              {branch.phones.length === 0 ? (
                <span className="text-muted">No phone numbers on file</span>
              ) : (
                <Table size="sm" className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Phone</th>
                      <th>Label</th>
                      <th>Primary</th>
                      <th>WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branch.phones.map((p, i) => (
                      <tr key={p.id ?? i}>
                        <td>{p.phoneNumber}</td>
                        <td>{p.label || '—'}</td>
                        <td>{p.isPrimary ? 'Yes' : 'No'}</td>
                        <td>{triLabel(p.whatsappAvailable)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header className="fw-semibold">Opening Hours</Card.Header>
            <Card.Body>
              {branch.openingHours.length === 0 ? (
                <span className="text-muted">Not set</span>
              ) : (
                <Table size="sm" className="align-middle mb-0">
                  <tbody>
                    {DAY_NAMES.map((day, dayOfWeek) => {
                      const h = branch.openingHours.find((oh) => oh.dayOfWeek === dayOfWeek)
                      return (
                        <tr key={dayOfWeek}>
                          <td className="fw-semibold" style={{ width: 120 }}>
                            {day}
                          </td>
                          <td>
                            {!h ? <span className="text-muted">Not set</span> : h.isClosed ? 'Closed' : `${h.opensAt ?? '?'} – ${h.closesAt ?? '?'}`}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header className="fw-semibold">Facilities, Services &amp; Animal Types</Card.Header>
            <Card.Body>
              <div className="mb-2">
                <div className="small text-muted mb-1">Facilities</div>
                {branch.facilities.length === 0 ? (
                  <span className="text-muted small">Not set</span>
                ) : (
                  <div className="d-flex flex-wrap gap-1">
                    {branch.facilities.map((f, i) => (
                      <Badge key={i} bg="secondary-subtle" text="secondary">
                        {f.facilityType.replace('_', ' ')}: {triLabel(f.available)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="mb-2">
                <div className="small text-muted mb-1">Services</div>
                {branch.services.length === 0 ? (
                  <span className="text-muted small">Not set</span>
                ) : (
                  <div className="d-flex flex-wrap gap-1">
                    {branch.services.map((s, i) => (
                      <Badge key={i} bg="info-subtle" text="info">
                        {s.serviceName}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="small text-muted mb-1">Supported Animal Types</div>
                {branch.animalTypes.length === 0 ? (
                  <span className="text-muted small">Not set</span>
                ) : (
                  <div className="d-flex flex-wrap gap-1">
                    {branch.animalTypes.map((a, i) => (
                      <Badge key={i} bg="primary-subtle" text="primary">
                        {a.animalType}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {branch.images.length > 0 && (
            <Card className="mb-3">
              <Card.Header className="fw-semibold">Images</Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {branch.images.map((img, i) => (
                    <div key={img.id ?? i} className="position-relative">
                      <MediaPreview
                        media={img.mediaFile ?? { url: img.url }}
                        alt={img.altText ?? ''}
                        fit="cover"
                        style={{ width: 120, height: 90, borderRadius: 4 }}
                      />
                      {img.isCover && (
                        <Badge bg="dark" className="position-absolute top-0 start-0 m-1">
                          Cover
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}

          {branch.importNotes && (
            <Card className="mb-3">
              <Card.Header className="fw-semibold">
                <Icon icon="solar:document-text-bold" className="me-1" />
                Import Notes (source data)
              </Card.Header>
              <Card.Body>
                <p className="mb-1">{branch.importNotes}</p>
                {branch.sources.length > 0 && (
                  <ul className="small mb-0">
                    {branch.sources.map((s, i) => (
                      <li key={i}>
                        <a href={s.sourceUrl} target="_blank" rel="noreferrer">
                          {s.sourceUrl}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={5}>
          <Card>
            <Card.Header className="fw-semibold">Status</Card.Header>
            <Card.Body>
              <dl className="row mb-0">
                <dt className="col-sm-6">Published</dt>
                <dd className="col-sm-6">
                  <Badge bg={branch.published ? 'success-subtle' : 'secondary-subtle'} text={branch.published ? 'success' : 'secondary'}>
                    {branch.published ? 'Published' : 'Unpublished'}
                  </Badge>
                </dd>
                <dt className="col-sm-6">Verification</dt>
                <dd className="col-sm-6">
                  <Badge bg="secondary-subtle" text="secondary">
                    {branch.verificationStatus}
                  </Badge>
                </dd>
                <dt className="col-sm-6">Last verified</dt>
                <dd className="col-sm-6">
                  {branch.lastVerifiedAt ? new Date(branch.lastVerifiedAt).toLocaleDateString() : <span className="text-muted">Never</span>}
                </dd>
                <dt className="col-sm-6">24-Hour Service</dt>
                <dd className="col-sm-6">{triLabel(branch.open24Hours)}</dd>
                <dt className="col-sm-6">Emergency</dt>
                <dd className="col-sm-6">{triLabel(branch.emergencyAvailability)}</dd>
                <dt className="col-sm-6">Appointment Required</dt>
                <dd className="col-sm-6">{triLabel(branch.appointmentRequired)}</dd>
                <dt className="col-sm-6">Created</dt>
                <dd className="col-sm-6">{new Date(branch.createdAt).toLocaleDateString()}</dd>
                <dt className="col-sm-6">Last updated</dt>
                <dd className="col-sm-6">{new Date(branch.updatedAt).toLocaleString()}</dd>
              </dl>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
