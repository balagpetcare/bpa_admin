'use client'

import { Badge } from 'react-bootstrap'
import type { VolunteerStatus } from '@/types/bpa.types'

const MAP: Record<VolunteerStatus, { bg: string; label: string }> = {
  pending: { bg: 'warning', label: 'Pending' },
  approved: { bg: 'success', label: 'Approved' },
  rejected: { bg: 'danger', label: 'Rejected' },
}

export default function VolunteerStatusBadge({ status }: { status: VolunteerStatus }) {
  const { bg, label } = MAP[status] ?? { bg: 'secondary', label: status }
  return <Badge bg={bg}>{label}</Badge>
}
