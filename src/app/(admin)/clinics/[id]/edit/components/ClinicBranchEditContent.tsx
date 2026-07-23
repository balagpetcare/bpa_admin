'use client'

import { useCallback, useState } from 'react'
import { Card, Form, Button, Row, Col, Badge, Table, Alert } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import MediaPickerInput from '@/components/ui/MediaPickerInput'
import MediaPreview from '@/components/ui/MediaPreview'
import { confirmDialog, confirmPermanentDelete } from '@/components/ui/ConfirmDialog'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning'
import {
  clinicsApi,
  type ClinicBranch,
  type ClinicBranchPhone,
  type ClinicBranchOpeningHours,
  type ClinicBranchFacility,
  type ClinicBranchService,
  type ClinicBranchAnimalTypeEntry,
  type ClinicBranchImage,
  type ClinicFacilityType,
  type ClinicAnimalType,
  type ClinicTriState,
  type ClinicVerificationStatus,
} from '@/lib/api/clinics.api'
import type { ApiError } from '@/lib/api'
import type { MediaFile } from '@/types/bpa.types'

const TRI_STATE_OPTIONS: ClinicTriState[] = ['UNKNOWN', 'YES', 'NO']
const VERIFICATION_OPTIONS: ClinicVerificationStatus[] = ['UNKNOWN', 'UNVERIFIED', 'VERIFIED', 'REJECTED']
const FACILITY_TYPES: ClinicFacilityType[] = ['LABORATORY', 'SURGERY', 'IMAGING', 'PHARMACY', 'HOSPITALIZATION', 'HOME_SERVICE']
const ANIMAL_TYPES: ClinicAnimalType[] = ['DOG', 'CAT', 'BIRD', 'RABBIT', 'REPTILE', 'SMALL_MAMMAL', 'EXOTIC', 'OTHER']
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function TriStateSelect({ value, onChange, disabled }: { value: ClinicTriState; onChange: (v: ClinicTriState) => void; disabled?: boolean }) {
  return (
    <Form.Select size="sm" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value as ClinicTriState)}>
      {TRI_STATE_OPTIONS.map((o) => (
        <option key={o} value={o}>
          {o === 'UNKNOWN' ? 'Unknown' : o === 'YES' ? 'Yes' : 'No'}
        </option>
      ))}
    </Form.Select>
  )
}

