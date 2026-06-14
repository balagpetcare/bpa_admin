'use client'

import { useMemo } from 'react'
import { Table, Button } from 'react-bootstrap'
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table'
import { Icon } from '@iconify/react'
import ContactStatusBadge from './ContactStatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import type { ContactSubmission } from '@/types/bpa.types'

interface ContactsTableProps {
  data: ContactSubmission[]
  loading: boolean
  onView: (c: ContactSubmission) => void
}

export default function ContactsTable({ data, loading, onView }: ContactsTableProps) {
  const columns = useMemo<ColumnDef<ContactSubmission>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div>
            <div className="fw-semibold">{row.original.name}</div>
            <div className="text-muted small">{row.original.email}</div>
          </div>
        ),
      },
      {
        header: 'Subject',
        accessorKey: 'subject',
        cell: ({ getValue }) => getValue<string | null>() ?? <span className="text-muted">—</span>,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <ContactStatusBadge status={row.original.status} />,
      },
      {
        header: 'Received',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
      },
      {
        header: '',
        id: 'actions',
        cell: ({ row }) => (
          <Button variant="soft-primary" size="sm" onClick={(e) => { e.stopPropagation(); onView(row.original) }} title="View message">
            <Icon icon="solar:eye-bold" />
          </Button>
        ),
      },
    ],
    [onView],
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
                    icon="solar:letter-bold-duotone"
                    title="No messages found"
                    description="No contact messages match the current filter."
                  />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  style={{ cursor: 'pointer', fontWeight: row.original.status === 'unread' ? 600 : undefined }}
                  onClick={() => onView(row.original)}
                >
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
