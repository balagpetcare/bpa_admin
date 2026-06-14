'use client'

import { useMemo } from 'react'
import { Table, Button } from 'react-bootstrap'
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import EventStatusBadge from './EventStatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { confirmDelete } from '@/components/ui/ConfirmDialog'
import { usePermission } from '@/hooks/usePermission'
import { eventsApi } from '@/lib/api/events.api'
import type { EventListItem } from '@/types/bpa.types'

interface EventsTableProps {
  data: EventListItem[]
  loading: boolean
  onDeleted: () => void
}

export default function EventsTable({ data, loading, onDeleted }: EventsTableProps) {
  const { can } = usePermission()

  const columns = useMemo<ColumnDef<EventListItem>[]>(
    () => [
      {
        header: 'Title',
        accessorKey: 'title',
        cell: ({ row }) => (
          <div>
            <div className="fw-semibold">{row.original.title}</div>
            {row.original.location && (
              <div className="text-muted small">
                <Icon icon="solar:map-point-bold" className="me-1" />
                {row.original.location}
              </div>
            )}
          </div>
        ),
      },
      {
        header: 'Date',
        accessorKey: 'startsAt',
        cell: ({ row }) => (
          <div className="small">
            <div>{new Date(row.original.startsAt).toLocaleDateString()}</div>
            <div className="text-muted">{new Date(row.original.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        ),
      },
      {
        header: 'Capacity',
        accessorKey: 'capacity',
        cell: ({ row }) => {
          const { capacity, registrationCount } = row.original
          return capacity ? (
            <span>{registrationCount}/{capacity}</span>
          ) : (
            <span className="text-muted">Open</span>
          )
        },
      },
      {
        header: 'Fee',
        accessorKey: 'fee',
        cell: ({ row }) =>
          row.original.isPaid ? (
            <span className="badge bg-success-subtle text-success">৳ {row.original.fee}</span>
          ) : (
            <span className="badge bg-secondary-subtle text-secondary">Free</span>
          ),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <EventStatusBadge status={row.original.status} />,
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <div className="d-flex gap-1">
            {can('events:update') && (
              <Link href={`/cms/events/${row.original.id}/edit`} className="btn btn-soft-primary btn-sm">
                <Icon icon="solar:pen-bold" />
              </Link>
            )}
            {can('events:delete') && (
              <Button
                variant="soft-danger"
                size="sm"
                onClick={async () => {
                  const ok = await confirmDelete(row.original.title)
                  if (ok) { await eventsApi.remove(row.original.id); onDeleted() }
                }}
              >
                <Icon icon="solar:trash-bin-trash-bold" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [can, onDeleted],
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
                    icon="solar:calendar-bold-duotone"
                    title="No events found"
                    description="Create the first event to get started."
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
  )
}
