'use client'

import { Badge } from 'react-bootstrap'
import type { ContactStatus } from '@/types/bpa.types'

const MAP: Record<ContactStatus, { bg: string; label: string }> = {
  unread:  { bg: 'danger',    label: 'Unread' },
  read:    { bg: 'secondary', label: 'Read' },
  replied: { bg: 'success',   label: 'Replied' },
}

export default function ContactStatusBadge({ status }: { status: ContactStatus }) {
  const { bg, label } = MAP[status] ?? { bg: 'secondary', label: status }
  return <Badge bg={bg}>{label}</Badge>
}
