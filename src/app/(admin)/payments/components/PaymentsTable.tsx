'use client'

import { useMemo } from 'react'
import { Table, Button, Badge } from 'react-bootstrap'
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table'
import { Icon } from '@iconify/react'
import PaymentStatusBadge from './PaymentStatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import type { Payment } from '@/types/bpa.types'

interface PaymentsTableProps {
  data: Payment[]
  loading: boolean
  onView: (p: Payment) => void
}

function formatAmount(amount: string, currency: string) {
  const num = parseFloat(amount)
  return isNaN(num) ? amount : `${currency} ${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
}

export default function PaymentsTable({ data, loading, onView }: PaymentsTableProps) {
  const columns = useMemo<ColumnDef<Payment>[]>(
    () => [
      {
        header: 'Reference',
        accessorKey: 'merchantTxnId',
        cell: ({ row }) => (
          <div>
            <code className="text-primary small">{row.original.merchantTxnId ?? row.original.gatewayRef ?? '—'}</code>
            <div className="text-muted" style={{ fontSize: 11 }}>
              {row.original.id.slice(0, 8)}…
            </div>
          </div>
        ),
      },
      {
        header: 'Purpose',
        accessorKey: 'purpose',
        cell: ({ getValue }) => (
          <Badge bg="info" className="text-capitalize">
            {getValue<string>()}
          </Badge>
        ),
      },
      {
        header: 'Amount',
        accessorKey: 'amount',
        cell: ({ row }) => <span className="fw-semibold">{formatAmount(row.original.amount, row.original.currency)}</span>,
      },
      {
        header: 'Method',
        accessorKey: 'gateway',
        cell: ({ getValue }) => {
          const v = getValue<string>()
          return <span className="small">{v === 'eps' ? 'Online Payment' : v}</span>
        },
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <PaymentStatusBadge status={row.original.status} />,
      },
      {
        header: 'Date',
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
                  <EmptyState icon="solar:wallet-bold-duotone" title="No payments found" description="No payment records match the current filter." />
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
