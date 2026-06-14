'use client'

import { useMemo, useState } from 'react'
import { Table, Button, Badge, Form, InputGroup, Pagination } from 'react-bootstrap'
import { useReactTable, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, flexRender, type ColumnDef } from '@tanstack/react-table'
import { Icon } from '@iconify/react'
import StatusBadge from '@/components/ui/StatusBadge'
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
  onDeleted: () => void
}

export default function UsersTable({ data, loading, onEdit, onDeleted }: UsersTableProps) {
  const { can } = usePermission()
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        header: 'User',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div>
            <div className="fw-semibold">{row.original.name}</div>
            <div className="text-muted small">{row.original.email}</div>
          </div>
        ),
      },
      {
        header: 'Phone',
        accessorKey: 'phone',
        cell: ({ getValue }) => getValue<string | null>() ?? <span className="text-muted">—</span>,
      },
      {
        header: 'Roles',
        accessorKey: 'roles',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="d-flex flex-wrap gap-1">
            {row.original.roles.length === 0 ? (
              <span className="text-muted small">No roles</span>
            ) : (
              row.original.roles.map((r) => (
                <Badge key={r.id} bg="primary" className="fw-normal">
                  {r.name}
                </Badge>
              ))
            )}
          </div>
        ),
      },
      {
        header: 'Status',
        accessorKey: 'isActive',
        cell: ({ getValue }) => <StatusBadge status={getValue<boolean>() ? 'active' : 'inactive'} />,
      },
      {
        header: 'Created',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
      },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="d-flex gap-1">
            {can('users:update') && (
              <Button variant="soft-primary" size="sm" onClick={() => onEdit(row.original)} title="Edit">
                <Icon icon="solar:pen-bold" />
              </Button>
            )}
            {can('users:delete') && (
              <Button
                variant="soft-danger"
                size="sm"
                title="Delete"
                onClick={async () => {
                  const ok = await confirmDelete(row.original.name)
                  if (ok) {
                    await usersApi.remove(row.original.id)
                    onDeleted()
                  }
                }}
              >
                <Icon icon="solar:trash-bin-trash-bold" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [can, onEdit, onDeleted],
  )

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  })

  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = table.getPageCount()

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <InputGroup style={{ maxWidth: 280 }}>
          <InputGroup.Text>
            <Icon icon="solar:magnifer-bold" />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search users..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </InputGroup>
        <small className="text-muted">
          {table.getFilteredRowModel().rows.length} user{table.getFilteredRowModel().rows.length !== 1 ? 's' : ''}
        </small>
      </div>

      <LoadingOverlay loading={loading}>
      <div className="table-responsive">
        <Table hover className="table-centered align-middle mb-0">
          <thead className="table-light">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>
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
                    title="No users found"
                    description={globalFilter ? 'Try a different search term.' : 'Create the first user to get started.'}
                  />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
      </LoadingOverlay>

      {pageCount > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">
            Page {pageIndex + 1} of {pageCount} · {pageSize} per page
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
