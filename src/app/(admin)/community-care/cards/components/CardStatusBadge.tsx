import { Badge } from 'react-bootstrap'
import type { CarePartnerCardStatus } from '@/types/bpa.types'

const MAP: Record<CarePartnerCardStatus, { bg: string; label: string }> = {
  active: { bg: 'success', label: 'Active' },
  pending: { bg: 'warning', label: 'Pending' },
  expired: { bg: 'secondary', label: 'Expired' },
  revoked: { bg: 'danger', label: 'Revoked' },
}

export default function CardStatusBadge({ status }: { status: CarePartnerCardStatus }) {
  const { bg, label } = MAP[status] ?? { bg: 'secondary', label: status }
  return (
    <Badge bg={`${bg}-subtle`} text={bg}>
      {label}
    </Badge>
  )
}
