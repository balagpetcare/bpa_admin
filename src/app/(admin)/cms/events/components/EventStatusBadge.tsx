'use client'

import { Badge } from 'react-bootstrap'
import type { EventStatus } from '@/types/bpa.types'

const MAP: Record<EventStatus, { bg: string; label: string }> = {
  draft: { bg: 'secondary', label: 'Draft' },
  published: { bg: 'success', label: 'Published' },
  cancelled: { bg: 'danger', label: 'Cancelled' },
}

export default function EventStatusBadge({ status }: { status: EventStatus }) {
  const { bg, label } = MAP[status] ?? { bg: 'secondary', label: status }
  return <Badge bg={bg}>{label}</Badge>
}
