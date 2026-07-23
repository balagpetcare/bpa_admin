'use client'

import { useState } from 'react'
import { Card, Button, Form } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import CommitteeTable from './CommitteeTable'
import CommitteeForm from './CommitteeForm'
import { useApi } from '@/hooks/useApi'
import { usePermission } from '@/hooks/usePermission'
import { committeeApi } from '@/lib/api/committee.api'
import type { CommitteeMember } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

export default function CommitteeContent() {
  const { can } = usePermission()
  const [editMember, setEditMember] = useState<CommitteeMember | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [showInactive, setShowInactive] = useState(false)
  const [localData, setLocalData] = useState<CommitteeMember[] | null>(null)

  const { data: fetched, loading, error, refetch } = useApi(() => committeeApi.list(showInactive ? undefined : true), [showInactive])

  // Prefer localData for optimistic DnD updates; fall back to fetched
  const members = localData ?? fetched ?? []

  // When remote data arrives, clear local override
  if (fetched && localData && JSON.stringify(localData.map((m) => m.id)) === JSON.stringify(fetched.map((m: CommitteeMember) => m.id))) {
    setLocalData(null)
  }

  const openCreate = () => {
    setEditMember(null)
    setModalOpen(true)
  }
  const openEdit = (m: CommitteeMember) => {
    setEditMember(m)
    setModalOpen(true)
  }

  const handleReordered = (reordered: CommitteeMember[]) => setLocalData(reordered)

  const handleDeleted = () => {
    setLocalData(null)
    refetch()
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Committee"
        breadcrumbs={[{ label: 'Content' }, { label: 'Committee' }]}
        action={
          can('committee:create') ? (
            <Button variant="primary" onClick={openCreate}>
              <Icon icon="solar:user-plus-bold" className="me-1" />
              Add Member
            </Button>
          ) : undefined
        }
      />

      <ApiErrorAlert error={error as ApiError | null} />

      <Card>
        <Card.Header>
          <div className="d-flex align-items-center gap-3">
            <h6 className="mb-0">Committee Members</h6>
            <Form.Check
              type="switch"
              id="showInactive"
              label="Show inactive"
              checked={showInactive}
              onChange={(e) => {
                setShowInactive(e.target.checked)
                setLocalData(null)
              }}
            />
            <small className="text-muted ms-auto">
              Drag <Icon icon="solar:sort-vertical-bold" className="mx-1" /> to reorder
            </small>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <CommitteeTable data={members} loading={loading} onEdit={openEdit} onDeleted={handleDeleted} onReordered={handleReordered} />
        </Card.Body>
      </Card>

      <CommitteeForm
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setLocalData(null)
          refetch()
        }}
        member={editMember}
      />
    </div>
  )
}
