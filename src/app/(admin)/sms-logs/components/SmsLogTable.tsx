'use client'

import { useMemo } from 'react'
import { Table, Button } from 'react-bootstrap'
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table'
import { Icon } from '@iconify/react'
import SmsStatusBadge from './SmsStatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import type { SmsLog } from '@/types/bpa.types'

interface SmsLogTableProps {
  data: SmsLog[]
  loading: boolean
  onView: (log: SmsLog) => void
}

export default function SmsLogTable({ data, loading, onView }: SmsLogTableProps) {
  const columns = useMemo<ColumnDef<SmsLog>[]>(
    () => [
      {
        header: 'Recipient',
        accessorKey: 'to',
        cell: ({ getValue }) => <code className="text-primary small">{getValue<string>()}</code>,
      },
      {
        header: 'Body',
        accessorKey: 'body',
        cell: ({ getValue }) => (
          <span className="text-truncate d-inline-block" style={{ maxWidth: 260 }}>
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
        cell: ({ row }) => <SmsStatusBadge status={row.original.status} />,
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
            onClick={(e) => { e.stopPropagation(); onView(row.original) }}
          >
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
                    icon="solar:chat-round-bold-duotone"
                    title="No SMS logs found"
                    description="No SMS records match the current filter."
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
