'use client'

import { Icon } from '@iconify/react'
import { ReactNode } from 'react'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: string
  action?: ReactNode
}

// Displayed inside tables/grids when there are no results.
export default function EmptyState({
  title = 'No results found',
  description = 'There are no items to display.',
  icon = 'solar:inbox-out-bold-duotone',
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-5">
      <Icon icon={icon} className="text-muted mb-3" style={{ fontSize: 48 }} />
      <h5 className="text-muted mb-1">{title}</h5>
      <p className="text-muted small mb-3">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
