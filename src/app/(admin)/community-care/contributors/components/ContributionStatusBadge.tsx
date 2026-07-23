import { Badge } from 'react-bootstrap'
import type { ContributionStatus } from '@/types/bpa.types'

const MAP: Record<ContributionStatus, { bg: string; label: string }> = {
  paid: { bg: 'success', label: 'Paid' },
  pending_payment: { bg: 'warning', label: 'Pending Payment' },
  cancelled: { bg: 'secondary', label: 'Cancelled' },
  refunded: { bg: 'danger', label: 'Refunded' },
}

export default function ContributionStatusBadge({ status }: { status: ContributionStatus }) {
  const { bg, label } = MAP[status] ?? { bg: 'secondary', label: status }
  return (
    <Badge bg={`${bg}-subtle`} text={bg}>
      {label}
    </Badge>
  )
}
