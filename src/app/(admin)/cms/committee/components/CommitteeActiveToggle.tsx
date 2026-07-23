'use client'

import { Form } from 'react-bootstrap'
import { useApiMutation } from '@/hooks/useApi'
import { committeeApi } from '@/lib/api/committee.api'
import type { CommitteeMember } from '@/types/bpa.types'

interface CommitteeActiveToggleProps {
  member: CommitteeMember
  onToggled: () => void
}

export default function CommitteeActiveToggle({ member, onToggled }: CommitteeActiveToggleProps) {
  const { mutate, loading } = useApiMutation<CommitteeMember, boolean>()

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await mutate((isActive) => committeeApi.update(member.id, { isActive }), e.target.checked)
    onToggled()
  }

  return (
    <Form.Check
      type="switch"
      id={`active-${member.id}`}
      checked={member.isActive}
      onChange={handleChange}
      disabled={loading}
      title={member.isActive ? 'Active — click to deactivate' : 'Inactive — click to activate'}
    />
  )
}
