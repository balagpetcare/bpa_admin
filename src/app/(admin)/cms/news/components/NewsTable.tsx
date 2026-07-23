'use client'

import { useMemo } from 'react'
import { Table, Button } from 'react-bootstrap'
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import NewsStatusBadge from './NewsStatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { confirmDelete } from '@/components/ui/ConfirmDialog'
import { usePermission } from '@/hooks/usePermission'
import { newsApi } from '@/lib/api/news.api'
import type { NewsListItem } from '@/types/bpa.types'

interface NewsTableProps {
  data: NewsListItem[]
  loading: boolean
  onDeleted: () => void
}

export default function NewsTable({ data, loading, onDeleted }: NewsTableProps) {
  const { can } = usePermission()

  const columns = useMemo<ColumnDef<NewsListItem>[]>(
    () => [
      {
        header: 'Title',
        accessorKey: 'title',
        cell: ({ row }) => (
          <div>
            <div className="fw-semibold">{row.original.title}</div>
            {row.original.isFeatured && <span className="badge bg-warning-subtle text-warning small">Featured</span>}
          </div>
        ),
      },
      {
        header: 'Category',
        accessorKey: 'category',
        cell: ({ row }) =>
          row.original.category ? (
            <span className="badge bg-info-subtle text-info">{row.original.category.name}</span>
          ) : (
            <span className="text-muted">—</span>
          ),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <NewsStatusBadge status={row.original.status} />,
      },
      {
        header: 'Published',
        accessorKey: 'publishedAt',
        cell: ({ getValue }) => {
          const v = getValue<string | null>()
          return v ? new Date(v).toLocaleDateString() : <span className="text-muted">—</span>
        },
      },
      {
        header: 'Created',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <div className="d-flex gap-1">
            {can('news:update') && (
              <Link href={`/cms/news/${row.original.id}/edit`} className="btn btn-soft-primary btn-sm">
                <Icon icon="solar:pen-bold" />
              </Link>
            )}
            {can('news:delete') && (
              <Button
                variant="soft-danger"
                size="sm"
                onClick={async () => {
                  const ok = await confirmDelete(row.original.title)
                  if (ok) {
                    await newsApi.remove(row.original.id)
                    onDeleted()
                  }
                }}>
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
                    icon="solar:document-text-bold-duotone"
                    title="No articles found"
                    description="Create the first article to get started."
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
