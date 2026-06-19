'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, Button, Row, Col, Form, InputGroup, Modal, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import UsersTable from './UsersTable'
import UserFormModal from './UserFormModal'
import { useApi } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { usersApi } from '@/lib/api/users.api'
import { rolesApi } from '@/lib/api/roles.api'
import type { AdminUser } from '@/types/bpa.types'
import { ApiError } from '@/lib/api'

const ADMIN_USERS_PAGE_SIZE = 100

export default function UsersPageContent() {
  const { can } = usePermission()
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  // Audit modal state
  const [auditUser, setAuditUser] = useState<AdminUser | null>(null)

  // Fetch Users & Roles
  const { data, loading, error, refetch } = useApi(() => usersApi.list({ limit: ADMIN_USERS_PAGE_SIZE }), [])
  const { data: rolesData } = useApi(() => rolesApi.list(), [])

  // Map validation error to a friendly message for users control panel
  const mappedError = useMemo(() => {
    if (!error) return null
    if (error.code === 'VALIDATION_ERROR') {
      return new ApiError(
        'VALIDATION_ERROR',
        'User list request limit is invalid. Please refresh or contact admin.',
        undefined,
        error.status
      )
    }
    return error
  }, [error])

  const users = data?.data ?? []
  const roles = rolesData ?? []

  // Dynamic user aggregations for KPI stats
  const stats = useMemo(() => {
    const total = users.length
    const active = users.filter((u) => u.isActive).length
    const suspended = users.filter((u) => !u.isActive).length
    // Pending users: registered but with missing details or unverified phone
    const pending = users.filter((u) => !u.phone).length
    return { total, active, suspended, pending }
  }, [users])

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesName = u.name.toLowerCase().includes(q)
        const matchesEmail = u.email?.toLowerCase().includes(q)
        const matchesPhone = u.phone?.toLowerCase().includes(q)
        if (!matchesName && !matchesEmail && !matchesPhone) return false
      }

      // 2. Role filter
      if (selectedRole !== 'all') {
        const hasRole = u.roles.some((r) => r.id === selectedRole || r.name === selectedRole)
        if (!hasRole) return false
      }

      // 3. Status filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'active' && !u.isActive) return false
        if (selectedStatus === 'suspended' && u.isActive) return false
      }

      return true
    })
  }, [users, searchQuery, selectedRole, selectedStatus])

  const openCreate = () => {
    setEditUser(null)
    setModalOpen(true)
  }

  const openEdit = (user: AdminUser) => {
    setEditUser(user)
    setModalOpen(true)
  }

  // Handle Suspension Toggle
  const handleToggleActive = useCallback(async (user: AdminUser) => {
    try {
      const updated = await usersApi.update(user.id, { isActive: !user.isActive })
      if (updated) {
        refetch()
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update user status.')
    }
  }, [refetch])

  // Handle Password Reset
  const handleResetPassword = useCallback(async (user: AdminUser) => {
    const newPass = prompt(`Enter a new password for ${user.name} (minimum 8 characters):`)
    if (newPass === null) return // canceled
    if (newPass.length < 8) {
      alert('Password must be at least 8 characters long.')
      return
    }
    try {
      await usersApi.update(user.id, { password: newPass })
      alert(`Password for ${user.name} has been reset successfully.`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reset password.')
    }
  }, [])

  // Handle View Audit Modal
  const handleViewAudit = useCallback((user: AdminUser) => {
    setAuditUser(user)
  }, [])

  return (
    <div className="container-fluid py-3">
      <PageHeader
        title="Users Control panel"
        breadcrumbs={[{ label: 'Administration' }, { label: 'Users' }]}
        action={
          can('users:create') ? (
            <Button variant="primary" onClick={openCreate} className="d-flex align-items-center gap-1 border-0" style={{ backgroundColor: '#1a6b3c' }}>
              <Icon icon="solar:user-plus-bold" />
              <span>Create Account</span>
            </Button>
          ) : undefined
        }
      />

      <ApiErrorAlert error={mappedError} />

      {/* KPI Cards Row */}
      <Row className="g-3 mb-4">
        <Col xs={6} lg={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center gap-3 p-3">
              <div className="avatar-md rounded-3 bg-soft-primary text-primary flex-centered p-2" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon icon="solar:users-group-two-rounded-bold-duotone" width={22} />
              </div>
              <div>
                <h5 className="fw-bold mb-0 text-dark">{stats.total}</h5>
                <span className="text-muted small">Total Members</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} lg={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center gap-3 p-3">
              <div className="avatar-md rounded-3 bg-soft-success text-success flex-centered p-2" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon icon="solar:user-check-bold-duotone" width={22} />
              </div>
              <div>
                <h5 className="fw-bold mb-0 text-dark">{stats.active}</h5>
                <span className="text-muted small">Active Accounts</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} lg={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center gap-3 p-3">
              <div className="avatar-md rounded-3 bg-soft-danger text-danger flex-centered p-2" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon icon="solar:user-block-bold-duotone" width={22} />
              </div>
              <div>
                <h5 className="fw-bold mb-0 text-dark">{stats.suspended}</h5>
                <span className="text-muted small">Suspended</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} lg={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center gap-3 p-3">
              <div className="avatar-md rounded-3 bg-soft-warning text-warning flex-centered p-2" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon icon="solar:user-hand-up-bold-duotone" width={22} />
              </div>
              <div>
                <h5 className="fw-bold mb-0 text-dark">{stats.pending}</h5>
                <span className="text-muted small">Phone Missing</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters Card */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <Row className="g-3 align-items-center">
            {/* Search */}
            <Col xs={12} md={4}>
              <InputGroup size="sm">
                <InputGroup.Text className="bg-light border-light text-muted">
                  <Icon icon="solar:magnifer-bold" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-light border-light"
                />
                {searchQuery && (
                  <Button variant="outline-light" size="sm" className="border-light text-muted" onClick={() => setSearchQuery('')}>
                    Clear
                  </Button>
                )}
              </InputGroup>
            </Col>

            {/* Role Filter */}
            <Col xs={6} md={3}>
              <Form.Select
                size="sm"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-light border-light"
              >
                <option value="all">All Access Roles</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name.replace(/_/g, ' ').toUpperCase()}
                  </option>
                ))}
              </Form.Select>
            </Col>

            {/* Status Filter */}
            <Col xs={6} md={3}>
              <Form.Select
                size="sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-light border-light"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </Form.Select>
            </Col>

            {/* Total Results */}
            <Col xs={12} md={2} className="text-md-end text-muted small fw-semibold">
              Found {filteredUsers.length} matched users
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <UsersTable
            data={filteredUsers}
            loading={loading}
            onEdit={openEdit}
            onToggleActive={handleToggleActive}
            onResetPassword={handleResetPassword}
            onViewAudit={handleViewAudit}
            onDeleted={refetch}
          />
        </Card.Body>
      </Card>

      {/* Form Modal */}
      <UserFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={refetch}
        user={editUser}
      />

      {/* Audit Log Details Modal */}
      <Modal show={!!auditUser} onHide={() => setAuditUser(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">User Audit Logs</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {auditUser && (
            <div className="d-flex flex-column gap-3 small">
              <div>
                <span className="text-muted d-block">System User ID</span>
                <code className="text-dark">{auditUser.id}</code>
              </div>
              <div>
                <span className="text-muted d-block">Account Holder</span>
                <strong className="text-dark">{auditUser.name} ({auditUser.email})</strong>
              </div>
              <hr className="my-1 border-light" />
              <div className="d-flex justify-content-between">
                <div>
                  <span className="text-muted d-block">Created At</span>
                  <span className="text-dark fw-semibold">{new Date(auditUser.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted d-block">Last Updated</span>
                  <span className="text-dark fw-semibold">{new Date(auditUser.updatedAt).toLocaleString()}</span>
                </div>
              </div>
              <div>
                <span className="text-muted d-block">Assigned Access Roles</span>
                <div className="d-flex flex-wrap gap-1 mt-1">
                  {auditUser.roles.map(r => (
                    <Badge key={r.id} bg="primary-subtle" className="text-primary border border-primary-subtle fw-normal">
                      {r.name.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" size="sm" onClick={() => setAuditUser(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
