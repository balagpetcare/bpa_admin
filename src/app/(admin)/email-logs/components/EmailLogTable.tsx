'use client'

import { useMemo } from 'react'
import { Table, Button } from 'react-bootstrap'
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table'
import { Icon } from '@iconify/react'
import EmailStatusBadge from './EmailStatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import type { EmailLog } from '@/types/bpa.types'

interface EmailLogTableProps {
  data: EmailLog[]
  loading: boolean
  onView: (log: EmailLog) => void
}

export default function EmailLogTable({ data, loading, onView }: EmailLogTableProps) {
  const columns = useMemo<ColumnDef<EmailLog>[]>(
    () => [
      {
        header: 'Recipient',
        accessorKey: 'to',
        cell: ({ getValue }) => <code className="text-primary small">{getValue<string>()}</code>,
      },
      {
        header: 'Subject',
        accessorKey: 'subject',
        cell: ({ getValue }) => (
          <span className="text-truncate d-inline-block" style={{ maxWidth: 280 }}>
            {getValue<string>()}
          </span>
        ),
      },
      {
        header: 'Provider',
        accessorKey: 'provider',
        cell: ({ getValue }) => <span className="text-uppercase small">{getValue<string>()}</span>,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <EmailStatusBadge status={row.original.status} />,
      },
      {
        header: 'Sent At',
        accessorKey: 'sentAt',
        cell: ({ getValue }) => {
          const v = getValue<string | null>()
          return v ? new Date(v).toLocaleString() : <span className="text-muted">—</span>
        },
      },
      {
        header: 'Created',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleString(),
      },
      {
        header: '',
        id: 'actions',
        cell: ({ row }) => (
          <Button
            variant="soft-primary"
            size="sm"
            title="View details"
            onClick={(e) => {
              e.stopPropagation()
              onView(row.original)
            }}>
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
                  <EmptyState icon="solar:letter-bold-duotone" title="No email logs found" description="No email records match the current filter." />
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
