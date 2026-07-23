'use client'

import { useCallback, useState } from 'react'
import { Card, Form, Button, Row, Col, Table, Alert } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import MediaPickerInput from '@/components/ui/MediaPickerInput'
import { confirmDialog, confirmPermanentDelete } from '@/components/ui/ConfirmDialog'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning'
import {
  clinicsApi,
  type ClinicOrganization,
  type ClinicVerificationStatus,
  type ClinicClaimStatus,
  type ClinicSocialLink,
  type ClinicSocialPlatform,
} from '@/lib/api/clinics.api'
import type { ApiError } from '@/lib/api'

const VERIFICATION_OPTIONS: ClinicVerificationStatus[] = ['UNKNOWN', 'UNVERIFIED', 'VERIFIED', 'REJECTED']
const CLAIM_OPTIONS: ClinicClaimStatus[] = ['UNCLAIMED', 'PENDING', 'CLAIMED']
const SOCIAL_PLATFORMS: ClinicSocialPlatform[] = ['FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'WEBSITE', 'OTHER']

export default function ClinicOrganizationEditContent({ id }: { id: string }) {
  const { can, isSuperAdmin: isGlobalSuperAdmin } = usePermission()
  const router = useRouter()
  const fetchFn = useCallback(() => clinicsApi.organizations.getById(id), [id])
  const { data, loading, error, refetch } = useApi(fetchFn, [id])
  const { mutate, loading: saving } = useApiMutation<unknown, unknown>()
  const [saved, setSaved] = useState(false)

  if (loading)
    return (
      <LoadingOverlay loading>
        <div className="p-5" />
      </LoadingOverlay>
    )
  if (error) return <ApiErrorAlert error={error as ApiError | null} />
  if (!data) return null

  const org: ClinicOrganization = data
  const canUpdate = can('clinic_organizations:update')
  const canArchive = can('clinic_organizations:archive')
  const canRestore = can('clinic_organizations:restore')
  const branchCount = org._count?.branches ?? 0

  async function saveCoreFields(patch: Partial<ClinicOrganization> & { socialLinks?: ClinicSocialLink[] }) {
    setSaved(false)
    await mutate(() => clinicsApi.organizations.update(id, patch), undefined)
    setSaved(true)
    refetch()
  }

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

  async function handleCancel() {
    router.push(`/clinics/organizations/${id}`)
  }

  return (
    <div className="container-fluid pb-5">
      <PageHeader
        title={`Edit: ${org.name}`}
        breadcrumbs={[
          { label: 'Clinic Directory' },
          { label: 'Organizations', href: '/clinics/organizations' },
          { label: org.name, href: `/clinics/organizations/${id}` },
          { label: 'Edit' },
        ]}
      />

      {/* Sticky action bar — lifecycle actions stay reachable regardless of scroll position. */}
      <div
        className="d-flex flex-wrap gap-2 align-items-center justify-content-between p-2 mb-3 bg-body border rounded shadow-sm"
        style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="d-flex gap-2 flex-wrap">
          <Button variant="outline-secondary" size="sm" onClick={handleCancel} disabled={saving}>
            <Icon icon="solar:arrow-left-bold" className="me-1" />
            Cancel
          </Button>
          {canUpdate && !org.archivedAt && (
            <Button variant={org.published ? 'soft-warning' : 'soft-success'} size="sm" onClick={handleTogglePublished} disabled={saving}>
              <Icon icon={org.published ? 'solar:eye-closed-bold' : 'solar:eye-bold'} className="me-1" />
              {org.published ? 'Unpublish' : 'Publish'}
            </Button>
          )}
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {canArchive && !org.archivedAt && (
            <Button variant="soft-warning" size="sm" onClick={handleArchive} disabled={saving}>
              <Icon icon="solar:archive-down-bold" className="me-1" />
              Archive
            </Button>
          )}
          {canRestore && org.archivedAt && (
            <Button variant="soft-info" size="sm" onClick={handleRestore} disabled={saving}>
              <Icon icon="solar:refresh-bold" className="me-1" />
              Restore
            </Button>
          )}
          {isGlobalSuperAdmin && (
            <Button variant="soft-danger" size="sm" onClick={handleDelete} disabled={saving}>
              <Icon icon="solar:trash-bin-trash-bold" className="me-1" />
              Delete permanently
            </Button>
          )}
        </div>
      </div>

      {saved && <div className="alert alert-success py-2">Saved.</div>}
      {org.archivedAt && (
        <Alert variant="secondary">
          This organization is archived (since {new Date(org.archivedAt).toLocaleString()}) and is never shown on the public directory.
        </Alert>
      )}

      <Row className="g-3">
        <Col lg={7}>
          <Card className="mb-3">
            <Card.Header className="fw-semibold">Organization Profile</Card.Header>
            <Card.Body>
              <OrgCoreForm org={org} disabled={!canUpdate || saving} onSave={saveCoreFields} />
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header className="fw-semibold">Images</Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <MediaPickerInput
                    label="Clinic Logo"
                    value={org.logoMediaId}
                    previewUrl={org.logoUrl}
                    onChange={(fileId) => saveCoreFields({ logoMediaId: fileId })}
                    emptyLabel="Select logo"
                    disabled={!canUpdate || saving}
                    helpText={org.logoMediaId ? undefined : org.logoUrl ? 'Showing a legacy URL — select from the library to replace it.' : undefined}
                  />
                </Col>
                <Col md={6}>
                  <MediaPickerInput
                    label="Cover Image"
                    value={org.coverMediaId}
                    previewUrl={org.coverImageUrl}
                    onChange={(fileId) => saveCoreFields({ coverMediaId: fileId })}
                    emptyLabel="Select cover image"
                    disabled={!canUpdate || saving}
                    helpText={
                      org.coverMediaId ? undefined : org.coverImageUrl ? 'Showing a legacy URL — select from the library to replace it.' : undefined
                    }
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header className="fw-semibold">Social Links</Card.Header>
            <Card.Body>
              <SocialLinksEditor
                links={org.socialLinks ?? []}
                disabled={!canUpdate || saving}
                onSave={(socialLinks) => saveCoreFields({ socialLinks })}
              />
            </Card.Body>
          </Card>

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
          <Card className="mb-3">
            <Card.Header className="fw-semibold">Status</Card.Header>
            <Card.Body>
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <span>Published</span>
                <Form.Check
                  type="switch"
                  checked={org.published}
                  disabled={!canUpdate || saving || !!org.archivedAt}
                  onChange={handleTogglePublished}
                />
              </div>
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <span>Featured</span>
                <Form.Check
                  type="switch"
                  checked={org.featured}
                  disabled={!canUpdate || saving}
                  onChange={(e) => saveCoreFields({ featured: e.target.checked })}
                />
              </div>
              <Form.Group className="mb-2">
                <Form.Label className="small text-muted">Verification Status</Form.Label>
                <Form.Select
                  value={org.verificationStatus}
                  disabled={!canUpdate || saving}
                  onChange={(e) => saveCoreFields({ verificationStatus: e.target.value as ClinicVerificationStatus })}>
                  {VERIFICATION_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="small text-muted">Claimed Status</Form.Label>
                <Form.Select
                  value={org.claimedStatus}
                  disabled={!canUpdate || saving}
                  onChange={(e) => saveCoreFields({ claimedStatus: e.target.value as ClinicClaimStatus })}>
                  {CLAIM_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {branchCount > 0 && (
                <div className="small text-muted mt-2">
                  Permanent deletion is blocked while {branchCount} branch(es) exist under this organization.
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

function OrgCoreForm({
  org,
  disabled,
  onSave,
}: {
  org: ClinicOrganization
  disabled: boolean
  onSave: (patch: Partial<ClinicOrganization>) => void
}) {
  const [form, setForm] = useState({
    name: org.name,
    description: org.description ?? '',
    website: org.website ?? '',
    email: org.email ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const isDirty =
    JSON.stringify(form) !==
    JSON.stringify({
      name: org.name,
      description: org.description ?? '',
      website: org.website ?? '',
      email: org.email ?? '',
    })
  useUnsavedChangesWarning(isDirty)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (!form.name.trim()) nextErrors.name = 'Name is required'
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSave({
      name: form.name,
      description: form.description || null,
      website: form.website || null,
      email: form.email || null,
    })
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-2">
        <Form.Label className="small text-muted">Name</Form.Label>
        <Form.Control
          value={form.name}
          disabled={disabled}
          isInvalid={!!errors.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label className="small text-muted">Slug</Form.Label>
        <Form.Control value={org.slug} disabled readOnly />
        <Form.Text className="text-muted">The slug is set at creation and stays stable for public URLs.</Form.Text>
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label className="small text-muted">Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={form.description}
          disabled={disabled}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </Form.Group>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-2">
            <Form.Label className="small text-muted">Website</Form.Label>
            <Form.Control value={form.website} disabled={disabled} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="small text-muted">Email</Form.Label>
            <Form.Control
              type="email"
              value={form.email}
              disabled={disabled}
              isInvalid={!!errors.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Button type="submit" disabled={disabled}>
        Save
      </Button>
    </Form>
  )
}

function SocialLinksEditor({
  links,
  disabled,
  onSave,
}: {
  links: ClinicSocialLink[]
  disabled: boolean
  onSave: (links: ClinicSocialLink[]) => void
}) {
  const [rows, setRows] = useState<ClinicSocialLink[]>(links)

  function updateRow(index: number, patch: Partial<ClinicSocialLink>) {
    setRows((r) => r.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }
  function addRow() {
    setRows((r) => [...r, { platform: 'WEBSITE', url: '', label: '' }])
  }
  function removeRow(index: number) {
    setRows((r) => r.filter((_, i) => i !== index))
  }

  return (
    <>
      <Table size="sm" className="align-middle mb-2">
        <thead>
          <tr>
            <th style={{ width: 140 }}>Platform</th>
            <th>URL</th>
            <th>Label</th>
            <th style={{ width: 40 }} />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>
                <Form.Select
                  size="sm"
                  value={row.platform}
                  disabled={disabled}
                  onChange={(e) => updateRow(i, { platform: e.target.value as ClinicSocialPlatform })}>
                  {SOCIAL_PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Form.Select>
              </td>
              <td>
                <Form.Control size="sm" value={row.url} disabled={disabled} onChange={(e) => updateRow(i, { url: e.target.value })} />
              </td>
              <td>
                <Form.Control size="sm" value={row.label ?? ''} disabled={disabled} onChange={(e) => updateRow(i, { label: e.target.value })} />
              </td>
              <td>
                <Button variant="soft-danger" size="sm" disabled={disabled} onClick={() => removeRow(i)}>
                  <Icon icon="solar:trash-bin-trash-bold" />
                </Button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-muted small py-2">
                No social links yet
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <div className="d-flex gap-2">
        <Button size="sm" variant="outline-secondary" disabled={disabled} onClick={addRow}>
          <Icon icon="solar:add-circle-bold" className="me-1" />
          Add link
        </Button>
        <Button size="sm" disabled={disabled} onClick={() => onSave(rows.filter((r) => r.url.trim().length > 0))}>
          Save social links
        </Button>
      </div>
    </>
  )
}
