import { Badge } from 'react-bootstrap'
import type { RoadmapItemStatus } from '@/types/bpa.types'

const MAP: Record<RoadmapItemStatus, { bg: string; label: string }> = {
  PLANNED: { bg: 'secondary', label: 'Planned' },
  IN_PROGRESS: { bg: 'warning', label: 'In Progress' },
  LIVE: { bg: 'success', label: 'Live' },
}

export default function RoadmapItemStatusBadge({ status }: { status: RoadmapItemStatus }) {
  const { bg, label } = MAP[status] ?? { bg: 'secondary', label: status }
  return <Badge bg={`${bg}-subtle`} text={bg}>{label}</Badge>
}
