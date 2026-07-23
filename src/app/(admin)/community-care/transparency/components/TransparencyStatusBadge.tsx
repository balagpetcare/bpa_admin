import { Badge } from 'react-bootstrap'
import type { TransparencyReportStatus } from '@/types/bpa.types'

const MAP: Record<TransparencyReportStatus, { bg: string; label: string }> = {
  draft: { bg: 'secondary', label: 'Draft' },
  published: { bg: 'success', label: 'Published' },
  archived: { bg: 'warning', label: 'Archived' },
}

export default function TransparencyStatusBadge({ status }: { status: TransparencyReportStatus }) {
  const { bg, label } = MAP[status] ?? { bg: 'secondary', label: status }
  return (
    <Badge bg={`${bg}-subtle`} text={bg}>
      {label}
    </Badge>
  )
}
