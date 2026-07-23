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
import { usersApi } from '@/lib/api/users.api'
import type { ApiError } from '@/lib/api'
import type { CampaignStaffAssignment, StaffDutyRole, CampaignSession, AdminUser } from '@/types/bpa.types'
import dayjs from 'dayjs'

const DUTY_ROLES: { value: StaffDutyRole; label: string; color: string; icon: string }[] = [
  { value: 'QR_SCAN', label: 'QR Scan', color: 'info', icon: 'solar:qr-code-bold' },
  { value: 'CHECK_IN', label: 'Check-In', color: 'primary', icon: 'solar:check-circle-bold' },
  { value: 'VACCINATION_DESK', label: 'Vaccination Desk', color: 'success', icon: 'solar:syringe-bold' },
  { value: 'CERTIFICATE_DESK', label: 'Certificate Desk', color: 'warning', icon: 'solar:diploma-bold' },
  { value: 'SESSION_MANAGER', label: 'Session Manager', color: 'danger', icon: 'solar:crown-bold' },
  { value: 'GENERAL_VOLUNTEER', label: 'General Volunteer', color: 'secondary', icon: 'solar:user-hand-up-bold' },
]

function DutyBadge({ duty }: { duty: StaffDutyRole }) {
  const d = DUTY_ROLES.find((r) => r.value === duty)
  return <span className={`badge bg-${d?.color ?? 'secondary'}-subtle text-${d?.color ?? 'secondary'}`}>{d?.label ?? duty}</span>
}

function getUserRoles(user: CampaignStaffAssignment['user']) {
  return (user.userRoles ?? []).map((r) => r.role.name).join(', ')
}

