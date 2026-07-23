'use client'

import { useState } from 'react'
import { Card, Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import RolesTable from './RolesTable'
import RoleFormModal from './RoleFormModal'
import { useApi } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { rolesApi } from '@/lib/api/roles.api'
import type { Role } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

export default function RolesPageContent() {
  const { can } = usePermission()
  const [editRole, setEditRole] = useState<Role | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { data, loading, error, refetch } = useApi(() => rolesApi.list(), [])
  const roles = data ?? []

  const openCreate = () => {
    setEditRole(null)
    setModalOpen(true)
  }
  const openEdit = (role: Role) => {
    setEditRole(role)
    setModalOpen(true)
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Roles & Permissions"
        breadcrumbs={[{ label: 'Administration' }, { label: 'Roles' }]}
        action={
          can('roles:create') ? (
            <Button variant="primary" onClick={openCreate}>
              <Icon icon="solar:shield-plus-bold" className="me-1" />
              Create Role
            </Button>
          ) : undefined
        }
      />

      <ApiErrorAlert error={error as ApiError | null} />

      <Card>
        <Card.Body>
          <RolesTable data={roles} loading={loading} onEdit={openEdit} onDeleted={refetch} />
        </Card.Body>
      </Card>

      <RoleFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={refetch} role={editRole} />
    </div>
  )
}
