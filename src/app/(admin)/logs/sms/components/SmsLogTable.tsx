'use client'

import { useMemo, useState } from 'react'
import { Table, Button, Spinner } from 'react-bootstrap'
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table'
import { Icon } from '@iconify/react'
import SmsStatusBadge from './SmsStatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import type { SmsLog } from '@/types/bpa.types'

interface Props {
  data: SmsLog[]
  loading: boolean
  onView: (log: SmsLog) => void
  onResend: (log: SmsLog) => Promise<void>
}

export default function SmsLogTable({ data, loading, onView, onResend }: Props) {
  const [resendingId, setResendingId] = useState<string | null>(null)

  const handleResend = async (log: SmsLog, e: React.MouseEvent) => {
    e.stopPropagation()
    setResendingId(log.id)
    try {
      await onResend(log)
    } finally {
      setResendingId(null)
    }
  }

  const columns = useMemo<ColumnDef<SmsLog>[]>(
    () => [
      {
        header: 'Created',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => <span className="text-nowrap small">{new Date(getValue<string>()).toLocaleString()}</span>,
      },
      {
        header: 'Recipient',
        id: 'recipient',
        cell: ({ row }) => (
          <code className="text-primary small">{row.original.isOtp ? (row.original.recipientMasked ?? row.original.to) : row.original.to}</code>
        ),
      },
      {
        header: 'Module',
        accessorKey: 'module',
        cell: ({ getValue }) => <span className="badge bg-light text-dark text-uppercase small">{getValue<string | null>() ?? '—'}</span>,
      },
      {
        header: 'Type',
        accessorKey: 'messageType',
        cell: ({ getValue }) => <span className="small text-muted">{getValue<string | null>() ?? '—'}</span>,
      },
      {
        header: 'Reference',
        accessorKey: 'reference',
        cell: ({ getValue }) => <span className="small font-monospace">{getValue<string | null>() ?? '—'}</span>,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <SmsStatusBadge status={row.original.status} />,
      },
      {
        header: 'Attempts',
        accessorKey: 'attemptCount',
        cell: ({ row }) => (
          <span className="small text-muted">
            {row.original.attemptCount}/{row.original.maxAttempts}
          </span>
        ),
      },
      {
        header: 'Failure',
        accessorKey: 'failureReason',
        cell: ({ getValue }) => {
          const v = getValue<string | null>()
          return v ? <span className="badge bg-danger-subtle text-danger small">{v}</span> : <span className="text-muted">—</span>
        },
      },
      {
        header: 'Sent At',
        accessorKey: 'sentAt',
        cell: ({ getValue }) => {
          const v = getValue<string | null>()
          return v ? <span className="small text-nowrap">{new Date(v).toLocaleString()}</span> : <span className="text-muted">—</span>
        },
      },
      {
        header: '',
        id: 'actions',
        cell: ({ row }) => {
          const log = row.original
          const canResend = !log.isOtp && log.status !== 'sent' && log.attemptCount < log.maxAttempts
          const isBusy = resendingId === log.id
          return (
            <div className="d-flex gap-1">
              <Button
                variant="soft-primary"
                size="sm"
                title="View details"
                onClick={(e) => {
                  e.stopPropagation()
                  onView(log)
                }}>
                <Icon icon="solar:eye-bold" />
              </Button>
              {canResend && (
                <Button variant="soft-warning" size="sm" title="Resend SMS" disabled={isBusy} onClick={(e) => handleResend(log, e)}>
                  {isBusy ? <Spinner size="sm" /> : <Icon icon="solar:refresh-bold" />}
                </Button>
              )}
            </div>
          )
        },
      },
    ],
    [onView, resendingId],
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
                  <th key={h.id} className="small text-nowrap">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState icon="solar:chat-round-bold-duotone" title="No SMS logs found" description="No records match the current filter." />
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
