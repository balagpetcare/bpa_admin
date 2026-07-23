import { Badge } from 'react-bootstrap'
import type { PetCensusStatus } from '@/types/bpa.types'

const MAP: Record<PetCensusStatus, { bg: string; label: string }> = {
  new: { bg: 'primary', label: 'New' },
  contacted: { bg: 'info', label: 'Contacted' },
  converted: { bg: 'success', label: 'Converted' },
  archived: { bg: 'secondary', label: 'Archived' },
  submitted: { bg: 'primary', label: 'Submitted' },
  verified: { bg: 'success', label: 'Verified' },
  duplicate: { bg: 'warning', label: 'Duplicate' },
}

export default function CensusStatusBadge({ status }: { status: PetCensusStatus }) {
  const { bg, label } = MAP[status] ?? { bg: 'secondary', label: status }
  return (
    <Badge bg={`${bg}-subtle`} text={bg}>
      {label}
    </Badge>
  )
}
