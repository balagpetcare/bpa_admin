'use client'

import { Badge } from 'react-bootstrap'
import type { SmsStatus } from '@/types/bpa.types'

const MAP: Record<SmsStatus, { bg: string; label: string }> = {
  queued:      { bg: 'secondary', label: 'Queued' },
  sent:        { bg: 'primary',   label: 'Sent' },
  delivered:   { bg: 'success',   label: 'Delivered' },
  failed:      { bg: 'danger',    label: 'Failed' },
  undelivered: { bg: 'warning',   label: 'Undelivered' },
}

export default function SmsStatusBadge({ status }: { status: SmsStatus }) {
  const { bg, label } = MAP[status] ?? { bg: 'secondary', label: status }
  return <Badge bg={bg}>{label}</Badge>
}
