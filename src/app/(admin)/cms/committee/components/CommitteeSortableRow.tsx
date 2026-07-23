'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import CommitteeActiveToggle from './CommitteeActiveToggle'
import { confirmDelete } from '@/components/ui/ConfirmDialog'
import { usePermission } from '@/hooks/usePermission'
import { committeeApi } from '@/lib/api/committee.api'
import type { CommitteeMember } from '@/types/bpa.types'

interface CommitteeSortableRowProps {
  member: CommitteeMember
  onEdit: (m: CommitteeMember) => void
  onDeleted: () => void
  onToggled: () => void
}

export default function CommitteeSortableRow({ member, onEdit, onDeleted, onToggled }: CommitteeSortableRowProps) {
  const { can } = usePermission()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: member.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? '#f8f9fa' : undefined,
  }

  return (
    <tr ref={setNodeRef} style={style}>
      <td style={{ width: 40 }}>
        <span {...attributes} {...listeners} style={{ cursor: 'grab', touchAction: 'none' }} title="Drag to reorder" className="text-muted">
          <Icon icon="solar:sort-vertical-bold" style={{ fontSize: 20 }} />
        </span>
      </td>
      <td>
        <div className="d-flex align-items-center gap-2">
          {member.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.photoUrl}
              alt={member.name}
              className="rounded-circle"
              style={{ width: 36, height: 36, objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div
              className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
              style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>
              {member.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="fw-semibold">{member.name}</div>
            <div className="text-muted small">{member.designation}</div>
          </div>
        </div>
      </td>
      <td className="text-muted small">{member.email ?? '—'}</td>
      <td>
        <CommitteeActiveToggle member={member} onToggled={onToggled} />
      </td>
      <td>
        <div className="d-flex gap-1">
          {can('committee:update') && (
            <Button variant="soft-primary" size="sm" onClick={() => onEdit(member)} title="Edit">
              <Icon icon="solar:pen-bold" />
            </Button>
          )}
          {can('committee:delete') && (
            <Button
              variant="soft-danger"
              size="sm"
              title="Delete"
              onClick={async () => {
                const ok = await confirmDelete(member.name)
                if (ok) {
                  await committeeApi.remove(member.id)
                  onDeleted()
                }
              }}>
              <Icon icon="solar:trash-bin-trash-bold" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}
