'use client'

import { Badge } from 'react-bootstrap'

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light'

const STATUS_MAP: Record<string, Variant> = {
  // News
  draft: 'secondary',
  published: 'success',
  archived: 'dark',
  // Events
  cancelled: 'danger',
  // Volunteers / Registrations
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  confirmed: 'success',
  // Contacts
  unread: 'danger',
  read: 'secondary',
  replied: 'success',
  // Payments
  success: 'success',
  failed: 'danger',
  refunded: 'info',
  // Users
  active: 'success',
  inactive: 'secondary',
}

interface StatusBadgeProps {
  status: string
  label?: string
  variant?: Variant
}

export default function StatusBadge({ status, label, variant }: StatusBadgeProps) {
  const resolved = variant ?? STATUS_MAP[status] ?? 'secondary'
  return (
    <Badge bg={resolved} className="text-capitalize">
      {label ?? status}
    </Badge>
  )
}
