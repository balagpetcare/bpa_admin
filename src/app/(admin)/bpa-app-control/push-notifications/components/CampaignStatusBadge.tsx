'use client'

import { Badge } from 'react-bootstrap'
import type { CampaignStatus } from '@/lib/api/push-notifications.api'

const VARIANT: Record<CampaignStatus, string> = {
  draft: 'secondary',
  pending_approval: 'warning',
  scheduled: 'info',
  sending: 'primary',
  sent: 'success',
  cancelled: 'dark',
  failed: 'danger',
}

export default function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <Badge bg={VARIANT[status] ?? 'secondary'} className="text-capitalize">
      {status.replace('_', ' ')}
    </Badge>
  )
}
