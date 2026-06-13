'use client'

import { Badge } from 'react-bootstrap'
import type { EmailStatus } from '@/types/bpa.types'

const MAP: Record<EmailStatus, { bg: string; label: string }> = {
  queued:    { bg: 'secondary', label: 'Queued' },
  sent:      { bg: 'primary',   label: 'Sent' },
  delivered: { bg: 'success',   label: 'Delivered' },
  failed:    { bg: 'danger',    label: 'Failed' },
  bounced:   { bg: 'warning',   label: 'Bounced' },
  spam:      { bg: 'dark',      label: 'Spam' },
}

export default function EmailStatusBadge({ status }: { status: EmailStatus }) {
  const { bg, label } = MAP[status] ?? { bg: 'secondary', label: status }
  return <Badge bg={bg}>{label}</Badge>
}
