'use client'

import { useState } from 'react'
import { Card, Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import UsersTable from './UsersTable'
import UserFormModal from './UserFormModal'
import { useApi } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { usersApi } from '@/lib/api/users.api'
import type { AdminUser } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

export default function UsersPageContent() {
  const { can } = usePermission()
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { data, loading, error, refetch } = useApi(() => usersApi.list({ limit: 200 }), [])

  const users = data?.data ?? []

  const openCreate = () => {
    setEditUser(null)
    setModalOpen(true)
  }

  const openEdit = (user: AdminUser) => {
    setEditUser(user)
    setModalOpen(true)
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Users"
        breadcrumbs={[{ label: 'Administration' }, { label: 'Users' }]}
        action={
          can('users:create') ? (
            <Button variant="primary" onClick={openCreate}>
              <Icon icon="solar:user-plus-bold" className="me-1" />
              Add User
            </Button>
          ) : undefined
        }
      />

      <ApiErrorAlert error={error as ApiError | null} />

      <Card>
        <Card.Body>
          <UsersTable data={users} loading={loading} onEdit={openEdit} onDeleted={refetch} />
        </Card.Body>
      </Card>

      <UserFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={refetch}
        user={editUser}
      />
    </div>
  )
}
