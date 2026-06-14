'use client'

import { Badge } from 'react-bootstrap'
import type { PaymentStatus } from '@/types/bpa.types'

const MAP: Record<PaymentStatus, { bg: string; label: string }> = {
  pending:  { bg: 'warning',   label: 'Pending' },
  success:  { bg: 'success',   label: 'Success' },
  failed:   { bg: 'danger',    label: 'Failed' },
  refunded: { bg: 'info',      label: 'Refunded' },
}

export default function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { bg, label } = MAP[status] ?? { bg: 'secondary', label: status }
  return <Badge bg={bg}>{label}</Badge>
}
