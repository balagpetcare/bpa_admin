'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, Button, Table, Modal, Form, Alert, Badge, Row, Col } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { campaignsApi } from '@/lib/api/campaigns.api'
import type { ApiError } from '@/lib/api'
import type { CampaignDoctor, CampaignSession, Doctor, DoctorDutyRole } from '@/types/bpa.types'
import dayjs from 'dayjs'

const DUTY_ROLES: { value: DoctorDutyRole; label: string; color: string }[] = [
  { value: 'SIGNING_DOCTOR', label: 'Signing Doctor', color: 'danger' },
  { value: 'MEDICAL_SUPERVISOR', label: 'Medical Supervisor', color: 'warning' },
  { value: 'VACCINATOR', label: 'Vaccinator', color: 'success' },
  { value: 'EMERGENCY_SUPPORT', label: 'Emergency Support', color: 'info' },
]

const LEGACY_ROLES = ['vaccinator', 'lead_vet', 'supervisor', 'verifier', 'volunteer_vet']

function DutyBadge({
  duty,
  isSigningDoctor,
  isPrimarySupervisor,
}: {
  duty?: DoctorDutyRole | null
  isSigningDoctor?: boolean
  isPrimarySupervisor?: boolean
}) {
  const d = DUTY_ROLES.find((r) => r.value === duty)
  return (
    <div className="d-flex flex-wrap gap-1">
      {duty && <span className={`badge bg-${d?.color ?? 'secondary'}-subtle text-${d?.color ?? 'secondary'}`}>{d?.label ?? duty}</span>}
      {isSigningDoctor && (
        <span className="badge bg-danger text-white">
          <Icon icon="solar:pen-bold" className="me-1" />
          Signing
        </span>
      )}
      {isPrimarySupervisor && (
        <span className="badge bg-warning text-dark">
          <Icon icon="solar:crown-bold" className="me-1" />
          Primary Supervisor
        </span>
      )}
    </div>
  )
}

