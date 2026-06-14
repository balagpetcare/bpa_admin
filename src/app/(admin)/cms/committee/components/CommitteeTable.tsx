'use client'

import { useState, useCallback } from 'react'
import { Table, Button, Alert } from 'react-bootstrap'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import EmptyState from '@/components/ui/EmptyState'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import CommitteeSortableRow from './CommitteeSortableRow'
import { committeeApi } from '@/lib/api/committee.api'
import type { CommitteeMember } from '@/types/bpa.types'

interface CommitteeTableProps {
  data: CommitteeMember[]
  loading: boolean
  onEdit: (m: CommitteeMember) => void
  onDeleted: () => void
  onReordered: (items: CommitteeMember[]) => void
}

export default function CommitteeTable({ data, loading, onEdit, onDeleted, onReordered }: CommitteeTableProps) {
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = data.findIndex((m) => m.id === active.id)
      const newIndex = data.findIndex((m) => m.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      const reordered = arrayMove(data, oldIndex, newIndex)
      onReordered(reordered) // optimistic update

      setSaving(true)
      setSaveError(null)
      try {
        await committeeApi.reorder({
          items: reordered.map((m, idx) => ({ id: m.id, sortOrder: idx })),
        })
      } catch {
        setSaveError('Failed to save order. Please try again.')
        onReordered(data) // rollback
      } finally {
        setSaving(false)
      }
    },
    [data, onReordered],
  )

  return (
    <div>
      {saveError && (
        <Alert variant="danger" dismissible onClose={() => setSaveError(null)}>
          {saveError}
        </Alert>
      )}
      {saving && <p className="text-muted small mb-2">Saving order…</p>}

      <LoadingOverlay loading={loading}>
        <div className="table-responsive">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 40 }} />
                  <th>Member</th>
                  <th>Email</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        icon="solar:users-group-rounded-bold-duotone"
                        title="No committee members"
                        description="Add the first member to build the committee."
                      />
                    </td>
                  </tr>
                ) : (
                  <SortableContext items={data.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                    {data.map((member) => (
                      <CommitteeSortableRow
                        key={member.id}
                        member={member}
                        onEdit={onEdit}
                        onDeleted={onDeleted}
                        onToggled={onDeleted}
                      />
                    ))}
                  </SortableContext>
                )}
              </tbody>
            </Table>
          </DndContext>
        </div>
      </LoadingOverlay>
    </div>
  )
}
