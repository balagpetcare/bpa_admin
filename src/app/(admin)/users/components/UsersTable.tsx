'use client'

import { useMemo, useState } from 'react'
import { Table, Button, Badge, Form, Pagination } from 'react-bootstrap'
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender, type ColumnDef } from '@tanstack/react-table'
import { Icon } from '@iconify/react'
import { useSession } from 'next-auth/react'
import EmptyState from '@/components/ui/EmptyState'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { confirmDelete } from '@/components/ui/ConfirmDialog'
import { usePermission } from '@/hooks/usePermission'
import { usersApi } from '@/lib/api/users.api'
import type { AdminUser } from '@/types/bpa.types'

interface UsersTableProps {
  data: AdminUser[]
  loading: boolean
  onEdit: (user: AdminUser) => void
  onToggleActive: (user: AdminUser) => Promise<void>
  onResetPassword: (user: AdminUser) => void
  onViewAudit: (user: AdminUser) => void
  onDeleted: () => void
}

export default function UsersTable({
  data,
  loading,
  onEdit,
  onToggleActive,
  onResetPassword,
  onViewAudit,
  onDeleted
}: UsersTableProps) {
  const { can } = usePermission()
  const { data: session } = useSession()

  // Calculate active Super Admins to protect the last one
  const activeSuperAdmins = useMemo(() => {
    return data.filter(
      (u) => u.isActive && u.roles.some((r) => r.name === 'super_admin')
    )
  }, [data])

  const superAdminCount = activeSuperAdmins.length

  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        header: 'User details',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div>
            <div className="fw-semibold text-dark">{row.original.name}</div>
            <div className="text-muted small">{row.original.email}</div>
          </div>
        ),
      },
      {
        header: 'Phone number',
        accessorKey: 'phone',
        cell: ({ getValue }) => getValue<string | null>() ?? <span className="text-muted">—</span>,
      },
      {
        header: 'Access Roles',
        accessorKey: 'roles',
        cell: ({ row }) => (
          <div className="d-flex flex-wrap gap-1">
            {row.original.roles.length === 0 ? (
              <span className="text-muted small">No roles assigned</span>
            ) : (
              row.original.roles.map((r) => {
                const color = r.name === 'super_admin' ? 'danger' : r.name === 'admin' ? 'primary' : 'secondary'
                return (
                  <Badge key={r.id} bg={`${color}-subtle`} className={`text-${color} border border-${color}-subtle fw-normal`}>
                    {r.name.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                )
              })
            )}
          </div>
        ),
      },
      {
        header: 'Status',
        accessorKey: 'isActive',
        cell: ({ row }) => {
          const active = row.original.isActive
          return (
            <Badge bg={active ? 'success-subtle' : 'danger-subtle'} className={`text-${active ? 'success' : 'danger'} border border-${active ? 'success-subtle' : 'danger-subtle'} fw-semibold`}>
              {active ? 'Active' : 'Suspended'}
            </Badge>
          )
        },
      },
      {
        header: 'Registered Date',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString('en-US', { dateStyle: 'medium' }),
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => {
          const u = row.original
          const isCurrentUser = u.id === (session?.user as any)?.id || u.email === session?.user?.email
          const isSuperAdmin = u.roles.some((r) => r.name === 'super_admin')
          const isLastSuperAdmin = isSuperAdmin && u.isActive && superAdminCount <= 1

          return (
            <div className="d-flex gap-1">
              {can('users:update') && (
                <>
                  <Button
                    variant="soft-primary"
                    size="sm"
                    onClick={() => onEdit(u)}
                    title="Edit profile"
                  >
                    <Icon icon="solar:pen-bold" />
                  </Button>
                  <Button
                    variant={u.isActive ? 'soft-warning' : 'soft-success'}
                    size="sm"
                    disabled={isCurrentUser || isLastSuperAdmin}
                    onClick={() => onToggleActive(u)}
                    title={isCurrentUser ? 'You cannot suspend yourself' : isLastSuperAdmin ? 'Cannot suspend the last Super Admin' : u.isActive ? 'Suspend User' : 'Activate User'}
                  >
                    <Icon icon={u.isActive ? 'solar:lock-bold' : 'solar:lock-keyhole-minimalistic-bold'} />
                  </Button>
                  <Button
                    variant="soft-info"
                    size="sm"
                    onClick={() => onResetPassword(u)}
                    title="Reset Password"
                  >
                    <Icon icon="solar:key-bold" />
                  </Button>
                </>
              )}
              <Button
                variant="soft-secondary"
                size="sm"
                onClick={() => onViewAudit(u)}
                title="View Audit details"
              >
                <Icon icon="solar:history-bold" />
              </Button>
              {can('users:delete') && (
                <Button
                  variant="soft-danger"
                  size="sm"
                  disabled={isCurrentUser || isLastSuperAdmin}
                  title={isCurrentUser ? 'You cannot delete yourself' : isLastSuperAdmin ? 'Cannot delete the last Super Admin' : 'Delete User'}
                  onClick={async () => {
                    const ok = await confirmDelete(u.name)
                    if (ok) {
                      await usersApi.remove(u.id)
                      onDeleted()
                    }
                  }}
                >
                  <Icon icon="solar:trash-bin-trash-bold" />
                </Button>
              )}
            </div>
          )
        },
      },
    ],
    [can, session, superAdminCount, onEdit, onToggleActive, onResetPassword, onViewAudit, onDeleted],
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = table.getPageCount()

  return (
    <div>
      <LoadingOverlay loading={loading}>
        <div className="table-responsive">
          <Table hover className="table-centered align-middle mb-0 border-0">
            <thead className="table-light text-muted small">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className="py-3">{flexRender(h.column.columnDef.header, h.getContext())}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState
                      icon="solar:users-group-two-rounded-bold-duotone"
                      title="No users match the criteria"
                      description="Try adjusting your filters or search query."
                    />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-bottom border-light">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </LoadingOverlay>

      {pageCount > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3 p-3">
          <small className="text-muted">
            Page {pageIndex + 1} of {pageCount} · {pageSize} rows per page
          </small>
          <Pagination size="sm" className="mb-0">
            <Pagination.Prev disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()} />
            {Array.from({ length: pageCount }, (_, i) => (
              <Pagination.Item key={i} active={i === pageIndex} onClick={() => table.setPageIndex(i)}>
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next disabled={!table.getCanNextPage()} onClick={() => table.nextPage()} />
          </Pagination>
        </div>
      )}
    </div>
  )
}
