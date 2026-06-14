'use client'

import { useMemo } from 'react'
import { Table, Button } from 'react-bootstrap'
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table'
import { Icon } from '@iconify/react'
import EmptyState from '@/components/ui/EmptyState'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { usePermission } from '@/hooks/usePermission'
import type { SeoMetadata } from '@/types/bpa.types'

interface SeoRoutesTableProps {
  data: SeoMetadata[]
  loading: boolean
  onEdit: (s: SeoMetadata) => void
  onDelete: (s: SeoMetadata) => void
}

export default function SeoRoutesTable({ data, loading, onEdit, onDelete }: SeoRoutesTableProps) {
  const { can } = usePermission()

  const columns = useMemo<ColumnDef<SeoMetadata>[]>(
    () => [
      {
        header: 'Route',
        accessorKey: 'route',
        cell: ({ getValue }) => <code className="text-primary">{getValue<string>()}</code>,
      },
      {
        header: 'Title',
        accessorKey: 'title',
        cell: ({ getValue }) => getValue<string | null>() ?? <span className="text-muted">—</span>,
      },
      {
        header: 'Description',
        accessorKey: 'description',
        cell: ({ getValue }) => {
          const val = getValue<string | null>()
          if (!val) return <span className="text-muted">—</span>
          return <span title={val}>{val.length > 60 ? val.slice(0, 60) + '…' : val}</span>
        },
      },
      {
        header: 'OG Image',
        accessorKey: 'ogImageUrl',
        cell: ({ getValue }) => {
          const url = getValue<string | null>()
          if (!url) return <span className="text-muted">—</span>
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="OG" style={{ height: 32, width: 56, objectFit: 'cover', borderRadius: 4 }} />
          )
        },
      },
      {
        header: 'Updated',
        accessorKey: 'updatedAt',
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
      },
      {
        header: '',
        id: 'actions',
        cell: ({ row }) => (
          <div className="d-flex gap-1">
            {can('seo:update') && (
              <Button variant="soft-primary" size="sm" title="Edit" onClick={(e) => { e.stopPropagation(); onEdit(row.original) }}>
                <Icon icon="solar:pen-bold" />
              </Button>
            )}
            {can('seo:delete') && (
              <Button variant="soft-danger" size="sm" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(row.original) }}>
                <Icon icon="solar:trash-bin-trash-bold" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [can, onEdit, onDelete],
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
                    icon="solar:global-bold-duotone"
                    title="No SEO entries yet"
                    description="Add SEO metadata for your site's pages."
                  />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} style={{ cursor: 'pointer' }} onClick={() => onEdit(row.original)}>
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