export default function ClinicBranchEditContent({ id }: { id: string }) {
  const { can, isSuperAdmin: isGlobalSuperAdmin } = usePermission()
  const router = useRouter()
  const fetchFn = useCallback(() => clinicsApi.branches.getById(id), [id])
  const { data, loading, error, refetch } = useApi(fetchFn, [id])
  const { mutate, loading: saving } = useApiMutation<unknown, unknown>()
  const [notice, setNotice] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)

  if (loading)
    return (
      <LoadingOverlay loading>
        <div className="p-5" />
      </LoadingOverlay>
    )
  if (error)
    return (
      <div className="container-fluid">
        <PageHeader title="Edit Clinic Branch" breadcrumbs={[{ label: 'Clinic Directory' }, { label: 'Clinics & Branches', href: '/clinics' }]} />
        <ApiErrorAlert error={error as ApiError | null} />
        <Button variant="outline-secondary" size="sm" onClick={refetch}>
          <Icon icon="solar:refresh-bold" className="me-1" />
          Retry
        </Button>
      </div>
    )
  if (!data) return null

  const canUpdate = can('clinic_branches:update')
  const canArchive = can('clinic_branches:archive')
  const canRestore = can('clinic_branches:restore')
  const disabled = !canUpdate || saving

  function notify(type: 'success' | 'danger', text: string) {
    setNotice({ type, text })
    window.setTimeout(() => setNotice(null), 4000)
  }

  async function runMutation(fn: () => Promise<unknown>, successMessage: string) {
    try {
      await mutate(fn, undefined)
      notify('success', successMessage)
      refetch()
    } catch (err) {
      notify('danger', err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  async function saveCoreFields(patch: Partial<ClinicBranch>) {
    await runMutation(() => clinicsApi.branches.update(id, patch), 'Saved.')
  }

  async function savePhones(phones: ClinicBranchPhone[]) {
    await runMutation(() => clinicsApi.branches.updateRelated(id, { phones }), 'Phone numbers saved.')
  }

  async function saveOpeningHours(openingHours: ClinicBranchOpeningHours[]) {
    await runMutation(() => clinicsApi.branches.updateRelated(id, { openingHours }), 'Opening hours saved.')
  }

  async function saveFacilities(facilities: ClinicBranchFacility[]) {
    await runMutation(() => clinicsApi.branches.updateRelated(id, { facilities }), 'Facilities saved.')
  }

  async function saveServices(services: ClinicBranchService[]) {
    await runMutation(() => clinicsApi.branches.updateRelated(id, { services }), 'Services saved.')
  }

  async function saveAnimalTypes(animalTypes: ClinicBranchAnimalTypeEntry[]) {
    await runMutation(() => clinicsApi.branches.updateRelated(id, { animalTypes }), 'Animal types saved.')
  }

  async function handleTogglePublished() {
    await runMutation(() => clinicsApi.branches.setPublished(id, !branch.published), branch.published ? 'Unpublished.' : 'Published.')
  }

  async function handleArchive() {
    const ok = await confirmDialog({
      title: `Archive "${branch.branchName}"?`,
      text: 'It will be hidden from the public directory. Restorable later.',
      variant: 'warning',
      confirmText: 'Archive',
    })
    if (!ok) return
    await runMutation(() => clinicsApi.branches.archive(id), 'Archived.')
  }

  async function handleRestore() {
    await runMutation(() => clinicsApi.branches.restore(id), 'Restored.')
  }

  async function handleDelete() {
    const confirmation = await confirmPermanentDelete(branch.slug ?? branch.branchName, 'clinic branch')
    if (!confirmation) return
    await mutate(() => clinicsApi.branches.remove(id, confirmation), undefined)
    router.push('/clinics')
  }

  async function handleCancel() {
    router.push(`/clinics/${id}`)
  }

  const branch: ClinicBranch = data
  const facilityByType = new Map(branch.facilities.map((f) => [f.facilityType, f]))

  return (
    <div className="container-fluid pb-5">
      <PageHeader
        title={`Edit: ${branch.branchName}`}
        breadcrumbs={[
          { label: 'Clinic Directory' },
          { label: 'Clinics & Branches', href: '/clinics' },
          { label: branch.branchName, href: `/clinics/${id}` },
          { label: 'Edit' },
        ]}
      />

      {/* Sticky action bar: kept reachable regardless of scroll position on this long form. */}
      <div
        className="d-flex flex-wrap gap-2 align-items-center justify-content-between p-2 mb-3 bg-body border rounded shadow-sm"
        style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="d-flex gap-2 flex-wrap">
          <Button variant="outline-secondary" size="sm" onClick={handleCancel} disabled={saving}>
            <Icon icon="solar:arrow-left-bold" className="me-1" />
            Cancel
          </Button>
          {canUpdate && !branch.archivedAt && (
            <Button variant={branch.published ? 'soft-warning' : 'soft-success'} size="sm" onClick={handleTogglePublished} disabled={saving}>
              <Icon icon={branch.published ? 'solar:eye-closed-bold' : 'solar:eye-bold'} className="me-1" />
              {branch.published ? 'Unpublish' : 'Save & Publish'}
            </Button>
          )}
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {canArchive && !branch.archivedAt && (
            <Button variant="soft-warning" size="sm" onClick={handleArchive} disabled={saving}>
              <Icon icon="solar:archive-down-bold" className="me-1" />
              Archive
            </Button>
          )}
          {canRestore && branch.archivedAt && (
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

      {notice && (
        <Alert variant={notice.type} className="py-2">
          {notice.text}
        </Alert>
      )}
      {!canUpdate && (
        <Alert variant="warning" className="py-2">
          You do not have permission to edit clinic branches. Fields are shown read-only.
        </Alert>
      )}
      {branch.archivedAt && (
        <Alert variant="secondary" className="py-2">
          This branch is archived. Restore it before publishing.
        </Alert>
      )}

      <Row className="g-3">
        <Col lg={7}>
          <Card className="mb-3">
            <Card.Header className="fw-semibold">Organization</Card.Header>
            <Card.Body>
              {branch.organization ? (
                <Link href={`/clinics/organizations/${branch.organization.id}`}>{branch.organization.name}</Link>
              ) : (
                <span className="text-muted">—</span>
              )}
              <div className="small text-muted mt-1">The organization a branch belongs to cannot be changed after creation.</div>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header className="fw-semibold">Location & Contact</Card.Header>
            <Card.Body>
              <BranchCoreForm branch={branch} disabled={disabled} onSave={saveCoreFields} />
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header className="fw-semibold">Phone Numbers</Card.Header>
            <Card.Body>
              <PhoneEditor phones={branch.phones} disabled={disabled} onSave={savePhones} />
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header className="fw-semibold">Opening Hours</Card.Header>
            <Card.Body>
              <OpeningHoursEditor hours={branch.openingHours} disabled={disabled} onSave={saveOpeningHours} />
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header className="fw-semibold">Facilities</Card.Header>
            <Card.Body>
              <Table size="sm" className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>Facility</th>
                    <th style={{ width: 160 }}>Available</th>
                  </tr>
                </thead>
                <tbody>
                  {FACILITY_TYPES.map((type) => {
                    const existing = facilityByType.get(type)
                    return (
                      <tr key={type}>
                        <td>{type.replace('_', ' ')}</td>
                        <td>
                          <TriStateSelect
                            value={existing?.available ?? 'UNKNOWN'}
                            disabled={disabled}
                            onChange={(v) => {
                              const next = FACILITY_TYPES.map((t) => ({
                                facilityType: t,
                                available: t === type ? v : (facilityByType.get(t)?.available ?? 'UNKNOWN'),
                                notes: facilityByType.get(t)?.notes ?? null,
                              }))
                              saveFacilities(next)
                            }}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header className="fw-semibold">Services</Card.Header>
            <Card.Body>
              <ServicesEditor services={branch.services} disabled={disabled} onSave={saveServices} />
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header className="fw-semibold">Supported Animal Types</Card.Header>
            <Card.Body>
              <AnimalTypesEditor animalTypes={branch.animalTypes} disabled={disabled} onSave={saveAnimalTypes} />
            </Card.Body>
          </Card>

          <Card>
            <Card.Header className="fw-semibold">Images</Card.Header>
            <Card.Body>
              <ImagesEditor branchId={id} images={branch.images} disabled={disabled} onChanged={refetch} />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="mb-3">
            <Card.Header className="fw-semibold">Status</Card.Header>
            <Card.Body>
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <span>Published</span>
                <Form.Check type="switch" checked={branch.published} disabled={disabled || !!branch.archivedAt} onChange={handleTogglePublished} />
              </div>

              <Form.Group className="mb-2">
                <Form.Label className="small text-muted">Verification Status</Form.Label>
                <Form.Select
                  value={branch.verificationStatus}
                  disabled={disabled}
                  onChange={(e) => saveCoreFields({ verificationStatus: e.target.value as ClinicVerificationStatus })}>
                  {VERIFICATION_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {branch.lastVerifiedAt && <div className="small text-muted">Last verified: {new Date(branch.lastVerifiedAt).toLocaleString()}</div>}

              <hr />

              <div className="mb-2 d-flex justify-content-between align-items-center">
                <span>24-Hour Service</span>
                <div style={{ width: 140 }}>
                  <TriStateSelect value={branch.open24Hours} disabled={disabled} onChange={(v) => saveCoreFields({ open24Hours: v })} />
                </div>
              </div>
              <div className="mb-2 d-flex justify-content-between align-items-center">
                <span>Emergency Availability</span>
                <div style={{ width: 140 }}>
                  <TriStateSelect
                    value={branch.emergencyAvailability}
                    disabled={disabled}
                    onChange={(v) => saveCoreFields({ emergencyAvailability: v })}
                  />
                </div>
              </div>
              <div className="mb-2 d-flex justify-content-between align-items-center">
                <span>Appointment Required</span>
                <div style={{ width: 140 }}>
                  <TriStateSelect
                    value={branch.appointmentRequired}
                    disabled={disabled}
                    onChange={(v) => saveCoreFields({ appointmentRequired: v })}
                  />
                </div>
              </div>
            </Card.Body>
          </Card>

          {(branch.dataQualityWarnings ?? []).length > 0 && (
            <Card className="mb-3 border-warning">
              <Card.Header className="fw-semibold text-warning">Data Quality Warnings</Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {(branch.dataQualityWarnings ?? []).map((w) => (
                    <Badge key={w} bg="warning-subtle" text="warning">
                      {w.replace('_', ' ')}
                    </Badge>
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
      </Row>
    </div>
  )
}

function BranchCoreForm({ branch, disabled, onSave }: { branch: ClinicBranch; disabled: boolean; onSave: (patch: Partial<ClinicBranch>) => void }) {
  const [form, setForm] = useState({
    branchName: branch.branchName,
    address: branch.address ?? '',
    area: branch.area ?? '',
    cityCorporation: branch.cityCorporation ?? '',
    district: branch.district ?? '',
    postalCode: branch.postalCode ?? '',
    latitude: branch.latitude?.toString() ?? '',
    longitude: branch.longitude?.toString() ?? '',
    googleMapUrl: branch.googleMapUrl ?? '',
    email: branch.email ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const original = {
    branchName: branch.branchName,
    address: branch.address ?? '',
    area: branch.area ?? '',
    cityCorporation: branch.cityCorporation ?? '',
    district: branch.district ?? '',
    postalCode: branch.postalCode ?? '',
    latitude: branch.latitude?.toString() ?? '',
    longitude: branch.longitude?.toString() ?? '',
    googleMapUrl: branch.googleMapUrl ?? '',
    email: branch.email ?? '',
  }
  const isDirty = JSON.stringify(form) !== JSON.stringify(original)
  useUnsavedChangesWarning(isDirty)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (!form.branchName.trim()) nextErrors.branchName = 'Branch name is required'
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address'
    if (form.latitude.trim() && Number.isNaN(Number(form.latitude))) nextErrors.latitude = 'Must be a number'
    if (form.longitude.trim() && Number.isNaN(Number(form.longitude))) nextErrors.longitude = 'Must be a number'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSave({
      branchName: form.branchName,
      address: form.address || null,
      area: form.area || null,
      cityCorporation: form.cityCorporation || null,
      district: form.district || null,
      postalCode: form.postalCode || null,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      googleMapUrl: form.googleMapUrl || null,
      email: form.email || null,
    })
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-2">
        <Form.Label className="small text-muted">Branch Name</Form.Label>
        <Form.Control
          value={form.branchName}
          disabled={disabled}
          isInvalid={!!errors.branchName}
          onChange={(e) => setForm((f) => ({ ...f, branchName: e.target.value }))}
        />
        <Form.Control.Feedback type="invalid">{errors.branchName}</Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label className="small text-muted">Address</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={form.address}
          disabled={disabled}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        />
      </Form.Group>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-2">
            <Form.Label className="small text-muted">Area</Form.Label>
            <Form.Control value={form.area} disabled={disabled} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-2">
            <Form.Label className="small text-muted">City Corporation</Form.Label>
            <Form.Control
              value={form.cityCorporation}
              disabled={disabled}
              onChange={(e) => setForm((f) => ({ ...f, cityCorporation: e.target.value }))}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-2">
            <Form.Label className="small text-muted">District</Form.Label>
            <Form.Control value={form.district} disabled={disabled} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))} />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-2">
            <Form.Label className="small text-muted">Postal Code</Form.Label>
            <Form.Control value={form.postalCode} disabled={disabled} onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-2">
            <Form.Label className="small text-muted">Latitude</Form.Label>
            <Form.Control
              placeholder="Leave blank if unknown — never guess"
              value={form.latitude}
              disabled={disabled}
              isInvalid={!!errors.latitude}
              onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
            />
            <Form.Control.Feedback type="invalid">{errors.latitude}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-2">
            <Form.Label className="small text-muted">Longitude</Form.Label>
            <Form.Control
              placeholder="Leave blank if unknown — never guess"
              value={form.longitude}
              disabled={disabled}
              isInvalid={!!errors.longitude}
              onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
            />
            <Form.Control.Feedback type="invalid">{errors.longitude}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Form.Group className="mb-2">
        <Form.Label className="small text-muted">Google Maps URL</Form.Label>
        <Form.Control value={form.googleMapUrl} disabled={disabled} onChange={(e) => setForm((f) => ({ ...f, googleMapUrl: e.target.value }))} />
      </Form.Group>
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
      <Button type="submit" disabled={disabled}>
        Save Changes
      </Button>
    </Form>
  )
}

function PhoneEditor({
  phones,
  disabled,
  onSave,
}: {
  phones: ClinicBranchPhone[]
  disabled: boolean
  onSave: (phones: ClinicBranchPhone[]) => void
}) {
  const [rows, setRows] = useState<ClinicBranchPhone[]>(
    phones.length > 0 ? phones : [{ phoneNumber: '', isPrimary: true, whatsappAvailable: 'UNKNOWN', sortOrder: 0 }],
  )

  function updateRow(index: number, patch: Partial<ClinicBranchPhone>) {
    setRows((r) => r.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function addRow() {
    setRows((r) => [...r, { phoneNumber: '', isPrimary: false, whatsappAvailable: 'UNKNOWN', sortOrder: r.length }])
  }

  function removeRow(index: number) {
    setRows((r) => r.filter((_, i) => i !== index))
  }

  return (
    <>
      <Table size="sm" className="align-middle mb-2">
        <thead>
          <tr>
            <th>Phone</th>
            <th>Label</th>
            <th style={{ width: 90 }}>Primary</th>
            <th style={{ width: 140 }}>WhatsApp</th>
            <th style={{ width: 40 }} />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>
                <Form.Control size="sm" value={row.phoneNumber} disabled={disabled} onChange={(e) => updateRow(i, { phoneNumber: e.target.value })} />
              </td>
              <td>
                <Form.Control size="sm" value={row.label ?? ''} disabled={disabled} onChange={(e) => updateRow(i, { label: e.target.value })} />
              </td>
              <td className="text-center">
                <Form.Check checked={row.isPrimary} disabled={disabled} onChange={(e) => updateRow(i, { isPrimary: e.target.checked })} />
              </td>
              <td>
                <TriStateSelect value={row.whatsappAvailable} disabled={disabled} onChange={(v) => updateRow(i, { whatsappAvailable: v })} />
              </td>
              <td>
                <Button variant="soft-danger" size="sm" disabled={disabled} onClick={() => removeRow(i)}>
                  <Icon icon="solar:trash-bin-trash-bold" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="d-flex gap-2">
        <Button size="sm" variant="outline-secondary" disabled={disabled} onClick={addRow}>
          <Icon icon="solar:add-circle-bold" className="me-1" />
          Add phone
        </Button>
        <Button size="sm" disabled={disabled} onClick={() => onSave(rows.filter((r) => r.phoneNumber.trim().length > 0))}>
          Save phones
        </Button>
      </div>
    </>
  )
}

function OpeningHoursEditor({
  hours,
  disabled,
  onSave,
}: {
  hours: ClinicBranchOpeningHours[]
  disabled: boolean
  onSave: (hours: ClinicBranchOpeningHours[]) => void
}) {
  const [rows, setRows] = useState<ClinicBranchOpeningHours[]>(
    DAY_NAMES.map((_, dayOfWeek) => hours.find((h) => h.dayOfWeek === dayOfWeek) ?? { dayOfWeek, opensAt: null, closesAt: null, isClosed: false }),
  )

  function updateRow(dayOfWeek: number, patch: Partial<ClinicBranchOpeningHours>) {
    setRows((r) => r.map((row) => (row.dayOfWeek === dayOfWeek ? { ...row, ...patch } : row)))
  }

  return (
    <>
      <Table size="sm" className="align-middle mb-2">
        <thead>
          <tr>
            <th>Day</th>
            <th style={{ width: 100 }}>Closed</th>
            <th style={{ width: 110 }}>Opens</th>
            <th style={{ width: 110 }}>Closes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.dayOfWeek}>
              <td>{DAY_NAMES[row.dayOfWeek]}</td>
              <td className="text-center">
                <Form.Check checked={row.isClosed} disabled={disabled} onChange={(e) => updateRow(row.dayOfWeek, { isClosed: e.target.checked })} />
              </td>
              <td>
                <Form.Control
                  size="sm"
                  type="time"
                  value={row.opensAt ?? ''}
                  disabled={disabled || row.isClosed}
                  onChange={(e) => updateRow(row.dayOfWeek, { opensAt: e.target.value || null })}
                />
              </td>
              <td>
                <Form.Control
                  size="sm"
                  type="time"
                  value={row.closesAt ?? ''}
                  disabled={disabled || row.isClosed}
                  onChange={(e) => updateRow(row.dayOfWeek, { closesAt: e.target.value || null })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button size="sm" disabled={disabled} onClick={() => onSave(rows)}>
        Save opening hours
      </Button>
    </>
  )
}

function ServicesEditor({
  services,
  disabled,
  onSave,
}: {
  services: ClinicBranchService[]
  disabled: boolean
  onSave: (services: ClinicBranchService[]) => void
}) {
  const [rows, setRows] = useState<ClinicBranchService[]>(services)

  function updateRow(index: number, patch: Partial<ClinicBranchService>) {
    setRows((r) => r.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }
  function addRow() {
    setRows((r) => [...r, { serviceName: '' }])
  }
  function removeRow(index: number) {
    setRows((r) => r.filter((_, i) => i !== index))
  }

  return (
    <>
      <Table size="sm" className="align-middle mb-2">
        <thead>
          <tr>
            <th>Service</th>
            <th style={{ width: 40 }} />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>
                <Form.Control size="sm" value={row.serviceName} disabled={disabled} onChange={(e) => updateRow(i, { serviceName: e.target.value })} />
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
              <td colSpan={2} className="text-center text-muted small py-2">
                No services yet
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <div className="d-flex gap-2">
        <Button size="sm" variant="outline-secondary" disabled={disabled} onClick={addRow}>
          <Icon icon="solar:add-circle-bold" className="me-1" />
          Add service
        </Button>
        <Button size="sm" disabled={disabled} onClick={() => onSave(rows.filter((r) => r.serviceName.trim().length > 0))}>
          Save services
        </Button>
      </div>
    </>
  )
}

function AnimalTypesEditor({
  animalTypes,
  disabled,
  onSave,
}: {
  animalTypes: ClinicBranchAnimalTypeEntry[]
  disabled: boolean
  onSave: (animalTypes: ClinicBranchAnimalTypeEntry[]) => void
}) {
  const [selected, setSelected] = useState<Set<ClinicAnimalType>>(new Set(animalTypes.map((a) => a.animalType)))

  function toggle(type: ClinicAnimalType) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  return (
    <>
      <div className="d-flex flex-wrap gap-3 mb-2">
        {ANIMAL_TYPES.map((type) => (
          <Form.Check key={type} label={type} checked={selected.has(type)} disabled={disabled} onChange={() => toggle(type)} />
        ))}
      </div>
      <Button size="sm" disabled={disabled} onClick={() => onSave(Array.from(selected).map((animalType) => ({ animalType })))}>
        Save animal types
      </Button>
    </>
  )
}

function ImagesEditor({
  branchId,
  images,
  disabled,
  onChanged,
}: {
  branchId: string
  images: ClinicBranchImage[]
  disabled: boolean
  onChanged: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  async function handleAddFromLibrary(fileId: string | null, file: MediaFile | null) {
    if (!fileId || !file) return
    setAddError(null)
    if (images.some((img) => img.mediaFileId === fileId)) {
      setAddError('This image is already in the gallery.')
      return
    }
    setBusy(true)
    try {
      await clinicsApi.branches.addImage(branchId, {
        url: file.url,
        mediaFileId: fileId,
        altText: file.altText ?? null,
        isCover: images.length === 0,
      })
      onChanged()
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Could not add this image')
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove(imageId: string | undefined) {
    if (!imageId) return
    setBusy(true)
    try {
      await clinicsApi.branches.removeImage(branchId, imageId)
      onChanged()
    } finally {
      setBusy(false)
    }
  }

  async function handleMakeCover(image: ClinicBranchImage) {
    if (!image.mediaFileId) return
    setBusy(true)
    try {
      // Re-adding the same media as cover after removing the old row is not
      // available as a single call — instead flip covers via the full
      // gallery replace, which already exists for exactly this kind of
      // batch update.
      await clinicsApi.branches.updateRelated(branchId, {
        images: images.map((img) => ({
          url: img.url,
          mediaFileId: img.mediaFileId,
          altText: img.altText,
          sortOrder: img.sortOrder,
          isCover: img.id === image.id,
        })),
      })
      onChanged()
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {addError && (
        <Alert variant="danger" className="py-2 small" dismissible onClose={() => setAddError(null)}>
          {addError}
        </Alert>
      )}
      {images.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          {images.map((img, i) => (
            <div key={img.id ?? i} className="position-relative">
              <MediaPreview
                media={img.mediaFile ?? { url: img.url }}
                alt={img.altText ?? ''}
                fit="cover"
                style={{ width: 120, height: 90, borderRadius: 4 }}
              />
              {img.isCover ? (
                <Badge bg="dark" className="position-absolute top-0 start-0 m-1">
                  Cover
                </Badge>
              ) : (
                <Button
                  variant="light"
                  size="sm"
                  className="position-absolute top-0 start-0 m-1 py-0 px-1"
                  style={{ fontSize: 10 }}
                  disabled={disabled || busy}
                  onClick={() => handleMakeCover(img)}
                  title="Make cover image">
                  Set cover
                </Button>
              )}
              <Button
                variant="soft-danger"
                size="sm"
                className="position-absolute top-0 end-0 m-1"
                disabled={disabled || busy}
                onClick={() => handleRemove(img.id)}>
                <Icon icon="solar:trash-bin-trash-bold" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <MediaPickerInput
        value={null}
        onChange={handleAddFromLibrary}
        disabled={disabled || busy}
        dialogTitle="Add Gallery Image"
        customTrigger={
          <Button size="sm" variant="outline-secondary" disabled={disabled || busy}>
            <Icon icon="solar:gallery-add-bold-duotone" className="me-1" />
            Add image from Media Library
          </Button>
        }
      />
    </>
  )
}
