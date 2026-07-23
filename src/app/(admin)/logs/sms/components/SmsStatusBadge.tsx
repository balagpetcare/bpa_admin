'use client'

import { Badge } from 'react-bootstrap'
import type { SmsStatus } from '@/types/bpa.types'

const STATUS_CONFIG: Record<SmsStatus, { bg: string; label: string }> = {
  queued: { bg: 'secondary', label: 'Queued' },
  sending: { bg: 'info', label: 'Sending' },
  sent: { bg: 'success', label: 'Sent' },
  delivered: { bg: 'success', label: 'Delivered' },
  failed: { bg: 'danger', label: 'Failed' },
  undelivered: { bg: 'warning', label: 'Undelivered' },
  cancelled: { bg: 'dark', label: 'Cancelled' },
  skipped: { bg: 'light', label: 'Skipped' },
}

export default function SmsStatusBadge({ status }: { status: SmsStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { bg: 'secondary', label: status }
  return <Badge bg={cfg.bg}>{cfg.label}</Badge>
}