export default function DoctorsAssignment({ campaignId }: { campaignId: string }) {
  const { can } = usePermission()
  const canAssign = can('campaigns:assign')

  // Single assign modal
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [doctorId, setDoctorId] = useState('')
  const [role, setRole] = useState('vaccinator')
  const [doctorDuty, setDoctorDuty] = useState<DoctorDutyRole>('VACCINATOR')
  const [isSigningDoctor, setIsSigningDoctor] = useState(false)
  const [isPrimarySupervisor, setIsPrimarySupervisor] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [notes, setNotes] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Bulk assign modal
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkDoctorIds, setBulkDoctorIds] = useState<string[]>([])
  const [bulkDuty, setBulkDuty] = useState<DoctorDutyRole>('VACCINATOR')
  const [bulkSessionId, setBulkSessionId] = useState('')
  const [bulkSearch, setBulkSearch] = useState('')
  const [debouncedBulkSearch, setDebouncedBulkSearch] = useState('')

  const { mutate, loading: saving, error: mutationError, clearError } = useApiMutation<unknown, unknown>()

  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(h)
  }, [search])

  useEffect(() => {
    const h = setTimeout(() => setDebouncedBulkSearch(bulkSearch), 300)
    return () => clearTimeout(h)
  }, [bulkSearch])

  const assignedFn = useCallback(() => campaignsApi.listDoctors(campaignId), [campaignId])
  const { data: assigned, loading, error, refetch: refetchAssigned } = useApi(assignedFn, [campaignId])

  const sessionsFn = useCallback(() => campaignsApi.listSessions(campaignId), [campaignId])
  const { data: sessions } = useApi(sessionsFn, [campaignId])

  const availableFn = useCallback(
    () =>
      campaignsApi.getAvailableDoctors(campaignId, {
        search: debouncedSearch || undefined,
        limit: 100,
        includeAssigned: true,
      }),
    [campaignId, debouncedSearch],
  )
  const { data: availableData, loading: loadingAvailable, refetch: refetchAvailable } = useApi(availableFn, [campaignId, debouncedSearch])

  const bulkAvailFn = useCallback(
    () =>
      campaignsApi.getAvailableDoctors(campaignId, {
        search: debouncedBulkSearch || undefined,
        limit: 100,
        includeAssigned: true,
      }),
    [campaignId, debouncedBulkSearch],
  )
  const { data: bulkAvailData, loading: loadingBulkAvail } = useApi(bulkAvailFn, [campaignId, debouncedBulkSearch])

  const availableDoctors: Doctor[] = (() => {
    const raw = availableData as any
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    if (Array.isArray(raw?.data)) return raw.data
    if (Array.isArray(raw?.data?.items)) return raw.data.items
    if (Array.isArray(raw?.items)) return raw.items
    return []
  })()

  const bulkAvailDoctors: Doctor[] = (() => {
    const raw = bulkAvailData as any
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    if (Array.isArray(raw?.data)) return raw.data
    if (Array.isArray(raw?.data?.items)) return raw.data.items
    if (Array.isArray(raw?.items)) return raw.items
    return []
  })()

  const assignedList: CampaignDoctor[] = (() => {
    const raw = assigned as any
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    if (Array.isArray(raw?.data)) return raw.data
    return []
  })()

  // Check if there's already a signing doctor per scope
  function hasSigningDoctor(forSessionId?: string) {
    return assignedList.some((a) => a.isSigningDoctor && (forSessionId ? a.sessionId === forSessionId : !a.sessionId))
  }

  function openAddModal() {
    setEditingId(null)
    setDoctorId('')
    setRole('vaccinator')
    setDoctorDuty('VACCINATOR')
    setIsSigningDoctor(false)
    setIsPrimarySupervisor(false)
    setSessionId('')
    setNotes('')
    setSearch('')
    setSuccessMsg(null)
    clearError()
    setShowModal(true)
  }

  function openEditModal(a: CampaignDoctor) {
    setEditingId(a.id)
    setDoctorId(a.doctorId)
    setRole(a.role ?? 'vaccinator')
    setDoctorDuty(a.doctorDuty ?? 'VACCINATOR')
    setIsSigningDoctor(a.isSigningDoctor ?? false)
    setIsPrimarySupervisor(a.isPrimarySupervisor ?? false)
    setSessionId(a.sessionId ?? '')
    setNotes(a.notes ?? '')
    setSuccessMsg(null)
    clearError()
    setShowModal(true)
  }

  async function handleSave() {
    if (!editingId && !doctorId) return
    setSuccessMsg(null)
    clearError()

    let result
    if (editingId) {
      result = await mutate(
        () =>
          campaignsApi.updateDoctorAssignment(campaignId, editingId, {
            role,
            doctorDuty,
            isSigningDoctor,
            isPrimarySupervisor,
            notes: notes || null,
          }),
        undefined,
      )
    } else {
      result = await mutate(
        () =>
          campaignsApi.assignDoctor(campaignId, {
            doctorId,
            role,
            doctorDuty,
            isSigningDoctor,
            isPrimarySupervisor,
            sessionId: sessionId || undefined,
            notes: notes || null,
          }),
        undefined,
      )
    }

    if (result) {
      setShowModal(false)
      setSuccessMsg(editingId ? 'Doctor assignment updated.' : 'Doctor assigned successfully.')
      refetchAssigned()
      refetchAvailable()
    }
  }

  async function handleRemove(assignmentId: string) {
    if (!confirm('Remove this doctor from the campaign?')) return
    setSuccessMsg(null)
    clearError()
    const result = await mutate(() => campaignsApi.removeDoctorAssignment(campaignId, assignmentId), undefined)
    if (result !== null) {
      setSuccessMsg('Doctor assignment removed.')
      refetchAssigned()
      refetchAvailable()
    }
  }

  async function handleBulkAssign() {
    if (bulkDoctorIds.length === 0) return
    setSuccessMsg(null)
    clearError()
    const result = await mutate(
      () =>
        campaignsApi.bulkAssignDoctors(campaignId, {
          assignments: bulkDoctorIds.map((did) => ({
            doctorId: did,
            doctorDuty: bulkDuty,
            sessionId: bulkSessionId || undefined,
          })),
        }),
      undefined,
    )
    if (result) {
      setShowBulkModal(false)
      setBulkDoctorIds([])
      setBulkSearch('')
      setSuccessMsg('Bulk doctor assignment completed.')
      refetchAssigned()
      refetchAvailable()
    }
  }

  function toggleBulkDoctor(id: string) {
    setBulkDoctorIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const signingDoctors = assignedList.filter((a) => a.isSigningDoctor)

  return (
    <div className="container-fluid">
      <PageHeader
        title="Doctor Assignment"
        breadcrumbs={[{ label: 'Campaigns', href: '/campaigns' }, { label: 'Detail', href: `/campaigns/${campaignId}` }, { label: 'Doctors' }]}
        action={
          canAssign ? (
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => {
                  setBulkDoctorIds([])
                  setBulkSearch('')
                  setBulkDuty('VACCINATOR')
                  setBulkSessionId('')
                  clearError()
                  setShowBulkModal(true)
                }}>
                <Icon icon="solar:users-group-two-rounded-bold" className="me-1" />
                Bulk Assign
              </Button>
              <Button variant="primary" onClick={openAddModal}>
                <Icon icon="solar:add-circle-bold" className="me-1" />
                Assign Doctor
              </Button>
            </div>
          ) : undefined
        }
      />

      {successMsg && (
        <Alert variant="success" dismissible onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}
      <ApiErrorAlert error={error as ApiError | null} />

      {/* Signing doctor status */}
      {signingDoctors.length === 0 && (
        <Alert variant="warning" className="d-flex align-items-center gap-2">
          <Icon icon="solar:danger-triangle-bold" style={{ fontSize: 20, flexShrink: 0 }} />
          <div>
            <strong>No signing doctor assigned.</strong> Certificates cannot be issued until a signing doctor is assigned.
            {canAssign && (
              <Button variant="link" size="sm" className="ms-1 p-0" onClick={openAddModal}>
                Assign signing doctor →
              </Button>
            )}
          </div>
        </Alert>
      )}

      {signingDoctors.length > 0 && (
        <Alert variant="success" className="d-flex align-items-center gap-2 py-2">
          <Icon icon="solar:check-circle-bold" style={{ fontSize: 20, flexShrink: 0 }} />
          <div className="small">
            <strong>Signing doctor(s): </strong>
            {signingDoctors.map((d) => d.doctor.name + (d.sessionId ? ` (session-level)` : ` (campaign-level)`)).join(', ')}
          </div>
        </Alert>
      )}

      <Card>
        <Card.Body className="p-0">
          <LoadingOverlay loading={loading}>
            <Table hover responsive className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Doctor</th>
                  <th>License / Specialization</th>
                  <th>Duty &amp; Flags</th>
                  <th>Session</th>
                  <th>Contact</th>
                  {canAssign && <th className="text-end">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {assignedList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      <Icon icon="solar:stethoscope-bold" style={{ fontSize: 40, opacity: 0.3 }} />
                      <div className="mt-2">No doctors assigned yet</div>
                      {canAssign && (
                        <Button variant="outline-primary" size="sm" className="mt-2" onClick={openAddModal}>
                          Assign first doctor
                        </Button>
                      )}
                    </td>
                  </tr>
                ) : (
                  assignedList.map((a: CampaignDoctor) => (
                    <tr key={a.id}>
                      <td>
                        <div className="fw-semibold">{a.doctor.name}</div>
                        {a.doctor.email && <div className="text-muted small">{a.doctor.email}</div>}
                      </td>
                      <td>
                        <div>{a.doctor.licenseNumber ?? <span className="text-muted">—</span>}</div>
                        {a.doctor.specialization && <div className="text-muted small">{a.doctor.specialization}</div>}
                      </td>
                      <td>
                        <DutyBadge duty={a.doctorDuty} isSigningDoctor={a.isSigningDoctor} isPrimarySupervisor={a.isPrimarySupervisor} />
                      </td>
                      <td>
                        {a.session ? (
                          <div>
                            <div className="small fw-semibold">{dayjs(a.session.sessionDate).format('DD MMM YYYY')}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                              {a.session.startTime} · {a.session.venue?.name}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted small">All sessions</span>
                        )}
                      </td>
                      <td>{a.doctor.mobile || a.doctor.phone || <span className="text-muted">—</span>}</td>
                      {canAssign && (
                        <td className="text-end">
                          <Button variant="outline-secondary" size="sm" className="me-1" onClick={() => openEditModal(a)} title="Edit">
                            <Icon icon="solar:pen-bold" />
                          </Button>
                          <Button variant="soft-danger" size="sm" onClick={() => handleRemove(a.id)} title="Remove">
                            <Icon icon="solar:trash-bin-trash-bold" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </LoadingOverlay>
        </Card.Body>
      </Card>

      {/* Assign/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit Doctor Assignment' : 'Assign Doctor'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ApiErrorAlert error={mutationError as ApiError | null} onDismiss={clearError} />

          {!editingId && (
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Search Doctor <span className="text-danger">*</span>
              </Form.Label>
              <div className="d-flex gap-2 mb-2">
                <Form.Control
                  type="text"
                  placeholder="Search by name, phone, email, or license number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
                <Button variant="outline-secondary" size="sm" onClick={() => refetchAvailable()}>
                  <Icon icon="solar:restart-bold" />
                </Button>
              </div>
              <div className="border rounded bg-light p-2" style={{ maxHeight: 200, overflowY: 'auto' }}>
                {loadingAvailable ? (
                  <div className="text-center text-muted py-3 small">
                    <span className="spinner-border spinner-border-sm me-2" />
                    Searching…
                  </div>
                ) : availableDoctors.length === 0 ? (
                  <div className="text-center text-muted py-3 small">
                    No doctors found.
                    <Button size="sm" variant="link" className="ms-1" onClick={() => window.open('/doctors', '_blank')}>
                      Add a doctor
                    </Button>
                  </div>
                ) : (
                  availableDoctors.map((d: Doctor) => {
                    const isSelected = doctorId === d.id
                    return (
                      <button
                        key={d.id}
                        type="button"
                        className={`list-group-item list-group-item-action border-0 rounded mb-1 py-2 text-start w-100 ${isSelected ? 'active bg-primary text-white' : ''}`}
                        onClick={() => setDoctorId(d.id)}>
                        <div className="fw-semibold">
                          {d.name}
                          {d.specialization && (
                            <span className={`ms-2 badge ${isSelected ? 'bg-white text-primary' : 'bg-secondary-subtle text-secondary'}`}>
                              {d.specialization}
                            </span>
                          )}
                        </div>
                        <div className={`small ${isSelected ? 'text-white-50' : 'text-muted'}`}>
                          License: {d.licenseNumber || '—'}
                          {d.phone ? ` · ${d.phone}` : ''}
                          {d.email ? ` · ${d.email}` : ''}
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </Form.Group>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Duty Role <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={doctorDuty}
                  onChange={(e) => {
                    const val = e.target.value as DoctorDutyRole
                    setDoctorDuty(val)
                    setIsSigningDoctor(val === 'SIGNING_DOCTOR')
                  }}>
                  {DUTY_ROLES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              {!editingId && (
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Session (optional)</Form.Label>
                  <Form.Select value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
                    <option value="">All sessions (campaign-level)</option>
                    {(sessions ?? []).map((s: CampaignSession) => (
                      <option key={s.id} value={s.id}>
                        {dayjs(s.sessionDate).format('DD MMM YYYY')} · {s.startTime} · {s.venue?.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Legacy Role</Form.Label>
                <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="vaccinator">Vaccinator</option>
                  <option value="lead_vet">Lead Vet</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="verifier">Verifier</option>
                  <option value="volunteer_vet">Volunteer Vet</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold d-block">Flags</Form.Label>
                <Form.Check
                  type="checkbox"
                  id="isSigningDoctor"
                  label="Signing Doctor (can sign certificates)"
                  checked={isSigningDoctor}
                  onChange={(e) => setIsSigningDoctor(e.target.checked)}
                  className="mb-1"
                />
                <Form.Check
                  type="checkbox"
                  id="isPrimarySupervisor"
                  label="Primary Supervisor"
                  checked={isPrimarySupervisor}
                  onChange={(e) => setIsPrimarySupervisor(e.target.checked)}
                />
              </Form.Group>
            </Col>
          </Row>

          {isSigningDoctor && !editingId && hasSigningDoctor(sessionId) && (
            <Alert variant="warning" className="py-2 small">
              <Icon icon="solar:danger-triangle-bold" className="me-1" />
              There is already a signing doctor for this scope. Setting this doctor as signing doctor will replace the previous one.
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Notes (optional)</Form.Label>
            <Form.Control as="textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || (!editingId && !doctorId)}>
            {saving ? 'Saving…' : editingId ? 'Update' : 'Assign'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Assign Modal */}
      <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Bulk Assign Doctors</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ApiErrorAlert error={mutationError as ApiError | null} onDismiss={clearError} />

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Search &amp; Select Doctors</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by name, license, email..."
              value={bulkSearch}
              onChange={(e) => setBulkSearch(e.target.value)}
            />
            <div className="border rounded bg-light p-2 mt-2" style={{ maxHeight: 220, overflowY: 'auto' }}>
              {loadingBulkAvail ? (
                <div className="text-center text-muted py-3 small">
                  <span className="spinner-border spinner-border-sm me-2" />
                  Searching…
                </div>
              ) : bulkAvailDoctors.length === 0 ? (
                <div className="text-center text-muted py-3 small">No doctors found.</div>
              ) : (
                bulkAvailDoctors.map((d: Doctor) => {
                  const selected = bulkDoctorIds.includes(d.id)
                  return (
                    <div
                      key={d.id}
                      className={`d-flex align-items-center gap-2 rounded px-2 py-1 mb-1 ${selected ? 'bg-primary-subtle' : ''}`}
                      onClick={() => toggleBulkDoctor(d.id)}
                      style={{ cursor: 'pointer' }}>
                      <Form.Check type="checkbox" checked={selected} onChange={() => toggleBulkDoctor(d.id)} onClick={(e) => e.stopPropagation()} />
                      <div>
                        <div className="fw-semibold small">{d.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          License: {d.licenseNumber || '—'}
                          {d.specialization ? ` · ${d.specialization}` : ''}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            {bulkDoctorIds.length > 0 && (
              <div className="mt-1 text-success small">
                <Icon icon="solar:check-circle-bold" className="me-1" />
                {bulkDoctorIds.length} doctor(s) selected
              </div>
            )}
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Duty Role <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select value={bulkDuty} onChange={(e) => setBulkDuty(e.target.value as DoctorDutyRole)}>
                  {DUTY_ROLES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Session (optional)</Form.Label>
                <Form.Select value={bulkSessionId} onChange={(e) => setBulkSessionId(e.target.value)}>
                  <option value="">All sessions</option>
                  {(sessions ?? []).map((s: CampaignSession) => (
                    <option key={s.id} value={s.id}>
                      {dayjs(s.sessionDate).format('DD MMM YYYY')} · {s.startTime} · {s.venue?.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleBulkAssign} disabled={saving || bulkDoctorIds.length === 0}>
            {saving ? 'Saving…' : `Assign ${bulkDoctorIds.length > 0 ? bulkDoctorIds.length + ' Doctors' : ''}`}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