export default function StaffAssignment({ campaignId }: { campaignId: string }) {
  const { can } = usePermission()
  const canAssign = can('campaign_staff_assignments:create') || can('campaigns:assign')

  // Assign modal state
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [userId, setUserId] = useState('')
  const [dutyRole, setDutyRole] = useState<StaffDutyRole>('GENERAL_VOLUNTEER')
  const [sessionId, setSessionId] = useState('')
  const [notes, setNotes] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [debouncedUserSearch, setDebouncedUserSearch] = useState('')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Bulk modal state
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkUserIds, setBulkUserIds] = useState<string[]>([])
  const [bulkDuty, setBulkDuty] = useState<StaffDutyRole>('GENERAL_VOLUNTEER')
  const [bulkSessionId, setBulkSessionId] = useState('')
  const [bulkSearch, setBulkSearch] = useState('')
  const [debouncedBulkSearch, setDebouncedBulkSearch] = useState('')

  const { mutate, loading: saving, error: mutationError, clearError } = useApiMutation<unknown, unknown>()

  // Debounce user search
  useEffect(() => {
    const h = setTimeout(() => setDebouncedUserSearch(userSearch), 300)
    return () => clearTimeout(h)
  }, [userSearch])

  useEffect(() => {
    const h = setTimeout(() => setDebouncedBulkSearch(bulkSearch), 300)
    return () => clearTimeout(h)
  }, [bulkSearch])

  const assignmentsFn = useCallback(() => campaignsApi.listStaffAssignments(campaignId), [campaignId])
  const { data: assignmentsRaw, loading, error, refetch } = useApi(assignmentsFn, [campaignId])

  const sessionsFn = useCallback(() => campaignsApi.listSessions(campaignId), [campaignId])
  const { data: sessions } = useApi(sessionsFn, [campaignId])

  const usersFn = useCallback(() => usersApi.list({ search: debouncedUserSearch || undefined, limit: 50, isActive: true }), [debouncedUserSearch])
  const { data: usersData, loading: loadingUsers } = useApi(usersFn, [debouncedUserSearch])

  const bulkUsersFn = useCallback(() => usersApi.list({ search: debouncedBulkSearch || undefined, limit: 50, isActive: true }), [debouncedBulkSearch])
  const { data: bulkUsersData, loading: loadingBulkUsers } = useApi(bulkUsersFn, [debouncedBulkSearch])

  const assignments: CampaignStaffAssignment[] = (() => {
    if (!assignmentsRaw) return []
    const raw = assignmentsRaw as any
    if (Array.isArray(raw)) return raw
    if (Array.isArray(raw?.data)) return raw.data
    return []
  })()

  const userList: AdminUser[] = (() => {
    if (!usersData) return []
    const raw = usersData as any
    if (Array.isArray(raw)) return raw
    if (Array.isArray(raw?.data)) return raw.data
    if (Array.isArray(raw?.items)) return raw.items
    return []
  })()

  const bulkUserList: AdminUser[] = (() => {
    if (!bulkUsersData) return []
    const raw = bulkUsersData as any
    if (Array.isArray(raw)) return raw
    if (Array.isArray(raw?.data)) return raw.data
    if (Array.isArray(raw?.items)) return raw.items
    return []
  })()

  function openAddModal() {
    setEditingId(null)
    setUserId('')
    setDutyRole('GENERAL_VOLUNTEER')
    setSessionId('')
    setNotes('')
    setUserSearch('')
    setSuccessMsg(null)
    clearError()
    setShowModal(true)
  }

  function openEditModal(a: CampaignStaffAssignment) {
    setEditingId(a.id)
    setUserId(a.userId)
    setDutyRole(a.dutyRole)
    setSessionId(a.sessionId ?? '')
    setNotes(a.notes ?? '')
    setSuccessMsg(null)
    clearError()
    setShowModal(true)
  }

  async function handleSave() {
    if (!editingId && !userId) return
    clearError()
    setSuccessMsg(null)

    let result
    if (editingId) {
      result = await mutate(
        () =>
          campaignsApi.updateStaffAssignment(campaignId, editingId, {
            dutyRole,
            sessionId: sessionId || null,
            notes: notes || null,
          }),
        undefined,
      )
    } else {
      result = await mutate(
        () =>
          campaignsApi.assignStaff(campaignId, {
            userId,
            dutyRole,
            sessionId: sessionId || undefined,
            notes: notes || null,
          }),
        undefined,
      )
    }

    if (result) {
      setShowModal(false)
      setSuccessMsg(editingId ? 'Assignment updated.' : 'Staff assigned successfully.')
      refetch()
    }
  }

  async function handleDeactivate(id: string) {
    if (!confirm('Deactivate this staff assignment?')) return
    clearError()
    setSuccessMsg(null)
    const result = await mutate(() => campaignsApi.deactivateStaffAssignment(campaignId, id), undefined)
    if (result !== null) {
      setSuccessMsg('Assignment deactivated.')
      refetch()
    }
  }

  async function handleBulkAssign() {
    if (bulkUserIds.length === 0) return
    clearError()
    setSuccessMsg(null)
    const result = await mutate(
      () =>
        campaignsApi.bulkAssignStaff(campaignId, {
          assignments: bulkUserIds.map((uid) => ({ userId: uid, dutyRole: bulkDuty, sessionId: bulkSessionId || undefined })),
        }),
      undefined,
    )
    if (result) {
      setShowBulkModal(false)
      setBulkUserIds([])
      setBulkSearch('')
      setSuccessMsg(`Bulk assignment done.`)
      refetch()
    }
  }

  function toggleBulkUser(id: string) {
    setBulkUserIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const sessionLabel = (id: string) => {
    const s = (sessions ?? []).find((s: CampaignSession) => s.id === id)
    if (!s) return id
    return `${dayjs(s.sessionDate).format('DD MMM')} · ${s.startTime} · ${s.venue?.name ?? ''}`
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Staff & Volunteer Assignments"
        breadcrumbs={[{ label: 'Campaigns', href: '/campaigns' }, { label: 'Detail', href: `/campaigns/${campaignId}` }, { label: 'Staff' }]}
        action={
          canAssign ? (
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => {
                  setBulkUserIds([])
                  setBulkSearch('')
                  setBulkDuty('GENERAL_VOLUNTEER')
                  setBulkSessionId('')
                  clearError()
                  setShowBulkModal(true)
                }}>
                <Icon icon="solar:users-group-two-rounded-bold" className="me-1" />
                Bulk Assign
              </Button>
              <Button variant="primary" onClick={openAddModal}>
                <Icon icon="solar:add-circle-bold" className="me-1" />
                Assign Staff
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

      {/* Stats row */}
      {assignments.length > 0 && (
        <Row className="g-2 mb-3">
          {DUTY_ROLES.map((d) => {
            const count = assignments.filter((a) => a.dutyRole === d.value && a.isActive).length
            return count > 0 ? (
              <Col key={d.value} xs={6} sm={4} md={2}>
                <Card className="text-center py-2 px-1 border-0 shadow-sm">
                  <div className={`text-${d.color} fs-4`}>
                    <Icon icon={d.icon} />
                  </div>
                  <div className="fw-bold">{count}</div>
                  <div className="small text-muted">{d.label}</div>
                </Card>
              </Col>
            ) : null
          })}
        </Row>
      )}

      <Card>
        <Card.Body className="p-0">
          <LoadingOverlay loading={loading}>
            <Table hover responsive className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Staff Member</th>
                  <th>Duty Role</th>
                  <th>Session</th>
                  <th>Status</th>
                  <th>Assigned By</th>
                  {canAssign && <th className="text-end">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      <Icon icon="solar:users-group-two-rounded-linear" style={{ fontSize: 40, opacity: 0.3 }} />
                      <div className="mt-2">No staff assigned yet</div>
                      {canAssign && (
                        <Button variant="outline-primary" size="sm" className="mt-2" onClick={openAddModal}>
                          Assign first staff member
                        </Button>
                      )}
                    </td>
                  </tr>
                ) : (
                  assignments.map((a) => (
                    <tr key={a.id} className={!a.isActive ? 'opacity-50' : ''}>
                      <td>
                        <div className="fw-semibold">{a.user?.name ?? '—'}</div>
                        {a.user?.email && <div className="text-muted small">{a.user.email}</div>}
                        {a.user?.phone && <div className="text-muted small">{a.user.phone}</div>}
                        {a.user?.userRoles?.length > 0 && (
                          <div className="mt-1">
                            {getUserRoles(a.user)
                              .split(', ')
                              .map((r) => (
                                <span key={r} className="badge bg-light text-dark me-1 border">
                                  {r.replace('_', ' ')}
                                </span>
                              ))}
                          </div>
                        )}
                      </td>
                      <td>
                        <DutyBadge duty={a.dutyRole} />
                      </td>
                      <td>
                        {a.session ? (
                          <div>
                            <div className="fw-semibold small">{dayjs(a.session.sessionDate).format('DD MMM YYYY')}</div>
                            <div className="text-muted small">
                              {a.session.startTime} · {a.session.venue?.name}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted small">All sessions</span>
                        )}
                      </td>
                      <td>
                        {a.isActive ? (
                          <span className="badge bg-success-subtle text-success">Active</span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary">Inactive</span>
                        )}
                      </td>
                      <td className="small text-muted">{a.assignedByUser?.name ?? '—'}</td>
                      {canAssign && (
                        <td className="text-end">
                          <Button variant="outline-secondary" size="sm" className="me-1" onClick={() => openEditModal(a)} title="Edit">
                            <Icon icon="solar:pen-bold" />
                          </Button>
                          {a.isActive && (
                            <Button variant="soft-danger" size="sm" onClick={() => handleDeactivate(a.id)} title="Deactivate">
                              <Icon icon="solar:minus-circle-bold" />
                            </Button>
                          )}
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

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit Assignment' : 'Assign Staff Member'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ApiErrorAlert error={mutationError as ApiError | null} onDismiss={clearError} />

          {!editingId && (
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Search User <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Search by name, email, or phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                autoFocus
              />
              <div className="border rounded bg-light p-2 mt-2" style={{ maxHeight: 200, overflowY: 'auto' }}>
                {loadingUsers ? (
                  <div className="text-center text-muted py-3 small">
                    <span className="spinner-border spinner-border-sm me-2" />
                    Searching…
                  </div>
                ) : userList.length === 0 ? (
                  <div className="text-center text-muted py-3 small">No users found.</div>
                ) : (
                  userList.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      className={`list-group-item list-group-item-action border-0 rounded mb-1 py-2 text-start w-100 ${userId === u.id ? 'active bg-primary text-white' : ''}`}
                      onClick={() => setUserId(u.id)}>
                      <div className="fw-semibold">{u.name}</div>
                      <div className={`small ${userId === u.id ? 'text-white-50' : 'text-muted'}`}>
                        {u.email}
                        {u.phone ? ` · ${u.phone}` : ''}
                        {u.roles?.length > 0 && ` · ${u.roles.map((r) => r.name).join(', ')}`}
                      </div>
                    </button>
                  ))
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
                <Form.Select value={dutyRole} onChange={(e) => setDutyRole(e.target.value as StaffDutyRole)}>
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
                <Form.Select value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
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

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Notes (optional)</Form.Label>
            <Form.Control as="textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || (!editingId && !userId)}>
            {saving ? 'Saving…' : editingId ? 'Update' : 'Assign'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Assign Modal */}
      <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Bulk Assign Staff</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ApiErrorAlert error={mutationError as ApiError | null} onDismiss={clearError} />

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Search & Select Users</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by name, email, or phone..."
              value={bulkSearch}
              onChange={(e) => setBulkSearch(e.target.value)}
            />
            <div className="border rounded bg-light p-2 mt-2" style={{ maxHeight: 220, overflowY: 'auto' }}>
              {loadingBulkUsers ? (
                <div className="text-center text-muted py-3 small">
                  <span className="spinner-border spinner-border-sm me-2" />
                  Searching…
                </div>
              ) : bulkUserList.length === 0 ? (
                <div className="text-center text-muted py-3 small">No users found.</div>
              ) : (
                bulkUserList.map((u) => {
                  const selected = bulkUserIds.includes(u.id)
                  return (
                    <div
                      key={u.id}
                      className={`d-flex align-items-center gap-2 rounded px-2 py-1 mb-1 cursor-pointer ${selected ? 'bg-primary-subtle' : 'hover-bg-light'}`}
                      onClick={() => toggleBulkUser(u.id)}
                      style={{ cursor: 'pointer' }}>
                      <Form.Check type="checkbox" checked={selected} onChange={() => toggleBulkUser(u.id)} onClick={(e) => e.stopPropagation()} />
                      <div>
                        <div className="fw-semibold small">{u.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {u.email}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            {bulkUserIds.length > 0 && (
              <div className="mt-1 text-success small">
                <Icon icon="solar:check-circle-bold" className="me-1" />
                {bulkUserIds.length} user(s) selected
              </div>
            )}
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Duty Role <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select value={bulkDuty} onChange={(e) => setBulkDuty(e.target.value as StaffDutyRole)}>
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
          <Button variant="primary" onClick={handleBulkAssign} disabled={saving || bulkUserIds.length === 0}>
            {saving ? 'Saving…' : `Assign ${bulkUserIds.length > 0 ? bulkUserIds.length + ' Staff' : ''}`}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
