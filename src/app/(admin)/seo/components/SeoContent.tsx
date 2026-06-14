'use client'

import { useState, useCallback } from 'react'
import { Card, Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import SeoRoutesTable from './SeoRoutesTable'
import SeoEditorForm from './SeoEditorForm'
import { confirmDelete } from '@/components/ui/ConfirmDialog'
import { useApi } from '@/hooks/useApi'
import { seoApi } from '@/lib/api/seo.api'
import { usePermission } from '@/hooks/usePermission'
import type { SeoMetadata } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

type View = 'list' | 'new' | 'edit'

export default function SeoContent() {
  const [view, setView] = useState<View>('list')
  const [editing, setEditing] = useState<SeoMetadata | null>(null)
  const { can } = usePermission()

  const fetchFn = useCallback(() => seoApi.list(), [])
  const { data, loading, error, refetch } = useApi(fetchFn, [])
  const entries = data ?? []

  const handleEdit = (entry: SeoMetadata) => { setEditing(entry); setView('edit') }
  const handleNew = () => { setEditing(null); setView('new') }
  const handleCancel = () => { setView('list'); setEditing(null) }

  const handleSaved = () => {
    refetch()
    setView('list')
    setEditing(null)
  }

  const handleDelete = async (entry: SeoMetadata) => {
    const confirmed = await confirmDelete(`SEO entry "${entry.route}"`)
    if (!confirmed) return
    try {
      await seoApi.remove(entry.route)
      refetch()
    } catch {
      // error handled by API
    }
  }

  if (view === 'new' || view === 'edit') {
    return (
      <div className="container-fluid">
        <PageHeader
          title={view === 'new' ? 'New SEO Entry' : `Edit SEO: ${editing?.route}`}
          breadcrumbs={[
            { label: 'SEO', href: '/seo' },
            { label: view === 'new' ? 'New' : 'Edit' },
          ]}
        />
        <Card>
          <Card.Body>
            <SeoEditorForm
              entry={editing}
              onSaved={handleSaved}
              onCancel={handleCancel}
            />
          </Card.Body>
        </Card>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="SEO Management"
        breadcrumbs={[{ label: 'SEO' }]}
        action={can('seo:create') ? (
          <Button variant="primary" onClick={handleNew}>
            <Icon icon="solar:add-circle-bold" className="me-1" />Add Route
          </Button>
        ) : undefined}
      />

      <ApiErrorAlert error={error as ApiError | null} />

      <Card>
        <Card.Body>
          <SeoRoutesTable
            data={entries}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card.Body>
      </Card>
    </div>
  )
}
