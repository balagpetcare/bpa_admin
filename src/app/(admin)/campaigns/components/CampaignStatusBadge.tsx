import type { CampaignStatus } from '@/types/bpa.types'

const STATUS_CONFIG: Record<CampaignStatus, { label: string; bg: string; text: string }> = {
  draft: { label: 'Draft', bg: 'secondary', text: 'secondary' },
  published: { label: 'Published', bg: 'info', text: 'info' },
  registration_open: { label: 'Registration Open', bg: 'success', text: 'success' },
  registration_closed: { label: 'Registration Closed', bg: 'warning', text: 'warning' },
  completed: { label: 'Completed', bg: 'primary', text: 'primary' },
  cancelled: { label: 'Cancelled', bg: 'danger', text: 'danger' },
}

export default function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: 'secondary', text: 'secondary' }
  return (
    <span className={`badge bg-${cfg.bg}-subtle text-${cfg.text}`}>{cfg.label}</span>
  )
}
