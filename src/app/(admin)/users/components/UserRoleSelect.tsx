'use client'

import ReactSelect from 'react-select'
import { FormLabel } from 'react-bootstrap'
import type { Role } from '@/types/bpa.types'

interface UserRoleSelectProps {
  roles: Role[]
  value: string[]
  onChange: (ids: string[]) => void
  isLoading?: boolean
}

export default function UserRoleSelect({ roles, value, onChange, isLoading }: UserRoleSelectProps) {
  const options = roles.map((r) => ({ value: r.id, label: r.name }))
  const selected = options.filter((o) => value.includes(o.value))

  return (
    <div>
      <FormLabel>Roles</FormLabel>
      <ReactSelect
        isMulti
        options={options}
        value={selected}
        onChange={(opts) => onChange(opts.map((o) => o.value))}
        isLoading={isLoading}
        classNamePrefix="react-select"
        placeholder="Select roles..."
      />
    </div>
  )
}
