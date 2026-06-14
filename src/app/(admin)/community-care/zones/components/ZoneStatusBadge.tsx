import { Badge } from 'react-bootstrap'
import type { CommunityZoneStatus } from '@/types/bpa.types'

const MAP: Record<CommunityZoneStatus, { bg: string; label: string }> = {
  active: { bg: 'success', label: 'Active' },
  inactive: { bg: 'secondary', label: 'Inactive' },
  coming_soon: { bg: 'warning', label: 'Coming Soon' },
}

export default function ZoneStatusBadge({ status }: { status: CommunityZoneStatus }) {
  const { bg, label } = MAP[status] ?? { bg: 'secondary', label: status }
  return <Badge bg={`${bg}-subtle`} text={bg}>{label}</Badge>
}
