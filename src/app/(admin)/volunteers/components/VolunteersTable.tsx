'use client'

import { useMemo } from 'react'
import { Table, Button } from 'react-bootstrap'
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table'
import { Icon } from '@iconify/react'
import VolunteerStatusBadge from './VolunteerStatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { usePermission } from '@/hooks/usePermission'
import type { Volunteer } from '@/types/bpa.types'

interface VolunteersTableProps {
  data: Volunteer[]
  loading: boolean
  onView: (v: Volunteer) => void
}

export default function VolunteersTable({ data, loading, onView }: VolunteersTableProps) {
  const { can } = usePermission()

  const columns = useMemo<ColumnDef<Volunteer>[]>(
    () => [
      {
        header: 'Applicant',
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
        header: 'Area of Interest',
        accessorKey: 'areaOfInterest',
        cell: ({ getValue }) => getValue<string | null>() ?? <span className="text-muted">—</span>,
      },
      {
        header: 'Availability',
        accessorKey: 'availability',
        cell: ({ getValue }) => getValue<string | null>() ?? <span className="text-muted">—</span>,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <VolunteerStatusBadge status={row.original.status} />,
      },
      {
        header: 'Applied',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <Button variant="soft-primary" size="sm" onClick={() => onView(row.original)} title="View details">
            <Icon icon="solar:eye-bold" />
          </Button>
        ),
      },
    ],
    [can, onView],
  )

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })

  return (
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
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    icon="solar:hand-heart-bold-duotone"
                    title="No volunteers found"
                    description="No volunteer applications match the current filter."
                  />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} style={{ cursor: 'pointer' }} onClick={() => onView(row.original)}>
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
  )
}
