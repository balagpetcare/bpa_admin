'use client'

import { Table, Button, Badge } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import EmptyState from '@/components/ui/EmptyState'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { confirmDelete } from '@/components/ui/ConfirmDialog'
import { usePermission } from '@/hooks/usePermission'
import { rolesApi } from '@/lib/api/roles.api'
import type { Role } from '@/types/bpa.types'

interface RolesTableProps {
  data: Role[]
  loading: boolean
  onEdit: (role: Role) => void
  onDeleted: () => void
}

export default function RolesTable({ data, loading, onEdit, onDeleted }: RolesTableProps) {
  const { can } = usePermission()

  return (
    <LoadingOverlay loading={loading}>
    <div className="table-responsive">
      <Table hover className="table-centered align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>Role Name</th>
            <th>Description</th>
            <th>Permissions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={4}>
                <EmptyState
                  icon="solar:shield-keyhole-minimalistic-bold-duotone"
                  title="No roles found"
                  description="Create the first role to start managing permissions."
                />
              </td>
            </tr>
          ) : (
            data.map((role) => (
              <tr key={role.id}>
                <td className="fw-semibold">{role.name}</td>
                <td className="text-muted">{role.description ?? <span className="text-muted fst-italic">No description</span>}</td>
                <td>
                  <Badge bg="info" className="fw-normal">
                    {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex gap-1">
                    {can('roles:update') && (
                      <Button variant="soft-primary" size="sm" onClick={() => onEdit(role)} title="Edit">
                        <Icon icon="solar:pen-bold" />
                      </Button>
                    )}
                    {can('roles:delete') && (
                      <Button
                        variant="soft-danger"
                        size="sm"
                        title="Delete"
                        onClick={async () => {
                          const ok = await confirmDelete(role.name)
                          if (ok) {
                            await rolesApi.remove(role.id)
                            onDeleted()
                          }
                        }}
                      >
                        <Icon icon="solar:trash-bin-trash-bold" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
    </LoadingOverlay>
  )
}
